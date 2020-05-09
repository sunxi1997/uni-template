import { awaitUniApi } from "./index";

let $copy;

/**
 * 非h5 调用 api 复制
 */

// #ifndef  H5
$copy = async function copy(text) {
   return awaitUniApi(uni.setClipboardData, {data: text});
}

// #endif


/**
 * h5  使用document命令复制
 */

// #ifdef  H5

const Document = window ? window.document : undefined;

// 如果document不存在,无法复制
if(!Document)
   throw new Error('document is undefined!');

const getCopyElem = (() => {
   let copyElem = null;
   return () => copyElem || (copyElem = createCopyTextarea())
})();

function createCopyTextarea() {
   let textarea = Document.createElement('textarea');
   let style = textarea.style;
   // 确保元素存在于dom树上而又不被用户看到,且尽量不影响其他元素;
   style.position = 'fixed';
   style.left = '100%';
   style.top = '100%';
   style.opacity = '0';
   style.width = '1px'; // 若元素大小为0, 会无法选中导致复制失败
   style.height = '1px';
   style.border = 'none';
   style.padding = '0';
   style.margin = '0';
   style.overflow = 'hidden';
   Document.body.appendChild(textarea);
   return textarea;
}


/**
 * @function copy    -- 复制内容到粘贴板
 *
 * @param {String} text    -  要复制的文本内容
 * @return {Boolean}       -  复制结果
 */
$copy = async function copy(text) {
   let copyElem = getCopyElem();
   if(!copyElem)
      return false;

   copyElem.value = text;       // 改变输入框的值
   copyElem.select();           // 选中值
   let res =  Document.execCommand("Copy");   // 执行浏览器复制命令
   copyElem.blur();
   return res;
}
// #endif

export const copy = $copy;