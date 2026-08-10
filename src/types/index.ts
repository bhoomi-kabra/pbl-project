export type WardName = 
  | 'All Wards'
  | 'Panchavati'
  | 'Nashik East'
  | 'Nashik West'
  | 'Cidco'
  | 'Satpur'
  | 'Nashik Road';

export type LifecycleState = 
  | 'TRENCHING'     // Red: Trenching & Excavation
  | 'CONCRETING'    // Yellow: Concreting / Asphalting
  | 'CURING'        // Blue: Water Curing Phase
  | 'COMPLETED';    // Green: Work Completed & Verified

export type TicketStatus =
  | 'SUBMITTED'
  | 'ASSIGNED'
  | 'IN_PROGRESS'
  | 'EVIDENCE_UPLOADED'
  | 'VERIFICATION_PENDING'
  | 'CLOSED_VERIFIED'
  | 'REOPENED_ESCALATED';

export type HazardType = 
  | 'ELECTRICAL_HAZARD'
  | 'POTHOLE'
  | 'UNAUTHORIZED_EXCAVATION'
  | 'WATER_LEAKAGE'
  | 'STREETLIGHT_DEFECT'
  | 'DRAINAGE_OVERFLOW';

export interface RoadWorkProject {
  id: string;
  roadName: string;
  roadNameMr: string;
  ward: WardName;
  state: LifecycleState;
  contractor: string;
  budgetInr: string;
  dlpPeriod: string;
  startDate: string;
  expectedCompletion: string;
  coordinates: [number, number];
  polylineCoordinates?: [number, number][];
  progressPhoto: string;
  description: string;
  descriptionMr: string;
}

export interface CivicTicket {
  id: string;
  ticketNumber: string;
  title: string;
  titleMr: string;
  hazardType: HazardType;
  ward: WardName;
  location: string;
  coordinates: [number, number];
  status: TicketStatus;
  submittedDate: string;
  assignedEngineer: string;
  contractorAgency: string;
  dlpExpiryDate: string;
  beforePhoto: string;
  afterPhoto?: string;
  aiConfidence?: number;
  citizenVotesConfirmed: number;
  citizenVotesReopened: number;
  userVerificationState?: 'none' | 'confirmed' | 'reopened';
}

export type Language = 'en' | 'mr';
export type ThemeMode = 'light' | 'dark';
