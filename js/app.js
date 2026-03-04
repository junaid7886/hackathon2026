/* ═══════════════════════════════════════════════════════════════════════════
   RuralMed AI — Main Application JavaScript
   ═══════════════════════════════════════════════════════════════════════════ */

// ═══════════════════════════════════════════
// APP STATE
// ═══════════════════════════════════════════
const APP = {
    user: null,
    lang: localStorage.getItem('ruralmed_lang') || 'en',
    chatHistory: [],
    lastRiskScore: null,
    recognition: null,
    isRecording: false,
    profile: JSON.parse(localStorage.getItem('ruralmed_profile')) || {
        name: 'Guest User',
        age: 30,
        gender: 'Male',
        blood: 'O+',
        weight: 65,
        phone: '',
        diabetes: false,
        bp: false,
        heart: false,
        asthma: false,
        allergies: '',
        meds: '',
        lang: 'en'
    }
};

// ═══════════════════════════════════════════
// INFERMEDICA API CONFIGURATION
// ═══════════════════════════════════════════
const INFERMEDICA = {
    appId: 'YOUR_INFERMEDICA_APP_ID', // Replace with your Infermedica App ID
    appKey: 'YOUR_INFERMEDICA_APP_KEY', // Replace with your Infermedica App Key
    baseUrl: 'https://api.infermedica.com/v3',
    interviewId: null
};

// ═══════════════════════════════════════════
// ML CHATBOT API CONFIGURATION
// ═══════════════════════════════════════════
const ML_CHATBOT = {
    baseUrl: 'http://localhost:5000',
    enabled: true
};

// ML Chatbot API Functions
async function mlChatbotPredict(message) {
    try {
        const response = await fetch(`${ML_CHATBOT.baseUrl}/api/chat`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ message: message })
        });
        return await response.json();
    } catch (error) {
        console.error('ML Chatbot error:', error);
        return null;
    }
}

async function mlChatbotGetSymptoms() {
    try {
        const response = await fetch(`${ML_CHATBOT.baseUrl}/api/symptoms`);
        return await response.json();
    } catch (error) {
        console.error('ML Chatbot symptoms error:', error);
        return null;
    }
}

// Infermedica API Functions
async function infermedicaParse(text) {
    try {
        const response = await fetch(`${INFERMEDICA.baseUrl}/parse`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'App-Id': INFERMEDICA.appId,
                'App-Key': INFERMEDICA.appKey
            },
            body: JSON.stringify({
                text: text,
                age: { value: APP.profile.age },
                sex: APP.profile.gender.toLowerCase() === 'female' ? 'female' : 'male'
            })
        });
        return await response.json();
    } catch (error) {
        console.error('Infermedica parse error:', error);
        return null;
    }
}

async function infermedicaDiagnosis(evidence) {
    try {
        const response = await fetch(`${INFERMEDICA.baseUrl}/diagnosis`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'App-Id': INFERMEDICA.appId,
                'App-Key': INFERMEDICA.appKey
            },
            body: JSON.stringify({
                sex: APP.profile.gender.toLowerCase() === 'female' ? 'female' : 'male',
                age: { value: APP.profile.age },
                evidence: evidence,
                extras: {
                    disable_groups: true
                }
            })
        });
        return await response.json();
    } catch (error) {
        console.error('Infermedica diagnosis error:', error);
        return null;
    }
}

async function getInfermedicaAnalysis(text) {
    // First, parse the symptoms from text
    const parseResult = await infermedicaParse(text);

    if (!parseResult || !parseResult.mentions || parseResult.mentions.length === 0) {
        return null;
    }

    // Convert mentions to evidence format
    const evidence = parseResult.mentions.map(m => ({
        id: m.id,
        choice_id: m.choice_id,
        source: 'initial'
    }));

    // Get diagnosis
    const diagnosis = await infermedicaDiagnosis(evidence);

    if (!diagnosis) return null;

    return {
        symptoms: parseResult.mentions.map(m => m.common_name || m.name),
        conditions: diagnosis.conditions ? diagnosis.conditions.slice(0, 5).map(c => ({
            name: c.common_name || c.name,
            probability: Math.round(c.probability * 100)
        })) : [],
        triage: diagnosis.triage_level || 'consultation_24',
        question: diagnosis.question ? diagnosis.question.text : null
    };
}

// ═══════════════════════════════════════════
// INITIALIZATION
// ═══════════════════════════════════════════
document.addEventListener('DOMContentLoaded', () => {
    initApp();
});

function initApp() {
    // Check if user is logged in
    const userData = localStorage.getItem('ruralmed_user');
    if (userData) {
        APP.user = JSON.parse(userData);
    }

    // Initialize page-specific features
    const page = getCurrentPage();

    switch (page) {
        case 'index':
        case 'login':
            initAuthPage();
            break;
        case 'dashboard':
            initDashboard();
            break;
        case 'chat':
            initChat();
            break;
        case 'profile':
            initProfile();
            break;
        case 'doctors':
            initDoctors();
            break;
        case 'hospitals':
            initHospitals();
            break;
        case 'skin-analysis':
            initSkinAnalysis();
            break;
    }

    // Initialize common features
    initNavbar();
    initLanguageSelector();
    setupVoice();
    updateActiveNav();
}

function getCurrentPage() {
    const path = window.location.pathname;
    const filename = path.split('/').pop().replace('.html', '');
    return filename || 'index';
}

// ═══════════════════════════════════════════
// NAVBAR
// ═══════════════════════════════════════════
function initNavbar() {
    const navbar = document.querySelector('.navbar');
    if (!navbar) return;

    // Add scroll effect
    window.addEventListener('scroll', () => {
        if (window.scrollY > 20) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });
}

