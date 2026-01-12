import { ethers } from "ethers";
import dotenv from "dotenv";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config();

async function main() {
  console.log("Deploying contracts to Mantle Sepolia...\n");

  // Create provider and wallet
  const provider = new ethers.JsonRpcProvider(process.env.MANTLE_SEPOLIA_RPC || "https://rpc.sepolia.mantle.xyz");
  const wallet = new ethers.Wallet(process.env.PRIVATE_KEY || "", provider);
  
  console.log("Deploying contracts with account:", wallet.address);
  
  const balance = await provider.getBalance(wallet.address);
  console.log("Account balance:", ethers.formatEther(balance), "MNT\n");

  // Deploy Web3WorkProfiles (Ipcm.sol)
  console.log("Deploying Web3WorkProfiles contract...");
  const profilesArtifact = JSON.parse(
    readFileSync(join(__dirname, "../artifacts/src/contracts/Ipcm.sol/Web3WorkProfiles.json"), "utf8")
  );
  const profilesFactory = new ethers.ContractFactory(profilesArtifact.abi, profilesArtifact.bytecode, wallet);
  const profilesContract = await profilesFactory.deploy();
  await profilesContract.waitForDeployment();
  const profilesAddress = await profilesContract.getAddress();
  console.log("Web3WorkProfiles deployed to:", profilesAddress);

  // Deploy Web3WorkJobs (Jobs.sol)
  console.log("\nDeploying Web3WorkJobs contract...");
  const jobsArtifact = JSON.parse(
    readFileSync(join(__dirname, "../artifacts/src/contracts/Jobs.sol/Web3WorkJobs.json"), "utf8")
  );
  const jobsFactory = new ethers.ContractFactory(jobsArtifact.abi, jobsArtifact.bytecode, wallet);
  const jobsContract = await jobsFactory.deploy();
  await jobsContract.waitForDeployment();
  const jobsAddress = await jobsContract.getAddress();
  console.log("Web3WorkJobs deployed to:", jobsAddress);

  console.log("\n=== Deployment Summary ===");
  console.log("Network: Mantle Sepolia");
  console.log("Deployer:", wallet.address);
  console.log("\nContract Addresses:");
  console.log("VITE_CONTRACT_ADDRESS=" + profilesAddress);
  console.log("VITE_JOBS_CONTRACT_ADDRESS=" + jobsAddress);
  console.log("\nPlease update your .env file with these addresses!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
