<template>
  <div class="contractManagement" v-loading="tableLoading">
    <div class="vux-flexbox flex-content vux-flex-row">
      <span class="main-title">
        合同管理<i :size="16" class="el-icon-question"></i>
      </span>
      <div>
        <el-button size="small" type="primary" @click="handleAdd">新增合同</el-button>
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
      <vxe-column title="项目名称" field="project_name" header-align="center" />
      <vxe-column title="合同号" field="contract_code" width="140px" header-align="center"></vxe-column>
      <vxe-column title="摘要" field="abstract" header-align="center" />
      <vxe-column title="合同金额" field="money" width="120px" header-align="center" align="right">
        <template v-slot="{ row }">
          <span>{{ row.money ? formatNum(row.money) : 0 }}</span>
        </template>
      </vxe-column>
      <vxe-column title="供应商" field="supplier" header-align="center" />
      <vxe-column title="OA审批单号" field="oa_apply_code" width="180px" header-align="center" />
      <vxe-column title="已付款金额" field="pay_money" width="120px" header-align="center" align="right">
        <template v-slot="{ row }">
          <span>{{ row.pay_money ? formatNum(row.pay_money) : 0 }}</span>
        </template>
      </vxe-column>
      <vxe-column title="操作" header-align="center" width="120px">
        <template v-slot="{ row }">
          <el-button size="small" type="text" @click="handleEdit(row)">编辑</el-button>
          <el-button size="small" type="text" @click="handleLook(row)">查看</el-button>
          <el-button size="small" type="text" @click="handleDel(row)">删除</el-button>
        </template>
      </vxe-column>
    </vxe-table>

    <!-- 新增合同 -->
    <el-dialog title="新增" :visible.sync="addFlag" :append-to-body="true" width="1000px" @close="getTableData">
      <addCon v-if="addFlag"></addCon>
    </el-dialog>

    <!-- 编辑 查看 -->
    <el-drawer :title="infoTitle" :visible.sync="operateFlag" size="1100px" custom-class="payment_maintain"
      :append-to-body="true" @close="getTableData">
      <info :current="current" :operateFlag.sync="operateFlag" @handleQuery="getTableData" :isLook="isLook"
        v-if="operateFlag">
      </info>
    </el-drawer>
  </div>
</template>

<script>
import { checkPermission, formatNum } from '@/utils/tool'
import addCon from './AddCon.vue'
import info from './Info/tab.vue'
export default {
  name: 'contractManagement',
  components: { addCon, info },
  data () {
    return {
      project_code: null, // 查询keyword
      tableLoading: false,
      tableData: [],
      tableHeight: window.innerHeight - 250,
      // 新增
      addFlag: false,
      projectList: [],
      // 编辑 查看
      isLook: false,
      operateFlag: false,
      current: null,
      infoTitle: '合同详情'
    }
  },
  mounted () {
    window.onresize = () => {
      this.tableHeight = window.innerHeight - 250
    }
    this.getTableData()
    this.getProjectList()
  },
  methods: {
    formatNum,
    async getTableData () {
      this.tableLoading = true
      const { data, code, message } = await this.$pub.post('contract/manage/list', { project_code: this.project_code })
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
      this.form.contract = null
      this.contractList = []
      this.getcontractList()
    },
    async getcontractList () {
      try {
        this.loading = true
        const { code, data, message } = await this.$pub.post('contract/manage/oa-list', { oa_project_id: this.form.project.oa_project_id })
        this.loading = false
        if (code === 200) {
          this.contractList = data || []
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
    handleAdd () {
      this.addFlag = true
    },
    handleEdit (row) {
      this.operateFlag = true
      this.current = row
      this.isLook = false
      this.infoTitle = '合同详情编辑'
    },
    handleLook (row) {
      this.operateFlag = true
      this.current = row
      this.isLook = true
      this.infoTitle = '合同详情查看'
    },
    handleDel (row) {
      const id = row.id
      this.$confirm('是否确认删除', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {
        this.tableLoading = true
        const { code, message } = await this.$pub.post('contract/manage/del', { id })
        this.tableLoading = false
        if (code === 200) {
          this.getTableData()
          this.$message({
            type: 'success',
            message: '删除成功',
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
    cancel () {
      if (this.addFlag) {
        this.form = {
          project: null,
          contract: null
        }
        this.addFlag = false
      }
      this.operateFlag = false
      this.getTableData()
    }
  }
}
</script>

<style lang="scss">
.contractManagement {
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

.disabled {

  .el-input.is-disabled .el-input__inner,
  .el-textarea.is-disabled .el-textarea__inner,
  .el-radio-button__orig-radio:disabled+.el-radio-button__inner,
  .el-checkbox__input.is-disabled+span.el-checkbox__label,
  .el-radio__input.is-disabled+span.el-radio__label,
  .el-card .rowwrap .row {
    color: #3b3d41;
  }

  // .el-checkbox__input.is-disabled.is-checked .el-checkbox__inner::after {
  //   border-color: #3b3d41;
  // }
}
</style>
