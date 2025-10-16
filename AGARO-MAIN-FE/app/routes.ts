import { type RouteConfig, index, layout, prefix, route } from '@react-router/dev/routes';

const dashboardRoutes = prefix('dashboard', [
  layout('routes/dashboard/layout.tsx', [
    index('routes/dashboard/page.tsx'),
    route('voting-polls', 'routes/dashboard/voting-polls/page.tsx'),
    route('voting-polls/create', 'routes/dashboard/voting-polls/create/page.tsx'),
    route('voting-polls/:id', 'routes/dashboard/voting-polls/$id/page.tsx'),
  ]),
]);

const walletRoutes = prefix('wallet', [
  layout('routes/wallet/layout.tsx', [index('routes/wallet/page.tsx')]),
]);

const authRoutes = prefix('auth', [
  route('siwe', 'routes/auth.siwe.tsx'),
  route('signout', 'routes/auth.signout.tsx'),
]);

export default [
  index('routes/home.tsx'),
  ...authRoutes,
  ...dashboardRoutes,
  ...walletRoutes,
] satisfies RouteConfig;
