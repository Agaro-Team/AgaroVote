import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

export default buildModule("ERC20AGRModule", (m) => {
    const agaro = m.contract("AGARO");

    return { agaro };
});
