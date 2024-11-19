"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PrepareCallDataForSwap = PrepareCallDataForSwap;
const ethers_1 = require("ethers");
const utils_1 = require("ethers/lib/utils");
var SwapRouterName;
(function (SwapRouterName) {
    SwapRouterName["Uniswap V3"] = "0x04e45aaf";
    SwapRouterName["Camelot V3"] = "0xbc651188";
    SwapRouterName["StellaSwap V3"] = "0xbc651188";
})(SwapRouterName || (SwapRouterName = {}));
function PrepareCallDataForSwap(routerAddress, targetToken, inputToken, value, target, dexName, amountOutMin, squidRouter, squidMulticall) {
    //first approve 
    const approve = "0x095ea7b3"; //remains the same for both side of the chains
    const approveCalldata = approve + (0, utils_1.hexZeroPad)(target, 32).substring(2) + "f".repeat(64); //approve the spending of maximum amount
    const approvePayload = (0, utils_1.hexZeroPad)(inputToken, 32) + (0, utils_1.hexZeroPad)("0x0", 32).substring(3) + "1";
    const callObject1 = {
        callType: 0,
        target: inputToken,
        value: BigInt(0),
        callData: approveCalldata,
        payload: approvePayload
    };
    //then swap
    const swap = dexName == 'Uniswap V3' ? "0x04e45aaf" : "0xbc651188";
    const fee = dexName == 'Uniswap V3' ? "0x1f4" : "0x19324e9af64";
    const receiver = dexName == 'Uniswap V3' || dexName == 'Stellaswap V3' ? squidMulticall : squidRouter;
    const amountIn = ethers_1.ethers.BigNumber.from(value).toHexString();
    const amountOutMinimum = ethers_1.ethers.BigNumber.from(amountOutMin).toHexString();
    const deadline = "0x193254e04c8";
    const swapCallDataUniSwap = swap + (0, utils_1.hexZeroPad)(inputToken, 32).substring(2) + (0, utils_1.hexZeroPad)(targetToken, 32).substring(2) +
        (0, utils_1.hexZeroPad)(fee, 32).substring(2) + (0, utils_1.hexZeroPad)(receiver, 32).substring(2) + (0, utils_1.hexZeroPad)(amountIn, 32).substring(2) + (0, utils_1.hexZeroPad)(amountOutMinimum, 32).substring(2) + "0".repeat(64);
    const swapCallDataCamelot = swap + (0, utils_1.hexZeroPad)(inputToken, 32).substring(2) + (0, utils_1.hexZeroPad)(targetToken, 32).substring(2) + (0, utils_1.hexZeroPad)(receiver, 32).substring(2) + (0, utils_1.hexZeroPad)(deadline, 32).substring(2) + (0, utils_1.hexZeroPad)(amountIn, 32).substring(2) + (0, utils_1.hexZeroPad)(amountOutMinimum, 32).substring(2) + "0".repeat(64);
    const parameterPosition = "0x4";
    const swapPayload = (0, utils_1.hexZeroPad)(inputToken, 32) + (0, utils_1.hexZeroPad)(parameterPosition, 32).substring(2);
    const callObject2 = {
        callType: 1,
        target: target,
        value: BigInt(0),
        callData: dexName == "Uniswap V3" ? swapCallDataUniSwap : swapCallDataCamelot, //function values for the roputer 
        payload: swapPayload
    };
    return { callObject1, callObject2 };
}
