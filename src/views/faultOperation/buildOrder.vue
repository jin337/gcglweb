<!--
 * @Author: yuanyuan
 * @Date: 2024-08-30 09:38:13
 * @LastEditors: yuanyuan
 * @LastEditTime: 2025-03-17 14:21:41
 * @FilePath: \gcgl_web\src\views\faultOperation\buildOrder.vue
 * @des:工单生成 新建工单
-->
<template>
  <div class="buildOrder" v-loading="loading">
    <el-form :model="form" :rules="rules" ref="formRef" size="small">
      <div class="vux-flexbox">
        <span class="label">派发单位</span>
        <el-form-item prop="dept_id">
          <treeselect class="n-content" v-model="form.dept_id" :normalizer="normalizer" placeholder="输入搜索词查询派发单位"
            :options="deptOptions" :flat="true" style="width:250px;" />
        </el-form-item>
        <el-button type="primary" style="margin-left:auto;" size="medium" @click="selectPoint">选择点位</el-button>
      </div>
      <vxe-table show-overflow max-height="250" :data="tableData" :row-config="{ height: 30, isHover: true }"
        highlight-current-row border>
        <vxe-column type=seq title="序号" width="50px" align="center"></vxe-column>
        <vxe-column title="区域" field="area" width="100px" align="center" />
        <vxe-column title="子系统" field="child_name" width="100px" header-align="center" />
        <vxe-column title="点位编码" field="point_code" header-align="center" />
        <vxe-column title="点位名称" field="point_name" header-align="center" />
        <vxe-column title="故障数量" field="count" width="80px" align="center">
          <template v-slot="{ row }">
            <div>
              <el-tooltip v-if="row.ips" class="item" effect="dark" :content="row.ips" placement="top">
                <span>{{ row.count }}</span>
              </el-tooltip>
              <span v-else>{{ row.count }}</span>
            </div>
          </template>
        </vxe-column>
        <vxe-column title="故障类型" field="fault_type" header-align="center" width="140px">
          <template v-slot="{ row }">
            <el-select v-model="row.fault_type" :key="row.id" size="mini" placeholder="请选择" style="width:110px;"
              @change="handleSelect(row)">
              <el-option v-for="item in faultTypeList" :key="item.id" :label="item.label" :value="item.value" />
            </el-select>
          </template>
        </vxe-column>
        <vxe-column title="操作" align="center" width="60px">
          <template v-slot="{ row }">
            <el-button size="mini" type="text" @click="handleDelete(row)" v-if="row.status === 0">删除</el-button>
          </template>
        </vxe-column>
      </vxe-table>
      <div class="flexwidth">
        <!-- 人力 -->
        <div class="hesuanwrap">
          <!-- 下拉框 -->
          <div class="vux-flexbox">
            <span class="label">人力选择</span>
            <el-form-item prop="selectedWorkers" style="width: calc(100% - 70px)">
              <el-select v-model="form.selectedWorkers" multiple placeholder="请选择工种" style="width: 100%">
                <el-option v-for="worker in workerList" :key="worker.value" :label="worker.fullName"
                  :value="worker.value">
                  <span>{{ worker.fullName }}</span>
                </el-option>
              </el-select>
            </el-form-item>
          </div>

          <!-- 动态渲染选中的工种和数量输入框 -->
          <div class="vux-flexbox" v-if="form.selectedWorkers.length > 0">
            <span class="label">人力数量</span>
            <div class="xunhuanbox">
              <el-form-item v-for="worker in form.selectedWorkers" :key="worker" :prop="`workerQuantities[${worker}]`"
                :rules="workerQuantityRules">
                <el-tag style="margin-right:10px;">
                  <span>{{ getWorkerName(worker) }}：</span>
                  <el-input-number v-model="form.workerQuantities[worker]" placeholder="请输入数量" style="width: 100px"
                    size="mini" :min="1" :step="1" step-strictly controls-position="right" />
                </el-tag>
              </el-form-item>
            </div>
          </div>
        </div>

        <!-- 车辆 -->
        <div class="hesuanwrap">
          <!-- 下拉框 -->
          <div class="vux-flexbox">
            <span class="label">车辆选择</span>
            <el-form-item prop="selectedCars" style="width: calc(100% - 70px)">
              <el-select v-model="form.selectedCars" multiple placeholder="请选择车辆" style="width: 100%">
                <el-option v-for="car in carList" :key="car.value" :label="car.fullName" :value="car.value">
                  <span>{{ car.fullName }}</span>
                </el-option>
              </el-select>
            </el-form-item>
          </div>

          <!-- 动态渲染选中的车辆和数量输入框 -->
          <div class="vux-flexbox" v-if="form.selectedCars.length > 0">
            <span class="label">车辆数量</span>
            <div class="xunhuanbox">
              <el-form-item v-for="car in form.selectedCars" :key="car" :prop="`carQuantities[${car}]`"
                :rules="carQuantityRules">
                <el-tag style="margin-right:10px;">
                  <span>{{ getCarName(car) }}：</span>
                  <el-input-number v-model="form.carQuantities[car]" placeholder="请输入数量" style="width: 100px"
                    size="mini" :min="1" :step="1" step-strictly controls-position="right" />
                </el-tag>
              </el-form-item>
            </div>
          </div>
        </div>
      </div>
      <!-- 价格 -->
      <div style="margin-top: 13px;width:100%;" class="vux-flexbox">
        <span class="label">价格合计</span>
        <el-form-item prop="sumPrice" style="width: calc(100% - 70px)">
          <el-input v-model="sumPrice" readonly />
        </el-form-item>
      </div>

      <!-- 备注 -->
      <div style="margin-top: 13px;" class="vux-flexbox">
        <span class="label">备 注</span>
        <el-form-item prop="remark" style="width:calc(100% - 70px);">
          <el-input size="mini" v-model="form.remark" type="textarea" />
        </el-form-item>
      </div>
    </el-form>

    <div class="btns">
      <el-button size="mini" type="primary" @click="handleSubmit">生成</el-button>
    </div>

    <el-dialog title="选择点位" :visible.sync="selectFlag" width="1000px" append-to-body :lock-scroll="false">
      <selectPointBox v-if="selectFlag" :project_code="project_code" :childList="childList" :areaList="areaList"
        :selectFlag.sync="selectFlag" @initTableData="initTableData"></selectPointBox>
    </el-dialog>
  </div>
