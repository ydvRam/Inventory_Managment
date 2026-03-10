import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/filters/http-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: (origin, cb) => {
      const allowed = [
        'http://localhost:3000',
        'http://127.0.0.1:3000',
        'http://172.22.64.1:3000',
      ];
      if (process.env.CORS_ORIGIN) {
        allowed.push(...process.env.CORS_ORIGIN.split(','));
      }
      if (!origin || allowed.some((o) => origin === o)) {
        cb(null, true);
      } else {
        cb(null, false);
      }
    },
    credentials: true,
  });
  app.useGlobalFilters(new AllExceptionsFilter());
  await app.listen(process.env.PORT ?? 3001);
}
bootstrap();
