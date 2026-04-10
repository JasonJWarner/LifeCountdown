// ===== DATA =====
const DEFAULT_CATS = [
  { key:'sleep',    label:'睡眠',   icon:'😴', color:'#3d4f65', defaultVal:8   },
  { key:'eat',      label:'吃饭',   icon:'🍽', color:'#c9956b', defaultVal:2   },
  { key:'commute',  label:'通勤',   icon:'🚌', color:'#5a5a6a', defaultVal:1.5},
  { key:'work',     label:'工作',   icon:'💼', color:'#6a7a8a', defaultVal:8   },
  { key:'read',     label:'看书',   icon:'📖', color:'#5a9e85', defaultVal:0   },
  { key:'cook',     label:'做饭',   icon:'🍳', color:'#9e6a5a', defaultVal:0   },
  { key:'exercise', label:'健身',   icon:'💪', color:'#5a9e5a', defaultVal:0   },
  { key:'leisure',  label:'休闲',   icon:'🎮', color:'#7a5a9e', defaultVal:0   },
  { key:'social',   label:'社交',   icon:'👥', color:'#9e5a7a', defaultVal:0   },
  { key:'shopping', label:'购物',   icon:'🛒', color:'#9e8a5a', defaultVal:0   },
];
const EMOJI_POOL = ['😴','🍽','🚌','💼','📖','🍳','💪','🎮','👥','🛒','☕','🏃','🎵','✈️','🎬','📱','🎯','🌿','💡','🎨','🏠','🔧','📝','🌙','⌛','🔥','🌈','⭐','🍀','🎁','🏆','🎭','💎','🌺','🦋','🎸'];
const QUOTES = [
  { text:"把每一天当作生命中的最后一天来过，终有一天你会发现自己是对的。", author:"Steve Jobs" },
  { text:"生命不是要等暴风雨过去，而是要学会在雨中翩翩起舞。", author:"维维安·格林" },
  { text:"我们不能决定生命的长度，但可以决定它的宽度与深度。", author:"佚名" },
  { text:"人生天地之间，若白驹之过隙，忽然而已。", author:"庄子" },
  { text:"不乱于心，不困于情，不畏将来，不念过往。", author:"丰子恺" },
  { text:"及时当勉励，岁月不待人。", author:"陶渊明" },
  { text:"生如夏花之绚烂，死如秋叶之静美。", author:"泰戈尔" },
  { text:"过去属于死神，未来属于你自己。", author:"雪莱" },
  { text:"未知生，焉知死。", author:"孔子" },
  { text:"一万年太久，只争朝夕。", author:"毛泽东" },
  { text:"人生得意须尽欢，莫使金樽空对月。", author:"李白" },
];
const LS_KEY = 'life_countdown_config';

// ===== CONFIG =====
function loadConfig() { try { return JSON.parse(localStorage.getItem(LS_KEY)); } catch { return null; } }
function saveConfig(c) { localStorage.setItem(LS_KEY, JSON.stringify(c)); }

function buildCatMap(cfg) {
  const map = {};
  DEFAULT_CATS.forEach(c => { map[c.key] = { ...c }; });
  if (cfg?.catOverrides) {
    Object.entries(cfg.catOverrides).forEach(([k, ov]) => {
      if (map[k]) { map[k].label = ov.label ?? map[k].label; map[k].icon = ov.icon ?? map[k].icon; map[k].color = ov.color ?? map[k].color; map[k].defaultVal = ov.defaultVal ?? map[k].defaultVal; }
    });
  }
  if (cfg?.customCats) cfg.customCats.forEach(c => { map[c.key] = { ...c }; });
  return map;
}

function getEnabled(cfg) { return cfg?.enabledCats || DEFAULT_CATS.map(c => c.key); }
function getHours(cfg, catMap) {
  if (cfg?.catHours) return cfg.catHours;
  const h = {};
  Object.values(catMap).forEach(c => { h[c.key] = c.defaultVal; });
  return h;
}
function totalHours(hours, enabled) { return enabled.reduce((s, k) => s + (hours[k] || 0), 0); }
function freeHours(hours, enabled) { return Math.max(0, 24 - totalHours(hours, enabled)); }

