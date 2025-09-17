export class SettingsManager {
    constructor() {
        this.settingsKey = 'kyivAttacksMapSettings';
    }

    loadSettings() {
        try {
            const settings = localStorage.getItem(this.settingsKey);
            if (settings) {
                return JSON.parse(settings);
            }
        } catch (e) {
            console.error('Error loading settings from localStorage', e);
        }
        
        // Default settings
        return {
            filters: {
                weaponType: 'all',
                timeOfDay: 'all',
                killed: 0,
                wounded: 0,
                autoZoom: true // Default to enabled
            },
            map: {
                zoom: 11,
                center: { lat: 50.4501, lng: 30.5234 }
            },
            dateRange: null // Will be set after data is loaded
        };
    }

    saveSettings(settings) {
        try {
            localStorage.setItem(this.settingsKey, JSON.stringify(settings));
        } catch (e) {
            console.error('Error saving settings to localStorage', e);
        }
    }
} 