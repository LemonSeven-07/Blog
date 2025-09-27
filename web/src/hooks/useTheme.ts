import { useEffect } from 'react';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { setIsDark } from '@/store/modules/config';

export function useTheme() {
  const isDark = useAppSelector((state) => state.config.isDark);
  const dispatch = useAppDispatch();

  // 系统主题监听
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const applySystemTheme = (isDark: boolean) => {
      dispatch(setIsDark(isDark));
    };

    // 页面首次加载时同步系统主题（优先于 localStorage）
    applySystemTheme(mediaQuery.matches);

    // 监听系统主题变化
    const handler = (e: MediaQueryListEvent) => {
      applySystemTheme(e.matches);
    };

    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, [dispatch]);

  // 同步到 <html> data-theme
  useEffect(() => {
    const root = document.documentElement;
    if (isDark) {
      root.dataset.theme = 'dark';
    } else {
      root.dataset.theme = 'light';
    }

    dispatch(setIsDark(isDark));
  }, [isDark]);

  // 处理事件触发
  const toggleThemeByEvent = (e: React.MouseEvent<HTMLDivElement>) => {
    toggleTheme(e.clientX, e.clientY);
  };
  // 处理 DOM 节点调用
  const toggleThemeByNode = (node: HTMLDivElement | null) => {
    toggleTheme(node?.offsetLeft as number, node?.offsetTop as number);
  };

  // 切换主题的方法
  const toggleTheme = (x: number, y: number) => {
    const transition = document.startViewTransition(() => {
      dispatch(setIsDark(!isDark));
    });

    const tragetRadius = Math.hypot(
      Math.max(x, window.innerWidth - x),
      Math.max(y, window.innerHeight - y)
    );

    transition.ready.then(() => {
      document.documentElement.animate(
        {
          clipPath: [`circle(0% at ${x}px ${y}px)`, `circle(${tragetRadius}px at ${x}px ${y}px)`]
        },
        {
          duration: 1000,
          pseudoElement: '::view-transition-new(root)'
        }
      );
    });
  };

  return { isDark, toggleThemeByEvent, toggleThemeByNode };
}
