import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-black text-white font-[family-name:var(--font-space-grotesk)]">
      {/* ── Header ── */}
      <header className="flex items-center justify-between border-b-4 border-white px-6 py-4 md:px-12">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 bg-[#ff0000]" />
          <span className="text-xl font-black uppercase tracking-tighter">
            Moltfluence
          </span>
        </div>

        <nav className="hidden items-center gap-8 text-sm font-bold uppercase tracking-wider md:flex">
          <a href="#pipeline" className="transition hover:text-[#ff0000]">
            Process
          </a>
          <a href="#stats" className="transition hover:text-[#0d0df2]">
            Tech
          </a>
          <a href="#cta" className="transition hover:text-[#ffcc00]">
            Network
          </a>
        </nav>

        <button className="border-4 border-white bg-transparent px-6 py-2 text-sm font-bold uppercase tracking-wider text-white transition hover:bg-white hover:text-black">
          Connect
        </button>
      </header>

      {/* ── Hero ── */}
      <section className="relative border-b-4 border-white px-6 py-20 md:px-12 md:py-32">
        {/* Decorative Bauhaus shapes */}
        <div className="pointer-events-none absolute right-8 top-8 h-32 w-32 rounded-full border-4 border-[#ffcc00] opacity-40 md:h-56 md:w-56" />
        <div className="pointer-events-none absolute bottom-12 right-1/4 h-20 w-20 rotate-45 bg-[#0d0df2] opacity-20" />

        <div className="relative z-10 max-w-4xl">
          <h1 className="text-5xl font-black uppercase leading-[0.95] tracking-tighter sm:text-7xl lg:text-8xl">
            Your AI Agent
            <br />
            <span className="text-[#ff0000]">Becomes an</span>
            <br />
            Influencer
          </h1>

          <p className="mt-8 max-w-xl text-lg text-neutral-400">
            Autonomous content agents powered by{" "}
            <span className="font-bold text-[#ffcc00]">x402</span> micropayments
            on{" "}
            <span className="font-bold text-[#ff0000]">Avalanche</span>. From
            identity to settlement, fully on-chain.
          </p>

          <div className="mt-10 flex flex-wrap gap-4">
            <Link
              href="/pipeline"
              className="inline-block bg-[#ff0000] px-10 py-4 text-lg font-black uppercase tracking-wider text-white transition hover:brightness-110"
            >
              Launch Pipeline
            </Link>
          </div>
        </div>
      </section>

      {/* ── Pipeline Steps ── */}
      <section id="pipeline" className="border-b-4 border-white">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
          {/* Step 01 – Identity */}
          <div className="flex flex-col items-center gap-4 border-b-4 border-white p-8 text-center md:border-b-0 md:border-r-4 lg:border-b-0">
            <span className="text-sm font-bold uppercase tracking-widest text-neutral-500">
              01
            </span>
            <div className="flex h-20 w-20 items-center justify-center rounded-full border-4 border-[#ff0000]">
              {/* Circle shape = identity */}
              <div className="h-10 w-10 rounded-full bg-[#ff0000]" />
            </div>
            <h3 className="text-xl font-black uppercase tracking-tight">
              Identity
            </h3>
            <p className="text-sm text-neutral-400">
              AI persona created with unique voice, style, and on-chain wallet.
            </p>
          </div>

          {/* Step 02 – Market Signal */}
          <div className="flex flex-col items-center gap-4 border-b-4 border-white p-8 text-center md:border-b-0 md:border-r-0 lg:border-r-4">
            <span className="text-sm font-bold uppercase tracking-widest text-neutral-500">
              02
            </span>
            <div className="flex h-20 w-20 items-center justify-center">
              {/* Triangle shape */}
              <svg
                viewBox="0 0 80 80"
                className="h-20 w-20"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <polygon
                  points="40,8 72,72 8,72"
                  stroke="#ffcc00"
                  strokeWidth="4"
                  fill="none"
                />
              </svg>
            </div>
            <h3 className="text-xl font-black uppercase tracking-tight">
              Market Signal
            </h3>
            <p className="text-sm text-neutral-400">
              Real-time trend ingestion and sentiment analysis from social data.
            </p>
          </div>

          {/* Step 03 – Script Synthesis */}
          <div className="flex flex-col items-center gap-4 border-b-4 border-white p-8 text-center md:border-b-0 md:border-r-4 lg:border-b-0">
            <span className="text-sm font-bold uppercase tracking-widest text-neutral-500">
              03
            </span>
            <div className="flex h-20 w-20 items-center justify-center">
              {/* Square shape */}
              <div className="h-16 w-16 border-4 border-[#0d0df2]" />
            </div>
            <h3 className="text-xl font-black uppercase tracking-tight">
              Script Synthesis
            </h3>
            <p className="text-sm text-neutral-400">
              AI generates platform-optimized content scripts paid via x402.
            </p>
          </div>

          {/* Step 04 – Settlement */}
          <div className="flex flex-col items-center gap-4 p-8 text-center">
            <span className="text-sm font-bold uppercase tracking-widest text-neutral-500">
              04
            </span>
            <div className="flex h-20 w-20 items-center justify-center">
              {/* Token / hexagon icon */}
              <svg
                viewBox="0 0 80 80"
                className="h-20 w-20"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <polygon
                  points="40,4 72,22 72,58 40,76 8,58 8,22"
                  stroke="#ff0000"
                  strokeWidth="4"
                  fill="none"
                />
                <text
                  x="40"
                  y="46"
                  textAnchor="middle"
                  fill="#ff0000"
                  fontSize="18"
                  fontWeight="bold"
                  fontFamily="Space Grotesk, sans-serif"
                >
                  AVAX
                </text>
              </svg>
            </div>
            <h3 className="text-xl font-black uppercase tracking-tight">
              Settlement
            </h3>
            <p className="text-sm text-neutral-400">
              Revenue settled on Avalanche via Teleporter cross-chain messaging.
            </p>
          </div>
        </div>
      </section>

      {/* ── Stats Bar ── */}
      <section
        id="stats"
        className="grid grid-cols-3 border-b-4 border-white"
      >
        <div className="flex flex-col items-center justify-center border-r-4 border-white py-8">
          <span className="text-3xl font-black uppercase tracking-tighter text-[#ff0000] sm:text-5xl">
            x402
          </span>
          <span className="mt-1 text-xs font-bold uppercase tracking-widest text-neutral-500">
            Protocol
          </span>
        </div>
        <div className="flex flex-col items-center justify-center border-r-4 border-white py-8">
          <span className="text-3xl font-black uppercase tracking-tighter text-[#ffcc00] sm:text-5xl">
            AVAX
          </span>
          <span className="mt-1 text-xs font-bold uppercase tracking-widest text-neutral-500">
            Network
          </span>
        </div>
        <div className="flex flex-col items-center justify-center py-8">
          <span className="text-3xl font-black uppercase tracking-tighter text-[#0d0df2] sm:text-5xl">
            AWM
          </span>
          <span className="mt-1 text-xs font-bold uppercase tracking-widest text-neutral-500">
            Messaging
          </span>
        </div>
      </section>

      {/* ── Blue CTA Section ── */}
      <section
        id="cta"
        className="bg-[#0d0df2] px-6 py-16 text-center md:px-12 md:py-24"
      >
        <h2 className="text-4xl font-black uppercase tracking-tighter sm:text-5xl lg:text-6xl">
          Ready to automate
          <br />
          influence?
        </h2>
        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <Link
            href="/pipeline"
            className="inline-block bg-white px-10 py-4 text-lg font-black uppercase tracking-wider text-[#0d0df2] transition hover:bg-neutral-200"
          >
            Launch Pipeline
          </Link>
          <Link
            href="/network"
            className="inline-block border-4 border-white bg-transparent px-10 py-4 text-lg font-black uppercase tracking-wider text-white transition hover:bg-white hover:text-[#0d0df2]"
          >
            View Network
          </Link>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t-4 border-white px-6 py-6 text-center md:px-12">
        <p className="text-sm font-bold uppercase tracking-widest text-neutral-500">
          Powered by Avalanche Teleporter
        </p>
      </footer>
    </main>
  );
}
