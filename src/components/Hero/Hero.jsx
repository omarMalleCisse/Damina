import React, { useEffect, useMemo, useRef, useState } from 'react';
// eslint-disable-next-line no-unused-vars -- used as namespace (motion.div, motion.section, etc.)
import { motion } from 'framer-motion';
import { ArrowRight, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { categoriesAPI } from '../../utils/api';

// Style moderne : apparition fluide au chargement (une seule fois)
const fadeUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 1.2, ease: [0.25, 0.46, 0.45, 0.94] }
};

const stagger = {
  animate: {
    transition: { staggerChildren: 0.2, delayChildren: 0.35 }
  }
};

const Hero = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [categoryError, setCategoryError] = useState('');
  const listRef = useRef(null);
  const [activeDot, setActiveDot] = useState(0);
  const [canScroll, setCanScroll] = useState(false);

  const dots = useMemo(() => {
    if (loadingCategories) return 3;
    const count = categories.length;
    if (count <= 0) return 1;
    return Math.min(6, Math.ceil(count / 3));
  }, [categories.length, loadingCategories]);

  useEffect(() => {
    let active = true;
    const loadCategories = async () => {
      setLoadingCategories(true);
      setCategoryError('');
      try {
        const data = await categoriesAPI.list();
        if (active) {
          setCategories(Array.isArray(data) ? data : data?.items || []);
        }
      } catch (err) {
        if (active) {
          setCategoryError(err.message || 'Impossible de charger les catégories.');
        }
      } finally {
        if (active) {
          setLoadingCategories(false);
        }
      }
    };

    loadCategories();
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    const updateDot = () => {
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

    updateDot();
    const timer = setTimeout(updateDot, 0);
    window.addEventListener('resize', updateDot);
    const listEl = listRef.current;
    const observer = listEl ? new ResizeObserver(updateDot) : null;
    if (observer && listEl) {
      observer.observe(listEl);
    }
    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', updateDot);
      if (observer && listEl) {
        observer.unobserve(listEl);
      }
    };
  }, [dots, categories.length, loadingCategories]);


  const scrollCategories = (direction) => {
    const el = listRef.current;
    if (!el) return;
    const amount = Math.max(160, Math.round(el.clientWidth * 0.6));
    const delta = direction === 'left' ? -amount : amount;
    el.scrollBy({ left: delta, behavior: 'smooth' });
  };

  return (
    <>
      {/* Topbar Categories */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.2 }}
        className="w-full bg-gradient-to-r from-[#ec9c23] via-[#eb4f11] to-[#ee1313] shadow-md"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative">
            {!loadingCategories && !categoryError && categories.length > 0 && canScroll && (
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
              {loadingCategories ? (
                <div className="flex items-center gap-2 text-white/80 text-sm">
                  <span className="h-4 w-4 shrink-0 animate-spin rounded-full border-2 border-white/30 border-t-white" aria-hidden />
                  Chargement...
                </div>
              ) : categoryError ? (
                <div className="text-white/90 text-sm">{categoryError}</div>
              ) : (
                categories.map((category) => (
                  <button
                    key={category.id}
                    type="button"
                    onClick={() => navigate(`/categories/${category.name.toLowerCase()}`)}
                    className="group flex items-center gap-1.5 px-3 py-1.5 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-lg transition-all duration-200 hover:scale-105 whitespace-nowrap border border-white/20 snap-start text-left cursor-pointer"
                  >
                    <span className="text-base">{category.icon}</span>
                    <span className="text-sm font-medium text-white">{category.name}</span>
                  </button>
                ))
              )}
            </div>

            {!loadingCategories && !categoryError && categories.length > 0 && canScroll && (
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
      </motion.div>

      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.4 }}
        className="w-full mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl py-4 sm:py-8 md:py-10 lg:py-12 xl:py-14 mt-0.5 relative hero-section"
      >
        {/* Accessible/preload image (visually hidden) */}
        <img src="/assets/image/image%20de%20hero.png" alt="Machine à broder numérique" className="sr-only" />
        {/* Mobile: show the hero image prominently above the content */}
        <motion.img
          src="/assets/image/image%20de%20hero.png"
          alt="Machine à broder numérique"
          className="hero-mobile-image"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.4, delay: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
        />
        <motion.div
          variants={stagger}
          initial="initial"
          animate="animate"
          className="hero-content flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8 lg:gap-16 xl:gap-20"
        >
          <div className="flex-1 max-w-3xl">
            {/* Badge */}
            <motion.div
              variants={fadeUp}
              className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-50 border border-[#eedbb7] rounded-full mb-4 lg:mb-6"
            >
              <span className="relative flex h-2 w-2">
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
              </span>
              <span className="text-sm font-medium text-[#fd4d08]">Nouveaux designs chaque semaine</span>
            </motion.div>

            {/* Title */}
            <motion.h1
              variants={fadeUp}
              className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-6xl font-bold text-gray-900 leading-[1.1] mb-4 lg:mb-6"
            >
              <span className="bg-gradient-to-r from-[#ec9c23] via-[#eb4f11] to-pink-600 bg-clip-text text-transparent">
                Design
              </span> pour Machine broderie
              <br />
              <span className="bg-gradient-to-r from-[#ec9c23] via-[#eb4f11] to-pink-600 bg-clip-text text-transparent">
                prêts à utiliser
              </span>
            </motion.h1>

            {/* Description */}
            <motion.p
              variants={fadeUp}
              className="text-base sm:text-lg lg:text-xl text-gray-600 mb-4 lg:mb-6 leading-relaxed max-w-2xl"
            >
              Téléchargez des designs professionnels dans tous les formats.
              <span className="block mt-2 font-medium text-gray-900">Commencez gratuitement dès maintenant.</span>
            </motion.p>

            {/* Buttons */}
            <motion.div variants={fadeUp} className="flex flex-col sm:flex-row gap-3">
              <button
                type="button"
                onClick={() => navigate('/designs')}
                className="group w-full sm:w-auto px-6 py-3 bg-[#fd4d08] text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition-all shadow-md hover:shadow-lg hover:scale-105 flex items-center justify-center space-x-2"
              >
                <span>Parcourir les designs</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
            </motion.div>
          </div>

          {/* CTA Card */}
          <motion.div
            initial={{ opacity: 0, x: 32 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1.5, delay: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="lg:flex-shrink-0 lg:w-72 xl:w-80"
          >
            <div className="relative bg-gradient-to-br from-[#ec9c23] via-[#eb4f11] to-[#ee1313] rounded-2xl p-4 sm:p-6 text-white shadow-xl overflow-hidden">
              {/* Cercles décoratifs statiques */}
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl" />
              <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-white/10 rounded-full blur-2xl" />

              <div className="relative z-10">

                {/* --- VERSION MOBILE : juste le bouton --- */}
                <div className="block lg:hidden">
                  <button
                    type="button"
                    onClick={() => navigate('/orders')}
                    className="w-full bg-white text-[#000] font-semibold px-4 py-2.5 rounded-lg hover:bg-gray-50 transition-all shadow-md hover:shadow-lg hover:scale-105 transform duration-200 flex items-center justify-center space-x-2"
                  >
                    <span>Précommander un motif</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
               

                {/* --- VERSION DESKTOP : tout le contenu --- */}
                <div className="hidden lg:block">
                  <div className="inline-flex items-center px-2 py-2 bg-white/20 backdrop-blur-sm rounded-full text-xs font-medium mb-4">
                    ✨ Nouveau service
                  </div>

                  <h3 className="text-xl sm:text-2xl font-bold mb-2 leading-tight">
                    Design sur mesure
                  </h3>

                  <p className="text-white/90 text-sm mb-4 leading-relaxed">
                    Besoin d'un motif unique ? Précommandez un design personnalisé créé spécialement pour vous.
                  </p>

                  <button
                    type="button"
                    onClick={() => navigate('/orders')}
                    className="w-full bg-white text-[#000] font-semibold px-4 py-2.5 rounded-lg hover:bg-gray-50 transition-all shadow-md hover:shadow-lg hover:scale-105 transform duration-200 flex items-center justify-center space-x-2"
                  >
                    <span>Précommander un motif</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>

                  <p className="text-white/70 text-xs mt-3 text-center">
                    Livraison sous 48-72h
                  </p>
                </div>
              </div>
            </div>
            <span className="block mt-2 font-medium text-gray-900 text-center w-full">des créations 100% africaines</span>
          </motion.div>
        </motion.div>
      </motion.section>
    </>
  );
};

export default Hero;