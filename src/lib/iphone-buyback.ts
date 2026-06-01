// iPhone inkoop-pricing engine — gebaseerd op
// "iPhone_website_inkoopcalculator_uitgebreid.xlsx"
// Toont een INDICATIEVE prijsrange. Definitief bod pas na controle.

export type DefectKey =
  | "screen_glass"
  | "display_oled"
  | "back_glass"
  | "housing_frame"
  | "battery_replace"
  | "rear_camera"
  | "front_camera"
  | "face_id"
  | "speaker_mic"
  | "charging_port"
  | "buttons"
  | "wifi_cellular"
  | "not_powering_on"
  | "water_damage";

export const DEFECT_LABELS: Record<DefectKey, string> = {
  screen_glass: "Schermglas gebarsten (display werkt)",
  display_oled: "Display / OLED kapot of groene lijnen",
  back_glass: "Achterglas kapot",
  housing_frame: "Behuizing / frame krom of zwaar beschadigd",
  battery_replace: "Batterij moet vervangen worden",
  rear_camera: "Achtercamera defect",
  front_camera: "Selfiecamera defect",
  face_id: "Face ID / Touch ID defect",
  speaker_mic: "Speaker of microfoon defect",
  charging_port: "Laadpoort defect",
  buttons: "Knoppen / trilfunctie defect",
  wifi_cellular: "Wifi / belmodule probleem",
  not_powering_on: "Gaat niet aan",
  water_damage: "Waterschade-indicatie",
};

export type IPhoneModel = {
  key: string;
  name: string;
  generation: string;
  baseStorage: number;
  baseValue: number;       // verkoopwaarde in goede staat (€)
  riskBuffer: number;      // €
  defects: Record<DefectKey, number>; // positieve getallen = aftrek in €
};

