import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Language, User } from 'src/entities';
import { UserModule } from '../user/user.module';
import { UserRepository } from '../user/user.repository';
import { LanguageController } from './language.controller';
import { LanguageService } from './language.service';
import { LanguageRepository } from './language.repository';

@Module({
  imports: [TypeOrmModule.forFeature([Language, User]), UserModule],
  providers: [LanguageService, LanguageRepository, UserRepository],
  controllers: [LanguageController],
  exports: [LanguageService, LanguageRepository],
})
export class LanguageModule {}
