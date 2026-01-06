import { useEffect } from 'react';

export const useResizeObserver = (ref: React.RefObject<HTMLElement>, callback: () => void) => {
  useEffect(() => {
    const observer = new ResizeObserver(callback);
    if (ref.current) {
      observer.observe(ref.current);
    }
    return () => observer.disconnect();
  }, [ref, callback]);
};
