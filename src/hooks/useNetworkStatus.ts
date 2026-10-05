import { useState, useEffect } from 'react';
import { Network, ConnectionStatus } from '@capacitor/network';

export function useNetworkStatus() {
  const [status, setStatus] = useState<ConnectionStatus>({
    connected: true,
    connectionType: 'wifi',
  });

  useEffect(() => {
    let handler: any;

    const initNetwork = async () => {
      try {
        const current = await Network.getStatus();
        setStatus(current);

        handler = await Network.addListener('networkStatusChange', (s) => {
          setStatus(s);
        });
      } catch {
        // Web browser native event fallback
        const updateOnline = () => setStatus({ connected: navigator.onLine, connectionType: 'unknown' });
        window.addEventListener('online', updateOnline);
        window.addEventListener('offline', updateOnline);
      }
    };

    initNetwork();

    return () => {
      if (handler && typeof handler.remove === 'function') {
        handler.remove();
      }
    };
  }, []);

  return status;
}
