<template>
  <div class="addSubUnitPrice disabled" v-loading="loading">
    <div class="el-drawer__header header">
      <span>{{ title }}</span>
      <div v-if="!lookSubInfo">
        <el-button type="primary" size="small" @click="mainSure">确定</el-button>
        <el-button size="small" @click="mainCancel">取消</el-button>
      </div>
      <div v-else>
        <el-button size="small" @click="mainCancel">返回</el-button>
      </div>
    </div>
    <el-card>
      <el-form ref="form" class="topwrap" :model="form" :rules="rules" label-width="80px" label-position="left"
        size="mini">
        <el-row :gutter="40">
          <el-col :span="24">
            <el-form-item prop="item_type" label="分项类别">
              <el-radio-group v-model="form.item_type" :disabled="lookSubInfo" @change="changeSubType">
                <el-radio :label="k.dict_value" v-for="k in subTypeList" :key="k.dict_value">
                  {{ k.dict_label }}
                </el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item prop="item_title" label="分项描述">
              <el-input v-model="form.item_title" placeholder="请输入分项描述" type="textarea"
                :disabled="lookSubInfo"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="24" v-if="form.item_type === 1">
            <el-form-item prop="proc_list" label="工序">
              <el-select v-model="form.proc_list" multiple collapse-tags filterable style="width: 100%" clearable
                :disabled="lookSubInfo">
                <el-option v-for="item in procs" :key="item.value" :label="item.label" :value="item.value">
                </el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <template v-if="(form.item_type === 1 && form.proc_list.length < 2) || form.item_type === 2">
            <el-col :span="24">
              <el-form-item prop="device_type" label="物料类型">
                <el-select v-model="form.device_type" placeholder="请选择物料类型" style="width: 100%"
                  @visible-change="PrechangeDeviceType" @change="changeDeviceType" :disabled="lookSubInfo">
                  <el-option v-for="item in device_typeList" :key="item.value" :label="item.label" :value="item.value">
                  </el-option>
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="24">
              <el-form-item prop="device_list" label="物料">
                <el-select v-model="form.device_list" placeholder="请先选择物料类型" multiple collapse-tags style="width:100%;"
                  :class="{ isShigong: form.item_type === 1 }" :disabled="lookSubInfo">
                  <el-option v-for="item in device_list" :key="item.device_id" :label="item.device_name"
                    :value="item.device_id">
                  </el-option>
                </el-select>
                <div class="el-input-group__append selfappend" v-if="form.item_type === 1">
                  <el-checkbox :disabled="lookSubInfo" v-model="form.is_ex_device">排除</el-checkbox>
                </div>
              </el-form-item>
            </el-col>
          </template>
          <el-col :span="12">
            <el-form-item prop="item_unit" label="单位" :class="{ 'is-required': !form.is_direction }">
              <el-select v-model="form.item_unit" placeholder="请选择" style="width:100%;"
                :class="{ isShigong: form.item_type === 1 }" :disabled="lookSubInfo">
                <el-option v-for="item in unitList" :key="item" :label="item" :value="item">
                </el-option>
              </el-select>
              <div class="el-input-group__append selfappend" style="margin-top: -1px;" v-if="form.item_type === 1">
                <el-checkbox :disabled="lookSubInfo" v-model="form.is_direction" @change="changeUnit">按方向</el-checkbox>
              </div>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item prop="item_nums" label="数量" :class="{ appendwrap: true, 'is-required': !form.audit_nums }"
              :disabled="lookSubInfo">
              <el-input v-model="form.item_nums">
                <el-checkbox :disabled="lookSubInfo" slot="append" v-model="form.audit_nums" @change="changeAudit"
                  v-if="form.item_type === 1">按审计数</el-checkbox>
              </el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item prop="item_price" label="单价" :disabled="lookSubInfo">
              <el-input v-model="form.item_price" v-thousands></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="金额">
              <el-input v-model="sumMoney" v-thousands :disabled="true"></el-input>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <!-- 分项明细 -->
      <div class="mainsubitem">
        <h4>
          分项明细
          <i class="el-icon-refresh-right" v-if="!lookSubInfo" title="清空分项明细列表" @click="handleReset"></i>
        </h4>
        <ul>
          <li v-if="!lookSubInfo">
            <div class="item add" @click="handleAdd">
              <i class="el-icon-plus"></i>新增分项明细
            </div>
          </li>
          <li v-for="item in subItemList" :key="item.id">
            <div class="item" v-if="!lookSubInfo">
              <template v-if="item.isedit">
                <i class="el-icon-finished" @click="handleFinsh(item)"></i>
                <el-input v-model="item.item_detail_title" size="small" />
              </template>
              <template v-else>
                <i class="el-icon-edit" @click="handleEdit(item)"></i>
                <span>{{ item.item_detail_title }}</span>
              </template>
              <i class="el-icon-delete" @click="handleDel(item)"></i>
            </div>
            <div v-else class="item">
              <span>{{ item.item_detail_title }}</span>
            </div>
          </li>
        </ul>
      </div>

    </el-card>
  </div>
