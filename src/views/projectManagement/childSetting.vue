<template>
  <div class="childSetting">
    <div class="_top">
      <el-button size="mini" @click="add" type="primary" >新增子系统</el-button>
    </div>
    <el-table :data="tableData" size="mini" height="350px" style="margin-top:0;" v-loading="loading">
      <el-table-column prop="child_code" label="子系统编码" width="280">
        <template slot-scope="scope">
          <span v-if="scope.row.isedit&&!scope.row.id" class="editRow">
            <el-input  v-model="scope.row.child_code" size="mini" ref="inputcode" @blur="codeValidate(scope.row,scope.$index)"></el-input>
            <span class="error">{{scope.row.error}}</span>
          </span>
          <span v-else>{{scope.row.child_code}}</span>
        </template>
      </el-table-column>
      <el-table-column prop="child_name"  label="子系统名称" min-width="150">
        <template slot-scope="scope">
          <el-input v-if="scope.row.isedit" v-model="scope.row.child_name" size="mini" ></el-input>
          <span v-else>{{scope.row.child_name}}</span>
        </template>
      </el-table-column>
      <el-table-column  label="操作" align="center">
        <template slot-scope="scope">
          <el-button type="text" @click="edit(scope.row,scope.$index)" v-if="!scope.row.isedit">编辑</el-button>
          <el-button type="text" @click="sure(scope.row,scope.$index)"  v-loading="scope.row.addLoading" v-if="scope.row.isedit">确认</el-button>
          <el-button type="text" @click="cancle(scope.row,scope.$index)" v-if="scope.row.isedit">取消</el-button>
          <el-button type="text" v-if="tableData.length>1" @click="del(scope.row,scope.$index)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script>
export default {
  name: 'childSetting',
  data () {
    return {
      tableData: [],
      loading: false,
      currentRow: null,
      codes: []
    }
  },
  props: {
    current: {
      required: true
    }
  },
  computed: {

  },
  mounted() {
    this.getData()
  },
  components: {

  },
  methods: {
    async getData() {
      this.loading = true
      const params = {
        project_id: this.current.id
      }
      this.tableData = []
      this.codes = []
      const { data, code, message } = await this.$pub.post('/project/child-list', params)
      this.loading = false
      if (code !== 200) {
        return this.$message({
          type: 'error',
          message: message || '获取列表出错了',
          showClose: true
        })
      } else {
        this.tableData = data.map(m => {
          this.codes.push(m.key)
          return {
            ...m,
            child_name: m.value,
            child_code: m.key
          }
        })
      }
    },
    codeValidate(row, i) {
      if (!row.child_code) {
        return
      }
      const val = row.child_code.replace(/(\s*)|(\s*$)/g, '')
      const isHave = this.codes.includes(val)
      if (isHave) {
        row.error = '该项目下已存在此编码'
        this.$set(this.tableData, i, row)
      }
    },
    add() {
      const row = this.tableData[this.tableData.length - 1]
      if (row && row.isedit && !row.id) {
        return this.$message({
          type: 'error',
          message: '先保存或取消新增的子系统',
          showClose: true
        })
      }
      if (this.currentRow && this.currentRow.isedit) {
        return this.$message({
          type: 'error',
          message: '先保存或取消编辑中的子系统',
          showClose: true
        })
      }

      this.currentRow = null
      this.tableData.push({
        child_code: '',
        child_name: '',
        isedit: true
      })
      this.isAdd = true
      this.$nextTick(() => {
        const id = 'inputcode'
        this.$refs[id].focus()
      })
    },
    edit(row, i) {
      if (this.currentRow && this.currentRow.isedit) {
        return this.$message({
          type: 'error',
          message: '先保存或取消编辑中的子系统',
          showClose: true
        })
      }
      this.isAdd = false
      row.isedit = true
      this.$set(this.tableData, i, row)
      this.currentRow = Object.assign({}, row)
    },
    del(row, i) {
      this.$confirm('确定删除吗?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {
        if (row.id) {
          row.delLoading = true
          this.$set(this.tableData, i, row)
          const params = {
            id: row.id
          }
          const { code, message } = await this.$pub.post('/project/child-del', params)
          if (code === 200) {
            this.tableData.splice(i, 1)
            this.$message({
              type: 'success',
              message: message || '删除成功',
              showClose: true
            })
          } else {
            row.delLoading = false
            this.$set(this.tableData, i, row)
            this.$message({
              type: 'error',
              message: message || '删除失败',
              showClose: true
            })
          }
        } else {
          this.tableData.splice(i, 1)
        }
      }).catch(() => {
        this.$message({
          type: 'info',
          message: '已取消删除',
          showClose: true
        })
      })
    },
    async sure(row, i) {
      if (!row.child_name || !row.child_code) {
        return this.$message({
          type: 'error',
          message: '子系统名称和编码不能为空',
          showClose: true
        })
      }
      if (row.error) {
        return this.$message({
          type: 'error',
          message: row.error,
          showClose: true
        })
      }
      row.addLoading = true
      this.$set(this.tableData, i, row)
      const params = {
        project_code: this.current.project_code,
        child_name: row.child_name,
        child_code: row.child_code
      }
      const editParams = {
        id: row.id,
        child_name: row.child_name
      }
      const { code, message } = row.id ? await this.$pub.post('/project/child-edit', editParams) : await this.$pub.post('/project/child-add', params)
      if (code === 200) {
        this.currentRow = null
        row.isedit = false
        row.addLoading = false
        this.$message({
          type: 'success',
          message: row.child_code ? '修改成功' : '新增成功',
          showClose: true
        })
        this.getData()
      } else {
        row.addLoading = false
        this.$set(this.tableData, i, row)
        this.$message.error(message || '确认失败')
      }
    },
    cancle(row, i) {
      if (row.id) {
        row = this.currentRow
        row.isedit = false
        this.$set(this.tableData, i, row)
      } else {
        this.tableData.splice(i, 1)
      }
    }
  }
}
</script>

<style scoped lang="scss">
.childSetting{
  ._top{
      display: flex;
      flex-direction: row-reverse;
    }
    .editRow{
      display:flex;
      align-items: center;
      .error{
        color:#f40;
        display: inline-block;
        width: 223px;
      }
    }
}
</style>
