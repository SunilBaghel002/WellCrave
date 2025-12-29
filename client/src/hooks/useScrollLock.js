// src/hooks/useScrollLock.js
import { useEffect } from "react";

export const useScrollLock = (isLocked) => {
  useEffect(() => {
    if (isLocked) {
      const originalStyle = window.getComputedStyle(document.body).overflow;
      const scrollbarWidth =
        window.innerWidth - document.documentElement.clientWidth;

      document.body.style.overflow = "hidden";
      document.body.style.paddingRight = `${scrollbarWidth}px`;

      return () => {
        document.body.style.overflow = originalStyle;
        document.body.style.paddingRight = "0px";
      };
    }
  }, [isLocked]);
};

export default useScrollLock;
