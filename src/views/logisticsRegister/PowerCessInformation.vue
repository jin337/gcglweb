<!-- 取电信息 -->
<template>
  <div class="LinkInformation power_cess" >
    <div class="_top" v-if="isEdit && point">
      <h4>取电信息</h4>
      <svg-icon v-hasPermi="['PowerCessInformation:opear']"   icon-class="icon_add" style="margin-left:10px;"  @click="addData" class="opear__icon" />
    </div>

    <div class="content" v-if="list.length>0 && isEdit">
      <el-card :class="{'box-item':true,isAdd: !item.id}" v-for="(item,i) in list" :key="item.id" v-loading="item.loading">
        <div class='btns'>
          <svg-icon v-hasPermi="['PowerCessInformation:opear']" v-if="item.edit" icon-class="icon_save"  @click="saveData(item,i)" class="opear__icon" />
          <svg-icon v-hasPermi="['PowerCessInformation:opear']" v-if="item.edit" icon-class="icon_cancle"  @click="cancleData(item,i)" class="opear__icon" />
          <svg-icon v-hasPermi="['PowerCessInformation:opear']" v-if="!item.edit" icon-class="icon_edit"  @click="editData(item)" class="opear__icon" />
          <svg-icon v-hasPermi="['PowerCessInformation:opear']" v-if="!item.edit" icon-class="icon_del"  @click="delData(item)" class="opear__icon" />
        </div>
        <el-form  :model="item" :inline="true" label-width="100px" :ref="'form'+ i"  :rules="getRules(item,i)" size="mini">
          <el-form-item label="取电类型" prop="power_type">
            <el-select
              v-model="item.power_type"
              placeholder="请选择"
              :disabled="!item.edit"
              size="small"
              @change="validatefn(item,i)"
            >
              <el-option
                v-for="item in power_typeList"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              >
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="取电状态" prop="power_status">
            <el-select
              v-model="item.power_status"
              placeholder="请选择"
              :disabled="!item.edit"
              size="small"
            >
              <el-option
                v-for="item in power_statusList"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              >
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="合同号" prop="contract_code" >
            <el-input
              v-model="item.contract_code"
              placeholder="请输入合同号"
              :disabled="!item.edit"
              size="small"></el-input>
          </el-form-item>
          <el-form-item label="开户号" prop="account" >
            <el-input
              v-model="item.account"
              placeholder="请输入开户号"
              :disabled="!item.edit"
              size="small"></el-input>
          </el-form-item>
          <el-form-item label="表具号" prop="watch_code" >
            <el-input
              v-model="item.watch_code"
              placeholder="请输入表具号"
              :disabled="!item.edit"
              size="small"></el-input>
          </el-form-item>
          <el-form-item label="表上施工单位" prop="watch_upper_dept">
            <treeselect
              style="width:100%"
              v-model="item.watch_upper_dept"
              :normalizer="normalizer"
              placeholder="输入搜索词查询表上施工单位"
              noOptionsText="输入搜索词查询表上施工单位"
              searchPromptText="输入搜索词查询表上施工单位"
              noResultsText="没有含搜索词的部门"
              :options="deptOptions"
              :flatten-search-results="true"
              :disabled="!item.edit"
              />
          </el-form-item>
          <el-form-item label="表下施工单位" style="width:100%;" prop="watch_down_dept">
            <treeselect
              style="width:100%"
              v-model="item.watch_down_dept"
              :normalizer="normalizer"
              placeholder="输入搜索词查询表下施工单位"
              noOptionsText="输入搜索词查询表下施工单位"
              searchPromptText="输入搜索词查询表下施工单位"
              noResultsText="没有含搜索词的部门"
              :options="deptOptions"
              :flatten-search-results="true"
              :disabled="!item.edit"
              :multiple="true"
              :flat="true"
              @input="validatefn(item,i)"
              />
          </el-form-item>
          <el-form-item label="备注" style="width:100%;">
            <el-input :disabled="!item.edit" v-model="item.remark" type="textarea" placeholder="请输入取电信息备注" />
          </el-form-item>
        </el-form>
      </el-card>
    </div>

    <div class="content"  v-else-if="list.length>0 && !isEdit">
      <el-descriptions :column="1" size="mini" border v-for="item in list" :key="item.id" class="box-item">
        <el-descriptions-item label="取电状态" >{{item.power_status_name?item.power_status_name:'/'}}</el-descriptions-item>
        <el-descriptions-item label="取电类型" >{{item.power_status_name?item.power_status_name:'/'}}</el-descriptions-item>
        <el-descriptions-item label="合同号">{{item.contract_code?item.contract_code:'/'}}</el-descriptions-item>
        <el-descriptions-item label="开户号">{{item.account?item.account:'/'}}</el-descriptions-item>
        <el-descriptions-item label="表具号">{{item.watch_code?item.watch_code:'/'}}</el-descriptions-item>
        <el-descriptions-item label="表上施工单位">{{item.watch_upper_dept_name?item.watch_upper_dept_name:'/'}}</el-descriptions-item>
        <el-descriptions-item label="表下施工单位">{{item.watch_down_dept?item.watch_down_dept.join(','):'/'}}</el-descriptions-item>
        <el-descriptions-item label="备注">{{item.remark?item.remark:'/'}}</el-descriptions-item>
      </el-descriptions>
    </div>

    <span v-else class="empty-text" >暂无数据</span>
  </div>
