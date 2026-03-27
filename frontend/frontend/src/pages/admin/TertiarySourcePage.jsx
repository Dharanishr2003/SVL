import { useEffect, useMemo, useState } from "react";
import {
  getTertiarySources,
  createTertiarySource,
  updateTertiarySource,
  deleteTertiarySource,
} from "../../api/tertiarySourceApi";
import { extractApiErrorMessage } from "../../utils/errorMessage";
import { useToast } from "../../components/system/ToastProvider";

function TertiarySourcePage() {
  const { showSuccess, showError } = useToast();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingRow, setEditingRow] = useState(null);
  const [pendingDelete, setPendingDelete] = useState(null);
  const [formName, setFormName] = useState("");
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      setRows(await getTertiarySources());
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
  const getName = (r) => r.name || r.sourceName || r.tertiarySource || "-";

  const handleSave = async () => {
    if (!formName.trim()) {
      showError("Name is required");
      return;
    }
    setSaving(true);
    try {
      editingRow?.id
        ? await updateTertiarySource(editingRow.id, formName.trim())
        : await createTertiarySource(formName.trim());
      showSuccess(editingRow ? "Updated" : "Created");
      setShowModal(false);
      setFormName("");
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
      await deleteTertiarySource(pendingDelete.id);
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
              <h4 className="f-w-700 mb-0">Tertiary Lead Source</h4>
            </div>
            <div className="col-4 text-end">
              <button
                className="btn btn-primary"
                onClick={() => {
                  setFormName("");
                  setEditingRow(null);
                  setShowModal(true);
                  setError("");
                }}
              >
                + Add
              </button>
            </div>
          </div>
        </div>
      </div>
      <div className="card">
        <div className="card-body">
          <h5 className="mb-3">Tertiary Source List</h5>

          <div className="table-responsive">
            <table className="table table-striped table-bordered table-hover">
              <thead className="table-dark">
                <tr>
                  <th>#</th>
                  <th>Source Name</th>
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
                    <td colSpan={3}>No records found</td>
                  </tr>
                ) : (
                  ordered.map((r, i) => (
                    <tr key={r.id}>
                      <td>{i + 1}</td>
                      <td>{getName(r)}</td>
                      <td>
                        <button
                          className="btn btn-sm btn-outline-primary me-2"
                          onClick={() => {
                            setEditingRow(r);
                            setFormName(getName(r) === "-" ? "" : getName(r));
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
                    {editingRow ? "Edit" : "Add"} Tertiary Source
                  </h5>
                  <button
                    className="btn-close"
                    onClick={() => setShowModal(false)}
                  />
                </div>
                <div className="modal-body">
                  <label className="form-label">Name</label>
                  <input
                    className="form-control"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="Source name"
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
                  <h5 className="modal-title">Delete</h5>
                  <button
                    className="btn-close"
                    onClick={() => setPendingDelete(null)}
                  />
                </div>
                <div className="modal-body">
                  <p>
                    Delete <strong>{getName(pendingDelete)}</strong>?
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
export default TertiarySourcePage;
