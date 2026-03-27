import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import * as attendanceApi from '../../api/attendanceApi';

function fmtTime(dt) {
  if (!dt) return '-';
  return new Date(dt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
}
function fmtDate(dt) {
  if (!dt) return '-';
  return new Date(dt).toLocaleDateString([], { day: '2-digit', month: 'short', year: 'numeric' });
}
function fmtDuration(mins) {
  if (mins == null || mins <= 0) return '-';
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

const AttendanceAdminPage = () => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [fromDate, setFromDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 7);
    return d.toISOString().split('T')[0];
  });
  const [toDate, setToDate] = useState(() => new Date().toISOString().split('T')[0]);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const rec = await attendanceApi.getAdminRange(fromDate, toDate).catch(() => []);
      setRecords(Array.isArray(rec) ? rec : []);
    } catch (e) {
      setError(e?.response?.data?.message || e.message || 'Failed to load attendance');
    } finally {
      setLoading(false);
    }
  }, [fromDate, toDate]);

  useEffect(() => { loadData(); }, [loadData]);

  const presentCount = records.filter(r => ['CHECKED_IN', 'ON_BREAK', 'ON_LUNCH', 'CHECKED_OUT', 'AUTO_CHECKOUT'].includes(r.status)).length;
  const lateCount = records.filter(r => r.isLate).length;
  const absentCount = records.filter(r => !r.checkInTime).length;

  return (
    <>
      <div className="content">
        <div className="d-md-flex d-block align-items-center justify-content-between page-breadcrumb mb-3">
          <div className="my-auto mb-2">
            <h2 className="mb-1">Attendance Records</h2>
            <nav>
              <ol className="breadcrumb mb-0">
                <li className="breadcrumb-item"><Link to="/admin-dashboard"><i className="ti ti-smart-home"></i></Link></li>
                <li className="breadcrumb-item">Employee</li>
                <li className="breadcrumb-item active" aria-current="page">Attendance Records</li>
              </ol>
            </nav>
          </div>
        </div>

        {error && (
          <div className="alert alert-danger alert-dismissible fade show" role="alert">
            {error}
            <button type="button" className="btn-close" onClick={() => setError('')}></button>
          </div>
        )}

        <div className="row mb-4">
          <div className="col-xl-3 col-md-6">
            <div className="card">
              <div className="card-body">
                <div className="d-flex align-items-center justify-content-between">
                  <div>
                    <p className="text-gray-5 fs-12 fw-medium mb-1">Present</p>
                    <h4 className="mb-0">{presentCount}</h4>
                  </div>
                  <div className="icon-box icon-box-lg icon-box-primary"><i className="ti ti-check"></i></div>
                </div>
              </div>
            </div>
          </div>
          <div className="col-xl-3 col-md-6">
            <div className="card">
              <div className="card-body">
                <div className="d-flex align-items-center justify-content-between">
                  <div>
                    <p className="text-gray-5 fs-12 fw-medium mb-1">Late Arrivals</p>
                    <h4 className="mb-0">{lateCount}</h4>
                  </div>
                  <div className="icon-box icon-box-lg icon-box-warning"><i className="ti ti-clock-exclamation"></i></div>
                </div>
              </div>
            </div>
          </div>
          <div className="col-xl-3 col-md-6">
            <div className="card">
              <div className="card-body">
                <div className="d-flex align-items-center justify-content-between">
                  <div>
                    <p className="text-gray-5 fs-12 fw-medium mb-1">Absent</p>
                    <h4 className="mb-0">{absentCount}</h4>
                  </div>
                  <div className="icon-box icon-box-lg icon-box-danger"><i className="ti ti-x"></i></div>
                </div>
              </div>
            </div>
          </div>
          <div className="col-xl-3 col-md-6">
            <div className="card">
              <div className="card-body">
                <div className="d-flex align-items-center justify-content-between">
                  <div>
                    <p className="text-gray-5 fs-12 fw-medium mb-1">Total Records</p>
                    <h4 className="mb-0">{records.length}</h4>
                  </div>
                  <div className="icon-box icon-box-lg icon-box-info"><i className="ti ti-database"></i></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="card mb-4">
          <div className="card-body">
            <div className="row g-3">
              <div className="col-lg-3">
                <label className="form-label">From Date</label>
                <input type="date" className="form-control" value={fromDate} onChange={(e) => setFromDate(e.target.value)} />
              </div>
              <div className="col-lg-3">
                <label className="form-label">To Date</label>
                <input type="date" className="form-control" value={toDate} onChange={(e) => setToDate(e.target.value)} />
              </div>
              <div className="col-lg-6">
                <label className="form-label">&nbsp;</label>
                <button className="btn btn-primary w-100" onClick={loadData} disabled={loading}>
                  {loading ? <span className="spinner-border spinner-border-sm me-1"></span> : <i className="ti ti-search me-1"></i>}
                  Load Records
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="table-responsive">
            {loading ? (
              <div className="text-center py-5"><div className="spinner-border text-primary" role="status"><span className="visually-hidden">Loading...</span></div></div>
            ) : (
              <table className="table table-hover mb-0">
                <thead className="table-light">
                  <tr>
                    <th>Employee</th>
                    <th>Date</th>
                    <th>Check In Location</th>
                    <th>Check Out Location</th>
                    <th>Check In</th>
                    <th>Check Out</th>
                    <th>Work Time</th>
                    <th>Status</th>
                    <th>Late?</th>
                  </tr>
                </thead>
                <tbody>
                  {records.length === 0 ? (
                    <tr><td colSpan="9" className="text-center text-muted py-4">No records found</td></tr>
                  ) : (
                    records.map((r) => (
                      <tr key={r.id}>
                        <td>
                          <div>
                            <strong>{r.userName || `User ${r.userId}`}</strong>
                            <br />
                            <small className="text-muted">{r.userRole || '-'}</small>
                          </div>
                        </td>
                        <td>{fmtDate(r.attendanceDate)}</td>
                        <td><small className="text-muted">{r.checkInLocationName || '-'}</small></td>
                        <td><small className="text-muted">{r.checkOutLocationName || '-'}</small></td>
                        <td>{fmtTime(r.checkInTime)}</td>
                        <td>{fmtTime(r.checkOutTime)}</td>
                        <td><span className="badge badge-primary">{(r.netWorkMinutes ? fmtDuration(r.netWorkMinutes) : '-')}</span></td>
                        <td>
                          <span className={`badge badge-${
                            r.status === 'CHECKED_IN' ? 'info' :
                            r.status === 'CHECKED_OUT' || r.status === 'AUTO_CHECKOUT' ? 'success' :
                            r.status === 'ON_BREAK' ? 'warning' :
                            r.status === 'ON_LUNCH' ? 'info' : 'secondary'
                          }`}>
                            {r.status?.replace(/_/g, ' ')}
                          </span>
                        </td>
                        <td>
                          {r.isLate ? (
                            <span className="badge badge-danger">Yes (+{r.lateMinutes}m)</span>
                          ) : (
                            <span className="badge badge-success">No</span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default AttendanceAdminPage;
