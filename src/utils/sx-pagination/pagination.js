export default  class Pagination {

  /**
   * @property page
   * @type Number
   * @desc 当前页码
   */
  page = 0;

  /**
   * @property total_page
   * @type Number
   * @desc 总页数
   */
  totalPage = 1;

  /**
   * @property tip
   * @type String
   * @desc 提示信息
   */
  tip = '';

  /**
   * @property hasMore
   * @type Boolean
   * @desc 是否还有下一页
   */
  hasMore = true;

  /**
   * @property list
   * @type Array
   * @desc 数据列表
   */
  list = [];

  /**
   * @property lastList
   * @type Array
   * @desc 最后一次请求获取到的数据列表
   */
  lastList = [];

  /**
   * @property error
   * @type Boolean
   * @desc 分页接口请求错误
   */
  error = false;

  /**
   * @property loading
   * @type Boolean
   * @desc 接口请求中
   */
  loading = false;

  /**
   * @property defaultParams
   * @type Object
   * @desc 每次请求分页接口时默认携带的参数
   */
  defaultParams = {};

  /**
   * @property api
   * @type Function | Null
   * @desc 分页请求的回调函数, 参数为默认参数和page组成的对象
   *  例 pagination 的 defaultParams 为 {order:'DESC'}
   *     实例 的 defaultParams 为 {perPage: 20}
   *     loadMore调用时的参数 为 {id: 3}
   *     实例当前 page 为 1
   *     则最终调用api时的参数为 {order:'DESC',perPage: 20,id: 3, page: 2}
   */
  api = null;

  format = null;

  /**
   * @constructor
   *
   * @param {Function} api
   *
   * @param {Object} [defaultParams]
   *
   * @param {Object} [options]  -   覆盖默认属性的options,非必填
   *
   */
  constructor(api, defaultParams, options) {

    this.api = api;

    if (defaultParams)
      this.defaultParams = defaultParams;

    options && options instanceof Object && Object.assign(this, options)
  }

  /**
   * @method loadMore
   *
   * @param {Object}   params     -  异步请求时发送的data
   * @param {Boolean}  reset      -  是否重置列表
   */
  async loadMore(params = {}, reset = false) {

    typeof params !== 'object' && (params = {});

    const {
      defaultParams: defaultParams1,
      loadingTip,
      errTip,
      hasMoreTip,
      noMoreTip
    } = Pagination.settings;

    let {
      page,
      loading,
      hasMore,
      api,
      defaultParams: defaultParams2
    } = this;

    if (!hasMore && !reset || loading)
      return this;

    page = reset ? 1 : page + 1;

    params = {
      page,
      ...defaultParams1,
      ...defaultParams2,
      ...params,
    };

    this.loading = true;
    this.tip = loadingTip;

    let err = null;

    try {
      let response = await api(params);

      // 加载成功
      let res = await Pagination.format(response, this, params);

      if(this.format && typeof this.format === 'function'){
        res = this.format(res);
        if(res instanceof Promise)
          await res;
      }

      if (typeof res !== 'object') {
        console.log(res);
        throw new Error(res + '不是合法 format 的返回值');
      }

      let {
        totalPage,
        list,
        page: currentPage = page
      } = res;

      totalPage = +totalPage;
      currentPage = +currentPage;

      if (isNaN(totalPage) || isNaN(currentPage) || !Array.isArray(list)) {
        throw new Error(res + '不是合法 format 的返回值');
      }

      hasMore = totalPage > currentPage;

      this.hasMore = hasMore;
      this.error = false;
      this.page = currentPage;
      this.totalPage = totalPage;
      this.lastList = list;
      this.list = reset ? list : this.list.concat(list);
      this.tip = hasMore ? hasMoreTip : noMoreTip;
    }
      // 加载失败
    catch (e) {
      err = e;
      this.error = true;
      this.tip = errTip;
    }
      // 加载完成
    finally {
      this.loading = false;
    }
    err && console.error({
      msg: 'pagination接口返回错误',
      err
    });
    return this;
  }

  /**
   * @method reset
   * @desc 重置分页器为初始状态
   */
  reset(){
    this.page = 0;
    this.totalPage = 1;
    this.tip = '';
    this.hasMore = true;
    this.list = [];
    this.lastList = [];
    this.error = false;
    this.loading = false;
  }


  /** @静态属性 **/

  static settings = {
    defaultParams: {},               // 每次请求默认携带的参数
    loadingTip: '努力加载中...',     // 加载中提示时的提示
    errTip: '加载失败!请重试!',      // 加载失败提示时的提示
    hasMoreTip: '加载更多',          // 加载完成且还有下一页时的提示
    noMoreTip: '没有更多了!'        // 加载完成且没有下一页时的提示
  };


  /** @静态方法 **/

  static setSetting = function (newSetting) {
    Object.assign(Pagination.settings, newSetting);
  };

  /**
   * @function
   * @param {*}           result  -  调用api成功时返回的数据
   * @param {Pagination}  pg      -  Pagination 实例
   * @param {Object}      params  -  调用api时的参数
   *
   * @return Promise  -   resolve 必须为指定类型的对象
   */
  static format = function (result, pg, params) {
    return new Promise((resolve, reject) => {
      console.log(result);
      reject('请先设置api回调处理')
    });
  };
}
