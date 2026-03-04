/**
 * RuralMed AI Activity Tracker
 * This script tracks user activities across all pages
 */

const ActivityTracker = {
    API_URL: 'http://localhost:3000/api',
    userId: 'user_1',
    currentPage: '',
    sessionId: '',
    isOnline: true,
    pendingActivities: [],

    // Initialize the tracker
    init: function() {
        this.sessionId = this.getSessionId();
        this.currentPage = this.getPageName();
        this.checkServerConnection();
        this.trackPageVisit();
        this.setupEventListeners();
        this.syncPendingActivities();
        console.log('📊 Activity Tracker initialized for:', this.currentPage);
    },

    // Get or create session ID
    getSessionId: function() {
        let sessionId = sessionStorage.getItem('ruralmed_session_id');
        if (!sessionId) {
            sessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
            sessionStorage.setItem('ruralmed_session_id', sessionId);
        }
        return sessionId;
    },

    // Get current page name from URL
    getPageName: function() {
        const path = window.location.pathname;
        const filename = path.split('/').pop() || 'index.html';
        return filename.replace('.html', '');
    },

    // Check if server is running
    checkServerConnection: async function() {
        try {
            const response = await fetch(this.API_URL + '/activities/stats', {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' }
            });
            this.isOnline = response.ok;
        } catch (error) {
            this.isOnline = false;
            console.log('📊 Server offline - activities will be stored locally');
        }
    },

    // Log activity to server
    logActivity: async function(type, details = {}) {
        const activity = {
            type: type,
            page: this.currentPage,
            details: {
                ...details,
                sessionId: this.sessionId,
                userAgent: navigator.userAgent,
                screenSize: `${window.innerWidth}x${window.innerHeight}`,
                language: navigator.language
            },
            userId: this.userId
        };

        // Try to send to server
        if (this.isOnline) {
            try {
                const response = await fetch(this.API_URL + '/activities', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(activity)
                });
                
                if (response.ok) {
                    const result = await response.json();
                    console.log('📊 Activity logged:', type, details);
                    return result;
                } else {
                    this.storeLocally(activity);
                }
            } catch (error) {
                this.storeLocally(activity);
            }
        } else {
            this.storeLocally(activity);
        }
    },

    // Store activity locally when offline
    storeLocally: function(activity) {
        const pending = JSON.parse(localStorage.getItem('pendingActivities') || '[]');
        pending.push({ ...activity, localTimestamp: new Date().toISOString() });
        localStorage.setItem('pendingActivities', JSON.stringify(pending));
        console.log('📊 Activity stored locally (offline)');
    },

    // Sync pending activities when back online
    syncPendingActivities: async function() {
        if (!this.isOnline) return;

        const pending = JSON.parse(localStorage.getItem('pendingActivities') || '[]');
        if (pending.length === 0) return;

        console.log('📊 Syncing', pending.length, 'pending activities...');

        for (const activity of pending) {
            try {
                await fetch(this.API_URL + '/activities', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(activity)
                });
            } catch (error) {
                console.log('📊 Failed to sync activity');
            }
        }

        localStorage.removeItem('pendingActivities');
    },

    // Track page visit
    trackPageVisit: function() {
        const referrer = document.referrer;
        const previousPage = referrer ? new URL(referrer).pathname.split('/').pop() : 'direct';
        
        this.logActivity('page_visit', {
            pageTitle: document.title,
            referrer: previousPage,
            url: window.location.href
        });
    },

    // Setup event listeners
    setupEventListeners: function() {
        const self = this;

        // Track search inputs
        document.querySelectorAll('input[type="search"], input[type="text"], #searchInput, .search-bar input').forEach(input => {
            let searchTimeout;
            input.addEventListener('input', function(e) {
                clearTimeout(searchTimeout);
                searchTimeout = setTimeout(() => {
                    if (e.target.value.trim().length > 2) {
                        self.logActivity('search', {
                            query: e.target.value.trim(),
                            inputId: e.target.id || 'unknown'
                        });
                    }
                }, 1000);
            });
        });

        // Track dropdown/select changes
        document.querySelectorAll('select').forEach(select => {
            select.addEventListener('change', function(e) {
                self.logActivity('filter_applied', {
                    filterType: e.target.id || e.target.name || 'unknown',
                    filterValue: e.target.value,
                    filterText: e.target.options[e.target.selectedIndex]?.text || e.target.value
                });
            });
        });

        // Track button clicks
        document.querySelectorAll('button, .btn, .action-btn').forEach(btn => {
            btn.addEventListener('click', function(e) {
                const btnText = e.target.innerText || e.target.textContent;
                const btnId = e.target.id || e.target.className;
                
                // Determine action type
                let actionType = 'button_click';
                
                if (btnText.toLowerCase().includes('emergency') || btnId.includes('emergency')) {
                    actionType = 'emergency_call';
                } else if (btnText.toLowerCase().includes('call') || btnId.includes('call')) {
                    actionType = 'call_action';
                } else if (btnText.toLowerCase().includes('send') || btnId.includes('send')) {
                    actionType = 'chat_message';
                } else if (btnText.toLowerCase().includes('book') || btnId.includes('book')) {
                    actionType = 'booking_attempt';
                }

                self.logActivity(actionType, {
                    buttonText: btnText.substring(0, 50),
                    buttonId: btnId
                });
            });
        });

        // Track card/item clicks (doctors, hospitals)
        document.querySelectorAll('.doctor-card, .hospital-card, .feature-card').forEach(card => {
            card.addEventListener('click', function(e) {
                const cardType = card.classList.contains('doctor-card') ? 'doctor_view' : 
                                 card.classList.contains('hospital-card') ? 'hospital_view' : 'feature_click';
                
                const cardTitle = card.querySelector('h3, h4, .card-title')?.textContent || 'Unknown';
                const cardDetails = card.querySelector('p, .specialty, .card-subtitle')?.textContent || '';

                self.logActivity(cardType, {
                    itemName: cardTitle.substring(0, 100),
                    itemDetails: cardDetails.substring(0, 100)
                });
            });
        });

        // Track link clicks
        document.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', function(e) {
                self.logActivity('link_click', {
                    linkText: e.target.innerText?.substring(0, 50) || 'Unknown',
                    linkHref: e.target.href || 'no-href',
                    linkId: e.target.id || ''
                });
            });
        });

        // Track form submissions
        document.querySelectorAll('form').forEach(form => {
            form.addEventListener('submit', function(e) {
                self.logActivity('form_submit', {
                    formId: form.id || 'unknown',
                    formAction: form.action || 'no-action'
                });
            });
        });

        // Track scroll depth
        let maxScroll = 0;
        let scrollTimeout;
        window.addEventListener('scroll', function() {
            clearTimeout(scrollTimeout);
            scrollTimeout = setTimeout(() => {
                const scrollPercent = Math.round((window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100);
                if (scrollPercent > maxScroll && scrollPercent % 25 === 0) {
                    maxScroll = scrollPercent;
                    self.logActivity('scroll_depth', { depth: scrollPercent + '%' });
                }
            }, 500);
        });

        // Track page visibility changes
        document.addEventListener('visibilitychange', function() {
            if (document.visibilityState === 'visible') {
                self.logActivity('page_focus', { action: 'returned' });
            } else {
                self.logActivity('page_blur', { action: 'left' });
            }
        });

        // Track session end
        window.addEventListener('beforeunload', function() {
            self.logActivity('page_exit', {
                timeSpent: Math.round((Date.now() - performance.timing.navigationStart) / 1000) + 's'
            });
        });
    },

    // Manual tracking methods for specific actions
    trackChatMessage: function(message, response) {
        this.logActivity('chat_message', {
            userMessage: message.substring(0, 200),
            responsePreview: response ? response.substring(0, 100) : '',
            messageLength: message.length
        });
    },

    trackSymptomAnalysis: function(symptoms, result) {
        this.logActivity('symptom_analysis', {
            symptoms: symptoms,
            riskLevel: result.riskLevel || '',
            recommendation: result.recommendation || ''
        });
    },

    trackSkinAnalysis: function(result) {
        this.logActivity('skin_analysis', {
            confidence: result.confidence || '',
            condition: result.condition || '',
            timestamp: new Date().toISOString()
        });
    },

    trackEmergencyCall: function(type, number) {
        this.logActivity('emergency_call', {
            emergencyType: type,
            number: number,
            timestamp: new Date().toISOString()
        });
    },

    trackDoctorView: function(doctorName, specialty) {
        this.logActivity('doctor_view', {
            doctorName: doctorName,
            specialty: specialty
        });
    },

    trackHospitalView: function(hospitalName, type) {
        this.logActivity('hospital_view', {
            hospitalName: hospitalName,
            hospitalType: type
        });
    },

    trackBooking: function(type, details) {
        this.logActivity('booking', {
            bookingType: type,
            details: details
        });
    },

    // Get activity stats (for health records page)
    getStats: async function() {
        try {
            const response = await fetch(this.API_URL + '/activities/stats');
            if (response.ok) {
                return await response.json();
            }
        } catch (error) {
            console.log('Failed to fetch stats');
        }
        return null;
    },

    // Get recent activities (for health records page)
    getActivities: async function(limit = 50) {
        try {
            const response = await fetch(this.API_URL + '/activities?limit=' + limit);
            if (response.ok) {
                const data = await response.json();
                return data.activities;
            }
        } catch (error) {
            console.log('Failed to fetch activities');
        }
        return [];
    }
};

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => ActivityTracker.init());
} else {
    ActivityTracker.init();
}

// Make it globally available
window.ActivityTracker = ActivityTracker;
