<template>
  <div v-loading="loading">
    <div v-if="!isInfo">
      <h3>工单派发</h3>
      <el-descriptions :column="2" size="mini" border>
        <el-descriptions-item label="派发部门" label-class-name="required"  :span="2">
          <treeselect
            v-model="form.dept_id"
            :normalizer="normalizer"
            placeholder="输入搜索词查询部门"
            :options="deptOptions"
            style="width:100%;"
            :flat="true"
          />
          <span class="error">{{error.dept}}</span>
        </el-descriptions-item>
        <el-descriptions-item label="派单描述" :span="2" label-class-name="required">
          <el-input size="mini" placeholder="输入派单描述" v-model="form.assign_desc" type="textarea" />
          <span class="error">{{error.assign_desc}}</span>
        </el-descriptions-item>
      </el-descriptions>
      <span class="error">{{errorMsg}}</span>
      <div slot="footer" class="dialog-footer">
        <el-button size="mini"  type="primary" @click="submitMethod">保存</el-button>
      </div>
    </div>
    <div v-else>
      <el-descriptions :column="1" size="mini" border v-if="assign_info&&assign_info.id!==0">
        <el-descriptions-item label="派发部门">{{assign_info.assign_dept_name?assign_info.assign_dept_name:'/'}}</el-descriptions-item>
        <el-descriptions-item label="派发时间">{{assign_info.assign_time?assign_info.assign_time:'/'}}</el-descriptions-item>
        <el-descriptions-item label="派单描述">{{assign_info.assign_desc?assign_info.assign_desc:'/'}}</el-descriptions-item>
      </el-descriptions>
      <el-empty :image-size="200" v-else ></el-empty>
    </div>

  </div>
</template>

<script>
export default {
  name: 'distribute_order',
  props: {
    distributeFlag: {
      type: Boolean,
      default: false
    },
    isInfo: {
      type: Boolean,
      default: false
    },
    presentId: {
      type: Number,
      default: 0
    },
    allInfo: {
      type: Object,
      default: () => {}
    }
  },
  data () {
    return {
      loading: false,
      form: {
        dept_id: null,
        assign_desc: '' //  派单描述
      },
      deptOptions: [],
      errorMsg: '',
      options: {
        toolbar: true,
        url: 'data-source'
      },
      assign_info: null,
      error: {
        dept: '',
        assign_desc: ''
      }
    }
  },
  watch: {
    'form.dept_id': {
      handler(val) {
        if (val) {
          this.error.dept = ''
        } else {
          this.error.dept = '派发部门必选'
        }
      },
      deep: true
    },
    'form.assign_desc': {
      handler(val) {
        if (val) {
          this.error.assign_desc = ''
        } else {
          this.error.assign_desc = '派单描述必填'
        }
      },
      deep: true
    }
  },
  mounted() {
    if (this.isInfo) {
      this.assign_info = this.allInfo.assign_info
    } else {
      this.getDept()
    }
  },
  components: {

  },
  methods: {
    async getDept() {
      const { data, code } = await this.$pub.post('/sys/dept/list-tree', { mc: '' })
      if (code !== 200) {
        return this.$message({
          type: 'error',
          message: '获取部门出错了',
          showClose: true
        })
      }
      const datas = Array.isArray(data.dept) ? data.dept : data.dept.child
      this.deptOptions = datas.map(m => {
        return {
          ...m,
          isDisabled: m.pid === '0'
        }
      })
    },
    normalizer (node) { /** 转换菜单数据结构 */
      if (node.child && !node.child.length) {
        delete node.child
      }
      return {
        id: node.id,
        label: node.mc,
        children: node.child
      }
    },
    async submitMethod() {
      let flag = false
      if (!this.form.dept_id) {
        this.error.dept = '派发部门必选'
        flag = true
      }
      if (!this.form.assign_desc) {
        this.error.assign_desc = '派发描述必填'
        flag = true
      }
      if (!flag) {
        this.loading = true
        const params = {
          order_id: this.presentId,
          assign_dept: this.form.dept_id, // 派单部门
          assign_desc: this.form.assign_desc// 描述
        }
        this.loading = false
        const { code } = await this.$pub.post('point/fault/order-assign', params)
        this.loading = false
        if (code !== 200) {
          return this.$message({
            message: '派发工单出错了',
            type: 'error',
            showClose: true
          })
        } else {
          this.$emit('update:distributeFlag', false)
        }
      }
    }
  }
}
</script>

<style lang='scss'>

</style>
