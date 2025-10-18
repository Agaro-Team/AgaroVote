# Rewards System - API Endpoints Specification

## Overview

This document outlines all API endpoints for the AgaroVote Rewards System.

**Base URL:** `https://api.agarovote.com/v1`

**Authentication:** All endpoints require JWT token from SIWE authentication

---

## 📋 Table of Contents

1. [Rewards Endpoints](#rewards-endpoints)
2. [Claim Endpoints](#claim-endpoints)
3. [Analytics Endpoints](#analytics-endpoints)
4. [Notification Endpoints](#notification-endpoints)
5. [User Preferences](#user-preferences)
6. [Admin Endpoints](#admin-endpoints)

---

## 🎯 Rewards Endpoints

### 1. Get User Rewards Summary

Get aggregated rewards summary for authenticated user.

```
GET /api/rewards/summary
```

**Headers:**
```
Authorization: Bearer {jwt_token}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "totalClaimable": "1234.56",
    "totalClaimableUsd": "1850.32",
    "totalPending": "567.89",
    "totalPendingUsd": "851.84",
    "totalClaimed": "8900.23",
    "totalClaimedUsd": "13350.35",
    "lifetimeEarned": "10702.68",
    "claimableCount": 12,
    "pendingCount": 5,
    "claimedCount": 89
  }
}
```

---

### 2. Get Claimable Rewards

Get list of rewards ready to claim (from ended polls).

```
GET /api/rewards/claimable
```

**Headers:**
```
Authorization: Bearer {jwt_token}
```

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20, max: 100)
- `sortBy` (optional): `endTime` | `amount` (default: `endTime`)
- `sortOrder` (optional): `asc` | `desc` (default: `desc`)

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "rewards": [
      {
        "id": "1",
        "pollId": "101",
        "blockchainPollId": "1",
        "pollTitle": "Best Framework for 2025",
        "pollStatus": "ended",
        "pollEndTime": "2025-01-15T18:00:00Z",
        "userVote": "React",
        "voteTimestamp": "2025-01-08T10:30:00Z",
        "baseAmount": "40.00",
        "bonusAmount": "5.67",
        "totalAmount": "45.67",
        "amountUsd": "68.50",
        "status": "claimable",
        "earlyVoterBonus": 5.0,
        "participationBonus": 0,
        "claimableAt": "2025-01-15T18:00:00Z",
        "totalVotes": 1234
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 12,
      "totalPages": 1
    }
  }
}
```

---

### 3. Get Pending Rewards

Get list of rewards from active polls (locked until poll ends).

```
GET /api/rewards/pending
```

**Headers:**
```
Authorization: Bearer {jwt_token}
```

**Query Parameters:**
- `page` (optional): Page number
- `limit` (optional): Items per page
- `sortBy` (optional): `endTime` | `amount` (default: `endTime`)

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "rewards": [
      {
        "id": "4",
        "pollId": "104",
        "blockchainPollId": "4",
        "pollTitle": "Next Network Integration",
        "pollStatus": "active",
        "pollEndTime": "2025-01-20T18:00:00Z",
        "userVote": "Polygon",
        "voteTimestamp": "2025-01-15T10:30:00Z",
        "totalAmount": "45.67",
        "amountUsd": "68.50",
        "status": "locked",
        "totalVotes": 1234,
        "timeRemaining": {
          "days": 3,
          "hours": 14,
          "minutes": 23
        }
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 5,
      "totalPages": 1
    }
  }
}
```

---

### 4. Get Claim History

Get list of previously claimed rewards.

```
GET /api/rewards/history
```

**Headers:**
```
Authorization: Bearer {jwt_token}
```

**Query Parameters:**
- `page` (optional): Page number
- `limit` (optional): Items per page
- `startDate` (optional): Filter from date (ISO 8601)
- `endDate` (optional): Filter to date (ISO 8601)

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "claims": [
      {
        "id": "7",
        "rewardId": "97",
        "pollId": "97",
        "blockchainPollId": "97",
        "pollTitle": "Budget Allocation Q4 2024",
        "amount": "234.56",
        "amountUsd": "351.84",
        "txHash": "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
        "gasFee": "0.0023",
        "gasFeeUsd": "5.50",
        "status": "confirmed",
        "claimedAt": "2024-12-20T09:15:00Z",
        "confirmedAt": "2024-12-20T09:17:30Z",
        "userVote": "Option A",
        "voteTimestamp": "2024-11-15T10:30:00Z",
        "earlyVoterBonus": 0,
        "participationBonus": 0
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 89,
      "totalPages": 5
    }
  }
}
```

---

### 5. Get Single Reward Details

Get detailed information about a specific reward.

```
GET /api/rewards/:id
```

**Headers:**
```
Authorization: Bearer {jwt_token}
```

**Path Parameters:**
- `id`: Reward ID

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "id": "1",
    "voteId": "101",
    "pollId": "101",
    "blockchainPollId": "1",
    "pollTitle": "Best Framework for 2025",
    "pollDescription": "Vote for your favorite framework",
    "pollStatus": "ended",
    "pollStartTime": "2025-01-01T00:00:00Z",
    "pollEndTime": "2025-01-15T18:00:00Z",
    "userVote": "React",
    "voteTimestamp": "2025-01-08T10:30:00Z",
    "voteTxHash": "0xabc...",
    "baseAmount": "40.00",
    "bonusAmount": "5.67",
    "totalAmount": "45.67",
    "amountUsd": "68.50",
    "status": "claimable",
    "earlyVoterBonus": 5.0,
    "participationBonus": 0,
    "claimableAt": "2025-01-15T18:00:00Z",
    "calculatedAt": "2025-01-15T18:00:05Z",
    "totalVotes": 1234,
    "claim": null
  }
}
```

**Error Response:** `404 Not Found`
```json
{
  "success": false,
  "error": {
    "code": "REWARD_NOT_FOUND",
    "message": "Reward not found or does not belong to this user"
  }
}
```

---

### 6. Get Reward by Poll

Get user's reward for a specific poll.

```
GET /api/rewards/poll/:pollId
```

**Headers:**
```
Authorization: Bearer {jwt_token}
```

**Path Parameters:**
- `pollId`: Database poll ID or blockchain poll ID

**Query Parameters:**
- `byBlockchainId` (optional): Set to `true` to use blockchain poll ID

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "hasVoted": true,
    "reward": {
      "id": "1",
      "status": "claimable",
      "totalAmount": "45.67",
      "amountUsd": "68.50"
    }
  }
}
```

**Response (Not Voted):** `200 OK`
```json
{
  "success": true,
  "data": {
    "hasVoted": false,
    "reward": null
  }
}
```

---

## 💰 Claim Endpoints

### 7. Claim Single Reward

Initiate claim for a single reward.

```
POST /api/rewards/:id/claim
```

**Headers:**
```
Authorization: Bearer {jwt_token}
Content-Type: application/json
```

**Path Parameters:**
- `id`: Reward ID

**Request Body:**
```json
{
  "txHash": "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
  "gasFee": "0.0023"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "claimId": "123",
    "rewardId": "1",
    "amount": "45.67",
    "txHash": "0x1234...",
    "status": "pending",
    "claimedAt": "2025-01-17T10:30:00Z",
    "estimatedConfirmationTime": "2025-01-17T10:32:00Z"
  }
}
```

**Error Response:** `400 Bad Request`
```json
{
  "success": false,
  "error": {
    "code": "REWARD_NOT_CLAIMABLE",
    "message": "This reward is not yet claimable. Poll must end first."
  }
}
```

**Error Response:** `409 Conflict`
```json
{
  "success": false,
  "error": {
    "code": "ALREADY_CLAIMED",
    "message": "This reward has already been claimed"
  }
}
```

---

### 8. Claim Multiple Rewards

Claim multiple rewards in a single transaction.

```
POST /api/rewards/claim-batch
```

**Headers:**
```
Authorization: Bearer {jwt_token}
Content-Type: application/json
```

**Request Body:**
```json
{
  "rewardIds": ["1", "2", "3"],
  "txHash": "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
  "gasFee": "0.0045"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "claimIds": ["123", "124", "125"],
    "totalAmount": "158.24",
    "totalAmountUsd": "237.36",
    "txHash": "0x1234...",
    "status": "pending",
    "claimedAt": "2025-01-17T10:30:00Z",
    "successfulClaims": 3,
    "failedClaims": 0
  }
}
```

**Error Response:** `400 Bad Request`
```json
{
  "success": false,
  "error": {
    "code": "INVALID_REWARDS",
    "message": "Some rewards are not claimable",
    "details": {
      "invalidRewardIds": ["2"],
      "reasons": {
        "2": "Poll has not ended yet"
      }
    }
  }
}
```

---

### 9. Verify Claim Status

Check the status of a claim transaction.

```
GET /api/claims/:claimId/status
```

**Headers:**
```
Authorization: Bearer {jwt_token}
```

**Path Parameters:**
- `claimId`: Claim ID

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "claimId": "123",
    "rewardId": "1",
    "amount": "45.67",
    "txHash": "0x1234...",
    "status": "confirmed",
    "claimedAt": "2025-01-17T10:30:00Z",
    "confirmedAt": "2025-01-17T10:32:15Z",
    "blockNumber": 12345678,
    "confirmations": 12
  }
}
```

