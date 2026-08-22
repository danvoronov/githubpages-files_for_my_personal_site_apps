const GROUPS = {
  self: "group-self",
  love: "group-love",
  care: "group-care",
  growth: "group-growth",
  work: "group-work",
  adventure: "group-adventure",
  joy: "group-joy",
  meaning: "group-meaning",
  order: "group-order"
};

const VALUES = [
  { n: 1, title: "Автентичність", text: "Діяти щиро та бути вірним собі.", group: "self" },
  { n: 2, title: "Автономія", text: "Бути самостійним і незалежним.", group: "self" },
  { n: 3, title: "Авторитет", text: "Керувати іншими, бути лідером.", group: "work" },
  { n: 4, title: "Азарт", text: "Мати життя, сповнене яскравих емоцій та драйву.", group: "adventure" },
  { n: 5, title: "Багатство", text: "Мати матеріальний достаток і фінансову свободу.", group: "order" },
  { n: 6, title: "Безпека", text: "Бути в безпеці та відчувати захищеність.", group: "order" },
  { n: 7, title: "Близькість", text: "Ділитися найпотаємнішими переживаннями.", group: "love" },
  { n: 8, title: "Божа воля", text: "Шукати та виконувати волю Божу.", group: "meaning" },
  { n: 9, title: "Бути коханим", text: "Відчувати любов близьких людей.", group: "love" },
  { n: 10, title: "Ввічливість", text: "Бути уважним, тактовним і чемним до інших.", group: "love" },
  { n: 11, title: "Вдячність", text: "Бути вдячним і цінувати те, що є.", group: "meaning" },
  { n: 12, title: "Веселощі", text: "Гратися, розважатися й веселитися.", group: "joy" },
  { n: 13, title: "Виклик", text: "Братися за складні завдання та проблеми.", group: "work" },
  { n: 14, title: "Відданість", text: "Брати на себе стійкі, значущі зобов'язання.", group: "love" },
  { n: 15, title: "Відкритість", text: "Бути відкритим до нового досвіду та ідей.", group: "growth" },
  { n: 16, title: "Відповідальність", text: "Ухвалювати та втілювати відповідальні рішення.", group: "work" },
  { n: 17, title: "Вірність", text: "Бути вірним і відданим у стосунках.", group: "love" },
  { n: 18, title: "Влада", text: "Мати вплив і контроль над процесами.", group: "order" },
  { n: 19, title: "Внесок", text: "Робити вагомий внесок у світ.", group: "care" },
  { n: 20, title: "Внутрішній спокій", text: "Відчувати душевний спокій і гармонію.", group: "meaning" },
  { n: 21, title: "Гнучкість", text: "Легко пристосовуватися до нових обставин.", group: "self" },
  { n: 22, title: "Гумор", text: "Бачити смішне в собі та навколишньому світі.", group: "joy" },
  { n: 23, title: "Дарувати любов", text: "Дарувати любов і турботу іншим.", group: "love" },
  { n: 24, title: "Дозвілля", text: "Знаходити час для відпочинку й насолоди.", group: "joy" },
  { n: 25, title: "Допитливість", text: "Шукати, досліджувати та пізнавати нове.", group: "growth" },
  { n: 26, title: "Досягнення", text: "Мати важливі досягнення.", group: "work" },
  { n: 27, title: "Дружба", text: "Мати близьких, вірних друзів.", group: "love" },
  { n: 28, title: "Духовність", text: "Зростати та розвиватися духовно.", group: "meaning" },
  { n: 29, title: "Екологія", text: "Жити в гармонії з довкіллям.", group: "care" },
  { n: 30, title: "Забезпечення", text: "Забезпечувати та піклуватися про добробут родини.", group: "care" },
  { n: 31, title: "Задоволення", text: "Відчувати приємні емоції та насолоду.", group: "joy" },
  { n: 32, title: "Захист", text: "Оберігати й тримати в безпеці тих, кого люблю.", group: "care" },
  { n: 33, title: "Здоров'я", text: "Бути фізично здоровим і почуватися добре.", group: "adventure" },
  { n: 34, title: "Знання", text: "Здобувати та поширювати цінні знання.", group: "growth" },
  { n: 35, title: "Інтелект", text: "Підтримувати гостроту й активність розуму.", group: "growth" },
  { n: 36, title: "Компроміс", text: "Бути готовим до взаємних поступок заради згоди.", group: "love" },
  { n: 37, title: "Комфорт", text: "Мати приємне й комфортне життя.", group: "joy" },
  { n: 38, title: "Краса", text: "Цінувати красу навколо себе.", group: "joy" },
  { n: 39, title: "Лідерство", text: "Надихати й вести за собою інших.", group: "work" },
  { n: 40, title: "Майстерність", text: "Бути компетентним у щоденній діяльності.", group: "work" },
  { n: 41, title: "Мир у світі", text: "Сприяти миру та злагоді у світі.", group: "care" },
  { n: 42, title: "Мистецтво", text: "Цінувати мистецтво або виражати себе в ньому.", group: "joy" },
  { n: 43, title: "Моногамія", text: "Мати єдині, глибокі любовні стосунки.", group: "love" },
  { n: 44, title: "Мужність", text: "Бути сміливим і стійким перед обличчям труднощів.", group: "self" },
  { n: 45, title: "Музика", text: "Насолоджуватися музикою або створювати її.", group: "joy" },
  { n: 46, title: "Надійність", text: "Бути надійним і вартим довіри.", group: "work" },
  { n: 47, title: "Надія", text: "Зберігати позитивний та оптимістичний погляд.", group: "meaning" },
  { n: 48, title: "Належність", text: "Відчувати приналежність, бути частиною спільноти.", group: "love" },
  { n: 49, title: "Незалежність", text: "Бути вільним від залежності від других.", group: "self" },
  { n: 50, title: "Новизна", text: "Мати життя, повне змін і розмаїття.", group: "adventure" },
  { n: 51, title: "Нонконформізм", text: "Піддавати сумніву авторитети та шаблони.", group: "self" },
  { n: 52, title: "Обов'язок", text: "Виконувати свої обов'язки та зобов'язання.", group: "work" },
  { n: 53, title: "Патріотизм", text: "Любити, захищати та підтримувати свою країну.", group: "care" },
  { n: 54, title: "Підтримка", text: "Заохочувати, надихати та підтримувати інших.", group: "care" },
  { n: 55, title: "Поміркованість", text: "Уникати крайнощів і знаходити золоту середину.", group: "order" },
  { n: 56, title: "Популярність", text: "Мати симпатію й визнання багатьох людей.", group: "order" },
  { n: 57, title: "Порядок", text: "Мати впорядковане та організоване життя.", group: "order" },
  { n: 58, title: "Практичність", text: "Орієнтуватися на раціональне й доцільне.", group: "order" },
  { n: 59, title: "Працьовитість", text: "Працювати наполегливо та якісно.", group: "work" },
  { n: 60, title: "Привабливість", text: "Бути фізично привабливим.", group: "adventure" },
  { n: 61, title: "Пригоди", text: "Отримувати новий і захопливий досвід.", group: "adventure" },
  { n: 62, title: "Призначення", text: "Мати сенс, мету та орієнтир у житті.", group: "meaning" },
  { n: 63, title: "Прийняття", text: "Бути прийнятим таким, який я є.", group: "love" },
  { n: 64, title: "Пристрасть", text: "Мати сильні почуття до справ, ідей чи людей.", group: "adventure" },
  { n: 65, title: "Простота", text: "Жити просто, без надмірних потреб.", group: "order" },
  { n: 66, title: "Прощення", text: "Прощати іншим їхні помилки.", group: "care" },
  { n: 67, title: "Раціональність", text: "Керуватися розумом, логікою та фактами.", group: "growth" },
  { n: 68, title: "Реалізм", text: "Бачити реальність без ілюзій і діяти прагматично.", group: "order" },
  { n: 69, title: "Ризик", text: "Йти на ризик і не боятися випробувати шанс.", group: "adventure" },
  { n: 70, title: "Розвиток", text: "Постійно змінюватися та зростати особистісно.", group: "growth" },
  { n: 71, title: "Романтика", text: "Мати яскраві, сповнені почуттів романтичні стосунки.", group: "love" },
  { n: 72, title: "Самоконтроль", text: "Бути дисциплінованим у власних діях.", group: "meaning" },
  { n: 73, title: "Самопізнання", text: "Глибоко й чесно розуміти себе.", group: "self" },
  { n: 74, title: "Самоповага", text: "Поважати себе та відчувати власну гідність.", group: "self" },
  { n: 75, title: "Самоприйняття", text: "Приймати себе з усіма особливостями.", group: "self" },
  { n: 76, title: "Свобода", text: "Бути вільним від зайвих обмежень.", group: "self" },
  { n: 77, title: "Сексуальність", text: "Мати активне та гармонійне інтимне життя.", group: "adventure" },
  { n: 78, title: "Сім'я", text: "Мати щасливу, люблячу родину.", group: "love" },
  { n: 79, title: "Складність", text: "Приймати всю багатогранність і тонкощі життя.", group: "growth" },
  { n: 80, title: "Скромність", text: "Бути скромним і невибагливим.", group: "self" },
  { n: 81, title: "Слава", text: "Бути відомим і визнаним.", group: "order" },
  { n: 82, title: "Служіння", text: "Бути корисним і служити іншим людям.", group: "care" },
  { n: 83, title: "Співпраця", text: "Працювати злагоджено та спільно з іншими.", group: "love" },
  { n: 84, title: "Співчуття", text: "Відчувати співчуття та діяти з турботою про інших.", group: "care" },
  { n: 85, title: "Справедливість", text: "Сприяти справедливому та рівному ставленню до всіх.", group: "care" },
  { n: 86, title: "Стабільність", text: "Мати надійне, передбачуване й стійке життя.", group: "order" },
  { n: 87, title: "Старанність", text: "Бути ретельним і сумлінним у всьому, що я роблю.", group: "work" },
  { n: 88, title: "Творчість", text: "Створювати нові речі або ідеї.", group: "joy" },
  { n: 89, title: "Толерантність", text: "Приймати та поважати тих, хто відрізняється.", group: "care" },
  { n: 90, title: "Точність", text: "Бути точним у своїх думках і переконаннях.", group: "growth" },
  { n: 91, title: "Традиції", text: "Шанувати та продовжувати звичаї минулого.", group: "meaning" },
  { n: 92, title: "Турбота", text: "Піклуватися про інших.", group: "care" },
  { n: 93, title: "Усамітнення", text: "Мати власний простір і час наодинці з собою.", group: "self" },
  { n: 94, title: "Усвідомленість", text: "Жити свідомо й бути в теперішньому моменті.", group: "meaning" },
  { n: 95, title: "Уява", text: "Мріяти та бачити нові можливості.", group: "growth" },
  { n: 96, title: "Фізична форма", text: "Бути фізично сильним і тренованим.", group: "adventure" },
  { n: 97, title: "Цілісність", text: "Жити згідно зі своїми цінностями та принципами.", group: "meaning" },
  { n: 98, title: "Чесність", text: "Бути чесним і правдивим.", group: "meaning" },
  { n: 99, title: "Чеснота", text: "Жити високоморальним і гідним життям.", group: "meaning" },
  { n: 100, title: "Щедрість", text: "Ділитися тим, що маю, з іншими.", group: "care" }
];

