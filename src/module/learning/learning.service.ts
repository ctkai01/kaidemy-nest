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
import { PriceRepository } from '../price/price.repository';
import { UserRepository } from '../user/user.repository';
import { LearningRepository } from './learning.repository';
import { UpdateLearningDto } from './dto';
@Injectable()
export class LearningService {
  private logger = new Logger(LearningService.name);
  constructor(
    private readonly curriculumRepository: CurriculumRepository,
    private readonly userRepository: UserRepository,
    private readonly courseRepository: CourseRepository,
    private readonly lectureRepository: LectureRepository,
    private readonly learningRepository: LearningRepository,
    private readonly priceRepository: PriceRepository,
  ) {}
  async updateLearning(
    userID: number,
    updateLearningDto: UpdateLearningDto,
  ): Promise<ResponseData> {
    const responseData: ResponseData = {
      message: 'Update learning successfully!',
      // data: cartCreated,
    };

    return responseData;
  }
}