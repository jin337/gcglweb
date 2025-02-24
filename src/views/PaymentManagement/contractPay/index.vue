<template>
  <div class="contractPay" v-loading="tableLoading">
    <div class="vux-flexbox flex-content vux-flex-row">
      <span class="main-title">
        付款管理<i :size="16" class="el-icon-question"></i>
      </span>
      <div>
        <el-button size="small" type="primary" @click="handleAdd">新增</el-button>
      </div>
    </div>
    <div style="margin-bottom: 20px;">
      <el-select size="small" v-model="project_code" placeholder="请选择项目" style="width: 220px;" @change="getTableData">
        <el-option v-for="item in projectList" :key="item.id" :label="item.project_name"
          :value="item.project_code"></el-option>
      </el-select>
      <el-button size="small" type="primary" @click="getTableData">查询</el-button>
    </div>
    <vxe-table show-overflow :height="tableHeight" :data="tableData" :row-config="{ height: 30, isHover: true }"
      highlight-current-row border>
      <vxe-column type=seq title="序号" width="50px" align="center"></vxe-column>
      <vxe-column title="付款标题" field="pay_title" header-align="center" />
      <vxe-column title="付款节点" field="rang_type" width="80px" header-align="center">
        <template v-slot="{ row }">
          <span>{{ row.range_type ? rangeList[row.range_type] : '' }}</span>
        </template>
      </vxe-column>
      <vxe-column title="项目编码" field="project_code" width="120px" header-align="center" />
      <vxe-column title="合同编码" field="contract_code" width="150px" header-align="center" />
      <vxe-column title="施工队" field="dept_name" width="220px" header-align="center" />
      <vxe-column title="金额" field="pay_money" width="120px" header-align="center">
        <template v-slot="{ row }">
          <span>{{ row.pay_money ? formatNum(row.pay_money) : 0 }}</span>
        </template>
      </vxe-column>
      <vxe-column title="金额占比" field="pay_ratio" width="80px" align="center">
        <template v-slot="{ row }">
          <span>{{ row.pay_ratio ? row.pay_ratio : 0 }}%</span>
        </template>
      </vxe-column>
      <vxe-column title="发起人" field="create_user_name" width="100px" align="center" />
      <vxe-column title="付款备注" field="pay_remark" header-align="center">
        <template v-slot="{ row }">
          <span>{{ row.pay_remark ? row.pay_remark : '/' }}</span>
        </template>
      </vxe-column>
      <vxe-column title="状态" field="status" width="70px" align="center">
        <!-- <template v-slot="{ row }">
          <span>{{ row.status ? '正常' : '作废' }}</span>
        </template> -->
      </vxe-column>
      <vxe-column title="操作" header-align="center" width="100px">
        <template v-slot="{ row }">
          <!-- <el-button size="small" type="text" @click="handleSubmit(row)">提交</el-button> -->
          <el-button size="small" type="text" @click="handleEdit(row)">编辑</el-button>
          <!-- <el-button size="small" type="text" @click="handleDel(row)">删除</el-button> -->
          <!-- <el-button size="small" type="text" @click="handleExport(row)">导出</el-button> -->
        </template>
      </vxe-column>
    </vxe-table>

    <!--新增 编辑 查看 -->
    <el-drawer :withHeader="false" :visible.sync="operateFlag" size="50%" :append-to-body="true" :wrapperClosable="false"
      custom-class="contractPay_drawer">
      <info :payDetail="current" :operateFlag.sync="operateFlag" @cancel="cancel" :project_code="project_code"
        :isLook="isLook" v-if="operateFlag">
      </info>
    </el-drawer>
  </div>
</template>

<script>
import { checkPermission, downloadFile, formatNum } from '@/utils/tool'
import info from './info.vue'
export default {
  name: 'contractPay',
  components: { info },
  data () {
    return {
      tableLoading: false,
      tableData: [],
      tableHeight: window.innerHeight - 240,
      projectList: [],
      project_code: '',
      rangeList: {
        1: '预付款', 2: '进度款', 3: '尾款'
      },
      // 新增 编辑 查看
      isLook: false,
      operateFlag: false,
      current: null
    }
  },
  mounted () {
    window.onresize = () => {
      this.tableHeight = window.innerHeight - 240
    }
    this.getTableData()
    this.getProjectList()
  },
  methods: {
    formatNum,
    async getTableData () {
      this.tableLoading = true
      const params = {
        project_code: this.project_code
      }
      const { data, code, message } = await this.$pub.post('contract/pay/list', params)
      if (code !== 200) {
        this.$message({
          type: 'error',
          message: message || '获取合同列表失败',
          showClose: true
        })
        return
      }
      this.tableData = data || []
      this.tableLoading = false
    },
    async getProjectList () {
      try {
        const have = checkPermission(['pointAuthorization:project-slt'])
        let url = '/project/project-list-by-user'
        let params = {
          user_id: this.$store.state.userInfo.id
        }

        if (this.ischeckAllproject && have) { // ischeckAllproject表示是否需要校验
          url = '/project/list-slt'
          params = { content: '' }
        }
        const { code, data, message } = await this.$pub.post(url, params)
        if (code === 200) {
          this.projectList = (data || []).map(m => {
            return {
              ...m,
              project_code: m.projectCode ? m.projectCode : m.project_code,
              project_name: m.projectName ? m.projectName : m.project_name
            }
          })
        } else {
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
    handleProjectchange () {
      this.tableData()
    },
    handleAdd () {
      this.operateFlag = true
      this.current = null
      this.isLook = false
    },
    handleEdit (row) {
      this.operateFlag = true
      this.current = row
      this.isLook = false
    },
    handleLook (row) {
      this.operateFlag = true
      this.current = row
      this.isLook = true
    },
    handleDel (row) {
      const id = row.id
      this.$confirm('是否确认删除', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {
        this.tableLoading = true
        const { code, message } = await this.$pub.post('', { id })
        this.tableLoading = false
        if (code === 200) {
          this.getTableData()
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
    handleSubmit (row) {
      const id = row.id
      this.$confirm('是否确认提交', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {
        this.tableLoading = true
        const { code, message } = await this.$pub.post('', { id })
        this.tableLoading = false
        if (code === 200) {
          this.getTableData()
          this.$message({
            type: 'success',
            message: message || '提交成功',
            showClose: true
          })
        } else {
          this.$message({
            type: 'error',
            message: message || '提交失败',
            showClose: true
          })
        }
      }).catch(function () { })
    },
    async handleExport (row) {
      this.tableLoading = true
      const params = {
        id: row.id
      }
      const result = await this.$pub.post(
        '',
        params,
        {
          headers: {
            'Content-Type': 'application/x-download'
          },
          responseType: 'blob'
        }
      )
      const title = this.project.projectName + row.pay_title
      downloadFile(result, title, 'xlsx')
      this.tableLoading = false
    },
    cancel () {
      this.operateFlag = false
      this.getTableData()
    }
  }
}
</script>

<style lang="scss">
.contractPay {
  padding: 20px;
  width: 100%;
  box-sizing: border-box;
  height: 100%;

  .flex-content {
    box-sizing: border-box;
    width: 100%;
    padding-bottom: 24px;
    justify-content: space-between;
  }

  .main-title {
    font-size: 22px;
    color: #172b4d;

    .el-icon-question {
      margin-left: 4px;
      vertical-align: middle;
    }
  }

  .search {
    display: flex;
  }
}

.contractPay_drawer {
  .el-drawer__header {
    margin-bottom: 20px;
  }
}
</style>
