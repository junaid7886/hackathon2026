// Vercel Serverless Function - Activities API
// Note: Vercel has read-only filesystem, so activities are stored in-memory per invocation
// For production, use a database like Vercel Postgres, Upstash Redis, or MongoDB

const activities = [];

export default function handler(req, res) {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method === 'POST') {
        const { type, page, details, userId = 'user_1' } = req.body || {};

        if (!type || !page) {
            return res.status(400).json({ error: 'Type and page are required' });
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

        // Note: This won't persist across serverless invocations
        // Use client-side localStorage or a database for persistence
        return res.json({
            success: true,
            activity,
            note: 'Activity logged (client-side storage recommended for persistence)'
        });
    }

    if (req.method === 'GET') {
        // Return empty array - use client-side localStorage
        return res.json({
            activities: [],
            total: 0,
            note: 'Use client-side localStorage for activity tracking'
        });
    }

    if (req.method === 'DELETE') {
        return res.json({ success: true, message: 'Activities cleared' });
    }

    return res.status(405).json({ error: 'Method not allowed' });
}