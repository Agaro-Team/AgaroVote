import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";
import MerkleAllowListModule from "./MerkleTreeAllowListModule.js";
import SyntheticRewardModule from "./SyntheticRewardModule.js";
import ERC20AGRModule from "./ERC20AGRModule.js";

export default buildModule("EntryPointModule", (m) => {
  const { merkleAllowList } = m.useModule(MerkleAllowListModule);
  const { syntheticReward } = m.useModule(SyntheticRewardModule);
  const { agaro } = m.useModule(ERC20AGRModule);
  const entryPoint = m.contract("EntryPoint", [merkleAllowList, syntheticReward, agaro]);


  return { entryPoint };
});