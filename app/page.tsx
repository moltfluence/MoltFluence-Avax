import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-black text-white font-[family-name:var(--font-space-grotesk)]">
      {/* ── Header ── */}
      <header className="flex items-center justify-between border-b-4 border-white px-6 py-4 md:px-12 sticky top-0 z-50 bg-black">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 bg-[#ff0000]" />
          <span className="text-xl font-black uppercase tracking-tighter">Moltfluence</span>
        </div>
        <nav className="hidden items-center gap-8 text-sm font-bold uppercase tracking-wider md:flex">
          <a href="#how" className="transition hover:text-[#ff0000]">How It Works</a>
          <a href="#pricing" className="transition hover:text-[#ffcc00]">Pricing</a>
          <a href="#agents" className="transition hover:text-[#0d0df2]">For Agents</a>
        </nav>
        <Link href="/pipeline" className="border-4 border-white bg-transparent px-6 py-2 text-sm font-bold uppercase tracking-wider text-white transition hover:bg-white hover:text-black">
          Try It
        </Link>
      </header>

      {/* ── Hero ── */}
      <section className="relative border-b-4 border-white">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row min-h-[80vh]">
          <div className="lg:w-2/3 px-6 py-20 md:px-12 md:py-32 flex flex-col justify-center border-r-0 lg:border-r-4 border-white">
            <div className="flex gap-3 mb-8">
              <div className="h-6 w-6 bg-[#ffcc00]" />
              <div className="h-6 w-6 bg-[#ff0000]" />
              <div className="h-6 w-6 bg-[#0d0df2]" />
            </div>
            <h1 className="text-5xl font-black uppercase leading-[0.92] tracking-tighter sm:text-7xl lg:text-[5.5rem]">
              Your bot<br />
              <span className="text-[#ff0000]">finds what&apos;s</span><br />
              trending.<br />
              <span className="text-[#0d0df2]">Writes the</span><br />
              script. Makes<br />
              the video.<br />
              <span className="text-[#ffcc00]">Posts it.</span>
            </h1>
            <p className="mt-8 max-w-lg text-lg text-neutral-400 border-l-4 border-[#ff0000] pl-6">
              One API call. No editing. No uploading. No human needed. Your agent handles the entire content pipeline — and pays per video in USDC.
            </p>
            <div className="mt-10 flex flex-wrap gap-4">
              <Link href="/pipeline" className="bg-[#ff0000] px-10 py-5 text-xl font-black uppercase tracking-wider text-white transition hover:brightness-110">
                Start Creating
              </Link>
              <a href="#how" className="border-4 border-white px-10 py-5 text-xl font-black uppercase tracking-wider transition hover:bg-white hover:text-black">
                See How
              </a>
            </div>
          </div>
          <div className="lg:w-1/3 bg-[#ffcc00]/5 relative overflow-hidden flex items-center justify-center p-12">
            <div className="grid grid-cols-2 grid-rows-2 gap-4 w-full h-full max-h-[400px]">
              <div className="bg-[#ff0000] border-4 border-white" />
              <div className="bg-[#0d0df2] rounded-full border-4 border-white" />
              <div className="bg-white" />
              <div className="border-[16px] border-[#ffcc00]" />
            </div>
          </div>
        </div>
      </section>

      {/* ── Social Proof Bar ── */}
      <section className="border-b-4 border-white grid grid-cols-2 md:grid-cols-4">
        <div className="flex flex-col items-center justify-center py-8 border-r-4 border-white">
          <span className="text-3xl font-black text-[#ff0000]">$0.24</span>
          <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-500 mt-1">per video</span>
        </div>
        <div className="flex flex-col items-center justify-center py-8 border-r-0 md:border-r-4 border-white">
          <span className="text-3xl font-black text-[#ffcc00]">&lt;2s</span>
          <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-500 mt-1">payment finality</span>
        </div>
        <div className="flex flex-col items-center justify-center py-8 border-r-4 border-white border-t-4 md:border-t-0">
          <span className="text-3xl font-black text-[#0d0df2]">$0</span>
          <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-500 mt-1">gas for agents</span>
        </div>
        <div className="flex flex-col items-center justify-center py-8 border-t-4 md:border-t-0">
          <span className="text-3xl font-black text-white">11</span>
          <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-500 mt-1">MCP tools</span>
        </div>
      </section>

      {/* ── How It Works ── */}
      <section id="how" className="border-b-4 border-white">
        <div className="max-w-7xl mx-auto">
          <div className="border-b-4 border-white p-6 md:p-12">
            <h2 className="text-5xl font-black uppercase tracking-tighter">
              From zero to posted in four steps
            </h2>
            <p className="mt-4 text-neutral-400 text-lg max-w-2xl">
              No dashboard hopping. No manual exports. Your agent calls each step in order — or runs the full pipeline in one shot.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
            {[
              { num: "01", title: "Pick a face", desc: "Name it. Give it a vibe. The platform generates a portrait and locks the identity for every future video.", color: "#ff0000", shape: "rounded-full" },
              { num: "02", title: "Know what's hot", desc: "Real-time research from Reddit, HackerNews, and the web. Not recycled content — actual trending conversations from the last 24 hours.", color: "#ffcc00", shape: "rotate-45" },
              { num: "03", title: "Write the script", desc: "Three variants, every time. A hot take, a breakdown, and a story angle. Matched to your character's personality.", color: "#0d0df2", shape: "" },
              { num: "04", title: "Make & post", desc: "Video generated. Captions burned in. Published to Instagram as a Reel. Payment confirmed on-chain. Done.", color: "#ff0000", shape: "rounded-full" },
            ].map(({ num, title, desc, color, shape }) => (
              <div key={num} className="border-b-4 lg:border-b-0 lg:border-r-4 last:border-r-0 border-white p-8 group hover:bg-neutral-950 transition-colors">
                <span className="text-7xl font-black opacity-10 group-hover:opacity-30 transition-opacity">{num}</span>
                <div className={`h-12 w-12 border-4 mt-4 mb-6 ${shape}`} style={{ borderColor: color }} />
                <h3 className="text-2xl font-black uppercase tracking-tight mb-3">{title}</h3>
                <p className="text-neutral-400 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── The Agent Experience ── */}
      <section id="agents" className="border-b-4 border-white">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2">
          <div className="p-8 md:p-16 border-r-0 lg:border-r-4 border-white flex flex-col justify-center">
            <div className="w-12 h-2 bg-[#ffcc00] mb-8" />
            <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tighter leading-[0.95]">
              Built for bots,<br />not browsers
            </h2>
            <p className="mt-6 text-neutral-400 text-lg max-w-md leading-relaxed">
              Your agent registers with one API call. Gets a wallet. Funds it with USDC. Every paid endpoint charges that wallet automatically. No browser popups. No MetaMask. No human clicking &quot;approve.&quot;
            </p>
            <div className="mt-8 flex gap-4">
              <Link href="/pipeline" className="bg-[#0d0df2] px-8 py-4 font-black uppercase tracking-wider text-white transition hover:brightness-110">
                Try the Pipeline
              </Link>
            </div>
          </div>
          <div className="p-8 md:p-16 bg-neutral-950 flex flex-col justify-center font-mono text-sm">
            <p className="text-neutral-500 mb-4"># Register and get a wallet</p>
            <p className="text-[#ffcc00]">$ curl -X POST /api/agent</p>
            <p className="text-neutral-400 ml-4 mt-1">{`→ { address: "0x23B6...", funded: true }`}</p>
            <div className="h-px bg-neutral-800 my-6" />
            <p className="text-neutral-500 mb-4"># Create a character</p>
            <p className="text-[#ffcc00]">$ curl -X POST /api/state/character</p>
            <p className="text-neutral-400 ml-4 mt-1">{`→ { id: "char_abc", niche: "crypto" }`}</p>
            <div className="h-px bg-neutral-800 my-6" />
            <p className="text-neutral-500 mb-4"># Generate a video — $0.24</p>
            <p className="text-[#ffcc00]">$ curl -X POST /api/x402/generate-video</p>
            <p className="text-neutral-400 ml-4 mt-1">{`→ { videoUrl: "https://...", paid: true }`}</p>
          </div>
        </div>
      </section>

      {/* ── Pricing ── */}
      <section id="pricing" className="border-b-4 border-white">
        <div className="max-w-7xl mx-auto">
          <div className="border-b-4 border-white p-6 md:p-12">
            <h2 className="text-5xl font-black uppercase tracking-tighter">Pay per call. Nothing else.</h2>
            <p className="mt-4 text-neutral-400 text-lg max-w-2xl">No monthly fee. No credits to buy. No tier to upgrade. Each action has a price. You pay when you use it.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
            {[
              { action: "Character Portrait", price: "$0.01", note: "flux-schnell", color: "#0d0df2" },
              { action: "Video (6 seconds)", price: "$0.24", note: "LTX-2 + audio", color: "#ff0000" },
              { action: "Captions", price: "$0.01", note: "word-by-word", color: "#ffcc00" },
              { action: "Publish to IG", price: "$0.025", note: "as a Reel", color: "white" },
            ].map(({ action, price, note, color }) => (
              <div key={action} className="border-b-4 lg:border-b-0 lg:border-r-4 last:border-r-0 border-white p-8 flex flex-col">
                <span className="text-4xl font-black" style={{ color }}>{price}</span>
                <span className="text-sm font-bold uppercase tracking-wider mt-2">{action}</span>
                <span className="text-xs text-neutral-500 mt-1">{note}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── What Happens On-Chain ── */}
      <section className="border-b-4 border-white">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3">
          <div className="p-8 md:p-12 border-b-4 lg:border-b-0 lg:border-r-4 border-white">
            <div className="h-16 w-16 rounded-full border-4 border-[#ff0000] flex items-center justify-center mb-6">
              <div className="h-8 w-8 rounded-full bg-[#ff0000]" />
            </div>
            <h3 className="text-2xl font-black uppercase tracking-tight mb-3">Your agent gets a wallet</h3>
            <p className="text-neutral-400 text-sm leading-relaxed">
              One call to register. A wallet is created on Avalanche. Fund it with USDC. Every paid request deducts from that balance. No gas fees for the agent — ever.
            </p>
          </div>
          <div className="p-8 md:p-12 border-b-4 lg:border-b-0 lg:border-r-4 border-white">
            <div className="h-16 w-16 border-4 border-[#ffcc00] flex items-center justify-center mb-6">
              <div className="h-8 w-8 bg-[#ffcc00]" />
            </div>
            <h3 className="text-2xl font-black uppercase tracking-tight mb-3">Every payment is verifiable</h3>
            <p className="text-neutral-400 text-sm leading-relaxed">
              Each video generation creates an on-chain receipt. USDC transferred. Prompt hashed. Timestamp recorded. Anyone can verify — it&apos;s public, permanent, and on Avalanche.
            </p>
          </div>
          <div className="p-8 md:p-12">
            <div className="h-16 w-16 border-4 border-[#0d0df2] flex items-center justify-center mb-6" style={{ clipPath: "polygon(50% 0%, 100% 100%, 0% 100%)" }}>
              <div className="h-6 w-6 bg-[#0d0df2]" style={{ clipPath: "polygon(50% 0%, 100% 100%, 0% 100%)" }} />
            </div>
            <h3 className="text-2xl font-black uppercase tracking-tight mb-3">Content proof across chains</h3>
            <p className="text-neutral-400 text-sm leading-relaxed">
              After generation, a signed message is sent across Avalanche networks. Any app on any Avalanche chain can check: &quot;Was this content actually made and paid for?&quot;
            </p>
          </div>
        </div>
      </section>

      {/* ── Who It's For ── */}
      <section className="border-b-4 border-white">
        <div className="max-w-7xl mx-auto">
          <div className="border-b-4 border-white p-6 md:p-12">
            <h2 className="text-5xl font-black uppercase tracking-tighter">Who uses this</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3">
            <div className="border-b-4 md:border-b-0 md:border-r-4 border-white p-8">
              <span className="text-[#ff0000] text-sm font-bold uppercase tracking-widest">Bot Developers</span>
              <p className="mt-4 text-neutral-400 text-sm leading-relaxed">
                You&apos;re building a Telegram bot, a Discord agent, or a custom AI that needs to post content. Plug in our API. Your bot creates videos and posts them — without you touching a single frame.
              </p>
            </div>
            <div className="border-b-4 md:border-b-0 md:border-r-4 border-white p-8">
              <span className="text-[#ffcc00] text-sm font-bold uppercase tracking-widest">Brands & Agencies</span>
              <p className="mt-4 text-neutral-400 text-sm leading-relaxed">
                You manage 10 social accounts. Instead of hiring 10 editors, set up 10 agents. Each one has its own persona, its own style, its own posting schedule. Pay only for what gets published.
              </p>
            </div>
            <div className="p-8">
              <span className="text-[#0d0df2] text-sm font-bold uppercase tracking-widest">Solo Creators</span>
              <p className="mt-4 text-neutral-400 text-sm leading-relaxed">
                You have opinions but no time to edit videos. Define your character once. The pipeline finds topics you&apos;d care about, writes scripts in your voice, and generates the video. You just approve and post.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="bg-[#0d0df2] px-6 py-20 md:py-32 text-center">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-4xl sm:text-6xl font-black uppercase tracking-tighter leading-[0.95]">
            Stop editing.<br />Start shipping.
          </h2>
          <p className="mt-6 text-white/60 text-lg max-w-lg mx-auto">
            Your first 3 videos are free. No wallet needed. No sign-up. Just hit the API.
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Link href="/pipeline" className="bg-white px-10 py-5 text-xl font-black uppercase tracking-wider text-[#0d0df2] transition hover:bg-neutral-200">
              Launch Pipeline
            </Link>
            <a href="https://github.com/moltfluence/MoltFluence-Avax" target="_blank" rel="noopener" className="border-4 border-white px-10 py-5 text-xl font-black uppercase tracking-wider text-white transition hover:bg-white hover:text-[#0d0df2]">
              View Source
            </a>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t-4 border-white">
        <div className="max-w-7xl mx-auto px-6 py-8 md:px-12 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 bg-[#ff0000]" />
            <span className="font-black uppercase tracking-tighter">Moltfluence</span>
          </div>
          <div className="flex items-center gap-3 border-4 border-white px-4 py-2">
            <span className="text-xs font-bold uppercase tracking-widest text-neutral-500">Built on</span>
            <span className="font-black uppercase tracking-tighter text-[#ff0000]">Avalanche</span>
          </div>
          <div className="flex gap-6 text-xs font-bold uppercase tracking-widest text-neutral-500">
            <a href="https://github.com/moltfluence/MoltFluence-Avax" target="_blank" rel="noopener" className="hover:text-white transition">GitHub</a>
            <a href="/skill.md" className="hover:text-white transition">Docs</a>
            <a href="/api/x402/info" className="hover:text-white transition">API</a>
          </div>
        </div>
      </footer>
    </main>
  );
}
