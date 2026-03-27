/**
 * DealsDashboardPage.jsx
 *
 * Full React conversion of deals-dashboard.php
 *
 * Dependencies to install:
 *   npm install chart.js react-chartjs-2 recharts
 *
 * Chart mapping from chart-data.js:
 *   #pipeline_chart  → <PipelineChart>   (Recharts BarChart — was ApexCharts, no config found so built to match visually)
 *   #deals_stage     → <DealsStageChart> (Recharts AreaChart — was ApexCharts)
 *   #deal_chart      → <DealRadarChart>  (Chart.js Radar — exact config from chart-data.js)
 *   .country-chart-* → <SparklineBar>    (inline SVG sparkline — replaces jQuery sparkline plugin)
 */


import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
} from "chart.js";
import { Radar } from "react-chartjs-2";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RTooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts";

ChartJS.register(RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend);

// ─── Data ────────────────────────────────────────────────────────────────────

const statCards = [
  { label: "Total Deals",       value: "$45,221,45", icon: "ti-delta",       bg: "bg-primary",   trend: "-4.01%",  trendUp: false },
  { label: "Total Customers",   value: "9895",        icon: "ti-users-group", bg: "bg-purple",    trend: "+55%",    trendUp: true  },
  { label: "Deal Value",        value: "$12,545,68",  icon: "ti-currency",    bg: "bg-secondary", trend: "+20.01%", trendUp: true  },
  { label: "Conversion Rate",   value: "51.96%",      icon: "ti-swipe",       bg: "bg-info",      trend: "-6.01%",  trendUp: false },
  { label: "Revenue this month",value: "$46,548,48",  icon: "ti-stairs-up",   bg: "bg-pink",      trend: "+55%",    trendUp: true  },
  { label: "Active Customers",  value: "8987",        icon: "ti-star",        bg: "bg-warning",   trend: "-3.22%",  trendUp: false },
];

const pipelineData = [
  { stage: "Lead In",    value: 62 },
  { stage: "Contact",    value: 45 },
  { stage: "Proposal",   value: 38 },
  { stage: "Negotiation",value: 28 },
  { stage: "Closed",     value: 18 },
];

const dealsStageData = [
  { month: "Jan", deals: 30 },
  { month: "Feb", deals: 55 },
  { month: "Mar", deals: 40 },
  { month: "Apr", deals: 70 },
  { month: "May", deals: 50 },
  { month: "Jun", deals: 85 },
  { month: "Jul", deals: 65 },
  { month: "Aug", deals: 98 },
];

// Exact data from chart-data.js #deal_chart
const radarData = {
  labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug"],
  datasets: [
    {
      label: "Email",
      data: [40, 70, 20, 40, 40, 70, 40, 60],
      backgroundColor: "rgba(45,203,115,0.15)",
      borderColor: "#2dcb73",
      pointBackgroundColor: "#2dcb73",
      pointBorderColor: "#fff",
      pointHoverBackgroundColor: "#fff",
      pointHoverBorderColor: "rgba(255,99,132,1)",
      tension: 0.3,
    },
    {
      label: "Chat",
      data: [30, 30, 90, 30, 60, 30, 60, 90],
      backgroundColor: "rgba(75,48,136,0.15)",
      borderColor: "#4b3088",
      pointBackgroundColor: "#4b3088",
      pointBorderColor: "#fff",
      pointHoverBackgroundColor: "#fff",
      pointHoverBorderColor: "rgba(54,162,235,1)",
      tension: 0.4,
    },
    {
      label: "Marketing",
      data: [70, 43, 70, 90, 30, 30, 30, 40],
      backgroundColor: "rgba(242,101,34,0.15)",
      borderColor: "#F26522",
      pointBackgroundColor: "#F26522",
      pointBorderColor: "#fff",
      pointHoverBackgroundColor: "#fff",
      pointHoverBorderColor: "rgba(54,162,235,1)",
      tension: 0.4,
    },
  ],
};

