/**
 * @param {string} path
 * @returns {Boolean}
 */
export function isExternal(path) {
  return /^(https?:|mailto:|tel:)/.test(path)
}

/**
 * @param {string} str
 * @returns {Boolean}
 */
export function validUsername(str) {
  const valid_map = ['admin', 'editor']
  return valid_map.indexOf(str.trim()) >= 0
}

/**
 * @param {string} url
 * @returns {Boolean}
 */
export function validURL(url) {
  const reg = /^(https?|ftp):\/\/([a-zA-Z0-9.-]+(:[a-zA-Z0-9.&%$-]+)*@)*((25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9][0-9]?)(\.(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9]?[0-9])){3}|([a-zA-Z0-9-]+\.)*[a-zA-Z0-9-]+\.(com|edu|gov|int|mil|net|org|biz|arpa|info|name|pro|aero|coop|museum|[a-zA-Z]{2}))(:[0-9]+)*(\/($|[a-zA-Z0-9.,?'\\+&%$#=~_-]+))*$/
  return reg.test(url)
}

/**
 * @param {string} str
 * @returns {Boolean}
 */
export function validLowerCase(str) {
  const reg = /^[a-z]+$/
  return reg.test(str)
}

/**
 * @param {string} str
 * @returns {Boolean}
 */
export function validUpperCase(str) {
  const reg = /^[A-Z]+$/
  return reg.test(str)
}

/**
 * @param {string} str
 * @returns {Boolean}
 */
export function validAlphabets(str) {
  const reg = /^[A-Za-z]+$/
  return reg.test(str)
}

/**
 * @param {string} email
 * @returns {Boolean}
 */
export function validEmail(email) {
  const reg = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
  return reg.test(email)
}

/**
 * @param {string} str
 * @returns {Boolean}
 */
export function isString(str) {
  if (typeof str === 'string' || str instanceof String) {
    return true
  }
  return false
}

/**
 * @param {Array} arg
 * @returns {Boolean}
 */
export function isArray(arg) {
  if (typeof Array.isArray === 'undefined') {
    return Object.prototype.toString.call(arg) === '[object Array]'
  }
  return Array.isArray(arg)
}

/**
 * 是否合法IP地址
 * @param rule
 * @param value
 * @param callback
 */
export function validateIP(rule, value, callback) {
  if (value === '' || value === undefined || value == null) {
    callback()
  } else {
    //const reg = /^(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])$/
    const reg = /^((\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.){3}(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])$/
    if (!reg.test(value) && value !== '') {
      callback(new Error('请输入正确的IP地址'))
    } else {
      callback()
    }
  }
}

/**
 * 大于0的正整数
 * @param rule
 * @param value
 * @param callback
 */
export const checkNumber = (rule, value, callback) => {
  var regexp = /^[1-9]\d*$/
  if (!regexp.test(value) && value !== '') {
    callback(new Error('请输入大于0的正整数'))
  } else {
    callback()
  }
}
/**
 *  大于0的数，含小数
 * @param rule
 * @param value
 * @param callback
 */
export const checkDianNumber = (rule, value, callback) => {
  // const reg = /^(\+?)\d+(\.\d+)?$/g
  const reg = /^[1-9]{1}[0-9]*$|^0{1}\.{1}[0-9]+$|^[1-9]{1}[0-9]*\.{1}[0-9]+$/g
  if (value === '') {
    callback(new Error('必须输入'))
  } else if (!reg.test(value)) {
    callback(new Error('请输入大于0的数'))
  } else {
    callback()
  }
}

/**
 *  大于0的数，含小数
 * @param rule
 * @param value
 * @param callback
 */
export const checkDianNumber2 = (rule, value, callback) => {
  if (!/^\d+[.]?\d{0,2}$/.test(value) && value) {
    callback(new Error('请输入正整数或小数保留两位小数'))
  } else {
    callback()
  }
}

/**
 * 大于等于0小于等于100的两位小数
 */
export const checkBaiFenBi = (rule, value, callback) => {
  if (!/^(?:0|[1-9][0-9]?|100)(\.[0-9]{0,2})?$/.test(value) && value) {
    callback(new Error('请输入大于等于0小于等于100数,支持两位小数'))
  } else {
    callback()
  }
}
