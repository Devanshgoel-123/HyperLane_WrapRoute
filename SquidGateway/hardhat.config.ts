import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "@nomicfoundation/hardhat-ignition";
import "./tasks/MainFile";

const config: HardhatUserConfig = {
  solidity: "0.8.27",
  
};

export default config;
