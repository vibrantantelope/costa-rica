// A small catalog that knows deposits + full prices (and variants where needed).
// It remains compatible with your existing detectDeposit() helper.

// Normalization
const norm = s => String(s || "").trim().toLowerCase();

// Reservation-backed optional items we’ll include in the concierge reservation now
const RESERVATION_BACKED_KEYS = [
  "damas island mangrove",
  "waterfall rappelling",
  "surf lessons",
  "jungle tubing",
];

// Catalog entries:
//
// - If fixed pricing: { key, label, price, deposit }
// - If variant pricing: { key, label, variants: [{id,name,price,deposit}], defaultVariantId }
// - If price unknown/range: use priceText and (optionally) depositRange
export const activityCatalog = [
  {
    key: "damas island mangrove",
    label: "Damas Island Mangrove Tour",
    reservationBacked: true,
    variants: [
      { id: "day", name: "Day", price: 75, deposit: 20 },
      { id: "night", name: "Night", price: 85, deposit: 20 },
    ],
    defaultVariantId: "day",
  },
  {
    key: "waterfall rappelling",
    label: "Waterfall Rappelling Adventure Park Tour",
    reservationBacked: true,
    priceText: "$100–$140",
    deposit: 25,           // default
    depositRange: [25, 30], // depends on the company
  },
  {
    key: "surf lessons",
    label: "Surf Lessons",
    reservationBacked: true,
    variants: [
      { id: "full", name: "Full", price: 90, deposit: 20 },
      { id: "no-frills", name: "No Frills", price: 55, deposit: 10 },
    ],
    defaultVariantId: "full",
  },
  {
    key: "jungle tubing",
    label: "Jungle Tubing on the Savegre River",
    reservationBacked: true,
    price: 110,
    deposit: 20,
  },

  // ——— A few core/common items for nice labels in the UI ———
  {
    key: "manuel antonio national park",
    label: "Manuel Antonio National Park Tour",
    priceText: "$55–$65 adult / $45–$55 child under 11 / free under 2",
    deposit: 10,
  },
  {
    key: "public catamaran",
    label: "Public Catamaran Tour",
    priceText: "$80–$89 (kids 5–10 $55, under 5 $10)",
    // We’ll assume adult deposit unless variants are added to your schedule name.
    deposit: 25,
  },
  {
    key: "coffee tour",
    label: "Coffee Tour",
    priceText: "Varies by operator",
    deposit: 20,
  },
  {
    key: "bird watching",
    label: "Bird Watching (early)",
    priceText: "Varies by operator",
    deposit: 20,
  },
  {
    key: "private chef dinner",
    label: "Private Chef Dinner (villa)",
    priceText: "Menu-priced",
    deposit: 0,
  },

  // ——— Optional: add more from your long list if you expect them to show up in schedule names ———
];

// Lightweight matcher: includes() on keys
export function matchActivityMeta(itemName) {
  const n = norm(itemName);
  const hit = activityCatalog.find(c => n.includes(c.key));
  if (!hit) return null;
  return {
    ...hit,
    reservationBacked: hit.reservationBacked || RESERVATION_BACKED_KEYS.some(k => n.includes(k)),
  };
}

export function getVariant(meta, variantId) {
  if (!meta?.variants || meta.variants.length === 0) return null;
  return meta.variants.find(v => v.id === variantId) || null;
}

export function getDepositInfo(meta, variantId) {
  if (!meta) {
    return { depositAmount: 0, depositLabel: "TBD" };
  }

  // Variant deposit (e.g., Surf Full vs No Frills)
  if (meta.variants && meta.variants.length) {
    const v = getVariant(meta, variantId) || meta.variants[0];
    const amt = Number(v?.deposit || 0) || 0;
    return { depositAmount: amt, depositLabel: amt ? `$${amt}` : "TBD" };
  }

  // Range (e.g., Waterfall Rappelling)
  if (Array.isArray(meta.depositRange) && meta.depositRange.length === 2) {
    const [min] = meta.depositRange;
    const amt = Number(min || 0) || 0;
    const label = `$${meta.depositRange[0]}–$${meta.depositRange[1]}`;
    return { depositAmount: amt, depositLabel: label };
  }

  const amt = Number(meta.deposit || 0) || 0;
  return { depositAmount: amt, depositLabel: amt ? `$${amt}` : "TBD" };
}

export function getFullPriceInfo(meta, variantId) {
  if (!meta) return { fullPriceAmount: null, fullPriceLabel: "TBD" };

  if (meta.variants && meta.variants.length) {
    const v = getVariant(meta, variantId) || meta.variants[0];
    const amt = Number(v?.price || 0) || null;
    const lbl = amt ? `$${amt} (${v.name})` : (meta.priceText || "TBD");
    return { fullPriceAmount: amt, fullPriceLabel: lbl };
  }

  if (typeof meta.price === "number") {
    return { fullPriceAmount: meta.price, fullPriceLabel: `$${meta.price}` };
  }

  if (meta.priceText) {
    return { fullPriceAmount: null, fullPriceLabel: meta.priceText };
  }

  return { fullPriceAmount: null, fullPriceLabel: "TBD" };
}

// Backwards-compatible helper your code already imports
// Returns a simple {label, amount} pair based on item name
export function detectDeposit(itemName) {
  const meta = matchActivityMeta(itemName);
  const { depositAmount } = getDepositInfo(meta, meta?.defaultVariantId);
  return meta
    ? { label: meta.label, amount: depositAmount }
    : null;
}
