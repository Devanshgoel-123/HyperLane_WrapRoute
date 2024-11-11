import axios from "axios";
import {ethers,utils} from "ethers";
import abi from "./SquidRouterAbi.json";
import dotenv from "dotenv";
import { AbiCoder, hexConcat, hexZeroPad } from "ethers/lib/utils";
dotenv.config();
enum CallType {
  // Will simply run calldata
  Default,
  // Will update amount field in calldata with ERC20 token balance of the multicall contract.
  FullTokenBalance,
  // Will update amount field in calldata with native token balance of the multicall contract.
  FullNativeBalance,
  // Will run a safeTransferFrom to get full ERC20 token balance of the caller.
  CollectTokenBalance
}

interface callItem{
    // Call type, see CallType struct description.
     callType:CallType;
    // Address that will be called.
    target:string;
    // Native token amount that will be sent in call.
    value:BigInt;
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
 //ethers encode function used here to convert (zero padding)

function PrepareCallDataForSwap(routerAddress:string,targetToken:string,inputToken:string,value:string,target:string,dexName:string,amountOutMin:string){
  //first approve 
  const approve="0x095ea7b3";
// const approveCalldata=abiCode.encode(["string","string","string"],[approve,target,value]);
const approveCalldata=approve+ethers.utils.hexZeroPad(target,32)+ethers.utils.hexlify(BigInt(value));
const approvePayload=ethers.utils.hexZeroPad(target,32)+ethers.utils.hexZeroPad("1",32);
   const callObject1:callItem={
    callType:0,
    target:inputToken,
    value:BigInt(0),
    callData:approveCalldata,
    payload:approvePayload
   }
   //then swap
   const swap=dexName=='Uniswap V3'?"0x04e45aaf":"0xbc651188";
   const fee="1f4";
   const evmSquidAddress="ea749fd6ba492dbc14c24fe8a3d08769229b896c";
   const amountOutMinimum=parseInt("hex",Number(amountOutMin)).toString();
  const swapCallData=
   const swapPayload=
   const callObject2:callItem={
    callType:1,
    target:target,
    value:BigInt(0),
    callData:swapCallData, //function values for the roputer 
    payload:swapPayload
   }
  
   return {callObject1};
}


function PrepareCallDataForWrap(targetToken:string,inputToken:string,value:string,target:string){
  const abiCode=new ethers.utils.AbiCoder();
  //wrap
    //amount specified needs to be spent
    const wrapFunctionName="0xd0e30db0";
   const callObject:callItem={
    callType:0,
    target:target, //the wrapped token
    value:BigInt(value), //amount to be wrapped
    callData:wrapFunctionName,  //deposit function
    payload:ethers.utils.hexZeroPad(target,32)
   }
   return callObject;
}


const getRoute = async () => {
  const provider=new ethers.providers.JsonRpcProvider("https://arb-mainnet.g.alchemy.com/v2/fDU1soZ266z9Urc9b7gLUBn0hIsr5fVQ");
  const signer=new ethers.Wallet(`${process.env.PRIVATE_KEY}`,provider);
  const contract=new ethers.Contract("0xce16f69375520ab01377ce7b88f5ba8c48f8d666",abi,provider); //contract address is the proxy contract address,yeh sab can be found from squidContracts
  const result=await contract.
  let destinationChainTokenAddress = "";
  let destinationChainSymbol = "";
  let sourceChainTokenSymbol = "";
  let sourceChainTokenaddress = "";
  let amount = "";

  try {
    const res=await axios.post(
      "https://apiplus.squidrouter.com/v2/route",
      {
        fromChain: "42161",
        fromToken: "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee",
        fromAddress: "0x0000000000000000000000000000000000000000",
        fromAmount: "2000000000000000000",
        toChain: "1284",
        toToken: "0xca01a1d0993565291051daff390892518acfad3a",
        toAddress: "",
        quoteOnly: true,
        enableBoost: true
      },
      {
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
      }
    )

    const routeData = res.data.route;
    sourceChainTokenSymbol = routeData.estimate.fromToken.symbol;
    sourceChainTokenaddress = routeData.estimate.fromToken.address;
    amount = routeData.estimate.fromAmount;
    destinationChainTokenAddress = "0xce16F69375520ab01377ce7B88f5BA8C48F8D666";
    destinationChainSymbol = routeData.estimate.toToken.symbol;
    
    const callArray = routeData.estimate.actions;
    const filteredCallDataArray:any = [];

    callArray.forEach((callItem: any) => {
        if(callItem.type=='wrap'){
          const inputToken=callItem.fromToken.address;
          const targetToken=callItem.toToken.address;
          const value=callItem.toAmount;
          const target=targetToken;
          const callObject=PrepareCallDataForWrap(inputToken,targetToken,value,target);
          filteredCallDataArray.push(callObject);
        }else if(callItem.type=='swap'){
          const routerAddress=callItem.data.target;
          const inputToken=callItem.fromToken.address;
          const targetToken=callItem.toToken.address;
          const target=callItem.data.target;
          const approvalAmonunt=callItem.fromAmount;
          const dexName=callItem.data.dexName;
          const amountOutMin=callItem.toAmountMin;
          const {callObject1}=PrepareCallDataForSwap(routerAddress,targetToken,inputToken,approvalAmonunt,target,dexName,amountOutMin)
          filteredCallDataArray.push(callObject1);
          // filteredCallDataArray.push(callObject2)
        }
    });

    console.log(filteredCallDataArray);
    
  } catch (error:any) {
    console.error("Error:", error.response ? error.response.data : error.message);
  }
};

getRoute();
