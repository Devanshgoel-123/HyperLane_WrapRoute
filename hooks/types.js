"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CallType = void 0;
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
})(CallType || (exports.CallType = CallType = {}));