---

## 📊 Analytics Endpoints

### 10. Get User Analytics

Get analytics and statistics for authenticated user.

```
GET /api/rewards/analytics
```

**Headers:**
```
Authorization: Bearer {jwt_token}
```

**Query Parameters:**
- `period` (optional): `7d` | `30d` | `90d` | `1y` | `all` (default: `30d`)

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "period": "30d",
    "summary": {
      "totalEarned": "1234.56",
      "totalClaimed": "890.12",
      "totalPending": "344.44",
      "pollsParticipated": 45,
      "claimCount": 35,
      "avgRewardPerVote": "27.43"
    },
    "trends": [
      {
        "date": "2025-01-01",
        "earned": "45.67",
        "claimed": "30.00",
        "pollsVoted": 2,
        "claimsMade": 1
      }
    ],
    "topPolls": [
      {
        "pollTitle": "Budget Allocation Q4",
        "amount": "234.56",
        "voteDate": "2024-11-15"
      }
    ]
  }
}
```

---

### 11. Get Rewards Timeline

Get chronological timeline of rewards activity.

```
GET /api/rewards/timeline
```

**Headers:**
```
Authorization: Bearer {jwt_token}
```

**Query Parameters:**
- `startDate` (optional): Start date (ISO 8601)
- `endDate` (optional): End date (ISO 8601)
- `limit` (optional): Max items (default: 50)

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "events": [
      {
        "type": "reward_claimed",
        "timestamp": "2025-01-17T10:30:00Z",
        "pollTitle": "Best Framework 2025",
        "amount": "45.67",
        "txHash": "0x1234..."
      },
      {
        "type": "reward_claimable",
        "timestamp": "2025-01-15T18:00:00Z",
        "pollTitle": "Best Framework 2025",
        "amount": "45.67"
      },
      {
        "type": "vote_cast",
        "timestamp": "2025-01-08T10:30:00Z",
        "pollTitle": "Best Framework 2025",
        "choice": "React"
      }
    ]
  }
}
```

