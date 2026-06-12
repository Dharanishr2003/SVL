import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { createPortal } from "react-dom";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import * as attendanceApi from '../../api/attendanceApi';
import PageSizeSelector from "../../components/admin/PageSizeSelector";
import "./LeadsPage.css";
import "../../../public/assets/css/addModalShared.css";

function fmtTime(dt) {
  if (!dt) return '-';
  return new Date(dt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
}
function fmtDate(dt) {
  if (!dt) return '-';
  return new Date(dt).toLocaleDateString([], { day: '2-digit', month: 'short', year: 'numeric' });
}
function fmtDuration(mins) {
  if (mins == null || mins <= 0) return '-';
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

const AttendanceAdminPage = () => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [fromDate, setFromDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 7);
    return d.toISOString().split('T')[0];
  });
  const [toDate, setToDate] = useState(() => new Date().toISOString().split('T')[0]);

  // Bulk operation and search states
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const rec = await attendanceApi.getAdminRange(fromDate, toDate).catch(() => []);
      setRecords(Array.isArray(rec) ? rec : []);
      setSelectedIds(new Set());
    } catch (e) {
      setError(e?.response?.data?.message || e.message || 'Failed to load attendance');
    } finally {
      setLoading(false);
    }
  }, [fromDate, toDate]);

  useEffect(() => { loadData(); }, [loadData]);

  const presentCount = records.filter(r => ['CHECKED_IN', 'ON_BREAK', 'ON_LUNCH', 'CHECKED_OUT', 'AUTO_CHECKOUT'].includes(r.status)).length;
  const lateCount = records.filter(r => r.isLate).length;
  const absentCount = records.filter(r => !r.checkInTime).length;

  // Search & filter
  const filteredRecords = records.filter(r => {
    const name = (r.userName || `User ${r.userId}`).toLowerCase();
    const role = (r.userRole || '').toLowerCase();
    const q = searchQuery.toLowerCase();
    return name.includes(q) || role.includes(q);
  });

  // Client side pagination
  const totalRows = filteredRecords.length;
  const pageCount = Math.max(1, Math.ceil(totalRows / pageSize));
  const clampedPage = Math.min(Math.max(1, page), pageCount);
  const pageOffset = (clampedPage - 1) * pageSize;
  const pagedRecords = filteredRecords.slice(pageOffset, pageOffset + pageSize);

  const handleSelectAll = (checked) => {
    if (checked) {
      setSelectedIds(new Set(pagedRecords.map(r => r.id)));
    } else {
      setSelectedIds(new Set());
    }
  };

  const handleSelectRow = (id, checked) => {
    const next = new Set(selectedIds);
    if (checked) {
      next.add(id);
    } else {
      next.delete(id);
    }
    setSelectedIds(next);
  };

  const exportExcel = () => {
    const targetRows = selectedIds.size > 0
      ? records.filter(r => selectedIds.has(r.id))
      : records;
    const headers = ["Employee", "Role", "Date", "Check In Location", "Check Out Location", "Check In", "Check Out", "Work Time", "Status", "Late", "Overtime", "Checkout Status"];
    const escapeXml = (unsafe) => String(unsafe ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    const headerHtml = `<tr>${headers.map(h => `<th>${escapeXml(h)}</th>`).join("")}</tr>`;
    const rowsHtml = targetRows.map(r => `
      <tr>
        <td>${escapeXml(r.userName || `User ${r.userId}`)}</td>
        <td>${escapeXml(r.userRole || '-')}</td>
        <td>${escapeXml(fmtDate(r.attendanceDate))}</td>
        <td>${escapeXml(r.checkInLocationName || '-')}</td>
        <td>${escapeXml(r.checkOutLocationName || '-')}</td>
        <td>${escapeXml(fmtTime(r.checkInTime))}</td>
        <td>${escapeXml(fmtTime(r.checkOutTime))}</td>
        <td>${escapeXml(r.netWorkMinutes ? fmtDuration(r.netWorkMinutes) : '-')}</td>
        <td>${escapeXml(r.status)}</td>
        <td>${escapeXml(r.isLate ? 'Yes' : 'No')}</td>
        <td>${escapeXml(r.overtimeMinutes > 0 ? fmtDuration(r.overtimeMinutes) : '-')}</td>
        <td>${escapeXml(r.isMissedCheckout ? 'Missed' : '-')}</td>
      </tr>
    `).join("");
    const template = `<html><head><meta charset="UTF-8"/></head><body><table><thead>${headerHtml}</thead><tbody>${rowsHtml}</tbody></table></body></html>`;
    const blob = new Blob([template], { type: "application/vnd.ms-excel" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `attendance-admin-${Date.now()}.xls`;
    link.click();
  };

  const exportCsv = () => {
    const targetRows = selectedIds.size > 0
      ? records.filter(r => selectedIds.has(r.id))
      : records;
    const headers = ["Employee", "Role", "Date", "Check In Location", "Check Out Location", "Check In", "Check Out", "Work Time", "Status", "Late", "Overtime", "Checkout Status"];
    const csvContent = [
      headers.join(","),
      ...targetRows.map(r => [
        `"${String(r.userName || `User ${r.userId}`).replace(/"/g, '""')}"`,
        `"${String(r.userRole || '-').replace(/"/g, '""')}"`,
        `"${fmtDate(r.attendanceDate)}"`,
        `"${String(r.checkInLocationName || '-').replace(/"/g, '""')}"`,
        `"${String(r.checkOutLocationName || '-').replace(/"/g, '""')}"`,
        `"${fmtTime(r.checkInTime)}"`,
        `"${fmtTime(r.checkOutTime)}"`,
        `"${r.netWorkMinutes ? fmtDuration(r.netWorkMinutes) : '-'}"`,
        `"${r.status || ''}"`,
        `"${r.isLate ? 'Yes' : 'No'}"`,
        `"${r.overtimeMinutes > 0 ? fmtDuration(r.overtimeMinutes) : '-'}"`,
        `"${r.isMissedCheckout ? 'Missed' : '-'}"`
      ].join(","))
    ].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `attendance-admin-${Date.now()}.csv`;
    link.click();
  };

  const exportPdf = () => {
    const targetRows = selectedIds.size > 0
      ? records.filter(r => selectedIds.has(r.id))
      : records;
    const doc = new jsPDF({ orientation: "landscape", unit: "pt", format: "a4" });
    doc.setFontSize(14);
    doc.text("Attendance Records", 40, 40);
    doc.setFontSize(10);
    doc.text(`Generated: ${new Date().toLocaleString()}`, 40, 58);
    const headers = [["Employee", "Role", "Date", "Check In", "Check Out", "Work Time", "Status", "Late"]];
    const body = targetRows.map(r => [
      r.userName || `User ${r.userId}`,
      r.userRole || '-',
      fmtDate(r.attendanceDate),
      fmtTime(r.checkInTime),
      fmtTime(r.checkOutTime),
      r.netWorkMinutes ? fmtDuration(r.netWorkMinutes) : '-',
      r.status || '',
      r.isLate ? 'Yes' : 'No'
    ]);
    autoTable(doc, {
      head: headers,
      body,
      startY: 72,
      styles: { fontSize: 8, cellPadding: 4 },
      headStyles: { fillColor: [59, 130, 246] },
      margin: { left: 24, right: 24 }
    });
    doc.save(`attendance-admin-${Date.now()}.pdf`);
  };

  return (
    <>
      <div className="content">
        {/* Custom Header Card */}
        <div className="card border-0 shadow-sm mb-4 bg-white" style={{ borderRadius: 12 }}>
          <div className="card-body p-4 d-flex justify-content-between align-items-center flex-wrap gap-3">
            <div>
              <h3 className="fw-bold mb-1 text-slate-800" style={{ fontSize: "1.3rem" }}>Attendance Records</h3>
              <nav aria-label="breadcrumb">
                <ol className="breadcrumb mb-0" style={{ fontSize: "0.85rem" }}>
                  <li className="breadcrumb-item">
                    <Link to="/admin-dashboard" className="text-muted text-decoration-none">
                      <i className="ti ti-smart-home" />
                    </Link>
                  </li>
                  <li className="breadcrumb-item text-muted">Employee</li>
                  <li className="breadcrumb-item active text-primary" aria-current="page">Attendance Records</li>
                </ol>
              </nav>
            </div>
          </div>
        </div>

        {error && (
          <div className="alert alert-danger alert-dismissible fade show" role="alert">
            {error}
            <button type="button" className="btn-close" onClick={() => setError('')}></button>
          </div>
        )}

        {/* Present/Late/Absent counters */}
        <div className="row mb-4">
          <div className="col-xl-3 col-md-6 mb-3 mb-xl-0">
            <div className="card border-0 shadow-sm h-100 bg-white" style={{ borderRadius: 10 }}>
              <div className="card-body">
                <div className="d-flex align-items-center justify-content-between">
                  <div>
                    <p className="text-muted fs-12 fw-medium mb-1">Present</p>
                    <h4 className="mb-0 fw-bold">{presentCount}</h4>
                  </div>
                  <div className="icon-box icon-box-lg icon-box-primary bg-primary-light text-primary" style={{ padding: 12, borderRadius: 8 }}><i className="ti ti-check" style={{ fontSize: "1.4rem" }}></i></div>
                </div>
              </div>
            </div>
          </div>
          <div className="col-xl-3 col-md-6 mb-3 mb-xl-0">
            <div className="card border-0 shadow-sm h-100 bg-white" style={{ borderRadius: 10 }}>
              <div className="card-body">
                <div className="d-flex align-items-center justify-content-between">
                  <div>
                    <p className="text-muted fs-12 fw-medium mb-1">Late Arrivals</p>
                    <h4 className="mb-0 fw-bold">{lateCount}</h4>
                  </div>
                  <div className="icon-box icon-box-lg icon-box-warning bg-warning-light text-warning" style={{ padding: 12, borderRadius: 8 }}><i className="ti ti-clock-exclamation" style={{ fontSize: "1.4rem" }}></i></div>
                </div>
              </div>
            </div>
          </div>
          <div className="col-xl-3 col-md-6 mb-3 mb-xl-0">
            <div className="card border-0 shadow-sm h-100 bg-white" style={{ borderRadius: 10 }}>
              <div className="card-body">
                <div className="d-flex align-items-center justify-content-between">
                  <div>
                    <p className="text-muted fs-12 fw-medium mb-1">Absent</p>
                    <h4 className="mb-0 fw-bold">{absentCount}</h4>
                  </div>
                  <div className="icon-box icon-box-lg icon-box-danger bg-danger-light text-danger" style={{ padding: 12, borderRadius: 8 }}><i className="ti ti-x" style={{ fontSize: "1.4rem" }}></i></div>
                </div>
              </div>
            </div>
          </div>
          <div className="col-xl-3 col-md-6 mb-3 mb-xl-0">
            <div className="card border-0 shadow-sm h-100 bg-white" style={{ borderRadius: 10 }}>
              <div className="card-body">
                <div className="d-flex align-items-center justify-content-between">
                  <div>
                    <p className="text-muted fs-12 fw-medium mb-1">Total Records</p>
                    <h4 className="mb-0 fw-bold">{records.length}</h4>
                  </div>
                  <div className="icon-box icon-box-lg icon-box-info bg-info-light text-info" style={{ padding: 12, borderRadius: 8 }}><i className="ti ti-database" style={{ fontSize: "1.4rem" }}></i></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Date Filter Card styled nicely */}
        <div className="card border-0 shadow-sm mb-4 bg-white" style={{ borderRadius: 10 }}>
          <div className="card-body">
            <div className="row g-3 align-items-end">
              <div className="col-lg-4">
                <label className="form-label fw-semibold text-secondary">From Date</label>
                <input type="date" className="form-control" style={{ borderRadius: 8 }} value={fromDate} onChange={(e) => setFromDate(e.target.value)} />
              </div>
              <div className="col-lg-4">
                <label className="form-label fw-semibold text-secondary">To Date</label>
                <input type="date" className="form-control" style={{ borderRadius: 8 }} value={toDate} onChange={(e) => setToDate(e.target.value)} />
              </div>
              <div className="col-lg-4">
                <button className="btn btn-primary w-100 d-flex align-items-center justify-content-center gap-2" style={{ height: 38, borderRadius: 8 }} onClick={loadData} disabled={loading}>
                  {loading ? <span className="spinner-border spinner-border-sm"></span> : <i className="ti ti-search"></i>}
                  Load Records
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Main List Table Card */}
        <div className="card border-0 shadow-sm bg-white" style={{ borderRadius: 12, overflow: "hidden" }}>
          {/* Table Controls Bar */}
          <div className="p-3 border-bottom d-flex flex-wrap align-items-center justify-content-between gap-3 bg-light">
            <div className="d-flex align-items-center gap-2 flex-grow-1" style={{ maxWidth: 350 }}>
              <div className="input-group">
                <span className="input-group-text bg-white border-end-0" style={{ borderRadius: "8px 0 0 8px" }}><i className="ti ti-search text-muted" /></span>
                <input
                  type="text"
                  className="form-control border-start-0"
                  style={{ borderRadius: "0 8px 8px 0", height: 38 }}
                  placeholder="Search employee or role..."
                  value={searchQuery}
                  onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }}
                />
              </div>
            </div>

            <div className="d-flex align-items-center gap-2">
              <div className="dropdown">
                <button
                  className="btn btn-white border d-flex align-items-center gap-2 dropdown-toggle"
                  type="button"
                  id="exportDropdown"
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                  style={{ height: 38, borderRadius: 8, fontSize: "0.85rem" }}
                >
                  <i className="ti ti-download" /> Export
                </button>
                <ul className="dropdown-menu shadow border-0" aria-labelledby="exportDropdown">
                  <li><button className="dropdown-item" onClick={exportExcel}>Excel</button></li>
                  <li><button className="dropdown-item" onClick={exportCsv}>CSV</button></li>
                  <li><button className="dropdown-item" onClick={exportPdf}>PDF</button></li>
                </ul>
              </div>
            </div>
          </div>

          <div className="table-responsive">
            {loading ? (
              <div className="text-center py-5"><div className="spinner-border text-primary" role="status"><span className="visually-hidden">Loading...</span></div></div>
            ) : (
              <table className="table table-hover align-middle mb-0">
                <thead className="table-light">
                  <tr>
                    <th style={{ width: 40 }}>
                      <input
                        type="checkbox"
                        className="form-check-input"
                        checked={pagedRecords.length > 0 && pagedRecords.every(r => selectedIds.has(r.id))}
                        onChange={(e) => handleSelectAll(e.target.checked)}
                      />
                    </th>
                    <th>Employee</th>
                    <th>Date</th>
                    <th>Check In Location</th>
                    <th>Check Out Location</th>
                    <th>Check In</th>
                    <th>Check Out</th>
                    <th>Work Time</th>
                    <th>Status</th>
                    <th>Late?</th>
                    <th>Overtime</th>
                    <th>Checkout Status</th>
                    <th style={{ width: 80 }} className="text-end">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {pagedRecords.length === 0 ? (
                    <tr><td colSpan="13" className="text-center text-muted py-4">No records found</td></tr>
                  ) : (
                    pagedRecords.map((r) => (
                      <tr key={r.id}>
                        <td>
                          <input
                            type="checkbox"
                            className="form-check-input"
                            checked={selectedIds.has(r.id)}
                            onChange={(e) => handleSelectRow(r.id, e.target.checked)}
                          />
                        </td>
                        <td>
                          <div>
                            <span className="fw-semibold text-slate-800">{r.userName || `User ${r.userId}`}</span>
                            <br />
                            <small className="text-muted">{r.userRole || '-'}</small>
                          </div>
                        </td>
                        <td>{fmtDate(r.attendanceDate)}</td>
                        <td><small className="text-muted">{r.checkInLocationName || '-'}</small></td>
                        <td><small className="text-muted">{r.checkOutLocationName || '-'}</small></td>
                        <td>{fmtTime(r.checkInTime)}</td>
                        <td>{fmtTime(r.checkOutTime)}</td>
                        <td><span className="badge badge-primary bg-primary-light text-primary">{(r.netWorkMinutes ? fmtDuration(r.netWorkMinutes) : '-')}</span></td>
                        <td>
                          <span className={`badge badge-${
                            r.status === 'CHECKED_IN' ? 'info' :
                            r.status === 'CHECKED_OUT' || r.status === 'AUTO_CHECKOUT' ? 'success' :
                            r.status === 'ON_BREAK' ? 'warning' :
                            r.status === 'ON_LUNCH' ? 'info' : 'secondary'
                          }`}>
                            {r.status?.replace(/_/g, ' ')}
                          </span>
                        </td>
                        <td>
                          {r.isLate ? (
                            <span className="badge badge-danger">Yes (+{r.lateMinutes}m)</span>
                          ) : (
                            <span className="badge badge-success">No</span>
                          )}
                        </td>
                        <td>
                          {r.overtimeMinutes > 0 ? (
                            <span className="badge badge-warning">{fmtDuration(r.overtimeMinutes)}</span>
                          ) : '-'}
                        </td>
                        <td>
                          {r.isMissedCheckout && r.status === 'AUTO_CHECKOUT' ? (
                            <span className="badge badge-warning">Auto Checkout</span>
                          ) : r.isMissedCheckout && r.status !== 'CHECKED_OUT' && r.status !== 'AUTO_CHECKOUT' ? (
                            <span className="badge badge-danger">Missed Checkout</span>
                          ) : '-'}
                        </td>
                        <td className="text-end">
                          <div className="dropdown">
                            <button className="btn btn-light btn-sm btn-icon" data-bs-toggle="dropdown" aria-expanded="false">
                              <i className="ti ti-dots-vertical" />
                            </button>
                            <ul className="dropdown-menu dropdown-menu-end shadow border-0">
                              <li>
                                <button className="dropdown-item" onClick={() => {
                                  setSelectedIds(new Set([r.id]));
                                  exportPdf();
                                }}>
                                  Export Row PDF
                                </button>
                              </li>
                            </ul>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            )}
          </div>

          {/* Custom Pagination Footer */}
          {!loading && records.length > 0 && (
            <div className="p-3 border-top d-flex flex-wrap align-items-center justify-content-between gap-3 bg-light">
              <div className="text-muted small">
                Showing {totalRows > 0 ? pageOffset + 1 : 0} to {Math.min(pageOffset + pageSize, totalRows)} of {totalRows} entries
              </div>
              <div className="d-flex align-items-center gap-2">
                <button
                  type="button"
                  className="btn-pagination-arrow btn btn-sm btn-light border-0 d-flex align-items-center justify-content-center"
                  style={{ width: 32, height: 32, borderRadius: 6 }}
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={clampedPage === 1}
                >
                  <i className="ti ti-chevron-left" />
                </button>
                {(() => {
                  const buttons = [];
                  for (let i = 1; i <= pageCount; i++) {
                    if (i === 1 || i === pageCount || (i >= clampedPage - 2 && i <= clampedPage + 2)) {
                      buttons.push(
                        <button
                          key={i}
                          className={`btn-pagination-num btn btn-sm border-0 ${clampedPage === i ? 'btn-primary text-white' : 'btn-light'}`}
                          style={{ width: 32, height: 32, borderRadius: 6, fontWeight: "500", backgroundColor: clampedPage === i ? "#3b82f6" : undefined }}
                          onClick={() => setPage(i)}
                        >
                          {i}
                        </button>
                      );
                    } else if (i === clampedPage - 3 || i === clampedPage + 3) {
                      buttons.push(<span key={`dots-${i}`} className="px-1 text-muted">...</span>);
                    }
                  }
                  return buttons;
                })()}
                <button
                  type="button"
                  className="btn-pagination-arrow btn btn-sm btn-light border-0 d-flex align-items-center justify-content-center"
                  style={{ width: 32, height: 32, borderRadius: 6 }}
                  onClick={() => setPage(p => Math.min(pageCount, p + 1))}
                  disabled={clampedPage === pageCount}
                >
                  <i className="ti ti-chevron-right" />
                </button>
                <PageSizeSelector
                  pageSize={pageSize}
                  setPageSize={setPageSize}
                  setPage={setPage}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Floating Dark Bottom Actions Bar */}
      {selectedIds.size > 0 && createPortal(
        <div className="floating-bulk-bar" style={{
          position: "fixed",
          bottom: 24,
          left: "50%",
          transform: "translateX(-50%)",
          backgroundColor: "#0f172a",
          color: "#fff",
          padding: "12px 24px",
          borderRadius: 12,
          display: "flex",
          alignItems: "center",
          gap: 16,
          zIndex: 9999,
          boxShadow: "0 10px 25px rgba(0,0,0,0.3)"
        }}>
          <span className="small">{selectedIds.size} row(s) selected</span>
          <button className="btn btn-sm btn-outline-light" onClick={() => setSelectedIds(new Set())}>Clear</button>
          <button className="btn btn-sm btn-primary" onClick={exportPdf}>Export Selected PDF</button>
        </div>,
        document.body
      )}
    </>
  );
};

export default AttendanceAdminPage;
