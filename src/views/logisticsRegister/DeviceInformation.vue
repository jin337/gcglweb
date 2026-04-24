<template>
  <div class="DeviceInformation">
    <div class="base_device" style=" padding:10px;border-bottom:1px solid #ededed;box-sizing:border-box;">
      <div class="info">
        <span>最后更新人：{{ log_info.userName ? log_info.userName : '暂无数据' }}</span>
        <span>操作时间：{{ log_info.updateTim ? log_info.updateTime : '暂无数据' }}</span>
      </div>
      <div class="info">
        <span style="font-size:14px;margin-right:6px">备注:
          <span v-if="!isSaveBtn">{{ log_info.remark ? log_info.remark : '/' }}</span>
        </span>
        <el-input size="mini" v-model="log_info.remark" style="flex:1;" v-if="isSaveBtn"></el-input>
        <el-button type="primary" size="small" style="margin-left: auto;" @click="saveData"
          v-if="isSaveBtn">保存</el-button>
      </div>
    </div>

    <div style="display:flex;height:100%;" v-loading="tableLoading">
      <el-table class="deviceTable" :height="deviceHeight" :data="deviceLists" :row-style="{ height: '30px' }"
        :cell-style="{ padding: '0' }" highlight-current-row style="width: calc( 100% -185px)">
        <el-table-column label="物料规格" prop="deviceName" min-width="150" show-overflow-tooltip>
          <template slot-scope="scope">
            <span>
              <span v-if="scope.row.status === 3 || scope.row.status === 2"
                :style="{ margin: '0 2px 0 0', padding: '4px 6px', background: scope.row.status === 3 ? 'blue' : 'green', color: '#fff' }">{{
          statusFormat(stage_device_status, scope.row.status) }}</span>
              <span :class="{ isWeight: scope.row.status === 2 || scope.row.status === 3 }"
                :style="{ color: scope.row.status === 2 ? 'green' : scope.row.status === 3 ? 'blue' : '#606266' }">{{
          scope.row.deviceName }}</span>
            </span>
          </template>
        </el-table-column>
        <el-table-column label="规格型号" prop="deviceModel" show-overflow-tooltip>

          <template slot-scope="scope">
            <span>{{ scope.row.deviceModel }}</span>
          </template>
        </el-table-column>
        <el-table-column label="单位" prop="unit" width="50" align="center" />
        <el-table-column label="设计数量" prop="regNums" align="center" width="76" />
        <el-table-column label="安装数量" prop="finishNums" align="center" width="80" v-if="isCHU">

          <template slot-scope="scope">
            <el-input v-model="scope.row.finishNums"
              :disabled="(additional1.includes(projectCode)) || scope.row.status === 3 && !checkPermission(['logisticsRegister:examine'])"
              @blur="valiAnzhuangNum(scope.row, scope.$index)" style="width:60px;"
              :class="{ noFinish: scope.row.regNums > scope.row.finishNums }"></el-input>
            <span v-if="scope.row.error" style="color:#f40;">{{ scope.row.error }}</span>
          </template>
        </el-table-column>
        <el-table-column label="安装数量" prop="finishNums" align="center" width="76" v-else></el-table-column>
        <el-table-column v-if="!isCHU" label="终审数量" prop="finalNums" align="center" width="76"></el-table-column>
        <el-table-column v-if="!isCHU && checkPermission(['logisticsRegister:examine_f'])" label="审核" align="center"
          width="60">

          <template slot-scope="scope">
            <el-checkbox v-model="scope.row.check" @change="checkRow(scope.row)"
              :disabled="is_lock || scope.row.regNums !== scope.row.finishNums || (scope.row.status != 2 && scope.row.status != 3)"
              :class="{ isTwo: scope.row.status === 2 }"></el-checkbox>
          </template>
        </el-table-column>
      </el-table>

      <div class="checkGroupself">
        <div v-for="i in stage_list" :key="i.id" class="el-checkboxs"
          :class="{ isSelect: currentStage && currentStage.stage_code === i.stage_code }">
          <!-- <el-checkbox v-model="i.checked" v-if="!i.noCkeck && isCHU"  @change="buildStatusChange(i)"  :disabled="i.disabled"></el-checkbox> -->
          <!-- <span v-if="i.noCkeck && isCHU" style="display: inline-block;width:14px;"></span> -->
          <span :style="{ color: i.color, fontWeight: (i.status === 3 || i.status === 2) ? 700 : 'normal', }"
            class="isLine" @click="clickStage(i)">{{ i.stage_name }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { checkPermission } from '@/utils/tool'
export default {
  name: 'DeviceInformation',
  props: {
    point: {
      type: [Object, null],
      default: null
    },
    projectCode: {
      type: String,
      default: ''
    },
    isSaveBtn: {
      default: false,
      type: Boolean
    },
    isCHU: { // 是否是初审
      default: false,
      type: Boolean
    },
    is_lock: { // 已被锁定
      default: false
    }
  },
  watch: {
    point: {
      handler (val) {
        if (val) {
          this.getList()
        } else {
          this.deviceLists = []
          this.stage_list = []
          this.log_info = {
            status: '',
            userID: '',
            userName: '',
            updateTime: ''
          }
          this.status_info = []
        }
      },
      deep: true
    }
  },
  data () {
    return {
      log_info: {
        status: 0, // 深化设计是否完成的状态标志 1已登记，2已完成
        userID: '',
        userName: '',
        updateTime: '',
        remark: ''
      },
      deviceHeight: window.innerHeight - 300,
      deviceLists: [], // 物料规格
      currentStage: null, // 当前选择的阶段
      stage_device_status: [
        { dict_label: '无需审核', dict_value: 0 }, { dict_label: '待审核', dict_value: 1 },
        { dict_label: '已初审', dict_value: 2 }, { dict_label: '已终审', dict_value: 3 }
      ],
      tableLoading: false,
      stage_list: [], // 阶段数据
      status_info: [], // 施工登记的状态
      additional1: ['XCG-2021-024', 'YCDF2022', 'YCDF2022-01'] // 'TEST20200610'
    }
  },
  computed: {

  },
  mounted () {
    if (this.point) {
      this.getList()
    }
    this.getTableHeight()
    window.addEventListener('resize', () => this.getTableHeight())
  },
  components: {

  },
  methods: {
    checkPermission,
    getTableHeight () {
      this.$nextTick(() => {
        const el_wrap = document.getElementsByClassName('DeviceInformation')[0]
        if (el_wrap) {
          const main_header = el_wrap.getElementsByClassName('base_device')[0]
          const main_headerh = main_header.offsetHeight + 1
          this.deviceHeight = el_wrap.offsetHeight - main_headerh
        }
      })
    },
    async getList () {
      this.tableLoading = true
      const params = {
        project_code: this.projectCode,
        point_code: this.point.pointCode,
        stage_code: this.currentStage ? this.currentStage.stage_code : ''
      }
      this.$pub.post('/device/build-reg-info', params).then(res => {
        try {
          this.deviceLists = (res.data.device_list || []).map(m => {
            return {
              ...m, check: m.status === 3
            }
          })
          this.log_info = res.data.log_info ? res.data.log_info : {
            status: '',
            userID: '',
            userName: '',
            updateTime: '',
            remark: ''
          }
          this.status_info = res.data.status_info ? res.data.status_info.map(m => m.status) : []
          const arr = res.data.stage_list || []
          arr.unshift({ stage_code: '0', stage_name: '全部数据', status: 0, noCkeck: true })
          arr.push({ stage_code: '-1', stage_name: '未配阶段', status: 0, noCkeck: true })
          this.stage_list = arr.map(m => {
            return {
              ...m,
              checked: m.status === 3, // 选中
              color: m.status === 3 ? 'blue' : m.status === 2 ? 'green' : '#606266',
              disabled: (m.status === 3) && this.checkPermission(['logisticsRegister:examine']) ? false : ((m.status !== 2) || (!this.checkPermission(['logisticsRegister:examine_f'])))// 是否可以操作终审
            }
          })
          this.$emit('changeLoading')
          this.tableLoading = false
        } catch (err) {
          this.$emit('changeLoading')
          this.tableLoading = false
        }
      })
    },
    statusFormat (datas, value) {
      const actions = []
      Object.keys(datas).map((key) => {
        if (datas[key].dict_value === (value)) {
          actions.push(datas[key].dict_label)
          return false
        }
      })
      return actions.join('')
    },
    // 改变物料阶段
    async buildStatusChange (val) {
      this.tableLoading = true
      const params = {
        project_code: this.form.projectCode,
        point_code: this.point.pointCode,
        stage_code: val ? val.stage_code : '',
        status: val.checked ? '3' : '2',
        user_id: Number(this.$store.state.userInfo.id)
      }
      const { code } = await this.$pub.post('device/stage/submit', params)
      if (code === 200) {
        this.$message({
          type: 'success',
          message: '操作成功',
          showClose: true
        })
        this.currentStage = null
        this.getList()
      } else {
        val.checked = false
        this.$message({
          type: 'error',
          message: '操作失败',
          showClose: true
        })
      }
      this.tableLoading = false
    },
    clickStage (i) {
      this.currentStage = i
      this.getList()
    },
    valiAnzhuangNum (val, i) {
      const reg = /[^\d]/g
      // const reg = /^(\+?)\d+(\.\d+)?$/g
      const regNums = val.regNums
      const finishNums = val.finishNums
      if (reg.test(finishNums)) {
        val.error = '数量必须为数字'
      } else if (Number(finishNums) > regNums) {
        val.error = '安装数量不能大于设计数量'
      } else {
        val.error = ''
      }
      this.$set(this.deviceLists, i, val)
    },
    // 保存
    async saveData () {
      if (!this.point) return
      const devices = this.deviceLists.filter(f => !(f.finishNums <= 0 && f.status === 0))
      let flag = true

      devices.some(s => {
        if (s.error) {
          flag = false
          return true
        }
      })

      if (!flag) {
        this.$message({
          type: 'error',
          message: '当前物料表有错，请修改后再保存',
          showClose: true
        })
        return
      }
      // 登记时安装数量=设计数量 status传2；安装数量小于设计数量 status传1，前提是this.deviceLists过滤掉status为0并且安装数量为0的物料
      const isStatus = (status, regNums, finishNums) => {
        let _status = status
        if (regNums === finishNums) {
          _status = '2'
        } else if (regNums > finishNums) {
          _status = '1'
        }
        return _status
      }
      const params = {
        project_code: this.projectCode,
        point_code: this.point.pointCode,
        user_id: Number(this.$store.state.userInfo.id),
        status: null,
        reg_type: 2,
        devices: devices.map(m => {
          if (m.status !== 3) {
            return {
              device_id: Number(m.id),
              reg_nums: Number(m.finishNums),
              status: isStatus(String(m.status), Number(m.regNums), Number(m.finishNums))
            }
          }
        }),
        build_status: this.status_info.join(','),
        remark: this.log_info.remark
      }
      const { code } = await this.$pub.post('/device/save-reg-info', params)
      if (code === 200) {
        this.$message({
          type: 'success',
          message: '保存成功',
          showClose: true
        })
        // 成功后刷新左侧列表点位
        this.getList()
      } else {
        this.$message({
          type: 'error',
          message: '保存失败',
          showClose: true
        })
      }
    },
    // 当行物料审核
    async checkRow (row) {
      console.log(row)
      this.tableLoading = true
      const params = {
        project_code: this.projectCode,
        point_code: this.point.pointCode,
        audit: row.status === 2 ? 3 : 2,
        device_id: Number(row.id)
      }
      const { code } = await this.$pub.post('device/check_device_status', params)
      if (code === 200) {
        this.$message({
          type: 'success',
          message: '操作成功',
          showClose: true
        })
        this.getList()
      } else {
        row.check = false
        this.$message({
          type: 'error',
          message: '操作失败',
          showClose: true
        })
      }
      this.tableLoading = false
    }
  }
}
</script>

<style lang='scss'>
.logExamineF,
.clover_logreg_container {
  .DeviceInformation {
    height: calc(100% - 30px);
    padding: 10px 0 0 10px;
    box-sizing: border-box;

    .info {
      margin-top: 10px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      flex-wrap: nowrap;
      color: #848484;
      font-weight: 500;
      margin-top: 10px;
      font-size: 14px;
    }

    .deviceTable {
      width: calc(100% - 180px);

      .noFinish {
        .el-input__inner {
          color: #f40;
        }
      }

      .isWeight {
        font-weight: 700;
      }

      .regWrap {
        position: relative;

        .tip {
          white-space: nowrap;
          position: absolute;
          padding: 4px 15px;
          border-radius: 2px;
          background: rgba(0, 0, 0, 0.6);
          color: #fff;
          top: 0px;
          left: -110px;
          display: none;
        }

        &:hover {
          .tip {
            display: block;
          }
        }
      }

      thead {
        color: #000;
      }

      .isTwo .el-checkbox__inner {
        border: 1px solid green;
      }
    }

    .checkGroupself {
      margin-top: 15px;
      // margin-left:10px;
      border-left: 1px solid #ededed;

      .el-checkboxs.isSelect {
        border-bottom: 1px solid #4478f1;

        .isLine {
          &:before {
            border: 1px solid #4478f1;
            background: #4478f1;
          }
        }
      }

      .el-checkbox__label {
        padding-left: 4px;
        display: none;
      }

      .el-checkboxs {
        border-bottom: 1px solid transparent;
        margin-left: 10px;
        margin-right: 0px;
        margin-bottom: 4px;
        display: flex;
        align-items: center;

        .isLine {
          padding: 4px 6px 4px 2px;
          font-size: 14px;
          cursor: pointer;
          margin-left: 4px;

          &:before {
            width: 1px;
            height: 10px;
            display: inline-block;
            border: 1px solid transparent;
            content: '';
            vertical-align: middle;
            margin-right: 4px;
          }
        }

        &:hover {
          .isLine {
            background: rgb(209, 230, 247);
          }
        }
      }
    }
  }
}
</style>
