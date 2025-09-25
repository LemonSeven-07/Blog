import { useEffect, useState, useRef } from 'react';

/**
 * 监听全局滚动，超过阈值隐藏 header
 * @param threshold 滚动多少像素开始隐藏 header，默认一屏高度
 * @returns hidden 是否隐藏 header
 */
export function useHeaderScroll(threshold: number = window.innerHeight) {
  const [hidden, setHidden] = useState(false);
  const ticking = useRef(false); // 防止重复排队
  const lastHidden = useRef(hidden); // 防止连续多次 setState

  useEffect(() => {
    const handleScroll = () => {
      if (!ticking.current) {
        window.requestAnimationFrame(() => {
          const shouldHide = window.scrollY > threshold;
          if (shouldHide !== lastHidden.current) {
            setHidden(shouldHide);
            lastHidden.current = shouldHide;
          }
          ticking.current = false;
        });
        ticking.current = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [threshold]);

  return hidden;
}
