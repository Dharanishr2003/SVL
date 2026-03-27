import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { createChannelPartner } from "../../api/channelPartnerApi";
import { extractApiErrorMessage } from "../../utils/errorMessage";
import { useToast } from "../../components/system/ToastProvider";

const initialForm = {
  channelPartnerType: "",
  companyName: "",
  partnerName: "",
  mobile: "",
  officeLandlineNumber: "",
  emailAddress: "",
  companyRegistrationNumber: "",
  registeredAddress: "",
  communicationAddress: "",
  message: "",
  websiteUrl: "",
  aadhaarNumber: "",
  panCompany: "",
  gstRegistrationNumber: "",
  reraRegistrationNumber: "",
  beneficiaryBankName: "",
  bankAccountNo: "",
  beneficiaryName: "",
  ifscCode: "",
  aadhaarCopy: null,
  panCopy: null,
  gstCopy: null,
  reraCopy: null,
};

const typeOptions = ["Individual", "Company", "Broker", "Agent", "Other"];

export default function CreateChannelPartnerPage() {
  const navigate = useNavigate();
  const { showSuccess, showError } = useToast();
  const [form, setForm] = useState(initialForm);
  const [saving, setSaving] = useState(false);

  const requiredMissing = useMemo(() => {
    const missing = [];
    if (!form.companyName.trim()) missing.push("Company Name");
    if (!form.partnerName.trim()) missing.push("Owner/Partner Name");
    if (!form.mobile.trim()) missing.push("Mobile Number");
    if (!form.emailAddress.trim()) missing.push("Email Address");
    return missing;
  }, [form]);

  const onFilePick = (key) => (e) => {
    const file = e.target.files?.[0] || null;
    setForm((prev) => ({ ...prev, [key]: file }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (requiredMissing.length) {
      showError(`Missing required fields: ${requiredMissing.join(", ")}`);
      return;
    }
    setSaving(true);
    try {
      const fd = new FormData();
      const append = (key, value) => {
        if (value === null || value === undefined || value === "") return;
        fd.append(key, value);
      };
      append("channelPartnerType", form.channelPartnerType);
      append("companyName", form.companyName.trim());
      append("partnerName", form.partnerName.trim());
      append("mobile", form.mobile.trim());
      append("emailAddress", form.emailAddress.trim());
      append("officeLandlineNumber", form.officeLandlineNumber?.trim() || "");
      append("companyRegistrationNumber", form.companyRegistrationNumber?.trim() || "");
      append("registeredAddress", form.registeredAddress?.trim() || "");
      append("communicationAddress", form.communicationAddress?.trim() || "");
      append("message", form.message?.trim() || "");
      append("websiteUrl", form.websiteUrl?.trim() || "");
      append("aadhaarNumber", form.aadhaarNumber?.trim() || "");
      append("panCompany", form.panCompany?.trim() || "");
      append("gstRegistrationNumber", form.gstRegistrationNumber?.trim() || "");
      append("reraRegistrationNumber", form.reraRegistrationNumber?.trim() || "");
      append("beneficiaryBankName", form.beneficiaryBankName?.trim() || "");
      append("bankAccountNo", form.bankAccountNo?.trim() || "");
      append("beneficiaryName", form.beneficiaryName?.trim() || "");
      append("ifscCode", form.ifscCode?.trim() || "");
      if (form.aadhaarCopy) fd.append("aadhaarCopy", form.aadhaarCopy);
      if (form.panCopy) fd.append("panCopy", form.panCopy);
      if (form.gstCopy) fd.append("gstCopy", form.gstCopy);
      if (form.reraCopy) fd.append("reraCopy", form.reraCopy);
      await createChannelPartner(fd);
      showSuccess("Channel Partner registered");
      setTimeout(() => navigate("/channel-partners"), 700);
    } catch (e2) {
      showError(extractApiErrorMessage(e2, "Failed to register channel partner"));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="content">
      <div className="d-md-flex d-block align-items-center justify-content-between page-breadcrumb mb-3">
        <div className="my-auto mb-2">
          <h2 className="mb-1">Create New Channel Partners</h2>
          <nav>
            <ol className="breadcrumb mb-0">
              <li className="breadcrumb-item">
                <Link to="/dashboard"><i className="ti ti-smart-home"></i></Link>
              </li>
              <li className="breadcrumb-item">Channel Partners</li>
              <li className="breadcrumb-item active" aria-current="page">Create New Channel Partners</li>
            </ol>
          </nav>
        </div>
      </div>

      <div className="card">
        <div className="card-body">
          <form onSubmit={handleSubmit}>
            <div className="row">
              <div className="col-lg-6">
                <div className="mb-3">
                  <label className="form-label">Type Of Channel Partner</label>
                  <select
                    className="form-select"
                    value={form.channelPartnerType}
                    onChange={(e) => setForm((prev) => ({ ...prev, channelPartnerType: e.target.value }))}
                  >
                    <option value="">Select Type Of Channel Partner</option>
                    {typeOptions.map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>

                <div className="mb-3">
                  <label className="form-label">Company Name</label>
                  <input
                    className="form-control"
                    value={form.companyName}
                    onChange={(e) => setForm((prev) => ({ ...prev, companyName: e.target.value }))}
                    placeholder="Company Name*"
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label">Owner/Partner's Name</label>
                  <input
                    className="form-control"
                    value={form.partnerName}
                    onChange={(e) => setForm((prev) => ({ ...prev, partnerName: e.target.value }))}
                    placeholder="Owner/Partner's Name*"
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label">Mobile Number</label>
                  <input
                    className="form-control"
                    value={form.mobile}
                    onChange={(e) => setForm((prev) => ({ ...prev, mobile: e.target.value }))}
                    placeholder="Mobile Number*"
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label">Office Landline Number</label>
                  <input
                    className="form-control"
                    value={form.officeLandlineNumber}
                    onChange={(e) => setForm((prev) => ({ ...prev, officeLandlineNumber: e.target.value }))}
                    placeholder="Office Landline Number (Optional)"
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label">Email Address</label>
                  <input
                    className="form-control"
                    value={form.emailAddress}
                    onChange={(e) => setForm((prev) => ({ ...prev, emailAddress: e.target.value }))}
                    placeholder="Email Address*"
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label">Company Registration Number</label>
                  <input
                    className="form-control"
                    value={form.companyRegistrationNumber}
                    onChange={(e) => setForm((prev) => ({ ...prev, companyRegistrationNumber: e.target.value }))}
                    placeholder="Company/Firm Registration Number"
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label">Registered Address</label>
                  <textarea
                    className="form-control"
                    rows="3"
                    value={form.registeredAddress}
                    onChange={(e) => setForm((prev) => ({ ...prev, registeredAddress: e.target.value }))}
                    placeholder="Registered Address"
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label">Communication Address</label>
                  <textarea
                    className="form-control"
                    rows="3"
                    value={form.communicationAddress}
                    onChange={(e) => setForm((prev) => ({ ...prev, communicationAddress: e.target.value }))}
                    placeholder="Communication Address"
                  />
                </div>
              </div>

              <div className="col-lg-6">
                <div className="mb-3">
                  <label className="form-label">Message</label>
                  <textarea
                    className="form-control"
                    rows="3"
                    value={form.message}
                    onChange={(e) => setForm((prev) => ({ ...prev, message: e.target.value }))}
                    placeholder="Message"
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label">Website URL</label>
                  <input
                    className="form-control"
                    value={form.websiteUrl}
                    onChange={(e) => setForm((prev) => ({ ...prev, websiteUrl: e.target.value }))}
                    placeholder="Website URL"
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label">Aadhaar Number</label>
                  <input
                    className="form-control"
                    value={form.aadhaarNumber}
                    onChange={(e) => setForm((prev) => ({ ...prev, aadhaarNumber: e.target.value }))}
                    placeholder="Aadhaar Number"
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label">Upload Aadhaar Copy</label>
                  <input type="file" className="form-control" onChange={onFilePick("aadhaarCopy")} />
                </div>

                <div className="mb-3">
                  <label className="form-label">PAN of the Company</label>
                  <input
                    className="form-control"
                    value={form.panCompany}
                    onChange={(e) => setForm((prev) => ({ ...prev, panCompany: e.target.value }))}
                    placeholder="PAN of the Company"
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label">Upload PAN Copy</label>
                  <input type="file" className="form-control" onChange={onFilePick("panCopy")} />
                </div>

                <div className="mb-3">
                  <label className="form-label">GST Registration Number</label>
                  <input
                    className="form-control"
                    value={form.gstRegistrationNumber}
                    onChange={(e) => setForm((prev) => ({ ...prev, gstRegistrationNumber: e.target.value }))}
                    placeholder="GST Registration Number"
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label">Upload GST Copy</label>
                  <input type="file" className="form-control" onChange={onFilePick("gstCopy")} />
                </div>

                <div className="mb-3">
                  <label className="form-label">RERA Registration Number</label>
                  <input
                    className="form-control"
                    value={form.reraRegistrationNumber}
                    onChange={(e) => setForm((prev) => ({ ...prev, reraRegistrationNumber: e.target.value }))}
                    placeholder="RERA Registration Number"
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label">Upload RERA Copy</label>
                  <input type="file" className="form-control" onChange={onFilePick("reraCopy")} />
                </div>
              </div>
            </div>

            <div className="text-center my-3">
              <h5>Account Details</h5>
            </div>

            <div className="row">
              <div className="col-md-6">
                <div className="mb-3">
                  <label className="form-label">Beneficiary Bank Name</label>
                  <input
                    className="form-control"
                    value={form.beneficiaryBankName}
                    onChange={(e) => setForm((prev) => ({ ...prev, beneficiaryBankName: e.target.value }))}
                    placeholder="Beneficiary Bank Name"
                  />
                </div>
              </div>
              <div className="col-md-6">
                <div className="mb-3">
                  <label className="form-label">Beneficiary Name</label>
                  <input
                    className="form-control"
                    value={form.beneficiaryName}
                    onChange={(e) => setForm((prev) => ({ ...prev, beneficiaryName: e.target.value }))}
                    placeholder="Beneficiary Name"
                  />
                </div>
              </div>
              <div className="col-md-6">
                <div className="mb-3">
                  <label className="form-label">Bank Account No.</label>
                  <input
                    className="form-control"
                    value={form.bankAccountNo}
                    onChange={(e) => setForm((prev) => ({ ...prev, bankAccountNo: e.target.value }))}
                    placeholder="Bank Account No."
                  />
                </div>
              </div>
              <div className="col-md-6">
                <div className="mb-3">
                  <label className="form-label">IFSC Code</label>
                  <input
                    className="form-control"
                    value={form.ifscCode}
                    onChange={(e) => setForm((prev) => ({ ...prev, ifscCode: e.target.value }))}
                    placeholder="IFSC code"
                  />
                </div>
              </div>
            </div>

            <div className="text-end">
              <button type="submit" className="btn btn-primary" disabled={saving}>
                {saving ? "Registering..." : "Register Channel Partners"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
