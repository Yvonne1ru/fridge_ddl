// ─── 分类 ───────────────────────────────────────────────
const CATEGORIES = ['肉和海鲜', '豆奶类', '蔬菜', '水果', '酱料饮品','主食'];

// ─── 食材目录（唯一数据来源：改这里就够了）────────────────
// 格式：{ name, file, category }
// name   = 中文名（显示用 + 检索用）
// file   = assets/ 目录下的文件名（不含路径前缀）
// category = CATEGORIES 中的一项
const INGREDIENT_CATALOG = [
  // 肉和海鲜
  { name: '鸡胸',   file: 'chicken_breast.png',            category: '肉和海鲜' },
  { name: '鸡腿',   file: 'chicken_leg.png',               category: '肉和海鲜' },
  { name: '虾',     file: 'shrimp.png',                    category: '肉和海鲜' },
  { name: '三文鱼', file: 'salmon.png',                    category: '肉和海鲜' },
  { name: '牛里脊', file: 'beef.png',           category: '肉和海鲜' },
  { name: '肥牛卷', file: 'beef_rolls.png',                 category: '肉和海鲜' },
  { name: '鱼丸',   file: 'fish_ball.png',                 category: '肉和海鲜' },
  { name: '牛肉丸', file: 'beef_ball.png',                 category: '肉和海鲜' },
  { name: '花蛤',   file: 'clam.png',                      category: '肉和海鲜' },
  { name: '蛏子',   file: 'razor_clam.png',                category: '肉和海鲜' },
  { name: '海参',   file: 'sea_cucumber.png',          category: '肉和海鲜' },
  // 豆奶类
  { name: '鸡蛋',         file: 'egg.png',                 category: '豆奶类'   },
  { name: '牛奶',         file: 'milk.png',                category: '豆奶类'   },
  { name: '酸奶',         file: 'yoghurt.png',              category: '豆奶类'   },
  { name: '包浆豆腐',     file: 'tofu.png',          category: '豆奶类'   },
  { name: '冻豆腐',       file: 'frozen_tofu.png',         category: '豆奶类'   },
  { name: '流心咸鸭蛋',   file: 'salted_duck_egg.png',     category: '豆奶类'   },
  // 蔬菜
  { name: '紫红洋葱', file: 'onion.png',               category: '蔬菜'     },
  { name: '娃娃菜',   file: 'baby_cabbage.png',            category: '蔬菜'     },
  { name: '去皮土豆', file: 'potato.png',           category: '蔬菜'     },
  { name: '秋葵',     file: 'okra.png',                    category: '蔬菜'     },
  { name: '贝贝南瓜', file: 'pumpkin.png',            category: '蔬菜'     },
  { name: '紫薯',     file: 'purple_sweet_potato.png',     category: '蔬菜'     },
  { name: '青辣椒',   file: 'green_pepper.png',            category: '蔬菜'     },
  { name: '小米椒',   file: 'millet_pepper.png',           category: '蔬菜'     },
  { name: '山药',     file: 'chinese_yam.png',             category: '蔬菜'     },
  { name: '西兰花',   file: 'broccoli.png',                category: '蔬菜'     },
  { name: '黄瓜',     file: 'cucumber.png',                category: '蔬菜'     },
  { name: '丝瓜',     file: 'sponge_gourd.png',            category: '蔬菜'     },
  { name: '花菜',     file: 'cauliflower.png',             category: '蔬菜'     },
  { name: '西红柿',   file: 'tomato.png',                  category: '蔬菜'     },
  { name: '香菜',     file: 'coriander.png',               category: '蔬菜'     },
  { name: '香葱',     file: 'chives.png',                category: '蔬菜'     },
  { name: '茄子',     file: 'eggplant.png',                category: '蔬菜'     },
  { name: '紫甘蓝',   file: 'purple_cabbage.png',          category: '蔬菜'     },
  { name: '包菜',     file: 'cabbage.png',                 category: '蔬菜'     },
  { name: '木耳',     file: 'wood_ear.png',                category: '蔬菜'     },
  { name: '豆芽',     file: 'bean_sprout.png',             category: '蔬菜'     },
  { name: '韭菜',     file: 'chinese_chives.png',          category: '蔬菜'     },
  // 水果
  { name: '水蜜桃', file: 'honey_peach.png',               category: '水果'     },
  { name: '杨梅',   file: 'bayberry.png',                  category: '水果'     },
  { name: '小白杏', file: 'apricot.png',                   category: '水果'     },
  { name: '西瓜',   file: 'watermelon.png',                category: '水果'     },
  { name: '甜瓜',   file: 'melon.png',                     category: '水果'     },
  { name: '栗子',   file: 'chestnut.png',                  category: '水果'     },
  { name: '蟠桃',   file: 'flat_peach.png',                category: '水果'     },
  { name: '油桃',   file: 'nectarine.png',                 category: '水果'     },
  { name: '芒果',   file: 'mango.png',                   category: '水果'     },
  { name: '柠檬',   file: 'lemon.png',                   category: '水果'     },
  // 酱料饮品
  { name: '草莓酱', file: 'strawberry_jam.png',              category: '酱料饮品' },
  { name: '蛋黄酱', file: 'mayonnaise.png',            category: '酱料饮品' },
  { name: '鱼露',   file: 'fish_sauce.png',            category: '酱料饮品' },
  { name: '蚝油',   file: 'oyster_sauce.png',          category: '酱料饮品' },
  { name: '黄豆酱', file: 'soybean_paste.png',         category: '酱料饮品' },
  { name: '甜面酱', file: 'sweet_bean_sauce.png',      category: '酱料饮品' },
  { name: '辣椒酱', file: 'chili_sauce.png',           category: '酱料饮品' },
  { name: '韩式辣酱', file: 'korean_chili_paste.png',  category: '酱料饮品' },
  // 主食
  { name: '奶油蛋糕', file: 'cream_cake.png',              category: '主食' },
  { name: '魔芋面',   file: 'konjac_noodle.png',           category: '主食'     },
  { name: '年糕',   file: 'rice_cake.png',             category: '主食' },
  { name: '红豆',   file: 'red_bean.png',                category: '主食' },
  { name: '绿豆',   file: 'mung_bean.png',               category: '主食' },

];

