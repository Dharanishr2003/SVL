import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { createPortal } from "react-dom";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import {
  getStockCategories,
  createStockCategory,
  updateStockCategory,
  deleteStockCategory,
} from "../../api/stocksApi";
import { getVendorTypes } from "../../api/vendorTypesApi";
import { useToast } from "../../components/system/ToastProvider";
import useConfirmDialog from "../../components/system/useConfirmDialog";
import PageSizeSelector from "../../components/admin/PageSizeSelector";
import { extractApiErrorMessage } from "../../utils/errorMessage";
import "./LeadsPage.css";

export default function StockCategoryPage() {
  const { showSuccess, showError } = useToast();
  const { showConfirm, confirmDialog } = useConfirmDialog();

  const [categories, setCategories] = useState([]);
  const [vendorTypes, setVendorTypes] = useState([]);
  const [loading, setLoading] = useState(true);

  const previouslyUsedFields = useMemo(() => {
    const fieldMap = new Map();
    const standardFields = [
      { name: "Width", type: "number", options: [], unit: "mm" },
      { name: "Height", type: "number", options: [], unit: "mm" },
      { name: "Length", type: "number", options: [], unit: "mm" },
      { name: "Thickness", type: "number", options: [], unit: "micron" },
      { name: "GSM", type: "number", options: [], unit: "gsm" },
      { name: "Color", type: "text", options: [], unit: "" },
      { name: "Weight", type: "number", options: [], unit: "kg" },
      { name: "Size", type: "dropdown", options: ["Small", "Medium", "Large"], unit: "" },
      { name: "Material", type: "dropdown", options: ["Paper", "Plastic", "Metal", "Wood"], unit: "" },
    ];
    standardFields.forEach((field) => {
      fieldMap.set(field.name.toLowerCase().trim(), field);
    });

    categories.forEach((cat) => {
      if (Array.isArray(cat.fields)) {
        cat.fields.forEach((field) => {
          if (field.name) {
            fieldMap.set(field.name.toLowerCase().trim(), field);
          }
        });
      }
    });
    return Array.from(fieldMap.values());
  }, [categories]);

  // Search, Selection, Pagination, Kebab
  const [search, setSearch] = useState("");
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [activeActionsRow, setActiveActionsRow] = useState(null);
  const [actionsMenuPos, setActionsMenuPos] = useState({ top: 0, left: 0 });

  // Modal controls
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [saving, setSaving] = useState(false);

  // Form states
  const [form, setForm] = useState({ name: "", fields: [], allowedVendorTypeIds: [] });

  // Add Fields sub-modal states
  const [showAddFieldsModal, setShowAddFieldsModal] = useState(false);
  const [addFieldsTab, setAddFieldsTab] = useState("library"); // "library", "create", "copy"
  const [selectedLibraryNames, setSelectedLibraryNames] = useState(new Set());
  const [libSearchQuery, setLibSearchQuery] = useState("");
  const [libTypeFilter, setLibTypeFilter] = useState("all");
  const [copySourceCategoryId, setCopySourceCategoryId] = useState("");
  const [newFieldForm, setNewFieldForm] = useState({
    name: "",
    type: "text",
    unit: "",
    options: "",
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const cats = await getStockCategories();
      const types = await getVendorTypes();
      setCategories(cats);
      setVendorTypes(Array.isArray(types) ? types : []);
    } catch (e) {
      showError(extractApiErrorMessage(e, "Failed to load categories"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Close kebab menu on click/scroll outside
  useEffect(() => {
    const handleOutsideClickOrScroll = () => {
      setActiveActionsRow(null);
    };
    window.addEventListener("click", handleOutsideClickOrScroll);
    window.addEventListener("scroll", handleOutsideClickOrScroll, true);
    return () => {
      window.removeEventListener("click", handleOutsideClickOrScroll);
      window.removeEventListener("scroll", handleOutsideClickOrScroll, true);
    };
  }, []);

  const resetForm = () => setForm({ name: "", fields: [], allowedVendorTypeIds: [] });

  const handleOpenAddModal = () => {
    resetForm();
    setShowAddModal(true);
  };

  const handleOpenEditModal = (cat) => {
    setEditingCategory(cat);
    setForm({
      name: cat.name || "",
      fields: Array.isArray(cat.fields) ? cat.fields : [],
      allowedVendorTypeIds: Array.isArray(cat.allowedVendorTypeIds) ? cat.allowedVendorTypeIds : [],
    });
    setShowEditModal(true);
  };

  const handleSave = async (e) => {
    if (e) e.preventDefault();
    if (!form.name.trim()) {
      showError("Name is required");
      return;
    }
    setSaving(true);
    try {
      if (showEditModal && editingCategory) {
        await updateStockCategory(editingCategory.id, form);
        showSuccess("Category updated successfully");
        setShowEditModal(false);
      } else {
        await createStockCategory(form);
        showSuccess("Category created successfully");
        setShowAddModal(false);
      }
      loadData();
    } catch (e) {
      showError(extractApiErrorMessage(e, "Failed to save category"));
    } finally {
      setSaving(false);
    }
  };

  const addField = () => {
    setSelectedLibraryNames(new Set());
    setLibSearchQuery("");
    setLibTypeFilter("all");
    setCopySourceCategoryId("");
    setNewFieldForm({ name: "", type: "text", unit: "", options: "" });
    setAddFieldsTab("library");
    setShowAddFieldsModal(true);
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

  const handleDelete = (cat) => {
    showConfirm({
      title: "Delete Stock Category",
      message: `Are you sure you want to delete "${cat.name}"? This action cannot be undone.`,
      confirmLabel: "Delete",
      cancelLabel: "Cancel",
      onConfirm: async () => {
        try {
          await deleteStockCategory(cat.id);
          showSuccess("Category deleted successfully");
          setSelectedIds((prev) => {
            const next = new Set(prev);
            next.delete(cat.id);
            return next;
          });
          loadData();
        } catch (e) {
          showError(extractApiErrorMessage(e, "Failed to delete category"));
        }
      },
    });
  };

  const handleBulkDelete = async () => {
    if (selectedIds.size === 0) return;
    showConfirm({
      title: "Delete Selected Categories",
      message: `Are you sure you want to delete ${selectedIds.size} stock categories? This action cannot be undone.`,
      confirmLabel: "Delete All",
      cancelLabel: "Cancel",
      onConfirm: async () => {
        try {
          await Promise.all(Array.from(selectedIds).map((id) => deleteStockCategory(id)));
          showSuccess(`Successfully deleted ${selectedIds.size} categories`);
          setSelectedIds(new Set());
          loadData();
        } catch (e) {
          showError("Failed to delete some categories");
        }
      },
    });
  };

  // Export handlers
  const exportExcel = () => {
    const csvContent = [
      ["ID", "Name", "Allowed Vendor Type", "Fields Count"],
      ...filteredRows.map((r) => {
        const vtId = r.allowedVendorTypeIds?.[0];
        const vt = vendorTypes.find((v) => v.id === vtId);
        return [
          r.id,
          r.name,
          vt ? vt.typeName : "None",
          r.fields?.length || 0,
        ];
      }),
    ]
      .map((e) => e.join(","))
      .join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `stock-categories-${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportCsv = exportExcel;

  const exportPdf = () => {
    const doc = new jsPDF();
    doc.text("Stock Categories List", 14, 15);
    const headers = [["ID", "Name", "Allowed Vendor Type", "Fields Count"]];
    const data = filteredRows.map((r) => {
      const vtId = r.allowedVendorTypeIds?.[0];
      const vt = vendorTypes.find((v) => v.id === vtId);
      return [
        r.id,
        r.name,
        vt ? vt.typeName : "None",
        r.fields?.length || 0,
      ];
    });

    autoTable(doc, {
      head: headers,
      body: data,
      startY: 20,
      styles: { fontSize: 9 },
    });
    doc.save(`stock-categories-${Date.now()}.pdf`);
  };

  // Search & filter
  const filteredRows = useMemo(() => {
    let result = categories;
    const q = search.toLowerCase().trim();
    if (q) {
      result = result.filter(
        (r) =>
          (r.name || "").toLowerCase().includes(q) ||
          String(r.id).includes(q)
      );
    }
    return result;
  }, [categories, search]);

  // Pagination
  const totalRows = filteredRows.length;
  const pageCount = Math.max(1, Math.ceil(totalRows / Math.max(1, pageSize)));
  const clampedPage = Math.min(Math.max(1, page), pageCount);
  const pageOffset = (clampedPage - 1) * pageSize;
  const pagedRows = useMemo(
    () => filteredRows.slice(pageOffset, pageOffset + pageSize),
    [filteredRows, pageOffset, pageSize]
  );

  useEffect(() => {
    if (page !== clampedPage) setPage(clampedPage);
  }, [clampedPage]);

  // Selection
  const toggleSelectAll = () => {
    const pageIds = pagedRows.map((r) => r.id);
    const allSelectedOnPage = pageIds.every((id) => selectedIds.has(id));
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (allSelectedOnPage) {
        pageIds.forEach((id) => next.delete(id));
      } else {
        pageIds.forEach((id) => next.add(id));
      }
      return next;
    });
  };

  const toggleRowSelection = (id) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  return (
    <>
      <div className="content">
        {/* Custom White Header Card */}
        <div className="card border-0 shadow-sm p-4 mb-4 bg-white" style={{ borderRadius: 12 }}>
          <div className="d-flex align-items-center justify-content-between flex-wrap gap-3">
            <div>
              <h2 className="leads-header-title mb-1" style={{ fontSize: "1.4rem", fontWeight: "700", color: "#0f172a" }}>Stock Categories</h2>
              <nav className="mb-0">
                <ol className="breadcrumb mb-0" style={{ fontSize: "0.9rem" }}>
                  <li className="breadcrumb-item">
                    <Link to="/admin-dashboard" style={{ color: "#64748b", textDecoration: "none" }}>
                      Home
                    </Link>
                  </li>
                  <li className="breadcrumb-item" style={{ color: "#64748b" }}>Stocks</li>
                  <li className="breadcrumb-item active" style={{ color: "#0f172a", fontWeight: "500" }}>Categories</li>
                </ol>
              </nav>
            </div>

            <div className="d-flex align-items-center gap-2">
              <button
                type="button"
                className="btn btn-primary d-flex align-items-center gap-2"
                onClick={handleOpenAddModal}
                style={{ backgroundColor: "#3b82f6", borderColor: "#3b82f6", fontWeight: "600", padding: "10px 20px", borderRadius: "10px" }}
              >
                <i className="ti ti-plus" style={{ fontSize: "1.1rem" }}></i>
                Add Category
              </button>
            </div>
          </div>
        </div>

        {/* Main Categories Table Card */}
        <div className="card border-0 shadow-sm mb-4" style={{ borderRadius: 12 }}>
          {/* Controls Bar */}
          <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 p-3 border-bottom">
            <div className="position-relative" style={{ minWidth: "260px" }}>
              <input
                className="form-control"
                style={{ height: 42, borderRadius: 10, paddingLeft: 38, fontSize: "0.95rem" }}
                value={search}
                placeholder="Search categories..."
                onChange={(e) => setSearch(e.target.value)}
              />
              <i className="ti ti-search position-absolute text-muted" style={{ left: 14, top: "50%", transform: "translateY(-50%)", fontSize: "1.1rem" }} />
            </div>

            <div className="d-flex align-items-center gap-2 flex-wrap">
              <div className="dropdown">
                <button
                  className="btn btn-outline-export dropdown-toggle d-flex align-items-center gap-2"
                  type="button"
                  id="exportDropdown"
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                  style={{ height: 42, padding: "0 18px", borderRadius: 10, fontWeight: "500", fontSize: "0.9rem" }}
                >
                  <i className="ti ti-download" style={{ fontSize: "1rem" }} />
                  Export
                </button>
                <ul className="dropdown-menu shadow border-0" aria-labelledby="exportDropdown">
                  <li>
                    <button className="dropdown-item py-2 text-start" onClick={exportExcel}>
                      Excel
                    </button>
                  </li>
                  <li>
                    <button className="dropdown-item py-2 text-start" onClick={exportCsv}>
                      CSV
                    </button>
                  </li>
                  <li>
                    <button className="dropdown-item py-2 text-start" onClick={exportPdf}>
                      PDF
                    </button>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Table Container */}
          <div className="card-body p-0">
            <div className="table-responsive" style={{ overflowX: "auto" }}>
              <table className="table table-hover align-middle mb-0">
                <thead className="thead-light">
                  <tr>
                    <th style={{ width: "40px" }}>
                      <input
                        type="checkbox"
                        className="form-check-input"
                        checked={pagedRows.length > 0 && pagedRows.every((r) => selectedIds.has(r.id))}
                        onChange={toggleSelectAll}
                      />
                    </th>
                    <th>Name</th>
                    <th>Allowed Vendor Type</th>
                    <th>Fields Count</th>
                    <th style={{ width: "80px" }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={5} className="text-center py-4">
                        <div className="spinner-border text-primary" role="status">
                          <span className="visually-hidden">Loading...</span>
                        </div>
                      </td>
                    </tr>
                  ) : pagedRows.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="text-center py-4 text-muted">No stock categories found</td>
                    </tr>
                  ) : (
                    pagedRows.map((cat) => {
                      const vtId = cat.allowedVendorTypeIds?.[0];
                      const vt = vendorTypes.find((v) => v.id === vtId);
                      return (
                        <tr key={cat.id}>
                          <td>
                            <input
                              type="checkbox"
                              className="form-check-input"
                              checked={selectedIds.has(cat.id)}
                              onChange={() => toggleRowSelection(cat.id)}
                            />
                          </td>
                          <td className="fw-semibold text-dark">{cat.name}</td>
                          <td>{vt ? vt.typeName : "None"}</td>
                          <td>{cat.fields?.length || 0} fields</td>
                          <td>
                            <button
                              className="btn btn-kebab-actions d-flex align-items-center justify-content-center"
                              style={{ width: 32, height: 32, borderRadius: "50%", border: "none", backgroundColor: "transparent", color: "#64748b" }}
                              onClick={(e) => {
                                e.stopPropagation();
                                if (activeActionsRow?.id === cat.id) {
                                  setActiveActionsRow(null);
                                } else {
                                  const rect = e.currentTarget.getBoundingClientRect();
                                  setActionsMenuPos({
                                    top: rect.top + window.scrollY,
                                    left: rect.right + window.scrollX,
                                  });
                                  setActiveActionsRow(cat);
                                }
                              }}
                            >
                              <i className="ti ti-dots-vertical" style={{ fontSize: "1.15rem" }} />
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Footer */}
            <div className="d-flex flex-wrap align-items-center justify-content-between p-3 gap-3 border-top">
              <span className="entries-info text-muted small">
                {totalRows === 0
                  ? "Showing 0 to 0 of 0 entries"
                  : `Showing ${pageOffset + 1} to ${Math.min(pageOffset + pageSize, totalRows)} of ${totalRows} entries`}
              </span>

              <div className="pagination-numbers-container d-flex align-items-center gap-1">
                <button
                  type="button"
                  className="btn-pagination-arrow btn btn-sm btn-light border-0 d-flex align-items-center justify-content-center"
                  style={{ width: 32, height: 32, borderRadius: 6 }}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={clampedPage <= 1}
                >
                  <i className="ti ti-chevron-left" />
                </button>

                {Array.from({ length: pageCount }).map((_, idx) => {
                  const pageNum = idx + 1;
                  return (
                    <button
                      key={pageNum}
                      type="button"
                      className={`btn-pagination-num btn btn-sm border-0 ${clampedPage === pageNum ? "active" : "btn-light"}`}
                      style={{ width: 32, height: 32, borderRadius: 6 }}
                      onClick={() => setPage(pageNum)}
                    >
                      {pageNum}
                    </button>
                  );
                })}

                <button
                  type="button"
                  className="btn-pagination-arrow btn btn-sm btn-light border-0 d-flex align-items-center justify-content-center"
                  style={{ width: 32, height: 32, borderRadius: 6 }}
                  onClick={() => setPage((p) => Math.min(pageCount, p + 1))}
                  disabled={clampedPage >= pageCount}
                >
                  <i className="ti ti-chevron-right" />
                </button>
              </div>

              <PageSizeSelector pageSize={pageSize} setPageSize={setPageSize} setPage={setPage} />
            </div>
          </div>
        </div>
      </div>

      {/* Floating Kebab Actions Portal */}
      {activeActionsRow && createPortal(
        <div
          className="floating-actions-menu shadow-lg border"
          style={{
            position: "absolute",
            top: actionsMenuPos.top,
            left: actionsMenuPos.left,
            transform: "translate(-100%, -100%) translateY(-5px)",
            zIndex: 9999,
            background: "#fff",
            borderRadius: 8,
            padding: "6px 0",
            minWidth: 140
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <button
            className="dropdown-item py-2 px-3 text-start d-flex align-items-center gap-2"
            style={{ fontSize: "0.85rem" }}
            onClick={() => {
              handleOpenEditModal(activeActionsRow);
              setActiveActionsRow(null);
            }}
          >
            <i className="ti ti-edit" style={{ fontSize: "1rem", color: "#64748b" }} /> Edit Category
          </button>
          <button
            className="dropdown-item py-2 px-3 text-start d-flex align-items-center gap-2 text-danger"
            style={{ fontSize: "0.85rem" }}
            onClick={() => {
              handleDelete(activeActionsRow);
              setActiveActionsRow(null);
            }}
          >
            <i className="ti ti-trash" style={{ fontSize: "1rem", color: "#ef4444" }} /> Delete Category
          </button>
        </div>,
        document.body
      )}

      {/* Floating Bulk Operations Bar */}
      {selectedIds.size > 0 && (
        <div
          className="position-fixed start-50 translate-middle-x d-flex align-items-center justify-content-between gap-3 shadow-lg px-4 py-3 bg-dark text-white"
          style={{
            bottom: 24,
            borderRadius: 16,
            zIndex: 1040,
            minWidth: 400,
            border: "1px solid rgba(255, 255, 255, 0.15)",
            animation: "fadeIn 0.2s ease"
          }}
        >
          <div className="d-flex align-items-center gap-2">
            <span className="badge bg-primary text-white" style={{ fontSize: "0.9rem", padding: "6px 10px" }}>
              {selectedIds.size}
            </span>
            <span className="fw-medium text-white">selected</span>
          </div>
          <div className="d-flex align-items-center gap-2">
            <button
              className="btn btn-sm btn-danger d-flex align-items-center gap-1"
              style={{ borderRadius: 8, padding: "6px 12px", fontSize: "0.85rem", border: "none" }}
              onClick={handleBulkDelete}
            >
              <i className="ti ti-trash" /> Delete Selected
            </button>
            <button
              className="btn btn-sm btn-link p-0 ms-2 text-decoration-none"
              style={{ fontSize: "0.85rem", color: "rgba(255, 255, 255, 0.7)" }}
              onClick={() => setSelectedIds(new Set())}
            >
              Clear
            </button>
          </div>
        </div>
      )}

      {/* Add/Edit Modal */}
      {(showAddModal || showEditModal) && (
        <div className="modal fade show" style={{ display: "block" }} tabIndex="-1" role="dialog">
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h4 className="modal-title">{showEditModal ? "Edit" : "Add"} Stock Category</h4>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => {
                    setShowAddModal(false);
                    setShowEditModal(false);
                  }}
                />
              </div>
              <form onSubmit={handleSave}>
                <div className="modal-body">
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Category Name</label>
                      <input
                        type="text"
                        className="form-control"
                        value={form.name}
                        onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                        placeholder="Enter category name"
                        required
                      />
                    </div>

                    <div className="col-md-6 mb-3">
                      <label className="form-label">Allowed Vendor Type</label>
                      <select
                        className="form-select"
                        value={form.allowedVendorTypeIds[0] || ""}
                        onChange={(e) => {
                          const val = e.target.value ? Number(e.target.value) : null;
                          setForm((p) => ({ ...p, allowedVendorTypeIds: val ? [val] : [] }));
                        }}
                      >
                        <option value="">Select Vendor Type</option>
                        {vendorTypes.map((vt) => (
                          <option key={vt.id} value={vt.id}>
                            {vt.typeName}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="col-12 mt-3">
                      <div className="d-flex justify-content-between align-items-center mb-3">
                        <h5 className="mb-0">Fields</h5>
                        <button type="button" className="btn btn-sm btn-outline-secondary" onClick={addField}>
                          + Add Field
                        </button>
                      </div>

                      {(form.fields || []).map((f, idx) => (
                        <div key={idx} className="card p-3 mb-3 border bg-light">
                          <div className="row g-2">
                            <div className="col-md-4 d-flex flex-column justify-content-center">
                              <span className="fw-semibold text-muted small">Field Name</span>
                              <span className="fw-bold text-dark fs-5 mt-1">{f.name}</span>
                            </div>

                            <div className="col-md-3">
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
                              <div className="col-md-3">
                                <label className="form-label">Unit</label>
                                <input
                                  type="text"
                                  className="form-control"
                                  value={f.unit}
                                  onChange={(e) => updateField(idx, "unit", e.target.value)}
                                  placeholder="e.g. mm, kg, gsm"
                                  required
                                />
                              </div>
                            )}

                            {f.type === "dropdown" && (
                              <div className="col-md-3">
                                <label className="form-label">Options (comma separated)</label>
                                <input
                                  type="text"
                                  className="form-control"
                                  value={(f.options || []).join(",")}
                                  onChange={(e) =>
                                    updateField(
                                      idx,
                                      "options",
                                      e.target.value.split(",").map((o) => o.trim())
                                    )
                                  }
                                  placeholder="e.g. High, Medium, Low"
                                  required
                                />
                              </div>
                            )}

                            <div className="col-md-2 d-flex align-items-end justify-content-end">
                              <button
                                type="button"
                                className="btn btn-danger btn-sm"
                                onClick={() => removeField(idx)}
                              >
                                Remove
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-light"
                    onClick={() => {
                      setShowAddModal(false);
                      setShowEditModal(false);
                    }}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary" disabled={saving}>
                    {saving ? "Saving..." : "Save Category"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Add Fields Sub-Modal */}
      {showAddFieldsModal && (
        <div className="modal fade show" style={{ display: "block", zIndex: 1060 }} tabIndex="-1" role="dialog">
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content shadow-lg border-0">
              <div className="modal-header bg-light">
                <h5 className="modal-title fw-bold text-dark">
                  Add Fields &gt; {form.name || "New Category"}
                </h5>
                <button type="button" className="btn-close" onClick={() => setShowAddFieldsModal(false)} />
              </div>
              <div className="modal-body p-0">
                {/* Tab Bar */}
                <div className="border-bottom bg-light px-3 pt-2">
                  <ul className="nav nav-tabs border-0">
                    <li className="nav-item">
                      <button
                        type="button"
                        className={`nav-link border-0 fw-semibold ${addFieldsTab === "library" ? "active text-primary border-bottom border-primary" : "text-muted bg-transparent"}`}
                        style={{ borderBottomWidth: 3 }}
                        onClick={() => setAddFieldsTab("library")}
                      >
                        <i className="ti ti-library me-1" /> Pick from Library
                      </button>
                    </li>
                    <li className="nav-item">
                      <button
                        type="button"
                        className={`nav-link border-0 fw-semibold ${addFieldsTab === "create" ? "active text-primary border-bottom border-primary" : "text-muted bg-transparent"}`}
                        style={{ borderBottomWidth: 3 }}
                        onClick={() => setAddFieldsTab("create")}
                      >
                        <i className="ti ti-plus me-1" /> Create New Field
                      </button>
                    </li>
                    <li className="nav-item">
                      <button
                        type="button"
                        className={`nav-link border-0 fw-semibold ${addFieldsTab === "copy" ? "active text-primary border-bottom border-primary" : "text-muted bg-transparent"}`}
                        style={{ borderBottomWidth: 3 }}
                        onClick={() => setAddFieldsTab("copy")}
                      >
                        <i className="ti ti-copy me-1" /> Copy from Category
                      </button>
                    </li>
                  </ul>
                </div>

                {/* Tab Content */}
                <div className="p-4" style={{ minHeight: "320px", maxHeight: "480px", overflowY: "auto" }}>
                  {addFieldsTab === "library" && (
                    <div>
                      {/* Search and Filter */}
                      <div className="row g-2 mb-3">
                        <div className="col-md-8 position-relative">
                          <input
                            type="text"
                            className="form-control"
                            placeholder="Search library..."
                            value={libSearchQuery}
                            onChange={(e) => setLibSearchQuery(e.target.value)}
                          />
                        </div>
                        <div className="col-md-4">
                          <select
                            className="form-select"
                            value={libTypeFilter}
                            onChange={(e) => setLibTypeFilter(e.target.value)}
                          >
                            <option value="all">All Types</option>
                            <option value="text">Text</option>
                            <option value="number">Number</option>
                            <option value="number-unit">Number with Unit</option>
                            <option value="dropdown">Dropdown</option>
                          </select>
                        </div>
                      </div>

                      {/* Select All */}
                      <div className="form-check mb-2 pb-2 border-bottom">
                        <input
                          type="checkbox"
                          className="form-check-input"
                          id="selectAllLib"
                          checked={
                            previouslyUsedFields.length > 0 &&
                            previouslyUsedFields
                              .filter((f) => {
                                const matchSearch = !libSearchQuery.trim() || f.name.toLowerCase().includes(libSearchQuery.toLowerCase());
                                const matchType = libTypeFilter === "all" || f.type === libTypeFilter;
                                return matchSearch && matchType;
                              })
                              .every((f) => selectedLibraryNames.has(f.name))
                          }
                          onChange={(e) => {
                            const checked = e.target.checked;
                            setSelectedLibraryNames((prev) => {
                              const next = new Set(prev);
                              previouslyUsedFields
                                .filter((f) => {
                                  const matchSearch = !libSearchQuery.trim() || f.name.toLowerCase().includes(libSearchQuery.toLowerCase());
                                  const matchType = libTypeFilter === "all" || f.type === libTypeFilter;
                                  return matchSearch && matchType;
                                })
                                .forEach((f) => {
                                  if (checked) next.add(f.name);
                                  else next.delete(f.name);
                                });
                              return next;
                            });
                          }}
                        />
                        <label className="form-check-label fw-semibold text-dark" htmlFor="selectAllLib">
                          Select All Fields ({previouslyUsedFields.filter((f) => {
                            const matchSearch = !libSearchQuery.trim() || f.name.toLowerCase().includes(libSearchQuery.toLowerCase());
                            const matchType = libTypeFilter === "all" || f.type === libTypeFilter;
                            return matchSearch && matchType;
                          }).length} found)
                        </label>
                      </div>

                      {/* Fields Checklist */}
                      <div className="d-flex flex-column gap-2">
                        {previouslyUsedFields
                          .filter((f) => {
                            const matchSearch = !libSearchQuery.trim() || f.name.toLowerCase().includes(libSearchQuery.toLowerCase());
                            const matchType = libTypeFilter === "all" || f.type === libTypeFilter;
                            return matchSearch && matchType;
                          })
                          .map((field) => {
                            const alreadyAdded = (form.fields || []).some(
                              (added) => added.name.toLowerCase() === field.name.toLowerCase()
                            );
                            return (
                              <div
                                key={field.name}
                                className={`p-3 rounded border mb-2 d-flex align-items-center justify-content-between ${alreadyAdded ? "bg-light border-dashed" : "bg-white"}`}
                              >
                                <div className="form-check mb-0">
                                  <input
                                    type="checkbox"
                                    className="form-check-input"
                                    id={`lib-${field.name}`}
                                    disabled={alreadyAdded}
                                    checked={selectedLibraryNames.has(field.name) || alreadyAdded}
                                    onChange={(e) => {
                                      const checked = e.target.checked;
                                      setSelectedLibraryNames((prev) => {
                                        const next = new Set(prev);
                                        if (checked) next.add(field.name);
                                        else next.delete(field.name);
                                        return next;
                                      });
                                    }}
                                  />
                                  <label
                                    className={`form-check-label fw-bold mb-0 ${alreadyAdded ? "text-muted text-decoration-line-through" : "text-dark"}`}
                                    htmlFor={`lib-${field.name}`}
                                  >
                                    {field.name}
                                    <span className="badge text-bg-light border ms-2 small text-capitalize">
                                      {field.type === "number-unit" ? `Number (${field.unit})` : field.type}
                                    </span>
                                  </label>
                                </div>
                                {alreadyAdded && (
                                  <span className="text-muted small fw-medium">Already Added</span>
                                )}
                              </div>
                            );
                          })}
                      </div>
                    </div>
                  )}

                  {addFieldsTab === "create" && (
                    <div className="row g-3">
                      <div className="col-md-6">
                        <label className="form-label fw-semibold">Field Name</label>
                        <input
                          type="text"
                          className="form-control"
                          placeholder="e.g. Length, Color, GSM"
                          value={newFieldForm.name}
                          onChange={(e) => setNewFieldForm((p) => ({ ...p, name: e.target.value }))}
                          required
                        />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label fw-semibold">Field Type</label>
                        <select
                          className="form-select"
                          value={newFieldForm.type}
                          onChange={(e) => setNewFieldForm((p) => ({ ...p, type: e.target.value }))}
                        >
                          <option value="text">Text</option>
                          <option value="number">Number</option>
                          <option value="number-unit">Number with unit</option>
                          <option value="dropdown">Dropdown</option>
                        </select>
                      </div>

                      {newFieldForm.type === "number-unit" && (
                        <div className="col-md-6">
                          <label className="form-label fw-semibold">Unit</label>
                          <input
                            type="text"
                            className="form-control"
                            placeholder="e.g. mm, kg, micron"
                            value={newFieldForm.unit}
                            onChange={(e) => setNewFieldForm((p) => ({ ...p, unit: e.target.value }))}
                            required
                          />
                        </div>
                      )}

                      {newFieldForm.type === "dropdown" && (
                        <div className="col-md-12">
                          <label className="form-label fw-semibold">Options (comma separated)</label>
                          <input
                            type="text"
                            className="form-control"
                            placeholder="e.g. Matte, Glossy, Standard"
                            value={newFieldForm.options}
                            onChange={(e) => setNewFieldForm((p) => ({ ...p, options: e.target.value }))}
                            required
                          />
                        </div>
                      )}
                    </div>
                  )}

                  {addFieldsTab === "copy" && (
                    <div>
                      <p className="text-muted small mb-3">
                        Copying fields will replace or merge all fields configured in this category with the fields from the selected category below.
                      </p>
                      <label className="form-label fw-semibold">Select Category to Copy From</label>
                      <select
                        className="form-select"
                        value={copySourceCategoryId}
                        onChange={(e) => setCopySourceCategoryId(e.target.value)}
                      >
                        <option value="">Select category</option>
                        {categories
                          .filter((c) => String(c.id) !== String(editingCategory?.id))
                          .map((cat) => (
                            <option key={cat.id} value={cat.id}>
                              {cat.name} ({cat.fields?.length || 0} fields)
                            </option>
                          ))}
                      </select>
                    </div>
                  )}
                </div>
              </div>

              <div className="modal-footer bg-light border-top">
                <button
                  type="button"
                  className="btn btn-outline-secondary btn-sm"
                  onClick={() => setShowAddFieldsModal(false)}
                >
                  Cancel
                </button>
                {addFieldsTab === "library" && (
                  <button
                    type="button"
                    className="btn btn-primary btn-sm"
                    disabled={selectedLibraryNames.size === 0}
                    onClick={() => {
                      const fieldsToAdd = previouslyUsedFields.filter((f) => selectedLibraryNames.has(f.name));
                      setForm((prev) => {
                        const existingFields = prev.fields || [];
                        const merged = [...existingFields];
                        fieldsToAdd.forEach((field) => {
                          if (!existingFields.some((f) => f.name.toLowerCase() === field.name.toLowerCase())) {
                            merged.push({
                              name: field.name,
                              type: field.type,
                              unit: field.unit || "",
                              options: Array.isArray(field.options) ? [...field.options] : [],
                            });
                          }
                        });
                        return { ...prev, fields: merged };
                      });
                      setShowAddFieldsModal(false);
                      showSuccess(`Added ${fieldsToAdd.length} fields from library.`);
                    }}
                  >
                    Add Selected Fields
                  </button>
                )}
                {addFieldsTab === "create" && (
                  <button
                    type="button"
                    className="btn btn-primary btn-sm"
                    disabled={!newFieldForm.name.trim()}
                    onClick={() => {
                      const cleanName = newFieldForm.name.trim();
                      if ((form.fields || []).some((f) => f.name.toLowerCase() === cleanName.toLowerCase())) {
                        showError("A field with this name already exists in this category.");
                        return;
                      }
                      const field = {
                        name: cleanName,
                        type: newFieldForm.type,
                        unit: newFieldForm.type === "number-unit" ? newFieldForm.unit.trim() : "",
                        options: newFieldForm.type === "dropdown" ? newFieldForm.options.split(",").map((o) => o.trim()).filter(Boolean) : [],
                      };
                      setForm((prev) => ({
                        ...prev,
                        fields: [...(prev.fields || []), field],
                      }));
                      setShowAddFieldsModal(false);
                      showSuccess(`Custom field "${cleanName}" added successfully.`);
                    }}
                  >
                    Create and Add Field
                  </button>
                )}
                {addFieldsTab === "copy" && (
                  <button
                    type="button"
                    className="btn btn-primary btn-sm"
                    disabled={!copySourceCategoryId}
                    onClick={() => {
                      const sourceCat = categories.find((c) => String(c.id) === String(copySourceCategoryId));
                      if (sourceCat && Array.isArray(sourceCat.fields)) {
                        setForm((prev) => {
                          const existingFields = prev.fields || [];
                          const merged = [...existingFields];
                          sourceCat.fields.forEach((field) => {
                            if (!existingFields.some((f) => f.name.toLowerCase() === field.name.toLowerCase())) {
                              merged.push({
                                name: field.name,
                                type: field.type,
                                unit: field.unit || "",
                                options: Array.isArray(field.options) ? [...field.options] : [],
                              });
                            }
                          });
                          return { ...prev, fields: merged };
                        });
                        setShowAddFieldsModal(false);
                        showSuccess(`Copied ${sourceCat.fields.length} fields from category "${sourceCat.name}".`);
                      }
                    }}
                  >
                    Copy and Merge Fields
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Backdrops */}
      {(showAddModal || showEditModal) && <div className="modal-backdrop fade show" />}
      {showAddFieldsModal && <div className="modal-backdrop fade show" style={{ zIndex: 1050 }} />}

      {confirmDialog}
    </>
  );
}
