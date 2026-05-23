import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  changeUserRole,
  deleteSelectedSessions,
  deleteUser,
  getPendingUsers,
  getUserLogs,
  getUserSessions,
  getUsers,
  setUserActive,
} from "../../api/userAdminApi";
// NEW: Import the independent User Permissions Hierarchy API hooks
import { getUserDepartments, getUserDesignations } from "../../api/userPermissionsApi";
import { getInstitutions, getUserOrgSelection } from "../../api/orgHierarchyApi";
import { extractApiErrorMessage } from "../../utils/errorMessage";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../components/system/ToastProvider";
import ConfirmDialog from "../../components/system/ConfirmDialog";

const FALLBACK_ROLES = ["SUPER_ADMIN", "ADMIN", "MANAGER", "TEAM_LEAD", "EMPLOYEE"];
const ENV_ROLE_OPTIONS = String(import.meta.env.VITE_ROLE_OPTIONS || "").trim();
const ROLE_OPTIONS = ENV_ROLE_OPTIONS
  ? ENV_ROLE_OPTIONS.split(",").map((r) => r.trim()).filter(Boolean)
  : FALLBACK_ROLES;

const ROLE_ASSIGNMENT_OPTIONS = {
  SUPER_ADMIN: ["ADMIN", "MANAGER", "TEAM_LEAD", "EMPLOYEE"],
  ADMIN: ["MANAGER", "TEAM_LEAD", "EMPLOYEE"],
  MANAGER: ["TEAM_LEAD", "EMPLOYEE"],
  TEAM_LEAD: ["EMPLOYEE"],
};

const INITIAL_FILTERS = {
  search: "",
  role: "",
  status: "",
  institution: "",      // Branch text filter
  department: "",       // User Department text filter
  team: "",             // User Designation text filter
};

