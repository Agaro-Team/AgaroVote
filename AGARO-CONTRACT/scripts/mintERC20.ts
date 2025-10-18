import { ethers } from "ethers";
import dotenv from "dotenv";

dotenv.config();

async function main() {
  const provider = new ethers.JsonRpcProvider(process.env.AGARO_RPC_URL);
  const signer = new ethers.Wallet(process.env.AGARO_PRIVATE_KEY!, provider);

  const amount = ethers.parseEther("1000");
  const agaroABI = [
    "function name() view returns (string)",
    "function symbol() view returns (string)",
    "function decimals() view returns (uint8)",
    "function totalSupply() view returns (uint256)",
    "function balanceOf(address) view returns (uint256)",
    "function transfer(address to, uint256 amount) returns (bool)",
    "function mint(address to, uint256 amount)",
    "event Transfer(address indexed from, address indexed to, uint256 value)",
  ];

  const agaro = new ethers.Contract(process.env.TOKEN_ADDRESS!, agaroABI, signer);

  console.log(`Minting ${ethers.formatEther(amount)} tokens to ${process.env.AGARO_PUBLIC_KEY!}...`);

  const tx = await agaro.mint(process.env.AGARO_PUBLIC_KEY!, amount);
  const receipt = await tx.wait();

  console.log(`Minted ${ethers.formatEther(amount)} AGR to ${process.env.AGARO_PUBLIC_KEY!}`);
  console.log(`Tx hash: ${receipt.hash}`);
}

main().catch((error) => {
  console.error("❌ Error:", error.message);
  process.exitCode = 1;
});