function updateActiveNav() {
    const page = getCurrentPage();
    const navLinks = document.querySelectorAll('.nav-link, .mobile-nav-btn');

    navLinks.forEach(link => {
        const href = link.getAttribute('href') || '';
        const linkPage = href.replace('.html', '').replace('pages/', '').replace('../', '').replace('./', '');

        if (linkPage === page || (page === 'index' && linkPage === 'dashboard')) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });
}

// ═══════════════════════════════════════════
// LANGUAGE
// ═══════════════════════════════════════════
function initLanguageSelector() {
    const langBtns = document.querySelectorAll('.lang-btn');
    langBtns.forEach(btn => {
        if (btn.dataset.lang === APP.lang) {
            btn.classList.add('active');
        }
        btn.addEventListener('click', () => setLanguage(btn.dataset.lang));
    });
}

function setLanguage(lang) {
    APP.lang = lang;
    localStorage.setItem('ruralmed_lang', lang);

    const langBtns = document.querySelectorAll('.lang-btn');
    langBtns.forEach(btn => {
        btn.classList.toggle('active', btn.dataset.lang === lang);
    });

    // Update UI elements based on language
    updateLanguageUI();
    showToast(`🌐 Language changed to ${lang.toUpperCase()}`);
}

function updateLanguageUI() {
    // Update any translatable elements
    const translations = LANG_STRINGS[APP.lang] || LANG_STRINGS.en;

    document.querySelectorAll('[data-translate]').forEach(el => {
        const key = el.dataset.translate;
        if (translations[key]) {
            el.textContent = translations[key];
        }
    });
}

// ═══════════════════════════════════════════
// AUTHENTICATION
// ═══════════════════════════════════════════
function initAuthPage() {
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const authTabs = document.querySelectorAll('.auth-tab');

    authTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const tabType = tab.dataset.tab;
            switchAuthTab(tabType);
        });
    });
}

function switchAuthTab(tab) {
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const authTabs = document.querySelectorAll('.auth-tab');

    authTabs.forEach(t => t.classList.remove('active'));
    const activeTab = document.querySelector(`[data-tab="${tab}"]`);
    if (activeTab) activeTab.classList.add('active');

    if (tab === 'login') {
        loginForm.style.display = 'block';
        registerForm.style.display = 'none';
    } else {
        loginForm.style.display = 'none';
        registerForm.style.display = 'block';
    }
}

function doLogin() {
    const email = document.getElementById('loginEmail').value;
    const pass = document.getElementById('loginPass').value;

    if (!email || !pass) {
        showToast('⚠️ Please enter email and password');
        return;
    }

    // Simulate login
    APP.user = { email, name: APP.profile.name };
    localStorage.setItem('ruralmed_user', JSON.stringify(APP.user));

    showToast(`✅ Welcome back, ${APP.profile.name}!`);

    setTimeout(() => {
        window.location.href = './pages/dashboard.html';
    }, 1000);
}

function doRegister() {
    const name = document.getElementById('regName').value;
    const age = document.getElementById('regAge').value;
    const email = document.getElementById('regEmail').value;
    const pass = document.getElementById('regPass').value;

    if (!name || !age || !email || !pass) {
        showToast('⚠️ Please fill all fields');
        return;
    }

    if (pass.length < 8) {
        showToast('⚠️ Password must be 8+ characters');
        return;
    }

    // Save user data
    APP.user = { name, age, email };
    APP.profile.name = name;
    APP.profile.age = parseInt(age);

    localStorage.setItem('ruralmed_user', JSON.stringify(APP.user));
    localStorage.setItem('ruralmed_profile', JSON.stringify(APP.profile));

    showToast(`✅ Account created! Welcome, ${name}`);

    setTimeout(() => {
        window.location.href = './pages/dashboard.html';
    }, 1000);
}

function logout() {
    localStorage.removeItem('ruralmed_user');
    window.location.href = '../index.html';
}

// ═══════════════════════════════════════════
// DASHBOARD
// ═══════════════════════════════════════════
function initDashboard() {
    checkAuth();
    updateDashboardGreeting();
    updateRiskBanner();
}

function checkAuth() {
    if (!APP.user) {
        // Redirect to login if not authenticated
        // window.location.href = '../index.html';
    }
}

function updateDashboardGreeting() {
    const greetingEl = document.getElementById('dashGreeting');
    if (!greetingEl) return;

    const hour = new Date().getHours();
    const timeOfDay = hour < 12 ? 'Morning' : hour < 17 ? 'Afternoon' : 'Evening';

    const translations = LANG_STRINGS[APP.lang] || LANG_STRINGS.en;
    const greeting = translations.greeting
        .replace('%time%', timeOfDay)
        .replace('%name%', APP.profile.name);

    greetingEl.textContent = greeting;
}

function updateRiskBanner() {
    const banner = document.getElementById('riskBanner');
    if (!banner) return;

    const lastRisk = JSON.parse(localStorage.getItem('ruralmed_lastRisk'));
    if (lastRisk) {
        banner.style.display = 'flex';
        document.getElementById('lastRiskScore').textContent = lastRisk.score;
        document.getElementById('lastRiskLevel').textContent = lastRisk.level;
        document.getElementById('lastRiskLevel').style.color = getRiskColor(lastRisk.level);
    }
}

function getRiskColor(level) {
    const colors = {
        low: '#22c55e',
        moderate: '#f59e0b',
        high: '#f97316',
        critical: '#ef4444'
    };
    return colors[level] || '#64748b';
}

// ═══════════════════════════════════════════
// CHAT
// ═══════════════════════════════════════════
function initChat() {
    checkAuth();
    renderSymptomChips();

    const chatInput = document.getElementById('chatInput');
    if (chatInput) {
        chatInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
            }
        });

        chatInput.addEventListener('input', () => autoResize(chatInput));
    }
}

