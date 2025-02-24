<template>
  <div class="pointInfo_container" v-loading="dataLoading">

    <ul class="_left">
      <li v-for="(procmain, i) in procLists" @click="jumpTo(procmain, i)" :key="procmain.className"
        :class="{ 'isActive': activeMenu === procmain.className, 'iscomplate': procmain.uuid === 'complate' }">
        {{ procmain.className }}
      </li>
    </ul>

    <div class="_right">
      <div class="header">
        <div class="title">
          <span class="tit">工序拍照详情</span>
          <div class="btns">
            <el-button type="primary" size="mini" icon="el-icon-refresh-left"
              @click.native="handleRefresh">刷新</el-button>
            <el-button type="primary" size="mini" icon="el-icon-s-order" @click="handleShowMemo"
              v-if="checkPermission(['points:memoList'])">备忘录</el-button>
            <el-button type="primary" size="mini" icon="el-icon-s-grid" @click="handleShowIPList"
              v-if="checkPermission(['points:ipList'])">IP列表</el-button>
            <el-button type="primary" size="mini" icon="el-icon-circle-plus-outline" @click.native="handleShowAddInfo"
              v-if="haveaddPhoto && checkPermission(['points:proPhotoImp'])">添加工序照片</el-button>
            <el-button size="mini" icon="el-icon-male" @click.native="showMap">地图查看</el-button>
          </div>
        </div>
        <div class="tit_sub">
          <span class="point-name">点位编码:{{ pointInfo.point_code }}</span>
          <span class="point-name over">点位名称:{{ pointInfo.point_name }}</span>
          <!-- <span class="point-name" v-if="positions.length>0">点位经纬度:{{ positions[0].toFixed(8)}},{{positions[1].toFixed(8)}}</span> -->
          <span class="point-name" v-if="positions.length > 0">点位经纬度:{{ positions[0] }},{{ positions[1] }}</span>
        </div>
      </div>
      <div class="proc_content" :class="{ 'isshsjwrap': !shsjList || filterProcList.length <= 0 }">
        <el-collapse :value="opened" class="proc_left" v-if="filterProcList.length > 0" id="scrollBox"
          @change="changeCollapse">
          <template v-for="(procmain, j) in filterProcList">
            <el-collapse-item v-if="procmain.className !== '深化设计'" :key="procmain.className + j"
              :title="procmain.className" :name="procmain.className" class="do-jump" :id="procmain.uuid">
              <div slot="title">
                <h3>{{ procmain.className }}
                  <i style="font-size:18px;" :class="complate.isEdit ? 'el-icon-folder-delete' : 'el-icon-edit'"
                    @click.stop="changeComplateEdit" v-if="procmain.uuid === 'complate'"
                    v-hasPermi="['points:editIp']"></i>
                </h3>
              </div>
              <div style="display:flex;align-items:top;justify-content:flex-start" v-if="procmain.uuid !== 'complate'">
                <div :class="{ 'deveiwrap': true, isSHSJ: procmain.className === '深化设计' }">
                  <div class="proc-item" v-for="(procitem, i) in procmain.procList" :key="procitem.procCode + i">
                    <span class="subtitle">
                      <i class="el-icon-camera"></i>
                      {{ procitem.procName }}
                    </span>
                    <div v-for="(pointDirect, i) in procitem.pointList"
                      :key="pointDirect.direction ? pointDirect.direction + i + 'point' : i + 'point'">
                      <template v-if="pointDirect.direction">
                        <span>方向：</span>
                        <span>{{ pointDirect.direction }}</span>
                      </template>
                      <div class="container" v-viewer="options">
                        <div class="block" v-for="imageitem in pointDirect.attachmentList" :key="imageitem.id">
                          <el-tooltip effect="dark" :content="imageitem.remark" placement="top-start"
                            v-if="imageitem.remark">
                            <!--  有备注信息的  照片or全场景照片  -->
                            <img :src="imageitem.filePathThumb" :data-source="imageitem.filePathTrans"
                              style="width: 100px; height:  100px" :key="imageitem.filePath"
                              v-if="imageitem.is360 === 0" />
                            <img :src="imageitem.filePathThumb" style="width: 100px; height: 100px"
                              :key="imageitem.filePath" v-if="imageitem.is360 === 1"
                              @click="initPhotoSphere(procitem.procName, imageitem.filePathTrans)" />
                          </el-tooltip>
                          <!-- 无备注信息的 照片or全场景照片-->

                          <template v-else>
                            <img :src="imageitem.filePathThumb" :data-source="imageitem.filePathTrans"
                              style="width: 100px; height: 100px" :key="imageitem.filePath"
                              v-if="imageitem.is360 === 0" />
                            <img :src="imageitem.filePathThumb" style="width: 100px; height: 100px"
                              :key="imageitem.filePath" v-if="imageitem.is360 === 1"
                              @click="initPhotoSphere(procitem.procName, imageitem.filePathTrans)" />
                          </template>
                          <div class="submit-info"
                            :style="{ color: imageitem.audit === 0 ? '#888' : (imageitem.audit === 2 || imageitem.audit === 4) ? 'red' : (imageitem.audit === 1 || imageitem.audit === 3) ? 'green' : '' }">
                            {{ selectDictLabel(statusOptions, imageitem.audit) }}
                          </div>
                          <div class="submit-info">拍摄者: {{ imageitem.submit }}</div>
                          <div class="submit-info">
                            <span>{{ imageitem.department }}</span>
                          </div>
                          <div class="submit-action" v-if="!is_lock && checkPermission(['points:proPhotoDel'])">
                            <el-link type="danger" icon="el-icon-delete" slot="reference"
                              @click="handleDeleteImage(imageitem, procmain)">删除</el-link>
                          </div>
                        </div>
                      </div>
                      <!-- 拓展信息 -->

                      <template v-if="pointDirect.extand && pointDirect.extand.length > 0">
                        <span class="remarktitle">
                          <i class="el-icon-s-operation"></i>
                          拓展信息
                        </span>
                        <ul style="margin-left:10px;margin-bottom:10px;">
                          <li v-for="(item, l) in pointDirect.extand" :key="item.code + l">
                            <span>{{ item.name }}:</span>
                            <span>{{ item.value }}</span>
                          </li>
                        </ul>
                      </template>
                    </div>
                  </div>
                </div>
              </div>
              <!-- wangongyijiao -->
              <div v-else class="complate_pointInfo">
                <div style="margin-bottom:10px;">
                  <strong style="margin:0 10px;color:#409eff;">IP地址详情</strong>
                  <el-button size="mini" @click="savewgym" style="float: right;margin-right:20px;" type="primary"
                    v-if="complate.isEdit">保存</el-button>
                  <!-- <el-button style="float: right;margin-right:20px;" size="mini" type="primary" @click="changeComplateEdit">{{complate.isEdit?'取消':'编辑'}}</el-button> -->
                  <!-- <el-button style="float: right;margin-right:20px;" size="small" v-else type="primary" @click="plSave">批量保存</el-button> -->
                  <div style="margin:10px 0 0 10px;">
                    <span style="margin-right:6px;">网关:</span>
                    <el-input :disabled="!complate.isEdit" size="mini" v-model="complate.gateway" @blur="validateInp"
                      style="width:200px;"></el-input>
                    <span style="margin:0 10px;">掩码:</span>
                    <el-input :disabled="!complate.isEdit" size="mini" v-model="complate.mask" @blur="validateInp"
                      style="width:200px;"></el-input>
                    <span class="error">{{ complate.error }}</span>
                  </div>
                </div>
                <el-card class="box-card" v-for="(dev, k) in ip_addr.list" :key="dev.device_id + k">
                  <div slot="header" class="clearfix">
                    <h4 style="margin:0px 0 10px 0px;">{{ dev.device_name }}</h4>
                    <span>
                      IP:
                      <el-input :disabled="!complate.isEdit" size="mini" style="width:200px;" v-model="dev.ip"
                        @blur="validateIPfn(dev, k)"></el-input>
                      <span class="error">{{ dev.error }}</span>
                    </span>
                    <span style="margin-left:10px;">
                      特征备注:
                      <el-input :disabled="!complate.isEdit" size="mini" style="width:200px;" type="textarea" rows="1"
                        v-model="dev.remark"></el-input>
                    </span>
                    <el-button style="float: right;" size="mini" v-loading="dev.submitloading" type="primary"
                      v-if="complate.isEdit" @click="saveIPdev(dev, k)">保存</el-button>
                  </div>
                  <div class="el-upload-list--picture-card" v-viewer="options">
                    <div class="el-upload-list__item" v-for="image in dev.attachment_list" :key="image.id">
                      <img class="el-upload-list__item-thumbnail" :src="image.file_path_thumb"
                        :data-source="image.file_path" style="width: 100px; height: 100px" :key="image.file_path" />
                      <span class="el-upload-item-actions" v-if="complate.isEdit">
                        <i class="el-icon-delete" @click="handlewgDeleteImage(dev, image.id)"></i>
                      </span>
                    </div>
                  </div>
                  <el-upload :class="{ uploadbtn: true, noedit: !complate.isEdit }" :disabled="!complate.isEdit"
                    action="#" accept="image/png, image/jpeg,image/jpg" :file-list="dev.fileList"
                    list-type="picture-card" :on-change="(file, fileList) => uploadChange(file, fileList, dev)"
                    :auto-upload="false">
                    <i slot="default" class="el-icon-plus"></i>
                    <div slot="file" slot-scope="{file}">
                      <img class="el-upload-list__item-thumbnail" :src="file.url"
                        @click="handlePictureCardPreview(file)">
                      <span class="el-upload-item-actions" v-if="complate.isEdit">
                        <i class="el-icon-delete" @click="handleRemove(dev, file)"></i>
                      </span>
                    </div>
                  </el-upload>
                </el-card>
              </div>
            </el-collapse-item>
          </template>
        </el-collapse>

        <!-- 深化设计 -->
        <div class="shsjwrap" v-if="shsjList">
          <h3 style="margin-top:10px;" :id="shsjList.uuid">{{ shsjList.className }}</h3>
          <div class="deveiwrap">
            <div class="proc-item" v-for="(procitem, i) in shsjList.procList" :key="procitem.procCode + i">
              <span class="subtitle">
                <i class="el-icon-camera"></i>
                {{ procitem.procName }}
              </span>
              <div v-for="(pointDirect, i) in procitem.pointList"
                :key="pointDirect.direction ? pointDirect.direction + i + 'point' : i + 'point'">

                <template v-if="pointDirect.direction">
                  <span>方向：</span>
                  <span>{{ pointDirect.direction }}</span>
                </template>
                <div class="container" v-viewer="options">
                  <div class="block" v-for="imageitem in pointDirect.attachmentList" :key="imageitem.id">
                    <el-tooltip effect="dark"
                      :content="procitem.procCode === 'CLS000-04' ? ((imageitem.remark ? imageitem.remark + ',时间：' : '') + imageitem.updateTime) : imageitem.remark"
                      placement="top-start" v-if="imageitem.remark || procitem.procCode === 'CLS000-04'">
                      <!--  有备注信息的  照片or全场景照片  -->
                      <img :src="imageitem.filePathThumb" :data-source="imageitem.filePathTrans"
                        style="width: 100px; height:  100px" :key="imageitem.filePath" v-if="imageitem.is360 === 0" />
                      <img :src="imageitem.filePathThumb" style="width: 100px; height: 100px" :key="imageitem.filePath"
                        v-if="imageitem.is360 === 1"
                        @click="initPhotoSphere(procitem.procName, imageitem.filePathTrans)" />
                    </el-tooltip>
                    <!-- 无备注信息的 照片or全场景照片-->

                    <template v-else>
                      <img :src="imageitem.filePathThumb" :data-source="imageitem.filePathTrans"
                        style="width: 100px; height: 100px" :key="imageitem.filePath" v-if="imageitem.is360 === 0" />
                      <img :src="imageitem.filePathThumb" style="width: 100px; height: 100px" :key="imageitem.filePath"
                        v-if="imageitem.is360 === 1"
                        @click="initPhotoSphere(procitem.procName, imageitem.filePathTrans)" />
                    </template>
                    <div class="submit-info"
                      :style="{ color: imageitem.audit === 0 ? '#888' : (imageitem.audit === 2 || imageitem.audit === 4) ? 'red' : (imageitem.audit === 1 || imageitem.audit === 3) ? 'green' : '' }">
                      {{ selectDictLabel(statusOptions, imageitem.audit) }}
                    </div>
                    <div class="submit-info">拍摄者: {{ imageitem.submit }}</div>
                    <div class="submit-action" v-if="!is_lock && checkPermission(['points:proPhotoDel'])">
                      <el-link type="danger" icon="el-icon-delete" slot="reference"
                        @click="handleDeleteImage(imageitem, shsjList)">删除</el-link>
                    </div>
                  </div>
                </div>
                <!-- 拓展信息 -->

                <template v-if="pointDirect.extand && pointDirect.extand.length > 0">
                  <span class="remarktitle">
                    <i class="el-icon-s-operation"></i>
                    拓展信息
                  </span>
                  <ul style="margin-left:10px;margin-bottom:10px;">
                    <li v-for="item in pointDirect.extand" :key="item.code">
                      <span>{{ item.name }}:</span>
                      <span>{{ item.value }}</span>
                    </li>
                  </ul>
                </template>
              </div>
            </div>
          </div>
          <div class="deviceTable">
            <ul class="right_tab">
              <li v-for="item in tabList" @click="changeShowtab(item)" :key="item.id"
                :class="{ isActive: item.id === currentRightTab }">{{ item.name }}</li>
            </ul>
            <!-- 物料信息 -->
            <div v-if="currentRightTab === 1" v-loading="wuliaoloading">
              <!-- <h3 class="subtitle">物料清单</h3> -->
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
            </div>
            <!-- 链路信息 -->
            <LinkInformation v-if="currentRightTab === 2" :point="{ ...pointInfo, pointCode: pointInfo.point_code }"
              :projectCode="project_code" :isEdit="false"></LinkInformation>

            <!-- 取电信息 -->
            <PowerCessInformation v-if="currentRightTab === 3"
              :point="{ ...pointInfo, pointCode: pointInfo.point_code }" :projectCode="project_code" :isEdit="false">
            </PowerCessInformation>
          </div>
        </div>
      </div>
    </div>

    <!-- 添加工序照片 -->
    <el-drawer title="添加工序照片" :visible.sync="drawer" size="40%" :append-to-body="true" :destroy-on-close="true">
      <div class="drawer-image" style="overflow: auto; height: 100%" v-loading="loading">
        <el-form ref="form" size="small" :model="form" :rules="rules" style="height: 200px" :label-width="labelWidth">
          <el-form-item label="点位编码">
            <div>{{ this.pointInfo.point_code }}</div>
          </el-form-item>
          <el-form-item label="工序" prop="procvalue">
            <el-cascader v-model="form.procvalue" :key="cascaderKey" :options="procs" @change="handleAllProcChange"
              size="small" filterable style="width: 90%" ref="gxSel"></el-cascader>
          </el-form-item>
          <el-form-item label="物料" prop="device" v-if="DeviceType">
            <el-select v-model="form.device" placeholder="请选择物料" style="width:90%">
              <el-option v-for="item in agree_device_list" :key="item.device" :label="item.device_name"
                :value="item.device_id" :disabled="item.disabled">
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="方向" prop="direction" v-if="isDesgin !== 1 && directionList.length > 0">
            <el-select v-model="form.direction" placeholder="请选择方向" style="width:90%">
              <el-option v-for="item in directionList" :key="item.id" :label="item.direct_name"
                :value="item.point_code">
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="备注">
            <el-input type="textarea" style="width: 90%" v-model="form.txtRemark"></el-input>
          </el-form-item>
          <el-form-item label="照片上传">
            <el-upload action="#" class="upload-demo" style="width: 90%" accept="image/png, image/jpeg,image/jpg"
              :multiple="true" :on-change="handleChange" :on-remove="handleChange" :auto-upload="false"
              :file-list="fileList" :limit="limit" :disabled="!proccode">
              <el-button size="small" type="primary" plain>添加文件</el-button>
              <span v-if="limit === 1" style="color:#f40;"> *该工序步骤只能上传一张图片</span>
              <span v-if="!proccode" style="color:#f40;"> *请选择工序再上传对应图片</span>
            </el-upload>
          </el-form-item>
          <el-form-item label="重置照片状态" v-if="proccode === 'CLS000-04'">
            <el-radio-group v-model="form.reset_photo">
              <el-radio label="1">是</el-radio>
              <el-radio label="0">否</el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item label="重置物料清单" v-if="proccode === 'CLS000-04'">
            <el-radio-group v-model="form.reset_device">
              <el-radio label="1">是</el-radio>
              <el-radio label="0">否</el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" style="width: 90%" :loading="submitloading"
              @click="handlePostSubmitInfo()">提交</el-button>
          </el-form-item>
        </el-form>
      </div>
    </el-drawer>
    <!-- 地图 -->
    <el-drawer title="地图展示" :visible.sync="isMap" size="90%" :append-to-body="true" :modal="false" @opened="openMap"
      @closed="closeMap" custom-class="mapwrap">
      <!-- <gd-map
        ref="gdMap"
        @mapMovestart="mapMovestart"
        @haveAmap="haveAmap"
        :isKJsearch="true"
      ></gd-map> -->
      <bd-map ref="bdMap" @clickBDPoint="clickBDPoint"></bd-map>
      <el-drawer title="详情" :visible.sync="visible" size="627px" :append-to-body="true"
        custom-class="diago_clover_info">
        <el-descriptions title="" :column="2" border>
          <el-descriptions-item label="子系统名称">{{ clickPoint.child_name }}</el-descriptions-item>
          <el-descriptions-item label="点位编码">{{ clickPoint.point_code }}</el-descriptions-item>
          <el-descriptions-item label="点位名称">{{ clickPoint.point_name }}</el-descriptions-item>
          <el-descriptions-item label="状态说明">{{ clickPoint.status_name_t }}</el-descriptions-item>
        </el-descriptions>
        <el-table :data="clickPoint.deviceLists" :row-style="{ height: '30px' }" :cell-style="{ padding: '0' }"
          highlight-current-row border style="margin-top:10px;">
          <el-table-column label="物料名称" prop="deviceName" min-width="180px" show-overflow-tooltip></el-table-column>
          <el-table-column label="物料规格" prop="deviceModel" min-width="180px" show-overflow-tooltip></el-table-column>
          <el-table-column label="单位" align="center" prop="unit" width="50" />
          <el-table-column label="设计数量" align="center" prop="regNums" width="78" />
          <el-table-column label="安装数量" align="center" prop="finishNums" width="78"></el-table-column>
        </el-table>
      </el-drawer>
    </el-drawer>
    <!-- 全景照片 -->
    <el-dialog :title="photoSphereName" :visible.sync="photoSphereVisible" :footer="false" :append-to-body="true"
      width="70%">
      <div id="viewer"></div>
    </el-dialog>
    <!-- 上传图片预览 -->
    <el-dialog :visible.sync="dialogVisible" append-to-body>
      <img width="100%" :src="dialogImageUrl" alt="">
    </el-dialog>
    <!-- ip列表 -->
    <el-drawer title="已维护设备" :visible.sync="ipModal" size="90%" :append-to-body="true" :destroy-on-close="true">
      <ip-list v-if="ipModal" :is_lock="is_lock"></ip-list>
    </el-drawer>
    <!-- 备忘录列表 -->
    <el-drawer title="备忘录" :visible.sync="memoModal" size="90%" :append-to-body="true" :destroy-on-close="true">
      <memo-list v-if="memoModal" :point_code="pointInfo.point_code" :project_code="project_code"
        :is_lock="is_lock"></memo-list>
    </el-drawer>

  </div>
