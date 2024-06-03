import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import {
  AssetType,
  CourseStatus,
  LectureType,
  UploadResource,
  UploadType,
} from 'src/constants';
import { Asset } from 'src/entities';
import { Lecture } from 'src/entities/lecture.entity';
import { ResponseData } from '../../interface/response.interface';
import { AssetRepository } from '../asset/asset.repository';
import { CourseRepository } from '../courses/course.repository';
import { CurriculumRepository } from '../curriculum/curriculum.repository';
import { UploadService } from '../upload/upload.service';
// import { CurriculumRepository } from './lecture.repository';
import { CreateLectureDto, UpdateLectureDto } from './dto';
import { LectureRepository } from './lecture.repository';
import { MarkLectureDto } from './dto/mark-lecture-dto';

@Injectable()
export class LectureService {
  private logger = new Logger(LectureService.name);
  constructor(
    private readonly curriculumRepository: CurriculumRepository,
    private readonly courseRepository: CourseRepository,
    private readonly lectureRepository: LectureRepository,
    private readonly assetRepository: AssetRepository,
    private readonly uploadService: UploadService,
  ) {}
  async createLecture(
    createLectureDto: CreateLectureDto,
    userID: number,
  ): Promise<ResponseData> {
    const { title, curriculumID } = createLectureDto;

    // Check curriculum exist
    const curriculum =
      await this.curriculumRepository.getCurriculumByIdWithRelation(
        curriculumID,
        ['course'],
      );
    if (!curriculum) {
      throw new NotFoundException('Curriculum not found');
    }

    // Check permission author course
    if (userID !== curriculum.course.userID) {
      throw new ForbiddenException('Not author of course');
    }

    const lecture: Lecture = {
      title,
      type: LectureType.LECTURE,
      curriculumID,
    };

    const lectureCreate = await this.lectureRepository.createLecture(lecture);

    // Update status
    const course = curriculum.course;
    course.reviewStatus = CourseStatus.REVIEW_INIT;

    await this.courseRepository.save(course);

    const responseData: ResponseData = {
      message: 'Create lecture successfully!',
      data: lectureCreate,
    };

    return responseData;
  }

  async updateLecture(
    updateLectureDto: UpdateLectureDto,
    userID: number,
    lectureID: number,
  ): Promise<ResponseData> {
    const {
      title,
      description,
      typeUpdate,
      article,
      isPromotional,
      assetType,
      assetID,
    } = updateLectureDto;

    // Check lecture exist
    const lecture = await this.lectureRepository.getLectureByIdWithRelation(
      lectureID,
      ['assets'],
    );

    if (!lecture) {
      throw new NotFoundException('Lecture not found');
    }

    // Check must lecture type
    if (lecture.type !== LectureType.LECTURE) {
      throw new InternalServerErrorException('Should lecture type');
    }

    //Check curriculum exist
    const curriculum =
      await this.curriculumRepository.getCurriculumByIdWithRelation(
        lecture.curriculumID,
        ['course'],
      );

    if (!curriculum) {
      throw new NotFoundException('Curriculum not found');
    }

    // // Check permission author course
    if (userID !== curriculum.course.userID) {
      throw new ForbiddenException('Not author of course');
    }

    if (typeUpdate === UploadType.REMOVE_ASSET) {
      if (assetType === AssetType.WATCH) {
        let assetWatchType: Asset;
        lecture.assets.forEach((asset) => {
          if (asset.type === AssetType.WATCH) {
            assetWatchType = asset;
          }
        });

        if (!assetWatchType) {
          throw new NotFoundException('Video not exist');
        }

        // Delete asset bunny
        await this.uploadService.deleteVideo(assetWatchType.bunnyId);

        // Delete old asset
        await this.assetRepository.delete(assetWatchType.id);
      }

      if (assetType === AssetType.RESOURCE && assetID) {
        let assetResourceType: Asset;
        lecture.assets.forEach((asset) => {
          if (asset.type === AssetType.RESOURCE && asset.id === assetID) {
            assetResourceType = asset;
          }
        });
        if (!assetResourceType) {
          throw new NotFoundException('Resource not exist');
        }

        // Delete asset bunny
        await this.uploadService.deleteResource(assetResourceType.url);

        // Delete old asset
        await this.assetRepository.delete(assetResourceType.id);
      }
    }

    if (typeUpdate === UploadType.UPLOAD_ARTICLE) {
      if (article != undefined) lecture.article = article || '';
      if (title != undefined) lecture.title = title;
      if (isPromotional != undefined)
        lecture.isPromotional = isPromotional || false;
      if (description != undefined) lecture.description = description || '';

      await this.lectureRepository.save(lecture);
    }

    // Update status course
    const course = curriculum.course;
    course.reviewStatus = CourseStatus.REVIEW_INIT;

    await this.courseRepository.save(course);

    //Get data lecture res
    const lectureRes = await this.lectureRepository.getLectureByIdWithRelation(
      lectureID,
      ['assets'],
    );

    const responseData: ResponseData = {
      message: 'Update lecture successfully!',
      data: lectureRes,
    };

    return responseData;

    // if (typeUpdate === UploadType.UPLOAD_ASSET) {
    //   if (assetType === AssetType.WATCH) {
    //     let assetWatchType: Asset;
    //     lecture.assets.forEach((asset) => {
    //       if (asset.type === AssetType.WATCH) {
    //         assetWatchType = asset;
    //       }
    //     });

    //     if (assetWatchType) {
    //       throw new NotFoundException('Limit upload video');
    //     }

    //     // await this.uploadService.uploadVideo();
    //   }
    // }
    // curriculum.title = title;
    // curriculum.description = description || '';

    // await this.curriculumRepository.save(curriculum);

    // delete curriculum.course;
  }

