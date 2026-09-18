import { useState } from 'react';
import { X, Loader2, UploadCloud, Plus } from 'lucide-react';
import { apiUpload } from '../../lib/api';
import {
  buildCreateProductFormData,
  defaultSkuFor,
  NewProductInput,
} from '../../lib/adminProduct';

interface Props {
  onClose: () => void;
  onCreated: () => void;
}

/**
 * The short form a shop owner fills to add a tote. It collects only the fields
 * a person actually decides — name, the two descriptions, colour, price, stock
 * and at least one photo. Everything else the create endpoint needs (material,
 * category, GST, weight, dimensions, slug, publish flags) is defaulted in
 * buildCreateProductFormData to match the rest of the catalogue.
 */
export function AddProductModal({ onClose, onCreated }: Props) {
  const [form, setForm] = useState({
    title: '',
    shortDescription: '',
    description: '',
    color: '',
    price: '',
    stock: '',
    sku: '',
  });
  const [skuTouched, setSkuTouched] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const set = (key: keyof typeof form, value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  // Fill a starting SKU from the title until the admin edits it themselves.
  const onTitleChange = (value: string) => {
    setForm((prev) => ({
      ...prev,
      title: value,
      sku: skuTouched ? prev.sku : value.trim() ? defaultSkuFor(value) : '',
    }));
  };

  const onPickImages = (list: FileList | null) => {
    if (!list) return;
    const picked = Array.from(list).slice(0, 10);
    setFiles(picked);
    setPreviews(picked.map((f) => URL.createObjectURL(f)));
  };

  const validate = (): string | null => {
    if (form.title.trim().length < 1) return 'Give the tote a name.';
    if (form.shortDescription.trim().length < 1) return 'Add a short description (the one-line tagline).';
    if (form.description.trim().length < 1) return 'Add a full description.';
    if (form.color.trim().length < 1) return 'Enter the colour, e.g. Natural or Black.';
    const price = Number(form.price);
    if (!Number.isFinite(price) || price < 1) return 'Enter a price of ₹1 or more.';
    const stock = Number(form.stock);
    if (!Number.isInteger(stock) || stock < 0) return 'Enter the stock as a whole number.';
    if (form.sku.trim().length < 3) return 'SKU needs at least 3 characters.';
    if (files.length === 0) return 'Add at least one photo of the tote.';
    return null;
  };

  const submit = async () => {
    const problem = validate();
    if (problem) {
      setError(problem);
      return;
    }
    setError('');
    setSaving(true);
    try {
      const input: NewProductInput = {
        title: form.title.trim(),
        shortDescription: form.shortDescription.trim(),
        description: form.description.trim(),
        color: form.color.trim(),
        price: Number(form.price),
        stock: Number(form.stock),
        sku: form.sku.trim(),
      };
      const fd = buildCreateProductFormData(input, files);
      await apiUpload('/api/product', 'POST', fd);
      onCreated();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not add the tote. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const field = 'w-full px-3.5 py-2.5 rounded-xl border border-[#0B1420]/15 bg-white text-sm text-[#0B1420] focus:border-[#B87D00] outline-none';
  const label = 'text-[11px] font-mono uppercase tracking-wider text-[#0B1420]/55';

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
          <div>
            <h2 className="text-xl font-serif text-[#0B1420]">Add a new tote</h2>
            <p className="text-xs text-[#0B1420]/50 mt-0.5">It goes live on the shop as soon as you save.</p>
          </div>

          {error && (
            <p className="text-xs text-rose-600 bg-rose-50 border border-rose-200 rounded-xl px-3 py-2">{error}</p>
          )}

          <div className="space-y-1.5">
            <label className={label}>Name</label>
            <input className={field} value={form.title} onChange={(e) => onTitleChange(e.target.value)} placeholder="Button Pocket Tote Bag" />
          </div>

          <div className="space-y-1.5">
            <label className={label}>Short description</label>
            <input className={field} value={form.shortDescription} onChange={(e) => set('shortDescription', e.target.value)} placeholder="Roomy everyday canvas tote" />
          </div>

          <div className="space-y-1.5">
            <label className={label}>Full description</label>
            <textarea className={`${field} min-h-[84px] resize-y`} value={form.description} onChange={(e) => set('description', e.target.value)} placeholder="Sturdy 320 GSM cotton canvas, hand-finished…" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className={label}>Colour</label>
              <input className={field} value={form.color} onChange={(e) => set('color', e.target.value)} placeholder="Natural" />
            </div>
            <div className="space-y-1.5">
              <label className={label}>Price (₹)</label>
              <input className={field} type="number" min={1} value={form.price} onChange={(e) => set('price', e.target.value)} placeholder="349" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className={label}>Stock</label>
              <input className={field} type="number" min={0} value={form.stock} onChange={(e) => set('stock', e.target.value)} placeholder="25" />
            </div>
            <div className="space-y-1.5">
              <label className={label}>SKU</label>
              <input
                className={`${field} font-mono`}
                value={form.sku}
                onChange={(e) => {
                  setSkuTouched(true);
                  set('sku', e.target.value);
                }}
                placeholder="POCKETTOTE-AB12"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className={label}>Photos</label>
            <label className="flex items-center gap-2 px-3.5 py-3 rounded-xl border border-dashed border-[#0B1420]/25 bg-white/50 text-sm text-[#0B1420]/60 cursor-pointer hover:border-[#B87D00]">
              <UploadCloud className="w-4 h-4 text-[#B87D00]" />
              <span>{files.length ? `${files.length} photo${files.length > 1 ? 's' : ''} selected` : 'Choose one or more photos'}</span>
              <input type="file" accept="image/jpeg,image/png,image/webp" multiple className="hidden" onChange={(e) => onPickImages(e.target.files)} />
            </label>
            {previews.length > 0 && (
              <div className="flex gap-2 flex-wrap pt-1">
                {previews.map((src, i) => (
                  <img key={i} src={src} alt="" className="w-14 h-14 rounded-lg object-cover border border-[#0B1420]/10" />
                ))}
              </div>
            )}
            <p className="text-[10px] text-[#0B1420]/40">The first photo becomes the thumbnail. JPG, PNG or WEBP, up to 15MB each.</p>
          </div>
        </div>

        <div className="shrink-0 border-t border-[#0B1420]/10 p-4 flex gap-3 bg-[#F7F2E8]">
          <button onClick={onClose} className="flex-1 py-3 rounded-full border border-[#0B1420]/15 text-[#0B1420]/70 text-xs uppercase tracking-widest">
            Cancel
          </button>
          <button
            onClick={submit}
            disabled={saving}
            className="flex-1 py-3 rounded-full bg-[#0B1420] text-[#F7F2E8] text-xs uppercase tracking-widest flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
            {saving ? 'Adding…' : 'Add tote'}
          </button>
        </div>
      </div>
    </div>
  );
}
