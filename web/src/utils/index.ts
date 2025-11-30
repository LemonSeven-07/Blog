/*
 * @Author: yolo
 * @Date: 2025-09-28 15:18:54
 * @LastEditors: yolo
 * @LastEditTime: 2025-11-28 01:09:44
 * @FilePath: /web/src/utils/index.ts
 * @Description: 封装公共工具类
 */
class Utils {
  /**
   * @description: 防抖
   * @param {T} func 需要被延迟执行的函数
   * @param {number} wait 延迟的时间（单位：毫秒）
   * @param {boolean} immediate 是否立即执行 true 在第一次触发时立即执行函数，而之后的触发延迟执行； false 只会在最后一次触发后执行
   * @return {*}
   */
  static debounce<T extends (...args: unknown[]) => void>(
    func: T,
    wait = 300,
    immediate = false
  ): (...args: Parameters<T>) => void {
    let timeout: ReturnType<typeof setTimeout> | null = null;

    return (...args: Parameters<T>) => {
      const later = () => {
        timeout = null;
        if (!immediate) func.apply(this, args);
      };

      const callNow = immediate && !timeout;
      if (timeout) clearTimeout(timeout);
      timeout = setTimeout(later, wait);

      if (callNow) func.apply(this, args);
    };
  }
}

export default Utils;
