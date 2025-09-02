import { useState, useEffect, useCallback, useRef } from 'react';
import { NewsItem } from '@/types/News';
import { getNewsType, debounce } from '@/utils/newsUtils';
import { processBatch, fetchRecentItems, fetchAllItems } from '@/utils/supabaseUtils';
import { WEBSOCKET_CONFIG } from '@/config/constants';

export const useWebSocket = (url: string) => {
  const [articles, setArticles] = useState<NewsItem[]>([]);
  const [tweets, setTweets] = useState<NewsItem[]>([]);
  const [allArticles, setAllArticles] = useState<NewsItem[]>([]);
  const [allTweets, setAllTweets] = useState<NewsItem[]>([]);
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected'>('disconnected');
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectAttempts = useRef(0);
  const pendingItemsRef = useRef<{ articles: NewsItem[]; tweets: NewsItem[] }>({ articles: [], tweets: [] });
  const isMountedRef = useRef(true);

  // Debounced error logger
  const logError = useCallback(
    debounce((message: string, error: unknown) => {
      console.error(message, error);
    }, WEBSOCKET_CONFIG.ERROR_LOG_DEBOUNCE),
    []
  );

  // Fetch recent items
  const fetchRecentItemsFor = useCallback(async (table: 'articles' | 'tweets') => {
    const data = await fetchRecentItems(table, logError);
    if (isMountedRef.current) {
      if (table === 'articles') setArticles(data);
      else setTweets(data);
    }
  }, [logError]);

  // Fetch all items
  const fetchAllItemsFor = useCallback(async (table: 'articles' | 'tweets') => {
    const data = await fetchAllItems(table, logError);
    if (isMountedRef.current) {
      if (table === 'articles') setAllArticles(data);
      else setAllTweets(data);
    }
  }, [logError]);

  // WebSocket connection logic
  const connect = useCallback(() => {
    if (reconnectAttempts.current >= WEBSOCKET_CONFIG.MAX_RECONNECT_ATTEMPTS) {
      logError('Max reconnection attempts reached', null);
      return;
    }

    // setConnectionStatus('connecting');
    reconnectAttempts.current += 1;

    try {
      wsRef.current = new WebSocket(url);

      wsRef.current.onopen = () => {
        // console.log('WebSocket connected');
        setConnectionStatus('connected');
        reconnectAttempts.current = 0;
      };

      wsRef.current.onmessage = async (event) => {
        try {
          const newsItem: NewsItem = JSON.parse(event.data);
          const type = getNewsType(newsItem);
          // console.log(`WebSocket received item: _id=${newsItem._id}, type=${type}`);
          // console.log(newsItem);

          const table = type === 'article' ? 'articles' : 'tweets';
          const setItems = type === 'article' ? setArticles : setTweets;
          const setAllItems = type === 'article' ? setAllArticles : setAllTweets;

          setItems((prev) => {
            if (prev.some((item) => item._id === newsItem._id)) {
              console.warn(`Duplicate ${type} _id detected: ${newsItem._id}`);
              return prev;
            }
            return [newsItem, ...prev.slice(0, WEBSOCKET_CONFIG.DEFAULT_NEWS_LIMIT - 1)];
          });

          setAllItems((prev) => {
            if (prev.some((item) => item._id === newsItem._id)) {
              return prev;
            }
            return [newsItem, ...prev];
          });

          pendingItemsRef.current[table].push(newsItem);
          if (pendingItemsRef.current[table].length >= WEBSOCKET_CONFIG.BATCH_SIZE) {
            await processBatch(table, pendingItemsRef.current[table], logError);
          }
        } catch (error) {
          logError('Erreur parsing WebSocket:', error);
        }
      };

      wsRef.current.onclose = () => {
        // console.log('WebSocket disconnected');
        setConnectionStatus('disconnected');
        if (isMountedRef.current) {
          setTimeout(connect, WEBSOCKET_CONFIG.RECONNECT_INTERVAL);
        }
      };

      wsRef.current.onerror = (error) => {
        logError('WebSocket error:', error);
        setConnectionStatus('disconnected');
      };
    } catch (error) {
      logError('Erreur création WebSocket:', error);
      setConnectionStatus('disconnected');
      if (isMountedRef.current) {
        setTimeout(connect, WEBSOCKET_CONFIG.RECONNECT_INTERVAL);
      }
    }
  }, [url, logError]);

  // Fetch initial recent items
  useEffect(() => {
    fetchRecentItemsFor('articles');
    fetchRecentItemsFor('tweets');
  }, [fetchRecentItemsFor]);

  // Connect to WebSocket and handle cleanup
  useEffect(() => {
    isMountedRef.current = true;
    connect();

    const batchInterval = setInterval(() => {
      if (pendingItemsRef.current.articles.length > 0) {
        processBatch('articles', pendingItemsRef.current.articles, logError);
      }
      if (pendingItemsRef.current.tweets.length > 0) {
        processBatch('tweets', pendingItemsRef.current.tweets, logError);
      }
    }, 5000);

    return () => {
      isMountedRef.current = false;
      clearInterval(batchInterval);
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
    };
  }, [connect, logError]);

  return {
    tweets,
    articles,
    allTweets,
    allArticles,
    connectionStatus,
    fetchAllArticles: () => fetchAllItemsFor('articles'),
    fetchAllTweets: () => fetchAllItemsFor('tweets'),
  };
};