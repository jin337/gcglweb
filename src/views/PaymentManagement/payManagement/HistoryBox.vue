<template>
  <div class="paymanagement_add" v-loading="tableLoading">
    <div class="vux-flexbox flex-content vux-flex-row">
      <span class="main-title">
        历史支付<i :size="16" class="el-icon-success"></i>
      </span>
      <span class="close" @click="handlecancel"><i :size="16" class="el-icon-close"></i></span>
    </div>
    <el-form ref="form" class="search" :inline="true" size="mini">
      <el-form-item label="支付编码">
        <el-input v-model="form.pay_sn" clearable placeholder="请输入支付编码"></el-input>
      </el-form-item>
      <el-form-item label="支付标题">
        <el-input v-model="form.pay_title" clearable placeholder="请输入支付标题"></el-input>
      </el-form-item>
      <el-form-item label="支付状态">
        <el-select v-model="form.pay_status" clearable placeholder="请选择支付状态" @change="getTableData">
          <el-option v-for="item in pay_ip_statusList" :key="item.value" :label="item.label" :value="Number(item.value)">
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="getTableData">查询</el-button>
      </el-form-item>
    </el-form>

    <vxe-table ref="table" :max-height="tableHeight" style="width: 100%;" :data="tableData" show-overflow="title"
      :row-config="{ height: 30, isHover: true }" highlight-current-row>
      <vxe-column title="支付编码" field="pay_sn" width="170px">
      </vxe-column>
      <vxe-column title="支付标题" field="pay_title" width="100px" />
      <vxe-column title="点位数量" field="point_count" width="100px" align="center" />
      <vxe-column title="金额" field="money" header-align="center" align="right" width="100px">
        <template v-slot="{ row }">
          <span>{{ row.money ? formatNum(row.money) : 0 }}</span>
        </template>
      </vxe-column>
      <vxe-column title="操作人" field="create_user_name" width="100px" align="center" />
      <vxe-column title="操作时间" field="create_time" width="100px" align="center">
        <template v-slot="{ row }">
          <span>{{ row.create_time ? parseTime(row.create_time, '{y}-{m}-{d}') : '' }}</span>
        </template>
      </vxe-column>
      <vxe-column title="OA支付编码" field="oa_sn" width="160px" align="center" />
      <vxe-column title="状态" field="pay_status_name" width="80px" align="center" />
      <vxe-column title="操作" header-align="center" width="230px">
        <template v-slot="{ row }">
          <el-button size="small" type="text" @click="handleInfo(row)">详情</el-button>
          <el-button v-if="row.pay_status === 0" size="small" type="text" @click="handleEdit(row)">编辑</el-button>
          <el-button v-if="row.pay_status === 0" size="small" type="text" @click="handleSubmit(row, 1)">提交</el-button>
          <el-button v-if="(row.pay_status === 0 || row.pay_status === 1) && !row.oa_sn" size="small" type="text"
            @click="handleSubmit(row, 3)">作废</el-button>
          <el-button size="small" type="text" @click="handleExport(row)">导出</el-button>
          <el-button size="small" v-if="row.pay_status === 0 && !row.oa_sn" type="text"
            @click="handleDel(row)">删除</el-button>
        </template>
      </vxe-column>
    </vxe-table>

    <el-drawer :with-header="false" :visible.sync="infoFlag" size="1200px" append-to-body>
      <add-box v-if="infoFlag" :infoFlag="infoFlag" :project_code="project_code" :tag="tag" title="支付详情"
        :current="current" @cancel="cancel"></add-box>
    </el-drawer>
    <el-drawer :with-header="false" :visible.sync="editFlag" size="1200px" append-to-body>
      <add-box v-if="editFlag" :editFlag="editFlag" :project_code="project_code" :tag="tag" title="编辑支付"
        :current="current" @cancel="cancel"></add-box>
    </el-drawer>
  </div>
</template>

