<!--
 * @Author: y
 * @Date: 2025-03-07 12:46:09
 * @LastEditors: y
 * @LastEditTime: 2025-03-17 14:13:30
 * @FilePath: \gcgl_web\src\views\faultOperation\disposeOrder.vue
 * @des:工单处理 工单详情
-->
<template>
  <div v-loading="loading" class="disposeOrderBox">
    <el-form :model="form" :rules="rules" ref="formRef" size="small">
      <!-- 工单处理 -->
      <div class="topwrap">
        <span class="firm">派发单位：{{ currentData.fault_dept_name }}</span>
        <div class="btns" v-if="isOpear">
          <el-button size="mini" type="primary" @click="handleSubmit('temp')">暂存</el-button>
          <el-button size="mini" type="primary" @click="handleSubmit">确定</el-button>
        </div>
      </div>

      <el-card class="box-card">
        <div slot="header" class="clearfix">
          <span>点位列表</span>
        </div>
        <vxe-table ref="xTable" max-height="250" :data="form.tableData" :row-config="{ isHover: true, keyField: 'id' }"
          :checkbox-config="checkboxConfig" highlight-current-row border @cell-dblclick="handleRowDblClick">
          <vxe-column type="checkbox" width="40px" align="center" />
          <vxe-column title="项目" field="project_name" align="center" width="400px" />
          <vxe-column title="区域" field="area" width="80px" align="center" />
          <vxe-column title="子系统" field="child_name" width="120px" header-align="center" />
          <vxe-column title="点位编码" field="point_code" width="130px" header-align="center">
            <template v-slot="{ row, rowIndex }">
              <div class="curp blue" @click="openPoint(row, rowIndex)">{{ row.point_code }}</div>
            </template>
          </vxe-column>
          <vxe-column title="点位名称" field="point_name" header-align="center" width="300px" />
          <vxe-column title="修复数量" field="handle_count" width="40px" align="center">
            <template v-slot="{ row, rowIndex }">
              <!-- <el-form-item :prop="`tableData.${rowIndex}.handle_count`" v-if="row.checked && row.status === 0"
                :rules="rules.movePoint">
                <el-input v-model.number="row.handle_count" placeholder="输入数量" size="mini" style="width: 60px"
                  :disabled="!isOpear"  />
              </el-form-item> -->
              <span class="curp" @click="openFaultInfo(row, rowIndex)">{{ row.handle_count }}</span>
            </template>
          </vxe-column>
          <vxe-column title="报障数量" field="count" width="40px" align="center" />
          <vxe-column title="故障类型" field="fault_type_name" header-align="center" width="110px" />
          <vxe-column title="故障类别" field="fault_category_name" header-align="center" width="110px" />
          <vxe-column field="handle_remark" title="故障原因" width="200px" align="center">
            <template v-slot="{ row, rowIndex }">
              <el-form-item class="handle_remark" :prop="`tableData.${rowIndex}.handle_remark`"
                v-if="row.checked && row.status === 0" :rules="rules.handle_remark">
                <el-input v-model="row.handle_remark" placeholder="输入故障原因" size="mini" :disabled="!isOpear" />
              </el-form-item>
              <span>{{ row.handle_remark }}</span>
            </template>
          </vxe-column>
          <vxe-column field="photo_list" title="维修照片" width="40px" align="center">
            <template v-slot="{ row }">
              <div style="cursor:pointer" @click="handlePreview(row)">{{ row.photo_list.length > 0 ?
                row.photo_list.length
                :
                0 }}</div>
            </template>
          </vxe-column>
          <vxe-column field="handle_time" title="处理时间" align="center">
            <template v-slot="{ row }">
              <span>{{ row.handle_time ? parseTime(row.handle_time) : '' }}</span>
            </template>
          </vxe-column>
        </vxe-table>
      </el-card>

      <div class="bottomwrap vux-flexbox">
        <!-- 费用核算 -->
        <el-card class="box-card feiyong" style="margin-right:20px;">
          <div slot="header" class="clearfix">
            <span>费用核算</span>
          </div>
          <div>
            <div class="hesuanbox">
              <strong>预估:</strong>
              <div class="flexwidth"> {{ form.estimate }}</div>
            </div>
            <div class="hesuanbox">
              <strong>核算:</strong>
              <div class="flexwidth">
                <!-- 人力 -->
                <div class="hesuanwrap" v-if="false">
                  <!-- 下拉框 -->
                  <div class="vux-flexbox" v-if="isOpear">
                    <span class="label">人力选择</span>
                    <el-form-item prop="selectedWorkers">
                      <el-select v-model="form.selectedWorkers" multiple placeholder="请选择工种" style="width: 255px"
                        :disabled="!isOpear">
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
                      <el-form-item v-for="worker in form.selectedWorkers" :key="worker"
                        :prop="`workerQuantities[${worker}]`" :rules="workerQuantityRules">
                        <el-tag style="margin-right:4px;">
                          <span>{{ getWorkerName(worker) }}：</span>
                          <el-input-number :disabled="!isOpear" v-model="form.workerQuantities[worker]"
                            placeholder="请输入数量" style="width: 86px" size="mini" :min="1" :step="1" step-strictly
                            controls-position="right" />
                        </el-tag>
                      </el-form-item>
                    </div>

                  </div>
                </div>

                <!-- 车辆 -->
                <div class="hesuanwrap" v-if="false">
                  <!-- 下拉框 -->
                  <div class="vux-flexbox" v-if="isOpear">
                    <span class="label">车辆选择</span>
                    <el-form-item prop="selectedCars">
                      <el-select v-model="form.selectedCars" multiple placeholder="请选择车辆" style="width: 255px"
                        :disabled="!isOpear">
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
                        <el-tag style="margin-right:4px;">
                          <span>{{ getCarName(car) }}：</span>
                          <el-input-number v-model="form.carQuantities[car]" placeholder="请输入数量" style="width: 86px"
                            :disabled="!isOpear" size="mini" :min="1" :step="1" step-strictly
                            controls-position="right" />
                        </el-tag>
                      </el-form-item>
                    </div>
                  </div>
                </div>

                <!-- 人车合计 -->
                <div class="hesuanwrap vux-flexbox" v-if="false">
                  <span class="label">人车合计</span>
                  <el-form-item prop="carpersonPrice">
                    <el-input v-model="carpersonPrice" style="width: 255px" readonly :disabled="!isOpear" />
                    <div class="el-form-item__error">{{ sumMsg }}</div>
                  </el-form-item>
                </div>

                <!-- 调价 -->
                <div class="hesuanwrap vux-flexbox">
                  <span class="label">调价</span>
                  <el-form-item prop="numberMoney">
                    <el-input v-model="form.numberMoney" placeholder="请输入价格" style="width: 255px"
                      :disabled="!isOpear" />
                  </el-form-item>
                </div>

                <!-- 价格合计 -->
                <div class="vux-flexbox">
                  <span class="label">价格合计</span>
                  <el-form-item prop="sumPrice">
                    <el-input v-model="sumPrice" style="width: 255px" readonly :disabled="!isOpear" />
                    <div class="el-form-item__error">{{ sumMsg }}</div>
                  </el-form-item>
                </div>

                <!-- 备注 -->
                <div style="margin-top: 13px;" class="vux-flexbox">
                  <span class="label">核算备注</span>
                  <el-form-item prop="price_remark" style="width:calc(100% - 70px);">
                    <el-input size="mini" v-model="form.price_remark" type="textarea" :rows="9" :disabled="!isOpear" />
                  </el-form-item>
                </div>
                <!-- 核算end -->
              </div>
            </div>
          </div>
        </el-card>

        <!-- 系统结论 -->
        <el-card class="box-card jielun">
          <div slot="header" class="clearfix">
            <span>系统结论</span>
          </div>
          <div>
            <div>
              <h3 class="colorblue">{{ form.nowDate }}</h3>
              <p class="rowcls">
                <strong>派单</strong>
                <span class="colorblue">{{ form.pPoint }}</span>
                <span>个点位，</span>
                <span class="colorblue">{{ form.pDevice }}</span>
                <span>台相机；</span>
              </p>
              <p class="rowcls">
                <strong>完成修复</strong>
                <span class="colorblue">{{ form.finishPoint }}</span>
                <span>个点位，</span>
                <span class="colorblue">{{ form.finishDevice }}</span>
                <span>台相机；</span>
              </p>
              <p class="rowcls">
                <strong>移交运营商</strong>
                <el-form-item prop="movePoint">
                  <el-input v-model="form.movePoint" @blur="handlefinishBlur" :disabled="!isOpear"
                    class="underline-input" placeholder="请输入数字"></el-input>
                </el-form-item>
                <span>个点位,</span>
                <el-form-item prop="moveDevice" :rules="rules.movePoint">
                  <el-input v-model="form.moveDevice" @blur="handlefinishBlur" :disabled="!isOpear"
                    class="underline-input" placeholder="请输入数字"></el-input>
                </el-form-item>
                <span>台相机</span>
              </p>

              <el-form-item prop="remark" label="备注">
                <el-input size="mini" v-model="form.remark" type="textarea" :disabled="!isOpear" :rows="4" />
              </el-form-item>
              <el-form-item prop="remark" label="施工人员">
                <el-input size="mini" v-model="form.build_user" type="textarea" :disabled="!isOpear" :rows="4" />
              </el-form-item>
            </div>
          </div>
        </el-card>
      </div>
    </el-form>

    <!-- 图片预览 -->
    <viewer :images="previewImages" ref="viewer">
      <img v-for="(img, index) in previewImages" :src="img.filePath" :key="index" style="display: none;" />
    </viewer>

    <!-- 修复数量 -->
    <el-dialog append-to-body title="修复数量" :visible.sync="faultModel">
      <div class="faultbtns" v-if="isOpear && deviceList.length">
        <el-button size="mini" type="primary" @click="saveFault">确定</el-button>
      </div>

      <vxe-table size="small" max-height="350" :row-config="{ isHover: true }" ref="faultTable" :data="deviceList"
        border style="width: 100%" :header-row-style="{ height: '36px' }" :row-style="{ height: '36px' }"
        :cell-style="{ padding: '0px' }">
        <vxe-column type="seq" width="60" title="序号" align="center"></vxe-column>
        <vxe-column field="ip" title="IP" header-align="center"></vxe-column>
        <vxe-column field="fault_type" title="处理" align="center">
          <template v-slot="{ row }">
            <el-select size="mini" :disabled="!isOpear" v-model="row.status" placeholder="请选择">
              <el-option v-for="item in [{
                value: 0,
                label: '未修复'
              }, {
                value: 1,
                label: '修复'
              }, {
                value: 2,
                label: '挂起'
              }, {
                value: 3,
                label: '移交供应商'
              }]" :key="item.value" :label="item.label" :value="item.value">
              </el-option>
            </el-select>
          </template>
        </vxe-column>
        <vxe-column field="remark" title="备注" header-align="center">
          <template v-slot="{ row }">
            <el-input v-model="row.remark" :disabled="!isOpear" size="mini" />
          </template>
        </vxe-column>
      </vxe-table>
    </el-dialog>

    <!-- 点位编码 -->
    <el-drawer v-if="pointModel" title="点位建设详情" :visible.sync="pointModel" :append-to-body="true"
      custom-class="showInfo_wrap" size="90%" :destroy-on-close="true">
      <point-info :pointInfo="pointDetail" :project_id="pointDetail.project_id"
        :project_code="pointDetail.project_code"></point-info>
    </el-drawer>
  </div>
