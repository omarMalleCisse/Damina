import { useNavigate } from 'react-router-dom';

const Footer = () => {
  const navigate = useNavigate();
  const footerData = [
    {
      title: 'Produits',
      links: ['Designs gratuits', 'Designs premium', 'Collections']
    },
    {
      title: 'contactez-nous',
      links: ['cissemalle58@gmail.com', '+221773349652, bymalle@icloud.com']
    },
    {
      title: 'Société',
      links: [
        { label: 'À propos', to: null },
        { label: 'nos Contact', to: '/contact' },
        { label: 'Blog', to: null }
      ]
    },
    {
      title: 'Légal',
      links: ['Conditions', 'Confidentialité', 'Licences']
    },
    {
      title: 'Communauté',
      links: ['Instagram', 'Pinterest', 'Facebook']
    }
  ];

  return (
    <footer className="border-t border-gray-200">
      <div className="w-full mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl py-8 sm:py-10 lg:py-12">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6 sm:gap-8">
          {footerData.map((column, index) => (
            <FooterColumn key={index} title={column.title} links={column.links} onNavigate={navigate} />
          ))}
        </div>
        <div className="border-t border-gray-200 mt-8 sm:mt-10 lg:mt-12 pt-6 sm:pt-8">
          <p className="text-xs sm:text-sm text-gray-500 text-center sm:text-left">
            © 2025 BroderieDesign. Tous droits réservés.
          </p>
        </div>
      </div>
    </footer>
  );
};
const FooterColumn = ({ title, links, onNavigate }) => {
  return (
    <div>
      <h4 className="text-xs sm:text-sm font-semibold text-gray-900 mb-3 sm:mb-4">{title}</h4>
      <ul className="space-y-2 sm:space-y-3 text-xs sm:text-sm text-gray-600">
        {links.map((link, index) => {
          const linkLabel = typeof link === 'string' ? link : link.label;
          const linkTo = typeof link === 'object' ? link.to : null;

          return (
            <li key={index}>
              {linkTo ? (
                <button type="button" onClick={() => onNavigate(linkTo)} className="hover:text-gray-900 transition block text-left w-full bg-transparent border-0 p-0 cursor-pointer text-inherit">
                  {linkLabel}
                </button>
              ) : (
                <button type="button" className="hover:text-gray-900 transition block text-left w-full bg-transparent border-0 p-0 cursor-pointer text-inherit">
                  {linkLabel}
                </button>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
};
export default Footer;