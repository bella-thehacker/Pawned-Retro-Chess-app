import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X } from 'lucide-react';

const navLinks = [
  { label: 'Home', path: '/' },
  { label: 'Robot', path: '/robot' },
  { label: 'Friend', path: '/friend' },
  { label: 'Settings', path: '/settings' },
];

export default function Navigation() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-[100] h-[60px] bg-walnut shadow-[0_2px_12px_rgba(42,27,21,0.3)] flex items-center justify-between px-6 md:px-10">
        {/* Logo */}
        <Link
          to="/"
          className="font-display text-[22px] font-bold text-[#E7DFC9] tracking-[0.12em] hover:text-[#C8A04A] transition-colors duration-200"
        >
          PAWNED
        </Link>

        {/* Desktop Nav Links */}
        <nav className="hidden md:flex items-center gap-10">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`font-mono text-[13px] uppercase tracking-[0.08em] transition-all duration-200 pb-0.5 border-b-2 ${
                isActive(link.path)
                  ? 'text-[#E7DFC9] opacity-100 border-[#C8A04A]'
                  : 'text-[#E7DFC9] opacity-70 border-transparent hover:opacity-100'
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setMobileMenuOpen(true)}
          className="md:hidden text-[#E7DFC9] hover:text-[#C8A04A] transition-colors"
          aria-label="Open menu"
        >
          <Menu size={24} />
        </button>
      </header>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="fixed inset-0 z-[99] bg-[rgba(42,27,21,0.95)] backdrop-blur-sm flex flex-col items-center justify-center"
          >
            {/* Close button */}
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="absolute top-4 right-6 text-[#E7DFC9] hover:text-[#C8A04A] transition-colors"
              aria-label="Close menu"
            >
              <X size={28} />
            </button>

            {/* Nav items */}
            <nav className="flex flex-col items-center gap-8">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`font-display text-[28px] transition-colors duration-200 ${
                    isActive(link.path) ? 'text-[#C8A04A]' : 'text-[#E7DFC9] hover:text-[#C8A04A]'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
