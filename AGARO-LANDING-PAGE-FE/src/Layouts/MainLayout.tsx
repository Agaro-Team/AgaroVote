import { Outlet } from 'react-router-dom';
import Header from '../Layouts/Header';
import Footer from './Footer';
import { ThemeProvider } from '../lib/theme-provider';

const MainLayout = () => {
  return (
    <ThemeProvider>
      <div className="flex flex-col min-h-screen relative bg-[var(--background)] text-[var(--foreground)] transition-colors duration-300">
        <Header />
        <Outlet />
        <Footer />
      </div>
    </ThemeProvider>
  );
};

export default MainLayout;
