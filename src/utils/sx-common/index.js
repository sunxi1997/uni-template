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
