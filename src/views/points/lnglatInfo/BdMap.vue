<template>
  <div id="allmap"></div>
 </template>

<script>
import { loadJScript } from '@/utils/map'
import gcoord from '@/utils/gcoord.js'
export default {
  name: 'lnglat_map',
  props: {
    positions: {
      type: String
    }
  },
  data() {
    return {
      bdmap: null,
      marker: null
    }
  },
  computed: {
    showLngLat() {
      let pos = ''
      if (this.positions) {
        pos = this.positions
      }
      const gc = gcoord.transform(
        pos.split(','), // 经纬度坐标
        gcoord.WGS84, // 当前坐标系
        gcoord.BD09 // 目标坐标系
      )
      return gc
    }
  },
  mounted() {
    this.init()
  },
  methods: {
    init() {
      loadJScript().then(BMapGL => {
        this.bdmap = new BMapGL.Map('allmap') // 创建Map实例
        const point = new BMapGL.Point(this.showLngLat[0], this.showLngLat[1]) // 创建点坐标
        this.marker = new BMapGL.Marker(point, {
          icon: new BMapGL.Icon(require('../../../assets/images/position-picker.png'), new BMapGL.Size(32, 32))
        })// 创建mark
        this.bdmap.centerAndZoom(point, 18)
        this.bdmap.addOverlay(this.marker)
        this.bdmap.enableScrollWheelZoom() // 启用滚轮放大缩小
        this.bdmap.addControl(new BMapGL.ScaleControl())// 比例尺控件
      })
    },
    destroyed () {
      this.bdmap.destroy()
      this.bdmap = null
      this.marker = null
    }
  }
}
</script>

 <style lang="scss" scoped>
 #allmap{
   width:100%;
   height: 500px;
   .BMap_cpyCtrl{
    span{
      display: none!important;
    }
   }
   .anchorBL{
    // display: none!important;
   }
 }
 </style>
