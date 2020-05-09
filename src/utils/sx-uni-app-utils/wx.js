import {hasProvider, awaitUniApi} from "./index";


// 获取用户授权信息
export async function getWxUserInfo() {
  return await hasProvider('oauth', 'weixin') ?
    await awaitUniApi(uni.getUserInfo, {provider: 'weixin'}) :
    Promise.reject();
}

// 获取微信登录code
export async function getWxCode() {
  return await hasProvider('oauth', 'weixin') ?
    await awaitUniApi(uni.login, {provider: 'weixin'}) :
    Promise.reject();
}