import React, { useState, useEffect, useRef } from 'react';
import { useAppContext } from '../App';

// A component to render a single animated digit
const Digit: React.FC<{ digit: number }> = ({ digit }) => {
  return (
    <div
      className="relative h-[1em] w-[0.6em] overflow-hidden rounded-md bg-gray-200 dark:bg-black/50"
      style={{
        // Using a subtle dark inner shadow for light mode, which is also acceptable on dark mode.
        boxShadow: '0 2px 10px rgba(0,0,0,0.2), inset 0 1px 2px rgba(0,0,0,0.1)',
      }}
    >
      <div
        className="absolute top-0 left-0 w-full h-[1000%] transition-transform duration-700 ease-in-out"
        style={{ transform: `translateY(-${digit * 10}%)` }}
      >
        {[...Array(10).keys()].map(i => (
          <span key={i} className="w-full h-[10%] flex items-center justify-center">
            {i}
          </span>
        ))}
      </div>
    </div>
  );
};

// The main clock component
const FullScreenClock: React.FC = () => {
  const { setView } = useAppContext();
  const [time, setTime] = useState(new Date());
  const [showHint, setShowHint] = useState(false);
  const lastTap = useRef(0);

  useEffect(() => {
    const timerId = setInterval(() => setTime(new Date()), 1000);
    const hintTimer = setTimeout(() => setShowHint(true), 2000);
    return () => {
      clearInterval(timerId);
      clearTimeout(hintTimer);
    };
  }, []);

  const handleDoubleClick = () => {
    const now = Date.now();
    if (now - lastTap.current < 300) { // 300ms threshold for double tap
      setView('dashboard');
    }
    lastTap.current = now;
  };

  const h1 = Math.floor(time.getHours() / 10);
  const h2 = time.getHours() % 10;
  const m1 = Math.floor(time.getMinutes() / 10);
  const m2 = time.getMinutes() % 10;
  const s1 = Math.floor(time.getSeconds() / 10);
  const s2 = time.getSeconds() % 10;

  return (
    <div
      className="fixed inset-0 bg-gray-100 dark:bg-black flex flex-col items-center justify-center z-50 cursor-pointer"
      onClick={handleDoubleClick}
      onTouchStart={handleDoubleClick}
    >
      <div className="flex items-center justify-center font-sans font-bold text-gray-800 dark:text-gray-100 text-[25vw] md:text-[20vw] lg:text-[15rem] leading-none select-none gap-x-[0.1em]">
        <Digit digit={h1} />
        <Digit digit={h2} />
        <div className="w-[0.2em] animate-soft-blink">:</div>
        <Digit digit={m1} />
        <Digit digit={m2} />
        <div className="w-[0.2em] animate-soft-blink">:</div>
        <Digit digit={s1} />
        <Digit digit={s2} />
      </div>
      <footer
        className={`fixed bottom-5 text-center text-gray-600 dark:text-white/50 text-sm transition-opacity duration-1000 ${showHint ? 'opacity-100' : 'opacity-0'}`}
      >
        <p>Ana sayfaya dönmek için çift dokunun.</p>
      </footer>
    </div>
  );
};

export default FullScreenClock;