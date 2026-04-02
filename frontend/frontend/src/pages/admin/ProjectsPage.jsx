import { useEffect, useMemo, useState } from "react";
import {
  getProjects,
  createProject,
  updateProject,
  deleteProject,
} from "../../api/projectApi";
import { getProjectStatuses } from "../../api/projectStatusApi";
import { getProjectTypes } from "../../api/projectTypeApi";
import { extractApiErrorMessage } from "../../utils/errorMessage";
import { useToast } from "../../components/system/ToastProvider";

const EMPTY_FORM = {
  name: "",
  description: "",
  status: "",
  type: "",
};

const PROJECT_STATUS_OPTIONS = [
  "Planning",
  "In Progress",
  "On Hold",
  "Completed",
  "Cancelled",
];

const PROJECT_TYPE_OPTIONS = [
  "Internal",
  "Client",
  "Research",
  "Maintenance",
  "Other",
];

export default function ProjectsPage() {
  const { showSuccess, showError } = useToast();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingRow, setEditingRow] = useState(null);
  const [deleteRow, setDeleteRow] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [projectStatusOptions, setProjectStatusOptions] = useState(PROJECT_STATUS_OPTIONS);
  const [projectTypeOptions, setProjectTypeOptions] = useState(PROJECT_TYPE_OPTIONS);

  const loadProjects = async () => {
    setLoading(true);
    try {
      const data = await getProjects();
      setRows(Array.isArray(data) ? data : []);
    } catch (err) {
      showError(extractApiErrorMessage(err, "Failed to load projects"));
      setRows([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProjects();
  }, []);

  useEffect(() => {
    let active = true;
    const loadMetaOptions = async () => {
      try {
        const [statuses, types] = await Promise.all([
          getProjectStatuses(),
          getProjectTypes(),
        ]);
        if (!active) return;
        const statusValues = Array.from(
          new Set(
            (Array.isArray(statuses) ? statuses : [])
              .map((row) => row?.projectStatus || row?.status || row?.name || "")
              .map((val) => String(val).trim())
              .filter(Boolean),
          ),
        );
        const typeValues = Array.from(
          new Set(
            (Array.isArray(types) ? types : [])
              .map((row) => row?.projectType || row?.type || row?.name || "")
              .map((val) => String(val).trim())
              .filter(Boolean),
          ),
        );
        setProjectStatusOptions(statusValues.length ? statusValues : PROJECT_STATUS_OPTIONS);
        setProjectTypeOptions(typeValues.length ? typeValues : PROJECT_TYPE_OPTIONS);
      } catch {
        if (active) {
          setProjectStatusOptions(PROJECT_STATUS_OPTIONS);
          setProjectTypeOptions(PROJECT_TYPE_OPTIONS);
        }
      }
    };
    loadMetaOptions();
    return () => {
      active = false;
    };
  }, []);

  const sortedRows = useMemo(
    () => [...rows].sort((a, b) => (b?.id || 0) - (a?.id || 0)),
    [rows],
  );

  const openCreate = () => {
    setForm(EMPTY_FORM);
    setEditingRow(null);
    setShowModal(true);
  };

  const openEdit = (row) => {
    setEditingRow(row);
    setForm({
      name: row?.name || row?.projectName || "",
      description: row?.description || "",
      status: row?.status || row?.projectStatus || "",
      type: row?.type || row?.projectType || "",
    });
    setShowModal(true);
  };

  const saveProject = async () => {
    if (!form.name.trim()) {
      showError("Project name is required");
      return;
    }
    if (!form.type || !form.type.toString().trim()) {
      showError("Project type is required");
      return;
    }
    if (!form.status || !form.status.toString().trim()) {
      showError("Project status is required");
      return;
    }
    const payload = {
      projectName: form.name.trim(),
      projectType: form.type,
      projectStatus: form.status,
      description: form.description.trim() || null,
    };

    setSaving(true);
    try {
      if (editingRow?.id) {
        await updateProject(editingRow.id, payload);
      } else {
        await createProject(payload);
      }
      showSuccess(editingRow ? "Project updated" : "Project created");
      setShowModal(false);
      setEditingRow(null);
      setForm(EMPTY_FORM);
      await loadProjects();
    } catch (err) {
      showError(extractApiErrorMessage(err, "Failed to save"));
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteRow?.id) return;
    setSaving(true);
    try {
      await deleteProject(deleteRow.id);
      showSuccess("Project deleted");
      setDeleteRow(null);
      await loadProjects();
    } catch (err) {
      showError(extractApiErrorMessage(err, "Failed to delete"));
    } finally {
      setSaving(false);
    }
  };

  const renderInput = (key, label, type = "text") => (
    <div className="mb-3">
      <label className="form-label">{label}</label>
      <input
        type={type}
        className="form-control"
        value={form[key]}
        onChange={(e) =>
          setForm((prev) => ({ ...prev, [key]: e.target.value }))
        }
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
              <h4 className="f-w-700 mb-0">Projects</h4>
            </div>
            <div className="col-4 text-end">
              <button className="btn btn-primary" onClick={openCreate}>
                + Add Project
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-body">
          <h5 className="mb-3">Projects List</h5>
          <div className="table-responsive">
            <table className="table table-striped table-bordered table-hover">
              <thead className="table-dark">
                <tr>
                  <th>#</th>
                  <th>Project Name</th>
                  <th>Type</th>
                  <th>Status</th>
                  <th>Description</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={6}>Loading...</td>
                  </tr>
                ) : sortedRows.length === 0 ? (
                  <tr>
                    <td colSpan={6}>No projects found</td>
                  </tr>
                ) : (
                  sortedRows.map((row, idx) => (
                    <tr key={row.id || idx}>
                      <td>{idx + 1}</td>
                      <td>{row.name || row.projectName || "-"}</td>
                      <td>{row.type || row.projectType || "-"}</td>
                      <td>
                        {row.status || row.projectStatus ? (
                          <span className="badge bg-primary">{row.status || row.projectStatus}</span>
                        ) : (
                          "-"
                        )}
                      </td>
                      <td>{row.description || "-"}</td>
                      <td>
                        <button
                          className="btn btn-sm btn-outline-primary me-2"
                          onClick={() => openEdit(row)}
                        >
                          Edit
                        </button>
                        <button
                          className="btn btn-sm btn-danger"
                          onClick={() => setDeleteRow(row)}
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
          <div className="modal fade show" style={{ display: "block" }} tabIndex="-1">
            <div className="modal-dialog">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">
                    {editingRow ? "Edit" : "Add"} Project
                  </h5>
                  <button className="btn-close" onClick={() => setShowModal(false)} />
                </div>
                <div className="modal-body">
                  {renderInput("name", "Project Name *")}
                  <div className="mb-3">
                    <label className="form-label">Type</label>
                    <select
                      className="form-select"
                      value={form.type}
                      onChange={(e) =>
                        setForm((prev) => ({ ...prev, type: e.target.value }))
                      }
                    >
                      <option value="">Select project type</option>
                      {projectTypeOptions.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Status</label>
                    <select
                      className="form-select"
                      value={form.status}
                      onChange={(e) =>
                        setForm((prev) => ({ ...prev, status: e.target.value }))
                      }
                    >
                      <option value="">Select project status</option>
                      {projectStatusOptions.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Description</label>
                    <textarea
                      className="form-control"
                      rows={3}
                      value={form.description}
                      onChange={(e) =>
                        setForm((prev) => ({
                          ...prev,
                          description: e.target.value,
                        }))
                      }
                      placeholder="Description"
                    />
                  </div>
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
                    onClick={saveProject}
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

      {deleteRow && (
        <>
          <div className="modal fade show" style={{ display: "block" }} tabIndex="-1">
            <div className="modal-dialog modal-sm">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">Delete Project</h5>
                  <button className="btn-close" onClick={() => setDeleteRow(null)} />
                </div>
                <div className="modal-body">
                  <p>
                    Delete <strong>{deleteRow.name || deleteRow.projectName}</strong>?
                  </p>
                </div>
                <div className="modal-footer">
                  <button
                    className="btn btn-light"
                    onClick={() => setDeleteRow(null)}
                    disabled={saving}
                  >
                    Cancel
                  </button>
                  <button
                    className="btn btn-danger"
                    onClick={confirmDelete}
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
