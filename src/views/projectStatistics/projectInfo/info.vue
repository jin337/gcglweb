<template>
  <div class="project_info_area p_t_wrap" v-loading="loading">
    <div class="title">
      <span class="tit">{{ project.project_name }}</span>
      <el-button size="small" @click="exportExcel" type="primary">导出</el-button>
      <span class="time">{{ parseTime(new Date(), '{y}-{m}-{d}') }}</span>
    </div>
    <el-button-group class="btns_wrap">
      <i class="el-icon-arrow-left" @click="clickLeft" v-if="isShowArrow"></i>
      <el-button-group class="btns">
        <el-button v-for="(item, index) in areaList" :key="item.key" @click="clickArea(item.key, index)"
          :class="{ isActive: item.key === area }">{{ item.value }}</el-button>
      </el-button-group>
      <i class="el-icon-arrow-right" @click="clickRight" v-if="isShowArrow"></i>
    </el-button-group>
    <div class="content_wrap" v-if="point_info && proc_info.length > 0">
      <div class="topbox">
        <!-- 点位建设情况 -->
        <div class="point_box wrap">
          <h4 class="tit backgray">点位建设情况</h4>
          <div class="row">
            <span class="ge name">设计数量</span>
            <span class="ge num">{{ point_info.design_point_count }}</span>
            <span class="ge name">建设数量</span>
            <span class="ge num">{{ point_info.build_point_count }}</span>
            <span class="ge name">拆除/取消数量</span>
            <span class="ge num">{{ point_info.remove_point_count }}</span>
          </div>
          <div class="row">
            <span class="ge name">相机安装完成点位数量</span>
            <span class="ge num">{{ point_info.camera_point_count }}</span>
            <span class="ge name">建设完工点位数量</span>
            <span class="ge num">{{ point_info.fin_camera_point_count }}</span>
            <span class="ge name">完工百分比</span>
            <span class="ge num">
              <el-tooltip effect="dark" content="完工百分比=建设完工点位数量/设计数量" placement="top">
                <span>{{ point_info.fin_camera_point_ratio ? point_info.fin_camera_point_ratio : 0 }} %</span>
              </el-tooltip>
            </span>
          </div>
          <div class="row">
            <span class="ge name">取电点位数量</span>
            <span class="ge num">{{ point_info.power_point_count }}</span>
            <span class="ge name">取网点位数量</span>
            <span class="ge num">{{ point_info.network_point_count }}</span>
            <span class="ge name">接入点位数量</span>
            <span class="ge num">{{ point_info.join_point_count }}</span>
          </div>
        </div>
        <!-- 物料建设情况 -->
        <div class="device_box wrap">
          <h4 class="tit backgray">物料建设情况</h4>
          <div class="row">
            <!-- 这条row为表头 -->
            <span class="ge name backgray weight">物料类型 | 建设权重</span>
            <div class="status_box">
              <span class="onerow backgray weight">物料状态</span>
              <div class="devive_row">
                <span class="ge name backgray weight">设计数量</span>
                <span class="ge name backgray weight" style="font-size:13px;">合同数量 | 到货数量</span>
                <span class="ge name backgray weight">初审数量</span>
                <span class="ge name backgray weight">终审数量</span>
                <span class="ge name backgray weight">拆除/取消数量</span>
              </div>
            </div>
            <span class="ge name backgray weight">
              <span> 完工百分比</span>
              <span style="margin-left:2px;">
                <el-tooltip effect="dark"
                  content="完工百分比=基坑完工百分比 * 20% + 杆件完工百分比 * 10% + 横臂完工百分比 * 5% + 取电数量完工百分比 * 20% + 相机安装完工百分比 * 20 % + 相机接入完工百分比 * 15% + 接网完工百分比 * 10%"
                  placement="top">
                  <span>{{ finRatio ? finRatio : 0 }}%</span>
                </el-tooltip>
              </span>
            </span>
          </div>
          <div class="row" v-for="(item, index) in  proc_info " :key="index">
            <template v-if="item.name === '设备箱总数量 | 取电数量20'">
              <span class="ge  lngdie weight" style="font-size:13px;">{{ item.name }}</span>
              <div class="status_box">
                <div class="devive_row">
                  <span class="ge num">{{ item.design_count }} | {{ item.power.design_count }}</span>
                  <span class="ge num">{{ item.contract_count }} | {{ item.arrival_count }}</span> <!-- 合同数量|到货数量  -->
                  <span class="ge num">{{ item.install_count }} | {{ item.power.install_count }} </span>
                  <span class="ge num">{{ item.verify_count }} | {{ item.power.verify_count }} </span>
                  <span class="ge num">{{ item.remove_count }} | {{ item.power.remove_count }} </span>
                </div>
              </div>
              <span class="ge num">
                <el-tooltip effect="dark" :content="item.ratioFn" placement="top">
                  <span>{{ item.ratio }} %</span>
                </el-tooltip>
              </span>
            </template>

            <template v-else-if="item.name === '相机接入 | 15'">
              <span class="ge  lngdie weight">{{ item.name }}</span>
              <div class="status_box">
                <div class="devive_row">
                  <span class="ge name backgray weight">完工移交数量</span>
                  <span class="ge name backgray weight">正常在线</span>
                  <span class="ge name backgray weight">异常在线</span>
                  <span class="ge name backgray weight">在线总数</span>
                  <span class="ge name backgray weight">{{ online_time }}在线率</span>
                </div>
                <div class="devive_row topline">
                  <span class="ge num">{{ item.finish_count }}</span>
                  <span class="ge num">{{ item.design_online_count }}</span>
                  <span class="ge num">{{ item.err_online_count }}</span>
                  <span class="ge num">{{ item.all_online_count }}</span>
                  <span class="ge num">
                    <el-tooltip effect="dark" :content="item.onlineRatioFn" placement="top">
                      <span>{{ item.online_ratio }} %</span>
                    </el-tooltip>
                  </span>
                </div>
              </div>
              <span class="ge num">
                <el-tooltip effect="dark" :content="item.ratioFn" placement="top">
                  <span>{{ item.ratio }} %</span>
                </el-tooltip>
              </span>
            </template>

            <template v-else>
              <span class="ge  lngdie weight">{{ item.name }}</span>
              <div class="status_box">
                <div class="devive_row">
                  <span class="ge num">{{ item.design_count }}</span>
                  <span class="ge num">{{ item.contract_count }} | {{ item.arrival_count }}</span> <!-- 合同数量|到货数量  -->
                  <span class="ge num">{{ item.install_count }}</span>
                  <span class="ge num">{{ item.verify_count }}</span>
                  <span class="ge num">{{ item.remove_count }}</span>
                </div>
              </div>
              <span class="ge num">
                <el-tooltip effect="dark" :content="item.ratioFn" placement="top">
                  <span>{{ item.ratio }} %</span>
                </el-tooltip>
              </span>
            </template>
          </div>
        </div>
      </div>
      <div v-loading="tableLoading">
        <div class="timewrap">
          <el-button :class="{ isActive: time === 'all' }" @click="changeToday('all')" size="mini">全部</el-button>
          <el-button :class="{ isActive: time === 'today' }" @click="changeToday('today')" size="mini">今日</el-button>
          <el-button :class="{ isActive: time === 'allGK' }" @click="changeToday('allGK')" size="mini">总运行概况</el-button>
          <el-button :class="{ isActive: time === 'todayGK' }" @click="changeToday('todayGK')"
            size="mini">当日运行概况</el-button>
          <el-date-picker class="checktime" v-if="time === 'todayGK'" v-model="check_date" align="right" type="date"
            placeholder="选择日期" value-format="yyyy-MM-dd" :picker-options="pickerOptions" @change="getTableDataGK">
          </el-date-picker>
        </div>

        <el-table class="hejitable" :key="mykey" :data="tableData" :row-style="{ height: '30px' }"
          :cell-style="{ padding: '4px 0' }" show-summary :summary-method="getSummaries">
          <el-table-column show-overflow-tooltip prop="dept_name" label="施工队名称"></el-table-column>
          <template v-if="time === 'all' || time === 'today'">
            <el-table-column show-overflow-tooltip prop="cls_002" label="基坑浇注" width="180" align="center">
              <template slot="header">
                <div>
                  <span>基坑浇注</span>
                  <!-- <span>({{ total.two }})</span> -->
                </div>
              </template>
            </el-table-column>
            <el-table-column show-overflow-tooltip prop="cls_004" label="立杆完成" width="180" align="center">
              <template slot="header">
                <div>
                  <span>立杆完成</span>
                  <!-- <span>({{ total.four }})</span> -->
                </div>
              </template>
            </el-table-column>
            <el-table-column show-overflow-tooltip prop="cls_009" label="相机安装完成" width="180" align="center">
              <template slot="header">
                <div>
                  <span>相机安装完成</span>
                  <!-- <span>({{ total.nine }})</span> -->
                </div>
              </template>
            </el-table-column>
            <el-table-column show-overflow-tooltip prop="online_count" label="相机在线" width="140"
              align="center"></el-table-column>
            <el-table-column show-overflow-tooltip prop="debug_count" label="今日相机调试" width="150"
              align="center"></el-table-column>
          </template>
          <!-- 总运行概况  -->
          <template v-if="time === 'allGK'">
            <el-table-column show-overflow-tooltip prop="camera_ct" label="相机总数" width="140"
              align="center"></el-table-column>
            <el-table-column show-overflow-tooltip prop="join_ct" label="接入总数" width="140"
              align="center"></el-table-column>
            <el-table-column show-overflow-tooltip prop="online_ct" label="当日在线总数" width="150"
              align="center"></el-table-column>
            <el-table-column show-overflow-tooltip prop="online_rate" label="在线率" width="140" align="center">
              <template slot-scope="{row}">
                <div>
                  <span>{{ row.online_rate }}</span>
                  <span>%</span>
                </div>
              </template>
            </el-table-column>
          </template>
          <!-- 当日运行概况 -->
          <template v-if="time === 'todayGK'">
            <el-table-column show-overflow-tooltip prop="join_ct" label="当日新接入数" width="150"
              align="center"></el-table-column>
            <el-table-column show-overflow-tooltip prop="offline_ct" label="前日掉线数" width="150"
              align="center"></el-table-column>
            <el-table-column show-overflow-tooltip prop="repair_ct" label=" 当日维修上线数" width="150"
              align="center"></el-table-column>
            <el-table-column show-overflow-tooltip prop="online_ct" label="当日在线总数" width="150"
              align="center"></el-table-column>
            <el-table-column show-overflow-tooltip prop="net_value" label="净值" width="100"
              align="center"></el-table-column>
          </template>
        </el-table>
      </div>
    </div>
  </div>
