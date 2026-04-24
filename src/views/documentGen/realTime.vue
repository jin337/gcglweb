<template>
  <div class="realtimep">
    <div class="_top">
      <el-select
        v-model="searchstatus"
        placeholder="请选择项目状态"
        value-key="id"
        @change="handleStatusChange"
        clearable
        size="mini"
      >
        <el-option
          v-for="item in statusList"
          :key="item.value"
          :label="item.label"
          :value="item.value"
        >
        </el-option>
      </el-select>
      <el-button @click="refresh"  size="mini" style="margin-left:10px">刷新</el-button>
      <el-button type="primary" @click="add" size="mini" style="float:right;">新增</el-button>
    </div>

    <el-table
      :data="tableData"
      border
      style="width: 100%"
      :row-style="{ height: '30px' }"
      :cell-style="{ padding: '0px' }"
      :height="tableHeight"
      v-loading="tableLoading"
    >
      <af-table-column
        prop="id"
        label="编号"
        align="center"
        width="80px"
      >
      </af-table-column>
      <af-table-column prop="file_name" label="文件名" align="center" width="220px"></af-table-column>
      <el-table-column prop="create_time" label="创建时间" align="center" width="170px">
        <template slot-scope="scope">
          <span>{{ moment(scope.row.create_time).format('YYYY-MM-DD HH:mm:ss') }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="end_time" label="结束时间" align="center"  width="170px">
        <template slot-scope="scope">
          <span v-if="scope.row.status != 1">{{ moment(scope.row.end_time).format('YYYY-MM-DD HH:mm:ss') }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="status" label="状态" width="70px" align="center">
        <template slot-scope="scope">
          <span v-if="scope.row.status === 1" style="color: orange">已创建</span>
          <span v-if="scope.row.status === 2" style="color: green">已生成</span>
          <span v-if="scope.row.status === 3" style="color: red">错误</span>
        </template>
      </el-table-column>
      <el-table-column prop="message" label="执行信息" align="center">
      </el-table-column>
      <el-table-column
        prop="query_para"
        label="查询参数"
        align="center"
        style="display: flex; justify-content: space-around;"
        width="100px"
      >
        <template slot-scope="scope">
          <el-tooltip
            effect="dark"
            :content="scope.row.query_para"
            placement="top"
            :enterable="false"
            style="margin-left:8px"
          >
            <span style="border-bottom: 1px solid #719bff">参数</span>
          </el-tooltip>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" width="80px">
        <template slot-scope="scope">
          <a :href="scope.row.ftp_path.substr(0, scope.row.ftp_path.length - 1)" target="_blank" v-if="scope.row.status === 2 && scope.row.ftp_path"  style="border-bottom: 1px solid #719bff ;text-decoration: none;">下载</a>
        </template>
      </el-table-column>
    </el-table>

    <el-dialog title="实时进度新增" width="550px"  :visible.sync="addFlag" class="realtime_di">
      <el-form ref="addForm" size="small" label-position="right" label-width="78px" :rules="rules" :model="form" v-if="addFlag">
        <el-form-item label="项目" prop="project">
          <el-select
            v-model="form.project"
            placeholder="请选择"
            style="width:100%"
            value-key="id"
            @change="handleProjectChange"
          >
            <el-option
              v-for="item in projects"
              :key="item.id"
              :label="item.projectName"
              :value="item"
            >
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="起止时间" prop="time">
          <el-date-picker
            @change="timeChange"
            :picker-options="pickerOptions"
            v-model="form.time"
            type="daterange"
            align="right"
            unlink-panels
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            value-format="yyyy-MM-dd"
            style="width: 100%">
          </el-date-picker>
        </el-form-item>
        <el-form-item label="设备类型" prop="device_type">
          <el-select
            v-model="form.device_type"
            multiple
            clearable
            style="width: 100%"
            placeholder="默认所有设备类型"
          >
            <el-option
              v-for="item in device_typeList"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            >
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="子系统">
          <el-select
            v-model="form.child_code"
            multiple
            clearable
            style="width:100%"
            placeholder="默认所有子系统"
          >
            <el-option
              v-for="item in childs"
              :key="item.key"
              :label="item.value"
              :value="item.key"
            >
            </el-option>
          </el-select>
        </el-form-item>
      </el-form>
      <div style="margin-top:30px;padding-bottom:30px;">
        <el-button
          style="float: right;"
          type="primary"
          @click="submit"
          v-loading="submitloading"
        >确认生成</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import mixin from '@/mixins/common.js'
import moment from 'moment'
export default {
  name: 'realTime',
  mixins: [mixin],
  data () {
    return {
      searchstatus: null,
      statusList: [],
      tableData: [],
      tableHeight: window.innerHeight - 180,
      tableLoading: false,
      addFlag: false,
      form: {
        project: null,
        device_type: [],
        time: null,
        child_code: []
      },
      rules: {
        project: [
          { required: true, message: '请选择项目', trigger: 'change' }
        ],
        time: [
          { required: true, message: '请选择起止时间', trigger: 'change' }
        ]
      },
      device_typeList: [],
      submitloading: false,
      pickerMinDate: null, // 第一次选中的时间
      pickerOptions: {
        onPick: (obj) => {
          this.pickerMinDate = new Date(obj.minDate).getTime()
        },
        disabledDate: (time) => {
          const day30 = 30 * 24 * 3600 * 1000
          const limit = Date.now() - day30
          if (this.pickerMinDate) {
            let maxTime = this.pickerMinDate + day30
            const minTime = this.pickerMinDate - day30
            if (maxTime > Date.now()) {
              maxTime = Date.now()
            }

            return time.getTime() > maxTime || time.getTime() < minTime
          } else {
            return time.getTime() > Date.now() || time.getTime() < limit // 设置禁止选今天以后的日子,只能选择今天之前30天
          }
        }
      }
    }
  },
  computed: {

  },
  mounted() {
    this.getStatus()
    this.refresh()
    this.getDevice_type()
    window.onresize = () => {
      this.tableHeight = window.innerHeight - 180
    }
  },
  methods: {
    moment,
    getStatus() {
      this.$dict(this, 'documentStatus').then(res => {
        if (res.code === 200) {
          this.statusList = (res.data || []).map(m => {
            return {
              value: Number(m.value),
              label: m.label
            }
          })
        } else {
          this.$message({
            type: 'error',
            message: '字典获取出错了documentStatus',
            showClose: true
          })
          this.statusList = []
        }
      })
    },
    async handleStatusChange() {
      this.tableLoading = true
      const params = this.searchstatus ? {
        user_id: this.$store.state.userInfo.id,
        gen_type: 8,
        status: this.searchstatus
      } : {
        user_id: this.$store.state.userInfo.id,
        gen_type: 8
      }
      const { data } = await this.$pub.post('/gen/gen-list', params)
      this.tableData = data || []
      this.tableLoading = false
    },
    refresh() {
      this.handleStatusChange()
    },
    add() {
      this.form = {
        project: null,
        device_type: [],
        time: null,
        child_code: []
      }
      this.addFlag = true

      this.childs = []
      this.getChildList()
    },
    // 新增 start
    handleProjectChange() {
      const obj = {
        device_type: [],
        time: null,
        child_code: []
      }
      Object.assign(this.form, obj)
      this.childs = []
      this.getChildList()
    },
    async getDevice_type() {
      this.$dict(this, 'device_type').then(res => {
        if (res.code === 200) {
          this.device_typeList = (res.data || []).map(m => {
            return {
              value: Number(m.value),
              label: m.label
            }
          })
        } else {
          this.$message({
            type: 'error',
            message: '字典获取出错了device_type',
            showClose: true
          })
          this.device_typeList = []
        }
      })
    },
    timeChange() {
      if (!this.form.time) {
        this.pickerMinDate = null
      }
    },
    async submit() {
      try {
        this.$refs.addForm.validate(async valid => {
          if (valid) {
            const time = this.form.time || []
            this.submitloading = true
            const query_info = {
              project_code: this.form.project.projectCode,
              begin_time: time[0] ? time[0] : null,
              end_time: time[1] ? time[1] : null,
              device_type: this.form.device_type.length > 0 ? this.form.device_type : this.device_typeList.map(m => m.value),
              child_code: this.form.child_code.length > 0 ? this.form.child_code : this.childs.map(m => m.key)
            }
            const { data, code, message } = await this.$pub.post('/gen/point_progress', query_info)
            if (code !== 200) {
              this.$message({
                message: message,
                type: 'info',
                showClose: true,
                customClass: 'uploadMessage'
              })
            } else {
              this.$message({
                message: data,
                type: 'success',
                showClose: true,
                customClass: 'uploadMessage'
              })
              this.addFlag = false
              this.refresh()
            }
            this.submitloading = false
          }
        })
      } catch (err) {}
    }
  }
}
</script>

<style lang="scss">

.realtimep{
  ._top{
    padding:4px 0;
  }
  .wrap_up{
    position: relative;
    display:flex;
    &>div{
      width:360px;
    }
  }
}
.realtime_di{
  .el-input.is-disabled .el-input__inner{
    color: #7a7b7e;
    background-color: #f8f8fc;
  }
  .el-tag.el-tag--info{
    color: #7a7b7e;
    background-color: #f8f8fc;
    cursor: not-allowed;
  }
}
</style>
