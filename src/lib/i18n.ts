import { LanguageCode, HazardCategory, ReportStatus, SeverityLevel } from '../types/database';

export interface Translations {
  appName: string;
  prototypeNotice: string;
  tagline: string;
  taglineSub: string;
  reportHazard: string;
  viewPublicStats: string;
  howItWorks: string;
  step1Title: string;
  step1Desc: string;
  step2Title: string;
  step2Desc: string;
  step3Title: string;
  step3Desc: string;
  signIn: string;
  signUp: string;
  signOut: string;
  email: string;
  password: string;
  fullName: string;
  myReports: string;
  staffWorkspace: string;
  adminWorkspace: string;
  language: string;
  noAccessTitle: string;
  noAccessDesc: string;
  backToHome: string;
  trackReport: string;
  status: string;
  category: string;
  priority: string;
  location: string;
  evidence: string;
  resolution: string;
  filterByStatus: string;
  noReportsFound: string;
  fileFirstReport: string;
  useMyLocation: string;
  locationHelp: string;
  addressLabel: string;
  severityLabel: string;
  titleLabel: string;
  descLabel: string;
  photosLabel: string;
  photosHelp: string;
  speechToTextStart: string;
  speechToTextStop: string;
  speechUnsupported: string;
  duplicateNotice: string;
  duplicateConfirmThis: string;
  duplicateIsDifferent: string;
  submitReport: string;
  submitting: string;
  successRefCode: string;
  successMsg: string;
  slaDue: string;
  timeline: string;
  whyThisPriority: string;
  actions: string;
  verify: string;
  reject: string;
  markDuplicate: string;
  assign: string;
  overridePriority: string;
  startWork: string;
  resolveReport: string;
  reopen: string;
  reasonRequired: string;
  offlineDraftSaved: string;
  waitingToSend: string;
  backOnlineSynced: string;
  liveUpdates: string;
}

const en: Translations = {
  appName: 'NagrikPrahari',
  prototypeNotice: 'Prototype — sample data only',
  tagline: 'Civic hazard reporting and resolution platform for Indian municipal bodies.',
  taglineSub: 'Citizens report infrastructure hazards with location and photos. Municipal reviewers verify and prioritise. Officers resolve with photographic evidence.',
  reportHazard: 'Report a hazard',
  viewPublicStats: 'View public statistics',
  howItWorks: 'How the resolution ledger operates',
  step1Title: 'Citizen report filed',
  step1Desc: 'Incident location, severity, and photo evidence are logged onto the immutable municipal register.',
  step2Title: 'Verified & prioritised',
  step2Desc: 'Municipal reviewers examine reports, eliminate duplicates, and assign SLA deadlines to the competent department.',
  step3Title: 'Resolved with evidence',
  step3Desc: 'Ward field officers conduct repairs and upload mandatory resolution photographic proof before closing.',
  signIn: 'Sign in',
  signUp: 'Create account',
  signOut: 'Sign out',
  email: 'Email address',
  password: 'Password',
  fullName: 'Full name',
  myReports: 'My reports',
  staffWorkspace: 'Staff workspace',
  adminWorkspace: 'Administration',
  language: 'Language',
  noAccessTitle: 'Access restricted',
  noAccessDesc: 'You do not have administrative permission to view this section.',
  backToHome: 'Return to home',
  trackReport: 'Track report',
  status: 'Status',
  category: 'Category',
  priority: 'Priority',
  location: 'Location',
  evidence: 'Photographic evidence',
  resolution: 'Resolution proof',
  filterByStatus: 'Filter by status',
  noReportsFound: 'No reports filed yet',
  fileFirstReport: 'File your first hazard report',
  useMyLocation: 'Use current GPS location',
  locationHelp: 'Click or drag the pin on the map to accurately pinpoint the hazard.',
  addressLabel: 'Street address / landmark',
  severityLabel: 'Observed severity',
  titleLabel: 'Summary title',
  descLabel: 'Detailed description',
  photosLabel: 'Attach photographs (1 to 3 images, max 5 MB each)',
  photosHelp: 'Clear photographs assist municipal engineers in prompt verification.',
  speechToTextStart: 'Dictate description (voice)',
  speechToTextStop: 'Stop dictation',
  speechUnsupported: 'Voice dictation is not supported in this browser.',
  duplicateNotice: 'Similar nearby reports detected within 30 meters.',
  duplicateConfirmThis: 'This is the same problem — confirm it',
  duplicateIsDifferent: 'This is different — continue filing',
  submitReport: 'Submit hazard report',
  submitting: 'Submitting report...',
  successRefCode: 'Report reference code',
  successMsg: 'Your report has been entered onto the municipal ledger.',
  slaDue: 'SLA target resolution date',
  timeline: 'Audit & progress timeline',
  whyThisPriority: 'Priority score breakdown',
  actions: 'Department actions',
  verify: 'Verify report',
  reject: 'Reject report',
  markDuplicate: 'Mark as duplicate',
  assign: 'Assign department',
  overridePriority: 'Override priority',
  startWork: 'Start field work',
  resolveReport: 'Record resolution',
  reopen: 'Reopen report',
  reasonRequired: 'Reason is required for this action',
  offlineDraftSaved: 'Device is offline. Report saved locally and will auto-sync when connected.',
  waitingToSend: 'Waiting to send (saved offline)',
  backOnlineSynced: 'Back online. Offline report synced successfully.',
  liveUpdates: 'Live updates active',
};

