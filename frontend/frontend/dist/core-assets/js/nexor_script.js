(function () {
  //  ======== table chart
  // radial chart js

  var websvcnt = document.getElementById("websvcnt").value;
  var socialsvcnt = document.getElementById("socialsvcnt").value;
  var digsvcnt = document.getElementById("digsvcnt").value;

  function radialCommonOption(data) {
    return {
      series: data.radialYseries,
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
      colors: [data.color],

      stroke: {
        lineCap: "round",
      },
    };
  }

  const radial1 = {
    radialYseries: [websvcnt],
    color: NexorcrmAdminConfig.primary,
  };

  const radialchart1 = document.querySelector("#widgetsChart1");
  if (radialchart1) {
    var radialprogessChart1 = new ApexCharts(
      radialchart1,
      radialCommonOption(radial1)
    );
    radialprogessChart1.render();
  }
  // radial 2
  const radial2 = {
    radialYseries: [socialsvcnt],
    color: NexorcrmAdminConfig.secondary,
  };
  const radialchart2 = document.querySelector("#widgetsChart2");
  if (radialchart2) {
    var radialprogessChart2 = new ApexCharts(
      radialchart2,
      radialCommonOption(radial2)
    );
    radialprogessChart2.render();
  }
  // radial 3
  const radial3 = {
    radialYseries: [digsvcnt],
    color: "#D77748",
  };
  const radialchart3 = document.querySelector("#widgetsChart3");
  if (radialchart3) {
    var radialprogessChart3 = new ApexCharts(
      radialchart3,
      radialCommonOption(radial3)
    );
    radialprogessChart3.render();
  }
  // // radial 4
  // const radial4 = {
  //   radialYseries: [86],
  //   color: "#C95E9E",
  // };
  // const radialchart4 = document.querySelector("#widgetsChart4");
  // if (radialchart4) {
  //   var radialprogessChart4 = new ApexCharts(
  //     radialchart4,
  //     radialCommonOption(radial4)
  //   );
  //   radialprogessChart4.render();
  // }
  // lead insight graph starts

  // ----------Shifts Overview-----//

  //     var url = 'https://re.nexorcrm.com/datains.php';

  //     var respd;

  // $.get(url, function(response) {

  //  respd = response;

  // });

  jQuery.extend({
    getValues: function (url) {
      var result = null;
      $.ajax({
        url: url,
        type: "get",
        async: false,
        success: function (data) {
          result = data;
        },
      });
      return result;
    },
  });
  //   var results = $.getValues("https://re.nexorcrm.com/datains.php");

  //   console.log(results.labels);
  var objv = JSON.parse($.getValues("https://re.nexorcrm.com/datains.php"));

  console.log(objv.labels);

  // console.log(respd);
  // var response = $.ajax({
  //     type: "GET",
  //     url: "https://re.nexorcrm.com/datains.php",
  //     async: false,
  //     success : function(data) {
  //         //alert (data);

  //         //var
  //     }
  // });

  var caldv = JSON.parse(objv.series);

  var labels = JSON.parse(objv.labels);

  var totlead = JSON.parse(objv.tleads);

  var option = {
    labels: labels,
    series: caldv,
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
              label: totlead,
              formatter: () => "Total Leads",
            },
          },
        },
      },
    },
    states: {
      normal: {
        filter: {
          type: "none",
        },
      },
      hover: {
        filter: {
          type: "none",
        },
      },
      active: {
        allowMultipleDataPointsSelection: false,
        filter: {
          type: "none",
        },
      },
    },
    colors: ["#48A3D7", "#D77748", "#C95E9E", "#7A70BA"],
  };

  var chart = new ApexCharts(document.querySelector("#lead-insight"), option);

  chart.render();

  // lead insight graph ends

  // Sitevisit insight graph starts---------------------------------------------------------

  jQuery.extend({
    getValues: function (url) {
      var result = null;
      $.ajax({
        url: url,
        type: "get",
        async: false,
        success: function (data) {
          result = data;
        },
      });
      return result;
    },
  });
  //   var results = $.getValues("https://re.nexorcrm.com/datains.php");

  //   console.log(results.labels);
  var objv = JSON.parse($.getValues("https://re.nexorcrm.com/data-sv-ins.php"));

  console.log(objv.labels);

  var caldv = JSON.parse(objv.series);

  var labels = JSON.parse(objv.labels);

  var totlead = JSON.parse(objv.tleads);

  var option = {
    labels: labels,
    series: caldv,
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
              label: totlead,
              formatter: () => "Total SV",
            },
          },
        },
      },
    },
    states: {
      normal: {
        filter: {
          type: "none",
        },
      },
      hover: {
        filter: {
          type: "none",
        },
      },
      active: {
        allowMultipleDataPointsSelection: false,
        filter: {
          type: "none",
        },
      },
    },
    colors: ["#48A3D7", "#D77748", "#C95E9E", "#7A70BA"],
  };

  var chart = new ApexCharts(
    document.querySelector("#sitevisit-insight"),
    option
  );

  chart.render();

  // site visit graph ends
})();
