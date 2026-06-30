import{j as e,P as y,L as w}from"./index-D3e3md-c.js";import{u as k,E as M}from"./ErrorState-wFSL4woR.js";import{e as n,a as T}from"./dashboardService-DAiPh3dw.js";function b(a){if(!a)return"-";const s=new Date(a);return Number.isNaN(s.getTime())?"-":new Intl.DateTimeFormat("en-IN",{day:"2-digit",month:"short",year:"numeric"}).format(s)}function A(a){if(!a)return"-";const s=new Date(a);return Number.isNaN(s.getTime())?"-":new Intl.DateTimeFormat("en-IN",{day:"2-digit",month:"short",year:"numeric",hour:"2-digit",minute:"2-digit"}).format(s)}function j(a){if(!a)return"-";const s=new Date(a);return Number.isNaN(s.getTime())?"-":new Intl.DateTimeFormat("en-IN",{hour:"2-digit",minute:"2-digit",hour12:!0}).format(s)}function o(a){const s=Number(a||0),m=Math.floor(s/60),h=s%60;return`${m}h ${String(h).padStart(2,"0")}m`}function p(a,s){const m=Number(a||0),h=Number(s||0);return`${m}h ${String(h).padStart(2,"0")}m`}function D(a){const s=Number(a);return Number.isNaN(s)?"":s===0?"Today":s===1?"Tomorrow":s>1?`${s} days away`:`${Math.abs(s)} days ago`}function P(a){const s=a?.firstName?.trim()?.[0]||"",m=a?.lastName?.trim()?.[0]||a?.username?.trim()?.[0]||"";return`${s}${m}`.toUpperCase()||"EM"}function g(a){return(a||"N/A").replaceAll("_"," ")}function S(a,s){return Array.isArray(a)&&a.length>0?a:[{id:1,iconBg:"bg-primary",icon:"ti ti-clock",title:"Today Hours",value:p(s?.totalHoursToday,s?.totalMinutesToday),trend:"Today"},{id:2,iconBg:"bg-info",icon:"ti ti-calendar-time",title:"This Week",value:p(s?.totalHoursWeek,s?.totalMinutesWeek),trend:"Work hours"},{id:3,iconBg:"bg-success",icon:"ti ti-calendar-stats",title:"This Month",value:p(s?.totalHoursMonth,s?.totalMinutesMonth),trend:"Work hours"},{id:4,iconBg:"bg-warning",icon:"ti ti-briefcase",title:"Overtime",value:o(s?.overtimeMinutesMonth),trend:"This month"}]}function W(){const{data:a,isLoading:s,error:m,refetch:h}=k({queryKey:["employee-dashboard"],queryFn:T.getEmployeeDashboard,placeholderData:n,keepPreviousData:!0}),t=a&&typeof a=="object"?a:n,d=t.profile||n.profile,l=t.attendanceSummary||n.attendanceSummary,r=t.todayAttendance||null,x=t.leaveSummary||n.leaveSummary,f=t.performanceSummary||n.performanceSummary,c=t.nextHoliday||n.nextHoliday,u=t.leavePolicySummary||n.leavePolicySummary;S(t.quickStats,l),Array.isArray(t.recentLeaves)&&t.recentLeaves;const v=Array.isArray(t.recentActivities)?t.recentActivities:[];return s&&!a?e.jsx(y,{}):m&&!a?e.jsx(M,{onRetry:h}):e.jsxs("div",{className:"employee-dashboard-wrapper container-fluid p-0",children:[e.jsx("style",{children:`
        .employee-dashboard-wrapper .dashboard-hero {
          background: linear-gradient(135deg, #4f46e5 0%, #312e81 100%);
          border: 0;
          color: #fff;
          box-shadow: 0 10px 25px -5px rgba(79, 70, 229, 0.3);
        }
        .employee-dashboard-wrapper .dashboard-hero .muted {
          color: rgba(255, 255, 255, 0.85);
        }
        .employee-dashboard-wrapper .dashboard-card {
          border: 1px solid rgba(226, 232, 240, 0.8);
          border-radius: 1rem;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03);
          transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
          background: #ffffff;
          margin-bottom: 1.5rem;
        }
        .employee-dashboard-wrapper .dashboard-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 12px 20px -8px rgba(0, 0, 0, 0.08), 0 4px 12px -2px rgba(0, 0, 0, 0.04);
        }
        .employee-dashboard-wrapper .dashboard-muted {
          color: #64748b;
          font-weight: 500;
        }
        .employee-dashboard-wrapper .avatar-fallback {
          width: 72px;
          height: 72px;
          border-radius: 1rem;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          background: linear-gradient(135deg, #ffffff, #e2e8f0);
          color: #1e293b;
          overflow: hidden;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        }
        .employee-dashboard-wrapper .profile-detail-row {
          padding: 0.65rem 0.5rem;
          border-bottom: 1px solid #f1f5f9;
        }
        .employee-dashboard-wrapper .profile-detail-row:last-child {
          border-bottom: 0;
        }
        .employee-dashboard-wrapper .metric-tile-mini {
          border-radius: 0.5rem;
          padding: 0.65rem 0.4rem;
          text-align: center;
          transition: all 0.2s ease;
        }
        .employee-dashboard-wrapper .tile-primary { background-color: #e0e7ff; color: #312e81; }
        .employee-dashboard-wrapper .tile-info { background-color: #e0f2fe; color: #0369a1; }
        .employee-dashboard-wrapper .tile-success { background-color: #d1fae5; color: #065f46; }
        .employee-dashboard-wrapper .tile-warning { background-color: #fef3c7; color: #92400e; }
        .employee-dashboard-wrapper .tile-danger { background-color: #fee2e2; color: #991b1b; }
        .employee-dashboard-wrapper .tile-secondary { background-color: #f1f5f9; color: #334155; }
        
        .employee-dashboard-wrapper .badge-premium {
          padding: 0.35em 0.65em;
          font-size: 0.75em;
          font-weight: 600;
          border-radius: 0.5rem;
        }
        .employee-dashboard-wrapper .progress-sm {
          height: 6px;
        }
        .employee-dashboard-wrapper .avatar-group .avatar {
          position: relative;
          display: inline-block;
          width: 30px;
          height: 30px;
          border: 2px solid #fff;
          border-radius: 50%;
          overflow: hidden;
          margin-left: -8px;
        }
        .employee-dashboard-wrapper .avatar-group .avatar:first-child {
          margin-left: 0;
        }
        .employee-dashboard-wrapper .skill-progress {
          margin-bottom: 1.25rem;
        }
        .employee-dashboard-wrapper .skill-progress:last-child {
          margin-bottom: 0;
        }
        .employee-dashboard-wrapper .timeline-punch-line {
          height: 4px;
          background: #e2e8f0;
          position: relative;
          margin: 1.5rem 0;
        }
        .employee-dashboard-wrapper .timeline-punch-bar {
          height: 100%;
          background: #10b981;
          position: absolute;
          left: 30%;
          width: 50%;
        }
        .employee-dashboard-wrapper .timeline-punch-dot {
          width: 12px;
          height: 12px;
          background: #94a3b8;
          border: 2px solid #fff;
          border-radius: 50%;
          position: absolute;
          top: -4px;
        }
        .employee-dashboard-wrapper .timeline-punch-dot.active {
          background: #10b981;
          box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.3);
        }
        .employee-dashboard-wrapper .notification-item-compact {
          border-bottom: 1px solid #f1f5f9;
          padding-bottom: 0.75rem;
          margin-bottom: 0.75rem;
        }
        .employee-dashboard-wrapper .notification-item-compact:last-child {
          border-bottom: 0;
          padding-bottom: 0;
          margin-bottom: 0;
        }
        .employee-dashboard-wrapper .meeting-row {
          border-left: 4px solid #cbd5e1;
          padding-left: 0.75rem;
          margin-bottom: 1rem;
        }
        .employee-dashboard-wrapper .meeting-row:last-child {
          margin-bottom: 0;
        }
      `}),e.jsx("div",{className:"card dashboard-card p-3 mb-4",children:e.jsxs("div",{className:"d-md-flex d-block align-items-center justify-content-between page-breadcrumb",children:[e.jsxs("div",{className:"my-auto",children:[e.jsx("h3",{className:"mb-1 fw-bold text-dark",children:t.header?.title||"Employee Dashboard"}),e.jsx("nav",{children:e.jsx("ol",{className:"breadcrumb mb-0",children:(t.header?.breadcrumbs||[]).map((i,N)=>e.jsx("li",{className:`breadcrumb-item ${N===(t.header?.breadcrumbs?.length||0)-1?"active":""}`,children:N<(t.header?.breadcrumbs?.length||0)-1&&i.href?e.jsxs(w,{to:i.href,className:"text-decoration-none",children:[i.iconClass?e.jsx("i",{className:`${i.iconClass} me-1`}):null,i.label]}):i.label},`${i.label}-${N}`))})})]}),e.jsxs("div",{className:"d-flex align-items-center gap-2 flex-wrap my-auto mt-md-0 mt-3",children:[e.jsx("span",{className:"badge bg-light text-dark border badge-premium",children:b(new Date().toISOString())}),e.jsx("span",{className:"badge bg-primary-transparent text-primary badge-premium",children:g(d?.role||"EMPLOYEE")}),e.jsx("span",{className:"badge bg-success-transparent text-success badge-premium",children:g(d?.activationStatus||(d?.active?"ACTIVE":"INACTIVE"))})]})]})}),t.statusMessage&&e.jsxs("div",{className:"alert bg-success-transparent alert-dismissible fade show mb-4 border-0 shadow-sm d-flex align-items-center",role:"alert",children:[e.jsx("i",{className:"ti ti-circle-check-filled fs-18 me-2 text-success"}),e.jsx("div",{className:"text-dark fw-medium",children:t.statusMessage}),e.jsx("button",{type:"button",className:"btn-close fs-14","data-bs-dismiss":"alert","aria-label":"Close",children:e.jsx("i",{className:"ti ti-x"})})]}),e.jsxs("div",{className:"row",children:[e.jsxs("div",{className:"col-lg-4 col-md-12",children:[e.jsx("div",{className:"card dashboard-card",children:e.jsxs("div",{className:"card-body p-4",children:[e.jsxs("div",{className:"dashboard-hero rounded-4 p-4 mb-4 text-center",children:[e.jsx("div",{className:"avatar-fallback mx-auto mb-3",style:{width:"80px",height:"80px",borderRadius:"50%"},children:e.jsx("span",{className:"fs-3 fw-bold text-dark",children:P(d)})}),e.jsx("h4",{className:"mb-1 fw-bold text-white",children:d?.firstName||d?.lastName?`${d.firstName||""} ${d.lastName||""}`.trim():"Employee"}),e.jsx("p",{className:"mb-2 muted fs-13",children:d?.designation||"Staff"}),e.jsx("span",{className:"badge bg-white-transparent badge-premium text-white fs-12",children:d?.departmentName||"General"})]}),e.jsxs("div",{className:"d-grid gap-1",children:[e.jsxs("div",{className:"profile-detail-row d-flex justify-content-between align-items-center",children:[e.jsxs("span",{className:"dashboard-muted fs-13",children:[e.jsx("i",{className:"ti ti-phone me-2 text-primary"}),"Phone Number"]}),e.jsx("div",{className:"fw-semibold text-dark",children:d?.phone||"-"})]}),e.jsxs("div",{className:"profile-detail-row d-flex justify-content-between align-items-center",children:[e.jsxs("span",{className:"dashboard-muted fs-13",children:[e.jsx("i",{className:"ti ti-mail me-2 text-primary"}),"Email Address"]}),e.jsx("div",{className:"fw-semibold text-dark text-truncate max-w-180",title:d?.email,children:d?.email||"-"})]}),e.jsxs("div",{className:"profile-detail-row d-flex justify-content-between align-items-center",children:[e.jsxs("span",{className:"dashboard-muted fs-13",children:[e.jsx("i",{className:"ti ti-user-check me-2 text-primary"}),"Report Office"]}),e.jsx("div",{className:"fw-semibold text-dark",children:d?.teamName||"Main Office"})]}),e.jsxs("div",{className:"profile-detail-row d-flex justify-content-between align-items-center",children:[e.jsxs("span",{className:"dashboard-muted fs-13",children:[e.jsx("i",{className:"ti ti-calendar-event me-2 text-primary"}),"Joined on"]}),e.jsx("div",{className:"fw-semibold text-dark",children:b(d?.joinDate)})]})]})]})}),e.jsxs("div",{className:"card dashboard-card",children:[e.jsx("div",{className:"card-header bg-white border-0 pb-0 pt-4 px-4",children:e.jsx("h5",{className:"mb-0 fw-bold text-dark",children:"Leave Details"})}),e.jsx("div",{className:"card-body p-4",children:e.jsxs("div",{className:"row g-3",children:[e.jsx("div",{className:"col-6",children:e.jsxs("div",{className:"metric-tile-mini tile-primary",children:[e.jsx("span",{className:"dashboard-muted fs-12 d-block mb-1",children:"Total Leaves"}),e.jsx("h5",{className:"fw-bold mb-0",children:x?.totalRequests||0})]})}),e.jsx("div",{className:"col-6",children:e.jsxs("div",{className:"metric-tile-mini tile-success",children:[e.jsx("span",{className:"dashboard-muted fs-12 d-block mb-1",children:"Taken"}),e.jsx("h5",{className:"fw-bold mb-0",children:x?.approvedRequests||0})]})}),e.jsx("div",{className:"col-6",children:e.jsxs("div",{className:"metric-tile-mini tile-danger",children:[e.jsx("span",{className:"dashboard-muted fs-12 d-block mb-1",children:"Absent"}),e.jsx("h5",{className:"fw-bold mb-0",children:l?.daysAbsent||0})]})}),e.jsx("div",{className:"col-6",children:e.jsxs("div",{className:"metric-tile-mini tile-warning",children:[e.jsx("span",{className:"dashboard-muted fs-12 d-block mb-1",children:"Request"}),e.jsx("h5",{className:"fw-bold mb-0",children:x?.pendingRequests||0})]})}),e.jsx("div",{className:"col-6",children:e.jsxs("div",{className:"metric-tile-mini tile-info",children:[e.jsx("span",{className:"dashboard-muted fs-12 d-block mb-1",children:"Worked Days"}),e.jsx("h5",{className:"fw-bold mb-0",children:l?.daysPresent||0})]})}),e.jsx("div",{className:"col-6",children:e.jsxs("div",{className:"metric-tile-mini tile-danger",children:[e.jsx("span",{className:"dashboard-muted fs-12 d-block mb-1",children:"Loss of Pay"}),e.jsx("h5",{className:"fw-bold mb-0",children:x?.declinedRequests||0})]})})]})})]})]}),e.jsxs("div",{className:"col-lg-5 col-md-12",children:[e.jsxs("div",{className:"card dashboard-card",children:[e.jsxs("div",{className:"card-header bg-white border-0 pb-0 pt-4 px-4 d-flex justify-content-between align-items-center",children:[e.jsx("h5",{className:"mb-0 fw-bold text-dark",children:"Leave Details"}),e.jsx("span",{className:"badge bg-success-transparent text-success badge-premium",children:"Better than 85% of Employees"})]}),e.jsx("div",{className:"card-body p-4",children:e.jsxs("div",{className:"row g-2",children:[e.jsx("div",{className:"col",children:e.jsxs("div",{className:"metric-tile-mini tile-success",children:[e.jsx("h4",{className:"fw-bold mb-0",children:Math.max(0,(l?.daysPresent||0)-(l?.daysLate||0))}),e.jsx("span",{className:"dashboard-muted fs-11",children:"on time"})]})}),e.jsx("div",{className:"col",children:e.jsxs("div",{className:"metric-tile-mini tile-danger",children:[e.jsx("h4",{className:"fw-bold mb-0",children:l?.daysLate||0}),e.jsx("span",{className:"dashboard-muted fs-11",children:"Late Att."})]})}),e.jsx("div",{className:"col",children:e.jsxs("div",{className:"metric-tile-mini tile-info",children:[e.jsx("h4",{className:"fw-bold mb-0",children:"0"}),e.jsx("span",{className:"dashboard-muted fs-11",children:"WFH"})]})}),e.jsx("div",{className:"col",children:e.jsxs("div",{className:"metric-tile-mini tile-warning",children:[e.jsx("h4",{className:"fw-bold mb-0",children:l?.daysAbsent||0}),e.jsx("span",{className:"dashboard-muted fs-11",children:"Absent"})]})}),e.jsx("div",{className:"col",children:e.jsxs("div",{className:"metric-tile-mini tile-primary",children:[e.jsx("h4",{className:"fw-bold mb-0",children:x?.approvedRequests||0}),e.jsx("span",{className:"dashboard-muted fs-11",children:"Sick Leave"})]})})]})})]}),e.jsxs("div",{className:"card dashboard-card",children:[e.jsxs("div",{className:"card-header bg-white border-0 pb-0 pt-4 px-4 d-flex justify-content-between align-items-center",children:[e.jsx("h5",{className:"mb-0 fw-bold text-dark",children:"Attendance Log"}),e.jsx("span",{className:"badge bg-info-transparent text-info badge-premium",children:r?.attendanceDate?b(r.attendanceDate):b(new Date().toISOString())})]}),e.jsxs("div",{className:"card-body p-4",children:[e.jsxs("div",{className:"row g-3",children:[e.jsx("div",{className:"col-md-6",children:e.jsxs("div",{className:"p-3 rounded bg-light",children:[e.jsxs("div",{className:"text-muted fs-12",children:[e.jsx("i",{className:"ti ti-login me-1 text-success"}),"Punch In at"]}),e.jsx("div",{className:"fw-bold fs-15 text-dark",children:r?.checkInTime?j(r.checkInTime):"-"})]})}),e.jsx("div",{className:"col-md-6",children:e.jsxs("div",{className:"p-3 rounded bg-light",children:[e.jsxs("div",{className:"text-muted fs-12",children:[e.jsx("i",{className:"ti ti-clock-check me-1 text-primary"}),"Net Ratio"]}),e.jsxs("div",{className:"fw-bold fs-15 text-dark",children:[r?.netWorkMinutes?o(r.netWorkMinutes):"-"," / 9h"]})]})})]}),e.jsxs("div",{className:"timeline-punch-line",children:[e.jsx("div",{className:"timeline-punch-bar",style:{left:r?.checkInTime?"30%":"0%",width:r?.checkOutTime?"50%":r?.checkInTime?"20%":"0%"}}),e.jsx("div",{className:"timeline-punch-dot active",style:{left:"0%"},title:"06:00 AM"}),e.jsx("div",{className:"timeline-punch-dot active",style:{left:"30%"},title:`Punch In - ${r?.checkInTime?j(r.checkInTime):"-"}`}),e.jsx("div",{className:r?.checkOutTime?"timeline-punch-dot active":"timeline-punch-dot",style:{left:"80%"},title:`Punch Out - ${r?.checkOutTime?j(r.checkOutTime):"-"}`}),e.jsx("div",{className:"timeline-punch-dot",style:{left:"100%"},title:"11:00 PM"})]}),e.jsxs("div",{className:"d-flex justify-content-between text-muted fs-11 px-1 mb-4",children:[e.jsx("span",{children:"06:00 AM"}),e.jsx("span",{children:"12:00 PM"}),e.jsx("span",{children:"06:00 PM"}),e.jsx("span",{children:"11:00 PM"})]}),e.jsxs("div",{className:"row g-2 text-center",children:[e.jsx("div",{className:"col-6 col-md-3",children:e.jsxs("div",{className:"border rounded p-2",children:[e.jsx("span",{className:"text-muted fs-11 d-block",children:"Total Hours"}),e.jsx("strong",{className:"text-dark fs-13",children:r?o((r.netWorkMinutes||0)+(r.breakTimeMinutes||0)+(r.lunchTimeMinutes||0)):"-"})]})}),e.jsx("div",{className:"col-6 col-md-3",children:e.jsxs("div",{className:"border rounded p-2",children:[e.jsx("span",{className:"text-muted fs-11 d-block",children:"Productive Hours"}),e.jsx("strong",{className:"text-success fs-13",children:r?o(r.netWorkMinutes):"-"})]})}),e.jsx("div",{className:"col-6 col-md-3",children:e.jsxs("div",{className:"border rounded p-2",children:[e.jsx("span",{className:"text-muted fs-11 d-block",children:"Break hours"}),e.jsx("strong",{className:"text-warning fs-13",children:r?o((r.breakTimeMinutes||0)+(r.lunchTimeMinutes||0)):"-"})]})}),e.jsx("div",{className:"col-6 col-md-3",children:e.jsxs("div",{className:"border rounded p-2",children:[e.jsx("span",{className:"text-muted fs-11 d-block",children:"Overtime"}),e.jsx("strong",{className:"text-danger fs-13",children:r?o(r.overtimeMinutes):"-"})]})})]})]})]}),e.jsxs("div",{className:"card dashboard-card",children:[e.jsx("div",{className:"card-header bg-white border-0 pb-0 pt-4 px-4",children:e.jsx("h5",{className:"mb-0 fw-bold text-dark",children:"Total Hours Today"})}),e.jsx("div",{className:"card-body p-4",children:e.jsxs("div",{className:"row g-3",children:[e.jsx("div",{className:"col-6",children:e.jsxs("div",{className:"border rounded p-3",children:[e.jsxs("div",{className:"d-flex justify-content-between align-items-center mb-1",children:[e.jsx("span",{className:"text-muted fs-12",children:"Total Hours Today"}),e.jsxs("span",{className:"text-success fw-bold fs-11",children:[e.jsx("i",{className:"ti ti-trending-up me-1"}),"-"]})]}),e.jsx("h4",{className:"fw-bold mb-0 text-dark",children:r?o(r.netWorkMinutes):"-"}),e.jsx("span",{className:"text-muted fs-11 mt-1 d-block",children:"Production hours"})]})}),e.jsx("div",{className:"col-6",children:e.jsxs("div",{className:"border rounded p-3",children:[e.jsxs("div",{className:"d-flex justify-content-between align-items-center mb-1",children:[e.jsx("span",{className:"text-muted fs-12",children:"Total Hours Week"}),e.jsxs("span",{className:"text-success fw-bold fs-11",children:[e.jsx("i",{className:"ti ti-trending-up me-1"}),"-"]})]}),e.jsxs("h4",{className:"fw-bold mb-0 text-dark",children:[p(l?.totalHoursWeek,l?.totalMinutesWeek)," / 40"]}),e.jsx("span",{className:"text-muted fs-11 mt-1 d-block",children:"Work week progress"})]})}),e.jsx("div",{className:"col-6",children:e.jsxs("div",{className:"border rounded p-3",children:[e.jsxs("div",{className:"d-flex justify-content-between align-items-center mb-1",children:[e.jsx("span",{className:"text-muted fs-12",children:"Total Hours Month"}),e.jsxs("span",{className:"text-success fw-bold fs-11",children:[e.jsx("i",{className:"ti ti-trending-up me-1"}),"-"]})]}),e.jsxs("h4",{className:"fw-bold mb-0 text-dark",children:[p(l?.totalHoursMonth,l?.totalMinutesMonth)," / 160"]}),e.jsx("span",{className:"text-muted fs-11 mt-1 d-block",children:"Work month progress"})]})}),e.jsx("div",{className:"col-6",children:e.jsxs("div",{className:"border rounded p-3",children:[e.jsxs("div",{className:"d-flex justify-content-between align-items-center mb-1",children:[e.jsx("span",{className:"text-muted fs-12",children:"Overtime Month"}),e.jsxs("span",{className:"text-success fw-bold fs-11",children:[e.jsx("i",{className:"ti ti-trending-up me-1"}),"-"]})]}),e.jsx("h4",{className:"fw-bold mb-0 text-dark",children:o(l?.overtimeMinutesMonth)}),e.jsx("span",{className:"text-muted fs-11 mt-1 d-block",children:"Overtime total progress"})]})})]})})]})]}),e.jsxs("div",{className:"col-lg-3 col-md-12",children:[e.jsxs("div",{className:"card dashboard-card text-center",children:[e.jsx("div",{className:"card-header bg-white border-0 pb-0 pt-4 px-4",children:e.jsx("h5",{className:"mb-0 fw-bold text-dark",children:"Performance"})}),e.jsxs("div",{className:"card-body p-4",children:[e.jsx("div",{className:"d-inline-flex align-items-center justify-content-center border border-success rounded-circle mb-3",style:{width:"90px",height:"90px",borderWidth:"4px"},children:e.jsxs("h3",{className:"fw-bold mb-0 text-success",children:[f?.completionPercent??0,"%"]})}),e.jsx("div",{className:"fw-semibold text-dark fs-13 mb-1",children:g(f?.status||"No review")}),e.jsx("div",{className:"text-muted fs-12",children:f?.summary||"No appraisal available yet."})]})]}),e.jsxs("div",{className:"card dashboard-card",children:[e.jsx("div",{className:"card-header bg-white border-0 pb-0 pt-4 px-4",children:e.jsx("h5",{className:"mb-0 fw-bold text-dark",children:"Notifications"})}),e.jsx("div",{className:"card-body p-4",children:v.length>0?v.map(i=>e.jsxs("div",{className:"notification-item-compact",children:[e.jsx("span",{className:"fw-medium text-dark fs-13 d-block",children:i.description||i.action}),e.jsx("span",{className:"text-muted fs-11",children:A(i.createdAt)})]},i.id||`${i.action}-${i.createdAt}`)):e.jsx("div",{className:"text-muted text-center fs-13 py-3",children:"No recent notifications"})})]}),e.jsxs("div",{className:"row g-3",children:[e.jsx("div",{className:"col-6",children:e.jsx("div",{className:"card dashboard-card",children:e.jsxs("div",{className:"card-body p-3 text-center",children:[e.jsx("i",{className:"ti ti-file-text text-primary fs-24 mb-2 d-block"}),e.jsx("span",{className:"fw-medium text-dark fs-13 d-block text-truncate",title:u?.policyName||"Leave Policy",children:u?.policyName||"Leave Policy"}),e.jsxs("span",{className:"text-muted fs-11 d-block mt-1",children:["Remaining: ",u?.remainingDays??0," / ",u?.allowedDays??0," days"]})]})})}),e.jsx("div",{className:"col-6",children:e.jsx("div",{className:"card dashboard-card",children:e.jsxs("div",{className:"card-body p-3 text-center",children:[e.jsx("i",{className:"ti ti-calendar-event text-danger fs-24 mb-2 d-block"}),e.jsx("span",{className:"fw-medium text-dark fs-13 d-block text-truncate",title:c?.title||"Next Holiday",children:c?.title||"Next Holiday"}),e.jsx("strong",{className:"text-danger fs-12 d-block mt-1",children:c?.date?b(c.date):"No upcoming holiday"}),e.jsx("span",{className:"text-muted fs-11 d-block mt-1",children:c?.daysAway!==null&&c?.daysAway!==void 0?D(c.daysAway):c?.description||""})]})})})]})]})]})]})}export{W as default};
