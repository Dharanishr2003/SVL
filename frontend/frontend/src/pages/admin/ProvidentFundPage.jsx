import React, { useState, useMemo, useEffect } from "react";
import { Link } from "react-router-dom";
import { createPortal } from "react-dom";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import PageSizeSelector from "../../components/admin/PageSizeSelector";

const INITIAL_PROVIDENT_FUNDS = [
  { id: 1, name: "Anthony Lewis", designation: "Finance", type: "Employee Provident Fund", employeeShare: "2%", orgShare: "2%", status: "Approved", avatar: "/assets/img/users/user-32.jpg" },
  { id: 2, name: "Brian Villalobos", designation: "Developer", type: "Employee Provident Fund", employeeShare: "2%", orgShare: "2%", status: "Pending", avatar: "/assets/img/users/user-09.jpg" },
  { id: 3, name: "Harvey Smith", designation: "Developer", type: "Voluntary Provident Fund", employeeShare: "5%", orgShare: "2%", status: "Approved", avatar: "/assets/img/users/user-01.jpg" },
  { id: 4, name: "Stephan Peralt", designation: "Executive Officer", type: "Voluntary Provident Fund", employeeShare: "3%", orgShare: "2%", status: "Pending", avatar: "/assets/img/users/user-33.jpg" },
  { id: 5, name: "Doglas Martini", designation: "Manager", type: "Employee Provident Fund", employeeShare: "2%", orgShare: "2%", status: "Approved", avatar: "/assets/img/users/user-34.jpg" },
  { id: 6, name: "Linda Ray", designation: "Finance", type: "Employee Provident Fund", employeeShare: "2%", orgShare: "2%", status: "Pending", avatar: "/assets/img/users/user-02.jpg" },
  { id: 7, name: "Elliot Murray", designation: "Developer", type: "Voluntary Provident Fund", employeeShare: "6%", orgShare: "2%", status: "Approved", avatar: "/assets/img/users/user-35.jpg" },
  { id: 8, name: "Rebecca Smith", designation: "Executive", type: "Voluntary Provident Fund", employeeShare: "4%", orgShare: "2%", status: "Pending", avatar: "/assets/img/users/user-36.jpg" },
  { id: 9, name: "Connie Waters", designation: "Developer", type: "Employee Provident Fund", employeeShare: "2%", orgShare: "2%", status: "Approved", avatar: "/assets/img/users/user-37.jpg" },
  { id: 10, name: "Lori Broaddus", designation: "Finance", type: "Voluntary Provident Fund", employeeShare: "7%", orgShare: "2%", status: "Pending", avatar: "/assets/img/users/user-38.jpg" }
];

