// ════════════════════════════════════════════════════════
// app.js — 主控制器
// ════════════════════════════════════════════════════════

// ─── 常量 ────────────────────────────────────────────────
const URGENT_DAYS = 3;  // 快过期阈值（天）

// ─── 初始化入口 ──────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  initStore();
  setupTabs();
  setupFridgeControls();
  setupLibraryCatFilter();
  setupModal();
  setupNewIngredientModal();
  setupQuickInput();
  setupVoiceInput();

  renderRecipes();
  renderFridge();
  renderLibrary();
});

// ════════════════════════════════════════════════════════
// 通用工具
// ════════════════════════════════════════════════════════

// 分类名 → emoji 标签
function catLabel(cat) {
  const map = {
    '肉和海鲜': '🦐 肉和海鲜',
    '豆奶类':   '🥛 豆奶类',
    '蔬菜':     '🥦 蔬菜',
    '水果':     '🍒 水果',
    '酱料饮品': '🧴 酱料饮品',
  };
  return map[cat] || cat;
}

// 将一组 item 按 CATEGORIES 顺序分组，返回 { cat: [item, ...] }
function groupByCategory(items) {
  const groups = {};
  CATEGORIES.forEach(cat => { groups[cat] = []; });
  items.forEach(item => {
    const cat = item.category || '蔬菜';
    if (!groups[cat]) groups[cat] = [];
    groups[cat].push(item);
  });
  return groups;
}

// 渲染一个"分类标题 + 卡片 grid"区块，追加到 container
function renderCategorySection(container, cat, items, buildCardFn) {
  if (!items.length) return;

  const section = document.createElement('div');
  section.className = 'mb-5';

  const title = document.createElement('h3');
  title.className = 'text-xs font-round text-muted tracking-wider mb-2 px-1';
  title.textContent = catLabel(cat);
  section.appendChild(title);

  const grid = document.createElement('div');
  grid.className = 'grid grid-cols-3 lg:grid-cols-4 gap-2.5';
  items.forEach(item => grid.appendChild(buildCardFn(item)));

  section.appendChild(grid);
  container.appendChild(section);
}

// ════════════════════════════════════════════════════════
// Tab 切换
// ════════════════════════════════════════════════════════
function setupTabs() {
  const btns = document.querySelectorAll('.tab-btn');
  btns.forEach(btn => {
    btn.addEventListener('click', () => {
      btns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
      const target = btn.dataset.target;
      document.getElementById(target).classList.add('active');

      if (target === 'view-recipe') renderRecipes();
      if (target === 'view-fridge') renderFridge();
      if (target === 'view-add')    renderLibrary();
    });
  });
}

