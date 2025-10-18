# Rewards System - Database Schema (Web2)

## Overview

This database schema is designed to work **alongside blockchain data**, providing:
- **Fast queries** for rewards data
- **Caching** of on-chain information
- **User preferences** and notifications
- **Analytics** and reporting
- **Historical tracking**

---

## 🗂️ Database Schema Diagram

```
┌─────────────────────┐
│      users          │
├─────────────────────┤
│ id (PK)            │
│ wallet_address     │◄─────┐
│ email              │      │
│ username           │      │
│ created_at         │      │
│ updated_at         │      │
└─────────────────────┘      │
                             │
┌─────────────────────┐      │
│      polls          │      │
├─────────────────────┤      │
│ id (PK)            │◄──┐  │
│ blockchain_poll_id │   │  │
│ title              │   │  │
│ description        │   │  │
│ status             │   │  │
│ start_time         │   │  │
│ end_time           │   │  │
│ total_votes        │   │  │
│ reward_pool        │   │  │
│ created_at         │   │  │
│ updated_at         │   │  │
└─────────────────────┘   │  │
                          │  │
┌─────────────────────┐   │  │
│      votes          │   │  │
├─────────────────────┤   │  │
│ id (PK)            │   │  │
│ user_id (FK) ──────┼───┼──┘
│ poll_id (FK) ──────┼───┘
│ choice             │
│ tx_hash            │
│ voted_at           │
│ created_at         │
└─────────────────────┘
         │
         │
         ▼
┌─────────────────────┐
│   vote_rewards      │
├─────────────────────┤
│ id (PK)            │
│ vote_id (FK) ──────┼──┐
│ user_id (FK) ──────┼──┼──┐
│ poll_id (FK) ──────┼──┼──┼──┐
│ amount             │  │  │  │
│ amount_usd         │  │  │  │
│ status             │  │  │  │
│ early_voter_bonus  │  │  │  │
│ participation_bonus│  │  │  │
│ claimable_at       │  │  │  │
│ created_at         │  │  │  │
│ updated_at         │  │  │  │
└─────────────────────┘  │  │  │
         │               │  │  │
         ▼               │  │  │
┌─────────────────────┐  │  │  │
│   reward_claims     │  │  │  │
├─────────────────────┤  │  │  │
│ id (PK)            │  │  │  │
│ reward_id (FK) ────┼──┘  │  │
│ user_id (FK) ──────┼──────┘  │
│ poll_id (FK) ──────┼──────────┘
│ amount             │
│ tx_hash            │
│ claimed_at         │
│ gas_fee            │
│ created_at         │
└─────────────────────┘
         │
         ▼
┌─────────────────────┐
│  reward_analytics   │
├─────────────────────┤
│ id (PK)            │
│ user_id (FK)       │
│ date               │
│ total_earned       │
│ total_claimed      │
│ total_pending      │
│ polls_participated │
│ claim_count        │
│ created_at         │
└─────────────────────┘

┌─────────────────────┐
│  notifications      │
├─────────────────────┤
│ id (PK)            │
│ user_id (FK)       │
│ type               │
│ title              │
│ message            │
│ related_id         │
│ read_at            │
│ sent_at            │
│ created_at         │
└─────────────────────┘

┌─────────────────────┐
│ notification_prefs  │
├─────────────────────┤
│ id (PK)            │
│ user_id (FK)       │
│ poll_ending        │
│ reward_claimable   │
│ reward_claimed     │
│ email_enabled      │
│ push_enabled       │
│ created_at         │
│ updated_at         │
└─────────────────────┘
```

---

## 📊 Detailed Table Schemas

### **1. users**
Stores user information and wallet details

```sql
CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    wallet_address VARCHAR(42) NOT NULL UNIQUE,
    email VARCHAR(255),
    username VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_wallet_address ON users(wallet_address);
CREATE INDEX idx_users_created_at ON users(created_at);
```

