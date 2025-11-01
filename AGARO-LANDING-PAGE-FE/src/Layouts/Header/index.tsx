import { useEffect, useState } from "react";

import DesktopHeader from "./Desktop";
import MobileHeader from "./Mobile";
import { useTheme } from "../../lib/theme-provider";

function Index() {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1005);
  const [isScrolled, setIsScrolled] = useState(window.scrollY > 10);
  const [mounted, setMounted] = useState(false);

  const { setTheme, resolvedTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    // handler resize component header
    const handleResize = () => setIsMobile(window.innerWidth < 1005);
    window.addEventListener("resize", handleResize);

    // handler scroll header
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const handleToggleTheme = () => {
    const newTheme = resolvedTheme === "dark" ? "light" : "dark";
    setTheme(newTheme);
  };

  const NavMenu = [
    { id: 1, label: "Overview", to: "overview" },
    { id: 2, label: "How it works", to: "how-it-work" },
    { id: 3, label: "Features", to: "features" },
    { id: 4, label: "Road Map", to: "time-line" },
    { id: 5, label: "FAQ", to: "FAQ" },
    // { id: 6, label: 'About', route: '/about' },
  ];

  if (!mounted) return null;

  const commonProps = {
    isScrolled,
    NavMenu,
    onToggleTheme: handleToggleTheme,
    resolvedTheme, // biar anak bisa tahu apakah dark atau light
  };

  return isMobile ? (
    <MobileHeader {...commonProps} />
  ) : (
    <DesktopHeader {...commonProps} />
  );
}

export default Index;
