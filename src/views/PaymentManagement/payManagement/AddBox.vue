<template>
  <div class="paymanagement_add" v-loading="tableLoading">
    <div class="vux-flexbox flex-content vux-flex-row">
      <span class="main-title">
        {{ title }}<i :size="16" class="el-icon-menu"></i>
        <span v-if="!infoFlag" style="margin-left:4px;font-size:14px;color:#999;">已选（{{ SelectionDatas.length }}）个</span>
        <span v-else style="margin-left:4px;font-size:14px;color:#999;">已支付点位（{{ SelectionDatas.length }}）个</span>
      </span>
      <span class="close" @click="cancel"><i :size="16" class="el-icon-close"></i></span>
    </div>
    <el-form ref="form" class="topwrap" :inline="true" :model="form" :rules="rules">
      <el-form-item prop="pay_sn" label="支付编码">
        <el-input v-model="form.pay_sn" readonly clearable placeholder="请输入支付编码"></el-input>
      </el-form-item>
      <el-form-item prop="pay_title" label="支付标题">
        <el-input v-model="form.pay_title" clearable placeholder="请输入支付标题" :readonly="infoFlag"></el-input>
      </el-form-item>
      <!-- <el-form-item label="施工队" prop="dept"> -->
      <!-- <el-select v-model="form.dept" clearable placeholder="请选择施工队" :disabled="infoFlag">
          <el-option v-for=" item  in  BuilderList " :key="item.id" :label="item.name" :value="item.id">
          </el-option>
        </el-select> -->
      <!-- <treeselect style="width:220px;" :disabled="infoFlag" v-model="form.dept" :normalizer="normalizer"
          placeholder="请选择施工队" :options="BuilderList" /> -->
      <!-- </el-form-item> -->
      <el-form-item>
        <el-button @click="handleOPear" v-if="addFlag" type="primary" size="small"
          :disabled="SelectionDatas.length <= 0">暂存</el-button>
        <el-button @click="handleOPear" v-if="editFlag" type="primary" size="small"
          :disabled="SelectionDatas.length <= 0">确定</el-button>
      </el-form-item>
      <!-- <el-form-item style="margin-right:0;">
      </el-form-item> -->
    </el-form>
    <!-- 选中的统计表 -->
    <el-card class="totalbox">
      <vxe-table show-overflow="title" height="150px" :data="totalSelect" :row-config="{ height: 30, isHover: true }"
        highlight-current-row>
        <vxe-column title="支付类型" field="pay_ip_type_name" header-align="center" />
        <vxe-column title="支付数量" field="count" align="center">
          <template v-slot="{ row }">
            <span>{{ row.count }}</span>
          </template>
        </vxe-column>
        <vxe-column title="支付单价" field="pay_ip_type_money" header-align="center" align="right">
          <template v-slot="{ row }">
            <span v-if="row.pay_ip_type">{{ row.pay_ip_type_money ? formatNum(row.pay_ip_type_money) : 0 }}</span>
          </template>
        </vxe-column>
        <vxe-column title="合计" field="sum" header-align="center" align="right">
          <template v-slot="{ row }">
            <span>{{ row.sum ? formatNum(row.sum) : 0 }}</span>
          </template>
        </vxe-column>
      </vxe-table>
    </el-card>
    <!-- 选择项 -->
    <vxe-table class="seletable" ref="multipleTable" show-overflow="title" :max-height="tableHeight" :data="tableData"
      :row-config="{ height: 30, isHover: true }" highlight-current-row @checkbox-change="selectionChange"
      @checkbox-all="selectionChange">
      <vxe-column type="checkbox" width="60" v-if="!infoFlag"></vxe-column>
      <vxe-column title="点位编码" field="point_code" width="130px" />
      <vxe-column title="点位名称" field="point_name" min-width="140px" />
      <vxe-column title="设备名称" field="device_name" width="210px" />
      <vxe-column title="IP" field="ip" width="120px" align="center" />
      <vxe-column title="测通时间" field="online_date" width="100px" align="center">
        <template v-slot="{ row }">
          <span>{{ row.online_date ? parseTime(row.online_date, '{y}-{m}-{d}') : '' }}</span>
        </template>
      </vxe-column>
      <vxe-column title="初始状态" field="init_status_name" width="80px" align="center" />
      <vxe-column title="支付类型" field="pay_ip_type_name" width="80px" align="center" />
      <vxe-column title="金额" field="pay_ip_type_money" header-align="center" align="right" width="100px">
        <template v-slot="{ row }">
          <span>{{ row.pay_ip_type_money ? formatNum(row.pay_ip_type_money) : 0 }}</span>
        </template>
      </vxe-column>
      <vxe-column title="状态变更时间" field="change_status_date" width="120px" align="center">
        <template v-slot="{ row }">
          <span>{{ row.change_status_date ? parseTime(row.change_status_date, '{y}-{m}-{d}') : '' }}</span>
        </template>
      </vxe-column>
    </vxe-table>

  </div>
