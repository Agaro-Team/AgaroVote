/**
 * Wallet Layout
 *
 * Layout wrapper for wallet-related pages
 */
import { Outlet } from 'react-router';

export default function WalletLayout() {
  return (
    <div className="min-h-screen bg-background">
      <Outlet />
    </div>
  );
}
