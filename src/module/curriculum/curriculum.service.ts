import {
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { Curriculum } from 'src/entities';
import { ResponseData } from '../../interface/response.interface';
import { CourseRepository } from '../courses/course.repository';
import { CurriculumRepository } from './curriculum.repository';
import { CreateCurriculumDto, UpdateCurriculumDto } from './dto';

@Injectable()
export class CurriculumService {
  private logger = new Logger(CurriculumService.name);
  constructor(
    private readonly curriculumRepository: CurriculumRepository,
    private readonly courseRepository: CourseRepository,
  ) {}
  async createCurriculum(
    createCurriculumDto: CreateCurriculumDto,
    userID: number,
  ): Promise<ResponseData> {
    const { title, description, courseID } = createCurriculumDto;

    // Check course exist
    const course = await this.courseRepository.getCourseByID(courseID);
    if (!course) {
      throw new NotFoundException('Course not found');
    }

    // Check permission author course
    if (userID !== course.userID) {
      throw new ForbiddenException('Not author of course');
    }
    const curriculum: Curriculum = {
      title,
      description,
      courseId: courseID,
    };

    const curriculumCreate =
      await this.curriculumRepository.createCurriculum(curriculum);

    const responseData: ResponseData = {
      message: 'Create curriculum successfully!',
      data: curriculumCreate,
    };

    return responseData;
  }

  async updateCurriculum(
    updateCurriculumDto: UpdateCurriculumDto,
    userID: number,
    curriculumID: number,
  ): Promise<ResponseData> {
    const { title, description } = updateCurriculumDto;

    // Check curriculum exist

    const curriculum =
      await this.curriculumRepository.getCurriculumByIdWithRelation(
        curriculumID,
        ["course"]
      );
    if (!curriculum) {
      throw new NotFoundException('Curriculum not found');
    }

    // Check permission author course
    if (userID !== curriculum.course.userID) {
      throw new ForbiddenException('Not author of course');
    }

    curriculum.title = title;
    curriculum.description = description || '';

    await this.curriculumRepository.save(curriculum);

    delete curriculum.course;
    const responseData: ResponseData = {
      message: 'Update curriculum successfully!',
      data: curriculum,
    };

    return responseData;
  }

  async deleteCurriculum(
    curriculumID: number,
    userID: number,
  ): Promise<ResponseData> {
    // Check curriculum exist

    const curriculum =
      await this.curriculumRepository.getCurriculumByIdWithRelation(
        curriculumID,
        ["course"]
      );
    if (!curriculum) {
      throw new NotFoundException('Curriculum not found');
    }

    // Check permission author course
    if (userID !== curriculum.course.userID) {
      throw new ForbiddenException('Not author of course');
    }

    await this.curriculumRepository.delete(curriculumID);
    const responseData: ResponseData = {
      message: 'Delete curriculum successfully!',
    };

    return responseData;
  }

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
