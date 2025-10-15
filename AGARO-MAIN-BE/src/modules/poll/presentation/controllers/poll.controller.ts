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

@Controller('polls')
export class PollController {
  constructor(
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

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createPollDto: CreatePollDto): Promise<PollResponseDto> {
    const poll = await this.createPollUseCase.execute(createPollDto);
    return PollResponseDto.fromEntity(poll, true);
  }

  @Get()
  async findAll(
    @Query() filters: PollFilterDto,
  ): Promise<IPaginatedResult<PollResponseDto>> {
    const result = await this.getAllPollsPaginatedUseCase.execute(filters);
    return {
      data: result.data.map((poll) => PollResponseDto.fromEntity(poll, true)),
      meta: result.meta,
    };
  }

  @Get('active')
  async findActive(
    @Query() filters: PollFilterDto,
  ): Promise<IPaginatedResult<PollResponseDto>> {
    const result = await this.getActivePollsPaginatedUseCase.execute(filters);
    return {
      data: result.data.map((poll) => PollResponseDto.fromEntity(poll, true)),
      meta: result.meta,
    };
  }

  @Get('ongoing')
  async findOngoing(
    @Query() filters: PollFilterDto,
  ): Promise<IPaginatedResult<PollResponseDto>> {
    const result = await this.getOngoingPollsPaginatedUseCase.execute(filters);
    return {
      data: result.data.map((poll) => PollResponseDto.fromEntity(poll, true)),
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
      data: result.data.map((poll) => PollResponseDto.fromEntity(poll, true)),
      meta: result.meta,
    };
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<PollResponseDto> {
    const poll = await this.getPollByIdUseCase.execute(id);
    return PollResponseDto.fromEntity(poll, true);
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
    return PollResponseDto.fromEntity(poll, true);
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
    return PollResponseDto.fromEntity(poll, true);
  }

  @Post(':id/activate')
  async activate(@Param('id') id: string): Promise<PollResponseDto> {
    const poll = await this.activatePollUseCase.execute(id);
    return PollResponseDto.fromEntity(poll, true);
  }

  @Put(':id/update-voter-hash')
  async updateVoterHash(
    @Param('id') pollHash: string,
    @Body() updateVoterHashDto: UpdateVoterHashDto,
  ): Promise<PollResponseDto> {
    const poll = await this.updateVoterHashUseCase.execute(
      pollHash,
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
