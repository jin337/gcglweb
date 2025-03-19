<template>
  <div class="workorder" v-loading="loading">
    <el-form size="small" inline label-width="80px">
      <el-form-item label="项目">
        <el-select v-model="form.project" placeholder="请选择" clearable style="width:220px;" size="small"
          @clear="handleQuery" @change="handleProjectChange" value-key="id">
          <el-option v-for="item in projectList" :key="item.id" :label="item.projectName" :value="item"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="关键字">
        <el-input v-model="form.content" placeholder="点位编码、名称、IP地址" @clear="handleQuery" clearable size="small"
          style="width:220px;"></el-input>
      </el-form-item>
      <el-form-item label="故障类型">
        <el-select v-model="form.fault_type" clearable placeholder="请选择" style="width:220px;" @clear="handleQuery">
          <el-option v-for="item in faultTypeList" :key="item.id" :label="item.label" :value="item.value" />
        </el-select>
      </el-form-item>
      <el-form-item label="处理状态">
        <el-select v-model="form.status" clearable placeholder="请选择" style="width:220px;" @clear="handleQuery">
          <el-option v-for="item in statusList" :key="item.value" :label="item.label" :value="item.value" />
        </el-select>
      </el-form-item>
      <el-form-item label="派发单位">
        <treeselect style="width:220px;" v-model="form.assign_dept" :normalizer="normalizer" placeholder="输入搜索词查询部门"
          :options="deptOptions" />
      </el-form-item>
      <!-- <el-form-item label="区域">
        <el-select v-model="form.area" multiple collapse-tags clearable style="width:220px;" placeholder="默认所有区域"
          @clear="handleQuery">
          <el-option v-for="item in areaList" :key="item.key" :label="item.value" :value="item.key">
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="子系统">
        <el-select v-model="form.child_code" multiple clearable collapse-tags style="width:220px;" placeholder="默认所有子系统"
          @clear="handleQuery">
          <el-option v-for="item in childList" :key="item.key" :label="item.value" :value="item.key">
          </el-option>
        </el-select>
      </el-form-item> -->
      <el-form-item label="完工时间" prop="time">
        <el-date-picker v-model="form.completeTime" type="datetimerange" align="right" unlink-panels range-separator="至"
          start-placeholder="开始时间" end-placeholder="结束时间" value-format="yyyy-MM-dd" style="width:220px;">
        </el-date-picker>
      </el-form-item>

      <el-form-item class="add">
        <el-button type="primary" @click="handleQuery">查询</el-button>
        <el-button @click="handleAdd">新建</el-button>
        <!-- <el-button type="primary" @click="exportExcel" :loading="exportLoading" v-if="form.project_code">导出</el-button> -->
      </el-form-item>
    </el-form>

    <el-table ref="table" v-loading="tableLoading" :data="tableData" :height="tableHeight" style="width: 100%"
      :header-row-style="{ height: '36px' }" :row-style="{ height: '36px' }" :cell-style="{ padding: '0px' }" border>
      <el-table-column prop="fault_order_code" label="工单编号" align="center" />
      <!-- <el-table-column prop="faultCount" label="报障点位数量" align="center" width="120" />
      <el-table-column prop="device_count" label="报障设备数量" width="120px" align="center">
        <template slot-scope="scope">
          <span style="cursor:pointer;" @click="showdevice(scope.row)">{{ scope.row.device_count }}</span>
        </template>
