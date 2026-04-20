import api from '../utils/api';

function safeJsonParse(value, fallback) {
  if (value == null) return fallback;
  if (typeof value !== 'string') return value;
  const trimmed = value.trim();
  if (!trimmed) return fallback;
  try {
    return JSON.parse(trimmed);
  } catch {
    return fallback;
  }
}

function normalizePriceEntry(entry) {
  const e = entry || {};
  return {
    ...e,
    variantFields: safeJsonParse(e.variantFields, {}),
    quantitySlabs: safeJsonParse(e.quantitySlabs, []),
  };
}

export function getPriceList() {
  return api.get('/api/price-list').then((r) => {
    const data = r.data;
    if (!Array.isArray(data)) return [];
    return data.map(normalizePriceEntry);
  });
}

export function savePriceEntry(entry) {
  const payload = {
    ...entry,
    variantFields:
      entry?.variantFields == null
        ? null
        : typeof entry.variantFields === 'string'
          ? entry.variantFields
          : JSON.stringify(entry.variantFields),
    quantitySlabs:
      entry?.quantitySlabs == null
        ? null
        : typeof entry.quantitySlabs === 'string'
          ? entry.quantitySlabs
          : JSON.stringify(entry.quantitySlabs),
  };

  if (entry.id) {
    return api.put(`/api/price-list/${entry.id}`, payload).then((r) => normalizePriceEntry(r.data));
  } else {
    return api.post('/api/price-list', payload).then((r) => normalizePriceEntry(r.data));
  }
}

export function deletePriceEntry(id) {
  return api.delete(`/api/price-list/${id}`);
}
