import express, { Request, Response, NextFunction } from 'express';
import { Pool } from 'pg';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import cors from 'cors';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// 1. Initialize Connection Pool for Neon PostgreSQL
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false } // Required securely for Neon cloud hosting
});

// 2. Define Custom TypeScript Interfaces for Requests
export type UserRole = 'CITIZEN' | 'SUB_ADMIN' | 'SUPER_ADMIN';

export interface AuthUser {
  id: number;
  username: string;
  role: UserRole;
  assigned_sector: string | null;
}

// Extend default Express Request type to carry authenticated user details
export interface AuthenticatedRequest extends Request {
  user?: AuthUser;
}

// =========================================================================
// 3. MIDDLEWARE: JSON Web Token Verification & Authorization
// =========================================================================
export const authenticateToken = (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // "Bearer TOKEN_STRING"

  if (!token) {
    res.status(401).json({ error: "Access Denied: No authentication token supplied." });
    return;
  }

  const jwtSecret = (process.env.JWT_SECRET || process.env.AUTH_SECRET || 'nashik-monitor-secure-jwt-key') as string;

  jwt.verify(token, jwtSecret, (err, decoded) => {
    if (err) {
      res.status(403).json({ error: "Access Denied: Revoked or Invalid Session Token." });
      return;
    }
    req.user = decoded as AuthUser;
    next();
  });
};

// Middleware Factory to enforce absolute permissions
export const authorizeRoles = (...allowedRoles: UserRole[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      res.status(403).json({ error: `Unauthorized: Action restricted to roles: [${allowedRoles.join(', ')}]` });
      return;
    }
    next();
  };
};

// =========================================================================
// 4. API ENDPOINTS & LOGIC ROUTING
// =========================================================================

/**
 * @route   GET /api/health
 * @desc    Health check & database pool verification
 */
app.get('/api/health', async (_req: Request, res: Response): Promise<void> => {
  try {
    const dbRes = await pool.query('SELECT NOW()');
    res.status(200).json({ 
      status: 'UP', 
      server: 'Nashik Monitor API Engine', 
      database: 'Connected to Neon PostgreSQL', 
      dbTime: dbRes.rows[0].now 
    });
  } catch (err: any) {
    res.status(500).json({ status: 'DEGRADED', error: err.message });
  }
});

/**
 * @route   POST /api/complaints
 * @desc    Citizen logs a new complaint. Backend automatically checks keywords to route sector.
 * @access  Private (CITIZEN)
 */
app.post('/api/complaints', authenticateToken, authorizeRoles('CITIZEN'), async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { title, description, latitude, longitude } = req.body;
  const citizenId = req.user?.id;

  if (!title || !description || !latitude || !longitude) {
    res.status(400).json({ error: "Missing required geo-metadata or text payload parameters." });
    return;
  }

  // 🛠️ AUTOMATED KEYWORD PARSING ENGINE (Forces routing target securely)
  let assignedSector = 'PUBLIC_WORKS_ROADS'; // Default Fallback
  const textPayload = (title + " " + description).toLowerCase();
  
  if (textPayload.includes('garbage') || textPayload.includes('waste') || textPayload.includes('dump') || textPayload.includes('कचरा')) {
    assignedSector = 'SOLID_WASTE';
  } else if (textPayload.includes('sewer') || textPayload.includes('manhole') || textPayload.includes('drainage') || textPayload.includes('गटर') || textPayload.includes('ड्रेनेज')) {
    assignedSector = 'DRAINAGE_SEWAGE';
  } else if (textPayload.includes('light') || textPayload.includes('pole') || textPayload.includes('electricity') || textPayload.includes('wire') || textPayload.includes('लाइट')) {
    assignedSector = 'ELECTRICAL';
  } else if (textPayload.includes('water') || textPayload.includes('leak') || textPayload.includes('pipe') || textPayload.includes('पाणी')) {
    assignedSector = 'WATER_SUPPLY';
  }

  try {
    const query = `
      INSERT INTO complaints (citizen_id, title, description, latitude, longitude, sector, status, created_at)
      VALUES ($1, $2, $3, $4, $5, $6, 'OPEN', NOW())
      RETURNING *;
    `;
    const result = await pool.query(query, [citizenId, title, description, latitude, longitude, assignedSector]);
    
    res.status(201).json({
      success: true,
      message: `Complaint routed successfully to the ${assignedSector} Department queue.`,
      ticket: result.rows[0]
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Neon Database transaction breakdown." });
  }
});

/**
 * @route   GET /api/admin/dashboard
 * @desc    Fetch structural queues filtered tightly based on user level authorization constraints.
 * @access  Private (SUB_ADMIN, SUPER_ADMIN)
 */
app.get('/api/admin/dashboard', authenticateToken, authorizeRoles('SUB_ADMIN', 'SUPER_ADMIN'), async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const user = req.user!;
  
  try {
    let queries;
    let queryParams: any[] = [];

    if (user.role === 'SUPER_ADMIN') {
      // Super Admin sees absolutely everything across all municipal wards in Nashik
      queries = `SELECT * FROM complaints ORDER BY created_at DESC;`;
    } else {
      // Sub-Admin is locked completely into their explicitly mapped structural department line items
      queries = `SELECT * FROM complaints WHERE sector = $1 ORDER BY created_at DESC;`;
      queryParams.push(user.assigned_sector);
    }

    const result = await pool.query(queries, queryParams);
    res.status(200).json({ role: user.role, total_tickets: result.rowCount, data: result.rows });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to pull administrative logging matrix." });
  }
});

// =========================================================================
// 5. CRON SIMULATION / HOOK: 48-Hour Automated SLA Escalation Engine
// =========================================================================
/**
 * @route   POST /api/admin/check-escalations
 * @desc    Finds open tickets older than 48 hours and auto-escalates them to the Commissioner (Super Admin)
 * @access  Private (SUPER_ADMIN)
 */
app.post('/api/admin/check-escalations', authenticateToken, authorizeRoles('SUPER_ADMIN'), async (_req: Request, res: Response): Promise<void> => {
  try {
    // Select entries where ticket status is open or unresolved, and the timeframe exceeds 48 hours
    const escalationQuery = `
      UPDATE complaints
      SET status = 'ESCALATED_TO_SUPER_ADMIN'
      WHERE status IN ('OPEN', 'ASSIGNED') 
      AND created_at < NOW() - INTERVAL '48 hours'
      RETURNING id, title, sector, created_at;
    `;
    
    const result = await pool.query(escalationQuery);
    
    res.status(200).json({
      success: true,
      message: `SLA Sweep completed. Automated escalation engines fired.`,
      escalated_count: result.rowCount,
      escalated_tickets: result.rows
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "SLA engine sweep failed during processing." });
  }
});

// Start the Backend Node Engine
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`📡 Nashik Monitor Secure API Engine listening on port ${PORT}`));

export default app;