function renderSymptomChips() {
    const container = document.getElementById('symptomChips');
    if (!container) return;

    const chips = SYMPTOM_CHIPS[APP.lang] || SYMPTOM_CHIPS.en;
    container.innerHTML = '';

    chips.forEach(chip => {
        const el = document.createElement('button');
        el.className = 'symptom-chip';
        el.textContent = chip;
        el.onclick = () => {
            const text = chip.replace(/^[^\s]+\s/, '');
            const input = document.getElementById('chatInput');
            input.value = (input.value ? input.value + ', ' : '') + text;
            autoResize(input);
        };
        container.appendChild(el);
    });
}

function autoResize(textarea) {
    textarea.style.height = 'auto';
    textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px';
}

function preTranslate(text) {
    let t = text.toLowerCase();
    Object.entries(SLANG_MAP).forEach(([slang, eng]) => {
        t = t.replace(new RegExp(slang, 'gi'), eng);
    });
    return t;
}

async function sendMessage() {
    try {
        const input = document.getElementById('chatInput');
        if (!input) {
            console.error('Chat input not found');
            return;
        }
        const rawText = input.value.trim();

        if (!rawText) return;

        const translated = preTranslate(rawText);
        input.value = '';
        input.style.height = 'auto';

        addUserMessage(rawText);
        showTypingIndicator();

        const sendBtn = document.getElementById('sendBtn');
        if (sendBtn) sendBtn.disabled = true;

        const profile = APP.profile;
        const profileContext = `Patient: ${profile.name}, Age ${profile.age}, ${profile.gender}. Conditions: diabetes=${profile.diabetes}, highBP=${profile.bp}, heartDisease=${profile.heart}, asthma=${profile.asthma}. Meds: ${profile.meds || 'none'}.`;

        const history = APP.chatHistory.slice(-8).map(m => ({
            role: m.role,
            content: m.content
        }));

        let result;

        // Try ML Chatbot API first
        if (ML_CHATBOT.enabled) {
            const mlResponse = await mlChatbotPredict(translated);
            
            if (mlResponse && mlResponse.type === 'diagnosis' && mlResponse.prediction) {
                // Convert ML response to expected format
                const pred = mlResponse.prediction;
                const info = pred.info || {};
                
                // Determine risk level based on severity
                let riskLevel = 'low';
                let riskScore = 30;
                let recommendation = 'Self-care';
                
                if (info.severity === 'emergency') {
                    riskLevel = 'critical';
                    riskScore = 95;
                    recommendation = 'Emergency';
                } else if (info.severity === 'severe') {
                    riskLevel = 'high';
                    riskScore = 75;
                    recommendation = 'Hospital Visit';
                } else if (info.severity === 'moderate' || info.severity === 'moderate to severe') {
                    riskLevel = 'moderate';
                    riskScore = 55;
                    recommendation = 'Teleconsultation';
                } else if (info.severity === 'chronic') {
                    riskLevel = 'moderate';
                    riskScore = 50;
                    recommendation = 'Teleconsultation';
                }
                
                // Adjust for patient profile
                if (profile.diabetes || profile.bp || profile.heart) {
                    riskScore = Math.min(100, riskScore + 10);
                }
                
                // Get suggested specialist based on disease
                let suggestedSpec = 'General Physician';
                const disease = pred.disease.toLowerCase();
                if (disease.includes('heart') || disease.includes('hypertension')) suggestedSpec = 'Cardiologist';
                else if (disease.includes('skin') || disease.includes('fungal') || disease.includes('acne') || disease.includes('psoriasis')) suggestedSpec = 'Dermatologist';
                else if (disease.includes('gastro') || disease.includes('gerd') || disease.includes('peptic') || disease.includes('hepatitis') || disease.includes('jaundice')) suggestedSpec = 'Gastroenterologist';
                else if (disease.includes('diabetes')) suggestedSpec = 'Endocrinologist';
                else if (disease.includes('asthma') || disease.includes('pneumonia') || disease.includes('bronchial') || disease.includes('tuberculosis')) suggestedSpec = 'Pulmonologist';
                else if (disease.includes('arthritis')) suggestedSpec = 'Rheumatologist';
                else if (disease.includes('migraine')) suggestedSpec = 'Neurologist';
                else if (disease.includes('typhoid') || disease.includes('malaria') || disease.includes('dengue')) suggestedSpec = 'Infectious Disease Specialist';
                
                // Build response text
                let responseText = `Based on the ML analysis, you may have **${pred.disease}**.\n\n`;
                responseText += `${info.description || ''}\n\n`;
                if (info.recommendations && info.recommendations.length > 0) {
                    responseText += '**Recommendations:**\n';
                    info.recommendations.forEach(rec => {
                        responseText += `• ${rec}\n`;
                    });
                }
                if (info.see_doctor) {
                    responseText += `\n**When to see a doctor:** ${info.see_doctor}`;
                }
                
                // Build possible conditions from top predictions
                const possibleConditions = (pred.top_predictions || []).map(p => ({
                    name: p.disease,
                    probability: Math.round(p.probability * 100)
                }));
                
                result = {
                    responseText: responseText.replace(/\*\*/g, ''),
                    riskScore: riskScore,
                    riskLevel: riskLevel,
                    recommendation: recommendation,
                    explanation: `ML Model detected ${pred.symptoms_matched.length} symptoms: ${pred.symptoms_matched.join(', ')}. Confidence: ${pred.confidence ? Math.round(pred.confidence * 100) + '%' : 'N/A'}`,
                    factors: [
                        { label: 'Symptom Match', value: Math.min(100, pred.symptoms_matched.length * 25) },
                        { label: 'Model Confidence', value: pred.confidence ? Math.round(pred.confidence * 100) : 50 },
                        { label: 'Profile Risk', value: (profile.diabetes || profile.bp || profile.heart) ? 60 : 20 }
                    ],
                    detectedSymptoms: pred.symptoms_matched,
                    suggestedSpec: suggestedSpec,
                    possibleConditions: possibleConditions,
                    mlPowered: true,
                    disease: pred.disease
                };
            } else if (mlResponse && mlResponse.response) {
                // Handle greeting/farewell/clarification messages
                result = {
                    responseText: mlResponse.response,
                    riskScore: 0,
                    riskLevel: 'low',
                    recommendation: 'Self-care',
                    explanation: 'General conversation',
                    factors: [],
                    detectedSymptoms: [],
                    suggestedSpec: null,
                    possibleConditions: []
                };
            }
        }
        
        // Fall back to local response if ML API fails
        if (!result) {
            // Get Infermedica analysis in parallel (if API keys are configured)
            let infermedicaData = null;
            let infermedicaContext = '';

            if (INFERMEDICA.appId !== 'YOUR_INFERMEDICA_APP_ID') {
                infermedicaData = await getInfermedicaAnalysis(translated);
                if (infermedicaData && infermedicaData.conditions.length > 0) {
                    infermedicaContext = `\n\nInfermedica Medical API Analysis:
- Detected symptoms: ${infermedicaData.symptoms.join(', ')}
- Possible conditions: ${infermedicaData.conditions.map(c => `${c.name} (${c.probability}%)`).join(', ')}
- Triage level: ${infermedicaData.triage}
Use this clinical data to inform your risk assessment.`;
                }
            }

            // Generate local AI response (simulated for demo without backend)
            result = generateLocalResponse(translated, profile);
        }
        
        removeTypingIndicator();
        addAIMessage(result);

        APP.chatHistory.push({ role: 'user', content: translated });
        APP.chatHistory.push({ role: 'assistant', content: result.responseText });

        // Save last risk score
        const lastRisk = {
            score: result.riskScore,
            level: result.riskLevel,
            recommendation: result.recommendation
        };
        localStorage.setItem('ruralmed_lastRisk', JSON.stringify(lastRisk));

        // Show emergency overlay for critical cases
        if (result.riskLevel === 'critical') {
            setTimeout(() => showEmergencyOverlay(), 600);
        }

        if (sendBtn) sendBtn.disabled = false;
    } catch (e) {
        console.error('SendMessage error:', e);
        removeTypingIndicator();
        addErrorMessage('Could not process your message. ' + e.message);
        const sendBtn = document.getElementById('sendBtn');
        if (sendBtn) sendBtn.disabled = false;
    }
}

