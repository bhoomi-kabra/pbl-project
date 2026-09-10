/**
 * REST API Service for Nashik Roads & Civic Monitor Backend Data Persistence
 */

import { CivicTicket, RoadWorkProject } from '../types';

const API_BASE_URL = 'http://localhost:5000/api';

export interface UserAccount {
  id: string;
  name: string;
  mobile: string;
  email: string;
  role: 'CITIZEN' | 'ADMIN';
  ward: string;
}

/**
 * Fetch all civic complaint tickets from backend database
 */
export async function fetchTicketsFromDatabase(): Promise<CivicTicket[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/tickets`);
    if (!response.ok) throw new Error('Database response not OK');
    const data = await response.json();
    return data;
  } catch (error) {
    console.warn('Falling back to local memory store:', error);
    return [];
  }
}

/**
 * Insert a new complaint ticket into backend database
 */
export async function postComplaintToDatabase(ticketData: Partial<CivicTicket>): Promise<any> {
  try {
    const response = await fetch(`${API_BASE_URL}/complaints`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(ticketData),
    });
    if (!response.ok) throw new Error('Backend insert failed');
    return await response.json();
  } catch (error) {
    console.warn('Backend submission offline:', error);
    return null;
  }
}

/**
 * Submit +1 Upvote to backend database
 */
export async function submitPlusOneToDatabase(ticketId: string, userName: string): Promise<any> {
  try {
    const response = await fetch(`${API_BASE_URL}/tickets/${ticketId}/plus-one`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userName }),
    });
    if (!response.ok) throw new Error('Plus-one update failed');
    return await response.json();
  } catch (error) {
    console.warn('Plus-one API offline:', error);
    return null;
  }
}

/**
 * Submit Citizen/Admin comment to backend database
 */
export async function submitCommentToDatabase(ticketId: string, userName: string, userRole: 'CITIZEN' | 'ADMIN', text: string): Promise<any> {
  try {
    const response = await fetch(`${API_BASE_URL}/tickets/${ticketId}/comments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userName, userRole, text }),
    });
    if (!response.ok) throw new Error('Comment update failed');
    return await response.json();
  } catch (error) {
    console.warn('Comment API offline:', error);
    return null;
  }
}

/**
 * Admin resolve ticket with proof photo & notes
 */
export async function resolveTicketInDatabase(ticketId: string, proofPhotoUrl: string, resolutionNotes?: string): Promise<any> {
  try {
    const response = await fetch(`${API_BASE_URL}/tickets/${ticketId}/resolve`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ proofPhotoUrl, resolutionNotes }),
    });
    if (!response.ok) throw new Error('Resolve API failed');
    return await response.json();
  } catch (error) {
    console.warn('Resolve API offline:', error);
    return null;
  }
}

/**
 * Submit citizen audit vote
 */
export async function submitVoteToDatabase(ticketId: string, action: 'confirm' | 'reopen'): Promise<any> {
  try {
    const response = await fetch(`${API_BASE_URL}/tickets/${ticketId}/vote`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action }),
    });
    if (!response.ok) throw new Error('Vote submission failed');
    return await response.json();
  } catch (error) {
    console.warn('Vote API offline:', error);
    return null;
  }
}

/**
 * User Auth: Login
 */
export async function loginUser(identifier: string, role: 'CITIZEN' | 'ADMIN'): Promise<UserAccount | null> {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier, role }),
    });
    if (!response.ok) throw new Error('Login failed');
    return await response.json();
  } catch (error) {
    console.warn('Auth login API offline:', error);
    return null;
  }
}

/**
 * User Auth: Register Citizen
 */
export async function registerUser(name: string, mobile: string, email: string, ward: string): Promise<UserAccount | null> {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, mobile, email, ward }),
    });
    if (!response.ok) throw new Error('Registration failed');
    return await response.json();
  } catch (error) {
    console.warn('Auth register API offline:', error);
    return null;
  }
}

/**
 * Fetch registered users (Admin view)
 */
export async function fetchRegisteredUsers(): Promise<UserAccount[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/users`);
    if (!response.ok) throw new Error('Fetch users failed');
    return await response.json();
  } catch (error) {
    console.warn('Fetch users API offline:', error);
    return [];
  }
}

export async function fetchProjectsFromDatabase(): Promise<RoadWorkProject[]> {
  return [];
}
