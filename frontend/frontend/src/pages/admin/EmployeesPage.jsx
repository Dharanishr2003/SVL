import React, { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  getEmployees,
  createEmployee,
  updateEmployee,
  deleteEmployee,
  onboardEmployee,
  updateOnboardEmployee,
  sendOfferLetterEmail,
  resendOfferLetterEmail,
} from "../../api/employeesApi";
import { getDepartmentsMaster, getDepartmentsMasterByBranch } from "../../api/departmentsApi";
import { getDesignations } from "../../api/designationsApi";
import { getHeadOffices } from "../../api/headOfficesApi";
import { getBranches } from "../../api/branchesApi";
import EmployeeWizardModal from "../../components/admin/EmployeeWizardModal";
import {
  getDepartments as getOrgDepartments,
  getInstitutionCategories,
  getInstitutions,
  getInstitutionTypes,
  getTeams as getOrgTeams,
  getUserOrgSelection,
} from "../../api/orgHierarchyApi";
import { useAuth } from "../../context/AuthContext";
import { extractApiErrorMessage } from "../../utils/errorMessage";
import { useToast } from "../../components/system/ToastProvider";
import useConfirmDialog from "../../components/system/useConfirmDialog";
import {
  COUNTRY_CODE_OPTIONS,
  defaultCountryOption,
  validatePhoneNumber,
  sanitizePhoneDigits,
  getCountryDisplayMaxLength,
} from "../../utils/phoneUtils";

const EMPTY_FORM = {
  employeeCode: "",
  name: "",
  email: "",
  countryCode: defaultCountryOption.value,
  phone: "",
  dept: "",
  institution: "",
  institutionCategory: "",
  institutionType: "",
  userDepartmentName: "",
  team: "",
  designation: "",
  joinDate: "",
  status: "ACTIVE",
  img: "assets/img/users/user-32.jpg",
};

const EMPTY_ONBOARD_FORM = {
  nameInCaps: "",
  employeeIdNumber: "",
  fatherName: "",
  motherName: "",
  personalContactNumber: "",
  alternateContactNumber: "",
  location: "",
  pinCode: "",
  state: "",
  currentAddress: "",
  permanentAddress: "",
  personalEmail: "",
  officialEmail: "",
  dateOfBirth: "",
  dateOfJoining: "",
  maritalStatus: "",
  spouseName: "",
  bloodGroup: "",
  panCardNo: "",
  aadharCardNo: "",
  candidatePhoto: null,
  uploadCandidateAadharCard: null,
  uploadCandidatePanCard: null,
  uploadBankPassBookCopy: null,
  uploadExperienceCertificate: null,
  uploadGraduationCertificate: null,
  uploadGraduationMarksheet: null,
  uploadHscMarkSheet: null,
  uploadSslcMarkSheet: null,
  uploadCommunityCertificate: null,
  bankAccountHolderName: "",
  bankAccountNumber: "",
  ifscCode: "",
  bankAndBranch: "",
  employmentDetails1: "",
  employmentDetails2: "",
  graduationDetails: "",
  hscMarkAndYear: "",
  sslcMarkAndYear: "",
  emergencyContactName1: "",
  emergencyContactRelation1: "",
  emergencyContactPhone1: "",
  emergencyContactName2: "",
  emergencyContactRelation2: "",
  emergencyContactPhone2: "",
  friendRefName1: "",
  friendRefContact1: "",
  friendRefName2: "",
  friendRefContact2: "",
  branchToJoin: "",
  platformSource: "",
  pfUan: "",
  esiNo: "",
  declarationDate: "",
  declarationPlace: "",
  // existing file paths (edit mode display only)
  candidatePhotoPath: "",
  aadharCardPath: "",
  panCardPath: "",
  bankPassbookPath: "",
  experienceCertificatePath: "",
  graduationCertificatePath: "",
  graduationMarksheetPath: "",
  hscMarksheetPath: "",
  sslcMarksheetPath: "",
  communityCertificatePath: "",
};

function isActiveMaster(item) {
  return String(item?.status || "ACTIVE").toUpperCase() !== "INACTIVE";
}

function withInactiveSelected(items, selectedId) {
  const list = Array.isArray(items) ? items : [];
  const active = list.filter(isActiveMaster);
  if (!selectedId) return active;

  const selected = list.find((it) => String(it?.id) === String(selectedId));
  if (!selected || isActiveMaster(selected)) return active;

  // keep the selected inactive value visible in edit mode
  return [
    ...active,
    { ...selected, name: `${selected?.name || "Selected"} (Inactive)` },
  ];
}

function toUiRow(item) {
  return {
    id: item?.id ?? null,
    employeeCode: item?.employeeCode || item?.employeeId || "",
    name: item?.name || "",
    email: item?.email || item?.officialEmail || item?.personalEmail || "",
    countryCode: item?.countryCode || defaultCountryOption.value,
    phone: item?.phone || item?.personalContactNumber || "",
    dept:
      item?.dept ||
      item?.department ||
      item?.departmentName ||
      item?.userDepartmentName ||
      item?.orgDepartmentName ||
      "",
    institution: item?.institution || item?.institutionName || "",
    institutionCategory:
      item?.institutionCategory ||
      item?.institution_category ||
      item?.category ||
      "",
    institutionType: item?.institutionType || item?.institution_type || "",
    userDepartmentName:
      item?.userDepartmentName ||
      item?.orgDepartmentName ||
      item?.departmentName ||
      item?.user_department_name ||
      "",
    team: item?.team || item?.orgTeam || item?.userTeam || "",
    designation: item?.designation || "",
    joinDate: item?.joinDate || "",
    status: String(item?.status || "ACTIVE").toUpperCase(),
    profileStatus: item?.profileStatus || item?.profile_status || "",
    offerLetterSent: Boolean(item?.offerLetterSent),
    offerLetterLinkExpiresAt: item?.offerLetterLinkExpiresAt || null,
    img: item?.img || "assets/img/users/user-32.jpg",
    _raw: item,
  };
}

function toApiPayload(form) {
  return {
    name: form.name?.trim() || "",
    email: form.email?.trim() || "",
    countryCode: form.countryCode || defaultCountryOption.value,
    phone: form.phone?.trim() || "",
    dept: form.dept?.trim() || "",
    institution: form.institution?.trim() || "",
    institutionCategory: form.institutionCategory?.trim() || "",
    institutionType: form.institutionType?.trim() || "",
    userDepartmentName: form.userDepartmentName?.trim() || "",
    team: form.team?.trim() || "",
    designation: form.designation?.trim() || "",
    joinDate: form.joinDate || null,
    status: String(form.status || "ACTIVE").toUpperCase(),
    img: form.img || "assets/img/users/user-32.jpg",
  };
}

function EditGlyph({ size = 14, className = "" }) {
  return (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 20h9" /><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z" />
    </svg>
  );
}

function TrashGlyph({ size = 14, className = "" }) {
  return (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" /><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
    </svg>
  );
}

