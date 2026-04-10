import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getVendorOrders } from "../../api/vendorOrdersApi";
import { extractApiErrorMessage } from "../../utils/errorMessage";
import { useToast } from "../../components/system/ToastProvider";
import api from "../../utils/api";
import "../admin/VendorOrderCreatePage.css";

export default function VendorOrderDetailPage() {
  const { id } = useParams();
  const { showError } = useToast();
  const navigate = useNavigate();

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
        showError(extractApiErrorMessage(e, "Failed to load order details"));
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id, showError]);

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
            <button
              type="button"
              className="voc-back-btn"
              onClick={() => navigate(-1)}
              title="Go back"
            >
              <i className="ti ti-arrow-left"></i>Back
            </button>
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
            <button
              type="button"
              className="voc-back-btn"
              onClick={() => navigate(-1)}
              title="Go back"
            >
              <i className="ti ti-arrow-left"></i>Back
            </button>
          </div>
          <div className="voc-card-body">
            <div className="text-center text-muted p-4">Order not found.</div>
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

  const effectiveStatus = order.status || "New";
  const canShowStatusAndPayment = effectiveStatus !== "New";
  const canShowFiles = true;

  return (
    <div className="content">
      <div className="voc-card">
        <div className="voc-card-header">
          <h5 className="voc-card-title">Order Details</h5>
          <button
            type="button"
            className="voc-back-btn"
            onClick={() => navigate(-1)}
            title="Go back"
          >
            <i className="ti ti-arrow-left"></i>Back
          </button>
        </div>
        <div className="voc-card-body" style={{ textAlign: "justify" }}>
          <h6 className="voc-section-title">Order Information</h6>
          <div className="voc-form">
            <div className="voc-row">
              <div className="voc-col">
                <label className="voc-label">Project Name</label>
                <input type="text" className="voc-input" value={order.projectName || ""} disabled />
              </div>
              <div className="voc-col">
                <label className="voc-label">Material</label>
                <input type="text" className="voc-input" value={order.materialName || ""} disabled />
              </div>
            </div>
            <div className="voc-row">
              <div className="voc-col">
                <label className="voc-label">Category</label>
                <input type="text" className="voc-input" value={order.categoryName || ""} disabled />
              </div>
              <div className="voc-col">
                <label className="voc-label">Type</label>
                <input type="text" className="voc-input" value={order.typeName || ""} disabled />
              </div>
            </div>
            <div className="voc-row">
              <div className="voc-col">
                <label className="voc-label">Sub Type</label>
                <input type="text" className="voc-input" value={order.subtypeName || ""} disabled />
              </div>
              <div className="voc-col">
                <label className="voc-label">Quantity</label>
                <input type="text" className="voc-input" value={order.quantity || ""} disabled />
              </div>
            </div>
            <div className="voc-row">
              <div className="voc-col">
                <label className="voc-label">Required Date</label>
                <input type="text" className="voc-input" value={formatDate(order.requiredDate)} disabled />
              </div>
              <div className="voc-col">
                <label className="voc-label">Vendor Deadline</label>
                <input type="text" className="voc-input" value={formatDate(order.vendorDeadline)} disabled />
              </div>
            </div>
            {canShowStatusAndPayment ? (
              <>
                <h6 className="voc-section-title" style={{ textAlign: "left" }}>Status & Payment</h6>
                <div className="voc-row">
                  <div className="voc-col">
                    <label className="voc-label">Status</label>
                    <span
                      className={`vod-badge ${effectiveStatus === "Accepted" ? "status-accepted" : ""}`}
                      style={
                        effectiveStatus === "Accepted"
                          ? { display: "inline-flex", flexDirection: "column", alignItems: "center", whiteSpace: "normal" }
                          : undefined
                      }
                    >
                      {effectiveStatus}
                      {effectiveStatus === "Accepted" && order.paymentStatus === "Pending" && (
                        <span style={{ fontSize: "0.75rem", fontWeight: "500", color: "#e65100" }}>
                          Waiting for Advance Amount
                        </span>
                      )}
                      {effectiveStatus === "Accepted" && order.paymentStatus === "Advance Paid" && (
                        <span style={{ fontSize: "0.75rem", fontWeight: "500" }}>
                          Ready to Start Work
                        </span>
                      )}
                    </span>
                  </div>
                  <div className="voc-col">
                    <label className="voc-label">Payment Status</label>
                    <input type="text" className="voc-input" value={order.paymentStatus || "Pending"} disabled />
                  </div>
                </div>
              </>
            ) : null}

            {canShowFiles ? (
              <>
                <h6 className="voc-section-title" style={{ textAlign: "left" }}>Files</h6>
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
                          onClick={() => downloadFile(order.uploadDesignUrl, `design-${order.id}`)}
                        >
                          <i className="ti ti-download me-1"></i>Download
                        </button>
                      </div>
                    ) : (
                      <div className="voc-muted">--</div>
                    )}
                  </div>

                  <div className="voc-col">
                    <label className="voc-label">Quotation</label>
                    {order.quotationFileName && order.quotationFileUrl ? (
                      <div style={{ display: "flex", gap: "0.5rem", alignItems: "center", flexWrap: "wrap" }}>
                        <span className="voc-muted">{order.quotationFileName}</span>
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
                          onClick={() => downloadFile(order.quotationFileUrl, order.quotationFileName)}
                        >
                          <i className="ti ti-download me-1"></i>Download
                        </button>
                      </div>
                    ) : (
                      <div className="voc-muted">--</div>
                    )}
                  </div>

                  <div className="voc-col">
                    <label className="voc-label">Advance Proof</label>
                    {order.advancePaidProofUrl ? (
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
                            downloadFile(order.advancePaidProofUrl, `advance-proof-${order.id}`)
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
            ) : null}
            <div className="voc-actions">
              <button
                type="button"
                className="voc-btn light"
                onClick={() => navigate(-1)}
              >
                Back to Previous Page
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