// Volledige modellenlijst (bron: Defectmatrix tabblad)
export const IPHONES: IPhoneModel[] = [
  { key:"iphone_17_pro_max", name:"iPhone 17 Pro Max", generation:"17", baseStorage:256, baseValue:1540, riskBuffer:55,
    defects:{screen_glass:250,display_oled:385,back_glass:220,housing_frame:405,battery_replace:100,rear_camera:190,front_camera:150,face_id:245,speaker_mic:105,charging_port:125,buttons:95,wifi_cellular:220,not_powering_on:395,water_damage:580}},
  { key:"iphone_17_pro", name:"iPhone 17 Pro", generation:"17", baseStorage:256, baseValue:1350, riskBuffer:55,
    defects:{screen_glass:225,display_oled:350,back_glass:200,housing_frame:375,battery_replace:90,rear_camera:175,front_camera:140,face_id:220,speaker_mic:95,charging_port:115,buttons:90,wifi_cellular:205,not_powering_on:365,water_damage:535}},
  { key:"iphone_17_air", name:"iPhone 17 Air", generation:"17", baseStorage:256, baseValue:1080, riskBuffer:55,
    defects:{screen_glass:195,display_oled:295,back_glass:175,housing_frame:325,battery_replace:85,rear_camera:150,front_camera:125,face_id:195,speaker_mic:90,charging_port:105,buttons:80,wifi_cellular:180,not_powering_on:325,water_damage:475}},
  { key:"iphone_17", name:"iPhone 17", generation:"17", baseStorage:128, baseValue:930, riskBuffer:55,
    defects:{screen_glass:175,display_oled:245,back_glass:165,housing_frame:275,battery_replace:80,rear_camera:130,front_camera:115,face_id:170,speaker_mic:85,charging_port:95,buttons:80,wifi_cellular:170,not_powering_on:300,water_damage:410}},
  { key:"iphone_16_pro_max", name:"iPhone 16 Pro Max", generation:"16", baseStorage:256, baseValue:1280, riskBuffer:55,
    defects:{screen_glass:220,display_oled:335,back_glass:195,housing_frame:360,battery_replace:90,rear_camera:165,front_camera:135,face_id:215,speaker_mic:95,charging_port:115,buttons:90,wifi_cellular:195,not_powering_on:355,water_damage:520}},
  { key:"iphone_16_pro", name:"iPhone 16 Pro", generation:"16", baseStorage:128, baseValue:1120, riskBuffer:55,
    defects:{screen_glass:200,display_oled:300,back_glass:180,housing_frame:330,battery_replace:85,rear_camera:155,front_camera:125,face_id:200,speaker_mic:90,charging_port:105,buttons:85,wifi_cellular:185,not_powering_on:330,water_damage:485}},
  { key:"iphone_16_plus", name:"iPhone 16 Plus", generation:"16", baseStorage:128, baseValue:870, riskBuffer:55,
    defects:{screen_glass:170,display_oled:235,back_glass:160,housing_frame:265,battery_replace:75,rear_camera:125,front_camera:110,face_id:165,speaker_mic:80,charging_port:95,buttons:75,wifi_cellular:165,not_powering_on:290,water_damage:400}},
  { key:"iphone_16", name:"iPhone 16", generation:"16", baseStorage:128, baseValue:790, riskBuffer:55,
    defects:{screen_glass:160,display_oled:220,back_glass:150,housing_frame:250,battery_replace:75,rear_camera:120,front_camera:105,face_id:155,speaker_mic:80,charging_port:90,buttons:75,wifi_cellular:160,not_powering_on:275,water_damage:385}},
  { key:"iphone_16e", name:"iPhone 16e", generation:"16", baseStorage:128, baseValue:570, riskBuffer:55,
    defects:{screen_glass:135,display_oled:185,back_glass:130,housing_frame:210,battery_replace:65,rear_camera:105,front_camera:95,face_id:135,speaker_mic:70,charging_port:80,buttons:65,wifi_cellular:140,not_powering_on:240,water_damage:340}},
  { key:"iphone_15_pro_max", name:"iPhone 15 Pro Max", generation:"15", baseStorage:256, baseValue:1080, riskBuffer:30,
    defects:{screen_glass:195,display_oled:295,back_glass:175,housing_frame:325,battery_replace:85,rear_camera:150,front_camera:125,face_id:195,speaker_mic:90,charging_port:105,buttons:80,wifi_cellular:180,not_powering_on:325,water_damage:475}},
  { key:"iphone_15_pro", name:"iPhone 15 Pro", generation:"15", baseStorage:128, baseValue:920, riskBuffer:30,
    defects:{screen_glass:175,display_oled:265,back_glass:165,housing_frame:290,battery_replace:75,rear_camera:140,front_camera:115,face_id:185,speaker_mic:80,charging_port:95,buttons:80,wifi_cellular:170,not_powering_on:295,water_damage:445}},
  { key:"iphone_15_plus", name:"iPhone 15 Plus", generation:"15", baseStorage:128, baseValue:720, riskBuffer:30,
    defects:{screen_glass:150,display_oled:210,back_glass:145,housing_frame:235,battery_replace:70,rear_camera:115,front_camera:105,face_id:150,speaker_mic:75,charging_port:85,buttons:70,wifi_cellular:155,not_powering_on:265,water_damage:370}},
  { key:"iphone_15", name:"iPhone 15", generation:"15", baseStorage:128, baseValue:650, riskBuffer:30,
    defects:{screen_glass:145,display_oled:195,back_glass:140,housing_frame:225,battery_replace:70,rear_camera:110,front_camera:100,face_id:145,speaker_mic:75,charging_port:85,buttons:70,wifi_cellular:145,not_powering_on:255,water_damage:355}},
  { key:"iphone_14_pro_max", name:"iPhone 14 Pro Max", generation:"14", baseStorage:128, baseValue:880, riskBuffer:30,
    defects:{screen_glass:170,display_oled:260,back_glass:160,housing_frame:285,battery_replace:75,rear_camera:135,front_camera:115,face_id:180,speaker_mic:80,charging_port:95,buttons:75,wifi_cellular:165,not_powering_on:290,water_damage:430}},
  { key:"iphone_14_pro", name:"iPhone 14 Pro", generation:"14", baseStorage:128, baseValue:760, riskBuffer:30,
    defects:{screen_glass:155,display_oled:230,back_glass:150,housing_frame:265,battery_replace:70,rear_camera:125,front_camera:105,face_id:165,speaker_mic:75,charging_port:90,buttons:75,wifi_cellular:155,not_powering_on:270,water_damage:405}},
  { key:"iphone_14_plus", name:"iPhone 14 Plus", generation:"14", baseStorage:128, baseValue:590, riskBuffer:30,
    defects:{screen_glass:135,display_oled:185,back_glass:135,housing_frame:215,battery_replace:65,rear_camera:105,front_camera:95,face_id:140,speaker_mic:70,charging_port:80,buttons:70,wifi_cellular:140,not_powering_on:245,water_damage:345}},
  { key:"iphone_14", name:"iPhone 14", generation:"14", baseStorage:128, baseValue:510, riskBuffer:30,
    defects:{screen_glass:125,display_oled:170,back_glass:125,housing_frame:200,battery_replace:65,rear_camera:100,front_camera:90,face_id:130,speaker_mic:70,charging_port:80,buttons:65,wifi_cellular:135,not_powering_on:230,water_damage:325}},
  { key:"iphone_13_pro_max", name:"iPhone 13 Pro Max", generation:"13", baseStorage:128, baseValue:680, riskBuffer:30,
    defects:{screen_glass:145,display_oled:215,back_glass:140,housing_frame:250,battery_replace:70,rear_camera:120,front_camera:100,face_id:155,speaker_mic:75,charging_port:85,buttons:70,wifi_cellular:150,not_powering_on:260,water_damage:390}},
  { key:"iphone_13_pro", name:"iPhone 13 Pro", generation:"13", baseStorage:128, baseValue:570, riskBuffer:30,
    defects:{screen_glass:135,display_oled:200,back_glass:130,housing_frame:225,battery_replace:65,rear_camera:115,front_camera:95,face_id:145,speaker_mic:70,charging_port:80,buttons:65,wifi_cellular:140,not_powering_on:240,water_damage:365}},
  { key:"iphone_13", name:"iPhone 13", generation:"13", baseStorage:128, baseValue:390, riskBuffer:30,
    defects:{screen_glass:110,display_oled:150,back_glass:115,housing_frame:180,battery_replace:60,rear_camera:90,front_camera:85,face_id:120,speaker_mic:65,charging_port:75,buttons:60,wifi_cellular:125,not_powering_on:210,water_damage:305}},
  { key:"iphone_13_mini", name:"iPhone 13 mini", generation:"13", baseStorage:128, baseValue:320, riskBuffer:30,
    defects:{screen_glass:105,display_oled:140,back_glass:110,housing_frame:170,battery_replace:55,rear_camera:85,front_camera:80,face_id:115,speaker_mic:60,charging_port:70,buttons:60,wifi_cellular:120,not_powering_on:200,water_damage:290}},
  { key:"iphone_12_pro_max", name:"iPhone 12 Pro Max", generation:"12", baseStorage:128, baseValue:500, riskBuffer:30,
    defects:{screen_glass:125,display_oled:185,back_glass:125,housing_frame:215,battery_replace:60,rear_camera:110,front_camera:90,face_id:140,speaker_mic:70,charging_port:80,buttons:65,wifi_cellular:135,not_powering_on:230,water_damage:350}},
  { key:"iphone_12_pro", name:"iPhone 12 Pro", generation:"12", baseStorage:128, baseValue:410, riskBuffer:30,
    defects:{screen_glass:115,display_oled:165,back_glass:115,housing_frame:200,battery_replace:60,rear_camera:95,front_camera:85,face_id:130,speaker_mic:65,charging_port:75,buttons:60,wifi_cellular:130,not_powering_on:215,water_damage:330}},
  { key:"iphone_12", name:"iPhone 12", generation:"12", baseStorage:64, baseValue:300, riskBuffer:30,
    defects:{screen_glass:100,display_oled:135,back_glass:105,housing_frame:165,battery_replace:55,rear_camera:80,front_camera:80,face_id:110,speaker_mic:60,charging_port:70,buttons:60,wifi_cellular:120,not_powering_on:200,water_damage:285}},
  { key:"iphone_12_mini", name:"iPhone 12 mini", generation:"12", baseStorage:64, baseValue:240, riskBuffer:30,
    defects:{screen_glass:95,display_oled:125,back_glass:100,housing_frame:155,battery_replace:55,rear_camera:80,front_camera:75,face_id:105,speaker_mic:60,charging_port:65,buttons:55,wifi_cellular:115,not_powering_on:190,water_damage:275}},
  { key:"iphone_se_2022", name:"iPhone SE (2022)", generation:"SE", baseStorage:64, baseValue:150, riskBuffer:30,
    defects:{screen_glass:85,display_oled:105,back_glass:95,housing_frame:140,battery_replace:50,rear_camera:70,front_camera:70,face_id:100,speaker_mic:55,charging_port:60,buttons:55,wifi_cellular:105,not_powering_on:175,water_damage:255}},
  { key:"iphone_11_pro_max", name:"iPhone 11 Pro Max", generation:"11", baseStorage:64, baseValue:360, riskBuffer:30,
    defects:{screen_glass:110,display_oled:155,back_glass:110,housing_frame:190,battery_replace:60,rear_camera:90,front_camera:80,face_id:125,speaker_mic:65,charging_port:70,buttons:60,wifi_cellular:125,not_powering_on:210,water_damage:320}},
  { key:"iphone_11_pro", name:"iPhone 11 Pro", generation:"11", baseStorage:64, baseValue:300, riskBuffer:30,
    defects:{screen_glass:100,display_oled:145,back_glass:105,housing_frame:180,battery_replace:55,rear_camera:85,front_camera:80,face_id:120,speaker_mic:60,charging_port:70,buttons:60,wifi_cellular:120,not_powering_on:200,water_damage:310}},
  { key:"iphone_11", name:"iPhone 11", generation:"11", baseStorage:64, baseValue:230, riskBuffer:30,
    defects:{screen_glass:95,display_oled:120,back_glass:100,housing_frame:155,battery_replace:55,rear_camera:75,front_camera:75,face_id:105,speaker_mic:60,charging_port:65,buttons:55,wifi_cellular:115,not_powering_on:185,water_damage:270}},
  { key:"iphone_xs_max", name:"iPhone XS Max", generation:"XS/XR", baseStorage:64, baseValue:230, riskBuffer:30,
    defects:{screen_glass:95,display_oled:120,back_glass:100,housing_frame:155,battery_replace:55,rear_camera:75,front_camera:75,face_id:105,speaker_mic:60,charging_port:65,buttons:55,wifi_cellular:115,not_powering_on:185,water_damage:270}},
  { key:"iphone_xs", name:"iPhone XS", generation:"XS/XR", baseStorage:64, baseValue:190, riskBuffer:30,
    defects:{screen_glass:90,display_oled:115,back_glass:95,housing_frame:145,battery_replace:50,rear_camera:75,front_camera:70,face_id:100,speaker_mic:55,charging_port:65,buttons:55,wifi_cellular:110,not_powering_on:180,water_damage:265}},
  { key:"iphone_xr", name:"iPhone XR", generation:"XS/XR", baseStorage:64, baseValue:180, riskBuffer:30,
    defects:{screen_glass:85,display_oled:110,back_glass:95,housing_frame:145,battery_replace:50,rear_camera:75,front_camera:70,face_id:100,speaker_mic:55,charging_port:65,buttons:55,wifi_cellular:110,not_powering_on:180,water_damage:260}},
  { key:"iphone_se_2020", name:"iPhone SE (2020)", generation:"SE", baseStorage:64, baseValue:110, riskBuffer:30,
    defects:{screen_glass:80,display_oled:100,back_glass:90,housing_frame:135,battery_replace:50,rear_camera:70,front_camera:65,face_id:95,speaker_mic:55,charging_port:60,buttons:55,wifi_cellular:105,not_powering_on:170,water_damage:245}},
];

