export class UIManager {
    constructor(onDateRangeChangeCallback, getYearColorCallback, onFilterChangeCallback) {
        this.onDateRangeChange = onDateRangeChangeCallback;
        this.getYearColor = getYearColorCallback;
        this.onFilterChange = onFilterChangeCallback;

        this.dateRange = null;
        this.isDragging = false;
        this.dragTarget = null;
        this.dragStartX = 0;
        this.dragStartRange = null;

        this.detailsPanel = document.getElementById('detailsPanel');
        this.detailsPlaceholder = this.detailsPanel.innerHTML;
        this.imagePreviewOverlay = null;
        this.startDateTooltip = document.getElementById('startHandleTooltip');
        this.endDateTooltip = document.getElementById('endHandleTooltip');
    }

    init(dateRange, initialFilters) {
        this.dateRange = dateRange;
        this.initDateFilter();
        this.initFilters(initialFilters);
        this.initResponsiveChecks();
        this.initImagePreview();
        this.hideLoading();
    }

    initFilters(initialFilters) {
        // Deactivate all buttons first
        document.querySelectorAll('#weaponFilter button').forEach(btn => btn.classList.remove('active'));
        document.querySelectorAll('#timeOfDayFilter button').forEach(btn => btn.classList.remove('active'));

        // Set initial values
        document.querySelector(`#weaponFilter button[value="${initialFilters.weaponType}"]`).classList.add('active');
        document.querySelector(`#timeOfDayFilter button[value="${initialFilters.timeOfDay}"]`).classList.add('active');
        document.getElementById('killedFilter').value = initialFilters.killed;
        document.getElementById('woundedFilter').value = initialFilters.wounded;

        // Add event listeners
        document.getElementById('weaponFilter').addEventListener('click', (e) => this.handleButtonGroupClick(e));
        document.getElementById('timeOfDayFilter').addEventListener('click', (e) => this.handleButtonGroupClick(e));
        document.getElementById('killedFilter').addEventListener('input', () => this.handleFilterChange());
        document.getElementById('woundedFilter').addEventListener('input', () => this.handleFilterChange());

        document.querySelectorAll('.reset-btn').forEach(button => {
            button.addEventListener('click', (e) => this.handleResetClick(e));
        });
    }

    handleButtonGroupClick(event) {
        const button = event.target.closest('button');
        if (button) {
            const group = button.parentElement;
            group.querySelectorAll('button').forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            this.handleFilterChange();
        }
    }

    handleFilterChange() {
        const filters = {
            weaponType: document.querySelector('#weaponFilter .active').value,
            timeOfDay: document.querySelector('#timeOfDayFilter .active').value,
            killed: parseInt(document.getElementById('killedFilter').value, 10) || 0,
            wounded: parseInt(document.getElementById('woundedFilter').value, 10) || 0
        };
        this.onFilterChange(filters);
    }

    handleResetClick(event) {
        const targetInputId = event.currentTarget.dataset.target;
        const inputElement = document.getElementById(targetInputId);
        if (inputElement) {
            inputElement.value = 0;
            this.handleFilterChange();
        }
    }

    initDateFilter() {
        if (!this.dateRange.min || !this.dateRange.max) return;

        const container = document.querySelector('.date-range-container');
        const selectedRange = document.getElementById('selectedRange');
        const startHandle = document.getElementById('startHandle');
        const endHandle = document.getElementById('endHandle');

        const minDateLabel = document.getElementById('minDateLabel');
        const maxDateLabel = document.getElementById('maxDateLabel');

        minDateLabel.textContent = this.formatDate(this.dateRange.min);
        maxDateLabel.textContent = this.formatDate(this.dateRange.max);

        // Клик по левой метке — сброс в начало
        minDateLabel.addEventListener('click', () => {
            if (this.dateRange.start.getTime() !== this.dateRange.min.getTime()) {
                this.dateRange.start = new Date(this.dateRange.min.getTime());
                this.updateDateFilter();
                this.onDateRangeChange(this.dateRange.start, this.dateRange.end);
            }
        });

        // Клик по правой метке — сброс в конец
        maxDateLabel.addEventListener('click', () => {
            if (this.dateRange.end.getTime() !== this.dateRange.max.getTime()) {
                this.dateRange.end = new Date(this.dateRange.max.getTime());
                this.updateDateFilter();
                this.onDateRangeChange(this.dateRange.start, this.dateRange.end);
            }
        });

        this.updateDateFilter();
        this.createYearMarks();

        startHandle.addEventListener('mousedown', (e) => this.startDrag(e, 'start'));
        endHandle.addEventListener('mousedown', (e) => this.startDrag(e, 'end'));
        selectedRange.addEventListener('mousedown', (e) => this.startDrag(e, 'range'));

        document.addEventListener('mousemove', (e) => this.onDragCorrect(e));
        document.addEventListener('mouseup', () => this.endDrag());

        container.addEventListener('selectstart', (e) => e.preventDefault());

        // Обновляем положение ползунков и длину выбранного диапазона при изменении розміру вікна
        window.addEventListener('resize', () => this.updateDateFilter());
    }

