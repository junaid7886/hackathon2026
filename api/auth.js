/**
 * Vercel Serverless Function - Authentication API
 * Handles user registration, login, and profile management
 */

// In-memory storage for Vercel (use a database in production)
let users = [{
    id: 'user_1',
    name: 'Default User',
    email: 'demo@quickcare.com',
    password: 'demo1234',
    createdAt: new Date().toISOString()
}];

export default async function handler(req, res) {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    // Handle preflight request
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    const { action } = req.query;

    try {
        switch (req.method) {
            case 'POST':
                if (action === 'register') {
                    return handleRegister(req, res);
                } else if (action === 'login') {
                    return handleLogin(req, res);
                }
                break;
            case 'GET':
                if (action === 'user') {
                    return handleGetUser(req, res);
                }
                break;
            case 'PUT':
                if (action === 'user') {
                    return handleUpdateUser(req, res);
                }
                break;
            default:
                return res.status(405).json({ error: 'Method not allowed' });
        }

        return res.status(400).json({ error: 'Invalid action' });
    } catch (error) {
        console.error('Auth API error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}

function handleRegister(req, res) {
    const { name, email, password, age, gender, language } = req.body;

    if (!name || !email || !password) {
        return res.status(400).json({ error: 'Name, email, and password are required' });
    }

    if (password.length < 8) {
        return res.status(400).json({ error: 'Password must be at least 8 characters' });
    }

    // Check if user already exists
    const existingUser = users.find(u => u.email === email);
    if (existingUser) {
        return res.status(409).json({ error: 'User with this email already exists' });
    }

    const user = {
        id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        name,
        email,
        password, // In production, hash this!
        age: age || null,
        gender: gender || null,
        language: language || 'en',
        createdAt: new Date().toISOString()
    };

    users.push(user);

    // Don't send password back
    const { password: _, ...safeUser } = user;
    return res.status(201).json({ success: true, user: safeUser });
}

function handleLogin(req, res) {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
    }

    const user = users.find(u => u.email === email && u.password === password);

    if (!user) {
        return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Don't send password back
    const { password: _, ...safeUser } = user;
    return res.json({ success: true, user: safeUser });
}

function handleGetUser(req, res) {
    const { id } = req.query;

    if (!id) {
        return res.status(400).json({ error: 'User ID is required' });
    }

    const user = users.find(u => u.id === id);

    if (!user) {
        return res.status(404).json({ error: 'User not found' });
    }

    const { password: _, ...safeUser } = user;
    return res.json({ user: safeUser });
}

function handleUpdateUser(req, res) {
    const { id } = req.query;
    const updates = req.body;

    if (!id) {
        return res.status(400).json({ error: 'User ID is required' });
    }

    const userIndex = users.findIndex(u => u.id === id);

    if (userIndex === -1) {
        return res.status(404).json({ error: 'User not found' });
    }

    // Update allowed fields only
    const allowedFields = ['name', 'age', 'gender', 'language', 'phone', 'weight', 'bloodType'];
    allowedFields.forEach(field => {
        if (updates[field] !== undefined) {
            users[userIndex][field] = updates[field];
        }
    });

    users[userIndex].updatedAt = new Date().toISOString();

    const { password: _, ...safeUser } = users[userIndex];
    return res.json({ success: true, user: safeUser });
}