import { Module } from '@nestjs/common';
import { APP_FILTER, APP_INTERCEPTOR, APP_PIPE, APP_GUARD } from '@nestjs/core';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { AppController } from '@/app.controller';
import { AppService } from '@/app.service';
import { ConfigModule } from '@config/config.module';
import { DatabaseModule } from '@shared/infrastructure/database/database.module';
import { CacheModule } from '@shared/infrastructure/cache';
import { AllExceptionsFilter } from '@shared/presentation/filters/http-exception.filter';
import { TransformInterceptor } from '@shared/presentation/interceptors/transform.interceptor';
import { ValidationPipe } from '@shared/presentation/pipes/validation.pipe';
import { HealthController } from '@shared/presentation/controllers/health.controller';
import { UserModule } from '@modules/user/user.module';
import { PollModule } from './modules/poll/poll.module';
import { VoteModule } from './modules/vote/vote.module';
import { AuthModule } from './modules/auth/auth.module';
import { JwtAuthGuard } from './modules/auth/presentation/guards/jwt-auth.guard';
import { RewardModule } from './modules/reward/reward.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';

@Module({
  imports: [
    ConfigModule,
    DatabaseModule,
    CacheModule, // Redis Cache Module
    // Rate limiting - prevent spam and DDoS attacks
    ThrottlerModule.forRoot([
      {
        ttl: 60000, // Time window in milliseconds (1 minute)
        limit: 100, // Max requests per time window
      },
    ]),

    // Feature modules
    AuthModule,
    DashboardModule,
    UserModule,
    PollModule,
    VoteModule,
    RewardModule,
  ],
  controllers: [AppController, HealthController],
  providers: [
    AppService,
    {
      provide: APP_FILTER,
      useClass: AllExceptionsFilter,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: TransformInterceptor,
    },
    {
      provide: APP_PIPE,
      useClass: ValidationPipe,
    },
    // Global rate limiting
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    // Global JWT authentication (use @Public() decorator to bypass)
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule {}
