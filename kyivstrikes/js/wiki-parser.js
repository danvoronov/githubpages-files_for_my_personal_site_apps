export class WikiParser {
    constructor() {
        this.allData = [];
        this.rowspanState = {};
        this.pointsWithoutCoords = 0;
    }

    parse(content) {
        
        this.allData = [];
        this.pointsWithoutCoords = 0;
        
        const years = ['2022', '2023', '2024', '2025', '2026'];
        
        years.forEach(year => {
            this.parseYearSection(content, year);
        });

        this.allData = this.deduplicateData(this.allData);
        
        const dataWithCoords = this.allData.filter(item => item.lat && item.lng);

        const withoutCoords = this.allData.length - dataWithCoords.length;
        this.pointsWithoutCoords = withoutCoords;

        if (withoutCoords > 0) {
            console.log(`[WikiParser] Parsed ${this.allData.length} total events. Hiding ${withoutCoords} without coordinates.`);
        }
        
        return dataWithCoords;
    }

    parseYearSection(content, year) {
        const searchPhrase = `Список обстрілів Києва у ${year} році:`;
        const startIndex = content.indexOf(searchPhrase);
        
        if (startIndex === -1) {
            return;
        }
        
        
        let endIndex = content.length;
        for (let nextYear = parseInt(year) + 1; nextYear <= 2030; nextYear++) {
            const nextPhrase = `Список обстрілів Києва у ${nextYear} році:`;
            const nextIndex = content.indexOf(nextPhrase, startIndex + 1);
            if (nextIndex !== -1) {
                endIndex = nextIndex;
                break;
            }
        }
        
        const sectionContent = content.substring(startIndex, endIndex);
        
        this.parseTablesInSection(sectionContent, year);
    }

    parseTablesInSection(sectionContent, year) {
        const lines = sectionContent.split('\n');
        let inTable = false;
        let currentRowNumber = 0;
        let expectedCount = this.getExpectedCount(year);
        let skipNextDataRow = false;
        
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();
            
            if (line.startsWith('|-')) {
                if (line.includes('style="display:none"')) {
                    skipNextDataRow = true;
                } else {
                    skipNextDataRow = false;
                }
                continue;
            }
            
            if (!inTable && line.includes('Дата та час') && line.includes('Місце атаки')) {
                inTable = true;
                currentRowNumber = 0;
                this.rowspanState = {};
                continue;
            }

            if (!inTable) continue;
            
            if (line === '|}') {
                inTable = false;
                continue;
            }
            
            if (line === '' || line.startsWith('!')) {
                continue;
            }
            
            if (line.startsWith('|') && this.isNumberedRow(line)) {
                if (skipNextDataRow) {
                    skipNextDataRow = false;
                    continue;
                }
                currentRowNumber++;

                const rowLines = [line];
                let j = i + 1;
                while (j < lines.length) {
                    const nxt = lines[j].trim();
                    if (nxt.startsWith('|-') || nxt === '|}') {
                        break;
                    }
                    if (nxt.startsWith('|')) {
                        rowLines.push(nxt);
                    }
                    j++;
                }

                const combinedLine = '|' + rowLines
                    .map(l => l.substring(1).trim())
                    .join('||');

                i = j - 1;

                const data = this.parseNumberedRowNew(combinedLine, year, currentRowNumber);
                if (!data) {
                    console.warn('[WikiParser] Не удалось распарсить строку', {
                        year,
                        rowNumber: currentRowNumber,
                        combinedLine
                    });
                } else {
                    // console.debug('[WikiParser] Parsed row', data);
                    this.allData.push(data);
                }

                if (expectedCount > 0 && currentRowNumber >= expectedCount) {
                    inTable = false;
                    continue;
                }
            }
        }
        
    }

    getExpectedCount(year) {
        return 0;
    }

    isNumberedRow(line) {
        const trimmed = line.trim();
        const patterns = [
            /^\|\s*\d+\s*$/,
            /^\|\s*\d+\s*\|\|/,
            /^\|\d+\|\|/,
            /^\|\s*\d+\s*\|/,
            /^\|\d+\|/,
            /^\|\s*\d+\s/,
            /^\|\d+\s/
        ];
        
        for (const pattern of patterns) {
            if (pattern.test(trimmed)) {
                return true;
            }
        }
        
        return false;
    }

    parseNumberedRowNew(line, year, rowNumber) {
        const trimmed = line.trim();
        let cleanLine = trimmed.substring(1);
        
        let raw_columns = [];
        if (cleanLine.includes('||')) {
            raw_columns = cleanLine.split('||').map(col => col.trim());
        } else {
            raw_columns = cleanLine.split('|').map(col => col.trim());
        }
        
        if (raw_columns.length < 2) return null;
        
        const numberColRaw = raw_columns[0];
        const numberMatch = numberColRaw.match(/\d+/);
        if (!numberMatch) return null;
        
        let killedIsSplit = false;
        let woundedIsSplit = false;

        const columns = [];
        const columnKeys = ['number', 'date', 'location', 'coords', 'weapon', 'killed', 'wounded', 'damage', 'image'];
        let rawIdx = 0;
        let colspanSkip = 0;

        for (const key of columnKeys) {
            if (this.rowspanState[key] && this.rowspanState[key].remaining > 0) {
                this.rowspanState[key].remaining--;
                if (this.rowspanState[key].isNumeric) {
                    if (key === 'killed') killedIsSplit = true;
                    if (key === 'wounded') woundedIsSplit = true;
                    const value = this.rowspanState[key].values.shift();
                    columns.push(value !== undefined ? value.toString() : '');
                } else {
                    columns.push(this.rowspanState[key].value);
                }
                continue;
            }

            if (colspanSkip > 0) {
                columns.push('');
                colspanSkip--;
                continue;
            }

            if (rawIdx >= raw_columns.length) {
                columns.push('');
                continue;
            }

            const cellContent = raw_columns[rawIdx];
            const rowspanMatch = cellContent.match(/rowspan\s*=\s*"?(\d+)"?/i);
            const colspanMatch = cellContent.match(/colspan\s*=\s*"?(\d+)"?/i);
            let cellValue = cellContent;
            if (rowspanMatch || colspanMatch) {
                const pipeIndex = cellContent.indexOf('|');
                if (pipeIndex !== -1) {
                    cellValue = cellContent.slice(pipeIndex + 1).trim();
                }
            }
            const colSpan = colspanMatch ? parseInt(colspanMatch[1], 10) : 1;

            if (rowspanMatch) {
                const span = parseInt(rowspanMatch[1], 10);
                const cleanedValue = key === 'image' ? cellValue : this.extractDescription(cellValue);

                if (span > 1) {
                    this.rowspanState[key] = {
                        remaining: span - 1,
                        value: cleanedValue,
                    };

                    const numValue = this.extractNumber(cleanedValue);
                    
                    if ((key === 'killed' || key === 'wounded') && !isNaN(numValue) && numValue > 0) {
                        this.rowspanState[key].isNumeric = true;
                        if (key === 'killed') killedIsSplit = true;
                        if (key === 'wounded') woundedIsSplit = true;
                        const total = numValue;
                        const perRowBase = Math.floor(total / span);
                        let remainder = total % span;
                        
                        const selfValue = perRowBase + (remainder > 0 ? 1 : 0);
                        if (remainder > 0) remainder--;
                        columns.push(selfValue.toString());

                        const remainingValues = [];
                        for(let i = 0; i < span - 1; i++) {
                            const val = perRowBase + (remainder > 0 ? 1 : 0);
                            if (remainder > 0) remainder--;
                            remainingValues.push(val);
                        }
                        this.rowspanState[key].values = remainingValues;

                    } else {
                        this.rowspanState[key].isNumeric = false;
                        columns.push(cleanedValue);
                    }
                } else {
                    columns.push(cleanedValue);
                }
                if (colSpan > 1) {
                    colspanSkip = colSpan - 1;
                }
            } else if (colspanMatch) {
                const cleanedValue = key === 'image' ? cellValue : this.extractDescription(cellValue);
                columns.push(cleanedValue);
                if (colSpan > 1) {
                    colspanSkip = colSpan - 1;
                }
            } else {
                columns.push(cellContent);
            }
            rawIdx++;
        }
        
        const dateText = columns[1];
        const locationText = columns[2];
        const coordsText = columns[3];
        const weaponText = columns[4];
        const casualtiesText = columns[5];
        const woundedText = columns[6];
        const damageText = columns[7];
        const imageText = columns[8];

        const killedIsIncomplete = !killedIsSplit && casualtiesText.trim() === '';
        const woundedIsIncomplete = !woundedIsSplit && woundedText.trim() === '';

        const date = this.extractDateFromText(dateText);
        if (!date) return null;
        
        let location = this.extractLocation(locationText);
        
        const coords = this.extractCoordinates(coordsText);
        
        let weapon = this.extractDescription(weaponText);
        if (weapon === '—' || weapon.length <= 2) weapon = '';

        let damage = this.extractDescription(damageText);
        const damageRegex = /\s*\(Масований ракетний обстріл України \d{1,2} (?:січня|лютого|березня|квітня|травня|червня|липня|серпня|вересня|жовтня|листопада|грудня) \d{4}\)/g;
        damage = damage.replace(damageRegex, '').trim();
        if (damage === '—' || damage.length <= 2) damage = '';
        
        const timeOfDay = this.getTimeOfDay(dateText);
        const weaponType = this.getWeaponType(weapon);
        const time = this.extractTime(dateText);
        const images = this.extractImages(imageText);
        const image = images.length > 0 ? images[0] : null;

        return {
            id: `${year}-${rowNumber}`,
            year: year,
            rowNumber: parseInt(numberMatch[0]),
            date: date,
            time: time,
            timeOfDay: timeOfDay,
            location: location,
            lat: coords ? coords.lat : null,
            lng: coords ? coords.lng : null,
            weapon: weapon,
            weaponType: weaponType,
            killed: this.extractNumber(casualtiesText),
            wounded: this.extractNumber(woundedText),
            killedIsSplit: killedIsSplit,
            woundedIsSplit: woundedIsSplit,
            killedIsIncomplete: killedIsIncomplete,
            woundedIsIncomplete: woundedIsIncomplete,
            damage: damage,
            image: image,
            images: images,
            description: this.generatePopupText({
                date,
                time,
                location, 
                weapon, 
                killed: this.extractNumber(casualtiesText), 
                wounded: this.extractNumber(woundedText), 
                damage,
                killedIsSplit,
                woundedIsSplit,
                killedIsIncomplete,
                woundedIsIncomplete
            })
        };
    }

    generatePopupText(data) {
        let text = `<div class="popup-date">${data.date}`;
        if (data.time) {
            const timePrefix = data.time.includes('—') || data.time.includes('~') ? '' : '~';
            text += ` <span class="popup-time">${timePrefix}${data.time}</span>`;
        }
        text += `</div>`;

        if (data.location) {
            text += `<div class="popup-location">📍 ${data.location}</div>`;
        }
        if (data.weapon) {
            text += `<div class="popup-weapon"><strong>Зброя:</strong> ${data.weapon}</div>`;
        }
        
        if (data.killed > 0 || data.killedIsIncomplete) {
            let note = '';
            if (data.killedIsSplit) {
                note = ' (неточно, дані розділено)';
            } else if (data.killedIsIncomplete) {
                note = ' (дані неповні)';
            }
            const killedText = (data.killed === 0 && data.killedIsIncomplete) ? 'невідомо' : data.killed;
            text += `<div class="popup-casualties"><strong>Загиблі:</strong> ${killedText}${note}</div>`;
        }
        
        if (data.wounded > 0 || data.woundedIsIncomplete) {
            let note = '';
            if (data.woundedIsSplit) {
                note = ' (неточно, дані розділено)';
            } else if (data.woundedIsIncomplete) {
                note = ' (дані неповні)';
            }
            const woundedText = (data.wounded === 0 && data.woundedIsIncomplete) ? 'невідомо' : data.wounded;
            text += `<div class="popup-wounded"><strong>Поранені:</strong> ${woundedText}${note}</div>`;
        }

        if (data.damage) {
            text += `<div class="popup-damage"><strong>Збитки:</strong> ${data.damage}</div>`;
        }
        
        return text;
    }

    getTimeOfDay(dateText) {
        const cleanedText = dateText.replace(/&nbsp;/g, ' ');
        // First, try to find a time range
        const rangeMatch = cleanedText.match(/(\d{1,2}):(\d{2})\s*(?:—|–|-)\s*(\d{1,2})(?::(\d{2}))?/);
        if (rangeMatch) {
            const startHour = parseInt(rangeMatch[1], 10);
            const startMinute = parseInt(rangeMatch[2], 10);
            const endHour = parseInt(rangeMatch[3], 10);
            const endMinute = parseInt(rangeMatch[4], 10) || 0;

            const startTotalMinutes = startHour * 60 + startMinute;
            let endTotalMinutes = endHour * 60 + endMinute;

            // Handle overnight ranges (e.g., 22:00 - 02:00)
            if (endTotalMinutes < startTotalMinutes) {
                endTotalMinutes += 24 * 60;
            }

            const midPointTotalMinutes = (startTotalMinutes + endTotalMinutes) / 2;
            const midPointHour = Math.floor(midPointTotalMinutes / 60) % 24;

            if (midPointHour >= 21 || midPointHour < 8) {
                return 'night';
            } else {
                return 'day';
            }
        }

        // If no range, look for a single time
        const timeMatch = cleanedText.match(/(\d{1,2}):(\d{2})/);
        if (timeMatch) {
            const hour = parseInt(timeMatch[1], 10);
            if (hour >= 21 || hour < 8) {
                return 'night';
            } else {
                return 'day';
            }
        }

        // If no numbers, look for keywords
        const lowerCaseText = cleanedText.toLowerCase();
        if (lowerCaseText.includes('ніч') || lowerCaseText.includes('вночі')) {
            return 'night';
        }
        if (lowerCaseText.includes('день') || lowerCaseText.includes('вдень')) {
            return 'day';
        }

        return 'unknown';
    }

    getWeaponType(weaponText) {
        if (!weaponText) return 'unknown';
        const lowerText = weaponText.toLowerCase();
        
        const rocketKeywords = ['ракет', 'х-', 'іскандер', 'калібр', 'кинджал', 'onyx', 'циркон'];
        if (rocketKeywords.some(kw => lowerText.includes(kw))) {
            return 'rocket';
        }

        const droneKeywords = ['дрон', 'шахед', 'shahed', 'бпла'];
        if (droneKeywords.some(kw => lowerText.includes(kw))) {
            return 'drone';
        }

        if (lowerText && lowerText.length > 1 && lowerText !== '—') {
            return 'other';
        }

        return 'unknown';
    }

    extractCoordinates(text) {
        if (!text || typeof text !== 'string') return null;
        
        
        const coordPattern1 = /\{\{coord\|(\d+)\|(\d+)\|([0-9.]+)\|([NS])\|(\d+)\|(\d+)\|([0-9.]+)\|([EW])\}\}/;
        const match1 = text.match(coordPattern1);
        if (match1) {
            const latDeg = parseInt(match1[1]);
            const latMin = parseInt(match1[2]);
            const latSec = parseFloat(match1[3]);
            const latDir = match1[4];
            
            const lngDeg = parseInt(match1[5]);
            const lngMin = parseInt(match1[6]);
            const lngSec = parseFloat(match1[7]);
            const lngDir = match1[8];
            
            let lat = latDeg + latMin/60 + latSec/3600;
            let lng = lngDeg + lngMin/60 + lngSec/3600;
            
            if (latDir === 'S') lat = -lat;
            if (lngDir === 'W') lng = -lng;
            
            
            if (lat >= 50.2 && lat <= 50.7 && lng >= 30.2 && lng <= 30.8) {
                return { lat, lng };
            }
        }
        
        const coordPattern2 = /\{\{coord\|([0-9.]+)\|([0-9.]+)\}\}/;
        const match2 = text.match(coordPattern2);
        if (match2) {
            const lat = parseFloat(match2[1]);
            const lng = parseFloat(match2[2]);
            
            
            if (lat >= 50.2 && lat <= 50.7 && lng >= 30.2 && lng <= 30.8) {
                return { lat, lng };
            }
        }
        
        const otherPatterns = [
            /(\d{2}\.\d+)[,\s]+(\d{2}\.\d+)/,
            /координати[:\s]*(\d+\.?\d*)[,\s]+(\d+\.?\d*)/i
        ];
        
        for (const pattern of otherPatterns) {
            const match = text.match(pattern);
            if (match) {
                const lat = parseFloat(match[1]);
                const lng = parseFloat(match[2]);
                
                
                if (lat >= 50.2 && lat <= 50.7 && lng >= 30.2 && lng <= 30.8) {
                    return { lat, lng };
                }
            }
        }
        
        return null;
    }

    extractDateFromText(text) {
        const dtsPattern = /\{\{dts\|(\d{4})\|(\d{1,2})\|(\d{1,2})\}\}/;
        const dtsMatch = text.match(dtsPattern);
        if (dtsMatch) {
            const year = dtsMatch[1];
            const month = dtsMatch[2].padStart(2, '0');
            const day = dtsMatch[3].padStart(2, '0');
            const normalized = `${day}-${month}-${year}`;
            return normalized;
        }

        const dtsPatternWithoutDay = /\{\{dts\|(\d{4})\|(\d{1,2})\|.*?\}\}/;
        const dtsMatchWithoutDay = text.match(dtsPatternWithoutDay);
        if (dtsMatchWithoutDay) {
            const year = dtsMatchWithoutDay[1];
            const month = dtsMatchWithoutDay[2].padStart(2, '0');
            const day = '01';
            const normalized = `${day}-${month}-${year}`;
            return normalized;
        }
        
        const linkPattern = /\[\[([^\]]*(\d{1,2})\s+(січня|лютого|березня|квітня|травня|червня|липня|серпня|вересня|жовтня|листопада|грудня)\s+(\d{4})[^\]]*)\]\]/i;
        const linkMatch = text.match(linkPattern);
        if (linkMatch) {
            const day = linkMatch[2].padStart(2, '0');
            const monthName = linkMatch[3].toLowerCase();
            const year = linkMatch[4];
            
            const monthMap = {
                'січня': '01', 'лютого': '02', 'березня': '03', 'квітня': '04',
                'травня': '05', 'червня': '06', 'липня': '07', 'серпня': '08',
                'вересня': '09', 'жовтня': '10', 'листопада': '11', 'грудня': '12'
            };
            
            const month = monthMap[monthName];
            if (month) {
                const normalized = `${day}-${month}-${year}`;
                return normalized;
            }
        }
        
        const datePatterns = [
            /\d{1,2}[.\-\/]\d{1,2}[.\-\/]20\d{2}/g,
            /20\d{2}[.\-\/]\d{1,2}[.\-\/]\d{1,2}/g
        ];
        
        for (const pattern of datePatterns) {
            const matches = [...text.matchAll(pattern)];
            for (const match of matches) {
                const normalized = this.normalizeDate(match[0]);
                if (normalized) {
                    return normalized;
                }
            }
        }
        
        return null;
    }

    normalizeDate(dateStr) {
        if (!dateStr || typeof dateStr !== 'string') return null;
        
        
        const cleanStr = dateStr.trim().replace(/[^\d.\-\/]/g, '');
        
        const patterns = [
            { regex: /^(\d{1,2})[.\-\/](\d{1,2})[.\-\/](\d{4})$/, format: 'dmy' },
            { regex: /^(\d{4})[.\-\/](\d{1,2})[.\-\/](\d{1,2})$/, format: 'ymd' },
            { regex: /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/, format: 'mdy' },
            { regex: /^(\d{1,2})[.\-\/](\d{1,2})[.\-\/](\d{2})$/, format: 'dmy2' }
        ];
        
        for (const pattern of patterns) {
            const match = cleanStr.match(pattern.regex);
            if (match) {
                let day, month, year;
                
                switch (pattern.format) {
                    case 'dmy':
                        day = parseInt(match[1], 10);
                        month = parseInt(match[2], 10);
                        year = parseInt(match[3], 10);
                        break;
                    case 'ymd':
                        year = parseInt(match[1], 10);
                        month = parseInt(match[2], 10);
                        day = parseInt(match[3], 10);
                        break;
                    case 'mdy':
                        month = parseInt(match[1], 10);
                        day = parseInt(match[2], 10);
                        year = parseInt(match[3], 10);
                        break;
                    case 'dmy2':
                        day = parseInt(match[1], 10);
                        month = parseInt(match[2], 10);
                        year = parseInt(match[3], 10);
                        if (year < 50) year += 2000;
                        else if (year < 100) year += 1900;
                        break;
                }
                
                if (day >= 1 && day <= 31 && month >= 1 && month <= 12 && year >= 2020 && year <= 2030) {
                    const normalized = `${day.toString().padStart(2, '0')}-${month.toString().padStart(2, '0')}-${year}`;
                    return normalized;
                }
            }
        }
        
        return null;
    }

    deduplicateData(data) {
        const seen = new Set();
        return data.filter(item => {
            const key = item.lat && item.lng 
                ? `${item.date}_${item.lat.toFixed(4)}_${item.lng.toFixed(4)}`
                : `${item.date}_${item.location}`;

            if (seen.has(key)) {
                return false;
            }
            seen.add(key);
            return true;
        });
    }

    extractDescription(text) {
        if (!text || typeof text !== 'string') return '';
        
        return text
            .replace(/\[\[([^\]|]+)(\|[^\]]+)?\]\]/g, '$1')
            .replace(/\{\{[^}]+\}\}/g, '')
            .replace(/'''([^']+)'''/g, '$1')
            .replace(/''([^']+)''/g, '$1')
            .replace(/\[[^\]]*\]/g, '')
            .replace(/<[^>]*>/g, '')
            .replace(/\}\}/g, '')
            .replace(/\{\{/g, '')
            .replace(/\s+/g, ' ')
            .trim();
    }

    extractNumber(text) {
        if (!text) return 0;
        const match = text.match(/\d+/);
        return match ? parseInt(match[0], 10) : 0;
    }

    extractImages(text) {
        if (!text) return [];

        const urls = [];

        const pushImageName = (rawName) => {
            if (!rawName) return;
            let name = rawName.trim();
            name = name.replace(/^(?:Файл|File):/i, '').trim();
            if (!name) return;
            const normalizedName = name.replace(/ /g, '_');
            const encodedName = encodeURIComponent(normalizedName);
            urls.push(`https://commons.wikimedia.org/wiki/Special:FilePath/${encodedName}`);
        };

        // 1. Standard File links [[File:...]] or [[Файл:...]]
        const fileMatches = [...text.matchAll(/\[\[(?:Файл|File):([^|\]]+)/gi)];
        fileMatches.forEach(match => {
            pushImageName(match[1]);
        });

        // 2. CSS image crop template (uses Image= without [[File:...]])
        if (/\{\{\s*CSS\s+image\s+crop/i.test(text)) {
            const cssImageMatches = [...text.matchAll(/\|\s*Image\s*=\s*([^|}]+)/gi)];
            cssImageMatches.forEach(match => {
                pushImageName(match[1]);
            });
        }

        // 3. Bare File: references (e.g., inside galleries/templates)
        const bareFileMatches = [...text.matchAll(/(?:^|[\s|])(?:Файл|File):([^\|\]\n]+\.(?:jpg|jpeg|png|webp|gif|tif|tiff))/gi)];
        bareFileMatches.forEach(match => {
            pushImageName(match[1]);
        });

        // 4. Photomontage template handling
        if (/\{\{\s*Photomontage/i.test(text)) {
            // Extract inside of the template braces to avoid trailing text
            const pmRegex = /\{\{\s*Photomontage([\s\S]*?)\}\}/i;
            const pmMatch = text.match(pmRegex);
            if (pmMatch) {
                const inner = pmMatch[1];
                const parts = inner.split('|');
                parts.forEach(part => {
                    const [key, value] = part.split('=');
                    if (key && value && key.trim().toLowerCase().startsWith('photo')) {
                        let name = value.trim();
                        // Remove possible File: prefix
                        name = name.replace(/^(?:Файл|File):/i, '').trim();
                        if (name) {
                            pushImageName(name);
                        }
                    }
                });
            }
        }

        // 5. Deduplicate
        return [...new Set(urls)];
    }

    extractLocation(text) {
        if (!text) return '';
        // First, remove all <ref> tags completely, as they can contain complex templates.
        let cleanedText = text.replace(/<ref[^>]*>[\s\S]*?<\/ref>/gi, '');
        cleanedText = cleanedText.replace(/<ref[^\/>]*\/>/gi, '');

        return this.removeWikiMarkup(cleanedText).trim();
    }

    extractTime(text) {
        if (!text) return null;
        const cleanedText = text.replace(/&nbsp;/g, ' ');

        // Match "12:49—16" or "12:49—16:03" (direct time ranges)
        const rangeMatch = cleanedText.match(/(\d{1,2}:\d{2})\s*(?:—|–|-)\s*(\d{1,2}(?::\d{2})?)/);
        if (rangeMatch) {
            return `${rangeMatch[1]}—${rangeMatch[2]}`; // Standardize dash
        }

        // Match time ranges with DTS templates like "{{dts|2025|09|06}} 21:47 – {{dts|2025|09|07}} 05:19"
        const dtsRangeMatch = cleanedText.match(/\{\{dts\|\d{4}\|\d{1,2}\|\d{1,2}\}\}\s+(\d{1,2}:\d{2})\s*(?:—|–|-)\s*\{\{dts\|\d{4}\|\d{1,2}\|\d{1,2}\}\}\s+(\d{1,2}:\d{2})/);
        if (dtsRangeMatch) {
            return `${dtsRangeMatch[1]}—${dtsRangeMatch[2]}`;
        }

        // Match time ranges separated by dates like "6 вересня 2025 21:47  7 вересня 2025 05:19"
        const dateTimeRangeMatch = cleanedText.match(/(\d{1,2}:\d{2})\s+\d+\s+(?:січня|лютого|березня|квітня|травня|червня|липня|серпня|вересня|жовтня|листопада|грудня)\s+\d{4}\s+(\d{1,2}:\d{2})/);
        if (dateTimeRangeMatch) {
            return `${dateTimeRangeMatch[1]}—${dateTimeRangeMatch[2]}`;
        }

        // Match single time, possibly with tilde
        const timeMatch = cleanedText.match(/(~?\d{1,2}:\d{2})/);
        if (timeMatch) {
            return timeMatch[1];
        }

        return null;
    }

    removeWikiMarkup(text) {
        if (!text) return '';
        let result = text;

        // [[Page|Display]] -> Display, [[Page]] -> Page
        result = result.replace(/\[\[(?:[^|\]]+\|)?([^\]]+)\]\]/g, '$1');

        // Remove templates like {{template|...}} or {{template}}
        result = result.replace(/\{\{[\s\S]*?\}\}/g, '');

        // Clean up common wiki formatting
        result = result.replace(/'''([^']+)'''/g, '$1'); // Bold
        result = result.replace(/''([^']+)''/g, '$1');   // Italic

        // Remove any remaining HTML tags like <br>, <small>, etc.
        result = result.replace(/<[^>]+>/g, '');

        // Clean up any remaining external links like [http://...]
        result = result.replace(/\[[^\]]*\]/g, '');

        // Normalize whitespace
        return result.replace(/\s+/g, ' ').trim();
    }
}
