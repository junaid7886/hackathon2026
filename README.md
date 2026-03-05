# 🏥 RuralMed AI

**AI-Powered Healthcare Assistant for Rural India**

RuralMed AI is a comprehensive healthcare platform designed to provide accessible medical guidance to rural communities in India. It combines AI-powered symptom triage, multi-language support, and local healthcare resource discovery.

---

## ✨ Features

### 🤖 AI Health Chat
- Symptom-based health guidance powered by Claude AI
- Voice input/output support in multiple languages
- Emergency detection and immediate hospital referral
- Quick symptom chips for easy interaction

### 📷 Skin Analysis
- Upload photos for AI-powered skin condition detection
- Common condition identification (ringworm, eczema, fungal infections, etc.)
- Severity assessment and care recommendations
- Direct referral to dermatologists

### 👨‍⚕️ Doctor Directory
- Find qualified healthcare professionals nearby
- Filter by specialty, language, and experience
- Direct call functionality
- Consultation fee information

### 🏥 Hospital Finder
- Locate hospitals and healthcare facilities
- Filter by district, type (Government/Private/PHC)
- 24/7 emergency facility identification
- Google Maps integration for directions

### 👤 Health Profile
- Store personal health information
- Track medical conditions (diabetes, BP, heart disease, asthma)
- Record allergies and current medications
- Multi-language preference settings

---

## 🗂️ Project Structure

```
prototype2/
├── index.html              # Login/Registration page
├── README.md               # Project documentation
├── css/
│   └── styles.css          # Global stylesheet
├── js/
│   ├── data.js             # Static data (doctors, hospitals, translations)
│   └── app.js              # Main application logic
└── pages/
    ├── dashboard.html      # Main dashboard
    ├── chat.html           # AI health chat interface
    ├── profile.html        # User health profile
    ├── doctors.html        # Doctor directory
    ├── hospitals.html      # Hospital finder
    └── skin-analysis.html  # Skin condition analysis
```

---

## 🚀 Getting Started

### Prerequisites
- Modern web browser (Chrome, Firefox, Edge, Safari)
- Internet connection (for AI chat functionality)

### Installation

1. **Clone or download** the project to your local machine

2. **Open** `index.html` in your web browser

3. **Register** a new account or login with existing credentials

4. **Explore** the dashboard and features

### API Configuration

To enable AI chat functionality, add your Claude API key in `js/app.js`:

```javascript
const CLAUDE_API_KEY = 'your-api-key-here';
```

---

## 🌐 Multi-Language Support

RuralMed AI supports the following languages:

| Language | Code | Voice Support |
|----------|------|---------------|
| English  | en   | ✅ |
| Tamil    | ta   | ✅ |
| Kannada  | kn   | ✅ |

The app also understands regional medical slang and converts it to standard terms.

---

## 🛠️ Technologies Used

- **Frontend:** HTML5, CSS3, Vanilla JavaScript
- **AI:** Claude API (Anthropic)
- **Voice:** Web Speech API (Speech Recognition & Synthesis)
- **Fonts:** Google Fonts (Nunito, Playfair Display, JetBrains Mono)
- **Storage:** LocalStorage for session persistence

---

## 📱 Responsive Design

The application is fully responsive and optimized for:
- 📱 Mobile phones (< 480px)
- 📱 Tablets (480px - 768px)
- 💻 Desktops (> 768px)

Mobile users get a dedicated bottom navigation bar for easy access.

---

## ⚠️ Disclaimer

**This application is for informational purposes only.**

- AI-generated health guidance should NOT replace professional medical advice
- Always consult a qualified healthcare provider for diagnosis and treatment
- In case of emergency, call **108** (Ambulance) or **112** (Emergency Services)

---

## 🚨 Emergency Contacts

| Service | Number |
|---------|--------|
| Ambulance | 108 |
| Emergency | 112 |
| Health Helpline | 104 |

---

## 📄 License

This project is created for the hackathon and is open for educational purposes.

---

## 👥 Contributors

- Built with ❤️ for Rural India

---

*Last updated: March 2026*
