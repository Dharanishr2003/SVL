function initNexorDashboardCharts() {
  window.__nexorDashboardCharts = window.__nexorDashboardCharts || {};

  function destroyChart(targetId) {
    var existing = window.__nexorDashboardCharts[targetId];
    if (existing && typeof existing.destroy === "function") {
      try {
        existing.destroy();
      } catch (e) {
        // Ignore stale chart destroy failures.
      }
    }
    window.__nexorDashboardCharts[targetId] = null;
  }

  function canRenderInto(target) {
    if (!target) return false;
    if (!target.isConnected) return false;
    var rect = target.getBoundingClientRect ? target.getBoundingClientRect() : null;
    var width = Number((rect && rect.width) || target.clientWidth || target.offsetWidth || 0);
    var height = Number((rect && rect.height) || target.clientHeight || target.offsetHeight || 0);
    if (!Number.isFinite(width) || !Number.isFinite(height)) return false;
    if (width <= 0 || height <= 0) return false;
    if (target.offsetParent === null) return false;
    return true;
  }

  function toNumericSeries(values) {
    if (!Array.isArray(values)) return [];
    return values
      .map(function (value) {
        var n = Number(value);
        return Number.isFinite(n) ? n : 0;
      })
      .filter(function (n) {
        return Number.isFinite(n);
      });
  }

  function parseJsonValue(id, fallback) {
    var node = document.getElementById(id);
    if (!node || !node.value) return fallback;
    try {
      return JSON.parse(node.value);
    } catch (e) {
      return fallback;
    }
  }

  function parseNumberValue(id, fallback) {
    var node = document.getElementById(id);
    if (!node || node.value === undefined || node.value === null) return fallback;
    var n = Number(node.value);
    return Number.isFinite(n) ? n : fallback;
  }

  function radialCommonOption(value, color) {
    return {
      series: [value],
      chart: {
        height: 90,
        type: "radialBar",
      },
      plotOptions: {
        radialBar: {
          hollow: {
            size: "35%",
          },
          track: {
            background: "var(--theme-default)",
            opacity: 0.2,
          },
          dataLabels: {
            value: {
              color: "var(--tag-text-color--edit)",
              fontSize: "10px",
              show: true,
              offsetY: -12,
            },
          },
        },
      },
      colors: [color],
      stroke: {
        lineCap: "round",
      },
    };
  }

  function renderRadial(targetId, valueId, color) {
    var target = document.querySelector(targetId);
    if (!target || !window.ApexCharts || !canRenderInto(target)) return;
    destroyChart(targetId);
    target.innerHTML = "";
    var value = parseNumberValue(valueId, 0);
    var safeValue = Number.isFinite(value) ? value : 0;
    var chart = new ApexCharts(target, radialCommonOption(safeValue, color));
    chart.render();
    window.__nexorDashboardCharts[targetId] = chart;
  }

  function donutOptions(labels, series, totalLabel) {
    return {
      labels: labels,
      series: series,
      chart: {
        type: "donut",
        height: 200,
      },
      dataLabels: {
        enabled: false,
      },
      legend: {
        show: false,
      },
      stroke: {
        width: 6,
      },
      plotOptions: {
        pie: {
          expandOnClick: false,
          donut: {
            size: "83%",
            labels: {
              show: true,
              name: {
                offsetY: 4,
              },
              total: {
                show: true,
                fontSize: "20px",
                fontFamily: "Outfit', sans-serif",
                fontWeight: 600,
                label: totalLabel,
                formatter: function () {
                  return totalLabel === "8" ? "Total SV" : "Total Leads";
                },
              },
            },
          },
        },
      },
      states: {
        normal: { filter: { type: "none" } },
        hover: { filter: { type: "none" } },
        active: {
          allowMultipleDataPointsSelection: false,
          filter: { type: "none" },
        },
      },
      colors: ["#48A3D7", "#D77748", "#C95E9E", "#7A70BA"],
    };
  }

  function renderDonut(targetId, labelsId, seriesId, totalId) {
    var target = document.querySelector(targetId);
    if (!target || !window.ApexCharts || !canRenderInto(target)) return;
    destroyChart(targetId);
    target.innerHTML = "";
    var labels = parseJsonValue(labelsId, []);
    var series = toNumericSeries(parseJsonValue(seriesId, []));
    var totalLabel = String(parseNumberValue(totalId, 0));
    if (!labels.length || !series.length) return;
    var chart = new ApexCharts(target, donutOptions(labels, series, totalLabel));
    chart.render();
    window.__nexorDashboardCharts[targetId] = chart;
  }

  var cfg = window.NexorcrmAdminConfig || {};
  var primary = cfg.primary || "#7A70BA";
  var secondary = cfg.secondary || "#48A3D7";

  function renderAll() {
    renderRadial("#widgetsChart1", "websvcnt", primary);
    renderRadial("#widgetsChart2", "socialsvcnt", secondary);
    renderRadial("#widgetsChart3", "digsvcnt", "#D77748");

    renderDonut("#lead-insight", "leadInsightLabels", "leadInsightSeries", "leadInsightTotal");
    renderDonut("#sitevisit-insight", "siteInsightLabels", "siteInsightSeries", "siteInsightTotal");
  }

  renderAll();
  window.setTimeout(renderAll, 120);
}

function destroyNexorDashboardCharts() {
  if (!window.__nexorDashboardCharts) return;
  Object.keys(window.__nexorDashboardCharts).forEach(function (key) {
    var chart = window.__nexorDashboardCharts[key];
    if (chart && typeof chart.destroy === "function") {
      try {
        chart.destroy();
      } catch (e) {
        // Ignore stale chart teardown failures.
      }
    }
    window.__nexorDashboardCharts[key] = null;
  });
}

window.__nexorDashboardInit = initNexorDashboardCharts;
window.__nexorDashboardDestroy = destroyNexorDashboardCharts;
