import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

/**
 * NestJS Interceptor that logs incoming request paths, HTTP methods, and execution durations (latencies) in milliseconds.
 */
@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const now = Date.now(); // Record current timestamp when the request enters the interceptor
    
    const req = context.switchToHttp().getRequest(); // Extract the incoming HTTP request details
    const method = req.method; // e.g. GET, POST
    const url = req.url; // e.g. /students

    return next
      .handle()
      .pipe(
        // tap() runs a callback after the controller has processed the request successfully
        tap(() => console.log(`${method} ${url} ${Date.now() - now}ms`)),
      );
  }
}
