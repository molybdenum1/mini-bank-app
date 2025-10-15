import { NestFactory } from '@nestjs/core';
// ensure `crypto.randomUUID` is available in all runtime environments
// TypeORM/Nest packages may call crypto at import-time in some builds
import * as nodeCrypto from 'crypto';

if (typeof globalThis.crypto === 'undefined') {
  // Assign only the randomUUID method to globalThis.crypto to avoid type conflicts
  globalThis.crypto = {
    randomUUID: nodeCrypto.randomUUID,
  } as Crypto;
}
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: false,
      validationError: { target: false },
      stopAtFirstError: false,
    }),
  );
  // enable CORS for all origins (adjust in production)
  app.enableCors();
  app.useGlobalFilters(new AllExceptionsFilter());
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap().catch((e) => {
  console.error(e);
  process.exit(1);
});
