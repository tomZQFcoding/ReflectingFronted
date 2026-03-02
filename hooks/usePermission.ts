import { useMemo } from 'react';
import { LoginUserVO } from '../services/userApi';
import { UserRole } from '../types';

/**
 * 权限钩子 - 基于当前用户角色进行权限判断
 */
export function usePermission(currentUser: LoginUserVO | null) {
  return useMemo(() => {
    const role = currentUser?.userRole?.toLowerCase();
    return {
      /** 是否为管理员 */
      isAdmin: role === UserRole.ADMIN,
      /** 是否为普通用户 */
      isUser: role === UserRole.USER || (role !== undefined && role !== UserRole.ADMIN),
      /** 检查是否拥有指定角色 */
      hasRole: (r: UserRole) => role === r,
      /** 当前用户角色 */
      role: (role as UserRole) ?? null,
    };
  }, [currentUser?.userRole]);
}
