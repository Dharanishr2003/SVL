(function ($) {
  "use strict";
  $(document).ready(function () {
    $("#auto-fill").DataTable({
      autoFill: true,
    });
    $("#keytable").DataTable({
      keys: true,
      autoFill: true,
    });
    $("#column-selector").DataTable({
      columnDefs: [
        {
          orderable: false,
          className: "select-checkbox",
          targets: 0,
        },
      ],
      select: {
        style: "os",
        selector: "td:first-child",
      },
      order: [[1, "asc"]],
      autoFill: {
        columns: ":not(:first-child)",
      },
    });
    var table = $("#scrolling-datatable").dataTable({
      scrollY: 400,
      scrollX: true,
      scrollCollapse: true,
      paging: false,
      autoFill: true,
    });
    var table = $("#basic-row-reorder").DataTable({
      rowReorder: true,
    });
    //full row selection
    var table = $("#full-row").DataTable({
      rowReorder: {
        selector: "tr",
      },
      columnDefs: [{ targets: 0, visible: false }],
    });
    // Restricted column ordering
    var table = $("#rest-column").DataTable({
      rowReorder: true,
      columnDefs: [
        { orderable: true, className: "reorder", targets: 0 },
        { orderable: false, targets: "_all" },
      ],
    });

    var table = $("#export-button").DataTable({
      dom: "Bfrtip",
      buttons: ["excelHtml5", "csvHtml5", "pdfHtml5"],
      pageLength: 15,
      order: [],
      columnDefs: [
        { width: "15px", targets: 0 },
        { orderable: false, targets: 0 }
      ]
    });

    // Show/hide delete button based on checkbox selection
    function toggleDeleteButton() {
      if ($(".row-check:checked").length > 0) {
        $("#delete-selected").fadeIn();
      } else {
        $("#delete-selected").fadeOut();
      }
    }

    // When a row checkbox is clicked
    $(document).on("change", ".row-check", function () {
      toggleDeleteButton();
    });

    // Optional: Select all checkbox
    $("#select-all").change(function () {
      $(".row-check").prop('checked', $(this).prop('checked'));
      toggleDeleteButton();
    });

    // Delete selected rows (your existing code)
    $("#delete-selected").click(function () {
      let ids = [];
      $(".row-check:checked").each(function () {
        ids.push($(this).val());
      });

      if (ids.length === 0) {
        alert("Please select at least one row.");
        return;
      }

      if (!confirm("Are you sure you want to delete selected records?")) {
        return;
      }

      $.ajax({
        url: "checkbox-lead-delete.php",
        type: "GET",
        data: { ids: ids },
        success: function (response) {
          alert("Deleted Successfully!");
          location.reload();
        }
      });
    });




    // $("#export-button").DataTable({
    //   dom: "Bfrtip",
    //   buttons: ["copyHtml5", "excelHtml5", "csvHtml5", "pdfHtml5"],

    //   pageLength: 50,
    //   order: [],
    //   columnDefs: [
    //     {
    //       width: "15px",
    //       targets: 0,
    //     },
    //     {
    //       orderable: false,
    //       targets: 0,
    //     },
    //   ],
    // });
    $("#rexport-button").DataTable({
      dom: "Bfrtip",
      buttons: ["copyHtml5", "excelHtml5", "csvHtml5", "pdfHtml5"],
      pageLength: 50,
      order: [],
      columnDefs: [
        {
          width: "15px",
          targets: 0,
        },
        {
          orderable: false,
          targets: 0,
        },
      ],
    });
    $("#fexport-button").DataTable({
      dom: "Bfrtip",
      buttons: ["copyHtml5", "excelHtml5", "csvHtml5", "pdfHtml5"],
      pageLength: 50,
      order: [],
      columnDefs: [
        {
          width: "15px",
          targets: 0,
        },
        {
          orderable: false,
          targets: 0,
        },
      ],
    });
    $("#column-selector").DataTable({
      dom: "Bfrtip",
      buttons: [
        {
          extend: "copyHtml5",
          exportOptions: {
            columns: [0, ":visible"],
          },
        },
        {
          extend: "excelHtml5",
          exportOptions: {
            columns: ":visible",
          },
        },
        {
          extend: "pdfHtml5",
          exportOptions: {
            columns: [0, 1, 2, 5],
          },
        },
        "colvis",
      ],
    });
    $("#excel-cust-bolder").DataTable({
      dom: "Bfrtip",
      buttons: [
        {
          extend: "excelHtml5",
          customize: function (xlsx) {
            var sheet = xlsx.xl.worksheets["sheet1.xml"];

            // jQuery selector to add a border
            $('row c[r*="10"]', sheet).attr("s", "25");
          },
        },
      ],
    });
    $("#cust-json").DataTable({
      dom: "Bfrtip",
      buttons: [
        {
          text: "JSON",
          action: function (e, dt, button, config) {
            var data = dt.buttons.exportData();

            $.fn.dataTable.fileSave(
              new Blob([JSON.stringify(data)]),
              "Export.json"
            );
          },
        },
      ],
    });
    $("#basic-key-table").DataTable({
      keys: true,
    });
    var table = $("#scrolling").DataTable({
      scrollY: 300,
      paging: false,
      keys: true,
    });
    $("#focus-cell").DataTable({
      keys: true,
    });
    $("#basic-scroller").DataTable({
      ajax: "core-assets/json/datatable-extension/data.txt",
      deferRender: true,
      scrollY: 200,
      scrollCollapse: true,
      scroller: true,
    });
    $("#state-saving").DataTable({
      ajax: "core-assets/json/datatable-extension/data.txt",
      deferRender: true,
      scrollY: 200,
      scrollCollapse: true,
      scroller: true,
      stateSave: true,
    });
    $("#api").DataTable({
      ajax: "core-assets/json/datatable-extension/data.txt",
      deferRender: true,
      scrollY: 200,
      scrollCollapse: true,
      scroller: true,
      initComplete: function () {
        this.api().row(1000).scrollTo();
      },
    });
    $("#responsive").DataTable({
      responsive: true,
    });
    var table = $("#new-cons").DataTable();
    // new $.fn.dataTable.Responsive( table );
    $("#show-hidden-row").DataTable({
      responsive: {
        details: {
          display: $.fn.dataTable.Responsive.display.childRowImmediate,
          type: "",
        },
      },
    });
    $("#basic-colreorder").DataTable({
      colReorder: true,
    });
    $("#state-saving").dataTable({
      colReorder: true,
      stateSave: true,
    });
    $("#real-time").dataTable({
      colReorder: {
        realtime: false,
      },
    });
    $("#custom-button").DataTable({
      dom: "Bfrtip",
      buttons: [
        {
          text: "Add to cart",
          action: function (e, dt, node, config) {
            alert("Button activated");
          },
        },
      ],
    });
    $("#class-button").DataTable({
      dom: "Bfrtip",
      buttons: [
        {
          text: "Secondary",
          className: "btn-secondary",
        },
        {
          text: "Success",
          className: "btn-success",
        },
        {
          text: "Danger",
          className: "btn-danger",
        },
      ],
    });
    $("#keyboard-btn").DataTable({
      dom: "Bfrtip",
      buttons: [
        {
          text: "Button <u>1</u>",
          key: "1",
          action: function (e, dt, node, config) {
            alert("Button 1 activated");
          },
        },
        {
          text: "Button <u><i>shift</i> 2</u>",
          key: {
            shiftKey: true,
            key: "2",
          },
          action: function (e, dt, node, config) {
            alert("Button 2 activated");
          },
        },
      ],
    });
    $("#multilevel-btn").DataTable({
      dom: "Bfrtip",
      buttons: [
        {
          extend: "collection",
          text: "Table control",
          buttons: [
            {
              text: "Toggle start date",
              action: function (e, dt, node, config) {
                dt.column(-2).visible(!dt.column(-2).visible());
              },
            },
            {
              text: "Toggle salary",
              action: function (e, dt, node, config) {
                dt.column(-1).visible(!dt.column(-1).visible());
              },
            },
            "colvis",
          ],
        },
      ],
    });
    $("#pagelength-btn").DataTable({
      dom: "Bfrtip",
      lengthMenu: [
        [10, 25, 50, -1],
        ["10 rows", "25 rows", "50 rows", "Show all"],
      ],
      buttons: ["pageLength"],
    });
    $("#basic-fixed-header").DataTable({
      fixedHeader: true,
    });
    var table = $("#fixed-header-footer").DataTable({
      fixedHeader: {
        header: true,
        footer: true,
      },
    });
  });
})(jQuery);
