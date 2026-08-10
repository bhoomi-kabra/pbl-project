import { RoadWorkProject, CivicTicket } from '../types';

export const mockRoadProjects: RoadWorkProject[] = [
  {
    id: 'proj-1',
    roadName: 'College Road (Thatte Nagar to Krishi Nagar)',
    roadNameMr: 'कॉलेज रोड (ठत्ते नगर ते कृषी नगर)',
    ward: 'Nashik West',
    state: 'TRENCHING',
    contractor: 'L&T Smart City Infrastructure Ltd.',
    budgetInr: '₹ 4,85,00,000',
    dlpPeriod: '36 Months (Expires Nov 2027)',
    startDate: '15 Jan 2026',
    expectedCompletion: '30 Aug 2026',
    coordinates: [20.0035, 73.7668],
    polylineCoordinates: [
      [20.0010, 73.7630],
      [20.0035, 73.7668],
      [20.0060, 73.7710]
    ],
    progressPhoto: 'https://images.unsplash.com/photo-1541888946425-d0fbb186a5b3?w=600&auto=format&fit=crop&q=80',
    description: 'Underground optical fiber ducting and utility pipe laying excavation.',
    descriptionMr: 'भूमिगत ऑप्टिकल फायबर डक्टिंग आणि युटिलिटी पाईप टाकण्याचे उत्खनन.'
  },
  {
    id: 'proj-2',
    roadName: 'Gangapur Road (Jehan Circle to Serene Meadows)',
    roadNameMr: 'गंगापूर रोड (जहाँ सर्कल ते सिरीन मेडोज)',
    ward: 'Panchavati',
    state: 'CONCRETING',
    contractor: 'KCC Buildcon Engineering',
    budgetInr: '₹ 8,20,00,000',
    dlpPeriod: '60 Months (Expires Jan 2030)',
    startDate: '01 Dec 2025',
    expectedCompletion: '15 Oct 2026',
    coordinates: [20.0150, 73.7620],
    polylineCoordinates: [
      [20.0120, 73.7550],
      [20.0150, 73.7620],
      [20.0180, 73.7690]
    ],
    progressPhoto: 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=600&auto=format&fit=crop&q=80',
    description: 'White topping and high-density M40 cement concreting.',
    descriptionMr: 'व्हाईट टॉपिंग आणि उच्च घनतेचे M40 सिमेंट काँक्रीटीकरण.'
  },
  {
    id: 'proj-3',
    roadName: 'Panchavati Karanja & Ramkund Connecting Arterial',
    roadNameMr: 'पंचवटी कारंजा व रामकुंड जोडणारा मार्ग',
    ward: 'Panchavati',
    state: 'CURING',
    contractor: 'Nashik Heritage Roads Infrastructure',
    budgetInr: '₹ 2,40,00,000',
    dlpPeriod: '24 Months (Expires Mar 2028)',
    startDate: '10 Feb 2026',
    expectedCompletion: '05 Sep 2026',
    coordinates: [20.0080, 73.7925],
    polylineCoordinates: [
      [20.0065, 73.7900],
      [20.0080, 73.7925],
      [20.0095, 73.7950]
    ],
    progressPhoto: 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=600&auto=format&fit=crop&q=80',
    description: 'Water curing & heavy vehicle restriction phase for concrete slab binding.',
    descriptionMr: 'काँक्रीट स्लॅब बाईंडिंगसाठी वॉटर क्युअरींग आणि जड वाहन बंदी टप्पा.'
  },
  {
    id: 'proj-4',
    roadName: 'Nashik-Pune Highway (Dwarka Flyover Ramp to Bitco Chowk)',
    roadNameMr: 'नाशिक-पुणे महामार्ग (द्वारका उड्डाणपूल ते बिटको चौक)',
    ward: 'Nashik Road',
    state: 'COMPLETED',
    contractor: 'Gayatri Projects & NMC Infra',
    budgetInr: '₹ 14,50,00,000',
    dlpPeriod: '48 Months (Active till May 2029)',
    startDate: '01 Aug 2025',
    expectedCompletion: '20 Jul 2026',
    coordinates: [19.9650, 73.8180],
    polylineCoordinates: [
      [19.9800, 73.7980],
      [19.9650, 73.8180],
      [19.9500, 73.8300]
    ],
    progressPhoto: 'https://images.unsplash.com/photo-1578575437130-527eed3abbec?w=600&auto=format&fit=crop&q=80',
    description: '6-lane mastic asphalt resurfacing & thermoplastic lane marking complete.',
    descriptionMr: '६-पदरी मस्टिक डांबर नूतनीकरण आणि थर्मोप्लास्टिक लेन मार्किंग पूर्ण.'
  },
  {
    id: 'proj-5',
    roadName: 'Trimurti Chowk to Untwadi City Centre Road',
    roadNameMr: 'त्रिमुर्ती चौक ते उंटवाडी सिटी सेंटर रोड',
    ward: 'Cidco',
    state: 'TRENCHING',
    contractor: 'Maharashtra Pipeline Works Pvt Ltd',
    budgetInr: '₹ 3,10,00,000',
    dlpPeriod: '36 Months (Expires Dec 2027)',
    startDate: '01 Mar 2026',
    expectedCompletion: '15 Nov 2026',
    coordinates: [19.9720, 73.7650],
    polylineCoordinates: [
      [19.9750, 73.7600],
      [19.9720, 73.7650],
      [19.9690, 73.7700]
    ],
    progressPhoto: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=600&auto=format&fit=crop&q=80',
    description: 'Stormwater drain channelization & high-volume feeder cable trenching.',
    descriptionMr: 'नाल्यांचे चॅनेलायझेशन आणि वीज केबलसाठी ट्रेंचिंग.'
  },
  {
    id: 'proj-6',
    roadName: 'Satpur MIDC Main Avenue (ABB Circle to Garware)',
    roadNameMr: 'सातपूर एमआयडीसी मुख्य रस्ता (एबीबी चौक ते गरवारे)',
    ward: 'Satpur',
    state: 'COMPLETED',
    contractor: 'Satpur Industrial Roads Corp',
    budgetInr: '₹ 5,60,00,000',
    dlpPeriod: '36 Months (Expires Jan 2028)',
    startDate: '10 Sep 2025',
    expectedCompletion: '01 May 2026',
    coordinates: [19.9980, 73.7380],
    polylineCoordinates: [
      [20.0050, 73.7300],
      [19.9980, 73.7380],
      [19.9900, 73.7450]
    ],
    progressPhoto: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=600&auto=format&fit=crop&q=80',
    description: 'Heavy vehicle industrial concrete paving & LED solar street lighting.',
    descriptionMr: 'औद्योगिक जड वाहनांसाठी काँक्रीट रस्ता व सोलर एलईडी पथदिवे.'
  },
  {
    id: 'proj-7',
    roadName: 'Sharanpur Road (Kulkarni Garden to Canada Corner)',
    roadNameMr: 'शरणपूर रोड (कुलकर्णी गार्डन ते कॅनडा कॉर्नर)',
    ward: 'Nashik East',
    state: 'CONCRETING',
    contractor: 'Nashik Smart Urban Projects',
    budgetInr: '₹ 3,90,00,000',
    dlpPeriod: '36 Months (Expires Feb 2028)',
    startDate: '12 Feb 2026',
    expectedCompletion: '20 Sep 2026',
    coordinates: [19.9970, 73.7780],
    polylineCoordinates: [
      [19.9940, 73.7750],
      [19.9970, 73.7780],
      [20.0000, 73.7810]
    ],
    progressPhoto: 'https://images.unsplash.com/photo-1541888946425-d0fbb186a5b3?w=600&auto=format&fit=crop&q=80',
    description: 'Pedestrian walkway redesign & micro-surfacing asphalt overlay.',
    descriptionMr: 'पादचारी मार्ग पुनर्रचना आणि मायक्रो-सरफेसिंग डांबरीकरण.'
  }
];

