import React from 'react';

const InfiniteMarquee = ({ text, speed = 25 }) => {
  return (
    <div className="w-full overflow-hidden bg-foreground text-surface py-3 border-y border-foreground flex relative">
      <div 
        className="flex whitespace-nowrap animate-marquee font-display uppercase tracking-[0.2em] font-bold text-sm"
        style={{ animationDuration: `${speed}s` }}
      >
        <span className="mx-4">{text}</span>
        <span className="mx-4">{text}</span>
        <span className="mx-4">{text}</span>
        <span className="mx-4">{text}</span>
        <span className="mx-4">{text}</span>
        <span className="mx-4">{text}</span>
      </div>
      <div 
        className="flex whitespace-nowrap animate-marquee font-display uppercase tracking-[0.2em] font-bold text-sm absolute top-3"
        style={{ animationDuration: `${speed}s`, animationDelay: `-${speed/2}s` }}
      >
        <span className="mx-4">{text}</span>
        <span className="mx-4">{text}</span>
        <span className="mx-4">{text}</span>
        <span className="mx-4">{text}</span>
        <span className="mx-4">{text}</span>
        <span className="mx-4">{text}</span>
      </div>
    </div>
  );
};

export default InfiniteMarquee;
