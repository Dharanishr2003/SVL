function normalizeStatusKey(status) {
  return String(status || "").trim().toLowerCase();
}

function formatToken(token) {
  if (!token) return token;
  if (/^[^a-zA-Z]*$/.test(token)) return token;
  if (/^[A-Z0-9+/_-]+$/.test(token) && token === token.toUpperCase()) {
    return token;
  }
  if (/^[a-z]{1,4}$/.test(token)) {
    return token.toUpperCase();
  }
  return token.charAt(0).toUpperCase() + token.slice(1).toLowerCase();
}

const STATUS_LABEL_OVERRIDES = {
  requirement: "Requirements Collected",
  "not attempted": "Not Attempted",
  "new lead": "New Lead",
  "new": "New Lead",
};

export function formatStatusLabel(status) {
  const raw = String(status || "").trim();
  if (!raw) return "";
  const override = STATUS_LABEL_OVERRIDES[normalizeStatusKey(raw)];
  if (override) return override;
  return raw
    .split(/(\s+|\+)/)
    .map((part) => (part === "+" || /^\s+$/.test(part) ? part : formatToken(part)))
    .join("")
    .replace(/\s+/g, " ")
    .trim();
}

export function uniqueStatusOptions(statuses) {
  const seen = new Set();
  const output = [];
  for (const status of Array.isArray(statuses) ? statuses : []) {
    const raw = String(status || "").trim();
    if (!raw) continue;
    const key = normalizeStatusKey(raw);
    if (seen.has(key)) continue;
    seen.add(key);
    output.push(raw);
  }
  return output;
}

export function normalizeStatusLabelKey(status) {
  return normalizeStatusKey(status);
}

export function getStatusStyle(status) {
  const s = String(status || "").toLowerCase().trim();

  // Color Mapping
  const colors = {
    newLead: "#3B82F6",
    attempted: "#64748B",
    interested: "#84CC16",
    notAttempted: "#E5E7EB",
    rejected: "#DC2626",
    requirementsCollected: "#0EA5E9",
    budget: "#EAB308",
    boq: "#A16207",
    allocate: "#06B6D4",
    design: "#EC4899",
    production: "#2563EB",
    designProduction: "#7C3AED",
    productionResume: "#6366F1",
    purchase: "#F59E0B",
    stockRequest: "#F97316",
    stockRequested: "#EA580C",
    stockUpdated: "#10B981",
    accounts: "#9333EA",
    accountsReview: "#8B5CF6",
    approval: "#14B8A6",
    payment: "#15803D",
    deal: "#16A34A",
    delivery: "#22C55E",
    duplicate: "#FB7185",
  };

  let hex = "#64748B"; // default attempted gray

  if (s.includes("new")) hex = colors.newLead;
  else if (s.includes("not attempted")) hex = colors.notAttempted;
  else if (s.includes("attempted")) hex = colors.attempted;
  else if (s.includes("interested")) hex = colors.interested;
  else if (s.includes("requirements")) hex = colors.requirementsCollected;
  else if (s.includes("budget")) hex = colors.budget;
  else if (s.includes("boq")) hex = colors.boq;
  else if (s.includes("allocate")) hex = colors.allocate;
  else if (s.includes("design") && s.includes("production")) hex = colors.designProduction;
  else if (s.includes("design")) hex = colors.design;
  else if (s.includes("production resume")) hex = colors.productionResume;
  else if (s.includes("production")) hex = colors.production;
  else if (s.includes("purchase")) hex = colors.purchase;
  else if (s.includes("stock requested")) hex = colors.stockRequested;
  else if (s.includes("stock request")) hex = colors.stockRequest;
  else if (s.includes("stock updated")) hex = colors.stockUpdated;
  else if (s.includes("accounts review")) hex = colors.accountsReview;
  else if (s.includes("accounts")) hex = colors.accounts;
  else if (s.includes("approval")) hex = colors.approval;
  else if (s.includes("payment")) hex = colors.payment;
  else if (s.includes("deal")) hex = colors.deal;
  else if (s.includes("delivery")) hex = colors.delivery;
  else if (s.includes("duplicate")) hex = colors.duplicate;
  else if (s.includes("reject")) hex = colors.rejected;

  let textColor = hex;
  if (hex === "#E5E7EB") {
    textColor = "#475569";
  } else if (hex === "#EAB308" || hex === "#F59E0B" || hex === "#F97316") {
    textColor = "#854D0E";
  }

  const r = parseInt(hex.substring(1, 3), 16);
  const g = parseInt(hex.substring(3, 5), 16);
  const b = parseInt(hex.substring(5, 7), 16);

  return {
    backgroundColor: `rgba(${r}, ${g}, ${b}, 0.12)`,
    color: textColor,
    border: `1px solid rgba(${r}, ${g}, ${b}, 0.2)`
  };
}
