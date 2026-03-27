
function handleFormSubmission(formSelector, buttonSelector, url) {
    $(formSelector).submit(function (e) {
      e.preventDefault();  
      
      $(buttonSelector).attr("disabled", "disabled");
  
      // Enable disabled inputs temporarily for serialization
      var disabled = $(this).find(":input:disabled").removeAttr("disabled");
      var serialized = $(this).serialize();
      disabled.attr("disabled", "disabled");
  
      
      $.ajax({
        type: "POST",
        url: url,
        data: serialized,
      })
        .done(function (data) {
          console.log(data);
          location.reload(); 
        });
  
      return false;
    });
  }
  
  // Using the reusable function for multiple forms
  handleFormSubmission("#createleadsf", "#lead_submit", "includes/adminprocess.php");
  handleFormSubmission("#attempted_form", "#attempted_submit", "includes/adminprocess.php");
  handleFormSubmission("#rejected_form", "#rejected_submit", "includes/adminprocess.php");
  handleFormSubmission("#sitevisit_form", "#sitevisit_submit", "includes/adminprocess.php");
  handleFormSubmission("#re_sitevisit_form", "#re_sitevisit_submit", "includes/adminprocess.php");
  handleFormSubmission("#svconfirmed_form", "#svc_sumbit", "includes/adminprocess.php");
  handleFormSubmission("#svd_form", "#svd_sumbit", "includes/adminprocess.php");
  handleFormSubmission("#opportunity_form", "#opp_sumbit", "includes/adminprocess.php");
  