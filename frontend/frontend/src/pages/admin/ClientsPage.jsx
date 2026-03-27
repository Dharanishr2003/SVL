import React from "react";
import { useLocation, useSearchParams } from "react-router-dom";
import ClientsGridPage from "./ClientsGridPage";

const ClientsPage = () => {
	const location = useLocation();
	const [searchParams, setSearchParams] = useSearchParams();
	const viewFromQuery = searchParams.get("view") === "grid" ? "grid" : "list";
	const view = location.pathname.endsWith("/clients-grid") ? "grid" : viewFromQuery;

	if (view === "grid") {
		return <ClientsGridPage />;
	}

    return (
        <>
            <div className="content">

				{/* Breadcrumb */}
				<div className="d-md-flex d-block align-items-center justify-content-between page-breadcrumb mb-3">
					<div className="my-auto mb-2">
						<h2 className="mb-1">Clients</h2>
						<nav>
							<ol className="breadcrumb mb-0">
								<li className="breadcrumb-item">
									<a href="admin-dashboard.php"><i className="ti ti-smart-home"></i></a>
								</li>
								<li className="breadcrumb-item">
									Employee
								</li>
								<li className="breadcrumb-item active" aria-current="page">Client List</li>
							</ol>
						</nav>
					</div>
					<div className="d-flex my-xl-auto right-content align-items-center flex-wrap ">
						<div className="me-2 mb-2">
							<div className="d-flex align-items-center border bg-white rounded p-1 me-2 icon-list">
								<button
									type="button"
									onClick={() => setSearchParams({})}
									className="btn btn-icon btn-sm active bg-primary text-white me-1"
								>
									<i className="ti ti-list-tree"></i>
								</button>
								<button
									type="button"
									onClick={() => setSearchParams({ view: "grid" })}
									className="btn btn-icon btn-sm"
								>
									<i className="ti ti-layout-grid"></i>
								</button>
							</div>
						</div>
						<div className="mb-2">
							<a href="#" data-bs-toggle="modal" data-bs-target="#add_client"
								className="btn btn-primary d-flex align-items-center"><i className="ti ti-circle-plus me-2"></i>Add
								Client</a>
						</div>
						<div className="ms-2 head-icons">
							<a href="javascript:void(0);" className="" data-bs-toggle="tooltip" data-bs-placement="top"
								data-bs-original-title="Collapse" id="collapse-header">
								<i className="ti ti-chevrons-up"></i>
							</a>
						</div>
					</div>
				</div>
				{/* /Breadcrumb */}

				{/* Clients Info */}
				<div className="row">
					<div className="col-xl-3 col-md-6 d-flex">
						<div className="card flex-fill">
							<div className="card-body">
								<div className="d-flex align-items-center justify-content-between">
									<div className="d-flex align-items-center">
										<div className="flex-shrink-0 me-2">
											<span
												className="p-2 br-10 bg-pink-transparent border border-pink d-flex align-items-center justify-content-center">
												<i className="ti ti-users-group text-pink fs-18"></i>
											</span>
										</div>
										<div>
											<p className="fs-12 fw-medium mb-0 text-gray-5 mb-1">Total Clients</p>
											<h4>300</h4>
										</div>
									</div>
									<span className="badge bg-transparent-purple d-inline-flex align-items-center fw-normal">
										<i className="ti ti-arrow-wave-right-down me-1"></i>
										+19.01%
									</span>
								</div>
							</div>
						</div>
					</div>
					<div className="col-xl-3 col-md-6 d-flex">
						<div className="card flex-fill">
							<div className="card-body">
								<div className="d-flex align-items-center justify-content-between">
									<div className="d-flex align-items-center">
										<div className="flex-shrink-0 me-2">
											<span
												className="p-2 br-10 bg-success-transparent border border-success d-flex align-items-center justify-content-center">
												<i className="ti ti-user-share fs-18"></i>
											</span>
										</div>
										<div>
											<p className="fs-12 fw-medium mb-0 text-gray-5 mb-1">Active Clients</p>
											<h4>270</h4>
										</div>
									</div>
									<span
										className="badge bg-transparent-primary text-primary d-inline-flex align-items-center fw-normal">
										<i className="ti ti-arrow-wave-right-down me-1"></i>
										+19.01%
									</span>
								</div>
							</div>
						</div>
					</div>
					<div className="col-xl-3 col-md-6 d-flex">
						<div className="card flex-fill">
							<div className="card-body">
								<div className="d-flex align-items-center justify-content-between">
									<div className="d-flex align-items-center">
										<div className="flex-shrink-0 me-2">
											<span
												className="p-2 br-10 bg-danger-transparent border border-danger d-flex align-items-center justify-content-center">
												<i className="ti ti-user-pause fs-18"></i>
											</span>
										</div>
										<div>
											<p className="fs-12 fw-medium mb-0 text-gray-5 mb-1">Inactive Clients</p>
											<h4>30</h4>
										</div>
									</div>
									<span
										className="badge bg-transparent-dark text-dark d-inline-flex align-items-center fw-normal">
										<i className="ti ti-arrow-wave-right-down me-1"></i>
										+19.01%
									</span>
								</div>
							</div>
						</div>
					</div>
					<div className="col-xl-3 col-md-6 d-flex">
						<div className="card flex-fill">
							<div className="card-body">
								<div className="d-flex align-items-center justify-content-between">
									<div className="d-flex align-items-center">
										<div className="flex-shrink-0 me-2">
											<span
												className="p-2 br-10 bg-info-transparent border border-info d-flex align-items-center justify-content-center">
												<i className="ti ti-user-plus fs-18"></i>
											</span>
										</div>
										<div>
											<p className="fs-12 fw-medium mb-0 text-gray-5 mb-1">New Clients</p>
											<h4>300</h4>
										</div>
									</div>
									<span
										className="badge bg-transparent-secondary text-dark d-inline-flex align-items-center fw-normal">
										<i className="ti ti-arrow-wave-right-down me-1"></i>
										+19.01%
									</span>
								</div>
							</div>
						</div>
					</div>
				</div>
				{/* /Clients Info */}

				{/* Clients list */}
				<div className="card">
					<div className="card-header d-flex align-items-center justify-content-between flex-wrap row-gap-3">
						<h5>Client List</h5>
						<div className="d-flex my-xl-auto right-content align-items-center flex-wrap row-gap-3"></div>
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
										<th>Client ID</th>
										<th>Client Name</th>
										<th>Company Name</th>
										<th>Email</th>
										<th>Phone</th>
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
										<td><a href="client-details.php">Cli-001</a></td>
										<td>
											<div className="d-flex align-items-center file-name-icon">
												<a href="client-details.php" className="avatar avatar-md border avatar-rounded">
													<img src="assets/img/users/user-39.jpg" className="img-fluid" alt="img" />
												</a>
												<div className="ms-2">
													<h6 className="fw-medium"><a href="client-details.php">Michael Walker</a>
													</h6>
													<span className="fs-12 fw-normal ">CEO</span>
												</div>
											</div>
										</td>
										<td>BrightWave Innovations</td>
										<td>
											<a href="/cdn-cgi/l/email-protection" className="__cf_email__"
												data-cfemail="04696d676c65616844617c65697468612a676b69">[email&#160;protected]</a>
										</td>
										<td>
											(163) 2459 315
										</td>
										<td>
											<span className="badge badge-success d-inline-flex align-items-center badge-xs">
												<i className="ti ti-point-filled me-1"></i>Active
											</span>
										</td>
										<td>
											<div className="action-icon d-inline-flex">
												<a href="#" className="me-2" data-bs-toggle="modal"
													data-bs-target="#edit_client"><i className="ti ti-edit"></i></a>
												<a href="javascript:void(0);" data-bs-toggle="modal"
													data-bs-target="#delete_modal"><i className="ti ti-trash"></i></a>
											</div>
										</td>
									</tr>
									<tr>
										<td>
											<div className="form-check form-check-md">
												<input className="form-check-input" type="checkbox" />
											</div>
										</td>
										<td><a href="client-details.php">Cli-002</a></td>
										<td>
											<div className="d-flex align-items-center file-name-icon">
												<a href="client-details.php" className="avatar avatar-md border avatar-rounded">
													<img src="assets/img/users/user-40.jpg" className="img-fluid" alt="img" />
												</a>
												<div className="ms-2">
													<h6 className="fw-medium"><a href="client-details.php">Sophie Headrick</a>
													</h6>
													<span className="fs-12 fw-normal ">Manager</span>
												</div>
											</div>
										</td>
										<td>Stellar Dynamics</td>
										<td>
											<a href="/cdn-cgi/l/email-protection" className="__cf_email__"
												data-cfemail="067569766e6f6346637e676b766a632865696b">[email&#160;protected]</a>
										</td>
										<td>
											(146) 1249 296
										</td>
										<td>
											<span className="badge badge-success d-inline-flex align-items-center badge-xs">
												<i className="ti ti-point-filled me-1"></i>Active
											</span>
										</td>
										<td>
											<div className="action-icon d-inline-flex">
												<a href="#" className="me-2" data-bs-toggle="modal"
													data-bs-target="#edit_client"><i className="ti ti-edit"></i></a>
												<a href="javascript:void(0);" data-bs-toggle="modal"
													data-bs-target="#delete_modal"><i className="ti ti-trash"></i></a>
											</div>
										</td>
									</tr>
									<tr>
										<td>
											<div className="form-check form-check-md">
												<input className="form-check-input" type="checkbox" />
											</div>
										</td>
										<td><a href="client-details.php">Cli-003</a></td>
										<td>
											<div className="d-flex align-items-center file-name-icon">
												<a href="client-details.php" className="avatar avatar-md border avatar-rounded">
													<img src="assets/img/users/user-41.jpg" className="img-fluid" alt="img" />
												</a>
												<div className="ms-2">
													<h6 className="fw-medium"><a href="client-details.php">Cameron Drake</a>
													</h6>
													<span className="fs-12 fw-normal ">Director</span>
												</div>
											</div>
										</td>
										<td>Quantum Nexus</td>
										<td>
											<a href="/cdn-cgi/l/email-protection" className="__cf_email__"
												data-cfemail="7714161a1205181937120f161a071b125914181a">[email&#160;protected]</a>
										</td>
										<td>
											(135) 3489 516
										</td>
										<td>
											<span className="badge badge-success d-inline-flex align-items-center badge-xs">
												<i className="ti ti-point-filled me-1"></i>Active
											</span>
										</td>
										<td>
											<div className="action-icon d-inline-flex">
												<a href="#" className="me-2" data-bs-toggle="modal"
													data-bs-target="#edit_client"><i className="ti ti-edit"></i></a>
												<a href="javascript:void(0);" data-bs-toggle="modal"
													data-bs-target="#delete_modal"><i className="ti ti-trash"></i></a>
											</div>
										</td>
									</tr>
									<tr>
										<td>
											<div className="form-check form-check-md">
												<input className="form-check-input" type="checkbox" />
											</div>
										</td>
										<td><a href="client-details.php">Cli-004</a></td>
										<td>
											<div className="d-flex align-items-center file-name-icon">
												<a href="client-details.php" className="avatar avatar-md border avatar-rounded">
													<img src="assets/img/users/user-42.jpg" className="img-fluid" alt="img" />
												</a>
												<div className="ms-2">
													<h6 className="fw-medium"><a href="client-details.php">Doris Crowley</a>
													</h6>
													<span className="fs-12 fw-normal ">Consultant</span>
												</div>
											</div>
										</td>
										<td>EcoVision Enterprises</td>
										<td>
											<a href="/cdn-cgi/l/email-protection" className="__cf_email__"
												data-cfemail="a2c6cdd0cbd1e2c7dac3cfd2cec78cc1cdcf">[email&#160;protected]</a>
										</td>
										<td>
											(158) 3459 596
										</td>
										<td>
											<span className="badge badge-success d-inline-flex align-items-center badge-xs">
												<i className="ti ti-point-filled me-1"></i>Active
											</span>
										</td>
										<td>
											<div className="action-icon d-inline-flex">
												<a href="#" className="me-2" data-bs-toggle="modal"
													data-bs-target="#edit_client"><i className="ti ti-edit"></i></a>
												<a href="javascript:void(0);" data-bs-toggle="modal"
													data-bs-target="#delete_modal"><i className="ti ti-trash"></i></a>
											</div>
										</td>
									</tr>
									<tr>
										<td>
											<div className="form-check form-check-md">
												<input className="form-check-input" type="checkbox" />
											</div>
										</td>
										<td><a href="client-details.php">Cli-005</a></td>
										<td>
											<div className="d-flex align-items-center file-name-icon">
												<a href="client-details.php" className="avatar avatar-md border avatar-rounded">
													<img src="assets/img/users/user-44.jpg" className="img-fluid" alt="img" />
												</a>
												<div className="ms-2">
													<h6 className="fw-medium"><a href="client-details.php">Thomas Bordelon</a>
													</h6>
													<span className="fs-12 fw-normal ">Manager</span>
												</div>
											</div>
										</td>
										<td>Aurora Technologies</td>
										<td>
											<a href="/cdn-cgi/l/email-protection" className="__cf_email__"
												data-cfemail="3b4f5354565a487b5e435a564b575e15585456">[email&#160;protected]</a>
										</td>
										<td>
											(196) 4862 196
										</td>
										<td>
											<span className="badge badge-success d-inline-flex align-items-center badge-xs">
												<i className="ti ti-point-filled me-1"></i>Active
											</span>
										</td>
										<td>
											<div className="action-icon d-inline-flex">
												<a href="#" className="me-2" data-bs-toggle="modal"
													data-bs-target="#edit_client"><i className="ti ti-edit"></i></a>
												<a href="javascript:void(0);" data-bs-toggle="modal"
													data-bs-target="#delete_modal"><i className="ti ti-trash"></i></a>
											</div>
										</td>
									</tr>
									<tr>
										<td>
											<div className="form-check form-check-md">
												<input className="form-check-input" type="checkbox" />
											</div>
										</td>
										<td><a href="client-details.php">Cli-006</a></td>
										<td>
											<div className="d-flex align-items-center file-name-icon">
												<a href="client-details.php" className="avatar avatar-md border avatar-rounded">
													<img src="assets/img/users/user-45.jpg" className="img-fluid" alt="img" />
												</a>
												<div className="ms-2">
													<h6 className="fw-medium"><a href="client-details.php">Kathleen
															Gutierrez</a></h6>
													<span className="fs-12 fw-normal ">Director</span>
												</div>
											</div>
										</td>
										<td>BlueSky Ventures</td>
										<td>
											<a href="/cdn-cgi/l/email-protection" className="__cf_email__"
												data-cfemail="c4afa5b0aca8a1a1aa84a1bca5a9b4a8a1eaa7aba9">[email&#160;protected]</a>
										</td>
										<td>
											(163) 6498 256
										</td>
										<td>
											<span className="badge badge-success d-inline-flex align-items-center badge-xs">
												<i className="ti ti-point-filled me-1"></i>Active
											</span>
										</td>
										<td>
											<div className="action-icon d-inline-flex">
												<a href="#" className="me-2" data-bs-toggle="modal"
													data-bs-target="#edit_client"><i className="ti ti-edit"></i></a>
												<a href="javascript:void(0);" data-bs-toggle="modal"
													data-bs-target="#delete_modal"><i className="ti ti-trash"></i></a>
											</div>
										</td>
									</tr>
									<tr>
										<td>
											<div className="form-check form-check-md">
												<input className="form-check-input" type="checkbox" />
											</div>
										</td>
										<td><a href="client-details.php">Cli-007</a></td>
										<td>
											<div className="d-flex align-items-center file-name-icon">
												<a href="client-details.php" className="avatar avatar-md border avatar-rounded">
													<img src="assets/img/users/user-46.jpg" className="img-fluid" alt="img" />
												</a>
												<div className="ms-2">
													<h6 className="fw-medium"><a href="client-details.php">Bruce Wright</a></h6>
													<span className="fs-12 fw-normal ">CEO</span>
												</div>
											</div>
										</td>
										<td>TerraFusion Energy</td>
										<td>
											<a href="/cdn-cgi/l/email-protection" className="__cf_email__"
												data-cfemail="fe9c8c8b9d9bbe9b869f938e929bd09d9193">[email&#160;protected]</a>
										</td>
										<td>
											(154) 6481 075
										</td>
										<td>
											<span className="badge badge-success d-inline-flex align-items-center badge-xs">
												<i className="ti ti-point-filled me-1"></i>Active
											</span>
										</td>
										<td>
											<div className="action-icon d-inline-flex">
												<a href="#" className="me-2" data-bs-toggle="modal"
													data-bs-target="#edit_client"><i className="ti ti-edit"></i></a>
												<a href="javascript:void(0);" data-bs-toggle="modal"
													data-bs-target="#delete_modal"><i className="ti ti-trash"></i></a>
											</div>
										</td>
									</tr>
									<tr>
										<td>
											<div className="form-check form-check-md">
												<input className="form-check-input" type="checkbox" />
											</div>
										</td>
										<td><a href="client-details.php">Cli-008</a></td>
										<td>
											<div className="d-flex align-items-center file-name-icon">
												<a href="client-details.php" className="avatar avatar-md border avatar-rounded">
													<img src="assets/img/users/user-47.jpg" className="img-fluid" alt="img" />
												</a>
												<div className="ms-2">
													<h6 className="fw-medium"><a href="client-details.php">Estelle Morgan</a>
													</h6>
													<span className="fs-12 fw-normal ">Manager</span>
												</div>
											</div>
										</td>
										<td>UrbanPulse Design</td>
										<td>
											<a href="/cdn-cgi/l/email-protection" className="__cf_email__"
												data-cfemail="3b5e484f5e57575e7b5e435a564b575e15585456">[email&#160;protected]</a>
										</td>
										<td>
											(184) 6348 195
										</td>
										<td>
											<span className="badge badge-danger d-inline-flex align-items-center badge-xs">
												<i className="ti ti-point-filled me-1"></i>Inactive
											</span>
										</td>
										<td>
											<div className="action-icon d-inline-flex">
												<a href="#" className="me-2" data-bs-toggle="modal"
													data-bs-target="#edit_client"><i className="ti ti-edit"></i></a>
												<a href="javascript:void(0);" data-bs-toggle="modal"
													data-bs-target="#delete_modal"><i className="ti ti-trash"></i></a>
											</div>
										</td>
									</tr>
									<tr>
										<td>
											<div className="form-check form-check-md">
												<input className="form-check-input" type="checkbox" />
											</div>
										</td>
										<td><a href="client-details.php">Cli-009</a></td>
										<td>
											<div className="d-flex align-items-center file-name-icon">
												<a href="client-details.php" className="avatar avatar-md border avatar-rounded">
													<img src="assets/img/users/user-48.jpg" className="img-fluid" alt="img" />
												</a>
												<div className="ms-2">
													<h6 className="fw-medium"><a href="client-details.php">Stephen Dias</a></h6>
													<span className="fs-12 fw-normal ">CEO</span>
												</div>
											</div>
										</td>
										<td>Nimbus Networks</td>
										<td>
											<a href="/cdn-cgi/l/email-protection" className="__cf_email__"
												data-cfemail="65161100150d000b25001d04081509004b060a08">[email&#160;protected]</a>
										</td>
										<td>
											(175) 2496 125
										</td>
										<td>
											<span className="badge badge-success d-inline-flex align-items-center badge-xs">
												<i className="ti ti-point-filled me-1"></i>Active
											</span>
										</td>
										<td>
											<div className="action-icon d-inline-flex">
												<a href="#" className="me-2" data-bs-toggle="modal"
													data-bs-target="#edit_client"><i className="ti ti-edit"></i></a>
												<a href="javascript:void(0);" data-bs-toggle="modal"
													data-bs-target="#delete_modal"><i className="ti ti-trash"></i></a>
											</div>
										</td>
									</tr>
									<tr>
										<td>
											<div className="form-check form-check-md">
												<input className="form-check-input" type="checkbox" />
											</div>
										</td>
										<td><a href="client-details.php">Cli-010</a></td>
										<td>
											<div className="d-flex align-items-center file-name-icon">
												<a href="client-details.php" className="avatar avatar-md border avatar-rounded">
													<img src="assets/img/users/user-43.jpg" className="img-fluid" alt="img" />
												</a>
												<div className="ms-2">
													<h6 className="fw-medium"><a href="client-details.php">Angela Thomas</a>
													</h6>
													<span className="fs-12 fw-normal ">Consultant</span>
												</div>
											</div>
										</td>
										<td>Epicurean Delights</td>
										<td>
											<a href="/cdn-cgi/l/email-protection" className="__cf_email__"
												data-cfemail="cdaca3aaa8a1ac8da8b5aca0bda1a8e3aea2a0">[email&#160;protected]</a>
										</td>
										<td>
											(132) 3145 977
										</td>
										<td>
											<span className="badge badge-success d-inline-flex align-items-center badge-xs">
												<i className="ti ti-point-filled me-1"></i>Active
											</span>
										</td>
										<td>
											<div className="action-icon d-inline-flex">
												<a href="#" className="me-2" data-bs-toggle="modal"
													data-bs-target="#edit_client"><i className="ti ti-edit"></i></a>
												<a href="javascript:void(0);" data-bs-toggle="modal"
													data-bs-target="#delete_modal"><i className="ti ti-trash"></i></a>
											</div>
										</td>
									</tr>
								</tbody>
							</table>
						</div>
					</div>
				</div>
				{/* /Clients list */}

			</div>
			<div className="footer d-sm-flex align-items-center justify-content-between border-top bg-white p-3">
				<p className="mb-0">2014 - 2025 &copy; SmartHR.</p>
				<p>Designed &amp; Developed By <a href="javascript:void(0);" className="text-primary">Dreams</a></p>
			</div>
	
		{/* /Page Wrapper */}

		{/* Add Client */}
		<div className="modal fade" id="add_client">
			<div className="modal-dialog modal-dialog-centered modal-lg">
				<div className="modal-content">
					<div className="modal-header">
						<h4 className="modal-title">Add New Client</h4>
						<button type="button" className="btn-close custom-btn-close" data-bs-dismiss="modal" aria-label="Close">
							<i className="ti ti-x"></i>
						</button>
					</div>
					<form action="clients.php">
						<div className="contact-grids-tab">
							<ul className="nav nav-underline" id="myTab" role="tablist">
								<li className="nav-item" role="presentation">
									<button className="nav-link active" id="info-tab" data-bs-toggle="tab"
										data-bs-target="#basic-info" type="button" role="tab" aria-selected="true">Basic
										Information</button>
								</li>
								<li className="nav-item" role="presentation">
									<button className="nav-link" id="address-tab" data-bs-toggle="tab" data-bs-target="#address"
										type="button" role="tab" aria-selected="false">Permissions</button>
								</li>
							</ul>
						</div>
						<div className="tab-content" id="myTabContent">
							<div className="tab-pane fade show active" id="basic-info" role="tabpanel"
								aria-labelledby="info-tab" tabIndex="0">
								<div className="modal-body pb-0 ">
									<div className="row">
										<div className="col-md-12">
											<div
												className="d-flex align-items-center flex-wrap row-gap-3 bg-light w-100 rounded p-3 mb-4">
												<div
													className="d-flex align-items-center justify-content-center avatar avatar-xxl rounded-circle border border-dashed me-2 flex-shrink-0 text-dark frames">
													<i className="ti ti-photo"></i>
												</div>
												<div className="profile-upload">
													<div className="mb-2">
														<h6 className="mb-1">Upload Profile Image</h6>
														<p className="fs-12">Image should be below 4 mb</p>
													</div>
													<div className="profile-uploader d-flex align-items-center">
														<div className="drag-upload-btn btn btn-sm btn-primary me-2">
															Upload
															<input type="file" className="form-control image-sign" multiple="" />
														</div>
														<a href="javascript:void(0);"
															className="btn btn-light btn-sm">Cancel</a>
													</div>
												</div>
											</div>
										</div>
										<div className="col-md-6">
											<div className="mb-3">
												<label className="form-label">First Name <span className="text-danger">
														*</span></label>
												<input type="text" className="form-control" />
											</div>
										</div>
										<div className="col-md-6">
											<div className="mb-3">
												<label className="form-label">Last Name</label>
												<input type="email" className="form-control" />
											</div>
										</div>
										<div className="col-md-6">
											<div className="mb-3">
												<label className="form-label">Username <span className="text-danger">
														*</span></label>
												<input type="text" className="form-control" />
											</div>
										</div>
										<div className="col-md-6">
											<div className="mb-3">
												<label className="form-label">Email<span className="text-danger"> *</span></label>
												<input type="text" className="form-control" />
											</div>
										</div>
										<div className="col-md-6">
											<div className="mb-3 ">
												<label className="form-label">Password <span className="text-danger">
														*</span></label>
												<div className="pass-group">
													<input type="password" className="pass-input form-control" />
													<span className="ti toggle-password ti-eye-off"></span>
												</div>
											</div>
										</div>
										<div className="col-md-6">
											<div className="mb-3 ">
												<label className="form-label">Confirm Password <span className="text-danger">
														*</span></label>
												<div className="pass-group">
													<input type="password" className="pass-inputs form-control" />
													<span className="ti toggle-passwords ti-eye-off"></span>
												</div>
											</div>
										</div>
										<div className="col-md-6">
											<div className="mb-3">
												<label className="form-label">Phone Number <span className="text-danger">
														*</span></label>
												<input type="text" className="form-control" />
											</div>
										</div>
										<div className="col-md-6">
											<div className="mb-3">
												<label className="form-label">Company</label>
												<input type="text" className="form-control" />
											</div>
										</div>
									</div>
								</div>
								<div className="modal-footer">
									<button type="button" className="btn btn-outline-light border me-2"
										data-bs-dismiss="modal">Cancel</button>
									<button type="submit" className="btn btn-primary">Save </button>
								</div>
							</div>
							<div className="tab-pane fade" id="address" role="tabpanel" aria-labelledby="address-tab"
								tabIndex="0">
								<div className="modal-body pb-0 ">
									<div className="card bg-light-500 shadow-none">
										<div
											className="card-body d-flex align-items-center justify-content-between flex-wrap row-gap-3">
											<h6>Enable Options</h6>
											<div className="d-flex align-items-center justify-content-end">
												<div className="form-check form-check-md form-switch me-2">
													<label className="form-check-label mt-0">
														<input className="form-check-input me-2" type="checkbox" role="switch" />
														Enable all Module
													</label>
												</div>
												<div className="form-check form-check-md d-flex align-items-center">
													<label className="form-check-label mt-0">
														<input className="form-check-input" type="checkbox" defaultChecked />
														Select All
													</label>
												</div>
											</div>
										</div>
									</div>
									<div className="table-responsive permission-table border rounded">
										<table className="table">
											<tbody>
												<tr>
													<td>
														<div className="form-check form-check-md form-switch me-2">
															<label className="form-check-label mt-0">
																<input className="form-check-input me-2" type="checkbox"
																	role="switch" defaultChecked />
																Holidays
															</label>
														</div>
													</td>
													<td>
														<div className="form-check form-check-md d-flex align-items-center">
															<label className="form-check-label mt-0">
																<input className="form-check-input" type="checkbox" defaultChecked />
																Read
															</label>
														</div>
													</td>
													<td>
														<div className="form-check form-check-md d-flex align-items-center">
															<label className="form-check-label mt-0">
																<input className="form-check-input" type="checkbox" />
																Write
															</label>
														</div>
													</td>
													<td>
														<div className="form-check form-check-md d-flex align-items-center">
															<label className="form-check-label mt-0">
																<input className="form-check-input" type="checkbox" />
																Create
															</label>
														</div>
													</td>
													<td>
														<div className="form-check form-check-md d-flex align-items-center">
															<label className="form-check-label mt-0">
																<input className="form-check-input" type="checkbox" />
																Delete
															</label>
														</div>
													</td>
													<td>
														<div className="form-check form-check-md d-flex align-items-center">
															<label className="form-check-label mt-0">
																<input className="form-check-input" type="checkbox" />
																Import
															</label>
														</div>
													</td>
													<td>
														<div className="form-check form-check-md d-flex align-items-center">
															<label className="form-check-label mt-0">
																<input className="form-check-input" type="checkbox" />
																Export
															</label>
														</div>
													</td>
												</tr>
												<tr>
													<td>
														<div className="form-check form-check-md form-switch me-2">
															<label className="form-check-label mt-0">
																<input className="form-check-input me-2" type="checkbox"
																	role="switch" />
																Leaves
															</label>
														</div>
													</td>
													<td>
														<div className="form-check form-check-md d-flex align-items-center">
															<label className="form-check-label mt-0">
																<input className="form-check-input" type="checkbox" />
																Read
															</label>
														</div>
													</td>
													<td>
														<div className="form-check form-check-md d-flex align-items-center">
															<label className="form-check-label mt-0">
																<input className="form-check-input" type="checkbox" />
																Write
															</label>
														</div>
													</td>
													<td>
														<div className="form-check form-check-md d-flex align-items-center">
															<label className="form-check-label mt-0">
																<input className="form-check-input" type="checkbox" />
																Create
															</label>
														</div>
													</td>
													<td>
														<div className="form-check form-check-md d-flex align-items-center">
															<label className="form-check-label mt-0">
																<input className="form-check-input" type="checkbox" />
																Delete
															</label>
														</div>
													</td>
													<td>
														<div className="form-check form-check-md d-flex align-items-center">
															<label className="form-check-label mt-0">
																<input className="form-check-input" type="checkbox" />
																Import
															</label>
														</div>
													</td>
													<td>
														<div className="form-check form-check-md d-flex align-items-center">
															<label className="form-check-label mt-0">
																<input className="form-check-input" type="checkbox" />
																Export
															</label>
														</div>
													</td>
												</tr>
												<tr>
													<td>
														<div className="form-check form-check-md form-switch me-2">
															<label className="form-check-label mt-0">
																<input className="form-check-input me-2" type="checkbox"
																	role="switch" />
																Clients
															</label>
														</div>
													</td>
													<td>
														<div className="form-check form-check-md d-flex align-items-center">
															<label className="form-check-label mt-0">
																<input className="form-check-input" type="checkbox" />
																Read
															</label>
														</div>
													</td>
													<td>
														<div className="form-check form-check-md d-flex align-items-center">
															<label className="form-check-label mt-0">
																<input className="form-check-input" type="checkbox" />
																Write
															</label>
														</div>
													</td>
													<td>
														<div className="form-check form-check-md d-flex align-items-center">
															<label className="form-check-label mt-0">
																<input className="form-check-input" type="checkbox" />
																Create
															</label>
														</div>
													</td>
													<td>
														<div className="form-check form-check-md d-flex align-items-center">
															<label className="form-check-label mt-0">
																<input className="form-check-input" type="checkbox" />
																Delete
															</label>
														</div>
													</td>
													<td>
														<div className="form-check form-check-md d-flex align-items-center">
															<label className="form-check-label mt-0">
																<input className="form-check-input" type="checkbox" />
																Import
															</label>
														</div>
													</td>
													<td>
														<div className="form-check form-check-md d-flex align-items-center">
															<label className="form-check-label mt-0">
																<input className="form-check-input" type="checkbox" />
																Export
															</label>
														</div>
													</td>
												</tr>
												<tr>
													<td>
														<div className="form-check form-check-md form-switch me-2">
															<label className="form-check-label mt-0">
																<input className="form-check-input me-2" type="checkbox"
																	role="switch" />
																Projects
															</label>
														</div>
													</td>
													<td>
														<div className="form-check form-check-md d-flex align-items-center">
															<label className="form-check-label mt-0">
																<input className="form-check-input" type="checkbox" />
																Read
															</label>
														</div>
													</td>
													<td>
														<div className="form-check form-check-md d-flex align-items-center">
															<label className="form-check-label mt-0">
																<input className="form-check-input" type="checkbox" />
																Write
															</label>
														</div>
													</td>
													<td>
														<div className="form-check form-check-md d-flex align-items-center">
															<label className="form-check-label mt-0">
																<input className="form-check-input" type="checkbox" />
																Create
															</label>
														</div>
													</td>
													<td>
														<div className="form-check form-check-md d-flex align-items-center">
															<label className="form-check-label mt-0">
																<input className="form-check-input" type="checkbox" />
																Delete
															</label>
														</div>
													</td>
													<td>
														<div className="form-check form-check-md d-flex align-items-center">
															<label className="form-check-label mt-0">
																<input className="form-check-input" type="checkbox" />
																Import
															</label>
														</div>
													</td>
													<td>
														<div className="form-check form-check-md d-flex align-items-center">
															<label className="form-check-label mt-0">
																<input className="form-check-input" type="checkbox" />
																Export
															</label>
														</div>
													</td>
												</tr>
												<tr>
													<td>
														<div className="form-check form-check-md form-switch me-2">
															<label className="form-check-label mt-0">
																<input className="form-check-input me-2" type="checkbox"
																	role="switch" />
																Tasks
															</label>
														</div>
													</td>
													<td>
														<div className="form-check form-check-md d-flex align-items-center">
															<label className="form-check-label mt-0">
																<input className="form-check-input" type="checkbox" />
																Read
															</label>
														</div>
													</td>
													<td>
														<div className="form-check form-check-md d-flex align-items-center">
															<label className="form-check-label mt-0">
																<input className="form-check-input" type="checkbox" />
																Write
															</label>
														</div>
													</td>
													<td>
														<div className="form-check form-check-md d-flex align-items-center">
															<label className="form-check-label mt-0">
																<input className="form-check-input" type="checkbox" />
																Create
															</label>
														</div>
													</td>
													<td>
														<div className="form-check form-check-md d-flex align-items-center">
															<label className="form-check-label mt-0">
																<input className="form-check-input" type="checkbox" />
																Delete
															</label>
														</div>
													</td>
													<td>
														<div className="form-check form-check-md d-flex align-items-center">
															<label className="form-check-label mt-0">
																<input className="form-check-input" type="checkbox" />
																Import
															</label>
														</div>
													</td>
													<td>
														<div className="form-check form-check-md d-flex align-items-center">
															<label className="form-check-label mt-0">
																<input className="form-check-input" type="checkbox" />
																Export
															</label>
														</div>
													</td>
												</tr>
												<tr>
													<td>
														<div className="form-check form-check-md form-switch me-2">
															<label className="form-check-label mt-0">
																<input className="form-check-input me-2" type="checkbox"
																	role="switch" />
																Chats
															</label>
														</div>
													</td>
													<td>
														<div className="form-check form-check-md d-flex align-items-center">
															<label className="form-check-label mt-0">
																<input className="form-check-input" type="checkbox" />
																Read
															</label>
														</div>
													</td>
													<td>
														<div className="form-check form-check-md d-flex align-items-center">
															<label className="form-check-label mt-0">
																<input className="form-check-input" type="checkbox" />
																Write
															</label>
														</div>
													</td>
													<td>
														<div className="form-check form-check-md d-flex align-items-center">
															<label className="form-check-label mt-0">
																<input className="form-check-input" type="checkbox" />
																Create
															</label>
														</div>
													</td>
													<td>
														<div className="form-check form-check-md d-flex align-items-center">
															<label className="form-check-label mt-0">
																<input className="form-check-input" type="checkbox" />
																Delete
															</label>
														</div>
													</td>
													<td>
														<div className="form-check form-check-md d-flex align-items-center">
															<label className="form-check-label mt-0">
																<input className="form-check-input" type="checkbox" />
																Import
															</label>
														</div>
													</td>
													<td>
														<div className="form-check form-check-md d-flex align-items-center">
															<label className="form-check-label mt-0">
																<input className="form-check-input" type="checkbox" />
																Export
															</label>
														</div>
													</td>
												</tr>
												<tr>
													<td>
														<div className="form-check form-check-md form-switch me-2">
															<label className="form-check-label mt-0">
																<input className="form-check-input me-2" type="checkbox"
																	role="switch" />
																Assets
															</label>
														</div>
													</td>
													<td>
														<div className="form-check form-check-md d-flex align-items-center">
															<label className="form-check-label mt-0">
																<input className="form-check-input" type="checkbox" />
																Read
															</label>
														</div>
													</td>
													<td>
														<div className="form-check form-check-md d-flex align-items-center">
															<label className="form-check-label mt-0">
																<input className="form-check-input" type="checkbox" />
																Write
															</label>
														</div>
													</td>
													<td>
														<div className="form-check form-check-md d-flex align-items-center">
															<label className="form-check-label mt-0">
																<input className="form-check-input" type="checkbox" />
																Create
															</label>
														</div>
													</td>
													<td>
														<div className="form-check form-check-md d-flex align-items-center">
															<label className="form-check-label mt-0">
																<input className="form-check-input" type="checkbox" />
																Delete
															</label>
														</div>
													</td>
													<td>
														<div className="form-check form-check-md d-flex align-items-center">
															<label className="form-check-label mt-0">
																<input className="form-check-input" type="checkbox" />
																Import
															</label>
														</div>
													</td>
													<td>
														<div className="form-check form-check-md d-flex align-items-center">
															<label className="form-check-label mt-0">
																<input className="form-check-input" type="checkbox" />
																Export
															</label>
														</div>
													</td>
												</tr>
												<tr>
													<td>
														<div className="form-check form-check-md form-switch me-2">
															<label className="form-check-label mt-0">
																<input className="form-check-input me-2" type="checkbox"
																	role="switch" />
																Timing Sheets
															</label>
														</div>
													</td>
													<td>
														<div className="form-check form-check-md d-flex align-items-center">
															<label className="form-check-label mt-0">
																<input className="form-check-input" type="checkbox" />
																Read
															</label>
														</div>
													</td>
													<td>
														<div className="form-check form-check-md d-flex align-items-center">
															<label className="form-check-label mt-0">
																<input className="form-check-input" type="checkbox" />
																Write
															</label>
														</div>
													</td>
													<td>
														<div className="form-check form-check-md d-flex align-items-center">
															<label className="form-check-label mt-0">
																<input className="form-check-input" type="checkbox" />
																Create
															</label>
														</div>
													</td>
													<td>
														<div className="form-check form-check-md d-flex align-items-center">
															<label className="form-check-label mt-0">
																<input className="form-check-input" type="checkbox" />
																Delete
															</label>
														</div>
													</td>
													<td>
														<div className="form-check form-check-md d-flex align-items-center">
															<label className="form-check-label mt-0">
																<input className="form-check-input" type="checkbox" />
																Import
															</label>
														</div>
													</td>
													<td>
														<div className="form-check form-check-md d-flex align-items-center">
															<label className="form-check-label mt-0">
																<input className="form-check-input" type="checkbox" />
																Export
															</label>
														</div>
													</td>
												</tr>
											</tbody>
										</table>
									</div>
								</div>
								<div className="modal-footer">
									<button type="button" className="btn btn-outline-light border me-2"
										data-bs-dismiss="modal">Cancel</button>
									<button type="button" className="btn btn-primary" data-bs-toggle="modal"
										data-bs-target="#success_modal">Save </button>
								</div>
							</div>
						</div>
					</form>
				</div>
			</div>
		</div>
		{/* /Add Client */}

		{/* Edit Client */}
		<div className="modal fade" id="edit_client">
			<div className="modal-dialog modal-dialog-centered modal-lg">
				<div className="modal-content">
					<div className="modal-header">
						<h4 className="modal-title">Edit Client</h4>
						<button type="button" className="btn-close custom-btn-close" data-bs-dismiss="modal" aria-label="Close">
							<i className="ti ti-x"></i>
						</button>
					</div>
					<form action="clients.php">
						<div className="contact-grids-tab">
							<ul className="nav nav-underline" id="myTab2" role="tablist">
								<li className="nav-item" role="presentation">
									<button className="nav-link active" id="info-tab2" data-bs-toggle="tab"
										data-bs-target="#basic-info2" type="button" role="tab" aria-selected="true">Basic
										Information</button>
								</li>
								<li className="nav-item" role="presentation">
									<button className="nav-link" id="address-tab2" data-bs-toggle="tab"
										data-bs-target="#address2" type="button" role="tab"
										aria-selected="false">Permissions</button>
								</li>
							</ul>
						</div>
						<div className="tab-content" id="myTabContent2">
							<div className="tab-pane fade show active" id="basic-info2" role="tabpanel"
								aria-labelledby="info-tab2" tabIndex="0">
								<div className="modal-body pb-0 ">
									<div className="row">
										<div className="col-md-12">
											<div
												className="d-flex align-items-center flex-wrap row-gap-3 bg-light w-100 rounded p-3 mb-4">
												<div
													className="d-flex align-items-center justify-content-center avatar avatar-xxl rounded-circle border border-dashed me-2 flex-shrink-0 text-dark frames">
													<i className="ti ti-photo"></i>
												</div>
												<div className="profile-upload">
													<div className="mb-2">
														<h6 className="mb-1">Upload Profile Image</h6>
														<p className="fs-12">Image should be below 4 mb</p>
													</div>
													<div className="profile-uploader d-flex align-items-center">
														<div className="drag-upload-btn btn btn-sm btn-primary me-2">
															Upload
															<input type="file" className="form-control image-sign" multiple="" />
														</div>
														<a href="javascript:void(0);"
															className="btn btn-light btn-sm">Cancel</a>
													</div>
												</div>
											</div>
										</div>
										<div className="col-md-6">
											<div className="mb-3">
												<label className="form-label">First Name <span className="text-danger">
														*</span></label>
												<input type="text" className="form-control" defaultValue="Michael" />
											</div>
										</div>
										<div className="col-md-6">
											<div className="mb-3">
												<label className="form-label">Last Name</label>
												<input type="email" className="form-control" defaultValue="Walker" />
											</div>
										</div>
										<div className="col-md-6">
											<div className="mb-3">
												<label className="form-label">Username <span className="text-danger">
														*</span></label>
												<input type="text" className="form-control" defaultValue="Michael Walker" />
											</div>
										</div>
										<div className="col-md-6">
											<div className="mb-3">
												<label className="form-label">Email<span className="text-danger"> *</span></label>
												<input type="text" className="form-control" defaultValue="michael@example.com" />
											</div>
										</div>
										<div className="col-md-6">
											<div className="mb-3 ">
												<label className="form-label">Password <span className="text-danger">
														*</span></label>
												<div className="pass-group">
													<input type="password" className="pass-input form-control" defaultValue="1234" />
													<span className="ti toggle-password ti-eye-off"></span>
												</div>
											</div>
										</div>
										<div className="col-md-6">
											<div className="mb-3 ">
												<label className="form-label">Confirm Password <span className="text-danger">
														*</span></label>
												<div className="pass-group">
													<input type="password" className="pass-inputs form-control" defaultValue="1234" />
													<span className="ti toggle-passwords ti-eye-off"></span>
												</div>
											</div>
										</div>
										<div className="col-md-6">
											<div className="mb-3">
												<label className="form-label">Phone Number <span className="text-danger">
														*</span></label>
												<input type="text" className="form-control" defaultValue="(163) 2459 315" />
											</div>
										</div>
										<div className="col-md-6">
											<div className="mb-3">
												<label className="form-label">Company</label>
												<input type="text" className="form-control" defaultValue="BrightWave Innovations" />
											</div>
										</div>
									</div>
								</div>
								<div className="modal-footer">
									<button type="button" className="btn btn-outline-light border me-2"
										data-bs-dismiss="modal">Cancel</button>
									<button type="submit" className="btn btn-primary">Save </button>
								</div>
							</div>
							<div className="tab-pane fade" id="address2" role="tabpanel" aria-labelledby="address-tab2"
								tabIndex="0">
								<div className="modal-body pb-0 ">
									<div className="card bg-light-500 shadow-none">
										<div
											className="card-body d-flex align-items-center justify-content-between flex-wrap row-gap-3">
											<h6>Enable Options</h6>
											<div className="d-flex align-items-center justify-content-end">
												<div className="form-check form-check-md form-switch me-2">
													<label className="form-check-label mt-0">
														<input className="form-check-input me-2" type="checkbox" role="switch" />
														Enable all Module
													</label>
												</div>
												<div className="form-check form-check-md d-flex align-items-center">
													<label className="form-check-label mt-0">
														<input className="form-check-input" type="checkbox" defaultChecked />
														Select All
													</label>
												</div>
											</div>
										</div>
									</div>
									<div className="table-responsive permission-table border rounded">
										<table className="table">
											<tbody>
												<tr>
													<td>
														<div className="form-check form-check-md form-switch me-2">
															<label className="form-check-label mt-0">
																<input className="form-check-input me-2" type="checkbox"
																	role="switch" defaultChecked />
																Holidays
															</label>
														</div>
													</td>
													<td>
														<div className="form-check form-check-md d-flex align-items-center">
															<label className="form-check-label mt-0">
																<input className="form-check-input" type="checkbox" defaultChecked />
																Read
															</label>
														</div>
													</td>
													<td>
														<div className="form-check form-check-md d-flex align-items-center">
															<label className="form-check-label mt-0">
																<input className="form-check-input" type="checkbox" />
																Write
															</label>
														</div>
													</td>
													<td>
														<div className="form-check form-check-md d-flex align-items-center">
															<label className="form-check-label mt-0">
																<input className="form-check-input" type="checkbox" />
																Create
															</label>
														</div>
													</td>
													<td>
														<div className="form-check form-check-md d-flex align-items-center">
															<label className="form-check-label mt-0">
																<input className="form-check-input" type="checkbox" />
																Delete
															</label>
														</div>
													</td>
													<td>
														<div className="form-check form-check-md d-flex align-items-center">
															<label className="form-check-label mt-0">
																<input className="form-check-input" type="checkbox" />
																Import
															</label>
														</div>
													</td>
													<td>
														<div className="form-check form-check-md d-flex align-items-center">
															<label className="form-check-label mt-0">
																<input className="form-check-input" type="checkbox" defaultChecked />
																Export
															</label>
														</div>
													</td>
												</tr>
												<tr>
													<td>
														<div className="form-check form-check-md form-switch me-2">
															<label className="form-check-label mt-0">
																<input className="form-check-input me-2" type="checkbox"
																	role="switch" defaultChecked />
																Leaves
															</label>
														</div>
													</td>
													<td>
														<div className="form-check form-check-md d-flex align-items-center">
															<label className="form-check-label mt-0">
																<input className="form-check-input" type="checkbox" />
																Read
															</label>
														</div>
													</td>
													<td>
														<div className="form-check form-check-md d-flex align-items-center">
															<label className="form-check-label mt-0">
																<input className="form-check-input" type="checkbox" />
																Write
															</label>
														</div>
													</td>
													<td>
														<div className="form-check form-check-md d-flex align-items-center">
															<label className="form-check-label mt-0">
																<input className="form-check-input" type="checkbox" />
																Create
															</label>
														</div>
													</td>
													<td>
														<div className="form-check form-check-md d-flex align-items-center">
															<label className="form-check-label mt-0">
																<input className="form-check-input" type="checkbox" />
																Delete
															</label>
														</div>
													</td>
													<td>
														<div className="form-check form-check-md d-flex align-items-center">
															<label className="form-check-label mt-0">
																<input className="form-check-input" type="checkbox" />
																Import
															</label>
														</div>
													</td>
													<td>
														<div className="form-check form-check-md d-flex align-items-center">
															<label className="form-check-label mt-0">
																<input className="form-check-input" type="checkbox" />
																Export
															</label>
														</div>
													</td>
												</tr>
												<tr>
													<td>
														<div className="form-check form-check-md form-switch me-2">
															<label className="form-check-label mt-0">
																<input className="form-check-input me-2" type="checkbox"
																	role="switch" />
																Clients
															</label>
														</div>
													</td>
													<td>
														<div className="form-check form-check-md d-flex align-items-center">
															<label className="form-check-label mt-0">
																<input className="form-check-input" type="checkbox" />
																Read
															</label>
														</div>
													</td>
													<td>
														<div className="form-check form-check-md d-flex align-items-center">
															<label className="form-check-label mt-0">
																<input className="form-check-input" type="checkbox" />
																Write
															</label>
														</div>
													</td>
													<td>
														<div className="form-check form-check-md d-flex align-items-center">
															<label className="form-check-label mt-0">
																<input className="form-check-input" type="checkbox" />
																Create
															</label>
														</div>
													</td>
													<td>
														<div className="form-check form-check-md d-flex align-items-center">
															<label className="form-check-label mt-0">
																<input className="form-check-input" type="checkbox" />
																Delete
															</label>
														</div>
													</td>
													<td>
														<div className="form-check form-check-md d-flex align-items-center">
															<label className="form-check-label mt-0">
																<input className="form-check-input" type="checkbox" />
																Import
															</label>
														</div>
													</td>
													<td>
														<div className="form-check form-check-md d-flex align-items-center">
															<label className="form-check-label mt-0">
																<input className="form-check-input" type="checkbox" />
																Export
															</label>
														</div>
													</td>
												</tr>
												<tr>
													<td>
														<div className="form-check form-check-md form-switch me-2">
															<label className="form-check-label mt-0">
																<input className="form-check-input me-2" type="checkbox"
																	role="switch" />
																Projects
															</label>
														</div>
													</td>
													<td>
														<div className="form-check form-check-md d-flex align-items-center">
															<label className="form-check-label mt-0">
																<input className="form-check-input" type="checkbox" />
																Read
															</label>
														</div>
													</td>
													<td>
														<div className="form-check form-check-md d-flex align-items-center">
															<label className="form-check-label mt-0">
																<input className="form-check-input" type="checkbox" />
																Write
															</label>
														</div>
													</td>
													<td>
														<div className="form-check form-check-md d-flex align-items-center">
															<label className="form-check-label mt-0">
																<input className="form-check-input" type="checkbox" />
																Create
															</label>
														</div>
													</td>
													<td>
														<div className="form-check form-check-md d-flex align-items-center">
															<label className="form-check-label mt-0">
																<input className="form-check-input" type="checkbox" defaultChecked />
																Delete
															</label>
														</div>
													</td>
													<td>
														<div className="form-check form-check-md d-flex align-items-center">
															<label className="form-check-label mt-0">
																<input className="form-check-input" type="checkbox" />
																Import
															</label>
														</div>
													</td>
													<td>
														<div className="form-check form-check-md d-flex align-items-center">
															<label className="form-check-label mt-0">
																<input className="form-check-input" type="checkbox" />
																Export
															</label>
														</div>
													</td>
												</tr>
												<tr>
													<td>
														<div className="form-check form-check-md form-switch me-2">
															<label className="form-check-label mt-0">
																<input className="form-check-input me-2" type="checkbox"
																	role="switch" />
																Tasks
															</label>
														</div>
													</td>
													<td>
														<div className="form-check form-check-md d-flex align-items-center">
															<label className="form-check-label mt-0">
																<input className="form-check-input" type="checkbox" />
																Read
															</label>
														</div>
													</td>
													<td>
														<div className="form-check form-check-md d-flex align-items-center">
															<label className="form-check-label mt-0">
																<input className="form-check-input" type="checkbox" />
																Write
															</label>
														</div>
													</td>
													<td>
														<div className="form-check form-check-md d-flex align-items-center">
															<label className="form-check-label mt-0">
																<input className="form-check-input" type="checkbox" />
																Create
															</label>
														</div>
													</td>
													<td>
														<div className="form-check form-check-md d-flex align-items-center">
															<label className="form-check-label mt-0">
																<input className="form-check-input" type="checkbox" defaultChecked />
																Delete
															</label>
														</div>
													</td>
													<td>
														<div className="form-check form-check-md d-flex align-items-center">
															<label className="form-check-label mt-0">
																<input className="form-check-input" type="checkbox" />
																Import
															</label>
														</div>
													</td>
													<td>
														<div className="form-check form-check-md d-flex align-items-center">
															<label className="form-check-label mt-0">
																<input className="form-check-input" type="checkbox" />
																Export
															</label>
														</div>
													</td>
												</tr>
												<tr>
													<td>
														<div className="form-check form-check-md form-switch me-2">
															<label className="form-check-label mt-0">
																<input className="form-check-input me-2" type="checkbox"
																	role="switch" />
																Chats
															</label>
														</div>
													</td>
													<td>
														<div className="form-check form-check-md d-flex align-items-center">
															<label className="form-check-label mt-0">
																<input className="form-check-input" type="checkbox" />
																Read
															</label>
														</div>
													</td>
													<td>
														<div className="form-check form-check-md d-flex align-items-center">
															<label className="form-check-label mt-0">
																<input className="form-check-input" type="checkbox" />
																Write
															</label>
														</div>
													</td>
													<td>
														<div className="form-check form-check-md d-flex align-items-center">
															<label className="form-check-label mt-0">
																<input className="form-check-input" type="checkbox" defaultChecked />
																Create
															</label>
														</div>
													</td>
													<td>
														<div className="form-check form-check-md d-flex align-items-center">
															<label className="form-check-label mt-0">
																<input className="form-check-input" type="checkbox" />
																Delete
															</label>
														</div>
													</td>
													<td>
														<div className="form-check form-check-md d-flex align-items-center">
															<label className="form-check-label mt-0">
																<input className="form-check-input" type="checkbox" />
																Import
															</label>
														</div>
													</td>
													<td>
														<div className="form-check form-check-md d-flex align-items-center">
															<label className="form-check-label mt-0">
																<input className="form-check-input" type="checkbox" />
																Export
															</label>
														</div>
													</td>
												</tr>
												<tr>
													<td>
														<div className="form-check form-check-md form-switch me-2">
															<label className="form-check-label mt-0">
																<input className="form-check-input me-2" type="checkbox"
																	role="switch" />
																Assets
															</label>
														</div>
													</td>
													<td>
														<div className="form-check form-check-md d-flex align-items-center">
															<label className="form-check-label mt-0">
																<input className="form-check-input" type="checkbox" />
																Read
															</label>
														</div>
													</td>
													<td>
														<div className="form-check form-check-md d-flex align-items-center">
															<label className="form-check-label mt-0">
																<input className="form-check-input" type="checkbox" />
																Write
															</label>
														</div>
													</td>
													<td>
														<div className="form-check form-check-md d-flex align-items-center">
															<label className="form-check-label mt-0">
																<input className="form-check-input" type="checkbox" />
																Create
															</label>
														</div>
													</td>
													<td>
														<div className="form-check form-check-md d-flex align-items-center">
															<label className="form-check-label mt-0">
																<input className="form-check-input" type="checkbox" />
																Delete
															</label>
														</div>
													</td>
													<td>
														<div className="form-check form-check-md d-flex align-items-center">
															<label className="form-check-label mt-0">
																<input className="form-check-input" type="checkbox" />
																Import
															</label>
														</div>
													</td>
													<td>
														<div className="form-check form-check-md d-flex align-items-center">
															<label className="form-check-label mt-0">
																<input className="form-check-input" type="checkbox" />
																Export
															</label>
														</div>
													</td>
												</tr>
												<tr>
													<td>
														<div className="form-check form-check-md form-switch me-2">
															<label className="form-check-label mt-0">
																<input className="form-check-input me-2" type="checkbox"
																	role="switch" />
																Timing Sheets
															</label>
														</div>
													</td>
													<td>
														<div className="form-check form-check-md d-flex align-items-center">
															<label className="form-check-label mt-0">
																<input className="form-check-input" type="checkbox" />
																Read
															</label>
														</div>
													</td>
													<td>
														<div className="form-check form-check-md d-flex align-items-center">
															<label className="form-check-label mt-0">
																<input className="form-check-input" type="checkbox" />
																Write
															</label>
														</div>
													</td>
													<td>
														<div className="form-check form-check-md d-flex align-items-center">
															<label className="form-check-label mt-0">
																<input className="form-check-input" type="checkbox" />
																Create
															</label>
														</div>
													</td>
													<td>
														<div className="form-check form-check-md d-flex align-items-center">
															<label className="form-check-label mt-0">
																<input className="form-check-input" type="checkbox" />
																Delete
															</label>
														</div>
													</td>
													<td>
														<div className="form-check form-check-md d-flex align-items-center">
															<label className="form-check-label mt-0">
																<input className="form-check-input" type="checkbox" />
																Import
															</label>
														</div>
													</td>
													<td>
														<div className="form-check form-check-md d-flex align-items-center">
															<label className="form-check-label mt-0">
																<input className="form-check-input" type="checkbox" />
																Export
															</label>
														</div>
													</td>
												</tr>
											</tbody>
										</table>
									</div>
								</div>
								<div className="modal-footer">
									<button type="button" className="btn btn-outline-light border me-2"
										data-bs-dismiss="modal">Cancel</button>
									<button type="submit" className="btn btn-primary">Save </button>
								</div>
							</div>
						</div>
					</form>
				</div>
			</div>
		</div>
		{/* /Edit Client */}

		{/* Add Client Success */}
		<div className="modal fade" id="success_modal" role="dialog">
			<div className="modal-dialog modal-dialog-centered modal-sm">
				<div className="modal-content">
					<div className="modal-body">
						<div className="text-center p-3">
							<span className="avatar avatar-lg avatar-rounded bg-success mb-3"><i
									className="ti ti-check fs-24"></i></span>
							<h5 className="mb-2">Client Added Successfully</h5>
							<p className="mb-3">Stephan Peralt has been added with Client ID : <span className="text-primary">#CLT -
									0024</span>
							</p>
							<div>
								<div className="row g-2">
									<div className="col-6">
										<a href="clients.php" className="btn btn-dark w-100">Back to List</a>
									</div>
									<div className="col-6">
										<a href="client-details.php" className="btn btn-primary w-100">Detail Page</a>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
		{/* /Add Client Success */}

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
							<a href="javascript:void(0);" className="btn btn-light me-3" data-bs-dismiss="modal">Cancel</a>
							<a href="clients.php" className="btn btn-danger">Yes, Delete</a>
						</div>
					</div>
				</div>
			</div>
		</div>
		{/* /Delete Modal */}
        </>
    );
};

export default ClientsPage;