</template>

<script>
import Treeselect, { ASYNC_SEARCH } from '@riophae/vue-treeselect'
import '@riophae/vue-treeselect/dist/vue-treeselect.css'
export default {
  name: 'PowerCessInformation',
  props: {
    point: {
      type: [Object, null],
      default: null
    },
    projectCode: {
      type: String,
      default: ''
    },
    isEdit: {
      default: true,
      type: Boolean
    }
  },
  data () {
    return {
      list: [],
      power_statusList: [], // 取电状态
      power_typeList: [],
      normalrules: {
        power_status: [
          { required: true, message: '取电状态必选', trigger: 'change' }
        ],
        power_type: [
          { required: true, message: '取电类型必选', trigger: 'change' }
        ]

      },
      cloneData: {},
      deptOptions: [],
      iscbAsync: false,
      rules: {}
    }
  },
  watch: {
    point: {
      handler(val, oldval) {
        if (!oldval || (val && val.pointCode !== oldval.pointCode)) {
          this.getList()
        } else {
          this.list = []
        }
      },
      deep: true
    }
  },
  created() {
    this.getDictList()
    this.getDep()
  },
  mounted() {
    if (this.point) {
      this.getList()
    }
  },
  components: {
    Treeselect
  },
  methods: {
    getDictList() {
      if (this.isEdit) {
        this.$dict(this, 'power_status').then((res) => {
          if (res.code === 200) {
            this.power_statusList = (res.data || []).map(m => {
              return { ...m, value: Number(m.value) }
            })
          } else {
            this.$message({
              type: 'error',
              message: '出错了字典power_status',
              showClose: true
            })
            this.power_statusList = []
          }
        })
        this.$dict(this, 'power_type').then((res) => {
          if (res.code === 200) {
            this.power_typeList = (res.data || []).map(m => {
              return { ...m, value: Number(m.value) }
            })
          } else {
            this.$message({
              type: 'error',
              message: '出错了字典power_type',
              showClose: true
            })
            this.power_typeList = []
          }
        })
      }
    },
    async getList() {
      const req = {
        point_code: this.point.pointCode,
        project_code: this.projectCode
      }
      const { data, code, message } = await this.$pub.post('point/power/list', req)
      this.$emit('changeLoading')
      if (code === 200) {
        this.list = (data.list || []).map(m => {
          return {
            ...m,
            watch_down_dept: m.watch_down_dept !== '0' ? m.watch_down_dept.split(',').map(m => Number(m)) : [],
            watch_upper_dept: m.watch_upper_dept !== '0' ? m.watch_upper_dept : null,
            value: Number(m.value),
            loading: false,
            edit: false
          }
        })
      } else {
        this.$notify.error({
          title: '查询失败',
          message: message
        })
      }
    },
    treeOpen() {
      this.iscbAsync = true
    },
    // 查询部门列表
    async loadOptions({ action, searchQuery, callback }) {
      if (action === ASYNC_SEARCH) {
        const params = {
          mc: searchQuery.trim()
        }
        let deptOptions = []
        const { data, code, msg } = await this.$pub.post('/sys/dept/list-tree', params)
        if (code !== 200) {
          this.$message({
            type: 'error',
            message: msg || '获取部门出错了',
            showClose: true
          })
          deptOptions = []
        } else {
          deptOptions = Array.isArray(data.dept) ? data.dept : [data.dept]
        }
        callback(null, deptOptions)
      }
    },
    async getDep() {
      if (this.isEdit) {
        const params = {
          mc: ''
        }
        const { data, code, msg } = await this.$pub.post('/sys/dept/list-tree', params)
        if (code !== 200) {
          this.$message({
            type: 'error',
            message: msg || '获取部门出错了',
            showClose: true
          })
          this.deptOptions = []
        } else {
          if (Array.isArray(data.dept)) {
            this.deptOptions = data.dept
          } else {
            this.deptOptions = data.dept.child
          }
        }
      }
    },
    /** 转换菜单数据结构 */
    normalizer (node) {
      if ((node.child && !node.child.length) || node.child === null) {
        delete node.child
      }
      return {
        id: node.id,
        label: node.jc || node.mc, // mc
        children: node.child
      }
    },
    async remoteMethod(query) {
      if (query !== '') {
        this.pointLoading = true
        const params = {
          project_code: this.projectCode,
          keywords: query
        }
        const { data } = await this.$pub.post('/point/search', params)
        this.pointList = data || []
        this.pointLoading = false
      }
    },
    getRules(item, i) {
      let obj = {}
      if (item.power_type === 1) {
        obj = {
          contract_code: [
            { required: true, message: '合同号必填', trigger: 'change' }
          ],
          account: [
            { required: true, message: '开户号必填', trigger: 'change' }
          ],
          watch_code: [
            { required: true, message: '表具号必填', trigger: 'change' }
          ]
        }
      }
      // if (item.watch_down_dept && item.watch_down_dept.length > 0) {
      //   obj = {
      //     ...obj,
      //     watch_upper_dept: [
      //       { required: true, message: '表下施工单位存在同时表上施工单位必选', trigger: 'change' }
      //     ]
      //   }
      // }
      return { ...this.normalrules, ...obj }
    },
    validatefn(item, i) {
      if (this.$refs['form' + i][0]) {
        this.$refs['form' + i][0].clearValidate()
      }
    },
    addData() {
      this.list.unshift({
        loading: false,
        edit: true,
        id: null,
        contract_code: '',
        account: '',
        watch_code: '',
        power_status: null,
        power_type: null,
        watch_upper_dept: null,
        watch_down_dept: [],
        remark: ''
      })
    },
    editData(item) {
      this.cloneData[item.id] = { ...item }
      item.edit = true
    },
    cancleData(item, i) {
      if (this.cloneData[item.id]) {
        item = { ...this.cloneData[item.id] }
        item.edit = false
        this.$set(this.list, i, item)
      } else {
        this.$refs['form' + i][0].validate(async (valid) => {
          if (valid) {
            this.$confirm('数据已填完整确定删除吗?', '提示', {
              confirmButtonText: '确定',
              cancelButtonText: '取消',
              type: 'warning'
            }).then(async () => {
              this.list.splice(i, 1)
            }).catch(() => {
              this.$message({
                type: 'info',
                message: '已取消删除',
                showClose: true
              })
            })
          } else {
            this.list.splice(i, 1)
          }
        })
      }
    },
    saveData(item, i) {
      this.$refs['form' + i][0].validate(async (valid) => {
        if (valid) {
          item.loading = true
          const baseparams = {
            point_code: this.point.pointCode,
            project_code: this.projectCode,
            power_status: item.power_status,
            power_type: item.power_type,
            contract_code: item.contract_code,
            account: item.account,
            watch_code: item.watch_code,
            watch_upper_dept: item.watch_upper_dept ? item.watch_upper_dept + '' : '0',
            watch_down_dept: item.watch_down_dept.length > 0 ? item.watch_down_dept.join(',') : '0',
            remark: item.remark
          }
          const params = item.id ? { ...baseparams, id: item.id } : { ...baseparams }
          const url = item.id ? 'point/power/edit' : 'point/power/add'
          const { data, code, message } = await this.$pub.post(url, params)
          if (code === 200) {
            item.edit = false
            item.id = item.id ? item.id : data
            this.$message({
              type: 'success',
              message: '操作成功',
              showClose: true
            })
          } else {
            this.$notify.error({
              title: '保存失败',
              message: message
            })
          }
          item.loading = false
        }
      })
    },
    delData(item, i) {
      const id = item.id
      this.$confirm('确定删除吗?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {
        if (!id) {
          this.list.splice(i, 1)
        } else {
          const { code, message } = await this.$pub.post('point/power/del', { id })
          if (code === 200) {
            this.getList()
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
        }
      }).catch(() => {
        this.$message({
          type: 'info',
          message: '已取消删除',
          showClose: true
        })
      })
    }
  }
}
</script>

