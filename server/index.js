import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  },
});

app.use(cors());
app.use(express.json({ limit: '20mb' }));

const DB_FILE = path.join(__dirname, 'db_data.json');

// Initial seed tickets
const initialTickets = [
  {
    id: 't-101',
    ticketNumber: 'NMC-2026-4821',
    title: 'Severe Road Collapse & Deep Cave-In',
    titleMr: 'रस्त्यावर मोठा खड्डा आणि रस्ता खचला',
    hazardType: 'ROAD_COLLAPSE',
    ward: 'Panchavati',
    location: 'Gangapur Road, Near K.K. Wagh Circle',
    coordinates: [20.0180, 73.8180],
    status: 'VERIFICATION_PENDING',
    submittedDate: '2 hours ago',
    assignedEngineer: 'Er. M. S. Patil',
    contractorAgency: 'NMC Infra Cell',
    department: 'PWD_ROADS',
    dlpExpiryDate: '24 Months DLP',
    beforePhoto: 'https://images.unsplash.com/photo-1544725121-be3bf52e2dc8?w=600&auto=format&fit=crop&q=80',
    videoUrl: '',
    aiConfidence: 96,
    plusOneCount: 38,
    impactScore: 195,
    riskLevel: 'CRITICAL',
    citizenVotesConfirmed: 14,
    citizenVotesReopened: 1,
    userVerificationState: 'none',
    reporterName: 'Aarav Deshmukh',
    reporterMobile: '9823011223',
    comments: [
      { id: 'c-1', userName: 'Rohit Shinde', userRole: 'CITIZEN', text: 'Facing huge traffic jam here every evening!', timestamp: '1 hour ago' },
      { id: 'c-2', userName: 'Sonal Kulkarni', userRole: 'CITIZEN', text: 'Extremely dangerous for two-wheelers at night.', timestamp: '30 mins ago' }
    ]
  },
  {
    id: 't-102',
    ticketNumber: 'NMC-2026-9104',
    title: 'Burst Water Pipeline & Submersion Hazard',
    titleMr: 'पाणी पाईपलाईन गळती धोका',
    hazardType: 'WATER_LEAKAGE',
    ward: 'Nashik West',
    location: 'College Road, Opp Bhonsala Circle',
    coordinates: [20.0050, 73.7620],
    status: 'IN_PROGRESS',
    submittedDate: '5 hours ago',
    assignedEngineer: 'Er. R. V. Joshi',
    contractorAgency: 'Nashik Jal Nigam',
    department: 'WATER_SUPPLY',
    dlpExpiryDate: '12 Months DLP',
    beforePhoto: 'https://images.unsplash.com/photo-1574482620826-406856a73c3d?w=600&auto=format&fit=crop&q=80',
    videoUrl: '',
    aiConfidence: 92,
    plusOneCount: 29,
    impactScore: 145,
    riskLevel: 'HIGH',
    citizenVotesConfirmed: 8,
    citizenVotesReopened: 0,
    userVerificationState: 'none',
    reporterName: 'Priya Joshi',
    reporterMobile: '9890123456',
    comments: [
      { id: 'c-3', userName: 'Vikas Patil', userRole: 'CITIZEN', text: 'Clean drinking water is wasting continuously!', timestamp: '2 hours ago' }
    ]
  },
  {
    id: 't-103',
    ticketNumber: 'NMC-2026-3392',
    title: 'Hanging High Voltage Electric Wire',
    titleMr: 'विजेची उघडी तार रस्ता धोका',
    hazardType: 'ELECTRICAL_HAZARD',
    ward: 'Cidco',
    location: 'Trimurti Chowk Avenue, Cidco Sector 4',
    coordinates: [19.9690, 73.7620],
    status: 'EVIDENCE_UPLOADED',
    submittedDate: '1 day ago',
    assignedEngineer: 'Er. A. B. Pawar',
    contractorAgency: 'MSEDCL Nashik Electrical',
    department: 'MSEDCL_ELECTRICAL',
    dlpExpiryDate: '36 Months DLP',
    beforePhoto: 'https://images.unsplash.com/photo-1517649763962-0c623266010b?w=600&auto=format&fit=crop&q=80',
    afterPhoto: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=600&auto=format&fit=crop&q=80',
    videoUrl: '',
    aiConfidence: 98,
    plusOneCount: 45,
    impactScore: 230,
    riskLevel: 'CRITICAL',
    autoVanishDaysLeft: 12,
    citizenVotesConfirmed: 22,
    citizenVotesReopened: 2,
    userVerificationState: 'none',
    reporterName: 'Kiran Wagh',
    reporterMobile: '9765432109',
    comments: [
      { id: 'c-4', userName: 'MSEDCL Engineer', userRole: 'ADMIN', text: 'Power isolated and wire re-anchored safely.', timestamp: '4 hours ago' }
    ]
  }
];

