<template>
  <div class="onlineEquipment">
    <div class="_top">
      <el-select
        v-model="searchstatus"
        placeholder="请选择项目状态"
        value-key="id"
        @change="handleStatusChange"
        clearable
        size="mini"
      >
        <el-option
          v-for="item in statusList"
          :key="item.value"
          :label="item.label"
          :value="item.value"
        >
        </el-option>
      </el-select>
      <el-button @click="refresh"  size="mini" style="margin-left:10px">刷新</el-button>
      <el-button type="primary" @click="add" size="mini" style="float:right;">新增</el-button>
    </div>

    <el-table
      :data="tableData"
      border
      style="width: 100%"
      :row-style="{ height: '30px' }"
      :cell-style="{ padding: '0px' }"
      :height="tableHeight"
      v-loading="tableLoading"
    >
      <af-table-column
        prop="id"
        label="编号"
        align="center"
        width="80px"
      >
      </af-table-column>
      <af-table-column prop="file_name" label="文件名" align="center" width="220px"></af-table-column>
      <el-table-column prop="create_time" label="创建时间" align="center" width="170px">
        <template slot-scope="scope">
          <span>{{ moment(scope.row.create_time).format('YYYY-MM-DD HH:mm:ss') }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="status" label="状态" width="70px" align="center">
        <template slot-scope="scope">
          <span v-if="scope.row.status === 1" style="color: orange">已创建</span>
          <span v-if="scope.row.status === 2" style="color: green">已生成</span>
          <span v-if="scope.row.status === 3" style="color: red">错误</span>
        </template>
      </el-table-column>
      <el-table-column prop="message" label="执行信息" align="center">
      </el-table-column>
      <el-table-column
        prop="query_para"
        label="查询参数"
        align="center"
        style="display: flex; justify-content: space-around;"
        width="100px"
      >
        <template slot-scope="scope">
          <el-tooltip
            effect="dark"
            :content="scope.row.query_para"
            placement="top"
            :enterable="false"
            style="margin-left:8px"
          >
            <span style="border-bottom: 1px solid #719bff">参数</span>
          </el-tooltip>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" width="80px">
        <template slot-scope="scope">
          <a :href="scope.row.ftp_path.substr(0, scope.row.ftp_path.length - 1)" target="_blank" v-if="scope.row.status === 2 && scope.row.ftp_path"  style="border-bottom: 1px solid #719bff ;text-decoration: none;">下载</a>
        </template>
      </el-table-column>
    </el-table>

    <el-dialog title="在线设备新增" width="550px"  :visible.sync="addFlag" class="online_e">
      <el-form ref="addForm" size="small" label-position="right" label-width="78px" :rules="rules" :model="form" v-if="addFlag">
        <el-form-item label="项目" prop="project">
          <el-select
            v-model="form.project"
            placeholder="请选择"
            style="width:100%"
            value-key="id"
            @change="handleProjectChange"
            :disabled="true"
          >
            <el-option
              v-for="item in projects"
              :key="item.id"
              :label="item.projectName"
              :value="item"
            >
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="标签" prop="tagvalue">
          <el-select
            v-model="form.tagvalue"
            multiple
            clearable
            style="width: 100%"
            placeholder="默认所有标签"
            :disabled="true"
          >
            <el-option
              v-for="item in tags"
              :key="item.value"
              :label="item.label"
              :value="item.label"
            >
            </el-option>
          </el-select>
        </el-form-item>
      </el-form>
      <div style="margin-top:30px;padding-bottom:30px;">
        <el-button
          style="float: right;"
          type="primary"
          @click="submit"
          v-loading="submitloading"
        >确认生成</el-button>
      </div>

    </el-dialog>
  </div>
</template>

<script>
import mixin from '@/mixins/common.js'
import moment from 'moment'
export default {
  name: 'onlineEquipment',
  mixins: [mixin],
  data () {
    return {
      searchstatus: null,
      statusList: [],
      tableData: [],
      tableHeight: window.innerHeight - 180,
      tableLoading: false,
      addFlag: false,
      form: {
        project: null,
        tagvalue: [],
        time: null
      },
      rules: {
        project: [
          { required: true, message: '请选择项目', trigger: 'change' }
        ],
        tagvalue: [
          { required: true, message: '请选择标签', trigger: 'change' }
        ]
      },
      tags: [],
      submitloading: false
    }
  },
  computed: {

  },
  mounted() {
    this.getStatus()
    this.refresh()
    window.onresize = () => {
      this.tableHeight = window.innerHeight - 180
    }
  },
  methods: {
    moment,
    getStatus() {
      this.$dict(this, 'documentStatus').then(res => {
        if (res.code === 200) {
          this.statusList = (res.data || []).map(m => {
            return {
              value: Number(m.value),
              label: m.label
            }
          })
        } else {
          this.$message({
            type: 'error',
            message: '字典获取出错了documentStatus',
            showClose: true
          })
          this.statusList = []
        }
      })
    },
    async handleStatusChange() {
      this.tableLoading = true
      const params = this.searchstatus ? {
        user_id: this.$store.state.userInfo.id,
        gen_type: 7,
        status: this.searchstatus
      } : {
        user_id: this.$store.state.userInfo.id,
        gen_type: 7
      }
      const { data } = await this.$pub.post('/gen/gen-list', params)
      this.tableData = data || []
      this.tableLoading = false
    },
    refresh() {
      this.handleStatusChange()
    },
    add() {
      this.pointList = null
      this.form = {
        project: null,
        tagvalue: [],
        time: null
      }
      this.form.project = {
        buildType: '',
        id: 4,
        number: 3863,
        projectCode: 'THAF20200619',
        projectName: '亭湖区安防大数据三年行动计划建设项目',
        projectType: '',
        status: '施工'
      }
      this.form.tagvalue = ['十大场所']
      this.addFlag = true
      this.getTagList()
    },
    // 新增 start
    handleProjectChange() {
      this.iscascaderShow++
      const obj = {
        tagvalue: [],
        time: null
      }
      Object.assign(this.form, obj)
      this.tags = []
      this.getTagList()
    },
    async getTagList() {
      try {
        var req = {
          projectCode: this.form.project.projectCode
        }
        const result = await this.$pub.post('/point/get-tag-list', req)
        if (result.code === 200) {
          if (result.data !== null) {
            this.tags = result.data.map((item, index) => {
              return { value: index, label: item }
            })
          }
        } else {
          this.$notify.error({
            title: '查询失败',
            message: result.message
          })
        }
      } catch (e) {
        this.$notify.error({
          title: '服务器请求失败',
          message: e.message
        })
      }
    },
    timeChange() {
      if (!this.form.time) {
        this.pickerMinDate = null
      }
    },
    async submit() {
      try {
        this.$refs.addForm.validate(async valid => {
          if (valid) {
            this.submitloading = true
            const query_info = {
              project_code: this.form.project.projectCode,
              tags: this.form.tagvalue
            }
            const { data, code, message } = await this.$pub.post('/gen/join_statistics', query_info)
            if (code !== 200) {
              this.$message({
                message: message,
                type: 'info',
                showClose: true,
                customClass: 'uploadMessage'
              })
            } else {
              this.$message({
                message: data,
                type: 'success',
                showClose: true,
                customClass: 'uploadMessage'
              })
              this.addFlag = false
              this.refresh()
            }
            this.submitloading = false
          }
        })
      } catch (err) {}
    }
  }
}
</script>

<style lang="scss">

.onlineEquipment{
  ._top{
    padding:4px 0;
  }
  .el-upload-dragger {
    height: 130px;
    .el-icon-upload{
      margin: 20px 0 16px;
    }
  }
  .wrap_up{
    position: relative;
    display:flex;
    &>div{
      width:360px;
    }
    .el-upload__tip{
      margin-left:20px;
    }
  }
}
.online_e{
  .el-input.is-disabled .el-input__inner{
    color: #7a7b7e;
    background-color: #f8f8fc;
  }
  .el-tag.el-tag--info{
    color: #7a7b7e;
    background-color: #f8f8fc;
    cursor: not-allowed;
  }
}
</style>
