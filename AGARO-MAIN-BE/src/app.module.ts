import { Module } from '@nestjs/common';
import { APP_FILTER, APP_INTERCEPTOR, APP_PIPE } from '@nestjs/core';
import { AppController } from '@/app.controller';
import { AppService } from '@/app.service';
import { ConfigModule } from '@config/config.module';
import { DatabaseModule } from '@shared/infrastructure/database/database.module';
import { AllExceptionsFilter } from '@shared/presentation/filters/http-exception.filter';
import { TransformInterceptor } from '@shared/presentation/interceptors/transform.interceptor';
import { ValidationPipe } from '@shared/presentation/pipes/validation.pipe';
import { HealthController } from '@shared/presentation/controllers/health.controller';
import { UserModule } from '@modules/user/user.module';
import { PollModule } from './modules/poll/poll.module';

@Module({
  imports: [ConfigModule, DatabaseModule, UserModule, PollModule],
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
  ],
})
export class AppModule {}
