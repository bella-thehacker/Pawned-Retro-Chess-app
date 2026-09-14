import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, X } from 'lucide-react';
import RetroButton from '../RetroButton';

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmModal({
  isOpen,
  title,
  message,
  confirmText = 'YES, RESIGN',
  cancelText = 'KEEP PLAYING',
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[11000] flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-[rgba(42,27,21,0.75)] backdrop-blur-sm"
            onClick={onCancel}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 10 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            className="relative z-[11001] w-full max-w-[380px] overflow-hidden rounded-[16px] border-2 border-[#8B6B4A] bg-[#E7DFC9] shadow-2xl"
          >
            {/* CRT scanlines */}
            <div
              className="pointer-events-none absolute inset-0 z-20 opacity-40"
              style={{
                background:
                  'repeating-linear-gradient(0deg, transparent 0px, transparent 3px, rgba(74,44,29,0.025) 3px, rgba(74,44,29,0.025) 4px)',
              }}
            />

            {/* Header */}
            <div className="relative border-b-2 border-[#8B6B4A] bg-[#2A1B15] px-5 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-[8px] border border-[#C66A35]/50 bg-[#C66A35]/10">
                    <AlertTriangle
                      size={18}
                      className="text-[#C66A35]"
                    />
                  </div>

                  <h2 className="font-arcade text-[12px] tracking-wider text-[#E7DFC9]">
                    {title}
                  </h2>
                </div>

                <button
                  type="button"
                  onClick={onCancel}
                  className="rounded p-1 text-[#E7DFC9]/60 transition-colors hover:bg-[#E7DFC9]/10 hover:text-[#E7DFC9]"
                  aria-label="Cancel"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="relative z-10 px-6 py-6">
              <p className="text-center font-mono text-[12px] leading-relaxed text-[#6B5B4A]">
                {message}
              </p>

              <div className="mt-6 flex flex-col gap-3">
                <RetroButton
                  variant="secondary"
                  onClick={onConfirm}
                  className="w-full border-[#8C3A3A] text-[#8C3A3A]"
                >
                  {confirmText}
                </RetroButton>

                <RetroButton
                  variant="secondary"
                  onClick={onCancel}
                  className="w-full"
                >
                  {cancelText}
                </RetroButton>
              </div>
            </div>

            {/* Bottom decorative line */}
            <div className="h-1 bg-[#8B6B4A]" />
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}