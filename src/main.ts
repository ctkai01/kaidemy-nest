import {
  ClassSerializerInterceptor,
  Logger,
  ValidationPipe,
} from '@nestjs/common';
import { NestFactory, Reflector } from '@nestjs/core';
import { getManager } from 'typeorm';
import { AppModule } from './app.module';
import rawBodyMiddleware from './middleware/rawBody.middleware';

const PORT = 3000;
async function bootstrap() {
  const logger = new Logger('bootstrap');
  // await getManager().query(`SET GLOBAL time_zone = 'Asia/Ho_Chi_Minh';`);
  // await getManager().query(`SET time_zone = 'Asia/Ho_Chi_Minh';`);
  const app = await NestFactory.create(AppModule, { rawBody: true});
  app.enableCors();
  // app.use(rawBodyMiddleware());
  app.useGlobalPipes(new ValidationPipe({ transform: true }));
  // app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));
  app.setGlobalPrefix('/api');

  await app.listen(PORT);
  logger.log(`Application listening on port ${PORT}`);
}
bootstrap();
