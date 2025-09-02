import { NewsItem } from '@/types/News';
import { NewsCard } from './NewsCard';
import { useState, useRef, useEffect } from 'react';

interface NewsColumnProps {
  title: string;
  items: NewsItem[];
  allItems: NewsItem[];
  showAll: boolean;
  setShowAll: (value: boolean) => void;
  newNewsIds: Set<string>;
}

export const NewsColumn = ({
  title,
  items,
  allItems,
  showAll,
  setShowAll,
  newNewsIds,
}: NewsColumnProps) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  const handleClickOutside = (event: MouseEvent) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
      setIsDropdownOpen(false);
    }
  };

  // Register click outside handler
  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="flex-col flex-1">
      {/* Header Row with Title and Dropdown */}
      <div className="flex justify-between items-center px-2 py-2 sticky top-0 bg-background/80 backdrop-blur-sm z-10">
        <h2 className="text-lg font-semibold text-foreground">{title}</h2>
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setIsDropdownOpen((prev) => !prev)}
            className="px-3 py-1 text-sm rounded-md transition-colors bg-primary text-white hover:bg-primary/90"
            aria-label={`Sélectionner le mode d'affichage pour ${title}`}
            aria-live="polite"
          >
            {showAll ? 'Tous' : '50 récents'}
          </button>
          {isDropdownOpen && (
            <div className="absolute right-0 mt-2 w-32 bg-background border border-border rounded-md shadow-lg z-20">
              <button
                onClick={() => {
                  setShowAll(false);
                  setIsDropdownOpen(false);
                }}
                className={`w-full text-left px-4 py-2 text-sm ${
                  !showAll ? 'bg-primary text-white' : 'text-foreground hover:bg-primary/10'
                }`}
              >
                50 récents
              </button>
              <button
                onClick={() => {
                  setShowAll(true);
                  setIsDropdownOpen(false);
                }}
                className={`w-full text-left px-4 py-2 text-sm ${
                  showAll ? 'bg-primary text-white' : 'text-foreground hover:bg-primary/10'
                }`}
              >
                Tous
              </button>
            </div>
          )}
        </div>
      </div>

      {/* News Items */}
      <div className="flex-1 overflow-y-auto space-y-4 scrollbar-custom max-h-[calc(100vh-136px-32px)]">
        {(showAll ? allItems : items).length === 0 ? (
          <div className="text-center text-muted-foreground py-8" aria-live="polite">
            <div className="flex justify-center items-center gap-2 mb-4">
              <div className="loading-dots">
                <span className="dot"></span>
                <span className="dot"></span>
                <span className="dot"></span>
              </div>
            </div>
            <p className="text-md">{`En attente d’un nouveau ${title.toLowerCase()}`}</p>
          </div>
        ) : (
          (showAll ? allItems : items).map((item) => (
            <NewsCard key={item._id} news={item} isNew={newNewsIds.has(item._id)} />
          ))
        )}
      </div>
    </div>
  );
};