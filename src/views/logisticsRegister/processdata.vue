<template>
  <div class="processdata">
    <el-form class="searchwrap" size="small" label-position="right"  label-width="68px" >
      <el-form-item label="项目" >
        <el-select style="width: 100%" v-model="form.project" placeholder="请选择" @change="handleProjectChange" value-key="id">
          <el-option v-for="item in projectList" :key="item.projectCode" :label="item.projectName" :value="item" ></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="点位">
        <el-input  v-model="form.pointCode" placeholder="请输入点位编号或名称" @input="inputChangePoint"></el-input>
      </el-form-item>
      <el-form-item label="工序">
        <el-cascader
          v-model="form.procvalue"
          :options="procLists"
          :props="{ multiple: true }"
          size="small"
          filterable
        ></el-cascader>
      </el-form-item>
      <el-form-item label="标签">
          <el-select
            v-model="form.tag"
            style="width:100%"
            clearable
            placeholder="请选择标签"
            @change="handleSelectChange"
          >
            <el-option
              v-for="item in tagList"
              :key="item"
              :label="item"
              :value="item"
            >
            </el-option>
          </el-select>
      </el-form-item>
      <el-form-item label="子系统">
          <el-select
            v-model="form.child"
            style="width:100%"
            clearable
            placeholder="请选择子系统"
            multiple
            collapse-tags
            @change="handleSelectChange"
          >
            <el-option
              v-for="item in childList"
              :key="item.key"
              :label="item.value"
              :value="item.key"
            >
            </el-option>
          </el-select>
      </el-form-item>
      <el-form-item label="区域">
          <el-select
            v-model="form.area"
            style="width:100%"
            clearable
            placeholder="请选择区域"
            multiple
            collapse-tags
            @change="handleSelectChange"
          >
            <el-option
              v-for="item in areaList"
              :key="item"
              :label="item"
              :value="item"
            >
            </el-option>
          </el-select>
      </el-form-item>
      <el-form-item label="施工单位">
          <el-select
            v-model="form.dept_id"
            clearable
            collapse-tags
            style="width:100%"
            placeholder="默认施工单位"
            @change="handleSelectChange"
          >
            <el-option
              v-for="item in BuilderList"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            >
            </el-option>
          </el-select>
      </el-form-item>
      <el-form-item label="拍照日期">
        <el-date-picker
          v-model="form.phototime"
          @change="handleSelectChange"
          type="daterange"
          placeholder="选择拍照日期"
          style="width:100%"
          range-separator="至"
          start-placeholder="开始日期"
          value-format="yyyy-MM-dd"
          end-placeholder="结束日期">
        </el-date-picker>
      </el-form-item>
      <el-form-item label="图片状态">
        <el-select  v-model="form.hasNew" style="width:100%" @change="handleSelectChange">
          <el-option v-for="item in hasNewList"  :value="item.dict_value" :label="item.dict_label" :key="item.dict_value">
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="物料状态">
        <el-radio-group  v-model="form.deviceAudit"  @change="handleSelectChange">
          <el-radio v-for="item in deviceAuditList" :label="item.dict_value" :key="item.dict_value">
            {{item.dict_label}}
          </el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item label-width="0">
        <el-button type="primary" style="width:100%;" @click="getList">查询</el-button>
      </el-form-item>
    </el-form>
    <div class="datawrap">
      <!-- 列表table -->
      <el-table :data="tableData" :height="tableHeight" v-loading="loading" style="width: 100%">
        <el-table-column prop="point_code" label="点位编码" min-width="120px"></el-table-column>
        <el-table-column  prop="point_name" label="点位名称" min-width="220px"></el-table-column>
        <el-table-column prop="lng_lat" label="经纬度" width="280px" > </el-table-column>
        <el-table-column  prop="distance" label="点位偏离" align="center" width="100px"></el-table-column>
        <el-table-column  prop="relation_count" label="方向数" width="80px" align="center"> </el-table-column>
        <el-table-column  prop="child_name" label="子系统" min-width="120px"></el-table-column>
        <el-table-column  prop="area" label="区域" min-width="100px" align="center"> </el-table-column>
        <el-table-column  prop="origin" label="来源" align="center" min-width="120px"></el-table-column>
        <el-table-column  prop="status" label="状态" align="center" min-width="120px">
          <template slot-scope="scope">
            <span>{{scope.row.status}}</span>
          </template>
        </el-table-column>
      </el-table>
      <div class="pagination" style="display:flex;justify-content:space-between;">
        <span  style="color:#999;font-size:14px;">共 {{total}} 条记录</span>
        <el-pagination
          layout="prev, pager, next,sizes"
          :total="total"
          :page-size.sync="page.page_size"
          @current-change="pageChange"
          @size-change="sizeChange"
          :current-page.sync="page.page_no"
          class="pagination"
          small
          background
        >
        </el-pagination>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'processdata',
  data() {
    return {
      loading: false,
      form: {
        project: '',
        id: '',
        projectCode: '',
        pointCode: '',
        procvalue: [],
        tag: '',
        hasNew: -1,
        deviceAudit: 0,
        dept_id: '',
        begin_time: '',
        end_time: '',
        area: null,
        child: null,
        phototime: null
      },
      projectList: [],
      procLists: [],
      tagList: [],
      pointList: [],
      BuilderList: [],
      childList: [],
      areaList: [],
      tableData: [],
      total: 0,
      page: {
        page_no: 0,
        page_size: 10
      },
      hasNewList: [
        { dict_label: '全部', dict_value: -1 }, { dict_label: '初审通过', dict_value: 1 },
        { dict_label: '终审通过', dict_value: 3 }, { dict_label: '终审未通过', dict_value: 4 }
      ],
      deviceAuditList: [
        { dict_label: '全部', dict_value: 0, count: 0 }, { dict_label: '未审核', dict_value: 1, count: 0 }
      ],
      timer: null,
      tableHeight: 600
    }
  },
  mounted() {
    this.getTableHeight()
    window.addEventListener('resize', () => this.getTableHeight())

    this.getProjectsList()
  },
  methods: {
    handleProjectChange(val) {
      if (val) {
        this.form.projectCode = val.projectCode
        this.form.id = val.id
        this.form.pointCode = ''
        this.resetQuery()
        this.getProcList()
        this.handleSelectChange()
      }
    },
    getTableHeight() {
      this.$nextTick(() => {
        const elleft_wrap = document.getElementsByClassName('datawrap')[0]
        if (elleft_wrap) {
          const pagination = elleft_wrap.getElementsByClassName('pagination')[0]
          this.tableHeight = elleft_wrap.offsetHeight - pagination.offsetHeight
        }

        // 获取回到顶部距离右侧定位
        const el = document.getElementsByClassName('clover_right_tab')[0]
        if (el) {
          this.topRight = el.offsetWidth + 60
        }
      })
    },
    async getProjectsList() {
      const params = {
        user_id: this.$store.state.userInfo.id
      }
      const { data, code, message } = await this.$pub.post('/project/project-list-by-user', params)
      if (code === 200 && data !== null) {
        this.projectList = data
      } else {
        this.$notify.error({
          title: '查询失败',
          message: message
        })
      }
    },
    async getProcList() {
      try {
        const params = {
          project_code: this.form.projectCode,
          point_code: ''
        }
        const { code, data, message } = await this.$pub.post('/point/proc/list-design', params)
        if (code === 200) {
          var tmparr = [];
          (data || []).map((item, index) => {
            var childs = []
            childs = this.getnextdata(item)
            var tmpobj = {
              value: item.classCode,
              label: item.className,
              children: childs
            }
            tmparr.push(tmpobj)
          })
          this.procLists = tmparr
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
    getnextdata(value) {
      var childs = []
      // 添加具体工序
      if (value.procList !== null && value.procList !== undefined) {
        value.procList.map((citem, cindex) => {
          childs.push({ value: citem.procCode, label: citem.procName })
        })
      }
      return childs
    },
    async getChildList() {
      try {
        const { data, code, message } = await this.$pub.post('project/child-list', { project_id: this.form.id })
        if (code === 200) {
          this.childList = data || []
        } else {
          this.childList = []
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
    async getAreaList() {
      try {
        var req = {
          project_code: this.form.projectCode
        }
        const { data, code, message } = await this.$pub.post('/point/manage/area-list', req)
        if (code === 200) {
          this.areaList = data || []
        } else {
          this.$notify.error({
            title: '查询失败',
            message: message
          })
          this.areaList = []
        }
      } catch (e) {
        this.$notify.error({
          title: '服务器请求失败',
          message: e.message
        })
      }
    },
    async getTagList() {
      const params = {
        projectCode: this.form.projectCode
      }
      const { data, code, message } = await this.$pub.post('/point/get-tag-list', params)
      if (code === 200) {
        this.tagList = data || []
      } else {
        this.tagList = []
        this.$message({
          type: 'error',
          message: message || '获取标签出错了',
          showClose: true
        })
      }
    },
    async getBuilderList() {
      var req = {
        project_code: this.form.projectCode
      }
      const result = await this.$pub.post('/rate/builder-dept-list', req)
      if (Number(result.code) === 200) {
        if (result.data !== null) {
          this.BuilderList = result.data
        }
      } else {
        this.$notify.error({
          title: '施工单位查询失败',
          message: result.message
        })
      }
    },
    // 清空重置
    resetQuery() {
      this.page.page_no = 1
      this.total = 0
      this.tableData = []
      this.tagList = []
      this.childList = []
      this.areaList = []
      this.BuilderList = []

      this.form.dept_id = ''
      this.form.tag = ''
      this.form.child = null
      this.form.area = null
      this.form.phototime = null
      this.tableData = []

      this.getTagList()
      this.getBuilderList()
      this.getChildList()
      this.getAreaList()
    },
    // 项目 施工单位 拍照日期 状态 区域 子系统 标签 改变
    handleSelectChange() {
      if (!this.form.projectCode) {
        this.$message({
          type: 'error',
          message: '请选择项目',
          showClose: true
        })
        this.form.pointCode = ''
      }
    },
    // 点位编号或名称改变
    inputChangePoint() {
      if (this.timer) {
        clearTimeout(this.timer)
      }
      const self = this
      this.timer = setTimeout(function () {
        self.timer = null
        self.handleSelectChange()
      }, 500)
    },
    getList() {
      let tempArr = []
      this.form.procvalue.forEach(f => {
        tempArr = tempArr.concat(f)
      })
      tempArr = [...new Set(tempArr)]
      console.log(tempArr)
    },
    pageChange(num) {
      this.page.page_no = num
      this.getList()
    },
    sizeChange(val) {
      this.page.page_size = val
      this.getList()
    }
  }
}
</script>

<style lang="scss">
.processdata{
  padding:20px;
  box-sizing: border-box;
  width:100%;
  .searchwrap{
    padding-right:20px;
    display:inline-block;
    width:300px;
    height:100%;
    border-bottom: 1px solid #ededed;
    border-right: 1px solid #ededed;
    box-sizing: border-box;
    vertical-align: top;
    overflow: auto;
  }
  .datawrap{
    display:inline-block;
    width:calc(100% - 320px);
    height:100%;
    box-sizing: border-box;
    vertical-align: top;
    padding-left:20px;
  }
}
</style>
