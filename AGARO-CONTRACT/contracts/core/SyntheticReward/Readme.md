# SyntheticReward Contract

A smart contract for time-based ERC20 reward distribution — built for AgaroPlatform.

---

## 📘 Overview

`SyntheticReward` distributes ERC20 token rewards linearly over a fixed **duration**. Users can deposit (commit) tokens, and rewards accrue proportionally to the user’s share of the total stake.

The contract uses OpenZeppelin’s upgradeable framework and is protected by **ReentrancyGuard** and **Ownable**.

---

## ⚙️ Key Variables

| Variable | Description |
|-----------|-------------|
| `token` | ERC20 token used for staking and rewards |
| `duration` | Reward period duration (in seconds) |
| `rewardRate` | Reward per second |
| `finishAt` | Timestamp when rewards stop |
| `rewardPerTokenStored` | Tracks accumulated rewards per token |
| `userRewardPerTokenPaid[address]` | Records user's last checkpoint |
| `rewards[address]` | Pending rewards for each user |
| `balanceOf[address]` | User staked amount |
| `totalSupply` | Total staked tokens in the pool |

---

## 🧮 Reward Distribution Formula

The reward rate is determined at initialization:

```text
rewardRate = totalReward / duration
```

### Reward Per Token (RPT)

This represents the accumulated reward per staked token:

\[
RPT = RPT_{stored} + \frac{rewardRate \times (t - t_{last}) \times 1e18}{totalSupply}
\]

where:
- \( t \) = current timestamp (or `finishAt`, whichever is smaller)
- \( t_{last} \) = last update timestamp

### User’s Earned Reward

For any user \( u \):

\[
EARNED(u) = \frac{balanceOf[u] \times (RPT - userRPT[u])}{1e18} + rewards[u]
\]

This ensures each user accrues rewards proportionally to their stake and the elapsed time.

---

## 🧩 Core Functions

### 1. `commit(_amount, _sender)`

Deposits tokens for staking.
- Transfers tokens from `_sender` to contract.
- Updates their reward state.
- Increases both `balanceOf[_sender]` and `totalSupply`.

```solidity
function commit(uint256 _amount, address _sender)
    external nonReentrant onlyOwner updateReward(_sender)
```

### 2. `withdraw(_amount, _sender)`

Withdraws staked tokens and claims pending rewards.

```solidity
function withdraw(uint256 _amount, address _sender)
    external nonReentrant onlyOwner updateReward(_sender)
```

### 3. `earned(address _account)`

Calculates user’s accumulated reward:

```solidity
(balanceOf[user] * (rewardPerToken() - userRewardPerTokenPaid[user])) / 1e18 + rewards[user];
```

### 4. `_notifyRewardAmount(_amount)`

Sets new reward parameters:

- If the previous reward has finished → start new emission.
- If ongoing → compounds remaining rewards with new ones.

\[
rewardRate = \frac{amount + remainingRewards}{duration}
\]

---

## ⏱️ Example Simulation

**Inputs:**
- `totalReward = 1,000 tokens`
- `duration = 10 days = 864,000 seconds`
- `rewardRate = 0.001157 tokens/second`

**Users:**
- Alice stakes 100 tokens at t=0.
- Bob stakes 300 tokens at t=0.

| Time (days) | Total Reward Distributed | Alice’s Share | Bob’s Share |
|--------------|---------------------------|----------------|---------------|
| 1 | 1000 * (1/10) = 100 | 25 (100/400) | 75 (300/400) |
| 5 | 500 | 125 | 375 |
| 10 | 1000 | 250 | 750 |

✅ Total rewards are linearly distributed. Each user’s share scales with their proportion of total stake.


## 🔐 Security Highlights

- `nonReentrant`: prevents reentrancy exploits.
- `onlyOwner`: central control (suitable for vault integrations).
- Rewards and balances tracked per user.
- Prevents underflow/overflow via Solidity 0.8.x built-in checks.


**License:** MIT
