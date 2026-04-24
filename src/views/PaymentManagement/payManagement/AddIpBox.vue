<template>
  <div class="paymanagement_add" v-loading="loading">
    <div class="vux-flexbox flex-content vux-flex-row">
      <span class="main-title">
        新建IP<i :size="16" class="el-icon-circle-plus-outline"></i>
      </span>
      <span class="close" @click="cancel"><i :size="16" class="el-icon-close"></i></span>
    </div>

    <el-form ref="form" class="topwrap" :model="form" :rules="rules" label-width="108px">
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item prop="project_code" label="项目编码">
            <el-select v-model="form.project_code" placeholder="请选择项目" @change="handleProjectchange">
              <el-option v-for="item in projectList" :key="item.id" :label="item.project_name"
                :value="item.project_code"></el-option>
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="点位编码" prop="point">
            <el-select v-model="form.point" placeholder="请模糊查询点位编码" :disabled="!form.project_code" value-key="point_code"
              filterable remote :remote-method="remoteMethod" :loading="pointLoading">
              <el-option v-for="item in pointList" :key="item.point_code" :value="item" :label="item.point_code">
                <span style="float: left">{{ item.point_name }}</span>
                <span style="float: right; color: #8492a6; font-size: 13px">{{ item.point_code }}</span>
              </el-option>
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="点位名称" prop="point">
            <el-input readonly v-model="form.point.point_name" placeholder="请模糊查询点位编码"></el-input>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="IP" prop="ip">
            <el-input v-model="form.ip" placeholder="请输入IP"></el-input>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="标签" prop="tag">
            <el-select v-model="form.tag" clearable placeholder="请选择标签" value-key="id">
              <el-option v-for="item in tagList" :key="item.id" :label="item.name" :value="item">
              </el-option>
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="初始状态" prop="init_status">
            <el-select v-model="form.init_status" clearable placeholder="请选择初始状态">
              <el-option v-for="item in pay_ip_init_statusList" :key="item.value" :label="item.label"
                :value="Number(item.value)">
              </el-option>
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="初始类型" prop="pay_ip_type">
            <el-select v-model="form.pay_ip_type" clearable placeholder="请选择初始类型">
              <el-option v-for="item in pay_ip_typeList" :key="item.value" :label="item.label"
                :value="Number(item.value)">
              </el-option>
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12" v-if="form.init_status === 1">
          <el-form-item label="测通时间" prop="online_date">
            <el-date-picker v-model="form.online_date" align="right" value-format="yyyy-MM-dd" style="width:100%;">
            </el-date-picker>
          </el-form-item>
        </el-col>
        <el-col :span="12" v-if="form.init_status === 1">
          <el-form-item label="状态变更时间" prop="change_status_date">
            <el-date-picker v-model="form.change_status_date" align="right" value-format="yyyy-MM-dd" style="width:100%;">
            </el-date-picker>
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <el-form-item style="width:100%;text-align: right;">
            <el-button @click="cancel" size="small">取消</el-button>
            <el-button @click="handleOPear" type="primary" size="small">确定</el-button>
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>

  </div>
</template>

