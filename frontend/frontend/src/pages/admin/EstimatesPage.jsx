import React from "react";
import { Link } from "react-router-dom";

const EstimatesPage = () => {
  return (
    <>
      <div className="content">
        {/* Breadcrumb */}
				<div className="d-md-flex d-block align-items-center justify-content-between page-breadcrumb mb-3">
					<div className="my-auto mb-2">
						<h2 className="mb-1">Estimates</h2>
						<nav>
							<ol className="breadcrumb mb-0">
								<li className="breadcrumb-item">
									<Link to="/dashboard"><i className="ti ti-smart-home"></i></Link>
								</li>
								<li className="breadcrumb-item">
									HR
								</li>
								<li className="breadcrumb-item active" aria-current="page">Estimates</li>
							</ol>
						</nav>
					</div>
					<div className="d-flex my-xl-auto right-content align-items-center flex-wrap ">

						<div className="mb-2">
							<Link to="#" className="btn btn-primary d-flex align-items-center" data-bs-toggle="modal" data-bs-target="#add_estimate"><i className="ti ti-circle-plus me-2"></i>Add Estimates</Link>
						</div>
						<div className="head-icons ms-2">
							<Link to="#" className="" data-bs-toggle="tooltip" data-bs-placement="top" data-bs-original-title="Collapse" id="collapse-header">
								<i className="ti ti-chevrons-up"></i>
							</Link>
						</div>
					</div>
				</div>
				{/* /Breadcrumb */}

				<div className="card">
					<div className="card-header d-flex align-items-center justify-content-between flex-wrap row-gap-3">
						<h5>Estimates List</h5>
						<div className="d-flex my-xl-auto right-content align-items-center flex-wrap row-gap-3">

							<div className="dropdown me-3">
								<Link to="#" className="dropdown-toggle btn btn-white d-inline-flex align-items-center" data-bs-toggle="dropdown">
									Select Status
								</Link>
								<ul className="dropdown-menu  dropdown-menu-end p-3">
									<li>
										<Link to="#" className="dropdown-item rounded-1">Accepted</Link>
									</li>
									<li>
										<Link to="#" className="dropdown-item rounded-1">sent</Link>
									</li>
									<li>
										<Link to="#" className="dropdown-item rounded-1">Expired</Link>
									</li>
									<li>
										<Link to="#" className="dropdown-item rounded-1">Declined</Link>
									</li>
								</ul>
							</div>
							<div className="dropdown">
								<Link to="#" className="dropdown-toggle btn btn-white d-inline-flex align-items-center" data-bs-toggle="dropdown">
									Sort By : Last 7 Days
								</Link>
								<ul className="dropdown-menu  dropdown-menu-end p-3">
									<li>
										<Link to="#" className="dropdown-item rounded-1">Recently Added</Link>
									</li>
									<li>
										<Link to="#" className="dropdown-item rounded-1">Ascending</Link>
									</li>
									<li>
										<Link to="#" className="dropdown-item rounded-1">Desending</Link>
									</li>
									<li>
										<Link to="#" className="dropdown-item rounded-1">Last Month</Link>
									</li>
									<li>
										<Link to="#" className="dropdown-item rounded-1">Last 7 Days</Link>
									</li>
								</ul>
							</div>
						</div>
					</div>
					<div className="card-body p-0">
						<div className="custom-datatable-filter table-responsive">
							<table className="table datatable">
								<thead className="thead-light">
									<tr>
										<th className="no-sort">
											<div className="form-check form-check-md">
												<input className="form-check-input" type="checkbox" id="select-all" />
											</div>
										</th>
										<th>Client Name</th>
										<th>Company Name</th>
										<th>Estimate Date</th>
										<th>Expiry Date</th>
										<th>Amount</th>
										<th>Status</th>
										<th></th>
									</tr>
								</thead>
								<tbody>
									<tr>
										<td>
											<div className="form-check form-check-md">
												<input className="form-check-input" type="checkbox" />
											</div>
										</td>
										<td>
											<div className="d-flex align-items-center file-name-icon">
												<Link to="#" className="avatar avatar-md avatar-rounded">
													<img src="/assets/img/users/user-09.jpg" className="img-fluid" alt="img" />
												</Link>
												<div className="ms-2">
													<h6 className="fw-medium"><Link to="#">Michael Walker</Link></h6>
													<span className="d-block mt-1">CEO</span>
												</div>
											</div>
										</td>
										<td>BrightWave Innovations</td>
										<td>14 Jan 2024</td>
										<td>15 Jan 2024</td>
										<td>$3000</td>
										<td><span className="badge badge-success">Accepted</span></td>
										<td>
											<div className="action-icon d-inline-flex">
												<Link to="#" className="me-2" data-bs-toggle="modal" data-bs-target="#edit_estimate"><i className="ti ti-edit"></i></Link>
												<Link to="#" data-bs-toggle="modal" data-bs-target="#delete_modal"><i className="ti ti-trash"></i></Link>
											</div>
										</td>
									</tr>
									<tr>
										<td>
											<div className="form-check form-check-md">
												<input className="form-check-input" type="checkbox" />
											</div>
										</td>
										<td>
											<div className="d-flex align-items-center file-name-icon">
												<Link to="#" className="avatar avatar-md avatar-rounded">
													<img src="/assets/img/users/user-40.jpg" className="img-fluid" alt="img" />
												</Link>
												<div className="ms-2">
													<h6 className="fw-medium"><Link to="#">Sophie Headrick</Link></h6>
													<span className="d-block mt-1">Manager</span>
												</div>
											</div>
										</td>
										<td>Stellar Dynamics</td>
										<td>21 Jan 2024</td>
										<td>25 Jan 2024</td>
										<td>$2500</td>
										<td><span className="badge badge-soft-purple">Sent</span></td>
										<td>
											<div className="action-icon d-inline-flex">
												<Link to="#" className="me-2" data-bs-toggle="modal" data-bs-target="#edit_estimate"><i className="ti ti-edit"></i></Link>
												<Link to="#" data-bs-toggle="modal" data-bs-target="#delete_modal"><i className="ti ti-trash"></i></Link>
											</div>
										</td>
									</tr>
									<tr>
										<td>
											<div className="form-check form-check-md">
												<input className="form-check-input" type="checkbox" />
											</div>
										</td>
										<td>
											<div className="d-flex align-items-center file-name-icon">
												<Link to="#" className="avatar avatar-md avatar-rounded">
													<img src="/assets/img/users/user-41.jpg" className="img-fluid" alt="img" />
												</Link>
												<div className="ms-2">
													<h6 className="fw-medium"><Link to="#">Cameron Drake</Link></h6>
													<span className="d-block mt-1">Director</span>
												</div>
											</div>
										</td>
										<td>Quantum Nexus</td>
										<td>20 Feb 2024</td>
										<td>22 Feb 2024</td>
										<td>$2800</td>
										<td><span className="badge badge-soft-warning">Expired</span></td>
										<td>
											<div className="action-icon d-inline-flex">
												<Link to="#" className="me-2" data-bs-toggle="modal" data-bs-target="#edit_estimate"><i className="ti ti-edit"></i></Link>
												<Link to="#" data-bs-toggle="modal" data-bs-target="#delete_modal"><i className="ti ti-trash"></i></Link>
											</div>
										</td>
									</tr>
									<tr>
										<td>
											<div className="form-check form-check-md">
												<input className="form-check-input" type="checkbox" />
											</div>
										</td>
										<td>
											<div className="d-flex align-items-center file-name-icon">
												<Link to="#" className="avatar avatar-md avatar-rounded">
													<img src="/assets/img/users/user-42.jpg" className="img-fluid" alt="img" />
												</Link>
												<div className="ms-2">
													<h6 className="fw-medium"><Link to="#">Doris Crowley</Link></h6>
													<span className="d-block mt-1">Consultant</span>
												</div>
											</div>
										</td>
										<td>EcoVision Enterprises</td>
										<td>15 Mar 2024</td>
										<td>17 Mar 2024</td>
										<td>$3300</td>
										<td><span className="badge badge-soft-success">Accepted</span></td>
										<td>
											<div className="action-icon d-inline-flex">
												<Link to="#" className="me-2" data-bs-toggle="modal" data-bs-target="#edit_estimate"><i className="ti ti-edit"></i></Link>
												<Link to="#" data-bs-toggle="modal" data-bs-target="#delete_modal"><i className="ti ti-trash"></i></Link>
											</div>
										</td>
									</tr>
									<tr>
										<td>
											<div className="form-check form-check-md">
												<input className="form-check-input" type="checkbox" />
											</div>
										</td>
										<td>
											<div className="d-flex align-items-center file-name-icon">
												<Link to="#" className="avatar avatar-md avatar-rounded">
													<img src="/assets/img/users/user-44.jpg" className="img-fluid" alt="img" />
												</Link>
												<div className="ms-2">
													<h6 className="fw-medium"><Link to="#">Thomas Bordelon</Link></h6>
													<span className="d-block mt-1">Manager</span>
												</div>
											</div>
										</td>
										<td>Aurora Technologies</td>
										<td>12 Apr 2024</td>
										<td>16 Apr 2024</td>
										<td>$3600</td>
										<td><span className="badge badge-soft-danger">Declined</span></td>
										<td>
											<div className="action-icon d-inline-flex">
												<Link to="#" className="me-2" data-bs-toggle="modal" data-bs-target="#edit_estimate"><i className="ti ti-edit"></i></Link>
												<Link to="#" data-bs-toggle="modal" data-bs-target="#delete_modal"><i className="ti ti-trash"></i></Link>
											</div>
										</td>
									</tr>
									<tr>
										<td>
											<div className="form-check form-check-md">
												<input className="form-check-input" type="checkbox" />
											</div>
										</td>
										<td>
											<div className="d-flex align-items-center file-name-icon">
												<Link to="#" className="avatar avatar-md avatar-rounded">
													<img src="/assets/img/users/user-45.jpg" className="img-fluid" alt="img" />
												</Link>
												<div className="ms-2">
													<h6 className="fw-medium"><Link to="#">Kathleen Gutierrez</Link></h6>
													<span className="d-block mt-1">Director</span>
												</div>
											</div>
										</td>
										<td>BlueSky Ventures</td>
										<td>20 May 2024</td>
										<td>21 May 2024</td>
										<td>$2000</td>
										<td><span className="badge badge-soft-purple">sent</span></td>
										<td>
											<div className="action-icon d-inline-flex">
												<Link to="#" className="me-2"><i className="ti ti-edit"></i></Link>
												<Link to="#" data-bs-toggle="modal" data-bs-target="#delete_modal"><i className="ti ti-trash"></i></Link>
											</div>
										</td>
									</tr>
									<tr>
										<td>
											<div className="form-check form-check-md">
												<input className="form-check-input" type="checkbox" />
											</div>
										</td>
										<td>
											<div className="d-flex align-items-center file-name-icon">
												<Link to="#" className="avatar avatar-md avatar-rounded">
													<img src="/assets/img/users/user-46.jpg" className="img-fluid" alt="img" />
												</Link>
												<div className="ms-2">
													<h6 className="fw-medium"><Link to="#">Bruce Wright</Link></h6>
													<span className="d-block mt-1">CEO</span>
												</div>
											</div>
										</td>
										<td>TerraFusion Energy</td>
										<td>06 Jul 2024</td>
										<td>06 Jul 2024</td>
										<td>$3400</td>
										<td><span className="badge badge-soft-warning">Expired</span></td>
										<td>
											<div className="action-icon d-inline-flex">
												<Link to="#" className="me-2" data-bs-toggle="modal" data-bs-target="#edit_estimate"><i className="ti ti-edit"></i></Link>
												<Link to="#" data-bs-toggle="modal" data-bs-target="#delete_modal"><i className="ti ti-trash"></i></Link>
											</div>
										</td>
									</tr>
									<tr>
										<td>
											<div className="form-check form-check-md">
												<input className="form-check-input" type="checkbox" />
											</div>
										</td>
										<td>
											<div className="d-flex align-items-center file-name-icon">
												<Link to="#" className="avatar avatar-md avatar-rounded">
													<img src="/assets/img/users/user-47.jpg" className="img-fluid" alt="img" />
												</Link>
												<div className="ms-2">
													<h6 className="fw-medium"><Link to="#">Estelle Morgan</Link></h6>
													<span className="d-block mt-1">Manager</span>
												</div>
											</div>
										</td>
										<td>UrbanPulse Design</td>
										<td>02 Sep 2024</td>
										<td>04 Sep 2024</td>
										<td>$4000</td>
										<td><span className="badge badge-soft-danger">Declined</span></td>
										<td>
											<div className="action-icon d-inline-flex">
												<Link to="#" className="me-2" data-bs-toggle="modal" data-bs-target="#edit_estimate"><i className="ti ti-edit"></i></Link>
												<Link to="#" data-bs-toggle="modal" data-bs-target="#delete_modal"><i className="ti ti-trash"></i></Link>
											</div>
										</td>
									</tr>
									<tr>
										<td>
											<div className="form-check form-check-md">
												<input className="form-check-input" type="checkbox" />
											</div>
										</td>
										<td>
											<div className="d-flex align-items-center file-name-icon">
												<Link to="#" className="avatar avatar-md avatar-rounded">
													<img src="/assets/img/users/user-48.jpg" className="img-fluid" alt="img" />
												</Link>
												<div className="ms-2">
													<h6 className="fw-medium"><Link to="#">Stephen Dias</Link></h6>
													<span className="d-block mt-1">CEO</span>
												</div>
											</div>
										</td>
										<td>Nimbus Networks</td>
										<td>15 Nov 2024</td>
										<td>15 Nov 2024</td>
										<td>$4500</td>
										<td><span className="badge badge-soft-success">Accepted</span></td>
										<td>
											<div className="action-icon d-inline-flex">
												<Link to="#" className="me-2" data-bs-toggle="modal" data-bs-target="#edit_estimate"><i className="ti ti-edit"></i></Link>
												<Link to="#" data-bs-toggle="modal" data-bs-target="#delete_modal"><i className="ti ti-trash"></i></Link>
											</div>
										</td>
									</tr>
									<tr>
										<td>
											<div className="form-check form-check-md">
												<input className="form-check-input" type="checkbox" />
											</div>
										</td>
										<td>
											<div className="d-flex align-items-center file-name-icon">
												<Link to="#" className="avatar avatar-md avatar-rounded">
													<img src="/assets/img/users/user-43.jpg" className="img-fluid" alt="img" />
												</Link>
												<div className="ms-2">
													<h6 className="fw-medium"><Link to="#">Angela Thomas</Link></h6>
													<span className="d-block mt-1">Consultant</span>
												</div>
											</div>
										</td>
										<td>Epicurean Delights</td>
										<td>10 Dec 2024</td>
										<td>11 Dec 2024</td>
										<td>$3800</td>
										<td><span className="badge badge-soft-purple">sent</span></td>
										<td>
											<div className="action-icon d-inline-flex">
												<Link to="#" className="me-2" data-bs-toggle="modal" data-bs-target="#edit_estimate"><i className="ti ti-edit"></i></Link>
												<Link to="#" data-bs-toggle="modal" data-bs-target="#delete_modal"><i className="ti ti-trash"></i></Link>
											</div>
										</td>
									</tr>


								</tbody>
							</table>
						</div>
					</div>
				</div>
      </div>

      {/* Add Estimate  */}
		<div className="modal fade" id="add_estimate">
			<div className="modal-dialog modal-dialog-centered modal-lg">
				<div className="modal-content">
					<div className="modal-header">
						<h4 className="modal-title">Add New Estimate</h4>
						<button type="button" className="btn-close custom-btn-close" data-bs-dismiss="modal" aria-label="Close">
							<i className="ti ti-x"></i>
						</button>
					</div>
					<form action="estimates.php">
						<div className="modal-body pb-0">
							<div className="row">
								<div className="col-md-6">
									<div className="mb-3">
										<label className="form-label">Client <span className="text-danger"> *</span></label>
										<select className="select">
											<option>Select</option>
											<option>Michael Walker</option>
											<option>Sophie Headrick</option>
											<option>Cameron Drake</option>
										</select>
									</div>
								</div>
								<div className="col-md-6">
									<div className="mb-3">
										<label className="form-label">Project <span className="text-danger"> *</span></label>
										<select className="select">
											<option>Select</option>
											<option>Project Management</option>
											<option>Office Management</option>
										</select>
									</div>
								</div>
								<div className="col-md-6">
									<div className="mb-3">
										<label className="form-label">Email <span className="text-danger"> *</span></label>
										<input type="email" className="form-control" />
									</div>
								</div>
								<div className="col-md-6">
									<div className="mb-3">
										<label className="form-label">Tax <span className="text-danger"> *</span></label>
										<select className="select">
											<option>Select</option>
											<option>VAT</option>
											<option>GST</option>
											<option>No Tax</option>
										</select>
									</div>
								</div>
								<div className="col-md-6">
									<div className="mb-3">
										<label className="form-label">Client Address</label>
										<textarea className="form-control" rows="3"></textarea>
									</div>
								</div>
								<div className="col-md-6">
									<div className="mb-3">
										<label className="form-label">Biling Address</label>
										<textarea className="form-control" rows="3"></textarea>
									</div>
								</div>
								<div className="col-md-6">
									<div className="mb-3">
										<label className="form-label">Estimate Date</label>
										<div className="input-icon position-relative w-100 me-2">
											<span className="input-icon-addon">
												<i className="ti ti-calendar"></i>
											</span>
											<input type="text" className="form-control datetimepicker" placeholder="dd/mm/yyyy" />
										</div>
									</div>
								</div>
								<div className="col-md-6">
									<div className="mb-3">
										<label className="form-label">Expiry Date</label>
										<div className="input-icon position-relative w-100 me-2">
											<span className="input-icon-addon">
												<i className="ti ti-calendar"></i>
											</span>
											<input type="text" className="form-control datetimepicker" placeholder="dd/mm/yyyy" />
										</div>
									</div>
								</div>
							</div>
							<div className="mb-3">
								<h4 className="mb-2">Add Items</h4>
								<div className="border rounded p-3 mb-3">
									<div className="add-estimate-info">
										<div className="row">
											<div className="col-md-2">
												<div className="mb-3">
													<label className="form-label">Item</label>
													<input type="text" className="form-control" />
												</div>
											</div>

											<div className="col-md-4">
												<div className="mb-3">
													<label className="form-label">Description</label>
													<input type="text" className="form-control" />
												</div>
											</div>
											<div className="col-md-2">
												<div className="mb-3">
													<label className="form-label">Unit Cost</label>
													<input type="text" className="form-control" />
												</div>
											</div>
											<div className="col-md-2">
												<div className="mb-3">
													<label className="form-label">Qty</label>
													<input type="text" className="form-control" />
												</div>
											</div>
											<div className="col-md-2">
												<div className="mb-3">
													<label className="form-label">Amount</label>
													<input type="text" className="form-control" />
												</div>
											</div>
										</div>
									</div>
									<Link to="#" className="text-primary add-more-estimate fw-medium d-flex align-items-center mb-2"><i className="ti ti-plus me-2"></i>Add New Item</Link>
									<div className="row">
										<div className="col-md-6">
											<div className="mb-3">
												<label className="form-label">Total </label>
												<input type="text" className="form-control" />
											</div>
										</div>
										<div className="col-md-6">
											<div className="mb-3">
												<label className="form-label">Tax </label>
												<input type="text" className="form-control" />
											</div>
										</div>
										<div className="col-md-6">
											<div className="mb-3">
												<label className="form-label">Discount(%) </label>
												<input type="text" className="form-control" />
											</div>
										</div>
										<div className="col-md-6">
											<div className="mb-3">
												<label className="form-label">Grand Total </label>
												<input type="text" className="form-control" />
											</div>
										</div>
									</div>
								</div>
							</div>
							<div className="col-md-12">
								<div className="mb-3">
									<label className="form-label">Other Information</label>
									<textarea className="form-control" rows="3"></textarea>
								</div>
							</div>
						</div>
						<div className="modal-footer">
							<button type="button" className="btn btn-light me-2" data-bs-dismiss="modal">Cancel</button>
							<button type="submit" className="btn btn-primary">Add Estimate</button>
						</div>
					</form>
				</div>
			</div>
		</div>
		{/* /Add Estimate */}

		{/* Add Estimate  */}
		<div className="modal fade" id="edit_estimate">
			<div className="modal-dialog modal-dialog-centered modal-lg">
				<div className="modal-content">
					<div className="modal-header">
						<h4 className="modal-title">Edit Estimate</h4>
						<button type="button" className="btn-close custom-btn-close" data-bs-dismiss="modal" aria-label="Close">
							<i className="ti ti-x"></i>
						</button>
					</div>
					<form action="estimates.php">
						<div className="modal-body pb-0">
							<div className="row">
								<div className="col-md-6">
									<div className="mb-3">
										<label className="form-label">Client <span className="text-danger"> *</span></label>
										<select className="select">
											<option>Select</option>
											<option defaultValue>Michael Walker</option>
											<option>Sophie Headrick</option>
											<option>Cameron Drake</option>
										</select>
									</div>
								</div>
								<div className="col-md-6">
									<div className="mb-3">
										<label className="form-label">Project <span className="text-danger"> *</span></label>
										<select className="select">
											<option>Select</option>
											<option defaultValue>Project Management</option>
											<option>Office Management</option>
										</select>
									</div>
								</div>
								<div className="col-md-6">
									<div className="mb-3">
										<label className="form-label">Email <span className="text-danger"> *</span></label>
										<input type="email" className="form-control" defaultValue="michaelwalker@example.com" />
									</div>
								</div>
								<div className="col-md-6">
									<div className="mb-3">
										<label className="form-label">Tax <span className="text-danger"> *</span></label>
										<select className="select">
											<option>Select</option>
											<option defaultValue>VAT</option>
											<option>GST</option>
											<option>No Tax</option>
										</select>
									</div>
								</div>
								<div className="col-md-6">
									<div className="mb-3">
										<label className="form-label">Client Address</label>
										<textarea className="form-control" rows="3"></textarea>
									</div>
								</div>
								<div className="col-md-6">
									<div className="mb-3">
										<label className="form-label">Biling Address</label>
										<textarea className="form-control" rows="3"></textarea>
									</div>
								</div>
								<div className="col-md-6">
									<div className="mb-3">
										<label className="form-label">Estimate Date</label>
										<div className="input-icon position-relative w-100 me-2">
											<span className="input-icon-addon">
												<i className="ti ti-calendar"></i>
											</span>
											<input type="text" className="form-control datetimepicker" placeholder="dd/mm/yyyy" />
										</div>
									</div>
								</div>
								<div className="col-md-6">
									<div className="mb-3">
										<label className="form-label">Expiry Date</label>
										<div className="input-icon position-relative w-100 me-2">
											<span className="input-icon-addon">
												<i className="ti ti-calendar"></i>
											</span>
											<input type="text" className="form-control datetimepicker" placeholder="dd/mm/yyyy" />
										</div>
									</div>
								</div>
							</div>
							<div className="mb-3">
								<h4 className="mb-2">Add Items</h4>
								<div className="border rounded p-3 mb-3">
									<div className="add-estimate-info">
										<div className="row">
											<div className="col-md-2">
												<div className="mb-3">
													<label className="form-label">Item</label>
													<input type="text" className="form-control" />
												</div>
											</div>

											<div className="col-md-4">
												<div className="mb-3">
													<label className="form-label">Description</label>
													<input type="text" className="form-control" />
												</div>
											</div>
											<div className="col-md-2">
												<div className="mb-3">
													<label className="form-label">Unit Cost</label>
													<input type="text" className="form-control" />
												</div>
											</div>
											<div className="col-md-2">
												<div className="mb-3">
													<label className="form-label">Qty</label>
													<input type="text" className="form-control" />
												</div>
											</div>
											<div className="col-md-2">
												<div className="mb-3">
													<label className="form-label">Amount</label>
													<input type="text" className="form-control" />
												</div>
											</div>
										</div>
									</div>
									<Link to="#" className="text-primary add-more-estimate fw-medium d-flex align-items-center mb-2"><i className="ti ti-plus me-2"></i>Add New Item</Link>
									<div className="row">
										<div className="col-md-6">
											<div className="mb-3">
												<label className="form-label">Total </label>
												<input type="text" className="form-control" />
											</div>
										</div>
										<div className="col-md-6">
											<div className="mb-3">
												<label className="form-label">Tax </label>
												<input type="text" className="form-control" />
											</div>
										</div>
										<div className="col-md-6">
											<div className="mb-3">
												<label className="form-label">Discount(%) </label>
												<input type="text" className="form-control" />
											</div>
										</div>
										<div className="col-md-6">
											<div className="mb-3">
												<label className="form-label">Grand Total </label>
												<input type="text" className="form-control" />
											</div>
										</div>
									</div>
								</div>
							</div>
							<div className="col-md-12">
								<div className="mb-3">
									<label className="form-label">Other Information</label>
									<textarea className="form-control" rows="3"></textarea>
								</div>
							</div>
						</div>
						<div className="modal-footer">
							<button type="button" className="btn btn-light me-2" data-bs-dismiss="modal">Cancel</button>
							<button type="submit" className="btn btn-primary">Add Estimate</button>
						</div>
					</form>
				</div>
			</div>
		</div>
		{/* /Add Estimate */}

		{/* Delete Modal */}
		<div className="modal fade" id="delete_modal">
			<div className="modal-dialog modal-dialog-centered">
				<div className="modal-content">
					<div className="modal-body text-center">
						<span className="avatar avatar-xl bg-transparent-danger text-danger mb-3">
							<i className="ti ti-trash-x fs-36"></i>
						</span>
						<h4 className="mb-1">Confirm Delete</h4>
						<p className="mb-3">You want to delete all the marked items, this cant be undone once you delete.</p>
						<div className="d-flex justify-content-center">
							<Link to="#" className="btn btn-light me-3" data-bs-dismiss="modal">Cancel</Link>
							<Link to="/estimates" className="btn btn-danger">Yes, Delete</Link>
						</div>
					</div>
				</div>
			</div>
		</div>
		{/* /Delete Modal */}
    </>
  );
};

export default EstimatesPage;
