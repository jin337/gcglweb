<template>
  <div class="addpaynodewrap" v-loading="loading">
    <div class="el-drawer__header header">
      <h3>支付管理</h3>
      <div v-if="!isLook">
        <el-button type="primary" size="small" @click="handelConfirm">确定</el-button>
        <el-button size="small" @click="handleCancel">取消</el-button>
      </div>
      <div v-else>
        <el-button size="small" @click="handleCancel">返回</el-button>
      </div>
    </div>
    <el-card>
      <el-row :gutter="20">
        <el-form ref="elForm" :model="form" :rules="rules" size="small" label-width="100px">
          <el-col :span="24">
            <el-form-item label="付款标题" prop="pay_title">
              <el-input v-model="form.pay_title" placeholder="请输入付款标题" clearable :style="{ width: '100%' }">
              </el-input>
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="项目" prop="project_code">
              <el-select v-model="form.project_code" placeholder="请选择项目" filterable :style="{ width: '100%' }"
                @change="handleProjectchange" :disabled="isEdit">
                <el-option v-for="item in projectList" :key="item.projectCode" :label="item.projectName"
                  :value="item.projectCode"></el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="合同" prop="contract">
              <el-select v-model="form.contract" placeholder="请先选择项目" filterable :style="{ width: '100%' }"
                @change="handleContractchange" value-key="id" :disabled="isEdit">
                <el-option v-for="item in contractList" :key="item.id" :label="item.contract_name"
                  :value="item"></el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="付款节点" prop="node">
              <el-select v-model="form.node" placeholder="请先选择合同" :style="{ width: '100%' }"
                @change="handlePayNodechange" :disabled="isEdit" value-key="node_id">
                <el-option v-for="item in pay_nodeList" :key="item.node_id" :label="item.node_title" :value="item">
                </el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="付款单位" prop="dept_id">
              <el-select v-model="form.dept_id" style="width:100%" placeholder="选择付款单位">
                <el-option v-for="item in BuilderList" :key="item.id" :label="item.name" :value="item.id">
                </el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="付款描述" prop="remark">
              <el-input v-model="form.remark" type="textarea" placeholder="请输入付款描述" :autosize="{ minRows: 2 }"
                :style="{ width: '100%' }"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12" v-if="form.pay_type === 1"> <!-- 预付款叫付款占比-->
            <el-form-item label="付款占比" prop="pay_ratio">
              <el-input v-model="form.pay_ratio" placeholder="输入付款占比" @blur="ratioToMoney"
                :disabled="form.pay_type !== 1">
                <template slot="append">%</template>
              </el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12" v-if="form.pay_type === 2"> <!-- 进度款叫材料款占比 -->
            <el-form-item label="材料款占比" prop="pay_ratio">
              <el-input v-model="form.pay_ratio" placeholder="输入材料款占比" @blur="ratioToMoney"
                :disabled="form.pay_type !== 1">

                <template slot="append">%</template>
              </el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <!-- 尾款3就不可以修改，进度款2人为计算出来，也是禁止修改 -->
            <el-form-item label="付款金额" prop="pay_money">
              <el-input v-model="form.pay_money" placeholder="付款金额" @blur="moneyToRatio" :disabled="form.pay_type !== 1"
                v-thousands></el-input>
            </el-form-item>
          </el-col>
        </el-form>
      </el-row>
    </el-card>
    <div class="content">
      <div class="color-bottom-line">
        <h3>付款详情</h3>
      </div>
      <vxe-table ref="xTable" show-overflow="title" :height="tableHeight" :data="infoList"
        :row-config="{ height: 30, isHover: true, keyField: 'item_id' }" highlight-current-row
        :checkbox-config="{ labelField: 'item_title' }" border>
        <vxe-column type="checkbox" title="名称" field="item_title" />
        <vxe-column title="类别" width="70px" field="payment_type_name" align="center"></vxe-column>
        <vxe-column title="单价" width="80px" field="item_price" header-align="center" align="right">

          <template v-slot="{ row }">
            <span v-if="row.item_price">{{ row.item_price ? formatNum(row.item_price) : 0 }}</span>
          </template>
        </vxe-column>
        <vxe-column title="物料数量" width="80px" field="device_count" align="center"></vxe-column>
        <vxe-column title="合计" field="summary" header-align="center" align="right" width="100px">

          <template v-slot="{ row }">
            <span>{{ row.summary ? formatNum(row.summary) : 0 }}</span>
          </template>
        </vxe-column>
        <vxe-column title="点位数量" width="80px" field="point_count" align="center">

          <template v-slot="{ row }">
            <div class="clickbg" @click="clickPointNums(row)">{{ row.point_count }}</div>
          </template>
        </vxe-column>
      </vxe-table>
    </div>

    <!-- 点位模块 -->
    <el-drawer :visible.sync="pointFlag" :title="currentRow ? currentRow.item_title : '已选点位'" append-to-body size="50%"
      custom-class="contract_point_info" direction="ltr">
      <div v-loading="cardloading" v-if="pointFlag" style="padding:20px;box-sizing: border-box;">
        <div class="searchTop">
          <div class="color-bottom-line">
            <h3>点位详情</h3>
            <div class="btns">
              <el-button size="small" type="success" @click="handleSurePoint">确认</el-button>
              <el-button size="small" @click="handleCancelPoint">取消</el-button>
            </div>
          </div>
          <el-input placeholder="请输入关键字查询内容" v-model="point_searchkey" @keyup.enter.native="searchPoint" clearable
            @clear="searchPoint">
            <!-- <el-checkbox slot="prepend" style="color:#f40;font-weight:700;" :indeterminate="isIndeterminate"
              v-model="checkAll" @change="handleCheckAllChange">全选</el-checkbox> -->
            <el-button slot="append" icon="el-icon-search" @click="searchPoint"></el-button>
          </el-input>
        </div>
        <vxe-table ref="pointTable" show-overflow="title" :data="point_list"
          :row-config="{ height: 30, isHover: true, keyField: 'point_code' }"
          :checkbox-config="{ checkField: 'ischeck', trigger: 'row' }" highlight-current-row border>
          <vxe-column width="60" align="center" type="checkbox"></vxe-column>
          <vxe-column title="点位编码" field="point_code" />
          <vxe-column title="点位名称" field="point_name"></vxe-column>
        </vxe-table>
        <div style="display:flex;justify-content:space-between;">
          <span style="color:#999;font-size:14px;">共 {{ pointpage.total }} 条记录</span>
          <el-pagination layout="prev,sizes, pager, next" :total="pointpage.total" :page-size.sync="pointpage.pageSize"
            :page-sizes="pointpage.pageSizes" @size-change="sizeChange" @current-change="pageChange"
            :current-page.sync="pointpage.pageNo" class="pagination" small background>
          </el-pagination>
        </div>
      </div>
    </el-drawer>
  </div>
