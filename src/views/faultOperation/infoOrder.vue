<template>
  <div v-loading="loading" style="height:100%;">
    <div class="tab_wrap">
      <ul class="menu">
        <li v-for="menu in menuList" :key="menu.id" @click="clickTab(menu)" :class="{'is-active': currentMenu&&(currentMenu.id===menu.id)}">
          <span>{{menu.name}}</span>
        </li>
      </ul>
    </div>
    <keep-alive>
      <component
        v-if="currentMenu"
        :is="currentMenu.component"
        :allInfo="allInfo"
        :isInfo="true"
        :currentP="currentP"
        class="com_box"
      ></component>
    </keep-alive>

  </div>
</template>

<script>
import baseInfo from './baseInfo.vue'
import distributeOrder from './distributeOrder.vue'
import changeDistributeOrder from './changeDistributeOrder.vue'
import examineOrder from './examineOrder.vue'
import hangInfo from './hangInfo.vue'
export default {
  name: 'info_order',
  props: {
    infoFlag: {
      type: Boolean,
      default: false
    },
    presentId: {
      type: Number,
      default: 0
    },
    currentP: {
      type: [Object, null],
      default: null
    }
  },
  data () {
    return {
      loading: false,
      menuList: [
        // { id: 1, name: '基本信息' },
        // { id: 2, name: '派单信息' },
        // { id: 3, name: '申请信息' },
        // { id: 4, name: '完成信息' }

        { id: 1, component: baseInfo, name: '基本信息' },
        { id: 2, component: distributeOrder, name: '派单信息' },
        { id: 3, component: changeDistributeOrder, name: '申请信息' },
        { id: 4, component: examineOrder, name: '完成信息' },
        { id: 5, component: hangInfo, name: '挂起信息' }
      ],
      currentMenu: null,
      allInfo: {}
    }
  },
  computed: {

  },
  created() {
    this.getInfo()
  },
  mounted() {
    this.currentMenu = this.menuList[0]
  },
  components: {
    baseInfo,
    distributeOrder, // 派发工单
    changeDistributeOrder, // 改派工单
    examineOrder, // 接单审核
    hangInfo // 挂起
  },
  methods: {
    clickTab(menu) {
      this.currentMenu = menu
    },
    // 获取详情
    async getInfo(row, name) {
      this.loading = true
      const params = {
        order_id: this.presentId
      }
      const { data, code } = await this.$pub.post('point/fault/order-detail', params)
      this.loading = false
      if (code !== 200) {
        return this.$message({
          message: '获取详情出错了',
          type: 'error',
          showClose: true
        })
      }
      /**
       * assign_info派单信息
       * apply_info 申请信息
       * complete_info完成信息
       */
      this.allInfo = data
      // data = {
      //   id: 1, // 工单id
      //   point_code: 'TS-LJ-07', // 点位编码
      //   point_name: '刘集服务区-东区', // 点位名称
      //   project_code: 'XZPA20200601', // 项目编码
      //   fault_order_code: '20220414131545132', // 工单编号
      //   create_user_name: '孙素鹏', // 创建人
      //   create_user: 307, // 创建人id
      //   create_time: '2022-04-14 13:15:44', // 创建时间
      //   status: 9, // 状态
      //   status_name: '工单完结', // 状态名称
      //   fault_type: '3', // 故障类型
      //   fault_type_name: '局域网电路故障', // 故障类型名称
      //   device_ct: 2,
      //   fault_order_desc: 'ceshi', // 工单描述
      //   assign_info: {},
      //   apply_info: [],
      //   complete_info: {},
      //   device_list: [}
      // }
    }
  }
}
</script>

<style lang='scss'>
.info_fault_work{
  padding:20px;
  box-sizing: border-box;
  height:100%;
  .el-drawer__header{
    display: none;
  }
  .el-drawer__body{
    height:100%;
    .tab_wrap{
      border-bottom: 1px solid #e4e7ed;
      margin: 0 0 15px;
      .menu{
        display:inline-block;
        border: 1px solid #e4e7ed;
        border-bottom: none;
        border-radius: 4px 4px 0 0;
        box-sizing: border-box;
        white-space: nowrap;
        transition: transform .3s;
        margin-bottom: -1px;
        li{
          padding: 0 20px;
          height: 40px;
          box-sizing: border-box;
          line-height: 40px;
          display: inline-block;
          list-style: none;
          font-size: 14px;
          font-weight: 500;
          color: #303133;
          position: relative;
          border-bottom: 1px solid transparent;
          border-left: 1px solid #e4e7ed;
          transition: color .3s cubic-bezier(.645,.045,.355,1),padding .3s cubic-bezier(.645,.045,.355,1);
          cursor:pointer;
          &:first-child{
            border-left:none;
          }
        }
       .is-active {
          border-bottom-color: #fff;
          color: #409eff;
        }
      }
    }
    .com_box{
      height:calc(100% - 56px);
      overflow: auto;
    }
  }
}
</style>
