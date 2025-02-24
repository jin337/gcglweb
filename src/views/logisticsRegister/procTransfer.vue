<template>
  <div class="wrap">
    <div class="opera">
      <el-button size="small" @click="cancle" style="margin-left:0;">取消迁移</el-button>
      <el-button :disabled="!selectProc || !direction" type="primary" size="small" @click="sure">确认迁移</el-button>
    </div>
    <el-timeline>
      <el-timeline-item type="primary" hide-timestamp>
        <div class="tit">
          <div>当前选中图片</div>
          <span>所属工序：{{transferData.proc_name}}</span>
          <span>所属方向：{{transferData.direction}}</span>
        </div>
        <ul class="images" v-viewer="options">
          <li v-for="img in transferData.images" :key="img.image_id">
            <img
              :src="img.file_path_thumb"
              :data-source="img.file_path_trans"
              :key="img.file_path"
              style="width: 140px;"
              v-if="img.is360!==1"
            />
            <img
              :src="img.file_path_thumb"
              style="width: 140px;height:140px;"
              :key="img.file_path"
              v-if="img.is360===1"
              @click="initPhotoSphere(img.file_path_trans)"
            />
          </li>
        </ul>
      </el-timeline-item>
      <el-timeline-item hide-timestamp type="primary">
        <div class="select tit">
          <span>迁移至以下方向：</span>
        </div>
        <el-radio-group v-model="direction">
          <el-radio-button v-for="dir in directionList" :label="dir" :key="dir.point_code">{{dir.direct_name}}</el-radio-button>
        </el-radio-group>
      </el-timeline-item>
      <el-timeline-item type="primary" hide-timestamp>
        <div class="select tit">
          <span>迁移至以下(工序/物料)：{{selectProc?(selectProc.device_id?selectProc.procName + '/' + selectProc.label: selectProc.label) : ''}}</span>
        </div>
        <el-tree
          :data="procList"
          v-loading="procLoading"
          node-key="id"
          @node-click="clickProc"
         >
          <span class="custom-tree-node" slot-scope="{ node,data }" :class="{isproActive:selectProc&&(data.procCode&&selectProc.procCode===data.procCode &&selectProc.id===data.id )}">
            <i class="el-icon-document-checked" style="margin-right:4px;" v-if="(!node.disabled && node.isLeaf)"></i>
            <span>{{ node.label }}</span>
          </span>
        </el-tree>
      </el-timeline-item>
      <el-timeline-item hide-timestamp type="primary"></el-timeline-item>
    </el-timeline>

    <el-dialog
      :title="photoSphereName"
      :visible.sync="visible"
      :footer="false"
      :append-to-body="true"
      custom-class="photo_wrap"
      width="70%">
      <photo :bigImg="bigImg" v-if="visible"></photo>
    </el-dialog>
  </div>
</template>

