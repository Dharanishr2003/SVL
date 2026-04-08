import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { bulkCreateLeads, getAssignableLeadGroups } from '../../api/leadsApi';
import { getGroupMembers, getUserGroups } from '../../api/userGroupApi';
import { getLeadFlow } from '../../api/flowApi';
import { CRM_PAGE_OPTIONS } from '../../constants/crmPages';
import { useAuth } from '../../context/AuthContext';
import LeadImportEditModal from '../../components/admin/LeadImportEditModal';
import './LeadImportPage.css';

const QUICK_SELECT_OPTIONS = [
  { label: 'First 10', value: 10 },
  { label: 'First 25', value: 25 },
  { label: 'First 50', value: 50 },
  { label: 'First 100', value: 100 },
  { label: 'All', value: Infinity },
];

const CSV_COLUMNS = [
  'name', 'mobile', 'email', 'primarySource',
  'secondarySource', 'productType', 'variant', 'quantity', 'companyName',
  'streetAddress', 'state', 'district',
];

function parseCSV(text) {
  const lines = text.split(/\r?\n/).filter((l) => l.trim() && !l.trim().startsWith('#'));
  if (lines.length < 2) return [];
  return lines.slice(1).map((line, idx) => {
    const cols = line.split(',').map((c) => c.trim());
    const row = { _rowIndex: idx };
    CSV_COLUMNS.forEach((col, i) => { row[col] = cols[i] || ''; });
    row._error = !row.name || !row.mobile || !row.primarySource ? 'Missing required field(s)' : null;
    return row;
  });
}

