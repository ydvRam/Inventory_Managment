import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/filters/http-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: (origin: string, cb: (arg0: null, arg1: boolean) => void) => {
      const allowed = [
        'http://localhost:3000',
        'http://172.16.1.7:3000',
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
