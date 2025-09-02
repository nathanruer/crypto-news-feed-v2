// src/components/Header.tsx
import { Activity } from 'lucide-react';
import { ConnectionStatus } from './ConnectionStatus';

interface HeaderProps {
  connectionStatus: 'connecting' | 'connected' | 'disconnected';
}

export const Header = ({ connectionStatus }: HeaderProps) => {
  return (
    <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-sm border-b border-border flex-shrink-0">
      <div className="max-w-6xl mx-auto py-4 px-4 sm:px-12">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Activity className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">Crypto news tracker</h1>
              <p className="text-sm text-muted-foreground">Flux d'actualités crypto en temps réel</p>
            </div>
          </div>
          <div className="self-center md:self-auto">
            <ConnectionStatus status={connectionStatus} />
          </div>
        </div>
      </div>
    </header>
  );
};