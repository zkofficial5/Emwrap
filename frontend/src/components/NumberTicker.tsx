import React, { useEffect, useState } from "react";

interface NumberTickerProps {
  value: number;
  prefix?: string;
  duration?: number;
}

const NumberTicker = ({ value, prefix = "$", duration = 1500 }: NumberTickerProps) => {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    let start = 0;
    const startTime = performance.now();

    const tick = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.floor(eased * value));
      if (progress < 1) requestAnimationFrame(tick);
    };

    requestAnimationFrame(tick);
  }, [value, duration]);

  return (
    <span className="tabular-nums">
      {prefix}{display.toLocaleString()}
    </span>
  );
};

export default NumberTicker;
