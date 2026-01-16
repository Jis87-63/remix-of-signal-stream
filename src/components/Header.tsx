import { Plane } from "lucide-react";

interface HeaderProps {
  onlineCount: number;
}

const Header = ({ onlineCount }: HeaderProps) => {
  return (
    <header className="flex items-center justify-between px-4 py-3 border-b border-border bg-card">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
          <Plane className="w-6 h-6 text-primary" />
        </div>
        <div>
          <h1 className="font-bold text-foreground">Sistema Cashout</h1>
          <p className="text-xs text-muted-foreground">Aguarde entrada</p>
        </div>
      </div>
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-primary/30 bg-primary/10">
        <span className="w-2 h-2 rounded-full bg-primary pulse-dot"></span>
        <span className="text-sm font-medium text-primary">{onlineCount} online</span>
      </div>
    </header>
  );
};

export default Header;
