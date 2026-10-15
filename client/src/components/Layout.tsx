import { PropsWithChildren } from 'react';
import Navbar from './navigation/Navbar';
import Footer from './navigation/Footer';

export default function Layout({ children }: PropsWithChildren) {
  return (
    <div className="flex min-h-screen flex-col bg-paper text-navy">
      <Navbar />
      <main className="flex-1 pt-16">{children}</main>
      <Footer />
    </div>
  );
}
