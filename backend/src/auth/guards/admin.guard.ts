import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';

const ADMIN_ROLE = 'Admin';

@Injectable()
export class AdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest();
    const user = req.user as { roles?: string[] } | undefined;
    const roles = user?.roles ?? [];
    if (!roles.includes(ADMIN_ROLE)) {
      throw new ForbiddenException('Admin role required');
    }
    return true;
  }
}
