import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Asset } from 'src/entities';
import { Lecture } from 'src/entities/lecture.entity';
import { AssetRepository } from './asset.repository';

@Module({
  imports: [TypeOrmModule.forFeature([Asset])],
  providers: [AssetRepository],
  controllers: [],
  exports: [AssetRepository],
})
export class AssetModule {}
