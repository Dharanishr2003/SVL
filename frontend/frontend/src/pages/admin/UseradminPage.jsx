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
import {
  getDepartmentsMasterByBranch,
} from "../../api/departmentsApi";
import { getDesignations } from "../../api/designationsApi";
import { extractApiErrorMessage } from "../../utils/errorMessage";
import { useAuth } from "../../context/AuthContext";
import {
  getInstitutions,
  getUserOrgSelection,
} from "../../api/orgHierarchyApi";
import { useToast } from "../../components/system/ToastProvider";
import ConfirmDialog from "../../components/system/ConfirmDialog";

const FALLBACK_ROLES = ["SUPER_ADMIN", "ADMIN", "MANAGER", "TEAM_LEAD", "EMPLOYEE"];
const ENV_ROLE_OPTIONS = String(
  import.meta.env.VITE_ROLE_OPTIONS || "",
).trim();
const ROLE_OPTIONS = ENV_ROLE_OPTIONS
  ? ENV_ROLE_OPTIONS.split(",").map((r) => r.trim()).filter(Boolean)
  : FALLBACK_ROLES;

const ROLE_ASSIGNMENT_OPTIONS = {
  SUPER_ADMIN: ["ADMIN", "MANAGER", "TEAM_LEAD", "EMPLOYEE"],
  ADMIN: ["MANAGER", "TEAM_LEAD", "EMPLOYEE"],
  MANAGER: ["TEAM_LEAD", "EMPLOYEE"],
  TEAM_LEAD: ["EMPLOYEE"],
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

  const [filters, setFilters] = useState({
    search: "",
    role: "",
    status: "",
    institution: "",
    department: "",
    team: "",
  });
  const [orgLoading, setOrgLoading] = useState(false);
  const [institutionId, setInstitutionId] = useState("");
  const [departmentId, setDepartmentId] = useState("");
  const [teamId, setTeamId] = useState("");
  const [institutions, setInstitutions] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [teams, setTeams] = useState([]);
  const [orgSelection, setOrgSelection] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);


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

  const selectedInstitution = institutions.find(
    (item) => String(item.id) === String(institutionId),
  );
  const selectedDepartment = departments.find(
    (item) => String(item.id) === String(departmentId),
  );
  const selectedTeam = teams.find(
    (item) => String(item.id) === String(teamId),
  );


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
    const loadDepartmentRows = async () => {
      if (!institutionId) {
        setDepartments([]);
        return;
      }
      setOrgLoading(true);
      try {
        const data = await getDepartmentsMasterByBranch(institutionId);
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
  }, [institutionId, currentUser?.departmentName, departmentId]);

  useEffect(() => {
    let isMounted = true;
    const loadTeamRows = async () => {
      if (!institutionId || !departmentId) {
        setTeams([]);
        return;
      }
      setOrgLoading(true);
      try {
        const data = await getDesignations(departmentId);
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
  }, [institutionId, departmentId, currentUser?.team, currentRole, teamId]);

  const canAccessPage = useMemo(() => {
    return currentRole && currentRole !== "EMPLOYEE";
  }, [currentRole]);

  const isSameBranch = (row) =>
    !currentUser?.institution || row?.institution === currentUser?.institution;

  const isSameDepartment = (row) =>
    !currentUser?.departmentName ||
    row?.departmentName === currentUser?.departmentName;

  const isSameTeam = (row) =>
    !currentUser?.team || row?.team === currentUser?.team;

  const canSeeUser = (row) => {
    const role = String(currentUser?.role || "").toUpperCase();
    if (role === "SUPER_ADMIN") return true;
    if (role === "ADMIN") return isSameBranch(row);
    if (role === "MANAGER") {
      return (
        isSameDepartment(row) &&
        ["TEAM_LEAD", "EMPLOYEE"].includes(String(row?.role || "").toUpperCase())
      );
    }
    if (role === "TEAM_LEAD") {
      return isSameTeam(row) && String(row?.role || "").toUpperCase() === "EMPLOYEE";
    }
    return false;
  };

  const visibleRows = useMemo(
    () => rows.filter(canSeeUser),
    [rows, currentUser?.role, currentUser?.institution, currentUser?.departmentName, currentUser?.team],
  );

  const visiblePendingRows = useMemo(
    () => pendingRows.filter(canSeeUser),
    [pendingRows, currentUser?.role, currentUser?.institution, currentUser?.departmentName, currentUser?.team],
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
    const configured = new Set(ROLE_OPTIONS.map((role) => String(role || "").trim().toUpperCase()));
    return (ROLE_ASSIGNMENT_OPTIONS[currentRole] || []).filter((role) => configured.has(role));
  }, [currentRole]);

  const openCreate = () => {
    navigate("/useradmin/create");
  };

  const openEdit = (row) => {
    if (!row?.id) return;
    navigate(`/user-edit/${row.id}`, { state: { user: row } });
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
          font-weight: 500;
          font-size: 0.9rem;
        }
        .user-admin-page .btn-light {
          background-color: #f5f5f5;
          border-color: #d0d5dd;
          border-radius: 2rem;
          color: #34393f;
        }
        .user-admin-page .btn-light:hover {
          background-color: #efefef;
        }
        .user-admin-page .btn-outline-secondary {
          border-radius: 2rem;
          border-color: #d0d5dd;
          color: #45597a;
        }
        .user-admin-page .btn-outline-secondary:hover {
          background-color: #f5f5f5;
          border-color: #45597a;
        }
        .user-admin-page .nav-underline .nav-link {
          color: #34393f;
          border-bottom: 2px solid transparent;
          font-weight: 500;
        }
        .user-admin-page .nav-underline .nav-link.active {
          color: #45597a;
          border-bottom-color: #45597a;
        }
        .user-admin-page .table {
          background-color: transparent;
        }
        .user-admin-page .table thead th {
          background-color: transparent;
          color: #34393f;
          font-weight: 600;
          border: none;
          padding: 1rem;
        }
        .user-admin-page .table tbody td {
          padding: 1rem;
          border-color: #e9ecef;
          color: #34393f;
        }
        .user-admin-page .badge {
          border-radius: 1.5rem;
          padding: 0.4rem 0.8rem;
          font-weight: 500;
        }
        .user-admin-page .btn-sm {
          border-radius: 1.5rem;
          padding: 0.4rem 0.8rem;
        }
        .create-user-wizard .form-select {
          border-radius: 1.5rem !important;
          border: 1px solid #d0d5dd !important;
          padding: 0.6rem 1rem !important;
          font-size: 0.95rem !important;
        }
        .create-user-wizard .form-select:focus {
          border-color: #45597a !important;
          box-shadow: 0 0 0 0.2rem rgba(69, 89, 122, 0.15) !important;
        }
      `}</style>
      <div>
        <div className="d-flex align-items-center justify-content-between flex-wrap gap-2 mb-4">
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
        <div>
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
                    <label className="form-label">Branch</label>
                    <select
                      className="form-select"
                      value={filters.institution}
                      onChange={(e) => {
                        const val = e.target.value;
                        setFilters((prev) => ({ ...prev, institution: val, department: "", team: "" }));
                        if (val) {
                          const inst = institutions.find((i) => i.name === val);
                          if (inst) setInstitutionId(String(inst.id));
                        } else {
                          setInstitutionId("");
                        }
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
                  disabled={
                    currentRole === "MANAGER" ||
                    (currentRole === "SUPER_ADMIN"
                      ? !filters.institution
                      : !institutionId)
                  }
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
