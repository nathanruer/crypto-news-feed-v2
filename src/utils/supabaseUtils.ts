import { supabase } from '@/lib/supabaseClient';
import { NewsItem } from '@/types/News';
import { cleanNewsItem } from '../utils/newsUtils';
import { WEBSOCKET_CONFIG } from '@/config/constants';

// Process batch inserts to Supabase
export const processBatch = async (
  table: 'articles' | 'tweets',
  pendingItems: NewsItem[],
  logError: (message: string, error: unknown) => void
) => {
  if (pendingItems.length === 0) return;

  const batch = pendingItems.splice(0, WEBSOCKET_CONFIG.BATCH_SIZE);
  try {
    // Deduplicate batch by _id
    const seenIds = new Set<string>();
    const validBatch: NewsItem[] = batch
      .filter((item) => {
        if (seenIds.has(item._id)) {
          console.warn(`Duplicate _id in batch for ${table}: ${item._id}`);
          return false;
        }
        seenIds.add(item._id);
        return true;
      })
      .map(cleanNewsItem);

    if (validBatch.length > 0) {
      // console.log(`Attempting to upsert ${validBatch.length} items into ${table}:`, validBatch.map(item => item._id));
      const { error } = await supabase.from(table).upsert(validBatch, { onConflict: '_id' });
      if (error) {
        logError(`Erreur insertion ${table} Supabase:`, error);
        throw error;
      }
      // console.log(`Successfully inserted ${validBatch.length} items into ${table}`);
    }
  } catch (error) {
    logError(`Erreur batch ${table} Supabase:`, error);
    pendingItems.push(...batch); // Re-queue items on failure
  }
};

// Fetch recent items (default 50)
export const fetchRecentItems = async (
  table: 'articles' | 'tweets',
  logError: (message: string, error: unknown) => void
): Promise<NewsItem[]> => {
  try {
    const { data, error } = await supabase
      .from(table)
      .select('*')
      .order('time', { ascending: false })
      .limit(WEBSOCKET_CONFIG.DEFAULT_NEWS_LIMIT);

    if (error) throw error;
    return data as NewsItem[];
  } catch (error) {
    logError(`Erreur GET recent ${table}:`, error);
    return [];
  }
};

// Fetch all items
export const fetchAllItems = async (
  table: 'articles' | 'tweets',
  logError: (message: string, error: unknown) => void
): Promise<NewsItem[]> => {
  try {
    const { data, error } = await supabase
      .from(table)
      .select('*')
      .order('time', { ascending: false });

    if (error) throw error;
    return data as NewsItem[];
  } catch (error) {
    logError(`Erreur GET all ${table}:`, error);
    return [];
  }
}; 