import React from "react";
import { Link } from "react-router-dom";

const EmployeeSalaryPage = () => {
  return (
    <>
      <div className="content">
        {/* Breadcrumb */}
				<div className="d-md-flex d-block align-items-center justify-content-between page-breadcrumb mb-3">
					<div className="my-auto mb-2">
						<h2 className="mb-1">Employee Salary</h2>
						<nav>
							<ol className="breadcrumb mb-0">
								<li className="breadcrumb-item">
									<Link to="/dashboard"><i className="ti ti-smart-home"></i></Link>
								</li>
								<li className="breadcrumb-item">
									HR
								</li>
								<li className="breadcrumb-item active" aria-current="page">Employee Salary</li>
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
							<Link to="#" data-bs-toggle="modal" data-bs-target="#new-employee-salary" className="btn btn-primary d-flex align-items-center"><i className="ti ti-circle-plus me-2"></i>Add Salary</Link>
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
						<h5>Employee Salary List</h5>
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
									Designation
								</Link>
								<ul className="dropdown-menu  dropdown-menu-end p-3">
									<li>
										<Link to="#" className="dropdown-item rounded-1">Finance</Link>
									</li>
									<li>
										<Link to="#" className="dropdown-item rounded-1">Developer</Link>
									</li>
									<li>
										<Link to="#" className="dropdown-item rounded-1">Executive</Link>
									</li>
									<li>
										<Link to="#" className="dropdown-item rounded-1">Manager</Link>
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
										<th>Emp ID</th>
										<th>Name</th>
										<th>Email</th>
										<th>Phone</th>
										<th>Designation</th>
										<th>Joining Date</th>
										<th>Salary</th>
										<th>Payslip</th>
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
										<td>Emp-001</td>
										<td>
											<div className="d-flex align-items-center file-name-icon">
												<Link to="#" className="avatar avatar-md ">
													<img src="/assets/img/users/user-32.jpg" className="img-fluid rounded-circle" alt="img" />
												</Link>
												<div className="ms-2">
													<h6 className="fw-medium"><Link to="#">Anthony Lewis</Link></h6>
													<span className="d-block mt-1">Finance</span>
												</div>
											</div>
										</td>
										<td><Link to="cdn-cgi/l/email-protection" className="__cf_email__" data-cfemail="94f5fae0fcfbfaedd4f1ecf5f9e4f8f1baf7fbf9">[email&#160;protected]</Link></td>
										<td>(123) 4567 890</td>
										<td>
											<div className="dropdown">
												<Link to="#" className="dropdown-toggle btn btn-white d-inline-flex align-items-center" data-bs-toggle="dropdown">
													<span className="rounded-circle bg-transparent-success d-flex justify-content-center align-items-center me-2"></span> Finance
												</Link>
												<ul className="dropdown-menu  dropdown-menu-end p-3">
													<li>
														<Link to="#" className="dropdown-item rounded-1 d-flex justify-content-start align-items-center"><span className="rounded-circle bg-transparent-success d-flex justify-content-center align-items-center me-2"></span>Finance</Link>
													</li>
													<li>
														<Link to="#" className="dropdown-item rounded-1 d-flex justify-content-start align-items-center"><span className="rounded-circle bg-transparent-skyblue d-flex justify-content-center align-items-center me-2"></span>Developer </Link>
													</li>
													<li>
														<Link to="#" className="dropdown-item rounded-1 d-flex justify-content-start align-items-center"><span className="rounded-circle bg-transparent-skyblue d-flex justify-content-center align-items-center me-2"></span>Executive </Link>
													</li>
													<li>
														<Link to="#" className="dropdown-item rounded-1 d-flex justify-content-start align-items-center"><span className="rounded-circle bg-transparent-skyblue d-flex justify-content-center align-items-center me-2"></span>Manager </Link>
													</li>
												</ul>
											</div>
										</td>

										<td>$12 Sep 2024 </td>
										<td>$40000</td>
										<td><span className="badge badge-dark badge-md">Generate Slip</span></td>
										<td>
											<div className="action-icon d-inline-flex">
												<Link to="#" className="me-2" data-bs-toggle="modal" data-bs-target="#edit-employee-salary"><i className="ti ti-edit"></i></Link>
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
										<td>Emp-002</td>
										<td>
											<div className="d-flex align-items-center file-name-icon">
												<Link to="#" className="avatar avatar-md ">
													<img src="/assets/img/users/user-09.jpg" className="img-fluid rounded-circle" alt="img" />
												</Link>
												<div className="ms-2">
													<h6 className="fw-medium"><Link to="#">Brian Villalobos</Link></h6>
													<span className="d-block mt-1">Developer</span>
												</div>
											</div>
										</td>
										<td><Link to="cdn-cgi/l/email-protection" className="__cf_email__" data-cfemail="e98b9b808887a98c91888499858cc78a8684">[email&#160;protected]</Link></td>
										<td>(179) 7382 829</td>
										<td>
											<div className="dropdown">
												<Link to="#" className="dropdown-toggle btn btn-white d-inline-flex align-items-center" data-bs-toggle="dropdown">
													<span className="rounded-circle bg-transparent-success d-flex justify-content-center align-items-center me-2"></span> Developer
												</Link>
												<ul className="dropdown-menu  dropdown-menu-end p-3">
													<li>
														<Link to="#" className="dropdown-item rounded-1 d-flex justify-content-start align-items-center"><span className="rounded-circle bg-transparent-success d-flex justify-content-center align-items-center me-2"></span>Finance</Link>
													</li>
													<li>
														<Link to="#" className="dropdown-item rounded-1 d-flex justify-content-start align-items-center"><span className="rounded-circle bg-transparent-skyblue d-flex justify-content-center align-items-center me-2"></span>Developer </Link>
													</li>
													<li>
														<Link to="#" className="dropdown-item rounded-1 d-flex justify-content-start align-items-center"><span className="rounded-circle bg-transparent-skyblue d-flex justify-content-center align-items-center me-2"></span>Executive </Link>
													</li>
													<li>
														<Link to="#" className="dropdown-item rounded-1 d-flex justify-content-start align-items-center"><span className="rounded-circle bg-transparent-skyblue d-flex justify-content-center align-items-center me-2"></span>Manager </Link>
													</li>
												</ul>
											</div>
										</td>

										<td>24 Oct 2024</td>
										<td>$35000</td>
										<td><span className="badge badge-dark badge-md">Generate Slip</span></td>
										<td>
											<div className="action-icon d-inline-flex">
												<Link to="#" className="me-2" data-bs-toggle="modal" data-bs-target="#edit-employee-salary"><i className="ti ti-edit"></i></Link>
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
										<td>Emp-003</td>
										<td>
											<div className="d-flex align-items-center file-name-icon">
												<Link to="#" className="avatar avatar-md ">
													<img src="/assets/img/users/user-01.jpg" className="img-fluid rounded-circle" alt="img" />
												</Link>
												<div className="ms-2">
													<h6 className="fw-medium"><Link to="#">Harvey Smith</Link></h6>
													<span className="d-block mt-1">Developer</span>
												</div>
											</div>
										</td>
										<td><Link to="cdn-cgi/l/email-protection" className="__cf_email__" data-cfemail="60080112160519200518010d100c054e030f0d">[email&#160;protected]</Link></td>
										<td>(184) 2719 738</td>
										<td>
											<div className="dropdown">
												<Link to="#" className="dropdown-toggle btn btn-white d-inline-flex align-items-center" data-bs-toggle="dropdown">
													<span className="rounded-circle bg-transparent-success d-flex justify-content-center align-items-center me-2"></span> Executive
												</Link>
												<ul className="dropdown-menu  dropdown-menu-end p-3">
													<li>
														<Link to="#" className="dropdown-item rounded-1 d-flex justify-content-start align-items-center"><span className="rounded-circle bg-transparent-success d-flex justify-content-center align-items-center me-2"></span>Finance</Link>
													</li>
													<li>
														<Link to="#" className="dropdown-item rounded-1 d-flex justify-content-start align-items-center"><span className="rounded-circle bg-transparent-skyblue d-flex justify-content-center align-items-center me-2"></span>Developer </Link>
													</li>
													<li>
														<Link to="#" className="dropdown-item rounded-1 d-flex justify-content-start align-items-center"><span className="rounded-circle bg-transparent-skyblue d-flex justify-content-center align-items-center me-2"></span>Executive </Link>
													</li>
													<li>
														<Link to="#" className="dropdown-item rounded-1 d-flex justify-content-start align-items-center"><span className="rounded-circle bg-transparent-skyblue d-flex justify-content-center align-items-center me-2"></span>Manager </Link>
													</li>
												</ul>
											</div>
										</td>

										<td>18 Feb 2024</td>
										<td>$20000</td>
										<td><span className="badge badge-dark badge-md">Generate Slip</span></td>
										<td>
											<div className="action-icon d-inline-flex">
												<Link to="#" className="me-2" data-bs-toggle="modal" data-bs-target="#edit-employee-salary"><i className="ti ti-edit"></i></Link>
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
										<td>Emp-004</td>
										<td>
											<div className="d-flex align-items-center file-name-icon">
												<Link to="#" className="avatar avatar-md ">
													<img src="/assets/img/users/user-33.jpg" className="img-fluid rounded-circle" alt="img" />
												</Link>
												<div className="ms-2">
													<h6 className="fw-medium"><Link to="#">Stephan Peralt</Link></h6>
													<span className="d-block mt-1">Executive Officer</span>
												</div>
											</div>
										</td>
										<td><Link to="cdn-cgi/l/email-protection" className="__cf_email__" data-cfemail="3c4c594e5d507c59445d514c5059125f5351">[email&#160;protected]</Link></td>
										<td>(193) 7839 748</td>
										<td>
											<div className="dropdown">
												<Link to="#" className="dropdown-toggle btn btn-white d-inline-flex align-items-center" data-bs-toggle="dropdown">
													<span className="rounded-circle bg-transparent-success d-flex justify-content-center align-items-center me-2"></span> Executive
												</Link>
												<ul className="dropdown-menu  dropdown-menu-end p-3">
													<li>
														<Link to="#" className="dropdown-item rounded-1 d-flex justify-content-start align-items-center"><span className="rounded-circle bg-transparent-success d-flex justify-content-center align-items-center me-2"></span>Finance</Link>
													</li>
													<li>
														<Link to="#" className="dropdown-item rounded-1 d-flex justify-content-start align-items-center"><span className="rounded-circle bg-transparent-skyblue d-flex justify-content-center align-items-center me-2"></span>Developer </Link>
													</li>
													<li>
														<Link to="#" className="dropdown-item rounded-1 d-flex justify-content-start align-items-center"><span className="rounded-circle bg-transparent-skyblue d-flex justify-content-center align-items-center me-2"></span>Executive </Link>
													</li>
													<li>
														<Link to="#" className="dropdown-item rounded-1 d-flex justify-content-start align-items-center"><span className="rounded-circle bg-transparent-skyblue d-flex justify-content-center align-items-center me-2"></span>Manager </Link>
													</li>
												</ul>
											</div>
										</td>

										<td>17 Oct 2024</td>
										<td>$$22000</td>
										<td><span className="badge badge-dark badge-md">Generate Slip</span></td>
										<td>
											<div className="action-icon d-inline-flex">
												<Link to="#" className="me-2" data-bs-toggle="modal" data-bs-target="#edit-employee-salary"><i className="ti ti-edit"></i></Link>
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
										<td>Emp-005</td>
										<td>
											<div className="d-flex align-items-center file-name-icon">
												<Link to="#" className="avatar avatar-md ">
													<img src="/assets/img/users/user-34.jpg" className="img-fluid rounded-circle" alt="img" />
												</Link>
												<div className="ms-2">
													<h6 className="fw-medium"><Link to="#">Doglas Martini</Link></h6>
													<span className="d-block mt-1">Manager</span>
												</div>
											</div>
										</td>
										<td><Link to="cdn-cgi/l/email-protection" className="__cf_email__" data-cfemail="335e5241475d5a444173564b525e435f561d505c5e">[email&#160;protected]</Link></td>
										<td>(183) 9302 890</td>
										<td>
											<div className="dropdown">
												<Link to="#" className="dropdown-toggle btn btn-white d-inline-flex align-items-center" data-bs-toggle="dropdown">
													<span className="rounded-circle bg-transparent-success d-flex justify-content-center align-items-center me-2"></span> Manager
												</Link>
												<ul className="dropdown-menu  dropdown-menu-end p-3">
													<li>
														<Link to="#" className="dropdown-item rounded-1 d-flex justify-content-start align-items-center"><span className="rounded-circle bg-transparent-success d-flex justify-content-center align-items-center me-2"></span>Finance</Link>
													</li>
													<li>
														<Link to="#" className="dropdown-item rounded-1 d-flex justify-content-start align-items-center"><span className="rounded-circle bg-transparent-skyblue d-flex justify-content-center align-items-center me-2"></span>Developer </Link>
													</li>
													<li>
														<Link to="#" className="dropdown-item rounded-1 d-flex justify-content-start align-items-center"><span className="rounded-circle bg-transparent-skyblue d-flex justify-content-center align-items-center me-2"></span>Executive </Link>
													</li>
													<li>
														<Link to="#" className="dropdown-item rounded-1 d-flex justify-content-start align-items-center"><span className="rounded-circle bg-transparent-skyblue d-flex justify-content-center align-items-center me-2"></span>Manager </Link>
													</li>
												</ul>
											</div>
										</td>

										<td>20 Jul 2024</td>
										<td>$25000</td>
										<td><span className="badge badge-dark badge-md">Generate Slip</span></td>
										<td>
											<div className="action-icon d-inline-flex">
												<Link to="#" className="me-2" data-bs-toggle="modal" data-bs-target="#edit-employee-salary"><i className="ti ti-edit"></i></Link>
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
										<td>Emp-006</td>
										<td>
											<div className="d-flex align-items-center file-name-icon">
												<Link to="#" className="avatar avatar-md ">
													<img src="/assets/img/users/user-02.jpg" className="img-fluid rounded-circle" alt="img" />
												</Link>
												<div className="ms-2">
													<h6 className="fw-medium"><Link to="#">Linda Ray</Link></h6>
													<span className="d-block mt-1">Finance</span>
												</div>
											</div>
										</td>
										<td><Link to="cdn-cgi/l/email-protection" className="__cf_email__" data-cfemail="cfbdaeb6fbfaf98faab7aea2bfa3aae1aca0a2">[email&#160;protected]</Link></td>
										<td>(120) 3728 039</td>
										<td>
											<div className="dropdown">
												<Link to="#" className="dropdown-toggle btn btn-white d-inline-flex align-items-center" data-bs-toggle="dropdown">
													<span className="rounded-circle bg-transparent-success d-flex justify-content-center align-items-center me-2"></span> Finance
												</Link>
												<ul className="dropdown-menu  dropdown-menu-end p-3">
													<li>
														<Link to="#" className="dropdown-item rounded-1 d-flex justify-content-start align-items-center"><span className="rounded-circle bg-transparent-success d-flex justify-content-center align-items-center me-2"></span>Finance</Link>
													</li>
													<li>
														<Link to="#" className="dropdown-item rounded-1 d-flex justify-content-start align-items-center"><span className="rounded-circle bg-transparent-skyblue d-flex justify-content-center align-items-center me-2"></span>Developer </Link>
													</li>
													<li>
														<Link to="#" className="dropdown-item rounded-1 d-flex justify-content-start align-items-center"><span className="rounded-circle bg-transparent-skyblue d-flex justify-content-center align-items-center me-2"></span>Executive </Link>
													</li>
													<li>
														<Link to="#" className="dropdown-item rounded-1 d-flex justify-content-start align-items-center"><span className="rounded-circle bg-transparent-skyblue d-flex justify-content-center align-items-center me-2"></span>Manager </Link>
													</li>
												</ul>
											</div>
										</td>

										<td>10 Apr 2024</td>
										<td>$30000</td>
										<td><span className="badge badge-dark badge-md">Generate Slip</span></td>
										<td>
											<div className="action-icon d-inline-flex">
												<Link to="#" className="me-2" data-bs-toggle="modal" data-bs-target="#edit-employee-salary"><i className="ti ti-edit"></i></Link>
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
										<td>Emp-007</td>
										<td>
											<div className="d-flex align-items-center file-name-icon">
												<Link to="#" className="avatar avatar-md ">
													<img src="/assets/img/users/user-35.jpg" className="img-fluid rounded-circle" alt="img" />
												</Link>
												<div className="ms-2">
													<h6 className="fw-medium"><Link to="#">Elliot Murray</Link></h6>
													<span className="d-block mt-1">Developer</span>
												</div>
											</div>
										</td>
										<td><Link to="cdn-cgi/l/email-protection" className="__cf_email__" data-cfemail="3a574f48485b437a5f425b574a565f14595557">[email&#160;protected]</Link></td>
										<td>(102) 8480 832</td>
										<td>
											<div className="dropdown">
												<Link to="#" className="dropdown-toggle btn btn-white d-inline-flex align-items-center" data-bs-toggle="dropdown">
													<span className="rounded-circle bg-transparent-success d-flex justify-content-center align-items-center me-2"></span> Finance
												</Link>
												<ul className="dropdown-menu  dropdown-menu-end p-3">
													<li>
														<Link to="#" className="dropdown-item rounded-1 d-flex justify-content-start align-items-center"><span className="rounded-circle bg-transparent-success d-flex justify-content-center align-items-center me-2"></span>Finance</Link>
													</li>
													<li>
														<Link to="#" className="dropdown-item rounded-1 d-flex justify-content-start align-items-center"><span className="rounded-circle bg-transparent-skyblue d-flex justify-content-center align-items-center me-2"></span>Developer </Link>
													</li>
													<li>
														<Link to="#" className="dropdown-item rounded-1 d-flex justify-content-start align-items-center"><span className="rounded-circle bg-transparent-skyblue d-flex justify-content-center align-items-center me-2"></span>Executive </Link>
													</li>
													<li>
														<Link to="#" className="dropdown-item rounded-1 d-flex justify-content-start align-items-center"><span className="rounded-circle bg-transparent-skyblue d-flex justify-content-center align-items-center me-2"></span>Manager </Link>
													</li>
												</ul>
											</div>
										</td>

										<td>29 Aug 2024</td>
										<td>$35000</td>
										<td><span className="badge badge-dark badge-md">Generate Slip</span></td>
										<td>
											<div className="action-icon d-inline-flex">
												<Link to="#" className="me-2" data-bs-toggle="modal" data-bs-target="#edit-employee-salary"><i className="ti ti-edit"></i></Link>
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
										<td>Emp-008</td>
										<td>
											<div className="d-flex align-items-center file-name-icon">
												<Link to="#" className="avatar avatar-md ">
													<img src="/assets/img/users/user-36.jpg" className="img-fluid rounded-circle" alt="img" />
												</Link>
												<div className="ms-2">
													<h6 className="fw-medium"><Link to="#">Rebecca Smtih</Link></h6>
													<span className="d-block mt-1">Executive</span>
												</div>
											</div>
										</td>
										<td><Link to="cdn-cgi/l/email-protection" className="__cf_email__" data-cfemail="b8cbd5ccd1d0f8ddc0d9d5c8d4dd96dbd7d5">[email&#160;protected]</Link></td>
										<td>(162) 8920 713</td>
										<td>
											<div className="dropdown">
												<Link to="#" className="dropdown-toggle btn btn-white d-inline-flex align-items-center" data-bs-toggle="dropdown">
													<span className="rounded-circle bg-transparent-success d-flex justify-content-center align-items-center me-2"></span> Executive
												</Link>
												<ul className="dropdown-menu  dropdown-menu-end p-3">
													<li>
														<Link to="#" className="dropdown-item rounded-1 d-flex justify-content-start align-items-center"><span className="rounded-circle bg-transparent-success d-flex justify-content-center align-items-center me-2"></span>Finance</Link>
													</li>
													<li>
														<Link to="#" className="dropdown-item rounded-1 d-flex justify-content-start align-items-center"><span className="rounded-circle bg-transparent-skyblue d-flex justify-content-center align-items-center me-2"></span>Developer </Link>
													</li>
													<li>
														<Link to="#" className="dropdown-item rounded-1 d-flex justify-content-start align-items-center"><span className="rounded-circle bg-transparent-skyblue d-flex justify-content-center align-items-center me-2"></span>Executive </Link>
													</li>
													<li>
														<Link to="#" className="dropdown-item rounded-1 d-flex justify-content-start align-items-center"><span className="rounded-circle bg-transparent-skyblue d-flex justify-content-center align-items-center me-2"></span>Manager </Link>
													</li>
												</ul>
											</div>
										</td>

										<td>22 Feb 2024</td>
										<td>$45000</td>
										<td><span className="badge badge-dark badge-md">Generate Slip</span></td>
										<td>
											<div className="action-icon d-inline-flex">
												<Link to="#" className="me-2" data-bs-toggle="modal" data-bs-target="#edit-employee-salary"><i className="ti ti-edit"></i></Link>
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
										<td>Emp-009</td>
										<td>
											<div className="d-flex align-items-center file-name-icon">
												<Link to="#" className="avatar avatar-md ">
													<img src="/assets/img/users/user-37.jpg" className="img-fluid rounded-circle" alt="img" />
												</Link>
												<div className="ms-2">
													<h6 className="fw-medium"><Link to="#">Connie Waters</Link></h6>
													<span className="d-block mt-1">Developer</span>
												</div>
											</div>
										</td>
										<td><Link to="cdn-cgi/l/email-protection" className="__cf_email__" data-cfemail="dbb8b4b5b5b2be9bbea3bab6abb7bef5b8b4b6">[email&#160;protected]</Link></td>
										<td>(189) 0920 723</td>
										<td>
											<div className="dropdown">
												<Link to="#" className="dropdown-toggle btn btn-white d-inline-flex align-items-center" data-bs-toggle="dropdown">
													<span className="rounded-circle bg-transparent-success d-flex justify-content-center align-items-center me-2"></span> Developer
												</Link>
												<ul className="dropdown-menu  dropdown-menu-end p-3">
													<li>
														<Link to="#" className="dropdown-item rounded-1 d-flex justify-content-start align-items-center"><span className="rounded-circle bg-transparent-success d-flex justify-content-center align-items-center me-2"></span>Finance</Link>
													</li>
													<li>
														<Link to="#" className="dropdown-item rounded-1 d-flex justify-content-start align-items-center"><span className="rounded-circle bg-transparent-skyblue d-flex justify-content-center align-items-center me-2"></span>Developer </Link>
													</li>
													<li>
														<Link to="#" className="dropdown-item rounded-1 d-flex justify-content-start align-items-center"><span className="rounded-circle bg-transparent-skyblue d-flex justify-content-center align-items-center me-2"></span>Executive </Link>
													</li>
													<li>
														<Link to="#" className="dropdown-item rounded-1 d-flex justify-content-start align-items-center"><span className="rounded-circle bg-transparent-skyblue d-flex justify-content-center align-items-center me-2"></span>Manager </Link>
													</li>
												</ul>
											</div>
										</td>

										<td>03 Nov 2024</td>
										<td>$50000</td>
										<td><span className="badge badge-dark badge-md">Generate Slip</span></td>
										<td>
											<div className="action-icon d-inline-flex">
												<Link to="#" className="me-2" data-bs-toggle="modal" data-bs-target="#edit-employee-salary"><i className="ti ti-edit"></i></Link>
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
										<td>Emp-010</td>
										<td>
											<div className="d-flex align-items-center file-name-icon">
												<Link to="#" className="avatar avatar-md ">
													<img src="/assets/img/users/user-38.jpg" className="img-fluid rounded-circle" alt="img" />
												</Link>
												<div className="ms-2">
													<h6 className="fw-medium"><Link to="#">Lori Broaddus</Link></h6>
													<span className="d-block mt-1">Finance</span>
												</div>
											</div>
										</td>
										<td><Link to="cdn-cgi/l/email-protection" className="__cf_email__" data-cfemail="2240504d434646575162475a434f524e470c414d4f">[email&#160;protected]</Link></td>
										<td>(168) 8392 823</td>
										<td>
											<div className="dropdown">
												<Link to="#" className="dropdown-toggle btn btn-white d-inline-flex align-items-center" data-bs-toggle="dropdown">
													<span className="rounded-circle bg-transparent-success d-flex justify-content-center align-items-center me-2"></span> Finance
												</Link>
												<ul className="dropdown-menu  dropdown-menu-end p-3">
													<li>
														<Link to="#" className="dropdown-item rounded-1 d-flex justify-content-start align-items-center"><span className="rounded-circle bg-transparent-success d-flex justify-content-center align-items-center me-2"></span>Finance</Link>
													</li>
													<li>
														<Link to="#" className="dropdown-item rounded-1 d-flex justify-content-start align-items-center"><span className="rounded-circle bg-transparent-skyblue d-flex justify-content-center align-items-center me-2"></span>Developer </Link>
													</li>
													<li>
														<Link to="#" className="dropdown-item rounded-1 d-flex justify-content-start align-items-center"><span className="rounded-circle bg-transparent-skyblue d-flex justify-content-center align-items-center me-2"></span>Executive </Link>
													</li>
													<li>
														<Link to="#" className="dropdown-item rounded-1 d-flex justify-content-start align-items-center"><span className="rounded-circle bg-transparent-skyblue d-flex justify-content-center align-items-center me-2"></span>Manager </Link>
													</li>
												</ul>
											</div>
										</td>

										<td>17 Dec 2024</td>
										<td>$25000</td>
										<td><span className="badge badge-dark badge-md">Generate Slip</span></td>
										<td>
											<div className="action-icon d-inline-flex">
												<Link to="#" className="me-2" data-bs-toggle="modal" data-bs-target="#edit-employee-salary"><i className="ti ti-edit"></i></Link>
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

		{/* Add Termination */}
		<div className="modal fade" id="new-employee-salary">
			<div className="modal-dialog modal-dialog-centered modal-lg">
				<div className="modal-content">
					<div className="modal-header">
						<h4 className="modal-title">Add Employee Salary</h4>
						<button type="button" className="btn-close custom-btn-close" data-bs-dismiss="modal" aria-label="Close">
							<i className="ti ti-x"></i>
						</button>
					</div>
					<form action="employee-salary.php">
						<div className="modal-body pb-0">
							<div className="row">
								<div className="col-md-6">
									<div className="mb-3">
										<label className="form-label">Employee Name </label>
										<select className="select">
											<option>Select</option>
											<option>Anthony Lewis</option>
											<option>Brian Villalobos</option>
											<option>Doglas Martini</option>
										</select>
									</div>
								</div>
								<div className="col-md-6">
									<label className="form-label">Net Salary </label>
									<input type="text" className="form-control" />
								</div>
							</div>
							<div className="row earning-row">
								<div className="d-flex justify-content-between mb-3">
									<label className="form-label">Earnings</label>
									<Link to="#" className="add-earnings text-primary mb-2"><i className="ti ti-plus me-2"></i>Add New</Link>
								</div>
								<div className="col-md-3">
									<div className="mb-3">
										<label className="form-label">Basic</label>
										<input type="text" className="form-control" />
									</div>
								</div>
								<div className="col-md-3">
									<div className="mb-3">
										<label className="form-label">DA(40%)</label>
										<input type="text" className="form-control" />
									</div>
								</div>
								<div className="col-md-3">
									<div className="mb-3">
										<label className="form-label">HRA(15%)</label>
										<input type="text" className="form-control" />
									</div>
								</div>
								<div className="col-md-3">
									<div className="mb-3">
										<label className="form-label">Conveyance</label>
										<input type="text" className="form-control" />
									</div>
								</div>
								<div className="col-md-3">
									<div className="mb-3">
										<label className="form-label">Allowance </label>
										<input type="text" className="form-control" />
									</div>
								</div>
								<div className="col-md-3">
									<div className="mb-3">
										<label className="form-label">Medical Allowance</label>
										<input type="text" className="form-control" />
									</div>
								</div>
								<div className="col-md-3">
									<div className="mb-3">
										<label className="form-label">Others</label>
										<input type="text" className="form-control" />
									</div>
								</div>
							</div>
							<div className="row deduction-row">
								<div className="d-flex justify-content-between mb-3">
									<label className="form-label">Deductions</label>
									<Link to="#" className="add-deduction text-primary mb-2"><i className="ti ti-plus me-2"></i>Add New</Link>
								</div>
								<div className="col-md-3">
									<div className="mb-3">
										<label className="form-label">TDS</label>
										<input type="text" className="form-control" />
									</div>
								</div>
								<div className="col-md-3">
									<div className="mb-3">
										<label className="form-label">ESI</label>
										<input type="text" className="form-control" />

									</div>
								</div>
								<div className="col-md-3">
									<div className="mb-3">
										<label className="form-label">PF</label>
										<input type="text" className="form-control" />
									</div>
								</div>
								<div className="col-md-3">
									<div className="mb-3">
										<label className="form-label">Leave</label>
										<input type="text" className="form-control" />
									</div>
								</div>
								<div className="col-md-3">
									<div className="mb-3">
										<label className="form-label">Prof.Tax</label>
										<input type="text" className="form-control" />
									</div>
								</div>
								<div className="col-md-3">
									<div className="mb-3">
										<label className="form-label">Labour Welfare</label>
										<input type="text" className="form-control" />
									</div>
								</div>
								<div className="col-md-3">
									<div className="mb-3">
										<label className="form-label">Others</label>
										<input type="text" className="form-control" />

									</div>
								</div>
							</div>

						</div>
						<div className="modal-footer">
							<button type="button" className="btn btn-white border me-2" data-bs-dismiss="modal">Cancel</button>
							<button type="submit" className="btn btn-primary">Add Employee Salary</button>
						</div>
					</form>
				</div>
			</div>
		</div>
		{/* /Add Termination */}

		{/* Edit Termination */}
		<div className="modal fade" id="edit-employee-salary">
			<div className="modal-dialog modal-dialog-centered modal-lg">
				<div className="modal-content">
					<div className="modal-header">
						<h4 className="modal-title">Edit Employee Salary</h4>
						<button type="button" className="btn-close custom-btn-close" data-bs-dismiss="modal" aria-label="Close">
							<i className="ti ti-x"></i>
						</button>
					</div>
					<form action="employee-salary.php">
						<div className="modal-body pb-0">
							<div className="row">
								<div className="col-md-6">
									<div className="mb-3">
										<label className="form-label">Employee Name </label>
										<select className="select">
											<option>Select</option>
											<option defaultValue>Anthony Lewis</option>
											<option>Brian Villalobos</option>
											<option>Doglas Martini</option>
										</select>
									</div>
								</div>
								<div className="col-md-6">
									<label className="form-label">Net Salary </label>
									<input type="text" className="form-control" />
								</div>
							</div>
							<div className="row earning-row">
								<div className="d-flex justify-content-between mb-3">
									<label className="form-label">Earnings</label>
									<Link to="#" className="add-earnings text-primary mb-2"><i className="ti ti-plus me-2"></i>Add New</Link>
								</div>
								<div className="col-md-3">
									<div className="mb-3">
										<label className="form-label">Basic</label>
										<input type="text" className="form-control" defaultValue="$40000" />
									</div>
								</div>
								<div className="col-md-3">
									<div className="mb-3">
										<label className="form-label">DA(40%)</label>
										<input type="text" className="form-control" defaultValue="$16000" />
									</div>
								</div>
								<div className="col-md-3">
									<div className="mb-3">
										<label className="form-label">HRA(15%)</label>
										<input type="text" className="form-control" defaultValue="$2666" />
									</div>
								</div>
								<div className="col-md-3">
									<div className="mb-3">
										<label className="form-label">Conveyance</label>
										<input type="text" className="form-control" defaultValue="$2000" />
									</div>
								</div>
							</div>

							<div className="row">
								<div className="col-md-3">
									<div className="mb-3">
										<label className="form-label">Allowance </label>
										<input type="text" className="form-control" defaultValue="$1000" />
									</div>
								</div>
								<div className="col-md-3">
									<div className="mb-3">
										<label className="form-label">Medical Allowance</label>
										<input type="text" className="form-control" defaultValue="$2000" />
									</div>
								</div>
								<div className="col-md-3">
									<div className="mb-3">
										<label className="form-label">Others</label>
										<input type="text" className="form-control" />
									</div>

								</div>
							</div>
							<div className="row deduction-row">
								<div className="d-flex justify-content-between mb-3">
									<label className="form-label">Deductions</label>
									<Link to="#" className="add-deduction text-primary mb-2"><i className="ti ti-plus me-2"></i>Add New</Link>
								</div>
								<div className="col-md-3">
									<div className="mb-3">
										<label className="form-label">TDS</label>
										<input type="text" className="form-control" defaultValue="$4000" />
									</div>
								</div>
								<div className="col-md-3">
									<div className="mb-3">
										<label className="form-label">ESI</label>
										<input type="text" className="form-control" defaultValue="$2000" />

									</div>
								</div>
								<div className="col-md-3">
									<div className="mb-3">
										<label className="form-label">PF</label>
										<input type="text" className="form-control" defaultValue="$3000" />
									</div>
								</div>
								<div className="col-md-3">
									<div className="mb-3">
										<label className="form-label">Leave</label>
										<input type="text" className="form-control" defaultValue="$1000" />
									</div>
								</div>
							</div>
							<div className="row">
								<div className="col-md-3">
									<div className="mb-3">
										<label className="form-label">Prof.Tax</label>
										<input type="text" className="form-control" defaultValue="$800" />
									</div>
								</div>
								<div className="col-md-3">
									<div className="mb-3">
										<label className="form-label">Labour Welfare</label>
										<input type="text" className="form-control" defaultValue="$500" />
									</div>
								</div>
								<div className="col-md-3">
									<div className="mb-3">
										<label className="form-label">Others</label>
										<input type="text" className="form-control" defaultValue="$100" />

									</div>
								</div>
							</div>

						</div>
						<div className="modal-footer">
							<button type="button" className="btn btn-white border me-2" data-bs-dismiss="modal">Cancel</button>
							<button type="submit" className="btn btn-primary">Add Employee Salary</button>
						</div>
					</form>
				</div>
			</div>
		</div>
		{/* /Edit Termination */}

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
							<Link to="/employee-salary" className="btn btn-danger">Yes, Delete</Link>
						</div>
					</div>
				</div>
			</div>
		</div>
		{/* /Delete Modal */}
    </>
  );
};

export default EmployeeSalaryPage;
