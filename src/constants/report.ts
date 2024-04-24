import { IssueType } from "src/entities";
import { CourseReport } from "./course";
import { UserReport } from "./user";

export interface ReportShow {
  id: number;
  user: UserReport;
  course: CourseReport;
  issueType: IssueType
  description: string
}

