<template>
  <div class="directNums">
    <div class="_top">
      <el-button size="mini" @click="add" type="primary"
        v-if="!is_lock && checkPermission(['points:directAdd'])">新增方向</el-button>
    </div>
    <el-table :data="tableData" size="mini" height="350px" style="margin-top:0;">
      <el-table-column prop="point_code" label="位置编码">
        <template slot-scope="scope">
          <span>{{ scope.row.point_code }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="direct_name" align="center" label="方向" min-width="100">

        <template slot-scope="scope">
          <span v-if="!scope.row.isedit">{{ scope.row.direct_name }}</span>
          <el-input v-else v-model="scope.row.direct_name" size="mini" ref="inputcode"></el-input>
        </template>
      </el-table-column>
      <el-table-column prop="lng_lat" label="经纬度" min-width="180">

        <template slot-scope="scope">
          <span v-if="!scope.row.isedit">{{ scope.row.lng_lat }}</span>
          <span v-else :class="{ errmsg: scope.row.error, lnglat: true }">
            <el-input v-model="scope.row.lng_lat" size="mini" @blur="validate(scope.row, scope.$index)"></el-input>
            <span>{{ scope.row.error }}</span>
          </span>
        </template>
      </el-table-column>
      <el-table-column prop="photo_address" label="标准地址"></el-table-column>
      <el-table-column label="操作" align="center" v-if="!is_lock">

        <template slot-scope="scope">
          <el-button type="text" @click="edit(scope.row, scope.$index)"
            v-if="!scope.row.isedit && checkPermission(['points:directEdit'])">编辑</el-button>
          <el-button type="text" @click="sure(scope.row, scope.$index)" v-loading="scope.row.addLoading"
            v-if="scope.row.isedit">确认</el-button>
          <el-button type="text" @click="cancle(scope.row, scope.$index)" v-if="scope.row.isedit">取消</el-button>
          <el-button type="text" v-if="tableData.length > 1 && checkPermission(['points:directDel'])"
            @click="del(scope.row, scope.$index)">删除</el-button>

        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script>
import { checkPermission } from '@/utils/tool'
import config from '@/config/config.js'
export default {
  name: 'direct_nums',
  props: {
    pointInfo: {
      required: true
    },
    project_code: {
      required: true
    },
    is_lock: { // 是否被锁定
      default: false
    }
  },
  data () {
    return {
      tableData: [],
      loading: false,
      currentRow: null
    }
  },
  computed: {

  },
  mounted () {
    this.getData()
  },
  components: {

  },
  methods: {
    checkPermission,
    async getData () {
      this.loading = true
      const params = {
        project_code: this.project_code,
        point_code: this.pointInfo.point_code
      }
      this.tableData = []
      const { data, code, message } = await this.$pub.post('/point/manage/direct-list', params)
      this.loading = false
      if (code !== 200) {
        return this.$message({
          type: 'error',
          message: message || '获取列表出错了',
          showClose: true
        })
      } else {
        this.tableData = data.map(m => {
          return {
            ...m,
            lng_lat: m.lng ? m.lng + ',' + m.lat : ''
          }
        })
      }
    },
    add () {
      this.currentRow = null
      const row = this.tableData[this.tableData.length - 1]
      if (row) {
        if (!row.direct_name) {
          return this.$message({
            type: 'error',
            message: '方向不能为空',
            showClose: true
          })
        }
        if (row.isedit) {
          return this.$message({
            type: 'error',
            message: '先保存新增的方向',
            showClose: true
          })
        }
      }

      const arrs = this.pointInfo.lng_lat ? this.pointInfo.lng_lat.split(',') : []
      this.tableData.push({
        point_code: '',
        direct_name: '',
        isedit: true,
        lng_lat: this.pointInfo.lng_lat ? this.pointInfo.lng_lat : '',
        lat: arrs[1],
        lng: arrs[0]
      })
      this.$nextTick(() => {
        const id = 'inputcode'
        this.$refs[id].focus()
      })
    },
    edit (row, i) {
      row.isedit = true
      this.$set(this.tableData, i, row)
      this.currentRow = Object.assign({}, row)
    },
    async del (row, i) {
      this.$confirm('是否确认删除数据?', '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {
        if (row.point_id) {
          row.delLoading = true
          this.$set(this.tableData, i, row)
          const params = {
            project_code: this.project_code,
            point_code: this.pointInfo.point_code,
            direct_name: row.direct_name,
            point_id: row.point_id + ''
          }
          const { code, message } = await this.$pub.post('/point/manage/direct-delete', params)
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
        row.delLoading = true
      })
    },
    validate (row, i) {
      if (!row.lng_lat) {
        row.lng = null
        row.lat = null
        row.error = null
        this.$set(this.tableData, i, row)
        return
      }

      // str.replace(/(\s*)|(\s*$)/g, '')
      let val = row.lng_lat.replace(/(\s*)|(\s*$)/g, '')
      val = val.replace('，', ',')

      if (val.indexOf(',') > -1 && val.indexOf(',') === val.lastIndexOf(',')) {
        const arrs = val.split(',')
        var longrg = config.lng
        var latreg = config.lat

        const lngBoolean = longrg.test(arrs[0])
        const latBoolean = latreg.test(arrs[1])
        if (!lngBoolean || !latBoolean) {
          this.$message({
            type: 'error',
            message: config.msg2,
            showClose: true
          })
          row.error = config.msg2
        } else {
          const params = val.split(',')
          row.lng = params[0] || ''
          row.lat = params[1] || ''
          row.error = null
        }
      } else {
        this.$message({
          type: 'error',
          message: '输入格式不正确，必须经度纬度逗号隔开',
          showClose: true
        })
        row.error = '输入格式不正确，必须经度纬度逗号隔开'
      }
      this.$set(this.tableData, i, row)
    },
    async sure (row, i) {
      if (!row.direct_name) {
        return this.$message({
          type: 'error',
          message: '方向不能为空',
          showClose: true
        })
      }
      if (row.error) {
        return this.$message({
          type: 'error',
          message: '经纬度有误',
          showClose: true
        })
      }
      row.addLoading = true
      this.$set(this.tableData, i, row)
      const params = {
        project_code: this.project_code,
        point_code: this.pointInfo.point_code,
        direct_name: row.direct_name,
        lng: row.lng ? row.lng : '0',
        lat: row.lat ? row.lat : '0'
      }
      const editParams = Object.assign(
        { point_id: row.point_id + '' }, params
      )
      const { code, message } = row.point_id ? await this.$pub.post('/point/manage/direct-edit', editParams) : await this.$pub.post('/point/manage/direct-add', params)
      if (code === 200) {
        row.isedit = false
        row.addLoading = false
        this.$message({
          type: 'success',
          message: row.point_id ? '修改成功' : '新增成功',
          showClose: true
        })
        this.getData()
        // this.$set(this.tableData,i,row);
      } else {
        row.addLoading = false
        this.$set(this.tableData, i, row)
        this.$message({
          type: 'error',
          message: message || '确认失败',
          showClose: true
        })
      }
    },
    cancle (row, i) {
      if (row.point_id) {
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
.directNums {
  ._top {
    display: flex;
    flex-direction: row-reverse;
  }

  .lnglat {
    .el-input {
      width: 100%;
    }
  }

  .errmsg {
    display: flex;

    .el-input {
      width: 100px;
    }

    span {
      color: #f40;
    }
  }
}
</style>
