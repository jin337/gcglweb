<!--
 * @Author: y
 * @Date: 2025-03-06 15:05:35
 * @LastEditors: y
 * @LastEditTime: 2025-03-14 09:04:59
 * @FilePath: \gcgl_web\src\views\faultOperation\SelectPoint.vue
-->
<template>
  <div class="selectpoint_box">
    <el-form size="small" inline label-width="60px">
      <el-form-item label="区域">
        <el-select v-model="form.area" multiple clearable style="width: 140px" placeholder="默认所有区域"
          @clear="handleQuery">
          <el-option v-for="item in areaList" :key="item.key" :label="item.value" :value="item.key">
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="子系统">
        <el-select v-model="form.child_code" clearable style="width: 140px" placeholder="默认所有子系统" @clear="handleQuery">
          <el-option v-for="item in childList" :key="item.key" :label="item.value" :value="item.key">
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="关键字">
        <el-input v-model="form.key_name" style="width:140px" placeholder="点位编码、名称、IP地址" @clear="handleQuery" clearable
          size="small"></el-input>
      </el-form-item>
      <el-form-item label="掉线">
        <el-select v-model="form.online" style="width: 140px" placeholder="默认全部">
          <el-option v-for="item in lineList" :key="item.key" :label="item.value" :value="item.key">
          </el-option>
        </el-select>
      </el-form-item>
      <el-button type="primary" @click="handleQuery" style="margin-left:auto;" size="mini">查询</el-button>
    </el-form>
    <el-table ref="selTable" @selection-change="handleSelectionChange" v-loading="loading" :data="tableData"
      :height="400" border style="width: 100%" row-key="id" :header-row-style="{ height: '36px' }"
      :row-style="{ height: '36px' }" :cell-style="{ padding: '0px' }">
      <el-table-column type="selection" width="60" align="center" />
      <el-table-column prop="area" label="区域" width="100" align="center"></el-table-column>
      <el-table-column prop="child_name" label="子系统" width="100" header-align="center"></el-table-column>
      <el-table-column prop="point_code" label="点位编码" align="center"></el-table-column>
      <el-table-column prop="point_name" label="点位名称" header-align="center"></el-table-column>
      <el-table-column prop="count" label="故障数量" width="100" align="center"></el-table-column>
    </el-table>

    <div style="display:flex;justify-content:space-between;">
      <span style="color:#999;font-size:14px;">共 {{ total }} 条记录</span>
      <el-pagination layout="prev, pager, next,sizes" :total="total" :page-size.sync="page.page_size"
        @current-change="pageChange" @size-change="sizeChange" :current-page.sync="page.page_no" class="pagination"
        small background>
      </el-pagination>
    </div>
    <div class="btns">
      <el-button size="mini" type="primary" @click="handleConfirm">确认</el-button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'faultselectPoint',
  props: {
    project_code: {
      type: String,
      require: true
    },
    childList: {
      type: Array,
      require: true
    },
    points: {
      type: Array,
      require: true
    },
    areaList: {
      type: Array,
      require: true
    }
  },
  data () {
    return {
      form: {
        child_code: '',
        area: [],
        key_name: '', // 关键字
        online: -1 // 是否掉线
      },
      lineList: [
        { key: -1, value: '全部' }, { key: 1, value: '在线' }, { key: 0, value: '掉线' }
      ],
      loading: false,
      tableData: [],
      // 分页
      total: 0,
      page: {
        page_no: 1,
        page_size: 50
      },
      // 选中的数据
      selectedData: []
    }
  },
  mounted () {
    this.getList()
  },
  methods: {
    async getList () {
      this.loading = true
      const params = {
        ...this.form,
        online: this.form.online,
        page_no: this.page.page_no,
        page_size: this.page.page_size,
        project_code: this.project_code
      }
      const { data, code } = await this.$pub.post('point/order/point-list', params)
      this.loading = false
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
          id: m.point_code + m.project_code
        }
      })

      // 已经选中
      const filteredData = this.tableData.filter(item =>
        this.points.some(p => p.point_code === item.point_code)
      )
      this.selectedData = filteredData

      // 初始化选中状态
      this.$nextTick(() => {
        this.tableData.forEach((row) => {
          if (this.selectedData.some((selected) => selected.id === row.id)) {
            this.$refs.selTable.toggleRowSelection(row, true)
          }
        })
      })
    },
    handleQuery () {
      this.tableData = []
      this.selectedData = []
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
    // 处理表格选中事件
    handleSelectionChange (selection) {
      // 合并当前页选中的数据
      const currentPageSelectedIds = selection.map((row) => row.id)
      // 过滤掉当前页未选中的数据
      this.selectedData = [
        ...this.selectedData.filter((selected) => !currentPageSelectedIds.includes(selected.id)),
        ...selection
      ]
    },
    // 确认按钮点击事件
    handleConfirm () {
      // console.log('选中的数据：', this.selectedData);
      this.selectedData.forEach(f => {
        f.fault_type = 1
      })
      this.$emit('initTableData', this.selectedData)
    }
  }
}
</script>

<style scoped>
.btns {
  text-align: right;
  margin-top: 20px;
}

.selectpoint_box>>>.el-table__header th {
  background-color: #f8f8f9;
  color: #606266;
}
</style>
