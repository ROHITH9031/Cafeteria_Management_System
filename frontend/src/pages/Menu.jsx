import { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, Filter, Plus, Minus, Star, ShoppingCart, X } from 'lucide-react';
import { useMenu } from '../context/MenuContext';
import { useCart } from '../context/CartContext';
import { CATEGORIES, SORT_OPTIONS } from '../data/mockMenu';
import FoodImage from '../components/common/FoodImage';
import { formatCurrency } from '../utils/currency';

export default function MenuPage() {
  const { menu } = useMenu();
  const { addToCart, getItemQuantity, updateQuantity } = useCart();
  const [searchParams, setSearchParams] = useSearchParams();

  const initialCategory = searchParams.get('category') || 'All';
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [sortBy, setSortBy] = useState('default');
  const [showFilters, setShowFilters] = useState(false);

  const filteredAndSorted = useMemo(() => {
    let items = [...menu];

    // Filter by category
    if (selectedCategory !== 'All') {
      items = items.filter((item) => item.category === selectedCategory);
    }

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
  }, [menu, selectedCategory, searchQuery, sortBy]);

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
        <h1 className="font-display text-3xl font-bold text-charcoal">Our Menu</h1>
        <p className="mt-1 text-charcoal-muted">Browse and order from our freshly prepared selection</p>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-charcoal-muted" />
          <input
            type="text"
            placeholder="Search for food..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-400 transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-gray-100"
            >
              <X className="w-3.5 h-3.5 text-charcoal-muted" />
            </button>
          )}
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-2.5 border rounded-xl text-sm font-medium transition-all sm:hidden
              ${showFilters ? 'bg-brand-50 border-brand-200 text-brand-700' : 'bg-white border-gray-200 text-charcoal-muted hover:border-gray-300'}`}
          >
            <Filter className="w-4 h-4" />
            Filters
          </button>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-charcoal focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-400"
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Categories */}
      <div className={`${showFilters ? 'block' : 'hidden'} sm:block mb-6`}>
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => handleCategoryChange(cat)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all
                ${selectedCategory === cat
                  ? 'bg-brand-500 text-white shadow-sm'
                  : 'bg-white text-charcoal-muted border border-gray-200 hover:border-brand-200 hover:text-brand-600'
                }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Results Count */}
      <p className="text-sm text-charcoal-muted mb-4">
        Showing {filteredAndSorted.length} item{filteredAndSorted.length !== 1 ? 's' : ''}
        {selectedCategory !== 'All' ? ` in ${selectedCategory}` : ''}
        {searchQuery ? ` for "${searchQuery}"` : ''}
      </p>

      {/* Food Grid */}
      {filteredAndSorted.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-20 h-20 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Search className="w-8 h-8 text-gray-300" />
          </div>
          <h3 className="font-display font-semibold text-lg text-charcoal">No items found</h3>
          <p className="mt-1 text-sm text-charcoal-muted">Try a different search or category</p>
          <button
            onClick={() => { setSearchQuery(''); handleCategoryChange('All'); }}
            className="mt-4 px-4 py-2 text-sm font-medium text-brand-600 hover:bg-brand-50 rounded-xl transition-colors"
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
  const isUnavailable = !item.available;

  return (
    <div
      className={`bg-white rounded-2xl border border-gray-100 overflow-hidden card-hover
        ${isUnavailable ? 'opacity-60 grayscale' : ''}`}
    >
      <div className="relative">
        <FoodImage src={item.image} alt={item.name} className="h-44 w-full" />

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5">
          {item.popular && (
            <span className="flex items-center gap-1 text-[10px] font-semibold text-amber-700 bg-amber-50/90 backdrop-blur-sm px-2 py-1 rounded-lg">
              <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
              Popular
            </span>
          )}
          {item.featured && (
            <span className="text-[10px] font-semibold text-brand-700 bg-brand-50/90 backdrop-blur-sm px-2 py-1 rounded-lg">
              ⭐ Featured
            </span>
          )}
        </div>

        {isUnavailable && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <span className="px-4 py-1.5 bg-gray-900/90 text-white text-xs font-semibold rounded-full">
              Unavailable
            </span>
          </div>
        )}

        {/* Price Tag */}
        <div className="absolute bottom-3 right-3">
          <span className="px-3 py-1 bg-white/90 backdrop-blur-sm rounded-lg font-display font-bold text-brand-600 text-sm shadow-sm">
            {formatCurrency(item.price)}
          </span>
        </div>
      </div>

      <div className="p-4">
        <span className="text-[10px] font-semibold text-charcoal-muted uppercase tracking-wider">
          {item.category}
        </span>
        <h3 className="font-display font-semibold text-charcoal mt-0.5">{item.name}</h3>
        <p className="text-xs text-charcoal-muted mt-1 line-clamp-2 leading-relaxed">{item.description}</p>

        {/* Add to Cart / Quantity Control */}
        <div className="mt-4">
          {isUnavailable ? (
            <button
              disabled
              className="w-full py-2.5 bg-gray-100 text-gray-400 text-sm font-medium rounded-xl cursor-not-allowed"
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
            <div className="flex items-center justify-between bg-brand-50 rounded-xl px-2 py-1">
              <button
                onClick={() => updateQuantity(item.id, quantity - 1)}
                className="w-9 h-9 flex items-center justify-center bg-white rounded-lg border border-brand-200 text-brand-600 hover:bg-brand-100 transition-colors"
                aria-label={`Decrease ${item.name} quantity`}
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="font-display font-bold text-brand-700 text-base min-w-[2rem] text-center">
                {quantity}
              </span>
              <button
                onClick={() => updateQuantity(item.id, quantity + 1)}
                className="w-9 h-9 flex items-center justify-center bg-brand-500 rounded-lg text-white hover:bg-brand-600 transition-colors"
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
