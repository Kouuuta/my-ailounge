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

  // WordPress
  { url: "https://wordpress.org/news/feed/",              category: "wordpress", feedFile: "09-wordpress-news.md" },
  { url: "https://developer.wordpress.org/news/feed/",    category: "wordpress", feedFile: "09-wordpress-news.md" },
  { url: "https://developer.woocommerce.com/feed/",       category: "wordpress", feedFile: "09-wordpress-news.md" },

  // Docker
  { url: "https://www.docker.com/blog/feed/",              category: "docker",   feedFile: "10-docker-news.md" },

  // DevOps
  { url: "https://devops.com/feed/",                       category: "devops",   feedFile: "11-devops-news.md" },
  { url: "https://thenewstack.io/feed/",                   category: "devops",   feedFile: "11-devops-news.md" },

  // GitHub
  { url: "https://github.blog/feed/",                      category: "github",   feedFile: "12-github-news.md" },
  { url: "https://github.blog/engineering/feed/",          category: "github",   feedFile: "12-github-news.md" },

];