// Local response generator for demo (simulates AI triage)
function generateLocalResponse(text, profile) {
    const lowerText = text.toLowerCase();
    
    // Symptom detection patterns
    const emergencyKeywords = ['chest pain', 'heart attack', 'stroke', 'unconscious', 'severe bleeding', 'cannot breathe', 'not breathing'];
    const highKeywords = ['high fever', 'severe pain', 'difficulty breathing', 'vomiting blood', 'severe headache', 'fainting'];
    const moderateKeywords = ['fever', 'headache', 'cough', 'cold', 'body pain', 'stomach pain', 'diarrhea', 'vomiting'];
    const lowKeywords = ['mild', 'slight', 'minor', 'little'];
    
    let riskScore = 25;
    let riskLevel = 'low';
    let recommendation = 'Self-care';
    let detectedSymptoms = [];
    let suggestedSpec = 'General Physician';
    
    // Check for emergency symptoms
    for (const keyword of emergencyKeywords) {
        if (lowerText.includes(keyword)) {
            riskScore = 90;
            riskLevel = 'critical';
            recommendation = 'Emergency';
            detectedSymptoms.push(keyword);
        }
    }
    
    // Check for high-risk symptoms
    for (const keyword of highKeywords) {
        if (lowerText.includes(keyword)) {
            riskScore = Math.max(riskScore, 70);
            if (riskLevel !== 'critical') riskLevel = 'high';
            recommendation = 'Hospital Visit';
            detectedSymptoms.push(keyword);
        }
    }
    
    // Check for moderate symptoms
    for (const keyword of moderateKeywords) {
        if (lowerText.includes(keyword)) {
            riskScore = Math.max(riskScore, 40);
            if (riskLevel === 'low') riskLevel = 'moderate';
            if (recommendation === 'Self-care') recommendation = 'Teleconsultation';
            detectedSymptoms.push(keyword);
        }
    }
    
    // Adjust for low severity
    for (const keyword of lowKeywords) {
        if (lowerText.includes(keyword)) {
            riskScore = Math.max(10, riskScore - 15);
        }
    }
    
    // Adjust based on profile conditions
    if (profile.diabetes || profile.bp || profile.heart) {
        riskScore = Math.min(100, riskScore + 10);
    }
    
    // Determine specialization
    if (lowerText.includes('heart') || lowerText.includes('chest')) suggestedSpec = 'Cardiologist';
    else if (lowerText.includes('skin') || lowerText.includes('rash')) suggestedSpec = 'Dermatologist';
    else if (lowerText.includes('stomach') || lowerText.includes('digest')) suggestedSpec = 'Gastroenterologist';
    else if (lowerText.includes('bone') || lowerText.includes('joint')) suggestedSpec = 'Orthopedic';
    else if (lowerText.includes('child') || lowerText.includes('baby')) suggestedSpec = 'Pediatrician';
    else if (lowerText.includes('mental') || lowerText.includes('anxiety') || lowerText.includes('depression')) suggestedSpec = 'Psychiatrist';
    
    // Generate response text
    let responseText = '';
    if (riskLevel === 'critical') {
        responseText = `EMERGENCY: Your symptoms require immediate medical attention. Please call 108 for an ambulance or go to the nearest hospital right away.`;
    } else if (riskLevel === 'high') {
        responseText = `I understand you're experiencing ${detectedSymptoms.join(', ')}. These symptoms need prompt medical attention. I recommend visiting a hospital or clinic soon.`;
    } else if (riskLevel === 'moderate') {
        responseText = `Based on your symptoms (${detectedSymptoms.join(', ')}), I recommend consulting a doctor. You can book a teleconsultation or visit a nearby clinic.`;
    } else {
        responseText = `Your symptoms appear to be mild. Try rest, stay hydrated, and monitor your condition. If symptoms persist or worsen, please consult a doctor.`;
    }
    
    return {
        responseText: responseText,
        riskScore: riskScore,
        riskLevel: riskLevel,
        recommendation: recommendation,
        explanation: `Based on symptom analysis and patient profile (Age ${profile.age}, ${profile.gender}).`,
        factors: [
            { label: 'Symptom Severity', value: Math.min(100, riskScore + 10) },
            { label: 'Duration Risk', value: Math.floor(Math.random() * 30) + 20 },
            { label: 'Profile Risk', value: (profile.diabetes || profile.bp || profile.heart) ? 60 : 20 }
        ],
        detectedSymptoms: detectedSymptoms.length > 0 ? detectedSymptoms : ['General discomfort'],
        suggestedSpec: suggestedSpec,
        possibleConditions: []
    };
}

