<template>
  <div class="mainsubitem dandusub" v-loading="loading">
    <h4 class="btns">
      <el-button class="add" size="small" @click="handleAdd">新增</el-button>
    </h4>
    <ul>
      <li v-for="(item, i) in subItemList" :key="i">
        <div class="item">
          <template v-if="item.isedit">
            <i class="el-icon-finished" @click="handlesure(item)"></i>
            <el-input v-model="item.item_detail_title" size="small" />
          </template>
          <template v-else>
            <i class="el-icon-edit" @click="handleEdit(item)"></i>
            <span>{{ item.item_detail_title }}</span>
          </template>
          <i class="el-icon-delete" @click="handleDel(item)"></i>
        </div>
      </li>
      <li v-if="subItemList.length <= 0">暂无分项明细</li>
    </ul>
  </div>
</template>

<script>
export default {
  name: 'three_subitem',
  inject: ['current'], // current主页的合同
  props: {
    selectedRow: { // 是对应当前的选择行传递过来的信息selectedRow
      type: Object,
      default: null
    },
    subFlag: {
      type: Boolean,
      default: false
    }
  },
  data () {
    return {
      loading: false,
      subItemList: []
    }
  },
  mounted () {
    this.getsubItemList()
  },
  methods: {
    getsubItemList () {
      this.subItemList = (this.selectedRow.child_list || []).map(m => {
        return {
          ...m, isedit: false, pretitle: ''
        }
      })
    },
    handleAdd () {
      const obj = {
        id: null,
        item_detail_title: '',
        isedit: true
      }
      this.subItemList.unshift(obj)
    },
    handleEdit (row) {
      row.isedit = true
    },
    handleDel (row) {
      const id = row.id
      this.$confirm('是否确认删除', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.loading = true
        return this.$pub.post('contract/item/detail/del', { id })
      }).then(() => {
        const _index = this.subItemList.findIndex(f => f.id === id)
        this.subItemList.splice(_index, 1)
        this.loading = false
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
    },
    async handlesure (row) {
      if (!row.item_detail_title) {
        return this.$notify.error({
          title: '分项明细不能为空',
          message: ''
        })
      }
      this.loading = true
      const params = row.id ? {
        id: row.id,
        item_detail_title: row.item_detail_title
      } : {
        contract_id: this.current.id, // 合同主键
        item_detail_title: row.item_detail_title,
        item_id: this.selectedRow.id
      }
      const url = row.id ? 'contract/item/detail/edit' : 'contract/item/detail/add'
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
      }
      row.isedit = false
    }
  }
}
</script>

<style lang="scss">
.el-dialog__body {
  .mainsubitem {
    max-height: 400px;
    overflow: auto;
    padding-bottom: 20px;

    .dandusub {
      .el-button--default {
        color: #344563;
        background-color: #f4f5f7;
        border-color: #f4f5f7;
      }
    }
  }
}
</style>
