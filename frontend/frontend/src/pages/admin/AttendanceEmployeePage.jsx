import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import * as attendanceApi from '../../api/attendanceApi';
import "../../../public/assets/css/addModalShared.css";

/* ── helpers ── */
function fmtTime(dt) {
  if (!dt) return '-';
  const d = new Date(dt);
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
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

const AttendanceEmployeePage = () => {
  const { user } = useAuth();
  const role = String(user?.role || "").toUpperCase();
  const [today, setToday] = useState(null);
  const [summary, setSummary] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');
  const [gpsError, setGpsError] = useState('');
  const gpsRef = useRef(null);

  /* ── GPS helper ── */
  const getGPS = useCallback(() => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported by your browser.'));
        return;
      }
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          gpsRef.current = {
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
            accuracy: pos.coords.accuracy,
          };
          resolve(gpsRef.current);
        },
        (err) => reject(new Error(`GPS error: ${err.message}`)),
        { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
      );
    });
  }, []);

  /* ── Load data ── */
  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const [todayData, summaryData, historyData] = await Promise.all([
        attendanceApi.getToday().catch(() => null),
        attendanceApi.getSummary().catch(() => null),
        attendanceApi.getHistory(
          new Date(Date.now() - 30 * 86400000).toISOString().split('T')[0],
          new Date().toISOString().split('T')[0]
        ).catch(() => []),
      ]);
      setToday(todayData);
      setSummary(summaryData);
      setHistory(Array.isArray(historyData) ? historyData : []);
    } catch (e) {
      setError(e?.response?.data?.message || e.message || 'Failed to load attendance data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  /* ── Actions ── */
  const handleAction = async (action) => {
    setActionLoading(true);
    setError('');
    setGpsError('');
    try {
      let gps;
      if (action === 'checkIn' || action === 'checkOut') {
        try {
          gps = await getGPS();
        } catch (e) {
          setGpsError(e.message);
          setActionLoading(false);
          return;
        }
      }
      switch (action) {
        case 'checkIn':
          await attendanceApi.checkIn(gps);
          break;
        case 'checkOut':
          await attendanceApi.checkOut(gps);
          break;
        case 'breakStart':
          await attendanceApi.startBreak({ breakType: 'BREAK' });
          break;
        case 'breakEnd':
          await attendanceApi.endBreak({ breakType: 'BREAK' });
          break;
        case 'lunchStart':
          await attendanceApi.startBreak({ breakType: 'LUNCH' });
          break;
        case 'lunchEnd':
          await attendanceApi.endBreak({ breakType: 'LUNCH' });
          break;
        default:
          break;
      }
      await loadData();
    } catch (e) {
      const msg = e?.response?.data?.message || e?.response?.data || e.message || 'Action failed';
      setError(typeof msg === 'string' ? msg : JSON.stringify(msg));
    } finally {
      setActionLoading(false);
    }
  };

  /* ── Status helpers ── */
  const status = today?.status;
  const isCheckedIn = status === 'CHECKED_IN';
  const isOnBreak = status === 'ON_BREAK';
  const isOnLunch = status === 'ON_LUNCH';
  const isCheckedOut = status === 'CHECKED_OUT' || status === 'AUTO_CHECKOUT';
  const isActive = isCheckedIn || isOnBreak || isOnLunch;
  const hasNotCheckedIn = !today;

  const nowStr = new Date().toLocaleString([], {
    hour: '2-digit', minute: '2-digit', hour12: true,
    day: '2-digit', month: 'short', year: 'numeric'
  });

  return (
    <>
<div className="content">
	<div className="d-md-flex d-block align-items-center justify-content-between page-breadcrumb mb-3">
		<div className="my-auto mb-2">
			<h2 className="mb-1">Employee Attendance</h2>
			<nav>
				<ol className="breadcrumb mb-0">
					<li className="breadcrumb-item"><a href="/admin-dashboard"><i className="ti ti-smart-home"></i></a></li>
					<li className="breadcrumb-item">Employee</li>
					<li className="breadcrumb-item active" aria-current="page">Employee Attendance</li>
				</ol>
			</nav>
		</div>
		<div className="d-flex gap-2 align-items-center">
			{role !== "SUPER_ADMIN" && (
				<button className="btn btn-checkin-action" disabled={actionLoading || !hasNotCheckedIn} onClick={() => handleAction('checkIn')}>
					{actionLoading ? <span className="spinner-border spinner-border-sm me-1"></span> : <i className="ti ti-fingerprint me-1"></i>}
					Check In
				</button>
			)}
			{isCheckedIn && (
				<>
					<button className="btn btn-outline-warning btn-sm" disabled={actionLoading} onClick={() => handleAction('breakStart')}>
						<i className="ti ti-coffee me-1"></i>Break
					</button>
					<button className="btn btn-outline-info btn-sm" disabled={actionLoading} onClick={() => handleAction('lunchStart')}>
						<i className="ti ti-meat me-1"></i>Lunch
					</button>
					<button className="btn btn-dark" disabled={actionLoading} onClick={() => handleAction('checkOut')}>
						{actionLoading ? <span className="spinner-border spinner-border-sm me-1"></span> : <i className="ti ti-logout me-1"></i>}
						Check Out
					</button>
				</>
			)}
			{isOnBreak && (
				<button className="btn btn-warning" disabled={actionLoading} onClick={() => handleAction('breakEnd')}>
					{actionLoading ? <span className="spinner-border spinner-border-sm me-1"></span> : <i className="ti ti-player-play me-1"></i>}
					End Break
				</button>
			)}
			{isOnLunch && (
				<button className="btn btn-info text-white" disabled={actionLoading} onClick={() => handleAction('lunchEnd')}>
					{actionLoading ? <span className="spinner-border spinner-border-sm me-1"></span> : <i className="ti ti-player-play me-1"></i>}
					End Lunch
				</button>
			)}
		</div>
	</div>

	{error && (
		<div className="alert alert-danger alert-dismissible fade show" role="alert">
			{error}
			<button type="button" className="btn-close" onClick={() => setError('')}></button>
		</div>
	)}
	{gpsError && (
		<div className="alert alert-warning alert-dismissible fade show" role="alert">
			<i className="ti ti-map-pin-off me-1"></i>{gpsError}
			<button type="button" className="btn-close" onClick={() => setGpsError('')}></button>
		</div>
	)}

	{loading ? (
		<div className="text-center py-5"><div className="spinner-border text-primary" role="status"><span className="visually-hidden">Loading...</span></div></div>
	) : (
	<div className="row">
		{/* ── Punch Card ── */}
		<div className="col-xl-3 col-lg-4 d-flex">
			<div className="card flex-fill">
				<div className="card-body">
					<div className="mb-3 text-center">
						<h6 className="fw-medium text-gray-5 mb-2">
							{hasNotCheckedIn ? 'Good ' + (new Date().getHours() < 12 ? 'Morning' : new Date().getHours() < 17 ? 'Afternoon' : 'Evening')
								: isActive ? 'Currently Working' : 'Day Complete'}
							{user?.firstName ? `, ${user.firstName}` : ''}
						</h6>
						<h5>{nowStr}</h5>
					</div>

					{today?.checkInTime && (
						<h6 className="fw-medium d-flex align-items-center justify-content-center mb-2">
							<i className="ti ti-fingerprint text-primary me-1"></i>
							Punch In at {fmtTime(today.checkInTime)}
						</h6>
					)}
					{today?.checkOutTime && (
						<h6 className="fw-medium d-flex align-items-center justify-content-center mb-2">
							<i className="ti ti-logout text-danger me-1"></i>
							Punch Out at {fmtTime(today.checkOutTime)}
						</h6>
					)}

					{isOnBreak && <div className="badge badge-warning mb-2 w-100">On Break</div>}
					{isOnLunch && <div className="badge badge-info mb-2 w-100">On Lunch</div>}

					{today?.netWorkMinutes > 0 && (
						<div className="badge badge-md badge-primary mb-3 w-100">
							Production: {fmtDuration(today.netWorkMinutes)}
						</div>
					)}

					<div className="text-center d-grid gap-2">

						{/* If on break/lunch, user must end it first - but can also check out which auto-ends */}
						{(isOnBreak || isOnLunch) && (
							<button className="btn btn-dark" disabled={actionLoading} onClick={() => handleAction('checkOut')}>
								<i className="ti ti-logout me-1"></i>End & Punch Out
							</button>
						)}

						{isCheckedOut && (
							<div className="badge badge-success-transparent p-2">
								<i className="ti ti-check me-1"></i>Day Completed
							</div>
						)}
					</div>
				</div>
			</div>
		</div>

		{/* ── Stats Cards ── */}
		<div className="col-xl-9 col-lg-8 d-flex">
			<div className="row flex-fill">
				<div className="col-xl-3 col-md-6">
					<div className="card">
						<div className="card-body">
							<div className="border-bottom mb-2 pb-2">
								<span className="avatar avatar-sm bg-primary mb-2"><i className="ti ti-clock-stop"></i></span>
								<h2 className="mb-2">
									{summary ? `${summary.totalHoursToday || 0}h ${summary.totalMinutesToday || 0}m` : '-'}
								</h2>
								<p className="fw-medium text-truncate">Total Hours Today</p>
							</div>
						</div>
					</div>
				</div>
				<div className="col-xl-3 col-md-6">
					<div className="card">
						<div className="card-body">
							<div className="border-bottom mb-2 pb-2">
								<span className="avatar avatar-sm bg-dark mb-2"><i className="ti ti-clock-up"></i></span>
								<h2 className="mb-2">
									{summary ? `${summary.totalHoursWeek || 0}h ${summary.totalMinutesWeek || 0}m` : '-'}
								</h2>
								<p className="fw-medium text-truncate">Total Hours Week</p>
							</div>
						</div>
					</div>
				</div>
				<div className="col-xl-3 col-md-6">
					<div className="card">
						<div className="card-body">
							<div className="border-bottom mb-2 pb-2">
								<span className="avatar avatar-sm bg-info mb-2"><i className="ti ti-calendar-up"></i></span>
								<h2 className="mb-2">
									{summary ? `${summary.totalHoursMonth || 0}h ${summary.totalMinutesMonth || 0}m` : '-'}
								</h2>
								<p className="fw-medium text-truncate">Total Hours Month</p>
							</div>
						</div>
					</div>
				</div>
				<div className="col-xl-3 col-md-6">
					<div className="card">
						<div className="card-body">
							<div className="border-bottom mb-2 pb-2">
								<span className="avatar avatar-sm bg-pink mb-2"><i className="ti ti-calendar-star"></i></span>
								<h2 className="mb-2">
									{summary ? fmtDuration(summary.overtimeMinutesMonth || 0) : '-'}
								</h2>
								<p className="fw-medium text-truncate">Overtime this Month</p>
							</div>
						</div>
					</div>
				</div>

				{/* ── Today's Timeline ── */}
				{today && (
				<div className="col-md-12">
					<div className="card">
						<div className="card-body">
							<div className="row">
								<div className="col-xl-3">
									<div className="mb-3">
										<p className="d-flex align-items-center mb-1"><i className="ti ti-point-filled text-dark-transparent me-1"></i>Total Working</p>
										<h3>{fmtDuration(today.totalWorkMinutes)}</h3>
									</div>
								</div>
								<div className="col-xl-3">
									<div className="mb-3">
										<p className="d-flex align-items-center mb-1"><i className="ti ti-point-filled text-success me-1"></i>Net Work</p>
										<h3>{fmtDuration(today.netWorkMinutes)}</h3>
									</div>
								</div>
								<div className="col-xl-3">
									<div className="mb-3">
										<p className="d-flex align-items-center mb-1"><i className="ti ti-point-filled text-warning me-1"></i>Break</p>
										<h3>{fmtDuration(today.breakTimeMinutes)}</h3>
									</div>
								</div>
								<div className="col-xl-3">
									<div className="mb-3">
										<p className="d-flex align-items-center mb-1"><i className="ti ti-point-filled text-info me-1"></i>Lunch</p>
										<h3>{fmtDuration(today.lunchTimeMinutes)}</h3>
									</div>
								</div>
							</div>
							{today.isLate && (
								<div className="alert alert-warning py-2 mb-0">
									<i className="ti ti-alert-triangle me-1"></i>
									Late by {today.lateMinutes} minutes
								</div>
							)}
						</div>
					</div>
				</div>
				)}

				{/* ── Today's Events Timeline ── */}
				{today?.events?.length > 0 && (
				<div className="col-md-12">
					<div className="card">
						<div className="card-header"><h5>Today's Timeline</h5></div>
						<div className="card-body">
							<div className="d-flex flex-wrap gap-3">
								{today.events.map((evt, idx) => {
									const typeColors = {
										CHECK_IN: 'success', CHECK_OUT: 'danger',
										BREAK_START: 'warning', BREAK_END: 'warning',
										LUNCH_START: 'info', LUNCH_END: 'info'
									};
									const typeLabels = {
										CHECK_IN: 'Punch In', CHECK_OUT: 'Punch Out',
										BREAK_START: 'Break Start', BREAK_END: 'Break End',
										LUNCH_START: 'Lunch Start', LUNCH_END: 'Lunch End'
									};
									const color = typeColors[evt.eventType] || 'secondary';
									return (
										<div key={evt.id || idx} className={`badge badge-${color}-transparent p-2`}>
											<i className="ti ti-clock me-1"></i>
											{typeLabels[evt.eventType] || evt.eventType} — {fmtTime(evt.occurredAt)}
										</div>
									);
								})}
							</div>
						</div>
					</div>
				</div>
				)}
			</div>
		</div>
	</div>
	)}

	{/* ── Attendance History Table ── */}
	{!loading && history.length > 0 && (
	<div className="card">
		<div className="card-header d-flex align-items-center justify-content-between flex-wrap row-gap-3">
			<h5>Attendance History</h5>
		</div>
		<div className="card-body p-0">
			<div className="custom-datatable-filter table-responsive">
				<table className="table datatable">
					<thead className="thead-light">
						<tr>
							<th>Date</th>
							<th>Check In</th>
							<th>Status</th>
							<th>Check Out</th>
							<th>Break</th>
							<th>Lunch</th>
							<th>Late</th>
							<th>Net Work</th>
							<th>Work Status</th>
						</tr>
					</thead>
					<tbody>
						{history.map((att) => (
						<tr key={att.id}>
							<td>{fmtDate(att.attendanceDate)}</td>
							<td>{fmtTime(att.checkInTime)}</td>
							<td>
								<span className={`badge ${att.status === 'CHECKED_OUT' || att.status === 'AUTO_CHECKOUT' ? 'badge-success-transparent' : 'badge-info-transparent'} d-inline-flex align-items-center`}>
									<i className="ti ti-point-filled me-1"></i>
									{att.status === 'CHECKED_OUT' ? 'Present' : att.status === 'AUTO_CHECKOUT' ? 'Auto Out' : att.status?.replace(/_/g, ' ')}
								</span>
							</td>
							<td>{fmtTime(att.checkOutTime)}</td>
							<td>{att.breakTimeMinutes > 0 ? `${att.breakTimeMinutes} Min` : '-'}</td>
							<td>{att.lunchTimeMinutes > 0 ? `${att.lunchTimeMinutes} Min` : '-'}</td>
							<td>{att.lateMinutes > 0 ? `${att.lateMinutes} Min` : '-'}</td>
							<td>
								{att.netWorkMinutes != null ? (
								<span className={`badge ${att.workStatus === 'COMPLETED' ? 'badge-success' : att.workStatus === 'HALF_DAY' ? 'badge-warning' : 'badge-danger'} d-inline-flex align-items-center`}>
									<i className="ti ti-clock-hour-11 me-1"></i>{fmtDuration(att.netWorkMinutes)}
								</span>
								) : '-'}
							</td>
							<td>
								<span className={`badge ${att.workStatus === 'COMPLETED' ? 'badge-success-transparent' : att.workStatus === 'HALF_DAY' ? 'badge-warning-transparent' : 'badge-danger-transparent'}`}>
									{att.workStatus || '-'}
								</span>
							</td>
						</tr>
						))}
					</tbody>
				</table>
			</div>
		</div>
	</div>
	)}
</div>
    </>
  );
};

export default AttendanceEmployeePage;
