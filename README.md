# Mind You AI Council and AI Factory

This repository functions as the **Mind You AI Council and AI Factory**, an advanced, AI-powered internal ecosystem engineered to elevate organizational productivity by a factor of 100x. By centralizing strategic AI-driven management and operational support, it reduces manual workload, boosts efficiency, and enables seamless coordination across all technical domains.

---

## Table of Contents

- [Introduction](#introduction)
- [Developer Intelligence Feed](#developer-intelligence-feed)
- [Key Features](#key-features)
- [Project Structure](#project-structure)
- [Tooling](#tooling)
- [Pricing](#pricing)
- [Roles](#roles)
- [Research](#research)
- [Usage Guide](#usage-guide)
- [Contributing](#contributing)
- [FAQs and Support](#faqs-and-support)

---

## Introduction

Welcome to the Mind You AI ecosystem, where you can supercharge your workflows with tailored agent models, advanced tools, and best-in-class productivity software. This repository provides everything needed to implement AI in your organization with structured guidance, clear references, and adaptable technologies.

---

## New Team Members - Start Here

**Welcome to the team!** If you're a new employee or intern, start with our comprehensive onboarding guide:

**→ [Developer Onboarding Guide](./docs/INSTRUCTIONS.md)**

This guide walks you through:

- Getting GitHub Copilot through GitHub Education
- Getting Gemini Pro through Google Education
- Setting up VS Code with GitHub Copilot
- Installing and configuring opencode CLI
- Installing and configuring Gemini CLI
- Complete verification and testing

**Estimated time:** 2-3 hours (including approval wait times)

---

## Developer Intelligence Feed

The Developer Intelligence Feed is an engineering intelligence dashboard currently being developed within the AI Factory ecosystem. Its purpose is to aggregate and centralize high-signal technical news, discussions, trends, security updates, and engineering resources from multiple sources into a single searchable interface.

The platform currently supports ingestion from:

- Hacker News
- RSS Feeds
- GitHub Trending
- Manually Curated Feed Sources

All feed data is normalized and stored in a centralized SQLite database, allowing the dashboard to provide a unified view of engineering-related information.

### Dashboard Architecture

```text
Feed Sources
(Manual, RSS, Hacker News, GitHub Trending)
        ↓
Feed Ingesters
        ↓
SQLite Database (data/dashboard.db)
        ↓
API Layer (/api/feed)
        ↓
Engineering Briefing
Feed Dashboard
```

### Tech Stack

#### Frontend

- Next.js
- React
- TypeScript
- Tailwind CSS

#### Backend

- Next.js API Routes

#### Database

- SQLite
- better-sqlite3

#### Automation

- GitHub Actions

### Running the Dashboard

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

Dashboard:

```text
http://localhost:3000/feed
```

### Running Feed Ingestion

Run all configured feed ingesters:

```bash
npm run ingest
```

The workflow is straightforward. Running the ingestion pipeline triggers all configured ingesters — Manual Feeds, RSS Feeds, Hacker News, and GitHub Trending. Each ingester fetches new entries, normalizes the content, and stores records in the centralized SQLite database located at:

```text
data/dashboard.db
```

Duplicate entries are automatically prevented through database constraints, allowing ingestion to be executed repeatedly without generating duplicate records.

Once ingestion completes, the Next.js dashboard reads directly from the same database, making newly ingested content available immediately after refreshing the browser.

### Current Dashboard Features

- Feed aggregation
- Search
- Source filtering
- Category filtering
- Pagination
- Read/unread tracking
- Item pinning
- Manual feed creation
- Feed item deletion

### Future Direction

The project is also being used to evaluate alternatives to traditional cron-based scheduling for automated feed ingestion and update workflows. Future iterations may leverage event-driven workflows, GitHub Actions, or other automation mechanisms depending on operational requirements.

---

## Key Features

- **AI Role Optimization**: Empower agents to handle communication triage, infrastructure hygiene, and knowledge management efficiently.
- **Reduced Overhead**: Streamline delivery management and system planning.
- **Research-Driven Choices**: Robust market analysis to identify cost-efficient, high-performance AI models.

---

## Project Structure

- `/docs/` - Task overviews, research, and usage guides.
- `/diagrams/` - Mermaid charts and system architecture visuals.
- `/src/` - Source code, bot files, and AI tools.
- `/ideas/` - Brainstorming and future feature requests.
- `/shawn/` - Personal scratchpads and task lists.

---

## Tooling

### Gemini CLI

- Designed for **management, planning, summaries, and coordination tasks**.
- Features include model auto-selection and per-user rate limit awareness.

### opencode CLI

- Engineered for **structured agent execution** with manual model selection.

For more details, see [Tooling Documentation](./docs/vibe-coding-vs-legacy.md).

---

## Pricing

Explore detailed pricing analysis models, benchmarks, and strategies in the [Pricing Documentation](./docs/pricing.md).

---

## Roles

The AI ecosystem leverages distinct roles that include:

1. **Sisyphus (Orchestrator)**
2. **Oracle (Architect)**
3. **Librarian (Researcher)**

For a complete breakdown, refer to the [Role Definitions](./docs/oh-my-opencode-models.md).

---

## Research

The ecosystem fosters a research-driven workflow. Access benchmarks, live leaderboards, and plugins via the [Research Resource](./docs/research.md).

---

## Usage Guide

### Getting Started

1. Read the [Role Definitions](./docs/oh-my-opencode-models.md) to understand available agents.
2. Explore the `/src` folder for predefined templates and implementation examples.
3. Create your first agent using the provided scaffold.

---

## Contributing

We welcome contributions! Check out our [Contributing Guide](./ideas/to-discuss.md) for more information.

---

## FAQs and Support

Frequently asked questions and step-by-step troubleshooting guidelines are available [here](./docs/WARP.md).

---

## Targets for 2026

### Engineering Goals

- Automate repetitive tasks like Jira updates.

### Quality Improvements

- Enhance architecture reviews.

For complete targets, check out the [Strategic Plans](./docs/reference-prompts.md).

---

This repo evolves continuously thanks to the contributions of the engineering team.
