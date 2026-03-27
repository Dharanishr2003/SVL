import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  getChannelPartnerById,
  getChannelPartnerLeads,
  getChannelPartnerLogs,
  updateChannelPartner,
} from "../../api/channelPartnerApi";
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
  status: "Registered",
  aadhaarCopy: null,
  panCopy: null,
  gstCopy: null,
  reraCopy: null,
};

const typeOptions = ["Individual", "Company", "Broker", "Agent", "Other"];

export default function ChannelPartnerEditPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showSuccess, showError } = useToast();
  const [form, setForm] = useState(initialForm);
  const [logs, setLogs] = useState([]);
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("details");

  const requiredMissing = useMemo(() => {
    const missing = [];
    if (!form.companyName.trim()) missing.push("Company Name");
    if (!form.partnerName.trim()) missing.push("Owner/Partner Name");
    if (!form.mobile.trim()) missing.push("Mobile Number");
    if (!form.emailAddress.trim()) missing.push("Email Address");
    return missing;
  }, [form]);

  const load = async () => {
    setLoading(true);
    try {
      const data = await getChannelPartnerById(id);
      if (data) {
        setForm((prev) => ({
          ...prev,
          channelPartnerType: data.channelPartnerType || "",
          companyName: data.companyName || "",
          partnerName: data.partnerName || "",
          mobile: data.mobile || "",
          officeLandlineNumber: data.officeLandlineNumber || "",
          emailAddress: data.emailAddress || "",
          companyRegistrationNumber: data.companyRegistrationNumber || "",
          registeredAddress: data.registeredAddress || "",
          communicationAddress: data.communicationAddress || "",
          message: data.message || "",
          websiteUrl: data.websiteUrl || "",
          aadhaarNumber: data.aadhaarNumber || "",
          panCompany: data.panCompany || "",
          gstRegistrationNumber: data.gstRegistrationNumber || "",
          reraRegistrationNumber: data.reraRegistrationNumber || "",
          beneficiaryBankName: data.beneficiaryBankName || "",
          bankAccountNo: data.bankAccountNo || "",
          beneficiaryName: data.beneficiaryName || "",
          ifscCode: data.ifscCode || "",
          status: data.status || "Registered",
        }));
      }
      const [logRows, leadRows] = await Promise.all([
        getChannelPartnerLogs(id),
        getChannelPartnerLeads(id),
      ]);
      setLogs(Array.isArray(logRows) ? logRows : []);
      setLeads(Array.isArray(leadRows) ? leadRows : []);
    } catch (e) {
      showError(extractApiErrorMessage(e, "Failed to load channel partner"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!id) return;
    load();
  }, [id]);

  const onFilePick = (key) => (e) => {
    const file = e.target.files?.[0] || null;
    setForm((prev) => ({ ...prev, [key]: file }));
  };

  const handleSave = async () => {
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
      append("status", form.status || "Registered");
      if (form.aadhaarCopy) fd.append("aadhaarCopy", form.aadhaarCopy);
      if (form.panCopy) fd.append("panCopy", form.panCopy);
      if (form.gstCopy) fd.append("gstCopy", form.gstCopy);
      if (form.reraCopy) fd.append("reraCopy", form.reraCopy);

      await updateChannelPartner(id, fd);
      showSuccess("Channel Partner updated");
    } catch (e) {
      showError(extractApiErrorMessage(e, "Failed to update channel partner"));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="content">
      <div className="d-flex align-items-center gap-3 mb-3">
        <button
          className={`btn ${activeTab === "details" ? "btn-primary" : "btn-light"}`}
          onClick={() => setActiveTab("details")}
        >
          CP Details
        </button>
        <button
          className={`btn ${activeTab === "leads" ? "btn-primary" : "btn-light"}`}
          onClick={() => setActiveTab("leads")}
        >
          CP Leads
        </button>
        <div className="ms-auto">
          <button className="btn btn-light me-2" onClick={() => navigate("/channel-partners")}>Back</button>
          <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>

      {activeTab === "details" && (
        <div className="row">
          <div className="col-xl-9">
            <div className="card">
              <div className="card-body">
                {loading ? (
                  <div>Loading...</div>
                ) : (
                  <>
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
                          <input className="form-control" value={form.companyName} onChange={(e) => setForm((p) => ({ ...p, companyName: e.target.value }))} />
                        </div>
                        <div className="mb-3">
                          <label className="form-label">Owner/Partner's Name</label>
                          <input className="form-control" value={form.partnerName} onChange={(e) => setForm((p) => ({ ...p, partnerName: e.target.value }))} />
                        </div>
                        <div className="mb-3">
                          <label className="form-label">Mobile Number</label>
                          <input className="form-control" value={form.mobile} onChange={(e) => setForm((p) => ({ ...p, mobile: e.target.value }))} />
                        </div>
                        <div className="mb-3">
                          <label className="form-label">Office Landline Number</label>
                          <input className="form-control" value={form.officeLandlineNumber} onChange={(e) => setForm((p) => ({ ...p, officeLandlineNumber: e.target.value }))} />
                        </div>
                        <div className="mb-3">
                          <label className="form-label">Email Address</label>
                          <input className="form-control" value={form.emailAddress} onChange={(e) => setForm((p) => ({ ...p, emailAddress: e.target.value }))} />
                        </div>
                        <div className="mb-3">
                          <label className="form-label">Company Registration Number</label>
                          <input className="form-control" value={form.companyRegistrationNumber} onChange={(e) => setForm((p) => ({ ...p, companyRegistrationNumber: e.target.value }))} />
                        </div>
                        <div className="mb-3">
                          <label className="form-label">Registered Address</label>
                          <textarea className="form-control" rows="3" value={form.registeredAddress} onChange={(e) => setForm((p) => ({ ...p, registeredAddress: e.target.value }))} />
                        </div>
                        <div className="mb-3">
                          <label className="form-label">Communication Address</label>
                          <textarea className="form-control" rows="3" value={form.communicationAddress} onChange={(e) => setForm((p) => ({ ...p, communicationAddress: e.target.value }))} />
                        </div>
                      </div>

                      <div className="col-lg-6">
                        <div className="mb-3">
                          <label className="form-label">Message</label>
                          <textarea className="form-control" rows="3" value={form.message} onChange={(e) => setForm((p) => ({ ...p, message: e.target.value }))} />
                        </div>
                        <div className="mb-3">
                          <label className="form-label">Website URL</label>
                          <input className="form-control" value={form.websiteUrl} onChange={(e) => setForm((p) => ({ ...p, websiteUrl: e.target.value }))} />
                        </div>
                        <div className="mb-3">
                          <label className="form-label">Aadhaar Number</label>
                          <input className="form-control" value={form.aadhaarNumber} onChange={(e) => setForm((p) => ({ ...p, aadhaarNumber: e.target.value }))} />
                        </div>
                        <div className="mb-3">
                          <label className="form-label">Upload Aadhaar Copy</label>
                          <input type="file" className="form-control" onChange={onFilePick("aadhaarCopy")} />
                        </div>
                        <div className="mb-3">
                          <label className="form-label">PAN of the Company</label>
                          <input className="form-control" value={form.panCompany} onChange={(e) => setForm((p) => ({ ...p, panCompany: e.target.value }))} />
                        </div>
                        <div className="mb-3">
                          <label className="form-label">Upload PAN Copy</label>
                          <input type="file" className="form-control" onChange={onFilePick("panCopy")} />
                        </div>
                        <div className="mb-3">
                          <label className="form-label">GST Registration Number</label>
                          <input className="form-control" value={form.gstRegistrationNumber} onChange={(e) => setForm((p) => ({ ...p, gstRegistrationNumber: e.target.value }))} />
                        </div>
                        <div className="mb-3">
                          <label className="form-label">Upload GST Copy</label>
                          <input type="file" className="form-control" onChange={onFilePick("gstCopy")} />
                        </div>
                        <div className="mb-3">
                          <label className="form-label">RERA Registration Number</label>
                          <input className="form-control" value={form.reraRegistrationNumber} onChange={(e) => setForm((p) => ({ ...p, reraRegistrationNumber: e.target.value }))} />
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
                          <input className="form-control" value={form.beneficiaryBankName} onChange={(e) => setForm((p) => ({ ...p, beneficiaryBankName: e.target.value }))} />
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="mb-3">
                          <label className="form-label">Beneficiary Name</label>
                          <input className="form-control" value={form.beneficiaryName} onChange={(e) => setForm((p) => ({ ...p, beneficiaryName: e.target.value }))} />
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="mb-3">
                          <label className="form-label">Bank Account No.</label>
                          <input className="form-control" value={form.bankAccountNo} onChange={(e) => setForm((p) => ({ ...p, bankAccountNo: e.target.value }))} />
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="mb-3">
                          <label className="form-label">IFSC Code</label>
                          <input className="form-control" value={form.ifscCode} onChange={(e) => setForm((p) => ({ ...p, ifscCode: e.target.value }))} />
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="col-xl-3">
            <div className="card">
              <div className="card-body">
                <h6 className="mb-3">Channelpartners Log</h6>
                {logs.length === 0 ? (
                  <div className="text-muted">No activity yet</div>
                ) : (
                  <ul className="list-unstyled">
                    {logs.map((l) => (
                      <li key={l.id || l.createdAt} className="mb-3">
                        <div className="fw-medium">{l.action || l.status || "Activity"}</div>
                        <div className="text-muted">{l.actor || l.createdBy || ""}</div>
                        <div className="text-muted fs-12">{l.createdAt || l.createdDate || ""}</div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === "leads" && (
        <div className="card">
          <div className="card-body">
            <h5 className="mb-3">CP Leads</h5>
            <div className="table-responsive">
              <table className="table">
                <thead className="thead-light">
                  <tr>
                    <th>ID</th>
                    <th>Enquiry Name</th>
                    <th>Phone Number</th>
                    <th>Primary Source</th>
                    <th>Project Interested</th>
                    <th>Status</th>
                    <th>Owner</th>
                  </tr>
                </thead>
                <tbody>
                  {leads.length === 0 ? (
                    <tr>
                      <td colSpan={7}>No leads found</td>
                    </tr>
                  ) : (
                    leads.map((lead) => (
                      <tr key={lead.id}>
                        <td>{lead.id}</td>
                        <td>{lead.name || lead.enquiryName || "-"}</td>
                        <td>{lead.mobile || lead.phone || "-"}</td>
                        <td>{lead.primarySource || "-"}</td>
                        <td>{lead.projectInterested || lead.project || "-"}</td>
                        <td>{lead.status || "-"}</td>
                        <td>{lead.ownerName || lead.owner || "-"}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
