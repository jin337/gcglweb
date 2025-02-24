<template>
  <div class="workorder">
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
          <el-option v-for="item in dict.fault_type" :key="item.id" :label="item.label" :value="item.value" />
        </el-select>
      </el-form-item>
      <el-form-item label="工单类型">
        <el-select v-model="form.fault_order_type" clearable placeholder="请选择" style="width:220px;" @clear="handleQuery">
          <el-option v-for="item in dict.fault_order_type" :key="item.id" :label="item.label" :value="item.value" />
        </el-select>
      </el-form-item>
      <el-form-item label="状态">
        <el-select v-model="form.status" multiple collapse-tags clearable placeholder="请选择" style="width:220px;"
          @clear="handleQuery">
          <el-option v-for="item in dict.status" :key="item.value" :label="item.label" :value="item.value" />
        </el-select>
      </el-form-item>
      <el-form-item label="是否挂起">
        <el-select v-model="form.is_hang" collapse-tags clearable placeholder="请选择" style="width:220px;"
          @clear="handleQuery">
          <el-option label="挂起" value="1"></el-option>
          <el-option label="正常" value="2"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="部门">
        <treeselect style="width:220px;" v-model="form.assign_dept" :normalizer="normalizer" placeholder="输入搜索词查询部门"
          :options="deptOptions" />
      </el-form-item>
      <el-form-item label="生成时间" prop="time">
        <el-date-picker v-model="form.time" type="datetimerange" align="right" unlink-panels range-separator="至"
          start-placeholder="开始时间" end-placeholder="结束时间" value-format="yyyy-MM-dd" style="width:220px;">
        </el-date-picker>
      </el-form-item>
      <el-form-item label="派发时间" prop="time">
        <el-date-picker v-model="form.assignTime" type="datetimerange" align="right" unlink-panels range-separator="至"
          start-placeholder="开始时间" end-placeholder="结束时间" value-format="yyyy-MM-dd" style="width:220px;">
        </el-date-picker>
      </el-form-item>
      <el-form-item label="完成时间" prop="time">
        <el-date-picker v-model="form.completeTime" type="datetimerange" align="right" unlink-panels range-separator="至"
          start-placeholder="开始时间" end-placeholder="结束时间" value-format="yyyy-MM-dd" style="width:220px;">
        </el-date-picker>
      </el-form-item>
      <el-form-item label="子系统">
        <el-select v-model="form.child_code" multiple clearable collapse-tags style="width:220px;" placeholder="默认所有子系统"
          @clear="handleQuery">
          <el-option v-for="item in childList" :key="item.key" :label="item.value" :value="item.key">
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="区域">
        <el-select v-model="form.area" multiple collapse-tags clearable style="width:220px;" placeholder="默认所有区域"
          @clear="handleQuery">
          <el-option v-for="item in areaList" :key="item.key" :label="item.value" :value="item.key">
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item label=" ">
        <!-- <el-button type="primary" @click="handleQuery">查询</el-button>
        <el-button  @click="handleAdd">新建</el-button> -->
      </el-form-item>
      <el-form-item class="add">
        <el-button type="primary" @click="handleQuery">查询</el-button>
        <el-button @click="handleAdd">新建</el-button>
        <el-button type="primary" @click="exportExcel" :loading="exportLoading" v-if="form.project_code">导出</el-button>
      </el-form-item>
    </el-form>

    <el-table ref="table" v-loading="tableLoading" :data="tableData" :height="tableHeight" style="width: 100%"
      :header-row-style="{ height: '36px' }" :row-style="{ height: '36px' }" :cell-style="{ padding: '0px' }">
      <!-- <el-table-column prop="project_code" label="项目编码" show-overflow-tooltip width="150" align="center"  /> -->
      <el-table-column prop="fault_order_code" label="工单编号" align="center" width="180" />
      <el-table-column prop="point_code" label="点位编码" show-overflow-tooltip width="160" align="center"></el-table-column>
      <el-table-column prop="point_name" label="点位名称" show-overflow-tooltip min-width="150"
        header-align="center"></el-table-column>
      <el-table-column prop="child_name" label="子系统" min-width="150px" align="center"></el-table-column>
      <el-table-column prop="area" label="区域" min-width="100px" align="center"></el-table-column>
      <el-table-column prop="device_count" label="报障设备数量" width="120px" align="center">
        <template slot-scope="scope">
          <span style="cursor:pointer;" @click="showdevice(scope.row)">{{ scope.row.device_count }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="assign_dept_name" label="接单部门" show-overflow-tooltip min-width="150px"
        align="center"></el-table-column>
      <el-table-column prop="create_user_name" label="派发人" align="center"></el-table-column>
      <el-table-column prop="create_time" label="生成时间" width="150px" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.create_time }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="status_name" label="状态" align="center" min-width="100px">
        <template slot-scope="scope">
          <span>{{ scope.row.status_name }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="is_hang" label="是否挂起" align="center" min-width="100px">
        <template slot-scope="scope">
          <span>{{ scope.row.is_hang === '1' ? '挂起' : '正常' }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="120px">
        <template slot-scope="scope">
          <el-button class="filter-item border" size="mini" type="text" style="margin-right:10px;"
            @click="handleInfo(scope.row)">
            详情
          </el-button>
          <el-dropdown trigger="click" v-if="[1, 2, 3, 4, 7].includes(scope.row.status)"
            @command="(command) => handleCommand(command, scope.row)">
            <el-button size="mini" type="text">更多</el-button>
            <el-dropdown-menu slot="dropdown">
              <el-dropdown-item v-if="scope.row.status === 1 && scope.row.is_hang !== '1'" icon="el-icon-collection-tag"
                command="a">工单派单</el-dropdown-item>
              <el-dropdown-item v-if="scope.row.status === 4 && scope.row.is_hang !== '1'" icon="el-icon-collection-tag"
                command="b">改派处理</el-dropdown-item>
              <el-dropdown-item v-if="scope.row.status === 7 && scope.row.is_hang !== '1'" icon="el-icon-circle-check"
                command="c">结单审核</el-dropdown-item>
              <el-dropdown-item v-if="[3, 7].includes(scope.row.status)" icon="el-icon-circle-plus-outline" command="d">{{
                scope.row.is_hang === '1' ? '解除挂起' : '工单挂起' }}</el-dropdown-item>
              <el-dropdown-item v-if="canDelList.includes(scope.row.status)" icon="el-icon-delete"
                command="e">工单删除</el-dropdown-item>
            </el-dropdown-menu>
          </el-dropdown>
        </template>
      </el-table-column>
    </el-table>

    <div style="display:flex;justify-content:space-between;">
      <span style="color:#999;font-size:14px;">共 {{ total }} 条记录</span>
      <el-pagination layout="prev, pager, next,sizes" :total="total" :page-size.sync="page.page_size"
        @current-change="pageChange" @size-change="sizeChange" :current-page.sync="page.page_no" class="pagination" small
        background>
      </el-pagination>
    </div>
    <!-- 设备列表 -->
    <el-dialog title="" :visible.sync="deviceFlag" width="1100px" append-to-body custom-class="device_fault_work">
      <device-list v-if="deviceFlag" :presentId="presentId" :deviceFlag.sync="deviceFlag"></device-list>
    </el-dialog>

    <!-- 新建工单 -->
    <el-dialog title="" @close="handleQuery" :visible.sync="addorderFlag" width="700px" append-to-body
      custom-class="add_fault_work">
      <add-order v-if="addorderFlag" :addorderFlag.sync="addorderFlag" :fault_typeList="dict.fault_type"></add-order>
    </el-dialog>

    <!-- 工单派单 -->
    <el-dialog title="" @close="handleQuery" :visible.sync="distributeFlag" width="700px" append-to-body
      custom-class="pub_fault">
      <distribute-order ref="distribute" v-if="distributeFlag" :distributeFlag.sync="distributeFlag"
        :presentId="presentId"></distribute-order>
    </el-dialog>

    <!-- 工单改派 -->
    <el-dialog title="" @close="handleQuery" :visible.sync="changedistributeFlag" width="700px" append-to-body
      custom-class="pub_fault">
      <change-distribute-order ref="changedistribute" v-if="changedistributeFlag"
        :changedistributeFlag.sync="changedistributeFlag" :presentId="presentId"></change-distribute-order>
    </el-dialog>

    <!-- 接单审核 -->
    <el-dialog title="" @close="handleQuery" :visible.sync="examineFlag" width="700px" append-to-body
      custom-class="pub_fault">
      <examine-order ref="examine" v-if="examineFlag" :examineFlag.sync="examineFlag" :presentId="presentId"
        :fault_typeList="dict.fault_type"></examine-order>
    </el-dialog>

    <!-- 工单详情 -->
    <el-drawer title="" :visible.sync="infoFlag" size="740px" append-to-body custom-class="info_fault_work pub_fault">
      <info-order ref="info" v-if="infoFlag" :infoFlag.sync="infoFlag" :presentId="presentId"
        :currentP="currentP"></info-order>
    </el-drawer>

    <!-- 挂起弹出 -->
    <el-dialog :visible.sync="hangFlag" append-to-body title="工单挂起">
      <h3 style="margin-bottom: 20px;font-size: 16px;display: flex;align-items: center;">
        <i class="el-icon-warning" style="color:#e6a23c;font-size:24px;margin-right:12px;"></i>
        备注
      </h3>
      <el-input v-if="hangFlag" type="textarea" v-model="hang_remark" :rows="3" v-focus></el-input>
      <div slot="footer" class="dialog-footer">
        <el-button size="mini" type="text" @click="cancleHangFn">取消</el-button>
        <el-button size="mini" :loading="submitloading" type="primary" @click="hangFn">确认</el-button>
      </div>
    </el-dialog>

  </div>
</template>

<script>
import { checkPermission, downloadFile } from '@/utils/tool'
import deviceList from './deviceList.vue'
import addOrder from './addOrder.vue'
import distributeOrder from './distributeOrder.vue'
import changeDistributeOrder from './changeDistributeOrder.vue'
import examineOrder from './examineOrder.vue'
import infoOrder from './infoOrder.vue'

export default {
  name: 'faultoperaworkorder',
  data () {
    return {
      form: {
        project: null,
        project_id: null,
        project_code: null,
        content: '',
        time: null,
        assignTime: null,
        completeTime: null,
        status: [],
        assign_dept: null,
        fault_type: '',
        child_code: [],
        area: []
      },
      childList: [],
      areaList: [],
      deptOptions: [],
      total: 0,
      page: {
        page_no: 1,
        page_size: 10
      },
      dict: {
        fault_type: [],
        fault_order_type: [],
        status: []
      },
      projectList: [],
      tableLoading: false,
      tableData: [],
      tableHeight: window.innerHeight - 223,
      currentData: null,
      presentId: null, // 目前操作的id
      deviceFlag: false,
      addorderFlag: false,
      distributeFlag: false,
      changedistributeFlag: false,
      examineFlag: false,
      infoFlag: false,
      submitloading: false,
      hangFlag: false,
      isHange: '',
      hang_remark: '',
      canDelList: [1, 2, 3, 7],
      exportLoading: false,
      currentP: null
    }
  },
  computed: {

  },
  created () {
    this.getfault_order_status()
    this.getfault_type()
    this.getfault_order_type()
    this.getProjectList()
    this.getDept()
  },
  mounted () {
    // this.handleQuery()
    this.getTableHeight()
    window.addEventListener('resize', () => this.getTableHeight())
  },
  components: {
    deviceList, // 设备列表
    addOrder, // 新建工单
    distributeOrder, // 派发工单
    changeDistributeOrder, // 改派工单
    examineOrder, // 接单审核
    infoOrder // 工单详情
  },
  directives: {
    focus: {
      inserted (el) {
        el.querySelector('textarea').focus()
      }
    }
  },
  methods: {
    checkPermission,
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
    async sureHang (row) {
      // this.active = { ...this.active, ...row }
      this.hangFlag = true
      this.presentId = row.id
      this.isHange = row.is_hang === '1' ? '0' : '1'
    },
    async hangFn (row) {
      this.hangFlag = true
      this.tableLoading = true
      const params = {
        is_hang: this.isHange,
        id: this.presentId,
        remark: this.hang_remark
      }
      const { code } = await this.$pub.post('point/fault/order-hang', params)
      this.tableLoading = false
      if (code !== 200) {
        return this.$message({
          message: '操作出错了',
          type: 'error',
          showClose: true
        })
      } else {
        this.$message({
          type: 'success',
          message: '操作成功',
          showClose: true
        })
        this.hangFlag = false
        this.hang_remark = ''
        this.handleQuery()
      }
    },
    cancleHangFn () {
      this.hangFlag = false
      this.hang_remark = ''
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
    // 故障工单类型
    getfault_order_type () {
      this.$dict(this, 'fault_order_type').then(res => {
        if (res.code === 200) {
          this.dict.fault_order_type = (res.data || []).map(m => {
            return {
              value: Number(m.value),
              label: m.label
            }
          })
        } else {
          this.$message({
            type: 'error',
            message: '字典获取出错了fault_order_type',
            showClose: true
          })
          this.dict.fault_order_type = []
        }
      })
    },
    // 故障类型
    getfault_type () {
      this.$dict(this, 'fault_type').then(res => {
        if (res.code === 200) {
          this.dict.fault_type = (res.data || []).map(m => {
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
          this.dict.fault_type = []
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
      this.form.area = []
      this.form.child_code = []
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
      const time = this.form.time || []
      const assignTime = this.form.assignTime || []
      const completeTime = this.form.completeTime || []
      const params = {
        ...this.form,
        begin_time: time[0] ? time[0] + ' 00:00:00' : null,
        end_time: time[1] ? time[1] + ' 23:59:59' : null,
        assign_begin_time: assignTime[0] ? assignTime[0] + ' 00:00:00' : null,
        assign_end_time: assignTime[1] ? assignTime[1] + ' 23:59:59' : null,
        complete_begin_time: completeTime[0] ? completeTime[0] + ' 00:00:00' : null,
        complete_end_time: completeTime[1] ? completeTime[1] + ' 23:59:59' : null,
        fault_type: this.form.fault_type ? this.form.fault_type : 0, // 故障类型
        fault_order_type: this.form.fault_order_type ? this.form.fault_order_type : 0, // 工单类型
        assign_dept: this.form.assign_dept ? this.form.assign_dept : 0, // 派单部门
        page_no: this.page.page_no,
        page_size: this.page.page_size

      }
      const { data, code } = await this.$pub.post('point/fault/order-list', params)
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
          this.tableHeight = el_wrap.offsetHeight - (el_formh + 26 + 40)
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
      this.currentData = null
      this.addorderFlag = true
    },
    // 详情
    handleInfo (row) {
      this.infoFlag = true
      this.presentId = row.id// 当前的id
      this.currentP = { ...row, lng_lat: row.lng + ',' + row.lat }
    },
    handleCommand (command, row) {
      switch (command) {
        case 'a':// 工单派单
          this.handleDistribute(row)
          break
        case 'b':// 改派处理
          this.handleChangeDistribute(row)
          break
        case 'c':// 结单审核
          this.handleToExamine(row)
          break
        case 'd':// 工单解除挂起
          this.sureHang(row)
          // this.handleHand(row)
          break
        case 'e':// 工单删除
          this.handleDelete(row)
          break
        default:
      }
    },
    handleDelete (row) {
      const id = row.id
      this.$confirm('是否确认删除工单编号："' + row.fault_order_code + '"的工单?', '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {
        const { code } = await this.$pub.post('point/fault/order-del', { id })
        if (code === 200) {
          this.handleQuery()
          this.$message({
            type: 'success',
            message: '删除成功',
            showClose: true
          })
        } else {
          this.$message({
            type: 'error',
            message: '删除失败',
            showClose: true
          })
        }
      }).catch(function () { })
    },
    // 派单
    handleDistribute (row) {
      this.distributeFlag = true
      this.presentId = row.id// 当前的id
      // this.$nextTick(() => this.getInfo(row, 'distribute'))
    },
    // 改派
    handleChangeDistribute (row) {
      this.changedistributeFlag = true
      this.presentId = row.id// 当前的id
      // this.$nextTick(() => this.getInfo(row, 'changedistribute'))
    },
    // 审核
    handleToExamine (row) {
      this.examineFlag = true
      this.presentId = row.id// 当前的id
      // this.$nextTick(() => this.getInfo(row, 'examine'))
    },
    // 挂起解除
    async handleHand (row) {
      this.tableLoading = true
      const params = {
        is_hang: row.is_hang === '1' ? '0' : '1',
        id: row.id,
        remark: this.hang_remark

      }
      const { code } = await this.$pub.post('point/fault/order-hang', params)
      this.tableLoading = false
      if (code !== 200) {
        return this.$message({
          message: '操作出错了',
          type: 'error',
          showClose: true
        })
      } else {
        this.handleQuery()
      }
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
      const time = this.form.time || []
      const assignTime = this.form.assignTime || []
      const completeTime = this.form.completeTime || []
      const params = {
        ...this.form,
        begin_time: time[0] ? time[0] + ' 00:00:00' : null,
        end_time: time[1] ? time[1] + ' 23:59:59' : null,
        assign_begin_time: assignTime[0] ? assignTime[0] + ' 00:00:00' : null,
        assign_end_time: assignTime[1] ? assignTime[1] + ' 23:59:59' : null,
        complete_begin_time: completeTime[0] ? completeTime[0] + ' 00:00:00' : null,
        complete_end_time: completeTime[1] ? completeTime[1] + ' 23:59:59' : null,
        fault_type: this.form.fault_type ? this.form.fault_type : 0, // 故障类型
        fault_order_type: this.form.fault_order_type ? this.form.fault_order_type : 0, // 工单类型
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
</style>
