<template>
  <div class="mainsubModel dandusub disabled" v-loading="loading">
    <div class="_left">
      <vxe-table border resizable show-overflow ref="xTable" :data="device_typeList" @cell-click="getRightData"
        :row-class-name="tableRowClassName" :height="500">
        <vxe-column type="seq" width="60" title="序号"></vxe-column>
        <vxe-column field="label" title="物料类型">
          <template #default="{ row }">
            <span style="cursor:pointer;">{{ row.label }}</span>
          </template>
        </vxe-column>
      </vxe-table>
    </div>
    <div class="_right">
      <vxe-table border resizable show-overflow ref="xTable" :data="subItemList" :height="500">
        <vxe-column field="item_detail_title" title="分项明细">
          <template #header>
            <span>分项明细</span>
            <el-button style="margin-left:20px;" size="mini" type="primary" @click="handleAdd"
              v-if="selectRow">新增</el-button>
          </template>
          <template #default="{ row }">
            <vxe-input v-if="row.isedit" v-model="row.item_detail_title" type="text"></vxe-input>
            <span v-else>{{ row.item_detail_title }}</span>
          </template>
        </vxe-column>
        <vxe-column title="操作" width="160">
          <template #default="{ row, rowIndex }">
            <template v-if="row.isedit">
              <el-button size="mini" @click="saveRowEvent(row)">保存</el-button>
              <el-button size="mini" @click="cancelRowEvent(row, rowIndex)">取消</el-button>
            </template>
            <template v-else>
              <el-button size="mini" type="primary" @click="editRowEvent(row)">编辑</el-button>
              <el-button size="mini" @click="handleDel(row)">删除</el-button>
            </template>
          </template>
        </vxe-column>
      </vxe-table>
    </div>
  </div>
</template>

<script>
export default {
  name: 'three_submodel',
  inject: ['current'], // current主页的合同
  props: {
    subModelFlag: {
      type: Boolean,
      default: false
    }
  },
  data () {
    return {
      loading: false,
      selectRow: null,
      device_typeList: [],
      subItemList: []
    }
  },
  mounted () {
    this.getDevice_type()
  },
  methods: {
    // 获取物料类型
    getDevice_type () {
      this.$dict(this, 'device_type').then(res => {
        if (res.code === 200) {
          this.device_typeList = (res.data || []).map(m => {
            return {
              value: Number(m.value),
              label: m.label
            }
          })
        } else {
          this.$message({
            type: 'error',
            message: '字典获取出错了device_type',
            showClose: true
          })
          this.device_typeList = []
        }
      })
    },
    getRightData ({ row }) {
      this.selectRow = row
      this.getsubItemList()
    },
    async getsubItemList () {
      this.loading = true
      const { data, code, message } = await this.$pub.post('contract/item/detail/template/list', { device_type: this.selectRow.value })
      if (code !== 200) {
        this.$message({
          type: 'error',
          message: message || '获取列表失败',
          showClose: true
        })
        return
      }
      this.subItemList = (data || []).map(m => {
        return {
          ...m, isedit: false, pretitle: ''
        }
      })
      this.loading = false
    },
    tableRowClassName ({ row, rowIndex }) {
      row.index = rowIndex
      return this.selectRow && row.value === this.selectRow.value ? 'isActive' : ''
    },
    handleAdd () {
      const obj = {
        id: '',
        item_detail_title: '',
        isedit: true,
        pretitle: ''
      }
      this.subItemList.unshift(obj)
    },
    editRowEvent (row) {
      row.isedit = true
      row.pretitle = row.item_detail_title
    },
    async saveRowEvent (row) {
      if (!row.item_detail_title) {
        return this.$notify.error({
          title: '分项明细不能为空',
          message: ''
        })
      }
      this.loading = true
      const params = {
        id: row.id ? row.id : null,
        device_type: this.selectRow.value,
        item_detail_title: row.item_detail_title
      }
      const url = row.id ? 'contract/item/detail/template/edit' : 'contract/item/detail/template/add'
      const { code, message } = await this.$pub.post(url, params)
      this.loading = false
      if (code !== 200) {
        this.$message({
          message: message || '确认失败',
          type: 'info',
          showClose: true,
          customClass: 'uploadMessage'
        })
      } else {
        this.$message({
          message: '确认成功',
          type: 'success',
          showClose: true,
          customClass: 'uploadMessage'
        })
        this.getsubItemList()
      }
    },
    cancelRowEvent (row, rowIndex) {
      if (row.pretitle) {
        row.item_detail_title = row.pretitle
        row.isedit = false
        row.pretitle = ''
      } else {
        this.subItemList.splice(rowIndex, 1)
      }
    },
    handleDel (row) {
      const id = row.id
      this.$confirm('是否确认删除', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        return this.$pub.post('contract/item/detail/template/del', { id })
      }).then(() => {
        this.getsubItemList()
        this.$message({
          type: 'success',
          message: '删除成功',
          showClose: true
        })
      }).catch(function () {
        this.$message({
          type: 'success',
          message: '已取消删除',
          showClose: true
        })
      })
    }
  }
}
</script>

<style lang="scss">
.el-dialog__body {
  .mainsubModel {
    // max-height: 400px;
    overflow: auto;
    display: flex;

    ._left {
      padding-right: 20px;
      box-sizing: border-box;
      width: 240px;

      .isActive {
        background: #f2f3fd;
      }
    }

    ._right {
      width: calc(100% - 240px);
    }
  }
}
</style>
