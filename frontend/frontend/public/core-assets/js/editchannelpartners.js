$(document).ready(function () {
  // lead script start-----------------------------------------------------------------------------------------------------

  var cp_id = $("#cp_edit").val();
  var a_user = $("#a_user").val();


  $("#dsm_id").on("keyup input", function () {
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
    $("#dsm_id").val($(this).text());
    $(this).parent(".lown_result").empty();
    //alert($(this).data("log"));
    $("#owner_id").val($(this).data("log"));
  });
  
  //////////////////////Cp Lead Owner Changed Start//////////////////////////////

  $("#dsmid_edit").on("click", function () {
    $("#dsm_id").children("[readonly]").toggle();
    $("#dsm_id").removeAttr("readonly");
    $("#dsm_id").focus();

    $("#dsmid_edit").hide();
    $("#dsmid_save").show();
  });

  $("#dsmid_save").on("click", function () {
    
    var dsm_id = $("#owner_id").val();

    if (dsm_id != "<?php echo $dsm_id; ?>") {
      $.ajax({
        type: "POST",
        url: "includes/cp_update.php",
        data: {
          dsm_id: dsm_id,
          cp_id: cp_id,
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
  // ///////////////////Cp Lead Owner Changed end/////////////////////////

  //////////////////////type_channel_partner Start//////////////////////////////

  $("#cps_type").show();
  $("#t_channel_partner").hide();

  $("#type_edit").on("click", function () {
    $("#cps_type").hide();
    $("#t_channel_partner").show();

    $("#t_channel_partner").focus();

    $("#type_edit").hide();
    $("#type_save").show();
  });

  $("#type_save").on("click", function () {
    var enq_type_cp = $("#t_channel_partner").val();

    if (enq_type_cp != "<?php echo $cp_type; ?>") {
      $.ajax({
        type: "POST",
        url: "includes/cp_update.php",
        data: {
          cp_type: enq_type_cp,
          cp_id: cp_id,
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
  });

  //////////////////////cp_type End//////////////////////////////

  $("#cn_edit").on("click", function () {
    $("#company_name").children("[readonly]").toggle();
    $("#company_name").removeAttr("readonly");
    $("#company_name").focus();

    $("#cn_edit").hide();
    $("#cn_save").show();
  });

  $("#cn_save").on("click", function () {
    var company_name = $("#company_name").val();

    if (company_name != "<?php echo $company_name; ?>") {
      $.ajax({
        type: "POST",
        url: "includes/cp_update.php",
        data: {
          company_name: company_name,
          cp_id: cp_id,
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

  //////////////////////cp_name Start//////////////////////////////

  $("#cpn_edit").on("click", function () {
    $("#cp_name").children("[readonly]").toggle();
    $("#cp_name").removeAttr("readonly");
    $("#cp_name").focus();

    $("#cpn_edit").hide();
    $("#cpn_save").show();
  });

  $("#cpn_save").on("click", function () {
    // $('#cp_name').attr('readonly', 'readonly');

    var cp_name = $("#cp_name").val();

    // alert("cp_name" + cp_name + "leadid" + cp_id + "user" + a_user);

    if (cp_name != "<?php echo $cp_name; ?>") {
      $.ajax({
        type: "POST",
        url: "includes/cp_update.php",
        data: {
          cp_name: cp_name,
          cp_id: cp_id,
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

    // $('#cpn_save').hide();
  });
  //////////////////////cp name End//////////////////////////////

  //////////////////////cp mobile Start//////////////////////////////
  $("#mn_edit").on("click", function () {
    $("#mobile_number").children("[readonly]").toggle();
    $("#mobile_number").removeAttr("readonly");
    $("#mobile_number").focus();

    $("#mn_edit").hide();
    $("#mn_save").show();
  });

  $("#mn_save").on("click", function () {
    // $('#mobile_number').attr('readonly', 'readonly');

    var cp_mobile = $("#mobile_number").val();

    // alert("cp_mobile" + cp_mobile + "leadid" + cp_id + "user" + a_user);

    if (cp_mobile != "<?php echo $mobile; ?>") {
      $.ajax({
        type: "POST",
        url: "includes/cp_update.php",
        data: {
          mobile_number: cp_mobile,
          cp_id: cp_id,
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

    // $('#mn_save').hide();
  });

  //////////////////////Mobile Number End//////////////////////////////

  //////////////////////Alter mobile Start//////////////////////////////
  $("#off_edit").on("click", function () {
    $("#office_number").children("[readonly]").toggle();
    $("#office_number").removeAttr("readonly");
    $("#office_number").focus();

    $("#off_edit").hide();
    $("#off_save").show();
  });

  $("#off_save").on("click", function () {
    var office_number = $("#office_number").val();

    if (office_number != "<?php echo $office_number; ?>") {
      $.ajax({
        type: "POST",
        url: "includes/cp_update.php",
        data: {
          office_number: office_number,
          cp_id: cp_id,
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

    // $('#mn_save').hide();
  });

  //////////////////////Alter Mobile Number End//////////////////////////////

  //////////////////////cp_email Start//////////////////////////////
  $("#cpe_edit").on("click", function () {
    $("#cp_email").children("[readonly]").toggle();
    $("#cp_email").removeAttr("readonly");
    $("#cp_email").focus();

    $("#cpe_edit").hide();
    $("#cpe_save").show();
  });

  $("#cpe_save").on("click", function () {
    // $('#cp_email').attr('readonly', 'readonly');

    var enqcp_email = $("#cp_email").val();

    // alert("enqcp_email" + enqcp_email + "leadid" + cp_id + "user" + a_user);

    if (enqcp_email != "<?php echo $cp_email; ?>") {
      $.ajax({
        type: "POST",
        url: "includes/cp_update.php",
        data: {
          cp_email: enqcp_email,
          cp_id: cp_id,
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

    // $('#cpe_save').hide();
  });
  //////////////////////cp_email End//////////////////////////////

  //////////////////////cr_number Start//////////////////////////////
  $("#crn_edit").on("click", function () {
    $("#cr_number").children("[readonly]").toggle();
    $("#cr_number").removeAttr("readonly");
    $("#cr_number").focus();

    $("#crn_edit").hide();
    $("#crn_save").show();
  });

  $("#crn_save").on("click", function () {
    // $('#cr_number').attr('readonly', 'readonly');

    var enq_cr_number = $("#cr_number").val();

    // alert("enqcr_number" + enqcr_number + "leadid" + cp_id + "user" + a_user);

    if (enq_cr_number != "<?php echo $cr_number; ?>") {
      $.ajax({
        type: "POST",
        url: "includes/cp_update.php",
        data: {
          cr_number: enq_cr_number,
          cp_id: cp_id,
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
  //////////////////////cr_number End//////////////////////////////

  //////////////////////pan_company Start//////////////////////////////
  $("#panc_edit").on("click", function () {
    $("#pan_company").children("[readonly]").toggle();
    $("#pan_company").removeAttr("readonly");
    $("#pan_company").focus();

    $("#panc_edit").hide();
    $("#panc_save").show();
  });

  $("#panc_save").on("click", function () {
    // $('#pan_company').attr('readonly', 'readonly');

    var enq_pan_company = $("#pan_company").val();

    // alert("enqpan_company" + enqpan_company + "leadid" + cp_id + "user" + a_user);

    if (enq_pan_company != "<?php echo $pan_company; ?>") {
      $.ajax({
        type: "POST",
        url: "includes/cp_update.php",
        data: {
          pan_company: enq_pan_company,
          cp_id: cp_id,
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
  //////////////////////pan_company End//////////////////////////////

  //////////////////////pan_file Start//////////////////////////////

  $("#panc_file").show();
  $("#pan_file_company").hide();

  $("#upc_edit").on("click", function () {
    $("#panc_file").hide();
    $("#pan_file_company").show();
    $("#pan_file_company").focus();

    $("#upc_edit").hide();
    $("#upc_save").show();
  });

  $("#upc_save").on("click", function () {
    // $('#pan_file').attr('readonly', 'readonly');

    var pan_file = $("#pan_file_company").val();

    // alert("enqpan_file" + enqpan_file + "leadid" + cp_id + "user" + a_user);

    if (pan_file != "<?php echo $pan_file; ?>") {
      $.ajax({
        type: "POST",
        url: "includes/cp_update.php",
        data: {
          pan_file: pan_file,
          cp_id: cp_id,
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
  //////////////////////pan_file End//////////////////////////////

  //////////////////////gst_number Start//////////////////////////////
  $("#gst_edit").on("click", function () {
    $("#gst_number").children("[readonly]").toggle();
    $("#gst_number").removeAttr("readonly");
    $("#gst_number").focus();

    $("#gst_edit").hide();
    $("#gst_save").show();
  });

  $("#gst_save").on("click", function () {
    // $('#gst_number').attr('readonly', 'readonly');

    var enq_gst_number = $("#gst_number").val();

    // alert("enqgst_number" + enqgst_number + "leadid" + cp_id + "user" + a_user);

    if (enq_gst_number != "<?php echo $gst_number; ?>") {
      $.ajax({
        type: "POST",
        url: "includes/cp_update.php",
        data: {
          gst_number: enq_gst_number,
          cp_id: cp_id,
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
  //////////////////////gst_number End//////////////////////////////

  //////////////////////gst_file Start//////////////////////////////

  $("#gstc_file").show();
  $("#gst_file").hide();

  $("#gstf_edit").on("click", function () {
    $("#gstc_file").hide();
    $("#gst_file").show();
    $("#gst_file").focus();

    $("#gstf_edit").hide();
    $("#gstf_save").show();
  });

  $("#gstf_save").on("click", function () {
    // $('#gst_file').attr('readonly', 'readonly');

    var enqgst_file = $("#gst_file").val();

    // alert("enqgst_file" + enqgst_file + "leadid" + cp_id + "user" + a_user);

    if (enqgst_file != "<?php echo $gst_file; ?>") {
      $.ajax({
        type: "POST",
        url: "includes/cp_update.php",
        data: {
          gst_file: enqgst_file,
          cp_id: cp_id,
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
  //////////////////////gst_file End//////////////////////////////

  //////////////////////rera_number Start//////////////////////////////
  $("#rera_edit").on("click", function () {
    $("#rera_number").children("[readonly]").toggle();
    $("#rera_number").removeAttr("readonly");
    $("#rera_number").focus();

    $("#rera_edit").hide();
    $("#rera_save").show();
  });

  $("#rera_save").on("click", function () {
    // $('#rera_number').attr('readonly', 'readonly');

    var enq_rera_number = $("#rera_number").val();

    // alert("enqrera_number" + enqrera_number + "leadid" + cp_id + "user" + a_user);

    if (enq_rera_number != "<?php echo $rera_number; ?>") {
      $.ajax({
        type: "POST",
        url: "includes/cp_update.php",
        data: {
          rera_number: enq_rera_number,
          cp_id: cp_id,
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
  //////////////////////rera_number End//////////////////////////////

  //////////////////////rera_file Start//////////////////////////////
  $("#rerac_file").show();
  $("#rera_file").hide();

  $("#reraf_edit").on("click", function () {
    $("#rerac_file").hide();
    $("#rera_file").show();
    $("#rera_file").focus();

    $("#reraf_edit").hide();
    $("#reraf_save").show();
  });

  $("#reraf_save").on("click", function () {
    // $('#rera_file').attr('readonly', 'readonly');

    var enq_rera_file = $("#rera_file").val();

    if (enq_rera_file != "<?php echo $rera_file; ?>") {
      $.ajax({
        type: "POST",
        url: "includes/cp_update.php",
        data: {
          rera_file: enq_rera_file,
          cp_id: cp_id,
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
  //////////////////////rera_file End//////////////////////////////

  //////////////////////adhaar_number Start//////////////////////////////
  $("#aadh_edit").on("click", function () {
    $("#adhaar_number").children("[readonly]").toggle();
    $("#adhaar_number").removeAttr("readonly");
    $("#adhaar_number").focus();

    $("#aadh_edit").hide();
    $("#aadh_save").show();
  });

  $("#aadh_save").on("click", function () {
    // $('#adhaar_number').attr('readonly', 'readonly');

    var enq_adhaar_number = $("#adhaar_number").val();

    // alert("enqadhaar_number" + enqadhaar_number + "leadid" + cp_id + "user" + a_user);

    if (enq_adhaar_number != "<?php echo $adhaar_number; ?>") {
      $.ajax({
        type: "POST",
        url: "includes/cp_update.php",
        data: {
          adhaar_number: enq_adhaar_number,
          cp_id: cp_id,
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
  //////////////////////adhaar_number End//////////////////////////////

  //////////////////////adhaar_file Start//////////////////////////////

  $("#ad_file").show();
  $("#adhaar_file").hide();

  $("#aadhf_edit").on("click", function () {
    $("#ad_file").hide();
    $("#adhaar_file").show();

    $("#adhaar_file").focus();

    $("#aadhf_edit").hide();
    $("#aadhf_save").show();
  });

  $("#aadhf_edit").on("click", function () {
    // $('#adhaar_file').attr('readonly', 'readonly');

    var enq_adhaar_file = $("#adhaar_file").val();

    // alert("enqadhaar_file" + enqadhaar_file + "leadid" + cp_id + "user" + a_user);

    if (enq_adhaar_file != "<?php echo $adhaar_file; ?>") {
      $.ajax({
        type: "POST",
        url: "includes/cp_update.php",
        data: {
          adhaar_file: enq_adhaar_file,
          cp_id: cp_id,
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
  //////////////////////adhaar_file End//////////////////////////////

  //////////////////////ccq_file Start//////////////////////////////
  $("#evv_edit").on("click", function () {
    $("#ccq_file").children("[readonly]").toggle();
    $("#ccq_file").removeAttr("readonly");
    $("#ccq_file").focus();

    $("#evv_edit").hide();
    $("#evv_save").show();
  });

  $("#evv_save").on("click", function () {
    // $('#ccq_file').attr('readonly', 'readonly');

    var enq_ccq_file = $("#ccq_file").val();

    // alert("enqccq_file" + enqccq_file + "leadid" + cp_id + "user" + a_user);

    if (enq_ccq_file != "<?php echo $ccq_file; ?>") {
      $.ajax({
        type: "POST",
        url: "includes/cp_update.php",
        data: {
          ccq_file: enq_ccq_file,
          cp_id: cp_id,
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
  //////////////////////ccq_file End//////////////////////////////

  //////////////////////reg_address Start//////////////////////////////
  $("#rega_edit").on("click", function () {
    $("#reg_address").children("[readonly]").toggle();
    $("#reg_address").removeAttr("readonly");
    $("#reg_address").focus();

    $("#rega_edit").hide();
    $("#rega_save").show();
  });

  $("#rega_save").on("click", function () {
    // $('#reg_address').attr('readonly', 'readonly');

    var enq_reg_address = $("#reg_address").val();

    // alert("enqreg_address" + enqreg_address + "leadid" + cp_id + "user" + a_user);

    if (enq_reg_address != "<?php echo $reg_address; ?>") {
      $.ajax({
        type: "POST",
        url: "includes/cp_update.php",
        data: {
          reg_address: enq_reg_address,
          cp_id: cp_id,
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
  //////////////////////reg_address End//////////////////////////////

  //////////////////////com_address Start//////////////////////////////
  $("#coma_edit").on("click", function () {
    $("#com_address").children("[readonly]").toggle();
    $("#com_address").removeAttr("readonly");
    $("#com_address").focus();

    $("#coma_edit").hide();
    $("#coma_save").show();
  });

  $("#coma_save").on("click", function () {
    // $('#com_address').attr('readonly', 'readonly');

    var enq_com_address = $("#com_address").val();

    // alert("enqcom_address" + enqcom_address + "leadid" + cp_id + "user" + a_user);

    if (enq_com_address != "<?php echo $com_address; ?>") {
      $.ajax({
        type: "POST",
        url: "includes/cp_update.php",
        data: {
          com_address: enq_com_address,
          cp_id: cp_id,
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
  //////////////////////com_address End//////////////////////////////

  //////////////////////cp_message Start//////////////////////////////
  $("#mes_edit").on("click", function () {
    $("#cp_message").children("[readonly]").toggle();
    $("#cp_message").removeAttr("readonly");
    $("#cp_message").focus();

    $("#mes_edit").hide();
    $("#mes_save").show();
  });

  $("#mes_save").on("click", function () {
    // $('#cp_message').attr('readonly', 'readonly');

    var enq_cp_message = $("#cp_message").val();

    // alert("enqcp_message" + enqcp_message + "leadid" + cp_id + "user" + a_user);

    if (enq_cp_message != "<?php echo $cp_message; ?>") {
      $.ajax({
        type: "POST",
        url: "includes/cp_update.php",
        data: {
          cp_message: enq_cp_message,
          cp_id: cp_id,
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
  //////////////////////cp_message End//////////////////////////////

  //////////////////////web_url Start//////////////////////////////
  $("#web_edit").on("click", function () {
    $("#web_url").children("[readonly]").toggle();
    $("#web_url").removeAttr("readonly");
    $("#web_url").focus();

    $("#web_edit").hide();
    $("#web_save").show();
  });

  $("#web_save").on("click", function () {
    // $('#web_url').attr('readonly', 'readonly');

    var enq_web_url = $("#web_url").val();

    // alert("enqweb_url" + enqweb_url + "leadid" + cp_id + "user" + a_user);

    if (enq_web_url != "<?php echo $web_url; ?>") {
      $.ajax({
        type: "POST",
        url: "includes/cp_update.php",
        data: {
          web_url: enq_web_url,
          cp_id: cp_id,
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
  //////////////////////web_url End//////////////////////////////

  //////////////////////bank_name Start//////////////////////////////
  $("#bank_edit").on("click", function () {
    $("#bank_name").children("[readonly]").toggle();
    $("#bank_name").removeAttr("readonly");
    $("#bank_name").focus();

    $("#bank_edit").hide();
    $("#bank_save").show();
  });

  $("#bank_save").on("click", function () {
    // $('#bank_name').attr('readonly', 'readonly');

    var enq_bank_name = $("#bank_name").val();

    // alert("enqbank_name" + enqbank_name + "leadid" + cp_id + "user" + a_user);

    if (enq_bank_name != "<?php echo $bank_name; ?>") {
      $.ajax({
        type: "POST",
        url: "includes/cp_update.php",
        data: {
          bank_name: enq_bank_name,
          cp_id: cp_id,
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
  //////////////////////bank_name End//////////////////////////////

  //////////////////////bank_account Start//////////////////////////////
  $("#banka_edit").on("click", function () {
    $("#bank_account").children("[readonly]").toggle();
    $("#bank_account").removeAttr("readonly");
    $("#bank_account").focus();

    $("#banka_edit").hide();
    $("#banka_save").show();
  });

  $("#banka_save").on("click", function () {
    // $('#bank_account').attr('readonly', 'readonly');

    var enq_bank_account = $("#bank_account").val();

    // alert("enqbank_account" + enqbank_account + "leadid" + cp_id + "user" + a_user);

    if (enq_bank_account != "<?php echo $s_project; ?>") {
      $.ajax({
        type: "POST",
        url: "includes/cp_update.php",
        data: {
          bank_account: enq_bank_account,
          cp_id: cp_id,
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
  //////////////////////bank_account End//////////////////////////////

  //////////////////////beneficiary_name Start//////////////////////////////
  $("#bene_edit").on("click", function () {
    $("#beneficiary_name").children("[readonly]").toggle();
    $("#beneficiary_name").removeAttr("readonly");
    $("#beneficiary_name").focus();

    $("#bene_edit").hide();
    $("#bene_save").show();
  });

  $("#bene_save").on("click", function () {
    // $('#beneficiary_name').attr('readonly', 'readonly');

    var enq_beneficiary_name = $("#beneficiary_name").val();

    // alert("enqbeneficiary_name" + enqbeneficiary_name + "leadid" + cp_id + "user" + a_user);

    if (enq_beneficiary_name != "<?php echo $beneficiary_name; ?>") {
      $.ajax({
        type: "POST",
        url: "includes/cp_update.php",
        data: {
          beneficiary_name: enq_beneficiary_name,
          cp_id: cp_id,
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
  //////////////////////beneficiary_name End//////////////////////////////

  //////////////////////ifsc_code Start//////////////////////////////
  $("#ifsc_edit").on("click", function () {
    $("#ifsc_code").children("[readonly]").toggle();
    $("#ifsc_code").removeAttr("readonly");
    $("#ifsc_code").focus();

    $("#ifsc_edit").hide();
    $("#ifsc_save").show();
  });

  $("#ifsc_save").on("click", function () {
    // $('#ifsc_code').attr('readonly', 'readonly');

    var enq_ifsc_code = $("#ifsc_code").val();

    // alert("enqifsc_code" + enqifsc_code + "leadid" + cp_id + "user" + a_user);

    if (enq_ifsc_code != "<?php echo $ifsc_code; ?>") {
      $.ajax({
        type: "POST",
        url: "includes/cp_update.php",
        data: {
          ifsc_code: enq_ifsc_code,
          cp_id: cp_id,
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
  //////////////////////ifsc_code End//////////////////////////////

  //////////////////////cp_status Start//////////////////////////////
  $("#erd_edit").on("click", function () {
    $("#cp_status").children("[readonly]").toggle();
    $("#cp_status").removeAttr("readonly");
    $("#cp_status").focus();

    $("#erd_edit").hide();
    $("#erd_save").show();
  });

  $("#erd_save").on("click", function () {
    // $('#cp_status').attr('readonly', 'readonly');

    var enq_cp_status = $("#cp_status").val();

    // alert("enqcp_status" + enqcp_status + "leadid" + cp_id + "user" + a_user);

    if (enq_cp_status != "<?php echo $cp_status; ?>") {
      $.ajax({
        type: "POST",
        url: "includes/cp_update.php",
        data: {
          cp_status: enq_cp_status,
          cp_id: cp_id,
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
  //////////////////////cp_status End//////////////////////////////
});
