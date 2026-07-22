import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { CyberBackground } from '../canvas/CyberBackground';
import { Sidebar } from './Sidebar';
import { Header } from './Header';

export const AppShell = () => {
  const location = useLocation();

  return (
    <div className="flex h-screen w-full font-sans antialiased selection:bg-siem-cyan/30 text-siem-text overflow-hidden">
      <CyberBackground />
      <Sidebar />
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative z-10">
        <Header />
        <div className="flex-1 overflow-y-auto overflow-x-hidden p-6 md:p-8 custom-scrollbar">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 12, filter: 'blur(8px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              exit={{ opacity: 0, y: -12, filter: 'blur(8px)' }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              className="h-full"
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
};
