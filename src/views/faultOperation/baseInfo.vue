<!--
 * @Descripttion: your project
 * @version: 1.0
 * @Author: Clover_yuan
 * @Date: 2024-02-26 11:30:39
 * @LastEditors: Clover_yuan
 * @LastEditTime: 2024-03-04 09:54:40
-->

<template>
  <div>
    <el-descriptions :column="2" size="mini" border v-if="allInfo" class="base-style">
      <el-descriptions-item label="项目名称">{{ allInfo.project_code }}</el-descriptions-item>
      <el-descriptions-item label="工单编号">{{ allInfo.fault_order_code }}</el-descriptions-item>
      <el-descriptions-item label="点位编码" :span="2">
        {{ allInfo.point_code }}
        <el-button @click="showPointInfo" style="margin-left:20px;" type="primary" size="mini">点位详情</el-button>
      </el-descriptions-item>
      <el-descriptions-item label="点位名称">{{ allInfo.point_name }}</el-descriptions-item>
      <el-descriptions-item label="生成时间">{{ allInfo.create_time }}</el-descriptions-item>
      <el-descriptions-item label="状态">{{ allInfo.status_name }}</el-descriptions-item>
      <el-descriptions-item label="故障类型">{{ allInfo.fault_type_name }}</el-descriptions-item>
      <el-descriptions-item label="报障设备数量">
        <el-popover v-if="allInfo.device_ct > 0" placement="bottom" width="700" trigger="click">
          <device-list ref="deviceref" :datas="allInfo.device_list"></device-list>
          <span slot="reference" class="nums">
            <span class="errordevice">{{ allInfo.device_ct }}</span>台
          </span>
        </el-popover>
        <span v-else>无</span>
      </el-descriptions-item>
      <el-descriptions-item label="工单描述" :span="2">{{ allInfo.fault_order_desc ? allInfo.fault_order_desc : '/'
        }}</el-descriptions-item>
    </el-descriptions>
    <!-- 点击详情 -->
    <el-drawer title="点位详情" :visible.sync="showInfo" :append-to-body="true" custom-class="showInfo_wrap" size="90%"
      :destroy-on-close="true">
      <point-info :pointInfo="currentP" :project_code="currentP.project_code" :is_lock="true"
        :haveaddPhoto="false"></point-info>
    </el-drawer>
  </div>
</template>

<script>
import deviceList from './deviceList.vue'
import pointInfo from '../points/pointInfo.vue'
export default {
  name: 'base_info',
  props: {
    allInfo: {
      type: Object,
      require: true
    },
    currentP: {
      type: [Object, null],
      default: null
    }
  },
  data () {
    return {
      showInfo: false
    }
  },
  mounted () {

  },
  components: {
    deviceList, pointInfo
  },
  methods: {
    showPointInfo () {
      this.showInfo = true
    }
  }
}
</script>

<style lang='scss'>
.base-style {
  .el-descriptions-row .el-descriptions-item__label {
    width: 110px;
  }

  .nums {
    font-size: 16px;
  }

  .errordevice {
    color: #f56c6c;
    margin-right: 6px;
    cursor: pointer;
  }
}
</style>
