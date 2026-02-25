import { useEffect, useState, useCallback } from 'react';
import { packsAPI } from '../utils/api';

export const usePack = () => {
  const [pack, setPack] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchPack = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await packsAPI.get();
      setPack(data);
      return data;
    } catch (err) {
      setError(err?.message || 'Erreur chargement du pack');
      setPack(null);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPack();
  }, [fetchPack]);

  return { pack, loading, error, refetch: fetchPack };
};
