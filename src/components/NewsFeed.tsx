import { useWebSocket } from '@/hooks/useWebSocket';
import { NewsColumn } from './NewsColumn';
import { useEffect, useState, useRef } from 'react';
import { Header } from './Header';
import { NewsItem } from '@/types/News';

export const NewsFeed = () => {
  const {
    tweets,
    articles,
    allTweets,
    allArticles,
    connectionStatus,
    fetchAllArticles,
    fetchAllTweets,
  } = useWebSocket('wss://news.treeofalpha.com/ws');
  const [newNewsIds, setNewNewsIds] = useState<Set<string>>(new Set());
  const [showAllArticles, setShowAllArticles] = useState(false);
  const [showAllTweets, setShowAllTweets] = useState(false);
  const lastProcessedIds = useRef(new Set<string>());

  useEffect(() => {
    if (showAllArticles) fetchAllArticles();
    if (showAllTweets) fetchAllTweets();
  }, [showAllArticles, showAllTweets, fetchAllArticles, fetchAllTweets]);

  // Monitor new items
  useEffect(() => {
    const processNewItem = (item: NewsItem) => {
      if (!lastProcessedIds.current.has(item._id)) {
        lastProcessedIds.current.add(item._id);
        setNewNewsIds((prev) => new Set(prev).add(item._id));
        const timer = setTimeout(() => {
          setNewNewsIds((prev) => {
            const updated = new Set(prev);
            updated.delete(item._id);
            return updated;
          });
        }, 500);
        return () => clearTimeout(timer);
      }
      return undefined;
    };

    if (articles.length > 0) {
      return processNewItem(articles[0]);
    }
    if (tweets.length > 0) {
      return processNewItem(tweets[0]);
    }
  }, [articles, tweets]);

  return (
    <div className="min-h-screen flex flex-col bg-background px-4 sm:px-12">
      <Header connectionStatus={connectionStatus} />
      <main className="flex-1 flex flex-col md:flex-row gap-6 md:gap-6 my-4 pb-8 max-h">
        <div className="flex-1 md:w-1/2 min-h-0">
          <NewsColumn
            title="Derniers Articles/Proposals"
            items={articles}
            allItems={allArticles}
            showAll={showAllArticles}
            setShowAll={setShowAllArticles}
            newNewsIds={newNewsIds}
          />
        </div>

        {/* Séparateur vertical uniquement desktop */}
        <div className="hidden md:block w-px bg-border self-stretch" />

        <div className="flex-1 md:w-1/2 min-h-0">
          <NewsColumn
            title="Twitter Feed"
            items={tweets}
            allItems={allTweets}
            showAll={showAllTweets}
            setShowAll={setShowAllTweets}
            newNewsIds={newNewsIds}
          />
        </div>
      </main>
    </div>
  );
};