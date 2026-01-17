import { useEffect, useState } from "react";

interface ProtectionState {
  isBlocked: boolean;
  reason: string | null;
}

// Obfuscated detection methods
const _d1 = (): boolean => {
  const t = 160;
  return (window.outerWidth - window.innerWidth > t) || 
         (window.outerHeight - window.innerHeight > t);
};

const _d2 = (): boolean => {
  const e = new Image();
  let detected = false;
  Object.defineProperty(e, 'id', {
    get: function() {
      detected = true;
      return '';
    }
  });
  console.debug(e);
  return detected;
};

const _d3 = (): boolean => {
  const start = performance.now();
  debugger;
  const end = performance.now();
  return (end - start) > 100;
};

const _d4 = (): boolean => {
  const f = new Function();
  let detected = false;
  const handler = {
    apply: function() {
      detected = true;
      return undefined;
    }
  };
  try {
    const p = new Proxy(f, handler);
    p();
  } catch {
    // Proxy detection failed
  }
  return detected;
};

// Block console methods
const _blockConsole = (): void => {
  const noop = () => {};
  const methods = ['log', 'debug', 'info', 'warn', 'error', 'table', 'trace', 'dir', 'dirxml', 'group', 'groupEnd', 'time', 'timeEnd', 'assert', 'profile'] as const;
  
  methods.forEach((method) => {
    try {
      (console as unknown as Record<string, unknown>)[method] = noop;
    } catch {
      // Some methods may be read-only
    }
  });
  
  // Clear console periodically
  setInterval(() => {
    try {
      console.clear();
    } catch {
      // Ignore errors
    }
  }, 100);
};

// Disable right-click and keyboard shortcuts
const _blockShortcuts = (): void => {
  // Disable right-click
  document.addEventListener('contextmenu', (e) => {
    e.preventDefault();
    return false;
  });
  
  // Disable keyboard shortcuts
  document.addEventListener('keydown', (e) => {
    // F12
    if (e.key === 'F12') {
      e.preventDefault();
      return false;
    }
    
    // Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+Shift+C (DevTools)
    if (e.ctrlKey && e.shiftKey && ['I', 'J', 'C', 'K'].includes(e.key.toUpperCase())) {
      e.preventDefault();
      return false;
    }
    
    // Ctrl+U (View Source)
    if (e.ctrlKey && e.key.toUpperCase() === 'U') {
      e.preventDefault();
      return false;
    }
    
    // Ctrl+S (Save)
    if (e.ctrlKey && e.key.toUpperCase() === 'S') {
      e.preventDefault();
      return false;
    }
  });
  
  // Disable text selection on body
  document.body.style.userSelect = 'none';
  (document.body.style as unknown as Record<string, string>)['-webkit-user-select'] = 'none';
};

// Disable debugging
const _disableDebug = (): void => {
  // Override debugger
  const script = document.createElement('script');
  script.textContent = `
    (function() {
      const _0x1 = setInterval(function() {
        const before = new Date().getTime();
        debugger;
        const after = new Date().getTime();
        if (after - before > 100) {
          document.body.innerHTML = '<div style="display:flex;align-items:center;justify-content:center;height:100vh;background:#000;color:#fff;font-family:sans-serif;"><h1>Acesso bloqueado</h1></div>';
          clearInterval(_0x1);
        }
      }, 1000);
    })();
  `;
  document.head.appendChild(script);
};

export const useDevToolsProtection = (): ProtectionState => {
  const [state, setState] = useState<ProtectionState>({
    isBlocked: false,
    reason: null,
  });

  useEffect(() => {
    // Block console and shortcuts
    _blockConsole();
    _blockShortcuts();
    _disableDebug();
    
    // Continuous detection
    const checkDevTools = () => {
      if (_d1() || _d2()) {
        setState({ isBlocked: true, reason: 'DevTools detected' });
        document.body.innerHTML = `
          <div style="
            display: flex;
            align-items: center;
            justify-content: center;
            height: 100vh;
            background: linear-gradient(135deg, #0a0a0f 0%, #1a1a2e 100%);
            color: #fff;
            font-family: 'Outfit', sans-serif;
            text-align: center;
            flex-direction: column;
            gap: 1rem;
          ">
            <div style="font-size: 4rem;">🚫</div>
            <h1 style="font-size: 1.5rem; font-weight: 600;">Acesso Bloqueado</h1>
            <p style="color: #888; font-size: 0.9rem;">Feche as ferramentas de desenvolvedor e recarregue a página.</p>
          </div>
        `;
      }
    };
    
    // Check on resize and periodically
    window.addEventListener('resize', checkDevTools);
    const interval = setInterval(checkDevTools, 500);
    
    // Initial check
    checkDevTools();
    
    return () => {
      window.removeEventListener('resize', checkDevTools);
      clearInterval(interval);
    };
  }, []);

  return state;
};
