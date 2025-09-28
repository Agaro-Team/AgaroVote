import clsx from 'clsx';

const MobileHeader = ({ isScrolled }: { isScrolled: boolean }) => {
  return (
    <div
      className={clsx(
        'fixed top-0 inset-x-0 z-50 h-20 flex items-center px-5 transition-all duration-300 border-b',
        isScrolled
          ? 'backdrop-blur-md bg-white/45 border-gray-200'
          : 'bg-transparent border-transparent'
      )}>
      Mobile Header
    </div>
  );
};

export default MobileHeader;
