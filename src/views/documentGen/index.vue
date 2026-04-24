<template>
  <div class="doc_wrap">
    <ul class="cloverLeft" >
      <li  @click="tabClick(1)" :style="{color: type===1?'#409eff':'#909399'}" >
        <i class="el-icon-s-flag"></i>工序进度
      </li>
      <li  @click="tabClick(2)" :style="{color: type===2?'#409eff':'#909399'}" v-hasPermi="['documentGenDevicesProgress:list']">
        <i class="el-icon-s-flag"></i>物料进度
      </li>
      <li  @click="tabClick(3)" :style="{color: type===3?'#409eff':'#909399'}" v-hasPermi="['documentGenConstructionDocuments:list']">
        <i class="el-icon-document"></i>施工文档
      </li>
      <li  @click="tabClick(4)" :style="{color: type===4?'#409eff':'#909399'}" v-hasPermi="['documentStageDocument:list']">
        <i class="el-icon-document"></i>阶段文档
      </li>
      <li  @click="tabClick(9)" :style="{color: type===9?'#409eff':'#909399'}" v-hasPermi="['onlineEquipment:list']">
        <i class="el-icon-document"></i>在线设备
      </li>
      <li  @click="tabClick(8)" :style="{color: type===8?'#409eff':'#909399'}" v-hasPermi="['realTimeProgress:list']">
        <i class="el-icon-s-flag"></i>实时进度
      </li>
      <li  @click="tabClick(7)" :style="{color: type===7?'#409eff':'#909399'}" v-hasPermi="['joinStatistics:list']">
        <i class="el-icon-s-flag"></i>接入统计
      </li>
      <li  @click="tabClick(6)" :style="{color: type===6 ?'#409eff':'#909399'}" v-hasPermi="['deviceProcDoc:list']">
        <i class="el-icon-s-flag"></i>物料统计
      </li>
    </ul>
    <div class="rightWrap">
      <processcom v-if="type===1"></processcom>
      <DevicesProgress v-if="type===2"></DevicesProgress>
      <ConstructionDocuments v-if="type===3"></ConstructionDocuments>
      <StageDocument v-if="type===4"></StageDocument>
      <onlineEquipment v-if="type===9"></onlineEquipment>
      <realTime v-if="type===8"></realTime>
      <joinStatistics v-if="type===7"></joinStatistics>
      <deviceProcDoc v-if="type===6"></deviceProcDoc>
    </div>
  </div>
</template>

<script>
import ConstructionDocuments from './ConstructionDocuments'
import DevicesProgress from './DevicesProgress'
import processcom from './process'
import StageDocument from './StageDocument'
import onlineEquipment from './onlineEquipment'
import realTime from './realTime'
import joinStatistics from './joinStatistics'
import deviceProcDoc from './deviceProcDoc'
export default {
  name: 'documentGen',
  data() {
    return {
      type: 1,
      list: [
        { key: 1, name: '工序进度', icon: 'el-icon-s-flag' },
        { key: 2, name: '物料进度', icon: 'el-icon-s-flag' },
        { key: 3, name: '施工文档', icon: 'el-icon-document' }
      ]
    }
  },
  computed: {},
  mounted() {},
  components: { ConstructionDocuments, DevicesProgress, processcom, StageDocument, onlineEquipment, realTime, joinStatistics, deviceProcDoc },
  methods: {
    tabClick(key) {
      this.type = key
    }
  }
}
</script>

<style scoped>
a {
  color: #303133;
}
.clover_active {
  color: #409eff;
}
</style>
<style lang="scss">
.el-input__inner {
  border-radius: 0px !important;
}
.doc_wrap{
  display:flex;
  height:100%;
  padding:20px;
  padding-left:0;
  box-sizing: border-box;
  .cloverLeft{
    width: 120px;
    height:100%;
    border-right: 1px solid #e6e6e6;
    color: #909399;
    li{
      text-align: center;
      line-height: 36px;
      cursor: pointer;
      i{
        margin-right:10px;
      }
    }
  }
  .rightWrap{
    margin-left:20px;
    width: calc(100% - 140px);
    height: calc(100% - 20px);

  }
}
</style>