// ════════════════════════════════════════════════════════
// 菜谱推荐
// ════════════════════════════════════════════════════════
function renderRecipes(filter = '') {
  // 冰箱食材按名称索引
  const fridgeByName = {};
  getFridge().forEach(i => { fridgeByName[i.name] = i; });

  // 过滤 + 计算匹配情况
  let list = RECIPES
    .filter(r => !filter || r.name.includes(filter))
    .map(r => {
      let matchedCount = 0;
      const missingList = [];
      let hasUrgent = false;

      r.ingredients.forEach(ing => {
        const fi = fridgeByName[ing.name];
        if (fi) {
          matchedCount++;
          if (daysUntilExpiry(fi.expiryDate) <= URGENT_DAYS) hasUrgent = true;
        } else {
          missingList.push(ing);
        }
      });

      const percentage = r.ingredients.length
        ? Math.round(matchedCount / r.ingredients.length * 100)
        : 0;
      return { ...r, matchedCount, missingList, percentage, hasUrgent };
    });

  // 排序：匹配度降序；同分时含快过期食材的优先
  list.sort((a, b) =>
    b.percentage !== a.percentage
      ? b.percentage - a.percentage
      : (b.hasUrgent ? 1 : 0) - (a.hasUrgent ? 1 : 0)
  );

  const container = document.getElementById('recipe-list');
  container.innerHTML = '';

  if (!list.length) {
    container.innerHTML = '<p class="text-center text-muted text-sm py-10">没有找到相关菜谱</p>';
    return;
  }

  list.forEach(r => {
    const card = document.createElement('div');
    card.className = 'bg-white rounded-3xl shadow-sm border border-stone-100 p-4 mb-4 transition-all ingredient-card';

    // 快过期提示
    const urgentNames = r.hasUrgent
      ? r.ingredients
          .filter(ing => {
            const fi = fridgeByName[ing.name];
            return fi && daysUntilExpiry(fi.expiryDate) <= URGENT_DAYS;
          })
          .map(ing => ing.name)
      : [];
    const urgentHtml = urgentNames.length
      ? `<p class="text-[11px] text-red-400 mb-1.5 leading-tight">● ${urgentNames.join('、')} 的赏味期要过了噢</p>`
      : '';

    // 匹配状态
    const missingCount = r.ingredients.length - r.matchedCount;
    const missingTip   = r.missingList.map(m => `${m.name}（${m.amount}）`).join('、');
    const matchHtml = r.percentage === 100
      ? `<span class="text-green-600 font-round">食材齐全</span>`
      : `<span class="text-orange-500 font-round cursor-pointer recipe-missing-btn" title="缺：${missingTip}">缺 ${missingCount} 样 ▾</span>`;

    // 图片（无图时显示 emoji 占位块）
    const imgHtml = r.image
      ? `<img src="${r.image}" alt="${r.name}"
           class="w-20 h-20 rounded-2xl object-cover bg-stone-50 flex-shrink-0 ml-3"
           onerror="this.style.display='none';this.nextElementSibling.style.display='flex'" />
         <div class="w-20 h-20 rounded-2xl bg-accent/15 flex-shrink-0 ml-3 items-center justify-center text-3xl hidden">🍽</div>`
      : `<div class="w-20 h-20 rounded-2xl bg-accent/15 flex-shrink-0 ml-3 flex items-center justify-center text-3xl">🍽</div>`;

    // 食材清单标签（展开后显示）
    const ingTagsHtml = r.ingredients.map(ing => {
      const has = !!fridgeByName[ing.name];
      return `<span class="text-[11px] px-2 py-0.5 rounded-full ${has ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-500'}">
        ${has ? '✓' : '✗'} ${ing.name} ${ing.amount}
      </span>`;
    }).join('');

    card.innerHTML = `
      <div class="flex items-start">
        <div class="flex-1 min-w-0">
          ${urgentHtml}
          <h3 class="text-base font-round text-stone-800 mb-1">${r.name}</h3>
          <p class="text-[12px] text-muted mb-2">${r.time} · ${r.difficulty} · ${matchHtml}</p>
          <p class="text-[12px] text-stone-500 leading-relaxed line-clamp-2">${r.description}</p>
        </div>
        ${imgHtml}
      </div>
      <div class="recipe-missing-detail hidden mt-3 pt-3 border-t border-stone-100">
        <p class="text-[11px] text-muted mb-2">食材清单</p>
        <div class="flex flex-wrap gap-1.5">${ingTagsHtml}</div>
      </div>`;

    const detail     = card.querySelector('.recipe-missing-detail');
    const missingBtn = card.querySelector('.recipe-missing-btn');

    // 点击「缺 x 样」展开/收起
    if (missingBtn) {
      missingBtn.addEventListener('click', e => {
        e.stopPropagation();
        const opening = detail.classList.contains('hidden');
        detail.classList.toggle('hidden', !opening);
        missingBtn.textContent = opening
          ? `缺 ${missingCount} 样 ▴`
          : `缺 ${missingCount} 样 ▾`;
      });
    }

    // 点击整张卡片展开/收起食材清单
    card.addEventListener('click', () => detail.classList.toggle('hidden'));

    container.appendChild(card);
  });

  // 搜索框事件（只绑定一次）
  const search = document.getElementById('recipe-search');
  if (!search._bound) {
    search._bound = true;
    search.addEventListener('input', e => renderRecipes(e.target.value.trim()));
  }
}

// ════════════════════════════════════════════════════════
// 我的冰箱
// ════════════════════════════════════════════════════════
let fridgeFilter     = 'all';  // 'all' | '0' | '3' | '7' | 'custom'
let fridgeCustomDays = 14;
let fridgeSortAsc    = true;
let fridgeCatFilter  = 'all';  // 分类筛选

