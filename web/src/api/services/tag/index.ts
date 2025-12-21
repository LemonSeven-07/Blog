import { http } from '@/api/http';

import type { GetTags } from './types';

export const getTags = () => http.get<GetTags['Response']>('/tag/list');
