// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import { IAxelarGateway } from "@axelar-network/axelar-cgp-solidity/contracts/interfaces/IAxelarGateway.sol";
import { IERC20 } from "@axelar-network/axelar-cgp-solidity/contracts/interfaces/IERC20.sol";
contract SendMessage {
    string public value;
    string public sourceChain;
    string public sourceAddress;
    IAxelarGateway public immutable gateway;

    constructor(address gateway_) {
        // Sets the immutable state variable to the address of gasReceiver_
        gateway = IAxelarGateway(gateway_);
    }
    function send(
        IERC20 token,
        uint256 amount,
        string memory destinationChain,
        string memory destinationAddress
    ) public {
        token.approve(address(gateway),amount);
        gateway.sendToken(destinationChain,destinationAddress,"aUSDC",amount);x
    }
    
}