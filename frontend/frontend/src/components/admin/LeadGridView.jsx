import React from "react";
import { getStatusStyle, formatStatusLabel } from "../../utils/statusLabels";

function PhoneGlyph({ size = 14, className = "" }) {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2A19.8 19.8 0 0 1 3.1 5.18 2 2 0 0 1 5.08 3h3a2 2 0 0 1 2 1.72c.12.9.33 1.77.62 2.6a2 2 0 0 1-.45 2.11L9.1 10.6a16 16 0 0 0 4.3 4.3l1.17-1.15a2 2 0 0 1 2.11-.45c.83.29 1.7.5 2.6.62A2 2 0 0 1 22 16.92z" />
    </svg>
  );
}

export default function LeadGridView({
  pagedRows,
  loading,
  selectedLeadIds,
  toggleLeadSelection,
  activeActionsRow,
  setActiveActionsRow,
  setActionsMenuPos,
  getStatusClass,
  formatCreatedOn,
  navigate,
}) {
  return (
    <div className="leads-grid-view row g-3 mb-4">
      {loading ? (
        <div className="col-12 text-center py-5 text-muted">
          <div className="spinner-border text-primary mb-2" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <div>Loading leads...</div>
        </div>
      ) : pagedRows.length === 0 ? (
        <div className="col-12 text-center py-5 text-muted border-0 shadow-sm bg-white" style={{ borderRadius: 12 }}>
          No leads found
        </div>
      ) : (
        pagedRows.map((row, index) => {
          const statusKey = String(row.status || "").trim().toLowerCase();
          const isDealRow = statusKey === "deal";
          return (
            <div key={row.id} className="col-sm-6 col-lg-4 col-xl-3">
              <div className="card border-0 shadow-sm h-100 position-relative" style={{ borderRadius: 12, backgroundColor: "#fff" }}>
                <div className="card-body p-3 d-flex flex-column justify-content-between">
                  <div>
                    {/* Card Header: checkbox and actions */}
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <div>
                        {isDealRow ? null : (
                          <input
                            type="checkbox"
                            className="form-check-input"
                            checked={selectedLeadIds.has(row.id)}
                            onChange={() => toggleLeadSelection(row.id)}
                            style={{ width: 16, height: 16 }}
                          />
                        )}
                      </div>
                      <button
                        className="btn btn-kebab-actions d-flex align-items-center justify-content-center"
                        style={{ width: 28, height: 28, borderRadius: "50%", border: "none", backgroundColor: "transparent", color: "#64748b" }}
                        onClick={(e) => {
                          e.stopPropagation();
                          if (activeActionsRow?.id === row.id) {
                            setActiveActionsRow(null);
                          } else {
                            const rect = e.currentTarget.getBoundingClientRect();
                            setActionsMenuPos({
                              top: rect.top + window.scrollY,
                              left: rect.right + window.scrollX,
                            });
                            setActiveActionsRow(row);
                          }
                        }}
                      >
                        <i className="ti ti-dots-vertical" style={{ fontSize: "1.1rem" }} />
                      </button>
                    </div>

                    {/* Lead Name and Status */}
                    <div className="d-flex justify-content-between align-items-start mb-3 gap-2">
                      <h6 className="fw-semibold mb-0" style={{ color: "#1e293b", fontSize: "0.95rem", lineHeight: "1.3" }}>
                        {row.name || "-"}
                      </h6>
                      <span
                        className={`status-pill ${getStatusClass(row.status)}`}
                        style={{ ...getStatusStyle(row.status), fontSize: "0.75rem", padding: "4px 8px", whiteSpace: "nowrap" }}
                      >
                        {formatStatusLabel(row.status) || "-"}
                      </span>
                    </div>

                    {/* Details */}
                    <div className="text-muted small">
                      <div className="d-flex align-items-center gap-2 mb-2">
                        <i className="ti ti-phone text-muted" style={{ fontSize: "0.95rem" }} />
                        <span style={{ fontSize: "0.85rem" }}>{row.mobile || "-"}</span>
                        {row.mobile && (
                          <a
                            className="btn-phone-call d-flex align-items-center justify-content-center ms-auto"
                            href={`tel:${row.mobile}`}
                            style={{ width: 24, height: 24, borderRadius: "50%", border: "1px solid #e2e8f0", color: "#64748b", backgroundColor: "#fff" }}
                          >
                            <PhoneGlyph size={9} />
                          </a>
                        )}
                      </div>
                      <div className="d-flex align-items-center gap-2 mb-2">
                        <i className="ti ti-world text-muted" style={{ fontSize: "0.95rem" }} />
                        <span style={{ fontSize: "0.85rem" }}>{row.secondarySource || row.primarySource || "-"}</span>
                      </div>
                      <div className="d-flex align-items-center gap-2 mb-2">
                        <i className="ti ti-user text-muted" style={{ fontSize: "0.95rem" }} />
                        <span style={{ fontSize: "0.85rem" }}>{row.owner || "-"}</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 pt-3 border-top d-flex align-items-center justify-content-between">
                    <span className="text-muted" style={{ fontSize: "0.75rem" }}>
                      <i className="ti ti-calendar me-1" />
                      {formatCreatedOn(row.createdAt)}
                    </span>
                    <button
                      className="btn btn-sm btn-outline-primary"
                      style={{ borderRadius: 6, fontSize: "0.75rem", padding: "4px 10px" }}
                      onClick={() => navigate(`/leads/${row.id}`)}
                    >
                      View Details
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}
