/**
 * Sentinel AI - State Management
 * Handles data persistence using localStorage
 */

const State = {
    // Keys
    HISTORY_KEY: 'sentinel_scan_history',
    SETTINGS_KEY: 'sentinel_settings',

    // Default Settings
    defaultSettings: {
        heuristicScan: true,
        autoQuarantine: false,
        notifications: true
    },

    // --- History Management ---

    getHistory() {
        const history = localStorage.getItem(this.HISTORY_KEY);
        return history ? JSON.parse(history) : [];
    },

    saveScan(scanResult) {
        const history = this.getHistory();
        // Add timestamp and ID
        const record = {
            id: Date.now().toString(),
            timestamp: new Date().toISOString(),
            ...scanResult
        };
        // Prepend to history (newest first)
        history.unshift(record);
        localStorage.setItem(this.HISTORY_KEY, JSON.stringify(history));
    },

    clearHistory() {
        localStorage.removeItem(this.HISTORY_KEY);
    },

    deleteItem(id) {
        let history = this.getHistory();
        history = history.filter(item => item.id !== id);
        localStorage.setItem(this.HISTORY_KEY, JSON.stringify(history));
    },

    updateStatus(id, newStatus) {
        const history = this.getHistory();
        const item = history.find(i => i.id === id);
        if (item) {
            item.status = newStatus; // e.g., 'Safe' or 'Critical'
            // If moving to Safe (False Positive), maybe reset score? 
            // For now just update status/tag.
            if (newStatus === 'Safe') {
                item.is_malware = false;
                item.threat_score = 0; // Reset score for false positives
            }
            localStorage.setItem(this.HISTORY_KEY, JSON.stringify(history));
        }
    },

    // --- Settings Management ---

    getSettings() {
        const settings = localStorage.getItem(this.SETTINGS_KEY);
        return settings ? JSON.parse(settings) : this.defaultSettings;
    },

    saveSettings(newSettings) {
        localStorage.setItem(this.SETTINGS_KEY, JSON.stringify(newSettings));
    }
};

// Expose globally
window.SentinelState = State;
