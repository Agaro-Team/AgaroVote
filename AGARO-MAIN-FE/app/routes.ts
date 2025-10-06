import { type RouteConfig, index, layout, prefix, route } from '@react-router/dev/routes';

const dashboardRoutes = prefix('dashboard', [
  layout('routes/dashboard/layout.tsx', [
    index('routes/dashboard/index.tsx'),
    route('voting-pools/create', 'routes/dashboard/voting-pools/create.tsx'),
  ]),
]);

const walletRoutes = prefix('wallet', [
  layout('routes/wallet/layout.tsx', [index('routes/wallet/index.tsx')]),
]);

export default [
  index('routes/home.tsx'),
  route('counter', 'routes/counter.tsx'),
  ...dashboardRoutes,
  ...walletRoutes,
] satisfies RouteConfig;
