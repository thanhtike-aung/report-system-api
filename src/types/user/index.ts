import { Project } from "types/project";
import { Report } from "types/report";

export interface User {
  id: number;
  name: string;
  email: string;
  password: string;
  role: UserRole;
  is_active: boolean;
  can_report: boolean;
  workflows_url: string | null;
  supervisor_id: number | null;
  project_id: number;
  project?: Project;
  subordinates?: any;
  reports?: Report[];
}

export type UserRole =
  | "rootadmin"
  | "manager"
  | "bse"
  | "leader"
  | "subleader"
  | "member";

export interface UserPayload {
  name: string;
  email: string;
  password: string;
  projectId: string;
  role: UserRole;
  isActive: boolean;
  canReport: boolean;
  workflowsUrl?: string;
  supervisorId: string | null;
}
