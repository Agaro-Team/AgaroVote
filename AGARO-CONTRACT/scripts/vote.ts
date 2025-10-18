import { ethers } from "ethers";
import entryPointABI from "../artifacts/contracts/core/VotingPoll/EntryPoint.sol/EntryPoint.json";
import dotenv from "dotenv";

dotenv.config();

async function main() {
  const provider = new ethers.JsonRpcProvider(process.env.AGARO_RPC_URL);
  const signer = new ethers.Wallet(process.env.AGARO_PRIVATE_KEY!, provider);

  console.log("Using signer:", await signer.getAddress());

  const entryPointAddress = process.env.ENTRY_POINT_ADDRESS!;
  const entryPoint = new ethers.Contract(entryPointAddress, entryPointABI.abi, signer);

  const pollHash =
    process.env.POOL_HASH ||
    "0x130c2494249baa1043729cbad6b12425207e3db96249ffc0144aba6b3c06ca02";

  const candidateSelected = 0;
  const proofs: string[] = [];

  const voteData = {
    pollHash: pollHash,
    candidateSelected: candidateSelected,
    proofs: proofs,
    commitToken: 100,
  };

  console.log("\nSending vote transaction...");
  try {
    const tx = await entryPoint.vote(voteData);
    const receipt = await tx.wait();
    console.log("Transaction confirmed!");
    console.log("Tx hash:", receipt.hash);

  } catch (error: any) {
    console.error("\nVote failed:");
    if (error.reason) {
      console.error("Reason:", error.reason);
    } else if (error.message) {
      console.error("Message:", error.message);
    } else {
      console.error(error);
    }
  }
}

main().catch(console.error);
