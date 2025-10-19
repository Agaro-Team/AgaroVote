import clsx from 'clsx';
import { useState } from 'react';
import type { HeaderProps } from '../../Type';
import { useScrollTo } from '../../Hooks';
import { useNavigate } from 'react-router-dom';
import { Sun, Moon } from 'lucide-react';

const MobileHeader = ({
  isScrolled,
  NavMenu,
  onToggleTheme,
  resolvedTheme,
}: HeaderProps) => {
  const scrollTo = useScrollTo();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div
      className={clsx(
        'fixed top-0 inset-x-0 z-50 transition-all duration-300 border-b overflow-hidden px-5 py-6 0',
        isScrolled || isOpen
          ? 'bg-[var(--background-blur-nav)] border-b border-[var(--border)] backdrop-blur-xl'
          : 'border-transparent '
      )}>
      <div className="w-full flex justify-between items-center">
        <img
          src="/Logo.png"
          alt="AgaroVote Logo"
          className="h-10 md:h-16 w-32 object-cover object-center "
        />
        <div className="flex gap-x-4 items-center">
          {/* Hamburger Button */}
          <button
            onClick={() => setIsOpen((prev) => !prev)}
            className="relative w-8 h-8 flex flex-col justify-center items-center cursor-pointer">
            <span
              className={clsx(
                'absolute h-[3px] w-[28px]  bg-[var(--foreground)] rounded transition-all duration-300',
                isOpen ? 'rotate-45' : '-translate-y-2'
              )}
            />
            <span
              className={clsx(
                'absolute h-[3px] w-[28px]  bg-[var(--foreground)] rounded transition-all duration-300',
                isOpen ? 'opacity-0' : 'opacity-100'
              )}
            />
            <span
              className={clsx(
                'absolute h-[3px] w-[28px]  bg-[var(--foreground)] rounded transition-all duration-300',
                isOpen ? '-rotate-45' : 'translate-y-2'
              )}
            />
          </button>
        </div>
      </div>
      {/* Nav Menu */}
      <div
        className={clsx(
          'transition-all duration-500 ease-in-out',
          isOpen ? 'max-h-screen opacity-100 h-screen' : 'hidden'
        )}>
        <nav className="flex flex-col gap-4 items-center mt-6 text-[20px] font-semibold">
          {NavMenu.map((menu) =>
            menu.route ? (
              <button
                key={menu.id}
                onClick={() => {
                  navigate(menu.route!);
                  setIsOpen(false);
                }}
                className="nav-link">
                {menu.label}
              </button>
            ) : (
              <button
                key={menu.id}
                onClick={() => {
                  if (menu.to) {
                    scrollTo(menu.to);
                  }
                  setIsOpen(false);
                }}
                className="nav-link">
                {menu.label}
              </button>
            )
          )}
          <button
            onClick={onToggleTheme}
            className="p-2 rounded-full transition-all duration-200 cursor-pointer">
            {resolvedTheme === 'dark' ? (
              <Sun className="h-5 w-5 text-yellow-400 hover:text-yellow-300 transition-colors" />
            ) : (
              <Moon className="h-5 w-5 text-black transition-colors" />
            )}
          </button>
        </nav>
      </div>
    </div>
  );
};

export default MobileHeader;