<script>
import addBox from './AddBox.vue'
import { downloadFile, parseTime, formatNum } from '@/utils/tool'
export default {
  name: 'payManagement_history',
  props: {
    historyFlag: {
      type: Boolean,
      default: false
    },
    project_code: {
      type: String,
      default: ''
    },
    tag: {
      type: Object,
      default: () => {
        return {
          id: 0, name: ''
        }
      }
    }
  },
  components: { addBox },
  data () {
    return {
      form: {
        pay_sn: null,
        pay_title: null,
        pay_status: ''
      },
      pay_ip_statusList: [],
      tableLoading: false,
      tableData: [],
      tableHeight: window.innerHeight - 170,
      infoFlag: false,
      editFlag: false,
      current: null
    }
  },
  mounted () {
    this.getTableData()
    this.getDictList()
    window.onresize = () => {
      this.tableHeight = window.innerHeight - 170
    }
  },
  methods: {
    parseTime,
    formatNum,
    getDictList () {
      const dicts = ['pay_ip_status']
      dicts.forEach(f => {
        this.$dict(this, f).then((res) => {
          if (res.code === 200) {
            const _name = f + 'List'
            this[_name] = res.data || []
          } else {
            this.$message({
              type: 'error',
              message: '字典出错了' + f,
              showClose: true
            })
            this[f + 'list'] = []
          }
        })
      })
    },
    async getTableData () {
      this.tableLoading = true
      const params = {
        project_code: this.project_code,
        tag_id: this.tag.id,
        pay_status: this.form.pay_status !== '' ? this.form.pay_status : -1,
        pay_sn: this.form.pay_sn,
        pay_title: this.form.pay_title
      }
      const { data, code, message } = await this.$pub.post('pay/ip/info/list', params)
      if (code !== 200) {
        this.$message({
          type: 'error',
          message: message || '获取历史支付列表失败',
          showClose: true
        })
        return
      }
      this.tableData = data || []
      this.tableLoading = false
    },
    handlecancel () {
      this.$emit('update:historyFlag', false)
    },
    handleInfo (row) {
      this.current = row
      this.infoFlag = true
      this.editFlag = false
    },
    handleEdit (row) {
      this.current = row
      this.infoFlag = false
      this.editFlag = true
    },
    handleSubmit (row, status) {
      this.$confirm('是否确认本次操作', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {
        // 0暂存  1提交  2OA确认  3作废  0提交变1,0和1作废变3
        const { code, message } = await this.$pub.post('pay/ip/info/edit-status', { id: row.id, status })
        if (code === 200) {
          this.getTableData()
          this.$message({
            type: 'success',
            message: message || '操作成功',
            showClose: true
          })
        } else {
          this.$message({
            type: 'error',
            message: message || '操作失败',
            showClose: true
          })
        }
      }).catch(function () { })
    },
    cancel () {
      this.infoFlag = false
      this.editFlag = false
      this.getTableData()
    },
    handleDel (row) {
      const id = row.id
      this.$confirm('是否确认删除', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {
        const { code, message } = await this.$pub.post('pay/ip/info/del', { id })
        if (code === 200) {
          this.getTableData()
          this.$message({
            type: 'success',
            message: message || '删除成功',
            showClose: true
          })
        } else {
          this.$message({
            type: 'error',
            message: message || '删除失败',
            showClose: true
          })
        }
      }).catch(function () { })
    },
    async handleExport (row) {
      this.tableLoading = true
      const params = {
        id: row.id
      }
      const result = await this.$pub.post(
        'pay/ip/info/exp',
        params,
        {
          headers: {
            'Content-Type': 'application/x-download'
          },
          responseType: 'blob'
        }
      )
      const title = row.pay_sn + '-' + row.pay_title + '付款信息'
      downloadFile(result, title, 'xlsx')
      this.tableLoading = false
    }
  }
}
</script>

<style scoped>
.paymanagement_add {
  padding: 20px;
  width: 100%;
  box-sizing: border-box;
  height: 100%;

  .flex-content {
    box-sizing: border-box;
    width: 100%;
    padding-bottom: 24px;
    justify-content: space-between;
  }

  .main-title {
    font-size: 22px;
    color: #172b4d;

    .el-icon-success {
      margin-left: 4px;
      vertical-align: middle;
    }
  }

  .close {
    cursor: pointer;
    padding: 6px;
  }

  .topwrap {
    display: flex;
  }

  .btns {
    text-align: right;
    margin-top: 40px;
  }
}
</style>
