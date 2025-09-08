export interface OutputArticle {
  Request: { ids: string };
  Config: { responseType: 'blob' };
  Response: Blob;
}
