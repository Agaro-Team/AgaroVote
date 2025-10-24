import { Outlet } from 'react-router';
import { AlphaVersionAlert } from '~/components/alpha-version';
import { AppSidebar } from '~/components/app-sidebar';
import { SidebarInset, SidebarProvider } from '~/components/ui/sidebar';
import { siweAuthMiddleware } from '~/lib/middleware/siwe-auth-middleware';

/**
 * Middleware
 *
 * Protects all dashboard routes with wallet authentication.
 * This middleware runs for all child routes under /dashboard.
 * Users must have a connected wallet to access any dashboard page.
 */
export const middleware = [siweAuthMiddleware];

export default function DashboardLayout() {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        {import.meta.env.VITE_ENABLED_ALPHA_NOTICE === 'true' && (
          <div className="py-4 px-4">
            <div className="flex justify-end">
              <AlphaVersionAlert />
            </div>
          </div>
        )}
        <Outlet />
      </SidebarInset>
    </SidebarProvider>
  );
}
