const express = require('express');
const { Pool } = require('pg');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const cors = require('cors');

dotenv.config({ path: '.env.local' });
dotenv.config({ path: '.env' });

const app = express();
app.use(express.json());
app.use(cors());

// 1. Initialize Connection Pool for Neon PostgreSQL
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || process.env.NEON_DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

const JWT_SECRET = process.env.JWT_SECRET || 'nashik_civic_super_secure_jwt_token_2026';

function getSectorFromCategory(category = '', textPayload = '') {
  const cat = (category || '').toUpperCase();
  const text = (textPayload || '').toLowerCase();

  if (cat.includes('GARBAGE') || cat.includes('WASTE') || text.includes('garbage') || text.includes('waste') || text.includes('dump') || text.includes('कचरा')) {
    return 'SOLID_WASTE';
  }
  if (cat.includes('MANHOLE') || cat.includes('DRAINAGE') || cat.includes('SEWER') || text.includes('sewer') || text.includes('manhole') || text.includes('drainage') || text.includes('गटर') || text.includes('ड्रेनेज')) {
    return 'DRAINAGE_SEWAGE';
  }
  if (cat.includes('WIRE') || cat.includes('LIGHT') || cat.includes('ELECTRICAL') || text.includes('light') || text.includes('pole') || text.includes('electricity') || text.includes('wire') || text.includes('लाइट')) {
    return 'ELECTRICAL';
  }
  if (cat.includes('WATER') || text.includes('water') || text.includes('leak') || text.includes('pipe') || text.includes('पाणी')) {
    return 'WATER_SUPPLY';
  }
  return 'PUBLIC_WORKS_ROADS';
}

// =========================================================================
// 2. MIDDLEWARE: JSON Web Token Verification & Authorization
// =========================================================================

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    res.status(401).json({ error: "Access Denied: Missing cryptographic Bearer token." });
    return;
  }

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      res.status(403).json({ error: "Access Denied: Expired or invalidated authentication credentials." });
      return;
    }
    req.user = decoded;
    next();
  });
};

const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      res.status(403).json({
        error: `Unauthorized: Role '${req.user ? req.user.role : 'UNKNOWN'}' lacks clearance for this sector.`
      });
      return;
    }
    next();
  };
};

// =========================================================================
// 3. API ENDPOINTS & LOGIC ROUTING
// =========================================================================

/**
 * @route   GET /api/health
 */
app.get('/api/health', async (_req, res) => {
  try {
    const dbRes = await pool.query('SELECT NOW()');
    res.status(200).json({ 
      status: 'UP', 
      server: 'Nashik Monitor API Engine', 
      database: 'Connected to Neon PostgreSQL', 
      dbTime: dbRes.rows[0].now 
    });
  } catch (err) {
    res.status(500).json({ status: 'DEGRADED', error: err.message });
  }
});

/**
 * @route   GET /api/complaints
 * @desc    Fetch real complaints from Neon DB tickets table
 */
