<template>
  <div class="page">
    <div class="slogan">
      <div class="slogan-box">
        <img class="logo" src="@/assets/images/slogan-logo.png" alt="">
        <div class="slogan-text">
          <div class="slogan-text-title">创智南京工程管理平台</div>
          <div class="slogan-text-sub">ENGINEERING MANAGEMENT PLATFORM</div>
        </div>
      </div>
      <img class="slogan-img" src="@/assets/images/slogan-img.png" alt="">
    </div>
    <div class="login-form">
      <p class="title">欢迎登录系统</p>
      <el-form @keyup.enter.native="submit" :model="form" status-icon ref="loginForm" :rules="rules" v-if="isNoApp">
        <el-form-item prop="mobile">
          <el-input type="text" v-model="form.mobile" prefix-icon="el-icon-mobile-phone" placeholder="请输入手机号"
            auto-complete="off"></el-input>
        </el-form-item>
        <el-form-item prop="password" :error="valicodeErr">
          <el-input type="password" v-model="form.password" prefix-icon="el-icon-news" placeholder="请输入密码"
            auto-complete="off"></el-input>
        </el-form-item>
        <el-form-item class="submit-box">

          <el-button style="margin-left:0px;" class="button" @click="submit" :loading="submitLoading"
            type="primary">登录</el-button>
          <!-- <span style="float:right;margin:10px 2px 15px 0;color:#409EFF;cursor:pointer;" @click="enter">下载app</span> -->
        </el-form-item>
        <el-form-item class="come-from"><el-divider>
            中电创智（南京）科技有限公司
          </el-divider></el-form-item>
      </el-form>
      <div v-else class="code_wrap" v-loading="loading">
        <div class="_qwrap">
          <div class="item">
            <div class="qrcode" ref="qrCodeUrl1"></div>
            <!-- <span class="export" style="">请扫描二维码进行下载</span> -->
            <a style="margin-left:15px;cursor:pointer;" :href="url1">直接下载</a>
            <span class="name">工程管理</span>
          </div>
          <div class="item">
            <div class="qrcode" ref="qrCodeUrl2"></div>
            <!-- <span class="export" style="">请扫描二维码进行下载</span> -->
            <a style="margin-left:15px;cursor:pointer;" :href="url2">直接下载</a>
            <span class="name">运维管理</span>
          </div>
        </div>
        <el-button :loading="loading" style="width:100%;margin-top:10px" @click="leave">返回</el-button>
      </div>
    </div>
    <!-- 修改密码 -->
    <el-dialog :visible.sync="dialog" title="密码不能为123456请修改密码" append-to-body width="500px">
      <editPass :v-if="dialog" :dialog.sync="dialog" :isLogin="isLogin" :redirect="redirect" :mobile="form.mobile">
      </editPass>
    </el-dialog>
  </div>
</template>

<script>
import QRCode from 'qrcodejs2'
import editPass from './layout/components/editPass.vue'
export default {
  data () {
    const validateMobile = (rule, value, callback) => {
      if (value === '') {
        this.getMsgDisabled = true
        callback(new Error('请输入手机号'))
      } else if (!(/^[1][3,4,5,6,7,8,9][0-9]{9}$/.test(value))) {
        this.getMsgDisabled = true
        callback(new Error('请输入正确的手机号'))
      } else {
        this.getMsgDisabled = false
        callback()
      }
    }
    return {
      form: {
        mobile: '',
        password: '',
        type: '0'
      },
      rules: {
        mobile: [{ validator: validateMobile, trigger: 'change' }],
        password: [{ required: true, message: '请输入密码', trigger: 'change' }]
      },
      submitLoading: false,
      getMsgDisabled: true,
      valicodeErr: '',
      isNoApp: true,
      loading: false,
      qrcode1: null,
      qrcode2: null,
      url1: null,
      url2: null,
      redirect: undefined,
      dialog: false,
      isLogin: true
    }
  },
  watch: {
    $route: {
      handler (route) {
        this.redirect = route.query && route.query.redirect
      },
      immediate: true
    }
  },
  components: { editPass },
  mounted () {
    var mobile = this.$store.state.mobile
    if (mobile !== null) {
      this.form.mobile = mobile
    }
    this.$store.commit('SET_MENUS', [])
  },
  methods: {
    submit () {
      this.$refs.loginForm.validate(async (valid) => {
        if (valid) {
          this.submitLoading = true
          try {
            const result = await this.$pub.post('/sys/login', this.form)
            if (result.code === 200) {
              this.$store.commit('setUserInfo', result.data)
              if (Number(this.form.password) === 123456) {
                this.dialog = true
              } else {
                const _path = this.redirect || '/'
                this.$router.push({ path: _path })
              }
            } else {
              this.$notify.error({
                title: '登录失败',
                message: result.message
              })
              // return;
            }
          } catch (e) {
            this.$notify.error({
              title: '登录服务器请求失败',
              message: e.message
            })
          }
          this.submitLoading = false
        }
      })
    },
    getAppUrl (url) {
      this.loading = true
      url.forEach(async (f, i) => {
        const { code, data, message } = await this.$pub.post(f)
        if (code === 200) {
          const _index = i + 1
          this['url' + _index] = data.path
          this.$nextTick(() => {
            this.creatQrCode(_index)
          })
        } else {
          this.$notify.error({
            title: '获取APP地址失败',
            message: message || ''
          })
        }
        if (i === 1) {
          this.loading = false
        }
      })
    },
    creatQrCode (i) {
      this['qrcode' + i] = new QRCode(this.$refs['qrCodeUrl' + i], {
        text: this['url' + i], // 需要转换为二维码的内容
        width: 100,
        height: 100,
        colorDark: '#000000',
        colorLight: '#ffffff',
        correctLevel: QRCode.CorrectLevel.H
      })
    },
    enter () {
      this.getAppUrl(['/sys/app/version', '/sys/app/version_ops'])
      this.isNoApp = false
    },
    leave () {
      this.isNoApp = true
      if (this.qrcode1) {
        this.url1 = null
        this.qrcode1 = null
      }

      if (this.qrcode2) {
        this.url2 = null
        this.qrcode2 = null
      }
    }
  }
}
</script>

