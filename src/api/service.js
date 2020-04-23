
import Service from "@/utils/sx-service";

import { LOG_REQUEST, API_URL } from "@/setting";

const service = new Service({
  baseURL: API_URL
});

// 请求拦截器
service.interceptors.request.use(config => {

  // 是否打印请求信息
  if(LOG_REQUEST) {
    console.log(config);
    console.log(JSON.stringify(config.data));
  }

  return config;
})

// 响应拦截器
service.interceptors.response.use(
  onSuccess,
  onFail
);

// 响应成功, 取值,json转换
export async function onSuccess(response, options) {
  return response.data;
}

// 响应失败
export async function onFail(response, request) {
  return Promise.reject(response.data)
}

export default service;
export const request = service.request.bind(service)
export const post = service.post.bind(service)
export const get = service.get.bind(service)
