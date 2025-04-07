<template>
  <div class="authorizeSetting">
    <el-form ref="form" :model="form" :rules="rules" label-width="106px" v-loading="submit" size="small">
      <el-form-item label="机器码" prop="auth_code">
        <div class="online_code">
          <el-input v-model="form.auth_code" placeholder="请点击获取机器码" disabled />
          <el-button size="mini" type="primary" @click="getPCCode">获取机器码</el-button>
        </div>
      </el-form-item>
      <el-form-item label="授权码" prop="pc_code">
        <el-input v-model="form.pc_code" placeholder="请输入授权码" />
      </el-form-item>
    </el-form>
    <div class="dialog-footer">
      <el-button size="mini" type="primary" @click="submitForm">确 定</el-button>
      <el-button size="mini" @click="cancel">取 消</el-button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'authorizeSetting',
  data () {
    return {
      form: {
        auth_code: '',
        pc_code: ''
      },
      rules: {
        auth_code: [
          { required: true, message: '请获取机器码', trigger: 'blur' }
        ],
        pc_code: [
          { required: true, message: '请输入授权码', trigger: 'blur' }
        ]
      },
      submit: false,
      codeList: []
    }
  },
  props: {
    current: {
      required: true
    }
  },
  computed: {
  },
  mounted () {
  },
  components: {
  },
  methods: {
    async getPCCode () {
      const { code, data } = await this.$pub.post('/project/sys/gen-pc-code', { project_code: this.current.project_code })
      if (code === 200) {
        this.form.auth_code = data
      } else {
        this.$message({
          type: 'error',
          message: '获取机器编码失败',
          showClose: true
        })
      }
    },
    submitForm () {
      try {
        this.$refs.form.validate(async (valid) => {
          if (valid) {
            this.submit = true
            const params = {
              id: this.current.id,
              ...this.form
            }
            const { code } = await this.$pub.post('/project/edit-auth-code', params)
            this.submit = false
            if (code !== 200) {
              this.$message({
                type: 'error',
                message: '授权失败',
                showClose: true
              })
            } else {
              this.$message({
                type: 'success',
                message: '授权成功',
                showClose: true
              })
              this.$emit('handleQuery')
              this.cancel()
            }
          }
        })
      } catch (err) {
        this.submit = false
      }
    },
    cancel () {
      this.$emit('update:authorizeFlag', false)
      this.reset()
    },
    // 表单重置
    reset () {
      this.$refs.form.resetFields()
    }
  }
}
</script>

<style lang='scss' scoped>
.online_code {
  display: flex;
}
</style>
