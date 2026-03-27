import { useEffect, useState } from "react";
import PageHeader from "../../components/admin/PageHeader";
import PageLoader from "../../components/common/PageLoader";
import { deleteLead, getLeads, updateLeadRowStatus } from "../../api/leadsApi";
import { useAuth } from "../../context/AuthContext";
import { extractApiErrorMessage } from "../../utils/errorMessage";
import { useToast } from "../../components/system/ToastProvider";

export default function RejectedLeadsPage() {
  const { user } = useAuth();
  const { showSuccess, showError } = useToast();
  const role = user?.role || "";
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

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
      const updated = await updateLeadRowStatus(row.id, "New Lead");
      setRows((prev) => prev.filter((item) => String(item.id) !== String(row.id)));
    } catch (e) {
      showError(extractApiErrorMessage(e, "Failed to convert lead"));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="container-fluid">
      <PageHeader
        title="Rejected Leads"
        breadcrumb={[
          { label: "Dashboard", path: "/admin-dashboard" },
          { label: "CRM", path: "" },
          { label: "Rejected Leads", path: "" },
        ]}
      />

      <div className="card">
        <div className="card-body">
          <div className="table-responsive">
            <table className="table table-bordered table-hover align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th>Lead ID</th>
                  <th>Name</th>
                  <th>Mobile</th>
                  <th>Email</th>
                  <th>Status</th>
                  <th>Owner</th>
                  <th>Created</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {rows.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="text-center text-muted">
                      No rejected leads found.
                    </td>
                  </tr>
                ) : (
                  rows.map((row) => (
                    <tr key={row.id || row.leadId || row.enquiryId}>
                      <td>{row.leadId || row.enquiryId || row.id || "-"}</td>
                      <td>
                        <a href={`/leads/${row.id}`} className="link-default">
                          {row.name || "-"}
                        </a>
                      </td>
                      <td>{row.mobile || "-"}</td>
                      <td>{row.email || "-"}</td>
                      <td>
                        <span className="badge bg-danger">Rejected</span>
                      </td>
                      <td>{row.owner || row.ownerName || "-"}</td>
                      <td>{row.createdAt || "-"}</td>
                      <td>
                        <div className="d-flex gap-2">
                          <button
                            className="btn btn-sm btn-outline-primary"
                            onClick={() => handleConvert(row)}
                            disabled={saving}
                          >
                            Convert
                          </button>
                          <button
                            className="btn btn-sm btn-outline-danger"
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
        </div>
      </div>
    </div>
  );
}
