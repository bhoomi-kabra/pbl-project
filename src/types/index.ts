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
  | 'DRAINAGE_OVERFLOW'
  | 'OTHER';

export type DepartmentType = 
  | 'PWD_ROADS'
  | 'WATER_SUPPLY'
  | 'MSEDCL_ELECTRICAL'
  | 'DRAINAGE_SEWERAGE'
  | 'STREETLIGHT_SAFETY'
  | 'SANITATION_OTHER';

export type RiskLevel = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';

export interface TicketComment {
  id: string;
  author?: string;
  userName?: string;
  userRole?: 'CITIZEN' | 'ADMIN';
  text: string;
  timestamp: string;
}

export interface RoadWorkProject {
  id: string;
  tenderId?: string;
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
  department: DepartmentType;
  dlpExpiryDate: string;
  beforePhoto: string;
  afterPhoto?: string;
  videoUrl?: string;
  aiConfidence?: number;
  plusOneCount: number;
  impactScore: number;
  riskLevel: RiskLevel;
  resolvedDaysAgo?: number;
  autoVanishDaysLeft?: number;
  comments?: TicketComment[];
  citizenVotesConfirmed: number;
  citizenVotesReopened: number;
  userVerificationState?: 'none' | 'confirmed' | 'reopened';
  reporterName?: string;
  reporterMobile?: string;
}

export type Language = 'en' | 'mr';
export type ThemeMode = 'light' | 'dark';
export type UserRoleMode = 'CITIZEN' | 'ADMIN';
