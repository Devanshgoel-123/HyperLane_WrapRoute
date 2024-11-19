import { ethers } from "ethers";
import { hexZeroPad } from "ethers/lib/utils";
enum SwapRouterName{
    "Uniswap V3" = "0x04e45aaf",
    "Camelot V3" = "0xbc651188",
   "StellaSwap V3" = "0xbc651188",
}
export function PrepareCallDataForSwap(routerAddress:string, targetToken:string, inputToken:string, value:string, target:string, dexName:string, amountOutMin:string, squidRouter:string, squidMulticall:string) {
    //first approve 
    const approve = "0x095ea7b3"; //remains the same for both side of the chains
    const approveCalldata = approve + hexZeroPad(target, 32).substring(2) + "f".repeat(64); //approve the spending of maximum amount
    const approvePayload = hexZeroPad(inputToken, 32) + hexZeroPad("0x0", 32).substring(3) + "1";
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
    const amountIn =ethers.BigNumber.from(value).toHexString();
    const amountOutMinimum =ethers.BigNumber.from(amountOutMin).toHexString();
    const deadline = "0x193254e04c8";
    const swapCallDataUniSwap = swap + hexZeroPad(inputToken, 32).substring(2) + hexZeroPad(targetToken, 32).substring(2) +
        hexZeroPad(fee, 32).substring(2) + hexZeroPad(receiver, 32).substring(2) + hexZeroPad(amountIn, 32).substring(2) + hexZeroPad(amountOutMinimum, 32).substring(2) + "0".repeat(64);
    const swapCallDataCamelot = swap + hexZeroPad(inputToken, 32).substring(2) + hexZeroPad(targetToken, 32).substring(2) + hexZeroPad(receiver, 32).substring(2) + hexZeroPad(deadline, 32).substring(2) + hexZeroPad(amountIn, 32).substring(2) + hexZeroPad(amountOutMinimum, 32).substring(2) + "0".repeat(64);
    const parameterPosition = "0x4";
    const swapPayload = hexZeroPad(inputToken, 32) + hexZeroPad(parameterPosition, 32).substring(2);
    const callObject2 = {
        callType: 1,
        target: target,
        value: BigInt(0),
        callData: dexName == "Uniswap V3" ? swapCallDataUniSwap : swapCallDataCamelot, //function values for the roputer 
        payload: swapPayload
    };
    return { callObject1, callObject2 };
}
