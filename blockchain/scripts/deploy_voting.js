// scripts/deploy_voting.js
// Robust deploy script for Voting contract that:
//  - ensures compilation
//  - deploys the contract
//  - writes ABI + deployed_voting.json to frontend and backend service folders
//  - has clearer logging and better error handling for beginners

const fs = require("fs");
const path = require("path");

async function writeJsonSafe(destPath, obj) {
  try {
    fs.mkdirSync(path.dirname(destPath), { recursive: true });
    fs.writeFileSync(destPath, JSON.stringify(obj, null, 2), "utf8");
    console.log("Wrote:", destPath);
  } catch (err) {
    console.error("Failed to write", destPath, err.message || err);
  }
}

async function main() {
  // lazy-load hardhat at runtime so this file can be linted/previewed without hardhat present
  const hre = require("hardhat");

  console.log("Starting Voting deploy script... (network:", hre.network.name, ")");

  // 0) compile to ensure artifact exists
  try {
    console.log("Compiling contracts (if necessary)...");
    await hre.run("compile");
  } catch (err) {
    console.warn("Compile step failed or skipped:", err && err.message ? err.message : err);
    // continue - artifact read below will fail loudly if missing
  }

  // 1) read artifact (best-effort)
  let artifact;
  try {
    artifact = await hre.artifacts.readArtifact("Voting");
  } catch (err) {
    console.error("Failed to read Voting artifact. Make sure contract name is Voting and you ran npx hardhat compile.");
    throw err;
  }

  // 2) get factory and deploy
  const VotingFactory = await hre.ethers.getContractFactory("Voting");
  console.log("Deploying Voting contract...");
  const voting = await VotingFactory.deploy();
  await voting.deployed();

  const deployedAddress = voting.address;
  console.log("Voting deployed at:", deployedAddress);
  console.log("Deployment tx hash:", voting.deployTransaction && voting.deployTransaction.hash ? voting.deployTransaction.hash : "(no txhash)");

  // 3) determine deployer/owner address
  let owner = null;
  try {
    const signers = await hre.ethers.getSigners();
    if (signers && signers.length) {
      if (typeof signers[0].getAddress === 'function') owner = await signers[0].getAddress();
      else owner = signers[0].address || null;
    }
  } catch (e) {
    console.warn("Could not determine deployer address via getSigners():", e && e.message ? e.message : e);
  }

  // 4) prepare outputs
  const abi = artifact.abi || [];
  const deployedInfo = {
    address: deployedAddress,
    owner: owner || null,
    txHash: voting.deployTransaction && voting.deployTransaction.hash ? voting.deployTransaction.hash : null,
    network: hre.network && hre.network.name ? hre.network.name : null,
  };

  // 5) output paths - adjust if your repo layout differs
  const root = path.resolve(__dirname, "..");
  const outputs = [
    {
      dir: path.resolve(root, "frontend", "web3"),
      abiPath: path.resolve(root, "frontend", "web3", "votingAbi.json"),
      deployedPath: path.resolve(root, "frontend", "web3", "deployed_voting.json"),
    },
    {
      dir: path.resolve(root, "blockvote-backend", "services", "web3"),
      abiPath: path.resolve(root, "blockvote-backend", "services", "web3", "votingAbi.json"),
      deployedPath: path.resolve(root, "blockvote-backend", "services", "web3", "deployed_voting.json"),
    }
  ];

  // 6) write files
  for (const o of outputs) {
    try {
      console.log("Writing ABI to:", o.abiPath);
      writeJsonSafe(o.abiPath, abi);
      console.log("Writing deployed info to:", o.deployedPath);
      writeJsonSafe(o.deployedPath, deployedInfo);
    } catch (err) {
      console.warn("Skipping write for", o.dir, err && (err.message || err));
    }
  }

  console.log("All done. ABI + deployed JSON written (where possible).");
  console.log("Contract:", deployedAddress);
  if (owner) console.log("Owner:", owner);
  console.log("Network:", hre.network && hre.network.name ? hre.network.name : "unknown");
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("Deployment script failed:", err && (err.stack || err.message || err));
    process.exit(1);
  });