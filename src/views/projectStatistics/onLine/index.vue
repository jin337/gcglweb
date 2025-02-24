<template>
  <div class="online_wrap projectStatistics_container">
    <div class="_left" v-loading="leftLoading">
      <p class="title">在线汇总</p>
      <el-form class="header" inline size="mini">
        <el-form-item label="项目" >
          <el-select
            v-model="leftForm.project_code"
            placeholder="请选择"
            filterable
            >
              <el-option v-for="item in projectList" :key="item.projectCode" :label="item.projectName" :value="item.projectCode" ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="日期" prop="check_date" >
          <el-date-picker
            v-model="leftForm.check_date"
            align="right"
            placeholder="选择日期"
            value-format="yyyy-MM-dd">
          </el-date-picker>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="getLeftData">查询</el-button>
        </el-form-item>
      </el-form>
      <vxe-table
        show-overflow
        :height="leftTableHeight"
        :data="leftData"
        :row-config="{height: 30}"
        highlight-current-row
        empty-text="暂无在线汇总请查询"
      >
        <vxe-column title="项目编码" field="project_code" ></vxe-column>
        <vxe-column title="在线日期" width="120px" field="check_date" ></vxe-column>
        <vxe-column title="不在线数量" field="fail_status"  width="120"  align="center"  />
        <vxe-column title="在线数量" field="ok_status"  width="100"  align="center"  />
        <vxe-column title="设备总数" field="sum"  width="120"  align="center" />
        <vxe-column title="在线百分比" field="percentage"  width="120"  align="center" ></vxe-column>
      </vxe-table>
    </div>
    <div class="_right" v-loading="rightLoading">
      <p class="title">在线明细</p>
      <el-form class="header" inline size="mini">
        <el-form-item label="项目" >
          <el-select
            v-model="rightForm.project_code"
            placeholder="请选择"
            filterable
            >
              <el-option v-for="item in projectList" :key="item.projectCode" :label="item.projectName" :value="item.projectCode" ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="日期" prop="check_date" >
          <el-date-picker
            v-model="rightForm.check_date"
            align="right"
            placeholder="选择日期"
            value-format="yyyy-MM-dd">
          </el-date-picker>
        </el-form-item>
        <el-form-item label="点位">
          <el-input v-model="rightForm.point_code" placeholder="点位编码"  @clear="getRightData" clearable   style="width:140px;"></el-input>
        </el-form-item>
        <el-form-item label="IP">
          <el-input v-model="rightForm.ip" placeholder="IP地址"  @clear="getRightData"  clearable  style="width:140px;"></el-input>
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="rightForm.check_status"  placeholder="请选择"   style="width:100px;" >
            <el-option
              v-for="item in check_statusList"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="getRightData">查询</el-button>
        </el-form-item>
      </el-form>
      <vxe-table
        show-overflow
        :height="rightTableHeight"
        :data="rightData"
        :row-config="{height: 30}"
        highlight-current-row
        empty-text="暂无在线详细请查询"
      >
        <vxe-column title="项目编码" field="project_code" width="150px"  ></vxe-column>
        <vxe-column title="点位编码" field="point_code" width="150px"  ></vxe-column>
        <vxe-column title="点位名称" field="point_name"   />
        <vxe-column title="设备名称" field="device_model"  width="150px"  />
        <vxe-column title="IP地址" field="ip" width="120px" align="center" />
        <vxe-column title="在线状态" field="check_status_name" width="80px" align="center"></vxe-column>
        <vxe-column title="在线日期" field="check_date" width="120px" align="center"></vxe-column>
      </vxe-table>
    </div>
  </div>
</template>

