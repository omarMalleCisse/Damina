import { braquette, braquette5, braquette_2, braquette_3, braquette_4, braquette_menche, braquette_poshe, feston, grand_bobou, grand_bobou3, grandBobou_marron, poshe, Poshe2 } from "../../public";

const filters = [
    { id: 'all', label: 'Tous' },
    { id: 'free', label: 'Gratuit' },
    { id: 'premium', label: 'Premium' },
    { id: 'popular', label: 'Les plus téléchargés' }

  ];

 const designs = [
  {
    id: 8,
    title: '4 braquette elegante',
    description: '18 designs contemporains pour projets modernes',
    price: 'Gratuit',
    isPremium: false,
    downloads: '1.8k',
    image: braquette5,
    downloadCount: 1838,
    isPopular: true,
    categories: ['femmes', 'braquette']
  },
  {
    id: 9,
    title: 'Grand Bobou',
    description: '30 Grand Bobou marron elegant',
    price: '9.99€',
    isPremium: false,
    downloads: '1.2k',
    image: grandBobou_marron,
    downloadCount: 1200,
    isPopular: true,
    categories: ['hommes', 'grand-bobou']
  },
  {
    id: 10,
    title: 'Pushe',
    description: 'des pushe elegante et jolie',
    price: 'Gratuit',
    isPremium: true,
    downloads: '2.4k',
    image: Poshe2,
    downloadCount: 2405,
    isPopular: false,
    categories: ['femmes', 'pushe']
  },
  {
    id: 11,
    title: 'Grand Bobou hommes',
    description: '12 grand bobou hommes',
    price: 'Gratuit',
    isPremium: true,
    downloads: '3.1k',
    image: grand_bobou3,
    downloadCount: 3192,
    isPopular: true,
    categories: ['hommes', 'grand-bobou']
  },
  {
    id: 12,
    title: 'Poshe',
    description: 'poshe bien garnie',
    price: '15.99€',
    isPremium: true,
    downloads: '645',
    image: poshe,
    downloadCount: 200,
    isPopular: false,
    categories: ['femmes', 'poshe']
  },
  {
    id: 13,
    title: 'Braquette noire Gold',
    description: '3 des braquette elegante et jolie',
    price: '12.99€',
    isPremium: true,
    downloads: '856',
    image: braquette_menche,
    downloadCount: 856,
    isPopular: true,
    categories: ['femmes', 'braquette']
  },
  {
    id: 14,
    title: 'braquettes Noire',
    description: 'Braquette tre elegant',
    price: '15.99€',
    isPremium: true,
    downloads: '645',
    image: braquette_poshe,
    downloadCount: 200,
    isPopular: false,
    categories: ['femmes', 'braquette']
  },
  {
    id: 3,
    title: '4 braquette elegante',
    description: '18 designs contemporains pour projets modernes',
    price: 'Gratuit',
    isPremium: false,
    downloads: '1.8k',
    image: braquette_3,
    downloadCount: 1838,
    isPopular: true,
    categories: ['hommes', 'braquette']
  },
  {
    id: 15,
    title: 'Feston',
    description: '30 feston pour femmes',
    price: '9.99€',
    isPremium: false,
    downloads: '1.2k',
    image: feston,
    downloadCount: 1200,
    isPopular: true,
    categories: ['femmes', 'feston']
  },
  {
    id: 4,
    title: 'Collection Florale',
    description: 'des braquette elegante et jolie',
    price: 'Gratuit',
    isPremium: true,
    downloads: '2.4k',
    image: braquette,
    downloadCount: 2405,
    isPopular: true,
    categories: ['femmes', 'collection-florale']
  },
  {
    id: 1,
    title: 'Grand Bobou hommes',
    description: '12 grand bobou hommes',
    price: 'Gratuit',
    isPremium: true,
    downloads: '3.1k',
    image: grand_bobou,
    downloadCount: 3192,
    isPopular: true,
    categories: ['hommes', 'grand-bobou']
  },
  {
    id: 6,
    title: 'Poshe',
    description: 'poshe bien garnie',
    price: '15.99€',
    isPremium: true,
    downloads: '645',
    image: poshe,
    downloadCount: 200,
    isPopular: false,
    categories: ['femmes', 'poshe']
  },
  {
    id: 2,
    title: 'Braquette noire Gold',
    description: '3 des braquette elegante et jolie',
    price: '12.99€',
    isPremium: true,
    downloads: '856',
    image: braquette_2,
    downloadCount: 856,
    isPopular: true,
    categories: ['femmes', 'braquette']
  },
  {
    id: 7,
    title: 'braquettes Noire',
    description: 'Braquette tre elegant',
    price: '15.99€',
    isPremium: true,
    downloads: '645',
    image: braquette_4,
    downloadCount: 200,
    isPopular: false,
    categories: ['femmes', 'braquette']
  }
];
const features = [
    {
      title: 'Multi-formats',
      description: 'Tous nos fichiers sont disponibles dans les formats les plus utilisés : DST, PES, JEF, XXX, VP3, et HUS.'
    },
    {
      title: 'Qualité professionnelle',
      description: 'Chaque design est testé et optimisé pour garantir un résultat parfait sur votre machine.'
    },
    {
      title: 'Téléchargement instantané',
      description: 'Accédez immédiatement à vos fichiers après achat. Pas d\'attente, brodez tout de suite.'
    }
  ];
  
    const categories = [
      { name: 'finition', icon: '🦁' },
      { name: 'Fleurs', icon: '🌸' },
      { name: 'Enfants', icon: '👶' },
      { name: 'hommes', icon: '🌿' },
      { name: 'femmes', icon: '🎉' },
      { name: 'grand-bobou', icon: '🎄' },
      { name: 'Braquette', icon: '✨' }
    ];
  export { filters, features };
    export { categories };
  export default designs;