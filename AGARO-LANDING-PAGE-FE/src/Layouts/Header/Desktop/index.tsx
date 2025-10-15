import clsx from 'clsx';
import type { HeaderProps } from '../../Type';
import { useNavigate } from 'react-router-dom';
import { useScrollTo } from '../../Hooks';
import { CustomButton } from '../../../Components/Button';
import { useTheme } from '../../../lib/theme-provider';
import { Sun, Moon } from 'lucide-react';

const DesktopHeader = ({ isScrolled, NavMenu }: HeaderProps) => {
  const scrollTo = useScrollTo();
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();

  return (
    <div
      className={clsx(
        'fixed top-0 inset-x-0 z-50 h-24 flex items-center px-24 transition-all duration-300  ',
        isScrolled
          ? 'bg-[var(--background-blur-nav)] border-b border-[var(--border)] backdrop-blur-xl'
          : 'bg-transparent border-transparent'
      )}>
      <div className="w-full flex gap-x-5 items-center justify-between ">
        <div>
          <img
            src="/Logo.png"
            alt="AgaroVote Logo"
            className="h-40 w-full object-cover object-center"
          />
        </div>
        {/* <h1 className="font-bold text-xl ">AgaroVote</h1> */}
        <nav className="flex gap-x-14 text-[16px] font-semibold">
          <>
            {NavMenu.map((menu) =>
              menu.route ? (
                <button
                  key={menu.id}
                  onClick={() => navigate(menu.route!)}
                  className="nav-link">
                  {menu.label}
                </button>
              ) : (
                <button
                  key={menu.id}
                  onClick={() => menu.to && scrollTo(menu.to)}
                  className="nav-link">
                  {menu.label}
                </button>
              )
            )}
          </>
        </nav>

        <div className="flex gap-x-4 items-center">
          <CustomButton label="Get Started" />
          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="p-2 rounded-full border border-gray-300 dark:border-gray-700 
             bg-white dark:bg-gray-900 
             hover:bg-gray-200 dark:hover:bg-gray-800 
             transition-all duration-200 shadow-sm hover:shadow-md cursor-pointer ">
            {theme === 'dark' ? (
              <Sun className="h-5 w-5 text-yellow-400 hover:text-yellow-300 transition-colors" />
            ) : (
              <Moon className="h-5 w-5 text-white transition-colors" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DesktopHeader;
