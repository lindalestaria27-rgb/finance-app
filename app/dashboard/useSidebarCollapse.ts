"use client";
// Sidebar collapse logic for dashboard page
import { useEffect } from "react";

export default function useSidebarCollapse() {
  useEffect(() => {
    const shell = document.querySelector(".dashboard-shell, .page-shell");
    const toggle = document.querySelector(".sidebar-toggle");
    if (!shell || !toggle) return;
    const key = "rfc-sidebar-collapsed";
    let isCollapsed = localStorage.getItem(key) === "1";
    function applyState(collapsed: boolean) {
      shell.classList.toggle("is-collapsed", collapsed);
      toggle.setAttribute("aria-expanded", String(!collapsed));
    }
    applyState(isCollapsed);
    document.documentElement.classList.remove("sidebar-collapsed-preload");
    // Use a named handler so it can be removed
    function handleToggle() {
      isCollapsed = !isCollapsed;
      localStorage.setItem(key, isCollapsed ? "1" : "0");
      applyState(isCollapsed);
    }
    toggle.addEventListener("click", handleToggle);
    // Cleanup
    return () => {
      toggle.removeEventListener("click", handleToggle);
    };
  }, []);
}
