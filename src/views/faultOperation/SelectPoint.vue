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
      <el-form-item label="项目">
        <el-select v-model="form.project" placeholder="请选择" clearable style="width:190px;" size="small"
          @clear="handleQuery" @change="handleProjectChange" value-key="id">
          <el-option v-for="item in projectList" :key="item.id" :label="item.projectName" :value="item"></el-option>
        </el-select>
      </el-form-item>
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
      <el-button type="primary" @click="handleQuery" style="margin-left:auto;" size="small">查询</el-button>
    </el-form>
    <div class="table_box">
      <div class="table_content">
        <el-table ref="selTable" @selection-change="handleSelectionChange" v-loading="loading" :data="tableData"
          :height="'calc(100% - 30px)'" border row-key="id" :header-row-style="{ height: '36px' }"
          :row-style="{ height: '36px' }" :cell-style="{ padding: '0px' }">
          <el-table-column type="selection" width="60" align="center" />
          <el-table-column prop="project_name" label="项目" align="center"></el-table-column>
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
      </div>
      <div class="map_content">
        <PointMap :currentData="form?.project" :list="tableData" v-loading="loading" @drawPolygon="drawPolygon" />
      </div>
    </div>
    <div class="btns">
      <el-button size="small" type="primary" @click="handleConfirm">确认</el-button>
    </div>
  </div>
</template>

<script>
import PointMap from './selectPointMap.vue'
export default {
  name: 'faultselectPoint',
  props: {
    projectList: {
      type: Array,
      require: true
    },
    points: {
      type: Array,
      require: true
    }
  },
  data () {
    return {
      childList: [],
      areaList: [],
      form: {
        project: null,
        project_id: null,
        project_code: null,
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
  components: {
    PointMap
  },
  mounted () {
  },
  methods: {
    handleProjectChange (val) {
      this.form.project_code = val.projectCode
      this.form.project_id = val.id
      if (val) {
        this.form.area = null
        this.form.child_code = null
        this.form.key_name = null
        this.form.online = -1

        this.getChildList()
        this.getAreaList()
        this.getList()
      }
    },
    async getList () {
      this.loading = true
      const params = {
        ...this.form,
        online: this.form.online,
        page_no: this.page.page_no,
        page_size: this.page.page_size,
        project_code: this.form.project_code
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
      if (!this.form.project_code) {
        this.form.area = null
        this.form.child_code = null
        this.form.key_name = null
        this.form.online = -1
        return this.$message({
          message: '必须选择一个项目进行查询',
          type: 'error',
          showClose: true,
          customClass: 'uploadMessage'
        })
      }
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
    async getChildList () {
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
    },
    // 地图选中
    drawPolygon (markers) {
      const points = this.tableData.filter(item => markers.some(m => m.point_code === item.point_code))
      this.handleSelectionChange(points)
      // 初始化选中状态
      this.$nextTick(() => {
        this.tableData.forEach((row) => {
          if (points.some((selected) => selected.point_code === row.point_code)) {
            this.$refs.selTable.toggleRowSelection(row, true)
          } else {
            this.$refs.selTable.toggleRowSelection(row, false)
          }
        })
      })
    }
  }
}
</script>

<style scoped>
.selectpoint_box {
  height: 100%;
}

.table_box {
  display: flex;
  flex-direction: row;
  height: calc(100% - 100px);
}

.table_content {
  width: 616px;
  height: 100%;
}

.map_content {
  flex: 1;
  height: 100%;
  margin-left: 10px;
  background-color: #f8f8f9;
}

.table_content>>>.el-pagination__sizes {
  margin-right: -10px;
}

.btns {
  text-align: right;
  margin-top: 20px;
}

.selectpoint_box>>>.el-table__header th {
  background-color: #f8f8f9;
  color: #606266;
}
</style>