function setupFridgeControls() {
  // 分类筛选按钮
  document.querySelectorAll('.fridge-cat-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.fridge-cat-btn').forEach(b => {
        b.classList.remove('active', 'bg-accent', 'text-white');
        b.classList.add('bg-stone-100', 'text-stone-500');
      });
      btn.classList.add('active', 'bg-accent', 'text-white');
      btn.classList.remove('bg-stone-100', 'text-stone-500');
      fridgeCatFilter = btn.dataset.cat;
      renderFridge();
    });
  });

  // 到期筛选按钮
  document.querySelectorAll('.fridge-filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.fridge-filter-btn').forEach(b => {
        b.classList.remove('active', 'bg-stone-200', 'text-stone-600');
        b.classList.add('bg-stone-100', 'text-stone-500');
      });
      btn.classList.add('active', 'bg-stone-200', 'text-stone-600');
      btn.classList.remove('bg-stone-100', 'text-stone-500');
      fridgeFilter = btn.dataset.days;

      const customRow = document.getElementById('custom-days-row');
      if (fridgeFilter === 'custom') {
        customRow.classList.remove('hidden');
        customRow.classList.add('flex');
      } else {
        customRow.classList.add('hidden');
        customRow.classList.remove('flex');
        renderFridge();
      }
    });
  });

  // 自定义天数确认
  document.getElementById('custom-days-apply').addEventListener('click', () => {
    const val = parseInt(document.getElementById('custom-days-input').value);
    if (!isNaN(val) && val >= 0) {
      fridgeCustomDays = val;
      renderFridge();
    }
  });

  document.getElementById('custom-days-input').addEventListener('keydown', e => {
    if (e.key === 'Enter') document.getElementById('custom-days-apply').click();
  });

  // 排序按钮
  document.getElementById('sort-expiry-btn').addEventListener('click', function() {
    fridgeSortAsc = !fridgeSortAsc;
    this.dataset.asc = fridgeSortAsc;
    this.textContent = fridgeSortAsc ? '⬆ 到期升序' : '⬇ 到期降序';
    renderFridge();
  });

  // 海报导出按钮
  document.getElementById('export-poster-btn').addEventListener('click', exportPoster);
}

function renderFridge() {
  let items = getFridge();

  // 分类筛选
  if (fridgeCatFilter !== 'all') {
    items = items.filter(i => i.category === fridgeCatFilter);
  }

  // 到期筛选
  if (fridgeFilter !== 'all') {
    const maxDays = fridgeFilter === 'custom' ? fridgeCustomDays : parseInt(fridgeFilter);
    items = items.filter(i => daysUntilExpiry(i.expiryDate) <= maxDays);
  }

  // 排序
  items.sort((a, b) => {
    const diff = new Date(a.expiryDate) - new Date(b.expiryDate);
    return fridgeSortAsc ? diff : -diff;
  });

  const container = document.getElementById('fridge-grid');
  container.innerHTML = '';

  if (!items.length) {
    container.innerHTML = '<p class="text-center text-muted text-sm py-10">冰箱是空的 🧊</p>';
    return;
  }

  if (fridgeCatFilter !== 'all') {
    // 单分类：直接展示 grid，不显示分类标题
    const grid = document.createElement('div');
    grid.className = 'grid grid-cols-3 lg:grid-cols-4 gap-2.5 pb-6';
    items.forEach(item => grid.appendChild(buildFridgeCard(item)));
    container.appendChild(grid);
    return;
  }

  const groups = groupByCategory(items);
  CATEGORIES.forEach(cat => renderCategorySection(container, cat, groups[cat], buildFridgeCard));
}

function buildFridgeCard(item) {
  const days = daysUntilExpiry(item.expiryDate);
  const fmtDate = d => d ? d.slice(5).replace('-', '/') : '—';

  let daysText, badgeClass;
  if (days < 0)          { daysText = `过期 ${Math.abs(days)} 天`; badgeClass = 'badge-urgent'; }
  else if (days === 0)   { daysText = '今天到期';                   badgeClass = 'badge-urgent'; }
  else if (days <= 3)    { daysText = `DDL ${days} 天`;            badgeClass = 'badge-urgent'; }
  else if (days <= 7)    { daysText = `DDL ${days} 天`;            badgeClass = 'badge-warn';   }
  else                   { daysText = `DDL ${days} 天`;            badgeClass = 'badge-ok';     }

  const imgSrc = isIdbRef(item.image) ? DEFAULT_IMAGE : (item.image || DEFAULT_IMAGE);

  const card = document.createElement('div');
  card.className = 'relative bg-white rounded-2xl shadow-sm border border-stone-100 p-2.5 transition-all ingredient-card flex flex-col';

  card.innerHTML = `
    <button data-id="${item.id}"
      class="fridge-remove-btn absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-stone-100/80 text-stone-400
             hover:bg-red-100 hover:text-red-400 text-[10px] flex items-center justify-center transition-colors z-10">✕</button>
    <img src="${imgSrc}" alt="${item.name}"
      class="fridge-img w-full aspect-square object-cover rounded-xl bg-stone-50 mb-2"
      onerror="this.src='${DEFAULT_IMAGE}'" />
    <p class="font-round text-xs text-stone-700 truncate leading-tight">${item.name}</p>
    <p class="text-[11px] text-muted mt-0.5 leading-tight">${item.amount} ${item.unit}</p>
    <div class="mt-1.5 text-[10px] text-muted leading-snug">
      <div>购 ${fmtDate(item.purchaseDate)}</div>
      <div>期 ${fmtDate(item.expiryDate)}</div>
    </div>
    <div class="mt-1.5">
      <span class="inline-block text-[10px] px-1.5 py-0.5 rounded-full font-round leading-tight ${badgeClass}">${daysText}</span>
    </div>`;

  // 异步加载 IDB 图片
  if (isIdbRef(item.image)) {
    resolveImageURL(item.image).then(url => {
      const img = card.querySelector('.fridge-img');
      if (img && url) img.src = url;
    });
  }

  card.querySelector('.fridge-remove-btn').addEventListener('click', e => {
    e.stopPropagation();
    removeFromFridge(item.id);
    renderFridge();
  });

  return card;
}

