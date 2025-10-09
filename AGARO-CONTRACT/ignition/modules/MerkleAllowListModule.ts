import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

export default buildModule("MerkleAllowlistModule", (m) => {
    const merkleAllowList = m.contract("MerkleAllowlist");

    return { merkleAllowList };
});
