import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { IPaginatedResult } from '@shared/application/dto/pagination.dto';
import { CreatePollDto } from '../../application/dto/create-poll.dto';
import { PollFilterDto } from '../../application/dto/poll-filter.dto';
import { PollResponseDto } from '../../application/dto/poll-response.dto';
import { UpdatePollDto } from '../../application/dto/update-poll.dto';
import { UpdateTransactionStatusDto } from '../../application/dto/update-transaction-status.dto';
import { UpdateVoterHashDto } from '../../application/dto/update-voter-hash.dto';
import { ActivatePollUseCase } from '../../application/use-cases/activate-poll.use-case';
import { CheckVotingEligibilityUseCase } from '../../application/use-cases/check-voting-eligibility.use-case';
import { CreatePollUseCase } from '../../application/use-cases/create-poll.use-case';
import { DeletePollUseCase } from '../../application/use-cases/delete-poll.use-case';
import { GetActivePollsPaginatedUseCase } from '../../application/use-cases/get-active-polls-paginated.use-case';
import { GetAllPollsPaginatedUseCase } from '../../application/use-cases/get-all-polls-paginated.use-case';
import { GetOngoingPollsPaginatedUseCase } from '../../application/use-cases/get-ongoing-polls-paginated.use-case';
import { GetPollByIdUseCase } from '../../application/use-cases/get-poll-by-id.use-case';
import { GetPollsByCreatorPaginatedUseCase } from '../../application/use-cases/get-polls-by-creator-paginated.use-case';
import { UpdatePollTransactionStatusUseCase } from '../../application/use-cases/update-poll-transaction-status.use-case';
import { UpdatePollUseCase } from '../../application/use-cases/update-poll.use-case';
import { UpdateVoterHashUseCase } from '../../application/use-cases/update-voter-hash.use-case';
import { QueryBus } from '@nestjs/cqrs';
import { Poll } from '../../domain/entities/poll.entity';
import {
  GetMultiplePollVoteCountsQuery,
  GetPollVoteCountQuery,
  PollVoteCountMap,
} from '@/modules/vote/application/queries';

@Controller('polls')
export class PollController {
  constructor(
    private readonly queryBus: QueryBus,
    private readonly createPollUseCase: CreatePollUseCase,
    private readonly getPollByIdUseCase: GetPollByIdUseCase,
    private readonly updatePollUseCase: UpdatePollUseCase,
    private readonly deletePollUseCase: DeletePollUseCase,
    private readonly checkVotingEligibilityUseCase: CheckVotingEligibilityUseCase,
    private readonly getAllPollsPaginatedUseCase: GetAllPollsPaginatedUseCase,
    private readonly getActivePollsPaginatedUseCase: GetActivePollsPaginatedUseCase,
    private readonly getOngoingPollsPaginatedUseCase: GetOngoingPollsPaginatedUseCase,
    private readonly getPollsByCreatorPaginatedUseCase: GetPollsByCreatorPaginatedUseCase,
    private readonly updatePollTransactionStatusUseCase: UpdatePollTransactionStatusUseCase,
    private readonly activatePollUseCase: ActivatePollUseCase,
    private readonly updateVoterHashUseCase: UpdateVoterHashUseCase,
  ) {}

  /**
   * Helper method to transform poll(s) with vote count from Vote module
   * Uses CQRS QueryBus for loose coupling between modules
   */
  private async transformPollWithVoteCount(
    poll: Poll,
    includeRelations = false,
  ): Promise<PollResponseDto> {
    const voteCount = await this.queryBus.execute<
      GetPollVoteCountQuery,
      number
    >(new GetPollVoteCountQuery(poll.id));
    return PollResponseDto.fromEntity(poll, includeRelations, voteCount);
  }

