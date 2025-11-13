import { PropsWithChildren } from 'react';
import Navbar from './navigation/Navbar';
import Footer from './navigation/Footer';
import { useTheme } from '../hooks/useTheme';
import MasterclassPopup from './MasterclassPopup';

export default function Layout({ children }: PropsWithChildren) {
  const theme = useTheme();
  const isDark = theme === 'dark';

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gradient-to-b from-midnight via-cosmos to-midnight text-white' : 'bg-paper text-ink'}`}>
      <div className={`fixed inset-0 pointer-events-none ${isDark ? 'bg-grid-dark' : 'bg-grid-light'} opacity-30`} />
      <div className="relative flex min-h-screen flex-col">
        <Navbar />
        <main className="flex-1 pt-16 sm:pt-20 lg:pt-24">
          {children}
        </main>
        <Footer />
      </div>
      <MasterclassPopup />
    </div>
  );
}
