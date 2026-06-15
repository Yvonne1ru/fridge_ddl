// ── 版本号：每次更新 assets 后改这里，用户下次联网自动刷新 ──
const CACHE_NAME = 'fridge-v4';

// 只预缓存最核心的壳文件（所有图片由运行时动态缓存，避免单张图片错误导致整个安装失败）
const STATIC_FILES = [
  './index.html',
  './data.js',
  './store.js',
  './app.js',
  './manifest.json',
  './assets/icon-192.png',   // 确保后缀与实际文件一致
  './assets/icon-512.png'
];

// 安装：预缓存核心文件
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(STATIC_FILES))
      .catch(err => console.error('SW 安装失败:', err))
  );
  self.skipWaiting();
});

// 激活：清除旧版本缓存
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// 请求拦截：优先读缓存，缓存没有再联网，同时动态缓存图片等资源
self.addEventListener('fetch', event => {
  // 只处理 GET 请求
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request).then(cached => {
      // 命中缓存就直接返回
      if (cached) return cached;

      // 没缓存：去网络请求
      return fetch(event.request).then(response => {
        // 只缓存成功的同源请求（防止跨域 opaque 响应进入缓存）
        if (response.ok && response.type === 'basic') {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        }
        return response;
      }).catch(() => {
        // 网络失败且无缓存：对 HTML 导航请求返回缓存的首页，保证离线启动
        if (event.request.destination === 'document') {
          return caches.match('./index.html');
        }
        // 图片或其他资源请求失败则自然报错（或可返回一张离线占位图）
      });
    })
  );
});