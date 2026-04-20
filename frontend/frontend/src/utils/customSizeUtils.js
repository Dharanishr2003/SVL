/**
 * Build a canonical "valueRaw" string for a custom size, consistent between
 * RequirementFormModal and PriceListPage.
 *
 * Two storage patterns exist:
 *   1. Flex/Agralic style – separate customWidth / customHeight / customDepth / customUnit fields
 *   2. Text-prompt style  – a single `sizeCustom` string
 *
 * @param {object} fields  – the specs or variantFields object
 * @returns {string|null}  – formatted string, or null if not a custom size
 */
export function buildSizeValueRaw(fields) {
  if (!fields || fields.size !== 'Custom') return null;

  const w = String(fields.customWidth || '').trim();
  const h = String(fields.customHeight || '').trim();

  if (w && h) {
    const d = String(fields.customDepth || '').trim();
    const u = String(fields.customUnit || '').trim();
    const dims = d ? `${w} × ${h} × ${d}` : `${w} × ${h}`;
    return u ? `${dims} ${u}` : dims;
  }

  const textCustom = String(fields.sizeCustom || '').trim();
  if (textCustom) return textCustom;

  return null;
}

/**
 * Build the valueRaw string for any allowCustom field.
 * For `size`, delegates to buildSizeValueRaw.
 * For all other fields, reads `fields[`${fieldKey}Custom`]`.
 *
 * @param {string} fieldKey  – e.g. "size", "colour", "pastingType"
 * @param {object} fields    – the specs or variantFields object
 * @returns {string|null}    – the raw value to persist, or null if nothing to save
 */
export function buildCustomValueRaw(fieldKey, fields) {
  if (!fields || fields[fieldKey] !== 'Custom') return null;
  if (fieldKey === 'size') return buildSizeValueRaw(fields);
  const val = String(fields[`${fieldKey}Custom`] || '').trim();
  return val || null;
}

/**
 * Collect all custom option saves needed for a fields object.
 * Returns an array of { fieldKey, valueRaw } for every allowCustom field
 * whose current value is "Custom" and which has a non-blank valueRaw.
 *
 * @param {Array}  fieldDefs  – the field config array (from productFields/fields)
 * @param {object} fields     – specs or variantFields
 * @returns {{ fieldKey: string, valueRaw: string }[]}
 */
export function collectCustomOptionSaves(fieldDefs, fields) {
  if (!fieldDefs || !fields) return [];
  const results = [];
  for (const f of fieldDefs) {
    if (f.type !== 'select' || !f.allowCustom || f.promptText) continue;
    if (fields[f.key] !== 'Custom') continue;
    const valueRaw = buildCustomValueRaw(f.key, fields);
    if (valueRaw) results.push({ fieldKey: f.key, valueRaw });
  }
  return results;
}
