import { post, get } from './apiClient';

/**
 * 登录请求
 */
export interface UserLoginRequest {
  userAccount: string;
  userPassword: string;
}

/**
 * 注册请求
 */
export interface UserRegisterRequest {
  userAccount: string;
  userPassword: string;
  checkPassword: string;
}

/**
 * 登录用户信息
 */
export interface LoginUserVO {
  id: number;
  userName: string;
  userAvatar?: string;
  userProfile?: string;
  userRole: string;
  createTime: string;
  updateTime: string;
}

/**
 * 更新个人信息请求
 */
export interface UserUpdateMyRequest {
  userName?: string;
  userAvatar?: string;
  userProfile?: string;
}

/**
 * 用户API
 */
export const userApi = {
  /**
   * 用户登录
   */
  async login(request: UserLoginRequest): Promise<LoginUserVO> {
    return await post<LoginUserVO>('/user/login', request);
  },

  /**
   * 用户注册
   */
  async register(request: UserRegisterRequest): Promise<number> {
    return await post<number>('/user/register', request);
  },

  /**
   * 用户注销
   */
  async logout(): Promise<boolean> {
    return await post<boolean>('/user/logout', {});
  },

  /**
   * 获取当前登录用户
   */
  async getCurrentUser(): Promise<LoginUserVO> {
    return await get<LoginUserVO>('/user/get/login');
  },

  /**
   * 更新个人信息
   */
  async updateProfile(request: UserUpdateMyRequest): Promise<boolean> {
    return await post<boolean>('/user/update/my', request);
  },
};

