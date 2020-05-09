/**
 *
 * @version 1.0.1
 *
 * @author sunxi1997
 *
 * @desc 表单验证工具
 *
 * 孙玺修改与 2020-5-9
 *
 * https://github.com/sunxi1997/sx-formbuilder
 */

/**
 * @typedef  {Object}    Descriptor             -       验证规则描述对象
 * @property {*}         [defaultValue='']      -       初始值
 * @property {validator} [validator=null]       -       自定义验证函数,支持异步
 * @property {Boolean}   [required=false]       -       是否必填
 * @property {String}    [type=null]            -       类型验证
 */

/**
 * @typedef  {Object}    Message                -       验证错误时的提示信息
 * @property {String}    [validator='']         -       自定义验证规则未通过时错误信息
 * @property {String}    [type='']              -       类型验证未通过时错误信息
 * @property {String}    [required='']          -       必填验证未通过时错误信息
 */

/**
 * @callback  validator             -     值变化时的验证回调函数
 * @param {*} value                 -     变化后的值
 *
 * @return {Boolean,Promise}        -     支持异步验证,返回验证结果(布尔值)
 */


/**
 * @class FormControl   -  表单控件
 *
 * 表单控件,接受描述符,监听自身 value 变化,变化时进行验证并响应更改 valid 属性
 *
 * @property {*}          value      -   控件的值
 * @property {Boolean}    valid      -   验证结果
 * @property {Boolean}    valid      -   验证结果
 * @property {String}     errMsg     -   若验证未通过,此处为错误信息
 *
 * @property {validator}  __options  -   验证规则
 * @property {Message}    __message  -   错误提示
 */
export class FormControl {
  value = null;
  valid = false;
  errMsg = null;
  __value = null;
  __valid = false;
  __options = {
    defaultValue: null,
    required: false,
    type: null,
    validator: null
  };
  __message = {
    validator: '值验证不通过',
    type: '值类型不正确',
    required: '必填项不能为空'
  };

  /**
   * @constructor
   * @param {Descriptor}    [descriptor={}]        -       验证规则
   * @param {Message}       [message={}]           -       提示信息
   */
  constructor(descriptor = {}, message = {}) {
    Object.defineProperties(this, {
      value: {
        set: this.setValue,
        get: () => this.__value,
        enumerable: true,
      },
      valid: {
        get: () => this.getValid(),
        set: () => null
      }
    })
    this.setOption(descriptor, message);
  }

  reset(){
    this.setOption(this.__options)
  }

  /**
   * @method - setOption - 更新规则
   * @param {Descriptor}    [descriptor={}]        -       验证规则
   * @param {Message}       [message={}]           -       提示信息
   */
  setOption(descriptor = {}, message = {}) {
    let {
      validator,
      value = this.value,
      defaultValue = value
    } = descriptor;
    descriptor.defaultValue = defaultValue;

    // 替换 this 指向
    validator && typeof validator === 'function' &&
    (descriptor.validator = (...props) => validator.call(this, ...props));

    Object.assign(this.__options, descriptor);

    this.setMessage(message)
    if(typeof defaultValue === 'function')
      defaultValue = defaultValue();
    this.setValue(defaultValue)
  }

  setMessage(message){
    Object.assign(this.__message, message);
  }

  /**
   * 存值验证
   */
  setValue(value) {
    let $this = this;

    $this.__value = value;
    let res = this.__validate(value);

    res instanceof Promise ?
      res.then(ErrMsgHandler) :
      ErrMsgHandler(res);

    function ErrMsgHandler(errMsg) {
      if(errMsg === true) {
        $this.__valid = true;
        $this.errMsg = null;
      } else {
        $this.__valid = false;
        $this.errMsg = errMsg;
      }
      $this = res = ErrMsgHandler = null;
    }
  }

  getValid() {
    this.setValue(this.value)
    return this.__valid;
  }

