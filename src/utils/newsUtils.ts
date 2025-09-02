import { NewsItem } from '@/types/News';

// Utility to clean NewsItem for Supabase
export const cleanNewsItem = (item: NewsItem) => ({
  _id: item._id,
  title: item.title,
  time: item.time,
  symbols: item.symbols ?? null,
  suggestions: item.suggestions ?? null,
  source: item.source ?? null,
  url: item.url ?? null,
  en: item.en ?? null,
  delay: item.delay ?? null,
  body: item.body ?? null,
  link: item.link ?? null,
  icon: item.icon ?? null,
  require_interaction: item.requireInteraction ?? null,
  info: item.info ?? null,
  actions: item.actions ?? null,
  show_feed: item.show_feed ?? null,
  show_notif: item.show_notif ?? null,
  image: item.image ?? null,
});

// Utility to determine news type with priority
export const getNewsType = (news: NewsItem): 'tweet' | 'article' => {
  if (news.link?.includes('twitter.com') || news.type === 'direct') return 'tweet';
  if (news.source && news.url) return 'article';
  return 'tweet'; // Default to tweet to avoid ambiguity
};

// Debounce utility for error logging
export const debounce = <T extends (...args: any[]) => void>(fn: T, delay: number) => {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => fn(...args), delay);
  };
};