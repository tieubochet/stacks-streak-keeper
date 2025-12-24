# 🟧 Stacks Streak Keeper

A fully on-chain **daily streak tracking dApp** built on **Stacks**, showcasing smart contract activity, real user interactions, and real-time onchain event processing using **Hiro Chainhooks**.

---

## 🧠 What does this project do?

Stacks Streak Keeper allows users to:

- 🔐 Connect their Stacks wallet (Hiro / Xverse)
- ✅ Check in once per day (on-chain transaction)
- 🔥 Maintain a daily streak stored in a Stacks smart contract
- 🏆 Mint milestone NFTs based on streak achievements
- 📊 View leaderboard and personal streak stats
- 🔔 React to on-chain events in real time using **Hiro Chainhooks**

All streak data and rewards are **verifiable on-chain**.

---

## 🛠️ Tech Stack

### Blockchain
- **Stacks blockchain**
- **Clarity smart contracts**
- SIP-009 NFTs (milestone rewards)

### Frontend
- React + TypeScript
- `@stacks/connect`
- `@stacks/transactions`

### Backend / Infra
- **Hiro Chainhooks** (Week 2 challenge focus)
- Serverless endpoints (Vercel)
- Telegram notification bot (on-chain event driven)

---

## ⛓️ Smart Contract Activity

The deployed contracts handle:

- Daily check-in transactions
- Streak state tracking (current / longest streak)
- NFT minting on milestone completion

These contracts generate **real user transactions and on-chain events**, which are consumed by Chainhooks.

---

## 🔗 Hiro Chainhooks 

This project uses **Hiro Chainhooks** to listen to on-chain Stacks events in real time.

Chainhooks are configured to:

- Detect successful `check-in` contract calls
- React immediately to streak updates
- Trigger off-chain actions (notifications, indexing, analytics)

This demonstrates **event-driven architecture on Stacks**

---

## 🛠 Tech Stack & Integration Notes

- **Smart Contract:** Clarity (Stacks Mainnet) - Optimized for generating on-chain fees via Streak Check-ins and Badge Minting.
- **Wallet Integration:** - Currently using **Leather/Xverse** (via `@stacks/connect`) for stable Mainnet interactions.
- **WalletKit (Reown) SDK** is installed and configured (`@reown/appkit`) as part of the roadmap to support cross-chain EVM wallets in the next phase.

---

## 🚀 Live Deployment

- Frontend: Deployed and accessible
- Smart contracts: Deployed on Stacks
- Chainhooks: Actively running and processing events
- WalletKit (Reown) SDK is installed and configured

---

This repository intentionally demonstrates:

- ✅ Active Stacks smart contracts
- ✅ Usage of `@stacks/connect` and `@stacks/transactions`
- ✅ GitHub contributions during the challenge window
- ✅ Real-time on-chain event handling via **Hiro Chainhooks**
- ✅ WalletKit (Reown) SDK is installed and configured

*Built with ❤️ for the Bitcoin & Stacks Ecosystem.*