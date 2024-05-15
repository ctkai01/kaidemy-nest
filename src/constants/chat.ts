import { IssueType } from "src/entities";
import { CourseReport } from "./course";
import { UserReport } from "./user";

export interface ChatDetailShow {
  id: number;
  fromUser: ChatUserShow;
  toUser: ChatUserShow;
  text: string
  createdAt: string
}

export interface ChatUserShow {
  id: number;
  name: string;
  avatar?: string;
}


export interface ChatChannelShow {
  id: number;
  user: ChatUserShow;
  latestMessage: LatestMessageShow;
}

interface LatestMessageShow {
  user: ChatUserShow;
  text: string;
  createdAt: string;
}