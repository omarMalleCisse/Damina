import React, { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Download, Users, TrendingUp } from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
} from 'recharts';
import ChartContainer from './ChartContainer';

const API_BASE_URL = 'http://localhost:8000';

const getToken = () =>
  localStorage.getItem('access_token') ||
  localStorage.getItem('token') ||
  localStorage.getItem('accessToken') ||
  sessionStorage.getItem('access_token') ||
  sessionStorage.getItem('token') ||
  sessionStorage.getItem('accessToken') ||
  '';

const AdminDashboard = () => {
  const [designCount, setDesignCount] = useState(0);
  const [categoryCount, setCategoryCount] = useState(0);
  const [featureCount, setFeatureCount] = useState(0);
  const [packCount, setPackCount] = useState(0);
  const [packOrderCount, setPackOrderCount] = useState(0);
  const [orderCount, setOrderCount] = useState(0);
  const [userCount, setUserCount] = useState(0);
  const [downloadCount, setDownloadCount] = useState(0);
  const [downloadsList, setDownloadsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadStats = async () => {
    setLoading(true);
    setError('');
    try {
      const token = getToken();
      const [designsRes, categoriesRes, featuresRes, packsRes, packOrdersRes, ordersRes, usersRes, downloadsRes] = await Promise.all([
        fetch(`${API_BASE_URL}/api/designs`),
        fetch(`${API_BASE_URL}/api/categories`),
        token ? fetch(`${API_BASE_URL}/api/admin/features`, { headers: { Authorization: `Bearer ${token}` } }) : Promise.resolve(null),
        fetch(`${API_BASE_URL}/api/packs`),
        token ? fetch(`${API_BASE_URL}/api/pack-orders?limit=500`, { headers: { Authorization: `Bearer ${token}` } }) : Promise.resolve(null),
        token ? fetch(`${API_BASE_URL}/api/orders`, { headers: { Authorization: `Bearer ${token}` } }).catch(() => null) : Promise.resolve(null),
        token ? fetch(`${API_BASE_URL}/api/users`, { headers: { Authorization: `Bearer ${token}` } }).catch(() => null) : Promise.resolve(null),
        token ? fetch(`${API_BASE_URL}/api/downloads`, { headers: { Authorization: `Bearer ${token}` } }).catch(() => null) : Promise.resolve(null),
      ]);

      if (!designsRes.ok || !categoriesRes.ok) {
        throw new Error('Impossible de charger les statistiques.');
      }

      const designsData = await designsRes.json();
      const categoriesData = await categoriesRes.json();

      const designsArray = Array.isArray(designsData)
        ? designsData
        : designsData?.items || designsData?.designs || [];
      const categoriesArray = Array.isArray(categoriesData)
        ? categoriesData
        : categoriesData?.items || [];

      setDesignCount(designsArray.length);
      setCategoryCount(categoriesArray.length);

      if (featuresRes && featuresRes.ok) {
        const featuresData = await featuresRes.json();
        const featuresArray = Array.isArray(featuresData) ? featuresData : featuresData?.items || [];
        setFeatureCount(featuresArray.length);
      }

      if (packsRes && packsRes.ok) {
        const packsData = await packsRes.json();
        const packsArray = Array.isArray(packsData) ? packsData : [];
        setPackCount(packsArray.length);
      }

      if (packOrdersRes && packOrdersRes.ok) {
        const packOrdersData = await packOrdersRes.json();
        const packOrdersArray = Array.isArray(packOrdersData) ? packOrdersData : [];
        setPackOrderCount(packOrdersArray.length);
      }

      if (ordersRes && ordersRes.ok) {
        const ordersData = await ordersRes.json();
        const ordersArray = Array.isArray(ordersData) ? ordersData : ordersData?.items || [];
        setOrderCount(Array.isArray(ordersArray) ? ordersArray.length : 0);
      }

      if (usersRes && usersRes.ok) {
        const usersData = await usersRes.json();
        const usersArray = Array.isArray(usersData)
          ? usersData
          : usersData?.items || [];
        setUserCount(usersArray.length);
      }

      if (downloadsRes && downloadsRes.ok) {
        const dlData = await downloadsRes.json();
        const dlArray = Array.isArray(dlData)
          ? dlData
          : dlData?.items ?? dlData?.downloads ?? [];
        setDownloadCount(dlArray.length);
        setDownloadsList(dlArray);
      }
    } catch (err) {
      setError(err.message || 'Erreur inconnue.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStats();
  }, []);

  const chartColors = ['#fd4d08', '#0ea5e9', '#06b6d4', '#14b8a6', '#ec9c23'];

  const overviewBarData = useMemo(
    () => [
      { name: 'Designs', value: designCount, fill: chartColors[0] },
      { name: 'Catégories', value: categoryCount, fill: chartColors[1] },
      { name: 'Utilisateurs', value: userCount, fill: chartColors[2] },
      { name: 'Téléchargements', value: downloadCount, fill: chartColors[3] },
      { name: 'Commandes', value: orderCount + packOrderCount, fill: chartColors[4] },
    ],
    [designCount, categoryCount, userCount, downloadCount, orderCount, packOrderCount]
  );

  const overviewPieData = useMemo(() => {
    const total = designCount + categoryCount + userCount + downloadCount + (orderCount + packOrderCount) || 1;
    return [
      { name: 'Designs', value: designCount, fill: chartColors[0] },
      { name: 'Catégories', value: categoryCount, fill: chartColors[1] },
      { name: 'Utilisateurs', value: userCount, fill: chartColors[2] },
      { name: 'Téléchargements', value: downloadCount, fill: chartColors[3] },
      { name: 'Commandes', value: orderCount + packOrderCount, fill: chartColors[4] },
    ].filter((d) => d.value > 0);
  }, [designCount, categoryCount, userCount, downloadCount, orderCount, packOrderCount]);

  const topDesignsData = useMemo(() => {
    const map = {};
    downloadsList.forEach((d) => {
      const key = d.design_title ?? d.design_name ?? d.title ?? `Design #${d.design_id ?? d.id ?? '?'}`;
      map[key] = (map[key] || 0) + 1;
    });
    return Object.entries(map)
      .map(([name, count]) => ({ name: name.length > 20 ? name.slice(0, 18) + '…' : name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8);
  }, [downloadsList]);

  const activityAreaData = useMemo(
    () => [
      { label: 'Designs', uv: designCount },
      { label: 'Catégories', uv: categoryCount },
      { label: 'Utilisateurs', uv: userCount },
      { label: 'Tél.', uv: downloadCount },
      { label: 'Commandes', uv: orderCount + packOrderCount },
    ],
    [designCount, categoryCount, userCount, downloadCount, orderCount, packOrderCount]
  );

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-10 lg:py-12">
        <div className="flex flex-col gap-2 sm:gap-3 mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Dashboard admin</h1>
          <p className="text-sm sm:text-base text-gray-600">
            Accès rapide aux designs, catégories, features, utilisateurs et téléchargements.
          </p>
          <nav className="flex flex-wrap items-center gap-2 sm:gap-3 mt-1 text-sm" aria-label="Liens rapides">
            <span className="text-gray-500">Liens rapides :</span>
            <Link to="/admin/designs" className="text-[#fd4d08] font-medium hover:underline">Designs</Link>
            <Link to="/admin/categories" className="text-[#fd4d08] font-medium hover:underline">Catégories</Link>
            <Link to="/admin/features" className="text-[#fd4d08] font-medium hover:underline">Features</Link>
            <Link to="/admin/users" className="text-[#fd4d08] font-medium hover:underline">Utilisateurs</Link>
            <Link to="/admin/downloads" className="text-[#fd4d08] font-medium hover:underline">Téléchargements</Link>
            <Link to="/admin/orders" className="text-[#fd4d08] font-medium hover:underline">Commandes</Link>
            <Link to="/admin/packs" className="text-[#fd4d08] font-medium hover:underline">Packs</Link>
          </nav>
        </div>

        {error && (
          <div className="mb-4 sm:mb-6 rounded-lg border border-red-200 bg-red-50 px-3 sm:px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Illustrations graphiques : Téléchargements & Utilisateurs */}
        <section className="mb-8 grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#fd4d08] via-[#eb4f11] to-[#ec9c23] p-6 sm:p-8 shadow-xl">
            <div className="absolute top-0 right-0 w-32 h-32 sm:w-40 sm:h-40 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />
            <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm">
                  <Download className="h-6 w-6 sm:h-7 sm:w-7 text-white" />
                </div>
                <div>
                  <p className="text-white/90 text-sm font-medium">Téléchargements</p>
                  <p className="mt-1 text-3xl sm:text-4xl font-bold text-white tabular-nums">
                    {loading ? '—' : downloadCount}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-2 flex-1 min-w-[80px] max-w-[140px] rounded-full bg-white/20 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-white transition-all duration-700 ease-out"
                    style={{
                      width: loading ? '0%' : `${Math.min(100, (downloadCount / Math.max(downloadCount, userCount, 1)) * 100)}%`,
                    }}
                  />
                </div>
                <TrendingUp className="h-5 w-5 text-white/80 shrink-0" />
              </div>
            </div>
            <Link
              to="/admin/downloads"
              className="relative mt-4 inline-flex items-center text-sm font-medium text-white/95 hover:text-white"
            >
              Voir l&apos;historique →
            </Link>
          </div>

          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#0ea5e9] via-[#06b6d4] to-[#14b8a6] p-6 sm:p-8 shadow-xl">
            <div className="absolute top-0 right-0 w-32 h-32 sm:w-40 sm:h-40 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />
            <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm">
                  <Users className="h-6 w-6 sm:h-7 sm:w-7 text-white" />
                </div>
                <div>
                  <p className="text-white/90 text-sm font-medium">Utilisateurs</p>
                  <p className="mt-1 text-3xl sm:text-4xl font-bold text-white tabular-nums">
                    {loading ? '—' : userCount}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-2 flex-1 min-w-[80px] max-w-[140px] rounded-full bg-white/20 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-white transition-all duration-700 ease-out"
                    style={{
                      width: loading ? '0%' : `${Math.min(100, (userCount / Math.max(downloadCount, userCount, 1)) * 100)}%`,
                    }}
                  />
                </div>
                <TrendingUp className="h-5 w-5 text-white/80 shrink-0" />
              </div>
            </div>
            <Link
              to="/admin/users"
              className="relative mt-4 inline-flex items-center text-sm font-medium text-white/95 hover:text-white"
            >
              Voir les utilisateurs →
            </Link>
          </div>
        </section>

        {/* Graphiques avancés : Barres, Donut, Top designs */}
        <section className="mb-8 space-y-6">
          <h2 className="text-lg font-semibold text-gray-900">Statistiques en graphiques</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl border border-gray-200 p-4 sm:p-6 shadow-sm">
              <h3 className="text-sm font-medium text-gray-600 mb-4">Vue d&apos;ensemble (barres)</h3>
              {loading ? (
                <div className="h-64 sm:h-72 flex items-center justify-center text-gray-400">
                  <span className="h-8 w-8 animate-spin rounded-full border-2 border-gray-200 border-t-[#fd4d08] inline-block" />
                </div>
              ) : (
                <ChartContainer className="h-64 sm:h-72 w-full" minHeight={200}>
                  {({ width, height }) => (
                    <BarChart width={width} height={height} data={overviewBarData} layout="vertical" margin={{ left: 8, right: 8 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis type="number" tick={{ fontSize: 12 }} />
                      <YAxis type="category" dataKey="name" width={90} tick={{ fontSize: 11 }} />
                      <Tooltip />
                      <Bar dataKey="value" name="Quantité" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  )}
                </ChartContainer>
              )}
            </div>

            <div className="bg-white rounded-2xl border border-gray-200 p-4 sm:p-6 shadow-sm">
              <h3 className="text-sm font-medium text-gray-600 mb-4">Répartition (donut)</h3>
              {loading ? (
                <div className="h-64 sm:h-72 flex items-center justify-center text-gray-400">
                  <span className="h-8 w-8 animate-spin rounded-full border-2 border-gray-200 border-t-[#fd4d08] inline-block" />
                </div>
              ) : overviewPieData.length === 0 ? (
                <div className="h-64 sm:h-72 flex items-center justify-center text-gray-400 text-sm">Aucune donnée</div>
              ) : (
                <ChartContainer className="h-64 sm:h-72 w-full" minHeight={200}>
                  {({ width, height }) => (
                    <PieChart width={width} height={height}>
                      <Pie
                        data={overviewPieData}
                        cx="50%"
                        cy="50%"
                        innerRadius="50%"
                        outerRadius="80%"
                        paddingAngle={2}
                        dataKey="value"
                        nameKey="name"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {overviewPieData.map((entry, i) => (
                          <Cell key={i} fill={entry.fill} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(v) => [v, 'Quantité']} />
                    </PieChart>
                  )}
                </ChartContainer>
              )}
            </div>

            <div className="bg-white rounded-2xl border border-gray-200 p-4 sm:p-6 shadow-sm lg:col-span-2">
              <h3 className="text-sm font-medium text-gray-600 mb-4">Activité (aperçu)</h3>
              {loading ? (
                <div className="h-48 sm:h-56 flex items-center justify-center text-gray-400">
                  <span className="h-8 w-8 animate-spin rounded-full border-2 border-gray-200 border-t-[#fd4d08] inline-block" />
                </div>
              ) : (
                <ChartContainer className="h-48 sm:h-56 w-full" minHeight={180}>
                  {({ width, height }) => (
                    <AreaChart width={width} height={height} data={activityAreaData} margin={{ top: 8, right: 8, left: 8, bottom: 8 }}>
                      <defs>
                        <linearGradient id="colorUv" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#fd4d08" stopOpacity={0.4} />
                          <stop offset="95%" stopColor="#fd4d08" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                      <YAxis tick={{ fontSize: 11 }} />
                      <Tooltip />
                      <Area type="monotone" dataKey="uv" name="Volume" stroke="#fd4d08" fill="url(#colorUv)" strokeWidth={2} />
                    </AreaChart>
                  )}
                </ChartContainer>
              )}
            </div>

            {topDesignsData.length > 0 && (
              <div className="bg-white rounded-2xl border border-gray-200 p-4 sm:p-6 shadow-sm lg:col-span-2">
                <h3 className="text-sm font-medium text-gray-600 mb-4">Top designs téléchargés</h3>
                <ChartContainer className="h-64 sm:h-72 w-full" minHeight={200}>
                  {({ width, height }) => (
                    <BarChart width={width} height={height} data={topDesignsData} margin={{ left: 8, right: 8, bottom: 20 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis dataKey="name" tick={{ fontSize: 10 }} angle={-25} textAnchor="end" height={60} />
                      <YAxis tick={{ fontSize: 11 }} />
                      <Tooltip />
                      <Bar dataKey="count" name="Téléchargements" fill="#0ea5e9" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  )}
                </ChartContainer>
              </div>
            )}
          </div>
        </section>

        <section className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-5 shadow-sm">
            <div className="text-xs sm:text-sm text-gray-500">Designs</div>
            <div className="mt-1.5 sm:mt-2 text-xl sm:text-2xl font-semibold text-gray-900">
              {loading ? (
                <span className="inline-flex items-center gap-2 text-sm sm:text-base text-gray-500">
                  <span className="h-5 w-5 shrink-0 animate-spin rounded-full border-2 border-gray-200 border-t-[#fd4d08] inline-block" aria-hidden /> Chargement...
                </span>
              ) : (
                `${designCount} designs`
              )}
            </div>
            <div className="mt-3 sm:mt-4 flex flex-wrap gap-2">
              <Link
                to="/admin/designs"
                className="inline-flex items-center rounded-lg bg-[#fd4d08] text-white px-3 py-2 text-xs sm:text-sm font-medium hover:bg-[#fda708]"
              >
                Voir les designs
              </Link>
              <Link
                to="/admin/designs/new"
                className="inline-flex items-center rounded-lg border border-gray-200 px-3 py-2 text-xs sm:text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Créer design
              </Link>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-5 shadow-sm">
            <div className="text-xs sm:text-sm text-gray-500">Catégories</div>
            <div className="mt-1.5 sm:mt-2 text-xl sm:text-2xl font-semibold text-gray-900">
              {loading ? (
                <span className="inline-flex items-center gap-2 text-sm sm:text-base text-gray-500">
                  <span className="h-5 w-5 shrink-0 animate-spin rounded-full border-2 border-gray-200 border-t-[#fd4d08] inline-block" aria-hidden /> Chargement...
                </span>
              ) : (
                `${categoryCount} catégories`
              )}
            </div>
            <div className="mt-3 sm:mt-4 flex flex-wrap gap-2">
              <Link
                to="/admin/categories"
                className="inline-flex items-center rounded-lg bg-[#fd4d08] text-white px-3 py-2 text-xs sm:text-sm font-medium hover:bg-[#fda708]"
              >
                Voir catégories
              </Link>
              <Link
                to="/admin/categories/new"
                className="inline-flex items-center rounded-lg border border-gray-200 px-3 py-2 text-xs sm:text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Créer catégorie
              </Link>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-5 shadow-sm">
            <div className="text-xs sm:text-sm text-gray-500">Features</div>
            <div className="mt-1.5 sm:mt-2 text-xl sm:text-2xl font-semibold text-gray-900">
              {loading ? (
                <span className="inline-flex items-center gap-2 text-sm sm:text-base text-gray-500">
                  <span className="h-5 w-5 shrink-0 animate-spin rounded-full border-2 border-gray-200 border-t-[#fd4d08] inline-block" aria-hidden /> Chargement...
                </span>
              ) : (
                `${featureCount} feature${featureCount !== 1 ? 's' : ''}`
              )}
            </div>
            <div className="mt-3 sm:mt-4 flex flex-wrap gap-2">
              <Link
                to="/admin/features"
                className="inline-flex items-center rounded-lg bg-[#fd4d08] text-white px-3 py-2 text-xs sm:text-sm font-medium hover:bg-[#fda708]"
              >
                Voir les features
              </Link>
              <Link
                to="/admin/features/new"
                className="inline-flex items-center rounded-lg border border-gray-200 px-3 py-2 text-xs sm:text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Créer une feature
              </Link>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-5 shadow-sm">
            <div className="text-xs sm:text-sm text-gray-500">Commandes</div>
            <div className="mt-1.5 sm:mt-2 text-xl sm:text-2xl font-semibold text-gray-900">
              {loading ? (
                <span className="inline-flex items-center gap-2 text-sm sm:text-base text-gray-500">
                  <span className="h-5 w-5 shrink-0 animate-spin rounded-full border-2 border-gray-200 border-t-[#fd4d08] inline-block" aria-hidden /> Chargement...
                </span>
              ) : (
                `${orderCount} commande${orderCount !== 1 ? 's' : ''}`
              )}
            </div>
            <div className="mt-3 sm:mt-4 flex flex-wrap gap-2">
              <Link
                to="/admin/orders"
                className="inline-flex items-center rounded-lg bg-[#fd4d08] text-white px-3 py-2 text-xs sm:text-sm font-medium hover:bg-[#fda708]"
              >
                Voir les commandes
              </Link>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-5 shadow-sm">
            <div className="text-xs sm:text-sm text-gray-500">Packs</div>
            <div className="mt-1.5 sm:mt-2 text-xl sm:text-2xl font-semibold text-gray-900">
              {loading ? (
                <span className="inline-flex items-center gap-2 text-sm sm:text-base text-gray-500">
                  <span className="h-5 w-5 shrink-0 animate-spin rounded-full border-2 border-gray-200 border-t-[#fd4d08] inline-block" aria-hidden /> Chargement...
                </span>
              ) : (
                `${packCount} pack${packCount !== 1 ? 's' : ''}`
              )}
            </div>
            <div className="mt-3 sm:mt-4 flex flex-wrap gap-2">
              <Link
                to="/admin/packs"
                className="inline-flex items-center rounded-lg bg-[#fd4d08] text-white px-3 py-2 text-xs sm:text-sm font-medium hover:bg-[#fda708]"
              >
                Voir les packs
              </Link>
              <Link
                to="/admin/packs/new"
                className="inline-flex items-center rounded-lg border border-gray-200 px-3 py-2 text-xs sm:text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Créer un pack
              </Link>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-5 shadow-sm">
            <div className="text-xs sm:text-sm text-gray-500">Commandes personnalisées</div>
            <div className="mt-1.5 sm:mt-2 text-xl sm:text-2xl font-semibold text-gray-900">
              {loading ? (
                <span className="inline-flex items-center gap-2 text-sm sm:text-base text-gray-500">
                  <span className="h-5 w-5 shrink-0 animate-spin rounded-full border-2 border-gray-200 border-t-[#fd4d08] inline-block" aria-hidden /> Chargement...
                </span>
              ) : (
                `${packOrderCount} commande${packOrderCount !== 1 ? 's' : ''}`
              )}
            </div>
            <div className="mt-3 sm:mt-4 flex flex-wrap gap-2">
              <Link
                to="/admin/pack-orders"
                className="inline-flex items-center rounded-lg bg-[#fd4d08] text-white px-3 py-2 text-xs sm:text-sm font-medium hover:bg-[#e04300]"
              >
                Voir les commandes personnalisées
              </Link>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-5 shadow-sm">
            <div className="text-xs sm:text-sm text-gray-500">Utilisateurs</div>
            <div className="mt-1.5 sm:mt-2 text-xl sm:text-2xl font-semibold text-gray-900">
              {loading ? (
                <span className="inline-flex items-center gap-2 text-sm sm:text-base text-gray-500">
                  <span className="h-5 w-5 shrink-0 animate-spin rounded-full border-2 border-gray-200 border-t-[#fd4d08] inline-block" aria-hidden /> Chargement...
                </span>
              ) : (
                `${userCount} utilisateurs`
              )}
            </div>
            <div className="mt-3 sm:mt-4 flex flex-wrap gap-2">
              <Link
                to="/admin/users"
                className="inline-flex items-center rounded-lg bg-[#fd4d08] text-white px-3 py-2 text-xs sm:text-sm font-medium hover:bg-[#fda708]"
              >
                Voir les utilisateurs
              </Link>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-5 shadow-sm">
            <div className="text-xs sm:text-sm text-gray-500">Téléchargements</div>
            <div className="mt-1.5 sm:mt-2 text-xl sm:text-2xl font-semibold text-gray-900">
              {loading ? (
                <span className="inline-flex items-center gap-2 text-sm sm:text-base text-gray-500">
                  <span className="h-5 w-5 shrink-0 animate-spin rounded-full border-2 border-gray-200 border-t-[#fd4d08] inline-block" aria-hidden /> Chargement...
                </span>
              ) : (
                `${downloadCount} téléchargements`
              )}
            </div>
            <div className="mt-3 sm:mt-4 flex flex-wrap gap-2">
              <Link
                to="/admin/downloads"
                className="inline-flex items-center rounded-lg bg-[#fd4d08] text-white px-3 py-2 text-xs sm:text-sm font-medium hover:bg-[#fda708]"
              >
                Voir l'historique
              </Link>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-5 shadow-sm">
            <div className="text-xs sm:text-sm text-gray-500">Navigation</div>
            <div className="mt-1.5 sm:mt-2 text-xl sm:text-2xl font-semibold text-gray-900">
              Retour site public
            </div>
            <div className="mt-3 sm:mt-4 flex flex-wrap gap-2">
              <Link
                to="/"
                className="inline-flex items-center rounded-lg border border-gray-200 px-3 py-2 text-xs sm:text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Accueil
              </Link>
              <button
                type="button"
                onClick={loadStats}
                className="inline-flex items-center rounded-lg border border-gray-200 px-3 py-2 text-xs sm:text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Rafraîchir
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default AdminDashboard;
