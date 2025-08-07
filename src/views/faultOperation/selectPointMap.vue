<template>
  <div class="fault-select-point-map">
    <bd-map ref="bdMap" @clickBDPoint="clickBDPoint" :tool="true" :markers="near_points"
      @drawPolygon="drawPolygon"></bd-map>
    <el-drawer title="详情" :visible.sync="visible" size="627px" :append-to-body="true" custom-class="diago_clover_info">
      <el-descriptions title="" :column="2" border>
        <el-descriptions-item label="子系统名称">{{ clickPoint.child_name }}</el-descriptions-item>
        <el-descriptions-item label="点位编码">{{ clickPoint.point_code }}</el-descriptions-item>
        <el-descriptions-item label="点位名称">{{ clickPoint.point_name }}</el-descriptions-item>
        <el-descriptions-item label="状态说明">{{ clickPoint.status_name_t }}</el-descriptions-item>
      </el-descriptions>
      <el-table :data="clickPoint.deviceLists" :row-style="{ height: '30px' }" :cell-style="{ padding: '0' }"
        highlight-current-row border style="margin-top:10px;">
        <el-table-column label="物料名称" prop="deviceName" min-width="180px" show-overflow-tooltip></el-table-column>
        <el-table-column label="物料规格" prop="deviceModel" min-width="180px" show-overflow-tooltip></el-table-column>
        <el-table-column label="单位" align="center" prop="unit" width="50" />
        <el-table-column label="设计数量" align="center" prop="regNums" width="78" />
        <el-table-column label="安装数量" align="center" prop="finishNums" width="78"></el-table-column>
      </el-table>
    </el-drawer>
  </div>
</template>

<script>
import gcoord from '@/utils/gcoord.js'
import BdMap from '../pointSearch/BdMap.vue'
export default {
  name: 'faultSelectPointMap',
  props: {
    currentData: {
      type: Object,
      default: () => ({})
    },
    list: {
      type: Array,
      default: () => []
    }
  },
  data () {
    return {
      map: null,
      visible: false,
      near_points: [],
      clickPoint: {}
    }
  },
  components: {
    BdMap
  },
  watch: {
    list: {
      handler (value) {
        this.BDopenMap(value[0] || {})
      },
      immediate: true
    }
  },
  methods: {
    async clickBDPoint (point) {
      const map = this.$refs.bdMap
      map.loading = true
      const params = {
        project_code: this.currentData.project_code,
        point_code: point.point_code
      }
      const { code, message, data } = await this.$pub.post('/device/build-reg-info-noStage', params)
      map.loading = false
      let deviceLists = []
      if (code !== 200) {
        this.$notify.error({
          title: '物料规格列表查询失败',
          message: message
        })
      } else {
        deviceLists = data.device_list || []
      }
      this.clickPoint = { ...point, deviceLists }
      this.visible = true
    },
    // 百度地图start
    async BDopenMap (pointInfo) {
      const map = this.$refs.bdMap
      if (map && pointInfo?.id) {
        map.loading = true
        map.bdmap.clearOverlays()
        // 1.获取附件300米以内的点，生成icon在地图上
        const lng = pointInfo.lng || ''
        const lat = pointInfo.lat || ''
        const params = {
          project_code: pointInfo.project_code,
          lng,
          lat,
          distance: 1000,
          point_code: pointInfo.point_code
        }
        const { data } = await this.$pub.post('/point/near', params)
        map.loading = false
        // 查找当前点的建设状态status_t status_name_t
        const current = data.find(f => f.point_code === pointInfo.point_code)
        const result = gcoord.transform([lng, lat], // 经纬度坐标
          gcoord.WGS84, // 当前坐标系
          gcoord.BD09 // 目标坐标系
        )
        const obj = {
          ...pointInfo,
          lngbd: result[0],
          latbd: result[1],
          status_t: current.status,
          status_name_t: current.status_name,
          status: current.status,
          status_name: current.status_name
        }
        this.near_points = data.filter(f => f.point_code !== pointInfo.point_code).map(m => {
          const itemresult = gcoord.transform([m.lng, m.lat], // 经纬度坐标
            gcoord.WGS84, // 当前坐标系
            gcoord.BD09 // 目标坐标系
          )
          return { ...m, lngbd: itemresult[0], latbd: itemresult[1], status_name_t: m.status_name, status_t: m.status }
        })
        map.drawMarks(this.near_points, 2)

        // 2.勘测未知生成icon在地图上
        map.drawMarks([obj], 1)
        map.bdmap.flyTo(new map.BMapGL.Point(obj.lngbd, obj.latbd), 18)
      }
    },
    drawPolygon (markers) {
      this.$emit('drawPolygon', markers)
    }
  },
  destroyed () {
    const map = this.$refs.bdMap
    if (map && map.bdmap) {
      this.map.bdmap.clearOverlays()
    }
  }
}
</script>

<style lang='scss' scoped>
.fault-select-point-map {
  width: 100%;
  height: 100%;
}
</style>
