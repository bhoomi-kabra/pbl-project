import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import pkg from 'pg';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '.env') });
dotenv.config();

const { Pool } = pkg;
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
  },
});

app.use(cors());
app.use(express.json());

// Supabase Cloud PostgreSQL Connection String
const connectionString = process.env.DATABASE_URL || 'postgresql://postgres:NashikCivic2026!@db.qgxstuoaygrdpcnotswz.supabase.co:5432/postgres';

const pool = new Pool({
  connectionString,
  ssl: { rejectUnauthorized: false }, // Required for Supabase SSL connection
});

// Test Database Connection
pool.connect((err, client, release) => {
  if (err) {
    console.warn('⚠️ Supabase Cloud PostgreSQL Warning:', err.message);
    console.log('ℹ️ Running server with real-time socket fallback.');
  } else {
    console.log('✅ Connected to Supabase Cloud PostgreSQL Database (qgxstuoaygrdpcnotswz)!');
    release();
  }
});

// GET /api/projects - Fetch all road projects
app.get('/api/projects', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM road_projects ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/tickets - Fetch all civic tickets
app.get('/api/tickets', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM civic_tickets ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/complaints - Insert new complaint and broadcast via WebSocket
app.post('/api/complaints', async (req, res) => {
  const {
    ticketNumber,
    title,
    titleMr,
    hazardType,
    ward,
    location,
    coordinates,
    beforePhoto,
    aiConfidence,
  } = req.body;

  const lat = coordinates ? coordinates[0] : 20.0050;
  const lng = coordinates ? coordinates[1] : 73.7800;

  try {
    const query = `
      INSERT INTO civic_tickets 
      (ticket_number, title, title_mr, hazard_type, ward, location, lat, lng, status, submitted_date, assigned_engineer, contractor_agency, before_photo, ai_confidence)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'VERIFICATION_PENDING', 'Just Now', 'Er. M. S. Patil', 'NMC Rapid Cell', $9, $10)
      RETURNING *;
    `;

    const values = [
      ticketNumber || `NMC-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      title || 'Civic Hazard Reported',
      titleMr || 'नागरी धोका नोंदवला',
      hazardType || 'POTHOLE',
      ward || 'Panchavati',
      location || 'Nashik City',
      lat,
      lng,
      beforePhoto || 'https://images.unsplash.com/photo-1544725121-be3bf52e2dc8?w=600&auto=format&fit=crop&q=80',
      aiConfidence || 95,
    ];

    const result = await pool.query(query, values);
    const newTicket = result.rows[0];

    // Broadcast new complaint in Real-Time to all connected clients
    io.emit('new_complaint', newTicket);

    res.status(201).json(newTicket);
  } catch (error) {
    console.warn('PostgreSQL note:', error.message);
    io.emit('new_complaint', req.body);
    res.status(200).json({ status: 'broadcasted', payload: req.body });
  }
});

// POST /api/tickets/:id/vote - Citizen confirmation vote
app.post('/api/tickets/:id/vote', async (req, res) => {
  const { id } = req.params;
  const { action } = req.body;

  try {
    let query = '';
    if (action === 'confirm') {
      query = `UPDATE civic_tickets SET citizen_votes_confirmed = citizen_votes_confirmed + 1, status = 'CLOSED_VERIFIED' WHERE id = $1 RETURNING *`;
    } else {
      query = `UPDATE civic_tickets SET citizen_votes_reopened = citizen_votes_reopened + 1, status = 'REOPENED_ESCALATED' WHERE id = $1 RETURNING *`;
    }

    const result = await pool.query(query, [id]);
    const updatedTicket = result.rows[0];

    io.emit('ticket_updated', updatedTicket);

    res.json(updatedTicket);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// WebSocket Connection handler
io.on('connection', (socket) => {
  console.log('⚡ Client connected to Supabase Real-Time WebSockets:', socket.id);

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Nashik Civic Real-Time PostgreSQL API running on http://localhost:${PORT}`);
  console.log(`📡 Database URI: ${connectionString.replace(/:[^:@]+@/, ':****@')}`);
});
