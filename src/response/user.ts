import { User } from "src/entities/user.entity";

export interface UserRegister {
    user: User,
    token: string
}


export interface UserLogin {
  user: User;
  token: string;
}


// export const User = async (datas: User[]): Promise<User[]> => {
//   const userCollection = await Promise.all(
//     datas.map(async (user: User): Promise<User> => {
//       const userResource = await UserAdminResource(user);
//       return userResource;
//     }),
//   );

//   return userCollection;
// };