---

### 12. Get Leaderboard

Get rewards leaderboard (optional feature).

```
GET /api/rewards/leaderboard
```

**Query Parameters:**
- `period` (optional): `7d` | `30d` | `90d` | `all` (default: `30d`)
- `limit` (optional): Max items (default: 100)

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "period": "30d",
    "leaderboard": [
      {
        "rank": 1,
        "walletAddress": "0x1234...5678",
        "username": "crypto_voter",
        "totalEarned": "5678.90",
        "pollsParticipated": 120,
        "claimCount": 100,
        "isCurrentUser": false
      }
    ],
    "currentUser": {
      "rank": 45,
      "totalEarned": "1234.56",
      "pollsParticipated": 45
    }
  }
}
```

---

## 🔔 Notification Endpoints

### 13. Get Notifications

Get user notifications.

```
GET /api/notifications
```

**Headers:**
```
Authorization: Bearer {jwt_token}
```

**Query Parameters:**
- `page` (optional): Page number
- `limit` (optional): Items per page
- `unreadOnly` (optional): `true` | `false` (default: `false`)
- `type` (optional): Filter by type

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "notifications": [
      {
        "id": "1",
        "type": "reward_claimable",
        "title": "Reward Ready to Claim!",
        "message": "Your reward from 'Best Framework 2025' is now claimable",
        "relatedType": "reward",
        "relatedId": "1",
        "readAt": null,
        "sentAt": "2025-01-15T18:00:30Z",
        "createdAt": "2025-01-15T18:00:30Z"
      }
    ],
    "unreadCount": 3,
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 45,
      "totalPages": 3
    }
  }
}
```

