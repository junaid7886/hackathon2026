// Vercel Serverless Function - Activity Statistics API

export default function handler(req, res) {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    // Return sample statistics
    // In production, this data should come from client-side localStorage or a database
    const stats = {
        totalActivities: 0,
        pageVisits: 0,
        searches: 0,
        chatMessages: 0,
        doctorViews: 0,
        hospitalViews: 0,
        filterUsed: 0,
        emergencyCalls: 0,
        skinAnalysis: 0,
        todayActivities: 0,
        last7Days: 0,
        pageBreakdown: {},
        typeBreakdown: {},
        dailyActivity: {},
        note: 'Statistics calculated from client-side localStorage'
    };

    return res.json(stats);
}
