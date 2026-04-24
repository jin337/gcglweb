<template>
  <div>
    <el-form ref="form" :model="form" :rules="rules" size="small" label-width="88px">
      <el-form-item label="旧密码" prop="oldPass">
        <el-input v-model="form.oldPass" type="password" auto-complete="on" style="width: 370px;" />
      </el-form-item>
      <el-form-item label="新密码" prop="newPass">
        <el-input v-model="form.newPass" type="password" auto-complete="on" style="width: 370px;" />
      </el-form-item>
      <el-form-item label="确认密码" prop="confirmPass">
        <el-input v-model="form.confirmPass" type="password" auto-complete="on" style="width: 370px;" />
      </el-form-item>
    </el-form>
    <div slot="footer" class="dialog-footer">
      <el-button type="text" @click="cancel">取消</el-button>
      <el-button :loading="loading" type="primary" @click="doSubmit">确认</el-button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'edit_pass',
  props: {
    dialog: {
      type: Boolean,
      required: true
    },
    isLogin: {
      type: Boolean,
      default: false
    },
    redirect: {
      type: String,
      default: ''
    },
    mobile: {
      type: String,
      default: ''
    }
  },
  data () {
    const confirmPass = (rule, value, callback) => {
      if (value) {
        if (this.form.newPass !== value) {
          callback(new Error('两次输入的密码不一致'))
        } else {
          callback()
        }
      } else {
        callback(new Error('请再次输入密码'))
      }
    }

    const some = (rule, value, callback) => {
      if (value) {
        const reg = /[\^]/g
        if (this.form.newPass === this.form.oldPass) {
          callback(new Error('新旧密码不可以一致'))
        } else if (reg.test(value)) {
          callback(new Error('密码不能包含^'))
        } else {
          callback()
        }
      } else {
        callback(new Error('请再次输入密码'))
      }
    }
    return {
      loading: false,
      form: { oldPass: '', newPass: '', confirmPass: '' },
      rules: {
        oldPass: [
          { required: true, message: '请输入旧密码', trigger: 'blur' }
        ],
        newPass: [
          { required: true, message: '请输入新密码', trigger: 'blur' },
          { required: true, validator: some, trigger: 'blur' },
          { min: 6, max: 20, message: '长度在 6 到 20 个字符', trigger: 'blur' }
        ],
        confirmPass: [
          { required: true, validator: confirmPass, trigger: 'blur' }
        ]
      }
    }
  },
  computed: {
    userInfo() {
      return this.$store.state.userInfo
    }
  },
  mounted() {
    if (this.isLogin) {
      this.form.oldPass = '123456'
    }
  },
  methods: {
    cancel() {
      this.$refs.form.resetFields()
      this.$emit('update:dialog', false)
    },
    doSubmit() {
      this.$refs.form.validate(async (valid) => {
        if (valid) {
          this.loading = true
          const params = {
            user_id: this.$store.state.userInfo.id,
            old_pwd: this.form.oldPass,
            new_pwd: this.form.newPass,
            new_pwd_again: this.form.confirmPass
          }
          const { code, message } = await this.$pub.post('/sys/change-pwd', params)
          if (Number(code) === 200) {
            if (this.isLogin) {
              this.$notify({
                title: '密码修改成功，即将登录',
                type: 'success',
                duration: 1500
              })
              const result = await this.$pub.post('/sys/login', { mobile: this.mobile, password: this.form.newPass, type: '0' })
              if (result.code === 200) {
                this.$store.commit('setUserInfo', result.data)
                const _path = this.redirect || '/'
                this.$router.push({ path: _path })
              } else {
                this.$notify.error({
                  title: '登录失败',
                  message: result.message
                })
              }
            } else {
              this.$notify({
                title: '密码修改成功，请重新登录',
                type: 'success',
                duration: 1500
              })
              setTimeout(() => {
                this.$store.dispatch('Logout').then(() => {
                  location.reload()
                  this.$router.push('/login')
                })
              }, 1500)
            }
          } else {
            this.loading = false
            this.$notify.error({
              title: '查询失败',
              message: message
            })
          }
        } else {
          return false
        }
      })
    },
    resetForm() {
      this.dialog = false
      this.$refs.form.resetFields()
      this.form = { oldPass: '', newPass: '', confirmPass: '' }
    }
  }
}
</script>

<style lang='scss'>
.dialog-footer{
  text-align: right;
}
</style>
