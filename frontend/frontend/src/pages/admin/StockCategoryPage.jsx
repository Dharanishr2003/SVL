import { useEffect, useState } from "react";
import {
  getStockCategories,
  createStockCategory,
  updateStockCategory,
  deleteStockCategory,
} from "../../api/stocksApi";
import { getVendorTypes } from "../../api/vendorTypesApi";
import PageHeader from "../../components/admin/PageHeader";
import { extractApiErrorMessage } from "../../utils/errorMessage";
import { useToast } from "../../components/system/ToastProvider";
import useConfirmDialog from "../../components/system/useConfirmDialog";
export default function StockCategoryPage() {
  const { showSuccess, showError } = useToast();
  const [categories, setCategories] = useState([]);
  const [vendorTypes, setVendorTypes] = useState([]);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: "", fields: [], allowedVendorTypeIds: [] });
  const [saving, setSaving] = useState(false);
  const [notification, setNotification] = useState(null);
  const { showConfirm, confirmDialog } = useConfirmDialog();

  const notifySuccess = (message) => {
    const payload = { type: "success", message, title: "Stock Categories" };
    setNotification(payload);
    showSuccess(message, { title: payload.title });
  };

  const notifyError = (message) => {
    const payload = { type: "error", message, title: "Stock Categories" };
    setNotification(payload);
    showError(message, { title: payload.title });
  };

  useEffect(() => {
    if (!notification) return undefined;
    const timeout = window.setTimeout(() => setNotification(null), 5000);
    return () => window.clearTimeout(timeout);
  }, [notification]);

  useEffect(() => {
    load();
    loadVendorTypes();
  }, []);

  const loadVendorTypes = async () => {
    try {
      const types = await getVendorTypes();
      setVendorTypes(Array.isArray(types) ? types : []);
    } catch (e) {
      console.warn("failed to load vendor types", e);
    }
  };
  const load = async () => {
    try {
      const cats = await getStockCategories();
      setCategories(cats);
    } catch (e) {
      const message = extractApiErrorMessage(e, "Failed to load categories");
      const payload = e?.response?.data;
      const actual = typeof payload?.message === "string" && payload?.message.trim()
        ? payload.message.trim()
        : message;
      notifyError(actual);
    }
  };

  const resetForm = () => setForm({ name: "", fields: [], allowedVendorTypeIds: [] });

  const handleSave = async () => {
    if (!form.name.trim()) {
      notifyError("Name required");
      return;
    }
    setSaving(true);
    try {
      if (editing) {
        await updateStockCategory(editing.id, form);
        notifySuccess("Category updated");
      } else {
        await createStockCategory(form);
        notifySuccess("Category created");
      }
      resetForm();
      setEditing(null);
      await load();
    } catch (e) {
      const message = extractApiErrorMessage(e, "Failed to save");
      const payload = e?.response?.data;
      const actual = typeof payload?.message === "string" && payload?.message.trim()
        ? payload.message.trim()
        : message;
      notifyError(actual);
    } finally {
      setSaving(false);
    }
  };

  const addField = () => {
    setForm((p) => ({
      ...p,
      fields: [...(p.fields || []), { name: "", type: "text", options: [], unit: "" }],
    }));
  };

  const updateField = (index, key, value) => {
    setForm((p) => {
      const fields = [...(p.fields || [])];
      fields[index] = { ...fields[index], [key]: value };
      return { ...p, fields };
    });
  };

  const removeField = (index) => {
    setForm((p) => {
      const fields = [...(p.fields || [])];
      fields.splice(index, 1);
      return { ...p, fields };
    });
  };

  const startEdit = (cat) => {
    setEditing(cat);
    setForm({
      name: cat.name,
      fields: cat.fields || [],
      allowedVendorTypeIds: Array.isArray(cat.allowedVendorTypeIds) ? cat.allowedVendorTypeIds : [],
    });
  };

  const handleDelete = (cat) => {
    showConfirm({
      title: "Delete Stock Category",
      message: `Are you sure you want to delete "${cat.name}"? This action cannot be undone.`,
      confirmLabel: "Delete",
      cancelLabel: "Cancel",
      onConfirm: async () => {
        try {
        await deleteStockCategory(cat.id);
        notifySuccess("Category deleted");
        await load();
      } catch (e) {
        const message = extractApiErrorMessage(e, "Failed to delete");
        const payload = e?.response?.data;
        const actual = typeof payload?.message === "string" && payload?.message.trim()
          ? payload.message.trim()
          : message;
          notifyError(actual);
        }
      },
    });
  };

  return (
    <>
      <div className="container-fluid">
      <PageHeader
        title="Stock Categories"
        breadcrumb={[
          { label: "Dashboard", path: "/admin-dashboard" },
          { label: "Stocks", path: "/stocks" },
          { label: "Categories", path: "" },
        ]}
      />
      <div className="row">
        <div className="col-md-6">
          <div className="card mb-4">
            <div className="card-body">
              <h5>{editing ? "Edit" : "Add"} Category</h5>
              <div className="mb-3">
                <label className="form-label">Name</label>
                <input
                  type="text"
                  className="form-control"
                  value={form.name}
                  onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                />
              </div>
              <div className="mb-3">
                <label className="form-label">Allowed Vendor Type</label>
                <select
                  className="form-select"
                  value={form.allowedVendorTypeIds[0] || ""}
                  onChange={(e) => {
                    const val = e.target.value ? Number(e.target.value) : null;
                    setForm(p => ({ ...p, allowedVendorTypeIds: val ? [val] : [] }));
                  }}
                >
                  <option value="">-- select --</option>
                  {vendorTypes.map((vt) => (
                    <option key={vt.id} value={vt.id}>{vt.typeName}</option>
                  ))}
                </select>
              </div>
              <h6>Fields</h6>
              {(form.fields || []).map((f, idx) => (
                <div key={idx} className="border p-2 mb-2">
                  <div className="mb-2">
                    <label className="form-label">Field Name</label>
                    <input
                      type="text"
                      className="form-control"
                      value={f.name}
                      onChange={(e) => updateField(idx, "name", e.target.value)}
                    />
                  </div>
                  <div className="mb-2">
                    <label className="form-label">Type</label>
                    <select
                      className="form-select"
                      value={f.type}
                      onChange={(e) => updateField(idx, "type", e.target.value)}
                    >
                      <option value="text">Text</option>
                      <option value="number">Number</option>
                      <option value="number-unit">Number with unit</option>
                      <option value="dropdown">Dropdown</option>
                    </select>
                  </div>
                  {f.type === "number-unit" && (
                    <div className="mb-2">
                      <label className="form-label">Unit</label>
                      <input
                        type="text"
                        className="form-control"
                        value={f.unit}
                        onChange={(e) => updateField(idx, "unit", e.target.value)}
                        placeholder="e.g. gsm, mm, kg"
                      />
                    </div>
                  )}
                  {f.type === "dropdown" && (
                    <div className="mb-2">
                      <label className="form-label">Options (comma separated)</label>
                      <input
                        type="text"
                        className="form-control"
                        value={(f.options || []).join(",")}
                        onChange={(e) =>
                          updateField(idx, "options", e.target.value.split(",").map((o) => o.trim()))
                        }
                      />
                    </div>
                  )}
                  <button
                    type="button"
                    className="btn btn-sm btn-danger"
                    onClick={() => removeField(idx)}
                  >
                    Remove field
                  </button>
                </div>
              ))}
              <button className="btn btn-sm btn-secondary" onClick={addField}>
                + Add Field
              </button>
              <div className="mt-3">
                <button
                  className="btn btn-primary"
                  onClick={handleSave}
                  disabled={saving}
                >
                  {saving ? "Saving..." : editing ? "Update" : "Create"}
                </button>
                {editing && (
                  <button
                    className="btn btn-link"
                    onClick={() => {
                      resetForm();
                      setEditing(null);
                    }}
                  >
                    Cancel
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-6">
          <div className="card">
            <div className="card-body">
              <h5>Existing Categories</h5>
              <ul className="list-group">
                {categories.map((c) => (
                  <li key={c.id} className="list-group-item d-flex justify-content-between align-items-center">
                    <div>
                      {c.name}
                      {c.allowedVendorTypeIds && c.allowedVendorTypeIds.length > 0 && (
                        <div className="small text-muted">
                          {(() => {
                            const id = c.allowedVendorTypeIds[0];
                            const vt = vendorTypes.find(v => v.id === id);
                            return vt ? vt.typeName : null;
                          })()}
                        </div>
                      )}
                    </div>
                    <span>
                      <button
                        className="btn btn-sm btn-outline-primary me-2"
                        onClick={() => startEdit(c)}
                      >
                        Edit
                      </button>
                      <button
                        className="btn btn-sm btn-outline-danger"
                        onClick={() => handleDelete(c)}
                      >
                        Delete
                      </button>
                    </span>
                  </li>
                ))}
                {categories.length === 0 && <li className="list-group-item text-muted">No categories</li>}
              </ul>
            </div>
          </div>
        </div>
      </div>
      </div>
      {confirmDialog}
    </>
  );
}
