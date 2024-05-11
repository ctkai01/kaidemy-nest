import { User } from "src/entities/user.entity";

export interface UserRegister {
    user: User,
    token: string
}


export interface UserLogin {
  user: User;
  token: string;
}


