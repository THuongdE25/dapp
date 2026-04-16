const { ethers } = require("hardhat");

async function main() {
  const contractAddress = "0xDBb3bBE429De1fcF10A8f872D1135Ea6f3baA412";

  const contract = await ethers.getContractAt(
    "BirthdayCakeShopSapphire",
    contractAddress
  );

  const owner = await contract.owner();
  console.log("Contract owner:", owner);

  const tx = await contract.withdraw();
  console.log("Sending withdraw tx:", tx.hash);

  await tx.wait();
  console.log("Withdraw thành công");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});