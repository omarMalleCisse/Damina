import { Link } from 'react-router-dom';
import {
  Truck,
  Headphones,
  Award,
  Shield,
  Zap,
  CheckCircle2,
  Package,
  Clock,
  Star,
  Sparkles,
  Download,
  FileEdit,
  Palette,
  CreditCard,
  MessageCircle,
  Scissors,
  ThumbsUp,
  Gift,
  ArrowRight,
} from 'lucide-react';

const DEFAULT_ICON = CheckCircle2;

/** Un seul lien par carte, choisi selon le titre/description de la feature */
const CARD_LINKS = [
  { to: '/designs', label: 'Télécharger des designs', icon: Download },
  { to: '/orders', label: 'Commande personnalisée', icon: FileEdit },
  { to: '/pack-order', label: 'Commande pack', icon: Package },
];

/** Choisit le lien le plus pertinent pour cette carte (un seul bouton) */
function getCardLinkForFeature(title = '', description = '') {
  const text = `${title} ${description}`.toLowerCase();
  if (/\bpack|colis|package\b/.test(text)) return CARD_LINKS[2]; // Commande pack
  if (/\bcommande personnalisée|sur mesure|custom|personnalis\b/.test(text)) return CARD_LINKS[1]; // Orders
  if (/\bdesign|télécharger|download|fichier|broderie\b/.test(text)) return CARD_LINKS[0]; // Designs
  return CARD_LINKS[0]; // défaut: Télécharger
}

/** Icône adéquate selon le thème de la feature (ordre = priorité) */
export const getFeatureIcon = (title = '', description = '') => {
  const text = `${title} ${description}`.toLowerCase();
  // Livraison / expédition
  if (/\blivraison|delivery|shipping|expédition|envoi|colis\b/.test(text)) return Truck;
  // Support / contact / aide
  if (/\bsupport|aide|contact|assistance|service client|réponse|question\b/.test(text)) return Headphones;
  if (/\bcontact|message|écrire|nous contacter\b/.test(text)) return MessageCircle;
  // Qualité / premium / expert
  if (/\bqualité|quality|premium|expert|professionnel\b/.test(text)) return Award;
  if (/\bmeilleur|top|recommandé|satisfait|garantie\b/.test(text)) return ThumbsUp;
  // Sécurité / confiance / paiement
  if (/\bsécurit|security|confiance|trust|sécurisé\b/.test(text)) return Shield;
  if (/\bpaiement|payment|payant|cb|cartes\b/.test(text)) return CreditCard;
  // Rapidité / express
  if (/\brapide|fast|express|instant|sous 24|24h|48h\b/.test(text)) return Zap;
  // Délai / délais
  if (/\bdélai|delay|heure|délais|temps\b/.test(text)) return Clock;
  // Pack / offre / bundle
  if (/\bpack|package|offre|bundle|lot\b/.test(text)) return Package;
  if (/\bcadeau|gift|offert\b/.test(text)) return Gift;
  // Design / créatif / broderie / mode
  if (/\bdesign|designs|créatif|création\b/.test(text)) return Sparkles;
  if (/\bbroderie|couture|mode|tissu|vêtement\b/.test(text)) return Scissors;
  if (/\bpalette|style|tendance|mode\b/.test(text)) return Palette;
  if (/\btélécharger|download|fichier|fichiers\b/.test(text)) return Download;
  // Commande personnalisée / sur mesure
  if (/\bpersonnalis|sur mesure|custom|commande\b/.test(text)) return FileEdit;
  // Étoile / favori
  if (/\bstar|favori|recommandé\b/.test(text)) return Star;
  return DEFAULT_ICON;
};

const cardClassName = 'group relative bg-white rounded-2xl border border-gray-200/80 p-6 sm:p-8 shadow-sm hover:shadow-md hover:border-[#fd4d08]/20 transition-all duration-300 text-center sm:text-left';
const iconClassName = 'inline-flex w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-[#fd4d08]/15 to-[#fd4d08]/5 items-center justify-center mb-4 sm:mb-5 text-[#fd4d08] group-hover:from-[#fd4d08]/25 group-hover:to-[#fd4d08]/10 transition-colors';
const iconSize = 'w-8 h-8 sm:w-10 sm:h-10';

const FeatureCard = ({ title, description, icon: Icon, to }) => {
  const cardLink = !to ? getCardLinkForFeature(title, description) : null;
  const ResolvedIcon = Icon || (cardLink?.icon) || DEFAULT_ICON;
  const LinkIcon = cardLink?.icon;
  const content = (
    <>
      <div className={`${iconClassName} flex`}>
        <ResolvedIcon className={iconSize} strokeWidth={1.8} />
      </div>
      <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2 group-hover:text-[#fd4d08] transition-colors">
        {title}
      </h3>
      <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
        {description}
      </p>
      {cardLink && (
          <div className="mt-5 pt-4 border-t border-gray-100">
            <Link
              to={cardLink.to}
              className="flex items-center justify-center gap-2 w-full rounded-xl bg-[#fd4d08] px-4 py-3 text-sm font-semibold text-white shadow-sm hover:bg-[#e04300] hover:shadow-md active:scale-[0.98] transition-all duration-200"
            >
              <LinkIcon className="w-4 h-4 shrink-0" strokeWidth={2.5} />
              {cardLink.label}
              <ArrowRight className="w-4 h-4 shrink-0" strokeWidth={2.5} />
            </Link>
          </div>
      )}
    </>
  );

  if (to) {
    return (
      <Link to={to} className={`${cardClassName} block`}>
        {content}
      </Link>
    );
  }

  return (
    <div className={cardClassName}>
      {content}
    </div>
  );
};

export default FeatureCard;