---

### 14. Mark Notification as Read

Mark a notification as read.

```
PUT /api/notifications/:id/read
```

**Headers:**
```
Authorization: Bearer {jwt_token}
```

**Path Parameters:**
- `id`: Notification ID

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "id": "1",
    "readAt": "2025-01-17T10:30:00Z"
  }
}
```

---

### 15. Mark All Notifications as Read

Mark all notifications as read.

```
PUT /api/notifications/read-all
```

**Headers:**
```
Authorization: Bearer {jwt_token}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "markedCount": 3
  }
}
```

---

## ⚙️ User Preferences

### 16. Get Notification Preferences

Get user's notification preferences.

```
GET /api/preferences/notifications
```

**Headers:**
```
Authorization: Bearer {jwt_token}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "pollEnding": true,
    "pollEnded": true,
    "rewardClaimable": true,
    "rewardClaimed": true,
    "lowGasAlert": false,
    "emailEnabled": false,
    "pushEnabled": true,
    "inAppEnabled": true,
    "reminderHoursBefore": 24
  }
}
```

---

### 17. Update Notification Preferences

Update user's notification preferences.

```
PUT /api/preferences/notifications
```

**Headers:**
```
Authorization: Bearer {jwt_token}
Content-Type: application/json
```

**Request Body:**
```json
{
  "pollEnding": true,
  "pollEnded": true,
  "rewardClaimable": true,
  "rewardClaimed": false,
  "lowGasAlert": true,
  "emailEnabled": true,
  "pushEnabled": true,
  "inAppEnabled": true,
  "reminderHoursBefore": 12
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "pollEnding": true,
    "pollEnded": true,
    "rewardClaimable": true,
    "rewardClaimed": false,
    "lowGasAlert": true,
    "emailEnabled": true,
    "pushEnabled": true,
    "inAppEnabled": true,
    "reminderHoursBefore": 12,
    "updatedAt": "2025-01-17T10:30:00Z"
  }
}
```

---

## 🔧 Admin Endpoints

### 18. Sync Poll from Blockchain

Manually trigger sync for a specific poll (admin only).

```
POST /api/admin/polls/:blockchainPollId/sync
```

**Headers:**
```
Authorization: Bearer {admin_jwt_token}
Content-Type: application/json
```

**Path Parameters:**
- `blockchainPollId`: Blockchain poll ID

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "pollId": "101",
    "blockchainPollId": "1",
    "synced": true,
    "votesUpdated": 15,
    "rewardsCalculated": 15
  }
}
```

---

### 19. Recalculate Rewards

Recalculate rewards for a poll (admin only).

```
POST /api/admin/polls/:pollId/recalculate-rewards
```

**Headers:**
```
Authorization: Bearer {admin_jwt_token}
Content-Type: application/json
```

**Path Parameters:**
- `pollId`: Database poll ID

