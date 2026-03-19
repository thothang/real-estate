import { Test, TestingModule } from '@nestjs/testing';
import {
  ClassSerializerInterceptor,
  INestApplication,
  ValidationPipe,
} from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';
import { Reflector } from '@nestjs/core';
import { ResponseInterceptor } from '../src/common/interceptors/response.interceptor';
import { HttpExceptionFilter } from '../src/common/filters/http-exception.filter';
import type { ValidationError } from 'class-validator';
import { UnprocessableEntityException } from '@nestjs/common';
import { PrismaService } from '../src/database/prisma.service';
import { UserRole, ContactStatus, ListingStatus } from '@prisma/client';
import * as bcrypt from 'bcrypt';

describe('AppController (e2e)', () => {
  let app: INestApplication<App>;
  let prisma: PrismaService;
  let accessToken: string;
  let contactRequestId: string;
  let propertyId: string;
  const adminEmail = 'admin.e2e@email.com';
  const adminPassword = '123456';

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();

    // Mirror main.ts behavior so e2e checks match real API shape.
    app.setGlobalPrefix('api/v1');

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
              return (
                childConstraints?.length ? childConstraints : ['Invalid value']
              ).map((issue) => ({
                field: `${e.property}.${c.property}`,
                issue,
              }));
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

    await app.init();

    prisma = app.get(PrismaService);

    // Cleanup previous run if any
    await prisma.contactRequest.deleteMany({
      where: { customerEmail: adminEmail },
    });
    await prisma.property.deleteMany({
      where: { title: { startsWith: 'E2E Property' } },
    });
    await prisma.user.deleteMany({ where: { email: adminEmail } });

    // Create admin user directly via DB to bypass register restrictions.
    const passwordHash = await bcrypt.hash(adminPassword, 10);
    const admin = await prisma.user.create({
      data: {
        name: 'Admin E2E',
        email: adminEmail,
        passwordHash,
        role: UserRole.admin,
      },
    });

    const property = await prisma.property.create({
      data: {
        title: 'E2E Property 1',
        slug: 'e2e-property-1',
        propertyType: 'house',
        listingType: 'sale',
        price: 1000,
        status: ListingStatus.published,
        postedBy: admin.id,
      },
    });
    propertyId = property.id;

    const contact = await prisma.contactRequest.create({
      data: {
        propertyId: property.id,
        customerName: 'Customer E2E',
        customerPhone: '0900000000',
        customerEmail: adminEmail,
        message: 'Hello',
        status: ContactStatus.new,
      },
    });
    contactRequestId = contact.id;
  });

  afterAll(async () => {
    if (prisma) {
      await prisma.contactRequest.deleteMany({
        where: { customerEmail: adminEmail },
      });
      await prisma.property.deleteMany({
        where: { title: { startsWith: 'E2E Property' } },
      });
      await prisma.user.deleteMany({ where: { email: adminEmail } });
    }
    await app?.close();
  });

  it('/ (GET)', () => {
    return request(app.getHttpServer())
      .get('/api/v1')
      .expect(200)
      .expect((res) => {
        if (res.body?.success !== true) {
          throw new Error('Expected success=true');
        }
        if (res.body?.data !== 'Hello World!') {
          throw new Error(`Unexpected data: ${String(res.body?.data)}`);
        }
      });
  });

  it('auth/login (POST) should return accessToken', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({
        email: adminEmail,
        password: adminPassword,
      })
      .expect(201);

    expect(res.body?.success).toBe(true);
    expect(res.body?.data?.accessToken).toBeTruthy();
    accessToken = res.body.data.accessToken;
  });

  it('admin/contacts (GET) should list contact requests with meta', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/v1/admin/contacts?page=1&limit=20&status=new')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    expect(res.body?.success).toBe(true);
    expect(Array.isArray(res.body?.data)).toBe(true);
    expect(res.body?.meta?.page).toBe(1);
    expect(res.body?.meta?.limit).toBe(20);

    const first = res.body.data[0];
    expect(first).toHaveProperty('property');
    expect(first.property).toHaveProperty('id');
    expect(first.property).toHaveProperty('title');
  });

  it('admin/contacts/:id (PUT) should update status and notes', async () => {
    const res = await request(app.getHttpServer())
      .put(`/api/v1/admin/contacts/${contactRequestId}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        status: 'contacted',
        notes: 'Called customer',
      })
      .expect(200);

    expect(res.body?.success).toBe(true);
    expect(res.body?.data?.id).toBe(contactRequestId);
    expect(res.body?.data?.status).toBe('contacted');
    expect(res.body?.data?.notes).toBe('Called customer');
  });
});
