import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { createUser } from "../../api/userAdminApi";
import { getAvailableEmployees } from "../../api/employeesApi";
import { getBranches } from "../../api/branchesApi";
import { getDepartmentsMasterByBranch } from "../../api/departmentsApi";
import { getDesignations } from "../../api/designationsApi";
import { getHeadOffices } from "../../api/headOfficesApi";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../components/system/ToastProvider";
import { extractApiErrorMessage } from "../../utils/errorMessage";
import {
  COUNTRY_CODE_OPTIONS,
  defaultCountryOption,
  getCountryAllowedLengths,
  getCountryDisplayMaxLength,
  getCountryOptionByValue,
  sanitizePhoneDigits,
  validatePhoneNumber,
} from "../../utils/phoneUtils";
import "../../../public/assets/css/addModalShared.css";
import "./EmployeesPage.css";

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

const EMPTY_FORM = {
  username: "",
  email: "",
  firstName: "",
  lastName: "",
  phone: "",
  role: "EMPLOYEE",
  password: "",
  confirmPassword: "",
};

export default function UserAdminCreatePage() {
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const { showSuccess, showError } = useToast();

  const currentRole = String(currentUser?.role || "").toUpperCase();
  const TABS = ["Scope & Employee", "Account Details"];

  const [form, setForm] = useState(EMPTY_FORM);
  const [activeTab, setActiveTab] = useState(0);
  const [saving, setSaving] = useState(false);
  const [phoneCountryCode, setPhoneCountryCode] = useState(defaultCountryOption?.value || "+91");
  const [phoneError, setPhoneError] = useState("");
  const [showCreatePassword, setShowCreatePassword] = useState(false);

  const [createHeadOfficeId, setCreateHeadOfficeId] = useState("");
  const [createBranchId, setCreateBranchId] = useState("");
  const [createDepartmentId, setCreateDepartmentId] = useState("");
  const [createTeamId, setCreateTeamId] = useState("");
  const [selectedEmployeeId, setSelectedEmployeeId] = useState("");

  const [headOffices, setHeadOffices] = useState([]);
  const [branches, setBranches] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [designations, setDesignations] = useState([]);
  const [employees, setEmployees] = useState([]);

  const [loadingHeadOffices, setLoadingHeadOffices] = useState(false);
  const [loadingBranches, setLoadingBranches] = useState(false);
  const [loadingDepartments, setLoadingDepartments] = useState(false);
  const [loadingDesignations, setLoadingDesignations] = useState(false);
  const [loadingEmployees, setLoadingEmployees] = useState(false);

  const selectedRole = String(form.role || "EMPLOYEE").toUpperCase();
  const roleRequiresDepartment = selectedRole !== "ADMIN";
  const roleRequiresTeam = ["TEAM_LEAD", "EMPLOYEE"].includes(selectedRole);
  const phoneDisplayMaxLength = getCountryDisplayMaxLength(phoneCountryCode) || 15;
  const phoneLengthDisplay = useMemo(() => {
    const allowed = getCountryAllowedLengths(phoneCountryCode);
    return allowed.length ? allowed.join(" or ") : phoneDisplayMaxLength;
  }, [phoneCountryCode, phoneDisplayMaxLength]);

  const allowedAssignRoles = useMemo(() => {
    const configured = new Set(ROLE_OPTIONS.map((role) => String(role || "").trim().toUpperCase()));
    return (ROLE_ASSIGNMENT_OPTIONS[currentRole] || []).filter((role) => configured.has(role));
  }, [currentRole]);

  useEffect(() => {
    if (allowedAssignRoles.length > 0) {
      setForm((prev) => ({ ...prev, role: allowedAssignRoles[0] }));
    }
  }, [allowedAssignRoles]);

  useEffect(() => {
    let isMounted = true;
    const loadHeadOffices = async () => {
      setLoadingHeadOffices(true);
      try {
        const data = await getHeadOffices();
        if (isMounted) setHeadOffices(Array.isArray(data) ? data : []);
      } catch (e) {
        if (isMounted) showError(extractApiErrorMessage(e, "Failed to load head offices"));
      } finally {
        if (isMounted) setLoadingHeadOffices(false);
      }
    };
    loadHeadOffices();
    return () => {
      isMounted = false;
    };
  }, [showError]);

  useEffect(() => {
    if (!createHeadOfficeId) {
      setBranches([]);
      setCreateBranchId("");
      return;
    }
    let isMounted = true;
    const loadBranches = async () => {
      setLoadingBranches(true);
      try {
        const data = await getBranches(createHeadOfficeId);
        if (isMounted) setBranches(Array.isArray(data) ? data : []);
      } catch (e) {
        if (isMounted) showError(extractApiErrorMessage(e, "Failed to load branches"));
      } finally {
        if (isMounted) setLoadingBranches(false);
      }
    };
    loadBranches();
    return () => {
      isMounted = false;
    };
  }, [createHeadOfficeId, showError]);

  useEffect(() => {
    if (!createBranchId) {
      setDepartments([]);
      setCreateDepartmentId("");
      return;
    }
    let isMounted = true;
    const loadDepartments = async () => {
      setLoadingDepartments(true);
      try {
        const data = await getDepartmentsMasterByBranch(createBranchId);
        if (isMounted) setDepartments(Array.isArray(data) ? data : []);
      } catch (e) {
        if (isMounted) showError(extractApiErrorMessage(e, "Failed to load departments"));
      } finally {
        if (isMounted) setLoadingDepartments(false);
      }
    };
    loadDepartments();
    return () => {
      isMounted = false;
    };
  }, [createBranchId, showError]);

  useEffect(() => {
    if (!createDepartmentId) {
      setDesignations([]);
      setCreateTeamId("");
      return;
    }
    let isMounted = true;
    const loadDesignations = async () => {
      setLoadingDesignations(true);
      try {
        const data = await getDesignations(createDepartmentId);
        if (isMounted) setDesignations(Array.isArray(data) ? data : []);
      } catch (e) {
        if (isMounted) showError(extractApiErrorMessage(e, "Failed to load designations"));
      } finally {
        if (isMounted) setLoadingDesignations(false);
      }
    };
    loadDesignations();
    return () => {
      isMounted = false;
    };
  }, [createDepartmentId, showError]);

  const createEmployeeScope = useMemo(() => {
    const headOfficeId = String(createHeadOfficeId || "").trim();
    const branchId = String(createBranchId || "").trim();
    const departmentId = String(createDepartmentId || "").trim();
    const designationId = String(createTeamId || "").trim();
    if (!headOfficeId || !branchId) return null;

    const scope = { headOfficeId, branchId };
    if (departmentId) scope.departmentId = departmentId;
    if (designationId) scope.designationId = designationId;
    return scope;
  }, [createHeadOfficeId, createBranchId, createDepartmentId, createTeamId]);

  useEffect(() => {
    if (!createEmployeeScope) {
      setEmployees([]);
      return;
    }
    let isMounted = true;
    const loadEmployees = async () => {
      setLoadingEmployees(true);
      try {
        const data = await getAvailableEmployees(createEmployeeScope);
        if (isMounted) setEmployees(Array.isArray(data) ? data : []);
      } catch (e) {
        if (isMounted) showError(extractApiErrorMessage(e, "Failed to load available employees"));
      } finally {
        if (isMounted) setLoadingEmployees(false);
      }
    };
    loadEmployees();
    return () => {
      isMounted = false;
    };
  }, [createEmployeeScope, showError]);

  const selectedHeadOffice = headOffices.find((item) => String(item.id) === String(createHeadOfficeId));
  const selectedBranch = branches.find((item) => String(item.id) === String(createBranchId));
  const selectedDepartment = departments.find((item) => String(item.id) === String(createDepartmentId));
  const selectedDesignation = designations.find((item) => String(item.id) === String(createTeamId));
  const selectedEmployee = employees.find((item) => String(item.id) === String(selectedEmployeeId));

  const clearSelectedEmployeeDraft = () => {
    setSelectedEmployeeId("");
    setForm((prev) => ({
      ...prev,
      username: "",
      email: "",
      firstName: "",
      lastName: "",
      phone: "",
    }));
  };

  const handleRoleChange = (role) => {
    const nextRole = String(role || "EMPLOYEE").toUpperCase();
    setForm((prev) => ({ ...prev, role: nextRole }));
    clearSelectedEmployeeDraft();
  };

  const handleHeadOfficeChange = (value) => {
    setCreateHeadOfficeId(value);
    setCreateBranchId("");
    setCreateDepartmentId("");
    setCreateTeamId("");
    setBranches([]);
    setDepartments([]);
    setDesignations([]);
    clearSelectedEmployeeDraft();
  };

  const handleBranchChange = (value) => {
    setCreateBranchId(value);
    setCreateDepartmentId("");
    setCreateTeamId("");
    setDepartments([]);
    setDesignations([]);
    clearSelectedEmployeeDraft();
  };

  const handleDepartmentChange = (value) => {
    setCreateDepartmentId(value);
    setCreateTeamId("");
    setDesignations([]);
    clearSelectedEmployeeDraft();
  };

  const handleTeamChange = (value) => {
    setCreateTeamId(value);
    clearSelectedEmployeeDraft();
  };

  const handleSelectEmployee = (employeeId) => {
    setSelectedEmployeeId(employeeId);
    const employee = employees.find((emp) => String(emp.id) === String(employeeId));
    if (!employee) return;

    const name = String(employee.name || employee.fullName || employee.employeeName || "").trim();
    const nameParts = name.split(/\s+/).filter(Boolean);
    const email = String(employee.email || employee.officialEmail || employee.personalEmail || "").trim();
    const emailPrefix = email.includes("@") ? email.split("@")[0] : email;
    const countryCode = String(employee.countryCode || "").trim();
    const phoneRaw = String(
      employee.phone || employee.personalContactNumber || employee.alternateContactNumber || "",
    ).trim();

    setPhoneCountryCode((prev) => countryCode || prev || "+91");
    setForm((prev) => ({
      ...prev,
      username: emailPrefix || prev.username,
      email: email || prev.email,
      phone: phoneRaw.replace(/\D/g, ""),
      firstName: nameParts[0] || prev.firstName || "",
      lastName: nameParts.slice(1).join(" ") || prev.lastName || "",
    }));
  };

  const handlePhoneInput = (value) => {
    const digits = value.replace(/\D/g, "");
    const allowedLengths = getCountryAllowedLengths(phoneCountryCode);
    const maxLength = allowedLengths.length > 0
      ? Math.max(...allowedLengths)
      : getCountryDisplayMaxLength(phoneCountryCode) || 15;
    setForm((prev) => ({ ...prev, phone: digits.slice(0, maxLength) }));
    setPhoneError("");
  };

  const handlePhoneBlur = () => {
    setPhoneError(validatePhoneNumber(form.phone, phoneCountryCode));
  };

  const handlePhoneCountryCodeChange = (value) => {
    const nextCode = value || "+91";
    const option = getCountryOptionByValue(nextCode);
    const lengths = getCountryAllowedLengths(nextCode);
    const maxLength = option?.maxLength || 15;

    setPhoneCountryCode(nextCode);
    setForm((prev) => ({
      ...prev,
      phone: sanitizePhoneDigits(prev.phone, maxLength, lengths),
    }));
    setPhoneError("");
  };

  const validatePhoneForSubmit = () => {
    if (form.phone && form.phone.trim()) {
      const error = validatePhoneNumber(form.phone, phoneCountryCode);
      if (error) return { isValid: false, message: error };
    }
    return { isValid: true, message: "" };
  };

  const getFormattedPhone = () => (form.phone ? `${phoneCountryCode}${form.phone}` : "");

  const validateScopeStep = () => {
    if (!createHeadOfficeId) return "Please select a head office";
    if (!createBranchId) return "Please select a branch";
    if (roleRequiresDepartment && !createDepartmentId) return "Please select a department";
    if (roleRequiresTeam && !createTeamId) return "Please select a designation";
    if (!selectedEmployeeId) return "Please select an employee";
    return null;
  };

  const validateAccountStep = () => {
    if (!form.username.trim()) return "Username is required";
    if (!form.email.trim()) return "Email is required";
    if (!form.password.trim()) return "Password is required";
    if (form.password !== form.confirmPassword) return "Passwords do not match";
    return null;
  };

  const handleTabChange = (index) => {
    if (activeTab === 0 && index > 0) {
      const err = validateScopeStep();
      if (err) {
        showError(err);
        return;
      }
    }
    setActiveTab(index);
  };

  const handleSubmit = async (e) => {
    if (e && e.preventDefault) e.preventDefault();

    const scopeValidation = validateScopeStep();
    if (scopeValidation) return showError(scopeValidation);

    // Treat any accidental submit from step 1 as a step advance, not a final validation.
    if (activeTab === 0) {
      setActiveTab(1);
      return;
    }

    const accountValidation = validateAccountStep();
    if (accountValidation) return showError(accountValidation);

    const phoneValidation = validatePhoneForSubmit();
    if (!phoneValidation.isValid) return showError(phoneValidation.message);

    const selected = employees.find((emp) => String(emp.id) === String(selectedEmployeeId));
    if (!selected) return showError("Selected employee is no longer available");

    const scopeHeadOfficeId = String(createHeadOfficeId || "").trim();
    const scopeBranchId = String(createBranchId || "").trim();
    const scopeDepartmentId = String(createDepartmentId || "").trim();
    const scopeDesignationId = String(createTeamId || "").trim();
    const employeeHeadOfficeId = String(selected.headOfficeId || "").trim();
    const employeeBranchId = String(selected.branchId || "").trim();
    const employeeDepartmentId = String(selected.departmentMasterId || "").trim();
    const employeeDesignationId = String(selected.designationMasterId || "").trim();

    if (scopeHeadOfficeId && employeeHeadOfficeId !== scopeHeadOfficeId) {
      return showError("Selected employee does not belong to the selected head office");
    }
    if (scopeBranchId && employeeBranchId !== scopeBranchId) {
      return showError("Selected employee does not belong to the selected branch");
    }
    if (roleRequiresDepartment && scopeDepartmentId && employeeDepartmentId !== scopeDepartmentId) {
      return showError("Selected employee does not belong to the selected department");
    }
    if (roleRequiresTeam && scopeDesignationId && employeeDesignationId !== scopeDesignationId) {
      return showError("Selected employee does not belong to the selected designation");
    }

    setSaving(true);
    try {
      await createUser({
        employeeId: selected.id,
        username: form.username.trim(),
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        email: form.email.trim(),
        phone: getFormattedPhone(),
        role: String(form.role || "EMPLOYEE").toUpperCase(),
        headOfficeId: selected.headOfficeId || null,
        branchId: selected.branchId || null,
        departmentId: selected.departmentMasterId || null,
        designationId: selected.designationMasterId || null,
        institution: selected.institution || "",
        departmentName: selected.departmentName || "",
        team: selected.team || "",
        password: form.password,
        confirmPassword: form.confirmPassword,
      });
      showSuccess("User created successfully");
      navigate("/useradmin");
    } catch (err) {
      showError(extractApiErrorMessage(err, "Failed to create user"));
    } finally {
      setSaving(false);
    }
  };

  const handleWizardKeyDown = (e) => {
    if (e.key === "Enter") {
      // Always block Enter so it never triggers an accidental form submit.
      // Validation errors (e.g. "Password is required") should only appear
      // when the user deliberately clicks the "Create User" button.
      e.preventDefault();
      if (activeTab === 0) {
        // On the scope step, Enter works like clicking Next.
        handleTabChange(1);
      }
    }
  };

  const scopeSummary = [
    selectedHeadOffice?.name,
    selectedBranch?.name,
    roleRequiresDepartment ? selectedDepartment?.name : null,
    roleRequiresTeam ? selectedDesignation?.name : null,
  ].filter(Boolean).join(" / ");

  const canGoToNext = validateScopeStep() === null;
  const employeeScopeReady = Boolean(createHeadOfficeId && createBranchId);

  return (
    <div className="container-fluid user-admin-create-page">
      <style>{`
        .user-admin-create-page .wizard-steps {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 0.75rem;
          margin-bottom: 1rem;
        }
        .user-admin-create-page .wizard-step-button {
          display: flex;
          align-items: center;
          gap: 0.85rem;
          width: 100%;
          padding: 0.9rem 1rem;
          border: 1px solid #dbe3ec;
          border-radius: 1rem;
          background: #ffffff;
          text-align: left;
        }
        .user-admin-create-page .wizard-step-button.is-active {
          border-color: #45597a;
          box-shadow: 0 10px 24px rgba(69, 89, 122, 0.08);
        }
        .user-admin-create-page .wizard-step-index {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 2rem;
          height: 2rem;
          border-radius: 999px;
          background: #e7edf4;
          color: #45597a;
          font-weight: 700;
          flex: 0 0 auto;
        }
        .user-admin-create-page .wizard-step-button.is-active .wizard-step-index {
          background: #45597a;
          color: #ffffff;
        }
        .user-admin-create-page .wizard-step-title {
          display: block;
          font-size: 0.94rem;
          font-weight: 600;
          color: #1f2937;
        }
        .user-admin-create-page .wizard-step-copy {
          display: block;
          margin-top: 0.15rem;
          font-size: 0.8rem;
          color: #667085;
        }
        .user-admin-create-page .wizard-panel,
        .user-admin-create-page .wizard-summary-card {
          border: 1px solid #e7ecf2;
          border-radius: 1rem;
          background: #ffffff;
          padding: 1rem;
          height: 100%;
        }
        .user-admin-create-page .wizard-panel-title {
          font-size: 0.95rem;
          font-weight: 700;
          color: #1f2937;
          margin-bottom: 0.2rem;
        }
        .user-admin-create-page .wizard-panel-copy {
          color: #667085;
          font-size: 0.84rem;
          margin-bottom: 1rem;
        }
        .user-admin-create-page .wizard-summary-item + .wizard-summary-item {
          margin-top: 0.75rem;
        }
        .user-admin-create-page .wizard-summary-label {
          display: block;
          margin-bottom: 0.2rem;
          color: #667085;
          font-size: 0.76rem;
          font-weight: 700;
          letter-spacing: 0.04em;
          text-transform: uppercase;
        }
        .user-admin-create-page .wizard-summary-value {
          color: #1f2937;
          font-size: 0.92rem;
          font-weight: 600;
        }
        .user-admin-create-page .wizard-note {
          margin-top: 1rem;
          border: 1px dashed #d9e2ec;
          border-radius: 0.9rem;
          background: #f8fafc;
          padding: 0.85rem 0.95rem;
          color: #667085;
          font-size: 0.84rem;
        }
        @media (max-width: 767.98px) {
          .user-admin-create-page .wizard-steps {
            grid-template-columns: 1fr;
          }
        }
      `}</style>

      <div className="card">
        <div className="card-header d-flex align-items-center justify-content-between flex-wrap gap-2">
          <div>
            <h5 className="mb-0">Create User</h5>
            <small className="text-muted">Use the 2-step wizard to assign scope, choose an employee, and create access.</small>
          </div>
          <button
            type="button"
            className="btn btn-outline-secondary"
            onClick={() => navigate("/useradmin")}
            disabled={saving}
          >
            Back
          </button>
        </div>

        <div className="card-body">
          <div className="wizard-steps">
            {TABS.map((tab, i) => (
              <button
                key={tab}
                type="button"
                onClick={() => handleTabChange(i)}
                className={`wizard-step-button ${activeTab === i ? "is-active" : ""}`}
              >
                <span className="wizard-step-index">{i + 1}</span>
                <span>
                  <span className="wizard-step-title">{tab}</span>
                  <span className="wizard-step-copy">
                    {i === 0 ? "Scope, role, and employee mapping" : "Contact details and credentials"}
                  </span>
                </span>
              </button>
            ))}
          </div>

          {activeTab === 0 && (
            <div>
              <div className="row g-3">
                <div className="col-lg-8">
                  <div className="wizard-panel">
                    <div className="wizard-panel-title">Scope and employee</div>
                    <div className="wizard-panel-copy">Choose the org scope, role, and employee in one place.</div>
                    <div className="row g-3">
                      <div className="col-md-6">
                        <label className="form-label">Role <span className="text-danger">*</span></label>
                        <select className="form-select" value={form.role} onChange={(e) => handleRoleChange(e.target.value)}>
                          {allowedAssignRoles.map((role) => (
                            <option key={role} value={role}>{role.replace(/_/g, " ")}</option>
                          ))}
                        </select>
                      </div>

                      <div className="col-md-6">
                        <label className="form-label">Head Office <span className="text-danger">*</span></label>
                        <select
                          className="form-select"
                          value={createHeadOfficeId}
                          onChange={(e) => handleHeadOfficeChange(e.target.value)}
                          disabled={loadingHeadOffices}
                        >
                          <option value="">Select</option>
                          {headOffices.map((headOffice) => (
                            <option key={headOffice.id} value={headOffice.id}>{headOffice.name}</option>
                          ))}
                        </select>
                      </div>

                      <div className="col-md-6">
                        <label className="form-label">Branch <span className="text-danger">*</span></label>
                        <select
                          className="form-select"
                          value={createBranchId}
                          onChange={(e) => handleBranchChange(e.target.value)}
                          disabled={!createHeadOfficeId || loadingBranches}
                        >
                          <option value="">Select</option>
                          {branches.map((branch) => (
                            <option key={branch.id} value={branch.id}>{branch.name}</option>
                          ))}
                        </select>
                      </div>

                      <div className="col-md-6">
                        <label className="form-label">Department {roleRequiresDepartment && <span className="text-danger">*</span>}</label>
                        <select
                          className="form-select"
                          value={createDepartmentId}
                          onChange={(e) => handleDepartmentChange(e.target.value)}
                          disabled={!createBranchId || departments.length === 0 || loadingDepartments}
                        >
                          <option value="">Select</option>
                          {departments.map((department) => (
                            <option key={department.id} value={department.id}>{department.name}</option>
                          ))}
                        </select>
                      </div>

                      <div className="col-md-6">
                        <label className="form-label">Designation {roleRequiresTeam && <span className="text-danger">*</span>}</label>
                        <select
                          className="form-select"
                          value={createTeamId}
                          onChange={(e) => handleTeamChange(e.target.value)}
                          disabled={!createBranchId || !createDepartmentId || designations.length === 0 || loadingDesignations}
                        >
                          <option value="">Select</option>
                          {designations.map((designation) => (
                            <option key={designation.id} value={designation.id}>{designation.name}</option>
                          ))}
                        </select>
                      </div>

                      <div className="col-12">
                        <label className="form-label">Select Employee <span className="text-danger">*</span></label>
                        <select
                          className="form-select"
                          value={selectedEmployeeId}
                          onChange={(e) => handleSelectEmployee(e.target.value)}
                          disabled={!employeeScopeReady || loadingEmployees}
                        >
                          {!employeeScopeReady ? (
                            <option value="">Complete the scope first</option>
                          ) : loadingEmployees ? (
                            <option value="">Loading employees...</option>
                          ) : (
                            <option value="">Select</option>
                          )}
                          {employees.map((emp) => (
                            <option key={emp.id} value={emp.id}>{emp.name}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="col-lg-4">
                  <div className="wizard-summary-card">
                    <div className="wizard-panel-title">Summary</div>
                    <div className="wizard-panel-copy">This preview updates as you pick the scope.</div>
                    <div className="wizard-summary-item">
                      <span className="wizard-summary-label">Scope</span>
                      <span className="wizard-summary-value">{scopeSummary || "Not selected"}</span>
                    </div>
                    <div className="wizard-summary-item">
                      <span className="wizard-summary-label">Employee</span>
                      <span className="wizard-summary-value">{selectedEmployee?.name || "Not selected"}</span>
                    </div>
                    <div className="wizard-note">
                      {selectedRole === "ADMIN"
                        ? "Admins are assigned at the branch level."
                        : selectedRole === "MANAGER"
                          ? "Managers are assigned at the branch and department level."
                          : "Team leads and employees are assigned through branch, department, and designation."}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 1 && (
            <form
              id="user-create-form"
              onSubmit={(e) => e.preventDefault()}
              onKeyDown={handleWizardKeyDown}
              autoComplete="off"
            >
              <div className="row g-3">
                <div className="col-lg-8">
                  <div className="wizard-panel">
                    <div className="wizard-panel-title">Contact and credentials</div>
                    <div className="wizard-panel-copy">Use the default field UI here; only the wizard chrome is custom.</div>
                    <div className="row g-3">
                      <div className="col-md-6">
                        <label className="form-label">First Name</label>
                        <input
                          className="form-control"
                          value={form.firstName}
                          onChange={(e) => setForm((f) => ({ ...f, firstName: e.target.value }))}
                          placeholder="First Name"
                        />
                      </div>

                      <div className="col-md-6">
                        <label className="form-label">Last Name</label>
                        <input
                          className="form-control"
                          value={form.lastName}
                          onChange={(e) => setForm((f) => ({ ...f, lastName: e.target.value }))}
                          placeholder="Last Name"
                        />
                      </div>

                      <div className="col-md-6">
                        <label className="form-label">Email <span className="text-danger">*</span></label>
                        <input
                          type="email"
                          className="form-control"
                          value={form.email}
                          onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                          placeholder="email@example.com"
                        />
                      </div>

                      <div className="col-md-6">
                        <label className="form-label">Mobile Number</label>
                        <div className={`employee-phone-input ${phoneError ? "employee-phone-input-error" : ""}`}>
                          <select
                            className="employee-phone-code"
                            value={phoneCountryCode}
                            onChange={(e) => handlePhoneCountryCodeChange(e.target.value)}
                          >
                            {COUNTRY_CODE_OPTIONS.map((opt) => (
                              <option key={`${opt.country}-${opt.callingCode}`} value={opt.value}>
                                {opt.value}
                              </option>
                            ))}
                          </select>
                          <input
                            type="tel"
                            className="employee-phone-number"
                            value={form.phone || ""}
                            onChange={(e) => handlePhoneInput(e.target.value)}
                            onBlur={handlePhoneBlur}
                            placeholder={`Enter ${phoneDisplayMaxLength} digit number`}
                          />
                        </div>
                        {phoneError && <small className="text-danger mt-1 d-block">{phoneError}</small>}
                      </div>

                      <div className="col-md-6">
                        <label className="form-label">Username <span className="text-danger">*</span></label>
                        <input
                          className="form-control"
                          value={form.username}
                          onChange={(e) => setForm((f) => ({ ...f, username: e.target.value }))}
                          placeholder="Username"
                          autoComplete="new-username"
                        />
                      </div>

                      <div className="col-md-6">
                        <label className="form-label">Password <span className="text-danger">*</span></label>
                        <div className="position-relative">
                          <input
                            type={showCreatePassword ? "text" : "password"}
                            className="form-control"
                            value={form.password}
                            onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                            placeholder="........"
                            autoComplete="new-password"
                            style={{ paddingRight: "2.75rem" }}
                          />
                          <button
                            type="button"
                            className="btn btn-link p-0 text-muted"
                            style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", zIndex: 10, textDecoration: "none" }}
                            onClick={() => setShowCreatePassword((prev) => !prev)}
                            aria-label={showCreatePassword ? "Hide password" : "Show password"}
                          >
                            <i className={`ti ${showCreatePassword ? "ti-eye-off" : "ti-eye"}`} style={{ fontSize: "1.1rem" }} />
                          </button>
                        </div>
                      </div>

                      <div className="col-md-6">
                        <label className="form-label">Confirm Password <span className="text-danger">*</span></label>
                        <div className="position-relative">
                          <input
                            type={showCreatePassword ? "text" : "password"}
                            className="form-control"
                            value={form.confirmPassword}
                            onChange={(e) => setForm((f) => ({ ...f, confirmPassword: e.target.value }))}
                            placeholder="........"
                            autoComplete="new-password"
                            style={{ paddingRight: "2.75rem" }}
                          />
                          <button
                            type="button"
                            className="btn btn-link p-0 text-muted"
                            style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", zIndex: 10, textDecoration: "none" }}
                            onClick={() => setShowCreatePassword((prev) => !prev)}
                            aria-label={showCreatePassword ? "Hide password" : "Show password"}
                          >
                            <i className={`ti ${showCreatePassword ? "ti-eye-off" : "ti-eye"}`} style={{ fontSize: "1.1rem" }} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="col-lg-4">
                  <div className="wizard-summary-card">
                    <div className="wizard-panel-title">Review</div>
                    <div className="wizard-panel-copy">Check the account details before you create the user.</div>
                    <div className="wizard-summary-item">
                      <span className="wizard-summary-label">Username</span>
                      <span className="wizard-summary-value">{form.username || "Not entered"}</span>
                    </div>
                    <div className="wizard-summary-item">
                      <span className="wizard-summary-label">Email</span>
                      <span className="wizard-summary-value">{form.email || "Not entered"}</span>
                    </div>
                    <div className="wizard-summary-item">
                      <span className="wizard-summary-label">Employee</span>
                      <span className="wizard-summary-value">{selectedEmployee?.name || "Not selected"}</span>
                    </div>
                  </div>
                </div>
              </div>
            </form>
          )}
        </div>

        <div className="card-footer d-flex justify-content-end gap-2">
          {activeTab === 0 ? (
            <>
              <button
                type="button"
                className="btn btn-light"
                onClick={() => navigate("/useradmin")}
                disabled={saving}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => handleTabChange(1)}
                disabled={saving || !canGoToNext}
              >
                Next
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                className="btn btn-light"
                onClick={() => setActiveTab(0)}
                disabled={saving}
              >
                Previous
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={handleSubmit}
                disabled={saving}
              >
                {saving ? "Creating..." : "Create User"}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
