import { ethers } from "ethers";
import dotenv from "dotenv";

dotenv.config();

async function main() {
    const bloctimeSeconds = 86400 * 2;
    const provider = new ethers.JsonRpcProvider(process.env.AGARO_RPC_URL);
    await provider.send("anvil_setBlockTimestampInterval", [bloctimeSeconds]);
    console.log(`Block time set to ${bloctimeSeconds} seconds`);

    await provider.send("evm_mine", []);
    console.log("Mined one block manually");
}

main().catch(console.error);
