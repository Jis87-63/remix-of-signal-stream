import { useState, useEffect, useRef, useCallback } from "react";
import Header from "@/components/Header";
import VelasAnalyzer from "@/components/VelasAnalyzer";
import SignalCard from "@/components/SignalCard";
import SignalHistory from "@/components/SignalHistory";
import DepositCard from "@/components/DepositCard";
import WhatsAppDialog from "@/components/WhatsAppDialog";
import { useVelas } from "@/hooks/useVelas";
import { useNotificationSound } from "@/hooks/useNotificationSound";

interface HistoryItem {
  id: number;
  result: 'green' | 'lost';
  multiplier: number;
  predictedTarget: number;
}

interface PendingSignal {
  depoisDe: string;
  tirarNo: string;
  tentativas: number;
  targetMultiplier: number;
  attemptCount: number;
}

const Index = () => {
  const { velas, isLoading } = useVelas();
  const { playGreenSound, playLostSound, playHighVelaSound } = useNotificationSound();
  const [onlineCount, setOnlineCount] = useState(187);
  const [showWhatsAppDialog, setShowWhatsAppDialog] = useState(false);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [isProcessing, setIsProcessing] = useState(true);
  const [activeSignal, setActiveSignal] = useState<{
    depoisDe: string | null;
    tirarNo: string | null;
    tentativas: string | null;
    targetMultiplier: number;
  } | null>(null);
  const [pendingSignal, setPendingSignal] = useState<PendingSignal | null>(null);
  
  const lastVelaRef = useRef<number | null>(null);
  const historyIdRef = useRef(0);

  // Simulate random online count changes (100-200 range)
  useEffect(() => {
    const interval = setInterval(() => {
      setOnlineCount(prev => {
        const change = Math.random() > 0.5 ? Math.floor(Math.random() * 5) + 1 : -(Math.floor(Math.random() * 5) + 1);
        const newCount = prev + change;
        return Math.max(100, Math.min(250, newCount));
      });
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // Show WhatsApp dialog every 3 minutes
  useEffect(() => {
    // Show initially after 10 seconds
    const initialTimer = setTimeout(() => {
      setShowWhatsAppDialog(true);
    }, 10000);

    // Then show every 3 minutes
    const interval = setInterval(() => {
      setShowWhatsAppDialog(true);
    }, 3 * 60 * 1000);

    return () => {
      clearTimeout(initialTimer);
      clearInterval(interval);
    };
  }, []);

  // Analyze velas and generate prediction - always predict
  const analyzePattern = useCallback(() => {
    if (velas.length < 2) return null;

    const lastVela = velas[0];
    
    // Always generate a prediction
    const tirar = (1.5 + Math.random() * 0.7).toFixed(2);
    const tentativas = lastVela >= 2 ? 2 : 3;
    
    return {
      depoisDe: `${lastVela.toFixed(2)}x`,
      tirarNo: `${tirar}x`,
      tentativas,
      targetMultiplier: parseFloat(tirar),
    };
  }, [velas]);

  // Handle signal confirmation - only confirm when NEXT vela arrives after prediction
  useEffect(() => {
    if (!pendingSignal || velas.length === 0) return;

    const currentVela = velas[0];
    
    // Only check if this is a new vela
    if (lastVelaRef.current === currentVela) return;
    lastVelaRef.current = currentVela;

    // Check result on next vela after signal was shown
    if (currentVela >= pendingSignal.targetMultiplier) {
      // WIN - the vela reached our target
      setHistory(prev => [{
        id: ++historyIdRef.current,
        result: 'green' as const,
        multiplier: currentVela,
        predictedTarget: pendingSignal.targetMultiplier,
      }, ...prev].slice(0, 50));
      setPendingSignal(null);
      setActiveSignal(null);
      
      // Play special sound for high velas (10x+)
      if (currentVela >= 10) {
        playHighVelaSound();
      } else {
        playGreenSound();
      }
    } else {
      // Decrement attempts
      const newAttempts = pendingSignal.attemptCount - 1;
      
      if (newAttempts <= 0) {
        // LOSS - all attempts used
        setHistory(prev => [{
          id: ++historyIdRef.current,
          result: 'lost' as const,
          multiplier: currentVela,
          predictedTarget: pendingSignal.targetMultiplier,
        }, ...prev].slice(0, 50));
        setPendingSignal(null);
        setActiveSignal(null);
        playLostSound();
      } else {
        // Still has attempts left
        setPendingSignal({
          ...pendingSignal,
          attemptCount: newAttempts,
        });
        setActiveSignal(prev => prev ? {
          ...prev,
          tentativas: String(newAttempts),
        } : null);
      }
    }
  }, [velas, pendingSignal, playGreenSound, playLostSound, playHighVelaSound]);

  // Generate new signal when none active (faster processing)
  useEffect(() => {
    if (pendingSignal || activeSignal || velas.length < 2) {
      if (!pendingSignal && !activeSignal) {
        setIsProcessing(true);
      }
      return;
    }
    
    // Start processing
    setIsProcessing(true);
    
    // Fast analysis - only 800ms delay
    const timer = setTimeout(() => {
      const newSignal = analyzePattern();
      if (newSignal) {
        setActiveSignal({
          depoisDe: newSignal.depoisDe,
          tirarNo: newSignal.tirarNo,
          tentativas: String(newSignal.tentativas),
          targetMultiplier: newSignal.targetMultiplier,
        });
        setPendingSignal({
          depoisDe: newSignal.depoisDe,
          tirarNo: newSignal.tirarNo,
          tentativas: newSignal.tentativas,
          targetMultiplier: newSignal.targetMultiplier,
          attemptCount: newSignal.tentativas,
        });
        setIsProcessing(false);
      }
    }, 800);

    return () => clearTimeout(timer);
  }, [velas, activeSignal, pendingSignal, analyzePattern]);

  const signal = activeSignal || { depoisDe: null, tirarNo: null, tentativas: null };
  const showProcessing = isProcessing || (!activeSignal && !pendingSignal);

  return (
    <div className="min-h-screen bg-background">
      <Header onlineCount={onlineCount} />
      
      <main className="container max-w-2xl mx-auto p-4 space-y-4">
        <VelasAnalyzer velas={velas} isLoading={isLoading} />
        <SignalCard
          depoisDe={signal.depoisDe}
          tirarNo={signal.tirarNo}
          tentativas={signal.tentativas}
          isWaiting={false}
          isProcessing={showProcessing}
        />
        <SignalHistory history={history} />
        <DepositCard />
      </main>

      <WhatsAppDialog 
        isOpen={showWhatsAppDialog} 
        onClose={() => setShowWhatsAppDialog(false)} 
      />
    </div>
  );
};

export default Index;
