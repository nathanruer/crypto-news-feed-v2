import { useState, useEffect, useCallback, useRef } from 'react';

export interface NewsAction {
  action: string;
  title: string;
  icon?: string;
}

export interface NewsSymbol {
  exchange?: string;
  symbol: string;
}

export interface NewsItem {
  // Propriétés communes
  _id: string;
  title: string;
  time: number;
  symbols?: (string | NewsSymbol)[];
  suggestions?: {
    found: string[];
    coin: string;
    isAccountMapped?: boolean;
    symbols: NewsSymbol[];
    supply?: number;
  }[];

  // Article
  source?: string;
  url?: string;
  en?: string;
  delay?: number;

  // Tweet / direct
  body?: string;
  link?: string;
  icon?: string;
  requireInteraction?: boolean;
  type?: string;
  info?: {
    twitterId?: string;
    isReply?: boolean;
    isRetweet?: boolean;
    isQuote?: boolean;
    isSelfReply?: boolean;
  };
  actions?: NewsAction[];
  show_feed?: boolean;
  show_notif?: boolean;
  image?: string;
}


export const useWebSocket = (url: string) => {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected'>('disconnected');
  const wsRef = useRef<WebSocket | null>(null);

  const connect = useCallback(() => {
    setConnectionStatus('connecting');
    
    try {
      wsRef.current = new WebSocket(url);
      
      wsRef.current.onopen = () => {
        console.log('WebSocket connected');
        setConnectionStatus('connected');
      };
      
      wsRef.current.onmessage = (event) => {
        try {
          const newsItem: NewsItem = JSON.parse(event.data);
          setNews(prevNews => [newsItem, ...prevNews]);
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };
      
      wsRef.current.onclose = () => {
        console.log('WebSocket disconnected');
        setConnectionStatus('disconnected');
        // Auto-reconnect after 3 seconds
        setTimeout(connect, 3000);
      };
      
      wsRef.current.onerror = (error) => {
        console.error('WebSocket error:', error);
        setConnectionStatus('disconnected');
      };
    } catch (error) {
      console.error('Error creating WebSocket connection:', error);
      setConnectionStatus('disconnected');
    }
  }, [url]);

  useEffect(() => {
    connect();
    
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [connect]);

  return { news, connectionStatus };
};