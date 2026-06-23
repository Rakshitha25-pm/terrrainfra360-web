/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { ArrowLeft, FileText, Download, Package, ChevronRight, Clock } from 'lucide-react';

export function OrderHistoryScreen({ onNavigate }: { onNavigate: (s: any) => void }) {
  const savedOrders: any[] = (() => {
    try { return JSON.parse(localStorage.getItem('tf360_orders_v1') || '[]'); } catch { return []; }
  })();

  // Mock orders
  const mockOrders = [
    {
      id: 'ORD-8921',
      date: '10 May 2026',
      total: 48500,
      status: 'DELIVERED',
      isB2B: true,
      items: 3,
      invoiceUrl: '#',
    },
    {
      id: 'ORD-7712',
      date: '02 May 2026',
      total: 1250,
      status: 'DELIVERED',
      isB2B: false,
      items: 1,
    }
  ];

  const orders = [...savedOrders, ...mockOrders];

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <header className="bg-[#111] border-b border-white/10 px-6 py-4 flex items-center gap-4 sticky top-0 z-50">
        <button onClick={() => onNavigate('SHOP')} className="p-2 hover:bg-white/10 rounded-full">
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-xl font-bold">Your Orders</h1>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8 space-y-4">
        {orders.map(order => (
          <div key={order.id} className="bg-[#111] rounded-2xl p-6 shadow-sm border border-white/10">
            <div className="flex flex-col sm:flex-row justify-between mb-6 pb-6 border-b border-white/8 gap-4">
              <div className="flex gap-4">
                <div className="h-12 w-12 bg-white/10 rounded-xl flex items-center justify-center text-white/40">
                  <Package size={24} />
                </div>
                <div>
                  <h3 className="font-bold flex items-center gap-2">
                    {order.id}
                    {order.isB2B && <span className="bg-[#f97316]/10 text-[#f97316] text-[10px] px-2 py-0.5 rounded uppercase font-bold">Business</span>}
                  </h3>
                  <div className="flex items-center gap-2 text-sm text-white/50">
                    <Clock size={14} />
                    <span>Ordered on {order.date}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <p className="text-xs font-bold text-white/40 uppercase">Total Amount</p>
                  <p className="font-bold">₹{order.total.toLocaleString()}</p>
                </div>
                <ChevronRight className="text-white/30" />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
              <div className="flex items-center gap-2">
                <div className={`h-2.5 w-2.5 rounded-full ${order.status === 'DELIVERED' ? 'bg-emerald-500/100' : 'bg-orange-500/150'}`} />
                <span className="text-sm font-bold text-white/70 uppercase tracking-wide">{order.status}</span>
              </div>

              <div className="flex gap-2 w-full sm:w-auto">
                {order.isB2B && (
                  <button className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-blue-500/10 text-blue-400 rounded-xl font-bold text-sm hover:bg-blue-500/15 transition-colors">
                    <FileText size={16} />
                    Download Tax Invoice
                  </button>
                )}
                <button className="flex-1 sm:flex-none px-6 py-2 bg-white/10 text-white/70 rounded-xl font-bold text-sm hover:bg-white/10 transition-colors">
                  Order Details
                </button>
              </div>
            </div>
          </div>
        ))}
      </main>
    </div>
  );
}
