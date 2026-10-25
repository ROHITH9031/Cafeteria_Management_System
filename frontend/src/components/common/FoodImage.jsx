import { useState } from 'react';
import { UtensilsCrossed } from 'lucide-react';

export default function FoodImage({ src, alt, className = '' }) {
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);

  if (error || !src) {
    return (
      <div className={`flex items-center justify-center bg-gradient-to-br from-brand-50 to-brand-100 ${className}`}>
        <UtensilsCrossed className="w-10 h-10 text-brand-300" />
      </div>
    );
  }

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {loading && (
        <div className="absolute inset-0 skeleton" />
      )}
      <img
        src={src}
        alt={alt}
        className={`w-full h-full object-cover transition-opacity duration-300 ${loading ? 'opacity-0' : 'opacity-100'}`}
        onError={() => setError(true)}
        onLoad={() => setLoading(false)}
        loading="lazy"
      />
    </div>
  );
}