<style  lang="scss">
.power_cess{
  height:calc(100% - 30px);
  padding:10px 0 0 10px;
  box-sizing: border-box;
  ._top{
    display:flex;
    align-items: center;
    margin-top:10px;
    h4{
      line-height: 24px;
    }
  }
  .content{
    height: calc(100% - 32px);
    overflow:auto;
    padding-bottom:10px;
    box-sizing: border-box;
    .el-card{
      overflow:initial;
    }
    .el-card__body{
      padding: 10px 4px;
    }
    .box-item{
      margin-top:20px;
      position: relative;
      .el-form{
          margin-top:30px;
      }
      .el-form-item{
        width:50%;
        margin-right: 0;
       .el-form-item__content{
          width: calc(100% - 110px);
          .el-select,.el-input{
            width:100%;
          }
        }
      }
      .btns{
        position: absolute;
        top:10px;
        right:10px;
      }
      // &:hover{
      //   .btns{
      //     left:0;
      //   }
      // }
      .vue-treeselect__menu {
        max-height:300px!important;
      }
      .vue-treeselect--disabled{
        .vue-treeselect__single-value{
          color: #C0C4CC;
        }
        .vue-treeselect__control{
          background-color: #F5F7FA;
          border-color: #E4E7ED;
        }
        .vue-treeselect__multi-value-item{
          background-color: #F5F7FA;
          border-color: #E4E7ED;
          color: #C0C4CC;
        }
      }
      .vue-treeselect__placeholder, .vue-treeselect__single-value{
        line-height: 30px;
      }
      .vue-treeselect__control{
        height:30px!important;

      }
    }
    .isAdd{
      background: #e4f6f7;
    }
  }
  .opear__icon{
    height:24px;
    width:24px;
    cursor:pointer;
    color:#707070;
    margin-right:6px;
    &:hover{
      transform: scale(1.1);
    }
  }
  .empty-text{
    height: calc(100% - 32px);
    width: 100%;
    color: #909399;
    display:flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
  }
  .box-item{
    .el-descriptions-item__label.is-bordered-label{
      width:108px;
    }
  }
}
</style>
