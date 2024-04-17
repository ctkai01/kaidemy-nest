export enum LectureType {
  LECTURE = 1,
  QUIZ,
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
}
// export enum AssetKind {
//   MEDIA = 1,
//   RESOURCE
// }
// var (
// 	MediaType = 1
// 	ResourceType = 2
// )