// ─── 从目录自动生成 ASSETS_MAP 和 MOCK_LIBRARY ───────────
const ASSETS_MAP = {};
const MOCK_LIBRARY = [];

INGREDIENT_CATALOG.forEach((entry, i) => {
  const path = `assets/${entry.file}`;
  ASSETS_MAP[entry.name] = path;
  MOCK_LIBRARY.push({
    id:       `lib-${i + 1}`,
    name:     entry.name,
    category: entry.category,
    image:    path,
  });
});

// ─── 默认图片（未映射时使用）────────────────────────────
const DEFAULT_IMAGE = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='64' height='64' viewBox='0 0 64 64'%3E%3Crect width='64' height='64' rx='12' fill='%23F3F0E8'/%3E%3Ctext x='32' y='42' font-size='28' text-anchor='middle'%3E🥗%3C/text%3E%3C/svg%3E";

function getAsset(name) {
  return ASSETS_MAP[name] || DEFAULT_IMAGE;
}

// ─── 示例菜谱 ─────────────────────────────────────────────
const RECIPES = [
  {
    id: 1,
    name: '番茄炒蛋',
    time: '10 分钟',
    difficulty: '懒人友好',
    description: '酸甜可口，蛋嫩汁浓，国民下饭菜，简单快手零失败',
    image: 'assets/scrambled_eggs_with_tomato.png',
    ingredients: [
      { name: '鸡蛋', amount: '3 个' },
      { name: '西红柿', amount: '2 个' },
      { name: '香葱', amount: '适量' }
    ]
  },
  {
    id: 2,
    name: '洋葱炒蛋',
    time: '10 分钟',
    difficulty: '懒人友好',
    description: '葱香四溢，蛋嫩味美，简单快手家常菜，营养又下饭',
    image: 'assets/scrambled_eggs_with_onion.png',
    ingredients: [
      { name: '鸡蛋', amount: '3 个' },
      { name: '紫红洋葱', amount: '1 个' },
      { name: '香葱', amount: '适量' }
    ]
  },
  {
    id: 3,
    name: '鱼丸牛肉丸杂烩',
    time: '25 分钟',
    difficulty: '懒人友好',
    description: '鲜美弹牙，汤汁浓郁，荤素搭配营养丰富，暖身又满足',
    image: 'assets/fish_beef_balls_stew.png',
    ingredients: [
      { name: '鱼丸', amount: '150g' },
      { name: '牛肉丸', amount: '150g' },
      { name: '娃娃菜', amount: '半棵' },
      { name: '甜面酱', amount: '适量' }
    ]
  },
  {
    id: 4,
    name: '酱炒西兰花和花菜',
    time: '15 分钟',
    difficulty: '懒人友好',
    description: '酱香浓郁，脆嫩爽口，双色搭配颜值高，健康低脂好选择',
    image: 'assets/stir_fried_broccoli_cauliflower.png',
    ingredients: [
      { name: '西兰花', amount: '半棵' },
      { name: '花菜', amount: '半棵' },
      { name: '甜面酱', amount: '适量' }
    ]
  },
  {
    id: 5,
    name: '黑松露牛肉焗娃娃菜',
    time: '35 分钟',
    difficulty: '需要耐心',
    description: '松露香气馥郁，牛肉嫩滑，娃娃菜清甜，高级餐厅级美味',
    image: 'assets/truffle_beef_braised_cabbage.png',
    ingredients: [
      { name: '牛里脊', amount: '200g' },
      { name: '娃娃菜', amount: '2 棵' },
      { name: '牛奶', amount: '100ml' }
    ]
  },
  {
    id: 6,
    name: '花蛤丝瓜汤',
    time: '20 分钟',
    difficulty: '懒人友好',
    description: '汤清味鲜，花蛤肥美，丝瓜嫩滑，清热解暑夏日必备',
    image: 'assets/clam_luffa_soup.png',
    ingredients: [
      { name: '花蛤', amount: '300g' },
      { name: '丝瓜', amount: '1 根' },
      { name: '香葱', amount: '适量' }
    ]
  },
  {
    id: 7,
    name: '牛奶芒果雪冰',
    time: '10 分钟',
    difficulty: '懒人友好',
    description: '奶香浓郁，芒果香甜，冰爽解暑，夏日甜品治愈系',
    image: 'assets/mango_milk_shaved_ice.png',
    ingredients: [
      { name: '牛奶', amount: '200ml' },
      { name: '芒果', amount: '1 个' },
      { name: '西瓜', amount: '适量' }
    ]
  },
  {
    id: 8,
    name: '芋泥芋圆红豆汤',
    time: '45 分钟',
    difficulty: '需要耐心',
    description: '芋泥绵密，红豆软糯，芋圆Q弹，甜蜜暖胃治愈系甜品',
    image: 'assets/taro_red_bean_soup.png',
    ingredients: [
      { name: '紫薯', amount: '200g' },
      { name: '红豆', amount: '半个' },
      { name: '牛奶', amount: '150ml' }
    ]
  },
  {
    id: 9,
    name: '绿豆冰沙',
    time: '15 分钟',
    difficulty: '懒人友好',
    description: '清凉解暑，绿豆清香，冰爽顺滑，夏日必备消暑神器',
    image: 'assets/mung_bean_smoothie.png',
    ingredients: [
      { name: '牛奶', amount: '200ml' },
      { name: '绿豆', amount: '100g' }
    ]
  },
  {
    id: 10,
    name: '冻酸奶雪糕',
    time: '10 分钟',
    difficulty: '懒人友好',
    description: '酸甜可口，奶香浓郁，健康低脂，自制美味无添加',
    image: 'assets/frozen_yogurt_ice_cream.png',
    ingredients: [
      { name: '酸奶', amount: '300g' },
      { name: '芒果', amount: '1 个' },
      { name: '杨梅', amount: '适量' }
    ]
  },
  {
    id: 11,
    name: '香菇炖鸡',
    time: '50 分钟',
    difficulty: '需要耐心',
    description: '鸡肉鲜嫩，香菇醇香，汤汁浓郁，滋补养生家常硬菜',
    image: 'assets/mushroom_chicken_stew.png',
    ingredients: [
      { name: '鸡胸', amount: '300g' },
      { name: '鸡腿', amount: '2 个' },
      { name: '香菇', amount: '适量' },
      { name: '香葱', amount: '适量' }
    ]
  },
  {
    id: 12,
    name: '皮蛋豆腐',
    time: '10 分钟',
    difficulty: '懒人友好',
    description: '皮蛋独特，豆腐嫩滑，清爽开胃，经典凉菜零难度',
    image: 'assets/century_egg_tofu.png',
    ingredients: [
      { name: '包浆豆腐', amount: '1 盒' },
      { name: '流心咸鸭蛋', amount: '2 个' },
      { name: '香菜', amount: '适量' }
    ]
  },
  {
    id: 13,
    name: '韭菜炒豆芽',
    time: '10 分钟',
    difficulty: '懒人友好',
    description: '清脆爽口，韭菜鲜香，豆芽脆嫩，快手素菜超下饭',
    image: 'assets/stir_fried_leek_bean_sprouts.png',
    ingredients: [
      { name: '豆芽', amount: '200g' },
      { name: '韭菜', amount: '适量' },
      { name: '青辣椒', amount: '1 个' }
    ]
  },
  {
    id: 14,
    name: '香煎三文鱼',
    time: '15 分钟',
    difficulty: '需要耐心',
    description: '外焦里嫩，鱼肉鲜美，富含Omega-3，健康美味高级感',
    image: 'assets/pan_seared_salmon.png',
    ingredients: [
      { name: '三文鱼', amount: '200g' },
      { name: '黄瓜', amount: '半根' },
      { name: '柠檬', amount: '半个' }
    ]
  },
    {
    id: 15,
    name: '红烧牛肉',
    time: '60 分钟',
    difficulty: '需要耐心',
    description: '酱香浓郁，牛肉酥烂入味，汤汁拌饭绝佳，暖胃又满足',
    image: 'assets/red_braised_beef.png',
    ingredients: [
      { name: '牛里脊', amount: '500g' },
      { name: '紫红洋葱', amount: '1 个' },
      { name: '去皮土豆', amount: '2 个' }
    ]
  },
  {
    id: 16,
    name: '土豆鸡腿煲',
    time: '40 分钟',
    difficulty: '需要耐心',
    description: '鸡肉嫩滑，土豆绵软，酱香浓郁，一锅出超下饭',
    image: 'assets/potato_chicken_leg_pot.png',
    ingredients: [
      { name: '鸡腿', amount: '4 个' },
      { name: '去皮土豆', amount: '2 个' },
      { name: '青辣椒', amount: '1 个' }
    ]
  },
  {
    id: 17,
    name: '娃娃菜冻豆腐汤',
    time: '15 分钟',
    difficulty: '懒人友好',
    description: '汤鲜味美，冻豆腐吸满汤汁，娃娃菜清甜，暖胃解腻',
    image: 'assets/baby_cabbage_frozen_tofu_soup.png',
    ingredients: [
      { name: '娃娃菜', amount: '1 棵' },
      { name: '冻豆腐', amount: '100g' },
      { name: '香葱', amount: '适量' }
    ]
  },
  {
    id: 18,
    name: '牛肉卷蔬菜',
    time: '15 分钟',
    difficulty: '懒人友好',
    description: '肥牛鲜嫩，蔬菜爽脆，低脂高蛋白，简单快手减脂餐',
    image: 'assets/beef_roll_vegetables.png',
    ingredients: [
      { name: '肥牛卷', amount: '200g' },
      { name: '西兰花', amount: '半棵' },
      { name: '豆芽', amount: '100g' }
    ]
  },
  {
    id: 19,
    name: '南瓜牛奶羹',
    time: '20 分钟',
    difficulty: '懒人友好',
    description: '奶香浓郁，南瓜绵密香甜，口感顺滑，营养美味甜品',
    image: 'assets/pumpkin_milk_soup.png',
    ingredients: [
      { name: '贝贝南瓜', amount: '1 个' },
      { name: '牛奶', amount: '200ml' }
    ]
  },
    {
    id: 20,
    name: '凉拌秋葵',
    time: '10 分钟',
    difficulty: '懒人友好',
    description: '清爽脆嫩，蒜香微辣，低脂解腻，夏日开胃必备神仙凉菜',
    image: 'assets/cold-tossed_okra.png',
    ingredients: [
      { name: '秋葵', amount: '300g' },
      { name: '小米椒', amount: '2 个' },
      { name: '香葱', amount: '适量' }
    ]
  },
  {
    id: 21,
    name: '红烧排骨',
    time: '45 分钟',
    difficulty: '需要耐心',
    description: '酱香浓郁，肉质软烂脱骨，汤汁拌饭绝佳，全家都爱的硬菜',
    image: 'assets/red-braised_pork_ribs.png',
    ingredients: [
      { name: '猪肉', amount: '500g' },
      { name: '去皮土豆', amount: '2 个' },
      { name: '紫红洋葱', amount: '半个' }
    ]
  },
    {
    id: 22,
    name: '洋葱炒海参',
    time: '15 分钟',
    difficulty: '需要耐心',
    description: '葱香浓郁，海参Q弹爽滑，酱香入味，营养丰富的家常硬菜',
    image: 'assets/stir_fried_sea_cucumber_with_onion.png',
    ingredients: [
      { name: '海参', amount: '200g' },
      { name: '紫红洋葱', amount: '1 个' },
      { name: '蚝油', amount: '1 勺' }
    ]
  },
  {
    id: 23,
    name: '日式土豆泥',
    time: '20 分钟',
    difficulty: '懒人友好',
    description: '口感绵密细腻，奶香与薯香交融，清淡爽口，老少皆宜的治愈配菜',
    image: 'assets/japanese_mashed_potato.png',
    ingredients: [
      { name: '去皮土豆', amount: '2 个' },
      { name: '牛奶', amount: '50ml' },
      { name: '黄瓜', amount: '半根' }
    ]
  },
  {
    id: 24,
    name: '白酱魔芋面',
    time: '15 分钟',
    difficulty: '懒人友好',
    description: '奶香浓郁，魔芋面爽滑劲道，低卡饱腹，减脂期也能大口嗦面',
    image: 'assets/white_sauce_konjac_noodle.png',
    ingredients: [
      { name: '魔芋面', amount: '1 盒' },
      { name: '牛奶', amount: '150ml' },
      { name: '秋葵', amount: '3 根' }
    ]
  },
  {
    id: 25,
    name: '韩式辣酱炒年糕',
    time: '15 分钟',
    difficulty: '懒人友好',
    description: '甜辣交织，年糕软糯拉丝，酱汁浓郁包裹，追剧必备的解馋小吃',
    image: 'assets/korean_spicy_rice_cake.png',
    ingredients: [
      { name: '年糕', amount: '300g' },
      { name: '韩式辣酱', amount: '2 勺' },
      { name: '紫红洋葱', amount: '半个' }
    ]
  },
];