const initialProjects = [
  {
    id: 'p-101',
    tenderId: 'NMC-TND-2026-084',
    roadName: 'Gangapur Road Concreting & Storm Drain',
    roadNameMr: 'गंगापूर रस्ता काँक्रिटीकरण व गटार काम',
    ward: 'Panchavati',
    state: 'CONCRETING',
    contractor: 'L&T Smart Infra Nashik',
    budgetInr: '₹ 4.80 Cr',
    dlpPeriod: '36 Months DLP',
    startDate: '15 Jan 2026',
    expectedCompletion: '30 Oct 2026',
    coordinates: [20.0180, 73.8180],
    progressPhoto: 'https://images.unsplash.com/photo-1541888946425-d0fbb186a5b2?w=600&auto=format&fit=crop&q=80',
    description: 'Major white-topping concreting work with underground storm water drainage line.'
  },
  {
    id: 'p-102',
    tenderId: 'NMC-TND-2026-119',
    roadName: 'College Road Asphalt Resurfacing',
    roadNameMr: 'कॉलेज रोड डांबरीकरण काम',
    ward: 'Nashik West',
    state: 'CURING',
    contractor: 'Patil Infrastructure Pvt Ltd',
    budgetInr: '₹ 2.25 Cr',
    dlpPeriod: '24 Months DLP',
    startDate: '01 Feb 2026',
    expectedCompletion: '15 Nov 2026',
    coordinates: [20.0050, 73.7620],
    progressPhoto: 'https://images.unsplash.com/photo-1584467735871-8e85353a8413?w=600&auto=format&fit=crop&q=80',
    description: 'Heavy duty dense bituminous asphalt resurfacing.'
  }
];

const initialUsers = [
  { id: 'u-1', name: 'Aarav Deshmukh', mobile: '9823011223', email: 'aarav@gmail.com', role: 'CITIZEN', ward: 'Panchavati' },
  { id: 'u-2', name: 'Priya Joshi', mobile: '9890123456', email: 'priya@gmail.com', role: 'CITIZEN', ward: 'Nashik West' },
  { id: 'u-admin', name: 'Er. M. S. Patil (Executive Admin)', mobile: '9999999999', email: 'admin@nashik.gov.in', role: 'ADMIN', ward: 'All Wards' }
];

// Helper to load DB from file
function loadDatabase() {
  try {
    if (fs.existsSync(DB_FILE)) {
      const raw = fs.readFileSync(DB_FILE, 'utf-8');
      const parsed = JSON.parse(raw);
      if (!parsed.projects) parsed.projects = initialProjects;
      return parsed;
    }
  } catch (err) {
    console.error('Error reading db_data.json:', err);
  }
  const defaultDb = { tickets: initialTickets, users: initialUsers, projects: initialProjects };
  saveDatabase(defaultDb);
  return defaultDb;
}

// Helper to save DB to file
function saveDatabase(data) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error writing to db_data.json:', err);
  }
}

// Memory db cache
let db = loadDatabase();

// --- REST API ENDPOINTS ---

// GET /api/tickets - Fetch all tickets
app.get('/api/tickets', (req, res) => {
  res.json(db.tickets);
});