// ===== LIFE CALC =====
function calcLife(birthday, lifespan) {
  const birth = new Date(birthday + 'T00:00:00');
  const death = new Date(birth); death.setFullYear(death.getFullYear() + lifespan);
  const now = new Date();
  const totalDays = Math.ceil((death - birth) / 864e5);
  const livedDays = Math.floor((now - birth) / 864e5);
  const remainDays = Math.max(0, Math.ceil((death - now) / 864e5));
  const totalWeeks = Math.ceil(totalDays / 7);
  const livedWeeks = Math.floor(livedDays / 7);
  const remainWeeks = Math.max(0, totalWeeks - livedWeeks);
  const age = Math.floor((now - birth) / (365.25 * 864e5));
  const seasons = Math.max(0, Math.ceil(remainDays / 91.25));
  const pct = Math.min(100, Math.max(0, (now - birth) / (death - birth) * 100));
  return { remainDays, totalDays, livedDays, livedWeeks, totalWeeks, remainWeeks, age, seasons, pct };
}

// ===== SCREEN NAV =====
function showScreen(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.add('hidden'));
  const t = document.getElementById(id);
  t.classList.remove('hidden');
  t.querySelectorAll('.animate-in').forEach(el => { el.style.animation = 'none'; el.offsetHeight; el.style.animation = ''; });
}

// ===== CATEGORY GRID BUILDER =====
let catMap = {}, enabled = [], hours = {};
let activeGridId = '';
let modalSelectedEmoji = '💡';

function renderCatGrid(gridId) {
  const grid = document.getElementById(gridId);
  grid.innerHTML = '';
  enabled.forEach(key => {
    const cat = catMap[key];
    if (!cat) return;
    const card = document.createElement('div');
    card.className = 'cat-card active';
    card.dataset.key = key;
    card.innerHTML =
      '<button class="cat-toggle" title="关闭">\u2713</button>' +
      '<span class="cat-icon">' + cat.icon + '</span>' +
      '<span class="cat-label">' + cat.label + '</span>' +
      '<span class="cat-hours">' + (hours[key] || 0).toFixed(1) + '</span>' +
      '<span class="cat-unit">h</span>';
    card.querySelector('.cat-toggle').addEventListener('click', function(e) { e.stopPropagation(); toggleCat(key, false); });
    card.addEventListener('click', function() { openEditModal(key); });
    grid.appendChild(card);
  });
  // Inactive built-in cats
  Object.values(catMap).forEach(function(cat) {
    if (enabled.includes(cat.key)) return;
    var card = document.createElement('div');
    card.className = 'cat-card inactive';
    card.dataset.key = cat.key;
    card.innerHTML =
      '<button class="cat-toggle" title="开启">\u25CB</button>' +
      '<span class="cat-icon">' + cat.icon + '</span>' +
      '<span class="cat-label">' + cat.label + '</span>' +
      '<span class="cat-hours">' + (hours[cat.key] || 0).toFixed(1) + '</span>' +
      '<span class="cat-unit">h</span>';
    card.querySelector('.cat-toggle').addEventListener('click', function(e) { e.stopPropagation(); toggleCat(cat.key, true); });
    card.addEventListener('click', function() { openEditModal(cat.key); });
    grid.appendChild(card);
  });
  // Add card
  var addCard = document.createElement('div');
  addCard.className = 'cat-add-card';
  addCard.innerHTML = '<span class="cat-icon">+</span><span class="cat-label">添加分类</span>';
  addCard.addEventListener('click', function() { openEditModal(null); });
  grid.appendChild(addCard);
}

function toggleCat(key, toEnabled) {
  if (toEnabled) {
    if (!enabled.includes(key)) enabled.push(key);
  } else {
    enabled = enabled.filter(function(k) { return k !== key; });
  }
  refreshCurrentGrid();
}