    startDrag(e, target) {
        e.preventDefault();
        this.isDragging = true;
        this.dragTarget = target;
        this.dragStartX = e.clientX;
        this.dragStartRange = { start: this.dateRange.start, end: this.dateRange.end };

        if (target === 'start') {
            document.getElementById('startHandle').classList.add('dragging');
        } else if (target === 'end') {
            document.getElementById('endHandle').classList.add('dragging');
        } else if (target === 'range') {
            document.getElementById('startHandle').classList.add('dragging');
            document.getElementById('endHandle').classList.add('dragging');
        }
    }

    onDragCorrect(e) {
        if (!this.isDragging) return;

        const container = document.querySelector('.date-range-container');
        const rect = container.getBoundingClientRect();
        const trackWidth = rect.width - 60;
        const trackLeft = rect.left + 30;

        if (this.dragTarget === 'start' || this.dragTarget === 'end') {
            const mouseX = e.clientX - trackLeft;
            const percent = Math.max(0, Math.min(1, mouseX / trackWidth));
            const totalTime = this.dateRange.max.getTime() - this.dateRange.min.getTime();

            if (this.dragTarget === 'start') {
                let newStartTime = this.dateRange.min.getTime() + (percent * totalTime);
                newStartTime = Math.max(this.dateRange.min.getTime(), newStartTime);
                newStartTime = Math.min(newStartTime, this.dateRange.end.getTime() - 86400000); // 1 day before end
                this.dateRange.start = new Date(newStartTime);
            } else { // 'end'
                let newEndTime = this.dateRange.min.getTime() + (percent * totalTime);
                newEndTime = Math.min(this.dateRange.max.getTime(), newEndTime);
                newEndTime = Math.max(newEndTime, this.dateRange.start.getTime() + 86400000); // 1 day after start
                this.dateRange.end = new Date(newEndTime);
            }
        } else if (this.dragTarget === 'range') {
            const deltaX = e.clientX - this.dragStartX;
            const deltaPercent = deltaX / trackWidth;
            const totalDays = (this.dateRange.max - this.dateRange.min) / (1000 * 60 * 60 * 24);
            const deltaDays = deltaPercent * totalDays;

            const rangeDuration = this.dragStartRange.end - this.dragStartRange.start;
            const newStart = new Date(this.dragStartRange.start.getTime() + deltaDays * 24 * 60 * 60 * 1000);
            
            if (newStart.getTime() < this.dateRange.min.getTime()) {
                newStart.setTime(this.dateRange.min.getTime());
            }

            const newEnd = new Date(newStart.getTime() + rangeDuration);
            if (newEnd.getTime() > this.dateRange.max.getTime()) {
                newEnd.setTime(this.dateRange.max.getTime());
                newStart.setTime(newEnd.getTime() - rangeDuration);
            }

            this.dateRange.start = newStart;
            this.dateRange.end = newEnd;
        }

        this.updateDateFilter();
    }

    endDrag() {
        if (!this.isDragging) return;
        this.isDragging = false;
        this.dragTarget = null;
        document.getElementById('startHandle').classList.remove('dragging');
        document.getElementById('endHandle').classList.remove('dragging');
        
        this.onDateRangeChange(this.dateRange.start, this.dateRange.end);
    }

