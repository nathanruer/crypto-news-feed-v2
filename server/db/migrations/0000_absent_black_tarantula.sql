CREATE TABLE "news_items" (
	"id" text PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"body" text NOT NULL,
	"source" varchar(100) NOT NULL,
	"source_name" varchar(100) NOT NULL,
	"url" text NOT NULL,
	"tickers" jsonb NOT NULL,
	"time" timestamp with time zone NOT NULL,
	"received_at" timestamp with time zone NOT NULL,
	"raw_data" jsonb NOT NULL
);
