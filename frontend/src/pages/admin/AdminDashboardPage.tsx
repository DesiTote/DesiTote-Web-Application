import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { api } from '../../lib/api';
import { BackendDashboardStats } from '../../lib/apiTypes';

export function AdminDashboardPage() {
  const [stats, setStats] = useState<BackendDashboardStats | null>(null);

  useEffect(() => {
    (async () => {
      const res = await api.get<{ data: BackendDashboardStats }>('/api/admin/dashboard/stats');
      setStats(res.data);
    })();
  }, []);

  if (!stats) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="w-6 h-6 text-[#0B1420]/40 animate-spin" />
      </div>
    );
  }

  const cards = [
    { label: 'Total Orders', value: stats.totalOrders },
    { label: 'Total Revenue', value: `₹${stats.totalRevenue.toLocaleString('en-IN')}` },
    { label: 'Customers', value: stats.totalUsers },
    { label: 'Products', value: stats.totalProducts },
  ];

  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card) => (
        <div key={card.label} className="rounded-2xl border border-[#0B1420]/10 bg-white/50 p-5">
          <p className="text-xs font-mono uppercase tracking-widest text-[#0B1420]/50">{card.label}</p>
          <p className="text-2xl font-serif text-[#0B1420] mt-2">{card.value}</p>
        </div>
      ))}
    </div>
  );
}
