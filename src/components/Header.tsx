import { useState, useEffect } from "react";
import robotIcon from "@/assets/robot-icon.png";

interface HeaderProps {
  onlineCount: number;
}

const Header = ({ onlineCount }: HeaderProps) => {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Trigger animation after component mounts
    const timer = setTimeout(() => setIsLoaded(true), 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <header className="flex items-center justify-between px-3 py-2 border-b border-border bg-card">
      <div className="flex items-center gap-2">
        <div 
          className={`w-8 h-8 rounded-lg overflow-hidden ${
            isLoaded ? 'animate-robot-entrance' : 'opacity-0'
          }`}
          style={{ animationDelay: '0.1s' }}
        >
          <img 
            src={robotIcon} 
            alt="Robot" 
            className={`w-full h-full object-cover ${isLoaded ? 'animate-robot-float' : ''}`}
            style={{ animationDelay: '0.9s' }}
          />
        </div>
        <div>
          <h1 className="font-bold text-sm text-foreground">ROBÔ DO AVIATOR</h1>
          <p className="text-[10px] text-muted-foreground">Aguarde entrada</p>
        </div>
      </div>
      <div className="flex items-center gap-1.5 px-2 py-1 rounded-full border border-primary/30 bg-primary/10">
        <span className="w-1.5 h-1.5 rounded-full bg-primary pulse-dot"></span>
        <span className="text-xs font-medium text-primary">{onlineCount} online</span>
      </div>
    </header>
  );
};

export default Header;
