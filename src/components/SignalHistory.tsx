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

const getVelaBgColor = (value: number): string => {
  if (value >= 10) return 'bg-vela-pink';
  if (value >= 2) return 'bg-vela-purple';
  return 'bg-vela-blue';
};

const SignalHistory = ({ history }: SignalHistoryProps) => {
  const greens = history.filter(h => h.result === 'green').length;
  const losts = history.filter(h => h.result === 'lost').length;
  const rate = history.length > 0 ? ((greens / history.length) * 100).toFixed(0) : '0';

  return (
    <div className="bg-[#1a1a2e] rounded-xl border border-[#0d0d15] p-4">
      <h3 className="text-white font-bold mb-3">Histórico</h3>
      
      {/* Bubble display */}
      <div className="flex flex-wrap gap-1.5 mb-4">
        {history.length > 0 ? (
          history.slice(0, 30).map((item) => (
            <div
              key={item.id}
              className={`w-7 h-7 rounded-full flex items-center justify-center ${getVelaBgColor(item.multiplier)}`}
              title={`Alvo: ${item.predictedTarget.toFixed(2)}x | Resultado: ${item.multiplier.toFixed(2)}x`}
            >
              <span className="text-[10px] font-bold text-white">
                {item.multiplier.toFixed(1)}
              </span>
            </div>
          ))
        ) : (
          <span className="text-muted-foreground text-sm">Sem histórico...</span>
        )}
      </div>
      
      {history.length > 0 && (
        <div className="flex gap-4 text-sm border-t border-[#0d0d15] pt-3">
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
