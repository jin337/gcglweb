<template>
  <!-- 合同单价 -->
  <div class="hetongdanjia" v-loading="loading">
    <div style="text-align: right;" v-if="!isLook">
      <el-button size="mini" @click="getTableData">刷新</el-button>
      <el-button type="primary" size="mini" @click="handleAdd">新增</el-button>
      <el-button type="primary" size="mini" @click="subModel">分项模板</el-button>
    </div>
    <vxe-table :height="tableHeight" :data="tableData" highlight-current-row border :cell-class-name="cellClassName"
      @cell-dblclick="handleLook">
      <vxe-column type=seq title="序号" width="50px" align="center"></vxe-column>
      <vxe-column field="item_title" title="分项">
        <template v-slot="{ row }">
          <span :title="row.item_title">{{ row.item_title }}</span>
        </template>
      </vxe-column>
      <vxe-column field="child_list" title="分项明细">
        <template v-slot="{ row }">
          <ul class="subwrap">
            <li v-for="(item, index) in row.child_list" :key="item.id"
              :class="{ lastLi: index + 1 === row.child_list.length }">{{
                item.item_detail_title
              }}</li>
          </ul>
        </template>
      </vxe-column>
      <vxe-column field="item_unit" title="单位" width="60px" align="center"></vxe-column>
      <vxe-column field="item_nums" title="数量" width="80px" align="center"></vxe-column>
      <vxe-column field="item_price" title="单价" width="100px" header-align="center">
        <template v-slot="{ row }">
          <span>{{ row.item_price ? formatNum(row.item_price) : 0 }}</span>
        </template>
      </vxe-column>
      <vxe-column field="money" title="金额" width="120px" header-align="center" align="right">
        <template v-slot="{ row }">
          <span>{{ row.money ? formatNum(row.money) : 0 }}</span>
        </template>
      </vxe-column>
      <vxe-column title="操作" width="150px" align="center" v-if="!isLook">
        <template v-slot="{ row }">
          <el-button size="small" type="text" @click="handleEdit(row)">编辑</el-button>
          <el-button size="small" type="text" @click="handleSubMaintenance(row)">分项维护</el-button>
          <el-button size="small" type="text" @click="handleDel(row)">删除</el-button>
          <!-- <el-button size="small" type="text" @click="handleLook(row)">查看</el-button> -->
        </template>
      </vxe-column>
    </vxe-table>
    <!-- 新增 编辑 查看-->
    <el-drawer :withHeader="false" :visible.sync="operateFlag" size="1000px" :append-to-body="true"
      custom-class="contrac_drawer" :wrapperClosable="false">
      <add-sub-unit-price :title="opearTitle" :selectedRow="selected" :lookSubInfo="lookSubInfo"
        :operateFlag.sync="operateFlag" @cancleFn="cancleFn" v-if="operateFlag">
      </add-sub-unit-price>
    </el-drawer>

    <!-- 当前数据的分项维护 -->
    <el-dialog title="分项维护" :visible.sync="subFlag" :append-to-body="true" width="800px" @close="cancleFn">
      <subItem v-if="subFlag" :selectedRow="selected" :subFlag.sync="subFlag"></subItem>
    </el-dialog>

    <!-- 分项模板配置 -->
    <el-dialog title="分项明细模板配置" :visible.sync="subModelFlag" :append-to-body="true" width="800px">
      <subModel v-if="subModelFlag" :subModelFlag.sync="subModelFlag" @cancleFn="cancleFn">
      </subModel>
    </el-dialog>
  </div>
</template>

<script>
import addSubUnitPrice from './three_add/addSubUnitPrice.vue'
import subItem from './three_add/subitem.vue'
import subModel from './three_add/subModel.vue'
import { formatNum } from '@/utils/tool'
export default {
  name: 'contract_tab_3',
  inject: ['current', 'isLook'],
  components: { addSubUnitPrice, subItem, subModel },
  data () {
    return {
      loading: false,
      tableData: [],
      tableHeight: window.innerHeight - 200,
      opearTitle: '新增合同分项单价',
      operateFlag: false, // 编辑 新增 查看 弹窗控制
      lookSubInfo: false, // 是否是查看
      selected: null, // 当前选中的行数据
      subFlag: false, // 分项维护
      subModelFlag: false // 分项模板
    }
  },
  mounted () {
    this.getTableData()
    window.onresize = () => {
      this.tableHeight = window.innerHeight - 200
    }
  },
  methods: {
    formatNum,
    async getTableData () {
      this.loading = true
      const { data, code, message } = await this.$pub.post('contract/price/list', { contract_id: this.current.id })
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
    cellClassName ({ row, column }) {
      if (column.property === 'child_list') {
        return 'subitem'
      }
      return null
    },
    handleAdd () {
      this.operateFlag = true
      this.selected = null
      this.opearTitle = '新增合同分项单价'
      this.lookSubInfo = false
    },
    handleEdit (row) {
      this.operateFlag = true
      this.selected = row
      this.opearTitle = '编辑合同分项单价'
      this.lookSubInfo = false
    },
    handleLook ({ row }) {
      this.operateFlag = true
      this.selected = row
      this.opearTitle = '查看合同分项单价'
      this.lookSubInfo = true
    },
    cancleFn () {
      this.operateFlag = false
      this.getTableData()
    },
    // 分项维护
    handleSubMaintenance (row) {
      this.subFlag = true
      this.selected = row
    },
    handleDel (row) {
      const params = {
        item_id: row.id,
        contract_id: this.current.id
      }
      this.$confirm('是否确认删除', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {
        this.loading = true
        const { code, message } = await this.$pub.post('contract/price/del', params)
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
    // 分项模板配置
    subModel () {
      this.subModelFlag = true
    }
  }
}
</script>

<style lang="scss">
.contract_managee_tab {
  .vxe-table--body {
    .vxe-body--column:not(.col--ellipsis) {
      padding: 0px;
    }
  }

  .hetongdanjia {
    td.subitem {
      padding: 0;

      .vxe-cell {
        padding: 0;

        .subwrap {
          li {
            padding: 4px 10px;
            border-bottom: 1px solid #eee;
            // text-wrap: wrap;
          }

          .lastLi {
            border-bottom: 0;
          }
        }
      }
    }
  }
}

// 分项明细列表样式start
.mainsubitem {
  h5 {
    color: #172b4d;
  }

  .item {
    width: 100%;
    padding: 10px 20px;
    box-sizing: border-box;
    box-shadow: 0 1px 1px rgba(9, 30, 66, .25), 0 0 1px rgba(9, 30, 66, .31);
    border-radius: 3px;
    color: #5e6c84;
    position: relative;
    margin-top: 20px;

    .el-input {
      width: calc(100% - 50px);
    }
  }

  .add {
    cursor: pointer;
    background: #0052cc;
    color: #fff;
    text-align: center;

    .el-icon-plus {
      margin-right: 10px;
    }
  }

  h4 {
    vertical-align: middle;
  }

  .el-icon-refresh-right {
    font-size: 16px;
    font-weight: bold;
    cursor: pointer;
  }

  .el-icon-edit,
  .el-icon-finished {
    margin-right: 10px;
    cursor: pointer;
  }

  .el-icon-delete {
    position: absolute;
    cursor: pointer;
    right: 10px;
    top: 50%;
    margin-top: -8PX;
  }

  .el-col {
    margin-top: 20px;
  }
}

// 分项明细列表样式end
</style>
