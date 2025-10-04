import { counterConfig } from '~/lib/web3/contracts/generated';

import { defineConfig } from '@wagmi/cli';
import { react } from '@wagmi/cli/plugins';

export default defineConfig({
  out: 'app/lib/web3/contracts/generated.ts',
  contracts: [
    {
      name: 'Counter',
      abi: counterConfig.abi,
      address: counterConfig.address,
    },
  ],

  plugins: [
    react(),
    // hardhat({
    //   project: '../AGARO-CONTRACT',
    // }),
  ],
});
