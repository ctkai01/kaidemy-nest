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
  CourseStatus,
  CourseTransaction,
  CourseUtil,
  EnrollmentStats,
  NotificationPayload,
  OverviewCourseAuthor,
  RatingStats,
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
}
