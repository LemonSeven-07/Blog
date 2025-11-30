import { http } from '@/api/http';

import type { GetTags } from './types';

export const getTags = (params: GetTags['Request']) =>
  http.get<GetTags['Response']>('/tag/list', params);
