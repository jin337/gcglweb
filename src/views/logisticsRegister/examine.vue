<template>
  <div class="clover_logreg_container" v-loading="loading">
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
        <el-form-item label="施工单位">
          <el-select v-model="form.dept_id" clearable collapse-tags style="width:100%" placeholder="默认施工单位"
            @change="handleSelectChange">
            <el-option v-for="item in BuilderList" :key="item.id" :label="item.name" :value="item.id">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="拍照日期">
          <el-date-picker v-model="form.phototime" @change="handleSelectChange" type="daterange" placeholder="选择拍照日期"
            style="width:100%" range-separator="至" start-placeholder="开始日期" value-format="yyyy-MM-dd"
            end-placeholder="结束日期">
          </el-date-picker>
        </el-form-item>
        <el-form-item label="图片状态">
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
    <!-- 工序 -->
    <div class="clover_proc-main" v-loading="centerLoading">
      <div class="moreText" v-if="currentPoint">
        <span class="tit">
          {{ currentPoint.pointCode }} {{ currentPoint.pointName }}
        </span>
        <div style="font-size:18px;" v-if="!isLock(currentPoint)">
          <el-button-group>
            <el-tooltip class="item" effect="dark" content="全部工序" placement="top-start">
              <el-button size="small" @click="changeIsList('0')" :style="{ color: isStatus === '0' ? '#409EFF' : '' }">
                <img
                  :src="isStatus === '0' ? require('../../assets/images/all_checked.png') : require('../../assets/images/all.png')"
                  alt="">
              </el-button>
            </el-tooltip>
            <el-tooltip class="item" effect="dark" content="待审工序" placement="top-start">
              <el-button size="small" v-if="first || second" @click="changeIsList('1')"
                :style="{ color: isStatus == '1' ? '#409EFF' : '' }">
                <img
                  :src="isStatus === '1' ? require('../../assets/images/no_review_checked.png') : require('../../assets/images/no_review.png')"
                  alt="">
              </el-button>
            </el-tooltip>
            <el-tooltip class="item" effect="dark" content="审核未通过工序" placement="top-start">
              <el-button size="small" v-if="first || second" @click="changeIsList('2')"
                :style="{ color: isStatus === '2' ? '#409EFF' : '' }">
                <img
                  :src="isStatus === '2' ? require('../../assets/images/review_failed_checked.png') : require('../../assets/images/review_failed.png')"
                  alt="">
              </el-button>
            </el-tooltip>
          </el-button-group>
        </div>
      </div>
      <div class="wrap scrollWrap" v-if="procLists.length > 0">
        <el-collapse :value="activeClassName">
          <el-collapse-item v-for="item in procLists" :key="item.class_name" :title="item.class_name"
            :name="item.class_name">
            <div slot="title">{{ item.class_name }}</div>
            <!-- 物料照片 -->
            <div v-if="item.device_attach_list.length > 0">
              <span class="subtitle">物料照片</span>
              <div class="proc-item" v-for=" (deviceimg, k) in item.device_attach_list" :key="deviceimg.device_id + k">
                <div class="deviceimg_title">
                  <h3 style="margin-left:20px;">{{ deviceimg.name }}</h3>
                </div>
                <div class="clover_wrap" v-viewer="options"
                  v-if="deviceimg.device_att_proc && deviceimg.device_att_proc.length > 0">
                  <div class="box devimgbox" v-for="proc in deviceimg.device_att_proc" :key="proc.proc_code">
                    <span>{{ proc.proc_name }}</span>
                    <div class="box_img">
                      <img src="../../assets/images/nopic.png" :data-source="require('../../assets/images/nopic.png')"
                        style="width: 140px;object-fit:contain; " v-if="!proc.filePath" />
                      <el-tooltip effect="dark" placement="right-end" v-if="proc.remark || proc.lastTime">
                        <!--  有备注信息的  照片or全场景照片  -->
                        <div slot="content">
                          {{ proc.lastTime }}
                          <p style="margin-top:10px;" v-if="proc.remark">备注：{{ proc.remark }}</p>
                        </div>
                        <img :src="proc.filePathThumb" :data-source="proc.filePathTrans" :key="proc.filePath"
                          style="width: 140px;" v-if="proc.is360 !== 1" />
                        <img :src="proc.filePathThumb" style="width: 140px;" :key="proc.filePath"
                          v-if="proc.is360 === 1" @click="initPhotoSphere(proc.procName, proc.filePathTrans)" />
                      </el-tooltip>
                      <!-- 无备注信息的 照片or全场景照片-->

                      <template v-else>
                        <img :src="proc.filePathThumb" :data-source="proc.filePathTrans" :key="proc.filePath"
                          style="width: 140px;" v-if="proc.is360 !== 1" />
                        <img :src="proc.filePathThumb" style="width: 140px;height:140px;" :key="proc.filePath"
                          v-if="proc.is360 === 1" @click="initPhotoSphere(proc.procName, proc.filePathTrans)" />
                      </template>
                      <div class="sett" v-if="currentPoint && !isLock(currentPoint)">
                        <el-tooltip effect="dark" content="配置物料"
                          v-if="checkPermission(['logisticsRegister:proc']) && proc.is_fill_device === 1">
                          <i :class="{ 'el-icon-setting': true, item: true, 'ishavepeizhi': proc.is_submit_count !== '' }"
                            @click="materDeviceSetting(proc)"></i>
                        </el-tooltip>
                      </div>
                    </div>
                    <div class="user" v-if="proc.filePath">
                      <span>拍摄: {{ proc.submit }}</span>
                      <span v-if="proc.isCore === 1"
                        :style="{ fontWeight: 'bold', color: proc.audit === 0 ? 'Orange' : (proc.audit === 1 || proc.audit === 3) ? '#70b617' : '#F56C6C' }">
                        {{ selectDictLabel(imgAudit, proc.audit) }}</span>
                    </div>
                    <div class="dep" v-if="proc.filePath">
                      <span>部门：{{ proc.department }}</span>
                    </div>
                    <div v-if="!proc.filePath" style="color:#999;">暂无图片</div>
                    <div
                      v-if="proc.filePath && imgExamine.includes(proc.audit) && first && currentPoint && !isLock(currentPoint)">
                      <el-radio-group v-model="proc.deviceimgRadio" @change="changeImgAudit(proc, proc.proc_code)"
                        class="imgRadio">
                        <el-radio :label="1">通过</el-radio>
                        <el-radio :label="2" class="disagree">不通过</el-radio>
                      </el-radio-group>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <!-- 工序步骤照片 -->
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
                <div v-if="pointDirect.direction" class="dir">
                  <span style="margin-left:20px;">方向：</span>
                  <span>{{ pointDirect.direction }}</span>
                </div>
                <div class="clover_wrap" v-viewer="options" v-if="pointDirect.attach_list.length > 0">
                  <div class="box" v-for="img in pointDirect.attach_list" :key="img.image_id">
                    <div class="box_img">
                      <el-tooltip effect="dark" placement="right-end" v-if="img.remark || img.lastTime">
                        <!--  有备注信息的  照片or全场景照片  -->
                        <div slot="content">
                          {{ img.lastTime }}
                          <p style="margin-top:10px;" v-if="img.remark">备注：{{ img.remark }}</p>
                        </div>
                        <img :src="img.file_path_thumb" :data-source="img.file_path_trans" :key="img.file_path"
                          style="width: 140px;" v-if="img.is360 !== 1" />
                        <img :src="img.file_path_thumb" style="width: 140px;height:140px;" :key="img.file_path"
                          v-if="img.is360 === 1" @click="initPhotoSphere(procitem.procName, img.file_path_trans)" />
                      </el-tooltip>
                      <!-- 无备注信息的 照片or全场景照片-->

                      <template v-else>
                        <img :src="img.file_path_thumb" :data-source="img.file_path_trans" :key="img.file_path"
                          style="width: 140px;" v-if="img.is360 !== 1" />
                        <img :src="img.file_path_thumb" style="width: 140px;height:140px;" :key="img.file_path"
                          v-if="img.is360 === 1" @click="initPhotoSphere(procitem.procName, img.file_path_trans)" />
                      </template>
                      <div class="sett" v-if="currentPoint && !isLock(currentPoint)">
                        <el-tooltip effect="dark" content="配置物料"
                          v-if="checkPermission(['logisticsRegister:proc']) && img.is_fill_device === 1">
                          <i :class="{ 'el-icon-setting': true, item: true, 'ishavepeizhi': img.is_submit_count !== '' }"
                            @click="materSetting(img, procitem)"></i>
                        </el-tooltip>
                        <el-tooltip effect="dark" content="迁移照片"
                          v-if="procitem.isDesign === 0 && (item.class_code !== 'CLS100') && checkPermission(['logisticsRegister:procTransfer'])">
                          <i class="el-icon-sort item" @click="sureTransferDan(img, procitem, pointDirect)"></i>
                        </el-tooltip>
                      </div>
                    </div>
                    <div class="user">
                      <span>拍摄: {{ img.submit }}</span>
                      <span v-if="procitem.is_core === 1"
                        :style="{ fontWeight: 'bold', color: img.audit === 0 ? 'Orange' : (img.audit === 1 || img.audit === 3) ? '#70b617' : '#F56C6C' }">
                        {{ selectDictLabel(imgAudit, img.audit) }}</span>
                    </div>
                    <div class="dep">
                      <span>部门：{{ img.department }}</span>
                    </div>
                    <div
                      v-if="currentPoint && !isLock(currentPoint) && (procitem.is_core === 1 && procitem.procCode !== 'CLS000-04' || (additional.includes(form.projectCode) && procitem.procCode === 'CLS009-04'))">
                      <el-radio-group v-model="img.num" @change="changeImgAudit(img, pointDirect.proc_code)"
                        class="imgRadio" v-if="(first && imgExamine.includes(img.audit))">
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
        <el-backtop target=".scrollWrap" :right="topRight" :visibility-height="150"></el-backtop>
      </div>
      <!-- 工序 无数据 -->
      <div v-if="procLists.length <= 0" class="nodata">
        <el-image :src="require(`@/assets/images/null.png`)" style="height: 50px; width: 80px;margin-top:100px;"
          v-loading="centerLoading"></el-image>
        <p style="color: grey">暂无点位工序拍照数据</p>
      </div>
    </div>

    <div class="clover_right_tab">
      <ul class="right_tab">
        <li v-for="item in tabList" @click="changeShowtab(item)" :key="item.id"
          :class="{ isActive: item.id === currentRightTab }">{{ item.name }}</li>
      </ul>
      <!-- 物料清单 -->
      <DeviceInformation ref="deviceinfo" v-show="currentRightTab === 1" :point="currentPoint"
        :projectCode="form.projectCode" :isSaveBtn="currentPoint && !isLock(currentPoint)" :isCHU="true"
        @changeLoading="changeLoading">
      </DeviceInformation>
      <!-- 链路信息 -->
      <LinkInformation v-show="currentRightTab === 2" :point="currentPoint" :projectCode="form.projectCode"
        :isEdit="currentPoint && !isLock(currentPoint)" @changeLoading="changeLoading"></LinkInformation>

      <!-- 取电信息 -->
      <PowerCessInformation v-show="currentRightTab === 3" :point="currentPoint" :projectCode="form.projectCode"
        :isEdit="currentPoint && !isLock(currentPoint)" @changeLoading="changeLoading"></PowerCessInformation>
    </div>

    <!-- 全景照片 -->
    <el-dialog :title="photoSphereName" :visible.sync="photoSphereVisible" :footer="false" :append-to-body="true"
      width="70%">
      <div id="viewer"></div>
    </el-dialog>

    <!-- 工序里面的图片配置物料 -->
    <el-dialog title="" :visible.sync="settingMaterFlag" :footer="false" :append-to-body="true"
      custom-class="proc-mac-setting" :show-close="false" width="70%">
      <proc-mar v-if="settingMaterFlag" :settingMaterFlag.sync="settingMaterFlag" :current="currentSettingImg"
        :project_code="form.projectCode" :point_code="currentPoint.pointCode"
        @getRightDeviceList="getRightDeviceList"></proc-mar>
    </el-dialog>

    <!-- 工序里面的图片迁移 -->
    <el-drawer title="" :visible.sync="showAllProc" :append-to-body="true" custom-class="proc-transfer-setting"
      size="800px">
      <proc-transfer v-if="showAllProc" :showAllProc.sync="showAllProc" :transferData="transferData"
        @refreshCenter="refreshCenter"></proc-transfer>
    </el-drawer>
  </div>