function refreshCurrentGrid() {
  renderCatGrid(activeGridId);
  updateTimeBar(activeGridId);
}

function updateTimeBar(gridId) {
  var barId;
  if (gridId === 'cat-grid-onboard') barId = 'onboard-bar';
  else if (gridId === 'cat-grid-settings') barId = 'settings-bar';
  else return;
  renderTimeBar(barId);
  var free = freeHours(hours, enabled);
  var over = totalHours(hours, enabled) > 24;
  if (gridId === 'cat-grid-settings') {
    document.getElementById('settings-free-label').textContent = over ? '\u26A0 \u8D85\u51FA 24 \u5C0F\u65F6' : '\u81EA\u7531\u65F6\u95F4: ' + free.toFixed(1) + ' \u5C0F\u65F6/\u5929';
  }
}

// ===== TIME BAR =====
function renderTimeBar(barId) {
  var bar = document.getElementById(barId);
  bar.innerHTML = '';
  var tot = Math.min(totalHours(hours, enabled), 24);
  var free = 24 - tot;
  enabled.forEach(function(key) {
    var cat = catMap[key];
    if (!cat) return;
    var h = Math.min(hours[key] || 0, 24);
    if (h <= 0) return;
    var seg = document.createElement('div');
    seg.className = 'time-bar-seg';
    seg.style.width = (h / 24 * 100) + '%';
    seg.style.background = cat.color;
    bar.appendChild(seg);
  });
  if (free > 0.01) {
    var seg = document.createElement('div');
    seg.className = 'time-bar-seg';
    seg.style.width = (free / 24 * 100) + '%';
    seg.style.background = '#e8c89e';
    bar.appendChild(seg);
  }
}

function renderMainTimeBar() {
  renderTimeBar('main-time-bar');
  var tot = totalHours(hours, enabled);
  var free = freeHours(hours, enabled);
  var over = tot > 24;
  document.getElementById('bar-free-label').textContent = over ? '\u8D85\u51FA 24h' : '\u81EA\u7531 ' + free.toFixed(1) + 'h';
}

function renderLegend() {
  var legend = document.getElementById('main-time-legend');
  legend.innerHTML = '';
  enabled.forEach(function(key) {
    var cat = catMap[key];
    if (!cat) return;
    legend.innerHTML += '<div class="legend-item"><div class="legend-dot" style="background:' + cat.color + '"></div>' + cat.label + '</div>';
  });
  legend.innerHTML += '<div class="legend-item"><div class="legend-dot" style="background:#e8c89e"></div>\u81EA\u7531\u65F6\u95F4</div>';
}

// ===== LIFE PROGRESS BAR (主视觉，一眼可见) =====
function renderLifeProgress(life) {
  var lifespan = life.totalDays > 0 ? Math.ceil(life.totalDays / 365.25) : 80;
  var pastPct = Math.min(100, Math.max(0, life.pct)); // 0-100
  var pastYears = Math.floor(life.livedDays / 365.25);
  var remainYears = Math.ceil(life.remainDays / 365.25);

  // 主进度条
  var past = document.getElementById('life-progress-past');
  var now = document.getElementById('life-progress-now');
  past.style.width = pastPct + '%';
  now.style.right = (100 - pastPct) + '%';

  // 年龄标签
  document.getElementById('life-current-label').textContent = pastYears + '岁';
  document.getElementById('life-end-label').textContent = lifespan + '岁';

  // 十年刻度
  var ticks = document.getElementById('life-progress-ticks');
  ticks.innerHTML = '';
  var maxYr = Math.max(lifespan, 10);
  // 每10年一个刻度
  for (var y = 0; y <= maxYr; y += 10) {
    var pct = (y / lifespan * 100).toFixed(1) + '%';
    ticks.innerHTML += '<span style="position:absolute;left:' + pct + ';transform:translateX(-50%)">' + y + '</span>';
  }

  // 三段统计数字
  document.getElementById('lps-past').textContent = pastYears;
  document.getElementById('lps-remain').textContent = remainYears;
  document.getElementById('lps-total').textContent = lifespan;

  // 剩余年数颜色随时间变淡（越老越珍贵）
  var remainEl = document.getElementById('lps-remain');
  if (pastPct > 80) remainEl.style.color = '#e8a060';
  else if (pastPct > 60) remainEl.style.color = 'var(--accent)';
  else remainEl.style.color = '#f0d090';
}

