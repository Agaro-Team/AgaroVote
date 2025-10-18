import { ethers } from "ethers";
import entryPointABI from "../artifacts/contracts/core/VotingPoll/EntryPoint.sol/EntryPoint.json"

async function main() {
  const provider = new ethers.JsonRpcProvider(process.env.AGARO_RPC_URL);
  const signer = await provider.getSigner(0);

  const entryPointAddress = process.env.ENTRY_POINT_ADDRESS!;
  const entryPoint = new ethers.Contract(entryPointAddress, entryPointABI.abi, signer);

  const pollHash =
    process.env.POOL_HASH ||
    "0x8f837b9d2450716f4489df2f88e1fa738a66683e61985c8eba8f331186715588";

  const candidateSelected = 0;
  const proofs: string[] = [];

  const voteData = {
    pollHash: pollHash,
    candidateSelected: candidateSelected,
    proofs: proofs,
    commitToken: 0
  };


  console.log("\nSending transaction...");
  try {
    const tx = await entryPoint.vote(voteData);
    const receipt = await tx.wait();
    console.log("Transaction confirmed!");
    console.log("Tx hash:", receipt.hash);

    const voteEvent = receipt.logs
      .map((log: any) => {
        try {
          return entryPoint.interface.parseLog(log);
        } catch {
          return null;
        }
      })
      .find((event: any) => event?.name === "VoteSucceeded");

    if (voteEvent) {
      console.log("\nVote Succeeded!");
    }
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
