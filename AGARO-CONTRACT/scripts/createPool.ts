import { ethers } from "ethers";
import entryPointABI from "../artifacts/contracts/core/VotingPoll/EntryPoint.sol/EntryPoint.json";
import dotenv from "dotenv";

dotenv.config();

async function main() {
    const provider = new ethers.JsonRpcProvider(process.env.AGARO_RPC_URL);
    const signer = new ethers.Wallet(process.env.AGARO_PRIVATE_KEY!, provider);

    console.log("Signer address:", await signer.getAddress());

    const entryPointAddress = process.env.ENTRY_POINT_ADDRESS!;
    const entryPoint = new ethers.Contract(entryPointAddress, entryPointABI.abi, signer);

    const now = Math.floor(Date.now() / 1000);
    const pollData = {
        versioning: await entryPoint.version(),
        title: "Zero Init Poll",
        description: "Check candidate structs are initialized properly",
        merkleRootHash: ethers.ZeroHash,
        isPrivate: false,
        candidates: ["A", "B", "C"],
        candidatesTotal: 3,
        expiry: {
            startDate: now,
            endDate: now + 86400,
        },
        rewardShare: ethers.parseEther("500"),
        isTokenRequired: true,
    };

    try {
        console.log("Sending transaction...");
        const tx = await entryPoint.newVotingPoll(pollData);
        const receipt = await tx.wait();
        console.log("Tx hash:", receipt.hash);
    } catch (error: any) {
        console.error("Error:", error.message);
    }
}

main().catch(console.error);