const STORAGE_KEY = "values_card_sort_state_v1";

const app = document.querySelector(".app");
const board = document.getElementById("board");
const canvas = document.getElementById("canvas");
const bankCards = document.getElementById("bank-cards");
const bank = document.getElementById("bank");
const splitter = document.getElementById("splitter");
const saveBtn = document.getElementById("save-btn");
const resetBtn = document.getElementById("reset-btn");
const resetModal = document.getElementById("reset-modal");
const btnCancelReset = document.getElementById("btn-cancel-reset");
const btnConfirmReset = document.getElementById("btn-confirm-reset");
const bankHead = bank ? bank.querySelector(".bank-head") : null;

const CARD_W = 148;
const CARD_H = 78;
const CANVAS_MIN = 2400;
const COLUMN_COUNT = 5;
const BOARD_INSET = 4;
const CARD_BOTTOM_SPACE = 80;
const MAX_CARD_TOP = 12000;
const COLLAPSE_DRAG_SNAP = 4;

// Populate bank cards
VALUES.forEach((v) => {
  const el = document.createElement("article");
  el.className = "card " + (GROUPS[v.group] || "group-self");
  el.dataset.n = String(v.n);
  el.innerHTML =
    '<span class="num">' + v.n + "</span>" +
    "<h2>" + v.title + "</h2>" +
    "<p>" + v.text + "</p>";
  bankCards.appendChild(el);
});

