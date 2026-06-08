"use client";
// Sidebar collapse logic for dashboard page
import { useEffect } from "react";

export default function useSidebarCollapse() {
  useEffect(() => {
    const shell = document.querySelector(
      ".dashboard-shell, .page-shell"
    ) as HTMLElement | null;

    const toggle = document.querySelector(
      ".sidebar-toggle"
    ) as HTMLElement | null;

    const key = "rfc-sidebar-collapsed";
    const stored = localStorage.getItem(key);
    // Default to collapsed on first load (stored === null)
    let isCollapsed = stored === "1" || stored === null;

    function applyState(collapsed: boolean) {
      // guard in function
      if (!shell || !toggle) return;

      shell.classList.toggle("is-collapsed", collapsed);
      toggle.setAttribute("aria-expanded", String(!collapsed));
    }

    // if elements missing, stop
    if (!shell || !toggle) return;

    applyState(isCollapsed);

    document.documentElement.classList.remove(
      "sidebar-collapsed-preload"
    );

    function handleToggle() {
      isCollapsed = !isCollapsed;
      localStorage.setItem(key, isCollapsed ? "1" : "0");
      applyState(isCollapsed);
    }

    toggle.addEventListener("click", handleToggle);

    return () => {
      toggle.removeEventListener("click", handleToggle);
    };
  }, []);
}
