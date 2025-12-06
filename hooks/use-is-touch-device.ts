import { useState, useEffect } from "react";

const useIsTouchDevice = (): boolean => {
  const [isTouch, setIsTouch] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const checkTouch = () => {
        // Most reliable way to check for touch support
        const hasTouch =
          "ontouchstart" in window || navigator.maxTouchPoints > 0;
        setIsTouch(hasTouch);
      };

      // Initial check
      checkTouch();
      return;
    }
  }, []);

  return isTouch;
};

export default useIsTouchDevice;
