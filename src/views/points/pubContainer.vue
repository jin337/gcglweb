<!--
 * @Descripttion: your project
 * @version: 1.0
 * @Author: Clover_yuan
 * @Date: 2024-02-26 11:30:39
 * @LastEditors: Clover_yuan
 * @LastEditTime: 2024-03-04 10:11:06
-->
<!--
 * @Descripttion: your project
 * @version: 1.0
 * @Author: Clover_yuan
 * @Date: 2024-02-26 11:30:39
 * @LastEditors: Clover_yuan
 * @LastEditTime: 2024-03-04 10:07:50
-->

<template>
  <div class="pub_contain">
    <div class="_top">
      <el-radio-group v-model="defaultVal" :disabled="is_lock">
        <el-radio style="margin-bottom:10px;" :label="item[value]" v-for="item in list" :key="item[value]">{{
        item[label] }}</el-radio>
      </el-radio-group>
    </div>
    <div style="text-align:center;">
      <el-button type="primary" style="width:100%" @click="sure" v-if="checkPermission(permission) && !is_lock"
        v-loading="sureLoading">确认</el-button>
    </div>
  </div>
</template>

<script>
import { checkPermission } from '@/utils/tool'
export default {
  name: 'pub_container',
  props: {
    pointInfo: {
      required: true
    },
    list: {
      default: []
    },
    project_code: {
      required: true
    },
    label: {
      required: true
    },
    value: {
      required: true
    },
    type: { // 回填的字段
      required: true
    },
    permission: {
      required: true,
      default: []
    },
    is_lock: { // 是否被锁定
      default: false
    }
  },
  data () {
    return {
      sureLoading: false,
      defaultVal: this.pointInfo[this.type]
    }
  },
  methods: {
    checkPermission,
    async sure () {
      this.sureLoading = true
      this.$emit('sureChange', this.defaultVal)
    }
  }
}
</script>

<style scoped lang="scss">
.pub_contain {
  margin-top: -20px;

  ._top {
    display: flex;
    justify-content: flex-start;
    align-items: center;
    margin: 20px 0;
  }
}
</style>
