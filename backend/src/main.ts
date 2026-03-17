import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import {
  ClassSerializerInterceptor,
  ValidationPipe,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { join } from 'path';
import { NestExpressApplication } from '@nestjs/platform-express';
import * as express from 'express';
import { UnprocessableEntityException } from '@nestjs/common';
import type { ValidationError } from 'class-validator';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.enableCors({
    origin: ['http://localhost:3001'],
    credentials: true,
  });

  app.setGlobalPrefix('api/v1');

  app.use(
    '/uploads',
    express.static(join(process.cwd(), 'uploads')),
  );

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
      exceptionFactory: (errors: ValidationError[]) => {
        const details = (errors || []).flatMap((e) => {
          const constraints = e.constraints
            ? Object.values(e.constraints)
            : undefined;

          const base = constraints?.length
            ? constraints.map((issue) => ({ field: e.property, issue }))
            : [{ field: e.property, issue: 'Invalid value' }];

          const childDetails = (e.children || []).flatMap((c) => {
            const childConstraints = c.constraints
              ? Object.values(c.constraints)
              : undefined;
            return (childConstraints?.length
              ? childConstraints
              : ['Invalid value']
            ).map((issue) => ({ field: `${e.property}.${c.property}`, issue }));
          });

          return [...base, ...childDetails];
        });

        return new UnprocessableEntityException({
          code: 'VALIDATION_ERROR',
          message: 'Vui lòng kiểm tra lại thông tin nhập vào',
          details,
        });
      },
    }),
  );

  const reflector = app.get(Reflector);
  app.useGlobalInterceptors(
    new ClassSerializerInterceptor(reflector),
    new ResponseInterceptor(),
  );

  app.useGlobalFilters(new HttpExceptionFilter());

  await app.listen(process.env.PORT ?? 3000);
}
void bootstrap();
