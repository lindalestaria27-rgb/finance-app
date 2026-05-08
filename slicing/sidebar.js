document.addEventListener("DOMContentLoaded", function () {
  var shell = document.querySelector(".dashboard-shell, .page-shell");
  var toggle = document.querySelector(".sidebar-toggle");
  if (!shell || !toggle) {
    return;
  }

  var key = "rfc-sidebar-collapsed";
  var isCollapsed = localStorage.getItem(key) === "1";

  function applyState(collapsed) {
    shell.classList.toggle("is-collapsed", collapsed);
    toggle.setAttribute("aria-expanded", String(!collapsed));
  }

  applyState(isCollapsed);
  document.documentElement.classList.remove("sidebar-collapsed-preload");

  toggle.addEventListener("click", function () {
    isCollapsed = !isCollapsed;
    localStorage.setItem(key, isCollapsed ? "1" : "0");
    applyState(isCollapsed);
  });
});
