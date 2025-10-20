import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import {
  IDashboardRepository,
  IDashboardVote,
} from '@/modules/dashboard/domain/repositories/dashboard-repository.interface';

interface CountResult {
  count: string;
}

interface TotalResult {
  total: string;
}

interface ActivePollResult {
  id: string;
  name: string;
  ends_at: Date;
  start_date: Date;
  total_voted: string;
}

@Injectable()
export class TypeORMDashboardRepository implements IDashboardRepository {
  constructor(private readonly datasource: DataSource) {}

  async getTotalVoteCasted(startDate: Date, endDate: Date): Promise<number> {
    const query = `
      SELECT COUNT(*) as count
      FROM votes
      WHERE voted_at >= $1 AND voted_at <= $2
    `;

    const result = await this.datasource.query<CountResult[]>(query, [
      startDate,
      endDate,
    ]);
    return parseInt(result[0]?.count || '0', 10);
  }

  async getTotalActiveVotingPollsToday(): Promise<number> {
    const now = new Date();

    const query = `
      SELECT COUNT(*) as count
      FROM polls
      WHERE is_active = true
        AND transaction_status = 'success'
        AND start_date <= $1
        AND end_date >= $1
    `;

    const result = await this.datasource.query<CountResult[]>(query, [now]);
    return parseInt(result[0]?.count || '0', 10);
  }

  async getTotalRewardsEarned(startDate: Date, endDate: Date): Promise<number> {
    const query = `
      SELECT COALESCE(SUM(CAST(reward_amount AS NUMERIC)), 0) as total
      FROM vote_rewards
      WHERE claimed_at IS NOT NULL
        AND claimed_at >= $1
        AND claimed_at <= $2
    `;

    const result = await this.datasource.query<TotalResult[]>(query, [
      startDate,
      endDate,
    ]);
    return parseFloat(result[0]?.total || '0');
  }

  async getActiveVotingPolls(limit: number): Promise<IDashboardVote[]> {
    const now = new Date();

    const query = `
      SELECT 
        p.id,
        p.title as name,
        p.end_date as ends_at,
        p.start_date as start_date,
        COUNT(DISTINCT v.id) as total_voted
      FROM polls p
      LEFT JOIN votes v ON v.poll_id = p.id
      WHERE p.is_active = true
        AND p.transaction_status = 'success'
        AND p.start_date <= $1
        AND p.end_date >= $1
      GROUP BY p.id, p.title, p.end_date, p.start_date
      ORDER BY p.end_date DESC
      LIMIT $2
    `;

    const results = await this.datasource.query<ActivePollResult[]>(query, [
      now,
      limit,
    ]);

    // Calculate percentage based on time elapsed
    return results.map((row) => {
      const totalVoted = parseInt(row.total_voted, 10) || 0;

      // Calculate percentage based on time progress
      const pollStartDate = new Date(row.start_date);
      const pollEndDate = new Date(row.ends_at);
      const totalDuration = pollEndDate.getTime() - pollStartDate.getTime();
      const elapsed = now.getTime() - pollStartDate.getTime();
      const percentage = Math.min(
        Math.max((elapsed / totalDuration) * 100, 0),
        100,
      );

      return {
        id: row.id,
        name: row.name,
        ends_at: row.ends_at,
        percentage: Math.round(percentage),
        total_voted: totalVoted,
      };
    });
  }

  async getMyTotalVoteCasted(walletAddress: string): Promise<number> {
    const query = `
      SELECT COUNT(*) as count
      FROM votes
      WHERE LOWER(voter_wallet_address) = LOWER($1)
    `;

    const result = await this.datasource.query<CountResult[]>(query, [
      walletAddress,
    ]);
    return parseInt(result[0]?.count || '0', 10);
  }

  async getMyTotalPendingVoteClaims(walletAddress: string): Promise<number> {
    const now = new Date();

    const query = `
      SELECT COUNT(*) as count
      FROM vote_rewards
      WHERE LOWER(voter_wallet_address) = LOWER($1)
        AND claimed_at IS NULL
        AND claimable_at <= $2
    `;

    const result = await this.datasource.query<CountResult[]>(query, [
      walletAddress,
      now,
    ]);
    return parseInt(result[0]?.count || '0', 10);
  }
}
