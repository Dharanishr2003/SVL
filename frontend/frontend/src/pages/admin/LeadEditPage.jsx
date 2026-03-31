import { useCallback, useEffect, useState, useMemo } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import {
  getLeadById,
  updateLeadRowStatus,
  updateLeadDetails,
  getLeadLog,
  getAssignableAllocators,
  getAssignableLeadGroups,
  updateLeadAllocator,
  getLeadChatMessages,
  sendLeadChatAttachment,
  downloadLeadChatAttachment,
  downloadLeadRequirementFile,
  uploadLeadPaymentProof,
} from "../../api/leadsApi";
import { getAddressesbyLeadId, createAddress, getAddressesByLeadIdAndType, getAddressById } from "../../api/addressApi";
import { createStockRequest, getStockItems } from "../../api/stocksApi";
import { getLeadFlow } from "../../api/flowApi";
import { getLeadStatuses, DEFAULT_LEAD_STATUSES } from "../../api/leadStatusApi";
import { getLeadTypes } from "../../api/leadTypeApi";
import { getProductionRequirements, createProductionRequirement } from "../../api/productionRequirementApi";
import { getDesignRequirement } from "../../api/designRequirementApi";
import { COUNTRY_CODES } from "../../constants/countryCodes";
import { extractApiErrorMessage } from "../../utils/errorMessage";
import { COUNTRY_CODE_OPTIONS, defaultCountryOption, ensureCountryCodeValue, getCountryAllowedLengths, getCountryDisplayMaxLength, getCountryOptionByValue, sanitizePhoneDigits, validatePhoneNumber } from "../../utils/phoneUtils";
import { pickFlowAssignee, pickGroupAssignee } from "../../utils/flowAssignment";
import { validateStatusTransition } from "../../utils/statusValidation";
import { formatStatusLabel, uniqueStatusOptions, normalizeStatusLabelKey } from "../../utils/statusLabels";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../components/system/ToastProvider";
import StockRequestFormModal from "../../components/system/StockRequestFormModal";
import RequirementModal from "./RequirementModal";
import FilePreviewModal from "../../components/admin/FilePreviewModal";
import PaymentVerificationModal from "./PaymentVerificationModal";
import AddressFormModal from "./AddressFormModal";
import api from "../../utils/api";

const CUSTOMER_CHAT_DISABLED = true;

function formatDateTime(value) {
  if (!value) return "-";
  try {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return String(value);
    return date.toLocaleString();
  } catch {
    return String(value);
  }
}

function formatDateOnly(value) {
  if (!value) return "-";
  try {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return String(value);
    return date.toLocaleDateString();
  } catch {
    return String(value);
  }
}

function pickText(row, keys = []) {
  for (const key of keys) {
    const value = row?.[key];
    if (typeof value === "string" && value.trim()) {
      const trimmed = value.trim();
      if (/^select\s+allocat/i.test(trimmed)) {
        continue;
      }
      return trimmed;
    }
    if (typeof value === "number" && !Number.isNaN(value)) {
      return String(value);
    }
  }
  return "";
}

function parseProductionBrief(briefJson) {
  if (!briefJson) return null;
  try {
    if (typeof briefJson === "string") {
      return JSON.parse(briefJson);
    }
    return briefJson;
  } catch {
    return null;
  }
}

function toInputDateTime(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const pad = (num) => String(num).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(
    date.getDate(),
  )}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function normalizeCountryCode(value) {
  const raw = String(value || "").trim();
  if (!raw) return "";
  return raw.startsWith("+") ? raw : `+${raw}`;
}

const DEFAULT_CUSTOMER_LOGIN_PASSWORD = "Customer@123";

