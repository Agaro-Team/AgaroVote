import { Outlet } from 'react-router-dom';
import Header from '../Layouts/Header';
import Footer from './Footer';
import { ThemeProvider } from '../lib/theme-provider';
import { domAnimation, LazyMotion } from 'motion/react';

const MainLayout = () => {
  return (
    <ThemeProvider>
      <div className="flex flex-col min-h-screen relative bg-[var(--background)] text-[var(--foreground)] transition-colors duration-300">
        <Header />
        <LazyMotion features={domAnimation}>
          <Outlet />
        </LazyMotion>
        <Footer />
      </div>
    </ThemeProvider>
  );
};

export default MainLayout;
