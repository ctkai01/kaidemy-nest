import {
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
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
        startCount: learning.starCount,
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
    removeLearningTopicLearningDto: RemoveLearningTopicLearningDto,
    userID: number,
  ): Promise<ResponseData> {
    const { learningID, topicLearningID } = removeLearningTopicLearningDto;

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
  // async updateAnswer(
  //   updateAnswerDto: UpdateAnswerDto,
  //   userID: number,
  //   answerID: number,
  // ): Promise<ResponseData> {
  //   const { questionID, answerText, explain, isCorrect } = updateAnswerDto;
  //   // Check answer exist
  //   const answer = await this.answerRepository.getAnswerById(answerID);

  //   //  Check question exist
  //   const question = await this.questionRepository.getQuestionById(questionID);

  //   if (!question) {
  //     throw new NotFoundException('Question not found');
  //   }

  //   const lecture = await this.lectureRepository.getLectureById(
  //     question.lectureId,
  //   );

  //   if (!lecture) {
  //     throw new NotFoundException('Lecture not found');
  //   }

  //   if (lecture.type !== LectureType.QUIZ) {
  //     throw new BadRequestException('Must quiz');
  //   }

  //   //  Check curriculum exist
  //   const curriculum =
  //     await this.curriculumRepository.getCurriculumByIdWithRelation(
  //       lecture.curriculumID,
  //       ['course'],
  //     );

  //   if (!curriculum) {
  //     throw new NotFoundException('Curriculum not found');
  //   }

  //   // Check permission author course
  //   if (userID !== curriculum.course.userID) {
  //     throw new ForbiddenException('Not author of course');
  //   }

  //   (answer.answerText = answerText),
  //     (answer.explain = explain || ''),
  //     (answer.isCorrect = isCorrect || false);

  //   await this.answerRepository.save(answer);

  //   // Update course status
  //   const course = curriculum.course;
  //   course.reviewStatus = CourseStatus.REVIEW_INIT;

  //   await this.courseRepository.save(course);

  //   const responseData: ResponseData = {
  //     message: 'Update answer successfully!',
  //     data: answer,
  //   };

  //   return responseData;
  // }

  // async deleteAnswer(userID: number, answerID: number): Promise<ResponseData> {
  //   // Check answer exist
  //   const answer = await this.answerRepository.getAnswerById(answerID);

  //   //  Check question exist
  //   const question = await this.questionRepository.getQuestionById(
  //     answer.questionId,
  //   );

  //   if (!question) {
  //     throw new NotFoundException('Question not found');
  //   }

  //   const lecture = await this.lectureRepository.getLectureById(
  //     question.lectureId,
  //   );

  //   if (!lecture) {
  //     throw new NotFoundException('Lecture not found');
  //   }

  //   if (lecture.type !== LectureType.QUIZ) {
  //     throw new BadRequestException('Must quiz');
  //   }

  //   //  Check curriculum exist
  //   const curriculum =
  //     await this.curriculumRepository.getCurriculumByIdWithRelation(
  //       lecture.curriculumID,
  //       ['course'],
  //     );

  //   if (!curriculum) {
  //     throw new NotFoundException('Curriculum not found');
  //   }

  //   // Check permission author course
  //   if (userID !== curriculum.course.userID) {
  //     throw new ForbiddenException('Not author of course');
  //   }

  //   await this.answerRepository.delete(answerID);

  //   // Update course status
  //   const course = curriculum.course;
  //   course.reviewStatus = CourseStatus.REVIEW_INIT;

  //   await this.courseRepository.save(course);

  //   const responseData: ResponseData = {
  //     message: 'Delete answer successfully!',
  //     data: answer,
  //   };

  //   return responseData;
  // }

  // async deleteQuestion(
  //   userID: number,
  //   questionID: number,
  // ): Promise<ResponseData> {
  //   // Check question exist
  //   const question = await this.questionRepository.getQuestionById(questionID);

  //   if (!question) {
  //     throw new NotFoundException('Question not found');
  //   }

  //   // Check lecture exist
  //   const lecture = await this.lectureRepository.getLectureById(
  //     question.lectureId,
  //   );

  //   if (!lecture) {
  //     throw new NotFoundException('Lecture not found');
  //   }

  //   if (lecture.type !== LectureType.QUIZ) {
  //     throw new BadRequestException('Must quiz');
  //   }

  //   // Check curriculum exist
  //   const curriculum =
  //     await this.curriculumRepository.getCurriculumByIdWithRelation(
  //       lecture.curriculumID,
  //       ['course'],
  //     );

  //   if (!curriculum) {
  //     throw new NotFoundException('Curriculum not found');
  //   }

  //   // Check permission author course
  //   if (userID !== curriculum.course.userID) {
  //     throw new ForbiddenException('Not author of course');
  //   }

  //   await this.questionRepository.delete(questionID);

  //   // Update status
  //   const course = curriculum.course;
  //   course.reviewStatus = CourseStatus.REVIEW_INIT;

  //   await this.courseRepository.save(course);

  //   const responseData: ResponseData = {
  //     message: 'Delete question successfully!',
  //   };

  //   return responseData;
  // }
}
