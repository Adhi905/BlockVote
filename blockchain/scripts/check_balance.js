// scripts/check_balance.js
const hre = require("hardhat");
require("dotenv").config();
const { ethers } = hre;

async function main() {
  const provider = new ethers.providers.JsonRpcProvider(process.env.ALCHEMY_SEPOLIA_URL || "https://eth-sepolia.g.alchemy.com/v2/");
  // get wallet from PRIVATE_KEY
  const pk = process.env.PRIVATE_KEY;
  if (!pk) {
    console.error("PRIVATE_KEY not set in .env");
    process.exit(1);
  }
  const wallet = new ethers.Wallet(pk, provider);
  const addr = await wallet.getAddress();
  const balance = await provider.getBalance(addr);
  console.log("Address:", addr);
  console.log("Balance (wei):", balance.toString());
  console.log("Balance (ETH):", ethers.utils.formatEther(balance));
}

main().catch((err) => { console.error(err); process.exit(1); });