**Columns:**
- `id` - Auto-increment primary key
- `wallet_address` - Ethereum wallet address (0x...)
- `email` - Optional email for notifications
- `username` - Display name
- `created_at` - Account creation timestamp
- `updated_at` - Last update timestamp

---

### **2. polls**
Stores poll information (synced from blockchain)

```sql
CREATE TABLE polls (
    id BIGSERIAL PRIMARY KEY,
    blockchain_poll_id BIGINT NOT NULL UNIQUE,
    title VARCHAR(500) NOT NULL,
    description TEXT,
    status VARCHAR(20) NOT NULL, -- 'active', 'ended', 'cancelled'
    start_time TIMESTAMP NOT NULL,
    end_time TIMESTAMP NOT NULL,
    total_votes INTEGER DEFAULT 0,
    reward_pool DECIMAL(20, 8) DEFAULT 0, -- Total AGR allocated
    reward_per_vote DECIMAL(20, 8) DEFAULT 0, -- Calculated reward
    tx_hash VARCHAR(66),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_polls_blockchain_id ON polls(blockchain_poll_id);
CREATE INDEX idx_polls_status ON polls(status);
CREATE INDEX idx_polls_end_time ON polls(end_time);
CREATE INDEX idx_polls_status_end_time ON polls(status, end_time);
```

**Columns:**
- `id` - Database primary key
- `blockchain_poll_id` - On-chain poll ID
- `title` - Poll title
- `description` - Poll description
- `status` - Current status (active/ended/cancelled)
- `start_time` - When poll started
- `end_time` - When poll ends/ended
- `total_votes` - Total number of votes
- `reward_pool` - Total AGR allocated for this poll
- `reward_per_vote` - Calculated reward per participant
- `tx_hash` - Poll creation transaction hash

---

### **3. votes**
Stores vote records (synced from blockchain)

```sql
CREATE TABLE votes (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    poll_id BIGINT NOT NULL REFERENCES polls(id) ON DELETE CASCADE,
    choice VARCHAR(500) NOT NULL,
    tx_hash VARCHAR(66) NOT NULL UNIQUE,
    voted_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(user_id, poll_id) -- One vote per user per poll
);

CREATE INDEX idx_votes_user_id ON votes(user_id);
CREATE INDEX idx_votes_poll_id ON votes(poll_id);
CREATE INDEX idx_votes_tx_hash ON votes(tx_hash);
CREATE INDEX idx_votes_voted_at ON votes(voted_at);
CREATE INDEX idx_votes_user_poll ON votes(user_id, poll_id);
```

**Columns:**
- `id` - Auto-increment primary key
- `user_id` - Reference to users table
- `poll_id` - Reference to polls table
- `choice` - What the user voted for
- `tx_hash` - Vote transaction hash
- `voted_at` - When the vote was cast
- **Unique constraint:** One vote per user per poll

---

### **4. vote_rewards**
Stores reward information for each vote

```sql
CREATE TABLE vote_rewards (
    id BIGSERIAL PRIMARY KEY,
    vote_id BIGINT NOT NULL REFERENCES votes(id) ON DELETE CASCADE,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    poll_id BIGINT NOT NULL REFERENCES polls(id) ON DELETE CASCADE,
    
    -- Reward amounts
    base_amount DECIMAL(20, 8) NOT NULL, -- Base reward in AGR
    bonus_amount DECIMAL(20, 8) DEFAULT 0, -- Total bonus in AGR
    total_amount DECIMAL(20, 8) NOT NULL, -- base + bonus
    amount_usd DECIMAL(20, 2), -- USD equivalent at time of calculation
    
    -- Status
    status VARCHAR(20) NOT NULL, -- 'locked', 'claimable', 'claimed'
    
    -- Bonuses
    early_voter_bonus DECIMAL(5, 2) DEFAULT 0, -- Percentage (e.g., 10.00)
    participation_bonus DECIMAL(5, 2) DEFAULT 0, -- Percentage (e.g., 5.00)
    
    -- Timing
    claimable_at TIMESTAMP, -- When reward becomes claimable (poll end time)
    calculated_at TIMESTAMP, -- When reward was calculated
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(vote_id) -- One reward per vote
);

CREATE INDEX idx_vote_rewards_user_id ON vote_rewards(user_id);
CREATE INDEX idx_vote_rewards_poll_id ON vote_rewards(poll_id);
CREATE INDEX idx_vote_rewards_status ON vote_rewards(status);
CREATE INDEX idx_vote_rewards_claimable_at ON vote_rewards(claimable_at);
CREATE INDEX idx_vote_rewards_user_status ON vote_rewards(user_id, status);
```

