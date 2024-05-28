import { Category, Curriculum, Language, Level, Price } from 'src/entities';
import { AuthorLearning, UserQuestionLecture, UserShowCommon } from './user';

export enum LectureType {
  LECTURE = 1,
  QUIZ,
}

export enum FilterOrderCourse {
  NEWEST_FILTER = 1,
  OLDEST_FILTER,
  AZ_FILTER,
  ZA_FILTER,
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

export enum StarCount {
  ONE = 1,
  TWO,
  THREE,
  FOUR,
  FIVE,
}

export enum Reply {
  RESPONSE = 'response_reply',
  NO_RESPONSE = 'no_response_reply',
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

export enum CourseSort {
  NEWEST_SORT = 'newest',
  HIGHEST_SORT = 'highest_rated',
  MOST_REVIEW_SORT = 'most_review',
}

export enum AverageRating {
  ONE_RATING = 4.5,
  TWO_RATING = 4.0,
  THREE_RATING = 3.5,
  FOUR_RATING = 3.0,
}

export interface OverallCourse {
  tierOneRatingCount: number;
  tierTwoRatingCount: number;
  tierThreeRatingCount: number;
  tierFourRatingCount: number;
  tierOneDurationCount: number;
  tierTwoDurationCount: number;
  allLevelCount: number;
  beginnerLevelCount: number;
  intermediateLevelCount: number;
  expertLevelCount: number;
}

export enum CourseDurationFilter {
  SHORT_DURATION = 'short',
  EXTRA_SHORT_DURATION = 'extraShort',
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
  language: Language;
  price: Price;
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

export interface CurriculumPublic {
  id?: number;
  title: string;
  description: string;
  courseId: number;
  lectures?: LecturePublic[];
  updatedAt?: Date;
  createdAt?: Date;
}

export interface LecturePublic {
  id?: number;
  title: string;
  article?: string;
  description?: string;
  assets?: AssetPublic[];
  isPromotional?: boolean;
  curriculumID: number;
  type: number;
  updatedAt?: Date;
  createdAt?: Date;
}

export interface AssetPublic {
  id?: number;
  lectureId: number;
  type: number;
  duration?: number;
  size: number;
  updatedAt?: Date;
  createdAt?: Date;
}

export interface LearningReview {
  id?: number;
  type: number;
  starCount?: number;
  comment?: string;
  user: UserShowCommon;
  updatedStarCount?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface OverallReviewsByCourseID {
  averageReview: number;
  totalReview: number;
  overall: {
    fiveStar: number;
    fourStar: number;
    threeStar: number;
    twoStar: number;
    oneStar: number;
  };
}

export interface CourseCategory {
  id: number;
  level: Level;
  title: string;
  subtitle: string;
  price: Price;
  reviewStatus: number;
  user: UserShowCommon;
  outComes: string[];
  intendedFor: string[];
  requirements: string[];
  isPurchased: boolean;
  totalLecture: number;
  duration: number;
  averageRating: number;
  totalRating: number;
  category: Category;
  subCategory: Category;
  image: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface SearchItem {
  teacher?: UserShowCommon;
  course?: {
    id: number;
    title: string;
    nameAuthor: string;
    image: string;
  };
}

export interface CourseAuthorReview {
  id: number;
  title: string;
}

export interface ReviewUser {
  course: {
    id: number;
    image: string;
    title: string;
  };
  user: UserShowCommon;
  comment: string;
  starCount: number;
  createdAt?: Date;
  updatedAt?: Date;
  updatedStarCount?: Date;
}
// export enum AssetKind {
//   MEDIA = 1,
//   RESOURCE
// }
// var (
// 	MediaType = 1
// 	ResourceType = 2
// )
