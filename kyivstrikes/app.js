import { fetchWikiContent } from './js/wiki-api.js';
import { WikiParser } from './js/wiki-parser.js';
import { MapManager } from './js/map-manager.js';
import { UIManager } from './js/ui-manager.js';
import { SettingsManager } from './js/settings-manager.js';

class KyivAttacksMap {
    constructor() {
        this.settingsManager = new SettingsManager();
        const savedSettings = this.settingsManager.loadSettings();

        this.allData = [];
        this.filteredData = [];
        this.dateRange = { min: null, max: null, start: null, end: null };
        this.filters = savedSettings.filters;
        this.mapState = savedSettings.map;

        this.parser = new WikiParser();
        this.mapManager = new MapManager('map', this.onMapViewChange.bind(this));
        this.uiManager = new UIManager(
            this.onDateRangeChange.bind(this),
            this.mapManager.getYearColor,
            this.onFilterChange.bind(this)
        );

        // Expose date range for mobile date pickers (read-only)
        window.__getDateRange = () => ({...this.dateRange});
        this.mapManager.setUIManager(this.uiManager);

        this.init(savedSettings);
    }

    async init(savedSettings) {
        try {
            this.mapManager.initMap('map', savedSettings.map);

            const content = await fetchWikiContent();
            this.allData = this.parser.parse(content);
            
            this.calculateDateRange(savedSettings.dateRange);
            
            this.uiManager.init(this.dateRange, savedSettings.filters);
            
            this.filterAndDisplayData();

            // Notify mobile UI that date range is ready (after data loaded)
            window.dispatchEvent(new CustomEvent('date-range-ready', { detail: { dateRange: this.dateRange } }));

        } catch (error) {
            this.uiManager.showError('Помилка: ' + error.message);
            this.uiManager.hideLoading();
        }
    }

    saveCurrentState() {
        const settings = {
            filters: this.filters,
            map: this.mapState,
            dateRange: {
                start: this.dateRange.start.toISOString(),
                end: this.dateRange.end.toISOString()
            }
        };
        this.settingsManager.saveSettings(settings);
    }

    onMapViewChange(newMapState) {
        this.mapState = newMapState;
        this.saveCurrentState();
    }

    onDateRangeChange(newStart, newEnd) {
        this.dateRange.start = newStart;
        this.dateRange.end = newEnd;
        this.filterAndDisplayData();
        this.saveCurrentState();
    }

    // Bridge for mobile date pickers
    onMobileDateChange(start, end) {
        this.onDateRangeChange(start, end);
    }

    onFilterChange(newFilters) {
        this.filters = newFilters;
        this.filterAndDisplayData();
        this.saveCurrentState();
    }

    calculateDateRange(savedDateRange) {
        if (this.allData.length === 0) return;

        const dates = this.allData.map(item => this.parseDate(item.date))
                                  .filter(date => date && !isNaN(date.getTime()))
                                  .sort((a, b) => a - b);
        
        if (dates.length === 0) return;
        
        this.dateRange.min = dates[0];
        const lastDataDate = dates[dates.length - 1];
        const today = new Date();

        this.dateRange.max = today > lastDataDate ? today : lastDataDate;

        if (savedDateRange && savedDateRange.start && savedDateRange.end) {
            this.dateRange.start = new Date(savedDateRange.start);
            this.dateRange.end = new Date(savedDateRange.end);
            
            if (this.dateRange.end > this.dateRange.max) {
                this.dateRange.end = this.dateRange.max;
            }
            if (this.dateRange.start < this.dateRange.min) {
                this.dateRange.start = this.dateRange.min;
            }
            if (this.dateRange.start > this.dateRange.end) {
                this.dateRange.start = this.dateRange.min;
            }

        } else {
            this.dateRange.start = this.dateRange.min;
            this.dateRange.end = this.dateRange.max;
        }
    }

    filterAndDisplayData() {
        this.filteredData = this.allData.filter(item => {
            const itemDate = this.parseDate(item.date);
            if (!itemDate || itemDate < this.dateRange.start || itemDate > this.dateRange.end) {
                return false;
            }

            if (this.filters.weaponType !== 'all' && item.weaponType !== this.filters.weaponType) {
                return false;
            }

            if (this.filters.timeOfDay !== 'all' && item.timeOfDay !== this.filters.timeOfDay) {
                return false;
            }

            if (item.killed < this.filters.killed) {
                return false;
            }

            if (item.wounded < this.filters.wounded) {
                return false;
            }

            return true;
        });

        this.mapManager.displayMarkers(this.filteredData, this.filters.autoZoom);
        this.uiManager.updatePointsCounter(this.filteredData, this.allData, this.dateRange, this.parser.pointsWithoutCoords);
        this.uiManager.updateLegend(this.filteredData, this.allData);
    }

    parseDate(dateStr) {
        if (!dateStr || typeof dateStr !== 'string') return null;
        
        const parts = dateStr.split('-');
        if (parts.length !== 3) return null;
        
        const day = parseInt(parts[0], 10);
        const month = parseInt(parts[1], 10);
        const year = parseInt(parts[2], 10);
        
        if (isNaN(day) || isNaN(month) || isNaN(year)) return null;
        if (day < 1 || day > 31 || month < 1 || month > 12) return null;
        if (year < 2020 || year > 2030) return null;
        
        const date = new Date(year, month - 1, day);
        
        if (date.getDate() !== day || date.getMonth() !== month - 1 || date.getFullYear() !== year) {
            return null;
        }
        
        return date;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const app = new KyivAttacksMap();
    // Listen to mobile date change events and forward to app
    window.addEventListener('mobile-date-change', (e) => {
        const { start, end } = e.detail || {};
        if (start && end) {
            app.onMobileDateChange(start, end);
        }
    });
});