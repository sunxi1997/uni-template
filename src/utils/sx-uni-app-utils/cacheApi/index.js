/**
 * 函数记忆
 *
 * 将异步函数调用参数,及返回结果记忆,并存在storage中
 *
 * 可以设置过期时间,过期后在下次读storage时会自动删除
 */


/**
 * @type cacheApiList
 */
const cacheApiList = {};

const jsonError = Symbol('json error')

// 创建一个可缓存的接口函数
/**
 * @function 函数记忆,将原函数包装,记录调用参数及返回值,下次调用若命中缓存则不调用原函数直接返回缓存
 *
 * @param {function} api              - 原函数
 * @param {string} cacheKey           - 存在storage中的key
 * @param {number} [cacheTime=0]      - 缓存时间(毫秒数), 0代表永久
 */
export function createCacheApi(api, cacheKey, cacheTime = 0) {

  if(! isFun(api))
    throw new Error('api 必须为函数')

  if(! isString(cacheKey))
    throw new Error('cacheKey 必须为字符串')


  /**
   * @const cacheApi
   * @type {cacheApi}
   */
  const cacheApi =  {
    loaded: false,
    caches: null,
    api,
    cacheKey,
    cacheTime
  };

  cacheApiList[cacheKey] = cacheApi;

  return async function (...args) {
    let result = getCache(cacheApi, args);

    // 有可用缓存,直接返回
    if(result)
      return result;

    // 无可用缓存, 调用原函数, 并记忆
    result = await api.apply(this,args);

    setCache(cacheApi, args, result)

    return result;
  }

}

// 清空缓存
export function clearCache(cacheKey) {
  let cacheApi = cacheApiList[cacheKey];
  if(cacheApi){
    cacheApi.caches = {};
    syncCacheApi(cacheApi);
  }
}


/**
 * 初始化接口函数
 * @param {cacheApi} cacheApi - 函数记忆实例
 */
function initCaches(cacheApi) {
  if(cacheApi.loaded)
    return;

  let {cacheKey} = cacheApi;

  let caches = getCachesFromStorage(cacheKey);

  cacheApi.caches = caches || {};
  cacheApi.loaded = true;
}

/**
 * 存入一次缓存
 * @param {cacheApi} cacheApi - 函数记忆实例
 * @param {Array} args        - 调用时的参数集合
 * @param data                - 函数返回值
 */
function setCache(cacheApi, args, data) {
  cacheApi.loaded || initCaches(cacheApi);

  // 转json
  let jsonArgs = toJson(args);
  let jsonData = toJson(data);
  if(jsonArgs === jsonError || jsonData === jsonError){
    console.warn('存入缓存失败, 数据不是有效json格式', args, data)
    return false;
  }

  // 存入, args的json字符串作为键,存入缓存
  let {cacheTime} = cacheApi
  cacheApi.caches[jsonArgs] = {
    time: cacheTime === 0 ? 0 : + new Date() + cacheTime,
    data
  }

  // 同步storage
  syncCacheApi(cacheApi)
}

/**
 * 尝试读取缓存
 * @param {cacheApi} cacheApi - 函数记忆实例
 * @param {Array} args        - 调用时的参数集合
 */
function getCache(cacheApi, args) {

  cacheApi.loaded || initCaches(cacheApi);

  // 转json
  let jsonArgs = toJson(args);
  if(jsonArgs === jsonError)
    return console.warn('读缓存失败, 请求数据不是有效json格式', jsonArgs);

  let {caches, cacheTime} = cacheApi

  let cache = caches[jsonArgs];

  // 未找到可用缓存
  if(!cache)
    return;

  let {time, data} = cache;

  // 缓存永久可用
  if(cacheTime === 0 && time === 0)
    return data;

  let now = + new Date();

  // 缓存已过期,删除
  if(now > time){
    delete caches[cache];
    syncCacheApi(cacheApi)
  }
  // 未过期,返回
  else
    return data;
}

/**
 * 同步缓存至storage
 * @param {cacheApi} cacheApi - 函数记忆实例
 */
function syncCacheApi(cacheApi) {
  let {cacheKey, caches} = cacheApi;
  setCachesToStorage(cacheKey, caches)
}



/**
 * 工具函数
 */
function toJson(data) {
  try {
    data = JSON.stringify(data);
    return data;
  }catch (e) {
    return jsonError;
  }
}
function isFun(fun) {
  return typeof fun === "function"
}
function isString(str) {
  return typeof str === "string"
}

function setCachesToStorage(key, data) {
  uni.setStorage({
    key,
    data
  })
}

function getCachesFromStorage(key) {
  let result = uni.getStorageSync(key);
  if(typeof result === 'object' && !Array.isArray(result)){
    Object.keys(result).forEach(key => {
      let val = result[key];
      if(typeof val !== 'object' || typeof val.time !== 'number')
        delete result[key]
    })
    return result;
  }
  return null;
}