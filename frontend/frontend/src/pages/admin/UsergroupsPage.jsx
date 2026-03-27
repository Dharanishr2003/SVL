import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  getUserGroups,
  createUserGroup,
  deleteUserGroup,
  updateUserGroup,
  getGroupMembers,
  addGroupMember,
  removeGroupMember,
  getAssignableUsersForGroup,
} from "../../api/userGroupApi";
import { extractApiErrorMessage } from "../../utils/errorMessage";
import {
  getInstitutions,
  getInstitutionCategories,
  getInstitutionTypes,
  getDepartments,
  getTeams,
  getUserOrgSelection,
} from "../../api/orgHierarchyApi";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../components/system/ToastProvider";

const EMPTY_FORM = { name: "", level: 0 };
const EMPTY_SCOPE = {
  institutionId: "",
  categoryId: "",
  typeId: "",
  departmentId: "",
  teamIds: [],
};

function UsergroupsPage() {
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const { showSuccess, showError } = useToast();
  const currentRole = String(currentUser?.role || "").toUpperCase();
  const isSuperAdmin = currentRole === "SUPER_ADMIN";
  const isAdmin = currentRole === "ADMIN";
  const isManager = currentRole === "MANAGER";

  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [pendingDelete, setPendingDelete] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [createPageKeys, setCreatePageKeys] = useState([]);
  const [editGroup, setEditGroup] = useState(null);
  const [editForm, setEditForm] = useState(EMPTY_FORM);
  const [editPageKeys, setEditPageKeys] = useState([]);
  const [groupMembers, setGroupMembers] = useState([]);
  const [assignableUsers, setAssignableUsers] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState("");

  const [orgSelection, setOrgSelection] = useState(null);
  const [createScope, setCreateScope] = useState(EMPTY_SCOPE);
  const [editScope, setEditScope] = useState(EMPTY_SCOPE);
  const [createInstitutions, setCreateInstitutions] = useState([]);
  const [createCategories, setCreateCategories] = useState([]);
  const [createTypes, setCreateTypes] = useState([]);
  const [createDepartments, setCreateDepartments] = useState([]);
  const [createTeams, setCreateTeams] = useState([]);
  const [editInstitutions, setEditInstitutions] = useState([]);
  const [editCategories, setEditCategories] = useState([]);
  const [editTypes, setEditTypes] = useState([]);
  const [editDepartments, setEditDepartments] = useState([]);
  const [editTeams, setEditTeams] = useState([]);
  const [orgLoading, setOrgLoading] = useState(false);

  const normalizeName = (value) =>
    String(value || "").trim().toLowerCase();

  const findById = (list, id) =>
    list.find((item) => String(item.id) === String(id));

  const findByName = (list, name) =>
    list.find((item) => normalizeName(item.name) === normalizeName(name));

  const load = async () => {
    setLoading(true);
    try {
      setRows(await getUserGroups());
    } catch (e) {
      showError(extractApiErrorMessage(e, "Failed to load user groups"));
      setRows([]);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    let isMounted = true;
    const loadOrg = async () => {
      setOrgLoading(true);
      try {
        const institutions = await getInstitutions();
        if (!isMounted) return;
        setCreateInstitutions(Array.isArray(institutions) ? institutions : []);
        setEditInstitutions(Array.isArray(institutions) ? institutions : []);
      } catch (e) {
        if (isMounted) {
          showError(extractApiErrorMessage(e, "Failed to load institutions"));
        }
      } finally {
        if (isMounted) setOrgLoading(false);
      }
    };
    loadOrg();
    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    let isMounted = true;
    const loadSelection = async () => {
      if (!currentUser?.id) return;
      try {
        const selection = await getUserOrgSelection(currentUser.id);
        if (!isMounted) return;
        setOrgSelection(selection || null);
      } catch (e) {
        if (isMounted) {
          showError(extractApiErrorMessage(e, "Failed to load user scope"));
        }
      }
    };
    loadSelection();
    return () => {
      isMounted = false;
    };
  }, [currentUser?.id]);
  const ordered = useMemo(
    () => [...rows].sort((a, b) => (a.level || 0) - (b.level || 0)),
    [rows],
  );

  const initCreateScope = () => {
    if (isSuperAdmin) {
      setCreateScope(EMPTY_SCOPE);
      return;
    }
    const selection = orgSelection || {};
    const nextScope = {
      institutionId: selection.institutionId
        ? String(selection.institutionId)
        : "",
      categoryId: selection.categoryId ? String(selection.categoryId) : "",
      typeId: selection.typeId ? String(selection.typeId) : "",
      departmentId: selection.departmentId
        ? String(selection.departmentId)
        : "",
      teamIds: selection.teamId ? [String(selection.teamId)] : [],
    };
    setCreateScope(nextScope);
  };

  const handleSave = async () => {
    if (!form.name.trim()) {
      showError("Group name is required");
      return;
    }
    const selectedInstitution = findById(
      createInstitutions,
      createScope.institutionId,
    );
    const selectedCategory = findById(
      createCategories,
      createScope.categoryId,
    );
    const selectedType = findById(createTypes, createScope.typeId);
    const selectedDepartment = findById(
      createDepartments,
      createScope.departmentId,
    );
    const selectedTeams = createTeams.filter((team) =>
      createScope.teamIds.some((id) => String(id) === String(team.id)),
    );
    if (
      !selectedInstitution ||
      !selectedCategory ||
      !selectedType ||
      !selectedDepartment
    ) {
      showError("Institution, category, type, and department are required");
      return;
    }
    if (!selectedTeams.length) {
      showError("At least one team is required");
      return;
    }
    setSaving(true);
    try {
      await createUserGroup({
        name: form.name.trim(),
        level: Number(form.level) || 0,
        institutionName: selectedInstitution.name,
        institutionCategory: selectedCategory.name,
        institutionType: selectedType.name,
        departmentName: selectedDepartment.name,
        teamNames: selectedTeams.map((team) => team.name),
        pageKeys: createPageKeys,
      });
      showSuccess("User group created");
      setShowModal(false);
      setForm(EMPTY_FORM);
      setCreateScope(EMPTY_SCOPE);
      await load();
    } catch (e) {
      showError(extractApiErrorMessage(e, "Failed to create group"));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setSaving(true);
    try {
      await deleteUserGroup(pendingDelete.id);
      showSuccess("Deleted");
      setPendingDelete(null);
      await load();
    } catch (e) {
      showError(extractApiErrorMessage(e, "Failed to delete"));
    } finally {
      setSaving(false);
    }
  };

  const openEdit = async (group) => {
    setEditGroup(group);
    setEditForm({ name: group?.name || "", level: group?.level || 0 });
    setEditPageKeys(Array.isArray(group?.pageKeys) ? group.pageKeys : []);
    setSelectedUserId("");
    setEditScope(EMPTY_SCOPE);
    setSaving(true);
    try {
      const [members, users] = await Promise.all([
        getGroupMembers(group.id),
        getAssignableUsersForGroup({ groupId: group.id }),
      ]);
      setGroupMembers(members || []);
      setAssignableUsers(users || []);
      if (editInstitutions.length) {
        const institution = findByName(
          editInstitutions,
          group?.institutionName,
        );
        const institutionId = institution?.id || "";
        let categories = [];
        if (institutionId) {
          categories = await getInstitutionCategories(institutionId);
          setEditCategories(Array.isArray(categories) ? categories : []);
        }
        const category = findByName(categories, group?.institutionCategory);
        const categoryId = category?.id || "";
        let types = [];
        if (institutionId && categoryId) {
          types = await getInstitutionTypes(institutionId, categoryId);
          setEditTypes(Array.isArray(types) ? types : []);
        }
        const type = findByName(types, group?.institutionType);
        const typeId = type?.id || "";
        let departments = [];
        if (institutionId && categoryId && typeId) {
          departments = await getDepartments(institutionId, categoryId, typeId);
          setEditDepartments(Array.isArray(departments) ? departments : []);
        }
        const department = findByName(
          departments,
          group?.departmentName,
        );
        const departmentId = department?.id || "";
        let teams = [];
        if (institutionId && categoryId && typeId && departmentId) {
          teams = await getTeams(
            institutionId,
            categoryId,
            typeId,
            departmentId,
          );
          setEditTeams(Array.isArray(teams) ? teams : []);
        }
        const teamIds = Array.isArray(group?.teamNames)
          ? teams
              .filter((team) =>
                group.teamNames.some(
                  (name) => normalizeName(name) === normalizeName(team.name),
                ),
              )
              .map((team) => String(team.id))
          : [];
        setEditScope({
          institutionId: String(institutionId || ""),
          categoryId: String(categoryId || ""),
          typeId: String(typeId || ""),
          departmentId: String(departmentId || ""),
          teamIds,
        });
      } else if (orgSelection) {
        setEditScope({
          institutionId: String(orgSelection.institutionId || ""),
          categoryId: String(orgSelection.categoryId || ""),
          typeId: String(orgSelection.typeId || ""),
          departmentId: String(orgSelection.departmentId || ""),
          teamIds: orgSelection.teamId ? [String(orgSelection.teamId)] : [],
        });
      }
    } catch (e) {
      showError(extractApiErrorMessage(e, "Failed to load group"));
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateGroup = async () => {
    if (!editGroup?.id) return;
    if (!editForm.name.trim()) {
      showError("Group name is required");
      return;
    }
    const selectedInstitution = findById(
      editInstitutions,
      editScope.institutionId,
    );
    const selectedCategory = findById(editCategories, editScope.categoryId);
    const selectedType = findById(editTypes, editScope.typeId);
    const selectedDepartment = findById(
      editDepartments,
      editScope.departmentId,
    );
    const selectedTeams = editTeams.filter((team) =>
      editScope.teamIds.some((id) => String(id) === String(team.id)),
    );
    if (
      !selectedInstitution ||
      !selectedCategory ||
      !selectedType ||
      !selectedDepartment
    ) {
      showError("Institution, category, type, and department are required");
      return;
    }
    if (!selectedTeams.length) {
      showError("At least one team is required");
      return;
    }
    setSaving(true);
    try {
      await updateUserGroup(editGroup.id, {
        name: editForm.name.trim(),
        level: Number(editForm.level) || 0,
        institutionName: selectedInstitution.name,
        institutionCategory: selectedCategory.name,
        institutionType: selectedType.name,
        departmentName: selectedDepartment.name,
        teamNames: selectedTeams.map((team) => team.name),
        pageKeys: editPageKeys,
      });
      showSuccess("Group updated");
      setEditGroup(null);
      await load();
    } catch (e) {
      showError(extractApiErrorMessage(e, "Failed to update group"));
    } finally {
      setSaving(false);
    }
  };

  const handleAddMember = async () => {
    if (!editGroup?.id || !selectedUserId) return;
    setSaving(true);
    try {
      await addGroupMember(editGroup.id, selectedUserId);
      const [members, users] = await Promise.all([
        getGroupMembers(editGroup.id),
        getAssignableUsersForGroup({ groupId: editGroup.id }),
      ]);
      setGroupMembers(members || []);
      setAssignableUsers(users || []);
      setSelectedUserId("");
      showSuccess("Member added");
    } catch (e) {
      showError(extractApiErrorMessage(e, "Failed to add member"));
    } finally {
      setSaving(false);
    }
  };

  const handleRemoveMember = async (userId) => {
    if (!editGroup?.id || !userId) return;
    setSaving(true);
    try {
      await removeGroupMember(editGroup.id, userId);
      const [members, users] = await Promise.all([
        getGroupMembers(editGroup.id),
        getAssignableUsersForGroup({ groupId: editGroup.id }),
      ]);
      setGroupMembers(members || []);
      setAssignableUsers(users || []);
      showSuccess("Member removed");
    } catch (e) {
      showError(extractApiErrorMessage(e, "Failed to remove member"));
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    let isMounted = true;
    const loadCategories = async () => {
      if (!createScope.institutionId) {
        setCreateCategories([]);
        return;
      }
      try {
        const data = await getInstitutionCategories(createScope.institutionId);
        if (!isMounted) return;
        setCreateCategories(Array.isArray(data) ? data : []);
      } catch (e) {
        if (isMounted) {
          showError(extractApiErrorMessage(e, "Failed to load categories"));
        }
      }
    };
    loadCategories();
    return () => {
      isMounted = false;
    };
  }, [createScope.institutionId]);

  useEffect(() => {
    let isMounted = true;
    const loadTypes = async () => {
      if (!createScope.institutionId || !createScope.categoryId) {
        setCreateTypes([]);
        return;
      }
      try {
        const data = await getInstitutionTypes(
          createScope.institutionId,
          createScope.categoryId,
        );
        if (!isMounted) return;
        setCreateTypes(Array.isArray(data) ? data : []);
      } catch (e) {
        if (isMounted) {
          showError(extractApiErrorMessage(e, "Failed to load types"));
        }
      }
    };
    loadTypes();
    return () => {
      isMounted = false;
    };
  }, [createScope.institutionId, createScope.categoryId]);

  useEffect(() => {
    let isMounted = true;
    const loadDepartments = async () => {
      if (
        !createScope.institutionId ||
        !createScope.categoryId ||
        !createScope.typeId
      ) {
        setCreateDepartments([]);
        return;
      }
      try {
        const data = await getDepartments(
          createScope.institutionId,
          createScope.categoryId,
          createScope.typeId,
        );
        if (!isMounted) return;
        setCreateDepartments(Array.isArray(data) ? data : []);
      } catch (e) {
        if (isMounted) {
          showError(extractApiErrorMessage(e, "Failed to load departments"));
        }
      }
    };
    loadDepartments();
    return () => {
      isMounted = false;
    };
  }, [createScope.institutionId, createScope.categoryId, createScope.typeId]);

  useEffect(() => {
    let isMounted = true;
    const loadTeams = async () => {
      if (
        !createScope.institutionId ||
        !createScope.categoryId ||
        !createScope.typeId ||
        !createScope.departmentId
      ) {
        setCreateTeams([]);
        return;
      }
      try {
        const data = await getTeams(
          createScope.institutionId,
          createScope.categoryId,
          createScope.typeId,
          createScope.departmentId,
        );
        if (!isMounted) return;
        setCreateTeams(Array.isArray(data) ? data : []);
      } catch (e) {
        if (isMounted) {
          showError(extractApiErrorMessage(e, "Failed to load teams"));
        }
      }
    };
    loadTeams();
    return () => {
      isMounted = false;
    };
  }, [
    createScope.institutionId,
    createScope.categoryId,
    createScope.typeId,
    createScope.departmentId,
  ]);

  useEffect(() => {
    let isMounted = true;
    const loadCategories = async () => {
      if (!editScope.institutionId) {
        setEditCategories([]);
        return;
      }
      try {
        const data = await getInstitutionCategories(editScope.institutionId);
        if (!isMounted) return;
        setEditCategories(Array.isArray(data) ? data : []);
      } catch (e) {
        if (isMounted) {
          showError(extractApiErrorMessage(e, "Failed to load categories"));
        }
      }
    };
    loadCategories();
    return () => {
      isMounted = false;
    };
  }, [editScope.institutionId]);

  useEffect(() => {
    let isMounted = true;
    const loadTypes = async () => {
      if (!editScope.institutionId || !editScope.categoryId) {
        setEditTypes([]);
        return;
      }
      try {
        const data = await getInstitutionTypes(
          editScope.institutionId,
          editScope.categoryId,
        );
        if (!isMounted) return;
        setEditTypes(Array.isArray(data) ? data : []);
      } catch (e) {
        if (isMounted) {
          showError(extractApiErrorMessage(e, "Failed to load types"));
        }
      }
    };
    loadTypes();
    return () => {
      isMounted = false;
    };
  }, [editScope.institutionId, editScope.categoryId]);

  useEffect(() => {
    let isMounted = true;
    const loadDepartments = async () => {
      if (
        !editScope.institutionId ||
        !editScope.categoryId ||
        !editScope.typeId
      ) {
        setEditDepartments([]);
        return;
      }
      try {
        const data = await getDepartments(
          editScope.institutionId,
          editScope.categoryId,
          editScope.typeId,
        );
        if (!isMounted) return;
        setEditDepartments(Array.isArray(data) ? data : []);
      } catch (e) {
        if (isMounted) {
          showError(extractApiErrorMessage(e, "Failed to load departments"));
        }
      }
    };
    loadDepartments();
    return () => {
      isMounted = false;
    };
  }, [editScope.institutionId, editScope.categoryId, editScope.typeId]);

  useEffect(() => {
    let isMounted = true;
    const loadTeams = async () => {
      if (
        !editScope.institutionId ||
        !editScope.categoryId ||
        !editScope.typeId ||
        !editScope.departmentId
      ) {
        setEditTeams([]);
        return;
      }
      try {
        const data = await getTeams(
          editScope.institutionId,
          editScope.categoryId,
          editScope.typeId,
          editScope.departmentId,
        );
        if (!isMounted) return;
        setEditTeams(Array.isArray(data) ? data : []);
      } catch (e) {
        if (isMounted) {
          showError(extractApiErrorMessage(e, "Failed to load teams"));
        }
      }
    };
    loadTeams();
    return () => {
      isMounted = false;
    };
  }, [
    editScope.institutionId,
    editScope.categoryId,
    editScope.typeId,
    editScope.departmentId,
  ]);

  return (
    <div className="container-fluid">
      <div className="card">
        <div className="card-header">
          <div className="row align-items-center">
            <div className="col-8">
              <h4 className="f-w-700 mb-0">User Groups</h4>
            </div>
            <div className="col-4 text-end">
              <button
                className="btn btn-primary"
                onClick={() => {
                  setForm(EMPTY_FORM);
                  setCreatePageKeys([]);
                  initCreateScope();
                  setShowModal(true);
                }}
              >
                + Add Group
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-body">
          <h5 className="mb-3">User Groups List</h5>
          <div className="table-responsive">
            <table className="table table-striped table-bordered table-hover">
              <thead className="table-dark">
                <tr>
                  <th>#</th>
                  <th>Group Name</th>
                  <th>Level</th>
                  <th>Members</th>
                  <th>Department</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={6}>Loading...</td>
                  </tr>
                ) : ordered.length === 0 ? (
                  <tr>
                    <td colSpan={6}>No user groups found</td>
                  </tr>
                ) : (
                  ordered.map((r, i) => (
                    <tr key={r.id}>
                      <td>{i + 1}</td>
                      <td>{r.name || "-"}</td>
                      <td>{r.level ?? "-"}</td>
                      <td>{r.members ?? "-"}</td>
                  <td>{r.departmentName || "-"}</td>
                  <td>
                        <button
                          className="btn btn-sm btn-outline-primary me-2"
                          onClick={() =>
                            navigate(`/usergroups/edit/${r.id}`, {
                              state: { group: r },
                            })
                          }
                        >
                          Edit
                        </button>
                        {r.canDelete !== false && (
                          <button
                            className="btn btn-sm btn-danger"
                            onClick={() => setPendingDelete(r)}
                          >
                            Delete
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
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
            <div className="modal-dialog">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">Add User Group</h5>
                  <button
                    className="btn-close"
                    onClick={() => setShowModal(false)}
                  />
                </div>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label">Group Name *</label>
                    <input
                      className="form-control"
                      value={form.name}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, name: e.target.value }))
                      }
                      placeholder="Group name"
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Level</label>
                    <input
                      type="number"
                      className="form-control"
                      value={form.level}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, level: e.target.value }))
                      }
                      placeholder="0"
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Institution</label>
                    <select
                      className="form-select"
                      value={createScope.institutionId}
                      onChange={(e) =>
                        setCreateScope((prev) => ({
                          ...prev,
                          institutionId: e.target.value,
                          categoryId: "",
                          typeId: "",
                          departmentId: "",
                          teamIds: [],
                        }))
                      }
                      disabled={orgLoading || isAdmin || isManager}
                    >
                      <option value="">Select Institution</option>
                      {createInstitutions.map((item) => (
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
                      value={createScope.categoryId}
                      onChange={(e) =>
                        setCreateScope((prev) => ({
                          ...prev,
                          categoryId: e.target.value,
                          typeId: "",
                          departmentId: "",
                          teamIds: [],
                        }))
                      }
                      disabled={
                        orgLoading ||
                        !createScope.institutionId ||
                        isAdmin ||
                        isManager
                      }
                    >
                      <option value="">Select Category</option>
                      {createCategories.map((item) => (
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
                      value={createScope.typeId}
                      onChange={(e) =>
                        setCreateScope((prev) => ({
                          ...prev,
                          typeId: e.target.value,
                          departmentId: "",
                          teamIds: [],
                        }))
                      }
                      disabled={
                        orgLoading ||
                        !createScope.categoryId ||
                        isAdmin ||
                        isManager
                      }
                    >
                      <option value="">Select Type</option>
                      {createTypes.map((item) => (
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
                      value={createScope.departmentId}
                      onChange={(e) =>
                        setCreateScope((prev) => ({
                          ...prev,
                          departmentId: e.target.value,
                          teamIds: [],
                        }))
                      }
                      disabled={
                        orgLoading ||
                        !createScope.typeId ||
                        isAdmin ||
                        isManager
                      }
                    >
                      <option value="">Select Department</option>
                      {createDepartments.map((item) => (
                        <option key={item.id} value={item.id}>
                          {item.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Teams</label>
                    <div className="d-flex gap-2">
                      <select
                        className="form-select"
                        value=""
                        onChange={(e) => {
                          const teamId = e.target.value;
                          if (teamId && !createScope.teamIds.includes(teamId)) {
                            setCreateScope((prev) => ({
                              ...prev,
                              teamIds: [...prev.teamIds, teamId],
                            }));
                          }
                          e.target.value = "";
                        }}
                        disabled={
                          orgLoading ||
                          !createScope.departmentId ||
                          isManager
                        }
                      >
                        <option value="">Select Team</option>
                        {createTeams
                          .filter((item) => !createScope.teamIds.includes(String(item.id)))
                          .map((item) => (
                            <option key={item.id} value={item.id}>
                              {item.name}
                            </option>
                          ))}
                      </select>
                    </div>
                    {createScope.teamIds.length > 0 && (
                      <div className="mt-2 d-flex flex-wrap gap-2">
                        {createScope.teamIds.map((teamId) => {
                          const team = createTeams.find((t) => String(t.id) === String(teamId));
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
                                  setCreateScope((prev) => ({
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
                    {isManager && (
                      <small className="text-muted d-block mt-1">
                        Manager can only create groups for their own team.
                      </small>
                    )}
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

      {pendingDelete && (
        <>
          <div
            className="modal fade show"
            style={{ display: "block" }}
            tabIndex="-1"
          >
            <div className="modal-dialog modal-sm">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">Delete Group</h5>
                  <button
                    className="btn-close"
                    onClick={() => setPendingDelete(null)}
                  />
                </div>
                <div className="modal-body">
                  <p>
                    Delete <strong>{pendingDelete.name}</strong>?
                  </p>
                </div>
                <div className="modal-footer">
                  <button
                    className="btn btn-light"
                    onClick={() => setPendingDelete(null)}
                    disabled={saving}
                  >
                    Cancel
                  </button>
                  <button
                    className="btn btn-danger"
                    onClick={handleDelete}
                    disabled={saving}
                  >
                    {saving ? "Deleting..." : "Delete"}
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div className="modal-backdrop fade show" />
        </>
      )}

      {editGroup && (
        <>
          <div
            className="modal fade show"
            style={{ display: "block" }}
            tabIndex="-1"
          >
            <div className="modal-dialog modal-lg">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">Edit Group</h5>
                  <button
                    className="btn-close"
                    onClick={() => setEditGroup(null)}
                  />
                </div>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label">Group Name</label>
                    <input
                      className="form-control"
                      value={editForm.name}
                      onChange={(e) =>
                        setEditForm((prev) => ({
                          ...prev,
                          name: e.target.value,
                        }))
                      }
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Group Level</label>
                    <input
                      type="number"
                      className="form-control"
                      value={editForm.level}
                      onChange={(e) =>
                        setEditForm((prev) => ({
                          ...prev,
                          level: e.target.value,
                        }))
                      }
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Institution</label>
                    <select
                      className="form-select"
                      value={editScope.institutionId}
                      onChange={(e) =>
                        setEditScope((prev) => ({
                          ...prev,
                          institutionId: e.target.value,
                          categoryId: "",
                          typeId: "",
                          departmentId: "",
                          teamIds: [],
                        }))
                      }
                      disabled={orgLoading || isAdmin || isManager}
                    >
                      <option value="">Select Institution</option>
                      {editInstitutions.map((item) => (
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
                      value={editScope.categoryId}
                      onChange={(e) =>
                        setEditScope((prev) => ({
                          ...prev,
                          categoryId: e.target.value,
                          typeId: "",
                          departmentId: "",
                          teamIds: [],
                        }))
                      }
                      disabled={
                        orgLoading ||
                        !editScope.institutionId ||
                        isAdmin ||
                        isManager
                      }
                    >
                      <option value="">Select Category</option>
                      {editCategories.map((item) => (
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
                      value={editScope.typeId}
                      onChange={(e) =>
                        setEditScope((prev) => ({
                          ...prev,
                          typeId: e.target.value,
                          departmentId: "",
                          teamIds: [],
                        }))
                      }
                      disabled={
                        orgLoading ||
                        !editScope.categoryId ||
                        isAdmin ||
                        isManager
                      }
                    >
                      <option value="">Select Type</option>
                      {editTypes.map((item) => (
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
                      value={editScope.departmentId}
                      onChange={(e) =>
                        setEditScope((prev) => ({
                          ...prev,
                          departmentId: e.target.value,
                          teamIds: [],
                        }))
                      }
                      disabled={
                        orgLoading ||
                        !editScope.typeId ||
                        isAdmin ||
                        isManager
                      }
                    >
                      <option value="">Select Department</option>
                      {editDepartments.map((item) => (
                        <option key={item.id} value={item.id}>
                          {item.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Teams</label>
                    <select
                      className="form-select"
                      multiple
                      value={editScope.teamIds}
                      onChange={(e) =>
                        setEditScope((prev) => ({
                          ...prev,
                          teamIds: Array.from(
                            e.target.selectedOptions,
                            (opt) => opt.value,
                          ),
                        }))
                      }
                      disabled={
                        orgLoading ||
                        !editScope.departmentId ||
                        isManager
                      }
                      style={{ minHeight: 120 }}
                    >
                      {editTeams.map((item) => (
                        <option key={item.id} value={item.id}>
                          {item.name}
                        </option>
                      ))}
                    </select>
                    {isManager && (
                      <small className="text-muted d-block mt-1">
                        Manager can only keep their own team.
                      </small>
                    )}
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
                          .filter(
                            (user) =>
                              !groupMembers.some(
                                (member) =>
                                  String(member.userId) === String(user.id),
                              ),
                          )
                          .map((user) => (
                            <option key={user.id} value={user.id}>
                              {user.username}
                            </option>
                          ))}
                      </select>
                      <button
                        className="btn btn-primary"
                        onClick={handleAddMember}
                        disabled={!selectedUserId || saving}
                      >
                        Add
                      </button>
                    </div>
                  </div>
                  <div className="table-responsive">
                    <table className="table table-bordered">
                      <thead className="table-light">
                        <tr>
                          <th>Username</th>
                          <th className="text-end">Remove</th>
                        </tr>
                      </thead>
                      <tbody>
                        {groupMembers.length === 0 ? (
                          <tr>
                            <td colSpan={2}>No members</td>
                          </tr>
                        ) : (
                          groupMembers.map((member) => (
                            <tr key={member.userId}>
                              <td>{member.username || "-"}</td>
                              <td className="text-end">
                                <button
                                  className="btn btn-sm btn-outline-danger"
                                  onClick={() =>
                                    handleRemoveMember(member.userId)
                                  }
                                  disabled={saving}
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
                <div className="modal-footer">
                  <button
                    className="btn btn-light"
                    onClick={() => setEditGroup(null)}
                    disabled={saving}
                  >
                    Cancel
                  </button>
                  <button
                    className="btn btn-primary"
                    onClick={handleUpdateGroup}
                    disabled={saving}
                  >
                    {saving ? "Saving..." : "Edit Group"}
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
export default UsergroupsPage;
