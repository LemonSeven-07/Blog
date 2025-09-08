export interface AuthAction {
  Request: {
    username: string;
    password: string;
  };
  Response: {
    token: string;
    userId: number;
  };
}

export interface UpdateUser {
  Request: {
    userId: number;
    username: string;
    password: string;
    role: number;
    banned: boolean;
  };
}

export interface GetUsers {
  Request: {
    pageNum: number;
    pageSize: number;
    username: string;
    rangeDate: string;
  };
}