app.get('/api/complaints', async (req, res) => {
  try {
    const { sector, ward } = req.query;
    const result = await pool.query(`
      SELECT 
        id,
        title,
        description,
        category,
        ward,
        location_name,
        lat as latitude,
        lng as longitude,
        before_image_url,
        after_image_url,
        status,
        citizen_name,
        citizen_email,
        contractor_name,
        upvotes,
        confirm_votes,
        reopen_votes,
        impact_score,
        created_at
      FROM tickets
      ORDER BY created_at DESC;
    `);

    let complaints = result.rows.map(row => {
      const assignedSector = getSectorFromCategory(row.category, `${row.title} ${row.description}`);
      return {
        ...row,
        sector: assignedSector,
        citizen_username: row.citizen_name || row.citizen_email
      };
    });

    if (sector && sector !== 'ALL') {
      complaints = complaints.filter(c => c.sector === sector);
    }
    if (ward && ward !== 'All') {
      complaints = complaints.filter(c => c.ward === ward);
    }

    res.status(200).json({
      success: true,
      total: complaints.length,
      complaints
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * @route   POST /api/complaints
 * @desc    Citizen logs a new complaint. Keyword engine routes to sector.
 */
app.post('/api/complaints', authenticateToken, authorizeRoles('CITIZEN'), async (req, res) => {
  const { title, description, latitude, longitude, ward, locationName, beforeImageUrl } = req.body;
  const citizenName = req.user?.username || 'Verified Citizen';
  const citizenEmail = req.user?.email || 'citizen@nashik.gov.in';

  if (!title || !description || latitude === undefined || longitude === undefined) {
    res.status(400).json({ error: "Missing required geo-metadata or text payload parameters." });
    return;
  }

  const assignedSector = getSectorFromCategory('', `${title} ${description}`);
  const newId = `tkt-${Date.now()}`;
  const defaultWard = ward || 'Panchavati';
  const locName = locationName || `Nashik (${latitude.toFixed(4)}, ${longitude.toFixed(4)})`;

  let category = 'POTHOLE';
  if (assignedSector === 'SOLID_WASTE') category = 'GARBAGE_DUMP';
  else if (assignedSector === 'DRAINAGE_SEWAGE') category = 'OPEN_MANHOLE';
  else if (assignedSector === 'ELECTRICAL') category = 'ELECTRICAL_WIRE';
  else if (assignedSector === 'WATER_SUPPLY') category = 'WATER_LEAKAGE';

  try {
    const insertQuery = `
      INSERT INTO tickets (
        id, title, description, category, ward, location_name, lat, lng,
        before_image_url, status, citizen_name, citizen_email, upvotes,
        confirm_votes, reopen_votes, impact_score, created_at
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8,
        $9, 'SUBMITTED', $10, $11, 1, 0, 0, 100, NOW()
      )
      RETURNING *;
    `;
    const result = await pool.query(insertQuery, [
      newId, title, description, category, defaultWard, locName,
      latitude, longitude,
      beforeImageUrl || 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=800&q=80',
      citizenName, citizenEmail
    ]);
    
    res.status(201).json({
      success: true,
      message: `Complaint routed successfully to the ${assignedSector} Department queue.`,
      ticket: result.rows[0],
      sector: assignedSector
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Neon Database transaction breakdown: " + error.message });
  }
});

/**
 * @route   GET /api/admin/dashboard
 * @desc    Fetch real structural queues from Neon DB tickets table.
 */
app.get('/api/admin/dashboard', authenticateToken, authorizeRoles('SUB_ADMIN', 'SUPER_ADMIN'), async (req, res) => {
  const user = req.user;
  
  try {
    const result = await pool.query(`
      SELECT 
        id,
        title,
        description,
        category,
        ward,
        location_name,
        lat as latitude,
        lng as longitude,
        before_image_url,
        after_image_url,
        status,
        citizen_name,
        citizen_email,
        contractor_name,
        upvotes,
        confirm_votes,
        reopen_votes,
        impact_score,
        created_at
      FROM tickets
      ORDER BY created_at DESC;
    `);

    let data = result.rows.map(row => {
      const assignedSector = getSectorFromCategory(row.category, `${row.title} ${row.description}`);
      return {
        ...row,
        sector: assignedSector,
        citizen_username: row.citizen_name || row.citizen_email
      };
    });

    if (user.role !== 'SUPER_ADMIN' && user.assigned_sector) {
      data = data.filter(item => item.sector === user.assigned_sector);
    }

    res.status(200).json({ role: user.role, total_tickets: data.length, data });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to pull administrative logging matrix." });
  }
});

/**
 * @route   POST /api/admin/check-escalations
 */
app.post('/api/admin/check-escalations', authenticateToken, authorizeRoles('SUPER_ADMIN'), async (_req, res) => {
  try {
    const escalationQuery = `
      UPDATE tickets
      SET status = 'REOPENED', reopen_reason = 'Auto-escalated to Municipal Commissioner: SLA exceeded 48 hours without verified resolution.'
      WHERE status IN ('SUBMITTED', 'VERIFICATION_PENDING') 
      AND created_at < NOW() - INTERVAL '48 hours'
      RETURNING id, title, category, created_at;
    `;

    const result = await pool.query(escalationQuery);

    res.status(200).json({
      success: true,
      message: 'SLA Sweep completed. Automated escalation engines fired.',
      escalated_count: result.rowCount,
      escalated_tickets: result.rows
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Nashik Monitor Backend Engine running on port ${PORT}`);
});
