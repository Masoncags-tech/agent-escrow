# Brand Identity: Agent Escrow Protocol

---

## Part 1: Brand Essence

### The Emotional Promise

**Primary Emotion: Confident Trust**

When users interact with Agent Escrow, they should feel:
- **Secure** — "My funds are protected by code, not promises"
- **Empowered** — "I can collaborate without worrying about getting paid"
- **Clear** — "I understand exactly what's happening"
- **Modern** — "This is the future of work"

### Brand Personality

Agent Escrow is:
- **Professional** but not corporate
- **Technical** but accessible
- **Trustworthy** but not boring
- **Modern** but not trendy
- **Confident** but not arrogant

### Voice & Tone

#### Writing Style:
- Clear and direct
- Active voice
- Present tense
- Technical accuracy with plain English explanations

#### Examples:

| ❌ Don't Say | ✅ Do Say |
|-------------|----------|
| "Your transaction is being processed on-chain" | "Creating your escrow..." |
| "Funds have been successfully transferred" | "Done! Funds sent." |
| "Please ensure your wallet contains sufficient..." | "You need 10 USDC" |
| "The smart contract will automatically execute..." | "Payouts release automatically" |

### Key Differentiators

1. **Multi-Party Focus** — Not just 2-party escrow, built for teams
2. **Agent-Native** — Designed with AI agents in mind
3. **USDC Stability** — No volatile crypto, predictable payments
4. **Auto-Release** — Protects workers from abandoned projects
5. **Trustless** — Code enforces fairness, not handshakes

### Taglines (Options)

- "Trustless Collaboration for AI Teams" ← Current
- "Fair Splits, Enforced by Code"
- "Work Together. Get Paid Fairly."
- "Multi-Agent Escrow. Zero Trust Required."
- "Collaboration Without Compromise"

**Recommended Primary:** "Fair Splits, Enforced by Code"
**Recommended Secondary:** "Trustless collaboration for AI agent teams"

---

## Part 2: Visual Identity

### Color Palette

#### Primary Colors

| Color | Hex | Usage |
|-------|-----|-------|
| **Deep Space** | `#0a0a0f` | Background |
| **White** | `#fafafa` | Primary text |
| **Protocol Blue** | `#3b82f6` | Primary actions, links |
| **Cyan Accent** | `#06b6d4` | Gradients, highlights |

#### Semantic Colors

| Color | Hex | Usage |
|-------|-----|-------|
| **Success Green** | `#22c55e` | Approved, claimed, success |
| **Warning Amber** | `#f59e0b` | Pending, work submitted |
| **Error Red** | `#ef4444` | Disputed, errors |
| **Neutral Gray** | `#71717a` | Muted text, disabled |

#### Rationale

**Why Dark Mode?**
- Crypto/DeFi industry standard
- Reduces eye strain for extended use
- Creates premium, sophisticated feel
- High contrast for accessibility

**Why Blue?**
- Trust and reliability (banking, security)
- Technical competence (developer tools)
- Pairs well with dark backgrounds
- Differentiates from green (DeFi) and purple (NFT) dominated crypto

**The Blue-Cyan Gradient**
- Creates visual interest without being overwhelming
- Suggests flow (money moving, progress)
- Modern, tech-forward feel
- Subtle enough for professional contexts

### Typography

#### Font Stack

**Primary Font: Inter**
- Clean, modern sans-serif
- Excellent readability at all sizes
- Open source, widely supported
- Used by: Linear, Vercel, many modern apps

```css
font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
```

**Monospace Font: JetBrains Mono**
- For addresses, IDs, amounts
- Clear distinction between similar characters (0/O, 1/l)
- Technical credibility

```css
font-family: 'JetBrains Mono', 'Fira Code', 'Consolas', monospace;
```

#### Type Scale

| Element | Size | Weight | Line Height |
|---------|------|--------|-------------|
| Hero Title | 56px / 3.5rem | 700 | 1.1 |
| Section Title | 32px / 2rem | 600 | 1.2 |
| Card Title | 20px / 1.25rem | 600 | 1.3 |
| Body | 16px / 1rem | 400 | 1.5 |
| Small/Caption | 14px / 0.875rem | 400 | 1.4 |
| Tiny | 12px / 0.75rem | 500 | 1.3 |

### Logo Concepts

#### Concept 1: The Shield Split (Recommended)

**Description:**
A minimalist shield shape divided into three sections (representing multi-party collaboration), with a subtle upward arrow implied by the negative space (representing value flowing to collaborators).

**Elements:**
- Shield silhouette = Security, trust, protection
- Three sections = Multi-party, collaboration
- Clean lines = Modern, technical
- Blue gradient fill = Protocol brand

**Variations:**
- Full color (gradient)
- Single color (blue or white)
- Icon only
- Icon + wordmark

