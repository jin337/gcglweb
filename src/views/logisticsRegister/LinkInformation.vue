<!-- 链路信息 -->
<template>
  <div class="LinkInformation">
    <div class="_top" v-if="isEdit && point">
      <h4 >链路信息</h4>
      <svg-icon v-hasPermi="['LinkInformation:opear']"   icon-class="icon_add" style="margin-left:10px;"  @click="addData" class="opear__icon" />
    </div>

    <div class="content" v-if="list.length>0 && isEdit">
      <el-card :class="{'box-item':true,isAdd: !item.id}" v-for="(item,i) in list" :key="item.id" v-loading="item.loading">
        <div class='btns'>
          <svg-icon v-hasPermi="['LinkInformation:opear']" v-if="item.edit" icon-class="icon_save"  @click="saveData(item,i)" class="opear__icon" />
          <svg-icon v-hasPermi="['LinkInformation:opear']" v-if="item.edit" icon-class="icon_cancle"  @click="cancleData(item,i)" class="opear__icon" />
          <svg-icon v-hasPermi="['LinkInformation:opear']" v-if="!item.edit" icon-class="icon_edit"  @click="editData(item)" class="opear__icon" />
          <svg-icon v-hasPermi="['LinkInformation:opear']" v-if="!item.edit" icon-class="icon_del"  @click="delData(item)" class="opear__icon" />
        </div>
        <el-form  :model="item" :inline="true" label-width="92px" :ref="'form'+ i"  :rules="rules" size="small">
          <el-form-item label="运营商名称" prop="operator_id"  >
            <el-select
              v-model="item.operator_id"
              placeholder="请选择"
              size="small"
              :disabled="!item.edit"
            >
              <el-option
                v-for="item in isp_typeList"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              >
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="接入状态" prop="operator_status">
            <el-select
              v-model="item.operator_status"
              placeholder="请选择"
              :disabled="!item.edit"
              size="small"
            >
              <el-option
                v-for="item in operator_statusList"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              >
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="链路属性" prop="link_properties">
            <el-select
              v-model="item.link_properties"
              placeholder="请选择"
              :disabled="!item.edit"
              size="small"
            >
              <el-option
                v-for="item in link_propertiesList"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              >
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="施工部门" >
            <treeselect
              style="width:100%"
              v-model="item.oper_dept_id"
              :normalizer="normalizer"
              placeholder="输入搜索词查询施工部门"
              noOptionsText="输入搜索词查询施工部门"
              searchPromptText="输入搜索词查询施工部门"
              noResultsText="没有含搜索词的部门"
              :options="deptOptions"
              :disabled="!item.edit"
              :flatten-search-results="true"
              />
                            <!-- :async="iscbAsync"
              :load-options="iscbAsync ? loadOptions : null"
              @open="treeOpen" -->
          </el-form-item>
          <el-form-item label="接入号" prop="access_number"  class="numwrap" label-width="92px" >
            <el-input
              v-model="item.access_number"
              placeholder="请输入"
              :disabled="!item.edit"
              size="small"></el-input>
          </el-form-item>
          <el-form-item label="关联点位">
            <el-select
              v-model="item.sup_point_code"
              placeholder="请选择"
              filterable
              remote
              :remote-method="remoteMethod"
              :loading="pointLoading"
              :disabled="!item.edit"
            >
              <el-option v-for="poi in pointList" :key="poi.point_code"  :value="poi.point_code" :label="poi.point_code">
                <span style="float: left">{{ poi.point_name }}</span>
                <span style="float: right; color: #8492a6; font-size: 13px">{{ poi.point_code }}</span>
              </el-option>
            </el-select>
          </el-form-item>

          <el-form-item label="备注" style="width:100%;">
            <el-input :disabled="!item.edit" v-model="item.remark" type="textarea" placeholder="请输入链路信息备注" />
          </el-form-item>
        </el-form>
      </el-card>
    </div>

    <div class="content" v-else-if="list.length>0 && !isEdit">
      <el-descriptions :column="1" size="mini" border v-for="item in list" :key="item.id" class="box-item">
        <el-descriptions-item label="运营商名称">{{item.operator_name?item.operator_name:'/'}}</el-descriptions-item>
        <el-descriptions-item label="接入号">{{item.access_number?item.access_number:'/'}}</el-descriptions-item>
        <el-descriptions-item label="接入状态" >{{item.operator_status_name?item.operator_status_name:'/'}}</el-descriptions-item>
        <el-descriptions-item label="链路属性" >{{item.link_properties_name?item.link_properties_name:'/'}}</el-descriptions-item>
        <el-descriptions-item label="关联点位" >{{item.sup_point_code?item.sup_point_code:'/'}}</el-descriptions-item>
        <el-descriptions-item label="施工部门" >{{item.oper_dept_name?item.oper_dept_name:'/'}}</el-descriptions-item>
        <el-descriptions-item label="备注">{{item.remark?item.remark:'/'}}</el-descriptions-item>
      </el-descriptions>
    </div>
    <span v-else class="empty-text">暂无数据</span>
  </div>
