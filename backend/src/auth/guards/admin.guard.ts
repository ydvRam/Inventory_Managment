import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';

@Injectable()
export class AdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest();
    const user = req.user as { roles?: string[] } | undefined;
    const roles = user?.roles ?? [];
    const isAdmin = roles.some((r) => String(r).toLowerCase() === 'admin');
    if (!isAdmin) {
      throw new ForbiddenException('Admin role required');
    }
    return true;
  }
}
