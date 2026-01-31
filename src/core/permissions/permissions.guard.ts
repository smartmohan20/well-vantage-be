import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PermissionsService } from './permissions.service';
import { PERMISSIONS_KEY } from '../decorators/permissions.decorator';

import { PrismaService } from '../../shared/prisma/prisma.service';

@Injectable()
export class PermissionsGuard implements CanActivate {
    constructor(
        private reflector: Reflector,
        private permissionsService: PermissionsService,
        private prisma: PrismaService,
    ) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const requiredPermissions = this.reflector.getAllAndOverride<string[]>(PERMISSIONS_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);

        if (!requiredPermissions) {
            return true;
        }

        const request = context.switchToHttp().getRequest();
        const { user } = request;

        if (!user) {
            throw new ForbiddenException('Access denied: User not authenticated');
        }

        // Check if permissions are global
        const areAllGlobal = requiredPermissions.every((p) =>
            this.permissionsService.isGlobalPermission(p),
        );

        if (areAllGlobal) {
            return true;
        }

        // For non-global permissions, we need business context
        // Try to get businessId from params or body
        const businessId = request.params.businessId || request.params.id || request.body.businessId;

        if (!businessId) {
            throw new ForbiddenException('Access denied: Business context not found for membership check');
        }

        const membership = await this.prisma.membership.findUnique({
            where: {
                userId_businessId: {
                    userId: user.id || user.sub, // sub is used in JWT
                    businessId,
                },
            },
        });

        if (!membership) {
            throw new ForbiddenException('Access denied: No membership found for this business');
        }

        const hasPermission = requiredPermissions.every((permission) =>
            this.permissionsService.hasPermission(membership.role, permission),
        );

        if (!hasPermission) {
            throw new ForbiddenException('Access denied: Insufficient permissions');
        }

        return true;
    }
}
