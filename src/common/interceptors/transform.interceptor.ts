import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  StreamableFile,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Reflector } from '@nestjs/core';
import { BYPASS_TRANSFORM_KEY } from '../decorators/bypass-transform.decorator';

/**
 * Interface defining the standardized structure of all API responses.
 */
export interface ResponseEnvelope<T> {
  data: T;
}

/**
 * NestJS Interceptor that wraps all successful API responses in a standardized 'data' envelope.
 * Bypasses responses that are already wrapped, are file streams (StreamableFile), or are marked with @BypassTransform().
 */
@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<T, any> {
  constructor(private readonly reflector: Reflector) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const isBypassed = this.reflector.getAllAndOverride<boolean>(BYPASS_TRANSFORM_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isBypassed) {
      return next.handle();
    }

    return next.handle().pipe(
      map(data => {
        // Bypass if it is a StreamableFile
        if (data instanceof StreamableFile) {
          return data;
        }

        // Avoid double wrapping if response is already wrapped in a 'data' envelope
        if (data && typeof data === 'object' && 'data' in data) {
          return data;
        }

        return { data: data ?? null };
      }),
    );
  }
}
