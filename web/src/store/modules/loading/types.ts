export interface LoadingState {
  activeRequests: number; // 正在进行中的请求数量
  globalLoading: boolean; // 是否展示全局 loading
}
