import type { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "@oasisprotocol/sapphire-hardhat"

const PRIVATE_KEY = "8c170b7178540bd5a946f5219ac9435d7cc3d03a6229cf4492449b317d96e4ba";
const config: HardhatUserConfig = {
  solidity: "0.8.28",
  networks: {
    sapphire: {
      url: "https://testnet.sapphire.oasis.dev",
      accounts: [PRIVATE_KEY],
    },
  },
};

export default config;