    updateDateFilter() {
        const totalDays = (this.dateRange.max - this.dateRange.min) / (1000 * 60 * 60 * 24);
        const startDays = (this.dateRange.start - this.dateRange.min) / (1000 * 60 * 60 * 24);
        const endDays = (this.dateRange.end - this.dateRange.min) / (1000 * 60 * 60 * 24);

        const startPercent = (startDays / totalDays) * 100;
        const endPercent = (endDays / totalDays) * 100;

        document.getElementById('selectedRange').style.left = startPercent + '%';
        document.getElementById('selectedRange').style.width = (endPercent - startPercent) + '%';
        
        const trackOffset = 30;
        const containerWidth = document.querySelector('.date-range-container').offsetWidth;
        const trackWidth = containerWidth - 60;
        
        const startPos = trackOffset + (startPercent / 100) * trackWidth;
        const endPos = trackOffset + (endPercent / 100) * trackWidth;
        
        document.getElementById('startHandle').style.left = startPos + 'px';
        document.getElementById('endHandle').style.left = endPos + 'px';

        this.startDateTooltip.textContent = this.formatDate(this.dateRange.start);
        this.endDateTooltip.textContent = this.formatDate(this.dateRange.end);
    }

    createYearMarks() {
        const yearMarksContainer = document.getElementById('yearMarks');
        if (!yearMarksContainer || !this.dateRange.min || !this.dateRange.max) return;

        yearMarksContainer.innerHTML = '';
        const startYear = this.dateRange.min.getFullYear();
        const endYear = this.dateRange.max.getFullYear();
        const totalDays = (this.dateRange.max - this.dateRange.min) / (1000 * 60 * 60 * 24);

        for (let year = startYear; year <= endYear; year++) {
            const yearStart = new Date(year, 0, 1);
            if (yearStart >= this.dateRange.min && yearStart <= this.dateRange.max) {
                const daysSinceStart = (yearStart - this.dateRange.min) / (1000 * 60 * 60 * 24);
                const percent = (daysSinceStart / totalDays) * 100;

                const mark = document.createElement('div');
                mark.className = 'year-mark';
                mark.style.left = percent + '%';
                yearMarksContainer.appendChild(mark);

                const label = document.createElement('div');
                label.className = 'year-label';
                label.style.left = percent + '%';
                label.textContent = year;
                yearMarksContainer.appendChild(label);
            }

            // Подсечки внутри года с равным шагом 1/5 года. Для последнего (неполного) года выводятся только те, что помещаются.
            const nextYearStart = new Date(year + 1, 0, 1);
            const fullYearMs = nextYearStart - yearStart; // длительность полного года
            const segmentMs = fullYearMs / 4;             // шаг 25 % года

            for (let i = 1; i <= 3; i++) {
                const subTime = yearStart.getTime() + segmentMs * i;
                if (subTime > this.dateRange.max.getTime()) break; // не рисуем, если вышли за диапазон

                const daysSinceStartSub = (subTime - this.dateRange.min.getTime()) / (1000 * 60 * 60 * 24);
                const percentSub = (daysSinceStartSub / totalDays) * 100;

                if (percentSub >= 0 && percentSub <= 100) {
                    const subMark = document.createElement('div');
                    subMark.className = 'year-submark';
                    subMark.style.left = percentSub + '%';
                    yearMarksContainer.appendChild(subMark);
                }
            }
        }

        const trackEl = document.querySelector('.date-range-track');
        if (trackEl) {
            const yearStops = [];
            const firstYear = this.dateRange.min.getFullYear();
            yearStops.push({ year: firstYear, percent: 0 });
            for (let year = startYear; year <= endYear; year++) {
                const yearStart = new Date(year, 0, 1);
                if (yearStart >= this.dateRange.min && yearStart <= this.dateRange.max) {
                    const daysSinceStart = (yearStart - this.dateRange.min) / (1000 * 60 * 60 * 24);
                    const percent = (daysSinceStart / totalDays) * 100;
                    yearStops.push({ year, percent });
                }
            }
            yearStops.sort((a, b) => a.percent - b.percent);
            if (yearStops.length) {
                yearStops.push({ year: yearStops[yearStops.length - 1].year, percent: 100 });
            }
            const gradientStops = [];
            for (let i = 0; i < yearStops.length - 1; i++) {
                const current = yearStops[i];
                const next = yearStops[i + 1];
                const color = this.getYearColor(current.year);
                gradientStops.push(`${color} ${current.percent}%`, `${color} ${next.percent}%`);
            }
            trackEl.style.background = `linear-gradient(90deg, ${gradientStops.join(', ')})`;
        }
    }