let drag = null;
let resizing = false;
let lastPoint = { x: 0, y: 0 };
let scrollRaf = 0;
let resizeRaf = 0;
let lastCanvasWidth = 0;
let lastBankHeadHeight = 0;
let boardRatio = 0.45;
let expandedBoardRatio = boardRatio;
let bankCollapsed = false;
let resizeStartY = null;

function clamp(value, min, max) {
  return Math.max(min, Math.min(value, max));
}

function finiteNumber(value, fallback) {
  const number = Number.parseFloat(value);
  return Number.isFinite(number) ? number : fallback;
}

function cardSize(card) {
  return {
    width: card.offsetWidth || CARD_W,
    height: card.offsetHeight || CARD_H
  };
}

function layoutFromLeft(left, cardWidth, canvasWidth) {
  const width = Math.max(1, canvasWidth);
  const columnWidth = width / COLUMN_COUNT;
  const center = clamp(left + cardWidth / 2, 0, width);
  const columnPosition = clamp(center / columnWidth, 0, COLUMN_COUNT - Number.EPSILON);
  const zone = Math.min(COLUMN_COUNT - 1, Math.floor(columnPosition));
  return {
    zone,
    xRatio: clamp(columnPosition - zone, 0, 1)
  };
}

function setCardLayout(card, zone, xRatio, top) {
  const safeZone = clamp(Math.round(finiteNumber(zone, 0)), 0, COLUMN_COUNT - 1);
  const safeRatio = clamp(finiteNumber(xRatio, 0.5), 0, 1);
  const safeTop = clamp(finiteNumber(top, 6), 6, MAX_CARD_TOP);
  const { width: cardWidth } = cardSize(card);
  const canvasWidth = Math.max(1, canvas.clientWidth);
  const columnWidth = canvasWidth / COLUMN_COUNT;
  const center = (safeZone + safeRatio) * columnWidth;
  const maxLeft = Math.max(BOARD_INSET, canvasWidth - cardWidth - BOARD_INSET);
  const left = clamp(center - cardWidth / 2, BOARD_INSET, maxLeft);

  card.dataset.zone = String(safeZone);
  card.dataset.xRatio = String(safeRatio);
  card.style.left = left + "px";
  card.style.top = safeTop + "px";
}

function captureCardLayout(card, left) {
  const { width } = cardSize(card);
  const layout = layoutFromLeft(left, width, canvas.clientWidth);
  card.dataset.zone = String(layout.zone);
  card.dataset.xRatio = String(layout.xRatio);
  return layout;
}

function ensureCanvasHeight() {
  let needed = CANVAS_MIN;
  canvas.querySelectorAll(".card").forEach((card) => {
    const top = finiteNumber(card.style.top, 6);
    needed = Math.max(needed, Math.ceil(top + cardSize(card).height + CARD_BOTTOM_SPACE));
  });
  canvas.style.minHeight = Math.min(needed, MAX_CARD_TOP + CARD_H + CARD_BOTTOM_SPACE) + "px";
}

function getBoardHeightBounds() {
  const totalHeight = Math.max(1, app ? app.clientHeight : window.innerHeight || 800);
  const splitHeight = splitter ? (splitter.offsetHeight || 10) : 10;
  const usableHeight = Math.max(1, totalHeight - splitHeight);
  const minBoard = Math.max(80, Math.min(160, usableHeight * 0.2));
  const headH = bankHead ? bankHead.offsetHeight : 54;
  const desiredBank = Math.max(120, headH + 80);
  const minBank = Math.min(desiredBank, Math.max(1, usableHeight - minBoard));
  const maxBoard = Math.max(minBoard, usableHeight - minBank);
  return { usableHeight, minBoard, maxBoard };
}