function addUserMessage(text) {
    const container = document.getElementById('chatMessages');
    if (!container) return;

    const html = `
        <div class="message-row user animate-fade-in">
            <div class="message-avatar user">👤</div>
            <div class="message-bubble user">${escapeHtml(text)}</div>
        </div>
    `;
    container.insertAdjacentHTML('beforeend', html);
    scrollToBottom(container);
}

function addAIMessage(result) {
    const container = document.getElementById('chatMessages');
    if (!container) return;

    const recClass = {
        'Self-care': 'self-care',
        'Teleconsultation': 'teleconsult',
        'Hospital Visit': 'hospital',
        'Emergency': 'emergency'
    }[result.recommendation] || 'self-care';

    const recEmoji = {
        'Self-care': '🏠',
        'Teleconsultation': '📱',
        'Hospital Visit': '🏥',
        'Emergency': '🚨'
    }[result.recommendation] || '💊';

    const level = result.riskLevel || 'low';
    const color = getRiskColor(level);

    let factorsHtml = '';
    (result.factors || []).forEach(f => {
        factorsHtml += `
            <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px;">
                <span style="font-size:0.8rem;color:var(--gray-500);flex:1;">${escapeHtml(f.label)}</span>
                <div style="flex:2;height:6px;background:var(--gray-200);border-radius:3px;overflow:hidden;">
                    <div style="width:${f.value}%;height:100%;background:var(--primary);border-radius:3px;"></div>
                </div>
                <span style="font-size:0.75rem;color:var(--primary);width:32px;text-align:right;">+${f.value}</span>
            </div>
        `;
    });

    const html = `
        <div class="message-row animate-fade-in">
            <div class="message-avatar ai">🏥</div>
            <div class="message-bubble ai" style="max-width:90%;">
                <p style="margin-bottom:12px;">${escapeHtml(result.responseText)}</p>
                
                <div class="risk-card">
                    <div class="risk-card-header">
                        <div>
                            <div style="font-size:0.7rem;color:var(--gray-500);font-weight:600;text-transform:uppercase;letter-spacing:0.05em;">Risk Score</div>
                            <div class="risk-score-big" style="color:${color}">${result.riskScore}</div>
                        </div>
                        <div style="text-align:right;">
                            <span class="risk-level-badge ${level}">${level.toUpperCase()}</span>
                            <p style="margin-top:8px;font-size:0.75rem;color:var(--gray-500);max-width:180px;">${escapeHtml(result.explanation || '')}</p>
                        </div>
                    </div>
                    
                    <div class="risk-bar">
                        <div class="risk-bar-fill" style="width:${result.riskScore}%"></div>
                    </div>
                    
                    <div class="recommendation-badge ${recClass}">
                        ${recEmoji} ${escapeHtml(result.recommendation)}
                    </div>
                    
                    ${result.suggestedSpec ? `
                        <p style="font-size:0.8rem;color:var(--gray-500);margin-top:12px;">
                            👨‍⚕️ Recommended: <strong style="color:var(--primary);">${escapeHtml(result.suggestedSpec)}</strong>
                        </p>
                    ` : ''}
                    
                    ${result.possibleConditions && result.possibleConditions.length > 0 ? `
                        <div style="margin-top:12px;padding-top:12px;border-top:1px solid var(--gray-200);">
                            <p style="font-size:0.75rem;color:var(--gray-500);margin-bottom:8px;">🔬 Possible Conditions ${result.mlPowered ? '(ML Model Analysis)' : '(Infermedica Analysis)'}:</p>
                            <div style="display:flex;flex-wrap:wrap;gap:6px;">
                                ${result.possibleConditions.slice(0, 3).map(c => `
                                    <span style="padding:4px 10px;background:rgba(52,152,219,0.1);border-radius:12px;font-size:0.8rem;color:#3498db;">
                                        ${escapeHtml(c.name)} <span style="opacity:0.7;">${c.probability}%</span>
                                    </span>
                                `).join('')}
                            </div>
                        </div>
                    ` : ''}
                    
                    ${result.mlPowered ? `
                        <div style="margin-top:12px;padding:8px 12px;background:rgba(16,185,129,0.1);border-radius:8px;display:inline-block;">
                            <span style="font-size:0.8rem;color:#10b981;">🤖 Powered by <strong>ML Disease Prediction Model</strong></span>
                        </div>
                    ` : ''}
                </div>
                
                <details style="margin-top:12px;">
                    <summary style="cursor:pointer;font-size:0.85rem;font-weight:600;color:var(--primary);padding:8px 0;">
                        🔍 Why this prediction?
                    </summary>
                    <div style="padding:12px;background:var(--bg);border-radius:var(--radius-sm);margin-top:8px;">
                        <p style="font-size:0.8rem;font-weight:700;color:var(--gray-500);margin-bottom:12px;">Contributing Factors:</p>
                        ${factorsHtml}
                        <p style="font-size:0.8rem;color:var(--gray-500);margin-top:12px;line-height:1.6;">${escapeHtml(result.explanation || '')}</p>
                    </div>
                </details>
                
                <div style="display:flex;gap:8px;margin-top:12px;flex-wrap:wrap;">
                    <button onclick="speakText('${result.responseText.replace(/'/g, "\\'")}')"
                            class="btn btn-sm btn-secondary">
                        🔊 Listen
                    </button>
                    ${result.suggestedSpec ? `
                        <a href="doctors.html?spec=${encodeURIComponent(result.suggestedSpec)}" class="btn btn-sm btn-primary">
                            👨‍⚕️ Find ${result.suggestedSpec}
                        </a>
                    ` : ''}
                </div>
            </div>
        </div>
    `;
    
    container.insertAdjacentHTML('beforeend', html);
    scrollToBottom(container);
}

