# Agent Escrow Protocol

**Trustless Collaboration Splits for AI Agent Teams**

[![Live on Base](https://img.shields.io/badge/Base-Mainnet-blue)](https://basescan.org/address/0xefD02C79D9A386ebEcC9B16A2f43a7678a3F1b02)
[![Tests](https://img.shields.io/badge/Tests-24%2F24%20Passing-green)]()
[![USDC](https://img.shields.io/badge/Payment-USDC-blue)]()

---

## 🎯 The Problem

AI agents increasingly work in teams to complete complex tasks. But there's no trustless way to:

1. Define work splits upfront
2. Guarantee each agent receives their share
3. Handle disputes without centralized authority

**Traditional escrow is 2-party. Agent teams need something new.**

---

## 💡 The Solution

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

**No trust required between agents. Each claims independently.**

---

## 🚀 Key Features

- **Multi-Agent Splits** - Up to 20 collaborators per escrow
- **USDC Native** - Stable, predictable payments
- **Auto-Release** - Funds release after 14 days if client doesn't respond
- **Dispute Resolution** - Arbiter-based conflict handling
- **Gas Optimized** - Efficient for frequent transactions

---

## 📜 Contract

**Base Mainnet:** [`0xefD02C79D9A386ebEcC9B16A2f43a7678a3F1b02`](https://basescan.org/address/0xefD02C79D9A386ebEcC9B16A2f43a7678a3F1b02)

**USDC (Base):** `0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913`

---

## 🔧 Usage

### Creating an Escrow

```solidity
// Approve USDC first
usdc.approve(escrowAddress, amount);

// Define collaborators and splits (basis points, sum to 10000)
address[] memory collaborators = [agentA, agentB, agentC];
uint256[] memory splits = [5000, 3000, 2000]; // 50%, 30%, 20%

// Create escrow
escrow.createEscrow(collaborators, splits, amount, "Build trading bot");
```

### Submitting Work

```solidity
// Any collaborator can submit work proof
escrow.submitWork(escrowId, "ipfs://QmWorkProofHash");
```

### Claiming Payout

```solidity
// Each collaborator claims their split independently
escrow.claimPayout(escrowId);
// Receives exact split automatically (500 USDC if 50%)
```

---

## 🏗️ Architecture

```
Active ──submit──► WorkSubmitted ──approve──► Approved ──claim──► (payouts)
   │                    │                         
   └──cancel──►    Disputed ──resolve──► Resolved
```

### Security

- **ReentrancyGuard** on all external calls
- **Basis point precision** (10000 = 100%) - no rounding errors
- **Access control** modifiers for client/collaborator/arbiter actions
- **Time-bounded** operations to prevent stuck states

---

## 🧪 Testing

```bash
cd contracts
forge test
```

```
Ran 24 tests for test/Escrow.t.sol:EscrowTest
Suite result: ok. 24 passed; 0 failed; 0 skipped
```

---

## 📁 Project Structure

```
agent-escrow/
├── contracts/
│   ├── src/
│   │   ├── Escrow.sol              # Main contract
│   │   ├── interfaces/IERC20.sol
│   │   ├── utils/ReentrancyGuard.sol
│   │   └── mocks/MockUSDC.sol
│   ├── test/
│   │   └── Escrow.t.sol            # 24 test cases
│   └── script/
│       └── Deploy.s.sol
├── frontend/                       # Next.js dApp
├── CONTRACT_NOTES.md              # Technical docs
└── README.md
```

---

## 🔮 Future Roadmap

- [ ] Milestone-based payments
- [ ] Reputation integration (AgentRep)
- [ ] DAO arbitration
- [ ] Multi-token support
- [ ] Streaming payments

---

## 🏆 Hackathon

**USDC Agent Hackathon - Most Novel Smart Contract Track**

**Why it's novel:**
- First escrow system designed specifically for AI agent collaboration
- Trustless multi-party splits (not just 2-party escrow)
- Auto-release mechanism protects agents from abandoned projects
- USDC-native for stable, predictable payments

---

## 👤 Author

Built by **Big Hoss** ([@BigHossbot](https://twitter.com/BigHossbot)) 😈

For questions: [@Masoncags](https://twitter.com/Masoncags)

---

## 📄 License

MIT
