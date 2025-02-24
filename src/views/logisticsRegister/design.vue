<template>
  <div class="clover_logreg_container_design clover_logreg_container">
    <div class="searchPoint" v-loading="tableLoading">
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
        <el-form-item label="状态">
          <el-radio-group v-model="form.status" @change="handleSelectChange">
            <el-radio v-for="item in statusList" :label="item.dict_value" :key="item.dict_value">
              {{ item.dict_label }}
              <span v-if="item.dict_value !== 2">({{ item.count }})</span>
            </el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="图片状态">
          <el-select v-model="form.audit" style="width:100%" @change="handleSelectChange">
            <el-option v-for="item in pointAuditList" :value="item.dict_value" :label="item.dict_label"
              :key="item.dict_value"></el-option>
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
    <!-- 工序 -->
    <div class="clover_proc-main" v-loading="centerLoading">
      <div class="moreText" v-if="currentPoint">
        <span class="tit">
          {{ currentPoint.pointCode }} {{ currentPoint.pointName }}
        </span>
        <div style="font-size:18px;" v-if="!isLock(currentPoint)">
          <el-button-group>
            <el-button type="primary" size="small" v-if="checkPermission(['materialDesgin:verify'])" @click="plsp"
              class="spbtn">审批</el-button>
          </el-button-group>
        </div>
      </div>
      <div class="wrap" v-if="procLists.length > 0">
        <!-- @change="handleCollapseChange" -->
        <el-collapse :value="activeClassName">
          <el-collapse-item v-for="item in procLists" :key="item.class_code" :title="item.class_name"
            :name="item.class_code">
            <div slot="title">{{ item.class_name }}</div>
            <div class="proc-item" v-for="procitem in item.proc_list" :key="procitem.proc_code">
              <span class="subtitle">
                <i class="el-icon-camera"></i>
                <span :style="{ fontWeight: procitem.is_core === 1 ? '600' : 'normal', marginLeft: '4px' }">{{
      procitem.proc_name
    }}</span>
                <el-tooltip effect="dark" content="关键工序" v-if="procitem.is_core === 1">
                  <img src="../../assets/images/guanj.png" style="width:16px;margin-left:10px;">
                </el-tooltip>
              </span>
              <div v-for="(pointDirect, i) in procitem.pointList"
                :key="pointDirect.direction ? pointDirect.direction + i + 'point' : i + 'point'">
                <div class="clover_wrap" v-viewer="options" v-if="pointDirect.attach_list.length > 0">
                  <div class="box" v-for="img in pointDirect.attach_list" :key="img.image_id">
                    <div class="box_img">
                      <el-tooltip effect="dark" placement="right-end" v-if="img.remark || img.lastTime">
                        <!--  有备注信息的  照片or全场景照片  -->
                        <div slot="content">
                          {{ img.lastTime }}
                          <p style="margin-top:10px;" v-if="img.remark">备注：{{ img.remark }}</p>
                        </div>
                        <img :src="img.file_path_thumb" :data-source="img.file_path" :key="img.file_path"
                          style="width: 140px;" v-if="img.is360 !== 1" />
                        <img :src="img.file_path_thumb" style="width: 140px;height:140px;" :key="img.file_path"
                          v-if="img.is360 === 1" @click="initPhotoSphere(procitem.procName, img.file_path)" />
                      </el-tooltip>
                      <!-- 无备注信息的 照片or全场景照片-->

                      <template v-else>
                        <img :src="img.file_path_thumb" :data-source="img.file_path" :key="img.file_path"
                          style="width: 140px;" v-if="img.is360 !== 1" />
                        <img :src="img.file_path_thumb" style="width: 140px;height:140px;" :key="img.file_path"
                          v-if="img.is360 === 1" @click="initPhotoSphere(procitem.procName, img.file_path_thumb)" />
                      </template>
                    </div>
                    <div class="user">
                      <span>拍摄: {{ img.submit }}</span>
                      <span
                        :style="{ fontWeight: 'bold', color: img.audit === 0 ? 'Orange' : (img.audit === 1 || img.audit === 3) ? '#70b617' : '#F56C6C' }">
                        {{ selectDictLabel(imgAudit, img.audit) }}</span>
                    </div>
                    <div class="dep">
                      <span>部门：{{ img.department }}</span>
                    </div>
                    <div v-if="currentPoint && !isLock(currentPoint)">
                      <el-radio-group v-model="img.num" @change="changeImgAudit(img, pointDirect.proc_code)"
                        class="imgRadio"
                        v-if="(first && [0, 1, 2, 4].includes(img.audit)) || (imgExamine_f.includes(img.audit) && second)">
                        <el-radio :label="true">通过</el-radio>
                        <el-radio :label="false" class="disagree">不通过</el-radio>
                      </el-radio-group>
                    </div>
                  </div>
                </div>
                <!-- 拓展信息 -->

                <template v-if="pointDirect.extand && pointDirect.extand.length > 0">
                  <span class="remarktitle">
                    <i class="el-icon-s-operation"></i>
                    拓展信息
                  </span>
                  <ul class="remarkRow">
                    <li v-for="(item, j) in pointDirect.extand" :key="item.code + j">
                      <span>{{ item.name }}:</span>
                      <span>{{ item.value }}</span>
                    </li>
                  </ul>
                </template>
              </div>
            </div>
          </el-collapse-item>
        </el-collapse>
      </div>
      <!-- 工序 无数据 -->
      <div v-if="procLists.length <= 0" class="nodata">
        <el-image :src="require(`@/assets/images/null.png`)" style="height: 50px; width: 80px;margin-top:100px;"
          v-loading="centerLoading"></el-image>
        <p style="color: grey">暂无点位深化设计图</p>
      </div>
    </div>

    <div class="clover_right_tab">
      <!-- 物料清单 -->
      <div style="height:100%" class="clover_device-main" v-loading="devloading">
        <div class="base_device" style=" padding:10px;border-bottom:1px solid #ededed;box-sizing:border-box;">
          <div class="_top">
            <h4>物料清单</h4>
            <span class="statusText" v-if="log_info.status">
              {{ selectDictLabel(statusList, log_info.status) }}
            </span>
          </div>
          <div class="sub">
            <p class="info">
              <span>最后更新人：{{ log_info.userName ? log_info.userName : '暂无数据' }}</span>
              <span>操作时间：{{ log_info.updateTim ? log_info.updateTime : '暂无数据' }}</span>
            </p>
          </div>
          <div class="opear" v-if="currentPoint && !isLock(currentPoint)">
            <el-checkbox v-model="status" style="margin:4px 6px 0 0;">已完成</el-checkbox>
            <span style="font-size:16px;margin-right:6px">备注:</span>
            <el-input size="mini" v-model="log_info.remark" style="flex:1;"></el-input>
            <el-button type="primary" style="margin-left:6px;" size="small" @click="saveData">保存</el-button>
          </div>
        </div>
        <p class="rowp" style="margin-top:10px;display:flex;align-items:center;" v-if="currentPoint">
          <span style="font-size: 14px;margin: 0px 6px 0 10px;">子系统：</span>
          <el-radio-group v-model="child" @change="getRightDeviceList">
            <el-radio :label="currentPoint.childCode">当前点位子系统</el-radio>
            <el-radio label="-1">全部</el-radio>
          </el-radio-group>
        </p>
        <div style="display:flex;">
          <el-table class="deviceTable" :height="deviceHeight" :data="deviceLists" :row-style="{ height: '30px' }"
            :cell-style="{ padding: '0' }" highlight-current-row style="width: 100%">
            <el-table-column label="物料规格" prop="deviceName" show-overflow-tooltip>

              <template slot-scope="scope">
                <span>
                  <span v-if="scope.row.status === 3 || scope.row.status === 2"
                    :style="{ margin: '0 2px 0 0', padding: '4px 6px', background: scope.row.status === 3 ? 'blue' : 'green', color: '#fff' }">{{
      statusFormat(stage_device_status, scope.row.status) }}</span>
                  <span v-if="scope.row.regNums > 0 && scope.row.status === 1"
                    style="margin:0 2px 0 0;padding: 4px 6px;background:red;color:#fff">已填报</span>
                  <span
                    :class="{ isWeight: (scope.row.regNums > 0 && scope.row.status === 1) || scope.row.status === 2 || scope.row.status === 3 }"
                    :style="{ color: (scope.row.regNums > 0 && scope.row.status === 1) ? 'red' : scope.row.status === 2 ? 'green' : scope.row.status === 3 ? 'blue' : '#606266' }">{{
      scope.row.deviceName }}</span>
                </span>
              </template>
            </el-table-column>
            <el-table-column label="规格型号" prop="deviceModel" width="150" show-overflow-tooltip>

              <template slot-scope="scope">
                <span>{{ scope.row.deviceModel }}</span>
              </template>
            </el-table-column>
            <el-table-column label="单位" prop="unit" width="50" align="center" />
            <el-table-column label="数量" align="center" class-name="regWrap" prop="regNums" width="70">

              <template slot-scope="scope">
                <el-input v-model="scope.row.regNums"
                  :disabled="(scope.row.status === 3 && !checkPermission(['logisticsRegister:examine']))"
                  @blur="valiAnRegNum(scope.row, scope.$index)" style="width:60px;"></el-input>
                <span class="tip">
                  已安装数量：{{ scope.row.finishNums }}
                  <div v-if="scope.row.isPhotoAdd > 0">已绑定照片数量：{{ scope.row.isPhotoAdd }}</div>
                  <div v-if="scope.row.isPhotoAdd > 0">设计数量不能小于{{ scope.row.finishNums > scope.row.isPhotoAdd ?
      scope.row.finishNums : scope.row.isPhotoAdd }}</div>
                </span>
                <span v-if="scope.row.error" style="color:#f40;">{{ scope.row.error }}</span>
              </template>
            </el-table-column>
          </el-table>
          <div class="checkGroupself">
            <div v-for="i in stage_list" :key="i.id" class="el-checkboxs"
              :class="{ isSelect: currentStage && currentStage.stage_code === i.stage_code }">
              <span :style="{ color: i.color, fontWeight: (i.status === 3 || i.status === 2) ? 700 : 'normal', }"
                class="isLine" @click="clickStage(i)">{{ i.stage_name }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 全景照片 -->
    <el-dialog :title="photoSphereName" :visible.sync="photoSphereVisible" :footer="false" :append-to-body="true"
      width="70%">
      <div id="viewer"></div>
    </el-dialog>
  </div>
</template>

<script>
import { Viewer } from 'photo-sphere-viewer'
import 'photo-sphere-viewer/dist/photo-sphere-viewer.css'
import { checkPermission } from '@/utils/tool'

export default {
  name: 'logisticsRegisterExamine',
  data () {
    return {
      form: {
        project: '',
        id: '',
        projectCode: '',
        pointCode: '',
        tag: '',
        hasNew: 0,
        deviceAudit: 0,
        status: 0,
        dept_id: '',
        begin_time: '',
        end_time: '',
        area: null,
        child: null,
        audit: -1
      },
      projectList: [],
      tagList: [],
      pointList: [],
      BuilderList: [],
      childList: [],
      areaList: [],
      pointTableData: [],
      total: 0,
      page: {
        page_no: 0,
        page_size: 10
      },
      hasNewList: [
        { dict_label: '待审', dict_value: 0, count: 0 }, { dict_label: '未通过', dict_value: 2, count: 0 }, { dict_label: '全部', dict_value: 1, count: 0 }
      ],
      deviceAuditList: [
        { dict_label: '全部', dict_value: 0, count: 0 }, { dict_label: '未审核', dict_value: 1, count: 0 }
      ],
      statusList: [
        { dict_label: '未登记', dict_value: 0, count: 0 }, { dict_label: '已登记', dict_value: 1, count: 0 }, { dict_label: '已完成', dict_value: 2, count: 0 }
      ],
      pointAuditList: [
        { dict_label: '全部', dict_value: -1 }, { dict_label: '未审核', dict_value: 0 }, { dict_label: '初审通过', dict_value: 1 }, { dict_label: '初审未通过', dict_value: 2 },
        { dict_label: '终审通过', dict_value: 3 }, { dict_label: '终审未通过', dict_value: 4 }
      ],
      imgExamine: [0, 2],
      imgExamine_f: [1, 3, 4],
      imgAudit: [
        { dict_label: '未审核', dict_value: 0 }, { dict_label: '初审通过', dict_value: 1 },
        { dict_label: '初审未通过', dict_value: 2 }, { dict_label: '终审通过', dict_value: 3 },
        { dict_label: '终审未通过', dict_value: 4 }
      ],
      buildStatusList: [
        { dict_label: '开挖完成', dict_value: 1 }, { dict_label: '立杆完成', dict_value: 2 }, { dict_label: '设备安装完成', dict_value: 3 },
        { dict_label: '取电完成', dict_value: 4 }, { dict_label: '取网完成', dict_value: 5 }, { dict_label: '链路完成', dict_value: 6 },
        { dict_label: '平台接入完成', dict_value: 7 }
      ],
      stage_device_status: [
        { dict_label: '无需审核', dict_value: 0 }, { dict_label: '待审核', dict_value: 1 },
        { dict_label: '已初审', dict_value: 2 }, { dict_label: '已终审', dict_value: 3 }
      ],
      tableHeight: window.innerHeight - 145 - 320,
      deviceHeight: window.innerHeight - 145 - 155,
      currentPoint: null,
      activeClassName: null,
      procLists: [], // 工序列
      deviceLists: [], // 物料规格
      stage_list: [], // 阶段数据
      stage_0: { stage_code: '0', stage_name: '全部数据', status: 0, noCkeck: true }, // 全部和其他
      stage_0_2: { stage_code: '0', stage_name: '全部数据', status: 0, noCkeck: true },
      stage_t: { stage_code: '-1', stage_name: '未配阶段', status: 0, noCkeck: true },
      options: {
        toolbar: true,
        url: 'data-source'
      },
      tableLoading: false,
      centerLoading: false,
      status: false, // 深化设计是否完成的状态标志 1已登记，2已完成
      log_info: {
        status: 0, // 深化设计是否完成的状态标志 1已登记，2已完成
        userID: '',
        userName: '',
        updateTime: '',
        remark: ''
      },
      status_info: [], // 施工登记的状态
      timer: null,
      // 全景照片
      viewer: '',
      photoSphereVisible: false,
      photoSphereName: '',
      operArr: [], // 通过不通过的数组
      child: '-1',
      devloading: false,
      currentStage: null, // 当前选择的阶段
      vloading: false
    }
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
    this.resetQuery()
    this.form.pointCode = ''
  },
  mounted () {
    this.getTableHeight()
    window.addEventListener('resize', () => this.getTableHeight())
  },
  methods: {
    checkPermission,
    getTableHeight () {
      this.$nextTick(() => {
        const el_wrap = document.getElementsByClassName('clover_device-main')[0]
        if (el_wrap) {
          const main_header = el_wrap.getElementsByClassName('base_device')[0]
          const main_headerh = main_header.offsetHeight + 1

          const rowp = el_wrap.getElementsByClassName('rowp')[0]
          const rowph = rowp ? rowp.offsetHeight + 10 : 0
          this.deviceHeight = el_wrap.offsetHeight - main_headerh - rowph
        }
        const elleft_wrap = document.getElementsByClassName('searchPoint')[0]
        if (elleft_wrap) {
          const form_header = elleft_wrap.getElementsByClassName('el-form')[0]
          const pagination = elleft_wrap.getElementsByClassName('pagination')[0]

          const form_headerh = form_header.offsetHeight
          const paginationh = pagination.offsetHeight
          this.tableHeight = elleft_wrap.offsetHeight - form_headerh - paginationh - 10
        }
      })
    },
    tsFn (fn) {
      if (this.operArr.length > 0) {
        this.$confirm('当前的审批还未提交，切换将会放弃本次审批操作,确定切换吗?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          this.operArr = []
          fn()
        }).catch(() => {
          this.$message({
            type: 'info',
            message: '已取消切换',
            showClose: true
          })
        })
      } else {
        fn()
      }
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
          this.form.audit = -1

          this.getTagList()

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
      this.currentPoint = null
      this.currentStage = null
      // 清空，点位列表
      this.pointTableData = []

      // 清空工序
      this.procLists = []
      this.operArr = []
      // 清空物料清单,阶段信息
      this.deviceLists = []
      this.stage_list = []
      this.log_info = {
        status: '',
        userID: '',
        userName: '',
        updateTime: '',
        remark: ''
      }
      this.status_info = []
      this.status = false
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
      this.getStatusCount()
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
    async getPointList () {
      this.operArr = []
      this.tableLoading = true
      const params = {
        page_no: this.page.page_no,
        page_size: this.page.page_size,
        project_code: this.form.projectCode,
        tag: this.form.tag,
        point_name: this.form.pointCode,
        child_array: this.form.child,
        area_array: this.form.area,
        status: this.form.status,
        audit: this.form.audit
      }
      const { data, code, message } = await this.$pub.post('/device/design-point-list', params)
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
      this.tableLoading = false
    },
    tableRowClassName ({ row }) {
      return this.currentPoint && row.pointCode === this.currentPoint.pointCode ? 'current-row' : ''
    },
    currentClick (row) {
      if (!row || (this.currentPoint && this.currentPoint.pointCode === row.pointCode)) {
        return
      }

      const changePoint = () => {
        this.currentPoint = row
        this.centerLoading = true
        this.activeClassName = null
        this.status = false
        this.procLists = []
        this.currentStage = null

        const params = {
          project_code: this.form.projectCode,
          point_code: this.currentPoint.pointCode
        }

        this.child = '-1'
        // 中间图表列表
        this.$pub.post('/device/design-point-photo-list', params).then(res => {
          (res.data || []).forEach(f => {
            (f.proc_list || []).map(k => {
              k.pointList = [{
                attach_list: k.attach_list,
                proc_code: k.proc_code,
                proc_name: k.proc_name
              }]
              delete k.attach_list
              return k
            })
            this.procLists.push(f)
          })
          // this.procLists = res.data?res.data:[]
          this.activeClassName = this.procLists[0] ? this.procLists[0].class_code : ''
          this.centerLoading = false
        })
        // 右侧信息
        this.getRightDeviceList()
      }
      this.tsFn(changePoint)
      this.getTableHeight()
    },
    getRightDeviceList () {
      // 获取最右侧信息
      this.devloading = true
      const params = {
        project_code: this.form.projectCode,
        point_code: this.currentPoint.pointCode,
        child_code: this.child,
        stage_code: this.currentStage ? this.currentStage.stage_code : ''
      }
      this.$pub.post('/device/design-reg-info', params).then(res => {
        try {
          this.deviceLists = res.data.device_list ? res.data.device_list : []
          this.log_info = res.data.log_info ? res.data.log_info : {
            status: '',
            userID: '',
            userName: '',
            updateTime: '',
            remark: ''
          }
          this.status = this.log_info.status === 2
          const arr = res.data.stage_list || []
          arr.unshift(this.stage_0)
          arr.push(this.stage_t)
          this.stage_list = arr.map(m => {
            return {
              ...m,
              color: m.status === 3 ? 'blue' : m.status === 2 ? 'green' : '#606266'
            }
          })
          this.devloading = false
        } catch (err) {
          this.devloading = false
        }
      })
    },
    pageChange (num) {
      this.page.page_no = num
      this.getPointList()
    },
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
    statusFormat (datas, value) {
      const actions = []
      Object.keys(datas).map((key) => {
        if (datas[key].dict_value === (value)) {
          actions.push(datas[key].dict_label)
          return false
        }
      })
      return actions.join('')
    },
    valiAnzhuangNum (val, i) {
      const reg = /[^\d]/g
      // const reg = /^(\+?)\d+(\.\d+)?$/g
      const regNums = val.regNums
      const finishNums = val.finishNums
      if (reg.test(finishNums)) {
        val.error = '数量必须为数字'
      } else if (Number(finishNums) > regNums) {
        val.error = '安装数量不能大于设计数量'
      } else {
        val.error = ''
      }
      this.$set(this.deviceLists, i, val)
    },
    valiAnRegNum (val, i) {
      const reg = /[^\d]/g
      const regNums = val.regNums
      const finishNums = val.finishNums
      const isPhotoAdd = val.isPhotoAdd
      if (reg.test(regNums)) {
        val.error = '数量必须为数字'
      } else if (finishNums > Number(regNums) || Number(regNums) < isPhotoAdd) {
        val.error = '设计数量不能小于已安装数量和已绑定照片数量'
      } else {
        val.error = ''
      }
      this.$set(this.deviceLists, i, val)
    },
    async saveData () {
      if (!this.currentPoint) return
      const status = this.status ? 2 : this.log_info.status === 0 ? 0 : 1
      const devices = this.deviceLists.filter(f => !(f.regNums <= 0 && f.status === 0))
      let flag = true

      devices.some(s => {
        if (s.error) {
          flag = false
          return true
        }
      })

      if (!flag) {
        this.$message({
          type: 'error',
          message: '当前物料表有错，请修改后再保存',
          showClose: true
        })
        return
      }
      const params = {
        project_code: this.form.projectCode,
        point_code: this.currentPoint.pointCode,
        user_id: Number(this.$store.state.userInfo.id),
        status: status,
        reg_type: 1,
        devices: devices.map(m => {
          if (m.status !== 3) {
            return {
              device_id: Number(m.id),
              reg_nums: Number(m.regNums),
              status: String(m.status),
              finishNums: m.finishNums
            }
          } else {
            return {
              device_id: Number(m.id),
              reg_nums: Number(m.regNums),
              status: String(1),
              finishNums: m.finishNums
            }
          }
        }),
        build_status: this.status_info.join(','),
        remark: this.log_info.remark
      }
      const { code } = await this.$pub.post('/device/save-reg-info', params)
      if (code === 200) {
        this.$message({
          type: 'success',
          message: '保存成功',
          showClose: true
        })// 成功后刷新左侧列表点位
        this.getRightDeviceList()
      } else {
        this.$message({
          type: 'error',
          message: '保存失败',
          showClose: true
        })
      }
    },
    async buildStatusChange (val) {
      this.devloading = true
      const params = {
        project_code: this.form.projectCode,
        point_code: this.currentPoint.pointCode,
        stage_code: val ? val.stage_code : '',
        status: val.checked ? '3' : '2',
        user_id: Number(this.$store.state.userInfo.id)
      }
      const { code } = await this.$pub.post('device/stage/submit', params)
      if (code === 200) {
        this.$message({
          type: 'success',
          message: '操作成功',
          showClose: true
        })
        this.currentStage = null
        this.getRightDeviceList()
      } else {
        val.checked = false
        this.$message({
          type: 'error',
          message: '操作失败',
          showClose: true
        })
      }
      this.devloading = false
    },
    clickStage (i) {
      this.currentStage = i
      this.getRightDeviceList()
    },
    async changeImgAudit (img, proc_code) {
      const fn = () => {
        const ids = this.operArr.map(m => m.image_id)
        img.proc_code = proc_code
        if (ids.includes(img.image_id)) {
          this.operArr.forEach(f => {
            if (f.image_id === img.image_id) {
              f.num = img.num
            }
          })
        } else {
          this.operArr.push(img)
        }
      }

      if (img.audit === 0) { // 未审核
        const params = {
          project_code: this.form.projectCode,
          point_code: this.currentPoint.pointCode,
          attach_id: img.image_id,
          proc_code: proc_code
        }
        const { data, code } = await this.$pub.post('/proc/device/attach_device_list', params)
        if (code !== 200) {
          this.$message({
            type: 'error',
            message: '接口获取已配置物料失败',
            showClose: true
          })
        } else {
          const materList = (data.list || []).filter(f => f.ct > 0)
          // 盐都二期1.2期 盐都二期 徐州三期
          const projectList = ['YCDF2022-01', 'YCDF2022', 'XCG-2021-024']
          if (materList.length <= 0 && projectList.includes(this.form.projectCode)) {
            this.$confirm('照片还未配置物料，确定审批？', '提示', {
              confirmButtonText: '确定',
              cancelButtonText: '取消',
              type: 'warning'
            }).then(() => {
              fn()
            }).catch(() => {
              img.num = null
            })
          } else {
            fn()
          }
        }
      } else {
        fn()
      }
    },
    async plsp () {
      if (this.operArr.length <= 0) return
      // 1初审通过 3终审通过 4终审未通过   0未审核2初审未通过
      const agree = []// 初审通过集合
      const dis_agree = [] // 初审不通过集合
      const agree_again = []// 终审通过集合
      const dis_agree_again = []// 终审不通过集合

      let design_audit_type = '0'

      this.operArr.forEach(f => {
        if (this.first && this.second) { // 有终审 和 初审权限的
          if (f.num) { // num为true是通过
            (f.audit === 1 || f.audit === 3 || f.audit === 4)
              ? agree_again.push(f.image_id)
              : agree.push(f.image_id)
          } else { // num为false是不通过
            (f.audit === 1 || f.audit === 3 || f.audit === 4)
              ? dis_agree_again.push(f.image_id)
              : dis_agree.push(f.image_id)
          }
        } else if (this.first) { // 只有初审权限的,不管状态都是 ：初审通过agree或者初审不通过dis_agree
          if (f.num) { // num为true是通过
            agree.push(f.image_id)
          } else { // num为false是不通过
            dis_agree.push(f.image_id)
          }
        } else { // 只有终审权限的，上面template里面展示已经限制只有1初审通过 3终审通过 4终审未通过才能出现终审按钮，所以不管状态都是 ：终审通过agree_again或者终审不通过dis_agree_again
          if (f.num) { // num为true是通过
            agree_again.push(f.image_id)
          } else { // num为false是不通过
            dis_agree_again.push(f.image_id)
          }
        }

        /*
          1.初始值design_audit_type = 0
          2.如果审核深化设计照片初审通过 design_audit_type = 1
          3.如果审核深化设计照片初审未通过 design_audit_type = 2
          4.如果存在多张深化设计照片，以初审通过为准 design_audit_type = 1
        */
        if (design_audit_type !== '1' && f.proc_code === 'CLS000-04') { // 深化设计并且还不是1，防止多张照片
          if (f.num && (f.audit === 0 || f.audit === 2)) { // 如果审核深化设计照片初审通过 design_audit_type = 1
            design_audit_type = '1'
          } else if (!f.num && (f.audit === 0 || f.audit === 2)) { // 如果审核深化设计照片初审未通过 design_audit_type = 2
            design_audit_type = '2'
          }
        }
      })
      const params = {
        project_code: this.form.projectCode,
        point_code: this.currentPoint.pointCode,
        audit_level: '1',
        user_id: this.$store.state.userInfo.id,
        user_name: this.$store.state.userInfo.userName,
        agree: agree.join(','), // 初审通过集合
        dis_agree: dis_agree.join(','), // 初审不通过集合
        agree_again: agree_again.join(','), // 终审通过集合
        dis_agree_again: dis_agree_again.join(','), // 终审不通过集合
        design_audit_type
      }
      const { code, message } = await this.$pub.post('/audit/proc-audit', params)
      if (code === 200) {
        this.$message({
          type: 'success',
          message: '处理成功',
          showClose: true
        })
        this.refresh()
        this.operArr = []
      } else {
        this.$message({
          type: 'error',
          message: message || '处理失败',
          showClose: true
        })
      }
    },
    // 深化设计
    refresh () {
      this.centerLoading = true
      this.activeClassName = null
      this.procLists = []
      const params = {
        project_code: this.form.projectCode,
        point_code: this.currentPoint.pointCode
      }
      // 中间图表列表
      this.$pub.post('/device/design-point-photo-list', params).then(res => {
        if (res.code === 200) {
          (res.data || []).forEach(f => {
            (f.proc_list || []).map(k => {
              k.pointList = [{
                attach_list: k.attach_list,
                proc_code: k.proc_code,
                proc_name: k.proc_name
              }]
              delete k.attach_list
              return k
            })
            this.procLists.push(f)
          })
          // this.procLists = res.data?res.data:[]
          this.activeClassName = this.procLists[0] ? this.procLists[0].class_code : ''
          this.centerLoading = false
        } else {
          this.centerLoading = false
          this.procLists = []
          this.$message({
            type: 'error',
            message: '获取工序列表出错了',
            showClose: true
          })
        }
      })
    },
    async getStatusCount () {
      const params = {
        page_no: 1,
        page_size: 1,
        project_code: this.form.projectCode,
        tag: this.form.tag,
        point_name: this.form.pointCode,
        child_array: this.form.child,
        area_array: this.form.area,
        status: 0, // status随便传啥
        audit: this.form.audit
      }
      const { data, code, message } = await this.$pub.post('/device/design-point-count', params)
      if (code !== 200) {
        this.$message({
          type: 'error',
          message: message || '获取状态对应合计数据出错了',
          showClose: true
        })
      }
      this.statusList.forEach(f => {
        if (f.dict_value === 0) { // 深化设计的未登记
          f.count = data.no_reg
        } else { // 深化设计的已登记
          f.count = data.reg
        }
      })
    },
    initPhotoSphere (name, img) {
      this.photoSphereName = name
      this.photoSphereVisible = true
      if (this.viewer) {
        this.viewer.destroy()
      }
      // const url = process.env.VUE_APP_BASE_URL_download
      // img = img.replace(url, '') + '?' + new Date().getTime()
      this.$nextTick(() => {
        this.viewer = new Viewer({
          container: document.querySelector('#viewer'),
          panorama: img,
          size: {
            width: '100%',
            height: '500px'
          }
        })
      })
    },
    // is_lock为1禁止一切操作
    isLock (row) {
      return row.is_lock === 1
    }
  }
}
</script>

<style lang="scss">
.clover_logreg_container_design {
  display: flex;
  /* justify-content: space-between; */
  height: 100%;
  width: 100%;
  box-sizing: border-box;
  background: #fff;
  padding: 20px;

  .cloverLeft {
    width: 90px;
    height: 100%;
    border-right: 1px solid #ededed;
  }

  .cloverLeft li {
    margin-bottom: 20px;
    font-size: 16px;
    font-weight: 550;
    cursor: pointer;
  }

  .searchPoint {
    width: 380px;
    height: 100%;
    border-bottom: 1px solid #ededed;

    .el-pagination--small {
      border: 0;
      // border-top: 1px solid #ededed;
    }
  }

  .searchPoint .el-radio {
    margin-right: 15px;
  }

  .searchPoint .el-radio__label {
    padding-left: 0;
    font-size: 13px;
  }

  .searchPoint .el-form-item {
    margin-bottom: 10px;
  }

  .tableWrap .el-table__body tr.current-row>td {
    background: rgb(68, 120, 241);
    color: #fff;
  }

  .rightWrap {
    width: calc(100% - 450px);
    display: flex;
    justify-content: space-between;
    // height: calc(100% - 20px);
    height: 100%;
  }

  .rightWrap .clover_wrap {
    height: 100%;
    overflow: auto;
    margin-top: 10px;
  }

  .rightWrap .box {
    text-align: center;
    display: inline-block;
    box-sizing: border-box;
    position: relative;
    overflow: hidden;
    padding: 0;
    margin-right: 10px;
    vertical-align: top;
    margin-bottom: 10px;

    .box_img {
      width: 140px;
      position: relative;
      border: 1px solid #eee;
      height: 140px;
      overflow: hidden;

      img {
        width: 140px;
        height: 140px;
      }
    }

    .user {
      width: 100%;
      display: flex;
      justify-content: space-around;
      margin-top: 4px;
    }
  }

  .clover_proc-main {
    width: calc(40% - 172px);
    border-left: 1px solid #ededed;
    padding: 0px 10px 0;
    overflow: auto;
    height: 100%;
    box-sizing: border-box;

    .wrap {
      height: calc(100% - 45px);
      overflow: auto;

      >.el-collapse {
        border-top: none;
      }
    }

    .moreText {
      width: 100%;
      margin-bottom: 10px;
      display: flex;
      justify-content: space-between;
      border-bottom: 1px solid #EBEEF5
    }

    .moreText .tit {
      display: inline-block;
      width: calc(100% - 210px);
      overflow: hidden;
      white-space: nowrap;
      text-overflow: ellipsis;
      line-height: 32px;
    }

    .moreText .el-button {
      padding: 6px 15px;

      .img {
        width: 18px;
        height: 18px;
      }
    }

    .moreText .spbtn {
      cursor: pointer;
      margin-left: 6px;
      padding: 9px 15px;
    }

    .moreText i {
      cursor: pointer;
      font-size: 18px;
    }

    .el-collapse-item__header {
      font-size: 16px;
      font-weight: 550;
    }

    .subtitle {
      color: #409eff;
      display: block;
      display: flex;
      align-items: center;
      margin-bottom: 10px;
    }

    .dir {
      display: flex;
      align-items: center;
    }
  }

  .clover_right_tab {
    width: calc(60% - 228px);
    border-left: 1px solid #ededed;
    overflow: hidden;
    height: 100%;
    box-sizing: border-box;

    .right_tab {
      display: flex;
      align-items: center;
      margin-left: 10px;
      border-bottom: 1px solid #eee;

      li {
        display: inline-block;
        position: relative;
        cursor: pointer;
        height: 26px;
        line-height: 26px;
        border: 1px solid #d8dce5;
        color: #495060;
        background: #fff;
        padding: 0 8px;
        font-size: 12px;
        // &:before{
        //   content: '';
        //   background: #fff;
        //   display: inline-block;
        //   width: 8px;
        //   height: 8px;
        //   border-radius: 50%;
        //   position: relative;
        //   margin-right: 2px;
        // }
      }

      .isActive {
        background-color: #23B7BD;
        color: #fff;
        border-color: #23B7BD;
      }
    }
  }

  .clover_device-main {
    width: 100%;

    ._top {
      display: flex;
      align-items: center;

      .statusText {
        padding: 2px 6px;
        background: #70B617;
        border-radius: 2px;
        color: #fff;
        margin-left: 8px;
        font-size: 12px;
      }
    }

    .sub {
      margin-top: 10px;

      .info {
        padding: 0;
      }
    }

    .opear {
      margin-top: 10px;
      display: flex;
      align-items: center;
      justify-content: space-between;

      .el-checkbox__label {
        font-size: 16px;
        color: #000;
      }
    }

    .info {
      display: flex;
      align-items: center;
      justify-content: space-between;
      flex-wrap: nowrap;
      color: #848484;
      font-weight: 500;
      margin-top: 10px;
      font-size: 14px;
    }

    .deviceTable {
      width: 100%;

      .noFinish {
        .el-input__inner {
          color: #f40;
        }
      }

      .isWeight {
        font-weight: 700;
      }

      .regWrap {
        position: relative;

        .tip {
          white-space: nowrap;
          position: absolute;
          padding: 4px 15px;
          border-radius: 2px;
          background: rgba(0, 0, 0, 0.6);
          color: #fff;
          top: 0px;
          left: -140px;
          width: 120px;
          display: none;
          z-index: 999;
          text-align: left;
        }

        &:hover {
          .tip {
            display: block;
          }
        }
      }

      .el-input__inner {
        padding: 0 5px;
        border-radius: 0;
        height: 30px;
        line-height: 30px;
      }

      thead {
        color: #000;
      }
    }

    .checkGroupself {
      margin-top: 15px;
      // margin-left:10px;
      border-left: 1px solid #ededed;

      .el-checkboxs.isSelect {
        border-bottom: 1px solid #4478f1;

        .isLine {
          &:before {
            border: 1px solid #4478f1;
            background: #4478f1;
          }
        }
      }
    }

    .el-checkboxs {
      border-bottom: 1px solid transparent;
      margin-left: 10px;

      .isLine {
        padding: 4px 6px 4px 2px;
        font-size: 14px;
        cursor: pointer;
        margin-left: 4px;

        &:before {
          width: 1px;
          height: 10px;
          display: inline-block;
          border: 1px solid transparent;
          content: '';
          vertical-align: middle;
          margin-right: 4px;
        }
      }
    }

    .checkGroupself .el-checkboxs {
      margin-right: 0px;
      margin-bottom: 4px;
      display: flex;
      align-items: center;

      &:hover {
        .isLine {
          background: rgb(209, 230, 247);
        }
      }
    }

    .checkGroupself .el-checkbox__label {
      padding-left: 4px;
      display: none;
    }
  }

  .nodata {
    width: 100%;
    text-align: center;
  }

  .imgRadio .el-radio:first-child {
    margin-right: 15px;
  }

  .imgRadio {
    .disagree {
      .el-radio__inner {
        border: 1px solid #f40;
      }

      .el-radio__input.is-checked .el-radio__inner {
        background: #f40;
      }
    }
  }

  .remarktitle {
    font-family: "Microsoft YaHei", "微软雅黑";
    display: block;
    font-size: 14px;
    color: red;
    width: 100%;
    text-align: left;
    margin-top: 10px;
  }

  .remarkRow {
    width: 100%;
    text-align: left;
    margin-bottom: 10px;
  }

  .pointNum:hover {
    color: #fff;
    background: #409eff;
  }

  .pointNum {
    display: inline-block;
    border-radius: 10px;
    padding: 5px 20px;
    cursor: pointer;
    opacity: 0.9;
  }

  .normalpot {
    display: inline-block;
    border-radius: 10px;
    padding: 5px 20px;
    opacity: 0.9;
  }

  .wrap.isColl {
    ._left {
      width: 10px;
      overflow: hidden;

      .el-form {
        opacity: 0;
        margin-top: 40px;
      }
    }

    ._right {
      width: calc(100% - 30px);
    }
  }

  .wrap {
    position: relative;

    .changeIcon {
      position: absolute;
      top: 50%;
      left: 285px;
      cursor: pointer;
      font-size: 40px;
      color: #999;
    }

    .el-icon-caret-right {
      top: 50%;
      left: -5px;
    }
  }
}
</style>

<style lang="scss">
.clover_logreg_container_design {
  .more {
    text-overflow: ellipsis;
    overflow: hidden;
    width: auto !important;
    white-space: nowrap;
  }

  .el-pagination--small .btn-next,
  .el-pagination--small .btn-prev,
  .el-pagination--small .el-pager li,
  .el-pagination--small .el-pager li.btn-quicknext,
  .el-pagination--small .el-pager li.btn-quickprev,
  .el-pagination--small .el-pager li:last-child {
    border-color: transparent;
    font-size: 12px;
    line-height: 22px;
    height: 22px;
    min-width: 20px !important;
  }

  .el-pagination {
    white-space: nowrap;
    padding: 2px 0px !important;
    color: #303133;
    font-weight: 700;
  }

  .el-input__inner {
    border-radius: 0px !important;
    height: 30px !important;
    line-height: 30px !important;
  }

  .tableWrap td {
    cursor: pointer;
  }

  .dir :nth-child(3) {
    margin-left: 10px;
  }

  .img_wrap {
    height: 21px;
    display: flex;
    align-items: center;
    border: 1px solid #EBEEF5;
    padding: 0 10px;
    cursor: pointer;
  }

  .img {
    cursor: pointer;
    margin-right: 5px;
  }
}

.clover_logreg_container {
  .pointNum:hover {
    color: #fff;
    background: #409eff;
  }

  .pointNum {
    display: inline-block;
    border-radius: 10px;
    padding: 5px 20px;
    cursor: pointer;
    opacity: 0.9;
  }

  .normalpot {
    display: inline-block;
    border-radius: 10px;
    padding: 5px 20px;
    opacity: 0.9;
  }

  .wrap.isColl {
    ._left {
      width: 10px;
      overflow: hidden;

      .el-form {
        opacity: 0;
        margin-top: 40px;
      }
    }

    ._right {
      width: calc(100% - 30px);
    }
  }

  .wrap {
    position: relative;

    .changeIcon {
      position: absolute;
      top: 50%;
      left: 285px;
      cursor: pointer;
      font-size: 40px;
      color: #999;
    }

    .el-icon-caret-right {
      top: 50%;
      left: -5px;
    }
  }
}
</style>
