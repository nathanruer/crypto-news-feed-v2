import { Wifi, WifiOff, Loader2 } from 'lucide-react';

interface ConnectionStatusProps {
  status: 'connecting' | 'connected' | 'disconnected';
}

export const ConnectionStatus = ({ status }: ConnectionStatusProps) => {
  const getStatusConfig = () => {
    switch (status) {
      case 'connected':
        return {
          icon: <Wifi className="w-4 h-4" />,
          text: 'Connecté',
          className: 'text-accent bg-accent/10 border-accent/20'
        };
      case 'connecting':
        return {
          icon: <Loader2 className="w-4 h-4 animate-spin" />,
          text: 'Connexion...',
          className: 'text-primary bg-primary/10 border-primary/20'
        };
      case 'disconnected':
        return {
          icon: <WifiOff className="w-4 h-4" />,
          text: 'Déconnecté',
          className: 'text-destructive bg-destructive/10 border-destructive/20'
        };
    }
  };

  const config = getStatusConfig();

  return (
    <div className={`
      inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-sm font-medium
      ${config.className}
    `}>
      {config.icon}
      {config.text}
    </div>
  );
};