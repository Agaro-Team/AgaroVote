import { Public } from '@modules/auth/presentation/decorators/public.decorator';
import { Wallet } from '@modules/auth/presentation/decorators/wallet.decorator';
import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
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
  async create(
    @Wallet() walletAddress: string,
    @Body() createPollDto: CreatePollDto,
  ): Promise<PollResponseDto> {
    if (
      createPollDto.creatorWalletAddress.toLowerCase() !==
      walletAddress.toLowerCase()
    ) {
      throw new ForbiddenException(
        'You can only create polls with your own wallet address',
      );
    }
    const poll = await this.createPollUseCase.execute(createPollDto);
    return PollResponseDto.fromEntity(poll, true);
  }

  @Public()
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

  @Public()
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

  @Public()
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

  @Public()
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

  @Public()
  @Get(':id')
  async findOne(@Param('id') id: string): Promise<PollResponseDto> {
    const poll = await this.getPollByIdUseCase.execute(id);
    return PollResponseDto.fromEntity(poll, true);
  }

  @Public()
  @Get(':id/eligibility')
  async checkEligibility(
    @Param('id') id: string,
    @Query('walletAddress') walletAddress: string,
  ): Promise<{ eligible: boolean; reason?: string }> {
    return await this.checkVotingEligibilityUseCase.execute(id, walletAddress);
  }

  @Put(':id')
  async update(
    @Wallet() walletAddress: string,
    @Param('id') id: string,
    @Body() updatePollDto: UpdatePollDto,
  ): Promise<PollResponseDto> {
    // TODO: Add authorization check - only poll creator can update
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

  @Public()
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
  async remove(
    @Wallet() walletAddress: string,
    @Param('id') id: string,
  ): Promise<void> {
    // TODO: Add authorization check - only poll creator can delete
    await this.deletePollUseCase.execute(id);
  }
}
