/* ═══════════════════════════════════════════════════════════════════════════
   Quick Care — Data Store
   ═══════════════════════════════════════════════════════════════════════════ */

// Language Translations
const LANG_STRINGS = {
    en: {
        greeting: 'Good %time%, %name% 👋',
        howFeel: 'How are you feeling today?',
        welcome: 'Welcome',
        home: 'Home',
        chat: 'Chat',
        doctors: 'Doctors',
        hospitals: 'Hospitals',
        profile: 'Profile',
        skin: 'Skin',
        // Index page translations
        aiPowered: 'AI-Powered Healthcare',
        quickCare: 'Quick Care',
        heroSubtitle: 'Early Risk Detection & Smart Health Guidance for Rural Communities across India',
        voiceSupport: 'Voice Support',
        multiLanguage: 'Multi-Language',
        offlineCapable: 'Offline Capable',
        login: 'Login',
        register: 'Register',
        emailAddress: 'Email Address',
        emailPlaceholder: 'yourname@email.com',
        password: 'Password',
        passwordPlaceholder: 'Enter your password',
        loginBtn: '🔐 Login to Quick Care',
        demoText: 'Demo: Use any email and password to login',
        fullName: 'Full Name',
        namePlaceholder: 'e.g. Ravi Kumar',
        age: 'Age',
        gender: 'Gender',
        selectGender: 'Select',
        male: 'Male',
        female: 'Female',
        other: 'Other',
        minChars: 'Min. 8 characters',
        preferredLang: 'Preferred Language',
        createAccount: '✅ Create Account',
        trustedBy: 'Trusted by rural health workers across India',
        aiChat: 'AI Chat',
        skinAnalysis: 'Skin Analysis',
        findDoctors: 'Find Doctors',
        healthcareFingers: 'Healthcare at your fingertips'
    }
};

// Symptom Chips for different languages
const SYMPTOM_CHIPS = {
    en: [
        '🤒 Fever', '🤕 Headache', '🫀 Chest Pain', '😮‍💨 Breathlessness',
        '🤢 Nausea', '💊 Vomiting', '😵 Dizziness', '😫 Fatigue',
        '🤧 Cold/Cough', '🦷 Tooth Pain', '👁️ Eye Problem', '🦵 Joint Pain'
    ]
};

// Slang/Regional terms translation
const SLANG_MAP = {
};

