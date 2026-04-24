<template>
  <div class="contract_managee_tab">
    <el-tabs type="border-card" v-model="activeName" @tab-click="handleClick">
      <el-tab-pane label="合同概况" name="one">
        <one-tab></one-tab>
      </el-tab-pane>
      <el-tab-pane label="施工范围" name="two">
        <two-tab></two-tab>
      </el-tab-pane>
      <el-tab-pane label="合同单价" name="three">
        <three-tab></three-tab>
      </el-tab-pane>
      <el-tab-pane label="付款节点" name="four">
        <four-tab></four-tab>
      </el-tab-pane>
      <el-tab-pane label="施工队" name="five">
        <five-tab></five-tab>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script>
import oneTab from './oneTab.vue'
import twoTab from './twoTab.vue'
import threeTab from './threeTab.vue'
import fourTab from './fourTab.vue'
import fiveTab from './fiveTab.vue'
export default {
  name: 'contract_tab',
  components: { oneTab, twoTab, threeTab, fourTab, fiveTab },
  props: {
    isLook: {
      type: Boolean,
      default: false
    },
    current: {
      type: Object,
      default: null
    },
    operateFlag: {
      type: Boolean,
      default: false
    }
  },
  provide () {
    return {
      current: this.current,
      isLook: this.isLook
    }
  },
  data () {
    return {
      activeName: 'one'
    }
  },
  methods: {
    handleClick (tab, event) {
      // console.log(tab, event)
    }
  }
}
</script>

<style lang="scss">
.contract_managee_tab {
  width: 100%;
  height: 100%;
  padding: 20px;
  box-sizing: border-box;
  padding-top: 0;

  .el-tabs {
    height: 100%;

    .el-tabs__content {
      height: calc(100% - 54px);

      .el-tab-pane {
        height: 100%;

        .tab_five {
          height: 100%;

          .shigongduiitem {
            padding: 0 2px 20px;
            box-sizing: border-box;
            height: calc(100% - 30px);
            overflow: auto;
          }
        }
      }
    }
  }
}
</style>
