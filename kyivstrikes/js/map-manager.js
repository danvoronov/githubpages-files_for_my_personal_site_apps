export class MapManager {
    constructor(mapId, onMapViewChange) {
        this.map = null;
        this.markers = [];
        this.onMapViewChange = onMapViewChange;
        this.uiManager = null;
    }

    setUIManager(uiManager) {
        this.uiManager = uiManager;
    }

    initMap(mapId, initialMapState) {
        this.map = L.map(mapId, {
            zoomControl: false
        }).setView(initialMapState.center, initialMapState.zoom);

        L.control.zoom({
            position: 'bottomleft'
        }).addTo(this.map);

        // Add locate control for mobile (bottom right)
        const isMobile = () => window.matchMedia('(max-width: 767px)').matches;
        if (isMobile()) {
            const locateControl = L.control.locate({
                position: 'bottomright',
                strings: {
                    title: "Моя позиція"
                },
                flyTo: true,
                cacheLocation: true,
                setView: 'untilPanOrZoom',
                keepCurrentZoomLevel: false,
                locateOptions: {
                    enableHighAccuracy: true,
                    timeout: 10000,
                    maximumAge: 300000
                }
            }).addTo(this.map);
        }

        L.tileLayer('https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png', {
            attribution: '© <a href="https://danvoronov.com" target="_blank">Дан Воронов</a>, 2025',
            maxZoom: 18,
            subdomains: 'abcd'
        }).addTo(this.map);
        
        L.tileLayer('https://{s}.basemaps.cartocdn.com/light_only_labels/{z}/{x}/{y}{r}.png', {
            attribution: '',
            maxZoom: 18,
            subdomains: 'abcd',
            pane: 'shadowPane'
        }).addTo(this.map);

        const resetZoomBtn = document.getElementById('resetZoomBtn');
        if (resetZoomBtn) {
            resetZoomBtn.addEventListener('click', () => {
                this.map.setView([50.4501, 30.5234], 11);
            });
        }

        this.positionResetZoomButton();
        window.addEventListener('resize', () => this.positionResetZoomButton());


        this.map.on('click', () => {
            if (this.uiManager) {
                this.uiManager.clearDetails();
            }
        });

        this.map.on('dragstart', () => {
            if (this.uiManager) {
                this.uiManager.clearDetails();
            }
        });

        this.map.on('zoomend', () => this.handleMapViewChange());
        this.map.on('moveend', () => this.handleMapViewChange());
    }

    positionResetZoomButton() {
        const resetZoomBtn = document.getElementById('resetZoomBtn');
        const filtersPanel = document.getElementById('filtersPanel');
        if (!resetZoomBtn || !filtersPanel) return;

        const panelRect = filtersPanel.getBoundingClientRect();
        resetZoomBtn.style.left = `${Math.round(panelRect.left)}px`;
        resetZoomBtn.style.top = `${Math.round(panelRect.bottom + 8)}px`;
    }

    handleMapViewChange() {
        if (this.onMapViewChange) {
            this.onMapViewChange({
                zoom: this.map.getZoom(),
                center: this.map.getCenter()
            });
        }
    }

    displayMarkers(data, autoZoom = true) {
        this.markers.forEach(marker => this.map.removeLayer(marker));
        this.markers = [];

        data.forEach(item => {
            const marker = L.marker([item.lat, item.lng], {
                icon: this.createCustomIcon(item)
            }).addTo(this.map);

            const locationText = item.location
                .replace(/^📍\s*/, '')
                // Remove leading district prefix like "Солом'янський район, ..." or "Солом'янський р-н, ..."
                .replace(/^\s*.*?(?:район|р[\s\-‑–—]?н)(?:\s*\(Київ\))?\s*[,;:—–-]?\s*/i, '')
                .replace(/\s*\(Київ\),?/i, '')
                .trim();
            const tooltipContent = `<strong class="map-tooltip-date">${item.date}</strong> ${locationText}`;
            marker.bindTooltip(tooltipContent, { direction: 'top', offset: [0, -15] });

            marker.on('click', () => {
                if (this.uiManager) {
                    this.uiManager.showDetails(item);
                }
                
                // Center and zoom in when the map is at the default overview level
                const currentZoom = this.map.getZoom();
                if (currentZoom === 11) {
                    const targetZoom = Math.min(currentZoom + 3, 18);
                    this.map.flyTo([item.lat, item.lng], targetZoom, { duration: 0.5 });
                }
            });

            this.markers.push(marker);
        });

        // Auto-zoom to fit all markers only if autoZoom is enabled
        if (autoZoom && this.markers.length > 0) {
            const group = new L.featureGroup(this.markers);
            this.map.fitBounds(group.getBounds().pad(0.1));
        }
    }

    getYearColor(year) {
        const colors = {
            '2022': '#FFD9D9',
            '2023': '#FFC0C0',
            '2024': '#FF9999',
            '2025': '#FF6666',
            '2026': '#D00000',
            '2027': '#8B0000'
        };
        return colors[year] || '#6c757d';
    }

    getHalfYearColor(year, half) {
        const palette = {
            '2022-H1': '#FFEAEA',
            '2022-H2': '#FFD9D9',
            '2023-H1': '#FFD2D2',
            '2023-H2': '#FFC0C0',
            '2024-H1': '#FFB3B3',
            '2024-H2': '#FF9999',
            '2025-H1': '#FF8080',
            '2025-H2': '#FF6666',
            '2026-H1': '#F25F5F',
            '2026-H2': '#D00000',
            '2027-H1': '#A31616',
            '2027-H2': '#8B0000'
        };

        return palette[`${year}-${half}`] || this.getYearColor(year);
    }

    getDateColor(dateValue, fallbackYear) {
        if (dateValue instanceof Date && !Number.isNaN(dateValue.getTime())) {
            const year = String(dateValue.getFullYear());
            const month = dateValue.getMonth() + 1;
            const half = month <= 6 ? 'H1' : 'H2';
            return this.getHalfYearColor(year, half);
        }

        const parts = typeof dateValue === 'string' ? dateValue.split('-') : [];
        if (parts.length === 3) {
            const day = parseInt(parts[0], 10);
            const month = parseInt(parts[1], 10);
            const year = String(parseInt(parts[2], 10));

            if (!Number.isNaN(day) && !Number.isNaN(month) && year !== 'NaN') {
                const half = month <= 6 ? 'H1' : 'H2';
                return this.getHalfYearColor(year, half);
            }
        }

        const year = String(fallbackYear || '');
        if (year) {
            return this.getHalfYearColor(year, 'H2');
        }

        return '#6c757d';
    }

    createCustomIcon(item) {
        const { year, killed, wounded, weaponType, date } = item;
        const color = this.getDateColor(date, year);
        const size = this.calculateMarkerSize(killed, wounded);
        
        let iconContent = '';
        
        if (weaponType === 'rocket') {
            const iconSize = Math.max(12, Math.round(size * 0.8));
            iconContent = `
                <div style="
                    background: ${color}; 
                    width: ${size}px; 
                    height: ${size}px; 
                    border-radius: 50%; 
                    box-shadow: 0 2px 8px rgba(0,0,0,0.4);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    position: relative;
                ">
                    <img src="img/rocket.png" style="
                        width: ${iconSize}px;
                        height: ${iconSize}px;
                        filter: drop-shadow(0 1px 2px rgba(0,0,0,0.3));
                    ">
                </div>
            `;
        } else {
            iconContent = `<div style="background: ${color}; width: ${size}px; height: ${size}px; border-radius: 50%; box-shadow: 0 2px 8px rgba(0,0,0,0.4);"></div>`;
        }
        
        return L.divIcon({
            className: 'custom-marker',
            html: iconContent,
            iconSize: [size, size],
            iconAnchor: [size / 2, size / 2]
        });
    }

    calculateMarkerSize(casualties, wounded) {
        const baseSize = 14;
        const minSize = 10;
        const maxSize = 35;
        
        const casualtiesNum = parseInt(casualties) || 0;
        const woundedNum = parseInt(wounded) || 0;
        const total = casualtiesNum*1.5 + woundedNum;
        
        if (total === 0) {
            return baseSize;
        }
        
        let size;
        if (total <= 5) {
            size = baseSize + total * 2;
        } else if (total <= 20) {
            size = baseSize + 10 + (total - 5) * 1;
        } else {
            size = baseSize + 25 + Math.log(total - 20) * 3;
        }
        
        const finalSize = Math.max(minSize, Math.min(maxSize, Math.round(size)));
        
        return finalSize;
    }

}
