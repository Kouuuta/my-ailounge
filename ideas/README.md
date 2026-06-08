# Ideas Folder

This folder serves as a central repository for conceptual designs, collaborative discussion points, and market research related to the project. It is used to document the "why" and "how" of future features and to track ongoing architectural decisions.

## Contents

### [Real-Time Session Helpers](session-helpers.md)
A comprehensive architecture for an AI-powered session assistance system for psychologists.

### [Proposals/](proposals/)
A directory containing detailed feature proposals and architectural drafts created using the [Idea Template](IDEA_TEMPLATE.md).

### [Archive/](archive/)
Historical records, outdated trending logs, and completed or rejected proposals.

### [To Discuss](to-discuss.md)
A living checklist of high-level tasks and strategic questions that require team alignment.

### [Trending](trending.md)
A historical log of trending technology and GitHub repositories.

### [Idea Template](IDEA_TEMPLATE.md)
A standardized template for proposing new ideas, features, or architectural changes.

## Tech We Adopted

High-value tools identified in research that are now integrated into our stack:

*   **[microsoft/markitdown](https://github.com/microsoft/markitdown)**: Used for Phase 2 data ingestion (PDF/Doc to Markdown).
*   **[anthropics/claude-code](https://github.com/anthropics/claude-code)**: Primary terminal-based agent for project development.

## Sustainability & Maintenance

To keep this research folder actionable and avoid "information rot":

1.  **Quarterly Archiving**: At the end of every quarter, move old entries from `trending.md` to a dedicated archive file (e.g., `archive/trending-2026-Q1.md`).
2.  **The "Adopted" Filter**: When a tool from research is officially added to our project, move it from the trending log to the **Tech We Adopted** section above.
3.  **Link Verification**: During quarterly reviews, remove entries with dead links or those that no longer align with our architectural direction.

## Workflow: Proposing a New Idea

Follow these steps to ensure your proposal is captured correctly and easy for the team to review:

1.  **Copy the Template**: Copy `IDEA_TEMPLATE.md` to the `proposals/` folder.
2.  **Rename**: Name your file using kebab-case (e.g., `proposals/enhanced-voice-recognition.md`).
3.  **Draft**: Fill in all sections of the template. Use the metadata header (Status, Priority) at the top.
4.  **Review**: Share the link in the appropriate communication channel for feedback.
5.  **Lifecycle**:
    *   **Active**: Keep the file in `proposals/` while it is being discussed or implemented.
    *   **Completed/Rejected**: Move the file to `archive/` once the decision is finalized to keep the active folder clean.

## Usage

- **Research**: Use `trending.md` to find inspiration. Periodically move old entries to `archive/`.
- **Planning**: Copy `IDEA_TEMPLATE.md` into the `proposals/` folder to start a new feature draft.
- **Syncing**: Use `to-discuss.md` for meeting agendas; move resolved items to the appropriate proposal or decision log.
