"use strict";

import dotenv from "dotenv";
Object.defineProperty(exports, "__esModule", { value: true });
require("@nomicfoundation/hardhat-toolbox");
require("./tasks/MainFile");
dotenv.config();
const config = {
    solidity: "0.8.27",
    networks: {
        hardhat: {
          forking: {
            url: "https://rpc.blast.io",
          },
        },
        blast_mainnet: {
          //@ts-ignore
          accounts: [process.env.PRIVATE_KEY],
          url: "https://rpc.blast.io",
        },
        zeta_mainnet: {
          //@ts-ignore
          accounts: [process.env.PRIVATE_KEY],
          url: process.env.ZETA_RPC_URL,
        },
        bsc_mainnet: {
          //@ts-ignore
          accounts: [process.env.PRIVATE_KEY],
          url: "https://rpc.ankr.com/bsc",
        },
        eth_mainnet: {
          //@ts-ignore
          accounts: [process.env.PRIVATE_KEY],
          url: "https://ethereum-rpc.publicnode.com",
        },
        polygon_mainnet: {
          //@ts-ignore
          accounts: [process.env.PRIVATE_KEY],
          url: "https://polygon-rpc.com/",
        },
        base_mainnet: {
          //@ts-ignore
          accounts: [process.env.PRIVATE_KEY],
          url: "https://base-rpc.publicnode.com",
        }
      },
};
exports.default = config;
