import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { getVendorOrders } from "../../api/vendorOrdersApi";
import { extractApiErrorMessage } from "../../utils/errorMessage";
import { useToast } from "../../components/system/ToastProvider";
import api from "../../utils/api";
import "./VendorOrderCreatePage.css";

export default function VendorOrderDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showError } = useToast();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const orders = await getVendorOrders();
        const found = Array.isArray(orders)
          ? orders.find((o) => o.id === Number(id))
          : null;
        setOrder(found || null);
      } catch (e) {
        showError(extractApiErrorMessage(e, "Failed to load vendor order details"));
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const viewFile = async (filePath) => {
    if (!filePath) return;
    try {
      const response = await api.get(filePath, { responseType: "blob" });
      const blobUrl = window.URL.createObjectURL(response.data);
      const newTab = window.open(blobUrl, "_blank");
      if (newTab) {
        setTimeout(() => window.URL.revokeObjectURL(blobUrl), 60000);
      }
    } catch (e) {
      showError(extractApiErrorMessage(e, "Failed to view file"));
    }
  };

  const downloadFile = async (filePath, fileName) => {
    if (!filePath || !fileName) return;
    try {
      const response = await api.get(filePath, { responseType: "blob" });
      const blobUrl = window.URL.createObjectURL(response.data);
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(blobUrl);
    } catch (e) {
      showError(extractApiErrorMessage(e, "Failed to download file"));
    }
  };

  if (loading) {
    return (
      <div className="content">
        <div className="voc-card">
          <div className="voc-card-header">
            <h5 className="voc-card-title">Order Details</h5>
            <Link to="/stocks/vendor-orders" className="voc-back-btn">
              <i className="ti ti-arrow-left"></i>
              Back
            </Link>
          </div>
          <div className="voc-card-body">
            <div className="text-center p-4">Loading…</div>
          </div>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="content">
        <div className="voc-card">
          <div className="voc-card-header">
            <h5 className="voc-card-title">Order Details</h5>
            <Link to="/stocks/vendor-orders" className="voc-back-btn">
              <i className="ti ti-arrow-left"></i>
              Back
            </Link>
          </div>
          <div className="voc-card-body">
            <div className="text-center text-muted p-4">Vendor order not found.</div>
          </div>
        </div>
      </div>
    );
  }

  const formatDate = (value) => {
    if (!value) return "-";
    try {
      return new Date(value).toLocaleDateString();
    } catch {
      return String(value);
    }
  };

  const formatDateTime = (value) => {
    if (!value) return "-";
    try {
      return new Date(value).toLocaleString();
    } catch {
      return String(value);
    }
  };

  return (
    <div className="content">
      <div className="voc-card">
        <div className="voc-card-header">
          <h5 className="voc-card-title">Order Details</h5>
          <Link to="/stocks/vendor-orders" className="voc-back-btn">
            <i className="ti ti-arrow-left"></i>
            Back
          </Link>
        </div>

        <div className="voc-card-body">
          <h6 className="voc-section-title">Order Information</h6>

          <div className="voc-form">
            <div className="voc-row">
              <div className="voc-col">
                <label className="voc-label">Project Name</label>
                <input
                  type="text"
                  className="voc-input"
                  value={order.projectName || ""}
                  disabled
                />
              </div>
              <div className="voc-col">
                <label className="voc-label">Vendor</label>
                <input
                  type="text"
                  className="voc-input"
                  value={order.vendorName || ""}
                  disabled
                />
              </div>
            </div>

            <div className="voc-row">
              <div className="voc-col">
                <label className="voc-label">Material</label>
                <input
                  type="text"
                  className="voc-input"
                  value={order.materialName || ""}
                  disabled
                />
              </div>
              <div className="voc-col">
                <label className="voc-label">Category</label>
                <input
                  type="text"
                  className="voc-input"
                  value={order.categoryName || ""}
                  disabled
                />
              </div>
            </div>

            <div className="voc-row">
              <div className="voc-col">
                <label className="voc-label">Type</label>
                <input
                  type="text"
                  className="voc-input"
                  value={order.typeName || ""}
                  disabled
                />
              </div>
              <div className="voc-col">
                <label className="voc-label">Sub Type</label>
                <input
                  type="text"
                  className="voc-input"
                  value={order.subtypeName || ""}
                  disabled
                />
              </div>
            </div>

            <div className="voc-row">
              <div className="voc-col">
                <label className="voc-label">Quantity</label>
                <input
                  type="text"
                  className="voc-input"
                  value={order.quantity || ""}
                  disabled
                />
              </div>
              <div className="voc-col">
                <label className="voc-label">Required Date</label>
                <input
                  type="text"
                  className="voc-input"
                  value={formatDate(order.requiredDate)}
                  disabled
                />
              </div>
            </div>

            <div className="voc-row">
              <div className="voc-col">
                <label className="voc-label">Vendor Deadline</label>
                <input
                  type="text"
                  className="voc-input"
                  value={formatDate(order.vendorDeadline)}
                  disabled
                />
              </div>
              <div className="voc-col">
                <label className="voc-label">Notes</label>
                <input
                  type="text"
                  className="voc-input"
                  value={order.notes || ""}
                  disabled
                />
              </div>
            </div>

            <h6 className="voc-section-title">Status & Payment</h6>

            <div className="voc-row">
              <div className="voc-col">
                <label className="voc-label">Status</label>
                <input
                  type="text"
                  className="voc-input"
                  value={order.status || ""}
                  disabled
                />
              </div>
              <div className="voc-col">
                <label className="voc-label">Payment Status</label>
                <input
                  type="text"
                  className="voc-input"
                  value={order.paymentStatus || ""}
                  disabled
                />
              </div>
            </div>

            <div className="voc-row">
              <div className="voc-col">
                <label className="voc-label">Accounts Status</label>
                <input
                  type="text"
                  className="voc-input"
                  value={order.accountsStatus || ""}
                  disabled
                />
              </div>
              <div className="voc-col">
                <label className="voc-label">Advance Paid At</label>
                <input
                  type="text"
                  className="voc-input"
                  value={formatDateTime(order.advancePaidAt)}
                  disabled
                />
              </div>
            </div>

            <div className="voc-row">
              <div className="voc-col">
                <label className="voc-label">Advance Amount</label>
                <input
                  type="text"
                  className="voc-input"
                  value={
                    order.advanceAmount != null && order.advanceAmount !== ""
                      ? String(order.advanceAmount)
                      : "-"
                  }
                  disabled
                />
                {order.advancePaidProofUrl ? (
                  <div style={{ marginTop: "0.5rem" }}>
                    <label className="voc-label">Advance Proof</label>
                    <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                      <button
                        type="button"
                        className="btn btn-outline-primary btn-sm"
                        onClick={() => viewFile(order.advancePaidProofUrl)}
                      >
                        <i className="ti ti-eye me-1"></i>View
                      </button>
                      <button
                        type="button"
                        className="btn btn-outline-secondary btn-sm"
                        onClick={() =>
                          downloadFile(
                            order.advancePaidProofUrl,
                            order.advancePaidProofUrl.split("/").pop(),
                          )
                        }
                      >
                        <i className="ti ti-download me-1"></i>Download
                      </button>
                    </div>
                  </div>
                ) : null}
              </div>
              <div className="voc-col">
                <label className="voc-label">Advance Notes</label>
                <textarea
                  className="voc-textarea"
                  rows={3}
                  value={order.advancePaidNotes || ""}
                  disabled
                />
              </div>
            </div>

            {/* Files Section */}
            <>
              <h6 className="voc-section-title">Files</h6>

              <div className="voc-row">
                <div className="voc-col">
                  <label className="voc-label">Design File</label>
                  {order.uploadDesignUrl ? (
                    <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                      <button
                        type="button"
                        className="btn btn-outline-primary btn-sm"
                        onClick={() => viewFile(order.uploadDesignUrl)}
                      >
                        <i className="ti ti-eye me-1"></i>View
                      </button>
                      <button
                        type="button"
                        className="btn btn-outline-secondary btn-sm"
                        onClick={() =>
                          downloadFile(
                            order.uploadDesignUrl,
                            order.uploadDesignUrl.split("/").pop()
                          )
                        }
                      >
                        <i className="ti ti-download me-1"></i>Download
                      </button>
                    </div>
                  ) : (
                    <div className="voc-muted">--</div>
                  )}
                </div>

                <div className="voc-col">
                  <label className="voc-label">
                    Quotation File{order.quotationFileName ? ` (${order.quotationFileName})` : ""}
                  </label>
                  {order.quotationFileName && order.quotationFileUrl ? (
                    <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                      <button
                        type="button"
                        className="btn btn-outline-primary btn-sm"
                        onClick={() => viewFile(order.quotationFileUrl)}
                      >
                        <i className="ti ti-eye me-1"></i>View
                      </button>
                      <button
                        type="button"
                        className="btn btn-outline-secondary btn-sm"
                        onClick={() =>
                          downloadFile(order.quotationFileUrl, order.quotationFileName)
                        }
                      >
                        <i className="ti ti-download me-1"></i>Download
                      </button>
                    </div>
                  ) : (
                    <div className="voc-muted">--</div>
                  )}
                </div>
              </div>
            </>

            <div className="voc-actions">
              <Link to="/stocks/vendor-orders" className="voc-btn light">
                Back to Orders
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