#### Concept 2: The Flow Mark

**Description:**
Abstract representation of value flowing from one source to multiple destinations. Three curved lines originating from a single point, each ending in a small node.

**Elements:**
- Single source = Client funding escrow
- Multiple endpoints = Collaborators receiving splits
- Flowing lines = Smooth, trustless distribution
- Nodes = Distinct parties

#### Concept 3: The Lock & Key

**Description:**
A stylized lock with multiple keyholes, representing how only the right conditions (approval) unlock funds for multiple parties.

**Elements:**
- Lock = Security
- Multiple keyholes = Multi-access
- Unlocked position for "Approved" state

### Iconography Style

**Characteristics:**
- Stroke-based (2px weight)
- Rounded corners
- Minimal detail
- Consistent 24px canvas

**Icon Library:** Lucide React (current choice is good)
- Open source
- Consistent style
- Comprehensive set

**Custom Icons Needed:**
- Escrow status icons (custom for each state)
- Split/distribution icon
- Agent icon (robot + handshake?)

### Spacing System

8px base unit:
- 4px (0.25rem) — Tight
- 8px (0.5rem) — Compact
- 12px (0.75rem) — Default inner
- 16px (1rem) — Default outer
- 24px (1.5rem) — Loose
- 32px (2rem) — Section gap
- 48px (3rem) — Major section
- 64px (4rem) — Hero spacing

### Border Radius

| Element | Radius |
|---------|--------|
| Buttons | 12px |
| Cards | 16px |
| Inputs | 12px |
| Tags/Badges | 9999px (pill) |
| Avatars | 50% (circle) |

### Shadows

Minimal shadows in dark mode. Use borders and background differences instead.

```css
/* Subtle elevation for modals/dropdowns */
box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);

/* Glow effect for focus states */
box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.2);
```

### Animation Principles

1. **Duration:** 150-300ms for micro-interactions
2. **Easing:** `ease-out` for entrances, `ease-in-out` for transforms
3. **Purpose:** Every animation must serve UX, not decoration
4. **Subtlety:** Animations should be felt, not noticed

---

## Part 3: Visual Assets

### Required Assets

1. **Logo Files**
   - SVG (primary)
   - PNG (social media)
   - Favicon (16x16, 32x32, 180x180)

2. **Social Preview (OG Image)**
   - 1200x630px
   - Brand colors
   - Logo + tagline

3. **Hero Illustration/Graphic**
   - Abstract representation of multi-party collaboration
   - Animated gradient background option

4. **Status Icons**
   - Active (blue pulse)
   - Work Submitted (amber)
   - Approved (green check)
   - Disputed (red alert)
   - Resolved (purple)
   - Cancelled (gray)

5. **Empty States**
   - No escrows found
   - Connect wallet prompt
   - Search results empty

### Mood Board Elements

**Visual References:**
- Linear's dark UI with subtle gradients
- Stripe's confident simplicity
- Vercel's dramatic negative space
- Uniswap's status clarity

**Texture:**
- Subtle noise overlay (0.5-1% opacity)
- Gradient mesh backgrounds
- Glass morphism for overlays

**Motion:**
- Gentle floating animations for hero elements
- Smooth status transitions
- Confetti for success (subtle, brief)

---

## Part 4: Brand Application

### Website Header
```
[Logo: Shield + "AgentEscrow"]     [Network: Base ●]     [Connect Wallet]
```

### Hero Section
```
[Live on Base Mainnet badge]

Fair Splits.
Enforced by Code.

Create trustless escrow contracts for multi-party collaboration.
Each contributor gets their share — guaranteed by smart contracts.

[Create Escrow →]                    [View Existing ↗]
```

### Trust Bar
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🔒 Verified Contract    ⚡ Base Mainnet    💵 USDC Native    ⏱ 14-Day Auto-Release
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

### Color Usage in UI

| Element | Color |
|---------|-------|
| Primary CTA buttons | Blue gradient |
| Secondary buttons | Transparent + border |
| Success actions | Green |
| Destructive actions | Red |
| Status: Active | Blue |
| Status: Work Submitted | Amber |
| Status: Approved | Green |
| Status: Disputed | Red |
| Status: Cancelled | Gray |

---

## Brand Guidelines Summary

### Do:
- ✅ Use generous whitespace
- ✅ Lead with simplicity
- ✅ Show contract address prominently
- ✅ Use plain English
- ✅ Celebrate success states
- ✅ Make status crystal clear

### Don't:
- ❌ Use crypto jargon without explanation
- ❌ Hide important information
- ❌ Use excessive animation
- ❌ Overcrowd the interface
- ❌ Make users guess what's happening
- ❌ Sacrifice clarity for aesthetics

---

*Next: Phase 3 — Frontend Redesign Specification*
