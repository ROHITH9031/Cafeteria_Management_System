import { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, Filter, Plus, Minus, Star, ShoppingCart, X, UtensilsCrossed, RotateCcw } from 'lucide-react';
import { useMenu } from '../context/MenuContext';
import { useCart } from '../context/CartContext';
import { CATEGORIES, SORT_OPTIONS } from '../data/mockMenu';
import FoodImage from '../components/common/FoodImage';
import { formatCurrency } from '../utils/currency';

const DIETARY_FILTERS = ['Vegetarian', 'Vegan', 'Gluten-free', 'Dairy-free', 'Contains-eggs', 'Contains-nuts'];

export default function MenuPage() {
  const { menu, refreshMenu, loading } = useMenu();
  const { addToCart, getItemQuantity, updateQuantity } = useCart();
  const [searchParams, setSearchParams] = useSearchParams();

  const initialCategory = searchParams.get('category') || 'All';
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [sortBy, setSortBy] = useState('default');
  const [availableOnly, setAvailableOnly] = useState(false);
  const [popularOnly, setPopularOnly] = useState(false);
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [dietary, setDietary] = useState([]);
  const [showFilters, setShowFilters] = useState(false);

  const filteredAndSorted = useMemo(() => {
    let items = [...menu];

    // Filter by category
    if (selectedCategory !== 'All') {
      items = items.filter((item) => item.category === selectedCategory);
    }
    if (availableOnly) items = items.filter((item) => item.available);
    if (popularOnly) items = items.filter((item) => item.popular);
    if (minPrice !== '') items = items.filter((item) => item.price >= Number(minPrice));
    if (maxPrice !== '') items = items.filter((item) => item.price <= Number(maxPrice));
    if (dietary.length) items = items.filter((item) => dietary.every((tag) => item.dietaryTags.includes(tag)));

    // Search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      items = items.filter(
        (item) =>
          item.name.toLowerCase().includes(q) ||
          item.description.toLowerCase().includes(q) ||
          item.category.toLowerCase().includes(q)
      );
    }

    // Sort
    switch (sortBy) {
      case 'price-low':
        items.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        items.sort((a, b) => b.price - a.price);
        break;
      case 'popularity':
        items.sort((a, b) => (b.popular ? 1 : 0) - (a.popular ? 1 : 0));
        break;
      case 'name-az':
        items.sort((a, b) => a.name.localeCompare(b.name));
        break;
      default:
        // Keep featured first
        items.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
    }

    return items;
  }, [menu, selectedCategory, searchQuery, sortBy, availableOnly, popularOnly, minPrice, maxPrice, dietary]);

  const toggleDietary = (tag) => setDietary((selected) => selected.includes(tag)
    ? selected.filter((value) => value !== tag)
    : [...selected, tag]);

  const handleCategoryChange = (cat) => {
    setSelectedCategory(cat);
    if (cat === 'All') {
      searchParams.delete('category');
    } else {
      searchParams.set('category', cat);
    }
    setSearchParams(searchParams);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold text-charcoal dark:text-white">Our Menu</h1>
        <p className="mt-1 text-charcoal-muted dark:text-slate-400">Browse and order from our freshly prepared selection</p>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-charcoal-muted dark:text-slate-400" />
          <input
            type="text"
            placeholder="Search for food..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-xl text-sm text-charcoal dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-400 transition-all placeholder:text-gray-400 dark:placeholder:text-slate-500"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-slate-800"
            >
              <X className="w-3.5 h-3.5 text-charcoal-muted dark:text-slate-400" />
            </button>
          )}
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-2.5 border rounded-xl text-sm font-medium transition-all sm:hidden
              ${showFilters
                ? 'bg-brand-50 dark:bg-brand-500/20 border-brand-200 dark:border-brand-500/30 text-brand-700 dark:text-brand-300'
                : 'bg-white dark:bg-slate-900 border-gray-200 dark:border-slate-800 text-charcoal-muted dark:text-slate-300 hover:border-gray-300'}`}
          >
            <Filter className="w-4 h-4" />
            Filters
          </button>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-4 py-2.5 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-xl text-sm text-charcoal dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-400"
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value} className="bg-white dark:bg-slate-900 text-charcoal dark:text-white">
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Categories */}
      <div className={`${showFilters ? 'block' : 'hidden'} sm:block mb-6`}>
        <div className="flex flex-wrap gap-2 mb-3">
          <button
            type="button"
            aria-pressed={availableOnly}
            onClick={() => setAvailableOnly((value) => !value)}
            className={`px-3.5 py-2 rounded-xl text-sm font-medium border transition-colors ${availableOnly ? 'bg-emerald-600 border-emerald-600 text-white' : 'bg-white dark:bg-slate-900 border-gray-200 dark:border-slate-800 text-charcoal-muted dark:text-slate-300 hover:border-emerald-400'}`}
          >
            Available now
          </button>
          <button
            type="button"
            aria-pressed={popularOnly}
            onClick={() => setPopularOnly((value) => !value)}
            className={`px-3.5 py-2 rounded-xl text-sm font-medium border transition-colors ${popularOnly ? 'bg-amber-500 border-amber-500 text-white' : 'bg-white dark:bg-slate-900 border-gray-200 dark:border-slate-800 text-charcoal-muted dark:text-slate-300 hover:border-amber-400'}`}
          >
            Popular
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => handleCategoryChange(cat)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all
                ${selectedCategory === cat
                  ? 'bg-brand-500 text-white shadow-sm'
                  : 'bg-white dark:bg-slate-900 text-charcoal-muted dark:text-slate-300 border border-gray-200 dark:border-slate-800 hover:border-brand-200 hover:text-brand-600 dark:hover:text-brand-400'
                }`}
            >
              {cat}
            </button>
          ))}
        </div>
        <div className="flex flex-col sm:flex-row sm:items-end gap-3 mt-4">
          <label className="text-xs font-medium text-charcoal-muted dark:text-slate-400">Min price
            <input type="number" min="0" value={minPrice} onChange={(event) => setMinPrice(event.target.value)} className="mt-1 block w-full sm:w-28 px-3 py-2 rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-charcoal dark:text-white" />
          </label>
          <label className="text-xs font-medium text-charcoal-muted dark:text-slate-400">Max price
            <input type="number" min="0" value={maxPrice} onChange={(event) => setMaxPrice(event.target.value)} className="mt-1 block w-full sm:w-28 px-3 py-2 rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-charcoal dark:text-white" />
          </label>
          <fieldset className="min-w-0">
            <legend className="text-xs font-medium text-charcoal-muted dark:text-slate-400 mb-1">Dietary filters</legend>
            <div className="flex flex-wrap gap-2">
              {DIETARY_FILTERS.map((tag) => <button key={tag} type="button" aria-pressed={dietary.includes(tag)} onClick={() => toggleDietary(tag)} className={`px-2.5 py-1.5 rounded-lg border text-xs ${dietary.includes(tag) ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-white dark:bg-slate-900 text-charcoal-muted dark:text-slate-300 border-gray-200 dark:border-slate-700'}`}>{tag.replace('Contains-', 'Contains ')}</button>)}
            </div>
          </fieldset>
        </div>
      </div>

      {/* Results Count */}
      <p className="text-sm text-charcoal-muted dark:text-slate-400 mb-4">
        Showing {filteredAndSorted.length} item{filteredAndSorted.length !== 1 ? 's' : ''}
        {selectedCategory !== 'All' ? ` in ${selectedCategory}` : ''}
        {searchQuery ? ` for "${searchQuery}"` : ''}
      </p>

      {/* Food Grid / Empty / Error State */}
      {menu.length === 0 ? (
        <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-3xl border border-gray-100 dark:border-slate-800 p-8 shadow-xs">
          <UtensilsCrossed className="w-12 h-12 text-brand-400 mx-auto mb-4" />
          <h2 className="font-display font-bold text-xl text-charcoal dark:text-white">No Menu Items Available</h2>
          <p className="mt-1 text-sm text-charcoal-muted dark:text-slate-400">Unable to load cafeteria items. Please verify the server is running.</p>
          <button
            onClick={refreshMenu}
            disabled={loading}
            className="mt-5 inline-flex items-center gap-2 px-5 py-2.5 bg-brand-500 hover:bg-brand-600 disabled:opacity-50 text-white rounded-xl text-sm font-semibold transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            {loading ? 'Reloading...' : 'Reload Menu'}
          </button>
        </div>
      ) : filteredAndSorted.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-20 h-20 bg-gray-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Search className="w-8 h-8 text-gray-300 dark:text-slate-600" />
          </div>
          <h3 className="font-display font-semibold text-lg text-charcoal dark:text-white">No items found</h3>
          <p className="mt-1 text-sm text-charcoal-muted dark:text-slate-400">Try a different search or category</p>
          <button
            onClick={() => { setSearchQuery(''); setAvailableOnly(false); setPopularOnly(false); setMinPrice(''); setMaxPrice(''); setDietary([]); handleCategoryChange('All'); }}
            className="mt-4 px-4 py-2 text-sm font-medium text-brand-600 dark:text-brand-400 hover:bg-brand-50 dark:hover:bg-slate-800 rounded-xl transition-colors"
          >
            Clear Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filteredAndSorted.map((item) => (
            <MenuCard key={item.id} item={item} addToCart={addToCart} getItemQuantity={getItemQuantity} updateQuantity={updateQuantity} />
          ))}
        </div>
      )}
    </div>
  );
}

