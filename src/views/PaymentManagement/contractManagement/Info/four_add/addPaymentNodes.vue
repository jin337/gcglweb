<template>
  <div class="addPaymentNodes disabled" v-loading="loading">
    <div class="el-drawer__header header">
      <span>{{ title }}</span>
      <div v-if="!lookPayNodeInfo">
        <el-button type="primary" size="small" @click="handleSure">确定</el-button>
        <el-button size="small" @click="handleCancel">取消</el-button>
      </div>
      <div v-else>
        <el-button size="small" @click="handleCancel">返回</el-button>
      </div>
    </div>
    <el-card>
      <el-form ref="form" class="topwrap" :model="form" :rules="rules" label-width="80px" label-position="left"
        size="mini">
        <el-row :gutter="40">
          <el-col :span="24">
            <el-form-item prop="node_title" label="付款节点">
              <el-input v-model="form.node_title" placeholder="请输入付款节点" :disabled="lookPayNodeInfo"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item prop="node_remark" label="付款说明">
              <el-input v-model="form.node_remark" placeholder="请输入付款说明" type="textarea"
                :disabled="lookPayNodeInfo"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item prop="payment_type" label="款项分类">
              <el-radio-group v-model="form.payment_type" :disabled="lookPayNodeInfo" @change="changePayType">
                <el-radio :label="k.dict_value" v-for="k in paymentTypeList" :key="k.dict_value">
                  {{ k.dict_label }}
                </el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
          <el-col :span="24" class="rowwrap" v-if="form.payment_type !== 1">
            <el-form-item prop="proc_code" label="付款条件">
              <div class="row">
                <el-checkbox v-model="form.is_point_ok" :disabled="lookPayNodeInfo">点位完成</el-checkbox>
                <el-radio-group v-model="form.pointAllOrNumber" :disabled="lookPayNodeInfo" v-if="form.is_point_ok">
                  <el-radio :label="0">所有点位完成</el-radio>
                  <el-radio :label="1">
                    每<el-input-number v-model="form.point_count" style="width:140px;" :min="1" controls-position="right"
                      :disabled="lookPayNodeInfo" @change="form.pointAllOrNumber = 1" />点位
                  </el-radio>
                </el-radio-group>
              </div>
              <div class="row">
                <el-checkbox v-model="form.is_proc_ok" :disabled="lookPayNodeInfo"
                  @change="fukuanValidator">工序完成</el-checkbox>
                <el-select v-model="form.proc_list" multiple collapse-tags filterable clearable
                  :disabled="lookPayNodeInfo" style="width:255px;" v-if="form.is_proc_ok" placeholder="至少选择一道工序"
                  @change="fukuanValidator">
                  <el-option v-for="item in procList" :disabled="selectProAll.includes(item.proc_code)"
                    :key="item.proc_code" :label="item.proc_name" :value="item.proc_code">
                  </el-option>
                </el-select>
                <span class="el-form-item__error">{{ errorMsgFukuan }}</span>
              </div>
              <div class="row">
                <el-checkbox v-model="form.is_device_ok" :disabled="lookPayNodeInfo">物料完成</el-checkbox>
                <el-select v-model="form.device_list" multiple collapse-tags filterable clearable
                  :disabled="lookPayNodeInfo" style="width:255px;" v-if="form.is_device_ok" placeholder="支持单个/多个/不选">
                  <el-option v-for="item in device_typeList" :key="item.device_type" :label="item.device_type_name"
                    :value="item.device_type">
                  </el-option>
                </el-select>
                <span class="_left" v-if="form.is_device_ok">
                  每次累计<el-input-number v-model="form.device_count" style="width:140px;" :disabled="lookPayNodeInfo"
                    :min="1" controls-position="right" />台可付款
                </span>
              </div>
              <div class="row">
                <el-checkbox v-model="form.gongqiCheck" :disabled="lookPayNodeInfo">工期</el-checkbox>
                <span class="_left" v-if="form.gongqiCheck">
                  合同期第<el-input-number v-model="form.build_days" style="width:140px;" :disabled="lookPayNodeInfo" :min="1"
                    controls-position="right" />天
                </span>
              </div>
              <div class="row">
                <el-checkbox v-model="form.is_check_accept" :disabled="lookPayNodeInfo">初验报告</el-checkbox>
              </div>
              <div class="row bottom_border">
                <el-checkbox v-model="form.is_build_accept" :disabled="lookPayNodeInfo">建设方验收合格</el-checkbox>
              </div>
            </el-form-item>
          </el-col>
          <el-col :span="24" class="rowwrap zhifuwrap" v-if="form.payment_type !== 3">
            <el-form-item prop="hetongbili" label="支付比例">
              <el-radio-group v-model="form.pay_ratio_type" :disabled="lookPayNodeInfo"
                class="row bottom_border radiowrap" @input="changeBiliType">
                <el-radio :label="zhifuType.contract">
                  <span>合同款</span>
                  <el-input v-if="form.pay_ratio_type === zhifuType.contract" class="inpleft" v-model="form.hetongbili"
                    :disabled="lookPayNodeInfo" style="width:140px;" @blur="checkhetongbili">
                    <template slot="append">%</template>
                  </el-input>
                </el-radio>
                <el-radio :label="zhifuType.proc">
                  <span>工序款</span>
                  <el-input v-if="form.pay_ratio_type === zhifuType.proc" class="inpleft" v-model="form.gongxubili"
                    :disabled="lookPayNodeInfo" style="width:140px;" @blur="checkhetongbili">
                    <template slot="append">%</template>
                  </el-input>
                  <template v-if="form.pay_ratio_type === zhifuType.proc">
                    <el-checkbox class="inpleft" v-model="form.is_pre_proc"
                      :disabled="lookPayNodeInfo">包含前置工序</el-checkbox>
                  </template>
                </el-radio>
              </el-radio-group>
              <span class="el-form-item__error">{{ errorMsgpay_ratio }}</span>
              <el-card class="peizhipro" v-if="form.pay_ratio_type === zhifuType.proc && form.is_pre_proc">
                <div v-if="form.is_pre_proc && !lookPayNodeInfo" class="row bottom_border">
                  <span class="text">前置工序配置</span>
                  <el-select class="item" v-model="addQianProc" multiple collapse-tags sizs="mini" clearable
                    style="width:calc(100% - 160px)" placeholder="请配置前置工序" value-key="proc_code">
                    <el-option v-for="p in procList" :disabled="selectProAll.includes(p.proc_code)" :key="p.proc_code"
                      :label="p.proc_name" :value="p">
                    </el-option>
                  </el-select>
                  <span class="text right_border primar">
                    <i class="el-icon-finished" @click="handleFinsh">确定</i>
                  </span>
                </div>
                <div v-if="selectEdProList.length > 0 && form.is_pre_proc">
                  <h4 style="margin-top:15px;">已配置工序</h4>
                  <ul class="peizhiproitem">
                    <li v-for="(item, i) in selectEdProList" :key="item.proc_code">
                      <div class="item">
                        <span>{{ item.proc_name }}</span>
                        <i class="el-icon-delete" @click="handleBenDiDel(i)"></i>
                      </div>
                    </li>
                  </ul>
                </div>
                <div v-else>
                  <el-empty description="暂无前置工序配置" :image-size="80"></el-empty>
                </div>
              </el-card>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
    </el-card>
  </div>
