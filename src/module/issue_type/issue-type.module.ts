import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { IssueType, User } from 'src/entities';
import { UserModule } from '../user/user.module';
import { UserRepository } from '../user/user.repository';
import { IssueTypeController } from './issue-type.controller';
import { IssueTypeRepository } from './issue-type.repository';
import { IssueTypeService } from './issue-type.service';

@Module({
  imports: [TypeOrmModule.forFeature([IssueType, User]), UserModule],
  providers: [IssueTypeService, IssueTypeRepository, UserRepository],
  controllers: [IssueTypeController],
  exports: [IssueTypeService, IssueTypeRepository],
})
export class IssueTypeModule {}
