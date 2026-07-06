export class UIManager {
    constructor(onDateRangeChangeCallback, getYearColorCallback, getDateColorCallback, onFilterChangeCallback) {
        this.onDateRangeChange = onDateRangeChangeCallback;
        this.getYearColor = getYearColorCallback;
        this.getDateColor = getDateColorCallback;
        this.onFilterChange = onFilterChangeCallback;

        this.dateRange = null;
        this.isDragging = false;
        this.dragTarget = null;
        this.dragStartX = 0;
        this.dragStartRange = null;

        this.detailsPanel = document.getElementById('detailsPanel');
        const initialPlaceholder = this.detailsPanel?.querySelector('.details-placeholder');
        this.detailsHintText = initialPlaceholder
            ? initialPlaceholder.textContent.trim()
            : 'Клікніть по будь-якій точці для подробиць';
        this.detailsStats = null;
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
        this.renderEmptyDetailsState();
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
        document.getElementById('autoZoomFilter').checked = initialFilters.autoZoom !== false; // Default to true if undefined

        // Add event listeners
        document.getElementById('weaponFilter').addEventListener('click', (e) => this.handleButtonGroupClick(e));
        document.getElementById('timeOfDayFilter').addEventListener('click', (e) => this.handleButtonGroupClick(e));
        document.getElementById('killedFilter').addEventListener('input', () => this.handleFilterChange());
        document.getElementById('woundedFilter').addEventListener('input', () => this.handleFilterChange());
        document.getElementById('autoZoomFilter').addEventListener('change', () => this.handleFilterChange());

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
            wounded: parseInt(document.getElementById('woundedFilter').value, 10) || 0,
            autoZoom: document.getElementById('autoZoomFilter').checked
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

    syncDateRangeUI() {
        if (!this.dateRange || !this.dateRange.min || !this.dateRange.max) return;

        const minDateLabel = document.getElementById('minDateLabel');
        const maxDateLabel = document.getElementById('maxDateLabel');

        if (minDateLabel) minDateLabel.textContent = this.formatDate(this.dateRange.min);
        if (maxDateLabel) maxDateLabel.textContent = this.formatDate(this.dateRange.max);

        this.createYearMarks();
        this.updateDateFilter();
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
            const colorForDate = (dateObj) => {
                if (typeof this.getDateColor === 'function') {
                    return this.getDateColor(dateObj, dateObj.getFullYear());
                }
                return this.getYearColor(dateObj.getFullYear());
            };

            const periodStops = [{
                percent: 0,
                color: colorForDate(this.dateRange.min)
            }];

            for (let year = startYear; year <= endYear; year++) {
                const halfYearBoundaries = [new Date(year, 0, 1), new Date(year, 6, 1)];
                halfYearBoundaries.forEach(boundary => {
                    if (boundary <= this.dateRange.min || boundary >= this.dateRange.max) return;
                    const daysSinceStart = (boundary - this.dateRange.min) / (1000 * 60 * 60 * 24);
                    const percent = (daysSinceStart / totalDays) * 100;
                    periodStops.push({
                        percent,
                        color: colorForDate(boundary)
                    });
                });
            }

            periodStops.push({
                percent: 100,
                color: colorForDate(this.dateRange.max)
            });

            periodStops.sort((a, b) => a.percent - b.percent);

            const uniqueStops = [];
            periodStops.forEach(stop => {
                const last = uniqueStops[uniqueStops.length - 1];
                if (!last || Math.abs(last.percent - stop.percent) > 0.0001) {
                    uniqueStops.push(stop);
                } else {
                    last.color = stop.color;
                }
            });

            const gradientStops = [];
            for (let i = 0; i < uniqueStops.length - 1; i++) {
                const current = uniqueStops[i];
                const next = uniqueStops[i + 1];
                gradientStops.push(
                    `${current.color} ${current.percent}%`,
                    `${current.color} ${next.percent}%`
                );
            }

            trackEl.style.background = `linear-gradient(90deg, ${gradientStops.join(', ')})`;
        }
    }

    updatePointsCounter(filteredData, allData, dateRange, withoutCoords, yearlyKilledOverride = null) {
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

        // Mobile filters summary (bottom bar in Filters card)
        const mobileSummary = document.getElementById('mobileFiltersSummary');
        if (mobileSummary) {
            mobileSummary.textContent = `Відібрано на мапі: ${visibleWithCoords} з ${totalWithCoords}. Дата: ${this.formatDate(dateRange.start)} — ${this.formatDate(dateRange.end)}`;
        }

        this.detailsStats = this.buildDetailsStats(
            filteredData,
            totalWithCoords,
            visibleWithCoords,
            dateRange,
            yearlyKilledOverride
        );
        if (this.detailsPanel && !this.detailsPanel.querySelector('.popup-content')) {
            this.renderEmptyDetailsState();
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
        const detailsPanel = document.getElementById('detailsPanel');
        const filtersPanel = document.getElementById('filtersPanel');
        const infoPanel = document.getElementById('infoPanel');
        const resetZoomBtn = document.getElementById('resetZoomBtn');
        const disclaimer = document.querySelector('.disclaimer');

        function checkScreenSize() {
            if (window.innerWidth < 768) {
                mobileMessage.style.display = 'block';
                map.style.display = 'none';
                dateFilter.style.display = 'none';
                if (detailsPanel) detailsPanel.style.display = 'none';
                if (filtersPanel) filtersPanel.style.display = 'none';
                if (infoPanel) infoPanel.style.display = 'none';
                if (resetZoomBtn) resetZoomBtn.style.display = 'none';
                if (disclaimer) disclaimer.style.display = 'none';
            } else {
                mobileMessage.style.display = 'none';
                map.style.display = 'block';
                dateFilter.style.display = 'block';
                if (detailsPanel) detailsPanel.style.display = 'block';
                if (filtersPanel) filtersPanel.style.display = 'block';
                if (infoPanel) infoPanel.style.display = 'block';
                if (resetZoomBtn) resetZoomBtn.style.display = 'block';
                if (disclaimer) disclaimer.style.display = 'block';
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

    buildDetailsStats(filteredData, totalWithCoords, visibleWithCoords, dateRange, yearlyKilledOverride = null) {
        const weaponCounts = { rocket: 0, drone: 0, other: 0 };
        const timeCounts = { day: 0, night: 0 };
        const yearKilledCounts = {};
        const monthCounts = {};
        let woundedTotal = 0;

        filteredData.forEach(item => {
            const weaponType = item.weaponType === 'rocket' || item.weaponType === 'drone'
                ? item.weaponType
                : 'other';
            weaponCounts[weaponType]++;

            if (item.timeOfDay === 'day' || item.timeOfDay === 'night') {
                timeCounts[item.timeOfDay]++;
            }

            const yearKey = String(item.year || '');
            if (yearKey) {
                yearKilledCounts[yearKey] = (yearKilledCounts[yearKey] || 0) + (Number(item.killed) || 0);
            }

            const dateParts = String(item.date || '').split('-');
            if (dateParts.length === 3) {
                const monthKey = `${dateParts[2]}-${dateParts[1].padStart(2, '0')}`;
                monthCounts[monthKey] = (monthCounts[monthKey] || 0) + 1;
            }

            woundedTotal += Number(item.wounded) || 0;
        });

        if (yearlyKilledOverride && typeof yearlyKilledOverride === 'object') {
            ['2023', '2024', '2025', '2026', '2027'].forEach(year => {
                const value = Number(yearlyKilledOverride[year]);
                if (!Number.isNaN(value) && value >= 0 && yearKilledCounts[year] !== undefined) {
                    yearKilledCounts[year] = value;
                }
            });
        }

        const killedTotal = Object.values(yearKilledCounts).reduce((sum, value) => sum + (Number(value) || 0), 0);

        const weaponItems = [
            { key: 'rocket', label: 'Ракети', color: '#5c7504', count: weaponCounts.rocket },
            { key: 'drone', label: 'Дрони', color: '#820387', count: weaponCounts.drone },
            { key: 'other', label: 'Інше', color: '#c9ced3', count: weaponCounts.other }
        ];
        const weaponTotal = weaponItems.reduce((sum, item) => sum + item.count, 0);
        weaponItems.forEach(item => {
            item.percent = weaponTotal > 0 ? (item.count / weaponTotal) * 100 : 0;
        });

        const timeItems = [
            { key: 'day', label: 'День', color: '#f7b267', count: timeCounts.day },
            { key: 'night', label: 'Ніч', color: '#4d5fb8', count: timeCounts.night }
        ];
        const maxTimeCount = Math.max(...timeItems.map(item => item.count), 0);
        timeItems.forEach(item => {
            item.percentOfMax = maxTimeCount > 0 ? (item.count / maxTimeCount) * 100 : 0;
        });

        const yearEntries = Object.entries(yearKilledCounts).sort((a, b) => Number(a[0]) - Number(b[0]));
        const maxYearCount = yearEntries.length > 0
            ? Math.max(...yearEntries.map(([, count]) => count))
            : 0;
        const yearItems = yearEntries.map(([year, count]) => ({
            year,
            count,
            percentOfMax: maxYearCount > 0 ? (count / maxYearCount) * 100 : 0,
            color: '#111111'
        }));

        const topMonthEntry = Object.entries(monthCounts)
            .sort((a, b) => (b[1] - a[1]) || a[0].localeCompare(b[0]))[0];

        return {
            filteredCount: filteredData.length,
            totalWithCoords,
            visibleWithCoords,
            killedTotal,
            woundedTotal,
            dateStart: this.formatDate(dateRange.start),
            dateEnd: this.formatDate(dateRange.end),
            weaponItems,
            weaponTotal,
            timeItems,
            maxTimeCount,
            yearItems,
            maxYearCount,
            topMonthLabel: topMonthEntry ? this.formatMonthKey(topMonthEntry[0]) : '—',
            topMonthCount: topMonthEntry ? topMonthEntry[1] : 0
        };
    }

    formatMonthKey(monthKey) {
        const [year, month] = String(monthKey).split('-');
        const monthIndex = Number(month) - 1;
        const monthNames = ['січ', 'лют', 'бер', 'квіт', 'трав', 'черв', 'лип', 'серп', 'вер', 'жовт', 'лист', 'груд'];
        if (!year || monthIndex < 0 || monthIndex >= monthNames.length) {
            return '—';
        }
        return `${monthNames[monthIndex]} ${year}`;
    }

    createDetailsEmptyContent(stats) {
        if (!stats) {
            return `<div class="details-empty-state"><div class="details-placeholder">${this.detailsHintText}</div></div>`;
        }

        const weaponSegments = stats.weaponTotal > 0
            ? stats.weaponItems.map(item => `
                <div class="empty-stacked-segment" style="width:${item.percent.toFixed(2)}%;background:${item.color};"></div>
            `).join('')
            : '<div class="empty-stacked-segment empty-stacked-segment-empty"></div>';

        const weaponLegend = stats.weaponItems.map(item => `
            <div class="empty-legend-item">
                <span class="empty-legend-dot" style="background:${item.color};"></span>
                <span>${item.label}: ${item.count}</span>
            </div>
        `).join('');

        const nightItem = stats.timeItems.find(item => item.key === 'night') || { label: 'Ніч', count: 0, color: '#4d5fb8' };
        const dayItem = stats.timeItems.find(item => item.key === 'day') || { label: 'День', count: 0, color: '#f7b267' };
        const totalTimeValue = Math.max(nightItem.count + dayItem.count, 1);
        const nightWidth = (nightItem.count / totalTimeValue) * 100;
        const dayWidth = (dayItem.count / totalTimeValue) * 100;
        const timeInline = `
            <div class="empty-time-inline">
                <div class="empty-time-head">
                    <span>${nightItem.label}</span>
                    <span>${dayItem.label}</span>
                </div>
                <div class="empty-time-joined">
                    <div class="empty-time-fill empty-time-fill-night" style="width:${nightWidth.toFixed(2)}%;background:${nightItem.color};"></div>
                    <div class="empty-time-fill empty-time-fill-day" style="width:${dayWidth.toFixed(2)}%;background:${dayItem.color};"></div>
                </div>
                <div class="empty-time-values">
                    <span>${nightItem.count}</span>
                    <span>${dayItem.count}</span>
                </div>
            </div>
        `;

        const yearRows = stats.yearItems.length > 0
            ? stats.yearItems.map(item => `
                <div class="empty-bar-row">
                    <div class="empty-bar-header">
                        <span>${item.year}</span>
                        <span>${item.count}</span>
                    </div>
                    <div class="empty-bar-track">
                        <div class="empty-bar-fill" style="width:${item.percentOfMax.toFixed(2)}%;background:${item.color};"></div>
                    </div>
                </div>
            `).join('')
            : '<div class="empty-note">Немає даних про загиблих.</div>';

        const noDataNote = stats.filteredCount === 0
            ? '<div class="empty-note">За поточними фільтрами немає точок.</div>'
            : '';

        return `
            <div class="details-empty-state">
                <div class="details-placeholder">${this.detailsHintText}</div>
                <div class="details-empty-content">
                    ${noDataNote}
                    <div class="empty-stat-grid">
                        <div class="empty-stat-card">
                            <div class="empty-stat-label">Пік за місяць</div>
                            <div class="empty-stat-value">${stats.topMonthLabel}</div>
                            <div class="empty-stat-subvalue">${stats.topMonthCount > 0 ? `${stats.topMonthCount} атак` : '—'}</div>
                        </div>
                        <div class="empty-stat-card empty-stat-card-dates">
                            <div class="empty-stat-label">Дати</div>
                            <div class="empty-stat-value">${stats.dateStart} — ${stats.dateEnd}</div>
                        </div>
                        <div class="empty-stat-card">
                            <div class="empty-stat-label">Загиблі*</div>
                            <div class="empty-stat-value">${stats.killedTotal}</div>
                        </div>
                        <div class="empty-stat-card">
                            <div class="empty-stat-label">Поранені*</div>
                            <div class="empty-stat-value">${stats.woundedTotal}</div>
                        </div>
                    </div>
                    <div class="empty-chart-block">
                        <div class="empty-chart-title">Загиблі &nbsp;&nbsp;&nbsp; (* ці цифри приблизні)</div>
                        ${yearRows}
                    </div>
                    <div class="empty-section-divider"></div>
                    <div class="empty-chart-block">
                        <div class="empty-chart-title">Структура за типом зброї</div>
                        <div class="empty-stacked-bar">${weaponSegments}</div>
                        <div class="empty-legend">${weaponLegend}</div>
                    </div>
                    <div class="empty-chart-block">
                        <div class="empty-chart-title">Розподіл за часом доби</div>
                        ${timeInline}
                    </div>
                </div>
            </div>
        `;
    }

    renderEmptyDetailsState() {
        if (!this.detailsPanel) return;
        this.detailsPanel.innerHTML = this.createDetailsEmptyContent(this.detailsStats);
    }

    showDetails(item) {
        if (this.detailsPanel) {
            this.detailsPanel.innerHTML = this.createDetailsContent(item);

            // Reveal the zoom icon only after the corresponding image has fully loaded
            this.detailsPanel.querySelectorAll('.popup-image').forEach(img => {
                const revealIcon = () => {
                    if (img.naturalWidth > 0) {
                        img.classList.add('loaded');
                    }
                };
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
        this.renderEmptyDetailsState();
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
        const isTouch = () => window.matchMedia('(max-width: 767px)').matches;

        this.detailsPanel.addEventListener('mouseover', (event) => {
            if (isTouch()) return; // disable hover preview on mobile
            if (event.target.classList.contains('popup-image')) {
                this.showImagePreview(event.target.src);
            }
        });

        this.detailsPanel.addEventListener('mouseout', (event) => {
            if (isTouch()) return; // disable hover preview on mobile
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
