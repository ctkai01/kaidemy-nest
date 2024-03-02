import {
  ClassSerializerInterceptor,
  Logger,
  ValidationPipe,
} from '@nestjs/common';
import { NestFactory, Reflector } from '@nestjs/core';
import { getManager } from 'typeorm';
import { AppModule } from './app.module';

const PORT = 3000;
async function bootstrap() {
  const logger = new Logger('bootstrap');
  // await getManager().query(`SET GLOBAL time_zone = 'Asia/Ho_Chi_Minh';`);
  // await getManager().query(`SET time_zone = 'Asia/Ho_Chi_Minh';`);
  const app = await NestFactory.create(AppModule);
  app.enableCors();
  app.useGlobalPipes(new ValidationPipe());
  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));
  app.setGlobalPrefix('/api');

  await app.listen(PORT);
  logger.log(`Application listening on port ${PORT}`);
}
bootstrap();
