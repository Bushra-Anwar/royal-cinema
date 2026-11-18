import React from 'react';
import Link from 'next/link';

export default function AdminDashboardPage() {
  return (
    <div className="min-h-screen bg-[#F5F7FA] text-[#183B56] font-sans antialiased p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* HEADER */}
        <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-[#DCE3EA]">
          <div>
            <div className="text-xs font-bold text-[#237A69] uppercase tracking-wider">Super Admin Control Center</div>
            <h1 className="text-3xl font-extrabold text-[#183B56] mt-1">Platform Operations &amp; Revenue</h1>
            <p className="text-xs text-slate-500 mt-1">Multi-Tenant Cinema Cloud Platform Master Console</p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/admin/support"
              className="bg-[#183B56] text-white hover:bg-[#11293c] text-xs font-bold px-4 py-2.5 rounded-xl transition shadow-sm flex items-center gap-2"
            >
              <span>🎧</span> Open 3-Column Support Inbox
            </Link>
            <Link
              href="/admin/settings"
              className="bg-white border border-[#DCE3EA] hover:bg-slate-50 text-[#183B56] text-xs font-bold px-4 py-2.5 rounded-xl transition shadow-subtle"
            >
              Omnichannel Settings
            </Link>
          </div>
        </div>

        {/* 8 EXECUTIVE KPI CARDS (SA-01 SPECIFICATION) */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="bg-white border border-[#DCE3EA] rounded-2xl p-6 shadow-subtle">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-500">Total Organizations</div>
            <div className="text-3xl font-extrabold text-[#183B56] mt-2 tabular-nums">3 Orgs</div>
            <div className="text-xs text-emerald-700 mt-1 font-semibold">↑ 100% Active Tenants</div>
          </div>

          <div className="bg-white border border-[#DCE3EA] rounded-2xl p-6 shadow-subtle">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-500">Total Branches</div>
            <div className="text-3xl font-extrabold text-[#183B56] mt-2 tabular-nums">7 Branches</div>
            <div className="text-xs text-slate-500 mt-1">Ahmedabad, Surat, Mumbai</div>
          </div>

          <div className="bg-white border border-[#DCE3EA] rounded-2xl p-6 shadow-subtle">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-500">Monthly Recurring (MRR)</div>
            <div className="text-3xl font-extrabold text-[#237A69] mt-2 tabular-nums">₹58,997</div>
            <div className="text-xs text-emerald-700 mt-1 font-semibold">↑ 12% vs last month</div>
          </div>

          <div className="bg-white border border-[#DCE3EA] rounded-2xl p-6 shadow-subtle">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-500">Annual Run-Rate (ARR)</div>
            <div className="text-3xl font-extrabold text-[#183B56] mt-2 tabular-nums">₹7,07,964</div>
            <div className="text-xs text-slate-500 mt-1">Committed Annual Billing</div>
          </div>

          <div className="bg-white border border-[#DCE3EA] rounded-2xl p-6 shadow-subtle">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-500">Active Subscriptions</div>
            <div className="text-3xl font-extrabold text-[#398765] mt-2 tabular-nums">6 / 7</div>
            <div className="text-xs text-slate-500 mt-1">1 Expired (Vadodara)</div>
          </div>

          <div className="bg-white border border-[#DCE3EA] rounded-2xl p-6 shadow-subtle">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-500">Open Support Tickets</div>
            <div className="text-3xl font-extrabold text-[#D9A441] mt-2 tabular-nums">2 Tickets</div>
            <div className="text-xs text-amber-700 mt-1 font-semibold">15m Critical SLA Active</div>
          </div>

          <div className="bg-white border border-[#DCE3EA] rounded-2xl p-6 shadow-subtle">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-500">Demo Leads Pipeline</div>
            <div className="text-3xl font-extrabold text-[#183B56] mt-2 tabular-nums">4 New</div>
            <div className="text-xs text-slate-500 mt-1">Website Inquiries</div>
          </div>

          <div className="bg-white border border-[#DCE3EA] rounded-2xl p-6 shadow-subtle">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-500">Desktop Release Status</div>
            <div className="text-3xl font-extrabold text-[#183B56] mt-2 tabular-nums">v0.3.0 Stable</div>
            <div className="text-xs text-slate-500 mt-1">Common Installer Live</div>
          </div>
        </div>

        {/* ORGANIZATIONS MASTER TABLE (SA-02 SPECIFICATION) */}
        <div className="bg-white border border-[#DCE3EA] rounded-2xl shadow-subtle overflow-hidden">
          <div className="p-6 border-b border-[#DCE3EA] flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-[#183B56]">Client Cinema Organizations</h2>
              <p className="text-xs text-slate-500 mt-1">All registered cinema companies under multi-tenant isolation.</p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-[#F5F7FA] border-b border-[#DCE3EA] text-xs font-bold uppercase text-slate-500 tracking-wider">
                <tr>
                  <th className="py-3.5 px-6">Organization</th>
                  <th className="py-3.5 px-6">Owner Email</th>
                  <th className="py-3.5 px-6">Phone</th>
                  <th className="py-3.5 px-6">Branches</th>
                  <th className="py-3.5 px-6">Active Subscriptions</th>
                  <th className="py-3.5 px-6">Status</th>
                  <th className="py-3.5 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#DCE3EA]">
                <tr className="hover:bg-slate-50/70 transition">
                  <td className="py-4 px-6 font-bold text-[#183B56]">Sunrise Cinemas Pvt. Ltd.</td>
                  <td className="py-4 px-6 text-slate-600 font-mono text-xs">owner@sunrisecinema.com</td>
                  <td className="py-4 px-6 text-slate-600 tabular-nums">+91 98250 11111</td>
                  <td className="py-4 px-6 text-slate-600">5 Locations</td>
                  <td className="py-4 px-6 font-semibold text-[#237A69]">4 Active (1 Expired)</td>
                  <td className="py-4 px-6"><span className="text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-50 text-[#398765]">● Active</span></td>
                  <td className="py-4 px-6 text-right"><button className="text-xs font-bold text-[#237A69] hover:underline">Manage Entitlement &rarr;</button></td>
                </tr>
                <tr className="hover:bg-slate-50/70 transition">
                  <td className="py-4 px-6 font-bold text-[#183B56]">Galaxy Multiplex</td>
                  <td className="py-4 px-6 text-slate-600 font-mono text-xs">owner@galaxymultiplex.com</td>
                  <td className="py-4 px-6 text-slate-600 tabular-nums">+91 98250 22222</td>
                  <td className="py-4 px-6 text-slate-600">1 Location (Surat)</td>
                  <td className="py-4 px-6 font-semibold text-[#237A69]">1 Active</td>
                  <td className="py-4 px-6"><span className="text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-50 text-[#398765]">● Active</span></td>
                  <td className="py-4 px-6 text-right"><button className="text-xs font-bold text-[#237A69] hover:underline">Manage Entitlement &rarr;</button></td>
                </tr>
                <tr className="hover:bg-slate-50/70 transition">
                  <td className="py-4 px-6 font-bold text-[#183B56]">Royal Screens</td>
                  <td className="py-4 px-6 text-slate-600 font-mono text-xs">owner@royalscreens.com</td>
                  <td className="py-4 px-6 text-slate-600 tabular-nums">+91 98250 33333</td>
                  <td className="py-4 px-6 text-slate-600">1 Location (Mumbai)</td>
                  <td className="py-4 px-6 font-semibold text-[#237A69]">1 Active</td>
                  <td className="py-4 px-6"><span className="text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-50 text-[#398765]">● Active</span></td>
                  <td className="py-4 px-6 text-right"><button className="text-xs font-bold text-[#237A69] hover:underline">Manage Entitlement &rarr;</button></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
