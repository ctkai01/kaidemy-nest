import {
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { PageMetaDto } from 'src/common/paginate/page-meta.dto';
import { PageDto } from 'src/common/paginate/paginate.dto';
import { CourseUtil, LearningShow, TopicLearningShow } from 'src/constants';
import { TopicLearning } from 'src/entities';
import { ResponseData } from '../../interface/response.interface';
import { CourseRepository } from '../courses/course.repository';
import { CurriculumRepository } from '../curriculum/curriculum.repository';
import { LearningRepository } from '../learning/learning.repository';
// import { CurriculumRepository } from './lecture.repository';
import { LectureRepository } from '../lecture/lecture.repository';
import { QuestionRepository } from '../question/question.repository';
import {
  CreateTopicLearningDto,
  RemoveLearningTopicLearningDto,
  UpdateTopicLearningDto,
} from './dto';
import { CreateLearningTopicLearningDto } from './dto/create-learning-topic-learning-dto';
import { GetTopicLearningDto } from './dto/get-topic-learning-dto';
import { TopicLearningRepository } from './topic_learning.repository';

@Injectable()
export class TopicLearningService {
  private logger = new Logger(TopicLearningService.name);
  constructor(
    private readonly curriculumRepository: CurriculumRepository,
    private readonly courseRepository: CourseRepository,
    private readonly lectureRepository: LectureRepository,
    private readonly questionRepository: QuestionRepository,
    private readonly learningRepository: LearningRepository,
    private readonly topicLearningRepository: TopicLearningRepository,
  ) {}
  async createTopicLearning(
    createTopicLearningDto: CreateTopicLearningDto,
    userID: number,
  ): Promise<ResponseData> {
    const { title, description } = createTopicLearningDto;

    const topicLearningData: Partial<TopicLearning> = {
      title,
      description,
      userId: userID,
    };

    const topicLearningCreated =
      await this.topicLearningRepository.createTopicLearning(topicLearningData);

    const responseData: ResponseData = {
      message: 'Create topic learning successfully!',
      data: topicLearningCreated,
    };

    return responseData;
  }

  async updateTopicLearning(
    updateTopicLearningDto: UpdateTopicLearningDto,
    userID: number,
    topicLearningID: number,
  ): Promise<ResponseData> {
    const { title, description } = updateTopicLearningDto;

    const topicLearning =
      await this.topicLearningRepository.getTopicLearningById(topicLearningID);

    if (!topicLearning) {
      throw new NotFoundException('Topic learning not found');
    }

    if (topicLearning.userId != userID) {
      throw new ForbiddenException();
    }

    topicLearning.title = title;
    topicLearning.description = description;

    await this.topicLearningRepository.save(topicLearning);

    const responseData: ResponseData = {
      message: 'Update topic learning successfully!',
      data: topicLearning,
    };

    return responseData;
  }

  async removeTopicLearning(
    userID: number,
    topicLearningID: number,
  ): Promise<ResponseData> {
    const topicLearning =
      await this.topicLearningRepository.getTopicLearningById(topicLearningID);

    if (!topicLearning) {
      throw new NotFoundException('Topic learning not found');
    }

    if (topicLearning.userId != userID) {
      throw new ForbiddenException();
    }

    await this.topicLearningRepository.delete(topicLearningID);

    const responseData: ResponseData = {
      message: 'Delete topic learning successfully!',
    };

    return responseData;
  }

  async addLearningToTopicLearning(
    updateTopicLearningDto: CreateLearningTopicLearningDto,
    userID: number,
  ): Promise<ResponseData> {
    const { learningID, topicLearningID } = updateTopicLearningDto;

    // Check learning
    const learning = await this.learningRepository.getLearningByIDRelation(
      learningID,
      [
        'course.user',
        'course.category',
        'course.subCategory',
        'course.level',
        'course.price',
      ],
    );

    if (!learning) {
      throw new NotFoundException('Learning not found');
    }

    if (learning.userId !== userID) {
      throw new ForbiddenException();
    }

    if (learning.type !== CourseUtil.STANDARD_TYPE) {
      throw new NotFoundException('Cannot add this course learning');
    }

    // Check topic learning
    const topicLearning =
      await this.topicLearningRepository.getTopicLearningByIdWithRelation(
        topicLearningID,
        [
          'learnings',
          'learnings.course.user',
          'learnings.course.category',
          'learnings.course.subCategory',
          'learnings.course.level',
          'learnings.course.price',
        ],
      );

    if (!topicLearning) {
      throw new NotFoundException('Topic learning not found');
    }

    if (topicLearning.userId !== userID) {
      throw new ForbiddenException();
    }

    // Check exist
    let checkLearning = topicLearning.learnings.find(
      (learning) => learning.id === learningID,
    );

    if (checkLearning) {
      throw new InternalServerErrorException(
        'Already added learning to this topic',
      );
    }
    topicLearning.learnings.push(learning);

    await this.topicLearningRepository.save(topicLearning);
    const learningShows: LearningShow[] = [];
    topicLearning.learnings.forEach((learning) => {
      console.log('learning.course: ', learning.course);
      learningShows.push({
        course: {
          id: learning.course.id,
          author: {
            id: learning.course.user.id,
            name: learning.course.user.name,
          },
          category: learning.course.category,
          subCategory: learning.course.subCategory,
          image: learning.course.image,
          level: learning.course.level,
          price: learning.course.price,
          reviewStatus: learning.course.reviewStatus,
          title: learning.course.title,
        },
        courseID: learning.courseId,
        id: learning.id,
        type: learning.type,
        userID: learning.userId,
        comment: learning.comment,
        starCount: learning.starCount,
      });
    });

    const topicLearningShow: TopicLearningShow = {
      id: topicLearning.id,
      learnings: learningShows,
      title: topicLearning.title,
      userID: topicLearning.userId,
      description: topicLearning.description,
    };
    const responseData: ResponseData = {
      message: 'Add learning to topic learning successfully!',
      data: topicLearningShow,
    };

    return responseData;
  }

  async removeLearningToTopicLearning(
    topicLearningID: number,
    learningID: number,
    userID: number,
  ): Promise<ResponseData> {
    // Check learning
    const learning = await this.learningRepository.getLearningByID(learningID);

    if (!learning) {
      throw new NotFoundException('Learning not found');
    }

    if (learning.userId !== userID) {
      throw new ForbiddenException();
    }

    if (learning.type !== CourseUtil.STANDARD_TYPE) {
      throw new NotFoundException('Cannot remove this course learning');
    }

    // Check topic learning
    const topicLearning =
      await this.topicLearningRepository.getTopicLearningByIdWithRelation(
        topicLearningID,
        ['learnings'],
      );

    if (!topicLearning) {
      throw new NotFoundException('Topic learning not found');
    }

    if (topicLearning.userId !== userID) {
      throw new ForbiddenException();
    }
    // Check exist
    let checkLearning = topicLearning.learnings.find(
      (learning) => learning.id === learningID,
    );

    if (!checkLearning) {
      throw new InternalServerErrorException(
        'This learning not belong to this topic',
      );
    }

    topicLearning.learnings = topicLearning.learnings.filter(
      (learning) => learning.id != learningID,
    );

    await this.topicLearningRepository.save(topicLearning);

    const responseData: ResponseData = {
      message: 'Remove learning to topic learning successfully!',
    };

    return responseData;
  }

  async getTopicLearning(
    getTopicLearningDto: GetTopicLearningDto,
    userID: number,
  ): Promise<ResponseData> {
    const { order } = getTopicLearningDto;

    const queryBuilder =
      this.topicLearningRepository.createQueryBuilder('topic_learnings');
    queryBuilder
      .where('topic_learnings.userId = :userId', { userId: userID })
      .orderBy('topic_learnings.created_at', order)
      .leftJoinAndSelect('topic_learnings.learnings', 'learning')
      .leftJoinAndSelect('learning.course', 'course')
      .leftJoinAndSelect('course.price', 'price')
      .leftJoinAndSelect('course.level', 'level')
      .leftJoinAndSelect('course.user', 'user')
      .leftJoinAndSelect('course.category', 'category')
      .leftJoinAndSelect('course.subCategory', 'subCategory');

    const itemCount = await queryBuilder.getCount();

    queryBuilder.skip(getTopicLearningDto.skip).take(getTopicLearningDto.size);

    const { entities: topicLearnings } = await queryBuilder.getRawAndEntities();
    // console.log(topicLearnings);

    const topicLearningShow: TopicLearningShow[] = [];

    topicLearnings.forEach((topicLearning) => {
      const learningsShow: LearningShow[] = [];

      topicLearning.learnings.forEach((learning) => {
        learningsShow.push({
          id: learning.id,
          courseID: learning.courseId,
          type: learning.type,
          userID: learning.userId,
          starCount: learning.starCount,
          comment: learning.comment,
          course: {
            id: learning.course.id,
            author: {
              id: learning.course.user.id,
              name: learning.course.user.name,
            },
            image: learning.course.image,
            category: learning.course.category,
            level: learning.course.level,
            price: learning.course.price,
            reviewStatus: learning.course.reviewStatus,
            subCategory: learning.course.subCategory,
            title: learning.course.title,
          },
        });
      });

      topicLearningShow.push({
        id: topicLearning.id,
        title: topicLearning.title,
        userID: topicLearning.userId,
        description: topicLearning.description,
        learnings: learningsShow,
      });
    });

    const pageMetaDto = new PageMetaDto({
      itemCount,
      pageOptionsDto: getTopicLearningDto,
    });

    const data = new PageDto(topicLearningShow, pageMetaDto);

    const responseData: ResponseData = {
      message: 'Get topic learnings successfully!',
      data,
    };

    return responseData;
  }
}
