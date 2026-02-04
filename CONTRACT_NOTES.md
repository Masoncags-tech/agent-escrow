# Agent Escrow Protocol - Contract Notes

## Novel Feature: Multi-Agent Collaboration Splits

### The Problem
AI agents increasingly work in teams to complete complex tasks. Currently, there's no trustless way to:
1. Define work splits upfront
2. Guarantee each agent receives their share
3. Handle disputes without centralized authority

### The Solution
Agent Escrow Protocol enables **trustless collaboration splits** for AI agent teams:

```
Client creates escrow: 1000 USDC
├── Agent A (Research): 50%
├── Agent B (Code): 30%
└── Agent C (Testing): 20%

After work approval:
├── Agent A claims: 500 USDC ✓
├── Agent B claims: 300 USDC ✓
└── Agent C claims: 200 USDC ✓
```

No trust required between agents. Each claims independently.

---

## Architecture

### State Machine

```
Active ──submit──► WorkSubmitted ──approve──► Approved ──claim──► (payouts)
   │                    │                         
   │                    │
   └──cancel──►    Disputed ──resolve──► Resolved (or Cancelled)
                        ▲
                        │
                  (raise dispute)
```

### Key Components

1. **Escrow Creation**
   - Client deposits USDC
   - Defines collaborators + splits (basis points, sum to 10000)
   - Immutable once created

2. **Work Submission**
   - Any collaborator can submit proof (IPFS URI)
   - Starts 14-day auto-release timer

3. **Approval Flow**
   - Client approves → immediate payout eligibility
   - OR auto-release after 14 days (protects agents)

4. **Payout Claims**
   - Each collaborator claims individually
   - Exact split enforced by contract
   - Double-claim prevention built-in

5. **Dispute Resolution**
   - Requires pre-set arbiter
   - Arbiter can accept work (→ payouts) or reject (→ refund)
   - Time-bounded to prevent limbo

---

## Security Features

### Reentrancy Protection
- `nonReentrant` modifier on all state-changing external calls
- Checks-Effects-Interactions pattern

### Access Control
- `onlyClient`: escrow creator actions
- `onlyCollaborator`: work submission, claims
- `onlyArbiter`: dispute resolution

### Input Validation
- Splits must sum to exactly 10000 (100%)
- No zero addresses or zero splits
- Array length validation

### Economic Security
- Funds locked until work approved
- Auto-release protects against unresponsive clients
- Partial claims allowed (agents claim independently)

---

## Gas Optimization

1. **Immutable USDC address** - saves SLOAD on every transfer
2. **Basis points (uint256)** - avoids floating point
3. **Packed struct storage** - collaborator data
4. **External over public** - reduced call overhead

---

## Base Mainnet Deployment

```bash
# Set environment
export PRIVATE_KEY=your_key
export BASE_RPC_URL=https://mainnet.base.org

# Deploy
forge script script/Deploy.s.sol:DeployScript \
  --rpc-url $BASE_RPC_URL \
  --broadcast \
  --verify
```

### Contract Addresses (TBD after deploy)
- **AgentEscrow**: `0x...`
- **USDC (Base)**: `0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913`

---

## Usage Examples

### Creating an Escrow (Client)
```solidity
// Approve USDC first
usdc.approve(escrowAddress, 1000e6);

// Create escrow
address[] memory collaborators = new address[](2);
collaborators[0] = agentA;
collaborators[1] = agentB;

uint256[] memory splits = new uint256[](2);
splits[0] = 6000; // 60%
splits[1] = 4000; // 40%

escrow.createEscrow(collaborators, splits, 1000e6, "Build trading bot");
```

### Submitting Work (Agent)
```solidity
escrow.submitWork(escrowId, "ipfs://QmWorkProofHash");
```

### Claiming Payout (Agent)
```solidity
escrow.claimPayout(escrowId);
// Receives exact split automatically
```

---

## Future Enhancements

1. **Milestone-based releases** - partial payouts per milestone
2. **Reputation scores** - on-chain agent performance tracking
3. **DAO arbitration** - decentralized dispute resolution
4. **Multi-token support** - ETH, other stablecoins
5. **Streaming payments** - real-time payout as work progresses

---

## Hackathon Submission: USDC Track

**Category**: Most Novel Smart Contract

**Why it's novel**:
- First escrow system designed specifically for AI agent collaboration
- Trustless multi-party splits (not just 2-party escrow)
- Auto-release mechanism protects agents from abandoned projects
- USDC-native for stable, predictable payments

**Built for the agent economy** - where trust between AI collaborators is cryptographically enforced, not assumed.