**Columns:**
- `id` - Auto-increment primary key
- `vote_id` - Reference to votes table
- `user_id` - Reference to users table (denormalized for query performance)
- `poll_id` - Reference to polls table (denormalized for query performance)
- `base_amount` - Base reward amount in AGR
- `bonus_amount` - Total bonus amount in AGR
- `total_amount` - Total reward (base + bonus)
- `amount_usd` - USD equivalent
- `status` - locked/claimable/claimed
- `early_voter_bonus` - Early voter bonus percentage
- `participation_bonus` - Participation bonus percentage
- `claimable_at` - When reward becomes available
- `calculated_at` - When reward was calculated

---

### **5. reward_claims**
Stores claim transaction records

```sql
CREATE TABLE reward_claims (
    id BIGSERIAL PRIMARY KEY,
    reward_id BIGINT NOT NULL REFERENCES vote_rewards(id) ON DELETE CASCADE,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    poll_id BIGINT NOT NULL REFERENCES polls(id) ON DELETE CASCADE,
    
    -- Claim details
    amount DECIMAL(20, 8) NOT NULL, -- Amount claimed in AGR
    tx_hash VARCHAR(66) NOT NULL UNIQUE,
    gas_fee DECIMAL(20, 8), -- Gas fee paid in ETH
    gas_fee_usd DECIMAL(20, 2), -- Gas fee in USD
    
    -- Status
    status VARCHAR(20) NOT NULL, -- 'pending', 'confirmed', 'failed'
    
    -- Timing
    claimed_at TIMESTAMP NOT NULL,
    confirmed_at TIMESTAMP,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(reward_id) -- One claim per reward
);

CREATE INDEX idx_reward_claims_user_id ON reward_claims(user_id);
CREATE INDEX idx_reward_claims_poll_id ON reward_claims(poll_id);
CREATE INDEX idx_reward_claims_tx_hash ON reward_claims(tx_hash);
CREATE INDEX idx_reward_claims_claimed_at ON reward_claims(claimed_at);
CREATE INDEX idx_reward_claims_status ON reward_claims(status);
```

**Columns:**
- `id` - Auto-increment primary key
- `reward_id` - Reference to vote_rewards table
- `user_id` - Reference to users table
- `poll_id` - Reference to polls table
- `amount` - Amount claimed in AGR
- `tx_hash` - Claim transaction hash
- `gas_fee` - Gas fee paid (in ETH)
- `gas_fee_usd` - Gas fee in USD
- `status` - Transaction status
- `claimed_at` - When claim was initiated
- `confirmed_at` - When transaction was confirmed

---

### **6. reward_analytics**
Daily aggregated statistics per user

```sql
CREATE TABLE reward_analytics (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    
    -- Aggregated amounts
    total_earned DECIMAL(20, 8) DEFAULT 0, -- Lifetime earned
    total_claimed DECIMAL(20, 8) DEFAULT 0, -- Lifetime claimed
    total_pending DECIMAL(20, 8) DEFAULT 0, -- Currently pending
    total_claimable DECIMAL(20, 8) DEFAULT 0, -- Currently claimable
    
    -- Counts
    polls_participated INTEGER DEFAULT 0,
    polls_voted_today INTEGER DEFAULT 0,
    claim_count INTEGER DEFAULT 0,
    claims_today INTEGER DEFAULT 0,
    
    -- Averages
    avg_reward_per_vote DECIMAL(20, 8) DEFAULT 0,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(user_id, date)
);

CREATE INDEX idx_reward_analytics_user_id ON reward_analytics(user_id);
CREATE INDEX idx_reward_analytics_date ON reward_analytics(date);
CREATE INDEX idx_reward_analytics_user_date ON reward_analytics(user_id, date);
```

