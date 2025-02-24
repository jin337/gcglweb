<template>
  <div class="base-style">
  <div v-if="hang_info.length>0">
    <el-descriptions :column="1" size="mini" border v-for="item in hang_info" :key="item.id" class="item">
      <el-descriptions-item label="类型">{{item.type_name}}</el-descriptions-item>
      <el-descriptions-item label="操作人">{{item.create_user_name}}</el-descriptions-item><br>
      <el-descriptions-item label="操作时间">{{item.create_time}}</el-descriptions-item><br>
      <el-descriptions-item label="备注" :span="2">{{item.remark?item.remark:'/'}}</el-descriptions-item>
      <br/>
    </el-descriptions>
  </div>
  <el-empty :image-size="200" v-else ></el-empty>
  </div>
</template>

<script>
export default {
  name: 'hang_info',
  props: {
    allInfo: {
      type: Object,
      require: true
    }
  },
  data () {
    return {
      hang_info: []
    }
  },
  mounted() {
    this.hang_info = this.allInfo.hang_info
  },
  methods: {

  }
}
</script>

<style lang='scss'>
.base-style{
  .el-descriptions-row .el-descriptions-item__label{
    width:110px;
  }
  .nums{
    font-size: 16px;
  }
  .errordevice {
    color:#f56c6c;
    margin-right:6px;
    cursor: pointer;
  }
  .item{
    margin-bottom:10px;
  }
}

</style>
