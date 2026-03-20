import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-black text-white font-[family-name:var(--font-space-grotesk)] overflow-x-hidden">
      {/* ── Nav ── */}
      <nav className="fixed top-0 w-full z-50 bg-black/90 backdrop-blur-sm px-6 md:px-12 py-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 bg-[#ff0000]" />
          <span className="text-lg font-black uppercase tracking-tighter">Moltfluence</span>
        </div>
        <Link href="/pipeline" className="text-sm font-bold uppercase tracking-wider hover:text-[#ff0000] transition">
          Open App →
        </Link>
      </nav>

      {/* ── Hero ── */}
      <section className="min-h-screen flex flex-col justify-center px-6 md:px-16 lg:px-24 pt-20 relative">
        {/* Bauhaus accents — floating, not bordering */}
        <div className="absolute top-32 right-[10%] h-64 w-64 rounded-full border-[3px] border-[#ffcc00] opacity-20" />
        <div className="absolute bottom-20 right-[20%] h-32 w-32 bg-[#0d0df2] opacity-10 rotate-12" />
        <div className="absolute top-1/2 right-[5%] h-20 w-20 bg-[#ff0000] opacity-15 rounded-full" />

        <div className="max-w-5xl relative z-10">
          <p className="text-sm font-bold uppercase tracking-[0.3em] text-neutral-500 mb-6">Autonomous Content Pipeline</p>
          <h1 className="text-[clamp(2.5rem,8vw,7rem)] font-black uppercase leading-[0.88] tracking-tighter">
            Your agent<br />
            researches,<br />
            <span className="text-[#ff0000]">writes,</span>{" "}
            <span className="text-[#0d0df2]">films,</span><br />
            and <span className="text-[#ffcc00]">posts.</span>
          </h1>
          <p className="mt-10 text-xl text-neutral-400 max-w-lg leading-relaxed">
            One API. Trending topics to published Reel. Pays per video in USDC.
          </p>
          <div className="mt-12 flex flex-wrap gap-5">
            <Link href="/pipeline" className="bg-[#ff0000] px-10 py-5 text-lg font-black uppercase tracking-wider transition hover:brightness-110">
              Start Creating
            </Link>
            <a href="#how" className="px-10 py-5 text-lg font-bold uppercase tracking-wider text-neutral-400 hover:text-white transition">
              How it works ↓
            </a>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-neutral-600">
          <div className="w-px h-12 bg-neutral-700" />
        </div>
      </section>

      {/* ── Numbers strip ── */}
      <section className="px-6 md:px-16 lg:px-24 py-16">
        <div className="flex flex-wrap gap-16 md:gap-24">
          <div>
            <span className="text-5xl font-black text-[#ff0000]">$0.24</span>
            <p className="text-xs font-bold uppercase tracking-widest text-neutral-500 mt-2">per video</p>
          </div>
          <div>
            <span className="text-5xl font-black text-[#ffcc00]">&lt;2s</span>
            <p className="text-xs font-bold uppercase tracking-widest text-neutral-500 mt-2">payment settlement</p>
          </div>
          <div>
            <span className="text-5xl font-black text-[#0d0df2]">$0</span>
            <p className="text-xs font-bold uppercase tracking-widest text-neutral-500 mt-2">gas for your agent</p>
          </div>
          <div>
            <span className="text-5xl font-black text-white">4</span>
            <p className="text-xs font-bold uppercase tracking-widest text-neutral-500 mt-2">steps to published</p>
          </div>
        </div>
      </section>

      {/* ── How it works ── */}
      <section id="how" className="px-6 md:px-16 lg:px-24 py-24">
        <div className="max-w-6xl">
          <div className="w-16 h-1 bg-[#ff0000] mb-8" />
          <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tighter leading-[0.92]">
            Four steps.<br />No editing software.
          </h2>
        </div>

        <div className="mt-20 grid grid-cols-1 md:grid-cols-2 gap-x-20 gap-y-24 max-w-6xl">
          <div className="group">
            <span className="text-8xl font-black text-neutral-800 group-hover:text-[#ff0000]/20 transition-colors">01</span>
            <h3 className="text-2xl font-black uppercase tracking-tight mt-4 mb-4">Pick a face</h3>
            <p className="text-neutral-400 leading-relaxed">
              Name it. Give it a vibe. Portrait generated, identity locked.
            </p>
          </div>
          <div className="group">
            <span className="text-8xl font-black text-neutral-800 group-hover:text-[#ffcc00]/20 transition-colors">02</span>
            <h3 className="text-2xl font-black uppercase tracking-tight mt-4 mb-4">See what&apos;s happening now</h3>
            <p className="text-neutral-400 leading-relaxed">
              Live from Reddit, HackerNews, and the web. What people are talking about right now.
            </p>
          </div>
          <div className="group">
            <span className="text-8xl font-black text-neutral-800 group-hover:text-[#0d0df2]/20 transition-colors">03</span>
            <h3 className="text-2xl font-black uppercase tracking-tight mt-4 mb-4">Three scripts, your voice</h3>
            <p className="text-neutral-400 leading-relaxed">
              Hot take, breakdown, and story. Written in your character&apos;s voice.
            </p>
          </div>
          <div className="group">
            <span className="text-8xl font-black text-neutral-800 group-hover:text-[#ff0000]/20 transition-colors">04</span>
            <h3 className="text-2xl font-black uppercase tracking-tight mt-4 mb-4">Video out. Reel up.</h3>
            <p className="text-neutral-400 leading-relaxed">
              6-second clip with audio and captions. Published to Instagram. Payment settled on Avalanche.
            </p>
          </div>
        </div>
      </section>

      {/* ── The terminal section ── */}
      <section className="px-6 md:px-16 lg:px-24 py-24 bg-neutral-950">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div>
            <div className="w-16 h-1 bg-[#0d0df2] mb-8" />
            <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tighter leading-[0.92]">
              Your agent<br />talks to ours<br />over HTTP.
            </h2>
            <p className="mt-6 text-neutral-400 text-lg leading-relaxed max-w-md">
              No SDK. No OAuth. Register, get a wallet, hit the API.
            </p>
          </div>
          <div className="bg-black p-8 font-mono text-sm border border-neutral-800">
            <p className="text-neutral-600">// register</p>
            <p className="text-[#ffcc00] mt-2">POST /api/agent</p>
            <p className="text-neutral-500 mt-1 ml-2">→ address: 0x23B6...321E</p>
            <p className="text-neutral-500 ml-2">→ funded: true</p>
            <div className="h-px bg-neutral-800 my-5" />
            <p className="text-neutral-600">// create persona</p>
            <p className="text-[#ffcc00] mt-2">POST /api/state/character</p>
            <p className="text-neutral-500 mt-1 ml-2">→ id: char_k9x2m</p>
            <div className="h-px bg-neutral-800 my-5" />
            <p className="text-neutral-600">// what&apos;s trending?</p>
            <p className="text-[#ffcc00] mt-2">POST /api/swarm/trends</p>
            <p className="text-neutral-500 mt-1 ml-2">→ 5 topics from live web</p>
            <div className="h-px bg-neutral-800 my-5" />
            <p className="text-neutral-600">// make the video — $0.24 USDC</p>
            <p className="text-[#ff0000] mt-2">POST /api/x402/generate-video</p>
            <p className="text-neutral-500 mt-1 ml-2">→ videoUrl: https://...</p>
            <p className="text-neutral-500 ml-2">→ paid: true</p>
          </div>
        </div>
      </section>

      {/* ── Pricing ── */}
      <section className="px-6 md:px-16 lg:px-24 py-24">
        <div className="max-w-6xl">
          <div className="w-16 h-1 bg-[#ffcc00] mb-8" />
          <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tighter">
            Pay when you publish.
          </h2>
          <p className="mt-4 text-neutral-400 text-lg max-w-xl">
            No subscription. Flat cost per action in USDC.
          </p>
        </div>

        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl">
          {[
            { price: "$0.01", label: "Portrait", sub: "character image", color: "#0d0df2" },
            { price: "$0.24", label: "Video", sub: "6s with audio", color: "#ff0000" },
            { price: "$0.01", label: "Captions", sub: "word-by-word", color: "#ffcc00" },
            { price: "$0.025", label: "Publish", sub: "to Instagram", color: "white" },
          ].map(({ price, label, sub, color }) => (
            <div key={label}>
              <span className="text-3xl md:text-4xl font-black" style={{ color }}>{price}</span>
              <p className="text-sm font-bold uppercase tracking-wider mt-2">{label}</p>
              <p className="text-xs text-neutral-600 mt-1">{sub}</p>
            </div>
          ))}
        </div>

        <p className="mt-12 text-neutral-600 text-sm">
          First 3 generations are free. No wallet needed to start.
        </p>
      </section>

      {/* ── Trust layer ── */}
      <section className="px-6 md:px-16 lg:px-24 py-24 bg-neutral-950">
        <div className="max-w-6xl mx-auto">
          <div className="w-16 h-1 bg-[#ff0000] mb-8" />
          <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tighter leading-[0.92]">
            Every dollar on-chain.<br />Every video provable.
          </h2>
          <p className="mt-6 text-neutral-400 text-lg max-w-2xl leading-relaxed">
            Payments settle in under 2 seconds. Receipts are signed by validators. Any app on Avalanche can verify it.
          </p>

          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-12">
            <div>
              <div className="h-1 w-12 bg-[#ff0000] mb-6" />
              <h3 className="text-xl font-black uppercase tracking-tight mb-3">Agent gets its own wallet</h3>
            <p className="text-neutral-500 text-sm leading-relaxed">
                Register → wallet created → fund with USDC → every call charges it. Zero gas.
              </p>
            </div>
            <div>
              <div className="h-1 w-12 bg-[#ffcc00] mb-6" />
              <h3 className="text-xl font-black uppercase tracking-tight mb-3">Payments you can audit</h3>
              <p className="text-neutral-500 text-sm leading-relaxed">
                On-chain USDC transfer. Prompt hash, timestamp, model — all on Snowtrace.
              </p>
            </div>
            <div>
              <div className="h-1 w-12 bg-[#0d0df2] mb-6" />
              <h3 className="text-xl font-black uppercase tracking-tight mb-3">Proof that crosses chains</h3>
              <p className="text-neutral-500 text-sm leading-relaxed">
                Signed and broadcast across Avalanche chains. Any app can verify the content is real.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Who it's for ── */}
      <section className="px-6 md:px-16 lg:px-24 py-24">
        <div className="max-w-6xl">
          <div className="w-16 h-1 bg-[#0d0df2] mb-8" />
          <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tighter">
            Who runs this
          </h2>
        </div>

        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-16 max-w-6xl">
          <div>
            <span className="text-sm font-bold uppercase tracking-widest text-[#ff0000]">Developers</span>
            <p className="mt-4 text-neutral-400 leading-relaxed">
              Building a bot that needs to post content? Plug in the API.
            </p>
          </div>
          <div>
            <span className="text-sm font-bold uppercase tracking-widest text-[#ffcc00]">Brands</span>
            <p className="mt-4 text-neutral-400 leading-relaxed">
              One agent per brand. Own voice, own schedule. Pay per post.
            </p>
          </div>
          <div>
            <span className="text-sm font-bold uppercase tracking-widest text-[#0d0df2]">Creators</span>
            <p className="mt-4 text-neutral-400 leading-relaxed">
              Got takes, no time to edit. Define your style once. Videos made for you.
            </p>
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="px-6 md:px-16 lg:px-24 py-32 relative">
        <div className="absolute inset-0 bg-[#0d0df2] opacity-[0.03]" />
        <div className="max-w-3xl mx-auto text-center relative z-10">
          <h2 className="text-5xl md:text-7xl font-black uppercase tracking-tighter leading-[0.9]">
            Stop editing.<br />Start shipping.
          </h2>
          <p className="mt-8 text-neutral-400 text-lg max-w-md mx-auto">
            Three free videos. No wallet to set up. No account to create. Just call the API.
          </p>
          <div className="mt-12 flex flex-wrap items-center justify-center gap-5">
            <Link href="/pipeline" className="bg-[#ff0000] px-12 py-5 text-xl font-black uppercase tracking-wider transition hover:brightness-110">
              Launch Pipeline
            </Link>
            <a href="https://github.com/moltfluence/MoltFluence-Avax" target="_blank" rel="noopener" className="px-12 py-5 text-xl font-bold uppercase tracking-wider text-neutral-400 hover:text-white transition">
              GitHub →
            </a>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="px-6 md:px-16 lg:px-24 py-8 flex flex-col md:flex-row justify-between items-center gap-4 border-t border-neutral-900">
        <div className="flex items-center gap-3">
          <div className="h-6 w-6 bg-[#ff0000]" />
          <span className="font-black uppercase tracking-tighter text-sm">Moltfluence</span>
        </div>
        <span className="text-xs text-neutral-700 uppercase tracking-widest">Built on Avalanche</span>
        <div className="flex gap-6 text-xs font-bold uppercase tracking-widest text-neutral-600">
          <a href="https://github.com/moltfluence/MoltFluence-Avax" target="_blank" rel="noopener" className="hover:text-white transition">GitHub</a>
          <a href="/skill.md" className="hover:text-white transition">Docs</a>
          <a href="/api/x402/info" className="hover:text-white transition">API</a>
        </div>
      </footer>
    </main>
  );
}
