import React, { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { getPublicEmployeeForm, submitPublicEmployeeForm } from "../../api/employeesApi";
import { extractApiErrorMessage } from "../../utils/errorMessage";
import { useToast } from "../../components/system/ToastProvider";
import { COUNTRY_CODE_OPTIONS, defaultCountryOption } from "../../utils/phoneUtils";

function isBlank(value) {
  return value === null || value === undefined || String(value).trim() === "";
}

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

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    try {
      const fd = new FormData();
      fieldList.forEach((f) => {
        const fieldKey = f.fieldKey;
        const val = form[fieldKey];
        const initial = initialForm[fieldKey];
        const changed = String(val || "") !== String(initial || "");
        if (!isBlank(val) && changed) {
          fd.append(`field_${fieldKey}`, val);
        }
      });

      uploadList.forEach((u) => {
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
              {noFields ? (
                <div className="alert alert-success mb-0">No fields required at this time.</div>
              ) : (
                <form onSubmit={handleSubmit}>
                  {/* Org details (read-only names) and other scalar fields */}
                  {fieldList
                    .filter((f) => !hiddenScalarKeys.has(f.fieldKey))
                    .map((f) => {
                    const rejected = String(f.status || "").toUpperCase() === "REJECTED";
                    const inputType = String(f.inputType || "TEXT").toUpperCase();
                    const editable = f.editable !== false;
                    const isDropdown = dropdownKeys.has(f.fieldKey);

                    return (
                      <div key={f.fieldKey} className="mb-3">
                        <label className="form-label">
                          {f.label || f.fieldKey} {rejected ? <span className="text-danger">*</span> : null}
                        </label>
                        {rejected && f.remarks ? (
                          <div className="text-danger small mb-1">Remark: {f.remarks}</div>
                        ) : null}
                        {isDropdown ? (
                          <select
                            className="form-select"
                            value={form[f.fieldKey] || ""}
                            onChange={(e) => setForm((p) => ({ ...p, [f.fieldKey]: e.target.value }))}
                            disabled={!editable}
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
                          </select>
                        ) : inputType === "TEXTAREA" ? (
                          <textarea
                            className="form-control"
                            rows={3}
                            value={form[f.fieldKey] || ""}
                            onChange={(e) => setForm((p) => ({ ...p, [f.fieldKey]: e.target.value }))}
                            disabled={!editable}
                          />
                        ) : inputType === "DATE" ? (
                          <input
                            type="date"
                            className="form-control"
                            value={form[f.fieldKey] || ""}
                            onChange={(e) => setForm((p) => ({ ...p, [f.fieldKey]: e.target.value }))}
                            disabled={!editable}
                          />
                        ) : inputType === "EMAIL" ? (
                          <input
                            type="email"
                            className="form-control"
                            value={form[f.fieldKey] || ""}
                            onChange={(e) => setForm((p) => ({ ...p, [f.fieldKey]: e.target.value }))}
                            disabled={!editable}
                          />
                        ) : inputType === "NUMBER" ? (
                          <input
                            type="number"
                            className="form-control"
                            value={form[f.fieldKey] || ""}
                            onChange={(e) => setForm((p) => ({ ...p, [f.fieldKey]: e.target.value }))}
                            disabled={!editable}
                          />
                        ) : inputType === "PHONE" ? (
                          <input
                            type="tel"
                            className="form-control"
                            value={form[f.fieldKey] || ""}
                            onChange={(e) => setForm((p) => ({ ...p, [f.fieldKey]: e.target.value }))}
                            disabled={!editable}
                          />
                        ) : (
                          <input
                            type="text"
                            className="form-control"
                            value={form[f.fieldKey] || ""}
                            onChange={(e) => setForm((p) => ({ ...p, [f.fieldKey]: e.target.value }))}
                            disabled={!editable}
                          />
                        )}
                      </div>
                    );
                  })}

                  {/* Mobile number grouped (country code + phone) */}
                  <div className="mb-3">
                    <label className="form-label">Mobile Number</label>
                    <div className="row g-2">
                      <div className="col-4">
                        <select
                          className="form-select"
                          value={form.COUNTRY_CODE || defaultCountryOption.value}
                          onChange={(e) => setForm((p) => ({ ...p, COUNTRY_CODE: e.target.value }))}
                        >
                          {COUNTRY_CODE_OPTIONS.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                              {opt.label}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="col-8">
                        <input
                          type="tel"
                          className="form-control"
                          placeholder="Mobile number"
                          value={form.PHONE || ""}
                          onChange={(e) => setForm((p) => ({ ...p, PHONE: e.target.value }))}
                        />
                      </div>
                    </div>
                  </div>

                  {uploadList
                    .filter((u) => u.docType !== "PHOTO")
                    .map((u) => {
                    const rejected = String(u.status || "").toUpperCase() === "REJECTED";
                    return (
                      <div key={u.docType} className="mb-3">
                        <label className="form-label">
                          {u.label || u.docType} {rejected ? <span className="text-danger">*</span> : null}
                        </label>
                        {rejected && u.remarks ? (
                          <div className="text-danger small mb-1">Remark: {u.remarks}</div>
                        ) : null}
                        <input
                          type="file"
                          multiple={u.docType === "CERTIFICATE"}
                          className="form-control"
                          accept={u.docType === "CANDIDATE_PHOTO" ? "image/*" : undefined}
                          onChange={(e) => {
                            const selected = Array.from(e.target.files || []);
                            setFiles((p) => ({
                              ...p,
                              [u.docType]: u.docType === "CERTIFICATE" ? selected : (selected[0] || null),
                            }));
                          }}
                        />
                      </div>
                    );
                  })}

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
