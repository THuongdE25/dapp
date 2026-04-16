require("dotenv").config();

console.log("Testing sync function directly...");
console.log("OWNER_PRIVATE_KEY:", process.env.OWNER_PRIVATE_KEY ? "YES" : "NO");

const { getContractWithPrivateKey } = require("./utils/contract");

(async () => {
  try {
    const contract = getContractWithPrivateKey();
    console.log("✅ Contract loaded successfully!");
    console.log("Contract target:", contract.target);
    console.log("Contract address:", await contract.getAddress());
  } catch (err) {
    console.error("❌ Error:", err.message);
  }
})();