</template>

<script>
// 新建支付，编辑支付，支付详情页面
import { parseTime, formatNum } from '@/utils/tool'
export default {
  name: 'payManagement_add',
  props: {
    addFlag: { // 新建
      type: Boolean,
      default: false
    },
    infoFlag: { // 详情
      type: Boolean,
      default: false
    },
    editFlag: { // 编辑
      type: Boolean,
      default: false
    },
    title: {
      type: String,
      default: ''
    },
    project_code: {
      type: String,
      default: ''
    },
    tag: {
      type: Object,
      default: () => {
        return {
          id: 0, name: ''
        }
      }
    },
    current: {
      type: Object,
      default: null
    }
  },
  data () {
    return {
      form: {
        pay_sn: null,
        pay_title: null,
        dept: 1
      },
      payDetail: null,
      BuilderList: [],
      rules: {
        pay_sn: [
          { required: true, message: '请输入支付编码', trigger: 'blur' }
        ],
        pay_title: [
          { required: true, message: '请输入支付标题', trigger: 'blur' }
        ],
        dept: [
          { required: true, message: '请选择施工队', trigger: 'blur' }
        ]
      },
      tableLoading: false,
      tableData: [],
      tableHeight: window.innerHeight - 340,
      SelectionDatas: [],
      selectEdDatas: [], // 编辑，详情页面里面初始化选中的数据，用作反选
      payTypeList: [] // 选中的算合计
    }
  },
  created () {
    this.getPayType()
  },
  mounted () {
    this.init()
    this.getBuilderList()
    window.onresize = () => {
      this.tableHeight = window.innerHeight - 340
    }
  },
  computed: {
    totalSelect () {
      // 维护上线:掉线维护2； 新接入：新上维护3
      const tempArr = this.payTypeList.map(m => {
        return {
          ...m, count: 0, sum: 0, children: []
        }
      })
      this.SelectionDatas.forEach(f => {
        const tempobj = tempArr.find(k => k.pay_ip_type === f.pay_ip_type)
        if (tempobj) {
          tempobj.children.push(f)
          const leng = tempobj.children.length
          tempobj.count = leng
          tempobj.sum = leng * tempobj.pay_ip_type_money
        }
      })

      const lastObj = tempArr.find(f => f.pay_ip_type === 0)
      if (lastObj) {
        const sum = tempArr.reduce((prev, cur) => prev + cur.sum, 0)
        const count = tempArr.reduce((prev, cur) => prev + cur.count, 0)
        lastObj.sum = sum
        lastObj.count = count
      }
      return tempArr
    }
  },
  methods: {
    parseTime,
    formatNum,
    async init () {
      if (this.current) {
        //  获取详情，确定上次已被选择的表格数据，后面用作反选selectEdDatas
        const { data, code, message } = await this.$pub.post('pay/ip/info/detail', { id: this.current.id })
        if (code !== 200) {
          this.$message({
            type: 'error',
            message: message || '获取支付详情失败',
            showClose: true
          })
          return
        }
        this.payDetail = data
        this.form.pay_sn = data.pay_sn
        this.form.pay_title = data.pay_title
        this.form.dept = data.dept
        this.SelectionDatas = data.list
        if (this.infoFlag) {
          this.tableData = data.list
        } else {
          // this.selectEdDatas = (data.list || []).map(m => m.base_id)
          this.selectEdDatas = (data.list || []).map(m => m.pay_device_code)
          this.getTableData()
        }
      } else {
        this.getSn()
        this.getTableData()
      }
    },
    async getBuilderList () {
      const req = {
        // project_code: this.project_code
        mc: ''
      }
      const { code, data, message } = await this.$pub.post('sys/dept/list-tree', req)
      if (code === 200) {
        this.BuilderList = Array.isArray(data.dept) ? data.dept : data.dept.child
      } else {
        this.BuilderList = []
        this.$notify.error({
          title: '施工队查询失败',
          message: message
        })
      }
    },
    /** 转换菜单数据结构 */
    normalizer (node) {
      if ((node.child && !node.child.length) || node.child === null) {
        delete node.child
      }
      return {
        id: node.id,
        label: node.jc, // mc
        children: node.child
      }
    },
    // 获取支付编码
    async getSn () {
      const { data, code, message } = await this.$pub.post('pay/ip/info/get-sn')
      if (code !== 200) {
        this.$message({
          type: 'error',
          message: message || '获取支付编码失败',
          showClose: true
        })
        return
      }
      this.form.pay_sn = data || ''
    },
    // 获取支付类型展示合计
    async getPayType () {
      const params = {
        project_code: this.project_code,
        tag_id: this.tag.id
      }
      const { data, code, message } = await this.$pub.post('pay/ip/info/pay-type-money', params)
      if (code !== 200) {
        this.$message({
          type: 'error',
          message: message || '获取支付类型失败',
          showClose: true
        })
        return
      }
      this.payTypeList = data
      this.payTypeList.push({ pay_ip_type_name: '合计', pay_ip_type: 0 })
    },
    async getTableData () {
      this.tableLoading = true
      const params = {
        project_code: this.project_code,
        tag_id: this.tag.id,
        init_status: null,
        online_status: null,
        point_code: null,
        id: this.payDetail ? this.payDetail.id : 0
      }
      const { data, code, message } = await this.$pub.post('pay/ip/info/add/list', params)
      if (code !== 200) {
        this.$message({
          type: 'error',
          message: message || '获取在线情况列表失败',
          showClose: true
        })
        return
      }
      // this.tableData = (data || []).map(m => {
      //   return {
      //     ...m, base_id: Number(m.id)
      //   }
      // })
      this.tableData = data || []
      this.tableLoading = false

      this.$nextTick(() => {
        this.tableData.forEach(row => {
          if (this.selectEdDatas.includes(row.pay_device_code)) {
            this.$refs.multipleTable.toggleCheckboxRow(row, true)
          }
        })
      })
    },
    selectionChange (val) {
      this.SelectionDatas = val.records
    },
    checCheckbox () {
      return !this.infoFlag
    },
    async handleOPear () {
      this.$refs.form.validate(async (valid) => {
        if (valid) {
          this.tableLoading = true
          const params = {
            ...this.form,
            id: this.payDetail?.id,
            project_code: this.project_code,
            tag_id: this.tag.id,
            tag: this.tag.name,
            status: this.payDetail?.status,
            list: this.SelectionDatas.map(m => {
              return {
                point_code: m.point_code,
                ip: m.ip,
                pay_status: m.pay_status,
                pay_ip_type: m.pay_ip_type,
                // base_id: m.base_id,
                pay_device_code: m.pay_device_code
              }
            })
          }
          const url = this.payDetail ? 'pay/ip/info/edit' : 'pay/ip/info/add'
          const { code, message } = await this.$pub.post(url, params)
          this.tableLoading = false
          if (code !== 200) {
            this.$message({
              type: 'error',
              message: message || '提交失败',
              showClose: true
            })
            return
          }
          this.$message({
            type: 'success',
            message: '操作成功',
            showClose: true
          })
          this.cancel()
        }
      })
    },
    cancel () {
      this.$emit('cancel')
    }
  }
}
</script>

<style scoped>
.paymanagement_add {
  padding: 20px;
  width: 100%;
  box-sizing: border-box;
  height: 100%;

  .flex-content {
    box-sizing: border-box;
    width: 100%;
    padding-bottom: 24px;
    justify-content: space-between;
  }

  .main-title {
    font-size: 22px;
    color: #172b4d;

    .el-icon-menu {
      margin-left: 4px;
      vertical-align: middle;
    }
  }

  .close {
    cursor: pointer;
    padding: 6px;
  }

  .topwrap {
    display: flex;
    /* margin-bottom: 40px; */
  }

  .btns {
    text-align: right;
    margin-top: 30px;
  }

  .seletable {
    margin-top: 20px;
  }

  .totalbox {
    /* position: absolute;
    top: 4px;
    right: 20px; */
    /* margin-top: -76px; */
    /* margin-left: 40px; */
    /* position: relative; */

    .el-card__body {
      padding: 10px;

      &:before {
        position: absolute;
        top: 0;
        right: 0;
        left: 0;
        height: 4px;
        content: " ";
        background-color: #409EFF;
        border-radius: 2px;
      }

      .vxe-table--render-default .vxe-header--column:not(.col--ellipsis) {
        padding: 4px 0;
      }
    }
  }
}
</style>