    updatePointsCounter(filteredData, allData, dateRange, withoutCoords) {
        const totalPoints = allData.length;
        const hardcodedBounds = {
            minLat: 50.2,
            maxLat: 50.7,
            minLng: 30.2,
            maxLng: 30.8
        };

        const dataWithCoordsInBounds = allData.filter(item => 
            item.lat && item.lng &&
            item.lat >= hardcodedBounds.minLat && item.lat <= hardcodedBounds.maxLat &&
            item.lng >= hardcodedBounds.minLng && item.lng <= hardcodedBounds.maxLng
        );
        const totalWithCoords = dataWithCoordsInBounds.length;
        
        const visibleWithCoords = filteredData.filter(item => 
            item.lat && item.lng &&
            item.lat >= hardcodedBounds.minLat && item.lat <= hardcodedBounds.maxLat &&
            item.lng >= hardcodedBounds.minLng && item.lng <= hardcodedBounds.maxLng
        ).length;
        
        const infoTitle = document.getElementById('infoTitle');
        const infoDetails = document.getElementById('infoDetails');
        
        if (infoTitle && infoDetails) {
            infoTitle.textContent = `На мапі ${visibleWithCoords} з ${totalWithCoords} точок`;
            if (withoutCoords > 0) {
                infoTitle.title = `Не враховано ${withoutCoords} записів через відсутність координат.`;
            } else {
                infoTitle.title = 'Всі записи з даних мають координати.';
            }

            infoDetails.innerHTML = `${this.formatDate(dateRange.start)} — ${this.formatDate(dateRange.end)}
            `;
        }
        
        const counterElement = document.getElementById('pointsCounter');
        if (counterElement) {
            counterElement.textContent = `Діапазон дат`;
        }
    }

    updateLegend(filteredData, allData) {
        const legendItems = document.getElementById('legendItems');
        if (!legendItems) return;

        legendItems.innerHTML = '';
        const years = [...new Set(filteredData.map(item => item.year))].sort();

        years.forEach(year => {
            const color = this.getYearColor(year);
            const totalCount = allData.filter(item => item.year === year).length;
            const visibleCount = filteredData.filter(item => item.year === year).length;
            
            const legendItem = document.createElement('div');
            legendItem.className = 'legend-item';
            
            legendItem.innerHTML = `
                <div class="legend-color" style="background: ${color};"></div>
                <div class="legend-label">${year} (${visibleCount}/${totalCount})</div>
            `;
            
            legendItems.appendChild(legendItem);
        });
    }

    showError(message) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.textContent = message;
        document.body.appendChild(errorDiv);

