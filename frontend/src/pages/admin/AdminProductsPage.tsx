import { useEffect, useState } from 'react';
import { Loader2, Save, Plus, Trash2 } from 'lucide-react';
import { api, apiUpload } from '../../lib/api';
import { BackendAdminProduct } from '../../lib/apiTypes';
import { buildProductFormData, BackendFullProduct } from '../../lib/adminProduct';
import { AddProductModal } from './AddProductModal';

/** A row's unsaved edits. Absent keys mean "unchanged from the server value". */
interface Draft {
  price?: number;
  stock?: number;
}

export function AdminProductsPage() {
  const [products, setProducts] = useState<BackendAdminProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [drafts, setDrafts] = useState<Record<string, Draft>>({});
  const [savingId, setSavingId] = useState<string | null>(null);
  const [archivingId, setArchivingId] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [showAdd, setShowAdd] = useState(false);

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

  const setDraft = (id: string, patch: Draft) =>
    setDrafts((prev) => ({ ...prev, [id]: { ...prev[id], ...patch } }));

  const clearDraft = (id: string) =>
    setDrafts((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });

  // A row is dirty only when a draft value actually differs from the server's.
  const isDirty = (p: BackendAdminProduct) => {
    const d = drafts[p._id];
    if (!d) return false;
    const priceChanged = d.price != null && d.price !== p.price;
    const stockChanged = d.stock != null && d.stock !== p.stock;
    return priceChanged || stockChanged;
  };

  const save = async (p: BackendAdminProduct) => {
    if (!isDirty(p)) return;
    const d = drafts[p._id] || {};
    setError('');
    setSavingId(p._id);
    try {
      // The update route wants the whole product, so fetch it and override only
      // the touched fields. Price has no strike-through discount in this
      // catalogue, so the selling price moves with it.
      const full = await api.get<{ data: BackendFullProduct }>(`/api/product/${p._id}`);
      const nextPrice = d.price != null ? d.price : full.data.price;
      const overrides: Partial<BackendFullProduct> = {};
      if (d.price != null) {
        overrides.price = nextPrice;
        overrides.discountPrice = nextPrice;
      }
      if (d.stock != null) overrides.stock = d.stock;
      const formData = buildProductFormData(full.data, overrides);
      await apiUpload(`/api/product/${p._id}`, 'PATCH', formData);
      await load(search);
      clearDraft(p._id);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save changes.');
    } finally {
      setSavingId(null);
    }
  };

  const archive = async (p: BackendAdminProduct) => {
    if (!window.confirm(`Remove "${p.title}" from the shop? It stops showing to customers but its order history is kept.`)) {
      return;
    }
    setError('');
    setArchivingId(p._id);
    try {
      await api.patch(`/api/product/${p._id}/archive`);
      await load(search);
      clearDraft(p._id);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to remove the tote.');
    } finally {
      setArchivingId(null);
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex gap-2 items-center">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            load(search);
          }}
          className="flex gap-2 flex-1"
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
        <button
          onClick={() => setShowAdd(true)}
          className="px-5 py-2.5 rounded-full bg-[#B87D00] text-white text-xs uppercase tracking-widest flex items-center gap-2 shrink-0"
        >
          <Plus className="w-4 h-4" /> Add tote
        </button>
      </div>

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
                <th className="p-3">Price (₹)</th>
                <th className="p-3">Stock</th>
                <th className="p-3"></th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => {
                const d = drafts[p._id] || {};
                const isLow = (d.stock ?? p.stock) <= p.lowStockThreshold;
                const busy = savingId === p._id || archivingId === p._id;
                return (
                  <tr key={p._id} className="border-b border-[#0B1420]/5 last:border-0">
                    <td className="p-3">
                      <div className="flex items-center gap-2.5">
                        <img src={p.thumbnail} alt="" className="w-9 h-9 rounded-lg object-cover border border-[#0B1420]/10" />
                        <span className="text-xs text-[#0B1420] max-w-[220px] truncate">{p.title}</span>
                      </div>
                    </td>
                    <td className="p-3 font-mono text-xs">{p.sku}</td>
                    <td className="p-3">
                      <input
                        type="number"
                        min={1}
                        value={d.price ?? p.price}
                        onChange={(e) => setDraft(p._id, { price: Number(e.target.value) })}
                        className="w-24 px-2 py-1.5 rounded-lg border border-[#0B1420]/15 text-xs font-mono"
                      />
                    </td>
                    <td className="p-3">
                      <input
                        type="number"
                        min={0}
                        value={d.stock ?? p.stock}
                        onChange={(e) => setDraft(p._id, { stock: Number(e.target.value) })}
                        className={`w-20 px-2 py-1.5 rounded-lg border text-xs ${
                          isLow ? 'border-rose-300 bg-rose-50' : 'border-[#0B1420]/15'
                        }`}
                      />
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-1.5">
                        <button
                          disabled={!isDirty(p) || busy}
                          onClick={() => save(p)}
                          title="Save changes"
                          className="p-2 rounded-lg bg-[#0B1420] text-[#F7F2E8] disabled:opacity-30"
                        >
                          {savingId === p._id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                        </button>
                        <button
                          disabled={busy}
                          onClick={() => archive(p)}
                          title="Remove from shop"
                          className="p-2 rounded-lg border border-rose-200 text-rose-500 hover:bg-rose-50 disabled:opacity-30"
                        >
                          {archivingId === p._id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                        </button>
                      </div>
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

      {showAdd && (
        <AddProductModal
          onClose={() => setShowAdd(false)}
          onCreated={() => load(search)}
        />
      )}
    </div>
  );
}