function applyBoardRatio() {
  const bounds = getBoardHeightBounds();
  const headH = bankHead ? bankHead.offsetHeight : 54;
  const height = bankCollapsed
    ? Math.max(0, bounds.usableHeight - headH)
    : clamp(bounds.usableHeight * boardRatio, bounds.minBoard, bounds.maxBoard);
  if (app) {
    app.style.setProperty("--board-h", height + "px");
  }
  if (splitter) {
    splitter.setAttribute("aria-valuenow", String(Math.round(height / bounds.usableHeight * 100)));
    splitter.setAttribute("aria-expanded", String(!bankCollapsed));
    splitter.title = bankCollapsed
      ? "Подвійний клік — розгорнути банк"
      : "Подвійний клік — згорнути банк";
  }
}

function setBankCollapsed(collapsed, shouldSave = true) {
  const next = Boolean(collapsed);
  if (next === bankCollapsed) return;
  if (next) {
    expandedBoardRatio = boardRatio;
  } else {
    boardRatio = expandedBoardRatio;
  }
  bankCollapsed = next;
  if (app) {
    app.classList.toggle("bank-collapsed", bankCollapsed);
  }
  applyBoardRatio();
  if (shouldSave) saveState();
}

function reflowPlacedCards() {
  canvas.querySelectorAll(".card").forEach((card) => {
    const left = finiteNumber(card.style.left, BOARD_INSET);
    const storedZone = Number.parseInt(card.dataset.zone, 10);
    const storedRatio = Number.parseFloat(card.dataset.xRatio);
    const layout = Number.isInteger(storedZone) && Number.isFinite(storedRatio)
      ? { zone: storedZone, xRatio: storedRatio }
      : captureCardLayout(card, left);
    setCardLayout(card, layout.zone, layout.xRatio, card.style.top);
  });
  ensureCanvasHeight();
}

function scheduleResponsiveLayout(shouldSave = true) {
  if (resizeRaf) cancelAnimationFrame(resizeRaf);
  resizeRaf = requestAnimationFrame(() => {
    resizeRaf = 0;
    applyBoardRatio();
    if (!drag) reflowPlacedCards();
    lastCanvasWidth = canvas ? canvas.clientWidth : 0;
    lastBankHeadHeight = bankHead ? bankHead.offsetHeight : 0;
    if (shouldSave && !drag && !resizing) saveState();
  });
}

function updateBankCount() {
  const bankCountEl = document.getElementById("bank-count");
  if (!bankCountEl || !bankCards) return;
  const count = bankCards.querySelectorAll(".card").length;
  bankCountEl.textContent = `(${count}/100)`;
}

function updateZIndices() {
  const cards = Array.from(canvas.querySelectorAll(".card"));
  cards.sort((a, b) => {
    const topA = parseFloat(a.style.top) || 0;
    const topB = parseFloat(b.style.top) || 0;
    if (topA !== topB) return topA - topB;
    const leftA = parseFloat(a.style.left) || 0;
    const leftB = parseFloat(b.style.left) || 0;
    return leftA - leftB;
  });
  cards.forEach((card, i) => {
    card.style.zIndex = String(10 + i);
  });
}

function saveState() {
  try {
    const cards = [];
    const canvasCards = canvas.querySelectorAll(".card");
    canvasCards.forEach((card) => {
      cards.push({
        n: Number(card.dataset.n),
        left: card.style.left,
        top: card.style.top,
        zone: finiteNumber(card.dataset.zone, 0),
        xRatio: finiteNumber(card.dataset.xRatio, 0.5),
        zIndex: card.style.zIndex || "10"
      });
    });
    const state = {
      version: 2,
      cards,
      canvasMinHeight: canvas ? canvas.style.minHeight : "",
      canvasWidth: canvas ? canvas.clientWidth : 0,
      boardH: app ? app.style.getPropertyValue("--board-h") : "",
      boardRatio,
      expandedBoardRatio,
      bankCollapsed
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.warn("Failed to save state to localStorage", e);
  }
}

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      updateBankCount();
      return;
    }
    const state = JSON.parse(raw);
    const savedRatio = finiteNumber(state.boardRatio, NaN);
    const oldBoardHeight = finiteNumber(state.boardH, NaN);
    boardRatio = Number.isFinite(savedRatio)
      ? clamp(savedRatio, 0.15, 0.75)
      : Number.isFinite(oldBoardHeight)
        ? clamp(oldBoardHeight / Math.max(1, app ? app.clientHeight : 800), 0.15, 0.75)
        : 0.45;
    expandedBoardRatio = clamp(finiteNumber(state.expandedBoardRatio, boardRatio), 0.15, 0.75);
    bankCollapsed = state.bankCollapsed === true;
    if (app) {
      app.classList.toggle("bank-collapsed", bankCollapsed);
    }
    applyBoardRatio();
    if (Array.isArray(state.cards) && state.cards.length > 0) {
      const savedCards = state.cards.slice(0, VALUES.length);
      const maxLegacyLeft = savedCards.reduce((max, item) => {
        return Math.max(max, finiteNumber(item && item.left, 0));
      }, 0);
      const savedCanvasWidth = finiteNumber(state.canvasWidth, NaN);
      const layoutWidth = Number.isFinite(savedCanvasWidth)
        ? Math.max(1, savedCanvasWidth)
        : Math.max(canvas.clientWidth, maxLegacyLeft + CARD_W + BOARD_INSET);
      savedCards.forEach((item) => {
        const itemNumber = Number(item && item.n);
        if (!Number.isInteger(itemNumber) || itemNumber < 1 || itemNumber > VALUES.length) return;
        const card = bankCards.querySelector(`.card[data-n="${itemNumber}"]`);
        if (card) {
          canvas.appendChild(card);
          card.style.position = "absolute";
          const oldLeft = finiteNumber(item.left, BOARD_INSET);
          const oldCardWidth = state.version >= 2
            ? clamp(layoutWidth * 0.2 - 12, 112, CARD_W)
            : CARD_W;
          const legacyLayout = layoutFromLeft(oldLeft, oldCardWidth, layoutWidth);
          const zone = Number.isFinite(Number(item.zone)) ? item.zone : legacyLayout.zone;
          const xRatio = Number.isFinite(Number(item.xRatio)) ? item.xRatio : legacyLayout.xRatio;
          setCardLayout(card, zone, xRatio, item.top);
        }
      });
      updateZIndices();
    }
    ensureCanvasHeight();
    updateBankCount();
  } catch (e) {
    console.warn("Failed to load state from localStorage", e);
    updateBankCount();
  }
}

