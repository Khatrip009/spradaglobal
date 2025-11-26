import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";

// Component to handle automatic scroll management
export function ScrollToTop() {
  const location = useLocation();
  const prevLocationRef = useRef(null);

  useEffect(() => {
    const isSamePage = prevLocationRef.current === location.pathname;

    if (location.hash) {
      // If URL has a #hash → scroll to element
      setTimeout(() => {
        const element = document.getElementById(location.hash.slice(1));
        if (element) {
          element.scrollIntoView({ behavior: "smooth" });
        }
      }, 100);
    } else {
      // No hash → normal scroll to top
      window.scrollTo({
        top: 0,
        left: 0,
        behavior: isSamePage ? "smooth" : "auto",
      });
    }

    prevLocationRef.current = location.pathname;
  }, [location]);

  return null;
}
