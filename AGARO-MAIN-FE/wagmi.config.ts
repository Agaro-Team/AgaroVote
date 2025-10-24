import { type Plugin, defineConfig } from '@wagmi/cli';
import { hardhat, react } from '@wagmi/cli/plugins';

// Using artifacts directly from AGARO-CONTRACT
// // Make sure to run `yarn --cwd ../AGARO-CONTRACT compile` before generating
// const createHardhatArtifactsPlugin = (): Plugin => ({
//   name: 'hardhat-artifacts',
//   async contracts() {
//     const fs = await import('fs');
//     const path = await import('path');

//     const artifactsPath = path.resolve(process.cwd(), '../AGARO-CONTRACT/artifacts/contracts');
//     const contracts: any[] = [];

//     // Helper function to recursively find all JSON artifacts
//     function findArtifacts(dir: string): void {
//       if (!fs.existsSync(dir)) return;

//       const files = fs.readdirSync(dir);

//       for (const file of files) {
//         const fullPath = path.join(dir, file);
//         const stat = fs.statSync(fullPath);

//         if (stat.isDirectory()) {
//           findArtifacts(fullPath);
//         } else if (file.endsWith('.json') && !file.includes('.dbg.')) {
//           try {
//             const content = JSON.parse(fs.readFileSync(fullPath, 'utf-8'));
//             if (content.abi && content.bytecode) {
//               contracts.push({
//                 name: file.replace('.json', ''),
//                 abi: content.abi,
//               });
//             }
//           } catch (error) {
//             // Skip invalid JSON files
//           }
//         }
//       }
//     }

//     findArtifacts(artifactsPath);
//     return contracts;
//   },
// });

export default defineConfig(async () => {
  return {
    out: 'app/lib/web3/contracts/generated.ts',
    plugins: [
      react(),
      hardhat({
        project: '../AGARO-CONTRACT',
      }),
    ],
  };
});