// POST /api/complaints - Register new complaint
app.post('/api/complaints', (req, res) => {
  const body = req.body;
  const newTicket = {
    id: body.id || `t-${Date.now()}`,
    ticketNumber: body.ticketNumber || `NMC-2026-${Math.floor(1000 + Math.random() * 9000)}`,
    title: body.title || 'Civic Problem Reported',
    titleMr: body.titleMr || 'नागरी धोका नोंदवला',
    hazardType: body.hazardType || 'POTHOLE',
    ward: body.ward || 'Panchavati',
    location: body.location || 'Nashik City',
    coordinates: body.coordinates || [20.0050, 73.7800],
    status: 'VERIFICATION_PENDING',
    submittedDate: 'Just Now',
    assignedEngineer: 'Er. M. S. Patil',
    contractorAgency: 'NMC Smart Rapid Cell',
    department: body.department || 'PWD_ROADS',
    dlpExpiryDate: '36 Months DLP',
    beforePhoto: body.beforePhoto || 'https://images.unsplash.com/photo-1544725121-be3bf52e2dc8?w=600&auto=format&fit=crop&q=80',
    videoUrl: body.videoUrl || '',
    aiConfidence: body.aiConfidence || 95,
    plusOneCount: body.plusOneCount || 1,
    impactScore: body.impactScore || 10,
    riskLevel: body.riskLevel || 'LOW',
    citizenVotesConfirmed: 0,
    citizenVotesReopened: 0,
    userVerificationState: 'none',
    reporterName: body.reporterName || 'Citizen Reporter',
    reporterMobile: body.reporterMobile || '',
    comments: body.comments || []
  };

  db.tickets.unshift(newTicket);
  saveDatabase(db);

  // Broadcast Real-time event
  io.emit('new_complaint', newTicket);

  console.log(`✅ New Complaint saved in backend DB: ${newTicket.ticketNumber} (${newTicket.title})`);
  res.status(201).json(newTicket);
});

// POST /api/tickets/:id/plus-one - Citizen upvote
app.post('/api/tickets/:id/plus-one', (req, res) => {
  const { id } = req.params;
  const { userName } = req.body;

  const ticket = db.tickets.find((t) => t.id === id);
  if (!ticket) {
    return res.status(404).json({ error: 'Ticket not found' });
  }

  ticket.plusOneCount = (ticket.plusOneCount || 0) + 1;
  ticket.impactScore = (ticket.impactScore || 0) + 5;
  if (ticket.impactScore > 100) {
    ticket.riskLevel = 'CRITICAL';
  } else if (ticket.impactScore > 40) {
    ticket.riskLevel = 'HIGH';
  }

  saveDatabase(db);
  io.emit('ticket_updated', ticket);

  console.log(`👍 +1 Upvote recorded in backend DB for ticket ${id} by ${userName || 'Citizen'}`);
  res.json(ticket);
});

// POST /api/tickets/:id/comments - Add citizen comment
app.post('/api/tickets/:id/comments', (req, res) => {
  const { id } = req.params;
  const { userName, userRole, text } = req.body;

  const ticket = db.tickets.find((t) => t.id === id);
  if (!ticket) {
    return res.status(404).json({ error: 'Ticket not found' });
  }

  const newComment = {
    id: `c-${Date.now()}`,
    userName: userName || 'Citizen',
    userRole: userRole || 'CITIZEN',
    text,
    timestamp: 'Just now'
  };

  if (!ticket.comments) ticket.comments = [];
  ticket.comments.push(newComment);

  saveDatabase(db);
  io.emit('ticket_updated', ticket);

  console.log(`💬 New comment added in backend DB for ticket ${id}`);
  res.json(newComment);
});

// PATCH /api/tickets/:id/resolve - Admin resolve with proof photo
app.patch('/api/tickets/:id/resolve', (req, res) => {
  const { id } = req.params;
  const { proofPhotoUrl, resolutionNotes } = req.body;

  const ticket = db.tickets.find((t) => t.id === id);
  if (!ticket) {
    return res.status(404).json({ error: 'Ticket not found' });
  }

  ticket.status = 'EVIDENCE_UPLOADED';
  if (proofPhotoUrl) ticket.afterPhoto = proofPhotoUrl;
  ticket.autoVanishDaysLeft = 15;

  if (resolutionNotes) {
    if (!ticket.comments) ticket.comments = [];
    ticket.comments.push({
      id: `c-res-${Date.now()}`,
      userName: 'Municipal Officer',
      userRole: 'ADMIN',
      text: `RESOLUTION PROOF SUBMITTED: ${resolutionNotes}`,
      timestamp: 'Just now'
    });
  }

  saveDatabase(db);
  io.emit('ticket_updated', ticket);

  console.log(`🛡️ Admin resolved ticket ${id} in backend DB`);
  res.json(ticket);
});

