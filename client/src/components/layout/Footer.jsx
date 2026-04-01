// ============================================================
// src/components/layout/Footer.jsx
// ============================================================

import { HiBolt } from 'react-icons/hi2';

const Footer = () => {
  return (
    <footer className="border-t border-dark-800 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <HiBolt className="w-5 h-5 text-accent-500" />
            <span className="font-bold gradient-text">FlashMart</span>
          </div>
          <p className="text-dark-500 text-sm">
            &copy; {new Date().getFullYear()} FlashMart. Auto-Scaling Flash-Sale Platform.
          </p>
          <div className="flex gap-4 text-dark-500 text-sm">
            <span>Built with React + Node.js + AWS</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