const normalizeText = (value) => String(value || "").trim().toLowerCase();
const sameText = (left, right) => normalizeText(left) === normalizeText(right);

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

  // Filter Panel States
  const [filters, setFilters] = useState(INITIAL_FILTERS);
  const [isFilterOpen, setIsFilterOpen] = useState(false); // Controls Sidebar Toggle
  const [orgLoading, setOrgLoading] = useState(false);
  
  // Scoping matching IDs for cascading calls
  const [institutionId, setInstitutionId] = useState("");
  const [userDepartmentId, setUserDepartmentId] = useState("");

  const [institutions, setInstitutions] = useState([]);
  const [userDepartments, setUserDepartments] = useState([]);
  const [userDesignations, setUserDesignations] = useState([]);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);

  // Load Primary Users List
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

  // Load Pending Approvals List
  const loadPending = async (nextPage = pendingPage, nextSize = pendingSize) => {
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

  // Load Physical Branches (Institutions Pool)
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
            (item) => String(item.name || "").toLowerCase() === String(currentInstitutionName).toLowerCase()
          );
          if (match) {
            setInstitutionId(String(match.id));
          }
        }
      } catch (e) {
        if (isMounted) showError(extractApiErrorMessage(e, "Failed to load branches"));
      } finally {
        if (isMounted) setOrgLoading(false);
      }
    };
    loadInstitutions();
    return () => {
      isMounted = false;
    };
  }, [currentUser?.institution]);

  // Load User Configuration Data Scopes on Mount
  useEffect(() => {
    let isMounted = true;
    const loadUserSelection = async () => {
      if (!currentUser?.id) return;
      try {
        const selection = await getUserOrgSelection(currentUser.id);
        if (!isMounted || !selection) return;
        if (selection.institutionId) setInstitutionId(String(selection.institutionId));
      } catch (e) {
        if (isMounted) showError(extractApiErrorMessage(e, "Failed to load org selections"));
      }
    };
    loadUserSelection();
    return () => {
      isMounted = false;
    };
  }, [currentUser?.id]);

  // NEW: Cascading Trigger 1 - Fetch independent User Departments when Branch changes
  useEffect(() => {
    let isMounted = true;
    const loadUserDepartments = async () => {
      if (!institutionId) {
        setUserDepartments([]);
        return;
      }
      setOrgLoading(true);
      try {
        const data = await getUserDepartments(institutionId);
        if (!isMounted) return;
        setUserDepartments(Array.isArray(data) ? data : []);

        const currentDeptName = currentUser?.departmentName || "";
        if (currentDeptName && currentRole !== "SUPER_ADMIN") {
          const match = data.find((item) => sameText(item.name, currentDeptName));
          if (match) setUserDepartmentId(String(match.id));
        }
      } catch (e) {
        if (isMounted) showError(extractApiErrorMessage(e, "Failed to load user departments"));
      } finally {
        if (isMounted) setOrgLoading(false);
      }
    };
    loadUserDepartments();
    return () => {
      isMounted = false;
    };
  }, [institutionId, currentUser?.departmentName, currentRole]);

  // NEW: Cascading Trigger 2 - Fetch independent User Designations when User Department changes
  useEffect(() => {
    let isMounted = true;
    const loadUserDesignations = async () => {
      if (!institutionId || !userDepartmentId) {
        setUserDesignations([]);
        return;
      }
      setOrgLoading(true);
      try {
        const data = await getUserDesignations(userDepartmentId);
        if (!isMounted) return;
        setUserDesignations(Array.isArray(data) ? data : []);
      } catch (e) {
        if (isMounted) showError(extractApiErrorMessage(e, "Failed to load user designations"));
      } finally {
        if (isMounted) setOrgLoading(false);
      }
    };
    loadUserDesignations();
    return () => {
      isMounted = false;
    };
  }, [institutionId, userDepartmentId]);

  const canAccessPage = useMemo(() => {
    return currentRole && currentRole !== "EMPLOYEE";
  }, [currentRole]);

  const isSameBranch = (row) => !currentUser?.institution || sameText(row?.institution, currentUser?.institution);
  const isSameDepartment = (row) => !currentUser?.departmentName || sameText(row?.departmentName, currentUser?.departmentName);
  const isSameTeam = (row) => !currentUser?.team || sameText(row?.team, currentUser?.team);

  const canSeeUser = (row) => {
    const role = String(currentUser?.role || "").toUpperCase();
    if (role === "SUPER_ADMIN") return true;
    if (role === "ADMIN") return isSameBranch(row);
    if (role === "MANAGER") {
      return isSameDepartment(row) && ["TEAM_LEAD", "EMPLOYEE"].includes(String(row?.role || "").toUpperCase());
    }
    if (role === "TEAM_LEAD") {
      return isSameTeam(row) && String(row?.role || "").toUpperCase() === "EMPLOYEE";
    }
    return false;
  };

  const visibleRows = useMemo(() => rows.filter(canSeeUser), [rows, currentUser]);
  const visiblePendingRows = useMemo(() => pendingRows.filter(canSeeUser), [pendingRows, currentUser]);

  const ordered = useMemo(() => [...visibleRows].sort((a, b) => (b.id || 0) - (a.id || 0)), [visibleRows]);
  const orderedPending = useMemo(() => [...visiblePendingRows].sort((a, b) => (b.id || 0) - (a.id || 0)), [visiblePendingRows]);

  const roleOptions = useMemo(() => [...FALLBACK_ROLES], []);

  const applyFilters = (targetRows) => {
    const searchTerm = filters.search.trim().toLowerCase();
    return targetRows.filter((row) => {
      if (searchTerm) {
        const haystack = [row.username, row.email, row.firstName, row.lastName].filter(Boolean).join(" ").toLowerCase();
        if (!haystack.includes(searchTerm)) return false;
      }

      if (filters.status) {
        if (Boolean(row.active) !== (filters.status === "ACTIVE")) return false;
      }

      if (currentRole === "SUPER_ADMIN" || currentRole === "ADMIN") {
        if (filters.institution && !sameText(row.institution, filters.institution)) return false;
        if (filters.role && row.role !== filters.role) return false;
        if (filters.department && !sameText(row.departmentName, filters.department)) return false;
        if (filters.team && !sameText(row.team, filters.team)) return false;
      } else if (currentRole === "MANAGER") {
        if (filters.team && !sameText(row.team, filters.team)) return false;
      }

      return true;
    });
  };

  const filteredRows = useMemo(() => applyFilters(ordered), [ordered, filters, currentRole]);
  const filteredPending = useMemo(() => applyFilters(orderedPending), [orderedPending, filters, currentRole]);

  const allowedAssignRoles = useMemo(() => {
    const configured = new Set(ROLE_OPTIONS.map((role) => String(role || "").trim().toUpperCase()));
    return (ROLE_ASSIGNMENT_OPTIONS[currentRole] || []).filter((role) => configured.has(role));
  }, [currentRole]);

  const openCreate = () => navigate("/useradmin/create");
  const openEdit = (row) => row?.id && navigate(`/user-edit/${row.id}`, { state: { user: row } });

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
      if (next.has(id)) next.delete(id);
      else next.add(id);
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
  const pendingLabel = pendingTotalPages ? `Page ${pendingPage + 1} of ${pendingTotalPages}` : "Page 1";

  // Compute active badge counter for filters button indicator
  const activeFilterCount = useMemo(() => {
    return Object.keys(filters).filter(k => k !== "search" && filters[k] !== "").length;
  }, [filters]);

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
    <div className="content user-admin-page">
      <style>{`
        .user-admin-page .btn-primary {
          background-color: #45597a;
          border-color: #45597a;
          border-radius: 2rem;
          padding: 0.6rem 1.5rem;
          font-weight: 500;
          transition: all 0.3s ease;
        }
        .user-admin-page .btn-primary:hover {
          background-color: #354560;
          border-color: #354560;
        }
        .user-admin-page .form-control,
        .user-admin-page .form-select {
          border-radius: 1.5rem;
          border: 1px solid #d0d5dd;
          padding: 0.6rem 1rem;
          font-size: 0.95rem;
        }
        .user-admin-page .form-control:focus,
        .user-admin-page .form-select:focus {
          border-color: #45597a;
          box-shadow: 0 0 0 0.2rem rgba(69, 89, 122, 0.15);
        }
        .user-admin-page .form-label {
          color: #34393f;
          font-weight: 600;
          font-size: 0.88rem;
          margin-bottom: 0.4rem;
        }
        .user-admin-page .nav-underline .nav-link {
          color: #34393f;
          border-bottom: 2px solid transparent;
          font-weight: 500;
          padding: 0.8rem 1.2rem;
        }
        .user-admin-page .nav-underline .nav-link.active {
          color: #45597a;
          border-bottom-color: #45597a;
        }
        .user-admin-page .table tbody td {
          padding: 1rem;
          border-color: #e9ecef;
          vertical-align: middle;
        }
        .user-admin-page .badge {
          border-radius: 1.5rem;
          padding: 0.4rem 0.8rem;
          font-weight: 500;
        }
        
        /* PREMIUM SLIDE SIDEBAR FILTER PANEL */
        .user-admin-page .filter-sidebar {
          position: fixed;
          top: 0;
          right: -350px;
          width: 350px;
          height: 100vh;
          background: #ffffff;
          box-shadow: -10px 0 30px rgba(0, 0, 0, 0.1);
          z-index: 1040;
          transition: right 0.3s cubic-bezier(0.16, 1, 0.3, 1);
          display: flex;
          flex-direction: column;
        }
        .user-admin-page .filter-sidebar.is-open {
          right: 0;
        }
        .user-admin-page .filter-sidebar-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          background: rgba(0, 0, 0, 0.3);
          backdrop-filter: blur(2px);
          z-index: 1030;
          opacity: 0;
          pointer-events: none;
          transition: opacity 0.25s linear;
        }
        .user-admin-page .filter-sidebar-overlay.is-visible {
          opacity: 1;
          pointer-events: auto;
        }
        .user-admin-page .filter-sidebar-header {
          padding: 1.25rem;
          border-bottom: 1px solid #eef2f6;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .user-admin-page .filter-sidebar-body {
          padding: 1.25rem;
          overflow-y: auto;
          flex: 1;
        }
        .user-admin-page .filter-sidebar-footer {
          padding: 1.25rem;
          border-top: 1px solid #eef2f6;
          display: flex;
          gap: 0.75rem;
        }
      `}</style>

      {/* Slide Sidebar Backdrop Overlay */}
      <div 
        className={`filter-sidebar-overlay ${isFilterOpen ? "is-visible" : ""}`} 
        onClick={() => setIsFilterOpen(false)} 
      />

      {/* Slide Filter Sidebar */}
      <div className={`filter-sidebar ${isFilterOpen ? "is-open" : ""}`}>
        <div className="filter-sidebar-header">
          <h5 className="mb-0 d-flex align-items-center gap-2">
            <i className="ti ti-filter" style={{ fontSize: "1.2rem" }} /> Filter Criteria
          </h5>
          <button type="button" className="btn-close" onClick={() => setIsFilterOpen(false)} aria-label="Close" />
        </div>
        
        <div className="filter-sidebar-body d-flex flex-column gap-3">
          <div>
            <label className="form-label">Status</label>
            <select
              className="form-select"
              value={filters.status}
              onChange={(e) => setFilters((prev) => ({ ...prev, status: e.target.value }))}
            >
              <option value="">All Statuses</option>
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
            </select>
          </div>

          {currentRole === "SUPER_ADMIN" && (
            <div>
              <label className="form-label">Target Branch</label>
              <select
                className="form-select"
                value={filters.institution}
                onChange={(e) => {
                  const val = e.target.value;
                  setFilters((prev) => ({ ...prev, institution: val, department: "", team: "" }));
                  if (val) {
                    const inst = institutions.find((i) => sameText(i.name, val));
                    if (inst) setInstitutionId(String(inst.id));
                  } else {
                    setInstitutionId("");
                  }
                  setUserDepartmentId("");
                }}
              >
                <option value="">Select Branch</option>
                {institutions.map((inst) => (
                  <option key={inst.id} value={inst.name}>{inst.name}</option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="form-label">User Department</label>
            <select
              className="form-select"
              value={filters.department}
              onChange={(e) => {
                const val = e.target.value;
                setFilters((prev) => ({ ...prev, department: val, team: "" }));
                if (val) {
                  const dept = userDepartments.find((d) => sameText(d.name, val));
                  if (dept) setUserDepartmentId(String(dept.id));
                } else {
                  setUserDepartmentId("");
                }
              }}
              disabled={currentRole === "MANAGER" || (currentRole === "SUPER_ADMIN" ? !filters.institution : !institutionId)}
            >
              <option value="">Select User Department</option>
              {userDepartments.map((dept) => (
                <option key={dept.id} value={dept.name}>{dept.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="form-label">User Designation</label>
            <select
              className="form-select"
              value={filters.team}
              onChange={(e) => setFilters((prev) => ({ ...prev, team: e.target.value }))}
              disabled={currentRole === "SUPER_ADMIN" ? !filters.department : !userDepartmentId}
            >
              <option value="">Select User Designation</option>
              {userDesignations.map((desig) => (
                <option key={desig.id} value={desig.name}>{desig.name}</option>
              ))}
            </select>
          </div>

          {["SUPER_ADMIN", "ADMIN"].includes(currentRole) && (
            <div>
              <label className="form-label">System Role Access</label>
              <select
                className="form-select"
                value={filters.role}
                onChange={(e) => setFilters((prev) => ({ ...prev, role: e.target.value }))}
              >
                <option value="">All Roles</option>
                {roleOptions
                  .filter((val) => (currentRole === "ADMIN" ? val !== "SUPER_ADMIN" : true))
                  .map((value) => (
                    <option key={value} value={value}>{value.replace(/_/g, " ")}</option>
                  ))}
              </select>
            </div>
          )}
        </div>

        <div className="filter-sidebar-footer">
          <button 
            type="button" 
            className="btn btn-primary w-100" 
            onClick={() => setIsFilterOpen(false)}
          >
            Apply Filters
          </button>
          <button
            type="button"
            className="btn btn-outline-secondary w-100"
            onClick={() => {
              setFilters({ ...INITIAL_FILTERS, search: filters.search });
              if (currentRole === "SUPER_ADMIN") setInstitutionId("");
              setUserDepartmentId("");
            }}
          >
            Reset
          </button>
        </div>
      </div>

      {/* Main Panel Content Window */}
      <div>
        <div className="d-flex align-items-center justify-content-between flex-wrap gap-2 mb-4">
          <div>
            <h4 className="mb-1">User Admin</h4>
            <p className="mb-0 text-muted">Manage your users permissions boundary tables and credentials access scopes.</p>
          </div>
          <button className="btn btn-primary" onClick={openCreate}>
            + Add User
          </button>
        </div>

        {/* Dynamic Navigation and Searching Section */}
        <div className="card mb-4">
          <div className="card-body p-3 d-flex align-items-center justify-content-between flex-wrap gap-3">
            <div className="position-relative" style={{ minWidth: "300px", maxWidth: "450px", flex: "1" }}>
              <input
                className="form-control"
                value={filters.search}
                onChange={(e) => setFilters((prev) => ({ ...prev, search: e.target.value }))}
                placeholder="Search by username or email profile..."
                style={{ paddingLeft: "1.25rem" }}
              />
            </div>
            
            <div className="d-flex align-items-center gap-2">
              <button 
                type="button" 
                className={`btn d-flex align-items-center gap-2 ${activeFilterCount > 0 ? "btn-light" : "btn-outline-secondary"}`}
                style={{ borderRadius: "2rem", padding: "0.6rem 1.25rem" }}
                onClick={() => setIsFilterOpen(true)}
              >
                <i className="ti ti-adjustments-horizontal" style={{ fontSize: "1.1rem" }} />
                <span>Filters</span>
                {activeFilterCount > 0 && (
                  <span className="badge bg-dark text-white p-1 px-2" style={{ fontSize: "0.75rem" }}>
                    {activeFilterCount}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Category Tabs Interface */}
        <div className="contact-grids-tab">
          <ul className="nav nav-underline" role="tablist">
            {["users", "pending", "sessions", "logs"].map((tab) => (
              <li className="nav-item" key={tab}>
                <button
                  className={`nav-link text-capitalize ${activeTab === tab ? "active" : ""}`}
                  type="button"
                  onClick={() => setActiveTab(tab)}
                >
                  {tab === "users" ? "User Table" : tab === "pending" ? "Awaiting Activation" : tab}
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* Operational Grid Panes Container */}
        <div className="tab-content pt-4">
          {activeTab === "users" && (
            <div className="tab-pane fade show active">
              <div className="d-flex align-items-center justify-content-between mb-3 flex-wrap gap-2">
                <div>{totalLabel}</div>
                <div className="d-flex align-items-center gap-2">
                  <label className="me-1">Rows</label>
                  <select
                    className="form-select"
                    style={{ width: 100, borderRadius: "1.5rem" }}
                    value={size}
                    onChange={(e) => load(0, Number(e.target.value))}
                  >
                    {[10, 20, 30, 50].map((n) => <option key={n} value={n}>{n}</option>)}
                  </select>
                  <button className="btn btn-outline-secondary btn-sm ms-2" disabled={page <= 0 || loading} onClick={() => load(page - 1, size)}>Prev</button>
                  <button className="btn btn-outline-secondary btn-sm" disabled={page + 1 >= totalPages || loading} onClick={() => load(page + 1, size)}>Next</button>
                </div>
              </div>
              
              <div className="table-responsive card border shadow-none" style={{ borderRadius: "1rem" }}>
                <table className="table mb-0">
                  <thead className="table-light">
                    <tr>
                      <th className="ps-4">#</th>
                      <th>Username</th>
                      <th>System Role</th>
                      <th>E-mail</th>
                      <th>User Department</th>
                      <th>User Designation</th>
                      <th className="pe-4 text-end">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr><td colSpan={7} className="text-center py-4">Loading user metrics...</td></tr>
                    ) : filteredRows.length === 0 ? (
                      <tr><td colSpan={7} className="text-center py-4 text-muted">No users found matching selections</td></tr>
                    ) : (
                      filteredRows.map((row, idx) => (
                        <tr key={row.id}>
                          <td className="ps-4">{idx + 1 + page * size}</td>
                          <td className="fw-semibold">{row.username || "-"}</td>
                          <td>
                            <span className={`badge ${row.active ? "bg-success-subtle text-success" : "bg-danger-subtle text-danger"}`}>
                              {row.role || "User"}
                            </span>
                          </td>
                          <td>{row.email || "-"}</td>
                          {/* UPDATED: Fields render corresponding dynamic permission text payloads */}
                          <td>{row.departmentName || "-"}</td>
                          <td>{row.team || "-"}</td>
                          <td className="pe-4 text-end">
                            <div className="d-inline-flex gap-2">
                              <button className="btn btn-sm btn-outline-primary" onClick={() => openEdit(row)}>Edit</button>
                              <button className="btn btn-sm btn-outline-secondary" onClick={() => { loadUserDetails(row); setActiveTab("sessions"); }}>Sessions</button>
                              <button className="btn btn-sm btn-outline-warning" onClick={() => handleToggleActive(row)} disabled={saving}>{row.active ? "Deactivate" : "Activate"}</button>
                              <button className="btn btn-sm btn-danger" onClick={() => handleDelete(row)} disabled={saving}>Delete</button>
                            </div>
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
                  <label className="me-1">Rows</label>
                  <select
                    className="form-select"
                    style={{ width: 100, borderRadius: "1.5rem" }}
                    value={pendingSize}
                    onChange={(e) => loadPending(0, Number(e.target.value))}
                  >
                    {[10, 20, 30, 50].map((n) => <option key={n} value={n}>{n}</option>)}
                  </select>
                  <button className="btn btn-outline-secondary btn-sm ms-2" disabled={pendingPage <= 0 || pendingLoading} onClick={() => loadPending(pendingPage - 1, pendingSize)}>Prev</button>
                  <button className="btn btn-outline-secondary btn-sm" disabled={pendingPage + 1 >= pendingTotalPages || pendingLoading} onClick={() => loadPending(pendingPage + 1, pendingSize)}>Next</button>
                </div>
              </div>

              <div className="table-responsive card border shadow-none" style={{ borderRadius: "1rem" }}>
                <table className="table mb-0">
                  <thead className="table-light">
                    <tr>
                      <th className="ps-4">#</th>
                      <th>Username</th>
                      <th>Status</th>
                      <th>E-mail</th>
                      <th>Registered</th>
                      <th>Assign Security Role</th>
                      <th className="pe-4 text-end">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pendingLoading ? (
                      <tr><td colSpan={7} className="text-center py-4">Loading pending queue...</td></tr>
                    ) : filteredPending.length === 0 ? (
                      <tr><td colSpan={7} className="text-center py-4 text-muted">No pending user profiles found</td></tr>
                    ) : (
                      filteredPending.map((row, idx) => (
                        <tr key={row.id}>
                          <td className="ps-4">{idx + 1 + pendingPage * pendingSize}</td>
                          <td className="fw-semibold">{row.username || "-"}</td>
                          <td><span className="badge bg-warning-subtle text-warning">Pending</span></td>
                          <td>{row.email || "-"}</td>
                          <td>{row.registeredAt || "-"}</td>
                          <td>
                            <select
                              className="form-select form-select-sm"
                              style={{ maxWidth: "180px" }}
                              value={allowedAssignRoles.includes(row.role) ? row.role : allowedAssignRoles[allowedAssignRoles.length - 1] || "EMPLOYEE"}
                              onChange={(e) => handleRoleChange(row, e.target.value)}
                              disabled={saving}
                            >
                              {allowedAssignRoles.map((role) => (
                                <option key={role} value={role}>{role.replace(/_/g, " ")}</option>
                              ))}
                            </select>
                          </td>
                          <td className="pe-4 text-end">
                            <div className="d-inline-flex gap-2">
                              <button className="btn btn-sm btn-outline-primary" onClick={() => openEdit(row)}>Edit</button>
                              <button className="btn btn-sm btn-success" onClick={() => handleToggleActive(row)} disabled={saving}>Activate</button>
                              <button className="btn btn-sm btn-danger" onClick={() => handleDelete(row)} disabled={saving}>Delete</button>
                            </div>
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
                <div className="text-muted p-2">Select a user target from the Primary User Table above to track sessions.</div>
              ) : (
                <div>
                  <div className="d-flex align-items-center justify-content-between mb-3">
                    <h5 className="mb-0">Active System Connections: <span className="text-primary">{selectedUser.username}</span></h5>
                    <button type="button" className="btn btn-light btn-sm" onClick={() => setSelectedUser(null)}>Clear View</button>
                  </div>
                  <div className="table-responsive card border shadow-none mb-3" style={{ borderRadius: "1rem" }}>
                    <table className="table mb-0 table-striped">
                      <thead className="table-light">
                        <tr>
                          <th className="ps-4" style={{ width: "50px" }}></th>
                          <th>IP Connection</th>
                          <th>Persistent State</th>
                          <th>Last Communication</th>
                          <th className="pe-4">Expiration Stamp</th>
                        </tr>
                      </thead>
                      <tbody>
                        {sessions.length === 0 ? (
                          <tr><td colSpan={5} className="text-center py-3 text-muted">No active network sessions detected</td></tr>
                        ) : (
                          sessions.map((session) => (
                            <tr key={session.id}>
                              <td className="ps-4">
                                <input
                                  type="checkbox"
                                  className="form-check-input"
                                  checked={sessionSelection.has(session.id)}
                                  onChange={() => toggleSessionSelection(session.id)}
                                />
                              </td>
                              <td><code>{session.ipAddress || "-"}</code></td>
                              <td>{session.persistent ? "Yes" : "No"}</td>
                              <td>{session.lastUpdateAt || "-"}</td>
                              <td className="pe-4">{session.expiresAt || "-"}</td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                  <button
                    className="btn btn-sm btn-danger px-3"
                    style={{ borderRadius: "2rem" }}
                    onClick={handleDeleteSessions}
                    disabled={sessionSelection.size === 0 || saving}
                  >
                    Terminate Selected Sessions
                  </button>
                </div>
              )}
            </div>
          )}

          {activeTab === "logs" && (
            <div className="tab-pane fade show active">
              {!selectedUser ? (
                <div className="text-muted p-2">Select a user target from the Primary User Table above to fetch audit logs.</div>
              ) : (
                <div className="table-responsive card border shadow-none" style={{ borderRadius: "1rem" }}>
                  <table className="table mb-0 table-striped">
                    <thead className="table-light">
                      <tr>
                        <th className="ps-4">Logged Security Event</th>
                        <th>Origin IP</th>
                        <th className="pe-4">Timestamp</th>
                      </tr>
                    </thead>
                    <tbody>
                      {userLogs.length === 0 ? (
                        <tr><td colSpan={3} className="text-center py-3 text-muted">No security audit event logs found</td></tr>
                      ) : (
                        userLogs.map((log) => (
                          <tr key={log.id}>
                            <td className="ps-4 fw-medium">{log.event || "-"}</td>
                            <td><code>{log.ipAddress || "-"}</code></td>
                            <td className="pe-4">{log.eventAt || "-"}</td>
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

      <ConfirmDialog
        open={showDeleteConfirm}
        title="Delete User Account"
        message={`Are you completely sure you want to erase the account profile "${userToDelete?.username || userToDelete?.email}"? All active tokens and references will be purged.`}
        onConfirm={handleConfirmDelete}
        onCancel={() => { setShowDeleteConfirm(false); setUserToDelete(null); }}
        confirmLabel="Confirm Delete"
        cancelLabel="Cancel"
      />
    </div>
  );
}

export default UseradminPage;
