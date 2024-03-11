import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Price, User } from 'src/entities';
import { UserModule } from '../user/user.module';
import { UserRepository } from '../user/user.repository';
import { PriceController } from './price.controller';
import { PriceRepository } from './price.repository';
import { PriceService } from './price.service';

@Module({
  imports: [TypeOrmModule.forFeature([Price, User]), UserModule],
  providers: [PriceService, PriceRepository, UserRepository],
  controllers: [PriceController],
  exports: [PriceService, PriceRepository],
})
export class PriceModule {}
