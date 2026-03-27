import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  getChannelPartners,
  createChannelPartner,
  updateChannelPartner,
  deleteChannelPartner,
} from "../../api/channelPartnerApi";
import { extractApiErrorMessage } from "../../utils/errorMessage";
import { useToast } from "../../components/system/ToastProvider";

const EMPTY_FORM = { name: "", email: "", phone: "", company: "" };

function ChannelPartnersPage() {
  const { showSuccess, showError } = useToast();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingRow, setEditingRow] = useState(null);
  const [pendingDelete, setPendingDelete] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      setRows(await getChannelPartners());
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

  const openCreate = () => {
    setForm(EMPTY_FORM);
    setEditingRow(null);
    setShowModal(true);
  };
  const openEdit = (r) => {
    setEditingRow(r);
    setForm({
      name: r.name || "",
      email: r.email || "",
      phone: r.phone || r.mobile || "",
      company: r.company || r.companyName || "",
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.name.trim()) {
      showError("Name is required");
      return;
    }
    setSaving(true);
    try {
      editingRow?.id
        ? await updateChannelPartner(editingRow.id, form)
        : await createChannelPartner(form);
      showSuccess(
        editingRow ? "Channel Partner updated" : "Channel Partner created",
      );
      setShowModal(false);
      setForm(EMPTY_FORM);
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
      await deleteChannelPartner(pendingDelete.id);
      showSuccess("Deleted");
      setPendingDelete(null);
      await load();
    } catch (e) {
      showError(extractApiErrorMessage(e, "Failed to delete"));
    } finally {
      setSaving(false);
    }
  };

  const field = (key, label, type = "text") => (
    <div className="mb-3">
      <label className="form-label">{label}</label>
      <input
        type={type}
        className="form-control"
        value={form[key]}
        onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
        placeholder={label}
      />
    </div>
  );

  return (
    <div className="container-fluid">
      <div className="card">
        <div className="card-header">
          <div className="row align-items-center">
            <div className="col-8">
              <h4 className="f-w-700 mb-0">Channel Partners</h4>
            </div>
            <div className="col-4 text-end">
              <Link className="btn btn-primary" to="/channel-partners/create">
                Create Channel Partner
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-body">
          <h5 className="mb-3">Channel Partners List</h5>
          <div className="table-responsive">
            <table className="table table-striped table-bordered table-hover">
              <thead className="table-dark">
                <tr>
                  <th>#</th>
                  <th>Name</th>
                  <th>Company</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={6}>Loading...</td>
                  </tr>
                ) : ordered.length === 0 ? (
                  <tr>
                    <td colSpan={6}>No channel partners found</td>
                  </tr>
                ) : (
                  ordered.map((r, i) => (
                    <tr key={r.id}>
                      <td>{i + 1}</td>
                      <td>{r.name || "-"}</td>
                      <td>{r.company || r.companyName || "-"}</td>
                      <td>{r.email || "-"}</td>
                      <td>{r.phone || r.mobile || "-"}</td>
                      <td>
                        <Link
                          className="btn btn-sm btn-outline-primary me-2"
                          to={`/channel-partners/${r.id}`}
                        >
                          Edit
                        </Link>
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
                    {editingRow ? "Edit" : "Add"} Channel Partner
                  </h5>
                  <button
                    className="btn-close"
                    onClick={() => setShowModal(false)}
                  />
                </div>
                <div className="modal-body">
                  {field("name", "Name *")}
                  {field("company", "Company")}
                  {field("email", "Email", "email")}
                  {field("phone", "Phone")}
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
                  <h5 className="modal-title">Delete Channel Partner</h5>
                  <button
                    className="btn-close"
                    onClick={() => setPendingDelete(null)}
                  />
                </div>
                <div className="modal-body">
                  <p>
                    Delete <strong>{pendingDelete.name}</strong>?
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

export default ChannelPartnersPage;

