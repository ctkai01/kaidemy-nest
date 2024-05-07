import {
  ConflictException,
  Injectable,
  Logger,
  NotFoundException
} from '@nestjs/common';
import { PageMetaDto } from 'src/common/paginate/page-meta.dto';
import { PageCommonOptionsDto } from 'src/common/paginate/page-option.dto';
import { PageDto } from 'src/common/paginate/paginate.dto';
import { Language } from 'src/entities';
import { ResponseData } from '../../interface/response.interface';
import { CreateLanguageDto, UpdateLanguageDto } from './dto';
import { LanguageRepository } from './language.repository';

@Injectable()
export class LanguageService {
  private logger = new Logger(LanguageService.name);
  constructor(private readonly languageRepository: LanguageRepository) {}
  async createLanguage(
    createLanguageDto: CreateLanguageDto,
  ): Promise<ResponseData> {
    const { name } = createLanguageDto;
    const language: Language = {
      name,
    };

    const languageCreate =
      await this.languageRepository.createLanguage(language);

    const responseData: ResponseData = {
      message: 'Create language successfully!',
      data: languageCreate,
    };

    return responseData;
  }

  async updateLanguage(
    updateLanguageDto: UpdateLanguageDto,
    languageID: number,
  ): Promise<ResponseData> {
    const { name } = updateLanguageDto;

    const language = await this.languageRepository.getLanguageById(languageID);

    if (!language) {
      throw new NotFoundException('Language not found');
    }

    if (name) {
      const languageByName =
        await this.languageRepository.getLanguageByName(name);

      if (languageByName && languageByName.id !== languageID) {
        throw new ConflictException('Name already exists');
      }
      language.name = name;
    }

    await this.languageRepository.save(language);
    const responseData: ResponseData = {
      message: 'Update language successfully!',
      data: language,
    };

    return responseData;
  }

  async deleteLanguage(languageID: number): Promise<ResponseData> {
    const issueType =
      await this.languageRepository.getLanguageById(languageID);

    if (!issueType) {
      throw new NotFoundException('Language not found');
    }

    await this.languageRepository.delete(languageID);

    const responseData: ResponseData = {
      message: 'Delete language successfully!',
    };

    return responseData;
  }

  async getLanguages(
    pageCommonOptionsDto: PageCommonOptionsDto,
  ): Promise<ResponseData> {
    const queryBuilder =
      this.languageRepository.createQueryBuilder('language');
    queryBuilder.orderBy('language.created_at', pageCommonOptionsDto.order);

    queryBuilder
      .skip(pageCommonOptionsDto.skip)
      .take(pageCommonOptionsDto.size);

    const itemCount = await queryBuilder.getCount();
    const { entities } = await queryBuilder.getRawAndEntities();

    const pageMetaDto = new PageMetaDto({
      itemCount,
      pageOptionsDto: pageCommonOptionsDto,
    });
    const data = new PageDto(entities, pageMetaDto);

    const responseData: ResponseData = {
      message: 'Get languages successfully!',
      data,
    };

    return responseData;
  }
}
