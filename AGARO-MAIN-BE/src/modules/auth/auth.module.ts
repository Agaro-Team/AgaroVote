import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';

// Entities
import { Nonce } from './domain/entities/nonce.entity';

// Repositories
import { NONCE_REPOSITORY } from './domain/repositories/nonce-repository.interface';
import { TypeOrmNonceRepository } from './infrastructure/repositories/typeorm-nonce.repository';

// Services
import { AuthService } from './application/services/auth.service';
import { AuthJwtService } from './application/services/jwt.service';

// Strategies
import { JwtStrategy } from './infrastructure/strategies/jwt.strategy';

// Controllers
import { AuthController } from './presentation/controllers/auth.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([Nonce]),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        const secret = configService.get<string>('JWT_SECRET');
        if (!secret) {
          throw new Error('JWT_SECRET is not defined in environment variables');
        }
        const expiresIn = configService.get<string>('JWT_EXPIRES_IN') || '7d';
        return {
          secret,
          signOptions: {
            expiresIn: expiresIn as unknown as number,
          },
        };
      },
      inject: [ConfigService],
    }),
  ],
  controllers: [AuthController],
  providers: [
    // Services
    AuthService,
    AuthJwtService,
    JwtStrategy,
    // Repositories
    {
      provide: NONCE_REPOSITORY,
      useClass: TypeOrmNonceRepository,
    },
  ],
  exports: [AuthService, AuthJwtService, JwtStrategy],
})
export class AuthModule {}