**Request Body:**
```json
{
  "rewardPool": "1000.00",
  "bonusRules": {
    "earlyVoterBonus": 10.0,
    "participationBonus": 5.0
  }
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "pollId": "101",
    "totalParticipants": 50,
    "totalRewardPool": "1000.00",
    "rewardPerVote": "20.00",
    "rewardsUpdated": 50
  }
}
```

---

### 20. Get System Statistics

Get overall system statistics (admin only).

```
GET /api/admin/stats
```

**Headers:**
```
Authorization: Bearer {admin_jwt_token}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "totalUsers": 10543,
    "totalPolls": 234,
    "activePolls": 12,
    "endedPolls": 222,
    "totalRewardsDistributed": "234567.89",
    "totalRewardsClaimed": "198432.10",
    "totalRewardsPending": "36135.79",
    "totalClaims": 8923,
    "avgClaimTime": "2.5 hours"
  }
}
```

---

## 🔒 Authentication

All endpoints require JWT token from SIWE authentication.

**Header Format:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Token Payload:**
```json
{
  "walletAddress": "0x1234567890abcdef1234567890abcdef12345678",
  "userId": "123",
  "iat": 1705507200,
  "exp": 1705593600
}
```

---

## ❌ Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `UNAUTHORIZED` | 401 | Missing or invalid JWT token |
| `FORBIDDEN` | 403 | Insufficient permissions |
| `REWARD_NOT_FOUND` | 404 | Reward not found |
| `POLL_NOT_FOUND` | 404 | Poll not found |
| `REWARD_NOT_CLAIMABLE` | 400 | Reward not yet claimable |
| `ALREADY_CLAIMED` | 409 | Reward already claimed |
| `INVALID_REWARDS` | 400 | Invalid reward IDs provided |
| `INVALID_TX_HASH` | 400 | Invalid transaction hash format |
| `POLL_STILL_ACTIVE` | 400 | Cannot claim while poll active |
| `RATE_LIMIT_EXCEEDED` | 429 | Too many requests |
| `VALIDATION_ERROR` | 422 | Request validation failed |
| `INTERNAL_ERROR` | 500 | Internal server error |

---

## 📝 Response Format

### Success Response
```json
{
  "success": true,
  "data": { ... }
}
```

### Error Response
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "details": { ... } // Optional additional details
  }
}
```

---

## 🚦 Rate Limiting

- **Standard endpoints:** 100 requests/minute per user
- **Claim endpoints:** 10 requests/minute per user
- **Admin endpoints:** 1000 requests/minute

**Rate Limit Headers:**
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1705507260
```

---

## 🔄 Pagination

All list endpoints support pagination:

**Query Parameters:**
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 20, max: 100)

**Response Format:**
```json
{
  "data": [ ... ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "totalPages": 8
  }
}
```

---

## 📅 Date Formats

All dates are in ISO 8601 format with UTC timezone:

```
2025-01-17T10:30:00Z
```

---

## 🌐 CORS

CORS is enabled for the following origins:
- `https://agarovote.com`
- `https://app.agarovote.com`
- `http://localhost:5173` (development)

---

## 🔍 Testing

### Example cURL Request

```bash
curl -X GET \
  https://api.agarovote.com/v1/api/rewards/summary \
  -H 'Authorization: Bearer YOUR_JWT_TOKEN' \
  -H 'Content-Type: application/json'
```

### Example with Axios (Frontend)

```typescript
import { agaroApi } from '~/lib/api/agaro.api';

// Get rewards summary
const summary = await agaroApi.get('/api/rewards/summary');

// Claim reward
const claim = await agaroApi.post('/api/rewards/1/claim', {
  txHash: '0x1234...',
  gasFee: '0.0023'
});
```

---

## 📊 Summary

**Total Endpoints:** 20
- Rewards: 6 endpoints
- Claims: 3 endpoints
- Analytics: 3 endpoints
- Notifications: 3 endpoints
- Preferences: 2 endpoints
- Admin: 3 endpoints

---

This API specification provides a complete foundation for the rewards system frontend integration!

