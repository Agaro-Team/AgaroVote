import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

export default buildModule("MerkleTreeAllowlistModule", (m) => {
    const merkleAllowList = m.contract("MerkleTreeAllowlist");

    return { merkleAllowList };
});
