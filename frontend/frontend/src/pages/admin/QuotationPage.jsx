import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { getLeads } from "../../api/leadsApi";
import { getRequirementsByLeadId } from "../../api/requirementApi";
import { approveQuotation, saveQuotation } from "../../api/quotationApi";
import { getQuotationTemplate } from "../../api/quotationTemplateApi";
import { getPriceList } from "../../api/priceListApi";
import { getActiveGstMasters, createGstMaster } from "../../api/gstMasterApi";
import "./QuotationPage.css";
import AddItemModal from "./AddItemModal";
import {
  QUOTATION_STATUS_APPROVED,
  QUOTATION_STATUS_DRAFT,
  QUOTATION_STATUS_VERIFICATION_PENDING,
  clearQuotationDraft,
  createQuotationPayload,
  downloadQuotationPdf,
  getQuotationDraft,
} from "../../utils/quotationUtils";
import { getCustomSizeSummary } from "../../utils/customSizeUtils";

function safeJsonParse(value, fallback) {
  if (value == null) return fallback;
  if (typeof value === "object") return value;
  const trimmed = String(value).trim();
  if (!trimmed) return fallback;
  try {
    return JSON.parse(trimmed);
  } catch {
    return fallback;
  }
}

function toKeyValueSummary(value) {
  const source = value && typeof value === "object" ? value : null;
  if (!source) return "";

  const parts = Object.entries(source)
    .filter(([, v]) => v !== "" && v != null)
    .map(([k, v]) => {
      if (Array.isArray(v)) return `${k}: ${v.filter(Boolean).join(", ")}`;
      if (typeof v === "object") return `${k}: ${JSON.stringify(v)}`;
      return `${k}: ${String(v)}`;
    });

  if (!parts.length) return "";
  const shown = parts.slice(0, 6).join(", ");
  return parts.length > 6 ? `${shown} +${parts.length - 6} more` : shown;
}


function getVariantSummary(variantFields) {
  const source = variantFields || {};
  const skipKeys = new Set([
    "customWidth",
    "customHeight",
    "customDepth",
    "customUnit",
    "customDimensions",
    ...Object.keys(source).filter((key) => key.startsWith("customSize_")),
  ]);
  const entries = Object.entries(source)
    .filter(([key, value]) =>
      !key.endsWith("Custom") && !key.endsWith("Text") &&
      !skipKeys.has(key) && value !== "" && value != null
    )
    .map(([key, value]) => {
      if (value === "Custom") {
        if (key === "size") {
          const summary = getCustomSizeSummary({ customDimensions: source.customDimensions }, source);
          if (summary) return [key, summary];
        }
        if (source[`${key}Custom`]) return [key, source[`${key}Custom`]];
      }
      return [key, value];
    });
  if (!entries.length) return "";
  const shown = entries.slice(0, 3).map(([, v]) => v).join(", ");
  return entries.length > 3 ? `${shown} +${entries.length - 3} more` : shown;
}

function designLabel(status) {
  if (status === "design_only")
    return { label: "Design only", color: "#7c3aed", bg: "#f5f3ff" };
  if (status === "production_only")
    return { label: "Production only", color: "#b45309", bg: "#fffbeb" };
  if (status === "design_production")
    return { label: "Design + prod", color: "#065f46", bg: "#ecfdf5" };
  return null;
}

function getDesignOnlyPrice(priceMatch) {
  if (!priceMatch?.quantitySlabs?.length) return null;
  return Number(priceMatch.quantitySlabs[0].pricePerPiece);
}

function fullSpecsSummary(specs) {
  const raw = typeof specs === "string"
    ? (() => { try { return JSON.parse(specs); } catch { return {}; } })()
    : (specs || {});
  const SKIP = new Set([
    "customWidth",
    "customHeight",
    "customDepth",
    "customUnit",
    "customDimensions",
    ...Object.keys(raw).filter((key) => key.startsWith("customSize_")),
  ]);
  const entries = Object.entries(raw)
    .filter(([key, v]) =>
      !key.endsWith("Custom") && !key.endsWith("Text") &&
      !SKIP.has(key) && v !== "" && v != null
    )
    .map(([key, v]) => {
      if (v === "Custom") {
        if (key === "size") {
          const summary = getCustomSizeSummary({ customDimensions: raw.customDimensions }, raw);
          if (summary) return summary;
        }
        if (raw[`${key}Custom`]) return raw[`${key}Custom`];
      }
      return String(v);
    })
    .filter(Boolean);
  return entries.join(" · ");
}

function getEditVal(editingPrices, itemId, field, item) {
  if (editingPrices[itemId]?.[field] !== undefined) {
    return editingPrices[itemId][field];
  }
  if (field === "unitPrice") {
    const v = Number(item.pricePerUnit || item.unitPrice || 0);
    return v > 0 ? String(v) : "";
  }
  if (field === "lineTotal") {
    const v = Number(item.lineTotal || 0);
    return v > 0 ? String(v) : "";
  }
  if (field === "quantity")  return String(item.quantity || 1);
  return "";
}

function normalizeLineItem(item) {
  const designStatus = String(item?.designStatus || "").toLowerCase();
  const isDesignOnly = designStatus === "design_only";
  const quantity = isDesignOnly ? 0 : Number(item?.quantity || 0);
  const unitPrice = isDesignOnly ? 0 : Number(item?.pricePerUnit || item?.unitPrice || 0);
  const lineTotal = isDesignOnly ? 0 : quantity * unitPrice;

  return {
    ...item,
    quantity,
    unitPrice,
    pricePerUnit: unitPrice,
    designCost: 0,
    lineTotal,
    pricingStatus: lineTotal > 0 ? "PRICED" : "UNPRICED",
  };
}

function applyEdit(itemId, field, rawValue, setLineItems, setEditingPrices) {
  const num = parseFloat(rawValue);
  const safe = Number.isFinite(num) && num >= 0 ? num : 0;
  setLineItems(prev => prev.map(item => {
    if (item.id !== itemId) return item;
    const isDesignOnly = item.designStatus === "design_only";
    if (isDesignOnly) return normalizeLineItem(item);
    if (!isDesignOnly && field === "unitPrice") {
      const qty = Number(item.quantity) || 1;
      return { ...item, unitPrice: safe, pricePerUnit: safe,
        lineTotal: qty * safe,
        pricingStatus: safe > 0 ? "PRICED" : "UNPRICED" };
    }
    if (!isDesignOnly && field === "quantity") {
      const price = Number(item.pricePerUnit || item.unitPrice || 0);
      return { ...item, quantity: safe, lineTotal: safe * price };
    }
    return item;
  }));
}