</template>

<script>
import gcoord from '@/utils/gcoord.js'
// import GdMap from '../pointSearch/GdMap.vue'
import BdMap from '../pointSearch/BdMap.vue'
import { Viewer } from 'photo-sphere-viewer'
import 'photo-sphere-viewer/dist/photo-sphere-viewer.css'
import { checkPermission } from '@/utils/tool'
import { validateIP } from '@/utils/validate'
import IpList from './IP/LpList.vue'
import memoList from './memo/list.vue'
import LinkInformation from '@/views/logisticsRegister/LinkInformation.vue'
import PowerCessInformation from '@/views/logisticsRegister/PowerCessInformation.vue'

export default {
  name: 'pointInfo_index',
  props: {
    pointInfo: {
      required: true
    },
    project_code: {
      default: ''
    },
    project_id: {
      default: ''
    },
    is_lock: { // 是否有备忘录功能 ip列表功能 删除照片功能
      default: false
    },
    haveaddPhoto: { // 是否有添加工序照片功能
      default: true
    }
  },
  provide () {
    return {
      pointInfo: this.pointInfo,
      project_code: this.project_code,
      project_id: this.project_id
    }
  },
  data () {
    return {
      procLists: [], // 完整的工序
      filterProcList: [], // 过滤掉深化设计的其他工序
      dataLoading: false,
      options: {
        toolbar: true,
        url: 'data-source'
      },
      scrollBox: null,
      activeMenu: null,
      topArr: [],
      statusOptions: [
        { dict_label: '未审核', dict_value: 0 },
        { dict_label: '初审通过', dict_value: 1 },
        { dict_label: '初审未通过', dict_value: 2 },
        { dict_label: '终审通过', dict_value: 3 },
        { dict_label: '终审未通过', dict_value: 4 }
      ],
      // 添加工序照片
      loading: false,
      drawer: false,
      cascaderKey: 1,
      procs: [],
      proccode: '',
      form: {
        procvalue: null,
        direction: '', // 上传照片的时候，isDesgin 不等于1，没有方向，此时的pointCode为接口返回的pointCode,赋值direction
        device: '',
        txtRemark: '后补照片',
        reset_photo: '0',
        reset_device: '0'
      },
      isDesgin: 1, // isDesgin 等于1。则不需要显示方向
      is360: 0,
      DeviceType: '', // 当选的工序DeviceType有值出现
      agree_device_list: [],
      directionList: [],
      fileList: [],
      submitloading: false,
      // 地图
      AMap: null,
      isMap: false,
      deviceLists: [],
      // 全景照片
      viewer: '',
      photoSphereVisible: false,
      photoSphereName: '',
      mapLoading: false,
      near_points: [],
      clickPoint: {},
      pos: {},
      position: {},
      visible: false,
      offset: {
        x: 0,
        y: -30
      },
      styleObjectArr: [],
      rules: {
        procvalue: [
          { required: true, message: '请选择工序', trigger: 'blur' }
        ],
        direction: [
          { required: true, message: '请选择方向', trigger: 'blur' }
        ],
        IP: [
          { required: true, message: '请输入ip', trigger: 'blur' },
          { validator: validateIP, trigger: 'blur' }
        ],
        device: [
          { required: true, message: '请选择物料', trigger: 'blur' }
        ]
      },
      // 完工移交
      ip_addr: {},
      deepcloneip: {},
      complate: {
        gateway: '', // 网关
        mask: '', // 掩码
        error: null,
        isEdit: false
      },
      dialogImageUrl: '',
      dialogVisible: false,
      designIndex: null,
      activeNames: [],
      shsjList: null,
      // ip列表
      ipModal: false,
      isHaveSHSJdesign: false,
      limit: 9999,
      // 备忘录
      memoModal: false,
      labelWidth: '80px',
      tabList: [
        { name: '物料清单', id: 1 }, { name: '链路信息', id: 2 }, { name: '取电信息', id: 3 }
      ],
      currentRightTab: 1,
      wuliaoloading: false
    }
  },
  computed: {
    positions () {
      const lng_lat = this.pointInfo.lng_lat ? this.pointInfo.lng_lat.split(',') : []
      return lng_lat.map(m => Number(m))
    },
    opened () {
      return this.filterProcList.map((i) => {
        return i.className
      })
    },
    currentUserId () {
      return this.$store.state.userInfo.id + ''
    },
    buttons () {
      return this.$store.getters.buttons
    }
  },
  watch: {
    fileList (val) {
      if (this.proccode === 'CLS000-04' || this.DeviceType) {
        this.limit = 1
      } else {
        this.limit = 9999
      }
    }
  },
  mounted () {
    this.getPointSubmitList()
  },
  components: {
    // GdMap,
    BdMap,
    IpList,
    memoList,
    LinkInformation,
    PowerCessInformation
  },
  methods: {
    checkPermission,
    async getPointSubmitList (procmain = null) {
      this.procLists = []
      this.filterProcList = []
      this.dataLoading = true
      this.shsjList = null
      try {
        const res = {
          point_code: this.pointInfo.point_code,
          project_code: this.project_code
        }
        const { code, data, message } = await this.$pub.post('/point/proc_submit_web_list', res)
        if (Number(code) === 200) {
          if (data !== null) {
            this.getBuildRegInfo()
            this.activeMenu = data[0] ? data[0].className : ''
            this.procLists = data.map((item, i) => {
              const uuid = item.procList.length > 0 ? item.procList[0].procCode.split('-')[0] : ''
              const obj = Object.assign(item, { uuid })
              if (item.className === '深化设计') {
                this.designIndex = i
                this.shsjList = obj
              } else {
                this.filterProcList.push(obj)
              }
              return obj
            })

            this.$nextTick(() => {
              procmain && this.jumpTo(procmain)
            })
          } else {
            this.procLists = []
            this.filterProcList = []
            this.deviceLists = []
            this.designIndex = null
            this.shsjList = null
          }
          const result = await this.$pub.post('/point/device/ip/list', res)
          if (result.code === 200) {
            this.ip_addr = result.data.ip_addr
            this.complate = {
              gateway: this.ip_addr.gateway, // 网关
              mask: this.ip_addr.mask, // 掩码
              isEdit: false,
              error: null
            }
            if (this.ip_addr.count > 0 && this.ip_addr.list && this.ip_addr.list.length > 0) {
              this.procLists.push({
                className: '完工移交',
                uuid: 'complate'
              })
              this.filterProcList.push({
                className: '完工移交',
                uuid: 'complate'
              })
              this.ip_addr.list.forEach(f => {
                // f.fileList = (f.attachment_list || []).map(m => {
                //   return {
                //     url: m.file_path,
                //     ...m
                //   }
                // })
                f.fileList = []
                f.submitloading = false
              })
            }
            this.deepcloneip = JSON.parse(JSON.stringify(this.ip_addr))
          } else {
            this.ip_addr = {}
            this.$notify.error({
              title: '查询失败',
              message: '查询完工移交失败'
            })
          }

          if (this.scrollBox) {
            this.scrollBox.removeEventListener('scroll', this.addEventFn, true)
          }
          this.$nextTick(() => {
            this.scroll()
          })
          this.activeNames = this.opened
        } else {
          this.$notify.error({
            title: '查询失败',
            message: message
          })
        }
      } catch (e) {
        this.$notify.error({
          title: '出错了',
          message: e.message
        })
      }
      this.dataLoading = false
    },
    jumpTo (procmain) {
      if (!procmain.uuid || !document.getElementById(procmain.uuid)) return
      this.activeMenu = procmain.className
      // document.getElementById(procmain.uuid).scrollIntoView({
      //   behavior: 'smooth'
      // })
      const target = document.getElementById(procmain.uuid)
      target.parentNode.scrollTop = target.offsetTop
    },
    scroll () {
      // 获取滚动dom元素
      this.scrollBox = document.getElementById('scrollBox')
      const jump = document.getElementsByClassName('do-jump')
      this.topArr = []
      for (let i = 0; i < jump.length; i++) {
        const pre_h = i > 0 ? this.topArr[i - 1] : 0
        const self_h = jump[i].clientHeight
        this.topArr.push(pre_h + self_h)
      }
      // 监听dom元素的scroll事件
      this.scrollBox && this.scrollBox.addEventListener('scroll', this.addEventFn, true)
    },
    addEventFn () {
      const current_offset_top = this.scrollBox.scrollTop
      for (let i = 0; i < this.topArr.length; i++) {
        if (current_offset_top < this.topArr[i]) { // 根据滚动距离判断应该滚动到第几个导航的位置
          // const _index = (this.designIndex && i >= this.designIndex) ? i + 1 : i
          this.activeMenu = this.filterProcList[i].className
          break
        }
      }
      this.scroll()
    },
    changeCollapse (activeNames) {
      this.activeNames = activeNames
      this.addEventFn()
    },
    handleShowAddInfo () {
      if (this.pointInfo.point_code !== '') {
        this.handleSearchAllProc()
        this.form.procvalue = []
        this.form.direction = ''
        this.form.txtRemark = '后补照片'
        this.form.reset_photo = '0'
        this.form.reset_device = '0'
        this.proccode = ''
        this.fileList = []
        this.directionList = []
        this.form.device = ''
        this.agree_device_list = []
        this.isDesgin = 1
        this.DeviceType = ''
        this.limit = 9999
        this.drawer = true
      }
    },
    handleShowIPList () {
      this.ipModal = true
    },
    async handleSearchAllProc () {
      this.loading = true
      this.isHaveSHSJdesign = false
      // 如果深化设计施工图已存在就提示不能上传了，深化设计施工图只能一张
      if (this.shsjList) {
        (this.shsjList.procList || []).forEach(f => {
          if (f.procCode === 'CLS000-04') {
            f.pointList.some(s => {
              if (s.attachmentList && s.attachmentList.length > 0) {
                this.isHaveSHSJdesign = true
              }
            })
          }
        })
      }

      try {
        const params = {
          project_code: this.project_code,
          point_code: this.pointInfo.point_code
        }
        const url = this.buttons.includes('points:designProcList') ? '/point/proc/list-design' : '/point/proc/list'
        const { code, data, message } = await this.$pub.post(url, params)
        if (Number(code) === 200) {
          var tmparr = []
          data.map(item => {
            var childs = []
            childs = this.getChildList(item)
            var tmpobj = {
              value: item.classCode,
              label: item.className,
              children: childs
            }
            tmparr.push(tmpobj)
          })
          this.procs = tmparr
        } else {
          this.$notify.error({
            title: '查询失败',
            message: message
          })
        }
      } catch (e) {
        this.$notify.error({
          title: '出错了',
          message: e.message
        })
      }
      this.loading = false
    },
    getChildList (value) {
      const childs = []
      // 添加具体工序
      if (value.procList !== null && value.procList !== undefined) {
        value.procList.map(citem => {
          const flag = citem.procCode === 'CLS000-04' && this.isHaveSHSJdesign
          childs.push({
            value: citem.procCode,
            label: flag ? citem.procName + '(已存在深化设计施工图，请删掉再上传)' : citem.procName,
            isDesgin: citem.isDesgin,
            isCore: citem.isCore,
            id: citem.id,
            is360: citem.is360,
            DeviceType: citem.DeviceType,
            disabled: flag
          })
        })
      }
      // 添加子分类
      if (value.classChild !== undefined && value.classChild !== null) {
        value.classChild.map(sitem => {
          let subChilds = []
          if (sitem.classChild !== null) {
            subChilds = this.getChildList(sitem.classChild)
          }
          childs.push({
            value: sitem.classCode,
            label: sitem.className,
            children: subChilds
          })
        })
      }
      return childs
    },
    handleAllProcChange (value) {
      if (value !== null) {
        if (this.$refs.gxSel.getCheckedNodes()[0]) {
          const checkedData = this.$refs.gxSel.getCheckedNodes()[0].data
          this.proccode = value[value.length - 1]
          if (checkedData) {
            this.isDesgin = checkedData.isDesgin
            this.is360 = checkedData.is360
            this.DeviceType = checkedData.DeviceType
            if (this.isDesgin !== 1) {
              this.getDirectionList()
            }
            if (this.DeviceType) {
              this.getAgreeDeviceList()
            }
            if (this.proccode === 'CLS000-04' || this.DeviceType) {
              this.limit = 1
              this.labelWidth = '104px'
            } else {
              this.limit = 9999
              this.labelWidth = '80px'
            }
          } else {
            this.isDesgin = 1
            this.DeviceType = ''
          }
        }
      }
    },
    handleChange (file, fileList) {
      this.fileList = fileList.slice(-3)
    },
    async getDirectionList () {
      try {
        const params = {
          project_code: this.project_code,
          point_code: this.pointInfo.point_code
        }
        const { data, code, message } = await this.$pub.post('/point/manage/direct-list', params)
        if (code === 200) {
          if (data) {
            if (data.length === 1 && data[0].direct_name === '未知') {
              this.form.direction = data[0].point_code
            } else {
              this.directionList = data
            }
          } else {
            this.directionList = []
          }
        } else {
          this.$notify.error({
            title: '查询失败',
            message: message
          })
          this.directionList = []
        }
      } catch (err) {
        this.$notify.error({
          title: '服务器请求失败',
          message: err.message
        })
      }
    },
    // 获取添加工序选择工序为Designtype有值的时候的物料列表
    async getAgreeDeviceList () {
      try {
        const params = {
          project_code: this.project_code,
          point_code: this.pointInfo.point_code,
          proc_code: this.proccode
        }
        const { data, code, message } = await this.$pub.post('point/proc/device/list', params)
        if (code === 200) {
          this.agree_device_list = (data.list || []).map(m => {
            return {
              ...m, disabled: m.design_num <= m.photo_num
            }
          })
        } else {
          this.$notify.error({
            title: '查询失败',
            message: message
          })
          this.agree_device_list = []
        }
      } catch (err) {
        this.$notify.error({
          title: '服务器请求失败',
          message: err.message
        })
      }
    },
    async handleDeleteImage (img, procmain) {
      try {
        const tit = img.is_submit_count ? '存在已选物料，必须清空方可删除!' : '请确认是否删除图片?'
        this.$confirm(tit, '警告', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          showCancelButton: !img.is_submit_count,
          showConfirmButton: !img.is_submit_count,
          type: 'warning'
        }).then(async () => {
          const id = img.id
          const req = { attr_id: id, user_id: this.$store.state.userInfo.id }
          // const url = (img.audit === 0 && img.user_id === this.currentUserId) ? '/attach/photo_remove' : '/attach/delete_attr'
          const url = '/attach/delete_attr'
          const result = await this.$pub.post(url, req)
          if (result.code === 200) {
            this.getPointSubmitList(procmain)
          } else {
            this.$notify.error({
              title: '查询失败',
              message: result.message
            })
          }
        }).catch(function () { })
      } catch (e) {
        this.$notify.error({
          title: '服务器请求失败',
          message: e.message
        })
      }
      this.submitloading = false
    },
    handlePostSubmitInfo () {
      if (this.fileList.length < 1) {
        this.$notify.error({
          title: '提醒',
          message: '没有添加需要上传的照片'
        })
        return
      }
      this.$refs.form.validate(valid => {
        if (valid) {
          this.submitloading = true
          this.submitGX()
        }
      })
    },
    // 工序提交
    async submitGX () {
      try {
        const formData = new FormData()
        const point_info = {
          project_code: this.project_code,
          child_code: this.pointInfo.child_code,
          point_code: this.isDesgin !== 1 ? this.form.direction : this.pointInfo.point_code,
          proc_code: this.proccode,
          address: '',
          lat: '',
          lng: '',
          user_id: this.$store.state.userInfo.id,
          remark: this.form.txtRemark,
          is_360: '0',
          device_id: this.DeviceType ? this.form.device : 0,
          reset_photo: this.form.reset_photo,
          reset_device: this.form.reset_device
        }
        for (let i = 0; i < this.fileList.length; i++) {
          formData.append('files', this.fileList[i].raw)
        }
        formData.append('point_info', JSON.stringify(point_info))

        const { code, message } = await this.$pub.post('/attach/photo_add2', formData)
        if (code === 200) {
          this.$notify.info({
            title: '添加成功!',
            message: ''
          })
          this.fileList = []
          this.form.procvalue = ''
          this.form.direction = ''
          this.form.device = ''
          this.directionList = []
          this.agree_device_list = []
          this.DeviceType = ''
          this.isDesgin = 1
          this.proccode = ''
          this.getPointSubmitList()
          setTimeout(() => {
            this.handleSearchAllProc()
            this.submitloading = false
          }, 500)
        } else {
          this.submitloading = false
          this.$notify.error({
            title: '添加失败',
            message: message
          })
        }
        this.submitloading = false
      } catch (e) {
        this.submitloading = false
        this.$notify.error({
          title: '出错了attach/photo_add',
          message: e.message
        })
      }
    },
    showMap () {
      this.isMap = true
    },
    openMap () {
      if (this.$refs.gdMap) {
        this.GDopenMap()
      } else {
        this.BDopenMap()
      }
    },
    closeMap () {
      const refgd = this.$refs.gdMap
      const refbd = this.$refs.bdMap
      if (this.markers !== null) {
        refgd && refgd.GDMap.clearMap()
        refbd && refbd.bdmap.clearOverlays()
        this.visible = false
      }
    },
    // 高德地图start
    async GDopenMap () {
      // 1.获取附件300米以内的点，生成icon在地图上
      // this.mapLoading = true
      this.$refs.gdMap.loading = true
      const lng_lat = this.pointInfo.lng_lat ? this.pointInfo.lng_lat.split(',') : []
      const lng = lng_lat[0] ? lng_lat[0] : ''
      const lat = lng_lat[1] ? lng_lat[1] : ''
      const params = {
        project_code: this.project_code,
        lng,
        lat,
        distance: 1000,
        point_code: this.pointInfo.point_code
      }
      const { data } = await this.$pub.post('/point/near', params)
      // 查找当前点的建设状态status_t status_name_t
      const current = data.find(f => f.point_code === this.pointInfo.point_code)
      const status_t = current.status
      const status_name_t = current.status_name
      const status = current.status
      const status_name = current.status_name

      this.near_points = data.filter(f => f.point_code !== this.pointInfo.point_code).map(m => {
        return { ...m, status_name_t: m.status_name, status_t: m.status }
      })
      this.drawMarks(this.near_points, 2)
      // 2.当前点生成icon在地图上
      const obj = { ...this.pointInfo, lng, lat, status_t, status_name_t, status, status_name }
      this.drawMarks([obj], 1)
    },
    haveAmap (AMap) {
      this.AMap = AMap
    },
    addMarker (point, index) {
      const data = {
        lnglat: [point.lng02, point.lat02],
        name: point.point_name,
        point: point,
        id: index,
        style: index
      }
      return data
    },
    drawMarks (arrs, type) {
      const AMap = this.AMap
      const GDMap = this.$refs.gdMap.GDMap
      const overlayList = []
      const currentMarkers = []
      this.styleObjectArr = []
      if (!arrs || arrs.length <= 0 || !arrs[0]) {
        return
      }
      arrs.map((item, index) => {
        if (item.lng && item.lat) {
          const result02 = gcoord.transform([item.lng, item.lat], // 经纬度坐标
            gcoord.WGS84, // 当前坐标系
            gcoord.GCJ02 // 目标坐标系
          )
          const po = Object.assign(item, { lng02: result02[0], lat02: result02[1] })
          currentMarkers.push(this.addMarker(po, index))
          overlayList.push({ lng: po.lng02, lat: po.lat02 })
          const sta = item.status !== undefined && [0, 1, 2, 3, 4, 5, 6, 7, 8, 9].includes(item.status) ? item.status : '0'
          const icon = (type === 1 ? 'selstatus' : 'status') + sta
          const ur = require(`../../assets/images/${icon}.png`)
          // 创建样式对象
          const styleObject = {
            url: ur,
            size: new AMap.Size(40, 40),
            anchor: new AMap.Pixel(20, 20)
          }
          this.styleObjectArr.push(styleObject)
        }
      })
      // 绘制
      const massMarker = new AMap.MassMarks(currentMarkers, {
        zIndex: 999,
        style: this.styleObjectArr
      })

      massMarker.on('click', async (e) => {
        this.$refs.gdMap.loading = true
        const point = e.data.point
        const params = {
          project_code: this.project_code,
          point_code: point.point_code
        }
        const { code, message, data } = await this.$pub.post('/device/build-reg-info-noStage', params)
        this.$refs.gdMap.loading = false
        let deviceLists = []
        if (code !== 200) {
          this.$notify.error({
            title: '物料规格列表查询失败',
            message: message
          })
        } else {
          deviceLists = data.device_list || []
        }
        this.clickPoint = { ...point, deviceLists }
        this.pos = [e.data.lnglat[0], e.data.lnglat[1]]
        this.visible = true
      })

      massMarker.setMap(GDMap)
      const lng_lat = this.pointInfo.lng_lat ? this.pointInfo.lng_lat.split(',') : []
      const lng = lng_lat[0] ? lng_lat[0] : ''
      const lat = lng_lat[1] ? lng_lat[1] : ''
      const center = gcoord.transform(
        [lng, lat], // 经纬度坐标
        gcoord.WGS84, // 当前坐标系
        gcoord.GCJ02 // 目标坐标系
      )
      GDMap.setZoomAndCenter(18, center)
      this.markers = massMarker
      // this.mapLoading = false
      this.$refs.gdMap.loading = false
    },
    mapMovestart () {
      this.visible = false
    },
    // 高德地图end
    // 百度地图start
    async BDopenMap () {
      const map = this.$refs.bdMap
      if (map) {
        map.loading = true
        map.bdmap.clearOverlays()
        // 1.获取附件300米以内的点，生成icon在地图上
        const lng_lat = this.pointInfo.lng_lat ? this.pointInfo.lng_lat.split(',') : []
        const lng = lng_lat[0] ? lng_lat[0] : ''
        const lat = lng_lat[1] ? lng_lat[1] : ''
        const params = {
          project_code: this.project_code,
          lng,
          lat,
          distance: 1000,
          point_code: this.pointInfo.point_code
        }
        const { data } = await this.$pub.post('/point/near', params)
        map.loading = false
        // 查找当前点的建设状态status_t status_name_t
        const current = data.find(f => f.point_code === this.pointInfo.point_code)
        const result = gcoord.transform([lng, lat], // 经纬度坐标
          gcoord.WGS84, // 当前坐标系
          gcoord.BD09 // 目标坐标系
        )
        const obj = {
          ...this.pointInfo,
          lngbd: result[0],
          latbd: result[1],
          status_t: current.status,
          status_name_t: current.status_name,
          status: current.status,
          status_name: current.status_name
        }
        this.near_points = data.filter(f => f.point_code !== this.pointInfo.point_code).map(m => {
          const itemresult = gcoord.transform([m.lng, m.lat], // 经纬度坐标
            gcoord.WGS84, // 当前坐标系
            gcoord.BD09 // 目标坐标系
          )
          return { ...m, lngbd: itemresult[0], latbd: itemresult[1], status_name_t: m.status_name, status_t: m.status }
        })
        map.drawMarks(this.near_points, 2)

        // 2.勘测未知生成icon在地图上
        map.drawMarks([obj], 1)
        map.bdmap.flyTo(new map.BMapGL.Point(obj.lngbd, obj.latbd), 18)
      }
    },
    async clickBDPoint (point) {
      const map = this.$refs.bdMap
      map.loading = true
      const params = {
        project_code: this.project_code,
        point_code: point.point_code
      }
      const { code, message, data } = await this.$pub.post('/device/build-reg-info-noStage', params)
      map.loading = false
      let deviceLists = []
      if (code !== 200) {
        this.$notify.error({
          title: '物料规格列表查询失败',
          message: message
        })
      } else {
        deviceLists = data.device_list || []
      }
      this.clickPoint = { ...point, deviceLists }
      this.visible = true
    },
    // 百度地图end
    handleRefresh () {
      this.dataLoading = true
      this.getPointSubmitList()
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
    getBuildRegInfo () {
      this.wuliaoloading = true
      const params = {
        project_code: this.project_code,
        point_code: this.pointInfo.point_code
      }
      this.$pub.post('/device/build-reg-info-noStage', params).then(res => {
        this.deviceLists = res.data.device_list ? res.data.device_list : []
        this.wuliaoloading = false
      }).catch(() => {
        this.wuliaoloading = false
      })
    },
    initPhotoSphere (name, img) {
      this.photoSphereName = name
      this.photoSphereVisible = true
      if (this.viewer) {
        this.viewer.destroy()
      }
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
    async savewgym () {
      const req = {
        gateway: this.complate.gateway,
        mask: this.complate.mask,
        point_code: this.pointInfo.point_code,
        project_code: this.project_code,
        create_user: this.$store.state.userInfo.id
      }
      const { code, message } = await this.$pub.post('/point/device/ip/mask/edit', req)
      if (code === 200) {
        this.getPointSubmitList()
      } else {
        this.$notify.error({
          title: '查询失败',
          message: message
        })
      }
    },
    changeComplateEdit () {
      this.complate.isEdit = !this.complate.isEdit
      if (!this.complate.isEdit) {
        // this.getPointSubmitList()
        this.ip_addr = JSON.parse(JSON.stringify(this.deepcloneip))
        // this.ip_addr.gateway = this.deepcloneip.gateway
        // this.ip_addr.mask = this.deepcloneip.mask
        // this.ip_addr.list.forEach((f, i) => {
        //   this.deepcloneip.list.some((s, j) => {
        //     if (i === j) {
        //       f.attachment_list = s.attachment_list
        //       f.ip = s.ip
        //       f.remark = s.remark
        //       f.fileList = f.fileList.filter(d => d.create_id)
        //       return true
        //     }
        //   })
        // })

        this.complate = {
          gateway: this.ip_addr.gateway, // 网关
          mask: this.ip_addr.mask, // 掩码
          isEdit: false,
          error: null
        }
      }
    },
    validateInp () {
      const val = this.complate.mask + this.complate.gateway
      if (val === '' || val === undefined || val == null) {
        this.complate.error = '网关掩码不能为空'
      } else {
        const reg = /[\u4E00-\u9FA5]/g
        if (reg.test(val)) {
          this.complate.error = '禁止输入中文'
        } else {
          this.complate.error = null
        }
      }
      this.$forceUpdate()
    },
    validateIPfn (dev, k) {
      const ip = dev.ip
      if (ip === '' || ip === undefined || ip == null) {
        dev.error = 'ip地址不能为空'
      } else {
        const reg = /^((\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.){3}(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])$/
        if ((!reg.test(ip)) && ip !== '') {
          dev.error = 'ip格式不正确'
        } else {
          dev.error = null
        }
      }
      this.$set(this.ip_addr.list, k, dev)
    },
    uploadChange (file, fileList, dev) {
      if (file.status === 'ready') {
        dev.fileList = [...fileList]
      }
    },
    handlewgDeleteImage (dev, id) {
      this.$confirm('请确认是否删除该图片?', '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {
        dev.attachment_list = dev.attachment_list.filter(f => f.id !== id)
        this.$forceUpdate()
      }).catch(function () { })
    },
    handleRemove (dev, file) {
      this.$confirm('请确认是否删除该图片?', '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {
        dev.fileList = dev.fileList.filter(f => f.uid !== file.uid)
        this.$forceUpdate()
      }).catch(function () { })
    },
    handlePictureCardPreview (file) {
      this.dialogImageUrl = file.url
      this.dialogVisible = true
    },
    async plSave () {
      if (!this.complate.gateway || !this.complate.mask || this.complate.error) {
        return this.$message({
          type: 'error',
          message: '网关和掩码为必填项,并且不能输入中文，请修改后，再保存',
          showClose: true
        })
      }

      // this.ip_addr.list = (this.ip_addr.list || []).map(m => {
      //   m.attachment_list = []
      //   for (let i = 0; i < m.fileList.length; i++) {
      //     const file = m.fileList[i]
      //     if (file.status === 'ready') {
      //       file.raw.ip = m.ip
      //       formData.append('files', file.raw)
      //     } else if (file.status === 'success') {
      //       m.attachment_list.push(file)
      //     }
      //   }
      //   return m
      // })
      const formData = new FormData()
      this.ip_addr.list.forEach(m => {
        for (let i = 0; i < m.fileList.length; i++) {
          const file = m.fileList[i]
          if (file.status === 'ready') {
            file.raw.ip = m.ip
            formData.append('files', file.raw)
          }
        }
      })
      this.complate.isEdit = false
    },
    async saveIPdev (dev, i) {
      if (!this.complate.gateway || !this.complate.mask || this.complate.error) {
        return this.$message({
          type: 'error',
          message: '网关和掩码为必填项,并且不能输入中文，请修改后，再保存',
          showClose: true
        })
      }
      if (dev.error) {
        return this.$message({
          type: 'error',
          message: 'ip地址不正确，请修改后，再保存',
          showClose: true
        })
      }
      dev.submitloading = true
      this.$set(this.ip_addr.list, i, dev)
      const formData = new FormData()
      // const successList = []
      // 这里上传文件
      for (let i = 0; i < dev.fileList.length; i++) {
        const file = dev.fileList[i]
        if (file.status === 'ready') {
          file.raw.ip = dev.ip
          formData.append('files', file.raw)
        }
      }
      const url = dev.id === 0 ? '/point/device/ip/add' : '/point/device/ip/edit'
      const ip_addr = {
        id: dev.id,
        ip: dev.ip,
        device_name: dev.device_name,
        device_id: dev.device_id,
        remark: dev.remark,
        gateway: this.complate.gateway,
        mask: this.complate.mask,
        attachment_id: (dev.attachment_list || []).map(m => m.id),
        point_code: this.pointInfo.point_code,
        project_code: this.project_code,
        create_user: this.$store.state.userInfo.id
      }
      formData.append('ip_addr', JSON.stringify(ip_addr))
      for (var [a, b] of formData.entries()) {
        console.log(a, b)
      }
      const upload_result = await this.$pub.post(url, formData,
        {
          headers: { 'Content-Type': 'multipart/form-data' }
        }
      )
      if (upload_result.code !== 200) {
        this.$notify.error({
          title: '保存失败！',
          message: upload_result.message
        })
      } else {
        this.$notify.info({
          title: '保存成功!',
          message: ''
        })
        this.getPointSubmitList()
        dev.submitloading = false
      }
    },
    // 备忘录查看
    handleShowMemo () {
      this.memoModal = true
    },
    changeShowtab (item) {
      this.currentRightTab = item.id
      // this.getTableHeight()
    }
  },
  // 回调中移除监听
  destroyed () {
    if (this.scrollBox) {
      this.scrollBox.removeEventListener('scroll', this.addEventFn, true)
    }
  }
}
</script>

