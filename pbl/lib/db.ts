import { neon } from '@neondatabase/serverless';
import { Ticket, RoadProject, UserProfile, RoadWorkPhase, UserRole, Ward } from './types';
import { INITIAL_TICKETS, INITIAL_PROJECTS, INITIAL_USERS } from './mockData';

const databaseUrl = process.env.DATABASE_URL || process.env.NEON_DATABASE_URL;

// Direct Neon SQL client if connection string is configured
const sql = databaseUrl ? neon(databaseUrl) : null;

// In-memory fallback cache to allow seamless offline/demo run without database URL
let memoryTickets: Ticket[] = [...INITIAL_TICKETS];
let memoryProjects: RoadProject[] = [...INITIAL_PROJECTS];
let memoryUsers: UserProfile[] = [...INITIAL_USERS];

let tablesInitialized = false;

/**
 * Initializes the Neon PostgreSQL database schema if connecting directly to Neon.
 */
export async function initializeDatabase() {
  if (!sql) {
    return { status: 'mock', message: 'Running on in-memory store (DATABASE_URL not set).' };
  }

  if (tablesInitialized) {
    return { status: 'connected', message: 'Tables already initialized.' };
  }

  try {
    // Direct SQL DDL for Neon PostgreSQL
    await sql`
      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR(64) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        avatar TEXT,
        role VARCHAR(32) NOT NULL DEFAULT 'CITIZEN',
        ward VARCHAR(64),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS tickets (
        id VARCHAR(64) PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT NOT NULL,
        category VARCHAR(64) NOT NULL,
        ward VARCHAR(64) NOT NULL,
        location_name VARCHAR(255) NOT NULL,
        lat DOUBLE PRECISION NOT NULL,
        lng DOUBLE PRECISION NOT NULL,
        before_image_url TEXT NOT NULL,
        after_image_url TEXT,
        status VARCHAR(64) NOT NULL DEFAULT 'SUBMITTED',
        citizen_name VARCHAR(255) NOT NULL,
        citizen_email VARCHAR(255) NOT NULL,
        contractor_name VARCHAR(255),
        contractor_id VARCHAR(64),
        tender_id VARCHAR(64),
        upvotes INT DEFAULT 0,
        confirm_votes INT DEFAULT 0,
        reopen_votes INT DEFAULT 0,
        impact_score INT DEFAULT 0,
        reopen_reason TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        resolved_at TIMESTAMP WITH TIME ZONE,
        closed_at TIMESTAMP WITH TIME ZONE
      );
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS projects (
        id VARCHAR(64) PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        road_name VARCHAR(255) NOT NULL,
        ward VARCHAR(64) NOT NULL,
        contractor_name VARCHAR(255) NOT NULL,
        tender_id VARCHAR(64) NOT NULL,
        budget_in_lakhs INT NOT NULL,
        phase VARCHAR(64) NOT NULL DEFAULT 'TRENCHING',
        dlp_end_date VARCHAR(32) NOT NULL,
        dlp_duration_years INT NOT NULL DEFAULT 3,
        lat DOUBLE PRECISION NOT NULL,
        lng DOUBLE PRECISION NOT NULL,
        length_km DOUBLE PRECISION NOT NULL,
        completion_percentage INT NOT NULL DEFAULT 0,
        last_inspected_date VARCHAR(32),
        engineer_in_charge VARCHAR(255)
      );
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS ticket_votes (
        id SERIAL PRIMARY KEY,
        ticket_id VARCHAR(64) REFERENCES tickets(id) ON DELETE CASCADE,
        user_email VARCHAR(255) NOT NULL,
        vote_type VARCHAR(32) NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(ticket_id, user_email, vote_type)
      );
    `;

    tablesInitialized = true;
    return { status: 'connected', message: 'Neon PostgreSQL tables initialized successfully.' };
  } catch (error) {
    console.error('Neon DB Initialization Error:', error);
    return { status: 'error', error: String(error) };
  }
}

/**
 * Fetch civic complaints/tickets with optional filtering.
 */
