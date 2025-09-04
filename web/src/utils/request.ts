import axios from 'axios';
import type {
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
  AxiosError,
  InternalAxiosRequestConfig
} from 'axios';
import { message } from 'antd';

const httpExceptionCode: Record<number, string> = {
  400: '请求参数错误，请检查输入(400)',
  401: '用户未登录或登录状态失效，请重新登录(401)',
  403: '您没有权限访问该功能(403)',
  404: '请求的资源不存在(404)',
  405: '请求方法不被允许，请联系管理员(405)',
  408: '请求超时，请重试(408)',
  413: '上传内容过大，请检查文件大小或参数(413)',
  429: '操作过于频繁，请稍后再试(429)',
  500: '服务器开小差了，请稍后再试(500)',
  502: '网关异常，请稍后重试(502)',
  503: '服务暂时不可用，请稍后再试(503)',
  504: '请求超时，请稍后再试(504)',
  505: '请求协议不被支持，请联系管理员(505)'
};

/* 接口公共响应结构(对于特殊响应数据结构可自定义) */
interface CommonResponse<T> {
  code: string;
  message: string;
  data: T;
}
type HttpMethod = 'get' | 'post' | 'put' | 'delete' | 'patch';

// 响应数据自定义处理配置
interface CustomizeOpt {
  fullResponseData?: boolean; // 响应数据是否全量交给交互逻辑层，默认 false 非全量
  handleBusinessCode?: boolean; // 是否统一处理接口业务code状态码，默认 true 统一处理
  useBodyForDelete?: boolean; // delete 请求参数是放在query还是body里面，默认 false 放在query
}

// service 的定义：根据 fullResponseData 返回不同的类型
type service = <T, P = CommonResponse<T>, R = unknown, Full extends boolean = false>(
  url: string,
  params?: R,
  config?: AxiosRequestConfig,
  customize?: CustomizeOpt & { fullResponseData?: Full }
) => Promise<Full extends true ? AxiosResponse : P>;

const httpInstance: AxiosInstance = axios.create({
  baseURL: '/yolo',
  timeout: 1500
});

// 请求拦截器
httpInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig): InternalAxiosRequestConfig => {
    const token = localStorage.getItem('token');
    if (token) config.headers['Authorization'] = `Bearer ${token}`;
    return config;
  },
  (error: AxiosError): Promise<never> => {
    return Promise.reject(error);
  }
);

// 响应拦截器
httpInstance.interceptors.response.use(
  (response: AxiosResponse): AxiosResponse => {
    const token = response.headers['x-access-token'];
    if (token) localStorage.setItem('token', token);
    return response;
  },
  (error: AxiosError): Promise<never> => {
    const status = error.response?.status;
    if (status && httpExceptionCode[status]) {
      if (status === 401) {
        localStorage.removeItem('token');
        message.warning(httpExceptionCode[status]);
      } else {
        message.error(httpExceptionCode[status]);
      }
    } else {
      message.error('请求错误' + status ? `(${status})` : '');
    }
    return Promise.reject(error);
  }
);

function request<T, P = CommonResponse<T>, R = unknown, Full extends boolean = false>(
  method: HttpMethod,
  url: string,
  params?: R,
  config?: AxiosRequestConfig,
  customizeOpt?: CustomizeOpt & { fullResponseData?: Full }
): Promise<Full extends true ? AxiosResponse : P> {
  const {
    fullResponseData = false,
    handleBusinessCode = true,
    useBodyForDelete = false
  } = customizeOpt || {};

  const axiosConfig: AxiosRequestConfig = {
    url,
    method,
    ...config
  };

  if (method === 'get' || (method === 'delete' && !useBodyForDelete)) {
    axiosConfig.params = params;
  } else {
    axiosConfig.data = params;
  }
  return httpInstance.request<P>(axiosConfig).then(async (res) => {
    // 响应数据什么都不做处理全量返回给交互逻辑层
    if (fullResponseData) return res as Full extends true ? AxiosResponse : never;

    let data = res.data;
    // 判断交互逻辑层是否要处理异常业务code（默认需要）
    if (!handleBusinessCode) return data as Full extends true ? never : P;

    const contentType = res.headers['content-type'];
    // 判断响应数据是文件流二进制数据还是json数据
    if (config?.responseType === 'blob') {
      if (contentType.includes('application/json')) {
        const text = await (data as Blob).text();
        data = JSON.parse(text);
      } else {
        // 向交互逻辑层返回文件流二进制数据
        return data as Full extends true ? never : P;
      }
    }

    if ((data as P & { code?: string }).code === '200') {
      // 业务逻辑处理成功直接返回 data
      return data as Full extends true ? never : P;
    } else {
      // 统一处理异常业务code并提示，交互逻辑层无需提示
      message.error((data as P & { message?: string }).message || '请求异常');
      // 抛出业务错误。若交互逻辑层有业务抛错后的逻辑，在交互逻辑层用catch捕捉异常并写业务代码即可
      return Promise.reject(new Error((data as P & { message?: string }).message || '请求异常'));
    }
  });
}

/* 请求方法使用说明：
  * 范型参数
    T: 接口返回的业务数据结构，例如：获取用户信息 { id: number; name: string; age: number }
    P: 默认 CommonResponse<T> 结构， 以获取用户信息为例： {code: string, data: { id: number; name: string; age: number }, message: string }。接口完整响应结构，如果接口响应数据有特殊数据结构可自定义覆盖
    R: 默认 unknown。请求参数类型
    Full: 泛型布尔值，默认 false。控制返回类型，如果 true 返回 AxiosResponse，否则返回 P
  * 方法参数
    url: string类型，为接口请求地址
    params: R类型，为接口请求参数
    config: AxiosRequestConfigl类型，为 axios 请求配置，包含：url、method、baseURL、headers，params、data、timeout、responseType等等
    customize: CustomizeOpt & { fullResponseData?: Full } 类型，为自定义选项包括：fullResponseData: boolean(响应数据是否全量交给交互逻辑层，默认 false 非全量)、handleBusinessCode: boolean(是否统一处理接口业务code状态码，默认 true 统一处理)、useBodyForDelete: boolean(delete 请求参数是放在query还是body里面，默认 false 放在query) 
  * 方法返回类型结构
    Promise<P>: 如果 fullResponseData = false（默认），返回接口实际数据结构（默认 CommonResponse<T>）
    Promise<AxiosResponse>: 如果 fullResponseData = true, 返回完整的 Axios 响应对象，包括：data、status、headers、config、statusText
*/
const getMthod: service = (url, params, config, customize = {}) => {
  return request('get', url, params, config, customize);
};
const postMthod: service = (url, params, config, customize) => {
  return request('post', url, params, config, customize);
};
const putMthod: service = (url, params, config, customize) => {
  return request('put', url, params, config, customize);
};
const deleteMthod: service = (url, params, config, customize) => {
  return request('delete', url, params, config, customize);
};
const patchMthod: service = (url, params, config, customize) => {
  return request('patch', url, params, config, customize);
};

export const http = {
  get: getMthod,
  post: postMthod,
  put: putMthod,
  delete: deleteMthod,
  patch: patchMthod
};
