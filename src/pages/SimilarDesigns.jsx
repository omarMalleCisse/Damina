import React, { useEffect, useMemo, useState } from 'react';
import { designsAPI } from '../utils/api';
import DesignsListSlider from '../components/DesignsList/DesignsListSlider';

const SimilarDesigns = ({ currentId, max = 8 }) => {
  const [designs, setDesigns] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    const load = async () => {
      setLoading(true);
      try {
        const result = await designsAPI.list({ filter: 'all', page: 1, limit: 20 });
        if (active) {
          setDesigns(result?.items ?? result ?? []);
        }
      } catch {
        if (active) setDesigns([]);
      } finally {
        if (active) setLoading(false);
      }
    };
    load();
    return () => { active = false; };
  }, [currentId]);

  const candidates = useMemo(() => {
    const current = designs.find((d) => d.id === currentId);
    if (!current) return [];

    const currentCategories = (current.categories || []).map((c) => c.id);
    const byCategory = designs.filter(
      (d) =>
        d.id !== currentId &&
        Array.isArray(d.categories) &&
        d.categories.some((c) => currentCategories.includes(c.id))
    );
    const fallback = designs.filter((d) => d.id !== currentId && !byCategory.includes(d));
    return [...byCategory, ...fallback].slice(0, max);
  }, [designs, currentId, max]);

  if (loading || candidates.length === 0) return null;

  return (
    <section className="mt-8">
      <DesignsListSlider
        designs={candidates}
        title="Designs similaires"
        showViewAll={true}
        showViewAllCard={true}
        compactWrapper
        limit={8}
      />
    </section>
  );
};

export default SimilarDesigns;
