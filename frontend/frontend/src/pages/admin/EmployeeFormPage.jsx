import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getBranches } from "../../api/branchesApi";
import { getDepartmentsMasterByBranch } from "../../api/departmentsApi";
import { getDesignations } from "../../api/designationsApi";
import { getEmployeeById, onboardEmployee, updateOnboardEmployee } from "../../api/employeesApi";
import { getHeadOffices } from "../../api/headOfficesApi";
import { extractApiErrorMessage } from "../../utils/errorMessage";
import { useToast } from "../../components/system/ToastProvider";
import {
  COUNTRY_CODE_OPTIONS,
  defaultCountryOption,
  getCountryDisplayMaxLength,
  sanitizePhoneDigits,
  validatePhoneNumber,
} from "../../utils/phoneUtils";
import "../../../public/assets/css/addModalShared.css";
import "./EmployeesPage.css";

const EMPTY_FORM = {
  nameInCaps: "",
  personalContactNumber: "",
  countryCode: defaultCountryOption.value,
  personalEmail: "",
  officialEmail: "",
  dateOfBirth: "",
  fatherName: "",
  motherName: "",
  alternateContactNumber: "",
  location: "",
  pinCode: "",
  state: "",
  currentAddress: "",
  permanentAddress: "",
  maritalStatus: "",
  spouseName: "",
  bloodGroup: "",
  graduationDetails: "",
  hscMarkAndYear: "",
  sslcMarkAndYear: "",
  candidatePhoto: null,
  uploadCandidateAadharCard: null,
  uploadCandidatePanCard: null,
  uploadBankPassBookCopy: null,
  uploadExperienceCertificate: null,
  uploadGraduationCertificate: null,
  uploadGraduationMarksheet: null,
  uploadHscMarkSheet: null,
  uploadSslcMarkSheet: null,
  uploadCommunityCertificate: null,
  bankAccountHolderName: "",
  bankAccountNumber: "",
  ifscCode: "",
  bankAndBranch: "",
  employmentDetails1: "",
  employmentDetails2: "",
  emergencyContactName1: "",
  emergencyContactRelation1: "",
  emergencyContactPhone1: "",
  emergencyContactName2: "",
  emergencyContactRelation2: "",
  emergencyContactPhone2: "",
  friendRefName1: "",
  friendRefContact1: "",
  friendRefName2: "",
  friendRefContact2: "",
  pfUan: "",
  esiNo: "",
  declarationDate: "",
  declarationPlace: "",
  branchToJoin: "",
  platformSource: "",
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

const EMPTY_FILE_PATHS = {
  candidatePhotoPath: "",
  aadharCardPath: "",
  panCardPath: "",
  bankPassbookPath: "",
  experienceCertificatePath: "",
  graduationCertificatePath: "",
  graduationMarksheetPath: "",
  hscMarksheetPath: "",
  sslcMarksheetPath: "",
  communityCertificatePath: "",
};

const EMPTY_SECTIONS = {
  familyDetails: false,
  addressDetails: false,
  educationDetails: false,
  documentUploads: false,
  bankDetails: false,
  previousEmployment: false,
  emergencyContacts: false,
  friendReferences: false,
  pfEsiDetails: false,
  declarationDetails: false,
};

function isActiveMaster(item) {
  return String(item?.status || "ACTIVE").toUpperCase() !== "INACTIVE";
}

function withInactiveSelected(items, selectedId) {
  const list = Array.isArray(items) ? items : [];
  const active = list.filter(isActiveMaster);
  if (!selectedId) return active;
  const selected = list.find((item) => String(item?.id) === String(selectedId));
  if (!selected || isActiveMaster(selected)) return active;
  return [...active, { ...selected, name: `${selected?.name || "Selected"} (Inactive)` }];
}

function hasText(value) {
  return typeof value === "string" && value.trim().length > 0;
}

function hasAnyText(source, keys) {
  return keys.some((key) => hasText(source?.[key]));
}

function pickDate(value) {
  return value ? String(value).slice(0, 10) : "";
}

function normalizeEmployee(raw = {}) {
  const form = {
    ...EMPTY_FORM,
    nameInCaps: raw?.nameInCaps || raw?.name || "",
    personalContactNumber: raw?.personalContactNumber || raw?.phone || "",
    countryCode: raw?.countryCode || defaultCountryOption.value,
    personalEmail: raw?.personalEmail || raw?.email || "",
    officialEmail: raw?.officialEmail || "",
    dateOfBirth: pickDate(raw?.dateOfBirth),
    fatherName: raw?.fatherName || "",
    motherName: raw?.motherName || "",
    alternateContactNumber: raw?.alternateContactNumber || "",
    location: raw?.location || "",
    pinCode: raw?.pinCode || "",
    state: raw?.state || "",
    currentAddress: raw?.currentAddress || "",
    permanentAddress: raw?.permanentAddress || "",
    maritalStatus: raw?.maritalStatus || "",
    spouseName: raw?.spouseName || "",
    bloodGroup: raw?.bloodGroup || "",
    graduationDetails: raw?.graduationDetails || "",
    hscMarkAndYear: raw?.hscMarkAndYear || "",
    sslcMarkAndYear: raw?.sslcMarkAndYear || "",
    bankAccountHolderName: raw?.bankAccountHolderName || "",
    bankAccountNumber: raw?.bankAccountNumber || "",
    ifscCode: raw?.ifscCode || "",
    bankAndBranch: raw?.bankAndBranch || "",
    employmentDetails1: raw?.employmentDetails1 || "",
    employmentDetails2: raw?.employmentDetails2 || "",
    emergencyContactName1: raw?.emergencyContactName1 || "",
    emergencyContactRelation1: raw?.emergencyContactRelation1 || "",
    emergencyContactPhone1: raw?.emergencyContactPhone1 || "",
    emergencyContactName2: raw?.emergencyContactName2 || "",
    emergencyContactRelation2: raw?.emergencyContactRelation2 || "",
    emergencyContactPhone2: raw?.emergencyContactPhone2 || "",
    friendRefName1: raw?.friendRefName1 || "",
    friendRefContact1: raw?.friendRefContact1 || "",
    friendRefName2: raw?.friendRefName2 || "",
    friendRefContact2: raw?.friendRefContact2 || "",
    pfUan: raw?.pfUan || "",
    esiNo: raw?.esiNo || "",
    declarationDate: pickDate(raw?.declarationDate),
    declarationPlace: raw?.declarationPlace || "",
    branchToJoin: raw?.branchToJoin || raw?.branchName || "",
    platformSource: raw?.platformSource || "",
    institution: raw?.institution || raw?.institutionName || "",
    institutionCategory: raw?.institutionCategory || raw?.institution_category || raw?.category || "",
    institutionType: raw?.institutionType || raw?.institution_type || "",
    userDepartmentName: raw?.userDepartmentName || raw?.orgDepartmentName || raw?.departmentName || "",
    team: raw?.team || raw?.orgTeam || raw?.userTeam || "",
    designation: raw?.designation || "",
    joinDate: pickDate(raw?.joinDate),
    status: String(raw?.status || "ACTIVE").toUpperCase(),
    img: raw?.img || "assets/img/users/user-32.jpg",
  };

  const existingFiles = {
    candidatePhotoPath: raw?.candidatePhotoPath || "",
    aadharCardPath: raw?.aadharCardPath || "",
    panCardPath: raw?.panCardPath || "",
    bankPassbookPath: raw?.bankPassbookPath || "",
    experienceCertificatePath: raw?.experienceCertificatePath || "",
    graduationCertificatePath: raw?.graduationCertificatePath || "",
    graduationMarksheetPath: raw?.graduationMarksheetPath || "",
    hscMarksheetPath: raw?.hscMarksheetPath || "",
    sslcMarksheetPath: raw?.sslcMarksheetPath || "",
    communityCertificatePath: raw?.communityCertificatePath || "",
  };

  const sections = {
    familyDetails: hasAnyText(form, [
      "fatherName",
      "motherName",
      "alternateContactNumber",
      "maritalStatus",
      "spouseName",
      "bloodGroup",
      "officialEmail",
    ]),
    addressDetails: hasAnyText(form, ["location", "pinCode", "state", "currentAddress", "permanentAddress"]),
    educationDetails: hasAnyText(form, ["graduationDetails", "hscMarkAndYear", "sslcMarkAndYear"]),
    documentUploads: Object.values(existingFiles).some(hasText),
    bankDetails: hasAnyText(form, ["bankAccountHolderName", "bankAccountNumber", "ifscCode", "bankAndBranch"]),
    previousEmployment: hasAnyText(form, [
      "employmentDetails1",
      "employmentDetails2",
      "branchToJoin",
      "platformSource",
      "institution",
      "institutionCategory",
      "institutionType",
      "userDepartmentName",
      "team",
      "designation",
      "joinDate",
    ]),
    emergencyContacts: hasAnyText(form, [
      "emergencyContactName1",
      "emergencyContactRelation1",
      "emergencyContactPhone1",
      "emergencyContactName2",
      "emergencyContactRelation2",
      "emergencyContactPhone2",
    ]),
    friendReferences: hasAnyText(form, ["friendRefName1", "friendRefContact1", "friendRefName2", "friendRefContact2"]),
    pfEsiDetails: hasAnyText(form, ["pfUan", "esiNo"]),
    declarationDetails: hasAnyText(form, ["declarationDate", "declarationPlace"]),
  };

  return { form, existingFiles, sections };
}

function appendIfPresent(fd, key, value) {
  if (value === null || value === undefined || value === "") return;
  fd.append(key, value);
}

function FileViewLink({ label, existingPath, fileValue, apiBase }) {
  const [objectUrl, setObjectUrl] = useState("");

  useEffect(() => {
    if (fileValue instanceof File) {
      const url = URL.createObjectURL(fileValue);
      setObjectUrl(url);
      return () => URL.revokeObjectURL(url);
    }
    setObjectUrl("");
    return undefined;
  }, [fileValue]);

  const isAbsolute = typeof existingPath === "string" && /^https?:\/\//i.test(existingPath);
  const existingUrl = existingPath
    ? isAbsolute
      ? existingPath
      : `${apiBase}${String(existingPath).startsWith("/") ? "" : "/"}${existingPath}`
    : "";
  const viewUrl = objectUrl || existingUrl;

  if (!viewUrl) return null;

  return (
    <div className="d-flex align-items-center gap-2 flex-wrap mt-1">
      <a className="btn btn-sm btn-outline-primary" href={viewUrl} target="_blank" rel="noreferrer">
        View
      </a>
      {fileValue instanceof File ? (
        <span className="text-muted small">{fileValue.name}</span>
      ) : (
        <a href={viewUrl} target="_blank" rel="noreferrer" className="small text-decoration-none">
          {label}
        </a>
      )}
    </div>
  );
}

export default function EmployeeFormPage() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const { showSuccess, showError } = useToast();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [headOffices, setHeadOffices] = useState([]);
  const [branches, setBranches] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [designations, setDesignations] = useState([]);
  const [headOfficeId, setHeadOfficeId] = useState("");
  const [branchId, setBranchId] = useState("");
  const [departmentId, setDepartmentId] = useState("");
  const [designationId, setDesignationId] = useState("");
  const [form, setForm] = useState(EMPTY_FORM);
  const [existingFiles, setExistingFiles] = useState(EMPTY_FILE_PATHS);
  const [sections, setSections] = useState(EMPTY_SECTIONS);

  const apiBase = useMemo(
    () => (import.meta.env.VITE_API_URL || "http://localhost:8081").replace(/\/+$/, ""),
    [],
  );

  const sortedHeadOffices = [...headOffices].sort((a, b) => String(a.name || "").localeCompare(String(b.name || "")));
  const sortedBranches = [...branches].sort((a, b) => String(a.name || "").localeCompare(String(b.name || "")));
  const sortedDepartments = [...departments].sort((a, b) => String(a.name || "").localeCompare(String(b.name || "")));
  const sortedDesignations = [...designations].sort((a, b) => String(a.name || "").localeCompare(String(b.name || "")));

  const selectedDesignation = sortedDesignations.find((item) => String(item.id) === String(designationId));

  const loadBranches = async (headOfficeValue, selectedBranchValue = "") => {
    if (!headOfficeValue) {
      setBranches([]);
      return [];
    }
    try {
      const data = await getBranches(headOfficeValue);
      const normalized = isEdit ? withInactiveSelected(Array.isArray(data) ? data : [], selectedBranchValue) : (Array.isArray(data) ? data : []);
      setBranches(normalized);
      return normalized;
    } catch {
      setBranches([]);
      return [];
    }
  };

  const loadDepartments = async (branchValue, selectedDepartmentValue = "") => {
    if (!branchValue) {
      setDepartments([]);
      return [];
    }
    try {
      const data = await getDepartmentsMasterByBranch(branchValue);
      const normalized = isEdit ? withInactiveSelected(Array.isArray(data) ? data : [], selectedDepartmentValue) : (Array.isArray(data) ? data : []);
      setDepartments(normalized);
      return normalized;
    } catch {
      setDepartments([]);
      return [];
    }
  };

  const loadDesignations = async (departmentValue, selectedDesignationValue = "") => {
    if (!departmentValue) {
      setDesignations([]);
      return [];
    }
    try {
      const data = await getDesignations(departmentValue);
      const normalized = isEdit ? withInactiveSelected(Array.isArray(data) ? data : [], selectedDesignationValue) : (Array.isArray(data) ? data : []);
      setDesignations(normalized);
      return normalized;
    } catch {
      setDesignations([]);
      return [];
    }
  };

  useEffect(() => {
    let active = true;

    async function load() {
      setLoading(true);
      try {
        const offices = await getHeadOffices();
        if (!active) return;
        setHeadOffices(Array.isArray(offices) ? offices : []);

        if (!isEdit || !id) {
          setForm(EMPTY_FORM);
          setExistingFiles(EMPTY_FILE_PATHS);
          setSections(EMPTY_SECTIONS);
          setHeadOfficeId("");
          setBranchId("");
          setDepartmentId("");
          setDesignationId("");
          setBranches([]);
          setDepartments([]);
          setDesignations([]);
          return;
        }

        const employee = await getEmployeeById(id);
        if (!active) return;
        const normalized = normalizeEmployee(employee || {});
        setForm(normalized.form);
        setExistingFiles(normalized.existingFiles);
        setSections(normalized.sections);

        const nextHeadOfficeId = String(employee?.headOfficeId || "");
        const nextBranchId = String(employee?.branchId || "");
        const nextDepartmentId = String(employee?.departmentMasterId || "");
        const nextDesignationId = String(employee?.designationMasterId || "");

        setHeadOfficeId(nextHeadOfficeId);
        setBranchId(nextBranchId);
        setDepartmentId(nextDepartmentId);
        setDesignationId(nextDesignationId);
        setHeadOffices(withInactiveSelected(Array.isArray(offices) ? offices : [], nextHeadOfficeId));

        await loadBranches(nextHeadOfficeId, nextBranchId);
        await loadDepartments(nextBranchId, nextDepartmentId);
        await loadDesignations(nextDepartmentId, nextDesignationId);
      } catch (e) {
        showError(extractApiErrorMessage(e, isEdit ? "Failed to load employee" : "Failed to load form"));
      } finally {
        if (active) setLoading(false);
      }
    }

    load();
    return () => {
      active = false;
    };
  }, [id, isEdit, showError]);

  const handleHeadOfficeChange = async (value) => {
    setHeadOfficeId(value);
    setBranchId("");
    setDepartmentId("");
    setDesignationId("");
    setBranches([]);
    setDepartments([]);
    setDesignations([]);
    await loadBranches(value);
  };

  const handleBranchChange = async (value) => {
    setBranchId(value);
    setDepartmentId("");
    setDesignationId("");
    setDepartments([]);
    setDesignations([]);
    await loadDepartments(value);
  };

  const handleDepartmentChange = async (value) => {
    setDepartmentId(value);
    setDesignationId("");
    setDesignations([]);
    await loadDesignations(value);
  };

  const handlePhoneChange = (value) => {
    const sanitized = sanitizePhoneDigits(value, getCountryDisplayMaxLength(form.countryCode || defaultCountryOption.value));
    setForm((prev) => ({ ...prev, personalContactNumber: sanitized }));
  };

  const handleFileChange = (key, file) => {
    setForm((prev) => ({ ...prev, [key]: file || null }));
  };

  const toggleSection = (key) => {
    setSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const validate = () => {
    if (!headOfficeId) return "Head Office is required";
    if (!branchId) return "Branch is required";
    if (!departmentId) return "Department is required";
    if (!designationId) return "Team / Designation is required";
    if (!hasText(form.nameInCaps)) return "Name is required";
    if (!hasText(form.personalContactNumber)) return "Contact Number is required";
    if (!hasText(form.personalEmail)) return "Email is required";
    if (!hasText(form.dateOfBirth)) return "DOB is required";
    const phoneError = validatePhoneNumber(form.personalContactNumber, form.countryCode || defaultCountryOption.value);
    if (phoneError) return phoneError;
    return "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const message = validate();
    if (message) {
      showError(message);
      return;
    }

    const fd = new FormData();
    fd.append("headOfficeId", headOfficeId);
    fd.append("branchId", branchId);
    fd.append("departmentMasterId", departmentId);
    fd.append("designationMasterId", designationId);
    if (selectedDesignation?.name) {
      fd.append("designation", selectedDesignation.name);
    }

    Object.entries(form).forEach(([key, value]) => {
      if (key.endsWith("Path")) return;
      if (value instanceof File) {
        fd.append(key, value);
        return;
      }
      appendIfPresent(fd, key, value);
    });

    setSaving(true);
    try {
      if (isEdit) {
        await updateOnboardEmployee(id, fd);
        showSuccess("Employee updated successfully");
      } else {
        await onboardEmployee(fd);
        showSuccess("Employee added successfully");
      }
      navigate("/employees");
    } catch (e) {
      showError(extractApiErrorMessage(e, isEdit ? "Failed to update employee" : "Failed to add employee"));
    } finally {
      setSaving(false);
    }
  };

  const setField = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div className="container-fluid">
      <div className="card">
        <div className="card-header d-flex align-items-center justify-content-between flex-wrap gap-2">
          <div>
            <h5 className="mb-0">{isEdit ? "Edit Employee" : "Add Employee"}</h5>
            <small className="text-muted">Maintain employee onboarding details.</small>
          </div>
          <button type="button" className="btn btn-outline-secondary" onClick={() => navigate("/employees")}>
            Back
          </button>
        </div>

        <div className="card-body">
          {loading ? (
            <div className="py-4 text-center text-muted">Loading employee form...</div>
          ) : (
            <form id="employee-form" onSubmit={handleSubmit}>
              <div className="row g-3">
                <div className="col-12">
                  <p className="avm-section-title">Organization Details</p>
                </div>
                <div className="col-md-6">
                  <div className="avm-field">
                    <label className="avm-label">Head Office <span className="text-danger">*</span></label>
                    <select
                      className="avm-select form-select"
                      value={headOfficeId}
                      onChange={(e) => handleHeadOfficeChange(e.target.value)}
                    >
                      <option value="">Select</option>
                      {sortedHeadOffices.map((item) => (
                        <option key={item.id} value={item.id}>
                          {item.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="avm-field">
                    <label className="avm-label">Branch <span className="text-danger">*</span></label>
                    <select
                      className="avm-select form-select"
                      value={branchId}
                      onChange={(e) => handleBranchChange(e.target.value)}
                      disabled={!headOfficeId}
                    >
                      <option value="">Select</option>
                      {sortedBranches.map((item) => (
                        <option key={item.id} value={item.id}>
                          {item.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="avm-field">
                    <label className="avm-label">Department <span className="text-danger">*</span></label>
                    <select
                      className="avm-select form-select"
                      value={departmentId}
                      onChange={(e) => handleDepartmentChange(e.target.value)}
                      disabled={!branchId}
                    >
                      <option value="">Select</option>
                      {sortedDepartments.map((item) => (
                        <option key={item.id} value={item.id}>
                          {item.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="avm-field">
                    <label className="avm-label">Team / Designation <span className="text-danger">*</span></label>
                    <select
                      className="avm-select form-select"
                      value={designationId}
                      onChange={(e) => setDesignationId(e.target.value)}
                      disabled={!departmentId}
                    >
                      <option value="">Select</option>
                      {sortedDesignations.map((item) => (
                        <option key={item.id} value={item.id}>
                          {item.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="col-12">
                  <p className="avm-section-title">Basic Details</p>
                </div>
                <div className="col-md-6">
                  <div className="avm-field">
                    <label className="avm-label">Name <span className="text-danger">*</span></label>
                    <input
                      type="text"
                      className="avm-input form-control"
                      value={form.nameInCaps}
                      onChange={(e) => setField("nameInCaps", e.target.value)}
                    />
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="avm-field">
                    <label className="avm-label">Contact Number <span className="text-danger">*</span></label>
                    <div className="employee-phone-input user-wizard-phone-group">
                      <select
                        className="employee-phone-code"
                        value={form.countryCode || defaultCountryOption.value}
                        onChange={(e) => setField("countryCode", e.target.value)}
                      >
                        {COUNTRY_CODE_OPTIONS.map((option) => (
                          <option key={`${option.country}-${option.callingCode}`} value={option.value}>
                            {option.value}
                          </option>
                        ))}
                      </select>
                      <input
                        type="tel"
                        className="employee-phone-number avm-input form-control"
                        placeholder={`Enter ${getCountryDisplayMaxLength(form.countryCode || defaultCountryOption.value)} digit number`}
                        value={form.personalContactNumber}
                        onChange={(e) => handlePhoneChange(e.target.value)}
                      />
                    </div>
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="avm-field">
                    <label className="avm-label">Email <span className="text-danger">*</span></label>
                    <input
                      type="email"
                      className="avm-input form-control"
                      value={form.personalEmail}
                      onChange={(e) => setField("personalEmail", e.target.value)}
                    />
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="avm-field">
                    <label className="avm-label">DOB <span className="text-danger">*</span></label>
                    <input
                      type="date"
                      className="avm-input form-control"
                      value={form.dateOfBirth}
                      onChange={(e) => setField("dateOfBirth", e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <div className="card mt-4">
                <div className="card-header">
                  <p className="avm-section-title mb-0">Additional Details</p>
                </div>
                <div className="card-body">
                  <div className="row g-3">
                    {[
                      ["familyDetails", "Family Details"],
                      ["addressDetails", "Address Details"],
                      ["educationDetails", "Education Details"],
                      ["documentUploads", "Document Uploads"],
                      ["bankDetails", "Bank Details"],
                      ["previousEmployment", "Previous Employment"],
                      ["emergencyContacts", "Emergency Contacts"],
                      ["friendReferences", "Friend / Ex-Colleague References"],
                      ["pfEsiDetails", "PF / ESI Details"],
                      ["declarationDetails", "Declaration Details"],
                    ].map(([key, label]) => (
                      <div className="col-md-6" key={key}>
                        <label className="form-check d-flex gap-2 align-items-center mb-0">
                          <input
                            type="checkbox"
                            className="form-check-input"
                            checked={sections[key]}
                            onChange={() => toggleSection(key)}
                          />
                          <span className="form-check-label">{label}</span>
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {sections.familyDetails && (
                <div className="card mt-4">
                  <div className="card-body">
                    <p className="avm-section-title">Family Details</p>
                    <div className="row g-3">
                      <div className="col-md-6">
                        <div className="avm-field">
                          <label className="avm-label">Father's Name</label>
                          <input className="avm-input form-control" value={form.fatherName} onChange={(e) => setField("fatherName", e.target.value)} />
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="avm-field">
                          <label className="avm-label">Mother's Name</label>
                          <input className="avm-input form-control" value={form.motherName} onChange={(e) => setField("motherName", e.target.value)} />
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="avm-field">
                          <label className="avm-label">Alternate Contact Number</label>
                          <input className="avm-input form-control" value={form.alternateContactNumber} onChange={(e) => setField("alternateContactNumber", e.target.value)} />
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="avm-field">
                          <label className="avm-label">Marital Status</label>
                          <select className="avm-select form-select" value={form.maritalStatus} onChange={(e) => setField("maritalStatus", e.target.value)}>
                            <option value="">Select</option>
                            <option value="SINGLE">Single</option>
                            <option value="MARRIED">Married</option>
                            <option value="DIVORCED">Divorced</option>
                            <option value="WIDOWED">Widowed</option>
                          </select>
                        </div>
                      </div>
                      {String(form.maritalStatus || "").toUpperCase() === "MARRIED" && (
                        <div className="col-md-6">
                          <div className="avm-field">
                            <label className="avm-label">Spouse Name</label>
                            <input className="avm-input form-control" value={form.spouseName} onChange={(e) => setField("spouseName", e.target.value)} />
                          </div>
                        </div>
                      )}
                      <div className="col-md-6">
                        <div className="avm-field">
                          <label className="avm-label">Blood Group</label>
                          <select className="avm-select form-select" value={form.bloodGroup} onChange={(e) => setField("bloodGroup", e.target.value)}>
                            <option value="">Select</option>
                            {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map((group) => (
                              <option key={group} value={group}>
                                {group}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="avm-field">
                          <label className="avm-label">Official Email</label>
                          <input className="avm-input form-control" type="email" value={form.officialEmail} onChange={(e) => setField("officialEmail", e.target.value)} />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {sections.addressDetails && (
                <div className="card mt-4">
                  <div className="card-body">
                    <p className="avm-section-title">Address Details</p>
                    <div className="row g-3">
                      <div className="col-md-6">
                        <div className="avm-field">
                          <label className="avm-label">Location</label>
                          <input className="avm-input form-control" value={form.location} onChange={(e) => setField("location", e.target.value)} />
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="avm-field">
                          <label className="avm-label">Pin Code</label>
                          <input className="avm-input form-control" value={form.pinCode} onChange={(e) => setField("pinCode", e.target.value)} />
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="avm-field">
                          <label className="avm-label">State</label>
                          <input className="avm-input form-control" value={form.state} onChange={(e) => setField("state", e.target.value)} />
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="avm-field">
                          <label className="avm-label">Branch to Join</label>
                          <input className="avm-input form-control" value={form.branchToJoin} onChange={(e) => setField("branchToJoin", e.target.value)} />
                        </div>
                      </div>
                      <div className="col-md-12">
                        <div className="avm-field">
                          <label className="avm-label">Current Address</label>
                          <textarea rows={2} className="avm-input form-control" value={form.currentAddress} onChange={(e) => setField("currentAddress", e.target.value)} />
                        </div>
                      </div>
                      <div className="col-md-12">
                        <div className="avm-field">
                          <label className="avm-label">Permanent Address</label>
                          <textarea rows={2} className="avm-input form-control" value={form.permanentAddress} onChange={(e) => setField("permanentAddress", e.target.value)} />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {sections.educationDetails && (
                <div className="card mt-4">
                  <div className="card-body">
                    <p className="avm-section-title">Education Details</p>
                    <div className="row g-3">
                      <div className="col-md-4">
                        <div className="avm-field">
                          <label className="avm-label">Graduation Details</label>
                          <input className="avm-input form-control" value={form.graduationDetails} onChange={(e) => setField("graduationDetails", e.target.value)} />
                        </div>
                      </div>
                      <div className="col-md-4">
                        <div className="avm-field">
                          <label className="avm-label">HSC Mark & Year</label>
                          <input className="avm-input form-control" value={form.hscMarkAndYear} onChange={(e) => setField("hscMarkAndYear", e.target.value)} />
                        </div>
                      </div>
                      <div className="col-md-4">
                        <div className="avm-field">
                          <label className="avm-label">SSLC Mark & Year</label>
                          <input className="avm-input form-control" value={form.sslcMarkAndYear} onChange={(e) => setField("sslcMarkAndYear", e.target.value)} />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {sections.documentUploads && (
                <div className="card mt-4">
                  <div className="card-body">
                    <p className="avm-section-title">Document Uploads</p>
                    <div className="row g-3">
                      {[
                        ["candidatePhoto", "candidatePhotoPath", "Candidate Photo"],
                        ["uploadCandidateAadharCard", "aadharCardPath", "Aadhar Card"],
                        ["uploadCandidatePanCard", "panCardPath", "PAN Card"],
                        ["uploadBankPassBookCopy", "bankPassbookPath", "Bank Passbook Copy"],
                        ["uploadExperienceCertificate", "experienceCertificatePath", "Experience Certificate"],
                        ["uploadGraduationCertificate", "graduationCertificatePath", "Graduation Certificate"],
                        ["uploadGraduationMarksheet", "graduationMarksheetPath", "Graduation Marksheet"],
                        ["uploadHscMarkSheet", "hscMarksheetPath", "HSC Mark Sheet"],
                        ["uploadSslcMarkSheet", "sslcMarksheetPath", "SSLC Mark Sheet"],
                        ["uploadCommunityCertificate", "communityCertificatePath", "Community Certificate"],
                      ].map(([fieldKey, pathKey, label]) => (
                        <div className="col-md-6" key={fieldKey}>
                          <div className="avm-field">
                            <label className="avm-label">{label}</label>
                            <input
                              type="file"
                              className="form-control"
                              onChange={(e) => handleFileChange(fieldKey, e.target.files?.[0] || null)}
                            />
                            <FileViewLink
                              label={label}
                              existingPath={existingFiles[pathKey]}
                              fileValue={form[fieldKey]}
                              apiBase={apiBase}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {sections.bankDetails && (
                <div className="card mt-4">
                  <div className="card-body">
                    <p className="avm-section-title">Bank Details</p>
                    <div className="row g-3">
                      <div className="col-md-6">
                        <div className="avm-field">
                          <label className="avm-label">Bank Account Holder Name</label>
                          <input className="avm-input form-control" value={form.bankAccountHolderName} onChange={(e) => setField("bankAccountHolderName", e.target.value)} />
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="avm-field">
                          <label className="avm-label">Bank Account Number</label>
                          <input className="avm-input form-control" value={form.bankAccountNumber} onChange={(e) => setField("bankAccountNumber", e.target.value)} />
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="avm-field">
                          <label className="avm-label">IFSC Code</label>
                          <input className="avm-input form-control" value={form.ifscCode} onChange={(e) => setField("ifscCode", e.target.value)} />
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="avm-field">
                          <label className="avm-label">Bank & Branch</label>
                          <input className="avm-input form-control" value={form.bankAndBranch} onChange={(e) => setField("bankAndBranch", e.target.value)} />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {sections.previousEmployment && (
                <div className="card mt-4">
                  <div className="card-body">
                    <p className="avm-section-title">Previous Employment</p>
                    <div className="row g-3">
                      <div className="col-md-6">
                        <div className="avm-field">
                          <label className="avm-label">Employment Details 1</label>
                          <textarea rows={2} className="avm-input form-control" value={form.employmentDetails1} onChange={(e) => setField("employmentDetails1", e.target.value)} />
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="avm-field">
                          <label className="avm-label">Employment Details 2</label>
                          <textarea rows={2} className="avm-input form-control" value={form.employmentDetails2} onChange={(e) => setField("employmentDetails2", e.target.value)} />
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="avm-field">
                          <label className="avm-label">From Which Platform You Came to Know</label>
                          <input className="avm-input form-control" value={form.platformSource} onChange={(e) => setField("platformSource", e.target.value)} />
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="avm-field">
                          <label className="avm-label">Date of Joining</label>
                          <input type="date" className="avm-input form-control" value={form.joinDate} onChange={(e) => setField("joinDate", e.target.value)} />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {sections.emergencyContacts && (
                <div className="card mt-4">
                  <div className="card-body">
                    <p className="avm-section-title">Emergency Contacts</p>
                    <div className="row g-3">
                      <div className="col-md-4">
                        <div className="avm-field">
                          <label className="avm-label">Name 1</label>
                          <input className="avm-input form-control" value={form.emergencyContactName1} onChange={(e) => setField("emergencyContactName1", e.target.value)} />
                        </div>
                      </div>
                      <div className="col-md-4">
                        <div className="avm-field">
                          <label className="avm-label">Relationship 1</label>
                          <input className="avm-input form-control" value={form.emergencyContactRelation1} onChange={(e) => setField("emergencyContactRelation1", e.target.value)} />
                        </div>
                      </div>
                      <div className="col-md-4">
                        <div className="avm-field">
                          <label className="avm-label">Contact No 1</label>
                          <input className="avm-input form-control" value={form.emergencyContactPhone1} onChange={(e) => setField("emergencyContactPhone1", e.target.value)} />
                        </div>
                      </div>
                      <div className="col-md-4">
                        <div className="avm-field">
                          <label className="avm-label">Name 2</label>
                          <input className="avm-input form-control" value={form.emergencyContactName2} onChange={(e) => setField("emergencyContactName2", e.target.value)} />
                        </div>
                      </div>
                      <div className="col-md-4">
                        <div className="avm-field">
                          <label className="avm-label">Relationship 2</label>
                          <input className="avm-input form-control" value={form.emergencyContactRelation2} onChange={(e) => setField("emergencyContactRelation2", e.target.value)} />
                        </div>
                      </div>
                      <div className="col-md-4">
                        <div className="avm-field">
                          <label className="avm-label">Contact No 2</label>
                          <input className="avm-input form-control" value={form.emergencyContactPhone2} onChange={(e) => setField("emergencyContactPhone2", e.target.value)} />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {sections.friendReferences && (
                <div className="card mt-4">
                  <div className="card-body">
                    <p className="avm-section-title">Friend / Ex-Colleague References</p>
                    <div className="row g-3">
                      <div className="col-md-6">
                        <div className="avm-field">
                          <label className="avm-label">Name 1</label>
                          <input className="avm-input form-control" value={form.friendRefName1} onChange={(e) => setField("friendRefName1", e.target.value)} />
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="avm-field">
                          <label className="avm-label">Contact No 1</label>
                          <input className="avm-input form-control" value={form.friendRefContact1} onChange={(e) => setField("friendRefContact1", e.target.value)} />
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="avm-field">
                          <label className="avm-label">Name 2</label>
                          <input className="avm-input form-control" value={form.friendRefName2} onChange={(e) => setField("friendRefName2", e.target.value)} />
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="avm-field">
                          <label className="avm-label">Contact No 2</label>
                          <input className="avm-input form-control" value={form.friendRefContact2} onChange={(e) => setField("friendRefContact2", e.target.value)} />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {sections.pfEsiDetails && (
                <div className="card mt-4">
                  <div className="card-body">
                    <p className="avm-section-title">PF / ESI Details</p>
                    <div className="row g-3">
                      <div className="col-md-6">
                        <div className="avm-field">
                          <label className="avm-label">PF UAN</label>
                          <input className="avm-input form-control" value={form.pfUan} onChange={(e) => setField("pfUan", e.target.value)} />
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="avm-field">
                          <label className="avm-label">ESI No</label>
                          <input className="avm-input form-control" value={form.esiNo} onChange={(e) => setField("esiNo", e.target.value)} />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {sections.declarationDetails && (
                <div className="card mt-4">
                  <div className="card-body">
                    <p className="avm-section-title">Declaration Details</p>
                    <div className="row g-3">
                      <div className="col-md-6">
                        <div className="avm-field">
                          <label className="avm-label">Declaration Date</label>
                          <input type="date" className="avm-input form-control" value={form.declarationDate} onChange={(e) => setField("declarationDate", e.target.value)} />
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="avm-field">
                          <label className="avm-label">Declaration Place</label>
                          <input className="avm-input form-control" value={form.declarationPlace} onChange={(e) => setField("declarationPlace", e.target.value)} />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </form>
          )}
        </div>

        <div className="card-footer d-flex justify-content-end gap-2">
          <button type="button" className="btn btn-light" onClick={() => navigate("/employees")} disabled={saving}>
            Cancel
          </button>
          <button type="submit" form="employee-form" className="btn btn-primary" disabled={saving || loading}>
            {saving ? "Saving..." : isEdit ? "Save Changes" : "Add Employee"}
          </button>
        </div>
      </div>
    </div>
  );
}
