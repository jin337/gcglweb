import store from '@/store'
import Layout from '@/views/layout/index'
import Vue from 'vue'

// 防抖
export function _debounce(fn, delay) {
  var delay = delay || 200
  var timer
  return function() {
    var th = this
    var args = arguments
    if (timer) {
      clearTimeout(timer)
    }
    timer = setTimeout(function() {
      timer = null
      fn.apply(th, args)
    }, delay)
  }
}
// 节流
export function _throttle(fn, interval) {
  var last
  var timer
  var interval = interval || 200
  return function() {
    var th = this
    var args = arguments
    var now = +new Date()
    if (last && now - last < interval) {
      clearTimeout(timer)
      timer = setTimeout(function() {
        last = now
        fn.apply(th, args)
      }, interval)
    } else {
      last = now
      fn.apply(th, args)
    }
  }
}
/** 毫秒转换
 * Parse the time to string
 * @param {(Object|string|number)} time
 * @param {string} cFormat
 * @returns {string}
 */
export function parseTime(time, cFormat) {
  if (arguments.length === 0) {
    return null
  }
  const format = cFormat || '{y}-{m}-{d} {h}:{i}:{s}'
  let date
  if (typeof time === 'undefined' || time === null || time === 'null') {
    return ''
  } else if (typeof time === 'object') {
    date = time
  } else {
    if (typeof time === 'string' && /^[0-9]+$/.test(time)) {
      time = parseInt(time)
    }
    if (typeof time === 'number' && time.toString().length === 10) {
      time = time * 1000
    }
    date = new Date(time)
  }
  const formatObj = {
    y: date.getFullYear(),
    m: date.getMonth() + 1,
    d: date.getDate(),
    h: date.getHours(),
    i: date.getMinutes(),
    s: date.getSeconds(),
    a: date.getDay()
  }
  // eslint-disable-next-line camelcase
  const time_str = format.replace(/{(y|m|d|h|i|s|a)+}/g, (result, key) => {
    let value = formatObj[key]
    // Note: getDay() returns 0 on Sunday
    if (key === 'a') {
      return ['日', '一', '二', '三', '四', '五', '六'][value]
    }
    if (result.length > 0 && value < 10) {
      value = '0' + value
    }
    return value || 0
  })
  // eslint-disable-next-line camelcase
  return time_str
}

