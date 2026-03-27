(function () {
  // lead start
 
  // $("#createleadsf").submit(function (e) {
  //   $("#lead_submit").attr("disabled", "disabled");
  //   // alert("1");
  //   // validate input fields
  //   e.preventDefault();
  //   var haveErrors = false;
  //   var leadurl = "includes/adminprocess.php";

  //   // send ajax call

  //   // serialize all input fields
  //   var disabled = $(this).find(":input:disabled").removeAttr("disabled");
  //   var serialized = $(this).serialize();
  //   disabled.attr("disabled", "disabled");

  //   // disable submit button
  //   // $('#enq_submit_submit input').attr('disabled', 'disabled');

  //   $.ajax({
  //     type: "POST",
  //     // dataType: 'json',
  //     url: leadurl,
  //     data: serialized,
  //   }).done(function (data) {
  //     console.log(data);
  //     location.reload();
  //   });

  //   // window.location.href = 'leads.php';

  //   return false;
  // });

  $(".lead-confirmation").on("click", function () {
    var enquiry_id = $(this).data("log_id");
    var enquiry_name = $(this).data("name");
    var enquiry_mobile = $(this).data("mobile");
    return confirm(
      "Are you sure you wish to delete this  [ " +
        enquiry_name +
        "-" +
        enquiry_mobile +
        " ] Leads? It will remove leads from the list."
    );
  });

  // lead end

  // <!-- editrrq start -->

$(document).on("click", ".open_modal", function () {
    var rrq_id = $(this).data("logid");
    // alert(rrq_id);
    $("#modal-editrrq").load("editrrq.php?log_id=" + rrq_id);
  });

  $(".confirmation").on("click", function () {
    var rrq_id = $(this).data("logid");
    var rrq_name = $(this).data("name");
    var project = $(this).data("id");
    return confirm(
      "Are you sure you wish to delete this [ " +
        rrq_id +
        "-" +
        project +
        " ] RRQ? It will remove all users from the RRQ."
    );
  });
  
  // <!-- editrrq end-->

  // <!-- project status start -->

  $(".prj-status-confirmation").on("click", function () {
    var status_id = $(this).data("logid");
    var project_status = $(this).data("status");
    var status = $(this).data("id");
    return confirm(
      "Are you sure you wish to delete this [ " +
        status_id +
        "-" +
        project_status +
        " ] project Status? It will remove Project Status from the list."
    );
  });
  $(document).on("click", ".modal-prjstatus", function () {
    var status_id = $(this).data("logid");
    // alert($(this).data("logid"));
    $("#modal-prj-status").load("editprojectstatus.php?log_id=" + status_id);
  });

  // <!-- project status end -->

  // <!-- project Type start -->

  $(".prj-type-confirmation").on("click", function () {
    var type_id = $(this).data("logid");
    var project_type = $(this).data("type");
    var type = $(this).data("id");

    return confirm(
      "Are you sure you wish to delete this [ " +
        type_id +
        "-" +
        project_type +
        " ] project? It will remove project from the list."
    );
  });

  $(document).on("click", ".modal-prjtype", function () {
    var type_id = $(this).data("logid");
    $("#modal-prj-type").load("editprojecttype.php?log_id=" + type_id);
  });

  // <!-- project Type end -->

  // <!--  Modal editgroup start -->

  $(".confirmg").on("click", function () {
    return confirm(
      "Are you sure you wish to delete this group? It will remove all users from the group."
    );
  });

  $(document).on("click", ".modal-editGroups", function () {
    var group_id = $(this).data("logid");
    $("#modal-editgroup").load("editgroup.php?log_id=" + group_id);
  });

  // <!--  Modal editgroup end -->
  // primary-source modal start
  $(".primary-confirmation").on("click", function () {
    var primary_id = $(this).data("logid");
    var primary_source = $(this).data("status");
    var status = $(this).data("id");

    return confirm(
      "Are you sure you wish to delete this [ " +
        primary_id +
        "-" +
        primary_source +
        " ] Primary Source? It will remove Primary Source from the list."
    );
  });
  $(document).on("click", ".open-primary", function () {
    var primary_id = $(this).data("logid");
    $("#modal-primary").load("editprimarysource.php?log_id=" + primary_id);
  });
  // primary-source modal end

  //   secondary-source Start
  $(".secondary-confirmation").on("click", function () {
    var secondary_id = $(this).data("logid");
    var secondary_source = $(this).data("status");
    var status = $(this).data("id");

    return confirm(
      "Are you sure you wish to delete this [ " +
        secondary_id +
        "-" +
        secondary_source +
        " ] Secondary Source? It will remove Secondary Source from the list."
    );
  });
  $(document).on("click", ".open-secondary", function () {
    var secondary_id = $(this).data("logid");
    $("#modal-secondary").load(
      "editsecondarysource.php?log_id=" + secondary_id
    );
  });
  // secondary source end
  // tertiary source start
  $(".tertiary-confirmation").on("click", function () {
    var tertiary_id = $(this).data("logid");
    var tertiary_source = $(this).data("status");
    var status = $(this).data("id");

    return confirm(
      "Are you sure you wish to delete this [ " +
        tertiary_id +
        "-" +
        tertiary_source +
        " ] Tertiary Source? It will remove Tertiary Source from the list."
    );
  });
  $(document).on("click", ".open-tertiary", function () {
    var tertiary_id = $(this).data("logid");
    $("#modal-tertiary").load("edittertiarysource.php?log_id=" + tertiary_id);
  });
  // tertiary source end
  // lead status start
  $(".leadstatus-confirm").on("click", function () {
    var status_id = $(this).data("logid");
    var lead_status = $(this).data("status");
    var status = $(this).data("id");

    return confirm(
      "Are you sure you wish to delete this [ " +
        status_id +
        "-" +
        lead_status +
        " ] Lead Status? It will remove Lead Status from the list."
    );
  });
  $(document).on("click", ".open-leadstatus", function () {
    var status_id = $(this).data("logid");
    $("#modal-leadstatus").load("editleadstatus.php?log_id=" + status_id);
  });
  // lead status end

  //   lead tyep Start
  $(".leadtype-confirmation").on("click", function () {
    var type_id = $(this).data("logid");
    var lead_type = $(this).data("status");
    var status = $(this).data("id");

    return confirm(
      "Are you sure you wish to delete this [ " +
        type_id +
        "-" +
        lead_type +
        " ] Lead Type? It will remove Lead Type from the list."
    );
  });
  $(document).on("click", ".open-leadtype", function () {
    var type_id = $(this).data("logid");
    $("#modal-leadtype").load("editleadtype.php?log_id=" + type_id);
  });
  // lead type end
})();