export async function getTickets(ward?: string, category?: string, status?: string): Promise<Ticket[]> {
  if (sql) {
    try {
      await initializeDatabase();
      const rows = await sql`
        SELECT * FROM tickets ORDER BY impact_score DESC, created_at DESC
      `;
      if (rows && rows.length > 0) {
        let results = rows.map((r: any) => ({
          id: r.id,
          title: r.title,
          description: r.description,
          category: r.category,
          ward: r.ward,
          locationName: r.location_name,
          lat: r.lat,
          lng: r.lng,
          beforeImageUrl: r.before_image_url,
          afterImageUrl: r.after_image_url,
          status: r.status,
          citizenName: r.citizen_name,
          citizenEmail: r.citizen_email,
          contractorName: r.contractor_name,
          contractorId: r.contractor_id,
          tenderId: r.tender_id,
          upvotes: Number(r.upvotes || 0),
          confirmVotes: Number(r.confirm_votes || 0),
          reopenVotes: Number(r.reopen_votes || 0),
          impactScore: Number(r.impact_score || 0),
          reopenReason: r.reopen_reason,
          createdAt: r.created_at ? new Date(r.created_at).toISOString() : new Date().toISOString(),
          resolvedAt: r.resolved_at ? new Date(r.resolved_at).toISOString() : undefined,
          closedAt: r.closed_at ? new Date(r.closed_at).toISOString() : undefined,
          auditTrail: []
        }));

        if (ward && ward !== 'All') results = results.filter((t) => t.ward === ward);
        if (category && category !== 'All') results = results.filter((t) => t.category === category);
        if (status && status !== 'All') results = results.filter((t) => t.status === status);

        return results;
      }
    } catch (err) {
      console.warn('Falling back to memory store due to Neon query notice:', err);
    }
  }

  // In-memory filter
  let results = [...memoryTickets];
  if (ward && ward !== 'All') {
    results = results.filter((t) => t.ward === ward);
  }
  if (category && category !== 'All') {
    results = results.filter((t) => t.category === category);
  }
  if (status && status !== 'All') {
    results = results.filter((t) => t.status === status);
  }
  return results.sort((a, b) => b.impactScore - a.impactScore);
}

/**
 * Fetch a single ticket by ID.
 */
export async function getTicketById(id: string): Promise<Ticket | null> {
  const tickets = await getTickets();
  return tickets.find((t) => t.id === id) || null;
}

/**
 * Submit a new civic complaint.
 */
export async function createTicket(ticketData: Omit<Ticket, 'id' | 'createdAt' | 'upvotes' | 'confirmVotes' | 'reopenVotes' | 'impactScore' | 'auditTrail'>): Promise<Ticket> {
  const newId = `tkt-${Date.now()}`;
  const now = new Date().toISOString();
  
  // Calculate initial impact score based on hazard type
  let baseScore = 100;
  if (ticketData.category === 'ROAD_CAVE_IN') baseScore = 400;
  else if (ticketData.category === 'OPEN_MANHOLE') baseScore = 350;
  else if (ticketData.category === 'ELECTRICAL_WIRE') baseScore = 300;
  else if (ticketData.category === 'POTHOLE') baseScore = 200;

  const newTicket: Ticket = {
    ...ticketData,
    id: newId,
    upvotes: 1,
    confirmVotes: 0,
    reopenVotes: 0,
    impactScore: baseScore,
    createdAt: now,
    auditTrail: [
      {
        id: `aud-${Date.now()}`,
        timestamp: now,
        action: 'Complaint Logged with Geotagged Evidence',
        performedBy: ticketData.citizenName,
        role: 'CITIZEN'
      }
    ]
  };

  if (sql) {
    try {
      await initializeDatabase();
      await sql`
        INSERT INTO tickets (
          id, title, description, category, ward, location_name, lat, lng,
          before_image_url, status, citizen_name, citizen_email, upvotes,
          confirm_votes, reopen_votes, impact_score, created_at
        ) VALUES (
          ${newTicket.id}, ${newTicket.title}, ${newTicket.description},
          ${newTicket.category}, ${newTicket.ward}, ${newTicket.locationName},
          ${newTicket.lat}, ${newTicket.lng}, ${newTicket.beforeImageUrl},
          ${newTicket.status}, ${newTicket.citizenName}, ${newTicket.citizenEmail},
          ${newTicket.upvotes}, 0, 0, ${newTicket.impactScore}, NOW()
        )
      `;
    } catch (err) {
      console.warn('Neon insert error, saved to in-memory fallback:', err);
    }
  }

  memoryTickets.unshift(newTicket);
  return newTicket;
}

/**
 * Record citizen vote (+1 Upvote, Confirm Fix, Reopen Ticket).
 */
