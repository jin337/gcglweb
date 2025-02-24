<template>
  <div class="point_search">
    <el-form size="small"  :inline="true">
      <el-form-item label="项目" >
        <el-select
          v-model="form.project_code"
          placeholder="请选择"
          @change="handleProjectChange"
          filterable
          >
          <!-- <template v-if="AMap"> -->
            <el-option v-for="item in projectList" :key="item.projectCode" :label="item.projectName" :value="item.projectCode" ></el-option>
          <!-- </template>
          <li v-else>加载中</li> -->
        </el-select>
      </el-form-item>
      <el-form-item label="点位编码">
        <el-select
          v-model="form.point"
          placeholder="请选择"
          @change="handlePointCodeChange"
          :disabled="!form.project_code"
          value-key="point_code"
          filterable
          remote
          :remote-method="remoteMethod"
          :loading="pointLoading"
        >
          <el-option v-for="item in pointList" :key="item.point_code"  :value="item" :label="item.point_name">
            <span style="float: left">{{ item.point_name }}</span>
            <span style="float: right; color: #8492a6; font-size: 13px">{{ item.point_code }}</span>
          </el-option>
        </el-select>
      </el-form-item>
    </el-form>
    <!-- 地图 -->
    <div class="mapwrap" v-loading="mapLoading">
      <!-- <gd-map
        ref="gdMap"
        @haveAmap="haveAmap"
        @mapMovestart="mapMovestart"
        @getNearPoint="getNearPoint"
      ></gd-map> -->
      <bd-map
        ref="bdMap"
        @clickBDPoint="clickBDPoint"
        ></bd-map>
      <el-drawer
        title="详情"
        :visible.sync="visible"
        size="627px"
        :append-to-body="true"
        custom-class="diago_clover"
      >
        <el-descriptions v-if="point_info" title="" :column="2" border>
          <el-descriptions-item label="子系统名称">{{point_info.child_name}}</el-descriptions-item>
          <el-descriptions-item label="点位编码">{{point_info.point_code}}</el-descriptions-item>
          <el-descriptions-item label="点位名称">{{point_info.point_name}}</el-descriptions-item>
          <el-descriptions-item label="状态说明">{{point_info.status_name_t}}</el-descriptions-item>
        </el-descriptions>
        <el-table
          :data="point_info.deviceLists"
          :row-style="{ height: '30px' }"
          :cell-style="{ padding: '0' }"
          highlight-current-row
          border
          style="margin-top:10px;"
        >
          <el-table-column label="物料名称" prop="deviceName" min-width="180px" show-overflow-tooltip></el-table-column>
          <el-table-column label="物料规格" prop="deviceModel"  min-width="180px" show-overflow-tooltip></el-table-column>
          <el-table-column label="单位" align="center" prop="unit" width="50"  />
          <el-table-column label="设计数量" align="center" prop="regNums" width="78" />
          <el-table-column  label="安装数量" align="center" prop="finishNums" width="78"></el-table-column>
        </el-table>
      </el-drawer>
    </div>
  </div>
