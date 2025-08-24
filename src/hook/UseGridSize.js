import { useEffect, useState } from "react";

export default function useGridSize() {
  const [size, setSize] = useState(20);

  useEffect(() => {
    function update() {
      const w = window.innerWidth;
      if (w < 640) setSize(12);
      else  setSize(20);
    }
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  return size;
}
