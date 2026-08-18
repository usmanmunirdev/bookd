import { SetMetadata } from '@nestjs/common';

// Key used by guards to check if route is public
export const IS_PUBLIC_KEY = 'isPublic';

/**
 * Marks a route as public (no authentication required)
 * Usage: @Public() on controller method
 */
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
