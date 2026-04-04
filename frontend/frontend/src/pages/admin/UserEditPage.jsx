import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import {
  deleteSelectedSessions,
  deleteUser,
  getUserGroups,
  getUserLogs,
  getUserSessions,
  getUsers,
  changeUserRole,
  setUserActive,
  updateUserProfile,
} from "../../api/userAdminApi";
import {
  addGroupMember,
  getUserGroups as getAllGroups,
  removeGroupMember,
} from "../../api/userGroupApi";
import {
  getInstitutions,
  getDepartments,
  getTeams,
} from "../../api/orgHierarchyApi";
import { extractApiErrorMessage } from "../../utils/errorMessage";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../components/system/ToastProvider";

const ROLE_RANK = {
  SUPER_ADMIN: 4,
  ADMIN: 3,
  MANAGER: 2,
  TEAM_LEAD: 1,
  EMPLOYEE: 0,
};

async function findUserById(targetId) {
  let page = 0;
  const size = 50;
  let totalPages = 1;
  while (page < totalPages) {
    const payload = await getUsers(page, size);
    totalPages = Number(payload.totalPages || 0);
    const found = (payload.items || []).find(
      (row) => String(row.id) === String(targetId),
    );
    if (found) return found;
    page += 1;
  }
  return null;
}

