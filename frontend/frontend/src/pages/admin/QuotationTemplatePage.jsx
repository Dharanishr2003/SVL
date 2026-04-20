import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getQuotationTemplate, saveQuotationTemplate } from "../../api/quotationTemplateApi";
import "./QuotationPage.css";
import "./QuotationTemplatePage.css";

const EMPTY_FORM = {
  companyName: "",
  companyTagline: "",
  address: "",
  phone1: "",
  phone2: "",
  workPhone: "",
  email: "",
  website: "",
  gstin: "",
  stateCode: "",
  stateName: "",
  udyamNumber: "",
  logoBase64: null,
  signatureBase64: null,
  bankName: "",
  accountNumber: "",
  ifscCode: "",
  branch: "",
  validityDays: 30,
  preparedByDefault: "",
  approvedByDefault: "",
  policyText: "",
};

function ImageUploadBlock({ label, helperLabel, maxPreviewHeight, value, onChange, onClear }) {
  const inputRef = useRef(null);

  return (
    <div className="qt-upload-block">
      <div className="qp-field-label">{label}</div>
      <div className="qt-upload-area" onClick={() => inputRef.current?.click()}>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="qt-upload-hidden"
          onChange={onChange}
          onClick={(event) => event.stopPropagation()}
        />
        {value ? (
          <>
            <img
              src={value}
              alt={label}
              className="qt-preview-img"
              style={{ maxHeight: maxPreviewHeight }}
            />
            <button
              type="button"
              className="qt-preview-clear"
              onClick={(event) => {
                event.stopPropagation();
                onClear();
              }}
              title="Remove image"
            >
              <i className="ti ti-x" />
            </button>
          </>
        ) : (
          <div className="qt-upload-placeholder">
            <i className="ti ti-cloud-upload" />
            <span className="qt-upload-placeholder-label">Click to upload</span>
            <span className="qt-upload-helper">PNG, JPG accepted</span>
          </div>
        )}
      </div>
      <div className="qt-upload-note">{helperLabel}</div>
    </div>
  );
}

