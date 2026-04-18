const { ethers } = require("hardhat");

async function main() {
  const contractAddress = "0xC41A5DF9AB948686e29730664D3Bdc068a4AcA0a";

  const [signer] = await ethers.getSigners();

  console.log("Current signer:", signer.address);

  const contract = await ethers.getContractAt(
    "BirthdayCakeShopSapphire",
    contractAddress,
    signer
  );

  const owner = await contract.owner();
  console.log("Contract owner:", owner);

  const balance = await ethers.provider.getBalance(contractAddress);
  console.log("Contract balance:", ethers.formatEther(balance), "ROSE");

  if (signer.address.toLowerCase() !== owner.toLowerCase()) {
    throw new Error("Signer hiện tại không phải owner của contract");
  }

  if (balance === 0n) {
    throw new Error("Contract không có tiền để rút");
  }

  const tx = await contract.withdraw();
  console.log("Sending withdraw tx:", tx.hash);

  await tx.wait();
  console.log("Withdraw thành công");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});