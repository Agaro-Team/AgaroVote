import type { Address } from 'viem';

import { defineConfig, loadEnv } from '@wagmi/cli';
import { hardhat, react } from '@wagmi/cli/plugins';

export default defineConfig(async () => {
  const env = loadEnv({
    mode: process.env.NODE_ENV,
    envDir: process.cwd(),
  });

  return {
    out: 'app/lib/web3/contracts/generated.ts',
    plugins: [
      react(),
      hardhat({
        project: '../AGARO-CONTRACT',
        deployments: {
          AgaroVote: {
            1: env.VITE_AGARO_VOTE_CONTRACT_ADDRESS_MAINNET as Address,
            11155111: env.VITE_AGARO_VOTE_CONTRACT_ADDRESS_SEPOLIA as Address,
            31337: env.VITE_AGARO_VOTE_CONTRACT_ADDRESS_HARDHAT as Address,
          },
        },
      }),
    ],
  };
});
