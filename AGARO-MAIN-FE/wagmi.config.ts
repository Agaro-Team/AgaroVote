import type { Address } from 'viem';

import { type Plugin, defineConfig, loadEnv } from '@wagmi/cli';
import { hardhat, react } from '@wagmi/cli/plugins';

export default defineConfig(async () => {
  const env = loadEnv({
    mode: process.env.NODE_ENV,
    envDir: process.cwd(),
  });

  const plugins: Plugin[] = [react()];

  if (process.env.NODE_ENV === 'dev') {
    plugins.push(
      hardhat({
        project: '../AGARO-CONTRACT',
        deployments: {
          Counter: {
            '31337': env.AGARO_VOTE_CONTRACT_ADDRESS_HARDHAT as Address,
          },
        },
      })
    );
  }

  return {
    out: 'app/lib/web3/contracts/generated.ts',
    plugins,
  };
});
