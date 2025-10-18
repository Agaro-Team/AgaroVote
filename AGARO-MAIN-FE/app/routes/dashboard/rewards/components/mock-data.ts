/**
 * Mock Data for Rewards UI Prototype
 *
 * This file contains mock data for testing the rewards interface.
 * Replace with actual smart contract calls in production.
 */

export interface RewardItem {
  id: string;
  pollId: string;
  pollTitle: string;
  pollStatus: 'active' | 'ended';
  pollEndTime: Date;
  userVote: string;
  voteTimestamp: Date;
  rewardAmount: string; // in AGR
  rewardAmountUsd: string;
  rewardStatus: 'locked' | 'claimable' | 'claimed';
  claimedAt?: Date;
  claimTxHash?: string;
  earlyVoterBonus?: number;
  participationBonus?: number;
  totalVotes: number;
}

export interface RewardsSummary {
  totalClaimable: string;
  totalClaimableUsd: string;
  totalPending: string;
  totalPendingUsd: string;
  totalClaimed: string;
  totalClaimedUsd: string;
  claimableCount: number;
  pendingCount: number;
  claimedCount: number;
  lifetimeEarned: string;
}

// Mock summary data
export const mockRewardsSummary: RewardsSummary = {
  totalClaimable: '1,234.56',
  totalClaimableUsd: '1,850.32',
  totalPending: '567.89',
  totalPendingUsd: '851.84',
  totalClaimed: '8,900.23',
  totalClaimedUsd: '13,350.35',
  claimableCount: 12,
  pendingCount: 5,
  claimedCount: 89,
  lifetimeEarned: '10,702.68',
};

// Mock claimable rewards (ended polls)
export const mockClaimableRewards: RewardItem[] = [
  {
    id: '1',
    pollId: '101',
    pollTitle: 'Best Framework for 2025',
    pollStatus: 'ended',
    pollEndTime: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
    userVote: 'React',
    voteTimestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    rewardAmount: '45.67',
    rewardAmountUsd: '68.50',
    rewardStatus: 'claimable',
    participationBonus: 5,
    totalVotes: 1234,
  },
  {
    id: '2',
    pollId: '102',
    pollTitle: 'DAO Treasury Allocation Q1 2025',
    pollStatus: 'ended',
    pollEndTime: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
    userVote: 'Option A: Development',
    voteTimestamp: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
    rewardAmount: '89.12',
    rewardAmountUsd: '133.68',
    rewardStatus: 'claimable',
    earlyVoterBonus: 10,
    totalVotes: 567,
  },
  {
    id: '3',
    pollId: '103',
    pollTitle: 'Community Event Planning',
    pollStatus: 'ended',
    pollEndTime: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
    userVote: 'Option C: Hybrid Event',
    voteTimestamp: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000),
    rewardAmount: '23.45',
    rewardAmountUsd: '35.18',
    rewardStatus: 'claimable',
    totalVotes: 890,
  },
];

// Mock pending rewards (active polls)
export const mockPendingRewards: RewardItem[] = [
  {
    id: '4',
    pollId: '104',
    pollTitle: 'Next Network Integration',
    pollStatus: 'active',
    pollEndTime: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000 + 14 * 60 * 60 * 1000), // 3d 14h
    userVote: 'Polygon',
    voteTimestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    rewardAmount: '45.67',
    rewardAmountUsd: '68.50',
    rewardStatus: 'locked',
    totalVotes: 1234,
  },
  {
    id: '5',
    pollId: '105',
    pollTitle: 'Governance Model Update',
    pollStatus: 'active',
    pollEndTime: new Date(Date.now() + 12 * 60 * 60 * 1000 + 45 * 60 * 1000), // 12h 45m
    userVote: 'Option B: Quadratic Voting',
    voteTimestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    rewardAmount: '67.89',
    rewardAmountUsd: '101.84',
    rewardStatus: 'locked',
    totalVotes: 890,
  },
  {
    id: '6',
    pollId: '106',
    pollTitle: 'Marketing Campaign Direction',
    pollStatus: 'active',
    pollEndTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    userVote: 'Focus on Web3 Communities',
    voteTimestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    rewardAmount: '34.56',
    rewardAmountUsd: '51.84',
    rewardStatus: 'locked',
    totalVotes: 456,
  },
];

// Mock claimed rewards history
export const mockClaimedRewards: RewardItem[] = [
  {
    id: '7',
    pollId: '97',
    pollTitle: 'Budget Allocation Q4 2024',
    pollStatus: 'ended',
    pollEndTime: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    userVote: 'Option A',
    voteTimestamp: new Date(Date.now() - 40 * 24 * 60 * 60 * 1000),
    rewardAmount: '234.56',
    rewardAmountUsd: '351.84',
    rewardStatus: 'claimed',
    claimedAt: new Date(Date.now() - 28 * 24 * 60 * 60 * 1000),
    claimTxHash: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
    totalVotes: 2000,
  },
  {
    id: '8',
    pollId: '96',
    pollTitle: 'New Feature Proposal',
    pollStatus: 'ended',
    pollEndTime: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000),
    userVote: 'Approve',
    voteTimestamp: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000),
    rewardAmount: '567.89',
    rewardAmountUsd: '851.84',
    rewardStatus: 'claimed',
    claimedAt: new Date(Date.now() - 33 * 24 * 60 * 60 * 1000),
    claimTxHash: '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890',
    earlyVoterBonus: 15,
    totalVotes: 1500,
  },
];

// Helper to calculate time remaining
export function getTimeRemaining(endTime: Date): {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  total: number;
} {
  const total = endTime.getTime() - Date.now();
  const seconds = Math.floor((total / 1000) % 60);
  const minutes = Math.floor((total / 1000 / 60) % 60);
  const hours = Math.floor((total / (1000 * 60 * 60)) % 24);
  const days = Math.floor(total / (1000 * 60 * 60 * 24));

  return {
    total,
    days: Math.max(0, days),
    hours: Math.max(0, hours),
    minutes: Math.max(0, minutes),
    seconds: Math.max(0, seconds),
  };
}

// Helper to format time remaining
export function formatTimeRemaining(endTime: Date): string {
  const { days, hours, minutes, total } = getTimeRemaining(endTime);

  if (total <= 0) return 'Poll ended';

  if (days > 0) {
    return `${days}d ${hours}h ${minutes}m`;
  } else if (hours > 0) {
    return `${hours}h ${minutes}m`;
  } else {
    return `${minutes}m`;
  }
}

// Helper to calculate progress percentage
export function getPollProgress(startTime: Date, endTime: Date): number {
  const now = Date.now();
  const start = startTime.getTime();
  const end = endTime.getTime();
  const progress = ((now - start) / (end - start)) * 100;
  return Math.min(100, Math.max(0, progress));
}
