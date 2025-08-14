// deposits.js

// Normalize
const norm = s => String(s || "").trim().toLowerCase();

// These four are the “Open/Optional Sign-Ups we’ll reserve now”
export const OPTIONAL_SIGNUPS_KEYS = [
  "damas island mangrove",
  "waterfall rappelling",
  "surf lessons",
  "jungle tubing",
];

// Catalog: use fixed prices when we have them; ranges become text (no numeric total)
export const activityCatalog = [
  {
    key: "damas island mangrove",
    label: "Damas Island Mangrove Tour",
    reservationBacked: true,
    price: 75,           // default to Day price for simplicity
    priceText: "$75 Day (Night $85 available)",
    deposit: 20,
  },
  {
    key: "waterfall rappelling",
    label: "Waterfall Rappelling Adventure Park Tour",
    reservationBacked: true,
    priceText: "$100–$140 (depends on company)",
    deposit: 25,         // we’ll collect $25 now; may adjust $5 later if needed
    depositRange: [25, 30]
  },
  {
    key: "surf lessons",
    label: "Surf Lessons",
    reservationBacked: true,
    price: 90,           // default to Full lesson
    priceText: "$90 (Full). 'No Frills' $55 available",
    deposit: 20
  },
  {
    key: "jungle tubing",
    label: "Jungle Tubing on the Savegre River",
    reservationBacked: true,
    price: 110,
    priceText: "$110",
    deposit: 20
  },

  // keep a few common items so detectDeposit() still works on core days
  { key: "manuel antonio national park", label: "Manuel Antonio National Park Tour", deposit: 10, priceText: "$55–$65 adult / $45–$55 child / <2 free" },
  { key: "public catamaran", label: "Public Catamaran Tour", deposit: 25, priceText: "$80–$89 (kids 5–10 $55, under 5 $10)" },
  { key: "coffee tour", label: "Coffee Tour", deposit: 20, priceText: "Varies by operator" },
  { key: "bird watching", label: "Bird Watching (early)", deposit: 20, priceText: "Varies by operator" },
  { key: "private chef dinner", label: "Private Chef Dinner (villa)", deposit: 0, priceText: "Menu-priced" },
];

// Find catalog entry by name (includes() on key)
export function matchActivityMeta(itemName) {
  const n = norm(itemName);
  return activityCatalog.find(c => n.includes(c.key)) || null;
}

// Direct access by key
export function getMetaByKey(key) {
  const n = norm(key);
  return activityCatalog.find(c => c.key === n) || null;
}

// Deposit descriptor
export function getDepositInfo(meta) {
  if (!meta) return { depositAmount: 0, depositLabel: "TBD" };
  if (Array.isArray(meta.depositRange) && meta.depositRange.length === 2) {
    const [min, max] = meta.depositRange;
    return { depositAmount: Number(min) || 0, depositLabel: `$${min}–$${max}` };
  }
  const amt = Number(meta.deposit || 0) || 0;
  return { depositAmount: amt, depositLabel: amt ? `$${amt}` : "TBD" };
}

// Full price descriptor (numeric when possible, else text)
export function getFullPriceInfo(meta) {
  if (!meta) return { fullPriceAmount: null, fullPriceLabel: "TBD" };
  if (typeof meta.price === "number") {
    return { fullPriceAmount: meta.price, fullPriceLabel: `$${meta.price}` + (meta.priceText ? ` (${meta.priceText})` : "") };
  }
  if (meta.priceText) {
    return { fullPriceAmount: null, fullPriceLabel: meta.priceText };
  }
  return { fullPriceAmount: null, fullPriceLabel: "TBD" };
}

// Back-compat with your old import
export function detectDeposit(itemName) {
  const meta = matchActivityMeta(itemName);
  const { depositAmount } = getDepositInfo(meta);
  return meta ? { label: meta.label, amount: depositAmount } : null;
}
