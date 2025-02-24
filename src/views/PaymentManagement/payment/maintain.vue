<template>
  <div class="wrap">
    <span class="title">
      <span>{{ current ? current.pay_title : '' }} ({{ noOpearPoints.length }}/{{ points.length }})</span>
      <div class="remark">描述：{{ current.pay_content }}</div>
    </span>
    <div v-loading="loading || devLoading" class="content">
      <div class="_left">
        <div class="inp">
          <el-input v-model="searchWords" placeholder="请输入" @blur="searchPoint" @keyup.enter.native="searchPoint"
            style="width:160px;">
            <template v-slot:prefix>
              <i class="el-input__icon el-icon-search" @click="searchPoint"></i>
            </template>
          </el-input>
          <span class="check">
            <el-tooltip class="item" effect="dark" content="是否只展示未操作过的点位" placement="top-start" v-if="points.length > 0">
              <el-checkbox v-model="isAllFlag"></el-checkbox>
            </el-tooltip>
          </span>
        </div>
        <ul class="up_wrap_pay">
          <li v-for="(p, i) in (isAllFlag ? noOpearPoints : points)" :key="p.pay_point_code + p.id" :class="{
            point: true,
            isRed: p.type === 2,
            isBlue: p.type === 1,
            isActive_tree_item: active && (p.pay_point_code && active.pay_point_code === p.pay_point_code),
            isKeyUp_active: is_index.length > 0 && is_index[activeIndex] === i
          }" @click="clickPoint(p)">
            <div class="item">
              <span v-html="p.pay_point_code_hight" class="code"></span>
              <span class="del" @click.stop="delPoint(p)" v-if="!isFiles">
                <i class="el-icon-delete"></i>
              </span>
            </div>
          </li>
          <li class="empty" v-if="((isAllFlag && noOpearPoints.length <= 0) || points.length <= 0)">
            暂无{{ isAllFlag ? '未操作过的' : '' }}点位</li>
        </ul>
      </div>

      <div class="_right">
        <el-tree class="proc" :data="procList" node-key="value" empty-text="点击点位切换工序"
          :default-expanded-keys="defaultShowNodes" @node-click="clickProc" @node-expand="handleNodeExpand"
          @node-collapse="handleNodeCollapse">
          <span slot-scope="{ node,data }"
            :class="{ 'custom-tree-node': true, isRed: data.type === 2, isBlue: data.type === 1, isActive: active && (data.procCode && active.procCode === data.procCode) }">
            <span>{{ node.label }}</span>
            <span v-if="data.procCode && defaultClassCode.includes(data.classCode) && !isFiles">
              <el-button size="mini" @click.stop="canclePay(data)"
                v-if="data.type === 1 && defaultClassCode.includes(data.procCode)">取消</el-button>
              <el-button size="mini" @click.stop="surePay(data)"
                v-if="(data.type === 2 || data.type === 0) && defaultClassCode.includes(data.procCode)">付款</el-button>
            </span>
          </span>
        </el-tree>
        <div class="info">
          <div class="info_wrap" v-loading="loading" v-if="active">
            <p style="font-weight: 700;font-size:18px;"><span>点位编码:{{ active.pay_point_code }}</span></p>
            <p style="font-weight: 700;font-size:18px;margin:10px 0 15px 0;"><span>点位名称:{{ active.pay_point_name }}</span>
            </p>
            <info :deviceList="deviceList" :procLists="oneProcLists" :statusOptions="statusOptions"></info>
            <!-- 选择年份，月份  -->
            <el-card class="seltime" v-loading="TimeLoading" v-if="current.pay_type === 2">
              <div class="subbtn">
                <el-dropdown @command="addTime" v-if="agreeAdd">
                  <el-button type="primary" size="mini">新增</el-button>
                  <el-dropdown-menu slot="dropdown">
                    <el-dropdown-item v-for="item in addYearList" :key="item" :command="item"
                      :disabled="timeList.map(m => m.year).includes(item)">
                      <span class="year">{{ item }}</span>年</el-dropdown-item>
                  </el-dropdown-menu>
                </el-dropdown>
                <el-button size="mini" v-if="active.type === 1" @click="curecancleYear">确定</el-button>
              </div>
              <div class="row" v-for="(year, i) in timeList" :key="year.year">
                <h4 style="display:inline-block;margin-right:10px;">
                  <span class="year">{{ year.year }}</span>年
                  <!-- <el-button circle size="mini" v-if="agreeAdd" icon="el-icon-plus" ></el-button> -->
                </h4>
                <!-- <el-select v-else v-model="year.year" placeholder="请选择年份" clearable @clear="clearYear(year)"
                  @change="selectYear" class="year" style="width:100px;" size="small">
                  <el-option v-for="item in addYearList" :key="item" :value="item" :label="item + ' 年'"
                    :disabled="timeList.map(m => m.year).includes(item)">
                    <span class="year">{{ item }}</span>年
                  </el-option>
                </el-select> -->
                <el-button circle size="mini"
                  v-if="year.year !== currentYear && year.monthlist.filter(f => f.unchange).length <= 0"
                  icon="el-icon-minus" @click="delTime(i)"></el-button>
                <el-row :class="{ mon: true, yesYear: year.year }">
                  <el-col :span="4" v-for="mon in year.monthlist" :key="mon.value"
                    @click.native="selectMonth(year.year, mon)" :class="{ bluemonth: mon.check, redmonth: mon.unchange }">
                    <div>{{ mon.value }}月</div>
                  </el-col>
                </el-row>
              </div>
            </el-card>
            <!-- 付款记录 -->
            <div class="payment_log">
              <h2>付款记录</h2>
              <el-table v-loading="payLoading" :data="payList" :row-style="{ height: '30px' }"
                :cell-style="{ padding: '0' }" highlight-current-row border>
                <el-table-column prop="pay_title" label="标题" :show-overflow-tooltip="true"
                  align="center"></el-table-column>
                <el-table-column prop="create_user" label="操作人" width="90" :show-overflow-tooltip="true"
                  align="center"></el-table-column>
                <el-table-column prop="create_time" label="操作时间" :show-overflow-tooltip="true" align="center">
                  <template slot-scope="scope">
                    <span>{{ parseTime(scope.row.create_time) }}</span>
                  </template>
                </el-table-column>
              </el-table>
            </div>
            <div class="payment_log" v-if="active.remark">
              <h2>付款备注</h2>
              <span class="remark">{{ active.remark }}</span>
            </div>
          </div>
          <div v-else class="nodata">
            <el-image :src="require(`@/assets/images/null.png`)" style="width: 80px;"></el-image>
            <p style="color: grey"> 点击工序切换</p>
          </div>
        </div>
      </div>
    </div>
    <!-- 付款 -->
    <el-dialog :visible.sync="payFlag" append-to-body title="提示">
      <h3 style="margin-bottom: 20px;font-size: 16px;display: flex;align-items: center;">
        <i class="el-icon-warning" style="color:#e6a23c;font-size:24px;margin-right:12px;"></i>
        本次付款备注
      </h3>
      <el-input v-if="payFlag" type="textarea" v-model="pay_remark" :rows="3" v-focus></el-input>
      <div slot="footer" class="dialog-footer">
        <el-button size="mini" type="text" @click="cancleFn">取消</el-button>
        <el-button size="mini" :loading="submitloading" type="primary" @click="payFn">确认</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import info from '../../rate/components/info.vue'