// Doctors Database
const DOCTORS = [{
        id: 1,
        name: 'Dr. Suresh Babu Rao',
        specialty: 'General Physician',
        hospital: 'PHC Nellore',
        phone: '9441234567',
        exp: 12,
        lang: 'Telugu, English',
        fee: 150,
        rating: 4.8,
        image: '👨‍⚕️'
    },
    {
        id: 2,
        name: 'Dr. Lakshmi Devi',
        specialty: 'Gynecologist',
        hospital: 'Govt. Hospital Guntur',
        phone: '9848765432',
        exp: 15,
        lang: 'Telugu, Hindi',
        fee: 300,
        rating: 4.9,
        image: '👩‍⚕️'
    },
    {
        id: 3,
        name: 'Dr. Ramana Murthy',
        specialty: 'Cardiologist',
        hospital: 'King George Hospital, Vizag',
        phone: '9392345678',
        exp: 20,
        lang: 'Telugu, English, Hindi',
        fee: 500,
        rating: 4.9,
        image: '👨‍⚕️'
    },
    {
        id: 4,
        name: 'Dr. Padmavathi',
        specialty: 'Dermatologist (Skin)',
        hospital: 'Govt. Skin Hospital, Hyderabad',
        phone: '9908765432',
        exp: 10,
        lang: 'Telugu, Hindi, English',
        fee: 350,
        rating: 4.7,
        image: '👩‍⚕️'
    },
    {
        id: 5,
        name: 'Dr. Venkata Krishna',
        specialty: 'Pediatrician',
        hospital: 'PHC Tenali',
        phone: '9441876543',
        exp: 8,
        lang: 'Telugu, English',
        fee: 200,
        rating: 4.6,
        image: '👨‍⚕️'
    },
    {
        id: 6,
        name: 'Dr. Annapurna Reddy',
        specialty: 'General Physician',
        hospital: 'CHC Warangal',
        phone: '9866543210',
        exp: 9,
        lang: 'Telugu, Hindi',
        fee: 100,
        rating: 4.5,
        image: '👩‍⚕️'
    },
    {
        id: 7,
        name: 'Dr. Siva Prasad',
        specialty: 'Orthopedic Surgeon',
        hospital: 'Govt. Ortho Hospital, Vijayawada',
        phone: '9440123456',
        exp: 18,
        lang: 'Telugu, English',
        fee: 400,
        rating: 4.8,
        image: '👨‍⚕️'
    },
    {
        id: 8,
        name: 'Dr. Manjula Sharma',
        specialty: 'Pediatrician',
        hospital: 'Niloufer Hospital, Hyderabad',
        phone: '9849234567',
        exp: 14,
        lang: 'Hindi, Telugu, English',
        fee: 350,
        rating: 4.9,
        image: '👩‍⚕️'
    },
    {
        id: 9,
        name: 'Dr. Ravi Teja',
        specialty: 'General Physician',
        hospital: 'PHC Kurnool',
        phone: '9391234567',
        exp: 6,
        lang: 'Telugu, English',
        fee: 100,
        rating: 4.4,
        image: '👨‍⚕️'
    },
    {
        id: 10,
        name: 'Dr. Saritha Kumari',
        specialty: 'Gynecologist',
        hospital: 'Govt. Maternity Hospital, Tirupati',
        phone: '9876123456',
        exp: 11,
        lang: 'Telugu, Tamil',
        fee: 250,
        rating: 4.7,
        image: '👩‍⚕️'
    },
    {
        id: 11,
        name: 'Dr. Narasimha Rao',
        specialty: 'Cardiologist',
        hospital: 'NIMS Hospital, Hyderabad',
        phone: '9440987654',
        exp: 22,
        lang: 'Telugu, Hindi, English',
        fee: 600,
        rating: 4.9,
        image: '👨‍⚕️'
    },
    {
        id: 12,
        name: 'Dr. Usha Rani',
        specialty: 'Dermatologist (Skin)',
        hospital: 'PHC Eluru',
        phone: '9848321098',
        exp: 7,
        lang: 'Telugu',
        fee: 200,
        rating: 4.5,
        image: '👩‍⚕️'
    },
    {
        id: 13,
        name: 'Dr. Anil Kumar Reddy',
        specialty: 'ENT Specialist',
        hospital: 'Gandhi Hospital, Hyderabad',
        phone: '9876543210',
        exp: 16,
        lang: 'Telugu, Hindi, English',
        fee: 350,
        rating: 4.8,
        image: '👨‍⚕️'
    },
    {
        id: 14,
        name: 'Dr. Priya Sharma',
        specialty: 'Neurologist',
        hospital: 'Osmania Hospital, Hyderabad',
        phone: '9701234567',
        exp: 13,
        lang: 'Hindi, English',
        fee: 550,
        rating: 4.7,
        image: '👩‍⚕️'
    },
    {
        id: 15,
        name: 'Dr. Kiran Mohan',
        specialty: 'Psychiatrist',
        hospital: 'Institute of Mental Health, Hyderabad',
        phone: '9848112233',
        exp: 19,
        lang: 'Telugu, Hindi, English',
        fee: 500,
        rating: 4.8,
        image: '👨‍⚕️'
    },
    {
        id: 16,
        name: 'Dr. Sunitha Reddy',
        specialty: 'Ophthalmologist (Eye)',
        hospital: 'Sarojini Devi Eye Hospital, Hyderabad',
        phone: '9440556677',
        exp: 12,
        lang: 'Telugu, English',
        fee: 300,
        rating: 4.6,
        image: '👩‍⚕️'
    },
    {
        id: 17,
        name: 'Dr. Harish Chandra',
        specialty: 'Pulmonologist (Lungs)',
        hospital: 'Chest Hospital, Secunderabad',
        phone: '9849887766',
        exp: 17,
        lang: 'Telugu, Hindi, English',
        fee: 450,
        rating: 4.8,
        image: '👨‍⚕️'
    },
    {
        id: 18,
        name: 'Dr. Kavitha Prasad',
        specialty: 'Endocrinologist (Diabetes)',
        hospital: 'MNJ Cancer Hospital, Hyderabad',
        phone: '9912345678',
        exp: 14,
        lang: 'Telugu, English',
        fee: 500,
        rating: 4.7,
        image: '👩‍⚕️'
    },
    {
        id: 19,
        name: 'Dr. Rajesh Gupta',
        specialty: 'Gastroenterologist',
        hospital: 'Asian Institute of Gastro, Hyderabad',
        phone: '9701987654',
        exp: 15,
        lang: 'Hindi, Telugu, English',
        fee: 550,
        rating: 4.9,
        image: '👨‍⚕️'
    },
    {
        id: 20,
        name: 'Dr. Anuradha Kumari',
        specialty: 'Rheumatologist',
        hospital: 'NIMS Hospital, Hyderabad',
        phone: '9866778899',
        exp: 11,
        lang: 'Telugu, Hindi',
        fee: 450,
        rating: 4.6,
        image: '👩‍⚕️'
    },
    {
        id: 21,
        name: 'Dr. Venkat Subramanyam',
        specialty: 'Urologist',
        hospital: 'Govt. General Hospital, Vijayawada',
        phone: '9440889900',
        exp: 20,
        lang: 'Telugu, English',
        fee: 400,
        rating: 4.8,
        image: '👨‍⚕️'
    },
    {
        id: 22,
        name: 'Dr. Bhavani Devi',
        specialty: 'Ayurveda Specialist',
        hospital: 'Govt. Ayurveda Hospital, Vijayawada',
        phone: '9848990011',
        exp: 25,
        lang: 'Telugu',
        fee: 100,
        rating: 4.9,
        image: '👩‍⚕️'
    },
    {
        id: 23,
        name: 'Dr. Satish Kumar',
        specialty: 'General Surgeon',
        hospital: 'Area Hospital, Karimnagar',
        phone: '9391122334',
        exp: 16,
        lang: 'Telugu, Hindi',
        fee: 350,
        rating: 4.7,
        image: '👨‍⚕️'
    },
    {
        id: 24,
        name: 'Dr. Madhavi Latha',
        specialty: 'Oncologist (Cancer)',
        hospital: 'MNJ Cancer Hospital, Hyderabad',
        phone: '9876001122',
        exp: 18,
        lang: 'Telugu, Hindi, English',
        fee: 700,
        rating: 4.9,
        image: '👩‍⚕️'
    }
];

