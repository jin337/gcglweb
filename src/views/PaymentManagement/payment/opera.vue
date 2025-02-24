<template>
  <div>
    <el-form ref="form" size="small" label-position="right" label-width="78px" :rules="rules" :model="form">
      <el-form-item label="标题" prop="pay_title">
        <el-input v-model="form.pay_title" clearable></el-input>
      </el-form-item>
      <el-form-item label="所属项目" prop="pay_project_code">
        <el-select v-model="form.pay_project_code" placeholder="请选择" style="width:100%" @change="handleProjectChange">
          <el-option v-for="item in projectList" :key="item.projectCode" :label="item.projectName"
            :value="item.projectCode"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="付款点位" prop="points" :class="{ 'is-required': !form.id }">
        <div class="wrap_up">
          <el-upload drag ref="uploadFile" action="#" accept=".xlsx" :auto-upload="false" :on-error="handleError"
            :before-upload="beforeAvatarUpload" :file-list="fileList" :http-request="httpRequest"
            :on-change="handleChange" :on-remove="handleRemove">
            <i class="el-icon-upload"></i>
            <div class="el-upload__text">选取文件<em></em></div>
          </el-upload>
          <div class="el-upload__tip" slot="tip">
            <p>导入须知:</p>
            <p>1.文件格式目前仅支持XLSX</p>
            <p>2.单次只能上传一份文件</p>
            <p>3.内容格式请参考 <el-link type="primary" :href="file_url">导入模板</el-link></p>
          </div>
        </div>
      </el-form-item>
      <!-- <el-form-item label="当前状态" prop="status">
        <el-radio-group v-model="form.status">
          <el-radio :label="0">未确认</el-radio>
          <el-radio :label="1">已确认</el-radio>
        </el-radio-group>
      </el-form-item> -->
      <el-form-item label="付款工序">
        <el-cascader v-model="form.pay_class" :key="cascaderKey" :options="procs" :props="{
          multiple: true
        }" size="small" filterable style="width:100%" ref="gxSel" collapse-tags clearable>
        </el-cascader>
      </el-form-item>
      <el-form-item label="付款类型" prop="pay_type">
        <el-select v-model="form.pay_type" placeholder="请选择" size="small" style="width:100%;">
          <el-option v-for="item in typesList" :key="item.value" :label="item.label" :value="item.value">
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="描述" prop="pay_content">
        <el-input v-model="form.pay_content" type="textarea" :rows="6"></el-input>
      </el-form-item>
    </el-form>
    <div style="margin-top:30px;padding-bottom:30px;">
      <el-button style="float: right;" type="primary" size="small" @click="submit"
        v-loading="submitloading">保存</el-button>
      <div v-if="importResult" style="margin-top:20px;">
        <span style="margin-right:10px;">导出结果:</span>
        <el-tag type="success">成功 {{ importResult.total }} 条</el-tag>
        <el-tag type="danger">失败 {{ importResult.total_err }} 条</el-tag>
        <span style="display:block;font-size:12px;margin-top:10px;">*付款点位导入失败列表已自动下载,请查看</span>
      </div>
    </div>
  </div>
</template>