export const mockTickets: CivicTicket[] = [
  {
    id: 't-101',
    ticketNumber: 'NMC-2026-8841',
    title: 'Exposed High-Voltage Cable & Open Trench',
    titleMr: 'उघडी उच्च दाबाची केबल आणि खड्डा',
    hazardType: 'ELECTRICAL_HAZARD',
    ward: 'Panchavati',
    location: 'Near K.K. Wagh Engineering College Main Gate, Panchavati',
    coordinates: [20.0180, 73.8180],
    status: 'VERIFICATION_PENDING',
    submittedDate: '06 Aug 2026',
    assignedEngineer: 'Er. Rajesh Deshmukh (Ward Eng - Panchavati)',
    contractorAgency: 'M/s Vidyut Urban Infra',
    dlpExpiryDate: '15 Nov 2027',
    beforePhoto: 'https://images.unsplash.com/photo-1544725121-be3bf52e2dc8?w=600&auto=format&fit=crop&q=80',
    afterPhoto: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=600&auto=format&fit=crop&q=80',
    aiConfidence: 98,
    citizenVotesConfirmed: 14,
    citizenVotesReopened: 2,
    userVerificationState: 'none'
  },
  {
    id: 't-102',
    ticketNumber: 'NMC-2026-7732',
    title: 'Deep Cave-in Pothole on Curve',
    titleMr: 'वळणावर मोठा धोकादायक खड्डा',
    hazardType: 'POTHOLE',
    ward: 'Nashik West',
    location: 'College Road, Opposite Bhonsala Military College Gate 2',
    coordinates: [20.0050, 73.7620],
    status: 'VERIFICATION_PENDING',
    submittedDate: '04 Aug 2026',
    assignedEngineer: 'Er. Sunita Patil (Ward Eng - West)',
    contractorAgency: 'L&T Infrastructure',
    dlpExpiryDate: '20 Oct 2027',
    beforePhoto: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=600&auto=format&fit=crop&q=80',
    afterPhoto: 'https://images.unsplash.com/photo-1578575437130-527eed3abbec?w=600&auto=format&fit=crop&q=80',
    aiConfidence: 95,
    citizenVotesConfirmed: 28,
    citizenVotesReopened: 1,
    userVerificationState: 'none'
  },
  {
    id: 't-103',
    ticketNumber: 'NMC-2026-6210',
    title: 'Water Pipeline Burst & Road Submersion',
    titleMr: 'पाण्याची पाईपलाईन फुटल्याने रस्ता जलमय',
    hazardType: 'WATER_LEAKAGE',
    ward: 'Cidco',
    location: 'Trimurti Chowk Bus Stand Avenue, Cidco',
    coordinates: [19.9690, 73.7620],
    status: 'EVIDENCE_UPLOADED',
    submittedDate: '07 Aug 2026',
    assignedEngineer: 'Er. Amit Shinde (Ward Eng - Cidco)',
    contractorAgency: 'Maharashtra Water Works',
    dlpExpiryDate: '01 Aug 2028',
    beforePhoto: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=600&auto=format&fit=crop&q=80',
    afterPhoto: 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=600&auto=format&fit=crop&q=80',
    aiConfidence: 92,
    citizenVotesConfirmed: 9,
    citizenVotesReopened: 0,
    userVerificationState: 'none'
  }
];
