<template>
  <div class="import">
    <div>
      <span>项目:</span>
      <el-select v-model="projectCode" style="width:calc(100% - 45px);" placeholder="请选择" @change="handleProjectChange">
        <el-option v-for="item in projectList" :key="item.projectCode" :label="item.projectName"
          :value="item.projectCode">
        </el-option>
      </el-select>
    </div>

    <el-upload class="upload-demo" drag ref="uploadFile" action="#" accept=".xlsx" :auto-upload="false"
      :on-error="handleError" :before-upload="beforeAvatarUpload" :file-list="fileList" :http-request="httpRequest"
      :on-change="handleChange" :on-remove="handleRemove">
      <i class="el-icon-upload"></i>
      <div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
    </el-upload>
    <div class="el-upload__tip" slot="tip">
      <p>导入须知:</p>
      <p>文件格式目前仅支持XLSX</p>
      <p v-if="file_url">内容格式请参考 <a class="el-link el-link-primary" :href="file_url">导入模板</a></p>
    </div>
    <el-button type="primary" style="width: 100%;margin-top:20px;" :disabled="!this.projectCode || fileList.length <= 0"
      :loading="submitloading" @click="handleUpload">确认</el-button>
    <div v-if="importResult" style="margin-top:20px;">
      <span style="margin-right:10px;">绑定部门结果:</span>
      <el-tag type="success">成功 {{ importResult.total - importResult.total_err }} 条</el-tag>
      <el-tag type="danger">失败 {{ importResult.total_err }} 条</el-tag>
      <span style="display:block;font-size:12px;margin-top:10px;"
        v-if="importResult.total_err > 0">*点位导入失败列表已自动下载,请查看</span>
    </div>
  </div>
</template>

<script>
import { parseTime } from '@/utils/tool'
import config from '@/config/config.js'
export default {
  name: 'point_import',
  props: {
    project_code: {
      required: true
    },
    projectList: {
      required: true
    }
  },
  data () {
    return {
      fileList: [],
      file: [],
      limit: 10,
      submitloading: false,
      projectCode: this.project_code,
      file_name: '',
      file_url: '',
      importResult: null
    }
  },
  mounted () {
    if (this.projectCode) {
      this.getFileName()
    }
  },
  methods: {
    async getFileName () {
      if (!this.projectCode) {
        return this.$message({
          type: 'error',
          message: '请先选择项目',
          showClose: true
        })
      }
      this.importResult = null
      const { data, code } = await this.$pub.post('point/device/ip/bind-dept-imp-init', { project_code: this.projectCode })
      if (code === 200) {
        const api = config.defaultApi
        const env = process.env.NODE_ENV === 'production' ? api : ''
        const baseurl = process.env.VUE_APP_BASE_URL + env
        this.file_name = data.file_name
        this.file_url = baseurl + data.url
      } else {
        this.file_name = ''
        this.file_url = ''
      }
    },
    handleProjectChange () {
      // if (this.file_name) {
      //   this.$pub.post('/point/manage/import-init-del', { file_name: this.file_name })
      // }
      this.getFileName()
    },
    beforeAvatarUpload (file) {
      const fileType = file.name.substring(file.name.lastIndexOf('.') + 1)
      const isvsdx = fileType === 'xlsx'
      if (!isvsdx) {
        this.$message({
          type: 'error',
          message: '文件格式目前仅支持XLSX!',
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
    async handleUpload () {
      try {
        this.submitloading = true
        this.$refs.uploadFile.submit()
        const upData = new FormData()
        this.file.some((file) => { // 因为要上传多个文件，所以需要遍历
          upData.append('file', file, file.name)
          const fileType = file.name.substring(file.name.lastIndexOf('.') + 1)
          const isvsdx = fileType === 'xlsx'
          if (!isvsdx) {
            this.$message({
              type: 'error',
              message: '文件格式目前仅支持XLSX!',
              showClose: true
            })
            return true
          }
        })
        upData.append('project_code', this.projectCode)
        const { code, data, message } = await this.$pub.post('point/device/ip/bind-dept-imp', upData)
        if (code === 200) {
          const { total_err, url } = data
          this.importResult = data
          if (total_err > 0 && url) {
            const title = this.project_code + '绑定部门失败列表' + '-' + parseTime(new Date(), '{y}.{m}.{d} {h}:{i}:{s}') + '.xlsx'
            const api = config.defaultApi
            const env = process.env.NODE_ENV === 'production' ? api : ''
            const baseurl = process.env.VUE_APP_BASE_URL + env
            const link = document.createElement('a')
            link.style.display = 'none'
            link.href = baseurl + url
            link.setAttribute('download', title)
            document.body.appendChild(link)
            link.click()
            document.body.removeChild(link)
          }
        } else {
          this.$message({
            message: message || '导入出错了',
            type: 'error',
            showClose: true
          })
        }
        this.submitloading = false
        this.file = []
        this.fileList = []
      } catch (err) {
        console.log(err)
      }
    },
    importFile () {
      this.downFileA(this.file_url, this.file_name)
    }
  }
}
</script>

<style lang="scss">
.InstallCl {

  .el-drawer__header {
    margin-bottom: 0px;
  }

  .import {
    padding: 20px;

    .el-upload__tip {
      margin-left: 10px;
    }
  }

  .upload-demo {
    margin-top: 20px;
    width: 100%;

    .el-upload,
    .el-upload-dragger {
      width: 100%;
    }
  }
}
</style>
