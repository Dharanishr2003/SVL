import { useEffect, useMemo, useState } from "react";
import { getMailSettings, saveMailSettings, sendTestMail } from "../../api/mailSettingsApi";
import { useToast } from "../../components/system/ToastProvider";
import { extractApiErrorMessage } from "../../utils/errorMessage";

const DEFAULT_FORM = {
  enabled: true,
  host: "",
  port: 587,
  username: "",
  password: "",
  smtpAuth: true,
  starttls: true,
  fromAddress: "",
  fromName: "SVL",
  cc: "",
  bcc: "",
};

export default function EmailSettingsPage() {
  const { showSuccess, showError } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [hasPassword, setHasPassword] = useState(false);
  const [form, setForm] = useState(DEFAULT_FORM);
  const [testTo, setTestTo] = useState("");

  const canSave = useMemo(() => {
    if (!form.enabled) return true;
    return String(form.host || "").trim() !== "" && Number(form.port) > 0;
  }, [form.enabled, form.host, form.port]);

  useEffect(() => {
    let isMounted = true;
    const load = async () => {
      setLoading(true);
      try {
        const data = await getMailSettings();
        if (!isMounted) return;
        if (!data) {
          setForm(DEFAULT_FORM);
          setHasPassword(false);
          return;
        }
        setForm((prev) => ({
          ...prev,
          enabled: !!data.enabled,
          host: data.host || "",
          port: data.port ?? 587,
          username: data.username || "",
          password: "",
          smtpAuth: data.smtpAuth ?? true,
          starttls: data.starttls ?? true,
          fromAddress: data.fromAddress || "",
          fromName: data.fromName || "SVL",
          cc: data.cc || "",
          bcc: data.bcc || "",
        }));
        setHasPassword(!!data.hasPassword);
      } catch (e) {
        if (isMounted) showError(extractApiErrorMessage(e, "Failed to load mail settings"));
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    load();
    return () => {
      isMounted = false;
    };
  }, [showError]);

  async function handleSave() {
    if (!canSave) {
      showError("Host and port are required when mail is enabled");
      return;
    }
    setSaving(true);
    try {
      const payload = {
        enabled: !!form.enabled,
        host: form.host,
        port: Number(form.port),
        username: form.username,
        password: String(form.password || "").trim() ? form.password : undefined,
        smtpAuth: !!form.smtpAuth,
        starttls: !!form.starttls,
        fromAddress: form.fromAddress,
        fromName: form.fromName,
        cc: form.cc,
        bcc: form.bcc,
      };
      const res = await saveMailSettings(payload);
      setHasPassword(!!res?.hasPassword || (hasPassword && !String(form.password || "").trim()));
      setForm((p) => ({ ...p, password: "" }));
      showSuccess("Mail settings saved");
    } catch (e) {
      showError(extractApiErrorMessage(e, "Failed to save mail settings"));
    } finally {
      setSaving(false);
    }
  }

  async function handleTest() {
    const to = String(testTo || "").trim();
    if (!to) {
      showError("Enter a test recipient email");
      return;
    }
    setTesting(true);
    try {
      await sendTestMail(to);
      showSuccess("Test email sent");
    } catch (e) {
      showError(extractApiErrorMessage(e, "Failed to send test email"));
    } finally {
      setTesting(false);
    }
  }

  return (
    <div className="container-fluid">
      <div className="d-flex align-items-center justify-content-between mb-3">
        <div>
          <h3 className="page-title mb-1">Mail Settings</h3>
          <div className="text-muted small">Configure SMTP used by the backend to send emails.</div>
        </div>
        <button className="btn btn-primary" onClick={handleSave} disabled={loading || saving || !canSave}>
          {saving ? "Saving..." : "Save"}
        </button>
      </div>

      <div className="card mb-3">
        <div className="card-body">
          {loading ? (
            <div>Loading...</div>
          ) : (
            <div className="row g-3">
              <div className="col-md-3">
                <label className="form-label">Enabled</label>
                <div className="form-check form-switch">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    checked={!!form.enabled}
                    onChange={(e) => setForm((p) => ({ ...p, enabled: e.target.checked }))}
                  />
                  <label className="form-check-label text-muted">Send emails</label>
                </div>
              </div>

              <div className="col-md-3">
                <label className="form-label">SMTP Host</label>
                <input
                  className="form-control"
                  value={form.host}
                  onChange={(e) => setForm((p) => ({ ...p, host: e.target.value }))}
                  placeholder="smtp.gmail.com"
                />
              </div>

              <div className="col-md-2">
                <label className="form-label">Port</label>
                <input
                  type="number"
                  className="form-control"
                  value={form.port}
                  onChange={(e) => setForm((p) => ({ ...p, port: e.target.value }))}
                />
              </div>

              <div className="col-md-4">
                <label className="form-label">Username</label>
                <input
                  className="form-control"
                  value={form.username}
                  onChange={(e) => setForm((p) => ({ ...p, username: e.target.value }))}
                />
              </div>

              <div className="col-md-4">
                <label className="form-label">Password</label>
                <input
                  type="password"
                  className="form-control"
                  value={form.password}
                  onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
                  placeholder={hasPassword ? "Password is set (enter to change)" : "Enter password"}
                  autoComplete="new-password"
                />
                <div className="text-muted small mt-1">
                  {hasPassword ? "Password is already set. Leave blank to keep it unchanged." : "Password is not set yet."}
                </div>
              </div>

              <div className="col-md-2">
                <label className="form-label">SMTP Auth</label>
                <select
                  className="form-select"
                  value={String(!!form.smtpAuth)}
                  onChange={(e) => setForm((p) => ({ ...p, smtpAuth: e.target.value === "true" }))}
                >
                  <option value="true">true</option>
                  <option value="false">false</option>
                </select>
              </div>

              <div className="col-md-2">
                <label className="form-label">STARTTLS</label>
                <select
                  className="form-select"
                  value={String(!!form.starttls)}
                  onChange={(e) => setForm((p) => ({ ...p, starttls: e.target.value === "true" }))}
                >
                  <option value="true">true</option>
                  <option value="false">false</option>
                </select>
              </div>

              <div className="col-md-4">
                <label className="form-label">From Address</label>
                <input
                  className="form-control"
                  value={form.fromAddress}
                  onChange={(e) => setForm((p) => ({ ...p, fromAddress: e.target.value }))}
                  placeholder="no-reply@yourdomain.com"
                />
              </div>

              <div className="col-md-4">
                <label className="form-label">From Name</label>
                <input
                  className="form-control"
                  value={form.fromName}
                  onChange={(e) => setForm((p) => ({ ...p, fromName: e.target.value }))}
                />
              </div>

              <div className="col-md-6">
                <label className="form-label">Default CC (comma separated)</label>
                <input
                  className="form-control"
                  value={form.cc}
                  onChange={(e) => setForm((p) => ({ ...p, cc: e.target.value }))}
                  placeholder="cc1@example.com, cc2@example.com"
                />
              </div>

              <div className="col-md-6">
                <label className="form-label">Default BCC (comma separated)</label>
                <input
                  className="form-control"
                  value={form.bcc}
                  onChange={(e) => setForm((p) => ({ ...p, bcc: e.target.value }))}
                  placeholder="bcc1@example.com, bcc2@example.com"
                />
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h5 className="card-title mb-0">Send Test Email</h5>
        </div>
        <div className="card-body">
          <div className="row g-2 align-items-end">
            <div className="col-md-6">
              <label className="form-label">To Address</label>
              <input className="form-control" value={testTo} onChange={(e) => setTestTo(e.target.value)} />
            </div>
            <div className="col-md-3">
              <button className="btn btn-outline-primary w-100" onClick={handleTest} disabled={loading || testing}>
                {testing ? "Sending..." : "Send Test"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
