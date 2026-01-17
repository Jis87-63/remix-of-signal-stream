import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

interface VelasData {
  velas: number[];
  isLoading: boolean;
  isConnected: boolean;
  error: string | null;
}

// Generate unique request ID
const _genId = (): string => {
  return `${Date.now().toString(36)}-${Math.random().toString(36).substr(2, 9)}`;
};

export const useVelas = () => {
  const [data, setData] = useState<VelasData>({
    velas: [],
    isLoading: true,
    isConnected: false,
    error: null,
  });

  const fetchVelas = useCallback(async () => {
    try {
      setData(prev => ({ ...prev, isLoading: true }));
      
      const requestId = _genId();
      
      // Call secure edge function instead of direct API
      const { data: responseData, error } = await supabase.functions.invoke('velas-proxy', {
        headers: {
          'x-request-id': requestId,
        },
      });

      if (error) {
        throw new Error(error.message || 'Erro de conexão');
      }

      if (responseData?.ok && responseData?.valores) {
        // Validate response signature
        const meta = responseData._meta;
        if (!meta || !meta.sig || !meta.ts) {
          throw new Error('Invalid response signature');
        }
        
        // Check if response is not too old (5 minutes max)
        const age = Date.now() - meta.ts;
        if (age > 300000) {
          throw new Error('Stale response');
        }
        
        setData({
          velas: responseData.valores,
          isLoading: false,
          isConnected: true,
          error: null,
        });
      } else {
        setData(prev => ({
          ...prev,
          isLoading: false,
          isConnected: false,
          error: responseData?.error || 'Resposta inválida',
        }));
      }
    } catch (err) {
      setData(prev => ({
        ...prev,
        isLoading: false,
        isConnected: false,
        error: err instanceof Error ? err.message : 'Erro de conexão',
      }));
    }
  }, []);

  useEffect(() => {
    fetchVelas();
    const interval = setInterval(fetchVelas, 5000);
    return () => clearInterval(interval);
  }, [fetchVelas]);

  return data;
};