  async uploadResourceLecture(
    userID: number,
    lectureID: number,
    asset: Express.Multer.File,
  ): Promise<ResponseData> {
    if (!asset) {
      throw new BadRequestException('Asset required');
    }
    const lecture = await this.lectureRepository.getLectureByIdWithRelation(
      lectureID,
      ['assets'],
    );

    if (!lecture) {
      throw new NotFoundException('Lecture not found');
    }

    // Check must lecture type
    if (lecture.type !== LectureType.LECTURE) {
      throw new InternalServerErrorException('Should lecture type');
    }

    //Check curriculum exist
    const curriculum =
      await this.curriculumRepository.getCurriculumByIdWithRelation(
        lecture.curriculumID,
        ['course'],
      );

    if (!curriculum) {
      throw new NotFoundException('Curriculum not found');
    }

    // // Check permission author course
    if (userID !== curriculum.course.userID) {
      throw new ForbiddenException('Not author of course');
    }

    let countAssetResourceType = 0;

    lecture.assets.forEach((asset) => {
      if (asset.type === AssetType.RESOURCE) {
        countAssetResourceType++;
      }
    });

    if (countAssetResourceType >= 2) {
      throw new BadRequestException('Limit only 2 resource each lecture');
    }

    //Upload resource
    const queryRunnerAsset =
      this.assetRepository.manager.connection.createQueryRunner();
    try {
      const url = await this.uploadService.uploadResource(
        asset,
        UploadResource.Resource,
      );
      // this.assetRepository.queryRunner.startTransaction();
      await queryRunnerAsset.startTransaction();

      const assetCreate: Asset = {
        url,
        type: AssetType.RESOURCE,
        lectureId: lectureID,
        size: asset.size,
        name: asset.filename,
      };
      await this.assetRepository.save(assetCreate);

      await queryRunnerAsset.commitTransaction();
    } catch (err) {
      await queryRunnerAsset.rollbackTransaction();
      throw new InternalServerErrorException('Uploaded resource failed');
    }

    // Update status course
    const course = curriculum.course;
    course.reviewStatus = CourseStatus.REVIEW_INIT;

    await this.courseRepository.save(course);

    //Get data lecture res
    const lectureRes = await this.lectureRepository.getLectureByIdWithRelation(
      lectureID,
      ['assets'],
    );

    const responseData: ResponseData = {
      message: 'Upload resource lecture successfully!',
      data: lectureRes,
    };

    return responseData;
  }

