import { ethers } from "ethers";

const contractAddress =
  import.meta.env.VITE_CONTRACT_ADDRESS ||
  "0xC41A5DF9AB948686e29730664D3Bdc068a4AcA0a";

const abi = [
  {
    "inputs": [],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "internalType": "uint256", "name": "orderIndex", "type": "uint256" },
      { "indexed": true, "internalType": "address", "name": "buyer", "type": "address" },
      { "indexed": false, "internalType": "uint256", "name": "cakeId", "type": "uint256" },
      { "indexed": false, "internalType": "uint256", "name": "quantity", "type": "uint256" },
      { "indexed": false, "internalType": "uint256", "name": "totalPrice", "type": "uint256" }
    ],
    "name": "CakeOrdered",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": false, "internalType": "uint256", "name": "cakeId", "type": "uint256" },
      { "indexed": false, "internalType": "string", "name": "name", "type": "string" },
      { "indexed": false, "internalType": "uint256", "name": "price", "type": "uint256" },
      { "indexed": false, "internalType": "bool", "name": "isAvailable", "type": "bool" }
    ],
    "name": "CakeUpserted",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "internalType": "uint256", "name": "orderIndex", "type": "uint256" }
    ],
    "name": "Delivered",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "internalType": "uint256", "name": "orderIndex", "type": "uint256" },
      { "indexed": true, "internalType": "address", "name": "buyer", "type": "address" },
      { "indexed": false, "internalType": "uint256", "name": "amount", "type": "uint256" }
    ],
    "name": "ReceivedConfirmed",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "internalType": "address", "name": "owner", "type": "address" },
      { "indexed": false, "internalType": "uint256", "name": "amount", "type": "uint256" }
    ],
    "name": "Withdraw",
    "type": "event"
  },
  {
    "inputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "name": "cakes",
    "outputs": [
      { "internalType": "uint256", "name": "id", "type": "uint256" },
      { "internalType": "string", "name": "name", "type": "string" },
      { "internalType": "uint256", "name": "price", "type": "uint256" },
      { "internalType": "bool", "name": "isAvailable", "type": "bool" }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "uint256", "name": "_orderIndex", "type": "uint256" }],
    "name": "confirmReceived",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getAllOrders",
    "outputs": [
      {
        "components": [
          { "internalType": "address", "name": "buyer", "type": "address" },
          { "internalType": "uint256", "name": "cakeId", "type": "uint256" },
          { "internalType": "uint256", "name": "quantity", "type": "uint256" },
          { "internalType": "uint256", "name": "totalPrice", "type": "uint256" },
          { "internalType": "uint256", "name": "timestamp", "type": "uint256" },
          { "internalType": "bool", "name": "deliveredByAdmin", "type": "bool" },
          { "internalType": "bool", "name": "receivedByCustomer", "type": "bool" },
          { "internalType": "bool", "name": "releasedToOwner", "type": "bool" }
        ],
        "internalType": "struct BirthdayCakeShopSapphire.Order[]",
        "name": "",
        "type": "tuple[]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "uint256", "name": "_id", "type": "uint256" }],
    "name": "getCake",
    "outputs": [
      {
        "components": [
          { "internalType": "uint256", "name": "id", "type": "uint256" },
          { "internalType": "string", "name": "name", "type": "string" },
          { "internalType": "uint256", "name": "price", "type": "uint256" },
          { "internalType": "bool", "name": "isAvailable", "type": "bool" }
        ],
        "internalType": "struct BirthdayCakeShopSapphire.Cake",
        "name": "",
        "type": "tuple"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getContractBalances",
    "outputs": [
      { "internalType": "uint256", "name": "locked", "type": "uint256" },
      { "internalType": "uint256", "name": "withdrawable", "type": "uint256" },
      { "internalType": "uint256", "name": "total", "type": "uint256" }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getMyOrders",
    "outputs": [
      {
        "components": [
          { "internalType": "address", "name": "buyer", "type": "address" },
          { "internalType": "uint256", "name": "cakeId", "type": "uint256" },
          { "internalType": "uint256", "name": "quantity", "type": "uint256" },
          { "internalType": "uint256", "name": "totalPrice", "type": "uint256" },
          { "internalType": "uint256", "name": "timestamp", "type": "uint256" },
          { "internalType": "bool", "name": "deliveredByAdmin", "type": "bool" },
          { "internalType": "bool", "name": "receivedByCustomer", "type": "bool" },
          { "internalType": "bool", "name": "releasedToOwner", "type": "bool" }
        ],
        "internalType": "struct BirthdayCakeShopSapphire.Order[]",
        "name": "",
        "type": "tuple[]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getMyOrderIndexes",
    "outputs": [
      {
        "internalType": "uint256[]",
        "name": "",
        "type": "uint256[]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "lockedBalance",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "uint256", "name": "_orderIndex", "type": "uint256" }],
    "name": "markDelivered",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "uint256", "name": "_cakeId", "type": "uint256" },
      { "internalType": "uint256", "name": "_quantity", "type": "uint256" }
    ],
    "name": "orderCake",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "name": "orders",
    "outputs": [
      { "internalType": "address", "name": "buyer", "type": "address" },
      { "internalType": "uint256", "name": "cakeId", "type": "uint256" },
      { "internalType": "uint256", "name": "quantity", "type": "uint256" },
      { "internalType": "uint256", "name": "totalPrice", "type": "uint256" },
      { "internalType": "uint256", "name": "timestamp", "type": "uint256" },
      { "internalType": "bool", "name": "deliveredByAdmin", "type": "bool" },
      { "internalType": "bool", "name": "receivedByCustomer", "type": "bool" },
      { "internalType": "bool", "name": "releasedToOwner", "type": "bool" }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "owner",
    "outputs": [{ "internalType": "address", "name": "", "type": "address" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "uint256", "name": "_id", "type": "uint256" },
      { "internalType": "bool", "name": "_status", "type": "bool" }
    ],
    "name": "setAvailability",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "uint256", "name": "_id", "type": "uint256" },
      { "internalType": "uint256", "name": "_newPrice", "type": "uint256" }
    ],
    "name": "updateCakePrice",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "uint256", "name": "_id", "type": "uint256" },
      { "internalType": "string", "name": "_name", "type": "string" },
      { "internalType": "uint256", "name": "_price", "type": "uint256" },
      { "internalType": "bool", "name": "_isAvailable", "type": "bool" }
    ],
    "name": "upsertCake",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "withdraw",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "withdrawableBalance",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  }
];

export const getContractReadOnly = () => {
  const provider = new ethers.JsonRpcProvider("https://testnet.sapphire.oasis.dev");
  return new ethers.Contract(contractAddress, abi, provider);
};

export const getContractWithSigner = async () => {
  if (!window.ethereum) {
    throw new Error("Vui lòng cài MetaMask!");
  }

  const provider = new ethers.BrowserProvider(window.ethereum);
  await provider.send("eth_requestAccounts", []);
  const signer = await provider.getSigner();

  return new ethers.Contract(contractAddress, abi, signer);
};

export const getContract = getContractWithSigner;