</template>

<script>
import defaumixn from '../default.js'
import { downloadFile, parseTime, keepTwoDecimalFull } from '@/utils/tool'
export default {
  name: 'project_i',
  mixins: [defaumixn],
  props: {
    project: {
      required: true,
      default: ''
    }
  },
  data () {
    return {
      loading: false,
      infos: [],
      point_info: {}, // 点位数量
      proc_info: [], // 施工过程
      online_time: '2023/11/11',
      finRatio: 0,
      tableHeight: window.innerHeight - 750,
      tableData: [],
      tableLoading: false,
      total: { two: 0, four: 0, nine: 0 },
      time: 'all',
      urlobj: {
        allall: 'rate/project_survey_dept', // 区域全部，时间全部
        areaall: 'rate/project_survey_dept_area', // 单独选中区域，时间全部

        alltoday: 'rate/project_survey_dept_today', // 区域全部，时间今日
        areatoday: 'rate/project_survey_dept_today_area', // 单独选中区域，时间今日

        allGK: 'rate/project-dept-device-all', // 施工队总体运行情况
        todayGK: 'rate/project-dept-device-today' // 今日施工队运行情况
      },
      mykey: 12,
      check_date: parseTime(new Date(), '{y}-{m}-{d}'),
      pickerOptions: {
        disabledDate (time) {
          return time.getTime() > Date.now()
        },
        shortcuts: [{
          text: '今天',
          onClick (picker) {
            picker.$emit('pick', new Date())
          }
        }, {
          text: '昨天',
          onClick (picker) {
            const date = new Date()
            date.setTime(date.getTime() - 3600 * 1000 * 24)
            picker.$emit('pick', date)
          }
        }, {
          text: '一周前',
          onClick (picker) {
            const date = new Date()
            date.setTime(date.getTime() - 3600 * 1000 * 24 * 7)
            picker.$emit('pick', date)
          }
        }]
      }
    }
  },
  created () {
    this.clickArea('all', 0)
  },
  mounted () {
    window.onresize = () => {
      const _el = document.getElementsByClassName('project_info_area')
      if (_el[0]) {
        const _header = _el[0].getElementsByClassName('topbox')
        const top_height = _header[0] ? _header[0].offsetHeight : 0
        const _height = window.innerHeight
        this.tableHeight = _height - 200 - top_height
      }
    }
  },
  methods: {
    parseTime,
    changeToday (type) {
      this.time = type
      if (this.time === 'all' || this.time === 'today') {
        this.getTableData()
      } else {
        this.getTableDataGK()
      }
    },
    async getData () {
      this.loading = true
      const url = this.area === 'all' ? 'rate/project_survey_info' : 'rate/project_survey_info_area'
      const params = this.area === 'all' ? {
        project_code: this.project.project_code
      } : {
        project_code: this.project.project_code,
        area: this.area
      }
      const { data, code } = await this.$pub.post(url, params)
      if (code !== 200) {
        this.loading = false
        return this.$message({
          type: 'error',
          message: '获取项目概况出错了',
          showClose: true
        })
      }
      this.loading = false
      this.finRatio = data.finish_ratio || '0'
      this.online_time = data.check_date || ''
      this.point_info = data.point_info
      this.proc_info = this.handleData(data.proc_info, data.camera_info)
      this.changeToday(this.time)
    },
    handleData (arrs, camera_info) {
      /**
       * 一. 数组顺序，=》行顺序
       * 0 name:基坑|20, device_type 3
       * 1 name:杆件|10, device_type 2
       * 2 name:横臂|5, device_type 4
       * 3 name:设备箱总数量|取电数量20, device_type(7|12)
       * 4 name:接网数量|10, device_type 13
       * 5 name:相机安装|20, device_type 1
       * 6 name:相机接入|15, 单独字段camera_info
       * 7 name:多码联帧, device_type 5
       * 8 name:ETC, device_type 6
       * 二. 展示字段处理 =》列展示数据
       * 1 设计数量 design_count
       * 2.合同数量|到货数量：contract_count|arrival_count拼接
       * 3 初审数量 install_count
       * 4 终审数量 verify_count
       * 5 拆除/取消数量 remove_count
       * 6 完工百分比 ratio
       * 三. 特殊的行
       * 设备箱总数量|取电数量20行  对应列展示
       * 1. 合同数量|到货数量列=》 用设备箱总数量对应的字段contract_count|arrival_count拼接
       * 2. 设计数量/初审数量/终审数量/（拆除/取消数量）这四列显示 （设备箱总数量|取电数量20行 这两个集合对应字符拼接）
       * 3. 完工百分比列=》 用取电数量20对应的字段ratio展示
       * 四. 数组第六位插入 相机接入|15 用camera_info字段
       * finish_count 完工移交数量
       * all_online_count  异常在线
       * design_online_count 正常在线
       * err_online_count 异常在线
       * on_ratio 在线率
       * ratio 完工百分比
       * */
      const tempArr = [
        {
          ...camera_info,
          name: '相机接入 | 15',
          ratioFn: '完工百分比 = 相机接入数量 / 合同数量',
          onlineRatioFn: '在线率 = 在线总数 / 初审数量',
          order: 6
        }
      ]
      arrs.forEach(f => {
        if (f.device_type === 3) {
          tempArr.push({ ...f, name: '基坑 | 20', ratioFn: '完工百分比 = 初审数量 / 设计数量', order: 0 })
        } else if (f.device_type === 2) {
          tempArr.push({ ...f, name: '杆件 | 10', ratioFn: '完工百分比 = 初审数量 / 设计数量', order: 1 })
        } else if (f.device_type === 4) {
          tempArr.push({ ...f, name: '横臂 | 5', ratioFn: '完工百分比 = 初审数量 / 设计数量', order: 2 })
        } else if (f.device_type === 7) {
          const power = arrs.find(i => i.device_type === 12)
          tempArr.push({ // 这里处理第三个特殊行展示问题contract_count|arrival_count ，ratio
            ...f,
            name: '设备箱总数量 | 取电数量20',
            ratio: power ? power.ratio : 0,
            ratioFn: '完工百分比 = 取电初审数量 / 取电设计数量',
            order: 3,
            power: power ? { ...power } : {
              device_type: 12,
              device_type_name: '',
              design_count: 0,
              install_count: 0,
              verify_count: 0,
              contract_count: 0,
              arrival_count: 0,
              remove_count: 0,
              ratio: 0
            }
          })
        } else if (f.device_type === 13) {
          tempArr.push({ ...f, name: '接网数量 | 10', ratioFn: '完工百分比 = 初审数量 / 设计数量', order: 4 })
        } else if (f.device_type === 1) {
          tempArr.push({ ...f, name: '相机安装 | 20', ratioFn: '完工百分比 = 初审数量 / 设计数量', order: 5 })
        } else if (f.device_type === 5) {
          tempArr.push({ ...f, name: '多码联帧', ratioFn: '完工百分比 = 初审数量 / 设计数量', order: 7 })
        } else if (f.device_type === 6) {
          tempArr.push({ ...f, name: 'ETC', ratioFn: '完工百分比 = 初审数量 / 设计数量', order: 8 })
        }
      })

      tempArr.sort((star, next) => {
        return star.order - next.order
      })
      return tempArr
    },
    // 获取全部和今日的数据，和区域有关
    async getTableData () {
      const _area = this.area === 'all' ? 'all' : 'area'
      const url = this.urlobj[_area + this.time]
      const params = {
        project_code: this.project.project_code,
        area: this.area === 'all' ? null : this.area
      }
      this.tableLoading = true
      const { data, code } = await this.$pub.post(url, params)
      if (code !== 200) {
        return this.$message({
          type: 'error',
          message: '获取施工队概况出错了',
          showClose: true

        })
      }
      this.tableData = data.list ? data.list : []
      this.total = {
        two: data.cls_002,
        four: data.cls_004,
        nine: data.cls_009
      }
      this.mykey = Math.random()
      this.$nextTick(() => {
        const _el = document.getElementsByClassName('project_info_area')
        if (_el[0]) {
          const _header = _el[0].getElementsByClassName('topbox')
          const top_height = _header[0] ? _header[0].offsetHeight : 0
          const _height = window.innerHeight
          this.tableHeight = _height - 192 - top_height
        }
      })
      this.tableLoading = false
    },
    // 获取概况的数据（总运行概况和当日运行概况）
    async getTableDataGK () {
      const url = this.urlobj[this.time]
      const params = this.time === 'todayGK' ? {
        project_code: this.project.project_code,
        check_date: this.check_date
      } : {
        project_code: this.project.project_code
      }
      this.tableLoading = true
      const { data, code } = await this.$pub.post(url, params)
      if (code !== 200) {
        return this.$message({
          type: 'error',
          message: '获取施工队概况出错了',
          showClose: true
        })
      }
      // this.tableData = data || []
      this.tableData = data.list || []
      this.mykey = Math.random()
      this.tableLoading = false
      // this.$nextTick(() => {
      //   const _el = document.getElementsByClassName('project_info_area')
      //   if (_el[0]) {
      //     const _header = _el[0].getElementsByClassName('topbox')
      //     const top_height = _header[0] ? _header[0].offsetHeight : 0
      //     const _height = window.innerHeight
      //     this.tableHeight = _height - 192 - top_height
      //   }
      // })
    },
    // 合计
    getSummaries (param) {
      const { columns, data } = param
      const sums = []
      columns.forEach((column, index) => {
        if (index === 0) {
          sums[index] = '合计'
          return
        }
        const values = data.map(item => Number(item[column.property]))
        if (!values.every(value => isNaN(value))) {
          sums[index] = values.reduce((prev, curr) => {
            const value = Number(curr)
            if (!isNaN(value)) {
              return prev + curr
            } else {
              return prev
            }
          }, 0)
          if (column.property === 'online_rate') { // 在线/接入 (索引对应index-2,index-1)
            if (sums[index - 1] && sums[index - 2]) {
              const result = keepTwoDecimalFull((sums[index - 1] / sums[index - 2]) * 100)
              sums[index] = result + '%'
            } else {
              sums[index] = ''
            }
          }
          // sums[index] += ' 个'
        } else {
          sums[index] = ''
        }
      })
      return sums
    },
    async exportExcel () {
      this.loading = true
      const area = this.areaList.map(m => m.key).filter(f => f !== 'all')
      const params = {
        project_code: this.project.project_code,
        area
      }
      const result = await this.$pub.post(
        'rate/project_survey_info_excel',
        params,
        {
          headers: {
            'Content-Type': 'application/x-download'
          },
          responseType: 'blob'
        }
      )
      const title = this.project.project_name + '总体概况'
      downloadFile(result, title, 'xlsx')
      this.loading = false
    }
  }
}
</script>