export async function recordVote(
  ticketId: string,
  voteType: 'UPVOTE' | 'CONFIRM' | 'REOPEN',
  userEmail: string,
  userName: string,
  reason?: string
): Promise<{ success: boolean; ticket: Ticket | null; message: string }> {
  const index = memoryTickets.findIndex((t) => t.id === ticketId);
  if (index === -1) {
    return { success: false, ticket: null, message: 'Ticket not found' };
  }

  const ticket = memoryTickets[index];
  const now = new Date().toISOString();

  if (voteType === 'UPVOTE') {
    ticket.upvotes += 1;
    ticket.impactScore += 10;
    ticket.auditTrail.push({
      id: `aud-${Date.now()}`,
      timestamp: now,
      action: '+1 Community Endorsement',
      performedBy: userName,
      role: 'CITIZEN'
    });
  } else if (voteType === 'CONFIRM') {
    ticket.confirmVotes += 1;
    ticket.auditTrail.push({
      id: `aud-${Date.now()}`,
      timestamp: now,
      action: 'Citizen Confirmed Resolution',
      performedBy: userName,
      role: 'CITIZEN'
    });

    // "Closed ≠ Resolved" Rule: 3 confirm votes officially closes the ticket!
    if (ticket.confirmVotes >= 3) {
      ticket.status = 'OFFICIALLY_CLOSED';
      ticket.closedAt = now;
      ticket.auditTrail.push({
        id: `aud-${Date.now()}-closed`,
        timestamp: now,
        action: 'Officially Closed by Citizen Quorum',
        performedBy: 'NMC Automated Governance Protocol',
        role: 'WARD_ENGINEER',
        note: 'Threshold of 3 verified citizen votes achieved.'
      });
    }
  } else if (voteType === 'REOPEN') {
    ticket.reopenVotes += 1;
    ticket.status = 'REOPENED';
    ticket.reopenReason = reason || 'Substandard repair work flagged by citizen.';
    ticket.impactScore += 150; // Elevate priority
    ticket.auditTrail.push({
      id: `aud-${Date.now()}`,
      timestamp: now,
      action: 'REOPENED: Substandard Repair Flagged',
      performedBy: userName,
      role: 'CITIZEN',
      note: reason
    });
  }

  // Update in Neon if available
  if (sql) {
    try {
      await sql`
        UPDATE tickets SET
          upvotes = ${ticket.upvotes},
          confirm_votes = ${ticket.confirmVotes},
          reopen_votes = ${ticket.reopenVotes},
          impact_score = ${ticket.impactScore},
          status = ${ticket.status},
          reopen_reason = ${ticket.reopenReason || null},
          closed_at = ${ticket.closedAt ? new Date(ticket.closedAt) : null}
        WHERE id = ${ticketId}
      `;
    } catch (err) {
      console.warn('Neon update error:', err);
    }
  }

  return { success: true, ticket, message: 'Vote recorded successfully' };
}

/**
 * Contractor uploads After-Repair proof photo and requests citizen verification.
 */
export async function submitContractorProof(
  ticketId: string,
  afterImageUrl: string,
  contractorName: string,
  note?: string
): Promise<{ success: boolean; ticket: Ticket | null }> {
  const index = memoryTickets.findIndex((t) => t.id === ticketId);
  if (index === -1) return { success: false, ticket: null };

  const ticket = memoryTickets[index];
  const now = new Date().toISOString();

  ticket.afterImageUrl = afterImageUrl;
  ticket.status = 'VERIFICATION_PENDING';
  ticket.resolvedAt = now;
  ticket.contractorName = contractorName;
  ticket.auditTrail.push({
    id: `aud-${Date.now()}`,
    timestamp: now,
    action: 'Contractor Uploaded Resolution Evidence',
    performedBy: contractorName,
    role: 'CONTRACTOR',
    note: note || 'Work completed per IRC municipal standards.'
  });

  if (sql) {
    try {
      await sql`
        UPDATE tickets SET
          after_image_url = ${afterImageUrl},
          status = 'VERIFICATION_PENDING',
          resolved_at = NOW(),
          contractor_name = ${contractorName}
        WHERE id = ${ticketId}
      `;
    } catch (err) {
      console.warn('Neon contractor proof update error:', err);
    }
  }

  return { success: true, ticket };
}

/**
 * Fetch road infrastructure projects under Defect Liability Period (DLP).
 */