// ════════════════════════════════════════════════════════
// 食材仓库（分类筛选 + 按分类分组）
// ════════════════════════════════════════════════════════
let libraryCatFilter = 'all';

function setupLibraryCatFilter() {
  document.querySelectorAll('.lib-cat-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.lib-cat-btn').forEach(b => {
        b.classList.remove('active', 'bg-accent', 'text-white');
        b.classList.add('bg-stone-100', 'text-stone-500');
      });
      btn.classList.add('active', 'bg-accent', 'text-white');
      btn.classList.remove('bg-stone-100', 'text-stone-500');
      libraryCatFilter = btn.dataset.cat;
      renderLibrary();
    });
  });
}

function renderLibrary() {
  let lib = getLibrary();
  const container = document.getElementById('library-grid');
  container.innerHTML = '';

  if (!lib.length) {
    container.innerHTML = '<p class="text-center text-muted text-sm py-8">仓库是空的，快去添加食材吧</p>';
    return;
  }

  if (libraryCatFilter !== 'all') {
    lib = lib.filter(i => i.category === libraryCatFilter);
    if (!lib.length) {
      container.innerHTML = '<p class="text-center text-muted text-sm py-8">这个分类还没有食材</p>';
      return;
    }
    // 筛选单分类时直接展示 grid，不显示分类标题
    const grid = document.createElement('div');
    grid.className = 'grid grid-cols-3 lg:grid-cols-4 gap-2.5 pb-6';
    lib.forEach(item => grid.appendChild(buildLibraryCard(item)));
    container.appendChild(grid);
    return;
  }

  const groups = groupByCategory(lib);
  CATEGORIES.forEach(cat => renderCategorySection(container, cat, groups[cat], buildLibraryCard));
}

function buildLibraryCard(item) {
  const card = document.createElement('div');
  card.className = 'relative bg-white rounded-2xl shadow-sm border border-stone-100 p-2.5 transition-all ingredient-card cursor-pointer flex flex-col items-center';

  const imgSrc = isIdbRef(item.image) ? DEFAULT_IMAGE : (item.image || DEFAULT_IMAGE);

  card.innerHTML = `
    <button data-id="${item.id}"
      class="lib-remove-btn absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-stone-100/80 text-stone-400
             hover:bg-red-100 hover:text-red-400 text-[10px] flex items-center justify-center transition-colors z-10">✕</button>
    <img src="${imgSrc}" alt="${item.name}"
      class="lib-img w-full aspect-square object-cover rounded-xl bg-stone-50 mb-2"
      onerror="this.src='${DEFAULT_IMAGE}'" />
    <p class="font-round text-xs text-stone-700 text-center truncate w-full leading-tight">${item.name}</p>`;

  // 异步加载 IDB 图片
  if (isIdbRef(item.image)) {
    resolveImageURL(item.image).then(url => {
      const img = card.querySelector('.lib-img');
      if (img && url) img.src = url;
    });
  }

  card.querySelector('.lib-remove-btn').addEventListener('click', e => {
    e.stopPropagation();
    removeFromLibrary(item.id);
    renderLibrary();
  });

  card.addEventListener('click', e => {
    if (e.target.closest('.lib-remove-btn')) return;
    openFridgeModal(item);
  });

  return card;
}

// ════════════════════════════════════════════════════════
// 快速录入（支持分号分隔多食材，逐一排队入库）
// ════════════════════════════════════════════════════════

// 待处理队列：[{ item, amount, unit }]
let _inputQueue = [];

function setupQuickInput() {
  document.getElementById('quick-add-btn').addEventListener('click', handleQuickInput);
  document.getElementById('quick-input').addEventListener('keydown', e => {
    if (e.key === 'Enter') handleQuickInput();
  });
}

// 已知单位词列表（语音切割用）
const UNITS = ['克', 'g', 'G', '千克', 'kg', '斤', '两',
               '个', '颗', '粒', '枚',
               '袋', '盒', '瓶', '罐', '包',
               '只', '根', '棵', '块', '条', '片',
               '把', '束', '朵', '头', '尾', '升', 'ml', 'L'];

