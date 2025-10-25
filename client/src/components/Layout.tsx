import { PropsWithChildren } from 'react';
import Navbar from './navigation/Navbar';
import Footer from './navigation/Footer';

export default function Layout({ children }: PropsWithChildren) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-paper text-ink">
      <div className="absolute inset-0 pointer-events-none bg-repeat opacity-[0.12]" style={{ backgroundImage: "url('data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%228%22 height=%228%22 viewBox=%220 0 8 8%22 fill=%22none%22><path d=%22M0 8 8 0M-2 2l2-2m8 8 2-2%22 stroke=%22rgba(0,0,0,0.12)%22 stroke-width=%220.5%22/></svg>')" }} />
      <div className="relative z-10 flex min-h-screen flex-col">
        <Navbar />
        <main className="flex-1 pt-24 lg:pt-28">{children}</main>
        <Footer />
      </div>
    </div>
  );
}
