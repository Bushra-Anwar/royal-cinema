'use client';

import React, { useState } from 'react';
import Link from 'next/link';

export default function PricingPage() {
  const [isYearly, setIsYearly] = useState(true);

  const plans = [
    {
      id: 'starter',
      name: 'Starter',
      target: 'For single-screen cinemas',
      screens: '1 Screen Allowed',
      monthlyPrice: '₹999',
      yearlyPrice: '₹9,999',
      billedText: isYearly ? 'per branch / year (Save 17%)' : 'per branch / month',
      features: [
        'Core Box Office Ticket Booking',
        '80mm ESC/POS Thermal Printing',
        'Counter POS Cash/UPI Tender',
        'Offline Booking Resilience',
        'Basic Daily Collection Reports',
        '1 Cinema Branch Included'
      ],
      ctaText: 'Select Starter Plan',
      badge: null
    },
    {
      id: 'professional',
      name: 'Professional',
      target: 'For growing twin-screen cinemas',
      screens: '2 Screens Allowed',
      monthlyPrice: '₹1,699',
      yearlyPrice: '₹16,999',
      billedText: isYearly ? 'per branch / year (Save 17%)' : 'per branch / month',
      features: [
        'All Starter Features Included',
        'Food & Beverage Concessions POS',
        'KDS Kitchen Display Station',
        'Advanced Occupancy Analytics',
        'Staff Roles & Shift Auditing',
        'Priority Phone & WhatsApp Support',
        '2 Screens per Branch'
      ],
      ctaText: 'Select Professional',
      badge: 'RECOMMENDED'
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      target: 'For multiplex & multi-branch chains',
      screens: '4 Screens Allowed',
      monthlyPrice: '₹2,499',
      yearlyPrice: '₹24,999',
      billedText: isYearly ? 'per branch / year (Save 17%)' : 'per branch / month',
      features: [
        'All Professional Features Included',
        'Up to 4 Screens per Branch',
        'Multi-Branch Centralized Overview',
        'Autonomous Per-Branch Licensing',
        'GST SAC 999632 PDF Invoicing',
        '15-Minute Critical Incident SLA',
        'Dedicated Technical Account Manager'
      ],
      ctaText: 'Select Enterprise',
      badge: 'MULTIPLEX'
    }
  ];

  return (
    <div className="min-h-screen bg-[#F5F7FA] text-[#183B56] font-sans antialiased py-16 px-6">
      <div className="max-w-7xl mx-auto">
        {/* HEADER */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-block px-3 py-1 rounded-full bg-[#f0f9f7] border border-[#d9f1eb] text-xs font-bold text-[#237A69] uppercase tracking-wider mb-3">
            Transparent Commercial Licensing
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-[#183B56] tracking-tight">
            Simple Per-Branch Pricing.
          </h1>
          <p className="text-slate-600 mt-4 text-base sm:text-lg">
            Independent subscription entitlement for each cinema location. An expired branch never locks or disrupts your other active branches.
          </p>

          {/* BILLING CYCLE TOGGLE */}
          <div className="inline-flex items-center gap-3 p-1.5 bg-white border border-[#DCE3EA] rounded-xl shadow-subtle mt-8">
            <button
              onClick={() => setIsYearly(false)}
              className={`px-5 py-2 text-xs font-bold rounded-lg transition ${
                !isYearly ? 'bg-[#183B56] text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Monthly Billing
            </button>
            <button
              onClick={() => setIsYearly(true)}
              className={`px-5 py-2 text-xs font-bold rounded-lg transition flex items-center gap-1.5 ${
                isYearly ? 'bg-[#237A69] text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>Annual Billing</span>
              <span className="text-[10px] bg-[#D9A441] text-white px-1.5 py-0.2 rounded font-extrabold">2 MOS FREE</span>
            </button>
          </div>
        </div>

        {/* PRICING CARDS GRID */}
        <div className="grid md:grid-cols-3 gap-8 items-stretch mb-16">
          {plans.map(p => (
            <div
              key={p.id}
              className={`bg-white rounded-2xl border p-8 flex flex-col justify-between relative transition shadow-subtle ${
                p.badge === 'RECOMMENDED' ? 'border-[#237A69] ring-2 ring-[#237A69]/10' : 'border-[#DCE3EA]'
              }`}
            >
              {p.badge && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-[#237A69] text-white font-extrabold text-[10px] tracking-wider uppercase shadow-sm">
                  {p.badge}
                </div>
              )}

              <div>
                <h3 className="text-xl font-bold text-[#183B56]">{p.name}</h3>
                <p className="text-xs text-slate-500 mt-1">{p.target}</p>
                <div className="mt-2 text-xs font-bold text-[#237A69] bg-[#f0f9f7] inline-block px-2.5 py-1 rounded-lg">
                  {p.screens}
                </div>

                <div className="my-6">
                  <span className="text-4xl font-extrabold text-[#183B56] tabular-nums">
                    {isYearly ? p.yearlyPrice : p.monthlyPrice}
                  </span>
                  <span className="text-xs font-medium text-slate-500 ml-2 block mt-1">
                    {p.billedText}
                  </span>
                </div>

                <ul className="space-y-3 pt-4 border-t border-[#DCE3EA] text-sm text-slate-700">
                  {p.features.map((feat, idx) => (
                    <li key={idx} className="flex items-start gap-2.5">
                      <span className="text-[#398765] font-bold">✓</span>
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="pt-8">
                <Link
                  href={`/checkout?plan=${p.id}&cycle=${isYearly ? 'yearly' : 'monthly'}`}
                  className={`w-full py-3.5 rounded-xl font-bold text-sm text-center block transition ${
                    p.badge === 'RECOMMENDED'
                      ? 'bg-[#237A69] hover:bg-[#1b6154] text-white shadow-sm'
                      : 'bg-[#183B56] hover:bg-[#11293c] text-white'
                  }`}
                >
                  {p.ctaText} &rarr;
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* PER-BRANCH POLICY ALERT BANNER */}
        <div className="bg-white border border-[#DCE3EA] rounded-2xl p-6 shadow-subtle flex items-start gap-4 max-w-4xl mx-auto">
          <div className="text-2xl">🏢</div>
          <div>
            <h4 className="font-bold text-[#183B56] text-base">Important Per-Branch Isolation Guarantee</h4>
            <p className="text-sm text-slate-600 mt-1 leading-relaxed">
              If an organization owns multiple branches (e.g. Ahmedabad, Gandhinagar, Surat) and a single branch expires (e.g. Surat), <strong>only that branch is restricted</strong>. Your other branches (Ahmedabad and Gandhinagar) continue uninterrupted with 100% active operational uptime.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
