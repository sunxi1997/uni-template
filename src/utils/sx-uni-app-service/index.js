/**
 * @name uni-app 请求服务
 * @version 1.0.0
 * @author sunxi1997
 * @description 请求封装,加入拦截器功能
 */


export default class Service {

  _options = {
    baseURL: '',
    timeout: 0,
    header: {}
  };


  // 拦截器
  interceptors = {
    // 请求拦截器
    request: {
      interceptors: [],
      use(fun) {
        this.interceptors.push(fun)
      },
      async intercept(options) {
        for (let interceptor of this.interceptors)
          options = await interceptor(options);
        return options
      }
    },
    // 响应拦截器
    response: {
      interceptors: {
        success: [],
        fail: [],
      },
      use(success, fail) {
        success && this.interceptors.success.push(success);
        fail && this.interceptors.fail.push(fail);
      },
      async intercept(STATUS, response, options) {
        for (let interceptor of this.interceptors[STATUS]){
          response = await interceptor(response, options);
        }
        return response
      },
    }
  }

  constructor(props = {}) {
    Object.assign(this._options, props)
  }

  // get 请求
  get(url, params) {
    return this.request('GET', url, {data: params})
  }

  // post 请求
  post(url, data) {
    return this.request('POST', url, {data})
  }

  // 发起请求
  async request(method, _url = '', options) {

    const {
      _options,
      interceptors
    } = this;

    // 请求拦截器
    options = await interceptors.request.intercept(options) || {};

    let {
      baseURL,
      timeout,
      header: _header
    } = _options;

    let {
      url = _url,
      header = {},
      ...config
    } = options;

    // 实际请求地址
    if (url.indexOf('http') !== 0)
      url = baseURL + url;

    // 实际请求头
    header = Object.assign(header, _header);

    // 实际请求参数
    config = {
      url,
      method,
      header,
      ...config,
    };

    // 发送请求
    try {
      // 响应成功
      let response = await (new Promise((success, fail) => {
        let abortTimer = null; // 超时取消计时器
        let xhr = uni.request({
          ...config,
          success,
          fail,
          complete(res){
            abortTimer && clearTimeout(abortTimer);
            config.complete && config.complete(res)
          }
        });

        // 超时操作
        if (timeout) {
          abortTimer = setTimeout(() => xhr.abort(), timeout)
        }
      }));
      return await interceptors.response.intercept('success', response, config)
    } catch (err) {
      // 响应失败
      return Promise.reject(await interceptors.response.intercept('fail', err, config));
    }
  }
}
