<template>
  <div class="completionhandover_wrap" v-loading="loading">
    <div class="searchPoint">
      <el-form size="small" label-position="right" label-width="68px" style="margin:0 10px;border-radius:4px;">
        <el-form-item label="项目">
          <el-select style="width: 100%" v-model="form.project" placeholder="请选择" @change="handleProjectChange"
            value-key="id">
            <el-option v-for="item in projectList" :key="item.projectCode" :label="item.projectName"
              :value="item"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="点位">
          <el-input v-model="form.pointCode" placeholder="请输入点位编号或名称" @input="inputChangePoint"></el-input>
        </el-form-item>
        <el-form-item label="标签">
          <el-select v-model="form.tag" style="width:100%" clearable placeholder="请选择标签" @change="handleSelectChange">
            <el-option v-for="item in tagList" :key="item" :label="item" :value="item">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="子系统">
          <el-select v-model="form.child" style="width:100%" clearable placeholder="请选择子系统" multiple collapse-tags
            @change="handleSelectChange">
            <el-option v-for="item in childList" :key="item.key" :label="item.value" :value="item.key">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="区域">
          <el-select v-model="form.area" style="width:100%" clearable placeholder="请选择区域" multiple collapse-tags
            @change="handleSelectChange">
            <el-option v-for="item in areaList" :key="item" :label="item" :value="item">
            </el-option>
          </el-select>
        </el-form-item>
        <!-- <el-form-item label="施工单位" >
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
        </el-form-item> -->
        <!-- <el-form-item label="拍照日期" >
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
        </el-form-item> -->
        <el-form-item label="状态">
          <el-select v-model="form.hasNew" style="width:100%" @change="handleSelectChange">
            <el-option v-for="item in hasNewList" :value="item.dict_value" :label="item.dict_label"
              :key="item.dict_value">
            </el-option>
          </el-select>
        </el-form-item>
      </el-form>
      <el-table class="tableWrap" :show-header="false" :height="tableHeight" :data="pointTableData"
        :row-style="{ height: '30px' }" :cell-style="{ padding: '4px 0' }" @row-click="currentClick"
        :row-class-name="tableRowClassName" ref="multipleTable">
        <el-table-column show-overflow-tooltip>
          <template slot-scope="scope">
            <h5>{{ scope.row.pointName }}</h5>
            <span style="color:#BEBFBF;">点位编码：{{ scope.row.pointCode }}</span>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination layout="prev, pager, next" :total="total" :page-size.sync="page.page_size"
        @current-change="pageChange" :current-page.sync="page.page_no" class="pagination" small>
      </el-pagination>
    </div>
    <div class="content_wrap">
      <h3 v-if="ipList.length > 0">完工移交</h3>
      <div v-for="item in ipList" :key="item.id" class="content-item-content">
        <div class="detail-head-base">
          <div class="base-item">
            <div class="base-title">
              点位名称
            </div>
            <div class="base-value text-one-line">
              <span>{{ currentPoint.pointName }}</span>
            </div>
          </div>
          <div class="base-item">
            <div class="base-title">
              点位编码
            </div>
            <div class="base-value text-one-line">
              <span>{{ currentPoint.pointCode }}</span>
            </div>
          </div>
          <div class="base-item">
            <div class="base-title">
              当前网关
            </div>
            <div class="base-value text-one-line">
              <span>{{ item.gateway ? item.gateway : '/' }}</span>
            </div>
          </div>
          <div class="base-item">
            <div class="base-title">
              当前掩码
            </div>
            <div class="base-value text-one-line">
              <span>{{ item.mask ? item.mask : '/' }}</span>
            </div>
          </div>
        </div>
        <div v-for="(proc, i) in item.list" :key="proc.id + '' + i" class="proc-item-content">
          <div class="section-top-border">
            <div class="header">
              <h3>{{ proc.device_name }} </h3>
              <div
                :class="{ btn: true, isRed: proc.audit_status === 2 || proc.audit_status === 4, isGreen: proc.audit_status === 1 || proc.audit_status === 3 }">
                {{ selectDictLabel(statusOptions, proc.audit_status) }}
                <!-- 终审 初审 -->
                <!--
                有ip和照片才能审核,这是前提条件；proc.ip && proc.attachment_list.length>0
                有权限才能审核；(first || second)
                只有初审权限的人进来 状态为(终审通过3），不可以再操作 proc.audit_status === 3 && first && !second
                只有终审权限的人进来，状态为(0未审核 2初审未通过)，不能操作 (proc.audit_status === 0 || proc.audit_status === 2) && !first && second
              -->
                <div class="opera"
                  v-if="!isLock() && (proc.ip && proc.attachment_list.length > 0) && (first || second) && (!(proc.audit_status === 3 && first && !second) && !((proc.audit_status === 0 || proc.audit_status === 2) && !first && second))">
                  <span class="agreewrap" @click="handleCheck(0, proc)">
                    <img style="margin-top:2px ;" src="../../assets/images/agree.png" alt="">
                  </span>
                  <span class="disagreewrap" @click="handleCheck(1, proc)">
                    <img style="margin-top:4px ;" src="../../assets/images/disagree.png" alt="">
                  </span>

                </div>
              </div>
            </div>
            <div class="remarkwrap">
              <h5>IP：{{ proc.ip }}</h5>
              <h5>备注：{{ proc.remark ? proc.remark : '/' }}</h5>
            </div>
            <div class="image-wrap" v-viewer="options">
              <div class="image-item" v-for="img in proc.attachment_list" :key="img.id">
                <!--  普通照片or全场景照片  -->
                <!-- <img
                  :src="img.file_path_thumb"
                  :key="img.file_path"
                  v-if="img.is360===1"
                  @click="initPhotoSphere(proc.procName,img.filePathTrans)"
                > -->
                <img :src="img.file_path_thumb" :data-source="img.file_path" :key="img.file_path">
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
    <div class="right_wrap">
      <div class="design" v-if="designInfo.class_code && designInfo.proc_list && designInfo.proc_list.length > 0">
        <h3>{{ designInfo.class_name }}</h3>
        <div v-for="(proc, i) in designInfo.proc_list" :key="proc.proc_code + i">
          <h4> <i class="el-icon-camera"></i>{{ proc.proc_name }}</h4>
          <div class="image-wrap" v-viewer="options">
            <div class="image-item" v-for="img in proc.attach_list" :key="img.id">
              <el-tooltip effect="dark" :content="(img.remark ? img.remark + ',时间：' : '') + img.create_time"
                placement="top-start">
                <img :src="img.file_path_thumb" :data-source="img.file_path" :key="img.file_path">
              </el-tooltip>
              <div class="bcinfo">
                <div
                  :class="{ isRed: img.audit === 2 || img.audit === 4, isGreen: img.audit === 1 || img.audit === 3 }">
                  {{ selectDictLabel(statusOptions, img.audit) }}</div>
                <div>拍摄者: {{ img.submit }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <el-tabs type="border-card" class="device" v-if="currentPoint && currentPoint.pointCode">
        <el-tab-pane label="物料清单">
          <el-table :data="deviceLists" :row-style="{ height: '30px' }" :cell-style="{ padding: '0' }"
            highlight-current-row border style="margin-top:10px;">
            <el-table-column label="物料规格" prop="deviceName">

              <template slot-scope="scope">
                <el-tooltip v-if="scope.row.deviceModel" class="item" effect="dark" :content="scope.row.deviceModel"
                  placement="top-start">
                  <span>{{ scope.row.deviceName }}</span>
                </el-tooltip>
                <span v-else>{{ scope.row.deviceName }}</span>
              </template>
            </el-table-column>
            <el-table-column label="单位" align="center" prop="unit" width="50" />
            <el-table-column label="设计数量" align="center" prop="regNums" width="78" />
            <el-table-column label="安装数量" align="center" prop="finishNums" width="78"></el-table-column>
          </el-table>
        </el-tab-pane>
        <el-tab-pane label="链路信息">
          <LinkInformation :point="{ ...currentPoint }" :projectCode="form.projectCode" :isEdit="false">
          </LinkInformation>
        </el-tab-pane>
        <el-tab-pane label="取电信息">
          <PowerCessInformation :point="{ ...currentPoint }" :projectCode="form.projectCode" :isEdit="false">
          </PowerCessInformation>
        </el-tab-pane>
      </el-tabs>
    </div>
    <!-- 全景照片 -->
    <el-dialog :title="photoSphereName" :visible.sync="visible" :footer="false" :append-to-body="true"
      custom-class="photo_wrap" width="70%">
      <photo :bigImg="bigImg" v-if="visible"></photo>
    </el-dialog>
  </div>
</template>

<script>
import { checkPermission } from '@/utils/tool'
import photo from '@/views/3D/index'
import LinkInformation from '@/views/logisticsRegister/LinkInformation.vue'
import PowerCessInformation from '@/views/logisticsRegister/PowerCessInformation.vue'
export default {
  name: 'completionhandover',
  data () {
    return {
      form: {
        project: '',
        id: '',
        projectCode: '',
        pointCode: '',
        tag: '',
        child: null,
        area: null,
        dept_id: '',
        phototime: null,
        begin_time: '',
        end_time: '',
        hasNew: -1 // 图片状态
      },
      projectList: [],
      tagList: [],
      childList: [],
      areaList: [],
      BuilderList: [],
      pointTableData: [],
      total: 0,
      page: {
        page_no: 0,
        page_size: 10
      },
      hasNewList: [
        { dict_label: '全部', dict_value: -1 }, { dict_label: '未审核', dict_value: 0 }, { dict_label: '初审通过', dict_value: 1 }, { dict_label: '初审未通过', dict_value: 2 },
        { dict_label: '终审通过', dict_value: 3 }, { dict_label: '终审未通过', dict_value: 4 }
      ],
      statusOptions: [
        { dict_label: '未审核', dict_value: 0 },
        { dict_label: '初审通过', dict_value: 1 },
        { dict_label: '初审未通过', dict_value: 2 },
        { dict_label: '终审通过', dict_value: 3 },
        { dict_label: '终审未通过', dict_value: 4 }
      ],
      imgExamine: [0, 2],
      imgExamine_f: [1, 3, 4],
      tableHeight: window.innerHeight - 145 - 320,
      currentPoint: null,
      loading: false,
      ipList: [], // 工序列// 网关// 掩码
      designInfo: {}, // 深化设计详情
      deviceLists: [], // 物料清单列表
      options: {
        toolbar: true,
        url: 'data-source'
      },
      // 全景照片
      photoSphereName: '',
      visible: false,
      bigImg: ''
    }
  },
  components: {
    photo, LinkInformation, PowerCessInformation
  },
  computed: {
    first () {
      return this.checkPermission(['logisticsRegister:photoExamine'])// 初审权限
    },
    second () {
      return this.checkPermission(['logisticsRegister:photoExamine_f'])// 终审权限
    }
  },
  created () {
    this.getProjectsList()
  },
  mounted () {
    this.getTableHeight()
    window.addEventListener('resize', () => this.getTableHeight())
  },
  methods: {
    checkPermission,
    selectDictLabel (datas, value) {
      const actions = []
      Object.keys(datas).map((key) => {
        if (datas[key].dict_value === (value)) {
          actions.push(datas[key].dict_label)
          return false
        }
      })
      return actions.join('')
    },
    getTableHeight () {
      this.$nextTick(() => {
        const elleft_wrap = document.getElementsByClassName('searchPoint')[0]
        if (elleft_wrap) {
          const form_header = elleft_wrap.getElementsByClassName('el-form')[0]
          const pagination = elleft_wrap.getElementsByClassName('pagination')[0]

          const form_headerh = form_header.offsetHeight
          const paginationh = pagination.offsetHeight
          this.tableHeight = elleft_wrap.offsetHeight - form_headerh - paginationh - 10
        }

        // 获取回到顶部距离右侧定位
        const el = document.getElementsByClassName('clover_right_tab')[0]
        if (el) {
          this.topRight = el.offsetWidth + 60
        }
      })
    },
    async getChildList () {
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
    async getAreaList () {
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
    async getTagList () {
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
    async getBuilderList () {
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
    async getProjectsList () {
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
    handleProjectChange (val) {
      if (val) {
        const changeProject = () => {
          this.form.projectCode = val.projectCode
          this.form.id = val.id
          this.form.pointCode = ''
          this.tagList = []
          this.childList = []
          this.areaList = []
          this.BuilderList = []
          this.form.dept_id = ''
          this.form.tag = ''
          this.form.child = null
          this.form.area = null

          this.getTagList()
          this.getBuilderList()

          this.getChildList()
          this.getAreaList()
          this.handleSelectChange()
        }
        changeProject()
      }
    },
    resetQuery () {
      this.page.page_no = 1
      this.total = 0
      this.designInfo = {}
      this.deviceLists = []
      this.currentPoint = null
      // 清空，点位列表
      this.pointTableData = []

      // 清空工序
      this.ipList = []
    },
    handleSelectChange () {
      if (!this.form.projectCode) {
        this.$message({
          type: 'error',
          message: '请选择项目',
          showClose: true
        })
        this.form.pointCode = ''
        return
      }
      this.resetQuery()
      this.getPointList()
    },
    inputChangePoint () {
      if (this.timer) {
        clearTimeout(this.timer)
      }
      const self = this
      this.timer = setTimeout(function () {
        self.timer = null
        self.handleSelectChange()
      }, 500)
    },
    async getPointList () {
      this.loading = true
      const params = {
        page_no: this.page.page_no,
        page_size: this.page.page_size,
        project_code: this.form.projectCode,
        tag: this.form.tag,
        point_name: this.form.pointCode,
        child_array: this.form.child,
        area_array: this.form.area,
        has_new: this.form.hasNew
        // dept_id: this.form.dept_id ? this.form.dept_id : 0,
        // begin_time: this.form.phototime ? this.form.phototime[0] : '',
        // end_time: this.form.phototime ? this.form.phototime[1] : ''
      }

      const { data, code, message } = await this.$pub.post('device/join-photo-list', params)
      if (code !== 200) {
        this.$message({
          type: 'error',
          message: message || '获取点位列表失败',
          showClose: true
        })
        return
      }
      this.pointTableData = data.list ? data.list : []
      this.total = data.total
      this.loading = false
    },
    tableRowClassName ({ row }) {
      return this.currentPoint && row.pointCode === this.currentPoint.pointCode ? 'current-row' : ''
    },
    pageChange (num) {
      this.page.page_no = num
      this.getPointList()
    },
    async currentClick (row) {
      if (!row || (this.currentPoint && this.currentPoint.pointCode === row.pointCode)) {
        return
      }
      this.currentPoint = row
      this.activeClassName = null
      this.ipList = []

      await this.getRightPic()
      this.getProc()
      this.getTableHeight()
    },
    // 获取完工移交照片
    async getProc () {
      this.loading = true
      const params = {
        project_code: this.form.projectCode,
        point_code: this.currentPoint.pointCode
      }
      const { code, data, message } = await this.$pub.post('/point/device/ip/list', params)
      this.loading = false
      if (code !== 200) {
        this.$message({
          type: 'error',
          message: message || '获取完工移交列表失败',
          showClose: true
        })
        return
      }
      this.ipList = data.ip_addr ? [data.ip_addr] : []
    },
    // 获取深化设计施工图
    async getRightPic () {
      this.loading = true
      const params = {
        project_code: this.form.projectCode,
        point_code: this.currentPoint.pointCode
      }
      this.getdevicTable()
      const { code, message, data } = await this.$pub.post('device/design-point-photo-list', params)
      this.loading = false
      if (code === 200) {
        if (data && data.length > 0) {
          this.designInfo = data.find(f => f.class_code === 'CLS000')
        } else {
          this.designInfo = {}
        }
      } else {
        this.designInfo = {}
        this.$notify.error({
          title: '查询失败',
          message: message
        })
      }
    },
    // 全景照片预览 ，此处用的自己写的3D全景组件，插件组件会受硬盘内存影响
    initPhotoSphere (name, img) {
      const url = process.env.VUE_APP_BASE_URL_download
      img = img.replace(url, '') + '?' + new Date().getTime()
      this.photoSphereName = name
      this.visible = true
      this.bigImg = img
    },
    // 获取物料清单列表
    async getdevicTable () {
      const params = {
        project_code: this.form.projectCode,
        point_code: this.currentPoint.pointCode
      }
      const { code, message, data } = await this.$pub.post('/device/build-reg-info-noStage', params)
      if (code === 200) {
        if (data && data.device_list.length > 0) {
          this.deviceLists = data.device_list
        } else {
          this.deviceLists = []
        }
      } else {
        this.deviceLists = []
        this.$notify.error({
          title: '查询物料清单失败',
          message: message
        })
      }
    },
    // 审核
    async handleCheck (type, proc) {
      // type:0通过，1不通过
      // 审核状态 0未审核 1初审通过 2初审未通过 3终审通过 4终审未通过
      // let obj = {}
      // if (this.first && this.second) { // 两个权限直接按终审走，状态改为终审
      //   obj = {
      //     0: [3, 4], // 本来是0未审核:  3终审通过 4终审未通过
      //     1: [3, 4], // 本来是1初审通过: 3终审通过 4终审未通过
      //     2: [3, 4], // 本来是2初审未通过: 3终审通过 4终审未通过
      //     3: [3, 4], // 本来是3终审通过: 3终审通过 4终审未通过
      //     4: [3, 4] // 本来是4终审未通过: 3终审通过 4终审未通过
      //   }
      // } else if (this.first) { // 只有初审权限的人进来，状态为终审通过3，不能再操作
      //   obj = {
      //     0: [1, 2], // 本来是0未审核: 1初审通过 2初审未通过
      //     1: [1, 2], // 本来是1初审通过: 1初审通过 2初审未通过
      //     2: [1, 2], // 本来是2初审未通过: 1初审通过 2初审未通过
      //     4: [1, 2] // 本来是4终审未通过: 1初审通过 2初审未通过
      //   }
      // } else { // 只有终审权限的人进来，状态为0未审核 2初审未通过，不能操作
      //   obj = {
      //     1: [3, 4], // 本来是1初审通过: 3终审通过 4终审未通过
      //     3: [3, 4], // 本来是3终审通过: 3终审通过 4终审未通过
      //     4: [3, 4] // 本来是4终审未通过: 3终审通过 4终审未通过
      //   }
      // }

      const obj = { // 通过上述分析，只有[1,2]或者[3,4]
        first: [1, 2], // 只有初审权限
        second: [3, 4]// 有终审权限
      }
      const params = {
        id: proc.id,
        audit_status: this.second ? obj.second[type] : obj.first[type]
      }

      this.loading = true
      const { code, message, data } = await this.$pub.post('point/device/ip/audit', params)
      this.loading = false
      if (code === 200) {
        this.getProc()
      } else {
        this.$message({
          type: 'error',
          message: data || message,
          showClose: true
        })
      }
    },
    // is_lock为1禁止一切操作
    isLock () {
      return this.currentPoint.is_lock === 1
    }
  }
}
</script>

<style lang="scss">
.completionhandover_wrap {
  box-sizing: border-box;
  background: #fff;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: space-between;
  padding: 20px 20px;

  // 左侧查询点位区
  .searchPoint {
    width: 340px;
    height: 100%;
    border-bottom: 1px solid #ededed;
    border-right: 1px solid #ededed;
    border-left: 1px solid #ededed;

    .el-pagination--small {
      border: 0;
    }

    .el-form-item {
      margin-bottom: 10px;
    }

    .tableWrap {
      .el-table__body tr.current-row>td {
        background: rgb(68, 120, 241);
        color: #fff;
      }

      td {
        cursor: pointer;
      }
    }
  }

  .content_wrap {
    width: calc(100% - 300px);
    overflow: hidden;
    height: 100%;
    box-sizing: border-box;
    height: 100%;
    flex: 1 1 0%;
    background-color: rgb(255, 255, 255);
    box-shadow: rgba(0, 0, 0, 0.1) 0px 0px 3px;
    overflow: auto;
    padding: 24px 24px 0;

    .content-item-content {
      height: fit-content;

      .detail-head-base {
        display: flex;
        box-sizing: border-box;
        align-items: center;
        width: 100%;
        text-align: left;
        flex-direction: row;
        background-color: rgb(244, 245, 247);
        padding: 16px;
        border-radius: 3px;
        margin-bottom: 10px;
        margin-top: 20px;

        .base-item {
          // flex: 0 0 25%;
          flex: auto 1 1;
          overflow: hidden;
        }

        .base-title {
          color: rgb(107, 119, 140);
        }

        .base-value {
          min-height: 14px;
          margin-top: 8px;
          font-size: 14px;
          font-weight: 700;
          color: #172b4d;
        }

        .text-one-line {
          text-overflow: ellipsis;
          width: 90%;
          white-space: nowrap;
          overflow: hidden;
        }
      }

      .proc-item-content {
        margin-bottom: 20px;

        .section-top-border {
          position: relative;
          border-width: 1px;
          border-style: solid;
          border-color: rgb(223, 225, 230);
          border-image: initial;
          border-radius: 3px;
          padding: 24px;
          position: relative;

          &::before {
            position: absolute;
            top: 0px;
            right: 0px;
            left: 0px;
            height: 4px;
            content: " ";
            background-color: rgb(38, 132, 255);
            border-radius: 2px;
          }

          .header {
            display: flex;
            align-items: center;

            h3 {
              font-family: PingFangSC-Semibold;
              font-weight: 600;
              color: #2773FF;
              font-size: 16px;
              display: inline-block;
              margin-right: 20px;
            }

            .btn {
              display: inline-block;
              width: fit-content;
              min-width: 82px;
              height: 30px;
              background: #2773FF;
              color: #FFFFFF;
              border-radius: 20px;
              margin: 0px 5px;
              padding: 0 20px;
              box-sizing: border-box;
              font-size: 14px;
              font-weight: 400;
              line-height: 30px;
              text-align: center;
              position: relative;
              overflow: hidden;
              border: 1px solid #ededed;
              cursor: pointer;

              &:hover {
                .opera {
                  left: 0;
                }
              }
            }

            .opera {
              position: absolute;
              top: 0;
              left: -140px;
              transition: left 0.2s;
              width: 100%;
              height: 100%;
              background: #fff;
              display: flex;
              align-items: center;
              cursor: pointer;

              span {
                display: inline-block;
                width: 50%;
                height: 100%;
                border-right: 1px solid #ededed;
                box-sizing: border-box;
              }
            }

            .disagreewrap {
              &:hover {
                background: linear-gradient(180deg, #DBEDFE 10%, #F9FCFF 100%);
              }
            }

            .agreewrap {
              &:hover {
                background: linear-gradient(180deg, #DBEDFE 10%, #F9FCFF 100%);
              }
            }

            .isRed {
              background: rgba(240, 66, 3, 0.4);
            }

            .isGreen {
              background: rgba(49, 155, 49, 0.4);
            }
          }

          .remarkwrap {
            // position:absolute;
            // top:4px;
            // right:0px;
            // // background: linear-gradient(180deg, #FFFFFF 0%, #F5FAFF 34%, #E5F3FF 100%);
            // background: linear-gradient(180deg, #DBEDFE 10%, #F9FCFF 100%);
            // box-shadow: 0px 4px 12px -4px rgba(206,213,225,0.7);
            color: #35353F;
            // padding:10px  20px;
            box-sizing: border-box;
            line-height: 20px;

            // min-width:140px;
            // max-width: 200px;
            // max-height: calc(100% - 4px);
            // overflow-y: auto;
            // border-bottom-left-radius: 12px;
            // border-bottom-right-radius: 12px;
            // &:first-child{
            //   margin-bottom:10px;
            // }
            h5 {
              display: inline-block;
              margin: 10px 10px 0 0;
            }
          }

          .image-wrap {
            margin-top: 20px;

            .image-item {
              text-align: center;
              display: inline-block;
              overflow: hidden;
              padding: 0;
              margin-right: 10px;
              width: 120px;
              box-sizing: border-box;
              position: relative;
              height: 120px;
              font-size: 0;
              border: 1px solid transparent;

              img {
                width: 100%;
                height: 100%;
              }
            }
          }
        }
      }
    }
  }

  .right_wrap {
    width: 600px;
    padding: 20px 20px 0px;
    box-shadow: rgba(0, 0, 0, 0.1) 0px 0px 3px;
    overflow: auto;

    .design {
      height: fit-content;
      width: 100%;
      margin-bottom: 20px;

      h3 {
        margin-bottom: 10px;
      }

      h4 {
        margin: 10px 20px;

        i {
          color: #2684ff;
          margin-right: 10px;
        }
      }

      .image-wrap {
        margin-left: 20px;
      }

      .image-item {
        text-align: center;
        display: inline-block;
        overflow: hidden;
        padding: 0;
        margin-right: 10px;
        width: 120px;
        box-sizing: border-box;
        position: relative;
        height: 120px;
        font-size: 0;
        border: 1px solid transparent;

        .bcinfo {
          width: 100%;
          height: 40px;
          background: linear-gradient(180deg, #DBEDFE 10%, #F9FCFF 100%);
          position: absolute;
          bottom: 0;
          left: 0;
          color: #35353F;
          font-size: 12px;

          &:first-child {
            margin-bottom: 4px;
          }

          .isRed {
            color: rgba(240, 66, 3, 0.4);
          }

          .isGreen {
            color: rgba(49, 155, 49, 0.4);
          }
        }

        img {
          width: 100%;
          height: 100%;
        }
      }
    }

    .device {

      .LinkInformation,
      .power_cess {
        padding: 0;

        .content .box-item {
          margin-top: 0px;
          margin-bottom: 10px;
        }
      }
    }
  }
}
</style>
