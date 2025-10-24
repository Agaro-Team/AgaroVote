import clsx from 'clsx';
import type { HeaderProps } from '../../Type';
import { useNavigate } from 'react-router-dom';
import { useScrollTo } from '../../Hooks';
import { Sun, Moon } from 'lucide-react';

const DesktopHeader = ({
  isScrolled,
  NavMenu,
  onToggleTheme,
  resolvedTheme,
}: HeaderProps) => {
  const scrollTo = useScrollTo();
  const navigate = useNavigate();

  return (
    <div
      className={clsx(
        'fixed top-0 inset-x-0 z-50 h-22 flex items-center px-24 transition-all duration-300',
        isScrolled
          ? 'bg-[var(--background-blur-nav)] border-b border-[var(--border)] backdrop-blur-xl'
          : 'bg-transparent border-transparent'
      )}>
      <div className="w-full flex gap-x-5 items-center justify-between">
        <div className="flex items-center gap-2 px-2 ">
          <img
            src="/Logo-small.png"
            alt="AgaroVote Logo"
            className="h-8 w-full object-contain"
          />

          <h1 className="text-2xl text-muted-foreground dark:text-foreground font-bold">
            Agaro<span className="text-primary ">Vote</span>
          </h1>
        </div>

        <nav className="flex gap-x-14 text-[16px] font-semibold mr-14 xl:mr-32">
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
        </nav>

        <button
          onClick={onToggleTheme}
          className="p-2 rounded-full transition-all duration-200 cursor-pointer">
          {resolvedTheme === 'dark' ? (
            <Sun className="h-5 w-5 text-yellow-400 hover:text-yellow-300 transition-colors" />
          ) : (
            <Moon className="h-5 w-5 text-black transition-colors" />
          )}
        </button>
      </div>
    </div>
  );
};

export default DesktopHeader;