</el-table-column> -->
      <el-table-column prop="fault_dept_name" label="接单部门" show-overflow-tooltip></el-table-column>
      <el-table-column prop="create_user_name" label="派发人" align="center"></el-table-column>
      <el-table-column prop="create_time" label="派单时间" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.create_time ? parseTime(scope.row.create_time) : '' }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="status_name" label="状态" align="center">
        <template slot-scope="scope">
          <span>{{ statusList[scope.row.status].label }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="fault_order_desc" label="备注" align="center"></el-table-column>
      <el-table-column label="操作" width="140px">
        <template slot-scope="scope">
          <el-button size="mini" type="text" @click="handleEdit(scope.row)" v-if="scope.row.status !== 2">编辑</el-button>
          <el-button size="mini" type="text" @click="handleDispose(scope.row)"
            v-if="scope.row.status === 1">处理</el-button>
          <el-button size="mini" type="text" @click="handleInfo(scope.row)"> 详情</el-button>
          <el-button size="small" type="text" @click="handleDelete(scope.row)">删除</el-button>
          <el-button size="mini" type="text" @click="handlePrint(scope.row)"
            v-if="scope.row.status === 2">打印</el-button>
        </template>
      </el-table-column>
    </el-table>

    <div style="display:flex;justify-content:space-between;">
      <span style="color:#999;font-size:14px;">共 {{ total }} 条记录</span>
      <el-pagination layout="prev, pager, next,sizes" :total="total" :page-size.sync="page.page_size"
        @current-change="pageChange" @size-change="sizeChange" :current-page.sync="page.page_no" class="pagination"
        small background>
      </el-pagination>
    </div>

    <!-- 设备列表 -->
    <el-dialog title="" :visible.sync="deviceFlag" width="1100px" append-to-body custom-class="device_fault_work">
      <device-list v-if="deviceFlag" :presentId="presentId" :deviceFlag.sync="deviceFlag"></device-list>
    </el-dialog>

    <!-- 新建工单 -->
    <el-dialog :title="isEdit ? '编辑工单' : '新建工单'" @close="getList" :visible.sync="addorderFlag" width="900px"
      append-to-body custom-class="dis_fault_work">
      <build-order v-if="addorderFlag" :buildFlag.sync="addorderFlag" :projectList="projectList"
        :project_code="form.project_code" :childList="childList" :areaList="areaList" :faultTypeList="faultTypeList"
        :isEdit="isEdit" :currentOrder="currentData"></build-order>
    </el-dialog>

    <!-- 工单处理  工单详情 -->
    <el-dialog :title="isInfo ? '工单处理详情' : '工单处理'" @close="getList" :visible.sync="disposeFlag" width="1200px"
      append-to-body custom-class="dis_fault_work">
      <dispose-order v-if="disposeFlag" :disposeFlag.sync="disposeFlag" :isOpear="!isInfo" :currentData="currentData"
        :faultTypeList="faultTypeList"></dispose-order>
    </el-dialog>

  </div>
</template>

<script>
import { checkPermission, downloadFile, parseTime } from '@/utils/tool'
import deviceList from './deviceList.vue'
import buildOrder from './buildOrder.vue'
import disposeOrder from './disposeOrder.vue'

export default {
  name: 'faultoperaworkorder',
  data () {
    return {
      loading: false,
      form: {
        project: null,
        project_id: null,
        project_code: null,
        content: '',
        completeTime: null,
        status: null,
        assign_dept: null,
        fault_type: ''
        // child_code: [],
        // area: []
      },
      statusList: [// 顺序不能动，回显
        { label: '生成', value: 0 }, { label: '下发', value: 1 }, { label: '完工', value: 2 }
      ],
      faultTypeList: [],
      childList: [],
      areaList: [],
      deptOptions: [],
      total: 0,
      page: {
        page_no: 1,
        page_size: 10
      },
      projectList: [],
      tableLoading: false,
      tableData: [],
      tableHeight: window.innerHeight - 230,
      currentData: null,
      presentId: null, // 目前操作的id
      deviceFlag: false,
      addorderFlag: false,
      disposeFlag: false,
      isInfo: false, // 工单处理界面的详情点击进去不允许修改东西
      exportLoading: false,
      isEdit: false// 新建页面的修改
    }
  },
  created () {
    // this.getfault_order_status()
    this.getfault_type()
    this.getProjectList()
    this.getDept()
  },
  mounted () {
    this.getTableHeight()
    window.addEventListener('resize', () => this.getTableHeight())
  },
  components: {
    deviceList, // 设备列表
    buildOrder, // 新建工单
    disposeOrder// 工单处理
    // infoOrder // 工单详情
  },
  methods: {
    checkPermission,
    parseTime,
    async getProjectList () {
      try {
        const have = this.checkPermission(['pointAuthorization:project-slt'])
        let url = '/project/project-list-by-user'
        let params = {
          user_id: this.$store.state.userInfo.id
        }

        if (have) { // ischeckAllproject表示是否需要校验
          url = '/project/list-slt'
          params = { content: '' }
        }

        const result = await this.$pub.post(url, params)
        if (result.code === 200) {
          if (result.data !== null) {
            this.projectList = (result.data).map(m => {
              return {
                ...m,
                projectCode: m.projectCode ? m.projectCode : m.project_code,
                projectName: m.projectName ? m.projectName : m.project_name
              }
            })
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
    async getChildList () {
      if (!this.form.project_code) {
        return this.$message({
          message: '必须选择一个项目进行查询',
          type: 'error',
          showClose: true,
          customClass: 'uploadMessage'
        })
      }
      try {
        const { data, code, message } = await this.$pub.post('project/child-list', { project_id: this.form.project_id })
        if (code === 200) {
          this.childList = data || []
        } else {
          this.childList = []
          this.$notify.error({
            title: '查询失败',
            message: message
          })
        }
      } catch (e) {
        this.$notify.error({
          title: '服务器请求失败',
          message: e.message
        })
      }
    },
    async getAreaList () {
      if (!this.form.project_code) {
        return this.$message({
          message: '必须选择一个项目进行查询',
          type: 'error',
          showClose: true,
          customClass: 'uploadMessage'
        })
      }
      try {
        const { data, code, message } = await this.$pub.post('/project/area-list', { project_id: this.form.project_id })
        if (code === 200) {
          this.areaList = data || []
        } else {
          this.areaList = []
          this.$notify.error({
            title: '查询失败',
            message: message
          })
        }
      } catch (e) {
        this.$notify.error({
          title: '服务器请求失败',
          message: e.message
        })
      }
    },
    // 故障状态
    getfault_order_status () {
      this.$dict(this, 'fault_order_status').then(res => {
        if (res.code === 200) {
          this.dict.status = (res.data || []).map(m => {
            return {
              value: Number(m.value),
              label: m.label
            }
          })
        } else {
          this.$message({
            type: 'error',
            message: '字典获取出错了fault_order_status',
            showClose: true
          })
          this.dict.status = []
        }
      })
    },
    // 故障类型
    getfault_type () {
      this.$dict(this, 'fault_type').then(res => {
        if (res.code === 200) {
          this.faultTypeList = (res.data || []).map(m => {
            return {
              value: Number(m.value),
              label: m.label
            }
          })
        } else {
          this.$message({
            type: 'error',
            message: '字典获取出错了fault_type',
            showClose: true
          })
          this.faultTypeList = []
        }
      })
    },
    async getDept () {
      const { data, code } = await this.$pub.post('/sys/dept/list-tree', { mc: '' })
      if (code !== 200) {
        return this.$message({
          type: 'error',
          message: '获取部门出错了',
          showClose: true
        })
      }
      const datas = Array.isArray(data.dept) ? data.dept : data.dept.child
      this.deptOptions = datas
    },
    normalizer (node) { /** 转换菜单数据结构 */
      if (node.child && !node.child.length) {
        delete node.child
      }
      return {
        id: node.id,
        label: node.mc,
        children: node.child
      }
    },
    handleProjectChange (val) {
      this.form.project_code = val.projectCode
      this.form.project_id = val.id
      // this.form.area = []
      // this.form.child_code = []
      this.childList = []
      this.areaList = []
      this.getAreaList()
      this.getChildList()
      this.handleQuery()
    },
    async getList () {
      if (!this.form.project_code) {
        return this.$message({
          message: '必须选择一个项目进行查询',
          type: 'error',
          showClose: true,
          customClass: 'uploadMessage'
        })
      }
      this.tableLoading = true
      const completeTime = this.form.completeTime || []
      const params = {
        ...this.form,
        status: this.form.status === null ? -1 : this.form.status,
        complete_begin_time: completeTime[0] ? completeTime[0] + ' 00:00:00' : null,
        complete_end_time: completeTime[1] ? completeTime[1] + ' 23:59:59' : null,
        fault_type: this.form.fault_type ? this.form.fault_type : 0, // 故障类型
        assign_dept: this.form.assign_dept ? this.form.assign_dept : 0, // 派单部门

        project_code: this.form.project_code,
        page_no: this.page.page_no,
        page_size: this.page.page_size

      }
      const { data, code } = await this.$pub.post('/point/order/list', params)
      this.tableLoading = false
      if (code !== 200) {
        this.total = 0
        this.tableData = []
        return this.$message({
          message: '获取列表出错了',
          type: 'error',
          showClose: true
        })
      }
      this.total = data.total
      this.tableData = data.list || []
    },
    getTableHeight () {
      this.$nextTick(() => {
        const el_wrap = document.getElementsByClassName('workorder')[0]
        if (el_wrap) {
          const el_form = el_wrap.getElementsByClassName('el-form')[0]
          const el_formh = el_form.offsetHeight
          this.tableHeight = el_wrap.offsetHeight - (el_formh + 90)
        }
      })
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
    // 点击报障设备数量 展示设备列表
    showdevice (row) {
      this.presentId = row.id
      this.deviceFlag = true
    },
    // 新建
    handleAdd () {
      if (!this.form.project_code) {
        return this.$message({
          message: '先选择一个项目',
          type: 'error',
          showClose: true,
          customClass: 'uploadMessage'
        })
      }
      this.currentData = null
      this.isEdit = false
      this.addorderFlag = true
    },
    // 工单编辑
    handleEdit (row) {
      this.isEdit = true
      this.addorderFlag = true
      this.currentData = { ...row }
    },
    // 工单处理
    handleDispose (row) {
      this.isInfo = false
      this.disposeFlag = true
      this.currentData = { ...row }
    },
    // 详情
    handleInfo (row) {
      this.isInfo = true
      this.disposeFlag = true
      this.currentData = { ...row }
    },
    handleDelete (row) {
      const id = row.id
      this.$confirm('是否确认删除"' + row.fault_order_code + '"的数据?', '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {
        const { code, message } = await this.$pub.post('/point/order/del', { id })
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
      }).catch(function () { })
    },
    // 打印
    handlePrint (row) {
      this.loading = true
      const params = { order_id: row.id }
      this.$pub.post(
        '/point/order/print',
        params,
        {
          responseType: 'arraybuffer' // 一定要设置响应类型，否则页面会是空白pdf
        }
      ).then(result => {
        const binaryData = []
        binaryData.push(result)
        // 获取blob链接
        const pdfUrl = window.URL.createObjectURL(new Blob(binaryData, { type: 'application/pdf' }))
        window.open(pdfUrl)
        this.loading = false
      }).catch(() => {
        this.loading = false
      })
    },
    async exportExcel () {
      if (!this.form.project_code) {
        return this.$message({
          message: '必须选择一个项目进行查询',
          type: 'error',
          showClose: true,
          customClass: 'uploadMessage'
        })
      }
      this.exportLoading = true
      const completeTime = this.form.completeTime || []
      const params = {
        ...this.form,
        complete_begin_time: completeTime[0] ? completeTime[0] + ' 00:00:00' : null,
        complete_end_time: completeTime[1] ? completeTime[1] + ' 23:59:59' : null,
        fault_type: this.form.fault_type ? this.form.fault_type : 0, // 故障类型
        assign_dept: this.form.assign_dept ? this.form.assign_dept : 0, // 派单部门
        page_no: this.page.page_no,
        page_size: this.page.page_size
      }
      const result = await this.$pub.post(
        '/point/fault/order-list-exp',
        params,
        {
          headers: {
            'Content-Type': 'application/x-download'
          },
          responseType: 'blob'
        }
      )
      const title = this.form.project_code + '工单列表'
      downloadFile(result, title, 'xlsx')
      this.exportLoading = false
    }
  }
}
</script>

<style lang='scss'>
.workorder {
  padding: 20px;
  height: 100%;
  width: 100%;
  box-sizing: border-box;
  min-width: 1400px;
  overflow: auto;

  .table {
    margin-top: 20px;
  }

  .el-table__header th {
    background-color: #f8f8f9;
    color: #606266;
  }

  .el-form {
    display: flex;
    flex-wrap: wrap;

    .add {
      margin-left: auto;
    }

  }
}

.pub_fault {
  .el-dialog__header {
    display: none;
  }

  h3 {
    margin: 10px 0 20px;
  }

  .el-descriptions-item__label {
    width: 88px;
    font-size: 14px;
  }

  .n-content {
    width: 548px;
    border-radius: 4px;
  }

  .btns {
    text-align: right;
    margin-top: 20px;
  }

  .error {
    color: #f56c6c;
    display: block;
    // height:20px;
  }

  .el-form {
    margin-top: 20px;
  }

  .required {
    &:before {
      content: "*";
      color: #f56c6c;
      margin-right: 4px;
    }
  }

  .img {
    width: 80px;
    height: 80px;
    margin-right: 10px;
  }
}

.dis_fault_work {
  margin: 20px auto !important;
}
</style>
