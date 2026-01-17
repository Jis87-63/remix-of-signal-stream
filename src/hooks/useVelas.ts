import { useState, useEffect, useCallback } from "react";

interface VelasData {
  velas: number[];
  isLoading: boolean;
  isConnected: boolean;
  error: string | null;
}

// Generate unique request ID (obfuscated)
const _g = (): string => {
  const t = Date.now().toString(36);
  const r = Math.random().toString(36).substring(2, 11);
  return `${t}-${r}`;
};

// Encoded endpoint parts (obfuscated)
const _e = () => {
  const p = ['/api', '/signals'];
  return p.join('');
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
      
      const rid = _g();
      const endpoint = _e();
      
      // Use local proxy - hides real backend URL
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Request-ID': rid,
        },
        credentials: 'same-origin',
      });

      if (!response.ok) {
        throw new Error('Erro de conexão');
      }

      const responseData = await response.json();

      if (responseData?.ok && responseData?.valores) {
        // Validate response
        const meta = responseData._meta;
        if (!meta || !meta.sig || !meta.ts) {
          throw new Error('Invalid response');
        }
        
        // Check freshness (5 min max)
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
