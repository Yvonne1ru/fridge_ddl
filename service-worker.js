// ── 版本号：每次更新 assets 后改这里，用户下次联网自动刷新 ──
const CACHE_NAME = 'fridge-v1';

// 需要缓存的静态文件（页面壳 + 所有脚本 + 所有 assets 图片）
const STATIC_FILES = [
  './',
  './index.html',
  './data.js',
  './store.js',
  './app.js',
  './manifest.json',
  './assets/apricot.png',
  './assets/baby_cabbage.png',
  './assets/baby_cabbage_frozen_tofu_soup.png',
  './assets/bayberry.png',
  './assets/bean_sprout.png',
  './assets/beef.png',
  './assets/beef_ball.png',
  './assets/beef_roll_vegetables.png',
  './assets/beef_rolls.png',
  './assets/broccoli.png',
  './assets/cabbage.png',
  './assets/cauliflower.png',
  './assets/century_egg_tofu.png',
  './assets/chestnut.png',
  './assets/chicken_breast.png',
  './assets/chicken_leg.png',
  './assets/chili_sauce.png',
  './assets/chinese_chives.png',
  './assets/chinese_yam.png',
  './assets/chives.png',
  './assets/clam.png',
  './assets/clam_luffa_soup.png',
  './assets/cold-tossed_okra.png',
  './assets/coriander.png',
  './assets/cream_cake.png',
  './assets/cucumber.png',
  './assets/egg.png',
  './assets/eggplant.png',
  './assets/fish_ball.png',
  './assets/fish_beef_balls_stew.png',
  './assets/fish_sauce.png',
  './assets/flat_peach.png',
  './assets/frozen_tofu.png',
  './assets/frozen_yogurt_ice_cream.png',
  './assets/green_pepper.png',
  './assets/honey_peach.png',
  './assets/icon-192.png',
  './assets/icon-512.png',
  './assets/japanese_mashed_potato.png',
  './assets/konjac_noodle.png',
  './assets/korean_chili_paste.png',
  './assets/korean_spicy_rice_cake.png',
  './assets/lemon.png',
  './assets/mango.png',
  './assets/mango_milk_shaved_ice.png',
  './assets/mayonnaise.png',
  './assets/melon.png',
  './assets/milk.png',
  './assets/millet_pepper.png',
  './assets/mung_bean.png',
  './assets/mung_bean_smoothie.png',
  './assets/mushroom_chicken_stew.png',
  './assets/nectarine.png',
  './assets/okra.png',
  './assets/onion.png',
  './assets/oyster_sauce.png',
  './assets/pan_seared_salmon.png',
  './assets/potato.png',
  './assets/potato_chicken_leg_pot.png',
  './assets/pumpkin.png',
  './assets/pumpkin_milk_soup.png',
  './assets/purple_cabbage.png',
  './assets/purple_sweet_potato.png',
  './assets/razor_clam.png',
  './assets/red-braised_pork_ribs.png',
  './assets/red_bean.png',
  './assets/red_braised_beef.png',
  './assets/rice_cake.png',
  './assets/salmon.png',
  './assets/salted_duck_egg.png',
  './assets/scrambled_eggs_with_onion.png',
  './assets/scrambled_eggs_with_tomato.png',
  './assets/sea_cucumber.png',
  './assets/shrimp.png',
  './assets/soybean_paste.png',
  './assets/sponge_gourd.png',
  './assets/stir_fried_broccoli_cauliflower.png',
  './assets/stir_fried_leek_bean_sprouts.png',
  './assets/stir_fried_sea_cucumber_with_onion.png',
  './assets/strawberry_jam.png',
  './assets/sweet_bean_sauce.png',
  './assets/taro_red_bean_soup.png',
  './assets/tofu.png',
  './assets/tomato.png',
  './assets/truffle_beef_braised_cabbage.png',
  './assets/watermelon.png',
  './assets/white_sauce_konjac_noodle.png',
  './assets/wood_ear.png',
  './assets/yoghurt.png',
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
