import { ethers } from "ethers";

async function main() {
  const provider = new ethers.JsonRpcProvider(process.env.AGARO_RPC_URL);
  const signer = await provider.getSigner(0);

  const tokenAddress = process.env.TOKEN_ADDRESS!;
  const recipient = process.env.AGARO_PUBLIC_KEY!;

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

  const agaro = new ethers.Contract(tokenAddress, agaroABI, signer);
  const tx = await agaro.mint(recipient, amount);
  await tx.wait();

  console.log(`Minted ${ethers.formatEther(amount)} AGR to ${recipient}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
