import React, { useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import { getEmployees, createEmployee, updateEmployee, deleteEmployee } from "../../api/employeesApi";
import { getDepartmentsMaster } from "../../api/departmentsApi";
import { getDesignations } from "../../api/designationsApi";
import {
  getDepartments as getOrgDepartments,
  getInstitutionCategories,
  getInstitutions,
  getInstitutionTypes,
  getTeams as getOrgTeams,
  getUserOrgSelection,
} from "../../api/orgHierarchyApi";
import { useAuth } from "../../context/AuthContext";
import { extractApiErrorMessage } from "../../utils/errorMessage";
import { useToast } from "../../components/system/ToastProvider";
import {
  COUNTRY_CODE_OPTIONS,
  defaultCountryOption,
  validatePhoneNumber,
  sanitizePhoneDigits,
  getCountryDisplayMaxLength,
} from "../../utils/phoneUtils";

const EMPTY_FORM = {
  employeeCode: "",
  name: "",
  email: "",
  countryCode: defaultCountryOption.value,
  phone: "",
  dept: "",
  institution: "",
  institutionCategory: "",
  institutionType: "",
  userDepartmentName: "",
  team: "",
  designation: "",
  joinDate: "",
  status: "ACTIVE",
  img: "assets/img/users/user-32.jpg",
};

function toUiRow(item) {
  return {
    id: item?.id ?? null,
    employeeCode: item?.employeeCode || item?.employeeId || "",
    name: item?.name || "",
    email: item?.email || "",
    countryCode: item?.countryCode || defaultCountryOption.value,
    phone: item?.phone || "",
    dept: item?.dept || item?.department || "",
    institution: item?.institution || item?.institutionName || "",
    institutionCategory:
      item?.institutionCategory ||
      item?.institution_category ||
      item?.category ||
      "",
    institutionType: item?.institutionType || item?.institution_type || "",
    userDepartmentName:
      item?.userDepartmentName ||
      item?.orgDepartmentName ||
      item?.departmentName ||
      item?.user_department_name ||
      "",
    team: item?.team || item?.orgTeam || item?.userTeam || "",
    designation: item?.designation || "",
    joinDate: item?.joinDate || "",
    status: String(item?.status || "ACTIVE").toUpperCase(),
    img: item?.img || "assets/img/users/user-32.jpg",
  };
}

function toApiPayload(form) {
  return {
    name: form.name?.trim() || "",
    email: form.email?.trim() || "",
    countryCode: form.countryCode || defaultCountryOption.value,
    phone: form.phone?.trim() || "",
    dept: form.dept?.trim() || "",
    institution: form.institution?.trim() || "",
    institutionCategory: form.institutionCategory?.trim() || "",
    institutionType: form.institutionType?.trim() || "",
    userDepartmentName: form.userDepartmentName?.trim() || "",
    team: form.team?.trim() || "",
    designation: form.designation?.trim() || "",
    joinDate: form.joinDate || null,
    status: String(form.status || "ACTIVE").toUpperCase(),
    img: form.img || "assets/img/users/user-32.jpg",
  };
}

function EditGlyph({ size = 14, className = "" }) {
  return (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 20h9" /><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z" />
    </svg>
  );
}

function TrashGlyph({ size = 14, className = "" }) {
  return (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" /><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
    </svg>
  );
}

export default function EmployeesPage() {
  const location = useLocation();
  const { user: currentUser } = useAuth();
  const { showSuccess, showError } = useToast();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [metaLoading, setMetaLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [departments, setDepartments] = useState([]);
  const [designations, setDesignations] = useState([]);

  const [showModal, setShowModal] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [selectedId, setSelectedId] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [phoneError, setPhoneError] = useState("");
  const [orgSelection, setOrgSelection] = useState(null);
  const [orgInstitutionId, setOrgInstitutionId] = useState("");
  const [orgCategoryId, setOrgCategoryId] = useState("");
  const [orgTypeId, setOrgTypeId] = useState("");
  const [orgDepartmentId, setOrgDepartmentId] = useState("");
  const [orgTeamId, setOrgTeamId] = useState("");
  const [orgInstitutions, setOrgInstitutions] = useState([]);
  const [orgCategories, setOrgCategories] = useState([]);
  const [orgTypes, setOrgTypes] = useState([]);
  const [orgDepartments, setOrgDepartments] = useState([]);
  const [orgTeams, setOrgTeams] = useState([]);

  const gridView = location.pathname.endsWith("/employees-grid");

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await getEmployees();
      setRows((Array.isArray(data) ? data : []).map(toUiRow));
    } catch (e) {
      showError(extractApiErrorMessage(e, "Failed to load employees"));
      setRows([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const loadMeta = async () => {
    setMetaLoading(true);
    try {
      const [deps, desigs] = await Promise.all([getDepartmentsMaster(), getDesignations()]);
      setDepartments(Array.isArray(deps) ? deps : []);
      setDesignations(Array.isArray(desigs) ? desigs : []);
    } catch (e) {
      showError(extractApiErrorMessage(e, "Failed to load departments/designations"));
    } finally {
      setMetaLoading(false);
    }
  };

  useEffect(() => {
    loadMeta();
  }, []);

  useEffect(() => {
    let active = true;
    const loadOrgSelection = async () => {
      if (!currentUser?.id) return;
      try {
        const selection = await getUserOrgSelection(currentUser.id);
        if (!active) return;
        setOrgSelection(selection || null);
      } catch {
        if (!active) return;
        setOrgSelection(null);
      }
    };
    loadOrgSelection();
    return () => {
      active = false;
    };
  }, [currentUser?.id]);

  useEffect(() => {
    let active = true;
    const loadOrgInstitutions = async () => {
      try {
        const data = await getInstitutions();
        if (!active) return;
        setOrgInstitutions(Array.isArray(data) ? data : []);
      } catch {
        if (!active) return;
        setOrgInstitutions([]);
      }
    };
    loadOrgInstitutions();
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    let active = true;
    const loadCategories = async () => {
      if (!orgInstitutionId) {
        setOrgCategories([]);
        return;
      }
      try {
        const data = await getInstitutionCategories(orgInstitutionId);
        if (!active) return;
        setOrgCategories(Array.isArray(data) ? data : []);
      } catch {
        if (!active) return;
        setOrgCategories([]);
      }
    };
    loadCategories();
    return () => {
      active = false;
    };
  }, [orgInstitutionId]);

  useEffect(() => {
    let active = true;
    const loadTypes = async () => {
      if (!orgInstitutionId || !orgCategoryId) {
        setOrgTypes([]);
        return;
      }
      try {
        const data = await getInstitutionTypes(orgInstitutionId, orgCategoryId);
        if (!active) return;
        setOrgTypes(Array.isArray(data) ? data : []);
      } catch {
        if (!active) return;
        setOrgTypes([]);
      }
    };
    loadTypes();
    return () => {
      active = false;
    };
  }, [orgInstitutionId, orgCategoryId]);

  useEffect(() => {
    let active = true;
    const loadDepartments = async () => {
      if (!orgInstitutionId || !orgCategoryId || !orgTypeId) {
        setOrgDepartments([]);
        return;
      }
      try {
        const data = await getOrgDepartments(orgInstitutionId, orgCategoryId, orgTypeId);
        if (!active) return;
        setOrgDepartments(Array.isArray(data) ? data : []);
      } catch {
        if (!active) return;
        setOrgDepartments([]);
      }
    };
    loadDepartments();
    return () => {
      active = false;
    };
  }, [orgInstitutionId, orgCategoryId, orgTypeId]);

  useEffect(() => {
    let active = true;
    const loadTeams = async () => {
      if (!orgInstitutionId || !orgCategoryId || !orgTypeId || !orgDepartmentId) {
        setOrgTeams([]);
        return;
      }
      try {
        const data = await getOrgTeams(
          orgInstitutionId,
          orgCategoryId,
          orgTypeId,
          orgDepartmentId,
        );
        if (!active) return;
        setOrgTeams(Array.isArray(data) ? data : []);
      } catch {
        if (!active) return;
        setOrgTeams([]);
      }
    };
    loadTeams();
    return () => {
      active = false;
    };
  }, [orgInstitutionId, orgCategoryId, orgTypeId, orgDepartmentId]);

  useEffect(() => {
    if (!showModal || !isEdit) return;
    if (!orgInstitutionId && form.institution) {
      const match = orgInstitutions.find(
        (item) =>
          String(item?.name || "").toLowerCase() ===
          String(form.institution || "").toLowerCase(),
      );
      if (match?.id) setOrgInstitutionId(String(match.id));
    }
  }, [showModal, isEdit, form.institution, orgInstitutionId, orgInstitutions]);

  useEffect(() => {
    if (!showModal || !isEdit) return;
    if (!orgCategoryId && form.institutionCategory) {
      const match = orgCategories.find(
        (item) =>
          String(item?.name || "").toLowerCase() ===
          String(form.institutionCategory || "").toLowerCase(),
      );
      if (match?.id) setOrgCategoryId(String(match.id));
    }
  }, [showModal, isEdit, form.institutionCategory, orgCategoryId, orgCategories]);

  useEffect(() => {
    if (!showModal || !isEdit) return;
    if (!orgTypeId && form.institutionType) {
      const match = orgTypes.find(
        (item) =>
          String(item?.name || "").toLowerCase() ===
          String(form.institutionType || "").toLowerCase(),
      );
      if (match?.id) setOrgTypeId(String(match.id));
    }
  }, [showModal, isEdit, form.institutionType, orgTypeId, orgTypes]);

  useEffect(() => {
    if (!showModal || !isEdit) return;
    if (!orgDepartmentId && form.userDepartmentName) {
      const match = orgDepartments.find(
        (item) =>
          String(item?.name || "").toLowerCase() ===
          String(form.userDepartmentName || "").toLowerCase(),
      );
      if (match?.id) setOrgDepartmentId(String(match.id));
    }
  }, [showModal, isEdit, form.userDepartmentName, orgDepartmentId, orgDepartments]);

  useEffect(() => {
    if (!showModal || !isEdit) return;
    if (!orgTeamId && form.team) {
      const match = orgTeams.find(
        (item) =>
          String(item?.name || "").toLowerCase() ===
          String(form.team || "").toLowerCase(),
      );
      if (match?.id) setOrgTeamId(String(match.id));
    }
  }, [showModal, isEdit, form.team, orgTeamId, orgTeams]);



  const openAdd = () => {
    const role = String(currentUser?.role || "").toUpperCase();
    const managerTeam =
      String(orgSelection?.teamName || "").trim() ||
      String(currentUser?.team || "").trim();
    const defaultForm = {
      ...EMPTY_FORM,
      institutionType: String(currentUser?.institutionType || "").trim(),
      userDepartmentName:
        String(orgSelection?.departmentName || "").trim() ||
        String(currentUser?.departmentName || "").trim(),
      team: role === "MANAGER" ? managerTeam : "",
    };
    setForm(defaultForm);
    if (role === "SUPER_ADMIN") {
      setOrgInstitutionId("");
      setOrgCategoryId("");
      setOrgTypeId("");
      setOrgDepartmentId("");
      setOrgTeamId("");
    } else {
      setOrgInstitutionId(String(orgSelection?.institutionId || ""));
      setOrgCategoryId(String(orgSelection?.categoryId || ""));
      setOrgTypeId(String(orgSelection?.typeId || ""));
      setOrgDepartmentId(String(orgSelection?.departmentId || ""));
      setOrgTeamId(role === "MANAGER" ? String(orgSelection?.teamId || "") : "");
    }
    setIsEdit(false);
    setPhoneError("");
    setShowModal(true);
  };

  const openEdit = (emp) => {
    setForm({
      employeeCode: emp.employeeCode || "",
      name: emp.name || "",
      email: emp.email || "",
      countryCode: emp.countryCode || defaultCountryOption.value,
      phone: emp.phone || "",
      dept: emp.dept || "",
      institution: emp.institution || "",
      institutionCategory: emp.institutionCategory || "",
      institutionType: emp.institutionType || "",
      userDepartmentName: emp.userDepartmentName || "",
      team: emp.team || "",
      designation: emp.designation || "",
      joinDate: emp.joinDate || "",
      status: String(emp.status || "ACTIVE").toUpperCase(),
      img: emp.img || "assets/img/users/user-32.jpg",
    });
    setSelectedId(emp.id);
    const institutionMatch = orgInstitutions.find(
      (item) =>
        String(item?.name || "").toLowerCase() ===
        String(emp.institution || "").toLowerCase(),
    );
    setOrgInstitutionId(institutionMatch?.id ? String(institutionMatch.id) : "");
    setIsEdit(true);
    setShowModal(true);
  };

  const departmentOptions = useMemo(() => {
    const names = (departments || [])
      .map((d) => d?.name)
      .filter((v) => typeof v === "string" && v.trim().length > 0);
    return Array.from(new Set(names)).sort((a, b) => a.localeCompare(b));
  }, [departments]);

  const designationOptions = useMemo(() => {
    const dept = String(form.dept || "").trim().toLowerCase();
    if (!dept) return [];
    const items = (designations || []).map((d) => ({
      name: d?.name || "",
      department: d?.department || d?.departmentName || d?.dept || "",
    }));
    const filtered = items.filter(
      (d) => String(d.department || "").trim().toLowerCase() === dept,
    );
    const names = filtered
      .map((d) => d.name)
      .filter((v) => typeof v === "string" && v.trim().length > 0);
    return Array.from(new Set(names)).sort((a, b) => a.localeCompare(b));
  }, [designations, form.dept]);

  const handleDeptChange = (value) => {
    setForm((prev) => {
      const next = { ...prev, dept: value };
      if (prev.designation) {
        const match = (designations || []).some(
          (d) =>
            String(d?.department || d?.departmentName || d?.dept || "").trim().toLowerCase() ===
              String(value || "").trim().toLowerCase() &&
            String(d?.name || "").trim().toLowerCase() ===
              String(prev.designation || "").trim().toLowerCase(),
        );
        if (!match) next.designation = "";
      }
      return next;
    });
  };

  const selectedInstitution = orgInstitutions.find(
    (item) => String(item.id) === String(orgInstitutionId),
  );
  const selectedCategory = orgCategories.find(
    (item) => String(item.id) === String(orgCategoryId),
  );
  const selectedType = orgTypes.find(
    (item) => String(item.id) === String(orgTypeId),
  );
  const selectedOrgDepartment = orgDepartments.find(
    (item) => String(item.id) === String(orgDepartmentId),
  );
  const selectedOrgTeam = orgTeams.find(
    (item) => String(item.id) === String(orgTeamId),
  );
  const currentRole = String(currentUser?.role || "").toUpperCase();
  const isAdmin = currentRole === "ADMIN";
  const isManager = currentRole === "MANAGER";

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate phone number
    const phoneValidationError = validatePhoneNumber(form.phone, form.countryCode);
    if (phoneValidationError) {
      setPhoneError(phoneValidationError);
      return;
    }

    if (!orgInstitutionId) {
      showError("Institution is required");
      return;
    }
    if (!orgCategoryId) {
      showError("Category is required");
      return;
    }
    if (!orgTypeId) {
      showError("Type is required");
      return;
    }
    if (!orgDepartmentId) {
      showError("Department is required");
      return;
    }
    
    setSaving(true);
    try {
      const payload = toApiPayload({
        ...form,
        institution: selectedInstitution?.name || form.institution,
        institutionCategory: selectedCategory?.name || form.institutionCategory,
        institutionType: selectedType?.name || form.institutionType,
        userDepartmentName: selectedOrgDepartment?.name || form.userDepartmentName,
        team: selectedOrgTeam?.name || form.team,
      });
      if (isEdit) {
        await updateEmployee(selectedId, payload);
        showSuccess("Employee updated successfully");
      } else {
        await createEmployee(payload);
        showSuccess("Employee added successfully");
      }
      setShowModal(false);
      setForm(EMPTY_FORM);
      setSelectedId(null);
      setPhoneError("");
      await loadData();
    } catch (e2) {
      showError(extractApiErrorMessage(e2, "Operation failed"));
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = (id) => {
    setDeleteId(id);
    setShowDeleteModal(true);
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setSaving(true);
    try {
      await deleteEmployee(deleteId);
      showSuccess("Employee deleted successfully");
      setShowDeleteModal(false);
      setDeleteId(null);
      await loadData();
    } catch (e) {
      showError(extractApiErrorMessage(e, "Failed to delete employee"));
    } finally {
      setSaving(false);
    }
  };

  const employeeGridData = rows.map(r => ({
    ...r,
    role: r.designation,
    projects: 0, done: 0, progress: 0, productivity: 0 // Placeholder for grid stats
  }));

  if (gridView) {
    return (
      <div className="container-fluid">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h4 className="mb-0">Employees Grid</h4>
          <button className="btn btn-primary" onClick={openAdd}>Add Employee</button>
        </div>
        <div className="row">
          {loading ? <div>Loading...</div> : employeeGridData.map((emp, idx) => (
            <div className="col-xl-3 col-lg-4 col-md-6 d-flex" key={`${emp.name}-${idx}`}>
              <div className="card flex-fill">
                <div className="card-body">
                  <div className="position-absolute top-0 end-0 p-2">
                    <button className="btn btn-sm btn-light" onClick={() => openEdit(emp)}><EditGlyph size={12} /></button>
                    <button className="btn btn-sm btn-light text-danger ms-1" onClick={() => confirmDelete(emp.id)}><TrashGlyph size={12} /></button>
                  </div>
                  <div className="d-flex align-items-center mb-3">
                    <img
                      src={emp.img || "assets/img/users/user-32.jpg"}
                      alt={emp.name}
                      className="rounded-circle me-2"
                      width="42"
                      height="42"
                    />
                    <div>
                      <h6 className="mb-0">{emp.name || "-"}</h6>
                      <small className="text-muted">{emp.role}</small>
                    </div>
                  </div>
                  <p className="mb-1">Projects: {emp.projects}</p>
                  <p className="mb-1">Done: {emp.done}</p>
                  <p className="mb-1">In Progress: {emp.progress}</p>
                  <p className="mb-0">Productivity: {emp.productivity}%</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h4 className="mb-0">Employees</h4>
        <button className="btn btn-primary" onClick={openAdd}>Add Employee</button>
      </div>
      <div className="card">
        <div className="card-header">
          <h5 className="mb-0">Employee List</h5>
        </div>
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-striped table-hover mb-0">
              <thead>
                <tr>
                  <th>Employee ID</th>
                  <th>Employee</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Department</th>
                  <th>Designation</th>
                  <th>Join Date</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {loading ? <tr><td colSpan="9">Loading...</td></tr> : rows.map((emp) => (
                  <tr key={emp.id}>
                    <td>{emp.employeeCode || "-"}</td>
                    <td>
                      <div className="d-flex align-items-center">
                        <img
                          src={emp.img || "assets/img/users/user-32.jpg"}
                          alt={emp.name}
                          className="rounded-circle me-2"
                          width="34"
                          height="34"
                        />
                        <span>{emp.name}</span>
                      </div>
                    </td>
                    <td>{emp.email}</td>
                    <td>{emp.phone}</td>
                    <td>{emp.dept || "-"}</td>
                    <td>{emp.designation}</td>
                    <td>{emp.joinDate || "-"}</td>
                    <td>
                      <span
                        className={`badge ${
                          emp.status === "ACTIVE" ? "badge-success" : "badge-danger"
                        }`}
                      >
                        {emp.status === "ACTIVE" ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td>
                      <button className="btn btn-sm btn-outline-primary" onClick={() => openEdit(emp)}><EditGlyph size={12} /></button>
                      <button className="btn btn-sm btn-outline-danger ms-1" onClick={() => confirmDelete(emp.id)}><TrashGlyph size={12} /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {showModal && (
        <>
          <div className="modal fade show" style={{ display: "block" }} tabIndex="-1">
            <div className="modal-dialog modal-lg">
              <form className="modal-content" onSubmit={handleSubmit}>
                <div className="modal-header">
                  <h5 className="modal-title">{isEdit ? "Edit Employee" : "Add Employee"}</h5>
                  <button type="button" className="btn-close" onClick={() => {
                    setShowModal(false);
                    setPhoneError("");
                  }} />
                </div>
                <div className="modal-body">
                  <div className="row g-3">
                    <div className="col-md-6">
                      <label className="form-label">Employee Code</label>
                      <input className="form-control" value={form.employeeCode} disabled placeholder="Auto generated" />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Full Name</label>
                      <input className="form-control" value={form.name} onChange={e => setForm({...form, name: e.target.value})} required />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Email</label>
                      <input type="email" className="form-control" value={form.email} onChange={e => setForm({...form, email: e.target.value})} required />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Country Code</label>
                      <select
                        className="form-select"
                        value={form.countryCode}
                        onChange={(e) => {
                          setForm({...form, countryCode: e.target.value});
                          setPhoneError("");
                        }}
                      >
                        {COUNTRY_CODE_OPTIONS.map((option) => (
                          <option key={`${option.country}-${option.callingCode}`} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Mobile Number</label>
                      <input
                        type="tel"
                        className={`form-control ${phoneError ? "is-invalid" : ""}`}
                        value={form.phone}
                        onChange={(e) => {
                          const sanitized = sanitizePhoneDigits(
                            e.target.value,
                            getCountryDisplayMaxLength(form.countryCode)
                          );
                          setForm({...form, phone: sanitized});
                          if (phoneError) {
                            const error = validatePhoneNumber(sanitized, form.countryCode);
                            setPhoneError(error);
                          }
                        }}
                        placeholder={`Enter ${getCountryDisplayMaxLength(form.countryCode)} digit number`}
                      />
                      {phoneError && (
                        <div className="invalid-feedback d-block">{phoneError}</div>
                      )}
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Department</label>
                      <select
                        className="form-select"
                        value={form.dept}
                        onChange={(e) => handleDeptChange(e.target.value)}
                        disabled={metaLoading}
                      >
                        <option value="">Select</option>
                        {form.dept && !departmentOptions.includes(form.dept) && (
                          <option value={form.dept}>{form.dept}</option>
                        )}
                        {departmentOptions.map((name) => (
                          <option key={name} value={name}>
                            {name}
                          </option>
                        ))}
                      </select>
                    </div>
                      <div className="col-md-6">
                      <label className="form-label">Designation</label>
                      <select
                        className="form-select"
                        value={form.designation}
                        onChange={(e) => setForm({ ...form, designation: e.target.value })}
                        disabled={metaLoading || !form.dept}
                      >
                        <option value="">Select</option>
                        {form.designation && !designationOptions.includes(form.designation) && (
                          <option value={form.designation}>{form.designation}</option>
                        )}
                        {designationOptions.map((name) => (
                          <option key={name} value={name}>
                            {name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Join Date</label>
                      <input type="date" className="form-control" value={form.joinDate} onChange={e => setForm({...form, joinDate: e.target.value})} />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Status</label>
                      <select className="form-select" value={form.status} onChange={e => setForm({...form, status: e.target.value})}>
                        <option value="ACTIVE">Active</option>
                        <option value="INACTIVE">Inactive</option>
                      </select>
                    </div>
                    <div className="col-12">
                      <hr className="my-1" />
                      <h6 className="mb-0">Organization Details</h6>
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Institution *</label>
                      <select
                        className="form-select"
                        value={orgInstitutionId}
                        onChange={(e) => {
                          const val = e.target.value;
                          setOrgInstitutionId(val);
                          setOrgCategoryId("");
                          setOrgTypeId("");
                          setOrgDepartmentId("");
                          setOrgTeamId("");
                          setForm((prev) => ({
                            ...prev,
                            institution: "",
                            institutionCategory: "",
                            institutionType: "",
                            userDepartmentName: "",
                            team: "",
                          }));
                        }}
                        disabled={isAdmin || isManager}
                      >
                        <option value="">Select</option>
                        {orgInstitutions.map((item) => (
                          <option key={item.id} value={item.id}>
                            {item.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Category *</label>
                      <select
                        className="form-select"
                        value={orgCategoryId}
                        onChange={(e) => {
                          const val = e.target.value;
                          setOrgCategoryId(val);
                          setOrgTypeId("");
                          setOrgDepartmentId("");
                          setOrgTeamId("");
                          setForm((prev) => ({
                            ...prev,
                            institutionCategory: "",
                            institutionType: "",
                            userDepartmentName: "",
                            team: "",
                          }));
                        }}
                        disabled={!orgInstitutionId || isAdmin || isManager}
                      >
                        <option value="">Select</option>
                        {orgCategories.map((item) => (
                          <option key={item.id} value={item.id}>
                            {item.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Type *</label>
                      <select
                        className="form-select"
                        value={orgTypeId}
                        onChange={(e) => {
                          const val = e.target.value;
                          setOrgTypeId(val);
                          setOrgDepartmentId("");
                          setOrgTeamId("");
                          const selected = orgTypes.find(
                            (item) => String(item.id) === String(val),
                          );
                          setForm((prev) => ({
                            ...prev,
                            institutionType: selected?.name || "",
                            userDepartmentName: "",
                            team: "",
                          }));
                        }}
                        disabled={!orgCategoryId || isAdmin || isManager}
                      >
                        <option value="">Select</option>
                        {orgTypes.map((item) => (
                          <option key={item.id} value={item.id}>
                            {item.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Department *</label>
                      <select
                        className="form-select"
                        value={orgDepartmentId}
                        onChange={(e) => {
                          const val = e.target.value;
                          setOrgDepartmentId(val);
                          setOrgTeamId("");
                          const selected = orgDepartments.find(
                            (item) => String(item.id) === String(val),
                          );
                          setForm((prev) => ({
                            ...prev,
                            userDepartmentName: selected?.name || "",
                            team: "",
                          }));
                        }}
                        disabled={!orgTypeId || isAdmin || isManager}
                      >
                        <option value="">Select</option>
                        {orgDepartments.map((item) => (
                          <option key={item.id} value={item.id}>
                            {item.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Team (Optional)</label>
                      <select
                        className="form-select"
                        value={orgTeamId}
                        onChange={(e) => {
                          const val = e.target.value;
                          setOrgTeamId(val);
                          const selected = orgTeams.find(
                            (item) => String(item.id) === String(val),
                          );
                          setForm((prev) => ({
                            ...prev,
                            team: selected?.name || "",
                          }));
                        }}
                        disabled={!orgDepartmentId || isManager}
                      >
                        <option value="">Select</option>
                        {orgTeams.map((item) => (
                          <option key={item.id} value={item.id}>
                            {item.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-light" onClick={() => {
                    setShowModal(false);
                    setPhoneError("");
                  }}>Cancel</button>
                  <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? "Saving..." : "Save Changes"}</button>
                </div>
              </form>
            </div>
          </div>
          <div className="modal-backdrop fade show" />
        </>
      )}

      {showDeleteModal && (
        <>
          <div className="modal fade show" style={{ display: "block" }} tabIndex="-1">
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">Confirm Delete</h5>
                  <button type="button" className="btn-close" onClick={() => setShowDeleteModal(false)} />
                </div>
                <div className="modal-body">
                  <p>Are you sure you want to delete this employee? This action cannot be undone.</p>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-light" onClick={() => setShowDeleteModal(false)}>Cancel</button>
                  <button type="button" className="btn btn-danger" onClick={handleDelete} disabled={saving}>
                    {saving ? "Deleting..." : "Delete"}
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
