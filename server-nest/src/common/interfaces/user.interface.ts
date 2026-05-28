export interface JwtPayload {
  sub: string;
  username: string;
  iat?: number;
  exp?: number;
}

export interface RequestUser {
  userId: string;
  username: string;
}

export interface LoginResponse {
  access_token: string;
  user: {
    id: string;
    username: string;
    nickname: string;
    email?: string;
    avatar?: string;
    roleId?: any;
  };
}
