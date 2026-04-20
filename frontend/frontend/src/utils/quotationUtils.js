import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

function fullSpecsSummary(specs) {
  const raw = typeof specs === "string"
    ? (() => { try { return JSON.parse(specs); } catch { return {}; } })()
    : (specs || {});

  const skip = new Set(["customWidth", "customHeight", "customDepth", "customUnit"]);

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
        if (key === "size" && raw.customWidth && raw.customHeight) {
          const depth = raw.customDepth;
          const unit = raw.customUnit || "";
          return depth
            ? `${raw.customWidth}x${raw.customHeight}x${depth}${unit}`.trim()
            : `${raw.customWidth}x${raw.customHeight}${unit}`.trim();
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

  return {
    id: resolvedId,
    leadId: selectedLead?.id ?? null,
    quotationNumber: quotationNumber || "DRAFT",
    quotationDate,
    customerName,
    partyMode,
    selectedLead,
    lineItems,
    discountPct,
    includeDesignFee: includeDesignFee || false,
    designFeeAmount: Number(designFeeAmount || 0),
    gstRows: Array.isArray(gstRows) ? gstRows : [],
    gstPct,
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

export async function buildQuotationPdf({
  customerName,
  selectedLead,
  quotationDate,
  quotationNumber,
  lineItems = [],
  includeDesignFee = false,
  designFeeAmount = 0,
  gstPct,
  cgstPct,
  sgstPct,
  igstPct,
  gstRows = [],
  totals = {},
  createdByName,
  createdByRole,
  approvedByName,
  template = {},
}) {
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

  // ── GST LOGIC ──
  const leadStateValue = selectedLead?.leadState || selectedLead?.state || "";
  const leadStateDisplay = formatLeadState(leadStateValue);
  const leadStateCode = deriveStateCode(leadStateValue);
  const isTN = isTamilNaduState(leadStateValue);

  const resolvedGstPct = Array.isArray(gstRows) && gstRows.length > 0
    ? gstRows.reduce((sum, r) => sum + Number(r.taxPercent || 0), 0)
    : Number(gstPct || 0);

  const appliedCgstPct = isTN ? resolvedGstPct / 2 : 0;
  const appliedSgstPct = isTN ? resolvedGstPct / 2 : 0;
  const appliedIgstPct = isTN ? 0 : resolvedGstPct;

  const subtotal = Number(totals.subtotal || 0);
  const discountAmt = Number(totals.discountAmt || 0);
  const taxableAmount = Number((totals.afterDiscount ?? (subtotal - discountAmt)) || 0);
  const cgstAmt = taxableAmount * (appliedCgstPct / 100);
  const sgstAmt = taxableAmount * (appliedSgstPct / 100);
  const igstAmt = taxableAmount * (appliedIgstPct / 100);
  const totalTax = isTN ? cgstAmt + sgstAmt : igstAmt;
  const grandTotal = Number((totals.grandTotal ?? (taxableAmount + totalTax)) || 0);
  // ══ SECTION 1 — Header: ONE table, logo inside left cell ══
  autoTable(doc, {
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
          ["Date",         asText(quotationDate, "-")],
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
      fillColor: [245, 246, 248],
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
          `Name: ${customerName || "-"}`,
          `Address: ${selectedLead?.address || ""}`,
          `State: ${expandStateName(leadStateValue) || leadStateDisplay || "-"}`,
          `State Code: ${leadStateCode || "-"}`,
          `Mobile: ${selectedLead?.mobile || "-"}`,
        ].forEach((line) => { doc.text(line, cx, ly); ly += 4.5; });
      }

      if (isRight) {
        doc.setFont("helvetica", "bold").setFontSize(8).setTextColor(30, 30, 30);
        doc.text("Dispatch / Consignee", cx, ly); ly += 5;
        doc.setFont("helvetica", "normal").setFontSize(7.5).setTextColor(50, 50, 50);
        [
          `Customer ID: ${selectedLead?.leadId || "-"}`,
          `Name: ${customerName || "-"}`,
          `Address: ${selectedLead?.address || ""}`,
          `State: ${expandStateName(leadStateValue) || leadStateDisplay || "-"}`,
          `State Code: ${leadStateCode || "-"}`,
          `Mobile: ${selectedLead?.mobile || "-"}`,
        ].forEach((line) => { doc.text(line, cx, ly); ly += 4.5; });
      }
    },
    bodyStyles: { minCellHeight: 46 },
  });

  const buyerEndY = doc.lastAutoTable.finalY;

  // ══ SECTION 9 — Line items table body ══
  const tableBody = [];
  let rowNum = 1;

  (lineItems.length ? lineItems : [{}]).forEach((item) => {
    const isDesignOnly = String(item?.designStatus || "").toLowerCase() === "design_only";
    const isDesignProd = String(item?.designStatus || "").toLowerCase() === "design_production";
    const designCost   = Number(item?.designCost || 0);
    const qty          = Number(item?.quantity || 0);
    const unitPrice    = Number(item?.pricePerUnit || item?.unitPrice || 0);
    const specsText    = fullSpecsSummary(item?.specs || {});
    const productName  = asText(item?.productName, "-");
    const description  = specsText ? `${productName}\n${specsText}` : productName;
    const gstLabel     = resolvedGstPct > 0 ? `${resolvedGstPct}%` : "—";

    if (isDesignOnly) {
      tableBody.push({ rowType: "product", cells: [
        String(rowNum++), description, gstLabel,
        "—", "—", "—",
        Number(item?.lineTotal || designCost || 0).toFixed(2),
      ]});
    } else if (isDesignProd) {
      const productionAmt = qty * unitPrice;
      tableBody.push({ rowType: "product", cells: [
        String(rowNum++), description, gstLabel,
        qty > 0 ? String(qty) : "—",
        qty > 0 ? "Nos" : "—",
        unitPrice > 0 ? unitPrice.toFixed(2) : "—",
        productionAmt.toFixed(2),
      ]});
      if (designCost > 0) {
        tableBody.push({ rowType: "designFee", cells: [
          String(rowNum++), "Design Fee", gstLabel,
          "1", "Job",
          designCost.toFixed(2),
          designCost.toFixed(2),
        ]});
      }
    } else {
      const productionAmt = qty * unitPrice;
      tableBody.push({ rowType: "product", cells: [
        String(rowNum++), description, gstLabel,
        qty > 0 ? String(qty) : "—",
        qty > 0 ? "Nos" : "—",
        unitPrice > 0 ? unitPrice.toFixed(2) : "—",
        productionAmt > 0 ? productionAmt.toFixed(2) : Number(item?.lineTotal || 0).toFixed(2),
      ]});
    }
  });

  if (includeDesignFee && Number(designFeeAmount || 0) > 0) {
    tableBody.push({ rowType: "designFee", cells: [
      String(rowNum++), "Design Fee",
      resolvedGstPct > 0 ? `${resolvedGstPct}%` : "—",
      "1", "Job",
      Number(designFeeAmount).toFixed(2),
      Number(designFeeAmount).toFixed(2),
    ]});
  }

  // ══ SECTION 3 — Line items table ══
  autoTable(doc, {
    startY: buyerEndY + 6,
    margin: tableMargin,
    tableWidth,
    theme: "grid",
    head: [["Sl.No", "Description of Goods", "GST %", "Qty", "UOM", "Rate", "Amount"]],
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
    alternateRowStyles: { fillColor: [248, 250, 252] },
    columnStyles: {
      0: { cellWidth: 12, halign: "center" },
      1: { cellWidth: 80, halign: "left"   },
      2: { cellWidth: 16, halign: "center" },
      3: { cellWidth: 14, halign: "center" },
      4: { cellWidth: 16, halign: "center" },
      5: { cellWidth: 22, halign: "right"  },
      6: { cellWidth: 22, halign: "right"  },
    },
    didParseCell: (data) => {
      if (data.section !== "body") return;
      // Design fee rows — use default body styles, no override needed
    },
  });
  const lineItemsEndY = doc.lastAutoTable.finalY;

  // ══ SECTION 4 — E&OE row (connected to line items) ══
  autoTable(doc, {
    startY: lineItemsEndY - tableLineWidth,
    margin: { left: 14, right: 14, top: 0 },
    tableWidth,
    head: [],
    body: [[
      "E&OE",
      `Discount Amount: Rs. ${discountAmt.toFixed(2)}`,
      "Total Weight: 0.0000/KG",
      `Total (INR): Rs. ${subtotal.toFixed(2)}`,
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
      0: { cellWidth: 20, halign: "center" },
      1: { cellWidth: 54, halign: "center" },
      2: { cellWidth: 54, halign: "center" },
      3: { cellWidth: 54, halign: "right"  },
    },
  });

  const eoeEndY = doc.lastAutoTable.finalY;

  // ══ SECTION 5 — Tax table (connected to E&OE) ══
  if (isTN) {
    autoTable(doc, {
      startY: eoeEndY - tableLineWidth,
      margin: { left: 14, right: 14, top: 0 },
      tableWidth,
      theme: "grid",
      head: [[
        "Total Taxable Value",
        "State Tax Rate",
        "State Tax Amount",
        "Central Tax Rate",
        "Central Tax Amount",
        "Total Tax",
      ]],
      body: [[
        taxableAmount.toFixed(2),
        `${appliedCgstPct.toFixed(1)}%`,
        cgstAmt.toFixed(2),
        `${appliedSgstPct.toFixed(1)}%`,
        sgstAmt.toFixed(2),
        (cgstAmt + sgstAmt).toFixed(2),
      ]],
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
      },
      columnStyles: {
        0: { cellWidth: 36, halign: "right"  },
        1: { cellWidth: 24, halign: "center" },
        2: { cellWidth: 28, halign: "right"  },
        3: { cellWidth: 24, halign: "center" },
        4: { cellWidth: 28, halign: "right"  },
        5: { cellWidth: 42, halign: "right"  },
      },
    });
  } else {
    autoTable(doc, {
      startY: eoeEndY - tableLineWidth,
      margin: { left: 14, right: 14, top: 0 },
      tableWidth,
      head: [[
        "Total Taxable Value",
        "IGST Rate",
        "IGST Amount",
        "Total Tax",
      ]],
      body: [[
        taxableAmount.toFixed(2),
        `${resolvedGstPct.toFixed(1)}%`,
        igstAmt.toFixed(2),
        igstAmt.toFixed(2),
      ]],
      theme: "grid",
      styles: {
        fontSize: 8,
        cellPadding: 3,
        lineColor: tableLineColor,
        lineWidth: tableLineWidth,
        textColor: [30, 30, 30],
      },
      headStyles: {
        fillColor: [220, 228, 240],
        textColor: [30, 30, 30],
        fontStyle: "bold",
        halign: "center",
      },
      columnStyles: {
        0: { cellWidth: 60, halign: "right" },
        1: { cellWidth: 40, halign: "center" },
        2: { cellWidth: 42, halign: "right" },
        3: { cellWidth: 40, halign: "right" },
      },
    });
  }

  // ══ SECTION 6 — Amount in words + round off ══
  const taxEndY = doc.lastAutoTable.finalY;
  const roundOff = Math.round(grandTotal) - grandTotal;
  const roundOffDisplay = Object.is(roundOff, -0) ? "0.00" : roundOff.toFixed(2);
  const amountWordsText = `Amount in Words (INR): ${numberToWords(Math.round(grandTotal))} Rupees Only`;

  autoTable(doc, {
    startY: taxEndY - tableLineWidth,
    margin: { left: 14, right: 14, top: 0 },
    tableWidth,
    theme: "grid",
    head: [],
    body: [
      [
        { content: amountWordsText, rowSpan: 2 },
        "Round Off",
        roundOffDisplay,
      ],
      [
        "Total Amount Value (INR)",
        grandTotal.toFixed(2),
      ],
    ],
    styles: {
      fontSize: 8,
      lineColor: tableLineColor,
      lineWidth: tableLineWidth,
      cellPadding: 4,
      textColor: [30, 30, 30],
    },
    columnStyles: {
      0: {
        cellWidth: 97,
        fontStyle: "italic",
        halign: "left",
        valign: "middle",
        textColor: [30, 30, 30],
      },
      1: {
        cellWidth: 55,
        fontStyle: "bold",
        halign: "right",
        textColor: [30, 30, 30],
      },
      2: {
        cellWidth: 30,
        fontStyle: "bold",
        halign: "right",
        textColor: [30, 30, 30],
      },
    },
    didParseCell: (data) => {
      if (data.section === "body" && data.row.index === 1) {
        if (data.column.index === 1 || data.column.index === 2) {
          data.cell.styles.fontStyle = "bold";
          data.cell.styles.fontSize = 9;
        }
      }
    },
  });

  const totalsEndY = doc.lastAutoTable.finalY;

  // ══ SECTION 7 — Bank + Policy + Signature ══
  const footerReserve = 20;
  let y = totalsEndY + 6;
  if (y + 40 > pageHeight - footerReserve) {
    doc.addPage();
    y = 14;
  }

  const bankContent = [
    `Bank: ${asText(resolvedTemplate.bankName, "-")}`,
    `A/c No: ${asText(resolvedTemplate.accountNumber, "-")}`,
    `IFSC Code: ${asText(resolvedTemplate.ifscCode, "-")}`,
    `Branch: ${asText(resolvedTemplate.branch, "-")}`,
  ].join("\n");

  const policyContent = (resolvedTemplate.policyText || "")
    .split("\n").map((l) => l.trim()).filter(Boolean)
    .map((l) => `- ${l}`).join("\n");

  autoTable(doc, {
    startY: y,
    head: [["Bank Details", "Policy & Guidelines :", `For ${companyNameText}`]],
    body: [[bankContent, policyContent || "", ""]],
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
      fillColor: [255, 255, 255],
      textColor: [30, 30, 30],
      fontStyle: "bold",
      fontSize: 8,
      lineColor: [180, 180, 180],
      lineWidth: 0.3,
    },
    columnStyles: {
      0: { cellWidth: 45 },
      1: { cellWidth: 95 },
      2: { cellWidth: 42 },
    },
    theme: "grid",
    margin: { left: 14, right: 14 },
    didDrawCell: (data) => {
      if (data.section === "body" && data.column.index === 2) {
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

async function convertImageToPng(dataUrl, maxPxWidth = 400) {
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
        ctx.drawImage(img, 0, 0, outW, outH);
        // PNG for transparency, JPEG for everything else
        const isTransparent = dataUrl.startsWith("data:image/png");
        const output = isTransparent
          ? canvas.toDataURL("image/png")
          : canvas.toDataURL("image/jpeg", 0.75);
        resolve(output);
      } catch (_e) { resolve(dataUrl); }
    };
    img.onerror = () => resolve(dataUrl);
    img.src = dataUrl;
  });
}

export async function downloadQuotationPdf(quotation, template = {}) {
  const convertedTemplate = {
    ...template,
    logoBase64: template?.logoBase64
      ? await convertImageToPng(template.logoBase64, 400) : null,
    signatureBase64: template?.signatureBase64
      ? await convertImageToPng(template.signatureBase64, 300) : null,
  };
  const doc = await buildQuotationPdf({
    ...quotation,
    template: convertedTemplate,
  });
  const safeCustomerName = sanitizeFilenamePart(quotation.customerName, "Customer");
  const safeDate = sanitizeFilenamePart(
    quotation.quotationDate,
    new Date().toISOString().slice(0, 10),
  );
  const fileName = `Quotation_${safeCustomerName}_${safeDate}.pdf`;

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