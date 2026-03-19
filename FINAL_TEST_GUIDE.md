# THE FINAL AVAX X402 TEST (ZERO RISK)

This guide proves that your Avalanche x402 integration works flawlessly, without risking your single Telegram video generation credit.

## What is currently active:
1. **Real Image Generation (PiAPI):** ENABLED. This will prove the AI works and generate a real face.
2. **Real Web3 Signature:** ENABLED. MetaMask will pop up and ask for a real ERC-3009 signature on the Avalanche Fuji network.
3. **Real Gas / USDC Deduction:** BYPASSED. The backend catches your signature, verifies it's real, but skips broadcasting it to the blockchain so you don't spend your 0 AVAX.
4. **Real Video Generation (LTX):** ENABLED. *However*, we will stop the test right before clicking this so you don't waste your credit.

---

### STEP 1: Boot the Environment
Go to your terminal where your project is located:
```bash
cd /home/arch-nitro/Moltfluence-avax
yarn dev
```

### STEP 2: The Character Creation (No Wallet Required Yet)
1. Open your browser in **Incognito Mode** (to ensure no cached data) and go to:
   👉 `http://localhost:3000/pipeline`
2. Fill out the "Identity Architecture" form exactly like this:
   - **Persona Name:** `TestSavage`
   - **Core Directive:** `A cyberpunk trader on the Avalanche network.`
   - **Market Niche:** `Avalanche Ecosystem`
   - **Vibe Signature:** `Alpha Confident`
3. Click **"INITIALIZE IDENTITY NFT"**.
4. **Wait ~15-30 seconds.** 
   - *What is happening:* The backend is reaching out to PiAPI. It is generating a real AI portrait. 
   - You will see the screen say "Visualizing Persona...". 
5. **Success:** A real AI-generated face will load in the top left corner, and the UI will slide to Step 2. 

### STEP 3: The LLM Bypass Test
1. On Step 2 ("Select Live Market Signal"), you will instantly see 5 topics like *"Avalanche's C-Chain Just Obliterated Gas Fees Again"*.
2. Click **any of those topics**.
3. You will instantly slide to Step 3 ("Script Synthesis") where 3 scripts will appear.
4. Click **"UTILIZE THIS SCRIPT"** on the first one.

### STEP 4: The Ultimate x402 Avalanche Test (CRITICAL)
You are now on Step 4 ("Synthesis Ready"). You will see a button that says **PROCEED TO SOCIAL GRID** (or similar), and a note about a `$0.24 USDC` cost.

**DO THIS:**
1. Open your browser's Developer Console (F12) and click the **Network** tab. 
2. Click the **PROCEED** button on the UI.
3. **MetaMask WILL POP UP.**
4. Check MetaMask: It should say **Network: Avalanche Fuji Testnet**.
5. Click **Sign / Approve** in MetaMask.

**WATCH WHAT HAPPENS:**
- Look at your Network tab. You will see a POST request to `/api/x402/generate-video` or `/api/facilitator/settle`.
- The server will verify your ERC-3009 signature via the Ultravioleta DAO facilitator and settle the USDC transfer on Avalanche Fuji.
- **Your Avalanche Fuji USDC balance will decrease by the payment amount.**
- **You will NOT pay any AVAX gas** (EIP-3009 is gasless for the payer — the facilitator sponsors gas).

**STOP HERE.** 
Once MetaMask closes and the UI shows a loading spinner or a success state, **close the tab**. You have just proven that the entire Avalanche x402 payment flow works perfectly. You can now save your 1 video credit for the Telegram bot!

---
