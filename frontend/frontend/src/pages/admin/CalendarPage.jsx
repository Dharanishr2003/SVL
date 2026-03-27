import { useQuery } from "@tanstack/react-query";
import PageLoader from "../../components/common/PageLoader";
import ErrorState from "../../components/common/ErrorState";
import PageHeader from "../../components/admin/PageHeader";
import InfoCard from "../../components/admin/InfoCard";
import calendarService from "../../services/calendarService";
import { calendarData } from "../../mock/calendarData";

export default function CalendarPage() {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["calendar"],
    queryFn: calendarService.getCalendar,
    placeholderData: calendarData,
    keepPreviousData: true,
  });

  const pageData = {
    ...calendarData,
    ...(data || {}),
    header: {
      ...calendarData.header,
      ...(data?.header || {}),
      breadcrumbs: Array.isArray(data?.header?.breadcrumbs)
        ? data.header.breadcrumbs
        : calendarData.header.breadcrumbs,
    },
    externalEvents: Array.isArray(data?.externalEvents)
      ? data.externalEvents
      : calendarData.externalEvents,
    upcomingEvents: Array.isArray(data?.upcomingEvents)
      ? data.upcomingEvents
      : calendarData.upcomingEvents,
    upgrade: {
      ...calendarData.upgrade,
      ...(data?.upgrade || {}),
    },
  };

  const pageTitle = pageData?.header?.title || calendarData.header.title;
  const breadcrumbs = Array.isArray(pageData?.header?.breadcrumbs)
    ? pageData.header.breadcrumbs
    : calendarData.header.breadcrumbs;
  const externalEvents = Array.isArray(pageData?.externalEvents)
    ? pageData.externalEvents
    : calendarData.externalEvents;
  const upcomingEvents = Array.isArray(pageData?.upcomingEvents)
    ? pageData.upcomingEvents
    : calendarData.upcomingEvents;
  const upgrade = pageData?.upgrade || calendarData.upgrade;
  const upcomingEventCount =
    pageData?.upcomingEventCount ?? calendarData.upcomingEventCount;

  if (isLoading && !data) {
    return <PageLoader />;
  }

  if (error && !data) {
    return <ErrorState onRetry={refetch} />;
  }

  return (
    <>
      <PageHeader
        title={pageTitle}
        breadcrumbs={breadcrumbs}
        actions={
          <>
            <div className="me-2 mb-2">
              <div className="input-icon-end position-relative">
                <input type="text" className="form-control date-range bookingrange" placeholder="dd/mm/yyyy - dd/mm/yyyy" />
                <span className="input-icon-addon">
                  <i className="ti ti-chevron-down" />
                </span>
              </div>
            </div>
            <div className="me-2 mb-2">
              <div className="dropdown">
                <a href="javascript:void(0);" className="dropdown-toggle btn btn-white d-inline-flex align-items-center" data-bs-toggle="dropdown">
                  <i className="ti ti-file-export me-1" />Export
                </a>
                <ul className="dropdown-menu  dropdown-menu-end p-3">
                  <li>
                    <a href="javascript:void(0);" className="dropdown-item rounded-1"><i className="ti ti-file-type-pdf me-1" />Export as PDF</a>
                  </li>
                  <li>
                    <a href="javascript:void(0);" className="dropdown-item rounded-1"><i className="ti ti-file-type-xls me-1" />Export as Excel </a>
                  </li>
                </ul>
              </div>
            </div>
            <div className="mb-2">
              <a href="#" data-bs-toggle="modal" data-bs-target="#add_event" className="btn btn-primary d-flex align-items-center"><i className="ti ti-circle-plus me-2" />Create</a>
            </div>
            <div className="ms-2 head-icons">
              <a href="javascript:void(0);" className="" data-bs-toggle="tooltip" data-bs-placement="top" data-bs-original-title="Collapse" id="collapse-header">
                <i className="ti ti-chevrons-up" />
              </a>
            </div>
          </>
        }
      />

      <div className="row">
        <div className="col-xxl-3 col-xl-4">
          <InfoCard cardClass="card" bodyClass="card-body p-3">
            <div className="border-bottom pb-2 mb-4">
              <div className="datepic" />
            </div>

            <div className="border-bottom pb-4 mb-4">
              <div className="d-flex align-items-center justify-content-between mb-2">
                <h5>Event </h5>
                <a href="#" className="link-primary" data-bs-toggle="modal" data-bs-target="#add_event"><i className="ti ti-square-rounded-plus-filled fs-16" /></a>
              </div>
              <p className="fs-12 mb-2">Drag and drop your event or click in the calendar</p>
              <div id="external-events">
                {externalEvents.map((event) => (
                  <div key={event.id} className={event.cardClass} data-event={JSON.stringify({ title: event.title })} data-event-classname={event.eventClassName}>
                    <i className={event.iconClass} />{event.title}
                  </div>
                ))}
              </div>
            </div>

            <div className="border-bottom pb-2 mb-4">
              <h5 className="mb-2">Upcoming Event<span className="badge badge-success rounded-pill ms-2">{upcomingEventCount}</span></h5>
              {upcomingEvents.map((event) => (
                <div key={event.id} className={event.borderClass}>
                  <div className="ps-3">
                    <h6 className="fw-medium mb-1">{event.title}</h6>
                    <p className="fs-12"><i className="ti ti-calendar-check text-info me-2" />{event.date}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-dark rounded text-center position-relative p-4">
              <span className="avatar avatar-lg rounded-circle bg-white mb-2">
                <i className="ti ti-alert-triangle text-dark" />
              </span>
              <h6 className="text-white mb-3">{upgrade.title}</h6>
              <a href="#" className="btn btn-white">{upgrade.buttonText} <i className="ti ti-arrow-right" /></a>
              <div className="box-bg">
                <span className="bg-right"><img src={upgrade.rightBg} alt="Img" /></span>
                <span className="bg-left"><img src={upgrade.leftBg} alt="Img" /></span>
              </div>
            </div>
          </InfoCard>
        </div>

        <div className="col-xxl-9 col-xl-8 theiaStickySidebar">
          <InfoCard cardClass="card border-0">
            <div id="calendar" />
          </InfoCard>
        </div>
      </div>
    </>
  );
}
