import React, { useEffect, useState } from 'react';
import FeatureCard from '../FeatureCard/FeatureCard';
import { featuresAPI } from '../../utils/api';
import { LoadingState, ErrorMessage } from '../ui';

const Features = () => {
  const [features, setFeatures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    const loadFeatures = async () => {
      setLoading(true);
      setError('');
      try {
        const data = await featuresAPI.list();
        if (active) {
          setFeatures(Array.isArray(data) ? data : data?.items || []);
        }
      } catch (err) {
        if (active) {
          setError(err.message || 'Impossible de charger les avantages.');
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    loadFeatures();
    return () => {
      active = false;
    };
  }, []);

  return (
    <section className="border-t border-gray-200 bg-gray-50">
      <div className="w-full mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl py-10 sm:py-14 lg:py-20">
        {loading && <LoadingState message="Chargement..." variant="inline" />}
        {!loading && error && <div className="text-center"><ErrorMessage message={error} /></div>}
        {!loading && !error && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 sm:gap-10 lg:gap-12">
            {features.map((feature) => (
              <FeatureCard
                key={feature.id || feature.title}
                title={feature.title}
                description={feature.description}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default Features;