function setBoardHeight(clientY) {
  const rect = app.getBoundingClientRect();
  const split = splitter.offsetHeight || 10;
  const bounds = getBoardHeightBounds();
  const requestedHeight = clientY - rect.top - split / 2;
  const headH = bankHead ? bankHead.offsetHeight : 54;
  const collapsedHeight = Math.max(0, bounds.usableHeight - headH);

  if (requestedHeight >= collapsedHeight - COLLAPSE_DRAG_SNAP) {
    if (!bankCollapsed) setBankCollapsed(true, false);
    return;
  }
  if (bankCollapsed) setBankCollapsed(false, false);

  let h = requestedHeight;
  h = clamp(h, bounds.minBoard, collapsedHeight);
  if (h <= bounds.maxBoard) {
    boardRatio = h / bounds.usableHeight;
    expandedBoardRatio = boardRatio;
  }
  app.style.setProperty("--board-h", h + "px");
  splitter.setAttribute("aria-valuenow", String(Math.round(h / bounds.usableHeight * 100)));
}

if (splitter) {
  splitter.addEventListener("pointerdown", (e) => {
    e.preventDefault();
    e.stopPropagation();
    resizing = true;
    resizeStartY = e.clientY;
    document.body.classList.add("is-resizing");
    splitter.setPointerCapture(e.pointerId);
  });

  splitter.addEventListener("dblclick", (e) => {
    e.preventDefault();
    setBankCollapsed(!bankCollapsed);
  });

  splitter.addEventListener("keydown", (e) => {
    if (["Enter", " "].includes(e.key)) {
      e.preventDefault();
      setBankCollapsed(!bankCollapsed);
      return;
    }
    if (!["ArrowUp", "ArrowDown", "Home", "End"].includes(e.key)) return;
    e.preventDefault();
    if (bankCollapsed) setBankCollapsed(false, false);
    const bounds = getBoardHeightBounds();
    let height = bounds.usableHeight * boardRatio;
    if (e.key === "ArrowUp") height -= e.shiftKey ? 40 : 12;
    if (e.key === "ArrowDown") height += e.shiftKey ? 40 : 12;
    if (e.key === "Home") height = bounds.minBoard;
    if (e.key === "End") height = bounds.maxBoard;
    height = clamp(height, bounds.minBoard, bounds.maxBoard);
    boardRatio = height / bounds.usableHeight;
    expandedBoardRatio = boardRatio;
    applyBoardRatio();
    saveState();
  });
}

function pointIn(el, x, y) {
  const r = el.getBoundingClientRect();
  return x >= r.left && x <= r.right && y >= r.top && y <= r.bottom;
}

function autoScroll() {
  if (!drag) {
    scrollRaf = 0;
    return;
  }
  const r = board.getBoundingClientRect();
  const x = lastPoint.x;
  const y = lastPoint.y;
  const edge = 48;
  if (y >= r.top && y <= r.bottom) {
    if (y > r.bottom - edge) board.scrollTop += 14;
    else if (y < r.top + edge) board.scrollTop -= 14;
    if (x > r.right - edge) board.scrollLeft += 14;
    else if (x < r.left + edge) board.scrollLeft -= 14;
  }
  scrollRaf = requestAnimationFrame(autoScroll);
}

function placeOnBoard(card, clientX, clientY, anchorX, anchorY) {
  const canvasRect = canvas.getBoundingClientRect();
  canvas.appendChild(card);
  card.style.position = "absolute";
  card.style.transform = "";
  card.style.width = "";
  card.style.height = "";
  const size = cardSize(card);
  const proposedLeft = clientX - anchorX * size.width - canvasRect.left;
  const top = clamp(clientY - anchorY * size.height - canvasRect.top, 6, MAX_CARD_TOP);
  const layout = layoutFromLeft(proposedLeft, size.width, canvas.clientWidth);
  setCardLayout(card, layout.zone, layout.xRatio, top);
  ensureCanvasHeight();
  updateZIndices();
  updateBankCount();
  saveState();
}

