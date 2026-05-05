import React, { useEffect, useMemo, useState } from "react";
import {
  createEmailTemplate,
  deleteEmailTemplate,
  getEmailTemplates,
  saveEmailTemplate,
} from "../../api/emailTemplateApi";
import { extractApiErrorMessage } from "../../utils/errorMessage";
import { useToast } from "../../components/system/ToastProvider";

const EMPTY_FORM = {
  templateName: "",
  templateKey: "",
  subject: "",
  body: "",
};

export default function EmailTemplatePage() {
  const { showSuccess, showError } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [rows, setRows] = useState([]);
  const [editorMode, setEditorMode] = useState(null); // add | view | edit | null
  const [selectedRow, setSelectedRow] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);

  const loadTemplates = async () => {
    setLoading(true);
    try {
      const data = await getEmailTemplates();
      setRows(Array.isArray(data?.templates) ? data.templates : []);
    } catch (error) {
      showError(extractApiErrorMessage(error, "Failed to load email templates"));
      setRows([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTemplates();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const sortedRows = useMemo(
    () =>
      [...rows].sort((a, b) =>
        String(a?.templateName || "").localeCompare(String(b?.templateName || "")),
      ),
    [rows],
  );

  const startAdd = () => {
    setSelectedRow(null);
    setForm(EMPTY_FORM);
    setEditorMode("add");
  };

  const startView = (row) => {
    setSelectedRow(row);
    setForm({
      templateName: row?.templateName || "",
      templateKey: row?.templateKey || "",
      subject: row?.subject || "",
      body: row?.body || "",
    });
    setEditorMode("view");
  };

  const startEdit = (row) => {
    setSelectedRow(row);
    setForm({
      templateName: row?.templateName || "",
      templateKey: row?.templateKey || "",
      subject: row?.subject || "",
      body: row?.body || "",
    });
    setEditorMode("edit");
  };

  const closeEditor = () => {
    setEditorMode(null);
    setSelectedRow(null);
    setForm(EMPTY_FORM);
  };

  const updateField = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    if (!form.templateName.trim()) {
      showError("Template name is required");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        templateName: form.templateName.trim(),
        templateKey: form.templateKey.trim() || null,
        subject: form.subject,
        body: form.body,
      };

      if (editorMode === "add") {
        await createEmailTemplate(payload);
        showSuccess("Template created successfully");
      } else if (editorMode === "edit" && selectedRow?.templateKey) {
        await saveEmailTemplate(selectedRow.templateKey, payload);
        showSuccess("Template updated successfully");
      }

      await loadTemplates();
      closeEditor();
    } catch (error) {
      showError(extractApiErrorMessage(error, "Failed to save template"));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (row) => {
    if (!row?.templateKey) return;
    if (row?.builtIn) {
      showError("Default templates cannot be deleted");
      return;
    }
    const confirmed = window.confirm(`Delete template "${row.templateName}"?`);
    if (!confirmed) return;

    setSaving(true);
    try {
      await deleteEmailTemplate(row.templateKey);
      showSuccess("Template deleted successfully");
      await loadTemplates();
      if (selectedRow?.templateKey === row.templateKey) {
        closeEditor();
      }
    } catch (error) {
      showError(extractApiErrorMessage(error, "Failed to delete template"));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="container-fluid">
      <div className="d-flex flex-wrap justify-content-between align-items-start gap-2 mb-3">
        <div>
          <h4 className="mb-1">Email Templates</h4>
          <div className="text-muted">Create, review, update, and remove email templates.</div>
        </div>
        <button type="button" className="btn btn-primary" onClick={startAdd}>
          Add Template
        </button>
      </div>

      {editorMode ? (
        <div className="card mb-3 shadow-sm">
          <div className="card-header bg-white d-flex justify-content-between align-items-center">
            <div>
              <h5 className="mb-0">
                {editorMode === "add"
                  ? "Add Template"
                  : editorMode === "edit"
                    ? "Edit Template"
                    : "View Template"}
              </h5>
              <div className="text-muted small">
                {editorMode === "view"
                  ? "Read-only preview"
                  : "Update the template subject and body"}
              </div>
            </div>
            <button type="button" className="btn btn-sm btn-light" onClick={closeEditor}>
              Close
            </button>
          </div>
          <div className="card-body">
            <div className="row g-3">
              <div className="col-md-6">
                <label className="form-label">Template Name</label>
                <input
                  type="text"
                  className="form-control"
                  value={form.templateName}
                  onChange={(e) => updateField("templateName", e.target.value)}
                  disabled={editorMode === "view"}
                  placeholder="e.g. Welcome Email"
                />
              </div>
              <div className="col-md-6">
                <label className="form-label">Template Key</label>
                <input
                  type="text"
                  className="form-control"
                  value={form.templateKey}
                  onChange={(e) => updateField("templateKey", e.target.value)}
                  disabled={editorMode !== "add"}
                  placeholder="Auto-generated if left blank"
                />
              </div>
              <div className="col-12">
                <label className="form-label">Subject</label>
                <input
                  type="text"
                  className="form-control"
                  value={form.subject}
                  onChange={(e) => updateField("subject", e.target.value)}
                  disabled={editorMode === "view"}
                  placeholder="Email subject"
                />
              </div>
              <div className="col-12">
                <label className="form-label">Body</label>
                <textarea
                  className="form-control"
                  rows={10}
                  value={form.body}
                  onChange={(e) => updateField("body", e.target.value)}
                  disabled={editorMode === "view"}
                  placeholder="Email body"
                  style={{ minHeight: 220 }}
                />
              </div>
            </div>

            <div className="text-muted small mt-3">
              Use placeholders like <code>{`{{employee_name}}`}</code>, <code>{`{{designation}}`}</code>, and{" "}
              <code>{`{{company_name}}`}</code>.
            </div>

            {editorMode !== "view" ? (
              <div className="d-flex justify-content-end gap-2 mt-3">
                <button type="button" className="btn btn-light" onClick={closeEditor} disabled={saving}>
                  Cancel
                </button>
                <button type="button" className="btn btn-primary" onClick={handleSave} disabled={saving}>
                  {saving ? "Saving..." : "Save Template"}
                </button>
              </div>
            ) : null}
          </div>
        </div>
      ) : null}

      <div className="card shadow-sm">
        <div className="card-body">
          {loading ? (
            <div>Loading templates...</div>
          ) : sortedRows.length === 0 ? (
            <div className="text-muted">No templates found.</div>
          ) : (
            <div className="table-responsive">
              <table className="table align-middle">
                <thead>
                  <tr>
                    <th>Template Name</th>
                    <th>Template Key</th>
                    <th>Type</th>
                    <th>Updated</th>
                    <th className="text-end">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedRows.map((row) => (
                    <tr key={row.templateKey}>
                      <td>
                        <div className="fw-semibold">{row.templateName}</div>
                        <div className="text-muted small">{row.subject || "No subject"}</div>
                      </td>
                      <td>
                        <code>{row.templateKey}</code>
                      </td>
                      <td>
                        <span className={`badge ${row.builtIn ? "bg-secondary" : "bg-info"}`}>
                          {row.builtIn ? "Default" : "Custom"}
                        </span>
                      </td>
                      <td className="text-muted small">
                        {row.updatedAt ? new Date(row.updatedAt).toLocaleString() : "-"}
                      </td>
                      <td className="text-end">
                        <div className="btn-group">
                          <button type="button" className="btn btn-sm btn-outline-secondary" onClick={() => startView(row)}>
                            View
                          </button>
                          <button type="button" className="btn btn-sm btn-outline-primary" onClick={() => startEdit(row)}>
                            Edit
                          </button>
                          <button
                            type="button"
                            className="btn btn-sm btn-outline-danger"
                            onClick={() => handleDelete(row)}
                            disabled={saving || row.builtIn}
                            title={row.builtIn ? "Default templates cannot be deleted" : "Delete template"}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
