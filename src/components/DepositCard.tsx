import { Gift, ArrowRight } from "lucide-react";

const DepositCard = () => {
  return (
    <div className="bg-[#1a1a2e] rounded-xl border border-[#0d0d15] p-4">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
          <Gift className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h3 className="text-white font-bold text-sm">Aumente sua precisão!</h3>
          <p className="text-muted-foreground text-xs">Sinais mais assertivos</p>
        </div>
      </div>
      
      <p className="text-muted-foreground text-xs mb-3">
        Crie uma nova conta e faça seu depósito para jogar com mais acertividade nos sinais.
      </p>
      
      <button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-2.5 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors">
        <span>Criar Conta</span>
        <ArrowRight className="w-4 h-4" />
      </button>
    </div>
  );
};

export default DepositCard;
