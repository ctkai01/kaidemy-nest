import {
    CanActivate,
    ExecutionContext, Injectable
} from '@nestjs/common';
import { ADMIN, SUPPER_ADMIN } from 'src/constants';
import { UserRepository } from 'src/module/user/user.repository';

@Injectable()
export class AdminRoleGuard implements CanActivate {
  constructor(private readonly userRepository: UserRepository) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
  
    if (request?.user) {
      const { sub } = request.user;

      const user = await this.userRepository.findOne({
        where: [{ id: sub }],
      });

      return user.role === ADMIN || user.role === SUPPER_ADMIN;
    }
    return false;
  }
}
