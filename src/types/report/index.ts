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
  id: number;
  project: string;
  task_title: string;
  task_description: string;
  progress: number;
  man_hours: number;
  working_time: number;
  user_id: number;
}

export type ReportStatus = "pending" | "success" | "failed";
