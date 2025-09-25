import { useEffect, useRef, useState } from 'react';

/**
 * 监听元素是否在视口内
 * @param options IntersectionObserver 配置项
 * @returns [ref, visible]
 */
export function useIntersectionObserver<T extends HTMLElement>(options?: IntersectionObserverInit) {
  const ref = useRef<T | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!ref.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => setVisible(entry.isIntersecting));
      },
      options ?? { threshold: [0] }
    );

    observer.observe(ref.current);

    return () => observer.disconnect();
  }, [options]);

  return [ref, visible] as const;
}
