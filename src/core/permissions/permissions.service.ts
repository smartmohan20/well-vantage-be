import { Injectable, OnModuleInit } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

interface PermissionData {
    roles: {
        [key: string]: {
            permissions: string[];
        };
    };
    globalPermissions: string[];
}

@Injectable()
export class PermissionsService implements OnModuleInit {
    private permissionsData: PermissionData;

    onModuleInit() {
        this.loadPermissions();
    }

    private loadPermissions() {
        const filePath = path.join(process.cwd(), 'src/core/permissions/permissions.json');
        const fileContent = fs.readFileSync(filePath, 'utf-8');
        this.permissionsData = JSON.parse(fileContent);
    }

    hasPermission(role: string, permission: string): boolean {
        // First check if it's a global permission
        if (this.isGlobalPermission(permission)) {
            return true;
        }

        const roleData = this.permissionsData.roles[role];
        if (!roleData) return false;
        return roleData.permissions.includes(permission);
    }

    isGlobalPermission(permission: string): boolean {
        return this.permissionsData.globalPermissions.includes(permission);
    }

    getPermissionsForRole(role: string): string[] {
        const roleData = this.permissionsData.roles[role];
        return roleData ? roleData.permissions : [];
    }
}
