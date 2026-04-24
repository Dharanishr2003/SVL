import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  getBrands,
  createBrand,
  updateBrand,
  deleteBrand,
} from "../../api/brandsApi";
import { getStockCategories } from "../../api/stocksApi";
import { extractApiErrorMessage } from "../../utils/errorMessage";
import { useToast } from "../../components/system/ToastProvider";

const initialForm = {
  stockCategoryId: "",
  brandName: "",
};

export default function BrandMasterPage() {
  const { showSuccess, showError } = useToast();
  const [rows, setRows] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState(initialForm);
  const [editForm, setEditForm] = useState(initialForm);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [emptyNoticeShown, setEmptyNoticeShown] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const data = await getBrands();
      setRows(Array.isArray(data) ? data : []);
      if ((!data || data.length === 0) && !emptyNoticeShown) {
        showSuccess("No brands added yet", { title: "Brands" });
        setEmptyNoticeShown(true);
      }
    } catch (e) {
      const status = e?.response?.status;
      if (status === 404 || status === 500) {
        setRows([]);
        if (!emptyNoticeShown) {
          showSuccess("No brands added yet", { title: "Brands" });
          setEmptyNoticeShown(true);
        }
      } else {
        setRows([]);
        const message = extractApiErrorMessage(e, "Failed to load brands");
        showError(message, { title: "Brands" });
      }
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const cats = await getStockCategories();
      setCategories(Array.isArray(cats) ? cats : []);
    } catch (e) {
      console.warn("Failed to load categories", e);
    }
  };

  useEffect(() => {
    load();
    loadCategories();
  }, []);

  const filteredRows = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return rows;
    return rows.filter(
      (r) =>
        (r.brandName || "").toLowerCase().includes(q) ||
        (r.categoryName || "").toLowerCase().includes(q)
    );
  }, [rows, search]);

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!form.brandName.trim()) {
      showError("Brand name is required", { title: "Brands" });
      return;
    }
    if (!form.stockCategoryId) {
      showError("Category is required", { title: "Brands" });
      return;
    }
    setSaving(true);
    try {
      await createBrand({
        stockCategoryId: form.stockCategoryId,
        brandName: form.brandName.trim(),
      });
      setForm(initialForm);
      showSuccess("Brand added successfully", { title: "Brands" });
      setShowAddModal(false);
      await load();
    } catch (e2) {
      const message = extractApiErrorMessage(e2, "Failed to add brand");
      showError(message, { title: "Brands" });
    } finally {
      setSaving(false);
    }
  };

  const openEdit = (row) => {
    setEditForm({
      stockCategoryId: row.stockCategoryId || "",
      brandName: row.brandName || "",
    });
    setSelectedId(row.id);
    setShowEditModal(true);
  };

  const handleEdit = async (e) => {
    e.preventDefault();
    if (!selectedId) return;
    if (!editForm.brandName.trim()) {
      showError("Brand name is required", { title: "Brands" });
      return;
    }
    if (!editForm.stockCategoryId) {
      showError("Category is required", { title: "Brands" });
      return;
    }
    setSaving(true);
    try {
      await updateBrand(selectedId, {
        stockCategoryId: editForm.stockCategoryId,
        brandName: editForm.brandName.trim(),
      });
      showSuccess("Brand updated successfully", { title: "Brands" });
      setShowEditModal(false);
      setSelectedId(null);
      await load();
    } catch (e2) {
      const message = extractApiErrorMessage(e2, "Failed to update brand");
      showError(message, { title: "Brands" });
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = (row) => {
    setDeleteTarget(row);
    setSelectedId(row.id);
    setShowDeleteModal(true);
  };

  const handleDelete = async () => {
    if (!selectedId) return;
    setSaving(true);
    try {
      await deleteBrand(selectedId);
      showSuccess("Brand deleted", { title: "Brands" });
      setShowDeleteModal(false);
      setSelectedId(null);
      setDeleteTarget(null);
      await load();
    } catch (e2) {
      const message = extractApiErrorMessage(e2, "Failed to delete brand");
      showError(message, { title: "Brands" });
    } finally {
      setSaving(false);
    }
  };

  const closeBtn = (
    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="6" y1="6" x2="18" y2="18" />
      <line x1="18" y1="6" x2="6" y2="18" />
    </svg>
  );

  return (
    <>
      <div className="content">
        <div className="d-md-flex d-block align-items-center justify-content-between page-breadcrumb mb-3">
          <div className="my-auto mb-2">
            <h2 className="mb-1">Brand Management</h2>
            <nav>
              <ol className="breadcrumb mb-0">
                <li className="breadcrumb-item">
                  <Link to="/admin-dashboard">
                    <i className="ti ti-smart-home"></i>
                  </Link>
                </li>
                <li className="breadcrumb-item">
                  <Link to="/stocks/brands">Brand Management</Link>
                </li>
                <li className="breadcrumb-item active">Brands</li>
              </ol>
            </nav>
          </div>
          <div className="d-flex align-items-center gap-2 mb-2">
            <input
              type="text"
              className="form-control"
              placeholder="Search brand or category..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ maxWidth: 260 }}
            />
            <button
              type="button"
              className="btn btn-primary d-flex align-items-center"
              style={{ whiteSpace: "nowrap" }}
              onClick={() => {
                setForm(initialForm);
                setShowAddModal(true);
              }}
            >
              <i className="ti ti-circle-plus me-2"></i>Add Brand
            </button>
          </div>
        </div>

        <div className="card">
          <div className="card-header d-flex align-items-center justify-content-between">
            <h5 className="mb-0">Brand List</h5>
            <span className="badge bg-primary">{filteredRows.length} brand{filteredRows.length !== 1 ? "s" : ""}</span>
          </div>
          <div className="card-body p-0">
            <div className="custom-datatable-filter table-responsive">
              <table className="table">
                <thead className="thead-light">
                  <tr>
                    <th>#</th>
                    <th>Category</th>
                    <th>Brand Name</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={4}>Loading...</td>
                    </tr>
                  ) : filteredRows.length === 0 ? (
                    <tr>
                      <td colSpan={4}>No brands found</td>
                    </tr>
                  ) : (
                    filteredRows.map((row, idx) => (
                      <tr key={row.id}>
                        <td>{idx + 1}</td>
                        <td>{row.categoryName || "—"}</td>
                        <td className="fw-semibold">{row.brandName || "—"}</td>
                        <td>
                          <div className="action-icon d-inline-flex">
                            <button
                              type="button"
                              className="btn btn-link p-0 me-2"
                              onClick={() => openEdit(row)}
                              aria-label="Edit brand"
                            >
                              <i className="ti ti-edit"></i>
                            </button>
                            <button
                              type="button"
                              className="btn btn-link p-0 text-danger"
                              onClick={() => confirmDelete(row)}
                              aria-label="Delete brand"
                            >
                              <i className="ti ti-trash"></i>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Add Brand Modal */}
      {showAddModal && (
        <>
          <div className="modal fade show" style={{ display: "block" }} tabIndex="-1">
            <div className="modal-dialog modal-dialog-centered modal-md">
              <div className="modal-content">
                <div className="modal-header">
                  <h4 className="modal-title">Add Brand</h4>
                  <button type="button" className="btn-close custom-btn-close" onClick={() => setShowAddModal(false)}>
                    {closeBtn}
                  </button>
                </div>
                <form onSubmit={handleAdd}>
                  <div className="modal-body pb-0">
                    <div className="row">
                      <div className="col-md-12">
                        <div className="mb-3">
                          <label className="form-label">
                            Category <span className="text-danger">*</span>
                          </label>
                          <select
                            className="form-select"
                            value={form.stockCategoryId}
                            onChange={(e) => setForm((p) => ({ ...p, stockCategoryId: e.target.value }))}
                          >
                            <option value="">-- select --</option>
                            {categories.map((c) => (
                              <option key={c.id} value={c.id}>
                                {c.name}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                      <div className="col-md-12">
                        <div className="mb-3">
                          <label className="form-label">
                            Brand Name <span className="text-danger">*</span>
                          </label>
                          <input
                            type="text"
                            className="form-control"
                            value={form.brandName}
                            onChange={(e) => setForm((p) => ({ ...p, brandName: e.target.value }))}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="modal-footer">
                    <button type="button" className="btn btn-secondary" onClick={() => setShowAddModal(false)}>
                      Cancel
                    </button>
                    <button type="submit" className="btn btn-primary" disabled={saving}>
                      {saving ? "Saving..." : "Add"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
          <div className="modal-backdrop fade show"></div>
        </>
      )}

      {/* Edit Brand Modal */}
      {showEditModal && (
        <>
          <div className="modal fade show" style={{ display: "block" }} tabIndex="-1">
            <div className="modal-dialog modal-dialog-centered modal-md">
              <div className="modal-content">
                <div className="modal-header">
                  <h4 className="modal-title">Edit Brand</h4>
                  <button type="button" className="btn-close custom-btn-close" onClick={() => setShowEditModal(false)}>
                    {closeBtn}
                  </button>
                </div>
                <form onSubmit={handleEdit}>
                  <div className="modal-body pb-0">
                    <div className="row">
                      <div className="col-md-12">
                        <div className="mb-3">
                          <label className="form-label">
                            Category <span className="text-danger">*</span>
                          </label>
                          <select
                            className="form-select"
                            value={editForm.stockCategoryId}
                            onChange={(e) => setEditForm((p) => ({ ...p, stockCategoryId: e.target.value }))}
                          >
                            <option value="">-- select --</option>
                            {categories.map((c) => (
                              <option key={c.id} value={c.id}>
                                {c.name}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                      <div className="col-md-12">
                        <div className="mb-3">
                          <label className="form-label">
                            Brand Name <span className="text-danger">*</span>
                          </label>
                          <input
                            type="text"
                            className="form-control"
                            value={editForm.brandName}
                            onChange={(e) => setEditForm((p) => ({ ...p, brandName: e.target.value }))}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="modal-footer">
                    <button type="button" className="btn btn-secondary" onClick={() => setShowEditModal(false)}>
                      Cancel
                    </button>
                    <button type="submit" className="btn btn-primary" disabled={saving}>
                      {saving ? "Saving..." : "Save"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
          <div className="modal-backdrop fade show"></div>
        </>
      )}

      {/* Delete Confirm Modal */}
      {showDeleteModal && (
        <>
          <div className="modal fade show" style={{ display: "block" }} tabIndex="-1">
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content">
                <div className="modal-header">
                  <h4 className="modal-title">Confirm Delete</h4>
                  <button type="button" className="btn-close custom-btn-close" onClick={() => setShowDeleteModal(false)}>
                    {closeBtn}
                  </button>
                </div>
                <div className="modal-body">
                  Are you sure you want to delete "{deleteTarget?.brandName}"?
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={() => setShowDeleteModal(false)}>
                    Cancel
                  </button>
                  <button type="button" className="btn btn-danger" onClick={handleDelete} disabled={saving}>
                    {saving ? "Deleting..." : "Delete"}
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div className="modal-backdrop fade show"></div>
        </>
      )}
    </>
  );
}
