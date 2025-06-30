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
            position: 'topright'
        }).addTo(this.map);

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

    handleMapViewChange() {
        if (this.onMapViewChange) {
            this.onMapViewChange({
                zoom: this.map.getZoom(),
                center: this.map.getCenter()
            });
        }
    }

    displayMarkers(data) {
        this.markers.forEach(marker => this.map.removeLayer(marker));
        this.markers = [];

        data.forEach(item => {
            const marker = L.marker([item.lat, item.lng], {
                icon: this.createCustomIcon(item)
            }).addTo(this.map);

            const locationText = item.location
                .replace(/^📍\s*/, '')
                .replace(/\S+\s+район(\s*\(Київ\))?,\s*/i, '')
                .replace(/\s*\(Київ\),?/i, '')
                .trim();
            const tooltipContent = `<strong style="color: red;">${item.date}</strong> ${locationText}`;
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

        if (this.markers.length > 0) {
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

    createCustomIcon(item) {
        const { year, killed, wounded, weaponType } = item;
        const color = this.getYearColor(year);
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
        const maxSize = 30;
        
        const casualtiesNum = parseInt(casualties) || 0;
        const woundedNum = parseInt(wounded) || 0;
        const total = casualtiesNum + woundedNum;
        
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