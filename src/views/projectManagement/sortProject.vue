<template>
  <div class="sort" v-loading="loading">
    <el-button  @click="sure" style="width:100%" type="primary">确定</el-button>
    <draggable   v-model="projects" @update="datadragEnd" v-bind= "{animation:500}" ghostClass="ghost">
      <transition-group class="isdrag">
        <div class="item" v-for="project in projects" :key="project.id" :id="project.id">{{project.project_name}}</div>
      </transition-group>
    </draggable>
  </div>
</template>

<script>
import draggable from 'vuedraggable'
export default {
  name: 'sortProject',
  props: {
    sortFlag: {
      type: Boolean,
      default: false
    }
  },
  data () {
    return {
      projects: [],
      loading: false
    }
  },
  components: { draggable },
  mounted() {
    this.getProjectList()
  },
  methods: {
    async getProjectList() {
      try {
        const url = '/project/list-slt'
        const params = { content: '' }
        const result = await this.$pub.post(url, params)
        if (result.code === 200) {
          this.projects = result.data || []
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
    async datadragEnd (evt) {
      if (evt.clone) {
        evt.preventDefault()
      }
    },
    async sure() {
      try {
        this.loading = true
        const url = '/project/sort'
        const params = {
          project_codes: this.projects.map(m => m.project_code)
        }
        const result = await this.$pub.post(url, params)
        if (result.code === 200) {
          this.$notify.success({
            title: '排序成功',
            message: result.message
          })
          this.$emit('update:sortFlag', false)
        } else {
          this.$notify.error({
            title: '排序失败',
            message: result.message
          })
        }
        this.loading = false
      } catch (e) {
        this.loading = false
        this.$notify.error({
          title: '服务器请求失败',
          message: e.message
        })
      }
    }
  }
}
</script>

<style lang='scss'>
.sort_wrap{
  .el-drawer__header{
    display:none;
  }
  .el-drawer__body{
    height:100%;
    .sort{
      height:100%;
      width:100%;
      padding:20px 30px;
      box-sizing: border-box;
      position: relative;
      &>div{
        width:100%;
        height:calc(100% - 40px);
      }
      .isdrag{
        display:block;
        height:100%;
        overflow: auto;
        .item{
          font-size:14px;
          display: block;
          height:40px;
          width:100%;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          border:1px solid rgb(190, 243, 241);
          margin-bottom:10px;
          padding:10px;
          box-sizing: border-box;
          cursor:pointer;
          color:#000;
          &:hover{
            background:rgb(190, 243, 241);
          }
        }
        .ghost {
          background-color: rgb(5, 230, 218) !important;
        }
      }
    }
  }
}
</style>
