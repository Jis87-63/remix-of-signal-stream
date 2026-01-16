interface VelasAnalyzerProps {
  velas: number[];
  isLoading: boolean;
}

const VelasAnalyzer = ({ velas, isLoading }: VelasAnalyzerProps) => {
  const getVelaColor = (value: number) => {
    if (value >= 10) return "text-vela-pink";
    if (value >= 2) return "text-vela-purple";
    return "text-vela-blue";
  };

  return (
    <div className="bg-card rounded-xl border border-border/50 p-4">
      <div className="flex items-center gap-2 mb-4">
        <span className={`w-3 h-3 rounded-full ${isLoading ? 'bg-vela-blue animate-pulse' : 'bg-vela-blue'}`}></span>
        <span className="text-white font-semibold">
          Analisando velas
        </span>
        {isLoading && (
          <span className="flex gap-1 ml-1">
            <span className="w-1.5 h-1.5 rounded-full bg-white/60 animate-bounce" style={{ animationDelay: '0ms' }}></span>
            <span className="w-1.5 h-1.5 rounded-full bg-white/60 animate-bounce" style={{ animationDelay: '150ms' }}></span>
            <span className="w-1.5 h-1.5 rounded-full bg-white/60 animate-bounce" style={{ animationDelay: '300ms' }}></span>
          </span>
        )}
      </div>
      
      <div className="flex gap-2">
        {velas.length > 0 ? (
          velas.slice(0, 4).map((vela, index) => (
            <span
              key={index}
              className={`px-4 py-2 rounded-md bg-[#1a1a2e] border border-[#0d0d15] text-sm font-extrabold transition-all ${getVelaColor(vela)}`}
            >
              {vela.toFixed(2)}x
            </span>
          ))
        ) : (
          <span className="text-muted-foreground text-sm">Aguardando dados...</span>
        )}
      </div>
    </div>
  );
};

export default VelasAnalyzer;
