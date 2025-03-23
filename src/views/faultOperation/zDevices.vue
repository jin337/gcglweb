<template>
  <div class="faultOperationFault">
    <el-form size="small" inline>
      <el-form-item label="项目编码">
        <el-select v-model="form.project" placeholder="请选择" clearable style="width:250px;" size="small"
          @clear="handleQuery" @change="handleProjectChange" value-key="id">
          <el-option v-for="item in projectList" :key="item.id" :label="item.projectName" :value="item"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="关键字">
        <el-input v-model="form.content" style="width:190px" placeholder="点位编码、名称、IP地址" @clear="handleQuery" clearable
          size="small"></el-input>
      </el-form-item>
      <el-form-item label="子系统">
        <el-select v-model="form.child_code" clearable style="width:250px" placeholder="默认所有子系统" @clear="handleQuery">
          <el-option v-for="item in childList" :key="item.key" :label="item.value" :value="item.key">
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="区域">
        <el-select v-model="form.area" multiple collapse-tags clearable style="width:250px" placeholder="默认所有区域"
          @clear="handleQuery">
          <el-option v-for="item in areaList" :key="item.key" :label="item.value" :value="item.key">
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="运维状态">
        <el-select v-model="form.oper_status" placeholder="请选择" @change="handleQuery" style="width:250px" clearable>
          <el-option v-for="item in faultTypeList" :key="item.id" :label="item.label" :value="item.value" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="handleQuery">查询</el-button>
      </el-form-item>
    </el-form>

    <el-table ref="selTable" v-loading="tableLoading" :data="tableData" :height="tableHeight" style="width: 100%"
      row-key="id" :header-row-style="{ height: '36px' }" :row-style="{ height: '36px' }" border
      :cell-style="{ padding: '0px' }">
      <el-table-column prop="point_code" label="点位编码" show-overflow-tooltip width="130"
        align="center"></el-table-column>
      <el-table-column prop="point_name" label="点位名称" header-align="center"></el-table-column>
      <el-table-column prop="area" label="区域" width="80px" align="center"></el-table-column>
      <el-table-column prop="child_name" label="子系统" width="120px" align="center"></el-table-column>
      <el-table-column prop="device_name" label="设备名称" align="center"></el-table-column>
      <el-table-column prop="ip" label="IP" width="120px" align="center"></el-table-column>
      <el-table-column prop="oper_status_name" label="运维状态" width="100px" align="center"></el-table-column>
      <el-table-column label="操作" width="60px">
        <template slot-scope="scope">
          <el-button size="mini" type="text" @click="handleEdit(scope.row)">编辑</el-button>
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

    <el-dialog title="" :visible.sync="editFlag" append-to-body :lock-scroll="false" width="440px">
      <el-form size="small" inline style="margin-top: 14px;">
        <el-form-item label="运维状态" style="margin-bottom: 0;">
          <el-select v-model="rowInfo.oper_status" placeholder="请选择" style="width:250px">
            <el-option v-for="item in faultTypeList" :key="item.id" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
        <el-form-item style="margin-bottom: 0;">
          <el-button type="primary" size="mini" @click="submitOper">确定</el-button>
        </el-form-item>
      </el-form>
    </el-dialog>

  </div>
</template>

<script>
import { checkPermission } from '@/utils/tool'

export default {
  name: 'faultOperationDevices',
  data () {
    return {
      form: {
        project: null,
        project_id: null,
        project_code: null,
        project_name: '',
        content: null,
        is_build: 0,
        child_code: null,
        area: []
      },
      childList: [],
      areaList: [],
      faultTypeList: [],
      total: 0,
      page: {
        page_no: 1,
        page_size: 10
      },
      tableData: [],
      projectList: [],
      tableLoading: false,
      tableHeight: window.innerHeight - 250,
      editFlag: false,
      rowInfo: {
        oper_status: null
      }
    }
  },
  created () {
    this.getpoint_status()
    this.getProjectList()
  },
  mounted () {
    this.getTableHeight()
    window.addEventListener('resize', () => this.getTableHeight())
  },
  components: {
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
    // 故障类型
    getpoint_status () {
      this.$dict(this, 'oper_status').then(res => {
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
            message: '字典获取出错了point_status',
            showClose: true
          })
          this.faultTypeList = []
        }
      })
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
      const params = {
        project_code: this.form.project_code,
        content: this.form.content,
        area: this.form.area,
        child_code: this.form.child_code,
        oper_status: this.form.oper_status,

        page_no: this.page.page_no,
        page_size: this.page.page_size
      }
      const { data, code } = await this.$pub.post('/point/order/device/list', params)
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
      this.$nextTick(() => {
        this.$refs.selTable.toggleAllSelection()
      })
    },
    getTableHeight () {
      this.$nextTick(() => {
        const el_wrap = document.getElementsByClassName('faultOperationFault')[0]
        if (el_wrap) {
          const el_form = el_wrap.getElementsByClassName('el-form')[0]
          const el_formh = el_form.offsetHeight
          this.tableHeight = el_wrap.offsetHeight - (el_formh + 26 + 40)
        }
      })
    },
    handleProjectChange (val) {
      this.form.project_code = val.projectCode
      this.form.project_id = val.id
      this.form.project_name = val.projectName
      this.form.area = []
      this.form.child_code = ''
      this.childList = []
      this.areaList = []
      this.getAreaList()
      this.getChildList()
      this.handleQuery()
    },
    handleQuery () {
      this.tableData = []
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
    // 编辑
    handleEdit (row) {
      this.rowInfo = { ...row, oper_status: Number(row.oper_status) }
      this.editFlag = true
    },
    async submitOper () {
      const tempobj = {
        id: this.rowInfo.id,
        oper_status: this.rowInfo.oper_status
      }
      const { code, message } = await this.$pub.post('/point/order/device/status-change', tempobj)
      if (code === 200) {
        this.$message.success('处理成功！')
        this.getList()
        this.editFlag = false
      } else {
        this.$notify.error({
          title: '处理失败',
          message: message
        })
      }
    }
  }
}
</script>

<style lang='scss'>
.faultOperationFault {
  padding: 20px;
  height: 100%;
  width: 100%;
  box-sizing: border-box;

  .border {
    margin-right: 20px;
  }

  .table {
    margin-top: 20px;

  }

  .el-table__header th {
    background-color: #f8f8f9;
    color: #606266;
  }

  .cursor {
    padding: 4px 20px;
    cursor: pointer;
    color: #409EFF;

    &:hover {
      background: #409EFF;
      color: #fff;
      opacity: 0.9;
      border-radius: 4px;
    }
  }
}
</style>
