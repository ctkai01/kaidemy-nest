import { ConflictException, InternalServerErrorException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Category } from 'src/entities/category.entity';
import { EntityRepository, Repository } from 'typeorm';
import _ = require('lodash');
import { Asset, Curriculum } from 'src/entities';
import { Lecture } from 'src/entities/lecture.entity';

@EntityRepository(Asset)
export class AssetRepository extends Repository<Asset> {
  private logger = new Logger(AssetRepository.name);

  constructor(
    @InjectRepository(Asset)
    private assetRepository: Repository<Asset>,
  ) {
    super(
      assetRepository.target,
      assetRepository.manager,
      assetRepository.queryRunner,
    );
  }
}
