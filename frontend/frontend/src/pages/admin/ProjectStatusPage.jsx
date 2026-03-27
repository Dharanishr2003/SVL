import { useEffect, useMemo, useState } from 'react'
import {
  createProjectStatus,
  deleteProjectStatus,
  getProjectStatuses,
  updateProjectStatus,
} from '../../api/projectStatusApi'
import { extractApiErrorMessage } from '../../utils/errorMessage'
import { useToast } from '../../components/system/ToastProvider'

function formatCreatedAt(value) {
  if (!value) return '-'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return String(value)
  return date.toLocaleString('en-US', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  })
}

function ProjectStatusPage() {
  const { showSuccess, showError } = useToast()
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(false)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingRow, setEditingRow] = useState(null)
  const [pendingDeleteRow, setPendingDeleteRow] = useState(null)
  const [formValue, setFormValue] = useState('')
  const [saving, setSaving] = useState(false)
  const canManageProjectStatus = true

  const loadProjectStatuses = async () => {
    setLoading(true)
    try {
      const data = await getProjectStatuses()
      setRows(data)
    } catch (err) {
      showError(extractApiErrorMessage(err, 'Failed to load project status list'))
      setRows([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadProjectStatuses()
  }, [])

  const orderedRows = useMemo(
    () => [...rows].sort((a, b) => new Date(b?.createdDate || 0).getTime() - new Date(a?.createdDate || 0).getTime()),
    [rows],
  )

  const handleCreateOpen = () => {
    setFormValue('')
    setEditingRow(null)
    setShowCreateModal(true)
  }

  const handleEditOpen = (row) => {
    setEditingRow(row)
    setFormValue(row?.projectStatus || '')
    setShowCreateModal(true)
  }

  const handleSave = async () => {
    const value = String(formValue || '').trim()
    if (!value) {
      showError('Project Status is required')
      return
    }
    setSaving(true)
    try {
      if (editingRow?.id) {
        await updateProjectStatus(editingRow.id, value)
        showSuccess('Project Status updated successfully')
      } else {
        await createProjectStatus(value)
        showSuccess('Project Status created successfully')
      }
      setShowCreateModal(false)
      setEditingRow(null)
      setFormValue('')
      await loadProjectStatuses()
    } catch (err) {
      showError(extractApiErrorMessage(err, 'Failed to save project status'))
    } finally {
      setSaving(false)
    }
  }

  const handleConfirmDelete = async () => {
    if (!pendingDeleteRow?.id) return
    setSaving(true)
    try {
      await deleteProjectStatus(pendingDeleteRow.id)
      showSuccess('Project Status deleted successfully')
      setPendingDeleteRow(null)
      await loadProjectStatuses()
    } catch (err) {
      showError(extractApiErrorMessage(err, 'Failed to delete project status'))
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="container-fluid">
      <div className="card">
        <div className="card-header page-heading">
          <div className="row align-items-center">
            <div className="col-lg-8">
              <h4 className="f-w-700">Project Status</h4>
              <br />
              <nav>
                <ol className="breadcrumb justify-content-sm-start align-items-center mb-0">
                  <li className="breadcrumb-item">
                    <a href="#" onClick={(e) => e.preventDefault()}>
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="feather feather-home">
                        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                        <polyline points="9 22 9 12 15 12 15 22"></polyline>
                      </svg>
                    </a>
                  </li>
                  <li className="breadcrumb-item f-w-400 active">Project Status</li>
                </ol>
              </nav>
            </div>
            <div className="col-lg-4 text-lg-end mt-3 mt-lg-0">
              {canManageProjectStatus ? (
                <button className="btn btn-primary" type="button" onClick={handleCreateOpen}>Create Project Status</button>
              ) : null}
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-body">
          <h3 className="mb-2">Project Status List</h3>
          <p className="text-muted">Create, view and edit Project Status.</p>
          <div className="table-responsive">
            <table className="table table-striped table-bordered table-hover">
              <thead className="table-dark">
                <tr>
                  <th>Status Id</th>
                  <th>Project Status</th>
                  <th>Created Date</th>
                  {canManageProjectStatus ? <th>Actions</th> : null}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={canManageProjectStatus ? 4 : 3}>Loading...</td></tr>
                ) : orderedRows.length === 0 ? (
                  <tr><td colSpan={canManageProjectStatus ? 4 : 3}>No project status found</td></tr>
                ) : orderedRows.map((row) => (
                  <tr key={row.id}>
                    <td>{row.statusId || '-'}</td>
                    <td>{row.projectStatus || '-'}</td>
                    <td>{formatCreatedAt(row.createdDate)}</td>
                    {canManageProjectStatus ? (
                      <td>
                        <button className="btn btn-link p-0 me-3" type="button" title="Edit" onClick={() => handleEditOpen(row)}>
                          <i className="icon-pencil-alt"></i>
                        </button>
                        <button className="btn btn-danger btn-sm" type="button" title="Delete" onClick={() => setPendingDeleteRow(row)}>
                          <i className="fa fa-trash"></i>
                        </button>
                      </td>
                    ) : null}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className={`modal fade ${showCreateModal && canManageProjectStatus ? 'show' : ''}`} style={{ display: showCreateModal && canManageProjectStatus ? 'block' : 'none' }} tabIndex="-1" role="dialog" aria-hidden={!(showCreateModal && canManageProjectStatus)}>
        <div className="modal-dialog" role="document">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">{editingRow ? 'Edit Project Status' : 'Create Project Status'}</h5>
              <button type="button" className="btn-close" aria-label="Close" onClick={() => setShowCreateModal(false)}></button>
            </div>
            <div className="modal-body">
              <label className="mb-2">Project Status :</label>
              <input className="form-control" value={formValue} onChange={(e) => setFormValue(e.target.value)} placeholder="Project Status" />
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-light" onClick={() => setShowCreateModal(false)} disabled={saving}>Cancel</button>
              <button type="button" className="btn btn-primary" onClick={handleSave} disabled={saving}>
                {saving ? 'Saving...' : editingRow ? 'Update Project Status' : 'Create Project Status'}
              </button>
            </div>
          </div>
        </div>
      </div>
      {showCreateModal && canManageProjectStatus ? <div className="modal-backdrop fade show"></div> : null}

      <div className={`modal fade ${pendingDeleteRow && canManageProjectStatus ? 'show' : ''}`} style={{ display: pendingDeleteRow && canManageProjectStatus ? 'block' : 'none' }} tabIndex="-1" role="dialog" aria-hidden={!(pendingDeleteRow && canManageProjectStatus)}>
        <div className="modal-dialog modal-sm" role="document">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Delete Project Status</h5>
              <button type="button" className="btn-close" aria-label="Close" onClick={() => setPendingDeleteRow(null)}></button>
            </div>
            <div className="modal-body">
              <p className="mb-0">Are you sure you want to delete `{pendingDeleteRow?.projectStatus || ''}`?</p>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-light" onClick={() => setPendingDeleteRow(null)} disabled={saving}>Cancel</button>
              <button type="button" className="btn btn-danger" onClick={handleConfirmDelete} disabled={saving}>
                {saving ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      </div>
      {pendingDeleteRow && canManageProjectStatus ? <div className="modal-backdrop fade show"></div> : null}
    </div>
  )
}

export default ProjectStatusPage

