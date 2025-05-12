import { User } from "types/user";

export interface Report {
  id: number;
  project: string;
  task_title: string;
  task_description: string;
  progress: number;
  man_hours: number;
  working_time: number;
  user_id: number;
  user?: User;
}

export interface ReportPayload {
  project: string;
  task_title: string;
  task_description: string;
  progress: number;
  man_hours: number;
  working_time: number;
  user_id: number;
}
