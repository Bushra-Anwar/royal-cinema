import React from 'react';
import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#F5F7FA] text-[#183B56] font-sans antialiased">
      {/* HEADER / NAVIGATION */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-[#DCE3EA]">
        <div className="max-w-7xl mx-auto px-6 h-18 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#D9A441] to-[#EA580C] flex items-center justify-center text-white font-black text-xl shadow-sm">
              R
            </div>
            <div>
              <span className="font-extrabold text-lg tracking-tight text-[#183B56]">ROYAL CINEMA</span>
              <span className="text-xs font-bold text-[#EA580C] ml-1 uppercase tracking-wider">ERP</span>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-[#183B56]/80">
            <Link href="/" className="text-[#EA580C] font-bold">Home</Link>
            <Link href="/features" className="hover:text-[#EA580C] transition">Features</Link>
            <Link href="/solutions" className="hover:text-[#EA580C] transition">Solutions</Link>
            <Link href="/pricing" className="hover:text-[#EA580C] transition">Pricing</Link>
            <Link href="/about" className="hover:text-[#EA580C] transition">About</Link>
            <Link href="/contact" className="hover:text-[#EA580C] transition">Contact</Link>
          </nav>

          <div className="flex items-center gap-4">
            <Link href="/login" className="text-sm font-semibold text-[#183B56] hover:text-[#EA580C] px-3 py-2">
              Login
            </Link>
            <Link
              href="/demo"
              className="bg-[#EA580C] hover:bg-[#C2410C] text-white text-sm font-bold px-5 py-2.5 rounded-xl transition shadow-sm"
            >
              Book a Free Demo
            </Link>
          </div>
        </div>
      </header>

      {/* HERO SECTION */}
      <section className="pt-20 pb-16 px-6 max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-6 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#f0f9f7] border border-[#d9f1eb] text-xs font-bold text-[#EA580C]">
              <span>✨ Commercial Cinema Management Platform</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-[#183B56] leading-[1.15]">
              Manage Your Cinema. <br />
              <span className="text-[#EA580C]">All in One Place.</span>
            </h1>

            <p className="text-base sm:text-lg text-[#183B56]/75 max-w-xl leading-relaxed">
              Simplify ticket booking, counter operations, food and beverage sales, staff management, and business reporting with one integrated cinema management platform.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-2">
              <Link
                href="/demo"
                className="bg-[#EA580C] hover:bg-[#C2410C] text-white font-bold px-7 py-3.5 rounded-xl transition shadow-sm flex items-center gap-2"
              >
                Book a Free Demo &rarr;
              </Link>
              <Link
                href="/features"
                className="bg-white hover:bg-slate-50 text-[#183B56] border border-[#DCE3EA] font-semibold px-6 py-3.5 rounded-xl transition"
              >
                Explore Features
              </Link>
            </div>

            <div className="flex items-center gap-6 pt-4 text-xs font-semibold text-[#183B56]/60">
              <div className="flex items-center gap-1.5">
                <span className="text-[#398765]">✓</span> Single &amp; Multiplex Screens
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-[#398765]">✓</span> Independent Per-Branch Billing
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-[#398765]">✓</span> 15-Min Critical SLA Support
              </div>
            </div>
          </div>

          {/* DESKTOP SOFTWARE PREVIEW (ACTUAL MOCKUP) */}
          <div className="lg:col-span-6">
            <div className="bg-white rounded-2xl border border-[#DCE3EA] p-3 shadow-card">
              <div className="flex items-center justify-between pb-3 px-2 border-b border-[#DCE3EA]">
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-[#DC6262]" />
                  <div className="w-3 h-3 rounded-full bg-[#D9A441]" />
                  <div className="w-3 h-3 rounded-full bg-[#398765]" />
                  <span className="text-xs font-mono text-slate-400 ml-2">Royal Cinema ERP Desktop — Box Office Workstation</span>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700">ONLINE</span>
              </div>
              <div className="aspect-[16/10] bg-slate-900 rounded-xl overflow-hidden mt-3 relative flex items-center justify-center text-slate-400 text-sm">
                <div className="p-6 text-center space-y-3">
                  <div className="text-3xl font-extrabold text-white tracking-wider">ROYAL CINEMA POS</div>
                  <p className="text-xs text-slate-300 max-w-sm">
                    Interactive seat selection matrix, 80mm ESC/POS thermal ticket printing, and instant F&amp;B combo orders.
                  </p>
                  <div className="inline-block px-3 py-1 bg-[#EA580C] text-white text-xs font-bold rounded-lg">
                    Production App v0.3.0 Live
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CORE STATS BAR */}
      <section className="bg-white border-y border-[#DCE3EA] py-10 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          <div>
            <div className="text-3xl font-extrabold text-[#183B56] tabular-nums">99.99%</div>
            <div className="text-xs font-semibold text-slate-500 mt-1 uppercase tracking-wider">Box Office Uptime</div>
          </div>
          <div>
            <div className="text-3xl font-extrabold text-[#EA580C] tabular-nums">&lt; 15 Mins</div>
            <div className="text-xs font-semibold text-slate-500 mt-1 uppercase tracking-wider">Critical Support SLA</div>
          </div>
          <div>
            <div className="text-3xl font-extrabold text-[#183B56] tabular-nums">Per-Branch</div>
            <div className="text-xs font-semibold text-slate-500 mt-1 uppercase tracking-wider">Isolated Licensing</div>
          </div>
          <div>
            <div className="text-3xl font-extrabold text-[#D9A441] tabular-nums">0% Conflict</div>
            <div className="text-xs font-semibold text-slate-500 mt-1 uppercase tracking-wider">Offline Double-Booking Guard</div>
          </div>
        </div>
      </section>
    </div>
  );
}