<script>
import { cascader, parseTime } from '@/utils/tool.js'
import config from '@/config/config.js'
export default {
  name: 'payment_opera',
  props: {
    current: {
      require: true
    },
    projectList: {
      require: true
    },
    operaFlag: {
      require: true
    }
  },
  data () {
    return {
      form: {
        pay_project_code: '',
        pay_title: '',
        pay_content: '',
        pay_class: [],
        pay_type: null
        // status: 0
      },
      procs: [],
      cascaderKey: 1, // 防止key问题报错
      fileList: [],
      file: [],
      submitloading: false,
      file_url: '',
      importResult: null,
      typesList: []
    }
  },
  computed: {
    rules () {
      const points_validate = (rule, value, callback) => {
        if (this.fileList.length <= 0) {
          callback(new Error('必须上传本次点位列表'))
        } else {
          callback()
        }
      }
      const rule1 = {
        pay_project_code: [
          { required: true, message: '请选择项目', trigger: 'change' }
        ],
        pay_title: [
          { required: true, message: '请输入标题', trigger: 'change' }
        ],
        status: [
          { required: true, message: '请选择状态', trigger: 'change' }
        ],
        pay_type: [
          { required: true, message: '请选择付款类型', trigger: 'change' }
        ]
      }

      const rule2 = {
        ...rule1,
        points: [
          { validator: points_validate, message: '请上传本次付款点位表格' }
        ]
      }
      return this.form.id ? rule1 : rule2
    }
  },
  created () {
    this.getFileUrl()
    this.getTypes()
  },
  mounted () {
    if (this.current) {
      const { id, pay_project_code, pay_title, pay_content, status, pay_type } = this.current
      this.form = {
        id, pay_project_code, pay_title, pay_content, status, pay_type
      }
      this.getProc()
    }
  },
  methods: {
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
        this.$refs.form.validateField('points')
      }
    },
    handleRemove (file, fileList) {
      this.fileList = []
    },
    async getFileUrl () {
      const api = config.defaultApi
      const env = process.env.NODE_ENV === 'production' ? api : ''
      const baseurl = process.env.VUE_APP_BASE_URL + env
      this.file_url = baseurl + '/gen/photo-doc-templates/templatesImp.xlsx'
    },
    handleProjectChange () {
      if (this.form.pay_project_code) {
        this.form.pay_class = []
        this.form.pay_type = null
        ++this.cascaderKey
        this.getProc()
      }
    },
    getChildList (value) {
      var childs = []
      // 添加具体工序
      if (value.procList !== null && value.procList !== undefined) {
        value.procList.map((citem, cindex) => {
          childs.push({ value: citem.procCode, label: citem.procName })
        })
      }
      return childs
    },
    // --获取工序列表--
    async getProc () {
      if (this.form.pay_project_code === null) {
        return
      }
      try {
        const params = {
          project_code: this.form.pay_project_code,
          point_code: ''
        }
        const { code, data, message } = await this.$pub.post('/point/proc/list-design', params)
        if (code === 200) {
          var tmparr = [];
          (data || []).map((item, index) => {
            var childs = []
            childs = this.getChildList(item)
            var tmpobj = {
              value: item.classCode,
              label: item.className,
              children: childs
            }
            tmparr.push(tmpobj)
          })
          this.procs = tmparr
          this.form.pay_class = (this.current && this.current.pay_class) ? cascader(this.current.pay_class.split(','), this.procs, 'value') : []
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
    // 获取付款类型列表
    getTypes () {
      this.$dict(this, 'pay_type').then(res => {
        if (res.code === 200) {
          this.typesList = (res.data || []).map(m => {
            return {
              value: Number(m.value),
              label: m.label
            }
          })
        } else {
          this.$message({
            type: 'error',
            message: '字典获取出错了pay_type',
            showClose: true
          })
          this.typesList = []
        }
      })
    },
    async submit () {
      try {
        this.$refs.form.validate(async valid => {
          if (valid) {
            let tempArr = []
            this.form.pay_class.forEach(f => {
              tempArr = tempArr.concat(f)
            })
            tempArr = [...new Set(tempArr)]
            this.submitloading = true
            this.$refs.uploadFile.submit()
            const base_info = {
              pay_title: this.form.pay_title,
              pay_project_code: this.form.pay_project_code,
              pay_content: this.form.pay_content,
              pay_class: tempArr.length > 0 ? tempArr.join(',') : '-1',
              pay_type: this.form.pay_type
              // status: this.form.status
            }
            const pay_info = this.form.id ? { ...base_info, id: this.form.id } : base_info
            const _axiosurl = this.form.id ? 'project/pay/edit' : 'project/pay/add'
            const upData = new FormData()
            if (this.file.length > 0) {
              this.file.forEach((file) => {
                upData.append('file', file, file.name)
              })
            } else {
              upData.append('file', null)
            }

            upData.append('pay_info', JSON.stringify(pay_info))
            const { code, data } = await this.$pub.post(_axiosurl, upData)
            if (code !== 200) {
              this.$message({
                message: '本次操作失败',
                type: 'info',
                showClose: true,
                customClass: 'uploadMessage'
              })
            } else {
              const { total_err, url } = data
              this.importResult = data
              if (total_err > 0 && url) {
                const title = this.form.pay_project_code + '付款点位导入失败列表' + '-' + parseTime(new Date(), '{y}.{m}.{d} {h}:{i}:{s}') + '.xlsx'
                const api = config.defaultApi
                const env = process.env.NODE_ENV === 'production' ? api : ''
                const baseurl = process.env.VUE_APP_BASE_URL + env
                const link = document.createElement('a')
                link.style.display = 'none'
                link.href = baseurl + url
                // link.target = '_Blank'
                link.setAttribute('download', title)
                document.body.appendChild(link)
                link.click()
                document.body.removeChild(link)
              } else {
                this.$message({
                  message: '操作成功',
                  type: 'success',
                  showClose: true,
                  customClass: 'uploadMessage'
                })
                this.$emit('update:operaFlag', false)
                this.$emit('handleQuery')
              }
            }
            this.submitloading = false
            this.file = []
            this.fileList = []
          }
        })
      } catch (err) {
        this.$message({
          message: '出错了',
          type: 'error',
          showClose: true,
          customClass: 'uploadMessage'
        })
        this.submitloading = false
      }
    }
  }
}
</script>

<style lang="scss">
.payment_opera {
  .el-upload-dragger {
    height: 130px;

    .el-icon-upload {
      margin: 20px 0 16px;
    }
  }

  .wrap_up {
    position: relative;
    display: flex;

    &>div {
      width: 350px;
    }

    .el-upload__tip {
      margin-left: 20px;
    }
  }
}
</style>