</template>
<script>
import pointInfo from './pointInfo'

import { parseTime } from '@/utils/tool'
import moment from 'moment'
import mixin from './mixin.js'
export default {
  name: 'disposeOrder',
  mixins: [mixin],
  props: {
    disposeFlag: {
      type: Boolean,
      default: false
    },
    currentData: {
      type: Object,
      require: true
    },
    isOpear: {
      type: Boolean,
      default: false
    },
    faultTypeList: {
      type: Array,
      default: () => []
    }
  },
  components: {
    pointInfo
  },
  data () {
    // 自定义校验规则
    const validateNumber = (rule, value, callback) => {
      if (!value) {
        callback()
      }
      // 正则表达式：支持正负数、小数点和最多两位小数
      const reg = /^-?\d+(\.\d{1,2})?$/
      if (reg.test(value)) {
        callback() // 校验通过
      } else {
        callback(new Error('请输入有效数（正负数，小数点最多两位）'))
      }
    }
    const validateRemark = (rule, value, callback) => {
      if (this.form.numberMoney > 0 && !value) {
        callback(new Error('请输入核算备注'))
      } else {
        callback() // 校验通过
      }
    }
    return {
      loading: false,
      detail: {},
      form: {
        tableData: [],
        estimate: '大工（350），数量：2人，大车（200），数量：2辆，合计：900元',
        selectedWorkers: [], // 人力选择 选中的
        workerQuantities: {}, // 人力数量
        selectedCars: [], // 车辆选择  选中的
        carQuantities: {}, // 车辆数量
        numberMoney: 0, // 调价
        price_remark: '', // 核算备注

        // 系统结论
        nowDate: moment().format('YYYY-MM-DD'),
        pPoint: 0, // 派单点位数
        pDevice: 0, // 派单相机数
        finishPoint: 0, // 完成修复点位数
        finishDevice: 0, // 完成修复相机数
        movePoint: 0, // 移交运营商点位数
        moveDevice: 0, // 移交运营相机数
        remark: '',
        build_user: '' // 施工人员
      },
      // 校验规则
      rules: {
        // selectedWorkers: [
        //   { required: true, message: '请选择人力', trigger: 'change' }
        // ],
        // selectedCars: [
        //   { required: true, message: '请选择车辆', trigger: 'change' },
        // ],
        numberMoney: [
          { validator: validateNumber, trigger: 'blur' } // 自定义校验规则
        ],
        price_remark: [
          { validator: validateRemark, trigger: 'blur' } // 自定义校验规则
        ],
        // remark: [
        //   { required: true, message: '请输入备注', trigger: 'blur' }
        // ],
        movePoint: [
          { required: true, message: '请输入数字', trigger: 'blur' },
          {
            pattern: /^(0|[1-9]\d*)$/,
            message: '请输入大于等于 0 的正整数',
            trigger: 'blur'
          }
        ]
        // handle_remark: [
        //   { required: true, message: '必填', trigger: 'blur' }
        // ]
      },
      sumMsg: '',
      // 预览的图片数组
      previewImages: [],
      // 复选框配置
      checkboxConfig: {
        checkField: 'checked', // 绑定选中状态的字段
        checkMethod: ({ row }) => {
          return row.status === 0 && this.isOpear
        }
      },
      faultModel: false,
      faultIndex: null,
      deviceList: [],
      pointModel: false,
      pointIndex: null,
      pointDetail: {}
    }
  },
  computed: {
    // 计算金额合计
    sumPrice () {
      const numberMoney = parseFloat(this.form.numberMoney) || 0
      const totalAmount = this.detail.price_first + numberMoney
      return totalAmount
    },
    carpersonPrice () {
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

      const totalAmount = workertotalAmount + cartotalAmount
      // const formattedTotal = totalAmount.toLocaleString('zh-CN', {
      //   style: 'currency',
      //   currency: 'CNY', // 人民币
      // });
      return totalAmount
    }
  },
  watch: {
    sumPrice: {
      handler (newVal) {
        if (newVal < 0) {
          this.sumMsg = '总金额不能小于0'
        } else {
          this.sumMsg = ''
        }
      },
      deep: true // 深度监听
    },
    'form.tableData': {
      handler (newVal) {
        // 系统结论: 完成修复
        const tempArr = newVal.filter(f => f.checked)
        // finishPoint：完成修复点位数
        // finishDevice：完成修复相机数
        // movePoint：移交运营商点位数
        // moveDevice：移交运营相机数
        this.form.finishPoint = tempArr.filter(f => f.handle_count > 0).length
        this.form.finishDevice = tempArr.reduce((sum, item) => sum + item.handle_count, 0)
      },
      deep: true // 深度监听
    }
  },
  mounted () {
    this.getList()
  },
  methods: {
    parseTime,
    moment,
    async getList () {
      this.loading = true
      const params = {
        order_id: this.currentData.id
      }
      const { data, code } = await this.$pub.post('/point/order/detail', params)
      this.loading = false
      if (code !== 200) {
        this.form.tableData = []
        return this.$message({
          message: '获取详情出错了',
          type: 'error',
          showClose: true
        })
      }
      // this.form.tableData = (data.list || []).map(m => {
      //   return {
      //     ...m,
      //     id: m.point_code + m.project_code + m.device_ip,
      //     images: [
      //       'http://220.202.55.18:201/images/w200/XCG-2021-024/20230608/XCG-2021-024_20230608093258_TqS0PMlp.webp',
      //       'http://220.202.55.18:201/images/w200/XCG-2021-024/20230608/XCG-2021-024_20230608092711_bkFEQt9w.webp',
      //     ]
      //   }
      // })
      this.detail = data
      this.form.tableData = (data.point_list || []).map(m => {
        return {
          ...m, checked: m.status !== 0
        }
      })

      const tiao = data.price_list_confirm.find(m => m.type === 3)
      this.form.numberMoney = tiao?.price// 调价

      /**
       *
       * 预估estimate
       * eg: this.form.estimate = '大工（350），数量：2人，大车（200），数量：2辆，合计：900元';
       */
      const type = { 1: '人', 2: '辆' }
      this.form.estimate = '';
      (data.price_list_first || []).forEach(m => {
        // if (m.type === 3) {//type为3是调价
        //   return; // 跳过本次迭代
        // }
        this.form.estimate += `${m.name}(${m.price})，数量：${m.count}${type[m.type]}，`
      })
      this.form.estimate += `合计：${data.price_first}元`

      /**
       * 核算回填
       */
      const workList = data.price_list_confirm.filter(m => m.type === 1)
      const carList = data.price_list_confirm.filter(m => m.type === 2)
      const workInfo = this.parseQuantities(workList)
      const carInfo = this.parseQuantities(carList)

      this.form.selectedWorkers = workInfo.keys// 人力选择 选中的键value
      this.form.workerQuantities = workInfo.Quantities // 人力数量 {value:count}
      this.form.selectedCars = carInfo.keys // 车辆选择  选中的
      this.form.carQuantities = carInfo.Quantities//  车辆数量

      this.form.price_remark = data.price_remark // 核算备注

      /**
       * 系统结论
       *  finishPoint：完成修复点位数
      *  finishDevice：完成修复相机数
      *  movePoint：移交运营商点位数
      *  moveDevice：移交运营相机数
       */
      this.form.build_user = data.build_user // 施工人员
      this.form.remark = data.remark // 系统结论备注
      this.form.pPoint = this.form.tableData.length// 移交运营商点位数和相机数
      this.form.pDevice = this.form.tableData.reduce((sum, item) => sum + item.count, 0)
      const tempnum = this.extractNumbersFromSubstring(data.sys_result)
      if (tempnum.length > 1) {
        this.form.movePoint = tempnum[0]
        this.form.moveDevice = tempnum[1]
      }
    },
    // 失去焦点时，自动填充 0
    handlefinishBlur () {
      if (this.form.moveDevice === '' || this.form.moveDevice === null) {
        this.form.moveDevice = 0
      }
      if (this.form.movePoint === '' || this.form.movePoint === null) {
        this.form.movePoint = 0
      }
    },
    extractNumbersFromSubstring (str) {
      // 找到 "移交运营商" 的起始位置
      const startIndex = str.indexOf('移交运营商')

      // 如果找到 "移交运营商"，则截取从该位置开始的子字符串
      if (startIndex !== -1) {
        const substring = str.slice(startIndex)

        // 使用正则表达式提取子字符串中的所有数字
        const numbers = substring.match(/\d+/g)

        // 如果匹配到数字，则返回数字数组，否则返回空数组
        return numbers ? numbers.map(Number) : []
      }

      // 如果未找到 "移交运营商"，返回空数组
      return []
    },
    handleRowDblClick ({ row }) {
      if (this.isOpear) {
        const table = this.$refs.xTable
        // 切换当前行的选中状态
        table.toggleCheckboxRow(row)
      }
    },
    // 点击处理记录按钮
    handlePreview (row) {
      if (row.photo_list && row.photo_list.length > 0) {
        this.previewImages = row.photo_list
        this.$nextTick(() => {
          this.$refs.viewer.$viewer.show()
        })
      } else {
        this.$message.warning('没有可预览的图片')
      }
    },
    async handleSubmit (name) {
      const selectedData = this.$refs.xTable.getCheckboxRecords() // 获取选中的数据
      this.$refs.formRef.validate(async (valid) => {
        if (this.sumPrice <= 0) {
          return
        }
        if (selectedData.length <= 0) {
          this.$message.error('没有选择点位')
          return
        }
        if (valid) {
          console.log('表单数据：', this.form)
          const workPrice = this.assignWorker(this.form.workerQuantities, this.workerList)
          const carPrice = this.assignWorker(this.form.carQuantities, this.carList)

          const tiao = { type: 3, count: 1, name: '调价', value: 0, price: Number(this.form.numberMoney) }

          const sys_result = `${this.form.nowDate} 派单${this.form.pPoint}个点位，${this.form.pDevice}台相机；完成修复 ${this.form.finishPoint}个点位，${this.form.finishDevice}台相机；移交运营商 ${this.form.movePoint}个点位，${this.form.moveDevice}台相机；`
          const tempobj = {
            id: this.currentData.id,
            project_code: this.currentData.project_code,
            price_remark: this.form.price_remark,
            point_list: selectedData,
            price_list_confirm: [...workPrice, ...carPrice, tiao],
            sys_result,
            remark: this.form.remark,
            build_user: this.form.build_user
          }
          let url = '/point/order/handle'
          if (name === 'temp') {
            url = '/point/order/handle-temp'
          }
          const { code, message } = await this.$pub.post(url, tempobj)
          if (code === 200) {
            this.$message.success('处理成功！')
            this.$emit('update:disposeFlag', false)
          } else {
            this.$notify.error({
              title: '处理失败',
              message: message
            })
          }
        } else {
          this.$message.error('请填写完整表单')
        }
      })
    },
    openFaultInfo (row, rowIndex) {
      this.faultModel = true
      this.faultIndex = rowIndex
      this.deviceList = row?.device_list || []
    },
    openPoint (row, rowIndex) {
      this.pointModel = true
      this.pointIndex = rowIndex
      this.pointDetail = row || {}
    },
    saveFault () {
      this.form.tableData[this.faultIndex].device_list = this.deviceList
      const over = this.deviceList.filter((item) => item.status === 1).length
      const operator = this.deviceList.filter((item) => item.status === 3).length
      this.form.tableData[this.faultIndex].handle_count = over
      this.form.tableData[this.faultIndex].move_count = operator

      this.form.tableData[this.faultIndex].checked = over > 0 || operator > 0

      this.form.movePoint = this.form.tableData.filter(f => f.move_count > 0).length
      this.form.moveDevice = this.form.tableData.reduce((total, item) => {
        return total + (item.device_list?.filter(d => d.status === 3).length || 0)
      }, 0)
      this.faultModel = false
    }
  }

}
</script>

