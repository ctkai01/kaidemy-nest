import { NotificationPayload } from "src/constants";

export interface PushNotification {
  fromID: number;
  toID: number[];
  data: any;
  type: NotificationPayload;
}
