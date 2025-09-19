import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { cancelRequest } from '.';

/**
 * @description: 取消上一个页面的接口请求
 */
export function useAutoCancelRequests() {
  const location = useLocation();
  useEffect(() => {
    return () => {
      console.log('取消请求');
      cancelRequest.cancelPendingRequests();
    };
  }, [location]);
}
