// src/Layouts/MainLayout.tsx
import { Outlet } from 'react-router-dom';
import Header from '../Layouts/Header';

const MainLayout = () => {
  return (
    <div className="flex flex-col min-h-screen relative">
      <Header />
      <main>
        <Outlet />
      </main>
    </div>
  );
};

export default MainLayout;
