import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

export default buildModule("AgaroVoteModule", (m) => {
  const entryPoint = m.contract("EntryPoint");

  return { entryPoint };
});