</template>

<script>
import { Viewer } from 'photo-sphere-viewer'
import 'photo-sphere-viewer/dist/photo-sphere-viewer.css'
import { checkPermission } from '@/utils/tool'
import procMar from './procMar.vue'
import procTransfer from './procTransfer.vue'
import LinkInformation from './LinkInformation.vue'
import PowerCessInformation from './PowerCessInformation.vue'
import DeviceInformation from './DeviceInformation.vue'

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
        hasNew: -1,
        deviceAudit: 0,
        dept_id: '',
        phototime: null,
        begin_time: '',
        end_time: '',
        area: null,
        child: null,
        audit: -1
      },
      projectList: [],
      tagList: [],
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
        { dict_label: '全部', dict_value: -1 }, { dict_label: '未审核', dict_value: 0 }, { dict_label: '初审通过', dict_value: 1 }, { dict_label: '初审未通过', dict_value: 2 },
        { dict_label: '终审通过', dict_value: 3 }, { dict_label: '终审未通过', dict_value: 4 }
      ],
      deviceAuditList: [
        { dict_label: '全部', dict_value: 0, count: 0 }, { dict_label: '未审核', dict_value: 1, count: 0 }
      ],
      statusList: [
        { dict_label: '未登记', dict_value: 0, count: 0 }, { dict_label: '已登记', dict_value: 1, count: 0 }, { dict_label: '已完成', dict_value: 2, count: 0 }
      ],
      imgExamine: [0, 1, 2, 4],
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
      currentPoint: null,
      activeClassName: null,
      loading: false,
      datanums: 0, // 处理loading，中间，右侧都返回数据再取消loading
      procLists: [], // 工序列
      options: {
        toolbar: true,
        url: 'data-source'
      },
      tableLoading: false,
      centerLoading: false,
      timer: null,
      isStatus: '0', // 查看所有列表
      // 全景照片
      viewer: '',
      photoSphereVisible: false,
      photoSphereName: '',
      currentSettingImg: null, // 当前待配置物料的图片信息
      settingMaterFlag: false, // 图片配置物料的弹窗
      showAllProc: false, // 迁移工序
      transCurrentPintDirect: null, // 前端选中的迁移这条数据
      transferData: {}, // 迁移的传递数据信息
      additional: ['YDGC2021-ZB055', 'YCDF2022', 'YCDF2022-01'],
      tabList: [
        { name: '物料清单', id: 1 }, { name: '链路信息', id: 2 }, { name: '取电信息', id: 3 }
      ],
      currentRightTab: 1,
      topRight: 40// 回到顶部按钮位置
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
  components: { procMar, procTransfer, LinkInformation, PowerCessInformation, DeviceInformation },
  created () {
    this.getProjectsList()
    this.resetQuery()
    this.form.pointCode = ''
    this.currentRightTab = 1
    this.isStatus = '0'
  },
  mounted () {
    this.getTableHeight()
    window.addEventListener('resize', () => this.getTableHeight())
  },
  methods: {
    checkPermission,
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
          this.form.audit = -1
          this.form.phototime = null

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
      this.currentPoint = null
      // 清空，点位列表
      this.pointTableData = []

      // 清空工序
      this.procLists = []
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
      this.tableLoading = true
      const params = {
        page_no: this.page.page_no,
        page_size: this.page.page_size,
        project_code: this.form.projectCode,
        tag: this.form.tag,
        point_name: this.form.pointCode,
        child_array: this.form.child,
        area_array: this.form.area,
        has_new: this.form.hasNew,
        device_audit: this.form.deviceAudit,
        dept_id: this.form.dept_id ? this.form.dept_id : 0,
        begin_time: this.form.phototime ? this.form.phototime[0] : '',
        end_time: this.form.phototime ? this.form.phototime[1] : ''
      }

      const { data, code, message } = await this.$pub.post('/device/build-point-list', params)
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
    pageChange (num) {
      this.page.page_no = num
      this.getPointList()
    },
    currentClick (row) {
      if (!row || (this.currentPoint && this.currentPoint.pointCode === row.pointCode)) {
        return
      }
      this.currentPoint = row
      this.loading = true
      this.activeClassName = null
      this.procLists = []
      this.datanums = 0

      this.refreshCenter()
      this.getTableHeight()
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
    // 施工登记刷新
    refreshCenter () {
      this.centerLoading = true
      this.transCurrentPintDirect = null
      /* 0全部
        1初审未审核
        2终审未审核
        3全部未审核
      */
      const isStatus = this.isStatus
      const obj = {
        project_code: this.form.projectCode,
        point_code: this.currentPoint.pointCode,
        isStatus
      }
      this.$pub.post('/point/proc_submit_web_list_again', obj).then(res => {
        if (res.code === 200) {
          this.procLists = [];
          (res.data || []).forEach(f => {
            (f.procList || []).forEach(k => {
              (k.pointList || []).map(m => {
                m.transfer = false // 是否展示迁移checkbox
                const tempObj = {
                  attach_list: m.attachmentList.map(s => {
                    return {
                      audit: s.audit,
                      file_path: s.filePath,
                      file_path_thumb: s.filePathThumb,
                      file_path_trans: s.filePathTrans,
                      image_id: s.id,
                      submit: s.submit,
                      create_time: s.updateTime,
                      isTransfer: 0,
                      ...s
                    }
                  }),
                  proc_code: k.procCode,
                  proc_name: k.procName
                }
                Object.assign(m, tempObj)
                return m
              })
              k.proc_code = k.procCode
              k.proc_name = k.procName
            })
            this.procLists.push({
              class_name: f.className,
              class_code: f.classCode,
              proc_list: f.procList,
              device_attach_list: (f.device_attach_list || []).map(m => {
                /**
                 * 不展示审核按钮:
                 * 有图片状态不是未审核 初审通过 初审未通过 终审未通过，那整个当前物料照片不可以有审核按钮
                 */
                // const haveCheck = (m.device_att_proc || []).filter(device => !this.imgExamine.includes(device.photo_info.audit))// 不符合规定的数组
                return {
                  device_id: m.device_id,
                  device_name: m.device_nam,
                  name: m.device_name + '_' + m.no,
                  // haveCheck: haveCheck.length <= 0,
                  device_att_proc: (m.device_att_proc || []).map(j => {
                    return j.photo_info ? {
                      proc_code: j.proc_code,
                      proc_name: j.proc_name,
                      ...j.photo_info,
                      image_id: j.photo_info.id,
                      deviceimgRadio: 0// 0是默认不填写，1通过，2不通过
                    } : {
                      proc_code: j.proc_code,
                      proc_name: j.proc_name
                    }
                  })
                }
              })
            })
          })
          this.activeClassName = this.activeClassName ? this.activeClassName : this.procLists[0] ? this.procLists[0].class_name : ''
        } else {
          this.procLists = []
          this.$message({
            type: 'error',
            message: '获取工序列表出错了',
            showClose: true
          })
        }
        this.centerLoading = false
        this.changeLoading()
      })
    },
    // 刷新最右侧数据
    refreshRightDeviceList () {
      this.$refs.deviceinfo.getList()
    },
    // 控制整体loading
    changeLoading () {
      this.datanums++
      if (this.datanums === 4) {
        this.loading = false
      }
    },
    // 切换工序上面的状态图标展示不一样的图片
    changeIsList (isStatus) {
      this.isStatus = isStatus
      this.activeClassName = null
      this.refreshCenter()
    },
    // 弃用
    async getStatusCount () {
      const params = {
        page_no: 1,
        page_size: 1,
        project_code: this.form.projectCode,
        tag: this.form.tag,
        point_name: this.form.pointCode,
        child_array: this.form.child,
        area_array: this.form.area,
        has_new: this.form.hasNew,
        device_audit: this.form.deviceAudit,
        dept_id: this.form.dept_id ? this.form.dept_id : 0,
        begin_time: this.form.phototime ? this.form.phototime[0] : '',
        end_time: this.form.phototime ? this.form.phototime[1] : ''
      }

      const { data, code, message } = await this.$pub.post('/device/build-point-count', params)
      if (code !== 200) {
        this.$message({
          type: 'error',
          message: message || '获取状态对应合计数据出错了',
          showClose: true
        })
      }
      if (this.regType === 2) { // 施工登记的待审
        this.hasNewList[0].count = data.no_audit
        this.hasNewList[1].count = data.faild_audit
      } else {
        this.statusList.forEach(f => {
          if (f.dict_value === 0) { // 深化设计的未登记
            f.count = data.no_reg
          } else { // 深化设计的已登记
            f.count = data.reg
          }
        })
      }
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
    materSetting (img, proc) {
      this.currentSettingImg = img
      this.currentSettingImg.proc_code = proc.procCode
      this.settingMaterFlag = true
    },
    materDeviceSetting (proc) {
      this.currentSettingImg = proc
      this.settingMaterFlag = true
    },
    // 迁移 start 多选
    showTransfer (pointDirect, flag) {
      if (this.transCurrentPintDirect) { // 还原之前的
        this.transCurrentPintDirect.transfer = false
        this.transCurrentPintDirect.attach_list.map(m => {
          m.isTransfer = 0
        })
      }
      this.transCurrentPintDirect = pointDirect
      pointDirect.transfer = flag
      if (!flag) {
        pointDirect.attach_list.map(m => {
          m.isTransfer = 0
        })
      }
    },
    // 多选
    sureTransfer (proc, pointDirect) {
      const { proc_code, proc_name } = proc
      this.transferData = {
        proc_code,
        proc_name,
        direction: pointDirect.direction,
        project_code: this.form.projectCode,
        point_code: this.currentPoint.pointCode
      }
      this.transferData.images = []
      pointDirect.attach_list.map(m => {
        if (m.isTransfer === 1) {
          this.transferData.images.push(m)
        }
      })

      if (this.transferData.images.length > 0) {
        this.showAllProc = true
      } else {
        this.$message({
          message: '必须选中照片才可以迁移',
          type: 'error',
          showClose: true,
          customClass: 'uploadMessage'
        })
      }
    },
    // 单选
    sureTransferDan (img, proc, pointDirect) {
      const { proc_code, proc_name } = proc
      this.transferData = {
        proc_code,
        proc_name,
        direction: pointDirect.direction,
        project_code: this.form.projectCode,
        point_code: this.currentPoint.pointCode,
        images: [img]
      }
      this.showAllProc = true
    },
    // 迁移end
    // 切换物料信息，链路信息 取电信息
    changeShowtab (item) {
      if (this.currentRightTab === item.id) {
        return
      }
      this.currentRightTab = item.id
      this.getTableHeight()
    },
    // 审核图片
    async changeImgAudit (img, proc_code) {
      const fn = async () => {
        const check = !!(img.num || img.deviceimgRadio === 1)
        const agree = check ? img.image_id + '' : ''// 初审通过集合
        const dis_agree = check ? '' : img.image_id + ''// 初审不通过集合
        const params = {
          project_code: this.form.projectCode,
          point_code: this.currentPoint.pointCode,
          audit_level: '1',
          user_id: this.$store.state.userInfo.id,
          user_name: this.$store.state.userInfo.userName,
          agree, // 初审通过集合
          dis_agree, // 初审不通过集合
          agree_again: '', // 终审通过集合
          dis_agree_again: '', // 终审不通过集合
          design_audit_type: '0'
        }
        const { code, message } = await this.$pub.post('/audit/proc-audit', params)
        if (code === 200) {
          this.$message({
            type: 'success',
            message: '处理成功',
            showClose: true
          })

          this.refreshCenter()
        } else {
          this.$message({
            type: 'error',
            message: message || '处理失败',
            showClose: true
          })
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
          const projectList = ['YCDF2022-01', 'YCDF2022', 'XCG-2021-024']// 'TEST20200610'
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
    // 获取右侧物料信息
    getRightDeviceList () {
      if (this.$refs.deviceinfo) {
        this.$refs.deviceinfo.getList()
      }
    },
    // is_lock为1禁止一切操作
    isLock (row) {
      return row.is_lock === 1
    }
  }
}
</script>

<style lang="scss">
.clover_logreg_container {
  box-sizing: border-box;
  background: #fff;
  padding: 20px;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: space-between;

  // 左侧查询点位区
  .searchPoint {
    width: 300px;
    height: 100%;
    border-bottom: 1px solid #ededed;
    border-right: 1px solid #ededed;
    border-left: 1px solid #ededed;

    .el-pagination--small {
      border: 0;
    }

    .el-radio {
      margin-right: 15px;

      .el-radio__label {
        padding-left: 0;
        font-size: 13px;
      }
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

  // 中间工序照片区
  .clover_proc-main {
    width: calc(40% - 120px);
    padding: 0px 10px 0;
    overflow: auto;
    height: 100%;
    box-sizing: border-box;

    .wrap {
      height: calc(100% - 45px);
      overflow: auto;
      position: relative;

      >.el-collapse {
        border-top: none;
      }

      .el-collapse-item__header {
        font-size: 16px;
        font-weight: 550;

        .title {
          width: 100%;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .opearbtn {
          margin-right: 20px;

          .el-button+.el-button {
            margin-left: 0px;
          }
        }
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

    .moreText {
      width: 100%;
      margin-bottom: 10px;
      display: flex;
      justify-content: space-between;
      border-bottom: 1px solid #EBEEF5;

      .tit {
        display: inline-block;
        width: calc(100% - 210px);
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
        line-height: 32px;
      }

      .el-button {
        padding: 6px 15px;

        .img {
          width: 18px;
          height: 18px;
        }
      }

      .spbtn {
        cursor: pointer;
        margin-left: 6px;
        padding: 9px 15px;
      }

      i {
        cursor: pointer;
        font-size: 18px;
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

    .deviceimg_title {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-right: 45px;
      box-sizing: border-box;
    }

    .el-icon-sort {
      transform: rotateZ(90deg);
    }
  }

  // 右侧物料等tab区
  .clover_right_tab {
    width: calc(60% - 180px);
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
          left: -110px;
          display: none;
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

  .clover_wrap {
    height: 100%;
    overflow: auto;
    margin-top: 10px;
  }

  .box {
    text-align: center;
    display: inline-block;
    box-sizing: border-box;
    position: relative;
    overflow: hidden;
    padding: 0;
    margin-right: 10px;
    vertical-align: top;
    margin-bottom: 20px;

    .box_img {
      width: 140px;
      position: relative;
      border: 1px solid #eee;
      height: 140px;
      overflow: hidden;

      img {
        width: 140px;
        height: 140px;
        object-fit: cover;
      }
    }

    .sett {
      // 多选配置时
      // position:absolute;
      // top: -30px;
      // left: -30px;
      // width: 60px;
      // height:60px;
      // border-radius: 50%;
      // background: #fff;
      // font-size:18px;
      // border:1px solid #eee;
      // box-sizing: border-box;
      // cursor:pointer;
      // .el-icon-setting{
      //   position:absolute;
      //   top: 33px;
      //   left: 32px;
      //   color:#000;
      // }
      // 单选
      position: absolute;
      top: 0px;
      left: 0px;

      .item {
        padding: 6px;
        background: #eee;
        color: #000;
        cursor: pointer;
        border: 1px solid #fff;
      }

      .ishavepeizhi {
        color: #4478f1;
      }
    }

    .check {
      position: absolute;
      top: 118px;
      right: 0px;

      .el-checkbox__inner {
        width: 20px;
        height: 20px;

        &:after {
          height: 10px;
          width: 3px;
          left: 8px;
          top: 2px;
        }
      }
    }

    .user {
      width: 100%;
      display: flex;
      justify-content: space-around;
      margin-top: 4px;
    }
  }
}
</style>

<style lang="scss">
.clover_logreg_container {
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
</style>
