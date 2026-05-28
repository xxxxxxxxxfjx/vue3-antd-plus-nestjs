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
  _id: string;
  username: string;
  nickname: string;
  roleId?: any;
  status: boolean;
  token: string;
}
