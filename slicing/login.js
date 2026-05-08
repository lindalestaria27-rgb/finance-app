document.addEventListener("DOMContentLoaded", function () {
  var toggleButtons = document.querySelectorAll(".password-toggle");

  toggleButtons.forEach(function (toggleButton) {
    var targetSelector = toggleButton.getAttribute("data-target");
    var passwordInput = targetSelector
      ? document.querySelector(targetSelector)
      : toggleButton.parentElement.querySelector("input");

    if (!passwordInput) {
      return;
    }

    toggleButton.addEventListener("click", function () {
      var isOpen = passwordInput.type === "text";
      passwordInput.type = isOpen ? "password" : "text";
      toggleButton.classList.toggle("is-open", !isOpen);
      toggleButton.setAttribute("aria-pressed", String(!isOpen));
      toggleButton.setAttribute("aria-label", isOpen ? "Show password" : "Hide password");
    });
  });

  var lineLayer = document.querySelector(".finance-line-layer");
  var gridLayer = document.querySelector(".finance-grid-layer");

  if (!lineLayer || !gridLayer) {
    return;
  }

  var prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (prefersReducedMotion) {
    return;
  }

  var start = performance.now();

  function animate(now) {
    var t = (now - start) / 1000;

    // Smooth sinusoidal motion to avoid any visual jump.
    var lineX = Math.sin(t * 0.45) * 2;
    var gridX = Math.sin(t * 0.34 + 1.2) * -1.2;

    lineLayer.style.transform = "translate3d(" + lineX.toFixed(3) + "%, 0, 0)";
    gridLayer.style.transform = "translate3d(" + gridX.toFixed(3) + "%, 0, 0)";

    requestAnimationFrame(animate);
  }

  requestAnimationFrame(animate);
});