</template>
<script>
// import GdMap from './GdMap'
import BdMap from './BdMap'
import gcoord from '@/utils/gcoord.js'
export default {
  name: 'pointSearch',
  data () {
    return {
      form: {
        project_code: '',
        point: ''
      },
      projectList: [],
      pointList: [],
      AMap: null,
      markers: null,
      pointLoading: false,
      mapLoading: false,
      near_points: [],
      point_info: {},
      pos: {},
      position: {},
      visible: false,
      styleObjectArr: []
    }
  },
  computed: {

  },
  mounted() {
    this.getProjectsList()
  },
  components: {
    BdMap
  },
  methods: {
    async getProjectsList() {
      const params = {
        user_id: this.$store.state.userInfo.id
      }
      const { data, code, message } = await this.$pub.post('/project/project-list-by-user', params)
      if (code === 200 && data !== null) {
        this.projectList = data
      } else {
        this.$notify.error({
          title: '查询失败',
          message: message
        })
      }
    },
    handleProjectChange() {
      this.pointList = []
      this.form.point = {}
      this.point_info = {}
      const refgd = this.$refs.gdMap
      const refbd = this.$refs.bdMap
      if (this.markers !== null) {
        refgd && refgd.GDMap.clearMap()
        refbd && refbd.bdmap.clearOverlays()
        this.visible = false
      }
    },
    async remoteMethod(query) {
      if (query !== '') {
        this.pointLoading = true
        const params = {
          project_code: this.form.project_code,
          keywords: query
        }
        const { data } = await this.$pub.post('/point/search', params)
        this.pointList = data || []
        this.pointLoading = false
      }
    },
    handlePointCodeChange() {
      if (this.$refs.gdMap) {
        this.GdhandlePointCodeChange()
      } else {
        this.BdhandlePointCodeChange()
      }
    },

    // ------------------ 高德地图start
    haveAmap(AMap) {
      this.AMap = AMap
    },
    async GdhandlePointCodeChange() {
      const GDMap = this.$refs.gdMap.GDMap
      if (this.markers !== null) {
        GDMap.clearMap()
        this.visible = false
      }
      this.point_info = {}
      // 1.获取附件300米以内的点，生成icon在地图上
      this.mapLoading = true
      const params = {
        project_code: this.form.project_code,
        lng: this.form.point.lng,
        lat: this.form.point.lat,
        point_code: this.form.point.point_code
      }
      const { data } = await this.$pub.post('/point/near', params)

      // 查找当前点的建设状态status_t status_name_t
      const current = data.find(f => f.point_code === this.form.point.point_code)
      this.form.point.status_t = current.status
      this.form.point.status_name_t = current.status_name
      this.form.point.status = current.status
      this.form.point.status_name = current.status_name
      this.near_points = data.filter(f => f.point_code !== this.form.point.point_code).map(m => {
        return { ...m, status_name_t: m.status_name, status_t: m.status }
      })
      this.drawMarks(this.near_points, 2)

      // 2.勘测未知生成icon在地图上
      this.drawMarks([this.form.point], 1)
    },
    addMarker (point, index) {
      const data = {
        lnglat: [point.lng02, point.lat02],
        name: point.point_name,
        point: point,
        id: index,
        style: index
      }
      return data
    },
    drawMarks (arrs, type) {
      const AMap = this.AMap
      const GDMap = this.$refs.gdMap.GDMap
      const overlayList = []
      const currentMarkers = []
      this.styleObjectArr = []
      if (arrs.length <= 0 || !arrs[0]) {
        return
      }
      arrs.map((item, index) => {
        if (item.lng && item.lat) {
          const result02 = gcoord.transform([item.lng, item.lat], // 经纬度坐标
            gcoord.WGS84, // 当前坐标系
            gcoord.GCJ02 // 目标坐标系
          )
          const po = Object.assign(item, { lng02: result02[0], lat02: result02[1] })
          currentMarkers.push(this.addMarker(po, index))
          overlayList.push({ lng: po.lng02, lat: po.lat02 })
          const icon = (type === 1 ? 'selstatus' : 'status') + (item.status !== undefined ? item.status : '0')
          const ur = require(`../../assets/images/${icon}.png`)
          // 创建样式对象
          const styleObject = {
            url: ur,
            size: new this.AMap.Size(40, 40),
            anchor: new this.AMap.Pixel(20, 20)
          }
          this.styleObjectArr.push(styleObject)
        }
      })
      // 绘制
      const massMarker = new AMap.MassMarks(currentMarkers, {
        zIndex: 999,
        style: this.styleObjectArr
      })

      massMarker.on('click', async (e) => {
        this.mapLoading = true
        const point = e.data.point
        const params = {
          project_code: this.form.project_code,
          point_code: point.point_code
        }
        const { code, message, data } = await this.$pub.post('/device/build-reg-info-noStage', params)
        this.mapLoading = false
        let deviceLists = []
        if (code !== 200) {
          this.$notify.error({
            title: '物料规格列表查询失败',
            message: message
          })
        } else {
          deviceLists = data.device_list || []
        }
        this.point_info = { ...point, deviceLists }
        this.pos = [e.data.lnglat[0], e.data.lnglat[1]]
        this.visible = true
      })

      massMarker.setMap(GDMap)
      const center = this.form.point.lng02 ? [this.form.point.lng02, this.form.point.lat02] : gcoord.transform(
        [this.form.point.lng, this.form.point.lat], // 经纬度坐标
        gcoord.WGS84, // 当前坐标系
        gcoord.GCJ02 // 目标坐标系
      )
      GDMap.setZoomAndCenter(18, center)
      this.markers = massMarker
      this.mapLoading = false
    },
    mapMovestart() {
      this.visible = false
    },
    async getNearPoint(lng_lat) {
      // 传过来的是GCJ02坐标系
      if (this.form.project_code) {
        this.form.point = {}
        this.point_info = {}
        const GDMap = this.$refs.gdMap.GDMap
        if (this.markers !== null) {
          GDMap.clearMap()
          this.visible = false
        }
        // 获取附件300米以内的点，生成icon在地图上
        this.mapLoading = true
        const result84 = gcoord.transform(
          [lng_lat[0], lng_lat[1]], // 经纬度坐标
          gcoord.GCJ02, // 当前坐标系
          gcoord.WGS84 // 目标坐标系
        )
        const params = {
          project_code: this.form.project_code,
          lng: result84[0] + '',
          lat: result84[1] + ''
        }
        const { data } = await this.$pub.post('/point/slt-map', params)
        this.near_points = data.filter(f => f.point_code !== this.form.point.point_code).map(m => {
          return { ...m, status_name_t: m.status_name, status_t: m.status }
        })
        if (data && data.length > 0) {
          this.form.point.lng = data[0].lng + 0
          this.form.point.lat = data[0].lat + 0
          this.drawMarks(this.near_points, 2)
        } else {
          this.mapLoading = false
          this.$message({
            type: 'success',
            message: '此处附近无点位',
            showClose: true
          })
          GDMap.setZoomAndCenter(18, lng_lat)
        }
      }
    },
    // ------------------ 高德地图end
    // ------------------ 百度地图start
    async BdhandlePointCodeChange() {
      const map = this.$refs.bdMap
      if (map) {
        map.bdmap.clearOverlays()
        this.point_info = {}
        // 1.获取附件300米以内的点，生成icon在地图上
        this.mapLoading = true
        const params = {
          project_code: this.form.project_code,
          lng: this.form.point.lng,
          lat: this.form.point.lat,
          point_code: this.form.point.point_code
        }
        const { data } = await this.$pub.post('/point/near', params)
        this.mapLoading = false
        // 查找当前点的建设状态status_t status_name_t
        const current = data.find(f => f.point_code === this.form.point.point_code)
        this.form.point.status_t = current.status
        this.form.point.status_name_t = current.status_name
        this.form.point.status = current.status
        this.form.point.status_name = current.status_name
        const result = gcoord.transform([this.form.point.lng, this.form.point.lat], // 经纬度坐标
          gcoord.WGS84, // 当前坐标系
          gcoord.BD09 // 目标坐标系
        )
        this.form.point = { ...this.form.point, lngbd: result[0], latbd: result[1] }
        this.near_points = data.filter(f => f.point_code !== this.form.point.point_code).map(m => {
          const itemresult = gcoord.transform([m.lng, m.lat], // 经纬度坐标
            gcoord.WGS84, // 当前坐标系
            gcoord.BD09 // 目标坐标系
          )
          return { ...m, lngbd: itemresult[0], latbd: itemresult[1], status_name_t: m.status_name, status_t: m.status }
        })
        map.drawMarks(this.near_points, 2)

        // 2.勘测未知生成icon在地图上
        map.drawMarks([this.form.point], 1)
        map.bdmap.flyTo(new map.BMapGL.Point(this.form.point.lngbd, this.form.point.latbd), 18)
      }
    },
    async clickBDPoint(point) {
      this.mapLoading = true
      const params = {
        project_code: this.form.project_code,
        point_code: point.point_code
      }
      const { code, message, data } = await this.$pub.post('/device/build-reg-info-noStage', params)
      this.mapLoading = false
      let deviceLists = []
      if (code !== 200) {
        this.$notify.error({
          title: '物料规格列表查询失败',
          message: message
        })
      } else {
        deviceLists = data.device_list || []
      }
      this.point_info = { ...point, deviceLists }
      this.visible = true
    }
  }
}
</script>

