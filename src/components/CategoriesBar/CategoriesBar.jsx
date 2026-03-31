import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { categoriesAPI } from '../../utils/api';

const CategoriesBar = ({ className = '' }) => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const listRef = useRef(null);
  const [activeDot, setActiveDot] = useState(0);
  const [canScroll, setCanScroll] = useState(false);

  const dots = useMemo(() => {
    if (loading) return 3;
    const count = categories.length;
    if (count <= 0) return 1;
    return Math.min(6, Math.ceil(count / 3));
  }, [categories.length, loading]);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError('');
    categoriesAPI
      .list()
      .then((data) => {
        if (!active) return;
        setCategories(Array.isArray(data) ? data : data?.items || []);
      })
      .catch((err) => {
        if (!active) return;
        setError(err?.message || 'Impossible de charger les catégories.');
        setCategories([]);
      })
      .finally(() => {
        if (!active) return;
        setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    const update = () => {
      const el = listRef.current;
      if (!el) return;
      const maxScroll = el.scrollWidth - el.clientWidth;
      setCanScroll(maxScroll > 8);
      if (maxScroll <= 0) {
        setActiveDot(0);
        return;
      }
      const ratio = el.scrollLeft / maxScroll;
      const next = Math.round(ratio * (dots - 1));
      setActiveDot(next);
    };

    update();
    const t = setTimeout(update, 0);
    window.addEventListener('resize', update);
    const listEl = listRef.current;
    const observer = listEl ? new ResizeObserver(update) : null;
    if (observer && listEl) observer.observe(listEl);
    return () => {
      clearTimeout(t);
      window.removeEventListener('resize', update);
      if (observer && listEl) observer.unobserve(listEl);
    };
  }, [dots, categories.length, loading]);

  const scrollCategories = (direction) => {
    const el = listRef.current;
    if (!el) return;
    const amount = Math.max(160, Math.round(el.clientWidth * 0.6));
    const delta = direction === 'left' ? -amount : amount;
    el.scrollBy({ left: delta, behavior: 'smooth' });
  };

  return (
    <div
      className={`w-full bg-gradient-to-r from-[#ec9c23] via-[#eb4f11] to-[#ee1313] shadow-md ${className}`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative">
          {!loading && !error && categories.length > 0 && canScroll && (
            <button
              type="button"
              aria-label="Défiler vers la gauche"
              onClick={() => scrollCategories('left')}
              className="absolute left-1 top-1/2 -translate-y-1/2 z-10 h-8 w-8 sm:h-9 sm:w-9 rounded-full bg-white/30 text-white shadow-md hover:bg-white/50 flex items-center justify-center backdrop-blur-md border border-white/40 lg:hidden"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
          )}

          <div
            ref={listRef}
            className="flex items-center justify-between overflow-x-auto py-3 gap-2 scrollbar-hide snap-x snap-mandatory px-7 sm:px-9"
            onScroll={() => {
              const el = listRef.current;
              if (!el) return;
              const maxScroll = el.scrollWidth - el.clientWidth;
              setCanScroll(maxScroll > 4);
              if (maxScroll <= 0) {
                setActiveDot(0);
                return;
              }
              const ratio = el.scrollLeft / maxScroll;
              const next = Math.round(ratio * (dots - 1));
              setActiveDot(next);
            }}
          >
            {loading ? (
              <div className="flex items-center gap-2 text-white/80 text-sm">
                <span className="h-4 w-4 shrink-0 animate-spin rounded-full border-2 border-white/30 border-t-white" aria-hidden />
                Chargement...
              </div>
            ) : error ? (
              <div className="text-white/90 text-sm">{error}</div>
            ) : (
              categories.map((category) => (
                <button
                  key={category.id}
                  type="button"
                  onClick={() => navigate(`/categories/${String(category.name || '').toLowerCase()}`)}
                  className="group flex items-center gap-1.5 px-3 py-1.5 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-lg transition-all duration-200 hover:scale-105 whitespace-nowrap border border-white/20 snap-start text-left cursor-pointer"
                >
                  {category.icon && <span className="text-base">{category.icon}</span>}
                  <span className="text-sm font-medium text-white">{category.name}</span>
                </button>
              ))
            )}
          </div>

          {!loading && !error && categories.length > 0 && canScroll && (
            <button
              type="button"
              aria-label="Défiler vers la droite"
              onClick={() => scrollCategories('right')}
              className="absolute right-1 top-1/2 -translate-y-1/2 z-10 h-8 w-8 sm:h-9 sm:w-9 rounded-full bg-white/30 text-white shadow-md hover:bg-white/50 flex items-center justify-center backdrop-blur-md border border-white/40 lg:hidden"
            >
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>

        <div className="flex items-center justify-center gap-2 pb-3">
          {Array.from({ length: dots }).map((_, index) => (
            <button
              key={index}
              type="button"
              aria-label={`Aller au point ${index + 1}`}
              className={`h-2 w-2 rounded-full transition ${
                index === activeDot ? 'bg-white scale-110' : 'bg-white/50'
              }`}
              onClick={() => {
                const el = listRef.current;
                if (!el) return;
                const maxScroll = el.scrollWidth - el.clientWidth;
                if (maxScroll <= 0) return;
                const target = (maxScroll * index) / (dots - 1 || 1);
                el.scrollTo({ left: target, behavior: 'smooth' });
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default CategoriesBar;