</template>

<script>
import { checkNumber } from '@/utils/validate.js'
import { keepTwoDecimalFull } from '@/utils/tool.js'
import { uuid } from 'vue-uuid'
export default {
  name: 'addSubUnitPrice',
  inject: ['current', 'isLook'], // current主页的合同
  props: {
    title: {
      type: String,
      default: '新增合同分项单价'
    },
    selectedRow: { // 编辑或者查看下 是对应当前的选择行传递过来的信息selectedRow
      type: Object,
      default: null
    },
    lookSubInfo: { // 是否是合同单价的查看
      type: Boolean,
      default: false
    },
    operateFlag: {
      type: Boolean,
      default: false
    }
  },
  data () {
    const checkUnit = (rule, value, callback) => {
      if (!this.form.is_direction && !value) {
        callback(new Error('请选择单位'))
      } else {
        callback()
      }
    }
    const checkshu = (rule, value, callback) => {
      if (!this.form.audit_nums && !value) {
        callback(new Error('请输入数量'))
      } else {
        callback()
      }
    }
    return {
      loading: false,
      form: {
        item_type: 1,
        item_title: '',
        proc_list: [],
        device_type: null,
        device_list: [], // 物料列表
        is_ex_device: false, // 物料排除 联调时不选传0 选择传1
        item_unit: null,
        is_direction: false, // 单位按方向 联调时不选传0 选择传1
        item_nums: null,
        audit_nums: false, // 按审计数,联调时不选传0 选择传1
        item_price: ''
      },
      rules: {
        item_type: [
          { required: true, message: '请选择分项类别', trigger: 'change' }
        ],
        item_title: [
          { required: true, message: '请填报分项描述', trigger: 'blur' }
        ],
        proc_list: [
          { required: true, message: '请选择工序', trigger: 'change' }
        ],
        item_unit: [
          { validator: checkUnit, trigger: 'change' }
        ],
        item_nums: [ // 数量
          { validator: checkshu, trigger: 'blur' },
          { validator: checkNumber, trigger: 'blur' }
        ],
        item_price: [ // 单价
          { required: true, message: '请输入大于0的正整数', trigger: 'blur' },
          { validator: checkNumber, trigger: 'blur' }
        ],
        money: [ // 金额
          { required: true, message: '请输入大于0的正整数', trigger: 'blur' },
          { validator: checkNumber, trigger: 'blur' }
        ]
      },
      subTypeList: [], // 分项类型list
      procs: [], // 工序list
      device_typeList: [],
      device_list: [],
      unitList: [],
      subItemList: [], // 分项明细
      cloneFormDevice_type: null // 切换物料类型前把前一次的保存下来
    }
  },
  computed: {
    sumMoney () {
      const sum = this.form.item_price * this.form.item_nums
      return keepTwoDecimalFull(sum)
    }
  },
  mounted () {
    this.init()
  },
  methods: {
    init () {
      this.getInfo()
      this.getDictData()
      this.getProcList()
      this.getDevice_type()
      this.getUnitList()
    },
    // 获取详情
    async getInfo () {
      if (this.selectedRow) {
        const { data, code, message } = await this.$pub.post('contract/price/detail', { item_id: this.selectedRow.id })
        if (code === 200) {
          const { item_type, item_title, child_list, proc_list, device_list, item_unit, item_nums, item_price, is_ex_device, is_direction, audit_nums } = data
          let device_type = null
          if (device_list.length > 0) {
            device_type = device_list[0].device_type
            this.form.device_type = device_type
            this.getDeviceList()
          }
          this.form = {
            item_type,
            item_title,
            item_unit,
            item_nums,
            item_price,
            device_type,
            proc_list: proc_list.map(m => m.proc_code),
            device_list: device_list.map(m => m.device_id), // 物料列表
            is_ex_device: is_ex_device === 1, // 物料排除 联调时不选传0 选择传1
            is_direction: is_direction === 1, // 单位按方向 联调时不选传0 选择传1
            audit_nums: audit_nums === 1 // 按审计数,联调时不选传0 选择传1
          }
          this.subItemList = (child_list || []).map(m => {
            return {
              ...m, isedit: false
            }
          })
        } else {
          this.$notify.error({
            title: '查询失败',
            message: message
          })
        }
      }
    },
    // 获取分项类型
    async getDictData () {
      const { data, code, message } = await this.$pub.post('/sys/dict/list-slt', { dict_label: 'price_item_type' })
      if (code === 200) {
        this.subTypeList = (data || []).map(m => {
          return {
            dict_value: Number(m.value),
            dict_label: m.label
          }
        })
      } else {
        this.$notify.error({
          title: '查询失败',
          message: message
        })
      }
    },
    // 获取物料类型
    getDevice_type () {
      this.$dict(this, 'device_type').then(res => {
        if (res.code === 200) {
          this.device_typeList = (res.data || []).map(m => {
            return {
              value: Number(m.value),
              label: m.label
            }
          })
        } else {
          this.$message({
            type: 'error',
            message: '字典获取出错了device_type',
            showClose: true
          })
          this.device_typeList = []
        }
      })
    },
    // 获取物料
    async getDeviceList () {
      try {
        const params = {
          device_type: this.form.device_type,
          project_code: this.current.project_code
        }
        const { data, code, message } = await this.$pub.post('contract/price/device-list', params)
        if (code === 200) {
          this.device_list = data || []
        } else {
          this.$notify.error({
            title: '查询失败',
            message: message
          })
          this.device_list = []
        }
      } catch (err) {
        this.$notify.error({
          title: '服务器请求失败',
          message: err.message
        })
      }
    },
    // 获取工序
    async getProcList () {
      if (this.current.project_code === null) {
        return
      }
      try {
        this.loading = true
        const params = {
          project_code: this.current.project_code,
          point_code: ''
        }
        const { code, data, message } = await this.$pub.post('/point/proc/list-design', params)
        this.loading = false
        if (code === 200) {
          var tmparr = [];
          (data || []).map((item, index) => {
            // var childs = []
            // childs = this.getprocChildList(item)
            var tmpobj = {
              value: item.classCode,
              label: item.className
              // children: childs
            }
            tmparr.push(tmpobj)
          })
          this.procs = tmparr
        } else {
          this.$notify.error({
            title: '查询失败',
            message: message
          })
        }
      } catch (e) {
        this.$notify.error({
          title: '服务器请求失败',
          message: e.message
        })
      }
    },
    getprocChildList (value, flag) {
      var childs = []
      // 添加具体工序
      if (value.procList !== null && value.procList !== undefined) {
        value.procList.map((citem) => {
          childs.push({ value: citem.procCode, label: citem.procName })
        })
      }
      return childs
    },
    // 获取单位
    async getUnitList () {
      const { data, code, message } = await this.$pub.post('/device/unit')
      if (code !== 200) {
        return this.$message({
          type: 'error',
          message: message || '获取单位列表出错了',
          showClose: true
        })
      }
      this.unitList = data.unit ? data.unit : []
    },
    // 分项列别选中自定义时，（单位默认为：项）
    changeSubType () {
      if (this.form.item_type === 3) {
        this.form.item_unit = '项'
      }
    },
    // 选择物料类型之前，保存当前物料类型
    async PrechangeDeviceType () {
      if (this.form.device_type && this.subItemList.length > 0) {
        this.cloneFormDevice_type = this.form.device_type
      }
    },
    // 物料类型发生改变 ： 重置分项明细，自动获取分项明细清单和获取物料
    async changeDeviceType () {
      //  获取物料列表
      this.device_list = []
      this.form.device_list = []
      this.getDeviceList()
      this.loading = true
      // 自动获取分项明细清单
      const { data, code, message } = await this.$pub.post('contract/item/detail/template/list', { device_type: this.form.device_type })
      if (code !== 200) {
        return this.$message({
          type: 'error',
          message: message || '获取分项明细列表出错了',
          showClose: true
        })
      }
      const list = (data || []).map(m => {
        return {
          ...m, isedit: false
        }
      })
      this.loading = false
      if (list.length > 0 && this.subItemList.length > 0) {
        // if (this.cloneFormDevice_type) {
        //   this.$confirm('当前选中的物料类型下有分项明细模板，需要重置页面上分项明细？', '提示', {
        //     confirmButtonText: '确定',
        //     cancelButtonText: '取消',
        //     type: 'warning'
        //   }).then(() => {
        //     this.subItemList = list
        //   }).catch(() => {
        //     this.$message({
        //       type: 'info',
        //       message: '已取消切换物料类型',
        //       showClose: true
        //     })
        //     // this.form.device_type = this.cloneFormDevice_type
        //   })
        // } else {
        //   this.subItemList = list
        // }
        this.$confirm('当前选中的物料类型下有分项明细模板，需要重置页面上分项明细？', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          this.subItemList = list
        }).catch(() => {
          this.$message({
            type: 'info',
            message: '已取消切换物料类型',
            showClose: true
          })
        })
      } else if (list.length > 0) {
        this.subItemList = list
      }
    },
    //  物料发生改变，回填单位
    changeDevice () {
      if (this.form.device_list.length > 0) {
      }
    },
    //  勾选按审计数量时，数量清空
    changeAudit () {
      if (this.form.audit_nums) {
        this.form.item_nums = ''
        this.$refs.form.validateField(['item_nums'])
      }
    },
    //  勾选按方向时，单位清空
    changeUnit () {
      if (this.form.is_direction) {
        this.form.item_unit = ''
        this.$refs.form.validateField(['item_unit'])
      }
    },
    // 分项明细列表 -start
    handleAdd () {
      const obj = {
        id: uuid.v1(),
        item_detail_title: '',
        isedit: true
      }
      this.subItemList.unshift(obj)
    },
    handleEdit (row) {
      row.isedit = true
    },
    handleFinsh (row) {
      if (row.item_detail_title) {
        row.isedit = false
      } else {
        this.$message({
          type: 'error',
          message: '不能为空',
          showClose: true
        })
      }
    },
    handleReset () {
      this.$confirm('是否确认清空分项明细列表', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {
        this.subItemList = []
      }).catch(() => {
        this.$message({
          type: 'success',
          message: '已取消清空分项明细列表',
          showClose: true
        })
      })
    },
    handleDel (row) {
      const id = row.id
      this.$confirm('是否确认删除', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {
        const _index = this.subItemList.findIndex(f => f.id === id)
        this.subItemList.splice(_index, 1)
      }).catch(function () {
        this.$message({
          type: 'success',
          message: '已取消删除',
          showClose: true
        })
      })
    },
    // 分项明细列表 -end
    mainCancel () {
      this.$emit('cancleFn')
    },
    mainSure () {
      this.$refs.form.validate(async valid => {
        if (valid) {
          let isok = true
          this.subItemList.some(s => {
            if (s.isedit) {
              this.$message({
                type: 'info',
                message: '存在未保存的分项明细，请先确认当前分项明细，并保存',
                showClose: true
              })
              isok = false
              return true
            }
          })
          if (isok) {
            const { item_type, item_title, item_nums, item_price, item_unit, audit_nums, is_direction, is_ex_device } = this.form
            const params = {
              id: this.selectedRow ? this.selectedRow.id : null,
              contract_id: this.current.id, // 合同主键
              item_type, // 单价类型 1施工 2材料 3自定义
              item_title, // 分项描述
              item_nums: Number(item_nums), // 数量
              item_price: Number(item_price), // 单价
              item_unit, // 单位
              audit_nums: audit_nums ? 1 : 0, // 按审计数 不选传0 选择传1
              is_direction: is_direction ? 1 : 0, // 按方向 0不按 1按
              is_ex_device: is_ex_device ? 1 : 0, // 排除 0不排除 1排除
              child_list: this.subItemList.map(m => {
                return {
                  item_detail_title: m.item_detail_title
                }
              })
              // 物料类型要注意，除了施工状态下，其他两个不传给后端
            }
            const proc_list = this.form.proc_list.map(m => {
              return {
                proc_code: m
              }
            })
            const device_list = this.form.device_list.map(m => {
              return {
                device_id: m,
                device_type: this.form.device_type
              }
            })

            let obj = {}
            if (this.form.item_type === 1 && this.form.proc_list.length < 2) {
              obj = { ...params, proc_list, device_list }
            } else if (this.form.item_type === 1) {
              obj = { ...params, proc_list }
            } else if (this.form.item_type === 2) {
              obj = { ...params, device_list }
            } else {
              obj = { ...params }
            }
            console.log(params)
            this.loading = true
            const url = this.selectedRow ? 'contract/price/edit' : 'contract/price/add'
            const { code, message } = await this.$pub.post(url, obj)
            this.loading = false
            if (code !== 200) {
              this.$message({
                message: message || '确认失败',
                type: 'info',
                showClose: true,
                customClass: 'uploadMessage'
              })
            } else {
              this.$message({
                message: '确认成功',
                type: 'success',
                showClose: true,
                customClass: 'uploadMessage'
              })
              this.mainCancel()
            }
          }
        }
      })
    }
  }
}
</script>

<style lang="scss">
.contrac_drawer {
  .el-drawer__header {
    margin-bottom: 20px;
  }

  .addSubUnitPrice {
    padding: 0 20px;
    box-sizing: border-box;
    height: 100%;

    .el-card {
      height: calc(100% - 74px);
      overflow: auto;
    }

    .el-input__inner,
    .el-textarea__inner {
      background-color: #fafbfc;
      width: 100%;
      border-radius: 3px;
      border: 2px solid #dfe1e6;
    }

    .el-form-item__label {
      color: #172b4d;
      text-align: right;
    }

    .el-input-group__append {
      line-height: 22px;
      border: 2px solid #dfe1e6;
      border-left: 0;
    }

    .appendwrap .el-form-item__content {
      line-height: 29px;
    }

    .selfappend {
      display: inline-block;
      width: 78px;
      line-height: 24px;
    }

    .isShigong {
      width: calc(100% - 120px) !important;
    }
  }
}
</style>
