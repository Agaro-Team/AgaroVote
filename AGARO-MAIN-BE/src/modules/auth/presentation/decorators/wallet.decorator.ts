import { createParamDecorator, ExecutionContext } from '@nestjs/common';

/**
 * Wallet Decorator
 *
 * Extracts the authenticated wallet address from the request
 * Must be used with JwtAuthGuard
 *
 * @example
 * ```ts
 * @UseGuards(JwtAuthGuard)
 * @Post('create-poll')
 * createPoll(@Wallet() walletAddress: string, @Body() dto: CreatePollDto) {
 *   // walletAddress is automatically extracted from JWT
 *   return this.pollService.create(walletAddress, dto);
 * }
 * ```
 */
export const Wallet = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): string => {
    const request = ctx.switchToHttp().getRequest<{
      user: {
        walletAddress: string;
      };
    }>();
    return request.user?.walletAddress;
  },
);

/**
 * Optional Wallet Decorator
 *
 * Extracts wallet address if authenticated, otherwise returns undefined
 * Works without JwtAuthGuard (for optional authentication)
 *
 * @example
 * ```ts
 * @Get('polls')
 * getPolls(@OptionalWallet() walletAddress?: string) {
 *   // walletAddress might be undefined
 *   if (walletAddress) {
 *     return this.pollService.getForUser(walletAddress);
 *   }
 *   return this.pollService.getPublic();
 * }
 * ```
 */
export const OptionalWallet = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): string | undefined => {
    const request = ctx.switchToHttp().getRequest<{
      user: {
        walletAddress: string;
      };
    }>();
    return request.user?.walletAddress || undefined;
  },
);
