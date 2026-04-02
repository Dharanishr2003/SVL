import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  changeUserRole,
  createUser,
  deleteSelectedSessions,
  deleteUser,
  getPendingUsers,
  getUserLogs,
  getUserSessions,
  getUsers,
  setUserActive,
} from "../../api/userAdminApi";
import { getAvailableEmployees } from "../../api/employeesApi";
import { extractApiErrorMessage } from "../../utils/errorMessage";
import { useAuth } from "../../context/AuthContext";
import {
  createDepartment,
  createInstitution,
  createInstitutionCategory,
  createInstitutionType,
  createTeam,
  getDepartments,
  getInstitutionCategories,
  getInstitutionTypes,
  getInstitutions,
  getTeams,
  getUserOrgSelection,
} from "../../api/orgHierarchyApi";
import { useToast } from "../../components/system/ToastProvider";
import ConfirmDialog from "../../components/system/ConfirmDialog";

const FALLBACK_ROLES = ["SUPER_ADMIN", "ADMIN", "MANAGER", "EMPLOYEE"];
const ENV_ROLE_OPTIONS = String(
  import.meta.env.VITE_ROLE_OPTIONS || "",
).trim();
const ROLE_OPTIONS = ENV_ROLE_OPTIONS
  ? ENV_ROLE_OPTIONS.split(",").map((r) => r.trim()).filter(Boolean)
  : FALLBACK_ROLES;

const ROLE_RANK = {
  SUPER_ADMIN: 4,
  ADMIN: 3,
  MANAGER: 2,
  EMPLOYEE: 1,
};

const EMPTY_FORM = {
  username: "",
  email: "",
  firstName: "",
  lastName: "",
  phone: "",
  role: "EMPLOYEE",
  institution: "",
  institutionCategory: "",
  institutionType: "",
  departmentName: "",
  team: "",
  password: "",
  newPassword: "",
  confirmPassword: "",
};