</template>

<script>
export default {
  name: 'addPaymentNodes',
  inject: ['current'],
  props: {
    title: {
      type: String,
      default: '新增合同分项单价'
    },
    selectedRow: { // 编辑或者查看下 是对应当前的选择行传递过来的信息selectedRow
      type: Object,
      default: null
    },
    lookPayNodeInfo: { // 是否是付款节点的查看
      type: Boolean,
      default: false
    },
    operateFlag: {
      type: Boolean,
      default: false
    }
  },
  computed: {
    selectProAll () {
      const proc1 = this.form.proc_list
      const proc2 = this.selectEdProList.map(m => m.proc_code)
      return proc1.concat(proc2)
    }
  },
  data () {
    return {
      loading: false,
      form: {
        node_title: '',
        node_remark: '',
        payment_type: 1,
        is_point_ok: false, // 付款条件-点位完成
        pointAllOrNumber: 0, // 付款条件-点位完成-所有或者按点位数(0 or 1)
        point_count: 1, // 付款条件-点位完成-点位数
        is_proc_ok: false, // 付款条件-工序完成
        proc_list: [], // 付款条件-工序完成-所选工序
        is_device_ok: false, // 付款条件-物料完成
        device_list: [], // 付款条件-物料完成-所选物料类型
        device_count: 0, // 付款条件-物料完成-累计台数可付款
        gongqiCheck: false, // 付款条件-工期
        build_days: 1, // 付款条件-工期天数
        is_check_accept: false, // 付款条件-初验报告
        is_build_accept: false, // 付款条件-建设方验收合格
        pay_ratio_type: 1, // 支付比例-（合同款 or 工序款 1 or 2）zhifuType
        hetongbili: 0, // 支付比例-合同款比例  交互时赋值给pay_ratio
        gongxubili: 0, // 支付比例-工序款比例  交互时赋值给pay_ratio
        is_pre_proc: false // 支付比例-是否包含前置工序
      },
      rules: {
        node_title: [
          { required: true, message: '请输入付款节点', trigger: 'blur' }
        ],
        node_remark: [
          { required: true, message: '请输入付款说明', trigger: 'blur' }
        ],
        payment_type: [
          { required: true, message: '请选择款项分类', trigger: 'blur' }
        ]
      },
      zhifuType: {
        contract: 1,
        proc: 2
      },
      paymentTypeList: [], // 款项分类
      procList: [], // 工序列表
      device_typeList: [], // 物料类型
      errorMsgFukuan: '', // 付款条件检验的提示信息
      errorMsgpay_ratio: '', // 支付比例检验的提示信息
      selectEdProList: [], // 已配置工序列  交互赋值给pre_proc_list
      addQianProc: [] // 配置功序列
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
    },
    // 获取详情 回填
    async getInfo () {
      if (this.selectedRow) {
        const { data, code, message } = await this.$pub.post('contract/price/node/detail', { id: this.selectedRow.id })
        if (code === 200) {
          const { node_title, node_remark, payment_type, is_point_ok, point_count, is_proc_ok, proc_list, is_device_ok, device_list, device_count, build_days, is_build_accept, is_check_accept, pay_ratio, pay_ratio_type, is_pre_proc, pre_proc_list } = data
          this.form = {
            node_title,
            node_remark,
            payment_type,
            is_point_ok: is_point_ok === 1, // 付款条件-点位完成
            pointAllOrNumber: point_count === 0 ? 0 : 1, // 付款条件-点位完成-所有或者按点位数(0 or 1)
            point_count, // 付款条件-点位完成-点位数
            is_proc_ok: is_proc_ok === 1, // 付款条件-工序完成
            proc_list: proc_list.map(m => m.proc_code), // 付款条件-工序完成-所选工序
            is_device_ok: is_device_ok === 1, // 付款条件-物料完成
            device_list: device_list.map(m => m.device_type), // 付款条件-物料完成-所选物料类型
            device_count, // 付款条件-物料完成-累计台数可付款
            gongqiCheck: build_days > 0, // 付款条件-工期
            build_days, // 付款条件-工期天数
            is_check_accept: is_check_accept === 1, // 付款条件-初验报告
            is_build_accept: is_build_accept === 1, // 付款条件-建设方验收合格
            pay_ratio_type, // 支付比例-（合同款 or 工序款 1 or 2）zhifuType
            hetongbili: pay_ratio_type === this.zhifuType.contract ? pay_ratio : 0, // 支付比例-合同款比例  交互时赋值给pay_ratio
            gongxubili: pay_ratio_type === this.zhifuType.proc ? pay_ratio : 0, // 支付比例-工序款比例  交互时赋值给pay_ratio
            is_pre_proc: is_pre_proc === 1 // 支付比例-是否包含前置工序
          }
          this.selectEdProList = (pre_proc_list || []).map(m => {
            return { proc_code: m.proc_code, proc_name: m.proc_name }
          })
        } else {
          this.$notify.error({
            title: '查询失败',
            message: message
          })
        }
      }
    },
    // 获取字典款项分类
    async getDictData () {
      const { data, code, message } = await this.$pub.post('/sys/dict/list-slt', { dict_label: 'contract_payment_type' })
      if (code === 200) {
        this.paymentTypeList = (data || []).map(m => {
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
    // 获取工序列表 new接口
    async getProcList () {
      try {
        this.loading = true
        const params = {
          contract_id: this.current.id
        }
        const { code, data, message } = await this.$pub.post('contract/price/node/proc-list', params)
        this.loading = false
        if (code === 200) {
          this.procList = data || []
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
    // 获取物料类型 new接口
    async getDevice_type () {
      try {
        this.loading = true
        const params = {
          contract_id: this.current.id
        }
        const { code, data, message } = await this.$pub.post('contract/price/node/device-type-list', params)
        this.loading = false
        if (code === 200) {
          this.device_typeList = (data || []).map(m => {
            return { device_type: Number(m.device_type), device_type_name: m.device_type_name }
          })
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
    // 切换付款类别时，3尾款没有支付比例，1预付款没有付款条件，2进度款有付款条件和支付比例
    changePayType () {
      if (this.form.payment_type === 1) {
        this.form.proc_list = []
      } else if (this.form.payment_type === 3) {
        this.selectEdProList = []
        this.addQianProc = []
      }
    },
    // 校验付款条件
    fukuanValidator () {
      if (this.form.is_proc_ok && this.form.proc_list.length < 1) {
        this.errorMsgFukuan = '付款条件提示：请选择至少选择一道工序'
      } else {
        this.errorMsgFukuan = ''
      }
      if (this.addQianProc.length > 0) {
        this.addQianProc = []
      }
      if (!this.form.is_proc_ok) {
        this.form.proc_list = []
      }
    },
    // 校验支付比例
    checkhetongbili () {
      const reg = /^\d+[.]?\d{0,2}$/
      if (this.form.pay_ratio_type === this.zhifuType.proc) { // 工序款比例
        if (!reg.test(this.form.gongxubili) && this.form.gongxubili) {
          this.errorMsgpay_ratio = '支付比例提示：请输入正整数或小数保留两位小数'
        } else {
          this.errorMsgpay_ratio = ''
        }
      } else { // 合同款比例
        if (!reg.test(this.form.hetongbili) && this.form.hetongbili) {
          this.errorMsgpay_ratio = '支付比例提示：请输入正整数或小数保留两位小数'
        } else {
          this.errorMsgpay_ratio = ''
        }
      }
    },
    // 合同款和工序款比列选项发生变化
    changeBiliType (val) {
      if (val === this.zhifuType.proc && this.errorMsgpay_ratio !== '') { // 工序款比例
        this.errorMsgpay_ratio = ''
        this.form.hetongbili = 0
      } else if (val === this.zhifuType.contract && this.errorMsgpay_ratio !== '') { // 合同款比例
        this.errorMsgpay_ratio = ''
        this.form.gongxubili = 0
      }
      this.selectEdProList = []
      this.addQianProc = []
    },
    // 前置工序配置 start
    // 本地删除
    handleBenDiDel (index) {
      this.$confirm('是否确认删除', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {
        this.selectEdProList.splice(index, 1)
      }).catch(() => {
        this.$message({
          type: 'success',
          message: '已取消删除',
          showClose: true
        })
      })
    },
    // 确定配置前置工序
    async handleFinsh () {
      if (this.addQianProc.length > 0) {
        this.selectEdProList = [...this.addQianProc, ...this.selectEdProList]
        this.addQianProc = []
      } else {
        this.$message({
          type: 'info',
          message: '未选择工序',
          showClose: true
        })
      }
    },
    handleCancel () {
      this.$emit('cancleFn')
    },
    handleSure () {
      this.fukuanValidator()
      this.checkhetongbili()
      this.$refs.form.validate(async valid => {
        if (valid) {
          if (this.errorMsgFukuan !== '') {
            return this.$notify.error({
              title: '勾选工序完成的情况下',
              message: '至少选择一道工序'
            })
          }
          if (this.errorMsgpay_ratio !== '') {
            this.$notify.error({
              title: '支付比例',
              message: '请输入正整数或小数保留两位小数'
            })
          }
          const params1 = {
            id: this.selectedRow ? this.selectedRow.id : null,
            contract_id: this.current.id,
            payment_type: this.form.payment_type,
            node_title: this.form.node_title,
            node_remark: this.form.node_remark
          }
          // 付款条件
          const params2 = {
            is_proc_ok: this.form.is_proc_ok ? 1 : 0, // 是否工序完成
            is_device_ok: this.form.is_device_ok ? 1 : 0, // 是否物料完成
            device_count: this.form.device_count,
            is_point_ok: this.form.is_point_ok ? 1 : 0, // 是否点位完成
            point_count: this.form.pointAllOrNumber === 0 ? 0 : this.form.point_count,
            build_days: this.form.gongqiCheck ? this.form.build_days : 0,
            is_check_accept: this.form.is_check_accept ? 1 : 0, // 是否需要初验报告0否1是
            is_build_accept: this.form.is_build_accept ? 1 : 0, // 是否需要建设方验收报告0否1是
            device_list: this.form.device_list.map(m => {
              return { device_type: m }
            }),
            proc_list: this.form.proc_list.map(m => {
              return { proc_code: m }
            })
          }
          // 支付比例
          const params3 = {
            pay_ratio: this.form.pay_ratio_type === this.zhifuType.contract ? Number(this.form.hetongbili) : Number(this.form.gongxubili),
            pay_ratio_type: this.form.pay_ratio_type,
            is_pre_proc: this.form.is_pre_proc ? 1 : 0, // 是否前置工序
            pre_proc_list: this.selectEdProList.map(m => {
              return { proc_code: m.proc_code, proc_name: m.proc_name }
            })
          }
          let params = {}
          if (this.form.payment_type === 1) {
            params = { ...params1, ...params3 }
          } else if (this.form.payment_type === 2) {
            params = { ...params1, ...params2, ...params3 }
          } else {
            params = { ...params1, ...params2 }
          }
          const url = this.selectedRow ? 'contract/price/node/edit' : 'contract/price/node/add'
          console.log(params)
          this.loading = true
          const { code, message } = await this.$pub.post(url, params)
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
            this.handleCancel()
          }
        }
      })
    }
  }
}
</script>

<style lang="scss">
.addPaymentNodes {
  padding: 0 20px;
  box-sizing: border-box;
  height: 100%;

  .el-card {
    height: calc(100% - 100px);
    overflow: auto;

    .rowwrap {
      .row {
        color: #909399;
        background: #fafafa;
        border: 1px solid #EBEEF5;
        padding: 8px 10px;
        border-bottom: 0;
        height: 29px;

        .el-radio-group {
          margin-left: 20px;
        }

        ._left1 {
          margin: 0 4px;
        }

        .el-select {
          margin: 0 18px;
        }

        ._left {
          margin: 0 42px;
        }

        .el-input-number {
          margin: 0 2px;
        }
      }

      .bottom_border {
        border-bottom: 1px solid #EBEEF5;
      }

      .radiowrap {
        display: block;

        .el-radio {
          height: 28px;
          display: inline-block;
          line-height: 28px;
        }
      }

      .inpleft {
        margin-left: 10px;
      }
    }

    .zhifuwrap {
      .el-form-item__label {
        line-height: 47px;
      }

      .peizhipro {
        margin-top: 20px;

        .el-empty {
          padding: 0;
        }

        .row {
          display: flex;
          align-items: center;

          .el-select {
            margin: 0;

          }
        }

        .text {
          display: inline-block;
          line-height: 1;
          white-space: nowrap;
          background: #FFF;
          border: 1px solid #DCDFE6;
          color: #606266;
          text-align: center;
          border-right: 0;
          box-sizing: border-box;
          outline: 0;
          margin: 0;
          transition: .1s;
          font-weight: 500;
          padding: 6px 12px;
        }

        .primar {
          color: #fff;
          background-color: #0052cc;

        }

        .right_border {
          border-left: 0;
          border-right: 1px solid #DCDFE6;
        }

        .el-icon-finished {
          cursor: pointer;
        }

        .peizhiproitem {
          .item {
            width: 100%;
            padding: 10px 20px;
            box-sizing: border-box;
            box-shadow: 0 1px 1px rgba(9, 30, 66, .25), 0 0 1px rgba(9, 30, 66, .31);
            border-radius: 3px;
            color: #5e6c84;
            position: relative;
            margin-top: 20px;

            .el-input {
              width: calc(100% - 30px);
            }

            .el-input__inner {
              height: 30px;
              line-height: 30px;
            }
          }

          .add {
            cursor: pointer;
            background: #0052cc;
            color: #fff;
            text-align: center;

            .el-icon-plus {
              margin-right: 10px;
            }
          }

          .el-icon-delete {
            position: absolute;
            cursor: pointer;
            right: 10px;
            top: 50%;
            margin-top: -8PX;
          }
        }
      }
    }
  }
}
</style>