<script>
export default {
  name: 'onLine',
  data () {
    return {
      projectList: [],
      leftForm: {
        project_code: null,
        check_date: null
      },
      rightForm: {
        project_code: null,
        check_date: null,
        point_code: '',
        ip: '',
        check_status: -1
      },
      leftLoading: false,
      rightLoading: false,
      leftData: [],
      rightData: [],
      leftTableHeight: window.innerHeight - 208,
      rightTableHeight: window.innerHeight - 208,
      check_statusList: [
        { label: '全部', value: -1 }, { label: '不在线', value: 0 }, { label: '在线', value: 1 }
      ]
    }
  },
  computed: {

  },
  mounted() {
    this.getProject()
    this.getTableHeight()
    window.addEventListener('resize', () => this.getTableHeight())
  },
  components: {

  },
  methods: {
    getTableHeight() {
      this.$nextTick(() => {
        const el_wrap = document.getElementsByClassName('online_wrap')[0]
        if (el_wrap) {
          const _leftel = el_wrap.getElementsByClassName('_left')[0]
          const _rightel = el_wrap.getElementsByClassName('_right')[0]
          const title1 = _leftel.getElementsByClassName('title')[0]
          const title2 = _rightel.getElementsByClassName('title')[0]
          const header1 = _leftel.getElementsByClassName('header')[0]
          const header2 = _rightel.getElementsByClassName('header')[0]

          this.leftTableHeight = _leftel.offsetHeight - (title1.offsetHeight + header1.offsetHeight + 30)
          this.rightTableHeight = _rightel.offsetHeight - (title2.offsetHeight + header2.offsetHeight + 30)
        }
      })
    },
    async getProject() {
      try {
        const params = {
          user_id: this.$store.state.userInfo.id
        }
        const result = await this.$pub.post('project/project-list-by-user', params)
        if (result.code === 200) {
          if (result.data !== null) {
            this.projectList = result.data
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
    async getLeftData() {
      if (!this.leftForm.project_code || !this.leftForm.check_date) {
        return
      }
      this.leftLoading = true
      const params = {
        project_code: this.leftForm.project_code,
        check_date: this.leftForm.check_date
      }
      const { data, code } = await this.$pub.post('rate/project_online_device_sum', params)
      if (code !== 200) {
        return this.$message({
          type: 'error',
          message: '根据项目编码，日期获取在线汇总情况出错了',
          showClose: true
        })
      }
      this.leftData = (data || []).map(m => {
        return {
          ...m, percentage: (m.ok_status / m.sum).toFixed(2) * 100 + '%'
        }
      })
      this.leftLoading = false
    },
    async getRightData() {
      if (!this.rightForm.project_code || !this.rightForm.check_date) {
        return
      }
      this.rightLoading = true
      const params = {
        project_code: this.rightForm.project_code,
        check_date: this.rightForm.check_date,
        point_code: this.rightForm.point_code,
        ip: this.rightForm.ip,
        check_status: this.rightForm.check_status
      }
      const { data, code } = await this.$pub.post('rate/project_online_device_detail', params)
      if (code !== 200) {
        return this.$message({
          type: 'error',
          message: '根据项目编码，日期获取在线详细情况出错了',
          showClose: true
        })
      }
      this.rightData = (data || []).map(m => {
        return {
          ...m, check_status_name: m.check_status === '1' ? '在线' : '不在线'
        }
      })
      this.rightLoading = false
    }
  }
}
</script>

<style lang='scss'>
.online_wrap{
  height:100%;
  width:100%;
  display:flex;
  align-items:center;
  ._left{
    width:40%;
    height:100%;
    padding:10px 20px;
    box-sizing: border-box;
  }
  ._right{
    // border-left:1px solid #eee;
    box-sizing: border-box;
    width:60%;
    height:100%;
     padding:10px 20px;
  }
  .title{
    padding-bottom:10px;
    border-bottom:1px solid #eee;
    display:flex;
    align-items:center;
    &:before{
      content: '';
      margin-right:4px;
      display:inline-block;
      height:12px;
      width:0;
      border:2px solid #23b7bd;
    }
  }
  .header{
    margin-top:20px;
  }
}

// 公共的
.projectStatistics_container{
  padding: 20px;
  box-sizing: border-box;
  height: 100%;
  overflow: auto;

  .btns::-webkit-scrollbar {
    /*滚动条整体样式*/
    width: 2px;
    /*高宽分别对应横竖滚动条的尺寸*/
    height: 3px;
  }

  .btns::-webkit-scrollbar-thumb{
    /*滚动条里面小方块*/
    border-radius: 4px;
    box-shadow: inset 0 0 5px rgba(112, 110, 110, 0.2);
    background: rgba(144, 147, 153, 0.3);
  }

  .btns::-webkit-scrollbar-track{
    /*滚动条里面轨道*/
    box-shadow: inset 0 0 5px rgba(235, 225, 225, 0.8);
    border-radius: 10px;
    background: #f7f5f5;
  }

   .btns_wrap{
    width: 100%;
    display: flex;
    flex-wrap: nowrap;
    .el-icon-arrow-left,.el-icon-arrow-right{
      height:43px;
      line-height:43px;
      cursor: pointer;
      padding: 0 6px;
      border: 1px solid #DCDFE6;
      box-sizing: border-box;
      border-bottom: 3px solid rgba(144, 147, 153, 0.3);
      &:hover {
        color: #409EFF;
        border-color: #c6e2ff;
        background-color: #ecf5ff;
      }
    }
    .el-button{
      border-top:0;
      border-bottom:0;
    }
  }
  .btns{
    max-width: 100%;
    display: flex;
    flex-wrap: nowrap;
    overflow: auto;
    border-top: 1px solid #EBEEF5;
    box-sizing: border-box;
    position: relative;
    .isActive.el-button{
      color:#fff;
      background: #409eff;
    }
    .el-button{
      color: #606266;
    }
  }
  .content_wrap{
    border: 1px solid #EBEEF5;
    border-top:0;
  }
}
</style>
