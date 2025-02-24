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
        <el-button type="primary" @click="handleSomeBuild"
          :disabled="selectedAllData.length > 50 || selectedAllData.length <= 0">
          批量生成工单
          <span v-if="selectedAllData.length > 0">（已选{{ selectedAllData.length }}条，最多每次生成50条）</span>
        </el-button>
      </el-form-item>
    </el-form>

    <el-table ref="selTable" v-loading="tableLoading" :data="allData[page.page_no]" :height="tableHeight"
      style="width: 100%" row-key="id" :reserve-selection="true" @select="handleSelect" @select-all="handleSelectionAll"
      :header-row-style="{ height: '36px' }" :row-style="{ height: '36px' }" :cell-style="{ padding: '0px' }">
      <el-table-column type="selection" :selectable="selectable" width="55" align="center" />
      <!-- <el-table-column prop="project_name" label="项目名称" width="150"  /> -->
      <el-table-column prop="point_code" label="点位编码" show-overflow-tooltip width="130" align="center"></el-table-column>
      <el-table-column prop="point_name" label="点位名称" show-overflow-tooltip min-width="150"
        header-align="center"></el-table-column>
      <el-table-column prop="device_ip" label="设备IP" width="150" align="center"></el-table-column>
      <el-table-column prop="device_model" label="设备类型" min-width="120px" align="center"></el-table-column>
      <el-table-column prop="device_name" label="设备名称" min-width="150px" align="center"></el-table-column>
      <el-table-column prop="child_name" label="子系统" min-width="150px" align="center"></el-table-column>
      <el-table-column prop="area" label="区域" min-width="100px" align="center"></el-table-column>
      <el-table-column prop="check_time" label="最后检测时间" width="150px" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.check_time }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="order_id" label="是否生成工单" align="center" min-width="100px">
        <template slot-scope="scope">
          <span>{{ scope.row.order_id === 0 ? '否' : '是' }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" min-width="100px">
        <template slot-scope="scope">
          <el-button class="filter-item border" v-if="scope.row.order_id !== 0" size="mini" type="text"
            @click="handleInfo(scope.row)">
            关联工单
          </el-button>
          <el-button v-if="scope.row.order_id === 0" class="filter-item border" size="mini" type="text"
            @click="handleBuild(scope.row)">
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
    <el-dialog :title="title" :visible.sync="buildFlag" width="700px" append-to-body>
      <build-order v-if="buildFlag" :currentData="currentData" :buildFlag.sync="buildFlag"
        @handleQuery="handleQuery"></build-order>
    </el-dialog>

    <!-- 关联工单工单详情 -->
    <el-drawer title="" :visible.sync="infoFlag" size="740px" append-to-body custom-class="info_fault_work pub_fault">
      <info-order ref="info" v-if="infoFlag" :infoFlag.sync="infoFlag" :presentId="presentId"></info-order>
    </el-drawer>
  </div>
</template>

<script>
import { checkPermission } from '@/utils/tool'
import buildOrder from './buildOrder.vue'
import infoOrder from './infoOrder.vue'
export default {
  name: 'faultOperationFault',
  data () {
    return {
      form: {
        project: null,
        project_id: null,
        project_code: null,
        content: '',
        is_build: 0,
        child_code: [],
        area: []
      },
      childList: [],
      areaList: [],
      total: 20,
      page: {
        page_no: 1,
        page_size: 10
      },
      dict: {
        build: [{ id: 0, label: '全部', value: 0 }, { id: 1, label: '是', value: 1 }, { id: 2, label: '否', value: 2 }],
        fault_type: []
      },
      projectList: [],
      tableLoading: false,
      tableHeight: window.innerHeight - 223,
      allData: {}, // 所有物品数据
      selectedAllData: [],
      buildFlag: false,
      title: '生成工单',
      currentData: null,
      presentId: null, // 目前操作的orderid
      infoFlag: false
    }
  },
  computed: {

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
    buildOrder, infoOrder // 工单详情
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
    async getList () {
      if (!this.form.project_code) {
        return this.$message({
          message: '必须选择一个项目进行查询',
          type: 'error',
          showClose: true,
          customClass: 'uploadMessage'
        })
      }
      const allIds = this.selectedAllData.map(m => m.id)
      if (this.page.page_no in this.allData) {
        this.$nextTick(() => {
          this.allData[this.page.page_no].forEach(f => {
            if (allIds.includes(f.id)) {
              this.$refs.selTable.toggleRowSelection(f, true)
            }
          })
        })
      } else {
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
        this.allData[this.page.page_no] = (data.list || []).map(m => {
          return {
            ...m,
            id: m.point_code + m.project_code + m.device_ip
          }
        })
      }
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
      this.form.area = []
      this.form.child_code = []
      this.childList = []
      this.areaList = []
      this.getAreaList()
      this.getChildList()
      this.handleQuery()
    },
    handleQuery () {
      this.allData = {}
      this.selectedAllData = []
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
    handleSelect (selection, row) {
      const allIds = this.selectedAllData.map(m => m.id)
      if (allIds.includes(row.id)) {
        this.selectedAllData = this.selectedAllData.filter(f => f.id !== row.id)
      } else {
        this.selectedAllData.push(row)
      }
    },
    // 全选
    handleSelectionAll (selection) {
      if (selection.length <= 0) {
        const ids = this.allData[this.page.page_no].map(m => m.id)
        this.selectedAllData = this.selectedAllData.filter(k => !ids.includes(k.id))
      } else {
        const allIds = this.selectedAllData.map(m => m.id)
        selection.forEach(f => {
          if (!allIds.includes(f.id)) {
            this.selectedAllData.push(f)
          }
        })
      }
    },
    // 关联工单
    handleInfo (row) {
      this.infoFlag = true
      this.presentId = row.order_id// 当前的order_id
    },
    // 生成
    handleBuild (row) {
      this.title = '生成工单'
      this.buildFlag = true
      this.currentData = row
    },
    // 批量生成
    handleSomeBuild () {
      if (this.selectedAllData.length <= 0) {
        return this.$message({
          type: 'waring',
          message: '请先选择需要生成工单的故障',
          showClose: true
        })
      }

      this.title = '批量生成工单'
      this.buildFlag = true
      this.currentData = [...this.selectedAllData]
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

  .table {
    margin-top: 20px;
  }
}
</style>
