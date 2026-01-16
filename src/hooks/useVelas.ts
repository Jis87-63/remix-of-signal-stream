import { useState, useEffect, useCallback } from "react";

interface VelasData {
  velas: number[];
  isLoading: boolean;
  isConnected: boolean;
  error: string | null;
}

// Obfuscated configuration
const _0x4f2a = ['aHR0cHM6Ly9hcHAuc3NjYXNob3V0Lm9ubGluZS9hcGkvdmVsYXM='];
const _getEndpoint = (): string => {
  try {
    return atob(_0x4f2a[0]);
  } catch {
    return '';
  }
};

// Anti-devtools detection
const _detectDevTools = (): boolean => {
  const threshold = 160;
  const widthThreshold = window.outerWidth - window.innerWidth > threshold;
  const heightThreshold = window.outerHeight - window.innerHeight > threshold;
  return widthThreshold || heightThreshold;
};

// Session validation
const _validateSession = (): string => {
  const sessionKey = '_vs_' + Date.now().toString(36);
  const existing = document.cookie.split(';').find(c => c.trim().startsWith('_vk='));
  if (!existing) {
    const expiry = new Date(Date.now() + 86400000).toUTCString();
    document.cookie = `_vk=${sessionKey}; expires=${expiry}; path=/; SameSite=Strict; Secure`;
  }
  return sessionKey;
};

export const useVelas = () => {
  const [data, setData] = useState<VelasData>({
    velas: [],
    isLoading: true,
    isConnected: false,
    error: null,
  });

  const fetchVelas = useCallback(async () => {
    // Validate session
    _validateSession();
    
    // Check for devtools (optional warning)
    if (_detectDevTools()) {
      console.clear();
    }

    try {
      setData(prev => ({ ...prev, isLoading: true }));
      
      const endpoint = _getEndpoint();
      if (!endpoint) {
        throw new Error('Configuration error');
      }

      const response = await fetch(endpoint, {
        method: 'GET',
        credentials: 'omit',
        headers: {
          'Accept': 'application/json',
        },
      });
      
      const json = await response.json();

      if (json.ok && json.valores) {
        setData({
          velas: json.valores,
          isLoading: false,
          isConnected: true,
          error: null,
        });
      } else {
        setData(prev => ({
          ...prev,
          isLoading: false,
          isConnected: false,
          error: 'Resposta inválida',
        }));
      }
    } catch {
      setData(prev => ({
        ...prev,
        isLoading: false,
        isConnected: false,
        error: 'Erro de conexão',
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
