import { CounterUI } from '~/components/counter-ui';
import { walletAuthMiddleware } from '~/lib/middleware';

import type { Route } from './+types/counter';

export function meta({}: Route.MetaArgs) {
  return [
    { title: 'Counter Contract - AgaroVote' },
    { name: 'description', content: 'Interact with the Counter smart contract' },
  ];
}

/**
 * Middleware
 *
 * Protects this route with wallet authentication.
 * Users must have a connected wallet to access this page.
 */
export const middleware = [walletAuthMiddleware];

export default function CounterPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold tracking-tight">Counter Contract</h1>
        <p className="text-xl text-muted-foreground mt-4">
          A simple smart contract demonstration with real-time blockchain interaction
        </p>
      </div>

      <CounterUI />
    </div>
  );
}