const hi: Translations = {
  appName: 'नागरिक प्रहरी',
  prototypeNotice: 'प्रोटोटाइप — केवल नमूना डेटा',
  tagline: 'भारतीय नगर निकायों के लिए नागरिक समस्या रिपोर्टिंग और समाधान मंच।',
  taglineSub: 'नागरिक स्थान और फोटो के साथ बुनियादी ढांचे के खतरों की रिपोर्ट करते हैं। नगर निगम अधिकारी सत्यापित और हल करते हैं।',
  reportHazard: 'समस्या की रिपोर्ट करें',
  viewPublicStats: 'सार्वजनिक आंकड़े देखें',
  howItWorks: 'समाधान प्रक्रिया कैसे कार्य करती है',
  step1Title: 'नागरिक द्वारा रिपोर्ट दर्ज',
  step1Desc: 'घटना का स्थान, गंभीरता और फोटो साक्ष्य नगरपालिका रिकॉर्ड में दर्ज होते हैं।',
  step2Title: 'सत्यापित और प्राथमिकता निर्धारण',
  step2Desc: 'समीक्षक रिपोर्ट की जांच करते हैं, डुप्लीकेट हटाते हैं और संबंधित विभाग को समय सीमा सौंपते हैं।',
  step3Title: 'साक्ष्य के साथ समाधान',
  step3Desc: 'फील्ड अधिकारी मरम्मत करते हैं और बंद करने से पहले अनिवार्य समाधान फोटो अपलोड करते हैं।',
  signIn: 'लॉग इन करें',
  signUp: 'खाता बनाएं',
  signOut: 'लॉग आउट',
  email: 'ईमेल पता',
  password: 'पासवर्ड',
  fullName: 'पूरा नाम',
  myReports: 'मेरी रिपोर्ट',
  staffWorkspace: 'अधिकारी कार्यक्षेत्र',
  adminWorkspace: 'प्रशासन',
  language: 'भाषा',
  noAccessTitle: 'पहुंच प्रतिबंधित है',
  noAccessDesc: 'आपके पास इस अनुभाग को देखने की अनुमति नहीं है।',
  backToHome: 'होम पेज पर लौटें',
  trackReport: 'रिपोर्ट ट्रैक करें',
  status: 'स्थिति',
  category: 'श्रेणी',
  priority: 'प्राथमिकता',
  location: 'स्थान',
  evidence: 'फोटो साक्ष्य',
  resolution: 'समाधान का प्रमाण',
  filterByStatus: 'स्थिति के अनुसार फ़िल्टर करें',
  noReportsFound: 'अभी तक कोई रिपोर्ट दर्ज नहीं की गई है',
  fileFirstReport: 'अपनी पहली रिपोर्ट दर्ज करें',
  useMyLocation: 'वर्तमान जीपीएस स्थान का उपयोग करें',
  locationHelp: 'नक्शे पर पिन को सटीक स्थान पर खींचें।',
  addressLabel: 'पता / लैंडमार्क',
  severityLabel: 'गंभीरता का स्तर',
  titleLabel: 'शीर्षक',
  descLabel: 'विस्तृत विवरण',
  photosLabel: 'तस्वीरें संलग्न करें (1 से 3 तस्वीरें, अधिकतम 5 एमबी)',
  photosHelp: 'स्पष्ट तस्वीरें अधिकारियों को त्वरित सत्यापन में मदद करती हैं।',
  speechToTextStart: 'बोलकर लिखें (वॉइस इनपुट)',
  speechToTextStop: 'रिकॉर्डिंग बंद करें',
  speechUnsupported: 'इस ब्राउज़र में वॉइस इनपुट समर्थित नहीं है।',
  duplicateNotice: '30 मीटर के भीतर समान समस्याएं पाई गईं।',
  duplicateConfirmThis: 'यह वही समस्या है — पुष्टि करें',
  duplicateIsDifferent: 'यह अलग समस्या है — आगे बढ़ें',
  submitReport: 'रिपोर्ट सबमिट करें',
  submitting: 'सबमिट किया जा रहा है...',
  successRefCode: 'रिपोर्ट संदर्भ कोड',
  successMsg: 'आपकी रिपोर्ट दर्ज कर ली गई है।',
  slaDue: 'नियत समाधान तिथि (SLA)',
  timeline: 'प्रगति समयरेखा',
  whyThisPriority: 'प्राथमिकता स्कोर का विवरण',
  actions: 'विभागीय कार्रवाई',
  verify: 'सत्यापित करें',
  reject: 'अस्वीकार करें',
  markDuplicate: 'डुप्लिकेट चिह्नित करें',
  assign: 'विभाग सौंपें',
  overridePriority: 'प्राथमिकता बदलें',
  startWork: 'कार्य शुरू करें',
  resolveReport: 'समाधान दर्ज करें',
  reopen: 'पुनः खोलें',
  reasonRequired: 'इस कार्रवाई के लिए कारण आवश्यक है',
  offlineDraftSaved: 'इंटरनेट बंद है। रिपोर्ट सुरक्षित कर ली गई है और ऑनलाइन होने पर सिंक होगी।',
  waitingToSend: 'भेजने की प्रतीक्षा में (ऑफ़लाइन सुरक्षित)',
  backOnlineSynced: 'ऑनलाइन आ गए हैं। ऑफ़लाइन रिपोर्ट सफलतापूर्वक भेजी गई।',
  liveUpdates: 'लाइव अपडेट सक्रिय हैं',
};

