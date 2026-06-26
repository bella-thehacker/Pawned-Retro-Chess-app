import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

interface RetroModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

export default function RetroModal({ isOpen, onClose, title, children, footer }: RetroModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center">
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="absolute inset-0 bg-[rgba(42,27,21,0.6)] backdrop-blur-sm"
          />
          
          {/* Modal */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className={cn(
              'relative z-[10000] w-[90vw] max-w-[480px]',
              'bg-[#E7DFC9] border-2 border-[#8B6B4A] rounded-[20px]',
              'shadow-lg p-8'
            )}
          >
            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-[#6B5B4A] hover:text-[#8C3A3A] transition-colors"
              aria-label="Close modal"
            >
              <X size={24} />
            </button>
            
            {/* Header */}
            <div className="border-b border-[#8B6B4A] pb-4 mb-6">
              <h2 className="font-display text-[22px] font-bold text-[#2A1B15]">
                {title}
              </h2>
            </div>
            
            {/* Body */}
            <div className="font-mono text-sm text-[#6B5B4A] leading-relaxed">
              {children}
            </div>
            
            {/* Footer */}
            {footer && (
              <div className="mt-6 flex justify-end gap-2">
                {footer}
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