<style lang="scss">
.disposeOrderBox {
  position: relative;

  .clearfix {
    font-size: 18px;
    font-weight: bold;
    display: flex;
    justify-content: space-between;
  }

  .topwrap {
    position: absolute;
    right: 20px;
    top: 18px;

    .btns {
      display: inline-block;
      margin-left: 10px;
    }

    .firm {
      vertical-align: middle;
      font-size: 18px;
      font-weight: bold;
    }
  }

  .box-card {
    margin-bottom: 20px;
  }

  .vux-flexbox {
    height: fit-content;
    margin-bottom: 13px;
    flex-wrap: wrap;
    align-items: stretch;

    /* 子级继承父级高度 */
    .feiyong {
      flex: 1;
    }

    .jielun {
      width: 360px;

      .rowcls {
        margin-top: 10px;

        .el-form-item {
          display: inline-block;
          width: 80px;

          .el-form-item__content {
            line-height: 24px;
          }
        }
      }

      .colorblue {
        color: #409EFF;
        margin: 0 2px;
        font-weight: 700;
        font-size: 16px;
      }

      /* 下划线样式 */
      .underline-input {
        border: none;
        /* 去掉默认边框 */
        border-bottom: 1px solid #409EFF;
        /* 添加下划线 */
        border-radius: 0;
        /* 去掉圆角 */
        padding: 0;
        /* 调整内边距 */
      }

      /* 去掉 input 的默认样式 */
      .underline-input .el-input__inner {
        border: none;
        box-shadow: none;
        padding: 0;
        height: 22px;
        line-height: 22px;
        text-align: center;
        color: #f40 !important;
        font-weight: 700;
        font-size: 16px;

        &::placeholder {
          font-size: 14px;
          color: #ccc;
          font-weight: 200;
        }
      }
    }

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

    .el-input.is-disabled .el-input__inner {
      color: #3f3939;
    }

    .el-textarea.is-disabled .el-textarea__inner {
      color: #3f3939;
    }

    .el-tag.el-tag--info {
      color: #3f3939;
    }

  }

  .vxe-cell {
    .el-input__inner {
      padding: 0 2px;
    }
  }

  .hesuanbox {
    align-items: flex-start;
    margin-top: 20px;
    display: flex;

    .flexwidth {
      flex: 1;
      margin-left: 10px;
      display: flex;
      flex-wrap: wrap;
    }

    .hesuanwrap {
      width: calc(50% - 4px);

      .vux-flexbox {
        align-items: center;
      }

      .xunhuanbox {
        display: flex;
        flex-wrap: wrap;
        flex: 1;

        .el-tag {
          padding: 0 0px 0 2px;
        }
      }
    }
  }

  .vxe-table .vxe-header--row {
    .vxe-cell {
      padding-left: 0;
      padding-right: 0;
    }
  }
}

.vxe-table--tooltip-wrapper {
  z-index: 9999999 !important;
}

.faultbtns {
  text-align: right;
}

.curp {
  cursor: pointer;
}

.blue {
  color: #409EFF;
}

.handle_remark {
  margin-bottom: 2px !important;
}
</style>
