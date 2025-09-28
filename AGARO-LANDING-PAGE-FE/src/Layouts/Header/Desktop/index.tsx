import clsx from 'clsx';
import type { HeaderProps } from '../../Type';
import { useNavigate } from 'react-router-dom';
import { useScrollTo } from '../../Hooks';

const DesktopHeader = ({ isScrolled, NavMenu }: HeaderProps) => {
  const scrollTo = useScrollTo();
  const navigate = useNavigate();

  return (
    <div
      className={clsx(
        'fixed top-0 inset-x-0 z-50 h-24 flex items-center px-24 transition-all duration-300 border-b',
        isScrolled
          ? 'backdrop-blur-md bg-white/45 border-gray-200'
          : 'bg-transparent border-transparent'
      )}>
      <div className="w-full flex gap-x-5 items-center justify-between">
        <nav className="flex items-center gap-x-5">
          <h1 className="font-bold text-xl">DesktopHeader</h1>
          <nav className="flex gap-6">
            {NavMenu.map((menu) =>
              menu.route ? (
                <button
                  className="cursor-pointer"
                  key={menu.id}
                  onClick={() => navigate(menu.route!)}>
                  {menu.label}
                </button>
              ) : (
                <button
                  className="cursor-pointer"
                  key={menu.id}
                  onClick={() => menu.to && scrollTo(menu.to)}>
                  {menu.label}
                </button>
              )
            )}
          </nav>
        </nav>
        <button className="border px-3 py-1 rounded-xl">Button</button>
      </div>
    </div>
  );
};

export default DesktopHeader;
