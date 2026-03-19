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
   - **MetaMask WILL pop up** to request payment for image generation via x402.
   - The image will be generated via PiAPI servers (may take a few seconds).
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

MetaMask will pop up here to sign an ERC-3009 `transferWithAuthorization` for the video generation cost ($0.24 USDC). The signature is verified and settled on Avalanche Fuji via the Ultravioleta DAO facilitator.
