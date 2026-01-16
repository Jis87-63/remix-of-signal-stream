import { Flame } from "lucide-react";

interface SignalCardProps {
  depoisDe: string | null;
  tirarNo: string | null;
  tentativas: string | null;
  isWaiting?: boolean;
  isProcessing?: boolean;
}

const SignalCard = ({ depoisDe, tirarNo, tentativas, isWaiting, isProcessing }: SignalCardProps) => {
  const showAnalyzing = isProcessing || isWaiting;

  return (
    <div className="bg-[#1a1a2e] rounded-xl border border-[#0d0d15] p-4">
      <div className="flex items-center gap-2 mb-4">
        <Flame className="w-5 h-5 text-primary" />
        <h2 className="text-white font-bold">
          {showAnalyzing ? 'ANALISANDO' : 'POSSÍVEL ENTRADA'}
        </h2>
        {showAnalyzing && (
          <span className="flex gap-1 ml-1">
            <span className="w-1.5 h-1.5 rounded-full bg-white/60 animate-bounce" style={{ animationDelay: '0ms' }}></span>
            <span className="w-1.5 h-1.5 rounded-full bg-white/60 animate-bounce" style={{ animationDelay: '150ms' }}></span>
            <span className="w-1.5 h-1.5 rounded-full bg-white/60 animate-bounce" style={{ animationDelay: '300ms' }}></span>
          </span>
        )}
      </div>

      {showAnalyzing ? (
        <div className="flex items-center justify-center py-6">
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
            <span className="text-muted-foreground text-sm">Buscando padrões...</span>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-[#0d0d15] rounded-lg p-3 text-center border border-[#0d0d15]">
            <p className="text-muted-foreground text-xs mb-1">Depois de</p>
            <p className="text-white font-bold text-lg">{depoisDe || '--'}</p>
          </div>
          <div className="bg-[#0d0d15] rounded-lg p-3 text-center border border-[#0d0d15]">
            <p className="text-muted-foreground text-xs mb-1">Tirar no</p>
            <p className="text-primary font-bold text-lg">{tirarNo || '--'}</p>
          </div>
          <div className="bg-[#0d0d15] rounded-lg p-3 text-center border border-[#0d0d15]">
            <p className="text-muted-foreground text-xs mb-1">Tentativas</p>
            <p className="text-white font-bold text-lg">{tentativas || '--'}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default SignalCard;
