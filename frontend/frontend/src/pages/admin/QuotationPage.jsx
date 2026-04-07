import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { quotationCatalog } from "../../mock/quotationData";
import { useAuth } from "../../context/AuthContext";
import { getLeads } from "../../api/leadsApi";
import { approveQuotation, saveQuotation } from "../../api/quotationApi";
import "./QuotationPage.css";
import {
  QUOTATION_STATUS_APPROVED,
  QUOTATION_STATUS_DRAFT,
  QUOTATION_STATUS_VERIFICATION_PENDING,
  clearQuotationDraft,
  createQuotationPayload,
  downloadQuotationPdf,
  getQuotationDraft,
} from "../../utils/quotationUtils";

function findTier(tiers, qty) {
  return tiers.find((tier) => qty >= tier.min && qty <= tier.max) ?? null;
}

function computeLineTotal(product, selectedOptions, quantity, needsDesign) {
  const qty = Number(quantity);
  const tier = findTier(product.pricing.tiers, qty);
  if (!tier || qty <= 0) {
    return null;
  }

  const optionsExtraCostPerUnit = ["material", "size", "print", "finish"].reduce((sum, key) => {
    const chosen = product.options[key]?.find((option) => option.name === selectedOptions[key]);
    return sum + (chosen?.extra_cost ?? 0);
  }, 0);

  const pricePerUnit = tier.price_per_unit + optionsExtraCostPerUnit;
  const designCost = needsDesign ? (product.options.design?.cost ?? 0) : 0;
  const lineTotal = pricePerUnit * qty + designCost;

  return { pricePerUnit, optionsExtraCostPerUnit, designCost, lineTotal };
}

function buildOptionsSummary(product, selectedOptions, needsDesign) {
  const parts = ["material", "size", "print", "finish"]
    .map((key) => {
      const label = key.charAt(0).toUpperCase() + key.slice(1);
      return selectedOptions[key] ? `${label}: ${selectedOptions[key]}` : "";
    })
    .filter(Boolean);

  if (needsDesign) {
    parts.push("Design: Yes");
  }

  return parts.join(", ");
}

function getValidQuantityRanges(tiers) {
  return tiers.map((tier) => `${tier.min}-${tier.max}`).join(", ");
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
    cgstPct: 0,
    sgstPct: 0,
  };
}

