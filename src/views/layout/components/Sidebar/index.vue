<template>
    <div class="main_header">
      <template v-if="mode==='horizontal'">
        <div class="icontit">
          <span class="logo-box" @click="reload">
            <img src="../../../../assets/images/logo.png" alt="logo" />
          </span>
          <div class="title">{{title}}</div>
        </div>
        <div class="navbar" >
          <el-menu
            :default-active="activeMenu"
            :mode="mode"
            router
            :background-color="variables.menuBg"
            :text-color="variables.menuText"
            :active-text-color="variables.menuActiveText"
          >
            <sidebar-item v-for="route in permission_routers" :key="route.path" :item="route" />
          </el-menu>

        </div>
      </template>
      <div v-else class="leftright">
        <div class="wrap">
          <i :class="[isCollapse?'el-icon-s-unfold':'el-icon-s-fold']" @click="changeCollapse"></i>
          <span>欢迎进入 公共安全视频监控类工程管理系统</span>
        </div>
        <!-- <el-breadcrumb separator="/">
          <el-breadcrumb-item  v-for="item of breadListLast" :key="item.path">
            {{item.name}}
          </el-breadcrumb-item>
        </el-breadcrumb> -->
      </div>
      <ul class="tools">
        <li>
          <el-dropdown
            placement="bottom"
            trigger="click"
            @command="handleAccount"
          >
            <span class="topic">
              {{ userInfo.userName}}
              <i class="el-icon-arrow-down el-icon--right"></i>
            </span>
            <el-dropdown-menu slot="dropdown">
              <el-dropdown-item command="appDownload" style="line-height: 30px;">APP下载</el-dropdown-item>
              <el-dropdown-item command="editPassword" style="line-height: 30px;">修改密码</el-dropdown-item>
              <el-dropdown-item command="logout" style="line-height: 30px;">退出登录</el-dropdown-item>
            </el-dropdown-menu>
          </el-dropdown>
        </li>
        <!-- <li>
          <i class="el-icon-setting" @click="changeMode"></i>
        </li> -->
      </ul>

      <el-dialog
        :visible.sync="dialog"
        title="修改密码"
        append-to-body
        width="500px"
      >
      <editPass  :v-if="dialog" :dialog.sync="dialog"></editPass>
    </el-dialog>
      <el-dialog
        :visible.sync="appDownload"
        title="App下载"
        append-to-body
        width="500px"
      >
      <div class="code_wrap" v-loading="loading">
        <div class="_qwrap" >
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
        <el-button :loading="loading"   style="width:100%;margin-top:10px" @click="leave">返回</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import QRCode from 'qrcodejs2'
