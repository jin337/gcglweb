<template>
  <!-- 支付管理 -->
  <div class="paymanagement">
    <div class="vux-flexbox flex-content vux-flex-row">
      <span class="main-title">
        在线情况<i :size="16" class="el-icon-question"></i>
        <span v-if="form.project_code && form.tag.id" style="margin-left:4px;font-size:15px;color:#999;">数量（{{
          tableData.length
        }}）个</span>
      </span>
      <div>
        <el-button size="small" type="primary" @click="addIP"
          :disabled="!form.project_code || !form.tag.id">新增IP</el-button>
        <el-button size="small" type="primary" @click="addPay"
          :disabled="!form.project_code || !form.tag.id">创建支付</el-button>
        <el-button size="small" @click="getHistoryPay" :disabled="!form.project_code || !form.tag.id">历史支付</el-button>
        <el-button size="small" @click="handleExport" :disabled="!form.project_code || !form.tag.id">导出</el-button>
      </div>
    </div>
    <el-form class="search" :inline="true" size="small">
      <el-form-item label="项目">
        <el-select v-model="form.project_code" placeholder="请选择项目" style="width: 220px;" @change="handleProjectchange">
          <el-option v-for="item in projectList" :key="item.id" :label="item.project_name"
            :value="item.project_code"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="标签">
        <el-select v-model="form.tag" :disabled="!form.project_code" clearable placeholder="请先选择项目" style="width: 180px;"
          value-key="id">
          <el-option v-for="item in tagList" :key="item.id" :label="item.name" :value="item">
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="点位编码/IP">
        <el-input v-model="form.point_code" placeholder="点位编码/IP"></el-input>
        <!-- <el-select v-model="form.point_code" placeholder="请选择" :disabled="!form.project_code" filterable remote
          :remote-method="remoteMethod" :loading="pointLoading" clearable style="width: 180px;">
          <el-option v-for="item in pointList" :key="item.point_code" :value="item.point_code" :label="item.point_name">
            <span style="float: left">{{ item.point_name }}</span>
            <span style="float: right; color: #8492a6; font-size: 13px">{{ item.point_code }}</span>
          </el-option>
        </el-select> -->
      </el-form-item>
      <el-form-item label="初始状态">
        <el-select v-model="form.init_status" clearable placeholder="请选择初始状态" style="width: 140px;">
          <el-option v-for="item in pay_ip_init_statusList" :key="item.value" :label="item.label"
            :value="Number(item.value)">
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="在线状态">
        <el-select v-model="form.online_status" clearable placeholder="请选择在线状态" style="width: 140px;">
          <el-option v-for="item in pay_ip_onlie_statusList" :key="item.value" :label="item.label"
            :value="Number(item.value)">
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="getTableData">查询</el-button>
      </el-form-item>
    </el-form>
    <vxe-table v-loading="tableLoading" show-overflow :height="tableHeight" :data="tableData"
      :row-config="{ height: 30, isHover: true }" highlight-current-row>
      <vxe-column title="点位编码" field="point_code" :show-overflow-tooltip="true" width="130px" />
      <vxe-column title="点位名称" field="point_name" min-width="140px" :show-overflow-tooltip="true" />
      <vxe-column title="设备名称" field="device_name" width="170px" :show-overflow-tooltip="true" />
      <vxe-column title="IP" field="ip" width="140px" align="center">
        <template v-slot="{ row }">
          <!-- <el-popover ref="popover" placement="right" title="IP更改" popper-class="ippopver" width="320px"
            v-model="row.ipflag" @show="showChangeIP">
            <el-descriptions title="" size="mini" :column="1" border>
              <el-descriptions-item label="原IP">{{ row.ip ? row.ip : '无' }}</el-descriptions-item>
              <el-descriptions-item label="新IP" content-class-name="my-ip-content">
                <el-input v-if="row.ipflag" size="mini" v-model="newip" style="width:220px;"
                  @change="changeIP"></el-input>
              </el-descriptions-item>
            </el-descriptions>
            <span style="color:#f40;">{{ ipError }}</span>
            <div style="text-align: right; margin-top: 20px">
              <el-button size="mini" type="text" @click="row.ipflag = false">取消</el-button>
              <el-button type="primary" size="mini" @click="SureChangeIP(row)" v-loading="row.iploading">确定</el-button>
            </div>
            <span slot="reference" style="cursor:pointer;margin-right:4px;">{{ row.ip ? row.ip : '无' }}</span>
          </el-popover> -->
          <span style="padding:6px;cursor: pointer;" @click="handleEditIP(row)">{{ row.ip ? row.ip : '无' }}</span>
        </template>
      </vxe-column>
      <vxe-column title="测通时间" field="online_date" width="140px" align="center">
        <template v-slot="{ row }">
          <span>{{ row.online_date ? parseTime(row.online_date, '{y}-{m}-{d}') : '' }}</span>
        </template>
      </vxe-column>
      <vxe-column title="初始状态" field="init_status_name" width="80px" align="center" />
      <vxe-column title="支付类型" field="pay_ip_type_name" width="80px" align="center" />
      <vxe-column title="状态变更时间" field="change_status_date" width="140px" align="center">
        <template v-slot="{ row }">
          <span>{{ row.change_status_date ? parseTime(row.change_status_date, '{y}-{m}-{d}') : '' }}</span>
        </template>
      </vxe-column>
      <vxe-column title="支付时间" field="pay_date" width="140px" align="center">
        <template v-slot="{ row }">
          <span>{{ row.pay_date ? parseTime(row.pay_date, '{y}-{m}-{d}') : '' }}</span>
        </template>
      </vxe-column>
      <vxe-column title="支付编码" field="pay_sn" width="180px" align="center" />
      <vxe-column title="OA支付编码" field="oa_sn" width="160px" align="center" />
      <vxe-column title="状态" field="pay_status_name" width="80px" align="center" />
      <vxe-column title="操作" align="center" width="80px">
        <template v-slot="{ row }">
          <!-- <el-button size="small" type="text" @click="handleEdit(row)">编辑</el-button> -->
          <el-button size="small" type="text" @click="handledel(row)">删除</el-button>
        </template>
      </vxe-column>
    </vxe-table>

    <!-- 新建支付 -->
    <el-drawer :with-header="false" :visible.sync="addFlag" size="1200px" append-to-body custom-class="paymanaAddproc">
      <add-box v-if="addFlag" :addFlag.sync="addFlag" :project_code="form.project_code" :tag="form.tag" title="新建支付"
        @cancel="cancel"></add-box>
    </el-drawer>
    <!-- 历史支付 -->
    <el-drawer :with-header="false" :visible.sync="historyFlag" size="1200px" append-to-body
      custom-class="paymanaHistoryproc">
      <history-box v-if="historyFlag" :historyFlag.sync="historyFlag" :project_code="form.project_code" :tag="form.tag"
        @cancel="cancel"></history-box>
    </el-drawer>

    <!-- 修改IP -->
    <el-drawer :with-header="false" :visible.sync="editFlag" size="800px" append-to-body custom-class="paymanaEditIp">
      <edit-box v-if="editFlag" :editFlag.sync="editFlag" :current="currentRow" :project_code="form.project_code"
        :tag="form.tag" @cancel="cancel"></edit-box>
    </el-drawer>

    <!-- 新增IP -->
    <el-drawer :with-header="false" :visible.sync="addIPFlag" size="800px" append-to-body custom-class="paymanaAddIp">
      <add-ip-box v-if="addIPFlag" :addIPFlag.sync="addIPFlag" :project_code="form.project_code" :tag="form.tag"
        @cancel="cancel"></add-ip-box>
    </el-drawer>
  </div>