**Columns:**
- `id` - Auto-increment primary key
- `user_id` - Reference to users table
- `date` - Date of the analytics snapshot
- `total_earned` - Lifetime total earned
- `total_claimed` - Lifetime total claimed
- `total_pending` - Currently pending (active polls)
- `total_claimable` - Currently claimable (ended polls)
- `polls_participated` - Total polls voted in
- `polls_voted_today` - Polls voted in today
- `claim_count` - Total number of claims
- `claims_today` - Claims made today
- `avg_reward_per_vote` - Average reward per vote

---

### **7. notifications**
Stores notification messages

```sql
CREATE TABLE notifications (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Notification details
    type VARCHAR(50) NOT NULL, -- 'poll_ending', 'reward_claimable', 'reward_claimed'
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    
    -- Related entity
    related_type VARCHAR(50), -- 'poll', 'reward', 'claim'
    related_id BIGINT, -- ID of related entity
    
    -- Status
    read_at TIMESTAMP,
    sent_at TIMESTAMP,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_type ON notifications(type);
CREATE INDEX idx_notifications_created_at ON notifications(created_at);
CREATE INDEX idx_notifications_user_read ON notifications(user_id, read_at);
```

**Columns:**
- `id` - Auto-increment primary key
- `user_id` - Reference to users table
- `type` - Notification type
- `title` - Notification title
- `message` - Notification message
- `related_type` - Type of related entity
- `related_id` - ID of related entity
- `read_at` - When notification was read
- `sent_at` - When notification was sent

---

### **8. notification_preferences**
User notification preferences

```sql
CREATE TABLE notification_preferences (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    
    -- Event preferences
    poll_ending BOOLEAN DEFAULT TRUE,
    poll_ended BOOLEAN DEFAULT TRUE,
    reward_claimable BOOLEAN DEFAULT TRUE,
    reward_claimed BOOLEAN DEFAULT TRUE,
    low_gas_alert BOOLEAN DEFAULT FALSE,
    
    -- Channel preferences
    email_enabled BOOLEAN DEFAULT FALSE,
    push_enabled BOOLEAN DEFAULT TRUE,
    in_app_enabled BOOLEAN DEFAULT TRUE,
    
    -- Timing
    reminder_hours_before INTEGER DEFAULT 24, -- Hours before poll ends
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_notification_prefs_user_id ON notification_preferences(user_id);
```

**Columns:**
- `id` - Auto-increment primary key
- `user_id` - Reference to users table
- Event preferences (poll_ending, reward_claimable, etc.)
- Channel preferences (email, push, in-app)
- Timing preferences

---

### **9. reward_distribution_log**
Audit log for reward calculations

```sql
CREATE TABLE reward_distribution_log (
    id BIGSERIAL PRIMARY KEY,
    poll_id BIGINT NOT NULL REFERENCES polls(id) ON DELETE CASCADE,
    
    -- Distribution details
    total_participants INTEGER NOT NULL,
    total_reward_pool DECIMAL(20, 8) NOT NULL,
    reward_per_vote DECIMAL(20, 8) NOT NULL,
    
    -- Calculation metadata
    calculated_at TIMESTAMP NOT NULL,
    calculated_by VARCHAR(100), -- System/Admin identifier
    
    -- Status
    status VARCHAR(20) NOT NULL, -- 'calculated', 'distributed', 'failed'
    error_message TEXT,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_reward_distribution_poll_id ON reward_distribution_log(poll_id);
CREATE INDEX idx_reward_distribution_calculated_at ON reward_distribution_log(calculated_at);
```

