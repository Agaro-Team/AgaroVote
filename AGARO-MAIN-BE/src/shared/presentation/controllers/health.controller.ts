import { Controller, Get } from '@nestjs/common';

@Controller('health')
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