  async markLecture(
    userID: number,
    lectureID: number,
    markLectureDto: MarkLectureDto,
  ): Promise<ResponseData> {
    const responseData: ResponseData = {
      message: 'Upload resource lecture successfully!',
    };

    return responseData;
  }

  async deleteLecture(
    userID: number,
    lectureID: number,
  ): Promise<ResponseData> {
    const lecture = await this.lectureRepository.getLectureByIdWithRelation(
      lectureID,
      ['assets'],
    );

    if (!lecture) {
      throw new NotFoundException('Lecture not found');
    }

    // Check must lecture type
    if (lecture.type !== LectureType.LECTURE) {
      throw new InternalServerErrorException('Should lecture type');
    }

    //Check curriculum exist
    const curriculum =
      await this.curriculumRepository.getCurriculumByIdWithRelation(
        lecture.curriculumID,
        ['course'],
      );

    if (!curriculum) {
      throw new NotFoundException('Curriculum not found');
    }

    // // Check permission author course
    if (userID !== curriculum.course.userID) {
      throw new ForbiddenException('Not author of course');
    }

    // Delete asset in bunny
    lecture.assets.forEach((asset) => {
      if (asset.type === AssetType.WATCH) {
        this.uploadService.deleteVideo(asset.bunnyId);
      }

      if (asset.type === AssetType.RESOURCE) {
        this.uploadService.deleteResource(asset.url);
      }
    });

    //Delete lecture
    await this.lectureRepository.delete(lectureID);

    // Update status course
    const course = curriculum.course;
    course.reviewStatus = CourseStatus.REVIEW_INIT;

    await this.courseRepository.save(course);

    const responseData: ResponseData = {
      message: 'Delete lecture successfully!',
    };

    return responseData;
  }

  async uploadVideoLecture(
    userID: number,
    lectureID: number,
    asset: Express.Multer.File,
  ): Promise<ResponseData> {
    if (!asset) {
      throw new BadRequestException('Asset required');
    }
    const lecture = await this.lectureRepository.getLectureByIdWithRelation(
      lectureID,
      ['assets'],
    );

    if (!lecture) {
      throw new NotFoundException('Lecture not found');
    }

    // Check must lecture type
    if (lecture.type !== LectureType.LECTURE) {
      throw new InternalServerErrorException('Should lecture type');
    }

    //Check curriculum exist
    const curriculum =
      await this.curriculumRepository.getCurriculumByIdWithRelation(
        lecture.curriculumID,
        ['course'],
      );

    if (!curriculum) {
      throw new NotFoundException('Curriculum not found');
    }

    // // Check permission author course
    if (userID !== curriculum.course.userID) {
      throw new ForbiddenException('Not author of course');
    }

    let assetWatchType: Asset;

    lecture.assets.forEach((asset) => {
      if (asset.type === AssetType.WATCH) {
        assetWatchType = asset;
      }
    });

    if (assetWatchType) {
      throw new BadRequestException('Limit upload video');
    }

    //Upload resource
    const queryRunnerAsset =
      this.assetRepository.manager.connection.createQueryRunner();
    try {
      const videoBunny = await this.uploadService.uploadVideo(
        asset,
        lecture.title,
      );
      await queryRunnerAsset.startTransaction();

      const assetCreate: Asset = {
        url: videoBunny.url,
        type: AssetType.WATCH,
        lectureId: lectureID,
        size: videoBunny.storageSize,
        duration: videoBunny.duration,
        name: asset.filename,
        bunnyId: videoBunny.videoID,
      };
      await this.assetRepository.save(assetCreate);

      await queryRunnerAsset.commitTransaction();
    } catch (err) {
      await queryRunnerAsset.rollbackTransaction();
      throw new InternalServerErrorException('Uploaded video failed');
    }

    // Update status course
    const course = curriculum.course;
    course.reviewStatus = CourseStatus.REVIEW_INIT;

    await this.courseRepository.save(course);

    //Get data lecture res
    const lectureRes = await this.lectureRepository.getLectureByIdWithRelation(
      lectureID,
      ['assets'],
    );

    const responseData: ResponseData = {
      message: 'Upload video lecture successfully!',
      data: lectureRes,
    };

    return responseData;
  }
}