        setTimeout(() => {
            if (errorDiv.parentNode) {
                errorDiv.parentNode.removeChild(errorDiv);
            }
        }, 5000);
    }

    hideLoading() {
        const loading = document.getElementById('loading');
        if (loading) {
            loading.style.display = 'none';
        }
    }

    initResponsiveChecks() {
        const mobileMessage = document.getElementById('mobileMessage');
        const map = document.getElementById('map');
        const dateFilter = document.querySelector('.date-filter');

        function checkScreenSize() {
            if (window.innerWidth < 768) {
                mobileMessage.style.display = 'block';
                map.style.display = 'none';
                dateFilter.style.display = 'none';
            } else {
                mobileMessage.style.display = 'none';
                map.style.display = 'block';
                dateFilter.style.display = 'block';
            }
        }

        checkScreenSize();
        window.addEventListener('resize', checkScreenSize);
    }

    formatDate(date) {
        if (!date) return '';
        const day = date.getDate().toString().padStart(2, '0');
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const year = date.getFullYear();
        return `${day}-${month}-${year}`;
    }

    showDetails(item) {
        if (this.detailsPanel) {
            this.detailsPanel.innerHTML = this.createDetailsContent(item);

            // Reveal the zoom icon only after the corresponding image has fully loaded
            this.detailsPanel.querySelectorAll('.popup-image').forEach(img => {
                const revealIcon = () => img.classList.add('loaded');
                if (img.complete) {
                    // The image was pulled from cache and has already completed loading
                    revealIcon();
                } else {
                    // Wait for the load event if the image is still loading
                    img.addEventListener('load', revealIcon, { once: true });
                }
            });
        }
    }

    clearDetails() {
        if (this.detailsPanel) {
            this.detailsPanel.innerHTML = this.detailsPlaceholder;
        }
    }

    createDetailsContent(item) {
        let timeHtml = '';
        if (item.time) {
            const timePrefix = item.time.includes('—') || item.time.includes('~') ? '' : '~';
            timeHtml = ` <span class="popup-time">${timePrefix}${item.time}</span>`;
        }

        let content = `
            <div class="popup-content">
                <div class="popup-date">${item.date}${timeHtml}</div>
                <div class="popup-location">📍 ${item.location}</div>
        `;

        if (item.weapon) {
            content += `<div class="popup-weapon"><strong>Зброя:</strong> ${item.weapon}</div>`;
        }
        
        if (item.killed > 0 || item.killedIsIncomplete) {
            let note = '';
            if (item.killedIsSplit) {
                note = ' (неточно, дані розділено)';
            } else if (item.killedIsIncomplete) {
                note = ' (дані неповні)';
            }
            const killedText = (item.killed === 0 && item.killedIsIncomplete) ? 'невідомо' : item.killed;
            content += `<div class="popup-casualties"><strong>Загиблі:</strong> ${killedText}${note}</div>`;
        }
        
        if (item.wounded > 0 || item.woundedIsIncomplete) {
            let note = '';
            if (item.woundedIsSplit) {
                note = ' (неточно, дані розділено)';
            } else if (item.woundedIsIncomplete) {
                note = ' (дані неповні)';
            }
            const woundedText = (item.wounded === 0 && item.woundedIsIncomplete) ? 'невідомо' : item.wounded;
            content += `<div class="popup-wounded"><strong>Поранені:</strong> ${woundedText}${note}</div>`;
        }

        if (item.damage) {
            content += `<div class="popup-damage"><strong>Збитки:</strong> ${item.damage}</div>`;
        }
        if (item.images && item.images.length > 0) {
            item.images.forEach(url => {
                content += `<div class="popup-image-wrapper"><img src="${url}" alt="Фото" class="popup-image" onerror="this.style.display='none'"><span class="image-zoom-icon">👁️</span></div>`;
            });
        } else if (item.image) {
            content += `<div class="popup-image-wrapper"><img src="${item.image}" alt="Фото" class="popup-image" onerror="this.style.display='none'"><span class="image-zoom-icon">👁️</span></div>`;
        }

        content += '</div>';
        return content;
    }

    initImagePreview() {
        this.detailsPanel.addEventListener('mouseover', (event) => {
            if (event.target.classList.contains('popup-image')) {
                this.showImagePreview(event.target.src);
            }
        });

        this.detailsPanel.addEventListener('mouseout', (event) => {
            if (event.target.classList.contains('popup-image')) {
                this.hideImagePreview();
            }
        });
    }

    showImagePreview(src) {
        if (this.imagePreviewOverlay) {
            this.hideImagePreview();
        }

        this.imagePreviewOverlay = document.createElement('div');
        this.imagePreviewOverlay.className = 'image-preview-overlay';
        
        const img = document.createElement('img');
        img.src = src;
        
        this.imagePreviewOverlay.appendChild(img);
        document.body.appendChild(this.imagePreviewOverlay);

        // Trigger fade-in on next frame
        requestAnimationFrame(() => {
            this.imagePreviewOverlay.classList.add('visible');
        });
    }

    hideImagePreview() {
        if (this.imagePreviewOverlay) {
            const overlay = this.imagePreviewOverlay;
            overlay.classList.remove('visible');
            // Wait for transition then remove
            overlay.addEventListener('transitionend', () => {
                if (overlay.parentNode) {
                    overlay.parentNode.removeChild(overlay);
                }
            }, { once: true });
            this.imagePreviewOverlay = null;
        }
    }
} 