  /**
   * Helper method to transform multiple polls with vote counts
   * Uses batch query for better performance (single DB query)
   */
  private async transformPollsWithVoteCounts(
    polls: Poll[],
    includeRelations = false,
  ): Promise<PollResponseDto[]> {
    if (polls.length === 0) {
      return [];
    }

    // Batch query - single database call for all poll vote counts!
    const pollIds = polls.map((poll) => poll.id);
    const voteCountMap = await this.queryBus.execute<
      GetMultiplePollVoteCountsQuery,
      PollVoteCountMap
    >(new GetMultiplePollVoteCountsQuery(pollIds));

    // Transform all polls with their respective vote counts
    return polls.map((poll) => {
      const voteCount = voteCountMap[poll.id] || 0;
      return PollResponseDto.fromEntity(poll, includeRelations, voteCount);
    });
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createPollDto: CreatePollDto): Promise<PollResponseDto> {
    const poll = await this.createPollUseCase.execute(createPollDto);
    return this.transformPollWithVoteCount(poll, true);
  }

  @Get()
  async findAll(
    @Query() filters: PollFilterDto,
  ): Promise<IPaginatedResult<PollResponseDto>> {
    const result = await this.getAllPollsPaginatedUseCase.execute(filters);
    return {
      data: await this.transformPollsWithVoteCounts(result.data, true),
      meta: result.meta,
    };
  }

  @Get('active')
  async findActive(
    @Query() filters: PollFilterDto,
  ): Promise<IPaginatedResult<PollResponseDto>> {
    const result = await this.getActivePollsPaginatedUseCase.execute(filters);
    return {
      data: await this.transformPollsWithVoteCounts(result.data, true),
      meta: result.meta,
    };
  }

  @Get('ongoing')
  async findOngoing(
    @Query() filters: PollFilterDto,
  ): Promise<IPaginatedResult<PollResponseDto>> {
    const result = await this.getOngoingPollsPaginatedUseCase.execute(filters);
    return {
      data: await this.transformPollsWithVoteCounts(result.data, true),
      meta: result.meta,
    };
  }

  @Get('creator/:walletAddress')
  async findByCreator(
    @Param('walletAddress') walletAddress: string,
    @Query() filters: PollFilterDto,
  ): Promise<IPaginatedResult<PollResponseDto>> {
    const result = await this.getPollsByCreatorPaginatedUseCase.execute(
      walletAddress,
      filters,
    );
    return {
      data: await this.transformPollsWithVoteCounts(result.data, true),
      meta: result.meta,
    };
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<PollResponseDto> {
    const poll = await this.getPollByIdUseCase.execute(id);
    return this.transformPollWithVoteCount(poll, true);
  }

  @Get(':id/eligibility')
  async checkEligibility(
    @Param('id') id: string,
    @Query('walletAddress') walletAddress: string,
  ): Promise<{ eligible: boolean; reason?: string }> {
    return await this.checkVotingEligibilityUseCase.execute(id, walletAddress);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updatePollDto: UpdatePollDto,
  ): Promise<PollResponseDto> {
    const poll = await this.updatePollUseCase.execute(id, updatePollDto);
    return this.transformPollWithVoteCount(poll, true);
  }

  @Put(':id/transaction-status')
  async updateTransactionStatus(
    @Param('id') id: string,
    @Body() updateTransactionStatusDto: UpdateTransactionStatusDto,
  ): Promise<PollResponseDto> {
    const poll = await this.updatePollTransactionStatusUseCase.execute(
      id,
      updateTransactionStatusDto.transactionStatus,
    );
    return this.transformPollWithVoteCount(poll, true);
  }

  @Post(':id/activate')
  async activate(@Param('id') id: string): Promise<PollResponseDto> {
    const poll = await this.activatePollUseCase.execute(id);
    return this.transformPollWithVoteCount(poll, true);
  }

  @Put(':id/update-voter-hash')
  async updateVoterHash(
    @Param('id') poolHash: string,
    @Body() updateVoterHashDto: UpdateVoterHashDto,
  ): Promise<PollResponseDto> {
    const poll = await this.updateVoterHashUseCase.execute(
      poolHash,
      updateVoterHashDto.voterHash,
    );
    return PollResponseDto.fromEntity(poll, true);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string): Promise<void> {
    await this.deletePollUseCase.execute(id);
  }
}