// Hospitals Database
const HOSPITALS = [{
        id: 1,
        name: 'King George Hospital',
        dist: 'Visakhapatnam',
        phone: '0891-2564891',
        type: 'Government',
        emergency: true,
        beds: 950,
        services: ['Emergency', 'ICU', 'Surgery', 'Cardiology', 'Neurology']
    },
    {
        id: 2,
        name: 'Govt. General Hospital',
        dist: 'Guntur',
        phone: '0863-2232933',
        type: 'Government',
        emergency: true,
        beds: 700,
        services: ['Emergency', 'Surgery', 'Pediatrics', 'Orthopedics']
    },
    {
        id: 3,
        name: 'NIMS (Nizams Institute)',
        dist: 'Hyderabad',
        phone: '040-23489000',
        type: 'Government',
        emergency: true,
        beds: 1200,
        services: ['Emergency', 'ICU', 'Cardiology', 'Oncology', 'Neurosurgery', 'Transplant']
    },
    {
        id: 4,
        name: 'Primary Health Centre',
        dist: 'Nellore',
        phone: '0861-2334455',
        type: 'PHC',
        emergency: false,
        beds: 50,
        services: ['OPD', 'Vaccination', 'Maternal Care']
    },
    {
        id: 5,
        name: 'District Hospital',
        dist: 'Kurnool',
        phone: '08518-222333',
        type: 'Government',
        emergency: true,
        beds: 300,
        services: ['Emergency', 'Surgery', 'Gynecology', 'Pediatrics']
    },
    {
        id: 6,
        name: 'SVIMS Hospital',
        dist: 'Chittoor',
        phone: '0877-2252244',
        type: 'Government',
        emergency: true,
        beds: 500,
        services: ['Emergency', 'Cardiology', 'Nephrology', 'Oncology']
    },
    {
        id: 7,
        name: 'MGM Hospital',
        dist: 'Warangal',
        phone: '0870-2441234',
        type: 'Government',
        emergency: true,
        beds: 400,
        services: ['Emergency', 'Trauma', 'ICU', 'Burns Unit']
    },
    {
        id: 8,
        name: 'Community Health Centre',
        dist: 'Guntur',
        phone: '08644-224455',
        type: 'PHC',
        emergency: false,
        beds: 100,
        services: ['OPD', 'Basic Surgery', 'Lab', 'Pharmacy']
    },
    {
        id: 9,
        name: 'Niloufer Hospital',
        dist: 'Hyderabad',
        phone: '040-23312345',
        type: 'Government',
        emergency: true,
        beds: 450,
        services: ['Pediatrics', 'NICU', 'Emergency', 'Child Surgery']
    },
    {
        id: 10,
        name: 'Primary Health Centre',
        dist: 'West Godavari',
        phone: '08812-234567',
        type: 'PHC',
        emergency: false,
        beds: 30,
        services: ['OPD', 'Maternal Care', 'Immunization']
    },
    {
        id: 11,
        name: 'Govt. Maternity Hospital',
        dist: 'Krishna',
        phone: '0866-2433222',
        type: 'Government',
        emergency: true,
        beds: 200,
        services: ['Gynecology', 'Obstetrics', 'NICU', 'Labor Ward']
    },
    {
        id: 12,
        name: 'Area Hospital Nandyal',
        dist: 'Kurnool',
        phone: '08514-222111',
        type: 'Government',
        emergency: false,
        beds: 80,
        services: ['OPD', 'Minor Surgery', 'Lab']
    },
    {
        id: 13,
        name: 'Gandhi Hospital',
        dist: 'Hyderabad',
        phone: '040-27505566',
        type: 'Government',
        emergency: true,
        beds: 1100,
        services: ['Emergency', 'ICU', 'Trauma', 'General Surgery', 'ENT']
    },
    {
        id: 14,
        name: 'Osmania General Hospital',
        dist: 'Hyderabad',
        phone: '040-24600146',
        type: 'Government',
        emergency: true,
        beds: 1000,
        services: ['Emergency', 'Surgery', 'Neurology', 'Cardiology', 'Gastro']
    },
    {
        id: 15,
        name: 'Apollo Hospitals',
        dist: 'Hyderabad',
        phone: '040-23607777',
        type: 'Private',
        emergency: true,
        beds: 550,
        services: ['Emergency', 'Cardiology', 'Oncology', 'Transplant', 'Robotic Surgery']
    },
    {
        id: 16,
        name: 'KIMS Hospital',
        dist: 'Hyderabad',
        phone: '040-44885000',
        type: 'Private',
        emergency: true,
        beds: 600,
        services: ['Emergency', 'Neuro', 'Cardio', 'Ortho', 'IVF']
    },
    {
        id: 17,
        name: 'Care Hospitals',
        dist: 'Visakhapatnam',
        phone: '0891-3041444',
        type: 'Private',
        emergency: true,
        beds: 350,
        services: ['Emergency', 'Cardiology', 'Nephrology', 'Orthopedics']
    },
    {
        id: 18,
        name: 'Yashoda Hospital',
        dist: 'Hyderabad',
        phone: '040-45674567',
        type: 'Private',
        emergency: true,
        beds: 500,
        services: ['Emergency', 'ICU', 'Oncology', 'Liver Transplant']
    },
    {
        id: 19,
        name: 'Medicover Hospital',
        dist: 'Visakhapatnam',
        phone: '0891-6677788',
        type: 'Private',
        emergency: true,
        beds: 300,
        services: ['Emergency', 'Surgery', 'Maternity', 'Pediatrics']
    },
    {
        id: 20,
        name: 'Govt. ENT Hospital',
        dist: 'Hyderabad',
        phone: '040-23234567',
        type: 'Government',
        emergency: false,
        beds: 150,
        services: ['ENT Surgery', 'Audiology', 'Speech Therapy']
    },
    {
        id: 21,
        name: 'Chest Hospital',
        dist: 'Hyderabad',
        phone: '040-27530831',
        type: 'Government',
        emergency: true,
        beds: 200,
        services: ['TB Treatment', 'Pulmonology', 'Respiratory ICU']
    },
    {
        id: 22,
        name: 'MNJ Cancer Hospital',
        dist: 'Hyderabad',
        phone: '040-24602891',
        type: 'Government',
        emergency: true,
        beds: 350,
        services: ['Oncology', 'Chemotherapy', 'Radiation', 'Palliative Care']
    },
    {
        id: 23,
        name: 'Sarojini Devi Eye Hospital',
        dist: 'Hyderabad',
        phone: '040-24730006',
        type: 'Government',
        emergency: true,
        beds: 180,
        services: ['Cataract Surgery', 'Glaucoma', 'Retina', 'Cornea Transplant']
    },
    {
        id: 24,
        name: 'Area Hospital Karimnagar',
        dist: 'Karimnagar',
        phone: '0878-2248000',
        type: 'Government',
        emergency: true,
        beds: 250,
        services: ['Emergency', 'Surgery', 'Gynecology', 'Orthopedics']
    },
    {
        id: 25,
        name: 'District Hospital Khammam',
        dist: 'Khammam',
        phone: '08742-255566',
        type: 'Government',
        emergency: true,
        beds: 200,
        services: ['Emergency', 'ICU', 'Surgery', 'Pediatrics']
    },
    {
        id: 26,
        name: 'Govt. Hospital Nizamabad',
        dist: 'Nizamabad',
        phone: '08462-234511',
        type: 'Government',
        emergency: true,
        beds: 280,
        services: ['Emergency', 'Trauma', 'Maternity', 'Dialysis']
    },
    {
        id: 27,
        name: 'Max Cure Hospital',
        dist: 'Hyderabad',
        phone: '040-40044004',
        type: 'Private',
        emergency: true,
        beds: 200,
        services: ['Emergency', 'Cardiology', 'Neurology', 'Gastro']
    },
    {
        id: 28,
        name: 'Sunshine Hospital',
        dist: 'Hyderabad',
        phone: '040-44441234',
        type: 'Private',
        emergency: true,
        beds: 350,
        services: ['Emergency', 'Orthopedics', 'Spine Surgery', 'Sports Medicine']
    },
    {
        id: 29,
        name: 'Rainbow Childrens Hospital',
        dist: 'Hyderabad',
        phone: '040-23455678',
        type: 'Private',
        emergency: true,
        beds: 280,
        services: ['Pediatrics', 'NICU', 'PICU', 'Child Surgery', 'Vaccinations']
    },
    {
        id: 30,
        name: 'Fernandez Hospital',
        dist: 'Hyderabad',
        phone: '040-47894789',
        type: 'Private',
        emergency: true,
        beds: 150,
        services: ['Maternity', 'Gynecology', 'IVF', 'NICU', 'Fetal Medicine']
    },
    {
        id: 31,
        name: 'PHC Siddipet',
        dist: 'Siddipet',
        phone: '08457-222333',
        type: 'PHC',
        emergency: false,
        beds: 40,
        services: ['OPD', 'Vaccination', 'Maternal Care', 'Basic Lab']
    },
    {
        id: 32,
        name: 'PHC Kamareddy',
        dist: 'Kamareddy',
        phone: '08468-244556',
        type: 'PHC',
        emergency: false,
        beds: 35,
        services: ['OPD', 'Immunization', 'Antenatal Care']
    }
];

