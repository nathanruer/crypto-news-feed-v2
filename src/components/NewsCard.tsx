import { ExternalLink, Clock, TrendingUp } from 'lucide-react';
import { NewsItem } from '@/types/News';

interface NewsCardProps {
  news: NewsItem;
  isNew?: boolean;
}

const formatTimestamp = (timestamp: number) => {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now.getTime() - timestamp;
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  
  if (diffMins < 1) return "À l'instant";
  if (diffMins < 60) return `${diffMins}m`;
  if (diffHours < 24) return `${diffHours}h`;
  
  return date.toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
};

// Utility to determine news type
const getNewsType = (news: NewsItem): 'tweet' | 'article' | 'unknown' => {
  if (news.link?.includes('twitter.com') || news.type === 'direct') return 'tweet';
  if (news.source && news.url) return 'article';
  return 'unknown';
};

export const NewsCard = ({ news, isNew = false }: NewsCardProps) => {
  const type = getNewsType(news);

  return (
    <div
      className={`
        bg-news-card border border-border rounded-lg p-4 transition-all duration-300
        hover:bg-news-card-hover hover:shadow-lg
        ${isNew ? 'animate-slide-in' : ''}
      `}
    >
      <div className="space-y-3">
        {/* Header */}
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-2 text-sm">
              {type === 'article' && (
                <span className="text-news-source font-medium">{news.source}</span>
              )}
              {type === 'tweet' && (
                <span className="text-news-source font-medium">Tweet</span>
              )}
              
              {/* Indicateur de délai */}
              {news.delay && news.delay > 0 && (
                <span
                  className="ml-1 px-1.5 py-0.5 text-xs font-medium rounded"
                  style={{
                    backgroundColor: 'hsl(var(--delay-bg))',
                    color: 'hsl(var(--delay-foreground))'
                  }}
                >
                  {Math.floor(news.delay / 1000)}s delay
                </span>
              )}
              
              <span className="text-news-timestamp">•</span>
              <div className="flex items-center gap-1 text-news-timestamp">
                <Clock className="w-3 h-3" />
                {formatTimestamp(news.time)}
              </div>
            </div>
            <a
              href={news.url || news.link}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:text-primary/80 transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>

        {/* Title */}
        <h3 className="text-foreground font-medium leading-relaxed break-words">
          {news.title}
        </h3>

        {/* Body pour tweets */}
        {type === 'tweet' && news.body && (
          <p className="text-sm text-muted-foreground break-words whitespace-pre-wrap">
            {news.body}
          </p>
        )}

        {/* Actions */}
        {news.actions && news.actions.length > 0 && (
          <div className="flex items-center gap-2 flex-wrap">
            {news.actions.map((action, index) => (
              <button
                key={action.action} // clé unique sur l'action
                className="px-2 py-1 bg-primary text-white text-xs font-medium rounded-md flex items-center gap-1"
              >
                {action.icon && (
                  <img src={action.icon} alt={action.title} className="w-3 h-3" />
                )}
                {action.title}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