// ===== NUMBER ANIMATION =====
function animateNum(el, target) {
  var dur = 1400, st = performance.now();
  function tick(now) {
    var p = Math.min((now - st) / dur, 1);
    var e = 1 - Math.pow(1 - p, 4);
    el.textContent = Math.floor(target * e).toLocaleString();
    if (p < 1) requestAnimationFrame(tick);
    else el.textContent = target.toLocaleString();
  }
  requestAnimationFrame(tick);
}

// ===== QUOTE =====
function setRandomQuote() {
  var q = QUOTES[Math.floor(Math.random() * QUOTES.length)];
  document.getElementById('quote-text').textContent = '\u201C' + q.text + '\u201D';
  document.getElementById('quote-author').textContent = '\u2014 ' + q.author;
}

// ===== RENDER COUNTDOWN =====
function renderCountdown(life) {
  animateNum(document.getElementById('days-number'), life.remainDays);
  document.getElementById('stat-age').textContent = life.age;
  document.getElementById('stat-weeks').textContent = life.remainWeeks.toLocaleString();
  document.getElementById('stat-seasons').textContent = life.seasons.toLocaleString();
  renderLifeProgress(life);
  renderMainTimeBar();
  renderLegend();
  var free = freeHours(hours, enabled);
  var over = totalHours(hours, enabled) > 24;
  var freeDays = Math.round(life.remainDays * free / 24);
  animateNum(document.getElementById('free-number'), freeDays);
  document.getElementById('free-detail').textContent = '\u6BCF\u5929 ' + free.toFixed(1) + ' \u5C0F\u65F6\u81EA\u7531\u65F6\u95F4 \u00D7 ' + life.remainDays.toLocaleString() + ' \u5929';
  var warn = document.getElementById('free-warning');
  if (over) { warn.style.display = 'block'; warn.textContent = '\u26A0 \u6BCF\u65E5\u65F6\u95F4\u5206\u914D\u8D85\u8FC7 24 \u5C0F\u65F6\uFF0C\u8BF7\u8C03\u6574'; }
  else if (free < 2) { warn.style.display = 'block'; warn.textContent = '\u4F60\u7684\u81EA\u7531\u65F6\u95F4\u6BCF\u5929\u4E0D\u8DB3 2 \u5C0F\u65F6'; }
  else { warn.style.display = 'none'; }
  setRandomQuote();
}

// ===== EDIT MODAL =====
function openEditModal(key) {
  var modal = document.getElementById('edit-modal');
  var isNew = !key;
  document.getElementById('modal-key').value = key || '';
  document.getElementById('modal-title').textContent = isNew ? '\u6DFB\u52A0\u5206\u7C7B' : '\u7F16\u8F91\u5206\u7C7B';
  document.getElementById('modal-delete').style.display = isNew ? 'none' : 'flex';
  if (isNew) {
    document.getElementById('modal-label').value = '';
    document.getElementById('modal-default').value = '1';
    document.getElementById('modal-color').value = '#8b7355';
    modalSelectedEmoji = EMOJI_POOL[Math.floor(Math.random() * EMOJI_POOL.length)];
  } else {
    var cat = catMap[key];
    if (!cat) return;
    document.getElementById('modal-label').value = cat.label;
    document.getElementById('modal-default').value = cat.defaultVal;
    document.getElementById('modal-color').value = cat.color;
    modalSelectedEmoji = cat.icon;
  }
  renderEmojiGrid();
  modal.classList.add('show');
}

