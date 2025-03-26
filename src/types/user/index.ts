import { Project } from "types/project";

export interface User {
  id: number;
  name: string;
  email: string;
  password: string;
  role: UserRole;
  supervisor_id: number | null;
  project_id: number;
  project?: Project;
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
  supervisorId: string | null;
}
