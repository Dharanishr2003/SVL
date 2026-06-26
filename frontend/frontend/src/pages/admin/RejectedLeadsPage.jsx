import { useEffect, useState, useMemo } from "react";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import PageHeader from "../../components/admin/PageHeader";
import PageLoader from "../../components/common/PageLoader";
import { deleteLead, getLeads, updateLeadRowStatus } from "../../api/leadsApi";
import { useAuth } from "../../context/AuthContext";
import { extractApiErrorMessage } from "../../utils/errorMessage";
import { useToast } from "../../components/system/ToastProvider";
import PageSizeSelector from "../../components/admin/PageSizeSelector";
import LeadExportDropdown from "../../components/admin/LeadExportDropdown";

function downloadTextFile(filename, content, mime) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

export default function RejectedLeadsPage() {
  const { user } = useAuth();
  const { showSuccess, showError } = useToast();
  const role = user?.role || "";
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Search & Pagination states
  const [searchText, setSearchText] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  useEffect(() => {
    let active = true;
    const load = async () => {
      setLoading(true);
      try {
        const data = await getLeads({ status: "Rejected" });
        if (active) {
          setRows(Array.isArray(data) ? data : []);
        }
      } catch (e) {
        if (active) {
          showError(extractApiErrorMessage(e, "Failed to load rejected leads"));
        }
      } finally {
        if (active) setLoading(false);
      }
    };
    if (role && role !== "EMPLOYEE") {
      load();
    } else {
      setLoading(false);
    }
    return () => {
      active = false;
    };
  }, [role]);

  // Reset to first page when search changes
  useEffect(() => {
    setPage(1);
  }, [searchText]);

  const filteredRows = useMemo(() => {
    const term = searchText.toLowerCase().trim();
    if (!term) return rows;
    return rows.filter((row) => {
      const id = String(row.leadId || row.enquiryId || row.id || "").toLowerCase();
      const name = String(row.name || "").toLowerCase();
      const mobile = String(row.mobile || "").toLowerCase();
      const email = String(row.email || "").toLowerCase();
      const owner = String(row.owner || row.ownerName || "").toLowerCase();
      return id.includes(term) || name.includes(term) || mobile.includes(term) || email.includes(term) || owner.includes(term);
    });
  }, [rows, searchText]);

  const totalPages = Math.ceil(filteredRows.length / pageSize);
  const pagedRows = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredRows.slice(start, start + pageSize);
  }, [filteredRows, page, pageSize]);

  if (loading) return <PageLoader />;

  if (role === "EMPLOYEE") {
    return (
      <div className="container-fluid">
        <div className="alert alert-danger">You do not have permission to view this page.</div>
      </div>
    );
  }

  const handleDelete = async (row) => {
    if (!row?.id) return;
    const ok = window.confirm("Delete this rejected lead?");
    if (!ok) return;
    setSaving(true);
    try {
      await deleteLead(row.id);
      setRows((prev) => prev.filter((item) => String(item.id) !== String(row.id)));
      showSuccess("Deleted successfully");
    } catch (e) {
      showError(extractApiErrorMessage(e, "Failed to delete lead"));
    } finally {
      setSaving(false);
    }
  };

  const handleConvert = async (row) => {
    if (!row?.id) return;
    const ok = window.confirm("Convert this rejected lead back to New Lead?");
    if (!ok) return;
    setSaving(true);
    try {
      await updateLeadRowStatus(row.id, "New Lead");
      setRows((prev) => prev.filter((item) => String(item.id) !== String(row.id)));
      showSuccess("Converted successfully");
    } catch (e) {
      showError(extractApiErrorMessage(e, "Failed to convert lead"));
    } finally {
      setSaving(false);
    }
  };

  const exportCsv = () => {
    const targetRows = filteredRows;

    const headers = [
      "S.No",
      "Name",
      "Mobile",
      "Email",
      "Status",
      "Owner",
      "Created Date",
    ];
    const body = targetRows.map((row, idx) => [
      idx + 1,
      row.name || "",
      row.mobile || "",
      row.email || "",
      row.status || "Rejected",
      row.owner || row.ownerName || "",
      row.createdAt || "",
    ]);
    const csv = [headers, ...body]
      .map((line) =>
        line
          .map((cell) => `"${String(cell ?? "").replace(/"/g, '""')}"`)
          .join(","),
      )
      .join("\n");
    downloadTextFile(`rejected-leads-${Date.now()}.csv`, csv, "text/csv;charset=utf-8;");
  };

  const exportExcel = () => {
    const targetRows = filteredRows;

    const headers = [
      "S.No",
      "Name",
      "Mobile",
      "Email",
      "Status",
      "Owner",
      "Created Date",
    ];

    const escapeXml = (unsafe) => {
      return String(unsafe ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&apos;");
    };

    const headerHtml = `      <tr>
        ${headers.map((h) => `<th>${escapeXml(h)}</th>`).join("\n        ")}
      </tr>`;

    const rowsHtml = targetRows
      .map(
        (row, idx) => `      <tr>
        <td>${idx + 1}</td>
        <td>${escapeXml(row.name)}</td>
        <td>${escapeXml(row.mobile)}</td>
        <td>${escapeXml(row.email)}</td>
        <td>${escapeXml(row.status || "Rejected")}</td>
        <td>${escapeXml(row.owner || row.ownerName)}</td>
        <td>${escapeXml(row.createdAt)}</td>
      </tr>`,
      )
      .join("\n");

    const template = `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
<head>
<!--[if gte mso 9]>
<xml>
  <x:ExcelWorkbook>
    <x:ExcelWorksheets>
      <x:ExcelWorksheet>
        <x:Name>Rejected Leads</x:Name>
        <x:WorksheetOptions>
          <x:DisplayGridlines/>
        </x:WorksheetOptions>
      </x:ExcelWorksheet>
    </x:ExcelWorksheets>
  </x:ExcelWorkbook>
</xml>
<![endif]-->
<meta http-equiv="content-type" content="text/plain; charset=UTF-8"/>
</head>
<body>
  <table>
    <thead>
${headerHtml}
    </thead>
    <tbody>
${rowsHtml}
    </tbody>
  </table>
</body>
</html>`;

    downloadTextFile(`rejected-leads-${Date.now()}.xls`, template, "application/vnd.ms-excel;charset=utf-8;");
  };

  const exportPdf = () => {
    const targetRows = filteredRows;

    const doc = new jsPDF({ orientation: "landscape", unit: "pt", format: "a4" });
    const title = "Rejected Leads Export";
    const generatedAt = new Date().toLocaleString();
    doc.setFontSize(14);
    doc.text(title, 40, 40);
    doc.setFontSize(10);
    doc.text(`Generated: ${generatedAt}`, 40, 58);

    const headers = [[
      "S.No",
      "Name",
      "Mobile",
      "Email",
      "Status",
      "Owner",
      "Created Date",
    ]];

    const body = targetRows.map((row, idx) => [
      idx + 1,
      row.name || "",
      row.mobile || "",
      row.email || "",
      row.status || "Rejected",
      row.owner || row.ownerName || "",
      row.createdAt || "",
    ]);

    autoTable(doc, {
      head: headers,
      body,
      startY: 72,
      styles: { fontSize: 8, cellPadding: 4 },
      headStyles: { fillColor: [33, 37, 41] },
      margin: { left: 24, right: 24 },
      tableWidth: "auto",
    });

    doc.save(`rejected-leads-${Date.now()}.pdf`);
  };

  return (
    <div className="container-fluid content">
      <div className="card border-0 shadow-sm p-4 mb-4 bg-white" style={{ borderRadius: 12 }}>
        <div className="d-flex align-items-center justify-content-between flex-wrap gap-3">
          <div>
            <h2 className="leads-header-title mb-1" style={{ fontSize: "1.4rem", fontWeight: "700", color: "#0f172a" }}>Rejected Leads</h2>
            <p className="leads-header-subtitle text-muted mb-0" style={{ fontSize: "0.9rem" }}>
              View and manage leads that have been rejected.
            </p>
          </div>
        </div>
      </div>

      <div className="card table-list-card border-0 shadow-sm" style={{ borderRadius: 12 }}>
        <div className="card-body">
          {/* Controls Bar */}
          <div className="leads-controls-bar d-flex flex-wrap align-items-center justify-content-between gap-3 mb-4">
            <div className="d-flex align-items-center gap-2 p-1 border" style={{ borderRadius: 12, backgroundColor: "#f8fafc", width: "100%", maxWidth: 350 }}>
              <i className="ti ti-search text-muted ms-2" style={{ fontSize: "1.1rem" }} />
              <input
                type="text"
                className="form-control border-0 bg-transparent shadow-none"
                placeholder="Search by ID, name, contact, owner..."
                style={{ height: 36, fontSize: "0.9rem" }}
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
              />
            </div>
            <LeadExportDropdown
              exportExcel={exportExcel}
              exportCsv={exportCsv}
              exportPdf={exportPdf}
            />
          </div>

          <div className="table-responsive leads-table-wrap border-0 shadow-sm mb-4" style={{ borderRadius: 12 }}>
            <table className="table table-hover align-middle leads-table mb-0">
              <thead>
                <tr>
                  <th className="text-muted" style={{ fontWeight: "600", fontSize: "0.85rem" }}>S.No</th>
                  <th className="text-muted" style={{ fontWeight: "600", fontSize: "0.85rem" }}>Name</th>
                  <th className="text-muted" style={{ fontWeight: "600", fontSize: "0.85rem" }}>Mobile</th>
                  <th className="text-muted" style={{ fontWeight: "600", fontSize: "0.85rem" }}>Email</th>
                  <th className="text-muted" style={{ fontWeight: "600", fontSize: "0.85rem" }}>Status</th>
                  <th className="text-muted" style={{ fontWeight: "600", fontSize: "0.85rem" }}>Owner</th>
                  <th className="text-muted" style={{ fontWeight: "600", fontSize: "0.85rem" }}>Created</th>
                  <th className="text-muted" style={{ fontWeight: "600", fontSize: "0.85rem" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {pagedRows.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="text-center text-muted py-4">
                      No rejected leads found.
                    </td>
                  </tr>
                ) : (
                  pagedRows.map((row, index) => (
                    <tr key={row.id || row.leadId || row.enquiryId}>
                      <td className="fw-semibold" style={{ color: "#1e293b", fontSize: "0.9rem" }}>{(page - 1) * pageSize + index + 1}</td>
                      <td style={{ fontSize: "0.9rem" }}>
                        <a href={`/leads/${row.id}`} className="link-default fw-semibold" style={{ color: "#3b82f6" }}>
                          {row.name || "-"}
                        </a>
                      </td>
                      <td style={{ fontSize: "0.9rem" }}>{row.mobile || "-"}</td>
                      <td style={{ fontSize: "0.9rem" }}>{row.email || "-"}</td>
                      <td>
                        <span className="badge bg-danger">Rejected</span>
                      </td>
                      <td style={{ fontSize: "0.9rem" }}>{row.owner || row.ownerName || "-"}</td>
                      <td style={{ fontSize: "0.9rem" }}>{row.createdAt || "-"}</td>
                      <td>
                        <div className="d-flex gap-2">
                          <button
                            className="btn btn-sm btn-outline-primary"
                            style={{ borderRadius: 8, fontWeight: "600" }}
                            onClick={() => handleConvert(row)}
                            disabled={saving}
                          >
                            Convert
                          </button>
                          <button
                            className="btn btn-sm btn-outline-danger"
                            style={{ borderRadius: 8, fontWeight: "600" }}
                            onClick={() => handleDelete(row)}
                            disabled={saving}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Footer */}
          {filteredRows.length > 0 && (
            <div className="leads-pagination-footer d-flex flex-wrap align-items-center justify-content-between gap-3 mt-4 pt-3 border-top">
              <span className="entries-info text-muted small">
                Showing {(page - 1) * pageSize + 1} to {Math.min(page * pageSize, filteredRows.length)} of {filteredRows.length} entries
              </span>

              <div className="pagination-numbers-container d-flex align-items-center gap-1">
                <button
                  type="button"
                  className="btn-pagination-arrow btn btn-sm btn-light border-0 d-flex align-items-center justify-content-center"
                  style={{ width: 32, height: 32, borderRadius: 6 }}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page <= 1}
                >
                  <i className="ti ti-chevron-left" />
                </button>

                {(() => {
                  const buttons = [];
                  const maxVisible = 5;
                  let startPage = Math.max(1, page - 2);
                  let endPage = Math.min(totalPages, startPage + maxVisible - 1);
                  if (maxVisible - 1 > endPage - startPage) {
                    startPage = Math.max(1, endPage - maxVisible + 1);
                  }

                  if (startPage > 1) {
                    buttons.push(
                      <button
                        key={1}
                        className={`btn-pagination-num btn btn-sm border-0 ${page === 1 ? 'btn-primary text-white' : 'btn-light'}`}
                        style={{ width: 32, height: 32, borderRadius: 6, fontWeight: "500", backgroundColor: page === 1 ? "#3b82f6" : undefined }}
                        onClick={() => setPage(1)}
                      >
                        1
                      </button>
                    );
                    if (startPage > 2) {
                      buttons.push(<span key="dots-start" className="pagination-dots px-1 text-muted">...</span>);
                    }
                  }

                  for (let i = startPage; endPage >= i; i++) {
                    buttons.push(
                      <button
                        key={i}
                        className={`btn-pagination-num btn btn-sm border-0 ${page === i ? 'btn-primary text-white' : 'btn-light'}`}
                        style={{ width: 32, height: 32, borderRadius: 6, fontWeight: "500", backgroundColor: page === i ? "#3b82f6" : undefined }}
                        onClick={() => setPage(i)}
                      >
                        {i}
                      </button>
                    );
                  }

                  if (totalPages > endPage) {
                    if (totalPages - 1 > endPage) {
                      buttons.push(<span key="dots-end" className="pagination-dots px-1 text-muted">...</span>);
                    }
                    buttons.push(
                      <button
                        key={totalPages}
                        className={`btn-pagination-num btn btn-sm border-0 ${page === totalPages ? 'btn-primary text-white' : 'btn-light'}`}
                        style={{ width: 32, height: 32, borderRadius: 6, fontWeight: "500", backgroundColor: page === totalPages ? "#3b82f6" : undefined }}
                        onClick={() => setPage(totalPages)}
                      >
                        {totalPages}
                      </button>
                    );
                  }

                  return buttons;
                })()}

                <button
                  type="button"
                  className="btn-pagination-arrow btn btn-sm btn-light border-0 d-flex align-items-center justify-content-center"
                  style={{ width: 32, height: 32, borderRadius: 6 }}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page >= totalPages}
                >
                  <i className="ti ti-chevron-right" />
                </button>
              </div>

              <PageSizeSelector
                pageSize={pageSize}
                setPageSize={setPageSize}
                setPage={setPage}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
