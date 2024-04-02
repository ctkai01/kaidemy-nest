import {
  Injectable,
  InternalServerErrorException,
  Logger
} from '@nestjs/common';
import { Cart } from 'src/entities';
import { ResponseData } from '../../interface/response.interface';
import { CourseRepository } from '../courses/course.repository';
import { CurriculumRepository } from '../curriculum/curriculum.repository';
// import { CurriculumRepository } from './lecture.repository';
import { LectureRepository } from '../lecture/lecture.repository';
import { CartRepository } from './cart.repository';
import { CreateQuestionDto } from './dto';

@Injectable()
export class CartService {
  private logger = new Logger(CartService.name);
  constructor(
    private readonly curriculumRepository: CurriculumRepository,
    private readonly courseRepository: CourseRepository,
    private readonly lectureRepository: LectureRepository,
    private readonly cartRepository: CartRepository,
  ) {}
  async createCart(
    userID: number,
  ): Promise<ResponseData> {

    const cart = await this.cartRepository.getCartByUSerID(userID);

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
  
}
