// Normalize keys so we can detect deposits from your schedule item names.
export const depositConfig = [
  { key: "manuel antonio national park", label: "MA National Park", amount: 10 },
  { key: "coffee tour", label: "Coffee Tour", amount: 20 },     // ← set real deposit if you get it
  { key: "bird watching", label: "Bird Watching (early)", amount: 20 },
  { key: "public catamaran tour", label: "Catamaran (public)", amount: 25 }, // base adult deposit
  { key: "night jungle tour", label: "Night Jungle Tour", amount: 20 },
  { key: "private chef dinner", label: "Chef Dinner (villa)", amount: 0 }, // deposit not needed
  // Optional / self-organized (keep here so they can still commit if you want)
  { key: "jungle tubing", label: "Jungle Tubing", amount: 20 },
  { key: "waterfall rappelling", label: "Waterfall Rappelling", amount: 25 },
  { key: "mangrove", label: "Damas Island Mangrove", amount: 20 },
  { key: "surf lessons", label: "Surf Lessons", amount: 20 },
];

export function detectDeposit(itemName) {
  const n = itemName.toLowerCase();
  const found = depositConfig.find(d => n.includes(d.key));
  return found || null; // null → we’ll treat as $0 / TBD
}
