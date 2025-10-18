import "@nomicfoundation/hardhat-ethers";
import type { HardhatUserConfig } from "hardhat/config";
import hardhatToolboxMochaEthersPlugin from "@nomicfoundation/hardhat-toolbox-mocha-ethers";
import { configVariable } from "hardhat/config";
import dotenv from "dotenv";
dotenv.config();

const { RPC_URL, PRIVATE_KEY } = process.env;
const config: HardhatUserConfig = {
  plugins: [hardhatToolboxMochaEthersPlugin],

  solidity: {
    settings: {
      version: "0.8.28",
      settings: {
        viaIR: true,
        optimizer: {
          enabled: true,
          runs: 200,
        },
      },
    },
    profiles: {
      default: {
        version: "0.8.28",
        settings: {
          viaIR: true,
          optimizer: {
            enabled: true,
            runs: 200,
          },
        },
      },
      production: {
        version: "0.8.28",
        settings: {
          viaIR: true,
          optimizer: {
            enabled: true,
            runs: 200,
          },
        },
      },
    },
  },

  networks: {
    hardhatMainnet: {
      type: "edr-simulated",
      chainType: "l1",
    },
    hardhatOp: {
      type: "edr-simulated",
      chainType: "op",
    },
    sepolia: {
      type: "http",
      chainType: "l1",
      url: configVariable("SEPOLIA_RPC_URL"),
      accounts: [configVariable("SEPOLIA_PRIVATE_KEY")],
    },
    agaro: {
      type: "http",
      chainType: "l1",
      url: configVariable("AGARO_RPC_URL"),
      chainId: 13377,
      accounts: [configVariable("AGARO_PRIVATE_KEY")],
    },
  },
};

export default config;
