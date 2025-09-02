import { useWebSocket } from '@/hooks/useWebSocket';
import { NewsCard } from './NewsCard';
import { ConnectionStatus } from './ConnectionStatus';
import { Activity } from 'lucide-react';
import { useEffect, useState } from 'react';

export const NewsFeed = () => {
  const { news, connectionStatus } = useWebSocket('wss://news.treeofalpha.com/ws');
  const [newNewsIds, setNewNewsIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (news.length > 0) {
      const latestNews = news[0];
      setNewNewsIds(prev => new Set(prev).add(latestNews._id));

      const timer = setTimeout(() => {
        setNewNewsIds(prev => {
          const updated = new Set(prev);
          updated.delete(latestNews._id);
          return updated;
        });
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [news]);

  // Deduplicate news array based on _id
  const uniqueNews = Array.from(new Map(news.map(item => [item._id, item])).values());

  // Filter tweets: items with a Twitter link or type 'direct'
  const tweets = uniqueNews.filter(n => n.link?.includes('twitter.com') || n.type === 'direct');

  // Filter articles: items that are not tweets (and optionally have a source)
  const articles = uniqueNews.filter(n => !tweets.includes(n) && 'source' in n && n.source);

  return (
    <div className="min-h-screen flex flex-col bg-background px-12">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-sm border-b border-border flex-shrink-0">
        <div className="max-w-6xl mx-auto py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Activity className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">Crypto news tracker</h1>
              <p className="text-sm text-muted-foreground">Flux d'actualités crypto en temps réel</p>
            </div>
          </div>
          <ConnectionStatus status={connectionStatus} />
        </div>
      </header>

      {/* News Feed */}
      <main className="flex-1 flex flex-col md:flex-row gap-4 my-4 max-h-[calc(100vh-136px)]">
        {/* Colonne Articles */}
        <div className="flex-1 overflow-y-auto pr-2 space-y-4 scrollbar-custom">
          {articles.map(item => (
            <NewsCard key={`article-${item._id}`} news={item} isNew={newNewsIds.has(item._id)} />
          ))}
        </div>

        {/* Colonne Tweets */}
        <div className="flex-1 overflow-y-auto pl-2 space-y-4 scrollbar-custom">
          {tweets.map(item => (
            <NewsCard key={`tweet-${item._id}`} news={item} isNew={newNewsIds.has(item._id)} />
          ))}
        </div>
      </main>
    </div>
  );
};