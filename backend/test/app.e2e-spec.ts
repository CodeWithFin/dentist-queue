import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('AppController (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    app.setGlobalPrefix('api');

    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('/api/health (GET)', () => {
    it('should return health status', () => {
      return request(app.getHttpServer())
        .get('/api/health')
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('status', 'ok');
          expect(res.body).toHaveProperty('timestamp');
          expect(res.body).toHaveProperty('uptime');
        });
    });
  });

  describe('/api/patients (POST)', () => {
    it('should create a new patient', async () => {
      const createPatientDto = {
        firstName: 'Test',
        lastName: 'Patient',
        phone: `+${Date.now()}`,
        email: `test${Date.now()}@example.com`,
      };

      const response = await request(app.getHttpServer())
        .post('/api/patients')
        .send(createPatientDto)
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.firstName).toBe(createPatientDto.firstName);
      expect(response.body.lastName).toBe(createPatientDto.lastName);
    });

    it('should return 400 for invalid data', async () => {
      const invalidDto = {
        firstName: 'Test',
        // Missing required fields
      };

      await request(app.getHttpServer())
        .post('/api/patients')
        .send(invalidDto)
        .expect(400);
    });
  });

  describe('/api/patients (GET)', () => {
    it('should return an array of patients', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/patients')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
    });
  });
});

