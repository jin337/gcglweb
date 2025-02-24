<template>
  <div class="dev_fau">
    <h3>设备列表<span class="nums" v-if="isProject_point">({{selectEd.length}} / {{tableData.length}})</span></h3>
    <el-table
      v-loading="tableLoading"
      :data="tableData"
      :max-height="tableHeight"
      :header-row-style="{ height: '36px' }"
      :row-style="{ height: '36px' }"
      :cell-style="{ padding: '0px' }"
      @selection-change="handleSelectionChange"
      :empty-text="emptyText"
    >
      <el-table-column type="selection" v-if="isProject_point"  width="55" align="center" />
      <el-table-column prop="device_name" label="设备名称" align="center" show-overflow-tooltip></el-table-column>
      <el-table-column prop="device_model" label="设备型号" align="center" show-overflow-tooltip></el-table-column>
      <el-table-column prop="device_ip" label="IP地址" width="150px" align="center" ></el-table-column>
      <!-- <el-table-column prop="device_status" label="当前设备状态" width="150px" align="center" show-overflow-tooltip></el-table-column> -->
    </el-table>
    <!-- <div class="btns" v-if="!presentId">
      <el-button   size="mini"  type="primary" @click="sureSelect">确定</el-button>
    </div> -->
  </div>
</template>

<script>
export default {
  name: 'device_list',
  props: {
    deviceFlag: {
      type: Boolean,
      default: false
    },
    presentId: { // 详情或者列表传过来的行id
      type: Number
    },
    form: { // 新建传过来的项目点位编码
      type: Object
    },
    datas: {
      type: Array
    }
  },

  data () {
    return {
      tableData: [],
      tableLoading: false,
      tableHeight: window.innerHeight - 223,
      selectEd: [],
      emptyText: '暂无数据'
    }
  },
  computed: {
    isProject_point() {
      return !this.presentId && !this.datas
    }
  },
  mounted() {
    if (this.datas) { // 详情里面用这个组件会传递表格数据过来
      this.tableData = this.datas
    } else {
      this.geTableData()
    }

    this.getTableHeight()
    window.addEventListener('resize', () => this.getTableHeight())
  },
  watch: {
    'form.project_code': {
      handler(val) {
        if (val) {
          this.geTableData()
        } else {
          this.tableData = []
          this.emptyText = '请先选择项目和点位'
        }
      }
    },
    'form.point_code': {
      handler(val) {
        if (val) {
          this.geTableData()
        } else {
          this.tableData = []
          this.emptyText = '请先选择项目和点位'
        }
      }
    }
  },
  methods: {
    async geTableData() {
      if (this.isProject_point && (!this.form.project_code || !this.form.point_code)) {
        this.tableData = []
        this.emptyText = '请先选择项目和点位'
        return
      }
      this.tableLoading = true
      let params = {}
      let url = ''
      if (this.presentId) { // 查询某个工单下保障设备
        params = {
          order_id: this.presentId
        }
        url = 'point/fault/order-ip-list'
      } else { // 查询所有的设备
        params = {
          project_code: this.form.project_code, // 项目编码
          point_code: this.form.point_code // 点位编码
        }
        url = 'point/fault/point-ip-list'
      }

      const { data, code } = await this.$pub.post(url, params)
      this.tableLoading = false
      if (code !== 200) {
        this.tableData = []
        this.$message({
          message: '获取列表出错了',
          type: 'error',
          showClose: true
        })
      } else {
        this.tableData = data.list || []
      }
      if (this.tableData.length <= 0) {
        this.emptyText = '暂无设备'
      }
    },
    getTableHeight() {
      this.$nextTick(() => {
        const el_wrap = document.getElementById('app')
        if (el_wrap) {
          this.tableHeight = el_wrap.offsetHeight - (64 + 150)
        }
      })
    },
    handleSelectionChange(val) {
      this.selectEd = val
    }
  }
}
</script>

<style lang='scss'>
.device_fault_work{
  margin-top:64px!important;
  .el-dialog__header{
    display: none;
  }
   h3{
      margin-top:10px;
    }
}
.dev_fau{
  padding-bottom: 20px;
  .btns{
   height:40px;
   line-height: 40px;
   text-align: right;
  }
  .el-table{
    margin-top:20px;
  }
  .nums{
    color: #999;
    font-weight: normal;
    margin-left:10px;
  }
}
</style>
