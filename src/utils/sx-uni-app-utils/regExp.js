
// 价格正则, 2位小数,不可为0
export const priceReg = /(^[1-9][0-9]{0,7}$)|(^((0\.0[1-9]$)|(^0\.[1-9]\d?)$)|(^[1-9][0-9]{0,7}\.\d{1,2})$)/

// 正整数正则
export const integerReg = /^\+?[1-9][0-9]*$/;

// 手机号码
export const phoneReg = /^1\d{10}$/

// 固话
export const telReg = /^0\d{2,3}-\d{7,8}$/;