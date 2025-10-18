import { ethers } from "ethers";
import dotenv from "dotenv";

dotenv.config();

async function main() {
    const secondsToAdd = 86400 * 10;
    const provider = new ethers.JsonRpcProvider(process.env.AGARO_RPC_URL);
    const currentBlock = await provider.getBlock("latest");

    console.log(`Current block timestamp: ${currentBlock!.timestamp} (${new Date(currentBlock!.timestamp * 1000).toISOString()})`);
    await provider.send("evm_increaseTime", [secondsToAdd]);

    console.log(`Increased time by ${secondsToAdd} seconds (${secondsToAdd / 3600 / 24} days)`);
    await provider.send("evm_mine", []);

    const newBlock = await provider.getBlock("latest");
    console.log(`New block timestamp: ${newBlock!.timestamp} (${new Date(newBlock!.timestamp * 1000).toISOString()})`);
}

main().catch(console.error);
