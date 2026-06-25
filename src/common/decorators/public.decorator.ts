import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'isPublic';

/**
 * Decorator to mark endpoints as publicly accessible, bypassing global/controller authentication guards.
 */
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