function returnToBank(card) {
  card.style.position = "";
  card.style.left = "";
  card.style.top = "";
  card.style.zIndex = "";
  card.style.transform = "";
  card.style.width = "";
  card.style.height = "";
  delete card.dataset.zone;
  delete card.dataset.xRatio;

  const num = Number(card.dataset.n);
  const children = Array.from(bankCards.querySelectorAll(".card"));
  const nextSibling = children.find((c) => Number(c.dataset.n) > num);
  if (nextSibling) {
    bankCards.insertBefore(card, nextSibling);
  } else {
    bankCards.appendChild(card);
  }
  updateZIndices();
  ensureCanvasHeight();
  updateBankCount();
  saveState();
}

function resetAllCards() {
  // If bank was collapsed, expand it so cards are immediately visible
  if (bankCollapsed) {
    setBankCollapsed(false, false);
  }
  const placedCards = Array.from(canvas.querySelectorAll(".card"));
  placedCards.forEach((card) => {
    card.style.position = "";
    card.style.left = "";
    card.style.top = "";
    card.style.zIndex = "";
    card.style.transform = "";
    card.style.width = "";
    card.style.height = "";
    delete card.dataset.zone;
    delete card.dataset.xRatio;
  });

  const allCards = Array.from(bankCards.children).concat(placedCards);
  allCards.sort((a, b) => Number(a.dataset.n) - Number(b.dataset.n));
  allCards.forEach((c) => bankCards.appendChild(c));

  canvas.style.minHeight = CANVAS_MIN + "px";
  updateBankCount();
  saveState();
}

function openResetModal() {
  if (resetModal) {
    resetModal.classList.add("is-open");
    resetModal.setAttribute("aria-hidden", "false");
    if (btnCancelReset) btnCancelReset.focus();
  }
}

function closeResetModal() {
  if (resetModal) {
    resetModal.classList.remove("is-open");
    resetModal.setAttribute("aria-hidden", "true");
  }
}

function wrapText(ctx, text, maxWidth) {
  const words = text.split(" ");
  const lines = [];
  let currentLine = "";

  for (let i = 0; i < words.length; i++) {
    const word = words[i];
    const testLine = currentLine ? currentLine + " " + word : word;
    const testWidth = ctx.measureText(testLine).width;
    if (testWidth > maxWidth && currentLine) {
      lines.push(currentLine);
      currentLine = word;
    } else {
      currentLine = testLine;
    }
  }
  if (currentLine) lines.push(currentLine);
  return lines;
}

