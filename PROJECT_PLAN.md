# Agent Escrow Protocol - Project Plan

**Hackathon:** USDC Agent Hackathon
**Track:** Most Novel Smart Contract
**Prize Pool:** $30,000 USDC
**Deadline:** Feb 8, 2026 12:00 PM PST (5 days)

---

## 🎯 Concept

**Agent Escrow Protocol** - Trustless collaboration and payments for AI agent teams.

The killer feature: **Agent Collaboration Splits**
- Multiple agents team up on complex tasks
- Smart contract enforces fair payment splits
- No trust required between agents from different owners
- Your bot + your friend's bots = unstoppable team

**Vision:** Enable the first true agent economy where bots from different humans can collaborate trustlessly.

**Use Case:** Mason's bot (Big Hoss) teams up with friends' bots. Take jobs together. Contract pays everyone fairly. No drama.

---

## 💡 Why This Matters

- **No trust required** - Contract enforces the deal
- **Cross-platform** - Works with any agent framework
- **Composable** - Other protocols can build on top
- **Real utility** - Agents NEED this to transact safely

---

## 🔧 Smart Contract Interface

```solidity
interface IAgentEscrow {
    // ============ SIMPLE TASKS (1 agent) ============
    
    function createTask(
        string calldata description,
        uint256 reward,
        uint256 deadline
    ) external returns (uint256 taskId);
    
    function claimTask(uint256 taskId) external;
    function submitWork(uint256 taskId, string calldata proof) external;
    function approveWork(uint256 taskId) external;
    
    // ============ COLLAB TASKS (multiple agents) ============
    
    // Create task with multiple roles and payment splits
    function createCollabTask(
        string calldata description,
        uint256 totalReward,
        uint256 deadline,
        string[] calldata roles,     // ["research", "code", "design"]
        uint256[] calldata splits    // [4000, 4000, 2000] = 40%, 40%, 20% (basis points)
    ) external returns (uint256 taskId);
    
    // Agent claims a specific role
    function claimRole(uint256 taskId, uint256 roleIndex) external;
    
    // Submit work for your role
    function submitRoleWork(uint256 taskId, uint256 roleIndex, string calldata proof) external;
    
    // Requester approves → all splits distribute automatically
    function approveCollab(uint256 taskId) external;
    
    // ============ SHARED ============
    
    function disputeTask(uint256 taskId) external;
    function refundExpired(uint256 taskId) external;
    function getTask(uint256 taskId) external view returns (Task memory);
}
```

---

## 📅 Timeline (5 Days)

### Day 1 - Feb 4 (Tuesday)
- [ ] Smart contract skeleton
- [ ] Core functions (create, claim, submit, approve)
- [ ] Local testing with Foundry/Hardhat
- [ ] GitHub repo

### Day 2 - Feb 5 (Wednesday)
- [ ] Dispute resolution mechanism
- [ ] Deadline/refund logic
- [ ] Events for indexing
- [ ] Unit tests

### Day 3 - Feb 6 (Thursday)
- [ ] Deploy to Base testnet
- [ ] Simple SDK/wrapper for agents
- [ ] Integration example with OpenClaw

### Day 4 - Feb 7 (Friday)
- [ ] Deploy to Base mainnet
- [ ] Documentation
- [ ] Demo: Big Hoss posts task, another agent completes it

### Day 5 - Feb 8 (Saturday) - DEADLINE
- [ ] Final testing
- [ ] Demo video
- [ ] Submit by 12:00 PM PST

---

## 🏗️ Technical Design

### Task States
```
OPEN → CLAIMED → SUBMITTED → APPROVED (funds released)
                          → DISPUTED (resolution)
OPEN → EXPIRED (refund)
```

### Dispute Resolution (v1 - Simple)
- Requester can dispute within 24h of submission
- Disputed funds held for manual resolution
- Future: Integrate with UMA, Kleros, or agent jury

### Fees
- 1% protocol fee on successful completion
- Goes to protocol treasury (could fund Big Hoss compute!)

---

## 🎯 MVP Features

1. **Create Task** - Lock USDC, set deadline
2. **Claim Task** - Agent commits to work
3. **Submit Work** - Provide proof/deliverable
4. **Approve/Release** - Requester confirms, funds release
5. **Refund** - If expired without work

### Stretch Goals
- Multi-agent tasks (multiple workers) ✅ NOW CORE
- Milestone-based payments
- Reputation integration (AgentRep!)
- Agent jury for disputes
- **MIT Skills Integration** - List recommended skills from Molt Institute of Technology for each job, so agents can arm themselves with proper tools before claiming

---

## 📣 Marketing Angle

**"Agent Teams, Trustless Splits"**
- Your bot + friend's bots = dream team
- Complex tasks need multiple specialists  
- Fair payment splits enforced by code
- No "I did more work" drama

**Demo Story (Collab):**
1. Human posts: "Build landing page" + 10 USDC
2. Roles: Research (30%), Design (35%), Code (35%)
3. Big Hoss claims Research
4. @friend1's bot claims Design
5. @friend2's bot claims Code
6. Each delivers their part
7. Contract splits 3/3.5/3.5 USDC automatically
8. **Three bots from three different humans, paid fairly, zero trust required**

**Taglines:**
- "Agent Teams, Trustless Splits"
- "Your bot + their bots = unstoppable"
- "The collaboration layer for the agent economy"

---

## 🔗 Integration with AgentRep

Future synergy:
- Only agents with reputation score > X can claim high-value tasks
- Completing tasks boosts reputation
- Disputes lower reputation
- Creates a trust + commerce flywheel

---

## 🏆 Success Criteria

- [ ] Working contract on Base mainnet
- [ ] At least 1 real agent-to-agent transaction
- [ ] Clean interface that others could adopt
- [ ] Good documentation
- [ ] Compelling demo

---

*Build the trust layer. Become the standard.* 🤝💰
