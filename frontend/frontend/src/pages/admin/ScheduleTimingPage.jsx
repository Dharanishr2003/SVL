import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import * as attendanceApi from '../../api/attendanceApi';
import LocationPickerModal from '../../components/admin/LocationPickerModal';

/* helpers */
function fmtDuration(mins) {
  if (mins == null || mins <= 0) return '-';
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

const ScheduleTimingPage = () => {
  const [shifts, setShifts] = useState([]);
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('shifts'); // shifts | locations

  /* shift form state */
  const [shiftForm, setShiftForm] = useState({ name: '', startTime: '09:00', endTime: '18:00', breakAllowedMinutes: 15, breakGraceMinutes: 5, lunchAllowedMinutes: 60, lunchGraceMinutes: 10, minWorkMinutes: 480, isNightShift: false, earlyCheckinBufferMinutes: 30, lateCheckinBufferMinutes: 15 });
  const [editingShiftId, setEditingShiftId] = useState(null);

  /* location form state */
  const [locForm, setLocForm] = useState({ name: '', latitude: '', longitude: '', radiusMeters: 50 });
  const [editingLocId, setEditingLocId] = useState(null);
  const [locationModalVisible, setLocationModalVisible] = useState(false);

  /* ── Data loading ── */
  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const [shiftList, locList] = await Promise.all([
        attendanceApi.listShifts().catch(() => []),
        attendanceApi.listLocations().catch(() => []),
      ]);
      setShifts(Array.isArray(shiftList) ? shiftList : []);
      setLocations(Array.isArray(locList) ? locList : []);
    } catch (e) {
      setError(e?.response?.data?.message || e.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  /* ── Shift CRUD handlers ── */
  const handleShiftSave = async (e) => {
    e.preventDefault();
    try {
      if (editingShiftId) {
        await attendanceApi.updateShift(editingShiftId, shiftForm);
      } else {
        await attendanceApi.createShift(shiftForm);
      }
      setEditingShiftId(null);
      setShiftForm({ name: '', startTime: '09:00', endTime: '18:00', breakAllowedMinutes: 15, breakGraceMinutes: 5, lunchAllowedMinutes: 60, lunchGraceMinutes: 10, minWorkMinutes: 480, isNightShift: false, earlyCheckinBufferMinutes: 30, lateCheckinBufferMinutes: 15 });
      await loadData();
    } catch (e) {
      setError(e?.response?.data?.message || e.message || 'Shift save failed');
    }
  };

  const handleShiftEdit = (s) => {
    setEditingShiftId(s.id);
    setShiftForm({
      name: s.name || '', startTime: s.startTime || '09:00', endTime: s.endTime || '18:00',
      breakAllowedMinutes: s.breakAllowedMinutes ?? 15, breakGraceMinutes: s.breakGraceMinutes ?? 5,
      lunchAllowedMinutes: s.lunchAllowedMinutes ?? 60, lunchGraceMinutes: s.lunchGraceMinutes ?? 10,
      minWorkMinutes: s.minWorkMinutes ?? 480, isNightShift: s.isNightShift ?? false,
      earlyCheckinBufferMinutes: s.earlyCheckinBufferMinutes ?? 30, lateCheckinBufferMinutes: s.lateCheckinBufferMinutes ?? 15
    });
  };

  const handleShiftDelete = async (id) => {
    if (!window.confirm('Delete this shift?')) return;
    try { await attendanceApi.deleteShift(id); await loadData(); }
    catch (e) { setError(e?.response?.data?.message || 'Delete failed'); }
  };

  /* ── Location CRUD handlers ── */
  const handleLocSave = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...locForm, latitude: parseFloat(locForm.latitude), longitude: parseFloat(locForm.longitude), radiusMeters: parseInt(locForm.radiusMeters, 10) };
      if (editingLocId) {
        await attendanceApi.updateLocation(editingLocId, payload);
      } else {
        await attendanceApi.createLocation(payload);
      }
      setEditingLocId(null);
      setLocForm({ name: '', latitude: '', longitude: '', radiusMeters: 50 });
      await loadData();
    } catch (e) {
      setError(e?.response?.data?.message || e.message || 'Location save failed');
    }
  };

  const handleLocEdit = (l) => {
    setEditingLocId(l.id);
    setLocForm({ name: l.name || '', latitude: l.latitude || '', longitude: l.longitude || '', radiusMeters: l.radiusMeters ?? 50 });
  };

  const handleLocDelete = async (id) => {
    if (!window.confirm('Delete this location?')) return;
    try { await attendanceApi.deleteLocation(id); await loadData(); }
    catch (e) { setError(e?.response?.data?.message || 'Delete failed'); }
  };

  return (
    <>
      <div className="content">
        <div className="d-md-flex d-block align-items-center justify-content-between page-breadcrumb mb-3">
          <div className="my-auto mb-2">
            <h2 className="mb-1">Schedule Timing</h2>
            <nav>
              <ol className="breadcrumb mb-0">
                <li className="breadcrumb-item"><Link to="/admin-dashboard"><i className="ti ti-smart-home"></i></Link></li>
                <li className="breadcrumb-item">Administration</li>
                <li className="breadcrumb-item active" aria-current="page">Schedule Timing</li>
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

	{/* ── Tabs ── */}
	<ul className="nav nav-tabs mb-4">
		<li className="nav-item">
			<button className={`nav-link ${activeTab === 'shifts' ? 'active' : ''}`} onClick={() => setActiveTab('shifts')}>
				<i className="ti ti-clock me-1"></i>Shifts
			</button>
		</li>
		<li className="nav-item">
			<button className={`nav-link ${activeTab === 'locations' ? 'active' : ''}`} onClick={() => setActiveTab('locations')}>
				<i className="ti ti-map-pin me-1"></i>Locations
			</button>
		</li>
	</ul>

	{loading ? (
		<div className="text-center py-5"><div className="spinner-border text-primary" role="status"><span className="visually-hidden">Loading...</span></div></div>
	) : (
	<>
	{/* ┌─────────────────────────────────────────────── */}
	{/* │         SHIFTS TAB                            */}
	{/* └─────────────────────────────────────────────── */}
	{activeTab === 'shifts' && (
	<div className="row">
		{/* Shift Form */}
		<div className="col-lg-5">
			<div className="card">
				<div className="card-header">
					<h5>{editingShiftId ? 'Edit Shift' : 'Add Shift'}</h5>
				</div>
				<div className="card-body">
					<form onSubmit={handleShiftSave}>
						<div className="mb-3">
							<label className="form-label">Shift Name</label>
							<input type="text" className="form-control" required value={shiftForm.name} onChange={e => setShiftForm(p => ({ ...p, name: e.target.value }))} />
						</div>
						<div className="row">
							<div className="col-6 mb-3">
								<label className="form-label">Start Time</label>
								<input type="time" className="form-control" required value={shiftForm.startTime} onChange={e => setShiftForm(p => ({ ...p, startTime: e.target.value }))} />
							</div>
							<div className="col-6 mb-3">
								<label className="form-label">End Time</label>
								<input type="time" className="form-control" required value={shiftForm.endTime} onChange={e => setShiftForm(p => ({ ...p, endTime: e.target.value }))} />
							</div>
						</div>
						<div className="row">
							<div className="col-6 mb-3">
								<label className="form-label">Break Allowed (min)</label>
								<input type="number" className="form-control" value={shiftForm.breakAllowedMinutes} onChange={e => setShiftForm(p => ({ ...p, breakAllowedMinutes: parseInt(e.target.value, 10) || 0 }))} />
							</div>
							<div className="col-6 mb-3">
								<label className="form-label">Break Grace (min)</label>
								<input type="number" className="form-control" value={shiftForm.breakGraceMinutes} onChange={e => setShiftForm(p => ({ ...p, breakGraceMinutes: parseInt(e.target.value, 10) || 0 }))} />
							</div>
						</div>
						<div className="row">
							<div className="col-6 mb-3">
								<label className="form-label">Lunch Allowed (min)</label>
								<input type="number" className="form-control" value={shiftForm.lunchAllowedMinutes} onChange={e => setShiftForm(p => ({ ...p, lunchAllowedMinutes: parseInt(e.target.value, 10) || 0 }))} />
							</div>
							<div className="col-6 mb-3">
								<label className="form-label">Lunch Grace (min)</label>
								<input type="number" className="form-control" value={shiftForm.lunchGraceMinutes} onChange={e => setShiftForm(p => ({ ...p, lunchGraceMinutes: parseInt(e.target.value, 10) || 0 }))} />
							</div>
						</div>
						<div className="mb-3">
							<label className="form-label">Min Work (min)</label>
							<input type="number" className="form-control" value={shiftForm.minWorkMinutes} onChange={e => setShiftForm(p => ({ ...p, minWorkMinutes: parseInt(e.target.value, 10) || 0 }))} />
						</div>
						<div className="row">
							<div className="col-6 mb-3">
								<label className="form-label">Early Check-In (min before start)</label>
								<input type="number" className="form-control" value={shiftForm.earlyCheckinBufferMinutes} onChange={e => setShiftForm(p => ({ ...p, earlyCheckinBufferMinutes: parseInt(e.target.value, 10) || 0 }))} />
							</div>
							<div className="col-6 mb-3">
								<label className="form-label">Late Check-In (min after start)</label>
								<input type="number" className="form-control" value={shiftForm.lateCheckinBufferMinutes} onChange={e => setShiftForm(p => ({ ...p, lateCheckinBufferMinutes: parseInt(e.target.value, 10) || 0 }))} />
							</div>
						</div>
						<div className="form-check mb-3">
							<input className="form-check-input" type="checkbox" id="nightShift" checked={shiftForm.isNightShift} onChange={e => setShiftForm(p => ({ ...p, isNightShift: e.target.checked }))} />
							<label className="form-check-label" htmlFor="nightShift">Night Shift</label>
						</div>
						<div className="d-flex gap-2">
							<button type="submit" className="btn btn-primary">{editingShiftId ? 'Update' : 'Create'}</button>
							{editingShiftId && (
								<button type="button" className="btn btn-light" onClick={() => { setEditingShiftId(null); setShiftForm({ name: '', startTime: '09:00', endTime: '18:00', breakAllowedMinutes: 15, breakGraceMinutes: 5, lunchAllowedMinutes: 60, lunchGraceMinutes: 10, minWorkMinutes: 480, isNightShift: false, earlyCheckinBufferMinutes: 30, lateCheckinBufferMinutes: 15 }); }}>Cancel</button>
							)}
						</div>
					</form>
				</div>
			</div>
		</div>

		{/* Shift List */}
		<div className="col-lg-7">
			<div className="card">
				<div className="card-header"><h5>Shifts</h5></div>
				<div className="card-body p-0">
					<div className="table-responsive">
						<table className="table mb-0">
							<thead className="thead-light">
								<tr>
									<th>Name</th>
									<th>Start</th>
									<th>End</th>
									<th>Break</th>
									<th>Lunch</th>
									<th>Min Work</th>
									<th>Check-In Window</th>
									<th>Night</th>
									<th>Actions</th>
								</tr>
							</thead>
							<tbody>
								{shifts.length === 0 ? (
									<tr><td colSpan="9" className="text-center py-3 text-muted">No shifts configured.</td></tr>
								) : shifts.map(s => (
									<tr key={s.id}>
										<td>{s.name}</td>
										<td>{s.startTime}</td>
										<td>{s.endTime}</td>
										<td>{s.breakAllowedMinutes}+{s.breakGraceMinutes}m</td>
										<td>{s.lunchAllowedMinutes}+{s.lunchGraceMinutes}m</td>
										<td>{fmtDuration(s.minWorkMinutes)}</td>
										<td><span className="text-muted small">-{s.earlyCheckinBufferMinutes}m to +{s.lateCheckinBufferMinutes}m</span></td>
										<td>{s.isNightShift ? <span className="badge badge-dark">Yes</span> : 'No'}</td>
										<td>
											<div className="d-flex gap-1">
												<button className="btn btn-sm btn-outline-primary" onClick={() => handleShiftEdit(s)}><i className="ti ti-edit"></i></button>
												<button className="btn btn-sm btn-outline-danger" onClick={() => handleShiftDelete(s.id)}><i className="ti ti-trash"></i></button>
											</div>
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				</div>
			</div>
		</div>
	</div>
	)}

	{/* ┌─────────────────────────────────────────────── */}
	{/* │         LOCATIONS TAB                         */}
	{/* └─────────────────────────────────────────────── */}
	{activeTab === 'locations' && (
	<div className="row">
		{/* Location Form */}
		<div className="col-lg-5">
			<div className="card">
				<div className="card-header">
					<h5>{editingLocId ? 'Edit Location' : 'Add Location'}</h5>
				</div>
				<div className="card-body">
					<form onSubmit={handleLocSave}>
						<div className="mb-3">
							<label className="form-label">Location Name</label>
							<input type="text" className="form-control" required value={locForm.name} onChange={e => setLocForm(p => ({ ...p, name: e.target.value }))} />
						</div>

						{/* Map Picker Button */}
						<div className="mb-3">
							<button
								type="button"
								className="btn btn-outline-primary w-100"
								onClick={() => setLocationModalVisible(true)}
							>
								<i className="ti ti-map me-2"></i>
								{locForm.latitude && locForm.longitude ? 'Change Location on Map' : 'Pick Location on Map'}
							</button>
						</div>

						{/* Display Selected Coordinates */}
						{locForm.latitude && locForm.longitude && (
							<div className="row g-2 mb-3">
								<div className="col-6">
									<small className="text-muted">Latitude</small>
									<div className="fw-bold">{parseFloat(locForm.latitude).toFixed(6)}</div>
								</div>
								<div className="col-6">
									<small className="text-muted">Longitude</small>
									<div className="fw-bold">{parseFloat(locForm.longitude).toFixed(6)}</div>
								</div>
							</div>
						)}

						<div className="mb-3">
							<label className="form-label">Radius (meters)</label>
							<input type="number" className="form-control" value={locForm.radiusMeters} onChange={e => setLocForm(p => ({ ...p, radiusMeters: e.target.value }))} />
						</div>
						<div className="d-flex gap-2">
							<button type="submit" className="btn btn-primary">{editingLocId ? 'Update' : 'Create'}</button>
							{editingLocId && (
								<button type="button" className="btn btn-light" onClick={() => { setEditingLocId(null); setLocForm({ name: '', latitude: '', longitude: '', radiusMeters: 50 }); }}>Cancel</button>
							)}
						</div>
					</form>
				</div>
			</div>
		</div>

		{/* Location List */}
		<div className="col-lg-7">
			<div className="card">
				<div className="card-header"><h5>Company Locations</h5></div>
				<div className="card-body p-0">
					<div className="table-responsive">
						<table className="table mb-0">
							<thead className="thead-light">
								<tr>
									<th>Name</th>
									<th>Latitude</th>
									<th>Longitude</th>
									<th>Radius (m)</th>
									<th>Active</th>
									<th>Actions</th>
								</tr>
							</thead>
							<tbody>
								{locations.length === 0 ? (
									<tr><td colSpan="6" className="text-center py-3 text-muted">No locations configured.</td></tr>
								) : locations.map(l => (
									<tr key={l.id}>
										<td>{l.name}</td>
										<td>{l.latitude?.toFixed(6)}</td>
										<td>{l.longitude?.toFixed(6)}</td>
										<td>{l.radiusMeters}</td>
										<td>{l.active ? <span className="badge badge-success">Yes</span> : <span className="badge badge-danger">No</span>}</td>
										<td>
											<div className="d-flex gap-1">
												<button className="btn btn-sm btn-outline-primary" onClick={() => handleLocEdit(l)}><i className="ti ti-edit"></i></button>
												<button className="btn btn-sm btn-outline-danger" onClick={() => handleLocDelete(l.id)}><i className="ti ti-trash"></i></button>
											</div>
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				</div>
			</div>
		</div>
	</div>
	)}
	
	{/* Location Picker Modal */}
	<LocationPickerModal
		show={locationModalVisible}
		onClose={() => setLocationModalVisible(false)}
		radiusMeters={Number(locForm.radiusMeters) || 50}
		onRadiusChange={(value) =>
			setLocForm((p) => ({
				...p,
				radiusMeters: value,
			}))
		}
		initialLocation={
			locForm.latitude && locForm.longitude
				? { latitude: parseFloat(locForm.latitude), longitude: parseFloat(locForm.longitude) }
				: null
		}
		onSelectLocation={(location) => {
			setLocForm((p) => ({
				...p,
				latitude: location.latitude,
				longitude: location.longitude,
			}));
		}}
	/>
	</>
	)}
	</div>
    </>
  );
};

export default ScheduleTimingPage;
