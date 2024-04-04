import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException
} from '@nestjs/common';
import { Cart } from 'src/entities';
import { ResponseData } from '../../interface/response.interface';
import { CourseRepository } from '../courses/course.repository';
import { CurriculumRepository } from '../curriculum/curriculum.repository';
// import { CurriculumRepository } from './lecture.repository';
import { LectureRepository } from '../lecture/lecture.repository';
import { CartRepository } from './cart.repository';
import { CreateQuestionDto } from './dto';
import { PriceModule } from '../price/price.module';
import { PriceRepository } from '../price/price.repository';
import Stripe from 'stripe';
import { InjectStripeClient } from '@golevelup/nestjs-stripe';

@Injectable()
export class CartService {
  private logger = new Logger(CartService.name);
  constructor(
    @InjectStripeClient() private readonly stripeClient: Stripe,
    private readonly curriculumRepository: CurriculumRepository,
    private readonly courseRepository: CourseRepository,
    private readonly lectureRepository: LectureRepository,
    private readonly cartRepository: CartRepository,
    private readonly priceRepository: PriceRepository,
  ) {}
  async createCart(userID: number): Promise<ResponseData> {
    const cart = await this.cartRepository.getCartByUserID(userID);

    if (cart) {
      throw new InternalServerErrorException('Cart already existed');
    }

    const cartCreate: Cart = {
      userId: userID,
    };

    const cartCreated = await this.cartRepository.createCart(cartCreate);

    const responseData: ResponseData = {
      message: 'Create cart successfully!',
      data: cartCreated,
    };

    return responseData;
  }

  async addCourseToCart(
    userID: number,
    courseID: number,
  ): Promise<ResponseData> {
    // Check course
    const course = await this.courseRepository.getCourseByID(courseID);

    if (!course) {
      throw new NotFoundException('Course not found');
    }

    // Get cart by user id
    const cart = await this.cartRepository.getCartByUserIDRelation(userID, [
      'courses',
    ]);

    if (!cart) {
      throw new NotFoundException('Cart not found');
    }

    // Check has already exist course in cart
    const checkCourse = cart.courses.find((course) => course.id === courseID);

    if (checkCourse) {
      throw new InternalServerErrorException('Already added course');
    }

    cart.courses.push(course);

    this.cartRepository.save(cart);

    const responseData: ResponseData = {
      message: 'Add course to cart successfully!',
    };

    return responseData;
  }

  async deleteCourseToCart(
    userID: number,
    courseID: number,
  ): Promise<ResponseData> {
    // Check course
    const course = await this.courseRepository.getCourseByID(courseID);

    if (!course) {
      throw new NotFoundException('Course not found');
    }

    // Get cart by user id
    const cart = await this.cartRepository.getCartByUserIDRelation(userID, [
      'courses',
    ]);

    if (!cart) {
      throw new NotFoundException('Cart not found');
    }

    // Check has already exist course in cart
    const checkCourse = cart.courses.find((course) => course.id === courseID);

    if (!checkCourse) {
      throw new InternalServerErrorException(
        'The course has not been added to the cart',
      );
    }

    cart.courses = cart.courses.filter((course) => course.id !== courseID);

    this.cartRepository.save(cart);

    const responseData: ResponseData = {
      message: 'Remove course from cart successfully!',
    };

    return responseData;
  }

  async claimsPayment(userID: number): Promise<ResponseData> {
    // Get cart by user id
    const cart = await this.cartRepository.getCartByUserIDRelation(userID, [
      'courses.price',
    ]);

    if (!cart) {
      throw new NotFoundException('Cart not found');
    }

    if (!cart.courses.length) {
      throw new BadRequestException('Cart is empty');
    }
    let totalPrice = 0;

    const checkoutSessionLineItemParams: Stripe.Checkout.SessionCreateParams.LineItem[] = []

    // cart.courses.forEach(async (course) => {
    //   console.log('Price: ', course.price);
    //   totalPrice += course.price.value;

    //   const product = await this.stripeClient.products.retrieve(course.productIdStripe);
    //   console.log("default_price: ", product.default_price.toString())
    //   checkoutSessionLineItemParams.push({
    //     price: product.default_price.toString(),
    //     quantity: 1,
    //   })
    // });
    const courseIds = []
    const promises = cart.courses.map(async (course) => {
      console.log('Price: ', course.price);
      totalPrice += course.price.value;
      courseIds.push(course.id)
      const product = await this.stripeClient.products.retrieve(
        course.productIdStripe,
      );
      console.log('default_price: ', product.default_price.toString());
      checkoutSessionLineItemParams.push({
        price: product.default_price.toString(),
        quantity: 1,
      });
    });

await Promise.all(promises);
    const key = "xzxz"
    const applicationFee = totalPrice * 10 / 100

    console.log(
      'checkoutSessionLineItemParams: ',
      checkoutSessionLineItemParams,
    );
    const checkoutSessionParams: Stripe.Checkout.SessionCreateParams = {
      mode: 'payment',
      success_url: `http://localhost:5173/checkout-success?key=${key}}`,
      cancel_url: `http://localhost:5173/checkout-cancel`,
      line_items: checkoutSessionLineItemParams,
      metadata: {
        user_buy: userID,
      },
      payment_intent_data: {
        transfer_group: 'OK',
        metadata: {
          user_buy: userID,
          courses: JSON.stringify(courseIds),
        },
        // application_fee_amount: applicationFee,
      },
    };

    const s = await this.stripeClient.checkout.sessions.create(checkoutSessionParams);
    const responseData: ResponseData = {
      message: 'Remove course from cart successfully!',
      data: s.url
    };

    return responseData;
  }
}
