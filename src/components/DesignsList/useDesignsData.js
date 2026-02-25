import { useEffect, useMemo, useState } from 'react';
import { designsAPI } from '../../utils/api';

export const useDesignsData = ({
  designsProp,
  searchTerm,
  activeFilter,
  page,
  limit = 12,
} = {}) => {
  const [designs, setDesigns] = useState(designsProp || []);
  const [loading, setLoading] = useState(!Array.isArray(designsProp));
  const [error, setError] = useState('');
  const [pagination, setPagination] = useState({ total: 0, total_pages: 1 });

  // Charger les designs (pagination côté serveur : re-fetch au changement de page/filter)
  useEffect(() => {
    let active = true;
    if (Array.isArray(designsProp)) {
      setDesigns(designsProp);
      setPagination({ total: designsProp.length, total_pages: 1 });
      setLoading(false);
      return () => {
        active = false;
      };
    }

    const loadDesigns = async () => {
      setLoading(true);
      setError('');
      try {
        const result = await designsAPI.list({
          filter: activeFilter,
          page,
          limit,
        });
        if (active) {
          const items = result?.items ?? [];
          setDesigns(Array.isArray(items) ? items : []);
          setPagination({
            total: result?.total ?? items.length,
            total_pages: result?.total_pages ?? 1,
          });
        }
      } catch (err) {
        if (active) {
          setError(err.message || 'Impossible de charger les designs.');
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    loadDesigns();
    return () => {
      active = false;
    };
  }, [designsProp, activeFilter, page, limit]);

  const filteredDesigns = useMemo(() => {
    if (!searchTerm) return designs;
    const term = searchTerm.toLowerCase();
    return designs.filter((design) =>
      design.title?.toLowerCase().includes(term) ||
      design.description?.toLowerCase().includes(term)
    );
  }, [designs, searchTerm]);

  const totalDesigns = pagination.total;
  const totalPages = Math.max(1, pagination.total_pages);
  const hasMoreDesigns = page < totalPages;

  return {
    loading,
    error,
    designs: filteredDesigns,
    hasMoreDesigns,
    totalDesigns,
    totalPages,
    currentPage: page,
  };
};
