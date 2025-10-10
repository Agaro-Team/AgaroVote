import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '@modules/user/domain/entities/user.entity';
import { USER_REPOSITORY } from '@modules/user/domain/repositories/user-repository.interface';
import { TypeOrmUserRepository } from '@modules/user/infrastructure/repositories/typeorm-user.repository';
import { UserController } from '@modules/user/presentation/controllers/user.controller';
import { CreateUserUseCase } from '@modules/user/application/use-cases/create-user.use-case';
import { GetUserByIdUseCase } from '@modules/user/application/use-cases/get-user-by-id.use-case';
import { GetAllUsersUseCase } from '@modules/user/application/use-cases/get-all-users.use-case';
import { UpdateUserUseCase } from '@modules/user/application/use-cases/update-user.use-case';
import { DeleteUserUseCase } from '@modules/user/application/use-cases/delete-user.use-case';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  controllers: [UserController],
  providers: [
    {
      provide: USER_REPOSITORY,
      useClass: TypeOrmUserRepository,
    },
    CreateUserUseCase,
    GetUserByIdUseCase,
    GetAllUsersUseCase,
    UpdateUserUseCase,
    DeleteUserUseCase,
  ],
  exports: [USER_REPOSITORY],
})
export class UserModule {}
