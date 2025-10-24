import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CqrsModule } from '@nestjs/cqrs';
import { Poll } from './domain/entities/poll.entity';
import { PollChoice } from './domain/entities/poll-choice.entity';
import { PollAddress } from './domain/entities/poll-address.entity';
import { POLL_REPOSITORY } from './domain/repositories/poll-repository.interface';
import { POLL_CHOICE_REPOSITORY } from './domain/repositories/poll-choice-repository.interface';
import { POLL_ADDRESS_REPOSITORY } from './domain/repositories/poll-address-repository.interface';
import { TypeORMPollRepository } from './infrastructure/repositories/typeorm-poll.repository';
import { TypeORMPollChoiceRepository } from './infrastructure/repositories/typeorm-poll-choice.repository';
import { TypeORMPollAddressRepository } from './infrastructure/repositories/typeorm-poll-address.repository';
import { PollController } from './presentation/controllers/poll.controller';
import { CreatePollUseCase } from './application/use-cases/create-poll.use-case';
import { GetPollByIdUseCase } from './application/use-cases/get-poll-by-id.use-case';
import { GetAllPollsUseCase } from './application/use-cases/get-all-polls.use-case';
import { UpdatePollUseCase } from './application/use-cases/update-poll.use-case';
import { DeletePollUseCase } from './application/use-cases/delete-poll.use-case';
import { GetPollsByCreatorUseCase } from './application/use-cases/get-polls-by-creator.use-case';
import { GetActivePollsUseCase } from './application/use-cases/get-active-polls.use-case';
import { GetOngoingPollsUseCase } from './application/use-cases/get-ongoing-polls.use-case';
import { CheckVotingEligibilityUseCase } from './application/use-cases/check-voting-eligibility.use-case';
import { GetAllPollsPaginatedUseCase } from './application/use-cases/get-all-polls-paginated.use-case';
import { GetActivePollsPaginatedUseCase } from './application/use-cases/get-active-polls-paginated.use-case';
import { GetOngoingPollsPaginatedUseCase } from './application/use-cases/get-ongoing-polls-paginated.use-case';
import { GetPollsByCreatorPaginatedUseCase } from './application/use-cases/get-polls-by-creator-paginated.use-case';
import { UpdatePollTransactionStatusUseCase } from './application/use-cases/update-poll-transaction-status.use-case';
import { ActivatePollUseCase } from './application/use-cases/activate-poll.use-case';
import { UpdateVoterHashUseCase } from './application/use-cases/update-voter-hash.use-case';
import { GetInvitedAddressesByPollPaginatedUseCase } from './application/use-cases/get-invited-addresses-by-poll-paginated.use-case';
import { CheckVotingEligibilityHandler } from './application/queries/check-voting-eligibility/check-voting-eligibility.handler';
import {
  ActivatePollFromCacheUseCase,
  StorePendingPollUseCase,
} from './application/use-cases/create-poll-with-cache.use-case';

@Module({
  imports: [
    TypeOrmModule.forFeature([Poll, PollChoice, PollAddress]),
    CqrsModule,
  ],
  controllers: [PollController],
  providers: [
    {
      provide: POLL_REPOSITORY,
      useClass: TypeORMPollRepository,
    },
    {
      provide: POLL_CHOICE_REPOSITORY,
      useClass: TypeORMPollChoiceRepository,
    },
    {
      provide: POLL_ADDRESS_REPOSITORY,
      useClass: TypeORMPollAddressRepository,
    },
    ActivatePollFromCacheUseCase,
    StorePendingPollUseCase,
    CreatePollUseCase,
    GetPollByIdUseCase,
    GetAllPollsUseCase,
    UpdatePollUseCase,
    DeletePollUseCase,
    GetPollsByCreatorUseCase,
    GetActivePollsUseCase,
    GetOngoingPollsUseCase,
    CheckVotingEligibilityUseCase,
    GetAllPollsPaginatedUseCase,
    GetActivePollsPaginatedUseCase,
    GetOngoingPollsPaginatedUseCase,
    GetPollsByCreatorPaginatedUseCase,
    UpdatePollTransactionStatusUseCase,
    ActivatePollFromCacheUseCase,
    ActivatePollUseCase,
    UpdateVoterHashUseCase,
    GetInvitedAddressesByPollPaginatedUseCase,
    // CQRS Handlers
    CheckVotingEligibilityHandler,
  ],
  exports: [POLL_REPOSITORY, POLL_CHOICE_REPOSITORY, POLL_ADDRESS_REPOSITORY],
})
export class PollModule {}
