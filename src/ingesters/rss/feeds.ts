export interface RSSFeedConfig {
  url: string;
  category: string;
  feedFile: string;
}

export const RSS_FEEDS: RSSFeedConfig[] = [
  // AI News
  { url: "https://openai.com/news/rss.xml",       category: "ai",       feedFile: "01-ai-news.md" },
  { url: "https://raw.githubusercontent.com/Olshansk/rss-feeds/main/feeds/feed_anthropic_news.xml",       category: "ai",       feedFile: "01-ai-news.md" },
  { url: "https://blog.google/technology/ai/rss",   category: "ai",       feedFile: "01-ai-news.md" },

  // Next.js News
  { url: "https://nextjs.org/feed.xml",             category: "nextjs",   feedFile: "06-nextjs-news.md" },
  { url: "https://vercel.com/blog/rss",             category: "nextjs",   feedFile: "06-nextjs-news.md" },

  // Django News
  { url: "https://www.djangoproject.com/rss/weblog/", category: "django", feedFile: "03-django-news.md" },
  { url: "https://blog.python.org/feeds/posts/default", category: "django", feedFile: "03-django-news.md" },

  // Security
  { url: "https://github-security-advisory-rss.vercel.app/rss", category: "security", feedFile: "08-security-alerts.md" },

  // Cloud
  { url: "https://aws.amazon.com/blogs/aws/feed/", category: "cloud", feedFile: "02-cloud-news.md" },
  { url: "https://cloud.google.com/blog/rss", category: "cloud", feedFile: "02-cloud-news.md" },
];
