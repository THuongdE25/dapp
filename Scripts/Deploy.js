const hre = require("hardhat");

async function main() {
  const CakeShop = await hre.ethers.getContractFactory("BirthdayCakeShopSapphire");
  const cakeShop = await CakeShop.deploy();

  await cakeShop.waitForDeployment();

  const address = await cakeShop.getAddress();
  console.log("Contract deployed to:", address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});