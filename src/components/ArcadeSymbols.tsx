import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Symbol {
  id: number;
  char: string;
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  duration: number;
}

function createSymbol(id: number): Symbol {
  const edges = ['top', 'bottom', 'left', 'right'] as const;
  const edge = edges[Math.floor(Math.random() * edges.length)];
  const char = Math.random() > 0.5 ? 'X' : 'O';

  let startX: number, startY: number, endX: number, endY: number;

  switch (edge) {
    case 'top':
      startX = Math.random() * 100;
      startY = -5;
      endX = startX + (Math.random() - 0.5) * 30;
      endY = 105;
      break;
    case 'bottom':
      startX = Math.random() * 100;
      startY = 105;
      endX = startX + (Math.random() - 0.5) * 30;
      endY = -5;
      break;
    case 'left':
      startX = -5;
      startY = Math.random() * 100;
      endX = 105;
      endY = startY + (Math.random() - 0.5) * 30;
      break;
    case 'right':
      startX = 105;
      startY = Math.random() * 100;
      endX = -5;
      endY = startY + (Math.random() - 0.5) * 30;
      break;
  }

  return {
    id,
    char,
    startX,
    startY,
    endX,
    endY,
    duration: 6 + Math.random() * 4,
  };
}

function ArcadeSymbol({ symbol, onComplete }: { symbol: Symbol; onComplete: (id: number) => void }) {
  useEffect(() => {
    const timer = setTimeout(() => onComplete(symbol.id), symbol.duration * 1000);
    return () => clearTimeout(timer);
  }, [symbol.id, symbol.duration, onComplete]);

  return (
    <motion.div
      className="absolute font-arcade text-2xl text-[#C8A04A] pointer-events-none select-none"
      style={{
        left: `${symbol.startX}%`,
        top: `${symbol.startY}%`,
        textShadow: '0 0 10px rgba(200, 160, 74, 0.3)',
      }}
      initial={{ opacity: 0, x: 0, y: 0 }}
      animate={{
        opacity: [0, 0.06, 0.08, 0.06, 0],
        x: [`0%`, `${symbol.endX - symbol.startX}%`],
        y: [`0%`, `${symbol.endY - symbol.startY}%`],
      }}
      transition={{
        duration: symbol.duration,
        ease: 'linear',
        opacity: {
          times: [0, 0.1, 0.5, 0.9, 1],
          duration: symbol.duration,
        },
      }}
    >
      {symbol.char}
    </motion.div>
  );
}

export default function ArcadeSymbols() {
  const [symbols, setSymbols] = useState<Symbol[]>([]);
  const [nextId, setNextId] = useState(0);

  const removeSymbol = useCallback((id: number) => {
    setSymbols((prev) => prev.filter((s) => s.id !== id));
  }, []);

  // Spawn symbols periodically
  useEffect(() => {
    const spawnInterval = setInterval(() => {
      setSymbols((prev) => {
        if (prev.length >= 3) return prev;
        const newSymbol = createSymbol(nextId);
        setNextId((id) => id + 1);
        return [...prev, newSymbol];
      });
    }, 8000 + Math.random() * 4000);

    return () => clearInterval(spawnInterval);
  }, [nextId]);

  return (
    <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
      <AnimatePresence>
        {symbols.map((symbol) => (
          <ArcadeSymbol key={symbol.id} symbol={symbol} onComplete={removeSymbol} />
        ))}
      </AnimatePresence>
    </div>
  );
}
