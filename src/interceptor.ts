import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  SetMetadata,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiResponse, PaginatedResult, PaginationMeta } from './interfaces';

export const RESPONSE_MESSAGE_KEY = 'response_message';
export const SKIP_RESPONSE_FORMAT_KEY = 'skip_response_format';

@Injectable()
export class ResponseInterceptor implements NestInterceptor {
  constructor(private readonly reflector: Reflector) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const skip = this.reflector.getAllAndOverride<boolean>(SKIP_RESPONSE_FORMAT_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (skip) return next.handle();

    const message = this.reflector.getAllAndOverride<string>(RESPONSE_MESSAGE_KEY, [
      context.getHandler(),
      context.getClass(),
    ]) || 'Success';

    const statusCode = context.switchToHttp().getResponse().statusCode;

    return next.handle().pipe(
      map((result) => {
        if (this.isPaginatedResult(result)) {
          const { data, total, page, limit } = result;
          const totalPages = Math.ceil(total / limit);
          const meta: PaginationMeta = {
            page,
            limit,
            total,
            totalPages,
            hasNext: page < totalPages,
            hasPrev: page > 1,
          };
          return { success: true, statusCode, message, data, meta, timestamp: new Date().toISOString() };
        }

        return { success: true, statusCode, message, data: result, timestamp: new Date().toISOString() };
      }),
    );
  }

  private isPaginatedResult(result: any): result is PaginatedResult {
    return (
      result &&
      typeof result === 'object' &&
      Array.isArray(result.data) &&
      typeof result.total === 'number' &&
      typeof result.page === 'number' &&
      typeof result.limit === 'number'
    );
  }
}
