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
  UploadResource,
} from 'src/constants';
import { Learning } from 'src/entities/learning.entity';
import { TransactionRepository } from './transation.repository';
import { CartRepository } from '../cart/cart.repository';
import { FEE_PLATFORM } from 'src/constants/payment';
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

      await queryRunnerTransaction.manager.getRepository(Transaction).save(transaction);

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
          destination: course.author,
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

      await queryRunnerTransaction.commitTransaction();
      await queryRunnerCart.commitTransaction();
    } catch (err) {
      console.log("Error: ", err)
      await queryRunnerTransaction.rollbackTransaction();
      await queryRunnerCart.rollbackTransaction();
      throw new Error('Payment processing failed:');
    }
  }
}
