<template>
  <div class="materialClassWrap">
    <!-- <el-form class="search" size="small"  :inline="true" :model="form" >
      <el-form-item label="工序名称" label-width="96px">
        <el-input v-model="form.class_name" placeholder="请输入物料类型名称"  clearable @clear="handleQuery" @keyup.enter.native="handleQuery"></el-input>
      </el-form-item>
      <el-button size="mini" @click="handleQuery" type="primary">查询</el-button>
      <el-button @click="save" type="primary" size="mini" style="margin: 3px 0 0 10px;">保存</el-button>
    </el-form> -->
    <div class="content">
        <!-- 全部物料类型 -->
      <ul   class="_left">
        <li v-for="item in materialList" :key="item.value" :class="{isActive:currentRow&&currentRow.value===item.value}" @click="clickMaterial(item)">
          <div class="font">
            <span style="margin-left:20px;">{{item.label}}</span>
          </div>
        </li>
      </ul>
      <div class="_right">
        <!-- 全部工序 -->
        <div class="wrap">
          <span class="tit">全部工序</span>
          <el-table
            ref="allDataTable"
            :data="tableData"
            v-loading="tableLoading"
            :height="tableHeight"
            row-key="code">
            <el-table-column prop="name" label="工序名称" show-overflow-tooltip>
              <template slot-scope="{row}">
                <el-checkbox
                  v-if="row.proc_code"
                  v-model="row.check"
                  style="margin-right:10px;"
                  @change="(val)=>handleSelectionChange(row,val)"
                ></el-checkbox>
                <span>{{row.name}}</span>
              </template>
            </el-table-column>
            <el-table-column prop="code" label="工序编码"  show-overflow-tooltip>
              <template slot-scope="scope">
                <span >{{scope.row.code}}</span>
              </template>
            </el-table-column>
          </el-table>
        </div>
        <!-- 选中的工序 -->
        <div class="wrap">
          <div>
            <span class="tit">{{currentRow?currentRow.label +'/ ':''}} 已选工序</span>
          </div>
          <el-table
            class="selected"
            :data="(currentRow&&currentRow.procList)?currentRow.procList : []"
            :height="tableHeight"
            v-loading="procLoading">
            <el-table-column prop="proc_name" label="工序名称"  :show-overflow-tooltip="true" />
            <el-table-column prop="proc_code" label="工序编码"  :show-overflow-tooltip="true" />
            <el-table-column prop="specs" label="操作" width="50px">
              <template slot-scope="{row}">
                <span class="cursor color" @click="del(row)">删除</span>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'materialClassConfig',
  data () {
    return {
      materialList: [],
      form: {
        class_name: ''
      },
      currentRow: null, // 选中的物料类型
      tableData: [], // 全部工序
      tableLoading: false,
      tableHeight: window.innerHeight - 172,
      procLoading: false
    }
  },
  created() {
    this.getMaterList()
    this.handleQuery()
  },
  mounted() {
    window.onresize = () => {
      this.tableHeight = window.innerHeight - 172
    }
  },
  components: {

  },
  methods: {
    getMaterList() {
      this.$dict(this, 'device_type').then(res => {
        if (res.code === 200) {
          this.materialList = (res.data || []).map(m => {
            return { ...m, procList: [] }
          })
          if (this.materialList.length > 0) {
            this.clickMaterial(this.materialList[0])
          }
        } else {
          this.$message({
            type: 'error',
            message: '字典获取出错了device_type',
            showClose: true
          })
          this.options = []
        }
      })
    },
    async clickMaterial(item) {
      this.currentRow = item
      this.procLoading = true
      const { data, code } = await this.$pub.post('device/type/proc/info', { device_type: Number(item.value) })
      if (code !== 200) {
        return this.$message.error('根据物料类型获取配置工序出错了')
      }
      this.currentRow.procList = data.list || []
      this.toggleSelect()
      this.procLoading = false
    },
    async handleQuery() {
      this.tableLoading = true
      const params = {
        point_code: 'CS001',
        project_code: 'TEST20200610'
      }
      const { data, code } = await this.$pub.post('/point/proc/list-design', params)
      if (code !== 200) {
        return this.$message.error('获取工序列表出错了')
      }
      this.tableData = (data || []).map(m => {
        return {
          class_code: m.classCode,
          class_name: m.className,
          name: m.className,
          code: m.classCode,
          id: m.id,
          children: m.procList.map(p => {
            return {
              fid: p.fid,
              id: p.id,
              is360: p.is360,
              isCore: p.isCore,
              isDesgin: p.isDesgin,
              isIP: p.isIP,
              isSurvey: p.isSurvey,
              name: p.procName,
              code: p.procCode,
              proc_code: p.procCode,
              proc_name: p.procName,
              check: false,
              class_code: m.classCode
            }
          })
        }
      })
      this.tableLoading = false
      if (this.currentRow && this.currentRow.procList) {
        this.toggleSelect()
      }
    },
    toggleSelect() {
      const selecteds = (this.currentRow.procList || []).map(m => m.proc_code)// 已经选中的工序步骤要回填
      const selected_class = (this.currentRow.procList || []).map(m => m.class_code)// 需要自动展开的工序
      this.$nextTick(() => {
        this.tableData.forEach(f => {
          if (selected_class.includes(f.class_code)) {
            this.$refs.allDataTable.toggleRowExpansion(f, true)
          } else {
            this.$refs.allDataTable.toggleRowExpansion(f, false)
          }
          f.children.some(s => {
            if (selecteds.includes(s.proc_code)) {
              s.check = true
            } else {
              s.check = false
            }
          })
        })
      })
    },
    async handleSelectionChange(row, val) {
      if (val) { // 新增
        const params = {
          device_type: Number(this.currentRow.value),
          class_code: row.class_code,
          proc_code: row.proc_code
        }
        const { code } = await this.$pub.post('device/type/proc/add', params)
        if (code !== 200) {
          return this.$message.error('添加物料类型工序 出错了')
        }
        this.clickMaterial(this.currentRow)
      } else { // 删除
        const curProc = this.currentRow.procList.find(f => f.proc_code === row.proc_code)
        row.id = curProc.id
        this.del(row)
      }
    },
    del(row) {
      this.$confirm('确定删除吗?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {
        const { code } = await this.$pub.post('device/type/proc/del-by-id', { id: row.id })
        if (code !== 200) {
          return this.$message.error('根据Id删除物料类型信息出错了')
        }
        this.clickMaterial(this.currentRow)
        this.$message({
          type: 'success',
          message: '删除成功!',
          showClose: true
        })
      }).catch(() => {
        if (!row.create_user) {
          row.check = true
        }
        this.$message({
          type: 'info',
          message: '已取消删除',
          showClose: true
        })
      })
    }
  }
}
</script>

