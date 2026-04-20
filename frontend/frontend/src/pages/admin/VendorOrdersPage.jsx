import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { getVendorOrders, updateVendorOrderApi } from "../../api/vendorOrdersApi";
import CreateVendorOrderModal from "./CreateVendorOrderModal";
import "./VendorOrdersPage.css";

const STATUS_CLASS = {
  New: "status-new",
  Draft: "status-draft",
  Sent: "status-sent",
  Accepted: "status-accepted",
  Rejected: "status-rejected",
  "Work Started": "status-work-started",
  Acknowledged: "status-acknowledged",
  "In Production": "status-in-production",
  Delivered: "status-delivered",
  Cancelled: "status-cancelled",
};

const PAYMENT_CLASS = {
  Pending: "pay-pending",
  "Sent To Accounts": "pay-sent-to-accounts",
  "Advance Paid": "pay-advance-paid",
  Verified: "pay-verified",
  "Final Payment Pending": "pay-final-pending",
};

export default function VendorOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [search, setSearch] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [advancePaidModalOpen, setAdvancePaidModalOpen] = useState(false);
  const [advancePaidOrderId, setAdvancePaidOrderId] = useState(null);
  const [advancePaidAmount, setAdvancePaidAmount] = useState("");
  const [advancePaidProofFile, setAdvancePaidProofFile] = useState(null);
  const [advancePaidNotes, setAdvancePaidNotes] = useState("");
  const [advancePaidError, setAdvancePaidError] = useState("");
  const [advancePaidSaving, setAdvancePaidSaving] = useState(false);

  const load = async () => {
    const data = await getVendorOrders().catch(() => []);
    setOrders(Array.isArray(data) ? data : []);
  };

  useEffect(() => {
    load();
  }, []);

  const filteredOrders = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return orders;
    return orders.filter((o) =>
      [o.projectName, o.vendorName, o.materialName]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(q)),
    );
  }, [orders, search]);

  const formatDate = (value) => {
    if (!value) return "-";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "-";
    return date.toLocaleDateString();
  };

  const openAdvancePaidModal = (orderId) => {
    const currentOrder = orders.find((order) => String(order.id) === String(orderId));
    if (!currentOrder) return;
    setAdvancePaidOrderId(orderId);
    setAdvancePaidAmount(currentOrder.advanceAmount || "");
    setAdvancePaidProofFile(null);
    setAdvancePaidNotes("");
    setAdvancePaidError("");
    setAdvancePaidModalOpen(true);
  };

  const submitAdvancePaid = async () => {
    const orderId = advancePaidOrderId;
    const currentOrder = orders.find((order) => String(order.id) === String(orderId));
    if (!currentOrder) return;

    const amount = String(advancePaidAmount || "").trim();
    if (!amount) {
      setAdvancePaidError("Amount is required.");
      return;
    }
    if (!(advancePaidProofFile instanceof File)) {
      setAdvancePaidError("Proof file is required.");
      return;
    }

    setAdvancePaidError("");
    setAdvancePaidSaving(true);
    const updated = await updateVendorOrderApi(orderId, {
      ...currentOrder,
      advanceAmount: amount,
      advancePaidAt: new Date().toISOString(),
      paymentStatus: "Advance Paid",
      advancePaidNotes: advancePaidNotes || "",
      advancePaidProofFile,
    }).catch(() => null);
    setAdvancePaidSaving(false);
    if (!updated) {
      setAdvancePaidError("Failed to mark advance as paid.");
      return;
    }
    setOrders((prev) =>
      prev.map((order) => (String(order.id) === String(orderId) ? updated : order)),
    );
    setAdvancePaidModalOpen(false);
  };

  return (
    <div className="content">
      <div className="vo-header">
        <div className="vo-header-left">
          <h2>Vendor Orders</h2>
          <div className="vo-breadcrumb">
            <Link to="/admin-dashboard"><i className="ti ti-smart-home"></i></Link>
            <span className="vo-breadcrumb-sep">/</span>
            <Link to="/stocks/vendors">Vendor Management</Link>
            <span className="vo-breadcrumb-sep">/</span>
            <span>Orders</span>
          </div>
        </div>
        <div className="vo-toolbar">
          <div className="vo-search-wrap">
            <i className="ti ti-search"></i>
            <input
              type="text"
              className="vo-search-input"
              placeholder="Search orders..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <button type="button" className="vo-add-btn" onClick={() => setShowCreateModal(true)}>
            <i className="ti ti-circle-plus"></i>
            New Order Request
          </button>
        </div>
      </div>

      <div className="vo-card">
        <div className="vo-card-header">
          <h5 className="vo-card-title">Order List</h5>
          <span className="vo-count-badge">
            {filteredOrders.length} order{filteredOrders.length !== 1 ? "s" : ""}
          </span>
        </div>

        <div className="vo-table-wrap">
          <table className="vo-table">
            <thead>
              <tr>
                <th style={{ width: 48 }}>#</th>
                <th>Project Name</th>
                <th>Vendor</th>
                <th>Material</th>
                <th>Design</th>
                <th>Required Date</th>
                <th>Deadline</th>
                <th>Status</th>
                <th>Payment</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.length === 0 ? (
                <tr className="vo-empty-row">
                  <td colSpan={10}>
                    {search ? "No orders match your search." : "No orders found."}
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order, idx) => {
                  const status = order.status || "Draft";
                  const paymentStatus =
                    status === "Delivered" && (order.paymentStatus || "Pending") === "Pending"
                      ? "Final Payment Pending"
                      : order.paymentStatus || "Pending";
                  const canMarkAdvancePaid =
                    status === "Accepted" && paymentStatus === "Pending";

                  return (
                    <tr key={order.id || idx}>
                      <td className="vo-row-index">{idx + 1}</td>
                      <td><span className="vo-project-name">{order.projectName || "-"}</span></td>
                      <td className="vo-vendor-name">{order.vendorName || "-"}</td>
                      <td>{order.materialName || "-"}</td>
                      <td>
                        {order.uploadDesignUrl ? (
                          <a href={order.uploadDesignUrl} target="_blank" rel="noreferrer">View</a>
                        ) : (
                          <span className="vo-muted">-</span>
                        )}
                      </td>
                      <td>{formatDate(order.requiredDate)}</td>
                      <td>{formatDate(order.vendorDeadline)}</td>
                      <td>
                        <span className={`vo-badge ${STATUS_CLASS[status] || "status-draft"}`}>
                          {status}
                        </span>
                      </td>
                      <td>
                        <span className={`vo-badge ${PAYMENT_CLASS[paymentStatus] || "pay-pending"}`}>
                          {paymentStatus}
                        </span>
                      </td>
                      <td>
                        <div className="vo-actions">
                          <Link
                            to={`/stocks/vendor-orders/${order.id}`}
                            className="vo-action-btn view"
                            title="View order"
                          >
                            <i className="ti ti-eye"></i>
                          </Link>
                          {canMarkAdvancePaid ? (
                            <button
                              type="button"
                              className="vo-action-btn advance-paid"
                              onClick={() => openAdvancePaidModal(order.id)}
                            >
                              <i className="ti ti-check"></i>
                              Mark Advance Paid
                            </button>
                          ) : (
                            <span className="vo-muted">-</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      <CreateVendorOrderModal
        open={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreated={load}
      />

      {advancePaidModalOpen ? (
        <>
          <div className="modal fade show" style={{ display: "block" }} tabIndex="-1">
            <div className="modal-dialog modal-dialog-centered modal-md">
              <div className="modal-content">
                <div className="modal-header">
                  <h4 className="modal-title">Mark Advance Paid</h4>
                  <button
                    type="button"
                    className="btn-close custom-btn-close"
                    onClick={() => setAdvancePaidModalOpen(false)}
                    disabled={advancePaidSaving}
                  />
                </div>
                <div className="modal-body">
                  {advancePaidError ? (
                    <div className="alert alert-danger py-2">{advancePaidError}</div>
                  ) : null}

                  <div className="mb-3">
                    <label className="form-label">Amount<span className="text-danger">*</span></label>
                    <input
                      type="text"
                      className="form-control"
                      value={advancePaidAmount}
                      onChange={(e) => setAdvancePaidAmount(e.target.value)}
                      placeholder="Enter advance amount"
                      disabled={advancePaidSaving}
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Proof<span className="text-danger">*</span></label>
                    <input
                      type="file"
                      className="form-control"
                      onChange={(e) => setAdvancePaidProofFile(e.target.files?.[0] || null)}
                      disabled={advancePaidSaving}
                    />
                  </div>

                  <div className="mb-2">
                    <label className="form-label">Notes (optional)</label>
                    <textarea
                      className="form-control"
                      rows={3}
                      value={advancePaidNotes}
                      onChange={(e) => setAdvancePaidNotes(e.target.value)}
                      placeholder="Add notes..."
                      disabled={advancePaidSaving}
                    />
                  </div>
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setAdvancePaidModalOpen(false)}
                    disabled={advancePaidSaving}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={submitAdvancePaid}
                    disabled={advancePaidSaving}
                  >
                    {advancePaidSaving ? "Saving..." : "Save"}
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div className="modal-backdrop fade show" />
        </>
      ) : null}
    </div>
  );
}