const te: Translations = {
  appName: 'నాగరిక్ ప్రహరి',
  prototypeNotice: 'నమూనా రూపం — నమూనా సమాచారం మాత్రమే',
  tagline: 'భారతీయ నగర పాలక సంస్థల కోసం పౌర సమస్యల నివేదిక మరియు పరిష్కార వేదిక.',
  taglineSub: 'పౌరులు ప్రదేశం మరియు ఛాయాచిత్రంతో మౌలిక వసతుల సమస్యలను నివేదిస్తారు. అధికారులు పరిశీలించి ఫొటో రుజువుతో పరిష్కరిస్తారు.',
  reportHazard: 'సమస్యను నివేదించండి',
  viewPublicStats: 'ప్రజా గణాంకాలను చూడండి',
  howItWorks: 'పరిష్కార విధానం ఎలా పనిచేస్తుంది',
  step1Title: 'పౌరుల నివేదిక నమోదు',
  step1Desc: 'సమస్య ప్రదేశం, తీవ్రత మరియు ఫొటో సాక్ష్యాలు అధికారిక రికార్డులో నమోదవుతాయి.',
  step2Title: 'ధృవీకరణ మరియు ప్రాధాన్యత',
  step2Desc: 'సమీక్షకులు నివేదికలను పరిశీలించి, సంబంధిత విభాగానికి గడువును కేటాయిస్తారు.',
  step3Title: 'సాక్ష్యంతో పరిష్కారం',
  step3Desc: 'ఫీల్డ్ అధికారులు మరమ్మతులు పూర్తి చేసి, పరిష్కార ఫొటోను అప్‌లోడ్ చేస్తారు.',
  signIn: 'లాగిన్ అవ్వండి',
  signUp: 'ఖాతాను సృష్టించండి',
  signOut: 'లాగ్ అవుట్',
  email: 'ఈమెయిల్ చిరునామా',
  password: 'పాస్‌వర్డ్',
  fullName: 'పూర్తి పేరు',
  myReports: 'నా నివేదికలు',
  staffWorkspace: 'అధికారుల విభాగం',
  adminWorkspace: 'పరిపాలన',
  language: 'భాష',
  noAccessTitle: 'ప్రవేశం పరిమితం చేయబడింది',
  noAccessDesc: 'ఈ విభాగంలో ప్రవేశించడానికి మీకు అనుమతి లేదు.',
  backToHome: 'హోమ్‌కు తిరిగి వెళ్లండి',
  trackReport: 'నివేదికను ట్రాక్ చేయండి',
  status: 'స్థితి',
  category: 'వర్గం',
  priority: 'ప్రాధాన్యత',
  location: 'ప్రదేశం',
  evidence: 'ఫొటో సాక్ష్యం',
  resolution: 'పరిష్కార రుజువు',
  filterByStatus: 'స్థితి ద్వారా ఫిల్టర్ చేయండి',
  noReportsFound: 'ఇంకా ఎటువంటి నివేదికలు నమోదు కాలేదు',
  fileFirstReport: 'మీ మొదటి నివేదికను సమర్పించండి',
  useMyLocation: 'ప్రస్తుత GPS ప్రదేశాన్ని వాడండి',
  locationHelp: 'మ్యాప్‌పై ఉన్న పిన్‌ను ఖచ్చితమైన ప్రదేశానికి జరపండి.',
  addressLabel: 'చిరునామా / ల్యాండ్‌మార్క్',
  severityLabel: 'తీవ్రత స్థాయి',
  titleLabel: 'శీర్షిక',
  descLabel: 'వివరణ',
  photosLabel: 'ఛాయాచిత్రాలు జతచేయండి (1 నుండి 3 చిత్రాలు, గరిష్టంగా 5 MB)',
  photosHelp: 'స్పష్టమైన చిత్రాలు అధికారులకు వేగంగా ధృవీకరించడంలో సహాయపడతాయి.',
  speechToTextStart: 'మాటలతో వివరణను నమోదు చేయండి',
  speechToTextStop: 'రికార్డింగ్ ఆపండి',
  speechUnsupported: 'ఈ బ్రౌజర్‌లో వాయిస్ ఇన్పుట్ సదుపాయం లేదు.',
  duplicateNotice: '30 మీటర్ల పరిధిలో ఇటువంటి సమస్యలు ఉన్నాయి.',
  duplicateConfirmThis: 'ఇది అదే సమస్య — నిర్ధారించండి',
  duplicateIsDifferent: 'ఇది వేరే సమస్య — కొనసాగించండి',
  submitReport: 'నివేదికను సమర్పించండి',
  submitting: 'సమర్పిస్తోంది...',
  successRefCode: 'నివేదిక సంఖ్య (రెఫరెన్స్ కోడ్)',
  successMsg: 'మీ నివేదిక విజయవంతంగా నమోదు చేయబడింది.',
  slaDue: 'గడువు తేదీ (SLA)',
  timeline: 'పురోగతి కాలక్రమం',
  whyThisPriority: 'ప్రాధాన్యత స్కోరు వివరాలు',
  actions: 'విభాగాధికారుల చర్యలు',
  verify: 'ధృవీకరించండి',
  reject: 'తిరస్కరించండి',
  markDuplicate: 'డూప్లికేట్‌గా గుర్తించండి',
  assign: 'విభాగం కేటాయించండి',
  overridePriority: 'ప్రాధాన్యతను మార్చండి',
  startWork: 'పని ప్రారంభించండి',
  resolveReport: 'పరిష్కారం నమోదు చేయండి',
  reopen: 'మళ్లీ తెరవండి',
  reasonRequired: 'ఈ చర్యకు కారణం తప్పనిసరి',
  offlineDraftSaved: 'ఇంటర్నెట్ లేదు. నివేదిక స్థానికంగా భద్రపరచబడింది, ఆన్‌లైన్ రాగానే స్వయంచాలకంగా పంపబడుతుంది.',
  waitingToSend: 'పంపడానికి వేచి ఉంది (ఆఫ్‌లైన్ నిల్వ)',
  backOnlineSynced: 'ఆన్‌లైన్‌లోకి వచ్చారు. ఆఫ్‌లైన్ నివేదిక పంపబడింది.',
  liveUpdates: 'లైవ్ అప్‌డేట్‌లు అందుబాటులో ఉన్నాయి',
};

