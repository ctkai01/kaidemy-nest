import { InjectStripeClient } from '@golevelup/nestjs-stripe';
import {
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';

import { Cart, Course, Transaction, TransactionDetail } from 'src/entities';
import Stripe from 'stripe';
import { ResponseData } from '../../interface/response.interface';
import { CategoryRepository } from '../category/category.repository';
import { CourseRepository } from './course.repository';
import { CreateCourseDto, UpdateCourseDto } from './dto';
import { LanguageRepository } from '../language/language.repository';
import { LevelRepository } from '../level/level.repository';
import { PriceRepository } from '../price/price.repository';
import { UploadService } from '../upload/upload.service';
import {
  AssetType,
  AverageRating,
  CourseCategory,
  CourseCurriculum,
  CourseDurationFilter,
  CourseSort,
  CourseStatus,
  CourseTransaction,
  CourseUtil,
  EnrollmentStats,
  FilterOrderCourse,
  LearningReview,
  LectureType,
  NotificationPayload,
  Order,
  OverallReviewsByCourseID,
  OverviewCourseAuthor,
  RatingStats,
  StarCount,
  UploadResource,
} from 'src/constants';
import { Learning } from 'src/entities/learning.entity';
import { TransactionRepository } from './transation.repository';
import { CartRepository } from '../cart/cart.repository';
import { FEE_PLATFORM } from 'src/constants/payment';
import { ProducerService } from '../queues/producer.service';
import { GetCoursesOverviewAuthorDto } from './dto/get-courses-overview-author-dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, Repository } from 'typeorm';
import { GetReviewsDto } from './dto/get-reviews-by-course-id-dto';
import { PageMetaDto } from 'src/common/paginate/page-meta.dto';
import { PageDto } from 'src/common/paginate/paginate.dto';
import { GetCourseDto } from './dto/get-curriculum-by-course-id-dto';
import { GetCoursesCategory } from './dto/get-courses-category-dto';
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
    private readonly transactionRepository: TransactionRepository,
    private readonly cartRepository: CartRepository,
    private readonly producerService: ProducerService,
    @InjectRepository(Learning)
    private readonly learningRepository: Repository<Learning>,
    @InjectRepository(TransactionDetail)
    private readonly transactionDetailRepository: Repository<TransactionDetail>,
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

      await this.registerCourse(userID, courseCreate.id);

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
        currency: 'usd',
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

    await this.stripeClient.products.update(
      course.productIdStripe,
      productParams,
    );

    course.reviewStatus = CourseStatus.REVIEW_INIT;

    await this.courseRepository.save(course);

    const responseData: ResponseData = {
      message: 'Update course successfully!',
      data: course,
    };

    return responseData;
  }

  async registerCourse(userID: number, courseID: number): Promise<void> {
    const learning: Learning = {
      courseId: courseID,
      userId: userID,
      type: CourseUtil.STANDARD_TYPE,
    };

    await this.courseRepository.manager.getRepository(Learning).save(learning);
  }

  public async paymentProcess(data: Stripe.Charge) {
    const queryRunnerTransaction =
      this.transactionRepository.manager.connection.createQueryRunner();
    const queryRunnerCart =
      this.cartRepository.manager.connection.createQueryRunner();

    await queryRunnerTransaction.startTransaction();
    await queryRunnerCart.startTransaction();
    try {
      const courses: CourseTransaction[] = JSON.parse(data.metadata.courses);

      const balanceTransactions =
        await this.stripeClient.balanceTransactions.retrieve(
          data.balance_transaction.toString(),
        );

      const userBuy = data.metadata.userBuy;
      // Create transaction
      const transaction: Partial<Transaction> = {
        actual: balanceTransactions.amount,
        fee_stripe: balanceTransactions.fee,
        userId: Number(userBuy),
      };

      await queryRunnerTransaction.manager
        .getRepository(Transaction)
        .save(transaction);

      const transactionDetails: TransactionDetail[] = [];
      const transferPromises = [];
      courses.forEach(async (course) => {
        const feeBuy =
          Math.round((course.price * (100 - FEE_PLATFORM)) / 100) * 100;
        transactionDetails.push({
          fee_buy: feeBuy,
          courseId: course.id,
          transactionId: transaction.id,
        });
        const transferPromise = this.stripeClient.transfers.create({
          currency: 'usd',
          amount: feeBuy,
          destination: course.author.stripe,
          transfer_group: data.metadata.group,
        });
        transferPromises.push(transferPromise);
      });
      await Promise.all(transferPromises);

      // Create transaction detail
      await queryRunnerTransaction.manager
        .getRepository(TransactionDetail)
        .save(transactionDetails);

      await Promise.all(
        courses.map((course) =>
          this.registerCourse(Number(userBuy), course.id),
        ),
      );

      const cart = await this.cartRepository.getCartByUserID(Number(userBuy));
      // Remove cart
      await queryRunnerCart.manager.getRepository(Cart).remove(cart);

      courses.forEach(async (course) => {
        // Notification to student
        this.producerService.addToNotificationQueue({
          toID: [Number(userBuy)],
          fromID: course.author.id,
          data: {
            courseID: `${course.id}`,
            toID: `${Number(userBuy)}`,
            fromID: `${course.author.id}`,
            type: NotificationPayload.NOTIFICATION_PURCHASE_COURSE_STUDENT,
          },
          type: NotificationPayload.NOTIFICATION_PURCHASE_COURSE_STUDENT,
        });

        // Notification to author
        this.producerService.addToNotificationQueue({
          toID: [course.author.id],
          fromID: Number(userBuy),
          data: {
            courseID: `${course.id}`,
            toID: `${course.author.id}`,
            fromID: `${Number(userBuy)}`,
            type: NotificationPayload.NOTIFICATION_PURCHASE_COURSE_INSTRUCTOR,
          },
          type: NotificationPayload.NOTIFICATION_PURCHASE_COURSE_INSTRUCTOR,
        });
      });

      await queryRunnerTransaction.commitTransaction();
      await queryRunnerCart.commitTransaction();
    } catch (err) {
      console.log('Error: ', err);
      await queryRunnerTransaction.rollbackTransaction();
      await queryRunnerCart.rollbackTransaction();
      throw new Error('Payment processing failed:');
    }
  }

  public async getCoursesOverviewAuthor(
    userID: number,
    getCoursesOverviewAuthorDto: GetCoursesOverviewAuthorDto,
  ): Promise<ResponseData> {
    const courseByAuthor = await this.courseRepository.find({
      where: {
        userID,
      },
      select: ['id'],
    });

    const courseIDs = courseByAuthor.map((course) => course.id);
    const currentYear = new Date().getFullYear();
    const learnings = await this.learningRepository
      .createQueryBuilder('learnings')
      .where('learnings.courseId IN (:...courseIDs)', { courseIDs })
      .andWhere(
        new Brackets((qb) => {
          qb.where('learnings.type = :standardType', {
            standardType: CourseUtil.STANDARD_TYPE,
          }).orWhere('learnings.type = :archieType', {
            archieType: CourseUtil.ARCHIE,
          });
        }),
      )
      .andWhere('EXTRACT(YEAR FROM learnings.createdAt) = :currentYear', {
        currentYear,
      })
      .andWhere('learnings.userId != :idUser', { idUser: userID })
      .getMany();

    const transactionDetails = await this.transactionDetailRepository
      .createQueryBuilder('transaction_details')
      .where('transaction_details.courseId IN (:...courseIDs)', { courseIDs })
      .andWhere(
        'EXTRACT(YEAR FROM transaction_details.createdAt) = :currentYear',
        {
          currentYear,
        },
      )
      .getMany();

    const monthlyEnrollmentCount = new Array(12).fill(0);
    const monthlyRatingCount = new Array(12).fill(0);

    let totalRatings = 0;
    let totalStarRatings = 0;
    let totalRatingsThisMonth = 0;
    let totalEnrollmentThisMonth = 0;
    let revenue = 0;

    transactionDetails.forEach((transactionDetail) => {
      revenue += transactionDetail.fee_buy;
    });
    const currentMonth = new Date().getMonth() + 1; // JavaScript months are 0-based, adding 1 to match 1-based month

    learnings.forEach((learning) => {
      if (learning.createdAt) {
        const month = new Date(learning.createdAt).getMonth() + 1; // Convert to Date object and get month
        if (month === currentMonth) {
          totalEnrollmentThisMonth++;
        }
        monthlyEnrollmentCount[month - 1]++; // Adjusting month index to start from 0
      }

      if (learning.starCount && learning.updatedStarCount) {
        const month = new Date(learning.updatedStarCount).getMonth() + 1; // Convert to Date object and get month
        if (month === currentMonth) {
          totalRatingsThisMonth++;
        }
        monthlyRatingCount[month - 1]++; // Adjusting month index to start from 0
        totalRatings++;
        totalStarRatings += learning.starCount;
      }
    });

    let averageRating = 0;
    if (totalRatings !== 0) {
      averageRating = totalStarRatings / totalRatings;
    }
    averageRating = parseFloat(averageRating.toFixed(2));

    const ratings: RatingStats = {
      total: averageRating,
      totalThisMonth: totalRatingsThisMonth,
      detailStats: monthlyRatingCount,
    };

    const enrollments: EnrollmentStats = {
      total: learnings.length,
      totalThisMonth: totalEnrollmentThisMonth,
      detailStats: monthlyEnrollmentCount,
    };

    const data: OverviewCourseAuthor = {
      enrollments,
      ratings,
      revenues: revenue / 100,
    };
    const responseData: ResponseData = {
      message: 'Get courses overview author!',
      data,
    };

    return responseData;
  }

  public async getCurriculumByCourseID(
    courseID: number,
  ): Promise<ResponseData> {
    const course = await this.courseRepository
      .createQueryBuilder('courses')
      .leftJoinAndSelect('courses.price', 'price')
      .leftJoinAndSelect('courses.level', 'level')
      .leftJoinAndSelect('courses.category', 'category')
      .leftJoinAndSelect('courses.subCategory', 'subCategory')
      .leftJoinAndSelect('courses.language', 'language')
      .leftJoinAndSelect('courses.curriculums', 'curriculum')
      .leftJoinAndSelect('curriculum.lectures', 'lecture')
      .leftJoinAndSelect('lecture.questionLectures', 'questionLecture')
      .leftJoinAndSelect('lecture.assets', 'asset')
      .leftJoinAndSelect('questionLecture.answerLectures', 'answerLecture')
      .leftJoinAndSelect('courses.user', 'user')
      .leftJoinAndSelect(
        'courses.learnings',
        'learnings',
        'learnings.type IN (:...types)',
      )
      .where('courses.id = :courseID', { courseID })
      .setParameter('types', [CourseUtil.STANDARD_TYPE, CourseUtil.ARCHIE])
      .getOne();

    if (!course) {
      throw new NotFoundException('Course not found');
    }
    let totalReviewCountStar: number = 0;
    let totalReviewCount: number = 0;
    let totalStudent: number = 0;

    course.learnings.forEach((learning) => {
      if (learning.starCount) {
        totalReviewCountStar += learning.starCount;
        totalReviewCount++;
      }
      totalStudent++;
    });
    let averageReview: number;

    if (totalReviewCount) {
      averageReview = totalReviewCountStar / totalReviewCount;
      averageReview = parseFloat(averageReview.toFixed(2));
    }

    const data: CourseCurriculum = {
      id: course.id,
      outComes: course.outComes,
      intendedFor: course.intendedFor,
      requirements: course.requirements,
      productIdStripe: course.productIdStripe,
      level: course.level,
      category: course.category,
      subCategory: course.subCategory,
      title: course.title,
      welcomeMessage: course.welcomeMessage,
      congratulationsMessage: course.congratulationsMessage,
      subtitle: course.subtitle,
      primarilyTeach: course.primarilyTeach,
      description: course.description,
      reviewStatus: course.reviewStatus,
      user: {
        id: course.user.id,
        name: course.user.name,
      },
      averageReview,
      countReview: totalReviewCount,
      countStudent: totalStudent,
      promotionalVideo: course.promotionalVideo,
      image: course.image,
      curriculums: course.curriculums,
      createdAt: course.createdAt,
      updatedAt: course.updatedAt,
    };
    const responseData: ResponseData = {
      message: 'Get curriculums by course successfully!',
      data,
    };

    return responseData;
  }

  public async getCurriculumByCourseIDAuth(
    courseID: number,
    userID: number,
  ): Promise<ResponseData> {
    const learningUser = await this.learningRepository
      .createQueryBuilder('learnings')
      .where('learnings.userId = :userID', {
        userID,
      })
      .andWhere('learnings.userId = :userID', {
        userID,
      })
      .andWhere(
        new Brackets((qb) => {
          qb.where('learnings.type = :standardType', {
            standardType: CourseUtil.STANDARD_TYPE,
          }).orWhere('learnings.type = :archieType', {
            archieType: CourseUtil.ARCHIE,
          });
        }),
      )
      .getOne();

    if (!learningUser) {
      throw new ForbiddenException();
    }
    const course = await this.courseRepository
      .createQueryBuilder('courses')
      .leftJoinAndSelect('courses.price', 'price')
      .leftJoinAndSelect('courses.level', 'level')
      .leftJoinAndSelect('courses.category', 'category')
      .leftJoinAndSelect('courses.subCategory', 'subCategory')
      .leftJoinAndSelect('courses.language', 'language')
      .leftJoinAndSelect('courses.curriculums', 'curriculum')
      .leftJoinAndSelect('curriculum.lectures', 'lecture')
      .leftJoinAndSelect('lecture.questionLectures', 'questionLecture')
      .leftJoinAndSelect('lecture.assets', 'asset')
      .leftJoinAndSelect('questionLecture.answerLectures', 'answerLecture')
      .leftJoinAndSelect('courses.user', 'user')
      .leftJoinAndSelect(
        'courses.learnings',
        'learnings',
        'learnings.type IN (:...types)',
      )
      .where('courses.id = :courseID', { courseID })
      .setParameter('types', [CourseUtil.STANDARD_TYPE, CourseUtil.ARCHIE])
      .getOne();

    if (!course) {
      throw new NotFoundException('Course not found');
    }
    let totalReviewCountStar: number = 0;
    let totalReviewCount: number = 0;
    let totalStudent: number = 0;

    course.learnings.forEach((learning) => {
      if (learning.starCount) {
        totalReviewCountStar += learning.starCount;
        totalReviewCount++;
      }
      totalStudent++;
    });
    let averageReview: number;

    if (totalReviewCount) {
      averageReview = totalReviewCountStar / totalReviewCount;
      averageReview = parseFloat(averageReview.toFixed(2));
    }

    const data: CourseCurriculum = {
      id: course.id,
      outComes: course.outComes,
      intendedFor: course.intendedFor,
      requirements: course.requirements,
      productIdStripe: course.productIdStripe,
      level: course.level,
      category: course.category,
      subCategory: course.subCategory,
      title: course.title,
      welcomeMessage: course.welcomeMessage,
      congratulationsMessage: course.congratulationsMessage,
      subtitle: course.subtitle,
      primarilyTeach: course.primarilyTeach,
      description: course.description,
      reviewStatus: course.reviewStatus,
      user: {
        id: course.user.id,
        name: course.user.name,
      },
      averageReview,
      countReview: totalReviewCount,
      countStudent: totalStudent,
      promotionalVideo: course.promotionalVideo,
      image: course.image,
      curriculums: course.curriculums,
      createdAt: course.createdAt,
      updatedAt: course.updatedAt,
    };
    const responseData: ResponseData = {
      message: 'Get curriculums by course successfully!',
      data,
    };

    return responseData;
  }

  public async getCourseByID(
    courseID: number,
    userID: number,
  ): Promise<ResponseData> {
    const course = await this.courseRepository
      .createQueryBuilder('courses')
      .leftJoinAndSelect('courses.curriculums', 'curriculum')
      .leftJoinAndSelect('curriculum.lectures', 'lecture')
      .leftJoinAndSelect('courses.user', 'user')
      .where('courses.id = :courseID', { courseID })
      .getOne();

    if (!course) {
      throw new NotFoundException('Course not found');
    }
    const responseData: ResponseData = {
      message: 'Get course by id successfully!',
      data: course,
    };

    return responseData;
  }

  public async submitReviewCourseByID(
    courseID: number,
    userID: number,
  ): Promise<ResponseData> {
    const course = await this.courseRepository
      .createQueryBuilder('courses')
      .where('courses.id = :courseID', { courseID })
      .getOne();

    if (!course) {
      throw new NotFoundException('Course not found');
    }

    if (course.userID !== userID) {
      throw new ForbiddenException();
    }

    if (course.reviewStatus !== CourseStatus.REVIEW_INIT) {
      throw new ForbiddenException();
    }

    course.reviewStatus = CourseStatus.REVIEW_PENDING;
    await this.courseRepository.save(course);
    const responseData: ResponseData = {
      message: 'Submit review course by id successfully!',
      data: course,
    };

    return responseData;
  }

  public async getCourses(getCourseDto: GetCourseDto): Promise<ResponseData> {
    const { skip, filterOrder, search, page, size, userID, subCategoryID } =
      getCourseDto;
    const queryBuilder = this.courseRepository
      .createQueryBuilder('courses')
      .leftJoinAndSelect('courses.price', 'price')
      .leftJoinAndSelect('courses.level', 'level')
      .leftJoinAndSelect('courses.category', 'category')
      .leftJoinAndSelect('courses.subCategory', 'subCategory')
      .leftJoinAndSelect('courses.language', 'language')
      .leftJoinAndSelect('courses.curriculums', 'curriculum')
      .leftJoinAndSelect('curriculum.lectures', 'lecture')
      .leftJoinAndSelect('lecture.assets', 'asset')
      .leftJoinAndSelect('courses.user', 'user');

    if (subCategoryID) {
      queryBuilder.where('courses.subCategoryId = :subCategoryID', {
        subCategoryID,
      });
    }

    if (userID) {
      queryBuilder.where('courses.userID = :userID', {
        userID,
      });
    }
    if (filterOrder) {
      switch (filterOrder) {
        case FilterOrderCourse.NEWEST_FILTER: {
          queryBuilder.orderBy('courses.createdAt', Order.DESC);
          break;
        }
        case FilterOrderCourse.OLDEST_FILTER: {
          queryBuilder.orderBy('courses.createdAt', Order.ASC);
          break;
        }
        case FilterOrderCourse.AZ_FILTER: {
          queryBuilder.orderBy('courses.title', Order.ASC);
          break;
        }
        case FilterOrderCourse.ZA_FILTER: {
          queryBuilder.orderBy('courses.title', Order.ASC);
          break;
        }
      }
    }

    if (search) {
      queryBuilder.where('courses.title LIKE :searchQuery', {
        searchQuery: `%${search}%`,
      });
    }

    const itemCount = await queryBuilder.getCount();
    queryBuilder.skip(skip).take(size);

    const { entities: courses } = await queryBuilder.getRawAndEntities();

    const coursesData = courses.map((course) => {
      const data: CourseCurriculum = {
        id: course.id,
        outComes: course.outComes,
        intendedFor: course.intendedFor,
        requirements: course.requirements,
        productIdStripe: course.productIdStripe,
        level: course.level,
        category: course.category,
        subCategory: course.subCategory,
        title: course.title,
        welcomeMessage: course.welcomeMessage,
        congratulationsMessage: course.congratulationsMessage,
        subtitle: course.subtitle,
        primarilyTeach: course.primarilyTeach,
        description: course.description,
        reviewStatus: course.reviewStatus,
        user: {
          id: course.user.id,
          name: course.user.name,
        },
        promotionalVideo: course.promotionalVideo,
        image: course.image,
        curriculums: course.curriculums,
        createdAt: course.createdAt,
        updatedAt: course.updatedAt,
      };
      return data;
    });

    const pageMetaDto = new PageMetaDto({
      itemCount,
      pageOptionsDto: {
        skip,
        order: Order.DESC,
        page,
        size,
      },
    });

    const data = new PageDto(coursesData, pageMetaDto);

    const responseData: ResponseData = {
      message: 'Get courses successfully!',
      data,
    };
    return responseData;
  }

  public async getReviewsByCourseID(
    getReviewsDto: GetReviewsDto,
    courseID: number,
  ): Promise<ResponseData> {
    const course = await this.courseRepository.getCourseByID(courseID);

    if (!course) {
      throw new NotFoundException('Course not found');
    }

    const { skip, starCount, search, page, size } = getReviewsDto;
    const queryBuilder = this.learningRepository
      .createQueryBuilder('learnings')
      .leftJoinAndSelect('learnings.user', 'user')
      .where('learnings.courseId = :courseID', { courseID })
      .andWhere(
        new Brackets((qb) => {
          qb.where('learnings.type = :standardType', {
            standardType: CourseUtil.STANDARD_TYPE,
          }).orWhere('learnings.type = :archieType', {
            archieType: CourseUtil.ARCHIE,
          });
        }),
      )
      .andWhere(
        new Brackets((qb) => {
          qb.where('learnings.starCount IS NOT NULL').orWhere(
            'learnings.comment IS NOT NULL',
          );
        }),
      );

    if (starCount) {
      queryBuilder.where('learnings.starCount = :starCount', {
        starCount,
      });
    }
    queryBuilder.orderBy('learnings.updatedStarCount', Order.DESC);

    if (search) {
      queryBuilder.where('learnings.comment LIKE :searchQuery', {
        searchQuery: `%${search}%`,
      });
    }

    const itemCount = await queryBuilder.getCount();
    queryBuilder.skip(skip).take(size);

    const { entities: learnings } = await queryBuilder.getRawAndEntities();

    const learningReview = learnings.map((learning) => {
      const data: LearningReview = {
        id: learning.id,
        type: learning.type,
        user: {
          id: learning.user.id,
          name: learning.user.name,
          avatar: learning.user.avatar,
        },
        comment: learning.comment,
        starCount: learning.starCount,
        updatedStarCount: learning.updatedStarCount,
        createdAt: learning.createdAt,
        updatedAt: learning.updatedAt,
      };
      return data;
    });

    const pageMetaDto = new PageMetaDto({
      itemCount,
      pageOptionsDto: {
        skip,
        order: Order.DESC,
        page,
        size,
      },
    });

    const data = new PageDto(learningReview, pageMetaDto);

    const responseData: ResponseData = {
      message: 'Get reviews by course id successfully!',
      data,
    };
    return responseData;
  }

  public async getOverallReviewByCourseID(
    courseID: number,
  ): Promise<ResponseData> {
    const course = await this.courseRepository.getCourseByID(courseID);

    if (!course) {
      throw new NotFoundException('Course not found');
    }

    const queryBuilder = this.learningRepository
      .createQueryBuilder('learnings')
      .leftJoinAndSelect('learnings.user', 'user')
      .where('learnings.courseId = :courseID', { courseID })
      .andWhere(
        new Brackets((qb) => {
          qb.where('learnings.type = :standardType', {
            standardType: CourseUtil.STANDARD_TYPE,
          }).orWhere('learnings.type = :archieType', {
            archieType: CourseUtil.ARCHIE,
          });
        }),
      )
      .andWhere(
        new Brackets((qb) => {
          qb.where('learnings.starCount IS NOT NULL').orWhere(
            'learnings.comment IS NOT NULL',
          );
        }),
      );

    const { entities: learnings } = await queryBuilder.getRawAndEntities();

    let totalReviewCount: number = 0;

    let fiveStarCount: number = 0;
    let fourStarCount: number = 0;
    let threeStarCount: number = 0;
    let twoStarCount: number = 0;
    let oneStarCount: number = 0;

    learnings.forEach((learning) => {
      if (learning.starCount) {
        totalReviewCount += learning.starCount;

        switch (learning.starCount) {
          case StarCount.FIVE: {
            fiveStarCount++;
            break;
          }
          case StarCount.FOUR: {
            fourStarCount++;
            break;
          }
          case StarCount.THREE: {
            threeStarCount++;
            break;
          }
          case StarCount.TWO: {
            twoStarCount++;
            break;
          }
          case StarCount.ONE: {
            oneStarCount++;
            break;
          }
        }
      }
    });

    let averageReview: number = 0;

    if (learnings.length) {
      averageReview = parseFloat(
        (totalReviewCount / learnings.length).toFixed(2),
      );

      fiveStarCount = Math.round((fiveStarCount / learnings.length) * 100);
      fourStarCount = Math.round((fourStarCount / learnings.length) * 100);
      threeStarCount = Math.round((threeStarCount / learnings.length) * 100);
      twoStarCount = Math.round((twoStarCount / learnings.length) * 100);
      oneStarCount = Math.round((oneStarCount / learnings.length) * 100);
    }

    const data: OverallReviewsByCourseID = {
      averageReview,
      totalReview: learnings.length,
      overall: {
        fiveStar: fiveStarCount,
        fourStar: fourStarCount,
        threeStar: threeStarCount,
        twoStar: twoStarCount,
        oneStar: oneStarCount,
      },
    };
    const responseData: ResponseData = {
      message: 'Get overall reviews by course id successfully!',
      data,
    };
    return responseData;
  }

  public async getCoursesCategory(
    getCoursesCategory: GetCoursesCategory,
    categoryID: number,
    userID: number | null,
  ): Promise<ResponseData> {
    const category = await this.categoryRepository.getCategoryById(categoryID);

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    const { durations, levels, rating, page, size, sortCourse } =
      getCoursesCategory;
    const queryBuilder = this.courseRepository
      .createQueryBuilder('courses')
      .leftJoinAndSelect('courses.price', 'price')
      .leftJoinAndSelect('courses.level', 'level')
      .leftJoinAndSelect('courses.category', 'category')
      .leftJoinAndSelect('courses.subCategory', 'subCategory')
      .leftJoinAndSelect('courses.language', 'language')
      .leftJoinAndSelect('courses.curriculums', 'curriculum')
      .leftJoinAndSelect('curriculum.lectures', 'lecture')
      .leftJoinAndSelect('lecture.assets', 'asset')
      .leftJoinAndSelect('courses.user', 'user')
      .leftJoinAndSelect(
        'courses.learnings',
        'learnings',
        'learnings.type IN (:...types)',
      )
      .where('courses.reviewStatus = :reviewStatus', {
        reviewStatus: CourseStatus.REVIEW_VERIFY,
      })
      .andWhere(
        new Brackets((qb) => {
          qb.where('courses.categoryId = :categoryId', {
            categoryId: categoryID,
          }).orWhere('courses.subCategoryId = :subCategoryId', {
            subCategoryId: categoryID,
          });
        }),
      )
      .setParameter('types', [CourseUtil.STANDARD_TYPE, CourseUtil.ARCHIE]);

    if (levels) {
      queryBuilder.where('courses.levelId IN (:...levels)', { levels });
    }
    queryBuilder.orderBy('courses.createdAt', Order.DESC);

    const { entities: courses } = await queryBuilder.getRawAndEntities();

    let coursesCategory: CourseCategory[] = [];
    courses.forEach((course) => {
      let totalRating = 0;
      let isPurchased = false;
      let totalReviewCount = 0;
      let averageReview = 0;
      let totalDuration = 0;

      course.curriculums.forEach((curriculum) => {
        curriculum.lectures.forEach((lecture) => {
          lecture.assets.forEach((asset) => {
            if (
              lecture.type === LectureType.LECTURE &&
              asset.type === AssetType.WATCH
            ) {
              totalDuration += asset.duration;
            }
          });
        });
      });

      course.learnings.forEach((learning) => {
        if (learning.starCount) {
          totalReviewCount += learning.starCount;
          totalRating++;
        }

        if (userID) {
          if (learning.userId === userID) {
            isPurchased = true;
          }
        }
      });

      if (totalRating) {
        averageReview = parseFloat((totalReviewCount / totalRating).toFixed(2));
      }
      coursesCategory.push({
        id: course.id,
        level: course.level,
        title: course.title,
        subtitle: course.subtitle,
        price: course.price,
        reviewStatus: course.reviewStatus,
        user: {
          id: course.user.id,
          name: course.user.name,
          avatar: course.user.avatar,
        },
        outComes: course.outComes,
        intendedFor: course.intendedFor,
        requirements: course.requirements,
        isPurchased,
        duration: totalDuration,
        totalLecture: course.curriculums.length,
        averageRating: averageReview,
        image: course.image,
        category: course.category,
        subCategory: course.subCategory,
        totalRating: totalRating,
        createdAt: course.createdAt,
        updatedAt: course.updatedAt,
      });
    });

    if (rating) {
      coursesCategory = coursesCategory.filter((course) => {
        return course.averageRating >= rating;
      });
    }
    const HOUR = 3600;

    if (durations) {
      coursesCategory = coursesCategory.filter((course) => {
        return durations.some((duration) => {
          if (
            duration === CourseDurationFilter.SHORT_DURATION &&
            course.duration <= HOUR
          ) {
            return true;
          }

          if (
            duration === CourseDurationFilter.EXTRA_SHORT_DURATION &&
            course.duration > HOUR
          ) {
            return true;
          }

          return false;
        });
      });
    }

    if (sortCourse) {
      if (sortCourse === CourseSort.MOST_REVIEW_SORT) {
        coursesCategory.sort((a, b) => b.totalRating - a.totalRating); // sort DESC by TotalRating
      }

      if (sortCourse === CourseSort.HIGHEST_SORT) {
        coursesCategory.sort((a, b) => b.averageRating - a.averageRating); // sort DESC by AverageRating
      }
    }

    const totalItem = coursesCategory.length;

    let tierOneRatingCount = 0;
    let tierTwoRatingCount = 0;
    let tierThreeRatingCount = 0;
    let tierFourRatingCount = 0;
    let tierOneDurationCount = 0;
    let tierTwoDurationCount = 0;
    let allLevelCount = 0;
    let beginnerLevelCount = 0;
    let intermediateLevelCount = 0;
    let expertLevelCount = 0;

    coursesCategory.forEach((item) => {
      if (item.averageRating > AverageRating.ONE_RATING) {
        tierOneRatingCount++;
      }

      if (item.averageRating > AverageRating.TWO_RATING) {
        tierTwoRatingCount++;
      }

      if (item.averageRating > AverageRating.THREE_RATING) {
        tierThreeRatingCount++;
      }

      if (item.averageRating > AverageRating.FOUR_RATING) {
        tierFourRatingCount++;
      }

      if (item.duration < HOUR) {
        tierOneDurationCount++;
      } else {
        tierTwoDurationCount++;
      }
      switch (item.level.name) {
        case 'Beginner':
          beginnerLevelCount++;
          break;
        case 'Intermediate':
          intermediateLevelCount++;
          break;
        case 'Expert':
          expertLevelCount++;
          break;
        case 'All':
          allLevelCount++;
          break;
      }
    });

    // const pageMetaDto = new PageMetaDto({
    //   itemCount: totalItem,
    //   pageOptionsDto: {
    //     skip,
    //     order: Order.DESC,
    //     page,
    //     size,
    //   },
    // });
    let totalPage = 0;
    let offset = 0;

    offset = (page - 1) * size;
    // const data = new PageDto(learningReview, pageMetaDto);
    if (offset >= totalItem) {
      offset = totalItem - 1;
    }

    let limit = size;

    let endIndex = offset + limit;

    if (endIndex > totalItem) {
      endIndex = totalItem;
    }

    coursesCategory = coursesCategory.slice(offset, endIndex);
    const pageCount = Math.ceil(totalItem / size);
    const hasPreviousPage = page > 1;
    const hasNextPage = page < pageCount;
    const data = {
      item: coursesCategory,
      overall: {
        tierOneRatingCount,
        tierTwoRatingCount,
        tierThreeRatingCount,
        tierFourRatingCount,
        tierOneDurationCount,
        tierTwoDurationCount,
        allLevelCount,
        beginnerLevelCount,
        intermediateLevelCount,
        expertLevelCount,
      },
      meta: {
        page,
        size,
        itemCount: totalItem,
        pageCount,
        hasPreviousPage: hasPreviousPage,
        hasNextPage,
      },
    };
    const responseData: ResponseData = {
      message: 'Get courses successfully!',
      data,
    };
    return responseData;
  }
}
