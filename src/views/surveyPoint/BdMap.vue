<template>
  <div id="allmap" v-loading="loading"></div>
 </template>

<script>
import { loadJScript } from '@/utils/map'
export default {
  name: 'survey_point_map',
  data() {
    return {
      BMapGL: null,
      bdmap: null,
      markers: null,
      loading: false,
      activepoint: null,
      dragpoint: null// 点击地图移动marker
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

        // if (this.dragpoint) {
        //   this.dragpoint.setPosition(point)
        // }
      })
    },
    drawMarks(arrs, type) {
      arrs.forEach(item => {
        if (item.lngbd && item.latbd) {
          const point = new this.BMapGL.Point(item.lngbd, item.latbd)
          const icon = type === 'nohave' ? 'point' : 'position-picker'
          const url = require(`../../assets/images/${icon}.png`)
          const size = type === 'nohave' ? new this.BMapGL.Size(48, 48) : new this.BMapGL.Size(32, 32)
          const marker = new this.BMapGL.Marker(point, {
            icon: new this.BMapGL.Icon(url, size)
          })// 创建mark
          marker.setZIndex(100)
          marker.id = item.point_code
          // 添加鼠标事件
          marker.addEventListener('click', async (e) => {
            this.$emit('clickBDPoint', item)
            this.addOneMark(item)
          })
          this.bdmap.addOverlay(marker)
        }
      })
    },
    // 可拖拽
    addDefaultMark(item) {
      const point = new this.BMapGL.Point(item.lngbd, item.latbd)
      this.dragpoint = new this.BMapGL.Marker(point, {
        icon: new this.BMapGL.Icon(require('../../assets/images/position-picker.png'), new this.BMapGL.Size(32, 32)),
        enableDragging: true
      })// 创建mark
      this.dragpoint.id = item.point_code /
        // 覆盖物拖拽开始事件
        this.dragpoint.addEventListener('dragstart', () => {
        })
        // 覆盖物拖拽事件
      this.dragpoint.addEventListener('dragend', () => {
        const nowPoint = this.dragpoint.getPosition() // 拖拽完成之后坐标的位置
        this.$emit('changeAddPoint', nowPoint)
      })
      this.bdmap.addOverlay(this.dragpoint)
    },
    addOneMark(item) {
      const point = new this.BMapGL.Point(item.lngbd, item.latbd)
      if (this.activepoint) {
        this.activepoint.setPosition(point)
      } else {
        this.activepoint = new this.BMapGL.Marker(point, {
          icon: new this.BMapGL.Icon(
            require('../../assets/images/jj.png'), // 图片路径
            new this.BMapGL.Size(56, 56), // 可视区域
            {
              imageOffset: new this.BMapGL.Size(0, 2), // 图片相对视窗的偏移
              imageSize: new this.BMapGL.Size(56, 56) // 引用图片实际大小
            }
          )// 可视区域
        })// 创建mark
        this.activepoint.id = item.point_code
        this.activepoint.setZIndex(10)
        this.bdmap.addOverlay(this.activepoint)
      }
    },
    destroyed () {
      this.bdmap.clearOverlays()
      this.bdmap.destroy()
      this.bdmap = null
      this.dragpoint = null
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
