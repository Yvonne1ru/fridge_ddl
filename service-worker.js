// ── 版本号：每次更新 assets 后改这里，用户下次联网自动刷新 ──
const CACHE_NAME = 'fridge-v4';

// 需要缓存的静态文件（页面壳 + 所有脚本 + 所有 assets 图片）
const STATIC_FILES = [
  './',
  './index.html',
  './data.js',
  './store.js',
  './app.js',
  './manifest.json',
  './assets/apricot.webp',
  './assets/baby_cabbage.webp',
  './assets/baby_cabbage_frozen_tofu_soup.webp',
  './assets/bayberry.webp',
  './assets/bean_sprout.webp',
  './assets/beef.webp',
  './assets/beef_ball.webp',
  './assets/beef_roll_vegetables.webp',
  './assets/beef_rolls.webp',
  './assets/broccoli.webp',
  './assets/cabbage.webp',
  './assets/cauliflower.webp',
  './assets/century_egg_tofu.webp',
  './assets/chestnut.webp',
  './assets/chicken_breast.webp',
  './assets/chicken_leg.webp',
  './assets/chili_sauce.webp',
  './assets/chinese_chives.webp',
  './assets/chinese_yam.webp',
  './assets/chives.webp',
  './assets/clam.webp',
  './assets/clam_luffa_soup.webp',
  './assets/cold-tossed_okra.webp',
  './assets/coriander.webp',
  './assets/cream_cake.webp',
  './assets/cucumber.webp',
  './assets/egg.webp',
  './assets/eggplant.webp',
  './assets/fish_ball.webp',
  './assets/fish_beef_balls_stew.webp',
  './assets/fish_sauce.webp',
  './assets/flat_peach.webp',
  './assets/frozen_tofu.webp',
  './assets/frozen_yogurt_ice_cream.webp',
  './assets/green_pepper.webp',
  './assets/honey_peach.webp',
  './assets/icon-192.webp',
  './assets/icon-512.webp',
  './assets/japanese_mashed_potato.webp',
  './assets/konjac_noodle.webp',
  './assets/korean_chili_paste.webp',
  './assets/korean_spicy_rice_cake.webp',
  './assets/lemon.webp',
  './assets/mango.webp',
  './assets/mango_milk_shaved_ice.webp',
  './assets/mayonnaise.webp',
  './assets/melon.webp',
  './assets/milk.webp',
  './assets/millet_pepper.webp',
  './assets/mung_bean.webp',
  './assets/mung_bean_smoothie.webp',
  './assets/mushroom_chicken_stew.webp',
  './assets/nectarine.webp',
  './assets/okra.webp',
  './assets/onion.webp',
  './assets/oyster_sauce.webp',
  './assets/pan_seared_salmon.webp',
  './assets/potato.webp',
  './assets/potato_chicken_leg_pot.webp',
  './assets/pumpkin.webp',
  './assets/pumpkin_milk_soup.webp',
  './assets/purple_cabbage.webp',
  './assets/purple_sweet_potato.webp',
  './assets/razor_clam.webp',
  './assets/red-braised_pork_ribs.webp',
  './assets/red_bean.webp',
  './assets/red_braised_beef.webp',
  './assets/rice_cake.webp',
  './assets/salmon.webp',
  './assets/salted_duck_egg.webp',
  './assets/scrambled_eggs_with_onion.webp',
  './assets/scrambled_eggs_with_tomato.webp',
  './assets/sea_cucumber.webp',
  './assets/shrimp.webp',
  './assets/soybean_paste.webp',
  './assets/sponge_gourd.webp',
  './assets/stir_fried_broccoli_cauliflower.webp',
  './assets/stir_fried_leek_bean_sprouts.webp',
  './assets/stir_fried_sea_cucumber_with_onion.webp',
  './assets/strawberry_jam.webp',
  './assets/sweet_bean_sauce.webp',
  './assets/taro_red_bean_soup.webp',
  './assets/tofu.webp',
  './assets/tomato.webp',
  './assets/truffle_beef_braised_cabbage.webp',
  './assets/watermelon.webp',
  './assets/white_sauce_konjac_noodle.webp',
  './assets/wood_ear.webp',
  './assets/yoghurt.webp',
];

// 安装：预缓存所有静态文件
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(STATIC_FILES))
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

// 请求拦截：优先读缓存，缓存没有再联网（离线优先策略）
self.addEventListener('fetch', event => {
  // 只处理 GET 请求
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request).then(cached => {
      if (cached) return cached;
      return fetch(event.request).then(response => {
        // 动态请求成功后也缓存进去（比如新增的图片）
        if (response.ok) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        }
        return response;
      }).catch(() => {
        // 联网失败且无缓存：对 HTML 请求返回主页（让 App 在离线时也能启动）
        if (event.request.destination === 'document') {
          return caches.match('./index.html');
        }
      });
    })
  );
});
