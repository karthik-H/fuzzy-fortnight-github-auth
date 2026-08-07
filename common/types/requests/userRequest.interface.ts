export interface IUserLoginPost {
  email: string;
  password: string;
}

export interface IUserSelfPost {
  token: string;
}

export interface IUserRegisterPost {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}
