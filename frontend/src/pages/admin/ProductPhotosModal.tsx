import { useEffect, useState } from 'react';
import { X, Loader2, UploadCloud, Star, Trash2 } from 'lucide-react';
import { api, apiUpload } from '../../lib/api';
import { BackendFullProduct, PhotoChange, photoUpdateFormData } from '../../lib/adminProduct';

interface ProductPhotosModalProps {
  productId: string;
  title: string;
  onClose: () => void;
  /** Called after every saved change, so the product list can refresh its thumbnail. */
  onChanged: () => void;
}

/**
 * Add, remove and reorder-the-main photo for one tote. Each action saves on
 * its own straight away; there is no "save" step to forget.
 */
export function ProductPhotosModal({ productId, title, onClose, onChanged }: ProductPhotosModalProps) {
  const [product, setProduct] = useState<BackendFullProduct | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const fetchProduct = async () => {
    const res = await api.get<{ data: BackendFullProduct }>(`/api/product/${productId}`);
    setProduct(res.data);
  };

  useEffect(() => {
    fetchProduct().catch((err) => setError(err instanceof Error ? err.message : 'Could not load photos.'));
  }, [productId]);

  const apply = async (change: PhotoChange) => {
    if (!product) return;
    setError('');
    setBusy(true);
    try {
      await apiUpload(`/api/product/${productId}`, 'PATCH', photoUpdateFormData(product, change));
      await fetchProduct();
      onChanged();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save the photo change.');
    } finally {
      setBusy(false);
    }
  };

  const photos = product?.images ?? [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70">
      <div className="w-full max-w-lg max-h-full bg-[#F7F2E8] rounded-3xl border border-[#0B1420]/10 shadow-2xl relative flex flex-col overflow-hidden">
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute top-4 right-4 z-20 p-2.5 rounded-full bg-[#F7F2E8] border border-[#0B1420]/15 shadow-md text-[#0B1420]/70 hover:text-[#0B1420]"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex-1 overflow-y-auto p-6 sm:p-7 space-y-4">
          <div className="pr-10">
            <h2 className="text-xl font-serif text-[#0B1420]">Photos</h2>
            <p className="text-xs text-[#0B1420]/50 mt-0.5 truncate">{title}</p>
          </div>

          {error && (
            <p className="text-xs text-rose-600 bg-rose-50 border border-rose-200 rounded-xl px-3 py-2">{error}</p>
          )}

          {!product ? (
            !error && (
              <div className="flex justify-center py-10">
                <Loader2 className="w-5 h-5 text-[#0B1420]/40 animate-spin" />
              </div>
            )
          ) : (
            <div className="grid grid-cols-3 gap-3">
              {photos.map((src) => {
                const isMain = src === product.thumbnail;
                return (
                  <div key={src} className="space-y-1.5">
                    <div
                      className={`relative aspect-square rounded-xl overflow-hidden bg-[#efe9dd] border-2 ${
                        isMain ? 'border-[#B87D00]' : 'border-[#0B1420]/10'
                      }`}
                    >
                      <img src={src} alt="" className="w-full h-full object-cover" />
                      {isMain && (
                        <span className="absolute top-1.5 left-1.5 px-2 py-0.5 rounded-full bg-[#B87D00] text-white text-[9px] font-mono uppercase tracking-wider">
                          Main
                        </span>
                      )}
                    </div>
                    <div className="flex gap-1">
                      <button
                        disabled={busy || isMain}
                        onClick={() => apply({ main: src })}
                        title="Show this photo first"
                        className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg border border-[#0B1420]/15 text-[10px] text-[#0B1420]/70 hover:bg-[#0B1420]/5 active:scale-[0.97] transition-transform duration-150 disabled:opacity-30"
                      >
                        <Star className="w-3 h-3" /> Main
                      </button>
                      <button
                        disabled={busy || photos.length < 2}
                        onClick={() => {
                          if (window.confirm('Remove this photo from the shop?')) apply({ remove: src });
                        }}
                        title={photos.length < 2 ? 'A tote needs at least one photo' : 'Remove photo'}
                        aria-label="Remove photo"
                        className="px-2 py-1.5 rounded-lg border border-rose-200 text-rose-500 hover:bg-rose-50 active:scale-[0.97] transition-transform duration-150 disabled:opacity-30"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="shrink-0 border-t border-[#0B1420]/10 p-4 bg-[#F7F2E8] space-y-1.5">
          <label
            className={`flex items-center justify-center gap-2 py-3 rounded-full bg-[#0B1420] text-[#F7F2E8] text-xs uppercase tracking-widest ${
              busy || !product ? 'opacity-50 pointer-events-none' : 'cursor-pointer'
            }`}
          >
            {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <UploadCloud className="w-4 h-4" />}
            {busy ? 'Saving…' : 'Add photos'}
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              multiple
              className="hidden"
              onChange={(e) => {
                const list = e.target.files;
                // The upload route takes at most 10 files per request.
                const files = list ? Array.from(list as ArrayLike<File>).slice(0, 10) : [];
                e.target.value = '';
                if (files.length) apply({ add: files });
              }}
            />
          </label>
          <p className="text-[10px] text-center text-[#0B1420]/40">Fabric, zip, side view… JPG, PNG or WEBP, up to 15MB each.</p>
        </div>
      </div>
    </div>
  );
}
