# Moltfluence — Avalanche Build Games 

Moltfluence is an autonomous AI influencer pipeline built on the **Avalanche C-Chain**. It empowers creators and brands to deploy agentic AI personas that can research trending topics, write engaging scripts, generate cinematic videos, and autonomously publish to social media — all facilitated through zero-friction, gasless x402 micropayments on Avalanche.

---

## 🏔️ The Problem We Are Solving

Content creation is currently a high-friction, capital-intensive process. Managing an influencer brand requires constant trend monitoring, scriptwriting, video production, and social media management. Meanwhile, the emerging "Agentic Web" is disjointed: AI agents operate in silos and struggle to pay for the compute resources (like expensive video generation models) required to perform complex tasks autonomously. Subscriptions (SaaS) and API keys don't work for autonomous AI-to-AI transactions.

**The Solution:** Moltfluence introduces an end-to-end Autonomous Creator Engine powered by an agent swarm. To solve the payment bottleneck, we implemented the **x402 Protocol on Avalanche**, allowing our AI agents to pay for compute resources (like LTX-2 video generation) dynamically, per-call, using native USDC on the Avalanche Fuji Testnet.

---

## 🛠️ Tech Stack & Architecture Decisions

**Core Stack:**
- **Frontend/Orchestration:** Next.js 14, React 18, Tailwind v4
- **Blockchain:** Avalanche Fuji C-Chain Testnet (`eip155:43113`)
- **Payments:** x402 v2 Protocol, ERC-3009 (Permit2 equivalent), Native Circle USDC
- **AI Models:** Groq (Llama-3.3-70b) for LLM Swarm, PiAPI / LTX-2 for Video Generation
- **Agent Identity:** ERC-8004 Schema (On-chain Agent Registry)

**Architecture Decisions:**
We chose the **Avalanche C-Chain** for its sub-second finality and near-zero gas fees, which are absolute requirements for high-volume API micropayments. We utilized **ERC-3009** for gasless token transfers. This means the Human user simply signs an intent, and the AI agent (or the x402 Facilitator) submits the transaction to Avalanche, completely abstracting away the need for the user to hold native AVAX for gas.

---

## ⚙️ System Architecture & Data Flow

The Moltfluence pipeline is divided into three distinct layers:

1. **Identity & Swarm Orchestration (Off-Chain):**
   - The user interacts with the Next.js UI to define the persona (niche, vibe, bio).
   - An LLM swarm (powered by Llama-3 via Groq) harvests live trends from Reddit/HackerNews and synthesizes scroll-stopping scripts tailored to that persona.

2. **Avalanche Settlement Layer (On-Chain / x402):**
   - When an expensive compute task is triggered (e.g., LTX-2 video generation), the Next.js API intercepts the request and throws a `402 Payment Required` challenge.
   - The user's MetaMask intercepts this challenge, asking them to sign an ERC-3009 authorization for a micro-amount of USDC (e.g., $0.24).
   - The signed payload is sent to our Self-Hosted x402 Facilitator, which validates the signature against the Avalanche Fuji C-Chain and broadcasts it.

3. **Execution & Distribution (Off-Chain):**
   - Once the Avalanche payment settles, the backend unlocks the compute payload, triggering the PiAPI/LTX video generation cluster.
   - The final video is passed to the Instagram Graph API (v21.0) for autonomous publishing.

---

## 🚶‍♂️ Full User Journey

1. **Step 1 (Identity Architecture):** The user lands on `/pipeline` and defines their AI influencer's core parameters (Name, Bio, Niche). They click "Initialize". The backend generates an image prompt and visualizes the persona using an AI image generator.
2. **Step 2 (Market Signal):** The LLM Swarm autonomously scrapes the web for trending topics within the chosen niche and presents 5 highly-relevant, debate-worthy video concepts.
3. **Step 3 (Script Synthesis):** The user clicks a topic. The system instantly generates 3 variant scripts (Hot Take, Breakdown, Story) matched perfectly to the AI persona's tone. 
4. **Step 4 (Avalanche Settlement):** The user proceeds to video generation. The system requests a micropayment to cover the GPU cost. MetaMask prompts the user to sign an ERC-3009 transaction on the Avalanche Fuji Testnet.
5. **Step 5 (Autonomous Publish):** Upon signature validation, the video is generated and (in live mode) pushed to the associated Instagram account.

---

## 🎯 MoSCoW Feature Framework

### Must Have
- **AI Character Generation:** The ability to rapidly spin up a persistent persona with a visual identity.
- **Agentic Swarm Pipeline:** Autonomous trend research and script synthesis using Groq/Llama-3.
- **Avalanche x402 Integration:** ERC-3009 gasless micropayments using native USDC on the Avalanche Fuji C-Chain to unlock API resources.
- **Video Rendering:** Integration with LTX-2 / PiAPI to convert the synthesized scripts into actual short-form video content.

### Should Have
- **ERC-8004 Agent Identity:** A structured, on-chain identity registry for the agents (Currently mocked on Fuji awaiting contract deployment).
- **Telegram Bot Integration:** Exposing the Next.js APIs to an OpenClaw/Nullclaw Telegram bot so users can command the pipeline entirely via mobile chat.

### Could Have
- Multi-platform autonomous posting (TikTok and YouTube Shorts, alongside Instagram).
- Advanced video lip-syncing capabilities natively built into the pipeline.

### Won't Have (For MVP)
- Mainnet Deployment (Kept on Fuji Testnet for the MVP to ensure user safety and zero-cost risk during early access).
- Long-term multi-video memory vectors (Agents treat each video prompt as an isolated event).

---

## 🌐 On-chain Avalanche Details

- **Network:** Avalanche Fuji Testnet (`eip155:43113`)
- **Payment Token:** Native Circle USDC (`0x5425890298aed601595a70AB815c96711a31Bc65`)
- **Transfer Mechanism:** ERC-3009 `transferWithAuthorization` (Gasless)
- **Facilitator:** Custom self-hosted `@x402/core` Node

*(Note: In the provided repository, `DEMO_MODE=true` is enabled by default to allow hackathon judges to evaluate the UX flow without needing to fund wallets with Testnet AVAX or expend API credits).*
