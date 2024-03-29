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
      lecture.article = article || '';
      lecture.title = title;
      lecture.isPromotional = isPromotional || false;
      lecture.description = description || '';

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
    try {
      const url = await this.uploadService.uploadResource(
        asset,
        UploadResource.Resource,
      );
      this.assetRepository.queryRunner.startTransaction();

      const assetCreate: Asset = {
        url,
        type: AssetType.RESOURCE,
        lectureId: lectureID,
        size: asset.size,
        name: asset.filename,
      };
      await this.assetRepository.save(assetCreate);

      this.assetRepository.queryRunner.commitTransaction();
    } catch (err) {
      this.assetRepository.queryRunner.rollbackTransaction();
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
    try {
      const videoBunny = await this.uploadService.uploadVideo(
        asset,
        lecture.title,
      );
      this.assetRepository.queryRunner.startTransaction();

      const assetCreate: Asset = {
        url: videoBunny.url,
        type: AssetType.WATCH,
        lectureId: lectureID,
        size: videoBunny.storageSize,
        duration: videoBunny.duration,
        name: asset.filename,
        bunnyId: videoBunny.videoID
      };
      await this.assetRepository.save(assetCreate);

      this.assetRepository.queryRunner.commitTransaction();
    } catch (err) {
      this.assetRepository.queryRunner.rollbackTransaction();
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

  // async deleteCurriculum(
  //   curriculumID: number,
  //   userID: number,
  // ): Promise<ResponseData> {
  //   // Check curriculum exist

  //   const curriculum =
  //     await this.curriculumRepository.getCurriculumByIdWithRelation(
  //       curriculumID,
  //     );
  //   if (!curriculum) {
  //     throw new NotFoundException('Curriculum not found');
  //   }

  //   // Check permission author course
  //   if (userID !== curriculum.course.userID) {
  //     throw new ForbiddenException('Not author of course');
  //   }

  //   let a = await this.curriculumRepository.delete(curriculumID);
  //   console.log('A: ', a);
  //   const responseData: ResponseData = {
  //     message: 'Delete curriculum successfully!',
  //   };

  //   return responseData;
  // }

  // async updateCategory(
  //   updateCategoryDto: UpdateCategoryDto,
  //   categoryID: number,
  // ): Promise<ResponseData> {
  //   const { name, parentID } = updateCategoryDto;

  //   const category = await this.categoryRepository.getCategoryById(categoryID);

  //   if (!category) {
  //     throw new NotFoundException('Category not found');
  //   }

  //   if (name) {
  //     const priceByTier = await this.categoryRepository.getCategoryByName(name);

  //     if (priceByTier && priceByTier.id !== categoryID) {
  //       throw new ConflictException('Name already exists');
  //     }
  //     category.name = name;
  //   }

  //   if (parentID) {
  //     // console.log('parentID: ', parentID);
  //     const categoryParent =
  //       await this.categoryRepository.getCategoryById(parentID);

  //     if (!categoryParent) {
  //       throw new NotFoundException('Category parent not found');
  //     }
  //   }
  //   category.parentID = parentID || null;

  //   await this.categoryRepository.save(category);
  //   const responseData: ResponseData = {
  //     message: 'Update category successfully!',
  //     data: category,
  //   };

  //   return responseData;
  // }

  // async deleteCategory(categoryID: number): Promise<ResponseData> {
  //   const category = await this.categoryRepository.getCategoryById(categoryID);

  //   if (!category) {
  //     throw new NotFoundException('Category not found');
  //   }

  //   await this.categoryRepository.delete(categoryID);

  //   const responseData: ResponseData = {
  //     message: 'Delete category successfully!',
  //   };

  //   return responseData;
  // }

  // async getCategoryByID(categoryID: number): Promise<ResponseData> {
  //   const category =
  //     await this.categoryRepository.getCategoryByIdRelation(categoryID);

  //   if (!category) {
  //     throw new NotFoundException('Category not found');
  //   }

  //   const responseData: ResponseData = {
  //     message: 'Get category successfully!',
  //     data: category,
  //   };

  //   return responseData;
  // }

  // async getCategories(
  //   pageCommonOptionsDto: PageCommonOptionsDto,
  // ): Promise<ResponseData> {
  //   const queryBuilder = this.categoryRepository.createQueryBuilder('category');
  //   queryBuilder
  //     .orderBy('category.created_at', pageCommonOptionsDto.order)
  //     .leftJoinAndSelect('category.children', 'children');

  //   queryBuilder
  //     .skip(pageCommonOptionsDto.skip)
  //     .take(pageCommonOptionsDto.size);

  //   const itemCount = await queryBuilder.getCount();
  //   const { entities } = await queryBuilder.getRawAndEntities();

  //   const pageMetaDto = new PageMetaDto({
  //     itemCount,
  //     pageOptionsDto: pageCommonOptionsDto,
  //   });
  //   const data = new PageDto(entities, pageMetaDto);

  //   const responseData: ResponseData = {
  //     message: 'Get categories successfully!',
  //     data,
  //   };

  //   return responseData;
  // }

  // async profileByMe(userID: number): Promise<ResponseData> {
  //   const user = await this.userRepository.getByID(userID);

  //   if (!user) {
  //     throw new UnauthorizedException();
  //   }

  //   const responseData: ResponseData = {
  //     message: 'Get profile successfully!',
  //     data: user,
  //   };

  //   return responseData;
  // }

  // async blockUser(
  //   userID: number,
  //   blockUserDto: BlockUserDto,
  // ): Promise<ResponseData> {
  //   const user = await this.userRepository.getByID(userID);

  //   if (!user) {
  //     throw new NotFoundException();
  //   }

  //   user.isBlock = blockUserDto.isBlock;

  //   await this.userRepository.updateData(user);

  //   const responseData: ResponseData = {
  //     message: 'Block user successfully!',
  //   };

  //   return responseData;
  // }

  // async getUsers(
  //   pageUserOptionsDto: PageUserOptionsDto,
  // ): Promise<ResponseData> {
  //   const queryBuilder = this.userRepository.createQueryBuilder('user');

  //   queryBuilder.orderBy('user.created_at', pageUserOptionsDto.order);

  //   if (pageUserOptionsDto.search) {
  //     queryBuilder.andWhere('user.name LIKE :searchQuery', {
  //       searchQuery: `%${pageUserOptionsDto.search}%`,
  //     });
  //   }
  //   queryBuilder.skip(pageUserOptionsDto.skip).take(pageUserOptionsDto.size);

  //   const itemCount = await queryBuilder.getCount();
  //   const { entities } = await queryBuilder.getRawAndEntities();

  //   const pageMetaDto = new PageMetaDto({
  //     itemCount,
  //     pageOptionsDto: pageUserOptionsDto,
  //   });
  //   const data = new PageDto(entities, pageMetaDto);

  //   const responseData: ResponseData = {
  //     message: 'Get users successfully!',
  //     data,
  //   };
  //   return responseData;
  // }

  // async getUserByID(userID: number): Promise<ResponseData> {
  //   const user = await this.userRepository.findOne({
  //     where: [{ id: userID }],
  //   });

  //   if (!user) {
  //     throw new NotFoundException('User not found');
  //   }
  //   const responseData: ResponseData = {
  //     message: 'Get user successfully!',
  //     data: user,
  //   };
  //   return responseData;
  // }

  // async updateProfile(
  //   userID: number,
  //   updateProfileDto: UpdateProfileDto,
  //   avatar: Express.Multer.File,
  // ): Promise<ResponseData> {
  //   const user = await this.userRepository.getByID(userID);

  //   if (!user) {
  //     throw new UnauthorizedException();
  //   }

  //   if (avatar) {
  //     // Remove avatar previous
  //     if (user.avatar) {
  //       await this.uploadService.deleteResource(user.avatar);
  //     }

  //     const avatarURL = await this.uploadService.uploadResource(
  //       avatar,
  //       UploadResource.Avatar,
  //     );
  //     user.avatar = avatarURL;
  //   }

  //   user.name = updateProfileDto.name;

  //   user.biography = updateProfileDto.biography
  //     ? updateProfileDto.biography
  //     : null;
  //   user.headline = updateProfileDto.headline
  //     ? updateProfileDto.headline
  //     : null;
  //   user.linkedInURL = updateProfileDto.linkedInURL
  //     ? updateProfileDto.linkedInURL
  //     : null;
  //   user.twitterURL = updateProfileDto.twitterURL
  //     ? updateProfileDto.twitterURL
  //     : null;
  //   user.websiteURL = updateProfileDto.websiteURL
  //     ? updateProfileDto.websiteURL
  //     : null;
  //   user.youtubeURL = updateProfileDto.youtubeURL
  //     ? updateProfileDto.youtubeURL
  //     : null;

  //   user.facebookURL = updateProfileDto.facebookURL
  //     ? updateProfileDto.facebookURL
  //     : null;

  //   this.userRepository.save(user);

  //   const responseData: ResponseData = {
  //     message: 'Update profile successfully!',
  //     data: user,
  //   };

  //   return responseData;
  // }

  // async login(loginUserDto: LoginUserDto) {
  //   const { account, password } = loginUserDto;
  //   const user = await this.userRepository.findOne({
  //     where: [{ user_name: account }, { phone: account }, { email: account }],
  //   });
  //   let checkPass = false;
  //   if (user) {
  //     checkPass = bcrypt.compareSync(password, user.password);
  //   }

  //   if (user && checkPass) {
  //     const tokens = await this.getTokens(user.id, user.user_name);
  //     await this.updateRtHash(user.id, tokens.refresh_token);
  //     const responseData: ResponseData = {
  //       data: {
  //         user: await UserLoginResource(user, user),
  //         tokens,
  //       },
  //       message: 'Login Successfully!',
  //     };
  //     return responseData;
  //   } else {
  //     throw new UnauthorizedException('Please check your login credentials');
  //   }
  // }

  // async logout(userId: number) {
  //   const user = await this.userRepository.findOne({
  //     where: [{ id: userId }],
  //   });
  //   console.log("Reset Token", user)
  //   user.refresh_token = null;

  //   await this.userRepository.save(user);
  // }

  // async refreshToken(userId: number, rf: string) {
  //   const user = await this.userRepository.findOne({
  //     where: [{ id: userId }],
  //   });
  //   console.log("RF: ", rf)
  //   console.log("RF 2: ", user.refresh_token)
  //   if (user && bcrypt.compare(rf, user.refresh_token)) {
  //     const tokens = this.getTokens(userId, user.user_name);
  //     await this.updateRtHash(userId, (await tokens).refresh_token);
  //     return tokens;
  //   } else {
  //     throw new UnauthorizedException('Please check your login credentials');
  //   }
  // }

  // async hashData(data: string): Promise<string> {
  //   const hashData = bcrypt.hashSync(data, 8);
  //   return hashData;
  // }

  // async getTokens(userID: number, email: string): Promise<Tokens> {
  //   const DAY_SECONDS = 60 * 60 * 24;
  //   const token = await this.jwtService.signAsync(
  //     {
  //       sub: userID,
  //       email,
  //     },
  //     {
  //       secret: this.config.get('JWT_SECRET'),
  //       expiresIn: DAY_SECONDS,
  //     },
  //   );

  //   return {
  //     access_token: token,
  //   };
  // }

  // async updateRtHash(userId: number, rf: string): Promise<void> {
  //   const hashRf = await this.hashData(rf);
  //   const user = await this.userRepository.findOne({
  //     where: [{ id: userId }],
  //   });
  //   user.refresh_token = hashRf;

  //   await this.userRepository.save(user);
  // }

  // async getAllUser(): Promise<User[]> {
  //   const users = await this.userRepository.find()
  //   return users
  // }

  // async deleteUser(idUser: number): Promise<void> {
  //   const user = await this.userRepository.findOne({
  //     where: [{ id: idUser }],
  //   });
  //   if (!user) {
  //     throw new NotFoundException('User not found');
  //   }
  //   const result = await this.userRepository.remove(user)
  // }

  // async getJwtUser(jwt: string): Promise<User | undefined> {
  //   console.log('154',jwt)
  //   return  await this.jwtService.verifyAsync(jwt, {
  //     secret: this.config.get('JWT_SECRET')
  //   })

  // }
}
