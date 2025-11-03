import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { Observable } from 'rxjs';

@Injectable()
export class CheckIsAdminGuard implements CanActivate {
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    if (context.getType() !== 'http') {
      return true;
    }
    const request: Request = context.switchToHttp().getRequest();
    if (!('user' in request)) {
      throw new UnauthorizedException();
    }
    const payload = request['user'] as { realm_access: { roles: string[] } };
    const roles = payload?.realm_access?.roles || [];

    if (!roles.includes('admin-catalog')) {
      throw new ForbiddenException();
    }
    return true;
  }
}
