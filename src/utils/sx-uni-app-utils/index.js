export function getClientRect(selector, component) {
  return new Promise((resolve, reject) => {
      let query = component ? uni.createSelectorQuery().in(component) : uni.createSelectorQuery();
      return query.select(selector).boundingClientRect(resolve).exec()
    }
  )
}

let _getPxByUpx, _getUpxByPx;

(() => {
  let width = 0;

  function __getPxByUpx(upx, int = false) {
    let px = width / 750 * upx;
    if(int) {
      px = parseInt(px);
      px += px % 2;
    }
    return px;
  }

  function __getUpxByPx(px, int = false) {
    let upx = 750 / (width / px);
    if(int) {
      upx = parseInt(upx);
      upx += upx % 2;
    }
    return upx;
  }

  function initWidth() {
    try {
      const res = uni.getSystemInfoSync();
      width = res.screenWidth;
      return true
    } catch(e) {
      return false;
    }
  }

  _getPxByUpx = (...props) => !width && !initWidth() ? 0 : __getPxByUpx(...props);

  _getUpxByPx = (...props) => !width && !initWidth() ? 0 : __getUpxByPx(...props)

})();

export const getPxByUpx = _getPxByUpx;
export const getUpxByPx = _getUpxByPx;

// 查看是否有某种服务商
export async function hasProvider(service, provider) {
  let {provider: providerList} = await awaitUniApi(uni.getProvider, {service});
  return providerList.includes(provider);
}

/**
 * 封装callback类型的api, 改为promise返回
 * @param {function} api
 * @param params - 调用时的参数
 * @return Promise
 */
export function awaitUniApi(api, params = {}) {
  if(!api || typeof api !== 'function')
    return Promise.reject(api + ' is not a function')
  return new Promise((resolve, reject) => {
    api({
      ...params,
      success(e) {
        params.success && params.success(e);
        resolve(e);
      },
      fail(e) {
        params.success && params.fail(e);
        reject(e);
      },
      complete(e) {
        params.complete && params.complete(e);
      }
    })
  });
}

/**
 * 接口缓存,返回新接口
 * @param {function}  api            - 原 api 函数
 * @param {string}    cacheKey       - 在本地缓存时缓存对应的 key
 * @param {number}    [cacheTime=0]  - 缓存有效时长 0 永久
 */
export function cacheApi(api, cacheKey, cacheTime = 0) {

  let caches = null;

  // 初始化历史缓存
  function cacheInit() {
    let result = uni.getStorageSync(cacheKey);
    caches = result && Array.isArray(result) && result || [];
    return caches
  }

  // 读缓存
  function getCache(jsonParams) {
    caches || cacheInit();

    // 读缓存
    let now = +new Date();
    for(let i = 0; i < caches.length; i++) {
      let cache = caches[i];

      // 缓存已失效
      if(cacheTime > 0 && (cache.time - now) > cacheTime)
        setTimeout(() => caches.splice(i, 1))

      // 请求内容一致,返回该缓存
      if(cache.params === jsonParams)
        return cache.data;
    }
  }

  // 写缓存
  function cacheAdd(jsonParams, response) {
    caches.push({
      // 缓存过期时间
      time: cacheTime === 0 ? 0 : + new Date() + cacheTime,
      // 请求内容
      params: jsonParams,
      // 响应内容
      data: response
    })
    uni.setStorage({
      key: cacheKey,
      data: caches
    })
  }

  // 封装后的带有缓存功能的 api
  return async function (...params) {

    let jsonParams;
    try {
      jsonParams = JSON.stringify(params);
    } catch(e) {
      return Promise.reject(e)
    }

    // 读缓存
    let cacheData = getCache(jsonParams);
    if(cacheData)
      return cacheData;

    // 没有可用缓存 重新执行请求
    return await api(...params).then(data => {
      // 写缓存
      cacheAdd(jsonParams, data);
      // 返回
      return data;
    })
  }
}

/**
 * 将接口 promise 包装
 * @param {Promise} request - 接口api
 * @param options
 * @param {boolean} [options.loading] - 是否需要 loading 加载
 * @param {boolean} [options.mask]    - loading 时是否显示遮罩层禁止用户操作
 *
 * @return Promise
 */
export async function apiAwait(request, options = {}) {

  // 封装loading
  if(options.loading) {
    uni.showNavigationBarLoading()
    uni.showLoading({title: '加载中', ...options})
  }

  return request.then(
    response => ({success: true, response}),
    response => ({error: true, response})
  ).catch(response => ({error: true, response})).finally(() => {
    if(options.loading) {
      uni.hideLoading()
      uni.hideNavigationBarLoading()
    }
  })
}

/**
 * 提示
 * @param {string | Object} toastOption
 */
export function showToast(toastOption) {
  return new Promise((resolve, reject) => {
    let option = {
      title: '',
      icon: 'none',
    };

    let complete;

    switch(typeof toastOption) {
      case "string":
        option.title = toastOption;
        break;
      case "object":
        option = {
          ...option,
          ...toastOption
        }
        complete = toastOption.complete
        break;
      default:
        console.error(toastOption + '类型错误')
        return reject();
    }
    uni.showToast({
      ...option,
      complete(res) {
        complete && complete(res);
        resolve(res);
      }
    })
  });
}

/**
 * 弹窗
 * @param {string | Object} modalOption
 */
export function showModal(modalOption) {
  return new Promise((resolve, reject) => {

    let option = {
      title: '温馨提示',
      content: '',
    };

    let complete;

    switch(typeof modalOption) {
      case "string":
        option.content = modalOption;
        break;
      case "object":
        option = {
          ...option,
          ...modalOption
        }
        complete = modalOption.complete
        break;
      default:
        console.error(modalOption + '类型错误')
        return reject();
    }
    uni.showModal({
      ...option,
      complete(res) {
        complete && complete(res);
        resolve(res);
      }
    })
  });
}
