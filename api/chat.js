// Vercel Serverless Function - Chat/ML Prediction API
// Proxies requests to the ML API (deployed separately)

const ML_API_URL = process.env.ML_API_URL || 'http://localhost:5000';

export default async function handler(req, res) {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { message } = req.body || {};

    if (!message) {
        return res.json({
            response: "Hi! I'm your health assistant. Please tell me about your symptoms and I'll help identify possible conditions.",
            type: 'greeting'
        });
    }

    try {
        // Try to call ML API
        const mlResponse = await fetch(`${ML_API_URL}/api/chat`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message })
        });

        if (mlResponse.ok) {
            const data = await mlResponse.json();
            return res.json(data);
        }
    } catch (error) {
        console.log('ML API not available, using fallback');
    }

    // Fallback response when ML API is unavailable
    const lowerMessage = message.toLowerCase();

    // Basic symptom detection
    const emergencyKeywords = ['chest pain', 'heart attack', 'stroke', 'unconscious', 'severe bleeding', 'cannot breathe'];
    const highKeywords = ['high fever', 'severe pain', 'difficulty breathing', 'vomiting blood', 'severe headache'];
    const moderateKeywords = ['fever', 'headache', 'cough', 'cold', 'body pain', 'stomach pain', 'diarrhea'];

    let severity = 'mild';
    let recommendation = 'Self-care';
    let responseText = '';

    for (const keyword of emergencyKeywords) {
        if (lowerMessage.includes(keyword)) {
            severity = 'emergency';
            recommendation = 'Emergency';
            responseText = `EMERGENCY: Your symptoms require immediate medical attention. Please call 108 for an ambulance or go to the nearest hospital right away.`;
            break;
        }
    }

    if (severity === 'mild') {
        for (const keyword of highKeywords) {
            if (lowerMessage.includes(keyword)) {
                severity = 'severe';
                recommendation = 'Hospital Visit';
                responseText = `Your symptoms need prompt medical attention. I recommend visiting a hospital or clinic soon.`;
                break;
            }
        }
    }

    if (severity === 'mild') {
        for (const keyword of moderateKeywords) {
            if (lowerMessage.includes(keyword)) {
                severity = 'moderate';
                recommendation = 'Teleconsultation';
                responseText = `Based on your symptoms, I recommend consulting a doctor. You can book a teleconsultation or visit a nearby clinic.`;
                break;
            }
        }
    }

    if (!responseText) {
        responseText = `I understand you're not feeling well. Your symptoms appear to be mild. Try rest, stay hydrated, and monitor your condition. If symptoms persist or worsen, please consult a doctor.`;
    }

    return res.json({
        response: responseText,
        type: 'diagnosis',
        prediction: {
            severity,
            recommendation,
            note: 'ML model unavailable - basic analysis only'
        }
    });
}