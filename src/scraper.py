import requests
from bs4 import BeautifulSoup
import json
import os
from datetime import datetime

# Configuration
SLACK_WEBHOOK_URL = os.getenv("SLACK_WEBHOOK_URL")
GITHUB_TRENDING_URL = "https://github.com/trending"
MD_FILE_PATH = "ideas/trending.md"

def get_trending_repos():
    """Fetch the top 5 trending repositories from GitHub."""
    try:
        response = requests.get(GITHUB_TRENDING_URL, timeout=10)
        response.raise_for_status()
        soup = BeautifulSoup(response.text, 'html.parser')
        repos = []
        
        for article in soup.find_all('article', class_='Box-row')[:5]:
            h2 = article.find('h2', class_='h3 lh-condensed')
            a_tag = h2.find('a')
            
            repo_name = a_tag.text.strip().replace(' ', '').replace('\n', '')
            repo_url = f"https://github.com{a_tag['href']}"
            
            p_tag = article.find('p', class_='col-9 color-fg-muted my-1 pr-4')
            description = p_tag.text.strip() if p_tag else "No description provided."
            
            repos.append({'name': repo_name, 'url': repo_url, 'description': description})
            
        return repos
    except Exception as e:
        print(f"Error fetching trending repos: {e}")
        return []

def format_slack_message(repos):
    """Format the message using Slack's Block Kit."""
    rank_emojis = ["1️⃣", "2️⃣", "3️⃣", "4️⃣", "5️⃣"]

    blocks = [
        {
            "type": "header",
            "text": {
                "type": "plain_text",
                "text": "🔥 Today's Top Trending GitHub Repos"
            }
        },
        {"type": "divider"}
    ]

    for i, repo in enumerate(repos):
        rank = rank_emojis[i] if i < len(rank_emojis) else f"#{i + 1}"
        blocks.append({
            "type": "section",
            "text": {
                "type": "mrkdwn",
                "text": f"{rank}  *<{repo['url']}|{repo['name']}>*\n_{repo['description']}_"
            }
        })
        blocks.append({"type": "divider"})

    return {"blocks": blocks}

def send_to_slack(message):
    """Send the formatted message to Slack."""
    if SLACK_WEBHOOK_URL:
        try:
            requests.post(
                SLACK_WEBHOOK_URL, 
                data=json.dumps(message), 
                headers={'Content-Type': 'application/json'},
                timeout=10
            )
        except Exception as e:
            print(f"Error sending to Slack: {e}")

def save_to_markdown(repos):
    """Save repos to trending.md with smart month/date headers."""
    now = datetime.now()
    month_header = f"## {now.strftime('%B %Y')}"
    date_header = f"### {now.strftime('%Y-%m-%d')}"
    
    if not os.path.exists(MD_FILE_PATH):
        with open(MD_FILE_PATH, "w", encoding="utf-8") as f:
            f.write("# Trending Technology Log\n\n")

    with open(MD_FILE_PATH, "r", encoding="utf-8") as f:
        content = f.read()

    # Prevent duplicates for the same day
    if date_header in content:
        print(f"Skipping: {date_header} already exists in {MD_FILE_PATH}.")
        return False

    new_entry = f"\n{date_header}\n"
    for i, repo in enumerate(repos, start=1):
        new_entry += f"{i}. **[{repo['name']}]({repo['url']})**: {repo['description']}\n"

    # If month header doesn't exist, create it at the end
    if month_header not in content:
        with open(MD_FILE_PATH, "a", encoding="utf-8") as f:
            f.write(f"\n{month_header}\n{new_entry}")
    else:
        # Insert after the month header to keep newest at the top of the month
        # or just append to the end of the file (simpler for append-only)
        with open(MD_FILE_PATH, "a", encoding="utf-8") as f:
            f.write(new_entry)
    
    return True

if __name__ == "__main__":
    trending_repos = get_trending_repos()
    
    if trending_repos:
        updated = save_to_markdown(trending_repos)
        if updated:
            slack_msg = format_slack_message(trending_repos)
            send_to_slack(slack_msg)
            print("Success: Repos fetched, markdown updated, and Slack notified.")
        else:
            print("No update needed (already logged today).")
    else:
        print("Error: No repositories found.")
