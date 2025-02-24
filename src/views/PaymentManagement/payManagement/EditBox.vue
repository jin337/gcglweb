<template>
  <div v-loading="submitLoading">
    <div class="vux-flexbox flex-content vux-flex-row">
      <span class="main-title">
        编辑IP<i :size="16" class="el-icon-edit"></i>
      </span>
      <div class="_right">
        <el-button size="small" type="primary" @click="submit">确定</el-button>
      </div>
    </div>
    <el-form ref="form" :model="form" :rules="rules" size="small" label-width="108px" class="vux-flexbox editwrap">
      <el-form-item label="支付设备编码" prop="pay_device_code" style="width:50%;">
        <el-input v-model="form.pay_device_code" :disabled="true" />
      </el-form-item>
      <el-form-item label="付款状态" prop="pay_status" style="width:50%;">
        <!-- <el-input v-model="form.pay_status_name" :disabled="true" /> -->
        <el-select v-model="form.pay_status" :disabled="true">
          <el-option v-for="item in pay_ip_statusList" :key="item.value" :label="item.label" :value="Number(item.value)">
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="当前IP" prop="ip" style="width:50%;">
        <el-input v-model="form.ip" :disabled="true" />
      </el-form-item>
      <el-form-item label="新I P" prop="newIp" style="width:50%;">
        <el-input v-model="form.newIp" placeholder="请输入IP" />
      </el-form-item>
      <el-form-item label="备注" prop="remark" style="width:100%;">
        <el-input v-model="form.remark" type="textarea" />
      </el-form-item>
    </el-form>

    <div class="vux-flexbox flex-content vux-flex-row">
      <span class="main-title">
        修改履历<i :size="16" class="el-icon-edit"></i>
      </span>
    </div>
    <vxe-table class="edittable" v-loading="tableLoading" show-overflow :height="tableHeight" :data="tableData"
      :row-config="{ height: 30, isHover: true }" highlight-current-row>
      <vxe-column title="序号" type="seq" width="60" align="center" />
      <vxe-column title="变更前IP" field="old_ip" width="120px" />
      <vxe-column title="变更后IP" field="new_ip" width="120px" />
      <vxe-column title="操作人" field="create_user_name" width="120px" />
      <vxe-column title="操作时间" field="create_time" align="center" width="120px">
        <template v-slot="{ row }">
          <span>{{ row.create_time ? parseTime(row.create_time, '{y}-{m}-{d}') : '' }}</span>
        </template>
      </vxe-column>
      <vxe-column title="备注" field="remark" header-align="center" />
    </vxe-table>
  </div>
</template>

<script>
import { parseTime } from '@/utils/tool'

export default {
  name: 'pay_mana_edit',
  props: {
    editFlag: {
      type: Boolean,
      default: false
    },
    current: {
      type: Object,
      default: null
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
  data () {
    var ipValid = (rule, value, callback) => {
      const reg = /^((\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.){3}(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])$/
      if ((!reg.test(value)) && value !== '') {
        callback(new Error('ip格式不正确'))
      } else {
        callback()
      }
    }
    return {
      form: {
        pay_device_code: '', pay_status: '', ip: '', newIp: '', remark: ''
      },
      rules: {
        newIp: [
          { required: true, message: '请输入IP', trigger: 'blur' },
          { validator: ipValid, trigger: 'blur' }
        ]
      },
      submitLoading: false,
      tableHeight: 500,
      tableData: [],
      tableLoading: false,
      pay_ip_statusList: []
    }
  },
  mounted () {
    this.initData()
  },
  methods: {
    parseTime,
    initData () {
      this.form.pay_device_code = this.current.pay_device_code
      this.form.pay_status = this.current.pay_status
      this.form.ip = this.current.ip
      this.form.remark = this.current.remark

      this.getTableData()
      this.getTableHeight()
      this.getDictList()
      window.addEventListener('resize', () => this.getTableHeight())
    },
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
        point_code: this.current.point_code,
        pay_device_code: this.current.pay_device_code
      }
      const { data, code, message } = await this.$pub.post('pay/ip/online/record/list', params)
      if (code !== 200) {
        this.$message({
          type: 'error',
          message: message || '获取IP履历列表失败',
          showClose: true
        })
        return
      }
      this.tableData = data || []
      this.tableLoading = false
    },
    getTableHeight () {
      this.$nextTick(() => {
        const el_wrap = document.getElementsByClassName('paymanaEditIp')
        if (el_wrap[0]) {
          const _topedit = document.getElementsByClassName('editwrap')
          const _topheight = _topedit[0] ? _topedit[0].offsetHeight : 0
          this.tableHeight = el_wrap[0].offsetHeight - _topheight - 144
        }
      })
    },
    async submit () {
      this.$refs.form.validate(async (valid) => {
        if (valid) {
          this.submitLoading = true
          const params = {
            id: this.current.id,
            project_code: this.project_code,
            point_code: this.current.point_code,
            tag_id: this.tag.id,
            pay_device_code: this.form.pay_device_code,
            old_ip: this.form.ip,
            new_ip: this.form.newIp,
            remark: this.form.remark
          }
          const { code, message } = await this.$pub.post('/pay/ip/online/edit', params)
          this.submitLoading = false
          if (code !== 200) {
            this.$message({
              type: 'error',
              message: message || '修改IP失败',
              showClose: true
            })
          } else {
            this.$message({
              type: 'success',
              message: message || '修改IP成功',
              showClose: true
            })
            this.cancel()
          }
        }
      })
    },
    cancel () {
      this.$emit('cancel')
    }
  }
}
</script>

<style lang="scss">
.paymanaEditIp {
  padding: 20px;

  .main-title {
    font-size: 22px;
    color: #172b4d;

    .el-icon-edit {
      margin-left: 4px;
      vertical-align: middle;
    }
  }

  ._right {
    margin-left: auto;
  }

  .editwrap {
    margin-top: 20px;
    flex-wrap: wrap;
  }

  .edittable {
    margin-top: 20px;
  }
}
</style>
