import type { RouteItem } from '@/types/app/common';

export interface NavigationState {
  routes: RouteItem[];
  categoryRoutes: RouteItem[];
  headerRoutes: RouteItem[];
  adminRoutes: RouteItem[];
}
