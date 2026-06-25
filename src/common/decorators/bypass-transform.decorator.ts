import { SetMetadata } from '@nestjs/common';

export const BYPASS_TRANSFORM_KEY = 'bypassTransform';

/**
 * Decorator to bypass the global/controller TransformInterceptor.
 */
export const BypassTransform = () => SetMetadata(BYPASS_TRANSFORM_KEY, true);
