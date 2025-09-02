import { useWebSocket } from '@/hooks/useWebSocket';
import { NewsCard } from './NewsCard';
import { useEffect, useState } from 'react';
import { Header } from './Header';

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

  // Combine and sort news for mobile (by time, newest first)
  const combinedNews = [...uniqueNews].sort((a, b) => b.time - a.time);

  return (
    <div className="min-h-screen flex flex-col bg-background px-4 sm:px-12">
      {/* Header */}
      <Header connectionStatus={connectionStatus} />

      {/* News Feed */}
      <main className="flex-1 flex flex-col md:flex-row gap-4 my-4 max-h-[calc(100vh-136px)]">
        {/* Mobile: Single Combined Column */}
        <div className="flex flex-col w-full md:hidden">
          <h2 className="text-lg font-semibold text-foreground px-2 py-2 sticky top-0 bg-background/80 backdrop-blur-sm z-10">
            Flux d'Actualités
          </h2>
          <div className="flex-1 overflow-y-auto space-y-4 scrollbar-custom max-h-[calc(100vh-180px)]">
            {combinedNews.length === 0 ? (
              <div className="text-center text-muted-foreground py-8" aria-live="polite">
                <div className="flex justify-center items-center gap-2 mb-4">
                  <div className="loading-dots">
                    <span className="dot"></span>
                    <span className="dot"></span>
                    <span className="dot"></span>
                  </div>
                </div>
                <p className="text-md">En attente de nouvelles...</p>
              </div>
            ) : (
              combinedNews.map(item => (
                <NewsCard
                  key={`${item.type === 'direct' ? 'tweet' : 'article'}-${item._id}`}
                  news={item}
                  isNew={newNewsIds.has(item._id)}
                />
              ))
            )}
          </div>
        </div>

        {/* Desktop: Articles Column */}
        <div className="hidden md:flex md:flex-1 md:flex-col md:pr-2">
          <h2 className="text-lg font-semibold text-foreground px-2 py-2 sticky top-0 bg-background/80 backdrop-blur-sm z-10">
            Derniers Articles/Proposals
          </h2>
          <div className="flex-1 overflow-y-auto space-y-4 scrollbar-custom max-h-[calc(100vh-136px)]">
            {articles.length === 0 ? (
              <div className="text-center text-muted-foreground py-8" aria-live="polite">
                <div className="flex justify-center items-center gap-2 mb-4">
                  <div className="loading-dots">
                    <span className="dot"></span>
                    <span className="dot"></span>
                    <span className="dot"></span>
                  </div>
                </div>
                <p className="text-md">En attente d'un nouvel article</p>
              </div>
            ) : (
              articles.map(item => (
                <NewsCard key={`article-${item._id}`} news={item} isNew={newNewsIds.has(item._id)} />
              ))
            )}
          </div>
        </div>

        {/* Desktop: Vertical Divider */}
        <div className="hidden md:block w-px bg-border self-stretch" />

        {/* Desktop: Tweets Column */}
        <div className="hidden md:flex md:flex-1 md:flex-col md:pl-2">
          <h2 className="text-lg font-semibold text-foreground px-2 py-2 sticky top-0 bg-background/80 backdrop-blur-sm z-10">
            Twitter Feed
          </h2>
          <div className="flex-1 overflow-y-auto space-y-4 scrollbar-custom max-h-[calc(100vh-136px)]">
            {tweets.length === 0 ? (
              <div className="text-center text-muted-foreground py-8" aria-live="polite">
                <div className="flex justify-center items-center gap-2 mb-4">
                  <div className="loading-dots">
                    <span className="dot"></span>
                    <span className="dot"></span>
                    <span className="dot"></span>
                  </div>
                </div>
                <p className="text-md">En attente d'un nouveau tweet</p>
              </div>
            ) : (
              tweets.map(item => (
                <NewsCard key={`tweet-${item._id}`} news={item} isNew={newNewsIds.has(item._id)} />
              ))
            )}
          </div>
        </div>
      </main>
    </div>
  );
};