function UseradminPage() {
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const { showSuccess, showError } = useToast();
  const currentRole = String(currentUser?.role || "").toUpperCase();
  const [rows, setRows] = useState([]);
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [sessionSelection, setSessionSelection] = useState(new Set());
  const [userLogs, setUserLogs] = useState([]);
  const [pendingRows, setPendingRows] = useState([]);
  const [pendingPage, setPendingPage] = useState(0);
  const [pendingSize, setPendingSize] = useState(10);
  const [pendingTotalPages, setPendingTotalPages] = useState(0);
  const [pendingLoading, setPendingLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("users");
  const [showCreatePassword, setShowCreatePassword] = useState(false);
  const [showOrgModal, setShowOrgModal] = useState(false);
  const [orgModalLevel, setOrgModalLevel] = useState("");
  const [orgModalName, setOrgModalName] = useState("");
  const [filters, setFilters] = useState({
    search: "",
    role: "",
    status: "",
    institution: "",
    category: "",
    type: "",
    department: "",
    team: "",
  });
  const [orgLoading, setOrgLoading] = useState(false);
  const [institutionId, setInstitutionId] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [typeId, setTypeId] = useState("");
  const [departmentId, setDepartmentId] = useState("");
  const [teamId, setTeamId] = useState("");
  const [institutions, setInstitutions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [types, setTypes] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [teams, setTeams] = useState([]);
  const [orgSelection, setOrgSelection] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState("");

  const loadAvailableEmployees = async () => {
    try {
      const data = await getAvailableEmployees();
      setEmployees(Array.isArray(data) ? data : []);
    } catch (e) {
      showError(extractApiErrorMessage(e, "Failed to load employees"));
      setEmployees([]);
    }
  };

  const load = async (nextPage = page, nextSize = size) => {
    setLoading(true);
    try {
      const payload = await getUsers(nextPage, nextSize);
      setRows(payload.items || []);
      setPage(payload.page ?? nextPage);
      setSize(payload.size ?? nextSize);
      setTotalPages(payload.totalPages ?? 0);
    } catch (e) {
      showError(extractApiErrorMessage(e, "Failed to load users"));
      setRows([]);
    } finally {
      setLoading(false);
    }
  };

  const loadPending = async (
    nextPage = pendingPage,
    nextSize = pendingSize,
  ) => {
    setPendingLoading(true);
    try {
      const payload = await getPendingUsers(nextPage, nextSize);
      setPendingRows(payload.items || []);
      setPendingPage(payload.page ?? nextPage);
      setPendingSize(payload.size ?? nextSize);
      setPendingTotalPages(payload.totalPages ?? 0);
    } catch (e) {
      showError(extractApiErrorMessage(e, "Failed to load pending users"));
      setPendingRows([]);
    } finally {
      setPendingLoading(false);
    }
  };

  useEffect(() => {
    load(0, size);
    loadPending(0, pendingSize);
  }, []);

  useEffect(() => {
    loadAvailableEmployees();
  }, [showError]);

  useEffect(() => {
    let isMounted = true;
    const loadInstitutions = async () => {
      setOrgLoading(true);
      try {
        const data = await getInstitutions();
        if (!isMounted) return;
        setInstitutions(Array.isArray(data) ? data : []);

        const currentInstitutionName = currentUser?.institution || "";
        if (currentInstitutionName) {
          const match = data.find(
            (item) =>
              String(item.name || "").toLowerCase() ===
              String(currentInstitutionName).toLowerCase(),
          );
          if (match) {
            setInstitutionId(String(match.id));
          }
        }
      } catch (e) {
        if (isMounted) {
          showError(extractApiErrorMessage(e, "Failed to load institutions"));
        }
      } finally {
        if (isMounted) setOrgLoading(false);
      }
    };
    loadInstitutions();
    return () => {
      isMounted = false;
    };
  }, [currentUser?.institution]);

  useEffect(() => {
    let isMounted = true;
    const loadUserSelection = async () => {
      if (!currentUser?.id) return;
      try {
        const selection = await getUserOrgSelection(currentUser.id);
        if (!isMounted || !selection) return;
        setOrgSelection(selection);
        if (selection.institutionId) {
          setInstitutionId(String(selection.institutionId));
        }
        if (selection.categoryId) {
          setCategoryId(String(selection.categoryId));
        }
        if (selection.typeId) {
          setTypeId(String(selection.typeId));
        }
        if (selection.departmentId) {
          setDepartmentId(String(selection.departmentId));
        }
        if (selection.teamId) {
          setTeamId(String(selection.teamId));
        }
      } catch (e) {
        if (isMounted) {
          showError(extractApiErrorMessage(e, "Failed to load org selection"));
        }
      }
    };
    loadUserSelection();
    return () => {
      isMounted = false;
    };
  }, [currentUser?.id]);

  useEffect(() => {
    let isMounted = true;
    const loadCategories = async () => {
      if (!institutionId) {
        setCategories([]);
        return;
      }
      setOrgLoading(true);
      try {
        const data = await getInstitutionCategories(institutionId);
        if (!isMounted) return;
        setCategories(Array.isArray(data) ? data : []);

        const currentCategory = currentUser?.institutionCategory || "";
        if (currentCategory && !categoryId) {
          const match = data.find(
            (item) =>
              String(item.name || "").toLowerCase() ===
              String(currentCategory).toLowerCase(),
          );
          if (match) {
            setCategoryId(String(match.id));
          }
        }
      } catch (e) {
        if (isMounted) {
          showError(extractApiErrorMessage(e, "Failed to load categories"));
        }
      } finally {
        if (isMounted) setOrgLoading(false);
      }
    };
    loadCategories();
    return () => {
      isMounted = false;
    };
  }, [institutionId, currentUser?.institutionCategory, categoryId]);

  useEffect(() => {
    let isMounted = true;
    const loadTypes = async () => {
      if (!institutionId || !categoryId) {
        setTypes([]);
        return;
      }
      setOrgLoading(true);
      try {
        const data = await getInstitutionTypes(institutionId, categoryId);
        if (!isMounted) return;
        setTypes(Array.isArray(data) ? data : []);

        const currentType = currentUser?.institutionType || "";
        if (currentType && !typeId) {
          const match = data.find(
            (item) =>
              String(item.name || "").toLowerCase() ===
              String(currentType).toLowerCase(),
          );
          if (match) {
            setTypeId(String(match.id));
          }
        }
      } catch (e) {
        if (isMounted) {
          showError(extractApiErrorMessage(e, "Failed to load types"));
        }
      } finally {
        if (isMounted) setOrgLoading(false);
      }
    };
    loadTypes();
    return () => {
      isMounted = false;
    };
  }, [institutionId, categoryId, currentUser?.institutionType, typeId]);

  useEffect(() => {
    let isMounted = true;
    const loadDepartmentRows = async () => {
      if (!institutionId || !categoryId || !typeId) {
        setDepartments([]);
        return;
      }
      setOrgLoading(true);
      try {
        const data = await getDepartments(institutionId, categoryId, typeId);
        if (!isMounted) return;
        setDepartments(Array.isArray(data) ? data : []);

        const currentDepartment = currentUser?.departmentName || "";
        if (currentDepartment && !departmentId) {
          const match = data.find(
            (item) =>
              String(item.name || "").toLowerCase() ===
              String(currentDepartment).toLowerCase(),
          );
          if (match) {
            setDepartmentId(String(match.id));
          }
        }
      } catch (e) {
        if (isMounted) {
          showError(extractApiErrorMessage(e, "Failed to load departments"));
        }
      } finally {
        if (isMounted) setOrgLoading(false);
      }
    };
    loadDepartmentRows();
    return () => {
      isMounted = false;
    };
  }, [institutionId, categoryId, typeId, currentUser?.departmentName, departmentId]);

  useEffect(() => {
    let isMounted = true;
    const loadTeamRows = async () => {
      if (!institutionId || !categoryId || !typeId || !departmentId) {
        setTeams([]);
        return;
      }
      setOrgLoading(true);
      try {
        const data = await getTeams(
          institutionId,
          categoryId,
          typeId,
          departmentId,
        );
        if (!isMounted) return;
        setTeams(Array.isArray(data) ? data : []);

        const currentTeam = currentUser?.team || "";
        if (currentTeam && currentRole === "MANAGER" && !teamId) {
          const match = data.find(
            (item) =>
              String(item.name || "").toLowerCase() ===
              String(currentTeam).toLowerCase(),
          );
          if (match) {
            setTeamId(String(match.id));
          }
        }
      } catch (e) {
        if (isMounted) {
          showError(extractApiErrorMessage(e, "Failed to load teams"));
        }
      } finally {
        if (isMounted) setOrgLoading(false);
      }
    };
    loadTeamRows();
    return () => {
      isMounted = false;
    };
  }, [institutionId, categoryId, typeId, departmentId, currentUser?.team, currentRole, teamId]);

  const canAccessPage = useMemo(() => {
    return currentRole && currentRole !== "EMPLOYEE";
  }, [currentRole]);

  const isSameInstitutionType = (row) =>
    !currentUser?.institutionType ||
    row?.institutionType === currentUser?.institutionType;

  const isSameTeam = (row) =>
    !currentUser?.team || row?.team === currentUser?.team;

  const canSeeUser = (row) => {
    const role = String(currentUser?.role || "").toUpperCase();
    if (role === "SUPER_ADMIN") return true;
    if (role === "ADMIN") return isSameInstitutionType(row);
    if (role === "MANAGER") {
      return isSameTeam(row) && String(row?.role || "").toUpperCase() === "EMPLOYEE";
    }
    return false;
  };

  const visibleRows = useMemo(
    () => rows.filter(canSeeUser),
    [rows, currentUser?.role, currentUser?.institutionType, currentUser?.team],
  );

  const visiblePendingRows = useMemo(
    () => pendingRows.filter(canSeeUser),
    [pendingRows, currentUser?.role, currentUser?.institutionType, currentUser?.team],
  );

  const ordered = useMemo(
    () => [...visibleRows].sort((a, b) => (b.id || 0) - (a.id || 0)),
    [visibleRows],
  );

  const orderedPending = useMemo(
    () => [...visiblePendingRows].sort((a, b) => (b.id || 0) - (a.id || 0)),
    [visiblePendingRows],
  );

  const departmentOptions = useMemo(() => {
    const set = new Set(
      visibleRows.map((row) => row.departmentName).filter(Boolean),
    );
    return Array.from(set).sort();
  }, [visibleRows]);

  const teamOptions = useMemo(() => {
    const set = new Set(visibleRows.map((row) => row.team).filter(Boolean));
    return Array.from(set).sort();
  }, [visibleRows]);

  const roleOptions = useMemo(() => {
    return [...FALLBACK_ROLES];
  }, []);

  const applyFilters = (rows) => {
    const searchTerm = filters.search.trim().toLowerCase();
    return rows.filter((row) => {
      if (searchTerm) {
        const haystack = [
          row.username,
          row.email,
          row.firstName,
          row.lastName,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        if (!haystack.includes(searchTerm)) return false;
      }

      if (filters.status) {
        const isActive = filters.status === "ACTIVE";
        if (Boolean(row.active) !== isActive) return false;
      }

      if (currentRole === "SUPER_ADMIN" || currentRole === "ADMIN") {
        if (filters.institution && row.institution !== filters.institution)
          return false;
        if (filters.category && row.institutionCategory !== filters.category)
          return false;
        if (filters.type && row.institutionType !== filters.type)
          return false;
        if (filters.role && row.role !== filters.role) return false;
        if (filters.department && row.departmentName !== filters.department)
          return false;
        if (filters.team && row.team !== filters.team) return false;
      } else if (currentRole === "ADMIN") {
        if (filters.department && row.departmentName !== filters.department)
          return false;
      } else if (currentRole === "MANAGER") {
        if (filters.team && row.team !== filters.team) return false;
      }

      return true;
    });
  };

  const filteredRows = useMemo(
    () => applyFilters(ordered),
    [ordered, filters, currentRole],
  );

  const filteredPending = useMemo(
    () => applyFilters(orderedPending),
    [orderedPending, filters, currentRole],
  );

  const allowedAssignRoles = useMemo(() => {
    const currentRank = ROLE_RANK[currentRole] || 0;
    return ROLE_OPTIONS.filter(
      (role) => (ROLE_RANK[role] || 0) < currentRank,
    );
  }, [currentRole]);

  // Filter employees to only show those without existing user accounts
  const availableEmployees = useMemo(() => {
    return employees;
  }, [employees]);

  const isAdmin = currentRole === "ADMIN";
  const isManager = currentRole === "MANAGER";

  const selectedInstitution = institutions.find(
    (item) => String(item.id) === String(institutionId),
  );
  const selectedCategory = categories.find(
    (item) => String(item.id) === String(categoryId),
  );
  const selectedType = types.find(
    (item) => String(item.id) === String(typeId),
  );
  const selectedDepartment = departments.find(
    (item) => String(item.id) === String(departmentId),
  );
  const selectedTeam = teams.find(
    (item) => String(item.id) === String(teamId),
  );
  const roleRequiresTeam =
    currentRole !== "SUPER_ADMIN" || String(form.role || "").toUpperCase() === "MANAGER";

  useEffect(() => {
    if (!form.institution || institutionId) return;
    const match = institutions.find(
      (item) =>
        String(item?.name || "").trim().toLowerCase() ===
        String(form.institution || "").trim().toLowerCase(),
    );
    if (match?.id) setInstitutionId(String(match.id));
  }, [form.institution, institutionId, institutions]);

  useEffect(() => {
    if (!form.institutionCategory || categoryId) return;
    const match = categories.find(
      (item) =>
        String(item?.name || "").trim().toLowerCase() ===
        String(form.institutionCategory || "").trim().toLowerCase(),
    );
    if (match?.id) setCategoryId(String(match.id));
  }, [form.institutionCategory, categoryId, categories]);

  useEffect(() => {
    if (!form.institutionType || typeId) return;
    const match = types.find(
      (item) =>
        String(item?.name || "").trim().toLowerCase() ===
        String(form.institutionType || "").trim().toLowerCase(),
    );
    if (match?.id) setTypeId(String(match.id));
  }, [form.institutionType, typeId, types]);

  useEffect(() => {
    if (!form.departmentName || departmentId) return;
    const match = departments.find(
      (item) =>
        String(item?.name || "").trim().toLowerCase() ===
        String(form.departmentName || "").trim().toLowerCase(),
    );
    if (match?.id) setDepartmentId(String(match.id));
  }, [form.departmentName, departmentId, departments]);

  useEffect(() => {
    if (!form.team || teamId) return;
    const match = teams.find(
      (item) =>
        String(item?.name || "").trim().toLowerCase() ===
        String(form.team || "").trim().toLowerCase(),
    );
    if (match?.id) setTeamId(String(match.id));
  }, [form.team, teamId, teams]);

  const openCreate = () => {
    setForm(EMPTY_FORM);
    setSelectedEmployeeId("");
    setShowModal(true);
    loadAvailableEmployees();

    if (currentRole === "SUPER_ADMIN") {
      setInstitutionId("");
      setCategoryId("");
      setTypeId("");
      setDepartmentId("");
      setTeamId("");
      setCategories([]);
      setTypes([]);
      setDepartments([]);
      setTeams([]);
      return;
    }

    if (orgSelection) {
      setInstitutionId(String(orgSelection.institutionId || ""));
      setCategoryId(String(orgSelection.categoryId || ""));
      setTypeId(String(orgSelection.typeId || ""));
      setDepartmentId(String(orgSelection.departmentId || ""));
      setTeamId(String(orgSelection.teamId || ""));
    }
  };

  const handleSelectEmployee = (employeeId) => {
    setSelectedEmployeeId(employeeId);
    if (employeeId) {
      const employee = employees.find((emp) => String(emp.id) === String(employeeId));
      if (employee) {
        const nameParts = (employee.name || "").split(" ");
        const employeeInstitution = String(
          employee.institution || employee.institutionName || "",
        ).trim();
        const employeeCategory = String(
          employee.institutionCategory || employee.category || "",
        ).trim();
        const employeeType = String(
          employee.institutionType || employee.type || "",
        ).trim();
        const employeeDepartment = String(
          employee.departmentName || employee.userDepartmentName || employee.dept || "",
        ).trim();
        const employeeTeam = String(employee.team || employee.teamName || "").trim();

        const matchedInstitution = institutions.find(
          (item) =>
            String(item?.name || "").trim().toLowerCase() === employeeInstitution.toLowerCase(),
        );
        const matchedCategory = categories.find(
          (item) =>
            String(item?.name || "").trim().toLowerCase() === employeeCategory.toLowerCase(),
        );
        const matchedType = types.find(
          (item) =>
            String(item?.name || "").trim().toLowerCase() === employeeType.toLowerCase(),
        );
        const matchedDepartment = departments.find(
          (item) =>
            String(item?.name || "").trim().toLowerCase() === employeeDepartment.toLowerCase(),
        );
        const matchedTeam = teams.find(
          (item) =>
            String(item?.name || "").trim().toLowerCase() === employeeTeam.toLowerCase(),
        );

        if (matchedInstitution?.id) setInstitutionId(String(matchedInstitution.id));
        if (matchedCategory?.id) setCategoryId(String(matchedCategory.id));
        if (matchedType?.id) setTypeId(String(matchedType.id));
        if (matchedDepartment?.id) setDepartmentId(String(matchedDepartment.id));
        if (matchedTeam?.id) setTeamId(String(matchedTeam.id));

        setForm((prev) => ({
          ...prev,
          email: employee.email || "",
          phone: employee.phone || "",
          firstName: nameParts[0] || "",
          lastName: nameParts.slice(1).join(" ") || "",
          institution: employeeInstitution,
          institutionCategory: employeeCategory,
          institutionType: employeeType,
          departmentName: employeeDepartment,
          team: employeeTeam,
        }));
      }
    }
  };

  const openEdit = (row) => {
    if (!row?.id) return;
    navigate(`/user-edit/${row.id}`, { state: { user: row } });
  };

  const handleAddInstitution = async () => {
    setOrgModalLevel("institution");
    setOrgModalName("");
    setShowOrgModal(true);
  };

  const handleAddCategory = async () => {
    if (!institutionId) {
      showError("Select institution first");
      return;
    }
    setOrgModalLevel("category");
    setOrgModalName("");
    setShowOrgModal(true);
  };

  const handleAddType = async () => {
    if (!institutionId || !categoryId) {
      showError("Select institution and category first");
      return;
    }
    setOrgModalLevel("type");
    setOrgModalName("");
    setShowOrgModal(true);
  };

  const handleAddDepartment = async () => {
    if (!institutionId || !categoryId || !typeId) {
      showError("Select institution, category and type first");
      return;
    }
    setOrgModalLevel("department");
    setOrgModalName("");
    setShowOrgModal(true);
  };

  const handleAddTeam = async () => {
    if (!institutionId || !categoryId || !typeId || !departmentId) {
      showError("Select institution, category, type and department first");
      return;
    }
    setOrgModalLevel("team");
    setOrgModalName("");
    setShowOrgModal(true);
  };

  const handleCreateOrgNode = async () => {
    const name = String(orgModalName || "").trim();
    if (!name) {
      showError("Name is required");
      return;
    }

    setSaving(true);
    try {
      if (orgModalLevel === "institution") {
        const created = await createInstitution(name);
        const data = await getInstitutions();
        setInstitutions(Array.isArray(data) ? data : []);
        if (created?.id) setInstitutionId(String(created.id));
        showSuccess("Institution created");
      } else if (orgModalLevel === "category") {
        const created = await createInstitutionCategory(institutionId, name);
        const data = await getInstitutionCategories(institutionId);
        setCategories(Array.isArray(data) ? data : []);
        if (created?.id) setCategoryId(String(created.id));
        showSuccess("Category created");
      } else if (orgModalLevel === "type") {
        const created = await createInstitutionType(institutionId, categoryId, name);
        const data = await getInstitutionTypes(institutionId, categoryId);
        setTypes(Array.isArray(data) ? data : []);
        if (created?.id) setTypeId(String(created.id));
        showSuccess("Type created");
      } else if (orgModalLevel === "department") {
        const created = await createDepartment(institutionId, categoryId, typeId, name);
        const data = await getDepartments(institutionId, categoryId, typeId);
        setDepartments(Array.isArray(data) ? data : []);
        if (created?.id) setDepartmentId(String(created.id));
        showSuccess("Department created");
      } else if (orgModalLevel === "team") {
        const created = await createTeam(
          institutionId,
          categoryId,
          typeId,
          departmentId,
          name,
        );
        const data = await getTeams(institutionId, categoryId, typeId, departmentId);
        setTeams(Array.isArray(data) ? data : []);
        if (created?.id) setTeamId(String(created.id));
        showSuccess("Team created");
      }
      setShowOrgModal(false);
      setOrgModalName("");
      setOrgModalLevel("");
    } catch (e) {
      showError(extractApiErrorMessage(e, "Failed to create item"));
    } finally {
      setSaving(false);
    }
  };

  const handleSave = async () => {
    if (!form.username.trim()) {
      showError("Username is required");
      return;
    }
    if (!form.email.trim()) {
      showError("Email is required");
      return;
    }
    setSaving(true);
    try {
      if (!form.password.trim()) {
        showError("Password is required");
        setSaving(false);
        return;
      }
      if (!selectedInstitution?.name) {
        showError("Institution is required");
        setSaving(false);
        return;
      }
      if (!selectedCategory?.name) {
        showError("Category is required");
        setSaving(false);
        return;
      }
      if (!selectedType?.name) {
        showError("Type is required");
        setSaving(false);
        return;
      }
      if (!selectedDepartment?.name) {
        showError("Department is required");
        setSaving(false);
        return;
      }
      if (roleRequiresTeam && !selectedTeam?.name) {
        showError("Team is required");
        setSaving(false);
        return;
      }

      const payload = {
        ...form,
        role:
          currentRole === "SUPER_ADMIN"
            ? String(form.role || "EMPLOYEE").toUpperCase()
            : "EMPLOYEE",
        institution: selectedInstitution.name,
        institutionCategory: selectedCategory.name,
        institutionType: selectedType.name,
        departmentName: selectedDepartment.name,
        team: selectedTeam?.name || "",
      };
      if (String(currentUser?.role || "").toUpperCase() === "ADMIN") {
        payload.institutionType = currentUser?.institutionType || payload.institutionType;
      }
      if (String(currentUser?.role || "").toUpperCase() === "MANAGER") {
        payload.institutionType = currentUser?.institutionType || payload.institutionType;
        payload.team = currentUser?.team || payload.team;
      }
      await createUser(payload);
      showSuccess("User created");
      setShowModal(false);
      setForm(EMPTY_FORM);
      await loadAvailableEmployees();
      await load();
      await loadPending();
    } catch (e) {
      showError(extractApiErrorMessage(e, "Failed to save user"));
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async (row) => {
    setSaving(true);
    try {
      await setUserActive(row.id, !row.active);
      showSuccess(row.active ? "User deactivated" : "User activated");
      await load();
      await loadPending();
    } catch (e) {
      showError(extractApiErrorMessage(e, "Failed to update status"));
    } finally {
      setSaving(false);
    }
  };

  const handleRoleChange = async (row, role) => {
    if (!allowedAssignRoles.includes(role)) {
      showError("You are not allowed to assign this role");
      return;
    }
    setSaving(true);
    try {
      await changeUserRole(row.id, role);
      showSuccess("Role updated");
      await load();
      await loadPending();
    } catch (e) {
      showError(extractApiErrorMessage(e, "Failed to update role"));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (row) => {
    if (!row?.id) return;
    setUserToDelete(row);
    setShowDeleteConfirm(true);
  };

  const handleConfirmDelete = async () => {
    if (!userToDelete?.id) return;
    setSaving(true);
    try {
      await deleteUser(userToDelete.id);
      showSuccess("User deleted");
      await load();
      await loadPending();
      await loadAvailableEmployees();
    } catch (e) {
      showError(extractApiErrorMessage(e, "Failed to delete user"));
    } finally {
      setSaving(false);
      setShowDeleteConfirm(false);
      setUserToDelete(null);
    }
  };

  const loadUserDetails = async (row) => {
    if (!row?.id) return;
    setSelectedUser(row);
    setSessions([]);
    setUserLogs([]);
    setSessionSelection(new Set());
    try {
      const [sessionsData, logsData] = await Promise.all([
        getUserSessions(row.id),
        getUserLogs(row.id),
      ]);
      setSessions(Array.isArray(sessionsData) ? sessionsData : []);
      setUserLogs(Array.isArray(logsData) ? logsData : []);
    } catch (e) {
      showError(extractApiErrorMessage(e, "Failed to load user details"));
    }
  };

  const toggleSessionSelection = (id) => {
    setSessionSelection((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleDeleteSessions = async () => {
    if (!selectedUser?.id || sessionSelection.size === 0) return;
    setSaving(true);
    try {
      await deleteSelectedSessions(selectedUser.id, Array.from(sessionSelection));
      showSuccess("Sessions deleted");
      await loadUserDetails(selectedUser);
    } catch (e) {
      showError(extractApiErrorMessage(e, "Failed to delete sessions"));
    } finally {
      setSaving(false);
    }
  };

  const totalLabel = totalPages ? `Page ${page + 1} of ${totalPages}` : "Page 1";
  const pendingLabel = pendingTotalPages
    ? `Page ${pendingPage + 1} of ${pendingTotalPages}`
    : "Page 1";

  if (!canAccessPage) {
    return (
      <div className="content">
        <div className="card">
          <div className="card-body">
            <h4 className="mb-1">Unauthorized</h4>
            <p className="mb-0">You do not have access to this page.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="content">
      <div className="card">
        <div className="card-header d-flex align-items-center justify-content-between flex-wrap gap-2">
          <div>
            <h4 className="mb-1">User Admin</h4>
            <p className="mb-0 text-muted">
              Manage your users. Click the tabs to see other tables.
            </p>
          </div>
          <button className="btn btn-primary" onClick={openCreate}>
            + Add User
          </button>
        </div>
        <div className="card-body">
          <div className="d-flex align-items-end justify-content-between flex-wrap gap-2 mb-3">
            <div className="d-flex align-items-end flex-wrap gap-2">
              <div>
                <label className="form-label">Search</label>
                <input
                  className="form-control"
                  value={filters.search}
                  onChange={(e) =>
                    setFilters((prev) => ({ ...prev, search: e.target.value }))
                  }
                  placeholder="Search username/email"
                />
              </div>
              <div>
                <label className="form-label">Status</label>
                <select
                  className="form-select"
                  value={filters.status}
                  onChange={(e) =>
                    setFilters((prev) => ({ ...prev, status: e.target.value }))
                  }
                >
                  <option value="">All</option>
                  <option value="ACTIVE">Active</option>
                  <option value="INACTIVE">Inactive</option>
                </select>
              </div>
              {currentRole === "SUPER_ADMIN" && (
                <>
                  <div>
                    <label className="form-label">Institution *</label>
                    <select
                      className="form-select"
                      value={filters.institution}
                      onChange={(e) => {
                        const val = e.target.value;
                        setFilters((prev) => ({ ...prev, institution: val, category: "", type: "", department: "", team: "" }));
                        if (val) {
                          const inst = institutions.find((i) => i.name === val);
                          if (inst) setInstitutionId(String(inst.id));
                        } else {
                          setInstitutionId("");
                        }
                        setCategoryId("");
                        setTypeId("");
                        setDepartmentId("");
                        setTeamId("");
                      }}
                    >
                      <option value="">Select</option>
                      {institutions.map((inst) => (
                        <option key={inst.id} value={inst.name}>
                          {inst.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="form-label">Category *</label>
                    <select
                      className="form-select"
                      value={filters.category}
                      onChange={(e) => {
                        const val = e.target.value;
                        setFilters((prev) => ({ ...prev, category: val, type: "", department: "", team: "" }));
                        if (val) {
                          const cat = categories.find((c) => c.name === val);
                          if (cat) setCategoryId(String(cat.id));
                        } else {
                          setCategoryId("");
                        }
                        setTypeId("");
                        setDepartmentId("");
                        setTeamId("");
                      }}
                      disabled={!filters.institution}
                    >
                      <option value="">Select</option>
                      {categories.map((cat) => (
                        <option key={cat.id} value={cat.name}>
                          {cat.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="form-label">Type *</label>
                    <select
                      className="form-select"
                      value={filters.type}
                      onChange={(e) => {
                        const val = e.target.value;
                        setFilters((prev) => ({ ...prev, type: val, department: "", team: "" }));
                        if (val) {
                          const t = types.find((ty) => ty.name === val);
                          if (t) setTypeId(String(t.id));
                        } else {
                          setTypeId("");
                        }
                        setDepartmentId("");
                        setTeamId("");
                      }}
                      disabled={!filters.category}
                    >
                      <option value="">Select</option>
                      {types.map((t) => (
                        <option key={t.id} value={t.name}>
                          {t.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </>
              )}
              <div>
                <label className="form-label">Department *</label>
                <select
                  className="form-select"
                  value={filters.department}
                  onChange={(e) => {
                    const val = e.target.value;
                    setFilters((prev) => ({
                      ...prev,
                      department: val,
                      team: "",
                    }));
                    if (val) {
                      const dept = departments.find((d) => d.name === val);
                      if (dept) setDepartmentId(String(dept.id));
                    } else {
                      setDepartmentId("");
                    }
                    setTeamId("");
                  }}
                  disabled={currentRole === "MANAGER" || (currentRole === "SUPER_ADMIN" ? !filters.type : !typeId)}
                >
                  <option value="">Select</option>
                  {departments.map((dept) => (
                    <option key={dept.id} value={dept.name}>
                      {dept.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="form-label">Team *</label>
                <select
                  className="form-select"
                  value={filters.team}
                  onChange={(e) => {
                    const val = e.target.value;
                    setFilters((prev) => ({ ...prev, team: val }));
                    if (val) {
                      const team = teams.find((t) => t.name === val);
                      if (team) setTeamId(String(team.id));
                    } else {
                      setTeamId("");
                    }
                  }}
                  disabled={currentRole === "SUPER_ADMIN" ? !filters.department : !departmentId}
                >
                  <option value="">Select</option>
                  {teams.map((team) => (
                    <option key={team.id} value={team.name}>
                      {team.name}
                    </option>
                  ))}
                </select>
              </div>
              {currentRole === "SUPER_ADMIN" && (
                <div>
                  <label className="form-label">Role</label>
                  <select
                    className="form-select"
                    value={filters.role}
                    onChange={(e) =>
                      setFilters((prev) => ({
                        ...prev,
                        role: e.target.value,
                      }))
                    }
                  >
                    <option value="">All</option>
                    {roleOptions.map((value) => (
                      <option key={value} value={value}>
                        {value}
                      </option>
                    ))}
                  </select>
                </div>
              )}
              {currentRole === "ADMIN" && (
                <div>
                  <label className="form-label">Role</label>
                  <select
                    className="form-select"
                    value={filters.role}
                    onChange={(e) =>
                      setFilters((prev) => ({
                        ...prev,
                        role: e.target.value,
                      }))
                    }
                  >
                    <option value="">All</option>
                    {roleOptions
                      .filter((value) => value !== "SUPER_ADMIN")
                      .map((value) => (
                        <option key={value} value={value}>
                          {value}
                        </option>
                      ))}
                  </select>
                </div>
              )}
            </div>
            <button
              className="btn btn-outline-secondary"
              onClick={() =>
                setFilters({
                  search: "",
                  role: "",
                  status: "",
                  institution: "",
                  category: "",
                  type: "",
                  department: "",
                  team: "",
                })
              }
            >
              Clear Filters
            </button>
          </div>

          <div className="contact-grids-tab">
            <ul className="nav nav-underline" role="tablist">
              <li className="nav-item" role="presentation">
                <button
                  className={`nav-link ${activeTab === "users" ? "active" : ""}`}
                  type="button"
                  role="tab"
                  aria-selected={activeTab === "users"}
                  onClick={() => setActiveTab("users")}
                >
                  User Table
                </button>
              </li>
              <li className="nav-item" role="presentation">
                <button
                  className={`nav-link ${
                    activeTab === "pending" ? "active" : ""
                  }`}
                  type="button"
                  role="tab"
                  aria-selected={activeTab === "pending"}
                  onClick={() => setActiveTab("pending")}
                >
                  Users Awaiting Activation
                </button>
              </li>
              <li className="nav-item" role="presentation">
                <button
                  className={`nav-link ${
                    activeTab === "sessions" ? "active" : ""
                  }`}
                  type="button"
                  role="tab"
                  aria-selected={activeTab === "sessions"}
                  onClick={() => setActiveTab("sessions")}
                >
                  Current Sessions
                </button>
              </li>
              <li className="nav-item" role="presentation">
                <button
                  className={`nav-link ${
                    activeTab === "logs" ? "active" : ""
                  }`}
                  type="button"
                  role="tab"
                  aria-selected={activeTab === "logs"}
                  onClick={() => setActiveTab("logs")}
                >
                  Logs
                </button>
              </li>
            </ul>
          </div>

          <div className="tab-content pt-4">
            {activeTab === "users" && (
              <div className="tab-pane fade show active">
                <div className="d-flex align-items-center justify-content-between mb-3 flex-wrap gap-2">
                  <div>{totalLabel}</div>
                  <div className="d-flex align-items-center gap-2">
                    <label className="me-2">Rows</label>
                    <select
                      className="form-select"
                      style={{ width: 120 }}
                      value={size}
                      onChange={(e) => load(0, Number(e.target.value))}
                    >
                      {[10, 20, 30, 50].map((n) => (
                        <option key={n} value={n}>
                          {n}
                        </option>
                      ))}
                    </select>
                    <button
                      className="btn btn-outline-secondary"
                      disabled={page <= 0 || loading}
                      onClick={() => load(page - 1, size)}
                    >
                      Prev
                    </button>
                    <button
                      className="btn btn-outline-secondary"
                      disabled={page + 1 >= totalPages || loading}
                      onClick={() => load(page + 1, size)}
                    >
                      Next
                    </button>
                  </div>
                </div>
                <div className="custom-datatable-filter table-responsive">
                  <table className="table datatable">
                    <thead className="thead-light">
                      <tr>
                        <th>#</th>
                        <th>Username</th>
                        <th>Status</th>
                        <th>E-mail</th>
                        <th>Department</th>
                        <th>Team</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {loading ? (
                        <tr>
                          <td colSpan={7}>Loading...</td>
                        </tr>
                      ) : filteredRows.length === 0 ? (
                        <tr>
                          <td colSpan={7}>No users found</td>
                        </tr>
                      ) : (
                        filteredRows.map((row, idx) => (
                          <tr key={row.id}>
                            <td>{idx + 1 + page * size}</td>
                            <td>{row.username || "-"}</td>
                            <td>
                              <span
                                className={`badge ${
                                  row.active ? "badge-success" : "badge-danger"
                                }`}
                              >
                                {row.role || row.status || "User"}
                              </span>
                            </td>
                            <td>{row.email || "-"}</td>
                            <td>{row.departmentName || "-"}</td>
                            <td>{row.team || "-"}</td>
                            <td className="d-flex gap-2">
                              <button
                                className="btn btn-sm btn-outline-primary"
                                onClick={() => openEdit(row)}
                              >
                                Edit
                              </button>
                              <button
                                className="btn btn-sm btn-outline-secondary"
                                onClick={() => {
                                  loadUserDetails(row);
                                  setActiveTab("sessions");
                                }}
                              >
                                Sessions
                              </button>
                              <button
                                className="btn btn-sm btn-outline-warning"
                                onClick={() => handleToggleActive(row)}
                                disabled={saving}
                              >
                                {row.active ? "Deactivate" : "Activate"}
                              </button>
                              <button
                                className="btn btn-sm btn-danger"
                                onClick={() => handleDelete(row)}
                                disabled={saving}
                              >
                                Delete
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === "pending" && (
              <div className="tab-pane fade show active">
                <div className="d-flex align-items-center justify-content-between mb-3 flex-wrap gap-2">
                  <div>{pendingLabel}</div>
                  <div className="d-flex align-items-center gap-2">
                    <label className="me-2">Rows</label>
                    <select
                      className="form-select"
                      style={{ width: 120 }}
                      value={pendingSize}
                      onChange={(e) => loadPending(0, Number(e.target.value))}
                    >
                      {[10, 20, 30, 50].map((n) => (
                        <option key={n} value={n}>
                          {n}
                        </option>
                      ))}
                    </select>
                    <button
                      className="btn btn-outline-secondary"
                      disabled={pendingPage <= 0 || pendingLoading}
                      onClick={() => loadPending(pendingPage - 1, pendingSize)}
                    >
                      Prev
                    </button>
                    <button
                      className="btn btn-outline-secondary"
                      disabled={
                        pendingPage + 1 >= pendingTotalPages || pendingLoading
                      }
                      onClick={() => loadPending(pendingPage + 1, pendingSize)}
                    >
                      Next
                    </button>
                  </div>
                </div>
                <div className="custom-datatable-filter table-responsive">
                  <table className="table datatable">
                    <thead className="thead-light">
                      <tr>
                        <th>#</th>
                        <th>Username</th>
                        <th>Status</th>
                        <th>E-mail</th>
                        <th>Registered</th>
                        <th>Role</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pendingLoading ? (
                        <tr>
                          <td colSpan={7}>Loading...</td>
                        </tr>
                      ) : filteredPending.length === 0 ? (
                        <tr>
                          <td colSpan={7}>No pending users</td>
                        </tr>
                      ) : (
                        filteredPending.map((row, idx) => (
                          <tr key={row.id}>
                            <td>{idx + 1 + pendingPage * pendingSize}</td>
                            <td>{row.username || "-"}</td>
                            <td>
                              <span className="badge badge-warning">
                                Pending
                              </span>
                            </td>
                            <td>{row.email || "-"}</td>
                            <td>{row.registeredAt || "-"}</td>
                            <td>
                              <select
                                className="form-select"
                                value={
                                  allowedAssignRoles.includes(row.role)
                                    ? row.role
                                    : allowedAssignRoles[allowedAssignRoles.length - 1] ||
                                      "EMPLOYEE"
                                }
                                onChange={(e) =>
                                  handleRoleChange(row, e.target.value)
                                }
                                disabled={saving}
                              >
                                {allowedAssignRoles.map((role) => (
                                  <option key={role} value={role}>
                                    {role}
                                  </option>
                                ))}
                              </select>
                            </td>
                            <td className="d-flex gap-2">
                              <button
                                className="btn btn-sm btn-outline-primary"
                                onClick={() => openEdit(row)}
                              >
                                Edit
                              </button>
                              <button
                                className="btn btn-sm btn-success"
                                onClick={() => handleToggleActive(row)}
                                disabled={saving}
                              >
                                Activate
                              </button>
                              <button
                                className="btn btn-sm btn-danger"
                                onClick={() => handleDelete(row)}
                                disabled={saving}
                              >
                                Delete
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === "sessions" && (
              <div className="tab-pane fade show active">
                {!selectedUser ? (
                  <div className="text-muted">
                    Select a user from the User Table to view sessions.
                  </div>
                ) : (
                  <div className="row g-3">
                    <div className="col-lg-12">
                      <div className="d-flex align-items-center justify-content-between mb-2">
                        <h5 className="mb-0">
                          Active Sessions:{" "}
                          {selectedUser.username || selectedUser.email}
                        </h5>
                        <button
                          className="btn btn-outline-secondary"
                          onClick={() => setSelectedUser(null)}
                        >
                          Clear
                        </button>
                      </div>
                      <div className="table-responsive">
                        <table className="table table-sm table-striped">
                          <thead className="table-light">
                            <tr>
                              <th></th>
                              <th>IP</th>
                              <th>Persistent</th>
                              <th>Last Update</th>
                              <th>Expires</th>
                            </tr>
                          </thead>
                          <tbody>
                            {sessions.length === 0 ? (
                              <tr>
                                <td colSpan={5}>No sessions found</td>
                              </tr>
                            ) : (
                              sessions.map((session) => (
                                <tr key={session.id}>
                                  <td>
                                    <input
                                      type="checkbox"
                                      checked={sessionSelection.has(session.id)}
                                      onChange={() =>
                                        toggleSessionSelection(session.id)
                                      }
                                    />
                                  </td>
                                  <td>{session.ipAddress || "-"}</td>
                                  <td>{session.persistent ? "Yes" : "No"}</td>
                                  <td>{session.lastUpdateAt || "-"}</td>
                                  <td>{session.expiresAt || "-"}</td>
                                </tr>
                              ))
                            )}
                          </tbody>
                        </table>
                      </div>
                      <button
                        className="btn btn-sm btn-danger"
                        onClick={handleDeleteSessions}
                        disabled={sessionSelection.size === 0 || saving}
                      >
                        Delete Selected Sessions
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === "logs" && (
              <div className="tab-pane fade show active">
                {!selectedUser ? (
                  <div className="text-muted">
                    Select a user from the User Table to view logs.
                  </div>
                ) : (
                  <div className="table-responsive">
                    <table className="table table-sm table-striped">
                      <thead className="table-light">
                        <tr>
                          <th>Event</th>
                          <th>IP</th>
                          <th>Time</th>
                        </tr>
                      </thead>
                      <tbody>
                        {userLogs.length === 0 ? (
                          <tr>
                            <td colSpan={3}>No logs found</td>
                          </tr>
                        ) : (
                          userLogs.map((log) => (
                            <tr key={log.id}>
                              <td>{log.event || "-"}</td>
                              <td>{log.ipAddress || "-"}</td>
                              <td>{log.eventAt || "-"}</td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {showModal && (
        <>
          <div
            className="modal fade show"
            style={{ display: "block" }}
            tabIndex="-1"
          >
            <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  Create User
                </h5>
                  <button
                    className="btn-close"
                    onClick={() => setShowModal(false)}
                  />
                </div>
                <div className="modal-body">
                  <div className="row g-3">
                    <div className="col-md-6">
                      <label className="form-label">Username *</label>
                      <input
                        className="form-control"
                        value={form.username}
                        onChange={(e) =>
                          setForm((f) => ({ ...f, username: e.target.value }))
                        }
                      />
                    </div>
                    {currentRole === "SUPER_ADMIN" && (
                      <div className="col-md-6">
                        <label className="form-label">Role *</label>
                        <select
                          className="form-select"
                          value={form.role}
                          onChange={(e) =>
                            setForm((f) => ({ ...f, role: e.target.value }))
                          }
                        >
                          {allowedAssignRoles.map((role) => (
                            <option key={role} value={role}>
                              {role.replace(/_/g, " ")}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}
                    <div className="col-md-6">
                      <label className="form-label">Select Employee</label>
                      <select
                        className="form-select"
                        value={selectedEmployeeId}
                        onChange={(e) => handleSelectEmployee(e.target.value)}
                      >
                        <option value="">-- Select Employee --</option>
                        {availableEmployees.map((emp) => (
                          <option key={emp.id} value={emp.id}>
                            {emp.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="col-12">
                      <hr className="my-2" />
                      <h6 className="mb-2">Organization Details</h6>
                    </div>
                    <div className="col-md-6">
                      <div className="d-flex align-items-center justify-content-between">
                        <label className="form-label mb-1">Institution *</label>
                        <button
                          type="button"
                          className="btn btn-sm btn-primary px-2 py-0"
                          onClick={handleAddInstitution}
                          disabled={saving || currentRole !== "SUPER_ADMIN"}
                          title="Add Institution"
                        >
                          +
                        </button>
                      </div>
                      <select
                        className="form-select"
                        value={institutionId}
                        onChange={(e) => {
                          setInstitutionId(e.target.value);
                          setCategoryId("");
                          setTypeId("");
                          setDepartmentId("");
                          setTeamId("");
                          setCategories([]);
                          setTypes([]);
                          setDepartments([]);
                          setTeams([]);
                        }}
                        disabled={orgLoading || isAdmin || isManager}
                      >
                        <option value="">Select</option>
                        {institutions.map((item) => (
                          <option key={item.id} value={item.id}>
                            {item.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="col-md-6">
                      <div className="d-flex align-items-center justify-content-between">
                        <label className="form-label mb-1">Category *</label>
                        <button
                          type="button"
                          className="btn btn-sm btn-primary px-2 py-0"
                          onClick={handleAddCategory}
                          disabled={saving || !institutionId || isManager}
                          title="Add Category"
                        >
                          +
                        </button>
                      </div>
                      <select
                        className="form-select"
                        value={categoryId}
                        onChange={(e) => {
                          setCategoryId(e.target.value);
                          setTypeId("");
                          setDepartmentId("");
                          setTeamId("");
                          setTypes([]);
                          setDepartments([]);
                          setTeams([]);
                        }}
                        disabled={orgLoading || !institutionId || isManager || isAdmin}
                      >
                        <option value="">Select</option>
                        {categories.map((item) => (
                          <option key={item.id} value={item.id}>
                            {item.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="col-md-6">
                      <div className="d-flex align-items-center justify-content-between">
                        <label className="form-label mb-1">Type *</label>
                        <button
                          type="button"
                          className="btn btn-sm btn-primary px-2 py-0"
                          onClick={handleAddType}
                          disabled={saving || !institutionId || !categoryId || isManager}
                          title="Add Type"
                        >
                          +
                        </button>
                      </div>
                      <select
                        className="form-select"
                        value={typeId}
                        onChange={(e) => {
                          setTypeId(e.target.value);
                          setDepartmentId("");
                          setTeamId("");
                          setDepartments([]);
                          setTeams([]);
                        }}
                        disabled={orgLoading || !categoryId || isManager || isAdmin}
                      >
                        <option value="">Select</option>
                        {types.map((item) => (
                          <option key={item.id} value={item.id}>
                            {item.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="col-md-6">
                      <div className="d-flex align-items-center justify-content-between">
                        <label className="form-label mb-1">Department *</label>
                        <button
                          type="button"
                          className="btn btn-sm btn-primary px-2 py-0"
                          onClick={handleAddDepartment}
                          disabled={
                            saving ||
                            !institutionId ||
                            !categoryId ||
                            !typeId ||
                            isManager
                          }
                          title="Add Department"
                        >
                          +
                        </button>
                      </div>
                      <select
                        className="form-select"
                        value={departmentId}
                        onChange={(e) => {
                          setDepartmentId(e.target.value);
                          setTeamId("");
                          setTeams([]);
                        }}
                        disabled={orgLoading || !typeId || isManager || isAdmin}
                      >
                        <option value="">Select</option>
                        {departments.map((item) => (
                          <option key={item.id} value={item.id}>
                            {item.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="col-md-6">
                      <div className="d-flex align-items-center justify-content-between">
                        <label className="form-label mb-1">
                          {roleRequiresTeam ? "Team *" : "Team (Optional)"}
                        </label>
                        <button
                          type="button"
                          className="btn btn-sm btn-primary px-2 py-0"
                          onClick={handleAddTeam}
                          disabled={
                            saving ||
                            !institutionId ||
                            !categoryId ||
                            !typeId ||
                            !departmentId
                          }
                          title="Add Team"
                        >
                          +
                        </button>
                      </div>
                      <select
                        className="form-select"
                        value={teamId}
                        onChange={(e) => setTeamId(e.target.value)}
                        disabled={orgLoading || !departmentId || (currentRole === "MANAGER")}
                      >
                        <option value="">Select</option>
                        {teams.map((item) => (
                          <option key={item.id} value={item.id}>
                            {item.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Email *</label>
                      <input
                        type="email"
                        className="form-control"
                        value={form.email}
                        onChange={(e) =>
                          setForm((f) => ({ ...f, email: e.target.value }))
                        }
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">First Name</label>
                      <input
                        className="form-control"
                        value={form.firstName}
                        onChange={(e) =>
                          setForm((f) => ({ ...f, firstName: e.target.value }))
                        }
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Last Name</label>
                      <input
                        className="form-control"
                        value={form.lastName}
                        onChange={(e) =>
                          setForm((f) => ({ ...f, lastName: e.target.value }))
                        }
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Phone</label>
                      <input
                        type="tel"
                        className="form-control"
                        value={form.phone || ""}
                        onChange={(e) =>
                          setForm((f) => ({ ...f, phone: e.target.value }))
                        }
                        placeholder="Phone number"
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Password *</label>
                      <div className="position-relative">
                        <input
                          type={showCreatePassword ? "text" : "password"}
                          className="form-control"
                          value={form.password}
                          onChange={(e) =>
                            setForm((f) => ({ ...f, password: e.target.value }))
                          }
                        />
                        <button
                          type="button"
                          className="btn btn-link p-0 text-muted"
                          style={{ position: "absolute", right: 12, top: 8 }}
                          onClick={() =>
                            setShowCreatePassword((prev) => !prev)
                          }
                          aria-label={
                            showCreatePassword ? "Hide password" : "Show password"
                          }
                        >
                          <i
                            className={`ti ${
                              showCreatePassword ? "ti-eye-off" : "ti-eye"
                            }`}
                          />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="modal-footer">
                  <button
                    className="btn btn-light"
                    onClick={() => setShowModal(false)}
                    disabled={saving}
                  >
                    Cancel
                  </button>
                  <button
                    className="btn btn-primary"
                    onClick={handleSave}
                    disabled={saving}
                  >
                    {saving ? "Saving..." : "Create"}
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div className="modal-backdrop fade show" />
        </>
      )}

      {showOrgModal && (
        <>
          <div className="modal fade show" style={{ display: "block" }} tabIndex="-1">
            <div className="modal-dialog modal-sm">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">
                    Add {orgModalLevel ? orgModalLevel.charAt(0).toUpperCase() + orgModalLevel.slice(1) : "Item"}
                  </h5>
                  <button
                    className="btn-close"
                    onClick={() => {
                      setShowOrgModal(false);
                      setOrgModalName("");
                      setOrgModalLevel("");
                    }}
                  />
                </div>
                <div className="modal-body">
                  <label className="form-label">Name</label>
                  <input
                    className="form-control"
                    value={orgModalName}
                    onChange={(e) => setOrgModalName(e.target.value)}
                    placeholder={`Enter ${orgModalLevel || "item"} name`}
                  />
                </div>
                <div className="modal-footer">
                  <button
                    className="btn btn-light"
                    onClick={() => {
                      setShowOrgModal(false);
                      setOrgModalName("");
                      setOrgModalLevel("");
                    }}
                    disabled={saving}
                  >
                    Cancel
                  </button>
                  <button
                    className="btn btn-primary"
                    onClick={handleCreateOrgNode}
                    disabled={saving}
                  >
                    {saving ? "Creating..." : "Create"}
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div className="modal-backdrop fade show" />
        </>
      )}

      <ConfirmDialog
        open={showDeleteConfirm}
        title="Delete User"
        message={`Are you sure you want to delete the user "${userToDelete?.username || userToDelete?.email}"? This action cannot be undone.`}
        onConfirm={handleConfirmDelete}
        onCancel={() => {
          setShowDeleteConfirm(false);
          setUserToDelete(null);
        }}
        confirmLabel="Delete"
        cancelLabel="Cancel"
      />
    </div>
  );
}

export default UseradminPage;
