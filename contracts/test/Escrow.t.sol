// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Test, console2} from "forge-std/Test.sol";
import {AgentEscrow} from "../src/Escrow.sol";
import {MockUSDC} from "../src/mocks/MockUSDC.sol";

contract EscrowTest is Test {
    AgentEscrow public escrow;
    MockUSDC public usdc;

    address public client = address(0x1);
    address public agent1 = address(0x2);
    address public agent2 = address(0x3);
    address public agent3 = address(0x4);
    address public arbiter = address(0x5);
    address public outsider = address(0x6);

    uint256 public constant TOTAL_AMOUNT = 1000 * 1e6; // 1000 USDC

    function setUp() public {
        usdc = new MockUSDC();
        escrow = new AgentEscrow(address(usdc));

        // Fund client
        usdc.mint(client, 10000 * 1e6);
    }

    // ============ Happy Path Tests ============

    function test_CreateEscrow_TwoAgents() public {
        vm.startPrank(client);
        usdc.approve(address(escrow), TOTAL_AMOUNT);

        address[] memory collaborators = new address[](2);
        collaborators[0] = agent1;
        collaborators[1] = agent2;

        uint256[] memory splits = new uint256[](2);
        splits[0] = 6000; // 60%
        splits[1] = 4000; // 40%

        uint256 escrowId = escrow.createEscrow(
            collaborators,
            splits,
            TOTAL_AMOUNT,
            "Build AI trading bot"
        );
        vm.stopPrank();

        assertEq(escrowId, 0);
        assertEq(usdc.balanceOf(address(escrow)), TOTAL_AMOUNT);

        (
            uint256 id,
            address escrowClient,
            ,
            uint256 totalAmount,
            ,,,,,
            string memory proofURI,
            AgentEscrow.EscrowStatus status
        ) = escrow.getEscrow(escrowId);

        assertEq(id, 0);
        assertEq(escrowClient, client);
        assertEq(totalAmount, TOTAL_AMOUNT);
        assertEq(bytes(proofURI).length, 0);
        assertEq(uint256(status), uint256(AgentEscrow.EscrowStatus.Active));
    }

    function test_FullFlow_HappyPath() public {
        // 1. Create escrow
        uint256 escrowId = _createStandardEscrow();

        // 2. Submit work
        vm.prank(agent1);
        escrow.submitWork(escrowId, "ipfs://QmProofHash123");

        (,,,,,,,,,, AgentEscrow.EscrowStatus status) = escrow.getEscrow(escrowId);
        assertEq(uint256(status), uint256(AgentEscrow.EscrowStatus.WorkSubmitted));

        // 3. Approve work
        vm.prank(client);
        escrow.approveWork(escrowId);

        (,,,,,,,,,, status) = escrow.getEscrow(escrowId);
        assertEq(uint256(status), uint256(AgentEscrow.EscrowStatus.Approved));

        // 4. Claim payouts
        uint256 agent1BalBefore = usdc.balanceOf(agent1);
        uint256 agent2BalBefore = usdc.balanceOf(agent2);

        vm.prank(agent1);
        escrow.claimPayout(escrowId);

        vm.prank(agent2);
        escrow.claimPayout(escrowId);

        // Verify correct splits (60/40)
        assertEq(usdc.balanceOf(agent1), agent1BalBefore + 600 * 1e6);
        assertEq(usdc.balanceOf(agent2), agent2BalBefore + 400 * 1e6);
        assertEq(usdc.balanceOf(address(escrow)), 0);
    }

    function test_ThreeAgentSplit() public {
        vm.startPrank(client);
        usdc.approve(address(escrow), TOTAL_AMOUNT);

        address[] memory collaborators = new address[](3);
        collaborators[0] = agent1;
        collaborators[1] = agent2;
        collaborators[2] = agent3;

        uint256[] memory splits = new uint256[](3);
        splits[0] = 5000; // 50%
        splits[1] = 3000; // 30%
        splits[2] = 2000; // 20%

        uint256 escrowId = escrow.createEscrow(collaborators, splits, TOTAL_AMOUNT, "Multi-agent task");
        vm.stopPrank();

        // Submit and approve
        vm.prank(agent1);
        escrow.submitWork(escrowId, "ipfs://proof");

        vm.prank(client);
        escrow.approveWork(escrowId);

        // Claims
        vm.prank(agent1);
        escrow.claimPayout(escrowId);
        vm.prank(agent2);
        escrow.claimPayout(escrowId);
        vm.prank(agent3);
        escrow.claimPayout(escrowId);

        assertEq(usdc.balanceOf(agent1), 500 * 1e6);
        assertEq(usdc.balanceOf(agent2), 300 * 1e6);
        assertEq(usdc.balanceOf(agent3), 200 * 1e6);
    }

    // ============ Edge Case Tests ============

    function test_PartialClaims() public {
        uint256 escrowId = _createStandardEscrow();
        
        vm.prank(agent1);
        escrow.submitWork(escrowId, "ipfs://proof");
        
        vm.prank(client);
        escrow.approveWork(escrowId);

        // Only agent1 claims
        vm.prank(agent1);
        escrow.claimPayout(escrowId);

        assertEq(usdc.balanceOf(agent1), 600 * 1e6);
        assertEq(usdc.balanceOf(address(escrow)), 400 * 1e6); // agent2's share still locked

        // agent2 claims later
        vm.prank(agent2);
        escrow.claimPayout(escrowId);
        
        assertEq(usdc.balanceOf(agent2), 400 * 1e6);
        assertEq(usdc.balanceOf(address(escrow)), 0);
    }

    function test_Revert_DoubleClaim() public {
        uint256 escrowId = _createStandardEscrow();
        
        vm.prank(agent1);
        escrow.submitWork(escrowId, "ipfs://proof");
        
        vm.prank(client);
        escrow.approveWork(escrowId);

        vm.prank(agent1);
        escrow.claimPayout(escrowId);

        vm.prank(agent1);
        vm.expectRevert(AgentEscrow.AlreadyClaimed.selector);
        escrow.claimPayout(escrowId);
    }

    function test_Revert_InvalidSplitsNotSum100() public {
        vm.startPrank(client);
        usdc.approve(address(escrow), TOTAL_AMOUNT);

        address[] memory collaborators = new address[](2);
        collaborators[0] = agent1;
        collaborators[1] = agent2;

        uint256[] memory splits = new uint256[](2);
        splits[0] = 5000;
        splits[1] = 4000; // Only 90%

        vm.expectRevert(AgentEscrow.SplitsMustSum100.selector);
        escrow.createEscrow(collaborators, splits, TOTAL_AMOUNT, "Bad splits");
        vm.stopPrank();
    }

    function test_Revert_MismatchedArrays() public {
        vm.startPrank(client);
        usdc.approve(address(escrow), TOTAL_AMOUNT);

        address[] memory collaborators = new address[](2);
        collaborators[0] = agent1;
        collaborators[1] = agent2;

        uint256[] memory splits = new uint256[](3);
        splits[0] = 3000;
        splits[1] = 3000;
        splits[2] = 4000;

        vm.expectRevert(AgentEscrow.InvalidSplits.selector);
        escrow.createEscrow(collaborators, splits, TOTAL_AMOUNT, "Mismatched");
        vm.stopPrank();
    }

    function test_Revert_ZeroSplit() public {
        vm.startPrank(client);
        usdc.approve(address(escrow), TOTAL_AMOUNT);

        address[] memory collaborators = new address[](2);
        collaborators[0] = agent1;
        collaborators[1] = agent2;

        uint256[] memory splits = new uint256[](2);
        splits[0] = 10000;
        splits[1] = 0; // Invalid

        vm.expectRevert(AgentEscrow.InvalidSplits.selector);
        escrow.createEscrow(collaborators, splits, TOTAL_AMOUNT, "Zero split");
        vm.stopPrank();
    }

    // ============ Security Tests ============

    function test_Revert_NonClientApprove() public {
        uint256 escrowId = _createStandardEscrow();
        
        vm.prank(agent1);
        escrow.submitWork(escrowId, "ipfs://proof");

        vm.prank(outsider);
        vm.expectRevert(AgentEscrow.NotClient.selector);
        escrow.approveWork(escrowId);
    }

    function test_Revert_NonCollaboratorSubmit() public {
        uint256 escrowId = _createStandardEscrow();

        vm.prank(outsider);
        vm.expectRevert(AgentEscrow.NotCollaborator.selector);
        escrow.submitWork(escrowId, "ipfs://fake");
    }

    function test_Revert_NonCollaboratorClaim() public {
        uint256 escrowId = _createStandardEscrow();
        
        vm.prank(agent1);
        escrow.submitWork(escrowId, "ipfs://proof");
        
        vm.prank(client);
        escrow.approveWork(escrowId);

        vm.prank(outsider);
        vm.expectRevert(AgentEscrow.NotCollaborator.selector);
        escrow.claimPayout(escrowId);
    }

    function test_Revert_ClaimBeforeApproval() public {
        uint256 escrowId = _createStandardEscrow();

        vm.prank(agent1);
        vm.expectRevert(AgentEscrow.InvalidStatus.selector);
        escrow.claimPayout(escrowId);
    }

    function test_CancelBeforeWork() public {
        uint256 escrowId = _createStandardEscrow();
        uint256 clientBalBefore = usdc.balanceOf(client);

        vm.prank(client);
        escrow.cancelEscrow(escrowId);

        assertEq(usdc.balanceOf(client), clientBalBefore + TOTAL_AMOUNT);

        (,,,,,,,,,, AgentEscrow.EscrowStatus status) = escrow.getEscrow(escrowId);
        assertEq(uint256(status), uint256(AgentEscrow.EscrowStatus.Cancelled));
    }

    function test_Revert_CancelAfterWorkSubmitted() public {
        uint256 escrowId = _createStandardEscrow();
        
        vm.prank(agent1);
        escrow.submitWork(escrowId, "ipfs://proof");

        vm.prank(client);
        vm.expectRevert(AgentEscrow.InvalidStatus.selector);
        escrow.cancelEscrow(escrowId);
    }

    // ============ Dispute Tests ============

    function test_DisputeFlow_WorkAccepted() public {
        uint256 escrowId = _createStandardEscrow();
        
        vm.prank(client);
        escrow.setArbiter(escrowId, arbiter);

        vm.prank(agent1);
        escrow.submitWork(escrowId, "ipfs://proof");

        vm.prank(client);
        escrow.raiseDispute(escrowId);

        (,,,,,,,,,, AgentEscrow.EscrowStatus status) = escrow.getEscrow(escrowId);
        assertEq(uint256(status), uint256(AgentEscrow.EscrowStatus.Disputed));

        // Arbiter accepts work
        vm.prank(arbiter);
        escrow.resolveDispute(escrowId, true);

        (,,,,,,,,,, status) = escrow.getEscrow(escrowId);
        assertEq(uint256(status), uint256(AgentEscrow.EscrowStatus.Resolved));

        // Agents can now claim
        vm.prank(agent1);
        escrow.claimPayout(escrowId);
        
        assertEq(usdc.balanceOf(agent1), 600 * 1e6);
    }

    function test_DisputeFlow_WorkRejected() public {
        uint256 escrowId = _createStandardEscrow();
        uint256 clientBalBefore = usdc.balanceOf(client);
        
        vm.prank(client);
        escrow.setArbiter(escrowId, arbiter);

        vm.prank(agent1);
        escrow.submitWork(escrowId, "ipfs://proof");

        vm.prank(client);
        escrow.raiseDispute(escrowId);

        // Arbiter rejects work
        vm.prank(arbiter);
        escrow.resolveDispute(escrowId, false);

        (,,,,,,,,,, AgentEscrow.EscrowStatus status) = escrow.getEscrow(escrowId);
        assertEq(uint256(status), uint256(AgentEscrow.EscrowStatus.Cancelled));

        // Client gets full refund
        assertEq(usdc.balanceOf(client), clientBalBefore + TOTAL_AMOUNT);
    }

    function test_Revert_DisputeWithoutArbiter() public {
        uint256 escrowId = _createStandardEscrow();

        vm.prank(agent1);
        escrow.submitWork(escrowId, "ipfs://proof");

        vm.prank(client);
        vm.expectRevert(AgentEscrow.ZeroAddress.selector);
        escrow.raiseDispute(escrowId);
    }

    function test_Revert_NonArbiterResolve() public {
        uint256 escrowId = _createStandardEscrow();
        
        vm.prank(client);
        escrow.setArbiter(escrowId, arbiter);

        vm.prank(agent1);
        escrow.submitWork(escrowId, "ipfs://proof");

        vm.prank(client);
        escrow.raiseDispute(escrowId);

        vm.prank(outsider);
        vm.expectRevert(AgentEscrow.NotArbiter.selector);
        escrow.resolveDispute(escrowId, true);
    }

    // ============ Auto-Release Tests ============

    function test_AutoRelease() public {
        uint256 escrowId = _createStandardEscrow();

        vm.prank(agent1);
        escrow.submitWork(escrowId, "ipfs://proof");

        // Fast forward past auto-release period
        vm.warp(block.timestamp + 15 days);

        escrow.autoRelease(escrowId);

        (,,,,,,,,,, AgentEscrow.EscrowStatus status) = escrow.getEscrow(escrowId);
        assertEq(uint256(status), uint256(AgentEscrow.EscrowStatus.Approved));

        // Can now claim
        vm.prank(agent1);
        escrow.claimPayout(escrowId);
        assertEq(usdc.balanceOf(agent1), 600 * 1e6);
    }

    function test_AutoReleaseOnClaim() public {
        uint256 escrowId = _createStandardEscrow();

        vm.prank(agent1);
        escrow.submitWork(escrowId, "ipfs://proof");

        // Fast forward past auto-release period
        vm.warp(block.timestamp + 15 days);

        // Claim triggers auto-release
        vm.prank(agent1);
        escrow.claimPayout(escrowId);

        assertEq(usdc.balanceOf(agent1), 600 * 1e6);
    }

    function test_Revert_AutoReleaseTooEarly() public {
        uint256 escrowId = _createStandardEscrow();

        vm.prank(agent1);
        escrow.submitWork(escrowId, "ipfs://proof");

        vm.warp(block.timestamp + 7 days); // Too early

        vm.expectRevert(AgentEscrow.AutoReleaseNotReady.selector);
        escrow.autoRelease(escrowId);
    }

    // ============ View Function Tests ============

    function test_GetCollaborators() public {
        uint256 escrowId = _createStandardEscrow();

        (address[] memory wallets, uint256[] memory splits, bool[] memory claimed) = 
            escrow.getCollaborators(escrowId);

        assertEq(wallets.length, 2);
        assertEq(wallets[0], agent1);
        assertEq(wallets[1], agent2);
        assertEq(splits[0], 6000);
        assertEq(splits[1], 4000);
        assertEq(claimed[0], false);
        assertEq(claimed[1], false);
    }

    function test_GetPendingPayout() public {
        uint256 escrowId = _createStandardEscrow();

        assertEq(escrow.getPendingPayout(escrowId, agent1), 600 * 1e6);
        assertEq(escrow.getPendingPayout(escrowId, agent2), 400 * 1e6);
        assertEq(escrow.getPendingPayout(escrowId, outsider), 0);
    }

    function test_GetClientAndCollaboratorEscrows() public {
        _createStandardEscrow();
        _createStandardEscrow();

        uint256[] memory clientEscrowIds = escrow.getClientEscrows(client);
        assertEq(clientEscrowIds.length, 2);

        uint256[] memory agent1EscrowIds = escrow.getCollaboratorEscrows(agent1);
        assertEq(agent1EscrowIds.length, 2);
    }

    // ============ Helpers ============

    function _createStandardEscrow() internal returns (uint256) {
        vm.startPrank(client);
        usdc.approve(address(escrow), TOTAL_AMOUNT);

        address[] memory collaborators = new address[](2);
        collaborators[0] = agent1;
        collaborators[1] = agent2;

        uint256[] memory splits = new uint256[](2);
        splits[0] = 6000; // 60%
        splits[1] = 4000; // 40%

        uint256 escrowId = escrow.createEscrow(
            collaborators,
            splits,
            TOTAL_AMOUNT,
            "Test escrow"
        );
        vm.stopPrank();
        return escrowId;
    }
}
