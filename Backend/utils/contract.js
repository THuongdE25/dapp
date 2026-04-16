const { ethers } = require("ethers");

const RPC_URL = process.env.RPC_URL || "https://testnet.sapphire.oasis.dev";
const CONTRACT_ADDRESS =
  process.env.CONTRACT_ADDRESS || "0xDBb3bBE429De1fcF10A8f872D1135Ea6f3baA412";

const ABI = [
  "function owner() view returns (address)",
  "function upsertCake(uint256 _id, string _name, uint256 _price, bool _isAvailable)",
  "function getCake(uint256 _id) view returns (uint256 id, string name, uint256 price, bool isAvailable)",
];

function getProvider() {
  return new ethers.JsonRpcProvider(RPC_URL);
}

function getContractReadOnly() {
  return new ethers.Contract(CONTRACT_ADDRESS, ABI, getProvider());
}

function getContractWithPrivateKey() {
  const rawKey = process.env.OWNER_PRIVATE_KEY;
  const key = String(rawKey || "").trim();

  if (!key) {
    throw new Error("OWNER_PRIVATE_KEY is missing in environment");
  }

  const normalizedKey = key.startsWith("0x") ? key : `0x${key}`;
  const wallet = new ethers.Wallet(normalizedKey, getProvider());
  return new ethers.Contract(CONTRACT_ADDRESS, ABI, wallet);
}

module.exports = {
  CONTRACT_ADDRESS,
  getContractReadOnly,
  getContractWithPrivateKey,
};
