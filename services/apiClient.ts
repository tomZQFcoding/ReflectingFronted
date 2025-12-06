/**
 * API客户端基础配置
 */

export interface BaseResponse<T> {
  code: number;
  data: T;
  message: string;
}

const API_BASE_URL = '/api';

/**
 * 创建请求配置
 */
function createRequestConfig(method: string, body?: any): RequestInit {
  const config: RequestInit = {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include', // 包含cookie，用于session认证
  };

  if (body) {
    config.body = JSON.stringify(body);
  }

  return config;
}

/**
 * 处理响应
 */
async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const error = await response.json().catch(() => ({
      message: `HTTP error! status: ${response.status}`,
    }));
    throw new Error(error.message || `请求失败: ${response.status}`);
  }

  const result: BaseResponse<T> = await response.json();
  
  // 检查业务错误码
  if (result.code !== 0) {
    throw new Error(result.message || '请求失败');
  }

  return result.data;
}

/**
 * GET请求
 */
export async function get<T>(url: string, params?: Record<string, any>): Promise<T> {
  let fullUrl = `${API_BASE_URL}${url}`;
  if (params) {
    const queryString = new URLSearchParams(params).toString();
    fullUrl += `?${queryString}`;
  }
  const response = await fetch(fullUrl, createRequestConfig('GET'));
  return handleResponse<T>(response);
}

/**
 * POST请求
 */
export async function post<T>(url: string, data?: any): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${url}`, createRequestConfig('POST', data));
  return handleResponse<T>(response);
}

/**
 * PUT请求
 */
export async function put<T>(url: string, data?: any): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${url}`, createRequestConfig('PUT', data));
  return handleResponse<T>(response);
}

/**
 * DELETE请求
 */
export async function del<T>(url: string, params?: Record<string, any>): Promise<T> {
  let fullUrl = `${API_BASE_URL}${url}`;
  if (params) {
    const queryString = new URLSearchParams(params).toString();
    fullUrl += `?${queryString}`;
  }
  const response = await fetch(fullUrl, createRequestConfig('DELETE'));
  return handleResponse<T>(response);
}

