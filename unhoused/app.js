(() => {
  'use strict';

  const rawData = window.PLAY_DATA;
  if (!rawData || !rawData.ru || !rawData.ua || !rawData.en || !rawData.ui) {
    throw new Error('Не вдалося завантажити дані п’єси / Не удалось загрузить данные пьесы / Failed to load play data.');
  }

  const elements = {
    mainApp: document.querySelector('#mainApp'),
    scene: document.querySelector('#scene'),
    dialogue: document.querySelector('#dialogue'),
    dialogueText: document.querySelector('#dialogueText'),
    speaker: document.querySelector('#speaker'),
    partMarker: document.querySelector('#partMarker'),
    progress: document.querySelector('#progress'),
    backButton: document.querySelector('#backButton'),
    advanceSurface: document.querySelector('#advanceSurface'),
    startCurtain: document.querySelector('#startCurtain'),
    endCurtain: document.querySelector('#endCurtain'),
    startButton: document.querySelector('#startButton'),
    restartButton: document.querySelector('#restartButton'),
    playAgainButton: document.querySelector('#playAgainButton'),
    startEyebrow: document.querySelector('#startEyebrow'),
    startTitle: document.querySelector('#startTitle'),
    startDescription: document.querySelector('#startDescription'),
    startHint: document.querySelector('#startHint'),
    endEyebrow: document.querySelector('#endEyebrow'),
    endTitle: document.querySelector('#endTitle'),
    endDescription: document.querySelector('#endDescription'),
    continueHintText: document.querySelector('#continueHintText'),
    charLabelSasha: document.querySelector('#charLabelSasha'),
    charLabelUkraine: document.querySelector('#charLabelUkraine'),
    charLabelGermany: document.querySelector('#charLabelGermany'),
    charLabelBritain: document.querySelector('#charLabelBritain'),
    characters: [...document.querySelectorAll('.character, .character-outline')],
    soundControl: document.querySelector('#soundControl'),
    soundToggle: document.querySelector('#soundToggle'),
    ambientAudio: document.querySelector('#ambientAudio')
  };

  const maxChunkLength = 360;
  const skippedIntroCount = 1;
  const progressStorageKey = 'bomji_play_progress';
  const langStorageKey = 'bomji_play_lang';
  const volumeStorageKey = 'bomji_ambient_volume';
  const mutedStorageKey = 'bomji_ambient_muted';

  // Dynamic reduced-motion preference tracking
  const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  let isReducedMotion = motionQuery.matches;
  if (typeof motionQuery.addEventListener === 'function') {
    motionQuery.addEventListener('change', (event) => {
      isReducedMotion = event.matches;
    });
  }

  function getTypeInterval() {
    return isReducedMotion ? 0 : 16;
  }

  // Language state (default: 'ua', or read from localStorage)
  let currentLang = 'ua';
  try {
    const savedLang = localStorage.getItem(langStorageKey);
    if (savedLang === 'ru' || savedLang === 'ua' || savedLang === 'en') {
      currentLang = savedLang;
    }
  } catch {
    // Ignore localStorage errors
  }

  // Script caching to avoid re-chunking strings repeatedly on language switch
  const scriptCache = new Map();

  function getScript(lang) {
    if (scriptCache.has(lang)) {
      return scriptCache.get(lang);
    }
    const playData = rawData[lang];
    const script = buildScript(playData);
    scriptCache.set(lang, script);
    return script;
  }

  let data = rawData[currentLang];
  let ui = rawData.ui[currentLang];
  let characterNames = getCharacterNames(data);
  let script = getScript(currentLang);

  let currentIndex = -1;
  let typingFrame = 0;
  let typingStartedAt = 0;
  let activeText = '';
  let revealedCharacters = 0;
  let isTyping = false;
  let hasStarted = false;
  let hasEnded = false;

  // Ambient campfire sound
  const ambient = {
    audio: elements.ambientAudio,
    toggle: elements.soundToggle,
    muted: false,
    started: false
  };

  function persistAmbientMuted() {
    try {
      localStorage.setItem(mutedStorageKey, ambient.muted ? '1' : '0');
    } catch {
      // Ignore localStorage errors
    }
  }

  function updateAmbientUI() {
    if (!ambient.toggle) return;
    ambient.toggle.classList.toggle('is-muted', ambient.muted);
    ambient.toggle.setAttribute('aria-pressed', String(!ambient.muted));
    ambient.toggle.setAttribute('aria-label', ambient.muted ? ui.soundToggleOff : ui.soundToggleOn);
  }

  function startAmbient() {
    if (!ambient.audio || ambient.started || !ambient.toggle) return;
    ambient.started = true;
    persistAmbientMuted();
    if (ambient.muted) return;
    ambient.audio.play().catch(() => {});
  }

  function pauseAmbient() {
    if (!ambient.audio) return;
    ambient.started = false;
    ambient.audio.pause();
  }

  function toggleAmbient() {
    if (!ambient.audio) return;
    if (ambient.muted) {
      ambient.muted = false;
      persistAmbientMuted();
      updateAmbientUI();
      ambient.audio.play().catch(() => {});
    } else if (!ambient.audio.paused) {
      ambient.audio.pause();
      ambient.muted = true;
      persistAmbientMuted();
      updateAmbientUI();
    } else {
      ambient.audio.play().catch(() => {});
    }
  }

  // Restore saved mute state and clean legacy storage
  {
    try {
      ambient.muted = localStorage.getItem(mutedStorageKey) === '1';
      localStorage.removeItem(volumeStorageKey);
    } catch {
      // Ignore localStorage errors
    }
    if (ambient.audio) {
      ambient.audio.volume = 0.6;
    }
    updateAmbientUI();
  }

  if (ambient.toggle) {
    ambient.toggle.addEventListener('click', (event) => {
      event.stopPropagation();
      toggleAmbient();
    });
  }

  function getCharacterNames(playData) {
    return Object.fromEntries(
      Object.entries(playData.characters).map(([key, character]) => [key, character.name])
    );
  }

  function setLanguage(lang, preserveTyping = false) {
    if (lang !== 'ua' && lang !== 'ru' && lang !== 'en') return;
    currentLang = lang;

    try {
      localStorage.setItem(langStorageKey, lang);
    } catch {
      // Ignore localStorage errors
    }

    data = rawData[currentLang];
    ui = rawData.ui[currentLang];
    characterNames = getCharacterNames(data);

    // Keep track of current line ID and chunk to map to new script
    let targetLineId = null;
    let targetChunkIndex = 0;
    if (hasStarted && currentIndex >= 0 && currentIndex < script.length) {
      targetLineId = script[currentIndex].id;
      targetChunkIndex = script[currentIndex].chunkIndex || 0;
    }

    script = getScript(currentLang);

    // Update document metadata
    document.documentElement.lang = currentLang === 'ua' ? 'uk' : (currentLang === 'ru' ? 'ru' : 'en');
    document.title = ui.pageTitle;
    if (elements.mainApp) {
      elements.mainApp.setAttribute('aria-label', ui.ariaMain);
    }
    if (elements.scene) {
      elements.scene.setAttribute('aria-label', ui.ariaScene);
    }
    if (elements.advanceSurface) {
      elements.advanceSurface.setAttribute('aria-label', ui.ariaAdvance);
    }
    if (elements.backButton) {
      elements.backButton.setAttribute('aria-label', ui.ariaBack || 'Попередня репліка');
      elements.backButton.title = ui.backTitle || 'Назад (←)';
    }

    if (elements.soundControl) elements.soundControl.setAttribute('aria-label', ui.soundLabel);
    if (elements.soundToggle) {
      elements.soundToggle.title = ui.soundLabel;
      elements.soundToggle.textContent = ui.soundButton;
      elements.soundToggle.setAttribute('aria-label', ambient.muted ? ui.soundToggleOff : ui.soundToggleOn);
    }

    // Update UI elements in Curtains and HUD
    if (elements.startEyebrow) elements.startEyebrow.textContent = ui.eyebrow;
    if (elements.startTitle) elements.startTitle.innerHTML = ui.mainTitle;
    if (elements.startDescription) elements.startDescription.innerHTML = ui.startDescription;
    if (elements.startButton) elements.startButton.textContent = ui.startButton;
    if (elements.startHint) elements.startHint.innerHTML = ui.startHint;

    if (elements.endEyebrow) elements.endEyebrow.textContent = ui.endEyebrow;
    if (elements.endTitle) elements.endTitle.innerHTML = ui.endTitle;
    if (elements.endDescription) elements.endDescription.textContent = ui.endDescription;
    if (elements.playAgainButton) elements.playAgainButton.textContent = ui.playAgainButton;

    if (elements.restartButton) elements.restartButton.textContent = ui.restartButton;
    if (elements.continueHintText) elements.continueHintText.textContent = ui.continueHint;

    if (elements.charLabelSasha) elements.charLabelSasha.textContent = ui.sceneCharacterNames.sasha;
    if (elements.charLabelUkraine) elements.charLabelUkraine.textContent = ui.sceneCharacterNames.ukraine;
    if (elements.charLabelGermany) elements.charLabelGermany.textContent = ui.sceneCharacterNames.germany;
    if (elements.charLabelBritain) elements.charLabelBritain.textContent = ui.sceneCharacterNames.britain;

    // Update language switcher active & aria states
    document.querySelectorAll('[data-lang]').forEach((btn) => {
      const isActive = btn.dataset.lang === currentLang;
      btn.classList.toggle('is-active', isActive);
      btn.setAttribute('aria-pressed', String(isActive));
    });

    updateBackButtonState();

    // Map current index in new script
    if (targetLineId !== null) {
      let matchIdx = script.findIndex(
        (item) => item.id === targetLineId && item.chunkIndex === targetChunkIndex
      );
      if (matchIdx === -1) {
        matchIdx = script.findIndex((item) => item.id === targetLineId);
      }
      if (matchIdx !== -1) {
        currentIndex = matchIdx;
      } else if (hasEnded) {
        currentIndex = script.length - 1;
      }
    }

    // Update progress & current view if in progress
    if (!hasStarted) {
      renderProgress('', 0, data.lines.length, false);
    } else if (hasEnded) {
      const lastLine = script[currentIndex] || script[script.length - 1];
      if (lastLine) {
        if (typeof lastLine.id === 'string') {
          renderProgress(
            ui.introPrefix,
            currentIndex + 1,
            Math.max(0, data.intro.length - skippedIntroCount),
            false
          );
        } else {
          renderProgress('', lastLine.id, data.lines.length, true);
        }
        saveProgress(lastLine, true);
      }
    } else if (targetLineId !== null) {
      renderCurrent(preserveTyping);
    }
  }

  // Initialize UI with initial language
  setLanguage(currentLang);
  restoreProgress();

  if (elements.startButton) {
    elements.startButton.addEventListener('click', (event) => {
      event.stopPropagation();
      startPlay();
    });
  }

  if (elements.backButton) {
    elements.backButton.addEventListener('click', (event) => {
      event.stopPropagation();
      stepBack();
    });
  }

  if (elements.advanceSurface) {
    elements.advanceSurface.addEventListener('click', advance);
  }
  if (elements.dialogue) {
    elements.dialogue.addEventListener('click', advance);
  }

  if (elements.restartButton) {
    elements.restartButton.addEventListener('click', (event) => {
      event.stopPropagation();
      if (window.confirm(ui.restartConfirm)) {
        restartPlay();
      }
    });
  }

  if (elements.playAgainButton) {
    elements.playAgainButton.addEventListener('click', (event) => {
      event.stopPropagation();
      restartPlay();
    });
  }

  // Unified language switch listeners
  document.querySelectorAll('[data-lang]').forEach((btn) => {
    btn.addEventListener('click', (event) => {
      event.stopPropagation();
      const targetLang = btn.dataset.lang;
      if (targetLang) {
        setLanguage(targetLang);
      }
    });
  });

  document.addEventListener('keydown', (event) => {
    const forwardKeys = [' ', 'Enter', 'ArrowRight', 'ArrowDown'];
    const backwardKeys = ['ArrowLeft', 'ArrowUp', 'Backspace'];

    if (!forwardKeys.includes(event.key) && !backwardKeys.includes(event.key)) return;
    if (event.target instanceof HTMLButtonElement && [' ', 'Enter'].includes(event.key)) return;

    event.preventDefault();

    if (forwardKeys.includes(event.key)) {
      if (!hasStarted) {
        startPlay();
        return;
      }
      advance();
    } else if (backwardKeys.includes(event.key)) {
      if (!hasStarted) return;
      stepBack();
    }
  });

  function buildScript(playData) {
    const intro = playData.intro.slice(skippedIntroCount).map((text, index) => ({
      id: `intro-${index + skippedIntroCount + 1}`,
      type: 'stage',
      character: 'sasha',
      text
    }));

    return [...intro, ...playData.lines].flatMap((line) => {
      const chunks = splitIntoChunks(line.text, maxChunkLength);
      return chunks.map((text, chunkIndex) => ({
        ...line,
        text,
        chunkIndex,
        chunkCount: chunks.length
      }));
    });
  }

  function splitIntoChunks(sourceText, limit) {
    const text = sourceText.replace(/[ \t]+/g, ' ').replace(/\s*\n\s*/g, '\n').trim();
    if (text.length <= limit) return [text];

    const sentences = text.match(/[^.!?…\n]+(?:[.!?…]+["»”)]*|$)|\n+/gu) || [text];
    const chunks = [];
    let current = '';

    for (const sentence of sentences) {
      const cleanSentence = sentence.trim();
      if (!cleanSentence) continue;

      if (cleanSentence.length > limit) {
        if (current) {
          chunks.push(current);
          current = '';
        }
        chunks.push(...splitLongSentence(cleanSentence, limit));
        continue;
      }

      const candidate = current ? `${current} ${cleanSentence}` : cleanSentence;
      if (candidate.length > limit) {
        chunks.push(current);
        current = cleanSentence;
      } else {
        current = candidate;
      }
    }

    if (current) chunks.push(current);
    return chunks;
  }

  function splitLongSentence(sentence, limit) {
    const words = sentence.split(/\s+/u);
    const chunks = [];
    let current = '';

    for (const word of words) {
      const candidate = current ? `${current} ${word}` : word;
      if (candidate.length > limit && current) {
        chunks.push(current);
        current = word;
      } else {
        current = candidate;
      }
    }

    if (current) chunks.push(current);
    return chunks;
  }

  function startPlay() {
    hasStarted = true;
    hasEnded = false;
    document.documentElement.classList.add('has-saved-progress');
    document.documentElement.classList.add('ambient-active');
    if (elements.startCurtain) elements.startCurtain.classList.add('is-hidden');
    if (elements.endCurtain) elements.endCurtain.classList.add('is-hidden');
    if (elements.dialogue) elements.dialogue.classList.remove('is-hidden');
    currentIndex = 0;
    renderCurrent();
    startAmbient();
  }

  function restartPlay() {
    cancelAnimationFrame(typingFrame);
    isTyping = false;
    hasStarted = false;
    hasEnded = false;
    currentIndex = -1;
    document.documentElement.classList.remove('has-saved-progress');
    document.documentElement.classList.remove('ambient-active');
    if (elements.startCurtain) elements.startCurtain.classList.remove('is-hidden');
    if (elements.endCurtain) elements.endCurtain.classList.add('is-hidden');
    if (elements.dialogue) elements.dialogue.classList.add('is-hidden');
    elements.characters.forEach((character) => character.classList.remove('is-active'));
    renderProgress('', 0, data.lines.length, false);
    updateBackButtonState();
    pauseAmbient();

    try {
      localStorage.removeItem(progressStorageKey);
    } catch {
      // Ignore localStorage errors
    }
  }

  function advance() {
    if (!hasStarted || hasEnded) return;

    startAmbient();

    if (isTyping) {
      finishTyping();
      return;
    }

    if (currentIndex >= script.length - 1) {
      showEnding();
      return;
    }

    currentIndex += 1;
    renderCurrent();
  }

  function stepBack() {
    if (!hasStarted) return;

    startAmbient();

    if (hasEnded) {
      hasEnded = false;
      if (elements.endCurtain) elements.endCurtain.classList.add('is-hidden');
      if (elements.dialogue) elements.dialogue.classList.remove('is-hidden');
      renderCurrent(true);
      return;
    }

    if (currentIndex <= 0) return;

    cancelAnimationFrame(typingFrame);
    isTyping = false;
    currentIndex -= 1;
    renderCurrent(true);
  }

  function updateBackButtonState() {
    if (!elements.backButton) return;
    const canGoBack = hasStarted && (hasEnded || currentIndex > 0);
    elements.backButton.disabled = !canGoBack;
    elements.backButton.setAttribute('aria-disabled', String(!canGoBack));
  }

  function renderCurrent(immediate = false) {
    const line = script[currentIndex];
    if (!line) return;

    cancelAnimationFrame(typingFrame);
    const interval = getTypeInterval();
    isTyping = !immediate && interval > 0;
    activeText = line.text;
    revealedCharacters = immediate || interval === 0 ? activeText.length : 0;
    typingStartedAt = performance.now();

    if (elements.dialogue) {
      elements.dialogue.dataset.character = line.character;
      elements.dialogue.classList.toggle('is-stage', line.type === 'stage');
      elements.dialogue.classList.toggle('is-intro', typeof line.id === 'string');
      elements.dialogue.classList.toggle('is-waiting', immediate || interval === 0);
    }

    renderDialogueText(immediate || interval === 0 ? activeText : '');
    if (elements.dialogueText) {
      elements.dialogueText.scrollTop = 0;
    }

    if (elements.speaker) {
      elements.speaker.textContent = line.type === 'stage' ? '' : characterNames[line.character];
    }

    if (elements.partMarker) {
      elements.partMarker.textContent = line.chunkCount > 1
        ? `${line.chunkIndex + 1} / ${line.chunkCount}`
        : '';
    }

    if (typeof line.id === 'string') {
      renderProgress(
        ui.introPrefix,
        currentIndex + 1,
        Math.max(0, data.intro.length - skippedIntroCount),
        false
      );
    } else {
      renderProgress('', line.id, data.lines.length, true);
    }

    elements.characters.forEach((character) => {
      character.classList.toggle('is-active', character.dataset.character === line.character);
    });

    updateBackButtonState();
    saveProgress(line);

    if (immediate || interval === 0) {
      finishTyping();
      return;
    }

    typingFrame = requestAnimationFrame(typeStep);
  }

  function typeStep(timestamp) {
    const interval = getTypeInterval();
    if (interval === 0) {
      finishTyping();
      return;
    }

    const elapsed = timestamp - typingStartedAt;
    const targetCharacters = Math.min(activeText.length, Math.floor(elapsed / interval));

    if (targetCharacters !== revealedCharacters) {
      revealedCharacters = targetCharacters;
      renderDialogueText(activeText.slice(0, revealedCharacters));
    }

    if (revealedCharacters >= activeText.length) {
      finishTyping();
      return;
    }

    typingFrame = requestAnimationFrame(typeStep);
  }

  function finishTyping() {
    cancelAnimationFrame(typingFrame);
    isTyping = false;
    revealedCharacters = activeText.length;
    renderDialogueText(activeText);
    if (elements.dialogue) {
      elements.dialogue.classList.add('is-waiting');
    }
  }

  function renderDialogueText(text) {
    if (!elements.dialogueText) return;

    // Fast-path: plain text with no remarks avoids regex & DOM fragment overhead
    if (!text.includes('(')) {
      elements.dialogueText.textContent = text;
      return;
    }

    const fragment = document.createDocumentFragment();
    const remarkPattern = /\([^)]*(?:\)|$)/gu;
    let cursor = 0;

    for (const match of text.matchAll(remarkPattern)) {
      if (match.index > cursor) {
        fragment.append(document.createTextNode(text.slice(cursor, match.index)));
      }

      const remark = document.createElement('span');
      remark.className = 'dialogue__remark';
      remark.textContent = match[0];
      fragment.append(remark);
      cursor = match.index + match[0].length;
    }

    if (cursor < text.length) {
      fragment.append(document.createTextNode(text.slice(cursor)));
    }

    elements.dialogueText.replaceChildren(fragment);
  }

  function renderProgress(prefix, current, total, showPercent = true) {
    if (!elements.progress) return;

    const currentNumber = document.createElement('strong');
    currentNumber.className = 'progress__current';
    currentNumber.textContent = String(current);

    const nodes = [];
    if (prefix) {
      nodes.push(document.createTextNode(`${prefix} `));
    }
    nodes.push(
      currentNumber,
      document.createTextNode(` / ${total}`)
    );

    if (showPercent && total > 0) {
      const percent = Math.round((current / total) * 100);
      const percentSpan = document.createElement('span');
      percentSpan.className = 'progress__percent';
      percentSpan.textContent = ` (${percent}%)`;
      nodes.push(percentSpan);
    }

    elements.progress.replaceChildren(...nodes);
  }

  function saveProgress(line, ended = false) {
    if (!line) return;
    try {
      localStorage.setItem(progressStorageKey, JSON.stringify({
        lineId: line.id,
        chunkIndex: line.chunkIndex || 0,
        ended
      }));
    } catch {
      // Ignore localStorage errors
    }
  }

  function restoreProgress() {
    let savedProgress;

    try {
      savedProgress = JSON.parse(localStorage.getItem(progressStorageKey) || 'null');
    } catch {
      return;
    }

    if (!savedProgress || savedProgress.lineId === null || savedProgress.lineId === undefined) return;

    const savedIndex = script.findIndex((item) => (
      item.id === savedProgress.lineId
      && (item.chunkIndex || 0) === (savedProgress.chunkIndex || 0)
    ));

    if (savedIndex === -1) {
      document.documentElement.classList.remove('has-saved-progress');
      return;
    }

    document.documentElement.classList.add('has-saved-progress');
    document.documentElement.classList.add('ambient-active');
    hasStarted = true;
    currentIndex = savedIndex;
    if (elements.startCurtain) elements.startCurtain.classList.add('is-hidden');

    if (savedProgress.ended) {
      showEnding();
    } else {
      hasEnded = false;
      if (elements.endCurtain) elements.endCurtain.classList.add('is-hidden');
      if (elements.dialogue) elements.dialogue.classList.remove('is-hidden');
      renderCurrent(true);
    }
  }

  function showEnding() {
    cancelAnimationFrame(typingFrame);
    isTyping = false;
    hasEnded = true;
    if (elements.dialogue) elements.dialogue.classList.add('is-hidden');
    if (elements.endCurtain) elements.endCurtain.classList.remove('is-hidden');
    elements.characters.forEach((character) => character.classList.remove('is-active'));
    updateBackButtonState();

    if (currentIndex >= 0 && currentIndex < script.length) {
      const lastLine = script[currentIndex];
      if (typeof lastLine.id === 'string') {
        renderProgress(
          ui.introPrefix,
          currentIndex + 1,
          Math.max(0, data.intro.length - skippedIntroCount),
          false
        );
      } else {
        renderProgress('', lastLine.id, data.lines.length, true);
      }
      saveProgress(lastLine, true);
    }
  }
})();