export default function QuotationPage() {
  const navigate = useNavigate();
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
  const [selectedCategoryId, setSelectedCategoryId] = useState("");
  const [selectedProductId, setSelectedProductId] = useState("");
  const [selectedOptions, setSelectedOptions] = useState({});
  const [quantity, setQuantity] = useState("");
  const [needsDesign, setNeedsDesign] = useState(false);
  const [configError, setConfigError] = useState("");
  const [lineItems, setLineItems] = useState([]);
  const [discountPct, setDiscountPct] = useState("0");
  const [cgstPct, setCgstPct] = useState("0");
  const [sgstPct, setSgstPct] = useState("0");
  const [saveMessage, setSaveMessage] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [editingItemId, setEditingItemId] = useState(null);
  const suggestionRef = useRef(null);

  const customerName = selectedLead?.name || "";
  const quotationDate = new Date().toISOString().slice(0, 10);

  const subtotal = useMemo(
    () => lineItems.reduce((sum, item) => sum + Number(item.lineTotal || 0), 0),
    [lineItems],
  );
  const discountAmt = useMemo(() => subtotal * (Number(discountPct || 0) / 100), [subtotal, discountPct]);
  const afterDiscount = useMemo(() => subtotal - discountAmt, [subtotal, discountAmt]);
  const cgstAmt = useMemo(() => afterDiscount * (Number(cgstPct || 0) / 100), [afterDiscount, cgstPct]);
  const sgstAmt = useMemo(() => afterDiscount * (Number(sgstPct || 0) / 100), [afterDiscount, sgstPct]);
  const grandTotal = useMemo(() => afterDiscount + cgstAmt + sgstAmt, [afterDiscount, cgstAmt, sgstAmt]);

  const totals = {
    subtotal,
    discountAmt,
    afterDiscount,
    cgstAmt,
    sgstAmt,
    grandTotal,
  };

  const selectedCategory = quotationCatalog.categories.find((category) => category.id === selectedCategoryId);
  const selectedProduct = selectedCategory?.products.find((product) => product.id === selectedProductId);

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
    setLeadSearch(initial.leadSearch || "");
    setLineItems(Array.isArray(initial.lineItems) ? initial.lineItems : []);
    setDiscountPct(String(initial.discountPct ?? "0"));
    setCgstPct(String(initial.cgstPct ?? "0"));
    setSgstPct(String(initial.sgstPct ?? "0"));
    clearQuotationDraft();
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
    if (!selectedProduct) {
      return;
    }

    const defaults = {};
    ["material", "size", "print", "finish"].forEach((key) => {
      if (selectedProduct.options[key]?.length) {
        defaults[key] = selectedOptions[key] || selectedProduct.options[key][0].name;
      }
    });
    setSelectedOptions(defaults);
  }, [selectedProductId]);

  const handleLeadSelect = (lead) => {
    setSelectedLead(lead);
    setLeadSearch(`${lead.leadId} - ${lead.name}`);
    setShowSuggestions(false);
    setSaveMessage("");
  };

  const handleLeadSearchChange = (event) => {
    setLeadSearch(event.target.value);
    setSelectedLead(null);
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
  };

  const handleCategoryChange = (categoryId) => {
    setSelectedCategoryId(categoryId);
    setSelectedProductId("");
    setSelectedOptions({});
    setQuantity("");
    setNeedsDesign(false);
    setConfigError("");
  };

  const handleProductSelect = (productId) => {
    setSelectedProductId(productId);
    setSelectedOptions({});
    setQuantity("");
    setNeedsDesign(false);
    setConfigError("");
  };

  const handleOptionChange = (key, value) => {
    setSelectedOptions((previous) => ({ ...previous, [key]: value }));
  };

  const handleAddToQuotation = () => {
    setConfigError("");
    setSaveMessage("");

    if (!customerName.trim()) {
      setConfigError("Please select a lead first.");
      return;
    }

    if (!selectedProduct) {
      setConfigError("Please select a product.");
      return;
    }

    const qty = Number(quantity);
    if (!qty || qty <= 0) {
      setConfigError("Please enter a valid quantity.");
      return;
    }

    const tier = findTier(selectedProduct.pricing.tiers, qty);
    if (!tier) {
      setConfigError(`Invalid quantity. Valid ranges: ${getValidQuantityRanges(selectedProduct.pricing.tiers)}`);
      return;
    }

    const computed = computeLineTotal(selectedProduct, selectedOptions, qty, needsDesign);
    if (!computed) {
      setConfigError("Unable to compute price for this item.");
      return;
    }

    const newItem = {
      id: `item-${Date.now()}`,
      productName: selectedProduct.name,
      categoryName: selectedCategory?.name || "",
      optionsSummary: buildOptionsSummary(selectedProduct, selectedOptions, needsDesign),
      selectedOptions,
      quantity: qty,
      pricePerUnit: computed.pricePerUnit,
      optionsExtraCost: computed.optionsExtraCostPerUnit,
      designCost: computed.designCost,
      lineTotal: computed.lineTotal,
    };

    setLineItems((previous) => [...previous, newItem]);
    setQuantity("");
  };

  const handleEditItem = (item) => {
    setEditingItemId(item.id);
    
    // Find category and product from catalog
    const category = quotationCatalog.categories.find((cat) => cat.name === item.categoryName);
    if (category) {
      setSelectedCategoryId(category.id);
      const product = category.products.find((prod) => prod.name === item.productName);
      if (product) {
        setSelectedProductId(product.id);
      }
    }
    
    setSelectedOptions(item?.selectedOptions ?? {});
    setQuantity(item?.quantity != null ? String(item.quantity) : "");
    
    // Determine if design was selected
    const hasDesignCost = Number(item?.designCost ?? 0) > 0;
    setNeedsDesign(hasDesignCost);
    
    setConfigError("");
    setSaveMessage("");
  };

  const handleUpdateItem = () => {
    if (!editingItemId) {
      return;
    }

    setConfigError("");
    setSaveMessage("");

    if (!selectedProduct) {
      setConfigError("Please select a product.");
      return;
    }

    const qty = Number(quantity);
    if (!qty || qty <= 0) {
      setConfigError("Please enter a valid quantity.");
      return;
    }

    const tier = findTier(selectedProduct.pricing.tiers, qty);
    if (!tier) {
      setConfigError(`Invalid quantity. Valid ranges: ${getValidQuantityRanges(selectedProduct.pricing.tiers)}`);
      return;
    }

    const computed = computeLineTotal(selectedProduct, selectedOptions, qty, needsDesign);
    if (!computed) {
      setConfigError("Unable to compute price for this item.");
      return;
    }

    const updatedItem = {
      id: editingItemId,
      productName: selectedProduct.name,
      categoryName: selectedCategory?.name || "",
      optionsSummary: buildOptionsSummary(selectedProduct, selectedOptions, needsDesign),
      selectedOptions,
      quantity: qty,
      pricePerUnit: computed.pricePerUnit,
      optionsExtraCost: computed.optionsExtraCostPerUnit,
      designCost: computed.designCost,
      lineTotal: computed.lineTotal,
    };

    setLineItems((previous) => previous.map((item) => (item.id === editingItemId ? updatedItem : item)));
    setEditingItemId(null);
    handleCancelEdit();
  };

  const handleCancelEdit = () => {
    setEditingItemId(null);
    setSelectedCategoryId("");
    setSelectedProductId("");
    setSelectedOptions({});
    setQuantity("");
    setNeedsDesign(false);
    setConfigError("");
  };

  const handleRemoveItem = (itemId) => {
    setLineItems((previous) => previous.filter((item) => item.id !== itemId));
    setSaveMessage("");
  };

  const buildCurrentQuotation = () =>
    createQuotationPayload({
      id: quotationId,
      quotationNumber,
      quotationDate,
      customerName,
      partyMode,
      selectedLead,
      lineItems,
      discountPct: Number(discountPct),
      cgstPct: Number(cgstPct),
      sgstPct: Number(sgstPct),
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

    if (!lineItems.length) {
      setConfigError("Please add at least one item before saving.");
      return;
    }

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
    } catch (error) {
      const message = error?.response?.data?.message || "Failed to save quotation.";
      setConfigError(message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDownloadPdf = () => {
    if (!lineItems.length) {
      setConfigError("Please add at least one item before downloading.");
      return;
    }

    try {
      const payload = buildCurrentQuotation();
      downloadQuotationPdf(payload);
      setQuotationNumber(payload.quotationNumber);
    } catch (error) {
      console.error("Failed to download quotation PDF", error);
      setConfigError("Failed to download quotation PDF.");
    }
  };

  const handleGoToList = () => {
    navigate("/quotation-list");
  };

  const livePrice = selectedProduct
    ? computeLineTotal(selectedProduct, selectedOptions, quantity, needsDesign)
    : null;
  const canEditQuotation = !(isEmployee && quotationStatus !== QUOTATION_STATUS_DRAFT);
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
    <div className="content">
      <div className="page-breadcrumb d-none d-md-flex align-items-center mb-3">
        <Link to="/admin-dashboard" className="breadcrumb-item">
          <i className="ti ti-smart-home"></i>
        </Link>
        <span className="breadcrumb-item active">Create Quotation</span>
      </div>

      <div className="row g-2 align-items-center mb-3 text-center text-md-start">
        <div className="col-12 col-md-3">
          <h4 className="mb-1">Create Quotation</h4>
          <p className="text-muted mb-0">Build, save, and download quotations.</p>
        </div>
        <div className="col-12 col-md-6 d-flex justify-content-center">
          <div className="quotation-wizard">
            <div className="quotation-wizard-progress-bar">
              <motion.div
                className="quotation-wizard-progress"
                initial={{ width: "0%" }}
                animate={{ width: activeTab === "lead" ? "0%" : "100%" }}
                transition={{ duration: 0.35, ease: "easeOut" }}
              />
            </div>
            <motion.div className="quotation-wizard-circles" layoutId="circles-container">
              <div className="quotation-wizard-circle-item" onClick={() => handlePartyModeChange("lead")}>
                <motion.div className={`quotation-wizard-circle${activeTab === "lead" ? " active" : ""}`}>
                  <i className="ti ti-building-community" />
                </motion.div>
                <div className="quotation-wizard-circle-label">Lead</div>
              </div>
              <div className="quotation-wizard-circle-item" onClick={() => handlePartyModeChange("customer")}>
                <motion.div className={`quotation-wizard-circle${activeTab === "customer" ? " active" : ""}`}>
                  <i className="ti ti-users" />
                </motion.div>
                <div className="quotation-wizard-circle-label">Customer</div>
              </div>
            </motion.div>
          </div>
        </div>
        <div className="col-12 col-md-3 text-md-end">
          <button type="button" className="btn btn-outline-primary w-100 w-md-auto" onClick={handleGoToList}>
            <i className="ti ti-list-details me-1"></i>
            Quotation List
          </button>
        </div>
      </div>
      {quotationStatus !== QUOTATION_STATUS_DRAFT && (
        <div className="alert alert-info">
          Status: <strong>{quotationStatus === QUOTATION_STATUS_APPROVED ? "Approved" : "Verification Pending"}</strong>
          {verificationRequestNotes ? (
            <span className="ms-2">| Employee Notes: {verificationRequestNotes}</span>
          ) : null}
          {approvalNotes ? (
            <span className="ms-2">| Approval Notes: {approvalNotes}</span>
          ) : null}
        </div>
      )}

      <fieldset disabled={!canEditQuotation}>
      <div className="card mb-3">
        <div className="card-header">
          <h5 className="card-title mb-0">Customer Details</h5>
        </div>

        <div className="card-body">
          <div className="row g-3">
            {activeTab === "lead" ? (
              <div className="col-md-4" ref={suggestionRef} style={{ position: "relative" }}>
                <label className="form-label">Enquiry ID / Name *</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder={leadsLoading ? "Loading leads..." : "Type enquiry ID or name"}
                  value={leadSearch}
                  onChange={handleLeadSearchChange}
                  onFocus={() => leadSearch && setShowSuggestions(true)}
                  autoComplete="off"
                />
                {showSuggestions && leadSuggestions.length > 0 && (
                  <ul
                    className="list-group shadow"
                    style={{
                      position: "absolute",
                      top: "100%",
                      left: 0,
                      right: 0,
                      zIndex: 1050,
                      maxHeight: "220px",
                      overflowY: "auto",
                    }}
                  >
                    {leadSuggestions.map((lead) => (
                      <li
                        key={lead.id || lead.leadId}
                        className="list-group-item list-group-item-action"
                        style={{ cursor: "pointer" }}
                        onMouseDown={() => handleLeadSelect(lead)}
                      >
                        <span className="fw-semibold text-primary me-2">{lead.leadId}</span>
                        {lead.name}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ) : (
              <div className="col-md-4">
                <label className="form-label">Customer</label>
                <input type="text" className="form-control" placeholder="Customer mode will be connected later" disabled />
              </div>
            )}

            <div className="col-md-2">
              <label className="form-label small text-muted">Quotation Date</label>
              <div className="form-control bg-light">{quotationDate}</div>
            </div>
            <div className="col-md-3">
              <label className="form-label small text-muted">Quotation Number</label>
              <div className="form-control bg-light">{quotationNumber || "Will be generated on save/download"}</div>
            </div>

            <div className="col-md-3">
              <label className="form-label small text-muted">Customer Name</label>
              <div className="form-control bg-light">{customerName || "-"}</div>
            </div>
            <div className="col-md-3">
              <label className="form-label small text-muted">Email</label>
              <div className="form-control bg-light text-truncate">{selectedLead?.email || "-"}</div>
            </div>
            <div className="col-md-3">
              <label className="form-label small text-muted">Phone</label>
              <div className="form-control bg-light">{selectedLead?.mobile || "-"}</div>
            </div>
            <div className="col-md-3">
              <label className="form-label small text-muted">Address</label>
              <div className="form-control bg-light text-truncate">{selectedLead?.streetAddress || "-"}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="card mb-3">
        <div className="card-header d-flex justify-content-between align-items-center">
          <h5 className="card-title mb-0">{editingItemId ? "Edit Item" : "Add Item to Quotation"}</h5>
          {editingItemId && (
            <small className="text-muted">Editing selected item</small>
          )}
        </div>
        <div className="card-body">
          <div className="row g-3 align-items-end">
            <div className="col-md-2">
              <label className="form-label">Category *</label>
              <select className="form-select" value={selectedCategoryId} onChange={(event) => handleCategoryChange(event.target.value)}>
                <option value="">Select category</option>
                {quotationCatalog.categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-md-2">
              <label className="form-label">Product *</label>
              <select
                className="form-select"
                value={selectedProductId}
                onChange={(event) => handleProductSelect(event.target.value)}
                disabled={!selectedCategory}
              >
                <option value="">{selectedCategory ? "Select product" : "Select category first"}</option>
                {selectedCategory?.products.map((product) => (
                  <option key={product.id} value={product.id}>
                    {product.name}
                  </option>
                ))}
              </select>
            </div>

            {selectedProduct?.options.material && (
              <div className="col-md-2">
                <label className="form-label">Material</label>
                <select className="form-select" value={selectedOptions.material || ""} onChange={(event) => handleOptionChange("material", event.target.value)}>
                  {selectedProduct.options.material.map((option) => (
                    <option key={option.name} value={option.name}>
                      {option.name}
                    </option>
                  ))}
                </select>
              </div>
            )}
            {selectedProduct?.options.size && (
              <div className="col-md-2">
                <label className="form-label">Size</label>
                <select className="form-select" value={selectedOptions.size || ""} onChange={(event) => handleOptionChange("size", event.target.value)}>
                  {selectedProduct.options.size.map((option) => (
                    <option key={option.name} value={option.name}>
                      {option.name}
                    </option>
                  ))}
                </select>
              </div>
            )}
            {selectedProduct?.options.print && (
              <div className="col-md-2">
                <label className="form-label">Print</label>
                <select className="form-select" value={selectedOptions.print || ""} onChange={(event) => handleOptionChange("print", event.target.value)}>
                  {selectedProduct.options.print.map((option) => (
                    <option key={option.name} value={option.name}>
                      {option.name}
                    </option>
                  ))}
                </select>
              </div>
            )}
            {selectedProduct?.options.finish && (
              <div className="col-md-2">
                <label className="form-label">Finish</label>
                <select className="form-select" value={selectedOptions.finish || ""} onChange={(event) => handleOptionChange("finish", event.target.value)}>
                  {selectedProduct.options.finish.map((option) => (
                    <option key={option.name} value={option.name}>
                      {option.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="col-md-2">
              <label className="form-label">Quantity *</label>
              <input type="number" min="1" className="form-control" value={quantity} onChange={(event) => setQuantity(event.target.value)} />
            </div>
            <div className="col-md-2">
              <label className="form-label">Unit Price</label>
              <div className="form-control bg-light">{livePrice ? `Rs. ${livePrice.pricePerUnit.toFixed(2)}` : "-"}</div>
            </div>
            <div className="col-md-2">
              <label className="form-label">Total</label>
              <div className="form-control bg-light fw-semibold">{livePrice ? `Rs. ${livePrice.lineTotal.toFixed(2)}` : "-"}</div>
            </div>
            <div className="col-md-2">
              <button type="button" className="btn btn-info w-100" onClick={editingItemId ? handleUpdateItem : handleAddToQuotation}>
                <i className={editingItemId ? "ti ti-device-floppy me-1" : "ti ti-plus me-1"}></i>
                {editingItemId ? "Update Item" : "Add Item"}
              </button>
            </div>
            {editingItemId && (
              <div className="col-md-2">
                <button type="button" className="btn btn-outline-secondary w-100" onClick={handleCancelEdit}>
                  <i className="ti ti-x me-1"></i>
                  Cancel
                </button>
              </div>
            )}
          </div>

          {selectedProduct?.options.design?.available && (
            <div className="form-check mt-3">
              <input
                className="form-check-input"
                type="checkbox"
                id="needsDesign"
                checked={needsDesign}
                onChange={(event) => setNeedsDesign(event.target.checked)}
              />
              <label className="form-check-label" htmlFor="needsDesign">
                Need Design? (+Rs. {selectedProduct.options.design.cost.toFixed(2)})
              </label>
            </div>
          )}

          {configError && (
            <div className="alert alert-danger mt-3 mb-0">
              <i className="ti ti-alert-circle me-2"></i>
              {configError}
            </div>
          )}
          {saveMessage && (
            <div className="alert alert-success mt-3 mb-0">
              <i className="ti ti-check me-2"></i>
              {saveMessage}
            </div>
          )}
        </div>
      </div>

      <div className="card mb-3">
        <div className="card-header">
          <h5 className="card-title mb-0">Line Items</h5>
        </div>
        <div className="card-body">
          {lineItems.length ? (
            <div className="table-responsive">
              <table className="table table-bordered table-hover">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Product</th>
                    <th>Options</th>
                    <th>Qty</th>
                    <th>Unit Price</th>
                    <th>Design</th>
                    <th>Total</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {lineItems.map((item, index) => (
                    <tr key={item.id}>
                      <td>{index + 1}</td>
                      <td>{item.productName}</td>
                      <td className="small">{item.optionsSummary || "-"}</td>
                      <td>{item.quantity}</td>
                      <td>Rs. {Number(item.pricePerUnit).toFixed(2)}</td>
                      <td>{Number(item.designCost) ? `Rs. ${Number(item.designCost).toFixed(2)}` : "-"}</td>
                      <td>Rs. {Number(item.lineTotal).toFixed(2)}</td>
                      <td>
                        <div className="d-flex gap-2">
                          <button type="button" className="btn btn-primary btn-sm" onClick={() => handleEditItem(item)}>
                            <i className="ti ti-edit"></i>
                          </button>
                          <button type="button" className="btn btn-danger btn-sm" onClick={() => handleRemoveItem(item.id)}>
                            <i className="ti ti-trash"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-muted mb-0">No items added yet.</p>
          )}
        </div>
      </div>
      </fieldset>

      <div className="card">
        <div className="card-header">
          <h5 className="card-title mb-0">Summary & Actions</h5>
        </div>
        <div className="card-body">
          <div className="row g-3 mb-4">
            <div className="col-md-2">
              <label className="form-label">Discount (%)</label>
              <input type="number" className="form-control" value={discountPct} onChange={(event) => setDiscountPct(event.target.value)} />
            </div>
            <div className="col-md-2">
              <label className="form-label">CGST (%)</label>
              <input type="number" className="form-control" value={cgstPct} onChange={(event) => setCgstPct(event.target.value)} />
            </div>
            <div className="col-md-2">
              <label className="form-label">SGST (%)</label>
              <input type="number" className="form-control" value={sgstPct} onChange={(event) => setSgstPct(event.target.value)} />
            </div>
            <div className="col-md-6">
              <div className="border rounded p-3 bg-light h-100">
                <div className="d-flex justify-content-between mb-2">
                  <span>Subtotal</span>
                  <strong>Rs. {subtotal.toFixed(2)}</strong>
                </div>
                <div className="d-flex justify-content-between mb-2">
                  <span>Discount</span>
                  <strong>Rs. {discountAmt.toFixed(2)}</strong>
                </div>
                <div className="d-flex justify-content-between mb-2">
                  <span>CGST</span>
                  <strong>Rs. {cgstAmt.toFixed(2)}</strong>
                </div>
                <div className="d-flex justify-content-between mb-0">
                  <span>Grand Total</span>
                  <strong>Rs. {grandTotal.toFixed(2)}</strong>
                </div>
              </div>
            </div>
          </div>

          <div className="d-flex flex-wrap gap-2">
            <button type="button" className="btn btn-primary" onClick={handleSaveQuotation} disabled={!canEditQuotation || isSaving}>
              <i className="ti ti-device-floppy me-1"></i>
              {isSaving ? "Saving..." : "Save Quotation"}
            </button>
            <button type="button" className="btn btn-success" onClick={handleDownloadPdf}>
              <i className="ti ti-file-download me-1"></i>
              Download PDF
            </button>
            <button type="button" className="btn btn-outline-secondary" onClick={handleGoToList}>
              <i className="ti ti-layout-list me-1"></i>
              View Quotation List
            </button>
            {canApproveCurrentQuotation && (
              <button type="button" className="btn btn-info" onClick={openApproveDialog}>
                <i className="ti ti-circle-check me-1"></i>
                Approve
              </button>
            )}
          </div>
        </div>
      </div>
      {approveDialogOpen && (
        <>
          <div className="modal fade show d-block" tabIndex="-1" role="dialog" aria-modal="true">
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">Approve Quotation</h5>
                  <button type="button" className="btn-close" onClick={() => setApproveDialogOpen(false)}></button>
                </div>
                <div className="modal-body">
                  <label className="form-label">Approval Notes (optional)</label>
                  <textarea
                    className="form-control"
                    rows={4}
                    value={approveDialogNotes}
                    onChange={(event) => setApproveDialogNotes(event.target.value)}
                    placeholder="Add notes..."
                  />
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-outline-secondary" onClick={() => setApproveDialogOpen(false)}>
                    Cancel
                  </button>
                  <button type="button" className="btn btn-primary" onClick={() => handleApproveFromEdit(approveDialogNotes)}>
                    Approve
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div className="modal-backdrop fade show"></div>
        </>
      )}
    </div>
  );
}
