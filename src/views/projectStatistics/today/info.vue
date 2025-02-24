<!--
 * @Descripttion: your project
 * @version: 1.0
 * @Author: Clover_yuan
 * @Date: 2024-02-26 11:30:39
 * @LastEditors: Clover_yuan
 * @LastEditTime: 2024-03-22 17:22:12
-->
<template>
  <div class="project_today p_t_wrap" v-loading="tableLoading">
    <el-button-group class="btns_wrap">
      <i class="el-icon-arrow-left" @click="clickLeft" v-if="isShowArrow"></i>
      <el-button-group class="btns">
        <el-button v-for="(item, index) in areaList" :key="item.key" @click="clickArea(item.key, index)"
          :class="{ isActive: item.key === area }">{{ item.value }}</el-button>
      </el-button-group>
      <i class="el-icon-arrow-right" @click="clickRight" v-if="isShowArrow"></i>
    </el-button-group>
    <el-table :height="tableHeight" :data="tableData" :row-style="{ height: '30px' }" :cell-style="{ padding: '4px 0' }"
      border>
      <el-table-column show-overflow-tooltip prop="dept_name" label="施工队名称" min-width="250"></el-table-column>
      <el-table-column show-overflow-tooltip prop="cls_002" label="今日基坑浇注数量" min-width="150"
        align="center"></el-table-column>
      <el-table-column show-overflow-tooltip prop="cls_004" label="今日立杆数量" min-width="150"
        align="center"></el-table-column>
      <el-table-column show-overflow-tooltip prop="cls_009" label="今日相机安装数量" min-width="170"
        align="center"></el-table-column>
      <!-- <el-table-column  show-overflow-tooltip prop="cls_0011" label="支架安装数量" min-width="150" align="center"></el-table-column>
      <el-table-column  show-overflow-tooltip prop="cls_0012" label="多码联帧安装数量" min-width="170" align="center"></el-table-column> -->
      <el-table-column show-overflow-tooltip prop="debug_count" label="今日相机调试数量" min-width="170"
        align="center"></el-table-column>
    </el-table>
  </div>
</template>

<script>
import defaumixn from '../default.js'
export default {
  name: 'project_today',
  mixins: [defaumixn],
  props: {
    project: {
      required: true,
      default: ''
    }
  },
  data () {
    return {
      tableHeight: window.innerHeight - 150,
      tableData: [],
      tableLoading: false
    }
  },
  created () {
    this.istoday = true
    this.getTableData()
  },
  mounted () {
    window.onresize = () => {
      this.tableHeight = window.innerHeight - 150
    }
  },
  methods: {
    async getTableData () {
      const url = this.area === 'all' ? 'rate/project_survey_dept_today' : 'rate/project_survey_dept_today_area'
      const params = {
        project_code: this.project.project_code,
        area: this.area === 'all' ? null : this.area
      }
      this.tableLoading = true
      const { data, code } = await this.$pub.post(url, params)
      if (code !== 200) {
        return this.$message({
          type: 'error',
          message: '获取项目概况(施工单位) 当天',
          showClose: true

        })
      }
      // this.tableData = data || {}
      this.tableData = data.list || []
      this.tableLoading = false
    }
  }
}
</script>

<style lang="scss">
.project_today {
  height: 100%;

  .el-table__header-wrapper {
    font-size: 16px;
  }

  .el-table__header {
    th {
      color: #000;
      border-top: 1px solid #EBEEF5;
    }

  }
}
</style>
