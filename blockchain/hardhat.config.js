require("dotenv").config();
require("@nomicfoundation/hardhat-toolbox");

const ALCHEMY_SEPOLIA = process.env.SEPOLIA_RPC_URL || process.env.ALCHEMY_SEPOLIA_URL || "";
const PRIVATE_KEY = process.env.DEPLOYER_PRIVATE_KEY || process.env.PRIVATE_KEY || "";

// Validate private key format (should be 64 hex characters, optionally prefixed with 0x)
function isValidPrivateKey(key) {
  if (!key || key.length === 0) return false;
  // Remove 0x prefix if present
  const cleanKey = key.startsWith("0x") ? key.slice(2) : key;
  // Private key should be 64 hex characters (32 bytes)
  return /^[0-9a-fA-F]{64}$/.test(cleanKey);
}

// Only include accounts if we have a valid private key
const sepoliaAccounts = isValidPrivateKey(PRIVATE_KEY) ? [PRIVATE_KEY] : [];

module.exports = {
  solidity: "0.8.19",
  defaultNetwork: "hardhat",
  networks: {
    hardhat: {
      chainId: 1337,
    },
    localhost: {
      url: "http://127.0.0.1:8545",
      chainId: 31337,
    },
    sepolia: {
      url: ALCHEMY_SEPOLIA,
      accounts: sepoliaAccounts,
      chainId: 11155111,
    },
  },
};