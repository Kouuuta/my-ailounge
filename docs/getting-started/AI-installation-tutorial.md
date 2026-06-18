# AI CLI Tools: Quick Start (~10 Minutes)

Welcome! This guide provides the fastest path to installing the `opencode` and `gemini` command-line tools.

For a comprehensive guide covering every step from GitHub Education to model selection, see the [Full Developer Onboarding Guide](./INSTRUCTIONS.md).

---

## Step 1: Prerequisites (1 Minute)

Ensure you have **Node.js 18+ (LTS)** and **npm** installed. Open your terminal and run:

```bash
node --version
npm --version
```

**Note:** If you see a version lower than v18.x.x, please update your Node.js installation from [nodejs.org](https://nodejs.org/).

---

## Step 2: Install AI Tools via npm (2 Minutes)

Run the following commands to install the required CLIs globally. We pin the major versions to ensure compatibility:

```bash
npm install -g opencode@1.x.x
npm install -g gemini-cli@1.x.x
```

Verify the installations:

```bash
opencode --version
gemini --version
```

If you see version numbers, the tools are installed correctly.

---

## Step 3: Set Environment Variables (2 Minutes)

These tools require API keys to function. You will likely need keys for both Google (Gemini) and another provider for `opencode`.

1.  **Get your Gemini API Key:**
    *   Go to **[Google AI Studio](https://aistudio.google.com/)**.
    *   Click **"Get API key"** and create a new key.
    *   Copy the key.

2.  **Get your opencode API Key:**
    *   `opencode` typically requires an **Anthropic** or **OpenAI** key.
    *   **Ask your team lead (Shawn)** which provider key you should use for your current project.

3.  **Set the Environment Variables:**
    Replace `"your-key-here"` with your actual keys:

    ```bash
    # For Windows PowerShell
    $env:GEMINI_API_KEY="your-gemini-key"
    $env:ANTHROPIC_API_KEY="your-anthropic-key" # Or OPENAI_API_KEY

    # For macOS/Linux
    export GEMINI_API_KEY="your-gemini-key"
    export ANTHROPIC_API_KEY="your-anthropic-key"
    ```
    > **Tip:** Add these to your shell profile (e.g., `.zshrc`, `.bash_profile`, or PowerShell `$PROFILE`) to make them permanent.

---

## Step 4: Final Verification (5 Minutes)

Run the following commands to log in and verify that the tools are authenticated. 

> **Note:** `gemini login` will open your default browser to complete an OAuth flow. Keep the browser tab open until the terminal confirms success.

```bash
gemini login
opencode auth setup
```

Follow the on-screen prompts. Once completed, your setup is done.

**You are now ready to use the AI Factory tools!** For advanced configuration, troubleshooting, and model selection strategies, please refer to the [Full Developer Onboarding Guide](./INSTRUCTIONS.md).
