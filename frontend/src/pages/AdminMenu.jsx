import { useState } from 'react';
import { Plus, Pencil, Trash2, Search, Star, Eye, EyeOff, RotateCcw, X } from 'lucide-react';
import { useMenu } from '../context/MenuContext';
import { CATEGORIES } from '../data/mockMenu';
import { formatCurrency } from '../utils/currency';
import FoodImage from '../components/common/FoodImage';
import ConfirmDialog from '../components/common/ConfirmDialog';

const emptyForm = { name: '', description: '', price: '', category: CATEGORIES[0], image: '', preparationTime: 10, available: true, popular: false, featured: false };

export default function AdminMenu() {
  const { menu, addMenuItem, editMenuItem, removeMenuItem, toggleAvailability, togglePopular, toggleFeatured, resetMenu } = useMenu();
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('All');
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [confirm, setConfirm] = useState(null);

  const visibleItems = menu.filter((item) =>
    (category === 'All' || item.category === category)
    && item.name.toLowerCase().includes(query.toLowerCase().trim())
  );

  const openCreate = () => { setForm(emptyForm); setEditing('new'); };
  const openEdit = (item) => { setForm({ ...item, price: String(item.price) }); setEditing(item.id); };
  const updateForm = (field, value) => setForm((current) => ({ ...current, [field]: value }));
  const submit = (event) => {
    event.preventDefault();
    if (!form.name.trim() || !form.description.trim() || Number(form.price) <= 0) return;
    const data = { ...form, name: form.name.trim(), description: form.description.trim(), price: Number(form.price), preparationTime: Number(form.preparationTime) || 10, image: form.image.trim() || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=300&fit=crop' };
    if (editing === 'new') addMenuItem(data); else editMenuItem(editing, data);
    setEditing(null);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-7">
          <div><p className="text-xs font-semibold uppercase tracking-widest text-brand-600">Catalog</p><h1 className="font-display text-3xl font-bold text-charcoal mt-1">Menu Management</h1><p className="text-sm text-charcoal-muted mt-1">{menu.length} items in your cafeteria catalog</p></div>
          <div className="flex gap-2"><button onClick={() => setConfirm({ type: 'reset' })} className="px-3 py-2.5 rounded-xl border border-gray-200 text-xs font-semibold text-charcoal-muted hover:text-charcoal"><RotateCcw className="w-3.5 h-3.5 inline mr-1.5" />Reset demo</button><button onClick={openCreate} className="px-4 py-2.5 rounded-xl bg-brand-500 text-white text-sm font-semibold hover:bg-brand-600"><Plus className="w-4 h-4 inline mr-1.5" />Add item</button></div>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 mb-5">
          <div className="relative flex-1"><Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-charcoal-muted" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search menu items..." className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-brand-400" /></div>
          <select value={category} onChange={(event) => setCategory(event.target.value)} className="px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm"><option>All</option>{CATEGORIES.filter((item) => item !== 'All').map((item) => <option key={item}>{item}</option>)}</select>
        </div>
        <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {visibleItems.map((item) => <MenuItem key={item.id} item={item} onEdit={openEdit} onDelete={() => setConfirm({ type: 'delete', item })} onAvailability={toggleAvailability} onPopular={togglePopular} onFeatured={toggleFeatured} />)}
        </div>
      </div>
      {editing && <MenuForm form={form} updateForm={updateForm} onSubmit={submit} onClose={() => setEditing(null)} isNew={editing === 'new'} />}
      <ConfirmDialog isOpen={Boolean(confirm)} onClose={() => setConfirm(null)} onConfirm={() => { if (confirm?.type === 'reset') resetMenu(); else if (confirm?.item) removeMenuItem(confirm.item.id); setConfirm(null); }} title={confirm?.type === 'reset' ? 'Reset menu data?' : 'Delete menu item?'} message={confirm?.type === 'reset' ? 'This will remove your menu edits and restore the original demo catalog.' : `Remove ${confirm?.item?.name} from the catalog? This cannot be undone.`} confirmLabel={confirm?.type === 'reset' ? 'Reset menu' : 'Delete'} variant="danger" />
    </div>
  );
}

function MenuItem({ item, onEdit, onDelete, onAvailability, onPopular, onFeatured }) {
  return <article className={`bg-white rounded-2xl border p-3 shadow-sm ${item.available ? 'border-gray-100' : 'border-amber-200'}`}>
    <div className="relative"><FoodImage src={item.image} alt={item.name} className="w-full h-40 rounded-xl" /><span className={`absolute top-2 right-2 px-2 py-1 rounded-lg text-[10px] font-bold ${item.available ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-900/80 text-white'}`}>{item.available ? 'Available' : 'Unavailable'}</span></div>
    <div className="p-2 pb-1"><div className="flex items-start justify-between gap-2"><div><h2 className="font-display font-bold text-charcoal">{item.name}</h2><p className="text-xs text-charcoal-muted mt-0.5">{item.category} · {item.preparationTime} min</p></div><p className="font-display font-bold text-brand-600">{formatCurrency(item.price)}</p></div><p className="text-sm text-charcoal-muted mt-3 line-clamp-2 min-h-10">{item.description}</p>
      <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100"><div className="flex gap-1"><button onClick={() => onAvailability(item.id)} className="p-2 rounded-lg hover:bg-gray-100 text-charcoal-muted" title="Toggle availability">{item.available ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}</button><button onClick={() => onPopular(item.id)} className={`p-2 rounded-lg hover:bg-amber-50 ${item.popular ? 'text-amber-500' : 'text-gray-300'}`} title="Toggle popular"><Star className="w-4 h-4" fill={item.popular ? 'currentColor' : 'none'} /></button><button onClick={() => onFeatured(item.id)} className={`text-[10px] px-2 rounded-lg font-semibold ${item.featured ? 'bg-brand-50 text-brand-600' : 'bg-gray-50 text-gray-400'}`}>Featured</button></div><div className="flex gap-1"><button onClick={() => onEdit(item)} className="p-2 rounded-lg text-charcoal-muted hover:bg-brand-50 hover:text-brand-600" title="Edit item"><Pencil className="w-4 h-4" /></button><button onClick={onDelete} className="p-2 rounded-lg text-charcoal-muted hover:bg-red-50 hover:text-red-600" title="Delete item"><Trash2 className="w-4 h-4" /></button></div></div>
    </div>
  </article>;
}

function MenuForm({ form, updateForm, onSubmit, onClose, isNew }) {
  return <div className="fixed inset-0 z-[80] flex items-center justify-center p-4"><button className="fixed inset-0 bg-black/40 backdrop-blur-sm cursor-default" onClick={onClose} aria-label="Close form" /><form onSubmit={onSubmit} className="relative bg-white rounded-2xl shadow-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto p-6"><div className="flex items-center justify-between mb-5"><div><p className="text-xs uppercase tracking-widest text-brand-600 font-semibold">{isNew ? 'New catalog item' : 'Edit catalog item'}</p><h2 className="font-display text-2xl font-bold text-charcoal mt-1">{isNew ? 'Add menu item' : 'Update menu item'}</h2></div><button type="button" onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg"><X className="w-4 h-4" /></button></div>
    <div className="grid sm:grid-cols-2 gap-4"><Field label="Item name" value={form.name} onChange={(value) => updateForm('name', value)} required /><Field label="Price (₹)" type="number" value={form.price} onChange={(value) => updateForm('price', value)} required /><label className="sm:col-span-2 text-sm font-medium text-charcoal">Description<textarea value={form.description} onChange={(event) => updateForm('description', event.target.value)} rows="3" required className="mt-1.5 w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm resize-none focus:outline-none focus:border-brand-400" /></label><label className="text-sm font-medium text-charcoal">Category<select value={form.category} onChange={(event) => updateForm('category', event.target.value)} className="mt-1.5 w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm">{CATEGORIES.filter((item) => item !== 'All').map((item) => <option key={item}>{item}</option>)}</select></label><Field label="Prep time (minutes)" type="number" value={form.preparationTime} onChange={(value) => updateForm('preparationTime', value)} /><Field label="Image URL" value={form.image} onChange={(value) => updateForm('image', value)} /><div className="flex flex-wrap gap-4 items-end pb-1"><Toggle label="Available" checked={form.available} onChange={(value) => updateForm('available', value)} /><Toggle label="Popular" checked={form.popular} onChange={(value) => updateForm('popular', value)} /><Toggle label="Featured" checked={form.featured} onChange={(value) => updateForm('featured', value)} /></div></div>
    <div className="flex justify-end gap-2 mt-6 pt-4 border-t border-gray-100"><button type="button" onClick={onClose} className="px-4 py-2.5 rounded-xl text-sm font-medium bg-gray-100 text-charcoal-muted">Cancel</button><button type="submit" className="px-5 py-2.5 rounded-xl text-sm font-semibold bg-brand-500 text-white hover:bg-brand-600">{isNew ? 'Add item' : 'Save changes'}</button></div>
  </form></div>;
}

function Field({ label, value, onChange, type = 'text', required = false }) { return <label className="text-sm font-medium text-charcoal">{label}<input type={type} value={value} onChange={(event) => onChange(event.target.value)} required={required} min={type === 'number' ? '1' : undefined} className="mt-1.5 w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-brand-400" /></label>; }
function Toggle({ label, checked, onChange }) { return <label className="flex items-center gap-2 text-xs font-medium text-charcoal-muted cursor-pointer"><input type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} className="accent-orange-500" />{label}</label>; }
