import {ethers} from "ethers";
import { CallType,callItem } from "./hooks/types"
import { PrepareCallDataForSwap } from "./hooks/Swap";
import { PrepareCallDataForWrap,PrepareCallDataForUnwrap } from "./hooks/Wrap";
import { getDataFromSquidApi } from "./hooks/SquidApi";
import dotenv from "dotenv";
import { hexZeroPad } from "ethers/lib/utils";
dotenv.config();

const getRoute = async () => {
  
  let destinationChainTokenAddress = "";
  let destinationChainSymbol = "";
  let sourceChainTokenSymbol = "";
  let sourceChainTokenaddress = "";
  let amount = "";

  try {
    const res:any=await getDataFromSquidApi();
    const routeData = res.data.route;
    const fromToken=routeData.params.fromToken;
    const value=routeData.params.fromAmount;
    sourceChainTokenSymbol = routeData.estimate.fromToken.symbol;
    sourceChainTokenaddress = routeData.estimate.fromToken.address;
    amount = routeData.estimate.fromAmount;
    destinationChainTokenAddress = "0xce16F69375520ab01377ce7B88f5BA8C48F8D666" ; //squid router address
    destinationChainSymbol = routeData.estimate.toToken.symbol;
    const squidrouterAddress=routeData.estimate.gasCosts[0].token.chain.squidContracts.squidRouter;
    const squidMulticallAddress=routeData.estimate.gasCosts[0].token.chain.squidContracts.squidMulticall;
    
    const callArray = routeData.estimate.actions;
    const filteredCallDataArray:any = [];
    const payloadArray:any[]=[];
    let chainSwitchBridge:boolean=false;
    console.log(ethers.constants.AddressZero)
    const secondChainFirstCallObject:callItem={
      callType:CallType.CollectTokenBalance,
      target:ethers.constants.AddressZero,
      value:Number(0),
      callData:hexZeroPad("0x0",32),
      payload:hexZeroPad("0xca01a1d0993565291051daff390892518acfad3a",32)
    }
    payloadArray.push(secondChainFirstCallObject);
    callArray.forEach((callItem:any) => {
        if(callItem.type=='wrap'){
          const inputToken=callItem.fromToken.address;
          const targetToken=callItem.toToken.address;
          const value=callItem.toAmount;
          const target=callItem.data.target;
          if(chainSwitchBridge){
            const callObject=PrepareCallDataForUnwrap(inputToken,targetToken,value,target);
            payloadArray.push(callObject);
          }else{
            const callObject=PrepareCallDataForWrap(inputToken,targetToken,value,target);
            filteredCallDataArray.push(callObject);
          }
        }else if(callItem.type=='swap'){
          const routerAddress=callItem.data.target;
          const inputToken=callItem.fromToken.address;
          const targetToken=callItem.toToken.address;
          const target=callItem.data.target;
          const approvalAmonunt=callItem.fromAmount;
          const dexName=callItem.data.dex;
          const amountOutMin=callItem.toAmountMin;
          const {callObject1,callObject2}=PrepareCallDataForSwap(routerAddress,targetToken,inputToken,approvalAmonunt,target,dexName,amountOutMin,squidrouterAddress,squidMulticallAddress)
          if(chainSwitchBridge){
            payloadArray.push(callObject1);
            payloadArray.push(callObject2)
          }else{
            filteredCallDataArray.push(callObject1);
            filteredCallDataArray.push(callObject2)
          }
        }else if(callItem.type=='bridge'){
          chainSwitchBridge=true;
        }
    });
    const sender=routeData.params.toAddress;
    const finalToken=routeData.params.toToken;
    const finalTransferObject:callItem={
      callType:CallType.FullNativeBalance,
      target:sender,
      value:0,
      callData:hexZeroPad("0x0",32),
      payload:hexZeroPad(finalToken,32)+hexZeroPad("0x0",32).substring(2)
    }
    payloadArray.push(finalTransferObject);
     
     console.log("Payload Array:",payloadArray)
    // const provider=new ethers.providers.JsonRpcProvider("https://arb-mainnet.g.alchemy.com/v2/fDU1soZ266z9Urc9b7gLUBn0hIsr5fVQ");
    // const signer=new ethers.Wallet(`${process.env.PRIVATE_KEY}`,provider);
    // const contract=new ethers.Contract("0xce16f69375520ab01377ce7b88f5ba8c48f8d666",ABI.abi,signer); //contract address is the proxy contract address,yeh sab can be found from squidContracts
    // const gasLimit = ethers.utils.hexlify(3000000); 
    const abiCode=new ethers.utils.AbiCoder();
   
    // Then, encode the array of encoded calls along with other parameters
    const callArrayEncoded = payloadArray.map((call:any) =>
      abiCode.encode(
        ["uint8", "address", "uint256", "bytes", "bytes"],
        [call.callType, call.target, call.value, call.callData, call.payload]
      )
    );
    console.log(callArrayEncoded);
    const callPayload = abiCode.encode(
      ["bytes[]","address","bytes32"],
      [callArrayEncoded,"0x00ce496A3aE288Fec2BA5b73039DB4f7c31a9144",hexZeroPad("0x7",32)]
    );
   
     console.log(callPayload);
  //   console.log("hello")
  //   const salt=abiCode.decode(["bytes32"],"0x70591d21673e3b97a1beb16dd91a203f");
  //  console.log(salt);
  //   const tx=await contract.callBridgeCall(fromToken,value,filteredCallDataArray,"axlUSDC","Moonbeam",squidrouterAddress,callPayload,"0x00ce496A3aE288Fec2BA5b73039DB4f7c31a9144",true,{gasLimit});
  //  console.log("Transaction sent. Waiting for confirmation...");
  //  const receipt = await tx.wait(); // Wait for transaction confirmation
  //  console.log("Transaction confirmed! Hash:", receipt.transactionHash);
  } catch (error:any) {
    console.error("Error:", error.response ? error.response.data : error.message);
  }
};

 getRoute();
