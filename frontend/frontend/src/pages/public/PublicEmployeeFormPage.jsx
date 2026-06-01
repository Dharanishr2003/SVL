import React, { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { getPublicEmployeeForm, submitPublicEmployeeForm } from "../../api/employeesApi";
import { extractApiErrorMessage } from "../../utils/errorMessage";
import { useToast } from "../../components/system/ToastProvider";
import { defaultCountryOption, getCountryDisplayMaxLength, sanitizePhoneDigits } from "../../utils/phoneUtils";

function isBlank(value) {
  return value === null || value === undefined || String(value).trim() === "";
}

const PUBLIC_FORM_SECTION_CONFIGS = [
  {
    key: "personal",
    title: "Personal Details",
    fieldKeys: [
      "NAME",
      "DEPT",
      "FATHER_NAME",
      "MOTHER_NAME",
      "ALTERNATE_CONTACT_NUMBER",
      "PERSONAL_EMAIL",
      "OFFICIAL_EMAIL",
      "DATE_OF_BIRTH",
      "GENDER",
      "MARITAL_STATUS",
      "SPOUSE_NAME",
      "BLOOD_GROUP",
    ],
    uploadDocTypes: ["CANDIDATE_PHOTO"],
    uploadAfterFieldKey: "DATE_OF_BIRTH",
  },
  {
    key: "address",
    title: "Address Details",
    fieldKeys: ["LOCATION", "PIN_CODE", "STATE", "CURRENT_ADDRESS", "PERMANENT_ADDRESS", "PAN_NUMBER", "AADHAAR_NUMBER"],
    uploadDocTypes: ["AADHAAR_CARD", "PAN_CARD"],
    uploadAfterFieldKey: "PERMANENT_ADDRESS",
  },
  {
    key: "education",
    title: "Education Details",
    fieldKeys: ["GRADUATION_DETAILS", "HSC_MARK_AND_YEAR", "SSLC_MARK_AND_YEAR"],
    uploadDocTypes: [
      "CERTIFICATE",
      "GRADUATION_CERTIFICATE",
      "GRADUATION_MARKSHEET",
      "HSC_MARKSHEET",
      "SSLC_MARKSHEET",
      "COMMUNITY_CERTIFICATE",
    ],
    uploadAfterFieldKey: "SSLC_MARK_AND_YEAR",
  },
  {
    key: "bank",
    title: "Bank Details",
    fieldKeys: ["BANK_ACCOUNT_HOLDER_NAME", "BANK_ACCOUNT_NUMBER", "BANK_IFSC", "BANK_NAME_BRANCH"],
    uploadDocTypes: ["BANK_PASSBOOK"],
    uploadAfterFieldKey: "BANK_NAME_BRANCH",
  },
  {
    key: "previousEmployment",
    title: "Previous Employment",
    fieldKeys: [
      "PLATFORM_SOURCE",
      "PREVIOUS_EMPLOYMENT_JOINING_DATE",
      "PREVIOUS_EMPLOYMENT_RELIEVING_DATE",
      "PREVIOUS_EMPLOYMENT_SALARY_AT_JOINING",
      "PREVIOUS_EMPLOYMENT_SALARY_AT_RELIEVING",
      "PREVIOUS_EMPLOYMENT_RELIEVED_WITH_NOTICE_PERIOD",
      "PREVIOUS_EMPLOYMENT_ABSCONDED",
      "PREVIOUS_EMPLOYMENT_DESIGNATION_AT_JOINING",
      "PREVIOUS_EMPLOYMENT_DESIGNATION_AT_RELIEVING",
      "PREVIOUS_EMPLOYMENT_MANAGER_NAME",
      "PREVIOUS_EMPLOYMENT_MANAGER_MOBILE_NUMBER",
      "PREVIOUS_EMPLOYMENT_COMPANY_ADDRESS",
    ],
    uploadDocTypes: ["RESUME", "EXPERIENCE_CERTIFICATE"],
    uploadAfterFieldKey: "PREVIOUS_EMPLOYMENT_COMPANY_ADDRESS",
  },
  {
    key: "emergencyContacts",
    title: "Emergency Contacts",
    fieldKeys: [
      "EMERGENCY_CONTACT_NAME_1",
      "EMERGENCY_CONTACT_RELATION_1",
      "EMERGENCY_CONTACT_PHONE_1",
      "EMERGENCY_CONTACT_NAME_2",
      "EMERGENCY_CONTACT_RELATION_2",
      "EMERGENCY_CONTACT_PHONE_2",
    ],
    uploadDocTypes: [],
  },
  {
    key: "friendReferences",
    title: "Friend References",
    fieldKeys: ["FRIEND_REF_NAME_1", "FRIEND_REF_CONTACT_1", "FRIEND_REF_NAME_2", "FRIEND_REF_CONTACT_2"],
    uploadDocTypes: [],
  },
  {
    key: "pfEsiDetails",
    title: "PF / ESI Details",
    fieldKeys: ["PF_UAN", "ESI_NO"],
    uploadDocTypes: [],
  },
  {
    key: "declarationDetails",
    title: "Declaration Details",
    fieldKeys: ["DECLARATION_DATE", "DECLARATION_PLACE"],
    uploadDocTypes: [],
  },
];

export default function PublicEmployeeFormPage() {
  const { token } = useParams();
  const { showSuccess, showError } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [data, setData] = useState(null);
  const [form, setForm] = useState({});
  const [initialForm, setInitialForm] = useState({});
  const [files, setFiles] = useState({}); // { DOC_TYPE: File | File[] }

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const res = await getPublicEmployeeForm(token);
        setData(res);
        const initial = {};
        (res?.fields || []).forEach((f) => {
          initial[f.fieldKey] = f.currentValue || "";
        });
        // COUNTRY_CODE is submitted for PHONE-type fields, but we don't want a separate country-code UI.
        // Default it if missing so backend validation stays stable.
        if (!initial.COUNTRY_CODE) {
          initial.COUNTRY_CODE = defaultCountryOption.value;
        }
        setForm(initial);
        setInitialForm(initial);
      } catch (e) {
        showError(extractApiErrorMessage(e, "Invalid or expired link"));
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [token, showError]);

  const fieldList = useMemo(() => (data?.fields || []), [data]);
  const uploadList = useMemo(() => (data?.uploads || []), [data]);

  const editableFieldList = useMemo(
    () =>
      fieldList.filter((f) => {
        const status = String(f?.status || "").toUpperCase();
        // In update links, approved fields should not appear again.
        if (status === "APPROVED") return false;
        // Respect backend "editable" hint.
        return f?.editable !== false;
      }),
    [fieldList],
  );

  const editableUploadList = useMemo(
    () =>
      uploadList.filter((u) => {
        const status = String(u?.status || "").toUpperCase();
        if (status === "APPROVED") return false;
        return u?.editable !== false;
      }),
    [uploadList],
  );

  const hiddenScalarKeys = useMemo(
    () =>
      new Set([
        "HEAD_OFFICE_ID",
        "BRANCH_ID",
        "DEPARTMENT_MASTER_ID",
        "DESIGNATION_MASTER_ID",
        "INSTITUTION",
        "DEPARTMENT_NAME",
        "TEAM",
        "DESIGNATION",
        "STATUS",
        "COUNTRY_CODE",
        "PHONE",
      ]),
    [],
  );

  const dropdownKeys = useMemo(
    () =>
      new Set([
        "GENDER",
        "MARITAL_STATUS",
        "BLOOD_GROUP",
        "GRADUATION_DETAILS",
        "PLATFORM_SOURCE",
      ]),
    [],
  );

  const yesNoFieldKeys = useMemo(
    () =>
      new Set([
        "PREVIOUS_EMPLOYMENT_RELIEVED_WITH_NOTICE_PERIOD",
        "PREVIOUS_EMPLOYMENT_ABSCONDED",
      ]),
    [],
  );

  const groupedMobileKeys = useMemo(() => new Set(["COUNTRY_CODE", "PHONE"]), []);

  const uploadByDocType = useMemo(
    () => new Map(editableUploadList.map((upload) => [upload.docType, upload])),
    [editableUploadList],
  );

  const handleDateChange = (fieldKey, value) => {
    setForm((prev) => {
      if (!value) {
        return { ...prev, [fieldKey]: "" };
      }

      const [year] = String(value).split("-");
      if (!year || year.length !== 4 || !/^\d{4}$/.test(year)) {
        return prev;
      }

      return { ...prev, [fieldKey]: value };
    });
  };

  const renderUploadField = (upload) => {
    if (!upload) return null;
    const rejected = String(upload.status || "").toUpperCase() === "REJECTED";
    return (
      <div key={upload.docType} className="mb-3">
        <label className="form-label">
          {upload.label || upload.docType} {rejected ? <span className="text-danger">*</span> : null}
        </label>
        {rejected && upload.remarks ? (
          <div className="text-danger small mb-1">Remark: {upload.remarks}</div>
        ) : null}
        <input
          type="file"
          multiple={upload.docType === "CERTIFICATE"}
          className="form-control"
          accept={upload.docType === "CANDIDATE_PHOTO" ? "image/*" : undefined}
          onChange={(e) => {
            const selected = Array.from(e.target.files || []);
            setFiles((p) => ({
              ...p,
              [upload.docType]: upload.docType === "CERTIFICATE" ? selected : (selected[0] || null),
            }));
          }}
        />
      </div>
    );
  };

  const renderFieldControl = (f) => {
    if (!f) return null;
    if (f.fieldKey === "SPOUSE_NAME" && String(form.MARITAL_STATUS || "").toUpperCase() !== "MARRIED") {
      return null;
    }

    const rejected = String(f.status || "").toUpperCase() === "REJECTED";
    const inputType = String(f.inputType || "TEXT").toUpperCase();
    const editable = f.editable !== false;
    const lockedDepartment = f.fieldKey === "DEPT";
    const isDropdown = dropdownKeys.has(f.fieldKey);
    const isYesNoSelect = yesNoFieldKeys.has(f.fieldKey);
    const isStandalonePhone = f.fieldKey === "PREVIOUS_EMPLOYMENT_MANAGER_MOBILE_NUMBER";

    return (
      <div key={f.fieldKey} className="mb-3">
        <label className="form-label">
          {f.label || f.fieldKey} {rejected ? <span className="text-danger">*</span> : null}
        </label>
        {rejected && f.remarks ? <div className="text-danger small mb-1">Remark: {f.remarks}</div> : null}
        {isDropdown || isYesNoSelect ? (
          <select
            className="form-select"
            value={form[f.fieldKey] || ""}
            onChange={(e) => setForm((p) => ({ ...p, [f.fieldKey]: e.target.value }))}
            disabled={!editable || lockedDepartment}
          >
            <option value="">Select</option>
            {f.fieldKey === "GENDER" ? (
              <>
                <option value="MALE">Male</option>
                <option value="FEMALE">Female</option>
                <option value="OTHER">Other</option>
              </>
            ) : null}
            {f.fieldKey === "MARITAL_STATUS" ? (
              <>
                <option value="SINGLE">Single</option>
                <option value="MARRIED">Married</option>
                <option value="DIVORCED">Divorced</option>
                <option value="WIDOWED">Widowed</option>
              </>
            ) : null}
            {f.fieldKey === "BLOOD_GROUP" ? (
              <>
                <option value="A+">A+</option>
                <option value="A-">A-</option>
                <option value="B+">B+</option>
                <option value="B-">B-</option>
                <option value="O+">O+</option>
                <option value="O-">O-</option>
                <option value="AB+">AB+</option>
                <option value="AB-">AB-</option>
              </>
            ) : null}
            {f.fieldKey === "GRADUATION_DETAILS" ? (
              <>
                <option value="SSLC">SSLC</option>
                <option value="HSC">HSC</option>
                <option value="UG">UG</option>
                <option value="PG">PG</option>
                <option value="OTHER">Other</option>
              </>
            ) : null}
            {f.fieldKey === "PLATFORM_SOURCE" ? (
              <>
                <option value="REFERRAL">Referral</option>
                <option value="WALK_IN">Walk-in</option>
                <option value="ONLINE">Online</option>
                <option value="JOB_PORTAL">Job Portal</option>
                <option value="OTHER">Other</option>
              </>
            ) : null}
            {isYesNoSelect ? (
              <>
                <option value="YES">Yes</option>
                <option value="NO">No</option>
              </>
            ) : null}
          </select>
        ) : inputType === "TEXTAREA" ? (
          <textarea
            className="form-control"
            rows={3}
            value={form[f.fieldKey] || ""}
            onChange={(e) => setForm((p) => ({ ...p, [f.fieldKey]: e.target.value }))}
            disabled={!editable || lockedDepartment}
          />
        ) : inputType === "DATE" ? (
          <input
            type="date"
            className="form-control"
            value={form[f.fieldKey] || ""}
            max="9999-12-31"
            onChange={(e) => handleDateChange(f.fieldKey, e.target.value)}
            disabled={!editable || lockedDepartment}
          />
        ) : inputType === "EMAIL" ? (
          <input
            type="email"
            className="form-control"
            value={form[f.fieldKey] || ""}
            onChange={(e) => setForm((p) => ({ ...p, [f.fieldKey]: e.target.value }))}
            disabled={!editable || lockedDepartment}
          />
        ) : inputType === "NUMBER" ? (
          <input
            type="number"
            className="form-control"
            value={form[f.fieldKey] || ""}
            onChange={(e) => setForm((p) => ({ ...p, [f.fieldKey]: e.target.value }))}
            disabled={!editable || lockedDepartment}
          />
        ) : isStandalonePhone ? (
          <input
            type="tel"
            className="form-control"
            maxLength={15}
            value={form[f.fieldKey] || ""}
            onChange={(e) => {
              const sanitized = sanitizePhoneDigits(e.target.value, 15);
              setForm((p) => ({ ...p, [f.fieldKey]: sanitized }));
            }}
            disabled={!editable || lockedDepartment}
          />
        ) : inputType === "PHONE" ? (
          <input
            type="tel"
            className="form-control"
            maxLength={getCountryDisplayMaxLength(form.COUNTRY_CODE || defaultCountryOption.value) || 15}
            value={form[f.fieldKey] || ""}
            onChange={(e) => {
              const sanitized = sanitizePhoneDigits(
                e.target.value,
                getCountryDisplayMaxLength(form.COUNTRY_CODE || defaultCountryOption.value),
              );
              setForm((p) => ({ ...p, [f.fieldKey]: sanitized }));
            }}
            disabled={!editable || lockedDepartment}
            placeholder={`Enter ${getCountryDisplayMaxLength(form.COUNTRY_CODE || defaultCountryOption.value)} digit number`}
          />
        ) : (
          <input
            type="text"
            className="form-control"
            value={form[f.fieldKey] || ""}
            onChange={(e) => setForm((p) => ({ ...p, [f.fieldKey]: e.target.value }))}
            disabled={!editable || lockedDepartment}
            placeholder={lockedDepartment ? "Assigned by HR" : undefined}
          />
        )}
      </div>
    );
  };

  const renderSection = (section) => {
    const sectionFields = editableFieldList.filter(
      (field) => section.fieldKeys.includes(field.fieldKey) && !hiddenScalarKeys.has(field.fieldKey),
    ).sort((a, b) => section.fieldKeys.indexOf(a.fieldKey) - section.fieldKeys.indexOf(b.fieldKey));
    const sectionUploads = (section.uploadDocTypes || [])
      .map((docType) => uploadByDocType.get(docType))
      .filter(Boolean);

    if (sectionFields.length === 0 && sectionUploads.length === 0) {
      return null;
    }

    const uploadAnchor = section.uploadAfterFieldKey || null;
    let uploadsInserted = false;

    return (
      <section key={section.key} className="mb-4">
        <h5 className="mb-3">{section.title}</h5>
        {sectionFields.map((field) => {
          const node = renderFieldControl(field);
          const shouldInsertUploads = !uploadsInserted && uploadAnchor && field.fieldKey === uploadAnchor && sectionUploads.length > 0;
          if (!shouldInsertUploads) {
            return node;
          }
          uploadsInserted = true;
          return (
            <React.Fragment key={field.fieldKey}>
              {node}
              {sectionUploads.map(renderUploadField)}
            </React.Fragment>
          );
        })}
        {!uploadsInserted && sectionUploads.map(renderUploadField)}
      </section>
    );
  };

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    try {
      const fd = new FormData();
      editableFieldList.forEach((f) => {
        const fieldKey = f.fieldKey;
        const val = form[fieldKey];
        const initial = initialForm[fieldKey];
        const changed = String(val || "") !== String(initial || "");
        const alwaysSubmit = fieldKey === "DEPT";
        if (!isBlank(val) && (alwaysSubmit || changed || groupedMobileKeys.has(fieldKey))) {
          fd.append(`field_${fieldKey}`, val);
        }
      });

      editableUploadList.forEach((u) => {
        const docType = u.docType;
        const v = files[docType];
        if (!v) return;
        if (Array.isArray(v)) {
          v.forEach((file) => fd.append(`doc_${docType}`, file));
        } else {
          fd.append(`doc_${docType}`, v);
        }
      });

      const res = await submitPublicEmployeeForm(token, fd);
      showSuccess("Submitted for verification");
      setData((prev) => prev ? { ...prev, submitted: true, profileStatus: res?.profileStatus } : prev);
    } catch (e2) {
      showError(extractApiErrorMessage(e2, "Failed to submit"));
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="container py-5">
        <div className="card">
          <div className="card-body">Loading...</div>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="container py-5">
        <div className="card">
          <div className="card-body text-danger">Invalid or expired link.</div>
        </div>
      </div>
    );
  }

  const noFields = (data.fields || []).length === 0 && (data.uploads || []).length === 0;
  const noEditableFields = editableFieldList.length === 0 && editableUploadList.length === 0;

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-lg-8">
          <div className="card">
            <div className="card-header">
              <h4 className="mb-0">Complete Your Profile</h4>
              <div className="text-muted small">
                {data.name || "Employee"} · {data.emailMasked || ""} {data.phoneMasked ? `· ${data.phoneMasked}` : ""}
              </div>
            </div>
            <div className="card-body">
              {noFields || noEditableFields ? (
                <div className="alert alert-success mb-0">No fields required at this time.</div>
              ) : (
                <form onSubmit={handleSubmit}>
                  {PUBLIC_FORM_SECTION_CONFIGS.map(renderSection)}

                  <button className="btn btn-primary" type="submit" disabled={saving}>
                    {saving ? "Submitting..." : "Submit"}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
