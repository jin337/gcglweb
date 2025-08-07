<template>
  <div class="container">
    <div id="allmap" v-loading="loading"></div>

    <ul class="drawing-panel" v-if="tool && markers.length">
      <li class="bmap-btn" :class="{ 'isActive': currentDrawType === 'polygon' }" @click="toggleDrawing('polygon')"
        title="绘制多边形">
        <svg-icon icon-class="vector-square" />
      </li>
    </ul>

    <div class="action-buttons" v-if="shapes.length">
      <button class="action-btn" @click="clearAll"><svg-icon icon-class="trash-2" />清除所有</button>
    </div>
  </div>
</template>

<script>
import { loadJScript } from '@/utils/map'
export default {
  name: 'point_search_map',
  props: {
    tool: {
      type: Boolean,
      default: false
    },
    markers: {
      type: Array,
      default: () => []
    }
  },
  data () {
    return {
      BMapGL: null,
      bdmap: null,
      loading: false,

      currentDrawType: null,
      drawing: false,
      tempOverlay: null,
      points: [],
      shapes: [],
      selectedPoints: [],
      markerList: []
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
        const point = new BMapGL.Point(118.723, 32.058) // 创建点坐标
        this.bdmap.centerAndZoom(point, 12)
        this.bdmap.enableScrollWheelZoom() // 启用滚轮放大缩小
        this.bdmap.addControl(new BMapGL.ScaleControl())// 比例尺控件

        // 关闭3D建筑物显示
        if (this.tool) {
          this.bdmap.setDisplayOptions({
            building: false
          })
        }
      })
    },
    drawMarks (arrs, type) {
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
          this.markerList.push({
            ...item,
            marker: marker,
            lng: point.lng,
            lat: point.lat
          })
        }
      })
    },
    destroyed () {
      this.bdmap.clearOverlays()
      this.bdmap.destroy()
      this.bdmap = null

      this.clearAll()
    },

    toggleDrawing (type) {
      if (this.currentDrawType) {
        this.clearDrawing()
        this.currentDrawType = null
      } else {
        this.startDrawing(type)
      }
    },
    // 开始绘制
    startDrawing (type) {
      // 清除之前的绘制状态
      this.clearAll()
      // 设置当前绘制类型
      this.currentDrawType = type
      this.drawing = true

      // 添加地图事件监听
      this.bdmap.addEventListener('click', this.handlePolygonClick)
      this.bdmap.addEventListener('mousemove', this.handlePolygonMove)
      this.bdmap.addEventListener('dblclick', this.handlePolygonDblClick)
    },

    // 多边形绘制 - 点击处理
    handlePolygonClick (e) {
      if (!this.drawing || this.currentDrawType !== 'polygon') return

      // 添加点
      this.points.push(e.latlng)

      // 更新预览
      this.updatePolygonPreview()
    },

    // 多边形绘制 - 鼠标移动处理
    handlePolygonMove (e) {
      if (!this.drawing || this.currentDrawType !== 'polygon' || this.points.length === 0) return

      // 清除之前的临时覆盖物
      if (this.tempOverlay) {
        this.bdmap.removeOverlay(this.tempOverlay)
      }

      // 创建预览线
      const tempPoints = [...this.points, e.latlng]
      this.tempOverlay = new this.BMapGL.Polyline(tempPoints, {
        strokeColor: '#1890ff',
        strokeWeight: 2,
        strokeOpacity: 0.7,
        strokeStyle: 'solid'
      })

      this.bdmap.addOverlay(this.tempOverlay)
    },

    // 多边形绘制 - 双击处理
    handlePolygonDblClick (e) {
      if (!this.drawing || this.currentDrawType !== 'polygon' || this.points.length < 2) return

      // 完成多边形绘制
      this.createPolygon(this.points)
      this.clearDrawing()
    },

    // 创建多边形覆盖物
    createPolygon (points) {
      // 确保多边形是闭合的
      const polygonPoints = [...points]
      if (
        points.length > 1 &&
        (points[0].lng !== points[points.length - 1].lng || points[0].lat !== points[points.length - 1].lat)
      ) {
        polygonPoints.push(points[0])
      }

      const overlay = new this.BMapGL.Polygon(polygonPoints, {
        strokeColor: '#1890ff',
        fillColor: '#1890ff40',
        strokeWeight: 2,
        fillOpacity: 0.4,
        zIndex: 1000,
        enableEditing: true,
        enableClicking: true
      })

      this.bdmap.addOverlay(overlay)

      const newShape = {
        type: 'polygon',
        points: [...points],
        overlay: overlay
      }
      this.shapes.push(newShape)

      // 绘制完成后自动查找标记点
      this.$nextTick(() => {
        this.findPointsInShape()
      })

      // 监听多边形编辑事件，编辑完成后重新查找标记点
      overlay.addEventListener('lineupdate', () => {
        this.findPointsInShape()
      })

      return overlay
    },

    // 更新多边形预览
    updatePolygonPreview () {
      // 清除之前的临时覆盖物
      if (this.tempOverlay) {
        this.bdmap.removeOverlay(this.tempOverlay)
      }

      // 如果点数大于1，绘制预览多边形
      if (this.points.length > 1) {
        const polyline = new this.BMapGL.Polyline(this.points, {
          strokeColor: '#1890ff',
          strokeWeight: 2,
          strokeOpacity: 0.7
        })

        this.bdmap.addOverlay(polyline)
        this.tempOverlay = polyline
      }
    },

    // 清除当前绘制状态
    clearDrawing () {
      this.drawing = false
      this.points = []

      // 移除临时覆盖物
      if (this.tempOverlay) {
        this.bdmap.removeOverlay(this.tempOverlay)
        this.tempOverlay = null
      }

      // 移除事件监听
      this.bdmap.removeEventListener('click', this.handlePolygonClick)
      this.bdmap.removeEventListener('mousemove', this.handlePolygonMove)
      this.bdmap.removeEventListener('dblclick', this.handlePolygonDblClick)

      this.currentDrawType = null
    },

    // 清除所有图形
    clearAll () {
      // 清除所有图形覆盖物
      this.shapes.forEach((shape) => {
        this.bdmap.removeOverlay(shape.overlay)
      })

      // 重置数据
      this.shapes = []
      this.selectedPoints = []
      this.clearDrawing()

      this.$emit('drawPolygon', this.selectedPoints)
    },

    // 查找多边形内的标记点
    findPointsInShape () {
      if (this.shapes.length === 0) {
        // 如果没有多边形，清空选中的标记点
        this.selectedPoints = []
        return
      }

      // 获取多边形路径
      const polygon = this.shapes[0].overlay
      const polygonPath = polygon.getPath()

      // 清空之前的选择
      this.selectedPoints = []

      // 查找多边形内的标记点
      this.markerList.forEach((markerData) => {
        const marker = markerData.marker
        const point = marker.getPosition()

        // 判断点是否在多边形内
        if (this.isPointInPolygon(point, polygonPath)) {
          const { marker, ...rest } = markerData
          // 添加到选中点数组
          this.selectedPoints.push(rest)
        }
      })
      this.$emit('drawPolygon', this.selectedPoints)
    },
    // 判断点是否在多边形内
    isPointInPolygon (point, polygonPoints) {
      let isInPolygon = false
      const x = point.lng
      const y = point.lat

      for (let i = 0, j = polygonPoints.length - 1; i < polygonPoints.length; j = i++) {
        const xi = polygonPoints[i].lng
        const yi = polygonPoints[i].lat
        const xj = polygonPoints[j].lng
        const yj = polygonPoints[j].lat

        // eslint-disable-next-line no-mixed-operators
        const intersect = yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi
        if (intersect) isInPolygon = !isInPolygon
      }

      return isInPolygon
    }
  }
}
</script>

<style lang="scss" scoped>
.container {
  height: 100%;
  width: 100%;
  position: relative;

  .drawing-panel {
    z-index: 999;
    position: absolute;
    top: 15px;
    left: 15px;
    background: white;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    overflow: hidden;
    display: flex;
  }

  .bmap-btn {
    width: 48px;
    height: 48px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.3s;

    .svg-icon {
      font-size: 20px;
    }
  }

  .bmap-btn:hover {
    background-color: #f0f7ff;
  }

  .bmap-btn.isActive {
    border-radius: 8px;
    background-color: #e6f4ff;
    box-shadow: inset 0 0 0 2px #1890ff;
  }

  .action-buttons {
    position: absolute;
    top: 15px;
    right: 15px;
    display: flex;
    gap: 10px;
    z-index: 999;
  }

  .action-btn {
    background: white;
    border: none;
    padding: 8px 16px;
    border-radius: 4px;
    cursor: pointer;
    font-size: 14px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
    display: flex;
    align-items: center;
    gap: 6px;
    transition: all 0.3s;
  }

  .action-btn:hover {
    background: #f5f5f5;
    transform: translateY(-2px);
  }

  .action-btn .svg-icon {
    font-size: 14px;
  }
}

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
