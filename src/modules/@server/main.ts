import 'module-alias/register';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe, Logger } from '@nestjs/common';

const PORT = process.env.PORT ?? 3000;

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: [process.env.APP_URL],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  app.useGlobalPipes(new ValidationPipe());
  await app.listen(PORT);
}
bootstrap()
  .then(() => {
    Logger.log(`Server Running on port ${PORT}`, 'Bootstrap');
  })
  .catch((e) => {
    Logger.error(`Server crashed with error: ${e}`, 'Bootstrap');
  });
