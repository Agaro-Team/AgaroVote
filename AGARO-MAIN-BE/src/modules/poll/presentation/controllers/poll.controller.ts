import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  HttpCode,
  HttpStatus,
  Query,
} from '@nestjs/common';
import { CreatePollDto } from '../../application/dto/create-poll.dto';
import { UpdatePollDto } from '../../application/dto/update-poll.dto';
import { PollResponseDto } from '../../application/dto/poll-response.dto';
import { CreatePollUseCase } from '../../application/use-cases/create-poll.use-case';
import { GetPollByIdUseCase } from '../../application/use-cases/get-poll-by-id.use-case';
import { GetAllPollsUseCase } from '../../application/use-cases/get-all-polls.use-case';
import { UpdatePollUseCase } from '../../application/use-cases/update-poll.use-case';
import { DeletePollUseCase } from '../../application/use-cases/delete-poll.use-case';
import { GetPollsByCreatorUseCase } from '../../application/use-cases/get-polls-by-creator.use-case';
import { GetActivePollsUseCase } from '../../application/use-cases/get-active-polls.use-case';
import { GetOngoingPollsUseCase } from '../../application/use-cases/get-ongoing-polls.use-case';
import { CheckVotingEligibilityUseCase } from '../../application/use-cases/check-voting-eligibility.use-case';

@Controller('polls')
export class PollController {
  constructor(
    private readonly createPollUseCase: CreatePollUseCase,
    private readonly getPollByIdUseCase: GetPollByIdUseCase,
    private readonly getAllPollsUseCase: GetAllPollsUseCase,
    private readonly updatePollUseCase: UpdatePollUseCase,
    private readonly deletePollUseCase: DeletePollUseCase,
    private readonly getPollsByCreatorUseCase: GetPollsByCreatorUseCase,
    private readonly getActivePollsUseCase: GetActivePollsUseCase,
    private readonly getOngoingPollsUseCase: GetOngoingPollsUseCase,
    private readonly checkVotingEligibilityUseCase: CheckVotingEligibilityUseCase,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createPollDto: CreatePollDto): Promise<PollResponseDto> {
    const poll = await this.createPollUseCase.execute(createPollDto);
    return PollResponseDto.fromEntity(poll, true);
  }

  @Get()
  async findAll(): Promise<PollResponseDto[]> {
    const polls = await this.getAllPollsUseCase.execute();
    return polls.map((poll) => PollResponseDto.fromEntity(poll, false));
  }

  @Get('active')
  async findActive(): Promise<PollResponseDto[]> {
    const polls = await this.getActivePollsUseCase.execute();
    return polls.map((poll) => PollResponseDto.fromEntity(poll, true));
  }

  @Get('ongoing')
  async findOngoing(): Promise<PollResponseDto[]> {
    const polls = await this.getOngoingPollsUseCase.execute();
    return polls.map((poll) => PollResponseDto.fromEntity(poll, true));
  }

  @Get('creator/:walletAddress')
  async findByCreator(
    @Param('walletAddress') walletAddress: string,
  ): Promise<PollResponseDto[]> {
    const polls = await this.getPollsByCreatorUseCase.execute(walletAddress);
    return polls.map((poll) => PollResponseDto.fromEntity(poll, true));
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

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string): Promise<void> {
    await this.deletePollUseCase.execute(id);
  }
}