// 将语音原文按「数字+单位 → 新食材名」模式切成多段
// 例："牛肉500克鸡蛋3个西兰花1颗" → ["牛肉500克", "鸡蛋3个", "西兰花1颗"]
function splitVoiceInput(raw) {
  const unitPattern = UNITS.map(u => u.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|');
  // 在「数字+单位」之后、紧跟非数字非空格字符（新食材名开头）时插入分隔符
  const re = new RegExp(`(\\d+(?:\\.\\d+)?(?:${unitPattern}))(?=[^\\d\\s;；])`, 'g');
  return raw.replace(re, '$1;').split(/[;；]+/).map(s => s.trim()).filter(Boolean);
}

// 解析单条 "牛肉 500g" → { name, amount, unit }
function parseOneItem(raw) {
  const unitPattern = UNITS.map(u => u.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|');
  const re = new RegExp(`^([^\\d\\s]+)\\s*([\\d.]+)\\s*(${unitPattern})?\\s*$`);
  const m = raw.trim().match(re);
  if (m) return { name: m[1].trim(), amount: m[2], unit: (m[3] || '').trim() };
  return { name: raw.trim(), amount: '', unit: '' };
}

function handleQuickInput() {
  const raw = document.getElementById('quick-input').value.trim();
  if (!raw) return;

  // 若弹框正在处理队列中的食材，先完成当前流程再录入新的
  if (document.getElementById('modal-overlay').classList.contains('open')) return;
  document.getElementById('quick-input').value = '';

  const hint = document.getElementById('quick-hint');
  const showHint = (msg, color) => {
    hint.textContent = msg;
    hint.className = `mt-2 text-xs ${color}`;
    hint.classList.remove('hidden');
    setTimeout(() => hint.classList.add('hidden'), 3500);
  };

  // 用 splitVoiceInput 统一处理：兼容分号分隔和语音连续输入
  const segments = splitVoiceInput(raw);
  const known = [];
  let firstUnknown = null;

  segments.forEach(seg => {
    const parsed = parseOneItem(seg);
    if (!parsed.name) return;
    const existing = findInLibrary(parsed.name);
    if (existing) {
      known.push({ item: existing, amount: parsed.amount, unit: parsed.unit });
    } else if (!firstUnknown) {
      firstUnknown = parsed;
    }
  });

  if (!known.length && !firstUnknown) return;

  if (firstUnknown) {
    showHint(`「${firstUnknown.name}」不在食材库，请先注册`, 'text-warn');
  } else {
    showHint(`✓ 找到 ${known.length} 种食材，请逐一填写入库信息`, 'text-green-600');
  }

  // 把已知食材放入队列，未知食材排在队尾（注册后会接着弹入库框）
  _inputQueue = [...known];
  if (firstUnknown) {
    // 先打开注册框；注册完成后 setupNewIngredientModal 里的 submit 会调用 openFridgeModal，
    // 提交入库后 _processNextInQueue() 继续处理 known 队列
    setTimeout(() => openNewIngredientModal(firstUnknown.name), 300);
  } else {
    _processNextInQueue();
  }
}

// 从队列里取出下一个，打开入库表单；队列空则结束
function _processNextInQueue() {
  if (!_inputQueue.length) return;
  const { item, amount, unit } = _inputQueue.shift();
  openFridgeModal(item, amount, unit);
}

// ════════════════════════════════════════════════════════
// 模态框：快速入库（到期日 ↔ 保质期天数互算）
// ════════════════════════════════════════════════════════
function setupModal() {
  document.getElementById('modal-close').addEventListener('click', () => closeModal(true));
  document.getElementById('modal-overlay').addEventListener('click', e => {
    if (e.target === document.getElementById('modal-overlay')) closeModal(true);
  });

  const expiryInput   = document.getElementById('form-expiry');
  const shelfInput    = document.getElementById('form-shelf-life');
  const purchaseInput = document.getElementById('form-purchase');

  // 到期日 → 保质期天数
  expiryInput.addEventListener('change', () => {
    if (purchaseInput.value && expiryInput.value) {
      const diff = Math.round((new Date(expiryInput.value) - new Date(purchaseInput.value)) / 86400000);
      if (diff >= 0) shelfInput.value = diff;
    }
  });

  // 保质期天数 → 到期日
  shelfInput.addEventListener('input', () => {
    const days = parseInt(shelfInput.value);
    if (purchaseInput.value && !isNaN(days) && days >= 0) {
      const d = new Date(purchaseInput.value);
      d.setDate(d.getDate() + days);
      expiryInput.value = d.toISOString().slice(0, 10);
    }
  });

  // 采购日期变化时，若已填保质期天数则联动重算到期日
  purchaseInput.addEventListener('change', () => {
    if (parseInt(shelfInput.value) >= 0) {
      shelfInput.dispatchEvent(new Event('input'));
    }
  });

  document.getElementById('fridge-form').addEventListener('submit', e => {
    e.preventDefault();
    // 优先用弹框上挂载的完整 item，fallback 到 library 查找（兼容旧路径）
    const libItem = document.getElementById('modal-overlay')._libItem
      || getLibrary().find(i => i.id === document.getElementById('form-library-id').value);
    if (!libItem) { alert('食材数据丢失，请重新选择'); return; }

    const expiry = document.getElementById('form-expiry').value;
    if (!expiry) { alert('请填写到期日期或保质期天数'); return; }

    addToFridge({
      id:           uid('f'),
      libraryId:    libItem.id,
      name:         libItem.name,
      category:     libItem.category,
      image:        libItem.image,
      amount:       document.getElementById('form-amount').value,
      unit:         document.getElementById('form-unit').value,
      purchaseDate: document.getElementById('form-purchase').value,
      expiryDate:   expiry,
    });

    closeModal();

    // 队列里还有食材时，继续弹下一个入库表单（不跳转 tab）
    if (_inputQueue.length) {
      _processNextInQueue();
    } else {
      // 重置冰箱筛选到「全部」再跳转，避免新加食材被分类过滤掉
      fridgeCatFilter = 'all';
      fridgeFilter    = 'all';
      document.querySelectorAll('.fridge-cat-btn').forEach(b => {
        b.classList.toggle('active', b.dataset.cat === 'all');
        b.classList.toggle('bg-accent', b.dataset.cat === 'all');
        b.classList.toggle('text-white', b.dataset.cat === 'all');
        b.classList.toggle('bg-stone-100', b.dataset.cat !== 'all');
        b.classList.toggle('text-stone-500', b.dataset.cat !== 'all');
      });
      document.querySelectorAll('.fridge-filter-btn').forEach(b => {
        b.classList.toggle('active', b.dataset.days === 'all');
        b.classList.toggle('bg-stone-200', b.dataset.days === 'all');
        b.classList.toggle('text-stone-600', b.dataset.days === 'all');
        b.classList.toggle('bg-stone-100', b.dataset.days !== 'all');
        b.classList.toggle('text-stone-500', b.dataset.days !== 'all');
      });
      document.querySelector('[data-target="view-fridge"]').click();
    }
  });
}

function openFridgeModal(libItem, prefillAmount = '', prefillUnit = '') {
  // 把完整 item 对象挂到 overlay 上，submit 时直接取用，不再依赖 id 二次查 library
  document.getElementById('modal-overlay')._libItem = libItem;
  document.getElementById('form-library-id').value = libItem.id;
  document.getElementById('modal-title').textContent = libItem.name;

  const modalImg = document.getElementById('modal-img');
  if (isIdbRef(libItem.image)) {
    modalImg.src = DEFAULT_IMAGE;
    resolveImageURL(libItem.image).then(url => { if (url) modalImg.src = url; });
  } else {
    modalImg.src = libItem.image || DEFAULT_IMAGE;
  }

  document.getElementById('form-amount').value = prefillAmount;

  const unitSelect = document.getElementById('form-unit');
  if (prefillUnit) {
    const opt = [...unitSelect.options].find(o => o.value === prefillUnit);
    unitSelect.value = opt ? prefillUnit : unitSelect.options[0].value;
  } else {
    unitSelect.selectedIndex = 0;
  }

  document.getElementById('form-purchase').value   = new Date().toISOString().slice(0, 10);
  document.getElementById('form-expiry').value     = '';
  document.getElementById('form-shelf-life').value = '';

  document.getElementById('modal-overlay').classList.add('open');
}

function closeModal(skipQueue = false) {
  document.getElementById('modal-overlay').classList.remove('open');
  // 用户主动关闭弹框（点 ✕ 或遮罩）时，丢弃剩余队列，避免卡死
  if (skipQueue) _inputQueue = [];
}

// ════════════════════════════════════════════════════════
// 模态框：注册新食材到仓库
// ════════════════════════════════════════════════════════
function setupNewIngredientModal() {
  document.getElementById('modal-new-close').addEventListener('click', closeNewModal);
  document.getElementById('modal-new-overlay').addEventListener('click', e => {
    if (e.target === document.getElementById('modal-new-overlay')) closeNewModal();
  });

  // 从 ASSETS_MAP 构建图片下拉选项
  const imgSelect = document.getElementById('new-img-select');
  Object.entries(ASSETS_MAP).forEach(([name, path]) => {
    const opt = document.createElement('option');
    opt.value = path;
    opt.textContent = name;
    imgSelect.appendChild(opt);
  });

  // 图片下拉变化 → 更新预览，同时清除已上传的自定义图片
  imgSelect.addEventListener('change', () => {
    document.getElementById('new-img-preview').src = imgSelect.value || DEFAULT_IMAGE;
    // 清除已选的上传文件
    document.getElementById('new-img-upload').value = '';
    delete imgSelect._uploadedBlob;
  });

  // 拍照/上传 → 预览，并暂存 Blob 到 select 元素上
  document.getElementById('new-img-upload').addEventListener('change', function() {
    const file = this.files[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    document.getElementById('new-img-preview').src = url;
    // 暂存 Blob，提交时写入 IndexedDB
    imgSelect._uploadedBlob = file;
    imgSelect.value = ''; // 取消下拉选项的选中状态
  });

  // 名称输入 → 自动匹配图片
  document.getElementById('new-name').addEventListener('input', function() {
    const matched = ASSETS_MAP[this.value.trim()];
    if (matched && !imgSelect._uploadedBlob) {
      imgSelect.value = matched;
      document.getElementById('new-img-preview').src = matched;
    }
  });

  document.getElementById('add-new-ingredient-btn').addEventListener('click', () => {
    openNewIngredientModal('');
  });

  document.getElementById('new-ingredient-form').addEventListener('submit', async e => {
    e.preventDefault();
    const name  = document.getElementById('new-name').value.trim();
    const cat   = document.getElementById('new-category').value;
    const imgSelect = document.getElementById('new-img-select');

    if (!name) return;
    if (findInLibrary(name)) { alert(`「${name}」已在食材库中`); return; }

    let imagePath = imgSelect.value || DEFAULT_IMAGE;

    // 如果用户上传了自定义图片，存入 IndexedDB
    if (imgSelect._uploadedBlob) {
      const newItem = { id: uid('lib'), name, category: cat, image: '' };
      imagePath = `idb://${newItem.id}`;
      await idbSavePhoto(newItem.id, imgSelect._uploadedBlob);
      newItem.image = imagePath;
      delete imgSelect._uploadedBlob;
      addToLibrary(newItem);
      closeNewModal();
      renderLibrary();
      openFridgeModal(newItem);
    } else {
      const newItem = { id: uid('lib'), name, category: cat, image: imagePath };
      addToLibrary(newItem);
      closeNewModal();
      renderLibrary();
      openFridgeModal(newItem);
    }
  });
}

function openNewIngredientModal(prefillName = '') {
  document.getElementById('new-name').value     = prefillName;
  document.getElementById('new-category').value = '蔬菜';

  const matched   = ASSETS_MAP[prefillName] || '';
  const imgSelect = document.getElementById('new-img-select');
  imgSelect.value = matched;
  document.getElementById('new-img-preview').src = matched || DEFAULT_IMAGE;

  document.getElementById('modal-new-overlay').style.display = 'flex';
}

function closeNewModal() {
  document.getElementById('modal-new-overlay').style.display = 'none';
}

// ════════════════════════════════════════════════════════
// 语音输入
// ════════════════════════════════════════════════════════
function setupVoiceInput() {
  const btn = document.getElementById('voice-btn');
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

  if (!SpeechRecognition) {
    btn.title   = '浏览器不支持语音识别';
    btn.style.opacity = '0.4';
    return;
  }

  const recog = new SpeechRecognition();
  recog.lang           = 'zh-CN';
  recog.interimResults = false;
  let listening = false;

  btn.addEventListener('click', () => {
    if (listening) { recog.stop(); return; }
    recog.start();
    listening = true;
    btn.textContent = '⏹';
    btn.classList.add('bg-red-100', 'text-red-400');
    btn.classList.remove('bg-stone-100', 'text-stone-500');
  });

  recog.onresult = e => {
    document.getElementById('quick-input').value = e.results[0][0].transcript;
  };

  recog.onend = () => {
    listening = false;
    btn.textContent = '🎤';
    btn.classList.remove('bg-red-100', 'text-red-400');
    btn.classList.add('bg-stone-100', 'text-stone-500');
  };
}

// ════════════════════════════════════════════════════════
// 海报导出（html2canvas）
// ════════════════════════════════════════════════════════
async function exportPoster() {
  const btn = document.getElementById('export-poster-btn');
  const origText = btn.textContent;
  btn.textContent = '生成中…';
  btn.disabled = true;

  const items = getFridge();
  const today = new Date().toLocaleDateString('zh-CN', { month: 'long', day: 'numeric' });

  // 按分类分组（复用现有逻辑）
  const groups = groupByCategory(items);

  // 构建海报 HTML（固定宽度 375px，渲染到屏外 div）
  const root = document.getElementById('poster-canvas-root');
  root.innerHTML = `
    <div style="
      width:375px;
      background:#FDFBF7;
      font-family:'Varela Round',sans-serif;
      padding:28px 20px 32px;
      box-sizing:border-box;
    ">
      <!-- 顶部标题 -->
      <div style="text-align:center;margin-bottom:20px;">
        <div style="font-size:32px;margin-bottom:4px;">🧊</div>
        <div style="font-size:20px;font-weight:700;color:#44403C;letter-spacing:0.04em;">我的冰箱</div>
        <div style="font-size:12px;color:#A8A29E;margin-top:4px;">${today} 更新 · ${items.length} 件食材</div>
      </div>

      <!-- 食材分类区块 -->
      ${CATEGORIES.map(cat => {
        const catItems = groups[cat] || [];
        if (!catItems.length) return '';
        return `
          <div style="margin-bottom:16px;">
            <div style="font-size:11px;color:#A8A29E;margin-bottom:8px;padding-left:2px;">${catLabel(cat)}</div>
            <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:8px;">
              ${catItems.map(item => {
                const days = daysUntilExpiry(item.expiryDate);
                const badgeColor = days < 0 ? '#DC2626' : days <= 3 ? '#DC2626' : days <= 7 ? '#D97706' : '#16A34A';
                const badgeBg    = days < 0 ? '#FEE2E2' : days <= 3 ? '#FEE2E2' : days <= 7 ? '#FEF3C7' : '#DCFCE7';
                const daysText   = days < 0 ? `过期${Math.abs(days)}天` : days === 0 ? '今天' : `${days}天`;
                // IDB 图片在离屏 canvas 中无法跨源加载，跳过使用占位 emoji
                const isIdb = isIdbRef(item.image);
                const imgHtml = isIdb
                  ? `<div style="width:56px;height:56px;border-radius:12px;background:#F5F5F4;display:flex;align-items:center;justify-content:center;font-size:22px;margin:0 auto 4px;">🥘</div>`
                  : `<img src="${item.image || DEFAULT_IMAGE}" alt="${item.name}"
                       style="width:56px;height:56px;border-radius:12px;object-fit:cover;background:#F5F5F4;display:block;margin:0 auto 4px;"
                       onerror="this.style.display='none'" />`;
                return `
                  <div style="background:#fff;border-radius:12px;padding:8px 4px 6px;text-align:center;
                               box-shadow:0 1px 4px rgba(0,0,0,0.06),0 0 0 1px rgba(0,0,0,0.03);">
                    ${imgHtml}
                    <div style="font-size:11px;color:#44403C;overflow:hidden;white-space:nowrap;text-overflow:ellipsis;padding:0 2px;">${item.name}</div>
                    <div style="margin-top:3px;">
                      <span style="font-size:9px;padding:1px 5px;border-radius:20px;background:${badgeBg};color:${badgeColor};">${daysText}</span>
                    </div>
                  </div>`;
              }).join('')}
            </div>
          </div>`;
      }).join('')}

      <!-- 底部水印 -->
      <div style="text-align:center;margin-top:16px;font-size:11px;color:#D6D0C8;">🧊 我的冰箱 App</div>
    </div>`;

  try {
    const canvas = await html2canvas(root.firstElementChild, {
      scale: 2,
      useCORS: true,
      backgroundColor: '#FDFBF7',
      logging: false,
    });

    const dataUrl = canvas.toDataURL('image/png');
    document.getElementById('poster-img').src = dataUrl;

    // 下载按钮
    const dlBtn = document.getElementById('poster-download');
    dlBtn.onclick = () => {
      const a = document.createElement('a');
      a.href     = dataUrl;
      a.download = `冰箱_${new Date().toISOString().slice(0,10)}.png`;
      a.click();
    };

    document.getElementById('poster-overlay').style.display = 'flex';
  } catch (err) {
    alert('海报生成失败，请稍后重试');
    console.error(err);
  } finally {
    root.innerHTML = '';
    btn.textContent = origText;
    btn.disabled = false;
  }
}

// 关闭海报模态框
document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('poster-close').addEventListener('click', () => {
    document.getElementById('poster-overlay').style.display = 'none';
  });
  document.getElementById('poster-overlay').addEventListener('click', e => {
    if (e.target === document.getElementById('poster-overlay')) {
      document.getElementById('poster-overlay').style.display = 'none';
    }
  });
});
