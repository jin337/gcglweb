// el-input格式化自定义指令
/**
 * @name inputFormatter
 * @msg: el-input格式化自定义指令
 * @param {Function} formatter 格式化函数
 * @param {Function} parser 解析函数
 * @param {Function} limit 输入限制函数
 * @param {Boolean} watchInput 是否监听input事件格式化显示
 * @param {Boolean} isNumber 是否为数字类型输入框（小数）
 * @returns 返回自定义指令生命周期函数
 */
const inputFormatter = ({
  formatter = e => e,
  parser = e => e,
  limit = e => e,
  watchInput = true,
  isNumber = false
}) => {
  return (el, binding, vnode) => {
    let watchVal = true
    // const input = $(el).find('.el-input__inner')[0]
    let input = null
    if (el.tagName.toLocaleUpperCase() !== 'INPUT') {
      input = el.getElementsByTagName('input')[0]
    }
    // 获取记录光标位置
    let selectionSite
    let getSelectionSite = event => {
      let oldVal = event.target.value || ''
      let selectionStart = event.target.selectionStart
      selectionSite = oldVal.length - selectionStart
    }
    // 点击、键盘事件更新光标位置
    el.addEventListener('click', getSelectionSite)
    el.addEventListener('keyup', getSelectionSite)
    //为input绑定值赋值
    const assignment = val => {
      vnode.componentInstance.$emit('input', parser(val))
    }
    // 更改显示的值
    const upShow = val => {
      vnode.context.$nextTick(() => {
        input.value = val
      })
    }
    // 监听绑定值变化
    vnode.componentInstance.$watch(
      'value',
      val => {
        if (watchVal) {
          upShow(formatter(val))
        }
      },
      { deep: true, immediate: true }
    )
    // 数字格式化
    let toNumber = val => {
      val = val
        .toString()
        .replace(/[^\d^\.^\-]+/g, '') // 第二步：把不是数字，不是小数点、-的过滤掉
        .replace(/^0+(\d)/, '$1') // 第三步：第一位0开头，0后面为数字，则过滤掉，取后面的数字
        .replace(/^\./, '0.') // 第四步：如果输入的第一位为小数点，则替换成 0. 实现自动补全
        .replace('.', '$#$')
        .replace(/\./g, '')
        .replace('$#$', '.') // 只保留第一个".", 清除多余的"."
      // .match(/^\d*(\.?\d{0,9})/g)[0] || ""; // 第五步：最终匹配得到结果 以数字开头，只有一个小数点，而且小数点后面只能有1到9位小数
      return val
    }
    // 处理最后一位非法字符
    const handlerIllegalStr = str => {
      while (!/^[0-9]+.?[0-9]*/.test(str.charAt(str.length - 1)) && str) {
        str = str.substr(0, str.length - 1)
      }
      return str || ''
    }
    // 监听input事件，可添加操作
    el.addEventListener('change', event => {
      let selectionStart = input.selectionStart
      let val = event.target.value

      if (binding.modifiers.number || isNumber) {
        val = toNumber(val)
      }
      let inp = limit(val)
      event.target.value = inp
      if (binding.modifiers.watchInput || watchInput) {
        assignment(inp)
        upShow(formatter(parser(val)))
      }
      setTimeout(() => {
        if (selectionSite && input.value.length != selectionStart) {
          input.selectionStart = input.selectionEnd =
            input.value.length - selectionSite
        }
      }, 0)
    })
    if (input) {
      input.addEventListener('blur', event => {
        watchVal = true
        let val = event.target.value
        if (binding.modifiers.number || isNumber) {
          val = handlerIllegalStr(val)
        }
        assignment(val)
      })
      input.addEventListener('focus', event => {
        watchVal = false
      })
    }
  }
}
export default Vue => {
  // 千分位指令
  Vue.directive('thousands', {
    inserted: inputFormatter({
      // 格式化函数
      formatter(num) {
        num = num.toString()
        let num1 = num.split('.')[0],
          num2 = num.split('.')[1]
        let c = num1.toString().replace(/(\d)(?=(?:\d{3})+$)/g, '$1,')
        return num.toString().indexOf('.') !== -1 ? c + '.' + num2 : c
      },
      // 解析函数
      parser(val) {
        val = val.toString().replace(/,/g, '')
        return val
      },
      isNumber: true
    })
  })
  // 百分比指令
  Vue.directive('percentage', {
    inserted: inputFormatter({
      // 格式化函数
      formatter(val) {
        val = val.toString()
        let m = 0
        try {
          m = val.split('.')[1].length
        } catch (e) {}
        return Number(val.replace('.', '') * 100) / Math.pow(10, m)
      },
      // 解析函数
      parser(val) {
        val = val.toString()
        let l1 = 0,
          m
        try {
          l1 = val.split('.')[1].length
        } catch (e) {}
        m = Math.pow(10, l1)
        return Number(val.replace('.', '')) / (100 * m)
      },
      watchInput: false,
      isNumber: true
    })
  })
  /**获取焦点 */
  Vue.directive('myfocus', {
    inserted(el) {
      debugger
      console.log(el)
      el.querySelector('input').focus()
    }
  })
}
