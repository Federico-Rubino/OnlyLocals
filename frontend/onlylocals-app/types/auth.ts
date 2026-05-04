
export interface LoginCredentials {
  identifier: string; //both email and password work
  password: string;
}

export interface LoginResponse {
  message: string;
  accessToken: string;
  refreshToken: string;
}