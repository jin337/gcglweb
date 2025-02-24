<template>
  <div id="map_container" v-loading="loading"></div>
</template>

<script>
import { loadJScript, calculateCenter } from '@/utils/map'
const mapvgl = require('mapvgl')

export default {
  name: 'static_search_map',
  data () {
    return {
      BMapGL: null,
      bdmap: null, // 地图实例
      mpvglview: null, // MapVGL图层管理器
      loading: false
    }
  },
  mounted () {
    this.init()
  },
  methods: {
    init () {
      loadJScript().then(BMapGL => {
        this.BMapGL = BMapGL
        this.bdmap = new BMapGL.Map('map_container', {
          restrictCenter: false
        }) // 创建Map实例
        const point = new BMapGL.Point(118.723, 32.058) // 创建点坐标
        this.bdmap.centerAndZoom(point, 18)
        this.bdmap.enableScrollWheelZoom() // 启用滚轮放大缩小
        this.bdmap.enableKeyboard()
        this.bdmap.enableInertialDragging()
        this.bdmap.enableContinuousZoom()
        this.bdmap.addControl(new BMapGL.ScaleControl())// 比例尺控件

        // 聚合点
        this.mpvglview = new mapvgl.View({ // 创建MapVGL图层管理器
          map: this.bdmap
        })
      })
    },
    drawMarks (arrs) {
      const data = []
      const bounds = []
      const _this = this
      arrs.forEach(f => {
        data.push({
          geometry: {
            type: 'Point',
            coordinates: [f.lngbd, f.latbd]
          },
          properties: {
            icon: [
              'images/point/point1.png', 'images/point/point2.png', 'images/point/point3.png',
              'images/point/point4.png', 'images/point/point5.png', 'images/point/point6.png',
              'images/point/point7.png', 'images/point/point8.png', 'images/point/point9.png',
              'images/point/point10.png', 'images/point/point11.png', 'images/point/point12.png',
              'images/point/point13.png', 'images/point/point14.png', 'images/point/point15.png',
              'images/point/point16.png', 'images/point/point17.png', 'images/point/point18.png',
              'images/point/point19.png', 'images/point/point20.png'
            ][f.areaId - 1],
            width: 24,
            height: 24,
            point: f
          }
        })
        bounds.push({ lng: f.lngbd, lat: f.latbd })
      })

      const clusterLayer = new mapvgl.ClusterLayer({ // 创建可视化图层，并添加到图层管理器中
        minSize: 30, // 聚合点显示的最小直径
        maxSize: 50, // 聚合点显示的最大直径
        clusterRadius: 350, // 聚合范围半径
        gradient: { 0: 'blue', 0.5: 'green', 1.0: 'red' }, // 聚合点颜色梯度
        maxZoom: 15, // 聚合的最大级别，当地图放大级别高于此值将不再聚合
        minZoom: 5, // 聚合的最小级别，当地图放大级别低于此值将不再聚合
        // 是否显示文字
        showText: true,
        // 开始聚合的最少点数，点数多于此值才会被聚合
        minPoints: 5,
        // 设置文字样式
        textOptions: {
          fontSize: 12,
          color: 'white',
          // 格式化数字显示
          format: function (count) {
            return count >= 10000 ? Math.round(count / 1000) + 'k'
              : count >= 1000 ? Math.round(count / 100) / 10 + 'k' : count
          }
        },
        // 设置非聚合的点的icon
        iconOptions: {
          icon: '../../assets/images/point.png',
          width: 30,
          height: 30
        },
        enablePicked: true, // 是否开启鼠标拾取，若想使用click等事件，需设置为true
        onClick (e) {
          if (e.dataItem && !e.dataItem.children) {
            // 可通过dataItem下面的children属性拿到被聚合的所有点
            _this.$emit('setInfoWindow', e.dataItem.properties.point)
          }
        }
      })
      this.mpvglview.addLayer(clusterLayer)
      clusterLayer.setData(data)// 关联图层与数据

      const center = calculateCenter(bounds, this.BMapGL.Point)
      console.log(center)
      if (center && center.lng) {
        this.bdmap.flyTo(center)
      }
    },
    destroyed () {
      this.bdmap.clearOverlays()
      this.bdmap.closeInfoWindow()
      this.bdmap.destroy()
      this.bdmap = null
    }
  }
}
</script>

<style lang="scss" scoped>
#allmap {
  width: 100%;
  height: 100%;

  .BMap_cpyCtrl {
    span {
      display: none !important;
    }
  }

  .anchorBL {
    // display: none!important;
  }
}
</style>