import config from '../../../config/config'
import { parseTime, cascader } from '@/utils/tool'
export default {
  name: 'maintain_payment',
  props: {
    current: {
      require: true
    },
    maintainFlag: {
      require: true
    }
  },
  data () {
    return {
      loading: false,
      points: [],
      searchWords: '',
      procList: [],
      defaultShowNodes: [], // 这里存放要默认展开的节点 id
      active: null,
      allProcs: [], // 全部工序步骤详情
      oneProcLists: [], // 当前选择的一个工序详情
      deviceList: [],
      devLoading: false,
      statusOptions: config.statusOptions,
      payList: [],
      payLoading: false,
      prePar: null,
      payFlag: false,
      pay_remark: '',
      submitloading: false,
      defaultClassCode: [],
      isAllFlag: false,
      is_index: [],
      activeIndex: -1,
      defaultYearlist: [],
      addYearList: [],
      timeList: [],
      TimeLoading: false
    }
  },
  components: { info },
  directives: {
    focus: {
      inserted (el) {
        el.querySelector('textarea').focus()
      }
    }
  },
  computed: {
    noOpearPoints () {
      return this.points.filter(f => f.type !== 1)
    },
    isFiles () {
      return this.current.pay_status === '9'
    },
    currentYear () {
      return new Date().getFullYear()
    },
    agreeAdd () {
      const temp = this.addYearList.filter(f => !this.timeList.map(m => m.year).includes(f))
      if (temp.length > 0) {
        return true
      } else {
        return false
      }
    }
  },
  watch: {
    active: {
      handler () {

      },
      deep: true
    }
  },
  created () {
    document.addEventListener('keydown', this.handleKeyup)
  },
  mounted () {
    this.defaultClassCode = this.defaultShowNodes = this.current.pay_class ? this.current.pay_class.split(',') : []
    this.getPoints()
  },
  methods: {
    parseTime,
    async getPoints () {
      this.loading = true
      const { code, data, message } = await this.$pub.post('project/pay/point-list', { id: this.current.id })

      this.loading = false
      if (code !== 200) {
        this.points = []
        return this.$message({
          type: 'error',
          message: message || '查询出错了',
          showClose: true
        })
      } else {
        this.points = (data.list || []).map(m => {
          return {
            ...m,
            pay_point_code_hight: m.pay_point_code
          }
        })
      }
    },
    searchPoint () {
      if (this.searchWords) {
        this.is_index = []
        this.loading = true
        setTimeout(() => {
          this.points.forEach((row, i) => {
            this.isHight(row, i)
            if (i === this.points.length - 1) {
              this.loading = false
              this.$nextTick(() => {
                const el = document.getElementsByClassName('up_wrap_pay')[0]
                if (this.is_index.length > 0 && el) {
                  this.activeIndex = 0// 跳转到的高亮字段在高亮数组中的索引，默认0位开始
                  el.scrollTop = this.is_index[0] * 50
                }
              })
            }
          })
        }, 100)
      } else {
        this.loading = true
        setTimeout(() => {
          this.points.forEach((row, i) => {
            row.pay_point_code_hight = row.pay_point_code
            if (i === this.points.length - 1) {
              this.loading = false
            }
          })
        }, 100)
      }
    },
    isHight (row, i) {
      let num = -1; const pay_point_code = row.pay_point_code
      num = pay_point_code.toLowerCase().indexOf(this.searchWords.toLowerCase())
      if (num > -1) {
        const searchName = pay_point_code.substr(num, this.searchWords.length)
        const replaceReg = new RegExp(this.searchWords, 'ig')
        const replaceString = '<span class="keyword-lighten">' + searchName + '</span>'
        row.pay_point_code_hight = (pay_point_code || '').replace(replaceReg, replaceString)
        this.is_index.push(i)
        // tempArr.push(row)
      } else {
        row.pay_point_code_hight = row.pay_point_code
      }
    },
    handleKeyup (event) {
      const key = event.keyCode
      if ((key === 38 || key === 40) && this.is_index.length > 0) {
        this.$nextTick(() => {
          const el = document.getElementsByClassName('up_wrap_pay')[0]
          if (el) {
            // 向上键
            if (key === 38) {
              this.activeIndex = this.activeIndex - 1 >= 0 ? this.activeIndex - 1 : 0
            }
            // 向下键
            if (key === 40) {
              this.activeIndex = (this.activeIndex + 1 < this.is_index.length) ? this.activeIndex + 1 : this.activeIndex
            }
            if (this.activeIndex === 0) {
              this.$message({
                type: 'info',
                message: '已经是第一条搜素数据',
                showClose: true,
                customClass: 'message4'
              })
            } else if (this.activeIndex + 1 === this.is_index.length) {
              this.$message({
                type: 'info',
                message: '已经是最后一条搜素数据',
                showClose: true,
                customClass: 'message4'
              })
            }
            el.scrollTop = this.is_index[this.activeIndex] * 50
          }
        })
      }
    },
    clickPoint (point) {
      this.active = point
      this.defaultShowNodes = this.current.pay_class ? this.current.pay_class.split(',') : []
      this.getIAllProcList()// 全部工序详情
      this.getDeviceList()// 获取物料详情
    },
    async getProcList () {
      this.payList = []
      this.loading = true
      this.procList = []
      const { data, code, message } = await this.$pub.post('project/pay/proc-detail', { pay_id: this.current.id, pay_point_code: this.active.pay_point_code })

      if (code !== 200) {
        return this.$message({
          type: 'error',
          message: message || '获取工序出错了',
          showClose: true
        })
      }
      if (data.list && data.list.length > 0) {
        this.getProc(data.list)
      }
      this.loading = false
    },
    getProc (data) {
      this.procList = data.map((m, i) => {
        const tmpobj = {
          label: m.className,
          value: m.classCode,
          children: this.getChild(m.procList, m.classCode),
          ...m
        }
        return tmpobj
      })
      //  this.procList.push(tmpobj)
      if (!this.active.procCode && this.defaultShowNodes.length > 0) {
        const tempArr = cascader(this.defaultShowNodes, this.procList, 'value')
        tempArr.some(f => {
          if (f.length > 1) {
            for (let i = 0; i < this.procList.length; i++) {
              if (this.procList[i].classCode === f[0]) {
                const item = this.procList[i].children.find(j => j.procCode === f[1])
                this.active = { ...this.active, ...item }
                return true
              }
            }
            return true
          }
        })
      }
      this.clickProc(this.active)
    },
    getChild (arr, classCode) {
      return (arr || []).map(m => {
        return {
          label: m.procName,
          value: m.procCode,
          ...m,
          classCode
        }
      })
    },
    // 获取全部工序步骤详情
    async getIAllProcList () {
      this.oneProcLists = []
      const params = {
        point_code: this.active.pay_point_code,
        project_code: this.current.pay_project_code
      }
      const result = await this.$pub.post('/point/proc_submit_web_list', params)
      if (result.code === 200) {
        if (result.data && result.data.length > 0) {
          this.allProcs = result.data
        } else {
          this.allProcs = []
        }
        this.getProcList()// 当前点位下工序列表
      } else {
        this.$notify.error({
          title: '查询失败',
          message: result.message
        })
      }
      try {
      } catch (e) {
        this.$notify.error({
          title: '服务器请求失败',
          message: e.message
        })
      }
    },
    // 获取详情里面的物料规格
    async getDeviceList () {
      this.devLoading = true
      this.deviceList = []
      const params = {
        point_code: this.active.pay_point_code,
        project_code: this.current.pay_project_code
      }
      const { code, message, data } = await this.$pub.post('/device/build-reg-info', params)
      if (code !== 200) {
        this.$notify.error({
          title: '物料规格列表查询失败',
          message: message
        })
      } else {
        this.deviceList = data.device_list || []
      }
      this.devLoading = false
    },
    // 树节点展开
    handleNodeExpand (data) {
      // 保存当前展开的节点
      let flag = false
      this.defaultShowNodes.some(item => {
        if (item === data.classCode) { // 判断当前节点是否存在， 存在不做处理
          flag = true
          return true
        }
      })
      if (!flag) { // 不存在则存到数组里
        this.defaultShowNodes.push(data.classCode)
      }
    },
    // 树节点关闭
    handleNodeCollapse (data) {
      this.defaultShowNodes.some((item, i) => {
        if (item === data.classCode) {
          // 删除关闭节点
          this.defaultShowNodes.splice(i, 1)
        }
      })
      this.removeChildrenIds(data) // 这里主要针对多级树状结构，当关闭父节点时，递归删除父节点下的所有子节点
    },
    // 删除树子节点
    removeChildrenIds (data) {
      if (data.children) {
        data.children.forEach((item) => {
          const index = this.defaultShowNodes.indexOf(item.id)
          if (index > 0) {
            this.defaultShowNodes.splice(index, 1)
          }
          this.removeChildrenIds(item)
        })
      }
    },
    clickProc (item) {
      if (item.procCode) {
        this.payList = []
        this.loading = true
        this.oneProcLists = []
        this.active = { ...this.active, ...item }

        // 筛选出选择的工序对应的详情
        this.allProcs.some(s => {
          if (s.classCode === this.active.classCode) {
            const temp = s.procList.find(f => f.procCode === this.active.procCode)
            if (temp) {
              this.oneProcLists.push({
                ...s,
                procList: [temp]
              })
            }
            return true
          }
        })
        this.getPayLog()
        this.getTimeList()
        this.$nextTick(() => {
          // 去掉上一次选中的行样式
          if (this.prePar) {
            this.prePar.classList.remove('isActive_tree_item')
          }
          // 给当前选中的行样式
          const el = document.querySelector('.isActive')
          if (el) {
            this.prePar = el.parentNode
            this.prePar.classList.add('isActive_tree_item')
          }
          this.loading = false
        })
      }
    },
    async getPayLog () {
      this.payLoading = true
      const params = {
        keyword: '',
        pay_project_code: this.current.pay_project_code,
        begin_time: '',
        end_time: '',
        pay_ids: this.active.pay_id ? this.active.pay_id : '-1'
      }
      const { code, data, message } = await this.$pub.post('project/pay/list', params)

      this.payLoading = false
      if (code !== 200) {
        this.payList = []
        return this.$message({
          type: 'error',
          message: message || '查询付款记录出错了',
          showClose: true
        })
      } else {
        this.payList = data.list || []
      }
    },
    // 获取年月份，回显
    async getTimeList () {
      this.TimeLoading = true
      this.timeList = []
      this.defaultYearlist = []
      this.addYearList = []
      const params = {
        id: this.current.id,
        pay_project_code: this.current.pay_project_code,
        point_code: this.active.pay_point_code,
        proc_code: this.active.procCode
      }
      const { code, data, message } = await this.$pub.post('project/pay/pay-month', params)

      this.TimeLoading = false
      if (code !== 200) {
        return this.$message({
          type: 'error',
          message: message || '查询年月付款记录出错了',
          showClose: true
        })
      } else {
        // data.list = [
        //   {
        //     month: [2, 5], // 已选过但是可以更改的月份集合
        //     no_change_month: [1, 9], // 不可更改月份集合
        //     year: 2023
        //   },
        //   {
        //     month: [5, 9, 11],
        //     no_change_month: [],
        //     year: 2024
        //   }
        // ]
        // 初始化时间，比如2023年1-12月份
        this.addYearList = [this.currentYear - 2, this.currentYear - 1, this.currentYear, this.currentYear + 1]
        if (!data.list || data.list.length <= 0) {
          this.timeList.push({
            year: this.currentYear,
            monthlist: Array(12).fill(0).map((_, i) => {
              return {
                value: i + 1,
                check: false, // 是否选中
                unchange: false// 是否不可修改,默认为false可以修改
              }
            })
          })
        } else {
          this.defaultYearlist = JSON.parse(JSON.stringify(data.list)) // 保存初始年月
          // 回填
          data.list.forEach(f => {
            this.timeList.push({
              year: f.year,
              monthlist: Array(12).fill(0).map((_, i) => {
                return {
                  value: i + 1,
                  check: (f.month || []).includes(i + 1), // 是否已被选中
                  unchange: (f.no_change_month || []).includes(i + 1) || !this.addYearList.includes(f.year) // 是否不可修改
                }
              })
            })
          })
        }
      }
    },
    // 点位上面操作
    addPoint () {
      // project/pay/add-point
    },
    delPoint (row) {
      this.$confirm('确定删除吗?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {
        const params = {
          pay_point_code: row.pay_point_code,
          pay_id: row.pay_id
        }
        const { code, message } = await this.$pub.post('project/pay/del-point', params)
        if (code === 200) {
          this.getPoints()
          this.$message({
            type: 'success',
            message: message || '删除成功',
            showClose: true
          })
        } else {
          this.$message({
            type: 'error',
            message: message || '删除失败',
            showClose: true
          })
        }
      }).catch(() => {
        this.$message({
          type: 'info',
          message: '已取消删除',
          showClose: true
        })
      })
    },
    // 工序上面操作
    canclePay (row) {
      this.active = { ...this.active, ...row, remark: '' }// 覆盖掉前一个点击的工序步骤，这样每次交互后还是当前付款/取消 的工序
      const params = {
        pay_id: this.current.id,
        pay_point_code: this.active.pay_point_code,
        proc_code: row.procCode
      }
      this.$confirm('确定取消当前工序的付款记录吗?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {
        this.loading = true
        const { code, message } = await this.$pub.post('project/pay/del-detail', params)
        if (code === 200) {
          this.$message({
            type: 'success',
            message: message || '取消付款成功',
            showClose: true
          })
          this.getPoints()
          this.getProcList()// 当前点位下工序列表
        } else {
          this.$message({
            type: 'error',
            message: message || '取消付款失败',
            showClose: true
          })
        }
        this.loading = false
      }).catch(() => {
        this.loading = false
      })
    },
    async surePay (row) {
      this.active = { ...this.active, ...row }
      this.payFlag = true
      // this.$prompt('本次付款备注', '提示', {
      //   confirmButtonText: '确定',
      //   cancelButtonText: '取消',
      //   type: 'warning'
      // }).then(({ value }) => {
      //   payFn(row, value)
      // }).catch(() => {
      //   this.loading = false
      // })
    },
    async payFn () {
      let pay_month = []
      if (this.current.pay_type === 2) {
        pay_month = this.submitTime()
        if (pay_month.length <= 0) {
          return
        }
      }
      this.active.remark = this.pay_remark// 覆盖掉前一个点击的工序步骤，这样每次交互后还是当前付款/取消 的工序
      this.submitloading = true
      const params = {
        pay_id: this.current.id,
        pay_point_code: this.active.pay_point_code,
        proc_code: this.active.procCode,
        remark: this.pay_remark,
        pay_month: JSON.stringify(pay_month)
      }

      const { code, message } = await this.$pub.post('project/pay/add-detail', params)

      if (code !== 200) {
        this.pay_remark = ''
        return this.$message({
          type: 'error',
          message: message || '工序添加付款记录失败',
          showClose: true
        })
      }
      this.getPoints()
      this.getProcList()// 当前点位下工序列表
      this.submitloading = false
      this.cancleFn()
    },
    cancleFn () {
      this.payFlag = false
      this.pay_remark = ''
    },
    selectMonth (year, mon) {
      if (year && !mon.unchange) {
        mon.check = !mon.check
      }
    },
    // 新增一条年份月份
    addTime (year) {
      const temp = this.defaultYearlist.find(f => f.year === year)
      console.log(temp)
      this.timeList.push({
        year: year,
        monthlist: Array(12).fill(0).map((_, i) => {
          const mon = i + 1
          const obj = {}
          if (temp) {
            obj.check = (temp.month || []).includes(mon)
            obj.unchange = (temp.no_change_month || []).includes(mon)
          } else {
            obj.check = false
            obj.unchange = false
          }
          obj.value = mon
          return obj
        })
      })
    },
    // 选中年份保留接口交互时的初始数据
    // selectYear (val) {
    //   const temp = this.defaultYearlist.find(f => f.year === val)
    //   this.timeList.forEach(f => {
    //     if (f.year === val) {
    //       f.monthlist.forEach(m => {
    //         if (temp) {
    //           m.check = (temp.month || []).includes(m.value)
    //           m.unchange = (temp.no_change_month || []).includes(m.value)
    //         } else {
    //           m.check = false
    //           m.unchange = false
    //         }
    //       })
    //     }
    //   })
    // },
    // 删除一条年份月份
    delTime (index) {
      this.timeList = this.timeList.filter((f, i) => i !== index)
    },
    // 下拉框清除年份同时清除本次已选月份
    clearYear (year) {
      year.monthlist.forEach(f => {
        f.check = false
        f.unchange = false
      })
    },
    // 提交年月选择
    submitTime () {
      // 每个年份下过滤出来的check有一个为true，就可以提交
      const selectArr = this.timeList.filter(f => f.monthlist.filter(m => (m.check || m.unchange)).length > 0)
      if (selectArr.length === this.timeList.length) {
        const temp = []
        this.timeList.forEach(f => {
          temp.push({
            year: f.year,
            month: f.monthlist.filter(m => m.check).map(m => m.value)
          })
        })
        return temp
      } else {
        this.$message({
          type: 'error',
          message: '年份月份必选',
          showClose: true
        })
        return []
      }
    },
    // 已付款的工序，确定取消年月选择
    async curecancleYear () {
      const temp = []
      this.timeList.forEach(f => {
        temp.push({
          year: f.year,
          month: f.monthlist.filter(m => m.check).map(m => m.value)
        })
      })
      this.submitloading = true
      const params = {
        pay_id: this.current.id,
        pay_point_code: this.active.pay_point_code,
        proc_code: this.active.procCode,
        remark: this.pay_remark,
        pay_month: JSON.stringify(temp)
      }

      const { code, message } = await this.$pub.post('project/pay/edit-detail', params)

      if (code !== 200) {
        return this.$message({
          type: 'error',
          message: message || '付款年月取消记录失败',
          showClose: true
        })
      }
      this.getPoints()
      this.getProcList()// 当前点位下工序列表
      this.submitloading = false
    }
  },
  beforeDestroy () {
    document.removeEventListener('keydown', this.handleKeyup)
  }
}
</script>