export const STORAGE_OPTIONS: { gb: number; correction: number; label: string }[] = [
  { gb:64,   correction:0,   label:"64 GB" },
  { gb:128,  correction:45,  label:"128 GB" },
  { gb:256,  correction:90,  label:"256 GB" },
  { gb:512,  correction:160, label:"512 GB" },
  { gb:1024, correction:260, label:"1 TB" },
  { gb:2048, correction:380, label:"2 TB" },
];

export type ConditionKey = "as_new" | "good" | "fair" | "heavy";
export const CONDITIONS: { key: ConditionKey; label: string; mult: number; hint: string }[] = [
  { key:"as_new", label:"Als nieuw",      mult:1.00, hint:"Geen krasjes, ziet er bijna nieuw uit" },
  { key:"good",   label:"Goed",           mult:0.93, hint:"Lichte gebruikssporen" },
  { key:"fair",   label:"Redelijk",       mult:0.84, hint:"Duidelijke krasjes / kleine deukjes" },
  { key:"heavy",  label:"Zwaar gebruikt", mult:0.72, hint:"Veel slijtage" },
];

export type BatteryKey = "100" | "85" | "80" | "75" | "70" | "lt70" | "unknown";
export const BATTERIES: { key: BatteryKey; label: string; correction: number }[] = [
  { key:"100",     label:"90 – 100%",  correction:0 },
  { key:"85",      label:"85 – 89%",   correction:-15 },
  { key:"80",      label:"80 – 84%",   correction:-30 },
  { key:"75",      label:"75 – 79%",   correction:-55 },
  { key:"70",      label:"70 – 74%",   correction:-80 },
  { key:"lt70",    label:"Onder 70%",  correction:-115 },
  { key:"unknown", label:"Weet ik niet", correction:-50 },
];

