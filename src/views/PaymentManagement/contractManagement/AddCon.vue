<template>
  <div class="add_contract" v-loading="loading">
    <div class="search">
      <span class="label">选择项目</span>
      <el-select v-model="project" placeholder="请选择项目获取对应合同列表" @change="handleProjectchange" style="width:600px;"
        value-key="project_code" size="mini">
        <el-option v-for="item in projectList" :key="item.id" :label="item.project_name" :value="item"></el-option>
      </el-select>
      <div class="btns">
        <el-button @click="handleSUreAdd" type="primary" size="mini">确定</el-button>
      </div>
    </div>
    <vxe-table ref="xTable" show-overflow :height="480" :data="contractList" :row-config="{ height: 30, isHover: true }"
      border :tooltip-config="{ zIndex: 9999 }" :radio-config="{ labelField: 'contractno', highlight: true }">
      <vxe-column title="选择合同号" type="radio" field="contractno" header-align="center" width="170px" />
      <vxe-column title="合同单号" field="sericnum" header-align="center" width="190px" />
      <vxe-column title="供应商" field="supplier" header-align="center" />
      <vxe-column title="合同金额" field="makemoney" width="120px" header-align="center" align="right">
        <template v-slot="{ row }">
          <span>{{ row.makemoney ? formatNum(row.makemoney) : 0 }}</span>
        </template>
      </vxe-column>
      <vxe-column title="已付款金额" field="paymoney" width="120px" header-align="center" align="right">
        <template v-slot="{ row }">
          <span>{{ row.paymoney ? formatNum(row.paymoney) : 0 }}</span>
        </template>
      </vxe-column>
      <!-- <vxe-column title="摘要" header-align="center" field="summarys" /> -->
    </vxe-table>
  </div>
</template>

<script>
import { checkPermission, formatNum } from '@/utils/tool'
export default {
  name: 'add_contract',
  data () {
    return {
      loading: false,
      project: null,
      projectList: [],
      contractList: []
    }
  },
  mounted () {
    this.getProjectList()
  },
  methods: {
    formatNum,
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
      this.contractList = []
      this.getcontractList()
    },
    async getcontractList () {
      try {
        this.loading = true
        const { code, data, message } = await this.$pub.post('contract/manage/oa-list', { oa_project_id: this.project.oa_project_id })
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
    async handleSUreAdd () {
      const contract = this.$refs.xTable.getRadioRecord()
      console.log(contract)
      if (!this.project && !contract) {
        this.$notify({
          title: '还未选择项目和合同',
          type: 'info'
        })
      } else {
        this.loading = true
        const params = {
          project_id: this.project.id,
          project_code: this.project.project_code, // 项目编码
          project_name: this.project.project_name, // 项目名称
          contract_code: contract.contractno, // 合同编码
          contract_name: contract.summarys, // 合同名称
          abstract: contract.summarys, // 摘要
          supplier: contract.supplier, // 供应商
          oa_apply_code: contract.sericnum, // OA审批单号
          money: Number(contract.makemoney), // 合同金额
          pay_money: Number(contract.paymoney) // 已付款金额
        }
        console.log(params)
        const { code, message } = await this.$pub.post('contract/manage/add', params)
        this.loading = false
        if (code !== 200) {
          this.$message({
            type: 'error',
            message: message || '新增合同失败',
            showClose: true
          })
          return
        }
        this.$message({
          type: 'success',
          message: '操作成功',
          showClose: true
        })
      }
    }
  }
}
</script>

<style lang="scss">
.add_contract {
  .search {
    margin-bottom: 20px;
    display: flex;
    align-items: center;

    .label {
      display: inline-block;
      line-height: 26px;
      padding: 0 10px;
      text-align: center;
      border: 1px solid #DCDFE6;
      border-right: 0;
    }

    .btns {
      margin-left: auto;
    }
  }
}
</style>
