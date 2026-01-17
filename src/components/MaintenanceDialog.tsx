import { AlertTriangle } from "lucide-react";

interface MaintenanceDialogProps {
  message: string;
}

const MaintenanceDialog = ({ message }: MaintenanceDialogProps) => {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-4">
      <div className="w-full max-w-md bg-card rounded-2xl border-2 border-destructive p-8 text-center animate-pulse">
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 rounded-full bg-destructive/20 flex items-center justify-center">
            <AlertTriangle className="w-12 h-12 text-destructive" />
          </div>
        </div>
        
        <h2 className="text-2xl font-extrabold text-destructive uppercase tracking-wide mb-4">
          Sistema em Manutenção
        </h2>
        
        <p className="text-foreground text-base leading-relaxed mb-6">
          {message}
        </p>
        
        <div className="flex items-center justify-center gap-2 text-muted-foreground text-sm">
          <div className="w-2 h-2 rounded-full bg-destructive animate-bounce" style={{ animationDelay: '0ms' }} />
          <div className="w-2 h-2 rounded-full bg-destructive animate-bounce" style={{ animationDelay: '150ms' }} />
          <div className="w-2 h-2 rounded-full bg-destructive animate-bounce" style={{ animationDelay: '300ms' }} />
          <span className="ml-2">Aguarde...</span>
        </div>
      </div>
    </div>
  );
};

export default MaintenanceDialog;
