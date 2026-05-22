import { useEffect, useState } from "react";
import {
  getServiceCategoriesPaged,
  createServiceCategory,
  updateServiceCategory,
  deleteServiceCategory,
} from "../../api/serviceCategoriesApi";
import PageHeader from "../../components/admin/PageHeader";
import { extractApiErrorMessage } from "../../utils/errorMessage";
import { useToast } from "../../components/system/ToastProvider";
import useConfirmDialog from "../../components/system/useConfirmDialog";
import "./ServiceCategoriesPage.css";

const EMPTY_FORM = { name: "" };

export default function ServiceCategoriesPage() {
  const { showSuccess, showError } = useToast();
  const { showConfirm, confirmDialog } = useConfirmDialog();

  const [categories, setCategories] = useState([]);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ name: "", isActive: true });
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalRows, setTotalRows] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const loadCategories = async () => {
    setLoading(true);
    try {
      const data = await getServiceCategoriesPaged({
        page: Math.max(0, Number(page) - 1),
        size: Number(pageSize) || 10,
      });
      setCategories(Array.isArray(data?.content) ? data.content : []);
      setPage(Number(data?.page ?? page) || page);
      setPageSize(Number(data?.size ?? pageSize) || pageSize);
      setTotalRows(Number(data?.totalElements ?? 0) || 0);
      setTotalPages(Math.max(1, Number(data?.totalPages ?? 1) || 1));
    } catch (e) {
      const message = extractApiErrorMessage(e, "Failed to load categories");
      showError(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, pageSize]);

  const clampedPage = Math.min(Math.max(1, page), totalPages);
  const pageOffset = (clampedPage - 1) * pageSize;

  const handleOpenCreate = () => {
    setForm({ name: "", isActive: true });
    setEditingId(null);
    setShowCreate(true);
  };

  const handleEdit = (category) => {
    setForm({
      name: category.name,
      isActive: category.isActive !== undefined ? category.isActive : true
    });
    setEditingId(category.id);
    setShowCreate(true);
  };

  const handleSave = async () => {
    if (!form.name.trim()) {
      showError("Name required");
      return;
    }
    setSaving(true);
    try {
      console.log("Sending form data:", form);
      if (editingId) {
        await updateServiceCategory(editingId, form);
        showSuccess("Category updated");
      } else {
        await createServiceCategory(form);
        showSuccess("Category added");
      }
      setShowCreate(false);
      setForm({ name: "", isActive: true });
      setEditingId(null);
      await loadCategories();
    } catch (e) {
      const message = extractApiErrorMessage(e, "Failed to save");
      showError(message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (category) => {
    showConfirm({
      title: "Delete Category",
      message: `Are you sure you want to delete "${category.name}"?`,
      confirmLabel: "Delete",
      cancelLabel: "Cancel",
      onConfirm: async () => {
        try {
          await deleteServiceCategory(category.id);
          showSuccess("Category deleted");
          await loadCategories();
        } catch (e) {
          const message = extractApiErrorMessage(e, "Failed to delete");
          showError(message);
        }
      },
    });
  };

  return (
    <div className="product-categories-shell">
      <PageHeader
        title="Service Categories"
        breadcrumbs={[
          { label: "Dashboard", path: "/admin-dashboard" },
          { label: "Services", path: "" },
          { label: "Service Categories", path: "" },
        ]}
        actions={
          <div className="d-flex justify-content-end" style={{ minWidth: "fit-content" }}>
            <button className="btn btn-primary" onClick={handleOpenCreate}>
              Add Category +
            </button>
          </div>
        }
      />

      <div className="leads-page-body">
        <div className="card">
          <div className="card-header d-flex justify-content-between align-items-center">
            <h5 className="mb-0">Service Category List</h5>
            <span className="badge bg-primary">
              {totalRows} categor{totalRows === 1 ? "y" : "ies"}
            </span>
          </div>
          <div className="card-body p-0">
            <div className="d-flex flex-wrap align-items-center justify-content-between gap-2 px-3 py-2 border-bottom">
              <div className="d-flex align-items-center gap-2">
                <span className="text-muted small">Rows per page</span>
                <select
                  className="form-select form-select-sm"
                  style={{ width: 110 }}
                  value={pageSize}
                  onChange={(e) => {
                    const next = Number(e.target.value);
                    setPageSize(Number.isFinite(next) && next > 0 ? next : 10);
                    setPage(1);
                  }}
                  disabled={loading}
                >
                  {[10, 25, 50].map((n) => (
                    <option key={n} value={n}>
                      {n}
                    </option>
                  ))}
                </select>
                <span className="text-muted small">
                  {totalRows === 0
                    ? "0 rows"
                    : `Showing ${pageOffset + 1}-${Math.min(pageOffset + pageSize, totalRows)} of ${totalRows}`}
                </span>
              </div>
              <div className="d-flex align-items-center gap-2">
                <button
                  type="button"
                  className="btn btn-sm btn-light"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={loading || clampedPage <= 1}
                >
                  Prev
                </button>
                <span className="text-muted small">
                  Page {clampedPage} of {totalPages}
                </span>
                <button
                  type="button"
                  className="btn btn-sm btn-light"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={loading || clampedPage >= totalPages}
                >
                  Next
                </button>
              </div>
            </div>
            <div className="table-responsive">
              <table className="table leads-table mb-0">
                <thead>
                  <tr>
                    <th style={{ width: "90px" }}>Index</th>
                    <th>Name</th>
                    <th>Status</th>
                    <th style={{ width: "120px" }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan="4" className="text-center text-muted py-4">
                        Loading...
                      </td>
                    </tr>
                  ) : categories.length > 0 ? (
                    categories.map((category, index) => (
                      <tr key={category.id}>
                        <td>{pageOffset + index + 1}</td>
                        <td>{category.name}</td>
                        <td>
                          <span className={`badge ${category.isActive ? "bg-success" : "bg-danger"}`}>
                            {category.isActive ? "Active" : "Inactive"}
                          </span>
                        </td>
                        <td>
                          <button
                            className="btn btn-sm d-inline-flex align-items-center justify-content-center"
                            style={{
                              backgroundColor: "#6f65d6",
                              color: "#fff",
                              width: 32,
                              height: 32,
                              padding: 0,
                              borderRadius: 4,
                              border: "none",
                              marginRight: "0.5rem",
                            }}
                            onClick={() => handleEdit(category)}
                            title="Edit"
                          >
                            <i className="ti ti-edit" style={{ fontSize: "14px" }} />
                          </button>
                          <button
                            className="btn btn-sm d-inline-flex align-items-center justify-content-center"
                            style={{
                              backgroundColor: "#e74c3c",
                              color: "#fff",
                              width: 32,
                              height: 32,
                              padding: 0,
                              borderRadius: 4,
                              border: "none",
                            }}
                            onClick={() => handleDelete(category)}
                            title="Delete"
                          >
                            <i className="ti ti-trash" style={{ fontSize: "14px" }} />
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="4" className="text-center text-muted py-4">
                        No categories found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {showCreate && (
        <>
          <div className="modal fade show lead-create-modal" style={{ display: "block" }} tabIndex="-1">
            <div
              className="modal-dialog modal-dialog-centered"
              style={{ maxWidth: "420px", width: "calc(100% - 1rem)" }}
            >
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">
                    {editingId ? "Edit Category" : "Add New Category"}
                  </h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => setShowCreate(false)}
                  />
                </div>
                <div className="modal-body lead-create-shell">
                  <div className="lead-wizard">
                    <div className="row g-3 lead-wizard-step-panel">
                      <div className="col-12">
                        <div className="lead-form-stack">
                          <div className="lead-form-field">
                            <label className="form-label">Category Name</label>
                            <input
                              type="text"
                              className="form-control"
                              value={form.name}
                              onChange={(e) => setForm({ ...form, name: e.target.value })}
                              placeholder="Enter category name"
                              autoFocus
                            />
                          </div>

                          <div className="lead-form-field">
                            <label className="form-label d-flex align-items-center gap-2">
                              <span>Status</span>
                              <div className="form-check form-switch" style={{ margin: 0 }}>
                                <input
                                  className="form-check-input"
                                  type="checkbox"
                                  id="statusToggle"
                                  checked={form.isActive}
                                  onChange={(e) =>
                                    setForm({ ...form, isActive: e.target.checked })
                                  }
                                  style={{ cursor: "pointer" }}
                                />
                                <label className="form-check-label" htmlFor="statusToggle">
                                  {form.isActive ? "Active" : "Inactive"}
                                </label>
                              </div>
                            </label>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="lead-wizard-nav">
                      <button
                        type="button"
                        className="btn btn-outline-secondary"
                        onClick={() => setShowCreate(false)}
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        className="btn btn-primary"
                        onClick={handleSave}
                        disabled={saving}
                      >
                        {saving ? "Saving..." : editingId ? "Update" : "Add"}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="modal-backdrop fade show lead-create-backdrop" />
        </>
      )}

      {confirmDialog}
    </div>
  );
}
