import {
  ConflictException,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Category } from 'src/entities/category.entity';
import { EntityRepository, Repository } from 'typeorm';
import _ = require('lodash');
import { IssueType } from '../../entities/issue-type.entity';

@EntityRepository(IssueType)
export class IssueTypeRepository extends Repository<IssueType> {
  private logger = new Logger(IssueTypeRepository.name);

  constructor(
    @InjectRepository(IssueType)
    private issueTypeRepository: Repository<IssueType>,
  ) {
    super(
      issueTypeRepository.target,
      issueTypeRepository.manager,
      issueTypeRepository.queryRunner,
    );
  }
  async createIssueType(issueTypeData: IssueType): Promise<IssueType> {
    try {
      const issueType = this.create(issueTypeData);
      const issueTypeCreated = await this.save(issueType);

      return issueTypeCreated;
    } catch (err) {
      this.logger.error(err);
      if (err.code === '23505') {
        throw new ConflictException('Name already exists');
      }

      throw new InternalServerErrorException('Something error query');
    }
  }

  async getIssueTypeById(issueTypeID: number): Promise<IssueType> {
    const issueType = await this.findOne({
      where: {
        id: issueTypeID,
      },
    });
    return issueType;
  }

  async getIssueTypeByName(name: string): Promise<IssueType> {
    const issueType = await this.findOne({
      where: {
        name,
      },
    });
    return issueType;
  }
}