export default function EmployeesPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const { showSuccess, showError } = useToast();
  const { showConfirm, confirmDialog } = useConfirmDialog();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [metaLoading, setMetaLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [departments, setDepartments] = useState([]);
  const [designations, setDesignations] = useState([]);

  const [showModal, setShowModal] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [selectedId, setSelectedId] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [phoneError, setPhoneError] = useState("");
  const [orgSelection, setOrgSelection] = useState(null);
  const [orgInstitutionId, setOrgInstitutionId] = useState("");
  const [orgCategoryId, setOrgCategoryId] = useState("");
  const [orgTypeId, setOrgTypeId] = useState("");
  const [orgDepartmentId, setOrgDepartmentId] = useState("");
  const [orgTeamId, setOrgTeamId] = useState("");
  const [orgInstitutions, setOrgInstitutions] = useState([]);
  const [orgCategories, setOrgCategories] = useState([]);
  const [orgTypes, setOrgTypes] = useState([]);
  const [orgDepartments, setOrgDepartments] = useState([]);
  const [orgTeams, setOrgTeams] = useState([]);

  const [showOnboardWizard, setShowOnboardWizard] = useState(false);
  const [onboardStep, setOnboardStep] = useState(0);
  const [onboardForm, setOnboardForm] = useState(EMPTY_ONBOARD_FORM);
  const [onboardMode, setOnboardMode] = useState("create"); // create | edit
  const [onboardEditId, setOnboardEditId] = useState(null);
  const prevOnboardHeadOfficeIdRef = useRef(null);
  const prevOnboardBranchIdRef = useRef(null);
  const prevOnboardDepartmentIdRef = useRef(null);
  const [hoLoading, setHoLoading] = useState(false);
  const [headOffices, setHeadOffices] = useState([]);
  const [branches, setBranches] = useState([]);
  const [branchLoading, setBranchLoading] = useState(false);
  const [onboardDepartments, setOnboardDepartments] = useState([]);
  const [deptLoading, setDeptLoading] = useState(false);
  const [onboardDesignations, setOnboardDesignations] = useState([]);
  const [desigLoading, setDesigLoading] = useState(false);
  const [onboardHeadOfficeId, setOnboardHeadOfficeId] = useState("");
  const [onboardBranchId, setOnboardBranchId] = useState("");
  const [onboardDepartmentId, setOnboardDepartmentId] = useState("");
  const [onboardDesignationId, setOnboardDesignationId] = useState("");

  const gridView = location.pathname.endsWith("/employees-grid");

  const [filterOpen, setFilterOpen] = useState(false);
  const [linkModalOpen, setLinkModalOpen] = useState(false);
  const [generatedLink, setGeneratedLink] = useState("");
  const [generatedLinkEmployee, setGeneratedLinkEmployee] = useState(null);
  const [filters, setFilters] = useState({
    headOfficeId: "",
    branchId: "",
    departmentId: "",
    designationId: "",
    profileStatus: "",
  });

  async function handleSendOfferLetter(emp) {
    try {
      const res = await sendOfferLetterEmail(emp.id);
      setGeneratedLink(res?.publicUrl || "");
      setGeneratedLinkEmployee(emp);
      setLinkModalOpen(true);
      showSuccess("Offer letter sent");
      await loadData();
    } catch (e) {
      showError(extractApiErrorMessage(e, "Failed to send offer letter"));
    }
  }

  async function handleResendOfferLetter(emp) {
    try {
      const res = await resendOfferLetterEmail(emp.id);
      setGeneratedLink(res?.publicUrl || "");
      setGeneratedLinkEmployee(emp);
      setLinkModalOpen(true);
      showSuccess("Offer letter resent");
      await loadData();
    } catch (e) {
      showError(extractApiErrorMessage(e, "Failed to resend offer letter"));
    }
  }
  const [filterBranches, setFilterBranches] = useState([]);
  const [filterDepartments, setFilterDepartments] = useState([]);
  const [filterDesignations, setFilterDesignations] = useState([]);
  const [filterLoading, setFilterLoading] = useState(false);

  const activeHeadOffices = useMemo(() => (headOffices || []).filter(isActiveMaster), [headOffices]);
  const activeFilterBranches = useMemo(() => (filterBranches || []).filter(isActiveMaster), [filterBranches]);
  const activeFilterDepartments = useMemo(() => (filterDepartments || []).filter(isActiveMaster), [filterDepartments]);
  const activeFilterDesignations = useMemo(() => (filterDesignations || []).filter(isActiveMaster), [filterDesignations]);
  const activeBranches = useMemo(() => (branches || []).filter(isActiveMaster), [branches]);
  const activeOnboardDepartments = useMemo(() => (onboardDepartments || []).filter(isActiveMaster), [onboardDepartments]);
  const activeOnboardDesignations = useMemo(() => (onboardDesignations || []).filter(isActiveMaster), [onboardDesignations]);

  const wizardHeadOffices = useMemo(() => {
    if (onboardMode !== "edit") return activeHeadOffices;
    return withInactiveSelected(headOffices, onboardHeadOfficeId);
  }, [activeHeadOffices, headOffices, onboardMode, onboardHeadOfficeId]);

  const wizardBranches = useMemo(() => {
    if (onboardMode !== "edit") return activeBranches;
    return withInactiveSelected(branches, onboardBranchId);
  }, [activeBranches, branches, onboardMode, onboardBranchId]);

  const wizardDepartments = useMemo(() => {
    if (onboardMode !== "edit") return activeOnboardDepartments;
    return withInactiveSelected(onboardDepartments, onboardDepartmentId);
  }, [activeOnboardDepartments, onboardDepartments, onboardMode, onboardDepartmentId]);

  const wizardDesignations = useMemo(() => {
    if (onboardMode !== "edit") return activeOnboardDesignations;
    return withInactiveSelected(onboardDesignations, onboardDesignationId);
  }, [activeOnboardDesignations, onboardDesignations, onboardMode, onboardDesignationId]);

  const filteredRows = useMemo(() => {
    return rows.filter((emp) => {
      const raw = emp?._raw || {};
      return (
        (!filters.headOfficeId || String(raw.headOfficeId || "") === String(filters.headOfficeId)) &&
        (!filters.branchId || String(raw.branchId || "") === String(filters.branchId)) &&
        (!filters.departmentId || String(raw.departmentMasterId || "") === String(filters.departmentId)) &&
        (!filters.designationId || String(raw.designationMasterId || "") === String(filters.designationId)) &&
        (!filters.profileStatus ||
          String(raw.profileStatus || emp.profileStatus || "").toUpperCase() ===
            String(filters.profileStatus).toUpperCase())
      );
    });
  }, [rows, filters]);

 
  const loadData = async () => {
    setLoading(true);
    try {
      const data = await getEmployees();
      setRows((Array.isArray(data) ? data : []).map(toUiRow));
    } catch (e) {
      showError(extractApiErrorMessage(e, "Failed to load employees"));
      setRows([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const loadMeta = async () => {
    setMetaLoading(true);
    try {
      const [deps, desigs] = await Promise.all([getDepartmentsMaster(), getDesignations()]);
      setDepartments(Array.isArray(deps) ? deps : []);
      setDesignations(Array.isArray(desigs) ? desigs : []);
    } catch (e) {
      showError(extractApiErrorMessage(e, "Failed to load departments/designations"));
    } finally {
      setMetaLoading(false);
    }
  };

  useEffect(() => {
    loadMeta();
  }, []);

  useEffect(() => {
    (async () => {
      setHoLoading(true);
      try {
        const data = await getHeadOffices();
        setHeadOffices(Array.isArray(data) ? data : []);
      } catch (e) {
        setHeadOffices([]);
        showError(extractApiErrorMessage(e, "Failed to load head offices"));
      } finally {
        setHoLoading(false);
      }
    })();
  }, [showError]);

  // Filter drawer cascading options
  useEffect(() => {
    (async () => {
      const hoId = filters.headOfficeId;
      setFilterBranches([]);
      setFilterDepartments([]);
      setFilterDesignations([]);
      if (!hoId) return;
      setFilterLoading(true);
      try {
        const list = await getBranches(hoId);
        setFilterBranches(Array.isArray(list) ? list : []);
      } catch {
        setFilterBranches([]);
      } finally {
        setFilterLoading(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.headOfficeId]);

  useEffect(() => {
    (async () => {
      const branchId = filters.branchId;
      setFilterDepartments([]);
      setFilterDesignations([]);
      if (!branchId) return;
      setFilterLoading(true);
      try {
        const deps = await getDepartmentsMasterByBranch(branchId);
        setFilterDepartments(Array.isArray(deps) ? deps : []);
      } catch {
        setFilterDepartments([]);
      } finally {
        setFilterLoading(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.branchId]);

  useEffect(() => {
    (async () => {
      const deptId = filters.departmentId;
      setFilterDesignations([]);
      if (!deptId) return;
      setFilterLoading(true);
      try {
        const list = await getDesignations(deptId);
        setFilterDesignations(Array.isArray(list) ? list : []);
      } catch {
        setFilterDesignations([]);
      } finally {
        setFilterLoading(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.departmentId]);

  useEffect(() => {
    (async () => {
      if (!onboardHeadOfficeId) {
        setBranches([]);
        if (onboardMode === "create") {
          setOnboardBranchId("");
          setOnboardDepartments([]);
          setOnboardDepartmentId("");
          setOnboardDesignations([]);
          setOnboardDesignationId("");
        }
        return;
      }
      setBranchLoading(true);
      try {
        const data = await getBranches(onboardHeadOfficeId);
        const list = Array.isArray(data) ? data : [];
        setBranches(list);
        // Keep existing selection for edit mode if still valid
        if (onboardMode === "edit") {
          const valid = onboardBranchId && list.some((b) => String(b.id) === String(onboardBranchId));
          if (!valid) setOnboardBranchId("");
        }
      } catch {
        setBranches([]);
      } finally {
        setBranchLoading(false);
      }
      const prevHo = prevOnboardHeadOfficeIdRef.current;
      const hoChanged = prevHo !== null && String(prevHo) !== String(onboardHeadOfficeId);
      prevOnboardHeadOfficeIdRef.current = onboardHeadOfficeId;
      if (onboardMode === "create" || hoChanged) {
        setOnboardBranchId("");
        setOnboardDepartments([]);
        setOnboardDepartmentId("");
        setOnboardDesignations([]);
        setOnboardDesignationId("");
      }
    })();
  }, [onboardHeadOfficeId]);

  useEffect(() => {
    (async () => {
      if (!onboardBranchId) {
        setOnboardDepartments([]);
        if (onboardMode === "create") {
          setOnboardDepartmentId("");
          setOnboardDesignations([]);
          setOnboardDesignationId("");
        }
        return;
      }
      setDeptLoading(true);
      try {
        const deps = await getDepartmentsMasterByBranch(onboardBranchId);
        const list = Array.isArray(deps) ? deps : [];
        setOnboardDepartments(list);
        if (onboardMode === "edit") {
          const valid = onboardDepartmentId && list.some((d) => String(d.id) === String(onboardDepartmentId));
          if (!valid) setOnboardDepartmentId("");
        }
      } catch {
        setOnboardDepartments([]);
      } finally {
        setDeptLoading(false);
      }
      const prevBranch = prevOnboardBranchIdRef.current;
      const branchChanged = prevBranch !== null && String(prevBranch) !== String(onboardBranchId);
      prevOnboardBranchIdRef.current = onboardBranchId;
      if (onboardMode === "create" || branchChanged) {
        setOnboardDepartmentId("");
        setOnboardDesignations([]);
        setOnboardDesignationId("");
      }
    })();
  }, [onboardBranchId]);

  useEffect(() => {
    (async () => {
      if (!onboardDepartmentId) {
        setOnboardDesignations([]);
        if (onboardMode === "create") {
          setOnboardDesignationId("");
        }
        return;
      }
      setDesigLoading(true);
      try {
        const list = await getDesignations(onboardDepartmentId);
        const items = Array.isArray(list) ? list : [];
        setOnboardDesignations(items);
        if (onboardMode === "edit") {
          const valid = onboardDesignationId && items.some((d) => String(d.id) === String(onboardDesignationId));
          if (!valid) setOnboardDesignationId("");
        }
      } catch {
        setOnboardDesignations([]);
      } finally {
        setDesigLoading(false);
      }
      const prevDept = prevOnboardDepartmentIdRef.current;
      const deptChanged = prevDept !== null && String(prevDept) !== String(onboardDepartmentId);
      prevOnboardDepartmentIdRef.current = onboardDepartmentId;
      if (onboardMode === "create" || deptChanged) {
        setOnboardDesignationId("");
      }
    })();
  }, [onboardDepartmentId]);

  useEffect(() => {
    let active = true;
    const loadOrgSelection = async () => {
      if (!currentUser?.id) return;
      try {
        const selection = await getUserOrgSelection(currentUser.id);
        if (!active) return;
        setOrgSelection(selection || null);
      } catch {
        if (!active) return;
        setOrgSelection(null);
      }
    };
    loadOrgSelection();
    return () => {
      active = false;
    };
  }, [currentUser?.id]);

  useEffect(() => {
    let active = true;
    const loadOrgInstitutions = async () => {
      try {
        const data = await getInstitutions();
        if (!active) return;
        setOrgInstitutions(Array.isArray(data) ? data : []);
      } catch {
        if (!active) return;
        setOrgInstitutions([]);
      }
    };
    loadOrgInstitutions();
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    let active = true;
    const loadCategories = async () => {
      if (!orgInstitutionId) {
        setOrgCategories([]);
        return;
      }
      try {
        const data = await getInstitutionCategories(orgInstitutionId);
        if (!active) return;
        setOrgCategories(Array.isArray(data) ? data : []);
      } catch {
        if (!active) return;
        setOrgCategories([]);
      }
    };
    loadCategories();
    return () => {
      active = false;
    };
  }, [orgInstitutionId]);

  useEffect(() => {
    let active = true;
    const loadTypes = async () => {
      if (!orgInstitutionId || !orgCategoryId) {
        setOrgTypes([]);
        return;
      }
      try {
        const data = await getInstitutionTypes(orgInstitutionId, orgCategoryId);
        if (!active) return;
        setOrgTypes(Array.isArray(data) ? data : []);
      } catch {
        if (!active) return;
        setOrgTypes([]);
      }
    };
    loadTypes();
    return () => {
      active = false;
    };
  }, [orgInstitutionId, orgCategoryId]);

  useEffect(() => {
    let active = true;
    const loadDepartments = async () => {
      if (!orgInstitutionId || !orgCategoryId || !orgTypeId) {
        setOrgDepartments([]);
        return;
      }
      try {
        const data = await getOrgDepartments(orgInstitutionId, orgCategoryId, orgTypeId);
        if (!active) return;
        setOrgDepartments(Array.isArray(data) ? data : []);
      } catch {
        if (!active) return;
        setOrgDepartments([]);
      }
    };
    loadDepartments();
    return () => {
      active = false;
    };
  }, [orgInstitutionId, orgCategoryId, orgTypeId]);

  useEffect(() => {
    let active = true;
    const loadTeams = async () => {
      if (!orgInstitutionId || !orgCategoryId || !orgTypeId || !orgDepartmentId) {
        setOrgTeams([]);
        return;
      }
      try {
        const data = await getOrgTeams(
          orgInstitutionId,
          orgCategoryId,
          orgTypeId,
          orgDepartmentId,
        );
        if (!active) return;
        setOrgTeams(Array.isArray(data) ? data : []);
      } catch {
        if (!active) return;
        setOrgTeams([]);
      }
    };
    loadTeams();
    return () => {
      active = false;
    };
  }, [orgInstitutionId, orgCategoryId, orgTypeId, orgDepartmentId]);

  useEffect(() => {
    if (!showModal || !isEdit) return;
    if (!orgInstitutionId && form.institution) {
      const match = orgInstitutions.find(
        (item) =>
          String(item?.name || "").toLowerCase() ===
          String(form.institution || "").toLowerCase(),
      );
      if (match?.id) setOrgInstitutionId(String(match.id));
    }
  }, [showModal, isEdit, form.institution, orgInstitutionId, orgInstitutions]);

  useEffect(() => {
    if (!showModal || !isEdit) return;
    if (!orgCategoryId && form.institutionCategory) {
      const match = orgCategories.find(
        (item) =>
          String(item?.name || "").toLowerCase() ===
          String(form.institutionCategory || "").toLowerCase(),
      );
      if (match?.id) setOrgCategoryId(String(match.id));
    }
  }, [showModal, isEdit, form.institutionCategory, orgCategoryId, orgCategories]);

  useEffect(() => {
    if (!showModal || !isEdit) return;
    if (!orgTypeId && form.institutionType) {
      const match = orgTypes.find(
        (item) =>
          String(item?.name || "").toLowerCase() ===
          String(form.institutionType || "").toLowerCase(),
      );
      if (match?.id) setOrgTypeId(String(match.id));
    }
  }, [showModal, isEdit, form.institutionType, orgTypeId, orgTypes]);

  useEffect(() => {
    if (!showModal || !isEdit) return;
    if (!orgDepartmentId && form.userDepartmentName) {
      const match = orgDepartments.find(
        (item) =>
          String(item?.name || "").toLowerCase() ===
          String(form.userDepartmentName || "").toLowerCase(),
      );
      if (match?.id) setOrgDepartmentId(String(match.id));
    }
  }, [showModal, isEdit, form.userDepartmentName, orgDepartmentId, orgDepartments]);

  useEffect(() => {
    if (!showModal || !isEdit) return;
    if (!orgTeamId && form.team) {
      const match = orgTeams.find(
        (item) =>
          String(item?.name || "").toLowerCase() ===
          String(form.team || "").toLowerCase(),
      );
      if (match?.id) setOrgTeamId(String(match.id));
    }
  }, [showModal, isEdit, form.team, orgTeamId, orgTeams]);



  const openAdd = () => {
    setOnboardMode("create");
    setOnboardEditId(null);
    prevOnboardHeadOfficeIdRef.current = null;
    prevOnboardBranchIdRef.current = null;
    prevOnboardDepartmentIdRef.current = null;
    setOnboardStep(0);
    setOnboardForm(EMPTY_ONBOARD_FORM);
    setOnboardHeadOfficeId("");
    setOnboardBranchId("");
    setOnboardDepartmentId("");
    setOnboardDesignationId("");
    setShowOnboardWizard(true);
  };

  const openEdit = (emp) => {
    const raw = emp?._raw || {};
    setOnboardMode("edit");
    setOnboardEditId(raw?.id ?? emp?.id ?? null);
    prevOnboardHeadOfficeIdRef.current = null;
    prevOnboardBranchIdRef.current = null;
    prevOnboardDepartmentIdRef.current = null;
    setOnboardStep(0);
    setOnboardHeadOfficeId(raw?.headOfficeId ? String(raw.headOfficeId) : "");
    setOnboardBranchId(raw?.branchId ? String(raw.branchId) : "");
    setOnboardDepartmentId(raw?.departmentMasterId ? String(raw.departmentMasterId) : "");
    setOnboardDesignationId(raw?.designationMasterId ? String(raw.designationMasterId) : "");
    setOnboardForm({
      ...EMPTY_ONBOARD_FORM,
      nameInCaps: raw?.name ? String(raw.name).toUpperCase() : "",
      employeeIdNumber: raw?.employeeIdNumber || "",
      fatherName: raw?.fatherName || "",
      motherName: raw?.motherName || "",
      personalContactNumber: raw?.personalContactNumber || "",
      alternateContactNumber: raw?.alternateContactNumber || "",
      location: raw?.location || "",
      pinCode: raw?.pinCode || "",
      state: raw?.state || "",
      currentAddress: raw?.currentAddress || "",
      permanentAddress: raw?.permanentAddress || "",
      personalEmail: raw?.personalEmail || "",
      officialEmail: raw?.officialEmail || "",
      dateOfBirth: raw?.dateOfBirth || "",
      dateOfJoining: raw?.joinDate || "",
      maritalStatus: raw?.maritalStatus || "",
      spouseName: raw?.spouseName || "",
      bloodGroup: raw?.bloodGroup || "",
      panCardNo: raw?.panCardNo || "",
      aadharCardNo: raw?.aadharCardNo || "",
      bankAccountHolderName: raw?.bankAccountHolderName || "",
      bankAccountNumber: raw?.bankAccountNumber || "",
      ifscCode: raw?.ifscCode || "",
      bankAndBranch: raw?.bankAndBranch || "",
      employmentDetails1: raw?.employmentDetails1 || "",
      employmentDetails2: raw?.employmentDetails2 || "",
      graduationDetails: raw?.graduationDetails || "",
      hscMarkAndYear: raw?.hscMarkAndYear || "",
      sslcMarkAndYear: raw?.sslcMarkAndYear || "",
      emergencyContactName1: raw?.emergencyContactName1 || "",
      emergencyContactRelation1: raw?.emergencyContactRelation1 || "",
      emergencyContactPhone1: raw?.emergencyContactPhone1 || "",
      emergencyContactName2: raw?.emergencyContactName2 || "",
      emergencyContactRelation2: raw?.emergencyContactRelation2 || "",
      emergencyContactPhone2: raw?.emergencyContactPhone2 || "",
      friendRefName1: raw?.friendRefName1 || "",
      friendRefContact1: raw?.friendRefContact1 || "",
      friendRefName2: raw?.friendRefName2 || "",
      friendRefContact2: raw?.friendRefContact2 || "",
      branchToJoin: raw?.branchToJoin || "",
      platformSource: raw?.platformSource || "",
      pfUan: raw?.pfUan || "",
      esiNo: raw?.esiNo || "",
      declarationDate: raw?.declarationDate || "",
      declarationPlace: raw?.declarationPlace || "",
      candidatePhotoPath: raw?.candidatePhotoPath || "",
      aadharCardPath: raw?.aadharCardPath || "",
      panCardPath: raw?.panCardPath || "",
      bankPassbookPath: raw?.bankPassbookPath || "",
      experienceCertificatePath: raw?.experienceCertificatePath || "",
      graduationCertificatePath: raw?.graduationCertificatePath || "",
      graduationMarksheetPath: raw?.graduationMarksheetPath || "",
      hscMarksheetPath: raw?.hscMarksheetPath || "",
      sslcMarksheetPath: raw?.sslcMarksheetPath || "",
      communityCertificatePath: raw?.communityCertificatePath || "",
      // files cannot be prefilled
      candidatePhoto: null,
      uploadCandidateAadharCard: null,
      uploadCandidatePanCard: null,
      uploadBankPassBookCopy: null,
      uploadExperienceCertificate: null,
      uploadGraduationCertificate: null,
      uploadGraduationMarksheet: null,
      uploadHscMarkSheet: null,
      uploadSslcMarkSheet: null,
      uploadCommunityCertificate: null,
    });
    setShowOnboardWizard(true);
  };

  const hasText = (v) => typeof v === "string" && v.trim().length > 0;

  const validateOnboardStep = (step) => {
    if (step === 0) {
      if (!onboardHeadOfficeId) return "Head Office is required";
      if (!onboardBranchId) return "Branch is required";
      if (!onboardDepartmentId) return "Department is required";
      if (!onboardDesignationId) return "Team / Designation is required";
      return "";
    }
    if (step === 1) {
      if (!hasText(onboardForm.nameInCaps)) return "Name In Caps is required";
      if (!hasText(onboardForm.employeeIdNumber)) return "Employee ID Number is required";
      // if (!hasText(onboardForm.fatherName)) return "Father’s Name is required";
      // if (!hasText(onboardForm.motherName)) return "Mother's Name is required";
      if (!hasText(onboardForm.personalContactNumber)) return "Personal Contact Number is required";
      // if (!hasText(onboardForm.alternateContactNumber)) return "Alternate Contact Number is required";
      if (!hasText(onboardForm.location)) return "Location is required";
      // if (!hasText(onboardForm.pinCode)) return "Pin Code is required";
      // if (!hasText(onboardForm.state)) return "State is required";
      // if (!hasText(onboardForm.currentAddress)) return "Current Address is required";
      // if (!hasText(onboardForm.permanentAddress)) return "Permanent Address is required";
      if (!hasText(onboardForm.personalEmail)) return "Personal Email is required";
      // if (!hasText(onboardForm.officialEmail)) return "Official Email is required";
      if (!hasText(onboardForm.dateOfBirth)) return "Date of Birth is required";
      // if (!hasText(onboardForm.dateOfJoining)) return "Date of Joining is required";
      if (!hasText(onboardForm.maritalStatus)) return "Marital Status is required";
      if (String(onboardForm.maritalStatus).toUpperCase() === "MARRIED" && !hasText(onboardForm.spouseName)) {
        return "Spouse Name is required";
      }
      // if (!hasText(onboardForm.bloodGroup)) return "Blood Group is required";
      // if (!hasText(onboardForm.panCardNo)) return "Pan Card No is required";
      // if (!hasText(onboardForm.aadharCardNo)) return "Aadhar Card No is required";
      return "";
    }
    if (step === 2) {
      if (onboardMode === "create") {
          //  if (onboardMode === "create" && !onboardForm.candidatePhoto) return "Candidate Photo is required";
        // if (!onboardForm.uploadCandidateAadharCard) return "Upload Candidate Aadhar Card is required";
        // if (!onboardForm.uploadCandidatePanCard) return "Upload Candidate Pan Card is required";
        // if (!onboardForm.uploadBankPassBookCopy) return "Upload Bank Pass Book / Cancelled Cheque is required";
        // if (!onboardForm.uploadGraduationCertificate) return "Graduation Certificate is required";
        // if (!onboardForm.uploadGraduationMarksheet) return "Graduation Marksheet is required";
        // if (!onboardForm.uploadHscMarkSheet) return "HSC Mark Sheet is required";
        // if (!onboardForm.uploadSslcMarkSheet) return "SSLC Mark Sheet is required";
        // if (!onboardForm.uploadCommunityCertificate) return "Community Certificate is required";
      }
      return "";
    }
    if (step === 3) {
      // if (!hasText(onboardForm.bankAccountHolderName)) return "Bank Account Holder Name is required";
      // if (!hasText(onboardForm.bankAccountNumber)) return "Bank Account Number is required";
      // if (!hasText(onboardForm.ifscCode)) return "IFSC Code is required";
      // if (!hasText(onboardForm.bankAndBranch)) return "Bank & Branch is required";
      // if (!hasText(onboardForm.employmentDetails1)) return "Employment Details 1 is required";
      // if (!hasText(onboardForm.employmentDetails2)) return "Employment Details 2 is required";
      if (!hasText(onboardForm.graduationDetails)) return "Graduation Details is required";
      if (!hasText(onboardForm.hscMarkAndYear)) return "HSC Mark & Year is required";
      if (!hasText(onboardForm.sslcMarkAndYear)) return "SSLC Mark & Year is required";
      // if (!hasText(onboardForm.emergencyContactName1)) return "Emergency Contact Name 1 is required";
      // if (!hasText(onboardForm.emergencyContactRelation1)) return "Emergency Contact Relationship 1 is required";
      // if (!hasText(onboardForm.emergencyContactPhone1)) return "Emergency Contact No 1 is required";
      // if (!hasText(onboardForm.emergencyContactName2)) return "Emergency Contact Name 2 is required";
      // if (!hasText(onboardForm.emergencyContactRelation2)) return "Emergency Contact Relationship 2 is required";
      // if (!hasText(onboardForm.emergencyContactPhone2)) return "Emergency Contact No 2 is required";
      // if (!hasText(onboardForm.friendRefName1)) return "Friend / Ex-Colleague Name 1 is required";
      // if (!hasText(onboardForm.friendRefContact1)) return "Friend / Ex-Colleague Contact 1 is required";
      // if (!hasText(onboardForm.friendRefName2)) return "Friend / Ex-Colleague Name 2 is required";
      // if (!hasText(onboardForm.friendRefContact2)) return "Friend / Ex-Colleague Contact 2 is required";
      // if (!hasText(onboardForm.branchToJoin)) return "Branch to Join is required";
      // if (!hasText(onboardForm.platformSource)) return "Platform Source is required";
      // if (!hasText(onboardForm.pfUan)) return "PF UAN is required";
      // if (!hasText(onboardForm.esiNo)) return "ESI No is required";
      // if (!hasText(onboardForm.declarationDate)) return "Declaration Date is required";
      // if (!hasText(onboardForm.declarationPlace)) return "Declaration Place is required";
      return "";
    }
    return "";
  };

  const handleOnboardNext = () => {
    const msg = validateOnboardStep(onboardStep);
    if (msg) {
      showError(msg);
      return;
    }
    setOnboardStep((s) => Math.min(3, s + 1));
  };

  const handleOnboardPrev = () => setOnboardStep((s) => Math.max(0, s - 1));

  const handleOnboardSubmit = async () => {
    const msg = validateOnboardStep(3);
    if (msg) {
      showError(msg);
      return;
    }

    const selectedDesignation = (onboardDesignations || []).find(
      (d) => String(d.id) === String(onboardDesignationId),
    );

    const fd = new FormData();
    fd.append("headOfficeId", onboardHeadOfficeId);
    fd.append("branchId", onboardBranchId);
    fd.append("departmentMasterId", onboardDepartmentId);
    fd.append("designationMasterId", onboardDesignationId);
    if (selectedDesignation?.name) fd.append("designation", selectedDesignation.name);

    Object.entries(onboardForm).forEach(([key, val]) => {
      if (key.endsWith("Path")) return;
      if (val === null || typeof val === "undefined" || val === "") return;
      fd.append(key, val);
    });

    setSaving(true);
    try {
      if (onboardMode === "edit" && onboardEditId) {
        await updateOnboardEmployee(onboardEditId, fd);
        showSuccess("Employee updated");
      } else {
        await onboardEmployee(fd);
        showSuccess("Employee added");
      }
      setShowOnboardWizard(false);
      await loadData();
    } catch (e) {
      showError(extractApiErrorMessage(e, onboardMode === "edit" ? "Failed to update employee" : "Failed to add employee"));
    } finally {
      setSaving(false);
    }
  };

  const departmentOptions = useMemo(() => {
    const names = (departments || [])
      .map((d) => d?.name)
      .filter((v) => typeof v === "string" && v.trim().length > 0);
    return Array.from(new Set(names)).sort((a, b) => a.localeCompare(b));
  }, [departments]);

  const designationOptions = useMemo(() => {
    const dept = String(form.dept || "").trim().toLowerCase();
    if (!dept) return [];
    const items = (designations || []).map((d) => ({
      name: d?.name || "",
      department: d?.department || d?.departmentName || d?.dept || "",
    }));
    const filtered = items.filter(
      (d) => String(d.department || "").trim().toLowerCase() === dept,
    );
    const names = filtered
      .map((d) => d.name)
      .filter((v) => typeof v === "string" && v.trim().length > 0);
    return Array.from(new Set(names)).sort((a, b) => a.localeCompare(b));
  }, [designations, form.dept]);

  const handleDeptChange = (value) => {
    setForm((prev) => {
      const next = { ...prev, dept: value };
      if (prev.designation) {
        const match = (designations || []).some(
          (d) =>
            String(d?.department || d?.departmentName || d?.dept || "").trim().toLowerCase() ===
              String(value || "").trim().toLowerCase() &&
            String(d?.name || "").trim().toLowerCase() ===
              String(prev.designation || "").trim().toLowerCase(),
        );
        if (!match) next.designation = "";
      }
      return next;
    });
  };

  const selectedInstitution = orgInstitutions.find(
    (item) => String(item.id) === String(orgInstitutionId),
  );
  const selectedCategory = orgCategories.find(
    (item) => String(item.id) === String(orgCategoryId),
  );
  const selectedType = orgTypes.find(
    (item) => String(item.id) === String(orgTypeId),
  );
  const selectedOrgDepartment = orgDepartments.find(
    (item) => String(item.id) === String(orgDepartmentId),
  );
  const selectedOrgTeam = orgTeams.find(
    (item) => String(item.id) === String(orgTeamId),
  );
  const currentRole = String(currentUser?.role || "").toUpperCase();
  const isAdmin = currentRole === "ADMIN";
  const isManager = currentRole === "MANAGER";

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate phone number
    const phoneValidationError = validatePhoneNumber(form.phone, form.countryCode);
    if (phoneValidationError) {
      setPhoneError(phoneValidationError);
      return;
    }

    if (!orgInstitutionId) {
      showError("Institution is required");
      return;
    }
    if (!orgCategoryId) {
      showError("Category is required");
      return;
    }
    if (!orgTypeId) {
      showError("Type is required");
      return;
    }
    if (!orgDepartmentId) {
      showError("Department is required");
      return;
    }
    
    setSaving(true);
    try {
      const payload = toApiPayload({
        ...form,
        institution: selectedInstitution?.name || form.institution,
        institutionCategory: selectedCategory?.name || form.institutionCategory,
        institutionType: selectedType?.name || form.institutionType,
        userDepartmentName: selectedOrgDepartment?.name || form.userDepartmentName,
        team: selectedOrgTeam?.name || form.team,
      });
      if (isEdit) {
        await updateEmployee(selectedId, payload);
        showSuccess("Employee updated successfully");
      } else {
        await createEmployee(payload);
        showSuccess("Employee added successfully");
      }
      setShowModal(false);
      setForm(EMPTY_FORM);
      setSelectedId(null);
      setPhoneError("");
      await loadData();
    } catch (e2) {
      showError(extractApiErrorMessage(e2, "Operation failed"));
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = (id) => {
    setDeleteId(id);
    setShowDeleteModal(true);
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setSaving(true);
    try {
      await deleteEmployee(deleteId);
      showSuccess("Employee deleted successfully");
      setShowDeleteModal(false);
      setDeleteId(null);
      await loadData();
    } catch (e) {
      showError(extractApiErrorMessage(e, "Failed to delete employee"));
    } finally {
      setSaving(false);
    }
  };

  const employeeGridData = rows.map(r => ({
    ...r,
    role: r.designation,
    projects: 0, done: 0, progress: 0, productivity: 0 // Placeholder for grid stats
  }));

  if (gridView) {
    return (
      <div className="container-fluid">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h4 className="mb-0">Employees Grid</h4>
          <button className="btn btn-primary" onClick={openAdd}>Add Employee +</button>
        </div>
        <div className="row">
          {loading ? <div>Loading...</div> : employeeGridData.map((emp, idx) => (
            <div className="col-xl-3 col-lg-4 col-md-6 d-flex" key={`${emp.name}-${idx}`}>
              <div className="card flex-fill">
                <div className="card-body">
                  <div className="position-absolute top-0 end-0 p-2">
                    <button className="btn btn-sm btn-light" onClick={() => openEdit(emp)}><EditGlyph size={12} /></button>
                    <button className="btn btn-sm btn-light text-danger ms-1" onClick={() => confirmDelete(emp.id)}><TrashGlyph size={12} /></button>
                  </div>
                  <div className="d-flex align-items-center mb-3">
                    <img
                      src={emp.img || "assets/img/users/user-32.jpg"}
                      alt={emp.name}
                      className="rounded-circle me-2"
                      width="42"
                      height="42"
                    />
                    <div>
                      <h6 className="mb-0">{emp.name || "-"}</h6>
                      <small className="text-muted">{emp.role}</small>
                    </div>
                  </div>
                  <p className="mb-1">Projects: {emp.projects}</p>
                  <p className="mb-1">Done: {emp.done}</p>
                  <p className="mb-1">In Progress: {emp.progress}</p>
                  <p className="mb-0">Productivity: {emp.productivity}%</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h4 className="mb-0">Employees</h4>
        <button className="btn btn-primary" onClick={openAdd}>Add Employee +</button>
      </div>
      <div className="card">
        <div className="card-header d-flex justify-content-between align-items-center">
          <h5 className="mb-0">Employee List</h5>
        
          <button
                className="btn btn-outline-warning leads-toolbar-btn"
                onClick={() => setFilterOpen((prev) => !prev)}
              >
                <i className="ti ti-filter me-1" />
                Filter
              </button>
        </div>
      {filterOpen && (
        <>
          <div
            className="position-fixed top-0 start-0 w-100 h-100"
            style={{ background: "rgba(189, 172, 172, 0.35)", zIndex: 1048 }}
            onClick={() => setFilterOpen(false)}
          />
          <div
            className="position-fixed top-0 end-0 h-100 bg-white border-start shadow"
            style={{ width: 380, zIndex: 1049 }}
          >
            <div className="d-flex align-items-center justify-content-between p-3 border-bottom">
              <h6 className="mb-0">Filters</h6>
              <button type="button" className="btn-close" onClick={() => setFilterOpen(false)} />
            </div>

            <div className="p-3">
              <div className="mb-3">
                <label className="form-label">Head Office</label>
                <select
                  className="form-select"
                  value={filters.headOfficeId}
                  onChange={(e) => {
                    const headOfficeId = e.target.value;
                    setFilters((prev) => ({
                      ...prev,
                      headOfficeId,
                      branchId: "",
                      departmentId: "",
                      designationId: "",
                    }));
                  }}
                  disabled={filterLoading || hoLoading}
                >
                  <option value="">All</option>
                  {[...activeHeadOffices]
                    .sort((a, b) => String(a.name || "").localeCompare(String(b.name || "")))
                    .map((h) => (
                      <option key={h.id} value={h.id}>
                        {h.name}
                      </option>
                    ))}
                </select>
              </div>

              <div className="mb-3">
                <label className="form-label">Profile Status</label>
                <select
                  className="form-select"
                  value={filters.profileStatus}
                  onChange={(e) => setFilters((prev) => ({ ...prev, profileStatus: e.target.value }))}
                  disabled={filterLoading}
                >
                  <option value="">All</option>
                  <option value="DRAFT">DRAFT</option>
                  <option value="PENDING_VERIFICATION">PENDING_VERIFICATION</option>
                  <option value="VERIFIED">VERIFIED</option>
                </select>
              </div>

              {filters.headOfficeId ? (
                <div className="mb-3">
                  <label className="form-label">Branch</label>
                  <select
                    className="form-select"
                    value={filters.branchId}
                    onChange={(e) => {
                      const branchId = e.target.value;
                      setFilters((prev) => ({
                        ...prev,
                        branchId,
                        departmentId: "",
                        designationId: "",
                      }));
                    }}
                    disabled={!filters.headOfficeId || filterLoading}
                  >
                    <option value="">All</option>
                    {[...activeFilterBranches]
                      .sort((a, b) => String(a.name || "").localeCompare(String(b.name || "")))
                      .map((b) => (
                        <option key={b.id} value={b.id}>
                          {b.name}
                        </option>
                      ))}
                  </select>
                </div>
              ) : null}

              {filters.branchId ? (
                <div className="mb-3">
                  <label className="form-label">Department</label>
                  <select
                    className="form-select"
                    value={filters.departmentId}
                    onChange={(e) => {
                      const departmentId = e.target.value;
                      setFilters((prev) => ({
                        ...prev,
                        departmentId,
                        designationId: "",
                      }));
                    }}
                    disabled={!filters.branchId || filterLoading}
                  >
                    <option value="">All</option>
                    {[...activeFilterDepartments]
                      .sort((a, b) => String(a.name || "").localeCompare(String(b.name || "")))
                      .map((d) => (
                        <option key={d.id} value={d.id}>
                          {d.name}
                        </option>
                      ))}
                  </select>
                </div>
              ) : null}

              {filters.departmentId ? (
                <div className="mb-3">
                  <label className="form-label">Designation</label>
                  <select
                    className="form-select"
                    value={filters.designationId}
                    onChange={(e) => setFilters((prev) => ({ ...prev, designationId: e.target.value }))}
                    disabled={!filters.departmentId || filterLoading}
                  >
                    <option value="">All</option>
                    {[...activeFilterDesignations]
                      .sort((a, b) => String(a.name || "").localeCompare(String(b.name || "")))
                      .map((d) => (
                        <option key={d.id} value={d.id}>
                          {d.name}
                        </option>
                      ))}
                  </select>
                </div>
              ) : null}

             
            </div>

            <div className="p-3 border-top d-flex gap-2">
              <button
                type="button"
                className="btn btn-light w-50"
                onClick={() => {
                  setFilters({
                    headOfficeId: "",
                    branchId: "",
                    departmentId: "",
                    designationId: "",
                    profileStatus: "",
                  });
                  setFilterBranches([]);
                  setFilterDepartments([]);
                  setFilterDesignations([]);
                }}
              >
                Clear
              </button>
              <button type="button" className="btn btn-primary w-50" onClick={() => setFilterOpen(false)}>
                Apply
              </button>
            </div>
          </div>
        </>
      )}
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-striped table-hover mb-0">
              <thead>
                <tr>
                  <th>Employee ID</th>
                  <th>Employee</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Department</th>
                  <th>Designation</th>
                  <th>Join Date</th>
                  <th>Status</th>
                  <th>Profile</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="10">Loading...</td>
                  </tr>
                ) : filteredRows.length === 0 ? (
                  <tr>
                    <td colSpan="10" className="text-center py-4 text-muted">
                      No employees found
                    </td>
                  </tr>
                ) : (
                  filteredRows.map((emp) => (
                    <tr key={emp.id}>
                      <td>{emp.employeeCode || "-"}</td>
                      <td>
                        <div className="d-flex align-items-center">
                         <img
  src={
    emp._raw?.candidatePhotoPath
      ? `http://localhost:8081/${emp._raw.candidatePhotoPath}`
      : "assets/img/users/user-32.jpg"
  }
  alt={emp.name}
  className="rounded-circle me-2"
  width="34"
  height="34"
  onError={(e) => (e.target.src = "assets/img/users/user-32.jpg")}
/>
                          <span>{emp.name}</span>
                        </div>
                      </td>
                      <td>{emp.email}</td>
                      <td>{emp.phone}</td>
                      <td>{emp.dept || "-"}</td>
                      <td>{emp.designation}</td>
                      <td>{emp.joinDate || "-"}</td>
                      <td>
                        <span
                          className={`badge ${
                            emp.status === "ACTIVE" ? "badge-success" : "badge-danger"
                          }`}
                        >
                          {emp.status === "ACTIVE" ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td>
                        <span className="badge badge-info">
                          {emp.profileStatus || "-"}
                        </span>
                      </td>
                      <td>
                        <button className="btn btn-sm btn-outline-primary" onClick={() => openEdit(emp)}>
                          <EditGlyph size={12} />
                        </button>
                        <button className="btn btn-sm btn-outline-danger ms-1" onClick={() => confirmDelete(emp.id)}>
                          <TrashGlyph size={12} />
                        </button>
                        {(() => {
                          const sentPending =
                            emp.offerLetterSent &&
                            String(emp.profileStatus || "").toUpperCase() === "DRAFT";
                          const expiry = emp.offerLetterLinkExpiresAt
                            ? String(emp.offerLetterLinkExpiresAt).slice(0, 10)
                            : "";
                          const title = sentPending
                            ? `Already sent${expiry ? ` (valid until ${expiry})` : ""}. Use Resend to send again.`
                            : "Send offer letter email";
                          return (
                            <>
                              <button
                                className="btn btn-sm btn-outline-secondary ms-1"
                                type="button"
                                onClick={() => handleSendOfferLetter(emp)}
                                title={title}
                                disabled={sentPending}
                              >
                                {sentPending ? "Sent" : "Send Mail"}
                              </button>
                              {sentPending && (
                                <button
                                  className="btn btn-sm btn-outline-warning ms-1"
                                  type="button"
                                  onClick={() =>
                                    showConfirm({
                                      title: "Resend offer letter?",
                                      message:
                                        "This will generate a new secure profile link and email it to the employee.",
                                      confirmLabel: "Resend",
                                      cancelLabel: "Cancel",
                                      onConfirm: () => handleResendOfferLetter(emp),
                                    })
                                  }
                                  title="Resend offer letter email"
                                >
                                  Resend
                                </button>
                              )}
                            </>
                          );
                        })()}
                        <button
                          className="btn btn-sm btn-outline-success ms-1"
                          type="button"
                          onClick={() => navigate(`/employees/${emp.id}/verify`)}
                          title="Verify profile"
                        >
                          Verify
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {confirmDialog}

      {linkModalOpen && (
        <>
          <div className="modal fade show" style={{ display: "block" }} tabIndex="-1">
            <div className="modal-dialog">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">
                    Offer Letter Link {generatedLinkEmployee?.name ? `- ${generatedLinkEmployee.name}` : ""}
                  </h5>
                  <button type="button" className="btn-close" onClick={() => setLinkModalOpen(false)} />
                </div>
                <div className="modal-body">
                  <label className="form-label">Public form URL</label>
                  <div className="d-flex gap-2">
                    <input className="form-control" value={generatedLink} readOnly />
                    <button
                      type="button"
                      className="btn btn-light"
                      onClick={() => navigator.clipboard?.writeText(generatedLink)}
                      disabled={!generatedLink}
                    >
                      Copy
                    </button>
                  </div>
                  <div className="text-muted small mt-2">
                    This link was included in the offer letter email. You can also copy it from here if needed.
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-primary" onClick={() => setLinkModalOpen(false)}>
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div className="modal-backdrop fade show" />
        </>
      )}

      {showOnboardWizard && (
        <EmployeeWizardModal
          wizardStep={onboardStep}
          form={onboardForm}
          setForm={setOnboardForm}
          mode={onboardMode}
          headOfficeId={onboardHeadOfficeId}
          setHeadOfficeId={setOnboardHeadOfficeId}
          branchId={onboardBranchId}
          setBranchId={setOnboardBranchId}
          departmentId={onboardDepartmentId}
          setDepartmentId={setOnboardDepartmentId}
          designationId={onboardDesignationId}
          setDesignationId={setOnboardDesignationId}
          headOffices={[...wizardHeadOffices].sort((a, b) => String(a.name || "").localeCompare(String(b.name || "")))}
          branches={[...wizardBranches].sort((a, b) => String(a.name || "").localeCompare(String(b.name || "")))}
          departments={[...wizardDepartments].sort((a, b) => String(a.name || "").localeCompare(String(b.name || "")))}
          designations={[...wizardDesignations].sort((a, b) => String(a.name || "").localeCompare(String(b.name || "")))}
          loadingMasters={hoLoading || branchLoading || deptLoading || desigLoading}
          saving={saving}
          onNext={handleOnboardNext}
          onPrev={handleOnboardPrev}
          onSubmit={handleOnboardSubmit}
          onClose={() => setShowOnboardWizard(false)}
        />
      )}

      {showModal && (
        <>
          <div className="modal fade show" style={{ display: "block" }} tabIndex="-1">
            <div className="modal-dialog modal-lg">
              <form className="modal-content" onSubmit={handleSubmit}>
                <div className="modal-header">
                  <h5 className="modal-title">{isEdit ? "Edit Employee" : "Add Employee"}</h5>
                  <button type="button" className="btn-close" onClick={() => {
                    setShowModal(false);
                    setPhoneError("");
                  }} />
                </div>
                <div className="modal-body">
                  <div className="row g-3">
                    <div className="col-md-6">
                      <label className="form-label">Employee Code</label>
                      <input className="form-control" value={form.employeeCode} disabled placeholder="Auto generated" />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Full Name</label>
                      <input className="form-control" value={form.name} onChange={e => setForm({...form, name: e.target.value})} required />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Email</label>
                      <input type="email" className="form-control" value={form.email} onChange={e => setForm({...form, email: e.target.value})} required />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Country Code</label>
                      <select
                        className="form-select"
                        value={form.countryCode}
                        onChange={(e) => {
                          setForm({...form, countryCode: e.target.value});
                          setPhoneError("");
                        }}
                      >
                        {COUNTRY_CODE_OPTIONS.map((option) => (
                          <option key={`${option.country}-${option.callingCode}`} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Mobile Number</label>
                      <input
                        type="tel"
                        className={`form-control ${phoneError ? "is-invalid" : ""}`}
                        value={form.phone}
                        onChange={(e) => {
                          const sanitized = sanitizePhoneDigits(
                            e.target.value,
                            getCountryDisplayMaxLength(form.countryCode)
                          );
                          setForm({...form, phone: sanitized});
                          if (phoneError) {
                            const error = validatePhoneNumber(sanitized, form.countryCode);
                            setPhoneError(error);
                          }
                        }}
                        placeholder={`Enter ${getCountryDisplayMaxLength(form.countryCode)} digit number`}
                      />
                      {phoneError && (
                        <div className="invalid-feedback d-block">{phoneError}</div>
                      )}
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Department</label>
                      <select
                        className="form-select"
                        value={form.dept}
                        onChange={(e) => handleDeptChange(e.target.value)}
                        disabled={metaLoading}
                      >
                        <option value="">Select</option>
                        {form.dept && !departmentOptions.includes(form.dept) && (
                          <option value={form.dept}>{form.dept}</option>
                        )}
                        {departmentOptions.map((name) => (
                          <option key={name} value={name}>
                            {name}
                          </option>
                        ))}
                      </select>
                    </div>
                      <div className="col-md-6">
                      <label className="form-label">Designation</label>
                      <select
                        className="form-select"
                        value={form.designation}
                        onChange={(e) => setForm({ ...form, designation: e.target.value })}
                        disabled={metaLoading || !form.dept}
                      >
                        <option value="">Select</option>
                        {form.designation && !designationOptions.includes(form.designation) && (
                          <option value={form.designation}>{form.designation}</option>
                        )}
                        {designationOptions.map((name) => (
                          <option key={name} value={name}>
                            {name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Join Date</label>
                      <input type="date" className="form-control" value={form.joinDate} onChange={e => setForm({...form, joinDate: e.target.value})} />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Status</label>
                      <select className="form-select" value={form.status} onChange={e => setForm({...form, status: e.target.value})}>
                        <option value="ACTIVE">Active</option>
                        <option value="INACTIVE">Inactive</option>
                      </select>
                    </div>
                    <div className="col-12">
                      <hr className="my-1" />
                      <h6 className="mb-0">Organization Details</h6>
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Institution *</label>
                      <select
                        className="form-select"
                        value={orgInstitutionId}
                        onChange={(e) => {
                          const val = e.target.value;
                          setOrgInstitutionId(val);
                          setOrgCategoryId("");
                          setOrgTypeId("");
                          setOrgDepartmentId("");
                          setOrgTeamId("");
                          setForm((prev) => ({
                            ...prev,
                            institution: "",
                            institutionCategory: "",
                            institutionType: "",
                            userDepartmentName: "",
                            team: "",
                          }));
                        }}
                        disabled={isAdmin || isManager}
                      >
                        <option value="">Select</option>
                        {orgInstitutions.map((item) => (
                          <option key={item.id} value={item.id}>
                            {item.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Category *</label>
                      <select
                        className="form-select"
                        value={orgCategoryId}
                        onChange={(e) => {
                          const val = e.target.value;
                          setOrgCategoryId(val);
                          setOrgTypeId("");
                          setOrgDepartmentId("");
                          setOrgTeamId("");
                          setForm((prev) => ({
                            ...prev,
                            institutionCategory: "",
                            institutionType: "",
                            userDepartmentName: "",
                            team: "",
                          }));
                        }}
                        disabled={!orgInstitutionId || isAdmin || isManager}
                      >
                        <option value="">Select</option>
                        {orgCategories.map((item) => (
                          <option key={item.id} value={item.id}>
                            {item.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Type *</label>
                      <select
                        className="form-select"
                        value={orgTypeId}
                        onChange={(e) => {
                          const val = e.target.value;
                          setOrgTypeId(val);
                          setOrgDepartmentId("");
                          setOrgTeamId("");
                          const selected = orgTypes.find(
                            (item) => String(item.id) === String(val),
                          );
                          setForm((prev) => ({
                            ...prev,
                            institutionType: selected?.name || "",
                            userDepartmentName: "",
                            team: "",
                          }));
                        }}
                        disabled={!orgCategoryId || isAdmin || isManager}
                      >
                        <option value="">Select</option>
                        {orgTypes.map((item) => (
                          <option key={item.id} value={item.id}>
                            {item.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Department *</label>
                      <select
                        className="form-select"
                        value={orgDepartmentId}
                        onChange={(e) => {
                          const val = e.target.value;
                          setOrgDepartmentId(val);
                          setOrgTeamId("");
                          const selected = orgDepartments.find(
                            (item) => String(item.id) === String(val),
                          );
                          setForm((prev) => ({
                            ...prev,
                            userDepartmentName: selected?.name || "",
                            team: "",
                          }));
                        }}
                        disabled={!orgTypeId || isAdmin || isManager}
                      >
                        <option value="">Select</option>
                        {orgDepartments.map((item) => (
                          <option key={item.id} value={item.id}>
                            {item.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Team (Optional)</label>
                      <select
                        className="form-select"
                        value={orgTeamId}
                        onChange={(e) => {
                          const val = e.target.value;
                          setOrgTeamId(val);
                          const selected = orgTeams.find(
                            (item) => String(item.id) === String(val),
                          );
                          setForm((prev) => ({
                            ...prev,
                            team: selected?.name || "",
                          }));
                        }}
                        disabled={!orgDepartmentId || isManager}
                      >
                        <option value="">Select</option>
                        {orgTeams.map((item) => (
                          <option key={item.id} value={item.id}>
                            {item.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-light" onClick={() => {
                    setShowModal(false);
                    setPhoneError("");
                  }}>Cancel</button>
                  <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? "Saving..." : "Save Changes"}</button>
                </div>
              </form>
            </div>
          </div>
          <div className="modal-backdrop fade show" />
        </>
      )}

      {showDeleteModal && (
        <>
          <div className="modal fade show" style={{ display: "block" }} tabIndex="-1">
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">Confirm Delete</h5>
                  <button type="button" className="btn-close" onClick={() => setShowDeleteModal(false)} />
                </div>
                <div className="modal-body">
                  <p>Are you sure you want to delete this employee? This action cannot be undone.</p>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-light" onClick={() => setShowDeleteModal(false)}>Cancel</button>
                  <button type="button" className="btn btn-danger" onClick={handleDelete} disabled={saving}>
                    {saving ? "Deleting..." : "Delete"}
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div className="modal-backdrop fade show" />
        </>
      )}
    </div>
  );
}