<style lang='scss'>
.materialClassWrap{
  width:100%;
  height:100%;
  padding:20px;
  box-sizing: border-box;
  .content{
    display:flex;
    justify-content:space-between;
    height:100%;
  }
  ._left{
    width: 205px;
    height:100%;
    border: 1px solid #eee;
    box-sizing: border-box;
    overflow: auto;
    .isActive{
      background: #4681BD;
    }
    li{
      cursor:pointer;
      width: 80%;
      height: 60px;
      overflow: hidden;
      background: #409EFF;
      color:#FBFFFF;;
      position: relative;
      // text-align:center;
      line-height: 60px;
      margin: 10px auto;
      .font{
        margin-left:30px;
        &::before {
          top: 15px;
          right: 5px;
          bottom: 15px;
          left: 5px;
          border-top: 1px solid #fff;
          border-bottom: 1px solid #fff;
          transform: scale(0,1);
          -webkit-transform-origin: 0 0;
          transform-origin: 0 0;
        }
        &::after {
          top: 5px;
          right: 15px;
          bottom: 5px;
          left: 15px;
          border-right: 1px solid #fff;
          border-left: 1px solid #fff;
          transform: scale(1,0);
          transform-origin: 100% 0;
        }
      }
    }
    li .font::before,  li .font::after {
      position: absolute;
      content: '';
      opacity: 0;
      transition: all 0.5s;
    }
    li:hover .font::before,  li:hover .font::after {
      opacity: 1;
      transform: scale(1);
      transition: all 0.5s;
    }
  }
  ._right{
    width: calc(100% - 225px);
    display:flex;
    justify-content: space-between;
    height:100%;
    .wrap{
      width:calc(50% - 10px);
      border: 1px solid #eee;
      padding:10px 0;
      height:100%;
      box-sizing: border-box;
      .tit{
        padding: 7px 15px 7px 0;
        margin: 3px 0px 0px 10px;
      }
      .el-table{
        font-size:12px;
        .el-table-column--selection .cell{
          padding: 0 0px 0 8px;
        }
      }
    }
    .selected td{
      padding: 12px 0 13px 0;
    }
    .cursor{
      cursor:pointer;
    }
    .color{
      color: #409EFF;
    }
    .el-form-item--small.el-form-item{
      margin-bottom:6px;
    }
  }
}
</style>
