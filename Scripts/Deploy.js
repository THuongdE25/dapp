const hre = require("hardhat");

async function main() {
    const CakeShop = await hre.ethers.getContractFactory("BirthdayCakeShopSapphire");

    const contract = await CakeShop.deploy();

    await contract.waitForDeployment();

    console.log("Contract deployed to:", await contract.getAddress());
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});