<template>
  <div class="addpoint_wrap">
    <div class="formwrap">
      <el-form ref="form" size="small" style="height:200px;" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="项目" prop="project" v-if="!currentp">
          <el-select v-model="form.project" placeholder="请选择项目" style="width:100%" value-key="id"
            @change="handleProjectChange">
            <el-option v-for="item in projectList" :key="item.projectCode" :label="item.projectName" :value="item">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="点位编码" prop="drawPointCode">
          <el-input v-model.trim="form.drawPointCode" placeholder="请输入点位编码" :disabled="!!currentp"></el-input>
        </el-form-item>
        <el-form-item label="点位名称" prop="drawPointName">
          <el-input v-model.trim="form.drawPointName" placeholder="请输入点位名称"></el-input>
        </el-form-item>
        <el-form-item label="子系统" prop="childCode">
          <el-select v-model="form.childCode" :placeholder="form.projectCode ? '请选择子系统' : '请先选择项目'" style="width:199px">
            <el-option v-for="item in childList" :key="item.key" :label="item.value" :value="item.key">
            </el-option>
          </el-select>
          <span style="text-align:right;">
            <el-button @click="addChild" :disabled="!form.project_id" type="primary" size="small"
              style="margin-left:5px;">新增</el-button>
          </span>
        </el-form-item>
        <el-form-item label="区域" prop="area">
          <el-select v-model="form.area" clearable style="width:199px" filterable default-first-optio>
            <el-option v-for="item in areaList" :key="item.key" :label="item.value" :value="item.value">
            </el-option>
          </el-select>
          <span style="text-align:right;">
            <el-button @click="addArea" :disabled="!form.project_id" type="primary" size="small"
              style="margin-left:5px;">新增</el-button>
          </span>
        </el-form-item>
        <el-form-item label="标签" prop="tag" v-if="currentp">
          <el-select v-model="form.tag" style="width:100%" clearable placeholder="请选择标签">
            <el-option v-for="item in tagList" :key="item" :label="item" :value="item">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="区域类型" prop="areaType">
          <el-radio-group v-model="form.areaType">
            <el-radio :label="area.name" v-for="area in areaTypes" :key="area.name"></el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="方向" prop="direction">
          <el-select v-model="form.direction" multiple placeholder="请选择方向" style="width:100%">
            <el-option v-for="item in directionList" :key="item.value" :label="item.label" :value="item.label">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="经度" prop="lng">
          <el-input v-model="form.lng" placeholder="请输入点位经度或者地图选取" @input="$forceUpdate()" @blur="codeTo"></el-input>
        </el-form-item>
        <el-form-item label="纬度" prop="lat">
          <el-input v-model="form.lat" placeholder="请输入点位纬度或者地图选取" @input="$forceUpdate()" @blur="codeTo"></el-input>
        </el-form-item>
        <el-form-item label="地址" prop="address">
          <el-input v-model="form.address" placeholder="经纬度转换地址" style="width:calc(100% - 70px)"></el-input>
          <el-button @click="addressTo" style="width:70px;padding:9px 2px;">转换经纬度</el-button>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="onSubmit" :loading="saveLoading">保存</el-button>
          <el-button @click="reset">重置</el-button>
        </el-form-item>
      </el-form>
    </div>
    <div class="mapwrap">
      <!-- <gd-map
        ref="gdMap"
        :noChangeCode="noChangeCode"
        @changeLocation="changeLocation"
        @changeAddress="changeAddress"
      ></gd-map> -->
      <BdMap ref="bdMap" @changeLocation="changeLocation" @changeAddress="changeAddress" :firstLngLat="null"></BdMap>
    </div>

    <!-- 新增子系统 -->
    <el-dialog :visible.sync="childFlag" :footer="false" width="800px" title="子系统维护" append-to-body>
      <child-setting :current="{ id: form.project_id, project_code: form.projectCode }" v-if="childFlag"></child-setting>
    </el-dialog>
  </div>
</template>

