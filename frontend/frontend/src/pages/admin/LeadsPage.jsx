import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import {
  createLead,
  deleteLead,
  getAssignableLeadGroups,
  getLeadChatMessages,
  getLeadFilters,
  getLeads,
  updateLeadRowStatus,
  getAssignableAllocators,
  updateLeadAllocator,
  updateLeadDetails,
} from "../../api/leadsApi";
import { getLeadStatuses, DEFAULT_LEAD_STATUSES } from "../../api/leadStatusApi";
import { getPrimarySources } from "../../api/primarySourceApi";
import { getSecondarySources } from "../../api/secondarySourceApi";
import { getTertiarySources } from "../../api/tertiarySourceApi";
import { getProjects } from "../../api/projectApi";
import { getChannelPartners } from "../../api/channelPartnerApi";
import { getGroupMembers } from "../../api/userGroupApi";
import { getUserGroups } from "../../api/userGroupApi";
import { getLeadFlow } from "../../api/flowApi";
import { updateCustomerLeadStatus } from "../../api/customerApi";
import { extractApiErrorMessage } from "../../utils/errorMessage";
import { formatStatusLabel, uniqueStatusOptions, normalizeStatusLabelKey } from "../../utils/statusLabels";
import {
  COUNTRY_CODE_OPTIONS,
  defaultCountryOption,
  ensureCountryCodeValue,
  getCountryAllowedLengths,
  getCountryDisplayMaxLength,
  getCountryOptionByValue,
  sanitizePhoneDigits,
  validatePhoneNumber,
} from "../../utils/phoneUtils";
import { CRM_PAGE_OPTIONS } from "../../constants/crmPages";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../components/system/ToastProvider";
import useConfirmDialog from "../../components/system/useConfirmDialog";
import ProductionModal from "./ProductionModal";
import { saveProductionRequirement, getProductionRequirement } from "../../api/productionRequirementApi";

const EMPTY_CREATE_FORM = {
  projectName: "",
  name: "",
  email: "",
  mobile: "",
  primarySource: "",
  secondarySource: "",
  tertiarySource: "",
  leadGroupId: "",
  channelPartnerId: "",
  countryCode: defaultCountryOption.value,
};

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

function isFinalDesignUploadMessage(row) {
  const text = stripDesignThreadMarker(row?.message || "").trim().toLowerCase();
  return text === "final design uploaded" && !!row?.attachmentName;
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

function getDesignDurationDays(startValue, endValue) {
  if (!startValue || !endValue) return "";
  const start = new Date(startValue);
  const end = new Date(endValue);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || end < start) {
    return "";
  }
  const diffMs = end.getTime() - start.getTime();
  return Math.max(1, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
}

function pickText(row, keys = []) {
  for (const key of keys) {
    const value = row?.[key];
    if (typeof value === "string" && value.trim()) {
      return value.trim();
    }
  }
  return "";
}

function toOptionNames(rows, keys) {
  const names = (Array.isArray(rows) ? rows : [])
    .map((row) => pickText(row, keys))
    .filter(Boolean);
  return Array.from(new Set(names));
}

function toProjectNames(rows) {
  const names = (Array.isArray(rows) ? rows : [])
    .map((row) =>
      pickText(row, [
        "projectName",
        "project_name",
        "name",
        "title",
      ]),
    )
    .filter(Boolean);
  return Array.from(new Set(names));
}

function downloadTextFile(filename, content, mime) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

function mergeRowsById(primaryRows, secondaryRows) {
  const merged = [];
  const seen = new Set();
  for (const row of [...(Array.isArray(primaryRows) ? primaryRows : []), ...(Array.isArray(secondaryRows) ? secondaryRows : [])]) {
    const key = row?.id != null ? String(row.id) : "";
    if (!key || seen.has(key)) continue;
    seen.add(key);
    merged.push(row);
  }
  return merged;
}

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

function EditGlyph({ size = 14, className = "" }) {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z" />
    </svg>
  );
}

function PhoneGlyph({ size = 14, className = "" }) {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2A19.8 19.8 0 0 1 3.1 5.18 2 2 0 0 1 5.08 3h3a2 2 0 0 1 2 1.72c.12.9.33 1.77.62 2.6a2 2 0 0 1-.45 2.11L9.1 10.6a16 16 0 0 0 4.3 4.3l1.17-1.15a2 2 0 0 1 2.11-.45c.83.29 1.7.5 2.6.62A2 2 0 0 1 22 16.92z" />
    </svg>
  );
}

function NoteGlyph({ size = 14, className = "" }) {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M4 4h16v16H4z" />
      <path d="M8 9h8" />
      <path d="M8 13h8" />
      <path d="M8 17h5" />
    </svg>
  );
}

