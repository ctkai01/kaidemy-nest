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
import { Language } from 'src/entities';

@EntityRepository(Language)
export class LanguageRepository extends Repository<Language> {
  private logger = new Logger(LanguageRepository.name);

  constructor(
    @InjectRepository(Language)
    private languageRepository: Repository<Language>,
  ) {
    super(
      languageRepository.target,
      languageRepository.manager,
      languageRepository.queryRunner,
    );
  }
  async createLanguage(languageData: Language): Promise<Language> {
    try {
      const language = this.create(languageData);
      const languageCreated = await this.save(language);

      return languageCreated;
    } catch (err) {
      this.logger.error(err);
      if (err.code === '23505') {
        throw new ConflictException('Name already exists');
      }

      throw new InternalServerErrorException('Something error query');
    }
  }

  async getLanguageById(languageID: number): Promise<Language> {
    const language = await this.findOne({
      where: {
        id: languageID,
      },
    });
    return language;
  }

  async getLanguageByName(name: string): Promise<Language> {
    const language = await this.findOne({
      where: {
        name,
      },
    });
    return language;
  }

}