function exportBoardToPng() {
  const placedCards = Array.from(canvas.querySelectorAll(".card"));
  const labelH = 28;
  const width = Math.max(1000, canvas.clientWidth || board.clientWidth || 1200);

  let maxCardBottom = 350;
  placedCards.forEach((c) => {
    const top = parseFloat(c.style.top) || 0;
    const bottom = top + CARD_H + 30;
    if (bottom > maxCardBottom) maxCardBottom = bottom;
  });
  const contentHeight = Math.max(board.clientHeight || 500, Math.ceil(maxCardBottom));
  const totalHeight = contentHeight + labelH;

  const dpr = Math.max(1, Math.min(2, 16000 / width, 16000 / totalHeight));
  const cvs = document.createElement("canvas");
  cvs.width = width * dpr;
  cvs.height = totalHeight * dpr;
  const ctx = cvs.getContext("2d");
  if (!ctx) return;
  ctx.scale(dpr, dpr);

  const colW = width / 5;
  const ZONE_COLORS = ["#e4ded4", "#ded7ca", "#d9cfbf", "#d6c6b0", "#d4bfa1"];

  // 1. Draw 5 column backgrounds below the header (from y = labelH)
  for (let i = 0; i < 5; i++) {
    ctx.fillStyle = ZONE_COLORS[i];
    ctx.fillRect(i * colW, labelH, colW, contentHeight);

    // Horizontal grid lines
    ctx.strokeStyle = "rgba(92, 86, 74, 0.14)";
    ctx.lineWidth = 1;
    for (let gy = labelH + 48; gy < totalHeight; gy += 48) {
      ctx.beginPath();
      ctx.moveTo(i * colW, gy);
      ctx.lineTo((i + 1) * colW, gy);
      ctx.stroke();
    }

    // Vertical column divider (dashed)
    if (i < 4) {
      ctx.save();
      ctx.strokeStyle = "#b7b0a3";
      ctx.setLineDash([10, 4]);
      ctx.beginPath();
      ctx.moveTo((i + 1) * colW, labelH);
      ctx.lineTo((i + 1) * colW, totalHeight);
      ctx.stroke();
      ctx.restore();
    }
  }

  // 2. Draw Cards sorted by zIndex with y offset = labelH
  const sortedCards = [...placedCards].sort((a, b) => {
    return (parseInt(a.style.zIndex, 10) || 0) - (parseInt(b.style.zIndex, 10) || 0);
  });

  const GROUP_STYLES = {
    "group-self": { bg: "#f8e8de", border: "#e4c4b2", accent: "#c45c38" },
    "group-love": { bg: "#f8e3ea", border: "#e5b8c6", accent: "#c4496a" },
    "group-care": { bg: "#e3f0e6", border: "#b5d0bc", accent: "#3d8a58" },
    "group-growth": { bg: "#e2eef8", border: "#b4cce0", accent: "#3a74a8" },
    "group-work": { bg: "#f6ead4", border: "#e0c896", accent: "#b57a1c" },
    "group-adventure": { bg: "#f6e3d4", border: "#e0b894", accent: "#d0662c" },
    "group-joy": { bg: "#eee4f6", border: "#cdb8e0", accent: "#7a4eab" },
    "group-meaning": { bg: "#e4e6f4", border: "#b8bcd8", accent: "#4d5494" },
    "group-order": { bg: "#e8eaed", border: "#c5c9d0", accent: "#5c6573" }
  };

  const drawRound = (rx, ry, rw, rh, rr) => {
    if (ctx.roundRect) {
      ctx.beginPath();
      ctx.roundRect(rx, ry, rw, rh, rr);
    } else {
      ctx.beginPath();
      ctx.moveTo(rx + rr, ry);
      ctx.arcTo(rx + rw, ry, rx + rw, ry + rh, rr);
      ctx.arcTo(rx + rw, ry + rh, rx, ry + rh, rr);
      ctx.arcTo(rx, ry + rh, rx, ry, rr);
      ctx.arcTo(rx, ry, rx + rw, ry, rr);
      ctx.closePath();
    }
  };

  sortedCards.forEach((card) => {
    const zone = Number.parseInt(card.dataset.zone, 10);
    const xRatio = Number.parseFloat(card.dataset.xRatio);
    const fallbackX = finiteNumber(card.style.left, 0) * width / Math.max(1, canvas.clientWidth);
    const center = (zone + xRatio) * colW;
    const x = Number.isInteger(zone) && Number.isFinite(xRatio)
      ? clamp(center - CARD_W / 2, BOARD_INSET, width - CARD_W - BOARD_INSET)
      : clamp(fallbackX, BOARD_INSET, width - CARD_W - BOARD_INSET);
    const rawY = parseFloat(card.style.top) || 0;
    const y = rawY + labelH;
    const w = CARD_W;
    const h = CARD_H;
    const r = 8;

    let style = { bg: "#ffffff", border: "#cccccc", accent: "#333333" };
    for (const [cls, st] of Object.entries(GROUP_STYLES)) {
      if (card.classList.contains(cls)) {
        style = st;
        break;
      }
    }

    // Card shadow
    ctx.save();
    ctx.shadowColor = "rgba(44, 40, 31, 0.12)";
    ctx.shadowBlur = 4;
    ctx.shadowOffsetY = 2;

    // Card background
    ctx.fillStyle = style.bg;
    drawRound(x, y, w, h, r);
    ctx.fill();
    ctx.restore();

    // Card border
    ctx.strokeStyle = style.border;
    ctx.lineWidth = 1;
    drawRound(x, y, w, h, r);
    ctx.stroke();

    // Accent strip (left 4px)
    ctx.save();
    drawRound(x, y, w, h, r);
    ctx.clip();
    ctx.fillStyle = style.accent;
    ctx.fillRect(x, y, 4, h);
    ctx.restore();

    // Card number
    const numEl = card.querySelector(".num");
    if (numEl) {
      ctx.fillStyle = style.accent;
      ctx.font = "600 10px Outfit, 'Segoe UI', system-ui, sans-serif";
      ctx.textAlign = "right";
      ctx.textBaseline = "top";
      ctx.fillText(numEl.textContent.trim(), x + w - 8, y + 6);
    }

    // Card title (with 2-line wrapping support for long titles)
    const h2El = card.querySelector("h2");
    let textStartY = y + 24;
    if (h2El) {
      ctx.fillStyle = "#2c281f";
      ctx.font = "600 11px Outfit, 'Segoe UI', system-ui, sans-serif";
      ctx.textAlign = "left";
      ctx.textBaseline = "top";
      const titleLines = wrapText(ctx, h2El.textContent.trim().toUpperCase(), w - 30);
      titleLines.slice(0, 2).forEach((tLine, tIdx) => {
        ctx.fillText(tLine, x + 12, y + 6 + tIdx * 12);
      });
      textStartY = y + 8 + Math.min(2, titleLines.length) * 12;
    }

    // Card text
    const pEl = card.querySelector("p");
    if (pEl) {
      ctx.fillStyle = "#4f4a42";
      ctx.font = "400 10px Outfit, 'Segoe UI', system-ui, sans-serif";
      ctx.textAlign = "left";
      ctx.textBaseline = "top";
      const lines = wrapText(ctx, pEl.textContent.trim(), w - 20);
      lines.slice(0, 3).forEach((line, idx) => {
        ctx.fillText(line, x + 12, textStartY + idx * 12.5);
      });
    }
  });

  // 3. Draw Header bar at the top (0 to labelH)
  ctx.fillStyle = "#e7e1d5";
  ctx.fillRect(0, 0, width, labelH);
  ctx.strokeStyle = "rgba(183, 176, 163, 0.5)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(0, labelH);
  ctx.lineTo(width, labelH);
  ctx.stroke();

  const labels = [
    "Не важливо для мене",
    "Дещо важливо для мене",
    "Важливо для мене",
    "Дуже важливо для мене",
    "Найважливіше для мене"
  ];

  ctx.fillStyle = "#4a453c";
  ctx.font = "bold 11px Fraunces, Georgia, serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  labels.forEach((text, i) => {
    const cx = i * colW + colW / 2;
    ctx.fillText(text, cx, labelH / 2);
  });

  // 4. Download as PNG
  cvs.toBlob((blob) => {
    if (!blob) return;
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "values_board.png";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }, "image/png");
}

if (saveBtn) {
  saveBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    exportBoardToPng();
  });
}

if (resetBtn) {
  resetBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    openResetModal();
  });
}

