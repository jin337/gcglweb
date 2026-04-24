<template>
  <div id="allmap" v-loading="loading"></div>
</template>

<script>
import { loadJScript } from '@/utils/map'
import gcoord from '@/utils/gcoord.js'
export default {
  name: 'add_point_bdmap',
  props: {
    firstLngLat: {
      type: Object || null,
      default: null
    }
  },
  data () {
    return {
      BMapGL: null,
      bdmap: null,
      markers: null,
      loading: false,
      dragpoint: null// 点击地图移动marker
    }
  },
  mounted () {
    this.init()
  },
  methods: {
    init () {
      loadJScript().then(BMapGL => {
        this.BMapGL = BMapGL
        this.bdmap = new BMapGL.Map('allmap') // 创建Map实例
        this.bdmap.enableScrollWheelZoom() // 启用滚轮放大缩小
        this.bdmap.addControl(new BMapGL.ScaleControl())// 比例尺控件
        // debugger
        console.log(this.firstLngLat)
        if (this.firstLngLat && Number(this.firstLngLat.lng)) { // 编辑
          const tempResult = gcoord.transform(
            [this.firstLngLat.lng, this.firstLngLat.lat], // 经纬度坐标
            gcoord.WGS84, // 当前坐标系
            gcoord.BD09 // 目标坐标系
          )
          const point = tempResult ? new BMapGL.Point(tempResult[0], tempResult[1]) : new BMapGL.Point(118.723, 32.058)
          this.bdmap.centerAndZoom(point, 18)
          this.addDefaultMark(point)
        } else { // 新增
          const geolocation = new BMapGL.Geolocation()
          this.loading = true
          geolocation.getCurrentPosition((result) => {
            this.loading = false
            const point = result ? new BMapGL.Point(result.longitude, result.latitude) : new BMapGL.Point(118.723, 32.058)
            this.bdmap.centerAndZoom(point, 18)
            this.addDefaultMark(point)
            if (result) { // result是百度坐标系
              const tempResult = gcoord.transform(
                [result.longitude, result.latitude], // 经纬度坐标
                gcoord.BD09, // 当前坐标系
                gcoord.WGS84 // 目标坐标系
              )
              this.$emit('changeLocation', tempResult)
              this.$emit('changeAddress', result.address.city + result.address.district + result.address.street)
            }
          })
        }
      })
    },
    // 可拖拽
    addDefaultMark (point) {
      this.dragpoint = new this.BMapGL.Marker(point, {
        icon: new this.BMapGL.Icon(require('../../../assets/images/position-picker.png'), new this.BMapGL.Size(32, 32)),
        enableDragging: true
      })// 创建mark
      // 覆盖物拖拽开始事件
      this.dragpoint.addEventListener('dragstart', () => {
      })
      // 覆盖物拖拽事件
      this.dragpoint.addEventListener('dragend', () => {
        const nowPoint = this.dragpoint.getPosition() // 拖拽完成之后坐标的位置
        const tempResult = gcoord.transform(
          [nowPoint.lng, nowPoint.lat], // 经纬度坐标
          gcoord.BD09, // 当前坐标系
          gcoord.WGS84 // 目标坐标系
        )
        this.$emit('changeLocation', tempResult)
        this.$emit('changeAddress', '')
      })
      this.bdmap.addOverlay(this.dragpoint)
    },
    localtionToCode (address) {
      this.loading = true
      const geocoder = new this.BMapGL.Geocoder()
      geocoder.getPoint(address, (point) => {
        this.loading = false
        this.bdmap.centerAndZoom(point, 18)
        this.$emit('changeLocation', [point.lng, point.lat])
        if (this.dragpoint) {
          this.dragpoint.setPosition(point)
        }
      })
    },
    codeToLocaltion (location) {
      if (this.dragpoint) {
        this.bdmap.centerAndZoom(location, 18)
        this.dragpoint.setPosition(location)
      }
    },
    destroyed () {
      if (this.bdmap) {
        this.bdmap.clearOverlays()
        this.bdmap.destroy()
        this.bdmap = null
      }
      this.dragpoint = null
    }
  },
  destroyed () {
    if (this.bdmap) {
      // this.bdmap.clearOverlays()
      // this.bdmap.destroy()
      this.bdmap = null
    }
    this.dragpoint = null
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
