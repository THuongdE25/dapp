require("dotenv").config();
const { ethers } = require("ethers");
const { getContractWithPrivateKey } = require("./utils/contract");

async function main() {
  const contract = getContractWithPrivateKey();

  const res = await fetch("http://localhost:3000/api/cakes");
  const cakes = await res.json();

  console.log("So cake lay duoc:", cakes.length);

  for (const cake of cakes) {
    try {
      const id = Number(cake.id);
      const name = cake.name;
      const price = String(cake.blockchain_price ?? cake.price);
      const isAvailable = true;

      console.log(`Dang sync cake ${id} - ${name} - ${price}`);

      const tx = await contract.upsertCake(
        id,
        name,
        ethers.parseEther(price),
        isAvailable
      );

      console.log("Tx hash:", tx.hash);
      await tx.wait();

      console.log(`✅ Sync xong cake ${id}`);
    } catch (err) {
      console.error(`❌ Loi cake ${cake.id}:`, err.message);
    }
  }

  console.log("=== SYNC XONG TOAN BO ===");
}

main().catch(console.error);