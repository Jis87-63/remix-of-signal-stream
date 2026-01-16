import { X } from "lucide-react";

interface WhatsAppDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

const WhatsAppDialog = ({ isOpen, onClose }: WhatsAppDialogProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="relative w-full max-w-sm bg-[#1a1a2e] rounded-2xl border-2 border-yellow-500 p-6 text-center">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-muted-foreground hover:text-foreground"
        >
          <X className="w-6 h-6" />
        </button>
        
        <h2 className="text-2xl font-extrabold text-primary uppercase tracking-wide mb-4">
          Grupo Oficial<br />WhatsApp
        </h2>
        
        <p className="text-foreground text-sm leading-relaxed mb-4">
          Entre agora no grupo de WhatsApp e tenha acesso a <span className="text-primary font-semibold">dicas exclusivas</span>, outros bots <span className="text-primary font-semibold">100% assertivos</span> e suporte 24/24 para tirar todas as suas dúvidas.
        </p>
        
        <p className="text-muted-foreground text-xs mb-6">
          No grupo você encontra tudo o que precisa para ganhar no Aviator todos os dias com segurança.
        </p>
        
        <a
          href="https://chat.whatsapp.com/LfPy4mku4rT74B3PRfGhj3"
          target="_blank"
          rel="noopener noreferrer"
          className="block w-full py-4 bg-[#25D366] hover:bg-[#20BD5A] text-white font-bold text-lg rounded-xl transition-colors uppercase tracking-wider"
        >
          Entrar no Grupo Agora
        </a>
      </div>
    </div>
  );
};

export default WhatsAppDialog;