</template>

<script>
import Treeselect, { ASYNC_SEARCH } from '@riophae/vue-treeselect'
import '@riophae/vue-treeselect/dist/vue-treeselect.css'
export default {
  name: 'LinkInformation',
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
  data () {
    const validateAccess_number = (rule, value, callback) => {
      if (value && /[^a-zA-Z0-9]+/.test(value)) {
        callback(new Error('格式不正确'))
      } else {
        callback()
      }
    }
    return {
      list: [],
      isp_typeList: [], // 运营商
      operator_statusList: [], // 接入状态
      link_propertiesList: [], // 链路属性
      rules: {
        operator_id: [
          { required: true, message: '运营商名称必选', trigger: 'change' }
        ],
        access_number: [
          { validator: validateAccess_number, trigger: 'change' }
        ],
        operator_status: [
          { required: true, message: '接入状态必选', trigger: 'change' }
        ],
        link_properties: [
          { required: true, message: '链路属性必选', trigger: 'change' }
        ]
      },
      cloneData: {},
      deptOptions: [],
      iscbAsync: false,
      pointLoading: false,
      pointList: []
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
        const arrs = ['isp_type', 'operator_status', 'link_properties']
        arrs.forEach(f => {
          this.$dict(this, f).then((res) => {
            const _name = f + 'List'
            if (res.code === 200) {
              this[_name] = (res.data || []).map(m => {
                return { ...m, value: Number(m.value) }
              })
            } else {
              this.$message({
                type: 'error',
                message: '出错了字典' + f,
                showClose: true
              })
              this[_name] = []
            }
          })
        })
      }
    },
    async getList() {
      const req = {
        point_code: this.point.pointCode,
        project_code: this.projectCode
      }
      const { data, code, message } = await this.$pub.post('point/operator/list', req)
      this.$emit('changeLoading')
      if (code === 200) {
        this.list = (data.list || []).map(m => {
          return {
            ...m,
            loading: false,
            edit: false,
            oper_dept_id: m.oper_dept_id !== '0' ? m.oper_dept_id : null
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
    addData() {
      this.list.unshift({
        loading: false,
        edit: true,
        id: null,
        operator_id: '',
        access_number: '',
        operator_status: '',
        link_properties: '',
        remark: '',
        oper_dept_id: null, // 施工部门
        sup_point_code: null // 关联点位
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
            operator_id: item.operator_id,
            access_number: item.access_number,
            operator_status: item.operator_status,
            link_properties: item.link_properties,
            remark: item.remark,
            oper_dept_id: item.oper_dept_id ? item.oper_dept_id + '' : '0', // 施工部门
            sup_point_code: item.sup_point_code // 关联点位
          }
          const params = item.id ? { ...baseparams, id: item.id } : { ...baseparams }
          const url = item.id ? 'point/operator/edit' : 'point/operator/add'
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
          const { code, message } = await this.$pub.post('point/operator/del', { id })
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
.LinkInformation{
  height:calc(100% - 30px);
  padding:10px 0 0 10px;
  box-sizing: border-box;
  ._top{
    display:flex;
    align-items: center;
    position: relative;
    margin-top:10px;
    h4{
      line-height: 24px;
    }
    .add{
      position: absolute;
      right:10px;
      top:-40px;
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
      padding: 10px 6px;
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
          width: calc(100% - 102px);
          .el-select,.el-input{
            width:100%;
          }
        }
      }
      .numwrap{
        // width:22%;
        // .el-form-item__content{
        //    width: calc(100% - 72px);
        // }
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
    min-height:120px;
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