function renderEmojiGrid() {
  var grid = document.getElementById('modal-emoji-grid');
  grid.innerHTML = '';
  EMOJI_POOL.forEach(function(em) {
    var btn = document.createElement('div');
    btn.className = 'emoji-opt' + (em === modalSelectedEmoji ? ' selected' : '');
    btn.textContent = em;
    btn.addEventListener('click', function() {
      modalSelectedEmoji = em;
      grid.querySelectorAll('.emoji-opt').forEach(function(b) { b.classList.remove('selected'); });
      btn.classList.add('selected');
    });
    grid.appendChild(btn);
  });
}

function closeModal() { document.getElementById('edit-modal').classList.remove('show'); }

document.getElementById('modal-cancel').addEventListener('click', closeModal);
document.getElementById('modal-confirm').addEventListener('click', function() {
  var key = document.getElementById('modal-key').value;
  var label = document.getElementById('modal-label').value.trim();
  var def = parseFloat(document.getElementById('modal-default').value) || 0;
  var color = document.getElementById('modal-color').value;
  if (!label) { document.getElementById('modal-label').style.borderColor = '#c96b6b'; return; }
  if (key) {
    // Edit existing
    var cat = catMap[key];
    if (cat) {
      cat.label = label; cat.icon = modalSelectedEmoji; cat.color = color; cat.defaultVal = def;
      hours[key] = def; // 始终写入 hours，保证点确定后立即生效
    }
  } else {
    // Add new
    var newKey = 'custom_' + Date.now();
    catMap[newKey] = { key: newKey, label: label, icon: modalSelectedEmoji, color: color, defaultVal: def };
    hours[newKey] = def;
    if (!enabled.includes(newKey)) enabled.push(newKey);
  }
  closeModal();
  refreshCurrentGrid();
});

document.getElementById('modal-delete').addEventListener('click', function() {
  var key = document.getElementById('modal-key').value;
  if (!key) return;
  enabled = enabled.filter(function(k) { return k !== key; });
  delete hours[key];
  // If custom, remove from catMap and config
  var cfg = loadConfig();
  if (cfg && cfg.customCats) {
    cfg.customCats = cfg.customCats.filter(function(c) { return c.key !== key; });
    catMap = buildCatMap(cfg);
  }
  closeModal();
  refreshCurrentGrid();
});

// ===== ONBOARDING =====
var onboardStep = 1;
function showOnboardStep(n) {
  onboardStep = n;
  document.getElementById('onboard-step1').style.display = n === 1 ? 'flex' : 'none';
  document.getElementById('onboard-step2').style.display = n === 2 ? 'flex' : 'none';
  document.getElementById('dot-1').classList.toggle('active', n >= 1);
  document.getElementById('dot-2').classList.toggle('active', n >= 2);
}

document.getElementById('btn-next').addEventListener('click', function() {
  var bday = document.getElementById('input-birthday').value;
  if (!bday) { document.getElementById('input-birthday').style.borderColor = '#c96b6b'; setTimeout(function() { document.getElementById('input-birthday').style.borderColor = ''; }, 1500); return; }
  showOnboardStep(2);
  activeGridId = 'cat-grid-onboard';
  renderCatGrid('cat-grid-onboard');
  renderTimeBar('onboard-bar');
});
document.getElementById('btn-prev').addEventListener('click', function() { showOnboardStep(1); });

document.getElementById('btn-start').addEventListener('click', function() {
  var bday = document.getElementById('input-birthday').value;
  var life = parseInt(document.getElementById('input-lifespan').value) || 80;
  if (!bday) return;
  saveConfig({ birthday: bday, lifespan: life, enabledCats: enabled, catHours: hours });
  var lf = calcLife(bday, life);
  showScreen('countdown');
  renderCountdown(lf);
  startLiveUpdates();
});

