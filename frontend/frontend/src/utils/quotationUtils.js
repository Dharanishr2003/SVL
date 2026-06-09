import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { getCustomSizeSummary } from "./customSizeUtils";

function fullSpecsSummary(specs) {
  const raw = typeof specs === "string"
    ? (() => { try { return JSON.parse(specs); } catch { return {}; } })()
    : (specs || {});

  const skip = new Set([
    "customWidth",
    "customHeight",
    "customDepth",
    "customUnit",
    "customDimensions",
    ...Object.keys(raw).filter((key) => key.startsWith("customSize_")),
  ]);

  const entries = Object.entries(raw)
    .filter(([key, value]) =>
      !key.endsWith("Custom") &&
      !key.endsWith("Text") &&
      !skip.has(key) &&
      value !== "" &&
      value != null
    )
    .map(([key, value]) => {
      if (value === "Custom") {
        if (key === "size") {
          const summary = getCustomSizeSummary({ customDimensions: raw.customDimensions }, raw);
          if (summary) return summary;
        }
        return raw[`${key}Custom`] || null;
      }

      const stringValue = String(value).trim();
      return !stringValue || stringValue === "0" ? null : stringValue;
    })
    .filter(Boolean);

  return entries.join(" · ");
}

function isTamilNaduState(value) {
  const normalized = String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z]/g, "");

  return (
    normalized === "tn" ||
    normalized === "tamilnadu" ||
    normalized === "tamilnasu" ||
    normalized.startsWith("tamilna")
  );
}

export const QUOTATION_STORAGE_KEY = "svl_quotations";
export const QUOTATION_DRAFT_STORAGE_KEY = "svl_quotation_draft";
export const QUOTATION_STATUS_DRAFT = "DRAFT";
export const QUOTATION_STATUS_VERIFICATION_PENDING = "VERIFICATION_PENDING";
export const QUOTATION_STATUS_APPROVED = "APPROVED";
export const QUOTATION_STATUS_SENT = "QUOTATION_SENT";
export const QUOTATION_STATUS_NEGOTIATING = "NEGOTIATING";
export const QUOTATION_STATUS_REJECTED = "QUOTATION_REJECTED";
export const QUOTATION_STATUS_ACCEPTED = "QUOTATION_ACCEPTED";

export function sanitizeFilenamePart(value, fallback) {
  const normalized = String(value || "")
    .trim()
    .replace(/[\\/:*?"<>|]+/g, "-")
    .replace(/\s+/g, "_")
    .replace(/_+/g, "_")
    .replace(/^_+|_+$/g, "");
  return normalized || fallback;
}

function numberToWords(num) {
  const ones = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine"];
  const teens = ["Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"];
  const tens = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];

  function convert(n) {
    if (n === 0) return "";
    if (n < 10) return ones[n];
    if (n < 20) return teens[n - 10];
    if (n < 100) return tens[Math.floor(n / 10)] + (n % 10 !== 0 ? ` ${ones[n % 10]}` : "");
    if (n < 1000) return `${ones[Math.floor(n / 100)]} Hundred${n % 100 !== 0 ? ` ${convert(n % 100)}` : ""}`;
    if (n < 100000) return `${convert(Math.floor(n / 1000))} Thousand${n % 1000 !== 0 ? ` ${convert(n % 1000)}` : ""}`;
    if (n < 10000000) return `${convert(Math.floor(n / 100000))} Lakh${n % 100000 !== 0 ? ` ${convert(n % 100000)}` : ""}`;
    return `${convert(Math.floor(n / 10000000))} Crore${n % 10000000 !== 0 ? ` ${convert(n % 10000000)}` : ""}`;
  }

  return convert(num) || "Zero";
}

function amountToWords(amount, { includePaise = false } = {}) {
  const numericAmount = Number(amount || 0);
  const absoluteAmount = Math.abs(numericAmount);
  const rupees = Math.floor(absoluteAmount);
  const paise = Math.round((absoluteAmount - rupees) * 100);
  const rupeeWords = numberToWords(rupees);
  const rupeeLabel = rupees === 1 ? "Rupee" : "Rupees";
  const paiseWords = paise > 0 ? `${numberToWords(paise)} Paise` : "";
  const signPrefix = numericAmount < 0 ? "Minus " : "";

  if (includePaise) {
    return `${signPrefix}${rupeeWords} ${rupeeLabel}${paiseWords ? ` and ${paiseWords}` : ""} Only`;
  }

  return `${signPrefix}${rupeeWords} ${rupeeLabel} Only`;
}

function readLocalStorageJson(key, fallback) {
  if (typeof window === "undefined") return fallback;

  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw);
    return parsed ?? fallback;
  } catch {
    return fallback;
  }
}

function writeLocalStorageJson(key, value) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(key, JSON.stringify(value));
}

function clampNonNegativeNumber(value, fallback = 0) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < 0) {
    return fallback;
  }
  return parsed;
}

function scalePercent(value, fallback = 0) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < 0) {
    return fallback;
  }
  return parsed;
}

export function normalizeQuotationLineItem(item, options = {}) {
  if (!item) return {};
  const {
    isTamilNadu = false,
    defaultDiscountPct = 0,
    defaultGstPct = 0,
    defaultGstMasterId = null,
    preferFallbackWhenZero = false,
  } = options;

  const designStatus = String(item.designStatus || "").toLowerCase();
  const isDesignOnly = designStatus === "design_only";
  const quantity = isDesignOnly ? 0 : clampNonNegativeNumber(item.quantity, 0);
  const unitPrice = isDesignOnly ? 0 : clampNonNegativeNumber(item.unitPrice ?? item.pricePerUnit, 0);
  const rawDiscountPct = item.discountPct ?? item.discountPercent;
  const rawGstPct = item.gstPct ?? item.gstPercent ?? item.gstPctTotal;
  const gstMasterId = item.gstMasterId ?? item.gstMaster?.id ?? defaultGstMasterId ?? null;
  const discountPct = isDesignOnly
    ? 0
    : scalePercent(
        rawDiscountPct == null || (preferFallbackWhenZero && Number(rawDiscountPct) === 0 && Number(defaultDiscountPct) > 0)
          ? defaultDiscountPct
          : rawDiscountPct,
        0,
      );
  const gstPct = isDesignOnly
    ? 0
    : scalePercent(
        rawGstPct == null || (preferFallbackWhenZero && Number(rawGstPct) === 0 && Number(defaultGstPct) > 0)
          ? defaultGstPct
          : rawGstPct,
        0,
      );
  const baseAmount = quantity * unitPrice;
  const discountAmount = baseAmount * (discountPct / 100);
  const taxableAmount = Math.max(0, baseAmount - discountAmount);
  const gstAmount = taxableAmount * (gstPct / 100);
  const cgstAmount = isTamilNadu ? gstAmount / 2 : 0;
  const sgstAmount = isTamilNadu ? gstAmount / 2 : 0;
  const igstAmount = isTamilNadu ? 0 : gstAmount;
  const lineTotal = taxableAmount + gstAmount;

  return {
    ...item,
    quantity,
    unitPrice,
    pricePerUnit: unitPrice,
    gstMasterId,
    discountPct,
    discountPercent: discountPct,
    gstPct,
    gstPercent: gstPct,
    baseAmount,
    discountAmount,
    taxableAmount,
    gstAmount,
    cgstAmount,
    sgstAmount,
    igstAmount,
    lineTotal,
    pricingStatus: lineTotal > 0 ? "PRICED" : "UNPRICED",
  };
}

function roundMoney(value) {
  return Number(Number(value || 0).toFixed(2));
}

function resolveLegacyCompatibleDesignFeeGstPct(value, fallback = 0) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return Number(fallback || 0);
  }
  return parsed;
}

