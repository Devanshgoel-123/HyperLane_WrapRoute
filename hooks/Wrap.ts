import { hexZeroPad } from "ethers/lib/utils";
import { callItem } from "./types";
import { ethers } from "ethers";
export function PrepareCallDataForWrap(targetToken:string,inputToken:string,value:string,target:string){
    //wrap
     //amount specified needs to be spent
     const wrapFunctionName="0xd0e30db0";
    const callObject:callItem={
     callType:0,
     target:target, //the wrapped token
     value:BigInt(value), //amount to be wrapped
     callData:wrapFunctionName,  //deposit function
     payload:ethers.utils.hexZeroPad(target,32)+ethers.utils.hexZeroPad(ethers.utils.hexlify(0),32).substring(2)
    }
    return callObject;
 }

 export function PrepareCallDataForUnwrap(targetToken:string,inputToken:string,value:string,target:string){
    //unwrap
     //amount specified needs to be spent
     const wrapFunctionName="0x2e1a7d4d";
    const callObject:callItem={
     callType:1,
     target:target, //the wrapped token
     value:BigInt(0), 
     callData:wrapFunctionName+hexZeroPad("0x0",32).substring(2),  //deposit function
     payload:ethers.utils.hexZeroPad(target,32)+ethers.utils.hexZeroPad(ethers.utils.hexlify(0),32).substring(2)
    }
    return callObject;
 }