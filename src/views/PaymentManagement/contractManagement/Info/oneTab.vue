<template>
  <!-- 合同概况 -->
  <div class="one_tab" v-loading="tableLoading">
    <el-descriptions title="" direction="vertical" :column="4" border>
      <el-descriptions-item label="项目名称">{{ current.project_name }}</el-descriptions-item>
      <el-descriptions-item label="合同号">{{ current.contract_code }}</el-descriptions-item>
      <el-descriptions-item label="供应商">{{ current.supplier }}</el-descriptions-item>
      <el-descriptions-item label="合同金额">
        <span>{{ current.money ? formatNum(current.money) : 0 }}</span>
      </el-descriptions-item>
      <el-descriptions-item label="摘要">{{ current.abstract ? current.abstract : '/' }}</el-descriptions-item>
    </el-descriptions>

    <vxe-table show-overflow :height="tableHeight" :data="tableData" :row-config="{ height: 30, isHover: true }"
      highlight-current-row :tooltip-config="{ zIndex: 9999 }">
      <vxe-column title="付款日期" field="fkrq" width="120px" />
      <vxe-column title="付款审批单号" field="fkdh"></vxe-column>
      <vxe-column title="摘要" field="abstract" />
      <vxe-column title="付款节点" field="fkjd"></vxe-column>
      <vxe-column title="款项类别" field="kxlb" />
      <vxe-column title="付款金额" field="pay_money" width="150px">
        <template v-slot="{ row }">
          <span>{{ row.pay_money ? formatNum(row.pay_money) : 0 }}</span>
        </template>
      </vxe-column>
      <vxe-column title="工程量" field="gcl" />
    </vxe-table>
  </div>
</template>

<script>
import { formatNum } from '@/utils/tool'
export default {
  name: 'contract_tab_1',
  inject: ['current', 'isLook'],
  data () {
    return {
      tableLoading: false,
      tableData: [],
      tableHeight: window.innerHeight - 354
    }
  },
  mounted () {
    window.addEventListener('resize', () => this.getTableHeight())
    this.getTableData()
    this.getTableHeight()
  },
  methods: {
    formatNum,
    async getTableData () {
      // this.tableLoading = true
      // const { data, code, message } = await this.$pub.post('')
      // if (code !== 200) {
      //   this.$message({
      //     type: 'error',
      //     message: message || '获取合同列表失败',
      //     showClose: true
      //   })
      //   return
      // }
      // this.tableData = data || []
      // this.tableLoading = false
      // this.tableData = [
      //   { fkrq: '2023-10-2', fkdh: 'CG-GC-2023001', abstract: 'HDUIEHDUEHE', fkjd: '预付款', kxlb: '预付款', pay_money: 150000, gcl: '明细清单' },
      //   { fkrq: '2023-12-2', fkdh: 'CG-GC-2023002', abstract: 'fergtr', fkjd: '进度款', kxlb: '进度款', pay_money: 150000, gcl: '2明细清单' }
      // ]
    },
    getTableHeight () {
      this.$nextTick(() => {
        const el_wrap = document.getElementById('pane-one')
        if (el_wrap) {
          const description = el_wrap.getElementsByClassName('el-descriptions')[0]
          this.tableHeight = el_wrap.offsetHeight - description.offsetHeight - 20
        }
      })
    }
  }
}
</script>

<style lang="scss">
.contract_managee_tab {}
</style>
