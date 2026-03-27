import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  getVendors,
  updateVendor,
  deleteVendor,
} from "../../api/vendorsApi";
import { getVendorTypes } from "../../api/vendorTypesApi";
import { getStockCategories } from "../../api/stocksApi";
import { extractApiErrorMessage } from "../../utils/errorMessage";
import { useToast } from "../../components/system/ToastProvider";
import useConfirmDialog from "../../components/system/useConfirmDialog";

export default function VendorMasterPage() {
  const { showSuccess, showError } = useToast();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [statusSavingId, setStatusSavingId] = useState(null);
  const [search, setSearch] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  
  // Lookup data
  const [vendorTypes, setVendorTypes] = useState([]);
  const [categories, setCategories] = useState([]);

  // Load master data
  const loadMasterData = async () => {
    try {
      const [types, cats] = await Promise.all([
        getVendorTypes(),
        getStockCategories(),
      ]);
      setVendorTypes(Array.isArray(types) ? types : []);
      setCategories(Array.isArray(cats) ? cats : []);
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
    vendorName: row.vendorName || "",
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

  const closeBtn = (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="#000"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="6" y1="6" x2="18" y2="18" />
      <line x1="18" y1="6" x2="6" y2="18" />
    </svg>
  );

  // Helper to get vendor type names
  const getVendorTypeNames = (ids) => {
    if (!Array.isArray(ids) || ids.length === 0) return "—";
    return ids
      .map((id) => vendorTypes.find((vt) => vt.id === id)?.typeName || "")
      .filter(Boolean)
      .join(", ");
  };

  // Helper to get product names
  const getProductNames = (ids) => {
    if (!Array.isArray(ids) || ids.length === 0) return "—";
    return ids
      .map((id) => categories.find((cat) => cat.id === id)?.name || "")
      .filter(Boolean)
      .join(", ");
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
            <Link to="/stocks/vendors/add" className="btn btn-primary d-flex align-items-center">
              <i className="ti ti-circle-plus me-2"></i>Add Vendor
            </Link>
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
            <div className="custom-datatable-filter table-responsive">
              <table className="table table-sm">
                <thead className="thead-light">
                  <tr>
                    <th style={{ width: "50px" }}>#</th>
                    <th>Vendor Name</th>
                    <th>Official Email</th>
                    <th>Vendor Types</th>
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
                        <td>{row.officialEmail || "—"}</td>
                        <td>
                          <small>{getVendorTypeNames(row.vendorTypeIds)}</small>
                        </td>
                        <td>
                          <small>{getProductNames(row.productIds)}</small>
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
                              to={`/stocks/vendors/edit/${row.id}`}
                              className="btn btn-link p-0 me-2"
                              title="Edit vendor"
                            >
                              <i className="ti ti-edit"></i>
                            </Link>
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
                  <button
                    type="button"
                    className="btn-close custom-btn-close"
                    onClick={() => setShowDeleteModal(false)}
                  >
                    {closeBtn}
                  </button>
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
    </>
  );
}
