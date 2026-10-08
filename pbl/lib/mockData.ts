import { Ticket, RoadProject, UserProfile } from './types';

export const INITIAL_USERS: UserProfile[] = [
  {
    id: 'usr_citizen_1',
    name: 'Rahul Deshmukh',
    email: '',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80',
    role: 'CITIZEN',
    ward: 'Nashik West'
  },
  {
    id: 'usr_engineer_1',
    name: 'Er. S. B. Patil (Exec. Engineer)',
    email: '',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=120&q=80',
    role: 'WARD_ENGINEER',
    ward: 'Nashik West'
  },
  {
    id: 'usr_contractor_1',
    name: 'M/s Godavari Infrastructure Ltd.',
    email: '',
    avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=120&q=80',
    role: 'CONTRACTOR',
    ward: 'Nashik West'
  },
  {
    id: '101166305594609285505',
    name: 'Bhoomi Kabra (Commissioner)',
    email: 'bhoomikabra12@gmail.com',
    avatar: 'https://lh3.googleusercontent.com/a/ACg8ocLD1OaUaxg72-Ujj-PBPV4OOgaY1aht-kb_BLO0HdEVExRz7w=s96-c',
    role: 'SUPER_ADMIN',
    ward: 'Nashik West'
  }
];

export const INITIAL_PROJECTS: RoadProject[] = [
  {
    id: 'proj-01',
    title: 'Gangapur Road Smart Corridor & Asphalting',
    roadName: 'Gangapur Road (ABB Circle to Jehan Circle)',
    ward: 'Nashik West',
    contractorName: 'M/s Godavari Infrastructure Ltd.',
    tenderId: 'NMC/PWD/2024/092',
    budgetInLakhs: 480,
    phase: 'COMPLETED_VERIFIED',
    dlpEndDate: '2027-10-31',
    dlpDurationYears: 3,
    lat: 20.0125,
    lng: 73.7665,
    lengthKm: 3.4,
    completionPercentage: 100,
    lastInspectedDate: '2024-11-15',
    engineerInCharge: 'Er. S. B. Patil'
  },
  {
    id: 'proj-02',
    title: 'College Road Whitetopping & Utility Ducts',
    roadName: 'College Road (KTHM to Canada Corner)',
    ward: 'Nashik West',
    contractorName: 'Ashoka Concessions & Infra',
    tenderId: 'NMC/PWD/2023/118',
    budgetInLakhs: 620,
    phase: 'COMPLETED_VERIFIED',
    dlpEndDate: '2028-03-31',
    dlpDurationYears: 5,
    lat: 20.0050,
    lng: 73.7720,
    lengthKm: 2.8,
    completionPercentage: 100,
    lastInspectedDate: '2024-12-01',
    engineerInCharge: 'Er. S. B. Patil'
  },
  {
    id: 'proj-03',
    title: 'Trimbakeshwar Link Road Flyover Overpass Approach',
    roadName: 'Trimbak Road (MIDC Satpur Connector)',
    ward: 'Satpur',
    contractorName: 'Sahyadri Road Builders Pvt Ltd',
    tenderId: 'NMC/PWD/2024/014',
    budgetInLakhs: 350,
    phase: 'WATER_CURING',
    dlpEndDate: '2027-12-31',
    dlpDurationYears: 3,
    lat: 19.9721,
    lng: 73.7289,
    lengthKm: 1.9,
    completionPercentage: 88,
    lastInspectedDate: '2025-01-20',
    engineerInCharge: 'Er. V. R. Shinde'
  },
  {
    id: 'proj-04',
    title: 'Pawan Nagar Main Arterial Concreting',
    roadName: 'Cidco Sector 4 Main Trunk Road',
    ward: 'Cidco',
    contractorName: 'Khandesh Construction Syndicate',
    tenderId: 'NMC/PWD/2024/088',
    budgetInLakhs: 290,
    phase: 'CONCRETING',
    dlpEndDate: '2028-01-15',
    dlpDurationYears: 3,
    lat: 19.9658,
    lng: 73.7540,
    lengthKm: 2.1,
    completionPercentage: 62,
    lastInspectedDate: '2025-02-10',
    engineerInCharge: 'Er. M. K. Kulkarni'
  },
  {
    id: 'proj-05',
    title: 'Panchavati Ramkund Ghat Access Road Widening',
    roadName: 'Godavari Riverbank Ring Road',
    ward: 'Panchavati',
    contractorName: 'Panchavati Civil Engineers Ltd',
    tenderId: 'NMC/PWD/2024/052',
    budgetInLakhs: 410,
    phase: 'TRENCHING',
    dlpEndDate: '2027-06-30',
    dlpDurationYears: 3,
    lat: 20.0062,
    lng: 73.7915,
    lengthKm: 1.5,
    completionPercentage: 25,
    lastInspectedDate: '2025-02-18',
    engineerInCharge: 'Er. P. N. More'
  },
  {
    id: 'proj-06',
    title: 'Nashik Road Bytco Chowk High-Density Overlay',
    roadName: 'Pune-Nashik Highway Ward Spur',
    ward: 'Nashik Road',
    contractorName: 'M/s Godavari Infrastructure Ltd.',
    tenderId: 'NMC/PWD/2024/071',
    budgetInLakhs: 530,
    phase: 'TRENCHING',
    dlpEndDate: '2027-08-30',
    dlpDurationYears: 3,
    lat: 19.9540,
    lng: 73.8340,
    lengthKm: 3.0,
    completionPercentage: 15,
    lastInspectedDate: '2025-02-22',
    engineerInCharge: 'Er. R. G. Jadhav'
  }
];

