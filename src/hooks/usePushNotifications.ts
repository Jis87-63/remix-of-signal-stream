import { useState, useEffect, useCallback } from 'react';

interface PushNotificationState {
  isSupported: boolean;
  permission: NotificationPermission | 'default';
  isSubscribed: boolean;
  error: string | null;
}

export const usePushNotifications = () => {
  const [state, setState] = useState<PushNotificationState>({
    isSupported: false,
    permission: 'default',
    isSubscribed: false,
    error: null,
  });

  useEffect(() => {
    const checkSupport = async () => {
      const isSupported = 'Notification' in window && 'serviceWorker' in navigator;
      
      if (!isSupported) {
        setState(prev => ({
          ...prev,
          isSupported: false,
          error: 'Notificações não suportadas neste navegador',
        }));
        return;
      }

      setState(prev => ({
        ...prev,
        isSupported: true,
        permission: Notification.permission,
      }));

      // Register service worker
      try {
        const registration = await navigator.serviceWorker.register('/sw.js');
        console.log('Service Worker registrado:', registration);
        
        setState(prev => ({
          ...prev,
          isSubscribed: Notification.permission === 'granted',
        }));
      } catch (error) {
        console.error('Erro ao registrar Service Worker:', error);
      }
    };

    checkSupport();
  }, []);

  const requestPermission = useCallback(async (): Promise<boolean> => {
    if (!state.isSupported) {
      return false;
    }

    try {
      const permission = await Notification.requestPermission();
      
      setState(prev => ({
        ...prev,
        permission,
        isSubscribed: permission === 'granted',
      }));

      if (permission === 'granted') {
        // Show confirmation notification
        sendNotification({
          title: '🔔 Notificações Ativadas!',
          body: 'Você receberá alertas de sinais mesmo quando sair do site.',
        });
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Erro ao solicitar permissão:', error);
      setState(prev => ({
        ...prev,
        error: 'Erro ao solicitar permissão de notificação',
      }));
      return false;
    }
  }, [state.isSupported]);

  const sendNotification = useCallback((options: {
    title: string;
    body: string;
    icon?: string;
    tag?: string;
    data?: Record<string, unknown>;
  }) => {
    if (Notification.permission !== 'granted') {
      console.log('Permissão de notificação não concedida');
      return;
    }

    try {
      const notification = new Notification(options.title, {
        body: options.body,
        icon: options.icon || '/favicon.png',
        badge: '/favicon.png',
        tag: options.tag || 'signal-' + Date.now(),
        requireInteraction: true,
        data: options.data,
      } as NotificationOptions);

      notification.onclick = () => {
        window.focus();
        notification.close();
      };
    } catch (error) {
      // Fallback to service worker notification
      if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
        navigator.serviceWorker.ready.then(registration => {
          registration.showNotification(options.title, {
            body: options.body,
            icon: options.icon || '/favicon.png',
            badge: '/favicon.png',
            tag: options.tag || 'signal-' + Date.now(),
            requireInteraction: true,
            data: options.data,
          });
        });
      }
    }
  }, []);

  const sendSignalNotification = useCallback((multiplier: string, isEntry: boolean = true) => {
    const title = isEntry ? '🚀 ENTRADA!' : '✅ SAÍDA!';
    const body = isEntry 
      ? `Saia em: ${multiplier}` 
      : `Resultado: ${multiplier}`;
    
    sendNotification({
      title,
      body,
      tag: isEntry ? 'signal-entry' : 'signal-exit',
    });
  }, [sendNotification]);

  return {
    ...state,
    requestPermission,
    sendNotification,
    sendSignalNotification,
  };
};
