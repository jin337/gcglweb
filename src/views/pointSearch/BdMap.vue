<template>
  <div id="allmap" v-loading="loading"></div>
 </template>

<script>
import { loadJScript } from '@/utils/map'
export default {
  name: 'point_search_map',
  data() {
    return {
      BMapGL: null,
      bdmap: null,
      markers: null,
      loading: false
    }
  },
  mounted() {
    this.init()
  },
  methods: {
    init() {
      loadJScript().then(BMapGL => {
        this.BMapGL = BMapGL
        this.bdmap = new BMapGL.Map('allmap') // 创建Map实例
        const point = new BMapGL.Point(118.723, 32.058) // 创建点坐标
        this.bdmap.centerAndZoom(point, 12)
        this.bdmap.enableScrollWheelZoom() // 启用滚轮放大缩小
        this.bdmap.addControl(new BMapGL.ScaleControl())// 比例尺控件
      })
    },
    drawMarks(arrs, type) {
      arrs.forEach(item => {
        if (item.lngbd && item.latbd) {
          const point = new this.BMapGL.Point(item.lngbd, item.latbd)
          const icon = (type === 1 ? 'selstatus' : 'status') + (item.status !== undefined ? item.status : '0')
          const url = require(`../../assets/images/${icon}.png`)
          const marker = new this.BMapGL.Marker(point, {
            icon: new this.BMapGL.Icon(url, new this.BMapGL.Size(40, 40))
          })// 创建mark
          // 添加鼠标事件
          marker.addEventListener('click', async (e) => {
            this.$emit('clickBDPoint', item)
          })
          this.bdmap.addOverlay(marker)
        }
      })
    },
    destroyed () {
      this.bdmap.clearOverlays()
      this.bdmap.destroy()
      this.bdmap = null
    }
  }
}
</script>

 <style lang="scss" scoped>
 #allmap{
   width:100%;
   height: 100%;
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