// ─── 生成相对今天的日期字符串 ────────────────────────────
function dateOffset(days) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

const MOCK_FRIDGE = [
  { id: 'f-1',  libraryId: 'lib-2',  name: '牛肉',   amount: '500', unit: 'g',  purchaseDate: dateOffset(-3), expiryDate: dateOffset(1),  category: '肉和海鲜', image: getAsset('牛肉') },
  { id: 'f-2',  libraryId: 'lib-4',  name: '鸡腿',   amount: '2',   unit: '只', purchaseDate: dateOffset(-1), expiryDate: dateOffset(4),  category: '肉和海鲜', image: getAsset('鸡腿') },
  { id: 'f-3',  libraryId: 'lib-5',  name: '虾',     amount: '300', unit: 'g',  purchaseDate: dateOffset(-2), expiryDate: dateOffset(2),  category: '肉和海鲜', image: getAsset('虾') },
  { id: 'f-4',  libraryId: 'lib-7',  name: '鸡蛋',   amount: '10',  unit: '个', purchaseDate: dateOffset(-5), expiryDate: dateOffset(25), category: '豆奶类',   image: getAsset('鸡蛋') },
  { id: 'f-5',  libraryId: 'lib-11', name: '西兰花', amount: '1',   unit: '棵', purchaseDate: dateOffset(0),  expiryDate: dateOffset(5),  category: '蔬菜',     image: getAsset('西兰花') },
  { id: 'f-6',  libraryId: 'lib-13', name: '黄瓜',   amount: '3',   unit: '根', purchaseDate: dateOffset(-1), expiryDate: dateOffset(3),  category: '蔬菜',     image: getAsset('黄瓜') },
  { id: 'f-7',  libraryId: 'lib-14', name: '土豆',   amount: '4',   unit: '个', purchaseDate: dateOffset(-4), expiryDate: dateOffset(10), category: '蔬菜',     image: getAsset('土豆') },
  { id: 'f-8',  libraryId: 'lib-15', name: '洋葱',   amount: '2',   unit: '个', purchaseDate: dateOffset(-3), expiryDate: dateOffset(14), category: '蔬菜',     image: getAsset('洋葱') },
];
