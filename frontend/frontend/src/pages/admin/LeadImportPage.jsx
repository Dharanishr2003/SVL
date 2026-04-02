import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getImportableEmployees, bulkCreateLeads } from '../../api/leadsApi';

const QUICK_SELECT_OPTIONS = [
  { label: 'First 10', value: 10 },
  { label: 'First 25', value: 25 },
  { label: 'First 50', value: 50 },
  { label: 'First 100', value: 100 },
  { label: 'All', value: Infinity },
];

function parseCSV(text) {
  const lines = text.split(/\r?\n/).filter((l) => l.trim());
  if (lines.length < 2) return [];
  return lines.slice(1).map((line, idx) => {
    const cols = line.split(',').map((c) => c.trim());
    return {
      _rowIndex: idx,
      name: cols[0] || '',
      mobile: cols[1] || '',
      primarySource: cols[2] || '',
      _error: !cols[0] || !cols[1] || !cols[2] ? 'Missing required field(s)' : null,
    };
  });
}

function downloadSampleCSV() {
  const csv = 'name,mobile,primarySource\nJohn Doe,9876543210,Facebook\nJane Smith,9123456789,Google';
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'leads-sample.csv';
  a.click();
  URL.revokeObjectURL(url);
}

export default function LeadImportPage() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [rows, setRows] = useState([]);
  const [checkedIndexes, setCheckedIndexes] = useState(new Set());
  const [employees, setEmployees] = useState([]);
  const [selectedEmployeeIds, setSelectedEmployeeIds] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    getImportableEmployees().then(setEmployees).catch(() => setEmployees([]));
  }, []);

  function handleFileChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const parsed = parseCSV(ev.target.result || '');
      setRows(parsed);
      setCheckedIndexes(new Set());
      setSubmitError('');
      setSuccessMsg('');
    };
    reader.readAsText(file);
  }

  function handleQuickSelect(value) {
    const validRows = rows.filter((r) => !r._error);
    const limit = value === Infinity ? validRows.length : value;
    setCheckedIndexes(new Set(validRows.slice(0, limit).map((r) => r._rowIndex)));
  }

  function toggleRow(rowIndex) {
    setCheckedIndexes((prev) => {
      const next = new Set(prev);
      if (next.has(rowIndex)) next.delete(rowIndex);
      else next.add(rowIndex);
      return next;
    });
  }

  function toggleEmployee(id) {
    setSelectedEmployeeIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }

  async function handleSubmit() {
    setSubmitError('');
    setSuccessMsg('');
    const selectedRows = rows.filter((r) => checkedIndexes.has(r._rowIndex) && !r._error);
    if (selectedRows.length === 0) { setSubmitError('Select at least one valid row.'); return; }
    if (selectedEmployeeIds.length === 0) { setSubmitError('Select at least one employee to assign leads to.'); return; }
    const leads = selectedRows.map((row, i) => ({
      name: row.name,
      mobile: row.mobile,
      primarySource: row.primarySource,
      assignedUserId: selectedEmployeeIds[i % selectedEmployeeIds.length],
    }));
    setSubmitting(true);
    try {
      const result = await bulkCreateLeads(leads);
      setSuccessMsg(result.created + ' leads imported successfully.');
      setTimeout(() => navigate('/leads'), 1500);
    } catch (err) {
      setSubmitError(err?.response?.data?.error || err?.message || 'Import failed.');
    } finally {
      setSubmitting(false);
    }
  }

  const validRows = rows.filter((r) => !r._error);
  const checkedValidCount = validRows.filter((r) => checkedIndexes.has(r._rowIndex)).length;

  return (
    <div className="page-wrapper content">
        <div className="d-flex align-items-center gap-2 mb-4">
          <button className="btn btn-outline-secondary btn-sm" onClick={() => navigate('/leads')}>
            <i className="ti ti-arrow-left me-1" />
            Back to Leads
          </button>
          <h4 className="mb-0">Import Leads</h4>
        </div>

        <div className="card mb-3">
          <div className="card-body">
            <h6 className="card-title">Step 1 — Download Sample CSV</h6>
            <p className="text-muted mb-2">
              The CSV must have columns: <strong>name</strong>, <strong>mobile</strong>, <strong>primarySource</strong>
            </p>
            <button className="btn btn-outline-primary btn-sm" onClick={downloadSampleCSV}>
              <i className="ti ti-download me-1" />
              Download Sample CSV
            </button>
          </div>
        </div>

        <div className="card mb-3">
          <div className="card-body">
            <h6 className="card-title">Step 2 — Upload CSV</h6>
            <input ref={fileInputRef} type="file" accept=".csv" className="form-control" style={{ maxWidth: 360 }} onChange={handleFileChange} />
          </div>
        </div>

        {rows.length > 0 && (
          <div className="card mb-3">
            <div className="card-body">
              <div className="d-flex align-items-center gap-3 mb-3 flex-wrap">
                <h6 className="card-title mb-0">Preview ({rows.length} rows)</h6>
                <div className="d-flex align-items-center gap-2">
                  <label className="mb-0 text-muted small">Quick Select:</label>
                  <select className="form-select form-select-sm" style={{ width: 'auto' }} defaultValue="" onChange={(e) => { const val = e.target.value; handleQuickSelect(val === 'all' ? Infinity : Number(val)); }}>
                    <option value="" disabled>Choose...</option>
                    {QUICK_SELECT_OPTIONS.map((opt) => (
                      <option key={opt.label} value={opt.value === Infinity ? 'all' : opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>
                <span className="text-muted small">{checkedValidCount} selected</span>
              </div>
              <div className="table-responsive">
                <table className="table table-sm table-bordered table-hover">
                  <thead>
                    <tr>
                      <th style={{ width: 40 }}>#</th>
                      <th style={{ width: 40 }}>
                        <input type="checkbox" checked={validRows.length > 0 && checkedValidCount === validRows.length} onChange={(e) => { if (e.target.checked) { setCheckedIndexes(new Set(validRows.map((r) => r._rowIndex))); } else { setCheckedIndexes(new Set()); } }} />
                      </th>
                      <th>Name</th>
                      <th>Mobile</th>
                      <th>Primary Source</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((row, idx) => (
                      <tr key={row._rowIndex} className={row._error ? 'table-danger' : ''}>
                        <td>{idx + 1}</td>
                        <td>{!row._error && (<input type="checkbox" checked={checkedIndexes.has(row._rowIndex)} onChange={() => toggleRow(row._rowIndex)} />)}</td>
                        <td>{row.name || <span className="text-danger">—</span>}</td>
                        <td>{row.mobile || <span className="text-danger">—</span>}</td>
                        <td>{row.primarySource || <span className="text-danger">—</span>}</td>
                        <td>{row._error ? (<span className="badge bg-danger">{row._error}</span>) : (<span className="badge bg-success">Valid</span>)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {rows.length > 0 && (
          <div className="card mb-3">
            <div className="card-body">
              <h6 className="card-title">Step 3 — Assign to Employee(s)</h6>
              {employees.length === 0 ? (
                <p className="text-muted">No active employees available.</p>
              ) : (
                <div className="d-flex flex-wrap gap-2 mb-3">
                  {employees.map((emp) => (
                    <button key={emp.id} type="button" className={'btn btn-sm ' + (selectedEmployeeIds.includes(emp.id) ? 'btn-primary' : 'btn-outline-secondary')} onClick={() => toggleEmployee(emp.id)}>
                      {emp.username}
                    </button>
                  ))}
                </div>
              )}
              {selectedEmployeeIds.length > 1 && checkedValidCount > 0 && (
                <p className="text-muted small mb-2">{checkedValidCount} leads will be distributed round-robin across {selectedEmployeeIds.length} employees.</p>
              )}
              {submitError && <div className="alert alert-danger py-2">{submitError}</div>}
              {successMsg && <div className="alert alert-success py-2">{successMsg}</div>}
              <button className="btn btn-success" disabled={submitting || checkedValidCount === 0 || selectedEmployeeIds.length === 0} onClick={handleSubmit}>
                {submitting ? 'Importing...' : 'Import ' + checkedValidCount + ' Lead(s)'}
              </button>
            </div>
          </div>
        )}
      </div>
  );
}
