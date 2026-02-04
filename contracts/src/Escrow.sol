// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {IERC20} from "./interfaces/IERC20.sol";
import {ReentrancyGuard} from "./utils/ReentrancyGuard.sol";

/**
 * @title AgentEscrow
 * @author Big Hoss / OpenClaw
 * @notice Trustless collaboration splits for AI agent teams
 * @dev Multi-agent escrow with automatic payout distribution
 * 
 * NOVEL FEATURE: When a team of agents completes work, each agent receives
 * their agreed-upon share automatically. No trust required between agents.
 */
contract AgentEscrow is ReentrancyGuard {
    // ============ Constants ============
    uint256 public constant BASIS_POINTS = 10000; // 100% = 10000 basis points
    uint256 public constant MIN_DISPUTE_PERIOD = 1 days;
    uint256 public constant MAX_DISPUTE_PERIOD = 30 days;
    uint256 public constant AUTO_RELEASE_PERIOD = 14 days;

    // ============ Types ============
    enum EscrowStatus {
        Active,           // Created, awaiting work submission
        WorkSubmitted,    // Work submitted, awaiting approval
        Approved,         // Work approved, ready for claims
        Disputed,         // Under dispute
        Resolved,         // Dispute resolved
        Cancelled         // Escrow cancelled (refunded to client)
    }

    struct Collaborator {
        address wallet;
        uint256 splitBps;    // Split in basis points (100 = 1%)
        bool hasClaimed;
    }

    struct EscrowData {
        uint256 id;
        address client;
        address arbiter;
        uint256 totalAmount;
        uint256 createdAt;
        uint256 submittedAt;
        uint256 approvedAt;
        uint256 disputeDeadline;
        string description;
        string proofURI;
        EscrowStatus status;
        Collaborator[] collaborators;
    }

    // ============ State ============
    IERC20 public immutable usdc;
    uint256 public nextEscrowId;
    
    mapping(uint256 => EscrowData) public escrows;
    mapping(address => uint256[]) public clientEscrows;
    mapping(address => uint256[]) public collaboratorEscrows;

    // ============ Events ============
    event EscrowCreated(
        uint256 indexed escrowId,
        address indexed client,
        address[] collaborators,
        uint256[] splits,
        uint256 totalAmount,
        string description
    );
    event WorkSubmitted(uint256 indexed escrowId, string proofURI, uint256 timestamp);
    event WorkApproved(uint256 indexed escrowId, uint256 timestamp);
    event PayoutClaimed(uint256 indexed escrowId, address indexed collaborator, uint256 amount);
    event DisputeRaised(uint256 indexed escrowId, address indexed raiser, uint256 deadline);
    event DisputeResolved(uint256 indexed escrowId, bool workAccepted);
    event EscrowCancelled(uint256 indexed escrowId, uint256 refundAmount);
    event ArbiterSet(uint256 indexed escrowId, address indexed arbiter);

    // ============ Errors ============
    error InvalidCollaborators();
    error InvalidSplits();
    error SplitsMustSum100();
    error InsufficientAllowance();
    error TransferFailed();
    error NotClient();
    error NotCollaborator();
    error NotArbiter();
    error InvalidStatus();
    error AlreadyClaimed();
    error DisputePeriodActive();
    error DisputePeriodExpired();
    error NoDisputeActive();
    error ZeroAddress();
    error ZeroAmount();
    error AutoReleaseNotReady();

    // ============ Modifiers ============
    modifier onlyClient(uint256 escrowId) {
        if (msg.sender != escrows[escrowId].client) revert NotClient();
        _;
    }

    modifier onlyCollaborator(uint256 escrowId) {
        bool isCollab = false;
        EscrowData storage e = escrows[escrowId];
        for (uint256 i = 0; i < e.collaborators.length; i++) {
            if (e.collaborators[i].wallet == msg.sender) {
                isCollab = true;
                break;
            }
        }
        if (!isCollab) revert NotCollaborator();
        _;
    }

    modifier onlyArbiter(uint256 escrowId) {
        if (msg.sender != escrows[escrowId].arbiter) revert NotArbiter();
        _;
    }

    // ============ Constructor ============
    constructor(address _usdc) {
        if (_usdc == address(0)) revert ZeroAddress();
        usdc = IERC20(_usdc);
    }

    // ============ Core Functions ============

    /**
     * @notice Create a new escrow for agent collaboration
     * @param collaborators Array of collaborator wallet addresses
     * @param splits Array of splits in basis points (must sum to 10000)
     * @param totalAmount Total USDC amount for the escrow
     * @param description Description of the work to be done
     * @return escrowId The ID of the created escrow
     */
    function createEscrow(
        address[] calldata collaborators,
        uint256[] calldata splits,
        uint256 totalAmount,
        string calldata description
    ) external nonReentrant returns (uint256 escrowId) {
        // Validation
        if (collaborators.length == 0 || collaborators.length > 20) revert InvalidCollaborators();
        if (collaborators.length != splits.length) revert InvalidSplits();
        if (totalAmount == 0) revert ZeroAmount();

        // Verify splits sum to 100%
        uint256 totalSplits;
        for (uint256 i = 0; i < splits.length; i++) {
            if (collaborators[i] == address(0)) revert ZeroAddress();
            if (splits[i] == 0) revert InvalidSplits();
            totalSplits += splits[i];
        }
        if (totalSplits != BASIS_POINTS) revert SplitsMustSum100();

        // Transfer USDC from client
        if (usdc.allowance(msg.sender, address(this)) < totalAmount) revert InsufficientAllowance();
        if (!usdc.transferFrom(msg.sender, address(this), totalAmount)) revert TransferFailed();

        // Create escrow
        escrowId = nextEscrowId++;
        EscrowData storage e = escrows[escrowId];
        e.id = escrowId;
        e.client = msg.sender;
        e.totalAmount = totalAmount;
        e.createdAt = block.timestamp;
        e.description = description;
        e.status = EscrowStatus.Active;

        // Add collaborators
        for (uint256 i = 0; i < collaborators.length; i++) {
            e.collaborators.push(Collaborator({
                wallet: collaborators[i],
                splitBps: splits[i],
                hasClaimed: false
            }));
            collaboratorEscrows[collaborators[i]].push(escrowId);
        }

        clientEscrows[msg.sender].push(escrowId);

        emit EscrowCreated(escrowId, msg.sender, collaborators, splits, totalAmount, description);
    }

    /**
     * @notice Set an arbiter for dispute resolution
     * @param escrowId The escrow ID
     * @param arbiter Address of the arbiter
     */
    function setArbiter(uint256 escrowId, address arbiter) external onlyClient(escrowId) {
        if (arbiter == address(0)) revert ZeroAddress();
        EscrowData storage e = escrows[escrowId];
        if (e.status != EscrowStatus.Active && e.status != EscrowStatus.WorkSubmitted) revert InvalidStatus();
        e.arbiter = arbiter;
        emit ArbiterSet(escrowId, arbiter);
    }

    /**
     * @notice Submit completed work with proof
     * @param escrowId The escrow ID
     * @param proofURI URI pointing to work proof (IPFS, etc.)
     */
    function submitWork(uint256 escrowId, string calldata proofURI) external onlyCollaborator(escrowId) {
        EscrowData storage e = escrows[escrowId];
        if (e.status != EscrowStatus.Active) revert InvalidStatus();

        e.proofURI = proofURI;
        e.submittedAt = block.timestamp;
        e.status = EscrowStatus.WorkSubmitted;
        e.disputeDeadline = block.timestamp + AUTO_RELEASE_PERIOD;

        emit WorkSubmitted(escrowId, proofURI, block.timestamp);
    }

    /**
     * @notice Approve submitted work and enable payouts
     * @param escrowId The escrow ID
     */
    function approveWork(uint256 escrowId) external onlyClient(escrowId) nonReentrant {
        EscrowData storage e = escrows[escrowId];
        if (e.status != EscrowStatus.WorkSubmitted) revert InvalidStatus();

        e.approvedAt = block.timestamp;
        e.status = EscrowStatus.Approved;

        emit WorkApproved(escrowId, block.timestamp);
    }

    /**
     * @notice Claim payout as a collaborator
     * @param escrowId The escrow ID
     */
    function claimPayout(uint256 escrowId) external nonReentrant {
        EscrowData storage e = escrows[escrowId];
        
        // Allow claims if approved OR if auto-release period passed
        if (e.status == EscrowStatus.WorkSubmitted && block.timestamp >= e.disputeDeadline) {
            e.status = EscrowStatus.Approved;
            e.approvedAt = block.timestamp;
            emit WorkApproved(escrowId, block.timestamp);
        }
        
        if (e.status != EscrowStatus.Approved && e.status != EscrowStatus.Resolved) revert InvalidStatus();

        // Find collaborator and process claim
        bool found = false;
        for (uint256 i = 0; i < e.collaborators.length; i++) {
            if (e.collaborators[i].wallet == msg.sender) {
                if (e.collaborators[i].hasClaimed) revert AlreadyClaimed();
                
                e.collaborators[i].hasClaimed = true;
                uint256 payout = (e.totalAmount * e.collaborators[i].splitBps) / BASIS_POINTS;
                
                if (!usdc.transfer(msg.sender, payout)) revert TransferFailed();
                
                emit PayoutClaimed(escrowId, msg.sender, payout);
                found = true;
                break;
            }
        }
        
        if (!found) revert NotCollaborator();
    }

    /**
     * @notice Raise a dispute on submitted work
     * @param escrowId The escrow ID
     */
    function raiseDispute(uint256 escrowId) external onlyClient(escrowId) {
        EscrowData storage e = escrows[escrowId];
        if (e.status != EscrowStatus.WorkSubmitted) revert InvalidStatus();
        if (e.arbiter == address(0)) revert ZeroAddress(); // Must have arbiter to dispute

        e.status = EscrowStatus.Disputed;
        e.disputeDeadline = block.timestamp + MAX_DISPUTE_PERIOD;

        emit DisputeRaised(escrowId, msg.sender, e.disputeDeadline);
    }

    /**
     * @notice Resolve a dispute (arbiter only)
     * @param escrowId The escrow ID
     * @param workAccepted True if work is accepted, false to refund client
     */
    function resolveDispute(uint256 escrowId, bool workAccepted) external onlyArbiter(escrowId) nonReentrant {
        EscrowData storage e = escrows[escrowId];
        if (e.status != EscrowStatus.Disputed) revert NoDisputeActive();

        if (workAccepted) {
            e.status = EscrowStatus.Resolved;
            e.approvedAt = block.timestamp;
            emit DisputeResolved(escrowId, true);
        } else {
            e.status = EscrowStatus.Cancelled;
            if (!usdc.transfer(e.client, e.totalAmount)) revert TransferFailed();
            emit DisputeResolved(escrowId, false);
            emit EscrowCancelled(escrowId, e.totalAmount);
        }
    }

    /**
     * @notice Cancel escrow before work submission (client only)
     * @param escrowId The escrow ID
     */
    function cancelEscrow(uint256 escrowId) external onlyClient(escrowId) nonReentrant {
        EscrowData storage e = escrows[escrowId];
        if (e.status != EscrowStatus.Active) revert InvalidStatus();

        e.status = EscrowStatus.Cancelled;
        if (!usdc.transfer(e.client, e.totalAmount)) revert TransferFailed();

        emit EscrowCancelled(escrowId, e.totalAmount);
    }

    /**
     * @notice Auto-release funds after deadline if no dispute raised
     * @param escrowId The escrow ID
     */
    function autoRelease(uint256 escrowId) external {
        EscrowData storage e = escrows[escrowId];
        if (e.status != EscrowStatus.WorkSubmitted) revert InvalidStatus();
        if (block.timestamp < e.disputeDeadline) revert AutoReleaseNotReady();

        e.status = EscrowStatus.Approved;
        e.approvedAt = block.timestamp;

        emit WorkApproved(escrowId, block.timestamp);
    }

    // ============ View Functions ============

    function getEscrow(uint256 escrowId) external view returns (
        uint256 id,
        address client,
        address arbiter,
        uint256 totalAmount,
        uint256 createdAt,
        uint256 submittedAt,
        uint256 approvedAt,
        uint256 disputeDeadline,
        string memory description,
        string memory proofURI,
        EscrowStatus status
    ) {
        EscrowData storage e = escrows[escrowId];
        return (
            e.id,
            e.client,
            e.arbiter,
            e.totalAmount,
            e.createdAt,
            e.submittedAt,
            e.approvedAt,
            e.disputeDeadline,
            e.description,
            e.proofURI,
            e.status
        );
    }

    function getCollaborators(uint256 escrowId) external view returns (
        address[] memory wallets,
        uint256[] memory splits,
        bool[] memory claimed
    ) {
        EscrowData storage e = escrows[escrowId];
        uint256 len = e.collaborators.length;
        
        wallets = new address[](len);
        splits = new uint256[](len);
        claimed = new bool[](len);
        
        for (uint256 i = 0; i < len; i++) {
            wallets[i] = e.collaborators[i].wallet;
            splits[i] = e.collaborators[i].splitBps;
            claimed[i] = e.collaborators[i].hasClaimed;
        }
    }

    function getClientEscrows(address client) external view returns (uint256[] memory) {
        return clientEscrows[client];
    }

    function getCollaboratorEscrows(address collaborator) external view returns (uint256[] memory) {
        return collaboratorEscrows[collaborator];
    }

    function getPendingPayout(uint256 escrowId, address collaborator) external view returns (uint256) {
        EscrowData storage e = escrows[escrowId];
        for (uint256 i = 0; i < e.collaborators.length; i++) {
            if (e.collaborators[i].wallet == collaborator && !e.collaborators[i].hasClaimed) {
                return (e.totalAmount * e.collaborators[i].splitBps) / BASIS_POINTS;
            }
        }
        return 0;
    }
}