if (btnCancelReset) {
  btnCancelReset.addEventListener("click", closeResetModal);
}

if (btnConfirmReset) {
  btnConfirmReset.addEventListener("click", () => {
    resetAllCards();
    closeResetModal();
  });
}

if (resetModal) {
  resetModal.addEventListener("click", (e) => {
    if (e.target === resetModal) {
      closeResetModal();
    }
  });
}

document.addEventListener("keydown", (e) => {
  if (resetModal && resetModal.classList.contains("is-open")) {
    if (e.key === "Escape") {
      closeResetModal();
    } else if (e.key === "Enter") {
      if (document.activeElement === btnCancelReset) {
        closeResetModal();
      } else {
        resetAllCards();
        closeResetModal();
      }
    }
  }
});

document.addEventListener("pointerdown", (e) => {
  if (
    resizing ||
    e.target.closest("#splitter") ||
    e.target.closest("#save-btn") ||
    e.target.closest("#reset-btn") ||
    e.target.closest("#reset-modal")
  ) {
    return;
  }
  const card = e.target.closest(".card");
  if (!card) return;
  e.preventDefault();
  const rect = card.getBoundingClientRect();
  const fromBoard = card.parentElement === canvas;
  drag = {
    card,
    anchorX: clamp((e.clientX - rect.left) / Math.max(1, rect.width), 0, 1),
    anchorY: clamp((e.clientY - rect.top) / Math.max(1, rect.height), 0, 1),
    origin: fromBoard
      ? {
          type: "board",
          zone: finiteNumber(card.dataset.zone, 0),
          xRatio: finiteNumber(card.dataset.xRatio, 0.5),
          top: finiteNumber(card.style.top, 6)
        }
      : { type: "bank" }
  };
  lastPoint = { x: e.clientX, y: e.clientY };
  card.classList.add("dragging");
  document.body.appendChild(card);
  card.style.position = "fixed";
  card.style.left = rect.left + "px";
  card.style.top = rect.top + "px";
  card.style.width = rect.width + "px";
  card.style.height = rect.height + "px";
  card.style.zIndex = "2000";
  card.setPointerCapture(e.pointerId);
  if (!scrollRaf) scrollRaf = requestAnimationFrame(autoScroll);
});

document.addEventListener("pointermove", (e) => {
  if (resizing) {
    if (resizeStartY !== null && Math.abs(e.clientY - resizeStartY) < 3) return;
    setBoardHeight(e.clientY);
    return;
  }
  if (!drag) return;
  lastPoint = { x: e.clientX, y: e.clientY };
  drag.card.style.left = e.clientX - drag.anchorX * drag.card.offsetWidth + "px";
  drag.card.style.top = e.clientY - drag.anchorY * drag.card.offsetHeight + "px";
});

function endDrag(e) {
  if (resizing) {
    resizing = false;
    resizeStartY = null;
    document.body.classList.remove("is-resizing");
    if (!bankCollapsed) applyBoardRatio();
    saveState();
    return;
  }
  if (!drag) return;
  const { card, anchorX, anchorY } = drag;
  const x = e.clientX ?? lastPoint.x;
  const y = e.clientY ?? lastPoint.y;
  card.classList.remove("dragging");
  card.style.width = "";
  card.style.height = "";
  if (pointIn(board, x, y)) {
    placeOnBoard(card, x, y, anchorX, anchorY);
  } else {
    returnToBank(card);
  }
  drag = null;
  reflowPlacedCards();
  saveState();
}

function cancelDrag() {
  if (resizing) {
    resizing = false;
    resizeStartY = null;
    document.body.classList.remove("is-resizing");
    applyBoardRatio();
    saveState();
  }
  if (!drag) return;
  const { card, origin } = drag;
  card.classList.remove("dragging");
  card.style.transform = "";
  card.style.width = "";
  card.style.height = "";
  if (origin.type === "board") {
    canvas.appendChild(card);
    card.style.position = "absolute";
    setCardLayout(card, origin.zone, origin.xRatio, origin.top);
    ensureCanvasHeight();
    updateZIndices();
  } else {
    returnToBank(card);
  }
  drag = null;
  reflowPlacedCards();
  updateBankCount();
  saveState();
}

document.addEventListener("pointerup", endDrag);
document.addEventListener("pointercancel", cancelDrag);
window.addEventListener("blur", cancelDrag);
document.addEventListener("visibilitychange", () => {
  if (document.hidden) cancelDrag();
});
window.addEventListener("resize", () => scheduleResponsiveLayout());
window.addEventListener("orientationchange", () => scheduleResponsiveLayout());
if (window.visualViewport) {
  window.visualViewport.addEventListener("resize", () => scheduleResponsiveLayout());
}

if ("ResizeObserver" in window) {
  const layoutObserver = new ResizeObserver(() => {
    const widthChanged = canvas ? (canvas.clientWidth !== lastCanvasWidth) : false;
    const bankHeadChanged = bankHead ? (bankHead.offsetHeight !== lastBankHeadHeight) : false;
    if (widthChanged || bankHeadChanged) scheduleResponsiveLayout();
  });
  if (canvas) layoutObserver.observe(canvas);
  if (bankHead) layoutObserver.observe(bankHead);
}

// Restore saved state on page load
loadState();
lastCanvasWidth = canvas ? canvas.clientWidth : 0;
lastBankHeadHeight = bankHead ? bankHead.offsetHeight : 0;
scheduleResponsiveLayout(false);
