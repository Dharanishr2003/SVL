import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { Country, State, City } from "country-state-city";
import {
  createLead,
  deleteLead,
  getAssignableLeadGroups,
  getImportableEmployees,
  getLeadChatMessages,
  getLeadFilters,
  getLeads,
  updateLeadRowStatus,
  getAssignableAllocators,
  updateLeadAllocator,
  updateLeadDetails,
} from "../../api/leadsApi";
import { getLeadStatuses, DEFAULT_LEAD_STATUSES } from "../../api/leadStatusApi";
import { getPrimarySources, createPrimarySource } from "../../api/primarySourceApi";
import { getSecondarySources, createSecondarySource } from "../../api/secondarySourceApi";
import { getTertiarySources } from "../../api/tertiarySourceApi";
import { getGroupMembers, getUserGroups } from "../../api/userGroupApi";
import { getProjects } from "../../api/projectApi";
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
import { useCountryCodePicker } from "../../hooks/useCountryCodePicker";
import "./LeadsPage.css";

const EMPTY_CREATE_FORM = {
  projectName: "",
  name: "",
  email: "",
  mobile: "",
  productType: "",
  primarySource: "",
  secondarySource: "",
  tertiarySource: "",
  leadGroupId: "",
  countryCode: defaultCountryOption.value,
  assignedUserId: "",
  state: "",
  district: "",
  streetAddress: "",
  companyName: "",
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

function getCountryIsoFromPhoneCode(countryCode) {
  const option = getCountryOptionByValue(countryCode);
  if (option?.country) return option.country;

  const phone = String(countryCode || "").replace("+", "").trim();
  if (!phone) return "";

  const matched = Country.getAllCountries().find((country) => country.phonecode === phone);
  return matched?.isoCode || "";
}

function findStateByValue(countryIso, stateValue) {
  const raw = String(stateValue || "").trim();
  if (!countryIso || !raw) return null;

  return State.getStatesOfCountry(countryIso).find(
    (state) =>
      String(state.isoCode || "").toUpperCase() === raw.toUpperCase() ||
      String(state.name || "").toLowerCase() === raw.toLowerCase(),
  ) || null;
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

function PlusGlyph({ size = 14, className = "" }) {
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
      <path d="M12 5v14" />
      <path d="M5 12h14" />
    </svg>
  );
}

export default function LeadsPage() {
  const shouldReduceMotion = useReducedMotion();
  const navigate = useNavigate();
  const { user } = useAuth();
  const role = String(user?.role || "").toUpperCase();
  const { showSuccess, showError } = useToast();
  const { showConfirm, confirmDialog } = useConfirmDialog();
  const [rows, setRows] = useState([]);
  const [filters, setFilters] = useState({
    search: "",
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
  const [createWizardStep, setCreateWizardStep] = useState(0);
  const [createForm, setCreateForm] = useState(EMPTY_CREATE_FORM);
  const [createGroupMembers, setCreateGroupMembers] = useState([]);
  const [createMobileError, setCreateMobileError] = useState("");
  const [flowRules, setFlowRules] = useState([]);
  const [showAddPrimarySource, setShowAddPrimarySource] = useState(false);
  const [showAddSecondarySource, setShowAddSecondarySource] = useState(false);
  const [newPrimarySource, setNewPrimarySource] = useState("");
  const [newSecondarySource, setNewSecondarySource] = useState("");
  const [addSourceLoading, setAddSourceLoading] = useState(false);
  const createNameInputRef = useRef(null);
  const createStateInputRef = useRef(null);

  const handleAddPrimarySource = async () => {
    const value = String(newPrimarySource || "").trim();
    if (!value) {
      showError("Enter a primary source name");
      return;
    }
    setAddSourceLoading(true);
    try {
      await createPrimarySource(value);
      const freshRows = await getPrimarySources();
      const names = toOptionNames(freshRows, ["primarySource", "name", "title"]);
      setPrimaryOptions(names);
      setCreateForm((prev) => ({ ...prev, primarySource: value }));
      setNewPrimarySource("");
      setShowAddPrimarySource(false);
      showSuccess("Primary source added");
    } catch (error) {
      showError(extractApiErrorMessage(error, "Failed to add primary source"));
    } finally {
      setAddSourceLoading(false);
    }
  };

  const handleAddSecondarySource = async () => {
    const value = String(newSecondarySource || "").trim();
    if (!value) {
      showError("Enter a secondary source name");
      return;
    }
    setAddSourceLoading(true);
    try {
      await createSecondarySource(value);
      const freshRows = await getSecondarySources();
      const names = toOptionNames(freshRows, ["secondarySource", "name", "title"]);
      setSecondaryOptions(names);
      setCreateForm((prev) => ({ ...prev, secondarySource: value }));
      setNewSecondarySource("");
      setShowAddSecondarySource(false);
      showSuccess("Secondary source added");
    } catch (error) {
      showError(extractApiErrorMessage(error, "Failed to add secondary source"));
    } finally {
      setAddSourceLoading(false);
    }
  };

  const handleCreateCountryCodeChange = (value) => {
    setCreateForm((p) => ({
      ...p,
      countryCode: ensureCountryCodeValue(value),
      mobile: "",
    }));
    setCreateMobileError("");
    setError("");
  };

  function handleCreateCountryEnter() {
    if (!filteredCountryOptions.length) return;
    handleCreateCountryCodeChange(filteredCountryOptions[0].value);
    closeCreateCountryPicker();
  }

  const {
    isOpen: createCountryPickerOpen,
    pickerRef: createCountryPickerRef,
    closePicker: closeCreateCountryPicker,
    togglePicker: toggleCreateCountryPicker,
    searchQuery: createCountrySearch,
  } = useCountryCodePicker({ onEnter: handleCreateCountryEnter });

  const filteredCountryOptions = useMemo(() => {
    if (!createCountrySearch.trim()) return COUNTRY_CODE_OPTIONS;
    const searchLower = createCountrySearch.toLowerCase();
    return COUNTRY_CODE_OPTIONS.filter(
      (option) =>
        option.label.toLowerCase().includes(searchLower) ||
        option.callingCode.includes(searchLower)
    );
  }, [createCountrySearch]);

  const createCountryIso = useMemo(
    () => getCountryIsoFromPhoneCode(createForm.countryCode),
    [createForm.countryCode],
  );

  const createStateOptions = useMemo(
    () => (createCountryIso ? State.getStatesOfCountry(createCountryIso) : []),
    [createCountryIso],
  );

  const createSelectedState = useMemo(
    () => findStateByValue(createCountryIso, createForm.state),
    [createCountryIso, createForm.state],
  );

  const createDistrictOptions = useMemo(
    () =>
      createCountryIso && createSelectedState?.isoCode
        ? City.getCitiesOfState(createCountryIso, createSelectedState.isoCode)
        : [],
    [createCountryIso, createSelectedState],
  );

  useEffect(() => {
    if (!showCreate) return;

    const targetRef = createWizardStep === 0 ? createNameInputRef : createStateInputRef;
    const timer = window.setTimeout(() => {
      targetRef.current?.focus();
    }, shouldReduceMotion ? 0 : 160);

    return () => window.clearTimeout(timer);
  }, [createWizardStep, shouldReduceMotion, showCreate]);

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
  const [attemptedOpenReason, setAttemptedOpenReason] = useState("");
  const [attemptedCallStatus, setAttemptedCallStatus] = useState("");
  const [attemptedCallRemarks, setAttemptedCallRemarks] = useState("");
  const [attemptedFollowUpDate, setAttemptedFollowUpDate] = useState("");
  const [interestedFollowUpDate, setInterestedFollowUpDate] = useState("");
  const [interestedCallRemarks, setInterestedCallRemarks] = useState("");
  const [rejectedReason, setRejectedReason] = useState("");
  const [rejectedReasonSubtype, setRejectedReasonSubtype] = useState("");
  const [showDesignDurationModal, setShowDesignDurationModal] = useState(false);
  const [designStartAt, setDesignStartAt] = useState("");
  const [designEndAt, setDesignEndAt] = useState("");
  const [showRemarkModal, setShowRemarkModal] = useState(false);
  const [remarkLead, setRemarkLead] = useState(null);
  const [remarkValue, setRemarkValue] = useState("");

  const [saving, setSaving] = useState(false);
  const [selectedLeadIds, setSelectedLeadIds] = useState(new Set());

  const visibleRows = useMemo(() => rows, [rows]);
  const flowScopeByGroupId = useMemo(() => {
    const map = new Map();
    (groupOptions || []).forEach((group) => {
      if (group?.id == null) return;
      const institutionName = String(group?.institutionName || "").trim();
      if (!institutionName) return;
      map.set(String(group.id), institutionName);
    });
    return map;
  }, [groupOptions]);

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
        const canLoadGroupDirectory = role === "SUPER_ADMIN" || role === "ADMIN" || role === "MANAGER";
        const canLoadFlowConfig = role === "SUPER_ADMIN" || role === "ADMIN" || role === "MANAGER";
        const safeLoad = async (loader, fallback) => {
          try {
            return await loader();
          } catch {
            return fallback;
          }
        };
        const [
          primaries,
          secondaries,
          tertiaries,
          projects,
          groups,
          allGroups,
          filterPayload,
          leadStatuses,
          flowPayload,
        ] = await Promise.all([
          safeLoad(() => getPrimarySources(), []),
          safeLoad(() => getSecondarySources(), []),
          safeLoad(() => getTertiarySources(), []),
          safeLoad(() => getProjects(), []),
          safeLoad(() => getAssignableLeadGroups(), []),
          canLoadGroupDirectory ? safeLoad(() => getUserGroups(), []) : Promise.resolve([]),
          safeLoad(() => getLeadFilters(), {}),
          safeLoad(() => getLeadStatuses(), []),
          canLoadFlowConfig ? safeLoad(() => getLeadFlow(), {}) : Promise.resolve({}),
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
        if (role === "TEAM_LEAD") {
          const employees = await getImportableEmployees();
          if (isMounted) {
            setCreateGroupMembers(
              (Array.isArray(employees) ? employees : []).map((e) => ({
                userId: e.id,
                username: e.username,
                role: e.role,
              }))
            );
          }
        } else {
          const members = await getGroupMembers(createForm.leadGroupId);
          if (isMounted) {
            setCreateGroupMembers(Array.isArray(members) ? members : []);
          }
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
  const eligibleCreateGroupMembers = useMemo(
    () =>
      (Array.isArray(createGroupMembers) ? createGroupMembers : []).filter((member) => {
        const roleName = String(member?.role || "").toUpperCase();
        return roleName === "EMPLOYEE";
      }),
    [createGroupMembers],
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
  const fallbackCreateGroup = useMemo(
    () => (leadEligibleGroups.length > 0 ? leadEligibleGroups[0] : null),
    [leadEligibleGroups],
  );
  const defaultCreateLeadGroupId = createAllowedGroup?.id
    ? String(createAllowedGroup.id)
    : newLeadFlowGroupId || (fallbackCreateGroup?.id ? String(fallbackCreateGroup.id) : "");
  const canCreateNewLead = role === "SUPER_ADMIN" || !newLeadFlowGroupId || !!createAllowedGroup;
  const createCountryDisplayMaxLength = getCountryDisplayMaxLength(createForm.countryCode);

  const openCreateModal = () => {
    setCreateForm({
      ...EMPTY_CREATE_FORM,
      leadGroupId: defaultCreateLeadGroupId,
    });
    setCreateGroupMembers([]);
    setShowCreate(true);
    setCreateWizardStep(0);
    setError("");
    setCreateMobileError("");
  };

  useEffect(() => {
    if (!showCreate) return;
    if (createForm.leadGroupId || !defaultCreateLeadGroupId) return;
    setCreateForm((prev) => ({
      ...prev,
      leadGroupId: defaultCreateLeadGroupId,
    }));
  }, [showCreate, createForm.leadGroupId, defaultCreateLeadGroupId]);

  const goToNextCreateStep = () => {
    setCreateWizardStep((step) => Math.min(step + 1, 1));
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
    setSaving(true);
    setError("");
    try {
      const payload = {
        name: createForm.name.trim(),
        email: createForm.email.trim() || null,
        countryCode: createForm.countryCode,
        mobile: createForm.mobile.trim(),
        companyName: createForm.companyName.trim() || null,
        productType: createForm.productType.trim() || null,
        primarySource: createForm.primarySource.trim(),
        secondarySource: createForm.secondarySource.trim() || null,
        tertiarySource: createForm.tertiarySource.trim() || null,
        projectName: createForm.projectName.trim() || null,
        leadGroupId: createForm.leadGroupId ? Number(createForm.leadGroupId) : null,
        assignedUserId: createForm.assignedUserId ? Number(createForm.assignedUserId) : null,
      };

      const created = await createLead(payload);
      setRows((prev) => [created, ...prev]);
      setShowCreate(false);
      setCreateForm(EMPTY_CREATE_FORM);
      setCreateMobileError("");
      setCreateWizardStep(0);
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
    setAttemptedOpenReason("");
    setAttemptedCallStatus("");
    setAttemptedCallRemarks("");
    setAttemptedFollowUpDate("");
    setInterestedFollowUpDate("");
    setInterestedCallRemarks("");
    setRejectedReason("");
    setRejectedReasonSubtype("");
    setShowStatusModal(true);
    setError("");

    const groupId = lead?.leadGroupId ?? lead?.assignedGroupId ?? null;
    const institutionName = groupId != null ? flowScopeByGroupId.get(String(groupId)) : "";
    getLeadFlow(institutionName ? { institutionName } : {})
      .then((flow) => {
        setFlowRules(Array.isArray(flow?.rules) ? flow.rules : []);
      })
      .catch(() => {
        setFlowRules([]);
      });
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
    // Validate and handle Attempted form
    if (nextKey === "attempted") {
      if (!attemptedOpenReason || !attemptedCallStatus) {
        setError("Please complete Open Reason and Call Status for Attempted status");
        return;
      }
    }

    // Validate and handle Interested form
    if (nextKey === "interested") {
      if (!interestedFollowUpDate) {
        setError("Please select Follow Up Date for Interested status");
        return;
      }
    }

    // Validate and handle Rejected form
    if (nextKey === "rejected") {
      if (!rejectedReason) {
        setError("Please select Rejected Reason");
        return;
      }
    }

    if (nextKey === "allocate") {
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
    
    // Handle payment/design/production status with roundâ€‘robin assignment and history
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
          `âœ“ Lead moved to ${nextKey.charAt(0).toUpperCase() + nextKey.slice(1)} status with round-robin assignment`,
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

      // Update lead details with Attempted/Interested/Rejected data
      if (nextKey === "attempted") {
        await updateLeadDetails(statusLead.id, {
          attemptedOpenReason: attemptedOpenReason || null,
          attemptedCallStatus: attemptedCallStatus || null,
          attemptedCallRemarks: attemptedCallRemarks || null,
          attemptedFollowUpDate:
            attemptedCallStatus?.toLowerCase() === "follow up" && attemptedFollowUpDate
              ? new Date(attemptedFollowUpDate).toISOString()
              : null,
        });
      } else if (nextKey === "interested") {
        await updateLeadDetails(statusLead.id, {
          interestedFollowUpDate: interestedFollowUpDate
            ? new Date(interestedFollowUpDate).toISOString()
            : null,
          interestedCallRemarks: interestedCallRemarks || null,
        });
      } else if (nextKey === "rejected") {
        await updateLeadDetails(statusLead.id, {
          rejectedReason: rejectedReason || null,
          rejectedReasonSubtype: rejectedReasonSubtype || null,
        });
      }

      setRows((prev) =>
        prev.map((row) =>
          String(row.id) === String(statusLead.id) ? { ...row, ...nextLead } : row,
        ),
      );
      setShowStatusModal(false);
      if (nextKey === "requirement") {
        navigate(`/leads/${statusLead.id}?openRequirement=1`);
      }
      setStatusLead(null);
      showSuccess("Lead status updated");
      // Reset form fields
      setAttemptedOpenReason("");
      setAttemptedCallStatus("");
      setAttemptedCallRemarks("");
      setAttemptedFollowUpDate("");
      setInterestedFollowUpDate("");
      setInterestedCallRemarks("");
      setRejectedReason("");
      setRejectedReasonSubtype("");
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
  const allowedStatusOptions = useMemo(() => {
    const current = normalizeKey(statusLead?.status);
    if (!current) {
      return orderedLeadStatuses;
    }

    // Find the flow rule for the current status
    const rule = Array.isArray(flowRules)
      ? flowRules.find((r) => normalizeKey(r?.status) === current)
      : null;

    // Rule exists — only show explicitly configured next statuses
    if (rule) {
      if (rule.next && typeof rule.next === "object") {
        const nextKeys = Object.keys(rule.next);
        if (nextKeys.length > 0) {
          return nextKeys.map((item) => String(item || "").trim()).filter(Boolean);
        }
      }
      // Rule exists but no next statuses configured -> block transitions.
      return [];
    }

    // No flow rule at all for this status -> show the configured flow statuses
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
    <div className="container-fluid leads-page-shell">
      <div className="leads-page-header">
        <div>
          <h3 className="mb-2">Leads</h3>
          <p className="text-muted mb-0">Add & Manage Leads</p>
        </div>
        
      </div>
      <div className="leads-page-body">
          <div className="leads-toolbar">
            <div className="d-flex flex-wrap gap-2">
              <button className="btn btn-outline-primary leads-toolbar-btn" onClick={exportExcel}>
                Excel
              </button>
              <button className="btn btn-outline-primary leads-toolbar-btn" onClick={exportCsv}>
                CSV
              </button>
              <button className="btn btn-outline-primary leads-toolbar-btn" onClick={exportPdf}>
                PDF
              </button>
            </div>
            <div className="d-flex flex-wrap gap-2 align-items-center">
              <button
                className="btn btn-outline-warning leads-toolbar-btn"
                onClick={() => setFilterOpen((prev) => !prev)}
              >
                <i className="ti ti-filter me-1" />
                Filter
              </button>
              <button
                className="btn btn-outline-info leads-toolbar-btn"
                onClick={() => navigate('/leads/import')}
              >
                <i className="ti ti-upload me-1" />
                Import Leads
              </button>
              <button
                className="btn btn-success leads-toolbar-btn leads-primary-action"
                onClick={openCreateModal}
              >
                <i className="ti ti-plus me-1" />
                Create New Lead
              </button>
            </div>
          </div>

          <div className="leads-search-row">
            <div className="leads-search-box">
              <label className="mb-0 leads-search-label">Search</label>
              <input
                className="form-control leads-search-input"
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

          <div className="table-responsive leads-table-wrap">
            <table className="table table-hover align-middle leads-table">
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
                    <td colSpan={10}>Loading...</td>
                  </tr>
                ) : visibleRows.length === 0 ? (
                  <tr>
                    <td colSpan={10}>No leads found</td>
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

      {showCreate && (
        <>
          <div className="modal fade show lead-create-modal" style={{ display: "block" }} tabIndex="-1">
            <div className="modal-dialog modal-lg">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">Create New Lead</h5>
                  <button type="button" className="btn-close" onClick={() => setShowCreate(false)} />
                </div>
                <div className="modal-body lead-create-shell">
                  <div className="lead-wizard">
                  {error && (
                    <div className="alert alert-danger py-2 mb-3" role="alert">
                      {error}
                    </div>
                  )}
                  {/* Progress Bar */}
                  <div className="lead-wizard-progress-bar">
                    <motion.div
                      className="lead-wizard-progress"
                      initial={shouldReduceMotion ? false : { width: "0%" }}
                      animate={shouldReduceMotion ? {} : { width: `${((createWizardStep + 1) / 2) * 100}%` }}
                      transition={{ duration: 0.35, ease: "easeOut" }}
                    />
                  </div>

                  {/* Step Circles */}
                  <motion.div
                    className="lead-wizard-circles"
                    initial={shouldReduceMotion ? false : { opacity: 0, y: 10 }}
                    animate={shouldReduceMotion ? {} : { opacity: 1, y: 0 }}
                    transition={{ duration: 0.2, delay: 0.05 }}
                  >
                    <div className="lead-wizard-circle-item" onClick={() => setCreateWizardStep(0)}>
                      <motion.div
                        className={`lead-wizard-circle${createWizardStep >= 0 ? " active" : ""}`}
                        initial={shouldReduceMotion ? false : { scale: 0.94 }}
                        animate={shouldReduceMotion ? {} : { scale: 1 }}
                        transition={{ duration: 0.2, delay: 0.08 }}
                      >
                        <i className="ti ti-user" />
                      </motion.div>
                      <div className="lead-wizard-circle-label">Lead Details</div>
                    </div>
                    <div className="lead-wizard-circle-item" onClick={() => setCreateWizardStep(1)}>
                      <motion.div
                        className={`lead-wizard-circle${createWizardStep >= 1 ? " active" : ""}`}
                        initial={shouldReduceMotion ? false : { scale: 0.94 }}
                        animate={shouldReduceMotion ? {} : { scale: 1 }}
                        transition={{ duration: 0.2, delay: 0.1 }}
                      >
                        <i className="ti ti-map-pin" />
                      </motion.div>
                      <div className="lead-wizard-circle-label">Address</div>
                    </div>
                  </motion.div>

                  <motion.div
                    className="lead-create-grid"
                    initial={shouldReduceMotion ? false : { opacity: 0, y: 12 }}
                    animate={shouldReduceMotion ? {} : { opacity: 1, y: 0 }}
                    transition={{ duration: 0.22, delay: 0.1 }}
                  >
                  <AnimatePresence mode="wait">
                    {/* Step 0: Lead Details */}
                    {createWizardStep === 0 && (
                      <motion.div
                        key="step-0"
                        initial={shouldReduceMotion ? false : { opacity: 0, x: 18, filter: "blur(4px)" }}
                        animate={shouldReduceMotion ? {} : { opacity: 1, x: 0, filter: "blur(0px)" }}
                        exit={shouldReduceMotion ? false : { opacity: 0, x: -18, filter: "blur(4px)" }}
                        transition={{ duration: 0.26, ease: "easeOut" }}
                        className="row g-3 lead-wizard-step-panel"
                      >
                        <div className="col-md-6">
                          <div className="lead-form-stack">
                          <div className="lead-form-field">
                            <label className="form-label">Full Name</label>
                            <input
                              ref={createNameInputRef}
                              className="form-control"
                              value={createForm.name}
                              onChange={(e) =>
                                setCreateForm((prev) => ({ ...prev, name: e.target.value }))
                              }
                              placeholder="Full Name"
                            />
                          </div>

                          <div className="lead-form-field">
                            <label className="form-label">
                              Mobile Number <span className="text-danger">*</span>
                            </label>
                            <div className="lead-phone-field" ref={createCountryPickerRef}>
                              <div className="lead-phone-input-wrap">
                                <button
                                  type="button"
                                  className="lead-phone-code-trigger"
                                  onClick={toggleCreateCountryPicker}
                                  aria-expanded={createCountryPickerOpen}
                                >
                                  <span>{createForm.countryCode}</span>
                                  <i className="ti ti-chevron-down" />
                                </button>
                                <input
                                  className="lead-phone-input"
                                  value={createForm.mobile}
                                  placeholder={`Enter ${createCountryDisplayMaxLength || ""} digit number`}
                                  inputMode="numeric"
                                  pattern="\d*"
                                  maxLength={createCountryDisplayMaxLength || undefined}
                                  onChange={(e) => handleCreateMobileChange(e.target.value)}
                                />
                              </div>
                              {createCountryPickerOpen && (
                                <div className="lead-phone-code-menu">
                                  {filteredCountryOptions.length > 0 ? (
                                    filteredCountryOptions.map((option) => (
                                      <button
                                        key={`${option.country}-${option.callingCode}`}
                                        type="button"
                                        className={`lead-phone-code-option${createForm.countryCode === option.value ? " is-active" : ""}`}
                                        onClick={() => {
                                          handleCreateCountryCodeChange(option.value);
                                          closeCreateCountryPicker();
                                        }}
                                      >
                                        <span>{option.label}</span>
                                      </button>
                                    ))
                                  ) : (
                                    <div className="lead-phone-code-empty">No countries found</div>
                                  )}
                                </div>
                              )}
                            </div>
                            <div className="lead-field-helper-row">
                              <small className="text-muted">
                                {createCountryDisplayMaxLength
                                  ? `${createCountryDisplayMaxLength} digits required`
                                  : "Numeric value"}
                              </small>
                              {createMobileError && <small className="text-danger">{createMobileError}</small>}
                            </div>
                          </div>

                          <div className="lead-form-field">
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
                          </div>
                        </div>

                        <div className="col-md-6">
                          <div className="lead-form-stack">
                          <div className="lead-form-field">
                            <div className="lead-source-label-row">
                              <label className="form-label mb-0">Primary Source</label>
                              <button
                                type="button"
                                className="lead-source-add-btn"
                                onClick={() => setShowAddPrimarySource(true)}
                                aria-label="Add primary source"
                              >
                                <PlusGlyph size={14} />
                              </button>
                            </div>
                            <select
                              className="form-select"
                              value={createForm.primarySource}
                              onChange={(e) =>
                                setCreateForm((prev) => ({
                                  ...prev,
                                  primarySource: e.target.value,
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

                          <div className="lead-form-field">
                            <div className="lead-source-label-row">
                              <label className="form-label mb-0">Secondary Source</label>
                              <button
                                type="button"
                                className="lead-source-add-btn"
                                onClick={() => setShowAddSecondarySource(true)}
                                aria-label="Add secondary source"
                              >
                                <PlusGlyph size={14} />
                              </button>
                            </div>
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
                          <div className="lead-form-field">
                            <label className="form-label">Company Name</label>
                            <input
                              className="form-control"
                              value={createForm.companyName}
                              onChange={(e) =>
                                setCreateForm((prev) => ({ ...prev, companyName: e.target.value }))
                              }
                              placeholder="Company Name"
                            />
                          </div>
                          </div>
                        </div>

                        <div className="col-12">
                          <label className="form-label">Type of Product</label>
                          <textarea
                            className="form-control"
                            value={createForm.productType}
                            onChange={(e) =>
                              setCreateForm((prev) => ({ ...prev, productType: e.target.value }))
                            }
                            placeholder="e.g. Visiting Card, Zipper pouch, Poster, etc"
                            rows="2"
                            style={{ resize: "vertical" }}
                          />
                        </div>

                        <input type="hidden" value={createForm.leadGroupId} readOnly />
                      </motion.div>
                    )}

                    {/* Step 1: Address */}
                    {createWizardStep === 1 && (
                      <motion.div
                        key="step-1"
                        initial={shouldReduceMotion ? false : { opacity: 0, x: 18, filter: "blur(4px)" }}
                        animate={shouldReduceMotion ? {} : { opacity: 1, x: 0, filter: "blur(0px)" }}
                        exit={shouldReduceMotion ? false : { opacity: 0, x: -18, filter: "blur(4px)" }}
                        transition={{ duration: 0.26, ease: "easeOut" }}
                        className="row g-3 lead-wizard-step-panel"
                      >
                        <div className="col-md-6">
                          <div className="lead-form-field">
                            <label className="form-label">State</label>
                            <select
                              ref={createStateInputRef}
                              className="form-select"
                              value={createForm.state}
                              onChange={(e) =>
                                setCreateForm((prev) => ({
                                  ...prev,
                                  state: e.target.value,
                                  district: "",
                                }))
                              }
                              disabled={!createCountryIso || !createStateOptions.length}
                            >
                              <option value="">Select State</option>
                              {createStateOptions.map((state) => (
                                <option key={state.isoCode} value={state.isoCode}>
                                  {state.name}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>
                        <div className="col-md-6">
                          <div className="lead-form-field">
                            <label className="form-label">District</label>
                            <select
                              className="form-select"
                              value={createForm.district}
                              onChange={(e) =>
                                setCreateForm((prev) => ({ ...prev, district: e.target.value }))
                              }
                              disabled={!createSelectedState || !createDistrictOptions.length}
                            >
                              <option value="">Select District</option>
                              {createDistrictOptions.map((district) => (
                                <option key={`${district.stateCode}-${district.name}`} value={district.name}>
                                  {district.name}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>
                        <div className="col-12">
                          <label className="form-label">Street Address</label>
                          <textarea
                            className="form-control"
                            value={createForm.streetAddress}
                            onChange={(e) =>
                              setCreateForm((prev) => ({ ...prev, streetAddress: e.target.value }))
                            }
                            placeholder="Enter street address"
                            rows="2"
                            style={{ resize: "vertical" }}
                          />
                        </div>

                        {role === "EMPLOYEE" ? (
                          <div className="col-12">
                            <div className="lead-assignment-note alert alert-info py-2 mb-0">
                              This lead will be assigned to you.
                            </div>
                          </div>
                        ) : createForm.leadGroupId && (
                          <div className="col-12">
                            <div className="lead-assignment-box">
                              <label className="form-label">Assign To Employee</label>
                              <select
                                className="form-select"
                                value={createForm.assignedUserId}
                                onChange={(e) =>
                                  setCreateForm((prev) => ({ ...prev, assignedUserId: e.target.value }))
                                }
                              >
                                <option value="">Auto assign</option>
                                {eligibleCreateGroupMembers.map((member) => (
                                  <option key={member.userId} value={member.userId}>
                                    {member.username || `User ${member.userId}`}
                                  </option>
                                ))}
                              </select>
                              {eligibleCreateGroupMembers.length === 0 && (
                                <small className="text-muted">No eligible employees in selected group.</small>
                              )}
                            </div>
                          </div>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                  </motion.div>

                  {/* Wizard Navigation */}
                  <motion.div
                    className="lead-wizard-nav"
                    initial={shouldReduceMotion ? false : { opacity: 0, y: 8 }}
                    animate={shouldReduceMotion ? {} : { opacity: 1, y: 0 }}
                    transition={{ duration: 0.18, delay: 0.18 }}
                  >
                    {createWizardStep > 0 ? (
                      <button type="button" className="btn btn-light" onClick={() => setCreateWizardStep((s) => s - 1)} disabled={saving}>
                        Previous
                      </button>
                    ) : (
                      <div />
                    )}
                    {createWizardStep < 1 ? (
                      <button type="button" className="btn btn-primary" onClick={goToNextCreateStep}>
                        Next
                      </button>
                    ) : (
                      <button type="button" className="btn btn-primary" onClick={handleCreateLead} disabled={saving}>
                        {saving ? "Creating..." : "Create Lead"}
                      </button>
                    )}
                  </motion.div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="modal-backdrop fade show lead-create-backdrop" />
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

                  {/* Attempted Status Form */}
                  {String(statusValue || "").trim().toLowerCase() === "attempted" && (
                    <div className="border-top pt-3 mt-3">
                      <h6 className="mb-3 text-primary">Attempted Details</h6>
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
                    </div>
                  )}

                  {/* Interested Status Form */}
                  {String(statusValue || "").trim().toLowerCase() === "interested" && (
                    <div className="border-top pt-3 mt-3">
                      <h6 className="mb-3 text-primary">Interested Details</h6>
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
                    </div>
                  )}

                  {/* Rejected Status Form */}
                  {String(statusValue || "").trim().toLowerCase() === "rejected" && (
                    <div className="border-top pt-3 mt-3">
                      <h6 className="mb-3 text-primary">Rejected Details</h6>
                      <div className="mb-3">
                        <label className="form-label">Rejected Reason</label>
                        <select
                          className="form-select"
                          value={rejectedReason}
                          onChange={(e) => setRejectedReason(e.target.value)}
                        >
                          <option value="">Select Reject Reason</option>
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
                          placeholder="Rejected Reason Subtype / Details"
                        />
                      </div>
                    </div>
                  )}
                </div>
                <div className="modal-footer">
                  <button
                    className="btn btn-light"
                    onClick={() => {
                      setShowStatusModal(false);
                      setStatusLead(null);
                      setStatusValue("");
                      setAttemptedOpenReason("");
                      setAttemptedCallStatus("");
                      setAttemptedCallRemarks("");
                      setAttemptedFollowUpDate("");
                      setInterestedFollowUpDate("");
                      setInterestedCallRemarks("");
                      setRejectedReason("");
                      setRejectedReasonSubtype("");
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

      {showAddPrimarySource && (
        <>
          <div className="modal fade show lead-source-modal" style={{ display: "block" }} tabIndex="-1">
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">Add Primary Source</h5>
                  <button
                    className="btn-close"
                    onClick={() => {
                      if (addSourceLoading) return;
                      setShowAddPrimarySource(false);
                      setNewPrimarySource("");
                    }}
                  />
                </div>
                <div className="modal-body">
                  <label className="form-label">Primary Source Name</label>
                  <input
                    className="form-control"
                    value={newPrimarySource}
                    onChange={(e) => setNewPrimarySource(e.target.value)}
                    placeholder="Enter primary source"
                    autoFocus
                  />
                </div>
                <div className="modal-footer">
                  <button
                    className="btn btn-light"
                    onClick={() => {
                      if (addSourceLoading) return;
                      setShowAddPrimarySource(false);
                      setNewPrimarySource("");
                    }}
                  >
                    Cancel
                  </button>
                  <button className="btn btn-primary" onClick={handleAddPrimarySource} disabled={addSourceLoading}>
                    {addSourceLoading ? "Saving..." : "Save"}
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div className="modal-backdrop fade show lead-create-backdrop" />
        </>
      )}

      {showAddSecondarySource && (
        <>
          <div className="modal fade show lead-source-modal" style={{ display: "block" }} tabIndex="-1">
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">Add Secondary Source</h5>
                  <button
                    className="btn-close"
                    onClick={() => {
                      if (addSourceLoading) return;
                      setShowAddSecondarySource(false);
                      setNewSecondarySource("");
                    }}
                  />
                </div>
                <div className="modal-body">
                  <label className="form-label">Secondary Source Name</label>
                  <input
                    className="form-control"
                    value={newSecondarySource}
                    onChange={(e) => setNewSecondarySource(e.target.value)}
                    placeholder="Enter secondary source"
                    autoFocus
                  />
                </div>
                <div className="modal-footer">
                  <button
                    className="btn btn-light"
                    onClick={() => {
                      if (addSourceLoading) return;
                      setShowAddSecondarySource(false);
                      setNewSecondarySource("");
                    }}
                  >
                    Cancel
                  </button>
                  <button className="btn btn-primary" onClick={handleAddSecondarySource} disabled={addSourceLoading}>
                    {addSourceLoading ? "Saving..." : "Save"}
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div className="modal-backdrop fade show lead-create-backdrop" />
        </>
      )}

      {confirmDialog}
    </div>
  );
}