const ProvidentFundPage = () => {
  const [funds, setFunds] = useState(INITIAL_PROVIDENT_FUNDS);
  const [search, setSearch] = useState("");
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Targets
  const [editTarget, setEditTarget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  // Kebab actions
  const [activeActionsRow, setActiveActionsRow] = useState(null);
  const [actionsMenuPos, setActionsMenuPos] = useState({ top: 0, left: 0 });

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

  const filteredRows = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return funds;
    return funds.filter(
      (r) =>
        r.name.toLowerCase().includes(q) ||
        r.designation.toLowerCase().includes(q) ||
        r.type.toLowerCase().includes(q)
    );
  }, [funds, search]);

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
  }, [clampedPage, page]);

  const toggleSelectAll = () => {
    const pageIds = pagedRows.map((r) => r.id);
    const allSelected = pageIds.every((id) => selectedIds.has(id));
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (allSelected) {
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

  const exportCsv = () => {
    const targetRows = selectedIds.size > 0
      ? funds.filter((r) => selectedIds.has(r.id))
      : filteredRows;
    const headers = ["Employee Name", "Designation", "Provident Fund Type", "Employee Share", "Organization Share", "Status"];
    const body = targetRows.map((r) => [r.name, r.designation, r.type, r.employeeShare, r.orgShare, r.status]);
    const csvContent = [headers, ...body]
      .map((line) => line.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","))
      .join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `provident_funds_${Date.now()}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const exportExcel = () => {
    exportCsv();
  };

  const exportPdf = () => {
    const targetRows = selectedIds.size > 0
      ? funds.filter((r) => selectedIds.has(r.id))
      : filteredRows;
    const doc = new jsPDF();
    doc.text("Provident Funds List", 14, 15);
    const headers = [["Employee Name", "Designation", "Type", "Emp Share", "Org Share", "Status"]];
    const body = targetRows.map((r) => [r.name, r.designation, r.type, r.employeeShare, r.orgShare, r.status]);
    autoTable(doc, {
      head: headers,
      body: body,
      startY: 20,
    });
    doc.save(`provident_funds_${Date.now()}.pdf`);
  };

  const handleDelete = () => {
    if (deleteTarget) {
      setFunds((prev) => prev.filter((r) => r.id !== deleteTarget.id));
      setSelectedIds((prev) => {
        const next = new Set(prev);
        next.delete(deleteTarget.id);
        return next;
      });
      setShowDeleteModal(false);
      setDeleteTarget(null);
    }
  };

  const handleBulkDelete = () => {
    setFunds((prev) => prev.filter((r) => !selectedIds.has(r.id)));
    setSelectedIds(new Set());
  };

  return (
    <>
      <div className="content">
        {/* Custom White Header Card */}
        <div className="card border-0 shadow-sm p-4 mb-4 bg-white" style={{ borderRadius: 12 }}>
          <div className="d-flex align-items-center justify-content-between flex-wrap gap-3">
            <div>
              <h2 className="mb-1" style={{ fontSize: "1.4rem", fontWeight: "700", color: "#0f172a" }}>Provident Fund</h2>
              <nav className="mb-0">
                <ol className="breadcrumb mb-0" style={{ fontSize: "0.9rem" }}>
                  <li className="breadcrumb-item">
                    <Link to="/dashboard" style={{ color: "#64748b", textDecoration: "none" }}>
                      <i className="ti ti-smart-home"></i>
                    </Link>
                  </li>
                  <li className="breadcrumb-item" style={{ color: "#64748b" }}>HR</li>
                  <li className="breadcrumb-item active" style={{ color: "#0f172a", fontWeight: "500" }}>Provident Fund</li>
                </ol>
              </nav>
            </div>
            
            <div className="d-flex align-items-center gap-2">
              <button
                type="button"
                className="btn btn-primary d-flex align-items-center gap-2"
                onClick={() => setShowAddModal(true)}
                style={{ backgroundColor: "#3b82f6", borderColor: "#3b82f6", fontWeight: "600", padding: "10px 20px", borderRadius: "10px" }}
              >
                <i className="ti ti-plus" style={{ fontSize: "1.1rem" }}></i>
                Add Provident Fund
              </button>
            </div>
          </div>
        </div>

        {/* Table Card */}
        <div className="card border-0 shadow-sm mb-4" style={{ borderRadius: 12 }}>
          {/* Controls Bar inside the table card */}
          <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 p-3 border-bottom">
            <div className="position-relative flex-grow-1 flex-md-grow-0" style={{ minWidth: "260px" }}>
              <input
                className="form-control"
                style={{ height: 42, borderRadius: 10, paddingLeft: 38, fontSize: "0.95rem" }}
                value={search}
                placeholder="Search PF..."
                onChange={(e) => setSearch(e.target.value)}
              />
              <i className="ti ti-search position-absolute text-muted" style={{ left: 14, top: "50%", transform: "translateY(-50%)", fontSize: "1.1rem" }} />
            </div>

            <div className="d-flex align-items-center gap-2 flex-wrap">
              <div className="dropdown">
                <button
                  className="btn btn-outline-light dropdown-toggle d-flex align-items-center gap-2"
                  type="button"
                  id="exportDropdown"
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                  style={{ height: 42, padding: "0 18px", borderRadius: 10, fontWeight: "500", fontSize: "0.9rem", color: "#64748b", border: "1px solid #e2e8f0", backgroundColor: "#fff" }}
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

          <div className="card-body p-0">
            <div className="table-responsive">
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
                    <th style={{ width: "50px" }}>#</th>
                    <th>Employee Name</th>
                    <th>Provident Fund Type</th>
                    <th>Employee Share</th>
                    <th>Organization Share</th>
                    <th>Status</th>
                    <th style={{ width: "80px" }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {pagedRows.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="text-center py-4">No data found</td>
                    </tr>
                  ) : (
                    pagedRows.map((row, idx) => (
                      <tr key={row.id}>
                        <td>
                          <input
                            type="checkbox"
                            className="form-check-input"
                            checked={selectedIds.has(row.id)}
                            onChange={() => toggleRowSelection(row.id)}
                          />
                        </td>
                        <td>{pageOffset + idx + 1}</td>
                        <td>
                          <div className="d-flex align-items-center">
                            <span className="avatar avatar-md rounded-circle me-2">
                              <img src={row.avatar} className="img-fluid rounded-circle" alt="img" />
                            </span>
                            <div>
                              <div className="fw-semibold text-dark">{row.name}</div>
                              <span className="text-muted small">{row.designation}</span>
                            </div>
                          </div>
                        </td>
                        <td>{row.type}</td>
                        <td>{row.employeeShare}</td>
                        <td>{row.orgShare}</td>
                        <td>
                          <span className={`badge ${row.status === "Approved" ? "bg-success" : "bg-warning"} text-white`}>
                            {row.status}
                          </span>
                        </td>
                        <td>
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
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination Footer */}
          <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 p-3 border-top bg-white" style={{ borderBottomLeftRadius: 12, borderBottomRightRadius: 12 }}>
            <span className="text-muted small">
              {totalRows === 0
                ? "Showing 0 to 0 of 0 entries"
                : `Showing ${pageOffset + 1} to ${Math.min(pageOffset + pageSize, totalRows)} of ${totalRows} entries`}
            </span>

            <div className="d-flex align-items-center gap-1">
              <button
                type="button"
                className="btn btn-sm btn-light border-0 d-flex align-items-center justify-content-center"
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
                    className={`btn btn-sm border-0 ${clampedPage === pageNum ? "btn-primary active text-white" : "btn-light"}`}
                    style={{ width: 32, height: 32, borderRadius: 6, backgroundColor: clampedPage === pageNum ? "#3b82f6" : undefined }}
                    onClick={() => setPage(pageNum)}
                  >
                    {pageNum}
                  </button>
                );
              })}

              <button
                type="button"
                className="btn btn-sm btn-light border-0 d-flex align-items-center justify-content-center"
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

      {/* Add Modal */}
      {showAddModal && (
        <>
          <div className="modal fade show" style={{ display: "block" }} tabIndex="-1">
            <div className="modal-dialog modal-dialog-centered modal-md">
              <div className="modal-content">
                <div className="modal-header">
                  <h4 className="modal-title">Add Provident Fund</h4>
                  <button type="button" className="btn-close custom-btn-close" onClick={() => setShowAddModal(false)}>
                    <i className="ti ti-x"></i>
                  </button>
                </div>
                <form onSubmit={(e) => {
                  e.preventDefault();
                  const fd = new FormData(e.target);
                  const name = fd.get("employeeName") || "";
                  const type = fd.get("fundType") || "Employee Provident Fund";
                  const empShare = fd.get("empShare") || "0%";
                  const orgShare = fd.get("orgShare") || "0%";
                  if (name) {
                    setFunds((prev) => [...prev, {
                      id: Date.now(),
                      name,
                      designation: "Finance",
                      type,
                      employeeShare: empShare,
                      orgShare,
                      status: "Pending",
                      avatar: "/assets/img/users/user-32.jpg"
                    }]);
                  }
                  setShowAddModal(false);
                }}>
                  <div className="modal-body pb-0">
                    <div className="row">
                      <div className="col-md-6 mb-3">
                        <label className="form-label">Employee Name</label>
                        <select className="form-select" name="employeeName">
                          <option>Anthony Lewis</option>
                          <option>Brian Villalobos</option>
                          <option>Harvey Smith</option>
                        </select>
                      </div>
                      <div className="col-md-6 mb-3">
                        <label className="form-label">Provident Fund Type</label>
                        <select className="form-select" name="fundType">
                          <option>Employee Provident Fund</option>
                          <option>Voluntary Provident Fund</option>
                        </select>
                      </div>
                      <div className="col-md-6 mb-3">
                        <label className="form-label">Employee Share(%)</label>
                        <input type="text" className="form-control" name="empShare" defaultValue="2%" />
                      </div>
                      <div className="col-md-6 mb-3">
                        <label className="form-label">Organization Share(%)</label>
                        <input type="text" className="form-control" name="orgShare" defaultValue="2%" />
                      </div>
                    </div>
                  </div>
                  <div className="modal-footer">
                    <button type="button" className="btn btn-white border me-2" onClick={() => setShowAddModal(false)}>Cancel</button>
                    <button type="submit" className="btn btn-primary" style={{ backgroundColor: "#3b82f6", borderColor: "#3b82f6" }}>Add Provident Fund</button>
                  </div>
                </form>
              </div>
            </div>
          </div>
          <div className="modal-backdrop fade show" />
        </>
      )}

      {/* Edit Modal */}
      {showEditModal && editTarget && (
        <>
          <div className="modal fade show" style={{ display: "block" }} tabIndex="-1">
            <div className="modal-dialog modal-dialog-centered modal-md">
              <div className="modal-content">
                <div className="modal-header">
                  <h4 className="modal-title">Edit Provident Fund</h4>
                  <button type="button" className="btn-close custom-btn-close" onClick={() => { setShowEditModal(false); setEditTarget(null); }}>
                    <i className="ti ti-x"></i>
                  </button>
                </div>
                <form onSubmit={(e) => {
                  e.preventDefault();
                  const fd = new FormData(e.target);
                  const type = fd.get("fundType") || editTarget.type;
                  const empShare = fd.get("empShare") || editTarget.employeeShare;
                  const orgShare = fd.get("orgShare") || editTarget.orgShare;
                  setFunds((prev) => prev.map((r) => r.id === editTarget.id ? { ...r, type, employeeShare: empShare, orgShare } : r));
                  setShowEditModal(false);
                  setEditTarget(null);
                }}>
                  <div className="modal-body pb-0">
                    <div className="row">
                      <div className="col-md-6 mb-3">
                        <label className="form-label">Employee Name</label>
                        <input type="text" className="form-control" value={editTarget.name} disabled />
                      </div>
                      <div className="col-md-6 mb-3">
                        <label className="form-label">Provident Fund Type</label>
                        <select className="form-select" name="fundType" defaultValue={editTarget.type}>
                          <option>Employee Provident Fund</option>
                          <option>Voluntary Provident Fund</option>
                        </select>
                      </div>
                      <div className="col-md-6 mb-3">
                        <label className="form-label">Employee Share(%)</label>
                        <input type="text" className="form-control" name="empShare" defaultValue={editTarget.employeeShare} />
                      </div>
                      <div className="col-md-6 mb-3">
                        <label className="form-label">Organization Share(%)</label>
                        <input type="text" className="form-control" name="orgShare" defaultValue={editTarget.orgShare} />
                      </div>
                    </div>
                  </div>
                  <div className="modal-footer">
                    <button type="button" className="btn btn-white border me-2" onClick={() => { setShowEditModal(false); setEditTarget(null); }}>Cancel</button>
                    <button type="submit" className="btn btn-primary" style={{ backgroundColor: "#3b82f6", borderColor: "#3b82f6" }}>Save Changes</button>
                  </div>
                </form>
              </div>
            </div>
          </div>
          <div className="modal-backdrop fade show" />
        </>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && deleteTarget && (
        <>
          <div className="modal fade show" style={{ display: "block" }} tabIndex="-1">
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content">
                <div className="modal-body text-center">
                  <span className="avatar avatar-xl bg-transparent-danger text-danger mb-3">
                    <i className="ti ti-trash-x fs-36"></i>
                  </span>
                  <h4 className="mb-1">Confirm Delete</h4>
                  <p className="mb-3">Are you sure you want to delete provident fund for <strong>{deleteTarget.name}</strong>? This action cannot be undone.</p>
                  <div className="d-flex justify-content-center">
                    <button type="button" className="btn btn-light me-3" onClick={() => { setShowDeleteModal(false); setDeleteTarget(null); }}>Cancel</button>
                    <button type="button" className="btn btn-danger" onClick={handleDelete}>Yes, Delete</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="modal-backdrop fade show" />
        </>
      )}

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
            minWidth: 150
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <button
            className="dropdown-item py-2 px-3 text-start d-flex align-items-center gap-2"
            style={{ fontSize: "0.85rem" }}
            onClick={() => {
              setEditTarget(activeActionsRow);
              setShowEditModal(true);
              setActiveActionsRow(null);
            }}
          >
            <i className="ti ti-edit" style={{ fontSize: "1rem", color: "#64748b" }} /> Edit PF
          </button>
          <button
            className="dropdown-item py-2 px-3 text-start d-flex align-items-center gap-2 text-danger"
            style={{ fontSize: "0.85rem" }}
            onClick={() => {
              setDeleteTarget(activeActionsRow);
              setShowDeleteModal(true);
              setActiveActionsRow(null);
            }}
          >
            <i className="ti ti-trash" style={{ fontSize: "1rem", color: "#ef4444" }} /> Delete PF
          </button>
        </div>,
        document.body
      )}

      {/* Floating Bulk Actions Bar */}
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
            <span className="fw-medium text-white">items selected</span>
          </div>
          <div className="d-flex align-items-center gap-2">
            <button
              className="btn btn-sm btn-danger d-flex align-items-center gap-1"
              style={{ borderRadius: 8, padding: "6px 12px", fontSize: "0.85rem", backgroundColor: "#dc2626", color: "#ffffff", border: "none" }}
              onClick={handleBulkDelete}
            >
              <i className="ti ti-trash" /> Delete
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
    </>
  );
};

export default ProvidentFundPage;
