import hre from "hardhat";

async function main(){
    const SingleSwap=await hre.ethers.getContractFactory("SingleSwap");
    const singleSwap=SingleSwap.deploy();

    await singleSwap.deployed();
    console.log("Single Swap contract deployed:",singleSwapAddress);
}

main().catch((err)=>{
    console.log(err);
    process.exitCode=1;
})