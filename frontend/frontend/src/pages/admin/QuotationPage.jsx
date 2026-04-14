import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { motion } from "motion/react";
import { useAuth } from "../../context/AuthContext";
import { getLeads } from "../../api/leadsApi";
import { getRequirementsByLeadId } from "../../api/requirementApi";
import { approveQuotation, saveQuotation } from "../../api/quotationApi";
import { getPriceList } from "../../api/priceListApi";
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
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [configError, setConfigError] = useState("");
  const [lineItems, setLineItems] = useState([]);
  const [discountPct, setDiscountPct] = useState("0");
  const [cgstPct, setCgstPct] = useState("0");
  const [sgstPct, setSgstPct] = useState("0");
  const [saveMessage, setSaveMessage] = useState("");
  const [isSaving, setIsSaving] = useState(false);

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
    const prefill = location.state?.prefillLead;
    if (!prefill) return;
    setPartyMode("lead");
    setActiveTab("lead");
    setSelectedLead(prefill);
    setLeadSearch(`${prefill.leadId} - ${prefill.name}`);
  }, []);

  useEffect(() => {
    setPriceListLoading(true);
    getPriceList()
      .then((data) => setPriceList(Array.isArray(data) ? data : []))
      .catch(() => setPriceList([]))
      .finally(() => setPriceListLoading(false));
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
    const numericId = selectedLead?.id;
    if (!numericId || partyMode !== "lead") {
      setRequirements([]);
      return;
    }

    setRequirementsLoading(true);
    setRequirementsError("");
    getRequirementsByLeadId(numericId)
      .then((data) => setRequirements(Array.isArray(data) ? data : []))
      .catch(() => {
        setRequirements([]);
        setRequirementsError("Failed to load requirements for this lead.");
      })
      .finally(() => setRequirementsLoading(false));
  }, [selectedLead?.id, partyMode]);

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
    setRequirements([]);
    setRequirementsError("");
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
          <h5 className="card-title mb-0">{activeTab === "lead" ? "Lead Details" : "Customer Details"}</h5>
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
              <label className="form-label small text-muted">{activeTab === "lead" ? "Lead Name" : "Customer Name"}</label>
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

      {configError && (
        <div className="alert alert-danger mt-3 mb-3">
          <i className="ti ti-alert-circle me-2"></i>
          {configError}
        </div>
      )}
      {saveMessage && (
        <div className="alert alert-success mt-3 mb-3">
          <i className="ti ti-check me-2"></i>
          {saveMessage}
        </div>
      )}

      {partyMode === "lead" && (
        <div className="card mb-3">
          <div className="card-header">
            <h5 className="card-title mb-0">Lead Requirements</h5>
          </div>
          <div className="card-body">
            {requirementsError && <div className="alert alert-danger mb-3">{requirementsError}</div>}
            {!selectedLead?.leadId ? (
              <p className="text-muted mb-0">Select a lead to load its requirements.</p>
            ) : requirementsLoading ? (
              <p className="text-muted mb-0">Loading requirements...</p>
            ) : requirements.length ? (
              <div className="table-responsive">
                <table className="table table-bordered table-hover align-middle">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Product</th>
                      <th>Qty</th>
                      <th>Specs</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {requirements.map((req, idx) => {
                      const specsObj = safeJsonParse(req.specs, {});
                      const specsSummary = toKeyValueSummary(specsObj) || "-";
                      const productName = [req.typeName, req.subtypeName].filter(Boolean).join(" - ") || "-";
                      return (
                        <tr key={req.id ?? idx}>
                          <td>{idx + 1}</td>
                          <td>{productName}</td>
                          <td>{req.quantity ?? "-"}</td>
                          <td className="small">{specsSummary}</td>
                          <td>
                            <button
                              type="button"
                              className="btn btn-link btn-sm p-0 text-muted"
                              onClick={() => openAddModal(buildPrefill(req))}
                            >
                              use as reference
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-muted mb-0">No requirements found for this lead.</p>
            )}
            {priceListLoading && <div className="text-muted small mt-2">Loading price list...</div>}
          </div>
        </div>
      )}

      {partyMode !== "lead" && (
        <div className="alert alert-warning mb-3">
          Requirement-based quotation works in <strong>Lead</strong> mode. Switch to Lead to add items from requirements.
        </div>
      )}

      <div className="card mb-3">
        <div className="card-header d-flex justify-content-between align-items-center">
          <h5 className="card-title mb-0">Line Items</h5>
          <button
            type="button"
            className="btn btn-primary btn-sm"
            onClick={() => openAddModal()}
            disabled={!canEditQuotation}
          >
            <i className="ti ti-plus me-1"></i>Add Item
          </button>
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
                      <td>
                        <div className="d-flex align-items-center gap-2 flex-wrap">
                          <span>{item.productName}</span>
                          {String(item.pricingStatus || "").toUpperCase() === "UNPRICED" && (
                            <span className="badge bg-danger">PRICE NOT FOUND</span>
                          )}
                        </div>
                      </td>
                      <td className="small" style={{ whiteSpace: "pre-wrap" }}>{item.optionsSummary || "-"}</td>
                      <td>{item.quantity}</td>
                      <td>Rs. {Number(item.pricePerUnit || 0).toFixed(2)}</td>
                      <td>{Number(item.designCost) ? `Rs. ${Number(item.designCost).toFixed(2)}` : "-"}</td>
                      <td>Rs. {Number(item.lineTotal || 0).toFixed(2)}</td>
                      <td>
                        <div className="d-flex gap-2">
                          <button type="button" className="btn btn-primary btn-sm" onClick={() => openAddModal(item)}>
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
      </fieldset>
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

      <AddItemModal
        open={addModalOpen}
        priceList={priceList}
        prefill={editingItem}
        onConfirm={(lineItem) => {
          if (editingItem?.id) {
            setLineItems((prev) => prev.map((i) => (i.id === editingItem.id ? lineItem : i)));
          } else {
            setLineItems((prev) => [...prev, lineItem]);
          }
          closeAddModal();
        }}
        onClose={closeAddModal}
      />
    </div>
  );
}

