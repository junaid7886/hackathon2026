// Vercel Serverless Function - Health Records API

export default function handler(req, res) {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method === 'POST') {
        const { type, value, unit, notes, userId = 'user_1' } = req.body || {};

        if (!type || !value) {
            return res.status(400).json({ error: 'Type and value are required' });
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

        return res.json({ 
            success: true, 
            record,
            note: 'Record created (use client-side localStorage for persistence)'
        });
    }

    if (req.method === 'GET') {
        // Return sample data - actual data should come from client localStorage or database
        return res.json({ 
            records: [],
            total: 0,
            note: 'Use client-side localStorage for health records'
        });
    }

    return res.status(405).json({ error: 'Method not allowed' });
}