export async function getRoadProjects(ward?: string): Promise<RoadProject[]> {
  if (sql) {
    try {
      await initializeDatabase();
      const rows = await sql`SELECT * FROM projects ORDER BY budget_in_lakhs DESC`;
      if (rows && rows.length > 0) {
        let results = rows.map((r: any) => ({
          id: r.id,
          title: r.title,
          roadName: r.road_name,
          ward: r.ward,
          contractorName: r.contractor_name,
          tenderId: r.tender_id,
          budgetInLakhs: Number(r.budget_in_lakhs),
          phase: r.phase,
          dlpEndDate: r.dlp_end_date,
          dlpDurationYears: Number(r.dlp_duration_years),
          lat: r.lat,
          lng: r.lng,
          lengthKm: Number(r.length_km),
          completionPercentage: Number(r.completion_percentage),
          lastInspectedDate: r.last_inspected_date,
          engineerInCharge: r.engineer_in_charge
        }));
        if (ward && ward !== 'All') results = results.filter((p) => p.ward === ward);
        return results;
      }
    } catch (err) {
      console.warn('Neon road projects query fallback:', err);
    }
  }

  let results = [...memoryProjects];
  if (ward && ward !== 'All') results = results.filter((p) => p.ward === ward);
  return results;
}

/**
 * Update project engineering phase (Trenching ➔ Concreting ➔ Curing ➔ Completed).
 */
export async function updateProjectPhase(
  projectId: string,
  phase: RoadWorkPhase,
  completionPercentage: number
): Promise<{ success: boolean; project: RoadProject | null }> {
  const index = memoryProjects.findIndex((p) => p.id === projectId);
  if (index === -1) return { success: false, project: null };

  const project = memoryProjects[index];
  project.phase = phase;
  project.completionPercentage = completionPercentage;
  project.lastInspectedDate = new Date().toISOString().split('T')[0];

  if (sql) {
    try {
      await sql`
        UPDATE projects SET
          phase = ${phase},
          completion_percentage = ${completionPercentage},
          last_inspected_date = ${project.lastInspectedDate}
        WHERE id = ${projectId}
      `;
    } catch (err) {
      console.warn('Neon project update error:', err);
    }
  }

  return { success: true, project };
}

/**
 * Upsert user profile upon Google OAuth sign-in.
 */
export async function upsertUser(user: {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role?: UserRole;
  ward?: string;
}): Promise<UserProfile> {
  const role = user.role || 'CITIZEN';
  const existingMemIndex = memoryUsers.findIndex((u) => u.email === user.email);

  const updatedProfile: UserProfile = {
    id: user.id,
    name: user.name,
    email: user.email,
    avatar: user.avatar,
    role: existingMemIndex >= 0 ? memoryUsers[existingMemIndex].role : role,
    ward: (user.ward as Ward) || 'Panchavati'
  };

  if (existingMemIndex >= 0) {
    memoryUsers[existingMemIndex] = { ...memoryUsers[existingMemIndex], ...updatedProfile };
  } else {
    memoryUsers.push(updatedProfile);
  }

  if (sql) {
    try {
      await initializeDatabase();
      const existing = await sql`SELECT * FROM users WHERE email = ${user.email} LIMIT 1`;
      if (existing && existing.length > 0) {
        await sql`
          UPDATE users SET
            name = ${user.name},
            avatar = ${user.avatar}
          WHERE email = ${user.email}
        `;
        return {
          id: existing[0].id,
          name: user.name,
          email: user.email,
          avatar: user.avatar,
          role: existing[0].role as UserRole,
          ward: (existing[0].ward as Ward) || 'Panchavati'
        };
      } else {
        await sql`
          INSERT INTO users (id, name, email, avatar, role, ward)
          VALUES (${user.id}, ${user.name}, ${user.email}, ${user.avatar}, ${role}, ${user.ward || 'Panchavati'})
        `;
      }
    } catch (err) {
      console.warn('Neon upsertUser notice, using memory:', err);
    }
  }

  return updatedProfile;
}

/**
 * Get user by email from Neon or memory.
 */
export async function getUserByEmail(email: string): Promise<UserProfile | null> {
  if (sql) {
    try {
      await initializeDatabase();
      const rows = await sql`SELECT * FROM users WHERE email = ${email} LIMIT 1`;
      if (rows && rows.length > 0) {
        const r = rows[0];
        return {
          id: r.id,
          name: r.name,
          email: r.email,
          avatar: r.avatar,
          role: r.role as UserRole,
          ward: (r.ward as Ward) || 'Panchavati'
        };
      }
    } catch (err) {
      console.warn('Neon getUserByEmail query notice:', err);
    }
  }

  const found = memoryUsers.find((u) => u.email === email);
  return found || null;
}

