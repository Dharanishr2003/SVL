
$(document).ready(function() {
    var cappid = $('#co_applicant_id').val();
    var appid = $('#applicant_id').val();
    var oppid = $('#opp_id').val();
    var a_user = $('#a_user').val();

   

    
    //////////////////////sele_unit Start//////////////////////////////

    $('#su_edit').on('click', function() {
        $('#sele_unit').children('[readonly]').toggle();
        $('#sele_unit').removeAttr('readonly');
        $('#sele_unit').focus();

        $('#su_edit').hide();
        $('#su_save').show();
        // alert('clc');
    });

    $('#su_save').on('click', function() {

        // $('#leadowner').attr('readonly', 'readonly');


        var opp_sele_unit = $('#sele_unit').val();

        //  alert("sele_unit" +  opp_sele_unit + "opp_id" + oppid + "user" + a_user);

        if (opp_sele_unit != "<?php echo $sele_unit; ?>") {

            $.ajax({
                type: "POST",
                url: "includes/opp_update.php",
                data: {
                    sele_unit: opp_sele_unit,
                    opportunity_id: oppid,
                    a_user: a_user
                },
                cache: false,
                success: function(data) {
                    //console.log(data);
                    // alert(data);

                    location.reload();
                },
                error: function(xhr, status, error) {
                    console.error(xhr);
                }
            });


        } else {
            location.reload();

        }




    });
    // ///////////////////sele_unit end/////////////////////////


   
 //////////////////////Unit Type Start//////////////////////////////


    $('#opp_ut').show();
    $('#unit_type').hide();

    $('#ut_edit').on('click', function() {
        $('#opp_ut').hide();
        $('#unit_type').show();

        $('#unit_type').focus();

        $('#ut_edit').hide();
        $('#ut_save').show();
    });




    $('#ut_save').on('click', function() {

        var opp_unit_type = $('#unit_type').val();

        if (opp_unit_type != "<?php echo $unit_type; ?>") {

            $.ajax({
                type: "POST",
                url: "includes/opp_update.php",
                data: {
                    unit_type: opp_unit_type,
                    opportunity_id: oppid,
                    a_user: a_user
                },
                cache: false,
                success: function(data) {
                    //console.log(data);
                    // alert(data);

                    location.reload();
                },
                error: function(xhr, status, error) {
                    console.error(xhr);
                }
            });


        } else {
            location.reload();

        }




    });
    //////////////////////Unit Type End//////////////////////////////

    //////////////////////booking_date Start//////////////////////////////

    $('#bdat_edit').on('click', function() {
        $('#booking_date').children('[readonly]').toggle();
        $('#booking_date').removeAttr('readonly');
        $('#booking_date').focus();

        $('#bdat_edit').hide();
        $('#bdat_save').show();
    });

    $('#bdat_save').on('click', function() {

        // $('#leadowner').attr('readonly', 'readonly');


        var opp_booking_date = $('#booking_date').val();

        // alert("booking_date" + booking_date + "leadid" + enqid + "user" + a_user);

        if (opp_booking_date != "<?php echo $booking_date; ?>") {

            $.ajax({
                type: "POST",
                url: "includes/opp_update.php",
                data: {
                    booking_date: opp_booking_date,
                    opportunity_id: oppid,
                    a_user: a_user
                },
                cache: false,
                success: function(data) {
                    //console.log(data);
                    // alert(data);

                    location.reload();
                },
                error: function(xhr, status, error) {
                    console.error(xhr);
                }
            });


        } else {
            location.reload();

        }




    });
    // ///////////////////booking_date end/////////////////////////


    //////////////////////booking_det Start//////////////////////////////




    $('#bdet_edit').on('click', function() {
        $('#booking_det').children('[readonly]').toggle();
        $('#booking_det').removeAttr('readonly');
        $('#booking_det').focus();

        $('#bdet_edit').hide();
        $('#bdet_save').show();
    });

    $('#bdet_save').on('click', function() {

        var opp_booking_det = $('#booking_det').val();

        if (opp_booking_det != "<?php echo $booking_det; ?>") {

            $.ajax({
                type: "POST",
                url: "includes/opp_update.php",
                data: {
                    booking_det: opp_booking_det,
                    opportunity_id: oppid,
                    a_user: a_user
                },
                cache: false,
                success: function(data) {
                    //console.log(data);
                    // alert(data);

                    location.reload();
                },
                error: function(xhr, status, error) {
                    console.error(xhr);
                }
            });


        } else {
            location.reload();

        }




    });
    //////////////////////Booking Details End//////////////////////////////

    //////////////////////booking_amount Start//////////////////////////////

    $('#ba_edit').on('click', function() {
        $('#booking_amount').children('[readonly]').toggle();
        $('#booking_amount').removeAttr('readonly');
        $('#booking_amount').focus();

        $('#ba_edit').hide();
        $('#ba_save').show();
    });

    $('#ba_save').on('click', function() {

        // $('#leadowner').attr('readonly', 'readonly');


        var opp_booking_amount = $('#booking_amount').val();

        // alert("booking_amount" + booking_amount + "leadid" + enqid + "user" + a_user);

        if (opp_booking_amount != "<?php echo $booking_amount; ?>") {

            $.ajax({
                type: "POST",
                url: "includes/opp_update.php",
                data: {
                    booking_amount: opp_booking_amount,
                    opportunity_id: oppid,
                    a_user: a_user
                },
                cache: false,
                success: function(data) {
                    //console.log(data);
                    // alert(data);

                    location.reload();
                },
                error: function(xhr, status, error) {
                    console.error(xhr);
                }
            });


        } else {
            location.reload();

        }




    });
    // ///////////////////booking_amount end/////////////////////////


    //////////////////////ba_status Start//////////////////////////////



    $('#opp_bas').show();
    $('#ba_status').hide();

    $('#bas_edit').on('click', function() {
        $('#opp_bas').hide();
        $('#ba_status').show();
        $('#ba_status').focus();

        $('#bas_edit').hide();
        $('#bas_save').show();
    });

    $('#bas_save').on('click', function() {

        var opp_ba_status = $('#ba_status').val();

        if (opp_ba_status != "<?php echo $ba_status; ?>") {

            $.ajax({
                type: "POST",
                url: "includes/opp_update.php",
                data: {
                    ba_status: opp_ba_status,
                    opportunity_id: oppid,
                    a_user: a_user
                },
                cache: false,
                success: function(data) {
                    //console.log(data);
                    // alert(data);

                    location.reload();
                },
                error: function(xhr, status, error) {
                    console.error(xhr);
                }
            });


        } else {
            location.reload();

        }




    });
    //////////////////////ba_status End//////////////////////////////

    //////////////////////bd_date Start//////////////////////////////

    $('#bdd_edit').on('click', function() {
        $('#bd_date').children('[readonly]').toggle();
        $('#bd_date').removeAttr('readonly');
        $('#bd_date').focus();

        $('#bdd_edit').hide();
        $('#bdd_save').show();
    });

    $('#bdd_save').on('click', function() {

        // $('#leadowner').attr('readonly', 'readonly');


        var opp_bd_date = $('#bd_date').val();

        // alert("bd_date" + bd_date + "leadid" + enqid + "user" + a_user);

        if (opp_bd_date != "<?php echo $bd_date; ?>") {

            $.ajax({
                type: "POST",
                url: "includes/opp_update.php",
                data: {
                    bd_date: opp_bd_date,
                    opportunity_id: oppid,
                    a_user: a_user
                },
                cache: false,
                success: function(data) {
                    //console.log(data);
                    // alert(data);

                    location.reload();
                },
                error: function(xhr, status, error) {
                    console.error(xhr);
                }
            });


        } else {
            location.reload();

        }




    });
    // ///////////////////bd_date end/////////////////////////

    //////////////////////comments Start//////////////////////////////

    $('#oc_edit').on('click', function() {
        $('#comments').children('[readonly]').toggle();
        $('#comments').removeAttr('readonly');
        $('#comments').focus();

        $('#oc_edit').hide();
        $('#oc_save').show();
    });

    $('#oc_save').on('click', function() {

        // $('#leadowner').attr('readonly', 'readonly');


        var opp_comments = $('#comments').val();

        // alert("comments" + comments + "leadid" + enqid + "user" + a_user);

        if (opp_comments != "<?php echo $comments; ?>") {

            $.ajax({
                type: "POST",
                url: "includes/opp_update.php",
                data: {
                    comments: opp_comments,
                    opportunity_id: oppid,
                    a_user: a_user
                },
                cache: false,
                success: function(data) {
                    //console.log(data);
                    // alert(data);

                    location.reload();
                },
                error: function(xhr, status, error) {
                    console.error(xhr);
                }
            });


        } else {
            location.reload();

        }




    });
    // ///////////////////comments end/////////////////////////


    //////////////////////report_manager Start//////////////////////////////




    $('#orm_edit').on('click', function() {
        $('#report_manager').children('[readonly]').toggle();
        $('#report_manager').removeAttr('readonly');
        $('#report_manager').focus();

        $('#orm_edit').hide();
        $('#orm_save').show();
    });

    $('#orm_save').on('click', function() {

        var opp_report_manager = $('#report_manager').val();

        if (opp_report_manager != "<?php echo $report_manager; ?>") {

            $.ajax({
                type: "POST",
                url: "includes/opp_update.php",
                data: {
                    report_manager: opp_report_manager,
                    opportunity_id: oppid,
                    a_user: a_user
                },
                cache: false,
                success: function(data) {
                    //console.log(data);
                    // alert(data);

                    location.reload();
                },
                error: function(xhr, status, error) {
                    console.error(xhr);
                }
            });


        } else {
            location.reload();

        }




    });
    //////////////////////report_manager End//////////////////////////////

    //////////////////////cp_commission Start//////////////////////////////

    $('#ocpc_edit').on('click', function() {
        $('#cp_commission').children('[readonly]').toggle();
        $('#cp_commission').removeAttr('readonly');
        $('#cp_commission').focus();

        $('#ocpc_edit').hide();
        $('#ocpc_save').show();
    });

    $('#ocpc_save').on('click', function() {

        // $('#leadowner').attr('readonly', 'readonly');


        var opp_cp_commission = $('#cp_commission').val();

        // alert("cp_commission" + cp_commission + "leadid" + enqid + "user" + a_user);

        if (opp_cp_commission != "<?php echo $cp_commission; ?>") {

            $.ajax({
                type: "POST",
                url: "includes/opp_update.php",
                data: {
                    cp_commission: opp_cp_commission,
                    opportunity_id: oppid,
                    a_user: a_user
                },
                cache: false,
                success: function(data) {
                    //console.log(data);
                    // alert(data);

                    location.reload();
                },
                error: function(xhr, status, error) {
                    console.error(xhr);
                }
            });


        } else {
            location.reload();

        }




    });
    // ///////////////////cp_commission end/////////////////////////

    //////////////////////approval_stage Start//////////////////////////////

    $('#oas_edit').on('click', function() {
        $('#approval_stage').children('[readonly]').toggle();
        $('#approval_stage').removeAttr('readonly');
        $('#approval_stage').focus();

        $('#oas_edit').hide();
        $('#oas_save').show();
    });

    $('#oas_save').on('click', function() {

        // $('#leadowner').attr('readonly', 'readonly');


        var opp_approval_stage = $('#approval_stage').val();

        // alert("approval_stage" + approval_stage + "leadid" + enqid + "user" + a_user);

        if (opp_approval_stage != "<?php echo $approval_stage; ?>") {

            $.ajax({
                type: "POST",
                url: "includes/opp_update.php",
                data: {
                    approval_stage: opp_approval_stage,
                    opportunity_id: oppid,
                    a_user: a_user
                },
                cache: false,
                success: function(data) {
                    //console.log(data);
                    // alert(data);

                    location.reload();
                },
                error: function(xhr, status, error) {
                    console.error(xhr);
                }
            });


        } else {
            location.reload();

        }




    });
    // ///////////////////approval_stage end/////////////////////////

    //////////////////////as_date Start//////////////////////////////

    $('#oasd_edit').on('click', function() {
        $('#as_date').children('[readonly]').toggle();
        $('#as_date').removeAttr('readonly');
        $('#as_date').focus();

        $('#oasd_edit').hide();
        $('#oasd_save').show();
    });

    $('#oasd_save').on('click', function() {

        // $('#leadowner').attr('readonly', 'readonly');


        var opp_as_date = $('#as_date').val();

        // alert("as_date" + as_date + "leadid" + enqid + "user" + a_user);

        if (opp_as_date != "<?php echo $as_date; ?>") {

            $.ajax({
                type: "POST",
                url: "includes/opp_update.php",
                data: {
                    as_date: opp_as_date,
                    opportunity_id: oppid,
                    a_user: a_user
                },
                cache: false,
                success: function(data) {
                    //console.log(data);
                    // alert(data);

                    location.reload();
                },
                error: function(xhr, status, error) {
                    console.error(xhr);
                }
            });


        } else {
            location.reload();

        }




    });
    // ///////////////////as_date end/////////////////////////



    //////////////////////invoice_date  Start//////////////////////////////

    $('#oigd_edit').on('click', function() {
        $('#opp_invoice_date ').children('[readonly]').toggle();
        $('#opp_invoice_date ').removeAttr('readonly');
        $('#opp_invoice_date ').focus();

        $('#oigd_edit').hide();
        $('#oigd_save').show();
    });

    $('#oigd_save').on('click', function() {

        // $('#leadowner').attr('readonly', 'readonly');


        var opp_invoice_date = $('#opp_invoice_date').val();
        //alert(opp_invoice_date);

        // alert("invoice_date " + invoice_date  + "leadid" + enqid + "user" + a_user);

        if (opp_invoice_date != "<?php echo $invoice_date; ?>") {

            $.ajax({
                type: "POST",
                url: "includes/opp_update.php",
                data: {
                    invoice_date: opp_invoice_date,
                    opportunity_id: oppid,
                    a_user: a_user
                },
                cache: false,
                success: function(data) {
                    // console.log(data);
                    // alert(data);

                    location.reload();
                },
                error: function(xhr, status, error) {
                    console.error(xhr);
                }
            });


        } else {
            location.reload();

        }




    });
    // ///////////////////invoice_date  end/////////////////////////

    //////////////////////asig_date  Start//////////////////////////////

    $('#oasid_edit').on('click', function() {
        $('#asig_date ').children('[readonly]').toggle();
        $('#asig_date ').removeAttr('readonly');
        $('#asig_date ').focus();

        $('#oasid_edit').hide();
        $('#oasid_save').show();
    });

    $('#oasid_save').on('click', function() {

        // $('#leadowner').attr('readonly', 'readonly');


        var opp_asig_date = $('#asig_date').val();

        // alert("asig_date " + asig_date  + "leadid" + enqid + "user" + a_user);

        if (opp_asig_date != "<?php echo $asig_date; ?>") {

            $.ajax({
                type: "POST",
                url: "includes/opp_update.php",
                data: {
                    asig_date: opp_asig_date,
                    opportunity_id: oppid,
                    a_user: a_user
                },
                cache: false,
                success: function(data) {
                    //console.log(data);
                    // alert(data);

                    location.reload();
                },
                error: function(xhr, status, error) {
                    console.error(xhr);
                }
            });


        } else {
            location.reload();

        }




    });
    // ///////////////////asig_date  end/////////////////////////

    //////////////////////asched_date  Start//////////////////////////////

    $('#oascd_edit').on('click', function() {
        $('#asched_date ').children('[readonly]').toggle();
        $('#asched_date ').removeAttr('readonly');
        $('#asched_date ').focus();

        $('#oascd_edit').hide();
        $('#oascd_save').show();
    });

    $('#oascd_save').on('click', function() {

        // $('#leadowner').attr('readonly', 'readonly');


        var opp_asched_date = $('#asched_date ').val();

        // alert("asched_date " + asched_date  + "leadid" + enqid + "user" + a_user);

        if (opp_asched_date != "<?php echo $asched_date; ?>") {

            $.ajax({
                type: "POST",
                url: "includes/opp_update.php",
                data: {
                    asched_date: opp_asched_date,
                    opportunity_id: oppid,
                    a_user: a_user
                },
                cache: false,
                success: function(data) {
                    //console.log(data);
                    // alert(data);

                    location.reload();
                },
                error: function(xhr, status, error) {
                    console.error(xhr);
                }
            });


        } else {
            location.reload();

        }




    });
    // ///////////////////asched_date  end/////////////////////////

    //////////////////////agreement_copy Start//////////////////////////////

    $('#sagr_copy').show();
    $('#sagreement_copy').hide();
    $('#oacy_edit').on('click', function() {
        $('#sagreement_copy').children('[disabled]').toggle();
        $('#sagreement_copy').removeAttr('disabled');
        $('#sagreement_copy').focus();
        $('#sagr_copy').hide();
        $('#sagreement_copy').show();
        $('#oacy_edit').hide();
        $('#oacy_save').show();
    });

    $('#oacy_save').on('click', function() {

    // $('#leadowner').attr('readonly', 'readonly');


    var opp_agreement_copy = $('#sagreement_copy').val();

    // alert("agreement_copy" + agreement_copy + "leadid" + enqid + "user" + a_user);

    if (opp_agreement_copy != "<?php echo $agreement_copy; ?>") {

        $.ajax({
            type: "POST",
            url: "includes/opp_update.php",
            data: {
                agreement_copy: opp_agreement_copy,
                opportunity_id: oppid,
                a_user: a_user
            },
            cache: false,
            success: function(data) {
    // console.log(data);
    // alert(data);

                    location.reload();
                },
                error: function(xhr, status, error) {
                    console.error(xhr);
                }
            });


        } else {
            location.reload();

        }




    });
    // ///////////////////agreement_copy end/////////////////////////

    //////////////////////as_comments Start//////////////////////////////

    $('#oasc_edit').on('click', function() {
        $('#as_comments').children('[readonly]').toggle();
        $('#as_comments').removeAttr('readonly');
        $('#as_comments').focus();

        $('#oasc_edit').hide();
        $('#oasc_save').show();
    });

    $('#oasc_save').on('click', function() {

        // $('#leadowner').attr('readonly', 'readonly');


        var opp_as_comments = $('#as_comments').val();

        // alert("as_comments" + as_comments + "leadid" + enqid + "user" + a_user);

        if (opp_as_comments != "<?php echo $as_comments; ?>") {

            $.ajax({
                type: "POST",
                url: "includes/opp_update.php",
                data: {
                    as_comments: opp_as_comments,
                    opportunity_id: oppid,
                    a_user: a_user
                },
                cache: false,
                success: function(data) {
                    //console.log(data);
                    // alert(data);

                    location.reload();
                },
                error: function(xhr, status, error) {
                    console.error(xhr);
                }
            });


        } else {
            location.reload();

        }




    });
    // ///////////////////as_comments end/////////////////////////



    //////////////////////invoice_date Start//////////////////////////////

    $('#oadd_edit').on('click', function() {
        $('#ad_date').children('[readonly]').toggle();
        $('#ad_date').removeAttr('readonly');
        $('#ad_date').focus();

        $('#oadd_edit').hide();
        $('#oadd_save').show();
    });

    $('#oadd_save').on('click', function() {

        // $('#leadowner').attr('readonly', 'readonly');


        var ad_date = $('#ad_date').val();
        //alert(ad_date);

        // alert("invoice_date " + invoice_date + "leadid" + enqid + "user" + a_user);

        if (ad_date != "<?php echo $invoice_date; ?>") {

            $.ajax({
                type: "POST",
                url: "includes/opp_update.php",
                data: {
                    invoice_date: ad_date,
                    opportunity_id: oppid,
                    a_user: a_user
                },
                cache: false,
                success: function(data) {
                    // console.log(data);
                    // alert(data);

                    location.reload();
                },
                error: function(xhr, status, error) {
                    console.error(xhr);
                }
            });


        } else {
            location.reload();

        }




    });
    // ///////////////////invoice_date end/////////////////////////

    //////////////////////agr_percentage Start//////////////////////////////

    $('#oap_edit').on('click', function() {
        $('#agr_percentage').children('[readonly]').toggle();
        $('#agr_percentage').removeAttr('readonly');
        $('#agr_percentage').focus();

        $('#oap_edit').hide();
        $('#oap_save').show();
    });

    $('#oap_save').on('click', function() {

        // $('#leadowner').attr('readonly', 'readonly');


        var opp_agr_percentage = $('#agr_percentage').val();

        // alert("agr_percentage " + agr_percentage + "leadid" + enqid + "user" + a_user);

        if (opp_agr_percentage != "<?php echo $agr_percentage; ?>") {

            $.ajax({
                type: "POST",
                url: "includes/opp_update.php",
                data: {
                    agr_percentage: opp_agr_percentage,
                    opportunity_id: oppid,
                    a_user: a_user
                },
                cache: false,
                success: function(data) {
                    //console.log(data);
                    // alert(data);

                    location.reload();
                },
                error: function(xhr, status, error) {
                    console.error(xhr);
                }
            });


        } else {
            location.reload();

        }




    });
    // ///////////////////agr_percentage end/////////////////////////

    //////////////////////ac_comments Start//////////////////////////////

    $('#oacc_edit').on('click', function() {
        $('#ac_comments').children('[readonly]').toggle();
        $('#ac_comments').removeAttr('readonly');
        $('#ac_comments').focus();

        $('#oacc_edit').hide();
        $('#oacc_save').show();
    });

    $('#oacc_save').on('click', function() {

        // $('#leadowner').attr('readonly', 'readonly');


        var opp_ac_comments = $('#ac_comments').val();

        // alert("ac_comments " + ac_comments + "leadid" + enqid + "user" + a_user);

        if (opp_ac_comments != "<?php echo $ac_comments; ?>") {

            $.ajax({
                type: "POST",
                url: "includes/opp_update.php",
                data: {
                    ac_comments: opp_ac_comments,
                    opportunity_id: oppid,
                    a_user: a_user
                },
                cache: false,
                success: function(data) {
                    //console.log(data);
                    // alert(data);

                    location.reload();
                },
                error: function(xhr, status, error) {
                    console.error(xhr);
                }
            });


        } else {
            location.reload();

        }




    });
    // ///////////////////ac_comments end/////////////////////////


    /////----------------------------------------------------------------------------Applicant Form Start-------------------------------------------------------------------------------/////


  

    


       //////////////////////fa_name Start//////////////////////////////

    $('#fan_edit').on('click', function() {
        $('#fa_name').children('[readonly]').toggle();
        $('#fa_name').removeAttr('readonly');
        $('#fa_name').focus();

        $('#fan_edit').hide();
        $('#fan_save').show();
    });

    $('#fan_save').on('click', function() {

        // $('#leadowner').attr('readonly', 'readonly');


        var opp_fa_name = $('#fa_name').val();

        // alert("fa_name" + fa_name + "leadid" + enqid + "user" + a_user);

        if (opp_fa_name != "<?php echo $fa_name; ?>") {

            $.ajax({
                type: "POST",
                url: "includes/opp_update.php",
                data: {
                    fa_name: opp_fa_name,
                    applicant_id: appid,
                    opportunity_id: oppid,
                    a_user: a_user
                },
                cache: false,
                success: function(data) {
                    //console.log(data);
                    // alert(data);

                    location.reload();
                },
                error: function(xhr, status, error) {
                    console.error(xhr);
                }
            });


        } else {
            location.reload();

        }




    });
    // ///////////////////fa_name end/////////////////////////

    //////////////////////fa_designation Start//////////////////////////////

    $('#fad_edit').on('click', function() {
        $('#fa_designation').children('[readonly]').toggle();
        $('#fa_designation').removeAttr('readonly');
        $('#fa_designation').focus();

        $('#fad_edit').hide();
        $('#fad_save').show();
    });

    $('#fad_save').on('click', function() {

        // $('#leadowner').attr('readonly', 'readonly');


        var opp_fa_designation = $('#fa_designation').val();

        // alert("fa_designation" + fa_designation + "leadid" + enqid + "user" + a_user);

        if (opp_fa_designation != "<?php echo $fa_designation; ?>") {

            $.ajax({
                type: "POST",
                url: "includes/opp_update.php",
                data: {
                    fa_designation: opp_fa_designation,
                    applicant_id: appid,
                    opportunity_id: oppid,
                    a_user: a_user
                },
                cache: false,
                success: function(data) {
                    //console.log(data);
                    // alert(data);

                    location.reload();
                },
                error: function(xhr, status, error) {
                    console.error(xhr);
                }
            });


        } else {
            location.reload();

        }




    });
    // ///////////////////fa_designation end/////////////////////////

    //////////////////////fa_dob Start//////////////////////////////

    $('#fadob_edit').on('click', function() {
        $('#fa_dob').children('[readonly]').toggle();
        $('#fa_dob').removeAttr('readonly');
        $('#fa_dob').focus();

        $('#fadob_edit').hide();
        $('#fadob_save').show();
    });

    $('#fadob_save').on('click', function() {

        // $('#leadowner').attr('readonly', 'readonly');


        var opp_fa_dob = $('#fa_dob').val();

        // alert("fa_dob" + fa_dob + "leadid" + enqid + "user" + a_user);

        if (opp_fa_dob != "<?php echo $fa_dob; ?>") {

            $.ajax({
                type: "POST",
                url: "includes/opp_update.php",
                data: {
                    fa_dob: opp_fa_dob,
                    applicant_id: appid,
                    opportunity_id: oppid,
                    a_user: a_user
                },
                cache: false,
                success: function(data) {
                    //console.log(data);
                    // alert(data);

                    location.reload();
                },
                error: function(xhr, status, error) {
                    console.error(xhr);
                }
            });


        } else {
            location.reload();

        }




    });
    // ///////////////////fa_dob end/////////////////////////

    //////////////////////ageof_applicant Start//////////////////////////////

    $('#aofa_edit').on('click', function() {
        $('#ageof_applicant').children('[readonly]').toggle();
        $('#ageof_applicant').removeAttr('readonly');
        $('#ageof_applicant').focus();

        $('#aofa_edit').hide();
        $('#aofa_save').show();
    });

    $('#aofa_save').on('click', function() {

        // $('#leadowner').attr('readonly', 'readonly');


        var opp_ageof_applicant = $('#ageof_applicant').val();

        // alert("ageof_applicant" + ageof_applicant + "leadid" + enqid + "user" + a_user);

        if (opp_ageof_applicant != "<?php echo $ageof_applicant; ?>") {

            $.ajax({
                type: "POST",
                url: "includes/opp_update.php",
                data: {
                    ageof_applicant: opp_ageof_applicant,
                    applicant_id: appid,
                    opportunity_id: oppid,
                    a_user: a_user
                },
                cache: false,
                success: function(data) {
                    //console.log(data);
                    // alert(data);

                    location.reload();
                },
                error: function(xhr, status, error) {
                    console.error(xhr);
                }
            });


        } else {
            location.reload();

        }




    });
    // ///////////////////ageof_applicant end/////////////////////////

    //////////////////////fa_company Start//////////////////////////////

    $('#fac_edit').on('click', function() {
        $('#fa_company').children('[readonly]').toggle();
        $('#fa_company').removeAttr('readonly');
        $('#fa_company').focus();

        $('#fac_edit').hide();
        $('#fac_save').show();
    });

    $('#fac_save').on('click', function() {

        // $('#leadowner').attr('readonly', 'readonly');


        var opp_fa_company = $('#fa_company').val();

        // alert("fa_company" + fa_company + "leadid" + enqid + "user" + a_user);

        if (opp_fa_company != "<?php echo $fa_company; ?>") {

            $.ajax({
                type: "POST",
                url: "includes/opp_update.php",
                data: {
                    fa_company: opp_fa_company,
                    applicant_id: appid,
                    opportunity_id: oppid,
                    a_user: a_user
                },
                cache: false,
                success: function(data) {
                    //console.log(data);
                    // alert(data);

                    location.reload();
                },
                error: function(xhr, status, error) {
                    console.error(xhr);
                }
            });


        } else {
            location.reload();

        }




    });
    // ///////////////////fa_company end/////////////////////////

    //////////////////////block_time Start//////////////////////////////

    $('#bt_edit').on('click', function() {
        $('#block_time').children('[readonly]').toggle();
        $('#block_time').removeAttr('readonly');
        $('#block_time').focus();

        $('#bt_edit').hide();
        $('#bt_save').show();
    });

    $('#bt_save').on('click', function() {

        // $('#leadowner').attr('readonly', 'readonly');


        var opp_block_time = $('#block_time').val();

        // alert("block_time" + block_time + "leadid" + enqid + "user" + a_user);

        if (opp_block_time != "<?php echo $block_time; ?>") {

            $.ajax({
                type: "POST",
                url: "includes/opp_update.php",
                data: {
                    block_time: opp_block_time,
                    applicant_id: appid,
                    opportunity_id: oppid,
                    a_user: a_user
                },
                cache: false,
                success: function(data) {
                    //console.log(data);
                    // alert(data);

                    location.reload();
                },
                error: function(xhr, status, error) {
                    console.error(xhr);
                }
            });


        } else {
            location.reload();

        }




    });
    // ///////////////////block_time end/////////////////////////

    //////////////////////marital_status Start//////////////////////////////
// $('#marital').show();
    // $('#marital_status').hide();
    $('#ms_edit').on('click', function() {
        $('#marital_status').children('[readonly]').toggle();
        $('#marital_status').removeAttr('readonly');
        $('#marital_status').focus();
        $('#marital').hide();
        $('#marital_status').show();
        $('#ms_edit').hide();
        $('#ms_save').show();

   
    });

    $('#ms_save').on('click', function() {

        // $('#leadowner').attr('readonly', 'readonly');


        var opp_marital_status = $('#marital_status').val();

        // alert("marital_status" + marital_status + "leadid" + enqid + "user" + a_user);

        if (opp_marital_status != "<?php echo $marital_status; ?>") {

            $.ajax({
                type: "POST",
                url: "includes/opp_update.php",
                data: {
                    marital_status: opp_marital_status,
                    applicant_id: appid,
                    opportunity_id: oppid,
                    a_user: a_user
                },
                cache: false,
                success: function(data) {
                    //console.log(data);
                    // alert(data);

                    location.reload();
                },
                error: function(xhr, status, error) {
                    console.error(xhr);
                }
            });


        } else {
            location.reload();

        }




    });
    // ///////////////////marital_status end/////////////////////////

    //////////////////////dof_anniversary Start//////////////////////////////

    $('#dofa_edit').on('click', function() {
        $('#dof_anniversary').children('[readonly]').toggle();
        $('#dof_anniversary').removeAttr('readonly');
        $('#dof_anniversary').focus();

        $('#dofa_edit').hide();
        $('#dofa_save').show();
    });

    $('#dofa_save').on('click', function() {

        // $('#leadowner').attr('readonly', 'readonly');


        var opp_dof_anniversary = $('#dof_anniversary').val();

        // alert("dof_anniversary" + dof_anniversary + "leadid" + enqid + "user" + a_user);

        if (opp_dof_anniversary != "<?php echo $dof_anniversary; ?>") {

            $.ajax({
                type: "POST",
                url: "includes/opp_update.php",
                data: {
                    dof_anniversary: opp_dof_anniversary,
                    applicant_id: appid,
                    opportunity_id: oppid,
                    a_user: a_user
                },
                cache: false,
                success: function(data) {
                    //console.log(data);
                    // alert(data);

                    location.reload();
                },
                error: function(xhr, status, error) {
                    console.error(xhr);
                }
            });


        } else {
            location.reload();

        }




    });
    // ///////////////////dof_anniversary end/////////////////////////
    //////////////////////purposeof_buying Start//////////////////////////////

    $('#pofb_edit').on('click', function() {
        $('#purposeof_buying').children('[readonly]').toggle();
        $('#purposeof_buying').removeAttr('readonly');
        $('#purposeof_buying').focus();

        $('#pofb_edit').hide();
        $('#pofb_save').show();
    });

    $('#pofb_save').on('click', function() {

        // $('#leadowner').attr('readonly', 'readonly');


        var opp_purposeof_buying = $('#purposeof_buying').val();

        // alert("purposeof_buying" + purposeof_buying + "leadid" + enqid + "user" + a_user);

        if (opp_purposeof_buying != "<?php echo $purposeof_buying; ?>") {

            $.ajax({
                type: "POST",
                url: "includes/opp_update.php",
                data: {
                    purposeof_buying: opp_purposeof_buying,
                    applicant_id: appid,
                    opportunity_id: oppid,
                    a_user: a_user
                },
                cache: false,
                success: function(data) {
                    //console.log(data);
                    // alert(data);

                    location.reload();
                },
                error: function(xhr, status, error) {
                    console.error(xhr);
                }
            });


        } else {
            location.reload();

        }




    });
    // ///////////////////purposeof_buying end/////////////////////////

    //////////////////////cpo_residence Start//////////////////////////////

    $('#cpr_edit').on('click', function() {
        $('#cpo_residence').children('[readonly]').toggle();
        $('#cpo_residence').removeAttr('readonly');
        $('#cpo_residence').focus();

        $('#cpr_edit').hide();
        $('#cpr_save').show();
    });

    $('#cpr_save').on('click', function() {

        // $('#leadowner').attr('readonly', 'readonly');


        var opp_cpo_residence = $('#cpo_residence').val();

        // alert("cpo_residence" + cpo_residence + "leadid" + enqid + "user" + a_user);

        if (opp_cpo_residence != "<?php echo $cpo_residence; ?>") {

            $.ajax({
                type: "POST",
                url: "includes/opp_update.php",
                data: {
                    cpo_residence: opp_cpo_residence,
                    applicant_id: appid,
                    opportunity_id: oppid,
                    a_user: a_user
                },
                cache: false,
                success: function(data) {
                    //console.log(data);
                    // alert(data);

                    location.reload();
                },
                error: function(xhr, status, error) {
                    console.error(xhr);
                }
            });


        } else {
            location.reload();

        }




    });
    // ///////////////////cpo_residence end/////////////////////////

    //////////////////////family_type Start//////////////////////////////
     


    // $('#family').hide();
    // $('#family_type').show();

    $('#ft_edit').on('click', function() {
        $('#family_type').children('[readonly]').toggle();
        $('#family_type').removeAttr('readonly');
        $('#family_type').focus();
        $('#family').hide();
        $('#family_type').show();
        $('#ft_edit').hide();
        $('#ft_save').show();
    });
    $('#ft_save').on('click', function() {

        // $('#leadowner').attr('readonly', 'readonly');


        var opp_family_type = $('#family_type').val();

        // alert("family_type" + family_type + "leadid" + enqid + "user" + a_user);

        if (opp_family_type != "<?php echo $family_type; ?>") {

            $.ajax({
                type: "POST",
                url: "includes/opp_update.php",
                data: {
                    family_type: opp_family_type,
                    applicant_id: appid,
                    opportunity_id: oppid,
                    a_user: a_user
                },
                cache: false,
                success: function(data) {
                    //console.log(data);
                    // alert(data);

                    location.reload();
                },
                error: function(xhr, status, error) {
                    console.error(xhr);
                }
            });


        } else {
            location.reload();

        }




    });
    // ///////////////////family_type end/////////////////////////


    //////////////////////children Start//////////////////////////////

    $('#c_edit').on('click', function() {
        $('#children').children('[readonly]').toggle();
        $('#children').removeAttr('readonly');
        $('#children').focus();

        $('#c_edit').hide();
        $('#c_save').show();
    });

    $('#c_save').on('click', function() {

        // $('#leadowner').attr('readonly', 'readonly');


        var opp_children = $('#children').val();

        // alert("children" + children + "leadid" + enqid + "user" + a_user);

        if (opp_children != "<?php echo $children; ?>") {

            $.ajax({
                type: "POST",
                url: "includes/opp_update.php",
                data: {
                    children: opp_children,
                    applicant_id: appid,
                    opportunity_id: oppid,
                    a_user: a_user
                },
                cache: false,
                success: function(data) {
                    //console.log(data);
                    // alert(data);

                    location.reload();
                },
                error: function(xhr, status, error) {
                    console.error(xhr);
                }
            });


        } else {
            location.reload();

        }




    });
    // ///////////////////children end/////////////////////////

    //////////////////////state Start//////////////////////////////

    $('#ste_edit').on('click', function() {
        $('#state').children('[readonly]').toggle();
        $('#state').removeAttr('readonly');
        $('#state').focus();

        $('#ste_edit').hide();
        $('#ste_save').show();
    });

    $('#ste_save').on('click', function() {

        // $('#leadowner').attr('readonly', 'readonly');


        var opp_state = $('#state').val();

        // alert("state" + state + "leadid" + enqid + "user" + a_user);

        if (opp_state != "<?php echo $state; ?>") {

            $.ajax({
                type: "POST",
                url: "includes/opp_update.php",
                data: {
                    state: opp_state,
                    applicant_id: appid,
                    opportunity_id: oppid,
                    a_user: a_user
                },
                cache: false,
                success: function(data) {
                    //console.log(data);
                    // alert(data);

                    location.reload();
                },
                error: function(xhr, status, error) {
                    console.error(xhr);
                }
            });


        } else {
            location.reload();

        }




    });
    // ///////////////////state end/////////////////////////



/////----------------------------------------------------------------------------Applicant Form End-------------------------------------------------------------------------------/////




    //////////////////////sfa_name Start//////////////////////////////

    $('#sfan_edit').on('click', function() {
        $('#sfa_name').children('[readonly]').toggle();
        $('#sfa_name').removeAttr('readonly');
        $('#sfa_name').focus();

        $('#sfan_edit').hide();
        $('#sfan_save').show();
    });

    $('#sfan_save').on('click', function() {

        // $('#leadowner').attr('readonly', 'readonly');


        var opp_sfa_name = $('#sfa_name').val();
        // var capp_tab  = $('#capp_tab').val();
        // alert("sfa_name" + sfa_name + "leadid" + enqid + "user" + a_user);

        if (opp_sfa_name != "<?php echo $sfa_name; ?>") {

            $.ajax({
                type: "POST",
                url: "includes/opp_update.php",
                data: {
                    sfa_name: opp_sfa_name,
                    co_applicant_id: cappid,
                    opportunity_id: oppid,
                    a_user: a_user
                },
                cache: false,
                success: function(data) {
                    //console.log(data);
                    // alert(data);

                    location.reload();
                    $("#app_tab").removeClass("active");
                    $("#capp_tab").addClass("active");

                    // $("#applicant").removeClass("active");
                    // $("#co_applicant").addClass("active");


                },
                error: function(xhr, status, error) {
                    console.error(xhr);
                }
            });


        } else {
            location.reload();



        }




    });
    // ///////////////////sfa_name end/////////////////////////


    //////////////////////sfa_designation Start//////////////////////////////

    $('#sfad_edit').on('click', function() {
        $('#sfa_designation').children('[readonly]').toggle();
        $('#sfa_designation').removeAttr('readonly');
        $('#sfa_designation').focus();

        $('#sfad_edit').hide();
        $('#sfad_save').show();
    });

    $('#sfad_save').on('click', function() {

        // $('#leadowner').attr('readonly', 'readonly');


        var opp_sfa_designation = $('#sfa_designation').val();

        // alert("sfa_designation" + sfa_designation + "leadid" + enqid + "user" + a_user);

        if (opp_sfa_designation != "<?php echo $sfa_designation; ?>") {

            $.ajax({
                type: "POST",
                url: "includes/opp_update.php",
                data: {
                    sfa_designation: opp_sfa_designation,
                    co_applicant_id: cappid,
                    opportunity_id: oppid,
                    a_user: a_user
                },
                cache: false,
                success: function(data) {
                    //console.log(data);
                    // alert(data);

                    location.reload();
                },
                error: function(xhr, status, error) {
                    console.error(xhr);
                }
            });


        } else {
            location.reload();

        }




    });
    // ///////////////////sfa_designation end/////////////////////////





    //////////////////////sfa_dob Start//////////////////////////////

    $('#sfadob_edit').on('click', function() {
        $('#sfa_dob').children('[readonly]').toggle();
        $('#sfa_dob').removeAttr('readonly');
        $('#sfa_dob').focus();

        $('#sfadob_edit').hide();
        $('#sfadob_save').show();
    });

    $('#sfadob_save').on('click', function() {

        // $('#leadowner').attr('readonly', 'readonly');


        var opp_sfa_dob = $('#sfa_dob').val();

        // alert("sfa_dob" + sfa_dob + "leadid" + enqid + "user" + a_user);

        if (opp_sfa_dob != "<?php echo $sfa_dob; ?>") {

            $.ajax({
                type: "POST",
                url: "includes/opp_update.php",
                data: {
                    sfa_dob: opp_sfa_dob,
                    co_applicant_id: cappid,
                    opportunity_id: oppid,
                    a_user: a_user
                },
                cache: false,
                success: function(data) {
                    //console.log(data);
                    // alert(data);

                    location.reload();
                },
                error: function(xhr, status, error) {
                    console.error(xhr);
                }
            });


        } else {
            location.reload();

        }




    });
    // ///////////////////sfa_dob end/////////////////////////

    //////////////////////sageof_applicant Start//////////////////////////////

    $('#saofa_edit').on('click', function() {
        $('#sageof_applicant').children('[readonly]').toggle();
        $('#sageof_applicant').removeAttr('readonly');
        $('#sageof_applicant').focus();

        $('#saofa_edit').hide();
        $('#saofa_save').show();
    });

    $('#saofa_save').on('click', function() {

        // $('#leadowner').attr('readonly', 'readonly');


        var opp_sageof_applicant = $('#sageof_applicant').val();

        // alert("sageof_applicant" + sageof_applicant + "leadid" + enqid + "user" + a_user);

        if (opp_sageof_applicant != "<?php echo $sageof_applicant; ?>") {

            $.ajax({
                type: "POST",
                url: "includes/opp_update.php",
                data: {
                    sageof_applicant: opp_sageof_applicant,
                    co_applicant_id: cappid,
                    opportunity_id: oppid,
                    a_user: a_user
                },
                cache: false,
                success: function(data) {
                    //console.log(data);
                    // alert(data);

                    location.reload();
                },
                error: function(xhr, status, error) {
                    console.error(xhr);
                }
            });


        } else {
            location.reload();

        }




    });
    // ///////////////////sageof_applicant end/////////////////////////

    //////////////////////sfa_company Start//////////////////////////////

    $('#sfac_edit').on('click', function() {
        $('#sfa_company').children('[readonly]').toggle();
        $('#sfa_company').removeAttr('readonly');
        $('#sfa_company').focus();

        $('#sfac_edit').hide();
        $('#sfac_save').show();
    });

    $('#sfac_save').on('click', function() {

        // $('#leadowner').attr('readonly', 'readonly');


        var opp_sfa_company = $('#sfa_company').val();

        // alert("sfa_company" + sfa_company + "leadid" + enqid + "user" + a_user);

        if (opp_sfa_company != "<?php echo $sfa_company; ?>") {

            $.ajax({
                type: "POST",
                url: "includes/opp_update.php",
                data: {
                    sfa_company: opp_sfa_company,
                    co_applicant_id: cappid,
                    opportunity_id: oppid,
                    a_user: a_user
                },
                cache: false,
                success: function(data) {
                    //console.log(data);
                    // alert(data);

                    location.reload();
                },
                error: function(xhr, status, error) {
                    console.error(xhr);
                }
            });


        } else {
            location.reload();

        }




    });
    // ///////////////////sfa_company end/////////////////////////

    //////////////////////sblock_time Start//////////////////////////////

    $('#sbt_edit').on('click', function() {
        $('#sblock_time').children('[readonly]').toggle();
        $('#sblock_time').removeAttr('readonly');
        $('#sblock_time').focus();

        $('#sbt_edit').hide();
        $('#sbt_save').show();
    });

    $('#sbt_save').on('click', function() {

        // $('#leadowner').attr('readonly', 'readonly');


        var opp_sblock_time = $('#sblock_time').val();

        // alert("sblock_time" + sblock_time + "leadid" + enqid + "user" + a_user);

        if (opp_sblock_time != "<?php echo $sblock_time; ?>") {

            $.ajax({
                type: "POST",
                url: "includes/opp_update.php",
                data: {
                    sblock_time: opp_sblock_time,
                    co_applicant_id: cappid,
                    opportunity_id: oppid,
                    a_user: a_user
                },
                cache: false,
                success: function(data) {
                    //console.log(data);
                    // alert(data);

                    location.reload();
                },
                error: function(xhr, status, error) {
                    console.error(xhr);
                }
            });


        } else {
            location.reload();

        }




    });
    // ///////////////////sblock_time end/////////////////////////

    //////////////////////smarital_status Start//////////////////////////////
    // $('#smarital').show();
    // $('#smarital_status').hide();
    $('#sms_edit').on('click', function() {
        $('#smarital_status').children('[readonly]').toggle();
        $('#smarital_status').removeAttr('readonly');
        $('#smarital_status').focus();
        $('#smarital').hide();
        $('#smarital_status').show();
        $('#sms_edit').hide();
        $('#sms_save').show();
    });

    $('#sms_save').on('click', function() {

        // $('#leadowner').attr('readonly', 'readonly');


        var opp_smarital_status = $('#smarital_status').val();

        // alert("smarital_status" + smarital_status + "leadid" + enqid + "user" + a_user);

        if (opp_smarital_status != "<?php echo $smarital_status; ?>") {

            $.ajax({
                type: "POST",
                url: "includes/opp_update.php",
                data: {
                    smarital_status: opp_smarital_status,
                    co_applicant_id: cappid,
                    opportunity_id: oppid,
                    a_user: a_user
                },
                cache: false,
                success: function(data) {
                    //console.log(data);
                    // alert(data);

                    location.reload();
                },
                error: function(xhr, status, error) {
                    console.error(xhr);
                }
            });


        } else {
            location.reload();

        }




    });
    // ///////////////////smarital_status end/////////////////////////

    //////////////////////sdof_anniversary Start//////////////////////////////

    $('#sdofa_edit').on('click', function() {
        $('#sdof_anniversary').children('[readonly]').toggle();
        $('#sdof_anniversary').removeAttr('readonly');
        $('#sdof_anniversary').focus();

        $('#sdofa_edit').hide();
        $('#sdofa_save').show();
    });

    $('#sdofa_save').on('click', function() {

        // $('#leadowner').attr('readonly', 'readonly');


        var opp_sdof_anniversary = $('#sdof_anniversary').val();

        // alert("sdof_anniversary" + sdof_anniversary + "leadid" + enqid + "user" + a_user);

        if (opp_sdof_anniversary != "<?php echo $sdof_anniversary; ?>") {

            $.ajax({
                type: "POST",
                url: "includes/opp_update.php",
                data: {
                    sdof_anniversary: opp_sdof_anniversary,
                    co_applicant_id: cappid,
                    opportunity_id: oppid,
                    a_user: a_user
                },
                cache: false,
                success: function(data) {
                    //console.log(data);
                    // alert(data);

                    location.reload();
                },
                error: function(xhr, status, error) {
                    console.error(xhr);
                }
            });


        } else {
            location.reload();

        }




    });
    // ///////////////////sdof_anniversary end/////////////////////////


    //////////////////////spurposeof_buying Start//////////////////////////////

    $('#spofb_edit').on('click', function() {
        $('#spurposeof_buying').children('[readonly]').toggle();
        $('#spurposeof_buying').removeAttr('readonly');
        $('#spurposeof_buying').focus();

        $('#spofb_edit').hide();
        $('#spofb_save').show();
    });

    $('#spofb_save').on('click', function() {

        // $('#leadowner').attr('readonly', 'readonly');


        var opp_spurposeof_buying = $('#spurposeof_buying').val();

        // alert("spurposeof_buying" + spurposeof_buying + "leadid" + enqid + "user" + a_user);

        if (opp_spurposeof_buying != "<?php echo $spurposeof_buying; ?>") {

            $.ajax({
                type: "POST",
                url: "includes/opp_update.php",
                data: {
                    spurposeof_buying: opp_spurposeof_buying,
                    co_applicant_id: cappid,
                    opportunity_id: oppid,
                    a_user: a_user
                },
                cache: false,
                success: function(data) {
                    //console.log(data);
                    // alert(data);

                    location.reload();
                },
                error: function(xhr, status, error) {
                    console.error(xhr);
                }
            });


        } else {
            location.reload();

        }




    });
    // ///////////////////spurposeof_buying end/////////////////////////

    //////////////////////scpo_residence Start//////////////////////////////

    $('#scpr_edit').on('click', function() {
        $('#scpo_residence').children('[readonly]').toggle();
        $('#scpo_residence').removeAttr('readonly');
        $('#scpo_residence').focus();

        $('#scpr_edit').hide();
        $('#scpr_save').show();
    });

    $('#scpr_save').on('click', function() {

        // $('#leadowner').attr('readonly', 'readonly');


        var opp_scpo_residence = $('#scpo_residence').val();

        // alert("scpo_residence" + scpo_residence + "leadid" + enqid + "user" + a_user);

        if (opp_scpo_residence != "<?php echo $scpo_residence; ?>") {

            $.ajax({
                type: "POST",
                url: "includes/opp_update.php",
                data: {
                    scpo_residence: opp_scpo_residence,
                    co_applicant_id: cappid,
                    opportunity_id: oppid,
                    a_user: a_user
                },
                cache: false,
                success: function(data) {
                    //console.log(data);
                    // alert(data);

                    location.reload();
                },
                error: function(xhr, status, error) {
                    console.error(xhr);
                }
            });


        } else {
            location.reload();

        }




    });
    // ///////////////////scpo_residence end/////////////////////////

    //////////////////////sfamily_type Start//////////////////////////////
    // $('#agr_stg').show();
   

    // $('#sfamily').show();
    // $('#sfamily_type').hide();

    $('#sft_edit').on('click', function() {
        $('#sfamily_type').children('[readonly]').toggle();
        $('#sfamily_type').removeAttr('readonly');
        $('#sfamily_type').focus();
        $('#sfamily').hide();
        $('#sfamily_type').show();
        $('#sft_edit').hide();
        $('#sft_save').show();
    });

    $('#sft_save').on('click', function() {

        // $('#leadowner').attr('readonly', 'readonly');


        var opp_sfamily_type = $('#sfamily_type').val();

        // alert("sfamily_type" + sfamily_type + "leadid" + enqid + "user" + a_user);

        if (opp_sfamily_type != "<?php echo $sfamily_type; ?>") {

            $.ajax({
                type: "POST",
                url: "includes/opp_update.php",
                data: {
                    sfamily_type: opp_sfamily_type,
                    co_applicant_id: cappid,
                    opportunity_id: oppid,
                    a_user: a_user
                },
                cache: false,
                success: function(data) {
                    //console.log(data);
                    // alert(data);

                    location.reload();
                },
                error: function(xhr, status, error) {
                    console.error(xhr);
                }
            });


        } else {
            location.reload();

        }




    });
    // ///////////////////sfamily_type end/////////////////////////


    //////////////////////schildren Start//////////////////////////////

    $('#sc_edit').on('click', function() {
        $('#schildren').children('[readonly]').toggle();
        $('#schildren').removeAttr('readonly');
        $('#schildren').focus();

        $('#sc_edit').hide();
        $('#sc_save').show();
    });

    $('#sc_save').on('click', function() {

        // $('#leadowner').attr('readonly', 'readonly');


        var opp_schildren = $('#schildren').val();

        // alert("children" + children + "leadid" + enqid + "user" + a_user);

        if (opp_schildren != "<?php echo $schildren; ?>") {

            $.ajax({
                type: "POST",
                url: "includes/opp_update.php",
                data: {
                    schildren: opp_schildren,
                    co_applicant_id: cappid,
                    opportunity_id: oppid,
                    a_user: a_user
                },
                cache: false,
                success: function(data) {
                    //console.log(data);
                    // alert(data);

                    location.reload();
                },
                error: function(xhr, status, error) {
                    console.error(xhr);
                }
            });


        } else {
            location.reload();

        }




    });
    // ///////////////////schildren end/////////////////////////

    //////////////////////sstate Start//////////////////////////////

    $('#ss_edit').on('click', function() {
        $('#sstate').children('[readonly]').toggle();
        $('#sstate').removeAttr('readonly');
        $('#sstate').focus();

        $('#ss_edit').hide();
        $('#ss_save').show();
    });

    $('#ss_save').on('click', function() {

        // $('#leadowner').attr('readonly', 'readonly');


        var opp_sstate = $('#sstate').val();

        // alert("sstate" + sstate + "leadid" + enqid + "user" + a_user);

        if (opp_sstate != "<?php echo $sstate; ?>") {

            $.ajax({
                type: "POST",
                url: "includes/opp_update.php",
                data: {
                    sstate: opp_sstate,
                    co_applicant_id: cappid,
                    opportunity_id: oppid,
                    a_user: a_user
                },
                cache: false,
                success: function(data) {
                    //console.log(data);
                    // alert(data);

                    location.reload();
                },
                error: function(xhr, status, error) {
                    console.error(xhr);
                }
            });


        } else {
            location.reload();

        }




    });

    ///sstate end////






    /////---------------------------------------Co Applicant End---------------------------------------------------///////////

});
