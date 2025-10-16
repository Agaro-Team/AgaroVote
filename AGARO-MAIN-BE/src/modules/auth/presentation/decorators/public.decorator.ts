import { SetMetadata } from '@nestjs/common';

/**
 * Public Decorator
 *
 * Marks a route as public (bypasses authentication)
 * Use this for routes that should be accessible without a JWT token
 *
 * @example
 * ```ts
 * @Public()
 * @Get('public-data')
 * getPublicData() {
 *   return { message: 'This is public' };
 * }
 * ```
 */
export const Public = () => SetMetadata('isPublic', true);
