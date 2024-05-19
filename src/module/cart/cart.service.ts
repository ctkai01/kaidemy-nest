import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { Cart, Checkout } from 'src/entities';
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
import { v4 as uuidv4 } from 'uuid';
import { CourseTransaction } from 'src/constants';
import { UserRepository } from '../user/user.repository';
import { CartItem, CartResponse } from 'src/constants/payment';
@Injectable()
export class CartService {
  private logger = new Logger(CartService.name);
  constructor(
    @InjectStripeClient() private readonly stripeClient: Stripe,
    private readonly curriculumRepository: CurriculumRepository,
    private readonly userRepository: UserRepository,
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

    await this.cartRepository.save(cart);

    const responseData: ResponseData = {
      message: 'Remove course from cart successfully!',
    };

    return responseData;
  }

  async getCart(userID: number): Promise<ResponseData> {
    // Get cart by user id
    const cart = await this.cartRepository.getCartByUserIDRelation(userID, [
      'courses',
    ]);

    if (!cart) {
      const cartResponse: CartResponse = {
        userID,
        cartItems: [],
      };
      const responseData: ResponseData = {
        message: 'Get cart successfully!',
        data: cartResponse,
      };
      return responseData;
    }
    const cartItems: CartItem[] = [];
    cart.courses.forEach((course) => {
      cartItems.push({
        cartID: cart.id,
        course,
      });
    });

    const cartResponse: CartResponse = {
      userID,
      cartItems,
    };
    await this.cartRepository.save(cart);

    const responseData: ResponseData = {
      message: 'Get cart successfully!',
      data: cartResponse,
    };

    return responseData;
  }

  async claimsPayment(userID: number): Promise<ResponseData> {
    const user = await this.userRepository.getUserByIDRelation(userID, [
      'checkout',
    ]);

    // Get cart by user id
    const cart = await this.cartRepository.getCartByUserIDRelation(userID, [
      'courses.price',
      'courses.user',
    ]);

    if (!cart) {
      throw new NotFoundException('Cart not found');
    }

    if (!cart.courses.length) {
      throw new BadRequestException('Cart is empty');
    }
    let totalPrice = 0;

    const checkoutSessionLineItemParams: Stripe.Checkout.SessionCreateParams.LineItem[] =
      [];

    const courseTransactions: CourseTransaction[] = [];
    const promises = cart.courses.map(async (course) => {
      console.log('Price: ', course.price);
      totalPrice += course.price.value;

      courseTransactions.push({
        id: course.id,
        price: course.price.value,
        author: {
          id: course.user.id,
          stripe: course.user.accountStripeID,
        },
      });
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
    const uuid = uuidv4();
    console.log(
      'checkoutSessionLineItemParams: ',
      checkoutSessionLineItemParams,
    );
    const checkoutSessionParams: Stripe.Checkout.SessionCreateParams = {
      mode: 'payment',
      success_url: `http://localhost:5173/checkout-success`,
      cancel_url: `http://localhost:5173/checkout-cancel`,
      line_items: checkoutSessionLineItemParams,

      payment_intent_data: {
        transfer_group: uuid,
        metadata: {
          userBuy: userID,
          courses: JSON.stringify(courseTransactions),
          group: uuid,
        },
      },
      // currency: "USD"
    };

    const s = await this.stripeClient.checkout.sessions.create(
      checkoutSessionParams,
    );
    //
    console.log('S: ', user);

    const checkouts: Checkout[] = [];
    cart.courses.forEach((course) => {
      checkouts.push({
        checkoutSession: s.id,
        userId: user.id,
        courseId: course.id,
      });
    });

    await this.cartRepository.manager.getRepository(Checkout).save(checkouts);

    const responseData: ResponseData = {
      message: 'Claims payment successfully!',
      data: s.url,
    };

    return responseData;
  }
}
