<template>
  <div v-loading="loading" class="examine_wrap">
    <h3 v-if="!isInfo">结单审核</h3>
    <div v-if="complete_info.length > 0">
      <el-descriptions :column="2" size="mini" border v-for="item in complete_info" :key="item.id" class="item">
        <el-descriptions-item label="完成部门">{{ item.create_dept_name ? item.create_dept_name : '/' }}</el-descriptions-item>
        <el-descriptions-item label="提交人">{{ item.create_user_name ? item.create_user_name : '/' }}</el-descriptions-item>
        <el-descriptions-item label="完成时间" :span="2">{{ item.create_time ? item.create_time : '/' }}</el-descriptions-item>
        <el-descriptions-item label="照片" :span="2">
          <div v-viewer="options">
            <img v-for="img in item.img_list" :key="img.id" :src="base_url + img.file_path + img.file_name"
              :data-source="base_url + img.file_path + img.file_name" class="img" />
          </div>
        </el-descriptions-item>
        <el-descriptions-item label="故障描述" :span="2">{{ item.fault_desc ? item.fault_desc : '/' }}</el-descriptions-item>
        <el-descriptions-item label="完成情况" :span="2">{{ item.complete_desc ? item.complete_desc : '/' }}</el-descriptions-item>
        <!-- <el-descriptions-item label="故障类型" :span="2" v-if="!isInfo">
          <el-select v-model="item.fault_type" placeholder="请选择" class="n-content">
            <el-option
              v-for="item in fault_typeList"
              :key="item.id"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-descriptions-item> -->
        <el-descriptions-item label="故障定性" :span="2" v-if="!isInfo">
          <el-select v-model="item.fault_nature" placeholder="请选择" class="n-content">
            <el-option v-for="item in fault_natureList" :key="item.id" :label="item.label" :value="item.value" />
          </el-select>
        </el-descriptions-item>
        <el-descriptions-item label="审核内容" :span="2">
          <el-input v-if="!isInfo" class="n-content" size="mini" v-model="verify_desc" type="textarea" />
          <span v-else>{{ item.verify_desc ? item.verify_desc : '/' }}</span>
        </el-descriptions-item>
        <el-descriptions-item label="工单定性" v-if="isInfo && item.verify_type === 1"
          :span="2">{{ item.fault_nature_name ? item.fault_nature_name : '/' }}</el-descriptions-item>
        <el-descriptions-item label="审核类型" v-if="isInfo"
          :span="2">{{ item.verify_type === 2 ? '拒绝' : item.verify_type === 1 ? '通过' : '/' }}</el-descriptions-item>
      </el-descriptions>
      <span class="error">{{ errorMsg }}</span>
      <div slot="footer" class="dialog-footer" v-if="!isInfo">
        <el-button size="mini" type="danger" @click="submitMethod(2)">拒绝</el-button>
        <el-button size="mini" type="primary" @click="submitMethod(1)">通过</el-button>
      </div>
    </div>
    <el-empty :image-size="200" v-else></el-empty>
  </div>
</template>

<script>
import config from '@/config/config'
export default {
  name: 'examine_order',
  props: {
    examineFlag: {
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
    },
    fault_typeList: {
      type: Array,
      require: true
    }
  },
  data () {
    return {
      loading: false,
      verify_desc: '',
      errorMsg: '',
      options: {
        toolbar: true,
        url: 'data-source'
      },
      complete_info: [],
      // base_url: config.base_url,
      fault_natureList: []
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
  created () {
    this.getfault_natureList()
  },
  mounted () {
    if (!this.isInfo) {
      this.getInfo()
    } else {
      this.complete_info = this.allInfo.complete_info || []
    }
  },
  components: {

  },
  watch: {
    verify_desc (val) {
      if (val) {
        this.errorMsg = ''
      } else {
        this.errorMsg = '必须输入拒绝的审核内容'
      }
    }
  },
  methods: {
    // 获取完成信息
    async getInfo () {
      this.loading = true
      const params = {
        order_id: this.presentId
      }
      const { data, code } = await this.$pub.post('point/fault/get-order-complete', params)
      this.loading = false
      if (code !== 200) {
        return this.$message({
          message: '获取申请信息出错了',
          type: 'error',
          showClose: true
        })
      }
      this.complete_info.push(data)
    },
    // 获取故障定性
    getfault_natureList () {
      this.$dict(this, 'fault_nature').then(res => {
        if (res.code === 200) {
          this.fault_natureList = (res.data || []).map(m => {
            return {
              value: Number(m.value),
              label: m.label
            }
          })
        } else {
          this.$message({
            type: 'error',
            message: 'fault_nature',
            showClose: true
          })
          this.fault_natureList = []
        }
      })
    },
    async submitMethod (verify_type) {
      if (verify_type === 2 && this.verify_desc === '') {
        this.errorMsg = '必须输入拒绝的审核内容'
      } else {
        this.errorMsg = ''
        this.loading = true
        if (verify_type === 1 && this.verify_desc === '') {
          this.verify_desc = '同意'
        }
        const params = {
          order_id: this.complete_info[0].order_id,
          complete_id: this.complete_info[0].id, // 完成记录Id
          verify_type: verify_type, // 审核类型 1通过 2退回
          verify_desc: this.verify_desc, // 描述
          // fault_type: this.complete_info.fault_type
          fault_nature: this.complete_info[0].fault_nature
        }
        this.loading = false
        this.$emit('update:examineFlag', false)
        const { code } = await this.$pub.post('point/fault/order-complete-verify', params)
        this.loading = false
        if (code !== 200) {
          return this.$message({
            message: '接单审核处理出错了',
            type: 'error',
            showClose: true
          })
        } else {
          this.$emit('update:examineFlag', false)
        }
      }
    }
  }
}
</script>

<style lang='scss'>
.examine_wrap {
  .item {
    margin-bottom: 10px;
  }
}
</style>
