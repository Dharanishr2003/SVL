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
  getInstitutions,
  getTeams,
  getUserOrgSelection,
} from "../../api/orgHierarchyApi";
import { extractApiErrorMessage } from "../../utils/errorMessage";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../components/system/ToastProvider";
import ConfirmDialog from "../../components/system/ConfirmDialog";
import UserGroupEditModal from "../../components/admin/UserGroupEditModal";

const EMPTY_SCOPE = {
  institutionId: "",
  departmentId: "",
  teamIds: [],
  memberScope: "NONE",
};

export default function UserGroupEditPage() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const currentRole = String(currentUser?.role || "").toUpperCase();
  const isAdmin = currentRole === "ADMIN";
  const isManager = currentRole === "MANAGER";
  const isTeamLead = currentRole === "TEAM_LEAD";
  const { showSuccess, showError } = useToast();

  const [group, setGroup] = useState(location.state?.group || null);
  const [form, setForm] = useState({ name: "" });
  const [scope, setScope] = useState(EMPTY_SCOPE);
  const [orgSelection, setOrgSelection] = useState(null);
  const [institutions, setInstitutions] = useState([]);
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
  const selectedMemberScope = String(group?.memberScope || "NONE").toUpperCase();

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
  }, [currentUser?.id, showError]);

  useEffect(() => {
    let isMounted = true;
    const loadGroup = async () => {
      if (group) {
        setForm({ name: group.name || "" });
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
        setForm({ name: found.name || "" });
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
  }, [group, id, showError]);

  useEffect(() => {
    let isMounted = true;
    const hydrateScope = async () => {
      if (!group || !institutions.length) return;
      try {
        const institution = findByName(institutions, group.institutionName);
        const institutionId = institution?.id ? String(institution.id) : "";
        if (!institutionId) return;
        const departmentRows = await getDepartments(institutionId);
        if (!isMounted) return;
        setDepartments(Array.isArray(departmentRows) ? departmentRows : []);
        const department = findByName(departmentRows, group.departmentName);
        const departmentId = department?.id ? String(department.id) : "";
        if (!departmentId) {
          setScope((prev) => ({ ...prev, institutionId }));
          return;
        }
        const teamRows = await getTeams(institutionId, departmentId);
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
  }, [group, institutions, showError]);

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
  }, [group?.id, showError]);

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
  }, [group?.id, selectedTeamNames, showError]);

  useEffect(() => {
    let isMounted = true;
    const run = async () => {
      if (!scope.institutionId) {
        setDepartments([]);
        return;
      }
      try {
        const rows = await getDepartments(scope.institutionId);
        if (isMounted) setDepartments(Array.isArray(rows) ? rows : []);
      } catch (e) {
        if (isMounted) showError(extractApiErrorMessage(e, "Failed to load departments"));
      }
    };
    run();
    return () => {
      isMounted = false;
    };
  }, [scope.institutionId, showError]);

  useEffect(() => {
    let isMounted = true;
    const run = async () => {
      if (!scope.institutionId || !scope.departmentId) {
        setTeams([]);
        return;
      }
      try {
        const rows = await getTeams(scope.institutionId, scope.departmentId);
        if (isMounted) setTeams(Array.isArray(rows) ? rows : []);
      } catch (e) {
        if (isMounted) showError(extractApiErrorMessage(e, "Failed to load teams"));
      }
    };
    run();
    return () => {
      isMounted = false;
    };
  }, [scope.institutionId, scope.departmentId, showError]);

  useEffect(() => {
    if (!orgSelection) return;
    if (currentRole === "SUPER_ADMIN") return;
    setScope((prev) => ({
      ...prev,
      institutionId: String(orgSelection.institutionId || prev.institutionId || ""),
      departmentId: String(orgSelection.departmentId || prev.departmentId || ""),
      teamIds:
        (currentRole === "MANAGER" || currentRole === "TEAM_LEAD") && orgSelection.teamId
          ? [String(orgSelection.teamId)]
          : prev.teamIds,
    }));
  }, [orgSelection, currentRole]);

  const handleMemberScopeChange = (nextScope) => {
    const scopeKey = String(nextScope || "NONE").toUpperCase();
    setGroup((prev) => (prev ? { ...prev, memberScope: scopeKey } : prev));
    setScope((prev) => {
      const next = {
        ...prev,
        memberScope: scopeKey,
      };
      if (scopeKey === "ADMINS") {
        next.departmentId = "";
        next.teamIds = [];
      } else if (scopeKey === "MANAGERS") {
        next.teamIds = [];
      }
      return next;
    });
  };

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
    setMembers(Array.isArray(memberRows) ? memberRows : []);
    setAssignableUsers(Array.isArray(userRows) ? userRows : []);
  };

  const handleSave = async () => {
    if (!group?.id) return;
    if (!form.name.trim()) {
      showError("Group name is required");
      return;
    }
    if (!selectedInstitution || !selectedDepartment) {
      if (selectedMemberScope === "ADMINS") {
        if (!selectedInstitution) {
          showError("Branch is required");
          return;
        }
      } else if (selectedMemberScope === "MANAGERS") {
        if (!selectedInstitution || !selectedDepartment) {
          showError("Branch and department are required");
          return;
        }
      } else {
        showError("Branch and department are required");
        return;
      }
    }
    if (selectedMemberScope !== "ADMINS" && selectedMemberScope !== "MANAGERS" && currentRole !== "SUPER_ADMIN" && !selectedTeams.length) {
      showError("At least one team is required");
      return;
    }
    setLoading(true);
    try {
      const updated = await updateUserGroup(group.id, {
        name: form.name.trim(),
        institutionName: selectedInstitution.name,
        departmentName: selectedDepartment?.name || "",
        teamNames: selectedMemberScope === "ADMINS" || selectedMemberScope === "MANAGERS" ? [] : selectedTeams.map((team) => team.name),
        pageKeys: Array.isArray(group?.pageKeys) ? group.pageKeys : [],
        memberScope: selectedMemberScope,
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
          <UserGroupEditModal
            form={form}
            onFormChange={setForm}
            scope={{ ...scope, memberScope: selectedMemberScope }}
            onScopeChange={setScope}
            onMemberScopeChange={handleMemberScopeChange}
            institutions={institutions}
            departments={departments}
            teams={teams}
            orgLoading={orgLoading}
            isAdmin={isAdmin}
            isManager={isManager}
            isTeamLead={isTeamLead}
            selectedUserId={selectedUserId}
            onUserSelect={setSelectedUserId}
            assignableUsers={assignableUsers}
            members={members}
            onAddMember={handleAddMember}
            onRemoveMember={handleRemoveMember}
            onSave={handleSave}
            onDelete={() => setShowDeleteConfirm(true)}
            loading={loading}
            groupName={group?.name}
          />
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
