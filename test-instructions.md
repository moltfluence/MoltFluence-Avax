# 🧪 Moltfluence Hackathon Demo Testing Guide

Here is the exact step-by-step process you should follow to test the UI for your demo video.

**Important Setup:**
Before you start the test, please stop your currently running `yarn dev` server (Ctrl+C in the terminal), then start it again so the latest backend code we just wrote is loaded into memory:
```bash
cd /home/arch-nitro/Moltfluence-avax
yarn dev
```

### Phase 1: Character Creation (No Wallet Required)
1. Open `http://localhost:3000/create` in an Incognito window or do a Hard Refresh (Ctrl+Shift+R).
2. Fill out the "Character Registration" form:
   - Name: `@CryptoSavageAI`
   - Vibe: `Confident`
   - Niche: `Crypto`
3. Click **"Initiate Neural Link"**.
4. **What should happen:** 
   - You will see the matrix scanning animation.
   - **MetaMask WILL NOT pop up.** (It has been bypassed in `DEMO_MODE=true`).
   - The UI will finish instantly without waiting for the slow PiAPI servers.
   - You will be seamlessly transitioned to the **"Neural Link Established"** (Reveal) page.

### Phase 2: Proceed to Pipeline
1. On the "Neural Link Established" page, click the **"Neural Lock Confirmed - Proceed"** button.
2. **What should happen:** 
   - You will be navigated to the `/pipeline` page (the main dashboard).
   - If it works, you have successfully bypassed the UI navigation bug.

### Phase 3: The Video Pipeline & x402 Payment
1. On the `/pipeline` page, click the **"Run Pipeline"** or **"Generate Content"** button (whichever button initiates the video generation step).
2. **What should happen:**
   - The frontend will attempt to call the `/api/x402/generate-video` API.
   - *Wait, didn't we bypass MetaMask here too?* Let's check. 

Actually, wait. If you **WANT** MetaMask to pop up here (to prove the Avalanche integration for the hackathon judges), we need to ensure the `DEMO_MODE` logic returns a 402 challenge *first*, collects the signature, and *then* bypasses the on-chain settlement. 

If we bypassed the 402 challenge entirely in `generate-video` like we did in `generate-image`, you won't have any proof of Web3 integration for the video!
