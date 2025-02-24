<template>
  <!-- 施工范围 -->
  <div class="two_tab disabled" v-loading="loading">
    <div class="serach">
      <el-radio-group v-model="searchRadio" size="small" :disabled="isLook">
        <el-radio-button :label="o.dict_value" v-for="o in typeList" :key="o.dict_value" class="text item">{{ o.dict_label
        }}</el-radio-button>
      </el-radio-group>
    </div>

    <div class="content">
      <div class="wrap1" v-if="searchRadio === config.child">
        <!-- 子系统 -->
        <el-checkbox :indeterminate="child.isIndeterminate" v-model="child.checkAll"
          @change="(val) => handleCheckAllChange(val, 'child')" :disabled="isLook">全选</el-checkbox>
        <el-checkbox-group v-model="child.checkedList" :disabled="isLook"
          @change="(val) => handleCheckedCitiesChange(val, 'child')">
          <el-checkbox v-for="item in child.list" :label="item.key" :key="item.key">{{ item.value }}</el-checkbox>
        </el-checkbox-group>
      </div>
      <!-- 区域 -->
      <div class="wrap1" v-if="searchRadio === config.area">
        <el-checkbox :indeterminate="area.isIndeterminate" :disabled="isLook" v-model="area.checkAll" label="全选"
          @change="(val) => handleCheckAllChange(val, 'area')">全选</el-checkbox>
        <el-checkbox-group v-model="area.checkedList" :disabled="isLook"
          @change="(val) => handleCheckedCitiesChange(val, 'area')">
          <el-checkbox v-for="item in area.list" :label="item.key" :key="item.key">{{ item.value }}</el-checkbox>
        </el-checkbox-group>
      </div>
      <!-- 标签 -->
      <div class="wrap1" v-if="searchRadio === config.tag">
        <el-checkbox :indeterminate="tag.isIndeterminate" :disabled="isLook" v-model="tag.checkAll" label="全选"
          @change="(val) => handleCheckAllChange(val, 'tag')">全选</el-checkbox>
        <el-checkbox-group v-model="tag.checkedList" :disabled="isLook"
          @change="(val) => handleCheckedCitiesChange(val, 'tag')">
          <el-checkbox v-for="item in tag.list" :label="item" :key="item">{{ item }}</el-checkbox>
        </el-checkbox-group>
      </div>
      <!-- 点位 -->
      <el-card class="wrap" v-if="searchRadio === config.point">
        <div class="_left">
          <h3>可选点位</h3>
          <div class="search">
            <el-input v-model="leftSearch" style="width:200px;" placeholder="请输入点位名称/编码" size="small" clearable
              @clear="handleQuery" @keyup.enter.native="handleQuery"></el-input>
            <el-button size="mini" @click="handleQuery" type="primary">查询</el-button>
          </div>
          <el-table :data="leftData" :height="tableHeight" ref="multipleTable" :row-class-name="tableRowClassName"
            style="width: 100%">
            <el-table-column width="36" v-if="!isLook">
              <template slot-scope="scope">
                <span style="color:#409EFF;cursor:pointer;" v-if="!scope.row.isSelected" @click="addPoint(scope.row)"><i
                    class="el-icon-plus"></i></span>
              </template>
            </el-table-column>
            <el-table-column prop="point_code" label="点位编码" show-overflow-tooltip width="150px"></el-table-column>
            <el-table-column prop="point_name" label="点位名称" show-overflow-tooltip></el-table-column>
          </el-table>
          <el-pagination layout="prev, pager, next,sizes" :total="total" :page-size.sync="page.page_size"
            @current-change="pageChange" @size-change="sizeChange" :current-page.sync="page.page_no" class="pagination"
            small background>
          </el-pagination>
        </div>
        <div class="_right">
          <h3>已选点位</h3>
          <div class="search">
            <el-input v-model="rightSearch" size="small" style="width:200px;" placeholder="请输入点位名称/编码"
              clearable></el-input>
            <el-button size="mini" @click="searchSelected" type="primary">查询</el-button>
            <!-- <el-button size="mini" @click="handleUpload" icon="el-icon-upload" style="margin-left:auto;"
              v-if="!isLook">导入</el-button> -->
          </div>
          <vxe-table show-overflow :height="tableHeight" :data="rightData" :row-config="{ height: 30, isHover: true }"
            highlight-current-row :tooltip-config="{ zIndex: 9999 }">
            <vxe-column field="point_code" title="点位编码" width="150px">
              <template v-slot="{ row }">
                <span v-html="getPointShow(row, 'point_code')"></span>
              </template>
            </vxe-column>
            <vxe-column field="point_name" title="点位名称" min-width="220px">
              <template v-slot="{ row }">
                <span v-html="getPointShow(row, 'point_name')"></span>
              </template>
            </vxe-column>
            <vxe-column title="操作" width="80px" v-if="!isLook">
              <template v-slot="row">
                <el-button size="mini" type="text" @click="del(row)">删除</el-button>
              </template>
            </vxe-column>
          </vxe-table>
        </div>
      </el-card>
    </div>
    <div class="dialog-footer" :style="{ 'marginTop': searchRadio === config.point ? '-40px' : '0' }" v-if="!isLook">
      <el-button size="mini" type="primary" @click="handleSure">确定</el-button>
    </div>

    <el-dialog title="导入点位" :visible.sync="uploadFlag" :append-to-body="true" width="400px">
      <div class="wrap_up">
        <el-upload drag ref="uploadFile" action="#" accept=".xlsx" :auto-upload="false" :on-error="handleError"
          :before-upload="beforeAvatarUpload" :file-list="fileList" :http-request="httpRequest" :on-change="handleChange"
          :on-remove="handleRemove">
          <i class="el-icon-upload"></i>
          <div class="el-upload__text">选取文件<em></em></div>
        </el-upload>
        <div class="el-upload__tip" slot="tip">
          <p>导入须知:</p>
          <p>1.文件格式目前仅支持XLSX</p>
          <p>2.单次只能上传一份文件</p>
          <p>3.导入的点位编码必须与平台一致</p>
        </div>
        <div class="dialog-footer" :style="{ 'marginTop': searchRadio === config.point ? '-40px' : '0' }">
          <el-button size="mini" type="primary" @click="submitUpload" :disabled="fileList.length <= 0">确定</el-button>
          <el-button size="mini" @click="cancelUpload">取消</el-button>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: 'contract_tab_2',
  inject: ['current', 'isLook'],
  data () {
    return {
      loading: false,
      searchRadio: 1,
      typeList: [],
      child: {
        isIndeterminate: false,
        checkAll: false,
        list: [],
        checkedList: []
      },
      area: {
        isIndeterminate: false,
        checkAll: false,
        list: [],
        checkedList: []
      },
      tag: {
        isIndeterminate: false,
        checkAll: false,
        list: [],
        checkedList: []
      },
      config: {
        child: 2,
        area: 3,
        tag: 4,
        point: 5
      },
      leftData: [],
      rightData: [],
      tableHeight: window.innerHeight - 350,
      total: 0,
      page: {
        page_no: 1,
        page_size: 10
      },
      leftSearch: '',
      rightSearch: '',
      allSelectData: [],
      // 导入
      uploadFlag: false,
      fileList: [],
      file: []
    }
  },
  mounted () {
    this.getChildList()
    this.getAreaList()
    this.getTagList()
    this.getPointList()
    this.getDictData()
    this.$nextTick(() => this.init())

    window.onresize = () => {
      this.tableHeight = window.innerHeight - 350
    }
  },
  methods: {
    async getDictData () {
      const { data, code, message } = await this.$pub.post('/sys/dict/list-slt', { dict_label: 'contract_range_type' })
      if (code === 200) {
        this.typeList = (data || []).map(m => {
          return {
            dict_value: Number(m.value),
            dict_label: m.label
          }
        })
      } else {
        this.$notify.error({
          title: '查询失败',
          message: message
        })
      }
    },
    // 全选start
    handleCheckAllChange (val, item) {
      if (val) {
        this[item].checkAll = true// 全选
        this[item].isIndeterminate = false// 半选
        this[item].checkedList = this[item].list.map(m => {
          return m.key !== undefined ? m.key : m
        })
      } else {
        this[item].checkAll = false// 全选
        this[item].isIndeterminate = false// 半选
        this[item].checkedList = []
      }
    },
    handleCheckedCitiesChange (val, item) {
      const checkedCount = val.length
      this[item].checkAll = checkedCount === this[item].list.length
      this[item].isIndeterminate = checkedCount > 0 && checkedCount < this[item].list.length
    },
    async getChildList () {
      try {
        const { data, code, message } = await this.$pub.post('project/child-list', { project_id: this.current.project_id })
        if (code === 200) {
          this.child.list = data || []
        } else {
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
        const { data, code, message } = await this.$pub.post('/project/area-list', { project_id: this.current.project_id })
        if (code === 200) {
          this.area.list = data || []
        } else {
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
    async getTagList () {
      const { data, code, message } = await this.$pub.post('/point/get-tag-list', {
        projectCode: this.current.project_code
      })
      if (code === 200) {
        this.tag.list = data || []
      } else {
        this.tag.list = []
        this.$message({
          type: 'error',
          message: message || '获取标签出错了',
          showClose: true
        })
      }
    },
    // 获取详情
    async init () {
      this.child.checkedList = []
      this.area.checkedList = []
      this.tag.checkedList = []
      this.rightData = []
      if (this.current.range_type !== 0) {
        this.searchRadio = this.current.range_type
        this.loading = true
        const params = {
          contract_id: this.current.id, // 合同主键
          project_code: this.current.project_code, // 项目编码
          range_type: this.searchRadio // 范围类型（1全部，2子系统3区域名称4标签名称5点位编
        }
        const { data, code } = await this.$pub.post('contract/range/list', params)
        this.loading = false
        if (code === 200) {
          const ids = data || []
          if (this.searchRadio === this.config.child) {
            this.child.checkedList = (ids || []).map(m => m.range_value)
            this.handleCheckedCitiesChange(this.child.checkedList, 'child')
          } else if (this.searchRadio === this.config.point) {
            this.rightData = (ids || []).map(m => {
              return {
                point_code: m.range_value,
                point_name: m.range_name
              }
            })
          } else if (this.searchRadio === this.config.area) {
            this.area.checkedList = (ids || []).map(m => m.range_value)
            this.handleCheckedCitiesChange(this.area.checkedList, 'area')
          } else if (this.searchRadio === this.config.tag) {
            this.tag.checkedList = (ids || []).map(m => m.range_value)
            this.handleCheckedCitiesChange(this.tag.checkedList, 'tag')
          }
        } else {
          this.$message({
            type: 'error',
            message: '获取详情失败',
            showClose: true
          })
        }
      } else {
        this.searchRadio = 1
      }
    },
    async getPointList () {
      this.loading = true
      const params = {
        project_id: 19,
        point_name: this.leftSearch,
        page_no: this.page.page_no,
        page_size: this.page.page_size
      }
      const { code, data, message } = await this.$pub.post('project/project-point', params)
      this.loading = false
      if (code !== 200) {
        this.leftData = []
        this.total = 0
        return this.$message({
          type: 'error',
          message: message || '查询出错了',
          showClose: true
        })
      } else {
        this.leftData = data.list || []
        this.total = data.total

        // const selectIds = this.rightData.map(m => Number(m.point_code))
        // if (selectIds.length > 0) {
        // this.$nextTick(() => {
        //   this.leftData.forEach((f, i) => {
        //     if (selectIds.includes(f.point_code)) {
        //       this.$refs.multipleTable.toggleRowSelection(f, true)
        //     }
        //   })
        // })
        // }
      }
    },
    handleQuery () {
      this.page.page_no = 1
      this.getPointList()
    },
    pageChange (num) {
      this.page.page_no = num
      this.getPointList()
    },
    sizeChange (val) {
      this.page.page_size = val
      this.getPointList()
    },
    searchSelected () {
      const tempData = []
      const otherData = []
      this.rightData.forEach(f => {
        if (f.point_name.indexOf(this.rightSearch) > -1 || f.point_code.indexOf(this.rightSearch) > -1) {
          tempData.push(f)
        } else {
          otherData.push(f)
        }
      })
      this.rightData = tempData.concat(otherData)
    },
    getPointShow (row, type) {
      const value = row[type]
      let show = row[type]
      const num = value ? value.toLowerCase().indexOf(this.rightSearch.toLowerCase()) : -1
      if (num > -1) {
        const searchName = value.substr(num, this.rightSearch.length)
        const replaceReg = new RegExp(this.rightSearch, 'ig')
        const replaceString = '<span style="background: #ffff00;">' + searchName + '</span>'
        show = (value || '').replace(replaceReg, replaceString)
      }
      return show
    },
    tableRowClassName ({ row }) {
      if (this.rightData.length <= 0) {
        row.isSelected = false
      }
      this.rightData.some(s => {
        if (s.point_code === row.point_code) {
          row.isSelected = true
          return true
        } else {
          row.isSelected = false
        }
      })
      return row.isSelected ? 'selected' : ''
    },
    addPoint (row) {
      this.rightData.push(row)
    },
    del (row) {
      const _index = row.rowIndex
      this.$confirm('确定删除吗?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.rightData.splice(_index, 1)
        this.$message({
          type: 'success',
          message: '删除成功!',
          showClose: true
        })
      }).catch(() => {
        this.$message({
          type: 'info',
          message: '已取消删除',
          showClose: true
        })
      })
    },
    // 确定
    async handleSure () {
      const range_type = this.searchRadio
      this.loading = true
      let ids = []
      switch (range_type) { // type为1存项目id,type为2存子系统id,type为3存区域名称,type为4存标签名称,type为5存点位id
        case 1:
          ids = [this.current.project_id + '']
          break
        case 2:
          ids = this.child.checkedList
          break
        case 3:
          ids = this.area.checkedList
          break
        case 4:
          ids = this.tag.checkedList
          break
        case 5:
          ids = this.rightData.map(m => m.point_code + '')
          break
        default:
          break
      }
      console.log(ids)
      this.loading = false
      if (ids.length <= 0) {
        this.$message({
          type: 'error',
          message: '至少选择一个',
          showClose: true
        })
      } else {
        const params = {
          contract_id: this.current.id,
          range_type,
          list: ids.map(m => {
            return {
              contract_id: this.current.id,
              range_value: m
            }
          })
        }
        const { code, message } = await this.$pub.post('contract/range/save', params)

        if (code !== 200) {
          this.$message({
            type: 'error',
            message: message || '编辑失败',
            showClose: true
          })
        } else {
          this.$message({
            type: 'success',
            message: '编辑成功',
            showClose: true
          })
        }
      }
    },
    // 导入点位
    handleUpload () {
      this.uploadFlag = true
    },
    beforeAvatarUpload (file) {
      const fileType = file.name.substring(file.name.lastIndexOf('.') + 1)
      const isvsdx = fileType === 'xlsx'
      if (!isvsdx) {
        this.$message({
          type: 'error',
          message: '文件格式目前仅支持XLSX',
          showClose: true
        })
      }
      return isvsdx
    },
    handleError (e, file, fileList) {
      const msg = JSON.parse(e.message)
      this.$notify({
        title: msg.message,
        type: 'error',
        duration: 0
      })
    },
    httpRequest (param) {
      this.file.push(param.file)
    },
    handleChange (file, fileList) {
      if (fileList.length > 0) {
        this.fileList = [fileList[fileList.length - 1]]
      }
    },
    handleRemove (file, fileList) {
      this.fileList = []
    },
    async submitUpload () {
      this.loading = true
      this.$refs.uploadFile.submit()
      const query_info = {
      }
      const upData = new FormData()
      if (this.file.length > 0) {
        this.file.forEach((file) => {
          upData.append('file', file, file.name)
        })
      } else {
        upData.append('file', null)
      }
      upData.append('query_info', JSON.stringify(query_info))
      // const { data, code, message } = await this.$pub.post('', upData)
      // if (code !== 200) {
      //   this.$message({
      //     message: message,
      //     type: 'info',
      //     showClose: true,
      //     customClass: 'uploadMessage'
      //   })
      // } else {
      //   this.$message({
      //     message: message,
      //     type: 'success',
      //     showClose: true,
      //     customClass: 'uploadMessage'
      //   })
      const data = [
        { point_code: 'SQ-GWQ-SS-01', point_name: '三环西路襄王路路口' },
        { point_code: 'SQ-GWQ-SS-02', point_name: '三环西路苏丁路路口' }
      ]
      if (data && data.length > 0) {
        this.rightData = this.rightData.concat(data)
      }
      this.uploadFlag = false
      // }
      this.loading = false
      this.file = []
      this.fileList = []
    },
    cancelUpload () {
      this.uploadFlag = false
      this.file = []
      this.fileList = []
    }
  }
}
</script>

<style lang="scss">
.contract_managee_tab {
  .two_tab {

    .content {
      margin-top: 20px;

      .wrap1 {
        .el-checkbox {
          min-width: 150px;
          margin-bottom: 20px;
        }
      }

      .el-card__body {
        display: flex;
      }

      .wrap {

        width: 100%;

        .search {
          margin: 10px 0;
          display: flex;
          align-items: center;
          width: 100%;

          .el-button--mini {
            padding: 8px 15px;
          }

          .el-input__inner {
            // height: 30px;
          }
        }

        .module {
          .el-form-item {
            margin-bottom: 0;
          }

          .line {
            display: inline-block;
            width: 3px;
            height: 14px;
            background: #4DD2D2;
            vertical-align: middle;
            margin-right: 4px;
          }

          span {
            vertical-align: middle;
          }

        }

        .el-table {
          td {
            padding: 3px 0;
          }

          thead {
            th.el-table__cell {
              background: #f8f8f9;
              color: #606266;
              border-top: 1px solid #eee;
            }
          }
        }

        ._left {
          border-right: 1px solid #eee;
          padding-right: 10px;
          width: 50%;

          h3 {
            color: #606266
          }

          .el-table__row.selected {
            background: #535457;
            color: #fff !important;

            i,
            span {
              color: #fff !important;
            }
          }

          .el-table--enable-row-hover .el-table__body .selected:hover>td {
            background-color: #535457;
            color: #fff !important;

            i,
            span {
              color: #fff !important;
            }
          }
        }

        ._right {
          padding-left: 10px;
          width: 50%;

          h3 {
            color: #606266
          }

          .cell .el-button {
            padding: 0;
          }
        }

      }
    }

  }

  .dialog-footer {
    margin-right: 20px;
  }
}
</style>