function addErrorMessage(text) {
    const container = document.getElementById('chatMessages');
    if (!container) return;

    const html = `
        <div class="message-row animate-fade-in">
            <div class="message-avatar ai">🏥</div>
            <div class="message-bubble ai" style="border-left:3px solid var(--danger);">
                ⚠️ ${escapeHtml(text)}
            </div>
        </div>
    `;
    container.insertAdjacentHTML('beforeend', html);
    scrollToBottom(container);
}

function showTypingIndicator() {
    const container = document.getElementById('chatMessages');
    if (!container) return;

    const html = `
        <div class="message-row" id="typingIndicator">
            <div class="message-avatar ai">🏥</div>
            <div class="message-bubble ai">
                <div class="typing-indicator">
                    <span></span>
                    <span></span>
                    <span></span>
                </div>
            </div>
        </div>
    `;
    container.insertAdjacentHTML('beforeend', html);
    scrollToBottom(container);
}

function removeTypingIndicator() {
    const indicator = document.getElementById('typingIndicator');
    if (indicator) indicator.remove();
}

function scrollToBottom(container) {
    setTimeout(() => {
        container.scrollTop = container.scrollHeight;
    }, 50);
}

// ═══════════════════════════════════════════
// VOICE
// ═══════════════════════════════════════════
function setupVoice() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    APP.recognition = new SpeechRecognition();
    APP.recognition.continuous = false;
    APP.recognition.interimResults = true;

    APP.recognition.onresult = (e) => {
        const transcript = Array.from(e.results)
            .map(r => r[0].transcript)
            .join('');
        
        const input = document.getElementById('chatInput');
        if (input) {
            input.value = transcript;
            autoResize(input);
        }
        
        const voiceText = document.getElementById('voiceBarText');
        if (voiceText) {
            voiceText.textContent = transcript || 'Listening...';
        }
    };

    APP.recognition.onend = () => stopVoice();
}

function toggleVoice() {
    if (!APP.recognition) {
        showToast('⚠️ Voice not supported in this browser');
        return;
    }

    if (APP.isRecording) {
        stopVoice();
        return;
    }

    const langMap = {
        en: 'en-IN',
        hi: 'hi-IN',
        te: 'te-IN',
        ta: 'ta-IN',
        kn: 'kn-IN'
    };

    APP.recognition.lang = langMap[APP.lang] || 'en-IN';
    APP.recognition.start();
    APP.isRecording = true;

    const micBtn = document.getElementById('micBtn');
    const voiceBar = document.getElementById('voiceBar');
    
    if (micBtn) micBtn.classList.add('recording');
    if (voiceBar) voiceBar.classList.add('active');
    
    const voiceText = document.getElementById('voiceBarText');
    if (voiceText) {
        voiceText.textContent = `Listening in ${APP.lang.toUpperCase()}...`;
    }
}

function stopVoice() {
    if (APP.recognition) APP.recognition.stop();
    APP.isRecording = false;

    const micBtn = document.getElementById('micBtn');
    const voiceBar = document.getElementById('voiceBar');
    
    if (micBtn) micBtn.classList.remove('recording');
    if (voiceBar) voiceBar.classList.remove('active');
}

function speakText(text) {
    if (!text || !window.speechSynthesis) return;

    window.speechSynthesis.cancel();
    
    const utterance = new SpeechSynthesisUtterance(text);
    const langMap = {
        en: 'en-IN',
        hi: 'hi-IN',
        te: 'te-IN',
        ta: 'ta-IN',
        kn: 'kn-IN'
    };
    
    utterance.lang = langMap[APP.lang] || 'en-IN';
    utterance.rate = 0.9;
    
    window.speechSynthesis.speak(utterance);
}

// ═══════════════════════════════════════════
// PROFILE
// ═══════════════════════════════════════════
function initProfile() {
    checkAuth();
    loadProfile();
}