**Columns:**
- `id` - Auto-increment primary key
- `poll_id` - Reference to polls table
- `total_participants` - Number of voters
- `total_reward_pool` - Total AGR distributed
- `reward_per_vote` - Amount per vote
- `calculated_at` - When distribution was calculated
- `status` - Status of distribution

---

## 🔗 Relationships

```
users (1) ─────► (N) votes
users (1) ─────► (N) vote_rewards
users (1) ─────► (N) reward_claims
users (1) ─────► (N) notifications
users (1) ─────► (1) notification_preferences
users (1) ─────► (N) reward_analytics

polls (1) ─────► (N) votes
polls (1) ─────► (N) vote_rewards
polls (1) ─────► (N) reward_claims
polls (1) ─────► (N) reward_distribution_log

votes (1) ─────► (1) vote_rewards
vote_rewards (1) ─────► (1) reward_claims
```

---

## 📈 Common Queries

### **1. Get User's Claimable Rewards**
```sql
SELECT 
    vr.id,
    p.title AS poll_title,
    p.blockchain_poll_id,
    v.choice AS user_vote,
    v.voted_at,
    vr.total_amount,
    vr.amount_usd,
    vr.early_voter_bonus,
    vr.participation_bonus,
    p.end_time AS poll_ended_at
FROM vote_rewards vr
INNER JOIN votes v ON vr.vote_id = v.id
INNER JOIN polls p ON vr.poll_id = p.id
WHERE vr.user_id = $1
    AND vr.status = 'claimable'
ORDER BY p.end_time DESC;
```

### **2. Get User's Pending Rewards**
```sql
SELECT 
    vr.id,
    p.title AS poll_title,
    p.blockchain_poll_id,
    v.choice AS user_vote,
    v.voted_at,
    vr.total_amount,
    vr.amount_usd,
    p.end_time,
    p.total_votes
FROM vote_rewards vr
INNER JOIN votes v ON vr.vote_id = v.id
INNER JOIN polls p ON vr.poll_id = p.id
WHERE vr.user_id = $1
    AND vr.status = 'locked'
    AND p.status = 'active'
ORDER BY p.end_time ASC;
```

### **3. Get User's Claim History**
```sql
SELECT 
    rc.id,
    p.title AS poll_title,
    rc.amount,
    rc.tx_hash,
    rc.gas_fee,
    rc.claimed_at,
    rc.confirmed_at,
    rc.status
FROM reward_claims rc
INNER JOIN polls p ON rc.poll_id = p.id
WHERE rc.user_id = $1
ORDER BY rc.claimed_at DESC
LIMIT 50;
```

### **4. Get User's Rewards Summary**
```sql
SELECT 
    COALESCE(SUM(CASE WHEN vr.status = 'claimable' THEN vr.total_amount ELSE 0 END), 0) AS total_claimable,
    COALESCE(SUM(CASE WHEN vr.status = 'locked' THEN vr.total_amount ELSE 0 END), 0) AS total_pending,
    COALESCE(SUM(CASE WHEN vr.status = 'claimed' THEN vr.total_amount ELSE 0 END), 0) AS total_claimed,
    COUNT(CASE WHEN vr.status = 'claimable' THEN 1 END) AS claimable_count,
    COUNT(CASE WHEN vr.status = 'locked' THEN 1 END) AS pending_count,
    COUNT(CASE WHEN vr.status = 'claimed' THEN 1 END) AS claimed_count
FROM vote_rewards vr
WHERE vr.user_id = $1;
```

### **5. Mark Reward as Claimed**
```sql
-- Start transaction
BEGIN;

-- Update reward status
UPDATE vote_rewards
SET status = 'claimed',
    updated_at = CURRENT_TIMESTAMP
WHERE id = $1 AND status = 'claimable'
RETURNING *;

-- Insert claim record
INSERT INTO reward_claims (
    reward_id, user_id, poll_id, amount, 
    tx_hash, claimed_at, status
) VALUES (
    $1, $2, $3, $4, $5, CURRENT_TIMESTAMP, 'pending'
);

COMMIT;
```

