//SPDX-License-Identifier: MIT
pragma solidity 0.8.26;

import {RevertContext, RevertOptions} from "@zetachain/protocol-contracts/contracts/Revert.sol";
import "@zetachain/protocol-contracts/contracts/zevm/interfaces/UniversalContract.sol";
import "@zetachain/protocol-contracts/contracts/zevm/interfaces/IGatewayZEVM.sol";
import "@zetachain/protocol-contracts/contracts/zevm/GatewayZEVM.sol";



// struct zContext {
//     bytes origin;
//     address sender;
//     uint256 chainID;
// }

contract zeta is UniversalContract{
    GatewayZEVM public immutable gateway;
    event TransferStarted(string, string, uint256,address);
    event RevertEvent(string, RevertContext);
    error TransferFailed();

    constructor(address payable gatewayAddress) {
        gateway = GatewayZEVM(gatewayAddress);
    }

// struct MessageContext {
//     bytes origin;
//     address sender;
//     uint256 chainID;
// }

    function onCall(// This get trigerred when the contract receives a call from a connected chain
        MessageContext calldata context, 
        address zrc20,
        uint256 amount,
        bytes calldata message
    ) external override {
        string memory name=abi.decode(message,(string));
        emit TransferStarted("Transfer started from Zetachain with amount", name,amount,zrc20);
    }
    function onRevert(RevertContext calldata revertContext) external override {
        emit RevertEvent("Revert on ZetaChain", revertContext);
    }

   function call(   // Call a contract on a connected chain using the gateway
        bytes memory receiver,
        address zrc20,
        bytes calldata message,
        uint256 gasLimit,
        RevertOptions memory revertOptions
    ) external {
        (, uint256 gasFee) = IZRC20(zrc20).withdrawGasFeeWithGasLimit(gasLimit); //Calculates the amount needed to call the contract
        if (!IZRC20(zrc20).transferFrom(msg.sender, address(this), gasFee)) //transfer gas fees from 
            revert TransferFailed();
        IZRC20(zrc20).approve(address(gateway), gasFee);
        gateway.call(receiver, zrc20, message, gasLimit, revertOptions); //Initiate the contract call on the connected chain
    }
 
    function withdrawAndCall( //Withdraw Token when a contract is called on conne
        bytes memory receiver,
        uint256 amount,
        address zrc20,
        bytes calldata message,
        uint256 gasLimit,
        RevertOptions memory revertOptions
    ) external {
        (address gasZRC20, uint256 gasFee) = IZRC20(zrc20)
            .withdrawGasFeeWithGasLimit(gasLimit);
        uint256 target = zrc20 == gasZRC20 ? amount + gasFee : amount;
        if (!IZRC20(zrc20).transferFrom(msg.sender, address(this), target))
            revert TransferFailed();
        IZRC20(zrc20).approve(address(gateway), target);
        if (zrc20 != gasZRC20) {
            if (
                !IZRC20(gasZRC20).transferFrom(
                    msg.sender,
                    address(this),
                    gasFee
                )
            ) revert TransferFailed();
            IZRC20(gasZRC20).approve(address(gateway), gasFee);
        }
        gateway.withdrawAndCall(
            receiver,
            amount,
            zrc20,
            message,
            gasLimit,
            revertOptions
        );
    }
}