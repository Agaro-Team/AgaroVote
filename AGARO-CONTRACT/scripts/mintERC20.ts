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
  await agaro.mint("0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266", amount);
  await agaro.mint("0x70997970C51812dc3A010C7d01b50e0d17dc79C8", amount);
  await agaro.mint("0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC", amount);
  await agaro.mint("0x90F79bf6EB2c4f870365E785982E1f101E93b906", amount);
  await agaro.mint("0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65", amount);
  await agaro.mint("0x9965507D1a55bcC2695C58ba16FB37d819B0A4dc", amount);
  await agaro.mint("0x976EA74026E726554dB657fA54763abd0C3a0aa9", amount);
  await agaro.mint("0x14dC79964da2C08b23698B3D3cc7Ca32193d9955", amount);
  await agaro.mint("0x23618e81E3f5cdF7f54C3d65f7FBc0aBf5B21E8f", amount);
  await agaro.mint("0xa0Ee7A142d267C1f36714E4a8F75612F20a79720", amount);

  const receipt = await tx.wait();

  console.log(`Minted ${ethers.formatEther(amount)} AGR to ${process.env.AGARO_PUBLIC_KEY!}`);
  console.log(`Tx hash: ${receipt.hash}`);
}

main().catch((error) => {
  console.error("❌ Error:", error.message);
  process.exitCode = 1;
});