<style lang="scss">
.page {
  background-color: #fff;
  background-image: url("../assets/images/bg.png");
  background-position: 50% 50%;
  background-repeat: no-repeat;
  font-family: "PingFangSC-Regular";
  background-size: cover;
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  gap: 150px;

  .slogan {
    max-width: 360px;
    min-width: 360px;

    .slogan-box {
      display: flex;
      flex-direction: row;

      .logo {
        width: 56px;
        height: 56px;
        margin-right: 10px;
      }

      .slogan-text {
        .slogan-text-title {
          font-size: 28px;
          font-weight: bold;
        }

        .slogan-text-sub {
          font-size: 14px;
          font-weight: lighter;
          margin-left: 3px;
          color: #666;
        }
      }
    }

    .slogan-img {
      margin-top: 30px;
      width: 100%;
      height: auto;
    }

  }

  .login-form {
    padding: 20px 40px;
    max-width: 360px;
    min-width: 360px;
    box-sizing: border-box;
    background: #fff;
    border-radius: 2px;
    box-shadow: 0px 4px 10px 0px #D8D8D8;

    .come-from {
      white-space: nowrap;
      margin-top: 50px;
      margin-bottom: 0;

      .el-divider__text {
        font-weight: 400;
        font-size: 12px;
        color: #999;
      }
    }
  }

  .title {
    text-align: center;
    font-size: 25px;
    color: #333333;
    padding-top: 30px;
    margin-bottom: 50px;
    position: relative;

    &::after {
      position: absolute;
      left: 40%;
      bottom: -4px;
      content: "";
      width: 20%;
      height: 2px;
      background-color: #409EFF;
    }
  }

  .valicode-int {
    width: 58%;
  }

  .valicode-btn {
    width: 40%;
    float: right;
  }

  .submit-box .button {
    width: 100%;
    border-radius: 4px;
    font-size: 15px;
  }

  .desc {
    color: #666;
    font-size: 14px;
  }

  .desc a {
    color: #409EFF;
  }
}

.code_wrap {
  width: 100%;
  // height:307px;
  text-align: center;
  background: #23b7bd;
  padding-top: 30px;

  .export {
    text-align: center;
    font-size: 14px;
    color: #fff;
    display: block;
  }

  .qrcode {
    height: 180px;
    width: 180px;
    margin: 0 auto;

    img {
      margin: 0 auto;
      width: 160px;
      height: 160px;
      background-color: #fff; //设置白色背景色
      padding: 6px; // 利用padding的特性，挤出白边
      box-sizing: border-box;
    }
  }

  a {
    color: #333;
  }

  .el-button {
    &:hover {
      color: #23b7bd;
    }
  }

  ._qwrap {
    width: 100%;
    display: flex;
    justify-content: space-around;

    .item {
      width: 190px;
    }
  }

  .name {
    color: #fff;
    margin-left: 4px;
  }
}
</style>