<script>
import { checkPermission } from '@/utils/tool'
export default {
  name: 'payManagement_ipadd',
  props: {
    addIPFlag: { // 新建
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
  data () {
    var ipValid = (rule, value, callback) => {
      const reg = /^((\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.){3}(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])$/
      if ((!reg.test(value)) && value !== '') {
        callback(new Error('ip格式不正确'))
      } else {
        callback()
      }
    }
    var pointValid = (rule, value, callback) => {
      if (!value.point_code) {
        callback(new Error('模糊查询点位'))
      } else {
        callback()
      }
    }
    return {
      form: {
        project_code: null,
        point: {
          point_name: '',
          point_code: null
        },
        ip: '',
        tag: null,
        init_status: null,
        pay_ip_type: null,
        online_date: null,
        change_status_date: null
      },
      projectList: [],
      pointLoading: false,
      pointList: [],
      tagList: [],
      pay_ip_init_statusList: [], // 初始状态list
      pay_ip_typeList: [], // 支付类型
      rules: {
        project_code: [
          { required: true, message: '请选择项目', trigger: 'blur' }
        ],
        point: [
          { required: true, message: '请模糊查询点位', trigger: 'blur' },
          { validator: pointValid, trigger: 'blur' }
        ],
        'point.point_name': [
          { required: true, message: '请模糊查询点位', trigger: 'blur' }
        ],
        ip: [
          { required: true, message: '请输入IP', trigger: 'blur' },
          { validator: ipValid, trigger: 'blur' }
        ],
        tag: [
          { required: true, message: '请选择标签', trigger: 'blur' }
        ],
        init_status: [
          { required: true, message: '请选择初始状态', trigger: 'blur' }
        ],
        pay_ip_type: [
          { required: true, message: '请选择支付类型', trigger: 'blur' }
        ],
        online_date: [
          { required: true, message: '请选择测通时间', trigger: 'blur' }
        ],
        change_status_date: [
          { required: true, message: '请选择状态变更时间', trigger: 'blur' }
        ]
      },
      loading: false
    }
  },
  created () {
    this.init()
  },
  mounted () {
  },
  methods: {
    checkPermission,
    init () {
      this.getProjectList()
      this.getDictList()
      this.form.project_code = this.project_code
      this.form.tag = this.tag
      if (this.form.project_code) {
        this.getTagList()
      }
    },
    async getProjectList () {
      try {
        const have = this.checkPermission(['pointAuthorization:project-slt'])
        let url = '/project/project-list-by-user'
        let params = {
          user_id: this.$store.state.userInfo.id
        }

        if (this.ischeckAllproject && have) { // ischeckAllproject表示是否需要校验
          url = '/project/list-slt'
          params = { content: '' }
        }
        const { code, data, message } = await this.$pub.post(url, params)
        if (code === 200) {
          this.projectList = (data || []).map(m => {
            return {
              ...m,
              project_code: m.projectCode ? m.projectCode : m.project_code,
              project_name: m.projectName ? m.projectName : m.project_name
            }
          })
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
    handleProjectchange () {
      this.form.point = {
        point_name: '',
        point_code: null
      }
      this.pointList = []

      this.form.tag = { id: 0, name: '' }
      this.tagList = []
      this.getTagList()
    },
    async remoteMethod (query) {
      if (query !== '') {
        this.pointLoading = true
        const params = {
          project_code: this.form.project_code,
          keywords: query
        }
        const { data } = await this.$pub.post('/point/search', params)
        this.pointList = data || []
        this.pointLoading = false
      }
    },
    // 获取标签
    async getTagList () {
      const { data, code, message } = await this.$pub.post('pay/ip/info/tag-list', { project_code: this.form.project_code })
      if (code === 200 && data !== null) {
        this.tagList = data
      } else {
        this.$notify.error({
          title: '查询失败',
          message: message
        })
      }
      this.tagList = data || []
    },
    getDictList () {
      const dicts = ['pay_ip_init_status', 'pay_ip_type']
      // 上报类型  位置 上传文件类型
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
    async handleOPear () {
      this.$refs.form.validate(async (valid) => {
        if (valid) {
          this.loading = true
          const params = {
            project_code: this.form.project_code,
            point_code: this.form.point.point_code,
            point_name: this.form.point.point_name,
            ip: this.form.ip,
            tag: this.form.tag.name,
            tag_id: this.form.tag.id,
            pay_ip_type: this.form.pay_ip_type,

            init_status: this.form.init_status,
            change_status_date: this.form.init_status === 1 ? this.form.change_status_date : null,
            online_date: this.form.init_status === 1 ? this.form.online_date : null
          }
          const { code, message } = await this.$pub.post('pay/ip/online/add', params)
          this.loading = false
          if (code !== 200) {
            this.$message({
              type: 'error',
              message: message || '新增在线记录失败',
              showClose: true
            })
            return
          }
          this.$message({
            type: 'success',
            message: '操作成功',
            showClose: true
          })
          this.cancel()
        }
      })
    },
    cancel () {
      this.$emit('cancel')
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

    .el-icon-circle-plus-outline {
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

    .el-form-item {
      margin-bottom: 15px;

      .el-form-item__error {
        padding-top: 0;
      }

      .el-form-item__label {
        line-height: 32px;
      }
    }

    .el-form-item__content {
      line-height: 32px;

      .el-input__inner {
        height: 32px;
      }
    }

    .el-select {
      width: 100%;
    }
  }
}
</style>
