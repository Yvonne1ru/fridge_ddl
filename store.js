// store.js — 数据层（LocalStorage + IndexedDB）

const KEYS = {
  LIBRARY: 'ingredientLibrary',
  FRIDGE:  'fridgeItems',
};

// ════════════════════════════════════════════════════════
// IndexedDB — 用户上传图片存储
// 图片以 Blob 存入，读取时生成 Object URL
// libraryItem.image 存 idb://lib-xxx 作为引用键
// ════════════════════════════════════════════════════════

const IDB_NAME    = 'fridge-images';
const IDB_VERSION = 1;
const IDB_STORE   = 'photos';

function _openIDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(IDB_NAME, IDB_VERSION);
    req.onupgradeneeded = e => {
      e.target.result.createObjectStore(IDB_STORE);
    };
    req.onsuccess = e => resolve(e.target.result);
    req.onerror   = e => reject(e.target.error);
  });
}

// 存：key = 食材 id，value = Blob
async function idbSavePhoto(key, blob) {
  const db = await _openIDB();
  return new Promise((resolve, reject) => {
    const tx  = db.transaction(IDB_STORE, 'readwrite');
    const req = tx.objectStore(IDB_STORE).put(blob, key);
    req.onsuccess = () => resolve();
    req.onerror   = e => reject(e.target.error);
  });
}

// 取：返回 Object URL（用后记得 revoke）
async function idbGetPhotoURL(key) {
  const db = await _openIDB();
  return new Promise((resolve, reject) => {
    const tx  = db.transaction(IDB_STORE, 'readonly');
    const req = tx.objectStore(IDB_STORE).get(key);
    req.onsuccess = e => {
      const blob = e.target.result;
      resolve(blob ? URL.createObjectURL(blob) : null);
    };
    req.onerror = e => reject(e.target.error);
  });
}

// 删：食材从仓库移除时同步删图
async function idbDeletePhoto(key) {
  const db = await _openIDB();
  return new Promise((resolve, reject) => {
    const tx  = db.transaction(IDB_STORE, 'readwrite');
    const req = tx.objectStore(IDB_STORE).delete(key);
    req.onsuccess = () => resolve();
    req.onerror   = e => reject(e.target.error);
  });
}

// 判断是否为 IDB 引用（idb://xxx）
function isIdbRef(imagePath) {
  return typeof imagePath === 'string' && imagePath.startsWith('idb://');
}

// 将 idb:// 引用解析成可展示的 URL（异步），用于渲染
async function resolveImageURL(imagePath) {
  if (!isIdbRef(imagePath)) return imagePath;
  const key = imagePath.slice(6); // 去掉 "idb://"
  return await idbGetPhotoURL(key) || DEFAULT_IMAGE;
}

// ─── 通用 get/set ────────────────────────────────────────
function _get(key) {
  try {
    return JSON.parse(localStorage.getItem(key)) || [];
  } catch {
    return [];
  }
}

function _set(key, data) {
  localStorage.setItem(key, JSON.stringify(data));
}

// ─── 初始化（首次访问注入 Mock 数据，并同步目录新增食材）────
function initStore() {
  if (!localStorage.getItem(KEYS.FRIDGE)) {
    _set(KEYS.FRIDGE, MOCK_FRIDGE);
  }

  // 始终用 INGREDIENT_CATALOG 同步仓库：
  // 目录里有但仓库里没有的食材 → 自动追加
  const lib = _get(KEYS.LIBRARY);
  const existingNames = new Set(lib.map(i => i.name));
  const toAdd = MOCK_LIBRARY.filter(i => !existingNames.has(i.name));
  if (lib.length === 0) {
    // 首次访问：写入全部
    _set(KEYS.LIBRARY, MOCK_LIBRARY);
  } else if (toAdd.length > 0) {
    // 有新增食材：追加到末尾
    _set(KEYS.LIBRARY, [...lib, ...toAdd]);
  }
}

// ─── 食材仓库 Library ────────────────────────────────────

function getLibrary() {
  return _get(KEYS.LIBRARY);
}

function addToLibrary(item) {
  // item: { id, name, category, image }
  const lib = getLibrary();
  lib.push(item);
  _set(KEYS.LIBRARY, lib);
}

function updateLibraryItem(id, patch) {
  const lib = getLibrary().map(i => i.id === id ? { ...i, ...patch } : i);
  _set(KEYS.LIBRARY, lib);
}

function removeFromLibrary(id) {
  const item = getLibrary().find(i => i.id === id);
  if (item && isIdbRef(item.image)) idbDeletePhoto(id);
  _set(KEYS.LIBRARY, getLibrary().filter(i => i.id !== id));
}

function findInLibrary(name) {
  return getLibrary().find(i => i.name === name) || null;
}

// ─── 冰箱库存 Fridge ─────────────────────────────────────

function getFridge() {
  return _get(KEYS.FRIDGE);
}

function addToFridge(item) {
  // item: { id, libraryId, name, amount, unit, purchaseDate, expiryDate, category, image }
  const fridge = getFridge();
  fridge.push(item);
  _set(KEYS.FRIDGE, fridge);
}

function removeFromFridge(id) {
  _set(KEYS.FRIDGE, getFridge().filter(i => i.id !== id));
}

// ─── 工具：计算距今天数 ───────────────────────────────────
function daysUntilExpiry(expiryDate) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const exp = new Date(expiryDate);
  exp.setHours(0, 0, 0, 0);
  return Math.round((exp - today) / 86400000);
}

// ─── 工具：生成唯一 ID ────────────────────────────────────
function uid(prefix = 'id') {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}
