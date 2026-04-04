import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import "./UserGroupWizardModal.css";

function TeamBadgeList({ teamIds, teams, onRemove }) {
  const shouldReduceMotion = useReducedMotion();

  if (!teamIds.length) return null;

  return (
    <div className="mt-2 d-flex flex-wrap gap-2">
      <AnimatePresence initial={false}>
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
      </AnimatePresence>
    </div>
  );
}

export default function UserGroupWizardModal({
  title,
  icon,
  stepLabel,
  formName,
  onFormNameChange,
  scope,
  onScopeChange,
  institutions,
  departments,
  teams,
  selectedTeamId = "",
  onTeamSelect,
  onTeamRemove,
  orgLoading,
  disableBranch = false,
  disableDepartment = false,
  disableTeam = false,
  onMemberScopeChange,
  errorMessage = "",
  onClose,
  onSubmit,
  submitLabel,
  saving,
  isEdit = false,
  memberSection = null,
}) {
  const shouldReduceMotion = useReducedMotion();
  const memberScope = String(scope?.memberScope || "NONE").toUpperCase();
  const scopeLabel = {
    NONE: "Custom",
    ADMINS: "Admins Only",
    MANAGERS: "Managers Only",
    TEAM_LEADS: "Team Leads Only",
    EMPLOYEES: "Employees Only",
  };
  const lockBranch = disableBranch;
  const lockDepartment = disableDepartment || memberScope === "ADMINS";
  const lockTeam = disableTeam || memberScope === "ADMINS" || memberScope === "MANAGERS";

  return (
    <>
      <motion.div
        className="modal fade show"
        style={{ display: "block" }}
        tabIndex="-1"
        initial={shouldReduceMotion ? false : { opacity: 0 }}
        animate={shouldReduceMotion ? {} : { opacity: 1 }}
        exit={shouldReduceMotion ? {} : { opacity: 0 }}
        transition={{ duration: 0.18 }}
      >
        <motion.div
          className="modal-dialog modal-lg"
          initial={shouldReduceMotion ? false : { opacity: 0, y: 18, scale: 0.98 }}
          animate={shouldReduceMotion ? {} : { opacity: 1, y: 0, scale: 1 }}
          exit={shouldReduceMotion ? {} : { opacity: 0, y: 12, scale: 0.98 }}
          transition={{ duration: 0.22, ease: "easeOut" }}
        >
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">{title}</h5>
              <button className="btn-close" onClick={onClose} />
            </div>
            <div className={`user-group-wizard${isEdit ? " is-edit" : ""}`}>
              <div className="wizard-progress-bar">
                <motion.div
                  className="wizard-progress"
                  initial={shouldReduceMotion ? false : { width: "0%" }}
                  animate={shouldReduceMotion ? {} : { width: "100%" }}
                  transition={{ duration: 0.35, ease: "easeOut" }}
                />
              </div>
              <motion.div
                className="wizard-circles-container"
                initial={shouldReduceMotion ? false : { opacity: 0, y: 10 }}
                animate={shouldReduceMotion ? {} : { opacity: 1, y: 0 }}
                transition={{ duration: 0.2, delay: 0.05 }}
              >
                <div className="wizard-circle-item">
                  <motion.div
                    className="wizard-circle"
                    initial={shouldReduceMotion ? false : { scale: 0.94 }}
                    animate={shouldReduceMotion ? {} : { scale: 1 }}
                    transition={{ duration: 0.2, delay: 0.08 }}
                  >
                    <i className={icon} />
                  </motion.div>
                  <div className="wizard-circle-label">{stepLabel}</div>
                </div>
              </motion.div>

              <motion.div
                className="wizard-step-content"
                initial={shouldReduceMotion ? false : { opacity: 0, y: 12 }}
                animate={shouldReduceMotion ? {} : { opacity: 1, y: 0 }}
                transition={{ duration: 0.22, delay: 0.1 }}
              >
                <motion.div
                  className="wizard-form-grid"
                  initial={shouldReduceMotion ? false : { opacity: 0, y: 10 }}
                  animate={shouldReduceMotion ? {} : { opacity: 1, y: 0 }}
                  transition={{ duration: 0.2, delay: 0.12 }}
                >
                  <div className="mb-3">
                    <label className="form-label">Group Name</label>
                    <input className="form-control" value={formName} onChange={(e) => onFormNameChange(e.target.value)} />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Member Scope</label>
                    <select
                      className="form-select"
                      value={memberScope}
                      onChange={(e) => onMemberScopeChange?.(String(e.target.value || "NONE").toUpperCase())}
                    >
                      <option value="NONE">Custom</option>
                      <option value="ADMINS">Admins Only</option>
                      <option value="MANAGERS">Managers Only</option>
                      <option value="TEAM_LEADS">Team Leads Only</option>
                      <option value="EMPLOYEES">Employees Only</option>
                    </select>
                    <small className="text-muted">{scopeLabel[memberScope] || "Custom"}</small>
                  </div>
                  {errorMessage ? <div className="alert alert-danger py-2">{errorMessage}</div> : null}
                  <div className="mb-3">
                    <label className="form-label">Branch</label>
                    <select
                      className="form-select"
                      value={scope.institutionId}
                      onChange={(e) =>
                        onScopeChange({
                          institutionId: e.target.value,
                          departmentId: "",
                          teamIds: [],
                        })
                      }
                      disabled={orgLoading || lockBranch}
                    >
                      <option value="">Select Branch</option>
                      {institutions.map((item) => (
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
                      value={scope.departmentId}
                      onChange={(e) =>
                        onScopeChange({
                          departmentId: e.target.value,
                          teamIds: [],
                        })
                      }
                      disabled={orgLoading || !scope.institutionId || lockDepartment}
                    >
                      <option value="">Select Department</option>
                      {departments.map((item) => (
                        <option key={item.id} value={item.id}>
                          {item.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Teams</label>
                    <div className="team-picker-row">
                      <select
                        className="form-select"
                        value={selectedTeamId}
                        onChange={(e) => onTeamSelect(e.target.value)}
                        disabled={orgLoading || !scope.departmentId || lockTeam}
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
                    <TeamBadgeList teamIds={scope.teamIds} teams={teams} onRemove={onTeamRemove} />
                  </div>
                </motion.div>

                {memberSection ? (
                  <motion.div
                    initial={shouldReduceMotion ? false : { opacity: 0, y: 12 }}
                    animate={shouldReduceMotion ? {} : { opacity: 1, y: 0 }}
                    transition={{ duration: 0.2, delay: 0.16 }}
                  >
                    {memberSection}
                  </motion.div>
                ) : null}
              </motion.div>

              <motion.div
                className="wizard-nav"
                initial={shouldReduceMotion ? false : { opacity: 0, y: 8 }}
                animate={shouldReduceMotion ? {} : { opacity: 1, y: 0 }}
                transition={{ duration: 0.18, delay: 0.18 }}
              >
                <button className="btn btn-light me-2" onClick={onClose} disabled={saving}>
                  Cancel
                </button>
                <button className="btn btn-primary" onClick={onSubmit} disabled={saving}>
                  {saving ? "Saving..." : submitLabel}
                </button>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </motion.div>
      <motion.div
        className="modal-backdrop fade show user-group-modal-backdrop"
        initial={shouldReduceMotion ? false : { opacity: 0 }}
        animate={shouldReduceMotion ? {} : { opacity: 1 }}
        exit={shouldReduceMotion ? {} : { opacity: 0 }}
        transition={{ duration: 0.18 }}
      />
    </>
  );
}
