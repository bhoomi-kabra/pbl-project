/**
 * PostgreSQL API & Socket.io WebSockets Service for Nashik Roads & Civic Monitor
 */

import { CivicTicket, RoadWorkProject } from '../types';

const API_BASE_URL = 'http://localhost:5000/api';

/**
 * Fetch all road projects from PostgreSQL database
 */
export async function fetchProjectsFromDatabase(): Promise<RoadWorkProject[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/projects`);
    if (!response.ok) throw new Error('Database response not OK');
    const data = await response.json();
    return data;
  } catch (error) {
    console.warn('Falling back to local data store:', error);
    return [];
  }
}

/**
 * Fetch all civic complaint tickets from PostgreSQL database
 */
export async function fetchTicketsFromDatabase(): Promise<CivicTicket[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/tickets`);
    if (!response.ok) throw new Error('Database response not OK');
    const data = await response.json();
    
    // Map PostgreSQL snake_case columns to camelCase interfaces if needed
    return data.map((item: any) => ({
      id: item.id,
      ticketNumber: item.ticket_number || item.ticketNumber,
      title: item.title,
      titleMr: item.title_mr || item.titleMr,
      hazardType: item.hazard_type || item.hazardType,
      ward: item.ward,
      location: item.location,
      coordinates: [item.lat || item.coordinates?.[0], item.lng || item.coordinates?.[1]],
      status: item.status,
      submittedDate: item.submitted_date || item.submittedDate,
      assignedEngineer: item.assigned_engineer || item.assignedEngineer,
      contractorAgency: item.contractor_agency || item.contractorAgency,
      dlpExpiryDate: item.dlp_expiry_date || item.dlpExpiryDate,
      beforePhoto: item.before_photo || item.beforePhoto,
      afterPhoto: item.after_photo || item.afterPhoto,
      aiConfidence: item.ai_confidence || item.aiConfidence,
      citizenVotesConfirmed: item.citizen_votes_confirmed || item.citizenVotesConfirmed || 0,
      citizenVotesReopened: item.citizen_votes_reopened || item.citizenVotesReopened || 0,
    }));
  } catch (error) {
    console.warn('Falling back to local ticket store:', error);
    return [];
  }
}

/**
 * Insert a new complaint ticket into PostgreSQL database
 */
export async function postComplaintToDatabase(ticketData: Partial<CivicTicket>): Promise<any> {
  try {
    const response = await fetch(`${API_BASE_URL}/complaints`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(ticketData),
    });

    if (!response.ok) throw new Error('PostgreSQL Insert failed');
    return await response.json();
  } catch (error) {
    console.warn('PostgreSQL submission offline, fallback to memory stream:', error);
    return null;
  }
}

/**
 * Submit a citizen vote to PostgreSQL database
 */
export async function submitVoteToDatabase(ticketId: string, action: 'confirm' | 'reopen'): Promise<any> {
  try {
    const response = await fetch(`${API_BASE_URL}/tickets/${ticketId}/vote`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ action }),
    });

    if (!response.ok) throw new Error('Vote submission failed');
    return await response.json();
  } catch (error) {
    console.warn('PostgreSQL vote offline:', error);
    return null;
  }
}
