

export enum NotificationResource {
  Message = "message",
  Course = "course"
}

export enum NotificationPayload {
  NOTIFICATION_PURCHASE_COURSE_STUDENT = 'NOTIFICATION_PURCHASE_COURSE_STUDENT',
  NOTIFICATION_PURCHASE_COURSE_INSTRUCTOR = 'NOTIFICATION_PURCHASE_COURSE_INSTRUCTOR',
  NOTIFICATION_CHAT = 'NOTIFICATION_CHAT',
}

export const TITLE_RECEIVE_MESSAGE = 'You have been received new message!';
export const TITLE_PURCHASE_COURSE_STUDENT = 'You have been purchased new course!';
export const TITLE_PURCHASE_COURSE_INSTRUCTOR = 'There has been 1 course purchased!';

export const bodyReceiveMessage = (name: string): string => {
  return `${name} just sent you a message`;
}

export const bodyPurchaseCourseStudent = (name: string): string => {
  return `You have just successfully purchased the ${name} course`;
};

export const bodyPurchaseCourseInstructor = (user: string, name: string): string => {
  return `${user} have just successfully purchased the ${name} course`;
};

