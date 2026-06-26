import { useLocation } from 'react-router-dom';
import { ExternalLink } from 'lucide-react';

export default function Footer() {
  const location = useLocation();
  
  // Don't show footer on home page (home has its own)
  if (location.pathname === '/') return null;

  return (
    <footer className="bg-walnut py-4 px-6 md:px-10 text-center mt-auto">
      <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4">
        <p className="font-mono text-[11px] text-[#E7DFC9]/50 tracking-[0.15em]">
          PAWNED &mdash; A Ctrl Code Solutions&trade; Production
        </p>
        <a
          href="https://ctrlcodesolutions.com"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded border border-[#E7DFC9]/20 hover:border-[#C8A04A]/40 hover:bg-[rgba(200,160,74,0.1)] transition-all duration-200 group"
        >
          <span className="font-mono text-[9px] text-[#E7DFC9]/60 group-hover:text-[#C8A04A] tracking-wider uppercase transition-colors">
            Visit CTRL CODE SOLUTIONS
          </span>
          <ExternalLink size={9} className="text-[#E7DFC9]/40 group-hover:text-[#C8A04A] transition-colors" />
        </a>
      </div>
    </footer>
  );
}
