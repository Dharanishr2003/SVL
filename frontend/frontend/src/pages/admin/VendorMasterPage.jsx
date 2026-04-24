import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  getVendors,
  updateVendor,
  deleteVendor,
} from "../../api/vendorsApi";
import { getVendorTypes } from "../../api/vendorTypesApi";
import { getServiceCategories } from "../../api/serviceCategoriesApi";
import { getServiceTypes } from "../../api/serviceTypesApi";
import { extractApiErrorMessage } from "../../utils/errorMessage";
import { useToast } from "../../components/system/ToastProvider";
import useConfirmDialog from "../../components/system/useConfirmDialog";
import AddVendorModal from "./AddVendorModal";
import EditVendorModal from "./EditVendorModal";

export default function VendorMasterPage() {
  const { showSuccess, showError } = useToast();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editVendor, setEditVendor] = useState(null);
  const [saving, setSaving] = useState(false);
  const [statusSavingId, setStatusSavingId] = useState(null);
  const [search, setSearch] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [showProductsModal, setShowProductsModal] = useState(false);
  const [productsTarget, setProductsTarget] = useState(null);
  const [popupMode, setPopupMode] = useState("types");
  
  // Lookup data
  const [vendorTypes, setVendorTypes] = useState([]);
  const [categories, setCategories] = useState([]);
  const [serviceTypes, setServiceTypes] = useState([]);

  // Load master data
  const loadMasterData = async () => {
    try {
      const [types, cats, allTypes] = await Promise.all([
        getVendorTypes(),
        getServiceCategories(),
        getServiceTypes(),
      ]);
      setVendorTypes(Array.isArray(types) ? types : []);
      setCategories(Array.isArray(cats) ? cats : []);
      setServiceTypes(Array.isArray(allTypes) ? allTypes : []);
    } catch (e) {
      console.warn("Failed to load master data", e);
    }
  };

  const load = async () => {
    setLoading(true);
    try {
      const data = await getVendors();
      setRows(Array.isArray(data) ? data : []);
    } catch (e) {
      setRows([]);
      showError(extractApiErrorMessage(e, "Failed to load vendors"), { title: "Vendors" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    loadMasterData();
  }, []);

  const filteredRows = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return rows;
    return rows.filter((r) =>
      (r.vendorName || "").toLowerCase().includes(q) ||
      (r.contactPerson || "").toLowerCase().includes(q) ||
      (r.officialEmail || "").toLowerCase().includes(q)
    );
  }, [rows, search]);

  const confirmDelete = (row) => {
    setDeleteTarget(row);
    setSelectedId(row.id);
    setShowDeleteModal(true);
  };

  const handleDelete = async () => {
    if (!selectedId) return;
    setSaving(true);
    try {
      await deleteVendor(selectedId);
      showSuccess("Vendor deleted successfully", { title: "Vendors" });
      setShowDeleteModal(false);
      setSelectedId(null);
      setDeleteTarget(null);
      await load();
    } catch (e2) {
      const msg = extractApiErrorMessage(e2, "Failed to delete vendor");
      showError(msg, { title: "Vendors" });
    } finally {
      setSaving(false);
    }
  };

  const buildVendorUpdatePayload = (row, nextStatus) => ({
    vendorName : row.vendorName || "",
    contactPerson: row.contactPerson || "",
    phone: row.phone || "",
    email: row.email || "",
    address: row.address || "",
    materialsSupplied: row.materialsSupplied || [],
    countryCode: row.countryCode || "",
    officialEmail: row.officialEmail || "",
    secondaryEmail: row.secondaryEmail || "",
    vendorTypeIds: row.vendorTypeIds || [],
    productIds: row.productIds || [],
    brandIds: row.brandIds || [],
    dealsWith: row.dealsWith || "",
    internalRepresentative: row.internalRepresentative || "",
    relationshipSince: row.relationshipSince ? row.relationshipSince : null,
    companyWebsite: row.companyWebsite || "",
    countryOfRegistration: row.countryOfRegistration || "",
    companyRegistrationNo: row.companyRegistrationNo || "",
    gstNumber: row.gstNumber || "",
    panNumber: row.panNumber || "",
    companyAddress: row.companyAddress || "",
    bankDetails: Array.isArray(row.bankDetails) ? row.bankDetails : [],
    status: nextStatus,
  });

  const toggleVendorStatus = async (row) => {
    const current = (row.status || "active").toLowerCase();
    const nextStatus = current === "active" ? "inactive" : "active";

    setStatusSavingId(row.id);
    try {
      await updateVendor(row.id, buildVendorUpdatePayload(row, nextStatus));
      setRows((prev) =>
        prev.map((r) => (r.id === row.id ? { ...r, status: nextStatus } : r))
      );
      showSuccess(`Vendor marked ${nextStatus}`, { title: "Vendors" });
    } catch (e) {
      const msg = extractApiErrorMessage(e, "Failed to update status");
      showError(msg, { title: "Vendors" });
    } finally {
      setStatusSavingId(null);
    }
  };

  const getSelectedVendorTypes = (row) => {
    const ids = Array.isArray(row?.vendorTypeIds) ? row.vendorTypeIds : [];
    if (ids.length === 0) return [];
    return ids
      .map((id) => vendorTypes.find((type) => Number(type.id) === Number(id)))
      .filter(Boolean)
      .map((type) => ({
        id: type.id,
        name: type.typeName || "-",
      }));
  };

  const getProductNames = (ids) => {
    if (!Array.isArray(ids) || ids.length === 0) return "-";
    return ids
      .map((id) => categories.find((cat) => Number(cat.id) === Number(id))?.name || "")
      .filter(Boolean)
      .join(", ");
  };

  const getSelectedServiceItems = (row) => {
    const brandIds = Array.isArray(row?.brandIds) ? row.brandIds : [];
    if (brandIds.length === 0) return [];

    return brandIds
      .map((id) => {
        const selected = serviceTypes.find((type) => Number(type.id) === Number(id));
        if (!selected) return null;

        if (selected.parentId) {
          const parent = serviceTypes.find((type) => Number(type.id) === Number(selected.parentId));
          const category = categories.find(
            (cat) => Number(cat.id) === Number(parent?.categoryId ?? selected.categoryId),
          );
          return {
            id: selected.id,
            categoryName: category?.name || "-",
            typeName: parent?.name || "-",
            subTypeName: selected.name || "-",
          };
        }

        const category = categories.find((cat) => Number(cat.id) === Number(selected.categoryId));
        return {
          id: selected.id,
          categoryName: category?.name || "-",
          typeName: selected.name || "-",
          subTypeName: "-",
        };
      })
      .filter(Boolean);
  };

  const openProductsModal = (row, mode) => {
    setPopupMode(mode);
    setProductsTarget(row);
    setShowProductsModal(true);
  };

  return (
    <>
      <div className="content">
        <div className="d-md-flex d-block align-items-center justify-content-between page-breadcrumb mb-3">
          <div className="my-auto mb-2">
            <h2 className="mb-1">Vendor Management</h2>
            <nav>
              <ol className="breadcrumb mb-0">
                <li className="breadcrumb-item">
                  <Link to="/admin-dashboard">
                    <i className="ti ti-smart-home"></i>
                  </Link>
                </li>
                <li className="breadcrumb-item">
                  <Link to="/stocks/vendors">Vendor Management</Link>
                </li>
                <li className="breadcrumb-item active">Vendors</li>
              </ol>
            </nav>
          </div>
          <div className="d-flex align-items-center gap-2 mb-2">
            <input
              type="text"
              className="form-control"
              placeholder="Search vendor..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ maxWidth: 260 }}
            />
            <button
              type="button"
              className="btn btn-primary d-flex align-items-center"
              onClick={() => setShowAddModal(true)}
              style={{ whiteSpace: "nowrap" }}
            >
              <i className="ti ti-circle-plus me-2"></i>Add Vendor
            </button>
          </div>
        </div>

        <div className="card">
          <div className="card-header d-flex align-items-center justify-content-between">
            <h5 className="mb-0">Vendor List</h5>
            <span className="badge bg-primary">
              {filteredRows.length} vendor{filteredRows.length !== 1 ? "s" : ""}
            </span>
          </div>
          <div className="card-body p-0">
            <div
              className="custom-datatable-filter table-responsive"
              style={{ overflowX: "auto", WebkitOverflowScrolling: "touch", touchAction: "pan-x" }}
            >
              <table className="table table-sm">
                <thead className="thead-light">
                  <tr>
                    <th style={{ width: "50px" }}>#</th>
                    <th>Vendor / Company Name</th>
                    <th>Mobile</th>
                    <th>Vendor / Company Types</th>
                    <th>Products</th>
                    <th>Status</th>
                    <th style={{ width: "80px" }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={7}>Loading...</td>
                    </tr>
                  ) : filteredRows.length === 0 ? (
                    <tr>
                      <td colSpan={7}>No vendors found</td>
                    </tr>
                  ) : (
                    filteredRows.map((row, idx) => (
                      <tr key={row.id}>
                        <td>{idx + 1}</td>
                        <td className="fw-semibold">{row.vendorName || "—"}</td>
                        <td>{row.phone || "—"}</td>
                        <td>
                          <button
                            type="button"
                            className="btn btn-sm btn-outline-primary"
                            onClick={() => openProductsModal(row, "types")}
                          >
                            View
                          </button>
                        </td>
                        <td>
                          <button
                            type="button"
                            className="btn btn-sm btn-outline-primary"
                            onClick={() => openProductsModal(row, "products")}
                          >
                            View
                          </button>
                        </td>
                        <td>
                          <div className="d-flex align-items-center gap-2">
                            <div className="form-check form-switch m-0">
                              <input
                                className="form-check-input"
                                type="checkbox"
                                checked={(row.status || "active").toLowerCase() === "active"}
                                disabled={statusSavingId === row.id}
                                onChange={() => toggleVendorStatus(row)}
                                aria-label="Toggle vendor status"
                              />
                            </div>
                            <span
                              className={`badge ${
                                (row.status || "").toLowerCase() === "active"
                                  ? "bg-success"
                                  : "bg-danger"
                              }`}
                            >
                              {(row.status || "active").toLowerCase() === "active"
                                ? "Active"
                                : "Inactive"}
                            </span>
                          </div>
                        </td>
                        <td>
                          <div className="action-icon d-inline-flex">
                            <Link
                              to={`/stocks/vendors/${row.id}`}
                              className="btn btn-link p-0 me-2"
                              title="View vendor"
                            >
                              <i className="ti ti-eye"></i>
                            </Link>
                            <button
                              type="button"
                              className="btn btn-link p-0 me-2"
                              title="Edit vendor"
                              onClick={() => setEditVendor(row)}
                            >
                              <i className="ti ti-edit"></i>
                            </button>
                            <button
                              type="button"
                              className="btn btn-link p-0 text-danger"
                              onClick={() => confirmDelete(row)}
                              aria-label="Delete vendor"
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

      <AddVendorModal
        open={showAddModal}
        onClose={() => setShowAddModal(false)}
        onCreated={load}
      />
      <EditVendorModal
        open={!!editVendor}
        vendor={editVendor}
        onClose={() => setEditVendor(null)}
        onUpdated={load}
      />

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <>
          <div
            className="modal fade show"
            style={{ display: "block" }}
            tabIndex="-1"
          >
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content">
                <div className="modal-header">
                  <h4 className="modal-title">Confirm Delete</h4>
                </div>
                <div className="modal-body">
                  <p>
                    Are you sure you want to delete vendor:{" "}
                    <strong>{deleteTarget?.vendorName}</strong>?
                  </p>
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-light"
                    onClick={() => setShowDeleteModal(false)}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="btn btn-danger"
                    onClick={handleDelete}
                    disabled={saving}
                  >
                    {saving ? "Deleting..." : "Delete"}
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div className="modal-backdrop fade show" />
        </>
      )}

      {/* Product Details Modal */}
      {showProductsModal && (
        <>
          <div className="modal fade show" style={{ display: "block" }} tabIndex="-1">
            <div className="modal-dialog modal-lg modal-dialog-centered">
              <div className="modal-content">
                <div className="modal-header">
                  <h4 className="modal-title">
                    {popupMode === "types" ? "Vendor Type Details" : "Product Details"}: {productsTarget?.vendorName || "Vendor"}
                  </h4>
                </div>
                <div className="modal-body">
                  {popupMode === "types" ? (
                    <div className="mb-3">
                      <h6 className="mb-2">Vendor / Company Types</h6>
                      {getSelectedVendorTypes(productsTarget).length === 0 ? (
                        <div>-</div>
                      ) : (
                        <div className="d-flex flex-wrap gap-2">
                          {getSelectedVendorTypes(productsTarget).map((item) => (
                            <span key={item.id} className="badge bg-light text-dark">
                              {item.name}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    <>
                      <div className="mb-3">
                        <h6 className="mb-2">Service Categories</h6>
                        <div>{getProductNames(productsTarget?.productIds)}</div>
                      </div>
                      <div>
                        <h6 className="mb-2">Selected Types / Sub-Types</h6>
                        {getSelectedServiceItems(productsTarget).length === 0 ? (
                          <div>-</div>
                        ) : (
                          <div
                            className="table-responsive"
                            style={{ overflowX: "auto", WebkitOverflowScrolling: "touch", touchAction: "pan-x" }}
                          >
                            <table className="table table-sm table-bordered mb-0">
                              <thead>
                                <tr>
                                  <th style={{ width: "50px" }}>#</th>
                                  <th>Category</th>
                                  <th>Type</th>
                                  <th>Sub-Type</th>
                                </tr>
                              </thead>
                              <tbody>
                                {getSelectedServiceItems(productsTarget).map((item, index) => (
                                  <tr key={`${item.id}-${index}`}>
                                    <td>{index + 1}</td>
                                    <td>{item.categoryName}</td>
                                    <td>{item.typeName}</td>
                                    <td>{item.subTypeName}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-light"
                    onClick={() => {
                      setShowProductsModal(false);
                      setProductsTarget(null);
                    }}
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div className="modal-backdrop fade show" />
        </>
      )}
    </>
  );
}