<style lang="scss">
.showInfo_wrap {
  .el-drawer__header {
    margin-bottom: 20px;
  }

  .el-collapse-item__header {
    font-weight: 600;
    font-size: 14px;
  }

  .el-drawer__body {
    height: calc(100% - 50px);
  }
}

.pointInfo_container {
  .el-drawer__body {
    padding: 0 20px 20px;
    box-sizing: border-box;
  }

  .el-collapse {
    border: 0;
  }
}

.mapwrap .el-drawer__body {
  position: relative;
}

.complate_pointInfo {
  .box-card {
    margin-bottom: 10px;

    .el-upload--picture-card {
      width: 100px;
      height: 100px;
      line-height: 98px;
      border-radius: 0;
      margin-bottom: 10px;
      // float: left;
      // margin-right: 5px;
    }

    .uploadbtn {
      display: inline-block;
    }

    .uploadbtn.noedit {
      .el-upload--picture-card {
        cursor: not-allowed;
      }
    }

    .el-upload-list--picture-card {
      display: inline-block;
    }

    .el-upload-list--picture-card {
      .el-upload-list__item {
        width: 100px;
        height: 100px;
        margin: 0 5px 0 0;
        border-radius: 0;

        &:hover {
          .el-upload-item-actions {
            opacity: 1;
          }
        }

        img {
          width: 98px;
          height: 98px;
        }
      }
    }

    .el-upload-item-actions {
      opacity: 0;
      transition: opacity .3s;
      position: absolute;
      right: -30px;
      top: -31px;
      width: 60px;
      height: 60px;
      font-size: 15px;
      display: inline-block;
      border-radius: 50%;
      text-align: bottom;
      background-color: rgba(0, 0, 0, .5);

      .el-icon-delete {
        line-height: 85px;
        margin-left: 12px;
        font-size: 15px;
        cursor: pointer;
      }
    }
  }

  .error {
    color: #f40;
  }
}
</style>

