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
  { url: "https://cve.assurestart.co/api/feed.xml?term=microsoft,apache,linux,docker,nodejs,python,nginx,redis,postgresql,openssl&cvss_min=7", category: "security", feedFile: "08-security-alerts.md" },

  // Cloud
  { url: "https://aws.amazon.com/blogs/aws/feed/", category: "cloud", feedFile: "02-cloud-news.md" },
  { url: "https://cloud.google.com/blog/rss", category: "cloud", feedFile: "02-cloud-news.md" },

  // DevOps
  { url: "https://wordpress.org/news/feed/",          category: "devops",  feedFile: "09-devops-news.md" },
  { url: "https://developer.woocommerce.com/feed/",   category: "devops",  feedFile: "09-devops-news.md" },
  { url: "https://www.docker.com/feed/",              category: "devops",  feedFile: "09-devops-news.md" },
  { url: "https://devops.com/feed/",                  category: "devops",  feedFile: "09-devops-news.md" },

  // GitHub
  { url: "https://github.blog/feed/",                                          category: "github", feedFile: "10-github-news.md" },
  { url: "https://mshibanami.github.io/GitHubTrendingRSS/daily/all.xml",       category: "github", feedFile: "04-github-trending.md" },
  { url: "https://mshibanami.github.io/GitHubTrendingRSS/weekly/all.xml",      category: "github", feedFile: "04-github-trending.md" },
  { url: "https://mshibanami.github.io/GitHubTrendingRSS/monthly/all.xml",     category: "github", feedFile: "04-github-trending.md" },

];
