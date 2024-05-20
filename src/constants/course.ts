import { Category, Curriculum, Level, Price } from 'src/entities';
import { AuthorLearning, UserQuestionLecture } from './user';

export enum LectureType {
  LECTURE = 1,
  QUIZ,
}

export enum FilterOrderCourse {
  NEWEST_FILTER = 1,
  OLDEST_FILTER,
  AZ_FILTER,
  ZA_FILTER
}

export enum CourseStatus {
  REVIEW_INIT = 0,
  REVIEW_PENDING,
  REVIEW_VERIFY,
}

export enum AssetType {
  RESOURCE = 1,
  WATCH,
}

export enum UploadType {
  UPLOAD_ARTICLE,
  REMOVE_ASSET,
}

export enum CourseUtil {
  STANDARD_TYPE = 1,
  WISH_LIST_TYPE = 2,
  ARCHIE = 3,
}

export interface CourseTransaction {
  id: number;
  price: number;
  author: {
    stripe: string;
    id: number;
  };
}

export interface CourseLearning {
  id: number;
  title: string;
  reviewStatus: CourseStatus;
  image: string;
  price: Price;
  level: Level;
  author: AuthorLearning;
  category: Category;
  subCategory: Category;
}

export interface LearningShow {
  id: number;
  userID: number;
  courseID: number;
  process?: number;
  type: CourseUtil;
  startCount?: number;
  comment?: string;
  course: CourseLearning;
  averageReview?: number;
  countReview?: number;
}

export interface TopicLearningShow {
  id: number;
  title: string;
  description?: string;
  userID: number;
  learnings: LearningShow[];
}

export interface CourseReport {
  id: number;
  title: string;
  image?: string;
}

export interface CourseQuestionLecture {
  id: number;
  title: string;
  image?: string;
}

export interface QuestionLectureShow {
  id: number;
  user: UserQuestionLecture;
  totalAnswer: number;
  courseID: number;
  lectureID: number;
  title: string;
  description: string;
  createdAt: string;
  updatedAt: string;
}

export interface QuestionLectureAuthorShow {
  id: number;
  user: UserQuestionLecture;
  totalAnswer: number;
  lectureID: number;
  title: string;
  course: CourseQuestionLecture;
  description: string;
  createdAt: string;
  updatedAt: string;
}

export interface AnswerLectureShow {
  id: number;
  user: UserQuestionLecture;
  questionLectureID: number;
  answer: string;
  createdAt: string;
  updatedAt: string;
}

export interface RatingStats {
  total: number;
  totalThisMonth: number;
  detailStats: number[];
}

export interface EnrollmentStats {
  total: number;
  totalThisMonth: number;
  detailStats: number[];
}

export interface OverviewCourseAuthor {
  enrollments: EnrollmentStats;
  ratings: RatingStats;
  revenues: number;
}

export interface CourseCurriculum {
  id: number;
  outComes: string[];
  intendedFor: string[];
  requirements: string[];
  productIdStripe: string;
  level: Level;
  category: Category;
  subCategory: Category;
  title: string;
  welcomeMessage?: string;
  congratulationsMessage?: string;
  subtitle?: string;
  primarilyTeach?: string;
  description?: string;
  reviewStatus?: number;
  user: {
    id: number;
    name: string;
  };
  promotionalVideo?: string;
  image?: string;
  curriculums?: Curriculum[];
  averageReview?: number;
  countReview?: number;
  countStudent?: number;
  updatedAt: Date;
  createdAt: Date;
}

// export enum AssetKind {
//   MEDIA = 1,
//   RESOURCE
// }
// var (
// 	MediaType = 1
// 	ResourceType = 2
// )