### **6. Get Polls Ending Soon (for notifications)**
```sql
SELECT 
    p.id,
    p.blockchain_poll_id,
    p.title,
    p.end_time,
    COUNT(v.id) AS voter_count
FROM polls p
INNER JOIN votes v ON p.id = v.poll_id
WHERE p.status = 'active'
    AND p.end_time BETWEEN CURRENT_TIMESTAMP AND CURRENT_TIMESTAMP + INTERVAL '24 hours'
GROUP BY p.id
ORDER BY p.end_time ASC;
```

### **7. Update Poll Status When Ended**
```sql
UPDATE polls
SET status = 'ended',
    updated_at = CURRENT_TIMESTAMP
WHERE status = 'active'
    AND end_time <= CURRENT_TIMESTAMP
RETURNING id, blockchain_poll_id, title;
```

### **8. Calculate and Distribute Rewards**
```sql
-- Start transaction
BEGIN;

-- Update all rewards for ended poll
UPDATE vote_rewards
SET status = 'claimable',
    claimable_at = CURRENT_TIMESTAMP,
    updated_at = CURRENT_TIMESTAMP
WHERE poll_id = $1
    AND status = 'locked';

-- Log distribution
INSERT INTO reward_distribution_log (
    poll_id, total_participants, total_reward_pool,
    reward_per_vote, calculated_at, status
) VALUES (
    $1, $2, $3, $4, CURRENT_TIMESTAMP, 'distributed'
);

COMMIT;
```

---

## 🔄 Data Synchronization Strategy

### **Blockchain → Database**
1. **Event Listeners** watch for blockchain events
2. **Poll Created** → Insert into `polls` table
3. **Vote Cast** → Insert into `votes` table, create `vote_rewards` entry
4. **Poll Ended** → Update poll status, mark rewards as claimable
5. **Reward Claimed** → Insert into `reward_claims`, update reward status

### **Database → Frontend**
1. **API endpoints** query database for fast responses
2. **Real-time updates** via WebSocket/SSE
3. **Caching layer** (Redis) for frequently accessed data

---

## 🔐 Security Considerations

1. **Wallet Address Verification**: Always verify wallet ownership
2. **Rate Limiting**: Prevent abuse of claim endpoints
3. **Transaction Verification**: Verify all tx_hash entries on blockchain
4. **Data Integrity**: Use database constraints and transactions
5. **Audit Logs**: Track all reward calculations and claims

---

## 📊 Performance Optimizations

1. **Indexes**: Created on frequently queried columns
2. **Denormalization**: user_id and poll_id in vote_rewards for faster queries
3. **Partitioning**: Consider partitioning by date for large datasets
4. **Materialized Views**: For complex analytics queries
5. **Caching**: Cache user summaries and frequently accessed data

---

## 🔄 Background Jobs

### **1. Poll Status Updater**
```sql
-- Run every minute
UPDATE polls SET status = 'ended' 
WHERE status = 'active' AND end_time <= CURRENT_TIMESTAMP;
```

### **2. Reward Distribution**
```sql
-- When poll ends, mark all locked rewards as claimable
UPDATE vote_rewards SET status = 'claimable', claimable_at = CURRENT_TIMESTAMP
WHERE poll_id IN (SELECT id FROM polls WHERE status = 'ended' AND updated_at > $last_run);
```

### **3. Notification Sender**
- Check for polls ending in 24 hours
- Check for newly claimable rewards
- Send notifications based on user preferences

### **4. Analytics Aggregator**
- Run daily to update reward_analytics table
- Calculate totals, averages, counts

---

## 📝 Migration Strategy

1. **Initial Setup**: Run schema creation scripts
2. **Historical Data**: Sync existing blockchain data
3. **Event Listeners**: Start real-time sync
4. **Validation**: Verify data consistency
5. **Monitoring**: Set up alerts for sync issues

---

This schema provides a solid foundation for the Web2 layer of your rewards system!

