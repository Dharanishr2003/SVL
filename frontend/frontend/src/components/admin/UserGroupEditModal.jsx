import { motion, useReducedMotion } from "motion/react";
import "./UserGroupEditModal.css";

function TeamBadgeList({ teamIds, teams, onRemove }) {
  const shouldReduceMotion = useReducedMotion();

  if (!teamIds.length) return null;

  return (
    <div className="mt-2 d-flex flex-wrap gap-2">
      {teamIds.map((teamId) => {
        const team = teams.find((item) => String(item.id) === String(teamId));
        return (
          <motion.span
            key={teamId}
            layout
            initial={shouldReduceMotion ? false : { opacity: 0, scale: 0.92, y: 6 }}
            animate={shouldReduceMotion ? {} : { opacity: 1, scale: 1, y: 0 }}
            exit={shouldReduceMotion ? {} : { opacity: 0, scale: 0.9, y: -6 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            className="badge bg-primary d-inline-flex align-items-center gap-2 user-group-team-badge"
            style={{ fontSize: "0.875rem", padding: "0.5rem 0.75rem" }}
          >
            {team?.name || teamId}
            <i className="ti ti-x" style={{ cursor: "pointer" }} onClick={() => onRemove(teamId)}></i>
          </motion.span>
        );
      })}
    </div>
  );
}

export default function UserGroupEditModal({
  form,
  onFormChange,
  scope,
  onScopeChange,
  institutions,
  departments,
  teams,
  orgLoading,
  isAdmin,
  isManager,
  isTeamLead,
  onMemberScopeChange,
  selectedUserId,
  onUserSelect,
  assignableUsers,
  members,
  onAddMember,
  onRemoveMember,
  onSave,
  onDelete,
  loading,
  groupName,
}) {
  const shouldReduceMotion = useReducedMotion();
  const memberScope = String(scope?.memberScope || "NONE").toUpperCase();
  const lockDepartment = memberScope === "ADMINS";
  const lockTeam = memberScope === "ADMINS" || memberScope === "MANAGERS";

  return (
    <motion.div
      className="user-group-edit-modal"
      initial={shouldReduceMotion ? false : { opacity: 0, y: 12 }}
      animate={shouldReduceMotion ? {} : { opacity: 1, y: 0 }}
      exit={shouldReduceMotion ? {} : { opacity: 0, y: -12 }}
      transition={{ duration: 0.22 }}
    >
      <motion.div
        initial={shouldReduceMotion ? false : { opacity: 0, y: 8 }}
        animate={shouldReduceMotion ? {} : { opacity: 1, y: 0 }}
        transition={{ duration: 0.2, delay: 0.05 }}
      >
        <div className="row g-3">
          <div className="col-md-6">
            <label className="form-label">Group Name</label>
            <input
              className="form-control user-group-edit-input"
              value={form.name}
              onChange={(e) => onFormChange({ ...form, name: e.target.value })}
            />
          </div>
          <div className="col-md-6">
            <label className="form-label">Member Scope</label>
            <select
              className="form-select user-group-edit-input"
              value={memberScope}
              onChange={(e) =>
                onMemberScopeChange?.(String(e.target.value || "NONE").toUpperCase())
              }
            >
              <option value="NONE">Custom</option>
              <option value="ADMINS">Admins Only</option>
              <option value="MANAGERS">Managers Only</option>
              <option value="TEAM_LEADS">Team Leads Only</option>
              <option value="EMPLOYEES">Employees Only</option>
            </select>
          </div>
          <div className="col-md-6">
            <label className="form-label">Branch</label>
            <select
              className="form-select user-group-edit-input"
              value={scope.institutionId}
              onChange={(e) =>
                onScopeChange({
                  institutionId: e.target.value,
                  departmentId: "",
                  teamIds: [],
                })
              }
              disabled={orgLoading || isAdmin || isManager || isTeamLead}
            >
              <option value="">Select Branch</option>
              {institutions.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </select>
          </div>
          <div className="col-md-6">
            <label className="form-label">Department</label>
            <select
              className="form-select user-group-edit-input"
              value={scope.departmentId}
              onChange={(e) =>
                onScopeChange({
                  ...scope,
                  departmentId: e.target.value,
                  teamIds: [],
                })
              }
              disabled={orgLoading || !scope.institutionId || isAdmin || isManager || isTeamLead || lockDepartment}
            >
              <option value="">Select Department</option>
              {departments.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </select>
          </div>
          <div className="col-12">
            <label className="form-label">Teams</label>
            <div className="d-flex gap-2">
              <select
                className="form-select user-group-edit-input"
                value=""
                onChange={(e) => {
                  const teamId = e.target.value;
                  if (teamId && !scope.teamIds.includes(teamId)) {
                    onScopeChange({
                      ...scope,
                      teamIds: [...scope.teamIds, teamId],
                    });
                  }
                  e.target.value = "";
                }}
                disabled={orgLoading || !scope.departmentId || isManager || isTeamLead || lockTeam}
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
            <TeamBadgeList
              teamIds={scope.teamIds}
              teams={teams}
              onRemove={(teamId) =>
                onScopeChange({
                  ...scope,
                  teamIds: scope.teamIds.filter((item) => item !== teamId),
                })
              }
            />
          </div>
        </div>
      </motion.div>

      <motion.div
        className="user-group-members-section"
        initial={shouldReduceMotion ? false : { opacity: 0, y: 8 }}
        animate={shouldReduceMotion ? {} : { opacity: 1, y: 0 }}
        transition={{ duration: 0.2, delay: 0.1 }}
      >
        <div className="mb-3">
          <label className="form-label">Add Users</label>
          <div className="d-flex gap-2">
            <select
              className="form-select user-group-edit-input"
              value={selectedUserId}
              onChange={(e) => onUserSelect(e.target.value)}
            >
              <option value="">Select Add Users</option>
              {assignableUsers
                .filter((userItem) => !members.some((member) => String(member.userId) === String(userItem.id)))
                .map((userItem) => (
                  <option key={userItem.id} value={userItem.id}>
                    {userItem.username} ({userItem.role || "USER"})
                  </option>
                ))}
            </select>
            <button className="btn btn-primary" onClick={onAddMember} disabled={!selectedUserId || loading}>
              Add
            </button>
          </div>
        </div>

        <div className="table-responsive user-group-members-table">
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
                <tr>
                  <td colSpan={3}>No members</td>
                </tr>
              ) : (
                members.map((member) => (
                  <tr key={member.userId}>
                    <td>{member.username || "-"}</td>
                    <td>{member.role || "-"}</td>
                    <td className="text-end">
                      <button
                        className="btn btn-sm btn-outline-danger"
                        onClick={() => onRemoveMember(member.userId)}
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
      </motion.div>

      <motion.div
        className="user-group-edit-actions"
        initial={shouldReduceMotion ? false : { opacity: 0, y: 8 }}
        animate={shouldReduceMotion ? {} : { opacity: 1, y: 0 }}
        transition={{ duration: 0.2, delay: 0.15 }}
      >
        <button className="btn btn-danger" onClick={onDelete} disabled={loading}>
          Delete Group
        </button>
        <button className="btn btn-primary" onClick={onSave} disabled={loading}>
          {loading ? "Saving..." : "Save Group"}
        </button>
      </motion.div>
    </motion.div>
  );
}
