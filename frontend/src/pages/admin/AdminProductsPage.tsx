import { useEffect, useState } from 'react';
import { Loader2, Save } from 'lucide-react';
import { api, apiUpload } from '../../lib/api';
import { BackendAdminProduct, BackendAdminProductListResult } from '../../lib/apiTypes';
import { buildProductFormData, BackendFullProduct } from '../../lib/adminProduct';

export function AdminProductsPage() {
  const [products, setProducts] = useState<BackendAdminProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [stockDrafts, setStockDrafts] = useState<Record<string, number>>({});
  const [savingId, setSavingId] = useState<string | null>(null);
  const [error, setError] = useState('');

  const load = async (q: string) => {
    setIsLoading(true);
    try {
      const qs = q ? `?search=${encodeURIComponent(q)}&limit=50` : '?limit=50';
      const res = await api.get<{ data: BackendAdminProduct[]; meta: unknown }>(`/api/product${qs}`);
      setProducts(res.data);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    load('');
  }, []);

  const saveStock = async (productId: string) => {
    const newStock = stockDrafts[productId];
    if (newStock == null) return;
    setError('');
    setSavingId(productId);
    try {
      const full = await api.get<{ data: BackendFullProduct }>(`/api/product/${productId}`);
      const formData = buildProductFormData(full.data, { stock: newStock });
      await apiUpload(`/api/product/${productId}`, 'PATCH', formData);
      await load(search);
      setStockDrafts((prev) => {
        const next = { ...prev };
        delete next[productId];
        return next;
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update stock');
    } finally {
      setSavingId(null);
    }
  };

  return (
    <div className="space-y-5">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          load(search);
        }}
        className="flex gap-2"
      >
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by title or SKU…"
          className="flex-1 px-4 py-2.5 rounded-full border border-[#0B1420]/15 bg-white text-sm"
        />
        <button type="submit" className="px-5 py-2.5 rounded-full bg-[#0B1420] text-[#F7F2E8] text-xs uppercase tracking-widest">
          Search
        </button>
      </form>

      {error && <p className="text-xs text-rose-500">{error}</p>}

      {isLoading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="w-6 h-6 text-[#0B1420]/40 animate-spin" />
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-[#0B1420]/10 bg-white/50">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-[10px] uppercase tracking-wider text-[#0B1420]/50 border-b border-[#0B1420]/10">
                <th className="p-3">Product</th>
                <th className="p-3">SKU</th>
                <th className="p-3">Price</th>
                <th className="p-3">Stock</th>
                <th className="p-3"></th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => {
                const draft = stockDrafts[p._id];
                const isLow = p.stock <= p.lowStockThreshold;
                return (
                  <tr key={p._id} className="border-b border-[#0B1420]/5 last:border-0">
                    <td className="p-3 flex items-center gap-2.5">
                      <img src={p.thumbnail} alt="" className="w-9 h-9 rounded-lg object-cover border border-[#0B1420]/10" />
                      <span className="text-xs text-[#0B1420] max-w-[220px] truncate">{p.title}</span>
                    </td>
                    <td className="p-3 font-mono text-xs">{p.sku}</td>
                    <td className="p-3 font-mono text-xs">₹{p.price}</td>
                    <td className="p-3">
                      <input
                        type="number"
                        min={0}
                        value={draft ?? p.stock}
                        onChange={(e) =>
                          setStockDrafts((prev) => ({ ...prev, [p._id]: Number(e.target.value) }))
                        }
                        className={`w-20 px-2 py-1.5 rounded-lg border text-xs ${
                          isLow ? 'border-rose-300 bg-rose-50' : 'border-[#0B1420]/15'
                        }`}
                      />
                    </td>
                    <td className="p-3">
                      <button
                        disabled={draft == null || draft === p.stock || savingId === p._id}
                        onClick={() => saveStock(p._id)}
                        className="p-2 rounded-lg bg-[#0B1420] text-[#F7F2E8] disabled:opacity-30"
                      >
                        {savingId === p._id ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Save className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </td>
                  </tr>
                );
              })}
              {products.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-6 text-center text-xs text-[#0B1420]/40">
                    No products found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
