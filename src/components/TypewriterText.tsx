import { useState, useEffect } from 'react';

interface TypewriterTextProps {
  text: string;
  speed?: number;
  delay?: number;
  onComplete?: () => void;
  className?: string;
}

export default function TypewriterText({
  text,
  speed = 60,
  delay = 0,
  onComplete,
  className = '',
}: TypewriterTextProps) {
  const [displayed, setDisplayed] = useState('');
  const [cursorFading, setCursorFading] = useState(false);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const delayTimer = setTimeout(() => setStarted(true), delay);
    return () => clearTimeout(delayTimer);
  }, [delay]);

  useEffect(() => {
    if (!started) return;
    if (displayed.length >= text.length) {
      // Done typing — fade cursor after 3s
      const fadeTimer = setTimeout(() => setCursorFading(true), 3000);
      onComplete?.();
      return () => clearTimeout(fadeTimer);
    }

    const timer = setTimeout(() => {
      setDisplayed((prev) => text.slice(0, prev.length + 1));
    }, speed);

    return () => clearTimeout(timer);
  }, [started, displayed, text, speed, onComplete]);

  return (
    <span className={className}>
      {displayed}
      <span
        className={`inline-block w-[2px] ml-0.5 bg-current transition-opacity duration-500 ${
          cursorFading ? 'opacity-0' : 'opacity-100'
        }`}
        style={{
          animation: cursorFading ? 'none' : 'blink 1s step-end infinite',
          height: '1em',
          verticalAlign: 'text-bottom',
        }}
      />
    </span>
  );
}
