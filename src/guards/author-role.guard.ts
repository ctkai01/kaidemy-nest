import {
  CanActivate,
  ExecutionContext, Injectable
} from '@nestjs/common';
import { TEACHER } from 'src/constants';
import { UserRepository } from 'src/module/user/user.repository';

@Injectable()
export class InstructorRoleGuard implements CanActivate {
  constructor(private readonly userRepository: UserRepository) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
  
    if (request?.user) {
      const { sub } = request.user;

      const user = await this.userRepository.findOne({
        where: [{ id: sub }],
      });

      return user.role === TEACHER;
    }
    return false;
  }
}