export const translations: Record<LanguageCode, Translations> = { en, hi, te };

export const CATEGORY_LABELS: Record<HazardCategory, { en: string; hi: string; te: string }> = {
  pothole: { en: 'Pothole', hi: 'गड्ढा (पॉटहोल)', te: 'గుంత (పాట్‌హోల్)' },
  damaged_road: { en: 'Damaged road surface', hi: 'क्षतिग्रस्त सड़क', te: 'పాడైన రోడ్డు' },
  broken_streetlight: { en: 'Broken streetlight', hi: 'खराब स्ट्रीट लाइट', te: 'పనిచేయని వీధి దీపం' },
  waterlogging: { en: 'Waterlogging & stagnation', hi: 'जलभराव', te: 'నీరు నిలవడం (వాటర్‌లాగింగ్)' },
  open_drain: { en: 'Open or overflowing drain', hi: 'खुला या बहता नाला', te: 'తెరిచి ఉన్న డ్రైనేజీ' },
  fallen_tree: { en: 'Fallen tree or branch', hi: 'गिरा हुआ पेड़ / शाखा', te: 'కూలిన చెట్టు' },
  damaged_footpath: { en: 'Damaged footpath', hi: 'क्षतिग्रस्त फुटपाथ', te: 'పాడైన ఫుట్‌పాత్' },
  garbage_overflow: { en: 'Garbage dump overflow', hi: 'कचरे का ढेर', te: 'చెత్త కుప్ప పేరుకుపోవడం' },
  other: { en: 'Other infrastructure hazard', hi: 'अन्य खतरा', te: 'ఇతర సమస్య' },
};

export const SEVERITY_DEFINITIONS: Record<SeverityLevel, { label: string; desc: string }> = {
  low: {
    label: 'Low',
    desc: 'Minor disruption, does not impede general traffic or safety.',
  },
  medium: {
    label: 'Medium',
    desc: 'Noticeable inconvenience, slows traffic or poses minor risk.',
  },
  high: {
    label: 'High',
    desc: 'Significant hazard, likelihood of vehicle damage or pedestrian injury.',
  },
  critical: {
    label: 'Critical',
    desc: 'Immediate severe danger to life, major thoroughfare blocked, deep live hazard.',
  },
};
