import type { UploadFile } from 'antd';

export interface FormValues {
  title: string;
  summary: string;
  categoryId: number;
  tagIds: number[];
  content: string;
  image: UploadFile[];
}

export type RowData = FormValues & {
  id: number;
};
