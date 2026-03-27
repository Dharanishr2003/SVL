import React from "react";
import { Link } from "react-router-dom";

const ProvidentFundPage = () => {
  return (
    <>
      <div className="content">
        {/* Breadcrumb */}
				<div className="d-md-flex d-block align-items-center justify-content-between page-breadcrumb mb-3">
					<div className="my-auto mb-2">
						<h2 className="mb-1">Provident Fund</h2>
						<nav>
							<ol className="breadcrumb mb-0">
								<li className="breadcrumb-item">
									<Link to="/dashboard"><i className="ti ti-smart-home"></i></Link>
								</li>
								<li className="breadcrumb-item">
									HR
								</li>
								<li className="breadcrumb-item active" aria-current="page">Provident Fund</li>
							</ol>
						</nav>
					</div>
					<div className="d-flex my-xl-auto right-content align-items-center flex-wrap ">

						<div className="me-2 mb-2">
							<div className="dropdown">
								<Link to="#" className="dropdown-toggle btn btn-white d-inline-flex align-items-center" data-bs-toggle="dropdown">
									<i className="ti ti-file-export me-1"></i>Export
								</Link>
								<ul className="dropdown-menu  dropdown-menu-end p-3">
									<li>
										<Link to="#" className="dropdown-item rounded-1"><i className="ti ti-file-type-pdf me-1"></i>Export as PDF</Link>
									</li>
									<li>
										<Link to="#" className="dropdown-item rounded-1"><i className="ti ti-file-type-xls me-1"></i>Export as Excel </Link>
									</li>
								</ul>
							</div>
						</div>

						<div className="mb-2">
							<Link to="#" data-bs-toggle="modal" data-bs-target="#add_provident-fund" className="btn btn-primary d-flex align-items-center"><i className="ti ti-circle-plus me-2"></i>Add New Provident Fund</Link>
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
						<h5>Expenses List</h5>
						<div className="d-flex my-xl-auto right-content align-items-center flex-wrap row-gap-3">
							<div className="me-3">
								<div className="input-icon-end position-relative">
									<input type="text" className="form-control date-range bookingrange" placeholder="dd/mm/yyyy - dd/mm/yyyy" />
									<span className="input-icon-addon">
										<i className="ti ti-chevron-down"></i>
									</span>
								</div>
							</div>
							<div className="dropdown me-3">
								<Link to="#" className="dropdown-toggle btn btn-white d-inline-flex align-items-center" data-bs-toggle="dropdown">
									Select status
								</Link>
								<ul className="dropdown-menu  dropdown-menu-end p-3">
									<li>
										<Link to="#" className="dropdown-item rounded-1">Approved</Link>
									</li>
									<li>
										<Link to="#" className="dropdown-item rounded-1">Pending</Link>
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
										<th>Employee Name</th>
										<th>Provident Fund Type</th>
										<th>Employee Share</th>
										<th>Organization Share</th>
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
													<img src="/assets/img/users/user-32.jpg" className="img-fluid" alt="img" />
												</Link>
												<div className="ms-2">
													<h6 className="fw-medium"><Link to="#">Anthony Lewis</Link></h6>
													<span className="d-block mt-1">Finance</span>
												</div>
											</div>
										</td>
										<td>Employee Provident Fund</td>
										<td>2%</td>
										<td>2%</td>
										<td>
											<div className="dropdown">
												<Link to="#" className="dropdown-toggle btn btn-white d-inline-flex align-items-center" data-bs-toggle="dropdown">
													<span className="rounded-circle bg-transparent-success d-flex justify-content-center align-items-center me-2"><i className="ti ti-point-filled text-success"></i></span> Approved
												</Link>
												<ul className="dropdown-menu  dropdown-menu-end p-3">
													<li>
														<Link to="#" className="dropdown-item rounded-1 d-flex justify-content-start align-items-center"><span className="rounded-circle bg-transparent-success d-flex justify-content-center align-items-center me-2"><i className="ti ti-point-filled text-success"></i></span>Approved</Link>
													</li>
													<li>
														<Link to="#" className="dropdown-item rounded-1 d-flex justify-content-start align-items-center"><span className="rounded-circle bg-transparent-skyblue d-flex justify-content-center align-items-center me-2"><i className="ti ti-point-filled text-skyblue"></i></span>Pending </Link>
													</li>
												</ul>
											</div>
										</td>
										<td>
											<div className="action-icon d-inline-flex">
												<Link to="#" className="me-2" data-bs-toggle="modal" data-bs-target="#edit_provident-fund"><i className="ti ti-edit"></i></Link>
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
													<img src="/assets/img/users/user-09.jpg" className="img-fluid" alt="img" />
												</Link>
												<div className="ms-2">
													<h6 className="fw-medium"><Link to="#">Brian Villalobos</Link></h6>
													<span className="d-block mt-1">Developer</span>
												</div>
											</div>
										</td>
										<td>Employee Provident Fund</td>
										<td>2%</td>
										<td>2%</td>
										<td>
											<div className="dropdown">
												<Link to="#" className="dropdown-toggle btn btn-white d-inline-flex align-items-center" data-bs-toggle="dropdown">
													<span className="rounded-circle bg-transparent-info d-flex justify-content-center align-items-center me-2"><i className="ti ti-point-filled text-success"></i></span> Pending
												</Link>
												<ul className="dropdown-menu  dropdown-menu-end p-3">
													<li>
														<Link to="#" className="dropdown-item rounded-1 d-flex justify-content-start align-items-center"><span className="rounded-circle bg-transparent-success d-flex justify-content-center align-items-center me-2"><i className="ti ti-point-filled text-success"></i></span>Approved</Link>
													</li>
													<li>
														<Link to="#" className="dropdown-item rounded-1 d-flex justify-content-start align-items-center"><span className="rounded-circle bg-transparent-skyblue d-flex justify-content-center align-items-center me-2"><i className="ti ti-point-filled text-skyblue"></i></span>Pending </Link>
													</li>
												</ul>
											</div>
										</td>
										<td>
											<div className="action-icon d-inline-flex">
												<Link to="#" className="me-2" data-bs-toggle="modal" data-bs-target="#edit_provident-fund"><i className="ti ti-edit"></i></Link>
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
													<img src="/assets/img/users/user-01.jpg" className="img-fluid" alt="img" />
												</Link>
												<div className="ms-2">
													<h6 className="fw-medium"><Link to="#">Harvey Smith</Link></h6>
													<span className="d-block mt-1">Developer</span>
												</div>
											</div>
										</td>
										<td>Voluntary Provident Fund</td>
										<td>5%</td>
										<td>2%</td>
										<td>
											<div className="dropdown">
												<Link to="#" className="dropdown-toggle btn btn-white d-inline-flex align-items-center" data-bs-toggle="dropdown">
													<span className="rounded-circle bg-transparent-success d-flex justify-content-center align-items-center me-2"><i className="ti ti-point-filled text-success"></i></span> Approved
												</Link>
												<ul className="dropdown-menu  dropdown-menu-end p-3">
													<li>
														<Link to="#" className="dropdown-item rounded-1 d-flex justify-content-start align-items-center"><span className="rounded-circle bg-transparent-success d-flex justify-content-center align-items-center me-2"><i className="ti ti-point-filled text-success"></i></span>Approved</Link>
													</li>
													<li>
														<Link to="#" className="dropdown-item rounded-1 d-flex justify-content-start align-items-center"><span className="rounded-circle bg-transparent-skyblue d-flex justify-content-center align-items-center me-2"><i className="ti ti-point-filled text-skyblue"></i></span>Pending </Link>
													</li>
												</ul>
											</div>
										</td>
										<td>
											<div className="action-icon d-inline-flex">
												<Link to="#" className="me-2" data-bs-toggle="modal" data-bs-target="#edit_provident-fund"><i className="ti ti-edit"></i></Link>
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
													<img src="/assets/img/users/user-33.jpg" className="img-fluid" alt="img" />
												</Link>
												<div className="ms-2">
													<h6 className="fw-medium"><Link to="#">Stephan Peralt</Link></h6>
													<span className="d-block mt-1">Executive Officer</span>
												</div>
											</div>
										</td>
										<td>Voluntary Provident Fund</td>
										<td>3%</td>
										<td>2%</td>
										<td>
											<div className="dropdown">
												<Link to="#" className="dropdown-toggle btn btn-white d-inline-flex align-items-center" data-bs-toggle="dropdown">
													<span className="rounded-circle bg-transparent-info d-flex justify-content-center align-items-center me-2"><i className="ti ti-point-filled text-success"></i></span> Pending
												</Link>
												<ul className="dropdown-menu  dropdown-menu-end p-3">
													<li>
														<Link to="#" className="dropdown-item rounded-1 d-flex justify-content-start align-items-center"><span className="rounded-circle bg-transparent-success d-flex justify-content-center align-items-center me-2"><i className="ti ti-point-filled text-success"></i></span>Approved</Link>
													</li>
													<li>
														<Link to="#" className="dropdown-item rounded-1 d-flex justify-content-start align-items-center"><span className="rounded-circle bg-transparent-skyblue d-flex justify-content-center align-items-center me-2"><i className="ti ti-point-filled text-skyblue"></i></span>Pending </Link>
													</li>
												</ul>
											</div>
										</td>
										<td>
											<div className="action-icon d-inline-flex">
												<Link to="#" className="me-2" data-bs-toggle="modal" data-bs-target="#edit_provident-fund"><i className="ti ti-edit"></i></Link>
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
													<img src="/assets/img/users/user-34.jpg" className="img-fluid" alt="img" />
												</Link>
												<div className="ms-2">
													<h6 className="fw-medium"><Link to="#">Doglas Martini</Link></h6>
													<span className="d-block mt-1">Manager</span>
												</div>
											</div>
										</td>
										<td>Employee Provident Fund</td>
										<td>2%</td>
										<td>2%</td>
										<td>
											<div className="dropdown">
												<Link to="#" className="dropdown-toggle btn btn-white d-inline-flex align-items-center" data-bs-toggle="dropdown">
													<span className="rounded-circle bg-transparent-success d-flex justify-content-center align-items-center me-2"><i className="ti ti-point-filled text-success"></i></span> Approved
												</Link>
												<ul className="dropdown-menu  dropdown-menu-end p-3">
													<li>
														<Link to="#" className="dropdown-item rounded-1 d-flex justify-content-start align-items-center"><span className="rounded-circle bg-transparent-success d-flex justify-content-center align-items-center me-2"><i className="ti ti-point-filled text-success"></i></span>Approved</Link>
													</li>
													<li>
														<Link to="#" className="dropdown-item rounded-1 d-flex justify-content-start align-items-center"><span className="rounded-circle bg-transparent-skyblue d-flex justify-content-center align-items-center me-2"><i className="ti ti-point-filled text-skyblue"></i></span>Pending </Link>
													</li>
												</ul>
											</div>
										</td>
										<td>
											<div className="action-icon d-inline-flex">
												<Link to="#" className="me-2" data-bs-toggle="modal" data-bs-target="#edit_provident-fund"><i className="ti ti-edit"></i></Link>
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
													<img src="/assets/img/users/user-02.jpg" className="img-fluid" alt="img" />
												</Link>
												<div className="ms-2">
													<h6 className="fw-medium"><Link to="#">Linda Ray</Link></h6>
													<span className="d-block mt-1">Finance</span>
												</div>
											</div>
										</td>
										<td>Employee Provident Fund</td>
										<td>2%</td>
										<td>2%</td>
										<td>
											<div className="dropdown">
												<Link to="#" className="dropdown-toggle btn btn-white d-inline-flex align-items-center" data-bs-toggle="dropdown">
													<span className="rounded-circle bg-transparent-info d-flex justify-content-center align-items-center me-2"><i className="ti ti-point-filled text-success"></i></span> Pending
												</Link>
												<ul className="dropdown-menu  dropdown-menu-end p-3">
													<li>
														<Link to="#" className="dropdown-item rounded-1 d-flex justify-content-start align-items-center"><span className="rounded-circle bg-transparent-success d-flex justify-content-center align-items-center me-2"><i className="ti ti-point-filled text-success"></i></span>Approved</Link>
													</li>
													<li>
														<Link to="#" className="dropdown-item rounded-1 d-flex justify-content-start align-items-center"><span className="rounded-circle bg-transparent-skyblue d-flex justify-content-center align-items-center me-2"><i className="ti ti-point-filled text-skyblue"></i></span>Pending </Link>
													</li>
												</ul>
											</div>
										</td>
										<td>
											<div className="action-icon d-inline-flex">
												<Link to="#" className="me-2" data-bs-toggle="modal" data-bs-target="#edit_provident-fund"><i className="ti ti-edit"></i></Link>
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
													<img src="/assets/img/users/user-35.jpg" className="img-fluid" alt="img" />
												</Link>
												<div className="ms-2">
													<h6 className="fw-medium"><Link to="#">Elliot Murray</Link></h6>
													<span className="d-block mt-1">Developer</span>
												</div>
											</div>
										</td>
										<td>Voluntary Provident Fund</td>
										<td>6%</td>
										<td>2%</td>
										<td>
											<div className="dropdown">
												<Link to="#" className="dropdown-toggle btn btn-white d-inline-flex align-items-center" data-bs-toggle="dropdown">
													<span className="rounded-circle bg-transparent-success d-flex justify-content-center align-items-center me-2"><i className="ti ti-point-filled text-success"></i></span> Approved
												</Link>
												<ul className="dropdown-menu  dropdown-menu-end p-3">
													<li>
														<Link to="#" className="dropdown-item rounded-1 d-flex justify-content-start align-items-center"><span className="rounded-circle bg-transparent-success d-flex justify-content-center align-items-center me-2"><i className="ti ti-point-filled text-success"></i></span>Approved</Link>
													</li>
													<li>
														<Link to="#" className="dropdown-item rounded-1 d-flex justify-content-start align-items-center"><span className="rounded-circle bg-transparent-skyblue d-flex justify-content-center align-items-center me-2"><i className="ti ti-point-filled text-skyblue"></i></span>Pending </Link>
													</li>
												</ul>
											</div>
										</td>
										<td>
											<div className="action-icon d-inline-flex">
												<Link to="#" className="me-2" data-bs-toggle="modal" data-bs-target="#edit_provident-fund"><i className="ti ti-edit"></i></Link>
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
													<img src="/assets/img/users/user-36.jpg" className="img-fluid" alt="img" />
												</Link>
												<div className="ms-2">
													<h6 className="fw-medium"><Link to="#">Rebecca Smtih</Link></h6>
													<span className="d-block mt-1">Executive</span>
												</div>
											</div>
										</td>
										<td>Voluntary Provident Fund</td>
										<td>4%</td>
										<td>2%</td>
										<td>
											<div className="dropdown">
												<Link to="#" className="dropdown-toggle btn btn-white d-inline-flex align-items-center" data-bs-toggle="dropdown">
													<span className="rounded-circle bg-transparent-info d-flex justify-content-center align-items-center me-2"><i className="ti ti-point-filled text-success"></i></span> Pending
												</Link>
												<ul className="dropdown-menu  dropdown-menu-end p-3">
													<li>
														<Link to="#" className="dropdown-item rounded-1 d-flex justify-content-start align-items-center"><span className="rounded-circle bg-transparent-success d-flex justify-content-center align-items-center me-2"><i className="ti ti-point-filled text-success"></i></span>Approved</Link>
													</li>
													<li>
														<Link to="#" className="dropdown-item rounded-1 d-flex justify-content-start align-items-center"><span className="rounded-circle bg-transparent-skyblue d-flex justify-content-center align-items-center me-2"><i className="ti ti-point-filled text-skyblue"></i></span>Pending </Link>
													</li>
												</ul>
											</div>
										</td>
										<td>
											<div className="action-icon d-inline-flex">
												<Link to="#" className="me-2" data-bs-toggle="modal" data-bs-target="#edit_provident-fund"><i className="ti ti-edit"></i></Link>
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
													<img src="/assets/img/users/user-37.jpg" className="img-fluid" alt="img" />
												</Link>
												<div className="ms-2">
													<h6 className="fw-medium"><Link to="#">Connie Waters</Link></h6>
													<span className="d-block mt-1">Developer</span>
												</div>
											</div>
										</td>
										<td>Employee Provident Fund</td>
										<td>2%</td>
										<td>2%</td>
										<td>
											<div className="dropdown">
												<Link to="#" className="dropdown-toggle btn btn-white d-inline-flex align-items-center" data-bs-toggle="dropdown">
													<span className="rounded-circle bg-transparent-success d-flex justify-content-center align-items-center me-2"><i className="ti ti-point-filled text-success"></i></span> Approved
												</Link>
												<ul className="dropdown-menu  dropdown-menu-end p-3">
													<li>
														<Link to="#" className="dropdown-item rounded-1 d-flex justify-content-start align-items-center"><span className="rounded-circle bg-transparent-success d-flex justify-content-center align-items-center me-2"><i className="ti ti-point-filled text-success"></i></span>Approved</Link>
													</li>
													<li>
														<Link to="#" className="dropdown-item rounded-1 d-flex justify-content-start align-items-center"><span className="rounded-circle bg-transparent-skyblue d-flex justify-content-center align-items-center me-2"><i className="ti ti-point-filled text-skyblue"></i></span>Pending </Link>
													</li>
												</ul>
											</div>
										</td>
										<td>
											<div className="action-icon d-inline-flex">
												<Link to="#" className="me-2" data-bs-toggle="modal" data-bs-target="#edit_provident-fund"><i className="ti ti-edit"></i></Link>
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
													<img src="/assets/img/users/user-38.jpg" className="img-fluid" alt="img" />
												</Link>
												<div className="ms-2">
													<h6 className="fw-medium"><Link to="#">Lori Broaddus</Link></h6>
													<span className="d-block mt-1">Finance</span>
												</div>
											</div>
										</td>
										<td>Voluntary Provident Fund</td>
										<td>7%</td>
										<td>2%</td>
										<td>
											<div className="dropdown">
												<Link to="#" className="dropdown-toggle btn btn-white d-inline-flex align-items-center" data-bs-toggle="dropdown">
													<span className="rounded-circle bg-transparent-info d-flex justify-content-center align-items-center me-2"><i className="ti ti-point-filled text-success"></i></span> Pending
												</Link>
												<ul className="dropdown-menu  dropdown-menu-end p-3">
													<li>
														<Link to="#" className="dropdown-item rounded-1 d-flex justify-content-start align-items-center"><span className="rounded-circle bg-transparent-success d-flex justify-content-center align-items-center me-2"><i className="ti ti-point-filled text-success"></i></span>Approved</Link>
													</li>
													<li>
														<Link to="#" className="dropdown-item rounded-1 d-flex justify-content-start align-items-center"><span className="rounded-circle bg-transparent-skyblue d-flex justify-content-center align-items-center me-2"><i className="ti ti-point-filled text-skyblue"></i></span>Pending </Link>
													</li>
												</ul>
											</div>
										</td>
										<td>
											<div className="action-icon d-inline-flex">
												<Link to="#" className="me-2" data-bs-toggle="modal" data-bs-target="#edit_provident-fund"><i className="ti ti-edit"></i></Link>
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

      
		{/* /Page Wrapper */}

		{/* Add Promotion */}
		<div className="modal fade" id="add_provident-fund">
			<div className="modal-dialog modal-dialog-centered modal-md">
				<div className="modal-content">
					<div className="modal-header">
						<h4 className="modal-title">Add Provident Fund</h4>
						<button type="button" className="btn-close custom-btn-close" data-bs-dismiss="modal" aria-label="Close">
							<i className="ti ti-x"></i>
						</button>
					</div>
					<form action="provident-fund.php">
						<div className="modal-body pb-0">
							<div className="row">

								<div className="col-md-6">
									<div className="mb-3">
										<label className="form-label">Employee Name</label>
										<select className="select">
											<option>Select</option>
											<option>Anthony Lewis</option>
											<option>Brian Villalobos</option>
											<option>Harvey Smith</option>
										</select>
									</div>
								</div>
								<div className="col-md-6">
									<div className="mb-3">
										<label className="form-label">Provident Fund Type</label>
										<select className="select">
											<option>Select</option>
											<option>Employee Provident Fund</option>
											<option>Voluntary Provident Fund</option>
											<option>Employee Provident Fund</option>
										</select>
									</div>
								</div>
								<div className="col-md-6">
									<div className="mb-3">
										<label className="form-label">Employee Share(%)</label>
										<input type="text" className="form-control" />
									</div>
								</div>
								<div className="col-md-6">
									<div className="mb-3">
										<label className="form-label">Organization Share(%)</label>
										<input type="text" className="form-control" />
									</div>
								</div>

								<div className="col-md-6">
									<div className="mb-3">
										<label className="form-label">Employee Share(Amount)</label>
										<input type="text" className="form-control" />
									</div>
								</div>
								<div className="col-md-6">
									<div className="mb-3">
										<label className="form-label">Organization Share(Amount)</label>
										<input type="text" className="form-control" />
									</div>
								</div>
								<div className="col-md-12">
									<div className="mb-3">
										<label className="form-label">Description</label>
										<input type="text" className="form-control" />
									</div>
								</div>


							</div>
						</div>
						<div className="modal-footer">
							<button type="button" className="btn btn-white border me-2" data-bs-dismiss="modal">Cancel</button>
							<button type="submit" className="btn btn-primary">Add Provident Fund</button>
						</div>
					</form>
				</div>
			</div>
		</div>
		{/* /Add Promotion */}

		{/* Edit Promotion */}
		<div className="modal fade" id="edit_provident-fund">
			<div className="modal-dialog modal-dialog-centered modal-md">
				<div className="modal-content">
					<div className="modal-header">
						<h4 className="modal-title">Edit Provident Fund</h4>
						<button type="button" className="btn-close custom-btn-close" data-bs-dismiss="modal" aria-label="Close">
							<i className="ti ti-x"></i>
						</button>
					</div>
					<form action="provident-fund.php">
						<div className="modal-body pb-0">
							<div className="row">

								<div className="col-md-6">
									<div className="mb-3">
										<label className="form-label">Employee Name</label>
										<select className="select">
											<option>Select</option>
											<option defaultValue>Anthony Lewis</option>
											<option>Brian Villalobos</option>
											<option>Harvey Smith</option>
										</select>
									</div>
								</div>
								<div className="col-md-6">
									<div className="mb-3">
										<label className="form-label">Provident Fund Type</label>
										<select className="select">
											<option>Select</option>
											<option defaultValue>Employee Provident Fund</option>
											<option>Voluntary Provident Fund</option>
											<option>Employee Provident Fund</option>
										</select>
									</div>
								</div>
								<div className="col-md-6">
									<div className="mb-3">
										<label className="form-label">Employee Share(%)</label>
										<input type="text" className="form-control" defaultValue="2%" />
									</div>
								</div>
								<div className="col-md-6">
									<div className="mb-3">
										<label className="form-label">Organization Share(%)</label>
										<input type="text" className="form-control" defaultValue="2%" />
									</div>
								</div>

								<div className="col-md-6">
									<div className="mb-3">
										<label className="form-label">Employee Share(Amount)</label>
										<input type="text" className="form-control" defaultValue="2000" />
									</div>
								</div>
								<div className="col-md-6">
									<div className="mb-3">
										<label className="form-label">Organization Share(Amount)</label>
										<input type="text" className="form-control" defaultValue="2000" />
									</div>
								</div>
								<div className="col-md-12">
									<div className="mb-3">
										<label className="form-label">Description</label>
										<input type="text" className="form-control" />
									</div>
								</div>


							</div>
						</div>
						<div className="modal-footer">
							<button type="button" className="btn btn-white border me-2" data-bs-dismiss="modal">Cancel</button>
							<button type="submit" className="btn btn-primary">Save Changes</button>
						</div>
					</form>
				</div>
			</div>
		</div>
		{/* /Edit Promotion */}

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
							<Link to="/provident-fund" className="btn btn-danger">Yes, Delete</Link>
						</div>
					</div>
				</div>
			</div>
		</div>
		{/* /Delete Modal */}
    </>
  );
};

export default ProvidentFundPage;
