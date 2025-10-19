// Header

export interface NavItem {
  id: number;
  label: string;
  to?: string;
  route?: string;
}

export interface HeaderProps {
  isScrolled: boolean;
  NavMenu: NavItem[];
  onToggleTheme: () => void;
  resolvedTheme: 'light' | 'dark';
}
