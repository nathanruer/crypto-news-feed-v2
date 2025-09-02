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