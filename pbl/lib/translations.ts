import { Language } from './types';

export const translations = {
  en: {
    appTitle: 'Nashik Monitor',
    appSubtitle: 'Nashik Municipal Corporation (NMC) Citizen Accountability Platform',
    tagline: 'Closed ≠ Resolved',
    taglineDesc: 'Municipal contractors cannot unilaterally close complaints. Citizens verify proof before final resolution.',
    
    // Roles
    roleCitizen: 'Citizen',
    roleEngineer: 'NMC Ward Engineer',
    roleContractor: 'Road Contractor',
    switchRole: 'Switch Role / Portal',
    
    // Navigation Tabs
    tabHome: 'Overview',
    tabFeed: 'Civic Feed',
    tabMap: 'GIS Map',
    tabVerify: 'Verify Proof',
    tabAdmin: 'Admin',
    tabRules: 'Rules & Help',
    
    // Landing Page
    landingBadge: 'Official Civic Technology Initiative • Nashik Municipal Corporation',
    landingHeadline: 'Accountability in Every Road. Proof in Every Repair.',
    landingSubheadline: 'Eliminating the broken municipal practice of premature ticket closure. A citizen-governed platform enforcing side-by-side photographic evidence, community verification voting, and multi-year Defect Liability Period (DLP) contractor warranties across Nashik.',
    enterPortalBtn: 'Launch Live Civic Portal',
    reportIssueBtn: 'Report a Road Defect',
    howItWorksHeading: 'The Core Doctrine: Why "Closed ≠ Resolved"?',
    howItWorksDesc: 'Historically, civic complaints were prematurely closed by contractors uploading irrelevant photos or marking tickets "Done". In Nashik, we have mathematically banned unilateral closure.',
    
    // Filters & Actions
    allWards: 'All 6 NMC Wards',
    allCategories: 'All Civic Hazards',
    allStatuses: 'All Ticket Statuses',
    reportHazard: 'Report Civic Hazard',
    filterByWard: 'Filter by Ward',
    sortBy: 'Sort by',
    highestImpact: 'Highest Impact Score',
    mostRecent: 'Most Recent',
    mostUpvoted: 'Most Upvoted (+1)',
    
    // Wards
    wardPanchavati: 'Panchavati',
    wardNashikEast: 'Nashik East',
    wardNashikWest: 'Nashik West',
    wardCidco: 'Cidco',
    wardSatpur: 'Satpur',
    wardNashikRoad: 'Nashik Road',
    
    // Categories
    catRoadCaveIn: 'Road Cave-In',
    catPothole: 'Severe Pothole',
    catOpenManhole: 'Open Drainage Manhole',
    catElectricalWire: 'Dangling Electrical Wire',
    catWaterLogging: 'Monsoon Water Logging',
    catOther: 'Other Civic Defect',
    
    // Statuses
    statusSubmitted: 'Submitted',
    statusInProgress: 'In Progress',
    statusResolvedByContractor: 'Resolved by Contractor',
    statusVerificationPending: 'Citizen Verification Pending',
    statusOfficiallyClosed: 'Officially Closed',
    statusReopened: 'Reopened by Citizens',
    
    // Road Phases
    phaseTrenching: '🔴 Trenching & Excavation',
    phaseConcreting: '🟡 Concreting / Asphalting',
    phaseWaterCuring: '🔵 Water Curing Phase',
    phaseCompleted: '🟢 Completed & Verified (DLP Active)',
    
    // Metrics
    metricTotalComplaints: 'Active Complaints',
    metricUnderVerification: 'Under Citizen Verification',
    metricReopenedRate: 'Citizen Reopened Rate',
    metricActiveRoadWorks: 'Monitored DLP Road Works',
    
    // Verification Engine
    beforePhoto: 'Geotagged Before Repair',
    afterPhoto: 'Contractor After Repair Evidence',
    confirmFixBtn: 'Confirm Fix (Vote Resolved)',
    reopenBtn: 'Reopen Ticket (Substandard Work)',
    verificationScore: 'Community Verification Score',
    verificationThreshold: 'Requires 3 citizen confirmations to officially seal',
    alreadyVotedConfirm: 'You confirmed this fix',
    alreadyVotedReopen: 'You flagged this to Executive Engineer',
    
    // Social Feed
    endorseBtn: '+1 I Face This Too',
    impactScoreLabel: 'Civic Impact Score',
    tenderIdLabel: 'Tender ID',
    contractorLabel: 'Contractor',
    dlpCountdownLabel: 'DLP Warranty Countdown',
    dlpRemaining: 'Remaining under warranty',
    dlpExpired: 'Warranty Expired',
    
    // AI Chatbot
    chatTitle: 'Nashik Civic AI Assistant',
    chatPlaceholder: 'Describe any road or municipal hazard in English or Marathi...',
    chatSend: 'Analyze Hazard',
    chatConfidence: 'Intent Confidence',
    chatPrefillModal: 'Draft Official Complaint',
    chatSuggestions: [
      'Deep pothole on Gangapur Road near ABB Circle',
      'Open manhole cover near Ramkund Panchavati',
      'Dangling live electric wire at Nashik Road Station',
      'Road trenching left open on College Road without warning board'
    ],
    
    // Rules & Emergency
    finesHeading: 'NMC Solid Waste & Road Cutting Bylaws',
    fineAmount: '₹5,000 Spot Penalty',
    fineDebrisDesc: 'Illegal debris, construction material, or garbage dumping on municipal roads attracts an immediate ₹5,000 penalty under NMC Swachhata Bylaws 2023.',
    roadCuttingBylaw: 'Unauthorized road cutting for utility cables without NMC PWD permission carries criminal FIR & contractor blacklisting.',
    emergencyContactsTitle: '24x7 Nashik Emergency Contacts',
    nmcControlRoom: 'NMC 24x7 Control Room: 0253-2575631 / 7030300300',
    msedclElectricity: 'MSEDCL Electricity Emergency: 1912',
    policeHelpline: 'Nashik City Police: 112',
    fireBrigade: 'Fire Emergency: 101',
    disasterCell: 'Nashik District Disaster Cell: 1077',
    
    // Modal
    submitModalTitle: 'File Civic Complaint (NMC Geotagged)',
    complaintTitleLabel: 'Title / Landmark',
    complaintDescLabel: 'Detailed Description of Defect',
    wardLabel: 'Administrative Ward',
    locationLabel: 'Location / Landmark Address',
    photoUploadLabel: 'Upload "Before Repair" Evidence Photo',
    gpsNotice: 'GPS coordinates will be securely recorded for contractor accountability.',
    submitBtn: 'Submit to Ward Executive Engineer',
    submittingBtn: 'Submitting...',
    
    // Admin & Contractor
    adminPanelTitle: 'NMC Ward Governance & Contractor Control Tower',
    kpiSummary: 'Ward Engineering Performance & Accountability Matrix',
    assignTender: 'Assign Contractor',
    updatePhase: 'Advance Road Work Phase',
    uploadProof: 'Upload Contractor Completion Proof',
    reopenedAlert: 'Substandard Work Alert: This ticket was reopened by citizens!'
  },
  
  mr: {
    appTitle: 'नाशिक मॉनिटर',
    appSubtitle: 'नाशिक महानगरपालिका (NMC) नागरिक उत्तरदायित्व मंच',
    tagline: 'बंद म्हणजे निराकरण नव्हे! (Closed ≠ Resolved)',
    taglineDesc: 'महापालिका कंत्राटदार तक्रार परस्पर बंद करू शकत नाहीत. नागरिक प्रत्यक्ष पुरावा तपासूनच निकाल देतात.',
    
    // Roles
    roleCitizen: 'नागरिक (Citizen)',
    roleEngineer: 'प्रभाग अभियंता (NMC)',
    roleContractor: 'रस्ता कंत्राटदार (Contractor)',
    switchRole: 'भूमिका / पोर्टल बदला',
    
    // Navigation Tabs
    tabHome: 'परिचय',
    tabFeed: 'तक्रारी',
    tabMap: 'नकाशा',
    tabVerify: 'पडताळणी',
    tabAdmin: 'प्रशासन',
    tabRules: 'नियम व मदत',
    
    // Landing Page
    landingBadge: 'अधिकृत नागरी तंत्रज्ञान पुढाकार • नाशिक महानगरपालिका',
    landingHeadline: 'प्रत्येक रस्त्यावर उत्तरदायित्व. प्रत्येक दुरुस्तीचा प्रत्यक्ष पुरावा.',
    landingSubheadline: 'तक्रार परस्पर बंद करण्याच्या जुन्या पद्धतीला पूर्णविराम. दुरुस्तीपूर्वी व नंतरच्या फोटोंची पडताळणी, नागरिकांचे मतदान आणि कंत्राटदारांच्या ३ ते ५ वर्षांच्या दोष दायित्व कालावधी (DLP) वॉरंटीची संपूर्ण नाशिकमध्ये अंमलबजावणी.',
    enterPortalBtn: 'थेट पोर्टल सुरू करा',
    reportIssueBtn: 'रस्त्यातील समस्येची नोंद करा',
    howItWorksHeading: 'मूळ संकल्पना: "बंद म्हणजे निराकरण नव्हे!" का?',
    howItWorksDesc: 'पूर्वी कंत्राटदार केवळ कागदोपत्री तक्रारी बंद करत. आता नाशिकमध्ये कंत्राटदारांना स्वतः तक्रार बंद करण्यास कायदेशीर बंदी आहे. प्रत्यक्ष ३ स्थानिक नागरिकांच्या संमतीनंतरच तक्रार बंद होते.',
    
    // Filters & Actions
    allWards: 'सर्व ६ प्रभाग',
    allCategories: 'सर्व नागरी समस्या',
    allStatuses: 'सर्व स्थिती',
    reportHazard: 'तक्रार नोंदवा',
    filterByWard: 'प्रभागानुसार फिल्टर',
    sortBy: 'क्रमवारी',
    highestImpact: 'सर्वाधिक प्रभाव (Impact)',
    mostRecent: 'सर्वात नवीन',
    mostUpvoted: 'सर्वाधिक नागरिकांची मते (+1)',
    
    // Wards
    wardPanchavati: 'पंचवटी',
    wardNashikEast: 'नाशिक पूर्व',
    wardNashikWest: 'नाशिक पश्चिम',
    wardCidco: 'सिडको',
    wardSatpur: 'सातपूर',
    wardNashikRoad: 'नाशिक रोड',
    
    // Categories
    catRoadCaveIn: 'रस्ता खचणे (Road Cave-In)',
    catPothole: 'खड्डा (Severe Pothole)',
    catOpenManhole: 'उघडे मॅनहोल (Open Manhole)',
    catElectricalWire: 'लटकती विजेची तार (Electrical Wire)',
    catWaterLogging: 'पाणी साचणे (Water Logging)',
    catOther: 'इतर नागरी समस्या',
    
    // Statuses
    statusSubmitted: 'नोंदणीकृत',
    statusInProgress: 'काम सुरू आहे',
    statusResolvedByContractor: 'कंत्राटदाराने दुरुस्त केले',
    statusVerificationPending: 'नागरिक पडताळणी प्रलंबित',
    statusOfficiallyClosed: 'अधिकृतपणे बंद',
    statusReopened: 'नागरिकांनी पुन्हा उघडले',
    
    // Road Phases
    phaseTrenching: '🔴 खणन काम (Trenching)',
    phaseConcreting: '🟡 काँक्रिटीकरण (Concreting)',
    phaseWaterCuring: '🔵 पाणी क्युरिंग (Curing)',
    phaseCompleted: '🟢 पूर्ण व सत्यापित (DLP वॉरंटी)',
    
    // Metrics
    metricTotalComplaints: 'एकूण तक्रारी',
    metricUnderVerification: 'नागरिक पडताळणी सुरू',
    metricReopenedRate: 'नागरिक फेरउघडणी दर',
    metricActiveRoadWorks: 'निरीक्षणाखालील रस्ते कामे',
    
    // Verification Engine
    beforePhoto: 'दुरुस्तीपूर्वीचा जिओटॅग फोटो (Before)',
    afterPhoto: 'कंत्राटदाराचा दुरुस्तीनंतरचा पुरावा (After)',
    confirmFixBtn: 'दुरुस्ती मान्य (Confirm Fix)',
    reopenBtn: 'तक्रार पुन्हा उघडा (निकृष्ट काम)',
    verificationScore: 'नागरिक पडताळणी स्कोअर',
    verificationThreshold: 'अधिकृत बंद करण्यासाठी ३ नागरिकांची संमती आवश्यक',
    alreadyVotedConfirm: 'तुम्ही ही दुरुस्ती मान्य केली आहे',
    alreadyVotedReopen: 'तुम्ही कार्यकारी अभियंत्यांकडे फेरतक्रार केली आहे',
    
    // Social Feed
    endorseBtn: '+1 मलाही ही समस्या आहे',
    impactScoreLabel: 'नागरी प्रभाव स्कोअर',
    tenderIdLabel: 'निविदा क्र.',
    contractorLabel: 'कंत्राटदार',
    dlpCountdownLabel: 'दोष दायित्व कालावधी (DLP)',
    dlpRemaining: 'वॉरंटी शिल्लक',
    dlpExpired: 'वॉरंटी संपली',
    
    // AI Chatbot
    chatTitle: 'नाशिक नागरी AI सहाय्यक',
    chatPlaceholder: 'रस्ते किंवा महापालिका समस्या इंग्रजी किंवा मराठीत लिहा...',
    chatSend: 'तपासा',
    chatConfidence: 'अचूकता विश्वासार्हता',
    chatPrefillModal: 'अधिकृत तक्रार मसुदा भरा',
    chatSuggestions: [
      'गंगापूर रोड एबीबी सर्कल जवळ मोठा खड्डा पडला आहे',
      'पंचवटी रामकुंडाजवळ ड्रेनेज मॅनहोल उघडे आहे',
      'नाशिक रोड रेल्वे स्टेशन बाहेर विजेची तार लटकत आहे',
      'कॉलेज रोडवर खोदकाम करून सूचना फलकाशिवाय सोडले आहे'
    ],
    
    // Rules & Emergency
    finesHeading: 'मनपा घनकचरा व रस्ता खोदकाम उपविधी',
    fineAmount: '₹५,००० जागेवरच दंड',
    fineDebrisDesc: 'सार्वजनिक रस्त्यावर बेकायदेशीर कचरा, डेब्रीस किंवा बांधकाम साहित्य टाकल्यास मनपाच्या २०२३ उपविधीनुसार त्वरित ₹५,००० दंड आकारला जाईल.',
    roadCuttingBylaw: 'मनपाच्या पूर्वपरवानगीशिवाय केबल्ससाठी रस्ता खोदल्यास ठेकेदारावर फौजदारी गुन्हा व काळ्या यादीत समावेश.',
    emergencyContactsTitle: '२४x७ नाशिक आपत्कालीन संपर्क',
    nmcControlRoom: 'मनपा २४x७ नियंत्रण कक्ष: ०२५३-२५७५६३१ / ७०३०३००३००',
    msedclElectricity: 'महावितरण वीज आपत्कालीन: १९१२',
    policeHelpline: 'नाशिक शहर पोलीस: ११२',
    fireBrigade: 'अग्निशामक दल: १०१',
    disasterCell: 'नाशिक जिल्हा आपत्ती व्यवस्थापन कक्ष: १०७७',
    
    // Modal
    submitModalTitle: 'नागरी तक्रार नोंदणी (NMC Geotagged)',
    complaintTitleLabel: 'शीर्षक / ठिकाण',
    complaintDescLabel: 'समस्येचे सविस्तर वर्णन',
    wardLabel: 'प्रशासन प्रभाग',
    locationLabel: 'पत्ता / मुख्य खूण',
    photoUploadLabel: 'दुरुस्तीपूर्वीचा फोटो अपलोड करा',
    gpsNotice: 'कंत्राटदाराच्या उत्तरदायित्वासाठी जीपीएस समन्वय सुरक्षितपणे नोंदवले जातील.',
    submitBtn: 'प्रभाग कार्यकारी अभियंत्यांकडे पाठवा',
    submittingBtn: 'नोंदणी करत आहे...',
    
    // Admin & Contractor
    adminPanelTitle: 'मनपा प्रभाग प्रशासन व कंत्राटदार नियंत्रण कक्ष',
    kpiSummary: 'प्रभाग अभियांत्रिकी कार्यक्षमता व उत्तरदायित्व तक्ता',
    assignTender: 'कंत्राटदार नियुक्त करा',
    updatePhase: 'कामाचा पुढील टप्पा नोंदवा',
    uploadProof: 'कामाचा पूर्ण पुरावा फोटो अपलोड करा',
    reopenedAlert: 'निकृष्ट काम इशारा: ही तक्रार नागरिकांनी असमाधानी असल्याने पुन्हा उघडली आहे!'
  }
};

export function getTranslation(lang: Language) {
  return translations[lang] || translations.en;
}
