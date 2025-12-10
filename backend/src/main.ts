import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    cors: {
      origin: process.env.CORS_ORIGIN 
        ? process.env.CORS_ORIGIN.split(',')
        : [
            'http://localhost:5173',
            'http://localhost:5174',
            'http://localhost:3000',
            'http://98.83.39.97',
            'http://98.83.39.97:80',
          ],
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
    },
  });

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // API prefix
  app.setGlobalPrefix(process.env.API_PREFIX || 'api');

  // Swagger documentation
  const config = new DocumentBuilder()
    .setTitle('Dentist Queue Management API')
    .setDescription('API documentation for Dentist Clinic Queue Management System')
    .setVersion('1.0')
    .addTag('patients', 'Patient management endpoints')
    .addTag('appointments', 'Appointment scheduling endpoints')
    .addTag('queue', 'Queue management endpoints')
    .addTag('rooms', 'Room management endpoints')
    .addTag('providers', 'Dentist provider endpoints')
    .addTag('notifications', 'Notification endpoints')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`🚀 Application is running on: http://localhost:${port}`);
  console.log(`📚 API Documentation: http://localhost:${port}/api/docs`);
}

bootstrap();

