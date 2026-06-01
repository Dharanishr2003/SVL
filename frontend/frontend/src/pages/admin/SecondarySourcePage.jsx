import { useEffect, useMemo, useState } from "react";
import {
  getSecondarySources,
  createSecondarySource,
  updateSecondarySource,
  deleteSecondarySource,
} from "../../api/secondarySourceApi";
import { getPrimarySources } from "../../api/primarySourceApi";
import { extractApiErrorMessage } from "../../utils/errorMessage";
import { useToast } from "../../components/system/ToastProvider";

function SecondarySourcePage() {
  const { showSuccess, showError } = useToast();
  const [rows, setRows] = useState([]);
  const [primaryRows, setPrimaryRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingRow, setEditingRow] = useState(null);
  const [pendingDelete, setPendingDelete] = useState(null);
  const [formName, setFormName] = useState("");
  const [formPrimarySourceId, setFormPrimarySourceId] = useState("");
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const [secondaryList, primaryList] = await Promise.all([
        getSecondarySources(),
        getPrimarySources(),
      ]);
      setRows(Array.isArray(secondaryList) ? secondaryList : []);
      setPrimaryRows(Array.isArray(primaryList) ? primaryList : []);
    } catch (e) {
      showError(extractApiErrorMessage(e, "Failed to load"));
      setRows([]);
      setPrimaryRows([]);
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
  const primaryNameMap = useMemo(() => {
    const map = new Map();
    (Array.isArray(primaryRows) ? primaryRows : []).forEach((row) => {
      map.set(String(row.id), row.primarySource || row.name || row.sourceName || "-");
    });
    return map;
  }, [primaryRows]);
  const getName = (r) => r.name || r.sourceName || r.secondarySource || "-";
  const getPrimaryName = (r) => {
    if (!r) return "-";
    if (r.primarySource) return r.primarySource;
    if (r.primarySourceId != null && primaryNameMap.has(String(r.primarySourceId))) {
      return primaryNameMap.get(String(r.primarySourceId));
    }
    return "-";
  };

  const handleSave = async () => {
    if (!formName.trim()) {
      showError("Name is required");
      return;
    }
    if (!String(formPrimarySourceId || "").trim()) {
      showError("Primary source is required");
      return;
    }
    setSaving(true);
    try {
      const payload = {
        secondarySource: formName.trim(),
        primarySourceId: Number(formPrimarySourceId),
      };
      editingRow?.id
        ? await updateSecondarySource(editingRow.id, payload)
        : await createSecondarySource(payload);
      showSuccess(editingRow ? "Updated" : "Created");
      setShowModal(false);
      setFormName("");
      setFormPrimarySourceId("");
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
      await deleteSecondarySource(pendingDelete.id);
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
              <h4 className="f-w-700 mb-0">Secondary Lead Source</h4>
            </div>
            <div className="col-4 text-end">
              <button
                className="btn btn-primary"
                onClick={() => {
                  setFormName("");
                  setFormPrimarySourceId("");
                  setEditingRow(null);
                  setShowModal(true);
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
          <h5 className="mb-3">Secondary Source List</h5>

          <div className="table-responsive">
            <table className="table table-striped table-bordered table-hover">
              <thead className="table-dark">
                <tr>
                  <th>#</th>
                  <th>Source Name</th>
                  <th>Primary Source</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={4}>Loading...</td>
                  </tr>
                ) : ordered.length === 0 ? (
                  <tr>
                    <td colSpan={4}>No records found</td>
                  </tr>
                ) : (
                  ordered.map((r, i) => (
                    <tr key={r.id}>
                      <td>{i + 1}</td>
                      <td>{getName(r)}</td>
                      <td>{getPrimaryName(r)}</td>
                      <td>
                        <button
                          className="btn btn-sm btn-outline-primary me-2"
                          onClick={() => {
                            setEditingRow(r);
                            setFormName(getName(r) === "-" ? "" : getName(r));
                            setFormPrimarySourceId(r.primarySourceId ? String(r.primarySourceId) : "");
                            setShowModal(true);
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
                    {editingRow ? "Edit" : "Add"} Secondary Source
                  </h5>
                  <button
                    className="btn-close"
                    onClick={() => {
                      setShowModal(false);
                      setFormName("");
                      setFormPrimarySourceId("");
                      setEditingRow(null);
                    }}
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
                  <label className="form-label mt-3">Primary Source</label>
                  <select
                    className="form-select"
                    value={formPrimarySourceId}
                    onChange={(e) => setFormPrimarySourceId(e.target.value)}
                  >
                    <option value="">Select primary source</option>
                    {(Array.isArray(primaryRows) ? primaryRows : []).map((row) => (
                      <option key={row.id} value={row.id}>
                        {row.primarySource || row.name || row.sourceName}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="modal-footer">
                  <button
                    className="btn btn-light"
                    onClick={() => {
                      setShowModal(false);
                      setFormName("");
                      setFormPrimarySourceId("");
                      setEditingRow(null);
                    }}
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

export default SecondarySourcePage;
