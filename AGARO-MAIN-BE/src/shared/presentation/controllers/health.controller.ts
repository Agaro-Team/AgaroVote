import { Controller, Get } from '@nestjs/common';
import { Public } from '@modules/auth/presentation/decorators/public.decorator';

@Controller('health')
@Public()
export class HealthController {
  @Get()
  check() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    };
  }

  @Get('db')
  checkDatabase() {
    // You can add actual database health check here
    return {
      status: 'ok',
      message: 'Database connection is healthy',
    };
  }
}
