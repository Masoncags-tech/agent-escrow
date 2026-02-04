// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Script, console2} from "forge-std/Script.sol";
import {AgentEscrow} from "../src/Escrow.sol";

contract DeployScript is Script {
    // Base Mainnet USDC
    address constant BASE_USDC = 0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913;
    
    // Base Sepolia USDC (test)
    address constant BASE_SEPOLIA_USDC = 0x036CbD53842c5426634e7929541eC2318f3dCF7e;

    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address usdc = _getUSDCAddress();
        
        vm.startBroadcast(deployerPrivateKey);
        
        AgentEscrow escrow = new AgentEscrow(usdc);
        
        console2.log("AgentEscrow deployed to:", address(escrow));
        console2.log("USDC address:", usdc);
        console2.log("Chain ID:", block.chainid);
        
        vm.stopBroadcast();
    }

    function _getUSDCAddress() internal view returns (address) {
        if (block.chainid == 8453) {
            // Base Mainnet
            return BASE_USDC;
        } else if (block.chainid == 84532) {
            // Base Sepolia
            return BASE_SEPOLIA_USDC;
        } else {
            // Local or unknown - will need mock
            revert("Unsupported chain. Deploy MockUSDC first for testing.");
        }
    }
}

contract DeployWithMock is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        
        vm.startBroadcast(deployerPrivateKey);
        
        // Deploy mock USDC for testing
        MockUSDCDeploy mockUsdc = new MockUSDCDeploy();
        console2.log("MockUSDC deployed to:", address(mockUsdc));
        
        AgentEscrow escrow = new AgentEscrow(address(mockUsdc));
        console2.log("AgentEscrow deployed to:", address(escrow));
        
        vm.stopBroadcast();
    }
}

// Minimal mock for deployment
contract MockUSDCDeploy {
    string public constant name = "USD Coin";
    string public constant symbol = "USDC";
    uint8 public constant decimals = 6;

    mapping(address => uint256) public balanceOf;
    mapping(address => mapping(address => uint256)) public allowance;
    uint256 public totalSupply;

    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);

    function mint(address to, uint256 amount) external {
        balanceOf[to] += amount;
        totalSupply += amount;
        emit Transfer(address(0), to, amount);
    }

    function transfer(address to, uint256 amount) external returns (bool) {
        balanceOf[msg.sender] -= amount;
        balanceOf[to] += amount;
        emit Transfer(msg.sender, to, amount);
        return true;
    }

    function approve(address spender, uint256 amount) external returns (bool) {
        allowance[msg.sender][spender] = amount;
        emit Approval(msg.sender, spender, amount);
        return true;
    }

    function transferFrom(address from, address to, uint256 amount) external returns (bool) {
        allowance[from][msg.sender] -= amount;
        balanceOf[from] -= amount;
        balanceOf[to] += amount;
        emit Transfer(from, to, amount);
        return true;
    }
}
