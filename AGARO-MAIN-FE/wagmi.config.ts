import { defineConfig } from '@wagmi/cli';
import { react } from '@wagmi/cli/plugins';

import { WAGMIGOTCHI_ABI } from './app/lib/contracts/wagmigotchi.abi';

export default defineConfig({
  out: 'app/lib/contracts/generated.ts',
  contracts: [
    {
      name: 'Wagmigotchi',
      address: '0xecb504d39723b0be0e3a9aa33d646642d1051ee1',
      abi: WAGMIGOTCHI_ABI,
    },
  ],
  plugins: [react()],
});
