export type PhoneModel = {
  id: string;
  name: string;
  basePrice: number; // EUR — indicative buyback for 128GB / goede staat / 1 jaar
  storages: string[]; // values match STORAGE_MULT keys: "64","128","256","512","1024"
  colors: string[];
};

export type PhoneBrand = {
  id: string;
  name: string;
  models: PhoneModel[];
};

export const BRANDS: PhoneBrand[] = [
  {
    id: "apple",
    name: "Apple",
    models: [
      // iPhone 17 series
      { id: "iphone-17-pro-max", name: "iPhone 17 Pro Max", basePrice: 1250, storages: ["256", "512", "1024"], colors: ["Natural Titanium", "Black Titanium", "White Titanium", "Desert Titanium"] },
      { id: "iphone-17-pro", name: "iPhone 17 Pro", basePrice: 1050, storages: ["256", "512", "1024"], colors: ["Natural Titanium", "Black Titanium", "White Titanium", "Desert Titanium"] },
      { id: "iphone-17-air", name: "iPhone 17 Air", basePrice: 950, storages: ["256", "512", "1024"], colors: ["Zwart", "Wit", "Lichtblauw", "Goud"] },
      { id: "iphone-17", name: "iPhone 17", basePrice: 800, storages: ["128", "256", "512"], colors: ["Zwart", "Wit", "Roze", "Blauw", "Geel", "Groen"] },
      // iPhone 16 series
      { id: "iphone-16-pro-max", name: "iPhone 16 Pro Max", basePrice: 1050, storages: ["256", "512", "1024"], colors: ["Black Titanium", "White Titanium", "Natural Titanium", "Desert Titanium"] },
      { id: "iphone-16-pro", name: "iPhone 16 Pro", basePrice: 880, storages: ["128", "256", "512", "1024"], colors: ["Black Titanium", "White Titanium", "Natural Titanium", "Desert Titanium"] },
      { id: "iphone-16-plus", name: "iPhone 16 Plus", basePrice: 720, storages: ["128", "256", "512"], colors: ["Zwart", "Wit", "Roze", "Teal", "Ultramarijn"] },
      { id: "iphone-16", name: "iPhone 16", basePrice: 640, storages: ["128", "256", "512"], colors: ["Zwart", "Wit", "Roze", "Teal", "Ultramarijn"] },
      { id: "iphone-16e", name: "iPhone 16e", basePrice: 520, storages: ["128", "256", "512"], colors: ["Zwart", "Wit"] },
      // iPhone 15 series
      { id: "iphone-15-pro-max", name: "iPhone 15 Pro Max", basePrice: 880, storages: ["256", "512", "1024"], colors: ["Natural Titanium", "Blue Titanium", "White Titanium", "Black Titanium"] },
      { id: "iphone-15-pro", name: "iPhone 15 Pro", basePrice: 720, storages: ["128", "256", "512", "1024"], colors: ["Natural Titanium", "Blue Titanium", "White Titanium", "Black Titanium"] },
      { id: "iphone-15-plus", name: "iPhone 15 Plus", basePrice: 580, storages: ["128", "256", "512"], colors: ["Zwart", "Geel", "Roze", "Groen", "Blauw"] },
      { id: "iphone-15", name: "iPhone 15", basePrice: 520, storages: ["128", "256", "512"], colors: ["Zwart", "Geel", "Roze", "Groen", "Blauw"] },
      // iPhone 14 series
      { id: "iphone-14-pro-max", name: "iPhone 14 Pro Max", basePrice: 680, storages: ["128", "256", "512", "1024"], colors: ["Space Black", "Zilver", "Goud", "Deep Purple"] },
      { id: "iphone-14-pro", name: "iPhone 14 Pro", basePrice: 560, storages: ["128", "256", "512", "1024"], colors: ["Space Black", "Zilver", "Goud", "Deep Purple"] },
      { id: "iphone-14-plus", name: "iPhone 14 Plus", basePrice: 440, storages: ["128", "256", "512"], colors: ["Middernacht", "Sterrenlicht", "Rood", "Blauw", "Paars", "Geel"] },
      { id: "iphone-14", name: "iPhone 14", basePrice: 400, storages: ["128", "256", "512"], colors: ["Middernacht", "Sterrenlicht", "Rood", "Blauw", "Paars", "Geel"] },
      // iPhone 13 series
      { id: "iphone-13-pro-max", name: "iPhone 13 Pro Max", basePrice: 540, storages: ["128", "256", "512", "1024"], colors: ["Sierra Blue", "Zilver", "Goud", "Grafiet", "Alpine Green"] },
      { id: "iphone-13-pro", name: "iPhone 13 Pro", basePrice: 460, storages: ["128", "256", "512", "1024"], colors: ["Sierra Blue", "Zilver", "Goud", "Grafiet", "Alpine Green"] },
      { id: "iphone-13", name: "iPhone 13", basePrice: 340, storages: ["128", "256", "512"], colors: ["Middernacht", "Sterrenlicht", "Rood", "Blauw", "Roze", "Groen"] },
      { id: "iphone-13-mini", name: "iPhone 13 mini", basePrice: 300, storages: ["128", "256", "512"], colors: ["Middernacht", "Sterrenlicht", "Rood", "Blauw", "Roze", "Groen"] },
      // iPhone 12 / SE
      { id: "iphone-12-pro-max", name: "iPhone 12 Pro Max", basePrice: 380, storages: ["128", "256", "512"], colors: ["Grafiet", "Zilver", "Goud", "Pacific Blue"] },
      { id: "iphone-12-pro", name: "iPhone 12 Pro", basePrice: 320, storages: ["128", "256", "512"], colors: ["Grafiet", "Zilver", "Goud", "Pacific Blue"] },
      { id: "iphone-12", name: "iPhone 12", basePrice: 260, storages: ["64", "128", "256"], colors: ["Zwart", "Wit", "Rood", "Groen", "Blauw", "Paars"] },
      { id: "iphone-12-mini", name: "iPhone 12 mini", basePrice: 220, storages: ["64", "128", "256"], colors: ["Zwart", "Wit", "Rood", "Groen", "Blauw", "Paars"] },
      { id: "iphone-se-2022", name: "iPhone SE (2022)", basePrice: 200, storages: ["64", "128", "256"], colors: ["Middernacht", "Sterrenlicht", "Rood"] },
      { id: "iphone-11-pro-max", name: "iPhone 11 Pro Max", basePrice: 260, storages: ["64", "256", "512"], colors: ["Space Gray", "Zilver", "Goud", "Midnight Green"] },
      { id: "iphone-11-pro", name: "iPhone 11 Pro", basePrice: 220, storages: ["64", "256", "512"], colors: ["Space Gray", "Zilver", "Goud", "Midnight Green"] },
      { id: "iphone-11", name: "iPhone 11", basePrice: 180, storages: ["64", "128", "256"], colors: ["Zwart", "Wit", "Rood", "Geel", "Groen", "Paars"] },
    ],
  },
  {
    id: "samsung",
    name: "Samsung",
    models: [
      // Galaxy S25
      { id: "s25-ultra", name: "Galaxy S25 Ultra", basePrice: 1050, storages: ["256", "512", "1024"], colors: ["Titanium Silverblue", "Titanium Black", "Titanium Whitesilver", "Titanium Gray"] },
      { id: "s25-plus", name: "Galaxy S25+", basePrice: 820, storages: ["256", "512"], colors: ["Navy", "Icyblue", "Mint", "Silver Shadow"] },
      { id: "s25", name: "Galaxy S25", basePrice: 680, storages: ["128", "256", "512"], colors: ["Navy", "Icyblue", "Mint", "Silver Shadow"] },
      // Galaxy S24
      { id: "s24-ultra", name: "Galaxy S24 Ultra", basePrice: 820, storages: ["256", "512", "1024"], colors: ["Titanium Black", "Titanium Gray", "Titanium Violet", "Titanium Yellow"] },
      { id: "s24-plus", name: "Galaxy S24+", basePrice: 620, storages: ["256", "512"], colors: ["Onyx Black", "Marble Gray", "Cobalt Violet", "Amber Yellow"] },
      { id: "s24", name: "Galaxy S24", basePrice: 520, storages: ["128", "256", "512"], colors: ["Onyx Black", "Marble Gray", "Cobalt Violet", "Amber Yellow"] },
      { id: "s24-fe", name: "Galaxy S24 FE", basePrice: 380, storages: ["128", "256", "512"], colors: ["Graphite", "Gray", "Blue", "Mint", "Yellow"] },
      // Galaxy S23
      { id: "s23-ultra", name: "Galaxy S23 Ultra", basePrice: 640, storages: ["256", "512", "1024"], colors: ["Phantom Black", "Cream", "Green", "Lavender"] },
      { id: "s23-plus", name: "Galaxy S23+", basePrice: 480, storages: ["256", "512"], colors: ["Phantom Black", "Cream", "Green", "Lavender"] },
      { id: "s23", name: "Galaxy S23", basePrice: 400, storages: ["128", "256", "512"], colors: ["Phantom Black", "Cream", "Green", "Lavender"] },
      { id: "s23-fe", name: "Galaxy S23 FE", basePrice: 300, storages: ["128", "256"], colors: ["Graphite", "Mint", "Cream", "Purple"] },
      // Galaxy S22
      { id: "s22-ultra", name: "Galaxy S22 Ultra", basePrice: 460, storages: ["128", "256", "512", "1024"], colors: ["Phantom Black", "Phantom White", "Green", "Burgundy"] },
      { id: "s22-plus", name: "Galaxy S22+", basePrice: 340, storages: ["128", "256"], colors: ["Phantom Black", "Phantom White", "Green", "Pink Gold"] },
      { id: "s22", name: "Galaxy S22", basePrice: 280, storages: ["128", "256"], colors: ["Phantom Black", "Phantom White", "Green", "Pink Gold"] },
      // Z Fold / Flip
      { id: "z-fold-6", name: "Galaxy Z Fold 6", basePrice: 1180, storages: ["256", "512", "1024"], colors: ["Silver Shadow", "Pink", "Navy"] },
      { id: "z-fold-5", name: "Galaxy Z Fold 5", basePrice: 780, storages: ["256", "512", "1024"], colors: ["Icy Blue", "Phantom Black", "Cream"] },
      { id: "z-flip-6", name: "Galaxy Z Flip 6", basePrice: 720, storages: ["256", "512"], colors: ["Silver Shadow", "Yellow", "Blue", "Mint"] },
      { id: "z-flip-5", name: "Galaxy Z Flip 5", basePrice: 460, storages: ["256", "512"], colors: ["Mint", "Graphite", "Cream", "Lavender"] },
      // A-serie
      { id: "a55", name: "Galaxy A55", basePrice: 280, storages: ["128", "256"], colors: ["Awesome Iceblue", "Awesome Navy", "Awesome Lilac", "Awesome Lemon"] },
      { id: "a54", name: "Galaxy A54", basePrice: 220, storages: ["128", "256"], colors: ["Awesome Graphite", "Awesome Lime", "Awesome Violet", "Awesome White"] },
      { id: "a35", name: "Galaxy A35", basePrice: 200, storages: ["128", "256"], colors: ["Awesome Navy", "Awesome Iceblue", "Awesome Lilac", "Awesome Lemon"] },
      { id: "a34", name: "Galaxy A34", basePrice: 160, storages: ["128", "256"], colors: ["Awesome Graphite", "Awesome Silver", "Awesome Violet", "Awesome Lime"] },
      { id: "a15", name: "Galaxy A15", basePrice: 110, storages: ["128", "256"], colors: ["Blue Black", "Blue", "Yellow", "Light Blue"] },
    ],
  },
  {
    id: "google",
    name: "Google",
    models: [
      { id: "pixel-9-pro-xl", name: "Pixel 9 Pro XL", basePrice: 880, storages: ["128", "256", "512", "1024"], colors: ["Obsidian", "Porcelain", "Hazel", "Rose Quartz"] },
      { id: "pixel-9-pro", name: "Pixel 9 Pro", basePrice: 760, storages: ["128", "256", "512", "1024"], colors: ["Obsidian", "Porcelain", "Hazel", "Rose Quartz"] },
      { id: "pixel-9", name: "Pixel 9", basePrice: 620, storages: ["128", "256"], colors: ["Obsidian", "Porcelain", "Wintergreen", "Peony"] },
      { id: "pixel-9-pro-fold", name: "Pixel 9 Pro Fold", basePrice: 1280, storages: ["256", "512"], colors: ["Obsidian", "Porcelain"] },
      { id: "pixel-8-pro", name: "Pixel 8 Pro", basePrice: 540, storages: ["128", "256", "512", "1024"], colors: ["Obsidian", "Porcelain", "Bay"] },
      { id: "pixel-8", name: "Pixel 8", basePrice: 400, storages: ["128", "256"], colors: ["Obsidian", "Hazel", "Rose", "Mint"] },
      { id: "pixel-8a", name: "Pixel 8a", basePrice: 320, storages: ["128", "256"], colors: ["Obsidian", "Porcelain", "Bay", "Aloe"] },
      { id: "pixel-7-pro", name: "Pixel 7 Pro", basePrice: 360, storages: ["128", "256", "512"], colors: ["Obsidian", "Snow", "Hazel"] },
      { id: "pixel-7", name: "Pixel 7", basePrice: 260, storages: ["128", "256"], colors: ["Obsidian", "Snow", "Lemongrass"] },
      { id: "pixel-7a", name: "Pixel 7a", basePrice: 220, storages: ["128"], colors: ["Charcoal", "Sea", "Snow", "Coral"] },
      { id: "pixel-6-pro", name: "Pixel 6 Pro", basePrice: 240, storages: ["128", "256", "512"], colors: ["Stormy Black", "Cloudy White", "Sorta Sunny"] },
      { id: "pixel-6", name: "Pixel 6", basePrice: 180, storages: ["128", "256"], colors: ["Stormy Black", "Sorta Seafoam", "Kinda Coral"] },
    ],
  },
  {
    id: "oneplus",
    name: "OnePlus",
    models: [
      { id: "13", name: "OnePlus 13", basePrice: 720, storages: ["256", "512", "1024"], colors: ["Black Eclipse", "Arctic Dawn", "Midnight Ocean"] },
      { id: "12", name: "OnePlus 12", basePrice: 540, storages: ["256", "512"], colors: ["Silky Black", "Flowy Emerald", "Pale Green"] },
      { id: "11", name: "OnePlus 11", basePrice: 380, storages: ["128", "256"], colors: ["Titan Black", "Eternal Green"] },
      { id: "10-pro", name: "OnePlus 10 Pro", basePrice: 280, storages: ["128", "256"], colors: ["Volcanic Black", "Emerald Forest"] },
      { id: "nord-4", name: "OnePlus Nord 4", basePrice: 320, storages: ["256", "512"], colors: ["Obsidian Midnight", "Mercurial Silver", "Oasis Green"] },
      { id: "nord-3", name: "OnePlus Nord 3", basePrice: 220, storages: ["128", "256"], colors: ["Tempest Gray", "Misty Green"] },
      { id: "nord-ce-4", name: "OnePlus Nord CE 4", basePrice: 200, storages: ["128", "256"], colors: ["Dark Chrome", "Celadon Marble"] },
    ],
  },
  {
    id: "xiaomi",
    name: "Xiaomi",
    models: [
      { id: "15-ultra", name: "Xiaomi 15 Ultra", basePrice: 980, storages: ["512", "1024"], colors: ["Zwart", "Wit", "Silver Chrome"] },
      { id: "15", name: "Xiaomi 15", basePrice: 620, storages: ["256", "512"], colors: ["Black", "White", "Green", "Liquid Silver"] },
      { id: "14-ultra", name: "Xiaomi 14 Ultra", basePrice: 720, storages: ["512", "1024"], colors: ["Black", "White"] },
      { id: "14", name: "Xiaomi 14", basePrice: 460, storages: ["256", "512"], colors: ["Black", "White", "Jade Green"] },
      { id: "13-pro", name: "Xiaomi 13 Pro", basePrice: 380, storages: ["256", "512"], colors: ["Ceramic Black", "Ceramic White", "Flora Green"] },
      { id: "13", name: "Xiaomi 13", basePrice: 280, storages: ["128", "256"], colors: ["Black", "White", "Green", "Blue"] },
      { id: "redmi-note-14-pro", name: "Redmi Note 14 Pro", basePrice: 220, storages: ["128", "256", "512"], colors: ["Black", "Lavender Purple", "Mint Green", "Phantom Purple"] },
      { id: "redmi-note-13-pro", name: "Redmi Note 13 Pro", basePrice: 180, storages: ["128", "256", "512"], colors: ["Midnight Black", "Lavender Purple", "Forest Green", "Ocean Teal"] },
      { id: "poco-x6-pro", name: "POCO X6 Pro", basePrice: 220, storages: ["256", "512"], colors: ["Black", "Yellow", "Gray"] },
    ],
  },
  {
    id: "other",
    name: "Ander merk",
    models: [
      { id: "other", name: "Ander model", basePrice: 200, storages: ["64", "128", "256", "512"], colors: ["Zwart", "Wit", "Grijs", "Blauw", "Goud", "Anders"] },
    ],
  },
];

export function getBrand(id: string) {
  return BRANDS.find((b) => b.id === id) ?? BRANDS[0];
}

export function getModel(brandId: string, modelId: string) {
  const b = getBrand(brandId);
  return b.models.find((m) => m.id === modelId);
}
