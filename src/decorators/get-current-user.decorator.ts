// import { createParamDecorator, ExecutionContext } from '@nestjs/common';
// import { User } from 'src/entities/auth.entity';
// import { getRepository } from 'typeorm';

// export const GetCurrentUser = createParamDecorator(
//   async (data: string | undefined, context: ExecutionContext) => {
//     const request = context.switchToHttp().getRequest();
//     const useAuth = await getRepository(User).findOne({
//       where: [{ id: request.user['sub'] }],
//     });
//     if (!data) return useAuth;
//     return useAuth[data];
//   },
// );
