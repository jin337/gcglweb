<template>
  <div class="pay_device_point">
    <!-- <el-card>
      <div class="searchTop">
        <div class="color-bottom-line">
          <h3>点位详情</h3>
          <el-button size="small" type="success" @click="handleSurePoint">确认</el-button>
        </div>
        <el-input placeholder="请输入关键字查询内容" v-model="point_searchkey" @keyup.enter.native="searchPoint" clearable
          @clear="searchPoint">
          <el-select v-model="isPage" slot="prepend" placeholder="请选择" style="width:120px;" @change="pageTypechange">
            <el-option label="全部展示" value="1"></el-option>
            <el-option label="分页展示" value="2"></el-option>
          </el-select>
          <el-button slot="append" icon="el-icon-search" @click="searchPoint"></el-button>
        </el-input>
      </div>
      <el-row class="brief" v-if="currentRow">
        <el-col :span="8" v-for="(row, i) in point_list" :key="i" class="brief-item ">
          <div class="btnwrap" @click="handledeletePoint(row, i)">
            <i class="el-icon-delete"></i>
          </div>
          <div class="title">{{ row.point_code }}</div>
          <div class="value">{{ row.device_count }} </div>
        </el-col>
        <el-col :span="24" style="color: #999;text-align: center;margin: 20px;"
          v-if="point_list.length <= 0">暂无数据</el-col>
      </el-row>
      <div style="display:flex;justify-content:space-between;" v-if="isPage === '2'">
        <span style="color:#999;font-size:14px;">共 {{ pointpage.total }} 条记录</span>
        <el-pagination layout="prev,sizes, pager, next" :total="pointpage.total" :page-size.sync="pointpage.pageSize"
          :page-sizes="pointpage.pageSizes" @size-change="sizeChange" @current-change="pageChange"
          :current-page.sync="pointpage.pageNo" class="pagination" small background>
        </el-pagination>
      </div>
    </el-card> -->
  </div>
</template>

<script>
export default {
  name: 'pay_device_point',
  prop: {

  },
  data () {
    return {
      point_list: [],
      point_allData: [], // 所有数据
      pointFlag: false,
      isPage: '2', // 分页展示
      pointpage: {
        total: 0,
        pageSize: 20,
        pageSizes: [10, 20, 30, 50, 100],
        pageNo: 1
      },
      point_searchkey: ''
    }
  },
  mounted () {
    this.point_allData = this.currentRow.point_list.map(m => {
      return {
        ...m, isSearch: true, isdelete: false
      }
    })
    this.pageChange(1)
  },
  methods: {
    // 获取点位展示分页数据
    getPointData () {
      const tempData = this.point_allData.filter(f => f.isSearch && !f.isdelete) // 过滤掉删除的，如果有搜索词，只保留issearch为true的
      if (this.isPage === '2') {
        this.point_list = tempData.slice(
          (this.pointpage.pageNo - 1) * this.pointpage.pageSize,
          this.pointpage.pageNo * this.pointpage.pageSize
        )
        this.pointpage.total = tempData.length
      } else {
        this.point_list = tempData
      }
    },
    // 前端查询 带分页 和不带分页
    searchPoint () {
      // isSearch 为true就是展示出来
      if (this.point_searchkey) {
        this.loading = true
        this.point_allData.forEach((row, i) => {
          let num = -1; const point_code = row.point_code
          num = point_code.toLowerCase().indexOf(this.point_searchkey.toLowerCase())
          if (num > -1) {
            row.isSearch = true
          } else {
            row.isSearch = false
          }
          if (i === this.point_allData.length - 1) {
            this.loading = false
            this.$nextTick(() => {
              this.pageTypechange()
            })
          }
        })
      } else {
        this.loading = false
        this.point_allData = this.point_allData.map(m => {
          return {
            ...m, isSearch: true
          }
        })
        this.pageChange(1)
      }
    },
    pageChange (num) {
      this.pointpage.pageNo = num
      this.getPointData()
    },
    sizeChange (val) {
      this.pointpage.pageSize = val
      this.pageChange(1)
    },
    // 切换全部展示和分页展示
    pageTypechange () {
      if (this.isPage === '2') {
        this.pageChange(1)
      } else {
        this.getPointData()
      }
    },
    // 删除点位
    handledeletePoint (point) {
      this.$confirm('是否确认删除数据?', '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {
        point.isdelete = true
        this.getPointData()
      }).catch(() => { })
    },
    // 确定对点位的管理
    handleSurePoint (point) {
      this.$confirm('是否确认支付以下点位?', '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {
        this.$emit('handlePointSure', this.point_allData)
      })
    }
  }
}
</script>

<style scoped></style>