// Skin Conditions Database
const SKIN_CONDITIONS = {
    eczema: {
        name: 'Atopic Eczema (Dermatitis)',
        severity: 'moderate',
        emoji: '🔴',
        desc: 'Eczema causes dry, itchy, inflamed skin. It is a chronic condition that commonly affects the folds of arms, behind the knees, and face. It is non-contagious but requires management.',
        rec: 'Apply moisturizer regularly. Avoid harsh soaps and extreme temperatures. A dermatologist can prescribe topical corticosteroids if needed. Monitor for secondary infections.'
    },
    acne: {
        name: 'Acne Vulgaris',
        severity: 'mild',
        emoji: '🟡',
        desc: 'Acne is caused by blocked hair follicles with oil and dead skin cells. Results in pimples, blackheads, and whiteheads, mainly on face, chest, and back.',
        rec: 'Wash affected area twice daily with mild cleanser. Avoid squeezing pimples. Over-the-counter benzoyl peroxide or salicylic acid can help. Persistent or severe acne should be evaluated by a dermatologist.'
    },
    ringworm: {
        name: 'Tinea Corporis (Ringworm)',
        severity: 'moderate',
        emoji: '🟠',
        desc: 'Ringworm is a fungal infection (not actually a worm) that creates ring-shaped, scaly patches on the skin. It is contagious and spreads through direct contact.',
        rec: 'Apply antifungal cream (clotrimazole or terbinafine) twice daily. Keep the area clean and dry. Avoid sharing personal items. Complete the full course of treatment (2-4 weeks) even if symptoms improve.'
    },
    rash: {
        name: 'Contact Dermatitis / Rash',
        severity: 'mild',
        emoji: '🟣',
        desc: 'A skin rash from contact with an irritant or allergen. Symptoms include redness, itching, swelling, and sometimes blisters. Common causes include plants, metals, soaps, and cosmetics.',
        rec: 'Identify and avoid the triggering substance. Rinse the area with cool water. Apply 1% hydrocortisone cream for relief. Seek medical attention if rash spreads rapidly or you develop difficulty breathing.'
    }
};

// Doctor Specializations
const SPECIALIZATIONS = [
    'All',
    'General Physician',
    'Cardiologist',
    'Dermatologist',
    'Pediatrician',
    'Gynecologist',
    'Orthopedic'
];

// Export for use
if (typeof window !== 'undefined') {
    window.LANG_STRINGS = LANG_STRINGS;
    window.SYMPTOM_CHIPS = SYMPTOM_CHIPS;
    window.SLANG_MAP = SLANG_MAP;
    window.DOCTORS = DOCTORS;
    window.HOSPITALS = HOSPITALS;
    window.SKIN_CONDITIONS = SKIN_CONDITIONS;
    window.SPECIALIZATIONS = SPECIALIZATIONS;
}