import React from 'react';
import Link from 'next/link';

export default function ClientOverviewPage() {
  const branches = [
    { id: 'BR_001_AHM', name: 'Sunrise Cinemas — Ahmedabad Main', city: 'Ahmedabad', screens: 4, plan: 'Enterprise', status: 'Active', validTill: '15 Nov 2027', devices: 4 },
    { id: 'BR_001_GN', name: 'Sunrise Cinemas — Gandhinagar Twin', city: 'Gandhinagar', screens: 2, plan: 'Professional', status: 'Active', validTill: '15 Nov 2027', devices: 2 },
    { id: 'BR_001_SURAT', name: 'Sunrise Cinemas — Surat City', city: 'Surat', screens: 2, plan: 'Professional', status: 'Active', validTill: '15 Nov 2027', devices: 2 },
    { id: 'BR_001_VAD', name: 'Sunrise Cinemas — Vadodara Central', city: 'Vadodara', screens: 1, plan: 'Starter', status: 'Expired', validTill: '15 Nov 2026', devices: 0 }
  ];

  return (
    <div className="min-h-screen bg-[#F5F7FA] text-[#183B56] font-sans antialiased p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* HEADER BAR */}
        <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-[#DCE3EA]">
          <div>
            <div className="text-xs font-bold text-[#237A69] uppercase tracking-wider">Client Management Portal</div>
            <h1 className="text-3xl font-extrabold text-[#183B56] mt-1">Sunrise Cinemas Pvt. Ltd.</h1>
            <p className="text-xs text-slate-500 mt-1">Org ID: <code>ORG_001</code> • Multi-Branch Cinema Operator</p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/portal/downloads"
              className="bg-white border border-[#DCE3EA] hover:bg-slate-50 text-[#183B56] text-xs font-bold px-4 py-2.5 rounded-xl transition shadow-subtle flex items-center gap-2"
            >
              <span>⬇️</span> Download Desktop Setup (v0.3.0)
            </Link>
            <Link
              href="/portal/branches"
              className="bg-[#237A69] hover:bg-[#1b6154] text-white text-xs font-bold px-4 py-2.5 rounded-xl transition shadow-sm"
            >
              + Add Cinema Branch
            </Link>
          </div>
        </div>

        {/* TOP KPI CARDS (CP-01 SPECIFICATION) */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white border border-[#DCE3EA] rounded-2xl p-6 shadow-subtle">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-500">Total Branches</div>
            <div className="text-3xl font-extrabold text-[#183B56] mt-2 tabular-nums">4 Locations</div>
            <div className="text-xs text-slate-500 mt-1">Gujarat Region</div>
          </div>

          <div className="bg-white border border-[#DCE3EA] rounded-2xl p-6 shadow-subtle">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-500">Active Subscriptions</div>
            <div className="text-3xl font-extrabold text-[#398765] mt-2 tabular-nums">3 Branches</div>
            <div className="text-xs text-emerald-700 mt-1">100% Operational Uptime</div>
          </div>

          <div className="bg-white border border-[#DCE3EA] rounded-2xl p-6 shadow-subtle">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-500">Expiring / Expired</div>
            <div className="text-3xl font-extrabold text-[#DC6262] mt-2 tabular-nums">1 Branch</div>
            <div className="text-xs text-red-600 mt-1 font-semibold">Vadodara Expired (Safe)</div>
          </div>

          <div className="bg-white border border-[#DCE3EA] rounded-2xl p-6 shadow-subtle">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-500">Activated Devices</div>
            <div className="text-3xl font-extrabold text-[#183B56] mt-2 tabular-nums">8 / 12 Devices</div>
            <div className="text-xs text-slate-500 mt-1">Hardware Whitelisted</div>
          </div>
        </div>

        {/* MY BRANCHES TABLE (CP-02 SPECIFICATION) */}
        <div className="bg-white border border-[#DCE3EA] rounded-2xl shadow-subtle overflow-hidden">
          <div className="p-6 border-b border-[#DCE3EA] flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-[#183B56]">Cinema Branches &amp; Entitlements</h2>
              <p className="text-xs text-slate-500 mt-1">Independent subscription per branch. Data remains 100% safe.</p>
            </div>
            <span className="text-xs font-mono bg-slate-100 text-slate-600 px-2.5 py-1 rounded-lg">Tenant: ORG_001</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-[#F5F7FA] border-b border-[#DCE3EA] text-xs font-bold uppercase text-slate-500 tracking-wider">
                <tr>
                  <th className="py-3.5 px-6">Branch Name</th>
                  <th className="py-3.5 px-6">City</th>
                  <th className="py-3.5 px-6">Screens</th>
                  <th className="py-3.5 px-6">Plan</th>
                  <th className="py-3.5 px-6">Subscription Status</th>
                  <th className="py-3.5 px-6">Valid Till</th>
                  <th className="py-3.5 px-6 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#DCE3EA]">
                {branches.map(b => (
                  <tr key={b.id} className="hover:bg-slate-50/70 transition">
                    <td className="py-4 px-6 font-bold text-[#183B56]">{b.name}</td>
                    <td className="py-4 px-6 text-slate-600">{b.city}</td>
                    <td className="py-4 px-6 text-slate-600">{b.screens} Audi(s)</td>
                    <td className="py-4 px-6 font-semibold text-[#237A69]">{b.plan}</td>
                    <td className="py-4 px-6">
                      <span
                        className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                          b.status === 'Active' ? 'bg-emerald-50 text-[#398765]' : 'bg-red-50 text-[#DC6262]'
                        }`}
                      >
                        {b.status === 'Active' ? '● Active' : '▲ Expired'}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-slate-600 tabular-nums">{b.validTill}</td>
                    <td className="py-4 px-6 text-right">
                      {b.status === 'Active' ? (
                        <button className="text-xs font-bold text-[#237A69] hover:underline">Manage &rarr;</button>
                      ) : (
                        <button className="text-xs font-bold bg-[#DC6262] text-white px-3 py-1 rounded-lg hover:bg-red-700 transition">
                          Renew Branch &rarr;
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
