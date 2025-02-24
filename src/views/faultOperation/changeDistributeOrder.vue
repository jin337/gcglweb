<template>
  <div v-loading="loading" class="change_fault">
    <h3 v-if="!isInfo">改派审核</h3>
    <el-descriptions :column="2" size="mini" border v-for="item in apply_info" :key="item.id" class="item">
      <el-descriptions-item label="申请部门">{{ item.apply_dept_name ? item.apply_dept_name : '/' }}</el-descriptions-item>
      <el-descriptions-item label="申请人">{{ item.apply_user_name ? item.apply_user_name : '/' }}</el-descriptions-item>
      <el-descriptions-item label="申请时间">{{ item.apply_time ? item.apply_time : '/' }}</el-descriptions-item>
      <el-descriptions-item label="申请类型">{{ item.apply_type_name ? item.apply_type_name : '/' }}</el-descriptions-item>
      <el-descriptions-item label="照片" :span="2">
        <div v-viewer="options">
          <img v-for="img in item.img_list" :key="img.id" :src="base_url + img.file_path + img.file_name"
            :data-source="base_url + img.file_path + img.file_name" class="img" />
        </div>
      </el-descriptions-item>
      <el-descriptions-item label="申请描述" :span="2">{{ item.apply_desc ? item.apply_desc : '/' }}</el-descriptions-item>
      <el-descriptions-item label="审核描述" :span="2">
        <el-input v-if="!isInfo" class="n-content" size="mini" v-model="complete_desc" type="textarea" />
        <span v-else>{{ item.oper_desc ? item.oper_desc : '/' }}</span>
      </el-descriptions-item>
    </el-descriptions>

    <span class="error">{{ errorMsg }}</span>
    <el-empty :image-size="200" v-if="apply_info.length <= 0"></el-empty>
    <div slot="footer" v-if="!isInfo" class="dialog-footer">
      <el-button size="mini" type="danger" @click="submitMethod(2)">拒绝</el-button>
      <el-button size="mini" type="primary" @click="submitMethod(1)">通过</el-button>
    </div>
  </div>
</template>

<script>
import config from '@/config/config'
export default {
  name: 'change-distribute-order',
  props: {
    changedistributeFlag: {
      type: Boolean,
      default: false
    },
    presentId: {
      type: Number,
      require: true
    },
    isInfo: {
      type: Boolean,
      default: false
    },
    allInfo: {
      type: Object,
      default: () => { }
    }
  },
  data () {
    return {
      loading: false,
      complete_desc: '',
      errorMsg: '',
      options: {
        toolbar: true,
        url: 'data-source'
      },
      apply_info: []
      // base_url: config.base_url
    }
  },
  computed: {
    base_url () {
      const api = config.defaultApi
      const env = process.env.NODE_ENV === 'production' ? api : ''
      const baseurl = process.env.VUE_APP_BASE_URL + env
      return baseurl
    }
  },
  mounted () {
    if (!this.isInfo) {
      this.getInfo()
    } else {
      this.apply_info = this.allInfo.apply_info || []
    }
  },
  watch: {
    complete_desc (val) {
      if (val) {
        this.errorMsg = ''
      } else {
        this.errorMsg = '必须输入拒绝的审核描述'
      }
    }
  },
  methods: {
    // 获取申请信息
    async getInfo () {
      this.loading = true
      const params = {
        order_id: this.presentId
      }
      const { data, code } = await this.$pub.post('point/fault/get-order-apply', params)
      this.loading = false
      if (code !== 200) {
        return this.$message({
          message: '获取申请信息出错了',
          type: 'error',
          showClose: true
        })
      }
      this.apply_info.push(data)
    },
    async submitMethod (complete_type) {
      if (complete_type === 2 && this.complete_desc === '') {
        this.errorMsg = '必须输入拒绝的审核描述'
      } else {
        this.errorMsg = ''
        this.loading = true
        if (complete_type === 1 && this.complete_desc === '') {
          this.complete_desc = '同意'
        }
        const params = {
          order_id: this.apply_info[0].order_id,
          apply_id: this.apply_info[0].id, // 申请记录Id
          complete_type: complete_type, // 处理 1通过 2退回
          complete_desc: this.complete_desc// 描述
        }
        this.loading = false
        this.$emit('update:changedistributeFlag', false)
        const { code } = await this.$pub.post('point/fault/order-apply-handle', params)
        this.loading = false
        if (code !== 200) {
          return this.$message({
            message: '改派工单处理出错了',
            type: 'error',
            showClose: true
          })
        } else {
          this.$emit('update:changedistributeFlag', false)
        }
      }
    }
  }
}
</script>

<style lang='scss'>
.change_fault {
  .item {
    margin-bottom: 10px;
  }
}
</style>