export default function LeadsPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const role = String(user?.role || "").toUpperCase();
  const { showSuccess, showError } = useToast();
  const { showConfirm, confirmDialog } = useConfirmDialog();
  const [rows, setRows] = useState([]);
  const [filters, setFilters] = useState({
    search: "",
    project: "",
    primary: "",
    status: "",
    svStatus: "",
    owner: "",
    quickDate: "",
  });
  const [filterOpen, setFilterOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [primaryOptions, setPrimaryOptions] = useState([]);
  const [secondaryOptions, setSecondaryOptions] = useState([]);
  const [tertiaryOptions, setTertiaryOptions] = useState([]);
  const [projectOptions, setProjectOptions] = useState([]);
  const [channelPartners, setChannelPartners] = useState([]);
  const [groupOptions, setGroupOptions] = useState([]);
  const [leadFilters, setLeadFilters] = useState({
    projects: [],
    primarySources: [],
    leadStatuses: [],
    svStatuses: [],
    owners: [],
  });
  const [leadStatusOptions, setLeadStatusOptions] = useState([]);

  const [showCreate, setShowCreate] = useState(false);
  const [createForm, setCreateForm] = useState(EMPTY_CREATE_FORM);
  const [createGroupMembers, setCreateGroupMembers] = useState([]);
  const [createMobileError, setCreateMobileError] = useState("");
  const [flowRules, setFlowRules] = useState([]);
  const handleCreateCountryCodeChange = (value) => {
    setCreateForm((p) => ({
      ...p,
      countryCode: ensureCountryCodeValue(value),
      mobile: "",
    }));
    setCreateMobileError("");
    setError("");
  };

  const handleCreateMobileChange = (value) => {
    const option = getCountryOptionByValue(createForm.countryCode);
    const lengths = getCountryAllowedLengths(createForm.countryCode);
    setCreateForm((p) => ({
      ...p,
      mobile: sanitizePhoneDigits(value, option?.maxLength, lengths),
    }));
    setCreateMobileError("");
    setError("");
  };

  const [showStatusModal, setShowStatusModal] = useState(false);
  const [statusLead, setStatusLead] = useState(null);
  const [statusValue, setStatusValue] = useState("");
  const [showDesignDurationModal, setShowDesignDurationModal] = useState(false);
  const [designStartAt, setDesignStartAt] = useState("");
  const [designEndAt, setDesignEndAt] = useState("");
  const [showRemarkModal, setShowRemarkModal] = useState(false);
  const [remarkLead, setRemarkLead] = useState(null);
  const [remarkValue, setRemarkValue] = useState("");

  // Production Requirements State
  const [showProductionModal, setShowProductionModal] = useState(false);
  const [currentLeadId, setCurrentLeadId] = useState(null);
  const [productType, setProductType] = useState("");
  const [customProductType, setCustomProductType] = useState("");
  const [quantity, setQuantity] = useState("");
  const [numPages, setNumPages] = useState("");
  const [paperSize, setPaperSize] = useState("");
  const [customSizeWidth, setCustomSizeWidth] = useState("");
  const [customSizeHeight, setCustomSizeHeight] = useState("");
  const [customSizeUnit, setCustomSizeUnit] = useState("mm");
  const [paperType, setPaperType] = useState("");
  const [paperGsm, setPaperGsm] = useState("");
  const [colorType, setColorType] = useState("");
  const [printSides, setPrintSides] = useState("");
  const [printingMethod, setPrintingMethod] = useState("");
  const [finishingOptions, setFinishingOptions] = useState("");
  const [foldingType, setFoldingType] = useState("");
  const [artworkFileName, setArtworkFileName] = useState("");
  const [artworkFilePath, setArtworkFilePath] = useState("");
  const [productionAdditionalNotes, setProductionAdditionalNotes] = useState("");
  const [printDeadline, setPrintDeadline] = useState("");
  const [deliveryDate, setDeliveryDate] = useState("");
  const [priority, setPriority] = useState("Normal");

  const [saving, setSaving] = useState(false);
  const [selectedLeadIds, setSelectedLeadIds] = useState(new Set());

  const visibleRows = useMemo(() => rows, [rows]);

  const loadLeads = async (nextFilters = filters) => {
    setLoading(true);
    setError("");
    try {
      const baseData = await getLeads(nextFilters);
      setRows(Array.isArray(baseData) ? baseData : []);
    } catch (e) {
      setRows([]);
      setError(extractApiErrorMessage(e, "Failed to load leads"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLeads();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    let isMounted = true;
    const loadOptions = async () => {
      try {
        const [
          primaries,
          secondaries,
          tertiaries,
          projects,
          cpRows,
          groups,
          allGroups,
          filterPayload,
          leadStatuses,
          flowPayload,
        ] = await Promise.all([
          getPrimarySources(),
          getSecondarySources(),
          getTertiarySources(),
          getProjects(),
          getChannelPartners(),
          getAssignableLeadGroups(),
          role === "EMPLOYEE" ? Promise.resolve([]) : getUserGroups(),
          getLeadFilters(),
          getLeadStatuses(),
          getLeadFlow(),
        ]);
        if (!isMounted) return;
        setPrimaryOptions(
          toOptionNames(primaries, ["primarySource", "name", "label"]),
        );
        setSecondaryOptions(
          toOptionNames(secondaries, ["secondarySource", "name", "label"]),
        );
        setTertiaryOptions(
          toOptionNames(tertiaries, ["tertiarySource", "name", "label"]),
        );
        setProjectOptions(toProjectNames(projects));
        setChannelPartners(Array.isArray(cpRows) ? cpRows : []);
        const assignable = Array.isArray(groups) ? groups : [];
        if (role === "EMPLOYEE") {
          setGroupOptions(assignable);
        } else {
          const byId = new Map(
            (Array.isArray(allGroups) ? allGroups : []).map((g) => [
              String(g.id),
              g,
            ]),
          );
          const mergedGroups = assignable.map((group) => {
            const full = byId.get(String(group.id));
            const pageKeys =
              Array.isArray(group.pageKeys) && group.pageKeys.length > 0
                ? group.pageKeys
                : Array.isArray(full?.pageKeys)
                  ? full.pageKeys
                  : [];
            return { ...group, pageKeys };
          });
          setGroupOptions(mergedGroups);
        }
        setLeadFilters({
          projects: Array.isArray(filterPayload?.projects)
            ? filterPayload.projects
            : [],
          primarySources: Array.isArray(filterPayload?.primarySources)
            ? filterPayload.primarySources
            : [],
          leadStatuses: Array.isArray(filterPayload?.leadStatuses)
            ? filterPayload.leadStatuses
            : [],
          svStatuses: Array.isArray(filterPayload?.svStatuses)
            ? filterPayload.svStatuses
            : [],
          owners: Array.isArray(filterPayload?.owners) ? filterPayload.owners : [],
        });
        const normalizedLeadStatuses = Array.isArray(leadStatuses)
          ? leadStatuses
              .map((item) => item?.leadStatus || item?.name || item?.status || "")
              .filter(Boolean)
              .filter((item) => !/site\s*visit/i.test(item))
          : [];

        const flowStatuses = Array.isArray(flowPayload?.rules)
          ? flowPayload.rules
              .flatMap((rule) => {
                const base = String(rule?.status || "").trim();
                const next =
                  rule?.next && typeof rule.next === "object"
                    ? Object.keys(rule.next).map((k) => String(k || "").trim())
                    : [];
                return [base, ...next];
              })
              .filter(Boolean)
          : [];

        const mergedStatuses = [
          ...normalizedLeadStatuses,
          ...flowStatuses,
        ]
          .map((item) => String(item || "").trim())
          .filter(Boolean)
          .filter((item, index, arr) => arr.indexOf(item) === index);

        setLeadStatusOptions(
          mergedStatuses.length ? mergedStatuses : DEFAULT_LEAD_STATUSES,
        );
        setFlowRules(Array.isArray(flowPayload?.rules) ? flowPayload.rules : []);
      } catch (e) {
        if (!isMounted) return;
        setError(extractApiErrorMessage(e, "Failed to load lead options"));
      }
    };
    loadOptions();
    return () => {
      isMounted = false;
    };
  }, [role]);

  useEffect(() => {
    let isMounted = true;
    const loadCreateGroupMembers = async () => {
      if (!createForm.leadGroupId) {
        setCreateGroupMembers([]);
        return;
      }
      if (role === "EMPLOYEE") {
        setCreateGroupMembers([]);
        return;
      }
      try {
        const members = await getGroupMembers(createForm.leadGroupId);
        if (isMounted) {
          setCreateGroupMembers(Array.isArray(members) ? members : []);
        }
      } catch (e) {
        if (isMounted) {
          setCreateGroupMembers([]);
          setError(extractApiErrorMessage(e, "Failed to load group members"));
        }
      }
    };
    loadCreateGroupMembers();
    return () => {
      isMounted = false;
    };
  }, [createForm.leadGroupId, role]);

  const applyFilters = async () => {
    await loadLeads(filters);
  };

  const resetFilters = async () => {
    const cleared = {
      search: "",
      project: "",
      primary: "",
      status: "",
      svStatus: "",
      owner: "",
      quickDate: "",
    };
    setFilters(cleared);
    await loadLeads(cleared);
  };

  const leadPageKey = CRM_PAGE_OPTIONS.find((item) => item.key === "leads")?.key || "leads";
  const leadEligibleGroups = useMemo(
    () =>
      groupOptions.filter((group) =>
        Array.isArray(group.pageKeys) ? group.pageKeys.includes(leadPageKey) : false,
      ),
    [groupOptions, leadPageKey],
  );
  const newLeadFlowGroupId = useMemo(() => {
    const rule = Array.isArray(flowRules)
      ? flowRules.find(
          (item) => String(item?.status || "").trim().toLowerCase() === "new lead",
        )
      : null;
    return rule?.handledByGroupId != null && String(rule.handledByGroupId).trim() !== ""
      ? String(rule.handledByGroupId)
      : "";
  }, [flowRules]);
  const createAllowedGroup = useMemo(
    () =>
      newLeadFlowGroupId
        ? leadEligibleGroups.find((group) => String(group.id) === String(newLeadFlowGroupId)) || null
        : null,
    [leadEligibleGroups, newLeadFlowGroupId],
  );
  const canCreateNewLead = role === "SUPER_ADMIN" || !newLeadFlowGroupId || !!createAllowedGroup;
  const createCountryDisplayMaxLength = getCountryDisplayMaxLength(createForm.countryCode);

  const openCreateModal = () => {
    setCreateForm({
      ...EMPTY_CREATE_FORM,
      leadGroupId: createAllowedGroup?.id ? String(createAllowedGroup.id) : "",
    });
    setCreateGroupMembers([]);
    setShowCreate(true);
    setError("");
    setCreateMobileError("");
  };

  const handleCreateLead = async () => {
    if (!createForm.name.trim() || !createForm.mobile.trim()) {
      setError("Name and mobile are required");
      return;
    }
    const phoneValidation = validatePhoneNumber(createForm.mobile, createForm.countryCode);
    if (phoneValidation) {
      setCreateMobileError(phoneValidation);
      return;
    }
    if (!createForm.primarySource.trim()) {
      setError("Primary source is required");
      return;
    }
    if (
      createForm.primarySource.toLowerCase() === "channel partner" &&
      !createForm.channelPartnerId
    ) {
      setError("Channel Partner is required for Channel Partner source");
      return;
    }

    setSaving(true);
    setError("");
    try {
      const payload = {
        name: createForm.name.trim(),
        email: createForm.email.trim() || null,
        countryCode: createForm.countryCode,
        mobile: createForm.mobile.trim(),
        primarySource: createForm.primarySource.trim(),
        secondarySource: createForm.secondarySource.trim() || null,
        tertiarySource: createForm.tertiarySource.trim() || null,
        projectName: createForm.projectName.trim() || null,
        leadGroupId: createForm.leadGroupId
          ? Number(createForm.leadGroupId)
          : null,
      };
      if (createForm.channelPartnerId) {
        payload.channelPartnerId = Number(createForm.channelPartnerId);
      }
      const created = await createLead(payload);
      setRows((prev) => [created, ...prev]);
      setShowCreate(false);
      setCreateForm(EMPTY_CREATE_FORM);
      setCreateMobileError("");
      showSuccess("Lead created successfully");
    } catch (e) {
      setError(extractApiErrorMessage(e, "Failed to create lead"));
    } finally {
      setSaving(false);
    }
  };

  const openStatusModal = (lead) => {
    setStatusLead(lead);
    setStatusValue("");
    setDesignStartAt(toInputDateTime(lead?.designStartAt || ""));
    setDesignEndAt(toInputDateTime(lead?.designEndAt || ""));
    setShowStatusModal(true);
    setError("");
  };

  const resolveNextGroupIdForStatus = (status) => {
    if (!Array.isArray(flowRules)) return null;
    const targetRule = flowRules.find(
      (rule) =>
        String(rule?.status || "").trim().toLowerCase() ===
        String(status || "").trim().toLowerCase(),
    );
    return targetRule?.handledByGroupId ?? null;
  };

  const applyManagedStatusUpdate = async (nextKey, leadOverride = statusLead) => {
    const activeLead = leadOverride || statusLead;
    if (!activeLead?.id) return;
    const nextGroupId = resolveNextGroupIdForStatus(statusValue);

    // Preserve the current owner so the backend can continue the round-robin flow.
    if ((nextKey === "design" || nextKey === "production") && activeLead?.ownerUserId) {
      await updateLeadDetails(activeLead.id, {
        paymentOwnerId: activeLead.ownerUserId,
      });
    }

    const nextLead = await updateLeadRowStatus(activeLead.id, statusValue, nextGroupId);

    setRows((prev) =>
      prev.map((row) =>
        String(row.id) === String(activeLead.id) ? { ...row, ...nextLead } : row,
      ),
    );
    setShowStatusModal(false);
    setShowDesignDurationModal(false);
    setStatusLead(null);
    showSuccess(
      `Lead moved to ${nextKey.charAt(0).toUpperCase() + nextKey.slice(1)} status with round-robin assignment`,
    );
  };

  const saveStatusUpdate = async () => {
    if (!statusLead?.id) return;
    if (!statusValue) {
      setError("Please select a status");
      return;
    }
    const currentKey = String(statusLead?.status || "").trim().toLowerCase();
    const nextKey = String(statusValue || "").trim().toLowerCase();
    if (role === "EMPLOYEE" && currentKey === "design" && nextKey !== "design") {
      setSaving(true);
      setError("");
      try {
        const messages = await getLeadChatMessages(statusLead.id, "CUSTOMER");
        const hasFinalDesign = Array.isArray(messages) && messages.some(isFinalDesignUploadMessage);
        if (!hasFinalDesign) {
          const message = "Please upload the final design before changing status from Design";
          setError(message);
          showError(message);
          return;
        }
      } catch (e) {
        const message = extractApiErrorMessage(e, "Failed to verify final design upload");
        setError(message);
        showError(message);
        return;
      } finally {
        setSaving(false);
      }
    }
    if (["attempted", "interested", "rejected", "requirement", "allocate"].includes(nextKey)) {
      setShowStatusModal(false);
      setStatusLead(null);
      navigate(`/leads/${statusLead.id}?status=${encodeURIComponent(statusValue)}`);
      return;
    }

    if (nextKey === "design" && (!statusLead?.designStartAt || !statusLead?.designEndAt)) {
      setShowStatusModal(false);
      setShowDesignDurationModal(true);
      return;
    }
    
    // Handle payment/design/production status with round‑robin assignment and history
    if (nextKey === "payment" || nextKey === "design" || nextKey === "production") {
      setSaving(true);
      setError("");
      try {
        await applyManagedStatusUpdate(nextKey);
      } catch (e) {
        setError(extractApiErrorMessage(e, "Failed to update status"));
      } finally {
        setSaving(false);
      }
      return;
    }

    if (nextKey === "payment" || nextKey === "design" || nextKey === "production") {
      setSaving(true);
      setError("");
      try {
        // preserve existing payment owner before changing status
        if ((nextKey === "design" || nextKey === "production") && statusLead?.ownerUserId) {
          // store the current owner so we can restore him later
          await updateLeadDetails(statusLead.id, {
            paymentOwnerId: statusLead.ownerUserId,
          });
        }

        const nextLead = await updateLeadRowStatus(statusLead.id, statusValue);

        // when moving to payment, seed total/paid/remaining if absent
        if (nextKey === "payment") {
          // no seeding now
        }

        // payment/design assignment is backend-owned; avoid overriding the
        // server-selected flow group or owner from the client.

        if (nextKey === "payment") {
          try {
            await updateCustomerLeadStatus("Payment", statusLead.id);
          } catch (custErr) {
            console.warn("Could not update customer status:", custErr);
          }
        }

        setRows((prev) =>
          prev.map((row) =>
            String(row.id) === String(statusLead.id) ? { ...row, ...nextLead } : row,
          ),
        );
        setShowStatusModal(false);
        setStatusLead(null);
        showSuccess(
          `✓ Lead moved to ${nextKey.charAt(0).toUpperCase() + nextKey.slice(1)} status with round-robin assignment`,
        );
      } catch (e) {
        setError(extractApiErrorMessage(e, "Failed to update status"));
      } finally {
        setSaving(false);
      }
      return;
    }

    // Standard status update
    setSaving(true);
    setError("");
    try {
      const nextGroupId = resolveNextGroupIdForStatus(statusValue);
      const nextLead = await updateLeadRowStatus(statusLead.id, statusValue, nextGroupId);
      setRows((prev) =>
        prev.map((row) =>
          String(row.id) === String(statusLead.id) ? { ...row, ...nextLead } : row,
        ),
      );
      setShowStatusModal(false);
      setStatusLead(null);
      showSuccess("Lead status updated");
    } catch (e) {
      setError(extractApiErrorMessage(e, "Failed to update status"));
    } finally {
      setSaving(false);
    }
  };

  const submitDesignDuration = async () => {
    if (!statusLead?.id) return;
    if (!designStartAt || !designEndAt) {
      setError("Please select design start and end dates");
      return;
    }

    setSaving(true);
    setError("");
    try {
      const detailUpdate = await updateLeadDetails(statusLead.id, {
        designStartAt,
        designEndAt,
      });
      const nextLead = { ...statusLead, ...detailUpdate };
      await applyManagedStatusUpdate("design", nextLead);
    } catch (e) {
      setError(extractApiErrorMessage(e, "Failed to update design duration"));
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteLead = async (lead) => {
    if (!lead?.id) return;
    showConfirm({
      title: "Delete Lead",
      message: "Are you sure you want to delete this lead? This action cannot be undone.",
      confirmLabel: "Delete",
      cancelLabel: "Cancel",
      onConfirm: async () => {
        setSaving(true);
        setError("");
        try {
          await deleteLead(lead.id);
          setRows((prev) => prev.filter((row) => String(row.id) !== String(lead.id)));
          showSuccess("Lead deleted");
        } catch (e) {
          setError(extractApiErrorMessage(e, "Failed to delete lead"));
        } finally {
          setSaving(false);
        }
      },
    });
  };

  const orderedLeadStatuses = useMemo(() => {
    const currentRowStatus = String(statusLead?.status || "").trim();
    const flowStatuses = Array.isArray(flowRules)
      ? flowRules.flatMap((rule) => {
          const base = String(rule?.status || "").trim();
          const next =
            rule?.next && typeof rule.next === "object"
              ? Object.keys(rule.next).map((k) => String(k || "").trim())
              : [];
          return [base, ...next];
        })
      : [];

    return Array.from(
      new Set(
        [...flowStatuses, currentRowStatus]
          .map((item) => String(item || "").trim())
          .filter(Boolean),
      ),
    );
  }, [flowRules, statusLead?.status]);

  const normalizeKey = (s) => String(s || "").trim().toLowerCase();
  const displayStatus = (s) => {
    return s || "";
  };
  const allowedStatusOptions = useMemo(() => {
    const current = normalizeKey(statusLead?.status);
    if (!current) {
      return orderedLeadStatuses;
    }
    
    // Find the flow rule for the current status
    const rule = Array.isArray(flowRules)
      ? flowRules.find(
          (r) =>
            normalizeKey(r?.status) === current,
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
  }, [flowRules, orderedLeadStatuses, statusLead]);
  const displayStatusOptions = useMemo(
    () => uniqueStatusOptions(allowedStatusOptions),
    [allowedStatusOptions],
  );

  const openRemarkModal = (lead) => {
    setRemarkLead(lead);
    setRemarkValue(lead?.svStatus || "");
    setShowRemarkModal(true);
    setError("");
  };

  const saveRemarkUpdate = () => {
    if (!remarkLead?.id) return;
    setRows((prev) =>
      prev.map((row) =>
        String(row.id) === String(remarkLead.id)
          ? { ...row, svStatus: remarkValue.trim() }
          : row,
      ),
    );
    setShowRemarkModal(false);
    setRemarkLead(null);
    showSuccess("Remark updated");
  };

  const submitProductionRequirement = async () => {
    try {
      const payload = {
        leadId: currentLeadId,
        requirementType: "Production",
        productType,
        customProductType,
        quantity: quantity ? parseInt(quantity) : null,
        numPages: numPages ? parseInt(numPages) : null,
        paperSize,
        customSizeWidth: customSizeWidth ? parseFloat(customSizeWidth) : null,
        customSizeHeight: customSizeHeight ? parseFloat(customSizeHeight) : null,
        customSizeUnit,
        paperType,
        paperGsm,
        colorType,
        printSides,
        printingMethod,
        finishingOptions,
        foldingType,
        artworkFileName,
        artworkFilePath,
        additionalNotes: productionAdditionalNotes,
        printDeadline,
        deliveryDate,
        priority,
      };
      await saveProductionRequirement(payload);
      showSuccess("Production requirements saved successfully");
      setShowProductionModal(false);
      // Reset form
      setProductType("");
      setCustomProductType("");
      setQuantity("");
      setNumPages("");
      setPaperSize("");
      setCustomSizeWidth("");
      setCustomSizeHeight("");
      setCustomSizeUnit("mm");
      setPaperType("");
      setPaperGsm("");
      setColorType("");
      setPrintSides("");
      setPrintingMethod("");
      setFinishingOptions("");
      setFoldingType("");
      setArtworkFileName("");
      setArtworkFilePath("");
      setProductionAdditionalNotes("");
      setPrintDeadline("");
      setDeliveryDate("");
      setPriority("Normal");
    } catch (e) {
      showError(extractApiErrorMessage(e, "Failed to save production requirements"));
    }
  };

  const toggleLeadSelection = (leadId) => {
    setSelectedLeadIds((prev) => {
      const next = new Set(prev);
      if (next.has(leadId)) {
        next.delete(leadId);
      } else {
        next.add(leadId);
      }
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedLeadIds.size === visibleRows.length) {
      setSelectedLeadIds(new Set());
      return;
    }
    setSelectedLeadIds(new Set(visibleRows.map((row) => row.id)));
  };

  const exportCsv = () => {
    const headers = [
      "Lead ID",
      "Name",
      "Mobile",
      "Email",
      "Primary",
      "Secondary",
      "Project",
      "Status",
      "Group",
      "Owner",
      "Created Date",
    ];
    const body = visibleRows.map((row) => [
      row.leadId || "",
      row.name || "",
      row.mobile || "",
      row.email || "",
      row.primarySource || "",
      row.secondarySource || "",
      row.projectName || "",
      row.status || "",
      row.leadGroupName || "",
      row.owner || "",
      row.createdAt || "",
    ]);
    const csv = [headers, ...body]
      .map((line) =>
        line
          .map((cell) => `"${String(cell ?? "").replace(/"/g, '""')}"`)
          .join(","),
      )
      .join("\n");
    downloadTextFile(`leads-${Date.now()}.csv`, csv, "text/csv;charset=utf-8;");
  };

  const exportExcel = () => {
    exportCsv();
  };

  const exportPdf = () => {
    const doc = new jsPDF({ orientation: "landscape", unit: "pt", format: "a4" });
    const title = "Leads Export";
    const generatedAt = new Date().toLocaleString();
    doc.setFontSize(14);
    doc.text(title, 40, 40);
    doc.setFontSize(10);
    doc.text(`Generated: ${generatedAt}`, 40, 58);

    const headers = [[
      "Lead ID",
      "Name",
      "Mobile",
      "Email",
      "Primary",
      "Secondary",
      "Project",
      "Status",
      "Group",
      "Owner",
      "Created Date",
    ]];

    const body = visibleRows.map((row) => [
      row.leadId || "",
      row.name || "",
      row.mobile || "",
      row.email || "",
      row.primarySource || "",
      row.secondarySource || "",
      row.projectName || "",
      row.status || "",
      row.leadGroupName || "",
      row.owner || "",
      row.createdAt || "",
    ]);

    autoTable(doc, {
      head: headers,
      body,
      startY: 72,
      styles: { fontSize: 8, cellPadding: 4 },
      headStyles: { fillColor: [33, 37, 41] },
      margin: { left: 24, right: 24 },
      tableWidth: "auto",
    });

    doc.save(`leads-${Date.now()}.pdf`);
  };

  return (
    <div className="container-fluid">

      <div className="card">
        <div className="card-header border-0">
          <h3 className="mb-2">Leads</h3>
          <p className="text-muted mb-0">Add & Manage Leads</p>
        </div>
        <div className="card-body">
          <div className="d-flex flex-wrap gap-2 justify-content-between align-items-center mb-3">
            <div className="d-flex gap-2">
              <button className="btn btn-outline-primary" onClick={exportExcel}>
                Excel
              </button>
              <button className="btn btn-outline-primary" onClick={exportCsv}>
                CSV
              </button>
              <button className="btn btn-outline-primary" onClick={exportPdf}>
                PDF
              </button>
            </div>
            <div className="d-flex gap-2 align-items-center">
              <button
                className="btn btn-outline-warning"
                onClick={() => setFilterOpen((prev) => !prev)}
              >
                <i className="ti ti-filter me-1" />
                Filter
              </button>
              <button
                className="btn btn-success"
                onClick={openCreateModal}
              >
                <i className="ti ti-plus me-1" />
                Create New Lead
              </button>
            </div>
          </div>

          <div className="d-flex justify-content-end mb-3">
            <div className="d-flex align-items-center gap-2">
              <label className="mb-0">Search:</label>
              <input
                className="form-control"
                style={{ width: 240 }}
                value={filters.search}
                onChange={(e) =>
                  setFilters((prev) => ({ ...prev, search: e.target.value }))
                }
                onKeyDown={(e) => {
                  if (e.key === "Enter") applyFilters();
                }}
              />
            </div>
          </div>

          {filterOpen && (
            <div className="card border mb-3">
              <div className="card-body">
                <div className="row g-3">
                  <div className="col-md-3">
                    <label className="form-label">Project</label>
                    <select
                      className="form-select"
                      value={filters.project}
                      onChange={(e) =>
                        setFilters((prev) => ({ ...prev, project: e.target.value }))
                      }
                    >
                      <option value="">All</option>
                      {[...new Set([...projectOptions, ...leadFilters.projects])]
                        .filter(Boolean)
                        .map((item) => (
                          <option key={item} value={item}>
                            {item}
                          </option>
                        ))}
                    </select>
                  </div>
                  <div className="col-md-3">
                    <label className="form-label">Primary</label>
                    <select
                      className="form-select"
                      value={filters.primary}
                      onChange={(e) =>
                        setFilters((prev) => ({ ...prev, primary: e.target.value }))
                      }
                    >
                      <option value="">All</option>
                      {[...new Set([...primaryOptions, ...leadFilters.primarySources])]
                        .filter(Boolean)
                        .map((item) => (
                          <option key={item} value={item}>
                            {item}
                          </option>
                        ))}
                    </select>
                  </div>
                  <div className="col-md-2">
                    <label className="form-label">Lead Status</label>
                    <select
                      className="form-select"
                      value={filters.status}
                      onChange={(e) =>
                        setFilters((prev) => ({ ...prev, status: e.target.value }))
                      }
                    >
                      <option value="">All</option>
                      {(leadFilters.leadStatuses || []).map((item) => (
                        <option key={item} value={item}>
                          {item}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="col-md-2">
                    <label className="form-label">SV Status</label>
                    <select
                      className="form-select"
                      value={filters.svStatus}
                      onChange={(e) =>
                        setFilters((prev) => ({ ...prev, svStatus: e.target.value }))
                      }
                    >
                      <option value="">All</option>
                      {(leadFilters.svStatuses || []).map((item) => (
                        <option key={item} value={item}>
                          {item}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="col-md-2">
                    <label className="form-label">Quick Date</label>
                    <select
                      className="form-select"
                      value={filters.quickDate}
                      onChange={(e) =>
                        setFilters((prev) => ({ ...prev, quickDate: e.target.value }))
                      }
                    >
                      <option value="">All</option>
                      <option value="today">Today</option>
                      <option value="weekly">Last 7 Days</option>
                      <option value="monthly">Last 30 Days</option>
                    </select>
                  </div>
                  <div className="col-md-3">
                    <label className="form-label">Owner</label>
                    <select
                      className="form-select"
                      value={filters.owner}
                      onChange={(e) =>
                        setFilters((prev) => ({ ...prev, owner: e.target.value }))
                      }
                    >
                      <option value="">All</option>
                      {(leadFilters.owners || []).map((item) => (
                        <option key={item} value={item}>
                          {item}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="d-flex justify-content-end gap-2 mt-3">
                  <button className="btn btn-light" onClick={resetFilters}>
                    Reset
                  </button>
                  <button className="btn btn-primary" onClick={applyFilters}>
                    Apply
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="table-responsive">
            <table className="table table-hover align-middle">
              <thead>
                <tr>
                  <th style={{ width: 36 }}>
                    <input
                      type="checkbox"
                      checked={
                        visibleRows.length > 0 &&
                        selectedLeadIds.size === visibleRows.length
                      }
                      onChange={toggleSelectAll}
                    />
                  </th>
                  <th className="text-nowrap">
                    #
                    <span className="ms-1 text-muted d-inline-flex align-items-center">
                      <EditGlyph size={12} />
                    </span>
                  </th>
                  <th>Name</th>
                  <th>Mobile</th>
                  <th>Primary</th>
                  <th>Secondary</th>
                  <th>Projects</th>
                  <th className="text-nowrap">
                    Status
                    <span className="ms-1 d-inline-flex align-items-center" style={{ color: "#6f65d6" }}>
                      <EditGlyph size={12} />
                    </span>
                  </th>
                  <th>Remarks</th>
                  <th>Owner</th>
                  <th>Created Date</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={11}>Loading...</td>
                  </tr>
                ) : visibleRows.length === 0 ? (
                  <tr>
                    <td colSpan={11}>No leads found</td>
                  </tr>
                ) : (
                  visibleRows.map((row, index) => {
                    const statusKey = String(row.status || "").trim().toLowerCase();
                    const isDealRow = statusKey === "deal";
                    return (
                    <tr key={row.id}>
                      <td>
                        {isDealRow ? null : (
                          <input
                            type="checkbox"
                            checked={selectedLeadIds.has(row.id)}
                            onChange={() => toggleLeadSelection(row.id)}
                          />
                        )}
                      </td>
                      <td>
                        <div className="d-inline-flex align-items-center gap-2">
                          <span>{index + 1}</span>
                          {isDealRow ? (
                            <>
                              <button
                                className="btn btn-sm d-inline-flex align-items-center justify-content-center"
                                style={{
                                  backgroundColor: "#6c757d",
                                  color: "#fff",
                                  width: 24,
                                  height: 24,
                                  padding: 0,
                                  borderRadius: 4,
                                  border: "none",
                                }}
                                onClick={() => navigate(`/leads/${row.id}`)}
                                title="View Lead"
                              >
                                <i className="ti ti-eye" />
                              </button>
                              {role !== "EMPLOYEE" && (
                                <button
                                  className="btn btn-sm d-inline-flex align-items-center justify-content-center"
                                  style={{
                                    backgroundColor: "#e74c3c",
                                    color: "#fff",
                                    width: 24,
                                    height: 24,
                                    padding: 0,
                                    borderRadius: 4,
                                    border: "none",
                                  }}
                                  onClick={() => handleDeleteLead(row)}
                                  title="Delete Lead"
                                >
                                  <i className="ti ti-trash" />
                                </button>
                              )}
                              <span className="badge bg-secondary">Deal</span>
                            </>
                          ) : (
                            <>
                              <button
                                className="btn btn-sm d-inline-flex align-items-center justify-content-center"
                                style={{
                                  backgroundColor: "#6f65d6",
                                  color: "#fff",
                                  width: 24,
                                  height: 24,
                                  padding: 0,
                                  borderRadius: 4,
                                  border: "none",
                                }}
                                onClick={() => navigate(`/leads/${row.id}`)}
                                title="Edit Lead"
                              >
                                <EditGlyph size={11} />
                              </button>
                              <button
                                className="btn btn-sm d-inline-flex align-items-center justify-content-center"
                                style={{
                                  backgroundColor: "#e74c3c",
                                  color: "#fff",
                                  width: 24,
                                  height: 24,
                                  padding: 0,
                                  borderRadius: 4,
                                  border: "none",
                                }}
                                onClick={() => handleDeleteLead(row)}
                                title="Delete Lead"
                              >
                                <i className="ti ti-trash" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                      <td>{row.name || "-"}</td>
                      <td>
                        <div className="d-flex align-items-center gap-2">
                          <span>{row.mobile || "-"}</span>
                          {row.mobile && (
                            <a
                              className="btn btn-sm btn-outline-secondary"
                              href={`tel:${row.mobile}`}
                            >
                              <PhoneGlyph size={12} />
                            </a>
                          )}
                        </div>
                      </td>
                      <td>{row.primarySource || "-"}</td>
                      <td>{row.secondarySource || "-"}</td>
                      <td>{row.projectName || "-"}</td>
                      <td>
                        <div className="d-inline-flex align-items-center gap-2">
                          <span>{row.status || "-"}</span>
                          {!isDealRow && (
                            <button
                              className="btn btn-sm d-inline-flex align-items-center justify-content-center"
                              style={{
                                backgroundColor: "#6f65d6",
                                color: "#fff",
                                width: 24,
                                height: 24,
                                padding: 0,
                                borderRadius: 4,
                                border: "none",
                              }}
                              onClick={() => openStatusModal(row)}
                              title="Edit Status"
                            >
                              <EditGlyph size={11} />
                            </button>
                          )}
                        </div>
                      </td>
                      <td>
                        {isDealRow ? (
                          <span className="text-muted">-</span>
                        ) : (
                          <button
                            className="btn btn-sm d-inline-flex align-items-center justify-content-center"
                            style={{
                              backgroundColor: "#6f65d6",
                              color: "#fff",
                              width: 24,
                              height: 24,
                              padding: 0,
                              borderRadius: 4,
                              border: "none",
                            }}
                            onClick={() => openRemarkModal(row)}
                            title={row.svStatus ? "View Remark" : "Add Remark"}
                          >
                            <NoteGlyph size={11} />
                          </button>
                        )}
                      </td>
                      <td>{row.owner || "-"}</td>
                      <td>{formatDateTime(row.createdAt)}</td>
                    </tr>
                  )})
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {showCreate && (
        <>
          <div className="modal fade show" style={{ display: "block" }} tabIndex="-1">
            <div className="modal-dialog modal-lg">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">Create New Lead</h5>
                  <button className="btn-close" onClick={() => setShowCreate(false)} />
                </div>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label">Project Interested</label>
                    <select
                      className="form-select"
                      value={createForm.projectName}
                      onChange={(e) =>
                        setCreateForm((prev) => ({ ...prev, projectName: e.target.value }))
                      }
                    >
                      <option value="">Select Project</option>
                      {projectOptions.map((item) => (
                        <option key={item} value={item}>
                          {item}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="row g-3">
                    <div className="col-md-6">
                      <label className="form-label">Full Name</label>
                      <input
                        className="form-control"
                        value={createForm.name}
                        onChange={(e) =>
                          setCreateForm((prev) => ({ ...prev, name: e.target.value }))
                        }
                        placeholder="Full Name"
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Primary Source</label>
                      <select
                        className="form-select"
                        value={createForm.primarySource}
                        onChange={(e) =>
                          setCreateForm((prev) => ({
                            ...prev,
                            primarySource: e.target.value,
                            channelPartnerId: "",
                          }))
                        }
                      >
                        <option value="">Select Primary Source</option>
                        {primaryOptions.map((item) => (
                          <option key={item} value={item}>
                            {item}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Email Address</label>
                      <input
                        className="form-control"
                        value={createForm.email}
                        onChange={(e) =>
                          setCreateForm((prev) => ({ ...prev, email: e.target.value }))
                        }
                        placeholder="E-mail Id"
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Secondary Source</label>
                      <select
                        className="form-select"
                        value={createForm.secondarySource}
                        onChange={(e) =>
                          setCreateForm((prev) => ({
                            ...prev,
                            secondarySource: e.target.value,
                          }))
                        }
                      >
                        <option value="">Select Secondary Source</option>
                        {secondaryOptions.map((item) => (
                          <option key={item} value={item}>
                            {item}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Country Code</label>
                      <select
                        className="form-select"
                        value={createForm.countryCode}
                        onChange={(e) => handleCreateCountryCodeChange(e.target.value)}
                      >
                        {COUNTRY_CODE_OPTIONS.map((option) => (
                          <option key={`${option.country}-${option.callingCode}`} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Tertiary Source</label>
                      <select
                        className="form-select"
                        value={createForm.tertiarySource}
                        onChange={(e) =>
                          setCreateForm((prev) => ({
                            ...prev,
                            tertiarySource: e.target.value,
                          }))
                        }
                      >
                        <option value="">Select Tertiary Source</option>
                        {tertiaryOptions.map((item) => (
                          <option key={item} value={item}>
                            {item}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">
                        Mobile Number <span className="text-danger">*</span>
                      </label>
                      <input
                        className="form-control"
                        value={createForm.mobile}
                        placeholder={`Enter ${createCountryDisplayMaxLength || ""} digit number`}
                        inputMode="numeric"
                        pattern="\d*"
                        maxLength={createCountryDisplayMaxLength || undefined}
                        onChange={(e) => handleCreateMobileChange(e.target.value)}
                      />
                      <div className="d-flex justify-content-between mt-1">
                        <small className="text-muted">
                          {createCountryDisplayMaxLength
                            ? `${createCountryDisplayMaxLength} digits required`
                            : "Numeric value"}
                        </small>
                        {createMobileError && <small className="text-danger">{createMobileError}</small>}
                      </div>
                    </div>
                    <input type="hidden" value={createForm.leadGroupId} readOnly />
                    {createForm.primarySource.toLowerCase() === "channel partner" && (
                      <div className="col-md-6">
                        <label className="form-label">Channel Partner</label>
                        <select
                          className="form-select"
                          value={createForm.channelPartnerId}
                          onChange={(e) =>
                            setCreateForm((prev) => ({
                              ...prev,
                              channelPartnerId: e.target.value,
                            }))
                          }
                        >
                          <option value="">Select Channel Partner</option>
                          {(channelPartners || []).map((cp) => (
                            <option key={cp.id} value={cp.id}>
                              {cp.companyName || cp.partnerName || cp.name || `CP ${cp.id}`}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}
                  </div>

                  {createForm.leadGroupId && (
                    <div className="mt-3">
                      <h6 className="mb-2">Selected Group Members</h6>
                      <div className="table-responsive">
                        <table className="table table-sm table-bordered">
                          <thead className="table-light">
                            <tr>
                              <th>Username</th>
                              <th>Role</th>
                            </tr>
                          </thead>
                          <tbody>
                            {createGroupMembers.length === 0 ? (
                              <tr>
                                <td colSpan={2}>No members in selected group</td>
                              </tr>
                            ) : (
                              createGroupMembers.map((member) => (
                                <tr key={member.userId}>
                                  <td>{member.username || "-"}</td>
                                  <td>{member.role || "-"}</td>
                                </tr>
                              ))
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
                <div className="modal-footer">
                  <button className="btn btn-light" onClick={() => setShowCreate(false)}>
                    Cancel
                  </button>
                  <button className="btn btn-primary" onClick={handleCreateLead} disabled={saving}>
                    {saving ? "Creating..." : "Create Leads"}
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div className="modal-backdrop fade show" />
        </>
      )}

      {showStatusModal && statusLead && (
        <>
          <div className="modal fade show" style={{ display: "block" }} tabIndex="-1">
            <div className="modal-dialog">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">Update Lead Status</h5>
                  <button
                    className="btn-close"
                    onClick={() => {
                      setShowStatusModal(false);
                      setStatusLead(null);
                    }}
                  />
                </div>
                <div className="modal-body">
                  {orderedLeadStatuses.length > 0 && (
                    <div className="mb-3">
                      <div className="d-flex flex-wrap gap-2">
                        {displayStatusOptions.map((item) => (
                          <span
                            key={item}
                            className={`badge ${normalizeStatusLabelKey(item) === normalizeStatusLabelKey(statusValue) ? "bg-primary" : "bg-light text-dark"}`}
                          >
                            {formatStatusLabel(item)}
                          </span>
                        ))}                      </div>
                    </div>
                  )}
                  <div className="mb-3">
                    <label className="form-label">Enquiry Status:</label>
                    <select
                      className="form-select"
                      value={statusValue}
                      onChange={(e) => setStatusValue(e.target.value)}
                    >
                      <option value="">Select Status</option>
                      {displayStatusOptions.map((item) => (
                        <option key={item} value={item}>
                          {formatStatusLabel(item)}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="modal-footer">
                  <button
                    className="btn btn-light"
                    onClick={() => {
                      setShowStatusModal(false);
                      setStatusLead(null);
                    }}
                  >
                    Cancel
                  </button>
                  <button className="btn btn-primary" onClick={saveStatusUpdate} disabled={saving}>
                    {saving ? "Saving..." : "Update Status"}
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div className="modal-backdrop fade show" />
        </>
      )}

      {showDesignDurationModal && statusLead && (
        <>
          <div className="modal fade show" style={{ display: "block" }} tabIndex="-1">
            <div className="modal-dialog">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">Design Duration</h5>
                  <button
                    className="btn-close"
                    onClick={() => {
                      setShowDesignDurationModal(false);
                      setStatusLead(null);
                    }}
                  />
                </div>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label">Design Start</label>
                    <input
                      className="form-control"
                      type="datetime-local"
                      value={designStartAt}
                      onChange={(e) => setDesignStartAt(e.target.value)}
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Design End</label>
                    <input
                      className="form-control"
                      type="datetime-local"
                      value={designEndAt}
                      onChange={(e) => setDesignEndAt(e.target.value)}
                    />
                  </div>
                  <div className="mb-0">
                    <label className="form-label">Duration</label>
                    <input
                      className="form-control"
                      value={getDesignDurationDays(designStartAt, designEndAt) || "-"}
                      readOnly
                    />
                  </div>
                </div>
                <div className="modal-footer">
                  <button
                    className="btn btn-light"
                    onClick={() => {
                      setShowDesignDurationModal(false);
                      setStatusLead(null);
                    }}
                  >
                    Cancel
                  </button>
                  <button className="btn btn-primary" onClick={submitDesignDuration} disabled={saving}>
                    {saving ? "Saving..." : "Save & Continue"}
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div className="modal-backdrop fade show" />
        </>
      )}

      {showRemarkModal && remarkLead && (
        <>
          <div className="modal fade show" style={{ display: "block" }} tabIndex="-1">
            <div className="modal-dialog">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">Update Remark</h5>
                  <button
                    className="btn-close"
                    onClick={() => {
                      setShowRemarkModal(false);
                      setRemarkLead(null);
                    }}
                  />
                </div>
                <div className="modal-body">
                  <div className="mb-2 fw-semibold">{remarkLead?.name || "Lead"}</div>
                  <label className="form-label">Remark</label>
                  <textarea
                    className="form-control"
                    rows={4}
                    value={remarkValue}
                    onChange={(e) => setRemarkValue(e.target.value)}
                    placeholder="Type remark..."
                  />
                </div>
                <div className="modal-footer">
                  <button
                    className="btn btn-light"
                    onClick={() => {
                      setShowRemarkModal(false);
                      setRemarkLead(null);
                    }}
                  >
                    Cancel
                  </button>
                  <button className="btn btn-primary" onClick={saveRemarkUpdate}>
                    Save Remark
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div className="modal-backdrop fade show" />
        </>
      )}

      <ProductionModal
        showProductionModal={showProductionModal}
        setShowProductionModal={setShowProductionModal}
        productType={productType}
        setProductType={setProductType}
        customProductType={customProductType}
        setCustomProductType={setCustomProductType}
        quantity={quantity}
        setQuantity={setQuantity}
        numPages={numPages}
        setNumPages={setNumPages}
        paperSize={paperSize}
        setPaperSize={setPaperSize}
        customSizeWidth={customSizeWidth}
        setCustomSizeWidth={setCustomSizeWidth}
        customSizeHeight={customSizeHeight}
        setCustomSizeHeight={setCustomSizeHeight}
        customSizeUnit={customSizeUnit}
        setCustomSizeUnit={setCustomSizeUnit}
        paperType={paperType}
        setPaperType={setPaperType}
        paperGsm={paperGsm}
        setPaperGsm={setPaperGsm}
        colorType={colorType}
        setColorType={setColorType}
        printSides={printSides}
        setPrintSides={setPrintSides}
        printingMethod={printingMethod}
        setPrintingMethod={setPrintingMethod}
        finishingOptions={finishingOptions}
        setFinishingOptions={setFinishingOptions}
        foldingType={foldingType}
        setFoldingType={setFoldingType}
        artworkFileName={artworkFileName}
        setArtworkFileName={setArtworkFileName}
        artworkFilePath={artworkFilePath}
        setArtworkFilePath={setArtworkFilePath}
        additionalNotes={productionAdditionalNotes}
        setAdditionalNotes={setProductionAdditionalNotes}
        printDeadline={printDeadline}
        setPrintDeadline={setPrintDeadline}
        deliveryDate={deliveryDate}
        setDeliveryDate={setDeliveryDate}
        priority={priority}
        setPriority={setPriority}
        onSubmit={submitProductionRequirement}
      />

      {confirmDialog}
    </div>
  );
}