</template>

<script>
import { checkPermission, formatNum, keepTwoDecimalFull } from '@/utils/tool'

export default {
  name: 'contractPay_info',
  props: {
    payDetail: { // 编辑或者查看下 是对应当前的选择行传递过来的信息
      type: Object,
      default: null
    },
    isLook: { // 是否是合同付款的查看
      type: Boolean,
      default: false
    },
    operateFlag: {
      type: Boolean,
      default: false
    },
    project_code: {
      type: String,
      default: ''
    }
  },
  data () {
    return {
      loading: false,
      form: {
        pay_title: '',
        project_code: null,
        contract: null, // 合同对象
        node: null, // 节点对象
        dept_id: null,
        remark: '',
        pay_money: '',
        pay_ratio: '',

        contract_id: null, // 合同id
        contract_money: '', // 合同的总价格
        pay_type: null, // 节点付款类型
        node_id: null // 节点id
      },
      rules: {
        pay_title: [{ required: true, message: '请输入付款标题', trigger: 'blur' }],
        project_code: [{ required: true, message: '请选择项目', trigger: 'change' }],
        contract: [{ required: true, message: '请选择合同', trigger: 'change' }],
        node: [{ required: true, message: '请选择付款节点', trigger: 'change' }],
        dept_id: [{ required: true, message: '请选择付款单位', trigger: 'change' }],
        remark: [{ required: true, message: '请输入付款描述', trigger: 'blur' }],
        pay_money: [
          { required: true, message: '金额必填', trigger: 'blur' },
          { pattern: /^\d+[.]?\d{0,2}$/, message: '请输入大于0的,支持两位小数', trigger: 'blur' },
          {
            validator: (rule, value, callback) => {
              if (value > this.form.contract_money) {
                callback(new Error('不能高于合同价 $' + formatNum(this.form.contract_money)))
              } else {
                callback()
              }
            },
            trigger: 'blur'
          }
        ],
        pay_ratio: [
          { required: true, message: '占比必填', trigger: 'blur' },
          { pattern: /^(?:0|[1-9][0-9]?|100)(\.[0-9]{0,2})?$/, message: '请输入大于等于0小于等于100数,支持两位小数', trigger: 'blur' }
        ]
      },
      projectList: [],
      BuilderList: [],
      contractList: [],
      pay_nodeList: [],
      infoList: [], // 付款详情列表
      tableHeight: window.innerHeight - 520,
      currentRow: null,
      // 点位展示---------
      point_list: [],
      point_allData: [], // 所有数据
      pointFlag: false,
      pointpage: {
        total: 0,
        pageSize: 20,
        pageSizes: [10, 20, 30],
        pageNo: 1
      },
      cardloading: false,
      point_searchkey: ''
      // checkAll: false, // 全选
      // isIndeterminate: false // 半选
      // 点位展示end --------------
    }
  },
  mounted () {
    this.init()
    this.getProjectList()
    window.onresize = () => {
      this.tableHeight = window.innerHeight - 520
    }
  },
  computed: {
    isEdit () {
      return this.payDetail && !!this.payDetail.id
    }

  },
  methods: {
    formatNum,
    checkPermission,
    async init () {
      if (this.isEdit) {
        this.loading = true
        const params = {
          id: this.payDetail.id
        }
        const { data, code, message } = await this.$pub.post('contract/pay/detail', params)
        this.loading = false
        if (code === 200) {
          const { project_code, pay_title, contract_id, id, node_title, pay_dept, pay_money, pay_node_id, pay_ratio, pay_type, pay_remark, price_list, contract_name, contract_money } = data

          if (project_code) {
            this.form.project_code = project_code
            this.getContractList()
            this.getBuilderList()
            if (contract_id) {
              this.form.contract_money = contract_money
              this.form.contract_id = contract_id
              this.form.contract = { // 回填合同对象
                id: contract_id, money: contract_money, contract_name: contract_name
              }
              this.form.node = { // 回填付款节点对象
                node_id: pay_node_id, node_title, pay_money, pay_ratio, pay_type
              }
              this.getNodeList()
              this.form.node_id = pay_node_id
              this.form.pay_type = pay_type
              this.form.pay_ratio = pay_ratio
              this.form.pay_money = pay_money
              this.infoList = price_list.map(m => {
                return {
                  ...m,
                  point_list: m.point_list.map(f => {
                    return {
                      ...f, ischeck: true
                    }
                  })
                }
              })
            }
          }
          this.form.id = id
          this.form.pay_title = pay_title
          this.form.dept_id = pay_dept
          this.form.remark = pay_remark
        } else {
          this.$notify.error({
            title: '查询失败',
            message: message
          })
        }
      } else if (this.project_code) {
        this.form.project_code = this.project_code
        this.handleProjectchange()
      }
    },
    async getProjectList () {
      try {
        const params = {
          user_id: this.$store.state.userInfo.id
        }
        const { code, data, message } = await this.$pub.post('project/project-list-by-user', params)
        if (code === 200) {
          this.projectList = (data || []).map(m => {
            return {
              ...m,
              projectCode: m.projectCode ? m.projectCode : m.project_code,
              projectName: m.projectName ? m.projectName : m.project_name
            }
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
    // 获取施工队列表
    async getBuilderList () {
      if (this.form.project_code === null) {
        return
      }
      const req = {
        project_code: this.form.project_code
      }
      const result = await this.$pub.post('/rate/builder-dept-list', req)
      if (result.code === 200) {
        this.BuilderList = result.data || []
      } else {
        this.BuilderList = []
        this.$notify.error({
          title: '施工单位查询失败',
          message: result.message
        })
      }
    },
    async getContractList () {
      this.loading = true
      const { data, code, message } = await this.$pub.post('contract/manage/list', { project_code: this.form.project_code })
      this.loading = false
      if (code === 200) {
        this.contractList = data || []
      } else {
        this.$notify.error({
          title: '查询失败',
          message: message
        })
      }
    },
    async getNodeList () {
      this.loading = true
      const { data, code, message } = await this.$pub.post('contract/pay/node/list', { contract_id: this.form.contract_id })
      this.loading = false
      if (code === 200) {
        this.pay_nodeList = data || []
      } else {
        this.$notify.error({
          title: '查询失败',
          message: message
        })
      }
    },
    async getPayDeviceList () {
      this.loading = true
      const params = {
        contract_id: this.form.contract_id, // 合同主键
        project_code: this.form.project_code,
        node_id: this.form.node_id
      }
      const { data, code, message } = await this.$pub.post('contract/pay/node/device/list', params)
      this.loading = false
      if (code === 200) {
        this.infoList = (data || []).map(m => {
          return {
            ...m,
            point_list: m.point_list.map(f => {
              return {
                ...f, ischeck: true
              }
            })
          }
        })
        this.computeMoney()
      } else {
        this.$notify.error({
          title: '查询失败',
          message: message
        })
      }
    },
    // 切换项目
    handleProjectchange () {
      this.clearContractData()
      this.form.dept_id = null
      this.clearNodeData()
      this.getContractList()
      this.getBuilderList()
    },
    // 切换合同
    handleContractchange (val) {
      this.clearNodeData()
      this.form.contract_id = val.id
      this.form.contract_money = val.money
      this.getNodeList()
    },
    // 切换付款节点
    handlePayNodechange (val) {
      this.infoList = []
      this.form.node_id = val.node_id
      this.form.pay_type = val.pay_type
      this.form.pay_ratio = val.pay_ratio
      if (this.form.pay_type !== 2) { // 预付款 , 尾款
        this.form.pay_money = val.pay_money
      }
      this.getPayDeviceList()
    },
    // 清空和合同有关的数据
    clearContractData () {
      this.form.contract = null
      this.form.contract_id = null
      this.form.contract_money = null
    },
    // 清空和节点有关的数据
    clearNodeData () {
      this.pay_nodeList = []
      this.infoList = []
      this.form.node = null
      this.form.node_id = null
      this.form.pay_type = null
      this.form.pay_ratio = ''
      this.form.pay_money = ''
    },
    // pay_money 进度款人为计算得出
    computeMoney () {
      if (this.form.pay_type === 2) { // 进度款
        this.form.pay_money = keepTwoDecimalFull(this.infoList.reduce((sum, e) => sum + Number(e.summary || 0), 0))
      }
    },
    // 输入比例的同时转换为付款金额
    ratioToMoney () {
      this.$refs.elForm.validateField((['pay_ratio']), (errorMessage) => {
        if (!errorMessage) {
          this.form.pay_money = keepTwoDecimalFull(this.form.contract_money * this.form.pay_ratio / 100)
        }
      })
    },
    // 输入付款金额的同时转换为比例
    moneyToRatio () {
      this.$refs.elForm.validateField((['pay_money']), (errorMessage) => {
        if (!errorMessage) {
          this.form.pay_ratio = keepTwoDecimalFull(this.form.pay_money * 100 / this.form.contract_money)
        }
      })
    },
    // 点击点位数量
    clickPointNums (row) {
      this.currentRow = row
      this.point_allData = this.currentRow.point_list.map(m => {
        return {
          ...m, isSearch: true
        }
      })
      // this.handleCheckchange()
      this.pageChange(1)
      this.pointFlag = true
    },
    // 获取点位展示分页数据
    getPointData () {
      this.cardloading = true
      setTimeout(() => {
        const tempData = this.point_allData.filter(f => f.isSearch) // 过滤有搜索词，只保留issearch为true的
        this.point_list = tempData.slice(
          (this.pointpage.pageNo - 1) * this.pointpage.pageSize,
          this.pointpage.pageNo * this.pointpage.pageSize
        )
        this.pointpage.total = tempData.length
        this.cardloading = false
      }, 500)
    },
    // 前端查询 带分页 和不带分页
    searchPoint () {
      // isSearch 为true就是展示出来
      if (this.point_searchkey) {
        this.loading = true
        this.point_allData.forEach((row, i) => {
          let num = -1; const point_code = row.point_code
          num = point_code.toLowerCase().indexOf(this.point_searchkey.toLowerCase())
          if (num > -1) {
            row.isSearch = true
          } else {
            row.isSearch = false
          }
          if (i === this.point_allData.length - 1) {
            this.loading = false
            this.pageChange(1)
          }
        })
      } else {
        this.loading = false
        this.point_allData = this.point_allData.map(m => {
          return {
            ...m, isSearch: true
          }
        })
        this.pageChange(1)
      }
    },
    pageChange (num) {
      this.pointpage.pageNo = num
      this.getPointData()
    },
    sizeChange (val) {
      this.pointpage.pageSize = val
      this.pageChange(1)
    },
    // handleCheckchange () {
    //   const checkedCount = this.point_allData.filter(f => f.ischeck).length
    //   this.checkAll = checkedCount === this.point_allData.length
    //   this.isIndeterminate = checkedCount > 0 && checkedCount < this.point_allData.length
    //   console.log(this.isIndeterminate, this.checkAll)
    // },
    // handleCheckAllChange () {
    //   this.point_allData.forEach(f => {
    //     f.ischeck = this.checkAll
    //   })
    //   this.isIndeterminate = false
    // },
    // 确定对点位的管理
    handleSurePoint (point) {
      this.$confirm('是否确认支付选中点位?', '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {
        this.currentRow.point_list = this.point_allData
        const checkList = this.point_allData.filter(f => f.ischeck)
        this.currentRow.device_count = checkList.reduce((sum, cur) => sum + cur.device_count, 0)
        this.currentRow.point_count = checkList.length
        this.currentRow.summary = keepTwoDecimalFull(this.currentRow.device_count * this.currentRow.item_price)
        this.pointFlag = false
        this.computeMoney()
        console.log(this.infoList)
      }).catch(() => { })
    },
    handleCancelPoint () {
      this.pointFlag = false
    },
    // 确定支付
    handelConfirm () {
      this.$refs.elForm.validate(async (valid) => {
        if (valid) {
          const selectRecords = this.$refs.xTable.getCheckboxRecords()
          const params = {
            id: this.payDetail ? this.payDetail.id : null,
            pay_title: this.form.pay_title,
            project_code: this.form.project_code,
            contract_id: this.form.contract_id, // 合同主键
            pay_node_id: this.form.node_id,
            pay_remark: this.form.remark,
            pay_money: this.form.pay_money,
            pay_type: this.form.pay_type,
            pay_dept: this.form.dept_id,
            pay_ratio: Number(this.form.pay_ratio),
            price_list: selectRecords.length > 0 ? selectRecords.map(m => {
              return {
                contract_code: m.contract_code,
                item_id: m.item_id,
                item_title: m.item_title,
                item_price: m.item_price,
                payment_type: m.payment_type,
                payment_type_name: m.payment_type_name,
                device_count: m.device_count,
                point_count: m.point_count,
                summary: m.summary,
                point_list: m.point_list.filter(m => m.ischeck)
              }
            }) : []
          }
          console.log(params.price_list)
          // const url = this.payDetail ? 'contract/pay/edit' : 'contract/pay/add'
          // const { code } = await this.$pub.post(url, params)
          // if (code === 200) {
          //   this.$message({
          //     type: 'success',
          //     message: '操作成功',
          //     showClose: true
          //   })
          //   this.handleCancel()
          // }
        }
      })
    },
    handleCancel () {
      this.$emit('cancel')
    }
  }
}
</script>

<style lang="scss">
.addpaynodewrap {
  padding: 0 20px;
  box-sizing: border-box;
  height: 100%;

  .el-card {
    overflow: auto;

    .el-input-number--small {
      width: 100%;
    }

    .el-input__inner {
      height: 30px;
      line-height: 30px;
    }
  }

  .content {
    margin-top: 20px;

    .color-bottom-line {
      border-bottom: 3px solid #91e4e7;
      margin-bottom: 20px;
      display: flex;
      align-items: center;

      h3 {
        padding-bottom: 10px;
        color: #72767b;
        padding-left: 20px;
      }
    }

    .vxe-cell {
      .clickbg {
        padding: 2px 0;
        width: 50px;
      }
    }

  }
}

.contract_point_info {
  .el-drawer__body {
    height: 70vh;
    overflow: auto;

    .brief {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      justify-content: flex-start;
      width: 100%;
      padding: 10px;
      box-sizing: border-box;

      .brief-item {
        width: calc(33% - 16px);
        margin: 8px;
        cursor: pointer;
        border-radius: 3px;
        box-shadow: 0 1px 1px rgba(9, 30, 66, .25), 0 0 1px rgba(9, 30, 66, .31);
        padding: 10px 20px 10px;
        box-sizing: border-box;
        position: relative;

        &:hover {
          background: #e3f8f8;
        }

        .btnwrap {
          position: absolute;
          right: 20px;
          top: 20px;
        }
      }

      .title {
        overflow: hidden;
        line-height: 20px;
        color: #5e6c84;
        white-space: nowrap;
      }

      .value {
        min-height: 32px;
        margin-top: 8px;
        overflow: hidden;
        font-size: 20px;
        font-weight: 700;
        line-height: 1;
        white-space: nowrap;
        width: 100%;
      }
    }
  }

  .el-drawer__header {
    margin-bottom: 10px;
  }

  .color-bottom-line {
    border-bottom: 3px solid #91e4e7;
    margin-bottom: 20px;
    display: flex;
    align-items: center;
    justify-content: space-between;

    h3 {
      padding-bottom: 10px;
      color: #72767b;
      padding-left: 20px;
    }

    .el-button--success {
      background: #91e4e7;
      border-color: #91e4e7;

      &:hover {
        background: #408a8e;
      }
    }
  }

}
</style>
