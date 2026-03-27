import { useQuery } from "@tanstack/react-query";
import PageLoader from "../../components/common/PageLoader";
import ErrorState from "../../components/common/ErrorState";
import DataTable from "../../components/admin/DataTable";
import PageHeader from "../../components/admin/PageHeader";
import StatusBadge from "../../components/admin/StatusBadge";
import activityService from "../../services/activityService";
import { activityData } from "../../mock/activityData";

const activityColumns = [
  { key: "select", label: "" },
  { key: "title", label: "Title" },
  { key: "type", label: "Activity Type" },
  { key: "dueDate", label: "Due Date" },
  { key: "owner", label: "Owner" },
  { key: "createdDate", label: "Created Date" },
  { key: "actions", label: "" },
];

export default function ActivityPage() {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["activity"],
    queryFn: activityService.getActivity,
    placeholderData: activityData,
    keepPreviousData: true,
  });

  const pageData = {
    ...activityData,
    ...(data || {}),
    header: {
      ...activityData.header,
      ...(data?.header || {}),
      breadcrumbs: Array.isArray(data?.header?.breadcrumbs)
        ? data.header.breadcrumbs
        : activityData.header.breadcrumbs,
    },
    rows: Array.isArray(data?.rows) ? data.rows : activityData.rows,
  };

  const pageTitle = pageData?.header?.title || activityData.header.title;
  const breadcrumbs = Array.isArray(pageData?.header?.breadcrumbs)
    ? pageData.header.breadcrumbs
    : activityData.header.breadcrumbs;
  const rows = Array.isArray(pageData?.rows)
    ? pageData.rows
    : activityData.rows;

  if (isLoading && !data) return <PageLoader />;
  if (error && !data) return <ErrorState onRetry={refetch} />;

  return (
    <>
      <PageHeader
        title={pageTitle}
        breadcrumbs={breadcrumbs}
        actions={
          <>
            <div className="me-2 mb-2">
              <div className="dropdown">
                <a
                  href="javascript:void(0);"
                  className="dropdown-toggle btn btn-white d-inline-flex align-items-center"
                  data-bs-toggle="dropdown"
                >
                  <i className="ti ti-file-export me-1" />
                  Export
                </a>
                <ul className="dropdown-menu dropdown-menu-end p-3">
                  <li>
                    <a
                      href="javascript:void(0);"
                      className="dropdown-item rounded-1"
                    >
                      <i className="ti ti-file-type-pdf me-1" />
                      Export as PDF
                    </a>
                  </li>
                  <li>
                    <a
                      href="javascript:void(0);"
                      className="dropdown-item rounded-1"
                    >
                      <i className="ti ti-file-type-xls me-1" />
                      Export as Excel
                    </a>
                  </li>
                </ul>
              </div>
            </div>
            <div className="mb-2">
              <a
                href="#"
                data-bs-toggle="modal"
                data-bs-target="#add_activity"
                className="btn btn-primary d-flex align-items-center"
              >
                <i className="ti ti-circle-plus me-2" />
                Add Activity
              </a>
            </div>
            <div className="ms-2 head-icons">
              <a
                href="javascript:void(0);"
                className=""
                data-bs-toggle="tooltip"
                data-bs-placement="top"
                data-bs-original-title="Collapse"
                id="collapse-header"
              >
                <i className="ti ti-chevrons-up" />
              </a>
            </div>
          </>
        }
      />

      <div className="card">
        <div className="card-header d-flex align-items-center justify-content-between flex-wrap row-gap-3">
          <h5>Activity List</h5>
          <div className="d-flex my-xl-auto right-content align-items-center flex-wrap row-gap-3">
            <div className="me-3">
              <div className="input-icon-end position-relative">
                <input
                  type="text"
                  className="form-control date-range bookingrange"
                  placeholder="dd/mm/yyyy - dd/mm/yyyy"
                />
                <span className="input-icon-addon">
                  <i className="ti ti-chevron-down" />
                </span>
              </div>
            </div>
            <div className="dropdown me-3">
              <a
                href="javascript:void(0);"
                className="dropdown-toggle btn btn-white d-inline-flex align-items-center"
                data-bs-toggle="dropdown"
              >
                Activity Type
              </a>
              <ul className="dropdown-menu dropdown-menu-end p-3">
                <li>
                  <a
                    href="javascript:void(0);"
                    className="dropdown-item rounded-1"
                  >
                    Meeting
                  </a>
                </li>
                <li>
                  <a
                    href="javascript:void(0);"
                    className="dropdown-item rounded-1"
                  >
                    Calls
                  </a>
                </li>
                <li>
                  <a
                    href="javascript:void(0);"
                    className="dropdown-item rounded-1"
                  >
                    Tasks
                  </a>
                </li>
                <li>
                  <a
                    href="javascript:void(0);"
                    className="dropdown-item rounded-1"
                  >
                    Email
                  </a>
                </li>
              </ul>
            </div>
            <div className="dropdown">
              <a
                href="javascript:void(0);"
                className="dropdown-toggle btn btn-white d-inline-flex align-items-center"
                data-bs-toggle="dropdown"
              >
                Sort By : Last 7 Days
              </a>
              <ul className="dropdown-menu dropdown-menu-end p-3">
                <li>
                  <a
                    href="javascript:void(0);"
                    className="dropdown-item rounded-1"
                  >
                    Recently Added
                  </a>
                </li>
                <li>
                  <a
                    href="javascript:void(0);"
                    className="dropdown-item rounded-1"
                  >
                    Ascending
                  </a>
                </li>
                <li>
                  <a
                    href="javascript:void(0);"
                    className="dropdown-item rounded-1"
                  >
                    Desending
                  </a>
                </li>
                <li>
                  <a
                    href="javascript:void(0);"
                    className="dropdown-item rounded-1"
                  >
                    Last Month
                  </a>
                </li>
                <li>
                  <a
                    href="javascript:void(0);"
                    className="dropdown-item rounded-1"
                  >
                    Last 7 Days
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>
        <div className="card-body p-0">
          <DataTable
            wrapperClass="custom-datatable-filter table-responsive"
            tableClass="table datatable"
            columns={activityColumns}
            rows={rows}
            renderRow={(row) => (
              <>
                <td>
                  <div className="form-check form-check-md">
                    <input className="form-check-input" type="checkbox" />
                  </div>
                </td>
                <td>
                  <p className="fs-14 text-dark fw-medium">{row.title}</p>
                </td>
                <td>
                  <StatusBadge
                    className={`badge ${row.typeClass}`}
                    iconClass={row.typeIcon}
                  >
                    {row.type}
                  </StatusBadge>
                </td>
                <td>{row.dueDate}</td>
                <td>{row.owner}</td>
                <td>{row.createdDate}</td>
                <td>
                  <div className="action-icon d-inline-flex">
                    <a
                      href="#"
                      className="me-2"
                      data-bs-toggle="modal"
                      data-bs-target="#edit_activity"
                    >
                      <i className="ti ti-edit" />
                    </a>
                    <a
                      href="javascript:void(0);"
                      data-bs-toggle="modal"
                      data-bs-target="#delete_modal"
                    >
                      <i className="ti ti-trash" />
                    </a>
                  </div>
                </td>
              </>
            )}
          />
        </div>
      </div>

      {/* Add Activity Modal */}
      <div className="modal fade" id="add_activity">
        <div className="modal-dialog modal-dialog-centered modal-lg">
          <div className="modal-content">
            <div className="modal-header">
              <h4 className="modal-title">Add New Activity</h4>
              <button
                type="button"
                className="btn-close custom-btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
              >
                <i className="ti ti-x"></i>
              </button>
            </div>
            <form>
              <div className="modal-body pb-0">
                <div className="row">
                  <div className="col-md-12">
                    <div className="mb-3">
                      <label className="form-label">
                        Title <span className="text-danger"> *</span>
                      </label>
                      <input type="text" className="form-control" />
                    </div>
                  </div>
                  <div className="col-md-12">
                    <label className="form-label">
                      Activity Type <span className="text-danger"> *</span>
                    </label>
                    <div className="activity-items d-flex align-items-center mb-3">
                      <a
                        href="#"
                        className="br-5 d-flex align-items-center justify-content-center active me-2"
                      >
                        <i className="ti ti-phone me-1"></i>Calls
                      </a>
                      <a
                        href="#"
                        className="br-5 d-flex align-items-center justify-content-center me-2"
                      >
                        <i className="ti ti-mail me-1"></i>Email
                      </a>
                      <a
                        href="#"
                        className="br-5 d-flex align-items-center justify-content-center me-2"
                      >
                        <i className="ti ti-user-circle me-1"></i>Meeting
                      </a>
                      <a
                        href="#"
                        className="br-5 d-flex align-items-center justify-content-center me-2"
                      >
                        <i className="ti ti-list-check me-1"></i>Task
                      </a>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="mb-3">
                      <label className="form-label">
                        Due Date <span className="text-danger"> *</span>
                      </label>
                      <div className="input-icon-end position-relative">
                        <input
                          type="text"
                          className="form-control datetimepicker"
                          placeholder="dd/mm/yyyy"
                        />
                        <span className="input-icon-addon">
                          <i className="ti ti-calendar text-gray-7"></i>
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="mb-3">
                      <label className="form-label">
                        Time <span className="text-danger"> *</span>
                      </label>
                      <div className="input-icon-end position-relative">
                        <input
                          type="text"
                          className="form-control timepicker"
                        />
                        <span className="input-icon-addon">
                          <i className="ti ti-clock-hour-10 text-gray-7"></i>
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-12 lead-phno-col del-phno-col">
                    <div className="row">
                      <div className="col-lg-8">
                        <div className="input-block mb-3">
                          <label className="form-label">
                            Remainder <span className="text-danger"> *</span>
                          </label>
                          <div className="input-icon-start position-relative">
                            <input type="text" className="form-control" />
                            <span className="input-icon-addon">
                              <i className="ti ti-bell text-gray-7"></i>
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="col-lg-4 d-flex align-items-end">
                        <div className="input-block w-100 mb-3 d-flex align-items-center">
                          <div className="w-100">
                            <select className="select">
                              <option>Select</option>
                              <option>Work</option>
                              <option>Home</option>
                            </select>
                          </div>
                          <h6 className="fs-14 fw-normal ms-3">Before Use</h6>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="mb-3">
                      <label className="form-label">
                        Owner <span className="text-danger"> *</span>
                      </label>
                      <select className="select">
                        <option>Select</option>
                        <option>Hendry</option>
                        <option>Guilory</option>
                        <option>Jami</option>
                      </select>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="mb-3">
                      <label className="form-label">
                        Guests <span className="text-danger"> *</span>
                      </label>
                      <select className="select">
                        <option>Select</option>
                        <option>Darlee Robertson</option>
                        <option>Sharon Roy</option>
                        <option>Vaughan Lewis</option>
                      </select>
                    </div>
                  </div>
                  <div className="col-md-12">
                    <div className="mb-3">
                      <label className="form-label">
                        Description <span className="text-danger"> *</span>
                      </label>
                      <div className="summernote"></div>
                    </div>
                  </div>
                  <div className="col-md-12">
                    <div className="input-block mb-3">
                      <div className="d-flex justify-content-between align-items-center">
                        <label className="col-form-label">
                          Deals <span className="text-danger"> *</span>
                        </label>
                        <a
                          href="#"
                          className="add-new text-primary"
                          data-bs-toggle="modal"
                          data-bs-target="#add_deals"
                        >
                          <i className="ti ti-plus text-primary me-1"></i>Add
                          New
                        </a>
                      </div>
                      <select className="select">
                        <option>Select</option>
                        <option>Collins</option>
                        <option>Konopelski</option>
                        <option>Adams</option>
                      </select>
                    </div>
                  </div>
                  <div className="col-md-12">
                    <div className="input-block mb-3">
                      <div className="d-flex justify-content-between align-items-center">
                        <label className="col-form-label">
                          Contacts <span className="text-danger"> *</span>
                        </label>
                        <a
                          href="#"
                          className="add-new text-primary"
                          data-bs-toggle="modal"
                          data-bs-target="#add_contact"
                        >
                          <i className="ti ti-plus text-primary me-1"></i>Add
                          New
                        </a>
                      </div>
                      <select className="select">
                        <option>Select</option>
                        <option>Hendry Milner</option>
                        <option>Guilory Berggren</option>
                        <option>Jami Carlile</option>
                      </select>
                    </div>
                  </div>
                  <div className="col-md-12">
                    <div className="input-block mb-3">
                      <div className="d-flex justify-content-between align-items-center">
                        <label className="col-form-label">
                          Companies <span className="text-danger"> *</span>
                        </label>
                        <a
                          href="#"
                          className="add-new text-primary"
                          data-bs-toggle="modal"
                          data-bs-target="#add_company"
                        >
                          <i className="ti ti-plus text-primary me-1"></i>Add
                          New
                        </a>
                      </div>
                      <select className="select">
                        <option>Select</option>
                        <option>Epicurean Delights</option>
                        <option>Nimbus Networks</option>
                        <option>UrbanPulse Design</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-light me-2"
                  data-bs-dismiss="modal"
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Add Activity
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
      {/* /Add Activity Modal */}

      {/* Edit Activity Modal */}
      <div className="modal fade" id="edit_activity">
        <div className="modal-dialog modal-dialog-centered modal-lg">
          <div className="modal-content">
            <div className="modal-header">
              <h4 className="modal-title">Edit Activity</h4>
              <button
                type="button"
                className="btn-close custom-btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
              >
                <i className="ti ti-x"></i>
              </button>
            </div>
            <form>
              <div className="modal-body pb-0">
                <div className="row">
                  <div className="col-md-12">
                    <div className="mb-3">
                      <label className="form-label">
                        Title <span className="text-danger"> *</span>
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        defaultValue="We scheduled a meeting for next week"
                      />
                    </div>
                  </div>
                  <div className="col-md-12">
                    <label className="form-label">
                      Activity Type <span className="text-danger"> *</span>
                    </label>
                    <div className="activity-items d-flex align-items-center mb-3">
                      <a
                        href="#"
                        className="br-5 d-flex align-items-center justify-content-center active me-2"
                      >
                        <i className="ti ti-phone me-1"></i>Calls
                      </a>
                      <a
                        href="#"
                        className="br-5 d-flex align-items-center justify-content-center me-2"
                      >
                        <i className="ti ti-mail me-1"></i>Email
                      </a>
                      <a
                        href="#"
                        className="br-5 d-flex align-items-center justify-content-center me-2"
                      >
                        <i className="ti ti-user-circle me-1"></i>Meeting
                      </a>
                      <a
                        href="#"
                        className="br-5 d-flex align-items-center justify-content-center me-2"
                      >
                        <i className="ti ti-list-check me-1"></i>Task
                      </a>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="mb-3">
                      <label className="form-label">
                        Due Date <span className="text-danger"> *</span>
                      </label>
                      <div className="input-icon-end position-relative">
                        <input
                          type="text"
                          className="form-control datetimepicker"
                          placeholder="dd/mm/yyyy"
                        />
                        <span className="input-icon-addon">
                          <i className="ti ti-calendar text-gray-7"></i>
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="mb-3">
                      <label className="form-label">
                        Time <span className="text-danger"> *</span>
                      </label>
                      <div className="input-icon-end position-relative">
                        <input
                          type="text"
                          className="form-control timepicker"
                        />
                        <span className="input-icon-addon">
                          <i className="ti ti-clock-hour-10 text-gray-7"></i>
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-12 lead-phno-col del-phno-col">
                    <div className="row">
                      <div className="col-lg-8">
                        <div className="input-block mb-3">
                          <label className="form-label">
                            Remainder <span className="text-danger"> *</span>
                          </label>
                          <div className="input-icon-start position-relative">
                            <input type="text" className="form-control" />
                            <span className="input-icon-addon">
                              <i className="ti ti-bell text-gray-7"></i>
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="col-lg-4 d-flex align-items-end">
                        <div className="input-block w-100 mb-3 d-flex align-items-center">
                          <div className="w-100">
                            <select className="select">
                              <option>Select</option>
                              <option defaultValue>Work</option>
                              <option>Home</option>
                            </select>
                          </div>
                          <h6 className="fs-14 fw-normal ms-3">Before Use</h6>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="mb-3">
                      <label className="form-label">
                        Owner <span className="text-danger"> *</span>
                      </label>
                      <select className="select">
                        <option>Select</option>
                        <option>Hendry</option>
                        <option defaultValue>Guilory</option>
                        <option>Jami</option>
                      </select>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="mb-3">
                      <label className="form-label">
                        Guests <span className="text-danger"> *</span>
                      </label>
                      <select className="select">
                        <option>Select</option>
                        <option>Darlee Robertson</option>
                        <option defaultValue>Sharon Roy</option>
                        <option>Vaughan Lewis</option>
                      </select>
                    </div>
                  </div>
                  <div className="col-md-12">
                    <div className="mb-3">
                      <label className="form-label">
                        Description <span className="text-danger"> *</span>
                      </label>
                      <div className="summernote"></div>
                    </div>
                  </div>
                  <div className="col-md-12">
                    <div className="input-block mb-3">
                      <div className="d-flex justify-content-between align-items-center">
                        <label className="col-form-label">
                          Deals <span className="text-danger"> *</span>
                        </label>
                        <a
                          href="#"
                          className="add-new text-primary"
                          data-bs-toggle="modal"
                          data-bs-target="#add_deals"
                        >
                          <i className="ti ti-plus text-primary me-1"></i>Add
                          New
                        </a>
                      </div>
                      <select className="select">
                        <option>Select</option>
                        <option>Collins</option>
                        <option defaultValue>Konopelski</option>
                        <option>Adams</option>
                      </select>
                    </div>
                  </div>
                  <div className="col-md-12">
                    <div className="input-block mb-3">
                      <div className="d-flex justify-content-between align-items-center">
                        <label className="col-form-label">
                          Contacts <span className="text-danger"> *</span>
                        </label>
                        <a
                          href="#"
                          className="add-new text-primary"
                          data-bs-toggle="modal"
                          data-bs-target="#add_contact"
                        >
                          <i className="ti ti-plus text-primary me-1"></i>Add
                          New
                        </a>
                      </div>
                      <select className="select">
                        <option>Select</option>
                        <option>Hendry Milner</option>
                        <option defaultValue>Guilory Berggren</option>
                        <option>Jami Carlile</option>
                      </select>
                    </div>
                  </div>
                  <div className="col-md-12">
                    <div className="input-block mb-3">
                      <div className="d-flex justify-content-between align-items-center">
                        <label className="col-form-label">
                          Companies <span className="text-danger"> *</span>
                        </label>
                        <a
                          href="#"
                          className="add-new text-primary"
                          data-bs-toggle="modal"
                          data-bs-target="#add_company"
                        >
                          <i className="ti ti-plus text-primary me-1"></i>Add
                          New
                        </a>
                      </div>
                      <select className="select">
                        <option>Select</option>
                        <option>Epicurean Delights</option>
                        <option defaultValue>Nimbus Networks</option>
                        <option>UrbanPulse Design</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-light me-2"
                  data-bs-dismiss="modal"
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
      {/* /Edit Activity Modal */}

      {/* Delete Confirmation Modal */}
      <div className="modal fade" id="delete_modal">
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-body text-center">
              <span className="avatar avatar-xl bg-transparent-danger text-danger mb-3 mx-auto">
                <i className="ti ti-trash-x fs-36"></i>
              </span>
              <h4 className="mb-1">Delete Activity</h4>
              <p className="mb-3">
                Are you sure you want to delete this activity?
              </p>
              <div className="d-flex align-items-center justify-content-center">
                <button
                  type="button"
                  className="btn btn-light me-2"
                  data-bs-dismiss="modal"
                >
                  Cancel
                </button>
                <button type="button" className="btn btn-danger">
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* /Delete Confirmation Modal */}
    </>
  );
}