const radarOptions = {
  responsive: true,
  maintainAspectRatio: false,
  scales: {
    r: {
      angleLines: { display: true, color: "#e9e9e9" },
      grid: { circular: true },
      suggestedMin: 0,
      suggestedMax: 100,
      ticks: { stepSize: 30 },
    },
  },
  plugins: { legend: { display: false } },
};

const companies = [
  { name: "Pitch",           date: "05 April, 2025",   value: "$3655", img: "/assets/img/company/company-24.svg" },
  { name: "Initech",         date: "05 May, 2025",     value: "$2185", img: "/assets/img/company/company-25.svg" },
  { name: "Umbrella Corp",   date: "29 April, 2025",   value: "$1583", img: "/assets/img/company/company-26.svg" },
  { name: "Capital Partners",date: "23 Mar, 2025",     value: "$6584", img: "/assets/img/company/company-27.svg" },
  { name: "Massive Dynamic", date: "23 Feb, 2025",     value: "$2153", img: "/assets/img/company/company-28.svg" },
];

const countries = [
  { name: "USA",       deals: 350, value: "$1065.00", flag: "/assets/img/payment-gateway/country-01.svg", color: "#4361ee" },
  { name: "UAE",       deals: 221, value: "$966.00",  flag: "/assets/img/payment-gateway/country-02.svg", color: "#4361ee" },
  { name: "Singapore", deals: 236, value: "$959.00",  flag: "/assets/img/payment-gateway/country-03.svg", color: "#f26522" },
  { name: "France",    deals: 589, value: "$879.00",  flag: "/assets/img/payment-gateway/country-04.svg", color: "#4361ee" },
  { name: "Norway",    deals: 221, value: "$632.00",  flag: "/assets/img/payment-gateway/country-05.svg", color: "#f26522" },
];

const wonStages = [
  { label: "Conversion", pct: "48%", bg: "bg-secondary" },
  { label: "Calls",      pct: "24%", bg: "bg-danger"    },
  { label: "Email",      pct: "39%", bg: "bg-warning"   },
  { label: "Chats",      pct: "20%", bg: "bg-success"   },
];

const followUps = [
  { name: "Alexander Jermai", role: "UI/UX Designer",   img: "/assets/img/users/user-27.jpg", icon: "ti-mail-bolt"     },
  { name: "Doglas Martini",   role: "Product Designer",  img: "/assets/img/users/user-42.jpg", icon: "ti-phone"         },
  { name: "Daniel Esbella",   role: "Project Manager",   img: "/assets/img/users/user-43.jpg", icon: "ti-mail-bolt"     },
  { name: "Daniel Esbella",   role: "Team Lead",         img: "/assets/img/users/user-11.jpg", icon: "ti-brand-hipchat" },
  { name: "Stephan Peralt",   role: "Team Lead",         img: "/assets/img/users/user-44.jpg", icon: "ti-brand-hipchat" },
];

const recentDeals = [
  { name: "Collins",    stage: "Quality To Buy", value: "$4,50,000", owner: "Anthony Lewis", ownerImg: "/assets/img/users/user-32.jpg", date: "14/01/2024" },
  { name: "Konopelski", stage: "Proposal Made",  value: "$3,15,000", owner: "Brian Villalobos", ownerImg: "/assets/img/users/user-09.jpg", date: "21/01/2024" },
  { name: "Adams",      stage: "Contact Made",   value: "$8,40,000", owner: "Harvey Smith",  ownerImg: "/assets/img/users/user-01.jpg", date: "20/02/2024" },
  { name: "Schumm",     stage: "Quality To Buy", value: "$6,10,000", owner: "Stephan Peralt",ownerImg: "/assets/img/users/user-33.jpg", date: "15/03/2024" },
  { name: "Wisozk",     stage: "Presentation",   value: "$4,70,000", owner: "Doglas Martini",ownerImg: "/assets/img/users/user-34.jpg", date: "12/04/2024" },
];

const recentActivities = [
  { bg: "bg-success", icon: "ti-phone-filled",            text: "Drain responded to your appointment schedule question.", time: "09:25 PM" },
  { bg: "bg-info",    icon: "ti-message-circle-2-filled",  text: "You sent 1 Message to the James.", time: "10:25 PM" },
  { bg: "bg-success", icon: "ti-phone-filled",             text: "Denwar responded to your appointment on 25 Jan 2025, 08:15 PM", time: "09:25 PM" },
  { bg: "bg-purple",  icon: "ti-user-circle",              text: "Meeting With Abraham", time: "09:25 PM" },
];

