<template>
  <div v-loading="loading">
    <h3>新建工单</h3>
    <el-form ref="form" :model="form" :rules="rules" size="small" label-width="80px" >
      <el-form-item label="项目名称" prop="project_code" inline>
        <el-select
          v-model="form.project_code"
          placeholder="请选择"
          clearable
          filterable
          @change="handleProjectChange"
          size="small"
          style="width:240px"
        >
          <el-option
            v-for="item in projectList"
            :key="item.id"
            :label="item.project_name"
            :value="item.project_code"
          ></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="点位编码" prop="point">
        <el-select
          v-model="form.point"
          placeholder="请输入"
          @change="handlePointCodeChange"
          :disabled="!form.project_code"
          value-key="point_code"
          filterable
          remote
          :remote-method="remoteMethod"
          :loading="pointLoading"
           style="width:240px"
        >
          <el-option v-for="item in pointList" :key="item.point_code"  :value="item" :label="item.point_code">
            <span style="float: left">{{ item.point_name }}</span>
            <span style="float: right; color: #8492a6; font-size: 13px">{{ item.point_code }}</span>
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="点位名称"  prop="point_name">
        <el-input v-model="form.point_name" placeholder="点位编码连带入" readonly style="width:240px"></el-input>
      </el-form-item>
      <el-form-item label="故障类型" prop="fault_type">
        <el-select v-model="form.fault_type" clearable placeholder="请选择"  style="width:240px">
          <el-option
            v-for="item in fault_typeList"
            :key="item.id"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="工单类型" class="is-required">
        <el-select v-model="form.fault_order_type" clearable placeholder="请选择"  style="width:240px">
          <el-option
            v-for="item in fault_order_typeList"
            :key="item.id"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="选择设备" class="is-required" v-if="form.fault_order_type===1">
        <el-popover
          placement="bottom"
          width="700"
          @hide="changeSelectNums"
          trigger="click">
          <device-list ref="deviceref" :form="form" ></device-list>
          <el-input slot="reference"  v-model="form.selectNums" />
        </el-popover>
        <div class="el-form-item__error" v-if="form.device_list.length<=0">
          最少选择一个设备
        </div>
      </el-form-item>
      <el-form-item label="派发部门" class="isrow">
        <treeselect
          v-model="form.assign_dept"
          :normalizer="normalizer"
          placeholder="输入搜索词查询部门"
          :options="deptOptions"
          style="width:100%;"
          :flat="true"
        />
      </el-form-item>
       <el-form-item label="派单描述" prop="assign_desc"  v-if="form.assign_dept" class="isrow">
        <el-input size="mini" placeholder="输入派单描述" v-model="form.assign_desc" type="textarea" />
      </el-form-item>
      <el-form-item label="工单描述" class="isrow" prop="fault_order_desc">
        <el-input size="mini" placeholder="输入工单描述" v-model="form.fault_order_desc" type="textarea" />
      </el-form-item>
    </el-form>
    <div slot="footer" class="dialog-footer">
      <el-button size="mini"  @click="cancel">取消</el-button>
      <el-button size="mini"  type="primary" @click="submitMethod">保存</el-button>
    </div>
  </div>
</template>

