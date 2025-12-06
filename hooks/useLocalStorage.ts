import { useState, useEffect } from 'react';

/**
 * 自定义 Hook：使用 localStorage 存储状态
 * @param key localStorage 的 key
 * @param initialValue 初始值
 * @returns [value, setValue] 类似 useState
 */
export function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T | ((val: T) => T)) => void] {
  // 从 localStorage 读取初始值
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  // 返回一个包装的 setter 函数，同时更新 state 和 localStorage
  const setValue = (value: T | ((val: T) => T)) => {
    try {
      // 支持函数式更新
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error);
    }
  };

  return [storedValue, setValue];
}

