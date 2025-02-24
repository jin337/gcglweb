<template>
  <div class="buildOrder" v-loading="loading">
    <el-descriptions :column="2" size="mini" border>
      <template v-if="isOne">
        <el-descriptions-item label="点位名称">{{currentData.point_name}}</el-descriptions-item>
        <el-descriptions-item label="点位编码">{{currentData.point_code}}</el-descriptions-item>
        <el-descriptions-item label="设备IP" :span="2">
           <ul class="n-content" v-loading="iploading">
            <li v-for="item in ipList" :key="item.device_ip" class="li">
              <el-tag size="small"  :closable="ipList.length>1" @close="deleteIP(item)">{{item.device_ip}}</el-tag>
            </li>
          </ul>
        </el-descriptions-item>
      </template>

      <el-descriptions-item label="故障类型" :span="2" label-class-name="required" >
        <el-select class="n-content" filterable v-model="fault_type" placeholder="请选择">
          <el-option
            v-for="item in fault_typeList"
            :key="item.id"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
        <span class="error">{{error.fault_type}}</span>
      </el-descriptions-item>
      <el-descriptions-item label="派单部门" :span="2">
        <treeselect
          class="n-content"
          v-model="dept_id"
          :normalizer="normalizer"
          placeholder="输入搜索词查询部门"
          :options="deptOptions"
          :flat="true"
        />
      </el-descriptions-item>
      <el-descriptions-item label="派单描述" :span="2" v-if="dept_id" label-class-name="required">
        <el-input  class="n-content" size="mini" v-model="assign_desc" type="textarea" />
        <span class="error">{{error.assign_desc}}</span>
      </el-descriptions-item>
      <el-descriptions-item label="工单描述" :span="2" label-class-name="required">
        <el-input  class="n-content" size="mini" v-model="fault_order_desc" type="textarea" />
        <span class="error">{{error.fault_order_desc}}</span>
      </el-descriptions-item>
    </el-descriptions>

    <div class="btns">
      <el-button size="mini" type="primary" @click="submit">生成</el-button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'buildOrder',
  props: {
    buildFlag: {
      type: Boolean,
      default: false
    },
    currentData: {
      type: [Object, Array],
      require: true
    }
  },
  data () {
    return {
      loading: false,
      fault_type: 1, // 故障类型 默认选中设备不在线
      fault_typeList: [],
      deptOptions: [],
      dept_id: null, // 派单部门
      assign_desc: '', //  派单描述
      fault_order_desc: '', // 工单描述
      ipList: [], // ip列表
      iploading: false,
      error: {
        fault_type: '',
        assign_desc: '',
        fault_order_desc: ''
      }
    }
  },
  computed: {
    isOne() {
      return this.currentData && !Array.isArray(this.currentData)
    }
  },
  watch: {
    fault_type(val) {
      if (val) {
        this.error.fault_type = ''
      } else {
        this.error.fault_type = '故障类型必选'
      }
    },
    assign_desc(val) {
      if (val) {
        this.error.assign_desc = ''
      } else {
        this.error.assign_desc = '派单描述必填'
      }
    },
    fault_order_desc(val) {
      if (val) {
        this.error.fault_order_desc = ''
      } else {
        this.error.fault_order_desc = '工单描述必填'
      }
    }
  },
  mounted() {
    this.getfault_type()
    this.getDept()
    if (this.isOne) {
      this.getIpList()
    }
  },
  components: {

  },
  methods: {
    getfault_type() {
      this.$dict(this, 'fault_type').then(res => {
        if (res.code === 200) {
          this.fault_typeList = (res.data || []).map(m => {
            return {
              value: Number(m.value),
              label: m.label
            }
          })
        } else {
          this.$message({
            type: 'error',
            message: '字典获取出错了fault_type',
            showClose: true
          })
          this.fault_typeList = []
        }
      })
    },
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
    // 获取ip列表
    async getIpList() {
      this.iploading = true
      const params = {
        project_code: this.currentData.project_code, // 项目编码
        point_code: this.currentData.point_code// 点位编码
      }
      const { data, code } = await this.$pub.post('point/fault/fault-ip-list', params)
      if (code === 200) {
        this.ipList = data.list || []
      } else {
        this.$message({
          type: 'error',
          message: '获取ip列表出错了',
          showClose: true
        })
        this.ipList = []
      }
      this.iploading = false
    },
    deleteIP(ip) {
      const _acData = this.ipList.find(x => x.device_id === ip.device_id)
      this.ipList.splice(this.ipList.indexOf(_acData), 1)
    },
    async submit() {
      // error: {
      //   fault_type: '',
      //   assign_desc: '',
      //   fault_order_desc: ''
      // }
      let flag = false
      if (!this.fault_type) {
        this.error.fault_type = '故障类型必选'
        flag = true
      }
      if (this.dept_id && !this.assign_desc) {
        this.error.assign_desc = '派发描述必填'
        flag = true
      }
      if (!this.fault_order_desc) {
        this.error.fault_order_desc = '工单描述必填'
        flag = true
      }
      if (!flag) {
        this.loading = true
        let url = ''
        let params = {
          assign_dept: this.dept_id ? this.dept_id : 0, // 派发部门 传0 则代表不进行派单操作
          fault_type: this.fault_type, // 故障类型
          assign_desc: this.assign_desc ? this.assign_desc : this.fault_order_desc, // 派发描述
          fault_order_desc: this.fault_order_desc // 故障工单描述
        }

        if (this.isOne) {
          url = 'point/fault/build-order'
          params = {
            ...params,
            project_code: this.currentData.project_code, // 项目编码
            point_code: this.currentData.point_code, // 点位编码
            device_list: this.ipList
          }
        } else {
          url = 'point/fault/build-order-batch'
          params = {
            ...params,
            point_list: this.currentData.map(m => {
              return {
                point_code: m.point_code,
                project_code: m.project_code
              }
            })
          }
        }
        const { code, message } = await this.$pub.post(url, params)
        this.loading = false
        if (code !== 200) {
          this.$message({
            message: message || '生成失败',
            type: 'info',
            showClose: true,
            customClass: 'uploadMessage'
          })
        } else {
          this.$emit('update:buildFlag', false)
          this.$emit('handleQuery')
        }
      }
    }
  }
}
</script>

<style lang='scss'>
.buildOrder{
  .required{
    &:before{
      content: "*";
      color: #f56c6c;
      margin-right: 4px;
    }
  }
  .el-descriptions-item__label{
    width:88px;
    font-size: 14px;
  }
  .n-content{
    width:548px;
    border-radius: 4px;
    .li{
      width:25%;
      display: inline-block;
      margin:10px 0;
    }
  }
  .btns{
    text-align: right;
    margin-top:20px;
  }
  .error{
    color: #f56c6c;
    display: block;
  }
}
</style>
