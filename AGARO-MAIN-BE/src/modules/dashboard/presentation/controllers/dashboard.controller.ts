import { Controller, Get, HttpCode, HttpStatus, Logger } from '@nestjs/common';
import { Wallet } from '@modules/auth/presentation/decorators/wallet.decorator';
import { DashboardResponseDto } from '../../application/dto/dashboard.dto';
import { GetTotalVoteCastedUseCase } from '../../application/use-cases/get-total-vote-casted.use-case';
import { GetTotalActiveVotingPollsTodayUseCase } from '../../application/use-cases/get-total-active-voting-polls-today.use-case';
import { GetTotalRewardsEarnedUseCase } from '../../application/use-cases/get-total-rewards-earned.use-case';
import { GetActiveVotingPollsUseCase } from '../../application/use-cases/get-active-voting-polls.use-case';
import { GetMyTotalVoteCastedUseCase } from '../../application/use-cases/get-my-total-vote-casted.use-case';
import { GetMyTotalPendingVoteClaimsUseCase } from '../../application/use-cases/get-my-total-pending-vote-claims.use-case';

/**
 * Dashboard Controller
 *
 * Provides aggregated analytics and statistics for the voting platform
 */
@Controller('dashboards')
export class DashboardController {
  private readonly logger = new Logger(DashboardController.name);

  constructor(
    private readonly getTotalVoteCastedUseCase: GetTotalVoteCastedUseCase,
    private readonly getTotalActiveVotingPollsTodayUseCase: GetTotalActiveVotingPollsTodayUseCase,
    private readonly getTotalRewardsEarnedUseCase: GetTotalRewardsEarnedUseCase,
    private readonly getActiveVotingPollsUseCase: GetActiveVotingPollsUseCase,
    private readonly getMyTotalVoteCastedUseCase: GetMyTotalVoteCastedUseCase,
    private readonly getMyTotalPendingVoteClaimsUseCase: GetMyTotalPendingVoteClaimsUseCase,
  ) {}

  /**
   * Get Dashboard Summary
   * GET /dashboards/summary
   *
   * Returns comprehensive dashboard analytics including:
   * - Total votes casted (current month)
   * - Active voting polls today
   * - Total rewards earned (current month)
   * - List of active voting polls
   * - User-specific vote count
   * - User-specific pending claims
   *
   * Requires authentication via JWT token
   *
   * @param walletAddress - Extracted from JWT token
   * @returns DashboardResponseDto with all analytics
   */
  @Get('summary')
  @HttpCode(HttpStatus.OK)
  async getDashboardSummary(
    @Wallet() walletAddress: string,
  ): Promise<DashboardResponseDto> {
    this.logger.log(`Fetching dashboard summary for wallet: ${walletAddress}`);

    // Execute all use cases in parallel with Promise.allSettled
    const [
      totalVoteCastedResult,
      totalActiveVotingPollsTodayResult,
      totalRewardsEarnedResult,
      activeVotingPollsResult,
      myTotalVoteCastedResult,
      myTotalPendingVoteClaimsResult,
    ] = await Promise.allSettled([
      this.getTotalVoteCastedUseCase.execute(),
      this.getTotalActiveVotingPollsTodayUseCase.execute(),
      this.getTotalRewardsEarnedUseCase.execute(),
      this.getActiveVotingPollsUseCase.execute(),
      this.getMyTotalVoteCastedUseCase.execute(walletAddress),
      this.getMyTotalPendingVoteClaimsUseCase.execute(walletAddress),
    ]);

    // Handle results and provide fallback values on failure
    const response: DashboardResponseDto = {
      total_vote_casted:
        totalVoteCastedResult.status === 'fulfilled'
          ? totalVoteCastedResult.value
          : 0,
      total_active_voting_polls_today:
        totalActiveVotingPollsTodayResult.status === 'fulfilled'
          ? totalActiveVotingPollsTodayResult.value
          : 0,
      total_rewards_earned:
        totalRewardsEarnedResult.status === 'fulfilled'
          ? totalRewardsEarnedResult.value
          : 0,
      active_voting_polls:
        activeVotingPollsResult.status === 'fulfilled'
          ? activeVotingPollsResult.value
          : [],
      my_total_vote_casted:
        myTotalVoteCastedResult.status === 'fulfilled'
          ? myTotalVoteCastedResult.value
          : 0,
      my_total_pending_vote_claims:
        myTotalPendingVoteClaimsResult.status === 'fulfilled'
          ? myTotalPendingVoteClaimsResult.value
          : 0,
    };

    // Log any failed queries
    const results = [
      { name: 'totalVoteCasted', result: totalVoteCastedResult },
      {
        name: 'totalActiveVotingPollsToday',
        result: totalActiveVotingPollsTodayResult,
      },
      { name: 'totalRewardsEarned', result: totalRewardsEarnedResult },
      { name: 'activeVotingPolls', result: activeVotingPollsResult },
      { name: 'myTotalVoteCasted', result: myTotalVoteCastedResult },
      {
        name: 'myTotalPendingVoteClaims',
        result: myTotalPendingVoteClaimsResult,
      },
    ];

    results.forEach(({ name, result }) => {
      if (result.status === 'rejected') {
        const error = result.reason as Error;
        this.logger.error(`Failed to fetch ${name}: ${error}`, error?.stack);
      }
    });

    return response;
  }
}
