import React from "react";
import { Link } from "react-router-dom";

const CompaniesGridPage = () => {
    return (
        <>
			<div className="content">

			
				<div className="d-md-flex d-block align-items-center justify-content-between page-breadcrumb mb-3">
					<div className="my-auto mb-2">
						<h2 className="mb-1">Companies</h2>
						<nav>
							<ol className="breadcrumb mb-0">
								<li className="breadcrumb-item">
									<a href="admin-dashboard.php"><i className="ti ti-smart-home"></i></a>
								</li>
								<li className="breadcrumb-item">
									CRM
								</li>
								<li className="breadcrumb-item active" aria-current="page">Companies Grid</li>
							</ol>
						</nav>
					</div>
					<div className="d-flex my-xl-auto right-content align-items-center flex-wrap ">
						<div className="me-2 mb-2">
							<div className="d-flex align-items-center border bg-white rounded p-1 me-2 icon-list">
								<Link to="/companies" className="btn btn-icon btn-sm me-1"><i className="ti ti-list-tree"></i></Link>
								<Link to="/companies?view=grid" className="btn btn-icon btn-sm active bg-primary text-white"><i className="ti ti-layout-grid"></i></Link>
							</div>
						</div>
						<div className="mb-2">
							<a href="#" data-bs-toggle="modal" data-bs-target="#add_company" className="btn btn-primary d-flex align-items-center"><i className="ti ti-circle-plus me-2"></i>Add Company</a>
						</div>
						<div className="head-icons ms-2">
							<a href="javascript:void(0);" className="" data-bs-toggle="tooltip" data-bs-placement="top" data-bs-original-title="Collapse" id="collapse-header">
								<i className="ti ti-chevrons-up"></i>
							</a>
						</div>
					</div>
				</div>
				

				<div className="card">
					<div className="card-body p-3">
						<div className="d-flex align-items-center justify-content-between">
							<h5>Companies Grid</h5>
							<div></div>
						</div>
					</div>
				</div>

				<div className="row">
					<div className="col-xl-3 col-lg-4 col-md-6">
						<div className="card">
							<div className="card-body">
								<div className="d-flex justify-content-between align-items-start mb-2">
									<div className="form-check form-check-md">
										<input className="form-check-input" type="checkbox" />
									</div>
									<div>
										<a href="company-details.php" className="avatar avatar-xl avatar-rounded online border rounded-circle">
											<img src="assets/img/company/company-12.svg" className="img-fluid h-auto w-auto" alt="img" />
										</a>
									</div>
									<div className="dropdown">
										<button className="btn btn-icon btn-sm rounded-circle" type="button" data-bs-toggle="dropdown" aria-expanded="false">
											<i className="ti ti-dots-vertical"></i>
										</button>
										<ul className="dropdown-menu dropdown-menu-end p-3">
											<li>
												<a className="dropdown-item rounded-1" href="javascript:void(0);" data-bs-toggle="modal" data-bs-target="#edit_company"><i className="ti ti-edit me-1"></i>Edit</a>
											</li>
											<li>
												<a className="dropdown-item rounded-1" href="javascript:void(0);" data-bs-toggle="modal" data-bs-target="#delete_modal"><i className="ti ti-trash me-1"></i>Delete</a>
											</li>
										</ul>
									</div>
								</div>
								<div className="text-center mb-3">
									<h6 className="mb-1"><a href="company-details.php">BrightWave Innovations</a></h6>
									<div className="avatar-list-stacked avatar-group-sm">
										<span className="avatar avatar-rounded">
											<img className="border border-white" src="assets/img/profiles/avatar-05.jpg" alt="img" />
										</span>
										<span className="avatar avatar-rounded">
											<img className="border border-white" src="assets/img/profiles/avatar-06.jpg" alt="img" />
										</span>
										<span className="avatar avatar-rounded">
											<img className="border border-white" src="assets/img/profiles/avatar-07.jpg" alt="img" />
										</span>
										<span className="avatar avatar-rounded">
											<img className="border border-white" src="assets/img/profiles/avatar-08.jpg" alt="img" />
										</span>
										<span className="avatar avatar-rounded">
											<img className="border border-white" src="assets/img/profiles/avatar-09.jpg" alt="img" />
										</span>
										<a className="avatar bg-primary avatar-rounded text-fixed-white fs-12" href="javascript:void(0);">
											+1
										</a>
									</div>
								</div>
								<div className="d-flex flex-column">
									<p className="text-dark d-inline-flex align-items-center mb-2">
										<i className="ti ti-mail-forward text-gray-5 me-2"></i>
										<a href="/cdn-cgi/l/email-protection" className="__cf_email__" data-cfemail="8befeaf9e7eeeecbeef3eae6fbe7eea5e8e4e6">[email&#160;protected]</a>
									</p>
									<p className="text-dark d-inline-flex align-items-center mb-2">
										<i className="ti ti-phone text-gray-5 me-2"></i>
										(163) 2459 315
									</p>
									<p className="text-dark d-inline-flex align-items-center">
										<i className="ti ti-map-pin text-gray-5 me-2"></i>
										Germany
									</p>
								</div>
								<div className="d-flex align-items-center justify-content-between border-top pt-3 mt-3">
									<div className="icons-social d-flex align-items-center">
										<a href="#" className="avatar avatar-rounded avatar-sm me-1"><i className="ti ti-mail"></i></a>
										<a href="#" className="avatar avatar-rounded avatar-sm me-1"><i className="ti ti-phone-call"></i></a>
										<a href="#" className="avatar avatar-rounded avatar-sm me-1"><i className="ti ti-message-2"></i></a>
										<a href="#" className="avatar avatar-rounded avatar-sm me-1"><i className="ti ti-brand-skype"></i></a>
										<a href="#" className="avatar avatar-rounded avatar-sm"><i className="ti ti-brand-facebook"></i></a>
									</div>
									<span className="d-inline-flex align-items-center"><i className="ti ti-star-filled text-warning me-1"></i>4.2</span>
								</div>
							</div>
						</div>
					</div>
					<div className="col-xl-3 col-lg-4 col-md-6">
						<div className="card">
							<div className="card-body">
								<div className="d-flex justify-content-between align-items-start mb-2">
									<div className="form-check form-check-md">
										<input className="form-check-input" type="checkbox" />
									</div>
									<div>
										<a href="company-details.php" className="avatar avatar-xl avatar-rounded online border rounded-circle">
											<img src="assets/img/company/company-13.svg" className="img-fluid h-auto w-auto" alt="img" />
										</a>
									</div>
									<div className="dropdown">
										<button className="btn btn-icon btn-sm rounded-circle" type="button" data-bs-toggle="dropdown" aria-expanded="false">
											<i className="ti ti-dots-vertical"></i>
										</button>
										<ul className="dropdown-menu dropdown-menu-end p-3">
											<li>
												<a className="dropdown-item rounded-1" href="javascript:void(0);" data-bs-toggle="modal" data-bs-target="#edit_company"><i className="ti ti-edit me-1"></i>Edit</a>
											</li>
											<li>
												<a className="dropdown-item rounded-1" href="javascript:void(0);" data-bs-toggle="modal" data-bs-target="#delete_modal"><i className="ti ti-trash me-1"></i>Delete</a>
											</li>
										</ul>
									</div>
								</div>
								<div className="text-center mb-3">
									<h6 className="mb-1"><a href="company-details.php">Stellar Dynamics</a></h6>
									<div className="avatar-list-stacked avatar-group-sm">
										<span className="avatar avatar-rounded">
											<img className="border border-white" src="assets/img/profiles/avatar-01.jpg" alt="img" />
										</span>
										<span className="avatar avatar-rounded">
											<img className="border border-white" src="assets/img/profiles/avatar-02.jpg" alt="img" />
										</span>
										<span className="avatar avatar-rounded">
											<img className="border border-white" src="assets/img/profiles/avatar-03.jpg" alt="img" />
										</span>
										<span className="avatar avatar-rounded">
											<img className="border border-white" src="assets/img/profiles/avatar-04.jpg" alt="img" />
										</span>
										<span className="avatar avatar-rounded">
											<img className="border border-white" src="assets/img/profiles/avatar-05.jpg" alt="img" />
										</span>
										<a className="avatar bg-primary avatar-rounded text-fixed-white fs-12" href="javascript:void(0);">
											+1
										</a>
									</div>
								</div>
								<div className="d-flex flex-column">
									<p className="text-dark d-inline-flex align-items-center mb-2">
										<i className="ti ti-mail-forward text-gray-5 me-2"></i>
										<a href="/cdn-cgi/l/email-protection" className="__cf_email__" data-cfemail="6a19020b1805042a0f120b071a060f44090507">[email&#160;protected]</a>
									</p>
									<p className="text-dark d-inline-flex align-items-center mb-2">
										<i className="ti ti-phone text-gray-5 me-2"></i>
										(146) 1249 296
									</p>
									<p className="text-dark d-inline-flex align-items-center">
										<i className="ti ti-map-pin text-gray-5 me-2"></i>
										USA
									</p>
								</div>
								<div className="d-flex align-items-center justify-content-between border-top pt-3 mt-3">
									<div className="icons-social d-flex align-items-center">
										<a href="#" className="avatar avatar-rounded avatar-sm me-1"><i className="ti ti-mail"></i></a>
										<a href="#" className="avatar avatar-rounded avatar-sm me-1"><i className="ti ti-phone-call"></i></a>
										<a href="#" className="avatar avatar-rounded avatar-sm me-1"><i className="ti ti-message-2"></i></a>
										<a href="#" className="avatar avatar-rounded avatar-sm me-1"><i className="ti ti-brand-skype"></i></a>
										<a href="#" className="avatar avatar-rounded avatar-sm"><i className="ti ti-brand-facebook"></i></a>
									</div>
									<span className="d-inline-flex align-items-center"><i className="ti ti-star-filled text-warning me-1"></i>5.0</span>
								</div>
							</div>
						</div>
					</div>
					<div className="col-xl-3 col-lg-4 col-md-6">
						<div className="card">
							<div className="card-body">
								<div className="d-flex justify-content-between align-items-start mb-2">
									<div className="form-check form-check-md">
										<input className="form-check-input" type="checkbox" />
									</div>
									<div>
										<a href="company-details.php" className="avatar avatar-xl avatar-rounded online border rounded-circle">
											<img src="assets/img/company/company-14.svg" className="img-fluid h-auto w-auto" alt="img" />
										</a>
									</div>
									<div className="dropdown">
										<button className="btn btn-icon btn-sm rounded-circle" type="button" data-bs-toggle="dropdown" aria-expanded="false">
											<i className="ti ti-dots-vertical"></i>
										</button>
										<ul className="dropdown-menu dropdown-menu-end p-3">
											<li>
												<a className="dropdown-item rounded-1" href="javascript:void(0);" data-bs-toggle="modal" data-bs-target="#edit_company"><i className="ti ti-edit me-1"></i>Edit</a>
											</li>
											<li>
												<a className="dropdown-item rounded-1" href="javascript:void(0);" data-bs-toggle="modal" data-bs-target="#delete_modal"><i className="ti ti-trash me-1"></i>Delete</a>
											</li>
										</ul>
									</div>
								</div>
								<div className="text-center mb-3">
									<h6 className="mb-1"><a href="company-details.php">Quantum Nexus</a></h6>
									<div className="avatar-list-stacked avatar-group-sm">
										<span className="avatar avatar-rounded">
											<img className="border border-white" src="assets/img/profiles/avatar-06.jpg" alt="img" />
										</span>
										<span className="avatar avatar-rounded">
											<img className="border border-white" src="assets/img/profiles/avatar-07.jpg" alt="img" />
										</span>
										<span className="avatar avatar-rounded">
											<img className="border border-white" src="assets/img/profiles/avatar-03.jpg" alt="img" />
										</span>
										<span className="avatar avatar-rounded">
											<img className="border border-white" src="assets/img/profiles/avatar-04.jpg" alt="img" />
										</span>
										<span className="avatar avatar-rounded">
											<img className="border border-white" src="assets/img/profiles/avatar-05.jpg" alt="img" />
										</span>
										<a className="avatar bg-primary avatar-rounded text-fixed-white fs-12" href="javascript:void(0);">
											+1
										</a>
									</div>
								</div>
								<div className="d-flex flex-column">
									<p className="text-dark d-inline-flex align-items-center mb-2">
										<i className="ti ti-mail-forward text-gray-5 me-2"></i>
										<a href="/cdn-cgi/l/email-protection" className="__cf_email__" data-cfemail="b0c6d1c5d7d8d1def0d5c8d1ddc0dcd59ed3dfdd">[email&#160;protected]</a>
									</p>
									<p className="text-dark d-inline-flex align-items-center mb-2">
										<i className="ti ti-phone text-gray-5 me-2"></i>
										(158) 3459 596
									</p>
									<p className="text-dark d-inline-flex align-items-center">
										<i className="ti ti-map-pin text-gray-5 me-2"></i>
										India
									</p>
								</div>
								<div className="d-flex align-items-center justify-content-between border-top pt-3 mt-3">
									<div className="icons-social d-flex align-items-center">
										<a href="#" className="avatar avatar-rounded avatar-sm me-1"><i className="ti ti-mail"></i></a>
										<a href="#" className="avatar avatar-rounded avatar-sm me-1"><i className="ti ti-phone-call"></i></a>
										<a href="#" className="avatar avatar-rounded avatar-sm me-1"><i className="ti ti-message-2"></i></a>
										<a href="#" className="avatar avatar-rounded avatar-sm me-1"><i className="ti ti-brand-skype"></i></a>
										<a href="#" className="avatar avatar-rounded avatar-sm"><i className="ti ti-brand-facebook"></i></a>
									</div>
									<span className="d-inline-flex align-items-center"><i className="ti ti-star-filled text-warning me-1"></i>4.5</span>
								</div>
							</div>
						</div>
					</div>
					<div className="col-xl-3 col-lg-4 col-md-6">
						<div className="card">
							<div className="card-body">
								<div className="d-flex justify-content-between align-items-start mb-2">
									<div className="form-check form-check-md">
										<input className="form-check-input" type="checkbox" />
									</div>
									<div>
										<a href="company-details.php" className="avatar avatar-xl avatar-rounded online border rounded-circle">
											<img src="assets/img/company/company-15.svg" className="img-fluid h-auto w-auto" alt="img" />
										</a>
									</div>
									<div className="dropdown">
										<button className="btn btn-icon btn-sm rounded-circle" type="button" data-bs-toggle="dropdown" aria-expanded="false">
											<i className="ti ti-dots-vertical"></i>
										</button>
										<ul className="dropdown-menu dropdown-menu-end p-3">
											<li>
												<a className="dropdown-item rounded-1" href="javascript:void(0);" data-bs-toggle="modal" data-bs-target="#edit_company"><i className="ti ti-edit me-1"></i>Edit</a>
											</li>
											<li>
												<a className="dropdown-item rounded-1" href="javascript:void(0);" data-bs-toggle="modal" data-bs-target="#delete_modal"><i className="ti ti-trash me-1"></i>Delete</a>
											</li>
										</ul>
									</div>
								</div>
								<div className="text-center mb-3">
									<h6 className="mb-1"><a href="company-details.php">EcoVision Enterprises</a></h6>
									<div className="avatar-list-stacked avatar-group-sm">
										<span className="avatar avatar-rounded">
											<img className="border border-white" src="assets/img/profiles/avatar-08.jpg" alt="img" />
										</span>
										<span className="avatar avatar-rounded">
											<img className="border border-white" src="assets/img/profiles/avatar-09.jpg" alt="img" />
										</span>
										<span className="avatar avatar-rounded">
											<img className="border border-white" src="assets/img/profiles/avatar-10.jpg" alt="img" />
										</span>
										<span className="avatar avatar-rounded">
											<img className="border border-white" src="assets/img/profiles/avatar-11.jpg" alt="img" />
										</span>
										<span className="avatar avatar-rounded">
											<img className="border border-white" src="assets/img/profiles/avatar-12.jpg" alt="img" />
										</span>
										<a className="avatar bg-primary avatar-rounded text-fixed-white fs-12" href="javascript:void(0);">
											+1
										</a>
									</div>
								</div>
								<div className="d-flex flex-column">
									<p className="text-dark d-inline-flex align-items-center mb-2">
										<i className="ti ti-mail-forward text-gray-5 me-2"></i>
										<a href="/cdn-cgi/l/email-protection" className="__cf_email__" data-cfemail="d2b8b7a1a1bbb1b392b7aab3bfa2beb7fcb1bdbf">[email&#160;protected]</a>
									</p>
									<p className="text-dark d-inline-flex align-items-center mb-2">
										<i className="ti ti-phone text-gray-5 me-2"></i>
										(135) 3489 516
									</p>
									<p className="text-dark d-inline-flex align-items-center">
										<i className="ti ti-map-pin text-gray-5 me-2"></i>
										Canada
									</p>
								</div>
								<div className="d-flex align-items-center justify-content-between border-top pt-3 mt-3">
									<div className="icons-social d-flex align-items-center">
										<a href="#" className="avatar avatar-rounded avatar-sm me-1"><i className="ti ti-mail"></i></a>
										<a href="#" className="avatar avatar-rounded avatar-sm me-1"><i className="ti ti-phone-call"></i></a>
										<a href="#" className="avatar avatar-rounded avatar-sm me-1"><i className="ti ti-message-2"></i></a>
										<a href="#" className="avatar avatar-rounded avatar-sm me-1"><i className="ti ti-brand-skype"></i></a>
										<a href="#" className="avatar avatar-rounded avatar-sm"><i className="ti ti-brand-facebook"></i></a>
									</div>
									<span className="d-inline-flex align-items-center"><i className="ti ti-star-filled text-warning me-1"></i>4.5</span>
								</div>
							</div>
						</div>
					</div>
					<div className="col-xl-3 col-lg-4 col-md-6">
						<div className="card">
							<div className="card-body">
								<div className="d-flex justify-content-between align-items-start mb-2">
									<div className="form-check form-check-md">
										<input className="form-check-input" type="checkbox" />
									</div>
									<div>
										<a href="company-details.php" className="avatar avatar-xl avatar-rounded online border rounded-circle">
											<img src="assets/img/company/company-16.svg" className="img-fluid h-auto w-auto" alt="img" />
										</a>
									</div>
									<div className="dropdown">
										<button className="btn btn-icon btn-sm rounded-circle" type="button" data-bs-toggle="dropdown" aria-expanded="false">
											<i className="ti ti-dots-vertical"></i>
										</button>
										<ul className="dropdown-menu dropdown-menu-end p-3">
											<li>
												<a className="dropdown-item rounded-1" href="javascript:void(0);" data-bs-toggle="modal" data-bs-target="#edit_company"><i className="ti ti-edit me-1"></i>Edit</a>
											</li>
											<li>
												<a className="dropdown-item rounded-1" href="javascript:void(0);" data-bs-toggle="modal" data-bs-target="#delete_modal"><i className="ti ti-trash me-1"></i>Delete</a>
											</li>
										</ul>
									</div>
								</div>
								<div className="text-center mb-3">
									<h6 className="mb-1"><a href="company-details.php">Aurora Technologies</a></h6>
									<div className="avatar-list-stacked avatar-group-sm">
										<span className="avatar avatar-rounded">
											<img className="border border-white" src="assets/img/profiles/avatar-13.jpg" alt="img" />
										</span>
										<span className="avatar avatar-rounded">
											<img className="border border-white" src="assets/img/profiles/avatar-14.jpg" alt="img" />
										</span>
										<span className="avatar avatar-rounded">
											<img className="border border-white" src="assets/img/profiles/avatar-15.jpg" alt="img" />
										</span>
										<span className="avatar avatar-rounded">
											<img className="border border-white" src="assets/img/profiles/avatar-16.jpg" alt="img" />
										</span>
										<span className="avatar avatar-rounded">
											<img className="border border-white" src="assets/img/profiles/avatar-17.jpg" alt="img" />
										</span>
										<a className="avatar bg-primary avatar-rounded text-fixed-white fs-12" href="javascript:void(0);">
											+1
										</a>
									</div>
								</div>
								<div className="d-flex flex-column">
									<p className="text-dark d-inline-flex align-items-center mb-2">
										<i className="ti ti-mail-forward text-gray-5 me-2"></i>
										<a href="/cdn-cgi/l/email-protection" className="__cf_email__" data-cfemail="7d1e1c0f12113d18051c100d1118531e1210">[email&#160;protected]</a>
									</p>
									<p className="text-dark d-inline-flex align-items-center mb-2">
										<i className="ti ti-phone text-gray-5 me-2"></i>
										(196) 4862 196
									</p>
									<p className="text-dark d-inline-flex align-items-center">
										<i className="ti ti-map-pin text-gray-5 me-2"></i>
										China
									</p>
								</div>
								<div className="d-flex align-items-center justify-content-between border-top pt-3 mt-3">
									<div className="icons-social d-flex align-items-center">
										<a href="#" className="avatar avatar-rounded avatar-sm me-1"><i className="ti ti-mail"></i></a>
										<a href="#" className="avatar avatar-rounded avatar-sm me-1"><i className="ti ti-phone-call"></i></a>
										<a href="#" className="avatar avatar-rounded avatar-sm me-1"><i className="ti ti-message-2"></i></a>
										<a href="#" className="avatar avatar-rounded avatar-sm me-1"><i className="ti ti-brand-skype"></i></a>
										<a href="#" className="avatar avatar-rounded avatar-sm"><i className="ti ti-brand-facebook"></i></a>
									</div>
									<span className="d-inline-flex align-items-center"><i className="ti ti-star-filled text-warning me-1"></i>3.0</span>
								</div>
							</div>
						</div>
					</div>
					<div className="col-xl-3 col-lg-4 col-md-6">
						<div className="card">
							<div className="card-body">
								<div className="d-flex justify-content-between align-items-start mb-2">
									<div className="form-check form-check-md">
										<input className="form-check-input" type="checkbox" />
									</div>
									<div>
										<a href="company-details.php" className="avatar avatar-xl avatar-rounded online border rounded-circle">
											<img src="assets/img/company/company-17.svg" className="img-fluid h-auto w-auto" alt="img" />
										</a>
									</div>
									<div className="dropdown">
										<button className="btn btn-icon btn-sm rounded-circle" type="button" data-bs-toggle="dropdown" aria-expanded="false">
											<i className="ti ti-dots-vertical"></i>
										</button>
										<ul className="dropdown-menu dropdown-menu-end p-3">
											<li>
												<a className="dropdown-item rounded-1" href="javascript:void(0);" data-bs-toggle="modal" data-bs-target="#edit_company"><i className="ti ti-edit me-1"></i>Edit</a>
											</li>
											<li>
												<a className="dropdown-item rounded-1" href="javascript:void(0);" data-bs-toggle="modal" data-bs-target="#delete_modal"><i className="ti ti-trash me-1"></i>Delete</a>
											</li>
										</ul>
									</div>
								</div>
								<div className="text-center mb-3">
									<h6 className="mb-1"><a href="company-details.php">BlueSky Ventures</a></h6>
									<div className="avatar-list-stacked avatar-group-sm">
										<span className="avatar avatar-rounded">
											<img className="border border-white" src="assets/img/profiles/avatar-18.jpg" alt="img" />
										</span>
										<span className="avatar avatar-rounded">
											<img className="border border-white" src="assets/img/profiles/avatar-19.jpg" alt="img" />
										</span>
										<span className="avatar avatar-rounded">
											<img className="border border-white" src="assets/img/profiles/avatar-20.jpg" alt="img" />
										</span>
										<span className="avatar avatar-rounded">
											<img className="border border-white" src="assets/img/profiles/avatar-21.jpg" alt="img" />
										</span>
										<span className="avatar avatar-rounded">
											<img className="border border-white" src="assets/img/profiles/avatar-22.jpg" alt="img" />
										</span>
										<a className="avatar bg-primary avatar-rounded text-fixed-white fs-12" href="javascript:void(0);">
											+1
										</a>
									</div>
								</div>
								<div className="d-flex flex-column">
									<p className="text-dark d-inline-flex align-items-center mb-2">
										<i className="ti ti-mail-forward text-gray-5 me-2"></i>
										<a href="/cdn-cgi/l/email-protection" className="__cf_email__" data-cfemail="c9ada8bea789acb1a8a4b9a5ace7aaa6a4">[email&#160;protected]</a>
									</p>
									<p className="text-dark d-inline-flex align-items-center mb-2">
										<i className="ti ti-phone text-gray-5 me-2"></i>
										(163) 6498 256
									</p>
									<p className="text-dark d-inline-flex align-items-center">
										<i className="ti ti-map-pin text-gray-5 me-2"></i>
										Japan
									</p>
								</div>
								<div className="d-flex align-items-center justify-content-between border-top pt-3 mt-3">
									<div className="icons-social d-flex align-items-center">
										<a href="#" className="avatar avatar-rounded avatar-sm me-1"><i className="ti ti-mail"></i></a>
										<a href="#" className="avatar avatar-rounded avatar-sm me-1"><i className="ti ti-phone-call"></i></a>
										<a href="#" className="avatar avatar-rounded avatar-sm me-1"><i className="ti ti-message-2"></i></a>
										<a href="#" className="avatar avatar-rounded avatar-sm me-1"><i className="ti ti-brand-skype"></i></a>
										<a href="#" className="avatar avatar-rounded avatar-sm"><i className="ti ti-brand-facebook"></i></a>
									</div>
									<span className="d-inline-flex align-items-center"><i className="ti ti-star-filled text-warning me-1"></i>5.0</span>
								</div>
							</div>
						</div>
					</div>
					<div className="col-xl-3 col-lg-4 col-md-6">
						<div className="card">
							<div className="card-body">
								<div className="d-flex justify-content-between align-items-start mb-2">
									<div className="form-check form-check-md">
										<input className="form-check-input" type="checkbox" />
									</div>
									<div>
										<a href="company-details.php" className="avatar avatar-xl avatar-rounded online border rounded-circle">
											<img src="assets/img/company/company-18.svg" className="img-fluid h-auto w-auto" alt="img" />
										</a>
									</div>
									<div className="dropdown">
										<button className="btn btn-icon btn-sm rounded-circle" type="button" data-bs-toggle="dropdown" aria-expanded="false">
											<i className="ti ti-dots-vertical"></i>
										</button>
										<ul className="dropdown-menu dropdown-menu-end p-3">
											<li>
												<a className="dropdown-item rounded-1" href="javascript:void(0);" data-bs-toggle="modal" data-bs-target="#edit_company"><i className="ti ti-edit me-1"></i>Edit</a>
											</li>
											<li>
												<a className="dropdown-item rounded-1" href="javascript:void(0);" data-bs-toggle="modal" data-bs-target="#delete_modal"><i className="ti ti-trash me-1"></i>Delete</a>
											</li>
										</ul>
									</div>
								</div>
								<div className="text-center mb-3">
									<h6 className="mb-1"><a href="company-details.php">TerraFusion Energy</a></h6>
									<div className="avatar-list-stacked avatar-group-sm">
										<span className="avatar avatar-rounded">
											<img className="border border-white" src="assets/img/profiles/avatar-23.jpg" alt="img" />
										</span>
										<span className="avatar avatar-rounded">
											<img className="border border-white" src="assets/img/profiles/avatar-24.jpg" alt="img" />
										</span>
										<span className="avatar avatar-rounded">
											<img className="border border-white" src="assets/img/profiles/avatar-25.jpg" alt="img" />
										</span>
										<span className="avatar avatar-rounded">
											<img className="border border-white" src="assets/img/profiles/avatar-26.jpg" alt="img" />
										</span>
										<span className="avatar avatar-rounded">
											<img className="border border-white" src="assets/img/profiles/avatar-27.jpg" alt="img" />
										</span>
										<a className="avatar bg-primary avatar-rounded text-fixed-white fs-12" href="javascript:void(0);">
											+1
										</a>
									</div>
								</div>
								<div className="d-flex flex-column">
									<p className="text-dark d-inline-flex align-items-center mb-2">
										<i className="ti ti-mail-forward text-gray-5 me-2"></i>
										<a href="/cdn-cgi/l/email-protection" className="__cf_email__" data-cfemail="d0a2b1b3b8b5bc90b5a8b1bda0bcb5feb3bfbd">[email&#160;protected]</a>
									</p>
									<p className="text-dark d-inline-flex align-items-center mb-2">
										<i className="ti ti-phone text-gray-5 me-2"></i>
										(154) 6481 075
									</p>
									<p className="text-dark d-inline-flex align-items-center">
										<i className="ti ti-map-pin text-gray-5 me-2"></i>
										Indonesia
									</p>
								</div>
								<div className="d-flex align-items-center justify-content-between border-top pt-3 mt-3">
									<div className="icons-social d-flex align-items-center">
										<a href="#" className="avatar avatar-rounded avatar-sm me-1"><i className="ti ti-mail"></i></a>
										<a href="#" className="avatar avatar-rounded avatar-sm me-1"><i className="ti ti-phone-call"></i></a>
										<a href="#" className="avatar avatar-rounded avatar-sm me-1"><i className="ti ti-message-2"></i></a>
										<a href="#" className="avatar avatar-rounded avatar-sm me-1"><i className="ti ti-brand-skype"></i></a>
										<a href="#" className="avatar avatar-rounded avatar-sm"><i className="ti ti-brand-facebook"></i></a>
									</div>
									<span className="d-inline-flex align-items-center"><i className="ti ti-star-filled text-warning me-1"></i>3.5</span>
								</div>
							</div>
						</div>
					</div>
					<div className="col-xl-3 col-lg-4 col-md-6">
						<div className="card">
							<div className="card-body">
								<div className="d-flex justify-content-between align-items-start mb-2">
									<div className="form-check form-check-md">
										<input className="form-check-input" type="checkbox" />
									</div>
									<div>
										<a href="company-details.php" className="avatar avatar-xl avatar-rounded online border rounded-circle">
											<img src="assets/img/company/company-19.svg" className="img-fluid h-auto w-auto" alt="img" />
										</a>
									</div>
									<div className="dropdown">
										<button className="btn btn-icon btn-sm rounded-circle" type="button" data-bs-toggle="dropdown" aria-expanded="false">
											<i className="ti ti-dots-vertical"></i>
										</button>
										<ul className="dropdown-menu dropdown-menu-end p-3">
											<li>
												<a className="dropdown-item rounded-1" href="javascript:void(0);" data-bs-toggle="modal" data-bs-target="#edit_company"><i className="ti ti-edit me-1"></i>Edit</a>
											</li>
											<li>
												<a className="dropdown-item rounded-1" href="javascript:void(0);" data-bs-toggle="modal" data-bs-target="#delete_modal"><i className="ti ti-trash me-1"></i>Delete</a>
											</li>
										</ul>
									</div>
								</div>
								<div className="text-center mb-3">
									<h6 className="mb-1"><a href="company-details.php">UrbanPulse Design</a></h6>
									<div className="avatar-list-stacked avatar-group-sm">
										<span className="avatar avatar-rounded">
											<img className="border border-white" src="assets/img/profiles/avatar-28.jpg" alt="img" />
										</span>
										<span className="avatar avatar-rounded">
											<img className="border border-white" src="assets/img/profiles/avatar-29.jpg" alt="img" />
										</span>
										<span className="avatar avatar-rounded">
											<img className="border border-white" src="assets/img/profiles/avatar-30.jpg" alt="img" />
										</span>
										<span className="avatar avatar-rounded">
											<img className="border border-white" src="assets/img/profiles/avatar-01.jpg" alt="img" />
										</span>
										<span className="avatar avatar-rounded">
											<img className="border border-white" src="assets/img/profiles/avatar-02.jpg" alt="img" />
										</span>
										<a className="avatar bg-primary avatar-rounded text-fixed-white fs-12" href="javascript:void(0);">
											+1
										</a>
									</div>
								</div>
								<div className="d-flex flex-column">
									<p className="text-dark d-inline-flex align-items-center mb-2">
										<i className="ti ti-mail-forward text-gray-5 me-2"></i>
										<a href="/cdn-cgi/l/email-protection" className="__cf_email__" data-cfemail="f79d9899929b9b96b7928f969a879b92d994989a">[email&#160;protected]</a>
									</p>
									<p className="text-dark d-inline-flex align-items-center mb-2">
										<i className="ti ti-phone text-gray-5 me-2"></i>
										(184) 6348 195
									</p>
									<p className="text-dark d-inline-flex align-items-center">
										<i className="ti ti-map-pin text-gray-5 me-2"></i>
										Cuba
									</p>
								</div>
								<div className="d-flex align-items-center justify-content-between border-top pt-3 mt-3">
									<div className="icons-social d-flex align-items-center">
										<a href="#" className="avatar avatar-rounded avatar-sm me-1"><i className="ti ti-mail"></i></a>
										<a href="#" className="avatar avatar-rounded avatar-sm me-1"><i className="ti ti-phone-call"></i></a>
										<a href="#" className="avatar avatar-rounded avatar-sm me-1"><i className="ti ti-message-2"></i></a>
										<a href="#" className="avatar avatar-rounded avatar-sm me-1"><i className="ti ti-brand-skype"></i></a>
										<a href="#" className="avatar avatar-rounded avatar-sm"><i className="ti ti-brand-facebook"></i></a>
									</div>
									<span className="d-inline-flex align-items-center"><i className="ti ti-star-filled text-warning me-1"></i>4.5</span>
								</div>
							</div>
						</div>
					</div>
					<div className="col-xl-3 col-lg-4 col-md-6">
						<div className="card">
							<div className="card-body">
								<div className="d-flex justify-content-between align-items-start mb-2">
									<div className="form-check form-check-md">
										<input className="form-check-input" type="checkbox" />
									</div>
									<div>
										<a href="company-details.php" className="avatar avatar-xl avatar-rounded online border rounded-circle">
											<img src="assets/img/company/company-20.svg" className="img-fluid h-auto w-auto" alt="img" />
										</a>
									</div>
									<div className="dropdown">
										<button className="btn btn-icon btn-sm rounded-circle" type="button" data-bs-toggle="dropdown" aria-expanded="false">
											<i className="ti ti-dots-vertical"></i>
										</button>
										<ul className="dropdown-menu dropdown-menu-end p-3">
											<li>
												<a className="dropdown-item rounded-1" href="javascript:void(0);" data-bs-toggle="modal" data-bs-target="#edit_company"><i className="ti ti-edit me-1"></i>Edit</a>
											</li>
											<li>
												<a className="dropdown-item rounded-1" href="javascript:void(0);" data-bs-toggle="modal" data-bs-target="#delete_modal"><i className="ti ti-trash me-1"></i>Delete</a>
											</li>
										</ul>
									</div>
								</div>
								<div className="text-center mb-3">
									<h6 className="mb-1"><a href="company-details.php">Nimbus Networks</a></h6>
									<div className="avatar-list-stacked avatar-group-sm">
										<span className="avatar avatar-rounded">
											<img className="border border-white" src="assets/img/profiles/avatar-10.jpg" alt="img" />
										</span>
										<span className="avatar avatar-rounded">
											<img className="border border-white" src="assets/img/profiles/avatar-11.jpg" alt="img" />
										</span>
										<span className="avatar avatar-rounded">
											<img className="border border-white" src="assets/img/profiles/avatar-12.jpg" alt="img" />
										</span>
										<span className="avatar avatar-rounded">
											<img className="border border-white" src="assets/img/profiles/avatar-13.jpg" alt="img" />
										</span>
										<span className="avatar avatar-rounded">
											<img className="border border-white" src="assets/img/profiles/avatar-14.jpg" alt="img" />
										</span>
										<a className="avatar bg-primary avatar-rounded text-fixed-white fs-12" href="javascript:void(0);">
											+1
										</a>
									</div>
								</div>
								<div className="d-flex flex-column">
									<p className="text-dark d-inline-flex align-items-center mb-2">
										<i className="ti ti-mail-forward text-gray-5 me-2"></i>
										<a href="/cdn-cgi/l/email-protection" className="__cf_email__" data-cfemail="78121716190c101916381d00191508141d561b1715">[email&#160;protected]</a>
									</p>
									<p className="text-dark d-inline-flex align-items-center mb-2">
										<i className="ti ti-phone text-gray-5 me-2"></i>
										(175) 2496 125
									</p>
									<p className="text-dark d-inline-flex align-items-center">
										<i className="ti ti-map-pin text-gray-5 me-2"></i>
										Israel
									</p>
								</div>
								<div className="d-flex align-items-center justify-content-between border-top pt-3 mt-3">
									<div className="icons-social d-flex align-items-center">
										<a href="#" className="avatar avatar-rounded avatar-sm me-1"><i className="ti ti-mail"></i></a>
										<a href="#" className="avatar avatar-rounded avatar-sm me-1"><i className="ti ti-phone-call"></i></a>
										<a href="#" className="avatar avatar-rounded avatar-sm me-1"><i className="ti ti-message-2"></i></a>
										<a href="#" className="avatar avatar-rounded avatar-sm me-1"><i className="ti ti-brand-skype"></i></a>
										<a href="#" className="avatar avatar-rounded avatar-sm"><i className="ti ti-brand-facebook"></i></a>
									</div>
									<span className="d-inline-flex align-items-center"><i className="ti ti-star-filled text-warning me-1"></i>4.4</span>
								</div>
							</div>
						</div>
					</div>
					<div className="col-xl-3 col-lg-4 col-md-6">
						<div className="card">
							<div className="card-body">
								<div className="d-flex justify-content-between align-items-start mb-2">
									<div className="form-check form-check-md">
										<input className="form-check-input" type="checkbox" />
									</div>
									<div>
										<a href="company-details.php" className="avatar avatar-xl avatar-rounded online border rounded-circle">
											<img src="assets/img/company/company-21.svg" className="img-fluid h-auto w-auto" alt="img" />
										</a>
									</div>
									<div className="dropdown">
										<button className="btn btn-icon btn-sm rounded-circle" type="button" data-bs-toggle="dropdown" aria-expanded="false">
											<i className="ti ti-dots-vertical"></i>
										</button>
										<ul className="dropdown-menu dropdown-menu-end p-3">
											<li>
												<a className="dropdown-item rounded-1" href="javascript:void(0);" data-bs-toggle="modal" data-bs-target="#edit_company"><i className="ti ti-edit me-1"></i>Edit</a>
											</li>
											<li>
												<a className="dropdown-item rounded-1" href="javascript:void(0);" data-bs-toggle="modal" data-bs-target="#delete_modal"><i className="ti ti-trash me-1"></i>Delete</a>
											</li>
										</ul>
									</div>
								</div>
								<div className="text-center mb-3">
									<h6 className="mb-1"><a href="company-details.php">Epicurean Delights</a></h6>
									<div className="avatar-list-stacked avatar-group-sm">
										<span className="avatar avatar-rounded">
											<img className="border border-white" src="assets/img/profiles/avatar-15.jpg" alt="img" />
										</span>
										<span className="avatar avatar-rounded">
											<img className="border border-white" src="assets/img/profiles/avatar-16.jpg" alt="img" />
										</span>
										<span className="avatar avatar-rounded">
											<img className="border border-white" src="assets/img/profiles/avatar-17.jpg" alt="img" />
										</span>
										<span className="avatar avatar-rounded">
											<img className="border border-white" src="assets/img/profiles/avatar-18.jpg" alt="img" />
										</span>
										<span className="avatar avatar-rounded">
											<img className="border border-white" src="assets/img/profiles/avatar-19.jpg" alt="img" />
										</span>
										<a className="avatar bg-primary avatar-rounded text-fixed-white fs-12" href="javascript:void(0);">
											+1
										</a>
									</div>
								</div>
								<div className="d-flex flex-column">
									<p className="text-dark d-inline-flex align-items-center mb-2">
										<i className="ti ti-mail-forward text-gray-5 me-2"></i>
										<a href="/cdn-cgi/l/email-protection" className="__cf_email__" data-cfemail="42322336302b212b2302273a232f322e276c212d2f">[email&#160;protected]</a>
									</p>
									<p className="text-dark d-inline-flex align-items-center mb-2">
										<i className="ti ti-phone text-gray-5 me-2"></i>
										(132) 3145 977
									</p>
									<p className="text-dark d-inline-flex align-items-center">
										<i className="ti ti-map-pin text-gray-5 me-2"></i>
										Colombia
									</p>
								</div>
								<div className="d-flex align-items-center justify-content-between border-top pt-3 mt-3">
									<div className="icons-social d-flex align-items-center">
										<a href="#" className="avatar avatar-rounded avatar-sm me-1"><i className="ti ti-mail"></i></a>
										<a href="#" className="avatar avatar-rounded avatar-sm me-1"><i className="ti ti-phone-call"></i></a>
										<a href="#" className="avatar avatar-rounded avatar-sm me-1"><i className="ti ti-message-2"></i></a>
										<a href="#" className="avatar avatar-rounded avatar-sm me-1"><i className="ti ti-brand-skype"></i></a>
										<a href="#" className="avatar avatar-rounded avatar-sm"><i className="ti ti-brand-facebook"></i></a>
									</div>
									<span className="d-inline-flex align-items-center"><i className="ti ti-star-filled text-warning me-1"></i>2.7</span>
								</div>
							</div>
						</div>
					</div>
					<div className="col-xl-3 col-lg-4 col-md-6">
						<div className="card">
							<div className="card-body">
								<div className="d-flex justify-content-between align-items-start mb-2">
									<div className="form-check form-check-md">
										<input className="form-check-input" type="checkbox" />
									</div>
									<div>
										<a href="company-details.php" className="avatar avatar-xl avatar-rounded online border rounded-circle">
											<img src="assets/img/company/company-22.svg" className="img-fluid h-auto w-auto" alt="img" />
										</a>
									</div>
									<div className="dropdown">
										<button className="btn btn-icon btn-sm rounded-circle" type="button" data-bs-toggle="dropdown" aria-expanded="false">
											<i className="ti ti-dots-vertical"></i>
										</button>
										<ul className="dropdown-menu dropdown-menu-end p-3">
											<li>
												<a className="dropdown-item rounded-1" href="javascript:void(0);" data-bs-toggle="modal" data-bs-target="#edit_company"><i className="ti ti-edit me-1"></i>Edit</a>
											</li>
											<li>
												<a className="dropdown-item rounded-1" href="javascript:void(0);" data-bs-toggle="modal" data-bs-target="#delete_modal"><i className="ti ti-trash me-1"></i>Delete</a>
											</li>
										</ul>
									</div>
								</div>
								<div className="text-center mb-3">
									<h6 className="mb-1"><a href="company-details.php">Hermann Groups</a></h6>
									<div className="avatar-list-stacked avatar-group-sm">
										<span className="avatar avatar-rounded">
											<img className="border border-white" src="assets/img/profiles/avatar-20.jpg" alt="img" />
										</span>
										<span className="avatar avatar-rounded">
											<img className="border border-white" src="assets/img/profiles/avatar-21.jpg" alt="img" />
										</span>
										<span className="avatar avatar-rounded">
											<img className="border border-white" src="assets/img/profiles/avatar-22.jpg" alt="img" />
										</span>
										<span className="avatar avatar-rounded">
											<img className="border border-white" src="assets/img/profiles/avatar-23.jpg" alt="img" />
										</span>
										<span className="avatar avatar-rounded">
											<img className="border border-white" src="assets/img/profiles/avatar-24.jpg" alt="img" />
										</span>
										<a className="avatar bg-primary avatar-rounded text-fixed-white fs-12" href="javascript:void(0);">
											+1
										</a>
									</div>
								</div>
								<div className="d-flex flex-column">
									<p className="text-dark d-inline-flex align-items-center mb-2">
										<i className="ti ti-mail-forward text-gray-5 me-2"></i>
										<a href="/cdn-cgi/l/email-protection" className="__cf_email__" data-cfemail="a1d1c0d5d3c8c2c8c0e1c4d9c0ccd1cdc48fc2cecc">[email&#160;protected]</a>
									</p>
									<p className="text-dark d-inline-flex align-items-center mb-2">
										<i className="ti ti-phone text-gray-5 me-2"></i>
										(132) 3145 977
									</p>
									<p className="text-dark d-inline-flex align-items-center">
										<i className="ti ti-map-pin text-gray-5 me-2"></i>
										Colombia
									</p>
								</div>
								<div className="d-flex align-items-center justify-content-between border-top pt-3 mt-3">
									<div className="icons-social d-flex align-items-center">
										<a href="#" className="avatar avatar-rounded avatar-sm me-1"><i className="ti ti-mail"></i></a>
										<a href="#" className="avatar avatar-rounded avatar-sm me-1"><i className="ti ti-phone-call"></i></a>
										<a href="#" className="avatar avatar-rounded avatar-sm me-1"><i className="ti ti-message-2"></i></a>
										<a href="#" className="avatar avatar-rounded avatar-sm me-1"><i className="ti ti-brand-skype"></i></a>
										<a href="#" className="avatar avatar-rounded avatar-sm"><i className="ti ti-brand-facebook"></i></a>
									</div>
									<span className="d-inline-flex align-items-center"><i className="ti ti-star-filled text-warning me-1"></i>4.6</span>
								</div>
							</div>
						</div>
					</div>
					<div className="col-xl-3 col-lg-4 col-md-6">
						<div className="card">
							<div className="card-body">
								<div className="d-flex justify-content-between align-items-start mb-2">
									<div className="form-check form-check-md">
										<input className="form-check-input" type="checkbox" />
									</div>
									<div>
										<a href="company-details.php" className="avatar avatar-xl avatar-rounded online border rounded-circle">
											<img src="assets/img/company/company-23.svg" className="img-fluid h-auto w-auto" alt="img" />
										</a>
									</div>
									<div className="dropdown">
										<button className="btn btn-icon btn-sm rounded-circle" type="button" data-bs-toggle="dropdown" aria-expanded="false">
											<i className="ti ti-dots-vertical"></i>
										</button>
										<ul className="dropdown-menu dropdown-menu-end p-3">
											<li>
												<a className="dropdown-item rounded-1" href="javascript:void(0);" data-bs-toggle="modal" data-bs-target="#edit_company"><i className="ti ti-edit me-1"></i>Edit</a>
											</li>
											<li>
												<a className="dropdown-item rounded-1" href="javascript:void(0);" data-bs-toggle="modal" data-bs-target="#delete_modal"><i className="ti ti-trash me-1"></i>Delete</a>
											</li>
										</ul>
									</div>
								</div>
								<div className="text-center mb-3">
									<h6 className="mb-1"><a href="company-details.php">Beacon Softwares</a></h6>
									<div className="avatar-list-stacked avatar-group-sm">
										<span className="avatar avatar-rounded">
											<img className="border border-white" src="assets/img/profiles/avatar-25.jpg" alt="img" />
										</span>
										<span className="avatar avatar-rounded">
											<img className="border border-white" src="assets/img/profiles/avatar-26.jpg" alt="img" />
										</span>
										<span className="avatar avatar-rounded">
											<img className="border border-white" src="assets/img/profiles/avatar-27.jpg" alt="img" />
										</span>
										<span className="avatar avatar-rounded">
											<img className="border border-white" src="assets/img/profiles/avatar-28.jpg" alt="img" />
										</span>
										<span className="avatar avatar-rounded">
											<img className="border border-white" src="assets/img/profiles/avatar-29.jpg" alt="img" />
										</span>
										<a className="avatar bg-primary avatar-rounded text-fixed-white fs-12" href="javascript:void(0);">
											+1
										</a>
									</div>
								</div>
								<div className="d-flex flex-column">
									<p className="text-dark d-inline-flex align-items-center mb-2">
										<i className="ti ti-mail-forward text-gray-5 me-2"></i>
										<a href="/cdn-cgi/l/email-protection" className="__cf_email__" data-cfemail="294e45465b4048694c51484459454c074a4644">[email&#160;protected]</a>
									</p>
									<p className="text-dark d-inline-flex align-items-center mb-2">
										<i className="ti ti-phone text-gray-5 me-2"></i>
										(134) 7589 6348
									</p>
									<p className="text-dark d-inline-flex align-items-center">
										<i className="ti ti-map-pin text-gray-5 me-2"></i>
										Brazil
									</p>
								</div>
								<div className="d-flex align-items-center justify-content-between border-top pt-3 mt-3">
									<div className="icons-social d-flex align-items-center">
										<a href="#" className="avatar avatar-rounded avatar-sm me-1"><i className="ti ti-mail"></i></a>
										<a href="#" className="avatar avatar-rounded avatar-sm me-1"><i className="ti ti-phone-call"></i></a>
										<a href="#" className="avatar avatar-rounded avatar-sm me-1"><i className="ti ti-message-2"></i></a>
										<a href="#" className="avatar avatar-rounded avatar-sm me-1"><i className="ti ti-brand-skype"></i></a>
										<a href="#" className="avatar avatar-rounded avatar-sm"><i className="ti ti-brand-facebook"></i></a>
									</div>
									<span className="d-inline-flex align-items-center"><i className="ti ti-star-filled text-warning me-1"></i>4.2</span>
								</div>
							</div>
						</div>
					</div>
				</div>
				<div className="text-center mb-4">
					<a href="#" className="btn btn-white border"><i className="ti ti-loader-3 text-primary me-2"></i>Load More</a>
				</div>
			</div>

			<div className="footer d-sm-flex align-items-center justify-content-between border-top bg-white p-3">
				<p className="mb-0">2014 - 2025 &copy; SmartHR.</p>
				<p>Designed &amp; Developed By <a href="javascript:void(0);" className="text-primary">Dreams</a></p>
			</div>
        </>
    );
};

export default CompaniesGridPage;