function loadProfile() {
    const p = APP.profile;
    
    const fields = {
        'pName': p.name,
        'pAge': p.age,
        'pGender': p.gender,
        'pBlood': p.blood,
        'pWeight': p.weight,
        'pPhone': p.phone,
        'pAllergies': p.allergies,
        'pMeds': p.meds,
        'pLang': p.lang
    };

    Object.entries(fields).forEach(([id, value]) => {
        const el = document.getElementById(id);
        if (el) el.value = value;
    });

    const toggles = {
        'pDiabetes': p.diabetes,
        'pBP': p.bp,
        'pHeart': p.heart,
        'pAsthma': p.asthma
    };

    Object.entries(toggles).forEach(([id, checked]) => {
        const el = document.getElementById(id);
        if (el) el.checked = checked;
    });

    // Update header
    const nameEl = document.getElementById('profileDisplayName');
    const subtitleEl = document.getElementById('profileSubtitle');
    
    if (nameEl) nameEl.textContent = p.name;
    if (subtitleEl) subtitleEl.textContent = `Age ${p.age} · ${p.gender} · Blood Group ${p.blood}`;
}

function saveProfile() {
    APP.profile = {
        name: document.getElementById('pName')?.value || APP.profile.name,
        age: parseInt(document.getElementById('pAge')?.value) || APP.profile.age,
        gender: document.getElementById('pGender')?.value || APP.profile.gender,
        blood: document.getElementById('pBlood')?.value || APP.profile.blood,
        weight: parseInt(document.getElementById('pWeight')?.value) || APP.profile.weight,
        phone: document.getElementById('pPhone')?.value || '',
        diabetes: document.getElementById('pDiabetes')?.checked || false,
        bp: document.getElementById('pBP')?.checked || false,
        heart: document.getElementById('pHeart')?.checked || false,
        asthma: document.getElementById('pAsthma')?.checked || false,
        allergies: document.getElementById('pAllergies')?.value || '',
        meds: document.getElementById('pMeds')?.value || '',
        lang: document.getElementById('pLang')?.value || 'en'
    };

    localStorage.setItem('ruralmed_profile', JSON.stringify(APP.profile));
    loadProfile();
    showToast('✅ Profile saved successfully!');
}

// ═══════════════════════════════════════════
// DOCTORS
// ═══════════════════════════════════════════
let activeSpecFilter = 'All';

function initDoctors() {
    renderSpecFilters();
    renderDoctors();
    
    const searchInput = document.getElementById('doctorSearch');
    if (searchInput) {
        searchInput.addEventListener('input', () => renderDoctors());
    }
}

function renderSpecFilters() {
    const container = document.getElementById('specFilters');
    if (!container) return;

    container.innerHTML = '';
    SPECIALIZATIONS.forEach(spec => {
        const chip = document.createElement('button');
        chip.className = `filter-chip ${spec === activeSpecFilter ? 'active' : ''}`;
        chip.textContent = spec;
        chip.onclick = () => {
            activeSpecFilter = spec;
            renderSpecFilters();
            renderDoctors();
        };
        container.appendChild(chip);
    });
}

function renderDoctors() {
    const container = document.getElementById('doctorList');
    if (!container) return;

    const searchTerm = document.getElementById('doctorSearch')?.value?.toLowerCase() || '';
    
    const filtered = DOCTORS.filter(d => {
        const matchesSpec = activeSpecFilter === 'All' || d.spec === activeSpecFilter;
        const matchesSearch = !searchTerm || 
            d.name.toLowerCase().includes(searchTerm) ||
            d.spec.toLowerCase().includes(searchTerm) ||
            d.hosp.toLowerCase().includes(searchTerm);
        return matchesSpec && matchesSearch;
    });

    if (filtered.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">🔍</div>
                <p>No doctors found matching your search.</p>
            </div>
        `;
        return;
    }

    container.innerHTML = filtered.map(d => `
        <div class="doctor-card animate-fade-in">
            <div class="doctor-avatar">${d.emoji}</div>
            <div class="doctor-info">
                <div class="doctor-name">${escapeHtml(d.name)}</div>
                <div class="doctor-spec">${escapeHtml(d.spec)}</div>
                <div class="doctor-hospital">🏥 ${escapeHtml(d.hosp)} · ${escapeHtml(d.dist)}</div>
                <div class="doctor-tags">
                    <span class="doctor-tag">${escapeHtml(d.qual)}</span>
                    <span class="doctor-tag">⏱ ${escapeHtml(d.exp)}</span>
                    <span class="doctor-tag">🕐 ${escapeHtml(d.avail)}</span>
                </div>
                <a href="tel:${d.phone}" class="doctor-call-btn">
                    📞 Call: ${escapeHtml(d.phone)}
                </a>
            </div>
        </div>
    `).join('');
}

// ═══════════════════════════════════════════
// HOSPITALS
// ═══════════════════════════════════════════
function initHospitals() {
    renderDistrictFilter();
    renderHospitals();
    
    const searchInput = document.getElementById('hospSearch');
    if (searchInput) {
        searchInput.addEventListener('input', () => renderHospitals());
    }

    const districtFilter = document.getElementById('districtFilter');
    if (districtFilter) {
        districtFilter.addEventListener('change', () => renderHospitals());
    }
}

function renderDistrictFilter() {
    const select = document.getElementById('districtFilter');
    if (!select) return;

    const districts = [...new Set(HOSPITALS.map(h => h.dist))].sort();
    
    select.innerHTML = '<option value="">All Districts</option>';
    districts.forEach(d => {
        select.innerHTML += `<option value="${d}">${d}</option>`;
    });
}

function renderHospitals() {
    const container = document.getElementById('hospitalList');
    if (!container) return;

    const searchTerm = document.getElementById('hospSearch')?.value?.toLowerCase() || '';
    const districtFilter = document.getElementById('districtFilter')?.value || '';

    const filtered = HOSPITALS.filter(h => {
        const matchesDistrict = !districtFilter || h.dist === districtFilter;
        const matchesSearch = !searchTerm ||
            h.name.toLowerCase().includes(searchTerm) ||
            h.dist.toLowerCase().includes(searchTerm) ||
            h.addr.toLowerCase().includes(searchTerm);
        return matchesDistrict && matchesSearch;
    });

    if (filtered.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">🔍</div>
                <p>No hospitals found matching your search.</p>
            </div>
        `;
        return;
    }

    container.innerHTML = filtered.map(h => {
        const mapsUrl = `https://maps.google.com/?q=${encodeURIComponent(h.name + ' ' + h.addr)}`;
        return `
            <div class="hospital-card animate-fade-in">
                <div class="hospital-name">🏥 ${escapeHtml(h.name)}</div>
                <div class="hospital-address">📍 ${escapeHtml(h.addr)}</div>
                <div class="hospital-tags">
                    ${h.emergency ? '<span class="hospital-tag emergency">🚨 Emergency 24/7</span>' : ''}
                    <span class="hospital-tag beds">🛏 ${h.beds} Beds</span>
                    <span class="hospital-tag phone">📞 ${escapeHtml(h.phone)}</span>
                </div>
                <a href="${mapsUrl}" target="_blank" class="hospital-directions">
                    🗺️ Get Directions
                </a>
            </div>
        `;
    }).join('');
}

