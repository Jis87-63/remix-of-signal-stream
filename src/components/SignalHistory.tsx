import { useEffect, useState } from "react";

interface HistoryItem {
  id: number;
  result: 'green' | 'lost';
  multiplier: number;
  predictedTarget: number;
}

interface SignalHistoryProps {
  history: HistoryItem[];
}

const getVelaColor = (value: number): string => {
  if (value >= 10) return 'text-vela-pink';
  if (value >= 2) return 'text-vela-purple';
  return 'text-vela-blue';
};

const SignalHistory = ({ history }: SignalHistoryProps) => {
  const [newItemId, setNewItemId] = useState<number | null>(null);
  
  const greens = history.filter(h => h.result === 'green').length;
  const losts = history.filter(h => h.result === 'lost').length;
  const rate = history.length > 0 ? ((greens / history.length) * 100).toFixed(0) : '0';

  // Trigger pulse animation when new item is added
  useEffect(() => {
    if (history.length > 0) {
      const latestId = history[0].id;
      setNewItemId(latestId);
      const timer = setTimeout(() => setNewItemId(null), 1000);
      return () => clearTimeout(timer);
    }
  }, [history.length, history[0]?.id]);

  return (
    <div className="bg-card rounded-xl border border-border/50 p-4">
      <h3 className="text-white font-bold mb-3">Histórico</h3>
      
      {/* Bubble display - same style as VelasAnalyzer */}
      <div className="flex flex-wrap gap-2 mb-4">
        {history.length > 0 ? (
          history.slice(0, 30).map((item) => (
            <span
              key={item.id}
              className={`px-3 py-1.5 rounded-md bg-[#1a1a2e] border border-[#0d0d15] text-xs font-extrabold transition-all ${getVelaColor(item.multiplier)} ${
                item.id === newItemId ? 'animate-[pulse_0.5s_ease-in-out_2]' : ''
              }`}
              title={`Alvo: ${item.predictedTarget.toFixed(2)}x | Resultado: ${item.multiplier.toFixed(2)}x`}
            >
              {item.multiplier.toFixed(2)}x
            </span>
          ))
        ) : (
          <span className="text-muted-foreground text-sm">Sem histórico...</span>
        )}
      </div>
      
      {history.length > 0 && (
        <div className="flex gap-4 text-sm border-t border-border/30 pt-3">
          <span className="text-primary font-semibold">
            Greens: {greens}
          </span>
          <span className="text-destructive font-semibold">
            Lost: {losts}
          </span>
          <span className="text-muted-foreground">
            Taxa: {rate}%
          </span>
        </div>
      )}
    </div>
  );
};

export default SignalHistory;