function mergePendingPriceEdits(lineItems, editingPrices) {
  const toSafeNumber = (value) => {
    const parsed = parseFloat(value);
    return Number.isFinite(parsed) && parsed >= 0 ? parsed : 0;
  };

  return lineItems.map((item) => {
    const pending = editingPrices[item.id];
    if (!pending) return normalizeLineItem(item);

    const isDesignOnly = item.designStatus === "design_only";
    const quantity = pending.quantity !== undefined
      ? toSafeNumber(pending.quantity)
      : Number(item.quantity || 0);
    const unitPrice = pending.unitPrice !== undefined
      ? toSafeNumber(pending.unitPrice)
      : Number(item.pricePerUnit || item.unitPrice || 0);
    if (isDesignOnly) return normalizeLineItem(item);

    return normalizeLineItem({
      ...item,
      quantity,
      unitPrice,
      pricePerUnit: unitPrice,
    });
  });
}

function createEmptyDraft() {
  return {
    id: null,
    quotationNumber: "",
    status: QUOTATION_STATUS_DRAFT,
    verificationRequestedAt: null,
    verificationRequestedById: null,
    verificationRequestedByName: null,
    verificationRequestedByRole: null,
    verificationRequestNotes: "",
    approvedAt: null,
    approvedById: null,
    approvedByName: null,
    approvedByRole: null,
    approvalNotes: "",
    createdById: null,
    createdByName: null,
    createdByEmail: null,
    createdByRole: null,
    createdByTeam: null,
    partyMode: "lead",
    selectedLead: null,
    leadSearch: "",
    lineItems: [],
    discountPct: 0,
    includeDesignFee: false,
    designFeeAmount: 0,
    gstRows: [],
  };
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

function formatLeadState(value) {
  const raw = String(value || "").trim();
  if (!raw) return "";

  const normalized = raw.toLowerCase().replace(/[^a-z]/g, "");
  if (normalized === "tn" || normalized === "tamilnadu" || normalized.startsWith("tamilna")) {
    return "Tamil Nadu";
  }

  return raw
    .toLowerCase()
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function createEmptyGstRow() {
  return {
    id: `gst-row-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    gstMasterId: "",
    taxName: "",
    taxPercent: 0,
  };
}

export default function QuotationPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const userRole = String(user?.role || "").toUpperCase();
  const isEmployee = userRole === "EMPLOYEE";

  const [partyMode, setPartyMode] = useState("lead");
  const [activeTab, setActiveTab] = useState("lead");
  const [allLeads, setAllLeads] = useState([]);
  const [leadsLoading, setLeadsLoading] = useState(false);
  const [leadSearch, setLeadSearch] = useState("");
  const [leadSuggestions, setLeadSuggestions] = useState([]);
  const [selectedLead, setSelectedLead] = useState(null);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [quotationId, setQuotationId] = useState(null);
  const [quotationNumber, setQuotationNumber] = useState("");
  const [quotationCreatedAt, setQuotationCreatedAt] = useState("");
  const [quotationStatus, setQuotationStatus] = useState(QUOTATION_STATUS_DRAFT);
  const [verificationRequestedAt, setVerificationRequestedAt] = useState(null);
  const [verificationRequestedById, setVerificationRequestedById] = useState(null);
  const [verificationRequestedByName, setVerificationRequestedByName] = useState(null);
  const [verificationRequestedByRole, setVerificationRequestedByRole] = useState(null);
  const [verificationRequestNotes, setVerificationRequestNotes] = useState("");
  const [approvedAt, setApprovedAt] = useState(null);
  const [approvedById, setApprovedById] = useState(null);
  const [approvedByName, setApprovedByName] = useState(null);
  const [approvedByRole, setApprovedByRole] = useState(null);
  const [approvalNotes, setApprovalNotes] = useState("");
  const [approveDialogOpen, setApproveDialogOpen] = useState(false);
  const [approveDialogNotes, setApproveDialogNotes] = useState("");
  const [createdById, setCreatedById] = useState(null);
  const [createdByName, setCreatedByName] = useState(null);
  const [createdByEmail, setCreatedByEmail] = useState(null);
  const [createdByRole, setCreatedByRole] = useState(null);
  const [createdByTeam, setCreatedByTeam] = useState(null);
  const [requirements, setRequirements] = useState([]);
  const [requirementsLoading, setRequirementsLoading] = useState(false);
  const [requirementsError, setRequirementsError] = useState("");
  const [priceList, setPriceList] = useState([]);
  const [priceListLoading, setPriceListLoading] = useState(false);
  const [gstMasters, setGstMasters] = useState([]);
  const [gstMastersLoading, setGstMastersLoading] = useState(false);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [configError, setConfigError] = useState("");
  const [lineItems, setLineItems] = useState([]);
  const [editingPrices, setEditingPrices] = useState({});
  const [discountPct, setDiscountPct] = useState("0");
  const [includeDesignFee, setIncludeDesignFee] = useState(false);
  const [designFeeAmount, setDesignFeeAmount] = useState("");
  const [gstRows, setGstRows] = useState([]);
  const [gstAddPopupOpen, setGstAddPopupOpen] = useState(false);
  const [gstAddPercent, setGstAddPercent] = useState("");
  const [gstAddSaving, setGstAddSaving] = useState(false);
  const [gstAddError, setGstAddError] = useState("");
  const [saveMessage, setSaveMessage] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [quotationTemplate, setQuotationTemplate] = useState(null);

  const suggestionRef = useRef(null);
  const skipAutoGenerateRef = useRef(false);

  const customerName = selectedLead?.name || "";
  const leadStateValue = selectedLead?.leadState || selectedLead?.state || "";
  const leadStateDisplay = useMemo(() => formatLeadState(leadStateValue), [leadStateValue]);
  const quotationDate = new Date().toISOString().slice(0, 10);

  const subtotal = useMemo(() => {
    const itemsTotal = lineItems.reduce((sum, item) => sum + Number(item.lineTotal || 0), 0);
    const globalDesignFee = includeDesignFee ? Number(designFeeAmount || 0) : 0;
    return itemsTotal + globalDesignFee;
  }, [lineItems, includeDesignFee, designFeeAmount]);
  const isTamilNadu = useMemo(
    () => isTamilNaduState(leadStateValue),
    [leadStateValue],
  );
  const resolvedGstPct = useMemo(
    () => gstRows.reduce((sum, row) => sum + Number(row?.taxPercent || 0), 0),
    [gstRows],
  );
  const { cgstPct, sgstPct, igstPct } = useMemo(() => {
    if (isTamilNadu) {
      const splitTax = resolvedGstPct / 2;
      return { cgstPct: splitTax, sgstPct: splitTax, igstPct: 0 };
    }
    return { cgstPct: 0, sgstPct: 0, igstPct: resolvedGstPct };
  }, [isTamilNadu, resolvedGstPct]);
  const discountAmt = useMemo(() => subtotal * (Number(discountPct || 0) / 100), [subtotal, discountPct]);
  const afterDiscount = useMemo(() => subtotal - discountAmt, [subtotal, discountAmt]);
  const cgstAmt = useMemo(() => afterDiscount * (cgstPct / 100), [afterDiscount, cgstPct]);
  const sgstAmt = useMemo(() => afterDiscount * (sgstPct / 100), [afterDiscount, sgstPct]);
  const igstAmt = useMemo(() => afterDiscount * (igstPct / 100), [afterDiscount, igstPct]);
  const grandTotal = useMemo(
    () => afterDiscount + cgstAmt + sgstAmt + igstAmt,
    [afterDiscount, cgstAmt, sgstAmt, igstAmt],
  );

  const totals = {
    subtotal,
    discountAmt,
    afterDiscount,
    cgstAmt,
    sgstAmt,
    igstAmt,
    grandTotal,
  };

  const lineItemCellBase = {
    padding: "12px 8px",
    borderBottom: "1px solid #f3f4f6",
    borderRight: "1px solid #f0f1f3",
    verticalAlign: "middle",
  };

  useEffect(() => {
    getQuotationTemplate()
      .then((data) => setQuotationTemplate(data))
      .catch(() => setQuotationTemplate({}));
  }, []);

  useEffect(() => {
    setLeadsLoading(true);
    getLeads()
      .then((data) => setAllLeads(Array.isArray(data) ? data : []))
      .catch(() => setAllLeads([]))
      .finally(() => setLeadsLoading(false));
  }, []);

  useEffect(() => {
    const draft = getQuotationDraft();
    if (!draft) {
      return;
    }

    const initial = { ...createEmptyDraft(), ...draft };
    setQuotationId(initial.id);
    setQuotationNumber(initial.quotationNumber || "");
    setQuotationCreatedAt(initial.createdAt || "");
    setQuotationStatus(initial.status || QUOTATION_STATUS_DRAFT);
    setVerificationRequestedAt(initial.verificationRequestedAt || null);
    setVerificationRequestedById(initial.verificationRequestedById || null);
    setVerificationRequestedByName(initial.verificationRequestedByName || null);
    setVerificationRequestedByRole(initial.verificationRequestedByRole || null);
    setVerificationRequestNotes(initial.verificationRequestNotes || "");
    setApprovedAt(initial.approvedAt || null);
    setApprovedById(initial.approvedById || null);
    setApprovedByName(initial.approvedByName || null);
    setApprovedByRole(initial.approvedByRole || null);
    setApprovalNotes(initial.approvalNotes || "");
    setCreatedById(initial.createdById || null);
    setCreatedByName(initial.createdByName || null);
    setCreatedByEmail(initial.createdByEmail || null);
    setCreatedByRole(initial.createdByRole || null);
    setCreatedByTeam(initial.createdByTeam || null);
    setPartyMode(initial.partyMode || "lead");
    setSelectedLead(initial.selectedLead || null);
    setLeadSearch(
      initial.leadSearch ||
        (initial.selectedLead
          ? `${initial.selectedLead.leadId} - ${initial.selectedLead.name}`
          : "")
    );
    setLineItems(Array.isArray(initial.lineItems) ? initial.lineItems.map(normalizeLineItem) : []);
    setDiscountPct(String(initial.discountPct ?? "0"));
    setIncludeDesignFee(initial.includeDesignFee || false);
    setDesignFeeAmount(String(initial.designFeeAmount || ""));
    setGstRows(
      Array.isArray(initial.gstRows) && initial.gstRows.length
        ? initial.gstRows.map((row, index) => ({
            id: row.id || `gst-row-restored-${index}`,
            gstMasterId: row.gstMasterId || "",
            taxName: row.taxName || "",
            taxPercent: Number(row.taxPercent || 0),
          }))
        : []
    );
    if (Array.isArray(initial.lineItems) && initial.lineItems.length > 0) {
      skipAutoGenerateRef.current = true;
    }
    clearQuotationDraft();
  }, []);

  useEffect(() => {
    const prefill = location.state?.prefillLead;
    if (!prefill) return;
    setPartyMode("lead");
    setActiveTab("lead");
    setSelectedLead(prefill);
    setLeadSearch(`${prefill.leadId} - ${prefill.name}`);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    setPriceListLoading(true);
    getPriceList()
      .then((data) => setPriceList(Array.isArray(data) ? data : []))
      .catch(() => setPriceList([]))
      .finally(() => setPriceListLoading(false));
  }, []);

  useEffect(() => {
    setGstMastersLoading(true);
    getActiveGstMasters()
      .then((data) => setGstMasters(Array.isArray(data) ? data : []))
      .catch(() => setGstMasters([]))
      .finally(() => setGstMastersLoading(false));
  }, []);

  useEffect(() => {
    if (!leadSearch.trim()) {
      setLeadSuggestions([]);
      return;
    }

    const query = leadSearch.toLowerCase();
    const filtered = allLeads.filter((lead) =>
      [lead.leadId, lead.name].some((value) => String(value || "").toLowerCase().includes(query)),
    );

    setLeadSuggestions(filtered.slice(0, 8));
  }, [leadSearch, allLeads]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (suggestionRef.current && !suggestionRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (skipAutoGenerateRef.current) {
      skipAutoGenerateRef.current = false;
      return;
    }

    const numericId = selectedLead?.id;
    if (!numericId || partyMode !== "lead") {
      setRequirements([]);
      setLineItems([]);
      return;
    }

    // Wait for price list to be ready before building line items
    if (priceListLoading) return;

    setRequirementsLoading(true);
    setRequirementsError("");

    getRequirementsByLeadId(numericId)
      .then((data) => {
        const reqs = Array.isArray(data) ? data : [];
        setRequirements(reqs);

        if (!reqs.length) {
          setLineItems([]);
          return;
        }

        // Auto-build line items from requirements
        const autoItems = reqs.map((req, i) => {
          // Match price list: same typeId + subtypeId
          const match = priceList.find((p) =>
            Number(p.typeId) === Number(req.typeId) &&
            (p.subtypeId == null
              ? req.subtypeId == null
              : Number(p.subtypeId) === Number(req.subtypeId))
          ) || null;

          // Find slab price for the requirement quantity
          const qty = Number(req.quantity) || 1;
          const slab = match?.quantitySlabs?.find((s) =>
            qty >= Number(s.minQty) && qty <= Number(s.maxQty)
          ) || null;

          const unitPrice = slab ? Number(slab.pricePerPiece) : 0;
          const pricingStatus = slab ? "PRICED" : "UNPRICED";
          const variantSummary = match ? getVariantSummary(match.variantFields) : "";
          const productName = [req.typeName, req.subtypeName]
            .filter(Boolean).join(" - ") || "Unknown Product";

          if (req.designStatus === "design_only") {
            return {
              id: `req-auto-${req.id}-${i}`,
              productId: match?.id ?? null,
              typeId: req.typeId,
              subtypeId: req.subtypeId ?? null,
              typeName: req.typeName,
              subtypeName: req.subtypeName ?? null,
              productName,
              quantity: 0,
              unitPrice: 0,
              pricePerUnit: 0,
              designCost: 0,
              lineTotal: 0,
              pricingStatus,
              specs: safeJsonParse(req.specs, {}),
              variantFields: match?.variantFields ?? {},
              variantSummary,
              sourceRequirementId: req.id,
              designStatus: req.designStatus || null,
              priceEntryId: match?.id ?? null,
            };
          }

          return {
            id: `req-auto-${req.id}-${i}`,
            productId: match?.id ?? null,
            typeId: req.typeId,
            subtypeId: req.subtypeId ?? null,
            typeName: req.typeName,
            subtypeName: req.subtypeName ?? null,
            productName,
            quantity: qty,
            unitPrice,
            pricePerUnit: unitPrice,
            designCost: 0,
            lineTotal: qty * unitPrice,
            pricingStatus,
            specs: safeJsonParse(req.specs, {}),
            variantFields: match?.variantFields ?? {},
            optionsSummary: variantSummary,
            priceListEntryId: match?.id ?? null,
            requirementId: req.id,
            designStatus: req.designStatus || null,
          };
        });

        setLineItems(autoItems.map(normalizeLineItem));
        setEditingPrices({});
      })
      .catch(() => {
        setRequirements([]);
        setRequirementsError("Failed to load requirements for this lead.");
      })
      .finally(() => setRequirementsLoading(false));
  }, [selectedLead?.id, partyMode, priceListLoading]);

  const handleLeadSelect = (lead) => {
    setSelectedLead(lead);
    setLeadSearch(`${lead.leadId} - ${lead.name}`);
    setShowSuggestions(false);
    setSaveMessage("");
  };

  const handleLeadSearchChange = (event) => {
    setLeadSearch(event.target.value);
    setSelectedLead(null);
    setLineItems([]);
    setShowSuggestions(true);
    setSaveMessage("");
  };

  const handlePartyModeChange = (mode) => {
    setPartyMode(mode);
    setActiveTab(mode);
    setSelectedLead(null);
    setLeadSearch("");
    setLeadSuggestions([]);
    setShowSuggestions(false);
    setSaveMessage("");
    setRequirements([]);
    setRequirementsError("");
    setLineItems([]);
  };

  function buildPrefill(req) {
    return {
      typeId: req.typeId,
      subtypeId: req.subtypeId ?? null,
      typeName: req.typeName,
      subtypeName: req.subtypeName ?? null,
      quantity: req.quantity,
      specs: safeJsonParse(req.specs, {}),
      productId: null,
    };
  }

  function openAddModal(prefill) {
    setEditingItem(prefill ?? null);
    setConfigError("");
    setSaveMessage("");
    setAddModalOpen(true);
  }

  function closeAddModal() {
    setAddModalOpen(false);
    setEditingItem(null);
  }

  const handleRemoveItem = (itemId) => {
    setLineItems(previous => previous.filter(item => item.id !== itemId));
    setEditingPrices(prev => { const n = { ...prev }; delete n[itemId]; return n; });
    setSaveMessage("");
  };

  const handleOpenGstAddPopup = () => {
    setGstAddPercent("");
    setGstAddError("");
    setGstAddPopupOpen(true);
  };

  const handleSaveNewGst = async () => {
    const pct = Number(gstAddPercent);
    if (!gstAddPercent || isNaN(pct) || pct < 0) { setGstAddError("Enter a valid GST %."); return; }
    setGstAddSaving(true);
    setGstAddError("");
    try {
      await createGstMaster({ taxName: `GST ${pct}%`, taxPercent: pct, active: true });
      const updated = await getActiveGstMasters();
      setGstMasters(Array.isArray(updated) ? updated : []);
      setGstAddPopupOpen(false);
    } catch {
      setGstAddError("Failed to save. Please try again.");
    } finally {
      setGstAddSaving(false);
    }
  };

  const handleGstRowChange = (rowId, gstMasterId) => {
    const selectedMaster = gstMasters.find((item) => String(item.id) === String(gstMasterId));
    if (!gstMasterId) { setGstRows([]); return; }
    setGstRows((previous) => {
      if (previous.length === 0) {
        return [{
          id: `gst-row-${Date.now()}`,
          gstMasterId: selectedMaster?.id ?? "",
          taxName: selectedMaster?.taxName ?? "",
          taxPercent: Number(selectedMaster?.taxPercent ?? 0),
        }];
      }
      return previous.map((row) =>
        row.id !== rowId
          ? row
          : {
              ...row,
              gstMasterId: selectedMaster?.id ?? "",
              taxName: selectedMaster?.taxName ?? "",
              taxPercent: Number(selectedMaster?.taxPercent ?? 0),
            }
      );
    });
  };

  const buildCurrentQuotation = () =>
    createQuotationPayload({
      id: quotationId,
      quotationNumber,
      quotationDate,
      customerName,
      partyMode,
      selectedLead,
      lineItems: mergePendingPriceEdits(lineItems, editingPrices),
      discountPct: Number(discountPct),
      includeDesignFee,
      designFeeAmount: includeDesignFee ? Number(designFeeAmount || 0) : 0,
      gstRows: gstRows.map((row) => ({
        gstMasterId: row.gstMasterId ? Number(row.gstMasterId) : null,
        taxName: row.taxName || "",
        taxPercent: Number(row.taxPercent || 0),
      })),
      gstPct: resolvedGstPct,
      cgstPct,
      sgstPct,
      igstPct,
      totals,
      status: quotationStatus,
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
      createdBy: user?.name || user?.email || null,
      createdById: createdById || user?.id || null,
      createdByName:
        createdByName ||
        `${user?.firstName || ""} ${user?.lastName || ""}`.trim() ||
        user?.username ||
        user?.email ||
        null,
      createdByEmail: createdByEmail || user?.email || null,
      createdByRole: createdByRole || userRole || null,
      createdByTeam: createdByTeam || user?.team || null,
      createdAt: quotationCreatedAt || undefined,
    });

  const handleSaveQuotation = async () => {
    if (!customerName.trim()) {
      setConfigError("Please select a lead first.");
      return;
    }

    if (!selectedLead?.id) {
      setConfigError("No lead selected. Cannot create quotation.");
      return;
    }

    if (!lineItems.length) {
      setConfigError("Please add at least one item before saving.");
      return;
    }

    console.log("Creating quotation with leadId:", selectedLead?.id);
    setIsSaving(true);
    try {
      const payload = buildCurrentQuotation();
      const savedQuotation = await saveQuotation(payload);

      setQuotationId(savedQuotation.id);
      setQuotationNumber(savedQuotation.quotationNumber || "");
      setQuotationCreatedAt(savedQuotation.createdAt || "");
      setQuotationStatus(savedQuotation.status || QUOTATION_STATUS_DRAFT);
      setVerificationRequestedAt(savedQuotation.verificationRequestedAt || null);
      setVerificationRequestedById(savedQuotation.verificationRequestedById || null);
      setVerificationRequestedByName(savedQuotation.verificationRequestedByName || null);
      setVerificationRequestedByRole(savedQuotation.verificationRequestedByRole || null);
      setVerificationRequestNotes(savedQuotation.verificationRequestNotes || "");
      setApprovedAt(savedQuotation.approvedAt || null);
      setApprovedById(savedQuotation.approvedById || null);
      setApprovedByName(savedQuotation.approvedByName || null);
      setApprovedByRole(savedQuotation.approvedByRole || null);
      setApprovalNotes(savedQuotation.approvalNotes || "");
      setCreatedById(savedQuotation.createdById || null);
      setCreatedByName(savedQuotation.createdByName || null);
      setCreatedByEmail(savedQuotation.createdByEmail || null);
      setCreatedByRole(savedQuotation.createdByRole || null);
      setCreatedByTeam(savedQuotation.createdByTeam || null);
      setSaveMessage("Quotation saved successfully.");
      setConfigError("");
      navigate("/quotation-list", { state: { successMessage: "Quotation saved successfully." } });
    } catch (error) {
      const message = error?.response?.data?.message || "Failed to save quotation.";
      setConfigError(message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDownloadPdf = async () => {
    if (!lineItems.length) {
      setConfigError("Please add at least one item before downloading.");
      return;
    }

    try {
      const payload = buildCurrentQuotation();
      await downloadQuotationPdf(payload, quotationTemplate || {});
      setQuotationNumber(payload.quotationNumber);
    } catch (error) {
      console.error("Failed to download quotation PDF", error);
      setConfigError("Failed to download quotation PDF.");
    }
  };

  const handleGoToList = () => {
    navigate("/quotation-list");
  };

  const canEditQuotation = !(isEmployee && quotationStatus !== QUOTATION_STATUS_DRAFT && quotationStatus !== "NEGOTIATING");
  const canApproveAsManager = ["MANAGER", "ADMIN", "SUPER_ADMIN"].includes(userRole);
  const canApproveAsTeamLead =
    userRole === "TEAM_LEAD" &&
    String(createdByRole || "").toUpperCase() === "EMPLOYEE" &&
    String(createdByTeam || "").trim().toLowerCase() === String(user?.team || "").trim().toLowerCase();
  const canApproveCurrentQuotation =
    quotationStatus === QUOTATION_STATUS_VERIFICATION_PENDING &&
    (canApproveAsManager || canApproveAsTeamLead);

  const handleApproveFromEdit = async (notesValue) => {
    if (!canApproveCurrentQuotation) {
      return;
    }

    if (!quotationId) {
      setConfigError("Save quotation before approving.");
      return;
    }

    try {
      const approvedQuotation = await approveQuotation(quotationId, String(notesValue || "").trim());
      setQuotationStatus(approvedQuotation.status || QUOTATION_STATUS_APPROVED);
      setApprovedAt(approvedQuotation.approvedAt || null);
      setApprovedById(approvedQuotation.approvedById || null);
      setApprovedByName(approvedQuotation.approvedByName || null);
      setApprovedByRole(approvedQuotation.approvedByRole || null);
      setApprovalNotes(approvedQuotation.approvalNotes || "");
      setSaveMessage("Quotation approved successfully.");
      setConfigError("");
      setApproveDialogOpen(false);
    } catch (error) {
      const message = error?.response?.data?.message || "Failed to approve quotation.";
      setConfigError(message);
    }
  };

  const openApproveDialog = () => {
    setApproveDialogNotes(approvalNotes || "");
    setApproveDialogOpen(true);
  };

  return (
    <div className="qp-page">

      {/* ── Header ── */}
      <div className="qp-header">
        <div style={{ display: "flex", gap: 8 }}>
          <button className="qp-btn-ghost" onClick={handleGoToList}>
            <i className="ti ti-layout-list" style={{ fontSize: 14 }} />
            Quotation List
          </button>
          <button className="qp-btn-ghost" onClick={() => navigate("/quotation-template")}>
            <i className="ti ti-settings" style={{ fontSize: 14 }} />
            Template
          </button>
        </div>

        <div className="qp-header-center">
          <div className="qp-title">Create Quotation</div>
          <div className="qp-subtitle">Build, save and download quotations</div>
        </div>

        <div className="qp-mode-toggle">
          <div className="qp-mode-item" onClick={() => handlePartyModeChange("lead")}>
            <div className={`qp-mode-circle${partyMode === "lead" ? " active" : ""}`}>
              <i className="ti ti-building-community" />
            </div>
            <div className="qp-mode-label">Lead</div>
          </div>
          <div className="qp-mode-item" onClick={() => handlePartyModeChange("customer")}>
            <div className={`qp-mode-circle${partyMode === "customer" ? " active" : ""}`}>
              <i className="ti ti-users" />
            </div>
            <div className="qp-mode-label">Customer</div>
          </div>
        </div>
      </div>

      {/* ── Status alert (non-draft) ── */}
      {quotationStatus !== QUOTATION_STATUS_DRAFT && (
        <div className="qp-status-alert info">
          <i className="ti ti-info-circle" style={{ fontSize: 16 }} />
          <span>
            Status: <strong>
              {quotationStatus === QUOTATION_STATUS_APPROVED ? "Approved" : "Verification Pending"}
            </strong>
            {verificationRequestNotes && (
              <span className="ms-2">· Employee notes: {verificationRequestNotes}</span>
            )}
            {approvalNotes && (
              <span className="ms-2">· Approval notes: {approvalNotes}</span>
            )}
          </span>
        </div>
      )}

      {/* ── Error / success ── */}
      {configError && (
        <div className="qp-status-alert danger">
          <i className="ti ti-alert-circle" style={{ fontSize: 16 }} />
          {configError}
        </div>
      )}
      {saveMessage && (
        <div className="qp-status-alert success">
          <i className="ti ti-circle-check" style={{ fontSize: 16 }} />
          {saveMessage}
        </div>
      )}

      <fieldset disabled={!canEditQuotation} style={{ border: "none", padding: 0, margin: 0 }}>

        {/* ── LEAD MODE ── */}
        {partyMode === "lead" && (
          <>
            {/* Lead details */}
            <div className="qp-card">
              <div className="qp-card-label">Lead details</div>
              <div className="qp-fields-grid">
                <div className="qp-field-group" ref={suggestionRef} style={{ position: "relative" }}>
                  <div className="qp-field-label">Enquiry ID / Name *</div>
                  <input
                    className="qp-field-input"
                    type="text"
                    placeholder={leadsLoading ? "Loading leads..." : "Type enquiry ID or name"}
                    value={leadSearch}
                    onChange={handleLeadSearchChange}
                    onFocus={() => leadSearch && setShowSuggestions(true)}
                    autoComplete="off"
                  />
                  {showSuggestions && leadSuggestions.length > 0 && (
                    <ul className="qp-suggestions">
                      {leadSuggestions.map((lead) => (
                        <li
                          key={lead.id || lead.leadId}
                          className="qp-suggestion-item"
                          onMouseDown={() => handleLeadSelect(lead)}
                        >
                          <span className="qp-suggestion-id">{lead.leadId}</span>
                          {lead.name}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
                <div className="qp-field-group">
                  <div className="qp-field-label">Name</div>
                  <div className="qp-field-readonly">{selectedLead?.name || "—"}</div>
                </div>
                <div className="qp-field-group">
                  <div className="qp-field-label">Email</div>
                  <div className="qp-field-readonly">{selectedLead?.email || "—"}</div>
                </div>
                <div className="qp-field-group">
                  <div className="qp-field-label">Phone</div>
                  <div className="qp-field-readonly">{selectedLead?.mobile || "—"}</div>
                </div>
                <div className="qp-field-group">
                  <div className="qp-field-label">State</div>
                  <div className="qp-field-readonly">{leadStateDisplay || "—"}</div>
                </div>
              </div>
              <div className="qp-meta-row">
                <div className="qp-meta-chip">
                  Date <span>{quotationDate}</span>
                </div>
                <div className="qp-meta-chip">
                  Quotation No. <span>{quotationNumber || "Generated on save"}</span>
                </div>
              </div>
            </div>

            {/* Requirements summary */}
            <div className="qp-card">
              <div className="qp-card-label">Requirements</div>
              {!selectedLead?.leadId ? (
                <div className="qp-empty">Select a lead to load its requirements.</div>
              ) : requirementsLoading ? (
                <div className="qp-empty">
                  <span className="spinner-border spinner-border-sm me-2" />
                  Loading requirements...
                </div>
              ) : requirementsError ? (
                <div className="qp-status-alert danger">{requirementsError}</div>
              ) : requirements.length === 0 ? (
                <div className="qp-empty">
                  No requirements found for this lead. Add items manually below.
                </div>
              ) : (
                <div className="qp-req-summary">
                  <div className="qp-req-icon">
                    <i className="ti ti-circle-check" />
                  </div>
                  <div>
                    <div className="qp-req-title">
                      {requirements.length} requirement{requirements.length !== 1 ? "s" : ""} loaded as line items
                    </div>
                    <div className="qp-req-sub">
                      {(() => {
                        const designOnly = lineItems.filter(i => i.designStatus === "design_only").length;
                        const unpriced = lineItems.filter(i =>
                          i.pricingStatus === "UNPRICED" && i.designStatus !== "design_only"
                        ).length;
                        const parts = [];
                        if (designOnly > 0) parts.push(`${designOnly} design-only item(s) — enter total price`);
                        if (unpriced > 0)   parts.push(`${unpriced} item(s) need manual unit price`);
                        if (parts.length === 0) return "All items priced from price list";
                        return parts.join(" · ");
                      })()}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </>
        )}

        {/* ── CUSTOMER MODE — placeholder ── */}
        {partyMode === "customer" && (
          <div className="qp-card">
            <div className="qp-coming-soon">
              <div className="qp-coming-soon-icon">
                <i className="ti ti-users" />
              </div>
              <div className="qp-coming-soon-title">Customer mode coming soon</div>
              <div className="qp-coming-soon-sub">
                Direct customer quotations will be available in a future update.
                Use Lead mode to create quotations from enquiries.
              </div>
            </div>
          </div>
        )}

        {/* ── Line Items ── */}
        <div className="qp-card">
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
            <div className="qp-card-label" style={{ marginBottom: 0 }}>Line items</div>
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <label style={{
                display: "flex", alignItems: "center", gap: 7,
                fontSize: 13, fontWeight: 500, color: "#374151",
                cursor: canEditQuotation ? "pointer" : "default",
              }}>
                <input
                  type="checkbox"
                  checked={includeDesignFee}
                  disabled={!canEditQuotation}
                  onChange={e => {
                    setIncludeDesignFee(e.target.checked);
                    if (!e.target.checked) setDesignFeeAmount("");
                  }}
                  style={{ width: 15, height: 15, accentColor: "#45597a", cursor: canEditQuotation ? "pointer" : "default" }}
                />
                Include Design Fee
              </label>

              <button
                type="button"
                className="qp-btn-ghost"
                onClick={() => openAddModal()}
                disabled={!canEditQuotation}
              >
                <i className="ti ti-plus" style={{ fontSize: 13 }} />
                Add item
              </button>
            </div>
          </div>

          {lineItems.length === 0 && !includeDesignFee ? (
            <div className="qp-empty">No items yet. Click "Add item" to start.</div>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table style={{
                width: "100%",
                borderCollapse: "collapse",
                tableLayout: "fixed",
                fontFamily: "'DM Sans', sans-serif",
              }}>
                <colgroup>
                  <col style={{ width: 36 }} />
                  <col />
                  <col style={{ width: 72 }} />
                  <col style={{ width: 100 }} />
                  <col style={{ width: 80 }} />
                  <col style={{ width: 110 }} />
                  <col style={{ width: 60 }} />
                </colgroup>

                <thead>
                  <tr style={{ borderBottom: "2px solid #e5e7eb" }}>
                    {[
                      { label: "#",          align: "center" },
                      { label: "Product",    align: "left"   },
                      { label: "Qty",        align: "right"  },
                      { label: "Unit price", align: "right"  },
                      { label: "Type",       align: "right"  },
                      { label: "Total",      align: "right"  },
                      { label: "",           align: "right"  },
                    ].map((col, i) => (
                      <th key={i} style={{
                        padding: "0 8px 10px",
                        fontSize: 10, fontWeight: 700,
                        letterSpacing: "0.7px",
                        textTransform: "uppercase",
                        color: "#9ca3af",
                        textAlign: col.align,
                        whiteSpace: "nowrap",
                        borderRight: "1px solid #e5e7eb",
                      }}>
                        {col.label}
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody>
                  {lineItems.map((item, index) => {
                    const isDesignOnly  = item.designStatus === "design_only";
                    const isUnpriced    = String(item.pricingStatus || "").toUpperCase() === "UNPRICED";
                    const noSlabWarning = !isDesignOnly && isUnpriced;
                    const specText      = fullSpecsSummary(item.specs);

                    const inBase = {
                      borderWidth: "1.5px",
                      borderStyle: "solid",
                      borderColor: "#e5e7eb",
                      borderRadius: 6,
                      padding: "5px 7px",
                      fontSize: 13,
                      fontFamily: "'DM Mono', monospace",
                      background: "#fafafa",
                      color: "#0f172a",
                      outline: "none",
                      width: "100%",
                      textAlign: "right",
                      display: "block",
                    };
                    const inWarn   = { ...inBase, borderColor: "#fca5a5", background: "#fff8f8" };

                    const rowBg = noSlabWarning
                      ? { background: "#fffcf5", borderLeft: "3px solid #f0ad4e" }
                      : {};

                    return (
                      <tr key={item.id} style={rowBg}>

                        {/* # */}
                        <td style={{ ...lineItemCellBase, textAlign: "center" }}>
                          <span style={{
                            fontSize: 12, fontWeight: 700,
                            color: "#d1d5db",
                            fontFamily: "'DM Mono', monospace",
                          }}>
                            {index + 1}
                          </span>
                        </td>

                        {/* Product + specs + badges */}
                        <td style={{ ...lineItemCellBase }}>
                          <div style={{ fontSize: 13, fontWeight: 600, color: "#0f172a" }}>
                            {item.productName}
                          </div>
                          {specText && (
                            <div style={{
                              fontSize: 11, color: "#6b7280",
                              marginTop: 3, lineHeight: 1.5,
                              fontFamily: "'DM Mono', monospace",
                              wordBreak: "break-word",
                            }}>
                              {specText}
                            </div>
                          )}
                          <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginTop: 5 }}>
                            {noSlabWarning && (
                              <span style={{ fontSize: 10, fontWeight: 600, color: "#b45309" }}>
                                No slab match — enter price manually
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Qty */}
                        <td style={{ ...lineItemCellBase, textAlign: "right" }}>
                          {isDesignOnly ? (
                            <span style={{ color: "#d1d5db" }}>—</span>
                          ) : (
                            <input
                              type="number" min="1"
                              style={inBase}
                              value={getEditVal(editingPrices, item.id, "quantity", item)}
                              onChange={e => {
                                setEditingPrices(prev => ({
                                  ...prev,
                                  [item.id]: { ...prev[item.id], quantity: e.target.value },
                                }));
                                applyEdit(item.id, "quantity", e.target.value, setLineItems, setEditingPrices);
                              }}
                              onFocus={e => e.target.select()}
                            />
                          )}
                        </td>

                        {/* Unit price */}
                        <td style={{ ...lineItemCellBase, textAlign: "right" }}>
                          {isDesignOnly ? (
                            <span style={{ color: "#d1d5db" }}>—</span>
                          ) : (
                            <input
                              type="number" min="0" step="0.01"
                              style={noSlabWarning && !getEditVal(editingPrices, item.id, "unitPrice", item)
                                ? inWarn : inBase}
                              value={getEditVal(editingPrices, item.id, "unitPrice", item)}
                              onChange={e => {
                                setEditingPrices(prev => ({
                                  ...prev,
                                  [item.id]: { ...prev[item.id], unitPrice: e.target.value },
                                }));
                                applyEdit(item.id, "unitPrice", e.target.value, setLineItems, setEditingPrices);
                              }}
                              onFocus={e => e.target.select()}
                              placeholder="₹"
                            />
                          )}
                        </td>

                        {/* Type badge */}
                        <td style={{ ...lineItemCellBase, textAlign: "right" }}>
                          {(() => {
                            const d = designLabel(item.designStatus);
                            if (!d) return <span style={{ color: "#d1d5db" }}>—</span>;
                            return (
                              <span style={{
                                fontSize: 10, fontWeight: 700,
                                background: d.bg, color: d.color,
                                border: `1px solid ${d.color}44`,
                                borderRadius: 4, padding: "2px 5px",
                                display: "inline-block", whiteSpace: "nowrap",
                              }}>
                                {d.label}
                              </span>
                            );
                          })()}
                        </td>

                        {/* Total */}
                        <td style={{ ...lineItemCellBase, textAlign: "right" }}>
                          <span style={{
                            fontSize: 13, fontWeight: 700,
                            fontFamily: "'DM Mono', monospace",
                            color: isUnpriced ? "#dc2626" : "#0f172a",
                          }}>
                            ₹{Number(item.lineTotal || 0).toFixed(2)}
                          </span>
                        </td>

                        {/* Actions */}
                        <td style={{ ...lineItemCellBase, textAlign: "right" }}>
                          <div style={{ display: "flex", gap: 4, justifyContent: "flex-end" }}>
                            <button
                              type="button"
                              className="qp-item-btn"
                              onClick={() => openAddModal(item)}
                              title="Edit"
                            >
                              <i className="ti ti-edit" style={{ fontSize: 13 }} />
                            </button>
                            <button
                              type="button"
                              className="qp-item-btn danger"
                              onClick={() => handleRemoveItem(item.id)}
                              title="Remove"
                            >
                              <i className="ti ti-trash" style={{ fontSize: 13 }} />
                            </button>
                          </div>
                        </td>

                      </tr>
                    );
                  })}
                  {includeDesignFee && (
                    <tr style={{ background: "#faf5ff" }}>
                      <td style={{ ...lineItemCellBase, textAlign: "center" }}>
                        <span style={{ fontSize: 12, color: "#d1d5db", fontFamily: "'DM Mono', monospace" }}>
                          —
                        </span>
                      </td>
                      <td style={{ ...lineItemCellBase }}>
                        <div style={{ fontSize: 13, fontWeight: 600, color: "#7c3aed" }}>
                          Design Fee
                        </div>
                        <div style={{ fontSize: 11, color: "#9ca3af", marginTop: 2 }}>
                          One-time design charge
                        </div>
                      </td>
                      <td style={{ ...lineItemCellBase }} />
                      <td style={{ ...lineItemCellBase }} />
                      <td style={{ ...lineItemCellBase, textAlign: "right" }}>
                        <span style={{
                          fontSize: 10, fontWeight: 700,
                          background: "#f5f3ff", color: "#7c3aed",
                          border: "1px solid #ddd6fe",
                          borderRadius: 4, padding: "2px 5px",
                        }}>
                          Design
                        </span>
                      </td>
                      <td style={{ ...lineItemCellBase, textAlign: "right" }}>
                        <input
                          type="number" min="0" step="0.01"
                          disabled={!canEditQuotation}
                          style={{
                            border: "1.5px solid #ddd6fe",
                            borderRadius: 6, padding: "5px 7px",
                            fontSize: 13, fontFamily: "'DM Mono', monospace",
                            background: "#faf5ff", color: "#7c3aed",
                            fontWeight: 600, outline: "none",
                            width: "100%", textAlign: "right",
                          }}
                          value={designFeeAmount}
                          onChange={e => setDesignFeeAmount(e.target.value)}
                          onFocus={e => e.target.select()}
                          placeholder="₹ fee"
                        />
                      </td>
                      <td style={{ ...lineItemCellBase, textAlign: "right" }}>
                        <span style={{
                          fontSize: 13, fontWeight: 700,
                          fontFamily: "'DM Mono', monospace",
                          color: "#7c3aed",
                        }}>
                          ₹{Number(designFeeAmount || 0).toFixed(2)}
                        </span>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>

                {/* ── Tax & Totals ── */}
        <div className="qp-card">
          <div className="qp-card-label">Tax &amp; discount</div>
          <div className="qp-tax-row">
            <div className="qp-field-group">
              <div className="qp-field-label">Discount (%)</div>
              <input
                type="number"
                className="qp-field-input"
                style={{ fontFamily: "'DM Mono', monospace", textAlign: "right" }}
                value={discountPct}
                onChange={(e) => setDiscountPct(e.target.value)}
              />
            </div>
            <div className="qp-field-group">
              <div className="qp-field-label">GST</div>
              <div className="qp-gst-row qp-gst-row-empty">
                <select
                  className="qp-field-input"
                  value={gstRows[0]?.gstMasterId || ""}
                  onChange={(e) => handleGstRowChange(gstRows[0]?.id || "single", e.target.value)}
                  disabled={gstMastersLoading}
                >
                  <option value="">No GST</option>
                  {gstMasters.map((option) => (
                    <option key={option.id} value={option.id}>
                      {option.taxPercent}%
                    </option>
                  ))}
                </select>
                <button type="button" className="qp-item-btn" onClick={handleOpenGstAddPopup} title="Add new GST">
                  <i className="ti ti-plus" style={{ fontSize: 13 }} />
                </button>
              </div>
            </div>
          </div>

          <div className="qp-totals-block">
            <div className="qp-total-line">
              <div className="qp-total-label">Subtotal</div>
              <div className="qp-total-value">₹{subtotal.toFixed(2)}</div>
            </div>
            {Number(discountPct) > 0 && (
              <div className="qp-total-line discount">
                <div className="qp-total-label">Discount ({discountPct}%)</div>
                <div className="qp-total-value">−₹{discountAmt.toFixed(2)}</div>
              </div>
            )}
            {isTamilNadu ? (
              <>
                <div className="qp-total-line">
                  <div className="qp-total-label">CGST ({cgstPct}%)</div>
                  <div className="qp-total-value">+₹{cgstAmt.toFixed(2)}</div>
                </div>
                <div className="qp-total-line">
                  <div className="qp-total-label">SGST ({sgstPct}%)</div>
                  <div className="qp-total-value">+₹{sgstAmt.toFixed(2)}</div>
                </div>
              </>
            ) : (
              <div className="qp-total-line">
                <div className="qp-total-label">IGST ({igstPct}%)</div>
                <div className="qp-total-value">+₹{igstAmt.toFixed(2)}</div>
              </div>
            )}
            <div className="qp-total-line grand">
              <div className="qp-total-label">Grand total</div>
              <div className="qp-total-value">₹{grandTotal.toFixed(2)}</div>
            </div>
          </div>
        </div>

        {/* ── Actions bar ── */}
        <div className="qp-actions-bar">
          <div>
            <div className="qp-actions-bar-left">Grand total</div>
            <div className="qp-actions-bar-amount">₹{grandTotal.toFixed(2)}</div>
          </div>
          <div className="qp-actions-bar-btns">
            <button
              type="button"
              className="qp-btn-outline-white"
              onClick={handleDownloadPdf}
            >
              <i className="ti ti-download" style={{ fontSize: 14 }} />
              Download PDF
            </button>
            {canApproveCurrentQuotation && (
              <button
                type="button"
                className="qp-btn-approve"
                onClick={openApproveDialog}
              >
                <i className="ti ti-circle-check" style={{ fontSize: 14 }} />
                Approve
              </button>
            )}
            <button
              type="button"
              className="qp-btn-save"
              onClick={handleSaveQuotation}
              disabled={!canEditQuotation || isSaving}
            >
              <i className="ti ti-device-floppy" style={{ fontSize: 14 }} />
              {isSaving ? "Saving..." : "Save Quotation"}
            </button>
          </div>
        </div>

      </fieldset>

      {/* ── Add GST popup ── */}
      {gstAddPopupOpen && (
        <div className="qp-modal-overlay" onClick={() => setGstAddPopupOpen(false)}>
          <div className="qp-gst-popup" onClick={(e) => e.stopPropagation()}>
            <div className="qp-modal-title">Add GST</div>
            <input
              className="qp-field-input"
              type="number"
              min="0"
              placeholder="Enter GST %"
              value={gstAddPercent}
              onChange={(e) => setGstAddPercent(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSaveNewGst()}
              autoFocus
            />
            {gstAddError && <div className="qp-field-error">{gstAddError}</div>}
            <div className="qp-gst-popup-actions">
              <button type="button" className="qp-btn-ghost" onClick={() => setGstAddPopupOpen(false)} disabled={gstAddSaving}>
                Cancel
              </button>
              <button type="button" className="qp-btn-primary" onClick={handleSaveNewGst} disabled={gstAddSaving}>
                {gstAddSaving ? "Saving…" : "Add"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── AddItemModal — unchanged ── */}
      <AddItemModal
        open={addModalOpen}
        priceList={priceList}
        prefill={editingItem}
        leadId={selectedLead?.id}
        onRequirementSaved={() => {
          if (selectedLead?.id) {
            getRequirementsByLeadId(selectedLead.id).then(setRequirements);
          }
        }}
        onConfirm={(lineItem) => {
          const normalizedLineItem = normalizeLineItem(lineItem);
          if (editingItem?.id) {
            setLineItems((prev) => prev.map((i) => (i.id === editingItem.id ? normalizedLineItem : i)));
          } else {
            setLineItems((prev) => [...prev, normalizedLineItem]);
          }
          closeAddModal();
        }}
        onClose={closeAddModal}
      />

      {/* ── Approve dialog ── */}
      {approveDialogOpen && (
        <div className="qp-modal-overlay">
          <div className="qp-modal">
            <div className="qp-modal-title">Approve Quotation</div>
            <div className="qp-field-label" style={{ marginBottom: 6 }}>
              Approval notes (optional)
            </div>
            <textarea
              className="qp-field-input"
              rows={4}
              style={{ resize: "none" }}
              value={approveDialogNotes}
              onChange={(e) => setApproveDialogNotes(e.target.value)}
              placeholder="Add notes..."
            />
            <div className="qp-modal-actions">
              <button
                type="button"
                className="qp-btn-ghost"
                onClick={() => setApproveDialogOpen(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="qp-btn-primary"
                onClick={() => handleApproveFromEdit(approveDialogNotes)}
              >
                Approve
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}