export const downloadFile = (obj, name, suffix) => {
  const fileName =
    name + '-' + parseTime(new Date(), '{y}.{m}.{d} {h}:{i}:{s}') + '.' + suffix
  // for ie 10+
  if (window.navigator.msSaveBlob) {
    window.navigator.msSaveOrOpenBlob(new Blob([obj]), fileName)
    return
  }
  //google
  const url = window.URL.createObjectURL(new Blob([obj]))
  const link = document.createElement('a')
  link.style.display = 'none'
  link.href = url
  link.setAttribute('download', fileName)
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

export const filterAsyncRouter = routers => {
  // 遍历后台传来的路由字符串，转换为组件对象
  return routers.filter(router => {
    if (router.component) {
      if (router.component === 'Layout') {
        // Layout组件特殊处理
        router.component = Layout
      } else {
        const component = router.component
        router.component = loadView(component)
      }
    }
    if (router.children && router.children.length) {
      router.children = filterAsyncRouter(router.children)
    }
    return true
  })
}

export const loadView = view => {
  return resolve => require([`@/views/${view}.vue`], resolve)
}

export const findUrlParams = url => {
  const temp1 = url.split('?')
  const pram = temp1[1]
  const keyValue = pram.split('&')
  const obj = {}
  for (let i = 0; i < keyValue.length; i++) {
    var item = keyValue[i].split('=')
    var key = item[0]
    var value = item[1]
    obj[key] = value
  }
  return obj
}

export const checkPermission = value => {
  if (value && value instanceof Array && value.length > 0) {
    const buttons = store.getters && store.getters.buttons
    const permissionRoles = value

    const hasPermission = buttons.some(role => {
      return permissionRoles.includes(role)
    })

    if (!hasPermission) {
      return false
    }
    return true
  } else {
    console.error(`need buttons! Like -hasPermi="['admin','editor']"`)
    return false
  }
}

// 保留父级，保留子级
export const newArr = arr => {
  return arr.reduce(
    (pre, cur) =>
      Array.isArray(cur.children) && cur.children.length > 0
        ? pre.concat(cur, newArr(cur.children))
        : pre.concat(cur),
    []
  )
}
// 剔除父级，保留子级
export const newRouter = arr => {
  return arr.reduce(
    (pre, cur) =>
      Array.isArray(cur.children) && cur.children.length > 0
        ? pre.concat(newRouter(cur.children))
        : pre.concat(cur),
    []
  )
}

export const getDictData = async (_this, dict_label) => {
  return await _this.$pub.post('/sys/dict/list-slt', { dict_label })
}

// a链接下载，加入鉴权的token
export const downFileA = (url, fileName) => {
  const token = Vue.ls.get('userInfo') ? Vue.ls.get('userInfo').token : ''
  const xhr = new XMLHttpRequest() //定义http请求对象
  xhr.open('GET', url, true)
  xhr.setRequestHeader('token', token)
  xhr.send()
  xhr.responseType = 'blob' // 返回类型blob
  xhr.onload = function() {
    const blob = this.response
    const reader = new FileReader()
    reader.readAsDataURL(blob)
    reader.οnlοad = function(e) {
      // 转换完成，创建一个a标签用于下载
      const a = document.createElement('a')
      a.style.display = 'none'
      a.href = e.target.result
      a.download = parseTime(new Date()) + '-' + fileName //自定义下载文件名称
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
    }
  }
}
/**
 * 级联回显
 * @param {需要回显的idlists} key
 * @param {整颗数据树} treeData
 * @param {id属性名} fielKey
 */
export const cascader = (key, treeData, fielKey) => {
  let echoTreeArr = []
  let eachAry
  //回显分类value转为数组
  eachAry = JSON.parse(JSON.stringify(key))
  let itemAry = [] //分类树组件，每一项的value数组

  // 递归分类数据
  let recursionCategory = data => {
    let len = data.length
    for (let i = 0; i < len; i++) {
      //循环data参数，匹配回显的value
      itemAry.push(data[i][fielKey]) //构建分类树数组项,入栈
      for (let j = 0; j < eachAry.length; j++) {
        //遍历子节点分类value，拼凑成数组项value，并终止循环
        if (eachAry[j] == data[i][fielKey]) {
          //匹配到子节点value
          echoTreeArr.push(JSON.parse(JSON.stringify(itemAry))) //push进树分类数据
          eachAry.splice(j, 1) //删除以匹配到的value
          break
        }
      }

      if (eachAry.length <= 0) {
        //所有回显value匹配完成后，跳出循环
        break
      } else if (data[i].children && data[i].children.length > 0) {
        // 如果存在子分类，递归继续
        recursionCategory(data[i].children)
      }
      itemAry.pop() //出栈
    }
  }
  recursionCategory(treeData) //调用递归
  return echoTreeArr
}

/**
 * 判断是否是webp图片
 * @param {判断的图片详情} img
 */

export const isWebp = img => {
  if (!img.filePathThumb && !img.file_path_thumb) {
    return img.filePath ? img.filePath : img.file_path
  }
  const url = img.filePathThumb ? img.filePathThumb : img.file_path_thumb
  return url
  // let isWebP = url.substring(url.length - 4)

  // if ( isWebP === 'webp' ) {
  //   return img.filePath ? img.filePath : img.file_path
  // } else {
  //   return url
  // }
}

/**
  1000000.2 转化为1000,000.20
*/
export const formatNum = num => {
  // 一位或三位数字，后边是 有三位数组一组的(1个或多个), 然后匹配结束或者. ,?=,?:参与格式匹配，不参与结果匹配,$1为 (\d{1,3})的匹配结果

  num = Number(num).toFixed(2)
  return String(num).replace(/(\d{1,3})(?=(\d{3})+(?:$|\.))/g, '$1,')
}

// 保留两位四舍五入
export const keepTwoDecimalFull = num => {
  var result = parseFloat(num)
  if (isNaN(result)) {
    alert('数据格式错误，请检查！')
    return false
  }
  result = Math.round(num * 100) / 100
  var s_x = result.toString()
  var pos_decimal = s_x.indexOf('.')
  if (pos_decimal < 0) {
    pos_decimal = s_x.length
    s_x += '.'
  }
  while (s_x.length <= pos_decimal + 2) {
    s_x += '0'
  }
  return Number(s_x)
}

/**
 * @desc https和http兼容
 * @param {string} url 链接
 */
export const openLink = url => {
  const newUrl = url.replace('http', 'https')
  window.open(newUrl, '_blank')
}
