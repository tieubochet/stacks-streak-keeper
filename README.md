# 🟧 Stacks Streak Keeper

A fully on-chain **daily streak tracking dApp** built on **Stacks**, featuring a **DAO-governed AI Storytelling** mode and **GitHub-style Contribution Heatmap**. Connect your wallet, build your habits, and vote on the future of a never-ending community story.

---

## 🧠 What does this project do?

Stacks Streak Keeper allows users to:

- 🔐 **Connect Wallet:** Login securely with Stacks wallets (Leather / Xverse).
- ✅ **Daily Check-in:** Record daily habits via on-chain transactions.
- 🔥 **Streak Tracking:** Maintain a daily streak stored securely in a Stacks smart contract.
- 📅 **Activity Heatmap (NEW):** Visualize your consistency with a GitHub-style contribution graph.
- 🗳️ **Story DAO:** Use **AI (Gemini)** to generate plot twists, submit proposals, and **vote** on the story's next chapter on-chain.
- 🏆 **Dynamic Rewards:** Mint milestone NFTs based on your streak achievements.
- 📊 **Live Leaderboard:** View real-time rankings including current and max streaks of top users.

All streak data, story proposals, and votes are **verifiable on-chain**.

---

## 🛠️ Tech Stack

### Blockchain & Smart Contracts
- **Stacks Blockchain** (Mainnet)
- **Clarity:**
  - `teeboo-streak`: Manages check-ins and streaks.
  - `story-dao`: Handles story proposals and voting mechanisms.
  - `SIP-009`: Standard for milestone NFT rewards.

### Frontend
- **Framework:** React + TypeScript + Vite
- **Styling:** Tailwind CSS + Lucide React
- **Visualization:** `react-calendar-heatmap` (Contribution Graph)
- **Stacks.js:** `@stacks/connect`, `@stacks/transactions`
- **Wallet Support:** Leather, Xverse

### AI & Backend
- **AI Integration:** Google Gemini / Groq (via SDK) for generating story proposals.
- **Hiro Chainhooks:** Real-time event listening for check-ins.
- **Vercel:** Serverless deployment.

---

## 📖 Feature Spotlight: Story DAO

The **Story Mode** has been upgraded to a decentralized voting system:

1.  **Propose:** Users use AI to generate a creative, short plot twist (max 250 chars).
2.  **Submit:** The proposal is submitted to the `story-dao` smart contract.
3.  **Vote:** The community votes on their favorite proposals using STX transactions.
4.  **Evolve:** The winning proposal becomes a permanent part of the global story history.

---

## ⛓️ Smart Contract Activity

The deployed contracts handle:

- `check-in`: Updates user streak state.
- `submit-proposal`: Records a new story segment suggestion.
- `vote-proposal`: Records votes for a specific story segment.
- `mint-badge`: Issues NFT rewards.

---

## 🚀 Getting Started

1.  **Clone the repository**
    ```bash
    git clone https://github.com/tieubochet/stacks-streak-keeper.git
    cd stacks-streak-keeper
    ```

2.  **Install dependencies**
    ```bash
    npm install
    ```

3.  **Configure Environment**
    Create a `.env` file and add your API keys (Groq/Gemini) if running local AI features.

4.  **Run the development server**
    ```bash
    npm run dev
    ```

---

## 🔗 Live Deployment

- **Frontend:** [https://stacks-streak-keeper.vercel.app](https://stacks-streak-keeper.vercel.app)
- **Smart Contracts:** Deployed on Stacks Mainnet
- **Chainhooks:** Active

*Built with ❤️ for the Bitcoin & Stacks Ecosystem.*