export default function LeadEditPage({ leadIdOverride } = {}) {
  const params = useParams();
  const id = leadIdOverride || params.id;
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const role = String(user?.role || "").toUpperCase();
  const { showSuccess, showError } = useToast();
  const [lead, setLead] = useState(null);
  const [leadStatuses, setLeadStatuses] = useState([]);
  const [leadTypeOptions, setLeadTypeOptions] = useState([]);
  const [leadTypeValue, setLeadTypeValue] = useState("");
  const [typeSaving, setTypeSaving] = useState(false);
  const [alternatePhone, setAlternatePhone] = useState("");
  const [alternateEmail, setAlternateEmail] = useState("");
  const [countryCode, setCountryCode] = useState("");
  const [followUpDate, setFollowUpDate] = useState("");
  const [occupation, setOccupation] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [statusValue, setStatusValue] = useState("");
  const [flowRules, setFlowRules] = useState([]);
  const [showAttemptedModal, setShowAttemptedModal] = useState(false);
  const [attemptedOpenReason, setAttemptedOpenReason] = useState("");
  const [attemptedCallStatus, setAttemptedCallStatus] = useState("");
  const [attemptedCallRemarks, setAttemptedCallRemarks] = useState("");
  const [attemptedFollowUpDate, setAttemptedFollowUpDate] = useState("");
  const [showInterestedModal, setShowInterestedModal] = useState(false);
  const [showRejectedModal, setShowRejectedModal] = useState(false);
  const [interestedFollowUpDate, setInterestedFollowUpDate] = useState("");
  const [interestedCallRemarks, setInterestedCallRemarks] = useState("");
  const [rejectedReason, setRejectedReason] = useState("");
  const [rejectedReasonSubtype, setRejectedReasonSubtype] = useState("");
  const [leadLogs, setLeadLogs] = useState([]);
  const [showAllocateModal, setShowAllocateModal] = useState(false);
  const [allocateOptions, setAllocateOptions] = useState([]);
  const [allocateOwnerId, setAllocateOwnerId] = useState("");
  const [allocateGroupId, setAllocateGroupId] = useState(null);
  const [allocateGroupName, setAllocateGroupName] = useState("");
  const [autoStatusHandled, setAutoStatusHandled] = useState(false);
  const [showDesignDurationModal, setShowDesignDurationModal] = useState(false);
  const [designMessages, setDesignMessages] = useState([]);
  const [showStockRequestModal, setShowStockRequestModal] = useState(false);
  const [stockRequestSubmitting, setStockRequestSubmitting] = useState(false);
  const [stockItems, setStockItems] = useState([]);
  const [designUploadFile, setDesignUploadFile] = useState(null);
  const [finalDesignMessage, setFinalDesignMessage] = useState(null);
  const [activeTab, setActiveTab] = useState("general");
  const [showRequirementModal, setShowRequirementModal] = useState(false);
  const [requirementSaving, setRequirementSaving] = useState(false);
  const [productionRequirements, setProductionRequirements] = useState([]);
  const [designRequirement, setDesignRequirement] = useState(null);
  const [loadingDesignRequirement, setLoadingDesignRequirement] = useState(false);
  const [loadingRequirements, setLoadingRequirements] = useState(false);
const [showRequirementDetailsModal, setShowRequirementDetailsModal] = useState(false);
  const [previewFile, setPreviewFile] = useState(null);
  const [selectedRequirement, setSelectedRequirement] = useState(null);

  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [verifyPaidAmount, setVerifyPaidAmount] = useState("");
  const [verifyNotes, setVerifyNotes] = useState("");
  const [verifyFile, setVerifyFile] = useState(null);
  const [verifyFileName, setVerifyFileName] = useState("");
  
  // Address-related state for payment verification
  const [billingAddresses, setBillingAddresses] = useState([]);
  const [shippingAddresses, setShippingAddresses] = useState([]);
  const [selectedBillingAddressId, setSelectedBillingAddressId] = useState(null);
  const [selectedShippingAddressId, setSelectedShippingAddressId] = useState(null);
  const [shipSame, setShipSame] = useState(false);
  const [showAddAddressModal, setShowAddAddressModal] = useState(false);
  const [addressLoading, setAddressLoading] = useState(false);
  const [newAddressType, setNewAddressType] = useState("BILLING");

  const DESIGN_THREAD_MARKER = "[[design-thread]]";
  function hasDesignThreadMarker(value) {
    return String(value || "").trimStart().startsWith(DESIGN_THREAD_MARKER);
  }
  function stripDesignThreadMarker(value) {
    const raw = String(value || "");
    if (!hasDesignThreadMarker(raw)) return raw;
    const startTrimmed = raw.trimStart();
    const withoutMarker = startTrimmed.slice(DESIGN_THREAD_MARKER.length);
    return withoutMarker.replace(/^\s+/, "");
  }

  function parseDesignMessageSummary(message) {
    const text = stripDesignThreadMarker(message || "").trim();
    const lower = text.toLowerCase();

    if (lower.startsWith("customer selected: accept")) {
      return { heading: "Design Accepted", type: "accept" };
    }

    if (lower.startsWith("customer selected: reject")) {
      const match = text.match(/\(([^)]+)\)\s*$/);
      return {
        heading: "Design Rejected",
        type: "reject",
        value: match?.[1]?.trim() || "",
      };
    }

    if (lower.startsWith("customer requested change:")) {
      return {
        heading: "Design Change",
        type: "change",
        value: text.slice("Customer requested change:".length).trim(),
      };
    }

    return null;
  }

  function isFinalDesignUploadMessage(row) {
    const text = stripDesignThreadMarker(row?.message || "").trim().toLowerCase();
    return text === "final design uploaded" && !!row?.attachmentName;
  }

  function getDesignDurationDays(startValue, endValue) {
    if (!startValue || !endValue) return "";
    const start = new Date(startValue);
    const end = new Date(endValue);
    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return "";
    const diffMs = end.getTime() - start.getTime();
    if (diffMs < 0) return "";
    return String(Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
  }
  const [totalAmount, setTotalAmount] = useState("");
  const [paidAmount, setPaidAmount] = useState("");
  const [remainingAmount, setRemainingAmount] = useState("");
  const [budgetInvoiceSent, setBudgetInvoiceSent] = useState(false);
  const [paymentInvoiceSent, setPaymentInvoiceSent] = useState(false);
  const [designStartAt, setDesignStartAt] = useState("");
  const [designEndAt, setDesignEndAt] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [statusSaving, setStatusSaving] = useState(false);
  const [detailsSaving, setDetailsSaving] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const loadLead = async () => {
      if (!id) return;
      setLoading(true);
      try {
        const [leadData, statusRows, typeRows, logRows] = await Promise.all([
          getLeadById(id),
          getLeadStatuses(),
          getLeadTypes(),
          getLeadLog(id),
        ]);
        if (!isMounted) return;
        setLead(leadData);
        setLeadLogs(Array.isArray(logRows) ? logRows : []);
        const normalizedStatuses = Array.isArray(statusRows)
          ? statusRows
              .map((item) => item?.leadStatus || item?.name || item?.status || "")
              .filter(Boolean)
              .filter((item) => !/site\s*visit/i.test(item))
          : [];
        setLeadStatuses(
          normalizedStatuses.length ? normalizedStatuses : DEFAULT_LEAD_STATUSES,
        );
        const normalizedTypes = Array.isArray(typeRows)
          ? typeRows
              .map((item) => item?.leadType || item?.name || item?.type || "")
              .filter(Boolean)
          : [];
        setLeadTypeOptions(normalizedTypes);
        setLeadTypeValue(
          pickText(leadData, ["leadType", "lead_type", "type", "leadTypeName"]) ||
            "",
        );
        setAlternatePhone(
          pickText(leadData, [
            "alternatePhone",
            "alternateMobile",
            "altPhone",
            "altMobile",
            "secondaryPhone",
          ]) || "",
        );
        setAlternateEmail(
          pickText(leadData, ["alternateEmail", "altEmail", "secondaryEmail"]) || "",
        );
        setCountryCode(
          normalizeCountryCode(
            pickText(leadData, ["countryCode", "country_code", "dialCode", "dial_code"]),
          ),
        );
        setFollowUpDate(
          leadData?.followUpDate ? toInputDateTime(leadData.followUpDate) : "",
        );
        setAttemptedFollowUpDate(
          leadData?.followUpDate ? toInputDateTime(leadData.followUpDate) : "",
        );
        setOccupation(
          pickText(leadData, ["occupation", "jobTitle", "job_title"]) || "",
        );
        setCompanyName(
          pickText(leadData, ["companyName", "company", "organization", "organisation"]) || "",
        );
        setAttemptedOpenReason(
          pickText(leadData, ["attemptedOpenReason", "attempted_open_reason"]) || "",
        );
        setAttemptedCallStatus(
          pickText(leadData, ["attemptedCallStatus", "attempted_call_status"]) || "",
        );
        setAttemptedCallRemarks(
          pickText(leadData, ["attemptedCallRemarks", "attempted_call_remarks"]) || "",
        );
        setInterestedFollowUpDate(
          leadData?.interestedFollowUpDate
            ? toInputDateTime(leadData.interestedFollowUpDate)
            : "",
        );
        setInterestedCallRemarks(
          pickText(leadData, ["interestedCallRemarks", "interested_call_remarks"]) || "",
        );
        setRejectedReason(
          pickText(leadData, ["rejectedReason", "rejected_reason"]) || "",
        );
        setRejectedReasonSubtype(
          pickText(leadData, ["rejectedReasonSubtype", "rejected_reason_subtype"]) || "",
        );
        setTotalAmount(
          pickText(leadData, ["totalAmount", "total_amount"]) || "",
        );
        const loadedTotal = pickText(leadData, ["totalAmount", "total_amount"]) || "";
        const loadedPaid = pickText(leadData, ["paidAmount", "paid_amount"]) || "0";
        const loadedRemaining = pickText(leadData, ["remainingAmount", "remaining_amount"]);

        setTotalAmount(loadedTotal);
        setPaidAmount(loadedPaid);
        setRemainingAmount(
          loadedRemaining || String(Math.max(0, Number(loadedTotal || 0) - Number(loadedPaid || 0))),
        );
        setBudgetInvoiceSent(leadData?.budgetInvoiceSent || false);
        setPaymentInvoiceSent(leadData?.paymentInvoiceSent || false);
        // design timing fields may be added during payment chat
        setDesignStartAt(
          leadData?.designStartAt ? toInputDateTime(leadData.designStartAt) : "",
        );
        setDesignEndAt(
          leadData?.designEndAt ? toInputDateTime(leadData.designEndAt) : "",
        );
        setStatusValue("");
      } catch (e) {
        if (!isMounted) return;
        showError(extractApiErrorMessage(e, "Failed to load lead"));
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    loadLead();
    return () => {
      isMounted = false;
    };
  }, [id]);

  const refreshLeadLogs = async (leadId = lead?.id) => {
    if (!leadId) return;
    try {
      const rows = await getLeadLog(leadId);
      setLeadLogs(Array.isArray(rows) ? rows : []);
    } catch (error) {
      console.warn("Failed to refresh lead logs", error);
    }
  };

  // Auto-refresh lead + invoice when the browser tab regains focus (e.g. after admin approves on another page).
  // Throttled to once per 10 seconds to avoid excessive API calls.
  useEffect(() => {
    if (!id) return;
    let lastFetch = 0;
    const handleFocus = async () => {
      const now = Date.now();
      if (now - lastFetch < 10000) return;
      lastFetch = now;
      try {
        const fresh = await getLeadById(id);
        if (fresh) setLead(prev => ({ ...(prev || {}), ...fresh }));
      } catch { /* silent */ }
    };
    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, [id]);

  // Fetch production requirements when lead loads (with retry for auth errors)
  useEffect(() => {
    if (!lead?.id) return;
    let isMounted = true;
    let retryCount = 0;
    const maxRetries = 3;

    const fetchRequirements = async (retryAttempt = 0) => {
      if (retryAttempt === 0) setLoadingRequirements(true);
      try {
        const requirements = await getProductionRequirements(lead.id);
        if (isMounted) {
          setProductionRequirements(Array.isArray(requirements) ? requirements : []);
        }
      } catch (err) {
        if (!isMounted) return;
        const status = err?.response?.status;
        
        // Retry on 401/403 (auth not ready) with exponential backoff
        if ((status === 401 || status === 403) && retryAttempt < maxRetries) {
          const delayMs = Math.pow(2, retryAttempt) * 500; // 500ms, 1s, 2s
          setTimeout(() => {
            if (isMounted) fetchRequirements(retryAttempt + 1);
          }, delayMs);
          return;
        }

        // Handle all other errors gracefully
        if (status === 404 || status === 401 || status === 403) {
          // Expected: 404 if no requirements exist, 401/403 if auth fails after retries
          setProductionRequirements([]);
        } else {
          console.warn("Failed to fetch production requirements:", err?.message || err);
          setProductionRequirements([]);
        }
      } finally {
        if (isMounted && retryAttempt === 0) setLoadingRequirements(false);
      }
    };

    fetchRequirements();
    return () => {
      isMounted = false;
    };
  }, [lead?.id]);

  useEffect(() => {
    if (!lead?.id) return;
    let isMounted = true;

    const fetchDesignRequirement = async () => {
      setLoadingDesignRequirement(true);
      try {
        const response = await getDesignRequirement(lead.id);
        if (isMounted) {
          setDesignRequirement(response || null);
        }
      } catch (err) {
        if (!isMounted) return;
        console.warn("Failed to fetch design requirement:", err?.message || err);
        setDesignRequirement(null);
      } finally {
        if (isMounted) setLoadingDesignRequirement(false);
      }
    };

    fetchDesignRequirement();
    return () => {
      isMounted = false;
    };
  }, [lead?.id]);

  useEffect(() => {
    if (!lead?.id || autoStatusHandled) return;
    const params = new URLSearchParams(location.search || "");
    const nextStatus = String(params.get("status") || "").trim();
    if (!nextStatus) return;
    const nextKey = nextStatus.toLowerCase();
    setStatusValue(nextStatus);
    if (nextKey === "attempted" && statusNeedsModal(nextKey)) {
      setShowAttemptedModal(true);
    } else if (nextKey === "interested" && statusNeedsModal(nextKey)) {
      setShowInterestedModal(true);
    } else if (nextKey === "rejected" && statusNeedsModal(nextKey)) {
      setShowRejectedModal(true);
    } else if (nextKey === "requirement" && statusNeedsModal(nextKey)) {
      setShowRequirementModal(true);
    } else if (nextKey === "allocate") {
      setShowAllocateModal(true);
    }
    setAutoStatusHandled(true);
  }, [lead?.id, location.search, autoStatusHandled]);

  // Fetch addresses whenverify modal opens
  useEffect(() => {
    if (!showVerifyModal || !lead?.id || addressLoading) return;
    
    const fetchAddresses = async () => {
      setAddressLoading(true);
      try {
        const billingList = await getAddressesByLeadIdAndType(lead.id, "BILLING");
        const shippingList = await getAddressesByLeadIdAndType(lead.id, "SHIPPING");
        setBillingAddresses(billingList || []);
        setShippingAddresses(shippingList || []);
        
        // Auto-select primary billing address
        const primaryBilling = billingList?.find(a => a.isPrimary);
        if (primaryBilling) {
          setSelectedBillingAddressId(primaryBilling.id);
        } else if (billingList?.length > 0) {
          setSelectedBillingAddressId(billingList[0].id);
        }
      } catch (e) {
        console.error("Failed to fetch addresses:", e);
      } finally {
        setAddressLoading(false);
      }
    };
    
    fetchAddresses();
  }, [showVerifyModal, lead?.id]);

  const effectiveStatus = String(lead?.status || "").trim();
  const statusLower = effectiveStatus.toLowerCase();

  const normalizeKey = (s) => String(s || "").trim().toLowerCase();
  // include the new "requirement" stage so that when a lead is in
  // requirement status all earlier tabs (attempted/interested/etc.) keep
  // appearing.  the stage order reflects progression through the flow.
  const leadStageOrder = [
    "new lead",
    "attempted",
    "interested",
    "requirement",
    "budget",
    "design",
    "payment",
    "deal",
    "production",
  ];
  const currentStageIndex = leadStageOrder.indexOf(statusLower);
  const hasReachedStage = (stage) => {
    const targetIndex = leadStageOrder.indexOf(String(stage || "").toLowerCase());
    if (targetIndex === -1 || currentStageIndex === -1) return false;
    return currentStageIndex >= targetIndex;
  };

  // determine if the modal for a given status should be shown based on existing lead data
  const statusNeedsModal = (status) => {
    if (!lead) return true;
    const key = String(status || "").trim().toLowerCase();
    switch (key) {
      case "attempted":
        return !lead.attemptedOpenReason || !lead.attemptedCallStatus;
      case "interested":
        return !lead.interestedFollowUpDate;
      case "rejected":
        return !lead.rejectedReason;
      case "requirement":
      case "budget":
        // Only show requirement modal when requirement details are missing.
        return !(
          (lead.requirementType && String(lead.requirementType).trim()) ||
          (lead.requirementNotes && String(lead.requirementNotes).trim()) ||
          (lead.requirementFileName && String(lead.requirementFileName).trim())
        );
      default:
        return true;
    }
  };

  // Computed status flags
  const isNewLead = statusLower === "new lead";
  const isAttempted = statusLower === "attempted";
  const isInterested = statusLower === "interested";
  const isRejected = statusLower === "rejected";
  const isDesign = statusLower === "design";
  const isPayment = statusLower === "payment";
  const isProduction = statusLower === "production";
  const isConverted = statusLower === "deal";
  const isLeadReadOnly = isConverted;
  const isEmployeeDesignView = role === "EMPLOYEE" && statusLower === "design";
  const lockAfterAttempted = hasReachedStage("interested") || isRejected;
  const hasAttemptedData = Boolean(
    lead?.attemptedOpenReason || lead?.attemptedCallStatus || lead?.attemptedCallRemarks,
  );
  const hasInterestedData = Boolean(
    lead?.interestedFollowUpDate || lead?.interestedCallRemarks,
  );
  const hasRequirementData = Boolean(
    lead?.requirementType ||
      lead?.requirementNotes ||
      lead?.requirementFileName ||
      designRequirement ||
      productionRequirements.length > 0,
  );
  const requirementTypeValue = String(lead?.requirementType || "").trim();
  const requirementNotesValue = String(lead?.requirementNotes || "").trim();
  const requirementFileNameValue = String(lead?.requirementFileName || "").trim();
  const requirementFilePathValue = String(lead?.requirementFilePath || "").trim();
    const hasDesignData = Boolean(
      lead?.designStartAt || lead?.designEndAt || finalDesignMessage?.id || designRequirement,
    );
  const hasPaymentData = Boolean(
    lead?.totalAmount != null ||
      lead?.paidAmount != null ||
      lead?.remainingAmount != null ||
      lead?.paymentOwnerId != null,
  );
  const hasPaymentVerificationData = Boolean(
    lead?.paymentVerificationStatus ||
      lead?.paymentVerificationAmount != null ||
      lead?.paymentProofFileName ||
      lead?.paymentProofFilePath ||
      lead?.paymentProofNotes,
  );
  const alternatePhoneCountryOption = getCountryOptionByValue(countryCode);
  const alternatePhoneAllowedLengths = getCountryAllowedLengths(countryCode);
  const alternatePhoneDisplayMaxLength = getCountryDisplayMaxLength(countryCode);

  const showAttemptedSummary = hasAttemptedData || isAttempted;
  const showInterestedSummary = hasInterestedData || isInterested;
  const showRequirementSummary =
    hasRequirementData || statusLower === "requirement" || statusLower === "budget";
  const hasReachedPaymentStage = hasReachedStage("payment");
  const showPaymentSummary =
    hasPaymentData ||
    hasPaymentVerificationData ||
    hasReachedPaymentStage;

  const parsedInvoice = (() => {
    if (!lead?.invoiceData) return null;
    try { return JSON.parse(lead.invoiceData); } catch { return null; }
  })();


  const handleDownloadInvoice = async () => {
    if (!parsedInvoice) return;
    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const pageMargin = 10;
      const invoiceNumber = `INV-${lead.leadId || lead.id}`;
      const isPaymentType = parsedInvoice.type === "payment";

      // Header
      doc.setFontSize(18);
      doc.text(isPaymentType ? "PAYMENT APPROVAL INVOICE" : "INVOICE", pageMargin, 15);

      // Company details
      doc.setFontSize(10);
      doc.text("SVL Printing and Packaging", pageMargin, 25);
      doc.text("GSTIN: 07AABCS1234H1Z0", pageMargin, 30);
      doc.text("103-A, Industrial Complex, SVL Business Park", pageMargin, 35);
      doc.text("Bangalore, Karnataka, 560001, India", pageMargin, 40);
      if (isPaymentType) {
        doc.text("Email: billing@svlprinting.com | Phone: +91-080-41234567", pageMargin, 45);
      }

      doc.setFontSize(9);
      doc.text(`Invoice #: ${invoiceNumber}`, pageWidth - pageMargin - 60, 25);
      doc.text(`Date: ${parsedInvoice.createdAt ? new Date(parsedInvoice.createdAt).toLocaleDateString("en-IN") : new Date().toLocaleDateString("en-IN")}`, pageWidth - pageMargin - 60, 30);
      doc.text(`Lead: ${lead.name}`, pageWidth - pageMargin - 60, 35);

      let tableStartY = 55;

      // Addresses section for payment invoices
      if (isPaymentType) {
        const formatAddress = (address) => {
          if (!address) return "-";
          const parts = [
            address.companyName || address.company_name,
            address.contactPersonName || address.contact_person_name,
            address.addressLine1 || address.address_line1,
            address.addressLine2 || address.address_line2,
            address.city,
            address.state,
            address.pincode,
            address.country,
          ].filter(Boolean);
          return parts.join(", ");
        };

        let billingAddr = null;
        let shippingAddr = null;
        try {
          if (lead.paymentVerificationBillingAddressId) {
            billingAddr = await getAddressById(lead.id, lead.paymentVerificationBillingAddressId);
          }
          if (lead.paymentVerificationShippingAddressId) {
            shippingAddr = await getAddressById(lead.id, lead.paymentVerificationShippingAddressId);
          }
        } catch (e) { /* addresses optional */ }

        const blockY = 55;
        const blockHeight = 30;
        const blockWidth = (pageWidth - pageMargin * 3) / 2;
        const billingX = pageMargin;
        const shippingX = pageMargin + blockWidth + pageMargin;
        const titleY = blockY + 3;
        const textY = blockY + 9;

        const billingLines = doc.splitTextToSize(formatAddress(billingAddr), blockWidth - 4);
        const shippingLines = doc.splitTextToSize(formatAddress(shippingAddr), blockWidth - 4);

        doc.rect(billingX, blockY, blockWidth, blockHeight);
        doc.rect(shippingX, blockY, blockWidth, blockHeight);

        doc.setFontSize(8.5);
        doc.text("BILLING ADDRESS", billingX + 2, titleY);
        doc.text("SHIPPING ADDRESS", shippingX + 2, titleY);
        doc.setFontSize(8);
        doc.text(billingLines, billingX + 2, textY);
        doc.text(shippingLines, shippingX + 2, textY);

        tableStartY = blockY + blockHeight + 6;
      }

      const itemsWithTotals = (parsedInvoice.items || []).map(item => ({
        ...item,
        subtotal: item.subtotal ?? (Number(item.quantity) * Number(item.unitPrice)),
      }));
      autoTable(doc, {
        startY: tableStartY,
        head: [["#", "Description", "HSN", "Qty", "Unit Price", "Amount"]],
        body: itemsWithTotals.map((item, idx) => [
          String(idx + 1),
          item.description,
          item.hsn || "",
          Number(item.quantity).toFixed(2),
          Number(item.unitPrice).toFixed(2),
          Number(item.subtotal).toFixed(2),
        ]),
        margin: { left: pageMargin, right: pageMargin },
        styles: { fontSize: 7.8, cellPadding: 1.5 },
        headStyles: { fillColor: [41, 128, 185] },
        columnStyles: { 0: { halign: "center", cellWidth: 10 }, 3: { halign: "right", cellWidth: 18 }, 4: { halign: "right", cellWidth: 28 }, 5: { halign: "right", cellWidth: 28 } },
      });
      const t = parsedInvoice.totals || {};
      const finalY = (doc.lastAutoTable?.finalY || tableStartY) + 5;
      const sx = pageWidth - 72;
      const sv = pageWidth - pageMargin;
      const gap = 4.2;
      doc.setFontSize(8.5);
      doc.text("Subtotal:", sx, finalY);
      doc.text(`Rs ${Number(t.subtotal || 0).toFixed(2)}`, sv, finalY, { align: "right" });
      doc.text(`CGST (${Number(t.cgstPercent || 0).toFixed(2)}%):`, sx, finalY + gap);
      doc.text(`Rs ${Number(t.cgst || 0).toFixed(2)}`, sv, finalY + gap, { align: "right" });
      doc.text(`SGST (${Number(t.sgstPercent || 0).toFixed(2)}%):`, sx, finalY + gap * 2);
      doc.text(`Rs ${Number(t.sgst || 0).toFixed(2)}`, sv, finalY + gap * 2, { align: "right" });
      doc.setFontSize(9);
      doc.text("Grand Total:", sx, finalY + gap * 3);
      doc.text(`Rs ${Number(t.grandTotal || 0).toFixed(2)}`, sv, finalY + gap * 3, { align: "right" });

      if (isPaymentType) {
        const verifiedAmt = Number(t.verificationAmount || 0);
        const totalPaid = Number(lead.paidAmount || 0);
        const remaining = Math.max(0, Number(t.grandTotal || 0) - totalPaid);

        doc.text("Amount Verified (This Payment):", sx, finalY + gap * 4.2);
        doc.text(`Rs ${verifiedAmt.toFixed(2)}`, sv, finalY + gap * 4.2, { align: "right" });
        doc.text("Total Paid Amount:", sx, finalY + gap * 5.2);
        doc.text(`Rs ${totalPaid.toFixed(2)}`, sv, finalY + gap * 5.2, { align: "right" });
        doc.text("Remaining:", sx, finalY + gap * 6.2);
        doc.text(`Rs ${remaining.toFixed(2)}`, sv, finalY + gap * 6.2, { align: "right" });

        // Footer
        doc.setFontSize(8);
        doc.text("Payment Approved", pageMargin, pageHeight - 10);
      }

      doc.save(`${isPaymentType ? "Payment-Approved" : "Invoice"}-${invoiceNumber}.pdf`);
    } catch (err) {
      console.error("Failed to generate invoice PDF:", err);
    }
  };

  const handleExportGeneralInfoPDF = () => {
    if (!lead) return;
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text("General Info", 14, 18);
    doc.setFontSize(10);
    doc.text(lead.name || "", 14, 26);
    doc.text(`Date: ${new Date().toLocaleDateString("en-IN")}`, 14, 31);
    const rows = [
      ["Enquiry Id", pickText(lead, ["enquiryId", "enquiryID", "leadId", "leadID", "lead_id", "enquiryCode", "enquiry_code"]) || "-"],
      ["EUID", pickText(lead, ["euid"]) || "-"],
      ["Enquiry Name", lead.name || "-"],
      ["Country Code", countryCode || "-"],
      ["Mobile Number", lead.mobile || "-"],
      ["Email", lead.email || "-"],
      ["Enquiry Project", lead.projectName || "-"],
      ["Alternate No.", alternatePhone || "-"],
      ["Alternate Email", alternateEmail || "-"],
      ["Occupation", occupation || "-"],
      ["Company Name", companyName || "-"],
      ["Lead Group", pickText(lead, ["leadGroupName", "groupName"]) || "-"],
      ["Rating", leadTypeValue || "-"],
      ["Allocator", pickText(lead, ["Allocator", "allocator", "allocatorName", "createdByName", "createdBy", "createdByUsername", "creator"]) || "-"],
      ["Lead Owner", pickText(lead, ["ownerName", "owner", "ownerUsername", "ownerUserName"]) || "-"],
      ["Enquiry Status", lead.status || "-"],
    ];
    autoTable(doc, {
      startY: 36,
      head: [["Field", "Value"]],
      body: rows,
      margin: { left: 14, right: 14 },
      styles: { fontSize: 9, cellPadding: 2.5 },
      headStyles: { fillColor: [41, 128, 185] },
      columnStyles: { 0: { fontStyle: "bold", cellWidth: 55 } },
    });
    doc.save(`GeneralInfo-${lead.name || lead.id || "lead"}.pdf`);
  };

  const handleExportGeneralInfoExcel = () => {
    if (!lead) return;
    const rows = [
      ["Field", "Value"],
      ["Enquiry Id", pickText(lead, ["enquiryId", "enquiryID", "leadId", "leadID", "lead_id", "enquiryCode", "enquiry_code"]) || ""],
      ["EUID", pickText(lead, ["euid"]) || ""],
      ["Enquiry Name", lead.name || ""],
      ["Country Code", countryCode || ""],
      ["Mobile Number", lead.mobile || ""],
      ["Email", lead.email || ""],
      ["Enquiry Project", lead.projectName || ""],
      ["Alternate No.", alternatePhone || ""],
      ["Alternate Email", alternateEmail || ""],
      ["Occupation", occupation || ""],
      ["Company Name", companyName || ""],
      ["Lead Group", pickText(lead, ["leadGroupName", "groupName"]) || ""],
      ["Rating", leadTypeValue || ""],
      ["Allocator", pickText(lead, ["Allocator", "allocator", "allocatorName", "createdByName", "createdBy", "createdByUsername", "creator"]) || ""],
      ["Lead Owner", pickText(lead, ["ownerName", "owner", "ownerUsername", "ownerUserName"]) || ""],
      ["Enquiry Status", lead.status || ""],
    ];
    const csvContent = rows
      .map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(","))
      .join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `GeneralInfo-${lead.name || lead.id || "lead"}.csv`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  // Set active tab based on current lead status
  useEffect(() => {
    if (!lead?.id) return;

    let tabToActivate = "general";

    if (statusLower === "attempted") {
      tabToActivate = "attempted";
    } else if (statusLower === "interested") {
      tabToActivate = "interested";
    } else if (statusLower === "payment" || statusLower === "production") {
      tabToActivate = "payment";
    } else if (statusLower === "budget") {
      tabToActivate = "budget";
    } else if (statusLower === "requirement") {
      tabToActivate = "requirement";
    } else if (statusLower === "rejected") {
      tabToActivate = "rejected";
    }
    
    setActiveTab(tabToActivate);
  }, [lead?.id, effectiveStatus]);

  useEffect(() => {
    if (CUSTOMER_CHAT_DISABLED) {
      setDesignMessages([]);
      setFinalDesignMessage(null);
      return;
    }
    if (!lead?.id) return;
    const statusKey = effectiveStatus.toLowerCase();
    if (statusKey !== "design" && statusKey !== "payment" && statusKey !== "production") return;
    getLeadChatMessages(lead.id, "CUSTOMER")
      .then((rows) => {
        const source = Array.isArray(rows) ? rows : [];
        const list = source.filter((m) => {
          if (m.senderRole !== "CUSTOMER") return false;
          const msg = String(m?.message || "");
          const lower = msg.trim().toLowerCase();
          const isCustomerChoice =
            lower.startsWith("customer selected:") ||
            lower.startsWith("customer requested change");
          return hasDesignThreadMarker(msg) || isCustomerChoice;
        });
        const finalUpload = [...source].reverse().find((m) => isFinalDesignUploadMessage(m)) || null;
        setDesignMessages(list);
        setFinalDesignMessage(finalUpload);
      })
      .catch((err) => {
        if (err?.response?.status !== 404) {
          console.error("failed to load design messages", err);
        }
        setDesignMessages([]);
        setFinalDesignMessage(null);
      });
  }, [lead?.id, effectiveStatus]);


  useEffect(() => {
    let active = true;
    const loadFlow = async () => {
      try {
        const flow = await getLeadFlow();
        if (!active) return;
        setFlowRules(Array.isArray(flow?.rules) ? flow.rules : []);
      } catch (e) {
        if (!active) return;
        setFlowRules([]);
      }
    };
    loadFlow();
    return () => {
      active = false;
    };
  }, [role]);

  useEffect(() => {
    let active = true;
    const loadItems = async () => {
      try {
        const rows = await getStockItems();
        if (!active) return;
        setStockItems(Array.isArray(rows) ? rows : []);
      } catch (e) {
        console.error("failed to load stock items", e);
      }
    };
    loadItems();
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!showAllocateModal || !lead?.id) return;
    let active = true;
    const loadOptions = async () => {
      try {
        const currentStatus = String(lead?.status || "").trim().toLowerCase();
        const findRule = (status) =>
          Array.isArray(flowRules)
            ? flowRules.find(
                (r) =>
                  String(r?.status || "").trim().toLowerCase() ===
                  String(status || "").trim().toLowerCase(),
              )
            : null;
        const currentRule = findRule(currentStatus);
        let nextGroupId = null;
        if (currentRule?.next && typeof currentRule.next === "object") {
          const allocateKey = Object.keys(currentRule.next).find(
            (key) =>
              String(key || "").trim().toLowerCase() === "allocate",
          );
          if (allocateKey) {
            nextGroupId = currentRule.next[allocateKey] ?? null;
          }
        }
        if (nextGroupId == null) {
          const allocateRule = findRule("allocate");
          if (allocateRule?.handledByGroupId != null) {
            nextGroupId = allocateRule.handledByGroupId;
          }
        }
        setAllocateGroupId(nextGroupId);
        setAllocateGroupName("");
        if (nextGroupId != null) {
          try {
            const groups = await getAssignableLeadGroups();
            const match = groups.find(
              (group) => String(group.id) === String(nextGroupId),
            );
            if (match?.name) {
              setAllocateGroupName(match.name);
            }
          } catch (e) {
            setAllocateGroupName("");
          }
        }
        const rows = await getAssignableAllocators(
          lead.id,
          nextGroupId ? { groupId: nextGroupId } : {},
        );
        if (!active) return;
        setAllocateOptions(Array.isArray(rows) ? rows : []);
      } catch (e) {
        if (!active) return;
        showError(extractApiErrorMessage(e, "Failed to load employees"));
      }
    };
    loadOptions();
    return () => {
      active = false;
    };
  }, [showAllocateModal, lead?.id]);

  const orderedLeadStatuses = Array.from(
    new Set(
      [
        ...(Array.isArray(flowRules)
          ? flowRules.flatMap((rule) => {
              const base = String(rule?.status || "").trim();
              const next =
                rule?.next && typeof rule.next === "object"
                  ? Object.keys(rule.next).map((k) => String(k || "").trim())
                  : [];
              return [base, ...next];
            })
          : []),
        String(lead?.status || "").trim(),
      ]
        .map((item) => String(item || "").trim())
        .filter(Boolean),
    ),
  );

  const timelineEntries = (() => {
    const order = [
      "new lead",
      "attempted",
      "interested",
      "requirement",
      "budget",
      "design",
      "payment",
      "deal",
      "production",
    ];
    const labelMap = {
      "new lead": "New Lead",
      attempted: "Attempted",
      interested: "Interested",
      requirement: "Requirement",
      budget: "Budget",
      design: "Design",
      payment: "Payment",
      deal: "Deal",
      production: "Production",
    };
    const extractStatus = (action) => {
      const text = String(action || "").trim();
      if (!text) return "";
      const match = text.match(/status\s+(?:changed|updated)\s+to\s+(.+)$/i);
      return match?.[1] ? String(match[1]).trim().replace(/[.]+$/, "") : "";
    };
    return (Array.isArray(leadLogs) ? leadLogs : [])
      .slice()
      .sort((a, b) => new Date(a?.createdAt || 0) - new Date(b?.createdAt || 0))
      .map((log, index) => {
        const rawStatus = extractStatus(log?.action);
        const statusKey = rawStatus.toLowerCase();
        if (!statusKey || !order.includes(statusKey)) return null;
        return {
          key: log?.id || `${statusKey}-${log?.createdAt || index}-${index}`,
          statusKey,
          label: labelMap[statusKey] || rawStatus,
          createdAt: log?.createdAt || null,
          actor: log?.actor || null,
        };
      })
      .filter(Boolean)
      .filter((entry, index, arr) => arr.findIndex((item) => item.statusKey === entry.statusKey && item.createdAt === entry.createdAt) === index)
      .concat(
        (() => {
          const currentKey = String(effectiveStatus || "").trim().toLowerCase();
          if (!currentKey) return [];
          if (order.includes(currentKey) && (Array.isArray(leadLogs) ? leadLogs : []).some((log) => extractStatus(log?.action).toLowerCase() === currentKey)) {
            return [];
          }
          return [{
            key: `current-status-${currentKey}`,
            statusKey: currentKey,
            label: labelMap[currentKey] || effectiveStatus,
            createdAt: null,
          }];
        })(),
      );
  })();

  const timelineStatuses = timelineEntries.map((entry) => entry.label);

  const currentTimelineIndex = (() => {
    const currentKey = String(effectiveStatus || "").trim().toLowerCase();
    if (!currentKey) return -1;
    for (let i = timelineEntries.length - 1; i >= 0; i -= 1) {
      if (timelineEntries[i]?.statusKey === currentKey) return i;
    }
    return timelineStatuses.findIndex(
      (item) => item.toLowerCase() === currentKey,
    );
  })();

  const allowedStatusOptions = (() => {
    const current = String(lead?.status || "").trim().toLowerCase();
    if (!current) {
      return orderedLeadStatuses;
    }
    
    // Find the flow rule for the current status
    const rule = Array.isArray(flowRules)
      ? flowRules.find(
          (r) =>
            String(r?.status || "").trim().toLowerCase() === current,
        )
      : null;
    
    // Rule exists — only show explicitly configured next statuses
    if (rule) {
      if (rule.next && typeof rule.next === "object") {
        const nextKeys = Object.keys(rule.next);
        if (nextKeys.length > 0) {
          return nextKeys
            .map((item) => String(item || "").trim())
            .filter(Boolean);
        }
      }
      // Rule exists but no next statuses configured → block transitions
      return [];
    }
    
    // No flow rule at all for this status → show the configured flow statuses
    return orderedLeadStatuses;
  })();
  const displayStatusOptions = useMemo(
    () => uniqueStatusOptions(allowedStatusOptions),
    [allowedStatusOptions],
  );


  const saveStatus = async () => {
    if (!lead?.id) return;
    setStatusSaving(true);
    const currentKey = String(lead?.status || "").trim().toLowerCase();
    if (
      currentKey === "design" &&
      statusValue &&
      String(statusValue || "").trim().toLowerCase() !== "design"
    ) {
      if (!finalDesignMessage?.id) {
        showError("Please upload the final design before changing status from Design");
        return;
      }
    }
    if (!statusValue) {
      showError("Please select a status");
      return;
    }
    const normalizedKey = String(statusValue || "").trim().toLowerCase();
    // only intercept status transitions if the corresponding form needs to be filled
    if (normalizedKey === "attempted" && statusNeedsModal(normalizedKey)) {
      setShowAttemptedModal(true);
      return;
    }
    if (normalizedKey === "interested" && statusNeedsModal(normalizedKey)) {
      setShowInterestedModal(true);
      return;
    }
    if (normalizedKey === "rejected" && statusNeedsModal(normalizedKey)) {
      setShowRejectedModal(true);
      return;
    }
    if ((normalizedKey === "requirement" || normalizedKey === "budget") && statusNeedsModal(normalizedKey)) {
      setShowRequirementModal(true);
      return;
    }
    if (normalizedKey === "allocate") {
      setShowAllocateModal(true);
      return;
    }

    // Validate status transition based on flow rules
    const validation = validateStatusTransition(
      statusValue,
      flowRules,
      lead,
      {
        total: totalAmount || lead?.totalAmount,
        paid: paidAmount || lead?.paidAmount,
        remaining: remainingAmount || lead?.remainingAmount,
      }
    );

    if (!validation.isValid) {
      showError(validation.message);
      setStatusSaving(false);
      return;
    }

    setSaving(true);
    try {
      // Determine the nextGroupId based on flow rules for the target status
      let nextGroupId = null;
      if (Array.isArray(flowRules)) {
        const targetRule = flowRules.find(
          (r) =>
            String(r?.status || "").trim().toLowerCase() ===
            String(statusValue || "").trim().toLowerCase(),
        );
        if (targetRule?.handledByGroupId != null) {
          nextGroupId = targetRule.handledByGroupId;
        }
      }

      const updated = await updateLeadRowStatus(lead.id, statusValue, nextGroupId);
      let key = normalizedKey;
      if (key === "payment") {
        // nothing special needed when moving to payment
      }
      const mergedLead = { ...(lead || {}), ...updated };
      setLead(mergedLead);
      await refreshLeadLogs(lead.id);
      showSuccess("Lead status updated");
      // open appropriate modal after save if details are still missing
      if (statusNeedsModal(normalizedKey)) {
        if (normalizedKey === "attempted") setShowAttemptedModal(true);
        else if (normalizedKey === "interested") setShowInterestedModal(true);
        else if (normalizedKey === "rejected") setShowRejectedModal(true);
        else if (normalizedKey === "requirement" || normalizedKey === "budget") setShowRequirementModal(true);
      }
      if (exitEditIfOwnershipMoved(mergedLead)) return;
    } catch (e) {
      showError(extractApiErrorMessage(e, "Failed to update status"));
    } finally {
      setSaving(false);
      setStatusSaving(false);
    }
  };

  const exitEditIfOwnershipMoved = (nextLead) => {
    if (role !== "EMPLOYEE") return false;
    const nextOwnerId = nextLead?.ownerUserId;
    const currentUserId = user?.id;
    if (!nextOwnerId || !currentUserId) return false;
    if (String(nextOwnerId) === String(currentUserId)) return false;
    navigate("/leads");
    return true;
  };

  const submitAttempted = async () => {
    if (!lead?.id) return;
    if (!attemptedOpenReason || !attemptedCallStatus) {
      showError("Please complete Open Reason and Call Status");
      return;
    }
    if (
      String(attemptedCallStatus || "").trim().toLowerCase() === "follow up" &&
      !attemptedFollowUpDate
    ) {
      showError("Please select Follow Up Date");
      return;
    }
    setSaving(true);
    try {
      const detailsPayload = {
        attemptedOpenReason,
        attemptedCallStatus,
        attemptedCallRemarks,
        followUpDate: attemptedFollowUpDate
          ? new Date(attemptedFollowUpDate).toISOString()
          : null,
      };
      const detailsUpdated = await updateLeadDetails(lead.id, detailsPayload);
      if (attemptedFollowUpDate) {
        setFollowUpDate(attemptedFollowUpDate);
      }
      
      // Determine nextGroupId from flow rules
      let nextGroupId = null;
      if (Array.isArray(flowRules)) {
        const targetRule = flowRules.find(
          (r) =>
            String(r?.status || "").trim().toLowerCase() ===
            String(statusValue || "").trim().toLowerCase(),
        );
        if (targetRule?.handledByGroupId != null) {
          nextGroupId = targetRule.handledByGroupId;
        }
      }
      
      const updated = await updateLeadRowStatus(lead.id, statusValue, nextGroupId);
      const mergedLead = { ...(lead || {}), ...detailsUpdated, ...updated };
      setLead(mergedLead);
      await refreshLeadLogs(lead.id);
      showSuccess("Lead status updated");
      setShowAttemptedModal(false);
      if (exitEditIfOwnershipMoved(mergedLead)) return;
    } catch (e) {
      showError(extractApiErrorMessage(e, "Failed to update status"));
    } finally {
      setSaving(false);
    }
  };

  const submitInterested = async () => {
    if (!lead?.id) return;
    if (!interestedFollowUpDate) {
      showError("Please select Follow Up Date");
      return;
    }
    setSaving(true);
    try {
      const detailsPayload = {
        interestedFollowUpDate: new Date(interestedFollowUpDate).toISOString(),
        interestedCallRemarks,
      };
      const detailsUpdated = await updateLeadDetails(lead.id, detailsPayload);
      
      // Determine nextGroupId from flow rules
      let nextGroupId = null;
      if (Array.isArray(flowRules)) {
        const targetRule = flowRules.find(
          (r) =>
            String(r?.status || "").trim().toLowerCase() ===
            String(statusValue || "").trim().toLowerCase(),
        );
        if (targetRule?.handledByGroupId != null) {
          nextGroupId = targetRule.handledByGroupId;
        }
      }
      
      const updated = await updateLeadRowStatus(lead.id, statusValue, nextGroupId);
      const mergedLead = { ...(lead || {}), ...detailsUpdated, ...updated };
      setLead(mergedLead);
      await refreshLeadLogs(lead.id);
      showSuccess("Lead status updated");
      setShowInterestedModal(false);
      if (exitEditIfOwnershipMoved(mergedLead)) return;
    } catch (e) {
      showError(extractApiErrorMessage(e, "Failed to update status"));
    } finally {
      setSaving(false);
    }
  };

  const submitRejected = async () => {
    if (!lead?.id) return;
    if (!rejectedReason) {
      showError("Please select Rejected Reason");
      return;
    }
    setSaving(true);
    try {
      const detailsPayload = {
        rejectedReason,
        rejectedReasonSubtype: rejectedReasonSubtype || null,
      };
      const detailsUpdated = await updateLeadDetails(lead.id, detailsPayload);
      
      // Determine nextGroupId from flow rules
      let nextGroupId = null;
      if (Array.isArray(flowRules)) {
        const targetRule = flowRules.find(
          (r) =>
            String(r?.status || "").trim().toLowerCase() ===
            String(statusValue || "").trim().toLowerCase(),
        );
        if (targetRule?.handledByGroupId != null) {
          nextGroupId = targetRule.handledByGroupId;
        }
      }
      
      const updated = await updateLeadRowStatus(lead.id, statusValue, nextGroupId);
      setLead((prev) => ({ ...(prev || {}), ...detailsUpdated, ...updated }));
      await refreshLeadLogs(lead.id);
      showSuccess("Lead status updated");
      setShowRejectedModal(false);
      if (role === "EMPLOYEE") {
        navigate("/leads");
      } else {
        navigate("/rejected-leads");
      }
    } catch (e) {
      showError(extractApiErrorMessage(e, "Failed to update status"));
    } finally {
      setSaving(false);
    }
  };

  const submitAllocate = async () => {
    if (!lead?.id) return;
    if (!allocateOwnerId) {
      showError("Please select an employee");
      return;
    }
    setSaving(true);
    try {
      const ownerUpdated = await updateLeadAllocator(
        lead.id,
        Number(allocateOwnerId),
        allocateGroupId,
      );
      
      // Determine nextGroupId from flow rules
      let nextGroupId = null;
      if (Array.isArray(flowRules)) {
        const targetRule = flowRules.find(
          (r) =>
            String(r?.status || "").trim().toLowerCase() ===
            String(statusValue || "").trim().toLowerCase(),
        );
        if (targetRule?.handledByGroupId != null) {
          nextGroupId = targetRule.handledByGroupId;
        }
      }
      
      const statusUpdated = await updateLeadRowStatus(lead.id, statusValue, nextGroupId);
      const mergedLead = { ...(lead || {}), ...ownerUpdated, ...statusUpdated };
      setLead(mergedLead);
      showSuccess("Lead allocated");
      setShowAllocateModal(false);
      if (exitEditIfOwnershipMoved(mergedLead)) return;
    } catch (e) {
      showError(extractApiErrorMessage(e, "Failed to allocate lead"));
    } finally {
      setSaving(false);
    }
  };


  const submitRequirement = async (formData) => {
    if (!lead?.id) return;
    const {
      requirementType, requirementFile, requirementFileName, requirementNotes,
      designProductType, designCustomProductType, designSize, designCustomSize,
      designOrientation, designNumPages, designDescription, designPurpose,
      designCustomPurpose, designTargetAudience, designStylePref,
      designBrandColors, designFonts,
      designBrandGuidelinesFile, designBrandGuidelinesName,
      designLogoFile, designLogoName, designImagesFile, designImagesName,
      designTextContent, designWebsite, designPhone, designPhoneCountryCode,
      designAddress, designSocialMedia, designQrCode,
      designReferenceImagesFile, designReferenceImagesName,
      designReferenceLinks, designPreviousDesignsFile, designPreviousDesignsName,
      designDeadline, designPriority, designCustomPriority,
      designAdditionalNotes, designRestrictions, designColorPrefs,
      productionProductType, productionCustomProductType, productionQuantity,
      productionNumPages, productionPaperSize, productionCustomSizeWidth,
      productionCustomSizeHeight, productionCustomSizeUnit,
      productionPaperType, productionPaperGsm, productionColorType,
      productionPrintSides, productionPrintingMethod, productionFinishingOptions,
      productionFoldingType, productionArtworkFile, productionArtworkFileName,
      productionAdditionalNotes, productionPrintDeadline, productionDeliveryDate,
      productionPriority,
    } = formData;

    setRequirementSaving(true);
    try {
      let localDesignRequirement = null;
      const needsDesignAssignment =
        requirementType === "Design" || requirementType === "Design + Production";
      const needsProductionAssignment =
        requirementType === "Production" || requirementType === "Design + Production";

      const [designAssignment, productionAssignment] = await Promise.all([
        needsDesignAssignment
          ? pickFlowAssignee({
              leadId: lead.id,
              flowRules,
              status: "design",
              currentAssigneeId: lead?.designAssignedToUserId ?? lead?.ownerUserId ?? null,
            }).catch(() => ({ assigneeId: null }))
          : Promise.resolve({ assigneeId: null }),
        needsProductionAssignment
          ? pickFlowAssignee({
              leadId: lead.id,
              flowRules,
              status: "production",
              currentAssigneeId: lead?.productionAssignedToUserId ?? lead?.ownerUserId ?? null,
            }).catch(() => ({ assigneeId: null }))
          : Promise.resolve({ assigneeId: null }),
      ]);

      let detailsPayload = {
        requirementType,
        requirementNotes,
      };

      if (designAssignment?.assigneeId) {
        detailsPayload.designAssignedToUserId = Number(designAssignment.assigneeId);
      }
      if (productionAssignment?.assigneeId) {
        detailsPayload.productionAssignedToUserId = Number(productionAssignment.assigneeId);
      }
      
      // Handle file uploads
      const uploadedFiles = {};
      
      // Upload production file if needed
      if (requirementFile && (requirementType === "Production" || requirementType === "Design + Production")) {
        try {
          const fileAttachment = await sendLeadChatAttachment(lead.id, {
            threadType: "INTERNAL",
            message: "Requirement file",
            file: requirementFile,
          });
          if (fileAttachment?.id) {
            uploadedFiles.requirementFile = {
              fileName: fileAttachment.attachmentName || fileAttachment.name || requirementFileName,
              fileType: fileAttachment.attachmentType,
              fileSize: fileAttachment.attachmentSize,
              filePath: `/api/v1/leads/${lead.id}/chat/messages/${fileAttachment.id}/file`,
            };
          }
        } catch (uploadErr) {
          console.warn("Production file upload failed but continuing", uploadErr);
        }
      }

      // Upload production artwork file if needed
      if (productionArtworkFile && (requirementType === "Production" || requirementType === "Design + Production")) {
        try {
          const fileAttachment = await sendLeadChatAttachment(lead.id, {
            threadType: "INTERNAL",
            message: "Production Artwork",
            file: productionArtworkFile,
          });
          if (fileAttachment?.id) {
            uploadedFiles.productionArtwork = {
              fileName: fileAttachment.attachmentName || fileAttachment.name || productionArtworkFileName,
              fileType: fileAttachment.attachmentType,
              fileSize: fileAttachment.attachmentSize,
              filePath: `/api/v1/leads/${lead.id}/chat/messages/${fileAttachment.id}/file`,
            };
          }
        } catch (uploadErr) {
          console.warn("Production artwork upload failed but continuing", uploadErr);
        }
      }
      
      // Handle Design brief uploads if applicable
      if (requirementType === "Design" || requirementType === "Design + Production") {
        const designBriefFiles = [];
        
        // Upload brand guidelines
        if (designBrandGuidelinesFile) {
          try {
            const attachment = await sendLeadChatAttachment(lead.id, {
              threadType: "INTERNAL",
              message: "Brand Guidelines",
              file: designBrandGuidelinesFile,
            });
            if (attachment?.id) {
              designBriefFiles.push({
                type: "brandGuidelines",
                fileName: attachment.attachmentName || attachment.name,
                filePath: `/api/v1/leads/${lead.id}/chat/messages/${attachment.id}/file`,
              });
            }
          } catch (e) {
            console.warn("Brand guidelines upload failed", e);
          }
        }
        
        // Upload logo
        if (designLogoFile) {
          try {
            const attachment = await sendLeadChatAttachment(lead.id, {
              threadType: "INTERNAL",
              message: "Logo",
              file: designLogoFile,
            });
            if (attachment?.id) {
              designBriefFiles.push({
                type: "logo",
                fileName: attachment.attachmentName || attachment.name,
                filePath: `/api/v1/leads/${lead.id}/chat/messages/${attachment.id}/file`,
              });
            }
          } catch (e) {
            console.warn("Logo upload failed", e);
          }
        }
        
        // Upload client images
        if (designImagesFile) {
          try {
            const attachment = await sendLeadChatAttachment(lead.id, {
              threadType: "INTERNAL",
              message: "Client Images",
              file: designImagesFile,
            });
            if (attachment?.id) {
              designBriefFiles.push({
                type: "clientImages",
                fileName: attachment.attachmentName || attachment.name,
                filePath: `/api/v1/leads/${lead.id}/chat/messages/${attachment.id}/file`,
              });
            }
          } catch (e) {
            console.warn("Client images upload failed", e);
          }
        }
        
        // Upload reference images
        if (designReferenceImagesFile) {
          try {
            const attachment = await sendLeadChatAttachment(lead.id, {
              threadType: "INTERNAL",
              message: "Reference Images",
              file: designReferenceImagesFile,
            });
            if (attachment?.id) {
              designBriefFiles.push({
                type: "referenceImages",
                fileName: attachment.attachmentName || attachment.name,
                filePath: `/api/v1/leads/${lead.id}/chat/messages/${attachment.id}/file`,
              });
            }
          } catch (e) {
            console.warn("Reference images upload failed", e);
          }
        }
        
        // Upload previous designs
        if (designPreviousDesignsFile) {
          try {
            const attachment = await sendLeadChatAttachment(lead.id, {
              threadType: "INTERNAL",
              message: "Previous Designs",
              file: designPreviousDesignsFile,
            });
            if (attachment?.id) {
              designBriefFiles.push({
                type: "previousDesigns",
                fileName: attachment.attachmentName || attachment.name,
                filePath: `/api/v1/leads/${lead.id}/chat/messages/${attachment.id}/file`,
              });
            }
          } catch (e) {
            console.warn("Previous designs upload failed", e);
          }
        }
        
        // Serialize design brief to JSON
        const designBrief = {
          productDetails: {
            type: designProductType === "Custom" ? designCustomProductType : designProductType,
            size: designSize === "Custom" ? designCustomSize : designSize,
            orientation: designOrientation,
            pages: designNumPages,
          },
          designBrief: {
            description: designDescription,
            purpose: designPurpose === "Custom" ? designCustomPurpose : designPurpose,
            targetAudience: designTargetAudience,
            stylePreference: designStylePref,
          },
          brandDetails: {
            colors: designBrandColors,
            fonts: designFonts,
            guidelinesFile: designBriefFiles.find(f => f.type === "brandGuidelines") || null,
          },
          contentFromClient: {
            logo: designBriefFiles.find(f => f.type === "logo") || null,
            images: designBriefFiles.find(f => f.type === "clientImages") || null,
            textContent: designTextContent,
            website: designWebsite,
            phone: designPhone,
            phoneCountryCode: designPhoneCountryCode,
            address: designAddress,
            socialMedia: designSocialMedia,
            qrCode: designQrCode,
          },
          referenceDesigns: {
            images: designBriefFiles.find(f => f.type === "referenceImages") || null,
            links: designReferenceLinks,
            previousDesigns: designBriefFiles.find(f => f.type === "previousDesigns") || null,
          },
          deadline: {
            date: designDeadline,
            priority: designPriority === "Custom" ? designCustomPriority : designPriority,
          },
          specialInstructions: {
            notes: designAdditionalNotes,
            restrictions: designRestrictions,
            colorPreferences: designColorPrefs,
          },
        };
        
        detailsPayload.designBrief = JSON.stringify(designBrief);
        localDesignRequirement = {
          requirementType,
          requirementNotes,
          requirementFileName: uploadedFiles.requirementFile?.fileName || requirementFileName || "",
          requirementFilePath: uploadedFiles.requirementFile?.filePath || null,
          designProductType: designProductType === "Custom" ? designCustomProductType : designProductType,
          designCustomProductType,
          designSize: designSize === "Custom" ? designCustomSize : designSize,
          designCustomSize,
          designOrientation,
          designNumPages,
          designDescription,
          designPurpose: designPurpose === "Custom" ? designCustomPurpose : designPurpose,
          designCustomPurpose,
          designTargetAudience,
          designStylePref,
          designBrandColors,
          designFonts,
          designBrandGuidelinesFileName: designBriefFiles.find((f) => f.type === "brandGuidelines")?.fileName || designBrandGuidelinesName || "",
          designBrandGuidelinesFilePath: designBriefFiles.find((f) => f.type === "brandGuidelines")?.filePath || null,
          designLogoFileName: designBriefFiles.find((f) => f.type === "logo")?.fileName || designLogoName || "",
          designLogoFilePath: designBriefFiles.find((f) => f.type === "logo")?.filePath || null,
          designImagesFileName: designBriefFiles.find((f) => f.type === "clientImages")?.fileName || designImagesName || "",
          designImagesFilePath: designBriefFiles.find((f) => f.type === "clientImages")?.filePath || null,
          designTextContent,
          designWebsite,
          designPhone,
          designPhoneCountryCode,
          designAddress,
          designSocialMedia,
          designQrCode,
          designReferenceImagesFileName: designBriefFiles.find((f) => f.type === "referenceImages")?.fileName || designReferenceImagesName || "",
          designReferenceImagesFilePath: designBriefFiles.find((f) => f.type === "referenceImages")?.filePath || null,
          designReferenceLinks,
          designPreviousDesignsFileName: designBriefFiles.find((f) => f.type === "previousDesigns")?.fileName || designPreviousDesignsName || "",
          designPreviousDesignsFilePath: designBriefFiles.find((f) => f.type === "previousDesigns")?.filePath || null,
          designDeadline,
          designPriority: designPriority === "Custom" ? designCustomPriority : designPriority,
          designCustomPriority,
          designAdditionalNotes,
          designRestrictions,
          designColorPrefs,
          designBrief: JSON.stringify(designBrief),
        };
      }
      
      // Handle Production brief serialization if applicable
      if (requirementType === "Production" || requirementType === "Design + Production") {
        const productionBrief = {
          productDetails: {
            type: productionProductType === "Custom" ? productionCustomProductType : productionProductType,
            quantity: productionQuantity ? parseInt(productionQuantity) : null,
            pages: productionNumPages ? parseInt(productionNumPages) : null,
          },
          sizeDetails: {
            size: productionPaperSize === "Custom" ? "Custom" : productionPaperSize,
            customWidth: productionPaperSize === "Custom" ? (productionCustomSizeWidth ? parseFloat(productionCustomSizeWidth) : null) : null,
            customHeight: productionPaperSize === "Custom" ? (productionCustomSizeHeight ? parseFloat(productionCustomSizeHeight) : null) : null,
            customUnit: productionCustomSizeUnit,
          },
          paperSpecifications: {
            type: productionPaperType,
            gsm: productionPaperGsm,
          },
          printingSpecifications: {
            colorType: productionColorType,
            printSides: productionPrintSides,
            printingMethod: productionPrintingMethod,
          },
          finishingOptions: productionFinishingOptions || "[]",
          foldingType: productionFoldingType,
          artworkFile: uploadedFiles.productionArtwork ? uploadedFiles.productionArtwork.filePath : productionArtworkFileName,
          additionalNotes: productionAdditionalNotes,
          deadline: {
            printDeadline: productionPrintDeadline,
            deliveryDate: productionDeliveryDate,
            priority: productionPriority,
          },
        };
        
        detailsPayload.productionBrief = JSON.stringify(productionBrief);
        
        // Add artwork file metadata to payload if uploaded
        if (uploadedFiles.productionArtwork) {
          detailsPayload.productionArtworkFileName = uploadedFiles.productionArtwork.fileName;
          detailsPayload.productionArtworkFileType = uploadedFiles.productionArtwork.fileType;
          detailsPayload.productionArtworkFileSize = uploadedFiles.productionArtwork.fileSize;
          detailsPayload.productionArtworkFilePath = uploadedFiles.productionArtwork.filePath;
        }
      }
      
      // Add uploaded files to payload
      if (uploadedFiles.requirementFile) {
        detailsPayload.requirementFileName = uploadedFiles.requirementFile.fileName;
        detailsPayload.requirementFileType = uploadedFiles.requirementFile.fileType;
        detailsPayload.requirementFileSize = uploadedFiles.requirementFile.fileSize;
        detailsPayload.requirementFilePath = uploadedFiles.requirementFile.filePath;
      }
      
      const detailsUpdated = await updateLeadDetails(lead.id, detailsPayload);
      
      // Determine nextGroupId from flow rules
      let nextGroupId = null;
      if (Array.isArray(flowRules)) {
        const targetRule = flowRules.find(
          (r) =>
            String(r?.status || "").trim().toLowerCase() ===
            String(statusValue || "").trim().toLowerCase(),
        );
        if (targetRule?.handledByGroupId != null) {
          nextGroupId = targetRule.handledByGroupId;
        }
      }
      
      const updated = await updateLeadRowStatus(lead.id, statusValue, nextGroupId);
      const mergedLead = { ...(lead || {}), ...detailsUpdated, ...updated };
      setLead(mergedLead);
      if (localDesignRequirement) {
        setDesignRequirement(localDesignRequirement);
      }

      if (String(statusValue || "").trim().toLowerCase() === "budget") {
        try {
          const budgetAssignment = await pickGroupAssignee({
            groupId: nextGroupId,
            currentAssigneeId: lead?.budgetVerificationAssignedToUserId ?? null,
          }).catch(() => ({ assigneeId: null }));
          if (budgetAssignment?.assigneeId) {
            await updateLeadDetails(lead.id, {
              budgetVerificationAssignedToUserId: Number(budgetAssignment.assigneeId),
            });
          } else {
            console.warn("No assignable employee found for budget verification group", nextGroupId);
          }
        } catch (budgetErr) {
          console.warn("Failed to assign budget verification", budgetErr);
        }
      }
      
      // Create production requirement record if applicable
      if (requirementType === "Production" || requirementType === "Design + Production") {
        try {
          const productionPayload = {
            requirementType,
            productType: productionProductType === "Custom" ? productionCustomProductType : productionProductType,
            quantity: Number(productionQuantity),
            numPages: productionNumPages ? Number(productionNumPages) : null,
            paperSize: productionPaperSize === "Custom" ? `Custom: ${productionCustomSizeWidth}${productionCustomSizeUnit}x${productionCustomSizeHeight}${productionCustomSizeUnit}` : productionPaperSize,
            customSizeWidth: productionCustomSizeWidth,
            customSizeHeight: productionCustomSizeHeight,
            customSizeUnit: productionCustomSizeUnit,
            paperType: productionPaperType,
            paperGsm: productionPaperGsm,
            colorType: productionColorType,
            printSides: productionPrintSides,
            printingMethod: productionPrintingMethod,
            finishingOptions: productionFinishingOptions,
            foldingType: productionFoldingType,
            artworkFileName: uploadedFiles.productionArtwork?.fileName || productionArtworkFileName,
            artworkFilePath: uploadedFiles.productionArtwork?.filePath || null,
            additionalNotes: productionAdditionalNotes,
            printDeadline: productionPrintDeadline ? new Date(productionPrintDeadline).toISOString() : null,
            deliveryDate: productionDeliveryDate ? new Date(productionDeliveryDate).toISOString() : null,
            priority: productionPriority,
            leadId: lead.id,
          };

          if (productionAssignment?.assigneeId) {
            productionPayload.assignedTo = Number(productionAssignment.assigneeId);
          }
          
          const createdReq = await createProductionRequirement(lead.id, productionPayload);
          console.log("✓ Production requirement created successfully", createdReq);
          
          // Add requirement to local state immediately for display
          if (createdReq) {
            setProductionRequirements([createdReq]);
          } else {
            // If no response, construct from payload
            setProductionRequirements([productionPayload]);
          }
          
          // Also try to reload from backend for consistency
          try {
            const requirements = await getProductionRequirements(lead.id);
            // Only update from backend if we actually get data back
            if (Array.isArray(requirements) && requirements.length > 0) {
              setProductionRequirements(requirements);
            } else {
              console.warn("Backend returned empty requirements list, keeping local copy");
            }
          } catch (err) {
            console.warn("Failed to reload requirements from backend (404), using local data", err);
            // Keep local data if backend fetch fails
          }
        } catch (prodErr) {
          console.warn("Failed to create production requirement but continuing", prodErr);
        }
      }

      if (requirementType === "Design" || requirementType === "Design + Production") {
        try {
          const latestDesignRequirement = await getDesignRequirement(lead.id);
          setDesignRequirement(latestDesignRequirement || null);
        } catch (designErr) {
          console.warn("Failed to reload design requirement after save", designErr);
        }
      }
      
      showSuccess("Requirement submitted successfully");
        // Stay on the requirement tab so the saved details are visible immediately
        setActiveTab("requirement");
        setShowRequirementModal(false);
      if (exitEditIfOwnershipMoved(mergedLead)) return;
    } catch (e) {
      showError(extractApiErrorMessage(e, "Failed to submit requirement"));
    } finally {
      setRequirementSaving(false);
    }
  };

  const downloadProtectedFile = async (filePath, fileName, fallbackMessage) => {
    if (!filePath || !fileName) return;
    try {
      const response = await api.get(filePath, {
        responseType: "blob",
      });
      const blobUrl = window.URL.createObjectURL(response.data);
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(blobUrl);
    } catch (e) {
      const message = extractApiErrorMessage(e, fallbackMessage);
      showError(message);
    }
  };

  const downloadRequirementFile = async () => {
    if (!lead?.id || !lead?.requirementFileName) return;
    if (lead?.requirementFilePath) {
      await downloadProtectedFile(
        lead.requirementFilePath,
        lead.requirementFileName,
        "Failed to download requirement file",
      );
      return;
    }
    try {
      const { blob } = await downloadLeadRequirementFile(lead.id);
      if (!blob) {
        showError("Requirement file not available");
        return;
      }
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = lead.requirementFileName || `requirement-${lead.id}`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(blobUrl);
    } catch (e) {
      showError(extractApiErrorMessage(e, "Failed to download requirement file"));
    }
  };

  const handleStatusChange = (newStatus) => {
    setStatusValue(newStatus);
    
    // Open appropriate modal based on selected status
    if (!newStatus) return;
    
    const normalizedStatus = String(newStatus || "").trim().toLowerCase();
    
    if (normalizedStatus === "attempted") {
      setShowAttemptedModal(true);
    } else if (normalizedStatus === "interested") {
      setShowInterestedModal(true);
    } else if (normalizedStatus === "rejected") {
      setShowRejectedModal(true);
    } else if (normalizedStatus === "requirement") {
      setShowRequirementModal(true);
    } else if (normalizedStatus === "allocate") {
      setShowAllocateModal(true);
    }
  }; // handleStatusChange


  const uploadFinalDesign = async () => {
    if (!lead?.id) return;
    if (!designUploadFile) {
      showError("Please choose a design file");
      return;
    }
    setSaving(true);
    try {
      const response = await sendLeadChatAttachment(lead.id, {
        threadType: "CUSTOMER",
        message: `${DESIGN_THREAD_MARKER}\nFinal design uploaded`,
        file: designUploadFile,
      });
      setFinalDesignMessage({
        id: response?.id,
        attachmentName: designUploadFile?.name || "",
        message: response?.message,
      });
      setDesignUploadFile(null);
      showSuccess("Final design uploaded");
    } catch (e) {
      showError(extractApiErrorMessage(e, "Failed to upload final design"));
    } finally {
      setSaving(false);
    }
  };


  const handleViewFinalDesign = async () => {
    if (!lead?.id || !finalDesignMessage?.id) {
      showError("Final design file not available");
      return;
    }
    try {
      const blob = await downloadLeadChatAttachment(lead.id, finalDesignMessage.id);
      if (!blob) {
        showError("Final design file not available");
        return;
      }
      const url = URL.createObjectURL(blob);
      window.open(url, "_blank", "noopener,noreferrer");
      setTimeout(() => URL.revokeObjectURL(url), 10000);
    } catch (e) {
      showError(extractApiErrorMessage(e, "Failed to open final design file"));
    }
  };

  const submitDesignDuration = async () => {
    if (!lead?.id) return;
    if (!designStartAt || !designEndAt) {
      showError("Please select design start and end");
      return;
    }
    setSaving(true);
    try {
      const updated = await updateLeadDetails(lead.id, {
        designStartAt,
        designEndAt,
      });
      setLead((prev) => ({
        ...(prev || {}),
        ...updated,
        designStartAt: updated?.designStartAt || designStartAt,
        designEndAt: updated?.designEndAt || designEndAt,
      }));
      setDesignStartAt(toInputDateTime(updated?.designStartAt || designStartAt));
      setDesignEndAt(toInputDateTime(updated?.designEndAt || designEndAt));
      showSuccess("Design duration updated");
      setShowDesignDurationModal(false);
    } catch (e) {
      showError(extractApiErrorMessage(e, "Failed to update design duration"));
    } finally {
      setSaving(false);
    }
  };

  const handleAddAddress = useCallback(async (addressFormData) => {
    if (!lead?.id) return;

    // Validate phone number using configured country rules
    const phoneValidationError = validatePhoneNumber(addressFormData.phone, addressFormData.countryCode);
    if (phoneValidationError) {
      showError(phoneValidationError);
      return;
    }

    // Validate GSTIN if provided (12 alphanumeric)
    if (addressFormData.gstin && !/^[A-Za-z0-9]{12}$/.test(addressFormData.gstin)) {
      showError("GSTIN must be 12 alphanumeric characters");
      return;
    }

    // Validate email if provided
    if (addressFormData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(addressFormData.email)) {
      showError("Invalid email format");
      return;
    }

    setAddressLoading(true);
    try {
      const payload = {
        type: newAddressType,
        contactPersonName: addressFormData.contactPersonName,
        companyName: addressFormData.companyName || null,
        gstin: addressFormData.gstin || null,
        countryCode: addressFormData.countryCode,
        phone: addressFormData.phone,
        email: addressFormData.email || null,
        addressLine1: addressFormData.addressLine1,
        addressLine2: addressFormData.addressLine2 || null,
        city: addressFormData.city,
        state: addressFormData.state,
        pincode: addressFormData.pincode,
        country: addressFormData.country,
        isPrimary: addressFormData.isPrimary,
      };

      const newAddress = await createAddress(lead.id, payload);

      // Refresh addresses list
      const type = newAddressType;
      if (type === "BILLING") {
        const addressesResponse = await getAddressesByLeadIdAndType(lead.id, "BILLING");
        setBillingAddresses(addressesResponse);
        // Auto-select the new address
        setSelectedBillingAddressId(newAddress.id);
      } else {
        const addressesResponse = await getAddressesByLeadIdAndType(lead.id, "SHIPPING");
        setShippingAddresses(addressesResponse);
        // Auto-select the new address
        setSelectedShippingAddressId(newAddress.id);
      }

      showSuccess(`${newAddressType === "BILLING" ? "Billing" : "Shipping"} address added successfully`);
      setShowAddAddressModal(false);
    } catch (e) {
      showError(extractApiErrorMessage(e, `Failed to add ${newAddressType === "BILLING" ? "billing" : "shipping"} address`));
    } finally {
      setAddressLoading(false);
    }
  }, [lead?.id, newAddressType, showError, showSuccess]);

  const submitVerifyDetails = async () => {
    if (!lead?.id) return;
    if (!selectedBillingAddressId) {
      showError("Please select a billing address");
      return;
    }
    if (!parsedInvoice && !verifyFile) {
      showError("Invoice not found. Please upload a payment proof file or ensure invoice exists");
      return;
    }
    setSaving(true);
    try {
      let uploadedProof = null;
      let invoiceAttachment = null;

      // Upload invoice PDF automatically
      if (parsedInvoice) {
        try {
          const doc = new jsPDF();
          const pageWidth = doc.internal.pageSize.getWidth();
          const pageMargin = 15;
          const invoiceNumber = `INV-${lead.leadId || lead.id}`;

          doc.text("INVOICE", pageMargin, 15);
          doc.text(`Company: ${lead.companyName || ""}`, pageMargin, 22);
          doc.text(`Invoice #: ${invoiceNumber}`, pageWidth - pageMargin - 60, 25);
          doc.text(`Date: ${parsedInvoice.createdAt ? new Date(parsedInvoice.createdAt).toLocaleDateString("en-IN") : new Date().toLocaleDateString("en-IN")}`, pageWidth - pageMargin - 60, 30);

          const itemsWithTotals = (parsedInvoice.items || []).map(item => ({
            description: item.description || "",
            quantity: item.quantity || 1,
            unitPrice: item.unitPrice || 0,
            total: (item.quantity || 1) * (item.unitPrice || 0),
          }));

          autoTable(doc, {
            startY: 40,
            head: [["Description", "Qty", "Unit Price", "Total"]],
            body: itemsWithTotals.map(item => [
              item.description,
              item.quantity,
              item.unitPrice,
              item.total,
            ]),
            margin: { left: pageMargin, right: pageMargin },
          });

          const finalY = (doc.lastAutoTable?.finalY) || 100;
          const t = parsedInvoice.totals || {};
          doc.text(`Subtotal: ${(t.subtotal || 0).toFixed(2)}`, pageWidth - pageMargin - 40, finalY + 10);
          doc.text(`CGST (${lead.invoiceCgstPercent || 0}%): ${(t.cgst || 0).toFixed(2)}`, pageWidth - pageMargin - 40, finalY + 17);
          doc.text(`SGST (${lead.invoiceSgstPercent || 0}%): ${(t.sgst || 0).toFixed(2)}`, pageWidth - pageMargin - 40, finalY + 24);
          doc.text(`Total: ${(t.total || 0).toFixed(2)}`, pageWidth - pageMargin - 40, finalY + 31);

          const pdfBlob = doc.output("blob");
          const pdfFile = new File([pdfBlob], `Invoice-${invoiceNumber}.pdf`, { type: "application/pdf" });

          invoiceAttachment = await sendLeadChatAttachment(lead.id, {
            threadType: "INTERNAL",
            message: "Invoice attached for payment verification",
            file: pdfFile,
          });
        } catch (invoiceErr) {
          console.warn("Failed to generate/attach invoice PDF", invoiceErr);
        }
      }

      // Upload payment proof if provided
      if (verifyFile) {
        uploadedProof = await uploadLeadPaymentProof(lead.id, verifyFile);
      }

      const payload = {
        paymentProofFileName: uploadedProof?.fileName || verifyFileName || null,
        paymentProofFilePath: uploadedProof?.filePath || null,
        paymentProofNotes: verifyNotes || null,
        paymentVerificationStatus: "PENDING",
        paymentVerificationBillingAddressId: selectedBillingAddressId,
        paymentVerificationShippingAddressId: shipSame ? selectedBillingAddressId : selectedShippingAddressId,
        // Store the amount being verified - backend will add it to paidAmount on APPROVE
        paymentVerificationAmount: verifyPaidAmount ? Number(verifyPaidAmount) : null,
        // Snapshot the current invoice as the payment verified invoice (overrides on resubmit)
        paymentVerifiedInvoiceData: lead.invoiceData || null,
      };
      const updated = await updateLeadDetails(lead.id, payload);
      setLead((prev) => ({ ...(prev || {}), ...updated }));
      showSuccess("Verification sent with invoice");
      setShowVerifyModal(false);
      setActiveTab("payment");
      // Reset form
      setShipSame(false);
      setSelectedBillingAddressId(null);
      setSelectedShippingAddressId(null);
      setVerifyFile(null);
      setVerifyFileName("");
      setVerifyNotes("");
      if (exitEditIfOwnershipMoved(updated)) return;
    } catch (e) {
      showError(extractApiErrorMessage(e, "Failed to submit payment verification"));
    } finally {
      setSaving(false);
    }
  };

  // Memoized event handlers for payment verification modal to prevent unnecessary re-renders
  const handleVerifyPaidAmountChange = useCallback((e) => {
    setVerifyPaidAmount(e.target.value);
  }, []);

  const handleVerifyNotesChange = useCallback((e) => {
    setVerifyNotes(e.target.value);
  }, []);

  const handleVerifyFileChange = useCallback((e) => {
    const file = e.target.files?.[0] || null;
    setVerifyFile(file);
    setVerifyFileName(file?.name || "");
  }, []);

  const handleBillingAddressChange = useCallback(
    (id) => {
      setSelectedBillingAddressId(id);
      if (shipSame) {
        setSelectedShippingAddressId(id);
      }
    },
    [shipSame]
  );

  const handleShipSameChange = useCallback((e) => {
    const checked = e.target.checked;
    setShipSame(checked);
    setSelectedShippingAddressId(checked ? selectedBillingAddressId : null);
  }, [selectedBillingAddressId]);

  const handleShippingAddressChange = useCallback((id) => {
    setSelectedShippingAddressId(id);
  }, []);

  const handleAddBillingAddress = useCallback(() => {
    setNewAddressType("BILLING");
    setShowAddAddressModal(true);
  }, []);

  const handleAddShippingAddress = useCallback(() => {
    setNewAddressType("SHIPPING");
    setShowAddAddressModal(true);
  }, []);

  const handleCloseVerifyModal = useCallback(() => {
    setShowVerifyModal(false);
  }, []);

  const submitMoneyDetails = async () => {
    if (!lead?.id) return;
    setSaving(true);
    try {
      const updated = await updateLeadDetails(lead.id, {
        totalAmount: totalAmount || null,
        paidAmount: paidAmount || null,
        remainingAmount: remainingAmount || null,
      });
      setLead((prev) => ({ ...(prev || {}), ...updated }));
      showSuccess("Money details updated");
    } catch (e) {
      showError(extractApiErrorMessage(e, "Failed to update money details"));
    } finally {
      setSaving(false);
    }
  };

  const saveLeadType = async (nextValue) => {
    if (!lead?.id) return;
    setTypeSaving(true);
    try {
      const updated = await updateLeadDetails(lead.id, { leadType: nextValue });
      setLead((prev) => ({ ...(prev || {}), ...updated }));
      showSuccess("Lead type updated");
    } catch (e) {
      showError(extractApiErrorMessage(e, "Failed to update lead type"));
    } finally {
      setTypeSaving(false);
    }
  };

  const saveLeadDetails = async () => {
    if (!lead?.id) return;
    const alternatePhoneValue = String(alternatePhone || "").trim();
    if (alternatePhoneValue) {
      const alternatePhoneValidation = validatePhoneNumber(alternatePhoneValue, countryCode);
      if (alternatePhoneValidation) {
        showError(alternatePhoneValidation);
        return;
      }
    }
    setDetailsSaving(true);
    try {
      const payload = {
        alternatePhone: alternatePhoneValue || null,
        alternateEmail: alternateEmail || null,
        countryCode: countryCode || null,
        followUpDate: followUpDate ? new Date(followUpDate).toISOString() : null,
        occupation: occupation || null,
        companyName: companyName || null,
        attemptedOpenReason: isAttempted ? attemptedOpenReason || null : null,
        attemptedCallStatus: isAttempted ? attemptedCallStatus || null : null,
        attemptedCallRemarks: isAttempted ? attemptedCallRemarks || null : null,
        interestedFollowUpDate: isInterested
          ? interestedFollowUpDate
            ? new Date(interestedFollowUpDate).toISOString()
            : null
          : null,
        interestedCallRemarks: isInterested ? interestedCallRemarks || null : null,
        rejectedReason: isRejected ? rejectedReason || null : null,
        rejectedReasonSubtype: isRejected ? rejectedReasonSubtype || null : null,
        totalAmount: totalAmount || null,
        paidAmount: paidAmount || null,
        remainingAmount: remainingAmount || null,
        budgetInvoiceSent: budgetInvoiceSent,
        paymentInvoiceSent: paymentInvoiceSent,
        designStartAt: designStartAt || null,
        designEndAt: designEndAt || null,
      };
      const updated = await updateLeadDetails(lead.id, payload);
      setLead((prev) => ({
        ...(prev || {}),
        ...updated,
        // Preserve the current status here; save details should not move the lead.
        // The dedicated status workflow handles status transitions.
        status: prev?.status ?? updated?.status ?? null,
      }));
      showSuccess("Lead details updated");
    } catch (e) {
      showError(extractApiErrorMessage(e, "Failed to update lead details"));
    } finally {
      setDetailsSaving(false);
    }
  };

  const handleStockRequestSubmit = async ({ leadId, leadName, items }) => {
    if (!leadId) return;
    setStockRequestSubmitting(true);
    try {
      const payload = {
        leadId,
        leadName: leadName || lead?.leadName || lead?.name || "",
        requestedBy: user?.id,
        items,
      };
      const req = await createStockRequest(payload);
      if (req?.id) {
        // Update lead status to "Stock Request"
        try {
          await updateLeadRowStatus(leadId, "Stock Request");
        } catch (statusErr) {
          console.error("Failed to update lead status to Stock Request:", statusErr);
          // Continue anyway - stock request was created successfully
        }
        setShowStockRequestModal(false);
      }
    } catch (err) {
      const message = extractApiErrorMessage(err, "Failed to create stock request");
      showError(message);
    } finally {
      setStockRequestSubmitting(false);
    }
  };

  return (
    <div className="container-fluid">

      <div className="d-flex align-items-center justify-content-between mb-3">
        <div>
          <h3 className="mb-1">Edit Lead</h3>
          <p className="text-muted mb-0">View lead details and status</p>
        </div>
        <button className="btn btn-light" onClick={() => navigate("/leads")}>
          Back to Leads
        </button>
      </div>

      {isConverted && (
        <div className="alert alert-success mb-3" role="alert">
          <strong>Lead converted to Deal.</strong> This lead is now locked. Continue the process from the Deals page.
        </div>
      )}

      <div className="d-flex flex-column flex-sm-row align-items-sm-center justify-content-between mb-3">
        <div className="lead-status-current">
          <span className="text-muted">Current status:&nbsp;</span>
          <span className="badge bg-primary">{effectiveStatus || "N/A"}</span>
        </div>
      </div>
      <div className="card mb-3 border">
        <div className="card-body">
          <h5 className="mb-3">Status Timeline</h5>
          {timelineEntries.length === 0 ? (
            <div className="text-muted">No status history yet.</div>
          ) : (
            <div className="lead-status-timeline-horizontal">
              {timelineEntries.map((item, index) => {
                const isLatest = index === timelineEntries.length - 1;
                return (
                  <div
                    key={item.key || `${item.statusKey}-${index}`}
                    className="lead-status-step-horizontal position-relative"
                  >
                    <div
                      className={`lead-status-step-item ${isLatest ? "is-current" : "is-previous"}`}
                      style={{
                        animationDelay: `${index * 420}ms`,
                        "--step-delay": `${index * 420}ms`,
                      }}
                    >
                      <div className="lead-status-step-label">
                        <div
                          className={`lead-status-dot ${isLatest ? "is-current" : "is-previous"}`}
                        />
                        <span>{item.label}</span>
                      </div>
                      <div className="lead-status-step-meta">
                        {formatDateTime(item.createdAt)}
                        {item.actor ? <div>by {item.actor}</div> : null}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <div className="card">
        <div className="card-body">
          {loading ? (
            <div>Loading...</div>
          ) : !lead ? (
            <div className="text-muted">Lead not found.</div>
          ) : (
            <div className="row g-4">
              {!isEmployeeDesignView && (
              <div className="col-lg-7">
                <ul className="nav nav-tabs mb-3" role="tablist" style={{ overflowX: "auto", display: "flex", flexWrap: "nowrap" }}>
                  <li className="nav-item" role="presentation">
                    <button
                      className={`nav-link ${activeTab === "general" ? "active" : ""}`}
                      id="general-tab"
                      onClick={() => setActiveTab("general")}
                      type="button"
                      role="tab"
                      aria-selected={activeTab === "general"}
                    >
                      General Info
                    </button>
                  </li>
                  {showAttemptedSummary && (
                  <li className="nav-item" role="presentation">
                    <button
                      className={`nav-link ${activeTab === "attempted" ? "active" : ""}`}
                      id="attempted-tab"
                      onClick={() => setActiveTab("attempted")}
                      type="button"
                      role="tab"
                      aria-selected={activeTab === "attempted"}
                    >
                      Attempted
                    </button>
                  </li>
                  )}
                  {showInterestedSummary && (
                  <li className="nav-item" role="presentation">
                    <button
                      className={`nav-link ${activeTab === "interested" ? "active" : ""}`}
                      id="interested-tab"
                      onClick={() => setActiveTab("interested")}
                      type="button"
                      role="tab"
                      aria-selected={activeTab === "interested"}
                    >
                      Interested
                    </button>
                  </li>
                  )}
                  {showRequirementSummary && (
                  <li className="nav-item" role="presentation">
                    <button
                      className={`nav-link ${activeTab === "requirement" ? "active" : ""}`}
                      id="requirement-tab"
                      onClick={() => setActiveTab("requirement")}
                      type="button"
                      role="tab"
                      aria-selected={activeTab === "requirement"}
                    >
                      Requirement
                    </button>
                  </li>
                  )}
                  {(statusLower === "budget" || lead?.budgetVerificationStatus) && (
                  <li className="nav-item" role="presentation">
                    <button
                      className={`nav-link ${activeTab === "budget" ? "active" : ""}`}
                      id="budget-tab"
                      onClick={() => setActiveTab("budget")}
                      type="button"
                      role="tab"
                      aria-selected={activeTab === "budget"}
                    >
                      Budget
                    </button>
                  </li>
                  )}
                  {isRejected && (
                  <li className="nav-item" role="presentation">
                    <button
                      className={`nav-link ${activeTab === "rejected" ? "active" : ""}`}
                      id="rejected-tab"
                      onClick={() => setActiveTab("rejected")}
                      type="button"
                      role="tab"
                      aria-selected={activeTab === "rejected"}
                    >
                      Rejected
                    </button>
                  </li>
                  )}
                  {showPaymentSummary && statusLower !== "budget" && (
                  <li className="nav-item" role="presentation">
                    <button
                      className={`nav-link ${activeTab === "payment" ? "active" : ""}`}
                      id="payment-tab"
                      onClick={() => setActiveTab("payment")}
                      type="button"
                      role="tab"
                      aria-selected={activeTab === "payment"}
                    >
                      {isProduction ? "Production" : "Payment"}
                    </button>
                  </li>
                  )}
                </ul>

                {activeTab === "general" && (
                <div className="tab-pane fade show active">
                  <div className="mb-4">
                    <div className="d-flex justify-content-between align-items-center mb-3">
                      <h5 className="mb-0">General Info</h5>
                      <div className="d-flex gap-2">
                        <button type="button" className="btn btn-sm btn-outline-success" onClick={handleExportGeneralInfoExcel}>
                          <i className="ti ti-file-spreadsheet me-1"></i>Excel
                        </button>
                        <button type="button" className="btn btn-sm btn-outline-danger" onClick={handleExportGeneralInfoPDF}>
                          <i className="ti ti-file-type-pdf me-1"></i>PDF
                        </button>
                      </div>
                    </div>
                    <div className="row g-3">
                      <div className="col-md-6">
                        <label className="form-label">Enquiry Id</label>
                        <input
                          className="form-control"
                          value={
                            pickText(lead, [
                              "enquiryId",
                              "enquiryID",
                              "leadId",
                              "leadID",
                              "lead_id",
                              "enquiryCode",
                              "enquiry_code",
                            ]) || "-"
                          }
                          readOnly
                        />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label">EUID</label>
                        <input
                          className="form-control"
                          value={pickText(lead, ["euid"]) || "-"}
                          readOnly
                        />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label">Enquiry Name</label>
                        <input className="form-control" value={lead.name || ""} readOnly />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label">Country Code</label>
                        <select
                          className="form-select"
                          value={countryCode}
                          onChange={(e) => {
                            const nextCountryCode = e.target.value;
                            setCountryCode(nextCountryCode);
                            setAlternatePhone((currentValue) =>
                              sanitizePhoneDigits(
                                currentValue,
                                getCountryOptionByValue(nextCountryCode)?.maxLength,
                                getCountryAllowedLengths(nextCountryCode),
                              ),
                            );
                          }}
                          disabled={lockAfterAttempted || isLeadReadOnly}
                        >
                          <option value="">Select Country Code</option>
                          {COUNTRY_CODES.map((item) => (
                            <option key={`${item.code}-${item.name}`} value={item.code}>
                              {item.name} ({item.code})
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="col-md-6">
                        <label className="form-label">Mobile Number</label>
                        <input className="form-control" value={lead.mobile || ""} readOnly />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label">Email</label>
                        <input className="form-control" value={lead.email || ""} readOnly />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label">Enquiry Project</label>
                        <input className="form-control" value={lead.projectName || ""} readOnly />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label">Alternate No.</label>
                        <input
                          className="form-control"
                          value={alternatePhone}
                          onChange={(e) =>
                            setAlternatePhone(
                              sanitizePhoneDigits(
                                e.target.value,
                                alternatePhoneCountryOption?.maxLength,
                                alternatePhoneAllowedLengths,
                              ),
                            )
                          }
                          maxLength={alternatePhoneDisplayMaxLength || undefined}
                          readOnly={lockAfterAttempted || isLeadReadOnly}
                        />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label">Alternate Email</label>
                        <input
                          className="form-control"
                          value={alternateEmail}
                          onChange={(e) => setAlternateEmail(e.target.value)}
                          readOnly={lockAfterAttempted || isLeadReadOnly}
                        />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label">Occupation</label>
                        <input
                          className="form-control"
                          value={occupation}
                          onChange={(e) => setOccupation(e.target.value)}
                          readOnly={lockAfterAttempted || isLeadReadOnly}
                        />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label">Company Name</label>
                        <input
                          className="form-control"
                          value={companyName}
                          onChange={(e) => setCompanyName(e.target.value)}
                          readOnly={lockAfterAttempted || isLeadReadOnly}
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <h5 className="mb-3">Lead Overview</h5>
                    <div className="row g-3">
                      <div className="col-md-6">
                        <label className="form-label">Lead Group</label>
                        <input
                          className="form-control"
                          value={pickText(lead, ["leadGroupName", "groupName"]) || "-"}
                          readOnly
                        />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label">Rating</label>
                        <select
                          className="form-select"
                          value={leadTypeValue}
                          onChange={(e) => {
                            const next = e.target.value;
                            setLeadTypeValue(next);
                            saveLeadType(next);
                          }}
                          disabled={typeSaving || isLeadReadOnly}
                        >
                          <option value="">Select Rating</option>
                          {leadTypeOptions.map((item) => (
                            <option key={item} value={item}>
                              {item}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="col-md-6">
                        <label className="form-label">Allocator</label>
                        <input
                          className="form-control"
                          value={
                            pickText(lead, [
                              "Allocator",
                              "allocator",
                              "allocatorName",
                              "createdByName",
                              "createdBy",
                              "createdByUsername",
                              "creator",
                            ]) || "-"
                          }
                          readOnly
                        />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label">Lead Owner</label>
                        <input
                          className="form-control"
                          value={
                            pickText(lead, [
                              "ownerName",
                              "owner",
                              "ownerUsername",
                              "ownerUserName",
                            ]) || "-"
                          }
                          readOnly
                        />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label">Enquiry Status</label>
                        <input className="form-control" value={lead.status || ""} readOnly />
                      </div>
                    </div>
                  </div>
                </div>
                )}

                <>
                {activeTab === "attempted" && showAttemptedSummary && (
                <div className="tab-pane fade show active">
                  <div>
                    <h5 className="mb-3">Attempted Details</h5>
                    <div className="row g-3">
                      {String(attemptedCallStatus || "")
                        .trim()
                        .toLowerCase() === "follow up" && (
                        <div className="col-md-6">
                          <label className="form-label">Follow Up Date</label>
                          <input
                            className="form-control"
                            type="datetime-local"
                            value={followUpDate}
                            onChange={(e) => setFollowUpDate(e.target.value)}
                            readOnly={!isAttempted}
                          />
                        </div>
                      )}
                      <div className="col-md-6">
                        <label className="form-label">Open Reason</label>
                        {isAttempted ? (
                          <select
                            className="form-select"
                            value={attemptedOpenReason}
                            onChange={(e) => setAttemptedOpenReason(e.target.value)}
                          >
                            <option value="">Select Open Reason</option>
                            <option value="Contacted">Contacted</option>
                            <option value="Shared Details">Shared Details</option>
                            <option value="Retry">Retry</option>
                          </select>
                        ) : (
                          <input
                            className="form-control"
                            value={attemptedOpenReason || "-"}
                            readOnly
                          />
                        )}
                      </div>
                      <div className="col-md-6">
                        <label className="form-label">Call Status</label>
                        {isAttempted ? (
                          <select
                            className="form-select"
                            value={attemptedCallStatus}
                            onChange={(e) => {
                              const next = e.target.value;
                              setAttemptedCallStatus(next);
                              if (String(next || "").trim().toLowerCase() !== "follow up") {
                                setAttemptedFollowUpDate("");
                              }
                            }}
                          >
                            <option value="">Select Call Status</option>
                            <option value="RNR">RNR</option>
                            <option value="Call Connected">Call Connected</option>
                            <option value="Follow Up">Follow Up</option>
                            <option value="Number Busy">Number Busy</option>
                            <option value="Not Reachable">Not Reachable</option>
                            <option value="Switched Off">Switched Off</option>
                            <option value="Number Not In Use">Number Not In Use</option>
                            <option value="Wrong Number">Wrong Number</option>
                          </select>
                        ) : (
                          <input
                            className="form-control"
                            value={attemptedCallStatus || "-"}
                            readOnly
                          />
                        )}
                      </div>
                      <div className="col-md-12">
                        <label className="form-label">Call Remarks</label>
                        {isAttempted ? (
                          <textarea
                            className="form-control"
                            rows={3}
                            value={attemptedCallRemarks}
                            onChange={(e) => setAttemptedCallRemarks(e.target.value)}
                            placeholder="Call Remarks"
                          />
                        ) : (
                          <textarea
                            className="form-control"
                            rows={3}
                            value={attemptedCallRemarks || "-"}
                            readOnly
                          />
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                )}

                {activeTab === "interested" && showInterestedSummary && (
                <div className="tab-pane fade show active">
                  <div>
                    <h5 className="mb-3">Interested Details</h5>
                    <div className="row g-3">
                      <div className="col-md-6">
                        <label className="form-label">Follow Up Date</label>
                        <input
                          className="form-control"
                          type="datetime-local"
                          value={interestedFollowUpDate}
                          onChange={(e) => setInterestedFollowUpDate(e.target.value)}
                          readOnly={isLeadReadOnly}
                        />
                      </div>
                      <div className="col-md-12">
                        <label className="form-label">Call Remarks</label>
                        <textarea
                          className="form-control"
                          rows={3}
                          value={interestedCallRemarks}
                          onChange={(e) => setInterestedCallRemarks(e.target.value)}
                          placeholder="Call Remarks"
                          readOnly={isLeadReadOnly}
                        />
                      </div>
                    </div>
                  </div>
                </div>
                )}

                {activeTab === "boq" && showBoqSummary && (
                <div className="tab-pane fade show active">
                  <div>
                    <h5 className="mb-3">Customer Login Info</h5>
                    <div className="row g-3">
                      <div className="col-md-6">
                        <label className="form-label">Email</label>
                        <input className="form-control" value={lead.email || "-"} readOnly />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label">Password</label>
                        <input className="form-control" value={DEFAULT_CUSTOMER_LOGIN_PASSWORD} readOnly />
                      </div>
                      <div className="col-12">
                        <div className="text-muted small">
                          Customer is forced to change this password on first login.
                        </div>
                      </div>
                      <div className="col-12 d-flex justify-content-center">
                        <button
                          className="btn btn-outline-primary btn-sm"
                          type="button"
                        >
                          <i className="ti ti-share me-1" />
                          Share
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
                )}

                {activeTab === "requirement" && showRequirementSummary && (
                <div className="tab-pane fade show active">
                  {/* General Requirement Details */}
                  {(requirementTypeValue || requirementNotesValue || requirementFileNameValue) && (
                    <div className="card mb-3">
                      <div className="card-body">
                        <div className="row g-3">
                          <div className="col-md-4">
                            <label className="form-label fw-semibold">Requirement Type</label>
                            <input className="form-control form-control-sm" value={requirementTypeValue || "-"} readOnly />
                          </div>
                          <div className="col-md-8">
                            <label className="form-label fw-semibold">Requirement Notes</label>
                            <textarea className="form-control form-control-sm" value={requirementNotesValue || "-"} readOnly rows={3} />
                          </div>
                          {requirementFileNameValue && (
                            <div className="col-12">
                              <label className="form-label fw-semibold">Requirement File</label>
                              <div className="py-2 d-flex flex-wrap gap-2 align-items-center">
                                <span className="text-break">{requirementFileNameValue}</span>
                                <button
                                  type="button"
                                  className="btn btn-sm btn-outline-info"
                                  onClick={() => setPreviewFile({ fileName: requirementFileNameValue, filePath: requirementFilePathValue })}
                                  disabled={!requirementFilePathValue}
                                >
                                  Preview
                                </button>
                                <button
                                  type="button"
                                  className="btn btn-sm btn-outline-secondary"
                                  onClick={() => {
                                    if (requirementFilePathValue) {
                                      downloadRequirementFile();
                                    }
                                  }}
                                  disabled={!requirementFilePathValue}
                                >
                                  Download
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
              
                  {/* Production Requirements Section */}
                  {productionRequirements.length > 0 && (
                  <div className="mt-5">
                    <h5 className="mb-3">
                      <i className="ti ti-box me-2"></i>Production Requirement Details
                    </h5>
                    {productionRequirements.map((req, idx) => {
                      const prodBrief = parseProductionBrief(req.productionBrief);
                      return (
                          <div key={req.id || idx} className="card mb-3">
                            <div className="card-body">
                              <div className="row g-3">
                                {/* Type & Product */}
                                <div className="col-md-4">
                                  <label className="form-label fw-semibold">Requirement Type</label>
                                  <input className="form-control form-control-sm" value={req.requirementType || "-"} readOnly />
                                </div>
                                <div className="col-md-4">
                                  <label className="form-label fw-semibold">Product Type</label>
                                  <input className="form-control form-control-sm" value={req.productType || "-"} readOnly />
                                </div>
                                <div className="col-md-4">
                                  <label className="form-label fw-semibold">Quantity</label>
                                  <input className="form-control form-control-sm" value={req.quantity || "-"} readOnly />
                                </div>

                                {/* Paper Details */}
                                <div className="col-md-4">
                                  <label className="form-label fw-semibold">Paper Size</label>
                                  <input className="form-control form-control-sm" value={req.paperSize || "-"} readOnly />
                                </div>
                                <div className="col-md-4">
                                  <label className="form-label fw-semibold">Paper Type</label>
                                  <input className="form-control form-control-sm" value={req.paperType || "-"} readOnly />
                                </div>
                                <div className="col-md-4">
                                  <label className="form-label fw-semibold">GSM</label>
                                  <input className="form-control form-control-sm" value={req.paperGsm || "-"} readOnly />
                                </div>

                                {/* Color & Print */}
                                <div className="col-md-4">
                                  <label className="form-label fw-semibold">Color Type</label>
                                  <input className="form-control form-control-sm" value={req.colorType || "-"} readOnly />
                                </div>
                                <div className="col-md-4">
                                  <label className="form-label fw-semibold">Print Sides</label>
                                  <input className="form-control form-control-sm" value={req.printSides || "-"} readOnly />
                                </div>
                                <div className="col-md-4">
                                  <label className="form-label fw-semibold">Printing Method</label>
                                  <input className="form-control form-control-sm" value={req.printingMethod || "-"} readOnly />
                                </div>

                                {/* Finishing Options */}
                                <div className="col-md-6">
                                  <label className="form-label fw-semibold">Finishing Options</label>
                                  <textarea className="form-control form-control-sm" value={req.finishingOptions || "-"} readOnly rows={2} />
                                </div>
                                <div className="col-md-6">
                                  <label className="form-label fw-semibold">Folding Type</label>
                                  <input className="form-control form-control-sm" value={req.foldingType || "-"} readOnly />
                                </div>

                                {/* Priority & Dates */}
                                <div className="col-md-4">
                                  <label className="form-label fw-semibold">Priority</label>
                                  <input className="form-control form-control-sm" value={req.priority || "-"} readOnly />
                                </div>
                                <div className="col-md-4">
                                  <label className="form-label fw-semibold">Print Deadline</label>
                                  <input className="form-control form-control-sm" value={req.printDeadline ? formatDateTime(req.printDeadline) : "-"} readOnly />
                                </div>
                                <div className="col-md-4">
                                  <label className="form-label fw-semibold">Delivery Date</label>
                                  <input className="form-control form-control-sm" value={req.deliveryDate ? formatDateTime(req.deliveryDate) : "-"} readOnly />
                                </div>

                                {/* Notes */}
                                <div className="col-md-12">
                                  <label className="form-label fw-semibold">Additional Notes</label>
                                  <textarea className="form-control form-control-sm" value={req.additionalNotes || "-"} readOnly rows={3} />
                                </div>

                                {/* Artwork File */}
                                {req.artworkFileName && (
                                  <div className="col-md-12">
                                    <label className="form-label fw-semibold">Artwork File</label>
                                    <div className="py-2 d-flex flex-wrap gap-2 align-items-center">
                                      <span className="text-break">{req.artworkFileName}</span>
                                      {req.artworkFilePath && (
                                        <button
                                          type="button"
                                          className="btn btn-sm btn-outline-info"
                                          onClick={() => setPreviewFile({ fileName: req.artworkFileName, filePath: req.artworkFilePath })}
                                        >
                                          Preview
                                        </button>
                                      )}
                                      {req.artworkFilePath && (
                                        <button
                                          type="button"
                                          className="btn btn-sm btn-outline-secondary"
                                          onClick={() => downloadProtectedFile(req.artworkFilePath, req.artworkFileName, "Failed to download artwork file")}
                                        >
                                          Download
                                        </button>
                                      )}
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                  )}

                  {designRequirement && (
                  <div className="mt-5">
                    <h5 className="mb-3">
                      <i className="ti ti-palette me-2"></i>Design Requirement Details
                    </h5>
                    <div className="card mb-3">
                      <div className="card-body">
                        <div className="row g-3">
                            <div className="col-md-4">
                              <label className="form-label fw-semibold">Requirement Type</label>
                              <input className="form-control form-control-sm" value={designRequirement.requirementType || "-"} readOnly />
                            </div>
                            <div className="col-md-4">
                              <label className="form-label fw-semibold">Product Type</label>
                              <input className="form-control form-control-sm" value={designRequirement.designProductType || "-"} readOnly />
                            </div>
                            <div className="col-md-4">
                              <label className="form-label fw-semibold">Size</label>
                              <input className="form-control form-control-sm" value={designRequirement.designSize || "-"} readOnly />
                            </div>

                            <div className="col-md-4">
                              <label className="form-label fw-semibold">Orientation</label>
                              <input className="form-control form-control-sm" value={designRequirement.designOrientation || "-"} readOnly />
                            </div>
                            <div className="col-md-4">
                              <label className="form-label fw-semibold">Pages</label>
                              <input className="form-control form-control-sm" value={designRequirement.designNumPages || "-"} readOnly />
                            </div>
                            <div className="col-md-4">
                              <label className="form-label fw-semibold">Purpose</label>
                              <input className="form-control form-control-sm" value={designRequirement.designPurpose || "-"} readOnly />
                            </div>

                            <div className="col-md-6">
                              <label className="form-label fw-semibold">Target Audience</label>
                              <input className="form-control form-control-sm" value={designRequirement.designTargetAudience || "-"} readOnly />
                            </div>
                            <div className="col-md-6">
                              <label className="form-label fw-semibold">Style Preference</label>
                              <input className="form-control form-control-sm" value={designRequirement.designStylePref || "-"} readOnly />
                            </div>

                            <div className="col-md-6">
                              <label className="form-label fw-semibold">Brand Colors</label>
                              <input className="form-control form-control-sm" value={designRequirement.designBrandColors || "-"} readOnly />
                            </div>
                            <div className="col-md-6">
                              <label className="form-label fw-semibold">Fonts</label>
                              <input className="form-control form-control-sm" value={designRequirement.designFonts || "-"} readOnly />
                            </div>

                            <div className="col-md-12">
                              <label className="form-label fw-semibold">Description</label>
                              <textarea className="form-control form-control-sm" value={designRequirement.designDescription || "-"} readOnly rows={3} />
                            </div>

                            <div className="col-md-12">
                              <label className="form-label fw-semibold">Additional Notes</label>
                              <textarea
                                className="form-control form-control-sm"
                                value={designRequirement.designAdditionalNotes || designRequirement.requirementNotes || "-"}
                                readOnly
                                rows={3}
                              />
                            </div>

                            <div className="col-md-4">
                              <label className="form-label fw-semibold">Deadline</label>
                              <input
                                className="form-control form-control-sm"
                                value={designRequirement.designDeadline ? formatDateTime(designRequirement.designDeadline) : "-"}
                                readOnly
                              />
                            </div>
                            <div className="col-md-4">
                              <label className="form-label fw-semibold">Priority</label>
                              <input className="form-control form-control-sm" value={designRequirement.designPriority || "-"} readOnly />
                            </div>
                            <div className="col-md-4">
                              <label className="form-label fw-semibold">Reference Links</label>
                              <input className="form-control form-control-sm" value={designRequirement.designReferenceLinks || "-"} readOnly />
                            </div>
{designRequirement.requirementFileName && (
                              <div className="col-12">
                                <label className="form-label fw-semibold">Requirement File</label>
                                <div className="py-2 d-flex flex-wrap gap-2 align-items-center">
                                  <span className="text-break">{designRequirement.requirementFileName}</span>
                                  <button
                                    type="button"
                                    className="btn btn-sm btn-outline-info"
                                    onClick={() => setPreviewFile({fileName: designRequirement.requirementFileName, filePath: designRequirement.requirementFilePath})}
                                  >
                                    Preview
                                  </button>
                                  <button
                                    type="button"
                                    className="btn btn-sm btn-outline-secondary"
                                    onClick={() => {
                                      if (designRequirement.requirementFilePath) {
                                        downloadProtectedFile(
                                          designRequirement.requirementFilePath,
                                          designRequirement.requirementFileName,
                                          "Failed to download requirement file",
                                        );
                                        return;
                                      }
                                      downloadRequirementFile();
                                    }}
                                  >
                                    Download
                                  </button>
                                </div>
                              </div>
                            )}

                            {designRequirement.designBrandGuidelinesFileName && (
                              <div className="col-md-6">
                                <label className="form-label fw-semibold">Brand Guidelines</label>
                                <div className="py-2 d-flex flex-wrap gap-2 align-items-center">
                                  <span className="text-break">{designRequirement.designBrandGuidelinesFileName}</span>
                                  {designRequirement.designBrandGuidelinesFilePath && (
                                    <button
                                      type="button"
                                      className="btn btn-sm btn-outline-info"
                                      onClick={() =>
                                        setPreviewFile({
                                          fileName: designRequirement.designBrandGuidelinesFileName,
                                          filePath: designRequirement.designBrandGuidelinesFilePath,
                                        })
                                      }
                                    >
                                      Preview
                                    </button>
                                  )}
                                  {designRequirement.designBrandGuidelinesFilePath && (
                                    <button
                                      type="button"
                                      className="btn btn-sm btn-outline-secondary"
                                      onClick={() => downloadProtectedFile(designRequirement.designBrandGuidelinesFilePath, designRequirement.designBrandGuidelinesFileName, "Failed to download brand guidelines")}
                                    >
                                      Download
                                    </button>
                                  )}
                                </div>
                              </div>
                            )}
                            {designRequirement.designLogoFileName && (
                              <div className="col-md-6">
                                <label className="form-label fw-semibold">Logo File</label>
                                <div className="py-2 d-flex flex-wrap gap-2 align-items-center">
                                  <span className="text-break">{designRequirement.designLogoFileName}</span>
                                  {designRequirement.designLogoFilePath && (
                                    <button
                                      type="button"
                                      className="btn btn-sm btn-outline-info"
                                      onClick={() =>
                                        setPreviewFile({
                                          fileName: designRequirement.designLogoFileName,
                                          filePath: designRequirement.designLogoFilePath,
                                        })
                                      }
                                    >
                                      Preview
                                    </button>
                                  )}
                                  {designRequirement.designLogoFilePath && (
                                    <button
                                      type="button"
                                      className="btn btn-sm btn-outline-secondary"
                                      onClick={() => downloadProtectedFile(designRequirement.designLogoFilePath, designRequirement.designLogoFileName, "Failed to download logo file")}
                                    >
                                      Download
                                    </button>
                                  )}
                                </div>
                              </div>
                            )}
                            {designRequirement.designImagesFileName && (
                              <div className="col-md-6">
                                <label className="form-label fw-semibold">Client Images</label>
                                <div className="py-2 d-flex flex-wrap gap-2 align-items-center">
                                  <span className="text-break">{designRequirement.designImagesFileName}</span>
                                  {designRequirement.designImagesFilePath && (
                                    <button
                                      type="button"
                                      className="btn btn-sm btn-outline-info"
                                      onClick={() =>
                                        setPreviewFile({
                                          fileName: designRequirement.designImagesFileName,
                                          filePath: designRequirement.designImagesFilePath,
                                        })
                                      }
                                    >
                                      Preview
                                    </button>
                                  )}
                                  {designRequirement.designImagesFilePath && (
                                    <button
                                      type="button"
                                      className="btn btn-sm btn-outline-secondary"
                                      onClick={() => downloadProtectedFile(designRequirement.designImagesFilePath, designRequirement.designImagesFileName, "Failed to download client images")}
                                    >
                                      Download
                                    </button>
                                  )}
                                </div>
                              </div>
                            )}
                            {designRequirement.designReferenceImagesFileName && (
                              <div className="col-md-6">
                                <label className="form-label fw-semibold">Reference Images</label>
                                <div className="py-2 d-flex flex-wrap gap-2 align-items-center">
                                  <span className="text-break">{designRequirement.designReferenceImagesFileName}</span>
                                  {designRequirement.designReferenceImagesFilePath && (
                                    <button
                                      type="button"
                                      className="btn btn-sm btn-outline-info"
                                      onClick={() =>
                                        setPreviewFile({
                                          fileName: designRequirement.designReferenceImagesFileName,
                                          filePath: designRequirement.designReferenceImagesFilePath,
                                        })
                                      }
                                    >
                                      Preview
                                    </button>
                                  )}
                                  {designRequirement.designReferenceImagesFilePath && (
                                    <button
                                      type="button"
                                      className="btn btn-sm btn-outline-secondary"
                                      onClick={() => downloadProtectedFile(designRequirement.designReferenceImagesFilePath, designRequirement.designReferenceImagesFileName, "Failed to download reference images")}
                                    >
                                      Download
                                    </button>
                                  )}
                                </div>
                              </div>
                            )}
                            {designRequirement.designPreviousDesignsFileName && (
                              <div className="col-md-6">
                                <label className="form-label fw-semibold">Previous Designs</label>
                                <div className="py-2 d-flex flex-wrap gap-2 align-items-center">
                                  <span className="text-break">{designRequirement.designPreviousDesignsFileName}</span>
                                  {designRequirement.designPreviousDesignsFilePath && (
                                    <button
                                      type="button"
                                      className="btn btn-sm btn-outline-info"
                                      onClick={() =>
                                        setPreviewFile({
                                          fileName: designRequirement.designPreviousDesignsFileName,
                                          filePath: designRequirement.designPreviousDesignsFilePath,
                                        })
                                      }
                                    >
                                      Preview
                                    </button>
                                  )}
                                  {designRequirement.designPreviousDesignsFilePath && (
                                    <button
                                      type="button"
                                      className="btn btn-sm btn-outline-secondary"
                                      onClick={() => downloadProtectedFile(designRequirement.designPreviousDesignsFilePath, designRequirement.designPreviousDesignsFileName, "Failed to download previous designs")}
                                    >
                                      Download
                                    </button>
                                  )}
                                </div>
                              </div>
                            )}
                        </div>
                      </div>
                    </div>
                  </div>
                  )}

                  {loadingRequirements && (
                    <div className="text-center py-3">
                      <small className="text-muted">Loading requirements...</small>
                    </div>
                  )}
                </div>
                )}

                {activeTab === "budget" && (statusLower === "budget" || lead?.budgetVerificationStatus) && (
                <div className="tab-pane fade show active">
                    <div className="mb-4">
                      <h5 className="mb-3">Budget Verification</h5>
                    {lead?.budgetVerificationStatus && (
                      <div className={`alert d-flex align-items-center gap-2 mb-4 ${
                        lead?.budgetVerificationStatus === "APPROVED" ? "alert-success" : "alert-info"
                      }`}>
                        <i className={`ti fs-5 ${
                          lead?.budgetVerificationStatus === "APPROVED" ? "ti-circle-check" : "ti-calculator"
                        }`}></i>
                        <div>
                          <strong>
                            {lead?.budgetVerificationStatus === "APPROVED"
                              ? "Budget Verification Done"
                              : "Budget Verification In Progress"}
                          </strong>
                          <div className="small">
                            {lead?.budgetVerificationStatus === "APPROVED"
                              ? "Invoice is ready. You can now move to Payment."
                              : "Budget team is calculating the invoice for this requirement."}
                          </div>
                        </div>
                      </div>
                    )}
                    {lead?.budgetVerificationRejectionReason && (
                      <div className="alert alert-danger mb-3">
                        <strong>Rejection Reason:</strong>
                        <div>{lead.budgetVerificationRejectionReason}</div>
                      </div>
                    )}
                    </div>
                  </div>
                  )}

{/* Design tab removed - design is managed in DealEditPage */}

                {activeTab === "payment" && showPaymentSummary && statusLower !== "budget" && (
                <div className="tab-pane fade show active">
                  <div>
                    <h5 className="mb-3">{isProduction ? "Production Details" : "Payment Tracker"}</h5>

                    {/* Budget Verification Status Box - Only show during budget status */}
                    {lead?.budgetVerificationStatus && statusLower === "budget" && (
                      <div className="row mb-4">
                        <div className="col-md-12">
                          <div className={`card border-2 ${
                            lead.budgetVerificationStatus === "APPROVED" ? "border-success bg-light-success" :
                            lead.budgetVerificationStatus === "REJECTED" ? "border-danger bg-light-danger" :
                            "border-info bg-light"
                          }`}>
                            <div className="card-body">
                              <div className="row align-items-center">
                                <div className="col-md-2 text-center">
                                  {lead.budgetVerificationStatus === "APPROVED" ? (
                                    <div className="fs-1 text-success"><i className="ti ti-circle-check-filled"></i></div>
                                  ) : lead.budgetVerificationStatus === "REJECTED" ? (
                                    <div className="fs-1 text-danger"><i className="ti ti-circle-x-filled"></i></div>
                                  ) : (
                                    <div className="fs-1 text-info"><i className="ti ti-calculator"></i></div>
                                  )}
                                </div>
                                <div className="col-md-10">
                                  <h5 className="mb-1">
                                    {lead.budgetVerificationStatus === "APPROVED"
                                      ? "Budget Approved"
                                      : lead.budgetVerificationStatus === "REJECTED"
                                      ? "Budget Rejected"
                                      : "Budget Calculating"}
                                  </h5>
                                  <p className="text-muted mb-0">
                                    {lead.budgetVerificationStatus === "APPROVED"
                                      ? "Budget has been approved and invoice has been created."
                                      : lead.budgetVerificationStatus === "REJECTED"
                                      ? "Budget calculation has been rejected."
                                      : "Budget team is calculating the invoice for this requirement."}
                                  </p>
                                  {lead.budgetVerificationStatus === "REJECTED" && lead.budgetVerificationRejectionReason && (
                                    <div className="mt-2 p-2 rounded border border-danger bg-white">
                                      <small className="text-danger fw-semibold">Reason:</small>
                                      <p className="mb-0 text-dark">{lead.budgetVerificationRejectionReason}</p>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Payment Verification Status Box */}
                    {lead?.paymentVerificationStatus && (
                      <div className="row mb-4">
                        <div className="col-md-12">
                          <div className={`card border-2 ${
                            lead.paymentVerificationStatus === "APPROVED" ? "border-success bg-light-success" :
                            lead.paymentVerificationStatus === "REJECTED" ? "border-danger bg-light-danger" :
                            "border-warning bg-light-warning"
                          }`}>
                            <div className="card-body">
                              <div className="row align-items-center">
                                <div className="col-md-2 text-center">
                                  {lead.paymentVerificationStatus === "APPROVED" ? (
                                    <div className="fs-1 text-success"><i className="ti ti-circle-check-filled"></i></div>
                                  ) : lead.paymentVerificationStatus === "REJECTED" ? (
                                    <div className="fs-1 text-danger"><i className="ti ti-circle-x-filled"></i></div>
                                  ) : (
                                    <div className="fs-1 text-warning"><i className="ti ti-clock"></i></div>
                                  )}
                                </div>
                                <div className="col-md-10">
                                  <h5 className="mb-1">
                                    {lead.paymentVerificationStatus === "APPROVED" 
                                      ? "Verification Successful" 
                                      : lead.paymentVerificationStatus === "REJECTED" 
                                      ? "Verification Rejected" 
                                      : "Verification Pending"}
                                  </h5>
                                  <p className="text-muted mb-0">
                                    {lead.paymentVerificationStatus === "APPROVED"
                                      ? "Payment verification has been approved and invoice has been created."
                                      : lead.paymentVerificationStatus === "REJECTED"
                                      ? "Payment verification has been rejected."
                                      : "This payment verification is pending approval."}
                                  </p>
                                  {lead.paymentVerificationStatus === "REJECTED" && lead.paymentVerificationRejectionReason && (
                                    <div className="mt-2 p-2 rounded border border-danger bg-white">
                                      <small className="text-danger fw-semibold">Reason:</small>
                                      <p className="mb-0 text-dark">{lead.paymentVerificationRejectionReason}</p>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Invoice from Accounts */}
                    {parsedInvoice && lead?.paymentVerificationStatus !== "APPROVED" && (
                      <div className="row mb-4">
                        <div className="col-md-12">
                          <div className="card border">
                            <div className="card-header d-flex justify-content-between align-items-center py-2">
                              <strong className="text-dark">
                                <i className="ti ti-file-invoice me-1"></i>
                                {parsedInvoice.type === "payment" ? "Payment Invoice" : parsedInvoice.type === "budget" ? "Budget Invoice" : "Invoice"}
                                {parsedInvoice.type === "payment" && <span className="badge bg-success ms-2" style={{fontSize:"0.65rem"}}>Approved</span>}
                                {parsedInvoice.type === "budget" && <span className="badge bg-warning text-dark ms-2" style={{fontSize:"0.65rem"}}>Budget</span>}
                              </strong>
                              <div className="d-flex align-items-center gap-2">
                                {parsedInvoice.createdAt && (
                                  <small className="text-muted">{new Date(parsedInvoice.createdAt).toLocaleString("en-IN")}</small>
                                )}
                                <button
                                  type="button"
                                  className="btn btn-sm btn-outline-primary"
                                  onClick={handleDownloadInvoice}
                                >
                                  <i className="ti ti-download me-1"></i>Download PDF
                                </button>
                              </div>
                            </div>
                            <div className="card-body p-0">
                              <div className="table-responsive">
                                <table className="table table-sm table-bordered mb-0">
                                  <thead className="table-light">
                                    <tr>
                                      <th>#</th>
                                      <th>Description</th>
                                      <th>HSN</th>
                                      <th className="text-end">Qty</th>
                                      <th className="text-end">Unit Price</th>
                                      <th className="text-end">Total</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {(parsedInvoice.items || []).map((item, idx) => (
                                      <tr key={idx}>
                                        <td>{idx + 1}</td>
                                        <td>{item.description}</td>
                                        <td>{item.hsn || "-"}</td>
                                        <td className="text-end">{item.quantity}</td>
                                        <td className="text-end">&#8377;{Number(item.unitPrice || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</td>
                                        <td className="text-end">&#8377;{Number(item.subtotal ?? item.total ?? (Number(item.quantity || 0) * Number(item.unitPrice || 0))).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</td>
                                      </tr>
                                    ))}
                                  </tbody>
                                  {parsedInvoice.totals && (
                                    <tfoot>
                                      <tr>
                                        <td colSpan={5} className="text-end fw-semibold">Subtotal</td>
                                        <td className="text-end">&#8377;{Number(parsedInvoice.totals.subtotal || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</td>
                                      </tr>
                                      {parsedInvoice.totals.cgst > 0 && (
                                        <tr>
                                          <td colSpan={5} className="text-end text-muted">CGST ({parsedInvoice.totals.cgstPercent}%)</td>
                                          <td className="text-end text-muted">&#8377;{Number(parsedInvoice.totals.cgst || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</td>
                                        </tr>
                                      )}
                                      {parsedInvoice.totals.sgst > 0 && (
                                        <tr>
                                          <td colSpan={5} className="text-end text-muted">SGST ({parsedInvoice.totals.sgstPercent}%)</td>
                                          <td className="text-end text-muted">&#8377;{Number(parsedInvoice.totals.sgst || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</td>
                                        </tr>
                                      )}
                                      <tr className="table-success">
                                        <td colSpan={5} className="text-end fw-bold">Grand Total</td>
                                        <td className="text-end fw-bold">&#8377;{Number(parsedInvoice.totals.grandTotal || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</td>
                                      </tr>
                                    </tfoot>
                                  )}
                                </table>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Payment Verified Invoice - approval invoice from payment verification */}
                    {parsedInvoice && parsedInvoice.type === "payment" && lead?.paymentVerificationStatus === "APPROVED" && (
                      <div className="row mb-4">
                        <div className="col-md-12">
                          <div className="card border border-success">
                            <div className="card-header d-flex justify-content-between align-items-center py-2 bg-success bg-opacity-10">
                              <strong className="text-success">
                                <i className="ti ti-file-check me-1"></i>
                                Payment Verified Invoice
                                <span className="badge bg-success ms-2" style={{fontSize:"0.65rem"}}>Approved</span>
                              </strong>
                              <div className="d-flex align-items-center gap-2">
                                {parsedInvoice.createdAt && (
                                  <small className="text-muted">{new Date(parsedInvoice.createdAt).toLocaleString("en-IN")}</small>
                                )}
                                <button
                                  type="button"
                                  className="btn btn-sm btn-success"
                                  onClick={handleDownloadInvoice}
                                >
                                  <i className="ti ti-download me-1"></i>Download PDF
                                </button>
                              </div>
                            </div>
                            <div className="card-body p-0">
                              <div className="table-responsive">
                                <table className="table table-sm table-bordered mb-0">
                                  <thead className="table-light">
                                    <tr>
                                      <th>#</th>
                                      <th>Description</th>
                                      <th>HSN</th>
                                      <th className="text-end">Qty</th>
                                      <th className="text-end">Unit Price</th>
                                      <th className="text-end">Total</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {(parsedInvoice.items || []).map((item, idx) => (
                                      <tr key={idx}>
                                        <td>{idx + 1}</td>
                                        <td>{item.description}</td>
                                        <td>{item.hsn || "-"}</td>
                                        <td className="text-end">{item.quantity}</td>
                                        <td className="text-end">&#8377;{Number(item.unitPrice || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</td>
                                        <td className="text-end">&#8377;{Number(item.subtotal ?? item.total ?? (Number(item.quantity || 0) * Number(item.unitPrice || 0))).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</td>
                                      </tr>
                                    ))}
                                  </tbody>
                                  {parsedInvoice.totals && (
                                    <tfoot>
                                      <tr>
                                        <td colSpan={5} className="text-end fw-semibold">Subtotal</td>
                                        <td className="text-end">&#8377;{Number(parsedInvoice.totals.subtotal || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</td>
                                      </tr>
                                      {parsedInvoice.totals.cgst > 0 && (
                                        <tr>
                                          <td colSpan={5} className="text-end text-muted">CGST ({parsedInvoice.totals.cgstPercent}%)</td>
                                          <td className="text-end text-muted">&#8377;{Number(parsedInvoice.totals.cgst || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</td>
                                        </tr>
                                      )}
                                      {parsedInvoice.totals.sgst > 0 && (
                                        <tr>
                                          <td colSpan={5} className="text-end text-muted">SGST ({parsedInvoice.totals.sgstPercent}%)</td>
                                          <td className="text-end text-muted">&#8377;{Number(parsedInvoice.totals.sgst || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</td>
                                        </tr>
                                      )}
                                      <tr className="table-success">
                                        <td colSpan={5} className="text-end fw-bold">Grand Total</td>
                                        <td className="text-end fw-bold">&#8377;{Number(parsedInvoice.totals.grandTotal || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</td>
                                      </tr>
                                    </tfoot>
                                  )}
                                </table>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Display Payment Notes if Available */}
                    {lead?.paymentNotes && (
                      <div className="row mb-4">
                        <div className="col-md-12">
                          <label className="text-muted small">Payment Notes</label>
                          <p className="alert alert-info py-2 px-3 mb-0">{lead.paymentNotes}</p>
                        </div>
                      </div>
                    )}

                    {isPayment && (
                      <div className="row mb-4">
                        <div className="col-md-6">
                          <div className="form-check form-check-md form-switch">
                            <input
                              className="form-check-input"
                              type="checkbox"
                              role="switch"
                              id="budgetInvoiceSentSwitch"
                              checked={budgetInvoiceSent}
                              onChange={(e) => setBudgetInvoiceSent(e.target.checked)}
                              disabled={isLeadReadOnly}
                            />
                            <label className="form-check-label" htmlFor="budgetInvoiceSentSwitch">
                              Budget Invoice Sent
                            </label>
                          </div>
                        </div>
                        <div className="col-md-6">
                          <div className="form-check form-check-md form-switch">
                            <input
                              className="form-check-input"
                              type="checkbox"
                              role="switch"
                              id="paymentInvoiceSentSwitch"
                              checked={paymentInvoiceSent}
                              onChange={(e) => setPaymentInvoiceSent(e.target.checked)}
                              disabled={isLeadReadOnly}
                            />
                            <label className="form-check-label" htmlFor="paymentInvoiceSentSwitch">
                              Payment Invoice Sent
                            </label>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="row g-3">
                      {isProduction && (
                      <div className="col-12 mb-3">
                        <button
                          className="btn btn-warning"
                          type="button"
                          onClick={() => {
                            setShowStockRequestModal(true);
                          }}
                        >
                          Create Stock Request
                        </button>
                      </div>
                      )}
                      {isPayment && (
                        <>
                        <div className="col-md-12">
                          <label className="form-label">Amount Details</label>
                          <div className="d-flex gap-2">
                            <input
                              className="form-control"
                              value={
                                totalAmount
                                  ? `Total: Rs ${Number(totalAmount || 0).toLocaleString("en-IN")} | Paid: Rs ${Number(paidAmount || 0).toLocaleString("en-IN")}`
                                  : "-"
                              }
                              readOnly
                            />
                          </div>
                        </div>

                        <div className="col-md-6">
                          <label className="form-label">Total Amount</label>
                          <input
                            className="form-control"
                            type="number"
                            value={totalAmount}
                            onChange={(e) => {
                              const val = e.target.value;
                              setTotalAmount(val);
                              const paid = Number(paidAmount) || 0;
                              setRemainingAmount(String(Math.max(0, Number(val) - paid)));
                            }}
                            placeholder="Total amount"
                            min="0"
                            disabled={isLeadReadOnly}
                          />
                        </div>
                        <div className="col-md-6">
                          <label className="form-label">Paid Amount</label>
                          <input
                            className="form-control"
                            type="number"
                            value={paidAmount}
                            onChange={(e) => {
                              const val = e.target.value;
                              setPaidAmount(val);
                              const total = Number(totalAmount) || 0;
                              setRemainingAmount(String(Math.max(0, total - Number(val))));
                            }}
                            placeholder="Paid amount"
                            min="0"
                            disabled={isLeadReadOnly}
                          />
                        </div>
                        <div className="col-md-6">
                          <label className="form-label">Remaining Amount</label>
                          <input
                            className="form-control"
                            value={remainingAmount ? `Rs ${Number(remainingAmount).toLocaleString("en-IN")}` : "Rs 0"}
                            readOnly
                          />
                        </div>
                        <div className="col-md-6 d-flex align-items-end">
                          <button
                            className="btn btn-outline-secondary w-100"
                            type="button"
                            onClick={() => {
                              setVerifyPaidAmount(paidAmount);
                              setVerifyNotes("");
                              setVerifyFile(null);
                              setVerifyFileName("");
                              setShowVerifyModal(true);
                            }}
                            disabled={isLeadReadOnly}
                          >
                            Verify Payment
                          </button>
                        </div>

                        <div className="col-12">
                          <div className="progress" style={{ height: 8 }}>
                            <div
                              className={`progress-bar ${
                                Number(remainingAmount) <= 0 && Number(totalAmount) > 0
                                  ? "bg-success"
                                  : "bg-primary"
                              }`}
                              style={{
                                width: Number(totalAmount) > 0
                                  ? `${Math.min(100, (Number(paidAmount) / Number(totalAmount)) * 100)}%`
                                  : "0%",
                              }}
                            />
                          </div>
                          <small className="text-muted">
                            {Number(totalAmount) > 0
                              ? `${Math.round((Number(paidAmount) / Number(totalAmount)) * 100)}% paid`
                              : "No amount set"}
                          </small>
                        </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                )}

                {activeTab === "rejected" && isRejected && (
                <div className="tab-pane fade show active">
                  <div>
                    <h5 className="mb-3">Rejected Details</h5>
                    <div className="row g-3">
                      <div className="col-md-6">
                        <label className="form-label">Rejected Reason</label>
                        <select
                          className="form-select"
                          value={rejectedReason}
                          onChange={(e) => setRejectedReason(e.target.value)}
                        >
                          <option value="">Reject Reason</option>
                          <option value="Budget Too High">Budget Too High</option>
                          <option value="Not Interested">Not Interested</option>
                          <option value="Already Purchased">Already Purchased</option>
                          <option value="Chose Competitor">Chose Competitor</option>
                          <option value="Decision Postponed">Decision Postponed</option>
                          <option value="No Requirement Now">No Requirement Now</option>
                          <option value="Not Reachable">Not Reachable</option>
                          <option value="Wrong Contact">Wrong Contact</option>
                          <option value="Invalid/Incomplete Details">Invalid/Incomplete Details</option>
                          <option value="Location Not Serviceable">Location Not Serviceable</option>
                          <option value="Timeline Mismatch">Timeline Mismatch</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>
                      <div className="col-md-12">
                        <label className="form-label">Rejected Reason Subtype</label>
                        <textarea
                          className="form-control"
                          rows={3}
                          value={rejectedReasonSubtype}
                          onChange={(e) => setRejectedReasonSubtype(e.target.value)}
                          placeholder="Rejected Reason Subtype"
                        />
                      </div>
                    </div>
                  </div>
                </div>
                )}
                </>
              </div>
              )}

              <div className={isEmployeeDesignView ? "col-12" : "col-lg-5"}>
                {isConverted ? (
                  <div className="card border">
                    <div className="card-body text-center py-5">
                      <i className="ti ti-lock" style={{ fontSize: 36, color: "#6c757d" }} />
                      <h5 className="mt-3 mb-2">Lead Locked</h5>
                      <p className="text-muted mb-0">This lead has been converted to a deal. No further edits are allowed here.</p>
                    </div>
                  </div>
                ) : (<>
                {isEmployeeDesignView ? (
                  <div className="mx-auto" style={{ maxWidth: "760px" }}>
                    <div className="mb-3">
                      <h5 className="mb-1">Design Review</h5>
                      <div className="text-muted">Only lead status and customer design response are shown in this phase.</div>
                    </div>
                  </div>
                ) : null}
                <div className="card border">
                  <div className="card-body">
                    <h5 className="mb-3">Lead Status</h5>
                  {allowedStatusOptions.length > 0 && (
                    <div className="mb-3">
                      <div className="d-flex flex-wrap gap-2">
                        {displayStatusOptions.map((item) => (
                          <span
                            key={item}
                            className={`badge ${normalizeStatusLabelKey(item) === normalizeStatusLabelKey(statusValue) ? "bg-primary" : "bg-light text-dark"}`}
                          >
                            {formatStatusLabel(item)}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  <label className="form-label">Status</label>
                    <select
                      className="form-select mb-3"
                      value={statusValue}
                      onChange={(e) => handleStatusChange(e.target.value)}
                    >
                      <option value="">Select Status</option>
                    {displayStatusOptions.map((status) => (
                      <option key={status} value={status}>
                        {formatStatusLabel(status)}
                      </option>
                    ))}
                  </select>
                  {effectiveStatus.toLowerCase() === "design" ? (
                    <button
                      className="btn btn-primary w-100 mb-3"
                      onClick={saveStatus}
                      disabled={statusSaving}
                    >
                      {statusSaving ? "Saving..." : "Update Status"}
                    </button>
                  ) : null}
                  {isEmployeeDesignView ? (
                    <div className="card border mb-3">
                      <div className="card-body">
                        <h6 className="mb-2">Upload Final Design</h6>
                        <input
                          className="form-control mb-3"
                          type="file"
                          onChange={(e) => setDesignUploadFile(e.target.files?.[0] || null)}
                        />
                        <button
                          className="btn btn-outline-primary w-100"
                          type="button"
                          onClick={uploadFinalDesign}
                          disabled={saving || !designUploadFile}
                        >
                          {saving ? "Uploading..." : "Upload File"}
                        </button>
                      </div>
                    </div>
                  ) : null}
                    {effectiveStatus.toLowerCase() !== "design" ? (
                    <button
                      className="btn btn-primary w-100"
                      onClick={saveStatus}
                      disabled={statusSaving}
                    >
                      {statusSaving ? "Saving..." : "Update Status"}
                    </button>
                    ) : null}
                  </div>
                </div>

                {!isEmployeeDesignView && (
                <div className="card border mt-3">
                  <div className="card-body">
                    <h5 className="mb-3">Save Lead Details</h5>
                    <button
                      className="btn btn-primary w-100"
                      onClick={saveLeadDetails}
                      disabled={detailsSaving || typeSaving}
                    >
                      {detailsSaving ? "Saving..." : "Save Details"}
                    </button>
                  </div>
                </div>
                )}
                </>)}

                {!isEmployeeDesignView && (
                <div className="card border mt-3">
                  <div className="card-body">
                    <ul className="nav nav-tabs mb-3" role="tablist">
                      <li className="nav-item" role="presentation">
                        <button
                          className="nav-link active"
                          id="lead-log-tab"
                          data-bs-toggle="tab"
                          data-bs-target="#lead-log"
                          type="button"
                          role="tab"
                          aria-controls="lead-log"
                          aria-selected="true"
                        >
                          Lead Log
                        </button>
                      </li>
                      <li className="nav-item" role="presentation">
                        <button
                          className="nav-link"
                          id="call-history-tab"
                          data-bs-toggle="tab"
                          data-bs-target="#call-history"
                          type="button"
                          role="tab"
                          aria-controls="call-history"
                          aria-selected="false"
                        >
                          Call History
                        </button>
                      </li>
                    </ul>
                    <div className="tab-content">
                      <div
                        className="tab-pane fade show active"
                        id="lead-log"
                        role="tabpanel"
                        aria-labelledby="lead-log-tab"
                      >
                        <div style={{ maxHeight: "320px", overflowY: "auto" }}>
                          {leadLogs.length === 0 ? (
                            <div className="text-muted">No lead log yet.</div>
                          ) : (
                            <div className="d-flex flex-column gap-3">
                              {leadLogs.map((item) => (
                                <div key={item.id || `${item.action}-${item.createdAt}`}>
                                  <div className="d-flex align-items-start gap-3">
                                    <div
                                      className="rounded-circle bg-light d-flex align-items-center justify-content-center"
                                      style={{ width: "48px", height: "48px", fontWeight: 600 }}
                                    >
                                      {(item.actor || "U").charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                      <div className="fw-medium">{item.action || "Log Entry"}</div>
                                      <div className="text-muted">by {item.actor || "user"}</div>
                                      <div className="text-muted">
                                        on {formatDateTime(item.createdAt)}
                                      </div>
                                      {item.fileName && (
                                        <div className="text-muted small mt-1 text-break">
                                          <button
                                            type="button"
                                            className="btn btn-link btn-sm p-0 align-baseline text-start text-decoration-underline"
                                            onClick={() => downloadProtectedFile(item.filePath, item.fileName, "Failed to download file")}
                                          >
                                            {item.fileName}
                                          </button>
                                        </div>
                                      )}
                                    </div>
                                    {item.fileName && (
                                      <button
                                        type="button"
                                        className="btn btn-sm btn-outline-info"
                                        onClick={() => downloadProtectedFile(item.filePath, item.fileName, "Failed to download file")}
                                      >
                                        <i className="ti ti-download me-1"></i>Download
                                      </button>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                      <div
                        className="tab-pane fade"
                        id="call-history"
                        role="tabpanel"
                        aria-labelledby="call-history-tab"
                      >
                        <div className="text-muted">No call history yet.</div>
                      </div>
                    </div>
                  </div>
                </div>
                )}

              </div>
            </div>
          )}
        </div>
      </div>

      {showAttemptedModal && (
        <div className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center bg-dark bg-opacity-50" style={{ zIndex: 1050 }}>
          <div className="card shadow-lg" style={{ width: "100%", maxWidth: "520px" }}>
            <div className="card-header d-flex align-items-center justify-content-between">
              <h5 className="mb-0">Attempted</h5>
              <button
                type="button"
                className="btn-close"
                aria-label="Close"
                onClick={() => setShowAttemptedModal(false)}
              />
            </div>
            <div className="card-body">
              <div className="mb-3">
                <label className="form-label">Open Reason</label>
                <select
                  className="form-select"
                  value={attemptedOpenReason}
                  onChange={(e) => setAttemptedOpenReason(e.target.value)}
                >
                  <option value="">Select Open Reason</option>
                  <option value="Contacted">Contacted</option>
                  <option value="Shared Details">Shared Details</option>
                  <option value="Retry">Retry</option>
                </select>
              </div>
              <div className="mb-3">
                <label className="form-label">Call Status</label>
                <select
                  className="form-select"
                  value={attemptedCallStatus}
                  onChange={(e) => {
                    const next = e.target.value;
                    setAttemptedCallStatus(next);
                    if (String(next || "").trim().toLowerCase() !== "follow up") {
                      setAttemptedFollowUpDate("");
                    }
                  }}
                >
                  <option value="">Select Call Status</option>
                  <option value="RNR">RNR</option>
                  <option value="Call Connected">Call Connected</option>
                  <option value="Follow Up">Follow Up</option>
                  <option value="Number Busy">Number Busy</option>
                  <option value="Not Reachable">Not Reachable</option>
                  <option value="Switched Off">Switched Off</option>
                  <option value="Number Not In Use">Number Not In Use</option>
                  <option value="Wrong Number">Wrong Number</option>
                </select>
              </div>
              {String(attemptedCallStatus || "").trim().toLowerCase() === "follow up" && (
                <div className="mb-3">
                  <label className="form-label">Follow Up Date</label>
                  <input
                    className="form-control"
                    type="datetime-local"
                    value={attemptedFollowUpDate}
                    onChange={(e) => setAttemptedFollowUpDate(e.target.value)}
                  />
                </div>
              )}
              <div className="mb-3">
                <label className="form-label">Call Remarks</label>
                <textarea
                  className="form-control"
                  rows={3}
                  value={attemptedCallRemarks}
                  onChange={(e) => setAttemptedCallRemarks(e.target.value)}
                  placeholder="Call Remarks"
                />
              </div>
              <div className="d-flex justify-content-end">
                <button className="btn btn-primary" onClick={submitAttempted} disabled={saving}>
                  {saving ? "Saving..." : "Submit"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showInterestedModal && (
        <div className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center bg-dark bg-opacity-50" style={{ zIndex: 1050 }}>
          <div className="card shadow-lg" style={{ width: "100%", maxWidth: "520px" }}>
            <div className="card-header d-flex align-items-center justify-content-between">
              <h5 className="mb-0">Interested</h5>
              <button
                type="button"
                className="btn-close"
                aria-label="Close"
                onClick={() => setShowInterestedModal(false)}
              />
            </div>
            <div className="card-body">
              <div className="mb-3">
                <label className="form-label">Follow Up Date</label>
                <input
                  className="form-control"
                  type="datetime-local"
                  value={interestedFollowUpDate}
                  onChange={(e) => setInterestedFollowUpDate(e.target.value)}
                />
              </div>
              <div className="mb-3">
                <label className="form-label">Call Remarks</label>
                <textarea
                  className="form-control"
                  rows={3}
                  value={interestedCallRemarks}
                  onChange={(e) => setInterestedCallRemarks(e.target.value)}
                  placeholder="Call Remarks"
                />
              </div>
              <div className="d-flex justify-content-end">
                <button className="btn btn-primary" onClick={submitInterested} disabled={saving}>
                  {saving ? "Saving..." : "Submit"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showRejectedModal && (
        <div className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center bg-dark bg-opacity-50" style={{ zIndex: 1050 }}>
          <div className="card shadow-lg" style={{ width: "100%", maxWidth: "520px" }}>
            <div className="card-header d-flex align-items-center justify-content-between">
              <h5 className="mb-0">Rejected Reason</h5>
              <button
                type="button"
                className="btn-close"
                aria-label="Close"
                onClick={() => setShowRejectedModal(false)}
              />
            </div>
            <div className="card-body">
              <div className="mb-3">
                <label className="form-label">Rejected Reason</label>
                <select
                  className="form-select"
                  value={rejectedReason}
                  onChange={(e) => setRejectedReason(e.target.value)}
                >
                  <option value="">Reject Reason</option>
                  <option value="Budget Too High">Budget Too High</option>
                  <option value="Not Interested">Not Interested</option>
                  <option value="Already Purchased">Already Purchased</option>
                  <option value="Chose Competitor">Chose Competitor</option>
                  <option value="Decision Postponed">Decision Postponed</option>
                  <option value="No Requirement Now">No Requirement Now</option>
                  <option value="Not Reachable">Not Reachable</option>
                  <option value="Wrong Contact">Wrong Contact</option>
                  <option value="Invalid/Incomplete Details">Invalid/Incomplete Details</option>
                  <option value="Location Not Serviceable">Location Not Serviceable</option>
                  <option value="Timeline Mismatch">Timeline Mismatch</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div className="mb-3">
                <label className="form-label">Rejected Reason Subtype</label>
                <textarea
                  className="form-control"
                  rows={3}
                  value={rejectedReasonSubtype}
                  onChange={(e) => setRejectedReasonSubtype(e.target.value)}
                  placeholder="Rejected Reason Subtype"
                />
              </div>
              <div className="d-flex justify-content-end">
                <button className="btn btn-primary" onClick={submitRejected} disabled={saving}>
                  {saving ? "Saving..." : "Submit"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <RequirementModal
        showRequirementModal={showRequirementModal}
        setShowRequirementModal={setShowRequirementModal}
        requirementSaving={requirementSaving}
        onSubmit={submitRequirement}
      />

      {showDesignDurationModal && (
        <div className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center bg-dark bg-opacity-50" style={{ zIndex: 1050 }}>
          <div className="card shadow-lg" style={{ width: "100%", maxWidth: "520px" }}>
            <div className="card-header d-flex align-items-center justify-content-between">
              <h5 className="mb-0">Design Duration</h5>
              <button
                type="button"
                className="btn-close"
                aria-label="Close"
                onClick={() => setShowDesignDurationModal(false)}
              />
            </div>
            <div className="card-body">
              <div className="mb-3">
                <label className="form-label">Design Start</label>
                <input
                  className="form-control"
                  type="datetime-local"
                  value={designStartAt}
                  onChange={(e) => setDesignStartAt(e.target.value)}
                  disabled={!!lead?.designStartAt}
                />
              </div>
              <div className="mb-3">
                <label className="form-label">Design End</label>
                <input
                  className="form-control"
                  type="datetime-local"
                  value={designEndAt}
                  onChange={(e) => setDesignEndAt(e.target.value)}
                  disabled={!!lead?.designEndAt}
                />
              </div>
              <div className="mb-3">
                <label className="form-label">Days</label>
                <input
                  className="form-control"
                  value={getDesignDurationDays(designStartAt, designEndAt) || "-"}
                  readOnly
                />
              </div>
              <div className="d-flex justify-content-end">
                <button className="btn btn-primary" onClick={submitDesignDuration} disabled={saving}>
                  {saving ? "Saving..." : "Submit"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}


      <PaymentVerificationModal
        show={showVerifyModal}
        onClose={handleCloseVerifyModal}
        saving={saving}
        onSubmit={submitVerifyDetails}
        verifyPaidAmount={verifyPaidAmount}
        onPaidAmountChange={handleVerifyPaidAmountChange}
        verifyNotes={verifyNotes}
        onNotesChange={handleVerifyNotesChange}
        verifyFileName={verifyFileName}
        onFileChange={handleVerifyFileChange}
        parsedInvoice={parsedInvoice}
        selectedBillingAddressId={selectedBillingAddressId}
        onBillingAddressChange={handleBillingAddressChange}
        billingAddresses={billingAddresses}
        onAddBillingAddress={handleAddBillingAddress}
        addressLoading={addressLoading}
        shipSame={shipSame}
        onShipSameChange={handleShipSameChange}
        selectedShippingAddressId={selectedShippingAddressId}
        onShippingAddressChange={handleShippingAddressChange}
        shippingAddresses={shippingAddresses}
        onAddShippingAddress={handleAddShippingAddress}
      />

      <AddressFormModal
        show={showAddAddressModal}
        onClose={() => setShowAddAddressModal(false)}
        onSubmit={handleAddAddress}
        addressType={newAddressType}
        loading={addressLoading}
        countryCodeOptions={COUNTRY_CODE_OPTIONS}
        getCountryOptionByValue={getCountryOptionByValue}
        getCountryAllowedLengths={getCountryAllowedLengths}
        sanitizePhoneDigits={sanitizePhoneDigits}
      />
      <FilePreviewModal 
        show={Boolean(previewFile)} 
        fileName={previewFile?.fileName} 
        filePath={previewFile?.filePath} 
        onClose={() => setPreviewFile(null)} 
      />

      {showAllocateModal && (
        <div className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center bg-dark bg-opacity-50" style={{ zIndex: 1050 }}>
          <div className="card shadow-lg" style={{ width: "100%", maxWidth: "520px" }}>
            <div className="card-header d-flex align-items-center justify-content-between">
              <h5 className="mb-0">Allocate Lead</h5>
              <button
                type="button"
                className="btn-close"
                aria-label="Close"
                onClick={() => setShowAllocateModal(false)}
              />
            </div>
            <div className="card-body">
              {allocateGroupId && (
                <div className="mb-3">
                  <label className="form-label">Allocate Group</label>
                  <div className="form-control bg-light">
                    {allocateGroupName || `Group #${allocateGroupId}`}
                  </div>
                </div>
              )}
              <div className="mb-3">
                <label className="form-label">Employee</label>
                <select
                  className="form-select"
                  value={allocateOwnerId}
                  onChange={(e) => setAllocateOwnerId(e.target.value)}
                >
                  <option value="">Select Employee</option>
                  {allocateOptions.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.username} {item.role ? `(${item.role})` : ""}
                    </option>
                  ))}
                </select>
              </div>
              <div className="d-flex justify-content-end">
                <button className="btn btn-primary" onClick={submitAllocate} disabled={saving}>
                  {saving ? "Saving..." : "Submit"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showRequirementDetailsModal && selectedRequirement && (
        <div className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center bg-dark bg-opacity-50" style={{ zIndex: 1050 }}>
          <div className="card shadow-lg" style={{ width: "100%", maxWidth: "700px", maxHeight: "90vh", overflow: "auto" }}>
            <div className="card-header d-flex align-items-center justify-content-between sticky-top bg-white">
              <h5 className="mb-0">
                <i className="ti ti-file-document me-2"></i>Requirement Details
              </h5>
              <button
                type="button"
                className="btn-close"
                aria-label="Close"
                onClick={() => {
                  setShowRequirementDetailsModal(false);
                  setSelectedRequirement(null);
                }}
              />
            </div>
            <div className="card-body">
              {/* Requirement Type Badge */}
              <div className="mb-3">
                <span className="badge bg-info me-2">
                  {selectedRequirement.requirementType || "Unknown"}
                </span>
                {selectedRequirement.priority && (
                  <span className={`badge ${selectedRequirement.priority === "High" ? "bg-danger" : selectedRequirement.priority === "Medium" ? "bg-warning" : "bg-success"}`}>
                    {selectedRequirement.priority}
                  </span>
                )}
              </div>

              {/* Production Brief Details */}
              {selectedRequirement.productionBrief && (
                <>
                  <h6 className="border-bottom pb-2 mt-4"><strong>Product Specifications</strong></h6>
                  <div className="row mb-3">
                    <div className="col-md-6">
                      <label className="form-label text-muted">Product Type</label>
                      <div className="form-control" style={{ borderColor: "transparent", background: "transparent", padding: "0" }}>
                        {selectedRequirement.productType || "-"}
                      </div>
                    </div>
                    <div className="col-md-6">
                      <label className="form-label text-muted">Quantity</label>
                      <div className="form-control" style={{ borderColor: "transparent", background: "transparent", padding: "0" }}>
                        {selectedRequirement.quantity || "-"}
                      </div>
                    </div>
                  </div>
                  <div className="row mb-3">
                    <div className="col-md-6">
                      <label className="form-label text-muted">Paper Size</label>
                      <div className="form-control" style={{ borderColor: "transparent", background: "transparent", padding: "0" }}>
                        {selectedRequirement.paperSize || "-"}
                      </div>
                    </div>
                    <div className="col-md-6">
                      <label className="form-label text-muted">Paper GSM</label>
                      <div className="form-control" style={{ borderColor: "transparent", background: "transparent", padding: "0" }}>
                        {selectedRequirement.paperGsm || "-"}
                      </div>
                    </div>
                  </div>
                  <div className="row mb-3">
                    <div className="col-md-6">
                      <label className="form-label text-muted">Color Type</label>
                      <div className="form-control" style={{ borderColor: "transparent", background: "transparent", padding: "0" }}>
                        {selectedRequirement.colorType || "-"}
                      </div>
                    </div>
                    <div className="col-md-6">
                      <label className="form-label text-muted">Printing Method</label>
                      <div className="form-control" style={{ borderColor: "transparent", background: "transparent", padding: "0" }}>
                        {selectedRequirement.printingMethod || "-"}
                      </div>
                    </div>
                  </div>
                  <div className="row mb-3">
                    <div className="col-md-6">
                      <label className="form-label text-muted">Finishing Options</label>
                      <div className="form-control" style={{ borderColor: "transparent", background: "transparent", padding: "0" }}>
                        {selectedRequirement.finishingOptions || "-"}
                      </div>
                    </div>
                    <div className="col-md-6">
                      <label className="form-label text-muted">Print Sides</label>
                      <div className="form-control" style={{ borderColor: "transparent", background: "transparent", padding: "0" }}>
                        {selectedRequirement.printSides || "-"}
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* Design Brief Details */}
              {selectedRequirement.designBrief && (
                <>
                  <h6 className="border-bottom pb-2 mt-4"><strong>Design Brief</strong></h6>
                  <div className="row mb-3">
                    <div className="col-md-6">
                      <label className="form-label text-muted">Product Type</label>
                      <div className="form-control" style={{ borderColor: "transparent", background: "transparent", padding: "0" }}>
                        {selectedRequirement.designProductType || "-"}
                      </div>
                    </div>
                    <div className="col-md-6">
                      <label className="form-label text-muted">Size</label>
                      <div className="form-control" style={{ borderColor: "transparent", background: "transparent", padding: "0" }}>
                        {selectedRequirement.designSize || "-"}
                      </div>
                    </div>
                  </div>
                  <div className="row mb-3">
                    <div className="col-md-6">
                      <label className="form-label text-muted">Orientation</label>
                      <div className="form-control" style={{ borderColor: "transparent", background: "transparent", padding: "0" }}>
                        {selectedRequirement.designOrientation || "-"}
                      </div>
                    </div>
                    <div className="col-md-6">
                      <label className="form-label text-muted">Purpose</label>
                      <div className="form-control" style={{ borderColor: "transparent", background: "transparent", padding: "0" }}>
                        {selectedRequirement.designPurpose || "-"}
                      </div>
                    </div>
                  </div>
                  {selectedRequirement.designDescription && (
                    <div className="mb-3">
                      <label className="form-label text-muted">Description</label>
                      <div className="form-control" style={{ borderColor: "transparent", background: "transparent", padding: "0", whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
                        {selectedRequirement.designDescription}
                      </div>
                    </div>
                  )}
                </>
              )}

              {/* Deadlines and Dates */}
              {(selectedRequirement.deadline || selectedRequirement.deliveryDate) && (
                <>
                  <h6 className="border-bottom pb-2 mt-4"><strong>Timeline</strong></h6>
                  <div className="row mb-3">
                    {selectedRequirement.deadline && (
                      <div className="col-md-6">
                        <label className="form-label text-muted">Deadline</label>
                        <div className="form-control" style={{ borderColor: "transparent", background: "transparent", padding: "0" }}>
                          {new Date(selectedRequirement.deadline).toLocaleDateString("en-IN")}
                        </div>
                      </div>
                    )}
                    {selectedRequirement.deliveryDate && (
                      <div className="col-md-6">
                        <label className="form-label text-muted">Delivery Date</label>
                        <div className="form-control" style={{ borderColor: "transparent", background: "transparent", padding: "0" }}>
                          {new Date(selectedRequirement.deliveryDate).toLocaleDateString("en-IN")}
                        </div>
                      </div>
                    )}
                  </div>
                </>
              )}

              {/* Notes */}
              {selectedRequirement.notes && (
                <>
                  <h6 className="border-bottom pb-2 mt-4"><strong>Additional Notes</strong></h6>
                  <div className="mb-3">
                    <div className="form-control" style={{ borderColor: "transparent", background: "transparent", padding: "0", whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
                      {selectedRequirement.notes}
                    </div>
                  </div>
                </>
              )}

              {/* Close Button */}
              <div className="d-flex justify-content-end gap-2 mt-4">
                <button
                  className="btn btn-secondary"
                  onClick={() => {
                    setShowRequirementDetailsModal(false);
                    setSelectedRequirement(null);
                  }}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <StockRequestFormModal
        open={showStockRequestModal}
        leadId={lead?.id}
        initialLeadName={lead?.leadName || lead?.name || ""}
        leadOptions={
          lead?.id
            ? [{ id: lead.id, name: lead?.leadName || lead?.name || "" }]
            : []
        }
        itemOptions={stockItems}
        onClose={() => setShowStockRequestModal(false)}
        onSubmit={handleStockRequestSubmit}
        submitting={stockRequestSubmitting}
      />
    </div>
  );
}

