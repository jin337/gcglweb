<template>
  <!-- 施工队 -->
  <div v-loading="loading" class="tab_five">
    <div>
      <div style="text-align: right;" v-if="!isLook">
        <el-button type="primary" size="mini" @click="handleAdd">新增</el-button>
      </div>
    </div>

    <ul class="shigongduiitem">
      <li v-for="(item, i) in listData" :key="item.dept_id">
        <div class="item">
          <template v-if="item.isAdd">
            <el-select v-model="item.dept_id" sizs="mini" @change="deptchange(item.dept_id, i)" clearable
              style="width:calc(100% - 50px)" placeholder="请选择施工队">
              <el-option v-for="dept in BuilderList" :disabled="selectIdAll.includes(dept.dept_id)" :key="dept.dept_id"
                :label="dept.dept_name" :value="dept.dept_id">
              </el-option>
            </el-select>
            <i class="el-icon-finished" @click="handleFinsh(item)"></i>
            <i class="el-icon-delete" @click="handleBenDiDel(i)"></i>
          </template>
          <template v-else>
            <span>{{ item.dept_name }}</span>
            <i v-if="!isLook" class="el-icon-delete" @click="handleDel(item)"></i>
          </template>
        </div>
      </li>
    </ul>
  </div>
</template>

<script>
export default {
  name: 'contract_tab_5',
  inject: ['current', 'isLook'],
  data () {
    return {
      loading: false,
      BuilderList: [],
      listData: []
    }
  },
  computed: {
    selectIdAll () {
      return this.listData.map(m => m.dept_id)
    }
  },
  mounted () {
    this.getlistData()
    this.getBuilderList()
  },
  methods: {
    // 获取当前施工队
    async getlistData () {
      this.loading = true
      const req = {
        contract_id: this.current.id
      }
      const { code, data, message } = await this.$pub.post('contract/price/dept/list', req)
      this.loading = false
      if (code === 200) {
        this.listData = data || []
      } else {
        this.listData = []
        this.$notify.error({
          title: '施工单位查询失败',
          message: message
        })
      }
    },
    // 获取总体施工队列表
    async getBuilderList () {
      if (this.current.project_code === null) {
        return
      }
      const req = {
        project_code: this.current.project_code
      }
      const { code, data, message } = await this.$pub.post('/rate/builder-dept-list', req)
      if (code === 200) {
        this.BuilderList = (data || []).map(m => {
          return {
            dept_id: m.id,
            dept_name: m.name
          }
        })
      } else {
        this.BuilderList = []
        this.$notify.error({
          title: '施工单位查询失败',
          message: message
        })
      }
    },
    handleAdd () {
      const obj = {
        dept_name: '',
        dept_id: null,
        isAdd: true
      }
      this.listData.unshift(obj)
    },
    // 数据库删除
    handleDel (row) {
      const id = row.id
      this.$confirm('是否确认删除', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {
        this.loading = true
        const { code, message } = await this.$pub.post('contract/price/dept/del', { id })
        this.loading = false
        if (code === 200) {
          this.getlistData()
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
      }).catch(() => {
        this.loading = false
        this.$message({
          type: 'success',
          message: '已取消删除',
          showClose: true
        })
      })
    },
    // 本地删除
    handleBenDiDel (index) {
      this.$confirm('是否确认删除', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {
        this.listData.splice(index, 1)
      }).catch(() => {
        this.$message({
          type: 'success',
          message: '已取消删除',
          showClose: true
        })
      })
    },
    deptchange (dept_id, index) {
      const deptinfo = this.BuilderList.find(f => f.dept_id === dept_id)
      if (deptinfo.dept_id) {
        const obj = {
          dept_id: deptinfo.dept_id,
          dept_name: deptinfo.dept_name,
          isAdd: true
        }
        this.listData.splice(index, 1, obj)
        console.log(this.listData[index])
      } else {
        this.listData.splice(index, 1)
      }
    },
    // 确定添加施工队
    async handleFinsh (row) {
      if (row.dept_id) {
        const req = {
          contract_id: this.current.id, // 合同主键
          dept_id: row.dept_id, // 部门主键
          dept_name: row.dept_name // 部门名称
        }
        row.isAdd = false
        // console.log(req)
        // this.listData.unshift(row)
        this.loading = true
        const { code, message } = await this.$pub.post('contract/price/dept/add', req)
        this.loading = false
        if (code === 200) {
          this.getlistData()
        } else {
          this.$notify.error({
            title: '添加施工队失败',
            message: message
          })
        }
      } else {
        this.$message({
          type: 'info',
          message: '未选择施工队',
          showClose: true
        })
      }
    }
  }
}
</script>

<style lang="scss">
.contract_managee_tab {
  .tab_five {
    font-size: 14px;
    color: #606266;

    .content {
      .row {
        display: flex;

        .row_item {
          width: 33%;
          border: 1px solid #eee;
          padding: 10px;
          margin-top: 20px;
          border-right: 0;
        }

        .btns {
          text-align: right;
          border-right: 1px solid #eee;

          .button {
            cursor: pointer;
          }
        }
      }
    }

    .shigongduiitem {
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
          width: calc(100% - 30px);
        }

        .el-input__inner {
          height: 30px;
          line-height: 30px;
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

      .el-icon-delete {
        position: absolute;
        cursor: pointer;
        right: 10px;
        top: 50%;
        margin-top: -8PX;
      }

      .el-icon-finished {
        cursor: pointer;
      }
    }
  }
}
</style>
