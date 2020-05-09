
/**
 * @version 1.0.0
 *
 * @author 孙玺
 *
 * @description 小程序中页面栈最多十层, 封装 navigateTo, 10个页面时使用 redirectTo 代替 navigateTo
 */

const $navigateTo = uni.navigateTo.bind(uni);
const $redirectTo = uni.redirectTo.bind(uni);

export function navigateTo(...params){


  let length = getCurrentPages().length;

  let api = length >= 10 ? $redirectTo : $navigateTo;

  console.log(
    api === $redirectTo ? 'redirectTo' : 'navigateTo'
    ,params[0].url);

  return api(...params);
}
