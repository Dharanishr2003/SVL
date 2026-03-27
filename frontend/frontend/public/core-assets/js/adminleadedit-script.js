$(document).ready(function () {
  //   Lead Owner Change Option Starts

  $("#lead_owner").on("keyup input", function () {
    /* Get input value on change */
    var inputVal = $(this).val();

    // alert(inputVal);
    var resultDropdown = $(".lown_result");
    if (inputVal.length) {
      $.get("backend-search.php", {
        lown: inputVal,
      }).done(function (data) {
        // Display the returned data in browser
        resultDropdown.html(data);

        // alert(data);
      });
    } else {
      resultDropdown.empty();
    }
  });
  $(document).on("click", ".lown_result p", function () {
    $("#lead_owner").val($(this).text());
    $(this).parent(".lown_result").empty();
    //alert($(this).data("log"));
    $("#ownr_id").val($(this).data("log"));
  });

  $("#cp_name").on("keyup input", function () {
    /* Get input value on change */
    var inputVal = $(this).val();

    // alert(inputVal);
    var resultDropdown = $(".cp_result");
    if (inputVal.length) {
      $.get("cp-search.php", {
        term: inputVal,
      }).done(function (data) {
        // Display the returned data in browser
        resultDropdown.html(data);

        // alert(data);
      });
    } else {
      resultDropdown.empty();
    }
  });

  // Set search input value on click of result item
  $(document).on("click", ".cp_result p", function () {
    $("#cp_name").val($(this).text());
    $(this).parent(".cp_result").empty();
    //alert($(this).data("log"));
    $("#cp_id").val($(this).data("log"));
  });

  //   Lead Ownersvs Change Option Starts

  $("#lead_ownersvs").on("keyup input", function () {
    /* Get input value on change */
    var inputVal = $(this).val();

    // alert(inputVal);
    var resultDropdown = $(".lown_result");
    if (inputVal.length) {
      $.get("backend-search.php", {
        lown: inputVal,
      }).done(function (data) {
        // Display the returned data in browser
        resultDropdown.html(data);

        // alert(data);
      });
    } else {
      resultDropdown.empty();
    }
  });
  // Set search input value on click of result item
  $(document).on("click", ".lown_result p", function () {
    $("#lead_ownersvs").val($(this).text());
    $(this).parent(".lown_result").empty();
    //alert($(this).data("log"));
    $("#sv_ownr_id").val($(this).data("log"));
  });

  //   Lead Owner Change Option Ends

  //hides dropdown content
  // $(".size_chart").hide();

  //unhides first option content
  // $("#option1").show();

  //listen to dropdown for change

  $("#editleads_res").on("hidden.bs.modal", function () {
    //window.alert('hidden event fired!');

    var rers = $("#reject_reasonm").val();

    // if (rers == "") {
    // alert("Reject Reason Cannot Be Empty");
    location.reload();
    // } else {
    // alert("hooray - reject reason is valid - ");
    // }
  });

  $("#enquiry_status").change(function () {
    //rehide content on change
    // $('.size_chart').hide();
    //unhides current item

    var enqsts = $(this).val();

    if (enqsts == "Site Visit") {
      $("#editleads_sv").modal("show");
      $("#editleads_sv").on("hidden.bs.modal", function (e) {
        if (!$(e.target).hasClass("modal-dialog")) {
          location.reload();
        }
      });
    } else if (enqsts == "Rejected") {
      $("#editleads_res").modal("show");
      $("#editleads_res").on("hidden.bs.modal", function (e) {
        if (!$(e.target).hasClass("modal-dialog")) {
          location.reload();
        }
      });
    } else if (enqsts == "Attempted") {
      $("#editleads_att").modal("show");
      $("#editleads_att").on("hidden.bs.modal", function (e) {
        if (!$(e.target).hasClass("modal-dialog")) {
          location.reload();
        }
      });
    }   else if (enqsts == "Interested") {
      $("#editleads_int").modal("show");
      $("#editleads_int").on("hidden.bs.modal", function (e) {
        if (!$(e.target).hasClass("modal-dialog")) {
          location.reload();
        }
      });
    }

    //alert(enqsts);
    // $('#' + $(this).val()).show();
  });

  $("#sv_status").change(function () {
    //rehide content on change
    // $('.size_chart').hide();
    //unhides current item

    var svsts = $(this).val();

    if (svsts == "Re Scheduled Visit") {
      $("#editleads_rssv").modal("show");
      $("#editleads_rssv").on("hidden.bs.modal", function (e) {
        if (!$(e.target).hasClass("modal-dialog")) {
          location.reload();
        }
      });
    } else if (svsts == "Site Visit Confirmed") {
      $("#editleads_svs").modal("show");
      $("#editleads_svs").on("hidden.bs.modal", function (e) {
        if (!$(e.target).hasClass("modal-dialog")) {
          location.reload();
        }
      });
    } else if (svsts == "Site Visit Done") {
      $("#editleads_svd").modal("show");
      $("#editleads_svd").on("hidden.bs.modal", function (e) {
        if (!$(e.target).hasClass("modal-dialog")) {
          location.reload();
        }
      });
    } else if (svsts == "Opportunity") {
      $("#editleads_opp").modal("show");
      $("#editleads_opp").on("hidden.bs.modal", function (e) {
        if (!$(e.target).hasClass("modal-dialog")) {
          location.reload();
        }
      });
    }
  else if (svsts == "Rejected SiteVisit") {
    //  alert(svsts);
     $("#rasv").val(svsts);
    $("#editleads_res").modal("show");
      $("#editleads_res").on("hidden.bs.modal", function (e) {
        if (!$(e.target).hasClass("modal-dialog")) {
          location.reload();
        }
    });
  }

    //alert(enqsts);
    // $('#' + $(this).val()).show();
  });

  // $("#cl_status").change(function () {
  //   //rehide content on change
  //   // $('.size_chart').hide();
  //   //unhides current item

  //   var call_statusval = $(this).val();

  //   if (call_statusval == "Call Connected") {
  //     $("#cls_fup").show();
  //     $("#cls_fup").val("");
  //     $("#cls_fup").prop("required", true);
  //   } else {
  //     $("#cls_fup").hide();
  //     $("#cls_fup").val("");
  //     $("#cls_fup").prop("required", false);
  //   }
  //   // alert(call_statusval);
  //   // $('#' + $(this).val()).show();
  // });

  $("#booking_status").change(function () {
    //rehide content on change
    // $('.size_chart').hide();
    //unhides current item

    var booking_statusval = $(this).val();

    if (booking_statusval == "Booking Done") {
      $("#booking").show();
      $("#b_date").val("");
    } else {
      $("#booking").hide();
      $("#b_date").val("");
    }

    //alert(enqsts);
    // $('#' + $(this).val()).show();
  });

  //   ------------------sv-------------------------------------------------------------------------------

 
  // lead script start-----------------------------------------------------------------------------------------------------

  var enqid = $("#leadtoedit").val();
  var a_user = $("#a_user").val();

  // enquiry name edit values

  $("#en_edit").on("click", function () {
    $("#enquiry_name").children("[readonly]").toggle();
    $("#enquiry_name").removeAttr("readonly");
    $("#enquiry_name").focus();

    $("#en_edit").hide();
    $("#en_save").show();
  });

  $("#en_save").on("click", function () {
    // $('#enquiry_name').attr('readonly', 'readonly');

    var enqname = $("#enquiry_name").val();

    // alert("enqname" + enqname + "leadid" + enqid + "user" + a_user);

    if (enqname != "<?php echo $name; ?>") {
      $.ajax({
        type: "POST",
        url: "includes/lead_update.php",
        data: {
          enq_name: enqname,
          enqid: enqid,
          a_user: a_user,
        },
        cache: false,
        success: function (data) {
          //console.log(data);
          //   alert(data);

          location.reload();
        },
        error: function (xhr, status, error) {
          console.error(xhr);
        },
      });
    } else {
      location.reload();
    }

    // $('#en_save').hide();
  });

  //////////////////////Lead Owner Start//////////////////////////////

  $("#elo_edit").on("click", function () {
    $("#lead_owner").children("[readonly]").toggle();
    $("#lead_owner").removeAttr("readonly");
    $("#lead_owner").focus();

    $("#elo_edit").hide();
    $("#elo_save").show();
  });

  $("#elo_save").on("click", function () {
    // $('#leadowner').attr('readonly', 'readonly');

    var lead_owner = $("#ownr_id").val();

    // alert("lead_owner" + lead_owner + "leadid" + enqid + "user" + a_user);

    if (lead_owner != "<?php echo $leadownr; ?>") {
      $.ajax({
        type: "POST",
        url: "includes/lead_update.php",
        data: {
          lead_owner: lead_owner,
          enqid: enqid,
          a_user: a_user,
        },
        cache: false,
        success: function (data) {
          //console.log(data);
          // alert(data);

          location.reload();
        },
        error: function (xhr, status, error) {
          console.error(xhr);
        },
      });
    } else {
      location.reload();
    }
  });
  // ///////////////////Lead Owner end/////////////////////////

  //////////////////////Lead Owner SVS Start//////////////////////////////

  $("#elsvs_edit").on("click", function () {
    $("#lead_ownersvs").children("[readonly]").toggle();
    $("#lead_ownersvs").removeAttr("readonly");
    $("#lead_ownersv").focus();

    $("#elsvs_edit").hide();
    $("#elsvs_save").show();
  });

  $("#elsvs_save").on("click", function () {
    // $('#leadowner').attr('readonly', 'readonly');

    var lead_ownersvs = $("#ownr_id").val();

    // alert("lead_owner" + lead_owner + "leadid" + enqid + "user" + a_user);

    if (lead_ownersvs != "<?php echo $leadownr; ?>") {
      $.ajax({
        type: "POST",
        url: "includes/lead_update.php",
        data: {
          lead_owner: lead_ownersvs,
          enqid: enqid,
          a_user: a_user,
        },
        cache: false,
        success: function (data) {
          //console.log(data);
          // alert(data);

          location.reload();
        },
        error: function (xhr, status, error) {
          console.error(xhr);
        },
      });
    } else {
      location.reload();
    }
  });
  // ///////////////////Lead Owner SVS end/////////////////////////

  //////////////////////Mobile Number Start//////////////////////////////

  $("#em_edit").on("click", function () {
    $("#enquiry_mobile").children("[readonly]").toggle();
    $("#enquiry_mobile").removeAttr("readonly");
    $("#enquiry_mobile").focus();

    $("#em_edit").hide();
    $("#em_save").show();
  });

  $("#em_save").on("click", function () {
    // $('#enquiry_mobile').attr('readonly', 'readonly');

    var enqmobile = $("#enquiry_mobile").val();

    // alert("enqmobile" + enqmobile + "leadid" + enqid + "user" + a_user);

    if (enqmobile != "<?php echo $mobile; ?>") {
      $.ajax({
        type: "POST",
        url: "includes/lead_update.php",
        data: {
          enq_mobile: enqmobile,
          enqid: enqid,
          a_user: a_user,
        },
        cache: false,
        success: function (data) {
          //console.log(data);
          // alert(data);

          location.reload();
        },
        error: function (xhr, status, error) {
          console.error(xhr);
        },
      });
    } else {
      location.reload();
    }

    // $('#em_save').hide();
  });
  //////////////////////Mobile Number End//////////////////////////////

  //////////////////////Email Start//////////////////////////////
  $("#eem_edit").on("click", function () {
    $("#enquiry_email").children("[readonly]").toggle();
    $("#enquiry_email").removeAttr("readonly");
    $("#enquiry_email").focus();

    $("#eem_edit").hide();
    $("#eem_save").show();
  });

  $("#eem_save").on("click", function () {
    // $('#enquiry_email').attr('readonly', 'readonly');

    var enq_email = $("#enquiry_email").val();

    // alert("enq_email" + enq_email + "leadid" + enqid + "user" + a_user);

    if (enq_email != "<?php echo $email; ?>") {
      $.ajax({
        type: "POST",
        url: "includes/lead_update.php",
        data: {
          enquiry_email: enq_email,
          enqid: enqid,
          a_user: a_user,
        },
        cache: false,
        success: function (data) {
          //console.log(data);
          // alert(data);

          location.reload();
        },
        error: function (xhr, status, error) {
          console.error(xhr);
        },
      });
    } else {
      location.reload();
    }

    // $('#eem_save').hide();
  });

  //////////////////////Email End//////////////////////////////

  //////////////////////Alternate Mobile No Start//////////////////////////////

  $("#eam_edit").on("click", function () {
    $("#alter_mobile").children("[readonly]").toggle();
    $("#alter_mobile").removeAttr("readonly");
    $("#alter_mobile").focus();

    $("#eam_edit").hide();
    $("#eam_save").show();
  });

  $("#eam_save").on("click", function () {
    // $('#alter_mobile').attr('readonly', 'readonly');

    var enqalter_mobile = $("#alter_mobile").val();

    // alert("enqalter_mobile" + enqalter_mobile + "leadid" + enqid + "user" + a_user);

    if (enqalter_mobile != "<?php echo $alter_mobile; ?>") {
      $.ajax({
        type: "POST",
        url: "includes/lead_update.php",
        data: {
          alter_mobile: enqalter_mobile,
          enqid: enqid,
          a_user: a_user,
        },
        cache: false,
        success: function (data) {
          //console.log(data);
          // alert(data);

          location.reload();
        },
        error: function (xhr, status, error) {
          console.error(xhr);
        },
      });
    } else {
      location.reload();
    }

    // $('#eam_save').hide();
  });
  //////////////////////Alternate Mobile No End//////////////////////////////

  //////////////////////Alternate Email Start//////////////////////////////
  $("#eae_edit").on("click", function () {
    $("#alter_email").children("[readonly]").toggle();
    $("#alter_email").removeAttr("readonly");
    $("#alter_email").focus();

    $("#eae_edit").hide();
    $("#eae_save").show();
  });

  $("#eae_save").on("click", function () {
    // $('#alter_email').attr('readonly', 'readonly');

    var enqalter_email = $("#alter_email").val();

    // alert("enqalter_email" + enqalter_email + "leadid" + enqid + "user" + a_user);

    if (enqalter_email != "<?php echo $alter_email; ?>") {
      $.ajax({
        type: "POST",
        url: "includes/lead_update.php",
        data: {
          alter_email: enqalter_email,
          enqid: enqid,
          a_user: a_user,
        },
        cache: false,
        success: function (data) {
          //console.log(data);
          // alert(data);

          location.reload();
        },
        error: function (xhr, status, error) {
          console.error(xhr);
        },
      });
    } else {
      location.reload();
    }

    // $('#eae_save').hide();
  });
  //////////////////////Alternate Email End//////////////////////////////

  //////////////////////Occupation Start//////////////////////////////
  $("#eo_edit").on("click", function () {
    $("#occupation").children("[readonly]").toggle();
    $("#occupation").removeAttr("readonly");
    $("#occupation").focus();

    $("#eo_edit").hide();
    $("#eo_save").show();
  });

  $("#eo_save").on("click", function () {
    // $('#occupation').attr('readonly', 'readonly');

    var enq_occupation = $("#occupation").val();

    // alert("enqoccupation" + enqoccupation + "leadid" + enqid + "user" + a_user);

    if (enq_occupation != "<?php echo $occupation; ?>") {
      $.ajax({
        type: "POST",
        url: "includes/lead_update.php",
        data: {
          occupation: enq_occupation,
          enqid: enqid,
          a_user: a_user,
        },
        cache: false,
        success: function (data) {
          //console.log(data);
          // alert(data);

          location.reload();
        },
        error: function (xhr, status, error) {
          console.error(xhr);
        },
      });
    } else {
      location.reload();
    }
  });
  //////////////////////Occupation End//////////////////////////////

  //////////////////////Company Name Start//////////////////////////////
  $("#ecn_edit").on("click", function () {
    $("#company_name").children("[readonly]").toggle();
    $("#company_name").removeAttr("readonly");
    $("#company_name").focus();

    $("#ecn_edit").hide();
    $("#ecn_save").show();
  });

  $("#ecn_save").on("click", function () {
    // $('#company_name').attr('readonly', 'readonly');

    var enqc_name = $("#company_name").val();

    // alert("enqcompany_name" + enqcompany_name + "leadid" + enqid + "user" + a_user);

    if (enqc_name != "<?php echo $company_name; ?>") {
      $.ajax({
        type: "POST",
        url: "includes/lead_update.php",
        data: {
          company_name: enqc_name,
          enqid: enqid,
          a_user: a_user,
        },
        cache: false,
        success: function (data) {
          //console.log(data);
          // alert(data);

          location.reload();
        },
        error: function (xhr, status, error) {
          console.error(xhr);
        },
      });
    } else {
      location.reload();
    }
  });
  //////////////////////Company Name End//////////////////////////////

  //////////////////////Allocator Start//////////////////////////////
  $("#ea_edit").on("click", function () {
    $("#allocator").children("[readonly]").toggle();
    $("#allocator").removeAttr("readonly");
    $("#allocator").focus();

    $("#ea_edit").hide();
    $("#ea_save").show();
  });

  $("#ea_save").on("click", function () {
    // $('#allocator').attr('readonly', 'readonly');

    var enq_allocator = $("#allocator").val();

    // alert("enqallocator" + enqallocator + "leadid" + enqid + "user" + a_user);

    if (enq_allocator != "<?php echo $allocator; ?>") {
      $.ajax({
        type: "POST",
        url: "includes/lead_update.php",
        data: {
          allocator: enq_allocator,
          enqid: enqid,
          a_user: a_user,
        },
        cache: false,
        success: function (data) {
          //console.log(data);
          // alert(data);

          location.reload();
        },
        error: function (xhr, status, error) {
          console.error(xhr);
        },
      });
    } else {
      location.reload();
    }
  });
  //////////////////////Allocator End//////////////////////////////

  //////////////////////Allocated Date : Start//////////////////////////////

  $("#ead_edit").on("click", function () {
    $("#allocated_date").children("[readonly]").toggle();
    $("#allocated_date").removeAttr("readonly");
    $("#allocated_date").focus();

    $("#ead_edit").hide();
    $("#ead_save").show();
  });

  $("#ead_save").on("click", function () {
    // $('#allocated_date').attr('readonly', 'readonly');

    var enqallocated_date = $("#allocated_date").val();

    // alert("enqallocated_date" + enqallocated_date + "leadid" + enqid + "user" + a_user);

    if (enqallocated_date != "<?php echo $allocated_date; ?>") {
      $.ajax({
        type: "POST",
        url: "includes/lead_update.php",
        data: {
          allocated_date: enqallocated_date,
          enqid: enqid,
          a_user: a_user,
        },
        cache: false,
        success: function (data) {
          //console.log(data);
          // alert(data);

          location.reload();
        },
        error: function (xhr, status, error) {
          console.error(xhr);
        },
      });
    } else {
      location.reload();
    }
  });
  //////////////////////Allocated Date : End//////////////////////////////

  //////////////////////native_of Start//////////////////////////////
  $("#eno_edit").on("click", function () {
    $("#native_of").children("[readonly]").toggle();
    $("#native_of").removeAttr("readonly");
    $("#native_of").focus();

    $("#eno_edit").hide();
    $("#eno_save").show();
  });

  $("#eno_save").on("click", function () {
    // $('#native_of').attr('readonly', 'readonly');

    var enq_native_of = $("#native_of").val();

    // alert("enqnative_of" + enqnative_of + "leadid" + enqid + "user" + a_user);

    if (enq_native_of != "<?php echo $native_of; ?>") {
      $.ajax({
        type: "POST",
        url: "includes/lead_update.php",
        data: {
          native_of: enq_native_of,
          enqid: enqid,
          a_user: a_user,
        },
        cache: false,
        success: function (data) {
          //console.log(data);
          // alert(data);

          location.reload();
        },
        error: function (xhr, status, error) {
          console.error(xhr);
        },
      });
    } else {
      location.reload();
    }
  });
  //////////////////////native_of End//////////////////////////////

  //////////////////////unreadby_owner Start//////////////////////////////
  $("#eubo_edit").on("click", function () {
    $("#unreadby_owner").children("[readonly]").toggle();
    $("#unreadby_owner").removeAttr("readonly");
    $("#unreadby_owner").focus();

    $("#eubo_edit").hide();
    $("#eubo_save").show();
  });

  $("#eubo_save").on("click", function () {
    // $('#unreadby_owner').attr('readonly', 'readonly');

    var enq_unreadby_owner = $("#unreadby_owner").val();

    // alert("enqunreadby_owner" + enqunreadby_owner + "leadid" + enqid + "user" + a_user);

    if (enq_unreadby_owner != "<?php echo $unreadby_owner; ?>") {
      $.ajax({
        type: "POST",
        url: "includes/lead_update.php",
        data: {
          unreadby_owner: enq_unreadby_owner,
          enqid: enqid,
          a_user: a_user,
        },
        cache: false,
        success: function (data) {
          //console.log(data);
          // alert(data);

          location.reload();
        },
        error: function (xhr, status, error) {
          console.error(xhr);
        },
      });
    } else {
      location.reload();
    }
  });
  //////////////////////unreadby_owner End//////////////////////////////

  //////////////////////reject_reason Start//////////////////////////////

  $("#reject_s").show();
  $("#reject_reason").hide();

  $("#err_edit").on("click", function () {
    $("#reject_s").hide();
    $("#reject_reason").show();
    $("#reject_reason").focus();

    $("#err_edit").hide();
    $("#err_save").show();
  });

  $("#err_save").on("click", function () {
    // $('#reject_reason').attr('readonly', 'readonly');

    var enq_reject_reason = $("#reject_reason").val();

    // alert("enqreject_reason" + enqreject_reason + "leadid" + enqid + "user" + a_user);

    if (enq_reject_reason != "<?php echo $reject_reason; ?>") {
      $.ajax({
        type: "POST",
        url: "includes/lead_update.php",
        data: {
          reject_reason: enq_reject_reason,
          enqid: enqid,
          a_user: a_user,
        },
        cache: false,
        success: function (data) {
          //console.log(data);
          // alert(data);

          location.reload();
        },
        error: function (xhr, status, error) {
          console.error(xhr);
        },
      });
    } else {
      location.reload();
    }
  });
  //////////////////////reject_reason End//////////////////////////////

  //////////////////////rr_subtype Start//////////////////////////////
  $("#errs_edit").on("click", function () {
    $("#rr_subtype").children("[readonly]").toggle();
    $("#rr_subtype").removeAttr("readonly");
    $("#rr_subtype").focus();

    $("#errs_edit").hide();
    $("#errs_save").show();
  });

  $("#errs_save").on("click", function () {
    // $('#rr_subtype').attr('readonly', 'readonly');

    var enq_rr_subtype = $("#rr_subtype").val();

    // alert("enqrr_subtype" + enqrr_subtype + "leadid" + enqid + "user" + a_user);

    if (enq_rr_subtype != "<?php echo $rr_subtype; ?>") {
      $.ajax({
        type: "POST",
        url: "includes/lead_update.php",
        data: {
          rr_subtype: enq_rr_subtype,
          enqid: enqid,
          a_user: a_user,
        },
        cache: false,
        success: function (data) {
          //console.log(data);
          // alert(data);

          location.reload();
        },
        error: function (xhr, status, error) {
          console.error(xhr);
        },
      });
    } else {
      location.reload();
    }
  });
  //////////////////////rr_subtype End//////////////////////////////

  //////////////////////virtual_visit Start//////////////////////////////
  $("#evv_edit").on("click", function () {
    $("#virtual_visit").children("[readonly]").toggle();
    $("#virtual_visit").removeAttr("readonly");
    $("#virtual_visit").focus();

    $("#evv_edit").hide();
    $("#evv_save").show();
  });

  $("#evv_save").on("click", function () {
    // $('#virtual_visit').attr('readonly', 'readonly');

    var enq_virtual_visit = $("#virtual_visit").val();

    // alert("enqvirtual_visit" + enqvirtual_visit + "leadid" + enqid + "user" + a_user);

    if (enq_virtual_visit != "<?php echo $virtual_visit; ?>") {
      $.ajax({
        type: "POST",
        url: "includes/lead_update.php",
        data: {
          virtual_visit: enq_virtual_visit,
          enqid: enqid,
          a_user: a_user,
        },
        cache: false,
        success: function (data) {
          //console.log(data);
          // alert(data);

          location.reload();
        },
        error: function (xhr, status, error) {
          console.error(xhr);
        },
      });
    } else {
      location.reload();
    }
  });
  //////////////////////virtual_visit End//////////////////////////////

  //////////////////////vv_date Start//////////////////////////////
  $("#evvd_edit").on("click", function () {
    $("#vv_date").children("[readonly]").toggle();
    $("#vv_date").removeAttr("readonly");
    $("#vv_date").focus();

    $("#evvd_edit").hide();
    $("#evvd_save").show();
  });

  $("#evvd_save").on("click", function () {
    // $('#vv_date').attr('readonly', 'readonly');

    var enq_vv_date = $("#vv_date").val();

    // alert("enqvv_date" + enqvv_date + "leadid" + enqid + "user" + a_user);

    if (enq_vv_date != "<?php echo $vv_date; ?>") {
      $.ajax({
        type: "POST",
        url: "includes/lead_update.php",
        data: {
          vv_date: enq_vv_date,
          enqid: enqid,
          a_user: a_user,
        },
        cache: false,
        success: function (data) {
          //console.log(data);
          // alert(data);

          location.reload();
        },
        error: function (xhr, status, error) {
          console.error(xhr);
        },
      });
    } else {
      location.reload();
    }
  });
  //////////////////////vv_date End//////////////////////////////

  //////////////////////stage Start//////////////////////////////
  $("#es_edit").on("click", function () {
    $("#stage").children("[readonly]").toggle();
    $("#stage").removeAttr("readonly");
    $("#stage").focus();

    $("#es_edit").hide();
    $("#es_save").show();
  });

  $("#es_save").on("click", function () {
    // $('#stage').attr('readonly', 'readonly');

    var enq_stage = $("#stage").val();

    // alert("enqstage" + enqstage + "leadid" + enqid + "user" + a_user);

    if (enq_stage != "<?php echo $stage; ?>") {
      $.ajax({
        type: "POST",
        url: "includes/lead_update.php",
        data: {
          stage: enq_stage,
          enqid: enqid,
          a_user: a_user,
        },
        cache: false,
        success: function (data) {
          //console.log(data);
          // alert(data);

          location.reload();
        },
        error: function (xhr, status, error) {
          console.error(xhr);
        },
      });
    } else {
      location.reload();
    }
  });
  //////////////////////stage End////////////////////////////////////////////////////stage Start//////////////////////////////
  $("#es_edit").on("click", function () {
    $("#stage").children("[readonly]").toggle();
    $("#stage").removeAttr("readonly");
    $("#stage").focus();

    $("#es_edit").hide();
    $("#es_save").show();
  });

  $("#es_save").on("click", function () {
    // $('#stage').attr('readonly', 'readonly');

    var enq_stage = $("#stage").val();

    // alert("enqstage" + enqstage + "leadid" + enqid + "user" + a_user);

    if (enq_stage != "<?php echo $stage; ?>") {
      $.ajax({
        type: "POST",
        url: "includes/lead_update.php",
        data: {
          stage: enq_stage,
          enqid: enqid,
          a_user: a_user,
        },
        cache: false,
        success: function (data) {
          //console.log(data);
          // alert(data);

          location.reload();
        },
        error: function (xhr, status, error) {
          console.error(xhr);
        },
      });
    } else {
      location.reload();
    }
  });
  //////////////////////stage End//////////////////////////////

  //////////////////////rechurn_reason Start//////////////////////////////
  $("#err1_edit").on("click", function () {
    $("#rechurn_reason").children("[readonly]").toggle();
    $("#rechurn_reason").removeAttr("readonly");
    $("#rechurn_reason").focus();

    $("#err1_edit").hide();
    $("#err1_save").show();
  });

  $("#err1_save").on("click", function () {
    // $('#rechurn_reason').attr('readonly', 'readonly');

    var enq_rechurn_reason = $("#rechurn_reason").val();

    // alert("enqrechurn_reason" + enqrechurn_reason + "leadid" + enqid + "user" + a_user);

    if (enq_rechurn_reason != "<?php echo $rechurn_reason; ?>") {
      $.ajax({
        type: "POST",
        url: "includes/lead_update.php",
        data: {
          rechurn_reason: enq_rechurn_reason,
          enqid: enqid,
          a_user: a_user,
        },
        cache: false,
        success: function (data) {
          //console.log(data);
          // alert(data);

          location.reload();
        },
        error: function (xhr, status, error) {
          console.error(xhr);
        },
      });
    } else {
      location.reload();
    }
  });
  //////////////////////rechurn_reason End//////////////////////////////

  //////////////////////no_quotations Start//////////////////////////////
  $("#enoq_edit").on("click", function () {
    $("#no_quotations").children("[readonly]").toggle();
    $("#no_quotations").removeAttr("readonly");
    $("#no_quotations").focus();

    $("#enoq_edit").hide();
    $("#enoq_save").show();
  });

  $("#enoq_save").on("click", function () {
    // $('#no_quotations').attr('readonly', 'readonly');

    var enq_no_quotations = $("#no_quotations").val();

    // alert("enqno_quotations" + enqno_quotations + "leadid" + enqid + "user" + a_user);

    if (enq_no_quotations != "<?php echo $no_quotations; ?>") {
      $.ajax({
        type: "POST",
        url: "includes/lead_update.php",
        data: {
          no_quotations: enq_no_quotations,
          enqid: enqid,
          a_user: a_user,
        },
        cache: false,
        success: function (data) {
          //console.log(data);
          // alert(data);

          location.reload();
        },
        error: function (xhr, status, error) {
          console.error(xhr);
        },
      });
    } else {
      location.reload();
    }
  });
  //////////////////////no_quotations End//////////////////////////////

  //////////////////////enquiry_cloned Start//////////////////////////////
  $("#eec_edit").on("click", function () {
    $("#enquiry_cloned").children("[readonly]").toggle();
    $("#enquiry_cloned").removeAttr("readonly");
    $("#enquiry_cloned").focus();

    $("#eec_edit").hide();
    $("#eec_save").show();
  });

  $("#eec_save").on("click", function () {
    // $('#enquiry_cloned').attr('readonly', 'readonly');

    var enq_enquiry_cloned = $("#enquiry_cloned").val();

    // alert("enqenquiry_cloned" + enqenquiry_cloned + "leadid" + enqid + "user" + a_user);

    if (enq_enquiry_cloned != "<?php echo $enquiry_cloned; ?>") {
      $.ajax({
        type: "POST",
        url: "includes/lead_update.php",
        data: {
          enquiry_cloned: enq_enquiry_cloned,
          enqid: enqid,
          a_user: a_user,
        },
        cache: false,
        success: function (data) {
          //console.log(data);
          // alert(data);

          location.reload();
        },
        error: function (xhr, status, error) {
          console.error(xhr);
        },
      });
    } else {
      location.reload();
    }
  });
  //////////////////////enquiry_cloned End//////////////////////////////

  //////////////////////primary_source Start//////////////////////////////
  $("#ps_id").show();
  $("#primary_source").hide();

  $("#prs_edit").on("click", function () {
    $("#ps_id").hide();
    $("#primary_source").show();

    $("#primary_source").focus();

    $("#prs_edit").hide();
    $("#prs_save").show();
  });

  $("#prs_save").on("click", function () {
    // $('#primary_source').attr('readonly', 'readonly');

    var enq_primary_source = $("#primary_source").val();

    // alert("enqprimary_source" + enqprimary_source + "leadid" + enqid + "user" + a_user);

    if (enq_primary_source != "<?php echo $primary_source; ?>") {
      $.ajax({
        type: "POST",
        url: "includes/lead_update.php",
        data: {
          primary_source: enq_primary_source,
          enqid: enqid,
          a_user: a_user,
        },
        cache: false,
        success: function (data) {
          //console.log(data);
          // alert(data);

          location.reload();
        },
        error: function (xhr, status, error) {
          console.error(xhr);
        },
      });
    } else {
      location.reload();
    }
  });
  //////////////////////primary_source End//////////////////////////////

  //////////////////////secondary_source Start//////////////////////////////
  $("#ss_id").show();
  $("#secondary_source").hide();

  $("#ses_edit").on("click", function () {
    $("#ss_id").hide();
    $("#secondary_source").show();

    $("#secondary_source").focus();

    $("#ses_edit").hide();
    $("#ses_save").show();
  });

  $("#ses_save").on("click", function () {
    // $('#secondary_source').attr('readonly', 'readonly');

    var enq_secondary_source = $("#secondary_source").val();

    // alert("enqsecondary_source" + enqsecondary_source + "leadid" + enqid + "user" + a_user);

    if (enq_secondary_source != "<?php echo $secondary_source; ?>") {
      $.ajax({
        type: "POST",
        url: "includes/lead_update.php",
        data: {
          secondary_source: enq_secondary_source,
          enqid: enqid,
          a_user: a_user,
        },
        cache: false,
        success: function (data) {
          //console.log(data);
          // alert(data);

          location.reload();
        },
        error: function (xhr, status, error) {
          console.error(xhr);
        },
      });
    } else {
      location.reload();
    }
  });
  //////////////////////secondary_source End//////////////////////////////

  //////////////////////tertiary_source Start//////////////////////////////
  $("#ts_id").show();
  $("#tertiary_source").hide();

  $("#trs_edit").on("click", function () {
    $("#ts_id").hide();
    $("#tertiary_source").show();

    $("#tertiary_source").focus();

    $("#trs_edit").hide();
    $("#trs_save").show();
  });

  $("#trs_save").on("click", function () {
    // $('#tertiary_source').attr('readonly', 'readonly');

    var enq_tertiary_source = $("#tertiary_source").val();

    // alert("enqtertiary_source" + enqtertiary_source + "leadid" + enqid + "user" + a_user);

    if (enq_tertiary_source != "<?php echo $tertiary_source; ?>") {
      $.ajax({
        type: "POST",
        url: "includes/lead_update.php",
        data: {
          tertiary_source: enq_tertiary_source,
          enqid: enqid,
          a_user: a_user,
        },
        cache: false,
        success: function (data) {
          //console.log(data);
          // alert(data);

          location.reload();
        },
        error: function (xhr, status, error) {
          console.error(xhr);
        },
      });
    } else {
      location.reload();
    }
  });
  //////////////////////tertiary_source End//////////////////////////////

  //////////////////////primary_project Start//////////////////////////////
  $("#pp_id").show();
  $("#primary_project").hide();

  $("#epp_edit").on("click", function () {
    $("#pp_id").hide();
    $("#primary_project").show();

    $("#primary_project").focus();

    $("#epp_edit").hide();
    $("#epp_save").show();
  });

  // $('#epp_edit').on('click', function () {
  //   $('#primary_project').children('[readonly]').toggle();
  //   $('#primary_project').removeAttr('readonly');
  //   $('#primary_project').focus();

  //   $('#epp_edit').hide();
  //   $('#epp_save').show();
  // });

  $("#epp_save").on("click", function () {
    // $('#primary_project').attr('readonly', 'readonly');

    var enq_primary_project = $("#primary_project").val();

    // alert("enqprimary_project" + enqprimary_project + "leadid" + enqid + "user" + a_user);

    if (enq_primary_project != "<?php echo $primary_project; ?>") {
      $.ajax({
        type: "POST",
        url: "includes/lead_update.php",
        data: {
          primary_project: enq_primary_project,
          enqid: enqid,
          a_user: a_user,
        },
        cache: false,
        success: function (data) {
          //console.log(data);
          // alert(data);

          location.reload();
        },
        error: function (xhr, status, error) {
          console.error(xhr);
        },
      });
    } else {
      location.reload();
    }
  });
  //////////////////////primary_project End//////////////////////////////

  //////////////////////suggested_project Start//////////////////////////////
  $("#esp_edit").on("click", function () {
    $("#suggested_project").children("[readonly]").toggle();
    $("#suggested_project").removeAttr("readonly");
    $("#suggested_project").focus();

    $("#esp_edit").hide();
    $("#esp_save").show();
  });

  $("#esp_save").on("click", function () {
    // $('#suggested_project').attr('readonly', 'readonly');

    var enq_suggested_project = $("#suggested_project").val();

    // alert("enqsuggested_project" + enqsuggested_project + "leadid" + enqid + "user" + a_user);

    if (enq_suggested_project != "<?php echo $s_project; ?>") {
      $.ajax({
        type: "POST",
        url: "includes/lead_update.php",
        data: {
          suggested_project: enq_suggested_project,
          enqid: enqid,
          a_user: a_user,
        },
        cache: false,
        success: function (data) {
          //console.log(data);
          // alert(data);

          location.reload();
        },
        error: function (xhr, status, error) {
          console.error(xhr);
        },
      });
    } else {
      location.reload();
    }
  });
  //////////////////////suggested_project End//////////////////////////////

  //////////////////////preffered_budget Start//////////////////////////////
  $("#epb_edit").on("click", function () {
    $("#preffered_budget").children("[readonly]").toggle();
    $("#preffered_budget").removeAttr("readonly");
    $("#preffered_budget").focus();

    $("#epb_edit").hide();
    $("#epb_save").show();
  });

  $("#epb_save").on("click", function () {
    // $('#preffered_budget').attr('readonly', 'readonly');

    var enq_preffered_budget = $("#preffered_budget").val();

    // alert("enqpreffered_budget" + enqpreffered_budget + "leadid" + enqid + "user" + a_user);

    if (enq_preffered_budget != "<?php echo $preffered_budget; ?>") {
      $.ajax({
        type: "POST",
        url: "includes/lead_update.php",
        data: {
          preffered_budget: enq_preffered_budget,
          enqid: enqid,
          a_user: a_user,
        },
        cache: false,
        success: function (data) {
          //console.log(data);
          // alert(data);

          location.reload();
        },
        error: function (xhr, status, error) {
          console.error(xhr);
        },
      });
    } else {
      location.reload();
    }
  });
  //////////////////////preffered_budget End//////////////////////////////

  //////////////////////preffered_locality Start//////////////////////////////
  $("#epl_edit").on("click", function () {
    $("#preffered_locality").children("[readonly]").toggle();
    $("#preffered_locality").removeAttr("readonly");
    $("#preffered_locality").focus();

    $("#epl_edit").hide();
    $("#epl_save").show();
  });

  $("#epl_save").on("click", function () {
    // $('#preffered_locality').attr('readonly', 'readonly');

    var enq_preffered_locality = $("#preffered_locality").val();

    // alert("enqpreffered_locality" + enqpreffered_locality + "leadid" + enqid + "user" + a_user);

    if (enq_preffered_locality != "<?php echo $preffered_locality; ?>") {
      $.ajax({
        type: "POST",
        url: "includes/lead_update.php",
        data: {
          preffered_locality: enq_preffered_locality,
          enqid: enqid,
          a_user: a_user,
        },
        cache: false,
        success: function (data) {
          //console.log(data);
          // alert(data);

          location.reload();
        },
        error: function (xhr, status, error) {
          console.error(xhr);
        },
      });
    } else {
      location.reload();
    }
  });
  //////////////////////preffered_locality End//////////////////////////////

  //////////////////////referrer_details Start//////////////////////////////
  $("#erd_edit").on("click", function () {
    $("#referrer_details").children("[readonly]").toggle();
    $("#referrer_details").removeAttr("readonly");
    $("#referrer_details").focus();

    $("#erd_edit").hide();
    $("#erd_save").show();
  });

  $("#erd_save").on("click", function () {
    // $('#referrer_details').attr('readonly', 'readonly');

    var enq_referrer_details = $("#referrer_details").val();

    // alert("enqreferrer_details" + enqreferrer_details + "leadid" + enqid + "user" + a_user);

    if (enq_referrer_details != "<?php echo $referrer_details; ?>") {
      $.ajax({
        type: "POST",
        url: "includes/lead_update.php",
        data: {
          referrer_details: enq_referrer_details,
          enqid: enqid,
          a_user: a_user,
        },
        cache: false,
        success: function (data) {
          //console.log(data);
          // alert(data);

          location.reload();
        },
        error: function (xhr, status, error) {
          console.error(xhr);
        },
      });
    } else {
      location.reload();
    }
  });
  //////////////////////referrer_details End//////////////////////////////

  //////////////////////cp_name Start//////////////////////////////
  $("#ecpn_edit").on("click", function () {
    $("#cp_name").children("[readonly]").toggle();
    $("#cp_name").removeAttr("readonly");
    $("#cp_name").focus();

    $("#ecpn_edit").hide();
    $("#ecpn_save").show();
  });

  $("#ecpn_save").on("click", function () {
    // $('#cp_name').attr('readonly', 'readonly');

    var enq_cp_name = $("#cp_name").val();

    // alert("enqcp_name" + enqcp_name + "leadid" + enqid + "user" + a_user);

    if (enq_cp_name != "<?php echo $cpname; ?>") {
      $.ajax({
        type: "POST",
        url: "includes/lead_update.php",
        data: {
          cpname: enq_cp_name,
          enqid: enqid,
          a_user: a_user,
        },
        cache: false,
        success: function (data) {
          //console.log(data);
          // alert(data);

          location.reload();
        },
        error: function (xhr, status, error) {
          console.error(xhr);
        },
      });
    } else {
      location.reload();
    }
  });
  //////////////////////cp_name End//////////////////////////////

  //////////////////////source_url Start//////////////////////////////
  $("#esu_edit").on("click", function () {
    $("#source_url").children("[readonly]").toggle();
    $("#source_url").removeAttr("readonly");
    $("#source_url").focus();

    $("#esu_edit").hide();
    $("#esu_save").show();
  });

  $("#esu_save").on("click", function () {
    // $('#source_url').attr('readonly', 'readonly');

    var enq_source_url = $("#source_url").val();

    // alert("enqsource_url" + enqsource_url + "leadid" + enqid + "user" + a_user);

    if (enq_source_url != "<?php echo $source_url; ?>") {
      $.ajax({
        type: "POST",
        url: "includes/lead_update.php",
        data: {
          source_url: enq_source_url,
          enqid: enqid,
          a_user: a_user,
        },
        cache: false,
        success: function (data) {
          //console.log(data);
          // alert(data);

          location.reload();
        },
        error: function (xhr, status, error) {
          console.error(xhr);
        },
      });
    } else {
      location.reload();
    }
  });
  //////////////////////source_url End//////////////////////////////

  //////////////////////earlier_source Start//////////////////////////////
  $("#ees_edit").on("click", function () {
    $("#earlier_source").children("[readonly]").toggle();
    $("#earlier_source").removeAttr("readonly");
    $("#earlier_source").focus();

    $("#ees_edit").hide();
    $("#ees_save").show();
  });

  $("#ees_save").on("click", function () {
    // $('#earlier_source').attr('readonly', 'readonly');

    var enq_earlier_source = $("#earlier_source").val();

    // alert("enqearlier_source" + enqearlier_source + "leadid" + enqid + "user" + a_user);

    if (enq_earlier_source != "<?php echo $earlier_source; ?>") {
      $.ajax({
        type: "POST",
        url: "includes/lead_update.php",
        data: {
          earlier_source: enq_earlier_source,
          enqid: enqid,
          a_user: a_user,
        },
        cache: false,
        success: function (data) {
          //console.log(data);
          // alert(data);

          location.reload();
        },
        error: function (xhr, status, error) {
          console.error(xhr);
        },
      });
    } else {
      location.reload();
    }
  });
  //////////////////////earlier_source End//////////////////////////////

  //////////////////////looking_for Start//////////////////////////////
  $("#elf_edit").on("click", function () {
    $("#looking_for").children("[readonly]").toggle();
    $("#looking_for").removeAttr("readonly");
    $("#looking_for").focus();

    $("#elf_edit").hide();
    $("#elf_save").show();
  });

  $("#elf_save").on("click", function () {
    // $('#looking_for').attr('readonly', 'readonly');

    var enq_looking_for = $("#looking_for").val();

    // alert("enqlooking_for" + enqlooking_for + "leadid" + enqid + "user" + a_user);

    if (enq_looking_for != "<?php echo $looking_for; ?>") {
      $.ajax({
        type: "POST",
        url: "includes/lead_update.php",
        data: {
          looking_for: enq_looking_for,
          enqid: enqid,
          a_user: a_user,
        },
        cache: false,
        success: function (data) {
          //console.log(data);
          // alert(data);

          location.reload();
        },
        error: function (xhr, status, error) {
          console.error(xhr);
        },
      });
    } else {
      location.reload();
    }
  });
  //////////////////////looking_for End//////////////////////////////

  //////////////////////preferred_unit_type Start//////////////////////////////
  $("#eput_edit").on("click", function () {
    $("#preferred_unit_type").children("[readonly]").toggle();
    $("#preferred_unit_type").removeAttr("readonly");
    $("#preferred_unit_type").focus();

    $("#eput_edit").hide();
    $("#eput_save").show();
  });

  $("#eput_save").on("click", function () {
    // $('#preferred_unit_type').attr('readonly', 'readonly');

    var enq_preferred_unit_type = $("#preferred_unit_type").val();

    // alert("enqpreferred_unit_type" + enqpreferred_unit_type + "leadid" + enqid + "user" + a_user);

    if (enq_preferred_unit_type != "<?php echo $pu_type; ?>") {
      $.ajax({
        type: "POST",
        url: "includes/lead_update.php",
        data: {
          preferred_unit_type: enq_preferred_unit_type,
          enqid: enqid,
          a_user: a_user,
        },
        cache: false,
        success: function (data) {
          //console.log(data);
          // alert(data);

          location.reload();
        },
        error: function (xhr, status, error) {
          console.error(xhr);
        },
      });
    } else {
      location.reload();
    }
  });
  //////////////////////preferred_unit_type End//////////////////////////////

  //////////////////////sv_scheduled_note Start//////////////////////////////
  $("#esvsn_edit").on("click", function () {
    $("#sv_scheduled_note").children("[readonly]").toggle();
    $("#sv_scheduled_note").removeAttr("readonly");
    $("#sv_scheduled_note").focus();

    $("#esvsn_edit").hide();
    $("#esvsn_save").show();
  });

  $("#esvsn_save").on("click", function () {
    // $('#sv_scheduled_note').attr('readonly', 'readonly');

    var enq_sv_scheduled_note = $("#sv_scheduled_note").val();

    // alert("enqsv_scheduled_note" + enqsv_scheduled_note + "leadid" + enqid + "user" + a_user);

    if (enq_sv_scheduled_note != "<?php echo $sv_note; ?>") {
      $.ajax({
        type: "POST",
        url: "includes/lead_update.php",
        data: {
          sv_scheduled_note: enq_sv_scheduled_note,
          enqid: enqid,
          a_user: a_user,
        },
        cache: false,
        success: function (data) {
          //console.log(data);
          // alert(data);

          location.reload();
        },
        error: function (xhr, status, error) {
          console.error(xhr);
        },
      });
    } else {
      location.reload();
    }
  });
  //////////////////////sv_scheduled_note End//////////////////////////////

  //////////////////////sv_scheduled_date Start//////////////////////////////
  $("#esvsd_edit").on("click", function () {
    $("#sv_scheduled_date").children("[readonly]").toggle();
    $("#sv_scheduled_date").removeAttr("readonly");
    $("#sv_scheduled_date").focus();

    $("#esvsd_edit").hide();
    $("#esvsd_save").show();
  });

  $("#esvsd_save").on("click", function () {
    // $('#sv_scheduled_date').attr('readonly', 'readonly');

    var enq_sv_scheduled_date = $("#sv_scheduled_date").val();

    // alert("enqsv_scheduled_date" + enqsv_scheduled_date + "leadid" + enqid + "user" + a_user);

    if (enq_sv_scheduled_date != "<?php echo $sv_date; ?>") {
      $.ajax({
        type: "POST",
        url: "includes/lead_update.php",
        data: {
          sv_scheduled_date: enq_sv_scheduled_date,
          enqid: enqid,
          a_user: a_user,
        },
        cache: false,
        success: function (data) {
          //console.log(data);
          // alert(data);

          location.reload();
        },
        error: function (xhr, status, error) {
          console.error(xhr);
        },
      });
    } else {
      location.reload();
    }
  });
  //////////////////////sv_scheduled_date End//////////////////////////////

  //////////////////////svc_note Start//////////////////////////////
  $("#esvcn_edit").on("click", function () {
    $("#svc_note").children("[readonly]").toggle();
    $("#svc_note").removeAttr("readonly");
    $("#svc_note").focus();

    $("#esvcn_edit").hide();
    $("#esvcn_save").show();
  });

  $("#esvcn_save").on("click", function () {
    // $('#svc_note').attr('readonly', 'readonly');

    var enq_svc_note = $("#svc_note").val();

    // alert("enqsvc_note" + enqsvc_note + "leadid" + enqid + "user" + a_user);

    if (enq_svc_note != "<?php echo $sv_note; ?>") {
      $.ajax({
        type: "POST",
        url: "includes/lead_update.php",
        data: {
          svc_note: enq_svc_note,
          enqid: enqid,
          a_user: a_user,
        },
        cache: false,
        success: function (data) {
          //console.log(data);
          // alert(data);

          location.reload();
        },
        error: function (xhr, status, error) {
          console.error(xhr);
        },
      });
    } else {
      location.reload();
    }
  });
  //////////////////////svc_note End//////////////////////////////

  //////////////////////svc_date Start//////////////////////////////
  $("#esvcd_edit").on("click", function () {
    $("#svc_date").children("[readonly]").toggle();
    $("#svc_date").removeAttr("readonly");
    $("#svc_date").focus();

    $("#esvcd_edit").hide();
    $("#esvcd_save").show();
  });

  $("#esvcd_save").on("click", function () {
    // $('#svc_date').attr('readonly', 'readonly');

    var enq_svc_date = $("#svc_date").val();

    // alert("enqsvc_date" + enqsvc_date + "leadid" + enqid + "user" + a_user);

    if (enq_svc_date != "<?php echo $sv_date; ?>") {
      $.ajax({
        type: "POST",
        url: "includes/lead_update.php",
        data: {
          svc_date: enq_svc_date,
          enqid: enqid,
          a_user: a_user,
        },
        cache: false,
        success: function (data) {
          //console.log(data);
          // alert(data);

          location.reload();
        },
        error: function (xhr, status, error) {
          console.error(xhr);
        },
      });
    } else {
      location.reload();
    }
  });
  //////////////////////svc_date End//////////////////////////////

  //////////////////////svd_note Start//////////////////////////////
  $("#esvdn_edit").on("click", function () {
    $("#svd_note").children("[readonly]").toggle();
    $("#svd_note").removeAttr("readonly");
    $("#svd_note").focus();

    $("#esvdn_edit").hide();
    $("#esvdn_save").show();
  });

  $("#esvdn_save").on("click", function () {
    // $('#svd_note').attr('readonly', 'readonly');

    var enq_svd_note = $("#svd_note").val();

    // alert("enqsvd_note" + enqsvd_note + "leadid" + enqid + "user" + a_user);

    if (enq_svd_note != "<?php echo $sv_note; ?>") {
      $.ajax({
        type: "POST",
        url: "includes/lead_update.php",
        data: {
          svd_note: enq_svd_note,
          enqid: enqid,
          a_user: a_user,
        },
        cache: false,
        success: function (data) {
          //console.log(data);
          // alert(data);

          location.reload();
        },
        error: function (xhr, status, error) {
          console.error(xhr);
        },
      });
    } else {
      location.reload();
    }
  });
  //////////////////////svd_note End//////////////////////////////

  //////////////////////svd_date Start//////////////////////////////
  $("#esvdd_edit").on("click", function () {
    $("#svd_date").children("[readonly]").toggle();
    $("#svd_date").removeAttr("readonly");
    $("#svd_date").focus();

    $("#esvdd_edit").hide();
    $("#esvdd_save").show();
  });

  $("#esvdd_save").on("click", function () {
    // $('#svd_date').attr('readonly', 'readonly');

    var enq_svd_date = $("#svd_date").val();

    // alert("enqsvd_date" + enqsvd_date + "leadid" + enqid + "user" + a_user);

    if (enq_svd_date != "<?php echo $sv_date; ?>") {
      $.ajax({
        type: "POST",
        url: "includes/lead_update.php",
        data: {
          svd_date: enq_svd_date,
          enqid: enqid,
          a_user: a_user,
        },
        cache: false,
        success: function (data) {
          //console.log(data);
          // alert(data);

          location.reload();
        },
        error: function (xhr, status, error) {
          console.error(xhr);
        },
      });
    } else {
      location.reload();
    }
  });
  //////////////////////svd_date End//////////////////////////////

  //////////////////////project_interested Start//////////////////////////////

  $("#prj_int").show();
  $("#project_interested").hide();

  $("#epi_edit").on("click", function () {
    $("#prj_int").hide();
    $("#project_interested").show();

    $("#project_interested").focus();

    $("#epi_edit").hide();
    $("#epi_save").show();
  });

  $("#epi_save").on("click", function () {
    // $('#project_interested').attr('readonly', 'readonly');

    var enq_project_interested = $("#project_interested").val();

    // alert("enqproject_interested" + enqproject_interested + "leadid" + enqid + "user" + a_user);

    if (enq_project_interested != "<?php echo $project; ?>") {
      $.ajax({
        type: "POST",
        url: "includes/lead_update.php",
        data: {
          project_interested: enq_project_interested,
          enqid: enqid,
          a_user: a_user,
        },
        cache: false,
        success: function (data) {
          //console.log(data);
          // alert(data);

          location.reload();
        },
        error: function (xhr, status, error) {
          console.error(xhr);
        },
      });
    } else {
      location.reload();
    }
  });
  //////////////////////project_interested End//////////////////////////////

  //////////////////////sv_status Start//////////////////////////////

  $("#svs").show();
  $("#sv_status").hide();

  $("#esvs_edit").on("click", function () {
    $("#svs").hide();
    $("#sv_status").show();

    $("#sv_status").focus();

    $("#esvs_edit").hide();
    $("#esvs_save").show();
  });

  $("#esvs_save").on("click", function () {
    // $('#sv_status').attr('readonly', 'readonly');

    var enq_sv_status = $("#sv_status").val();

    // alert("enqsv_status" + enqsv_status + "leadid" + enqid + "user" + a_user);

    if (enq_sv_status != "<?php echo $sv_status; ?>") {
      $.ajax({
        type: "POST",
        url: "includes/lead_update.php",
        data: {
          sv_status: enq_sv_status,
          enqid: enqid,
          a_user: a_user,
        },
        cache: false,
        success: function (data) {
          //console.log(data);
          // alert(data);

          location.reload();
        },
        error: function (xhr, status, error) {
          console.error(xhr);
        },
      });
    } else {
      location.reload();
    }
  });
  //////////////////////sv_status End//////////////////////////////

  //////////////////////enquiry_status Start//////////////////////////////

  $("#enq_sts").show();
  $("#enquiry_status").hide();

  $("#enqsts_edit").on("click", function () {
    $("#enq_sts").hide();
    $("#enquiry_status").show();

    $("#enquiry_status").focus();

    $("#enqsts_edit").hide();
    $("#enqsts_save").show();
  });

  $("#enqsts_save").on("click", function () {
    // $('#enquiry_status').attr('readonly', 'readonly');

    var enq_enquiry_status = $("#enquiry_status").val();

    // alert("enqenquiry_status" + enqenquiry_status + "leadid" + enqid + "user" + a_user);

    if (enq_enquiry_status != "<?php echo $project; ?>") {
      $.ajax({
        type: "POST",
        url: "includes/lead_update.php",
        data: {
          enquiry_status: enq_enquiry_status,
          enqid: enqid,
          a_user: a_user,
        },
        cache: false,
        success: function (data) {
          //console.log(data);
          // alert(data);

          location.reload();
        },
        error: function (xhr, status, error) {
          console.error(xhr);
        },
      });
    } else {
      location.reload();
    }
  });
  //////////////////////enquiry_status End//////////////////////////////

  //////////////////////open_reason Start//////////////////////////////
  $("#op_re").show();
  $("#op_reason").hide();
  $("#eor_edit").on("click", function () {
    // $('#op_reason').children('[readonly]').toggle();
    // $('#op_reason').removeAttr('readonly');
    // $('#op_reason').focus();

    $("#op_re").hide();
    $("#op_reason").show();
    $("#op_reason").focus();

    $("#eor_edit").hide();
    $("#eor_save").show();
  });

  $("#eor_save").on("click", function () {
    // $('#open_reason').attr('readonly', 'readonly');

    var enq_open_reason = $("#op_reason").val();

    // alert("enqopen_reason" + enqopen_reason + "leadid" + enqid + "user" + a_user);

    if (enq_open_reason != "<?php echo $open_reason; ?>") {
      $.ajax({
        type: "POST",
        url: "includes/lead_update.php",
        data: {
          open_reason: enq_open_reason,
          enqid: enqid,
          a_user: a_user,
        },
        cache: false,
        success: function (data) {
          //console.log(data);
          // alert(data);

          location.reload();
        },
        error: function (xhr, status, error) {
          console.error(xhr);
        },
      });
    } else {
      location.reload();
    }
  });
  //////////////////////open_reason End//////////////////////////////

  //////////////////////call_status Start//////////////////////////////

  $("#enq_cs").show();
  $("#call_status").hide();

  $("#ecs_edit").on("click", function () {
    $("#enq_cs").hide();
    $("#call_status").show();

    $("#call_status").focus();

    $("#ecs_edit").hide();
    $("#ecs_save").show();
  });

  $("#ecs_save").on("click", function () {
    // $('#call_status').attr('readonly', 'readonly');

    var enq_call_status = $("#call_status").val();

    // alert("enqcall_status" + enqcall_status + "leadid" + enqid + "user" + a_user);

    if (enq_call_status != "<?php echo $call_status; ?>") {
      $.ajax({
        type: "POST",
        url: "includes/lead_update.php",
        data: {
          call_status: enq_call_status,
          enqid: enqid,
          a_user: a_user,
        },
        cache: false,
        success: function (data) {
          //console.log(data);
          // alert(data);

          location.reload();
        },
        error: function (xhr, status, error) {
          console.error(xhr);
        },
      });
    } else {
      location.reload();
    }
  });
  //////////////////////call_status End//////////////////////////////

  //////////////////////Stage : Start//////////////////////////////
  //////////////////////Stage : End//////////////////////////////

  //////////////////////Stage : Start//////////////////////////////
  //////////////////////Stage : End//////////////////////////////

  ////////////// enquiry rating Start//////////////////////

  $('input[name = "rating"]').on("change", function () {
    var checked_val = $('input[name = "rating"]:checked').val();

    $("#rating_val").val(checked_val);

    // alert(checked_val);
  });

  $("#er_save").on("click", function () {
    $("#enquiry_rating").attr("readonly", "readonly");

    var erating = $("#rating_val").val();
    //alert(erating);

    // alert("enqmobile" + enqmobile + "leadid" + enqid + "user" + a_user);

    if (erating != "<?php echo $rating; ?>") {
      $.ajax({
        type: "POST",
        url: "includes/lead_update.php",
        data: {
          rating: erating,
          enqid: enqid,
          a_user: a_user,
        },
        cache: false,
        success: function (data) {
          //console.log(data);
          // alert(data);

          location.reload();
        },
        error: function (xhr, status, error) {
          console.error(xhr);
        },
      });
    } else {
      location.reload();
    }

    $("#em_save").hide();
  });

  /////////////////// enquiry rating ends///////////////////////////

  //////////////////////follow_up_date Start//////////////////////////////
  $("#efud_edit").on("click", function () {
    $("#follow_up_date").children("[readonly]").toggle();
    $("#follow_up_date").removeAttr("readonly");
    $("#follow_up_date").focus();

    $("#efud_edit").hide();
    $("#efud_save").show();
  });

  $("#efud_save").on("click", function () {
    // $('#follow_up_date').attr('readonly', 'readonly');

    var $fu_date = $("#follow_up_date").val();

    // alert("enqfollow_up_date" + enqfollow_up_date + "leadid" + enqid + "user" + a_user);

    if ($fu_date != "<?php echo $fu_date; ?>") {
      $.ajax({
        type: "POST",
        url: "includes/lead_update.php",
        data: {
          follow_up_date: $fu_date,
          enqid: enqid,
          a_user: a_user,
        },
        cache: false,
        success: function (data) {
          //console.log(data);
          // alert(data);

          location.reload();
        },
        error: function (xhr, status, error) {
          console.error(xhr);
        },
      });
    } else {
      location.reload();
    }
  });
  //////////////////////follow_up_date End//////////////////////////////

  //////////////////////call_remarks Start//////////////////////////////
  $("#ecr_edit").on("click", function () {
    $("#call_rm").children("[readonly]").toggle();
    $("#call_rm").removeAttr("readonly");
    $("#call_rm").focus();

    $("#ecr_edit").hide();
    $("#ecr_save").show();
  });

  $("#ecr_save").on("click", function () {
    // $('#call_remarks').attr('readonly', 'readonly');

    var enq_call_remarks = $("#call_rm").val();

    // alert("enqcall_remarks" + enqcall_remarks + "leadid" + enqid + "user" + a_user);

    if (enq_call_remarks != "<?php echo $call_remarks; ?>") {
      $.ajax({
        type: "POST",
        url: "includes/lead_update.php",
        data: {
          call_remarks: enq_call_remarks,
          enqid: enqid,
          a_user: a_user,
        },
        cache: false,
        success: function (data) {
          //console.log(data);
          // alert(data);

          location.reload();
        },
        error: function (xhr, status, error) {
          console.error(xhr);
        },
      });
    } else {
      location.reload();
    }
  });
  //////////////////////call_remarks End//////////////////////////////
});