  /**
   * 验证值是否通过验证
   */
  __validate(value) {
    let {__options, __message} = this;
    let {validator} = __options
    let {
      validator: validatorMsg,
      type: typeMsg,
      required: requiredMsg
    } = __message;

    let errMsg =
      !this.__validRequired(value) ? requiredMsg :
        !this.__validType(value) ? typeMsg : true;

    if(errMsg !== true)
      return errMsg;

    // 验证自定义验证规则
    if(validator && typeof validator === 'function') {
      let res = validator(value);
      if(res instanceof Promise)
        return new Promise((resolve, reject) => {
          res.then(valid => resolve(!valid ? validatorMsg : true), resolve(validatorMsg))
        })
      else
        return !res ? validatorMsg : true
    }

    return true;
  }

  /**
   * 验证值类型
   */
  __validType(value) {
    let type = this.__options.type;

    return !type || typeof value === type || (typeof type === 'function' && (value instanceof type || typeCheck(value, type)));

    function typeCheck(value, type) {
      let index = [String, Number, Symbol, Boolean].indexOf(type);
      let types = ['string', 'number', 'symbol', 'boolean'];
      return index !== -1 && typeof value === types[index];
    }
  }

  /**
   * 验证必填
   */
  __validRequired(value) {
    let required = this.__options.required;
    return !required || (!!value || [0, false].includes(value));
  }
}


/**
 * @class FormControl   -  表单控件
 *
 * 表单控件,接受验证规则, 调用 patchValue 时会验证值
 *
 * @property {*}          value      -   表单的值
 * @property {Boolean}    valid      -   表单验证结果
 */
export class FormBuilder {
  value = {};
  valid = false;
  hasError = false;
  errors = [];
  errMsg = null;

  controls = {};

  /**
   * @constructor
   *
   * @param {Object}      ruler                  -       表单规则
   * @param {Descriptor}  ruler[*]               -       所有 key 对应的值都应为 Descriptor 类型
   *
   * @param {Object}      messages               -       规则对应的提示信息
   * @param {Message}     messages[*]            -       所有 key 对应的值都应为 Descriptor 类型
   *
   */
  constructor(ruler, messages = {}) {
    this.controls = this.__getControls(ruler, messages);
    let set = () => null;
    Object.defineProperties(this, {
      value: {
        get: this.getValue, set
      },
      valid: {
        get: this.getValid, set
      },
      errors: {
        get: this.getErrors, set
      },
      errMsg: {
        get: () => this.errors[0] ? this.errors[0].errMsg : '',
        set
      },
      hasError: {
        get: () => this.errors.length > 0, set
      }
    })
    // this.updateForm();
  }

  reset() {
    Object.values(this.controls).forEach(control => control.reset())
  }

  getValue() {
    return Object.entries(this.controls).reduce((value, [name, control]) => (value[name] = control.value, value), {});
  }

  getValid() {
    return !Object.values(this.controls).some(item => !item.valid);
  }

  getErrors() {
    return Object.values(this.controls).reduce((errors, control) => (control.valid || errors.push(control), errors), []);
  }

  addControls(ruler, messages) {
    this.controls = {
      ...this.controls,
      ...this.__getControls(ruler, messages)
    }
  }

  /**
   * @method removeControl   -  移除表单控件
   *
   * @param {string} name    -  表单中的 key
   */
  removeControl(name) {
    if(this.controls[name]){
      this.controls[name] = null;
      delete this.controls[name];
    }

  }

  /**
   * @method - patchValue -  更新表单值
   *
   * @param {Object} data - 表单
   */
  patchValue(data) {
    Object.entries(data).forEach(([key, value]) => {
      let control = this.controls[key];
      control && control.setValue(value)
    });
  }

  /**
   * @param {Object}      ruler                  -       表单规则
   * @param {Descriptor}  ruler[*]               -       所有 key 对应的值都应为 Descriptor 类型
   *
   * @param {Object}      messages               -       规则对应的提示信息
   * @param {Message}     messages[*]            -       所有 key 对应的值都应为 Descriptor 类型
   */
  __getControls(ruler, messages = {}) {
    let controls = {};
    Object.entries(ruler).forEach(([key, option]) => {
      let message = messages[key];
      controls[key] = new FormControl(option, message);
    });

    return controls;
  }

}