// ===== SETTINGS =====
document.getElementById('btn-settings').addEventListener('click', function() {
  var cfg = loadConfig();
  if (cfg) {
    document.getElementById('edit-birthday').value = cfg.birthday;
    document.getElementById('edit-lifespan').value = cfg.lifespan || 80;
    catMap = buildCatMap(cfg);
    enabled = getEnabled(cfg);
    hours = getHours(cfg, catMap);
  }
  activeGridId = 'cat-grid-settings';
  renderCatGrid('cat-grid-settings');
  renderTimeBar('settings-bar');
  var free = freeHours(hours, enabled);
  document.getElementById('settings-free-label').textContent = '\u81EA\u7531\u65F6\u95F4: ' + free.toFixed(1) + ' \u5C0F\u65F6/\u5929';
  showScreen('settings');
});

document.getElementById('btn-back').addEventListener('click', function() {
  var cfg = loadConfig();
  if (cfg) {
    catMap = buildCatMap(cfg);
    enabled = getEnabled(cfg);
    hours = getHours(cfg, catMap);
    var lf = calcLife(cfg.birthday, cfg.lifespan || 80);
    showScreen('countdown');
    renderCountdown(lf);
  }
});

document.getElementById('btn-save').addEventListener('click', function() {
  var bday = document.getElementById('edit-birthday').value;
  var life = parseInt(document.getElementById('edit-lifespan').value) || 80;
  if (!bday) { document.getElementById('edit-birthday').style.borderColor = '#c96b6b'; return; }
  // Save overrides & custom cats
  var overrides = {};
  var customCats = [];
  Object.entries(catMap).forEach(function(entry) {
    var key = entry[0], cat = entry[1];
    if (key.startsWith('custom_')) {
      customCats.push(cat);
    } else {
      var def = DEFAULT_CATS.find(function(d) { return d.key === key; });
      if (def && (cat.label !== def.label || cat.icon !== def.icon || cat.color !== def.color || cat.defaultVal !== def.defaultVal)) {
        overrides[key] = { label: cat.label, icon: cat.icon, color: cat.color, defaultVal: cat.defaultVal };
      }
    }
  });
  saveConfig({ birthday: bday, lifespan: life, enabledCats: enabled, catHours: hours, catOverrides: overrides, customCats: customCats });
  var lf = calcLife(bday, life);
  showScreen('countdown');
  renderCountdown(lf);
  startLiveUpdates();
});

// ===== LIVE UPDATES =====
var liveInterval = null;
function startLiveUpdates() {
  if (liveInterval) clearInterval(liveInterval);
  liveInterval = setInterval(function() {
    var cfg = loadConfig();
    if (!cfg) return;
    catMap = buildCatMap(cfg); enabled = getEnabled(cfg); hours = getHours(cfg, catMap);
    var lf = calcLife(cfg.birthday, cfg.lifespan || 80);
    document.getElementById('days-number').textContent = lf.remainDays.toLocaleString();
    document.getElementById('stat-age').textContent = lf.age;
    document.getElementById('stat-weeks').textContent = lf.remainWeeks.toLocaleString();
    document.getElementById('stat-seasons').textContent = lf.seasons.toLocaleString();
    renderLifeProgress(lf);
    var free = freeHours(hours, enabled);
    document.getElementById('free-number').textContent = Math.round(lf.remainDays * free / 24).toLocaleString();
  }, 60000);
  if (window._qi) clearInterval(window._qi);
  window._qi = setInterval(setRandomQuote, 30000);
}

// ===== INIT =====
var cfg = loadConfig();
if (cfg && cfg.birthday) {
  catMap = buildCatMap(cfg);
  enabled = getEnabled(cfg);
  hours = getHours(cfg, catMap);
  showScreen('countdown');
  renderCountdown(calcLife(cfg.birthday, cfg.lifespan || 80));
  startLiveUpdates();
} else {
  catMap = buildCatMap(null);
  enabled = getEnabled(null);
  hours = getHours(null, catMap);
}

if ('serviceWorker' in navigator) navigator.serviceWorker.register('sw.js').catch(function(){});
