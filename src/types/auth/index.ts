export interface LoginPayload {
  email: string;
  password: string;
}

export interface ChangePasswordPayload {
  userId: number;
  oldPassword: string;
  newPassword: string;
}

export interface LoginResponse {
  token: string;
  user: {
    id: number;
    name: string;
    email: string;
    role: string;
    project: string;
    projectId: number;
    supervisorRole?: string;
  };
}

export interface AuthService {
  login(payload: LoginPayload): Promise<{
    status: number;
    message?: string;
    token?: string;
  }>;
  changePassword(payload: ChangePasswordPayload): Promise<{
    status: number;
    message?: string;
    data?: any;
  }>;
}
