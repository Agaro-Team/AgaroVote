import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

export default buildModule("SyntheticRewardModule", (m) => {
    const syntheticReward = m.contract("SyntheticReward");

    return { syntheticReward };
});