export function buildDesignFeePricing(options = {}) {
  const {
    includeDesignFee = false,
    designFeeAmount = 0,
    designFeeDiscountPct = 0,
    designFeeGstPct = 0,
    isTamilNadu = false,
  } = options;

  if (!includeDesignFee) {
    return {
      includeDesignFee: false,
      baseAmount: 0,
      discountPct: 0,
      discountAmount: 0,
      taxableAmount: 0,
      gstPct: 0,
      gstAmount: 0,
      cgstAmount: 0,
      sgstAmount: 0,
      igstAmount: 0,
      lineTotal: 0,
    };
  }

  const baseAmount = roundMoney(Number(designFeeAmount || 0));
  const discountPct = roundMoney(Number(designFeeDiscountPct || 0));
  const discountAmount = roundMoney(baseAmount * (discountPct / 100));
  const taxableAmount = roundMoney(Math.max(0, baseAmount - discountAmount));
  const gstPct = roundMoney(Number(designFeeGstPct || 0));
  const gstAmount = roundMoney(taxableAmount * (gstPct / 100));
  const cgstAmount = isTamilNadu ? roundMoney(gstAmount / 2) : 0;
  const sgstAmount = isTamilNadu ? roundMoney(gstAmount / 2) : 0;
  const igstAmount = isTamilNadu ? 0 : gstAmount;
  const lineTotal = roundMoney(taxableAmount + gstAmount);

  return {
    includeDesignFee: true,
    baseAmount,
    discountPct,
    discountAmount,
    taxableAmount,
    gstPct,
    gstAmount,
    cgstAmount,
    sgstAmount,
    igstAmount,
    lineTotal,
  };
}

export function extractTaxGroupCode(item) {
  const candidates = [
    item?.hsnSac,
    item?.hsnSacCode,
    item?.hsnCode,
    item?.hsn,
    item?.sacCode,
    item?.sac,
    item?.productHsn,
    item?.productSac,
    item?.hsnSacNumber,
  ];

  const match = candidates.find((value) => String(value || "").trim() !== "");
  return match == null ? "" : String(match).trim();
}

function summarizeTaxGroupItem(item) {
  const productName = String(item?.productName || "").trim();
  const variantSummary = String(item?.variantSummary || item?.specsSummary || "").trim();
  const specSummary = String(item?.specsSummary || "").trim();
  const tail = variantSummary || specSummary;

  if (productName && tail) {
    return `${productName} - ${tail}`;
  }
  return productName || tail || "";
}

export function buildQuotationTaxSummary(lineItems = [], options = {}) {
  const {
    isTamilNadu = false,
    designFeeAmount = 0,
    designFeeDiscountPct = 0,
    designFeeGstPct = 0,
    includeDesignFee = false,
  } = options;

  const groupsByRate = new Map();
  let productSerial = 0;
  const addGroupEntry = ({
    key,
    gstPct,
    taxableAmount,
    gstAmount,
    cgstAmount,
    sgstAmount,
    igstAmount,
    code = "",
    label = "",
    displayPart = "",
  }) => {
    const existing = groupsByRate.get(key) || {
      gstPct,
      taxableAmount: 0,
      gstAmount: 0,
      cgstAmount: 0,
      sgstAmount: 0,
      igstAmount: 0,
      codes: new Set(),
      items: [],
      displayParts: [],
    };

    existing.taxableAmount = roundMoney(existing.taxableAmount + taxableAmount);
    existing.gstAmount = roundMoney(existing.gstAmount + gstAmount);
    existing.cgstAmount = roundMoney(existing.cgstAmount + cgstAmount);
    existing.sgstAmount = roundMoney(existing.sgstAmount + sgstAmount);
    existing.igstAmount = roundMoney(existing.igstAmount + igstAmount);
    if (code) existing.codes.add(code);
    if (label) existing.items.push(label);
    if (displayPart) existing.displayParts.push(displayPart);
    groupsByRate.set(key, existing);
  };

  (Array.isArray(lineItems) ? lineItems : []).forEach((item) => {
    if (!item || String(item.designStatus || "").toLowerCase() === "design_only") {
      return;
    }
    productSerial += 1;

    const gstPct = roundMoney(item.gstPct ?? item.gstPercent ?? 0);
    const key = gstPct.toFixed(2);
    const taxableAmount = roundMoney(
      item.taxableAmount ??
      (Number(item.baseAmount || 0) - Number(item.discountAmount || 0))
    );
    const gstAmount = roundMoney(item.gstAmount ?? taxableAmount * (gstPct / 100));
    const cgstAmount = isTamilNadu ? roundMoney(item.cgstAmount ?? gstAmount / 2) : 0;
    const sgstAmount = isTamilNadu ? roundMoney(item.sgstAmount ?? gstAmount / 2) : 0;
    const igstAmount = isTamilNadu ? 0 : roundMoney(item.igstAmount ?? gstAmount);
    const code = extractTaxGroupCode(item);
    const label = summarizeTaxGroupItem(item);
    addGroupEntry({
      key,
      gstPct,
      taxableAmount,
      gstAmount,
      cgstAmount,
      sgstAmount,
      igstAmount,
      code,
      label,
      displayPart: String(productSerial),
    });
  });

  const designFeePricing = buildDesignFeePricing({
    includeDesignFee,
    designFeeAmount,
    designFeeDiscountPct,
    designFeeGstPct,
    isTamilNadu,
  });

  if (designFeePricing.includeDesignFee && designFeePricing.taxableAmount > 0) {
    productSerial += 1;
    const key = designFeePricing.gstPct.toFixed(2);
    addGroupEntry({
      key,
      gstPct: designFeePricing.gstPct,
      taxableAmount: designFeePricing.taxableAmount,
      gstAmount: designFeePricing.gstAmount,
      cgstAmount: designFeePricing.cgstAmount,
      sgstAmount: designFeePricing.sgstAmount,
      igstAmount: designFeePricing.igstAmount,
      label: "Design Fee",
      displayPart: String(productSerial),
    });
  }

  const rows = Array.from(groupsByRate.values())
    .sort((a, b) => a.gstPct - b.gstPct)
    .map((group) => {
      const codes = Array.from(group.codes);
      const itemLabels = Array.from(new Set(group.items.filter(Boolean)));
      const codeText = codes.length ? codes.join(", ") : `GST ${group.gstPct.toFixed(2)}%`;
      const displayParts = Array.from(new Set(group.displayParts.filter(Boolean)));
      const serialText = displayParts.join(", ");
      const displayText = codes.length ? codes.join(", ") : serialText;
      return {
        gstPct: roundMoney(group.gstPct),
        taxableAmount: roundMoney(group.taxableAmount),
        gstAmount: roundMoney(group.gstAmount),
        cgstRate: isTamilNadu ? roundMoney(group.gstPct / 2) : 0,
        cgstAmount: roundMoney(group.cgstAmount),
        sgstRate: isTamilNadu ? roundMoney(group.gstPct / 2) : 0,
        sgstAmount: roundMoney(group.sgstAmount),
        igstRate: isTamilNadu ? 0 : roundMoney(group.gstPct),
        igstAmount: roundMoney(group.igstAmount),
        taxTotalAmount: roundMoney(group.gstAmount),
        primaryText: codeText,
        secondaryText: codes.length ? "" : itemLabels.join("\n"),
        itemLabels,
        codes,
        serialText,
        displayText,
      };
    });

  const productTaxableAmount = rows.reduce((sum, row) => sum + Number(row.taxableAmount || 0), 0);
  const productTaxAmount = rows.reduce((sum, row) => sum + Number(row.gstAmount || 0), 0);
  const productCgstAmount = rows.reduce((sum, row) => sum + Number(row.cgstAmount || 0), 0);
  const productSgstAmount = rows.reduce((sum, row) => sum + Number(row.sgstAmount || 0), 0);
  const productIgstAmount = rows.reduce((sum, row) => sum + Number(row.igstAmount || 0), 0);

  const designFeeTaxAmount = designFeePricing.gstAmount;
  const designFeeCgstAmount = designFeePricing.cgstAmount;
  const designFeeSgstAmount = designFeePricing.sgstAmount;
  const designFeeIgstAmount = designFeePricing.igstAmount;

  const totalTaxAmount = roundMoney(productTaxAmount);
  const totalCgstAmount = roundMoney(productCgstAmount);
  const totalSgstAmount = roundMoney(productSgstAmount);
  const totalIgstAmount = roundMoney(productIgstAmount);

  return {
    rows,
    productTaxableAmount,
    productTaxAmount,
    productCgstAmount,
    productSgstAmount,
    productIgstAmount,
    designFeeTaxAmount,
    designFeeCgstAmount,
    designFeeSgstAmount,
    designFeeIgstAmount,
    designFeePricing,
    totalTaxAmount,
    totalCgstAmount,
    totalSgstAmount,
    totalIgstAmount,
  };
}

