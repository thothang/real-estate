import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';
    let code = 'INTERNAL_SERVER_ERROR';
    let details: unknown[] = [];

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const res = exception.getResponse();

      if (typeof res === 'string') {
        message = res;
      } else if (typeof res === 'object' && res !== null) {
        const body = res as any;
        message = body.message ?? message;
        details = Array.isArray(body.message) ? body.message : body.details ?? [];
        code =
          body.code ??
          HttpStatus[status] ??
          (status >= 500 ? 'INTERNAL_SERVER_ERROR' : 'BAD_REQUEST');
      }
    }

    response.status(status).json({
      success: false,
      error: {
        code,
        message,
        details,
        path: request.url,
        status,
      },
      timestamp: new Date().toISOString(),
    });
  }
}

