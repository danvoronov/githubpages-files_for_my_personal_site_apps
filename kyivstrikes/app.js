import { fetchWikiContent } from './js/wiki-api.js';
import { WikiParser } from './js/wiki-parser.js';
import { MapManager } from './js/map-manager.js';
import { UIManager } from './js/ui-manager.js';
import { SettingsManager } from './js/settings-manager.js';

class KyivAttacksMap {
    constructor() {
        this.settingsManager = new SettingsManager();
        const savedSettings = this.settingsManager.loadSettings();
        this.parsedDataCacheKey = 'kyivAttacksParsedData:v1';
        this.parsedDataCacheTtlMs = 12 * 60 * 60 * 1000; // 12 hours
        this.isRefreshingData = false;

        this.allData = [];
        this.filteredData = [];
        this.dateRange = { min: null, max: null, start: null, end: null };
        this.filters = savedSettings.filters;
        this.mapState = savedSettings.map;

        this.parser = new WikiParser();
        this.mapManager = new MapManager('map', this.onMapViewChange.bind(this));
        this.uiManager = new UIManager(
            this.onDateRangeChange.bind(this),
            this.mapManager.getYearColor.bind(this.mapManager),
            this.mapManager.getDateColor.bind(this.mapManager),
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
            await this.loadData({ bypassCache: false, allowStaleFallback: true });
            
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

    async loadData({ bypassCache = false, allowStaleFallback = true } = {}) {
        if (!bypassCache) {
            const freshCachedData = this.loadParsedDataFromCache({ allowStale: false });
            if (freshCachedData) {
                this.applyParsedData(freshCachedData);
                return;
            }
        }

        try {
            const content = await fetchWikiContent();
            this.allData = this.parser.parse(content);
            this.saveParsedDataToCache({
                allData: this.allData,
                pointsWithoutCoords: this.parser.pointsWithoutCoords,
                killedTotalsByYear: this.parser.killedTotalsByYear
            });
        } catch (fetchError) {
            if (!bypassCache && allowStaleFallback) {
                const staleCachedData = this.loadParsedDataFromCache({ allowStale: true });
                if (staleCachedData) {
                    this.applyParsedData(staleCachedData);
                    return;
                }
            }
            throw fetchError;
        }
    }

    setLoadingState(message, isVisible) {
        const loading = document.getElementById('loading');
        if (!loading) return;

        const textContainer = loading.querySelector('div');
        if (textContainer && typeof message === 'string') {
            textContainer.textContent = message;
        }

        loading.style.display = isVisible ? 'block' : 'none';
    }

    async refreshDataBypassCache() {
        if (this.isRefreshingData) return;

        const refreshBtn = document.getElementById('refreshDataBtn');
        const previousLabel = refreshBtn ? refreshBtn.textContent : '';

        try {
            this.isRefreshingData = true;
            if (refreshBtn) {
                refreshBtn.disabled = true;
                refreshBtn.textContent = '...';
            }

            this.setLoadingState('Оновлення даних...', true);

            const currentDateRange = (this.dateRange.start && this.dateRange.end)
                ? {
                    start: this.dateRange.start.toISOString(),
                    end: this.dateRange.end.toISOString()
                }
                : null;

            await this.loadData({ bypassCache: true, allowStaleFallback: false });
            this.calculateDateRange(currentDateRange);

            if (this.uiManager && typeof this.uiManager.syncDateRangeUI === 'function') {
                this.uiManager.syncDateRangeUI();
            }

            this.filterAndDisplayData();
            this.saveCurrentState();

            window.dispatchEvent(new CustomEvent('date-range-ready', { detail: { dateRange: this.dateRange } }));
        } catch (error) {
            this.uiManager.showError('Помилка оновлення: ' + error.message);
        } finally {
            if (refreshBtn) {
                refreshBtn.disabled = false;
                refreshBtn.textContent = previousLabel || 'ОНОВИТИ';
            }
            this.isRefreshingData = false;
            this.uiManager.hideLoading();
        }
    }

    applyParsedData(parsedData) {
        this.allData = Array.isArray(parsedData.allData) ? parsedData.allData : [];
        this.parser.allData = this.allData;
        this.parser.pointsWithoutCoords = Number(parsedData.pointsWithoutCoords) || 0;
        this.parser.killedTotalsByYear = parsedData.killedTotalsByYear || {};
    }

    loadParsedDataFromCache({ allowStale = false } = {}) {
        try {
            const raw = localStorage.getItem(this.parsedDataCacheKey);
            if (!raw) return null;

            const parsed = JSON.parse(raw);
            if (!parsed || typeof parsed !== 'object') return null;
            if (!Array.isArray(parsed.allData)) return null;
            if (typeof parsed.cachedAt !== 'number') return null;

            const age = Date.now() - parsed.cachedAt;
            if (!allowStale && age > this.parsedDataCacheTtlMs) {
                return null;
            }

            return {
                allData: parsed.allData,
                pointsWithoutCoords: Number(parsed.pointsWithoutCoords) || 0,
                killedTotalsByYear: parsed.killedTotalsByYear || {},
                cachedAt: parsed.cachedAt
            };
        } catch (error) {
            console.warn('Failed to read parsed cache:', error);
            return null;
        }
    }

    saveParsedDataToCache(data) {
        try {
            const payload = {
                cachedAt: Date.now(),
                allData: Array.isArray(data?.allData) ? data.allData : [],
                pointsWithoutCoords: Number(data?.pointsWithoutCoords) || 0,
                killedTotalsByYear: data?.killedTotalsByYear || {}
            };
            localStorage.setItem(this.parsedDataCacheKey, JSON.stringify(payload));
        } catch (error) {
            console.warn('Failed to save parsed cache:', error);
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
        this.dateRange.max = dates[dates.length - 1];

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

        const yearlyKilledOverride = this.shouldUseYearlyKilledOverride()
            ? this.parser.killedTotalsByYear
            : null;

        this.mapManager.displayMarkers(this.filteredData, this.filters.autoZoom);
        this.uiManager.updatePointsCounter(
            this.filteredData,
            this.allData,
            this.dateRange,
            this.parser.pointsWithoutCoords,
            yearlyKilledOverride
        );
        this.uiManager.updateLegend(this.filteredData, this.allData);
    }

    shouldUseYearlyKilledOverride() {
        if (!this.dateRange.min || !this.dateRange.max || !this.dateRange.start || !this.dateRange.end) {
            return false;
        }

        const isFullDateRange =
            this.dateRange.start.getTime() === this.dateRange.min.getTime() &&
            this.dateRange.end.getTime() === this.dateRange.max.getTime();

        const isDefaultFilters =
            this.filters.weaponType === 'all' &&
            this.filters.timeOfDay === 'all' &&
            this.filters.killed === 0 &&
            this.filters.wounded === 0;

        return isFullDateRange && isDefaultFilters;
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
    const refreshBtn = document.getElementById('refreshDataBtn');
    if (refreshBtn) {
        refreshBtn.addEventListener('click', () => {
            app.refreshDataBypassCache();
        });
    }

    // Listen to mobile date change events and forward to app
    window.addEventListener('mobile-date-change', (e) => {
        const { start, end } = e.detail || {};
        if (start && end) {
            app.onMobileDateChange(start, end);
        }
    });
});