</template>

<script>
import mixin from './mixin.js'
import selectPointBox from './SelectPoint.vue'
export default {
  name: 'buildOrder',
  mixins: [mixin],
  props: {
    buildFlag: {
      type: Boolean,
      default: false
    },
    currentData: { // 点位不是工单哦，用于故障列表单个点位生成工单的
      type: Array,
      default: () => []
    },
    currentOrder: { // 当前选择的工单哦
      type: Object,
      default: () => { }
    },
    project_code: {
      type: String,
      require: true
    },
    projectList: {
      type: Array,
      require: true
    },
    childList: {
      type: Array,
      require: true
    },
    areaList: {
      type: Array,
      require: true
    },
    faultTypeList: {
      type: Array,
      default: () => []
    },
    isEdit: { // 编辑工单
      type: Boolean,
      default: false
    }
  },
  data () {
    return {
      loading: false,
      deptOptions: [],
      tableData: [],
      // 表单数据
      form: {
        dept_id: null,
        selectedWorkers: [], // 人力选择 选中的
        workerQuantities: {}, // 人力数量
        selectedCars: [], // 车辆选择  选中的
        carQuantities: {}, // 车辆数量
        remark: '' // 备注
      },
      // 校验规则
      rules: {
        dept_id: [
          { required: true, message: '请选择派发单位', trigger: 'change' }
        ],
        selectedWorkers: [
          { required: true, message: '请选择人力', trigger: 'change' }
        ],
        // selectedCars: [
        //   { required: true, message: '请选择车辆', trigger: 'change' }
        // ],
        remark: [
          { required: true, message: '请输入备注', trigger: 'blur' }
        ]
      },
      // 选择点位
      selectFlag: false
    }
  },
  mounted () {
    this.getDept()
    this.init()
  },
  components: {
    selectPointBox
  },
  computed: {
    // 计算金额合计
    sumPrice () {
      const workertotalAmount = this.form.selectedWorkers.reduce((total, worker) => {
        const workerInfo = this.workerList.find((w) => w.value === worker)
        if (workerInfo) {
          return total + (this.form.workerQuantities[worker] || 0) * workerInfo.price
        }
        return total
      }, 0)
      const cartotalAmount = this.form.selectedCars.reduce((total, car) => {
        const carInfo = this.carList.find((w) => w.value === car)
        if (carInfo) {
          return total + (this.form.carQuantities[car] || 0) * carInfo.price
        }
        return total
      }, 0)
      return workertotalAmount + cartotalAmount
    }
  },
  methods: {
    async init () {
      // 故障列表=》生成工单
      this.tableData = Object.values(this.currentData.reduce((acc, item) => {
        const { point_code } = item
        item.fault_type = 1
        item.ips = item.device_ip
        if (!acc[point_code]) {
          acc[point_code] = { ...item, count: 1, faultReason: '设备不在线' }
        } else {
          acc[point_code].count += 1
        }

        return acc
      }, {}))

      // 工单列表编辑回显
      if (this.isEdit) {
        this.loading = true
        const params = {
          order_id: this.currentOrder.id + ''
        }
        const { data, code } = await this.$pub.post('/point/order/detail', params)
        this.loading = false
        if (code !== 200) {
          this.tableData = []
          return this.$message({
            message: '获取详情出错了',
            type: 'error',
            showClose: true
          })
        }

        this.form.dept_id = data.fault_dept
        this.tableData = data.point_list
        this.form.remark = data.fault_order_desc

        /**
         *已选回填
         */
        const workList = data.price_list_first.filter(m => m.type === 1)
        const carList = data.price_list_first.filter(m => m.type === 2)
        const workInfo = this.parseQuantities(workList)
        const carInfo = this.parseQuantities(carList)

        this.form.selectedWorkers = workInfo.keys// 人力选择 选中的键value
        this.form.workerQuantities = workInfo.Quantities // 人力数量 {value:count}
        this.form.selectedCars = carInfo.keys // 车辆选择  选中的
        this.form.carQuantities = carInfo.Quantities//  车辆数量
      }
    },
    async getDept () {
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

    selectPoint () {
      this.selectFlag = true
    },
    // 选择点位后回调
    initTableData (arr) {
      console.log(arr)
      const arrMap = new Map(arr.map(item => [item.point_code, item]))
      const mergedData = this.tableData.map(item => {
        // 如果 point_code 在 arr 中存在，则使用 arr 中的数据
        if (arrMap.has(item.point_code)) {
          return arrMap.get(item.point_code)
        }
        // 否则保留 tableData 中的数据
        return item
      })

      // 将 arr 中新增的数据（point_code 不在 tableData 中的数据）追加到结果中
      const newDataFromArr = arr.filter(item => !this.tableData.some(t => t.point_code === item.point_code))
      this.tableData = [...mergedData, ...newDataFromArr]
      this.selectFlag = false
    },
    // 改变故障类型实时界面切换显示
    handleSelect (row) {
      this.$set(this.tableData, this.tableData.indexOf(row), { ...row })
    },
    // 删除当前行
    handleDelete (row) {
      // 确认是否删除
      this.$confirm('确定要删除该行吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(() => {
          // 从表格数据中移除当前行
          this.tableData = this.tableData.filter(item => item.id !== row.id)
          this.$message.success('删除成功')
        })
        .catch(() => {
          this.$message.info('已取消删除')
        })
    },
    async handleSubmit () {
      this.$refs.formRef.validate(async (valid) => {
        if (this.sumPrice <= 0) {
          return
        }
        if (this.tableData.length <= 0) {
          this.$message.error('没有选择点位')
          return
        }
        if (valid) {
          console.log('表单数据：', this.form)
          const workPrice = this.assignWorker(this.form.workerQuantities, this.workerList)
          const carPrice = this.assignWorker(this.form.carQuantities, this.carList)
          console.log(workPrice, carPrice)
          const tempobj = {
            id: this.isEdit ? this.currentOrder.id : null,
            project_code: this.project_code,
            fault_order_desc: this.form.remark,
            fault_dept: this.form.dept_id,
            // fault_order_type: 1,
            point_list: this.tableData.map(m => {
              return {
                point_code: m.point_code,
                ips: m.ips,
                status: this.isEdit ? 0 : 1,
                count: m.count,
                fault_type: m.fault_type
              }
            }),
            price_list_first: [...workPrice, ...carPrice]
          }
          const url = this.isEdit ? '/point/order/edit' : '/point/order/add'
          const { code, message } = await this.$pub.post(url, tempobj)
          if (code === 200) {
            this.$message.success(message)
            this.$emit('update:buildFlag', false)
          } else {
            this.$notify.error({
              title: '生成失败',
              message: message
            })
          }
        } else {
          this.$message.error('请填写完整表单')
        }
      })
    }
  }
}
</script>

<style lang='scss'>
.buildOrder {
  .vux-flexbox {
    margin-bottom: 13px;
    flex-wrap: wrap;

    .label {
      margin-right: 6px;
      font-weight: 700;
      color: #333;
      display: inline-block;
      width: 60px;
    }

    .el-form-item--small.el-form-item {
      margin-bottom: 0;
    }

    .xunhuanbox {
      display: flex;
      flex-wrap: wrap;
      flex: 1;
    }
  }

  .btns {
    text-align: right;
    margin-top: 20px;
  }

  .flexwidth {
    margin-top: 20px;
    flex: 1;
    display: flex;
    flex-wrap: wrap;

    .hesuanwrap {
      width: calc(50% - 4px);

      .vux-flexbox {
        align-items: center;
      }

      .el-tag {
        padding: 0 0px 0 2px;
      }
    }
  }

}
</style>
