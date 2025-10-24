import { Link, Outlet, useLocation, useMatches } from 'react-router';
import { AlphaVersionAlert } from '~/components/alpha-version';
import { AppSidebar } from '~/components/app-sidebar';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '~/components/ui/breadcrumb';
import { SidebarInset, SidebarProvider, SidebarTrigger } from '~/components/ui/sidebar';
import { siweAuthMiddleware } from '~/lib/middleware/siwe-auth-middleware';

import { Fragment } from 'react';

import { Separator } from '@radix-ui/react-separator';

/**
 * Middleware
 *
 * Protects all dashboard routes with wallet authentication.
 * This middleware runs for all child routes under /dashboard.
 * Users must have a connected wallet to access any dashboard page.
 */
export const middleware = [siweAuthMiddleware];

export const handle = {
  breadcrumb: 'Dashboard',
};

export default function DashboardLayout() {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4 flex-1">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 data-[orientation=vertical]:h-4" />
            <DashboardBreadcrumbs />
          </div>
        </header>

        {import.meta.env.VITE_ENABLED_ALPHA_NOTICE === 'true' && (
          <div className="pb-4 px-4">
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

const DashboardBreadcrumbs = () => {
  const matches = useMatches();
  const location = useLocation();

  // Build breadcrumbs from matched routes with handle.breadcrumb
  // We'll accumulate the path as we go through the hierarchy
  let currentPath = '';
  const breadcrumbs = matches
    .filter((match) => (match.handle as { breadcrumb?: string })?.breadcrumb)
    .map((match, index, arr) => {
      // Build path from the match id
      // match.id looks like: "routes/home" or "routes/dashboard/_layout" or "routes/dashboard/voting-polls/_layout"
      const routeSegment = match.id
        .replace(/^routes\//, '') // Remove 'routes/' prefix
        .replace(/\/layout$/, '') // Remove '/layout' suffix
        .replace(/\/page$/, ''); // Remove '/page' suffix if exists

      // Build cumulative path
      if (routeSegment === 'home') {
        currentPath = '/';
      } else if (routeSegment) {
        currentPath = '/' + routeSegment;
      }

      return {
        label: (match.handle as { breadcrumb?: string }).breadcrumb!,
        href: currentPath,
        isLast: index === arr.length - 1,
      };
    });

  return (
    <Breadcrumb>
      <BreadcrumbList>
        {breadcrumbs.map((crumb, index) => (
          <Fragment key={crumb.href}>
            <BreadcrumbItem className="hidden md:block">
              {crumb.isLast ? (
                <BreadcrumbPage>{crumb.label}</BreadcrumbPage>
              ) : (
                <BreadcrumbLink asChild>
                  <Link to={crumb.href}>{crumb.label}</Link>
                </BreadcrumbLink>
              )}
            </BreadcrumbItem>
            {index < breadcrumbs.length - 1 && <BreadcrumbSeparator className="hidden md:block" />}
          </Fragment>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  );
};