export type LockKey = "none" | "icloud" | "simlock" | "stolen";
export const LOCKS: { key: LockKey; label: string; blocking: boolean }[] = [
  { key:"none",    label:"Geen lock — uitgelogd uit iCloud", blocking:false },
  { key:"icloud",  label:"iCloud / Apple ID nog ingelogd",   blocking:true },
  { key:"simlock", label:"Simlock / MDM / bedrijfsbeheer",   blocking:true },
  { key:"stolen",  label:"Gestolen / verloren gemeld",       blocking:true },
];

// Instellingen tab
export const SETTINGS = {
  profitMargin: 65,
  maxBidPct: 0.78,
  roundTo: 5,
  minBid: 20,
  maxDefectStackPct: 0.78,
  rangeWidthPct: 0.08,
};

export type Pricing = {
  models: IPhoneModel[];
  storage: typeof STORAGE_OPTIONS;
  conditions: typeof CONDITIONS;
  batteries: typeof BATTERIES;
  locks: typeof LOCKS;
  settings: typeof SETTINGS;
};

export const DEFAULT_PRICING: Pricing = {
  models: IPHONES,
  storage: STORAGE_OPTIONS,
  conditions: CONDITIONS,
  batteries: BATTERIES,
  locks: LOCKS,
  settings: SETTINGS,
};

