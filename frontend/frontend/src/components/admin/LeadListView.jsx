import React from "react";
import LoadingSpinner from "../common/LoadingSpinner";
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

export default function LeadListView({
  pagedRows,
  loading,
  selectedLeadIds,
  toggleSelectAll,
  toggleLeadSelection,
  pageOffset,
  activeActionsRow,
  setActiveActionsRow,
  setActionsMenuPos,
  getStatusClass,
  formatCreatedOn,
  sortField,
  sortOrder,
  onSort,
}) {
  return (
    <div
      className="table-responsive leads-table-wrap border-0 shadow-sm mb-4"
      style={{ overflowX: "auto", WebkitOverflowScrolling: "touch", touchAction: "pan-x", borderRadius: 12, minHeight: "260px" }}
    >
      <table className="table table-hover align-middle leads-table mb-0">
        <thead>
          <tr>
            <th className="col-select" style={{ width: 36 }}>
              <input
                type="checkbox"
                className="form-check-input"
                checked={
                  pagedRows.length > 0 &&
                  pagedRows.every((row) => selectedLeadIds.has(row.id))
                }
                onChange={toggleSelectAll}
              />
            </th>
            <th className="col-index text-nowrap text-muted" style={{ fontWeight: "600", fontSize: "0.85rem" }}>#</th>
            <th
              className="col-name text-muted"
              style={{ fontWeight: "600", fontSize: "0.85rem", cursor: "pointer", userSelect: "none" }}
              onClick={() => onSort("name")}
            >
              Name {sortField === "name" && <span className="ms-1 sort-indicator text-muted">{sortOrder === "asc" ? "▲" : "▼"}</span>}
            </th>
            <th className="col-mobile text-muted" style={{ fontWeight: "600", fontSize: "0.85rem" }}>Mobile</th>
            <th className="col-source text-muted" style={{ fontWeight: "600", fontSize: "0.85rem" }}>
              Source
            </th>
            <th className="col-status text-muted" style={{ fontWeight: "600", fontSize: "0.85rem" }}>
              Status
            </th>
            <th className="col-owner text-muted" style={{ fontWeight: "600", fontSize: "0.85rem" }}>
              Owner
            </th>
            <th
              className="col-date text-muted"
              style={{ fontWeight: "600", fontSize: "0.85rem", cursor: "pointer", userSelect: "none" }}
              onClick={() => onSort("createdAt")}
            >
              Created On {sortField === "createdAt" && <span className="ms-1 sort-indicator text-muted">{sortOrder === "asc" ? "▲" : "▼"}</span>}
            </th>
            <th className="col-actions text-muted" style={{ fontWeight: "600", fontSize: "0.85rem" }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td colSpan={11} className="text-center py-4 text-muted">
                <LoadingSpinner size="page" label="Loading leads" />
              </td>
            </tr>
          ) : pagedRows.length === 0 ? (
            <tr>
              <td colSpan={11} className="text-center py-4 text-muted">No leads found</td>
            </tr>
          ) : (
            pagedRows.map((row, index) => {
              const statusKey = String(row.status || "").trim().toLowerCase();
              const isDealRow = statusKey === "deal";
              return (
                <tr key={row.id}>
                  <td className="col-select">
                    {isDealRow ? null : (
                      <input
                        type="checkbox"
                        className="form-check-input"
                        checked={selectedLeadIds.has(row.id)}
                        onChange={() => toggleLeadSelection(row.id)}
                      />
                    )}
                  </td>
                  <td className="col-index text-muted" style={{ fontSize: "0.9rem" }}>{pageOffset + index + 1}</td>
                  <td className="col-name fw-semibold" style={{ color: "#1e293b", fontSize: "0.9rem" }}>{row.name || "-"}</td>
                  <td className="col-mobile" style={{ fontSize: "0.9rem" }}>
                    <div className="d-flex align-items-center gap-2">
                      <span>{row.mobile || "-"}</span>
                      {row.mobile && (
                        <a
                          className="btn-phone-call d-flex align-items-center justify-content-center"
                          href={`tel:${row.mobile}`}
                          style={{ width: 28, height: 28, borderRadius: "50%", border: "1px solid #e2e8f0", color: "#64748b", backgroundColor: "#fff" }}
                        >
                          <PhoneGlyph size={11} />
                        </a>
                      )}
                    </div>
                  </td>
                  <td className="col-source" style={{ fontSize: "0.9rem", color: "#475569" }}>{row.secondarySource || row.primarySource || "-"}</td>
                  <td className="col-status">
                    <span
                      className={`status-pill ${getStatusClass(row.status)}`}
                      style={getStatusStyle(row.status)}
                    >
                      {formatStatusLabel(row.status) || "-"}
                    </span>
                  </td>
                  <td className="col-owner" style={{ fontSize: "0.9rem", color: "#475569" }}>
                    {row.owner || "-"}
                  </td>
                  <td className="col-date" style={{ fontSize: "0.9rem", color: "#475569" }}>{formatCreatedOn(row.createdAt)}</td>
                  <td className="col-actions">
                    <button
                      className="btn btn-kebab-actions d-flex align-items-center justify-content-center"
                      style={{ width: 32, height: 32, borderRadius: "50%", border: "none", backgroundColor: "transparent", color: "#64748b" }}
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
                      <i className="ti ti-dots-vertical" style={{ fontSize: "1.15rem" }} />
                    </button>
                  </td>
                </tr>
              )
            })
          )}
        </tbody>
      </table>
    </div>
  );
}