export default function UserEditPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user: currentUser } = useAuth();
  const { showSuccess, showError } = useToast();
  const [user, setUser] = useState(location.state?.user || null);
  const [sessions, setSessions] = useState([]);
  const [sessionSelection, setSessionSelection] = useState(new Set());
  const [logs, setLogs] = useState([]);
  const [userGroups, setUserGroups] = useState([]);
  const [availableGroups, setAvailableGroups] = useState([]);
  const [selectedGroupId, setSelectedGroupId] = useState("");
  const [activeTab, setActiveTab] = useState("general");
  const [loading, setLoading] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    newPassword: "",
    confirmPassword: "",
    teamName: "",
    departmentName: "",
    institutionName: "",
  });
  const [orgTeams, setOrgTeams] = useState([]);
  const [orgDepartments, setOrgDepartments] = useState([]);
  const [orgInstitutions, setOrgInstitutions] = useState([]);
  const [orgInstId, setOrgInstId] = useState("");
  const [orgDeptId, setOrgDeptId] = useState("");

  const currentRole = String(currentUser?.role || "").toUpperCase();
  const isAdmin = currentRole === "ADMIN";
  const isManager = currentRole === "MANAGER";
  const isTeamLead = currentRole === "TEAM_LEAD";
  const isSuperAdmin = currentRole === "SUPER_ADMIN";
  const canManageRole = isAdmin || isSuperAdmin;
  const canEditTeam = isAdmin || isSuperAdmin || isManager;
  const canEditDepartment = isSuperAdmin || isAdmin;
  const canEditOrgScope = isSuperAdmin;

  const canSeeUser = (row) => {
    if (!row) return false;
    if (currentRole === "SUPER_ADMIN") return true;
    if (currentRole === "ADMIN") {
      return (
        !currentUser?.institution ||
        row.institution === currentUser?.institution
      );
    }
    if (currentRole === "MANAGER") {
      return (
        (!currentUser?.departmentName ||
          row.departmentName === currentUser?.departmentName) &&
        ["TEAM_LEAD", "EMPLOYEE"].includes(String(row.role || "").toUpperCase())
      );
    }
    if (currentRole === "TEAM_LEAD") {
      return (
        (!currentUser?.team || row.team === currentUser?.team) &&
        String(row.role || "").toUpperCase() === "EMPLOYEE"
      );
    }
    return false;
  };

  const canEdit = useMemo(() => canSeeUser(user), [user, currentRole]);

  const allowedRoleOptions = useMemo(() => {
    const currentRank = ROLE_RANK[currentRole] || 0;
    return Object.keys(ROLE_RANK).filter(
      (role) => ROLE_RANK[role] < currentRank,
    );
  }, [currentRole]);

  useEffect(() => {
    let isMounted = true;
    const loadUser = async () => {
      if (user) {
        setForm({
          firstName: user.firstName || "",
          lastName: user.lastName || "",
          newPassword: "",
          confirmPassword: "",
          teamName: user.team || "",
          departmentName: user.departmentName || "",
          institutionName: user.institution || "",
        });
        return;
      }
      setLoading(true);
      try {
        const found = await findUserById(id);
        if (isMounted) {
          setUser(found);
          setForm({
            firstName: found?.firstName || "",
            lastName: found?.lastName || "",
            newPassword: "",
            confirmPassword: "",
            teamName: found?.team || "",
            departmentName: found?.departmentName || "",
            institutionName: found?.institution || "",
          });
        }
      } catch (e) {
        if (isMounted) {
          showError(extractApiErrorMessage(e, "Failed to load user"));
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    loadUser();
    return () => {
      isMounted = false;
    };
  }, [id]);

  useEffect(() => {
    if (!user?.id) return;
    const loadDetails = async () => {
      try {
        const [sessionRows, logRows, groupRows, allGroupRows] = await Promise.all([
          getUserSessions(user.id),
          getUserLogs(user.id),
          getUserGroups(user.id),
          getAllGroups(),
        ]);
        setSessions(sessionRows || []);
        setLogs(logRows || []);
        setUserGroups(groupRows || []);
        setAvailableGroups(allGroupRows || []);
      } catch (e) {
        showError(extractApiErrorMessage(e, "Failed to load user details"));
      }
    };
    loadDetails();
  }, [user?.id]);

  useEffect(() => {
    if (!isAdmin && !isSuperAdmin && !isManager) return;
    const load = async () => {
      try {
        const insts = await getInstitutions();
        const institutionRows = Array.isArray(insts) ? insts : [];
        if (isSuperAdmin) {
          setOrgInstitutions(institutionRows);
        }
        if ((isAdmin || isManager) && currentUser) {
          const instMatch = institutionRows.find(
            (i) => String(i.name || "").toLowerCase() === String(currentUser.institution || "").toLowerCase()
          );
          const instId = instMatch ? String(instMatch.id) : "";
          if (!instId) return;
          setOrgInstId(instId);
          const depts = await getDepartments(instId);
          const departmentRows = Array.isArray(depts) ? depts : [];
          setOrgDepartments(departmentRows);
          const deptMatch = departmentRows.find(
            (d) => String(d.name || "").toLowerCase() === String(currentUser.departmentName || "").toLowerCase()
          );
          const deptId = deptMatch ? String(deptMatch.id) : "";
          if (!deptId) return;
          setOrgDeptId(deptId);
          const teams = await getTeams(instId, deptId);
          setOrgTeams(Array.isArray(teams) ? teams : []);
        }
      } catch (e) {
        // silently ignore org load errors
      }
    };
    load();
  }, [isAdmin, isSuperAdmin, isManager, currentUser]);

  useEffect(() => {
    if (!isSuperAdmin || !orgInstId) { setOrgDepartments([]); return; }
    getDepartments(orgInstId).then((d) => setOrgDepartments(Array.isArray(d) ? d : [])).catch(() => {});
  }, [isSuperAdmin, orgInstId]);

  useEffect(() => {
    if (!orgInstId || !orgDeptId) { setOrgTeams([]); return; }
    getTeams(orgInstId, orgDeptId).then((d) => setOrgTeams(Array.isArray(d) ? d : [])).catch(() => {});
  }, [orgInstId, orgDeptId]);

  useEffect(() => {
    if (!isSuperAdmin || orgInstId || !form.institutionName || orgInstitutions.length === 0) return;
    const match = orgInstitutions.find(
      (item) => String(item.name || "").toLowerCase() === String(form.institutionName || "").toLowerCase(),
    );
    if (match?.id != null) {
      setOrgInstId(String(match.id));
    }
  }, [isSuperAdmin, orgInstId, form.institutionName, orgInstitutions]);

  useEffect(() => {
    if (!isSuperAdmin || orgDeptId || !form.departmentName || orgDepartments.length === 0) return;
    const match = orgDepartments.find(
      (item) => String(item.name || "").toLowerCase() === String(form.departmentName || "").toLowerCase(),
    );
    if (match?.id != null) {
      setOrgDeptId(String(match.id));
    }
  }, [isSuperAdmin, orgDeptId, form.departmentName, orgDepartments]);

  const handleSave = async () => {
    if (!user?.id) return;
    if (!form.firstName.trim() || !form.lastName.trim()) {
      showError("First name and last name are required");
      return;
    }
    if (form.newPassword || form.confirmPassword) {
      if (form.newPassword !== form.confirmPassword) {
        showError("Passwords do not match");
        return;
      }
    }
    setLoading(true);
    try {
      const updated = await updateUserProfile(user.id, {
        firstName: form.firstName,
        lastName: form.lastName,
        teamName: canEditTeam ? form.teamName : undefined,
        departmentName: canEditDepartment ? form.departmentName : undefined,
        institutionName: canEditOrgScope ? form.institutionName : undefined,
        newPassword: form.newPassword,
        confirmPassword: form.confirmPassword,
      });
      setUser((prev) => ({ ...prev, ...updated }));
      showSuccess("User updated");
      setForm((prev) => ({
        ...prev,
        newPassword: "",
        confirmPassword: "",
      }));
    } catch (e) {
      showError(extractApiErrorMessage(e, "Failed to update user"));
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActive = async () => {
    if (!user?.id) return;
    setLoading(true);
    try {
      await setUserActive(user.id, !user.active);
      setUser((prev) => ({ ...prev, active: !prev.active }));
      showSuccess(user.active ? "User banned" : "User activated");
    } catch (e) {
      showError(extractApiErrorMessage(e, "Failed to update status"));
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (nextRole) => {
    if (!user?.id || !canManageRole) return;
    if (!allowedRoleOptions.includes(nextRole)) {
      showError("You are not allowed to assign this role");
      return;
    }
    setLoading(true);
    try {
      await changeUserRole(user.id, nextRole);
      setUser((prev) => ({ ...prev, role: nextRole }));
      showSuccess("Role updated");
    } catch (e) {
      showError(extractApiErrorMessage(e, "Failed to update role"));
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!user?.id) return;
    setLoading(true);
    try {
      await deleteUser(user.id);
      showSuccess("User deleted");
      navigate("/useradmin", { replace: true });
    } catch (e) {
      showError(extractApiErrorMessage(e, "Failed to delete user"));
    } finally {
      setLoading(false);
    }
  };

  const refreshGroups = async () => {
    if (!user?.id) return;
    const [groupRows, allGroupRows] = await Promise.all([
      getUserGroups(user.id),
      getAllGroups(),
    ]);
    setUserGroups(groupRows || []);
    setAvailableGroups(allGroupRows || []);
  };

  const handleAddGroup = async () => {
    if (!user?.id || !selectedGroupId) return;
    setLoading(true);
    try {
      await addGroupMember(selectedGroupId, user.id);
      await refreshGroups();
      setSelectedGroupId("");
      showSuccess("Group updated");
    } catch (e) {
      showError(extractApiErrorMessage(e, "Failed to add group"));
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveGroup = async (groupId) => {
    if (!user?.id || !groupId) return;
    setLoading(true);
    try {
      await removeGroupMember(groupId, user.id);
      await refreshGroups();
      showSuccess("Group updated");
    } catch (e) {
      showError(extractApiErrorMessage(e, "Failed to remove group"));
    } finally {
      setLoading(false);
    }
  };

  const toggleSessionSelection = (sessionId) => {
    setSessionSelection((prev) => {
      const next = new Set(prev);
      if (next.has(sessionId)) {
        next.delete(sessionId);
      } else {
        next.add(sessionId);
      }
      return next;
    });
  };

  const handleDeleteSessions = async () => {
    if (!user?.id || sessionSelection.size === 0) return;
    setLoading(true);
    try {
      await deleteSelectedSessions(user.id, Array.from(sessionSelection));
      showSuccess("Sessions deleted");
      const sessionRows = await getUserSessions(user.id);
      setSessions(sessionRows || []);
      setSessionSelection(new Set());
    } catch (e) {
      showError(extractApiErrorMessage(e, "Failed to delete sessions"));
    } finally {
      setLoading(false);
    }
  };

  if (loading && !user) {
    return (
      <div className="content">
        <div className="card">
          <div className="card-body">Loading...</div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="content">
        <div className="card">
          <div className="card-body">
            <h4 className="mb-1">User Not Found</h4>
            <p className="mb-0">Please go back and select a user.</p>
          </div>
        </div>
      </div>
    );
  }

  if (!canEdit) {
    return (
      <div className="content">
        <div className="card">
          <div className="card-body">
            <h4 className="mb-1">Unauthorized</h4>
            <p className="mb-0">You do not have permission to edit this user.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="content user-edit-page">
      <style>{`
        .user-edit-page .btn-primary {
          background-color: #45597a;
          border-color: #45597a;
          border-radius: 2rem;
          padding: 0.6rem 1.5rem;
          font-weight: 500;
          transition: all 0.3s ease;
        }
        .user-edit-page .btn-primary:hover {
          background-color: #354560;
          border-color: #354560;
        }
        .user-edit-page .btn-light {
          background-color: #f5f5f5;
          border-color: #d0d5dd;
          border-radius: 2rem;
          color: #34393f;
        }
        .user-edit-page .btn-light:hover {
          background-color: #efefef;
        }
        .user-edit-page .btn-outline-warning,
        .user-edit-page .btn-danger {
          border-radius: 2rem;
        }
        .user-edit-page .card {
          border: none;
          border-radius: 1.5rem;
          box-shadow: 0 10px 30px rgba(15, 23, 42, 0.08);
          overflow: hidden;
        }
        .user-edit-page .card-header {
          background: linear-gradient(180deg, #ffffff 0%, #f8fafc 100%);
          border-bottom: 1px solid #eef2f7;
          padding: 1rem 1.25rem;
        }
        .user-edit-page .card-body {
          padding: 1.25rem;
        }
        .user-edit-page .nav.nav-underline {
          gap: 0.5rem;
          border-bottom: 0;
        }
        .user-edit-page .nav.nav-underline .nav-link {
          border: 1px solid #dbe2ea;
          border-radius: 999px;
          color: #45597a;
          font-weight: 500;
          padding: 0.55rem 1rem;
          background-color: #fff;
        }
        .user-edit-page .nav.nav-underline .nav-link.active {
          background-color: #45597a;
          color: #fff;
          border-color: #45597a;
        }
        .user-edit-page .edit-form-panel {
          max-width: 32rem;
          margin-left: auto;
          margin-right: auto;
        }
        .user-edit-page .edit-form-panel .form-label {
          color: #34393f;
          font-weight: 500;
          font-size: 0.9rem;
        }
        .user-edit-page .edit-form-panel .form-control,
        .user-edit-page .edit-form-panel .form-select,
        .user-edit-page .profile-role-select {
          border-radius: 1.5rem;
          border: 1px solid #d0d5dd;
          padding: 0.6rem 1rem;
          font-size: 0.95rem;
          background-color: #fff;
          color: #34393f;
          transition: border-color 0.2s ease, box-shadow 0.2s ease, background-color 0.2s ease;
        }
        .user-edit-page .edit-form-panel .form-control:hover,
        .user-edit-page .edit-form-panel .form-select:hover,
        .user-edit-page .profile-role-select:hover {
          border-color: #45597a;
          background-color: #f8fafc;
        }
        .user-edit-page .edit-form-panel .form-control:focus,
        .user-edit-page .edit-form-panel .form-select:focus,
        .user-edit-page .profile-role-select:focus {
          border-color: #45597a;
          box-shadow: 0 0 0 0.2rem rgba(69, 89, 122, 0.15);
          background-color: #fff;
        }
        .user-edit-page .profile-meta-row {
          padding: 0.65rem 0;
          border-bottom: 1px solid #eef2f7;
        }
        .user-edit-page .profile-meta-row:last-child {
          border-bottom: 0;
        }
      `}</style>
      <div className="d-flex align-items-center justify-content-between flex-wrap mb-3">
        <div>
          <h4 className="mb-1">User Edit</h4>
          <p className="mb-0 text-muted">
            Home / User Edit
          </p>
        </div>
        <div className="d-flex flex-wrap gap-2">
          <button className="btn btn-light" onClick={() => navigate(-1)}>
            Back
          </button>
          <button className="btn btn-outline-warning" onClick={handleToggleActive}>
            {user.active ? "Ban User" : "Activate User"}
          </button>
          <button className="btn btn-danger" onClick={handleDelete}>
            Delete User
          </button>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h5 className="mb-0">User Edit</h5>
        </div>
        <div className="card-body">
          <div className="contact-grids-tab">
            <ul className="nav nav-underline" role="tablist">
              <li className="nav-item" role="presentation">
                <button
                  className={`nav-link ${activeTab === "general" ? "active" : ""}`}
                  type="button"
                  role="tab"
                  aria-selected={activeTab === "general"}
                  onClick={() => setActiveTab("general")}
                >
                  General Info
                </button>
              </li>
              <li className="nav-item" role="presentation">
                <button
                  className={`nav-link ${activeTab === "sessions" ? "active" : ""}`}
                  type="button"
                  role="tab"
                  aria-selected={activeTab === "sessions"}
                  onClick={() => setActiveTab("sessions")}
                >
                  Active Sessions
                </button>
              </li>
              <li className="nav-item" role="presentation">
                <button
                  className={`nav-link ${activeTab === "logs" ? "active" : ""}`}
                  type="button"
                  role="tab"
                  aria-selected={activeTab === "logs"}
                  onClick={() => setActiveTab("logs")}
                >
                  Logs
                </button>
              </li>
              <li className="nav-item" role="presentation">
                <button
                  className={`nav-link ${activeTab === "groups" ? "active" : ""}`}
                  type="button"
                  role="tab"
                  aria-selected={activeTab === "groups"}
                  onClick={() => setActiveTab("groups")}
                >
                  Group Membership
                </button>
              </li>
            </ul>
          </div>

          <div className="tab-content pt-4">
            {activeTab === "general" && (
              <div className="tab-pane fade show active">
                <div className="row g-4">
                  <div className="col-lg-6">
                    <div className="card h-100">
                      <div className="card-header">
                        <h6 className="mb-0">My Profile</h6>
                      </div>
                      <div className="card-body">
                        <div className="mb-2 d-flex justify-content-between profile-meta-row">
                          <span>Username:</span>
                          <span className="fw-medium">{user.username || "-"}</span>
                        </div>
                        <div className="mb-2 d-flex justify-content-between align-items-center profile-meta-row">
                          <span>Status:</span>
                          {canManageRole ? (
                            <select
                              className="form-select form-select-sm profile-role-select"
                              style={{ width: 180 }}
                              value={allowedRoleOptions.includes(user.role) ? user.role : ""}
                              onChange={(e) => handleRoleChange(e.target.value)}
                            >
                              <option value="" disabled>
                                Select Role
                              </option>
                              {allowedRoleOptions.map((role) => (
                                <option key={role} value={role}>
                                  {role}
                                </option>
                              ))}
                            </select>
                          ) : (
                            <span className="fw-medium">{user.role || "-"}</span>
                          )}
                        </div>
                        <div className="mb-2 d-flex justify-content-between profile-meta-row">
                          <span>Registered:</span>
                          <span className="fw-medium">{user.registeredAt || "-"}</span>
                        </div>
                        <div className="mb-2 d-flex justify-content-between profile-meta-row">
                          <span>Last Active:</span>
                          <span className="fw-medium">{user.lastLoginAt || "-"}</span>
                        </div>
                        <div className="mb-2 d-flex justify-content-between profile-meta-row">
                          <span>Registered IP:</span>
                          <span className="fw-medium">{user.registeredIp || "-"}</span>
                        </div>
                        <div className="mb-2 d-flex justify-content-between profile-meta-row">
                          <span>Last Active IP:</span>
                          <span className="fw-medium">{user.lastActiveIp || "-"}</span>
                        </div>
                        <div className="mb-2 d-flex justify-content-between profile-meta-row">
                          <span>First Name:</span>
                          <span className="fw-medium">{user.firstName || "-"}</span>
                        </div>
                        <div className="mb-2 d-flex justify-content-between profile-meta-row">
                          <span>Last Name:</span>
                          <span className="fw-medium">{user.lastName || "-"}</span>
                        </div>
                        <div className="mb-2 d-flex justify-content-between profile-meta-row">
                          <span>Email:</span>
                          <span className="fw-medium">{user.email || "-"}</span>
                        </div>
                        <div className="mb-2 d-flex justify-content-between profile-meta-row">
                          <span>Department:</span>
                          <span className="fw-medium">{user.departmentName || "-"}</span>
                        </div>
                        <div className="mb-2 d-flex justify-content-between profile-meta-row">
                          <span>Team:</span>
                          <span className="fw-medium">{user.team || "-"}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="col-lg-6">
                    <div className="card h-100">
                      <div className="card-header">
                        <h6 className="mb-0">Edit Account</h6>
                      </div>
                      <div className="card-body">
                        <div className="edit-form-panel">
                        <div className="mb-3">
                          <label className="form-label">First Name</label>
                          <input
                            className="form-control"
                            value={form.firstName}
                            onChange={(e) =>
                              setForm((prev) => ({
                                ...prev,
                                firstName: e.target.value,
                              }))
                            }
                          />
                        </div>
                        <div className="mb-3">
                          <label className="form-label">Last Name</label>
                          <input
                            className="form-control"
                            value={form.lastName}
                            onChange={(e) =>
                              setForm((prev) => ({
                                ...prev,
                                lastName: e.target.value,
                              }))
                            }
                          />
                        </div>
                        {!canEditOrgScope && (
                          <>
                            <div className="mb-3">
                              <label className="form-label">Department</label>
                              {canEditDepartment && orgDepartments.length > 0 ? (
                                <select
                                  className="form-select"
                                  value={orgDeptId}
                                  onChange={(e) => {
                                    const nextId = e.target.value;
                                    const selected = orgDepartments.find((item) => String(item.id) === String(nextId));
                                    setOrgDeptId(nextId);
                                    setForm((prev) => ({
                                      ...prev,
                                      departmentName: selected?.name || "",
                                      teamName: "",
                                    }));
                                  }}
                                  disabled={!canEditDepartment}
                                >
                                  <option value="">Select Department</option>
                                  {orgDepartments.map((item) => (
                                    <option key={item.id} value={item.id}>
                                      {item.name}
                                    </option>
                                  ))}
                                </select>
                              ) : (
                                <input
                                  className="form-control"
                                  value={form.departmentName}
                                  onChange={(e) =>
                                    setForm((prev) => ({
                                      ...prev,
                                      departmentName: e.target.value,
                                    }))
                                  }
                                  disabled={!canEditDepartment}
                                  readOnly={!canEditDepartment}
                                />
                              )}
                            </div>
                            <div className="mb-3">
                              <label className="form-label">Team</label>
                              {canEditTeam && orgTeams.length > 0 ? (
                                <select
                                  className="form-select"
                                  value={form.teamName}
                                  onChange={(e) =>
                                    setForm((prev) => ({
                                      ...prev,
                                      teamName: e.target.value,
                                    }))
                                  }
                                  disabled={!canEditTeam}
                                >
                                  <option value="">Select Team</option>
                                  {orgTeams.map((team) => (
                                    <option key={team.id} value={team.name}>
                                      {team.name}
                                    </option>
                                  ))}
                                </select>
                              ) : (
                                <input
                                  className="form-control"
                                  value={form.teamName}
                                  onChange={(e) =>
                                    setForm((prev) => ({
                                      ...prev,
                                      teamName: e.target.value,
                                    }))
                                  }
                                  disabled={!canEditTeam}
                                  readOnly={!canEditTeam}
                                />
                              )}
                            </div>
                          </>
                        )}
                        {canEditOrgScope && (
                          <>
                            <div className="mb-3">
                              <label className="form-label">Branch</label>
                              <select
                                className="form-select"
                                value={orgInstId}
                                onChange={(e) =>
                                  {
                                    const nextId = e.target.value;
                                    const selected = orgInstitutions.find((item) => String(item.id) === String(nextId));
                                    setOrgInstId(nextId);
                                    setOrgDeptId("");
                                    setForm((prev) => ({
                                      ...prev,
                                      institutionName: selected?.name || "",
                                      departmentName: "",
                                      teamName: "",
                                    }));
                                  }
                                }
                            >
                                <option value="">Select Branch</option>
                                {orgInstitutions.map((item) => (
                                  <option key={item.id} value={item.id}>
                                    {item.name}
                                  </option>
                                ))}
                              </select>
                            </div>
                            <div className="mb-3">
                              <label className="form-label">Department</label>
                              <select
                                className="form-select"
                                value={orgDeptId}
                                onChange={(e) => {
                                  const nextId = e.target.value;
                                  const selected = orgDepartments.find((item) => String(item.id) === String(nextId));
                                  setOrgDeptId(nextId);
                                  setForm((prev) => ({
                                    ...prev,
                                    departmentName: selected?.name || "",
                                    teamName: "",
                                  }));
                                }}
                                disabled={!orgInstId}
                              >
                                <option value="">Select Department</option>
                                {orgDepartments.map((item) => (
                                  <option key={item.id} value={item.id}>
                                    {item.name}
                                  </option>
                                ))}
                              </select>
                            </div>
                            <div className="mb-3">
                              <label className="form-label">Team</label>
                              <select
                                className="form-select"
                                value={form.teamName}
                                onChange={(e) =>
                                  setForm((prev) => ({
                                    ...prev,
                                    teamName: e.target.value,
                                  }))
                                }
                                disabled={!orgDeptId}
                              >
                                <option value="">Select Team</option>
                                {orgTeams.map((team) => (
                                  <option key={team.id} value={team.name}>
                                    {team.name}
                                  </option>
                                ))}
                              </select>
                            </div>
                          </>
                        )}
                        <div className="mb-3">
                          <label className="form-label">New Password</label>
                          <div className="position-relative">
                            <input
                              type={showNewPassword ? "text" : "password"}
                              className="form-control"
                              value={form.newPassword}
                              onChange={(e) =>
                                setForm((prev) => ({
                                  ...prev,
                                  newPassword: e.target.value,
                                }))
                              }
                            />
                            <button
                              type="button"
                              className="btn btn-link p-0 text-muted"
                              style={{ position: "absolute", right: 12, top: 8 }}
                              onClick={() =>
                                setShowNewPassword((prev) => !prev)
                              }
                              aria-label={
                                showNewPassword ? "Hide password" : "Show password"
                              }
                            >
                              <i
                                className={`ti ${
                                  showNewPassword ? "ti-eye-off" : "ti-eye"
                                }`}
                              />
                            </button>
                          </div>
                        </div>
                        <div className="mb-3">
                          <label className="form-label">Confirm Password</label>
                          <div className="position-relative">
                            <input
                              type={showConfirmPassword ? "text" : "password"}
                              className="form-control"
                              value={form.confirmPassword}
                              onChange={(e) =>
                                setForm((prev) => ({
                                  ...prev,
                                  confirmPassword: e.target.value,
                                }))
                              }
                            />
                            <button
                              type="button"
                              className="btn btn-link p-0 text-muted"
                              style={{ position: "absolute", right: 12, top: 8 }}
                              onClick={() =>
                                setShowConfirmPassword((prev) => !prev)
                              }
                              aria-label={
                                showConfirmPassword
                                  ? "Hide password"
                                  : "Show password"
                              }
                            >
                              <i
                                className={`ti ${
                                  showConfirmPassword ? "ti-eye-off" : "ti-eye"
                                }`}
                              />
                            </button>
                          </div>
                        </div>
                        <div className="d-flex justify-content-end gap-2">
                          <button
                            className="btn btn-primary"
                            onClick={handleSave}
                            disabled={loading}
                          >
                            Submit Changes
                          </button>
                          <button
                            className="btn btn-light"
                            onClick={() =>
                              setForm({
                                firstName: user.firstName || "",
                                lastName: user.lastName || "",
                                teamName: user.team || "",
                                departmentName: user.departmentName || "",
                                institutionName: user.institution || "",
                                newPassword: "",
                                confirmPassword: "",
                              })
                            }
                          >
                            Reset
                          </button>
                        </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "sessions" && (
              <div className="tab-pane fade show active">
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
                                onChange={() => toggleSessionSelection(session.id)}
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
                  disabled={sessionSelection.size === 0 || loading}
                >
                  Delete Selected Sessions
                </button>
              </div>
            )}

            {activeTab === "logs" && (
              <div className="tab-pane fade show active">
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
                      {logs.length === 0 ? (
                        <tr>
                          <td colSpan={3}>No logs found</td>
                        </tr>
                      ) : (
                        logs.map((log) => (
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
              </div>
            )}

            {activeTab === "groups" && (
              <div className="tab-pane fade show active">
                <div className="d-flex flex-wrap gap-2 align-items-end mb-3">
                  <div>
                    <label className="form-label">Add to Group</label>
                    <select
                      className="form-select"
                      style={{ minWidth: 240 }}
                      value={selectedGroupId}
                      onChange={(e) => setSelectedGroupId(e.target.value)}
                    >
                      <option value="">Select group</option>
                      {availableGroups
                        .filter(
                          (group) =>
                            !userGroups.some(
                              (current) => String(current.id) === String(group.id),
                            ),
                        )
                        .filter((group) => {
                          const userTeam = String(user?.teamName || "").trim().toLowerCase();
                          const groupTeams = Array.isArray(group?.teamNames)
                            ? group.teamNames.map((t) => String(t || "").trim().toLowerCase()).filter(Boolean)
                            : [];
                          if (!userTeam) {
                            return false;
                          }
                          return groupTeams.includes(userTeam);
                        })
                        .map((group) => (
                          <option key={group.id} value={group.id}>
                            {group.name}
                          </option>
                        ))}
                    </select>
                  </div>
                  <button
                    className="btn btn-primary"
                    onClick={handleAddGroup}
                    disabled={!selectedGroupId || loading}
                  >
                    Add
                  </button>
                </div>

                <div className="table-responsive">
                  <table className="table table-sm table-striped">
                    <thead className="table-light">
                      <tr>
                        <th>Group</th>
                        <th>Level</th>
                        <th></th>
                      </tr>
                    </thead>
                    <tbody>
                      {userGroups.length === 0 ? (
                        <tr>
                          <td colSpan={3}>No groups assigned</td>
                        </tr>
                      ) : (
                        userGroups.map((group) => (
                          <tr key={group.id}>
                            <td>{group.name || "-"}</td>
                            <td className="text-end">
                              <button
                                className="btn btn-sm btn-outline-danger"
                                onClick={() => handleRemoveGroup(group.id)}
                                disabled={loading}
                              >
                                Remove
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
          </div>
        </div>
      </div>
    </div>
  );
}
