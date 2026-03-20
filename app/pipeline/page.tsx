"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const API_BASE = "";

// Helper to include session ID in every API call
function apiHeaders(extra?: Record<string, string>): Record<string, string> {
  const id = typeof window !== "undefined" ? getSessionId() : "ssr";
  return { "Content-Type": "application/json", "x-user-id": id, ...extra };
}

type CharacterProfile = {
  id: string;
  name?: string;
  niche: string;
  vibe: string;
  characterType: string;
  imageUrl?: string;
  imagePrompt?: string;
  role?: string;
  language?: string;
  aggressiveness?: string;
  styleGuide?: string;
  exclusions?: string[];
};

type Topic = {
  id: string;
  title: string;
  angle?: string;
  engagementScore?: number;
};

type Script = {
  id: string;
  title: string;
  hook: string;
  body: string;
  cta: string;
  durationTargetSec?: number;
};

// Stable session ID — persists across requests, survives page refresh
function getSessionId(): string {
  if (typeof window === "undefined") return "ssr";
  let id = sessionStorage.getItem("molt-session");
  if (!id) {
    id = `web-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    sessionStorage.setItem("molt-session", id);
  }
  return id;
}

export default function PipelinePage() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const sessionId = typeof window !== "undefined" ? getSessionId() : "ssr";

  // Form States
  const [charName, setCharName] = useState("");
  const [charBio, setCharBio] = useState("");
  const [niche, setNiche] = useState("crypto");
  const [vibe, setVibe] = useState("confident");

  // Pipeline Data
  const [videoDuration, setVideoDuration] = useState(6);
  const [character, setCharacter] = useState<CharacterProfile | null>(null);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [scripts, setScripts] = useState<Script[]>([]);
  const [selectedTopic, setSelectedTopic] = useState("");
  const [compiledPrompt, setCompiledPrompt] = useState("");

  const steps = ["Identity", "Market", "Scripting", "Synthesis"];

  // 1. Create Character
  const handleCreateIdentity = async () => {
    setLoading("Architecting Identity...");
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/api/state/character`, {
        method: "POST",
        headers: apiHeaders(),
        body: JSON.stringify({
          characterType: `${charName}. ${charBio}`.slice(0, 80),
          niche,
          vibe,
          role: "influencer",
          language: "en",
          aggressiveness: "spicy",
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Creation failed");

      const profile = data.profile;

      // Auto-trigger portrait
      setLoading("Visualizing Persona...");
      const imgRes = await fetch(`${API_BASE}/api/x402/generate-image`, {
        method: "POST",
        headers: apiHeaders(),
        body: JSON.stringify({ prompt: profile.imagePrompt, characterId: profile.id }),
      });
      const imgData = await imgRes.json();

      if (imgData.error) throw new Error(imgData.error);

      // Poll for image
      let attempts = 0;
      const poll = setInterval(async () => {
        try {
          const check = await fetch(`${API_BASE}/api/x402/generate-image/${imgData.jobId}`);
          const status = await check.json();
          if (status.status === "completed") {
            clearInterval(poll);
            setCharacter({ ...profile, imageUrl: status.imageUrl, name: charName });
            setLoading(null);
            setStep(2);
          } else if (status.status === "failed") {
            clearInterval(poll);
            setError("Visualization failed: " + (status.error || "Unknown error"));
            setLoading(null);
          }
        } catch (e) {
          console.error("Polling error", e);
        }

        if (++attempts > 30) {
          clearInterval(poll);
          setCharacter({ ...profile, name: charName });
          setLoading(null);
          setStep(2);
        }
      }, 3000);
    } catch (err: any) {
      setError(err.message);
      setLoading(null);
    }
  };

  // 2. Market Research
  const fetchTrends = async () => {
    setLoading("Scanning Social Grid...");
    try {
      const res = await fetch(`${API_BASE}/api/swarm/trends`, {
        method: "POST",
        headers: apiHeaders(),
        body: JSON.stringify({ niche: character?.niche }),
      });
      const data = await res.json();
      setTopics(data.topics || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(null);
    }
  };

  useEffect(() => {
    if (step === 2 && topics.length === 0) fetchTrends();
  }, [step]);

  // 3. Scripting
  const selectTopic = async (title: string) => {
    setSelectedTopic(title);
    setLoading("Synthesizing Script...");
    try {
      const res = await fetch(`${API_BASE}/api/swarm/scripts`, {
        method: "POST",
        headers: apiHeaders(),
        body: JSON.stringify({ characterProfile: character, topic: title, mode: "manual-topic" }),
      });
      const data = await res.json();
      setScripts(data.scripts || []);
      setStep(3);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(null);
    }
  };

  // 4. Final Compile
  const compileVideo = async (script: Script) => {
    setLoading("Compiling Neural Prompt...");
    try {
      const res = await fetch(`${API_BASE}/api/swarm/prompt-compile`, {
        method: "POST",
        headers: apiHeaders(),
        body: JSON.stringify({
          profile: character,
          brief: {
            id: `brief-${Date.now()}`,
            userKey: "web-ui",
            mode: "manual-topic",
            niche: character?.niche || "crypto",
            topic: selectedTopic,
            createdAt: new Date().toISOString()
          },
          script
        }),
      });
      const data = await res.json();
      setCompiledPrompt(data.promptPackage?.primaryPrompt || "Ready for LTX-2");
      setStep(4);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(null);
    }
  };

  const executeVideoGeneration = async () => {
    setLoading("Connecting Wallet...");
    try {
      // ── Step 1: Connect MetaMask ──
      let provider: any = (window as any).ethereum;
      if (!provider) throw new Error("MetaMask required.");
      if (provider.providers?.length) {
        provider = provider.providers.find((p: any) => p.isMetaMask) || provider.providers[0];
      }

      const accounts = await provider.request({ method: "eth_requestAccounts" });
      const address = accounts[0];

      // ── Step 2: Switch to Avalanche Fuji ──
      try {
        await provider.request({ method: "wallet_switchEthereumChain", params: [{ chainId: "0xa869" }] });
      } catch (switchErr: any) {
        if (switchErr.code === 4902) {
          await provider.request({
            method: "wallet_addEthereumChain",
            params: [{
              chainId: "0xa869",
              chainName: "Avalanche Fuji Testnet",
              nativeCurrency: { name: "AVAX", symbol: "AVAX", decimals: 18 },
              rpcUrls: ["https://api.avax-test.network/ext/bc/C/rpc"],
              blockExplorerUrls: ["https://testnet.snowtrace.io"],
            }],
          });
        }
      }

      // ── Step 3: Try free quota first (no payment needed) ──
      setLoading("Checking free quota...");
      const freeRes = await fetch(`${API_BASE}/api/x402/generate-video`, {
        method: "POST",
        headers: apiHeaders(),
        body: JSON.stringify({
          prompt: compiledPrompt, duration: videoDuration,
          imageUrl: character?.imageUrl, characterId: character?.id,
        }),
      });

      if (freeRes.ok) {
        const data = await freeRes.json();
        alert(`Video generated (free quota)!\nJob ID: ${data.jobId}`);
        setStep(1);
        return;
      }

      // ── Step 4: Free quota exhausted — direct USDC transfer via MetaMask ──
      // Uses ethers.js BrowserProvider + Contract per Avalanche docs:
      // "interact with USDC using standard Web3 libraries like ethers.js"
      // Ref: https://build.avax.network/integrations/circlepay
      setLoading("Approving USDC Payment...");

      const USDC_ADDRESS = "0x5425890298aed601595a70AB815c96711a31Bc65";
      const TREASURY = "0xa8b17F22A7c71F6E12D741Ef4a342A793c74ce6c";
      const amountUsdc = videoDuration <= 8 ? 240000 : 400000; // $0.24 (6s) or $0.40 (10s)

      const { BrowserProvider, Contract } = await import("ethers");
      const ethersProvider = new BrowserProvider(provider);
      const signer = await ethersProvider.getSigner();

      const usdc = new Contract(
        USDC_ADDRESS,
        ["function transfer(address to, uint256 amount) returns (bool)", "function symbol() view returns (string)", "function decimals() view returns (uint8)"],
        signer
      );

      const tx = await usdc.transfer(TREASURY, amountUsdc);
      setLoading("Waiting for confirmation...");
      const receipt = await tx.wait();
      const txHash = receipt.hash;

      setLoading("Payment confirmed. Generating video...");

      // ── Step 5: Call generate-video with tx hash as payment proof ──
      const res = await fetch(`${API_BASE}/api/x402/generate-video`, {
        method: "POST",
        headers: apiHeaders({ "Payment-Signature": txHash }),
        body: JSON.stringify({
          prompt: compiledPrompt, duration: videoDuration,
          imageUrl: character?.imageUrl, characterId: character?.id,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Generation failed");

      alert(`Payment confirmed on Avalanche Fuji!\nTx: ${txHash}\nVideo Job ID: ${data.jobId}\n\nhttps://testnet.snowtrace.io/tx/${txHash}`);
      setStep(1);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(null);
    }
  };

  const scriptAccentColors = ["border-l-[#ff3b30]", "border-l-[#0d0df2]", "border-l-[#ffcc00]"];
  const scriptTypeLabels = ["Hot Take", "Breakdown", "Story"];
  const scriptTypeDotColors = ["bg-[#ff3b30]", "bg-[#0d0df2]", "bg-[#ffcc00]"];
  const scriptBtnColors = [
    "bg-[#ff3b30] hover:bg-red-700 text-white",
    "bg-[#0d0df2] hover:bg-blue-800 text-white",
    "bg-[#ffcc00] hover:bg-yellow-500 text-[#101022]",
  ];

  return (
    <main
      className="relative min-h-screen text-slate-100 overflow-x-hidden"
      style={{
        fontFamily: "var(--font-space-grotesk), 'Space Grotesk', sans-serif",
        background: "#101022",
        backgroundImage: "radial-gradient(circle, #222249 1px, transparent 1px)",
        backgroundSize: "40px 40px",
      }}
    >
      <div className="relative z-10 max-w-[1200px] mx-auto w-full">
        {/* Header */}
        <header className="flex items-center justify-between border-b-4 border-slate-800 px-6 py-6">
          <div className="flex items-center gap-4">
            <div className="w-8 h-8 bg-[#0d0df2] flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
              </svg>
            </div>
            <h1 className="text-2xl font-black uppercase tracking-tighter">Moltfluence Pipeline</h1>
          </div>
          <div className="flex gap-2">
            <div className="w-8 h-8 bg-[#ff3b30]" />
            <div className="w-8 h-8 bg-[#ffcc00] rounded-full" />
            <div className="w-8 h-8 bg-[#0d0df2]" style={{ clipPath: "polygon(50% 0%, 0% 100%, 100% 100%)" }} />
          </div>
        </header>

        {/* Bauhaus Step Indicator */}
        <nav className="grid grid-cols-4 border-b-4 border-slate-800">
          {steps.map((label, i) => {
            const stepNum = i + 1;
            const isActive = step === stepNum;
            const isCompleted = step > stepNum;
            return (
              <div
                key={label}
                className={`flex flex-col items-center justify-center py-4 border-r border-slate-800 last:border-r-0 transition-colors ${
                  isActive
                    ? "bg-[#0d0df2] text-white"
                    : isCompleted
                    ? "bg-white/10 text-white"
                    : "bg-white/5"
                }`}
              >
                <span className={`text-[10px] uppercase font-bold tracking-widest ${isActive || isCompleted ? "opacity-70" : "opacity-40"}`}>
                  Step {String(stepNum).padStart(2, "0")}
                </span>
                <p className={`text-sm font-black uppercase ${isActive || isCompleted ? "" : "opacity-40"}`}>
                  {label}
                </p>
              </div>
            );
          })}
        </nav>

        {/* Error Banner */}
        {error && (
          <div className="mx-6 mt-6 p-4 bg-[#ff3b30]/10 border-4 border-[#ff3b30] text-[#ff3b30] text-sm font-bold uppercase tracking-wider">
            ERR_SIG_INT: {error}
          </div>
        )}

        {/* Content */}
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="h-[400px] flex flex-col items-center justify-center space-y-6"
            >
              <div className="relative h-24 w-24">
                <div className="absolute inset-0 border-4 border-[#0d0df2]/20" />
                <motion.div
                  className="absolute inset-0 border-4 border-t-[#0d0df2] border-r-transparent border-b-transparent border-l-transparent"
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                />
              </div>
              <p className="text-[#0d0df2] font-black text-sm tracking-[0.3em] uppercase">
                {loading}
              </p>
            </motion.div>
          ) : (
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              {/* ═══════════════════════ STEP 1: IDENTITY ═══════════════════════ */}
              {step === 1 && (
                <div className="grid grid-cols-1 md:grid-cols-12 min-h-[calc(100vh-180px)] border-x border-slate-800">
                  {/* Left Column: Form */}
                  <section className="md:col-span-5 p-8 border-r-4 border-slate-800 flex flex-col gap-8 bg-white/5">
                    <div>
                      <h2 className="text-3xl font-black uppercase leading-none mb-2 italic">Define Persona</h2>
                      <div className="w-16 h-2 bg-[#ff3b30] mb-8" />
                    </div>
                    <div className="flex flex-col gap-6">
                      <div className="flex flex-col gap-2">
                        <label className="text-[10px] uppercase font-black tracking-widest text-[#0d0df2]">
                          Persona Name
                        </label>
                        <input
                          className="bg-transparent border-2 border-slate-700 p-3 font-bold focus:border-[#0d0df2] focus:ring-0 outline-none uppercase text-sm text-slate-100"
                          placeholder="ENTER NAME..."
                          type="text"
                          value={charName}
                          onChange={(e) => setCharName(e.target.value)}
                        />
                      </div>
                      <div className="flex flex-col gap-2">
                        <label className="text-[10px] uppercase font-black tracking-widest text-[#0d0df2]">
                          Core Directive (Bio)
                        </label>
                        <textarea
                          className="bg-transparent border-2 border-slate-700 p-3 font-bold focus:border-[#0d0df2] focus:ring-0 outline-none uppercase text-sm resize-none text-slate-100"
                          placeholder="DEFINE PURPOSE..."
                          rows={4}
                          value={charBio}
                          onChange={(e) => setCharBio(e.target.value)}
                        />
                      </div>
                      <div className="grid grid-cols-1 gap-6">
                        <div className="flex flex-col gap-2">
                          <label className="text-[10px] uppercase font-black tracking-widest text-[#0d0df2]">
                            Market Niche
                          </label>
                          <select
                            className="bg-transparent border-2 border-slate-700 p-3 font-bold focus:border-[#0d0df2] focus:ring-0 outline-none uppercase text-sm appearance-none text-slate-100"
                            value={niche}
                            onChange={(e) => setNiche(e.target.value)}
                          >
                            <option value="crypto" className="bg-[#101022]">Avalanche Ecosystem</option>
                            <option value="tech" className="bg-[#101022]">AI Infrastructure</option>
                            <option value="lifestyle" className="bg-[#101022]">Neon Future</option>
                          </select>
                        </div>
                        <div className="flex flex-col gap-2">
                          <label className="text-[10px] uppercase font-black tracking-widest text-[#0d0df2]">
                            Vibe Signature
                          </label>
                          <select
                            className="bg-transparent border-2 border-slate-700 p-3 font-bold focus:border-[#0d0df2] focus:ring-0 outline-none uppercase text-sm text-slate-100"
                            value={vibe}
                            onChange={(e) => setVibe(e.target.value)}
                          >
                            <option value="confident" className="bg-[#101022]">Alpha Confident</option>
                            <option value="chaotic" className="bg-[#101022]">Degen Chaotic</option>
                            <option value="calm" className="bg-[#101022]">Zen Architect</option>
                          </select>
                        </div>
                      </div>
                      <button
                        className="mt-4 bg-[#ff3b30] text-white py-5 px-8 font-black uppercase text-xl hover:bg-red-700 transition-colors flex items-center justify-between group disabled:opacity-50 disabled:cursor-not-allowed"
                        onClick={handleCreateIdentity}
                        disabled={!charName || !charBio}
                      >
                        Initialize Identity
                        <span className="group-hover:translate-x-2 transition-transform text-2xl">&#8594;</span>
                      </button>
                    </div>
                  </section>

                  {/* Right Column: Visualization Placeholder */}
                  <section className="md:col-span-7 p-12 flex flex-col items-center justify-center relative overflow-hidden">
                    {/* Decorative Bauhaus Elements */}
                    <div className="absolute top-10 right-10 w-32 h-32 border-4 border-[#ffcc00] rounded-full opacity-20" />
                    <div
                      className="absolute bottom-20 left-10 w-24 h-24 bg-[#0d0df2] opacity-10"
                      style={{ clipPath: "polygon(50% 0%, 0% 100%, 100% 100%)" }}
                    />
                    {/* Main Placeholder Card */}
                    <div className="relative w-full max-w-md aspect-[3/4] border-4 border-slate-100 p-2 bg-slate-900/10 backdrop-blur-sm flex flex-col">
                      <div className="flex-1 border-2 border-dashed border-slate-100/30 flex flex-col items-center justify-center p-12 text-center gap-6">
                        <div className="w-20 h-20 border-4 border-[#0d0df2] rounded-full flex items-center justify-center animate-pulse">
                          <svg className="w-10 h-10 text-[#0d0df2]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        </div>
                        <div>
                          <p className="text-xl font-black uppercase leading-tight tracking-tighter">
                            Awaiting identity parameters for visualization
                          </p>
                          <p className="text-[10px] uppercase font-bold tracking-widest mt-4 opacity-50">
                            Neural synthesis pending...
                          </p>
                        </div>
                      </div>
                      {/* Bottom geometric accent */}
                      <div className="h-16 flex border-t-2 border-slate-100">
                        <div className="flex-1 bg-[#0d0df2]" />
                        <div className="flex-1 bg-[#ff3b30]" />
                        <div className="flex-1 bg-[#ffcc00]" />
                      </div>
                    </div>
                    {/* Metadata Overlay */}
                    <div className="absolute bottom-8 right-8 text-right hidden lg:block">
                      <p className="text-[10px] font-black uppercase tracking-widest opacity-30">Render Engine: Bauhaus v4.0</p>
                      <p className="text-[10px] font-black uppercase tracking-widest opacity-30">Status: Idle</p>
                    </div>
                  </section>
                </div>
              )}

              {/* ═══════════════════════ STEP 2: MARKET SIGNAL ═══════════════════════ */}
              {step === 2 && (
                <div className="p-6 flex flex-col gap-8">
                  {/* Persona Card */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-0 border-4 border-white">
                    <div className="bg-[#ff3b30] p-6 flex items-center justify-center border-b-4 md:border-b-0 md:border-r-4 border-white">
                      <div className="w-32 h-32 border-4 border-white overflow-hidden bg-slate-200">
                        {character?.imageUrl ? (
                          <img
                            src={character.imageUrl}
                            className="w-full h-full object-cover grayscale contrast-125"
                            alt="Character"
                          />
                        ) : (
                          <div className="w-full h-full bg-slate-800 flex items-center justify-center text-white/30 text-xs font-bold uppercase">
                            NO_IMG
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="md:col-span-2 bg-slate-900/50 p-8 flex flex-col justify-center gap-4">
                      <div>
                        <span className="text-xs font-bold bg-white text-slate-900 px-2 py-1 uppercase tracking-widest">
                          Persona Profile
                        </span>
                        <h2 className="text-4xl font-black uppercase mt-2">{character?.name}</h2>
                      </div>
                      <div className="flex flex-wrap gap-4">
                        <span className="flex items-center gap-2 border-2 border-white px-3 py-1 font-bold uppercase text-sm">
                          <div className="w-3 h-3 bg-[#0d0df2] rounded-full" /> {character?.niche}
                        </span>
                        <span className="flex items-center gap-2 border-2 border-white px-3 py-1 font-bold uppercase text-sm">
                          <div className="w-3 h-3 bg-[#ffcc00]" /> {character?.vibe}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Topic Grid */}
                  <section>
                    <h3 className="text-2xl font-black uppercase mb-6 bg-[#ffcc00] text-slate-900 inline-block px-4 py-1 border-2 border-slate-900">
                      Topic Matrix
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {topics.map((t: any, i) => {
                        const topicTitle = typeof t === "string" ? t : t.title;
                        const topicAngle = typeof t === "string" ? "Trending topic in your niche" : t.angle;
                        const engScore = typeof t === "string" ? 75 : (t.engagementScore || 75);
                        const colorVariants = [
                          "hover:bg-[#0d0df2] hover:text-white",
                          "hover:bg-[#ff3b30] hover:text-white",
                          "hover:bg-[#ffcc00] hover:text-slate-900",
                        ];
                        const barColors = ["bg-[#ffcc00]", "bg-[#0d0df2]", "bg-[#ff3b30]"];
                        const boxColors = ["bg-[#ff3b30]", "bg-[#ffcc00]", "bg-[#0d0df2]"];
                        return (
                          <div
                            key={t.id || `topic-${i}`}
                            className={`group cursor-pointer border-4 border-white bg-slate-800 ${colorVariants[i % 3]} transition-colors flex flex-col`}
                            onClick={() => selectTopic(topicTitle)}
                          >
                            <div className="p-6 flex flex-col grow gap-4">
                              <div className={`w-12 h-12 border-4 border-white ${boxColors[i % 3]} group-hover:bg-white`} />
                              <h4 className="text-xl font-bold uppercase leading-tight">{topicTitle}</h4>
                              <p className="text-sm font-medium opacity-80">{topicAngle}</p>
                            </div>
                            <div className="mt-auto p-6 pt-0">
                              <div className="flex justify-between items-center mb-2">
                                <span className="text-xs font-bold uppercase">Engagement</span>
                                <span className="text-xs font-black">{engScore}%</span>
                              </div>
                              <div className="h-3 w-full bg-slate-700 border-2 border-white">
                                <div
                                  className={`h-full ${barColors[i % 3]}`}
                                  style={{ width: `${engScore}%` }}
                                />
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </section>

                  {/* Back nav */}
                  <footer className="mt-8 flex flex-col items-center gap-6 pb-12">
                    <button
                      className="text-sm font-bold uppercase tracking-widest hover:text-[#0d0df2] transition-colors flex items-center gap-2 text-slate-400"
                      onClick={() => setStep(1)}
                    >
                      &#8592; Return to Identity
                    </button>
                  </footer>
                </div>
              )}

              {/* ═══════════════════════ STEP 3: SCRIPT SYNTHESIS ═══════════════════════ */}
              {step === 3 && (
                <div className="flex-1 flex flex-col max-w-4xl mx-auto w-full px-6 py-12">
                  {/* Page Title */}
                  <div className="mb-10 border-l-4 border-[#0d0df2] pl-6">
                    <h1 className="text-5xl md:text-6xl font-bold leading-none tracking-tighter mb-2 italic uppercase">
                      Script Synthesis
                    </h1>
                    <p className="text-slate-400 text-lg">
                      Synthesizing content for:{" "}
                      <span className="text-slate-100 font-medium">
                        {selectedTopic.length > 40 ? selectedTopic.substring(0, 40) + "..." : selectedTopic}
                      </span>
                    </p>
                  </div>

                  {/* Script Cards */}
                  <div className="flex flex-col gap-6">
                    {scripts.map((s, i) => (
                      <div
                        key={i}
                        className={`group flex flex-col md:flex-row items-stretch border border-slate-800 bg-slate-900/40 backdrop-blur-sm overflow-hidden transition-all border-l-[12px] ${scriptAccentColors[i % 3]}`}
                      >
                        <div className="p-8 flex-1 flex flex-col justify-center">
                          <div className="flex items-center gap-2 mb-4">
                            <span className={`h-2 w-2 ${scriptTypeDotColors[i % 3]}`} />
                            <span className="font-bold text-xs uppercase tracking-widest" style={{ color: i % 3 === 0 ? "#ff3b30" : i % 3 === 1 ? "#0d0df2" : "#ffcc00" }}>
                              Script Type: {scriptTypeLabels[i % 3]}
                            </span>
                          </div>
                          <p className="text-xl md:text-2xl italic font-light mb-4 leading-snug">
                            &ldquo;{s.hook}&rdquo;
                          </p>
                          <p className="text-slate-400 text-sm">{s.body}</p>
                        </div>
                        <div className="flex items-center p-8 bg-slate-800/50">
                          <button
                            className={`${scriptBtnColors[i % 3]} font-bold py-4 px-8 flex items-center gap-3 transition-transform active:scale-95 uppercase`}
                            onClick={() => compileVideo(s)}
                          >
                            Utilize This Script
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Footer Navigation */}
                  <div className="mt-16 flex justify-between items-center pt-8 border-t border-slate-800">
                    <button
                      className="flex items-center gap-2 text-slate-400 hover:text-[#0d0df2] transition-colors font-medium uppercase text-sm"
                      onClick={() => setStep(2)}
                    >
                      &#8592; Return to Market
                    </button>
                  </div>
                </div>
              )}

              {/* ═══════════════════════ STEP 4: SYNTHESIS & SETTLEMENT ═══════════════════════ */}
              {step === 4 && (
                <div className="max-w-3xl mx-auto py-12 px-6 flex flex-col gap-10">
                  {/* Header */}
                  <div className="text-center">
                    <motion.div
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="w-24 h-24 border-4 border-[#0d0df2] mx-auto mb-6 flex items-center justify-center"
                    >
                      <svg className="w-12 h-12 text-[#0d0df2]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    </motion.div>
                    <h2 className="text-5xl font-black uppercase tracking-tighter">Synthesis Ready</h2>
                    <p className="text-slate-400 text-xs tracking-[0.4em] uppercase mt-2 font-bold">
                      Agent ID 8004 // Ready for Avalanche C-Chain
                    </p>
                  </div>

                  {/* Neural Prompt Payload */}
                  <div className="border-4 border-white p-0 overflow-hidden">
                    <div className="flex justify-between items-center border-b-2 border-white px-6 py-4 bg-white/5">
                      <h3 className="text-[10px] uppercase tracking-[0.5em] text-[#0d0df2] font-black">Neural Prompt Payload</h3>
                      <span className="text-[9px] text-slate-500 font-mono uppercase">MODEL: LTX-2-FAST</span>
                    </div>
                    <div className="p-6 bg-black/50">
                      <p className="text-[11px] text-slate-300 font-mono leading-relaxed p-4 bg-white/5 border-2 border-slate-700">
                        {compiledPrompt}
                      </p>
                    </div>
                  </div>

                  {/* Duration Selector + Cost & CTA */}
                  <div className="flex flex-col items-center gap-6">
                    {/* Duration toggle */}
                    <div className="flex gap-0 border-2 border-slate-700">
                      <button
                        className={`px-8 py-3 text-sm font-black uppercase tracking-wider transition-colors ${videoDuration === 6 ? "bg-[#0d0df2] text-white" : "text-slate-500 hover:text-white"}`}
                        onClick={() => setVideoDuration(6)}
                      >
                        6s — $0.24
                      </button>
                      <button
                        className={`px-8 py-3 text-sm font-black uppercase tracking-wider transition-colors ${videoDuration === 10 ? "bg-[#0d0df2] text-white" : "text-slate-500 hover:text-white"}`}
                        onClick={() => setVideoDuration(10)}
                      >
                        10s — $0.40
                      </button>
                    </div>

                    <div className="text-center">
                      <p className="text-2xl font-black text-[#ff3b30] uppercase tracking-wider">
                        ${videoDuration <= 8 ? "0.24" : "0.40"} USDC
                      </p>
                      <p className="text-[10px] text-slate-500 uppercase tracking-[0.2em] font-bold mt-1">
                        USDC transfer on Avalanche Fuji via MetaMask
                      </p>
                    </div>

                    <button
                      className="w-full bg-[#ff3b30] text-white py-6 px-8 font-black uppercase text-xl hover:bg-red-700 transition-colors tracking-wider"
                      onClick={executeVideoGeneration}
                    >
                      Proceed to Settlement
                    </button>

                    {/* Cross-chain attestation info */}
                    <div className="w-full border-4 border-slate-800 p-6 flex items-center gap-4">
                      <div className="w-12 h-12 bg-[#0d0df2] flex items-center justify-center flex-shrink-0">
                        <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-xs font-black uppercase tracking-widest text-[#0d0df2]">
                          Avalanche Teleporter
                        </p>
                        <p className="text-[10px] text-slate-500 uppercase tracking-wider mt-1">
                          Cross-chain attestation via Avalanche Warp Messaging (AWM)
                        </p>
                      </div>
                    </div>

                    {/* Navigation */}
                    <div className="flex justify-center gap-8 pt-4">
                      <button
                        className="text-slate-400 uppercase text-sm tracking-widest hover:text-[#0d0df2] transition font-bold"
                        onClick={() => setStep(1)}
                      >
                        Reset Pipeline
                      </button>
                      <button
                        className="text-slate-400 uppercase text-sm tracking-widest hover:text-[#0d0df2] transition font-bold"
                        onClick={() => setStep(3)}
                      >
                        Back to Script
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Footer */}
        <footer className="border-t-4 border-slate-800 p-4 flex justify-between items-center text-[10px] font-black uppercase tracking-[0.2em]">
          <div className="flex gap-8">
            <span className="text-[#0d0df2]">System: Online</span>
            <span className="text-[#ff3b30]">Pipeline: Step {String(step).padStart(2, "0")}</span>
          </div>
          <div className="flex gap-4 items-center">
            <span className="opacity-40">Avalanche Build Games</span>
            <div className="w-2 h-2 bg-[#ffcc00] rounded-full" />
          </div>
        </footer>
      </div>
    </main>
  );
}
