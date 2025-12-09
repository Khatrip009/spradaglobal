// src/components/ScrollToTop.jsx
import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";

export function ScrollToTop() {
  const { pathname, hash, key } = useLocation();
  const prevKeyRef = useRef(null);

  // Ensure browser does not auto-restore scroll (we control it)
  useEffect(() => {
    if (typeof window !== "undefined" && "scrollRestoration" in window.history) {
      try {
        window.history.scrollRestoration = "manual";
      } catch (e) {
        // ignore
      }
    }
  }, []);

  useEffect(() => {
    const isSameNav = prevKeyRef.current === key;
    prevKeyRef.current = key;

    // Short delay gives framer-motion/React time to mount the page content
    const delay = hash ? 40 : 30;

    const id = hash ? hash.replace("#", "") : null;

    const doScroll = () => {
      if (id) {
        const el = document.getElementById(id);
        if (el) {
          el.scrollIntoView({ behavior: "smooth", block: "start" });
          return;
        }
      }

      // normal navigation -> jump to top; if same nav use smooth for perceived continuity
      window.scrollTo({
        top: 0,
        left: 0,
        behavior: isSameNav ? "smooth" : "auto",
      });
    };

    const t = setTimeout(doScroll, delay);
    return () => clearTimeout(t);
  }, [pathname, hash, key]);

  return null;
}
