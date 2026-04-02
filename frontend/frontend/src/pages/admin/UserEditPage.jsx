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
  getInstitutionCategories,
  getInstitutionTypes,
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
  EMPLOYEE: 1,
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
    institutionCategory: "",
    institutionType: "",
  });
  const [orgTeams, setOrgTeams] = useState([]);
  const [orgDepartments, setOrgDepartments] = useState([]);
  const [orgInstitutions, setOrgInstitutions] = useState([]);
  const [orgCategories, setOrgCategories] = useState([]);
  const [orgTypes, setOrgTypes] = useState([]);
  const [orgInstId, setOrgInstId] = useState("");
  const [orgCatId, setOrgCatId] = useState("");
  const [orgTypeId, setOrgTypeId] = useState("");
  const [orgDeptId, setOrgDeptId] = useState("");

  const currentRole = String(currentUser?.role || "").toUpperCase();
  const isAdmin = currentRole === "ADMIN";
  const isSuperAdmin = currentRole === "SUPER_ADMIN";
  const canManageRole = isAdmin || isSuperAdmin;
  const canEditTeam = isAdmin || isSuperAdmin;
  const canEditDepartment = isSuperAdmin;
  const canEditOrgScope = isSuperAdmin;

  const canSeeUser = (row) => {
    if (!row) return false;
    if (currentRole === "SUPER_ADMIN") return true;
    if (currentRole === "ADMIN") {
      return (
        !currentUser?.institutionType ||
        row.institutionType === currentUser?.institutionType
      );
    }
    if (currentRole === "MANAGER") {
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
          institutionCategory: user.institutionCategory || "",
          institutionType: user.institutionType || "",
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
            institutionCategory: found?.institutionCategory || "",
            institutionType: found?.institutionType || "",
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

  // Load org hierarchy for ADMIN (teams only) and SUPER_ADMIN (full)
  useEffect(() => {
    if (!isAdmin && !isSuperAdmin) return;
    const load = async () => {
      try {
        if (isSuperAdmin) {
          const insts = await getInstitutions();
          setOrgInstitutions(Array.isArray(insts) ? insts : []);
        }
        // For ADMIN: use currentUser's own org scope to load teams
        if (isAdmin && currentUser) {
          const insts = await getInstitutions();
          const instMatch = (Array.isArray(insts) ? insts : []).find(
            (i) => String(i.name || "").toLowerCase() === String(currentUser.institution || "").toLowerCase()
          );
          const instId = instMatch ? String(instMatch.id) : "";
          if (!instId) return;
          const cats = await getInstitutionCategories(instId);
          const catMatch = (Array.isArray(cats) ? cats : []).find(
            (c) => String(c.name || "").toLowerCase() === String(currentUser.institutionCategory || "").toLowerCase()
          );
          const catId = catMatch ? String(catMatch.id) : "";
          if (!catId) return;
          const types = await getInstitutionTypes(instId, catId);
          const typeMatch = (Array.isArray(types) ? types : []).find(
            (t) => String(t.name || "").toLowerCase() === String(currentUser.institutionType || "").toLowerCase()
          );
          const typeId = typeMatch ? String(typeMatch.id) : "";
          if (!typeId) return;
          const depts = await getDepartments(instId, catId, typeId);
          const deptMatch = (Array.isArray(depts) ? depts : []).find(
            (d) => String(d.name || "").toLowerCase() === String(currentUser.departmentName || "").toLowerCase()
          );
          const deptId = deptMatch ? String(deptMatch.id) : "";
          if (!deptId) return;
          setOrgDeptId(deptId);
          setOrgTypeId(typeId);
          const teams = await getTeams(instId, catId, typeId, deptId);
          setOrgTeams(Array.isArray(teams) ? teams : []);
        }
      } catch (e) {
        // silently ignore org load errors
      }
    };
    load();
  }, [isAdmin, isSuperAdmin, currentUser]);

  // For SUPER_ADMIN: cascade load categories/types/depts/teams based on selections
  useEffect(() => {
    if (!isSuperAdmin || !orgInstId) { setOrgCategories([]); return; }
    getInstitutionCategories(orgInstId).then((d) => setOrgCategories(Array.isArray(d) ? d : [])).catch(() => {});
  }, [isSuperAdmin, orgInstId]);

  useEffect(() => {
    if (!isSuperAdmin || !orgInstId || !orgCatId) { setOrgTypes([]); return; }
    getInstitutionTypes(orgInstId, orgCatId).then((d) => setOrgTypes(Array.isArray(d) ? d : [])).catch(() => {});
  }, [isSuperAdmin, orgInstId, orgCatId]);

  useEffect(() => {
    if (!isSuperAdmin || !orgInstId || !orgCatId || !orgTypeId) { setOrgDepartments([]); return; }
    getDepartments(orgInstId, orgCatId, orgTypeId).then((d) => setOrgDepartments(Array.isArray(d) ? d : [])).catch(() => {});
  }, [isSuperAdmin, orgInstId, orgCatId, orgTypeId]);

  useEffect(() => {
    if (!orgInstId || !orgCatId || !orgTypeId || !orgDeptId) { setOrgTeams([]); return; }
    getTeams(orgInstId, orgCatId, orgTypeId, orgDeptId).then((d) => setOrgTeams(Array.isArray(d) ? d : [])).catch(() => {});
  }, [orgInstId, orgCatId, orgTypeId, orgDeptId]);

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
    if (!isSuperAdmin || !orgInstId || orgCatId || !form.institutionCategory || orgCategories.length === 0) return;
    const match = orgCategories.find(
      (item) => String(item.name || "").toLowerCase() === String(form.institutionCategory || "").toLowerCase(),
    );
    if (match?.id != null) {
      setOrgCatId(String(match.id));
    }
  }, [isSuperAdmin, orgInstId, orgCatId, form.institutionCategory, orgCategories]);

  useEffect(() => {
    if (!isSuperAdmin || !orgCatId || orgTypeId || !form.institutionType || orgTypes.length === 0) return;
    const match = orgTypes.find(
      (item) => String(item.name || "").toLowerCase() === String(form.institutionType || "").toLowerCase(),
    );
    if (match?.id != null) {
      setOrgTypeId(String(match.id));
    }
  }, [isSuperAdmin, orgCatId, orgTypeId, form.institutionType, orgTypes]);

  useEffect(() => {
    if (!isSuperAdmin || !orgTypeId || orgDeptId || !form.departmentName || orgDepartments.length === 0) return;
    const match = orgDepartments.find(
      (item) => String(item.name || "").toLowerCase() === String(form.departmentName || "").toLowerCase(),
    );
    if (match?.id != null) {
      setOrgDeptId(String(match.id));
    }
  }, [isSuperAdmin, orgTypeId, orgDeptId, form.departmentName, orgDepartments]);

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
        institutionCategory: canEditOrgScope ? form.institutionCategory : undefined,
        institutionType: canEditOrgScope ? form.institutionType : undefined,
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
    <div className="content">
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
                        <div className="mb-2 d-flex justify-content-between">
                          <span>Username:</span>
                          <span className="fw-medium">{user.username || "-"}</span>
                        </div>
                        <div className="mb-2 d-flex justify-content-between align-items-center">
                          <span>Status:</span>
                          {canManageRole ? (
                            <select
                              className="form-select form-select-sm"
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
                        <div className="mb-2 d-flex justify-content-between">
                          <span>Registered:</span>
                          <span className="fw-medium">{user.registeredAt || "-"}</span>
                        </div>
                        <div className="mb-2 d-flex justify-content-between">
                          <span>Last Active:</span>
                          <span className="fw-medium">{user.lastLoginAt || "-"}</span>
                        </div>
                        <div className="mb-2 d-flex justify-content-between">
                          <span>Registered IP:</span>
                          <span className="fw-medium">{user.registeredIp || "-"}</span>
                        </div>
                        <div className="mb-2 d-flex justify-content-between">
                          <span>Last Active IP:</span>
                          <span className="fw-medium">{user.lastActiveIp || "-"}</span>
                        </div>
                        <div className="mb-2 d-flex justify-content-between">
                          <span>First Name:</span>
                          <span className="fw-medium">{user.firstName || "-"}</span>
                        </div>
                        <div className="mb-2 d-flex justify-content-between">
                          <span>Last Name:</span>
                          <span className="fw-medium">{user.lastName || "-"}</span>
                        </div>
                        <div className="mb-2 d-flex justify-content-between">
                          <span>Email:</span>
                          <span className="fw-medium">{user.email || "-"}</span>
                        </div>
                        <div className="mb-2 d-flex justify-content-between">
                          <span>Department:</span>
                          <span className="fw-medium">{user.departmentName || "-"}</span>
                        </div>
                        <div className="mb-2 d-flex justify-content-between">
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
                            </div>
                            <div className="mb-3">
                              <label className="form-label">Team</label>
                              {isAdmin && orgTeams.length > 0 ? (
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
                              <label className="form-label">Institution</label>
                              <select
                                className="form-select"
                                value={orgInstId}
                                onChange={(e) =>
                                  {
                                    const nextId = e.target.value;
                                    const selected = orgInstitutions.find((item) => String(item.id) === String(nextId));
                                    setOrgInstId(nextId);
                                    setOrgCatId("");
                                    setOrgTypeId("");
                                    setOrgDeptId("");
                                    setForm((prev) => ({
                                      ...prev,
                                      institutionName: selected?.name || "",
                                      institutionCategory: "",
                                      institutionType: "",
                                      departmentName: "",
                                      teamName: "",
                                    }));
                                  }
                                }
                            >
                                <option value="">Select Institution</option>
                                {orgInstitutions.map((item) => (
                                  <option key={item.id} value={item.id}>
                                    {item.name}
                                  </option>
                                ))}
                              </select>
                            </div>
                            <div className="mb-3">
                              <label className="form-label">Institution Category</label>
                              <select
                                className="form-select"
                                value={orgCatId}
                                onChange={(e) =>
                                  {
                                    const nextId = e.target.value;
                                    const selected = orgCategories.find((item) => String(item.id) === String(nextId));
                                    setOrgCatId(nextId);
                                    setOrgTypeId("");
                                    setOrgDeptId("");
                                    setForm((prev) => ({
                                      ...prev,
                                      institutionCategory: selected?.name || "",
                                      institutionType: "",
                                      departmentName: "",
                                      teamName: "",
                                    }));
                                  }
                                }
                                disabled={!orgInstId}
                              >
                                <option value="">Select Institution Category</option>
                                {orgCategories.map((item) => (
                                  <option key={item.id} value={item.id}>
                                    {item.name}
                                  </option>
                                ))}
                              </select>
                            </div>
                            <div className="mb-3">
                              <label className="form-label">Institution Type</label>
                              <select
                                className="form-select"
                                value={orgTypeId}
                                onChange={(e) =>
                                  {
                                    const nextId = e.target.value;
                                    const selected = orgTypes.find((item) => String(item.id) === String(nextId));
                                    setOrgTypeId(nextId);
                                    setOrgDeptId("");
                                    setForm((prev) => ({
                                      ...prev,
                                      institutionType: selected?.name || "",
                                      departmentName: "",
                                      teamName: "",
                                    }));
                                  }
                                }
                                disabled={!orgCatId}
                              >
                                <option value="">Select Institution Type</option>
                                {orgTypes.map((item) => (
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
                                disabled={!orgTypeId}
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
                                institutionCategory: user.institutionCategory || "",
                                institutionType: user.institutionType || "",
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
                            <td>{group.groupLevel ?? "-"}</td>
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
