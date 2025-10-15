import { ethers } from "ethers";

async function main() {
  const provider = new ethers.JsonRpcProvider("http://127.0.0.1:8545");
  const signer = await provider.getSigner(0);

  const entryPointAddress = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";
  const abi = [
    {
      inputs: [
        {
          internalType: "address",
          name: "_merkleAllowListImplementation",
          type: "address",
        },
      ],
      stateMutability: "nonpayable",
      type: "constructor",
    },
    {
      inputs: [
        {
          components: [
            { internalType: "uint256", name: "versioning", type: "uint256" },
            { internalType: "string", name: "title", type: "string" },
            { internalType: "string", name: "description", type: "string" },
            {
              internalType: "bytes32",
              name: "merkleRootHash",
              type: "bytes32",
            },
            { internalType: "bool", name: "isPrivate", type: "bool" },
            { internalType: "string[]", name: "candidates", type: "string[]" },
            { internalType: "uint8", name: "candidatesTotal", type: "uint8" },
            {
              components: [
                { internalType: "uint256", name: "startDate", type: "uint256" },
                { internalType: "uint256", name: "endDate", type: "uint256" },
              ],
              internalType: "struct VotingPoolExpiry",
              name: "expiry",
              type: "tuple",
            },
          ],
          internalType: "struct VotingPoolDataArgument",
          name: "_poolData",
          type: "tuple",
        },
      ],
      name: "newVotingPool",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      inputs: [
        {
          components: [
            { internalType: "bytes32", name: "poolHash", type: "bytes32" },
            { internalType: "uint8", name: "candidateSelected", type: "uint8" },
            { internalType: "bytes32[]", name: "proofs", type: "bytes32[]" },
          ],
          internalType: "struct VoteArgument",
          name: "_voteData",
          type: "tuple",
        },
      ],
      name: "vote",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      inputs: [],
      name: "version",
      outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [],
      name: "merkleAllowListImplementation",
      outputs: [{ internalType: "address", name: "", type: "address" }],
      stateMutability: "view",
      type: "function",
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: false,
          internalType: "uint256",
          name: "version",
          type: "uint256",
        },
        {
          indexed: false,
          internalType: "bytes32",
          name: "poolHash",
          type: "bytes32",
        },
      ],
      name: "VotingPoolCreated",
      type: "event",
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: false,
          internalType: "bytes32",
          name: "poolHash",
          type: "bytes32",
        },
        {
          indexed: false,
          internalType: "address",
          name: "voter",
          type: "address",
        },
        {
          indexed: false,
          internalType: "uint8",
          name: "selected",
          type: "uint8",
        },
        {
          indexed: false,
          internalType: "bytes32",
          name: "newHash",
          type: "bytes32",
        },
      ],
      name: "VoteSucceeded",
      type: "event",
    },
  ];

  const entryPoint = new ethers.Contract(entryPointAddress, abi, signer);

  const poolHash =
    process.env.POOL_HASH ||
    "0x0000000000000000000000000000000000000000000000000000000000000000";

  const candidateSelected = 0;

  const proofs: string[] = [];

  const voteData = {
    poolHash: poolHash,
    candidateSelected: candidateSelected,
    proofs: proofs,
  };

  console.log("Voting with data:");
  console.log("- Pool Hash:", voteData.poolHash);
  console.log("- Candidate Selected:", voteData.candidateSelected);
  console.log(
    "- Proofs:",
    voteData.proofs.length > 0 ? voteData.proofs : "None (public pool)"
  );
  console.log("\nSending transaction...");

  try {
    const tx = await entryPoint.vote(voteData);
    console.log("Transaction sent:", tx.hash);

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
      console.log("\n✅ Vote Succeeded!");
      console.log("- Pool Hash:", voteEvent.args.poolHash);
      console.log("- Voter:", voteEvent.args.voter);
      console.log("- Selected Candidate:", voteEvent.args.selected.toString());
      console.log("- New Pool Voter Hash:", voteEvent.args.newPoolVoterHash);
    }
  } catch (error: any) {
    console.error("\n❌ Vote failed:");
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
