import { defineConfig } from '@wagmi/cli';
import { hardhat, react } from '@wagmi/cli/plugins';

export default defineConfig({
  out: 'app/lib/web3/contracts/generated.ts',

  plugins: [
    react(),
    hardhat({
      project: '../AGARO-CONTRACT',
    }),
  ],
});
