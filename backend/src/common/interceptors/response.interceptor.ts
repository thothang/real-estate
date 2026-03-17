import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

interface ResponseShape<T> {
  data?: T;
  meta?: unknown;
  message?: string;
}

@Injectable()
export class ResponseInterceptor<T>
  implements NestInterceptor<T, any>
{
  intercept(
    context: ExecutionContext,
    next: CallHandler<T>,
  ): Observable<any> {
    return next.handle().pipe(
      map((value: any) => {
        const now = new Date().toISOString();

        const { data, meta, message }: ResponseShape<T> =
          typeof value === 'object' && value !== null
            ? {
                data:
                  Object.prototype.hasOwnProperty.call(value, 'data') &&
                  value.data !== undefined
                    ? value.data
                    : value,
                meta: value.meta,
                message: value.message,
              }
            : { data: value, meta: undefined, message: undefined };

        return {
          success: true,
          message: message ?? 'Success',
          data,
          ...(meta ? { meta } : {}),
          timestamp: now,
        };
      }),
    );
  }
}

