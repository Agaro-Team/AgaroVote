import { useEffect, useState } from 'react';

import DesktopHeader from './Desktop';
import MobileHeader from './Mobile';

function Index() {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1005);
  const [isScrolled, setIsScrolled] = useState(window.scrollY > 10);

  useEffect(() => {
    // handler resize component header
    const handleResize = () => setIsMobile(window.innerWidth < 1005);
    window.addEventListener('resize', handleResize);

    // handler scroll header
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const NavMenu = [
    { id: 1, label: 'Main', to: 'main' },
    { id: 2, label: 'Second', to: 'second' },
    { id: 3, label: 'About', route: '/about' },
  ];

  return isMobile ? (
    <MobileHeader isScrolled={isScrolled} />
  ) : (
    <DesktopHeader isScrolled={isScrolled} NavMenu={NavMenu} />
  );
}

export default Index;
