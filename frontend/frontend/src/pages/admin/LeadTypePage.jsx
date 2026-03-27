import { useEffect, useMemo, useState } from "react";
import {
  getLeadTypes,
  createLeadType,
  updateLeadType,
  deleteLeadType,
} from "../../api/leadTypeApi";
import { extractApiErrorMessage } from "../../utils/errorMessage";
import { useToast } from "../../components/system/ToastProvider";

function LeadTypePage() {
  const { showSuccess, showError } = useToast();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingRow, setEditingRow] = useState(null);
  const [pendingDelete, setPendingDelete] = useState(null);
  const [formValue, setFormValue] = useState("");
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      setRows(await getLeadTypes());
    } catch (e) {
      showError(extractApiErrorMessage(e, "Failed to load"));
      setRows([]);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    load();
  }, []);

  const ordered = useMemo(
    () => [...rows].sort((a, b) => (b.id || 0) - (a.id || 0)),
    [rows],
  );
  const getLabel = (r) => r.leadType || r.name || r.type || "-";

  const handleSave = async () => {
    if (!formValue.trim()) {
      showError("Type name is required");
      return;
    }
    setSaving(true);
    try {
      editingRow?.id
        ? await updateLeadType(editingRow.id, formValue.trim())
        : await createLeadType(formValue.trim());
      showSuccess(editingRow ? "Updated" : "Created");
      setShowModal(false);
      setFormValue("");
      setEditingRow(null);
      await load();
    } catch (e) {
      showError(extractApiErrorMessage(e, "Failed to save"));
    } finally {
      setSaving(false);
    }
  };
  const handleDelete = async () => {
    setSaving(true);
    try {
      await deleteLeadType(pendingDelete.id);
      showSuccess("Deleted");
      setPendingDelete(null);
      await load();
    } catch (e) {
      showError(extractApiErrorMessage(e, "Failed to delete"));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="container-fluid">

      <div className="card">
        <div className="card-header">
          <div className="row align-items-center">
            <div className="col-8">
              <h4 className="f-w-700 mb-0">Lead Type</h4>
            </div>
            <div className="col-4 text-end">
              <button
                className="btn btn-primary"
                onClick={() => {
                  setFormValue("");
                  setEditingRow(null);
                  setShowModal(true);
                }}
              >
                + Add Lead Type
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-body">
          <h5 className="mb-3">Lead Type List</h5>

          <div className="table-responsive">
            <table className="table table-striped table-bordered table-hover">
              <thead className="table-dark">
                <tr>
                  <th>#</th>
                  <th>Lead Type</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={3}>Loading...</td>
                  </tr>
                ) : ordered.length === 0 ? (
                  <tr>
                    <td colSpan={3}>No lead types found</td>
                  </tr>
                ) : (
                  ordered.map((r, i) => (
                    <tr key={r.id}>
                      <td>{i + 1}</td>
                      <td>{getLabel(r)}</td>
                      <td>
                        <button
                          className="btn btn-sm btn-outline-primary me-2"
                          onClick={() => {
                            setEditingRow(r);
                            setFormValue(
                              getLabel(r) === "-" ? "" : getLabel(r),
                            );
                            setShowModal(true);
                            setError("");
                          }}
                        >
                          Edit
                        </button>
                        <button
                          className="btn btn-sm btn-danger"
                          onClick={() => setPendingDelete(r)}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {showModal && (
        <>
          <div
            className="modal fade show"
            style={{ display: "block" }}
            tabIndex="-1"
          >
            <div className="modal-dialog">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">
                    {editingRow ? "Edit" : "Add"} Lead Type
                  </h5>
                  <button
                    className="btn-close"
                    onClick={() => setShowModal(false)}
                  />
                </div>
                <div className="modal-body">
                  <label className="form-label">Type Name</label>
                  <input
                    className="form-control"
                    value={formValue}
                    onChange={(e) => setFormValue(e.target.value)}
                    placeholder="e.g. Hot, Warm, Cold"
                  />
                </div>
                <div className="modal-footer">
                  <button
                    className="btn btn-light"
                    onClick={() => setShowModal(false)}
                    disabled={saving}
                  >
                    Cancel
                  </button>
                  <button
                    className="btn btn-primary"
                    onClick={handleSave}
                    disabled={saving}
                  >
                    {saving ? "Saving..." : editingRow ? "Update" : "Create"}
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div className="modal-backdrop fade show" />
        </>
      )}

      {pendingDelete && (
        <>
          <div
            className="modal fade show"
            style={{ display: "block" }}
            tabIndex="-1"
          >
            <div className="modal-dialog modal-sm">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">Delete Lead Type</h5>
                  <button
                    className="btn-close"
                    onClick={() => setPendingDelete(null)}
                  />
                </div>
                <div className="modal-body">
                  <p>
                    Delete <strong>{getLabel(pendingDelete)}</strong>?
                  </p>
                </div>
                <div className="modal-footer">
                  <button
                    className="btn btn-light"
                    onClick={() => setPendingDelete(null)}
                    disabled={saving}
                  >
                    Cancel
                  </button>
                  <button
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
    </div>
  );
}
export default LeadTypePage;