<script>
// import GdMap from './GdMap'
import BdMap from './BdMap'
import gcoord from '@/utils/gcoord.js'
import { findUrlParams } from '@/utils/tool.js'
import config from '@/config/config.js'
import childSetting from '../../projectManagement/childSetting.vue'

export default {
  name: 'pointaddSetting',
  props: ['currentProject', 'currentp'],
  data () {
    const drawPointCodeValidate = (rule, value, callback) => {
      var reg = /^[0-9a-zA-Z-_]{1,}$/
      value = value.replace(/\s*/g, '')
      value = value.replace(/\——*/g, '_')
      if (!reg.test(value)) {
        callback(new Error('仅支持数字，字母，-，_'))
      } else {
        callback()
      }
    }
    const lngValidate = (rule, value, callback) => {
      var longrg = config.lng
      const lngBoolean = longrg.test(value)
      if (!lngBoolean) {
        callback(new Error(config.msg2))
      } else {
        callback()
      }
    }
    const latValidate = (rule, value, callback) => {
      var latreg = config.lat
      const latBoolean = latreg.test(value)
      if (!latBoolean) {
        callback(new Error(config.msg2))
      } else {
        callback()
      }
    }
    return {
      form: {
        project: null,
        project_id: '',
        projectCode: null,
        childCode: null,
        area: '',
        areaType: '点位',
        drawPointCode: '',
        drawPointName: '',
        direction: null,
        address: '',
        lng: '',
        lat: '',
        tag: null
      },
      projectList: [],
      childList: [],
      areaList: [],
      directionList: [],
      areaTypes: [{ name: '点位' }, { name: '交通枢纽' }],
      rules: {
        project: [{ required: true, message: '请选择项目', trigger: 'change' }],
        childCode: [{ required: true, message: '请选择子系统', trigger: 'change' }],
        area: [{ required: true, message: '请输入区域', trigger: 'change' }],
        areaType: [{ required: true, message: '请选择区域类型', trigger: 'change' }],
        drawPointCode: [
          { required: true, message: '请输入点位编码', trigger: 'change' },
          { validator: drawPointCodeValidate, trigger: 'blur' }
        ],
        drawPointName: [{ required: true, message: '请输入点位名称', trigger: 'change' }],
        direction: [{ required: false, message: '请选择方向名称', trigger: 'change' }],
        lng: [
          { required: true, message: '请输入点位经度', trigger: 'change' },
          { validator: lngValidate, trigger: 'blur' }
        ],
        lat: [
          { required: true, message: '请输入点位纬度', trigger: 'change' },
          { validator: latValidate, trigger: 'blur' }
        ]
      },
      loading: false,
      saveLoading: false,
      noChangeCode: true,
      childFlag: false,
      tagList: []
    }
  },
  watch: {
    childFlag (val) {
      if (!val && this.form.project_id) {
        this.getChildList()
      }
    }
  },
  created () {
    if (this.currentp) { // 编辑
      const { child_code, area, point_code, point_name, lng_lat } = this.currentp
      const lng = lng_lat ? lng_lat.split(',')[0] : ''
      const lat = lng_lat ? lng_lat.split(',')[1] : ''
      this.form = {
        project: this.currentProject,
        project_id: this.currentProject.id,
        projectCode: this.currentProject.projectCode,
        childCode: child_code,
        area,
        areaType: '点位',
        direction: null,
        tag: null,
        drawPointCode: point_code,
        drawPointName: point_name,
        address: '',
        lng,
        lat
      }
      this.getChildList()
      this.getAreaList()
      this.getTagList()
    } else {
      if (this.currentProject && this.currentProject.projectCode) {
        this.form.project = this.currentProject
        this.handleProjectChange(this.currentProject)
      }
    }
  },
  mounted () {
    this.$nextTick(() => this.$refs.form.clearValidate())
    !this.currentp && this.getProjectList()
    this.getDirectionList()
  },
  components: {
    // GdMap,
    BdMap,
    childSetting
  },
  methods: {
    async getProjectList () {
      try {
        const params = {
          user_id: this.$store.state.userInfo.id
        }
        const { data, code, message } = await this.$pub.post('/project/project-list-by-user', params)
        if (Number(code) === 200) {
          this.projectList = data || []
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
    async getChildList () {
      try {
        const { data, code, message } = await this.$pub.post('project/child-list', { project_id: this.form.project_id })
        if (code === 200) {
          this.childList = data || []
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
    async getAreaList () {
      try {
        const { code, data, message } = await this.$pub.post('project/area-list', { project_id: this.form.project_id })
        if (code === 200) {
          this.areaList = data || []
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
    async getDirectionList () {
      this.$dict(this, 'direction').then((res) => {
        if (res.code === 200) {
          this.directionList = res.data || []
        } else {
          this.$message({
            type: 'error',
            message: '出错了direction',
            showClose: true
          })
          this.directionList = []
        }
      })
    },
    handleProjectChange (val) {
      this.form.projectCode = val.projectCode
      this.form.project_id = val.id

      this.form.childCode = ''
      this.form.area = ''
      this.form.tag = ''
      this.getChildList()
      this.getAreaList()
      this.getTagList()
    },
    addChild () {
      this.childFlag = true
    },
    addArea () {
      const h = this.$createElement
      let inp_value = ''
      let errorMsg = ''
      this.$msgbox({
        title: '新增区域',
        message: h('div', {}, [
          h('p', { style: 'display: flex', class: { 'el-input': true, 'el-input--mini': true } }, [
            h('span', { style: 'width: 64px' }, '区域名称:'),
            h('input', {
              class: { 'el-input__inner': true },
              domProps: {
                value: ''
              },
              on: {
                input: (event) => {
                  inp_value = event.target.value
                }
              }
            })
          ]),
          h('span', { style: ' color: #f40;margin-left:55px;', attrs: { id: 'addarea' } }, errorMsg)
        ]),
        showCancelButton: true,
        closeOnClickModal: false,
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        beforeClose: async (action, instance, done) => {
          if (action === 'confirm') {
            instance.confirmButtonLoading = true
            if (!inp_value) {
              instance.confirmButtonLoading = false
              errorMsg = '请输入区域名称'
              document.getElementById('addarea').innerHTML = errorMsg
              return
            }
            if (this.areaList && this.areaList.map(m => m.value).includes(inp_value)) {
              instance.confirmButtonLoading = false
              errorMsg = '区域名称已经存在'
              document.getElementById('addarea').innerHTML = errorMsg
              return
            }
            errorMsg = ''
            document.getElementById('addarea').innerHTML = errorMsg

            done()
            setTimeout(() => {
              instance.confirmButtonLoading = false
              this.areaList.unshift({
                value: inp_value, key: inp_value
              })
            }, 300)
          } else {
            errorMsg = ''
            document.getElementById('addarea').innerHTML = errorMsg
            done()
          }
        }
      }).catch(err => { console.log(err) })
    },
    async onSubmit () {
      try {
        await this.$refs.form.validate()
        this.saveLoading = true
        this.form.drawPointCode = this.form.drawPointCode.replace(/(\s*)|(\s*$)/g, '')
        this.form.drawPointCode = this.form.drawPointCode.replace(/\——*/g, '_')
        this.form.drawPointName = this.form.drawPointName.replace(/(\s*)|(\s*$)/g, '')

        const { address, area, areaType, childCode, direction, drawPointCode, drawPointName, lat, lng, projectCode, project_id } = this.form
        const params = { address, area, areaType, childCode, direction, drawPointCode, drawPointName, lat: lat + '', lng: lng + '', projectCode, project_id }

        const result = await this.$pub.post('/point/manage/add', params)
        this.saveLoading = false
        if (result.code !== 200) {
          return this.$message({
            type: 'error',
            message: result.message || '添加失败!',
            showClose: true
          })
        }
        this.$message({
          type: 'success',
          message: '添加成功!',
          showClose: true
        })
      } catch (err) {
        this.$message({
          type: 'error',
          message: err || '添加失败!',
          showClose: true
        })
        this.saveLoading = false
      }
    },
    reset () {
      this.$refs.form.resetFields()
    },
    changeLocation (location) {
      this.form.lng = Math.floor(location[0] * 100000000) / 100000000
      this.form.lat = Math.floor(location[1] * 100000000) / 100000000
    },
    changeAddress (address) {
      this.form.address = address
    },
    codeTo (e) {
      /**
       * 左侧回填用84坐标系，地图上生成mark用gj102坐标系
       * 1.正常输入经度，纬度默认为84坐标系
       * 2.输入经度,纬度默认为84坐标系 ,(eg:120.33,33.379),这种情况要分割后，分别回填
       * 3.输入url地址默认为J02坐标系，获取其中经纬度，回填。(eg: url:https://map.qq.com/?type=marker&isopeninfowin=1&markertype=1&pointx=120.146&pointy=33.3985&name=%E5%95%86%E5%8E%A6%E7%AE%B1%E5%8C%85%E7%9A%AE%E5%85%B7&addr=%E6%B1%9F%E8%8B%8F%E7%9C%81%E7%9B%90%E5%9F%8E%E5%B8%82%E4%BA%AD%E6%B9%96%E5%8C%BA%E5%BC%80%E6%94%BE%E5%A4%A7%E9%81%9395%E5%8F%B7&ref=WeChat)
       */
      const val = e.target.value.replace(' ', '')
      const pointx = val.indexOf('pointx')
      const isDouhao = val.indexOf(',')
      const isDouhao2 = val.indexOf('，')
      if (pointx > 0) { // 输入为url情况
        const params = findUrlParams(val)
        const lng = params.pointx ? params.pointx : ''
        const lat = params.pointy ? params.pointy : ''
        const tempResult = gcoord.transform(
          [lng, lat], // 经纬度坐标
          gcoord.GCJ02, // 当前坐标系
          gcoord.WGS84 // 目标坐标系
        )
        this.form.lng = tempResult[0] || ''
        this.form.lat = tempResult[1] || ''
      } else if (isDouhao > 0) { // 输入为经度,纬度情况
        const params = val.split(',')
        this.form.lng = params[0] || ''
        this.form.lat = params[1] || ''
      } else if (isDouhao2 > 0) { // 输入为经度，（中文逗号）纬度情况
        const params = val.split('，')
        this.form.lng = params[0] || ''
        this.form.lat = params[1] || ''
      }
      this.noChangeCode = true

      const refbd = this.$refs.bdMap
      const refgd = this.$refs.gdMap
      this.form.address = ''
      if (refgd) {
        const location = `${this.form.lng},${this.form.lat}`
        refgd.codeToLocaltion(location)
      } else {
        const tempResult = gcoord.transform(
          [this.form.lng, this.form.lat], // 经纬度坐标
          gcoord.WGS84, // 当前坐标系
          gcoord.BD09 // 目标坐标系
        )
        const location = { lng: tempResult[0], lat: tempResult[1] }
        refbd.codeToLocaltion(location)
      }
    },
    addressTo () {
      if (this.form.address) {
        const address = this.form.address
        const refbd = this.$refs.bdMap
        const refgd = this.$refs.gdMap
        if (refgd) {
          refgd.localtionToCode(address)
        } else {
          refbd.localtionToCode(address)
        }
      }
    }
  }
}
</script>

<style>
.el-input__inner {
  border-radius: 0px !important;
}

.point_set .el-drawer__header {
  margin-bottom: 0px;
}

.addpoint_wrap .el-form-item {
  margin-bottom: 18px !important;
}
</style>
<style lang="scss">
.addpoint_wrap {
  height: 100%;
  display: flex;
  justify-content: space-between;
  padding: 20px;
  box-sizing: border-box;

  .formwrap {
    width: 340px;
  }

  .mapwrap {
    width: calc(100% - 360px);
    height: 100%;
  }
}
</style>