<style lang="scss">
.payment_maintain {
  .el-drawer__header {
    margin-bottom: 20px;
  }

  .el-drawer__body {
    height: calc(100% - 50px);
  }

  .wrap {
    height: 100%;
    width: 100%;

    .title {
      position: absolute;
      top: 20px;
      left: 20px;
      color: #72767b;

      // width:100%;
      .remark {
        width: 1200px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        margin-top: 10px;
      }
    }

    .content {
      display: flex;
      justify-content: space-between;
      height: calc(100% - 20px);
      padding: 20px 20px 0;
      box-sizing: border-box;
    }
  }

  ._left {
    width: 220px;
    border: 1px solid #DCDFE6;
    height: 100%;
    overflow: hidden;
    box-sizing: border-box;

    .isActive_tree_item {
      background-color: #F5F7FA !important;
    }

    .isKeyUp_active {
      background-color: #f2f8d9 !important;
    }

    ul {
      height: calc(100% - 40px);
      overflow-y: auto;
    }

    .el-input__icon {
      cursor: pointer;
    }
  }

  ._right {
    width: calc(100% - 220px);
    height: 100%;
    display: flex;
    justify-content: space-between;

    .proc {
      width: 340px;
      height: 100%;
      border: 1px solid #DCDFE6;
      overflow: auto;
      font-size: 16px;
      color: #000;
      margin: 0 20px;

      .el-tree-node__content {
        height: 36px;
      }

      .isActive_tree_item {
        background-color: #F5F7FA !important;
      }
    }

    .info {
      width: calc(100% - 360px);
      height: 100%;
      border: 1px solid #DCDFE6;
      overflow: auto;
      font-size: 16px;
      color: #000;

      .seltime {
        position: relative;
        margin-top: 10px;

        .row {
          h4 {
            line-height: 28px;
          }

          .year {
            margin-right: 4px;

            .el-input__inner {
              font-size: 16px;
              color: #303133;
              font-weight: bold;
            }
          }

          .el-button {
            border-radius: 50% !important;
          }

          .mon {
            cursor: not-allowed;
            border-right: 1px solid #999;
            border-top: 1px solid #999;
            margin: 10px 0;

            .el-col {
              padding: 10px;
              text-align: center;
              border-left: 1px solid #999;
              border-bottom: 1px solid #999;
            }
          }

          .yesYear.mon {
            cursor: pointer;

            .el-col {
              padding: 10px;
              text-align: center;
              border-left: 1px solid #999;
              border-bottom: 1px solid #999;

              // &:hover {
              //   background: hsla(210, 100%, 63%, 0.274);
              //   color: #409eff;
              // }
            }

            .bluemonth {
              background: #409eff;
              color: #fff;
            }

            .redmonth {
              background: #D9001B;
              color: #fff;
              cursor: not-allowed;
            }
          }

          .el-select {
            margin-top: 20px;
          }
        }

        .subbtn {
          position: absolute;
          right: 20px;
          top: 20px;
        }
      }
    }
  }

  ._left {
    .el-button {
      width: 100%;
      padding: 12px 0;
    }

    .inp {
      border-bottom: 1px solid #DCDFE6;
      position: relative;

      .el-input__inner {
        border: 0;
      }

      .check {
        position: absolute;
        top: 50%;
        right: 10px;
        transform: translateY(-50%);
      }

      .el-input--prefix .el-input__inner {
        padding-right: 4px;
      }
    }

    .point {
      .item {
        position: relative;
        height: 50px;

        .code {
          display: inline-block;
          width: calc(100% - 10px);
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
      }

      line-height:50px;
      border-bottom:1px solid #DCDFE6;
      white-space: nowrap;
      text-overflow: ellipsis;
      overflow: hidden;
      word-break: break-all;
      padding-left:10px;
      cursor: pointer;

      &:hover {
        background: #F5F7FA;
      }

      .del {
        position: absolute;
        top: -20px;
        right: -20px;
        line-height: 0px;
        width: 40px;
        height: 40px;
        border-radius: 50%;
        background: #409eff;
        font-size: 12px;

        .el-icon-delete {
          position: absolute;
          top: 22px;
          right: 22px;
          color: #fff;
        }
      }
    }

    .keyword-lighten {
      color: #000;
      background-color: #ff0;
    }

    .ispointActive {
      color: #fff;
      background-color: #409eff !important;
    }

    .empty {
      text-align: center;
      color: #909399;
      height: 100%;
      display: flex;
      flex-direction: column;
      justify-content: center;
      font-size: 14px;
      margin-top: -25px;
    }
  }

  ._right {
    .info {
      position: relative;
      padding: 10px;
      box-sizing: border-box;

      .payment_log {
        margin-top: 20px;

        h2 {
          padding-bottom: 4px;
          // border-bottom:2px solid #000;
          // margin-bottom:10px;
          font-size: 16px;
          color: #409eff;
        }

        .remark {
          font-size: 14px;
          color: #909399;
          padding: 20px;
          display: block;
          width: 100%;
          min-height: 60px;
          border: 1px solid #ebeef5;
          box-sizing: border-box;
        }
      }
    }

    .nodata {
      position: absolute;
      left: 50%;
      top: 50%;
      transform: translate(-50%, -50%);
      color: #909399;
      font-size: 14px;
    }
  }

  // 滚动条一致
  ._left ul::-webkit-scrollbar,
  .info::-webkit-scrollbar {
    width: 8px;
    height: 2px;
  }

  ._left ul::-webkit-scrollbar-thumb,
  .info::-webkit-scrollbar-thumb {
    border-radius: 4px;
    box-shadow: inset 0 0 5px rgba(112, 110, 110, 0.2);
    background: rgba(144, 147, 153, 0.3);
  }

  ._left ul::-webkit-scrollbar-track,
  .info::-webkit-scrollbar-track {
    box-shadow: inset 0 0 5px rgba(235, 225, 225, 0.8);
    border-radius: 10px;
    background: #f7f5f5;
  }

  .shou {
    i {
      transform: rotate(90deg);
    }
  }

  .custom-tree-node {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding-right: 8px;
  }

  .isRed {
    color: #D9001B;
    font-weight: 700;
  }

  .isBlue {
    color: #02A7F1;
    font-weight: 700;
  }
}
</style>
