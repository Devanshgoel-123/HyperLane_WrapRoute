"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
const ethers_1 = require("ethers");
const SquidRouterAbi_json_1 = __importDefault(require("./SquidRouterAbi.json"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
var CallType;
(function (CallType) {
    // Will simply run calldata
    CallType[CallType["Default"] = 0] = "Default";
    // Will update amount field in calldata with ERC20 token balance of the multicall contract.
    CallType[CallType["FullTokenBalance"] = 1] = "FullTokenBalance";
    // Will update amount field in calldata with native token balance of the multicall contract.
    CallType[CallType["FullNativeBalance"] = 2] = "FullNativeBalance";
    // Will run a safeTransferFrom to get full ERC20 token balance of the caller.
    CallType[CallType["CollectTokenBalance"] = 3] = "CollectTokenBalance";
})(CallType || (CallType = {}));
//ethers encode function used here to convert (zero padding)
function PrepareCallDataForSwap(routerAddress, targetToken, inputToken, value, target, dexName, amountOutMin) {
    //first approve 
    const approve = "0x095ea7b3";
    // const approveCalldata=abiCode.encode(["string","string","string"],[approve,target,value]);
    const approveCalldata = approve + ethers_1.ethers.utils.hexZeroPad(target, 32) + ethers_1.ethers.utils.hexlify(BigInt(value));
    const approvePayload = ethers_1.ethers.utils.hexZeroPad(target, 32) + ethers_1.ethers.utils.hexZeroPad("1", 32);
    const callObject1 = {
        callType: 0,
        target: inputToken,
        value: BigInt(0),
        callData: approveCalldata,
        payload: approvePayload
    };
    //then swap
    const swap = dexName == 'Uniswap V3' ? "0x04e45aaf" : "0xbc651188";
    const fee = "1f4";
    const evmSquidAddress = "ea749fd6ba492dbc14c24fe8a3d08769229b896c";
    const amountOutMinimum = parseInt("hex", Number(amountOutMin)).toString();
    //  const swapCallData=hexConcat([swap,inputToken,targetToken,fee,evmSquidAddress,value,amountOutMinimum,"0"]);
    // const swapCallData=swap+inputToken+targetToken+fee+evmSquidAddress+value+amountOutMinimum+"0";
    //  const swapPayload=AbiCoder.encode(["string","string"],[inputToken,4]);
    //  const callObject2:callItem={
    //   callType:1,
    //   target:target,
    //   value:BigInt(0),
    //   callData:swapCallData, //function values for the roputer 
    //   payload:swapPayload
    //  }
    return { callObject1 };
}
function PrepareCallDataForWrap(targetToken, inputToken, value, target) {
    const abiCode = new ethers_1.ethers.utils.AbiCoder();
    //wrap
    //amount specified needs to be spent
    const wrapFunctionName = "0xd0e30db0";
    const callObject = {
        callType: 0,
        target: target, //the wrapped token
        value: BigInt(value), //amount to be wrapped
        callData: wrapFunctionName, //deposit function
        payload: ethers_1.ethers.utils.hexZeroPad(target, 32)
    };
    return callObject;
}
const getRoute = async () => {
    const provider = new ethers_1.ethers.providers.JsonRpcProvider("https://arb-mainnet.g.alchemy.com/v2/fDU1soZ266z9Urc9b7gLUBn0hIsr5fVQ");
    const signer = new ethers_1.ethers.Wallet(`${process.env.PRIVATE_KEY}`, provider);
    const contract = new ethers_1.ethers.Contract("0xce16f69375520ab01377ce7b88f5ba8c48f8d666", SquidRouterAbi_json_1.default, provider); //contract address is the proxy contract address,yeh sab can be found from squidContracts
    let destinationChainTokenAddress = "";
    let destinationChainSymbol = "";
    let sourceChainTokenSymbol = "";
    let sourceChainTokenaddress = "";
    let amount = "";
    try {
        const res = await axios_1.default.post("https://apiplus.squidrouter.com/v2/route", {
            fromChain: "42161",
            fromToken: "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee",
            fromAddress: "0x0000000000000000000000000000000000000000",
            fromAmount: "2000000000000000000",
            toChain: "1284",
            toToken: "0xca01a1d0993565291051daff390892518acfad3a",
            toAddress: "",
            quoteOnly: true,
            enableBoost: true
        }, {
            headers: {
                "accept": "application/json, text/plain, */*",
                "accept-language": "en-US,en;q=0.9",
                "content-type": "application/json",
                "priority": "u=1, i",
                "sec-ch-ua": "\"Chromium\";v=\"130\", \"Google Chrome\";v=\"130\", \"Not?A_Brand\";v=\"99\"",
                "sec-ch-ua-mobile": "?0",
                "sec-ch-ua-platform": "\"macOS\"",
                "sec-fetch-dest": "empty",
                "sec-fetch-mode": "cors",
                "sec-fetch-site": "same-site",
                "x-integrator-id": "squid-v21-swap-widget-449AA6D3-42BC-450A-B66A-9D68D9534E95",
                "Referer": "https://app.squidrouter.com/",
                "Referrer-Policy": "strict-origin-when-cross-origin"
            }
        });
        const routeData = res.data.route;
        sourceChainTokenSymbol = routeData.estimate.fromToken.symbol;
        sourceChainTokenaddress = routeData.estimate.fromToken.address;
        amount = routeData.estimate.fromAmount;
        destinationChainTokenAddress = "0xce16F69375520ab01377ce7B88f5BA8C48F8D666";
        destinationChainSymbol = routeData.estimate.toToken.symbol;
        const callArray = routeData.estimate.actions;
        const filteredCallDataArray = [];
        callArray.forEach((callItem) => {
            if (callItem.type == 'wrap') {
                const inputToken = callItem.fromToken.address;
                const targetToken = callItem.toToken.address;
                const value = callItem.toAmount;
                const target = targetToken;
                const callObject = PrepareCallDataForWrap(inputToken, targetToken, value, target);
                filteredCallDataArray.push(callObject);
            }
            else if (callItem.type == 'swap') {
                const routerAddress = callItem.data.target;
                const inputToken = callItem.fromToken.address;
                const targetToken = callItem.toToken.address;
                const target = callItem.data.target;
                const approvalAmonunt = callItem.fromAmount;
                const dexName = callItem.data.dexName;
                const amountOutMin = callItem.toAmountMin;
                const { callObject1 } = PrepareCallDataForSwap(routerAddress, targetToken, inputToken, approvalAmonunt, target, dexName, amountOutMin);
                filteredCallDataArray.push(callObject1);
                // filteredCallDataArray.push(callObject2)
            }
        });
        console.log(filteredCallDataArray);
    }
    catch (error) {
        console.error("Error:", error.response ? error.response.data : error.message);
    }
};
getRoute();
