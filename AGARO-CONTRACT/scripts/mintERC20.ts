import { ethers } from "ethers";

async function main() {
  const provider = new ethers.JsonRpcProvider("http://127.0.0.1:8545");
  const signer = await provider.getSigner(0);
  // Address of deployed AGARO contract
  const tokenAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";

  // Address to mint to
  const recipient = "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266";

  // Amount to mint (example: 1000 AGR tokens)
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

  // Call mint()
  const tx = await agaro.mint(recipient, amount);
  await tx.wait();

  console.log(`✅ Minted ${ethers.formatEther(amount)} AGR to ${recipient}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