<script>
import photo from '@/views/3D/index'
export default {
  name: 'procTransfer',
  props: {
    showAllProc: {
      required: true
    },
    transferData: {
      required: true
    }
  },
  data () {
    return {
      options: {
        toolbar: true,
        url: 'data-source'
      },
      photoSphereName: '',
      visible: false,
      bigImg: '',
      procList: [],
      procLoading: false,
      selectProc: null,
      prePar: null,
      directionList: [],
      direction: null
    }
  },
  components: { photo },
  computed: {

  },
  mounted() {
    this.getProcList()
    this.getDirectionList()
  },
  methods: {
    initPhotoSphere(img) {
      // img = require('../../../assets/images/test1.jpg')
      // img = 'https://gw.alicdn.com/tfs/TB1WSInRFXXXXXlXpXXXXXXXXXX-1200-600.jpg'
      // img

      const url = process.env.VUE_APP_BASE_URL_download
      img = img.replace(url, '') + '?' + new Date().getTime()
      this.photoSphereName = this.transferData.proc_name
      this.visible = true
      this.bigImg = img
    },
    async getProcList() {
      this.procLoading = true
      this.procList = []
      const params = {
        project_code: this.transferData.project_code,
        point_code: this.transferData.point_code
      }
      const { data, code, message } = await this.$pub.post('/point/proc/list-design', params)

      if (code !== 200) {
        return this.$message({
          type: 'error',
          message: message || '获取工序出错了',
          showClose: true
        })
      }
      if (data.length > 0) {
        this.getProc(data)
      }
      this.procLoading = false
    },
    getProc(data) {
      data.map(m => {
        if (m.classCode !== 'CLS100') {
          const tmpobj = {
            label: m.className,
            children: this.getChild(m.procList),
            disabled: true
          }
          this.procList.push(tmpobj)
        }
      })
    },
    // loadNode(node, resolve) {
    //   if (node.level === 0) {
    //     return resolve(this.procList)
    //   }
    //   if (node.level === 1) {
    //     const arrs = node.data.children || []
    //     // arrs.forEach(f => { // 请求物料
    //     //   if (f.DeviceType) {
    //     //     this.getAgreeDeviceList(f.procCode).then(res => {
    //     //       f.children = res
    //     //       f.isLeaf = res.length <= 0// 是叶子节点不需要请求物料了
    //     //     })
    //     //   } else {
    //     //     f.children = []
    //     //     f.isLeaf = true
    //     //   }
    //     // })
    //     return resolve(arrs)
    //   }
    //   if (node.level === 2) {
    //     const arrs = node.data.children || []
    //     return resolve(arrs)
    //   }
    // },
    getChild(arr) {
      const temp = [];
      (arr || []).map(m => {
        if (m.procCode !== 'CLS000-04') {
          if (m.DeviceType !== '') { // 请求物料
            this.getAgreeDeviceList(m).then(res => {
              m.children = res
              m.isLeaf = res.length <= 0// 是叶子节点不需要请求物料了
              temp.push({
                ...m,
                label: m.procName
              })
            })
          } else {
            m.children = []
            m.isLeaf = true
            temp.push({
              ...m,
              label: m.procName
            })
          }
        }
      })
      return temp
    },
    async getDirectionList() {
      const params = {
        project_code: this.transferData.project_code,
        point_code: this.transferData.point_code
      }
      this.$pub.post('/point/manage/direct-list', params).then((res) => {
        if (res.code === 200) {
          this.directionList = res.data || []
          if (this.directionList.length <= 1) {
            this.direction = this.directionList[0]
          }
        } else {
          this.$message({
            type: 'error',
            message: '出错了/point/manage/direct-list',
            showClose: true
          })
          this.directionList = []
        }
      })
    },
    clickProc(item) {
      if (item.disabled || (item.children && item.children.length > 0)) {
        return
      }
      this.selectProc = item
      this.$nextTick(() => {
        // 去掉上一次选中的行样式
        if (this.prePar) {
          this.prePar.classList.remove('isActive_tree_item')
        }
        // 给当前选中的行样式
        const el = document.querySelector('.isproActive')
        if (el) {
          this.prePar = el.parentNode
          this.prePar.classList.add('isActive_tree_item')
        }
      })
    },
    // 选择工序为Designtype有值的时候的物料列表
    async getAgreeDeviceList(proc) {
      const params = {
        project_code: this.transferData.project_code,
        point_code: this.transferData.point_code,
        proc_code: proc.procCode
      }
      const { data, code, message } = await this.$pub.post('point/proc/device/list', params)
      let agree_device_list = []
      if (code === 200) {
        agree_device_list = (data.list || []).map(m => {
          return {
            ...m,
            disabled: m.design_num <= m.photo_num,
            label: m.device_name,
            procCode: proc.procCode,
            procName: proc.procName,
            isLeaf: true,
            id: m.device_id
          }
        })
      } else {
        this.$notify.error({
          title: '查询失败',
          message: message
        })
        agree_device_list = []
      }
      return agree_device_list
    },
    async sure() {
      // if ((this.transferData.proc_code === this.selectProc.procCode) && (this.transferData.direction === this.direction.direct_name)) {
      //   return this.$message({
      //     type: 'info',
      //     message: '本次没有做出改变，不需要迁移',
      //     showClose: true,
      //     customClass: 'message2'
      //   })
      // }
      const params = {
        project_code: this.transferData.project_code,
        proc_code: this.selectProc.procCode,
        attach_ids: this.transferData.images.map(m => m.id),
        device_id: this.selectProc.device_id ? this.selectProc.device_id : null,
        dist_code: this.direction.point_code
      }
      const { code } = await this.$pub.post('/point/proc/photo/move', params)
      if (code === 200) {
        this.$emit('refreshCenter')
        this.$emit('update:showAllProc', false)
      } else {
        this.$message({
          type: 'error',
          message: '转移失败',
          showClose: true,
          customClass: 'message2'
        })
      }
    },
    cancle() {
      this.$emit('update:showAllProc', false)
    }
  }
}
</script>

<style lang="scss">
.proc-transfer-setting{
  .el-drawer__header{
    // margin-bottom:0px;
    // padding:10px 10px 0 0;
    // position: absolute;
    // top:10px;
    // right:10px;
    // z-index: 1;
    display:none;
  }
  .el-drawer__body{
    padding: 20px;
    height:100%;
    margin-top:-10px;
    box-sizing: border-box;
    .wrap{
      height:100%;
      .el-timeline{
        height:calc(100% - 32px);
        overflow: auto;
        padding-left: 1px;
      }
    }
  }
  .opera{
    display:flex;
    flex-direction: row-reverse;
  }
  .images{
    margin-top:10px;
    display:flex;
    justify-content: flex-start;
    flex-wrap: wrap;
    li{
      border:1px solid #eee;
      height: 140px;
      width: 140px;
      margin-right:10px;
      img{
        width: 140px;
        height: 140px;
      }
    }
  }
  .el-tree{
    .isActive_tree_item{
      color:#fff;
      background-color: #409EFF!important;
    }
    .el-tree-node__content{
      height: 36px;
    }
  }
  .select{
   .el-button{
     margin-left:10px;
   }
  }
  .tit{
    font-size:18px;
    line-height:30px;
    span{
      margin-right:10px;
    }
  }
  .el-radio-group{
    margin-top:10px;
  }
}
</style>
