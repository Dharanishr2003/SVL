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
    resendProfileCompletionMail,
  } from "../../api/employeesApi";
  import { getDepartmentsMaster, getDepartmentsMasterByBranch } from "../../api/departmentsApi";
  import { getDesignations } from "../../api/designationsApi";
  import { getHeadOffices } from "../../api/headOfficesApi";
  import { getBranches } from "../../api/branchesApi";
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
  import "../../../public/assets/css/addModalShared.css";
  import "./EmployeesPage.css";

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
    const normalizeId = (value) => {
      if (value === null || value === undefined || value === "") return null;
      const num = Number(value);
      return Number.isFinite(num) ? num : null;
    };
    return {
      name: form.name?.trim() || "",
      email: form.email?.trim() || "",
      headOfficeId: normalizeId(form.headOfficeId),
      branchId: normalizeId(form.branchId),
      departmentMasterId: normalizeId(form.departmentMasterId),
      designationMasterId: normalizeId(form.designationMasterId),
      countryCode: form.countryCode || defaultCountryOption.value,
      phone: form.phone?.trim() || "",
      dept: form.dept?.trim() || "",
      institution: form.institution?.trim() || "",
      institutionCategory: form.institutionCategory?.trim() || "",
      institutionType: form.institutionType?.trim() || "",
      userDepartmentName: form.userDepartmentName?.trim() || "",
      departmentName: form.departmentName?.trim() || "",
      team: form.team?.trim() || "",
      designation: form.designation?.trim() || "",
      branchToJoin: form.branchToJoin?.trim() || "",
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
    const [editHeadOfficeId, setEditHeadOfficeId] = useState("");
    const [editBranchId, setEditBranchId] = useState("");
    const [editDepartmentId, setEditDepartmentId] = useState("");
    const [editDesignationId, setEditDesignationId] = useState("");
    const [editHeadOffices, setEditHeadOffices] = useState([]);
    const [editBranches, setEditBranches] = useState([]);
    const [editDepartments, setEditDepartments] = useState([]);
    const [editDesignations, setEditDesignations] = useState([]);

    const [showOnboardWizard, setShowOnboardWizard] = useState(false);
    const [onboardStep, setOnboardStep] = useState(0);
    const [onboardForm, setOnboardForm] = useState(EMPTY_ONBOARD_FORM);
    const [onboardMode, setOnboardMode] = useState("create");
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
    const [appliedFilters, setAppliedFilters] = useState({
      headOfficeId: "",
      branchId: "",
      departmentId: "",
      designationId: "",
      profileStatus: "",
    });
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(25);
    const [totalRows, setTotalRows] = useState(0);
    const [totalPages, setTotalPages] = useState(1);

    async function handleSendOfferLetter(emp) { 
      try { 
        const res = await sendOfferLetterEmail(emp.id); 
        setGeneratedLink(res?.publicUrl || ""); 
        setGeneratedLinkEmployee(emp); 
        setLinkModalOpen(true); 
        showSuccess("Offer letter sent"); 
        await loadData(page, pageSize, appliedFilters); 
      } catch (e) { 
        const status = e?.response?.status;
        if (status === 409) {
          try {
            const res = await resendProfileCompletionMail(emp.id);
            setGeneratedLink(res?.publicUrl || "");
            setGeneratedLinkEmployee(emp);
            setLinkModalOpen(true);
            showSuccess("Profile completion mail sent");
            await loadData(page, pageSize, appliedFilters);
            return;
          } catch (e2) {
            showError(extractApiErrorMessage(e2, "Failed to send profile completion mail"));
            return;
          }
        }

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
        await loadData(page, pageSize, appliedFilters);
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

    const loadData = async (nextPage = page, nextPageSize = pageSize, nextFilters = appliedFilters) => {
      setLoading(true);
      try {
        const query = {
          page: nextPage,
          size: nextPageSize,
        };
        if (nextFilters?.headOfficeId) query.headOfficeId = nextFilters.headOfficeId;
        if (nextFilters?.branchId) query.branchId = nextFilters.branchId;
        if (nextFilters?.departmentId) query.departmentId = nextFilters.departmentId;
        if (nextFilters?.designationId) query.designationId = nextFilters.designationId;
        if (nextFilters?.profileStatus) query.profileStatus = nextFilters.profileStatus;

        const data = await getEmployees(query);
        const pageRows = Array.isArray(data?.content) ? data.content : Array.isArray(data) ? data : [];
        setRows(pageRows.map(toUiRow));
        setTotalRows(Number(data?.totalElements ?? pageRows.length ?? 0) || 0);
        setTotalPages(Math.max(1, Number(data?.totalPages ?? 1) || 1));
        setPage(Number(data?.page ?? nextPage) || nextPage);
        setPageSize(Number(data?.size ?? nextPageSize) || nextPageSize);
      } catch (e) {
        showError(extractApiErrorMessage(e, "Failed to load employees"));
        setRows([]);
        setTotalRows(0);
        setTotalPages(1);
      } finally {
        setLoading(false);
      }
    };

    useEffect(() => {
      loadData(page, pageSize, appliedFilters);
    }, [page, pageSize, appliedFilters]);

    const clampedPage = Math.min(Math.max(1, page), totalPages);
    const pageOffset = (clampedPage - 1) * pageSize;
    const pagedRows = rows;

    useEffect(() => {
      if (page !== clampedPage) {
        setPage(clampedPage);
      }
    }, [clampedPage, page]);

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
      const loadHeadOffices = async () => {
        try {
          const data = await getHeadOffices();
          if (!active) return;
          setEditHeadOffices(Array.isArray(data) ? data : []);
        } catch {
          if (!active) return;
          setEditHeadOffices([]);
        }
      };
      loadHeadOffices();
      return () => {
        active = false;
      };
    }, []);

    useEffect(() => {
      let active = true;
      const loadBranches = async () => {
        if (!editHeadOfficeId) {
          setEditBranches([]);
          return;
        }
        try {
          const data = await getBranches(editHeadOfficeId);
          if (!active) return;
          setEditBranches(Array.isArray(data) ? data : []);
        } catch {
          if (!active) return;
          setEditBranches([]);
        }
      };
      loadBranches();
      return () => {
        active = false;
      };
    }, [editHeadOfficeId]);

    useEffect(() => {
      let active = true;
      const loadDepartments = async () => {
        if (!editBranchId) {
          setEditDepartments([]);
          return;
        }
        try {
          const data = await getDepartmentsMasterByBranch(editBranchId);
          if (!active) return;
          setEditDepartments(Array.isArray(data) ? data : []);
        } catch {
          if (!active) return;
          setEditDepartments([]);
        }
      };
      loadDepartments();
      return () => {
        active = false;
      };
    }, [editBranchId]);

    useEffect(() => {
      let active = true;
      const loadDesignations = async () => {
        if (!editDepartmentId) {
          setEditDesignations([]);
          return;
        }
        try {
          const data = await getDesignations(editDepartmentId);
          if (!active) return;
          setEditDesignations(Array.isArray(data) ? data : []);
        } catch {
          if (!active) return;
          setEditDesignations([]);
        }
      };
      loadDesignations();
      return () => {
        active = false;
      };
    }, [editDepartmentId]);

    const openAdd = () => {
      navigate("/employees/add");
    };

    const openEditModal = (emp) => {
      const raw = emp?._raw || {};
      const editId = raw?.id ?? emp?.id ?? null;
      if (editId == null) return;
      navigate(`/employees/${editId}/edit`);
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
        if (!hasText(onboardForm.nameInCaps)) return "Name is required";
        if (!hasText(onboardForm.personalContactNumber)) return "Contact Number is required";
        if (!hasText(onboardForm.personalEmail)) return "Email is required";
        if (!hasText(onboardForm.dateOfBirth)) return "DOB is required";
        return "";
      }
      if (step === 2) {
        return "";
      }
      if (step === 3) {
        if (!hasText(onboardForm.graduationDetails)) return "Graduation Details is required";
        if (!hasText(onboardForm.hscMarkAndYear)) return "HSC Mark & Year is required";
        if (!hasText(onboardForm.sslcMarkAndYear)) return "SSLC Mark & Year is required";
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
        await loadData(page, pageSize, appliedFilters);
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

    const selectedEditHeadOffice = editHeadOffices.find(
      (item) => String(item.id) === String(editHeadOfficeId),
    );
    const selectedEditBranch = editBranches.find(
      (item) => String(item.id) === String(editBranchId),
    );
    const selectedEditDepartment = editDepartments.find(
      (item) => String(item.id) === String(editDepartmentId),
    );
    const selectedEditDesignation = editDesignations.find(
      (item) => String(item.id) === String(editDesignationId),
    );
    const editHeadOfficeOptions = useMemo(
      () => withInactiveSelected(editHeadOffices, editHeadOfficeId),
      [editHeadOffices, editHeadOfficeId],
    );
    const editBranchOptions = useMemo(
      () => withInactiveSelected(editBranches, editBranchId),
      [editBranches, editBranchId],
    );
    const editDepartmentOptions = useMemo(
      () => withInactiveSelected(editDepartments, editDepartmentId),
      [editDepartments, editDepartmentId],
    );
    const editDesignationOptions = useMemo(
      () => withInactiveSelected(editDesignations, editDesignationId),
      [editDesignations, editDesignationId],
    );
    const handleSubmit = async (e) => {
      e.preventDefault();
      
      const phoneValidationError = validatePhoneNumber(form.phone, form.countryCode);
      if (phoneValidationError) {
        setPhoneError(phoneValidationError);
        return;
      }

      if (!editHeadOfficeId) {
        showError("Head Office is required");
        return;
      }
      if (!editBranchId) {
        showError("Branch is required");
        return;
      }
      if (!editDepartmentId) {
        showError("Department is required");
        return;
      }
      if (!editDesignationId) {
        showError("Designation is required");
        return;
      }
      
      setSaving(true);
      try {
        const payload = toApiPayload({
          ...form,
          headOfficeId: editHeadOfficeId ? Number(editHeadOfficeId) : null,
          branchId: editBranchId ? Number(editBranchId) : null,
          departmentMasterId: editDepartmentId ? Number(editDepartmentId) : null,
          designationMasterId: editDesignationId ? Number(editDesignationId) : null,
          dept: selectedEditDepartment?.name || form.dept,
          designation: selectedEditDesignation?.name || form.designation,
          branchToJoin: selectedEditBranch?.name || form.branchToJoin,
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
        await loadData(page, pageSize, appliedFilters);
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
        await loadData(page, pageSize, appliedFilters);
      } catch (e) {
        showError(extractApiErrorMessage(e, "Failed to delete employee"));
      } finally {
        setSaving(false);
      }
    };

    const employeeGridData = rows.map(r => ({
      ...r,
      role: r.designation,
      projects: 0, done: 0, progress: 0, productivity: 0
    }));

    // Close modal function
    const closeModal = () => {
      setShowModal(false);
      setPhoneError("");
      setForm(EMPTY_FORM);
      setEditHeadOfficeId("");
      setEditBranchId("");
      setEditDepartmentId("");
      setEditDesignationId("");
      setIsEdit(false);
      setSelectedId(null);
    };

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
                      <button className="btn btn-sm btn-light" onClick={() => openEditModal(emp)}><EditGlyph size={12} /></button>
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
                      const cleared = {
                        headOfficeId: "",
                        branchId: "",
                        departmentId: "",
                        designationId: "",
                        profileStatus: "",
                      };
                      setFilters(cleared);
                      setAppliedFilters(cleared);
                      setPage(1);
                      setFilterBranches([]);
                      setFilterDepartments([]);
                      setFilterDesignations([]);
                      setFilterOpen(false);
                    }}
                  >
                    Clear
                  </button>
                  <button
                    type="button"
                    className="btn btn-primary w-50"
                    onClick={() => {
                      setAppliedFilters(filters);
                      setPage(1);
                      setFilterOpen(false);
                    }}
                  >
                    Apply
                  </button>
                </div>
              </div>
            </>
          )}
          <div className="card-body p-0">
            <div className="d-flex flex-wrap align-items-center justify-content-between gap-2 px-3 py-2 border-bottom">
              <div className="d-flex align-items-center gap-2">
                <span className="text-muted small">Rows per page</span>
                <select
                  className="form-select form-select-sm"
                  style={{ width: 110 }}
                  value={pageSize}
                  onChange={(e) => {
                    const next = Number(e.target.value);
                    setPageSize(Number.isFinite(next) && next > 0 ? next : 25);
                    setPage(1);
                  }}
                  disabled={loading}
                >
                  {[10, 25, 50, 100].map((n) => (
                    <option key={n} value={n}>
                      {n}
                    </option>
                  ))}
                </select>
                <span className="text-muted small">
                  {totalRows === 0
                    ? "0 rows"
                    : `Showing ${pageOffset + 1}-${Math.min(pageOffset + pageSize, totalRows)} of ${totalRows}`}
                </span>
              </div>
              <div className="d-flex align-items-center gap-2">
                <button
                  type="button"
                  className="btn btn-sm btn-light"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={loading || clampedPage <= 1}
                >
                  Prev
                </button>
                <span className="text-muted small">
                  Page {clampedPage} of {totalPages}
                </span>
                <button
                  type="button"
                  className="btn btn-sm btn-light"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={loading || clampedPage >= totalPages}
                >
                  Next
                </button>
              </div>
            </div>
            <div className="table-responsive">
              <table className="table table-striped table-hover mb-0">
                <thead>
                  <tr>
                    <th>Employee ID</th>
                    <th>Employee</th>
                   
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
                  ) : pagedRows.length === 0 ? (
                    <tr>
                      <td colSpan="10" className="text-center py-4 text-muted">
                        No employees found
                      </td>
                    </tr>
                  ) : (
                    pagedRows.map((emp) => (
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
                          <button className="btn btn-sm btn-outline-primary" onClick={() => openEditModal(emp)}>
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
                          {String(emp.profileStatus || "").toUpperCase() !== "VERIFIED" ? (
                            <button
                              className="btn btn-sm btn-outline-success ms-1"
                              type="button"
                              onClick={() => navigate(`/employees/${emp.id}/verify`)}
                              title="Verify profile"
                            >
                              Verify
                            </button>
                          ) : null}
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

        {/* Add/Edit Employee Modal with avm styles */}
        {showModal && (
          <div className="avm-backdrop" role="presentation">
            <div className="avm-modal" style={{ maxWidth: "680px" }} onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
              <div className="avm-modal-header">
                <h2 className="avm-modal-title">{isEdit ? "Edit Employee" : "Add Employee"}</h2>
                <button type="button" className="avm-modal-close" onClick={closeModal} aria-label="Close">
                  ×
                </button>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="avm-body">
                  <div className="row g-3">
                    {/* Employee Details Section */}
                    <div className="col-12 avm-section-col">
                      <p className="avm-section-title">Employee Details</p>
                    </div>

                    <div className="col-md-6">
                      <div className="avm-field">
                        <label className="avm-label">Full Name <span className="req">*</span></label>
                        <input
                          type="text"
                          className="avm-input"
                          value={form.name}
                          onChange={(e) => setForm({ ...form, name: e.target.value })}
                          required
                        />
                      </div>
                    </div>

                    <div className="col-md-6">
                      <div className="avm-field">
                        <label className="avm-label">Email <span className="req">*</span></label>
                        <input
                          type="email"
                          className="avm-input"
                          value={form.email}
                          onChange={(e) => setForm({ ...form, email: e.target.value })}
                          required
                        />
                      </div>
                    </div>

                    <div className="col-md-6">
                      <div className="avm-field">
                        <label className="avm-label">Mobile Number</label>
                        <div className={`employee-phone-input ${phoneError ? "employee-phone-input-error" : ""}`}>
                          <select
                            className="employee-phone-code"
                            value={form.countryCode}
                            onChange={(e) => {
                              setForm({ ...form, countryCode: e.target.value });
                              setPhoneError("");
                            }}
                          >
                            {COUNTRY_CODE_OPTIONS.map((option) => (
                              <option key={`${option.country}-${option.callingCode}`} value={option.value}>
                                {option.value}
                              </option>
                            ))}
                          </select>
                          <input
                            type="tel"
                            className="employee-phone-number"
                            value={form.phone}
                            maxLength={getCountryDisplayMaxLength(form.countryCode) || 15}
                            onChange={(e) => {
                              const sanitized = sanitizePhoneDigits(
                                e.target.value,
                                getCountryDisplayMaxLength(form.countryCode)
                              );
                              setForm({ ...form, phone: sanitized });
                              if (phoneError) {
                                const error = validatePhoneNumber(sanitized, form.countryCode);
                                setPhoneError(error);
                              }
                            }}
                            placeholder={`Enter ${getCountryDisplayMaxLength(form.countryCode)} digit number`}
                          />
                        </div>
                        {phoneError && <div className="avm-error">{phoneError}</div>}
                      </div>
                    </div>

                    <div className="col-md-6">
                      <div className="avm-field">
                        <label className="avm-label">Department</label>
                        <select
                          className="avm-select"
                          value={form.dept}
                          onChange={(e) => handleDeptChange(e.target.value)}
                          disabled={metaLoading}
                        >
                          <option value="">Select</option>
                          {form.dept && !departmentOptions.includes(form.dept) && (
                            <option value={form.dept}>{form.dept}</option>
                          )}
                          {departmentOptions.map((name) => (
                            <option key={name} value={name}>{name}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="col-md-6">
                      <div className="avm-field">
                        <label className="avm-label">Designation</label>
                        <select
                          className="avm-select"
                          value={form.designation}
                          onChange={(e) => setForm({ ...form, designation: e.target.value })}
                          disabled={metaLoading || !form.dept}
                        >
                          <option value="">Select</option>
                          {form.designation && !designationOptions.includes(form.designation) && (
                            <option value={form.designation}>{form.designation}</option>
                          )}
                          {designationOptions.map((name) => (
                            <option key={name} value={name}>{name}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="col-md-6">
                      <div className="avm-field">
                        <label className="avm-label">Join Date</label>
                        <input
                          type="date"
                          className="avm-input"
                          value={form.joinDate}
                          onChange={(e) => setForm({ ...form, joinDate: e.target.value })}
                        />
                      </div>
                    </div>

                    <div className="col-md-6">
                      <div className="avm-field">
                        <label className="avm-label">Status</label>
                        <select
                          className="avm-select"
                          value={form.status}
                          onChange={(e) => setForm({ ...form, status: e.target.value })}
                        >
                          <option value="ACTIVE">Active</option>
                          <option value="INACTIVE">Inactive</option>
                        </select>
                      </div>
                    </div>

                    {/* Organization Details Section */}
                    <div className="col-12 avm-section-col">
                      <p className="avm-section-title">Organization Details</p>
                    </div>

                    <div className="col-md-6">
                      <div className="avm-field">
                        <label className="avm-label">Head Office <span className="req">*</span></label>
                        <select
                          className="avm-select"
                          value={editHeadOfficeId}
                          onChange={(e) => {
                            const val = e.target.value;
                            setEditHeadOfficeId(val);
                            setEditBranchId("");
                            setEditDepartmentId("");
                            setEditDesignationId("");
                            setForm((prev) => ({
                              ...prev,
                              headOfficeId: val ? Number(val) : null,
                              branchId: null,
                              departmentMasterId: null,
                              designationMasterId: null,
                              branchToJoin: "",
                              departmentName: "",
                              dept: "",
                              designation: "",
                            }));
                          }}
                        >
                          <option value="">Select</option>
                          {editHeadOfficeOptions.map((item) => (
                            <option key={item.id} value={item.id}>{item.name}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="col-md-6">
                      <div className="avm-field">
                        <label className="avm-label">Branch <span className="req">*</span></label>
                        <select
                          className="avm-select"
                          value={editBranchId}
                          onChange={(e) => {
                            const val = e.target.value;
                            const selected = editBranchOptions.find((item) => String(item.id) === String(val));
                            setEditBranchId(val);
                            setEditDepartmentId("");
                            setEditDesignationId("");
                            setForm((prev) => ({
                              ...prev,
                              branchId: val ? Number(val) : null,
                              branchToJoin: selected?.name || "",
                              departmentMasterId: null,
                              designationMasterId: null,
                              dept: "",
                              designation: "",
                            }));
                          }}
                          disabled={!editHeadOfficeId}
                        >
                          <option value="">Select</option>
                          {editBranchOptions.map((item) => (
                            <option key={item.id} value={item.id}>{item.name}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                  </div>
                </div>

                <div className="avm-footer">
                  <div></div>
                  <div className="avm-footer-right">
                    <button type="button" className="avm-btn light" onClick={closeModal} disabled={saving}>
                      Cancel
                    </button>
                    <button type="submit" className="avm-btn primary" disabled={saving}>
                      {saving ? "Saving..." : "Save Changes"}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal with avm styles */}
        {showDeleteModal && (
          <div className="avm-backdrop" role="presentation">
            <div className="avm-modal" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
              <div className="avm-modal-header">
                <h2 className="avm-modal-title">Confirm Delete</h2>
                <button type="button" className="avm-modal-close" onClick={() => setShowDeleteModal(false)} aria-label="Close">
                  ×
                </button>
              </div>
              <div className="avm-body">
                <p>Are you sure you want to delete this employee? This action cannot be undone.</p>
              </div>
              <div className="avm-footer">
                <div></div>
                <div className="avm-footer-right">
                  <button type="button" className="avm-btn light" onClick={() => setShowDeleteModal(false)} disabled={saving}>
                    Cancel
                  </button>
                  <button type="button" className="avm-btn primary" onClick={handleDelete} disabled={saving}>
                    {saving ? "Deleting..." : "Delete"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    );
  }
