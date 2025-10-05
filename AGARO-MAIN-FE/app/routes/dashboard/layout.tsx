import { Outlet } from 'react-router';
import { AppSidebar } from '~/components/app-sidebar';
import { SidebarInset, SidebarProvider } from '~/components/ui/sidebar';
import { walletAuthMiddleware } from '~/lib/middleware';

import type { Route } from './+types/layout';

/**
 * Middleware
 *
 * Protects all dashboard routes with wallet authentication.
 * This middleware runs for all child routes under /dashboard.
 * Users must have a connected wallet to access any dashboard page.
 */
export const middleware: Route.MiddlewareFunction[] = [walletAuthMiddleware];

export default function DashboardLayout() {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <Outlet />
      </SidebarInset>
    </SidebarProvider>
  );
}