<style lang="scss">
.point_search{
  padding: 20px;
  height: 100%;
  width: 100%;
  box-sizing: border-box;
  .tit{
    padding: 0px 20px;
    height:33px;
    line-height: 33px;
    background: #409eff;
    opacity: 0.7;
    color:#fff;
    cursor:pointer;
    border-right:0;
  }
  .toolwrap{
    .el-form-item__content{
      display:flex;
      align-items: center;
    }
  }
  .toolBar{
    width:0;
    transition: width 0.3s ease;
    overflow: hidden;
    background: #fff;
    border: 1px solid #a2cbf5;
    border-left:0;
    display:inline-block;
    line-height: 31px;
    height:31px;
    i{
      font-size:20px;
      cursor: pointer;
      line-height: 31px;
      margin-left:10px;
      &:hover{
        color: #409eff;
      }
    }
    .active{
      color: #409eff;
    }
  }
  .mapwrap{
    height:calc(100% - 50px);
    width:100%;
    position:relative;
    .diago_clover{
      position:absolute;
      padding:20px;
      top:60px;
      height:calc(100% - 60px);
      width:627px;
      border-radius: 5px;
      box-shadow: 0 15px 15px rgba(0, 0,0,0.25);
      background-color: #719bff;
      z-index: 10;
      transform: translate(-50%,-50%);
      color: #fff;
      // &:after{
      //   content: "◆";
      //   font-size: 36px;
      //   height: 26px;
      //   color: #719bff;
      //   position: absolute;
      //   bottom: 0;
      //   left: 50%;
      //   transform: translateX(-50%);
      // }
      // .wrap{
      //    display:flex;
      //   span:first-child{
      //     min-width: 90px;
      //     display: block;
      //   }
      // }
      // .el-icon-close{
      //   position: absolute;
      //   right:4px;
      //   top:4px;
      //   cursor:pointer;
      // }
    }
    .toolBar{
      background: #fff;
      position:absolute;
      top:0;
      right:0px;
      border-radius: 4px;
      font-size:20px;
      .active{
        color: #409eff;
      }

      li{
        cursor: pointer;
        &:hover{
          color: #409eff;
        }
      }

    }
  }
}
</style>