function formatIndianMobileNumber(value) {
  const raw = String(value || "").trim();
  if (!raw) return "-";
  if (raw.startsWith("+")) return raw;
  const digits = raw.replace(/\D/g, "");
  if (!digits) return raw;
  return `+91 ${digits}`;
}

export function getStoredQuotations() {
  const stored = readLocalStorageJson(QUOTATION_STORAGE_KEY, []);
  return Array.isArray(stored) ? stored : [];
}

export function saveStoredQuotations(quotations) {
  writeLocalStorageJson(QUOTATION_STORAGE_KEY, quotations);
}

export function upsertStoredQuotation(quotation) {
  const quotations = getStoredQuotations();
  const existingIndex = quotations.findIndex((item) => item.id === quotation.id);

  if (existingIndex >= 0) {
    quotations[existingIndex] = quotation;
  } else {
    quotations.unshift(quotation);
  }

  saveStoredQuotations(quotations);
  return quotation;
}

export function deleteStoredQuotation(quotationId) {
  const quotations = getStoredQuotations().filter((item) => item.id !== quotationId);
  saveStoredQuotations(quotations);
  return quotations;
}

export function getQuotationDraft() {
  return readLocalStorageJson(QUOTATION_DRAFT_STORAGE_KEY, null);
}

export function setQuotationDraft(draft) {
  writeLocalStorageJson(QUOTATION_DRAFT_STORAGE_KEY, draft);
}

export function clearQuotationDraft() {
  if (typeof window !== "undefined") {
    window.localStorage.removeItem(QUOTATION_DRAFT_STORAGE_KEY);
  }
}

