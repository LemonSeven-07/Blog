import { useState, useCallback } from 'react';

/**
 * @description: 页面局部 loading
 */
export function useLocalLoading() {
  const [loading, setLoading] = useState(false);

  const withLoading = useCallback(<T>(promise: Promise<T>): Promise<T> => {
    setLoading(true);
    return promise
      .then((res) => {
        return res;
      })
      .catch((err) => {
        return Promise.reject(err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  return [loading, withLoading] as const;
}
