import { BigNumber, ethers } from "ethers";

export enum CallType {
    // Will simply run calldata
    Default,
    // Will update amount field in calldata with ERC20 token balance of the multicall contract.
    FullTokenBalance,
    // Will update amount field in calldata with native token balance of the multicall contract.
    FullNativeBalance,
    // Will run a safeTransferFrom to get full ERC20 token balance of the caller.
    CollectTokenBalance
  }
  

  export type callItem={
      // Call type, see CallType struct description.
       callType:CallType;
      // Address that will be called.
      target:string;
      // Native token amount that will be sent in call.
      value:number;
      // Calldata that will be send in call.
      callData:string;
      // Extra data used by multicall depending on call type.
      // Default: unused (provide 0x)
      // FullTokenBalance: address of the ERC20 token to get balance of and zero indexed position
      // of the amount parameter to update in function call contained by calldata.
      // Expect format is: abi.encode(address token, uint256 amountParameterPosition)
      // Eg: for function swap(address tokenIn, uint amountIn, address tokenOut, uint amountOutMin,)
      // amountParameterPosition would be 1.
      // FullNativeBalance: unused (provide 0x)
      // CollectTokenBalance: address of the ERC20 token to collect.
      // Expect format is: abi.encode(address token)
      payload:string;
  
  }