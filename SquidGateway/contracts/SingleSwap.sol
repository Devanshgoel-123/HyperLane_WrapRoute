// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;
pragma abicoder v2;

import {IAxelarGateway } from "@axelar-network/axelar-cgp-solidity/contracts/interfaces/IAxelarGateway.sol";
import { IAxelarGasService } from "@axelar-network/axelar-gmp-sdk-solidity/contracts/interfaces/IAxelarGasService.sol";
import "@uniswap/v3-periphery/contracts/interfaces/ISwapRouter.sol";

interface  IERC20 {
     function balanceOf(address account) external view returns (uint256);
     function approve(address spender, uint256 amount) external returns (bool);
     function transferFrom(address sender, address recipient, uint256 amount) external returns (bool);
      function allowance(address owner, address spender) external view returns (uint256);
}

interface IWETH {
    function deposit() external payable;
    function withdraw(uint256 amount) external;
    function transfer(address to, uint256 amount) external returns (bool);
}
contract SendMessage {
    IAxelarGateway public immutable gateway;
    ISwapRouter public immutable swapRouter;
    address public immutable axelarGasService;
    address public constant ARB_ETH_ADDRESS = 0x0000000000000000000000000000000000000000;
    address public constant WETH_TOKEN_ADDRESS=0x82aF49447D8a07e3bd95BD0d56f35241523fBab1;
    address public constant AXL_USDC_ARB_ADDRESS=0xEB466342C4d449BC9f53A865D5Cb90586f405215;
    uint24 public constant poolFee=3000;
    
    constructor(address gateway_,ISwapRouter _swapRouter,address _axelarGasService) {
        swapRouter=_swapRouter;
        gateway = IAxelarGateway(gateway_);
        axelarGasService=_axelarGasService;
    }   
    IWETH public WETH_TOKEN=IWETH(WETH_TOKEN_ADDRESS);
    IERC20 public ARB_ETH_TOKEN=IERC20(ARB_ETH_ADDRESS);
    IERC20 public AXL_USDC_ARB_TOKEN=IERC20(AXL_USDC_ARB_ADDRESS);

    function swapExactInputSingle(uint256 amountIn) external payable returns (uint256 amountOut){
        require(msg.value == amountIn, "Incorrect Ether sent");
        WETH_TOKEN.deposit{value: amountIn}();
        WETH_TOKEN.transfer(address(swapRouter), amountIn);
        ARB_ETH_TOKEN.transferFrom(msg.sender, address(this), amountIn);
        ARB_ETH_TOKEN.approve(address(swapRouter), amountIn);

        ISwapRouter.ExactInputSingleParams memory params =
            ISwapRouter.ExactInputSingleParams({
                tokenIn: WETH_TOKEN_ADDRESS,
                tokenOut: AXL_USDC_ARB_ADDRESS,
                fee: poolFee,
                recipient: msg.sender,
                deadline: block.timestamp,
                amountIn: amountIn,
                amountOutMinimum: 0,
                sqrtPriceLimitX96: 0
            });
            amountOut = swapRouter.exactInputSingle(params);
            require(amountOut > 0, "Swap failed: No tokens received");
            _bridgeCall("axlUSDC", AXL_USDC_ARB_ADDRESS,"Moonbeam", msg.sender);
    }
 
    function smartApprove(address token, address spender, uint256 amount) internal {
        uint256 allowance = IERC20(token).allowance(address(this), spender);
        if (allowance < amount) {
            if (allowance > 0) {
                _approveCall(token, spender, 0);
            }
            _approveCall(token, spender, type(uint256).max);
        }
    }
     function _approveCall(address token, address spender, uint256 amount) private {
        (bool success, ) = token.call(
            abi.encodeWithSelector(IERC20.approve.selector, spender, amount)
        );
        if (!success) revert("Approval failed");
    }

    
   function _bridgeCall(
        string calldata bridgedTokenSymbol,
        address bridgedTokenAddress,
        string calldata destinationChain,
        string calldata destinationAddress
    ) private {
        uint256 bridgedTokenBalance = IERC20(bridgedTokenAddress).balanceOf(address(this));
         if (address(this).balance > 0) {
                IAxelarGasService(axelarGasService).payNativeGasForContractCallWithToken{
                    value: address(this).balance
                }(
                    address(this),
                    destinationChain,
                    destinationAddress,
                    "",
                    bridgedTokenSymbol,
                    bridgedTokenBalance,
                   msg.sender
                );
        }
        smartApprove(bridgedTokenAddress, address(gateway), bridgedTokenBalance);
        gateway.sendToken(
            destinationChain,
            destinationAddress,
            bridgedTokenSymbol,
            bridgedTokenBalance
        );
    }
    
}