// ─── Sub-components ───────────────────────────────────────────────────────────

/** Inline SVG sparkline — replaces .country-chart-1 / .country-chart-2 jQuery sparkline */
function SparklineBar({ values = [0,3,0,2,1,3,1], color = "#4361ee" }) {
  const max = Math.max(...values, 1);
  const w = 60, h = 28, barW = 6, gap = 3;
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
      {values.map((v, i) => {
        const barH = Math.max(2, (v / max) * (h - 4));
        return (
          <rect
            key={i}
            x={i * (barW + gap)}
            y={h - barH}
            width={barW}
            height={barH}
            rx={2}
            fill={color}
            opacity={0.85}
          />
        );
      })}
    </svg>
  );
}

/** Pipeline Stages — Recharts horizontal bar */
function PipelineChart() {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={pipelineData} layout="vertical" margin={{ left: 10, right: 20, top: 5, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" horizontal={false} />
        <XAxis type="number" tick={{ fontSize: 11 }} />
        <YAxis type="category" dataKey="stage" tick={{ fontSize: 11 }} width={90} />
        <RTooltip />
        <Bar dataKey="value" fill="#4361ee" radius={[0, 4, 4, 0]} barSize={14} />
      </BarChart>
    </ResponsiveContainer>
  );
}

/** Deals by Stage — Recharts area chart */
function DealsStageChart() {
  return (
    <ResponsiveContainer width="100%" height={200}>
      <AreaChart data={dealsStageData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
        <defs>
          <linearGradient id="dealsGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%"  stopColor="#4361ee" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#4361ee" stopOpacity={0}   />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey="month" tick={{ fontSize: 11 }} />
        <YAxis tick={{ fontSize: 11 }} />
        <RTooltip />
        <Area type="monotone" dataKey="deals" stroke="#4361ee" strokeWidth={2} fill="url(#dealsGrad)" dot={{ r: 3, fill: "#4361ee" }} />
      </AreaChart>
    </ResponsiveContainer>
  );
}

/** Top Deals Radar — exact config from chart-data.js #deal_chart */
function DealRadarChart() {
  return (
    <div style={{ height: 200, position: "relative" }}>
      <Radar data={radarData} options={radarOptions} />
    </div>
  );
}

/** Won Deals Stage — pure CSS bubble layout */
function WonDealsStage() {
  const sizes = ["120px", "90px", "100px", "80px"];
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 12, flexWrap: "wrap", padding: "12px 0" }}>
      {wonStages.map((s, i) => (
        <div
          key={s.label}
          className={`${s.bg} rounded-circle d-flex flex-column align-items-center justify-content-center text-white`}
          style={{ width: sizes[i], height: sizes[i], flexShrink: 0 }}
        >
          <span className="d-block mb-1" style={{ fontSize: 11 }}>{s.label}</span>
          <h6 className="text-white mb-0">{s.pct}</h6>
        </div>
      ))}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

function DealsDashboardPage() {
  return (
    <div className="content">

      {/* Breadcrumb */}
      <div className="d-md-flex d-block align-items-center justify-content-between page-breadcrumb mb-3">
        <div className="my-auto mb-2">
          <h2 className="mb-1">Deals Dashboard</h2>
          <nav>
            <ol className="breadcrumb mb-0">
              <li className="breadcrumb-item"><a href="#"><i className="ti ti-smart-home"></i></a></li>
              <li className="breadcrumb-item">Dashboard</li>
              <li className="breadcrumb-item active" aria-current="page">Deals Dashboard</li>
            </ol>
          </nav>
        </div>
        <div className="d-flex my-xl-auto right-content align-items-center flex-wrap">
          <div className="me-2 mb-2">
            <div className="dropdown">
              <a href="#" className="dropdown-toggle btn btn-white d-inline-flex align-items-center" data-bs-toggle="dropdown">
                <i className="ti ti-file-export me-1"></i>Export
              </a>
              <ul className="dropdown-menu dropdown-menu-end p-3">
                <li><a href="#" className="dropdown-item rounded-1"><i className="ti ti-file-type-pdf me-1"></i>Export as PDF</a></li>
                <li><a href="#" className="dropdown-item rounded-1"><i className="ti ti-file-type-xls me-1"></i>Export as Excel</a></li>
              </ul>
            </div>
          </div>
          <div className="input-icon mb-2 position-relative">
            <span className="input-icon-addon"><i className="ti ti-calendar text-gray-9"></i></span>
            <input type="text" className="form-control" placeholder="dd/mm/yyyy - dd/mm/yyyy" />
          </div>
        </div>
      </div>

      {/* ── Row 1: Stat Cards + Pipeline Chart ── */}
      <div className="row">
        <div className="col-xl-6 d-flex">
          <div className="row flex-fill">
            {/* Left column: 3 cards */}
            <div className="col-sm-6">
              {statCards.filter((_, i) => i % 2 === 0).map((card) => (
                <div key={card.label} className="card bg-linear-gradiant border-white border-2 overlay-bg-3 position-relative">
                  <div className="card-body">
                    <div className="d-flex justify-content-between align-items-center flex-wrap mb-3">
                      <div>
                        <p className="fw-medium mb-1">{card.label}</p>
                        <h5>{card.value}</h5>
                      </div>
                      <div className={`avatar avatar-md br-10 icon-rotate ${card.bg}`}>
                        <span className="d-flex align-items-center"><i className={`ti ${card.icon} text-white fs-16`}></i></span>
                      </div>
                    </div>
                    <div className="progress progress-xs mb-2">
                      <div className={`progress-bar ${card.bg}`} role="progressbar" style={{ width: "40%" }}></div>
                    </div>
                    <p className="fw-medium fs-13">
                      <span className={`${card.trendUp ? "text-success" : "text-danger"} fs-12`}>
                        <i className="ti ti-arrow-wave-right-up me-1"></i>{card.trend}
                      </span> from last week
                    </p>
                  </div>
                </div>
              ))}
            </div>
            {/* Right column: 3 cards */}
            <div className="col-sm-6">
              {statCards.filter((_, i) => i % 2 === 1).map((card) => (
                <div key={card.label} className="card bg-linear-gradiant border-white border-2 overlay-bg-3 position-relative">
                  <div className="card-body">
                    <div className="d-flex justify-content-between align-items-center flex-wrap mb-3">
                      <div>
                        <p className="fw-medium mb-1">{card.label}</p>
                        <h5>{card.value}</h5>
                      </div>
                      <div className={`avatar avatar-md br-10 icon-rotate ${card.bg}`}>
                        <span className="d-flex align-items-center"><i className={`ti ${card.icon} text-white fs-16`}></i></span>
                      </div>
                    </div>
                    <div className="progress progress-xs mb-2">
                      <div className={`progress-bar ${card.bg}`} role="progressbar" style={{ width: "40%" }}></div>
                    </div>
                    <p className="fw-medium fs-13">
                      <span className={`${card.trendUp ? "text-success" : "text-danger"} fs-12`}>
                        <i className="ti ti-arrow-wave-right-up me-1"></i>{card.trend}
                      </span> from last week
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Pipeline Stages Chart */}
        <div className="col-xl-6 d-flex">
          <div className="card flex-fill">
            <div className="card-header">
              <div className="d-flex align-items-center justify-content-between">
                <h5>Pipeline Stages</h5>
                <div className="dropdown">
                  <a href="#" className="btn btn-white border btn-sm d-inline-flex align-items-center" data-bs-toggle="dropdown">
                    <i className="ti ti-calendar me-1"></i>This Week
                  </a>
                  <ul className="dropdown-menu dropdown-menu-end p-3">
                    <li><a href="#" className="dropdown-item rounded-1">This Month</a></li>
                    <li><a href="#" className="dropdown-item rounded-1">This Week</a></li>
                    <li><a href="#" className="dropdown-item rounded-1">Last Week</a></li>
                  </ul>
                </div>
              </div>
            </div>
            <div className="card-body">
              {/* ✅ React chart — replaces <div id="pipeline_chart"> */}
              <PipelineChart />
              <div className="mt-3">
                <h6 className="mb-3">Leads Values By Stages</h6>
                <div className="row g-2 justify-content-center">
                  {[
                    { label: "Marketing",   val: "$5,221,45" },
                    { label: "Sales",       val: "$30,424"   },
                    { label: "Email",       val: "$21,135"   },
                    { label: "Chat",        val: "$15,235"   },
                    { label: "Operational", val: "$10,557"   },
                  ].map((item) => (
                    <div key={item.label} className="col-md col-sm-4 col-6">
                      <div className="border rounded text-center p-2">
                        <p className="mb-1"><i className="ti ti-point-filled text-primary"></i>{item.label}</p>
                        <h6>{item.val}</h6>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Row 2: Deals by Stage + Companies + Top Deals Radar ── */}
      <div className="row">

        {/* Deals by Stage */}
        <div className="col-xl-4 d-flex">
          <div className="card flex-fill">
            <div className="card-header">
              <div className="d-flex align-items-center justify-content-between flex-wrap row-gap-2">
                <h5>Deals by Stage</h5>
                <div className="dropdown">
                  <a href="#" className="btn btn-white border btn-sm d-inline-flex align-items-center" data-bs-toggle="dropdown">
                    <i className="ti ti-calendar me-1"></i>This Week
                  </a>
                  <ul className="dropdown-menu dropdown-menu-end p-3">
                    <li><a href="#" className="dropdown-item rounded-1">This Month</a></li>
                    <li><a href="#" className="dropdown-item rounded-1">This Week</a></li>
                    <li><a href="#" className="dropdown-item rounded-1">Last Week</a></li>
                  </ul>
                </div>
              </div>
            </div>
            <div className="card-body pb-0">
              <div className="d-flex align-items-center mb-2">
                <h3 className="me-2">98%</h3>
                <span className="badge badge-outline-success bg-success-transparent rounded-pill me-1">12%</span>
                <span>vs last years</span>
              </div>
              {/* ✅ React chart — replaces <div id="deals_stage"> */}
              <DealsStageChart />
            </div>
          </div>
        </div>

        {/* Deals By Companies */}
        <div className="col-xl-4 d-flex">
          <div className="card flex-fill">
            <div className="card-header">
              <div className="d-flex align-items-center justify-content-between flex-wrap row-gap-2">
                <h5>Deals By Companies</h5>
                <div className="dropdown">
                  <a href="#" className="btn btn-white border btn-sm d-inline-flex align-items-center" data-bs-toggle="dropdown">
                    <i className="ti ti-calendar me-1"></i>This Week
                  </a>
                  <ul className="dropdown-menu dropdown-menu-end p-3">
                    <li><a href="#" className="dropdown-item rounded-1">This Month</a></li>
                    <li><a href="#" className="dropdown-item rounded-1">This Week</a></li>
                    <li><a href="#" className="dropdown-item rounded-1">Last Week</a></li>
                  </ul>
                </div>
              </div>
            </div>
            <div className="card-body">
              {companies.map((c, i) => (
                <div key={c.name} className={`border border-dashed bg-transparent-light rounded p-2 ${i < companies.length - 1 ? "mb-2" : ""}`}>
                  <div className="d-flex align-items-center justify-content-between">
                    <div className="d-flex align-items-center">
                      <a href="#" className="avatar avatar-md rounded-circle bg-gray-100 flex-shrink-0 me-2">
                        <img src={c.img} className="w-auto h-auto" alt={c.name} />
                      </a>
                      <div>
                        <h6 className="fw-medium mb-1">{c.name}</h6>
                        <p className="text-truncate mb-0">Closing Deal date {c.date}</p>
                      </div>
                    </div>
                    <h6>{c.value}</h6>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Top Deals — Radar Chart */}
        <div className="col-xl-4 d-flex">
          <div className="card flex-fill">
            <div className="card-header">
              <div className="d-flex align-items-center justify-content-between flex-wrap row-gap-2">
                <h5>Top Deals</h5>
                <div className="dropdown">
                  <a href="#" className="btn btn-white border btn-sm d-inline-flex align-items-center" data-bs-toggle="dropdown">
                    <i className="ti ti-calendar me-1"></i>This Week
                  </a>
                  <ul className="dropdown-menu dropdown-menu-end p-3">
                    <li><a href="#" className="dropdown-item rounded-1">This Month</a></li>
                    <li><a href="#" className="dropdown-item rounded-1">This Week</a></li>
                    <li><a href="#" className="dropdown-item rounded-1">Last Week</a></li>
                  </ul>
                </div>
              </div>
            </div>
            <div className="card-body">
              {/* ✅ React chart — replaces <canvas id="deal_chart"> */}
              <DealRadarChart />
              <div className="mt-3">
                <h6 className="mb-3">Status</h6>
                <div className="d-flex align-items-center justify-content-between mb-2">
                  <p className="f-13 mb-0"><i className="ti ti-circle-filled text-primary me-1"></i>Marketing</p>
                  <p className="f-13 fw-medium text-gray-9 mb-0">$5,69,877</p>
                </div>
                <div className="d-flex align-items-center justify-content-between mb-2">
                  <p className="f-13 mb-0"><i className="ti ti-circle-filled text-purple me-1"></i>Chat</p>
                  <p className="f-13 fw-medium text-gray-9 mb-0">$4,84,575</p>
                </div>
                <div className="d-flex align-items-center justify-content-between">
                  <p className="f-13 mb-0"><i className="ti ti-circle-filled text-success me-1"></i>Email</p>
                  <p className="f-13 fw-medium text-gray-9 mb-0">$1,84,575</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Row 3: Country + Won Deals + Follow Up ── */}
      <div className="row">

        {/* Deals By Country */}
        <div className="col-xl-4 d-flex">
          <div className="card flex-fill">
            <div className="card-header">
              <div className="d-flex align-items-center justify-content-between flex-wrap row-gap-2">
                <h5>Deals By Country</h5>
                <a href="#" className="btn btn-light btn-sm px-3">View All</a>
              </div>
            </div>
            <div className="card-body py-2">
              <div className="table-responsive pt-1">
                <table className="table table-nowrap table-borderless mb-0">
                  <tbody>
                    {countries.map((c) => (
                      <tr key={c.name}>
                        <td className="px-0">
                          <div className="d-flex align-items-center mb-2">
                            <a href="#" className="avatar rounded-circle border border-2">
                              <img src={c.flag} className="img-fluid rounded-circle" alt={c.name} />
                            </a>
                            <div className="ms-2">
                              <h6 className="fw-medium mb-1">{c.name}</h6>
                              <span className="fs-13">Deals : {c.deals}</span>
                            </div>
                          </div>
                        </td>
                        <td>
                          {/* ✅ SVG sparkline — replaces .country-chart-1 / .country-chart-2 jQuery plugin */}
                          <div className="text-center mb-2">
                            <SparklineBar values={[0,3,0,2,1,3,1]} color={c.color} />
                          </div>
                        </td>
                        <td className="px-0 text-end">
                          <div className="mb-2">
                            <p className="fs-13 mb-1">Total Value</p>
                            <h6 className="fw-medium">{c.value}</h6>
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

        {/* Won Deals Stage */}
        <div className="col-xl-4 d-flex">
          <div className="card flex-fill">
            <div className="card-header">
              <div className="d-flex align-items-center justify-content-between flex-wrap row-gap-2">
                <h5>Won Deals Stage</h5>
                <div className="dropdown">
                  <a href="#" className="btn btn-white border-0 dropdown-toggle btn-sm d-inline-flex align-items-center" data-bs-toggle="dropdown">
                    Sales Pipeline
                  </a>
                  <ul className="dropdown-menu dropdown-menu-end p-3">
                    <li><a href="#" className="dropdown-item rounded-1">This Month</a></li>
                    <li><a href="#" className="dropdown-item rounded-1">This Week</a></li>
                    <li><a href="#" className="dropdown-item rounded-1">Last Week</a></li>
                  </ul>
                </div>
              </div>
            </div>
            <div className="card-body">
              <div className="text-center mb-4">
                <p className="mb-1 fw-medium">Stages Won This Year</p>
                <div className="d-flex align-items-center justify-content-center">
                  <h3 className="me-2">$45,899,79</h3>
                  <span className="badge badge-soft-danger border-danger border rounded-pill me-1">$45,899,79</span>
                </div>
              </div>
              {/* ✅ Pure CSS bubble layout — was custom CSS .deal-stage-chart */}
              <WonDealsStage />
            </div>
          </div>
        </div>

        {/* Recent Follow Up */}
        <div className="col-xl-4 d-flex">
          <div className="card flex-fill">
            <div className="card-header">
              <div className="d-flex align-items-center justify-content-between flex-wrap row-gap-2">
                <h5>Recent Follow Up</h5>
                <a href="#" className="btn btn-light btn-sm px-3">View All</a>
              </div>
            </div>
            <div className="card-body">
              {followUps.map((f, i) => (
                <div key={i} className={`d-flex align-items-center justify-content-between ${i < followUps.length - 1 ? "mb-4" : ""}`}>
                  <div className="d-flex align-items-center">
                    <a href="#" className="avatar flex-shrink-0">
                      <img src={f.img} className="rounded-circle border border-2" alt={f.name} />
                    </a>
                    <div className="ms-2">
                      <h6 className="fs-14 fw-medium text-truncate mb-1"><a href="#">{f.name}</a></h6>
                      <p className="fs-13 mb-0">{f.role}</p>
                    </div>
                  </div>
                  <a href="#" className="btn btn-light btn-icon btn-sm">
                    <i className={`ti ${f.icon} fs-16`}></i>
                  </a>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Row 4: Recent Deals + Recent Activities ── */}
      <div className="row">

        {/* Recent Deals Table */}
        <div className="col-xl-8 d-flex">
          <div className="card flex-fill">
            <div className="card-header d-flex align-items-center justify-content-between flex-wrap row-gap-2">
              <h5>Recent Deals</h5>
              <a href="#" className="btn btn-sm btn-light px-3">View All</a>
            </div>
            <div className="card-body p-0">
              <div className="table-responsive">
                <table className="table table-nowrap dashboard-table mb-0">
                  <thead>
                    <tr>
                      <th>Deal Name</th>
                      <th>Stage</th>
                      <th>Deal Value</th>
                      <th>Owner</th>
                      <th>Closed Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentDeals.map((d) => (
                      <tr key={d.name}>
                        <td><h6 className="fw-medium"><a href="#">{d.name}</a></h6></td>
                        <td>{d.stage}</td>
                        <td>{d.value}</td>
                        <td>
                          <div className="d-flex align-items-center">
                            <a href="#" className="avatar avatar-rounded flex-shrink-0 me-2">
                              <img src={d.ownerImg} alt={d.owner} />
                            </a>
                            <h6 className="fw-medium mb-0"><a href="#">{d.owner}</a></h6>
                          </div>
                        </td>
                        <td>{d.date}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activities */}
        <div className="col-xl-4 d-flex">
          <div className="card flex-fill">
            <div className="card-header">
              <div className="d-flex align-items-center justify-content-between flex-wrap row-gap-2">
                <h5>Recent Activities</h5>
                <a href="#" className="btn btn-sm btn-light px-3">View All</a>
              </div>
            </div>
            <div className="card-body schedule-timeline activity-timeline">
              {recentActivities.map((a, i) => (
                <div key={i} className="d-flex align-items-start">
                  <div className={`avatar avatar-md avatar-rounded ${a.bg} flex-shrink-0`}>
                    <i className={`ti ${a.icon} fs-16`}></i>
                  </div>
                  <div className={`flex-fill ps-3 ${i < recentActivities.length - 1 ? "pb-4" : ""} timeline-flow`}>
                    <p className="fw-medium text-gray-9 mb-1"><a href="#">{a.text}</a></p>
                    <span>{a.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

     

    </div>
  );
}

export default DealsDashboardPage;