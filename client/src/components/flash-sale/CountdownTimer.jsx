// ============================================================
// src/components/flash-sale/CountdownTimer.jsx
// ============================================================

import { useState, useEffect } from 'react';

const CountdownTimer = ({ targetDate, label = 'Ends in' }) => {
  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

  function calculateTimeLeft() {
    const diff = new Date(targetDate) - new Date();
    if (diff <= 0) return null;

    return {
      hours: Math.floor(diff / (1000 * 60 * 60)),
      minutes: Math.floor((diff / (1000 * 60)) % 60),
      seconds: Math.floor((diff / 1000) % 60),
    };
  }

  useEffect(() => {
    const timer = setInterval(() => {
      const tl = calculateTimeLeft();
      if (!tl) {
        clearInterval(timer);
        setTimeLeft(null);
        return;
      }
      setTimeLeft(tl);
    }, 1000);

    return () => clearInterval(timer);
  }, [targetDate]);

  if (!timeLeft) {
    return <span className="text-dark-400 text-sm">Sale ended</span>;
  }

  const TimeBlock = ({ value, unit }) => (
    <div className="flex flex-col items-center">
      <div className="bg-dark-900/80 backdrop-blur border border-accent-500/30 rounded-xl w-16 h-16 flex items-center justify-center">
        <span className="text-2xl font-bold text-white tabular-nums">
          {String(value).padStart(2, '0')}
        </span>
      </div>
      <span className="text-[10px] text-dark-400 uppercase tracking-wider mt-1.5 font-medium">{unit}</span>
    </div>
  );

  return (
    <div className="flex flex-col items-center gap-3">
      <span className="text-sm text-accent-300 font-medium uppercase tracking-wider">{label}</span>
      <div className="flex items-center gap-2">
        <TimeBlock value={timeLeft.hours} unit="Hours" />
        <span className="text-2xl text-accent-400 font-bold animate-pulse mb-4">:</span>
        <TimeBlock value={timeLeft.minutes} unit="Min" />
        <span className="text-2xl text-accent-400 font-bold animate-pulse mb-4">:</span>
        <TimeBlock value={timeLeft.seconds} unit="Sec" />
      </div>
    </div>
  );
};

export default CountdownTimer;
