import { Fragment, useEffect, useState } from "react";
import { getServiceCategories } from "../../api/serviceCategoriesApi";
import { getServiceTypes, createServiceType, updateServiceType, deleteServiceType } from "../../api/serviceTypesApi";
import PageHeader from "../../components/admin/PageHeader";
import { useToast } from "../../components/system/ToastProvider";
import useConfirmDialog from "../../components/system/useConfirmDialog";
import "./ServiceTypesPage.css";

export default function ServiceTypesPage() {
  const { showSuccess, showError } = useToast();
  const { showConfirm, confirmDialog } = useConfirmDialog();

  const [serviceTypes, setServiceTypes] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState(null);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ name: "", categoryId: "", parentId: "" });
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expandedParents, setExpandedParents] = useState({});

  useEffect(() => {
    loadCategories();
    loadServiceTypes();
  }, []);

  const loadCategories = async () => {
    try {
      const data = await getServiceCategories();
      console.log("Loaded categories:", data);
      const catArray = Array.isArray(data) ? data : [];
      setCategories(catArray);
      if (catArray.length > 0 && !selectedCategoryId) {
        setSelectedCategoryId(catArray[0].id);
      }
    } catch (e) {
      console.warn("Failed to load categories", e);
    }
  };

  const loadServiceTypes = async () => {
    setLoading(true);
    try {
      const data = await getServiceTypes();
      setServiceTypes(Array.isArray(data) ? data : []);
    } catch (e) {
      showError("Failed to load service types");
    } finally {
      setLoading(false);
    }
  };

  const normalize = (value) => (value || "").toString().toLowerCase();

  const childrenByParent = serviceTypes.reduce((acc, st) => {
    if (st.parentId) {
      const key = st.parentId.toString();
      acc[key] = acc[key] || [];
      acc[key].push(st);
    }
    return acc;
  }, {});

  // Filter to only selected category
  const categoryParents = selectedCategoryId
    ? serviceTypes
        .filter((st) => !st.parentId && st.categoryId === selectedCategoryId)
        .sort((a, b) => normalize(a.name).localeCompare(normalize(b.name)))
        .filter((st) => {
          if (normalize(st.name).includes(normalize(search))) return true;
          const children = childrenByParent[st.id?.toString()] || [];
          return children.some((child) => normalize(child.name).includes(normalize(search)));
        })
    : [];

  const getVisibleChildren = (parentId) => {
    const children = (childrenByParent[parentId?.toString()] || []).slice().sort((a, b) =>
      normalize(a.name).localeCompare(normalize(b.name))
    );
    if (!search.trim()) return children;
    return children.filter((st) => normalize(st.name).includes(normalize(search)));
  };

  const handleOpenCreate = () => {
    setForm({ name: "", categoryId: "", parentId: "" });
    setEditingId(null);
    setShowCreate(true);
  };

  const handleAddSubType = (parentServiceType) => {
    setForm({
      name: "",
      categoryId: parentServiceType.categoryId,
      parentId: parentServiceType.id,
    });
    setEditingId(null);
    setShowCreate(true);
  };

  const handleEdit = (serviceType) => {
    setForm({
      name: serviceType.name,
      categoryId: serviceType.categoryId || "",
      parentId: serviceType.parentId || "",
    });
    setEditingId(serviceType.id);
    setShowCreate(true);
  };

  const handleSave = async () => {
    if (!form.name.trim()) {
      showError("Name required");
      return;
    }
    if (!form.categoryId) {
      showError("Category required");
      return;
    }
    setSaving(true);
    try {
      if (editingId) {
        await updateServiceType(editingId, form);
        showSuccess("Service Type updated");
      } else {
        await createServiceType(form);
        showSuccess("Service Type added");
      }
      setShowCreate(false);
      setForm({ name: "", categoryId: "", parentId: "" });
      setEditingId(null);
      await loadServiceTypes();
    } catch (e) {
      showError("Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (serviceType) => {
    showConfirm({
      title: "Delete Service Type",
      message: `Are you sure you want to delete "${serviceType.name}"?`,
      confirmLabel: "Delete",
      cancelLabel: "Cancel",
      onConfirm: async () => {
        try {
          await deleteServiceType(serviceType.id);
          showSuccess("Service Type deleted");
          await loadServiceTypes();
        } catch (e) {
          showError("Failed to delete");
        }
      },
    });
  };

  const getParentOptions = () => {
    if (!form.categoryId) {
      return sortedParents.filter((st) => st.id !== editingId);
    }
    const categoryId = Number(form.categoryId);
    return sortedParents.filter((st) => st.categoryId === categoryId && st.id !== editingId);
  };

  const handleParentChange = (value) => {
    if (!value) {
      setForm({ ...form, parentId: "" });
      return;
    }
    const selected = parents.find((st) => st.id === Number(value));
    if (selected) {
      setForm({
        ...form,
        parentId: selected.id,
        categoryId: selected.categoryId,
      });
    }
  };

  const toggleParent = (parentId) => {
    const key = parentId?.toString();
    setExpandedParents((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const getCategoryName = (categoryId) => {
    const cat = categories.find((c) => c.id === categoryId);
    return cat ? cat.name : "—";
  };

  return (
    <div className="products-shell">
      <PageHeader
        title="Service Types"
        breadcrumb={[
          { label: "Dashboard", path: "/admin-dashboard" },
          { label: "Services", path: "" },
          { label: "Service Types", path: "" },
        ]}
      />

      <div className="leads-page-body">
        <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "1rem" }}>
          <div className="d-flex flex-wrap gap-2 align-items-center">
            <button
              className="btn btn-success leads-toolbar-btn leads-primary-action"
              onClick={handleOpenCreate}
            >
              <i className="ti ti-plus me-1" />
              Add Service Type
            </button>
          </div>
        </div>

        <div className="leads-search-row">
          <div className="leads-search-box">
            <label className="mb-0 leads-search-label">Search</label>
            <input
              className="form-control leads-search-input"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search service types..."
            />
          </div>
        </div>

        {categories.length > 0 && (
          <div style={{ marginBottom: "1.5rem", borderBottom: "1px solid #e6edf5" }}>
            <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategoryId(cat.id)}
                  style={{
                    padding: "0.75rem 1rem",
                    backgroundColor: selectedCategoryId === cat.id ? "#45597a" : "transparent",
                    color: selectedCategoryId === cat.id ? "#fff" : "#666",
                    border: "none",
                    borderBottom: selectedCategoryId === cat.id ? "3px solid #45597a" : "none",
                    cursor: "pointer",
                    fontWeight: selectedCategoryId === cat.id ? "600" : "400",
                    transition: "all 0.2s",
                  }}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="leads-table-wrap">
          <table className="table leads-table mb-0">
            <thead>
              <tr>
                <th style={{ width: "80px" }}>Index No.</th>
                <th>Category</th>
                <th>Name</th>
                <th style={{ width: "80px" }}>Sub Types</th>
                <th style={{ width: "120px" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="5" className="text-center text-muted py-4">
                    Loading...
                  </td>
                </tr>
              ) : categoryParents.length > 0 ? (
                categoryParents.map((serviceType, parentIndex) => {
                  const children = getVisibleChildren(serviceType.id);
                  const isExpanded = expandedParents[serviceType.id?.toString()] ?? true;
                  return (
                    <Fragment key={serviceType.id}>
                      <tr className="service-type-parent-row">
                        <td>{parentIndex + 1}</td>
                        <td>{getCategoryName(serviceType.categoryId)}</td>
                        <td>
                          <button
                            type="button"
                            className="service-type-toggle"
                            onClick={() => toggleParent(serviceType.id)}
                            aria-label={isExpanded ? "Collapse" : "Expand"}
                          >
                            <i className={`ti ${isExpanded ? "ti-chevron-down" : "ti-chevron-right"}`} />
                          </button>
                          <strong>{serviceType.name}</strong>
                        </td>
                        <td>
                          <span style={{
                            backgroundColor: "#e8eaf6",
                            color: "#5e35b1",
                            padding: "0.25rem 0.75rem",
                            borderRadius: "4px",
                            fontSize: "0.875rem",
                            fontWeight: "500"
                          }}>
                            {children.length}
                          </span>
                        </td>
                        <td>
                          <button
                            className="btn btn-sm d-inline-flex align-items-center justify-content-center"
                            style={{
                              backgroundColor: "#28a745",
                              color: "#fff",
                              width: 32,
                              height: 32,
                              padding: 0,
                              borderRadius: 4,
                              border: "none",
                              marginRight: "0.5rem",
                            }}
                            onClick={() => handleAddSubType(serviceType)}
                            title="Add Sub Type"
                          >
                            <i className="ti ti-plus" style={{ fontSize: "14px" }} />
                          </button>
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
                            onClick={() => handleEdit(serviceType)}
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
                            onClick={() => handleDelete(serviceType)}
                            title="Delete"
                          >
                            <i className="ti ti-trash" style={{ fontSize: "14px" }} />
                          </button>
                        </td>
                      </tr>
                      {isExpanded && children.map((child, childIndex) => (
                        <tr key={child.id} className="service-type-child-row">
                          <td>{parentIndex + 1}.{childIndex + 1}</td>
                          <td>{getCategoryName(child.categoryId)}</td>
                          <td>
                            <span className="service-type-child-label">{child.name}</span>
                          </td>
                          <td></td>
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
                              onClick={() => handleEdit(child)}
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
                              onClick={() => handleDelete(child)}
                              title="Delete"
                            >
                              <i className="ti ti-trash" style={{ fontSize: "14px" }} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </Fragment>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="5" className="text-center text-muted py-4">
                    No service types found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showCreate && (
        <>
          <div className="modal fade show lead-create-modal" style={{ display: "block" }} tabIndex="-1">
            <div className="modal-dialog modal-md">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">
                    {editingId 
                      ? "Edit Service Type" 
                      : form.parentId 
                      ? "Add New Sub Type" 
                      : "Add New Service Type"}
                  </h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => setShowCreate(false)}
                  />
                </div>
                <div className="modal-body lead-create-shell service-types-modal-body">
                  <div className="row g-4">
                     {!form.parentId && (
                      <div className="col-12">
                        <label className="form-label">Category</label>
                        <select
                          className="form-control"
                          value={form.categoryId}
                          onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
                        >
                          <option value="">-- Select Category --</option>
                          {categories.map((cat) => (
                            <option key={cat.id} value={cat.id}>
                              {cat.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}
                    <div className="col-12">
                      <label className="form-label">Service Type Name</label>
                      <input
                        type="text"
                        className="form-control"
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        placeholder="Enter service type name"
                        autoFocus
                      />
                    </div>

                   
                  </div>
                </div>
                <div className="modal-footer">
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
          <div className="modal-backdrop fade show lead-create-backdrop" />
        </>
      )}

      {confirmDialog}
    </div>
  );
}
