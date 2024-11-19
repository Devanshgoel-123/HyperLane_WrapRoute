"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ethers_1 = require("ethers");
const Swap_1 = require("./hooks/Swap");
const Wrap_1 = require("./hooks/Wrap");
const SquidApi_1 = require("./hooks/SquidApi");
const dotenv_1 = __importDefault(require("dotenv"));
const utils_1 = require("ethers/lib/utils");
dotenv_1.default.config();
const getRoute = async () => {
    let destinationChainTokenAddress = "";
    let destinationChainSymbol = "";
    let sourceChainTokenSymbol = "";
    let sourceChainTokenaddress = "";
    let amount = "";
    try {
        const res = await (0, SquidApi_1.getDataFromSquidApi)();
        const routeData = res.data.route;
        const fromToken = routeData.params.fromToken;
        const value = routeData.params.fromAmount;
        sourceChainTokenSymbol = routeData.estimate.fromToken.symbol;
        sourceChainTokenaddress = routeData.estimate.fromToken.address;
        amount = routeData.estimate.fromAmount;
        destinationChainTokenAddress = "0xce16F69375520ab01377ce7B88f5BA8C48F8D666"; //squid router address
        destinationChainSymbol = routeData.estimate.toToken.symbol;
        const squidrouterAddress = routeData.estimate.gasCosts[0].token.chain.squidContracts.squidRouter;
        const squidMulticallAddress = routeData.estimate.gasCosts[0].token.chain.squidContracts.squidMulticall;
        const callArray = routeData.estimate.actions;
        const filteredCallDataArray = [];
        const payloadArray = [];
        let chainSwitchBridge = false;
        callArray.forEach((callItem) => {
            if (callItem.type == 'wrap') {
                const inputToken = callItem.fromToken.address;
                const targetToken = callItem.toToken.address;
                const value = callItem.toAmount;
                const target = callItem.data.target;
                if (chainSwitchBridge) {
                    const callObject = (0, Wrap_1.PrepareCallDataForUnwrap)(inputToken, targetToken, value, target);
                    payloadArray.push(callObject);
                }
                else {
                    const callObject = (0, Wrap_1.PrepareCallDataForWrap)(inputToken, targetToken, value, target);
                    filteredCallDataArray.push(callObject);
                }
            }
            else if (callItem.type == 'swap') {
                const routerAddress = callItem.data.target;
                const inputToken = callItem.fromToken.address;
                const targetToken = callItem.toToken.address;
                const target = callItem.data.target;
                const approvalAmonunt = callItem.fromAmount;
                const dexName = callItem.data.dex;
                const amountOutMin = callItem.toAmountMin;
                const { callObject1, callObject2 } = (0, Swap_1.PrepareCallDataForSwap)(routerAddress, targetToken, inputToken, approvalAmonunt, target, dexName, amountOutMin, squidrouterAddress, squidMulticallAddress);
                if (chainSwitchBridge) {
                    payloadArray.push(callObject1);
                    payloadArray.push(callObject2);
                }
                else {
                    filteredCallDataArray.push(callObject1);
                    filteredCallDataArray.push(callObject2);
                }
            }
            else if (callItem.type == 'bridge') {
                chainSwitchBridge = true;
            }
        });
        const sender = routeData.params.toAddress;
        const finalToken = routeData.params.toToken;
        const finalTransferObject = {
            callType: 2,
            target: sender,
            value: BigInt(0),
            callData: "0x",
            payload: (0, utils_1.hexZeroPad)(finalToken, 32) + (0, utils_1.hexZeroPad)("0x0", 32).substring(2)
        };
        payloadArray.push(finalTransferObject);
        console.log("FilteredCallArray is:", filteredCallDataArray);
        console.log("Payload Array:", payloadArray);
        // const provider=new ethers.providers.JsonRpcProvider("https://arb-mainnet.g.alchemy.com/v2/fDU1soZ266z9Urc9b7gLUBn0hIsr5fVQ");
        // const signer=new ethers.Wallet(`${process.env.PRIVATE_KEY}`,provider);
        // const contract=new ethers.Contract("0xce16f69375520ab01377ce7b88f5ba8c48f8d666",ABI.abi,signer); //contract address is the proxy contract address,yeh sab can be found from squidContracts
        // const gasLimit = ethers.utils.hexlify(3000000); 
        const abiCode = new ethers_1.ethers.utils.AbiCoder();
        // Then, encode the array of encoded calls along with other parameters
        const callArrayEncoded = payloadArray.map((call) => abiCode.encode(["uint8", "address", "uint256", "bytes", "bytes"], [call.callType, call.target, call.value, call.callData, call.payload]));
        console.log(callArrayEncoded);
        const callPayload = abiCode.encode(["bytes[]", "address", "bytes32"], [callArrayEncoded, "0x00ce496A3aE288Fec2BA5b73039DB4f7c31a9144", (0, utils_1.hexZeroPad)("0x0", 32)]);
        console.log(callPayload);
        //   console.log("hello")
        //   const salt=abiCode.decode(["bytes32"],"0x70591d21673e3b97a1beb16dd91a203f");
        //  console.log(salt);
        //   const tx=await contract.callBridgeCall(fromToken,value,filteredCallDataArray,"axlUSDC","Moonbeam",squidrouterAddress,callPayload,"0x00ce496A3aE288Fec2BA5b73039DB4f7c31a9144",true,{gasLimit});
        //  console.log("Transaction sent. Waiting for confirmation...");
        //  const receipt = await tx.wait(); // Wait for transaction confirmation
        //  console.log("Transaction confirmed! Hash:", receipt.transactionHash);
    }
    catch (error) {
        console.error("Error:", error.response ? error.response.data : error.message);
    }
};
getRoute();
