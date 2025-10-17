import "@nomicfoundation/hardhat-ethers";
import type { HardhatUserConfig } from "hardhat/config";
import hardhatToolboxMochaEthersPlugin from "@nomicfoundation/hardhat-toolbox-mocha-ethers";
import { configVariable } from "hardhat/config";

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
      url: "https://agaro-rpc.ardial.tech",
      chainId: 13377,
      accounts: ["0xdbda1821b80551c9d65939329250298aa3472ba22feea921c0cf5d620ea67b97"],
    },
  },
};

export default config;
