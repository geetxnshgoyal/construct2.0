import { PropsWithChildren } from 'react';
import Navbar from './navigation/Navbar';
import Footer from './navigation/Footer';

export default function Layout({ children }: PropsWithChildren) {
  return (
    <div className="sky-page flex min-h-screen flex-col bg-paper text-ink">
      <Navbar />
      <main className="flex-1 pt-16">{children}</main>
      <Footer />
    </div>
  );
}
