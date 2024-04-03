import { InjectStripeClient } from '@golevelup/nestjs-stripe';
import {
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';

import { Course } from 'src/entities';
import Stripe from 'stripe';
import { ResponseData } from '../../interface/response.interface';
import { CategoryRepository } from '../category/category.repository';
import { CourseRepository } from './course.repository';
import { CreateCourseDto, UpdateCourseDto } from './dto';
import { LanguageRepository } from '../language/language.repository';
import { LevelRepository } from '../level/level.repository';
import { PriceRepository } from '../price/price.repository';
import { UploadService } from '../upload/upload.service';
import { CourseStatus, UploadResource } from 'src/constants';
@Injectable()
export class CourseService {
  private logger = new Logger(CourseService.name);
  constructor(
    @InjectStripeClient() private readonly stripeClient: Stripe,
    private readonly courseRepository: CourseRepository,
    private readonly categoryRepository: CategoryRepository,
    private readonly languageRepository: LanguageRepository,
    private readonly levelRepository: LevelRepository,
    private readonly priceRepository: PriceRepository,
    private readonly uploadService: UploadService,
  ) {}
  async createCourse(
    createCourseDto: CreateCourseDto,
    userID: number,
  ): Promise<ResponseData> {
    const { title, categoryID, subCategoryID } = createCourseDto;
    console.log('createCourseDto: ', createCourseDto);

    this.categoryRepository.getCategoryById(categoryID);
    const [category, subCategory] = await Promise.all([
      await this.categoryRepository.getCategoryById(categoryID),
      await this.categoryRepository.getCategoryById(subCategoryID),
    ]);

    if (!category || !subCategory) {
      throw new NotFoundException('Category not found');
    }

    const productStripeParams = {
      name: title,
    };

    try {
      const p = await this.stripeClient.products.create(productStripeParams);

      const courseData: Partial<Course> = {
        title,
        categoryId: categoryID,
        subCategoryId: subCategoryID,
        productIdStripe: p.id,
        userID: userID,
      };

      const courseCreate = await this.courseRepository.createCourse(courseData);

      const responseData: ResponseData = {
        message: 'Create course successfully!',
        data: courseCreate,
      };

      return responseData;
    } catch (error) {
      throw new InternalServerErrorException(
        'Failed to create Stripe product: ' + error.message,
      );
    }
  }

  async updateCourse(
    updateCourseDto: UpdateCourseDto,
    userID: number,
    courseID: number,
    image: Express.Multer.File,
  ): Promise<ResponseData> {
    const {
      title,
      categoryID,
      subCategoryID,
      congratulationsMessage,
      description,
      intendedFor,
      languageID,
      levelID,
      outcomes,
      priceID,
      primarilyTeach,
      requirements,
      subtitle,
      welcomeMessage,
    } = updateCourseDto;

    // Check course
    const course = await this.courseRepository.getCourseByID(courseID);

    if (!course) {
      throw new NotFoundException('Course not found');
    }

    if (userID !== course.userID) {
      throw new ForbiddenException('Not author of course');
    }

    course.welcomeMessage = welcomeMessage || '';
    course.congratulationsMessage = congratulationsMessage || '';

    course.title = title;

    course.outComes = outcomes || [];
    course.requirements = requirements || [];
    course.intendedFor = intendedFor || [];

    course.description = description || '';
    course.subtitle = subtitle || '';
    course.primarilyTeach = primarilyTeach || '';

    const productParams: Stripe.ProductUpdateParams = {
      name: title,
    };

    if (categoryID) {
      // Check category
      const category =
        await this.categoryRepository.getCategoryById(categoryID);

      if (!category) {
        throw new ForbiddenException('Category not found');
      }

      course.categoryId = categoryID;
    } else {
      course.categoryId = null;
    }

    if (subCategoryID) {
      // Check category
      const subCategory =
        await this.categoryRepository.getCategoryById(subCategoryID);

      if (!subCategory) {
        throw new ForbiddenException('Subcategory not found');
      }
      course.subCategoryId = subCategoryID;
    } else {
      course.subCategoryId = null;
    }

    if (languageID) {
      // Check language
      const language =
        await this.languageRepository.getLanguageById(languageID);

      if (!language) {
        throw new ForbiddenException('Language not found');
      }

      course.languageId = languageID;
    } else {
      course.languageId = null;
    }

    if (levelID) {
      // Check level
      const level = await this.levelRepository.getLevelById(levelID);

      if (!level) {
        throw new ForbiddenException('Level not found');
      }

      course.levelId = levelID;
    } else {
      course.levelId = null;
    }

    if (priceID) {
      // Check price
      const price = await this.priceRepository.getPriceById(priceID);

      if (!price) {
        throw new ForbiddenException('Price not found');
      }

      course.priceId = priceID;

      const priceParams: Stripe.PriceCreateParams = {
        currency: 'gbp',
        unit_amount: price.value * 100,
        product: course.productIdStripe,
      };
      try {
        const priceTripe = await this.stripeClient.prices.create(priceParams);
        productParams.default_price = priceTripe.id;
      } catch (error) {
        throw new InternalServerErrorException(
          'Failed to create Stripe price: ' + error.message,
        );
      }
    } else {
      course.levelId = null;
    }

    if (image) {
      if (course.image) {
        // Remove previous image course
        let resourceFile = course.image.split('/').slice(-2).join('/');
        resourceFile = `https://sg.storage.bunnycdn.com/kaidemy/${resourceFile}`;

        await this.uploadService.deleteResource(resourceFile);
      }

      const avatarURL = await this.uploadService.uploadResource(
        image,
        UploadResource.Avatar,
      );
      productParams.images = [avatarURL];
      course.image = avatarURL;
    }

    await this.stripeClient.products.update(course.productIdStripe, productParams);
   
    course.reviewStatus = CourseStatus.REVIEW_INIT;

    await this.courseRepository.save(course);
    
    const responseData: ResponseData = {
      message: 'Update course successfully!',
      data: course,
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
