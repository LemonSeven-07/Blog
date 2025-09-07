import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { cancelPendingRequests } from '../utils/http';

/**
 * @description: 取消上一个页面的接口请求
 */
export function useAutoCancelRequests() {
  const location = useLocation();

  useEffect(() => {
    return () => {
      cancelPendingRequests();
    };
  }, [location]);
}
