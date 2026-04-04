import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import "./UserWizardModal.css";

export default function UserWizardModal({
  wizardStep,
  form,
  setForm,
  phoneCountryCode,
  setPhoneCountryCode,
  phoneError,
  handlePhoneInput,
  handlePhoneBlur,
  getPhoneMaxLength,
  COUNTRY_CODE_OPTIONS,
  showCreatePassword,
  setShowCreatePassword,
  institutionId,
  setInstitutionId,
  departmentId,
  setDepartmentId,
  teamId,
  setTeamId,
  institutions,
  departments,
  teams,
  categoryId,
  setCategoryId,
  typeId,
  setTypeId,
  categories,
  types,
  orgLoading,
  currentRole,
  allowedAssignRoles,
  availableEmployees,
  selectedEmployeeId,
  handleSelectEmployee,
  handleAddInstitution,
  handleAddDepartment,
  handleAddTeam,
  roleRequiresTeam,
  isAdmin,
  isManager,
  onNext,
  onPrev,
  onSubmit,
  onClose,
  saving,
}) {
  const shouldReduceMotion = useReducedMotion();
  const selectedRole = String(form.role || "EMPLOYEE").toUpperCase();
  const branchOnlyRole = selectedRole === "ADMIN";

  useEffect(() => {
    if (!branchOnlyRole) return;
    if (departmentId || teamId || form.departmentName || form.team) {
      setDepartmentId("");
      setTeamId("");
      setForm((prev) => ({
        ...prev,
        departmentName: "",
        team: "",
      }));
    }
  }, [branchOnlyRole, departmentId, teamId, form.departmentName, form.team, setDepartmentId, setTeamId, setForm]);

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
              <h5 className="modal-title">Create User</h5>
              <button className="btn-close" onClick={onClose} />
            </div>

            <div className="user-wizard">
              {/* Progress Bar */}
              <div className="wizard-progress-bar">
                <motion.div
                  className="wizard-progress"
                  initial={shouldReduceMotion ? false : { width: "0%" }}
                  animate={shouldReduceMotion ? {} : { width: `${((wizardStep + 1) / 3) * 100}%` }}
                  transition={{ duration: 0.35, ease: "easeOut" }}
                />
              </div>

              {/* Progress Circles */}
              <motion.div
                className="wizard-circles-container"
                initial={shouldReduceMotion ? false : { opacity: 0, y: 10 }}
                animate={shouldReduceMotion ? {} : { opacity: 1, y: 0 }}
                transition={{ duration: 0.2, delay: 0.05 }}
              >
                <div className="wizard-circle-item">
                  <motion.div
                    className={`wizard-circle ${wizardStep >= 0 ? "active" : ""}`}
                    initial={shouldReduceMotion ? false : { scale: 0.94 }}
                    animate={shouldReduceMotion ? {} : { scale: 1 }}
                    transition={{ duration: 0.2, delay: 0.08 }}
                  >
                    <i className="ti ti-user" />
                  </motion.div>
                  <div className="wizard-circle-label">Account</div>
                </div>
                <div className="wizard-circle-item">
                  <motion.div
                    className={`wizard-circle ${wizardStep >= 1 ? "active" : ""}`}
                    initial={shouldReduceMotion ? false : { scale: 0.94 }}
                    animate={shouldReduceMotion ? {} : { scale: 1 }}
                    transition={{ duration: 0.2, delay: 0.1 }}
                  >
                    <i className="ti ti-building" />
                  </motion.div>
                  <div className="wizard-circle-label">Organization</div>
                </div>
                <div className="wizard-circle-item">
                  <motion.div
                    className={`wizard-circle ${wizardStep >= 2 ? "active" : ""}`}
                    initial={shouldReduceMotion ? false : { scale: 0.94 }}
                    animate={shouldReduceMotion ? {} : { scale: 1 }}
                    transition={{ duration: 0.2, delay: 0.12 }}
                  >
                    <i className="ti ti-lock" />
                  </motion.div>
                  <div className="wizard-circle-label">Security</div>
                </div>
              </motion.div>

              {/* Step Content */}
              <motion.div
                className="wizard-step-content"
                initial={shouldReduceMotion ? false : { opacity: 0, y: 12 }}
                animate={shouldReduceMotion ? {} : { opacity: 1, y: 0 }}
                transition={{ duration: 0.22, delay: 0.1 }}
              >
                {/* Step 0: Account Info */}
                <AnimatePresence mode="wait">
                  {wizardStep === 0 && (
                    <motion.div
                      key="step-0"
                      initial={shouldReduceMotion ? false : { opacity: 0, x: 8 }}
                      animate={shouldReduceMotion ? {} : { opacity: 1, x: 0 }}
                      exit={shouldReduceMotion ? false : { opacity: 0, x: -8 }}
                      transition={{ duration: 0.2 }}
                      className="row g-3"
                    >
                      <div className="col-md-6">
                        <label className="form-label">Username *</label>
                        <input
                          className="form-control user-wizard-input"
                          value={form.username}
                          onChange={(e) => setForm((f) => ({ ...f, username: e.target.value }))}
                        />
                      </div>
                      {currentRole === "SUPER_ADMIN" && (
                        <div className="col-md-6">
                          <label className="form-label">Role *</label>
                          <select
                            className="form-select user-wizard-input"
                            value={form.role}
                            onChange={(e) =>
                              setForm((f) => ({
                                ...f,
                                role: e.target.value,
                                ...(String(e.target.value || "").toUpperCase() === "ADMIN"
                                  ? { departmentName: "", team: "" }
                                  : {}),
                              }))
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
                          className="form-select user-wizard-input"
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
                      <div className="col-md-6">
                        <label className="form-label">Email *</label>
                        <input
                          type="email"
                          className="form-control user-wizard-input"
                          value={form.email}
                          onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                        />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label">First Name</label>
                        <input
                          className="form-control user-wizard-input"
                          value={form.firstName}
                          onChange={(e) => setForm((f) => ({ ...f, firstName: e.target.value }))}
                        />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label">Last Name</label>
                        <input
                          className="form-control user-wizard-input"
                          value={form.lastName}
                          onChange={(e) => setForm((f) => ({ ...f, lastName: e.target.value }))}
                        />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label">Country Code</label>
                        <select
                          className="form-select user-wizard-input"
                          value={phoneCountryCode}
                          onChange={(e) => {
                            setPhoneCountryCode(e.target.value);
                          }}
                        >
                          {COUNTRY_CODE_OPTIONS.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                              {opt.label}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="col-md-6">
                        <label className="form-label">Phone Number</label>
                        <input
                          type="tel"
                          className={`form-control user-wizard-input ${phoneError ? "is-invalid" : ""}`}
                          value={form.phone || ""}
                          onChange={(e) => handlePhoneInput(e.target.value)}
                          onBlur={handlePhoneBlur}
                          placeholder="Enter phone number"
                          maxLength={getPhoneMaxLength()}
                        />
                        {phoneError && (
                          <div className="invalid-feedback d-block" style={{ fontSize: "0.85rem", marginTop: "0.25rem" }}>
                            {phoneError}
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}

                  {/* Step 1: Organization */}
                  {wizardStep === 1 && (
                    <motion.div
                      key="step-1"
                      initial={shouldReduceMotion ? false : { opacity: 0, x: 8 }}
                      animate={shouldReduceMotion ? {} : { opacity: 1, x: 0 }}
                      exit={shouldReduceMotion ? false : { opacity: 0, x: -8 }}
                      transition={{ duration: 0.2 }}
                      className="row g-3"
                    >
                      <div className="col-md-6">
                        <div className="d-flex align-items-center justify-content-between mb-2">
                          <label className="form-label mb-0">Branch *</label>
                          <button
                            type="button"
                            className="btn btn-sm btn-primary px-2 py-0"
                            onClick={handleAddInstitution}
                            disabled={saving || currentRole !== "SUPER_ADMIN"}
                            title="Add Branch"
                          >
                            +
                          </button>
                        </div>
                        <select
                          className="form-select user-wizard-input"
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
                        <div className="d-flex align-items-center justify-content-between mb-2">
                          <label className="form-label mb-0">Department *</label>
                          <button
                            type="button"
                            className="btn btn-sm btn-primary px-2 py-0"
                            onClick={handleAddDepartment}
                            disabled={saving || !institutionId || isManager || branchOnlyRole}
                            title="Add Department"
                          >
                            +
                          </button>
                        </div>
                        <select
                          className="form-select user-wizard-input"
                          value={departmentId}
                          onChange={(e) => {
                            setDepartmentId(e.target.value);
                            setTeamId("");
                            setTeams([]);
                          }}
                          disabled={orgLoading || !institutionId || isManager || isAdmin || branchOnlyRole}
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
                        <div className="d-flex align-items-center justify-content-between mb-2">
                          <label className="form-label mb-0">
                            {roleRequiresTeam ? "Team *" : "Team (Optional)"}
                          </label>
                          <button
                            type="button"
                            className="btn btn-sm btn-primary px-2 py-0"
                            onClick={handleAddTeam}
                            disabled={saving || !institutionId || !departmentId || branchOnlyRole}
                            title="Add Team"
                          >
                            +
                          </button>
                        </div>
                        <select
                          className="form-select user-wizard-input"
                          value={teamId}
                          onChange={(e) => setTeamId(e.target.value)}
                          disabled={orgLoading || !departmentId || currentRole === "MANAGER" || branchOnlyRole}
                        >
                          <option value="">Select</option>
                          {teams.map((item) => (
                            <option key={item.id} value={item.id}>
                              {item.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    </motion.div>
                  )}

                  {/* Step 2: Security */}
                  {wizardStep === 2 && (
                    <motion.div
                      key="step-2"
                      initial={shouldReduceMotion ? false : { opacity: 0, x: 8 }}
                      animate={shouldReduceMotion ? {} : { opacity: 1, x: 0 }}
                      exit={shouldReduceMotion ? false : { opacity: 0, x: -8 }}
                      transition={{ duration: 0.2 }}
                      className="row g-3"
                    >
                      <div className="col-md-6">
                        <label className="form-label">Password *</label>
                        <div className="position-relative">
                          <input
                            type={showCreatePassword ? "text" : "password"}
                            className="form-control user-wizard-input"
                            value={form.password}
                            onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                          />
                          <button
                            type="button"
                            className="btn btn-link p-0 text-muted"
                            style={{ position: "absolute", right: 12, top: 8 }}
                            onClick={() => setShowCreatePassword((prev) => !prev)}
                            aria-label={showCreatePassword ? "Hide password" : "Show password"}
                          >
                            <i className={`ti ${showCreatePassword ? "ti-eye-off" : "ti-eye"}`} />
                          </button>
                        </div>
                      </div>
                      <div className="col-md-6">
                        <label className="form-label">Confirm Password *</label>
                        <div className="position-relative">
                          <input
                            type={showCreatePassword ? "text" : "password"}
                            className="form-control user-wizard-input"
                            value={form.confirmPassword}
                            onChange={(e) => setForm((f) => ({ ...f, confirmPassword: e.target.value }))}
                          />
                          <button
                            type="button"
                            className="btn btn-link p-0 text-muted"
                            style={{ position: "absolute", right: 12, top: 8 }}
                            onClick={() => setShowCreatePassword((prev) => !prev)}
                            aria-label={showCreatePassword ? "Hide password" : "Show password"}
                          >
                            <i className={`ti ${showCreatePassword ? "ti-eye-off" : "ti-eye"}`} />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>

              {/* Navigation Buttons */}
              <motion.div
                className="wizard-nav"
                initial={shouldReduceMotion ? false : { opacity: 0, y: 8 }}
                animate={shouldReduceMotion ? {} : { opacity: 1, y: 0 }}
                transition={{ duration: 0.18, delay: 0.18 }}
              >
                {wizardStep > 0 ? (
                  <button className="btn btn-light" onClick={onPrev} disabled={saving}>
                    Previous
                  </button>
                ) : (
                  <div></div>
                )}
                <div className="wizard-nav-spacer"></div>
                {wizardStep < 2 ? (
                  <button className="btn btn-primary" onClick={onNext} disabled={saving}>
                    Next
                  </button>
                ) : (
                  <button className="btn btn-primary" onClick={onSubmit} disabled={saving}>
                    {saving ? "Saving..." : "Create"}
                  </button>
                )}
              </motion.div>
            </div>
          </div>
        </motion.div>
      </motion.div>
      <motion.div
        className="modal-backdrop fade show user-wizard-modal-backdrop"
        initial={shouldReduceMotion ? false : { opacity: 0 }}
        animate={shouldReduceMotion ? {} : { opacity: 1 }}
        exit={shouldReduceMotion ? {} : { opacity: 0 }}
        transition={{ duration: 0.18 }}
      />
    </>
  );
}
