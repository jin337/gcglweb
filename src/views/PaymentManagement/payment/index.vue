<template>
  <!-- 付款管理 -->
  <div class="payment">
    <el-form size="small" :inline="true">
      <el-form-item label="项目">
        <el-select v-model="form.pay_project_code" placeholder="请选择" filterable @change="getList">
          <el-option v-for="item in projectList" :key="item.projectCode" :label="item.projectName"
            :value="item.projectCode"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="关键字">
        <el-input v-model="form.keyword" clearable @clear="getList" @keyup.enter.native="getList"></el-input>
      </el-form-item>
      <el-form-item label="周期">
        <el-date-picker v-model="form.time" type="daterange" align="right" unlink-panels range-separator="至"
          start-placeholder="开始日期" end-placeholder="结束日期" style="width:220px;" value-format="yyyy-MM-dd"
          :picker-options="pickerOptions">
        </el-date-picker>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="getList" :loading="tableLoading">查询</el-button>
        <el-button @click="handleAdd" v-hasPermi="['payment:opera']">新增</el-button>
      </el-form-item>
    </el-form>

    <el-table :data="tableData" v-loading="tableLoading" :height="tableHeight" border style="width: 100%;">
      <el-table-column type="index" label="序号" width="60" align="center"></el-table-column>
      <el-table-column prop="pay_project_code" label="所属项目" width="200" :show-overflow-tooltip="true"
        align="center"></el-table-column>
      <el-table-column prop="pay_title" label="标题" width="200" :show-overflow-tooltip="true"
        align="center"></el-table-column>
      <el-table-column prop="pay_content" label="描述" align="center" :show-overflow-tooltip="true"></el-table-column>
      <el-table-column prop="nums" label="点位数量" width="120" align="center"></el-table-column>
      <el-table-column prop="submit_nums" label="维护数量" width="120" align="center"></el-table-column>
      <el-table-column prop="pay_status" label="状态" width="120" align="center">
        <template slot-scope="scope">
          <span> {{ scope.row.pay_status != '9' ? '正常' : '已归档' }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="pay_type_name" label="付款类型" width="120" :show-overflow-tooltip="true"
        align="center"></el-table-column>
      <el-table-column prop="create_user" label="操作人" width="120" :show-overflow-tooltip="true"
        align="center"></el-table-column>
      <el-table-column prop="create_time" label="操作时间" width="190" :show-overflow-tooltip="true" align="center">
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.create_time) }}</span>
        </template>
      </el-table-column>
      <!-- <el-table-column prop="status" label="状态" width="80" align="center"></el-table-column> -->
      <el-table-column prop="opera" label="操作" width="220px" align="center">
        <template slot-scope="scope">
          <el-button type="text" @click="handleMaintain(scope.row)" v-hasPermi="['payment:opera']">{{ scope.row.pay_status
            === '9' ? '详情' : '审核' }}</el-button>
          <el-button type="text" v-if="scope.row.pay_status != '9' && checkPermission(['payment:opera'])"
            @click="handleEdit(scope.row)">编辑</el-button>
          <el-button type="text" v-if="scope.row.pay_status != '9' && checkPermission(['payment:opera'])"
            @click="handleDel(scope.row)">删除</el-button>
          <el-button type="text" v-if="scope.row.pay_status != '9' && checkPermission(['payment:opera'])"
            @click="handleFile(scope.row, '9')">归档</el-button>
          <el-button type="text" v-if="scope.row.pay_status === '9' && checkPermission(['payment:canclefile'])"
            @click="handleFile(scope.row, '0')">取消归档</el-button>
          <el-button type="text" @click="handleExport(scope.row)">导出</el-button>
        </template>
      </el-table-column>
    </el-table>
    <!-- <div style="display:flex;justify-content:space-between;">
      <span  style="color:#999;font-size:14px;">共 {{total}} 条记录</span>
      <el-pagination
        layout="prev, pager, next,sizes"
        :total="total"
        :page-size.sync="page.page_size"
        @current-change="pageChange"
        @size-change="sizeChange"
        :current-page.sync="page.page_no"
        class="pagination"
        small
        background
      >
      </el-pagination>
    </div> -->

    <!-- 新增 编辑 -->
    <el-dialog :title="current ? '编辑' : '新增'" :visible.sync="operaFlag" width="650px" custom-class="payment_opera"
      :append-to-body="true">
      <opera :current="current" :projectList="projectList" :operaFlag.sync="operaFlag" @handleQuery="getList"
        v-if="operaFlag"></opera>
    </el-dialog>

    <!-- 审核 -->
    <el-drawer :visible.sync="maintainFlag" size="90%" custom-class="payment_maintain" :append-to-body="true">
      <maintain :current="current" :maintainFlag.sync="operaFlag" @handleQuery="getList" v-if="maintainFlag"></maintain>
    </el-drawer>
  </div>
