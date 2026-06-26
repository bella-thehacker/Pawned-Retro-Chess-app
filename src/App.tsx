import { Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { useSettingsStore } from '@/stores/settingsStore';
import OpeningAnimation from '@/components/OpeningAnimation';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import CRTEffect from '@/components/CRTEffect';
import FilmGrain from '@/components/FilmGrain';
import Home from './pages/Home';
import Robot from './pages/Robot';
import Friend from './pages/Friend';
import Settings from './pages/Settings';
import HowToPlay from './pages/HowToPlay';
import ChessGame from './pages/ChessGame';

function PageWrapper({ children }: { children: React.ReactNode }) {
  const getAnimationDuration = useSettingsStore((s) => s.getAnimationDuration);
  const reduceMotion = useSettingsStore((s) => s.reduceMotion);

  if (reduceMotion) {
    return <>{children}</>;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{
        duration: getAnimationDuration(0.3),
        ease: 'easeOut',
      }}
    >
      {children}
    </motion.div>
  );
}

export default function App() {
  const location = useLocation();

  return (
    <>
      {/* Global Visual Effects */}
      <OpeningAnimation />
      <CRTEffect />
      <FilmGrain />

      {/* Navigation */}
      <Navigation />

      {/* Page Content with Transitions */}
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route
            path="/"
            element={
              <PageWrapper>
                <Home />
              </PageWrapper>
            }
          />
          <Route
            path="/robot"
            element={
              <PageWrapper>
                <Robot />
              </PageWrapper>
            }
          />
          <Route
            path="/friend"
            element={
              <PageWrapper>
                <Friend />
              </PageWrapper>
            }
          />
          <Route
            path="/game"
            element={<ChessGame />}
          />
          <Route
            path="/settings"
            element={
              <PageWrapper>
                <Settings />
              </PageWrapper>
            }
          />
          <Route
            path="/how-to-play"
            element={
              <PageWrapper>
                <HowToPlay />
              </PageWrapper>
            }
          />
        </Routes>
      </AnimatePresence>

      {/* Footer */}
      <Footer />
    </>
  );
}