</template>

<script>
import addBox from './AddBox.vue'
import HistoryBox from './HistoryBox.vue'
import EditBox from './EditBox.vue'
import AddIpBox from './AddIpBox.vue'
import { parseTime, downloadFile } from '@/utils/tool'

export default {
  name: 'payManagement',
  data () {
    return {
      form: {
        project_code: null,
        tag: { id: 0, name: '' },
        point_code: '',
        init_status: null,
        online_status: null
      },
      projectList: [],
      tagList: [],
      pointList: [],
      pointLoading: false,
      pay_ip_init_statusList: [],
      pay_ip_onlie_statusList: [],
      pay_ip_typeList: [],
      tableLoading: false,
      tableData: [],
      tableHeight: window.innerHeight - 245,
      addFlag: false,
      editFlag: false,
      addIPFlag: false,
      historyFlag: false,
      currentRow: null,
      ipError: '',
      newip: ''
    }
  },
  components: { addBox, HistoryBox, EditBox, AddIpBox },
  mounted () {
    this.getDictList()
    this.getProjectsList()

    window.onresize = () => {
      this.tableHeight = window.innerHeight - 245
    }
  },
  methods: {
    parseTime,
    async getProjectsList () {
      const params = {
        user_id: this.$store.state.userInfo.id
      }
      const { data, code, message } = await this.$pub.post('/project/list-slt', params) // project/project-list-by-user
      if (code === 200 && data !== null) {
        this.projectList = data
      } else {
        this.$notify.error({
          title: '查询失败',
          message: message
        })
      }
    },
    handleProjectchange () {
      this.form.tag = { id: 0, name: '' }
      this.tagList = []
      this.getTagList()
    },
    // 获取标签
    async getTagList () {
      const { data, code, message } = await this.$pub.post('pay/ip/info/tag-list', { project_code: this.form.project_code })
      if (code === 200 && data !== null) {
        this.tagList = data
      } else {
        this.$notify.error({
          title: '查询失败',
          message: message
        })
      }
      this.tagList = data || []
    },
    getDictList () {
      const dicts = ['pay_ip_init_status', 'pay_ip_onlie_status', 'pay_ip_type']
      // 上报类型  位置 上传文件类型
      dicts.forEach(f => {
        this.$dict(this, f).then((res) => {
          if (res.code === 200) {
            const _name = f + 'List'
            this[_name] = res.data || []
          } else {
            this.$message({
              type: 'error',
              message: '字典出错了' + f,
              showClose: true
            })
            this[f + 'list'] = []
          }
        })
      })
    },
    async remoteMethod (query) {
      if (query !== '') {
        this.pointLoading = true
        const params = {
          project_code: this.form.project_code,
          keywords: query
        }
        const { data } = await this.$pub.post('/point/search', params)
        this.pointList = data || []
        this.pointLoading = false
      }
    },
    async getTableData () {
      if (!this.form.project_code || !this.form.tag.id) {
        this.$message({
          type: 'error',
          message: '请先选择项目和标签',
          showClose: true
        })
        return
      }
      this.tableLoading = true
      const params = {
        project_code: this.form.project_code,
        tag_id: this.form.tag.id,
        init_status: this.form.init_status ? Number(this.form.init_status) : null,
        online_status: this.form.online_status ? Number(this.form.online_status) : null,
        point_code: this.form.point_code
      }
      const { data, code, message } = await this.$pub.post('pay/ip/online/list', params)
      if (code !== 200) {
        this.$message({
          type: 'error',
          message: message || '获取在线情况列表失败',
          showClose: true
        })
        return
      }
      this.tableData = (data || []).map(m => {
        return {
          ...m,
          id: Number(m.id),
          ipflag: false,
          iploading: false
        }
      })
      this.tableLoading = false
    },
    // 修改ip
    showChangeIP () {
      this.ipError = ''
      this.newip = ''
    },
    changeIP () {
      const reg = /^((\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.){3}(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])$/
      if (this.newip === '') {
        this.ipError = 'ip不能为空'
        return false
      } else if ((!reg.test(this.newip))) {
        this.ipError = 'ip格式不正确'
        return false
      } else {
        this.ipError = ''
        return true
      }
    },
    async SureChangeIP (row) {
      const vaild = this.changeIP()
      if (!vaild) {
        return
      }
      row.iploading = true
      const params = {
        id: row.id,
        ip: this.newip
      }
      const { code, message } = await this.$pub.post('pay/ip/online/edit', params)
      row.iploading = false
      if (code !== 200) {
        return this.$message({
          message: message || '修改IP不成功',
          type: 'error',
          showClose: true,
          customClass: 'uploadMessage'
        })
      }
      this.$message({
        message: '修改IP成功',
        type: 'success',
        showClose: true,
        customClass: 'uploadMessage'
      })
      this.getTableData()
    },
    // 编辑IP
    handleEditIP (row) {
      this.currentRow = row
      this.editFlag = true
    },
    handledel (row) {
      const id = row.id
      this.$confirm('是否确认删除', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {
        const { code, message } = await this.$pub.post('pay/ip/online/del', { id })
        if (code === 200) {
          this.getTableData()
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
      }).catch(function () { })
    },
    cancel () {
      this.addFlag = false
      this.editFlag = false
      this.historyFlag = false
      this.addIPFlag = false
      this.getTableData()
    },
    // 创建支付
    addPay () {
      this.addFlag = true
    },
    // 新增IP
    addIP () {
      this.addIPFlag = true
    },
    getHistoryPay () {
      this.historyFlag = true
    },

    async handleExport (row) {
      this.tableLoading = true
      const params = {
        project_code: this.form.project_code,
        tag_id: this.form.tag.id,
        init_status: this.form.init_status ? Number(this.form.init_status) : null,
        online_status: this.form.online_status ? Number(this.form.online_status) : null,
        point_code: this.form.point_code
      }
      const result = await this.$pub.post(
        'pay/ip/online/exp',
        params,
        {
          headers: {
            'Content-Type': 'application/x-download'
          },
          responseType: 'blob'
        }
      )
      const title = this.form.project_code + '-' + this.form.tag.name + '在线情况'
      downloadFile(result, title, 'xlsx')
      this.tableLoading = false
    }
  }
}
</script>

<style scoped>
.paymanagement {
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

    .el-icon-question {
      margin-left: 4px;
      vertical-align: middle;
    }
  }

  .search {
    display: flex;
  }
}
</style>
<style lang="scss">
.ippopver {
  width: 320px;

  .my-ip-content {
    display: flex;
    align-items: center;

    &>span {
      display: inline-block;
    }

    .el-input__inner {
      padding: 0 5px;
    }
  }

  .el-descriptions .is-bordered .el-descriptions-item__cell {
    border: none;
  }

  .el-descriptions-row {
    border: 1px solid #EBEEF5;
  }
}
</style>
