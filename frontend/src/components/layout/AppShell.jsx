import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Sidebar } from './Sidebar';
import { Header } from './Header';

export const AppShell = () => {
  const location = useLocation();

  return (
    <div className="flex h-screen w-full font-sans antialiased cyber-grid-bg text-siem-text overflow-hidden relative">
      {/* Moving Cyber Laser Scan Beam */}
      <div className="cyber-scan-beam" />

      <Sidebar />
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative z-10">
        <Header />
        <div className="flex-1 overflow-y-auto overflow-x-hidden p-6 md:p-8 custom-scrollbar">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
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