function MenuCard({ item, addToCart, getItemQuantity, updateQuantity }) {
  const quantity = getItemQuantity(item.id);
  const isUnavailable = !item.available || item.stock < 1;
  const atStockLimit = quantity >= item.stock;

  return (
    <div
      className={`bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 overflow-hidden card-hover
        ${isUnavailable ? 'opacity-60 grayscale' : ''}`}
    >
      <div className="relative">
        <FoodImage src={item.image} alt={item.name} className="h-44 w-full" />

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5">
          {item.popular && (
            <span className="flex items-center gap-1 text-[10px] font-semibold text-amber-700 dark:text-amber-300 bg-amber-50/90 dark:bg-amber-950/80 backdrop-blur-sm px-2 py-1 rounded-lg">
              <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
              Popular
            </span>
          )}
          {item.featured && (
            <span className="text-[10px] font-semibold text-brand-700 dark:text-brand-300 bg-brand-50/90 dark:bg-brand-950/80 backdrop-blur-sm px-2 py-1 rounded-lg">
              ⭐ Featured
            </span>
          )}
        </div>

        {isUnavailable && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <span className="px-4 py-1.5 bg-gray-900/90 text-white text-xs font-semibold rounded-full">
              Unavailable
            </span>
          </div>
        )}

        {/* Price Tag */}
        <div className="absolute bottom-3 right-3">
          <span className="px-3 py-1 bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm rounded-lg font-display font-bold text-brand-600 dark:text-brand-400 text-sm shadow-sm border border-black/5 dark:border-white/10">
            {formatCurrency(item.price)}
          </span>
        </div>
      </div>

      <div className="p-4">
        <span className="text-[10px] font-semibold text-charcoal-muted dark:text-slate-400 uppercase tracking-wider">
          {item.category}
        </span>
        <h3 className="font-display font-semibold text-charcoal dark:text-white mt-0.5">{item.name}</h3>
        <p className="text-xs text-charcoal-muted dark:text-slate-400 mt-1 line-clamp-2 leading-relaxed">{item.description}</p>
        {!isUnavailable && item.stock <= 5 && <p className="text-[11px] font-semibold text-amber-700 dark:text-amber-400 mt-2">Only {item.stock} left</p>}

        {/* Add to Cart / Quantity Control */}
        <div className="mt-4">
          {isUnavailable ? (
            <button
              disabled
              className="w-full py-2.5 bg-gray-100 dark:bg-slate-800 text-gray-400 dark:text-slate-500 text-sm font-medium rounded-xl cursor-not-allowed"
            >
              Unavailable
            </button>
          ) : quantity === 0 ? (
            <button
              onClick={() => addToCart(item)}
              className="w-full flex items-center justify-center gap-2 py-2.5 bg-brand-500 hover:bg-brand-600 text-white text-sm font-medium rounded-xl transition-colors shadow-sm hover:shadow-md"
            >
              <ShoppingCart className="w-4 h-4" />
              Add to Cart
            </button>
          ) : (
            <div className="flex items-center justify-between bg-brand-50 dark:bg-slate-800 rounded-xl px-2 py-1 border border-brand-100 dark:border-slate-700">
              <button
                onClick={() => updateQuantity(item.id, quantity - 1)}
                className="w-9 h-9 flex items-center justify-center bg-white dark:bg-slate-700 rounded-lg border border-brand-200 dark:border-slate-600 text-brand-600 dark:text-brand-400 hover:bg-brand-100 dark:hover:bg-slate-600 transition-colors"
                aria-label={`Decrease ${item.name} quantity`}
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="font-display font-bold text-brand-700 dark:text-brand-300 text-base min-w-8 text-center">
                {quantity}
              </span>
              <button
                onClick={() => updateQuantity(item.id, quantity + 1)}
                disabled={atStockLimit}
                className="w-9 h-9 flex items-center justify-center bg-brand-500 rounded-lg text-white hover:bg-brand-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                aria-label={`Increase ${item.name} quantity`}
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