function downloadSampleCSV() {
  const mandatoryNote = '# MANDATORY: name | mobile | primarySource';
  const optionalNote = '# OPTIONAL: email | secondarySource | productType | variant | quantity | companyName | streetAddress | state | district';
  const header = CSV_COLUMNS.join(',');
  const sample = [
    'John Doe,9876543210,john@example.com,Facebook,Google,Software,Large,100,Acme Corp,123 Main St,Maharashtra,Mumbai',
    'Jane Smith,9123456789,jane@example.com,Google,Facebook,Hardware,Medium,50,Tech Solutions,456 Oak Ave,Karnataka,Bengaluru',
  ].join('\n');
  const csv = mandatoryNote + '\n' + optionalNote + '\n' + header + '\n' + sample;
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
  const { user } = useAuth();
  const role = String(user?.role || '').toUpperCase();
  const fileInputRef = useRef(null);
  const [rows, setRows] = useState([]);
  const [checkedIndexes, setCheckedIndexes] = useState(new Set());
  const [employees, setEmployees] = useState([]);
  const [selectedEmployeeIds, setSelectedEmployeeIds] = useState([]);
  const [employeePickerValue, setEmployeePickerValue] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [showCustomCount, setShowCustomCount] = useState(false);
  const [customCount, setCustomCount] = useState('');
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedRowForEdit, setSelectedRowForEdit] = useState(null);
  const leadPageKey = CRM_PAGE_OPTIONS.find((item) => item.key === 'leads')?.key || 'leads';
  const [groupOptions, setGroupOptions] = useState([]);
  const [flowRules, setFlowRules] = useState([]);
  const [selectedBranchName, setSelectedBranchName] = useState('');

  const leadEligibleGroups = useMemo(
    () =>
      groupOptions.filter((group) =>
        Array.isArray(group.pageKeys)
          ? group.pageKeys.map((key) => String(key || '').trim().toLowerCase()).includes(leadPageKey)
          : false,
      ),
    [groupOptions, leadPageKey],
  );

  const importBranchOptions = useMemo(
    () =>
      Array.from(
        new Set(
          leadEligibleGroups
            .map((group) => String(group?.institutionName || '').trim())
            .filter(Boolean),
        ),
      ),
    [leadEligibleGroups],
  );

  const scopedLeadEligibleGroups = useMemo(() => {
    if (role !== 'SUPER_ADMIN') return leadEligibleGroups;
    const branchName = String(selectedBranchName || '').trim().toLowerCase();
    if (!branchName) return [];
    return leadEligibleGroups.filter(
      (group) => String(group?.institutionName || '').trim().toLowerCase() === branchName,
    );
  }, [leadEligibleGroups, role, selectedBranchName]);

  const newLeadFlowGroupId = useMemo(() => {
    const rule = Array.isArray(flowRules)
      ? flowRules.find((item) => String(item?.status || '').trim().toLowerCase() === 'new lead')
      : null;
    return rule?.handledByGroupId != null && String(rule.handledByGroupId).trim() !== ''
      ? String(rule.handledByGroupId)
      : '';
  }, [flowRules]);

  const importGroup = useMemo(
    () =>
      newLeadFlowGroupId
        ? scopedLeadEligibleGroups.find((group) => String(group.id) === String(newLeadFlowGroupId)) || null
        : scopedLeadEligibleGroups[0] || null,
    [scopedLeadEligibleGroups, newLeadFlowGroupId],
  );

  useEffect(() => {
    let isMounted = true;
    const flowScope =
      role === 'SUPER_ADMIN' && String(selectedBranchName || '').trim()
        ? { institutionName: String(selectedBranchName || '').trim() }
        : {};
    Promise.all([getAssignableLeadGroups(), getUserGroups(), getLeadFlow(flowScope)])
      .then(([assignable, allGroups, flowPayload]) => {
        if (!isMounted) return;
        const byId = new Map((Array.isArray(allGroups) ? allGroups : []).map((g) => [String(g.id), g]));
        const merged = (Array.isArray(assignable) ? assignable : []).map((group) => {
          const full = byId.get(String(group.id));
          const pageKeys =
            Array.isArray(group.pageKeys) && group.pageKeys.length > 0
              ? group.pageKeys
              : Array.isArray(full?.pageKeys) ? full.pageKeys : [];
          return { ...group, pageKeys };
        });
        setGroupOptions(merged);
        setFlowRules(Array.isArray(flowPayload?.rules) ? flowPayload.rules : []);
      })
      .catch(() => {
        if (!isMounted) return;
        setGroupOptions([]);
        setFlowRules([]);
      });
    return () => {
      isMounted = false;
    };
  }, [role, selectedBranchName]);

  useEffect(() => {
    setSelectedEmployeeIds([]);
    setEmployeePickerValue('');
  }, [selectedBranchName, importGroup?.id]);

  useEffect(() => {
    let isMounted = true;
    if (!importGroup?.id) {
      setEmployees([]);
      return () => {
        isMounted = false;
      };
    }
    getGroupMembers(importGroup.id)
      .then((members) => {
        if (!isMounted) return;
        const eligibleMembers = (Array.isArray(members) ? members : []).filter((member) => {
          const roleName = String(member?.role || '').toUpperCase();
          const pageKeys = Array.isArray(member?.pageKeys)
            ? member.pageKeys.map((key) => String(key || '').trim().toLowerCase()).filter(Boolean)
            : [];
          return roleName === 'EMPLOYEE' && (pageKeys.length === 0 || pageKeys.includes(leadPageKey));
        });
        setEmployees(
          eligibleMembers.map((member) => ({
            id: member.userId,
            username: member.username || `User ${member.userId}`,
          })),
        );
      })
      .catch(() => {
        if (!isMounted) return;
        setEmployees([]);
      });
    return () => {
      isMounted = false;
    };
  }, [importGroup, leadPageKey]);

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
      if (next.has(rowIndex)) {
        next.delete(rowIndex);
      } else {
        next.add(rowIndex);
      }
      return next;
    });
  }

  function toggleEmployee(id) {
    setSelectedEmployeeIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }

  function addEmployeeFromDropdown(id) {
    if (!id) return;
    setSelectedEmployeeIds((prev) => (prev.includes(id) ? prev : [...prev, id]));
    setEmployeePickerValue('');
  }

  async function handleSubmit() {
    setSubmitError('');
    setSuccessMsg('');

    const selectedRows = rows.filter((r) => checkedIndexes.has(r._rowIndex) && !r._error);
    if (selectedRows.length === 0) {
      setSubmitError('Select at least one valid row.');
      return;
    }
    if (selectedEmployeeIds.length === 0) {
      setSubmitError('Select at least one employee to assign leads to.');
      return;
    }

    const leads = selectedRows.map((row, i) => ({
      name: row.name,
      mobile: row.mobile,
      primarySource: row.primarySource,
      leadPincode: row.leadPincode || null,
      email: row.email || null,
      countryCode: row.countryCode || null,
      secondarySource: row.secondarySource || null,
      companyName: row.companyName || null,
      productType: row.productType || null,
      variant: row.variant || null,
      quantity: row.quantity ? Number(row.quantity) : null,
      leadCountry: row.leadCountry || null,
      leadState: row.leadState || null,
      leadCity: row.leadCity || null,
      assignedUserId: selectedEmployeeIds[i % selectedEmployeeIds.length],
    }));

    setSubmitting(true);
    try {
      const result = await bulkCreateLeads(leads);
      setSuccessMsg(result.created + ' leads imported successfully.');
      setRows((prevRows) =>
        prevRows.map((row) =>
          checkedIndexes.has(row._rowIndex) && !row._error
            ? { ...row, _imported: true }
            : row
        )
      );
      setCheckedIndexes(new Set());
      setSelectedEmployeeIds([]);
      setEmployeePickerValue('');
    } catch (err) {
      setSubmitError(err?.response?.data?.error || err?.message || 'Import failed.');
    } finally {
      setSubmitting(false);
    }
  }

  const visibleRows = rows.filter((r) => !r._imported);
  const validRows = visibleRows.filter((r) => !r._error);
  const checkedValidCount = validRows.filter((r) => checkedIndexes.has(r._rowIndex)).length;

  return (
    <div className="content">
      <div className="d-flex align-items-center gap-2 mb-4">
        <button className="btn btn-outline-secondary btn-sm" onClick={() => navigate('/leads')}>
          <i className="ti ti-arrow-left me-1" />
          Back to Leads
        </button>
        <h4 className="mb-0">Import Leads</h4>
      </div>

      <div className="card mb-3">
        <div className="card-body">
          <h6 className="card-title">Step 1 - Download Sample CSV</h6>
         
          <button className="btn btn-outline-primary btn-sm" onClick={downloadSampleCSV}>
            <i className="ti ti-download me-1" />
            Download Sample CSV
          </button>
        </div>
      </div>

      <div className="card mb-3">
        <div className="card-body">
          <h6 className="card-title">Step 2 - Upload CSV</h6>
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            className="form-control"
            style={{ maxWidth: 360 }}
            onChange={handleFileChange}
          />
        </div>
      </div>

      {visibleRows.length > 0 && (
        <div className="card mb-3">
          <div className="card-body">
            <div className="d-flex align-items-center gap-3 mb-3 flex-wrap">
              <h6 className="card-title mb-0">Preview ({visibleRows.length} rows)</h6>
              <div className="d-flex align-items-center gap-2">
                <label className="mb-0 text-muted small">Quick Select:</label>
                <select
                  className="form-select form-select-sm"
                  style={{ width: 'auto' }}
                  defaultValue=""
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val === 'custom') {
                      setShowCustomCount(true);
                      setCustomCount('');
                    } else {
                      setShowCustomCount(false);
                      handleQuickSelect(val === 'all' ? Infinity : Number(val));
                    }
                  }}
                >
                  <option value="" disabled>Choose...</option>
                  {QUICK_SELECT_OPTIONS.map((opt) => (
                    <option key={opt.label} value={opt.value === Infinity ? 'all' : opt.value}>
                      {opt.label}
                    </option>
                  ))}
                  <option value="custom">Custom...</option>
                </select>
                {showCustomCount && (
                  <div className="d-flex align-items-center gap-1">
                    <input
                      type="number"
                      className="form-control form-control-sm"
                      style={{ width: 80 }}
                      min={1}
                      max={validRows.length}
                      placeholder="Count"
                      value={customCount}
                      onChange={(e) => setCustomCount(e.target.value)}
                    />
                    <button
                      type="button"
                      className="btn btn-sm btn-primary"
                      onClick={() => {
                        const n = parseInt(customCount, 10);
                        if (n > 0) handleQuickSelect(n);
                      }}
                    >
                      Go
                    </button>
                  </div>
                )}
              </div>
              <span className="text-muted small">{checkedValidCount} selected</span>
            </div>
            <div className="table-responsive">
              <table className="table table-sm table-bordered table-hover">
                <thead>
                  <tr>
                    <th style={{ width: 40 }}>#</th>
                    <th style={{ width: 40 }}>
                      <input
                        type="checkbox"
                        checked={validRows.length > 0 && checkedValidCount === validRows.length}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setCheckedIndexes(new Set(validRows.map((r) => r._rowIndex)));
                          } else {
                            setCheckedIndexes(new Set());
                          }
                        }}
                      />
                    </th>
                    <th>Name</th>
                    <th>Mobile</th>
                    <th>Primary Source</th>
                    <th>Status</th>
                    <th style={{ width: 80 }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {visibleRows.map((row, idx) => (
                    <tr key={row._rowIndex} className={row._error ? 'table-danger' : ''}>
                      <td>{idx + 1}</td>
                      <td>
                        {!row._error && (
                          <input
                            type="checkbox"
                            checked={checkedIndexes.has(row._rowIndex)}
                            onChange={() => toggleRow(row._rowIndex)}
                          />
                        )}
                      </td>
                      <td>{row.name || <span className="text-danger">-</span>}</td>
                      <td>{row.mobile || <span className="text-danger">-</span>}</td>
                      <td>{row.primarySource || <span className="text-danger">-</span>}</td>
                      <td>
                        {row._error ? (
                          <span className="badge bg-danger">{row._error}</span>
                        ) : (
                          <span className="badge bg-success">Valid</span>
                        )}
                      </td>
                      <td>
                        <button
                          className="btn btn-sm btn-outline-primary"
                          onClick={() => {
                            setSelectedRowForEdit(row);
                            setEditModalOpen(true);
                          }}
                          title="Edit lead details"
                        >
                          <i className="ti ti-pencil"></i> Edit
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {visibleRows.length > 0 && (
        <div className="card mb-3">
          <div className="card-body">
            <h6 className="card-title">Step 3 - Assign to Employee(s)</h6>
            {role === 'SUPER_ADMIN' && (
              <div className="mb-3" style={{ maxWidth: 360 }}>
                <label className="form-label">Branch</label>
                <select
                  className="form-select"
                  value={selectedBranchName}
                  onChange={(e) => setSelectedBranchName(e.target.value)}
                >
                  <option value="">Select Branch</option>
                  {importBranchOptions.map((branchName) => (
                    <option key={branchName} value={branchName}>
                      {branchName}
                    </option>
                  ))}
                </select>
              </div>
            )}
            {employees.length === 0 ? (
              <p className="text-muted">
                {role === 'SUPER_ADMIN' && !selectedBranchName
                  ? 'Select a branch to load New Lead handlers.'
                  : importGroup
                    ? 'No active employees in this group.'
                    : 'No group available.'}
              </p>
            ) : (
              <>
                <div className="mb-3" style={{ maxWidth: 360 }}>
                  <label className="form-label">Assign Employee</label>
                  <select
                    className="form-select"
                    value={employeePickerValue}
                    onChange={(e) => {
                      setEmployeePickerValue(e.target.value);
                      addEmployeeFromDropdown(e.target.value);
                    }}
                  >
                    <option value="">Select employee</option>
                    {employees
                      .filter((emp) => !selectedEmployeeIds.includes(String(emp.id)))
                      .map((emp) => (
                        <option key={emp.id} value={String(emp.id)}>
                          {emp.username}
                        </option>
                      ))}
                  </select>
                </div>

                <div className="d-flex flex-wrap gap-2 mb-3">
                  {selectedEmployeeIds.length === 0 ? (
                    <span className="text-muted small">No employee selected yet.</span>
                  ) : (
                    selectedEmployeeIds.map((employeeId) => {
                      const employee = employees.find((emp) => String(emp.id) === String(employeeId));
                      return (
                        <span
                          key={employeeId}
                          className="badge rounded-pill text-bg-primary d-inline-flex align-items-center gap-2 px-3 py-2"
                        >
                          <span>{employee?.username || employeeId}</span>
                          <button
                            type="button"
                            className="btn btn-link btn-sm text-white p-0 text-decoration-none"
                            onClick={() => toggleEmployee(employeeId)}
                            aria-label={`Remove ${employee?.username || employeeId}`}
                            style={{ lineHeight: 1 }}
                          >
                            x
                          </button>
                        </span>
                      );
                    })
                  )}
                </div>
              </>
            )}
            {selectedEmployeeIds.length > 1 && checkedValidCount > 0 && (
              <p className="text-muted small mb-2">
                {checkedValidCount} leads will be distributed round-robin across {selectedEmployeeIds.length} employees.
              </p>
            )}
            {submitError && <div className="alert alert-danger py-2">{submitError}</div>}
            {successMsg && <div className="alert alert-success py-2">{successMsg}</div>}
            <button
              className="btn btn-success"
              disabled={submitting || checkedValidCount === 0 || selectedEmployeeIds.length === 0}
              onClick={handleSubmit}
            >
              {submitting ? 'Importing...' : 'Import ' + checkedValidCount + ' Lead(s)'}
            </button>
          </div>
        </div>
      )}

      {visibleRows.length === 0 && rows.length > 0 && successMsg && (
        <div className="alert alert-success py-2">{successMsg}</div>
      )}

      <LeadImportEditModal
        isOpen={editModalOpen}
        onClose={() => {
          setEditModalOpen(false);
          setSelectedRowForEdit(null);
        }}
        rowData={selectedRowForEdit}
        onSave={(updatedData) => {
          // Update the row in the rows array
          setRows((prevRows) =>
            prevRows.map((row) =>
              row._rowIndex === selectedRowForEdit._rowIndex
                ? { ...row, ...updatedData }
                : row
            )
          );
        }}
      />
    </div>
  );
}