<script>
import deviceList from './deviceList.vue'
export default {
  name: 'addOrderfault',
  props: {
    addorderFlag: {
      type: Boolean,
      default: false
    },
    fault_typeList: {
      type: Array,
      require: true
    }
  },
  data () {
    return {
      loading: false,
      form: {
        project_code: '',
        point: null,
        point_code: null,
        point_name: null,
        fault_type: '',
        fault_order_type: 1, // 1设备工单 2其他工单
        device_list: [], // 选择的设备
        selectNums: '已选中0个设备',
        assign_dept: null,
        assign_desc: '', //  派单描述
        fault_order_desc: '' // 工单描述
      },
      rules: {
        project_code: [{ required: true, message: '请选择项目', trigger: 'change' }],
        point: [{ required: true, message: '请输入关键字模糊查询点位', trigger: 'change' }],
        point_name: [{ required: true, message: '请输入关键字模糊查询点位', trigger: 'change' }],
        fault_type: [{ required: true, message: '请选择故障类型', trigger: 'change' }],
        assign_desc: [{ required: true, message: '请输入派单描述', trigger: 'change' }],
        fault_order_desc: [{ required: true, message: '请输入工单描述', trigger: 'change' }]
      },
      projectList: [],
      pointLoading: false,
      pointList: [],
      fault_order_typeList: [],
      deptOptions: []
    }
  },
  computed: {

  },
  mounted() {
    this.getProjectList()
    this.getfault_order_type()
    this.getDept()
  },
  components: {
    deviceList
  },
  methods: {
    async getProjectList() {
      try {
        const url = '/project/list-slt'
        const params = { content: '' }
        const result = await this.$pub.post(url, params)
        if (result.code === 200) {
          this.projectList = result.data || []
        } else {
          this.projectList = []
          this.$notify.error({
            title: '查询失败',
            message: result.message
          })
        }
      } catch (e) {
        this.$notify.error({
          title: '服务器请求失败',
          message: e.message
        })
      }
    },
    // 获取工单类型
    getfault_order_type() {
      this.$dict(this, 'fault_order_type').then(res => {
        if (res.code === 200) {
          this.fault_order_typeList = (res.data || []).map(m => {
            return {
              value: Number(m.value),
              label: m.label
            }
          })
        } else {
          this.$message({
            type: 'error',
            message: '字典获取出错了fault_order_type',
            showClose: true
          })
          this.fault_order_typeList = []
        }
      })
    },
    handleProjectChange() {
      this.pointList = []
      this.form.point = ''
      this.form.point_code = ''
      this.form.point_name = ''
    },
    async remoteMethod(query) {
      if (query !== '') {
        this.pointLoading = true
        const params = {
          project_code: this.form.project_code,
          keywords: query
        }
        const { data } = await this.$pub.post('/point/search', params)
        this.pointList = data || []
        this.pointLoading = false
      }
    },
    // 选择点位后
    handlePointCodeChange(val) {
      this.form.point_code = val.point_code
      this.form.point_name = val.point_name
    },
    // 选择设备后
    changeSelectNums() {
      this.form.device_list = this.$refs.deviceref.selectEd || []
      this.form.selectNums = '已选中' + this.form.device_list.length + '个设备'
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
    cancel() {
      this.$emit('update:addorderFlag', false)
    },
    async submitMethod() {
      const valid = await this.$refs.form.validate().catch((err) => { return err })
      if ((this.form.fault_order_type === 1 && this.form.device_list.length <= 0) || !valid) {
        return
      }
      this.loading = true
      const params = {
        point_code: this.form.point_code, // 点位编码
        project_code: this.form.project_code, // 项目编号
        fault_type: this.form.fault_type, // 故障类型
        fault_order_type: this.form.fault_order_type, // 工单类型
        assign_desc: this.form.assign_desc ? this.form.assign_desc : this.form.fault_order_desc, // 派发描述
        fault_order_desc: this.form.fault_order_desc, // 故障工单描述
        assign_dept: this.form.assign_dept ? this.form.assign_dept : 0,
        device_list: this.form.fault_order_type === 1 ? this.form.device_list : []
      }
      this.loading = false
      const { code } = await this.$pub.post('point/fault/order-add', params)
      this.loading = false
      if (code !== 200) {
        return this.$message({
          message: '新增工单出错了',
          type: 'error',
          showClose: true
        })
      } else {
        this.$emit('update:addorderFlag', false)
      }
    }
  }
}
</script>

<style lang='scss'>
.add_fault_work{
  .el-dialog__header{
    display: none;
  }
  .el-dialog__body{
    h3{
      margin-top:10px;
    }
    .el-form{
      margin-top:20px;
      .el-form-item{
        width:50%;
        display: inline-block;
      }
      .isrow{
        width:100%;
      }
    }
  }
  .dialog-footer{
    padding-right:10px;
  }
}
</style>
