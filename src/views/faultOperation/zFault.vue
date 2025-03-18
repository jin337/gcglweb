<template>
  <div class="faultOperationFault">
    <el-form size="small" inline>
      <el-form-item label="项目列表">
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
        <el-select v-model="form.child_code" multiple clearable collapse-tags style="width:250px" placeholder="默认所有子系统"
          @clear="handleQuery">
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
      <el-form-item label="是否生成">
        <el-select v-model="form.is_build" placeholder="请选择" @change="handleQuery" style="width:100px">
          <el-option v-for="item in dict.build" :key="item.id" :label="item.label" :value="item.value" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="handleQuery">查询</el-button>
      </el-form-item>
      <el-form-item style="float:right">
        <el-button type="primary" @click="handleSomeBuild">
          批量生成工单
          <!-- <span v-if="selectedAllData.length > 0">（已选{{ selectedAllData.length }}条，最多每次生成50条）</span> -->
        </el-button>
      </el-form-item>
    </el-form>

    <el-table ref="selTable" v-loading="tableLoading" :data="tableData" :height="tableHeight" style="width: 100%"
      row-key="id" :header-row-style="{ height: '36px' }" :row-style="{ height: '36px' }" border
      :cell-style="{ padding: '0px' }">
      <el-table-column type="selection" :selectable="selectable" width="60" align="center" />
      <el-table-column prop="point_code" label="点位编码" show-overflow-tooltip width="130" align="center"></el-table-column>
      <el-table-column prop="point_name" label="点位名称" header-align="center"></el-table-column>
      <el-table-column prop="device_num" label="设备数量" width="80" align="center">
        <template slot-scope="{row}">
          <span class="cursor" @click="showNum(row, 'shebei')">{{ row.device_num ? row.device_num : 0 }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="drop_num" label="掉线数量" width="120" align="center">
        <template slot-scope="{row}">
          <span class="cursor" @click="showNum(row, 'diaoxian')">{{ row.drop_num ? row.drop_num : 0 }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="fix_num" label="在维修数量" width="100" align="center">
        <template slot-scope="{row}">
          <span class="cursor" @click="showNum(row, 'weixiu')">{{ row.fix_num ? row.fix_num : 0 }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="dept" label="维护责任单位" width="120" align="center"></el-table-column>
      <el-table-column prop="child_name" label="子系统" width="120px" align="center"></el-table-column>
      <el-table-column prop="area" label="区域" width="100px" align="center"></el-table-column>
      <el-table-column label="操作" width="150px" header-align="center">
        <template slot-scope="scope">
          <el-button v-if="scope.row.order_id === 0" class="border" type="text" @click="handleBuild(scope.row)">
            工单生成
          </el-button>
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

    <!-- 生成工单 批量生成工单 -->
    <el-dialog :title="title" :visible.sync="buildFlag" width="900px" append-to-body :lock-scroll="false">
      <build-order v-if="buildFlag" :currentData="currentData" :buildFlag.sync="buildFlag" :projectList="projectList"
        :project_code="form.project_code || ''" :childList="childList" :areaList="areaList"
        :faultTypeList="faultTypeList"></build-order>
    </el-dialog>

    <!-- 点击数量展示 -->
    <el-dialog title="" :visible.sync="numsFlag" width="600px" append-to-body :lock-scroll="false">
      <el-table v-loading="numsLoading" :data="numsData" :height="500" style="width: 100%"
        :header-row-style="{ height: '36px' }" :row-style="{ height: '36px' }" :cell-style="{ padding: '0px' }">
        <el-table-column prop="ip" label="IP" align="center"></el-table-column>
        <el-table-column prop="start" label="首次上线日期" align="center" v-if="numsType === 'shebei'"></el-table-column>
        <el-table-column prop="status" label="状态" align="center" v-if="numsType === 'shebei'"></el-table-column>
        <el-table-column prop="end" label="掉线日期" align="center" v-if="numsType === 'diaoxian'"></el-table-column>
        <el-table-column prop="gldw" label="关联单位" align="center" v-if="numsType === 'weixiu'"></el-table-column>
      </el-table>
    </el-dialog>

  </div>
</template>

<script>
import { checkPermission } from '@/utils/tool'
import buildOrder from './buildOrder.vue'
export default {
  name: 'faultOperationFault',
  data () {
    return {
      form: {
        project: null,
        project_id: null,
        project_code: null,
        project_name: '',
        content: '',
        is_build: 0,
        child_code: [],
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
      dict: {
        build: [{ id: 0, label: '全部', value: 0 }, { id: 1, label: '是', value: 1 }, { id: 2, label: '否', value: 2 }],
        fault_type: []
      },
      projectList: [],
      tableLoading: false,
      tableHeight: window.innerHeight - 250,
      buildFlag: false,
      title: '生成工单',
      currentData: null,
      presentId: null, // 目前操作的orderid
      // 点击设备数量shebei，掉线数量diaoxian，维修设备数量weixiu
      numsType: '', // shebei diaoxian weixiu
      numsLoading: false,
      numsFlag: false,
      numsData: []
    }
  },
  created () {
    this.getfault_type()
    this.getProjectList()
  },
  mounted () {
    this.getTableHeight()
    window.addEventListener('resize', () => this.getTableHeight())
  },
  components: {
    buildOrder
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
        ...this.form,
        page_no: this.page.page_no,
        page_size: this.page.page_size
      }
      const { data, code } = await this.$pub.post('point/fault/fault-list', params)
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
      this.tableData = (data.list || []).map(m => {
        return {
          ...m,
          id: m.point_code + m.project_code + m.device_ip
        }
      })
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
      this.form.child_code = []
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
    selectable (row) {
      return row.order_id === 0
    },
    // 生成
    handleBuild (row) {
      this.buildFlag = true
      this.currentData = [row]
      this.title = this.form.project_name + '-工单生成'
    },
    // 批量生成
    handleSomeBuild () {
      const selectedAllData = this.$refs.selTable.selection
      if (selectedAllData.length <= 0) {
        return this.$message({
          type: 'waring',
          message: '请先选择需要生成工单的故障',
          showClose: true
        })
      }

      this.buildFlag = true
      this.title = this.form.project_name + '-工单生成'
      this.currentData = [...selectedAllData]
    },
    // 展示数量弹窗
    showNum (row, type) {
      return
      // this.numsType = type
      // this.numsLoading = true
      // const params = {

      // }
      // const { data, code } = await this.$pub.post('', params)
      // this.numsLoading = false
      // if (code !== 200) {
      //   this.total = 0
      //   this.numsData = []
      //   return this.$message({
      //     message: '获取列表出错了',
      //     type: 'error',
      //     showClose: true
      //   })
      // }
      // this.numsData = data
      // this.numsData = [
      //   { ip: '12.12.12.12', start: '2024-03-21', end: '2024-05-03', status: 'haha' }
      // ]
      // this.numsFlag = true
    },
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

   