<style lang="scss">
.project_info_area {
  height: 100%;

  .title {
    padding: 20px 0;
    display: flex;
    flex-wrap: nowrap;

    .tit {
      color: #000;
      font-weight: 550;
      margin-right: 20px;
    }

    .time {
      margin-left: auto;
      padding: 10px 20px;
      background: #deebff;
      border-radius: 6px;
      color: #7b7676;
      font-weight: 700;
    }
  }

  .el-table__header-wrapper {
    font-size: 16px;
  }

  .el-descriptions {
    font-size: 16px;
    // margin-bottom:40px;
  }

  .el-descriptions-item__content {
    span {
      font-size: 18px;
      font-weight: 550;
    }
  }

  .el-descriptions .is-bordered .el-descriptions-item__cell {
    padding: 5px 10px;
  }

  .timewrap {
    margin: 12px 20px;

    .isActive {
      background: #409eff;
      color: #fff;
    }

    .checktime {
      float: right;
    }
  }

  .el-table__header {
    th {
      color: #000;
      border-top: 1px solid #EBEEF5;
    }

  }

  .content_wrap {
    .wrap {
      .tit {
        text-align: center;
        padding: 4px 0;
        border-bottom: 1px solid #EBEEF5;
        font-size: 14px;
      }

      .row {
        border-bottom: 1px solid #EBEEF5;
        font-size: 14px;
        display: flex;

        .ge {
          color: #606266;
          display: inline-block;
          width: 16.6%;
          padding: 4px 8px;
          border-left: 1px solid #EBEEF5;
          box-sizing: border-box;
        }

        .ge:first-child {
          border-left: none;
        }

        .name {
          color: #000;
        }

        .num {
          text-align: right;
        }
      }
    }

    .point_box {
      border-top: 1px solid #EBEEF5;

      .ge:last-child {
        flex: 1
      }

      .header.row {
        .ge {
          color: #000;
          font-size: 15px;
          ;
        }
      }

    }

    .device_box {
      .row {
        display: table;
        width: 100%;

        .ge {
          display: table-cell;
          vertical-align: middle;
        }

        .name {
          text-align: center;
        }
      }

      .status_box {
        flex: 1;
        border-left: 1px solid #EBEEF5;
        border-right: 1px solid #EBEEF5;
        line-height: 19px;

        .onerow {
          text-align: center;
          padding: 4px 0;
          box-sizing: border-box;
          display: inline-block;
          width: 100%;
          border-bottom: 1px solid #EBEEF5;
        }

        .devive_row {
          display: flex;

          .ge {
            width: 20%;
            // text-align: center;
          }
        }
      }

      .status_box+.ge {
        border-left: none;
      }

      .topline {
        border-top: 1px solid #EBEEF5;
      }
    }

    .backgray {
      background: #f9faff;
    }

    .device_box .row .ge.lngdie {
      color: #000;
    }

    .weight {
      font-weight: bold;
    }

    .point_box+.device_box {
      border-top: 1px solid #606266;
      border-bottom: 1px solid #606266;
    }

  }
}

// 合计行样式
.el-table__footer-wrapper tbody td,
.el-table__header-wrapper tbody td {
  background-color: #e3f3ff !important;
  color: #666;
}

.el-table__footer-wrapper .is-leaf {
  color: #666 !important;
}

.el-table__fixed-footer-wrapper tbody td {
  border-top: 1px solid #ebeef5;
  background-color: #e3f3ff;
  color: #666;
  text-align: center !important;
}

.has-gutter tr td .cell {
  text-align: center;
  color: #001111;
}

//合并行放在第一行
.hejitable {
  display: flex;
  flex-direction: column;
}

.hejitable .el-table__body-wrapper {
  order: 1;
}

.hejitable .el-table__fixed-body-wrapper {
  top: 97px !important;
}

.hejitable .el-table__fixed-footer-wrapper {
  z-index: 0;
  top: 50px;
}
</style>
