import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(
    import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('.'));

// Data file paths
const DATA_DIR = path.join(__dirname, 'data');
const ACTIVITIES_FILE = path.join(DATA_DIR, 'activities.json');
const HEALTH_RECORDS_FILE = path.join(DATA_DIR, 'health-records.json');
const USERS_FILE = path.join(DATA_DIR, 'users.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Initialize data files if they don't exist
function initDataFile(filePath, defaultData) {
    if (!fs.existsSync(filePath)) {
        fs.writeFileSync(filePath, JSON.stringify(defaultData, null, 2));
    }
}

initDataFile(ACTIVITIES_FILE, { activities: [] });
initDataFile(HEALTH_RECORDS_FILE, { records: [] });
initDataFile(USERS_FILE, { users: [{ id: 'user_1', name: 'Default User', createdAt: new Date().toISOString() }] });

// Helper functions
function readJSON(filePath) {
    try {
        return JSON.parse(fs.readFileSync(filePath, 'utf8'));
    } catch (error) {
        console.error(`Error reading ${filePath}:`, error);
        return null;
    }
}

function writeJSON(filePath, data) {
    try {
        fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
        return true;
    } catch (error) {
        console.error(`Error writing ${filePath}:`, error);
        return false;
    }
}

// ==================== ACTIVITY TRACKING ROUTES ====================

// Log a new activity
app.post('/api/activities', (req, res) => {
    const { type, page, details, userId = 'user_1' } = req.body;

    if (!type || !page) {
        return res.status(400).json({ error: 'Type and page are required' });
    }

    const data = readJSON(ACTIVITIES_FILE);
    if (!data) {
        return res.status(500).json({ error: 'Failed to read activities' });
    }

    const activity = {
        id: `act_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        userId,
        type,
        page,
        details: details || {},
        timestamp: new Date().toISOString(),
        date: new Date().toLocaleDateString('en-IN'),
        time: new Date().toLocaleTimeString('en-IN')
    };

    data.activities.unshift(activity); // Add to beginning

    // Keep only last 1000 activities
    if (data.activities.length > 1000) {
        data.activities = data.activities.slice(0, 1000);
    }

    if (writeJSON(ACTIVITIES_FILE, data)) {
        res.json({ success: true, activity });
    } else {
        res.status(500).json({ error: 'Failed to save activity' });
    }
});

// Get all activities
app.get('/api/activities', (req, res) => {
    const { limit = 100, type, page, userId } = req.query;

    const data = readJSON(ACTIVITIES_FILE);
    if (!data) {
        return res.status(500).json({ error: 'Failed to read activities' });
    }

    let activities = data.activities;

    // Apply filters
    if (type) {
        activities = activities.filter(a => a.type === type);
    }
    if (page) {
        activities = activities.filter(a => a.page === page);
    }
    if (userId) {
        activities = activities.filter(a => a.userId === userId);
    }

    // Apply limit
    activities = activities.slice(0, parseInt(limit));

    res.json({ activities, total: data.activities.length });
});

// Get activity statistics
app.get('/api/activities/stats', (req, res) => {
    const data = readJSON(ACTIVITIES_FILE);
    if (!data) {
        return res.status(500).json({ error: 'Failed to read activities' });
    }

    const activities = data.activities;

    // Calculate statistics
    const stats = {
        totalActivities: activities.length,
        pageVisits: activities.filter(a => a.type === 'page_visit').length,
        searches: activities.filter(a => a.type === 'search').length,
        chatMessages: activities.filter(a => a.type === 'chat_message').length,
        doctorViews: activities.filter(a => a.type === 'doctor_view').length,
        hospitalViews: activities.filter(a => a.type === 'hospital_view').length,
        filterUsed: activities.filter(a => a.type === 'filter_applied').length,
        emergencyCalls: activities.filter(a => a.type === 'emergency_call').length,
        skinAnalysis: activities.filter(a => a.type === 'skin_analysis').length,
        todayActivities: activities.filter(a => {
            const actDate = new Date(a.timestamp).toDateString();
            return actDate === new Date().toDateString();
        }).length,
        last7Days: activities.filter(a => {
            const actDate = new Date(a.timestamp);
            const weekAgo = new Date();
            weekAgo.setDate(weekAgo.getDate() - 7);
            return actDate >= weekAgo;
        }).length
    };

    // Page breakdown
    const pageBreakdown = {};
    activities.forEach(a => {
        pageBreakdown[a.page] = (pageBreakdown[a.page] || 0) + 1;
    });
    stats.pageBreakdown = pageBreakdown;

    // Activity type breakdown
    const typeBreakdown = {};
    activities.forEach(a => {
        typeBreakdown[a.type] = (typeBreakdown[a.type] || 0) + 1;
    });
    stats.typeBreakdown = typeBreakdown;

    // Daily activity for last 7 days
    const dailyActivity = {};
    for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateStr = date.toLocaleDateString('en-IN');
        dailyActivity[dateStr] = 0;
    }
    activities.forEach(a => {
        const dateStr = a.date;
        if (dailyActivity.hasOwnProperty(dateStr)) {
            dailyActivity[dateStr]++;
        }
    });
    stats.dailyActivity = dailyActivity;

    res.json(stats);
});

// Clear all activities (for testing)
app.delete('/api/activities', (req, res) => {
    if (writeJSON(ACTIVITIES_FILE, { activities: [] })) {
        res.json({ success: true, message: 'All activities cleared' });
    } else {
        res.status(500).json({ error: 'Failed to clear activities' });
    }
});

// ==================== AUTHENTICATION ROUTES ====================

// Register a new user
app.post('/api/auth/register', (req, res) => {
    const { name, email, password, age, gender, language } = req.body;

    if (!name || !email || !password) {
        return res.status(400).json({ error: 'Name, email, and password are required' });
    }

    if (password.length < 8) {
        return res.status(400).json({ error: 'Password must be at least 8 characters' });
    }

    const data = readJSON(USERS_FILE);
    if (!data) {
        return res.status(500).json({ error: 'Failed to read users' });
    }

    // Check if user already exists
    const existingUser = data.users.find(u => u.email === email);
    if (existingUser) {
        return res.status(409).json({ error: 'User with this email already exists' });
    }

    const user = {
        id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        name,
        email,
        password, // In production, this should be hashed!
        age: age || null,
        gender: gender || null,
        language: language || 'en',
        createdAt: new Date().toISOString()
    };

    data.users.push(user);

    if (writeJSON(USERS_FILE, data)) {
        // Don't send password back
        const { password: _, ...safeUser } = user;
        res.json({ success: true, user: safeUser });
    } else {
        res.status(500).json({ error: 'Failed to create user' });
    }
});

// Login
app.post('/api/auth/login', (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
    }

    const data = readJSON(USERS_FILE);
    if (!data) {
        return res.status(500).json({ error: 'Failed to read users' });
    }

    const user = data.users.find(u => u.email === email && u.password === password);

    if (!user) {
        return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Don't send password back
    const { password: _, ...safeUser } = user;
    res.json({ success: true, user: safeUser });
});

// Get user by ID
app.get('/api/auth/user/:id', (req, res) => {
    const { id } = req.params;

    const data = readJSON(USERS_FILE);
    if (!data) {
        return res.status(500).json({ error: 'Failed to read users' });
    }

    const user = data.users.find(u => u.id === id);

    if (!user) {
        return res.status(404).json({ error: 'User not found' });
    }

    // Don't send password back
    const { password: _, ...safeUser } = user;
    res.json({ user: safeUser });
});

// Update user profile
app.put('/api/auth/user/:id', (req, res) => {
    const { id } = req.params;
    const updates = req.body;

    const data = readJSON(USERS_FILE);
    if (!data) {
        return res.status(500).json({ error: 'Failed to read users' });
    }

    const userIndex = data.users.findIndex(u => u.id === id);

    if (userIndex === -1) {
        return res.status(404).json({ error: 'User not found' });
    }

    // Update allowed fields only
    const allowedFields = ['name', 'age', 'gender', 'language', 'phone', 'weight', 'bloodType'];
    allowedFields.forEach(field => {
        if (updates[field] !== undefined) {
            data.users[userIndex][field] = updates[field];
        }
    });

    data.users[userIndex].updatedAt = new Date().toISOString();

    if (writeJSON(USERS_FILE, data)) {
        const { password: _, ...safeUser } = data.users[userIndex];
        res.json({ success: true, user: safeUser });
    } else {
        res.status(500).json({ error: 'Failed to update user' });
    }
});

// ==================== HEALTH RECORDS ROUTES ====================

// Add a health record
app.post('/api/health-records', (req, res) => {
    const { type, value, unit, notes, userId = 'user_1' } = req.body;

    if (!type || !value) {
        return res.status(400).json({ error: 'Type and value are required' });
    }

    const data = readJSON(HEALTH_RECORDS_FILE);
    if (!data) {
        return res.status(500).json({ error: 'Failed to read health records' });
    }

    const record = {
        id: `hr_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        userId,
        type,
        value,
        unit: unit || '',
        notes: notes || '',
        timestamp: new Date().toISOString(),
        date: new Date().toLocaleDateString('en-IN'),
        time: new Date().toLocaleTimeString('en-IN')
    };

    data.records.unshift(record);

    if (writeJSON(HEALTH_RECORDS_FILE, data)) {
        res.json({ success: true, record });
    } else {
        res.status(500).json({ error: 'Failed to save health record' });
    }
});

// Get all health records
app.get('/api/health-records', (req, res) => {
    const { limit = 50, type, userId } = req.query;

    const data = readJSON(HEALTH_RECORDS_FILE);
    if (!data) {
        return res.status(500).json({ error: 'Failed to read health records' });
    }

    let records = data.records;

    if (type) {
        records = records.filter(r => r.type === type);
    }
    if (userId) {
        records = records.filter(r => r.userId === userId);
    }

    records = records.slice(0, parseInt(limit));

    res.json({ records, total: data.records.length });
});

// Get latest vital for each type
app.get('/api/health-records/vitals', (req, res) => {
    const data = readJSON(HEALTH_RECORDS_FILE);
    if (!data) {
        return res.status(500).json({ error: 'Failed to read health records' });
    }

    const vitalTypes = ['blood_pressure', 'heart_rate', 'blood_sugar', 'weight', 'temperature', 'oxygen'];
    const vitals = {};

    vitalTypes.forEach(type => {
        const record = data.records.find(r => r.type === type);
        vitals[type] = record || null;
    });

    res.json(vitals);
});

// ==================== ML CHATBOT API ====================

// Get symptoms list
app.get('/api/symptoms', (req, res) => {
    res.json({
        symptoms: [
            'itching', 'skin_rash', 'nodal_skin_eruptions', 'continuous_sneezing', 'shivering',
            'chills', 'joint_pain', 'stomach_pain', 'acidity', 'ulcers_on_tongue', 'muscle_wasting',
            'vomiting', 'burning_micturition', 'spotting_urination', 'fatigue', 'weight_gain',
            'anxiety', 'cold_hands_and_feets', 'mood_swings', 'weight_loss', 'restlessness',
            'lethargy', 'patches_in_throat', 'irregular_sugar_level', 'cough', 'high_fever',
            'sunken_eyes', 'breathlessness', 'sweating', 'dehydration', 'indigestion', 'headache',
            'yellowish_skin', 'dark_urine', 'nausea', 'loss_of_appetite', 'pain_behind_the_eyes',
            'back_pain', 'constipation', 'abdominal_pain', 'diarrhoea', 'mild_fever', 'yellow_urine',
            'yellowing_of_eyes', 'acute_liver_failure', 'fluid_overload', 'swelling_of_stomach'
        ]
    });
});

// Chat endpoint (disease prediction)
app.post('/api/chat', (req, res) => {
    const { message } = req.body;
    
    // Fallback response when ML model is not available
    const response = {
        prediction: null,
        message: 'Based on your description: ' + message,
        recommendations: [
            'Consult with a healthcare professional for accurate diagnosis',
            'Keep track of your symptoms',
            'Maintain a healthy lifestyle',
            'Follow prescribed medications if any'
        ],
        severity: 'moderate',
        confidence: 0.5
    };
    
    res.json(response);
});

// ==================== SERVE STATIC FILES ====================

// Serve pages
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Route for /pages/:page (e.g., /pages/dashboard)
app.get('/pages/:page', (req, res) => {
    res.sendFile(path.join(__dirname, 'pages', req.params.page + '.html'));
});

// Route for direct page access (e.g., /dashboard.html or /dashboard)
app.get('/:page.html', (req, res) => {
    const filePath = path.join(__dirname, 'pages', req.params.page + '.html');
    res.sendFile(filePath, (err) => {
        if (err) {
            res.status(404).json({ error: 'Page not found' });
        }
    });
});

// Route for page without extension (e.g., /dashboard)
app.get('/:page', (req, res) => {
    const filePath = path.join(__dirname, 'pages', req.params.page + '.html');
    res.sendFile(filePath, (err) => {
        if (err) {
            // If file doesn't exist, send 404
            res.status(404).send('Page not found');
        }
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║   🏥 Quick Care Backend Server                          ║
║                                                           ║
║   Server running at: http://localhost:${PORT}              ║
║                                                           ║
║   API Endpoints:                                          ║
║   • POST /api/activities    - Log activity               ║
║   • GET  /api/activities    - Get all activities         ║
║   • GET  /api/activities/stats - Get statistics          ║
║   • POST /api/health-records - Add health record         ║
║   • GET  /api/health-records - Get health records        ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
    `);
});