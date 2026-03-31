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

export function formatStatusLabel(status) {
  const raw = String(status || "").trim();
  if (!raw) return "";
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
