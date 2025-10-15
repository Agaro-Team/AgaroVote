import { ethers } from "ethers";
import entryPointABI from "../artifacts/contracts/core/VotingPoll/EntryPoint.sol/EntryPoint.json"

async function main() {
    const provider = new ethers.JsonRpcProvider("http://127.0.0.1:8545");
    const signer = await provider.getSigner(0);

    const entryPointAddress = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";

    const entryPoint = new ethers.Contract(entryPointAddress, entryPointABI.abi, signer);
    const now = Math.floor(Date.now() / 1000);

    const poolData = {
        versioning: await entryPoint.version(),
        title: "Private Voting Pool",
        description: "Only whitelisted voters can participate",
        merkleRootHash: ethers.ZeroHash,
        isPrivate: false,
        candidates: ["Alice", "Bob"],
        candidatesTotal: 2,
        expiry: {
            startDate: now,
            endDate: now + 3600 * 24 * 2,
        },
    };

    console.log("Sending transaction...");
    const tx = await entryPoint.newVotingPool(poolData);
    const receipt = await tx.wait();
    console.log("Tx hash:", receipt.hash);
}

main().catch(console.error);