// POST /api/tickets/:id/vote - Citizen audit verification (Reporter Only)
app.post('/api/tickets/:id/vote', (req, res) => {
  const { id } = req.params;
  const { action, userName, userMobile } = req.body;

  const ticket = db.tickets.find((t) => t.id === id);
  if (!ticket) {
    return res.status(404).json({ error: 'Ticket not found' });
  }

  // Reporter Authorization Validation
  if (ticket.reporterName && userName) {
    const isNameMatch = ticket.reporterName.trim().toLowerCase() === userName.trim().toLowerCase();
    const isMobileMatch = userMobile && ticket.reporterMobile && ticket.reporterMobile === userMobile;
    if (!isNameMatch && !isMobileMatch) {
      return res.status(403).json({ 
        error: `Authorization Error: Only the original reporter (${ticket.reporterName}) can perform citizen verification and close this ticket.` 
      });
    }
  }

  if (action === 'confirm') {
    ticket.citizenVotesConfirmed = (ticket.citizenVotesConfirmed || 0) + 1;
    ticket.userVerificationState = 'confirmed';
    ticket.status = 'CLOSED_VERIFIED';
    ticket.autoVanishDaysLeft = 15;
  } else {
    ticket.citizenVotesReopened = (ticket.citizenVotesReopened || 0) + 1;
    ticket.userVerificationState = 'reopened';
    ticket.status = 'REOPENED_ESCALATED';
  }

  saveDatabase(db);
  io.emit('ticket_updated', ticket);

  res.json(ticket);
});

// GET /api/tickets/track/:ticketNumber - Ticket Tracking Lookup (TC-08)
app.get('/api/tickets/track/:ticketNumber', (req, res) => {
  const { ticketNumber } = req.params;
  const ticket = db.tickets.find(
    (t) => t.ticketNumber.toLowerCase() === ticketNumber.toLowerCase() || t.id.toLowerCase() === ticketNumber.toLowerCase()
  );
  if (!ticket) {
    return res.status(404).json({ error: `No complaint found with tracking code '${ticketNumber}'` });
  }
  res.json(ticket);
});

// --- ROAD PROJECTS ENDPOINTS (TC-03 & TC-05) ---

// GET /api/projects - Fetch road projects
app.get('/api/projects', (req, res) => {
  const { ward } = req.query;
  let projectsList = db.projects || initialProjects;
  if (ward && ward !== 'All Wards') {
    projectsList = projectsList.filter((p) => p.ward === ward);
  }
  res.json(projectsList);
});

// POST /api/projects - Create new road project (TC-03)
app.post('/api/projects', (req, res) => {
  const body = req.body;
  const newProject = {
    id: body.id || `p-${Date.now()}`,
    tenderId: body.tenderId || `NMC-TND-2026-${Math.floor(100 + Math.random() * 900)}`,
    roadName: body.roadName || 'New Road Project',
    roadNameMr: body.roadNameMr || 'नवीन रस्ता काम',
    ward: body.ward || 'Panchavati',
    state: body.state || 'TRENCHING',
    contractor: body.contractor || 'NMC PWD Contractor',
    budgetInr: body.budgetInr || '₹ 1.50 Cr',
    dlpPeriod: body.dlpPeriod || '36 Months DLP',
    startDate: body.startDate || 'Just Started',
    expectedCompletion: body.expectedCompletion || 'Dec 2026',
    coordinates: body.coordinates || [20.0050, 73.7800],
    progressPhoto: body.progressPhoto || 'https://images.unsplash.com/photo-1541888946425-d0fbb186a5b2?w=600&auto=format&fit=crop&q=80',
    description: body.description || 'Road construction & DLP tracked project.'
  };

  if (!db.projects) db.projects = [];
  db.projects.unshift(newProject);
  saveDatabase(db);

  io.emit('project_created', newProject);
  console.log(`🛣️ New Road Project created: ${newProject.tenderId} - ${newProject.roadName}`);
  res.status(201).json(newProject);
});

// PATCH /api/projects/:id/status - Transition project status (TC-05)
app.patch('/api/projects/:id/status', (req, res) => {
  const { id } = req.params;
  const { state } = req.body;

  if (!db.projects) db.projects = [];
  const project = db.projects.find((p) => p.id === id);
  if (!project) {
    return res.status(404).json({ error: 'Road Project not found' });
  }

  project.state = state;
  saveDatabase(db);

  io.emit('project_updated', project);
  console.log(`🔄 Road Project status updated: ${project.tenderId} -> ${state}`);
  res.json(project);
});

