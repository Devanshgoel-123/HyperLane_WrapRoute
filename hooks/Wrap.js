"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PrepareCallDataForWrap = PrepareCallDataForWrap;
exports.PrepareCallDataForUnwrap = PrepareCallDataForUnwrap;
const utils_1 = require("ethers/lib/utils");
const types_1 = require("./types");
const ethers_1 = require("ethers");
function PrepareCallDataForWrap(targetToken, inputToken, value, target) {
    //wrap
    //amount specified needs to be spent
    const wrapFunctionName = "0xd0e30db0";
    const callObject = {
        callType: types_1.CallType.Default,
        target: target, //the wrapped token
        value: Number(value), //amount to be wrapped
        callData: wrapFunctionName, //deposit function
        payload: ethers_1.ethers.utils.hexZeroPad(target, 32) + ethers_1.ethers.utils.hexZeroPad(ethers_1.ethers.utils.hexlify(0), 32).substring(2)
    };
    return callObject;
}
function PrepareCallDataForUnwrap(targetToken, inputToken, value, target) {
    //unwrap
    //amount specified needs to be spent
    const wrapFunctionName = "0x2e1a7d4d";
    const callObject = {
        callType: types_1.CallType.FullTokenBalance,
        target: target, //the wrapped token
        value: Number(0),
        callData: wrapFunctionName + (0, utils_1.hexZeroPad)("0x0", 32).substring(2), //deposit function
        payload: ethers_1.ethers.utils.hexZeroPad(target, 32) + ethers_1.ethers.utils.hexZeroPad(ethers_1.ethers.utils.hexlify(0), 32).substring(2)
    };
    return callObject;
}
