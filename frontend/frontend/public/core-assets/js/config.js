(function () {
  var primary = localStorage.getItem("primary") || "#7A70BA";
  var secondary = localStorage.getItem("secondary") || "#48A3D7";

  window.NexorcrmAdminConfig = {
    // Theme Primary Color
    primary: primary,
    // theme secondary color
    secondary: secondary,
  };
})();