export default function QuotationTemplatePage() {
  const navigate = useNavigate();
  const [form, setForm] = useState(EMPTY_FORM);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState("");
  const [saveError, setSaveError] = useState("");

  useEffect(() => {
    setLoading(true);
    getQuotationTemplate()
      .then((data) => {
        if (data && typeof data === "object") {
          setForm({
            ...EMPTY_FORM,
            ...data,
            validityDays: Number(data.validityDays) || 30,
          });
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  function handleChange(field, value) {
    setSaveStatus("");
    setSaveError("");
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function handleImageChange(field, event) {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (loadEvent) => {
      setSaveStatus("");
      setSaveError("");
      setForm((prev) => ({ ...prev, [field]: loadEvent.target?.result || null }));
    };
    reader.readAsDataURL(file);
    event.target.value = "";
  }

  async function handleSave() {
    setIsSaving(true);
    setSaveStatus("");
    setSaveError("");

    try {
      await saveQuotationTemplate({
        ...form,
        validityDays: Number(form.validityDays) || 30,
      });
      setSaveStatus("success");
    } catch (error) {
      setSaveError(error?.response?.data?.message || "Failed to save template.");
      setSaveStatus("error");
    } finally {
      setIsSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="qp-page">
        <div className="qt-loading-card qp-card">Loading template settings...</div>
      </div>
    );
  }

  return (
    <div className="qp-page">
      <div className="qp-header">
        <button className="qp-btn-ghost" onClick={() => navigate("/quotation")}>
          <i className="ti ti-arrow-left" style={{ fontSize: 14 }} />
          Back
        </button>

        <div className="qp-header-center">
          <div className="qp-title">Quotation Template</div>
          <div className="qp-subtitle">Configure your company details for PDF generation</div>
        </div>

        <div className="qt-header-actions">
          <button
            type="button"
            className="qp-btn-save"
            style={{ background: "#45597a", color: "#fff" }}
            onClick={handleSave}
            disabled={isSaving}
          >
            <i className="ti ti-device-floppy" style={{ fontSize: 14 }} />
            {isSaving ? "Saving..." : "Save"}
          </button>
        </div>
      </div>

      {saveStatus === "success" && (
        <div className="qt-save-alert success">
          <i className="ti ti-circle-check" style={{ fontSize: 16 }} />
          Template saved successfully.
        </div>
      )}
      {saveStatus === "error" && (
        <div className="qt-save-alert error">
          <i className="ti ti-alert-circle" style={{ fontSize: 16 }} />
          {saveError}
        </div>
      )}

      <div className="qp-card">
        <div className="qp-card-label">Company Info</div>

        <div className="qt-fields-grid qt-fields-grid-3">
          <div className="qp-field-group">
            <div className="qp-field-label">Company Name</div>
            <input className="qp-field-input" value={form.companyName} onChange={(e) => handleChange("companyName", e.target.value)} />
          </div>
          <div className="qp-field-group">
            <div className="qp-field-label">Company Tagline</div>
            <input className="qp-field-input" value={form.companyTagline} onChange={(e) => handleChange("companyTagline", e.target.value)} />
          </div>
          <div className="qp-field-group">
            <div className="qp-field-label">Email</div>
            <input className="qp-field-input" type="email" value={form.email} onChange={(e) => handleChange("email", e.target.value)} />
          </div>
          <div className="qp-field-group">
            <div className="qp-field-label">Website</div>
            <input className="qp-field-input" value={form.website} onChange={(e) => handleChange("website", e.target.value)} />
          </div>
          <div className="qp-field-group">
            <div className="qp-field-label">GSTIN</div>
            <input className="qp-field-input" value={form.gstin} onChange={(e) => handleChange("gstin", e.target.value)} />
          </div>
          <div className="qp-field-group">
            <div className="qp-field-label">UDYAM Number</div>
            <input className="qp-field-input" value={form.udyamNumber} onChange={(e) => handleChange("udyamNumber", e.target.value)} />
          </div>
        </div>

        <div className="qt-section-space">
          <div className="qp-field-group">
            <div className="qp-field-label">Address</div>
            <textarea className="qp-field-input" rows={3} value={form.address} onChange={(e) => handleChange("address", e.target.value)} />
          </div>
        </div>

        <div className="qt-fields-grid qt-fields-grid-4 qt-section-space">
          <div className="qp-field-group">
            <div className="qp-field-label">Phone 1</div>
            <input className="qp-field-input" value={form.phone1} onChange={(e) => handleChange("phone1", e.target.value)} />
          </div>
          <div className="qp-field-group">
            <div className="qp-field-label">Phone 2</div>
            <input className="qp-field-input" value={form.phone2} onChange={(e) => handleChange("phone2", e.target.value)} />
          </div>
          <div className="qp-field-group">
            <div className="qp-field-label">Work Phone</div>
            <input className="qp-field-input" value={form.workPhone} onChange={(e) => handleChange("workPhone", e.target.value)} />
          </div>
          <div className="qp-field-group">
            <div className="qp-field-label">State Code</div>
            <input className="qp-field-input" value={form.stateCode} onChange={(e) => handleChange("stateCode", e.target.value)} />
          </div>
          <div className="qp-field-group">
            <div className="qp-field-label">State Name</div>
            <input className="qp-field-input" value={form.stateName} onChange={(e) => handleChange("stateName", e.target.value)} />
          </div>
        </div>
      </div>

      <div className="qp-card">
        <div className="qp-card-label">Company Logo</div>
        <div className="qt-upload-sections qt-upload-sections-single">
          <ImageUploadBlock
            label="Company Logo"
            helperLabel="Logo shown in PDF header"
            maxPreviewHeight={120}
            value={form.logoBase64}
            onChange={(e) => handleImageChange("logoBase64", e)}
            onClear={() => handleChange("logoBase64", null)}
          />
        </div>
      </div>

      <div className="qp-card">
        <div className="qp-card-label">Authorised Signature</div>
        <div className="qt-upload-sections qt-upload-sections-single">
          <ImageUploadBlock
            label="Authorised Signature"
            helperLabel="Signature shown at bottom right of PDF"
            maxPreviewHeight={80}
            value={form.signatureBase64}
            onChange={(e) => handleImageChange("signatureBase64", e)}
            onClear={() => handleChange("signatureBase64", null)}
          />
        </div>
      </div>

      <div className="qp-card">
        <div className="qp-card-label">Bank Details</div>
        <div className="qt-fields-grid qt-fields-grid-4">
          <div className="qp-field-group">
            <div className="qp-field-label">Bank Name</div>
            <input className="qp-field-input" value={form.bankName} onChange={(e) => handleChange("bankName", e.target.value)} />
          </div>
          <div className="qp-field-group">
            <div className="qp-field-label">Account Number</div>
            <input className="qp-field-input" value={form.accountNumber} onChange={(e) => handleChange("accountNumber", e.target.value)} />
          </div>
          <div className="qp-field-group">
            <div className="qp-field-label">IFSC Code</div>
            <input className="qp-field-input" value={form.ifscCode} onChange={(e) => handleChange("ifscCode", e.target.value)} />
          </div>
          <div className="qp-field-group">
            <div className="qp-field-label">Branch</div>
            <input className="qp-field-input" value={form.branch} onChange={(e) => handleChange("branch", e.target.value)} />
          </div>
        </div>
      </div>

      <div className="qp-card">
        <div className="qp-card-label">Quotation Defaults</div>
        <div className="qt-fields-grid qt-fields-grid-3">
          <div className="qp-field-group">
            <div className="qp-field-label">Validity Days</div>
            <input
              className="qp-field-input"
              type="number"
              min="1"
              value={form.validityDays}
              onChange={(e) => handleChange("validityDays", Number(e.target.value) || 30)}
            />
          </div>
          <div className="qp-field-group">
            <div className="qp-field-label">Prepared By Default</div>
            <input className="qp-field-input" value={form.preparedByDefault} onChange={(e) => handleChange("preparedByDefault", e.target.value)} />
          </div>
          <div className="qp-field-group">
            <div className="qp-field-label">Approved By Default</div>
            <input className="qp-field-input" value={form.approvedByDefault} onChange={(e) => handleChange("approvedByDefault", e.target.value)} />
          </div>
        </div>
      </div>

      <div className="qp-card">
        <div className="qp-card-label">Policy &amp; Guidelines / Terms</div>
        <div className="qp-field-group">
          <div className="qp-field-label">Policy Text</div>
          <div className="qt-upload-note">Each line will appear as a bullet point in the PDF</div>
          <textarea
            className="qp-field-input"
            rows={8}
            value={form.policyText}
            placeholder="one policy point per line"
            onChange={(e) => handleChange("policyText", e.target.value)}
          />
        </div>
      </div>
    </div>
  );
}
