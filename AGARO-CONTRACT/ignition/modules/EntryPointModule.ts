import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";
import MerkleAllowListModule from "./MerkleTreeAllowListModule.js";

export default buildModule("EntryPointModule", (m) => {
  const { merkleAllowList } = m.useModule(MerkleAllowListModule);
  const entryPoint = m.contract("EntryPoint", [merkleAllowList]);


  return { entryPoint };
});