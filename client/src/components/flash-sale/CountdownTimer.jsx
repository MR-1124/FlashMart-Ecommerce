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
    return <span className="font-display font-medium uppercase tracking-widest text-muted text-sm">Sale Concluded</span>;
  }

  const TimeBlock = ({ value, unit }) => (
    <div className="flex flex-col items-center">
      <div className="border-[3px] border-surface bg-foreground text-surface w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center">
        <span className="font-display font-black text-3xl sm:text-4xl tabular-nums">
          {String(value).padStart(2, '0')}
        </span>
      </div>
      <span className="font-display font-bold text-[10px] sm:text-xs uppercase tracking-widest mt-2">{unit}</span>
    </div>
  );

  return (
    <div className="flex flex-col items-start gap-4">
      <span className="font-display font-bold uppercase tracking-widest text-surface/70 text-sm border-b border-surface/30 pb-1 pr-6">{label}</span>
      <div className="flex items-center gap-3">
        <TimeBlock value={timeLeft.hours} unit="HR" />
        <span className="font-display font-black text-3xl sm:text-4xl text-surface animate-pulse mb-6">:</span>
        <TimeBlock value={timeLeft.minutes} unit="MIN" />
        <span className="font-display font-black text-3xl sm:text-4xl text-surface animate-pulse mb-6">:</span>
        <TimeBlock value={timeLeft.seconds} unit="SEC" />
      </div>
    </div>
  );
};

export default CountdownTimer;