import SidebarItem from './SidebarItem'
import editPass from '../editPass'
export default {
  props: {
    isCollapse: {
      type: Boolean,
      default: false
    },
    title: {
      type: String,
      default: '工程管理系统'
    },
    permission_routers: {
      type: Array,
      default: () => []
    },
    activeMenu: {
      type: String,
      default: '/'
    },
    variables: {
      type: Object,
      default: () => {
        return {
          menuBg: '#23b7bd',
          menuText: '#8ffffe',
          menuActiveText: '#fff'
        }
      }
    },
    mode: {
      type: String,
      default: 'horizontal'
    }
  },
  inject: ['reload'], // 注入reload方法
  data() {
    return {
      breadListLast: [],
      dialog: false,
      appDownload: false,
      qrcode1: null,
      loading: false,
      qrcode2: null,
      qrBl: false,
      url1: null,
      url2: null
    }
  },
  components: { SidebarItem, editPass },
  computed: {
    userInfo() {
      return this.$store.state.userInfo
    }
  },
  watch: {
    $route(route) {
      if (route.path.startsWith('/redirect/')) {
        return
      }
      this.getBreadcrumb()
    }
  },
  created() {
    this.getBreadcrumb()
  },
  methods: {
    handleAccount(type) {
      if (type === 'logout') {
        this.$confirm('确定注销并退出系统吗？', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          this.$store.dispatch('Logout').then(() => {
            location.reload()
            // this.$router.push('/login')
          })
        })
      } else if (type === 'editPassword') {
        this.dialog = true
      } else if (type === 'appDownload') {
        this.appDownload = true
        this.loading = true
        this.enter()
      }
    },
    changeMode() {
      const mode = this.mode === 'horizontal' ? 'vertical' : 'horizontal'
      this.$store.commit('SET_MODE', mode)
    },
    changeCollapse() {
      this.$emit('changeCollapse')
    },
    getBreadcrumb() {
      const matched = this.$route.matched.filter(item => item.name)
      this.breadListLast = matched
    },
    getAppUrl(url) {
      if (!this.qrBl) {
        url.forEach(async (f, i) => {
          const { code, data, message } = await this.$pub.post(f)
          if (code === 200) {
            const _index = i + 1
            this['url' + _index] = data.path
            this.$nextTick(() => {
              this.creatQrCode(_index)
            })
            this.qrBl = true
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
      } else {
        this.loading = false
      }
    },
    creatQrCode(i) {
      this['qrcode' + i] = new QRCode(this.$refs['qrCodeUrl' + i], {
        text: this['url' + i], // 需要转换为二维码的内容
        width: 100,
        height: 100,
        colorDark: '#000000',
        colorLight: '#ffffff',
        correctLevel: QRCode.CorrectLevel.H
      })
    },
    enter() {
      this.getAppUrl(['/sys/app/version', '/sys/app/version_ops'])
    },
    leave() {
      this.appDownload = false
      // if (this.qrcode1) {
      //   this.url1 = null
      //   this.qrcode1 = null
      // }
      // if (this.qrcode2) {
      //   this.url2 = null
      //   this.qrcode2 = null
      // }
    }
  }
}
</script>
<style lang="scss">
.ver-wrapper{
  .main_header {
    line-height: 60px;
  }
}
.main_header {
  padding: 0 10px 0 20px;
  display: flex;
  flex-direction: row;
  align-items: center;
  height: 60px;
  background:#23b7bd;
  box-sizing: border-box;
  width:100%;
  // min-width: 100%;
  // width: fit-content;
  .el-menu--horizontal>.el-menu-item.is-active{
    // border-bottom-color: #73e5e4!important;
  }
  .navbar{
    .el-menu-item{
      padding: 0 15px;
    }
    .el-menu.el-menu--horizontal {
      display: flex;
      justify-content: flex-start;
      border-bottom: none;
    }
  }
  .icontit{
    display:flex;
    align-items: center;
  }
}
</style>
<style scoped lang="scss">
.main_header {
  overflow-y: auto;
  .logo-box {
    cursor:pointer;
    img {
      display: block;
    }
  }
  .navbar {
    // flex: 1;
  }
  a:-webkit-any-link {
    text-decoration: none;
  }
  .title {
    max-width: 280px;
    min-width:170px;
    padding: 0 20px;
    color: white;
  }
  .menu {
    float: left;
    padding-left: 100px;
  }

  .tools {
    // display: flex;
    margin-left:auto;
    background: #23b7bd;
    min-width:90px;
    height:100%;
    li{
      height:100%;
      line-height: 60px;
    }
    .topic {
      text-decoration: none;
      cursor: pointer;
      color: #fff;
    }
    .setting{
       font-size: 16px;
    }
  }
  .tools > li {
    margin-right:20px;
    font-size: 14px;
    color: #fff;
    cursor: pointer;
  }
  .leftright{
    .wrap{
      // height:30px;
      display: flex;
      align-items: center;
    }
    i{
      font-size: 22px;
      line-height: 30px;
      margin-right: 18px;
      vertical-align: middle;
      cursor: pointer;
    }
    .el-breadcrumb {
      margin-left: 39px;
    }
  }
}
.el-drawer__header {
  span {
    outline: none!important;
  }
}
.code_wrap{
  width:100%;
  // height:307px;
  text-align:center;
  background: #23b7bd;
  padding-top:30px;
  .export {
    text-align: center;
    font-size: 14px;
    color: #fff;
    display: block;
  }
  .qrcode {
    height:180px;
    width:180px;
    margin:0 auto;
    img {
      margin:0 auto;
      width:160px;
      height: 160px;
      background-color: #fff; //设置白色背景色
      padding: 6px; // 利用padding的特性，挤出白边
      box-sizing: border-box;
    }
  }
  a{
    color: #333;
  }
  .el-button {
    &:hover{
      color: #23b7bd;
    }
  }
  ._qwrap{
    width:100%;
    display: flex;
    justify-content: space-around;
    .item{
      width:190px;
    }
  }
  .name{
    color:#fff;
    margin-left:4px;
  }
}
</style>
