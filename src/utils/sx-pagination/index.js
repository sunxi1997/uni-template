/**
 * 分页器包装
 */


import $Pagination from "./pagination";

$Pagination.setSetting({
  hasMoreTip: '上拉加载更多',
  defaultParams: {
    limit: 15
  }
});

// 先设置分页接口回调处理
$Pagination.format = async function (result) {
  let {
    data,
    last_page,
    current_page,
    per_page,
    total,
  } = result;

  // 返回供 pagination 插件识别的数据格式
  return {
    totalPage: last_page,
    list: data,
  }
};

export const Pagination = $Pagination;

export default Pagination;
