import {
  Injectable, Logger,
  NotFoundException
} from '@nestjs/common';
import { PageMetaDto } from 'src/common/paginate/page-meta.dto';
import { PageDto } from 'src/common/paginate/paginate.dto';
import { Level } from 'src/entities';
import { ResponseData } from '../../interface/response.interface';
import { CreateLevelDto, UpdateLevelDto } from './dto';
import { GetLevelDto } from './dto/get-level-dto';
import { LevelRepository } from './level.repository';

@Injectable()
export class LevelService {
  private logger = new Logger(LevelService.name);
  constructor(private readonly levelRepository: LevelRepository) {}
  async createLevel(createLevelDto: CreateLevelDto): Promise<ResponseData> {
    const { name } = createLevelDto;
    const level: Level = {
      name,
    };

    const levelCreate = await this.levelRepository.createLevel(level);

    const responseData: ResponseData = {
      message: 'Create level successfully!',
      data: levelCreate,
    };

    return responseData;
  }

  async updateLevel(
    updateLevelDto: UpdateLevelDto,
    levelID: number,
  ): Promise<ResponseData> {
    const { name } = updateLevelDto;

    const level = await this.levelRepository.getLevelById(levelID);

    if (!level) {
      throw new NotFoundException('Level not found');
    }

    level.name = name;

    await this.levelRepository.save(level);
    const responseData: ResponseData = {
      message: 'Update level successfully!',
      data: level,
    };

    return responseData;
  }

  async deleteLevel(levelID: number): Promise<ResponseData> {
    const level = await this.levelRepository.getLevelById(levelID);

    if (!level) {
      throw new NotFoundException('Level not found');
    }

    await this.levelRepository.delete(level.id);

    const responseData: ResponseData = {
      message: 'Delete level successfully!',
    };

    return responseData;
  }

  async getLevels(getLevelDto: GetLevelDto): Promise<ResponseData> {
    const queryBuilder = this.levelRepository.createQueryBuilder('level');
    queryBuilder.orderBy('level.created_at', getLevelDto.order);

    queryBuilder.skip(getLevelDto.skip).take(getLevelDto.size);

    const itemCount = await queryBuilder.getCount();
    const { entities } = await queryBuilder.getRawAndEntities();

    const pageMetaDto = new PageMetaDto({
      itemCount,
      pageOptionsDto: getLevelDto,
    });
    const data = new PageDto(entities, pageMetaDto);

    const responseData: ResponseData = {
      message: 'Get levels successfully!',
      data,
    };

    return responseData;
  }

}
