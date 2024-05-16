

export enum NotificationResource {
  Message = "message",
  Course = "course"
}

export enum NotificationPayload {
  NOTIFICATION_PURCHASE_COURSE_STUDENT = 'NOTIFICATION_PURCHASE_COURSE_STUDENT',
  NOTIFICATION_CHAT = 'NOTIFICATION_CHAT',
}

export const TITLE_RECEIVE_MESSAGE = "You have been received new message!"

export const bodyReceiveMessage = (name: string): string => {
  return `${name} just sent you a message`;
}