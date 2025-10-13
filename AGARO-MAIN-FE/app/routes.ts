import { type RouteConfig, index, layout, prefix, route } from '@react-router/dev/routes';

const dashboardRoutes = prefix('dashboard', [
  layout('routes/dashboard/layout.tsx', [
    index('routes/dashboard/page.tsx'),
    route('voting-pools', 'routes/dashboard/voting-pools/page.tsx'),
    route('voting-pools/create', 'routes/dashboard/voting-pools/create/page.tsx'),
    route('voting-pools/:id', 'routes/dashboard/voting-pools/$id/page.tsx'),
  ]),
]);

const walletRoutes = prefix('wallet', [
  layout('routes/wallet/layout.tsx', [index('routes/wallet/page.tsx')]),
]);

export default [
  index('routes/home.tsx'),
  ...dashboardRoutes,
  ...walletRoutes,
] satisfies RouteConfig;