// ═══════════════════════════════════════════
// SKIN ANALYSIS
// ═══════════════════════════════════════════
function initSkinAnalysis() {
    const uploadZone = document.getElementById('uploadZone');
    const fileInput = document.getElementById('skinFileInput');

    if (uploadZone && fileInput) {
        uploadZone.addEventListener('click', () => fileInput.click());
        fileInput.addEventListener('change', (e) => analyzeSkin(e.target));
    }
}

function demoSkin(type) {
    const condition = SKIN_CONDITIONS[type];
    if (!condition) return;
    
    showSkinResult('🔬', condition.name, condition.severity, condition.desc, condition.rec);
}

async function analyzeSkin(input) {
    const file = input.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => runSkinAnalysis(e.target.result);
    reader.readAsDataURL(file);
    input.value = '';
}

async function runSkinAnalysis(imgData) {
    const result = document.getElementById('skinResult');
    if (!result) return;

    result.classList.add('show');
    document.getElementById('skinThumb').textContent = '⏳';
    document.getElementById('skinCondition').textContent = 'Analyzing image...';
    document.getElementById('skinSeverity').className = 'severity-badge';
    document.getElementById('skinSeverity').textContent = '⏳ Processing';
    document.getElementById('skinDesc').textContent = '';
    document.getElementById('skinRec').textContent = '';

    try {
        const base64 = imgData.split(',')[1];
        const mtype = imgData.split(';')[0].split(':')[1];
        
        const res = await fetch('https://api.anthropic.com/v1/messages', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                model: 'claude-sonnet-4-20250514',
                max_tokens: 600,
                messages: [{
                    role: 'user',
                    content: [
                        {
                            type: 'image',
                            source: { type: 'base64', media_type: mtype, data: base64 }
                        },
                        {
                            type: 'text',
                            text: 'Analyze this skin image. Respond ONLY with JSON (no markdown): {"condition":"<name>","severity":"<mild|moderate|severe>","description":"<2 sentences>","recommendation":"<2-3 sentences>","requiresDoctor": <true|false>}'
                        }
                    ]
                }]
            })
        });

        const data = await res.json();
        const raw = data.content.map(c => c.text || '').join('').replace(/```json|```/g, '').trim();
        const r = JSON.parse(raw.match(/\{[\s\S]*\}/)[0]);
        
        showSkinResult('🔬', r.condition, r.severity, r.description, r.recommendation);
    } catch (e) {
        showSkinResult(
            '⚠️',
            'Analysis Error',
            'moderate',
            'Unable to process image with AI. Please ensure good lighting and a clear photo.',
            'Please consult a dermatologist or general physician for proper diagnosis.'
        );
    }
}

function showSkinResult(emoji, condition, severity, desc, rec) {
    const result = document.getElementById('skinResult');
    if (!result) return;

    result.classList.add('show');
    
    document.getElementById('skinThumb').textContent = emoji;
    document.getElementById('skinCondition').textContent = condition;
    
    const severityBadge = document.getElementById('skinSeverity');
    severityBadge.className = `severity-badge ${severity}`;
    severityBadge.textContent = severity.charAt(0).toUpperCase() + severity.slice(1) + ' Severity';
    
    document.getElementById('skinDesc').textContent = desc;
    document.getElementById('skinRec').textContent = rec;

    result.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// ═══════════════════════════════════════════
// EMERGENCY
// ═══════════════════════════════════════════
function showEmergencyOverlay() {
    const overlay = document.getElementById('emergencyOverlay');
    if (overlay) overlay.classList.add('show');
}

function hideEmergencyOverlay() {
    const overlay = document.getElementById('emergencyOverlay');
    if (overlay) overlay.classList.remove('show');
}

// ═══════════════════════════════════════════
// UTILITIES
// ═══════════════════════════════════════════
function escapeHtml(str) {
    if (!str) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

function showToast(message, duration = 3000) {
    let toast = document.getElementById('toast');
    
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'toast';
        toast.className = 'toast';
        document.body.appendChild(toast);
    }

    toast.textContent = message;
    toast.classList.add('show');

    setTimeout(() => {
        toast.classList.remove('show');
    }, duration);
}

// Make functions globally available
window.doLogin = doLogin;
window.doRegister = doRegister;
window.logout = logout;
window.setLanguage = setLanguage;
window.sendMessage = sendMessage;
window.toggleVoice = toggleVoice;
window.stopVoice = stopVoice;
window.speakText = speakText;
window.saveProfile = saveProfile;
window.demoSkin = demoSkin;
window.analyzeSkin = analyzeSkin;
window.showEmergencyOverlay = showEmergencyOverlay;
window.hideEmergencyOverlay = hideEmergencyOverlay;
window.showToast = showToast;