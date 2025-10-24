import React from 'react';
import { useScrollTo } from './Hooks';

const Footer: React.FC = () => {
  const scrollTo = useScrollTo();
  const NavMenu = [
    { id: 1, label: 'Overview', to: 'overview' },
    { id: 2, label: 'Hot It Work', to: 'how-it-work' },
    { id: 3, label: 'Features', to: 'features' },
    { id: 4, label: 'Road Map', to: 'time-line' },
    { id: 5, label: 'FAQ', to: 'FAQ' },
    // { id: 6, label: 'About', route: '/about' },
  ];
  return (
    <footer className="mt-12 border-t border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-8">
          <div className="max-w-sm">
            <div className="flex flex-col items-start">
              {/* placeholder logo circle */}
              <div className="flex items-center gap-2 px-2 my-4">
                <img
                  src="/Logo-small.png"
                  alt="AgaroVote Logo"
                  className="h-8 w-full object-contain"
                />

                <h1 className="text-2xl text-muted-foreground dark:text-foreground font-bold">
                  Agaro<span className="text-primary ">Vote</span>
                </h1>
              </div>
              <p className=" text-sm opacity-90">
                Your Voice, Verified with
                <br />
                Web3 Transparency
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8 md:w-1/2">
            <div>
              <h4 className="text-sm font-semibold">Navigation</h4>
              {NavMenu.map((menu, key) => (
                <ul key={key} className="mt-4 space-y-3 text-sm opacity-90">
                  <li
                    key={menu.id}
                    className="hover:underline cursor-pointer"
                    onClick={() => {
                      if (menu.to) {
                        scrollTo(menu.to);
                      }
                    }}>
                    {menu.label}
                  </li>
                </ul>
              ))}
            </div>

            <div>
              <h4 className="text-sm font-semibold">Information</h4>
              <ul className="mt-4 space-y-3 text-sm opacity-90">
                <li
                  className="hover:underline cursor-pointer"
                  onClick={() =>
                    window.open('https://agaro-app.ardial.tech', '_blank')
                  }>
                  AgaroVote Dashboard
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
