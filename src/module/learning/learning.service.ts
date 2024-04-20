import {
  ForbiddenException,
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
    learningID: number,
    updateLearningDto: UpdateLearningDto,
  ): Promise<ResponseData> {
    const { comment, process, starCount, type}  = updateLearningDto
    const learning = await this.learningRepository.getLearningByID(learningID)



    if (!learning) {
      throw new NotFoundException("Learning not found")
    }

    if (userID !== learning.userId) {
      throw new ForbiddenException("user not permission");

    }
    
    learning.process = process;
    learning.comment = comment
    learning.starCount = starCount;
    learning.type = type;


    await this.learningRepository.save(learning)

    const responseData: ResponseData = {
      message: 'Update learning successfully!',
      data: learning,
    };

    return responseData;
  }
}