<style scoped lang="scss">
.pointInfo_container {
  display: flex;
  justify-content: space-between;
  height: 100%;
  padding: 0 20px 0 0;

  ._left {
    width: 160px;
    border-right: 1px solid #ebeef5;
    height: 100%;

    li {
      padding: 8px 20px;
      font-size: 14px;
      cursor: pointer;

      &:hover {
        background: #409eff;
        color: #fff;
      }
    }

    li.iscomplate {
      border-top: 1px solid #eee;
    }

    .isActive {
      color: #409eff;

      &:hover {
        background: #fff;
        color: #409eff;
      }
    }
  }

  ._right {
    width: calc(100% - 180px);
    height: 100%;

    .header {
      .tit_sub {
        margin-top: 10px;
        border-bottom: 1px solid #EBEEF5;
        padding-bottom: 4px;
        display: flex;
        align-items: center;
      }

      .point-name {
        margin-right: 20px;
        font-size: 14px;
        display: inline-block;
        color: #888;
      }

      .over {
        max-width: 40%;
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
      }
    }

    .title {
      width: 100%;
      display: flex;
      justify-content: space-between;

      .tit {
        font-size: 16px;
      }
    }

    .proc_content.isshsjwrap {

      #scrollBox,
      .shsjwrap {
        width: 100%;
      }

      .shsjwrap {
        border-left: none;
        padding-left: 0px;
      }
    }

    .proc_content {
      height: calc(100% - 100px);
      display: flex;
      justify-content: space-between;

      #scrollBox {
        height: 100%;
        width: calc(100% - 470px);
        overflow: auto;
      }

      .shsjwrap {
        width: 470px;
        height: 100%;
        overflow: auto;
        padding-left: 20px;
        box-sizing: border-box;
        border-left: 1px solid #eee;
        position: relative;
      }

      .deveiwrap {
        width: 100%;

        .proc-item {
          // width: 450px;
        }
      }

      .deveiwrap.isSHSJ {
        width: 450px;
        border-right: 1px solid #eee;
        margin-right: 15px;
      }

      .deviceTable {
        width: 100%;

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

            &:before {
              content: '';
              background: #fff;
              display: inline-block;
              width: 8px;
              height: 8px;
              border-radius: 50%;
              position: relative;
              margin-right: 2px;
            }
          }

          .isActive {
            background-color: #23B7BD;
            color: #fff;
            border-color: #23B7BD;
          }
        }
      }

      .subtitle {
        display: block;
        font-size: 15px;
        color: #409eff;
        margin-left: 5px;
        margin-top: 15px;
      }

      .remarktitle {
        font-family: "Microsoft YaHei", "微软雅黑";
        display: block;
        font-size: 14px;
        color: red;
        margin-left: 5px;
      }

      .container {
        display: flex;
        flex-direction: row;
        flex-wrap: wrap;
        justify-content: flex-start;
      }

      .submit-info {
        /* text-align: left; */
        font-size: 12px;
        color: #aaa;
      }

      .submit-action {
        height: 25px;
        line-height: 25px;
        vertical-align: center;
      }

      .block {
        // padding: 10px 5px;
        margin: 0 8px 8px 0;
        text-align: center;
        display: inline-block;
        box-sizing: border-box;
      }

      .remark-info {
        text-align: left;
      }

      .remark-submit {
        color: #888;
        font-size: 12px;
      }

      .drawer-image {
        padding: 0px 20px;
        display: flex;
        flex-direction: column;
        justify-content: flex-start;
      }
    }
  }

  .nodata {
    text-align: center;
  }
}

.mapwrap {
  .diago_clover_info {
    position: absolute;
    padding: 20px;
    top: 60px;
    height: calc(100% - 60px);
    width: 627px;
    box-sizing: border-box;
    border-radius: 5px;
    box-shadow: 0 15px 15px rgba(0, 0, 0, 0.25);
    background-color: #719bff;
    z-index: 10;
    transform: translate(-50%, -50%);
    color: #fff;
    overflow: auto;

    // &:after{
    //   content: "◆";
    //   font-size: 36px;
    //   height: 26px;
    //   color: #719bff;
    //   position: absolute;
    //   bottom: 0;
    //   left: 50%;
    //   transform: translateX(-50%);
    // }
    .wrap {
      display: flex;

      span:first-child {
        min-width: 90px;
        display: block;
      }
    }

    .el-icon-close {
      position: absolute;
      right: 4px;
      top: 4px;
      cursor: pointer;
    }

    .el-descriptions-item__label {
      width: 80px;
    }
  }
}

#scrollBox {
  position: relative;
}
</style>
