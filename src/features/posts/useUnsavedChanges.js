"use client";
import { useLayoutEffect, useRef } from "react";

export function useUnsavedChanges(dirty, enabled = true) {
  const dirtyRef = useRef(dirty);
  useLayoutEffect(() => {
    dirtyRef.current = dirty;
  }, [dirty]);
  useLayoutEffect(() => {
    if (!enabled) return;
    const beforeUnload = (event) => {
      if (!dirtyRef.current) return;
      event.preventDefault();
      event.returnValue = "";
    };
    const click = (event) => {
      const link = event.target.closest?.("a[href]");
      if (
        !dirtyRef.current ||
        !link ||
        link.target === "_blank" ||
        event.ctrlKey ||
        event.metaKey ||
        event.shiftKey ||
        event.button !== 0
      )
        return;
      if (
        link.href === window.location.href ||
        link.getAttribute("href")?.startsWith("#")
      )
        return;
      if (!window.confirm("Perubahan belum disimpan. Tinggalkan form?")) {
        event.preventDefault();
        event.stopPropagation();
      } else dirtyRef.current = false;
    };
    const originalIndex = window.navigation?.currentEntry?.index;
    let restoring = false;
    const popstate = (event) => {
      if (restoring) {
        restoring = false;
        event.stopImmediatePropagation();
        return;
      }
      if (!dirtyRef.current) return;
      if (!window.confirm("Perubahan belum disimpan. Tinggalkan form?")) {
        event.stopImmediatePropagation();
        restoring = true;
        const index = window.navigation?.currentEntry?.index;
        window.history.go(
          Number.isInteger(originalIndex) && Number.isInteger(index)
            ? originalIndex - index || 1
            : 1,
        );
      } else dirtyRef.current = false;
    };
    // The root beforeInteractive listener runs before Next handles traversal.
    window.__nobnobPostHistoryGuard = popstate;
    window.addEventListener("beforeunload", beforeUnload);
    document.addEventListener("click", click, true);
    return () => {
      if (window.__nobnobPostHistoryGuard === popstate)
        delete window.__nobnobPostHistoryGuard;
      window.removeEventListener("beforeunload", beforeUnload);
      document.removeEventListener("click", click, true);
    };
  }, [enabled]);
  return () => {
    dirtyRef.current = false;
  };
}