function normalizeQuotationResponseLineItem(item, options = {}) {
  if (!item) return {};
  // Parse specs from specsJson if specs object is not directly available
  let specs = item.specs;
  if (!specs && item.specsJson) {
    try { specs = JSON.parse(item.specsJson); } catch { specs = {}; }
  }
  return normalizeQuotationLineItem({
    ...item,
    id: item.id || `quotation-item-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    requirementId: item.requirementId ?? null,
    categoryId: item.categoryId ?? null,
    typeId: item.typeId ?? null,
    subtypeId: item.subtypeId ?? null,
    typeName: item.typeName || "",
    subtypeName: item.subtypeName || null,
    productName: item.productName || "",
    specsSummary: item.specsSummary || "",
    specsJson: item.specsJson || "",
    specs: specs || {},
    sortOrder: item.sortOrder ?? 0,
    designStatus: item.designStatus || "",
    pricingStatus: item.pricingStatus || "",
    priceListEntryId: item.priceListEntryId ?? null,
  }, options);
}

export function quotationResponseToDraft(quotation) {
  if (!quotation) return null;

  const selectedLead = quotation.selectedLead || (quotation.leadId || quotation.clientName
    ? {
        id: quotation.leadId ?? null,
        leadId: quotation.leadId ?? null,
        name: quotation.clientName || "",
        email: quotation.clientEmail || "",
        mobile: quotation.clientMobile || "",
        company: quotation.clientCompany || "",
        address: quotation.clientAddress || quotation.address || "",
        streetAddress: quotation.streetAddress || quotation.clientAddress || quotation.address || "",
        leadState: quotation.clientState || quotation.leadState || "",
        state: quotation.clientState || quotation.state || quotation.leadState || "",
      }
    : null);

  const gstRows = Array.isArray(quotation.gstRows)
    ? quotation.gstRows.map((row, index) => ({
        id: row.id || `gst-row-restored-${index}`,
        gstMasterId: row.gstMasterId || "",
        taxName: row.taxName || "",
        taxPercent: Number(row.taxPercent || 0),
      }))
    : [];

  const legacyDiscountPct = clampNonNegativeNumber(quotation.discountPercent ?? quotation.discountPct ?? 0, 0);
  const legacyGstPct = clampNonNegativeNumber(
    quotation.gstPct ?? quotation.gstPercent ?? quotation.gstPctTotal ?? (
      Array.isArray(gstRows) && gstRows.length > 0
        ? gstRows.reduce((sum, row) => sum + Number(row.taxPercent || 0), 0)
        : 0
    ),
    0,
  );
  const isTN = isTamilNaduState(selectedLead?.leadState || selectedLead?.state || quotation.clientState || quotation.leadState || "");
  const rawLineItems = Array.isArray(quotation.items)
    ? quotation.items
    : (Array.isArray(quotation.lineItems) ? quotation.lineItems : []);
  const shouldSeedLegacyItemTaxes =
    rawLineItems.length > 0 &&
    (legacyDiscountPct > 0 || legacyGstPct > 0) &&
    rawLineItems.every((item) =>
      Number(item?.discountPct ?? item?.discountPercent ?? 0) === 0 &&
      Number(item?.gstPct ?? item?.gstPercent ?? item?.gstPctTotal ?? 0) === 0
    );
  const lineItems = rawLineItems.map((item) => normalizeQuotationResponseLineItem(item, {
    isTamilNadu: isTN,
    defaultDiscountPct: legacyDiscountPct,
    defaultGstPct: legacyGstPct,
    preferFallbackWhenZero: shouldSeedLegacyItemTaxes,
  }));

  return {
    id: quotation.id || null,
    quotationNumber: quotation.quotationNumber || "",
    createdAt: quotation.createdAt || "",
    status: quotation.status || QUOTATION_STATUS_DRAFT,
    verificationRequestedAt: quotation.verificationRequestedAt || null,
    verificationRequestedById: quotation.verificationRequestedById || null,
    verificationRequestedByName: quotation.verificationRequestedByName || null,
    verificationRequestedByRole: quotation.verificationRequestedByRole || null,
    verificationRequestNotes: quotation.verificationRequestNotes || "",
    approvedAt: quotation.approvedAt || null,
    approvedById: quotation.approvedById || null,
    approvedByName: quotation.approvedByName || null,
    approvedByRole: quotation.approvedByRole || null,
    approvalNotes: quotation.approvalNotes || "",
    createdById: quotation.createdById || null,
    createdByName: quotation.createdByName || null,
    createdByEmail: quotation.createdByEmail || null,
    createdByRole: quotation.createdByRole || null,
    createdByTeam: quotation.createdByTeam || null,
    partyMode: quotation.partyMode || "lead",
    selectedLead,
    leadSearch: selectedLead ? `${selectedLead.leadId || selectedLead.id || ""} - ${selectedLead.name || ""}`.trim() : "",
    lineItems,
    discountPct: legacyDiscountPct,
    includeDesignFee: Boolean(quotation.includeDesignFee),
    designFeeAmount: Number(quotation.designFeeAmount ?? 0),
    designFeeDiscountPct: Number(quotation.designFeeDiscountPct ?? 0),
    designFeeGstPct: resolveLegacyCompatibleDesignFeeGstPct(quotation.designFeeGstPct, legacyGstPct),
    gstPct: legacyGstPct,
    gstRows,
  };
}

export function createQuotationPayload({
  id,
  quotationNumber,
  quotationDate,
  customerName,
  partyMode,
  selectedLead,
  lineItems,
  discountPct,
  includeDesignFee,
  designFeeAmount,
  designFeeDiscountPct,
  designFeeGstPct,
  gstRows,
  gstPct,
  cgstPct,
  sgstPct,
  igstPct,
  totals,
  status,
  verificationRequestedAt,
  verificationRequestedById,
  verificationRequestedByName,
  verificationRequestedByRole,
  verificationRequestNotes,
  approvedAt,
  approvedById,
  approvedByName,
  approvedByRole,
  approvalNotes,
  createdBy,
  createdById,
  createdByName,
  createdByEmail,
  createdByRole,
  createdByTeam,
  createdAt,
}) {
  const now = new Date().toISOString();
  const resolvedId = id || `quotation-${Date.now()}`;
  const clientName = customerName || selectedLead?.name || "";
  const clientMobile = selectedLead?.mobile || selectedLead?.phone || "";
  const clientEmail = selectedLead?.email || "";
  const clientCompany = selectedLead?.company || selectedLead?.companyName || "";
  const clientAddress = String(selectedLead?.address || selectedLead?.streetAddress || "").trim();
  const clientState = String(selectedLead?.leadState || selectedLead?.state || "").trim();
  const items = Array.isArray(lineItems)
    ? lineItems.map((item) => ({
        requirementId: item.requirementId ?? item.sourceRequirementId ?? null,
        productName: item.productName || "",
        specsSummary: item.specsSummary || item.variantSummary || "",
        specsJson: item.specsJson || JSON.stringify(item.specs || item.variantFields || {}),
        quantity: Number(item.quantity || 0),
        unitPrice: Number(item.unitPrice ?? item.pricePerUnit ?? 0),
        discountPct: Number(item.discountPct ?? item.discountPercent ?? 0),
        gstPct: Number(item.gstPct ?? item.gstPercent ?? 0),
        gstMasterId: item.gstMasterId ?? null,
      }))
    : [];

  return {
    id: resolvedId,
    leadId: selectedLead?.id ?? null,
    quotationNumber: quotationNumber || "DRAFT",
    quotationDate,
    customerName,
    clientName,
    clientMobile,
    clientEmail,
    clientCompany,
    clientAddress,
    streetAddress: clientAddress,
    clientState,
    leadState: clientState,
    partyMode,
    selectedLead,
    lineItems,
    items,
    discountPct,
    discountPercent: clampNonNegativeNumber(discountPct, 0),
    includeDesignFee: includeDesignFee || false,
    designFeeAmount: Number(designFeeAmount || 0),
    designFeeDiscountPct: Number(designFeeDiscountPct || 0),
    designFeeGstPct: Number(designFeeGstPct || 0),
    gstRows: Array.isArray(gstRows) ? gstRows : [],
    gstPct,
    gstPercent: gstPct,
    gstPctTotal: gstPct,
    cgstPct,
    sgstPct,
    igstPct,
    totals,
    status: status || QUOTATION_STATUS_DRAFT,
    verificationRequestedAt: verificationRequestedAt || null,
    verificationRequestedById: verificationRequestedById || null,
    verificationRequestedByName: verificationRequestedByName || null,
    verificationRequestedByRole: verificationRequestedByRole || null,
    verificationRequestNotes: verificationRequestNotes || "",
    approvedAt: approvedAt || null,
    approvedById: approvedById || null,
    approvedByName: approvedByName || null,
    approvedByRole: approvedByRole || null,
    approvalNotes: approvalNotes || "",
    createdBy: createdBy || null,
    createdById: createdById || null,
    createdByName: createdByName || null,
    createdByEmail: createdByEmail || null,
    createdByRole: createdByRole || null,
    createdByTeam: createdByTeam || null,
    updatedAt: now,
    createdAt: createdAt || now,
  };
}

function formatLeadState(value) {
  const raw = String(value || "").trim();
  if (!raw) return "";
  const normalized = raw.toLowerCase().replace(/[^a-z]/g, "");
  if (normalized === "tn" || normalized === "tamilnadu" || normalized.startsWith("tamilna")) {
    return "Tamil Nadu";
  }
  return raw.toLowerCase().replace(/\b\w/g, (char) => char.toUpperCase());
}

function deriveStateCode(stateValue) {
  if (!stateValue) return "";
  const normalized = String(stateValue).trim().toUpperCase().replace(/[^A-Z]/g, "");
  const map = {
    TN: "33", TAMILNADU: "33", TAMILNASU: "33",
    KA: "29", KARNATAKA: "29",
    MH: "27", MAHARASHTRA: "27",
    DL: "07", DELHI: "07", NEWDELHI: "07",
    GJ: "24", GUJARAT: "24",
    RJ: "08", RAJASTHAN: "08",
    UP: "09", UTTARPRADESH: "09",
    WB: "19", WESTBENGAL: "19",
    AP: "37", ANDHRAPRADESH: "37",
    TS: "36", TELANGANA: "36",
    KL: "32", KERALA: "32",
    MP: "23", MADHYAPRADESH: "23",
    HR: "06", HARYANA: "06",
    PB: "03", PUNJAB: "03",
    OR: "21", ODISHA: "21",
  };
  return map[normalized] || "";
}

const STATE_NAMES = {
  ap: "Andhra Pradesh", andhra: "Andhra Pradesh",
  ar: "Arunachal Pradesh",
  as: "Assam",
  br: "Bihar",
  cg: "Chhattisgarh", chattisgarh: "Chhattisgarh",
  ga: "Goa",
  gj: "Gujarat", gujarat: "Gujarat",
  hr: "Haryana",
  hp: "Himachal Pradesh",
  jh: "Jharkhand",
  ka: "Karnataka", karnataka: "Karnataka",
  kl: "Kerala", kerala: "Kerala",
  mp: "Madhya Pradesh",
  mh: "Maharashtra", maharashtra: "Maharashtra",
  mn: "Manipur",
  ml: "Meghalaya",
  mz: "Mizoram",
  nl: "Nagaland",
  or: "Odisha", odisha: "Odisha",
  pb: "Punjab",
  rj: "Rajasthan", rajasthan: "Rajasthan",
  sk: "Sikkim",
  tn: "Tamil Nadu", tamilnadu: "Tamil Nadu", tamil: "Tamil Nadu",
  ts: "Telangana", telangana: "Telangana",
  tr: "Tripura",
  up: "Uttar Pradesh",
  uk: "Uttarakhand",
  wb: "West Bengal",
  dl: "Delhi",
  jk: "Jammu & Kashmir",
  la: "Ladakh",
  ch: "Chandigarh",
  dn: "Dadra & Nagar Haveli",
  dd: "Daman & Diu",
  ld: "Lakshadweep",
  py: "Puducherry",
};

function expandStateName(raw) {
  if (!raw) return "";
  const key = raw.trim().toLowerCase().replace(/[^a-z]/g, "");
  return STATE_NAMES[key] || raw;
}

function asText(value, fallback = "") {
  return String(value ?? fallback).trim();
}

function normalizeQuotationLeadForPdf(quotation = {}) {
  const rawLead = quotation.selectedLead && typeof quotation.selectedLead === "object"
    ? quotation.selectedLead
    : {};
  const address = String(
    rawLead.address ||
    rawLead.streetAddress ||
    quotation.clientAddress ||
    quotation.streetAddress ||
    quotation.address ||
    ""
  ).trim();
  const leadState = String(
    rawLead.leadState ||
    rawLead.state ||
    quotation.clientState ||
    quotation.leadState ||
    quotation.state ||
    ""
  ).trim();

  return {
    ...quotation,
    selectedLead: {
      ...rawLead,
      id: rawLead.id ?? quotation.leadId ?? null,
      leadId: rawLead.leadId ?? quotation.leadId ?? "",
      name: rawLead.name || quotation.customerName || quotation.clientName || "",
      mobile: rawLead.mobile || quotation.clientMobile || "",
      email: rawLead.email || quotation.clientEmail || "",
      company: rawLead.company || rawLead.companyName || quotation.clientCompany || "",
      address,
      streetAddress: rawLead.streetAddress || address,
      leadState,
      state: rawLead.state || leadState,
    },
  };
}

function money(value) {
  return Number(value || 0).toFixed(2);
}

function safeAddImage(doc, dataUrl, x, y, maxW, maxH) {
  if (!dataUrl || typeof dataUrl !== "string") return false;
  const comma = dataUrl.indexOf(",");
  if (comma === -1) return false;
  const b64 = dataUrl.slice(comma + 1).trim();
  if (!b64 || b64.length < 100) return false;
  try {
    // Detect format from data URL prefix
    const prefix = dataUrl.slice(0, comma).toLowerCase();
    let fmt = "PNG";
    if (prefix.includes("jpeg") || prefix.includes("jpg")) fmt = "JPEG";
    else if (b64.startsWith("/9j/")) fmt = "JPEG"; // JPEG magic bytes in base64

    const props = doc.getImageProperties(b64);
    if (!props || !props.width || !props.height) return false;
    const ratio = props.width / props.height;
    let rW = maxW, rH = rW / ratio;
    if (rH > maxH) { rH = maxH; rW = rH * ratio; }
    rW = Math.max(rW, 1); rH = Math.max(rH, 1);
    doc.addImage(b64, fmt, x, y, rW, rH);
    return true;
  } catch (_e) {
    return false;
  }
}

function safeAddImageFill(doc, dataUrl, x, y, width, height) {
  if (!dataUrl || typeof dataUrl !== "string") return false;
  const comma = dataUrl.indexOf(",");
  if (comma === -1) return false;
  const b64 = dataUrl.slice(comma + 1).trim();
  if (!b64 || b64.length < 100) return false;
  try {
    const prefix = dataUrl.slice(0, comma).toLowerCase();
    let fmt = "PNG";
    if (prefix.includes("jpeg") || prefix.includes("jpg")) fmt = "JPEG";
    else if (b64.startsWith("/9j/")) fmt = "JPEG";
    doc.addImage(b64, fmt, x, y, width, height);
    return true;
  } catch (_e) {
    return false;
  }
}

export async function buildQuotationPdf({
  customerName,
  clientName,
  clientMobile,
  clientEmail,
  clientCompany,
  leadId,
  selectedLead: rawSelectedLead,
  quotationDate,
  createdAt,
  quotationNumber,
  lineItems = [],
  items,
  includeDesignFee = false,
  designFeeAmount = 0,
  designFeeDiscountPct = 0,
  designFeeGstPct = 0,
  gstPct,
  gstPercent,
  gstPctTotal,
  cgstPct,
  sgstPct,
  igstPct,
  gstRows = [],
  totals = {},
  subtotal: rootSubtotal,
  discountPercent,
  discountPct,
  grandTotal: rootGrandTotal,
  createdByName,
  createdByRole,
  approvedByName,
  template = {},
}) {
  // Build a selectedLead fallback from root-level client* fields (API response from list page)
  const selectedLead = rawSelectedLead || {
    leadId: leadId || "",
    name: clientName || customerName || "",
    mobile: clientMobile || "",
    email: clientEmail || "",
    company: clientCompany || "",
    address: "",
    streetAddress: "",
    leadState: "",
    state: "",
  };
  const resolvedCustomerName = customerName || clientName || selectedLead?.name || "";
  const resolvedDate = quotationDate || (createdAt ? new Date(createdAt).toISOString().slice(0, 10) : "") || "";
  const resolvedLineItems = (lineItems && lineItems.length) ? lineItems : (items || []);

  const resolvedTemplate = {
    companyName: "",
    companyTagline: "",
    address: "",
    phone1: "",
    phone2: "",
    workPhone: "",
    email: "",
    website: "",
    gstin: "",
    stateCode: "",
    stateName: "",
    udyamNumber: "",
    logoBase64: null,
    signatureBase64: null,
    watermarkBase64: null,
    bankName: "",
    accountNumber: "",
    ifscCode: "",
    branch: "",
    validityDays: 30,
    preparedByDefault: "",
    approvedByDefault: "",
    policyText: "",
    ...template,
  };

  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const left = 14;
  const right = pageWidth - 14;
  const tableMargin = { left: 14, right: 14 };
  const tableWidth = 182;
  const tableLineColor = [180, 180, 180];
  const tableLineWidth = 0.3;
  const companyNameText = String(resolvedTemplate.companyName || "");
  const drawnWatermarkPages = new Set();
  const drawPageWatermark = () => {
    if (!resolvedTemplate.watermarkBase64) return;
    const pageInfo = doc.internal.getCurrentPageInfo?.();
    const pageNumber = pageInfo?.pageNumber || doc.getNumberOfPages();
    if (drawnWatermarkPages.has(pageNumber)) return;
    drawnWatermarkPages.add(pageNumber);
    safeAddImageFill(doc, resolvedTemplate.watermarkBase64, 0, 0, pageWidth, pageHeight);
  };
  const addWatermarkedPage = () => {
    doc.addPage();
    drawPageWatermark();
  };
  const tableHookOptions = {
    willDrawPage: () => drawPageWatermark(),
  };

  // ── GST LOGIC ──
  const leadStateValue = selectedLead?.leadState || selectedLead?.state || "";
  const leadStateDisplay = formatLeadState(leadStateValue);
  const leadStateCode = deriveStateCode(leadStateValue);
  const isTN = isTamilNaduState(leadStateValue);
  const leadAddress = selectedLead?.address || selectedLead?.streetAddress || "";
  const legacyDiscountPct = clampNonNegativeNumber(discountPercent ?? discountPct ?? 0, 0);
  const legacyGstPct = clampNonNegativeNumber(
    gstPct ?? gstPercent ?? gstPctTotal ?? (
      Array.isArray(gstRows) && gstRows.length > 0
        ? gstRows.reduce((sum, r) => sum + Number(r.taxPercent || 0), 0)
        : 0
    ),
    0,
  );
  const shouldSeedLegacyItemTaxes =
    resolvedLineItems.length > 0 &&
    (legacyDiscountPct > 0 || legacyGstPct > 0) &&
    resolvedLineItems.every((item) =>
      Number(item?.discountPct ?? item?.discountPercent ?? 0) === 0 &&
      Number(item?.gstPct ?? item?.gstPercent ?? item?.gstPctTotal ?? 0) === 0
    );
  const normalizedLineItems = resolvedLineItems.map((item) =>
    normalizeQuotationLineItem(item, {
      isTamilNadu: isTN,
      defaultDiscountPct: legacyDiscountPct,
      defaultGstPct: legacyGstPct,
      preferFallbackWhenZero: shouldSeedLegacyItemTaxes,
    })
  );
  const designFeeBase = includeDesignFee ? Number(designFeeAmount || 0) : 0;
  const designFeePricing = buildDesignFeePricing({
    includeDesignFee,
    designFeeAmount: designFeeBase,
    designFeeDiscountPct: clampNonNegativeNumber(designFeeDiscountPct ?? 0, 0),
    designFeeGstPct: clampNonNegativeNumber(resolveLegacyCompatibleDesignFeeGstPct(designFeeGstPct, legacyGstPct), 0),
    isTamilNadu: isTN,
  });
  const productSubtotal = normalizedLineItems.reduce((sum, item) => sum + Number(item.baseAmount || 0), 0);
  const productDiscount = normalizedLineItems.reduce((sum, item) => sum + Number(item.discountAmount || 0), 0);
  const taxSummary = buildQuotationTaxSummary(normalizedLineItems, {
    isTamilNadu: isTN,
    includeDesignFee,
    designFeeAmount: designFeeBase,
    designFeeDiscountPct: designFeePricing.discountPct,
    designFeeGstPct: designFeePricing.gstPct,
  });
  const cgstAmt = taxSummary.totalCgstAmount;
  const sgstAmt = taxSummary.totalSgstAmount;
  const igstAmt = taxSummary.totalIgstAmount;
  const designFeeTaxAmount = taxSummary.designFeeTaxAmount;
  const subtotal = Number(totals.subtotal ?? rootSubtotal ?? (productSubtotal + Number(designFeePricing.baseAmount || 0)));
  const discountAmt = Number(totals.discountAmt ?? (productDiscount + designFeePricing.discountAmount));
  const taxableAmount = Number(totals.afterDiscount ?? (subtotal - discountAmt));
  const taxAmount = Number(totals.taxAmt ?? taxSummary.totalTaxAmount);
  const grandTotal = Number(totals.grandTotal ?? rootGrandTotal ?? (taxableAmount + taxAmount));
  const taxAmountWordsText = `Tax Amount (in words): ${amountToWords(taxAmount, { includePaise: true })}`;
  const declarationText = (() => {
    const rawDeclaration = String(resolvedTemplate.policyText || "").trim();
    if (rawDeclaration) {
      return rawDeclaration;
    }
    return "We declare that this invoice shows the actual price of the goods described and that all particulars are true and correct.";
  })();
  // ══ SECTION 1 — Header: ONE table, logo inside left cell ══
  autoTable(doc, {
    ...tableHookOptions,
    startY: 10,
    margin: { left: 14, right: 14 },
    tableWidth: 182,
    theme: "grid",
    head: [],
    body: [["", ""]],
    styles: {
      lineColor: [180, 180, 180],
      lineWidth: 0.3,
      overflow: "linebreak",
      cellPadding: 0,
    },
    columnStyles: {
      0: { cellWidth: 105, minCellHeight: 52 },
      1: { cellWidth: 77,  minCellHeight: 52 },
    },
    didDrawCell: (data) => {
      if (data.section !== "body") return;

      // ── LEFT CELL — logo top, info below ──
      if (data.column.index === 0) {
        const cx = data.cell.x + 4;
        let ly = data.cell.y + 4;
        let logoH = 0;

        // Logo at extreme left of cell (minimal padding)
        const logoX = data.cell.x + 3;
        const logoOk = safeAddImage(doc, resolvedTemplate.logoBase64, logoX, ly, 55, 16);
        if (logoOk) {
          logoH = 18;
        } else {
          doc.setFont("helvetica", "bold").setFontSize(11).setTextColor(20, 20, 20);
          doc.text(String(resolvedTemplate.companyName || ""), cx, ly + 7);
          logoH = 11;
        }

        ly += logoH;

        const headerInfoLines = [
          resolvedTemplate.phone1    ? `Ph: ${resolvedTemplate.phone1}`         : null,
          resolvedTemplate.phone2    ? `Ph2: ${resolvedTemplate.phone2}`        : null,
          resolvedTemplate.workPhone ? `Work: ${resolvedTemplate.workPhone}`    : null,
          resolvedTemplate.email     ? `Email: ${resolvedTemplate.email}`       : null,
          resolvedTemplate.gstin     ? `GSTIN: ${resolvedTemplate.gstin}`       : null,
          resolvedTemplate.website   ? `Website: ${resolvedTemplate.website}`   : null,
          resolvedTemplate.udyamNumber ? `UDYAM: ${resolvedTemplate.udyamNumber}` : null,
          (resolvedTemplate.stateName || resolvedTemplate.stateCode)
            ? `State: ${resolvedTemplate.stateName || ""}, Code: ${resolvedTemplate.stateCode || ""}`
            : null,
        ].filter(Boolean);

        doc.setFont("helvetica", "normal").setFontSize(7.5).setTextColor(50, 50, 50);
        headerInfoLines.forEach((line) => {
          doc.text(String(line), cx, ly);
          ly += 4;
        });
      }

      // ── RIGHT CELL — QUOTATION title + details ──
      if (data.column.index === 1) {
        const cx = data.cell.x + 4;
        const centerX = data.cell.x + data.cell.width / 2;
        let ry = data.cell.y + 12;

        doc.setFont("helvetica", "bold").setFontSize(16).setTextColor(69, 89, 122);
        doc.text("QUOTATION", centerX, ry, { align: "center" });
        ry += 5;

        doc.setDrawColor(200, 200, 200);
        doc.setLineWidth(0.3);
        doc.line(cx, ry, data.cell.x + data.cell.width - 4, ry);
        ry += 5;

        [
          ["Quotation No", asText(quotationNumber, "DRAFT")],
          ["Date",         asText(resolvedDate, "-")],
          ["Valid For",    `${Number(resolvedTemplate.validityDays) || 30} days`],
        ].forEach(([label, value]) => {
          doc.setFont("helvetica", "bold").setFontSize(8).setTextColor(30, 30, 30);
          doc.text(label, cx, ry);
          doc.setFont("helvetica", "normal");
          doc.text(`: ${value}`, cx + 28, ry);
          ry += 5;
        });
      }
    },
  });

  const headerEndY = doc.lastAutoTable.finalY;
  doc.setDrawColor(69, 89, 122);
  doc.setLineWidth(1.5);
  doc.line(14, headerEndY, pageWidth - 14, headerEndY);

  // ══ SECTION 2 — Buyer Card ══
  autoTable(doc, {
    ...tableHookOptions,
    startY: headerEndY + 6,
    margin: { left: 14, right: 14 },
    tableWidth: 182,
    theme: "grid",
    head: [],
    body: [["", ""]],
    styles: {
      lineColor: [180, 180, 180],
      lineWidth: 0.3,
      overflow: "linebreak",
      cellPadding: 0,
      fillColor: false,
    },
    columnStyles: {
      0: { cellWidth: 91 },
      1: { cellWidth: 91 },
    },
    didDrawCell: (data) => {
      if (data.section !== "body") return;

      const isLeft  = data.column.index === 0;
      const isRight = data.column.index === 1;
      const cx = data.cell.x + 4;
      let ly = data.cell.y + 6;

      if (isLeft) {
        doc.setFont("helvetica", "bold").setFontSize(8).setTextColor(30, 30, 30);
        doc.text("Details of Buyer (Billed To)", cx, ly); ly += 5;
        doc.setFont("helvetica", "normal").setFontSize(7.5).setTextColor(50, 50, 50);
        [
          `Customer ID: ${selectedLead?.leadId || "-"}`,
          `Name: ${resolvedCustomerName || "-"}`,
          `Address: ${leadAddress || "-"}`,
          `State: ${expandStateName(leadStateValue) || leadStateDisplay || "-"}`,
          `State Code: ${leadStateCode || "-"}`,
          `Mobile: ${formatIndianMobileNumber(selectedLead?.mobile)}`,
        ].forEach((line) => { doc.text(line, cx, ly); ly += 4.5; });
      }

      if (isRight) {
        doc.setFont("helvetica", "bold").setFontSize(8).setTextColor(30, 30, 30);
        doc.text("Dispatch / Consignee", cx, ly); ly += 5;
        doc.setFont("helvetica", "normal").setFontSize(7.5).setTextColor(50, 50, 50);
        [
          `Customer ID: ${selectedLead?.leadId || "-"}`,
          `Name: ${resolvedCustomerName || "-"}`,
          `Address: ${leadAddress || "-"}`,
          `State: ${expandStateName(leadStateValue) || leadStateDisplay || "-"}`,
          `State Code: ${leadStateCode || "-"}`,
          `Mobile: ${formatIndianMobileNumber(selectedLead?.mobile)}`,
        ].forEach((line) => { doc.text(line, cx, ly); ly += 4.5; });
      }
    },
    bodyStyles: { minCellHeight: 46 },
  });

  const buyerEndY = doc.lastAutoTable.finalY;

  // ══ SECTION 9 — Line items table body ══
  const showHsnSacColumn = normalizedLineItems.some((item) => Boolean(extractTaxGroupCode(item)));
  const tableBody = [];
  let rowNum = 1;

  normalizedLineItems.forEach((item) => {
    const isDesignOnly = String(item?.designStatus || "").toLowerCase() === "design_only";
    const specsText = fullSpecsSummary(item?.specs || item?.specsJson || {}) || item?.specsSummary || "";
    const productName = asText(item?.productName, "-");
    const discountAmount = Number(item?.discountAmount || 0);
    const discountText = !isDesignOnly && discountAmount > 0 ? `Discounted Amount: ${money(discountAmount)}` : "";
    const description = [productName, specsText, discountText].filter(Boolean).join("\n");
    const hsnSac = extractTaxGroupCode(item);

    tableBody.push({
      rowType: "product",
      cells: [
        String(rowNum++),
        description,
        ...(showHsnSacColumn ? [isDesignOnly ? "—" : (hsnSac || "—")] : []),
        isDesignOnly ? "—" : `${Number(item.discountPct || 0).toFixed(2)}%`,
        isDesignOnly ? "—" : `${Number(item.gstPct || 0).toFixed(2)}%`,
        isDesignOnly ? "—" : (Number(item.quantity || 0) > 0 ? String(Number(item.quantity || 0)) : "—"),
        isDesignOnly ? "—" : (Number(item.quantity || 0) > 0 ? "Nos" : "—"),
        isDesignOnly ? "—" : (Number(item.unitPrice || 0) > 0 ? Number(item.unitPrice || 0).toFixed(2) : "—"),
        Number(item.lineTotal || 0).toFixed(2),
      ],
    });
  });

  if (includeDesignFee && Number(designFeeAmount || 0) > 0) {
    const designFeeDiscountText = Number(designFeePricing.discountAmount || 0) > 0
      ? `Discounted Amount: ${money(designFeePricing.discountAmount)}`
      : "";
    tableBody.push({
      rowType: "designFee",
      cells: [
        String(rowNum++),
        ["Design Fee", designFeeDiscountText].filter(Boolean).join("\n"),
        ...(showHsnSacColumn ? ["—"] : []),
        `${designFeePricing.discountPct.toFixed(2)}%`,
        `${designFeePricing.gstPct.toFixed(2)}%`,
        "1",
        "Job",
        Number(designFeePricing.baseAmount).toFixed(2),
        designFeePricing.lineTotal.toFixed(2),
      ],
    });
  }

  // ══ SECTION 3 — Line items table ══
  autoTable(doc, {
    ...tableHookOptions,
    startY: buyerEndY + 6,
    margin: tableMargin,
    tableWidth,
    theme: "grid",
    head: [showHsnSacColumn
      ? ["Sl.No", "Description of Goods", "HSN/SAC", "Disc %", "GST %", "Qty", "UOM", "Rate", "Amount"]
      : ["Sl.No", "Description of Goods", "Disc %", "GST %", "Qty", "UOM", "Rate", "Amount"]
    ],
    body: tableBody.map((r) => r.cells),
    headStyles: {
      fillColor: [69, 89, 122], textColor: [255, 255, 255],
      fontStyle: "bold", fontSize: 8,
      overflow: "hidden",
      cellPadding: { top: 3, bottom: 3, left: 2, right: 2 },
    },
    styles: {
      fontSize: 8, lineColor: tableLineColor, lineWidth: tableLineWidth,
      overflow: "linebreak", textColor: [30, 30, 30],
    },
    alternateRowStyles: { fillColor: false },
    columnStyles: showHsnSacColumn
      ? {
          0: { cellWidth: 11, halign: "center" },
          1: { cellWidth: 56, halign: "left"   },
          2: { cellWidth: 18, halign: "center" },
          3: { cellWidth: 15, halign: "center" },
          4: { cellWidth: 15, halign: "center" },
          5: { cellWidth: 13, halign: "center" },
          6: { cellWidth: 14, halign: "center" },
          7: { cellWidth: 20, halign: "right"  },
          8: { cellWidth: 28, halign: "right"  },
        }
      : {
          0: { cellWidth: 11, halign: "center" },
          1: { cellWidth: 66, halign: "left"   },
          2: { cellWidth: 15, halign: "center" },
          3: { cellWidth: 15, halign: "center" },
          4: { cellWidth: 13, halign: "center" },
          5: { cellWidth: 14, halign: "center" },
          6: { cellWidth: 20, halign: "right"  },
          7: { cellWidth: 28, halign: "right"  },
        },
    didParseCell: (data) => {
      if (data.section !== "body") return;
      // Design fee rows — use default body styles, no override needed
    },
  });
  const lineItemsEndY = doc.lastAutoTable.finalY;

  // ══ SECTION 4 — E&OE row (connected to line items) ══
  autoTable(doc, {
    ...tableHookOptions,
    startY: lineItemsEndY - tableLineWidth,
    margin: { left: 14, right: 14, top: 0 },
    tableWidth,
    head: [],
    body: [[
      "E&OE",
      `GST Amount: Rs. ${taxAmount.toFixed(2)}`,
      `Discount Amount: Rs. ${discountAmt.toFixed(2)}`,
      `Total (INR): Rs. ${grandTotal.toFixed(2)}`,
    ]],
    theme: "grid",
    styles: {
      fontSize: 8,
      cellPadding: { top: 3, bottom: 3, left: 3, right: 3 },
      lineColor: tableLineColor,
      lineWidth: tableLineWidth,
    },
    bodyStyles: {
      fillColor: [69, 89, 122],
      textColor: [255, 255, 255],
      fontStyle: "bold",
    },
    columnStyles: {
      0: { cellWidth: 18, halign: "center" },
      1: { cellWidth: 64, halign: "center" },
      2: { cellWidth: 50, halign: "center" },
      3: { cellWidth: 50, halign: "right"  },
    },
  });

  const eoeEndY = doc.lastAutoTable.finalY;

  // ══ SECTION 5 — Amount chargeable above tax summary ══
  const amountChargeableY = doc.lastAutoTable.finalY;
  const roundedGrandTotal = Math.round(grandTotal);
  const amountChargeableText = `Amount Chargeable (in words): INR ${amountToWords(roundedGrandTotal)}`;
  autoTable(doc, {
    ...tableHookOptions,
    startY: amountChargeableY - tableLineWidth,
    margin: { left: 14, right: 14, top: 0 },
    tableWidth,
    head: [],
    body: [[amountChargeableText, "E. & O. E"]],
    theme: "grid",
    styles: {
      fontSize: 8,
      lineColor: tableLineColor,
      lineWidth: tableLineWidth,
      cellPadding: 4,
      textColor: [30, 30, 30],
    },
    bodyStyles: {
      fillColor: false,
      textColor: [30, 30, 30],
    },
    columnStyles: {
      0: { cellWidth: 150, halign: "left", fontStyle: "normal" },
      1: { cellWidth: 32, halign: "right", fontStyle: "bold" },
    },
  });

  // ══ SECTION 6 — Tax summary grouped by GST rate ══
  autoTable(doc, {
    ...tableHookOptions,
    startY: doc.lastAutoTable.finalY + 4,
    margin: { left: 14, right: 14, top: 0 },
    tableWidth,
    theme: "grid",
    head: [isTN
      ? [
          "Products",
          "Taxable Value",
          "CGST %",
          "CGST Amount",
          "SGST/UTGST %",
          "SGST/UTGST Amount",
          "Tax Amount",
        ]
      : [
          "Products",
          "Taxable Value",
          "IGST %",
          "IGST Amount",
          "Tax Amount",
        ]
    ],
    body: [
      ...taxSummary.rows.map((row, index) => (
        isTN
          ? [
              row.displayText || row.serialText || String(index + 1),
              money(row.taxableAmount),
              `${money(row.cgstRate)}%`,
              money(row.cgstAmount),
              `${money(row.sgstRate)}%`,
              money(row.sgstAmount),
              money(row.taxTotalAmount),
            ]
          : [
              row.displayText || row.serialText || String(index + 1),
              money(row.taxableAmount),
              `${money(row.igstRate)}%`,
              money(row.igstAmount),
              money(row.taxTotalAmount),
            ]
      )),
      isTN
        ? [
            "Total",
            money(taxSummary.productTaxableAmount),
            "",
            money(taxSummary.totalCgstAmount),
            "",
            money(taxSummary.totalSgstAmount),
            money(taxSummary.productTaxAmount),
          ]
        : [
            "Total",
            money(taxSummary.productTaxableAmount),
            "",
            money(taxSummary.totalIgstAmount),
            money(taxSummary.productTaxAmount),
          ],
    ],
    headStyles: {
      fillColor: [220, 228, 240],
      textColor: [30, 30, 30],
      fontStyle: "bold",
      fontSize: 7,
      halign: "center",
    },
    styles: {
      fontSize: 8,
      lineColor: tableLineColor,
      lineWidth: tableLineWidth,
      overflow: "linebreak",
    },
    columnStyles: isTN
      ? {
          0: { cellWidth: 24, halign: "center" },
          1: { cellWidth: 30, halign: "right" },
          2: { cellWidth: 20, halign: "center" },
          3: { cellWidth: 26, halign: "right" },
          4: { cellWidth: 22, halign: "center" },
          5: { cellWidth: 30, halign: "right" },
          6: { cellWidth: 30, halign: "right" },
        }
      : {
          0: { cellWidth: 24, halign: "center" },
          1: { cellWidth: 62, halign: "right" },
          2: { cellWidth: 24, halign: "center" },
          3: { cellWidth: 36, halign: "right" },
          4: { cellWidth: 36, halign: "right" },
        },
    didParseCell: (data) => {
      if (data.section !== "body") return;
      const isTotalRow = data.row.index === taxSummary.rows.length;
      if (isTotalRow) {
        data.cell.styles.fontStyle = "bold";
        data.cell.styles.fillColor = false;
      }
      if (data.column.index === 0) {
        data.cell.styles.halign = "left";
      }
    },
  });

  // ══ SECTION 7 — Tax words + Declaration + Bank + Signature ══
  const totalsEndY = doc.lastAutoTable.finalY;
  const footerReserve = 20;
  let y = totalsEndY + 6;
  if (y + 40 > pageHeight - footerReserve) {
    addWatermarkedPage();
    y = 14;
  }

  const bankDetailsContent = [
    "Bank Details:",
    `Bank: ${asText(resolvedTemplate.bankName, "-")}`,
    `A/c No: ${asText(resolvedTemplate.accountNumber, "-")}`,
    `IFSC Code: ${asText(resolvedTemplate.ifscCode, "-")}`,
    `Branch: ${asText(resolvedTemplate.branch, "-")}`,
  ].join("\n");

  const footerLeftContent = [
    taxAmountWordsText,
    `Declaration: ${declarationText}`,
    "",
    bankDetailsContent,
  ].join("\n");

  autoTable(doc, {
    ...tableHookOptions,
    startY: y,
    head: [[
      "Tax / Declaration / Bank Details",
      `For ${companyNameText}`,
    ]],
    body: [[footerLeftContent, ""]],
    styles: {
      fontSize: 7,
      cellPadding: 4,
      valign: "top",
      lineColor: [180, 180, 180],
      lineWidth: 0.3,
      overflow: "linebreak",
      textColor: [30, 30, 30],
    },
    headStyles: {
      fillColor: false,
      textColor: [30, 30, 30],
      fontStyle: "bold",
      fontSize: 8,
      lineColor: [180, 180, 180],
      lineWidth: 0.3,
    },
    columnStyles: {
      0: { cellWidth: 140 },
      1: { cellWidth: 42 },
    },
    theme: "grid",
    margin: { left: 14, right: 14 },
    didDrawCell: (data) => {
      if (data.section === "body" && data.column.index === 1) {
        if (resolvedTemplate.signatureBase64) {
          safeAddImage(
            doc,
            resolvedTemplate.signatureBase64,
            data.cell.x + 3,
            data.cell.y + 8,
            34,
            18,
          );
        }
        doc.setFont("helvetica", "normal").setFontSize(7.5).setTextColor(30, 30, 30);
        doc.text("Authorised Signature", data.cell.x + 3, data.cell.y + 32);
      }
    },
  });

  // ══ SECTION 8 — Footer pinned to last page ══
  const NON_EMPLOYEE = ["MANAGER", "ADMIN", "SUPER_ADMIN", "TEAM_LEAD"];
  const creatorRole = String(createdByRole || "").toUpperCase();
  const preparedBy = createdByName || resolvedTemplate.preparedByDefault || "";
  const approvedBy = NON_EMPLOYEE.includes(creatorRole)
    ? createdByName
    : (approvedByName || resolvedTemplate.approvedByDefault || "");

  doc.setPage(doc.getNumberOfPages());
  doc.setDrawColor(200, 200, 200);
  doc.setLineWidth(0.3);
  doc.line(14, pageHeight - 12, pageWidth - 14, pageHeight - 12);
  doc.setFont("helvetica", "normal").setFontSize(7).setTextColor(80, 80, 80);
  doc.text(
    `Prepared by: ${preparedBy} | Approved by: ${approvedBy} | This is a Computer Generated Form`,
    pageWidth / 2,
    pageHeight - 7,
    { align: "center" },
  );

  return doc;
}

async function convertImageToPng(dataUrl, maxPxWidth = 400, opacity = 1) {
  return new Promise((resolve) => {
    if (!dataUrl || !dataUrl.includes(",")) { resolve(dataUrl); return; }
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      try {
        const canvas = document.createElement("canvas");
        const srcW = img.naturalWidth  || 400;
        const srcH = img.naturalHeight || 150;
        // Scale down to maxPxWidth — no need for huge images in PDF
        const scale = Math.min(1, maxPxWidth / srcW);
        const outW = Math.round(srcW * scale);
        const outH = Math.round(srcH * scale);
        canvas.width  = outW;
        canvas.height = outH;
        const ctx = canvas.getContext("2d");
        if (!ctx) { resolve(dataUrl); return; }
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = "high";
        ctx.clearRect(0, 0, outW, outH);
        ctx.globalAlpha = Math.max(0, Math.min(1, opacity));
        ctx.filter = opacity < 1 ? "brightness(1.45)" : "none";
        ctx.drawImage(img, 0, 0, outW, outH);
        ctx.filter = "none";
        // Keep watermark output as PNG so transparent regions stay transparent.
        const output = canvas.toDataURL("image/png");
        resolve(output);
      } catch (_e) { resolve(dataUrl); }
    };
    img.onerror = () => resolve(dataUrl);
    img.src = dataUrl;
  });
}

async function prepareQuotationPdfDocument(quotation, template = {}) {
  const convertedTemplate = {
    ...template,
    logoBase64: template?.logoBase64
      ? await convertImageToPng(template.logoBase64, 400) : null,
    signatureBase64: template?.signatureBase64
      ? await convertImageToPng(template.signatureBase64, 300) : null,
    watermarkBase64: template?.watermarkBase64
      ? await convertImageToPng(template.watermarkBase64, 1800) : null,
  };
  const quotationForPdf = normalizeQuotationLeadForPdf(quotation || {});
  const doc = await buildQuotationPdf({
    ...quotationForPdf,
    template: convertedTemplate,
  });
  const safeCustomerName = sanitizeFilenamePart(
    quotationForPdf.customerName || quotationForPdf.clientName || quotationForPdf.selectedLead?.name,
    "Customer"
  );
  const safeDate = sanitizeFilenamePart(
    quotationForPdf.quotationDate || quotationForPdf.createdAt,
    new Date().toISOString().slice(0, 10),
  );
  const fileName = `Quotation_${safeCustomerName}_${safeDate}.pdf`;
  return { doc, fileName };
}

async function openPdfBlobInNewTab(doc) {
  const pdfBlob = doc.output("blob");
  const downloadUrl = URL.createObjectURL(pdfBlob);
  const revokeLater = () => {
    window.setTimeout(() => {
      URL.revokeObjectURL(downloadUrl);
    }, 120000);
  };

  try {
    const popup = window.open(downloadUrl, "_blank", "noopener,noreferrer");
    if (popup) {
      try {
        popup.opener = null;
      } catch {
        // Ignore cross-browser restrictions when clearing opener.
      }
      popup.focus?.();
      revokeLater();
      return true;
    }

    const anchor = document.createElement("a");
    anchor.href = downloadUrl;
    anchor.target = "_blank";
    anchor.rel = "noopener noreferrer";
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    revokeLater();
    return true;
  } catch (error) {
    URL.revokeObjectURL(downloadUrl);
    throw error;
  }
}

export async function downloadQuotationPdf(quotation, template = {}) {
  const { doc, fileName } = await prepareQuotationPdfDocument(quotation, template);

  try {
    const pdfBlob = doc.output("blob");
    const downloadUrl = URL.createObjectURL(pdfBlob);
    const downloadLink = document.createElement("a");

    downloadLink.href = downloadUrl;
    downloadLink.download = fileName;
    downloadLink.target = "_blank";
    downloadLink.rel = "noopener";
    document.body.appendChild(downloadLink);
    downloadLink.click();
    downloadLink.remove();

    window.setTimeout(() => {
      URL.revokeObjectURL(downloadUrl);
    }, 1000);
  } catch {
    doc.save(fileName);
  }
}

export async function openQuotationPdfPreview(quotation, template = {}) {
  const { doc } = await prepareQuotationPdfDocument(quotation, template);
  await openPdfBlobInNewTab(doc);
}
