import { type RouteConfig, index, layout, prefix, route } from '@react-router/dev/routes';

const votingPollsRoutes = prefix('voting-polls', [
  layout('routes/dashboard/voting-polls/layout.tsx', [
    index('routes/dashboard/voting-polls/page.tsx'),
    route('create', 'routes/dashboard/voting-polls/create/page.tsx'),
    route(':id', 'routes/dashboard/voting-polls/$id/page.tsx'),
  ]),
]);

const rewardsRoutes = prefix('rewards', [
  layout('routes/dashboard/rewards/layout.tsx', [
    index('routes/dashboard/rewards/index.tsx'),
    route('claimable', 'routes/dashboard/rewards/claimable/page.tsx'),
    route('pending', 'routes/dashboard/rewards/pending/page.tsx'),
    route('history', 'routes/dashboard/rewards/history/page.tsx'),
  ]),
]);

const dashboardRoutes = prefix('dashboard', [
  layout('routes/dashboard/layout.tsx', [
    index('routes/dashboard/page.tsx'),
    ...votingPollsRoutes,
    ...rewardsRoutes,
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