</template>

<script>
import opera from './opera.vue'
import maintain from './maintain.vue'
import { parseTime, checkPermission, downloadFile } from '@/utils/tool'
export default {
  name: 'PaymentManagement_payment',
  data () {
    return {
      form: {
        pay_project_code: '',
        keyword: '',
        time: null
      },
      projectList: [],
      tableLoading: false,
      tableData: [],
      tableHeight: window.innerHeight - 200,
      total: 0,
      page: {
        page_no: 1,
        page_size: 10
      },
      pickerOptions: {
        shortcuts: [
          {
            text: '今天',
            onClick (picker) {
              const end = new Date()
              const start = new Date()
              picker.$emit('pick', [start, end])
            }
          },
          {
            text: '昨天',
            onClick (picker) {
              const curdate = new Date()
              const end = curdate.setDate(curdate.getDate() - 1)
              const start = new Date(end)
              // start.setTime(start.getTime() - 3600 * 1000 * 24 * 7);
              picker.$emit('pick', [start, start])
            }
          },
          {
            text: '本周',
            onClick (picker) {
              const now = new Date() // 当前日期
              const nowDayOfWeek = now.getDay() // 今天本周的第几天
              const nowDay = now.getDate() // 当前日
              const nowMonth = now.getMonth() // 当前月
              var nowYear = now.getYear() // 当前年
              nowYear += nowYear < 2000 ? 1900 : 0 //
              const end = new Date(
                nowYear,
                nowMonth,
                nowDay + (7 - nowDayOfWeek)
              )
              const start = new Date(
                nowYear,
                nowMonth,
                nowDay - nowDayOfWeek + 1
              )
              // start.setTime(start.getTime() - 3600 * 1000 * 24 * 7);
              picker.$emit('pick', [start, end])
            }
          },
          {
            text: '本月',
            onClick (picker) {
              const now = new Date() // 当前日期
              const nowMonth = now.getMonth() // 当前月
              var nowYear = now.getYear() // 当前年
              nowYear += nowYear < 2000 ? 1900 : 0 //
              var lastMonthDate = new Date() // 上月日期
              lastMonthDate.setDate(1)
              lastMonthDate.setMonth(lastMonthDate.getMonth() - 1)

              var monthStartDate = new Date(nowYear, nowMonth, 1)
              var monthEndDate = new Date(nowYear, nowMonth + 1, 1)
              var days =
                (monthEndDate - monthStartDate) / (1000 * 60 * 60 * 24)

              const end = new Date(nowYear, nowMonth, days)
              const start = new Date(nowYear, nowMonth, 1)
              // start.setTime(start.getTime() - 3600 * 1000 * 24 * 7);
              picker.$emit('pick', [start, end])
            }
          },
          {
            text: '最近一周',
            onClick (picker) {
              const end = new Date()
              const start = new Date()
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 7)
              picker.$emit('pick', [start, end])
            }
          },
          {
            text: '最近一个月',
            onClick (picker) {
              const end = new Date()
              const start = new Date()
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 30)
              picker.$emit('pick', [start, end])
            }
          },
          {
            text: '最近三个月',
            onClick (picker) {
              const end = new Date()
              const start = new Date()
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 90)
              picker.$emit('pick', [start, end])
            }
          }
        ]
      },
      operaFlag: false, // 新增 编辑
      maintainFlag: false, // 审核
      current: null
    }
  },
  computed: {

  },
  created () {
    this.getProjectList()
  },
  mounted () {
    window.onresize = () => {
      this.tableHeight = window.innerHeight - 200
    }
  },
  components: {
    opera, maintain
  },
  methods: {
    parseTime,
    checkPermission,
    async getProjectList () {
      try {
        const params = {
          user_id: this.$store.state.userInfo.id
        }
        const result = await this.$pub.post('/project/project-list-by-user', params)
        if (Number(result.code) === 200) {
          if (result.data !== null) {
            this.projectList = result.data
          } else {
            this.projectList = []
          }
        } else {
          this.$notify.error({
            title: '查询失败',
            message: result.message
          })
        }
      } catch (e) {
        this.$notify.error({
          title: '服务器请求失败',
          message: e.message
        })
      }
    },
    async getList () {
      if (!this.form.pay_project_code) {
        return this.$message({
          type: 'error',
          message: '项目未选择,请先选择项目',
          showClose: true
        })
      }
      this.tableLoading = true
      const time = this.form.time || []
      const params = {
        keyword: this.form.keyword,
        pay_project_code: this.form.pay_project_code,
        begin_time: time[0] ? time[0] + ' 00:00:00' : '',
        end_time: time[1] ? time[1] + ' 23:59:59' : ''
        // page_no: this.page.page_no,
        // page_size: this.page.page_size
      }

      const { code, data, message } = await this.$pub.post('project/pay/list', params)
      this.tableLoading = false
      if (code !== 200) {
        this.tableData = []
        this.total = 0
        return this.$message({
          type: 'error',
          message: message || '查询出错了',
          showClose: true
        })
      } else {
        this.tableData = data.list || []
        // this.total = data.total
      }
    },
    handleQuery () {
      this.page.page_no = 1
      this.getList()
    },
    pageChange (num) {
      this.page.page_no = num
      this.getList()
    },
    sizeChange (val) {
      this.page.page_size = val
      this.getList()
    },
    handleAdd () {
      this.operaFlag = true
      this.current = null
    },
    handleMaintain (row) {
      this.maintainFlag = true
      this.current = row
    },
    handleEdit (row) {
      this.operaFlag = true
      this.current = row
    },
    handleDel (row) {
      const id = row.id
      this.$confirm('确定删除吗?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {
        const { code, message } = await this.$pub.post('project/pay/del', { id })
        if (code === 200) {
          this.getList()
          this.$message({
            type: 'success',
            message: message || '删除成功',
            showClose: true
          })
        } else {
          this.$message({
            type: 'error',
            message: message || '删除失败',
            showClose: true
          })
        }
      }).catch(() => {
        this.$message({
          type: 'info',
          message: '已取消删除',
          showClose: true
        })
      })
    },
    handleFile (row, status) {
      this.$confirm('确定归档吗?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => { // 0解除 9归档
        const { code, message } = await this.$pub.post('project/pay/edit-status', { id: row.id, pay_status: status })
        if (code === 200) {
          this.getList()
          this.$message({
            type: 'success',
            message: message || '归档成功',
            showClose: true
          })
        } else {
          this.$message({
            type: 'error',
            message: message || '归档失败',
            showClose: true
          })
        }
      }).catch(() => {
      })
    },
    async handleExport (row) {
      this.tableLoading = true
      const params = {
        pay_id: row.id
      }
      const result = await this.$pub.post(
        'project/pay/export-doc',
        params,
        {
          headers: {
            'Content-Type': 'application/x-download'
          },
          responseType: 'blob'
        }
      )
      const title = row.pay_project_code + '-' + row.pay_title + '付款信息'
      downloadFile(result, title, 'xlsx')
      this.tableLoading = false
    }
  }
}
</script>

<style lang="scss">
.payment {
  padding: 20px 20px 0 20px;
  box-sizing: border-box;

  .el-table {
    .el-button {
      padding: 0;
    }
  }

  .pagination {
    padding-right: 0px;

    .el-pagination__sizes {
      margin-right: 0px;
    }

    .el-select .el-input {
      margin-right: 0px;
    }
  }
}
</style>