export const INITIAL_TICKETS: Ticket[] = [
  {
    id: 'tkt-figma-01',
    title: 'Uncovered drainage manhole',
    description: 'Open drainage manhole chamber exposed on the Godavari ghat walkway, posing severe fall risk for elderly pilgrims and evening visitors.',
    category: 'OPEN_MANHOLE',
    ward: 'Panchavati',
    locationName: 'Panchavati · Near Ramkund / Godavari',
    lat: 20.0068,
    lng: 73.7922,
    beforeImageUrl: 'https://images.unsplash.com/photo-1584467735871-8e85353a8413?auto=format&fit=crop&w=800&q=80',
    afterImageUrl: 'https://images.unsplash.com/photo-1590069261209-f8e9b8642343?auto=format&fit=crop&w=800&q=80',
    status: 'VERIFICATION_PENDING',
    citizenName: 'Bhoomi Kabra',
    citizenEmail: 'bhoomi.kabra@example.com',
    contractorName: 'Panchavati Civil Engineers Ltd',
    contractorId: 'usr_contractor_3',
    tenderId: 'NMC/PWD/2024/052',
    upvotes: 1,
    confirmVotes: 1,
    reopenVotes: 0,
    impactScore: 120,
    createdAt: '2025-02-24T10:15:00Z',
    resolvedAt: '2025-02-25T16:30:00Z',
    auditTrail: [
      {
        id: 'aud-bk-1',
        timestamp: '2025-02-24T10:15:00Z',
        action: 'Complaint Logged with Geotagged Photo',
        performedBy: 'Bhoomi Kabra',
        role: 'CITIZEN'
      },
      {
        id: 'aud-bk-2',
        timestamp: '2025-02-25T16:30:00Z',
        action: 'After-Repair Photographic Proof Uploaded',
        performedBy: 'Panchavati Civil Engineers Ltd',
        role: 'CONTRACTOR',
        note: 'Cast iron frame and reinforced lid installed.'
      }
    ]
  },
  {
    id: 'tkt-figma-02',
    title: '2 potholes near Indu Heights',
    description: 'Two sharp potholes on the Vidhate Nagar to Hirawadi Road link opposite Indu Heights. Vehicles suddenly swerving.',
    category: 'POTHOLE',
    ward: 'Panchavati',
    locationName: 'Panchavati · Vidhate Nagar / Hirawadi Road',
    lat: 20.0150,
    lng: 73.8010,
    beforeImageUrl: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=800&q=80',
    status: 'VERIFICATION_PENDING',
    citizenName: 'Rahul Deshmukh',
    citizenEmail: 'rahul.d@example.com',
    contractorName: 'Panchavati Civil Engineers Ltd',
    contractorId: 'usr_contractor_3',
    tenderId: 'NMC/PWD/2024/052',
    upvotes: 3,
    confirmVotes: 0,
    reopenVotes: 0,
    impactScore: 190,
    createdAt: '2025-02-24T11:45:00Z',
    auditTrail: [
      {
        id: 'aud-rd-1',
        timestamp: '2025-02-24T11:45:00Z',
        action: 'Pothole Hazard Reported by Resident',
        performedBy: 'Rahul Deshmukh',
        role: 'CITIZEN'
      }
    ]
  },
  {
    id: 'tkt-01',
    title: 'Deep Hazardous Potholes Cluster opposite ABB Circle',
    description: 'Multiple 15cm deep potholes causing two-wheeler skidding during evening rush hour. Sharp asphalt edges exposed.',
    category: 'POTHOLE',
    ward: 'Nashik West',
    locationName: 'Near ABB Circle, Gangapur Road',
    lat: 20.0118,
    lng: 73.7645,
    beforeImageUrl: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=800&q=80',
    afterImageUrl: 'https://images.unsplash.com/photo-1621905251918-48416bd8575a?auto=format&fit=crop&w=800&q=80',
    status: 'VERIFICATION_PENDING',
    citizenName: 'Rahul Deshmukh',
    citizenEmail: '',
    contractorName: 'M/s Godavari Infrastructure Ltd.',
    contractorId: 'usr_contractor_1',
    tenderId: 'NMC/PWD/2024/092',
    upvotes: 42,
    confirmVotes: 2,
    reopenVotes: 0,
    impactScore: 470,
    createdAt: '2025-02-15T09:30:00Z',
    resolvedAt: '2025-02-18T14:20:00Z',
    auditTrail: [
      {
        id: 'aud-1',
        timestamp: '2025-02-15T09:30:00Z',
        action: 'Complaint Filed with Geotagged Photo',
        performedBy: 'Rahul Deshmukh',
        role: 'CITIZEN'
      },
      {
        id: 'aud-2',
        timestamp: '2025-02-16T11:00:00Z',
        action: 'SLA Dispatched to Contractor',
        performedBy: 'Er. S. B. Patil',
        role: 'WARD_ENGINEER',
        note: 'Assigned 48-hour SLA notice under Section 14 DLP warranty terms.'
      },
      {
        id: 'aud-3',
        timestamp: '2025-02-18T14:20:00Z',
        action: 'Contractor Uploaded Cold-Mix Repair Proof',
        performedBy: 'M/s Godavari Infrastructure Ltd.',
        role: 'CONTRACTOR',
        note: 'Pothole patch sealed with 50mm compacted bitumen mix.'
      },
      {
        id: 'aud-4',
        timestamp: '2025-02-18T14:25:00Z',
        action: 'Pipeline moved to Citizen Verification Mode',
        performedBy: 'System Automation',
        role: 'WARD_ENGINEER',
        note: 'Closed ≠ Resolved Rule active: Awaiting 3 independent citizen votes.'
      }
    ]
  },
  {
    id: 'tkt-02',
    title: 'Severe Road Cave-In Near Mahamarg Bus Stand Entrance',
    description: 'Road surface subsided suddenly by over 1.5 feet due to cracked stormwater drain underneath. Major safety emergency.',
    category: 'ROAD_CAVE_IN',
    ward: 'Nashik East',
    locationName: 'Opposite Mahamarg MSRTC Bus Station, Mumbai Naka',
    lat: 19.9885,
    lng: 73.7930,
    beforeImageUrl: 'https://images.unsplash.com/photo-1578328819058-b69f3a3b0f6b?auto=format&fit=crop&w=800&q=80',
    status: 'IN_PROGRESS',
    citizenName: 'Snehal Gaikwad',
    citizenEmail: 'snehal.g@outlook.com',
    contractorName: 'Sahyadri Road Builders Pvt Ltd',
    contractorId: 'usr_contractor_2',
    tenderId: 'NMC/PWD/2024/014',
    upvotes: 89,
    confirmVotes: 0,
    reopenVotes: 0,
    impactScore: 920,
    createdAt: '2025-02-19T08:15:00Z',
    auditTrail: [
      {
        id: 'aud-21',
        timestamp: '2025-02-19T08:15:00Z',
        action: 'High-Severity Emergency Ticket Filed',
        performedBy: 'Snehal Gaikwad',
        role: 'CITIZEN'
      },
      {
        id: 'aud-22',
        timestamp: '2025-02-19T09:00:00Z',
        action: 'Barricading & Excavation Initiated',
        performedBy: 'Er. V. R. Shinde',
        role: 'WARD_ENGINEER',
        note: 'Emergency barricades placed. Utility inspection underway.'
      }
    ]
  },
  {
    id: 'tkt-03',
    title: 'Open Drainage Manhole Lid Missing near Ramkund Pilgrim Walkway',
    description: 'Heavy cast-iron lid removed or broken. High pedestrian footfall area with pilgrims and elderly citizens.',
    category: 'OPEN_MANHOLE',
    ward: 'Panchavati',
    locationName: 'Ramkund Main Ghat Promenade, Panchavati',
    lat: 20.0068,
    lng: 73.7922,
    beforeImageUrl: 'https://images.unsplash.com/photo-1584467735871-8e85353a8413?auto=format&fit=crop&w=800&q=80',
    afterImageUrl: 'https://images.unsplash.com/photo-1590069261209-f8e9b8642343?auto=format&fit=crop&w=800&q=80',
    status: 'REOPENED',
    citizenName: 'Amit Joshi',
    citizenEmail: 'amit.joshi@gmail.com',
    contractorName: 'Panchavati Civil Engineers Ltd',
    contractorId: 'usr_contractor_3',
    tenderId: 'NMC/PWD/2024/052',
    upvotes: 64,
    confirmVotes: 1,
    reopenVotes: 4,
    impactScore: 780,
    createdAt: '2025-02-10T16:00:00Z',
    resolvedAt: '2025-02-12T10:00:00Z',
    reopenReason: 'Substandard temporary bamboo hurdle placed instead of permanent ductile iron manhole cover. Highly dangerous at night!',
    auditTrail: [
      {
        id: 'aud-31',
        timestamp: '2025-02-10T16:00:00Z',
        action: 'Ticket Created with Geotagged Photo',
        performedBy: 'Amit Joshi',
        role: 'CITIZEN'
      },
      {
        id: 'aud-32',
        timestamp: '2025-02-12T10:00:00Z',
        action: 'Contractor Claimed Resolution',
        performedBy: 'Panchavati Civil Engineers Ltd',
        role: 'CONTRACTOR',
        note: 'Placed temporary hazard cover.'
      },
      {
        id: 'aud-33',
        timestamp: '2025-02-13T19:40:00Z',
        action: 'REOPENED by Citizens: Substandard Proof',
        performedBy: 'Citizens Community Vote',
        role: 'CITIZEN',
        note: 'Reopened by 4 citizens. Escalated to Executive Engineer for contract penalty.'
      }
    ]
  },
  {
    id: 'tkt-04',
    title: 'Live Dangling Cable Snapped across Roadway',
    description: 'High tension cable sagging within 6 feet of the road surface following branch fall. Sparking observed.',
    category: 'ELECTRICAL_WIRE',
    ward: 'Nashik Road',
    locationName: 'Near Bytco Point Circle, Nashik Road',
    lat: 19.9535,
    lng: 73.8335,
    beforeImageUrl: 'https://images.unsplash.com/photo-1544724569-5f546fd6f2b5?auto=format&fit=crop&w=800&q=80',
    status: 'SUBMITTED',
    citizenName: 'Pooja Sonawane',
    citizenEmail: 'pooja.s@gmail.com',
    upvotes: 38,
    confirmVotes: 0,
    reopenVotes: 0,
    impactScore: 610,
    createdAt: '2025-02-23T07:10:00Z',
    auditTrail: [
      {
        id: 'aud-41',
        timestamp: '2025-02-23T07:10:00Z',
        action: 'Dispatched to MSEDCL & NMC Quick Response Team',
        performedBy: 'Pooja Sonawane',
        role: 'CITIZEN'
      }
    ]
  },
  {
    id: 'tkt-05',
    title: 'Monsoon Waterlogging & Choked Culvert Inundation',
    description: 'Severe stormwater stagnation covering both lanes of Trimurti Chowk. Vehicles stalling regularly.',
    category: 'WATER_LOGGING',
    ward: 'Cidco',
    locationName: 'Trimurti Chowk to Untwadi Road, Cidco',
    lat: 19.9660,
    lng: 73.7535,
    beforeImageUrl: 'https://images.unsplash.com/photo-1547683905-f686c993aae5?auto=format&fit=crop&w=800&q=80',
    afterImageUrl: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80',
    status: 'OFFICIALLY_CLOSED',
    citizenName: 'Kiran Bhamre',
    citizenEmail: 'kiran.b@gmail.com',
    contractorName: 'Khandesh Construction Syndicate',
    contractorId: 'usr_contractor_4',
    tenderId: 'NMC/PWD/2024/088',
    upvotes: 53,
    confirmVotes: 5,
    reopenVotes: 0,
    impactScore: 590,
    createdAt: '2025-01-28T11:00:00Z',
    resolvedAt: '2025-01-30T17:00:00Z',
    closedAt: '2025-02-02T12:00:00Z',
    auditTrail: [
      {
        id: 'aud-51',
        timestamp: '2025-01-28T11:00:00Z',
        action: 'Waterlogging Complaint Logged',
        performedBy: 'Kiran Bhamre',
        role: 'CITIZEN'
      },
      {
        id: 'aud-52',
        timestamp: '2025-01-30T17:00:00Z',
        action: 'Culvert De-silting & Storm Drain Clear Proof Submitted',
        performedBy: 'Khandesh Construction Syndicate',
        role: 'CONTRACTOR'
      },
      {
        id: 'aud-53',
        timestamp: '2025-02-02T12:00:00Z',
        action: 'Officially Sealed: 5 Citizen Confirmations Achieved',
        performedBy: 'Citizen Quorum Verification Engine',
        role: 'CITIZEN',
        note: 'Audit approved and archived into municipal permanent ledger.'
      }
    ]
  },
  {
    id: 'tkt-06',
    title: 'Unbarricaded Gas Pipeline Trench on Industrial Belt',
    description: 'Deep unpaved trench cut across road with no reflective tape or cat-eyes. Sharp gravel causing skidding.',
    category: 'ROAD_CAVE_IN',
    ward: 'Satpur',
    locationName: 'Near ITI Signal, Satpur MIDC',
    lat: 19.9725,
    lng: 73.7295,
    beforeImageUrl: 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?auto=format&fit=crop&w=800&q=80',
    status: 'IN_PROGRESS',
    citizenName: 'Sachin Wagh',
    citizenEmail: 'sachin.w@yahoo.com',
    contractorName: 'Sahyadri Road Builders Pvt Ltd',
    contractorId: 'usr_contractor_2',
    tenderId: 'NMC/PWD/2024/014',
    upvotes: 31,
    confirmVotes: 0,
    reopenVotes: 0,
    impactScore: 420,
    createdAt: '2025-02-21T14:30:00Z',
    auditTrail: [
      {
        id: 'aud-61',
        timestamp: '2025-02-21T14:30:00Z',
        action: 'Reported by Citizen',
        performedBy: 'Sachin Wagh',
        role: 'CITIZEN'
      }
    ]
  }
];

export const NASHIK_CENTER = {
  lat: 19.9975,
  lng: 73.7898,
  zoom: 12
};

export const WARD_COORDINATES: Record<string, [number, number]> = {
  'Panchavati': [20.0062, 73.7915],
  'Nashik East': [19.9880, 73.7942],
  'Nashik West': [20.0089, 73.7621],
  'Cidco': [19.9658, 73.7540],
  'Satpur': [19.9721, 73.7289],
  'Nashik Road': [19.9540, 73.8340]
};
