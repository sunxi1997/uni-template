// 函数记忆的实例对象
declare interface cacheApi {
    // 是否已初始化
    loaded: boolean;
    // 所有缓存记录
    caches: null | caches;
    // 原函数
    api():any;
    // 存在storage中的key
    cacheKey: string
    // 缓存有效时长
    cacheTime: 0 | number
}

// 缓存实例
declare interface cache {
    // 缓存过期时间, 0表示永久
    time: number;
    // 缓存的值
    data: any
}


// 函数记忆列表
declare interface caches {
    (cacheKey): cache
}


// 函数记忆实例列表
declare interface cacheApiList {
    (): cacheApi
}



declare interface Test {
    (number) : string
}