// GET /api/sla/breaches - SLA Breach Detection (TC-09)
app.get('/api/sla/breaches', (req, res) => {
  const breachedTickets = db.tickets.filter(
    (t) => t.status === 'REOPENED_ESCALATED' || (t.impactScore || 0) > 100 || t.status === 'VERIFICATION_PENDING'
  ).map((t) => ({
    ...t,
    isSlaBreached: true,
    slaTargetHours: 48,
    elapsedHours: 72,
    slaStatus: 'CRITICAL_SLA_BREACH'
  }));

  res.json({
    totalBreaches: breachedTickets.length,
    breachedTickets
  });
});

// GET /api/reports/export - Ward-wise Report CSV Export (TC-10)
app.get('/api/reports/export', (req, res) => {
  const { ward, format } = req.query;
  const filteredTickets = db.tickets.filter((t) => !ward || ward === 'All Wards' || t.ward === ward);
  const filteredProjects = (db.projects || []).filter((p) => !ward || ward === 'All Wards' || p.ward === ward);

  const csvHeader = 'ID,TicketNumber,Title,Ward,Department,Status,ImpactScore,ReporterName\n';
  const csvRows = filteredTickets.map(
    (t) => `"${t.id}","${t.ticketNumber}","${t.title}","${t.ward}","${t.department}","${t.status}",${t.impactScore || 0},"${t.reporterName || 'Citizen'}"`
  ).join('\n');

  const csvContent = csvHeader + csvRows;

  if (format === 'csv') {
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=Nashik_Civic_Report_${ward || 'All'}.csv`);
    return res.send(csvContent);
  }

  res.json({
    ward: ward || 'All Wards',
    totalComplaints: filteredTickets.length,
    totalProjects: filteredProjects.length,
    csvPreview: csvContent,
    tickets: filteredTickets,
    projects: filteredProjects
  });
});

// --- AUTH & USER ENDPOINTS ---

// GET /api/users - Fetch registered users (Admin only view)
app.get('/api/users', (req, res) => {
  res.json(db.users);
});

// POST /api/auth/register - Register new user
app.post('/api/auth/register', (req, res) => {
  const { name, mobile, email, ward } = req.body;

  if (!mobile && !email) {
    return res.status(400).json({ error: 'Mobile number or email required' });
  }

  let existingUser = db.users.find(u => (mobile && u.mobile === mobile) || (email && u.email === email));
  if (existingUser) {
    return res.json(existingUser);
  }

  const newUser = {
    id: `u-${Date.now()}`,
    name: name || 'Citizen User',
    mobile: mobile || '',
    email: email || '',
    role: 'CITIZEN',
    ward: ward || 'Panchavati'
  };

  db.users.push(newUser);
  saveDatabase(db);

  console.log(`👤 New Citizen registered in DB: ${newUser.name} (${newUser.mobile || newUser.email})`);
  res.status(201).json(newUser);
});

// POST /api/auth/login - Login user
app.post('/api/auth/login', (req, res) => {
  const { identifier, role } = req.body;

  // Check if admin login requested
  if (role === 'ADMIN' || identifier === 'admin@nashik.gov.in' || identifier === '9999999999') {
    const adminUser = db.users.find(u => u.role === 'ADMIN') || {
      id: 'u-admin',
      name: 'Er. M. S. Patil (Municipal Officer)',
      mobile: '9999999999',
      email: 'admin@nashik.gov.in',
      role: 'ADMIN',
      ward: 'All Wards'
    };
    return res.json(adminUser);
  }

  // Citizen login search
  let user = db.users.find(u => u.mobile === identifier || u.email === identifier);
  if (!user) {
    // Auto-create citizen user on first login
    user = {
      id: `u-${Date.now()}`,
      name: identifier.includes('@') ? identifier.split('@')[0] : `Citizen (${identifier})`,
      mobile: identifier.includes('@') ? '' : identifier,
      email: identifier.includes('@') ? identifier : '',
      role: 'CITIZEN',
      ward: 'Panchavati'
    };
    db.users.push(user);
    saveDatabase(db);
  }

  res.json(user);
});

// WebSocket Connection handler
io.on('connection', (socket) => {
  console.log('⚡ Client connected to Real-Time Socket.io:', socket.id);
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Nashik Civic Real-Time Persistent API server running on http://localhost:${PORT}`);
  console.log(`💾 Data stored permanently in: ${DB_FILE}`);
});
