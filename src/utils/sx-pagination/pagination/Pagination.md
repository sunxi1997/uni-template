
# Pagination 移动端分页加载

分页器将分页功能内聚在实例中, 与 页面解耦, 使页面内不用声明额外的分页变量(page,limit,totalPage等), 只需专注用户行为即可

## 使用步骤

### 1 设置分页数据格式判断

一个项目中分页相关接口返回的字段一般都大致一样,以下为某接口返回示例
````
{
    code: 1,                // 表示响应成功
    current_page: 1,        // 返回的数据对应的页码
    limit: 15,              // 每页条数,有的叫perpage
    total_page: 4,          // 总页数, 有的接口返回的是总条目数
    list: [...],            // 分页数据
}
````

因为不同接口返回格式可能不一致,所以需要先给 Pagination 设置一个函数,用来将接口返回的数据格式,改成固定格式

以上面的接口为例, 固定格式回调函数的参数是后台响应内容, 回调函数需要返回
````
Pagination.format = function(response){
    return {
        totalPage: response.total_page,
        list: response.list
    }
}
````

### 2 实例化分页器
````
// 这是一个接口函数,会请求后台,返回分页数据
function getList(params){
   return new Promise((resolve,reject) => {
        $.ajax({
            ...,
            data: params,
            success(response){
                resolve(response)
            }
        })
    })
}

let pg = new Pagination(getList);
````

### 3 开始加载
````
pg.loadMore().then(() => {
    // 加载下一页,成功,此时 pg.list就是完整的分页数据列表,从第一页开始
    console.log(pg.list);
})
````

### 4 和vue结合使用

如果你用的是vue, 可以直接在template中渲染list
````
<template>
    <div>
        <!--分页数据-->
        <div v-for="(item,i) in pg.list" :key="i">
        {{item}}
        </div>
    </div>
</template>

<script>
  import {getList} from '@/api'
  import Pagination from '@/utils/pagination'

  export default {
    data() {
      return {
        pg: new Pagination(getList)
      }
    },
    mounted() {
        this.pg.loadMore();
    }
  }
</script>


````


## <h2 id='constructor'>构造器(constructor)</h2>

类的constructor, 即用 new 创建实例时传的参数

 构造器必须接收一个api参数,api为Promise形式的接口函数,且返回数据必须为服务器指定的分页格式
 
 若构造时传入额外配置参数,则传入一个配置对象,api函数放在 'api' 字段中,其他配置参数会与调用 loadMore 时的 data 参数合并在一起
 
 构造器本身有默认配置参数,会和额外参数(若有)合并为 config 存在示例中,
 
 ### 要传的参数说明
 
  参数 | 必填 | 类型 | 说明
   ---|---|---|---
 arguments[0]   | 是  | function   | 分页接口函数,返回值为promise
 arguments[1]   | 否  | object   | 分页器调用api时默认携带的参数, 如 {token: '2abc3ef'}
 arguments[2]   | 否  | object   | 分页器配置参数,会合并并覆盖到pagination实例中,可用来覆盖初始页码等, 如 {page: 3}
 
 
## 类静态属性

key | 类型   |  说明   | 额外说明
---|---|---|---
Pagination.Setting | pgSetting |  Pagination设置
Pagination.setSetting | function  | 更新Pagination设置
Pagination.format | pgSetting |  Pagination格式转换回调


#### <h4 id="settings">Pagination.Setting 默认配置</h4>
##### pgSetting
key | 类型 | 默认值 | 说明   | 额外说明
---|---|---|---|---
defaultParam | object | {}                  | 每次请求默认携带的参数
loadingTip   | string | '努力加载中...'      |  加载中提示时的提示
errTip       | string | '加载失败!请重试!'    |  加载失败提示时的提示
hasMoreTip   | string | '加载更多'           |  加载完成且还有下一页时的提示
noMoreTip    | string | '没有更多了!'        |  加载完成且没有下一页时的提示
 
#### Pagination.setSetting 更新默认设置

#### Pagination.format 分页格式转换回调函数

该回调函数用于识别接口返回的数据,并转换为分页器识别的格式

该回调函数接受一个参数,为接口返回的数据

该函数返回值必须为对象

key | 类型 | 说明
---|---|---
totalPage | number | 总页数
list | array | 分页接口返回的数据集合




## 实例属性(props)

建议不要直接修改实例的属性,也不要使用 v-model 绑定,可以使用 watch, computed,或者单向绑定,直接修改可能会导致意外的结果

  key | 默认值 | 类型 | 说明   | 额外说明
  ---|---|---|---|---
   page         | 0     | Number    | 当前页码
   totalPage    | 1     | Number    | 总页数                       |   调用一次 loadMore 后会更新
   tip          | ''    | String    | 提示信息(给用户看)            |   分页器不同状态有不同的值,详见 <a href="#tip">tip</a>
   hasMore      | true  | Boolean   | 是否还有未加载的分页          |   调用一次 loadMore 后会更新
   list         | []    | Array     | 包含所有分页加载后得到的数组
   lastList     | []    | Array     | 最近一次loadMore获取到的数据
   error        | false | Boolean   | 加载出错                     |   实际请求时,若服务器响应错误,error 会变为 true
   loading      | false | Boolean   | 是否正在请求中               |    调用 loadMore 时为 true, 服务器响应后变为 false
   defaultParams| <a href="#defaultParams">defaultParams</a>    | Object    | 额外参数                     |  每次请求会作为参数传入api
   api          | 无     | Function | <a href="#constructor">构造时参数中的 api</a>
   format       | 无     | Function | 格式转换, 接口返回数据后,会先调用Pagination.format, 再调用该实例的format
   

 #### <h4 id="defaultParams">defaultParams 默认参数</h4> 
  默认值 {};
  
  defaultParams有两个地方:
    一个是类的静态属性,Pagination.defaultParams
    一个是实例的属性,xx.defaultParams
在调用实例的loadMore时,两个defaultParams会被和并为1个对象,并加入 page:当前页面,然后作为参数传给api
  
#### <h4 id="tip">tip</h4> 

tip 的值只有5种, 初始的空值, 静止提示, 加载中提示,加载失败提示, 全部加载完成提示

 在<a href="#setting">setting</a>中可以设置各中状态的值
     
     
## 实例方法(methods)

### loadMore

 loadMore 是唯一的核心方法,调用一次 loadMore,会发实际的api请求,api响应后,会读取分页数据,更新自身实例属性
 
##### 参数

 参数名称 | 类型 | 默认值 | 说明
 ---|---|---|---  
  params | Object | {} | 会与 <a href="#defaultParams">defaultParams</a> 属性合并传递给实际请求的 api
  reset | Boolean | false | 若为true, 会重置分页数据,从第一页开始获取,否则会自动请求下一页并拼接入 list 属性中
 
##### 返回值

实例对象

### reset

将实例重置为初始状态