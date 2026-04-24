<template>
  <!-- 付款节点 -->
  <div v-loading="loading">
    <div style="text-align: right;" v-if="!isLook">
      <el-button type="primary" size="mini" @click="handleAdd">新增</el-button>
    </div>
    <vxe-table show-overflow :height="tableHeight" :data="tableData" highlight-current-row border
      @cell-dblclick="handleLook" :row-config="{ height: 30, isHover: true }" :tooltip-config="{ zIndex: 9999 }">
      <vxe-column type=seq title="序号" width="50px" align="center"></vxe-column>
      <vxe-column field="node_title" title="付款节点"></vxe-column>
      <vxe-column field="node_remark" title="付款条件说明" min-width="150px"> </vxe-column>
      <vxe-column field="pay_ratio" title="支付比例" width="80px" align="center">
        <template v-slot="{ row }">
          <span>{{ row.pay_ratio }}%</span>
        </template>
      </vxe-column>
      <vxe-column title="操作" width="150px" align="center" v-if="!isLook">
        <template v-slot="{ row }">
          <el-button size="mini" type="text" @click="handleEdit(row)">编辑</el-button>
          <el-button size="mini" type="text" @click="handleDel(row)">删除</el-button>
        </template>
      </vxe-column>
    </vxe-table>

    <!-- 新增 编辑 查看-->
    <el-drawer :withHeader="false" :visible.sync="operateFlag" size="1000px" :append-to-body="true"
      custom-class="contrac_drawer" :wrapperClosable="false">
      <add-payment-nodes :title="opearTitle" :selectedRow="selected" :lookPayNodeInfo="lookPayNodeInfo"
        :operateFlag.sync="operateFlag" @cancleFn="cancleFn" v-if="operateFlag">
      </add-payment-nodes>
    </el-drawer>
  </div>
</template>

<script>
import addPaymentNodes from './four_add/addPaymentNodes.vue'
export default {
  name: 'contract_tab_4',
  inject: ['current', 'isLook'],
  components: { addPaymentNodes },
  data () {
    return {
      loading: false,
      tableData: [],
      tableHeight: window.innerHeight - 200,
      opearTitle: '新增合同付款节点',
      operateFlag: false, // 编辑 新增 查看 弹窗控制
      lookPayNodeInfo: false, // 是否是查看
      selected: null // 当前选中的行数据
    }
  },
  mounted () {
    this.getTableData()
    window.onresize = () => {
      this.tableHeight = window.innerHeight - 200
    }
  },
  methods: {
    async getTableData () {
      this.loading = true
      const { data, code, message } = await this.$pub.post('contract/price/node/list', { contract_id: this.current.id })
      if (code !== 200) {
        this.$message({
          type: 'error',
          message: message || '获取列表失败',
          showClose: true
        })
        return
      }
      this.tableData = data || []
      this.loading = false
    },
    handleAdd () {
      this.operateFlag = true
      this.selected = null
      this.opearTitle = '新增合同付款节点'
      this.lookPayNodeInfo = false
    },
    handleEdit (row) {
      this.operateFlag = true
      this.selected = row
      this.opearTitle = '编辑合同付款节点'
      this.lookPayNodeInfo = false
    },
    handleLook ({ row }) {
      this.operateFlag = true
      this.selected = row
      this.opearTitle = '查看合同付款节点'
      this.lookPayNodeInfo = true
    },
    handleDel (row) {
      const id = row.id
      this.$confirm('是否确认删除', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {
        this.loading = true
        const { code, message } = await this.$pub.post('contract/price/node/del', { id })
        this.loading = false
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
    cancleFn () {
      this.operateFlag = false
      this.getTableData()
    }
  }
}
</script>

<style lang="scss">
.contract_managee_tab {}
</style>
