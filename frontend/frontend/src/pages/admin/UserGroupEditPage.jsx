import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import {
  addGroupMember,
  deleteUserGroup,
  getAssignableUsersForGroup,
  getGroupMembers,
  getUserGroups,
  removeGroupMember,
  updateUserGroup,
} from "../../api/userGroupApi";
import {
  getDepartments,
  getInstitutionCategories,
  getInstitutions,
  getInstitutionTypes,
  getTeams,
  getUserOrgSelection,
} from "../../api/orgHierarchyApi";
import { extractApiErrorMessage } from "../../utils/errorMessage";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../components/system/ToastProvider";
import ConfirmDialog from "../../components/system/ConfirmDialog";

const EMPTY_SCOPE = {
  institutionId: "",
  categoryId: "",
  typeId: "",
  departmentId: "",
  teamIds: [],
};

export default function UserGroupEditPage() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const currentRole = String(currentUser?.role || "").toUpperCase();
  const isAdmin = currentRole === "ADMIN";
  const isManager = currentRole === "MANAGER";
  const { showSuccess, showError } = useToast();

  const [group, setGroup] = useState(location.state?.group || null);
  const [form, setForm] = useState({ name: "", level: 2 });
  const [scope, setScope] = useState(EMPTY_SCOPE);
  const [orgSelection, setOrgSelection] = useState(null);
  const [institutions, setInstitutions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [types, setTypes] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [teams, setTeams] = useState([]);
  const [members, setMembers] = useState([]);
  const [assignableUsers, setAssignableUsers] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState("");
  const [loading, setLoading] = useState(false);
  const [orgLoading, setOrgLoading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const normalize = (value) => String(value || "").trim().toLowerCase();

  const findByName = (rows, name) =>
    rows.find((row) => normalize(row?.name) === normalize(name));

  const selectedInstitution = useMemo(
    () => institutions.find((item) => String(item.id) === String(scope.institutionId)),
    [institutions, scope.institutionId],
  );
  const selectedCategory = useMemo(
    () => categories.find((item) => String(item.id) === String(scope.categoryId)),
    [categories, scope.categoryId],
  );
  const selectedType = useMemo(
    () => types.find((item) => String(item.id) === String(scope.typeId)),
    [types, scope.typeId],
  );
  const selectedDepartment = useMemo(
    () => departments.find((item) => String(item.id) === String(scope.departmentId)),
    [departments, scope.departmentId],
  );
  const selectedTeams = useMemo(
    () => teams.filter((team) => scope.teamIds.some((tid) => String(tid) === String(team.id))),
    [teams, scope.teamIds],
  );
  const selectedTeamNames = useMemo(
    () => selectedTeams.map((team) => String(team.name || "").trim()).filter(Boolean),
    [selectedTeams],
  );

  useEffect(() => {
    let isMounted = true;
    const loadBase = async () => {
      setOrgLoading(true);
      try {
        const [instRows, selection] = await Promise.all([
          getInstitutions(),
          currentUser?.id ? getUserOrgSelection(currentUser.id) : Promise.resolve(null),
        ]);
        if (!isMounted) return;
        setInstitutions(Array.isArray(instRows) ? instRows : []);
        setOrgSelection(selection || null);
      } catch (e) {
        if (isMounted) showError(extractApiErrorMessage(e, "Failed to load organization data"));
      } finally {
        if (isMounted) setOrgLoading(false);
      }
    };
    loadBase();
    return () => {
      isMounted = false;
    };
  }, [currentUser?.id]);

  useEffect(() => {
    let isMounted = true;
    const loadGroup = async () => {
      if (group) {
        setForm({ name: group.name || "", level: Math.max(Number(group.level || 0), 2) });
        return;
      }
      setLoading(true);
      try {
        const rows = await getUserGroups();
        const found = rows.find((row) => String(row.id) === String(id));
        if (!isMounted) return;
        if (!found) {
          showError("Group not found");
          return;
        }
        setGroup(found);
        setForm({ name: found.name || "", level: Math.max(Number(found.level || 0), 2) });
      } catch (e) {
        if (isMounted) showError(extractApiErrorMessage(e, "Failed to load group"));
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    loadGroup();
    return () => {
      isMounted = false;
    };
  }, [id, group]);

  useEffect(() => {
    let isMounted = true;
    const hydrateScope = async () => {
      if (!group || !institutions.length) return;
      try {
        const institution = findByName(institutions, group.institutionName);
        const institutionId = institution?.id ? String(institution.id) : "";
        if (!institutionId) return;
        const categoryRows = await getInstitutionCategories(institutionId);
        if (!isMounted) return;
        setCategories(Array.isArray(categoryRows) ? categoryRows : []);
        const category = findByName(categoryRows, group.institutionCategory);
        const categoryId = category?.id ? String(category.id) : "";
        if (!categoryId) {
          setScope((prev) => ({ ...prev, institutionId }));
          return;
        }
        const typeRows = await getInstitutionTypes(institutionId, categoryId);
        if (!isMounted) return;
        setTypes(Array.isArray(typeRows) ? typeRows : []);
        const type = findByName(typeRows, group.institutionType);
        const typeId = type?.id ? String(type.id) : "";
        if (!typeId) {
          setScope((prev) => ({ ...prev, institutionId, categoryId }));
          return;
        }
        const departmentRows = await getDepartments(institutionId, categoryId, typeId);
        if (!isMounted) return;
        setDepartments(Array.isArray(departmentRows) ? departmentRows : []);
        const department = findByName(departmentRows, group.departmentName);
        const departmentId = department?.id ? String(department.id) : "";
        if (!departmentId) {
          setScope((prev) => ({ ...prev, institutionId, categoryId, typeId }));
          return;
        }
        const teamRows = await getTeams(institutionId, categoryId, typeId, departmentId);
        if (!isMounted) return;
        setTeams(Array.isArray(teamRows) ? teamRows : []);
        const teamIds = Array.isArray(group.teamNames)
          ? teamRows
              .filter((team) =>
                group.teamNames.some((name) => normalize(name) === normalize(team.name)),
              )
              .map((team) => String(team.id))
          : [];
        setScope({
          institutionId,
          categoryId,
          typeId,
          departmentId,
          teamIds,
        });
      } catch (e) {
        if (isMounted) showError(extractApiErrorMessage(e, "Failed to load group scope"));
      }
    };
    hydrateScope();
    return () => {
      isMounted = false;
    };
  }, [group, institutions]);

  useEffect(() => {
    let isMounted = true;
    const loadMembers = async () => {
      if (!group?.id) return;
      setLoading(true);
      try {
        const [memberRows, userRows] = await Promise.all([
          getGroupMembers(group.id),
          getAssignableUsersForGroup({ groupId: group.id }),
        ]);
        if (!isMounted) return;
        setMembers(Array.isArray(memberRows) ? memberRows : []);
        setAssignableUsers(Array.isArray(userRows) ? userRows : []);
      } catch (e) {
        if (isMounted) showError(extractApiErrorMessage(e, "Failed to load members"));
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    loadMembers();
    return () => {
      isMounted = false;
    };
  }, [group?.id]);

  useEffect(() => {
    let isMounted = true;
    const loadAssignableBySelectedTeams = async () => {
      if (!group?.id) return;
      try {
        const params =
          selectedTeamNames.length > 0
            ? { teams: selectedTeamNames }
            : { groupId: group.id };
        const rows = await getAssignableUsersForGroup(params);
        if (!isMounted) return;
        setAssignableUsers(Array.isArray(rows) ? rows : []);
      } catch (e) {
        if (isMounted) {
          showError(extractApiErrorMessage(e, "Failed to filter assignable users"));
        }
      }
    };
    loadAssignableBySelectedTeams();
    return () => {
      isMounted = false;
    };
  }, [group?.id, selectedTeamNames]);

  useEffect(() => {
    let isMounted = true;
    const run = async () => {
      if (!scope.institutionId) {
        setCategories([]);
        return;
      }
      try {
        const rows = await getInstitutionCategories(scope.institutionId);
        if (isMounted) setCategories(Array.isArray(rows) ? rows : []);
      } catch (e) {
        if (isMounted) showError(extractApiErrorMessage(e, "Failed to load categories"));
      }
    };
    run();
    return () => {
      isMounted = false;
    };
  }, [scope.institutionId]);

  useEffect(() => {
    let isMounted = true;
    const run = async () => {
      if (!scope.institutionId || !scope.categoryId) {
        setTypes([]);
        return;
      }
      try {
        const rows = await getInstitutionTypes(scope.institutionId, scope.categoryId);
        if (isMounted) setTypes(Array.isArray(rows) ? rows : []);
      } catch (e) {
        if (isMounted) showError(extractApiErrorMessage(e, "Failed to load types"));
      }
    };
    run();
    return () => {
      isMounted = false;
    };
  }, [scope.institutionId, scope.categoryId]);

  useEffect(() => {
    let isMounted = true;
    const run = async () => {
      if (!scope.institutionId || !scope.categoryId || !scope.typeId) {
        setDepartments([]);
        return;
      }
      try {
        const rows = await getDepartments(scope.institutionId, scope.categoryId, scope.typeId);
        if (isMounted) setDepartments(Array.isArray(rows) ? rows : []);
      } catch (e) {
        if (isMounted) showError(extractApiErrorMessage(e, "Failed to load departments"));
      }
    };
    run();
    return () => {
      isMounted = false;
    };
  }, [scope.institutionId, scope.categoryId, scope.typeId]);

  useEffect(() => {
    let isMounted = true;
    const run = async () => {
      if (!scope.institutionId || !scope.categoryId || !scope.typeId || !scope.departmentId) {
        setTeams([]);
        return;
      }
      try {
        const rows = await getTeams(
          scope.institutionId,
          scope.categoryId,
          scope.typeId,
          scope.departmentId,
        );
        if (isMounted) setTeams(Array.isArray(rows) ? rows : []);
      } catch (e) {
        if (isMounted) showError(extractApiErrorMessage(e, "Failed to load teams"));
      }
    };
    run();
    return () => {
      isMounted = false;
    };
  }, [scope.institutionId, scope.categoryId, scope.typeId, scope.departmentId]);

  useEffect(() => {
    if (!orgSelection) return;
    if (currentRole === "SUPER_ADMIN") return;
    setScope((prev) => ({
      ...prev,
      institutionId: String(orgSelection.institutionId || prev.institutionId || ""),
      categoryId: String(orgSelection.categoryId || prev.categoryId || ""),
      typeId: String(orgSelection.typeId || prev.typeId || ""),
      departmentId: String(orgSelection.departmentId || prev.departmentId || ""),
      teamIds:
        currentRole === "MANAGER" && orgSelection.teamId
          ? [String(orgSelection.teamId)]
          : prev.teamIds,
    }));
  }, [orgSelection, currentRole]);

  const refreshMembers = async () => {
    if (!group?.id) return;
    const params =
      selectedTeamNames.length > 0
        ? { teams: selectedTeamNames }
        : { groupId: group.id };
    const [memberRows, userRows] = await Promise.all([
      getGroupMembers(group.id),
      getAssignableUsersForGroup(params),
    ]);
    const nextMembers = Array.isArray(memberRows) ? memberRows : [];
    setMembers(nextMembers);
    setAssignableUsers(Array.isArray(userRows) ? userRows : []);
  };

  const handleSave = async () => {
    if (!group?.id) return;
    if (!form.name.trim()) {
      showError("Group name is required");
      return;
    }
    if (!selectedInstitution || !selectedCategory || !selectedType || !selectedDepartment) {
      showError("Institution, category, type and department are required");
      return;
    }
    if (currentRole !== "SUPER_ADMIN" && !selectedTeams.length) {
      showError("At least one team is required");
      return;
    }
    setLoading(true);
    try {
      const updated = await updateUserGroup(group.id, {
        name: form.name.trim(),
        level: Number(form.level),
        institutionName: selectedInstitution.name,
        institutionCategory: selectedCategory.name,
        institutionType: selectedType.name,
        departmentName: selectedDepartment.name,
        teamNames: selectedTeams.map((team) => team.name),
        pageKeys: Array.isArray(group?.pageKeys) ? group.pageKeys : [],
      });
      const nextPageKeys = Array.isArray(updated.pageKeys)
        ? updated.pageKeys
        : Array.isArray(group?.pageKeys)
          ? group.pageKeys
          : [];
      setGroup({ ...updated, pageKeys: nextPageKeys });
      showSuccess("Group updated");
    } catch (e) {
      showError(extractApiErrorMessage(e, "Failed to update group"));
    } finally {
      setLoading(false);
    }
  };

  const handleAddMember = async () => {
    if (!group?.id || !selectedUserId) return;
    setLoading(true);
    try {
      await addGroupMember(group.id, selectedUserId);
      await refreshMembers();
      setSelectedUserId("");
      showSuccess("Member added");
    } catch (e) {
      showError(extractApiErrorMessage(e, "Failed to add member"));
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveMember = async (userId) => {
    if (!group?.id || !userId) return;
    setLoading(true);
    try {
      await removeGroupMember(group.id, userId);
      await refreshMembers();
      showSuccess("Member removed");
    } catch (e) {
      showError(extractApiErrorMessage(e, "Failed to remove member"));
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteGroup = async () => {
    if (!group?.id) return;
    setLoading(true);
    try {
      await deleteUserGroup(group.id);
      showSuccess("Group deleted");
      navigate("/usergroups");
    } catch (e) {
      showError(extractApiErrorMessage(e, "Failed to delete group"));
    } finally {
      setLoading(false);
      setShowDeleteConfirm(false);
    }
  };

  if (!group && loading) {
    return <div className="container-fluid"><div className="card"><div className="card-body">Loading...</div></div></div>;
  }

  if (!group && !loading) {
    return (
      <div className="container-fluid">
        <div className="card">
          <div className="card-body">
            <h5 className="mb-2">Group Not Found</h5>
            <button className="btn btn-light" onClick={() => navigate("/usergroups")}>
              Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid">
      <div className="card">
        <div className="card-header d-flex justify-content-between align-items-center">
          <h4 className="mb-0">Edit Group</h4>
          <button className="btn btn-light" onClick={() => navigate("/usergroups")}>
            Back
          </button>
        </div>
        <div className="card-body">
          <div className="row g-3">
            <div className="col-md-6">
              <label className="form-label">Group Name</label>
              <input
                className="form-control"
                value={form.name}
                onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
              />
            </div>
            <div className="col-md-6">
              <label className="form-label">Group Level</label>
              <input
                type="number"
                className="form-control"
                value={form.level}
                onChange={(e) => setForm((prev) => ({ ...prev, level: Number(e.target.value) || 0 }))}
              />
            </div>
            <div className="col-md-6">
              <label className="form-label">Institution</label>
              <select
                className="form-select"
                value={scope.institutionId}
                onChange={(e) =>
                  setScope({
                    institutionId: e.target.value,
                    categoryId: "",
                    typeId: "",
                    departmentId: "",
                    teamIds: [],
                  })
                }
                disabled={orgLoading || isAdmin || isManager}
              >
                <option value="">Select Institution</option>
                {institutions.map((item) => (
                  <option key={item.id} value={item.id}>{item.name}</option>
                ))}
              </select>
            </div>
            <div className="col-md-6">
              <label className="form-label">Institution Category</label>
              <select
                className="form-select"
                value={scope.categoryId}
                onChange={(e) =>
                  setScope((prev) => ({
                    ...prev,
                    categoryId: e.target.value,
                    typeId: "",
                    departmentId: "",
                    teamIds: [],
                  }))
                }
                disabled={orgLoading || !scope.institutionId || isAdmin || isManager}
              >
                <option value="">Select Category</option>
                {categories.map((item) => (
                  <option key={item.id} value={item.id}>{item.name}</option>
                ))}
              </select>
            </div>
            <div className="col-md-6">
              <label className="form-label">Institution Type</label>
              <select
                className="form-select"
                value={scope.typeId}
                onChange={(e) =>
                  setScope((prev) => ({
                    ...prev,
                    typeId: e.target.value,
                    departmentId: "",
                    teamIds: [],
                  }))
                }
                disabled={orgLoading || !scope.categoryId || isAdmin || isManager}
              >
                <option value="">Select Type</option>
                {types.map((item) => (
                  <option key={item.id} value={item.id}>{item.name}</option>
                ))}
              </select>
            </div>
            <div className="col-md-6">
              <label className="form-label">Department</label>
              <select
                className="form-select"
                value={scope.departmentId}
                onChange={(e) =>
                  setScope((prev) => ({
                    ...prev,
                    departmentId: e.target.value,
                    teamIds: [],
                  }))
                }
                disabled={orgLoading || !scope.typeId || isAdmin || isManager}
              >
                <option value="">Select Department</option>
                {departments.map((item) => (
                  <option key={item.id} value={item.id}>{item.name}</option>
                ))}
              </select>
            </div>
            <div className="col-12">
              <label className="form-label">Teams</label>
              <div className="d-flex gap-2">
                <select
                  className="form-select"
                  value=""
                  onChange={(e) => {
                    const teamId = e.target.value;
                    if (teamId && !scope.teamIds.includes(teamId)) {
                      setScope((prev) => ({
                        ...prev,
                        teamIds: [...prev.teamIds, teamId],
                      }));
                    }
                    e.target.value = "";
                  }}
                  disabled={orgLoading || !scope.departmentId || isManager}
                >
                  <option value="">Select Team</option>
                  {teams
                    .filter((item) => !scope.teamIds.includes(String(item.id)))
                    .map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.name}
                      </option>
                    ))}
                </select>
              </div>
              {scope.teamIds.length > 0 && (
                <div className="mt-2 d-flex flex-wrap gap-2">
                  {scope.teamIds.map((teamId) => {
                    const team = teams.find((t) => String(t.id) === String(teamId));
                    return (
                      <span
                        key={teamId}
                        className="badge bg-primary d-inline-flex align-items-center gap-2"
                        style={{ fontSize: "0.875rem", padding: "0.5rem 0.75rem" }}
                      >
                        {team?.name || teamId}
                        <i
                          className="ti ti-x"
                          style={{ cursor: "pointer" }}
                          onClick={() =>
                            setScope((prev) => ({
                              ...prev,
                              teamIds: prev.teamIds.filter((id) => id !== teamId),
                            }))
                          }
                        ></i>
                      </span>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          <div className="mb-3">
            <label className="form-label">Add Users</label>
            <div className="d-flex gap-2">
              <select
                className="form-select"
                value={selectedUserId}
                onChange={(e) => setSelectedUserId(e.target.value)}
              >
                <option value="">Select Add Users</option>
                {assignableUsers
                  .filter((user) => !members.some((member) => String(member.userId) === String(user.id)))
                  .map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.username} ({user.role || "USER"})
                    </option>
                  ))}
              </select>
              <button className="btn btn-primary" onClick={handleAddMember} disabled={!selectedUserId || loading}>
                Add
              </button>
            </div>
          </div>

          <div className="table-responsive">
            <table className="table table-bordered">
              <thead className="table-light">
                <tr>
                  <th>Username</th>
                  <th>Role</th>
                  <th className="text-end">Remove</th>
                </tr>
              </thead>
              <tbody>
                {members.length === 0 ? (
                  <tr><td colSpan={3}>No members</td></tr>
                ) : (
                  members.map((member) => {
                    return (
                      <tr key={member.userId}>
                        <td>{member.username || "-"}</td>
                        <td>{member.role || "-"}</td>
                        <td className="text-end">
                          <button
                            className="btn btn-sm btn-outline-danger"
                            onClick={() => handleRemoveMember(member.userId)}
                            disabled={loading}
                          >
                            Remove
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          <div className="d-flex justify-content-end gap-2 mt-3">
            <button className="btn btn-danger" onClick={() => setShowDeleteConfirm(true)} disabled={loading}>
              Delete Group
            </button>
            <button className="btn btn-primary" onClick={handleSave} disabled={loading}>
              {loading ? "Saving..." : "Save Group"}
            </button>
          </div>
        </div>
      </div>

      <ConfirmDialog
        open={showDeleteConfirm}
        title="Delete Group"
        message={`Are you sure you want to delete the group "${group?.name}"? This action cannot be undone.`}
        onConfirm={handleDeleteGroup}
        onCancel={() => setShowDeleteConfirm(false)}
        confirmLabel="Delete"
        cancelLabel="Cancel"
      />
    </div>
  );
}
