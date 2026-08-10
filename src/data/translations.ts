import { Language } from '../types';

export const translations: Record<Language, Record<string, string>> = {
  en: {
    // Header & Branding
    title: 'Nashik Roads & Civic Monitor',
    tagline: 'See it. Report it. Track it. Resolve it.',
    smartCityBadge: 'NMC Smart City Grid Active',
    reportHazard: 'Report Hazard',
    allWards: 'All Wards',
    panchavati: 'Panchavati',
    nashikEast: 'Nashik East',
    nashikWest: 'Nashik West',
    cidco: 'Cidco',
    satpur: 'Satpur',
    nashikRoad: 'Nashik Road',
    lightMode: 'Light Mode',
    darkMode: 'Dark Mode',
    
    // KPI Banner
    activeRoadWorks: 'Active Road Works',
    activeRoadWorksSub: 'Trenching, Concreting & Curing',
    potholesAttended: 'Potholes Attended',
    potholesAttendedSub: 'Inspected & Repaired YTD',
    slaRate: 'Resolution SLA Rate',
    slaRateSub: '3.2 Day Average Turnaround',
    escalatedTickets: 'Escalated Tickets',
    escalatedTicketsSub: 'Citizen Verification Pending',

    // GIS Map
    gisMapTitle: 'Interactive GIS Road Infrastructure Map',
    gisMapSub: 'Real-time tracking of civic projects, Defect Liability Periods (DLP), and contractor accountability across NMC wards.',
    filterByLifecycle: 'Filter by Work Lifecycle:',
    trenching: 'Trenching & Excavation',
    concreting: 'Concreting / Asphalting',
    curing: 'Water Curing (Traffic Restriction)',
    completed: 'Work Completed & Verified',
    contractor: 'Contractor:',
    budget: 'Sanctioned Budget:',
    dlp: 'Defect Liability Period (DLP):',
    completion: 'Est. Completion:',
    progressPhoto: 'Geotagged Progress Photo',

    // Chatbot Widget
    aiAssistantTitle: 'NMC Smart AI Civic Assistant',
    aiAssistantSub: 'Report hazards via instant natural language or image upload',
    chatPlaceholder: 'e.g., Live electrical wire sparking near K.K. Wagh College...',
    send: 'Send',
    intentDetected: 'AI Intent Classification',
    confidence: 'Confidence',
    deepLinkAction: 'Go to Auto-Filled Complaint Form',
    electricalHazardAlert: 'CRITICAL ELECTRICAL HAZARD DETECTED',
    
    // Civic Safety Rules
    civicSafetyTitle: 'Nashik Civic Safety & Norms',
    tabTraffic: 'Traffic & Road Rules',
    tabWaste: 'Waste & Sanitation',
    tabEmergency: 'Emergency Helpline Numbers',

    // Verification Tracker
    verificationTitle: 'Closed != Resolved Verification Portal',
    verificationSub: 'Hold contractors & ward engineers accountable. Citizens must verify repairs before official ticket closure.',
    beforeRepair: 'Before Repair (Citizen Evidence)',
    afterRepair: 'After Repair (Ward Engineer Upload)',
    confirmFixed: 'I Confirm It is Fixed',
    reopenEscalate: 'Not Fixed Properly - Reopen & Escalate',
    confirmedSuccess: 'Thank you! You verified this resolution. +50 Civic Points awarded.',
    escalatedWarning: 'Ticket Reopened & Escalated to NMC Chief Engineer & DLP Penalty Log.',

    // Modal
    submitComplaint: 'Submit Civic Grievance',
    hazardType: 'Hazard Category',
    location: 'Location Address',
    ward: 'Select Ward',
    uploadPhoto: 'Upload Evidence Photo',
    submitButton: 'Submit Complaint to NMC Grid',
    cancel: 'Cancel'
  },
  mr: {
    // Header & Branding
    title: 'नाशिक रस्ते आणि नागरी संनियंत्रण',
    tagline: 'पहा. नोंदवा. मागोवा घ्या. निरसन करा.',
    smartCityBadge: 'मनपा स्मार्ट सिटी ग्रिड सक्रिय',
    reportHazard: 'धोका नोंदवा',
    allWards: 'सर्व प्रभाग',
    panchavati: 'पंचवटी',
    nashikEast: 'नाशिक पूर्व',
    nashikWest: 'नाशिक पश्चिम',
    cidco: 'सिडको',
    satpur: 'सातपूर',
    nashikRoad: 'नाशिक रोड',
    lightMode: 'लाइट मोड',
    darkMode: 'डार्क मोड',

    // KPI Banner
    activeRoadWorks: 'सक्रिय रस्ते कामे',
    activeRoadWorksSub: 'ट्रेंचिंग, काँक्रीटीकरण आणि क्युअरींग',
    potholesAttended: 'खड्डे दुरुस्ती पूर्ण',
    potholesAttendedSub: 'या वर्षातील तपासणी आणि दुरुस्ती',
    slaRate: 'एसएलए निवारण दर',
    slaRateSub: '३.२ दिवसांची सरासरी गती',
    escalatedTickets: 'प्रलंबित तक्रारी',
    escalatedTicketsSub: 'नागरिक पडताळणी प्रलंबित',

    // GIS Map
    gisMapTitle: 'इंटरअॅक्टिव्ह जीआयएस रस्ते पायाभूत सुविधा नकाशा',
    gisMapSub: 'नाशिक महानगरपालिका प्रभागांमधील प्रकल्प, डीएलपी आणि कंत्राटदार जबाबदारीची थेट माहिती.',
    filterByLifecycle: 'कामाच्या टप्प्यानुसार फिल्टर:',
    trenching: 'उत्खनन आणि ट्रेंचिंग',
    concreting: 'काँक्रीटीकरण / डांबरीकरण',
    curing: 'वॉटर क्युअरींग (वाहतूक निर्बंध)',
    completed: 'काम पूर्ण आणि पडताळलेले',
    contractor: 'कंत्राटदार संस्था:',
    budget: 'मंजूर निधी:',
    dlp: 'दोष दायित्व कालावधी (DLP):',
    completion: 'अपेक्षित पूर्णता:',
    progressPhoto: 'जिओटॅग केलेला प्रगती फोटो',

    // Chatbot Widget
    aiAssistantTitle: 'मनपा स्मार्ट एआय नागरी सहाय्यक',
    aiAssistantSub: 'व्हॉइस/टेक्स्ट किंवा फोटोद्वारे त्वरित तक्रार नोंदवा',
    chatPlaceholder: 'उदा. के.के. वाघ कॉलेजजवळ विजेची तार लोंबकळत आहे...',
    send: 'पाठवा',
    intentDetected: 'एआय वर्गीकरण',
    confidence: 'विश्वासार्हता',
    deepLinkAction: 'आपोआप भरलेल्या तक्रार अर्जावर जा',
    electricalHazardAlert: 'गंभीर विद्युत धोका आढळला',

    // Civic Safety Rules
    civicSafetyTitle: 'नाशिक नागरी सुरक्षा आणि नियम',
    tabTraffic: 'वाहतूक व रस्ते नियम',
    tabWaste: 'कचरा व स्वच्छता',
    tabEmergency: 'आपत्कालीन हेल्पलाइन क्रमांक',

    // Verification Tracker
    verificationTitle: 'बंद != निराकरण (नागरिक पडताळणी पोर्टल)',
    verificationSub: 'कंत्राटदार आणि प्रभाग अभियंत्यांना उत्तरदायी ठेवा. अधिकृत तिकीट बंद होण्यापूर्वी नागरिकांनी कामाची पडताळणी करणे आवश्यक आहे.',
    beforeRepair: 'दुरुस्तीपूर्वी (नागरिक फोटो)',
    afterRepair: 'दुरुस्तीनंतर (प्रभाग अभियंता फोटो)',
    confirmFixed: 'मी पुष्टी करतो - काम पूर्ण झाले आहे',
    reopenEscalate: 'योग्य काम झाले नाही - पुन्हा उघडा व तक्रार करा',
    confirmedSuccess: 'धन्यवाद! आपण कामाची पुष्टी केली. +५० नागरी गुण मिळाले.',
    escalatedWarning: 'तक्रार पुनरुज्जीवित केली आणि मनपा मुख्य अभियंत्याकडे वर्ग केली.',

    // Modal
    submitComplaint: 'नागरी तक्रार नोंदवा',
    hazardType: 'धोक्याचा प्रकार',
    location: 'ठिकाण पत्ता',
    ward: 'प्रभाग निवडा',
    uploadPhoto: 'पुरावा फोटो अपलोड करा',
    submitButton: 'मनपा ग्रिडवर तक्रार सबमिट करा',
    cancel: 'रद्द करा'
  }
};