export type CalcInput = {
  modelKey: string;
  storageGb: number;
  condition: ConditionKey;
  battery: BatteryKey;
  lock: LockKey;
  defects: DefectKey[];
};

export type CalcResult = {
  blocking: boolean;
  reason?: string;
  resale: number;
  adjustedResale: number;
  batteryCorrection: number;
  defectDeduction: number;
  rawBid: number;
  estimate: number;
  low: number;
  high: number;
};

export function getModelByKey(key: string, pricing: Pricing = DEFAULT_PRICING): IPhoneModel {
  return pricing.models.find(m => m.key === key) ?? pricing.models[0];
}

export function calculate(input: CalcInput, pricing: Pricing = DEFAULT_PRICING): CalcResult {
  const model = getModelByKey(input.modelKey, pricing);
  const storage = pricing.storage.find(s => s.gb === input.storageGb) ?? pricing.storage[1] ?? pricing.storage[0];
  const cond = pricing.conditions.find(c => c.key === input.condition) ?? pricing.conditions[0];
  const bat = pricing.batteries.find(b => b.key === input.battery) ?? pricing.batteries[0];
  const lock = pricing.locks.find(l => l.key === input.lock) ?? pricing.locks[0];
  const S = pricing.settings;

  const resale = Number(model.baseValue) + Number(storage.correction);
  const adjustedResale = resale * cond.mult;

  if (lock.blocking) {
    return {
      blocking: true, reason: lock.label,
      resale, adjustedResale,
      batteryCorrection: bat.correction,
      defectDeduction: 0,
      rawBid: 0, estimate: 0, low: 0, high: 0,
    };
  }

  const rawDefects = input.defects.reduce((s, d) => s + Number(model.defects[d] ?? 0), 0);
  const defectCap = adjustedResale * S.maxDefectStackPct;
  const defectDeduction = Math.min(rawDefects, defectCap);

  const provisional = adjustedResale + bat.correction - defectDeduction;
  const afterMargin = provisional - S.profitMargin - Number(model.riskBuffer);
  const cappedByMax = Math.min(afterMargin, resale * S.maxBidPct);
  const rawBid = Math.max(S.minBid, cappedByMax);

  const r = S.roundTo;
  const estimate = Math.max(S.minBid, Math.round(rawBid / r) * r);
  const w = S.rangeWidthPct;
  const low = Math.max(S.minBid, Math.round((estimate * (1 - w)) / r) * r);
  const high = Math.max(estimate + r, Math.round((estimate * (1 + w)) / r) * r);

  return {
    blocking: false,
    resale, adjustedResale,
    batteryCorrection: bat.correction,
    defectDeduction,
    rawBid, estimate, low, high,
  };
}

