export type Ward =
  | 'Panchavati'
  | 'Nashik East'
  | 'Nashik West'
  | 'Cidco'
  | 'Satpur'
  | 'Nashik Road';

export type HazardCategory =
  | 'POTHOLE'
  | 'ROAD_CAVE_IN'
  | 'OPEN_MANHOLE'
  | 'ELECTRICAL_WIRE'
  | 'WATER_LOGGING'
  | 'WATER_LEAKAGE'
  | 'DRAINAGE_OVERFLOW'
  | 'GARBAGE_DUMP'
  | 'STREETLIGHT_DEFECT'
  | 'UNAUTHORIZED_EXCAVATION'
  | 'OTHER';


export type TicketStatus =
  | 'SUBMITTED'
  | 'IN_PROGRESS'
  | 'RESOLVED_BY_CONTRACTOR'
  | 'VERIFICATION_PENDING'
  | 'OFFICIALLY_CLOSED'
  | 'REOPENED';

export type RoadWorkPhase =
  | 'TRENCHING'
  | 'CONCRETING'
  | 'WATER_CURING'
  | 'COMPLETED_VERIFIED';

export type UserRole =
  | 'CITIZEN'
  | 'WARD_ENGINEER'
  | 'CONTRACTOR';

export interface AuditEntry {
  id: string;
  timestamp: string;
  action: string;
  performedBy: string;
  role: UserRole;
  note?: string;
}

export interface Ticket {
  id: string;
  title: string;
  description: string;
  category: HazardCategory;
  ward: Ward;
  locationName: string;
  lat: number;
  lng: number;
  beforeImageUrl: string;
  afterImageUrl?: string;
  status: TicketStatus;
  citizenName: string;
  citizenEmail: string;
  contractorName?: string;
  contractorId?: string;
  tenderId?: string;
  upvotes: number;
  confirmVotes: number;
  reopenVotes: number;
  impactScore: number;
  createdAt: string;
  resolvedAt?: string;
  closedAt?: string;
  reopenReason?: string;
  userVotedUp?: boolean;
  userVotedConfirm?: boolean;
  userVotedReopen?: boolean;
  auditTrail: AuditEntry[];
}

export interface RoadProject {
  id: string;
  title: string;
  roadName: string;
  ward: Ward;
  contractorName: string;
  tenderId: string;
  budgetInLakhs: number;
  phase: RoadWorkPhase;
  dlpEndDate: string; // Defect Liability Period end date
  dlpDurationYears: number;
  lat: number;
  lng: number;
  lengthKm: number;
  completionPercentage: number;
  lastInspectedDate: string;
  engineerInCharge: string;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: UserRole;
  ward?: Ward;
}

export type Language = 'en' | 'mr';
