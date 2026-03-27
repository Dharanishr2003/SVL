import { useEffect, useMemo, useState } from 'react'
import {
  createProjectType,
  deleteProjectType,
  getProjectTypes,
  updateProjectType,
} from '../../api/projectTypeApi'
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

function ProjectTypePage() {
  const { showSuccess, showError } = useToast()
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(false)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingRow, setEditingRow] = useState(null)
  const [pendingDeleteRow, setPendingDeleteRow] = useState(null)
  const [formValue, setFormValue] = useState('')
  const [saving, setSaving] = useState(false)
  const canManageProjectType = true

  const loadProjectType = async () => {
    setLoading(true)
    try {
      const data = await getProjectTypes()
      setRows(data)
    } catch (err) {
      showError(extractApiErrorMessage(err, 'Failed to load project type list'))
      setRows([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadProjectType()
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
    setFormValue(row?.projectType || '')
    setShowCreateModal(true)
  }

  const handleSave = async () => {
    const value = String(formValue || '').trim()
    if (!value) {
      showError('Project Type is required')
      return
    }
    setSaving(true)
    try {
      if (editingRow?.id) {
        await updateProjectType(editingRow.id, value)
        showSuccess('Project Type updated successfully')
      } else {
        await createProjectType(value)
        showSuccess('Project Type created successfully')
      }
      setShowCreateModal(false)
      setEditingRow(null)
      setFormValue('')
      await loadProjectType()
    } catch (err) {
      showError(extractApiErrorMessage(err, 'Failed to save project type'))
    } finally {
      setSaving(false)
    }
  }

  const handleConfirmDelete = async () => {
    if (!pendingDeleteRow?.id) return
    setSaving(true)
    try {
      await deleteProjectType(pendingDeleteRow.id)
      showSuccess('Project Type deleted successfully')
      setPendingDeleteRow(null)
      await loadProjectType()
    } catch (err) {
      showError(extractApiErrorMessage(err, 'Failed to delete project type'))
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
              <h4 className="f-w-700">Project Type  </h4>
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
                  <li className="breadcrumb-item f-w-400 active">Project Type</li>
                </ol>
              </nav>
            </div>
            <div className="col-lg-4 text-lg-end mt-3 mt-lg-0">
              {canManageProjectType ? (
                <button className="btn btn-primary" type="button" onClick={handleCreateOpen}>Create Project Type</button>
              ) : null}
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-body">
          <h3 className="mb-2">Project Type List</h3>
          <p className="text-muted">Create, view and edit Project Type. Assign leads to Project Type.</p>
          <div className="table-responsive">
            <table className="table table-striped table-bordered table-hover">
              <thead className="table-dark">
                <tr>
                  <th>Project Id</th>
                  <th>Project Type</th>
                  <th>Created Date</th>
                  {canManageProjectType ? <th>Actions</th> : null}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={canManageProjectType ? 4 : 3}>Loading...</td></tr>
                ) : orderedRows.length === 0 ? (
                  <tr><td colSpan={canManageProjectType ? 4 : 3}>No project type found</td></tr>
                ) : orderedRows.map((row) => (
                  <tr key={row.id}>
                    <td>{row.typeId || '-'}</td>
                    <td>{row.projectType || '-'}</td>
                    <td>{formatCreatedAt(row.createdDate)}</td>
                    {canManageProjectType ? (
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

      <div className={`modal fade ${showCreateModal && canManageProjectType ? 'show' : ''}`} style={{ display: showCreateModal && canManageProjectType ? 'block' : 'none' }} tabIndex="-1" role="dialog" aria-hidden={!(showCreateModal && canManageProjectType)}>
        <div className="modal-dialog" role="document">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">{editingRow ? 'Edit Project Type' : 'Create Project Type'}</h5>
              <button type="button" className="btn-close" aria-label="Close" onClick={() => setShowCreateModal(false)}></button>
            </div>
            <div className="modal-body">
              <label className="mb-2">Project Type :</label>
              <input className="form-control" value={formValue} onChange={(e) => setFormValue(e.target.value)} placeholder="Project Type" />
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-light" onClick={() => setShowCreateModal(false)} disabled={saving}>Cancel</button>
              <button type="button" className="btn btn-primary" onClick={handleSave} disabled={saving}>
                {saving ? 'Saving...' : editingRow ? 'Update Project Type' : 'Create Project Type'}
              </button>
            </div>
          </div>
        </div>
      </div>
      {showCreateModal && canManageProjectType ? <div className="modal-backdrop fade show"></div> : null}

      <div className={`modal fade ${pendingDeleteRow && canManageProjectType ? 'show' : ''}`} style={{ display: pendingDeleteRow && canManageProjectType ? 'block' : 'none' }} tabIndex="-1" role="dialog" aria-hidden={!(pendingDeleteRow && canManageProjectType)}>
        <div className="modal-dialog modal-sm" role="document">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Delete Project Type</h5>
              <button type="button" className="btn-close" aria-label="Close" onClick={() => setPendingDeleteRow(null)}></button>
            </div>
            <div className="modal-body">
              <p className="mb-0">Are you sure you want to delete `{pendingDeleteRow?.projectType || ''}`?</p>
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
      {pendingDeleteRow && canManageProjectType ? <div className="modal-backdrop fade show"></div> : null}
    </div>
  )
}

export default ProjectTypePage

