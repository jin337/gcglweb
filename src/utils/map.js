/**
 * 动态加载高德地图
 *
 * @param {*} key 高德地图key
 * @param {*} plugins 高德地图插件
 * @param {string} [v='1.4.15'] 高德地图版本
 * @returns
 */
export const loadMap = (
  plugins,
  key = '66cb4a9bec24813021d7e593a843fac9',
  v = '2.0'
) => {
  const mp = new Promise((resolve, reject) => {
    const hasLoaded1 = document.getElementById('amap')
    if (hasLoaded1) {
      // 只加载一次
      resolve(window.AMap)
      return
    }
    const script = document.createElement('script')
    script.type = 'text/javascript'
    script.src = `https://webapi.amap.com/maps?v=${v}&key=${key}&plugin=${plugins}&callback=initAMap`
    script.id = 'amap'
    script.onerror = reject
    document.head.appendChild(script)
    window.initAMap = () => {
      resolve(window.AMap)
    }
  })
  const mpUI = mp.then(AMap => {
    return new Promise((resolve, reject) => {
      const hasLoaded2 = document.getElementById('amapUI')
      if (hasLoaded2) {
        // 只加载一次
        resolve({ AMap, AMapUI })
        return
      }
      const script2 = document.createElement('script')
      script2.type = 'text/javascript'
      script2.src = '//webapi.amap.com/ui/1.1/main.js'
      script2.id = 'amapUI'
      script2.onerror = reject
      script2.onload = function() {
        console.log(window)
        resolve({ AMap, AMapUI })
      }
      document.head.appendChild(script2)
    })
  })
  return mpUI
}

/**
 * 动态加载百度地图
 *
 * @param {*} ak 您的密钥
 * @param {string} [v='1.0'] 百度地图版本
 * @returns
 */
export const loadJScript = (
  ak = '5bcy34kgPHEH19yekVfl3WMsQwUaT2kn',
  v = '1.0'
) => {
  const mp = new Promise((resolve, reject) => {
    const hasLoaded1 = document.getElementById('baidumap')
    if (hasLoaded1) {
      // 只加载一次
      resolve(window.BMapGL)
      return
    }
    const script = document.createElement('script')
    script.type = 'text/javascript'
    script.src = `//api.map.baidu.com/api?type=webgl&v=${v}&ak=${ak}&callback=init`
    script.id = 'baidumap'
    script.onerror = reject
    document.head.appendChild(script)
    window.init = () => {
      resolve(window.BMapGL)
    }
  })
  return mp
}

// // 加载百度地图+加载海量点、点聚合
// export function loadBdMap() {
//   return new Promise((resolve, reject) => {
//     //聚合API依赖基础库,因此先加载基础库再加载聚合API
//     loadJScript()
//       .then(BMapGL => {
//         // 调用加载第三方组件js公共方法加载其他资源库
//         // 加载聚合API
//         // MarkerClusterer_min.js依赖TextIconOverlay.js。因此先加载TextIconOverlay.js
//         asyncLoadJs('//mapv.baidu.com/build/mapv.min.js')
//           .then(mapv => {
//             asyncLoadJs('https://unpkg.com/mapvgl/dist/mapvgl.min.js')
//               .then(mapvgl => {
//                 resolve({ BMapGL, mapv, mapvgl })
//                 return true
//               })
//               .catch(err => {
//                 reject(err)
//               })
//           })
//           .catch(err => {
//             reject(err)
//           })
//       })
//       .catch(err => {
//         reject(err)
//       })
//   })
// }

// // 加载第三方组件js公共方法
// export function asyncLoadJs(url) {
//   return new Promise((resolve, reject) => {
//     let script = document.createElement('script')
//     script.type = 'text/javascript'
//     script.src = url
//     document.head.appendChild(script)
//     script.onload = () => {
//       const res = url.search('mapvgl') > -1 ? 'mapvgl' : 'mapv'
//       resolve(window[res])
//     }
//     script.onerror = reject
//   })
// }

export function calculateCenter(lnglatarr, map) {
  var total = lnglatarr.length
  var X = 0,
    Y = 0,
    Z = 0
  lnglatarr.forEach((item, index) => {
    var lng = (item.lng * Math.PI) / 180
    var lat = (item.lat * Math.PI) / 180
    var x, y, z
    x = Math.cos(lat) * Math.cos(lng)
    y = Math.cos(lat) * Math.sin(lng)
    z = Math.sin(lat)
    X += x
    Y += y
    Z += z
  })
  X = X / total
  Y = Y / total
  Z = Z / total
  var Lng = Math.atan2(Y, X)
  var Hyp = Math.sqrt(X * X + Y * Y)
  var Lat = Math.atan2(Z, Hyp)
  // return new this.AMap.LngLat(Lng*180/Math.PI,Lat*180/Math.PI);
  return new map((Lng * 180) / Math.PI, (Lat * 180) / Math.PI)
}

function Rad(d) {
  return (d * Math.PI) / 180.0 //经纬度转换成三角函数中度分表形式。
}
//计算距离
export function getDistance(lng1, lat1, lng2, lat2) {
  var radLat1 = Rad(lat1)
  var radLat2 = Rad(lat2)
  var a = radLat1 - radLat2
  var b = Rad(lng1) - Rad(lng2)
  var s =
    2 *
    Math.asin(
      Math.sqrt(
        Math.pow(Math.sin(a / 2), 2) +
          Math.cos(radLat1) * Math.cos(radLat2) * Math.pow(Math.sin(b / 2), 2)
      )
    )
  s = s * 6378.137 // EARTH_RADIUS;
  if (s >= 1) {
    s = Math.round(s * 10000) / 10000 + '公里' //输出为公里
  } else {
    s = Math.round(s * 10000) + '米'
  }
  //s = Math.round(s * 10000) / 10000; //输出为公里
  //s=s.toFixed(4);
  return s
}
