
const hre = require("hardhat");

async function main() {
  const SendMessage = await hre.ethers.getContractFactory("SendMessage");
  const sendMessage = await SendMessage.deploy(
    "",
    ""
  );

  await sendMessage.deployed();

  console.log(`SendMessage contract deployed to ${sendMessage.address}`);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
